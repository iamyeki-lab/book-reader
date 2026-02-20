import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPaymentConfig } from '@/lib/supabase/queries';
import { logApiError } from '@/lib/api-error';

/** 公开接口：返回 PayPal 客户端配置，供阅读页加载订阅按钮。 */
export async function GET() {
  try {
    const client = await createClient();
    const config = await getPaymentConfig(client);
    return NextResponse.json({
      paypalClientId: config.paypal_client_id || '',
      paypalPlanId: config.paypal_plan_id || '',
    });
  } catch (e) {
    logApiError('GET /api/reader/payment-config', e, 'INTERNAL_ERROR');
    return NextResponse.json({ paypalClientId: '', paypalPlanId: '' });
  }
}
