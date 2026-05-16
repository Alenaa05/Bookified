import { sampleBooks } from '@/lib/constants';

export async function getAllBooks(query?: string) {
    const filtered = query
        ? sampleBooks.filter(
            (b) =>
                b.title.toLowerCase().includes(query.toLowerCase()) ||
                b.author.toLowerCase().includes(query.toLowerCase())
        )
        : sampleBooks;

    return { success: true, data: filtered };
}

export const checkBookExists = async (title: string) => {
    const book = sampleBooks.find(b => b.title.toLowerCase() === title.toLowerCase());
    return {
        exists: !!book,
        book: book || null
    };
};

export const createBook = async (data: any) => {
    return {
        success: true,
        alreadyExists: false,
        isBillingError: false,
        error: '',
        data: {
            _id: '1',
            slug: 'mock-book'
        }
    };
};

export const saveBookSegments = async (bookId: string, userId: string, content: any[]) => {
    return { success: true };
};