'use client';

import { motion } from 'framer-motion';
import { Sparkles, FileText, BarChart3, TrendingUp, Inbox, ArrowRight, Instagram, Youtube, Tv, Twitter, Linkedin } from 'lucide-react';
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

const classificationStyles: Record<Classification, string> = {
  low: 'bg-red-500/20 text-red-400',
  moderate: 'bg-amber-500/20 text-amber-400',
  high: 'bg-green-500/20 text-green-400',
  viral: 'bg-emerald-500/20 text-emerald-400',
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

export default function DashboardView() {
  const { savedAnalyses, setCurrentView, setCurrentAnalysis } = useAppStore();

  const totalAnalyses = savedAnalyses.length;
  const avgScore =
    totalAnalyses > 0
      ? Math.round(savedAnalyses.reduce((s, a) => s + a.overallScore, 0) / totalAnalyses)
      : 0;
  const bestScore =
    totalAnalyses > 0
      ? Math.max(...savedAnalyses.map((a) => a.overallScore))
      : 0;

  const recentAnalyses = savedAnalyses.slice(0, 5);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 max-w-5xl mx-auto"
    >
      {/* Welcome */}
      <motion.div variants={item}>
        <h2 className="text-2xl md:text-3xl font-bold text-viralyze-white">
          Hello, Creator
        </h2>
        <p className="text-viralyze-muted mt-1">
          Ready to predict your next viral hit?
        </p>
      </motion.div>

      {/* CTA Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className="glass border-wine-accent/30 cursor-pointer group hover:border-wine-accent/60 transition-all duration-300 hover:glow-wine-sm"
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

        <Card
          className="glass border-white/[0.06] cursor-pointer group hover:border-white/15 transition-all duration-300"
          onClick={() => setCurrentView('predict')}
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

      {/* Quick Stats */}
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
      </motion.div>

      {/* Recent Analyses */}
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
          <Card className="glass">
            <CardContent className="p-12 flex flex-col items-center gap-3 text-center">
              <Inbox className="h-10 w-10 text-viralyze-muted/40" />
              <p className="text-viralyze-muted text-sm">No analyses yet</p>
              <p className="text-viralyze-muted/60 text-xs">Your recent content predictions will appear here</p>
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
                  onClick={() => {
                    setCurrentAnalysis(null);
                    setCurrentView('library');
                  }}
                >
                  <CardContent className="p-3 px-4 flex items-center gap-3">
                    <PIcon className="h-4 w-4 text-viralyze-muted shrink-0" />
                    <span className="text-sm text-viralyze-white flex-1 truncate">
                      {analysis.title || 'Untitled'}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', classificationStyles[analysis.classification])}
                    >
                      {analysis.overallScore}
                    </Badge>
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
