'use client';

import Link from 'next/link';
import { LayoutDashboard, BookMarked, Clock, MessageSquare, Settings, Home } from 'lucide-react';
import { ProfileHeader } from './ProfileHeader';
import { ProfileNav } from './ProfileNav';
import type { User } from '@supabase/supabase-js';

const ICON_MAP = {
  overview: LayoutDashboard,
  library: BookMarked,
  history: Clock,
  messages: MessageSquare,
  settings: Settings,
};

interface ProfileLayoutClientProps {
  locale: string;
  backHomeLabel: string;
  navItems: { href: string; label: string; icon: string }[];
  profile: { nickname?: string | null; avatarUrl?: string | null; cultivationRank?: string } | null;
  user: User | null;
  children: React.ReactNode;
}

export function ProfileLayoutClient({
  locale,
  backHomeLabel,
  navItems,
  profile,
  children,
}: ProfileLayoutClientProps) {
  const itemsWithIcons = navItems.map((item) => ({
    ...item,
    icon: (ICON_MAP as Record<string, React.ComponentType<{ className?: string }>>)[item.icon] ?? LayoutDashboard,
  }));

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col md:flex-row">
        <aside className="shrink-0 border-slate-800 md:w-64 md:border-e">
          <div className="sticky top-0 flex flex-col">
            <Link
              href={`/${locale}`}
              className="flex min-h-[44px] items-center gap-2 px-4 py-3 text-sm text-slate-400 hover:bg-slate-800/50 hover:text-amber-500 transition-colors md:rounded-s-md md:pe-6 md:ps-4"
            >
              <Home className="h-5 w-5 shrink-0" />
              <span>{backHomeLabel}</span>
            </Link>
            <ProfileHeader
              nickname={profile?.nickname}
              avatarUrl={profile?.avatarUrl}
              cultivationRank={profile?.cultivationRank}
            />
            <ProfileNav locale={locale} items={itemsWithIcons} />
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-6 md:ps-8">{children}</main>
      </div>
    </div>
  );
}
