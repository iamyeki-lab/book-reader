'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function submitFeedbackAction(
  locale: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();

  const content = (formData.get('content') as string)?.trim();
  let email: string;

  if (user?.email) {
    email = user.email;
  } else {
    const providedEmail = (formData.get('email') as string)?.trim();
    if (!providedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(providedEmail)) {
      return { error: '请输入有效的邮箱地址' };
    }
    email = providedEmail;
  }

  if (!content || content.length < 5) {
    return { error: '留言内容至少 5 个字符' };
  }

  const { error } = await client.from('feedback_messages').insert({
    user_id: user?.id ?? null,
    email,
    content,
  });

  if (error) {
    console.error(error);
    return { error: '提交失败，请稍后重试' };
  }

  revalidatePath(`/${locale}/feedback`);
  return { success: true };
}
