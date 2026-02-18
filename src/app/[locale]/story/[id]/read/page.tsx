'use client';

/**
 * 阅读器页面。
 * 进度权威源：服务端 user_progress 为权威；localStorage 仅作未登录或离线时的本地缓存。
 * 登录后以服务端进度为准，若本地大于服务端会先同步到服务端再展示。
 */
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Settings, List, Home } from 'lucide-react';
import { useBookDetail } from '@/hooks/useRemoteBooks';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/lib/supabase/types';

const STORAGE_PROGRESS = 'reader-progress-';

function LockedPurchase({
  bookId,
  chapterId,
  onUnlock,
  t,
}: {
  bookId: string;
  chapterId: string;
  onUnlock: () => void;
  t: (k: string) => string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handlePurchase = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/reader/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, chapterId }),
      });
      const data = await res.json();
      if (res.ok) {
        onUnlock();
      } else {
        setError(data.error || 'Purchase failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <Button onClick={handlePurchase} disabled={loading} className="min-h-[44px] min-w-[120px]">
        {loading ? '...' : t('purchaseChapter')}
      </Button>
      {error && <p className="text-destructive text-sm mt-2">{error}</p>}
    </div>
  );
}

const STORAGE_SETTINGS = 'reader-settings-book';

type Theme = 'default' | 'sepia' | 'dark' | 'warm';
type FontSize = 'small' | 'medium' | 'large';

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const locale = (params?.locale as Locale) || 'en';
  const t = useTranslations('reader');
  const { detail, loading, error } = useBookDetail(id, locale);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [theme, setTheme] = useState<Theme>('default');
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [showSettings, setShowSettings] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [freeChapters, setFreeChapters] = useState(999);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  const saveProgress = useCallback(
    (ci: number, st: number) => {
      localStorage.setItem(STORAGE_PROGRESS + id, JSON.stringify({ chapterIndex: ci, scrollTop: st }));
      if (userId) {
        fetch('/api/reader/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId: id, chapterIndex: ci, scrollTop: st }),
        }).catch(() => {});
      }
    },
    [id, userId]
  );

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_PROGRESS + id);
    if (raw) {
      try {
        const { chapterIndex: ci, scrollTop: st } = JSON.parse(raw);
        setChapterIndex((prev) => Math.max(prev, Math.max(0, ci)));
        setScrollTop(st || 0);
      } catch {
        /* ignore */
      }
    }
    const settingsRaw = localStorage.getItem(STORAGE_SETTINGS);
    if (settingsRaw) {
      try {
        const s = JSON.parse(settingsRaw);
        if (s.theme) setTheme(s.theme);
        if (s.fontSize) setFontSize(s.fontSize);
      } catch {
        /* ignore */
      }
    }
  }, [id]);

  // 权威源：服务端进度。登录用户以 server 为准；若本地进度更大则先同步到服务端再展示
  useEffect(() => {
    if (!id || !detail) return;
    let cancelled = false;
    Promise.all([
      fetch(`/api/reader/context?bookId=${id}`).then((r) => r.json()),
      fetch(`/api/reader/progress?bookId=${id}`).then((r) => r.json()),
    ]).then(([ctx, prog]) => {
      if (cancelled) return;
      setFreeChapters(ctx.freeChapters ?? 999);
      setPurchasedIds(new Set(ctx.purchasedChapterIds ?? []));
      if (ctx.userId) setUserId(ctx.userId);
      const serverCi = prog.chapterIndex;
      const serverSt = prog.scrollTop;
      if (prog.userId && (serverCi != null || serverSt != null)) {
        const localRaw = localStorage.getItem(STORAGE_PROGRESS + id);
        let localCi = 0;
        let localSt = 0;
        if (localRaw) {
          try {
            const p = JSON.parse(localRaw);
            localCi = Math.max(0, p.chapterIndex ?? 0);
            localSt = p.scrollTop ?? 0;
          } catch {
            /* ignore */
          }
        }
        const useCi = Math.max(serverCi ?? 0, localCi);
        const useSt = serverCi != null && serverCi >= localCi ? (serverSt ?? 0) : localSt;
        setChapterIndex(useCi);
        setScrollTop(useSt);
        if (localCi > (serverCi ?? -1)) {
          fetch('/api/reader/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId: id, chapterIndex: localCi, scrollTop: localSt }),
          }).catch(() => {});
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id, detail]);

  const scrollToTop = useCallback(() => {
    window.scrollTo(0, 0);
    const el = document.getElementById('reader-content');
    if (el) el.scrollTop = 0;
  }, []);

  // When URL has ?ch=, sync to state (so Link navigation works); progress effect handles initial load when no ch
  useEffect(() => {
    if (!id || !detail) return;
    const chParam = searchParams.get('ch');
    if (chParam === null || chParam === '') return;
    const chapters = [...(detail.chapters ?? [])].sort((a, b) => a.chapter_number - b.chapter_number);
    const maxIdx = Math.max(0, chapters.length - 1);
    const n = parseInt(chParam, 10);
    if (Number.isNaN(n)) return;
    const clamped = Math.max(0, Math.min(n, maxIdx));
    setChapterIndex(clamped);
    saveProgress(clamped, 0);
    scrollToTop();
  }, [id, detail, searchParams, saveProgress, scrollToTop]);

  useEffect(() => {
    const readerEl = document.getElementById('reader-content');
    if (readerEl) readerEl.scrollTop = scrollTop;
  }, [scrollTop, detail, chapterIndex]);

  const saveSettings = (th?: Theme, fs?: FontSize) => {
    localStorage.setItem(
      STORAGE_SETTINGS,
      JSON.stringify({ theme: th ?? theme, fontSize: fs ?? fontSize })
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <p className="text-muted-foreground">{t('loading', { defaultValue: 'Loading…' })}</p>
      </div>
    );
  }
  if (error || !detail) {
    return (
      <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error?.message ?? t('errorLoadingBook', { defaultValue: 'Error loading book' })}</p>
        <Button variant="outline" asChild>
          <Link href={`/${locale}/explore`}>返回探索</Link>
        </Button>
      </div>
    );
  }

  const { chapters, translations } = detail;
  const transMap = new Map(translations.map((tr) => [tr.chapter_id, tr]));
  const sortedChapters = [...chapters].sort((a, b) => a.chapter_number - b.chapter_number);
  const currentChapter = sortedChapters[chapterIndex];
  const currentTrans = currentChapter ? transMap.get(currentChapter.id) : null;
  const canReadChapter = (ch: { id: string; chapter_number: number }) =>
    ch.chapter_number <= freeChapters || purchasedIds.has(ch.id);
  const currentLocked = currentChapter && !canReadChapter(currentChapter);

  const goToChapter = (idx: number) => {
    setScrollTop(0);
    setChapterIndex(idx);
    saveProgress(idx, 0);
    setShowToc(false);
    scrollToTop();
    const path = `/${locale}/story/${id}/read`;
    const href = idx > 0 ? `${path}?ch=${idx}` : path;
    router.replace(href, { scroll: false });
  };

  const onScroll = () => {
    const el = document.getElementById('reader-content');
    if (el) {
      setScrollTop(el.scrollTop);
      saveProgress(chapterIndex, el.scrollTop);
    }
  };

  const isRtl = locale === 'ar';
  const themeClasses: Record<Theme, string> = {
    default: 'bg-background text-foreground',
    sepia: 'bg-amber-50/95 text-amber-950',
    dark: 'bg-neutral-900 text-neutral-100',
    warm: 'bg-orange-50/95 text-orange-950',
  };
  const themeClass = themeClasses[theme];

  const fontSizeClasses: Record<FontSize, string> = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
  };
  const fontSizeClass = fontSizeClasses[fontSize];

  return (
    <div className={`min-h-screen ${themeClass}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="sticky top-0 z-10 flex min-h-[52px] items-center justify-between gap-2 border-b border-current/20 bg-inherit text-inherit px-3 sm:px-4 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-inherit/80">
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="sm" asChild className="min-h-[44px] min-w-[44px] -ml-2">
            <Link href={`/${locale}/story/${id}`} className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t('back')}</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="min-h-[44px] min-w-[44px] px-2">
            <Link href={`/${locale}`} className="flex items-center gap-1" title={t('backToHome', { defaultValue: 'Back to home' })}>
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">{t('backToHome', { defaultValue: 'Home' })}</span>
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowToc(!showToc)}
            className="h-9 min-h-[44px] min-w-[44px] px-2 text-xs shrink-0"
            title={t('toc', { defaultValue: 'Chapter list' })}
          >
            <List className="h-3.5 w-3 sm:me-1" />
            <span className="hidden sm:inline">{t('toc', { defaultValue: 'Chapters' })}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="h-9 min-h-[44px] min-w-[44px] px-2 text-xs shrink-0"
          >
            <Settings className="h-3.5 w-3 sm:me-1" />
            <span className="hidden sm:inline">{t('settings')}</span>
          </Button>
          {chapterIndex > 0 ? (
            <Button variant="outline" size="sm" asChild className="h-9 min-h-[44px] min-w-[44px] p-0 shrink-0">
              <Link href={`/${locale}/story/${id}/read?ch=${chapterIndex - 1}`} prefetch={true}>
                <ChevronLeft className="h-3.5 w-3" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled className="h-9 min-h-[44px] min-w-[44px] p-0 shrink-0">
              <ChevronLeft className="h-3.5 w-3" />
            </Button>
          )}
          <span className="text-xs sm:text-sm opacity-80 min-w-[3rem] sm:min-w-[4rem] text-center shrink-0">
            {chapterIndex + 1}/{sortedChapters.length}
          </span>
          {chapterIndex < sortedChapters.length - 1 ? (
            <Button variant="outline" size="sm" asChild className="h-9 min-h-[44px] min-w-[44px] p-0 shrink-0">
              <Link href={`/${locale}/story/${id}/read?ch=${chapterIndex + 1}`} prefetch={true}>
                <ChevronRight className="h-3.5 w-3" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled className="h-9 min-h-[44px] min-w-[44px] p-0 shrink-0">
              <ChevronRight className="h-3.5 w-3" />
            </Button>
          )}
        </div>
      </header>

      {showToc && (
        <div className="border-b border-current/20 bg-inherit px-3 py-2 max-h-[45vh] overflow-y-auto overscroll-contain">
          <p className="text-xs opacity-70 mb-1.5 sticky top-0 bg-inherit py-0.5 z-10">{t('toc', { defaultValue: 'Chapters' })}</p>
          <ul className="flex flex-col gap-px text-sm">
            {sortedChapters.map((ch, idx) => (
              <li key={ch.id}>
                <button
                  type="button"
                  onClick={() => goToChapter(idx)}
                  onMouseEnter={() => router.prefetch(`/${locale}/story/${id}/read?ch=${idx}`)}
                  className={`w-full text-left py-2 px-2.5 rounded truncate touch-manipulation ${
                    idx === chapterIndex
                      ? 'bg-primary text-primary-foreground'
                      : canReadChapter(ch)
                        ? 'text-foreground hover:bg-muted'
                        : 'text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  {t('chapterTitle', { n: ch.chapter_number })}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showSettings && (
        <div className="border-b border-current/20 bg-inherit px-4 py-3">
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <div>
              <label className="text-xs opacity-70 block mb-1">{t('theme')}</label>
              <div className="flex flex-wrap gap-1">
                {(['default', 'sepia', 'dark', 'warm'] as Theme[]).map((th) => (
                  <Button
                    key={th}
                    variant={theme === th ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setTheme(th);
                      saveSettings(th, undefined);
                    }}
                    className="min-h-[44px] min-w-[44px] px-3 text-xs"
                  >
                    {t(th)}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs opacity-70 block mb-1">{t('fontSize')}</label>
              <div className="flex flex-wrap gap-1">
                {(['small', 'medium', 'large'] as FontSize[]).map((fs) => (
                  <Button
                    key={fs}
                    variant={fontSize === fs ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setFontSize(fs);
                      saveSettings(undefined, fs);
                    }}
                    className="min-h-[44px] min-w-[44px] px-3 text-xs"
                  >
                    {t(fs)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <article
        id="reader-content"
        onScroll={onScroll}
        className={`mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 ${fontSizeClass} leading-relaxed prose prose-neutral dark:prose-invert max-w-none [&_p]:mb-4`}
        style={isRtl ? { fontFamily: 'var(--font-amiri), Amiri, serif' } : undefined}
      >
        {currentLocked ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{t('locked', { defaultValue: 'This chapter requires purchase' })}</p>
            {!userId ? (
              <Button asChild>
                <Link href={`/${locale}/auth`}>{t('loginToRead', { defaultValue: 'Login to read' })}</Link>
              </Button>
            ) : (
              <LockedPurchase
                bookId={id}
                chapterId={currentChapter.id}
                onUnlock={() => {
                  setPurchasedIds((prev) => new Set([...Array.from(prev), currentChapter.id]));
                }}
                t={(k) => t(k as 'purchaseChapter', { defaultValue: k })}
              />
            )}
          </div>
        ) : currentTrans ? (
          <>
            <h1 className="text-2xl font-bold mb-6">{t('chapterTitle', { n: currentChapter.chapter_number })}</h1>
            <div className="whitespace-pre-wrap text-start">
              {currentTrans.translated_content.split(/\n\n+/).map((p, i) => (
                <p key={i} className="mb-4">
                  {p}
                </p>
              ))}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">No translation for this chapter.</p>
        )}
      </article>

      <nav className="border-t border-current/20 pt-4 sm:pt-6 px-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-3xl flex justify-between text-sm">
          {chapterIndex > 0 ? (
            <Link
              href={`/${locale}/story/${id}/read?ch=${chapterIndex - 1}`}
              prefetch={true}
              className="min-h-[44px] min-w-[44px] -mx-2 px-2 inline-flex items-center touch-manipulation text-inherit hover:underline active:opacity-70"
            >
              ← {t('previous')}
            </Link>
          ) : (
            <span className="min-h-[44px] min-w-[44px] -mx-2 px-2 inline-flex items-center touch-manipulation text-inherit opacity-50 cursor-not-allowed" aria-disabled="true">
              ← {t('previous')}
            </span>
          )}
          {chapterIndex < sortedChapters.length - 1 ? (
            <Link
              href={`/${locale}/story/${id}/read?ch=${chapterIndex + 1}`}
              prefetch={true}
              className="min-h-[44px] min-w-[44px] -mx-2 px-2 inline-flex items-center touch-manipulation text-inherit hover:underline active:opacity-70"
            >
              {t('next')} →
            </Link>
          ) : (
            <span className="min-h-[44px] min-w-[44px] -mx-2 px-2 inline-flex items-center touch-manipulation text-inherit opacity-50 cursor-not-allowed" aria-disabled="true">
              {t('next')} →
            </span>
          )}
        </div>
      </nav>
    </div>
  );
}
