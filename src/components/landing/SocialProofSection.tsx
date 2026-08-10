'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const row1 = ['Luminary Studios', 'NovaReach', 'Pulse Media', 'Vantage Digital'];
const row2 = ['Catalyst Co.', 'Flux Creative', 'Apex Social', 'Orbit Agency'];

export default function SocialProofSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section className="relative border-y border-white/5 bg-viralyze-soft-black py-12 sm:py-16">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* As Seen On Label */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-viralyze-muted/40 sm:text-xs"
        >
          As Seen On
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-viralyze-muted sm:text-sm"
        >
          Trusted by creators, marketers & ambitious brands
        </motion.p>

        {/* Row 1 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 sm:gap-x-10"
        >
          {row1.map((brand, i) => (
            <div key={brand} className="flex items-center gap-6">
              <motion.span
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                className="whitespace-nowrap text-sm font-bold tracking-wide text-viralyze-muted/50 transition-all duration-300 hover:text-viralyze-muted/90 sm:text-base"
              >
                {brand}
              </motion.span>
              {i < row1.length - 1 && (
                <span className="hidden h-3 w-px bg-white/[0.06] sm:block" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Animated Gradient Line Separator */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isInView ? { scaleX: 1, opacity: 0.4 } : {}}
          transition={{ duration: 1.0, delay: 0.5, ease: 'easeOut' }}
          className="glow-line bg-gradient-wine mx-auto my-4 max-w-md sm:my-6 sm:max-w-lg"
        />

        {/* Row 2 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 sm:gap-x-10"
        >
          {row2.map((brand, i) => (
            <div key={brand} className="flex items-center gap-6">
              <motion.span
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                className="whitespace-nowrap text-sm font-bold tracking-wide text-viralyze-muted/50 transition-all duration-300 hover:text-viralyze-muted/90 sm:text-base"
              >
                {brand}
              </motion.span>
              {i < row2.length - 1 && (
                <span className="hidden h-3 w-px bg-white/[0.06] sm:block" />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
