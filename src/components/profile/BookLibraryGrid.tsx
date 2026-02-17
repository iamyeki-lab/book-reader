'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Heart, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CoverImage } from '@/components/CoverImage';
import type { Locale } from '@/lib/supabase/types';

interface LibraryBook {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
}

interface BookLibraryGridProps {
  locale: Locale;
  t: { empty: string; goExplore: string };
}

export function BookLibraryGrid({ locale, t }: BookLibraryGridProps) {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reader/bookshelf?lang=${locale}`)
      .then((r) => r.json())
      .then((d) => setBooks(d.books || []))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [locale]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="aspect-[2/3] animate-pulse rounded-lg border border-slate-800 bg-slate-900/30"
          />
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-slate-800 bg-slate-900/30 py-16">
        <Heart className="h-14 w-14 text-slate-500" />
        <p className="text-center text-slate-400">{t.empty}</p>
        <Button asChild variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800">
          <Link href={`/${locale}/explore`}>
            <Compass className="me-2 h-4 w-4" />
            {t.goExplore}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {books.map((book) => (
        <Link key={book.id} href={`/${locale}/story/${book.id}`}>
          <Card className="overflow-hidden border-slate-800 bg-slate-900/50 transition-all hover:border-slate-700 hover:bg-slate-900/70 hover:shadow-lg">
            <CoverImage
              src={book.cover_url}
              placeholderText={book.title.slice(0, 2)}
              className="aspect-[2/3] w-full"
              aspectRatio="2/3"
            />
            <CardContent className="p-3">
              <h3 className="line-clamp-2 font-medium text-slate-200">{book.title}</h3>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
