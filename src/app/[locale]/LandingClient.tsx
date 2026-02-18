'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { AuthModal } from '@/components/AuthModal';
import { CoverImage } from '@/components/CoverImage';
import { BookOpen, Layers, Search, X } from 'lucide-react';
import { ShareButton } from '@/components/ShareButton';

interface BookItem {
  id: string;
  title: string;
  author: string;
  genre: string | null;
  description: string | null;
  cover_url: string | null;
}

interface LandingClientProps {
  locale: string;
  user: { id: string } | null;
  profileLabel: string;
  slogan: string;
  trendingSubtitle: string;
  featured: BookItem | null;
  books: BookItem[];
  t: {
    explore: string;
    login: string;
    signUp: string;
    feedback: string;
    startReading: string;
    readNow: string;
    addToLibrary: string;
    searchPlaceholder: string;
    expand: string;
    collapse: string;
    share: string;
    linkCopied: string;
  };
}

export function LandingClient({ locale, user, profileLabel, slogan, trendingSubtitle, featured, books, t }: LandingClientProps) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [showSearch, setShowSearch] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [descExpanded, setDescExpanded] = useState(false);
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    setShowSearch(false);
    setSearchInput('');
    router.push(q ? `/${locale}/explore?q=${encodeURIComponent(q)}` : `/${locale}/explore`);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Nav */}
      <nav className="sticky top-0 z-[100] isolate flex min-h-[52px] items-center justify-between gap-2 border-b border-slate-800/50 bg-slate-950 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <Link href={`/${locale}`} className="flex shrink-0 items-center gap-2 font-display text-lg font-bold text-amber-400 hover:text-amber-300 transition-colors">
          <Image src="/img/logo.jpeg" alt="StoryRealm" width={36} height={36} className="rounded-lg object-cover" />
          <span className="hidden sm:inline">STORYREALM</span>
        </Link>
        <button
          type="button"
          onClick={() => setShowSearch(true)}
          className="flex shrink-0 min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="搜索"
        >
          <Search className="h-4 w-4" />
        </button>
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <LocaleSwitcher />
            {user ? (
            <Link
              href={`/${locale}/profile`}
              className="inline-flex min-h-[44px] touch-manipulation items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
            >
              {profileLabel}
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setAuthTab('login'); setAuthOpen(true); }}
                className="inline-flex min-h-[44px] touch-manipulation items-center px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              >
                {t.login}
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('signup'); setAuthOpen(true); }}
                className="inline-flex min-h-[44px] touch-manipulation items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
              >
                {t.signUp}
              </button>
              <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab={authTab} />
            </>
            )}
        </div>
      </nav>

      {/* 弹出式搜索框 - 全屏遮罩 */}
      {showSearch && (
        <div
          className="fixed inset-0 z-[110] flex flex-col bg-slate-950/95 backdrop-blur-md"
          role="dialog"
          aria-label="搜索"
        >
          <div className="flex min-h-[52px] shrink-0 items-center gap-2 px-4 pt-[env(safe-area-inset-top)]">
            <form onSubmit={handleSearchSubmit} className="flex flex-1 min-w-0 items-center gap-2">
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t.searchPlaceholder}
                autoFocus
                className="h-12 flex-1 min-w-0 rounded-lg border border-slate-600 bg-slate-800/90 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 sm:text-lg"
              />
              <button
                type="submit"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
            <button
              type="button"
              onClick={() => { setShowSearch(false); setSearchInput(''); }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="关闭搜索"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <button
            type="button"
            className="flex-1"
            onClick={() => { setShowSearch(false); setSearchInput(''); }}
            aria-label="关闭"
          />
        </div>
      )}

      {/* Hero - 精选书籍：z-0 确保不遮挡导航与下拉菜单 */}
      <section className="relative z-0 min-h-[60vh] flex flex-col md:flex-row items-center justify-center px-4 py-12 md:py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
          <Image
            src="/img/beijing.jpeg"
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-950/70 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />

        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {featured ? (
            <>
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-shrink-0 w-40 sm:w-48 md:w-56"
              >
                <Link href={`/${locale}/story/${featured.id}`}>
                  <CoverImage
                    src={featured.cover_url}
                    placeholderText={featured.title.slice(0, 2)}
                    className="w-full aspect-[2/3] rounded-lg shadow-2xl ring-2 ring-slate-700/50 hover:ring-amber-500/50 transition-all"
                    aspectRatio="2/3"
                  />
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex-1 text-center md:text-left"
              >
                {featured.genre && (
                  <span className="inline-block px-3 py-1 rounded bg-purple-500/30 text-purple-200 text-xs font-semibold uppercase tracking-wider mb-4">
                    {featured.genre}
                  </span>
                )}
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                  {featured.title}
                </h1>
                <p className="text-slate-400 text-sm mb-4">{featured.author}</p>
                {featured.description && (
                  <div className="max-w-xl mb-6">
                    <p className={`text-slate-300 text-sm md:text-base ${!descExpanded ? 'line-clamp-4' : ''}`}>
                      {featured.description}
                    </p>
                    {featured.description.length > 120 && (
                      <button
                        type="button"
                        onClick={() => setDescExpanded(!descExpanded)}
                        className="mt-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        {descExpanded ? t.collapse : t.expand}
                      </button>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center">
                  <Link
                    href={`/${locale}/story/${featured.id}/read`}
                    className="inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/25 transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                    {t.readNow}
                  </Link>
                  <ShareButton
                    title={featured.title}
                    text={featured.description ? featured.description.slice(0, 160) : undefined}
                    url={`/${locale}/story/${featured.id}`}
                    label={t.share}
                    copiedLabel={t.linkCopied}
                    variant="outline"
                    size="default"
                    className="[&_button]:border-slate-600 [&_button]:text-slate-200 [&_button]:hover:bg-slate-800 [&_button]:hover:text-white [&_button]:px-6 [&_button]:py-3"
                  />
                  <Link
                    href={`/${locale}/story/${featured.id}`}
                    className="inline-flex items-center gap-2 rounded-md border border-slate-600 px-6 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <Layers className="h-4 w-4" />
                    {t.addToLibrary}
                  </Link>
                </div>
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <Image src="/img/logo.jpeg" alt="StoryRealm" width={80} height={80} className="rounded-2xl object-cover shadow-xl" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                STORYREALM
              </h1>
              <p className="text-slate-200 text-lg mb-8 max-w-md mx-auto">{slogan}</p>
              <Link
                href={`/${locale}/explore`}
                className="inline-flex items-center justify-center rounded-md px-8 py-3 text-sm font-medium bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
              >
                {t.explore}
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* 书籍横向列表 - TRENDING 区 */}
      {books.length > 0 && (
        <section className="py-12 px-4 bg-slate-950">
          <div className="container mx-auto max-w-6xl">
            <h2 className="font-display text-lg md:text-xl font-bold text-white uppercase tracking-wider mb-6">
              {trendingSubtitle}
            </h2>
            <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <div className="flex gap-4 min-w-max">
                {books.map((book, index) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex-shrink-0 w-28 sm:w-32"
                  >
                    <Link
                      href={`/${locale}/story/${book.id}`}
                      className="block rounded-lg ring-2 ring-transparent hover:ring-amber-500/50 transition-all hover:scale-105"
                    >
                      <CoverImage
                        src={book.cover_url}
                        placeholderText={book.title.slice(0, 2)}
                        className="w-full aspect-[2/3]"
                        aspectRatio="2/3"
                      />
                      <div className="mt-2">
                        <h3 className="font-semibold text-white text-xs sm:text-sm line-clamp-2">{book.title}</h3>
                        <p className="text-slate-400 text-xs mt-0.5 truncate">{book.author}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link
                href={`/${locale}/explore`}
                className="inline-flex items-center justify-center rounded-md border border-slate-600 px-6 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                {t.explore}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500 space-y-2">
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:storyrealm.app@gmail.com"
              className="text-amber-400/90 hover:text-amber-400 transition-colors"
            >
              storyrealm.app@gmail.com
            </a>
            <Link
              href={`/${locale}/feedback`}
              className="text-amber-400/90 hover:text-amber-400 transition-colors"
            >
              {t.feedback}
            </Link>
          </div>
          <div>© STORYREALM</div>
        </div>
      </footer>
    </div>
  );
}
