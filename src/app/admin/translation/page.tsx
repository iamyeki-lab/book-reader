import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';
import { createClient } from '@/lib/supabase/server';
import { getBooks } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

export default async function AdminTranslationPage() {
  const email = await getCurrentAdminEmail();
  if (!email) redirect('/admin/login');

  const client = await createClient();
  const books = await getBooks(client);

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">翻译管理</h1>
      <p className="mb-6 text-muted-foreground">
        翻译工作通过本地运行的 <code>novel-translator</code> 工具完成，并写入数据库。Web 端仅从数据库读取展示，避免占用服务器资源。
      </p>
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-2 font-semibold">本地翻译端链接</h2>
          <p className="text-sm text-muted-foreground mb-2">
            启动本地翻译助手（默认端口 5001）：
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
          <h2 className="mb-2 font-semibold">书籍列表（{books.length} 本）</h2>
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
