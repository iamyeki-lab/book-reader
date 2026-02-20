import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getBooks } from '@/lib/supabase/queries';
import { getBaseUrl } from '@/lib/seo';
import { routing } from '../../routing';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl().replace(/\/$/, '');
  const locales = [...routing.locales];
  const entries: MetadataRoute.Sitemap = [];

  const now = new Date().toISOString();

  for (const locale of locales) {
    entries.push({
      url: `${base}/${locale}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    });
    entries.push({
      url: `${base}/${locale}/explore`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    });
  }

  try {
    const client = await createClient();
    const books = await getBooks(client, undefined, { publishedOnly: true });
    for (const book of books) {
      for (const locale of locales) {
        entries.push({
          url: `${base}/${locale}/story/${book.id}`,
          lastModified: book.updated_at || now,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }
  } catch {
    // continue without book URLs
  }

  return entries;
}
