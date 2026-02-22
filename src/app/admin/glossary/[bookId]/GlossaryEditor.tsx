'use client';

import { useState, useMemo } from 'react';
import {
  saveGlossaryAction,
  saveGlossaryOverwriteAction,
  getGlossaryContentAction,
  getGlossaryPendingContentAction,
  saveGlossaryPendingAction,
  mergePendingIntoGlossaryAction,
} from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Replace, GitMerge } from 'lucide-react';

const EMPTY_GLOSSARY_JSON = `{
  "names": {},
  "terms": {},
  "titles": {},
  "systems": {},
  "consistency_notes": []
}`;

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
  initialPendingContent,
}: {
  bookId: string;
  initialContent: string;
  initialPendingContent: string | null;
}) {
  const [content, setContent] = useState(initialContent);
  const [pendingContent, setPendingContent] = useState(initialPendingContent ?? EMPTY_GLOSSARY_JSON);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingRefreshing, setPendingRefreshing] = useState(false);

  const stats = useMemo(() => {
    try {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      return countGlossaryByLang(parsed);
    } catch {
      return { en: 0, es: 0, ar: 0 };
    }
  }, [content]);

  const pendingStats = useMemo(() => {
    try {
      const parsed = JSON.parse(pendingContent) as Record<string, unknown>;
      return countGlossaryByLang(parsed);
    } catch {
      return { en: 0, es: 0, ar: 0 };
    }
  }, [pendingContent]);

  async function handleSave(overwrite: boolean) {
    setMessage(null);
    setLoading(true);
    try {
      const result = overwrite
        ? await saveGlossaryOverwriteAction(bookId, content)
        : await saveGlossaryAction(bookId, content);
      if (result.error) {
        setMessage({ type: 'err', text: result.error });
      } else {
        setMessage({
          type: 'ok',
          text: overwrite ? '已完全覆盖同步（服务端多余术语已删除）' : '已合并同步到数据库',
        });
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
        setMessage({ type: 'ok', text: '表一已从数据库刷新' });
      } else {
        setMessage({ type: 'err', text: '数据库无表一术语表' });
      }
    } catch (e) {
      setMessage({ type: 'err', text: String(e) });
    } finally {
      setRefreshing(false);
    }
  }

  async function handlePendingRefresh() {
    setPendingRefreshing(true);
    try {
      const result = await getGlossaryPendingContentAction(bookId);
      if (result.content !== null) {
        setPendingContent(result.content);
      } else {
        setPendingContent(EMPTY_GLOSSARY_JSON);
      }
    } catch (e) {
      setMessage({ type: 'err', text: String(e) });
    } finally {
      setPendingRefreshing(false);
    }
  }

  async function handleSavePending() {
    setMessage(null);
    setPendingLoading(true);
    try {
      const result = await saveGlossaryPendingAction(bookId, pendingContent);
      if (result.error) {
        setMessage({ type: 'err', text: result.error });
      } else {
        setMessage({ type: 'ok', text: '表二已保存' });
      }
    } catch (e) {
      setMessage({ type: 'err', text: String(e) });
    } finally {
      setPendingLoading(false);
    }
  }

  async function handleMergePending() {
    setMessage(null);
    setPendingLoading(true);
    try {
      const result = await mergePendingIntoGlossaryAction(bookId);
      if (result.ok && result.merged) {
        setPendingContent(EMPTY_GLOSSARY_JSON);
        const main = await getGlossaryContentAction(bookId);
        if (main.content !== null) setContent(main.content);
        setMessage({ type: 'ok', text: '表二已合并到表一，表二已清空' });
      } else if (result.ok) {
        setMessage({ type: 'ok', text: '表二为空，无需合并' });
      }
    } catch (e) {
      setMessage({ type: 'err', text: String(e) });
    } finally {
      setPendingLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* 表一：主术语表 */}
      <section>
        <h2 className="text-lg font-semibold mb-2">表一（主术语表）</h2>
        <p className="text-sm text-muted-foreground mb-2">翻译时使用的标准术语表，可手动修改。合并同步会与已有内容合并；完全覆盖同步会替换服务端并删除多余项。</p>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">分语种：</span>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">EN {stats.en}</span>
            <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">ES {stats.es}</span>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">AR {stats.ar}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              刷新表一
            </Button>
            <Button variant="outline" onClick={() => handleSave(false)} disabled={loading}>
              <Database className="h-4 w-4 mr-1" />
              {loading ? '同步中…' : '合并同步'}
            </Button>
            <Button onClick={() => handleSave(true)} disabled={loading} title="完全覆盖服务端并删除多余术语">
              <Replace className="h-4 w-4 mr-1" />
              完全覆盖同步
            </Button>
          </div>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[320px] rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm"
          spellCheck={false}
        />
      </section>

      {/* 表二：新术语（按章节进度收集，可合并到表一） */}
      <section>
        <h2 className="text-lg font-semibold mb-2">表二（新术语）</h2>
        <p className="text-sm text-muted-foreground mb-2">翻译端每 N 章发现的新术语会写入此处。可在此编辑、删减，确认无误后点击「合并到表一」将表二内容并入主术语表并清空表二。</p>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">分语种：</span>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">EN {pendingStats.en}</span>
            <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">ES {pendingStats.es}</span>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">AR {pendingStats.ar}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePendingRefresh} disabled={pendingRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-1 ${pendingRefreshing ? 'animate-spin' : ''}`} />
              刷新表二
            </Button>
            <Button variant="outline" onClick={handleSavePending} disabled={pendingLoading}>
              <Database className="h-4 w-4 mr-1" />
              {pendingLoading ? '保存中…' : '保存表二'}
            </Button>
            <Button onClick={handleMergePending} disabled={pendingLoading} title="将表二合并到表一并清空表二">
              <GitMerge className="h-4 w-4 mr-1" />
              合并到表一
            </Button>
          </div>
        </div>
        <textarea
          value={pendingContent}
          onChange={(e) => setPendingContent(e.target.value)}
          className="w-full min-h-[280px] rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm"
          spellCheck={false}
        />
      </section>

      {message && (
        <p className={message.type === 'ok' ? 'text-green-600' : 'text-destructive'}>{message.text}</p>
      )}
    </div>
  );
}
