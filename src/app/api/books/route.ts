import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import {
  getBooks,
  getBooksUpdatedSince,
  getBookTitleForLang,
  getBookCoverForLang,
} from '@/lib/supabase/queries';
import type { Locale } from '@/lib/supabase/types';
import { apiError, logApiError } from '@/lib/api-error';

export async function GET(request: NextRequest) {
  try {
    const client = await createClient();
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') || 'en') as Locale;
    const since = searchParams.get('since') || undefined;
    const q = searchParams.get('q')?.trim();

    const rows = since
      ? await getBooksUpdatedSince(client, since, lang, { publishedOnly: true })
      : await getBooks(client, lang, { publishedOnly: true });

    let filtered = rows;
    if (q && q.length > 0) {
      const lower = q.toLowerCase();
      filtered = rows.filter((b) => {
        const title = getBookTitleForLang(b, lang).toLowerCase();
        const author = (b.author ?? '').toLowerCase();
        return title.includes(lower) || author.includes(lower);
      });
    }

    const books = filtered.map((b) => ({
      id: b.id,
      title: getBookTitleForLang(b, lang),
      author: b.author,
      cover_url: getBookCoverForLang(b, lang),
      lang: b.lang,
      ...(b.updated_at && { updated_at: b.updated_at }),
    }));

    const res = NextResponse.json(books);
    if (since) res.headers.set('X-Incremental', 'true');
    return res;
  } catch (e) {
    logApiError('GET /api/books', e, 'INTERNAL_ERROR');
    return apiError('INTERNAL_ERROR', 'Failed to fetch books', 500);
  }
}
