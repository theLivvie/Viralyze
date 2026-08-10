'use client';

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

// --- Animation variants (same pattern as DashboardView) ---
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// --- Mock data ---
const scoreDistribution = [
  { range: '0-20', count: 1 },
  { range: '21-40', count: 2 },
  { range: '41-60', count: 3 },
  { range: '61-80', count: 4 },
  { range: '81-100', count: 2 },
];

const platformPerformance = [
  { platform: 'Instagram', score: 82 },
  { platform: 'YouTube', score: 78 },
  { platform: 'TikTok', score: 85 },
  { platform: 'X', score: 71 },
  { platform: 'LinkedIn', score: 68 },
];

const weeklyTrend = [
  { week: 'Wk 1', score: 65 },
  { week: 'Wk 2', score: 72 },
  { week: 'Wk 3', score: 68 },
  { week: 'Wk 4', score: 78 },
  { week: 'Wk 5', score: 82 },
  { week: 'Wk 6', score: 75 },
  { week: 'Wk 7', score: 88 },
  { week: 'Wk 8', score: 84 },
];

const categoryBreakdown = [
  { category: 'Audience Fit', score: 86 },
  { category: 'Hook', score: 84 },
  { category: 'Shareability', score: 81 },
  { category: 'Engagement', score: 79 },
  { category: 'Retention', score: 76 },
  { category: 'Originality', score: 72 },
];

const topContent = [
  { id: '1', title: '5 Unwritten Rules of Instagram Reels', platform: 'instagram' as Platform, score: 94, date: 'Dec 15, 2024' },
  { id: '2', title: 'Why Most TikToks Fail in the First Second', platform: 'tiktok' as Platform, score: 91, date: 'Dec 12, 2024' },
  { id: '3', title: 'The Hook Formula That Changed Everything', platform: 'youtube' as Platform, score: 88, date: 'Dec 10, 2024' },
  { id: '4', title: 'Stop Posting Without a Strategy', platform: 'linkedin' as Platform, score: 85, date: 'Dec 8, 2024' },
  { id: '5', title: 'Viral Thread Blueprint for X Creators', platform: 'x' as Platform, score: 82, date: 'Dec 5, 2024' },
];

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

// --- Overview stat cards ---
const overviewStats = [
  { icon: BarChart3, value: '12', label: 'Total Analyses', accent: false },
  { icon: TrendingUp, value: '78', label: 'Avg Score', accent: false },
  { icon: Sparkles, value: '94', label: 'Highest Score', accent: true },
  { icon: Target, value: '87%', label: 'Prediction Accuracy', accent: false },
];

export default function AnalyticsView() {
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
                <BarChart data={scoreDistribution} barCategoryGap="20%">
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
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={platformPerformance} outerRadius="70%">
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
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryBreakdown}
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
                    width={100}
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
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrend}>
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
            <div className="flex flex-col divide-y divide-white/[0.06]">
              {topContent.map((content) => {
                const PIcon = platformIcons[content.platform];
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
          </CardContent>
        </Card>
      </motion.div>

      {/* Disclaimer */}
      <motion.div variants={item} className="text-center pb-4">
        <p className="text-xs text-viralyze-muted/50">
          Analytics are based on mock data. Real historical data will appear as you run more predictions.
        </p>
      </motion.div>
    </motion.div>
  );
}
