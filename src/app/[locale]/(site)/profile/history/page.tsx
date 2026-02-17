import { getTranslations } from 'next-intl/server';
import { ReadingHistoryList } from '@/components/profile/ReadingHistoryList';

export default async function ProfileHistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('profile.history');
  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold text-amber-500 md:text-2xl">
        {t('title')}
      </h2>
      <ReadingHistoryList
        locale={locale as 'en' | 'es' | 'ar'}
        t={{
          lastRead: t('lastRead'),
          continue: t('continue'),
          empty: t('empty'),
        }}
      />
    </div>
  );
}
