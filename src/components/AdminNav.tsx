'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminNavProps {
  email: string;
}

export function AdminNav({ email }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex h-14 items-center justify-between border-b border-border px-4">
      <div className="flex gap-6">
        <Link
          href="/admin"
          className={`text-sm transition-colors ${pathname === '/admin' ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          仪表盘
        </Link>
        <Link
          href="/admin/books"
          className={`text-sm transition-colors ${pathname?.startsWith('/admin/books') ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          书籍管理
        </Link>
        <Link
          href="/admin/settings"
          className={`text-sm transition-colors ${pathname === '/admin/settings' ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          站点设置
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{email}</span>
        <form action="/api/auth/signout" method="post" className="inline">
          <button
            type="submit"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            退出登录
          </button>
        </form>
      </div>
    </nav>
  );
}
