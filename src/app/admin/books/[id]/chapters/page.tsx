import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';
import { createClient } from '@/lib/supabase/server';
import { getBookById, getChaptersByBookId, getTranslationStatusByBookId } from '@/lib/supabase/queries';
import { deleteChapterAction } from '@/app/admin/actions';
import { SyncToFrontendButton } from '@/app/admin/SyncToFrontendButton';
import { Check, Minus } from 'lucide-react';

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
  const [chapters, translationStatus] = await Promise.all([
    getChaptersByBookId(client, id),
    getTranslationStatusByBookId(client, id),
  ]);

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

      {chapters.length > 0 && (
        <div className="mb-8 rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold">已翻译章节</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            各章节在数据库中的翻译状态（EN/ES/AR），翻译端同步后可刷新本页查看。
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-4 text-left font-medium">章节</th>
                  <th className="py-2 pr-4 text-left font-medium">标题</th>
                  <th className="w-16 py-2 text-center font-medium">EN</th>
                  <th className="w-16 py-2 text-center font-medium">ES</th>
                  <th className="w-16 py-2 text-center font-medium">AR</th>
                </tr>
              </thead>
              <tbody>
                {translationStatus.map((s) => (
                  <tr key={s.chapter_id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{s.chapter_number}</td>
                    <td className="max-w-[200px] truncate py-2 pr-4" title={s.title}>{s.title}</td>
                    <td className="py-2 text-center">{s.en ? <Check className="inline h-4 w-4 text-green-600" /> : <Minus className="inline h-4 w-4 text-muted-foreground" />}</td>
                    <td className="py-2 text-center">{s.es ? <Check className="inline h-4 w-4 text-green-600" /> : <Minus className="inline h-4 w-4 text-muted-foreground" />}</td>
                    <td className="py-2 text-center">{s.ar ? <Check className="inline h-4 w-4 text-green-600" /> : <Minus className="inline h-4 w-4 text-muted-foreground" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
