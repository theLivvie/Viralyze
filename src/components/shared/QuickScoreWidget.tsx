'use client';

import type { Classification } from '@/lib/types';
import { cn } from '@/lib/utils';

interface QuickScoreWidgetProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  classification: Classification;
}

const sizeMap = {
  sm: { container: 'h-9 w-9', radius: 16, strokeWidth: 2.5, text: 'text-[10px]', subtext: 'text-[7px]' },
  md: { container: 'h-14 w-14', radius: 24, strokeWidth: 3, text: 'text-sm', subtext: 'text-[8px]' },
  lg: { container: 'h-20 w-20', radius: 34, strokeWidth: 3.5, text: 'text-xl', subtext: 'text-[10px]' },
};

function scoreColor(score: number): string {
  if (score >= 90) return '#34d399'; // emerald-400
  if (score >= 70) return '#4ade80'; // green-400
  if (score >= 50) return '#fbbf24'; // amber-400
  return '#f87171'; // red-400
}

export default function QuickScoreWidget({ score, size = 'md', classification }: QuickScoreWidgetProps) {
  const s = sizeMap[size];
  const circumference = 2 * Math.PI * s.radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className={cn('relative flex items-center justify-center shrink-0', s.container)}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={s.radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={s.strokeWidth}
        />
        <circle
          cx="50"
          cy="50"
          r={s.radius}
          fill="none"
          stroke={color}
          strokeWidth={s.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="relative flex flex-col items-center justify-center">
        <span className={cn('font-bold tabular-nums leading-none', s.text)} style={{ color }}>
          {score}
        </span>
        {size !== 'sm' && (
          <span className={cn('text-viralyze-muted capitalize mt-0.5 leading-none', s.subtext)}>
            {classification}
          </span>
        )}
      </div>
    </div>
  );
}
