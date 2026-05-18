'use server';

import Book from '@/database/models/book.model';
import BookSegment from '@/database/models/book-segment.model';
import { connectToDatabase } from '@/database/mongoose';
import { escapeRegex, generateSlug, serializeData } from '@/lib/utils';

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

    const formattedDbBooks = dbBooks.map((b: any) => ({
        _id: b._id.toString(),
        title: b.title,
        author: b.author,
        slug: b.slug,
        coverURL: b.coverURL,
        coverColor: '#f8f4e9'
    }));

    return { success: true, data: formattedDbBooks };
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

export const createBook = async (data: any) => {
    await connectToDatabase();

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