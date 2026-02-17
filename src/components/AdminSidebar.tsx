'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Languages, Settings, BookMarked, Users, MessageSquare, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  email: string;
}

const navItems = [
  { href: '/admin', label: '仪表盘', icon: BookOpen },
  { href: '/admin/books', label: '书籍', icon: BookOpen },
  { href: '/admin/glossary', label: '术语表', icon: BookMarked },
  { href: '/admin/translation', label: '翻译', icon: Languages },
  { href: '/admin/users', label: '用户管理', icon: Users },
  { href: '/admin/feedback', label: '留言管理', icon: MessageSquare },
  { href: '/admin/settings', label: '设置', icon: Settings },
];

export function AdminSidebar({ email }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <span className="font-semibold text-foreground">StoryRealm 管理</span>
        <button
          type="button"
          onClick={onLinkClick}
          className="lg:hidden inline-flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="关闭菜单"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                'flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {email.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{email}</p>
            <form action="/api/auth/signout" method="post" className="inline">
              <button
                type="submit"
                className="min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
              >
                退出
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 移动端汉堡按钮 - 在 admin layout 的 header 中显示，需要把它放在 sidebar 里作为 sibling */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed left-4 top-4 z-40 inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-card border border-border text-foreground shadow-sm"
        aria-label="打开菜单"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={closeMobile}
          onKeyDown={(e) => e.key === 'Escape' && closeMobile()}
          role="button"
          tabIndex={0}
          aria-label="关闭"
        />
      )}

      {/* 桌面端固定侧边栏 */}
      <aside className="hidden lg:flex lg:h-screen lg:w-56 lg:flex-col lg:shrink-0 lg:border-r lg:border-border lg:bg-card">
        <SidebarContent />
      </aside>

      {/* 移动端抽屉 */}
      <aside
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col border-r border-border bg-card shadow-xl transition-transform duration-200 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent onLinkClick={closeMobile} />
      </aside>
    </>
  );
}
