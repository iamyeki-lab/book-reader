'use client';

import { useState } from 'react';
import { addCreditsToUserAction } from '@/app/admin/actions';

export function AddCreditsForm({ userId, currentCredits }: { userId: string; currentCredits: number }) {
  const [credits, setCredits] = useState(10);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const result = await addCreditsToUserAction(userId, credits);
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage('充值成功');
        window.location.reload();
      }
    } catch (err) {
      setMessage(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="number"
        min={1}
        max={10000}
        value={credits}
        onChange={(e) => setCredits(Math.max(1, parseInt(e.target.value, 10) || 1))}
        className="w-16 rounded border px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? '...' : '充值'}
      </button>
      {message && <span className="text-xs text-muted-foreground">{message}</span>}
    </form>
  );
}
