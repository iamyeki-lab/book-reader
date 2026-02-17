'use client';

import { useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 100 * 1024; // 100KB

async function resizeAndCompress(file: File, maxBytes: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }
    img.onload = () => {
      const maxDim = 256;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      let quality = 0.85;
      const tryExport = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress'));
              return;
            }
            if (blob.size <= maxBytes || quality <= 0.2) {
              resolve(blob);
            } else {
              quality -= 0.1;
              tryExport();
            }
          },
          'image/jpeg',
          quality
        );
      };
      tryExport();
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export interface AvatarUploadProps {
  userId: string;
  currentUrl?: string | null;
  onUploadComplete: (publicUrl: string) => void;
  t: { upload: string; uploading: string; change: string; formats: string };
  className?: string;
}

export function AvatarUpload({
  userId,
  currentUrl,
  onUploadComplete,
  t,
  className,
}: AvatarUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(t.formats);
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        const blob = await resizeAndCompress(file, MAX_SIZE_BYTES);
        const supabase = createClient();
        const ext = 'jpg';
        const path = `${userId}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });

        if (uploadError) {
          setError(uploadError.message);
          return;
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(path);
        onUploadComplete(data.publicUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setIsLoading(false);
      }
    },
    [userId, onUploadComplete, t.formats]
  );

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
      <div className="flex flex-col items-start gap-3">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-slate-700 bg-slate-800 ring-2 ring-amber-500/30">
          {currentUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={currentUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-amber-500">
              ?
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            onChange={handleFileInput}
            disabled={isLoading}
            className="hidden"
            id="avatar-upload"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => document.getElementById('avatar-upload')?.click()}
            className="border-slate-700 text-slate-200 hover:bg-slate-800"
          >
            {isLoading ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                {t.uploading}
              </>
            ) : (
              <>
                <ImageIcon className="me-2 h-4 w-4" />
                {currentUrl ? t.change : t.upload}
              </>
            )}
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
