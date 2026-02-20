import { getSeo, getBaseUrl, SITE_NAME } from '@/lib/seo';

interface JsonLdWebSiteProps {
  locale: string;
}

/**
 * JSON-LD WebSite + Organization for SEO. Renders on landing for rich results.
 */
export function JsonLdWebSite({ locale }: JsonLdWebSiteProps) {
  const seo = getSeo(locale);
  const base = getBaseUrl().replace(/\/$/, '');

  const webSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: [seo.tagline],
    url: base,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${base}/${locale}/explore?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: [locale === 'en' ? 'en' : locale === 'es' ? 'es' : 'ar'],
  };

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: base,
    description: seo.description,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([webSite, organization]),
      }}
    />
  );
}
