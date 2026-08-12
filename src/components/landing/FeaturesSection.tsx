'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  Brain,
  Crosshair,
  Sparkles,
  BarChart3,
  TrendingUp,
  Lightbulb,
  Search,
  Eye,
  Target,
  Rocket,
} from 'lucide-react';

const mainFeatures = [
  {
    emoji: '🔮',
    title: 'Predict',
    subtitle: 'How strong is this content?',
    description: 'Get a precise viral score from 0-100 for any content idea, post, or script before you publish.',
    icon: Target,
  },
  {
    emoji: '🧠',
    title: 'Understand',
    subtitle: 'Why will it work or fail?',
    description: 'Deep AI analysis breaks down hook strength, emotional triggers, audience fit, and trend alignment.',
    icon: Brain,
  },
  {
    emoji: '🚀',
    title: 'Optimize',
    subtitle: 'What should I change?',
    description: 'Get specific, actionable suggestions to improve your content score by 20-40% before posting.',
    icon: Rocket,
  },
];

const subFeatures = [
  {
    icon: Crosshair,
    title: 'AI Prediction',
    description: 'Machine learning models trained on millions of viral posts across every platform.',
  },
  {
    icon: Eye,
    title: 'Hook Analyzer',
    description: 'Instantly evaluate if your opening line will stop the scroll and capture attention.',
  },
  {
    icon: TrendingUp,
    title: 'Trend Radar',
    description: 'Real-time trend detection to align your content with what\'s gaining momentum right now.',
  },
  {
    icon: Sparkles,
    title: 'Content Optimizer',
    description: 'AI-powered rewrites and structural improvements to maximize engagement potential.',
  },
  {
    icon: Lightbulb,
    title: 'Idea Generator',
    description: 'Never run out of ideas. Get viral content concepts tailored to your niche.',
  },
  {
    icon: Search,
    title: 'Competitor Intelligence',
    description: 'Analyze what\'s working for competitors and apply those patterns to your own content.',
  },
];

const marqueeBadges = [
  'AI-Powered', 'Real-time', 'Multi-Platform', 'GPT-4 Integration', 'Hook Analysis',
  'Trend Detection', 'Content Scoring', 'Viral Prediction', 'Engagement Forecast',
  'Smart Suggestions', 'Creator Analytics', 'Optimization Engine', 'Sentiment Analysis',
  'Audience Insights', 'Viral Patterns',
];

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-28" id="features">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-viralyze-white sm:text-4xl lg:text-5xl">
            Three Engines.{' '}
            <span className="text-gradient-wine">One Platform.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-viralyze-muted sm:text-lg">
            Every piece of content goes through our three-layer AI analysis pipeline for comprehensive prediction.
          </p>
        </motion.div>

        {/* Main Feature Cards with parallax */}
        <motion.div
          style={{ y: parallaxY }}
          className="mb-16 grid gap-6 md:grid-cols-3"
        >
          {mainFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.12 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8 transition-all duration-300 hover:border-wine-accent/30 hover:glow-wine-sm hover:shadow-[0_0_30px_rgba(127,29,58,0.25)]"
            >
              <div className="mb-4 text-4xl">{feature.emoji}</div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-wine-accent/10">
                <motion.div
                  whileHover={{ rotate: 90, transition: { duration: 0.4, ease: 'easeInOut' } }}
                >
                  <feature.icon className="h-5 w-5 text-wine-accent" />
                </motion.div>
              </div>
              <h3 className="mb-1 text-xl font-bold text-viralyze-white">{feature.title}</h3>
              <p className="mb-3 text-sm font-medium text-wine-accent">{feature.subtitle}</p>
              <p className="text-sm leading-relaxed text-viralyze-muted">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Gradient Line Separator */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          className="glow-line mb-12 origin-left"
          style={{
            background: 'linear-gradient(90deg, transparent, #B8325A, #7F1D3A, transparent)',
          }}
        />

        {/* Sub Feature Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.7 + i * 0.08 }}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
              className="flex gap-4 rounded-xl border border-white/5 bg-white/[0.01] p-4 transition-all hover:border-white/10 hover:bg-white/[0.03] hover:glow-wine-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-wine-accent/10 relative">
                <feature.icon className="h-5 w-5 text-wine-accent" />
                {/* Number badge circle with wine-accent border */}
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border border-wine-accent/60 bg-viralyze-soft-black text-[9px] font-bold text-wine-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold text-viralyze-white">{feature.title}</h4>
                <p className="text-xs leading-relaxed text-viralyze-muted">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Horizontal marquee of capability badges */}
        <div className="relative mt-16 overflow-hidden">
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-24" style={{ background: 'linear-gradient(to right, var(--color-background), transparent)' }} />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-24" style={{ background: 'linear-gradient(to left, var(--color-background), transparent)' }} />

          <motion.div
            animate={{ x: [0, -2400] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 40,
                ease: 'linear',
              },
            }}
            className="flex w-max gap-3"
          >
            {[...marqueeBadges, ...marqueeBadges, ...marqueeBadges].map((badge, i) => (
              <span
                key={`${badge}-${i}`}
                className="whitespace-nowrap rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[11px] font-medium text-viralyze-muted/60"
              >
                {badge}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
