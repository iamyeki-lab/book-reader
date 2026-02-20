import { redirect } from 'next/navigation';
import { getCurrentAdminEmail } from '@/lib/supabase/auth-admin';
import { createClient } from '@/lib/supabase/server';
import {
  getEnabledLocales,
  getLandingSlogan,
  getTrendingSubtitle,
  getFreeChaptersCount,
  getPaymentConfig,
} from '@/lib/supabase/queries';
import {
  setEnabledLocalesAction,
  setLandingSlogansAction,
  setTrendingSubtitlesAction,
  setFreeChaptersCountAction,
  setPaymentConfigAction,
} from '@/app/admin/actions';
import { SettingsToast } from '@/components/SettingsToast';

export default async function AdminSettingsPage(props: { searchParams: Promise<{ toast?: string }> }) {
  const email = await getCurrentAdminEmail();
  if (!email) redirect('/admin/login');

  const searchParams = await props.searchParams;
  const toast = searchParams?.toast;

  const client = await createClient();
  const [locales, sloganEn, sloganEs, sloganAr, trendingEn, trendingEs, trendingAr, freeChapters, paymentConfig] =
    await Promise.all([
      getEnabledLocales(client),
      getLandingSlogan(client, 'en'),
      getLandingSlogan(client, 'es'),
      getLandingSlogan(client, 'ar'),
      getTrendingSubtitle(client, 'en'),
      getTrendingSubtitle(client, 'es'),
      getTrendingSubtitle(client, 'ar'),
      getFreeChaptersCount(client),
      getPaymentConfig(client),
    ]);

  return (
    <div className="max-w-2xl space-y-12">
      <h1 className="mb-6 text-2xl font-bold">站点设置</h1>
      <SettingsToast toast={toast} />

      <section className="rounded-lg border border-border p-6">
        <h2 className="mb-4 text-lg font-semibold">免费阅读章节</h2>
        <p className="mb-4 text-sm text-muted-foreground">每本书前 N 章免费，第 N 章末尾显示订阅按钮；超出需订阅（PayPal）解锁</p>
        <form action={async (formData) => {
          'use server';
          const n = parseInt(formData.get('free_chapters') as string, 10);
          if (!isNaN(n)) await setFreeChaptersCountAction(n);
          redirect('/admin/settings?toast=free_chapters');
        }} className="flex items-end gap-4">
          <div>
            <label className="mb-1 block text-sm">免费章节数</label>
            <input
              type="number"
              name="free_chapters"
              defaultValue={freeChapters}
              min={0}
              className="w-24 rounded border px-3 py-2"
            />
          </div>
          <button type="submit" className="rounded bg-primary px-4 py-2 text-primary-foreground">
            保存
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-border p-6">
        <h2 className="mb-4 text-lg font-semibold">订阅设置</h2>
        <p className="mb-4 text-sm text-muted-foreground">免费 N 章后需订阅解锁；PayPal Client ID 与订阅 Plan ID 用于阅读页订阅按钮。</p>
        <form action={async (formData) => {
          'use server';
          await setPaymentConfigAction({
            paypal_client_id: (formData.get('paypal_client_id') as string) || '',
            paypal_plan_id: (formData.get('paypal_plan_id') as string) || '',
          });
          redirect('/admin/settings?toast=subscription');
        }} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm">PayPal Client ID</label>
            <input
              name="paypal_client_id"
              defaultValue={paymentConfig.paypal_client_id}
              placeholder="PayPal REST API Client ID"
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">PayPal 订阅 Plan ID</label>
            <input
              name="paypal_plan_id"
              defaultValue={paymentConfig.paypal_plan_id}
              placeholder="P-xxxxxxxxxx"
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <button type="submit" className="rounded bg-primary px-4 py-2 text-primary-foreground">
            保存
          </button>
        </form>
        <div className="mt-6 rounded border border-amber-500/40 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
          <strong>书豆功能暂时关闭。</strong> 单章书豆购买暂未开放，当前仅支持订阅解锁全书。
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">启用语言</h2>
        <form action={async (formData) => {
          'use server';
          const en = formData.get('locale_en') === 'on';
          const es = formData.get('locale_es') === 'on';
          const ar = formData.get('locale_ar') === 'on';
          const list: string[] = [];
          if (en) list.push('en');
          if (es) list.push('es');
          if (ar) list.push('ar');
          await setEnabledLocalesAction(list);
          redirect('/admin/settings?toast=locales');
        }} className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="locale_en" defaultChecked={locales.includes('en')} />
            英文
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="locale_es" defaultChecked={locales.includes('es')} />
            西语
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="locale_ar" defaultChecked={locales.includes('ar')} />
            阿语
          </label>
          <button type="submit" className="rounded bg-primary px-4 py-2 text-primary-foreground">
            保存
          </button>
        </form>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">首页副标题（Slogan）</h2>
        <form action={async (formData) => {
          'use server';
          await setLandingSlogansAction({
            en: (formData.get('slogan_en') as string) || '',
            es: (formData.get('slogan_es') as string) || '',
            ar: (formData.get('slogan_ar') as string) || '',
          });
          redirect('/admin/settings?toast=slogan');
        }} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm">EN</label>
            <input name="slogan_en" defaultValue={sloganEn || ''} className="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm">ES</label>
            <input name="slogan_es" defaultValue={sloganEs || ''} className="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm">AR</label>
            <input name="slogan_ar" defaultValue={sloganAr || ''} className="w-full rounded border px-3 py-2" dir="rtl" />
          </div>
          <button type="submit" className="rounded bg-primary px-4 py-2 text-primary-foreground">
            保存
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-border p-6">
        <h2 className="mb-4 text-lg font-semibold">书籍区副标题（推广语言，如 TRENDING IN LATAM）</h2>
        <form action={async (formData) => {
          'use server';
          await setTrendingSubtitlesAction({
            en: (formData.get('trending_en') as string) || '',
            es: (formData.get('trending_es') as string) || '',
            ar: (formData.get('trending_ar') as string) || '',
          });
          redirect('/admin/settings?toast=trending');
        }} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm">EN</label>
            <input name="trending_en" defaultValue={trendingEn || ''} placeholder="e.g. TRENDING NOW" className="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm">ES</label>
            <input name="trending_es" defaultValue={trendingEs || ''} placeholder="e.g. TRENDING IN LATAM" className="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm">AR</label>
            <input name="trending_ar" defaultValue={trendingAr || ''} placeholder="e.g. الأكثر مبيعاً" className="w-full rounded border px-3 py-2" dir="rtl" />
          </div>
          <button type="submit" className="rounded bg-primary px-4 py-2 text-primary-foreground">
            保存
          </button>
        </form>
      </section>
    </div>
  );
}
