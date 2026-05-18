import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getBookBySlug } from '@/lib/actions/book.actions';
import Link from 'next/link';
import VapiControls from '@/components/VapiControls';

interface BookPageProps {
    params: Promise<{ slug: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
    const { slug } = await params;
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const result = await getBookBySlug(slug);

    if (!result.success || !result.data) {
        redirect('/');
    }

    const book = result.data;

    return (
        <main className="book-page-container">
            {/* Floating Back Button */}
            <Link href="/" className="back-btn-floating">
                <ArrowLeft className="size-6 text-[#212a3b]" />
            </Link>

            {/* Stacked sections via VapiControls, centered with max-w-4xl */}
            <div className="vapi-main-container w-full gap-6">
                <VapiControls book={book} />
            </div>
        </main>
    );
}