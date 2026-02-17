import { redirect } from 'next/navigation';
import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { AddCreditsForm } from './AddCreditsForm';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const email = await getCurrentAdminEmail();
  if (!email) redirect('/admin/login');

  const admin = createAdminClient();
  const [usersRes, profilesRes, adminEmailsRes] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 100 }),
    admin.from('reader_profiles').select('user_id, credits'),
    admin.from('admin_users').select('email'),
  ]);
  const users = usersRes.data?.users ?? [];
  const creditsMap = new Map(
    (profilesRes.data ?? []).map((p: { user_id: string; credits: number }) => [p.user_id, p.credits])
  );
  const adminEmails = new Set((adminEmailsRes.data ?? []).map((a) => (a as { email: string }).email));

  const readerUsers = users.filter((u) => !adminEmails.has(u.email ?? ''));

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">用户管理</h1>
      <p className="mb-6 text-muted-foreground">读者列表（排除管理员），可手动充值书豆</p>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">邮箱</th>
              <th className="px-4 py-3 text-left text-sm font-medium">注册时间</th>
              <th className="px-4 py-3 text-left text-sm font-medium">书豆</th>
              <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {readerUsers.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3">{creditsMap.get(u.id) ?? 0}</td>
                <td className="px-4 py-3">
                  <AddCreditsForm userId={u.id} currentCredits={creditsMap.get(u.id) ?? 0} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {readerUsers.length === 0 && (
        <p className="mt-4 text-muted-foreground">暂无读者用户</p>
      )}
    </div>
  );
}
