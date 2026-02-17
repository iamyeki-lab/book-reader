'use client';

import { useState, useMemo } from 'react';
import { saveGlossaryAction, getGlossaryContentAction } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database } from 'lucide-react';

function countGlossaryByLang(content: Record<string, unknown>): { en: number; es: number; ar: number } {
  const counts = { en: 0, es: 0, ar: 0 };
  for (const key of ['names', 'terms', 'titles', 'systems']) {
    const obj = content[key];
    if (typeof obj !== 'object' || obj === null) continue;
    for (const v of Object.values(obj)) {
      if (typeof v === 'string') {
        counts.ar++;
      } else if (typeof v === 'object' && v !== null) {
        const o = v as Record<string, unknown>;
        if (typeof o.en === 'string') counts.en++;
        if (typeof o.es === 'string') counts.es++;
        if (typeof o.ar === 'string') counts.ar++;
      }
    }
  }
  return counts;
}

export function GlossaryEditor({
  bookId,
  initialContent,
}: {
  bookId: string;
  initialContent: string;
}) {
  const [content, setContent] = useState(initialContent);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => {
    try {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      return countGlossaryByLang(parsed);
    } catch {
      return { en: 0, es: 0, ar: 0 };
    }
  }, [content]);

  async function handleSave() {
    setMessage(null);
    setLoading(true);
    try {
      const result = await saveGlossaryAction(bookId, content);
      if (result.error) {
        setMessage({ type: 'err', text: result.error });
      } else {
        setMessage({ type: 'ok', text: '已同步到数据库' });
      }
    } catch (e) {
      setMessage({ type: 'err', text: String(e) });
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setMessage(null);
    setRefreshing(true);
    try {
      const result = await getGlossaryContentAction(bookId);
      if (result.content !== null) {
        setContent(result.content);
        setMessage({ type: 'ok', text: '已从数据库刷新' });
      } else {
        setMessage({ type: 'err', text: '数据库无术语表' });
      }
    } catch (e) {
      setMessage({ type: 'err', text: String(e) });
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">分语种统计：</span>
          <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">EN {stats.en} 条</span>
          <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">ES {stats.es} 条</span>
          <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">AR {stats.ar} 条</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            从数据库刷新
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Database className="h-4 w-4 mr-1" />
            {loading ? '同步中…' : '同步到数据库'}
          </Button>
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full min-h-[400px] rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm"
        spellCheck={false}
      />
      {message && (
        <span className={message.type === 'ok' ? 'text-green-600' : 'text-destructive'}>{message.text}</span>
      )}
    </div>
  );
}
