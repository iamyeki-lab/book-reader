import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPaymentConfig } from '@/lib/supabase/queries';
import { apiError, logApiError } from '@/lib/api-error';

/** 使用 RPC 原子化扣书豆并写入购买记录，避免并发超扣或重复解锁 */
export async function POST(request: NextRequest) {
  try {
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      return apiError('UNAUTHORIZED', '请先登录', 401);
    }

    const body = await request.json();
    const { chapterId, bookId } = body as { chapterId: string; bookId: string };
    if (!chapterId || !bookId) {
      return apiError('BAD_REQUEST', 'chapterId and bookId required', 400);
    }

    const paymentConfig = await getPaymentConfig(client);
    const price = paymentConfig.chapter_price_credits;

    const { data: result, error } = await client.rpc('purchase_chapter', {
      p_user_id: user.id,
      p_chapter_id: chapterId,
      p_book_id: bookId,
      p_credits_price: price,
    });

    if (error) {
      logApiError('POST /api/reader/purchase RPC', error, 'INTERNAL_ERROR');
      return apiError('INTERNAL_ERROR', 'Purchase failed', 500);
    }

    const out = result as { ok: boolean; error?: string; code?: string; need_credits?: number };
    if (!out.ok) {
      if (out.code === 'NOT_FOUND') return apiError('NOT_FOUND', out.error ?? '章节不存在', 404);
      if (out.code === 'INSUFFICIENT_CREDITS') {
        return apiError('INSUFFICIENT_CREDITS', '书豆不足，请先充值', 400, { needCredits: out.need_credits });
      }
      return apiError('BAD_REQUEST', out.error ?? 'Invalid request', 400);
    }

    return NextResponse.json({ ok: true, message: (result as { message?: string }).message });
  } catch (e) {
    logApiError('POST /api/reader/purchase', e, 'INTERNAL_ERROR');
    return apiError('INTERNAL_ERROR', 'Internal error', 500);
  }
}
