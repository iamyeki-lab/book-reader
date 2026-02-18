import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';
import { AdminSidebar } from '@/components/AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let email: string | null = null;
  try {
    email = await getCurrentAdminEmail();
  } catch (e) {
    console.error('Admin layout getCurrentAdminEmail:', e);
  }

  return (
    <div className="flex min-h-screen bg-background" lang="zh-CN">
      {email && <AdminSidebar email={email} />}
      <main className="flex-1 overflow-auto px-4 py-6 pt-20 sm:px-6 sm:py-8 sm:pt-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
