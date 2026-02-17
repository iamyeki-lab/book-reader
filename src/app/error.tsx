'use client';

import { useEffect } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log in dev; in production digest is the only hint
    console.error('App error:', error.message, error.digest ? `(digest: ${error.digest})` : '');
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200 p-4">
      <h1 className="text-xl font-semibold text-amber-400 mb-2">Something went wrong</h1>
      <p className="text-sm text-slate-400 mb-4 text-center max-w-md">
        {error.digest ? (
          <>Error digest: <code className="bg-slate-800 px-2 py-1 rounded">{error.digest}</code></>
        ) : (
          'An error occurred. Check the server logs or Vercel dashboard for details.'
        )}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md px-4 py-2 text-sm font-medium bg-amber-500 text-slate-950 hover:bg-amber-400"
      >
        Try again
      </button>
    </div>
  );
}
