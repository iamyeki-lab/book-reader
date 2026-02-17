'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dailyMeditationAction } from '@/app/[locale]/(site)/profile/actions';

interface DailyMeditationButtonProps {
  locale: string;
  canMeditate: boolean;
  t: { button: string; toast: string; alreadyDone: string };
}

const PARTICLE_COUNT = 24;

function DaoistParticles({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
        const dist = 40 + Math.random() * 60;
        const tx = Math.cos(angle) * dist + (Math.random() - 0.5) * 40;
        const ty = -80 - Math.random() * 60;
        const delay = Math.random() * 0.15;
        const size = 4 + Math.random() * 6;
        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full bg-amber-400/90 shadow-[0_0_8px_2px_rgba(251,191,36,0.6)]"
            style={{
              width: size,
              height: size,
              x: -size / 2,
              y: -size / 2,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.2, 0.8],
              x: [-size / 2, -size / 2 + tx, -size / 2 + tx],
              y: [-size / 2, -size / 2 + ty * 0.3, -size / 2 + ty],
            }}
            transition={{
              duration: 1.2,
              delay,
              ease: 'easeOut',
            }}
            onAnimationComplete={i === 0 ? onComplete : undefined}
          />
        );
      })}
    </div>
  );
}

export function DailyMeditationButton({
  locale,
  canMeditate,
  t,
}: DailyMeditationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [didMeditate, setDidMeditate] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleClick = async () => {
    if (!canMeditate || didMeditate || loading || playing) return;

    setLoading(true);
    const result = await dailyMeditationAction(locale);
    setLoading(false);

    if (result.alreadyDone) {
      showToast(t.alreadyDone);
      return;
    }
    if (result.error) {
      showToast(result.error);
      return;
    }
    if (result.success) {
      setDidMeditate(true);
      setPlaying(true);
    }
  };

  return (
    <div className="relative">
      <Button
        type="button"
        onClick={handleClick}
        disabled={!canMeditate || didMeditate || loading || playing}
        className="relative min-h-[48px] gap-2 border-amber-500/50 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 disabled:opacity-50"
      >
        {playing && (
          <DaoistParticles
            onComplete={() => {
              setPlaying(false);
              showToast(t.toast);
            }}
          />
        )}
        <Sparkles className="h-5 w-5 shrink-0" />
        {loading || playing ? '...' : t.button}
      </Button>

      <AnimatePresence mode="wait">
        {toast ? (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-6 start-1/2 z-50 -translate-x-1/2 rounded-lg border border-amber-500/50 bg-slate-900 px-4 py-3 shadow-lg"
          >
            <p className="text-sm text-amber-100">{toast}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
