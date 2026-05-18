import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@clerk/nextjs/server";
import { MAX_FILE_SIZE } from "@/lib/constants";
import fs from "fs";
import path from "path";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const filename = formData.get('filename') as string | null;

        if (!file || !filename) {
            return NextResponse.json({ error: 'File and filename are required' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File size exceeds limit' }, { status: 400 });
        }

        if (process.env.BLOB_READ_WRITE_TOKEN) {
            const blob = await put(filename, file, {
                access: 'public',
                token: process.env.BLOB_READ_WRITE_TOKEN,
                addRandomSuffix: true,  // 👈 this was missing
            });
            return NextResponse.json({ url: blob.url, pathname: blob.pathname });
        }

        // Local fallback
        console.info("BLOB_READ_WRITE_TOKEN not found. Saving file locally...");
        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        let ext = ".pdf";
        if (file.type === "image/png") ext = ".png";
        else if (file.type === "image/jpeg" || file.type === "image/jpg") ext = ".jpg";
        else if (file.type === "image/webp") ext = ".webp";
        else if (file.name) ext = path.extname(file.name) || ".pdf";

        const uniqueFilename = `${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}-${Date.now()}${ext}`;
        const filePath = path.join(uploadsDir, uniqueFilename);

        fs.writeFileSync(filePath, buffer);

        return NextResponse.json({ url: `/uploads/${uniqueFilename}`, pathname: uniqueFilename });
    } catch (e: any) {
        console.error('Upload error:', e);
        return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 });
    }
}