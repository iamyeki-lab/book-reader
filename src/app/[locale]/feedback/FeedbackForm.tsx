'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { submitFeedbackAction } from './actions';

export function FeedbackForm({ locale }: { locale: string }) {
  const t = useTranslations('feedback');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user?.email));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const formData = new FormData();
    if (!isLoggedIn) formData.set('email', email.trim());
    formData.set('content', content.trim());

    const result = await submitFeedbackAction(locale, formData);
    if (result.error) {
      setStatus('error');
      setErrorMsg(result.error);
      return;
    }
    setStatus('success');
    setContent('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {isLoggedIn === false && (
        <div>
          <label htmlFor="feedback-email" className="block text-sm font-medium mb-1">
            {t('email', { defaultValue: '邮箱' })}
          </label>
          <input
            id="feedback-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-200 placeholder:text-slate-500"
            placeholder="your@email.com"
          />
        </div>
      )}
      <div>
        <label htmlFor="feedback-content" className="block text-sm font-medium mb-1">
          {t('content', { defaultValue: '留言内容' })}
        </label>
        <textarea
          id="feedback-content"
          required
          minLength={5}
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-200 placeholder:text-slate-500 resize-none"
          placeholder={t('placeholder', { defaultValue: '请输入您的问题或建议...' })}
        />
      </div>
      {status === 'error' && (
        <p className="text-sm text-red-400">{errorMsg}</p>
      )}
      {status === 'success' && (
        <p className="text-sm text-emerald-400">{t('success', { defaultValue: '留言已提交，我们会尽快回复。' })}</p>
      )}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="rounded-lg px-6 py-2.5 bg-amber-500 text-slate-950 font-medium hover:bg-amber-400 disabled:opacity-50"
      >
        {status === 'loading' ? t('submitting', { defaultValue: '提交中...' }) : t('submit', { defaultValue: '提交留言' })}
      </button>
    </form>
  );
}
