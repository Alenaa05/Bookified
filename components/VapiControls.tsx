'use client';

import { Mic, MicOff } from "lucide-react";
import useVapi from "@/lib/hooks/useVapi";
import { IBook } from "@/types";
import Image from "next/image";
import Transcript from "@/components/Transcript";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { voiceOptions } from "@/lib/constants";

const VapiControls = ({ book }: { book: IBook }) => {
    const {
        status,
        isActive,
        messages,
        currentMessage,
        currentUserMessage,
        duration,
        start,
        stop,
        clearError,
        limitError,
        isBillingError,
        maxDurationSeconds
    } = useVapi(book);
    const router = useRouter();

    useEffect(() => {
        if (limitError) {
            toast.error(limitError);
            if (isBillingError) {
                router.push("/subscriptions");
            } else {
                router.push("/");
            }
            clearError();
        }
    }, [isBillingError, limitError, router, clearError]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusDisplay = () => {
        switch (status) {
            case 'connecting': return { label: 'Connecting...', color: 'vapi-status-dot-connecting' };
            case 'starting': return { label: 'Starting...', color: 'vapi-status-dot-starting' };
            case 'listening': return { label: 'Listening', color: 'vapi-status-dot-listening' };
            case 'thinking': return { label: 'Thinking...', color: 'vapi-status-dot-thinking' };
            case 'speaking': return { label: 'Speaking', color: 'vapi-status-dot-speaking' };
            default: return { label: 'Ready', color: 'vapi-status-dot-ready' };
        }
    };

    const statusDisplay = getStatusDisplay();

    // Helper to resolve the voice ID or voice key to a friendly human-readable name
    const getVoiceName = (personaValue?: string) => {
        if (!personaValue) return 'Daniel';

        // If it's a key like 'rachel' or 'daniel'
        const key = personaValue.toLowerCase() as keyof typeof voiceOptions;
        if (voiceOptions[key]) {
            return voiceOptions[key].name;
        }

        // If it's a raw ElevenLabs ID like '21m00Tcm4TlvDq8ikWAM'
        const foundOption = Object.values(voiceOptions).find(
            (option) => option.id === personaValue
        );
        if (foundOption) {
            return foundOption.name;
        }

        return personaValue;
    };

    const voiceDisplayName = getVoiceName(book.persona);

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-6 w-full animate-in fade-in duration-300">
            {/* Header Card */}
            <div className="vapi-header-card w-full">
                <div className="vapi-cover-wrapper">
                    <Image
                        src={book.coverURL || "/images/book-placeholder.png"}
                        alt={book.title}
                        width={120}
                        height={180}
                        className="vapi-cover-image !w-[120px] !h-auto"
                        priority
                    />
                    <div className="vapi-mic-wrapper relative">
                        {isActive && (status === 'speaking' || status === 'thinking') && (
                            <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-75" />
                        )}
                        <button
                            type="button"
                            onClick={isActive ? stop : start}
                            disabled={status === 'connecting'}
                            className={`vapi-mic-btn shadow-md !w-[60px] !h-[60px] z-10 ${isActive ? 'vapi-mic-btn-active' : 'vapi-mic-btn-inactive'}`}
                        >
                            {isActive ? (
                                <Mic className="size-7 text-[#212a3b]" />
                            ) : (
                                <MicOff className="size-7 text-[#212a3b]" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4 flex-1">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#212a3b] mb-1">
                            {book.title}
                        </h1>
                        <p className="text-[#3d485e] font-medium">by {book.author}</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="vapi-status-indicator">
                            <span className={`vapi-status-dot ${statusDisplay.color}`} />
                            <span className="vapi-status-text">{statusDisplay.label}</span>
                        </div>

                        <div className="vapi-status-indicator">
                            <span className="vapi-status-text">Voice: {voiceDisplayName}</span>
                        </div>

                        <div className="vapi-status-indicator">
                            <span className="vapi-status-text">
                                {formatDuration(duration)}/{formatDuration(maxDurationSeconds)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transcript Area */}
            <div className="transcript-container min-h-[400px]">
                <Transcript
                    messages={messages}
                    currentMessage={currentMessage}
                    currentUserMessage={currentUserMessage}
                />
            </div>
        </div>
    );
};

export default VapiControls;
