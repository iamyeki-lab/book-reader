import type { Metadata } from 'next';
import { getCachedBookMetadata } from '@/lib/supabase/queries';
import type { Locale } from '@/lib/supabase/types';
import { StoryDetailClient } from './StoryDetailClient';

const SITE_NAME = 'StoryRealm';
const OG_LOCALE: Record<string, string> = {
  en: 'en_US',
  es: 'es_ES',
  ar: 'ar_SA',
  zh: 'zh_CN',
};

function toAbsoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://storyrealm.app';
  return base.replace(/\/$/, '') + (pathOrUrl.startsWith('/') ? pathOrUrl : '/' + pathOrUrl);
}

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
      meta = {
        title: `Read on ${SITE_NAME}`,
        description: 'Web novels in your language.',
        openGraph: { title: SITE_NAME, siteName: SITE_NAME },
        twitter: { card: 'summary_large_image', title: SITE_NAME },
      };
    } else {
      const { title, description, coverUrl } = data;
      const summary = description.slice(0, 160);
      const canonicalUrl = toAbsoluteUrl(`/${locale}/story/${id}`);
      const imageUrl = coverUrl ? toAbsoluteUrl(coverUrl) : undefined;
      meta = {
        title: `${title} - Read on ${SITE_NAME}`,
        description: summary,
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
    meta = {
      title: `Read on ${SITE_NAME}`,
      description: 'Web novels in your language.',
      openGraph: { title: SITE_NAME, siteName: SITE_NAME },
      twitter: { card: 'summary_large_image', title: SITE_NAME },
    };
  }
  return meta;
}

export default async function StoryDetailPage({
  params: _params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  return <StoryDetailClient />;
}
