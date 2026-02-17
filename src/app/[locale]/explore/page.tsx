'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useBooks } from '@/hooks/useRemoteBooks';
import { CoverImage } from '@/components/CoverImage';
import { SimpleNav } from '@/components/SimpleNav';
import type { Locale } from '@/lib/supabase/types';

export default function ExplorePage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';
  const t = useTranslations('explore');
  const [searchInput, setSearchInput] = useState('');
  const searchQuery = useMemo(() => searchInput.trim() || undefined, [searchInput]);
  const { books, loading, error } = useBooks(locale, searchQuery);

  return (
    <div className="min-h-screen bg-background">
      <SimpleNav locale={locale} />
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
          {t('title')}
        </h1>
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder={t('searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        {loading && <p className="text-muted-foreground">Loading...</p>}
        {error && <p className="text-destructive">Error: {error.message}</p>}
        {!loading && !error && books.length === 0 && (
          <p className="text-muted-foreground">{searchQuery ? t('noResults') : t('noBooks')}</p>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
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
                  <span className="text-sm text-primary mt-2">{t('startReading')} →</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
