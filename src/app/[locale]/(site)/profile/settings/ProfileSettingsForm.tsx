'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { updateUserProfile } from '../actions';

interface ProfileSettingsFormProps {
  locale: string;
  userId: string;
  initialNickname?: string | null;
  initialBio?: string | null;
  initialAvatarUrl?: string | null;
  t: {
    nickname: string;
    bio: string;
    save: string;
    saving: string;
    avatar: { upload: string; uploading: string; change: string; formats: string };
  };
}

function SubmitButton({ label, savingLabel }: { label: string; savingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-amber-500 text-slate-950 hover:bg-amber-400">
      {pending ? savingLabel : label}
    </Button>
  );
}

export function ProfileSettingsForm({
  locale,
  userId,
  initialNickname,
  initialBio,
  initialAvatarUrl,
  t,
}: ProfileSettingsFormProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await updateUserProfile(locale, formData);
    if (result.error) setError(result.error);
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardContent className="p-6">
        <form action={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-amber-500">{t.avatar.upload}</label>
            <AvatarUpload
              userId={userId}
              currentUrl={avatarUrl}
              onUploadComplete={setAvatarUrl}
              t={t.avatar}
            />
          </div>

          <div>
            <label htmlFor="nickname" className="mb-2 block text-sm font-medium text-amber-500">
              {t.nickname}
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              defaultValue={initialNickname ?? ''}
              placeholder={t.nickname}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-slate-200 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              maxLength={64}
            />
          </div>

          <div>
            <label htmlFor="bio" className="mb-2 block text-sm font-medium text-amber-500">
              {t.bio}
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={initialBio ?? ''}
              placeholder={t.bio}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-slate-200 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              maxLength={500}
            />
          </div>

          <input type="hidden" name="avatar_url" value={avatarUrl ?? ''} />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <SubmitButton label={t.save} savingLabel={t.saving} />
        </form>
      </CardContent>
    </Card>
  );
}
