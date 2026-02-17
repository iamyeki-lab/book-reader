import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';
import { createClient } from '@/lib/supabase/server';
import { getBooks } from '@/lib/supabase/queries';
import { getGlossaryByBookId } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

function countByLang(content: Record<string, unknown>): { en: number; es: number; ar: number } {
  const c = { en: 0, es: 0, ar: 0 };
  for (const key of ['names', 'terms', 'titles', 'systems']) {
    const obj = content[key];
    if (typeof obj !== 'object' || obj === null) continue;
    for (const v of Object.values(obj)) {
      if (typeof v === 'string') c.ar++;
      else if (typeof v === 'object' && v !== null) {
        const o = v as Record<string, unknown>;
        if (typeof o.en === 'string') c.en++;
        if (typeof o.es === 'string') c.es++;
        if (typeof o.ar === 'string') c.ar++;
      }
    }
  }
  return c;
}

export default async function AdminGlossaryPage() {
  const email = await getCurrentAdminEmail();
  if (!email) redirect('/admin/login');

  const client = await createClient();
  const books = await getBooks(client);

  const withGlossary = await Promise.all(
    books.map(async (b) => {
      const g = await getGlossaryByBookId(client, b.id);
      const content = g?.content as Record<string, unknown> | undefined;
      const stats = content ? countByLang(content) : null;
      return { book: b, hasGlossary: !!g, stats };
    })
  );

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">术语表管理</h1>
      <p className="mb-6 text-muted-foreground">
        每本书可维护一份术语表（names, terms, titles, systems, consistency_notes），供 novel-translator 翻译时保持术语一致。支持同步到数据库与分语种统计。
        <span className="block mt-2 text-amber-700 dark:text-amber-400">增量更新：保存时与已有内容合并，不整体覆盖。</span>
      </p>
      <div className="rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">书名</th>
              <th className="px-4 py-3 text-left text-sm font-medium">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium">语种统计</th>
              <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {withGlossary.map(({ book, hasGlossary, stats }) => (
              <tr key={book.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">{book.title}</td>
                <td className="px-4 py-3">
                  <span className={hasGlossary ? 'text-green-600' : 'text-muted-foreground'}>
                    {hasGlossary ? '已配置' : '未配置'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {stats ? (
                    <span className="text-muted-foreground">
                      EN {stats.en} · ES {stats.es} · AR {stats.ar}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/glossary/${book.id}`}
                    className="text-primary hover:underline text-sm"
                  >
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
