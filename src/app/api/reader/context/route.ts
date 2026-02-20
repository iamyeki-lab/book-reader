import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getFreeChaptersCount, getChapterPurchasesByUserAndBook, getHasActiveSubscription } from '@/lib/supabase/queries';
import { apiError, logApiError } from '@/lib/api-error';

export async function GET(request: NextRequest) {
  try {
    const client = await createClient();
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    if (!bookId) {
      return apiError('BAD_REQUEST', 'bookId required', 400);
    }

    const freeChapters = await getFreeChaptersCount(client, bookId);

    const { data: { user } } = await client.auth.getUser();
    let purchasedChapterIds: string[] = [];
    let hasActiveSubscription = false;
    if (user) {
      const [purchased, sub] = await Promise.all([
        getChapterPurchasesByUserAndBook(client, user.id, bookId),
        getHasActiveSubscription(client, user.id),
      ]);
      purchasedChapterIds = Array.from(purchased);
      hasActiveSubscription = sub;
    }

    return NextResponse.json({
      freeChapters,
      purchasedChapterIds,
      hasActiveSubscription,
      userId: user?.id ?? null,
    });
  } catch (e) {
    logApiError('GET /api/reader/context', e, 'INTERNAL_ERROR');
    return apiError('INTERNAL_ERROR', 'Internal error', 500);
  }
}
