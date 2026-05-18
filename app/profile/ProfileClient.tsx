'use client';

import { UserProfile, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfileClient() {
    const { isSignedIn, isLoaded } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push("/sign-in");
        }
    }, [isLoaded, isSignedIn, router]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="text-[#212a3b] font-medium font-serif animate-pulse">Loading settings...</div>
            </div>
        );
    }

    if (!isSignedIn) {
        return null;
    }

    return (
        <main className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-16 flex items-center justify-center">
            <div className="w-full max-w-5xl mx-auto px-4 flex justify-center animate-in fade-in duration-300">
                <UserProfile 
                    routing="hash"
                    appearance={{
                        variables: {
                            colorPrimary: "#212a3b",
                            colorText: "#212a3b",
                            borderRadius: "0.75rem",
                            colorBackground: "#ffffff",
                        },
                        elements: {
                            card: "shadow-md border border-[#e5dec9]",
                            navbar: "bg-[#f8f4e9] border-r border-[#e5dec9]",
                            navbarButton: "text-[#212a3b] hover:bg-[#eae3ce]",
                            navbarButtonActive: "bg-[#eae3ce] text-[#212a3b] font-semibold",
                            headerTitle: "font-serif text-2xl text-[#212a3b]",
                            profileSectionTitleText: "font-serif text-lg text-[#212a3b]",
                        }
                    }}
                />
            </div>
        </main>
    );
}
