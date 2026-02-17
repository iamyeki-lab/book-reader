import { getTranslations } from 'next-intl/server';
import { SimpleNav } from '@/components/SimpleNav';
import { FeedbackForm } from './FeedbackForm';

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('feedback');
  return (
    <div className="min-h-screen bg-slate-950">
      <SimpleNav locale={locale} title="StoryRealm" />
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <h1 className="mb-2 text-2xl font-bold text-white">{t('title')}</h1>
        <p className="mb-8 text-slate-400">{t('description', { defaultValue: '留下您的问题或建议，我们会尽快回复。' })}</p>
        <FeedbackForm locale={locale} />
      </div>
    </div>
  );
}
