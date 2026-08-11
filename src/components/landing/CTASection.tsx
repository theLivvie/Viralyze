'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

const particles = [
  { x: '12%', y: '20%', size: 3, delay: 0, duration: 6 },
  { x: '85%', y: '15%', size: 2, delay: 1.2, duration: 7 },
  { x: '20%', y: '75%', size: 2.5, delay: 0.8, duration: 5.5 },
  { x: '78%', y: '70%', size: 2, delay: 2, duration: 6.5 },
  { x: '45%', y: '10%', size: 1.5, delay: 1.5, duration: 8 },
  { x: '60%', y: '85%', size: 2, delay: 0.5, duration: 7.5 },
  { x: '30%', y: '50%', size: 1.5, delay: 3, duration: 6 },
  { x: '90%', y: '45%', size: 2.5, delay: 2.5, duration: 5 },
];

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const { setAuthModal } = useAppStore();

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 noise-bg">
      {/* Wine Gradient Background */}
      <div className="absolute inset-0 bg-gradient-wine opacity-90" />
      <div className="absolute inset-0 bg-gradient-wine-radial" />

      {/* Decorative blurs */}
      <div className="absolute left-1/4 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-wine-accent/10 blur-3xl" />
      <div className="absolute right-1/4 bottom-0 h-48 w-48 translate-x-1/2 rounded-full bg-wine-deep/20 blur-3xl" />

      {/* Animated Radial Glow behind CTA text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(184, 50, 90, 0.25) 0%, rgba(127, 29, 58, 0.1) 40%, transparent 70%)',
        }}
      />

      {/* Floating glass particle dots */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={
            isInView
              ? {
                  opacity: [0, 0.6, 0.3, 0.6, 0],
                  y: [0, -12, 6, -8, 0],
                }
              : {}
          }
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="glass pointer-events-none absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
          }}
        />
      ))}

      <div
        ref={ref}
        className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="glow-line mx-auto mb-8 max-w-xs" />

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-viralyze-white transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Sparkles className="h-3.5 w-3.5" />
            Free to start — No credit card required
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-viralyze-white sm:text-4xl lg:text-5xl">
            Stop Guessing.{' '}
            <span className="text-viralyze-white">Start Predicting.</span>
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-base text-viralyze-white/70 sm:text-lg">
            Join thousands of creators who use Viralyze to turn good content into
            viral hits.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={() => setAuthModal(true, 'signup')}
              size="lg"
              className="btn-shine border-0 bg-gradient-to-r from-viralyze-white via-white to-viralyze-white font-bold text-wine-deep shadow-lg shadow-white/10 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
