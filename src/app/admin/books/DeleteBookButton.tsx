'use client';

import { deleteBookAction } from '@/app/admin/actions';

export function DeleteBookButton({ bookId, variant = 'link' }: { bookId: string; variant?: 'link' | 'button' }) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm('确定删除此书？章节、翻译、术语表等将一并删除。')) {
      e.preventDefault();
    }
  }

  if (variant === 'button') {
    return (
      <form action={deleteBookAction.bind(null, bookId)} onSubmit={handleSubmit} className="inline">
        <button type="submit" className="rounded border border-destructive px-4 py-2 text-destructive hover:bg-destructive/10">
          删除书籍
        </button>
      </form>
    );
  }

  return (
    <form action={deleteBookAction.bind(null, bookId)} onSubmit={handleSubmit} className="inline">
      <button type="submit" className="text-sm text-destructive hover:underline">
        删除
      </button>
    </form>
  );
}
