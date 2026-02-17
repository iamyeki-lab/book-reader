'use client';

type Message = {
  id: string;
  content: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
};

export function FeedbackMessagesList({
  messages,
  t,
}: {
  messages: Message[];
  t: { empty: string; yourMessage: string; adminReply: string };
}) {
  if (messages.length === 0) {
    return (
      <p className="text-slate-400">{t.empty}</p>
    );
  }

  return (
    <div className="space-y-6">
      {messages.map((m) => (
        <div
          key={m.id}
          className="rounded-lg border border-slate-700 bg-slate-900/50 p-4"
        >
          <div className="mb-3 text-xs text-slate-500">
            {new Date(m.created_at).toLocaleString()}
          </div>
          <p className="text-sm font-medium text-slate-300 mb-1">{t.yourMessage}</p>
          <p className="whitespace-pre-wrap text-slate-200 text-sm mb-4">{m.content}</p>
          {m.admin_reply ? (
            <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-3">
              <p className="text-xs font-medium text-amber-500 mb-1">{t.adminReply}</p>
              <p className="whitespace-pre-wrap text-sm text-slate-200">{m.admin_reply}</p>
              {m.replied_at && (
                <p className="mt-2 text-xs text-slate-500">
                  {new Date(m.replied_at).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">待回复</p>
          )}
        </div>
      ))}
    </div>
  );
}
