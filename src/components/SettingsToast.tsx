'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const TOAST_MESSAGES: Record<string, string> = {
  free_chapters: '免费章节设置已保存',
  subscription: '订阅设置已保存',
  locales: '语言设置已保存',
  slogan: '首页副标题已保存',
  trending: '书籍区副标题已保存',
};

export function SettingsToast({ toast }: { toast: string | undefined }) {
  const router = useRouter();
  const [visible, setVisible] = useState(!!toast);

  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      router.replace('/admin/settings', { scroll: false });
    }, 3000);
    return () => clearTimeout(t);
  }, [toast, router]);

  if (!toast || !visible) return null;
  const message = TOAST_MESSAGES[toast] || '已保存';
  return (
    <div
      role="alert"
      className="mb-6 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-300"
    >
      {message}
    </div>
  );
}
