'use client';

import { useState, useCallback } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ShareButtonProps {
  /** Title for Web Share API and aria */
  title: string;
  /** Optional description/summary (e.g. first 160 chars of synopsis) */
  text?: string;
  /** URL to share or copy. Defaults to current window location when not provided. */
  url?: string;
  /** Button label (visible text) */
  label?: string;
  /** "Link Copied!" toast label for fallback */
  copiedLabel?: string;
  /** Optional className for the wrapper (e.g. for positioning toast) */
  className?: string;
  /** Button variant/size from shadcn */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ShareButton({
  title,
  text,
  url: urlProp,
  label = 'Share',
  copiedLabel = 'Link Copied!',
  className,
  variant = 'outline',
  size = 'sm',
}: ShareButtonProps) {
  const [toast, setToast] = useState(false);

  const handleClick = useCallback(async () => {
    let url: string;
    if (typeof window !== 'undefined') {
      url = urlProp ?? window.location.href;
      if (urlProp?.startsWith('/')) url = window.location.origin + urlProp;
    } else {
      url = urlProp ?? '';
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, text: text ?? title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setToast(true);
        const t = setTimeout(() => setToast(false), 2000);
        return () => clearTimeout(t);
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(url).catch(() => {});
        setToast(true);
        const t = setTimeout(() => setToast(false), 2000);
        return () => clearTimeout(t);
      }
    }
  }, [title, text, urlProp]);

  return (
    <div className={`relative inline-flex items-center gap-2 ${className ?? ''}`}>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleClick}
        className="gap-1.5"
        aria-label={label}
      >
        <Share2 className="h-4 w-4 rtl:ml-1.5 rtl:mr-0" aria-hidden />
        <span>{label}</span>
      </Button>
      {toast && (
        <span
          role="status"
          aria-live="polite"
          className="absolute start-full ms-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-primary px-2.5 py-1 text-xs text-primary-foreground shadow rtl:start-auto rtl:end-full rtl:ms-0 rtl:me-2"
        >
          {copiedLabel}
        </span>
      )}
    </div>
  );
}
