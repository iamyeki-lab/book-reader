import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';
import { createClient } from '@/lib/supabase/server';
import { getBooks } from '@/lib/supabase/queries';
import type { BookRow } from '@/lib/supabase/types';
import { DeleteBookButton } from './DeleteBookButton';

function getBookLangs(book: BookRow): string[] {
  const langs: string[] = [];
  if (book.title_en || book.description_en || book.cover_url_en) langs.push('EN');
  if (book.title_es || book.description_es || book.cover_url_es) langs.push('ES');
  if (book.title_ar || book.description_ar || book.cover_url_ar) langs.push('AR');
  return langs.length ? langs : ['默认'];
}

export default async function AdminBooksPage() {
  const email = await getCurrentAdminEmail();
  if (!email) redirect('/admin/login');

  const client = await createClient();
  const books = await getBooks(client);

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">书籍管理</h1>
        <Link href="/admin/books/new" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          添加书籍
        </Link>
      </div>
      <ul className="space-y-2">
        {books.map((b) => (
          <li key={b.id} className="flex items-center justify-between rounded border p-4">
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/books/${b.id}/edit`} className="font-semibold hover:underline">
                  {b.title}
                </Link>
                <span className="text-xs text-muted-foreground">
                  （{getBookLangs(b).join('、')}）
                </span>
                {b.published && (
                  <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">已发布</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{b.author}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/admin/books/${b.id}/chapters`} className="text-sm text-primary hover:underline">
                章节
              </Link>
              <DeleteBookButton bookId={b.id} variant="link" />
            </div>
          </li>
        ))}
      </ul>
      {books.length === 0 && <p className="text-muted-foreground">暂无书籍。</p>}
    </div>
  );
}
