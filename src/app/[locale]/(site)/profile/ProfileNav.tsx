'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookMarked, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileNavProps {
  locale: string;
  items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

export function ProfileNav({ locale, items }: ProfileNavProps) {
  const pathname = usePathname();
  const base = `/${locale}/profile`;

  return (
    <nav className="flex gap-0 border-b border-slate-800 md:flex-col md:border-b-0 md:border-e border-slate-800">
      {items.map(({ href, label, icon: Icon }) => {
        const fullHref = href === 'overview' ? base : `${base}/${href}`;
        const isActive =
          href === 'overview'
            ? pathname === base || pathname === `${base}/`
            : pathname?.startsWith(fullHref);
        return (
          <Link
            key={href}
            href={fullHref}
            className={cn(
              'flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-none px-4 py-3 text-sm transition-colors md:justify-start md:rounded-s-md md:pe-6 md:ps-4',
              isActive
                ? 'border-b-2 border-amber-500 bg-amber-500/10 text-amber-500 md:border-b-0 md:border-s-2 md:border-e-0'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
