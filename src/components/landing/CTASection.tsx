'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const { setAuthModal } = useAppStore();

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      {/* Wine Gradient Background */}
      <div className="absolute inset-0 bg-gradient-wine opacity-90" />
      <div className="absolute inset-0 bg-gradient-wine-radial" />

      {/* Decorative elements */}
      <div className="absolute left-1/4 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-wine-accent/10 blur-3xl" />
      <div className="absolute right-1/4 bottom-0 h-48 w-48 translate-x-1/2 rounded-full bg-wine-deep/20 blur-3xl" />

      <div ref={ref} className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-viralyze-white">
            <Sparkles className="h-3.5 w-3.5" />
            Free to start — No credit card required
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-viralyze-white sm:text-4xl lg:text-5xl">
            Stop Guessing.{' '}
            <span className="text-viralyze-white">Start Predicting.</span>
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-base text-viralyze-white/70 sm:text-lg">
            Join thousands of creators who use Viralyze to turn good content into viral hits.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={() => setAuthModal(true, 'signup')}
              size="lg"
              className="bg-viralyze-white text-wine-deep border-0 hover:bg-viralyze-white/90 transition-colors font-semibold"
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
