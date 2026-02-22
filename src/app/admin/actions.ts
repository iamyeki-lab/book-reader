'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  setEnabledLocales,
  setLandingSlogans,
  setTrendingSubtitles,
  setFreeChaptersCount,
  setPaymentConfig,
  insertBook,
  updateBook,
  deleteBook,
  insertChapter,
  updateChapter,
  deleteChapter,
  getChapterById,
  getTranslation,
  upsertTranslation,
  upsertGlossary,
  replaceGlossary,
  deleteGlossary,
  getGlossaryByBookId,
} from '@/lib/supabase/queries';

async function ensureAdmin() {
  const email = await getCurrentAdminEmail();
  if (!email) {
    throw new Error('Unauthorized');
  }
  return createAdminClient();
}

export async function setEnabledLocalesAction(locales: string[]) {
  await ensureAdmin();
  const client = createAdminClient();
  await setEnabledLocales(client, locales);
  revalidatePath('/admin/settings');
}

export async function setLandingSlogansAction(slogans: Record<string, string>) {
  await ensureAdmin();
  const client = createAdminClient();
  await setLandingSlogans(client, slogans);
  revalidatePath('/admin/settings');
}

export async function setTrendingSubtitlesAction(subtitles: Record<string, string>) {
  await ensureAdmin();
  const client = createAdminClient();
  await setTrendingSubtitles(client, subtitles);
  revalidatePath('/admin/settings');
  revalidatePath('/[locale]', 'page');
}

export async function createBookAction(formData: FormData) {
  await ensureAdmin();
  const client = createAdminClient();
  const title = formData.get('title') as string;
  const author = formData.get('author') as string;
  const description = (formData.get('description') as string) || null;
  const descriptionEn = (formData.get('description_en') as string) || description;
  const descriptionEs = (formData.get('description_es') as string) || null;
  const descriptionAr = (formData.get('description_ar') as string) || null;
  const titleEn = (formData.get('title_en') as string) || title;
  const titleEs = (formData.get('title_es') as string) || null;
  const titleAr = (formData.get('title_ar') as string) || null;
  const genre = (formData.get('genre') as string) || null;
  await insertBook(client, {
    title,
    author,
    description,
    description_en: descriptionEn,
    description_es: descriptionEs,
    description_ar: descriptionAr,
    genre,
    lang: 'en',
    title_en: titleEn,
    title_es: titleEs,
    title_ar: titleAr,
  });
  revalidatePath('/admin/books');
  redirect('/admin/books');
}

export async function updateBookAction(id: string, formData: FormData) {
  await ensureAdmin();
  const client = createAdminClient();
  const title = formData.get('title') as string;
  const author = formData.get('author') as string;
  const description = (formData.get('description') as string) || null;
  const descriptionEn = (formData.get('description_en') as string) || description;
  const descriptionEs = (formData.get('description_es') as string) || null;
  const descriptionAr = (formData.get('description_ar') as string) || null;
  const titleEn = (formData.get('title_en') as string) || title;
  const titleEs = (formData.get('title_es') as string) || null;
  const titleAr = (formData.get('title_ar') as string) || null;
  const genre = (formData.get('genre') as string) || null;
  const freeChaptersRaw = formData.get('free_chapters_override') as string | null;
  const free_chapters_override =
    freeChaptersRaw === '' || freeChaptersRaw === null
      ? null
      : Math.max(0, parseInt(freeChaptersRaw, 10) || 0);
  await updateBook(client, id, {
    title,
    author,
    description,
    description_en: descriptionEn,
    description_es: descriptionEs,
    description_ar: descriptionAr,
    genre,
    title_en: titleEn,
    title_es: titleEs,
    title_ar: titleAr,
    free_chapters_override: freeChaptersRaw === '' || freeChaptersRaw === null ? null : free_chapters_override,
  });
  revalidatePath('/admin/books');
  revalidatePath(`/admin/books/${id}`);
  revalidateFrontend(id);
  redirect(`/admin/books/${id}/edit?saved=1`);
}

export async function publishBookAction(id: string, published: boolean) {
  await ensureAdmin();
  const client = createAdminClient();
  await updateBook(client, id, { published });
  revalidatePath('/admin/books');
  revalidatePath(`/admin/books/${id}`);
  revalidateFrontend(id);
  redirect(`/admin/books/${id}/edit?${published ? 'published=1' : 'unpublished=1'}`);
}

