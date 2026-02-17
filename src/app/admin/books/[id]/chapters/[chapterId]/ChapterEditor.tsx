'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  getChapterContentAction,
  updateChapterDataAction,
  getTranslationContentAction,
  updateTranslationDataAction,
} from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database } from 'lucide-react';

type TabId = 'zh' | 'en' | 'es' | 'ar';

const TABS: { id: TabId; label: string }[] = [
  { id: 'zh', label: '原文(中文)' },
  { id: 'en', label: '英语' },
  { id: 'es', label: '西语' },
  { id: 'ar', label: '阿语' },
];

function sameChapter(
  a: { chapter_number: number; title: string; content: string },
  b: { chapter_number: number; title: string; content: string }
) {
  return (
    a.chapter_number === b.chapter_number &&
    a.title.trim() === b.title.trim() &&
    a.content.trim() === b.content.trim()
  );
}

function sameTranslation(
  a: { translated_title: string; translated_content: string },
  b: { translated_title: string; translated_content: string }
) {
  return a.translated_title.trim() === b.translated_title.trim() && a.translated_content.trim() === b.translated_content.trim();
}

export function ChapterEditor({
  chapterId,
  bookId,
  initialChapter,
  initialTranslations,
}: {
  chapterId: string;
  bookId: string;
  initialChapter: { chapter_number: number; title: string; content: string };
  initialTranslations: {
    en: { translated_title: string; translated_content: string } | null;
    es: { translated_title: string; translated_content: string } | null;
    ar: { translated_title: string; translated_content: string } | null;
  };
}) {
  const [activeTab, setActiveTab] = useState<TabId>('zh');
  const [chapterNumber, setChapterNumber] = useState(initialChapter.chapter_number);
  const [title, setTitle] = useState(initialChapter.title);
  const [content, setContent] = useState(initialChapter.content);
  const [transEn, setTransEn] = useState(
    initialTranslations.en || { translated_title: `Chapter ${initialChapter.chapter_number}`, translated_content: '' }
  );
  const [transEs, setTransEs] = useState(
    initialTranslations.es || { translated_title: `Capítulo ${initialChapter.chapter_number}`, translated_content: '' }
  );
  const [transAr, setTransAr] = useState(
    initialTranslations.ar || { translated_title: `الفصل ${initialChapter.chapter_number}`, translated_content: '' }
  );
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dialog, setDialog] = useState<{
    mode: 'refresh' | 'save';
    type: 'chapter' | 'translation';
    targetLang?: string;
    dbChapter?: { chapter_number: number; title: string; content: string };
    dbTrans?: { translated_title: string; translated_content: string };
  } | null>(null);

  const editorChapter = () => ({ chapter_number: chapterNumber, title, content });
  const getTrans = (lang: 'en' | 'es' | 'ar') =>
    lang === 'en' ? transEn : lang === 'es' ? transEs : transAr;
  const setTrans = (lang: 'en' | 'es' | 'ar', v: { translated_title: string; translated_content: string }) => {
    if (lang === 'en') setTransEn(v);
    else if (lang === 'es') setTransEs(v);
    else setTransAr(v);
  };

  async function handleRefreshChapter() {
    setMessage(null);
    setRefreshing(true);
    try {
      const db = await getChapterContentAction(chapterId);
      if (!db) {
        setMessage({ type: 'err', text: '章节不存在' });
        return;
      }
      const ed = editorChapter();
      if (sameChapter(ed, db)) {
        setMessage({ type: 'ok', text: '原文已是数据库最新' });
      } else {
        setDialog({ mode: 'refresh', type: 'chapter', dbChapter: db });
      }
    } catch (e) {
      setMessage({ type: 'err', text: String(e) });
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSaveChapter() {
    setMessage(null);
    setLoading(true);
    try {
      const db = await getChapterContentAction(chapterId);
      if (!db) {
        setMessage({ type: 'err', text: '章节不存在' });
        setLoading(false);
        return;
      }
      const ed = editorChapter();
      if (sameChapter(ed, db)) {
        await updateChapterDataAction(chapterId, bookId, ed);
        setMessage({ type: 'ok', text: '原文已同步到数据库' });
      } else {
        setDialog({ mode: 'save', type: 'chapter', dbChapter: db });
      }
    } catch (e) {
      setMessage({ type: 'err', text: String(e) });
    } finally {
      setLoading(false);
    }
  }

  async function handleRefreshTranslation(lang: 'en' | 'es' | 'ar') {
    setMessage(null);
    setRefreshing(true);
    try {
      const db = await getTranslationContentAction(chapterId, lang);
      const ed = getTrans(lang);
      if (!db) {
        setMessage({ type: 'ok', text: `该章节暂无${lang.toUpperCase()}翻译，可编辑后同步` });
        return;
      }
      if (sameTranslation(ed, db)) {
        setMessage({ type: 'ok', text: `${lang.toUpperCase()}已是数据库最新` });
      } else {
        setDialog({ mode: 'refresh', type: 'translation', targetLang: lang, dbTrans: db });
      }
    } catch (e) {
      setMessage({ type: 'err', text: String(e) });
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSaveTranslation(lang: 'en' | 'es' | 'ar') {
    setMessage(null);
    setLoading(true);
    try {
      const db = await getTranslationContentAction(chapterId, lang);
      const ed = getTrans(lang);
      if (!db) {
        await updateTranslationDataAction(chapterId, bookId, lang, ed);
        setMessage({ type: 'ok', text: `${lang.toUpperCase()}已同步到数据库` });
        setLoading(false);
        return;
      }
      if (sameTranslation(ed, db)) {
        await updateTranslationDataAction(chapterId, bookId, lang, ed);
        setMessage({ type: 'ok', text: `${lang.toUpperCase()}已同步到数据库` });
      } else {
        setDialog({ mode: 'save', type: 'translation', targetLang: lang, dbTrans: db });
      }
    } catch (e) {
      setMessage({ type: 'err', text: String(e) });
    } finally {
      setLoading(false);
    }
  }

  function confirmRefresh() {
    if (!dialog) return;
    if (dialog.type === 'chapter' && dialog.dbChapter) {
      setChapterNumber(dialog.dbChapter.chapter_number);
      setTitle(dialog.dbChapter.title);
      setContent(dialog.dbChapter.content);
      setMessage({ type: 'ok', text: '已从数据库刷新原文' });
    } else if (dialog.type === 'translation' && dialog.targetLang && dialog.dbTrans) {
      setTrans(dialog.targetLang, dialog.dbTrans);
      setMessage({ type: 'ok', text: `已从数据库刷新${dialog.targetLang.toUpperCase()}` });
    }
    setDialog(null);
  }

  async function confirmSave() {
    if (!dialog) return;
    try {
      setLoading(true);
      if (dialog.type === 'chapter') {
        await updateChapterDataAction(chapterId, bookId, editorChapter());
        setMessage({ type: 'ok', text: '原文已覆盖并同步到数据库' });
      } else if (dialog.type === 'translation' && dialog.targetLang) {
        await updateTranslationDataAction(chapterId, bookId, dialog.targetLang, getTrans(dialog.targetLang));
        setMessage({ type: 'ok', text: `${dialog.targetLang.toUpperCase()}已覆盖并同步到数据库` });
      }
      setDialog(null);
    } catch (e) {
      setMessage({ type: 'err', text: String(e) });
    } finally {
      setLoading(false);
    }
  }

  const isChapter = activeTab === 'zh';
  const transLang = activeTab === 'en' ? 'en' : activeTab === 'es' ? 'es' : activeTab === 'ar' ? 'ar' : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 border-b pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`rounded px-3 py-1.5 text-sm ${activeTab === t.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          {isChapter ? (
            <>
              <Button variant="outline" size="sm" onClick={handleRefreshChapter} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              <Button size="sm" onClick={handleSaveChapter} disabled={loading}>
                <Database className="h-4 w-4 mr-1" />
                {loading ? '同步中…' : '同步'}
              </Button>
            </>
          ) : transLang ? (
            <>
              <Button variant="outline" size="sm" onClick={() => handleRefreshTranslation(transLang)} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              <Button size="sm" onClick={() => handleSaveTranslation(transLang)} disabled={loading}>
                <Database className="h-4 w-4 mr-1" />
                {loading ? '同步中…' : '同步'}
              </Button>
            </>
          ) : null}
          <Link href={`/admin/books/${bookId}/chapters`} className="rounded border px-4 py-2 text-sm">
            返回
          </Link>
        </div>
      </div>

      {activeTab === 'zh' && (
        <>
          <div>
            <label className="mb-1 block text-sm">章节号</label>
            <input
              type="number"
              value={chapterNumber}
              onChange={(e) => setChapterNumber(parseInt(e.target.value, 10) || 1)}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">正文（原文）</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              required
              className="w-full rounded border px-3 py-2 font-mono text-sm"
            />
          </div>
        </>
      )}

      {activeTab === 'en' && (
        <>
          <div>
            <label className="mb-1 block text-sm">翻译标题</label>
            <input
              type="text"
              value={transEn.translated_title}
              onChange={(e) => setTransEn((p) => ({ ...p, translated_title: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              placeholder="Chapter 1"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">翻译正文</label>
            <textarea
              value={transEn.translated_content}
              onChange={(e) => setTransEn((p) => ({ ...p, translated_content: e.target.value }))}
              rows={18}
              className="w-full rounded border px-3 py-2 font-mono text-sm"
              placeholder="English translation..."
            />
          </div>
        </>
      )}

      {activeTab === 'es' && (
        <>
          <div>
            <label className="mb-1 block text-sm">翻译标题</label>
            <input
              type="text"
              value={transEs.translated_title}
              onChange={(e) => setTransEs((p) => ({ ...p, translated_title: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              placeholder="Capítulo 1"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">翻译正文</label>
            <textarea
              value={transEs.translated_content}
              onChange={(e) => setTransEs((p) => ({ ...p, translated_content: e.target.value }))}
              rows={18}
              className="w-full rounded border px-3 py-2 font-mono text-sm"
              dir="ltr"
              placeholder="Spanish translation..."
            />
          </div>
        </>
      )}

      {activeTab === 'ar' && (
        <>
          <div>
            <label className="mb-1 block text-sm">翻译标题</label>
            <input
              type="text"
              value={transAr.translated_title}
              onChange={(e) => setTransAr((p) => ({ ...p, translated_title: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              dir="rtl"
              placeholder="الفصل 1"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">翻译正文</label>
            <textarea
              value={transAr.translated_content}
              onChange={(e) => setTransAr((p) => ({ ...p, translated_content: e.target.value }))}
              rows={18}
              className="w-full rounded border px-3 py-2 font-mono text-sm"
              dir="rtl"
              placeholder="Arabic translation..."
            />
          </div>
        </>
      )}

      {message && (
        <p className={message.type === 'ok' ? 'text-green-600' : 'text-destructive'}>{message.text}</p>
      )}

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h3 className="mb-4 font-semibold">
              {dialog.mode === 'refresh' ? '数据库内容已更新' : '数据库内容与当前编辑不同'}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {dialog.mode === 'refresh'
                ? '是否用数据库内容替换当前编辑？'
                : '是否用当前编辑内容覆盖数据库？'}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialog(null)}>
                取消
              </Button>
              {dialog.mode === 'refresh' ? (
                <Button onClick={confirmRefresh}>替换</Button>
              ) : (
                <Button onClick={confirmSave}>覆盖</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
