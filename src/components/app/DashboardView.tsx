'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  FileText,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Instagram,
  Youtube,
  Tv,
  Twitter,
  Linkedin,
  Search,
  Zap,
  Share2,
  Recycle,
  Trophy,
  RefreshCw,
  AlertCircle,
  Target,
  Award,
  TrendingDown,
  CheckCircle2,
  ChevronDown,
  Activity,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import type { Platform, Classification } from '@/lib/types';
import { cn } from '@/lib/utils';

const platformIcons: Record<Platform, React.ElementType> = {
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Tv,
  x: Twitter,
  linkedin: Linkedin,
};

const platformLabels: Record<Platform, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  x: 'X',
  linkedin: 'LinkedIn',
};

const classificationStyles: Record<Classification, string> = {
  low: 'bg-red-500/20 text-red-400',
  moderate: 'bg-amber-500/20 text-amber-400',
  high: 'bg-green-500/20 text-green-400',
  viral: 'bg-emerald-500/20 text-emerald-400',
};

const classificationDotColors: Record<Classification, string> = {
  low: 'bg-red-400',
  moderate: 'bg-amber-400',
  high: 'bg-green-400',
  viral: 'bg-emerald-400',
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// Helper to parse predicted engagement string (e.g. '2.5K', '1.2M') to a number
function parseEngagementValue(val: string | undefined): number {
  if (!val) return 0;
  const str = val.replace(/,/g, '').trim();
  const num = parseFloat(str);
  if (isNaN(num)) return 0;
  const upper = str.toUpperCase();
  if (upper.endsWith('M')) return num * 1000000;
  if (upper.endsWith('K')) return num * 1000;
  return num;
}

interface ActualPerformance {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

function getAccuracyColor(offPercent: number): string {
  if (offPercent <= 30) return 'text-green-400';
  if (offPercent <= 60) return 'text-amber-400';
  return 'text-red-400';
}

function getAccuracyBg(offPercent: number): string {
  if (offPercent <= 30) return 'bg-green-500/10 border-green-500/20';
  if (offPercent <= 60) return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-red-500/10 border-red-500/20';
}

function getAccuracyLabel(offPercent: number): string {
  if (offPercent <= 30) return 'Accurate';
  if (offPercent <= 60) return 'Moderate';
  return 'Off Target';
}

function scoreBarColor(score: number): string {
  if (score >= 70) return 'bg-green-400';
  if (score >= 50) return 'bg-amber-400';
  return 'bg-red-400';
}

function ScoreHistory({ scores }: { scores: number[] }) {
  if (scores.length === 0) return null;

  // Take last 10 scores
  const recent = scores.slice(-10);
  const maxScore = 100;

  return (
    <div className="flex items-end gap-1 h-12">
      {recent.map((score, i) => {
        const height = Math.max(4, (score / maxScore) * 100);
        return (
          <motion.div
            key={i}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: `${height}%`, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: i * 0.06,
              ease: 'easeOut',
            }}
            className={cn(
              'flex-1 rounded-sm min-w-[6px] max-w-[24px]',
              scoreBarColor(score)
            )}
            title={`Score: ${score}`}
          />
        );
      })}
    </div>
  );
}

