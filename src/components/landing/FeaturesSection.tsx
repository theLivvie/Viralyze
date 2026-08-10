'use client';

import { motion, useInView } from 'framer-motion';
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

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="relative py-20 sm:py-28" id="features">
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

        {/* Main Feature Cards */}
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {mainFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.12 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-colors hover:border-wine-accent/30 sm:p-8"
            >
              <div className="mb-4 text-4xl">{feature.emoji}</div>
              <h3 className="mb-1 text-xl font-bold text-viralyze-white">{feature.title}</h3>
              <p className="mb-3 text-sm font-medium text-wine-accent">{feature.subtitle}</p>
              <p className="text-sm leading-relaxed text-viralyze-muted">{feature.description}</p>
              <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100 glow-wine-sm pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* Sub Feature Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.08 }}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
              className="flex gap-4 rounded-xl border border-white/5 bg-white/[0.01] p-4 transition-colors hover:border-white/10 hover:bg-white/[0.03]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-wine-accent/10">
                <feature.icon className="h-5 w-5 text-wine-accent" />
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold text-viralyze-white">{feature.title}</h4>
                <p className="text-xs leading-relaxed text-viralyze-muted">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
