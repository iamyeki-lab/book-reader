'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { SimpleNav } from '@/components/SimpleNav';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AuthPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'en';
  const t = useTranslations('auth');
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (tab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setMessage({ type: 'error', text: error.message });
        else {
          setMessage({ type: 'success', text: t('signedInSuccess', { defaultValue: 'Signed in successfully' }) });
          router.refresh();
          setTimeout(() => router.push(`/${locale}/profile`), 800);
        }
      } else {
        const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });
        if (error) setMessage({ type: 'error', text: error.message });
        else setMessage({ type: 'success', text: t('signUpSuccess', { defaultValue: 'Check your email to confirm sign up' }) });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <SimpleNav locale={locale} />
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setTab('login'); setMessage(null); }}
              className={cn(
                'flex-1 min-h-[44px] py-2 text-sm font-medium rounded-md transition-colors touch-manipulation',
                tab === 'login'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              {t('signIn')}
            </button>
            <button
              type="button"
              onClick={() => { setTab('signup'); setMessage(null); }}
              className={cn(
                'flex-1 min-h-[44px] py-2 text-sm font-medium rounded-md transition-colors touch-manipulation',
                tab === 'signup'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              {t('signUp')}
            </button>
          </div>
        <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="sr-only">{tab === 'login' ? t('signIn') : t('signUp')}</h1>
        <div>
          <label className="mb-1 block text-sm text-slate-300">{t('email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">{t('password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>
        {message && (
          <p className={cn('text-sm', message.type === 'error' ? 'text-red-400' : 'text-amber-400')}>
            {message.text}
          </p>
        )}
        <Button type="submit" disabled={loading} className="w-full min-h-[44px] bg-amber-500 text-slate-950 hover:bg-amber-400 touch-manipulation">
          {loading ? '...' : (tab === 'login' ? t('signIn') : t('signUp'))}
        </Button>
        </form>
        </div>
      </div>
    </div>
  );
}
