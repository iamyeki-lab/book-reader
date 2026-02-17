'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { X } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'signup';
}

export function AuthModal({ open, onOpenChange, defaultTab = 'login' }: AuthModalProps) {
  const t = useTranslations('auth');
  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();
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
          setTimeout(() => onOpenChange(false), 800);
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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute right-3 top-3 rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </Dialog.Close>
          <Dialog.Title className="sr-only">{tab === 'login' ? t('signIn') : t('signUp')}</Dialog.Title>
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => { setTab('login'); setMessage(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === 'login' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t('signIn')}
            </button>
            <button
              type="button"
              onClick={() => { setTab('signup'); setMessage(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === 'signup' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t('signUp')}
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <p className={`text-sm ${message.type === 'error' ? 'text-red-400' : 'text-amber-400'}`}>
                {message.text}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-amber-500 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400 disabled:opacity-50 transition-colors"
            >
              {loading ? '...' : (tab === 'login' ? t('signIn') : t('signUp'))}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
