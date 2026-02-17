import { getTranslations } from 'next-intl/server';
import { BookLibraryGrid } from '@/components/profile/BookLibraryGrid';

export default async function ProfileLibraryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('profile.library');
  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold text-amber-500 md:text-2xl">
        {t('title')}
      </h2>
      <BookLibraryGrid
        locale={locale as 'en' | 'es' | 'ar'}
        t={{
          empty: t('empty'),
          goExplore: t('goExplore'),
        }}
      />
    </div>
  );
}
