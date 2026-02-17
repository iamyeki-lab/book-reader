import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { ProfileLayoutClient } from './ProfileLayoutClient';

const NAV_KEYS = ['overview', 'library', 'history', 'messages', 'settings'] as const;

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('profile');
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();

  let profile: { nickname?: string | null; avatarUrl?: string | null; cultivationRank?: string } | null = null;
  if (user) {
    try {
      const { data } = await client
        .from('user_profiles')
        .select('nickname, avatar_url, cultivation_rank')
        .eq('id', user.id)
        .maybeSingle();
      if (data) {
        profile = {
          nickname: data.nickname,
          avatarUrl: data.avatar_url,
          cultivationRank: data.cultivation_rank ?? 'Mortal',
        };
      }
    } catch {
      // user_profiles table may not exist yet
    }
  }

  const navItems = NAV_KEYS.map((key) => ({
    href: key === 'overview' ? 'overview' : key,
    label: t(`nav.${key}`),
    icon: key,
  }));

  return (
    <ProfileLayoutClient
      locale={locale}
      backHomeLabel={t('backHome', { defaultValue: '返回首页' })}
      navItems={navItems}
      profile={profile}
      user={user}
    >
      {children}
    </ProfileLayoutClient>
  );
}
