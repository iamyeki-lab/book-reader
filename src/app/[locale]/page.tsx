import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getLandingSlogan, getTrendingSubtitle, getBooks, getBookTitleForLang, getBookCoverForLang, getBookDescriptionForLang } from '@/lib/supabase/queries';
import { LandingClient } from './LandingClient';
import type { Locale } from '@/lib/supabase/types';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('landing');
  const tExplore = await getTranslations('explore');
  const client = await createClient();
  const [slogan, trendingSubtitle, rows, authRes] = await Promise.all([
    getLandingSlogan(client, locale),
    getTrendingSubtitle(client, locale),
    getBooks(client, undefined, { publishedOnly: true }),
    client.auth.getUser(),
  ]);
  const user = authRes.data.user;
  const displaySlogan = slogan || t('slogan');
  const displayTrendingSubtitle = trendingSubtitle || t('trendingSubtitle', { defaultValue: 'TRENDING NOW' });
  const allBooks = rows.map((b) => ({
    id: b.id,
    title: getBookTitleForLang(b, locale as Locale),
    author: b.author,
    genre: b.genre || null,
    description: getBookDescriptionForLang(b, locale as Locale) || null,
    cover_url: getBookCoverForLang(b, locale as Locale),
  }));
  const featured = allBooks[0] ?? null;
  const trendingBooks = allBooks.slice(0, 12);

  return (
    <LandingClient
      locale={locale}
      user={user}
      profileLabel={t('profile', { defaultValue: '个人中心' })}
      slogan={displaySlogan}
      trendingSubtitle={displayTrendingSubtitle}
      featured={featured}
      books={trendingBooks}
      t={{
        explore: t('explore'),
        login: t('login'),
        signUp: t('signUp', { defaultValue: 'Sign up' }),
        feedback: t('feedback'),
        startReading: tExplore('startReading'),
        readNow: t('readNow', { defaultValue: 'Read Now' }),
        addToLibrary: t('addToLibrary', { defaultValue: 'Add to Library' }),
      }}
    />
  );
}
