import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';

export const dynamic = 'force-dynamic';

export default async function AdminGlossaryGuidePage() {
  const email = await getCurrentAdminEmail();
  if (!email) redirect('/admin/login');

  return (
    <div className="max-w-3xl prose prose-neutral dark:prose-invert">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/glossary" className="text-muted-foreground hover:text-foreground">
          ← 返回术语表
        </Link>
      </div>
      <h1 className="text-2xl font-bold">语言一致性规则指南</h1>
      <p className="text-muted-foreground">
        完整文档见项目根目录 <code className="rounded bg-muted px-1">语言一致性规则指南.md</code>。
      </p>
      <h2 className="mt-6 text-lg font-semibold">适用范围</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>源语言：英文（或中文）；目标语言：阿拉伯语、西语、英文等。</li>
        <li>目标：同一本书内人名、功法、境界、称谓、体系术语在全文译法唯一一致。</li>
      </ul>
      <h2 className="mt-6 text-lg font-semibold">一致性规则总则</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>一人一名、一功一译、一级一译；称谓与体系统一按 Glossary 的 titles / terms / systems。</li>
        <li>视角与时态在 consistency_notes 中约定，翻译与审校时遵守。</li>
      </ul>
      <h2 className="mt-6 text-lg font-semibold">Glossary 结构</h2>
      <p>
        names（人物）、terms（功法/境界）、titles（称谓）、systems（体系）、consistency_notes（一致性说明）。
        保存时与已有内容<strong>增量合并</strong>，不整体覆盖。
      </p>
    </div>
  );
}
