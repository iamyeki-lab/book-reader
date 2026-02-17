// AtoB: Client-side API fetchers for books
const API_BASE = typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface BookSummary {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  lang: string;
  updated_at?: string;
}

export interface ChapterSummary {
  id: string;
  chapter_number: number;
  title: string;
}

export interface TranslationSummary {
  chapter_id: string;
  target_lang: string;
  translated_title: string;
  translated_content: string;
}

export interface BookDetail {
  book: BookSummary & { description: string | null };
  chapters: ChapterSummary[];
  translations: TranslationSummary[];
}

export async function fetchBooks(lang?: string, since?: string, q?: string): Promise<BookSummary[]> {
  const params = new URLSearchParams();
  if (lang) params.set('lang', lang);
  if (since) params.set('since', since);
  if (q?.trim()) params.set('q', q.trim());
  const res = await fetch(`${API_BASE}/api/books?${params}`);
  if (!res.ok) throw new Error('Failed to fetch books');
  return res.json();
}

export async function fetchBookDetail(bookId: string, lang: string, since?: string): Promise<BookDetail> {
  const params = new URLSearchParams();
  params.set('lang', lang);
  if (since) params.set('since', since);
  const res = await fetch(`${API_BASE}/api/books/${bookId}?${params}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Failed to fetch book (${res.status})`);
  }
  return res.json();
}
