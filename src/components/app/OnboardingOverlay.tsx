'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, BarChart3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'viralyze_onboarded';

const steps = [
  {
    title: 'Welcome to Viralyze!',
    description:
      'AI-powered viral content prediction for every platform. Analyze, optimize, and publish content that performs.',
    icon: Sparkles,
  },
  {
    title: 'Start with a Prediction',
    description:
      'Enter your content idea or paste existing text. Viralyze scores your content across 9 dimensions and predicts engagement across platforms.',
    icon: Zap,
  },
  {
    title: 'Explore & Analyze',
    description:
      'Browse your saved library, discover trending topics, and track performance analytics. Everything you need to create viral content.',
    icon: BarChart3,
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
  }),
};

export default function OnboardingOverlay() {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const onboarded = localStorage.getItem(STORAGE_KEY);
    if (!onboarded) {
      // Short delay so the app renders first
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const complete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else {
      complete();
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const IconComponent = steps[currentStep].icon;

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={complete} />

        {/* Overlay card */}
        <div className="gradient-border rounded-2xl p-[1px]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative glass-strong rounded-2xl p-6 sm:p-8 max-w-md w-full border border-white/[0.08] shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={complete}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors text-viralyze-muted/60 hover:text-viralyze-white"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Step content with slide animation */}
          <div className="relative overflow-hidden min-h-[200px] flex flex-col items-center text-center">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex flex-col items-center text-center gap-4 py-4"
              >
                {/* Icon */}
                <div className="relative">
                  <div className="absolute inset-0 -z-10 blur-2xl rounded-2xl bg-wine-accent/20" />
                  <div className="h-16 w-16 rounded-2xl bg-wine-accent/15 border border-wine-accent/20 flex items-center justify-center">
                    <IconComponent className="h-8 w-8 text-wine-accent" />
                  </div>
                </div>

                {/* Step indicator */}
                <span className="text-[10px] uppercase tracking-[0.25em] text-viralyze-muted/50 font-medium">
                  Step {currentStep + 1} of {steps.length}
                </span>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-bold text-viralyze-white">
                  {steps[currentStep].title}
                </h2>

                {/* Description */}
                <p className="text-sm text-viralyze-muted/70 max-w-xs leading-relaxed">
                  {steps[currentStep].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Glow-line separator */}
          <div className="glow-line mb-4" />

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-2 mb-6">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? 'w-6 bg-wine-accent'
                    : i < currentStep
                      ? 'w-2 bg-wine-accent/40'
                      : 'w-2 bg-white/[0.1]'
                }`}
                animate={{ scale: i === currentStep ? 1 : 0.85 }}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                onClick={goPrev}
                className="flex-1 text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.08]"
              >
                Back
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={complete}
              className="text-viralyze-muted/50 hover:text-viralyze-muted hover:bg-white/[0.04] text-xs px-3"
            >
              Skip
            </Button>
            <Button
              onClick={goNext}
              className={cn(
                'flex-1 bg-wine-accent hover:bg-wine-accent/90 text-white font-medium transition-colors',
                currentStep === steps.length - 1 && 'btn-shine'
              )}
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
