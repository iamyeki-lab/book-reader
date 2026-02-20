import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl().replace(/\/$/, '');
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/en/profile/', '/es/profile/', '/ar/profile/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
