import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';
import { createClient } from '@/lib/supabase/server';
import { getBooks, getBookById, getTranslationStatusByBookId } from '@/lib/supabase/queries';
import { Check, Minus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminTranslationPage({
  searchParams,
}: {
  searchParams: Promise<{ bookId?: string }>;
}) {
  const email = await getCurrentAdminEmail();
  if (!email) redirect('/admin/login');

  const { bookId } = await searchParams;
  const client = await createClient();
  const books = await getBooks(client);

  let book: Awaited<ReturnType<typeof getBookById>> | null = null;
  let translationStatus: Awaited<ReturnType<typeof getTranslationStatusByBookId>> = [];

  if (bookId) {
    try {
      book = await getBookById(client, bookId);
      translationStatus = await getTranslationStatusByBookId(client, bookId);
    } catch {
      notFound();
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">翻译管理</h1>
      <p className="mb-6 text-muted-foreground">
        翻译工作通过本地或服务器上的 <code>novel-translator</code> 工具完成，并写入数据库。此处可查看各书籍的已翻译章节状态。
      </p>
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-2 font-semibold">本地/服务器翻译端链接</h2>
          <p className="text-sm text-muted-foreground mb-2">
            启动翻译助手（默认端口 5001）：
          </p>
          <a
            href="http://localhost:5001"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            http://localhost:5001
          </a>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 font-semibold">已翻译章节</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            选择书籍查看各章节在数据库中的翻译状态（EN/ES/AR），翻译端同步后可刷新查看。
          </p>
          {!bookId ? (
            <ul className="space-y-1 text-sm">
              {books.length === 0 ? (
                <li className="text-muted-foreground">暂无书籍</li>
              ) : (
                books.slice(0, 50).map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/admin/translation?bookId=${b.id}`}
                      className="text-primary hover:underline"
                    >
                      {b.title}
                    </Link>
                  </li>
                ))
              )}
              {books.length > 50 && (
                <p className="mt-2 text-xs text-muted-foreground">…共 {books.length} 本</p>
              )}
            </ul>
          ) : book && (
            <>
              <div className="mb-3 flex items-center gap-2">
                <span className="font-medium">{book.title}</span>
                <Link href="/admin/translation" className="text-sm text-primary hover:underline">
                  更换书籍
                </Link>
              </div>
              {translationStatus.length === 0 ? (
                <p className="text-sm text-muted-foreground">该书暂无章节或翻译记录。</p>
              ) : (
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
              )}
            </>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-2 font-semibold">书籍管理（{books.length} 本）</h2>
          <ul className="space-y-1 text-sm">
            {books.slice(0, 20).map((b) => (
              <li key={b.id}>
                <Link
                  href={`/admin/books/${b.id}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {b.title}
                </Link>
              </li>
            ))}
          </ul>
          {books.length > 20 && (
            <p className="mt-2 text-xs text-muted-foreground">…共 {books.length} 本</p>
          )}
        </div>
      </div>
    </div>
  );
}
