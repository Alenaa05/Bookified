import mongoose from 'mongoose';

const DATABASE_URI = process.env.DATABASE_URI || '';

declare global {
    var mongooseCache: {
        conn: typeof mongoose | null
        promise: Promise<typeof mongoose> | null
    }
}

let cached = global.mongooseCache || (global.mongooseCache = { conn: null, promise: null });

export const connectToDatabase = async () => {
    if (!DATABASE_URI || (!DATABASE_URI.startsWith('mongodb://') && !DATABASE_URI.startsWith('mongodb+srv://'))) {
        throw new Error('Invalid or missing DATABASE_URI in environment variables.');
    }

    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        // For mongodb+srv://, inject db name if missing
        // For direct mongodb://, use as-is (already has /bookified in the URI)
        let uri = DATABASE_URI;

        if (DATABASE_URI.startsWith('mongodb+srv://')) {
            try {
                const url = new URL(DATABASE_URI);
                if (!url.pathname || url.pathname === '/') {
                    url.pathname = '/bookified';
                    uri = url.toString();
                }
            } catch {
                throw new Error('Malformed DATABASE_URI');
            }
        }

        cached.promise = mongoose.connect(uri, { bufferCommands: false });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('❌ MongoDB connection failed:', e);
        throw e;
    }

    console.info('✅ Connected to MongoDB');
    return cached.conn;
};