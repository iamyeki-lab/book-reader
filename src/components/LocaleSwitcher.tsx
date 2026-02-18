'use client';

import { usePathname } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Globe } from 'lucide-react';

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'ar', label: 'العربية' },
] as const;

export function LocaleSwitcher() {
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = (params?.locale as string) || 'en';
  const currentLabel = LOCALES.find((l) => l.code === currentLocale)?.label ?? 'English';

  const getLocalizedPath = (locale: string) => {
    if (!pathname) return `/${locale}`;
    const segments = pathname.split('/').filter(Boolean);
    if (LOCALES.some((l) => l.code === segments[0])) {
      segments[0] = locale;
      return '/' + segments.join('/');
    }
    return `/${locale}` + (pathname === '/' ? '' : pathname);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="Select language"
        >
          <Globe className="h-4 w-4" />
          <span>{currentLabel}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-[99999] min-w-[140px] rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl"
          sideOffset={6}
          align="end"
          collisionPadding={16}
        >
          {LOCALES.map((loc) => (
            <DropdownMenu.Item key={loc.code} asChild>
              <Link
                href={getLocalizedPath(loc.code)}
                className={`flex min-h-[44px] touch-manipulation items-center px-4 py-2 text-sm outline-none hover:bg-slate-800 focus:bg-slate-800 ${
                  currentLocale === loc.code ? 'text-amber-400 font-medium' : 'text-slate-200'
                }`}
                lang={loc.code}
              >
                {loc.label}
              </Link>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
