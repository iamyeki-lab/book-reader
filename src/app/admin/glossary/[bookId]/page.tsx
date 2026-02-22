import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';
import { createClient } from '@/lib/supabase/server';
import { getBookById, getGlossaryByBookId, getGlossaryPendingByBookId } from '@/lib/supabase/queries';
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

  const pending = await getGlossaryPendingByBookId(client, bookId);
  const initialPendingContent =
    pending?.content && typeof pending.content === 'object' && Object.keys(pending.content as object).length > 0
      ? JSON.stringify(pending.content, null, 2)
      : null;

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/glossary" className="text-muted-foreground hover:text-foreground">
          ← 返回
        </Link>
        <h1 className="text-2xl font-bold">术语表：{book.title}</h1>
      </div>
      <GlossaryEditor bookId={bookId} initialContent={initialContent} initialPendingContent={initialPendingContent} />
      <p className="mt-4 text-sm text-muted-foreground">
        表一为翻译使用的标准术语表，可手动修改。表二由翻译端按章节进度发现的新术语自动写入（或每 N 章批量写入），可在后台编辑后点击「合并到表一」并入主表并清空表二。格式：names、terms、titles、systems、consistency_notes。
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        术语与界面一致性规则详见：<a href="/admin/glossary/guide" className="text-primary underline hover:no-underline">《语言一致性规则指南》</a>（项目根目录 语言一致性规则指南.md）
      </p>
    </div>
  );
}
