'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, TrendingUp, Zap, Target, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { useRef, useState, useCallback } from 'react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const scoreBars = [
  { label: 'Hook Strength', value: 92, color: 'bg-wine-accent' },
  { label: 'Engagement', value: 87, color: 'bg-wine' },
  { label: 'Shareability', value: 78, color: 'bg-wine-deep' },
  { label: 'Retention', value: 85, color: 'bg-wine-accent' },
];

const floatingParticles = [
  { x: '12%', y: '20%', size: 3, duration: 14, delay: 0, color: 'var(--color-wine-accent)' },
  { x: '75%', y: '15%', size: 2, duration: 18, delay: 2, color: 'var(--color-wine)' },
  { x: '60%', y: '70%', size: 4, duration: 16, delay: 1, color: 'var(--color-wine-accent)' },
  { x: '25%', y: '80%', size: 2, duration: 20, delay: 3, color: 'var(--color-wine-deep)' },
  { x: '85%', y: '55%', size: 3, duration: 15, delay: 4, color: 'var(--color-wine-accent)' },
  { x: '45%', y: '10%', size: 2, duration: 22, delay: 1.5, color: 'var(--color-wine)' },
  { x: '90%', y: '30%', size: 3, duration: 17, delay: 5, color: 'var(--color-wine-accent)' },
  { x: '35%', y: '60%', size: 2, duration: 19, delay: 2.5, color: 'var(--color-wine-deep)' },
];

function FloatingParticles() {
  // Use seeded values to avoid hydration mismatch (Math.random() differs between SSR and client)
  const seededParticles = Array.from({ length: 20 }).map((_, i) => {
    const seed = i * 7 + 3;
    return {
      width: `${(seed % 3) + 1}px`,
      height: `${(seed % 3) + 1}px`,
      left: `${(seed * 13) % 100}%`,
      top: `${(seed * 17) % 100}%`,
      duration: `${8 + (seed % 12)}s`,
      delay: `${(seed % 5)}s`,
      floatType: seed % 3,
    };
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Seeded particles for SSR consistency */}
      {seededParticles.map((p, i) => (
        <div
          key={`rand-${i}`}
          className="absolute rounded-full opacity-20"
          style={{
            width: p.width,
            height: p.height,
            left: p.left,
            top: p.top,
            background: `var(--color-wine-accent)`,
            animation: `float-${p.floatType} ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}
      {/* Extra accent particles with larger sizes and varied delays */}
      {[6, 12, 18].map((size, i) => (
        <motion.div
          key={`extra-${i}`}
          className="absolute rounded-full"
          animate={{
            y: [0, -20, 10, -15, 0],
            opacity: [0.08, 0.18, 0.12, 0.2, 0.08],
            scale: [1, 1.15, 0.95, 1.1, 1],
          }}
          transition={{
            duration: 10 + i * 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2,
          }}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${20 + i * 28}%`,
            top: `${30 + i * 18}%`,
            background: i === 1 ? 'var(--color-wine)' : 'var(--color-wine-accent)',
            filter: 'blur(1px)',
          }}
        />
      ))}
      {/* Intentional floating particle dots with different durations */}
      {floatingParticles.map((p, i) => (
        <motion.div
          key={`float-${i}`}
          className="absolute rounded-full"
          animate={{
            y: [-15, 15, -10, 20, -15],
            x: [-5, 8, -3, 5, -5],
            opacity: [0.15, 0.35, 0.2, 0.3, 0.15],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: p.x,
            top: p.y,
            background: p.color,
            filter: 'blur(0.5px)',
          }}
        />
      ))}
    </div>
  );
}

