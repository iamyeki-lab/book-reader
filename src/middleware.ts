import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { routing } from '../routing';

// 系统语言检测：西文/阿文用对应语言，否则用英文
function getLocaleFromAcceptLanguage(header: string | null): string {
  if (!header) return 'en';
  const accepted = header.toLowerCase().split(',').map((s) => s.split(';')[0].trim().slice(0, 2));
  if (accepted.some((l) => l === 'ar')) return 'ar';
  if (accepted.some((l) => l === 'es')) return 'es';
  return 'en';
}

const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: true,
});

export async function middleware(request: NextRequest) {
  // Admin routes (except login): check auth
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    const res = NextResponse.next();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options)
            );
          },
        },
      }
    );
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return res;
  }

  // Admin login: skip intl
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  // 根路径 / 时按系统语言重定向（非西文/阿文则英文）
  if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '') {
    const locale = getLocaleFromAcceptLanguage(request.headers.get('accept-language'));
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
