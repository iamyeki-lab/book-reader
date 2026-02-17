'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CoverImage } from '@/components/CoverImage';
import type { Locale } from '@/lib/supabase/types';

interface HistoryItem {
  bookId: string;
  chapterId: string | null;
  chapterNumber: number;
  title: string;
  cover_url: string | null;
  lastReadAt: string;
}

interface ReadingHistoryListProps {
  locale: Locale;
  t: { lastRead: string; continue: string; empty: string };
}

export function ReadingHistoryList({ locale, t }: ReadingHistoryListProps) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reader/history?lang=${locale}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [locale]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg border border-slate-800 bg-slate-900/30" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-slate-800 bg-slate-900/30 py-12">
        <Clock className="h-12 w-12 text-slate-500" />
        <p className="text-slate-400">{t.empty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.bookId} className="overflow-hidden border-slate-800 bg-slate-900/50 transition-colors hover:bg-slate-900/70">
          <CardContent className="flex gap-4 p-0">
            <Link href={`/${locale}/story/${item.bookId}/read`} className="flex shrink-0">
              <CoverImage
                src={item.cover_url}
                placeholderText={item.title.slice(0, 2)}
                className="h-20 w-14 rounded-s-lg rounded-e-none"
                aspectRatio="2/3"
              />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col justify-between py-3 pe-4">
              <div>
                <Link href={`/${locale}/story/${item.bookId}`} className="font-medium text-slate-200 line-clamp-1 hover:text-amber-500">
                  {item.title}
                </Link>
                <p className="mt-0.5 text-sm text-slate-400">
                  {t.lastRead} Chapter {item.chapterNumber}
                </p>
              </div>
              <Button asChild size="sm" className="mt-2 w-fit">
                <Link href={`/${locale}/story/${item.bookId}/read`}>
                  <BookOpen className="me-2 h-4 w-4" />
                  {t.continue}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
