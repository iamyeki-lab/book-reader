import { redirect } from 'next/navigation';
import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';
import { SyncToFrontendButton } from './SyncToFrontendButton';

export default async function AdminDashboardPage() {
  const email = await getCurrentAdminEmail();
  if (!email) redirect('/admin/login');

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">管理后台</h1>
        <SyncToFrontendButton />
      </div>
      <p className="mt-4 text-muted-foreground">管理书籍、章节与站点设置。修改内容后点击「同步到网页端」刷新读者可见内容。</p>
    </div>
  );
}
