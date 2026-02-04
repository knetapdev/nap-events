'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageIcon, X, UploadCloud, Loader2 } from 'lucide-react';
import { Button } from './button';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onChange(base64String);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setIsUploading(false);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    disabled: disabled || isUploading
  });

  return (
    <div className="space-y-4 w-full">
      {value ? (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 group">
          <img
            src={value}
            alt="Upload"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              onClick={onRemove}
              variant="destructive"
              size="icon"
              className="rounded-full h-10 w-10 shadow-lg"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            relative w-full aspect-video rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden
            ${isDragActive
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-white/5'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />

          <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 group-hover:scale-110 transition-transform duration-300">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            ) : (
              <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'}`} />
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {isDragActive ? 'Suelta la imagen aquí' : 'Haz clic o arrastra una imagen'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              PNG, JPG o WEBP (Máx. 5MB)
            </p>
          </div>

          {/* Decorative background glow */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
        </div>
      )}
    </div>
  );
}
