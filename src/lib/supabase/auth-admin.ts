// AtoB: Admin auth helper
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function getCurrentAdminEmail(): Promise<string | null> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !anonKey || !serviceKey) return null;

    const cookieStore = await cookies();
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // read-only in this context
        },
      },
    });
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email;
    if (!email) return null;

    const { createClient } = await import('@supabase/supabase-js');
    const adminClient = createClient(url, serviceKey);
    const { data, error } = await adminClient.from('admin_users').select('email').eq('email', email).maybeSingle();
    if (error || !data) return null;
    return email;
  } catch {
    return null;
  }
}
