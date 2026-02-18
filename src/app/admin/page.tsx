import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { SyncToFrontendButton } from './SyncToFrontendButton';
import {
  Users,
  BookOpen,
  CreditCard,
  TrendingUp,
  MessageSquare,
  FileText,
  Library,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function startOfDay(d: Date): string {
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function startOfMonth(d: Date): string {
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function startOfYear(d: Date): string {
  d.setMonth(0, 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function AdminDashboardPage() {
  let email: string | null = null;
  try {
    email = await getCurrentAdminEmail();
  } catch {
    redirect('/admin/login');
  }
  if (!email) redirect('/admin/login');

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error('Admin createAdminClient:', e);
    redirect('/admin/login');
  }

  const now = new Date();
  const dayStart = startOfDay(new Date(now.getTime()));
  const monthStart = startOfMonth(new Date(now.getTime()));
  const yearStart = startOfYear(new Date(now.getTime()));

  let users: { email?: string; created_at?: string }[] = [];
  let adminEmails = new Set<string>();
  let books: { id: string; title: string; published: boolean }[] = [];
  let chaptersCount = 0;
  let translationsCount = 0;
  let purchases: { book_id: string; credits_spent: number; created_at: string }[] = [];
  let feedbackList: { id: string; admin_reply: string | null }[] = [];

  try {
    const [
      usersRes,
      adminEmailsRes,
      booksRes,
      chaptersRes,
      translationsRes,
      purchasesRes,
      feedbackRes,
    ] = await Promise.all([
      Promise.resolve(admin.auth.admin.listUsers({ perPage: 1000 })).catch(() => ({ data: { users: [] } })),
      Promise.resolve(admin.from('admin_users').select('email')).catch(() => ({ data: [] })),
      Promise.resolve(admin.from('books').select('id, title, published').eq('published', true)).catch(() => ({ data: [] })),
      Promise.resolve(admin.from('chapters').select('id', { count: 'exact', head: true })).catch(() => ({ count: 0 })),
      Promise.resolve(admin.from('translations').select('id', { count: 'exact', head: true })).catch(() => ({ count: 0 })),
      Promise.resolve(admin.from('chapter_purchases').select('book_id, credits_spent, created_at')).catch(() => ({ data: [] })),
      Promise.resolve(admin.from('feedback_messages').select('id, admin_reply')).catch(() => ({ data: [] })),
    ]);

    users = usersRes.data?.users ?? [];
    adminEmails = new Set(
      (adminEmailsRes.data ?? []).map((a: { email?: string }) => a.email).filter((e): e is string => Boolean(e))
    );
    books = (booksRes.data ?? []) as { id: string; title: string; published: boolean }[];
    chaptersCount = chaptersRes.count ?? 0;
    translationsCount = translationsRes.count ?? 0;
    purchases = (purchasesRes.data ?? []) as {
      book_id: string;
      credits_spent: number;
      created_at: string;
    }[];
    feedbackList = (feedbackRes.data ?? []) as { id: string; admin_reply: string | null }[];
  } catch (e) {
    console.error('Admin dashboard data fetch error:', e);
  }

  const readers = users.filter((u) => !adminEmails.has(u.email ?? ''));
  const bookMap = new Map(books.map((b) => [b.id, b.title]));

  const readersToday = readers.filter((u) => u.created_at && u.created_at >= dayStart).length;
  const readersThisMonth = readers.filter((u) => u.created_at && u.created_at >= monthStart).length;
  const readersThisYear = readers.filter((u) => u.created_at && u.created_at >= yearStart).length;

  const totalCreditsSpent = purchases.reduce((s, p) => s + p.credits_spent, 0);
  const purchasesToday = purchases.filter((p) => p.created_at >= dayStart).length;
  const purchasesThisMonth = purchases.filter((p) => p.created_at >= monthStart).length;
  const purchasesThisYear = purchases.filter((p) => p.created_at >= yearStart).length;
  const creditsToday = purchases
    .filter((p) => p.created_at >= dayStart)
    .reduce((s, p) => s + p.credits_spent, 0);
  const creditsThisMonth = purchases
    .filter((p) => p.created_at >= monthStart)
    .reduce((s, p) => s + p.credits_spent, 0);
  const creditsThisYear = purchases
    .filter((p) => p.created_at >= yearStart)
    .reduce((s, p) => s + p.credits_spent, 0);

  const bookPurchaseCount = new Map<string, number>();
  const bookCreditsMap = new Map<string, number>();
  for (const p of purchases) {
    bookPurchaseCount.set(p.book_id, (bookPurchaseCount.get(p.book_id) ?? 0) + 1);
    bookCreditsMap.set(p.book_id, (bookCreditsMap.get(p.book_id) ?? 0) + p.credits_spent);
  }
  const topBooksByPurchases = Array.from(bookPurchaseCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, count]) => ({ bookId: id, title: bookMap.get(id) ?? '(未知)', count }));

  const pendingFeedback = feedbackList.filter((f) => !f.admin_reply).length;

  const statCards = [
    {
      title: '读者总数',
      value: readers.length,
      sub: `今日 +${readersToday} / 本月 +${readersThisMonth} / 今年 +${readersThisYear}`,
      icon: Users,
      href: '/admin/users',
    },
    {
      title: '书豆消费',
      value: totalCreditsSpent,
      sub: `今日 ${creditsToday} / 本月 ${creditsThisMonth} / 今年 ${creditsThisYear}`,
      icon: CreditCard,
    },
    {
      title: '章节购买笔数',
      value: purchases.length,
      sub: `今日 ${purchasesToday} / 本月 ${purchasesThisMonth} / 今年 ${purchasesThisYear}`,
      icon: TrendingUp,
    },
    {
      title: '已发布书籍',
      value: books.length,
      sub: '在前台展示的书籍',
      icon: BookOpen,
      href: '/admin/books',
    },
    {
      title: '章节数',
      value: chaptersCount,
      sub: '全站章节',
      icon: FileText,
    },
    {
      title: '翻译条数',
      value: translationsCount,
      sub: '全站翻译',
      icon: Library,
    },
    {
      title: '待回复留言',
      value: pendingFeedback,
      sub: pendingFeedback > 0 ? '点击处理' : '暂无',
      icon: MessageSquare,
      href: '/admin/feedback',
    },
  ];

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">管理后台</h1>
        <SyncToFrontendButton />
      </div>
      <p className="text-muted-foreground">
        管理书籍、章节与站点设置。修改内容后点击「同步到网页端」刷新读者可见内容。
      </p>

      <section>
        <h2 className="mb-4 text-lg font-semibold">数据概览</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => {
            const Icon = card.icon;
            const content = (
              <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{card.title}</span>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="mt-2 text-2xl font-bold">{card.value.toLocaleString()}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
              </div>
            );
            return card.href ? (
              <Link key={card.title} href={card.href} className="block transition-opacity hover:opacity-90">
                {content}
              </Link>
            ) : (
              <div key={card.title}>{content}</div>
            );
          })}
        </div>
      </section>

      {topBooksByPurchases.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">最受欢迎书籍（按章节购买次数）</h2>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">排名</th>
                  <th className="px-4 py-3 text-left font-medium">书名</th>
                  <th className="px-4 py-3 text-right font-medium">购买次数</th>
                  <th className="px-4 py-3 text-right font-medium">书豆消费</th>
                </tr>
              </thead>
              <tbody>
                {topBooksByPurchases.map((row, i) => (
                  <tr key={row.bookId} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/books/${row.bookId}/edit`}
                        className="text-primary hover:underline"
                      >
                        {row.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">{row.count}</td>
                    <td className="px-4 py-3 text-right">
                      {(bookCreditsMap.get(row.bookId) ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
