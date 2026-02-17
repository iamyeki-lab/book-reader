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

export default async function AdminSettingsPage() {
  const email = await getCurrentAdminEmail();
  if (!email) redirect('/admin/login');

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

      <section className="rounded-lg border border-border p-6">
        <h2 className="mb-4 text-lg font-semibold">免费阅读章节</h2>
        <p className="mb-4 text-sm text-muted-foreground">每本书前 N 章免费，超出需登录并购买（书豆）</p>
        <form action={async (formData) => {
          'use server';
          const n = parseInt(formData.get('free_chapters') as string, 10);
          if (!isNaN(n)) await setFreeChaptersCountAction(n);
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
        <h2 className="mb-4 text-lg font-semibold">支付设置（PayPal + 书豆）</h2>
        <p className="mb-4 text-sm text-muted-foreground">PayPal 充值购买书豆，付费章节消耗书豆解锁</p>
        <form action={async (formData) => {
          'use server';
          await setPaymentConfigAction({
            paypal_client_id: (formData.get('paypal_client_id') as string) || '',
            chapter_price_credits: parseInt(formData.get('chapter_price_credits') as string, 10) || 10,
            currency: (formData.get('currency') as string) || 'USD',
          });
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
            <label className="mb-1 block text-sm">每章价格（书豆）</label>
            <input
              type="number"
              name="chapter_price_credits"
              defaultValue={paymentConfig.chapter_price_credits}
              min={1}
              className="w-24 rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">货币</label>
            <input name="currency" defaultValue={paymentConfig.currency} className="w-24 rounded border px-3 py-2" />
          </div>
          <button type="submit" className="rounded bg-primary px-4 py-2 text-primary-foreground">
            保存
          </button>
        </form>
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
