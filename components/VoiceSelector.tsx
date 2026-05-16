'use client';

import React from 'react';
import { VoiceSelectorProps } from '@/types';
import { voiceCategories, voiceOptions } from '@/lib/constants';

export default function VoiceSelector({ value, onChange, disabled }: VoiceSelectorProps) {
    const renderVoiceGroup = (title: string, voiceKeys: string[]) => {
        return (
            <div className="mb-4 last:mb-0">
                <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">{title}</h4>
                <div className="voice-selector-options flex-wrap md:flex-nowrap">
                    {voiceKeys.map((key) => {
                        const voice = voiceOptions[key as keyof typeof voiceOptions];
                        if (!voice) return null;
                        
                        const isSelected = value === voice.id;
                        
                        return (
                            <div
                                key={voice.id}
                                className={`voice-selector-option ${isSelected ? 'voice-selector-option-selected' : 'voice-selector-option-default'} ${disabled ? 'voice-selector-option-disabled' : ''}`}
                                onClick={() => !disabled && onChange(voice.id)}
                            >
                                <div className="flex items-start gap-3 w-full">
                                    <input
                                        type="radio"
                                        checked={isSelected}
                                        onChange={() => !disabled && onChange(voice.id)}
                                        className="mt-1 flex-shrink-0 cursor-pointer w-4 h-4 text-[#663820] focus:ring-[#663820]"
                                        disabled={disabled}
                                    />
                                    <div className="flex flex-col text-left">
                                        <span className="font-bold text-[#212a3b]">{voice.name}</span>
                                        <span className="text-xs text-[#3d485e] mt-1">{voice.description}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {renderVoiceGroup('Male Voices', voiceCategories.male)}
            {renderVoiceGroup('Female Voices', voiceCategories.female)}
        </div>
    );
}
