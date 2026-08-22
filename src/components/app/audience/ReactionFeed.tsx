'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { PersonaReaction } from '@/lib/audience-simulator/types';
import { cn } from '@/lib/utils';

export default function ReactionFeed({
  reactions,
  live,
}: {
  reactions: PersonaReaction[];
  live?: boolean;
}) {
  const [visible, setVisible] = useState(live ? 0 : reactions.length);

  useEffect(() => {
    if (!live) {
      setVisible(reactions.length);
      return;
    }
    setVisible(0);
    if (!reactions.length) return;
    const id = window.setInterval(() => {
      setVisible((n) => {
        if (n >= reactions.length) {
          window.clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, 650);
    return () => window.clearInterval(id);
  }, [reactions, live]);

  const shown = reactions.slice(0, visible);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] tracking-widest uppercase text-wine-accent font-semibold">
        AI-Simulated Audience
      </p>
      <p className="text-xs text-viralyze-muted -mt-1">
        AI-Simulated Reactions — not real users
      </p>
      <AnimatePresence>
        {shown.map((r) => (
          <motion.div
            key={r.personaId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-viralyze-white">
                  {r.emoji} {r.personaLabel}
                </p>
                <p className="text-sm text-viralyze-white/90 mt-1 italic">“{r.reaction}”</p>
              </div>
              <span
                className={cn(
                  'text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0',
                  r.sentiment === 'positive' && 'border-emerald-500/30 text-emerald-400',
                  r.sentiment === 'neutral' && 'border-white/15 text-viralyze-muted',
                  r.sentiment === 'negative' && 'border-red-500/30 text-red-400'
                )}
              >
                {r.sentiment}
              </span>
            </div>
            <p className="text-xs text-viralyze-muted mt-2">{r.reason}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              {[
                ['Engagement', r.engagement_score],
                ['Clarity', r.clarity_score],
                ['Emotion', r.emotional_score],
                ['Confidence', Math.round(r.confidence * 100)],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-md bg-white/[0.04] px-2 py-1.5">
                  <p className="text-[10px] text-viralyze-muted">{label}</p>
                  <p className="text-sm font-medium tabular-nums text-viralyze-white">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
