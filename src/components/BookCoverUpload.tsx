'use client';

import { useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export interface BookCoverUploadProps {
  bookId: string;
  currentUrl?: string | null;
  onUploadComplete: (publicUrl: string) => void;
  className?: string;
}

export function BookCoverUpload({
  bookId,
  currentUrl,
  onUploadComplete,
  className,
}: BookCoverUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return '仅支持 JPG、PNG、WEBP 格式';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return '文件大小不能超过 2MB';
    }
    return null;
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        const supabase = createClient();
        const path = `book-covers/${bookId}/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('book-covers')
          .upload(path, file, { upsert: true });

        if (uploadError) {
          setError(uploadError.message);
          return;
        }

        const { data } = supabase.storage.from('book-covers').getPublicUrl(path);
        onUploadComplete(data.publicUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : '上传失败');
      } finally {
        setIsLoading(false);
      }
    },
    [bookId, onUploadComplete, validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      e.target.value = '';
    },
    [uploadFile]
  );

  return (
    <div className={cn('space-y-2', className)}>
      {currentUrl ? (
        <div className="flex flex-col items-start gap-3">
          <div className="relative w-32 h-40 rounded-lg overflow-hidden border bg-muted shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUrl}
              alt="书籍封面"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              onChange={handleFileInput}
              disabled={isLoading}
              className="hidden"
              id={`cover-upload-${bookId}`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => document.getElementById(`cover-upload-${bookId}`)?.click()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  上传中
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  更换图片
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors',
            isDragging && 'border-primary bg-primary/5',
            !isDragging && 'border-muted-foreground/25 hover:border-muted-foreground/50',
            isLoading && 'pointer-events-none opacity-70'
          )}
        >
          <input
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            onChange={handleFileInput}
            disabled={isLoading}
            className="hidden"
            id={`cover-upload-${bookId}`}
          />
          {isLoading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">上传中…</p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                拖拽图片到此处，或
                <label
                  htmlFor={`cover-upload-${bookId}`}
                  className="cursor-pointer font-medium text-primary hover:underline ml-1"
                >
                  选择文件
                </label>
              </p>
              <p className="text-xs text-muted-foreground">
                JPG / PNG / WEBP，最大 2MB
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
