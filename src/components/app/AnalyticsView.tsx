'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Target,
  Instagram,
  Youtube,
  Tv,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import type { Platform, Classification } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

// --- Types for analytics data ---
interface AnalyticsData {
  totalAnalyses: number;
  avgScore: number;
  bestScore: number;
  predictionAccuracy: number;
  scoreDistribution: { range: string; count: number }[];
  platformPerformance: { platform: string; score: number }[];
  weeklyTrend: { week: string; score: number }[];
  categoryBreakdown: { category: string; score: number }[];
  topContent: {
    id: string;
    title: string;
    platform: string;
    score: number;
    date: string;
  }[];
}

// --- Animation variants (same pattern as DashboardView) ---
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// --- Helpers ---
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

function getClassification(score: number): Classification {
  if (score >= 85) return 'viral';
  if (score >= 70) return 'high';
  if (score >= 45) return 'moderate';
  return 'low';
}

function getScoreColor(score: number): string {
  if (score >= 85) return classificationStyles.viral;
  if (score >= 70) return classificationStyles.high;
  if (score >= 45) return classificationStyles.moderate;
  return classificationStyles.low;
}

// --- Tooltip style for dark theme ---
const tooltipStyle = {
  backgroundColor: 'rgba(18, 18, 20, 0.9)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '0.625rem',
  color: '#FAFAF9',
  fontSize: '0.875rem',
  padding: '0.5rem 0.75rem',
};

