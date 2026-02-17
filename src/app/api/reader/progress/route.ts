import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      return NextResponse.json({ userId: null, chapterIndex: null, scrollTop: null });
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    if (!bookId) {
      return NextResponse.json({ error: 'bookId required' }, { status: 400 });
    }

    const { data } = await client
      .from('user_progress')
      .select('chapter_index, scroll_top')
      .eq('user_id', user.id)
      .eq('book_id', bookId)
      .single();

    return NextResponse.json({
      userId: user.id,
      chapterIndex: data?.chapter_index ?? null,
      scrollTop: data?.scroll_top ?? null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookId, chapterIndex, scrollTop } = body as { bookId: string; chapterIndex: number; scrollTop: number };
    if (!bookId || typeof chapterIndex !== 'number') {
      return NextResponse.json({ error: 'bookId and chapterIndex required' }, { status: 400 });
    }

    const { error } = await client
      .from('user_progress')
      .upsert(
        {
          user_id: user.id,
          book_id: bookId,
          chapter_index: Math.max(0, chapterIndex),
          scroll_top: typeof scrollTop === 'number' ? scrollTop : 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,book_id' }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
