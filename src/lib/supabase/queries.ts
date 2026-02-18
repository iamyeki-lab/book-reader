// AtoB: Supabase query helpers
import { unstable_cache } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Locale } from './types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BookRow, ChapterRow, TranslationRow, GlossaryRow } from './types';

// --- Books ---
export async function getBooks(
  client: SupabaseClient,
  lang?: string,
  options?: { publishedOnly?: boolean }
) {
  let q = client.from('books').select('*');
  if (options?.publishedOnly) q = q.eq('published', true);
  q = q.order('updated_at', { ascending: false });
  if (lang) {
    // 通过 translations 的 book_id 或 chapter_id->chapters 获取有该语种翻译的书籍
    const { data: withTrans } = await client
      .from('translations')
      .select('book_id, chapter_id')
      .eq('target_lang', lang);
    const bookIds = new Set<string>();
    (withTrans || []).forEach((r) => {
      if (r.book_id) bookIds.add(r.book_id);
    });
    // 当 book_id 为空时，通过 chapter_id 查 chapters 得到 book_id
    const nullBookChapterIds = (withTrans || []).filter((r) => !r.book_id).map((r) => r.chapter_id);
    if (nullBookChapterIds.length > 0) {
      const { data: chaps } = await client
        .from('chapters')
        .select('book_id')
        .in('id', nullBookChapterIds);
      (chaps || []).forEach((c: { book_id?: string }) => c.book_id && bookIds.add(c.book_id));
    }
    const ids = Array.from(bookIds);
    q = q.or(`lang.eq.${lang},id.in.(${ids.length ? ids.join(',') : '00000000-0000-0000-0000-000000000000'})`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as BookRow[];
}

export async function getBooksUpdatedSince(
  client: SupabaseClient,
  since: string,
  lang?: string,
  options?: { publishedOnly?: boolean }
) {
  let q = client.from('books').select('*').gte('updated_at', since);
  if (options?.publishedOnly) q = q.eq('published', true);
  q = q.order('updated_at', { ascending: false });
  if (lang) {
    const { data: withTrans } = await client
      .from('translations')
      .select('book_id, chapter_id')
      .eq('target_lang', lang)
      .gte('updated_at', since);
    const bookIds = new Set<string>();
    (withTrans || []).forEach((r) => { if (r.book_id) bookIds.add(r.book_id); });
    const nullBookChapterIds = (withTrans || []).filter((r) => !r.book_id).map((r) => r.chapter_id);
    if (nullBookChapterIds.length > 0) {
      const { data: chaps } = await client.from('chapters').select('book_id').in('id', nullBookChapterIds);
      (chaps || []).forEach((c: { book_id?: string }) => c.book_id && bookIds.add(c.book_id));
    }
    const ids = Array.from(bookIds);
    q = q.or(`lang.eq.${lang},id.in.(${ids.length ? ids.join(',') : '00000000-0000-0000-0000-000000000000'})`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as BookRow[];
}

export async function getBookById(client: SupabaseClient, id: string) {
  const { data, error } = await client.from('books').select('*').eq('id', id).single();
  if (error) throw error;
  return data as BookRow;
}

export async function getBookByIdOrNull(client: SupabaseClient, id: string): Promise<BookRow | null> {
  const { data, error } = await client.from('books').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as BookRow | null;
}

export function getBookTitleForLang(book: BookRow, locale: Locale): string {
  const key = `title_${locale}` as keyof BookRow;
  const val = book[key];
  if (typeof val === 'string' && val) return val;
  return book.title;
}

export function getBookCoverForLang(book: BookRow, locale: Locale): string | null {
  const key = `cover_url_${locale}` as keyof BookRow;
  const val = book[key];
  if (typeof val === 'string' && val) return val;
  return book.cover_url;
}

export function getBookDescriptionForLang(book: BookRow, locale: Locale): string | null {
  const key = `description_${locale}` as keyof BookRow;
  const val = book[key];
  if (typeof val === 'string' && val) return val;
  return book.description;
}

export async function getBookTitleForAdmin(client: SupabaseClient, id: string) {
  const { data } = await client.from('books').select('title, title_zh, title_en, title_es, title_ar').eq('id', id).single();
  return data;
}

export async function insertBook(client: SupabaseClient, row: Record<string, unknown>) {
  const { data, error } = await client.from('books').insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function updateBook(client: SupabaseClient, id: string, row: Record<string, unknown>) {
  const { data, error } = await client.from('books').update(row).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteBook(client: SupabaseClient, id: string) {
  const { error } = await client.from('books').delete().eq('id', id);
  if (error) throw error;
}

// --- Chapters ---
export async function getChaptersByBookId(client: SupabaseClient, bookId: string) {
  const { data, error } = await client
    .from('chapters')
    .select('*')
    .eq('book_id', bookId)
    .order('chapter_number', { ascending: true });
  if (error) throw error;
  return (data || []) as ChapterRow[];
}

export async function getChapterById(client: SupabaseClient, id: string) {
  const { data, error } = await client.from('chapters').select('*').eq('id', id).single();
  if (error) throw error;
  return data as ChapterRow;
}

export async function insertChapter(client: SupabaseClient, row: Record<string, unknown>) {
  const { data, error } = await client.from('chapters').insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function updateChapter(client: SupabaseClient, id: string, row: Record<string, unknown>) {
  const { data, error } = await client.from('chapters').update(row).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteChapter(client: SupabaseClient, id: string) {
  const { error } = await client.from('chapters').delete().eq('id', id);
  if (error) throw error;
}

// --- Translations ---
// Query by chapter_id (via chapters.book_id) so we also return translations where book_id is null (legacy rows)
export async function getTranslationsByBookIdAndLang(
  client: SupabaseClient,
  bookId: string,
  targetLang: string
) {
  const chapters = await getChaptersByBookId(client, bookId);
  const chapterIds = chapters.map((c) => c.id);
  if (chapterIds.length === 0) return [];

  const { data, error } = await client
    .from('translations')
    .select('*')
    .in('chapter_id', chapterIds)
    .eq('target_lang', targetLang)
    .order('chapter_id');
  if (error) throw error;
  return (data || []) as TranslationRow[];
}

export async function getTranslationsByBookIdAndLangUpdatedSince(
  client: SupabaseClient,
  bookId: string,
  targetLang: string,
  since: string
) {
  const chapters = await getChaptersByBookId(client, bookId);
  const chapterIds = chapters.map((c) => c.id);
  if (chapterIds.length === 0) return [];

  const { data, error } = await client
    .from('translations')
    .select('*')
    .in('chapter_id', chapterIds)
    .eq('target_lang', targetLang)
    .gte('updated_at', since)
    .order('chapter_id');
  if (error) throw error;
  return (data || []) as TranslationRow[];
}

export async function getTranslation(client: SupabaseClient, chapterId: string, targetLang: string) {
  const { data, error } = await client
    .from('translations')
    .select('*')
    .eq('chapter_id', chapterId)
    .eq('target_lang', targetLang)
    .maybeSingle();
  if (error) throw error;
  return data as TranslationRow | null;
}

/** Anon client (env only, no cookies) for use inside unstable_cache where request context may be missing */
function getAnonClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

/** Data Cache: single chapter translation by bookId + chapterNumber + lang. Revalidate 1h or via revalidateTag('translations'). */
async function getTranslationByBookAndChapter(
  bookId: string,
  chapterNumber: number,
  lang: string
): Promise<TranslationRow | null> {
  const client = getAnonClient();
  const chapters = await getChaptersByBookId(client, bookId);
  const ch = chapters.find((c) => c.chapter_number === chapterNumber);
  if (!ch) return null;
  const { data, error } = await client
    .from('translations')
    .select('*')
    .eq('chapter_id', ch.id)
    .eq('target_lang', lang)
    .maybeSingle();
  if (error) throw error;
  return data as TranslationRow | null;
}

export const getCachedTranslation = unstable_cache(
  getTranslationByBookAndChapter,
  ['translation'],
  { revalidate: 3600, tags: ['translations'] }
);

/** Cached book metadata for OG/social (title, description, coverUrl). Deduped with page data fetch. */
async function getBookMetadataForOG(bookId: string, locale: Locale): Promise<{ title: string; description: string; coverUrl: string | null } | null> {
  const client = getAnonClient();
  const book = await getBookByIdOrNull(client, bookId);
  if (!book) return null;
  const title = getBookTitleForLang(book, locale);
  const description = getBookDescriptionForLang(book, locale) || book.description || '';
  const coverUrl = getBookCoverForLang(book, locale) || book.cover_url || null;
  return { title, description: description.slice(0, 160), coverUrl };
}

export const getCachedBookMetadata = unstable_cache(
  getBookMetadataForOG,
  ['book-og'],
  { revalidate: 3600, tags: ['books'] }
);

export async function upsertTranslation(
  client: SupabaseClient,
  chapterId: string,
  bookId: string,
  targetLang: string,
  translatedTitle: string,
  translatedContent: string
) {
  const row: Record<string, unknown> = {
    chapter_id: chapterId,
    target_lang: targetLang,
    translated_title: translatedTitle,
    translated_content: translatedContent,
    book_id: bookId,
  };
  if (targetLang === 'en') row.translated_en = translatedContent;
  else if (targetLang === 'es') row.translated_es = translatedContent;
  else if (targetLang === 'ar') row.translated_ar = translatedContent;
  const { data, error } = await client
    .from('translations')
    .upsert(row, { onConflict: 'chapter_id,target_lang' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- Site settings ---
export async function getEnabledLocales(client: SupabaseClient): Promise<string[]> {
  const { data } = await client.from('site_settings').select('value').eq('key', 'enabled_locales').single();
  const arr = (data?.value as string[]) || ['en', 'es', 'ar'];
  return Array.isArray(arr) ? arr : ['en', 'es', 'ar'];
}

export async function getLandingSlogan(client: SupabaseClient, locale: string): Promise<string | null> {
  const { data } = await client.from('site_settings').select('value').eq('key', 'landing_slogan').single();
  const obj = data?.value as Record<string, string> | null;
  return obj?.[locale] || null;
}

export async function getTrendingSubtitle(client: SupabaseClient, locale: string): Promise<string | null> {
  const { data } = await client.from('site_settings').select('value').eq('key', 'trending_subtitle').single();
  const obj = data?.value as Record<string, string> | null;
  return obj?.[locale] || null;
}

/** 全局默认免费章数（来自 site_settings） */
async function getGlobalFreeChaptersCount(client: SupabaseClient): Promise<number> {
  const { data } = await client.from('site_settings').select('value').eq('key', 'free_chapters_count').single();
  const v = data?.value;
  if (typeof v === 'number') return Math.max(0, v);
  if (typeof v === 'string') return Math.max(0, parseInt(v, 10) || 3);
  return 3;
}

/**
 * 免费章数：传入 bookId 时若该书有 free_chapters_override 则优先使用，否则用全局配置。
 */
export async function getFreeChaptersCount(client: SupabaseClient, bookId?: string): Promise<number> {
  if (bookId) {
    const { data: book } = await client.from('books').select('free_chapters_override').eq('id', bookId).maybeSingle();
    const override = (book as { free_chapters_override?: number | null } | null)?.free_chapters_override;
    if (typeof override === 'number' && override >= 0) return override;
  }
  return getGlobalFreeChaptersCount(client);
}

export async function getPaymentConfig(client: SupabaseClient): Promise<{
  paypal_client_id: string;
  chapter_price_credits: number;
  currency: string;
}> {
  const { data } = await client.from('site_settings').select('value').eq('key', 'payment_config').single();
  const obj = (data?.value as Record<string, unknown>) || {};
  return {
    paypal_client_id: (obj.paypal_client_id as string) || '',
    chapter_price_credits: Math.max(0, (obj.chapter_price_credits as number) || 10),
    currency: (obj.currency as string) || 'USD',
  };
}

export async function setFreeChaptersCount(client: SupabaseClient, count: number) {
  const { error } = await client
    .from('site_settings')
    .upsert({ key: 'free_chapters_count', value: Math.max(0, count) as unknown as Record<string, unknown> }, { onConflict: 'key' });
  if (error) throw error;
}

export async function setPaymentConfig(client: SupabaseClient, config: { paypal_client_id?: string; chapter_price_credits?: number; currency?: string }) {
  const existing = await getPaymentConfig(client);
  const merged = { ...existing, ...config };
  const { error } = await client
    .from('site_settings')
    .upsert({ key: 'payment_config', value: merged as unknown as Record<string, unknown> }, { onConflict: 'key' });
  if (error) throw error;
}

export async function getReaderCredits(client: SupabaseClient, userId: string): Promise<number> {
  const { data } = await client.from('reader_profiles').select('credits').eq('user_id', userId).single();
  return (data?.credits as number) ?? 0;
}

export async function getChapterPurchase(client: SupabaseClient, userId: string, chapterId: string): Promise<boolean> {
  const { data } = await client.from('chapter_purchases').select('id').eq('user_id', userId).eq('chapter_id', chapterId).single();
  return !!data;
}

// --- Bookshelf ---
export async function addToBookshelf(client: SupabaseClient, userId: string, bookId: string) {
  const { error } = await client.from('user_bookshelf').upsert(
    { user_id: userId, book_id: bookId },
    { onConflict: 'user_id,book_id' }
  );
  if (error) throw error;
}

export async function removeFromBookshelf(client: SupabaseClient, userId: string, bookId: string) {
  const { error } = await client.from('user_bookshelf').delete().eq('user_id', userId).eq('book_id', bookId);
  if (error) throw error;
}

export async function isInBookshelf(client: SupabaseClient, userId: string, bookId: string): Promise<boolean> {
  const { data } = await client.from('user_bookshelf').select('id').eq('user_id', userId).eq('book_id', bookId).maybeSingle();
  return !!data;
}

export async function getBookshelfBookIds(client: SupabaseClient, userId: string): Promise<Set<string>> {
  const { data } = await client.from('user_bookshelf').select('book_id').eq('user_id', userId);
  return new Set((data || []).map((r) => r.book_id));
}

export async function getChapterPurchasesByUserAndBook(client: SupabaseClient, userId: string, bookId: string) {
  const { data, error } = await client
    .from('chapter_purchases')
    .select('chapter_id')
    .eq('user_id', userId)
    .eq('book_id', bookId);
  if (error) throw error;
  return new Set((data || []).map((r) => r.chapter_id));
}

export async function setEnabledLocales(client: SupabaseClient, locales: string[]) {
  const { error } = await client
    .from('site_settings')
    .upsert({ key: 'enabled_locales', value: locales as unknown as Record<string, unknown> }, { onConflict: 'key' });
  if (error) throw error;
}

export async function setLandingSlogans(client: SupabaseClient, slogans: Record<string, string>) {
  const { error } = await client
    .from('site_settings')
    .upsert({ key: 'landing_slogan', value: slogans as unknown as Record<string, unknown> }, { onConflict: 'key' });
  if (error) throw error;
}

export async function setTrendingSubtitles(client: SupabaseClient, subtitles: Record<string, string>) {
  const { error } = await client
    .from('site_settings')
    .upsert({ key: 'trending_subtitle', value: subtitles as unknown as Record<string, unknown> }, { onConflict: 'key' });
  if (error) throw error;
}

// --- Glossaries ---
// 术语表增量更新原则：合并 incoming 与已有内容，不整体覆盖。names/terms/titles/systems 按 key 合并值；多语言对象合并 en/es/ar。
function mergeGlossaryContent(
  existing: Record<string, unknown> | null,
  incoming: Record<string, unknown>
): Record<string, unknown> {
  if (!existing || typeof existing !== 'object') return incoming;

  const result: Record<string, unknown> = {};
  for (const key of ['names', 'terms', 'titles', 'systems']) {
    const existObj = (existing[key] as Record<string, unknown>) || {};
    const inObj = (incoming[key] as Record<string, unknown>) || {};
    const merged: Record<string, unknown> = { ...(typeof existObj === 'object' ? existObj : {}) };
    if (typeof inObj === 'object') {
      for (const k of Object.keys(inObj)) {
        const ev = merged[k];
        const iv = inObj[k];
        if (iv === null || iv === undefined) continue;
        if (
          ev != null &&
          typeof ev === 'object' &&
          !Array.isArray(ev) &&
          typeof iv === 'object' &&
          !Array.isArray(iv)
        ) {
          merged[k] = { ...(ev as Record<string, unknown>), ...(iv as Record<string, unknown>) };
        } else {
          merged[k] = iv;
        }
      }
    }
    result[key] = merged;
  }
  const existNotes = Array.isArray(existing.consistency_notes) ? existing.consistency_notes : [];
  const inNotes = Array.isArray(incoming.consistency_notes) ? incoming.consistency_notes : [];
  const seen = new Set<string>();
  const notes: unknown[] = [];
  for (const n of [...existNotes, ...inNotes]) {
    const s = String(n);
    if (!seen.has(s)) {
      seen.add(s);
      notes.push(n);
    }
  }
  result.consistency_notes = notes;
  return result;
}

export async function getGlossaryByBookId(client: SupabaseClient, bookId: string): Promise<GlossaryRow | null> {
  const { data, error } = await client.from('glossaries').select('*').eq('book_id', bookId).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data as GlossaryRow | null;
}

export async function upsertGlossary(client: SupabaseClient, bookId: string, content: Record<string, unknown>) {
  const existing = await getGlossaryByBookId(client, bookId);
  const existingContent = (existing?.content as Record<string, unknown>) || null;
  const merged = mergeGlossaryContent(existingContent, content);
  const { data, error } = await client
    .from('glossaries')
    .upsert({ book_id: bookId, content: merged }, { onConflict: 'book_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteGlossary(client: SupabaseClient, bookId: string) {
  const { error } = await client.from('glossaries').delete().eq('book_id', bookId);
  if (error) throw error;
}

// --- Admin ---
export async function getAdminUsers(client: SupabaseClient) {
  const { data, error } = await client.from('admin_users').select('*');
  if (error) throw error;
  return data || [];
}

export async function addAdminUser(client: SupabaseClient, email: string) {
  const { error } = await client.from('admin_users').insert({ email });
  if (error) throw error;
}

export async function removeAdminUser(client: SupabaseClient, email: string) {
  const { error } = await client.from('admin_users').delete().eq('email', email);
  if (error) throw error;
}
