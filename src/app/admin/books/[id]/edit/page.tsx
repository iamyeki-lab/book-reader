import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';
import { createClient } from '@/lib/supabase/server';
import { getBookById } from '@/lib/supabase/queries';
import { updateBookAction, mergeBookAction, publishBookAction } from '../../../actions';
import { SyncToFrontendButton } from '@/app/admin/SyncToFrontendButton';
import { DeleteBookButton } from '../../DeleteBookButton';
import { CoverUploadForm } from '../CoverUploadForm';

export default async function EditBookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ merged?: string; saved?: string; published?: string; unpublished?: string }>;
}) {
  const email = await getCurrentAdminEmail();
  if (!email) redirect('/admin/login');

  const { id } = await params;
  const { merged, saved, published, unpublished } = await searchParams;
  const client = await createClient();
  let book;
  try {
    book = await getBookById(client, id);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">编辑书籍</h1>
        <SyncToFrontendButton bookId={id} />
      </div>
      {(merged != null || saved || published || unpublished) && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800"
        >
          {merged != null && <p className="font-medium">✓ 合并成功：已合并 {merged} 条翻译</p>}
          {saved && <p className="font-medium">✓ 已保存</p>}
          {published && <p className="font-medium">✓ 已发布，书籍现已在探索页展示</p>}
          {unpublished && <p className="font-medium">✓ 已取消发布，书籍不再展示</p>}
        </div>
      )}
      <div className="mb-4 rounded border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        <strong>书籍需包含以下语言的元信息</strong>（至少一种，供不同语言用户查看）：
        默认/回退、<strong>英文</strong>、<strong>西语</strong>、<strong>阿语</strong>（书名、简介、封面）
      </div>
      <form action={updateBookAction.bind(null, id)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm">书名</label>
          <input name="title" defaultValue={book.title} required className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm">作者</label>
          <input name="author" defaultValue={book.author} required className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm">分类/流派（Genre）</label>
          <input name="genre" defaultValue={book.genre || ''} placeholder="e.g. XIANXIA, ROMANCE" className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm">免费章数（本书覆盖）</label>
          <input
            name="free_chapters_override"
            type="number"
            min={0}
            defaultValue={book.free_chapters_override ?? ''}
            placeholder="留空使用全局设置"
            className="w-full rounded border px-3 py-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">留空则使用站点设置的全局免费章数</p>
        </div>
        <div>
          <label className="mb-1 block text-sm">简介（默认/回退）</label>
          <textarea name="description" defaultValue={book.description || ''} rows={2} placeholder="无多语言时使用" className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm">简介（英文）</label>
          <textarea name="description_en" defaultValue={book.description_en || ''} rows={2} className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm">简介（西语）</label>
          <textarea name="description_es" defaultValue={book.description_es || ''} rows={2} className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm">简介（阿语）</label>
          <textarea name="description_ar" defaultValue={book.description_ar || ''} rows={2} className="w-full rounded border px-3 py-2" dir="rtl" />
        </div>
        <div>
          <label className="mb-1 block text-sm">书名（英文）</label>
          <input name="title_en" defaultValue={book.title_en || book.title} className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm">书名（西语）</label>
          <input name="title_es" defaultValue={book.title_es || ''} className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm">书名（阿语）</label>
          <input name="title_ar" defaultValue={book.title_ar || ''} className="w-full rounded border px-3 py-2" />
        </div>
        <div className="border-t pt-6 space-y-4">
          <h3 className="font-semibold">封面上传</h3>
          <CoverUploadForm bookId={id} lang="en" label="封面（英文）" />
          <CoverUploadForm bookId={id} lang="es" label="封面（西语）" />
          <CoverUploadForm bookId={id} lang="ar" label="封面（阿语）" />
          {(book.cover_url_en || book.cover_url_es || book.cover_url_ar) && (
            <div className="flex gap-4 mt-2">
              {book.cover_url_en && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">英文</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={book.cover_url_en} alt="" className="h-24 rounded object-cover" />
                </div>
              )}
              {book.cover_url_es && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">西语</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={book.cover_url_es} alt="" className="h-24 rounded object-cover" />
                </div>
              )}
              {book.cover_url_ar && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">阿语</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={book.cover_url_ar} alt="" className="h-24 rounded object-cover" />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="rounded bg-primary px-4 py-2 text-primary-foreground">
              保存
            </button>
            <Link href="/admin/books" className="rounded border px-4 py-2">取消</Link>
          </div>
        </div>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {!book.published ? (
          <form action={publishBookAction.bind(null, id, true)}>
            <button type="submit" className="rounded border border-green-600 bg-green-600 px-4 py-2 text-white hover:bg-green-700">
              发布
            </button>
          </form>
        ) : (
          <form action={publishBookAction.bind(null, id, false)}>
            <button type="submit" className="rounded border border-amber-600 px-4 py-2 text-amber-700 hover:bg-amber-50">
              取消发布
            </button>
          </form>
        )}
      </div>
      <div className="mt-6 border-t pt-6">
        <h3 className="font-semibold mb-2">合并翻译</h3>
        <p className="text-sm text-muted-foreground mb-3">
          将另一本书的翻译合并到本书（按章节号匹配，不会覆盖已有翻译）
        </p>
        <form action={mergeBookAction.bind(null, id)} className="flex gap-2">
          <input
            type="text"
            name="sourceBookId"
            placeholder="源书籍 UUID（要合并过来的书）"
            required
            className="flex-1 rounded border px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded border border-primary px-4 py-2 text-sm text-primary hover:bg-primary/10">
            合并
          </button>
        </form>
      </div>
      <div className="mt-4 flex justify-end">
        <DeleteBookButton bookId={id} variant="button" />
      </div>
    </div>
  );
}