function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      role="img"
      aria-label="Animated dashboard mockup showing a viral analysis with a score of 87 out of 100, including engagement metrics and category breakdowns"
      animate={{
        opacity: 1,
        x: 0,
        scale: [0.95, 1, 1.02, 1, 1.02, 1],
      }}
      transition={{
        opacity: { duration: 0.8, delay: 0.8, ease: 'easeOut' },
        x: { duration: 0.8, delay: 0.8, ease: 'easeOut' },
        scale: {
          duration: 6,
          delay: 1.6,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
          times: [0, 0.17, 0.33, 0.5, 0.83, 1],
        },
      }}
      className="relative"
    >
      {/* Animated gradient border wrapper */}
      <div className="gradient-border rounded-2xl">
        <div className="glass-strong rounded-2xl p-5 sm:p-6 relative z-0">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-viralyze-success" />
              <span className="text-xs font-medium text-viralyze-muted">Live Analysis</span>
            </div>
            <span className="text-xs text-viralyze-muted">Instagram Reel</span>
          </div>

          {/* Score Circle */}
          <div className="mb-5 flex flex-col items-center">
            <div className="score-ring relative flex h-24 w-24 items-center justify-center">
              {/* Pulsing glow behind the score */}
              <div className="absolute inset-0 rounded-full animate-pulse-glow" style={{ filter: 'blur(8px)' }} />
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                <circle
                  cx="48" cy="48" r="42" fill="none" stroke="#B8325A" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${87 * 2.64} ${264}`}
                />
              </svg>
              <div className="text-center relative z-10">
                <span className="text-2xl font-bold text-viralyze-white">87</span>
                <span className="text-sm text-viralyze-muted">/100</span>
              </div>
            </div>
            <div className="mt-2 rounded-full bg-wine-accent/20 px-3 py-0.5">
              <span className="text-xs font-medium text-wine-accent">Viral Potential</span>
            </div>
          </div>

          {/* Score Bars */}
          <div className="space-y-3">
            {scoreBars.map((bar) => (
              <div key={bar.label}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-viralyze-muted">{bar.label}</span>
                  <span className="text-xs font-medium text-viralyze-white">{bar.value}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className={`h-full rounded-full ${bar.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.value}%` }}
                    transition={{ duration: 1, delay: 1.2, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer Stats */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { icon: Zap, label: 'Est. Likes', value: '24.5K' },
              { icon: TrendingUp, label: 'Shares', value: '1.2K' },
              { icon: Target, label: 'Saves', value: '3.8K' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-white/[0.03] p-2 text-center">
                <stat.icon className="mx-auto mb-1 h-3 w-3 text-wine-accent" />
                <p className="text-xs font-semibold text-viralyze-white">{stat.value}</p>
                <p className="text-[10px] text-viralyze-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const heroWords = ['Know', 'What', 'Will', 'Go', 'Viral', 'Before', 'You', 'Post.'];

export default function HeroSection() {
  const { setCurrentView, setScrollToSection, setAuthModal } = useAppStore();
  const sectionRef = useRef<HTMLElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const mockupY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="noise-bg relative flex min-h-screen items-center overflow-hidden bg-gradient-wine-radial pt-16"
    >
      {/* Dot grid background pattern */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />

      {/* Mouse-following spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(127,29,58,0.07), transparent 60%)`,
        }}
        aria-hidden="true"
      />

      <FloatingParticles />

      {/* Vignette overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(9,9,11,0.6) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Left Content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex-1 text-center lg:text-left"
          >
            <motion.div variants={item}>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-wine-accent/30 bg-wine-accent/10 px-3 py-1 text-xs font-medium text-wine-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-wine-accent animate-pulse" />
                AI-Powered Viral Prediction
              </span>
            </motion.div>

            {/* Staggered word animation heading */}
            <motion.h1
              variants={item}
              className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-viralyze-white sm:text-5xl lg:text-6xl"
            >
              {heroWords.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.6 + i * 0.08,
                    ease: 'easeOut',
                  }}
                  className={word === 'Viral' ? 'text-gradient-wine mr-1.5 inline-block' : 'mr-1.5 inline-block'}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-2 text-xs tracking-widest uppercase text-viralyze-muted/40 animate-pulse-glow"
              style={{ animationDuration: '3s' }}
            >
              Trusted by 10,000+ creators worldwide
            </motion.p>

            <motion.p
              variants={item}
              className="mt-6 max-w-lg text-base leading-relaxed text-viralyze-muted sm:text-lg lg:max-w-xl"
            >
              Stop guessing. Our AI analyzes your content before you hit publish,
              predicting engagement, virality, and giving you actionable optimizations.
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                onClick={() => { setAuthModal(true, 'login'); }}
                size="lg"
                className="bg-gradient-wine border-0 px-6 text-viralyze-white hover:opacity-90 transition-opacity"
                aria-label="Analyze content - sign up or log in"
              >
                Analyze Content
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setScrollToSection('how-it-works')}
                variant="outline"
                size="lg"
                className="border-white/10 bg-transparent text-viralyze-white hover:bg-white/5 hover:text-viralyze-white"
                aria-label="See how Viralyze works"
              >
                See How It Works
              </Button>
            </motion.div>

            {/* Stats Row with trend arrows */}
            <motion.div variants={item} className="mt-10 flex items-center gap-6 sm:justify-center lg:justify-start">
              <div className="text-center">
                <p className="text-xl font-bold text-viralyze-white flex items-center justify-center gap-1">
                  50K+<ArrowUpRight className="h-4 w-4 text-viralyze-success" />
                </p>
                <p className="text-xs text-viralyze-muted">Predictions</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-xl font-bold text-viralyze-white flex items-center justify-center gap-1">
                  94%<ArrowUpRight className="h-4 w-4 text-viralyze-success" />
                </p>
                <p className="text-xs text-viralyze-muted">Accuracy</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-xl font-bold text-viralyze-white flex items-center justify-center gap-1">
                  2.8x<ArrowUpRight className="h-4 w-4 text-viralyze-success" />
                </p>
                <p className="text-xs text-viralyze-muted">Avg. Boost</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Mockup with parallax */}
          <div className="w-full max-w-sm flex-shrink-0 lg:max-w-md">
            <motion.div ref={mockupRef} style={{ y: mockupY }}>
              <DashboardMockup />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
