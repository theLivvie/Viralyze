'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Frown, Sparkles } from 'lucide-react';

export default function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const fadeInUp = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: isInView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.6, delay, ease: 'easeOut' },
  });

  const oldSteps = [
    { label: 'Create', icon: '✏️' },
    { label: 'Post', icon: '📤' },
    { label: 'Hope', icon: '🙏' },
  ];

  const newSteps = [
    { label: 'Analyze', icon: '🔍' },
    { label: 'Optimize', icon: '⚡' },
    { label: 'Publish', icon: '🚀' },
  ];

  return (
    <section className="relative py-20 sm:py-28" id="problem">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp(0)} className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-viralyze-white sm:text-4xl lg:text-5xl">
            Posting shouldn't feel like{' '}
            <span className="text-gradient-wine">gambling.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-viralyze-muted sm:text-lg">
            Most creators rely on gut feeling. Viralyze gives you data-driven confidence
            before you spend a single minute creating.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {/* Old Way */}
          <motion.div
            {...fadeInUp(0.15)}
            className="relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8"
          >
            <div className="mb-6 flex items-center gap-2">
              <Frown className="h-5 w-5 text-viralyze-muted/50" />
              <span className="text-sm font-medium text-viralyze-muted/60">The Old Way</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              {oldSteps.map((step, i) => (
                <div key={step.label} className="flex flex-1 items-center gap-3 sm:gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/[0.03] text-2xl">
                      {step.icon}
                    </div>
                    <span className="text-xs font-medium text-viralyze-muted/50">{step.label}</span>
                  </div>
                  {i < oldSteps.length - 1 && (
                    <ArrowRight className="mt-[-16px] h-4 w-4 shrink-0 text-white/10" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-lg bg-white/[0.02] p-3">
              <p className="text-xs leading-relaxed text-viralyze-muted/40">
                Create content based on intuition, post it, then cross your fingers
                and wait. Most posts flop silently.
              </p>
            </div>
          </motion.div>

          {/* New Way */}
          <motion.div
            {...fadeInUp(0.3)}
            className="relative rounded-2xl border border-wine-accent/20 bg-gradient-wine-subtle p-6 sm:p-8"
          >
            <div className="mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-wine-accent" />
              <span className="text-sm font-medium text-wine-accent">The Viralyze Way</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              {newSteps.map((step, i) => (
                <div key={step.label} className="flex flex-1 items-center gap-3 sm:gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-wine-accent/10 text-2xl glow-wine-sm">
                      {step.icon}
                    </div>
                    <span className="text-xs font-medium text-wine-accent">{step.label}</span>
                  </div>
                  {i < newSteps.length - 1 && (
                    <ArrowRight className="mt-[-16px] h-4 w-4 shrink-0 text-wine-accent/60" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-lg bg-wine-accent/10 p-3">
              <p className="text-xs leading-relaxed text-wine-accent/80">
                Analyze your idea first with AI, optimize based on data-driven insights,
                then publish knowing it has viral potential.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
