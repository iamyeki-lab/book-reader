'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Locale } from '@/lib/supabase/types';
import {
  fetchBooks,
  fetchBookDetail,
  type BookSummary,
  type BookDetail,
} from '@/lib/remote-books';

const POLL_INTERVAL_MS = 60000;

export function useBooks(locale: Locale, searchQuery?: string) {
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async (since?: string) => {
    try {
      const data = await fetchBooks(locale, since, searchQuery);
      setBooks((prev) => {
        if (since && prev.length > 0 && !searchQuery) {
          const byId = new Map(prev.map((b) => [b.id, { ...b }]));
          data.forEach((b) => byId.set(b.id, b));
          return Array.from(byId.values());
        }
        return data;
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [locale, searchQuery]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    if (typeof document === 'undefined' || searchQuery) return;
    const interval = setInterval(() => load(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load, searchQuery]);

  return { books, loading, error, refresh: () => load() };
}

export function useBookDetail(bookId: string | null, locale: Locale) {
  const [detail, setDetail] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!bookId || typeof bookId !== 'string' || bookId.trim().length < 10) {
      setDetail(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchBookDetail(bookId, locale)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e : new Error('Unknown error'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookId, locale]);

  return { detail, loading, error };
}
