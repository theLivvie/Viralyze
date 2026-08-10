'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  const { savedAnalyses, setCurrentView, setCurrentAnalysis, setPredictMode, user } = useAppStore();

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
          Ready to predict your next viral hit?
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

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </motion.div>

      {/* Quick Stats with Score History */}
      <motion.div variants={item}>
        <h3 className="text-sm font-medium text-viralyze-muted uppercase tracking-wider mb-3">
          Quick Stats
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <Card className="glass">
            <CardContent className="p-4 flex flex-col items-center gap-1">
              <BarChart3 className="h-5 w-5 text-viralyze-muted mb-1" />
              <span className="text-2xl font-bold text-viralyze-white tabular-nums">
                {totalAnalyses}
              </span>
              <span className="text-xs text-viralyze-muted">Total Analyses</span>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 flex flex-col items-center gap-1">
              <TrendingUp className="h-5 w-5 text-viralyze-muted mb-1" />
              <span className="text-2xl font-bold text-viralyze-white tabular-nums">
                {avgScore}
              </span>
              <span className="text-xs text-viralyze-muted">Avg Score</span>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 flex flex-col items-center gap-1">
              <Sparkles className="h-5 w-5 text-wine-accent mb-1" />
              <span className="text-2xl font-bold text-wine-accent tabular-nums">
                {bestScore}
              </span>
              <span className="text-xs text-viralyze-muted">Best Score</span>
            </CardContent>
          </Card>
        </div>

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
                <ScoreHistory scores={scoreHistory} />
              </CardContent>
            </Card>
          </motion.div>
        )}
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
                  <CardContent className="p-3 px-4 flex items-center gap-3">
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
