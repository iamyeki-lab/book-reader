import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';
import { createClient } from '@/lib/supabase/server';
import { getBookById, getChaptersByBookId } from '@/lib/supabase/queries';
import { deleteChapterAction } from '@/app/admin/actions';
import { SyncToFrontendButton } from '@/app/admin/SyncToFrontendButton';

export default async function ChaptersPage({
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

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">章节：{book.title}</h1>
        <div className="flex items-center gap-2">
          <SyncToFrontendButton bookId={id} />
          <Link href={`/admin/books/${id}/chapters/new`} className="rounded bg-primary px-4 py-2 text-primary-foreground">
            添加章节
          </Link>
        </div>
      </div>

      <h2 className="mb-3 text-lg font-semibold">章节列表</h2>
      <ul className="space-y-2">
        {chapters.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded border p-4">
            <div>
              <span className="font-medium">{c.chapter_number}. {c.title}</span>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/books/${id}/chapters/${c.id}/edit`} className="text-sm text-primary hover:underline">
                编辑
              </Link>
              <form action={deleteChapterAction.bind(null, c.id, id)} className="inline">
                <button type="submit" className="text-sm text-destructive hover:underline">
                  删除
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      {chapters.length === 0 && <p className="text-muted-foreground">暂无章节。</p>}
    </div>
  );
}
