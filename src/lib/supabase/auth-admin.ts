// AtoB: Admin auth helper
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function getCurrentAdminEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // read-only in this context
        },
      },
    }
  );
  const { data: { session } } = await supabase.auth.getSession();
  const email = session?.user?.email;
  if (!email) return null;

  const { createClient } = await import('@supabase/supabase-js');
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await adminClient.from('admin_users').select('email').eq('email', email).maybeSingle();
  if (error || !data) return null;
  return email;
}
