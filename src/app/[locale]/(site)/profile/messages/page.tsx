import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FeedbackMessagesList } from './FeedbackMessagesList';

export default async function ProfileMessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('profile.messages');
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();

  if (!user) {
    redirect(`/${locale}`);
  }

  const { data: messages } = await client
    .from('feedback_messages')
    .select('id, content, admin_reply, replied_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold text-amber-500 md:text-2xl">
        {t('title', { defaultValue: '消息' })}
      </h2>
      <FeedbackMessagesList
        messages={messages ?? []}
        t={{
          empty: t('empty', { defaultValue: '暂无消息' }),
          yourMessage: t('yourMessage', { defaultValue: '您的留言' }),
          adminReply: t('adminReply', { defaultValue: '管理员回复' }),
        }}
      />
    </div>
  );
}
