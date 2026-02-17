'use client';

import { useState } from 'react';
import { syncToFrontendAction } from './actions';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function SyncToFrontendButton({ bookId }: { bookId?: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setMessage(null);
    try {
      await syncToFrontendAction(bookId);
      const time = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setMessage(`已同步到网页端，同步时间：${time}`);
    } catch (e) {
      setMessage(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleSync} disabled={loading}>
        <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
        {loading ? '同步中…' : '同步到网页端'}
      </Button>
      {message && (
        <span className={message.startsWith('已') ? 'text-green-600 text-sm' : 'text-destructive text-sm'}>
          {message}
        </span>
      )}
    </div>
  );
}
