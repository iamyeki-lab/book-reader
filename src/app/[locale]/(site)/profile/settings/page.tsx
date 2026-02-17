import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileSettingsForm } from './ProfileSettingsForm';

export default async function ProfileSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('profile.settings');
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth`);
  }

  let profile: { nickname?: string | null; bio?: string | null; avatar_url?: string | null } | null = null;
  try {
    const { data } = await client
      .from('user_profiles')
      .select('nickname, bio, avatar_url')
      .eq('id', user.id)
      .maybeSingle();
    profile = data;
  } catch {
    // user_profiles table may not exist
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold text-amber-500 md:text-2xl">
        {t('title')}
      </h2>
      <ProfileSettingsForm
        locale={locale}
        userId={user.id}
        initialNickname={profile?.nickname}
        initialBio={profile?.bio}
        initialAvatarUrl={profile?.avatar_url}
        t={{
          nickname: t('nickname'),
          bio: t('bio'),
          save: t('save'),
          saving: t('saving'),
          avatar: {
            upload: t('avatar.upload'),
            uploading: t('avatar.uploading'),
            change: t('avatar.change'),
            formats: t('avatar.formats'),
          },
        }}
      />
    </div>
  );
}
