/**
 * Central SEO config: titles, descriptions, keywords for EN / ES / AR.
 * Used for metadata, Open Graph, Twitter, and sitemap.
 */

export const SITE_NAME = 'StoryRealm';

export type Locale = 'en' | 'es' | 'ar';

export interface LocaleSeo {
  locale: Locale;
  /** Page title (e.g. "StoryRealm - Read Web Novels") */
  title: string;
  /** Meta description, 150–160 chars ideal */
  description: string;
  /** Keywords for meta keywords and content exposure */
  keywords: string[];
  /** Short tagline for OG/social */
  tagline: string;
}

const SEO: Record<Locale, LocaleSeo> = {
  en: {
    locale: 'en',
    title: 'StoryRealm - Read Web Novels in English, Spanish & Arabic',
    description:
      'Read translated web novels and light novels in your language. Free online reading in English, Spanish, and Arabic. Fantasy, romance, cultivation, and more.',
    tagline: 'Read web novels in your language',
    keywords: [
      'web novels',
      'read web novels online',
      'light novels',
      'translated novels',
      'fantasy novels',
      'romance novels',
      'cultivation novels',
      'free online reading',
      'English web novels',
      'Spanish novels',
      'Arabic novels',
      'StoryRealm',
      'online book reading',
      'serialized fiction',
      'web fiction',
    ],
  },
  es: {
    locale: 'es',
    title: 'StoryRealm - Lee novelas web en español',
    description:
      'Lee novelas web y light novels traducidas en tu idioma. Lectura gratis en español, inglés y árabe. Fantasía, romance, cultivación y más.',
    tagline: 'Lee novelas web en tu idioma',
    keywords: [
      'novelas web',
      'leer novelas online',
      'light novels',
      'novelas traducidas',
      'novelas de fantasía',
      'novelas románticas',
      'lectura gratis',
      'StoryRealm',
      'novelas en español',
      'ficción web',
      'novelas seriadas',
      'lectura en línea',
    ],
  },
  ar: {
    locale: 'ar',
    title: 'StoryRealm - اقرأ روايات الويب بالعربية',
    description:
      'اقرأ روايات الويب واللايت نوفيليس بلغتك. قراءة مجانية بالعربية والإنجليزية والإسبانية. فانتازيا، رومانسية، cultivación والمزيد.',
    tagline: 'اقرأ روايات الويب بلغتك',
    keywords: [
      'روايات ويب',
      'قراءة روايات أونلاين',
      'لايت نوفييل',
      'روايات مترجمة',
      'روايات عربية',
      'فانتازيا',
      'رومانسية',
      'StoryRealm',
      'قراءة مجانية',
      'رواية ويب',
    ],
  },
};

export function getSeo(locale: string): LocaleSeo {
  const lang = (locale || 'en') as Locale;
  return SEO[lang] ?? SEO.en;
}

export function getSeoKeywordsString(locale: string): string {
  return getSeo(locale).keywords.join(', ');
}

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://storyrealm.app';
}

export function toAbsoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
  const base = getBaseUrl().replace(/\/$/, '');
  return pathOrUrl.startsWith('/') ? base + pathOrUrl : base + '/' + pathOrUrl;
}
