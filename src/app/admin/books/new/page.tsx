import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';
import { createBookAction } from '../../actions';

export default async function NewBookPage() {
  const email = await getCurrentAdminEmail();
  if (!email) redirect('/admin/login');

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">添加书籍</h1>
      <form action={createBookAction} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm">书名</label>
          <input name="title" required className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm">作者</label>
          <input name="author" required className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm">分类/流派（Genre）</label>
          <input name="genre" placeholder="e.g. XIANXIA, ROMANCE" className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm">简介（默认/回退）</label>
          <textarea name="description" rows={2} placeholder="无多语言时使用" className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm">简介（英文）</label>
          <textarea name="description_en" rows={2} className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm">简介（西语）</label>
          <textarea name="description_es" rows={2} className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm">简介（阿语）</label>
          <textarea name="description_ar" rows={2} className="w-full rounded border px-3 py-2" dir="rtl" />
        </div>
        <div>
          <label className="mb-1 block text-sm">书名（英文）</label>
          <input name="title_en" className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm">书名（西语）</label>
          <input name="title_es" className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm">书名（阿语）</label>
          <input name="title_ar" className="w-full rounded border px-3 py-2" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="rounded bg-primary px-4 py-2 text-primary-foreground">
            创建
          </button>
          <Link href="/admin/books" className="rounded border px-4 py-2">取消</Link>
        </div>
      </form>
    </div>
  );
}
