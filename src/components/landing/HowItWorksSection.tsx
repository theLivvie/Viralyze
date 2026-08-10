'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { ClipboardList, Cpu, BarChart3, Wand2, Rocket } from 'lucide-react';

const steps = [
  {
    num: '01',
    title: 'Paste your content',
    brief: 'Drop in any text, hook, or script',
    description: 'Drop in your content idea, draft, or script. We support text, hooks, captions, and full post descriptions.',
    icon: ClipboardList,
  },
  {
    num: '02',
    title: 'AI analyzes it',
    brief: 'Multi-model pipeline evaluates everything',
    description: 'Our multi-model pipeline evaluates hook strength, emotional triggers, trend fit, audience alignment, and more.',
    icon: Cpu,
  },
  {
    num: '03',
    title: 'Get your prediction',
    brief: 'Detailed viral score with 9-category breakdown',
    description: 'Receive a detailed viral score with breakdowns across 9 categories and predicted engagement metrics.',
    icon: BarChart3,
  },
  {
    num: '04',
    title: 'Optimize',
    brief: 'Specific suggestions to boost your score',
    description: 'Get specific suggestions — from hook rewrites to structural changes — to boost your score before posting.',
    icon: Wand2,
  },
  {
    num: '05',
    title: 'Publish with confidence',
    brief: 'Optimized for maximum viral potential',
    description: 'Hit publish knowing your content is optimized for maximum reach, engagement, and viral potential.',
    icon: Rocket,
  },
];

function StepCircle({
  step,
  index,
  isInView,
}: {
  step: (typeof steps)[0];
  index: number;
  isInView: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      key={step.num}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
      className="relative flex flex-col items-center text-center"
    >
      {/* Step Circle with pulsing glow on hover */}
      <motion.div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        initial={{ boxShadow: '0 0 0 rgba(184, 50, 90, 0)' }}
        animate={
          isInView
            ? hovered
              ? {
                  boxShadow:
                    '0 0 24px rgba(184, 50, 90, 0.5), 0 0 48px rgba(184, 50, 90, 0.2), 0 0 80px rgba(127, 29, 58, 0.1)',
                }
              : { boxShadow: '0 0 20px rgba(184, 50, 90, 0.3), 0 0 40px rgba(184, 50, 90, 0.1)' }
            : {}
        }
        transition={{ duration: hovered ? 0.3 : 0.6, delay: hovered ? 0 : 0.3 + index * 0.15 }}
        className="relative z-10 mb-4 flex h-[104px] w-[104px] cursor-default items-center justify-center rounded-full border bg-viralyze-black transition-colors duration-300 border-wine-accent/30 hover:border-wine-accent/60"
      >
        {/* Inner pulsing ring on hover */}
        {hovered && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0.6 }}
            animate={{ scale: 1.15, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border-2 border-wine-accent/30"
          />
        )}
        <div className="relative flex flex-col items-center gap-1">
          <step.icon className="h-6 w-6 text-wine-accent" />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-viralyze-muted/50">
            Step
          </span>
        </div>
      </motion.div>

      {/* Step Number - improved typography */}
      <span className="mb-1 font-mono text-xs font-extrabold tabular-nums text-wine-accent">
        {step.num}
      </span>
      <h3 className="mb-1 text-sm font-semibold text-viralyze-white">
        {step.title}
      </h3>
      <p className="max-w-[180px] text-xs text-viralyze-muted/70">{step.brief}</p>
    </motion.div>
  );
}

export default function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      className="relative bg-viralyze-soft-black py-20 sm:py-28"
      id="how-it-works"
    >
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-viralyze-white sm:text-4xl lg:text-5xl">
            How It <span className="text-gradient-wine">Works</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-viralyze-muted sm:text-lg">
            From idea to viral content in five simple steps. No learning curve.
          </p>
        </motion.div>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Connection Line - animated draw-in */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
              className="absolute left-0 right-0 top-[52px] h-px origin-left bg-gradient-to-r from-wine-accent/0 via-wine-accent/60 to-wine-accent/0"
            />

            <div className="grid grid-cols-5 gap-4">
              {steps.map((step, i) => (
                <StepCircle key={step.num} step={step} index={i} isInView={isInView} />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical Timeline with dashed line */}
        <div className="md:hidden">
          <div className="relative ml-6 pl-8">
            {/* Dashed connecting line */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 1.0, delay: 0.3, ease: 'easeOut' }}
              className="absolute left-0 top-0 bottom-0 w-px origin-top border-l border-dashed border-wine-accent/25"
            />

            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -16 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.12 }}
                className="relative mb-10 last:mb-0"
              >
                {/* Dot on line with glow */}
                <motion.div
                  initial={{ boxShadow: '0 0 0 rgba(184, 50, 90, 0)' }}
                  animate={
                    isInView
                      ? {
                          boxShadow:
                            '0 0 12px rgba(184, 50, 90, 0.4), 0 0 24px rgba(184, 50, 90, 0.15)',
                        }
                      : {}
                  }
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
                  className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-wine-accent bg-viralyze-black"
                >
                  <div className="h-2 w-2 rounded-full bg-wine-accent" />
                </motion.div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-wine-accent/15 bg-wine-accent/10">
                    <step.icon className="h-5 w-5 text-wine-accent" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-extrabold tabular-nums text-wine-accent">
                      {step.num}
                    </span>
                    <h3 className="mt-0.5 text-sm font-semibold text-viralyze-white">
                      {step.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-viralyze-muted/70">{step.brief}</p>
                    <p className="mt-1 text-xs leading-relaxed text-viralyze-muted">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
