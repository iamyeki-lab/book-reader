import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import {
  getBookByIdOrNull,
  getChaptersByBookId,
  getTranslationsByBookIdAndLang,
  getTranslationsByBookIdAndLangUpdatedSince,
  getBookTitleForLang,
  getBookCoverForLang,
  getBookDescriptionForLang,
} from '@/lib/supabase/queries';
import type { Locale } from '@/lib/supabase/types';
import { apiError, logApiError } from '@/lib/api-error';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await createClient();
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') || 'en') as Locale;
    const since = searchParams.get('since') || undefined;

    const book = await getBookByIdOrNull(client, id);
    if (!book) {
      return apiError('NOT_FOUND', 'Book not found', 404);
    }
    const chapters = await getChaptersByBookId(client, id);
    const translations = since
      ? await getTranslationsByBookIdAndLangUpdatedSince(client, id, lang, since)
      : await getTranslationsByBookIdAndLang(client, id, lang);

    const body = {
      book: {
        id: book.id,
        title: getBookTitleForLang(book, lang),
        author: book.author,
        cover_url: getBookCoverForLang(book, lang),
        description: getBookDescriptionForLang(book, lang),
        lang: book.lang,
      },
      chapters: chapters.map((c) => ({
        id: c.id,
        chapter_number: c.chapter_number,
        title: c.title,
      })),
      translations: translations.map((t) => ({
        chapter_id: t.chapter_id,
        target_lang: t.target_lang,
        translated_title: t.translated_title,
        translated_content: t.translated_content,
      })),
    };

    const res = NextResponse.json(body);
    if (since) res.headers.set('X-Incremental', 'true');
    return res;
  } catch (e) {
    logApiError('GET /api/books/[id]', e, 'INTERNAL_ERROR');
    return apiError('INTERNAL_ERROR', 'Failed to fetch book', 500);
  }
}
