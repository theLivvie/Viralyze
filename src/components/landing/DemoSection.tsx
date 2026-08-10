'use client';

import { motion, useInView, animate } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Zap, Target, Clock, Hash } from 'lucide-react';

const platforms = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'x', label: 'X' },
  { id: 'linkedin', label: 'LinkedIn' },
];

const demoScores = [
  { label: 'Hook Strength', icon: Zap, value: 91, color: '#B8325A' },
  { label: 'Engagement', icon: TrendingUp, value: 84, color: '#7F1D3A' },
  { label: 'Retention', icon: Clock, value: 88, color: '#B8325A' },
  { label: 'Shareability', icon: Target, value: 79, color: '#7F1D3A' },
  { label: 'Trend Fit', icon: Hash, value: 93, color: '#B8325A' },
];

const demoText = 'A day in my life as a startup founder — from 5am wakeups to midnight pivot decisions. Real, unfiltered, no filters. This is what building a company actually looks like.';

function CountUpNumber({ target, delay, isInView }: { target: number; delay: number; isInView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const timeout = setTimeout(() => {
      const controls = animate(0, target, {
        duration: 1.2,
        ease: 'easeOut',
        onUpdate: (v) => setCount(Math.round(v)),
      });
      return () => controls.stop();
    }, delay);
    return () => clearTimeout(timeout);
  }, [isInView, target, delay]);

  return <span>{count}</span>;
}

function TypingText({ text, delay, isInView }: { text: string; delay: number; isInView: boolean }) {
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    const timeout = setTimeout(() => {
      setTyping(true);
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setTyping(false);
        }
      }, 20);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [isInView, text, delay]);

  return (
    <>
      {displayed}
      {typing && <span className="blink-cursor" />}
    </>
  );
}

export default function DemoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');

  return (
    <section className="relative py-20 sm:py-28 bg-viralyze-soft-black" id="demo">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-viralyze-white sm:text-4xl lg:text-5xl">
            See It <span className="text-gradient-wine">In Action</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-viralyze-muted sm:text-lg">
            Watch how Viralyze analyzes a content idea in seconds and gives you a complete viral potential breakdown.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="glass-strong mx-auto max-w-3xl rounded-2xl p-5 sm:p-8 relative overflow-hidden"
        >
          {/* Scanning line animation across the result card */}
          {isInView && (
            <div className="scan-line-animated" />
          )}

          {/* Platform Selector */}
          <div className="mb-4 flex flex-wrap gap-2">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  selectedPlatform === p.id
                    ? 'bg-wine-accent/20 text-wine-accent border border-wine-accent/30'
                    : 'bg-white/[0.03] text-viralyze-muted border border-white/5 hover:bg-white/[0.06]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Fake Input */}
          <div className="mb-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="mb-1 text-xs font-medium text-viralyze-muted/60">Content Idea</p>
            <p className="text-sm leading-relaxed text-viralyze-white/90">
              <TypingText text={demoText} delay={800} isInView={isInView} />
            </p>
          </div>

          {/* Analyzing Indicator */}
          {isInView && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.4 }}
              className="mb-6"
            >
              <div className="flex items-center gap-2 rounded-lg bg-wine-accent/10 p-3">
                <Sparkles className="h-4 w-4 text-wine-accent" />
                <span className="text-xs font-medium text-wine-accent">Analysis Complete — Viral Potential Detected</span>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {isInView && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.8, duration: 0.5 }}
              className="space-y-4"
            >
              {/* Overall Score */}
              <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="score-ring flex h-16 w-16 shrink-0 items-center justify-center">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                    <circle
                      cx="32" cy="32" r="28" fill="none" stroke="#B8325A" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${87 * 1.76} 176`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <span className="text-lg font-bold text-viralyze-white">
                    <CountUpNumber target={87} delay={3000} isInView={isInView} />
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-viralyze-white">Overall Viral Score</p>
                  <p className="mt-0.5 text-xs text-viralyze-muted">Strong viral potential with minor optimizations needed</p>
                </div>
              </div>

              {/* Score Bars */}
              <div className="grid gap-3 sm:grid-cols-2">
                {demoScores.map((score, i) => (
                  <motion.div
                    key={score.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 3.2 + i * 0.12, duration: 0.4 }}
                    className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <score.icon className="h-3.5 w-3.5 text-viralyze-muted" />
                        <span className="text-xs font-medium text-viralyze-muted">{score.label}</span>
                      </div>
                      <span className="text-xs font-bold text-viralyze-white">
                        <CountUpNumber target={score.value} delay={3200 + i * 120} isInView={isInView} />
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: score.color }}
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${score.value}%` } : {}}
                        transition={{ delay: 3.4 + i * 0.12, duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
