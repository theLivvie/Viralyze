'use client';

import { motion } from 'framer-motion';

interface ScoreBarProps {
  label: string;
  score: number;
  delay?: number;
}

export default function ScoreBar({ label, score, delay = 0 }: ScoreBarProps) {
  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-sm text-viralyze-muted w-28 shrink-0 truncate">
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #7F1D3A 0%, #B8325A 100%)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
        />
      </div>
      <span className="text-sm font-medium text-viralyze-white tabular-nums w-8 text-right">
        {score}
      </span>
    </div>
  );
}
