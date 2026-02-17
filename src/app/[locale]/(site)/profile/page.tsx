import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { DailyMeditationButton } from '@/components/profile/DailyMeditationButton';

export default async function ProfileOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('profile');
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();

  let stats = { libraryCount: 0, readingCount: 0 };
  let canMeditate = false;

  if (user) {
    try {
      const [libRes, histRes, profileRes] = await Promise.all([
        client.from('user_bookshelf').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        client.from('user_progress').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        client.from('user_profiles').select('last_meditation_at').eq('id', user.id).maybeSingle(),
      ]);
      stats = {
        libraryCount: libRes?.count ?? 0,
        readingCount: histRes?.count ?? 0,
      };
      const lastDate = profileRes?.data?.last_meditation_at
        ? new Date(profileRes.data.last_meditation_at).toISOString().slice(0, 10)
        : null;
      const today = new Date().toISOString().slice(0, 10);
      canMeditate = lastDate !== today;
    } catch {
      // tables may not exist yet
      canMeditate = true;
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold text-amber-500 md:text-2xl">
        {t('overview.title')}
      </h2>
      {user && (
        <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 md:p-6">
          <h3 className="mb-3 text-sm font-medium text-amber-500">{t('overview.meditation')}</h3>
          <DailyMeditationButton
            locale={locale}
            canMeditate={canMeditate}
            t={{
              button: t('overview.meditationButton'),
              toast: t('overview.meditationToast'),
              alreadyDone: t('overview.meditationAlreadyDone'),
            }}
          />
        </section>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 md:p-6">
          <h3 className="mb-2 text-sm font-medium text-amber-500">{t('overview.library')}</h3>
          <p className="text-2xl font-semibold text-slate-200">{stats.libraryCount}</p>
          <p className="mt-1 text-sm text-slate-400">{t('overview.libraryDesc')}</p>
        </section>
        <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 md:p-6">
          <h3 className="mb-2 text-sm font-medium text-amber-500">{t('overview.reading')}</h3>
          <p className="text-2xl font-semibold text-slate-200">{stats.readingCount}</p>
          <p className="mt-1 text-sm text-slate-400">{t('overview.readingDesc')}</p>
        </section>
      </div>
      {!user && (
        <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-slate-200">{t('overview.guestHint')}</p>
        </section>
      )}
    </div>
  );
}
