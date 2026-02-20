import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { setPayPalSubscriptionId } from '@/lib/supabase/queries';
import { apiError, logApiError } from '@/lib/api-error';

export async function POST(request: NextRequest) {
  try {
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      return apiError('UNAUTHORIZED', '请先登录', 401);
    }
    const body = await request.json();
    const subscriptionId = typeof body?.subscriptionID === 'string' ? body.subscriptionID : (typeof body?.subscriptionId === 'string' ? body.subscriptionId : null);
    if (!subscriptionId) {
      return apiError('BAD_REQUEST', 'subscriptionID required', 400);
    }
    await setPayPalSubscriptionId(client, user.id, subscriptionId);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    logApiError('POST /api/reader/subscription', e, 'INTERNAL_ERROR');
    return apiError('INTERNAL_ERROR', '保存订阅失败', 500);
  }
}
