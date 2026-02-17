'use client';

import { useState } from 'react';
import { replyFeedbackAction } from '@/app/admin/actions';

type Message = {
  id: string;
  user_id: string | null;
  email: string;
  content: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
};

export function FeedbackList({ messages }: { messages: Message[] }) {
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');

  async function handleReply(id: string) {
    setStatus('loading');
    const result = await replyFeedbackAction(id, replyText);
    if (result.error) {
      alert(result.error);
    } else {
      setReplyingId(null);
      setReplyText('');
      window.location.reload();
    }
    setStatus('idle');
  }

  if (messages.length === 0) {
    return <p className="text-muted-foreground">暂无留言</p>;
  }

  return (
    <div className="space-y-4">
      {messages.map((m) => (
        <div
          key={m.id}
          className="rounded-lg border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>{m.email}</span>
            <span>·</span>
            <time>{new Date(m.created_at).toLocaleString('zh-CN')}</time>
            {m.user_id && <span className="text-xs">(已登录用户)</span>}
          </div>
          <p className="whitespace-pre-wrap text-sm">{m.content}</p>
          {m.admin_reply ? (
            <div className="mt-4 rounded-md bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">管理员回复</p>
              <p className="whitespace-pre-wrap text-sm">{m.admin_reply}</p>
              {m.replied_at && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(m.replied_at).toLocaleString('zh-CN')}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  setReplyingId(m.id);
                  setReplyText(m.admin_reply ?? '');
                }}
                className="mt-2 text-xs text-primary hover:underline"
              >
                修改回复
              </button>
            </div>
          ) : replyingId === m.id ? (
            <div className="mt-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="输入回复内容..."
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleReply(m.id)}
                  disabled={status === 'loading'}
                  className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {status === 'loading' ? '提交中...' : '提交回复'}
                </button>
                <button
                  type="button"
                  onClick={() => { setReplyingId(null); setReplyText(''); }}
                  className="rounded-md border border-input px-3 py-1.5 text-sm"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setReplyingId(m.id)}
              className="mt-3 text-sm text-primary hover:underline"
            >
              回复
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
