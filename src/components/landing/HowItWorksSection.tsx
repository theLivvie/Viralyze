'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
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

export default function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="relative py-20 sm:py-28 bg-viralyze-soft-black" id="how-it-works">
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
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 24 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Step Circle with glow when in view */}
                  <motion.div
                    initial={{ boxShadow: '0 0 0 rgba(184, 50, 90, 0)' }}
                    animate={isInView ? { boxShadow: '0 0 20px rgba(184, 50, 90, 0.3), 0 0 40px rgba(184, 50, 90, 0.1)' } : {}}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
                    className="relative z-10 mb-4 flex h-[104px] w-[104px] items-center justify-center rounded-full border border-wine-accent/30 bg-viralyze-black"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <step.icon className="h-6 w-6 text-wine-accent" />
                      <span className="text-[10px] font-bold text-viralyze-muted/60">STEP</span>
                    </div>
                  </motion.div>

                  {/* Step Number */}
                  <span className="mb-1 text-xs font-bold text-wine-accent">{step.num}</span>
                  <h3 className="mb-1 text-sm font-semibold text-viralyze-white">{step.title}</h3>
                  <p className="text-xs text-viralyze-muted/70 max-w-[180px]">{step.brief}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="md:hidden">
          <div className="relative ml-6 border-l border-white/10 pl-8">
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
                  animate={isInView ? { boxShadow: '0 0 12px rgba(184, 50, 90, 0.4)' } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
                  className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-wine-accent bg-viralyze-black"
                >
                  <div className="h-2 w-2 rounded-full bg-wine-accent" />
                </motion.div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-wine-accent/10">
                    <step.icon className="h-5 w-5 text-wine-accent" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-wine-accent">{step.num}</span>
                    <h3 className="mt-0.5 text-sm font-semibold text-viralyze-white">{step.title}</h3>
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
