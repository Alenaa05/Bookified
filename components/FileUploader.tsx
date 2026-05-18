'use client';

import React, { useRef, useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { X } from 'lucide-react';
import { FileUploadFieldProps } from '@/types';
import { FieldValues, useWatch } from 'react-hook-form';

export default function FileUploader<T extends FieldValues>({
    control,
    name,
    label,
    acceptTypes,
    disabled,
    icon: Icon,
    placeholder,
    hint
}: FileUploadFieldProps<T>) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const watchedValue = useWatch({ control, name });

    useEffect(() => {
        if (!watchedValue && fileName) {
            setFileName(null);
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        }
    }, [watchedValue, fileName]);

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        onChange: (...event: any[]) => void
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            onChange(file);
        }
    };

    const handleRemove = (
        e: React.MouseEvent,
        onChange: (...event: any[]) => void
    ) => {
        e.stopPropagation();
        setFileName(null);
        onChange(undefined);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <FormField
            control={control}
            name={name}
            render={({ field: { onChange, ref: fieldRef } }) => (
                <FormItem>
                    <FormLabel className="form-label">{label}</FormLabel>
                    <FormControl>
                        <div
                            className={`upload-dropzone ${fileName ? 'upload-dropzone-uploaded' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => !disabled && inputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={(e) => {
                                    fieldRef(e);
                                    (inputRef as any).current = e;
                                }}
                                className="hidden"
                                accept={acceptTypes.join(',')}
                                onChange={(e) => handleFileChange(e, onChange)}
                                disabled={disabled}
                            />
                            {fileName ? (
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-md shadow-sm">
                                        <span className="text-[#663820] font-medium truncate max-w-[200px]">
                                            {fileName}
                                        </span>
                                        {!disabled && (
                                            <button
                                                type="button"
                                                onClick={(e) => handleRemove(e, onChange)}
                                                className="upload-dropzone-remove"
                                                aria-label="Remove file"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center">
                                    <Icon className="upload-dropzone-icon" />
                                    <p className="upload-dropzone-text">{placeholder}</p>
                                    <p className="upload-dropzone-hint">{hint}</p>
                                </div>
                            )}
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}