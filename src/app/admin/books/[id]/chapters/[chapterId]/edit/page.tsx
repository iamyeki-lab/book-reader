import { redirect, notFound } from 'next/navigation';
import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';
import { createClient } from '@/lib/supabase/server';
import { getBookById, getChapterById, getChaptersByBookId, getTranslation } from '@/lib/supabase/queries';
import { ChapterEditor } from '../ChapterEditor';

export default async function EditChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const email = await getCurrentAdminEmail();
  if (!email) redirect('/admin/login');

  const { id, chapterId } = await params;
  const client = await createClient();
  let book;
  let chapter;
  try {
    book = await getBookById(client, id);
    chapter = await getChapterById(client, chapterId);
  } catch {
    notFound();
  }
  if (chapter.book_id !== id) notFound();

  const chapters = await getChaptersByBookId(client, id);
  const currentIndex = chapters.findIndex((c) => c.id === chapterId);
  const prevChapterId = currentIndex > 0 ? chapters[currentIndex - 1].id : null;
  const nextChapterId = currentIndex >= 0 && currentIndex < chapters.length - 1 ? chapters[currentIndex + 1].id : null;

  const [tEn, tEs, tAr] = await Promise.all([
    getTranslation(client, chapterId, 'en'),
    getTranslation(client, chapterId, 'es'),
    getTranslation(client, chapterId, 'ar'),
  ]);

  const initialTranslations = {
    en: tEn ? { translated_title: tEn.translated_title, translated_content: tEn.translated_content } : null,
    es: tEs ? { translated_title: tEs.translated_title, translated_content: tEs.translated_content } : null,
    ar: tAr ? { translated_title: tAr.translated_title, translated_content: tAr.translated_content } : null,
  };

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">编辑章节：{book.title}</h1>
      <ChapterEditor
        chapterId={chapterId}
        bookId={id}
        initialChapter={{
          chapter_number: chapter.chapter_number,
          title: chapter.title,
          content: chapter.content,
        }}
        initialTranslations={initialTranslations}
        prevChapterId={prevChapterId}
        nextChapterId={nextChapterId}
      />
      <p className="mt-4 text-sm text-muted-foreground">
        同步前会对比数据库内容，如有不同将提示是否覆盖。支持编辑原文(中文)及英/西/阿三语翻译。
      </p>
    </div>
  );
}