const tooltipLabelStyle = {
  color: '#A1A1AA',
  fontWeight: 500,
  marginBottom: '0.25rem',
  fontSize: '0.75rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

// --- Skeleton Loader ---
function SkeletonCard() {
  return (
    <Card className="glass">
      <CardContent className="p-4">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="h-5 w-5 rounded bg-white/[0.06]" />
          <div className="h-7 w-12 rounded bg-white/[0.06]" />
          <div className="h-3 w-20 rounded bg-white/[0.04]" />
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonChart() {
  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <div className="animate-pulse h-5 w-40 rounded bg-white/[0.06]" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="animate-pulse h-56 w-full rounded-lg bg-white/[0.03]" />
      </CardContent>
    </Card>
  );
}

function SkeletonList() {
  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <div className="animate-pulse h-5 w-28 rounded bg-white/[0.06]" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="h-4 w-4 rounded bg-white/[0.06] shrink-0" />
              <div className="h-4 flex-1 rounded bg-white/[0.04]" />
              <div className="h-5 w-20 rounded bg-white/[0.06] shrink-0" />
              <div className="h-3 w-24 rounded bg-white/[0.04] shrink-0 hidden sm:block" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Empty State ---
function EmptyState() {
  const setCurrentView = useAppStore((s) => s.setCurrentView);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="h-16 w-16 rounded-2xl bg-wine-accent/10 flex items-center justify-center mb-4">
          <BarChart3 className="h-8 w-8 text-wine-accent" />
        </div>
      </motion.div>
      <h3 className="text-lg font-semibold text-viralyze-white mb-1">
        No analytics yet
      </h3>
      <p className="text-sm text-viralyze-muted text-center max-w-sm mb-6">
        Run some content predictions to see your performance analytics, score trends, and category breakdowns here.
      </p>
      <Button
        onClick={() => setCurrentView('predict')}
        className="bg-wine-accent hover:bg-wine-accent/80 text-white btn-shine"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Run Your First Prediction
      </Button>
    </motion.div>
  );
}

// --- Main Component ---
export default function AnalyticsView() {
  const user = useAppStore((s) => s.user);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/analytics?userId=${user.id}`);
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const json = await res.json();
        if (cancelled) return;
        setData(json);
      } catch (err) {
        if (!cancelled) setError('Failed to load analytics. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAnalytics();
    return () => { cancelled = true; };
  }, [user]);

  // Loading state
  if (loading) {
    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6 max-w-5xl mx-auto"
      >
        <motion.div variants={item}>
          <div className="animate-pulse h-8 w-40 rounded bg-white/[0.06]" />
          <div className="animate-pulse h-4 w-72 rounded bg-white/[0.04] mt-2" />
        </motion.div>
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </motion.div>
        <motion.div variants={item}>
          <SkeletonChart />
        </motion.div>
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonChart />
          <SkeletonChart />
        </motion.div>
        <motion.div variants={item}>
          <SkeletonChart />
        </motion.div>
        <motion.div variants={item}>
          <SkeletonList />
        </motion.div>
      </motion.div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 max-w-5xl mx-auto"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-viralyze-white">Analytics</h2>
        <Card className="glass">
          <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-red-400" />
            </div>
            <p className="text-sm text-viralyze-muted">{error || 'Sign in to view your analytics.'}</p>
            {!user && (
              <Button
                onClick={() => useAppStore.getState().setAuthModal(true, 'login')}
                className="bg-wine-accent hover:bg-wine-accent/80 text-white"
              >
                Sign In
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Empty state (user has no analyses)
  if (data && data.totalAnalyses === 0) {
    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6 max-w-5xl mx-auto"
      >
        <motion.div variants={item}>
          <h2 className="text-2xl md:text-3xl font-bold text-viralyze-white">Analytics</h2>
          <p className="text-viralyze-muted mt-1">
            Track your content performance and viral potential trends
          </p>
        </motion.div>
        <motion.div variants={item}>
          <EmptyState />
        </motion.div>
      </motion.div>
    );
  }

  // Guard: no data
  if (!data) return null;

  // --- Derived data ---
  const overviewStats = [
    { icon: BarChart3, value: String(data.totalAnalyses), label: 'Total Analyses', accent: false },
    { icon: TrendingUp, value: String(data.avgScore), label: 'Avg Score', accent: false },
    { icon: Sparkles, value: String(data.bestScore), label: 'Highest Score', accent: true },
    { icon: Target, value: `${data.predictionAccuracy}%`, label: 'Prediction Accuracy', accent: false },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h2 className="text-2xl md:text-3xl font-bold text-viralyze-white">
          Analytics
        </h2>
        <p className="text-viralyze-muted mt-1">
          Track your content performance and viral potential trends
        </p>
      </motion.div>

      {/* Overview Stats */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overviewStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="glass">
              <CardContent className="p-4 flex flex-col items-center gap-1 text-center">
                <Icon className={cn('h-5 w-5 mb-1', stat.accent ? 'text-wine-accent' : 'text-viralyze-muted')} />
                <span className={cn('text-2xl font-bold tabular-nums', stat.accent ? 'text-wine-accent' : 'text-viralyze-white')}>
                  {stat.value}
                </span>
                <span className="text-xs text-viralyze-muted">{stat.label}</span>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Score Distribution */}
      <motion.div variants={item}>
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-viralyze-white">
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.scoreDistribution} barCategoryGap="20%">
                  <XAxis
                    dataKey="range"
                    tick={{ fill: '#A1A1AA', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#A1A1AA', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="count" fill="#B8325A" radius={[4, 4, 0, 0]} name="Analyses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Platform Performance + Category Breakdown */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-viralyze-white">
              Platform Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {data.platformPerformance.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={data.platformPerformance} outerRadius="70%">
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis
                      dataKey="platform"
                      tick={{ fill: '#A1A1AA', fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: '#A1A1AA', fontSize: 10 }}
                      axisLine={false}
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#B8325A"
                      fill="#B8325A"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={tooltipLabelStyle}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-sm text-viralyze-muted">
                No platform data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown - Horizontal Bar Chart */}
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-viralyze-white">
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {data.categoryBreakdown.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.categoryBreakdown}
                    layout="vertical"
                    barCategoryGap="20%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: '#A1A1AA', fontSize: 11 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="category"
                      tick={{ fill: '#A1A1AA', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={110}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={tooltipLabelStyle}
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    />
                    <Bar dataKey="score" fill="#B8325A" radius={[0, 4, 4, 0]} name="Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-sm text-viralyze-muted">
                No category data yet
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Score Trend - Area Chart */}
      <motion.div variants={item}>
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-viralyze-white">
              Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {data.weeklyTrend.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.weeklyTrend}>
                    <defs>
                      <linearGradient id="wineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#B8325A" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#B8325A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="week"
                      tick={{ fill: '#A1A1AA', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: '#A1A1AA', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={tooltipLabelStyle}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#B8325A"
                      strokeWidth={2}
                      fill="url(#wineGradient)"
                      name="Score"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-sm text-viralyze-muted">
                Need more than one week of data to show trends
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Content */}
      <motion.div variants={item}>
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-viralyze-white">
              Top Content
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {data.topContent.length > 0 ? (
              <div className="flex flex-col divide-y divide-white/[0.06]">
                {data.topContent.map((content) => {
                  const PIcon = platformIcons[content.platform as Platform] || BarChart3;
                  const cls = getClassification(content.score);
                  return (
                    <div
                      key={content.id}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <PIcon className="h-4 w-4 text-viralyze-muted shrink-0" />
                      <span className="text-sm text-viralyze-white flex-1 truncate">
                        {content.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn('text-xs shrink-0', getScoreColor(content.score))}
                      >
                        {content.score} — {cls}
                      </Badge>
                      <span className="text-xs text-viralyze-muted hidden sm:block shrink-0">
                        {content.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 flex items-center justify-center text-sm text-viralyze-muted">
                No content yet
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
