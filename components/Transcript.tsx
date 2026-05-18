'use client';

import React, { useEffect, useRef } from 'react';
import { Messages } from '@/types';
import { Mic } from 'lucide-react';

interface TranscriptProps {
    messages: Messages[];
    currentMessage?: string;
    currentUserMessage?: string;
}

export default function Transcript({ messages, currentMessage, currentUserMessage }: TranscriptProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of conversation
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, currentMessage, currentUserMessage]);

    const hasMessages = messages.length > 0 || !!currentMessage || !!currentUserMessage;

    if (!hasMessages) {
        return (
            <div className="transcript-empty">
                <Mic className="size-12 text-[#212a3b] mb-4" />
                <p className="transcript-empty-text">No conversation yet</p>
                <p className="transcript-empty-hint">Click the mic button above to start talking</p>
            </div>
        );
    }

    return (
        <div className="transcript-messages">
            {/* Render completed messages */}
            {messages.map((msg, index) => (
                <div
                    key={index}
                    className={`transcript-message ${
                        msg.role === 'user' ? 'transcript-message-user' : 'transcript-message-assistant'
                    }`}
                >
                    <div
                        className={`transcript-bubble ${
                            msg.role === 'user' ? 'transcript-bubble-user' : 'transcript-bubble-assistant'
                        }`}
                    >
                        {msg.content}
                    </div>
                </div>
            ))}

            {/* Render real-time streaming user message */}
            {currentUserMessage && (
                <div className="transcript-message transcript-message-user">
                    <div className="transcript-bubble transcript-bubble-user">
                        {currentUserMessage}
                        <span className="transcript-cursor bg-white inline-block w-0.5 h-4 ml-1 animate-pulse" />
                    </div>
                </div>
            )}

            {/* Render real-time streaming AI response */}
            {currentMessage && (
                <div className="transcript-message transcript-message-assistant">
                    <div className="transcript-bubble transcript-bubble-assistant">
                        {currentMessage}
                        <span className="transcript-cursor bg-black inline-block w-0.5 h-4 ml-1 animate-pulse" />
                    </div>
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    );
}
