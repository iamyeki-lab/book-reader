import { redirect } from 'next/navigation';
import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';
import { getFeedbackMessagesAction } from '@/app/admin/actions';
import { FeedbackList } from './FeedbackList';

export const dynamic = 'force-dynamic';

export default async function AdminFeedbackPage() {
  const email = await getCurrentAdminEmail();
  if (!email) redirect('/admin/login');

  const messages = await getFeedbackMessagesAction();
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">留言管理</h1>
      <FeedbackList messages={messages} />
    </div>
  );
}
