'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Target,
  Download,
  RefreshCw,
  Loader2,
  FileJson,
  Instagram,
  Youtube,
  Tv,
  Twitter,
  Linkedin,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
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

// --- Animated Counter Component ---
function AnimatedCounter({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(false);
  const mv = useMotionValue(0);
  const displayValue = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    const unsub = displayValue.on('change', (v) => setDisplay(v));
    return unsub;
  }, [displayValue]);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const ctrl = animate(mv, value, { duration, ease: 'easeOut' });
    return () => { ctrl.stop(); };
  }, [value, duration]);

  return <>{display}</>;
}

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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [liveClock, setLiveClock] = useState(new Date());

  // Live clock tick
  useEffect(() => {
    const interval = setInterval(() => setLiveClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (!user) { setLoading(false); return; }
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/analytics?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const json = await res.json();
      setData(json);
      setLastRefreshed(new Date());
      if (isRefresh) toast.success('Analytics refreshed');
    } catch (err) {
      if (!isRefresh) setError('Failed to load analytics. Please try again.');
      else toast.error('Failed to refresh analytics');
    } finally {
      if (isRefresh) setRefreshing(false); else setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportCSV = () => {
    if (!data || !data.topContent.length) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Title', 'Platform', 'Content Type', 'Score', 'Classification', 'Confidence', 'Date'];
    const rows = data.topContent.map((item) => [
      item.title,
      item.platform,
      '',
      String(item.score),
      getClassification(item.score),
      '',
      item.date,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => {
        const escaped = String(cell).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `viralytics-analytics-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Analytics exported as CSV');
  };

  const handleExportJSON = () => {
    if (!data) {
      toast.error('No data to export');
      return;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `viralytics-analytics-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Analytics exported as JSON');
  };

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
    { icon: BarChart3, value: data.totalAnalyses, label: 'Total Analyses', accent: false, trend: 'up' as const, trendPercent: '+12%', isInt: true },
    { icon: TrendingUp, value: data.avgScore, label: 'Avg Score', accent: false, trend: 'up' as const, trendPercent: '+5.3', isInt: false },
    { icon: Sparkles, value: data.bestScore, label: 'Highest Score', accent: true, trend: 'up' as const, trendPercent: '+8', isInt: true },
    { icon: Target, value: data.predictionAccuracy, label: 'Prediction Accuracy', accent: false, trend: data.predictionAccuracy >= 80 ? 'up' as const : 'down' as const, trendPercent: data.predictionAccuracy >= 80 ? '+2.1' : '-1.4', isInt: true },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 max-w-5xl mx-auto noise-bg"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-viralyze-white">
            Analytics
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-viralyze-muted text-sm">
              Track your content performance and viral potential trends
            </p>
            {/* Real-time last refreshed timestamp */}
            {lastRefreshed && (
              <span className="flex items-center gap-1 text-xs text-viralyze-muted/50">
                <Clock className="h-3 w-3" />
                <span className="font-mono tabular-nums">
                  {liveClock.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">
                  Refreshed {lastRefreshed.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' })}
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="border-white/[0.1] text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.05] gap-1.5"
          >
            {refreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="border-white/[0.1] text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.05]"
          >
            <FileJson className="h-4 w-4 mr-1.5" />
            JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="border-white/[0.1] text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.05]"
          >
            <Download className="h-4 w-4 mr-1.5" />
            CSV
          </Button>
        </div>
      </motion.div>

      {/* Overview Stats with Animated Counters */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overviewStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="glass transition-all duration-300 hover:-translate-y-1 hover:glow-wine-sm hover:border-wine-accent/20">
              <CardContent className="p-4 flex flex-col items-center gap-1 text-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={cn('h-5 w-5', stat.accent ? 'text-wine-accent' : 'text-viralyze-muted')} />
                  <svg width="32" height="16" viewBox="0 0 32 16" className="opacity-60" aria-hidden="true">
                    <polyline
                      fill="none"
                      stroke={stat.trend === 'up' ? '#22C55E' : '#EF4444'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={stat.trend === 'up'
                        ? '2,12 8,10 14,8 20,6 26,4 30,3'
                        : '2,4 8,5 14,7 20,9 26,11 30,13'
                      }
                    />
                  </svg>
                  <span className={cn(
                    'text-[10px] font-semibold tabular-nums',
                    stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  )}>
                    {stat.trend === 'up' ? '↑' : '↓'}{stat.trendPercent}
                  </span>
                </div>
                <span className={cn('text-2xl font-bold tabular-nums', stat.accent ? 'text-wine-accent' : 'text-viralyze-white')}>
                  <AnimatedCounter value={stat.value} />{stat.label === 'Prediction Accuracy' ? '%' : ''}
                </span>
                <span className="text-xs text-viralyze-muted">{stat.label}</span>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Gradient Separator */}
      <motion.div variants={item} className="glow-line w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,50,90,0.4), transparent)' }} />

      {/* Score Distribution */}
      <motion.div variants={item}>
        <Card className="glass transition-all duration-300 hover:-translate-y-0.5 hover:glow-wine-sm">
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

      {/* Gradient Separator */}
      <motion.div variants={item} className="glow-line w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,50,90,0.4), transparent)' }} />

      {/* Platform Performance + Category Breakdown */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <Card className="glass transition-all duration-300 hover:-translate-y-0.5 hover:glow-wine-sm">
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
        <Card className="glass transition-all duration-300 hover:-translate-y-0.5 hover:glow-wine-sm">
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

      {/* Gradient Separator */}
      <motion.div variants={item} className="glow-line w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,50,90,0.4), transparent)' }} />

      {/* Score Trend - Area Chart */}
      <motion.div variants={item}>
        <Card className="glass transition-all duration-300 hover:-translate-y-0.5 hover:glow-wine-sm">
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

      {/* Gradient Separator */}
      <motion.div variants={item} className="glow-line w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,50,90,0.4), transparent)' }} />

      {/* Top Content */}
      <motion.div variants={item}>
        <div className="glow-wine-sm rounded-xl p-[1px]">
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-viralyze-white">
                🏆 Top Content
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
        </div>
      </motion.div>
    </motion.div>
  );
}