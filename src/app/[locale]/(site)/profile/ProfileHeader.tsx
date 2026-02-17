'use client';

interface ProfileHeaderProps {
  nickname?: string | null;
  avatarUrl?: string | null;
  cultivationRank?: string;
}

export function ProfileHeader({
  nickname,
  avatarUrl,
  cultivationRank = 'Mortal',
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 md:flex-row md:items-center md:gap-4 md:ps-0">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-slate-700 bg-slate-800 ring-2 ring-amber-500/30">
        {avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={avatarUrl}
            alt={nickname || 'Avatar'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-amber-500">
            {(nickname || 'U').charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-1 text-center md:items-start md:text-start">
        <h1 className="text-xl font-semibold text-slate-200">{nickname || 'Reader'}</h1>
        <span className="rounded-full border border-amber-500/50 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500">
          {cultivationRank}
        </span>
      </div>
    </div>
  );
}
