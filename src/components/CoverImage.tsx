'use client';

import { cn } from '@/lib/utils';

interface CoverImageProps {
  src: string | null;
  alt?: string;
  className?: string;
  placeholderText?: string;
  aspectRatio?: '2/3';
}

export function CoverImage({
  src,
  alt = '',
  className,
  placeholderText,
  aspectRatio = '2/3',
}: CoverImageProps) {
  const aspectClass = aspectRatio === '2/3' ? 'aspect-[2/3]' : '';

  if (!src) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground',
          aspectClass,
          className
        )}
      >
        {placeholderText ? (
          <span className="text-center text-sm font-medium line-clamp-2 px-2">
            {placeholderText}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn(
        'shrink-0 rounded-lg object-cover transition hover:brightness-110',
        aspectClass,
        className
      )}
    />
  );
}
