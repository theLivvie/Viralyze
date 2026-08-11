'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Instagram, Youtube, Tv, Twitter, Linkedin, Flame, ArrowUpRight, RefreshCw, Loader2, AlertCircle, Clock, Lightbulb, Search, Bookmark, BookmarkCheck, Sparkles, ChevronsDown, ChevronsUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';
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

const filterCategories = ['All', 'Technology', 'Entertainment', 'Lifestyle', 'Business', 'Health'] as const;
type FilterCategory = (typeof filterCategories)[number];

// Map filter categories to the trend data categories
const filterToDataCategory: Record<string, string[]> = {
  All: [],
  Technology: ['technology'],
  Entertainment: ['social media', 'culture'],
  Lifestyle: ['culture', 'social media'],
  Business: ['business'],
  Health: ['health & wellness', 'health'],
};

interface MockTrend {
  name: string;
  heat: number;
  growth: string;
  platforms: Platform[];
  category: string;
  description?: string;
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
      { name: 'AI-powered content creation tools', heat: 5, growth: '+142%', platforms: ['youtube', 'tiktok', 'x'], category: 'technology', label: 'Hot', description: 'AI tools for generating, editing, and optimizing social media content are exploding in popularity across creator communities.' },
      { name: 'Claude vs ChatGPT comparisons', heat: 4, growth: '+89%', platforms: ['youtube', 'x'], category: 'technology', description: 'Head-to-head AI model comparisons drive massive engagement as users seek the best tool for their workflows.' },
      { name: 'Apple Vision Pro apps', heat: 3, growth: '+67%', platforms: ['youtube', 'instagram'], category: 'technology', description: 'Spatial computing apps and use cases continue to gain traction as early adopters share experiences.' },
      { name: 'No-code app builders', heat: 3, growth: '+54%', platforms: ['youtube', 'tiktok'], category: 'technology', description: 'Building apps without coding remains a popular topic with tutorials and showcase content performing well.' },
    ],
  },
  {
    category: 'Social Media',
    icon: TrendingUp,
    trends: [
      { name: 'Day in the life content format', heat: 5, growth: '+201%', platforms: ['instagram', 'tiktok'], category: 'social media', label: 'Hot', description: 'Authentic daily routines and lifestyle content continues to dominate short-form video with high save rates.' },
      { name: 'Storytelling carousels', heat: 4, growth: '+156%', platforms: ['instagram', 'linkedin'], category: 'social media', label: 'Rising', description: 'Multi-slide educational carousels with narrative structures are driving high engagement on Instagram and LinkedIn.' },
      { name: 'Authentic behind-the-scenes', heat: 4, growth: '+98%', platforms: ['instagram', 'tiktok', 'youtube'], category: 'social media', description: 'Unfiltered behind-the-scenes content showing real work processes resonates strongly with audiences.' },
      { name: 'AI-generated thumbnails', heat: 3, growth: '+78%', platforms: ['youtube'], category: 'social media', description: 'Creators experimenting with AI tools for thumbnail design is sparking debate and driving curiosity clicks.' },
    ],
  },
  {
    category: 'Business',
    icon: ArrowUpRight,
    trends: [
      { name: 'Solopreneur journey documentation', heat: 5, growth: '+167%', platforms: ['youtube', 'x'], category: 'business', label: 'Hot', description: 'Documenting the real journey of building a business alone creates deep audience connection and loyalty.' },
      { name: 'Passive income experiments', heat: 4, growth: '+124%', platforms: ['youtube', 'tiktok'], category: 'business', description: 'Testing and sharing real results from passive income strategies drives high comments and shares.' },
      { name: 'Building in public updates', heat: 3, growth: '+91%', platforms: ['x', 'linkedin'], category: 'business', description: 'Regular transparency updates about product development attract engaged niche communities.' },
    ],
  },
  {
    category: 'Culture',
    icon: Flame,
    trends: [
      { name: 'Nostalgia content (90s/2000s)', heat: 4, growth: '+134%', platforms: ['tiktok', 'instagram'], category: 'culture', label: 'Rising', description: 'Throwback content tapping into collective nostalgia memories drives high shares and comments.' },
      { name: 'POV-style educational content', heat: 4, growth: '+112%', platforms: ['tiktok', 'instagram'], category: 'culture', description: 'Point-of-view educational content that puts viewers in specific scenarios is a powerful engagement format.' },
      { name: 'Cultural commentary', heat: 3, growth: '+65%', platforms: ['youtube', 'x'], category: 'culture', description: 'Thoughtful analysis of cultural trends and phenomena attracts niche but highly engaged audiences.' },
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

function HeatBar({ heat }: { heat: number }) {
  const heatColor = heat >= 5 ? 'from-wine-accent via-orange-400 to-red-500' : heat >= 4 ? 'from-wine-accent via-orange-400 to-wine-accent' : heat >= 3 ? 'from-wine-accent/80 via-amber-400 to-wine-accent/80' : 'from-wine-accent/50 via-amber-400/50 to-wine-accent/50';
  return (
    <div className="h-1.5 rounded-full bg-white/[0.06] w-full overflow-hidden relative">
      {/* Heat level segments (1-5) */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-1 border-r border-white/[0.04] last:border-r-0" />
        ))}
      </div>
      <motion.div
        className={cn('h-full rounded-full bg-gradient-to-r', heatColor)}
        initial={{ width: 0 }}
        animate={{ width: `${(heat / 5) * 100}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
      />
      {/* Glow at the tip */}
      {heat >= 4 && (
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-orange-400/40 blur-sm pointer-events-none"
          initial={{ opacity: 0, left: 0 }}
          animate={{ opacity: [0.4, 0.8, 0.4], left: `${(heat / 5) * 100}%`, x: '-5px' }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2, opacity: { repeat: Infinity, duration: 1.5 } }}
        />
      )}
    </div>
  );
}

// Empty state component for no matching trends
function TrendsEmptyState({ searchQuery, hasFilter, onClear }: { searchQuery: string; hasFilter: boolean; onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="h-16 w-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
        <Search className="h-7 w-7 text-viralyze-muted/50" />
      </div>
      <h3 className="text-lg font-semibold text-viralyze-white mb-1">
        No trends found
      </h3>
      <p className="text-sm text-viralyze-muted max-w-sm mb-5">
        {searchQuery && hasFilter
          ? 'No trends match both your search and filter. Try broadening your criteria.'
          : searchQuery
          ? `No trends match "${searchQuery}". Try a different keyword.`
          : 'No trends found in this category. Try selecting "All" to see everything.'}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={onClear}
        className="border-wine-accent/30 text-wine-accent hover:bg-wine-accent/10"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Clear Filters
      </Button>
    </motion.div>
  );
}

export default function TrendsView() {
  const { setPrefilledIdea, setPredictMode, setCurrentView } = useAppStore();
  const [trendData, setTrendData] = useState<TrendCategory[]>(fallbackTrendData);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState(false);
  const [liveClock, setLiveClock] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All');
  const [bookmarkedTrends, setBookmarkedTrends] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  const toggleExpandAll = () => {
    setExpandedCategories((prev) => {
      // Check if all categories in current filtered data are expanded
      const allExpanded = filteredTrendData.every((c) => prev.has(c.category));
      if (allExpanded) {
        return new Set();
      } else {
        return new Set(filteredTrendData.map((c) => c.category));
      }
    });
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggleDescription = (trendName: string) => {
    setExpandedDescriptions((prev) => {
      const next = new Set(prev);
      if (next.has(trendName)) next.delete(trendName);
      else next.add(trendName);
      return next;
    });
  };

  const handleUseAsIdea = (trendName: string) => {
    setPrefilledIdea(`Create content about: ${trendName}`);
    setPredictMode('idea');
    setCurrentView('predict');
    toast.success('Trend loaded — customize and analyze!');
  };

  const toggleBookmark = (trendName: string) => {
    setBookmarkedTrends((prev) => {
      const next = new Set(prev);
      if (next.has(trendName)) {
        next.delete(trendName);
        toast.info('Bookmark removed');
      } else {
        next.add(trendName);
        toast.success('Trend bookmarked!');
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveFilter('All');
  };

  // Live clock tick
  useEffect(() => {
    const interval = setInterval(() => setLiveClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/trends');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.categories && Array.isArray(data.categories)) {
        const mapped: TrendCategory[] = data.categories.map(
          (cat: { category: string; trends: { name: string; growth: string; heat: number; platforms: string[]; label?: string }[] }) => ({
            category: cat.category,
            icon: categoryIconMap[cat.category.toLowerCase()] || TrendingUp,
            trends: cat.trends.map((t) => ({
              name: t.name,
              heat: t.heat,
              growth: t.growth,
              platforms: (t.platforms || []).filter((p: string) => p in platformIcons) as Platform[],
              category: cat.category.toLowerCase(),
              label: t.label,
            })),
          })
        );
        setTrendData(mapped);
        setLastUpdated(new Date());
      } else {
        setTrendData(fallbackTrendData);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtered trend data based on search and category filter
  const filteredTrendData = useMemo(() => {
    let data = trendData;

    // Apply category filter
    if (activeFilter !== 'All') {
      const matchCategories = filterToDataCategory[activeFilter] || [];
      if (matchCategories.length > 0) {
        data = data.filter((cat) =>
          matchCategories.some((mc) => cat.category.toLowerCase() === mc)
        );
      }
    }

    // Apply search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      data = data
        .map((cat) => ({
          ...cat,
          trends: cat.trends.filter((t) => t.name.toLowerCase().includes(q)),
        }))
        .filter((cat) => cat.trends.length > 0);
    }

    return data;
  }, [trendData, activeFilter, searchQuery]);

  // Auto-expand categories when filtered data changes (only if none are expanded)
  useEffect(() => {
    setExpandedCategories((prev) => {
      if (prev.size === 0 && filteredTrendData.length > 0) {
        return new Set(filteredTrendData.map((c) => c.category));
      }
      return prev;
    });
  }, [filteredTrendData]);

  const hasAnyResults = filteredTrendData.some((cat) => cat.trends.length > 0);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 max-w-5xl mx-auto noise-bg relative"
    >
      {/* Header with refresh and last updated — live clock feel */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <p className="text-viralyze-muted text-sm">
              Real-time trending topics across platforms
            </p>
            <div className="flex items-center gap-1 text-viralyze-muted/30">
              <Clock className="h-3 w-3" />
              <span className="text-[10px] font-mono tabular-nums">
                {liveClock.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
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

      {/* Search input with gradient shift on focus */}
      <motion.div variants={item} className="relative">
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none z-0 opacity-0 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(127,29,58,0.08) 0%, rgba(184,50,90,0.12) 50%, rgba(74,16,36,0.06) 100%)',
          }}
          animate={{ opacity: searchQuery ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-viralyze-muted/50 pointer-events-none z-10" />
        <input
          type="text"
          placeholder="Search trends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-viralyze-white placeholder:text-viralyze-muted/40 focus:outline-none focus-glow-wine focus:border-wine-accent/40 transition-all duration-200 relative z-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-viralyze-muted/40 hover:text-viralyze-white transition-colors text-xs z-10"
          >
            Clear
          </button>
        )}
      </motion.div>

      {/* Category filter pills */}
      <motion.div variants={item} className="flex flex-wrap gap-2">
        {filterCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
              activeFilter === cat
                ? 'bg-wine-accent/20 border-wine-accent/40 text-wine-accent glow-wine-sm'
                : 'bg-white/[0.03] border-white/[0.08] text-viralyze-muted hover:text-viralyze-white hover:border-white/15'
            )}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Trend categories — with empty state when nothing matches */}
      <AnimatePresence mode="wait">
        {!hasAnyResults ? (
          <TrendsEmptyState
            key="empty"
            searchQuery={searchQuery}
            hasFilter={activeFilter !== 'All'}
            onClear={clearFilters}
          />
        ) : (
          <motion.div key="trends" variants={container} initial="hidden" animate="show" exit="hidden">
            {filteredTrendData.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <motion.div
                  key={cat.category}
                  variants={item}
                  className="mb-8 last:mb-0"
                >
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2">
                      <CatIcon className="h-4 w-4 text-wine-accent" />
                      <h3 className="text-sm font-semibold text-viralyze-white uppercase tracking-wider">
                        {cat.category}
                      </h3>
                      <span className="text-[10px] text-viralyze-muted/50 tabular-nums">{cat.trends.length} trends</span>
                    </div>
                  </motion.div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cat.trends.map((trend, i) => {
                      const isBookmarked = bookmarkedTrends.has(trend.name);
                      const isHot = (trend as any).label === 'Hot' || trend.heat >= 5;
                      const isRising = (trend as any).label === 'Rising' || trend.growth.startsWith('+1');
                      const hasPulseLabel = isHot || isRising;

                      return (
                        <Card
                          key={i}
                          className={cn(
                            'glass group hover:bg-white/[0.03] transition-all duration-300 relative overflow-hidden',
                            hasPulseLabel && 'animate-pulse-glow'
                          )}
                        >
                          {/* Glass-morphism shimmer on hover */}
                          <motion.div
                            className="absolute inset-0 pointer-events-none z-10"
                            initial={{ backgroundPosition: '200% 0' }}
                            whileHover={{ backgroundPosition: '-200% 0' }}
                            transition={{ duration: 1, ease: 'easeInOut' }}
                            style={{
                              background: 'linear-gradient(105deg, transparent 35%, rgba(184,50,90,0.04) 42%, rgba(255,255,255,0.02) 50%, rgba(184,50,90,0.04) 58%, transparent 65%)',
                              backgroundSize: '200% 100%',
                            }}
                          />
                          {/* Glowing border on hover */}
                          <motion.div
                            className="absolute inset-0 rounded-lg pointer-events-none z-0"
                            initial={{ boxShadow: '0 0 0px rgba(184,50,90,0)' }}
                            whileHover={{
                              boxShadow: '0 0 16px rgba(184,50,90,0.12), 0 0 32px rgba(127,29,58,0.06)',
                            }}
                            transition={{ duration: 0.4 }}
                          />
                          <CardContent className="p-4 relative z-10">
                            {/* Hot / Rising pulse label with pulsing dot */}
                            {hasPulseLabel && (
                              <div className="absolute top-2 right-2 z-20">
                                <span className={cn(
                                  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                                  isHot
                                    ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                )}>
                                  <motion.span
                                    className={cn(
                                      'h-1.5 w-1.5 rounded-full',
                                      isHot ? 'bg-orange-400' : 'bg-emerald-400'
                                    )}
                                    animate={{ opacity: [1, 0.3, 1], scale: [1, 0.7, 1] }}
                                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                                  />
                                  {isHot ? (
                                    <motion.span
                                      className="inline-block"
                                      animate={{ rotate: [0, -8, 8, -6, 6, 0] }}
                                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                                    >
                                      <Flame className="h-2.5 w-2.5" />
                                    </motion.span>
                                  ) : (
                                    <Flame className="h-2.5 w-2.5" />
                                  )}
                                  {isHot ? 'Hot' : 'Rising'}
                                </span>
                              </div>
                            )}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-viralyze-white leading-snug pr-16">
                                  {trend.name}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <HeatIndicator heat={trend.heat} />
                                  <span className="text-xs font-medium text-green-400">
                                    {trend.growth}
                                  </span>
                                </div>
                                {/* Animated heat bar */}
                                <div className="mt-2">
                                  <HeatBar heat={trend.heat} />
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
                            {/* Bookmark button with scale animation */}
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBookmark(trend.name);
                              }}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.8 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                              className={cn(
                                'absolute bottom-3 left-3 h-7 w-7 rounded-md flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 z-20',
                                isBookmarked
                                  ? 'bg-wine-accent/20 text-wine-accent opacity-100'
                                  : 'bg-white/[0.06] text-viralyze-muted hover:text-viralyze-white'
                              )}
                              title={isBookmarked ? 'Remove bookmark' : 'Bookmark this trend'}
                            >
                              {isBookmarked ? (
                                <BookmarkCheck className="h-3.5 w-3.5" />
                              ) : (
                                <Bookmark className="h-3.5 w-3.5" />
                              )}
                            </motion.button>
                            {/* Use as Idea button — visible on hover */}
                            <Button
                              size="sm"
                              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-wine btn-shine text-white h-7 px-2.5 text-xs gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUseAsIdea(trend.name);
                              }}
                            >
                              <Lightbulb className="h-3 w-3" />
                              Use as Idea
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

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
                  className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-wine-accent/20 transition-colors"
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
