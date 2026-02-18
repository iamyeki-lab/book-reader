'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useBookDetail } from '@/hooks/useRemoteBooks';
import { CoverImage } from '@/components/CoverImage';
import { Button } from '@/components/ui/button';
import { SimpleNav } from '@/components/SimpleNav';
import { BookshelfButton } from '@/components/BookshelfButton';
import { ShareButton } from '@/components/ShareButton';
import type { Locale } from '@/lib/supabase/types';

export function StoryDetailClient() {
  const params = useParams();
  const id = params?.id as string;
  const locale = (params?.locale as Locale) || 'en';
  const t = useTranslations('story');
  const { detail, loading, error } = useBookDetail(id, locale);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
          {t('loading', { defaultValue: 'Loading…' })}
        </div>
      </div>
    );
  }
  if (error || !detail) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center text-destructive">
          {t('errorLoadingBook', { defaultValue: 'Error loading book' })}
        </div>
      </div>
    );
  }

  const { book, chapters } = detail;
  const hasTranslation = detail.translations.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <SimpleNav locale={locale} />
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 flex justify-center">
          <CoverImage
            src={book.cover_url}
            placeholderText={book.title.slice(0, 2)}
            className="h-48 w-32 sm:h-64 sm:w-40 shrink-0"
            aspectRatio="2/3"
          />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{book.title}</h1>
        <p className="text-muted-foreground mb-6">{t('by')} {book.author}</p>
        {book.description && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">{t('description')}</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{book.description}</p>
          </section>
        )}
        {!hasTranslation && (
          <p className="mb-6 text-muted-foreground">{t('noTranslation')}</p>
        )}
        <div className="flex flex-wrap gap-2 items-center">
          {hasTranslation && (
            <Button asChild>
              <Link href={`/${locale}/story/${id}/read`} prefetch={true}>
                {t('chapters')} ({chapters.length})
              </Link>
            </Button>
          )}
          <ShareButton
            title={`${book.title} - ${t('readOn', { defaultValue: 'Read on StoryRealm' })}`}
            text={book.description ? book.description.slice(0, 160) : undefined}
            label={t('share', { defaultValue: 'Share' })}
            copiedLabel={t('linkCopied', { defaultValue: 'Link Copied!' })}
            variant="outline"
            size="sm"
          />
          <BookshelfButton
            bookId={id}
            addLabel={t('addToBookshelf', { defaultValue: 'Add to Bookshelf' })}
            removeLabel={t('removeFromBookshelf', { defaultValue: 'Remove from Bookshelf' })}
          />
        </div>
      </div>
    </div>
  );
}
