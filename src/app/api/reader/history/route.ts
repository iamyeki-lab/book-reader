import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBookTitleForLang, getBookCoverForLang } from '@/lib/supabase/queries';
import { getChaptersByBookId } from '@/lib/supabase/queries';
import type { Locale } from '@/lib/supabase/types';

export async function GET(request: Request) {
  try {
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      return NextResponse.json({ items: [] });
    }

    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') || 'en') as Locale;

    const { data: progressRows } = await client
      .from('user_progress')
      .select('book_id, chapter_index, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!progressRows?.length) {
      return NextResponse.json({ items: [] });
    }

    const items = await Promise.all(
      progressRows.map(async (p) => {
        const { data: book } = await client.from('books').select('*').eq('id', p.book_id).single();
        if (!book) return null;
        const chapters = await getChaptersByBookId(client, p.book_id);
        const sorted = [...chapters].sort((a, b) => a.chapter_number - b.chapter_number);
        const chapter = sorted[p.chapter_index];
        return {
          bookId: p.book_id,
          chapterId: chapter?.id ?? null,
          chapterNumber: chapter?.chapter_number ?? p.chapter_index + 1,
          title: getBookTitleForLang(book, lang),
          cover_url: getBookCoverForLang(book, lang),
          lastReadAt: p.updated_at,
        };
      })
    );

    return NextResponse.json({
      items: items.filter(Boolean),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ items: [] });
  }
}
