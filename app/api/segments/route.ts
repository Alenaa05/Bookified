import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/database/mongoose";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.model";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { bookId, userId: segUserId, content } = await request.json();

        if (!bookId || !content || !Array.isArray(content)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        await connectToDatabase();

        await BookSegment.deleteMany({ bookId });

        const chunkSize = 50;
        for (let i = 0; i < content.length; i += chunkSize) {
            const chunk = content.slice(i, i + chunkSize);
            const segmentDocs = chunk.map((text: string, idx: number) => ({
                clerkId: segUserId,
                bookId,
                content: text,
                segmentIndex: i + idx,
                pageNumber: i + idx + 1,
                wordCount: text.split(/\s+/).filter(Boolean).length,
            }));
            await BookSegment.insertMany(segmentDocs);
        }

        await Book.findByIdAndUpdate(bookId, { totalSegments: content.length });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('Segments error:', e);
        return NextResponse.json({ error: e.message || 'Failed to save segments' }, { status: 500 });
    }
}
