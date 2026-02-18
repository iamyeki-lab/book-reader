import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const redirectTo = request.nextUrl.searchParams.get('redirect');
  const base = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const fallback = new URL('/admin/login', base);
  const url = redirectTo ? new URL(redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`, base) : fallback;
  return NextResponse.redirect(url);
}
