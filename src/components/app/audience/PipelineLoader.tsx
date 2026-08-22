'use client';

import { motion } from 'framer-motion';
import { Check, Loader2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const PIPELINE_STEPS = [
  'Understanding content',
  'Detecting emotional moments',
  'Understanding selected platform',
  'Selecting audience personas',
  'Simulating audience reactions',
  'Finding common concerns',
  'Generating recommendations',
  'Preparing AI improvement',
];

export default function PipelineLoader({
  activeIndex,
  title = 'ANALYZING YOUR CONTENT...',
}: {
  activeIndex: number;
  title?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
      <p className="text-xs font-semibold tracking-widest text-wine-accent mb-4">{title}</p>
      <div className="flex flex-col gap-2.5">
        {PIPELINE_STEPS.map((step, i) => {
          const done = i < activeIndex;
          const current = i === activeIndex;
          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2.5"
            >
              {done ? (
                <Check className="h-4 w-4 text-viralyze-success shrink-0" />
              ) : current ? (
                <Loader2 className="h-4 w-4 text-wine-accent animate-spin shrink-0" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-white/20 shrink-0" />
              )}
              <span
                className={cn(
                  'text-sm',
                  done || current ? 'text-viralyze-white' : 'text-viralyze-muted/50'
                )}
              >
                {step}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
