import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../../routing';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as 'en' | 'es' | 'ar')) {
    notFound();
  }
  const messages = await getMessages();
  const isRtl = locale === 'ar';

  return (
    <NextIntlClientProvider messages={messages}>
      <div dir={isRtl ? 'rtl' : 'ltr'} lang={locale} className="min-h-screen">
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
