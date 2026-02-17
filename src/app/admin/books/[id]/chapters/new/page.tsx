import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';
import { createClient } from '@/lib/supabase/server';
import { getBookById, getChaptersByBookId } from '@/lib/supabase/queries';
import { createChapterAction } from '@/app/admin/actions';

export default async function NewChapterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const email = await getCurrentAdminEmail();
  if (!email) redirect('/admin/login');

  const { id } = await params;
  const client = await createClient();
  let book;
  try {
    book = await getBookById(client, id);
  } catch {
    notFound();
  }
  const chapters = await getChaptersByBookId(client, id);
  const nextNum = chapters.length > 0 ? Math.max(...chapters.map((c) => c.chapter_number)) + 1 : 1;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">添加章节：{book.title}</h1>
      <form action={createChapterAction.bind(null, id)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm">章节号</label>
          <input name="chapter_number" type="number" defaultValue={nextNum} required className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm">标题</label>
          <input name="title" required className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm">正文</label>
          <textarea name="content" rows={20} required className="w-full rounded border px-3 py-2 font-mono text-sm" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="rounded bg-primary px-4 py-2 text-primary-foreground">
            创建
          </button>
          <Link href={`/admin/books/${id}/chapters`} className="rounded border px-4 py-2">取消</Link>
        </div>
      </form>
    </div>
  );
}
