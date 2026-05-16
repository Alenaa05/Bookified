'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingOverlay() {
    return (
        <div className="loading-wrapper">
            <div className="loading-shadow-wrapper bg-white shadow-xl">
                <div className="loading-shadow">
                    <Loader2 className="loading-animation w-12 h-12 text-[#663820]" />
                    <h3 className="loading-title">Synthesizing Book...</h3>
                    <div className="loading-progress">
                        <div className="loading-progress-item">
                            <span className="loading-progress-status"></span>
                            <span>Extracting text content from PDF</span>
                        </div>
                        <div className="loading-progress-item">
                            <span className="loading-progress-status"></span>
                            <span>Generating voice persona</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
