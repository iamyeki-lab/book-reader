'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadBookCoverAction } from '@/app/admin/actions';

export function CoverUploadForm({ bookId, lang, label }: { bookId: string; lang: 'en' | 'es' | 'ar'; label: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleSubmit(e: React.MouseEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setMessage('请选择文件');
      return;
    }
    setMessage(null);
    setLoading(true);
    const formData = new FormData();
    formData.set('cover', file);
    const result = await uploadBookCoverAction(bookId, lang, formData);
    setLoading(false);
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage('上传成功');
      fileRef.current.value = '';
      router.refresh();
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <div className="flex gap-2 items-end">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm text-muted-foreground file:me-2 file:rounded file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:text-primary-foreground file:cursor-pointer"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 shrink-0 disabled:opacity-50"
        >
          {loading ? '上传中…' : '上传'}
        </button>
      </div>
      {message && <p className={`text-sm ${message === '上传成功' ? 'text-green-600' : 'text-destructive'}`}>{message}</p>}
    </div>
  );
}
