'use client';

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookshelfButtonProps {
  bookId: string;
  addLabel: string;
  removeLabel: string;
  className?: string;
}

export function BookshelfButton({ bookId, addLabel, removeLabel, className }: BookshelfButtonProps) {
  const [inBookshelf, setInBookshelf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch(`/api/reader/bookshelf?bookId=${bookId}`)
      .then((r) => r.json())
      .then((d) => setInBookshelf(d.inBookshelf ?? false))
      .catch(() => {});
  }, [bookId]);

  const toggle = async () => {
    setLoading(true);
    try {
      if (inBookshelf) {
        await fetch(`/api/reader/bookshelf?bookId=${bookId}`, { method: 'DELETE' });
        setInBookshelf(false);
      } else {
        await fetch('/api/reader/bookshelf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId }),
        });
        setInBookshelf(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={className}
    >
      {inBookshelf ? (
        <>
          <BookmarkCheck className="h-4 w-4 mr-1" />
          {removeLabel}
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4 mr-1" />
          {addLabel}
        </>
      )}
    </Button>
  );
}
