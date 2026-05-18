'use server';

import Book from '@/database/models/book.model';
import BookSegment from '@/database/models/book-segment.model';
import { connectToDatabase } from '@/database/mongoose';
import { escapeRegex, generateSlug, serializeData } from '@/lib/utils';
import mongoose from 'mongoose';
import { getUserPlan } from '@/lib/subscription.server';
import { PLAN_LIMITS } from '@/lib/subscription-constants';

interface BookSegmentLean {
    _id: mongoose.Types.ObjectId;
    bookId: mongoose.Types.ObjectId;
    clerkId: string;
    content: string;
    segmentIndex: number;
    pageNumber?: number;
    wordCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export async function getAllBooks(query?: string) {
    await connectToDatabase();

    let dbQuery = {};
    if (query) {
        const escapedSearch = escapeRegex(query);
        const regex = new RegExp(escapedSearch, 'i');
        dbQuery = {
            $or: [
                { title: { $regex: regex } },
                { author: { $regex: regex } }
            ]
        };
    }

    const dbBooks = await Book.find(dbQuery).sort({ createdAt: -1 }).lean();

    return {
        success: true,
        data: dbBooks.map((b: any) => ({
            _id: b._id.toString(),
            title: b.title,
            author: b.author,
            slug: b.slug,
            coverURL: b.coverURL,
            coverColor: '#f8f4e9'
        }))
    };
}

export const checkBookExists = async (title: string) => {
    await connectToDatabase();
    const slug = generateSlug(title);
    const dbBook = await Book.findOne({ slug }).lean();
    return {
        exists: !!dbBook,
        book: dbBook ? serializeData(dbBook) : null
    };
};

export const getBookBySlug = async (slug: string) => {
    await connectToDatabase();
    const book = await Book.findOne({ slug }).lean();
    if (!book) return { success: false, data: null };
    return { success: true, data: serializeData(book) };
};

export const createBook = async (data: any) => {
    await connectToDatabase();

    // Plan limits check
    const plan = await getUserPlan();
    const limits = PLAN_LIMITS[plan];

    const bookCount = await Book.countDocuments({ clerkId: data.clerkId });
    if (bookCount >= limits.maxBooks) {
        return {
            success: false,
            alreadyExists: false,
            isBillingError: true,
            error: `You have reached your plan limit of ${limits.maxBooks} book${limits.maxBooks > 1 ? 's' : ''}. Upgrade your plan under Subscriptions to upload more books!`
        };
    }

    const slug = generateSlug(data.title);

    const existingBook = await Book.findOne({ slug }).lean();
    if (existingBook) {
        return { success: true, alreadyExists: true, data: serializeData(existingBook) };
    }

    const newBook = await Book.create({
        clerkId: data.clerkId,
        title: data.title,
        slug,
        author: data.author,
        persona: data.persona,
        fileURL: data.fileURL,
        fileBlobKey: data.fileBlobKey,
        coverURL: data.coverURL,
        fileSize: data.fileSize,
        totalSegments: 0,
    });

    return {
        success: true,
        alreadyExists: false,
        isBillingError: false,
        data: serializeData(newBook)
    };
};

export const saveBookSegments = async (
    bookId: string,
    userId: string,
    content: string[]
) => {
    await connectToDatabase();

    await BookSegment.deleteMany({ bookId });

    const chunkSize = 50;
    for (let i = 0; i < content.length; i += chunkSize) {
        const chunk = content.slice(i, i + chunkSize);
        const segmentDocs = chunk.map((text: string, idx: number) => ({
            clerkId: userId,
            bookId,
            content: text,
            segmentIndex: i + idx,
            pageNumber: i + idx + 1,
            wordCount: text.split(/\s+/).filter(Boolean).length,
        }));
        await BookSegment.insertMany(segmentDocs);
    }

    await Book.findByIdAndUpdate(bookId, { totalSegments: content.length });

    return { success: true };
};

// Searches book segments using MongoDB text search with regex fallback
export const searchBookSegments = async (bookId: string, query: string, limit: number = 5) => {
    try {
        await connectToDatabase();

        console.log(`Searching for: "${query}" in book ${bookId}`);

        const bookObjectId = new mongoose.Types.ObjectId(bookId);

        // Try MongoDB text search first (requires text index)
        let segments: BookSegmentLean[] = [];
        try {
            segments = await BookSegment.find({
                bookId: bookObjectId,
                $text: { $search: query },
            })
                .select('_id bookId content segmentIndex pageNumber wordCount')
                .sort({ score: { $meta: 'textScore' } })
                .limit(limit)
                .lean();
        } catch {
            // Text index may not exist — fall through to regex fallback
            segments = [];
        }

        // Fallback: regex search matching ANY keyword
        if (segments.length === 0) {
            const keywords = query.split(/\s+/).filter((k) => k.length > 2);
            const pattern = keywords.map(escapeRegex).join('|');

            segments = await BookSegment.find({
                bookId: bookObjectId,
                content: { $regex: pattern, $options: 'i' },
            })
                .select('_id bookId content segmentIndex pageNumber wordCount')
                .sort({ segmentIndex: 1 })
                .limit(limit)
                .lean();
        }

        console.log(`Search complete. Found ${segments.length} results`);

        return {
            success: true,
            data: serializeData(segments),
        };
    } catch (error) {
        console.error('Error searching segments:', error);
        return {
            success: false,
            error: (error as Error).message,
            data: [],
        };
    }
};