'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from './LocaleSwitcher';

interface SimpleNavProps {
  locale: string;
  title?: string;
}

export function SimpleNav({ locale, title = 'StoryRealm' }: SimpleNavProps) {
  const t = useTranslations('explore');
  return (
    <nav className="sticky top-0 z-10 flex min-h-[52px] items-center justify-between border-b border-border bg-background/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Link href={`/${locale}`} className="font-display text-lg font-bold text-amber-500 hover:text-amber-400 transition-colors">
        {title}
      </Link>
      <div className="flex items-center gap-4">
        <LocaleSwitcher />
        <Link href={`/${locale}/bookshelf`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          {t('bookshelf', { defaultValue: 'Bookshelf' })}
        </Link>
        <Link href={`/${locale}/explore`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          {t('title')}
        </Link>
      </div>
    </nav>
  );
}