export async function mergeBookAction(targetBookId: string, formData: FormData) {
  await ensureAdmin();
  const sourceBookId = (formData.get('sourceBookId') as string)?.trim();
  if (!sourceBookId) throw new Error('请输入源书籍 ID');
  const client = createAdminClient();
  // @ts-expect-error - merge_book_translations RPC args not in generated Database types
  const { data, error } = await client.rpc('merge_book_translations', {
    source_book_id: sourceBookId,
    target_book_id: targetBookId,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/books/${targetBookId}`);
  revalidateFrontend(targetBookId);
  redirect(`/admin/books/${targetBookId}/edit?merged=${data}`);
}

export async function uploadBookCoverAction(bookId: string, lang: 'en' | 'es' | 'ar', formData: FormData) {
  await ensureAdmin();
  const file = formData.get('cover') as File;
  if (!file || file.size === 0) {
    return { error: '请选择文件' };
  }
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `books/${bookId}/cover_${lang}.${ext}`;
  const client = createAdminClient();
  const { data: urlData } = client.storage.from('book-covers').getPublicUrl(path);
  const { error } = await client.storage.from('book-covers').upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) return { error: error.message };
  const url = urlData.publicUrl;
  const col = `cover_url_${lang}` as 'cover_url_en' | 'cover_url_es' | 'cover_url_ar';
  await updateBook(client, bookId, { [col]: url });
  revalidatePath('/admin/books');
  revalidatePath(`/admin/books/${bookId}`);
  return { url };
}

export async function deleteBookAction(id: string) {
  await ensureAdmin();
  const client = createAdminClient();
  await deleteBook(client, id);
  revalidatePath('/admin/books');
  redirect('/admin/books');
}

export async function createChapterAction(bookId: string, formData: FormData) {
  await ensureAdmin();
  const client = createAdminClient();
  const chapterNumber = parseInt(formData.get('chapter_number') as string, 10);
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  await insertChapter(client, { book_id: bookId, chapter_number: chapterNumber, title, content });
  revalidatePath(`/admin/books/${bookId}/chapters`);
  redirect(`/admin/books/${bookId}/chapters`);
}

export async function updateChapterAction(chapterId: string, bookId: string, formData: FormData) {
  await ensureAdmin();
  const client = createAdminClient();
  const chapterNumber = parseInt(formData.get('chapter_number') as string, 10);
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  await updateChapter(client, chapterId, { chapter_number: chapterNumber, title, content });
  revalidatePath(`/admin/books/${bookId}/chapters`);
  redirect(`/admin/books/${bookId}/chapters`);
}

export async function deleteChapterAction(chapterId: string, bookId: string) {
  await ensureAdmin();
  const client = createAdminClient();
  await deleteChapter(client, chapterId);
  revalidatePath(`/admin/books/${bookId}/chapters`);
  redirect(`/admin/books/${bookId}/chapters`);
}

export async function getChapterContentAction(chapterId: string) {
  await ensureAdmin();
  try {
    const client = createAdminClient();
    const chapter = await getChapterById(client, chapterId);
    return {
      chapter_number: chapter.chapter_number,
      title: chapter.title,
      content: chapter.content,
    };
  } catch {
    return null;
  }
}

function revalidateFrontend(bookId?: string) {
  const locales = ['en', 'es', 'ar'] as const;
  for (const locale of locales) {
    revalidatePath(`/${locale}`, 'page');
    revalidatePath(`/${locale}`, 'layout');
    if (bookId) {
      revalidatePath(`/${locale}/story/${bookId}`, 'page');
      revalidatePath(`/${locale}/story/${bookId}/read`, 'page');
    }
  }
  revalidateTag('translations');
}

/** 数据库 → 网页端：刷新读者端缓存，使读者看到数据库最新内容 */
export async function syncToFrontendAction(bookId?: string) {
  await ensureAdmin();
  revalidateFrontend(bookId);
  return { ok: true };
}

/** 从数据库同步：刷新后台缓存，使后台页面显示数据库最新内容（如被 novel-translator 等更新后） */
export async function syncFromDatabaseAction(bookId?: string) {
  await ensureAdmin();
  revalidatePath('/admin', 'layout');
  revalidatePath('/admin/books');
  if (bookId) {
    revalidatePath(`/admin/books/${bookId}`);
    revalidatePath(`/admin/books/${bookId}/chapters`);
    revalidatePath(`/admin/books/${bookId}/edit`);
    revalidatePath(`/admin/glossary/${bookId}`);
  }
  return { ok: true };
}

export async function updateChapterDataAction(
  chapterId: string,
  bookId: string,
  data: { chapter_number: number; title: string; content: string }
) {
  await ensureAdmin();
  const client = createAdminClient();
  await updateChapter(client, chapterId, data);
  revalidatePath(`/admin/books/${bookId}/chapters`);
  revalidatePath(`/admin/books/${bookId}/chapters/${chapterId}`);
  revalidateFrontend(bookId);
  return { ok: true };
}

export async function getTranslationContentAction(chapterId: string, targetLang: string) {
  await ensureAdmin();
  try {
    const client = createAdminClient();
    const t = await getTranslation(client, chapterId, targetLang);
    if (!t) return null;
    return {
      translated_title: t.translated_title,
      translated_content: t.translated_content,
    };
  } catch {
    return null;
  }
}

export async function updateTranslationDataAction(
  chapterId: string,
  bookId: string,
  targetLang: string,
  data: { translated_title: string; translated_content: string }
) {
  await ensureAdmin();
  const client = createAdminClient();
  await upsertTranslation(
    client,
    chapterId,
    bookId,
    targetLang,
    data.translated_title,
    data.translated_content
  );
  revalidatePath(`/admin/books/${bookId}/chapters`);
  revalidatePath(`/admin/books/${bookId}/chapters/${chapterId}`);
  revalidateFrontend(bookId);
  return { ok: true };
}

export async function saveGlossaryAction(bookId: string, contentJson: string) {
  await ensureAdmin();
  const client = createAdminClient();
  let content: Record<string, unknown>;
  try {
    content = JSON.parse(contentJson) as Record<string, unknown>;
  } catch {
    return { error: 'Invalid JSON' };
  }
  await upsertGlossary(client, bookId, content);
  revalidatePath('/admin/glossary');
  revalidatePath(`/admin/glossary/${bookId}`);
  return { ok: true };
}

/** 完全覆盖同步：用当前内容覆盖服务端术语表，并删除该书所有 glossary_items，使服务端与当前一致、无多余项 */
export async function saveGlossaryOverwriteAction(bookId: string, contentJson: string) {
  await ensureAdmin();
  const client = createAdminClient();
  let content: Record<string, unknown>;
  try {
    content = JSON.parse(contentJson) as Record<string, unknown>;
  } catch {
    return { error: 'Invalid JSON' };
  }
  await replaceGlossary(client, bookId, content);
  revalidatePath('/admin/glossary');
  revalidatePath(`/admin/glossary/${bookId}`);
  return { ok: true };
}

export async function getGlossaryContentAction(bookId: string) {
  await ensureAdmin();
  const client = createAdminClient();
  const glossary = await getGlossaryByBookId(client, bookId);
  if (!glossary?.content) {
    return { content: null };
  }
  return { content: JSON.stringify(glossary.content, null, 2) };
}

export async function deleteGlossaryAction(bookId: string) {
  await ensureAdmin();
  const client = createAdminClient();
  await deleteGlossary(client, bookId);
  revalidatePath('/admin/glossary');
  revalidatePath(`/admin/glossary/${bookId}`);
  return { ok: true };
}

export async function setFreeChaptersCountAction(count: number) {
  await ensureAdmin();
  const client = createAdminClient();
  await setFreeChaptersCount(client, Math.max(0, count));
  revalidatePath('/admin/settings');
  return { ok: true };
}

export async function setPaymentConfigAction(config: { paypal_client_id?: string; paypal_plan_id?: string; chapter_price_credits?: number; currency?: string }) {
  await ensureAdmin();
  const client = createAdminClient();
  await setPaymentConfig(client, config);
  revalidatePath('/admin/settings');
  return { ok: true };
}

export async function addCreditsToUserAction(userId: string, credits: number) {
  await ensureAdmin();
  const client = createAdminClient();
  const { data: existing } = await client.from('reader_profiles').select('credits').eq('user_id', userId).single();
  const current = ((existing as { credits?: number } | null)?.credits) ?? 0;
  const { error } = await client
    .from('reader_profiles')
    // @ts-expect-error - Supabase reader_profiles Insert type inference
    .upsert(
      { user_id: userId, credits: Math.max(0, current + credits) },
      { onConflict: 'user_id' }
    );
  if (error) return { error: error.message };
  revalidatePath('/admin/users');
  return { ok: true };
}

export async function getFeedbackMessagesAction() {
  await ensureAdmin();
  const client = createAdminClient();
  const { data, error } = await client
    .from('feedback_messages')
    .select('id, user_id, email, content, admin_reply, replied_at, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function replyFeedbackAction(id: string, adminReply: string) {
  await ensureAdmin();
  const client = createAdminClient();
  const reply = adminReply.trim();
  if (!reply) return { error: '请输入回复内容' };
  const { error } = await client
    .from('feedback_messages')
    // @ts-expect-error - feedback_messages Update type
    .update({ admin_reply: reply, replied_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/feedback');
  return { ok: true };
}
