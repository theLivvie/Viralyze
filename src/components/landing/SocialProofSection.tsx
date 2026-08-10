'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const brands = [
  'Luminary Studios',
  'NovaReach',
  'Pulse Media',
  'Vantage Digital',
  'Catalyst Co.',
  'Flux Creative',
  'Apex Social',
  'Orbit Agency',
];

export default function SocialProofSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section className="relative border-y border-white/5 bg-viralyze-soft-black py-12 sm:py-16">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-viralyze-muted sm:text-sm"
        >
          Trusted by creators, marketers & ambitious brands
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12"
        >
          {brands.map((brand, i) => (
            <div key={brand} className="flex items-center gap-4">
              <motion.span
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                className="whitespace-nowrap text-sm font-semibold tracking-wide text-viralyze-muted/50 transition-colors hover:text-viralyze-muted/80 sm:text-base"
              >
                {brand}
              </motion.span>
              {i < brands.length - 1 && (
                <span className="hidden h-4 w-px bg-white/10 sm:block" />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
