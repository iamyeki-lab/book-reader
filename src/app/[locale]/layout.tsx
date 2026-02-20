import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../../routing';
import { getSeo, toAbsoluteUrl, SITE_NAME } from '@/lib/seo';

const OG_LOCALE: Record<string, string> = {
  en: 'en_US',
  es: 'es_ES',
  ar: 'ar_SA',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = getSeo(locale);
  const url = toAbsoluteUrl(`/${locale}`);
  const locales = ['en', 'es', 'ar'] as const;
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = toAbsoluteUrl(`/${loc}`);
  }
  return {
    title: {
      default: seo.title,
      template: `%s | ${SITE_NAME}`,
    },
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      title: seo.title,
      description: seo.description,
      locale: OG_LOCALE[locale] || locale,
      alternateLocale: locales.filter((l) => l !== locale),
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    },
    alternates: {
      canonical: url,
      languages,
    },
  };
}

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
  const messages = (await getMessages()) ?? {};
  const isRtl = locale === 'ar';

  return (
    <NextIntlClientProvider messages={messages}>
      <div dir={isRtl ? 'rtl' : 'ltr'} lang={locale} className="min-h-screen">
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
