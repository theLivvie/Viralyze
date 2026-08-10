'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Instagram, Youtube, Tv, Twitter, Linkedin, Flame, ArrowUpRight, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Platform } from '@/lib/types';
import { cn } from '@/lib/utils';

const platformIcons: Record<Platform, React.ElementType> = {
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Tv,
  x: Twitter,
  linkedin: Linkedin,
};

interface MockTrend {
  name: string;
  heat: number;
  growth: string;
  platforms: Platform[];
}

interface TrendCategory {
  category: string;
  icon: React.ElementType;
  trends: MockTrend[];
}

const fallbackTrendData: TrendCategory[] = [
  {
    category: 'Technology',
    icon: Flame,
    trends: [
      { name: 'AI-powered content creation tools', heat: 5, growth: '+142%', platforms: ['youtube', 'tiktok', 'x'] },
      { name: 'Claude vs ChatGPT comparisons', heat: 4, growth: '+89%', platforms: ['youtube', 'x'] },
      { name: 'Apple Vision Pro apps', heat: 3, growth: '+67%', platforms: ['youtube', 'instagram'] },
      { name: 'No-code app builders', heat: 3, growth: '+54%', platforms: ['youtube', 'tiktok'] },
    ],
  },
  {
    category: 'Social Media',
    icon: TrendingUp,
    trends: [
      { name: 'Day in the life content format', heat: 5, growth: '+201%', platforms: ['instagram', 'tiktok'] },
      { name: 'Storytelling carousels', heat: 4, growth: '+156%', platforms: ['instagram', 'linkedin'] },
      { name: 'Authentic behind-the-scenes', heat: 4, growth: '+98%', platforms: ['instagram', 'tiktok', 'youtube'] },
      { name: 'AI-generated thumbnails', heat: 3, growth: '+78%', platforms: ['youtube'] },
    ],
  },
  {
    category: 'Business',
    icon: ArrowUpRight,
    trends: [
      { name: 'Solopreneur journey documentation', heat: 5, growth: '+167%', platforms: ['youtube', 'x'] },
      { name: 'Passive income experiments', heat: 4, growth: '+124%', platforms: ['youtube', 'tiktok'] },
      { name: 'Building in public updates', heat: 3, growth: '+91%', platforms: ['x', 'linkedin'] },
    ],
  },
  {
    category: 'Culture',
    icon: Flame,
    trends: [
      { name: 'Nostalgia content (90s/2000s)', heat: 4, growth: '+134%', platforms: ['tiktok', 'instagram'] },
      { name: 'POV-style educational content', heat: 4, growth: '+112%', platforms: ['tiktok', 'instagram'] },
      { name: 'Cultural commentary', heat: 3, growth: '+65%', platforms: ['youtube', 'x'] },
    ],
  },
];

const emergingNiches = [
  { name: 'AI Agent Building', growth: '+340%', heat: 5 },
  { name: 'Climate Tech', growth: '+210%', heat: 4 },
  { name: 'Longevity & Biohacking', growth: '+189%', heat: 4 },
  { name: 'Creator Economy Tools', growth: '+167%', heat: 4 },
  { name: 'Rust Programming', growth: '+156%', heat: 3 },
  { name: 'Spatial Computing', growth: '+143%', heat: 3 },
];

// Map category names to icons
const categoryIconMap: Record<string, React.ElementType> = {
  technology: Flame,
  tech: Flame,
  social: TrendingUp,
  'social media': TrendingUp,
  business: ArrowUpRight,
  culture: Flame,
  health: TrendingUp,
  'health & wellness': TrendingUp,
  wellness: TrendingUp,
  entertainment: Flame,
  politics: ArrowUpRight,
  finance: ArrowUpRight,
  education: TrendingUp,
  lifestyle: Flame,
  sports: Flame,
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function HeatIndicator({ heat }: { heat: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Flame
          key={i}
          className={cn(
            'h-3.5 w-3.5',
            i < heat ? 'text-orange-400' : 'text-white/10'
          )}
        />
      ))}
    </div>
  );
}

export default function TrendsView() {
  const [trendData, setTrendData] = useState<TrendCategory[]>(fallbackTrendData);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState(false);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/trends');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.categories && Array.isArray(data.categories)) {
        // Map API response to our TrendCategory format
        const mapped: TrendCategory[] = data.categories.map(
          (cat: { category: string; trends: { name: string; growth: string; heat: number; platforms: string[] }[] }) => ({
            category: cat.category,
            icon: categoryIconMap[cat.category.toLowerCase()] || TrendingUp,
            trends: cat.trends.map((t) => ({
              name: t.name,
              heat: t.heat,
              growth: t.growth,
              platforms: (t.platforms || []).filter((p: string) => p in platformIcons) as Platform[],
            })),
          })
        );
        setTrendData(mapped);
        setLastUpdated(new Date());
      } else {
        // Keep fallback data
        setTrendData(fallbackTrendData);
      }
    } catch {
      setError(true);
      // Keep current data (fallback or previously fetched)
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 max-w-5xl mx-auto"
    >
      {/* Header with refresh and last updated */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <p className="text-viralyze-muted text-sm">
              Real-time trending topics across platforms
            </p>
            {lastUpdated && (
              <span className="text-xs text-viralyze-muted/50">
                &middot; Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
          {error && (
            <div className="flex items-center gap-1.5 mt-1">
              <AlertCircle className="h-3 w-3 text-amber-400" />
              <span className="text-xs text-amber-400/80">Failed to fetch live trends — showing cached data</span>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTrends}
          disabled={loading}
          className="w-fit border-white/[0.08] text-viralyze-white hover:bg-white/[0.05] hover:border-white/20 transition-colors gap-2"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {loading ? 'Fetching...' : 'Refresh Trends'}
        </Button>
      </motion.div>

      {/* Category Sections */}
      {trendData.map((cat) => {
        const CatIcon = cat.icon;
        return (
          <motion.div key={cat.category} variants={item}>
            <div className="flex items-center gap-2 mb-3">
              <CatIcon className="h-4 w-4 text-wine-accent" />
              <h3 className="text-sm font-semibold text-viralyze-white uppercase tracking-wider">
                {cat.category}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cat.trends.map((trend, i) => (
                <Card key={i} className="glass hover:bg-white/[0.03] transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-viralyze-white leading-snug">
                          {trend.name}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <HeatIndicator heat={trend.heat} />
                          <span className="text-xs font-medium text-green-400">
                            {trend.growth}
                          </span>
                        </div>
                        <div className="flex gap-1.5 mt-2">
                          {trend.platforms.map((p) => {
                            const PI = platformIcons[p];
                            return (
                              <div
                                key={p}
                                className="h-6 w-6 rounded-md bg-white/[0.06] flex items-center justify-center"
                              >
                                <PI className="h-3 w-3 text-viralyze-muted" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Emerging Niches */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-3">
          <ArrowUpRight className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-viralyze-white uppercase tracking-wider">
            Emerging Niches
          </h3>
        </div>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {emergingNiches.map((niche, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <HeatIndicator heat={niche.heat} />
                    <span className="text-sm text-viralyze-white font-medium">
                      {niche.name}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-green-400">{niche.growth}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Disclaimer */}
      <motion.div variants={item} className="text-center pb-4">
        <p className="text-xs text-viralyze-muted/50">
          {lastUpdated
            ? 'Trend data powered by AI analysis. Click refresh for latest trends.'
            : 'Trend data is illustrative. Click refresh for AI-powered live trends.'}
        </p>
      </motion.div>
    </motion.div>
  );
}
