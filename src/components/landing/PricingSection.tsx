'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';

const planData = {
  monthly: [
    {
      name: 'Free',
      price: '$0',
      rawPrice: 0,
      period: '/mo',
      description: 'Try Viralyze with basic predictions.',
      highlighted: false,
      features: [
        '5 predictions per month',
        'Basic score breakdown',
        '1 platform support',
        'Community support',
      ],
      cta: 'Start Free',
    },
    {
      name: 'Creator',
      price: '$19',
      rawPrice: 19,
      period: '/mo',
      description: 'For serious creators who want to grow.',
      highlighted: true,
      features: [
        '100 predictions per month',
        'Advanced 9-category analysis',
        'AI optimization suggestions',
        'Content idea generator',
        'Trend intelligence',
        'All 5 platforms',
        'Priority support',
      ],
      cta: 'Get Creator',
    },
    {
      name: 'Pro',
      price: '$49',
      rawPrice: 49,
      period: '/mo',
      description: 'For teams and power users.',
      highlighted: false,
      features: [
        '500 predictions per month',
        'Advanced analytics dashboard',
        'Personal content model',
        'Competitor analysis',
        'Team collaboration (5 seats)',
        'API access',
        'Custom reports',
        'Dedicated support',
      ],
      cta: 'Get Pro',
    },
  ],
  yearly: [
    {
      name: 'Free',
      price: '$0',
      rawPrice: 0,
      period: '/yr',
      description: 'Try Viralyze with basic predictions.',
      highlighted: false,
      features: [
        '5 predictions per month',
        'Basic score breakdown',
        '1 platform support',
        'Community support',
      ],
      cta: 'Start Free',
    },
    {
      name: 'Creator',
      price: '$190',
      rawPrice: 190,
      period: '/yr',
      description: 'For serious creators who want to grow.',
      highlighted: true,
      features: [
        '100 predictions per month',
        'Advanced 9-category analysis',
        'AI optimization suggestions',
        'Content idea generator',
        'Trend intelligence',
        'All 5 platforms',
        'Priority support',
      ],
      cta: 'Get Creator',
    },
    {
      name: 'Pro',
      price: '$490',
      rawPrice: 490,
      period: '/yr',
      description: 'For teams and power users.',
      highlighted: false,
      features: [
        '500 predictions per month',
        'Advanced analytics dashboard',
        'Personal content model',
        'Competitor analysis',
        'Team collaboration (5 seats)',
        'API access',
        'Custom reports',
        'Dedicated support',
      ],
      cta: 'Get Pro',
    },
  ],
};

export default function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const { setAuthModal } = useAppStore();
  const [isYearly, setIsYearly] = useState(false);

  const handleSelectPlan = () => {
    setAuthModal(true, 'signup');
  };

  const plans = isYearly ? planData.yearly : planData.monthly;

  return (
    <section className="relative py-20 sm:py-28" id="pricing">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-viralyze-white sm:text-4xl lg:text-5xl">
            Simple,{' '}
            <span className="text-gradient-wine">Transparent</span>{' '}
            Pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-viralyze-muted sm:text-lg">
            Start free. Upgrade when you&apos;re ready to go viral.
          </p>
        </motion.div>

        {/* Monthly/Yearly Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 flex items-center justify-center gap-4"
        >
          <span className={`text-sm font-medium transition-colors duration-300 ${!isYearly ? 'text-viralyze-white' : 'text-viralyze-muted'}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative flex h-7 w-12 items-center rounded-full border border-white/10 bg-white/[0.05] p-0.5 transition-colors duration-300"
            aria-label="Toggle yearly pricing"
          >
            <motion.div
              animate={{ x: isYearly ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`h-6 w-6 rounded-full transition-colors duration-300 ${isYearly ? 'bg-wine-accent' : 'bg-viralyze-muted/50'}`}
            />
          </button>
          <span className={`text-sm font-medium transition-colors duration-300 ${isYearly ? 'text-viralyze-white' : 'text-viralyze-muted'}`}>Yearly</span>
          {isYearly && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-full bg-viralyze-success/15 px-2.5 py-0.5 text-xs font-semibold text-viralyze-success"
            >
              Save 17%
            </motion.span>
          )}
        </motion.div>

        {/* Animated gradient line above pricing grid */}
        <div className="glow-line mx-auto mb-10 max-w-xs" />

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={`${plan.name}-${isYearly ? 'yearly' : 'monthly'}`}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.12 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.25 } }}
              className={`relative flex flex-col rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
                plan.highlighted
                  ? 'border-wine-accent/40 bg-gradient-wine-subtle glow-wine'
                  : 'border-white/5 bg-white/[0.02] hover:bg-wine-accent/[0.03] hover:glow-wine-sm'
              } border overflow-hidden`}
            >
              {/* Popular badge with pulse animation */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-wine-accent text-white border-0 px-3 py-0.5 animate-pulse-glow">
                    Popular
                  </Badge>
                </div>
              )}

              {/* Watermark behind Creator card */}
              {plan.highlighted && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[80px] font-black text-wine-accent/[0.04] select-none uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6 relative z-10">
                <h3 className="text-lg font-bold text-viralyze-white flex items-center gap-2">
                  {plan.name}
                  {plan.highlighted && <Sparkles className="h-4 w-4 text-wine-accent" />}
                </h3>
                <p className="mt-1 text-xs text-viralyze-muted">{plan.description}</p>
              </div>

              <div className="mb-6 flex items-baseline gap-1 relative z-10">
                <span className="text-5xl font-extrabold text-viralyze-white">{plan.price}</span>
                <span className="text-sm text-viralyze-muted">{plan.period}</span>
              </div>

              <ul className="mb-8 flex-1 space-y-3 relative z-10">
                {plan.features.map((feature, fi) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -8 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.4 + i * 0.12 + fi * 0.06, duration: 0.35 }}
                    className="flex items-start gap-2.5"
                  >
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${
                      plan.highlighted ? 'text-wine-accent' : 'text-viralyze-muted'
                    }`} />
                    <span className="text-sm text-viralyze-muted">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <Button
                onClick={handleSelectPlan}
                variant={plan.highlighted ? 'default' : 'outline'}
                className={`w-full relative z-10 ${
                  plan.highlighted
                    ? 'btn-shine bg-gradient-wine border-0 text-viralyze-white hover:opacity-90 transition-opacity'
                    : 'border-white/10 bg-transparent text-viralyze-white hover:bg-white/5 hover:text-viralyze-white'
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
