'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateUserProfile(
  locale: string,
  formData: FormData
): Promise<{ error?: string }> {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const nickname = (formData.get('nickname') as string)?.trim() ?? '';
  const bio = (formData.get('bio') as string)?.trim() ?? null;
  const avatarUrl = (formData.get('avatar_url') as string)?.trim() || null;

  try {
    const { error } = await client
      .from('user_profiles')
      .upsert(
        {
          id: user.id,
          nickname: nickname || null,
          bio: bio || null,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) return { error: error.message };

    revalidatePath(`/${locale}/profile`);
    revalidatePath(`/${locale}/profile/settings`);
    return {};
  } catch (e) {
    console.error(e);
    return { error: 'Failed to update profile' };
  }
}

export async function dailyMeditationAction(
  locale: string
): Promise<{ success: boolean; error?: string; alreadyDone?: boolean }> {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const { data: profile } = await client
      .from('user_profiles')
      .select('last_meditation_at, experience_points')
      .eq('id', user.id)
      .maybeSingle();

    const lastDate = profile?.last_meditation_at
      ? new Date(profile.last_meditation_at).toISOString().slice(0, 10)
      : null;

    if (lastDate === today) {
      return { success: false, alreadyDone: true };
    }

    const newXp = (profile?.experience_points ?? 0) + 10;

    const { error } = await client
      .from('user_profiles')
      .upsert(
        {
          id: user.id,
          experience_points: newXp,
          last_meditation_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) return { success: false, error: error.message };

    revalidatePath(`/${locale}/profile`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Failed to meditate' };
  }
}
