'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CoverImage } from '@/components/CoverImage';
import { SimpleNav } from '@/components/SimpleNav';
import type { Locale } from '@/lib/supabase/types';

interface BookshelfBook {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
}

export default function BookshelfPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';
  const t = useTranslations('bookshelf');
  const tExplore = useTranslations('explore');
  const [books, setBooks] = useState<BookshelfBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reader/bookshelf?lang=${locale}`)
      .then((r) => r.json())
      .then((d) => setBooks(d.books || []))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [locale]);

  return (
    <div className="min-h-screen bg-background">
      <SimpleNav locale={locale} />
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
          {t('title', { defaultValue: 'My Bookshelf' })}
        </h1>
        {loading && <p className="text-muted-foreground">{t('loading', { defaultValue: 'Loading…' })}</p>}
        {!loading && books.length === 0 && (
          <p className="text-muted-foreground">
            {t('empty', { defaultValue: 'No books in your bookshelf yet' })}
          </p>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/${locale}/story/${book.id}`}
              className="flex gap-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all p-3 hover:scale-[1.02]"
            >
              <CoverImage
                src={book.cover_url}
                placeholderText={book.title.slice(0, 2)}
                className="w-24 shrink-0"
                aspectRatio="2/3"
              />
              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div>
                  <h2 className="font-semibold line-clamp-2">{book.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
                </div>
                <span className="text-sm text-primary mt-2">{tExplore('startReading')} →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
