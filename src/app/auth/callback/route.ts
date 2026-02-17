import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const locale = searchParams.get('locale') ?? 'en';
      return NextResponse.redirect(`${origin}/${locale}${next.startsWith('/') ? next : '/' + next}`);
    }
  }

  return NextResponse.redirect(`${origin}/en/auth?error=auth`);
}
