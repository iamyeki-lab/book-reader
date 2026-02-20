import type { Metadata } from 'next';
import { getCachedBookMetadata } from '@/lib/supabase/queries';
import type { Locale } from '@/lib/supabase/types';
import { getSeo, toAbsoluteUrl, SITE_NAME } from '@/lib/seo';
import { StoryDetailClient } from './StoryDetailClient';

const OG_LOCALE: Record<string, string> = {
  en: 'en_US',
  es: 'es_ES',
  ar: 'ar_SA',
  zh: 'zh_CN',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const lang = (locale || 'en') as Locale;
  let meta: Metadata;
  try {
    const data = await getCachedBookMetadata(id, lang);
    if (!data) {
      const seo = getSeo(lang);
      meta = {
        title: seo.tagline,
        description: seo.description,
        keywords: seo.keywords,
        openGraph: { title: seo.title, description: seo.description, siteName: SITE_NAME },
        twitter: { card: 'summary_large_image', title: seo.title, description: seo.description },
      };
    } else {
      const { title, description, coverUrl } = data;
      const summary = description.slice(0, 160);
      const canonicalUrl = toAbsoluteUrl(`/${locale}/story/${id}`);
      const imageUrl = coverUrl ? toAbsoluteUrl(coverUrl) : undefined;
      const seo = getSeo(lang);
      meta = {
        title: `${title} - ${seo.tagline}`,
        description: summary,
        keywords: [...seo.keywords, title],
        openGraph: {
          title,
          description: summary,
          url: canonicalUrl,
          siteName: SITE_NAME,
          locale: OG_LOCALE[lang] || lang,
          ...(imageUrl && {
            images: [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: title,
              },
            ],
          }),
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description: summary,
          ...(imageUrl && { images: [imageUrl] }),
        },
      };
    }
  } catch {
    const seo = getSeo((locale || 'en') as Locale);
    meta = {
      title: seo.tagline,
      description: seo.description,
      keywords: seo.keywords,
      openGraph: { title: seo.title, description: seo.description, siteName: SITE_NAME },
      twitter: { card: 'summary_large_image', title: seo.title, description: seo.description },
    };
  }
  return meta;
}

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  void params; // required by Next.js route, used by framework
  return <StoryDetailClient />;
}
