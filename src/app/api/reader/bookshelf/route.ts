import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBookshelfBookIds, addToBookshelf, removeFromBookshelf } from '@/lib/supabase/queries';
import { getBookByIdOrNull, getBookTitleForLang, getBookCoverForLang } from '@/lib/supabase/queries';
import type { Locale } from '@/lib/supabase/types';

export async function GET(request: NextRequest) {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    const checkBookId = request.nextUrl.searchParams.get('bookId');
    if (checkBookId) return NextResponse.json({ inBookshelf: false });
    return NextResponse.json({ bookIds: [], books: [] });
  }
  const { searchParams } = new URL(request.url);
  const checkBookId = searchParams.get('bookId');
  if (checkBookId) {
    const bookIds = await getBookshelfBookIds(client, user.id);
    return NextResponse.json({ inBookshelf: bookIds.has(checkBookId) });
  }
  const lang = (searchParams.get('lang') || 'en') as Locale;
  const bookIds = await getBookshelfBookIds(client, user.id);
  const books = await Promise.all(
    Array.from(bookIds).map(async (id) => {
      const b = await getBookByIdOrNull(client, id);
      if (!b) return null;
      return {
        id: b.id,
        title: getBookTitleForLang(b, lang),
        author: b.author,
        cover_url: getBookCoverForLang(b, lang),
      };
    })
  );
  return NextResponse.json({
    bookIds: Array.from(bookIds),
    books: books.filter(Boolean),
  });
}

export async function POST(request: NextRequest) {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  }
  const { bookId } = await request.json();
  if (!bookId) return NextResponse.json({ error: 'bookId required' }, { status: 400 });
  await addToBookshelf(client, user.id, bookId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get('bookId');
  if (!bookId) return NextResponse.json({ error: 'bookId required' }, { status: 400 });
  await removeFromBookshelf(client, user.id, bookId);
  return NextResponse.json({ ok: true });
}
