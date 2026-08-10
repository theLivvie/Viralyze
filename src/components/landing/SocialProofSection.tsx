'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Globe, Film, Megaphone, BarChart3, Palette, Rocket, Share2, Star } from 'lucide-react';

const brands = [
  { name: 'Luminary Studios', icon: Film },
  { name: 'NovaReach', icon: Globe },
  { name: 'Pulse Media', icon: Share2 },
  { name: 'Vantage Digital', icon: BarChart3 },
  { name: 'Catalyst Co.', icon: Rocket },
  { name: 'Flux Creative', icon: Palette },
  { name: 'Apex Social', icon: Megaphone },
  { name: 'Orbit Agency', icon: Star },
];

const allBrands = [...brands, ...brands, ...brands, ...brands];
const row2Brands = [...brands.slice(4), ...brands.slice(0, 4), ...brands.slice(4), ...brands.slice(0, 4)];

function MarqueeRow({ brandsList, speed = 30, reverse = false }: { brandsList: typeof brands; speed?: number; reverse?: boolean }) {
  // Each brand item is ~160px wide + 48px gap = ~208px. Use half the list width for seamless loop.
  const halfWidth = (brandsList.length / 2) * 192;
  return (
    <div className="relative flex overflow-hidden">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-16" style={{ background: 'linear-gradient(to right, var(--color-viralyze-soft-black), transparent)' }} />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-16" style={{ background: 'linear-gradient(to left, var(--color-viralyze-soft-black), transparent)' }} />

      <motion.div
        animate={{ x: reverse ? [0, halfWidth] : [0, -halfWidth] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: speed,
            ease: 'linear',
          },
        }}
        className="flex shrink-0 items-center gap-12"
      >
        {brandsList.map((brand, i) => (
          <div
            key={`${brand.name}-${i}`}
            className="flex shrink-0 items-center gap-2.5"
          >
            <brand.icon className="h-4 w-4 text-wine-accent/40" />
            <span className="whitespace-nowrap text-sm font-bold tracking-wide text-viralyze-muted/40 transition-all duration-300 hover:text-viralyze-muted/80 sm:text-base">
              {brand.name}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

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
      </div>

      {/* Row 1 - infinite marquee scrolling right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <MarqueeRow brandsList={allBrands} speed={35} />
      </motion.div>

      {/* Animated Gradient Line Separator */}
      <div className="my-4 flex items-center justify-center sm:my-6">
        <div
          className="glow-line mx-4 max-w-xs"
          style={{
            background: 'linear-gradient(90deg, transparent, #B8325A, #7F1D3A, transparent)',
          }}
        />
      </div>

      {/* Row 2 - infinite marquee scrolling left (reverse) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <MarqueeRow brandsList={row2Brands} speed={32} reverse />
      </motion.div>
    </section>
  );
}