export default function DashboardView() {
  const { savedAnalyses, setCurrentView, setCurrentAnalysis, setPredictMode, setPrefilledIdea, setPredictPlatform, setPredictContentType, user } = useAppStore();

  const totalAnalyses = savedAnalyses.length;
  const avgScore =
    totalAnalyses > 0
      ? Math.round(savedAnalyses.reduce((s, a) => s + a.overallScore, 0) / totalAnalyses)
      : 0;
  const bestScore =
    totalAnalyses > 0
      ? Math.max(...savedAnalyses.map((a) => a.overallScore))
      : 0;

  const [viewingId, setViewingId] = useState<string | null>(null);
  const [trackingExpandedId, setTrackingExpandedId] = useState<string | null>(null);
  const [actualInputs, setActualInputs] = useState<Record<string, ActualPerformance>>({});
  const [savedActuals, setSavedActuals] = useState<Record<string, ActualPerformance>>(() => {
    try {
      const raw = localStorage.getItem('viralytics-actuals');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  const recentAnalyses = savedAnalyses.slice(0, 5);
  const scoreHistory = savedAnalyses.map((a) => a.overallScore);

  // Platform distribution counts
  const platformCounts = useMemo(() => {
    const counts: Record<Platform, number> = {
      instagram: 0,
      youtube: 0,
      tiktok: 0,
      x: 0,
      linkedin: 0,
    };
    savedAnalyses.forEach((a) => {
      counts[a.platform]++;
    });
    return counts;
  }, [savedAnalyses]);

  const maxPlatformCount = Math.max(...Object.values(platformCounts), 1);

  // Derive activity items from saved analyses
  const activityItems = useMemo(() => {
    if (savedAnalyses.length === 0) return [];
    return savedAnalyses.slice(0, 5).map((a) => {
      const PIcon = platformIcons[a.platform];
      const now = Date.now();
      const created = new Date(a.createdAt).getTime();
      const diffMs = now - created;
      const diffMin = Math.floor(diffMs / 60000);
      const diffHr = Math.floor(diffMs / 3600000);
      const diffDay = Math.floor(diffMs / 86400000);
      let timeStr: string;
      if (diffMin < 1) timeStr = 'Just now';
      else if (diffMin < 60) timeStr = `${diffMin} min ago`;
      else if (diffHr < 24) timeStr = `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
      else timeStr = `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

      const accentColor = a.overallScore >= 80 ? 'text-emerald-400' : a.overallScore >= 60 ? 'text-green-400' : a.overallScore >= 40 ? 'text-amber-400' : 'text-red-400';

      return {
        id: a.id,
        icon: PIcon,
        description: `Analyzed ${a.platform} content \u2014 Score: ${a.overallScore}`,
        time: timeStr,
        accentColor,
      };
    });
  }, [savedAnalyses]);

  const persistActuals = useCallback((data: Record<string, ActualPerformance>) => {
    try { localStorage.setItem('viralytics-actuals', JSON.stringify(data)); } catch { /* noop */ }
  }, []);

  const handleSaveActual = (analysisId: string) => {
    const vals = actualInputs[analysisId];
    if (!vals) return;
    const updated = { ...savedActuals, [analysisId]: vals };
    setSavedActuals(updated);
    persistActuals(updated);
    setTrackingExpandedId(null);
  };

  // Analyses older than 24h
  const analysesOlderThan24h = useMemo(() => {
    const now = Date.now();
    return savedAnalyses.filter((a) => {
      const created = new Date(a.createdAt).getTime();
      return now - created > 24 * 60 * 60 * 1000;
    });
  }, [savedAnalyses]);

  const handleAnalysisClick = async (id: string) => {
    try {
      setViewingId(id);
      const res = await fetch(`/api/library?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentAnalysis(data);
        setCurrentView('analysis');
      }
    } catch {
      // silently fail
    } finally {
      setViewingId(null);
    }
  };

  const planLabel = user?.plan
    ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) + ' Plan'
    : 'Free Plan';

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 max-w-5xl mx-auto"
    >
      {/* Welcome - Enhanced */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-2xl md:text-3xl font-bold text-viralyze-white">
            Welcome back, {user?.name || 'Creator'}
          </h2>
          <span className="animate-pulse-glow text-lg" aria-hidden="true">
            ✨
          </span>
        </div>
        <p className="text-viralyze-muted mt-1">
          Predict performance, then simulate how your audience may react before you publish.
        </p>
        <div className="mt-2">
          <Badge
            variant="outline"
            className="border-wine-accent/40 text-wine-accent text-xs"
          >
            {planLabel}
          </Badge>
        </div>
      </motion.div>

      {/* CTA Cards with gradient mesh background and hover lift */}
      <motion.div variants={item} className="relative">
        {/* Gradient mesh background */}
        <div className="absolute -inset-8 pointer-events-none">
          <div className="absolute top-0 left-1/4 h-40 w-40 rounded-full bg-wine-accent/[0.07] blur-[80px]" />
          <div className="absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-wine/[0.05] blur-[60px]" />
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <Card
              className="glass border-wine-accent/30 cursor-pointer group hover:border-wine-accent/60 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(127,29,58,0.2)] h-full"
              onClick={() => setCurrentView('predict')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-wine flex items-center justify-center shrink-0">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-viralyze-white group-hover:text-wine-accent transition-colors">
                    Predict New Content
                  </h3>
                  <p className="text-sm text-viralyze-muted mt-0.5">
                    Analyze your idea before publishing
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-viralyze-muted group-hover:text-wine-accent group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <Card
              className="glass border-white/[0.06] cursor-pointer group hover:border-white/15 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] h-full"
              onClick={() => { setPredictMode('post'); setCurrentView('predict'); }}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0">
                  <FileText className="h-6 w-6 text-viralyze-muted" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-viralyze-white group-hover:text-wine-accent transition-colors">
                    Analyze Existing Content
                  </h3>
                  <p className="text-sm text-viralyze-muted mt-0.5">
                    Score your drafted posts & captions
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-viralyze-muted group-hover:text-wine-accent group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <Card
              className="glass border-wine-accent/20 cursor-pointer group hover:border-wine-accent/50 transition-all duration-300 h-full"
              onClick={() => setCurrentView('audience-simulator')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-wine-accent/20 flex items-center justify-center shrink-0">
                  <Users className="h-6 w-6 text-wine-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-viralyze-white group-hover:text-wine-accent transition-colors">
                    Audience Simulator
                  </h3>
                  <p className="text-sm text-viralyze-muted mt-0.5">
                    Create → simulate → improve → re-test
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-viralyze-muted group-hover:text-wine-accent group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Stats with Score History */}
      <motion.div variants={item}>
        <h3 className="text-sm font-medium text-viralyze-muted uppercase tracking-wider mb-3">
          Quick Stats
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="glass">
            <CardContent className="p-3 sm:p-4 flex flex-col items-center gap-1">
              <BarChart3 className="h-5 w-5 text-viralyze-muted mb-1" />
              <span className="text-2xl font-bold text-viralyze-white tabular-nums">
                {totalAnalyses}
              </span>
              <span className="text-xs text-viralyze-muted">Total Analyses</span>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-3 sm:p-4 flex flex-col items-center gap-1">
              <TrendingUp className="h-5 w-5 text-viralyze-muted mb-1" />
              <span className="text-2xl font-bold text-viralyze-white tabular-nums">
                {avgScore}
              </span>
              <span className="text-xs text-viralyze-muted">Avg Score</span>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-3 sm:p-4 flex flex-col items-center gap-1">
              <Sparkles className="h-5 w-5 text-wine-accent mb-1" />
              <span className="text-2xl font-bold text-wine-accent tabular-nums">
                {bestScore}
              </span>
              <span className="text-xs text-viralyze-muted">Best Score</span>
            </CardContent>
          </Card>
        </div>

        {/* Score Leaderboard */}
        {totalAnalyses >= 2 && (() => {
          const top5 = [...savedAnalyses].sort((a, b) => b.overallScore - a.overallScore).slice(0, 5);
          const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600', 'text-viralyze-muted', 'text-viralyze-muted'];
          const rankBg = ['bg-yellow-400/10', 'bg-gray-300/10', 'bg-amber-600/10', 'bg-white/[0.02]', 'bg-white/[0.02]'];
          return (
            <motion.div variants={item}>
              <Card className="glass">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-4 w-4 text-wine-accent" />
                    <span className="text-xs font-medium text-viralyze-muted uppercase tracking-wider">
                      Score Leaderboard
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {top5.map((a, i) => {
                      const PIcon = platformIcons[a.platform];
                      return (
                        <motion.div
                          key={a.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08, duration: 0.3, ease: 'easeOut' }}
                          className="flex items-center gap-3 py-1.5"
                        >
                          <span className={cn('text-sm font-bold w-6 text-right tabular-nums', rankColors[i])}>
                            #{i + 1}
                          </span>
                          <PIcon className="h-3.5 w-3.5 text-viralyze-muted shrink-0" />
                          <span className="text-sm text-viralyze-white flex-1 truncate">
                            {(a.title || 'Untitled').length > 30
                              ? (a.title || 'Untitled').slice(0, 30) + '...'
                              : (a.title || 'Untitled')}
                          </span>
                          <span className={cn(
                            'text-xs font-bold tabular-nums px-2 py-0.5 rounded-full',
                            rankBg[i],
                            a.overallScore >= 85 ? 'text-emerald-400' : a.overallScore >= 65 ? 'text-green-400' : a.overallScore >= 40 ? 'text-amber-400' : 'text-red-400'
                          )}>
                            {a.overallScore}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })()}

      {/* Score History Mini Bar Chart */}
        {scoreHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4"
          >
            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-viralyze-muted uppercase tracking-wider">
                    Score History
                  </span>
                  <div className="flex items-center gap-3 text-[10px] text-viralyze-muted/60">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-sm bg-green-400" />
                      70+
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-sm bg-amber-400" />
                      50-69
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-sm bg-red-400" />
                      &lt;50
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto -mx-1 px-1 scrollbar-thin">
                  <div className="min-w-[240px]">
                    <ScoreHistory scores={scoreHistory} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Score Insights */}
      {savedAnalyses.length >= 1 && (() => {
        const insights: { icon: React.ElementType; text: string; color: string; glow?: boolean }[] = [];

        // Average score insight
        if (avgScore < 50) {
          insights.push({
            icon: AlertCircle,
            text: 'Your average score is below 50. Focus on stronger hooks and more specific audience targeting.',
            color: 'text-amber-400',
          });
        }
        if (avgScore >= 75) {
          insights.push({
            icon: Award,
            text: 'Great job! Your content consistently scores above 75. Keep up the excellent work.',
            color: 'text-green-400',
          });
        }

        // Platform performance insight
        const platformAvgs: Record<string, { total: number; count: number }> = {};
        savedAnalyses.forEach((a) => {
          if (!platformAvgs[a.platform]) platformAvgs[a.platform] = { total: 0, count: 0 };
          platformAvgs[a.platform].total += a.overallScore;
          platformAvgs[a.platform].count++;
        });
        const platformAvgEntries = Object.entries(platformAvgs).map(([p, { total, count }]) => ({
          platform: p,
          avg: Math.round(total / count),
        }));
        if (platformAvgEntries.length >= 2) {
          const sorted = [...platformAvgEntries].sort((a, b) => b.avg - a.avg);
          const best = sorted[0];
          const others = sorted.slice(1);
          const allAbove = others.every((o) => best.avg - o.avg < 15);
          if (!allAbove) {
            const bestLabel = platformLabels[best.platform as Platform];
            insights.push({
              icon: Target,
              text: `Your ${bestLabel} content performs significantly better. Consider focusing more effort here.`,
              color: 'text-wine-accent',
              glow: true,
            });
          }
        }

        // Trend insight (last 3 scores)
        if (savedAnalyses.length >= 3) {
          const last3 = savedAnalyses.slice(0, 3).map((a) => a.overallScore);
          const isTrendingUp = last3[2] > last3[1] && last3[1] > last3[0];
          const isTrendingDown = last3[2] < last3[1] && last3[1] < last3[0];
          if (isTrendingUp) {
            insights.push({
              icon: TrendingUp,
              text: 'Your recent scores are improving! The changes you are making are working.',
              color: 'text-green-400',
            });
          }
          if (isTrendingDown) {
            insights.push({
              icon: TrendingDown,
              text: 'Your recent scores have been declining. Consider refreshing your content strategy.',
              color: 'text-amber-400',
            });
          }
        }

        if (insights.length === 0) return null;

        return (
          <motion.div variants={item}>
            <h3 className="text-sm font-medium text-viralyze-muted uppercase tracking-wider mb-3">
              Score Insights
            </h3>
            <Card className={cn('glass', insights.some((i) => i.glow) && 'glow-wine-sm')}>
              <CardContent className="p-4 flex flex-col gap-3">
                {insights.map((insight, i) => {
                  const IIcon = insight.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.35, ease: 'easeOut' }}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border',
                        insight.glow
                          ? 'border-wine-accent/20 bg-wine-accent/[0.05]'
                          : 'border-white/[0.04] bg-white/[0.02]'
                      )}
                    >
                      <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                        insight.glow ? 'bg-wine-accent/15' : 'bg-white/[0.05]'
                      )}>
                        <IIcon className={cn('h-4 w-4', insight.color)} />
                      </div>
                      <p className="text-sm text-viralyze-white/80 leading-relaxed">
                        {insight.text}
                      </p>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        );
      })()}

      {/* Performance Tracking - Predicted vs Actual */}
      <motion.div variants={item}>
        <h3 className="text-sm font-medium text-viralyze-muted uppercase tracking-wider mb-3">
          <Activity className="h-4 w-4 inline-block mr-1.5 -mt-0.5" />
          Performance Tracking
        </h3>
        <Card className="glass">
          <CardContent className="p-4">
            {analysesOlderThan24h.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <div className="h-10 w-10 rounded-full bg-white/[0.04] flex items-center justify-center">
                  <Activity className="h-5 w-5 text-viralyze-muted/40" />
                </div>
                <p className="text-sm text-viralyze-muted">
                  Track your content performance after 24 hours
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {analysesOlderThan24h.map((analysis) => {
                  const isTracking = trackingExpandedId === analysis.id;
                  const hasSaved = !!savedActuals[analysis.id];
                  const PIcon = platformIcons[analysis.platform];

                  // Compute accuracy if saved
                  let accuracyPercent = 0;
                  if (hasSaved) {
                    const actual = savedActuals[analysis.id];
                    const predicted = analysis.predictedEngagement;
                    const fields = ['likes', 'comments', 'shares', 'saves'] as const;
                    let totalOff = 0;
                    let fieldsWithPrediction = 0;
                    for (const f of fields) {
                      const predVal = parseEngagementValue(predicted?.[f]);
                      if (predVal > 0) {
                        fieldsWithPrediction++;
                        const offPct = Math.abs(actual[f] - predVal) / predVal * 100;
                        totalOff += offPct;
                      }
                    }
                    accuracyPercent = fieldsWithPrediction > 0 ? Math.round(100 - (totalOff / fieldsWithPrediction)) : 0;
                    accuracyPercent = Math.max(0, Math.min(100, accuracyPercent));
                  }

                  return (
                    <div
                      key={analysis.id}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden"
                    >
                      {/* Analysis row */}
                      <div className="flex items-center gap-3 p-3">
                        <PIcon className="h-4 w-4 text-viralyze-muted shrink-0" />
                        <span className="text-sm text-viralyze-white flex-1 truncate">
                          {analysis.title || 'Untitled'}
                        </span>
                        {hasSaved && (
                          <span className={cn(
                            'text-xs font-bold tabular-nums px-2 py-0.5 rounded-full border',
                            getAccuracyBg(100 - accuracyPercent),
                            getAccuracyColor(100 - accuracyPercent)
                          )}>
                            {accuracyPercent}% accurate
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className={cn(
                            'h-7 text-xs gap-1 shrink-0',
                            isTracking ? 'text-wine-accent' : 'text-viralyze-muted hover:text-viralyze-white'
                          )}
                          onClick={() => {
                            setTrackingExpandedId(isTracking ? null : analysis.id);
                            if (!actualInputs[analysis.id]) {
                              setActualInputs((prev) => ({
                                ...prev,
                                [analysis.id]: { likes: 0, comments: 0, shares: 0, saves: 0 },
                              }));
                            }
                          }}
                        >
                          {hasSaved ? 'Update' : 'How did it perform?'}
                          <motion.span
                            animate={{ rotate: isTracking ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </motion.span>
                        </Button>
                      </div>

                      {/* Expanded form / comparison */}
                      <AnimatePresence>
                        {isTracking && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 border-t border-white/[0.04] pt-3">
                              {/* Comparison if saved */}
                              {hasSaved && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                                  {(['likes', 'comments', 'shares', 'saves'] as const).map((field) => {
                                    const predVal = parseEngagementValue(analysis.predictedEngagement?.[field]);
                                    const actVal = savedActuals[analysis.id][field];
                                    const offPct = predVal > 0 ? Math.abs(actVal - predVal) / predVal * 100 : 0;
                                    return (
                                      <div key={field} className={cn(
                                        'rounded-md border p-2 text-center',
                                        getAccuracyBg(offPct)
                                      )}>
                                        <span className="text-[10px] text-viralyze-muted uppercase tracking-wider block mb-1">
                                          {field}
                                        </span>
                                        <span className="text-xs text-viralyze-muted block">
                                          Pred: {predVal > 0 ? (predVal >= 1000000 ? (predVal / 1000000).toFixed(1) + 'M' : predVal >= 1000 ? (predVal / 1000).toFixed(1) + 'K' : String(predVal)) : '—'}
                                        </span>
                                        <span className={cn('text-sm font-bold block', getAccuracyColor(offPct))}>
                                          Act: {actVal >= 1000000 ? (actVal / 1000000).toFixed(1) + 'M' : actVal >= 1000 ? (actVal / 1000).toFixed(1) + 'K' : String(actVal)}
                                        </span>
                                        <span className={cn('text-[10px] font-medium block mt-0.5', getAccuracyColor(offPct))}>
                                          {getAccuracyLabel(offPct)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Input form */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {(['likes', 'comments', 'shares', 'saves'] as const).map((field) => {
                                  const current = actualInputs[analysis.id]?.[field] ?? 0;
                                  return (
                                    <div key={field} className="flex flex-col gap-1">
                                      <label className="text-[10px] text-viralyze-muted uppercase tracking-wider">
                                        Actual {field}
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        value={current}
                                        onChange={(e) => {
                                          const val = Math.max(0, parseInt(e.target.value) || 0);
                                          setActualInputs((prev) => ({
                                            ...prev,
                                            [analysis.id]: {
                                              ...prev[analysis.id],
                                              [field]: val,
                                            },
                                          }));
                                        }}
                                        className="h-8 w-full rounded-md bg-white/[0.05] border border-white/[0.08] text-sm text-viralyze-white text-center focus:outline-none focus:border-wine-accent/40 focus-glow-wine transition-all"
                                        placeholder="0"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="mt-3 flex justify-end">
                                <Button
                                  size="sm"
                                  className="h-8 text-xs bg-gradient-wine hover:opacity-90 text-white gap-1.5"
                                  onClick={() => handleSaveActual(analysis.id)}
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Save Performance
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Platform Distribution */}
      <motion.div variants={item}>
        <h3 className="text-sm font-medium text-viralyze-muted uppercase tracking-wider mb-3">
          Platform Distribution
        </h3>
        <Card className="glass">
          <CardContent className="p-4">
            {totalAnalyses === 0 ? (
              <p className="text-sm text-viralyze-muted text-center py-4">
                No data yet
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {(Object.keys(platformIcons) as Platform[]).map((platform) => {
                  const count = platformCounts[platform];
                  if (count === 0) return null;
                  const PIcon = platformIcons[platform];
                  const barWidth = (count / maxPlatformCount) * 100;
                  return (
                    <div key={platform} className="flex items-center gap-3">
                      <PIcon className="h-4 w-4 text-viralyze-muted shrink-0" />
                      <span className="text-xs text-viralyze-muted w-20 shrink-0">
                        {platformLabels[platform]}
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-3 rounded-full bg-wine-accent/10 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full rounded-full bg-wine-accent/60"
                          />
                        </div>
                        <span className="text-xs font-medium text-viralyze-white tabular-nums w-6 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Strengths Summary */}
      <motion.div variants={item}>
        <h3 className="text-sm font-medium text-viralyze-muted uppercase tracking-wider mb-3">
          Top Strengths
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="glass">
            <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
              <div className="h-10 w-10 rounded-full bg-wine-accent/15 flex items-center justify-center">
                <Zap className="h-5 w-5 text-wine-accent" />
              </div>
              <span className="text-sm font-medium text-viralyze-white">Strong Hooks</span>
              <span className="text-xs text-viralyze-muted">Keep it up!</span>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
              <div className="h-10 w-10 rounded-full bg-wine-accent/15 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-wine-accent" />
              </div>
              <span className="text-sm font-medium text-viralyze-white">High Engagement</span>
              <span className="text-xs text-viralyze-muted">Keep it up!</span>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
              <div className="h-10 w-10 rounded-full bg-wine-accent/15 flex items-center justify-center">
                <Share2 className="h-5 w-5 text-wine-accent" />
              </div>
              <span className="text-sm font-medium text-viralyze-white">Great Shareability</span>
              <span className="text-xs text-viralyze-muted">Keep it up!</span>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Content Recycler */}
      {totalAnalyses >= 1 && (() => {
        const bottom3 = [...savedAnalyses].sort((a, b) => a.overallScore - b.overallScore).slice(0, 3);
        return (
          <motion.div variants={item}>
            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Recycle className="h-4 w-4 text-wine-accent" />
                  <span className="text-xs font-medium text-viralyze-muted uppercase tracking-wider">
                    Content Recycler
                  </span>
                </div>
                <p className="text-xs text-viralyze-muted/70 mb-3">
                  Breathe new life into your content
                </p>
                <div className="flex flex-col gap-2">
                  {bottom3.map((a, i) => {
                    const PIcon = platformIcons[a.platform];
                    const scoreColor = a.overallScore < 40 ? 'text-red-400' : 'text-amber-400';
                    const scoreBg = a.overallScore < 40 ? 'bg-red-500/15' : 'bg-amber-500/15';
                    return (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.35, ease: 'easeOut' }}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                      >
                        <PIcon className="h-4 w-4 text-viralyze-muted shrink-0" />
                        <span className="text-sm text-viralyze-white flex-1 truncate">
                          {a.title || 'Untitled'}
                        </span>
                        <span className={cn('text-xs font-bold tabular-nums px-2 py-0.5 rounded-full', scoreBg, scoreColor)}>
                          {a.overallScore}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 gap-1 text-xs text-wine-accent hover:text-wine-accent/80 hover:bg-wine-accent/10 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrefilledIdea(a.contentText || a.ideaText || a.title);
                            setPredictPlatform(a.platform);
                            setPredictContentType(a.contentType);
                            setCurrentView('predict');
                          }}
                        >
                          <RefreshCw className="h-3 w-3" />
                          Re-analyze
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })()}

      {/* Activity Feed */}
      {activityItems.length > 0 && (
        <motion.div variants={item}>
          <h3 className="text-sm font-medium text-viralyze-muted uppercase tracking-wider mb-3">
            Recent Activity
          </h3>
          <Card className="glass">
            <CardContent className="p-4 flex flex-col gap-0 divide-y divide-white/[0.04]">
              {activityItems.map((act, i) => {
                const AIcon = act.icon;
                return (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className={cn("h-8 w-8 rounded-full bg-white/[0.05] flex items-center justify-center shrink-0", act.accentColor)}>
                      <AIcon className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-sm text-viralyze-white flex-1">{act.description}</p>
                    <span className="text-xs text-viralyze-muted shrink-0">{act.time}</span>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Analyses - Enhanced */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-viralyze-muted uppercase tracking-wider">
            Recent Analyses
          </h3>
          {savedAnalyses.length > 5 && (
            <button
              onClick={() => setCurrentView('library')}
              className="text-xs text-wine-accent hover:underline"
            >
              View all
            </button>
          )}
        </div>

        {recentAnalyses.length === 0 ? (
          <Card className="border-dashed border-2 border-white/[0.08] bg-transparent">
            <CardContent className="p-12 flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <Search className="h-12 w-12 text-viralyze-muted/20" />
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-wine-accent/20" />
              </div>
              <div>
                <p className="text-viralyze-muted text-sm font-medium">No analyses yet</p>
                <p className="text-viralyze-muted/50 text-xs mt-1">
                  Your recent content predictions will appear here.
                  <br />
                  Start by analyzing your first piece of content.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {recentAnalyses.map((analysis) => {
              const PIcon = platformIcons[analysis.platform];
              return (
                <Card
                  key={analysis.id}
                  className="glass cursor-pointer hover:bg-white/[0.03] transition-colors"
                  onClick={() => handleAnalysisClick(analysis.id)}
                >
                  <CardContent className="p-4 flex items-center gap-3 min-h-[44px]">
                    <PIcon className="h-4 w-4 text-viralyze-muted shrink-0" />
                    <span className="text-sm text-viralyze-white flex-1 truncate">
                      {analysis.title || 'Untitled'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full shrink-0',
                          classificationDotColors[analysis.classification]
                        )}
                        aria-hidden="true"
                      />
                      <Badge
                        variant="outline"
                        className={cn('text-xs', classificationStyles[analysis.classification])}
                      >
                        {analysis.overallScore}
                      </Badge>
                    </div>
                    <span className="text-xs text-viralyze-muted hidden sm:block">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
