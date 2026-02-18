'use client';

import { useState } from 'react';
import { syncFromDatabaseAction } from './actions';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

export function SyncFromDatabaseButton({ bookId }: { bookId?: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setMessage(null);
    try {
      await syncFromDatabaseAction(bookId);
      const time = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setMessage(`已从数据库同步，时间：${time}`);
    } catch (e) {
      setMessage(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleSync} disabled={loading}>
        <Database className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
        {loading ? '同步中…' : '从数据库同步'}
      </Button>
      {message && (
        <span className={message.startsWith('已') ? 'text-green-600 text-sm' : 'text-destructive text-sm'}>
          {message}
        </span>
      )}
    </div>
  );
}
