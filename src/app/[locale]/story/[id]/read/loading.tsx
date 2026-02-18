/**
 * Loading skeleton for the reading page. Matches ReadingPage layout:
 * header, article (title + body paragraphs), nav (Prev/Next).
 * Uses animate-pulse and theme-aware bg-muted for dark/light.
 */
export default function ReadingLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton: back + center controls + prev/next */}
      <header className="sticky top-0 z-10 flex min-h-[52px] items-center justify-between gap-2 border-b border-border bg-background/95 px-3 sm:px-4 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-1 shrink-0">
          <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
          <div className="hidden sm:block h-9 w-16 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
          <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
          <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
          <div className="h-8 w-10 rounded bg-muted animate-pulse" />
          <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
        </div>
      </header>

      {/* Article: title + body paragraphs */}
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Chapter title */}
        <div className="h-8 w-3/4 max-w-md rounded-md bg-muted animate-pulse mb-6" />

        {/* Body: multiple paragraph blocks (90%, 95%, 85%, 92%, 88%, 90%) */}
        <div className="space-y-4">
          <div className="h-4 w-[90%] rounded bg-muted animate-pulse" />
          <div className="h-4 w-[95%] rounded bg-muted animate-pulse" />
          <div className="h-4 w-[85%] rounded bg-muted animate-pulse" />
          <div className="h-4 w-[92%] rounded bg-muted animate-pulse" />
          <div className="h-4 w-[88%] rounded bg-muted animate-pulse" />
          <div className="h-4 w-[90%] rounded bg-muted animate-pulse" />
          <div className="h-4 w-[70%] rounded bg-muted animate-pulse" />
        </div>
      </article>

      {/* Nav: Prev / Next button placeholders */}
      <nav className="border-t border-border pt-4 sm:pt-6 px-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-3xl flex justify-between">
          <div className="h-11 w-24 rounded-md bg-muted animate-pulse" />
          <div className="h-11 w-20 rounded-md bg-muted animate-pulse" />
        </div>
      </nav>
    </div>
  );
}
