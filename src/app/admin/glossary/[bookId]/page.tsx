import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';
import { createClient } from '@/lib/supabase/server';
import { getBookById, getGlossaryByBookId } from '@/lib/supabase/queries';
import { GlossaryEditor } from './GlossaryEditor';

export const dynamic = 'force-dynamic';

export default async function AdminGlossaryBookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const email = await getCurrentAdminEmail();
  if (!email) redirect('/admin/login');

  const { bookId } = await params;
  const client = await createClient();
  let book;
  try {
    book = await getBookById(client, bookId);
  } catch {
    notFound();
  }

  const glossary = await getGlossaryByBookId(client, bookId);
  const initialContent = glossary?.content
    ? JSON.stringify(glossary.content, null, 2)
    : `{
  "names": {},
  "terms": {},
  "titles": {},
  "systems": {},
  "consistency_notes": []
}`;

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/glossary" className="text-muted-foreground hover:text-foreground">
          ← 返回
        </Link>
        <h1 className="text-2xl font-bold">术语表：{book.title}</h1>
      </div>
      <GlossaryEditor bookId={bookId} initialContent={initialContent} />
      <p className="mt-4 text-sm text-muted-foreground">
        格式说明：names（人名）、terms（功法/术语）、titles（称谓）、systems（体系）、consistency_notes（一致性说明）。每项为 key → value 键值对。保存时与已有内容增量合并，不整体覆盖。
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        术语与界面一致性规则详见：<a href="/admin/glossary/guide" className="text-primary underline hover:no-underline">《语言一致性规则指南》</a>（项目根目录 语言一致性规则指南.md）
      </p>
    </div>
  );
}
