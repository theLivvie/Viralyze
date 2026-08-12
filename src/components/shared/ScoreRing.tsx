'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { cn } from '@/lib/utils';

type Classification = 'low' | 'moderate' | 'high' | 'viral';

interface ScoreRingProps {
  score: number;
  size?: number;
  label?: string;
  showLabel?: boolean;
  classification?: string;
  confidence?: string;
}

const classificationColors: Record<string, string> = {
  low: 'bg-red-500/20 text-red-400 border-red-500/30',
  moderate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  high: 'bg-green-500/20 text-green-400 border-green-500/30',
  viral: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const classificationLabels: Record<string, string> = {
  low: 'Low Potential',
  moderate: 'Moderate Potential',
  high: 'High Potential',
  viral: 'Viral Potential',
};

export default function ScoreRing({
  score,
  size = 200,
  label,
  showLabel = true,
  classification,
  confidence,
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const animatedRef = useRef(false);

  const strokeWidth = Math.max(6, size * 0.04);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const motionProgress = useMotionValue(0);
  const motionScore = useMotionValue(0);
  const scoreDisplay = useTransform(motionScore, (v) => Math.round(v));
  const strokeDashoffset = useTransform(motionProgress, (v) => circumference - v);

  useEffect(() => {
    if (!animatedRef.current) {
      animatedRef.current = true;
      const scoreAnim = animate(motionScore, score, {
        duration: 1.8,
        ease: 'easeOut',
      });
      const ringAnim = animate(motionProgress, progress, {
        duration: 1.8,
        ease: 'easeOut',
      });
      return () => {
        scoreAnim.stop();
        ringAnim.stop();
      };
    }
  }, [score, progress, motionScore, motionProgress]);

  useEffect(() => {
    const unsubscribe = scoreDisplay.on('change', (v) => setDisplayScore(v));
    return unsubscribe;
  }, [scoreDisplay]);

  const cls = (classification || 'moderate') as Classification;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="score-ring -rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#B8325A"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-viralyze-white font-bold tabular-nums"
            style={{ fontSize: size * 0.28 }}
          >
            {displayScore}
          </motion.span>
          <span
            className="text-viralyze-muted"
            style={{ fontSize: size * 0.07 }}
          >
            /100
          </span>
        </div>
      </div>

      {/* Label */}
      {showLabel && label && (
        <span className="text-sm text-viralyze-muted">{label}</span>
      )}

      {/* Classification badge */}
      {classification && (
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
            classificationColors[cls]
          )}
        >
          {classificationLabels[cls] || classification}
        </span>
      )}

      {/* Confidence */}
      {confidence && (
        <span className="text-xs text-viralyze-muted">
          Confidence: {confidence}
        </span>
      )}
    </div>
  );
}
