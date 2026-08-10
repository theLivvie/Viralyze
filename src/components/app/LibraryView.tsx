'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Trash2,
  Inbox,
  Instagram,
  Youtube,
  Tv,
  Twitter,
  Linkedin,
  Loader2,
  GitCompareArrows,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Download,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import type { Platform, Classification, SavedAnalysis } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import QuickScoreWidget from '@/components/shared/QuickScoreWidget';

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
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const categoryLabels: Record<string, string> = {
  hook: 'Hook',
  engagement: 'Engage',
  shareability: 'Share',
  retention: 'Retain',
  originality: 'Original',
  audienceFit: 'Fit',
};

const scoreBarColor = (value: number) => {
  if (value >= 70) return 'bg-green-400';
  if (value >= 45) return 'bg-amber-400';
  return 'bg-red-400';
};

function SkeletonCard() {
  return (
    <Card className="glass animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="h-4 w-4 rounded bg-white/[0.06] shrink-0" />
            <div className="h-4 w-3/4 rounded bg-white/[0.06]" />
          </div>
          <div className="h-6 w-10 rounded bg-white/[0.06] shrink-0" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-14 rounded bg-white/[0.06]" />
            <div className="h-4 w-20 rounded bg-white/[0.06]" />
          </div>
          <div className="h-7 w-7 rounded bg-white/[0.06]" />
        </div>
      </CardContent>
    </Card>
  );
}

function CompareModal({
  analyses: selected,
  open,
  onOpenChange,
}: {
  analyses: SavedAnalysis[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const scoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 65) return 'text-green-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const bestCategoryLabels: Record<string, string> = {
    hook: 'Hook',
    engagement: 'Engagement',
    shareability: 'Shareability',
    retention: 'Retention',
    originality: 'Originality',
    audienceFit: 'Audience Fit',
    emotionalImpact: 'Emotional',
    contentQuality: 'Quality',
    trendAlignment: 'Trend',
  };

  // Compute best category per analysis
  const getBestCategory = (a: SavedAnalysis) => {
    if (!a.scores) return null;
    const entries = Object.entries(a.scores).filter(([, v]) => typeof v === 'number');
    if (entries.length === 0) return null;
    entries.sort(([, a], [, b]) => (b as number) - (a as number));
    const [key, value] = entries[0];
    return { label: bestCategoryLabels[key] || key, value: value as number };
  };

  // Find winner IDs
  const scoreWinnerId = selected.reduce<string | null>((
    best,
    a,
  ) => {
    const bestScore = selected.find((s) => s.id === best)?.overallScore ?? -1;
    return a.overallScore > bestScore ? a.id : best;
  }, selected[0]?.id ?? null);

  const bestCategories = selected.map((a) => ({ id: a.id, best: getBestCategory(a) }));
  const bestCategoryWinnerId = bestCategories.reduce<string | null>((
    best,
    curr,
  ) => {
    if (!curr.best) return best;
    const bestVal = bestCategories.find((b) => b.id === best)?.best?.value ?? -1;
    return curr.best.value > bestVal ? curr.id : best;
  }, bestCategories[0]?.id ?? null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-viralyze-black border-white/[0.08] max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-viralyze-white flex items-center gap-2">
            <GitCompareArrows className="h-5 w-5 text-wine-accent" />
            Compare Analyses
          </DialogTitle>
          <DialogDescription className="text-viralyze-muted">
            Side-by-side comparison of {selected.length} content analyses
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left py-2.5 pr-4 text-viralyze-muted font-medium text-xs uppercase tracking-wider w-28">Field</th>
                  {selected.map((a) => (
                    <th key={a.id} className="text-left py-2.5 px-3 text-viralyze-white font-medium text-xs min-w-[180px]">
                      {a.title || 'Untitled'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {/* Score */}
                <tr className="hover:glow-wine-sm transition-all">
                  <td className="py-3 pr-4 text-viralyze-muted text-xs">Score</td>
                  {selected.map((a) => (
                    <td key={a.id} className="py-3 px-3">
                      <span className={cn('text-lg font-bold tabular-nums', scoreColor(a.overallScore))}>
                        {a.overallScore}
                      </span>
                      {scoreWinnerId === a.id && <span className="ml-1.5">🏆</span>}
                    </td>
                  ))}
                </tr>
                {/* Classification */}
                <tr className="hover:glow-wine-sm transition-all">
                  <td className="py-3 pr-4 text-viralyze-muted text-xs">Classification</td>
                  {selected.map((a) => (
                    <td key={a.id} className="py-3 px-3">
                      <Badge
                        variant="outline"
                        className={cn('text-xs capitalize', classificationStyles[a.classification])}
                      >
                        {a.classification}
                      </Badge>
                    </td>
                  ))}
                </tr>
                {/* Platform */}
                <tr className="hover:glow-wine-sm transition-all">
                  <td className="py-3 pr-4 text-viralyze-muted text-xs">Platform</td>
                  {selected.map((a) => {
                    const PI = platformIcons[a.platform];
                    return (
                      <td key={a.id} className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-viralyze-white">
                          <PI className="h-3.5 w-3.5 text-viralyze-muted" />
                          <span className="text-xs capitalize">{a.platform}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
                {/* Content Type */}
                <tr className="hover:glow-wine-sm transition-all">
                  <td className="py-3 pr-4 text-viralyze-muted text-xs">Content Type</td>
                  {selected.map((a) => (
                    <td key={a.id} className="py-3 px-3">
                      <span className="text-xs text-viralyze-white capitalize">{a.contentType}</span>
                    </td>
                  ))}
                </tr>
                {/* Date */}
                <tr className="hover:glow-wine-sm transition-all">
                  <td className="py-3 pr-4 text-viralyze-muted text-xs">Date</td>
                  {selected.map((a) => (
                    <td key={a.id} className="py-3 px-3">
                      <span className="text-xs text-viralyze-muted">
                        {new Date(a.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                  ))}
                </tr>
                {/* Best Category */}
                <tr className="hover:glow-wine-sm transition-all">
                  <td className="py-3 pr-4 text-viralyze-muted text-xs">Best Category</td>
                  {bestCategories.map((bc) => (
                    <td key={bc.id} className="py-3 px-3">
                      {bc.best ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-viralyze-white font-medium">{bc.best.label}</span>
                          <span className={cn('text-xs font-bold tabular-nums', scoreColor(bc.best.value))}>
                            {bc.best.value}
                          </span>
                          {bestCategoryWinnerId === bc.id && <span>🏆</span>}
                        </div>
                      ) : (
                        <span className="text-xs text-viralyze-muted">N/A</span>
                      )}
                    </td>
                  ))}
                </tr>
                {/* Visual score bar */}
                <tr className="hover:glow-wine-sm transition-all">
                  <td className="py-3 pr-4 text-viralyze-muted text-xs">Score Bar</td>
                  {selected.map((a) => {
                    const barColor = a.overallScore >= 70 ? 'bg-green-400' : a.overallScore >= 50 ? 'bg-amber-400' : 'bg-red-400';
                    return (
                      <td key={a.id} className="py-3 px-3">
                        <div className="h-2.5 w-full max-w-[140px] rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all duration-500', barColor)}
                            style={{ width: `${a.overallScore}%` }}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function LibraryView() {
  const { setSavedAnalyses, removeSavedAnalysis, setCurrentAnalysis, setCurrentView, user } = useAppStore();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sort, setSort] = useState<string>('newest');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchLibrary = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/library?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setAnalyses(data);
        setSavedAnalyses(data);
      }
    } catch {
      // Silently fail — use whatever is in local state
    } finally {
      setLoading(false);
    }
  }, [user?.id, setSavedAnalyses]);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const filtered = analyses
    .filter((a) => {
      if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (platformFilter !== 'all' && a.platform !== platformFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === 'score-high') return b.overallScore - a.overallScore;
      if (sort === 'score-low') return a.overallScore - b.overallScore;
      return 0;
    });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user?.id) return;
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 2000);
      return;
    }
    setDeleting(id);
    try {
      const res = await fetch(`/api/library?id=${id}&userId=${user.id}`, { method: 'DELETE' });
      if (res.ok) {
        setAnalyses((prev) => prev.filter((a) => a.id !== id));
        removeSavedAnalysis(id);
        setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
        toast.success('Removed from library');
      } else {
        toast.error('Failed to delete analysis');
      }
    } catch {
      toast.error('Failed to delete analysis');
    } finally {
      setDeleting(null);
    }
  };

  const [viewingId, setViewingId] = useState<string | null>(null);

  const handleCardClick = async (id: string) => {
    if (compareMode) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else if (next.size < 3) {
          next.add(id);
        } else {
          toast.info('You can compare up to 3 items');
          return prev;
        }
        return next;
      });
    } else {
      try {
        setViewingId(id);
        const res = await fetch(`/api/library?id=${id}`);
        if (res.ok) {
          const data = await res.json();
          setCurrentAnalysis(data);
          setCurrentView('analysis');
        } else {
          toast.error('Failed to load analysis');
        }
      } catch {
        toast.error('Failed to load analysis');
      } finally {
        setViewingId(null);
      }
    }
  };

  const selectedAnalyses = analyses.filter((a) => selectedIds.has(a.id));

  const handleCompare = () => {
    if (selectedIds.size >= 2) {
      setCompareOpen(true);
    }
  };

  const exitCompareMode = () => {
    setCompareMode(false);
    setSelectedIds(new Set());
  };

  const isFilteredEmpty = !loading && filtered.length === 0 && analyses.length > 0;
  const isEmpty = !loading && analyses.length === 0;

  const compareItems = compareMode && selectedIds.size === 2
    ? analyses.filter((a) => selectedIds.has(a.id))
    : [];
  const showComparePanel = compareItems.length === 2;
  const [compareA, compareB] = showComparePanel ? compareItems : [null, null];
  const compareScoreDiff = showComparePanel ? compareA!.overallScore - compareB!.overallScore : 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 max-w-4xl mx-auto"
    >
      {/* Header with count badge */}
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl md:text-3xl font-bold text-viralyze-white">
              Content Library
            </h2>
            {!loading && analyses.length > 0 && (
              <Badge
                variant="outline"
                className="text-xs border-wine-accent/30 text-wine-accent bg-wine-accent/10 tabular-nums"
              >
                {analyses.length}
              </Badge>
            )}
          </div>
          <p className="text-viralyze-muted mt-1">
            Your saved content analyses
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-viralyze-muted" />
          <Input
            placeholder="Search analyses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/[0.05] border-white/[0.08] text-viralyze-white placeholder:text-viralyze-muted/40 focus-visible:ring-wine-accent hover:border-white/[0.12] transition-colors"
          />
        </div>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-white/[0.05] border-white/[0.08] text-viralyze-white hover:border-white/[0.12] transition-colors">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent className="bg-viralyze-soft-black border-white/[0.08]">
            <SelectItem value="all" className="text-viralyze-white">All Platforms</SelectItem>
            <SelectItem value="instagram" className="text-viralyze-white">Instagram</SelectItem>
            <SelectItem value="youtube" className="text-viralyze-white">YouTube</SelectItem>
            <SelectItem value="tiktok" className="text-viralyze-white">TikTok</SelectItem>
            <SelectItem value="x" className="text-viralyze-white">X</SelectItem>
            <SelectItem value="linkedin" className="text-viralyze-white">LinkedIn</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-40 bg-white/[0.05] border-white/[0.08] text-viralyze-white hover:border-white/[0.12] transition-colors">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent className="bg-viralyze-soft-black border-white/[0.08]">
            <SelectItem value="newest" className="text-viralyze-white">Newest First</SelectItem>
            <SelectItem value="oldest" className="text-viralyze-white">Oldest First</SelectItem>
            <SelectItem value="score-high" className="text-viralyze-white">Score: High to Low</SelectItem>
            <SelectItem value="score-low" className="text-viralyze-white">Score: Low to High</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Score Trend sparkline */}
      {!loading && analyses.length >= 3 && (
        <motion.div variants={item}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-viralyze-muted uppercase tracking-wider">Score Trend</span>
          </div>
          <Card className="glass">
            <CardContent className="p-4">
              {(() => {
                const last15 = analyses.slice(-15);
                const avg = Math.round(last15.reduce((s, a) => s + a.overallScore, 0) / last15.length);
                return (
                  <div className="relative flex items-end gap-1.5 h-20">
                    {last15.map((a, i) => {
                      const h = Math.max(4, (a.overallScore / 100) * 100);
                      const barColor = a.overallScore >= 70 ? 'bg-green-400' : a.overallScore >= 50 ? 'bg-amber-400' : 'bg-red-400';
                      return (
                        <motion.div
                          key={a.id}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.5, delay: i * 0.04, ease: 'easeOut' }}
                          className={cn('flex-1 rounded-sm min-w-[4px] max-w-[20px]', barColor)}
                          title={`Score: ${a.overallScore}`}
                        />
                      );
                    })}
                    {/* Average dashed line */}
                    <div
                      className="absolute left-0 right-0 border-t border-dashed border-viralyze-muted/30 pointer-events-none"
                      style={{ bottom: `${avg}%` }}
                    />
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Compare controls */}
      {!loading && analyses.length > 1 && (
        <motion.div variants={item} className="flex items-center gap-2">
          <Button
            variant={compareMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              if (compareMode) {
                exitCompareMode();
              } else {
                setCompareMode(true);
              }
            }}
            className={cn(
              'gap-1.5 transition-all',
              compareMode
                ? 'bg-wine-accent hover:bg-wine-accent/80 text-white border-wine-accent'
                : 'border-white/[0.08] text-viralyze-white hover:bg-white/[0.05] hover:border-white/20'
            )}
          >
            <GitCompareArrows className="h-3.5 w-3.5" />
            {compareMode ? 'Exit Compare' : 'Compare'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const csvRows = ['Title,Platform,Content Type,Score,Classification,Date'];
              filtered.forEach((a) => {
                const row = [
                  `"${(a.title || 'Untitled').replace(/"/g, '""')}",`,
                  a.platform,
                  a.contentType,
                  a.overallScore,
                  a.classification,
                  new Date(a.createdAt).toLocaleDateString(),
                ].join(',');
                csvRows.push(row);
              });
              const csvString = csvRows.join('\n');
              const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'viralyze-library.csv';
              link.click();
              URL.revokeObjectURL(url);
              toast.success('Library exported as CSV');
            }}
            className="gap-1.5 border-white/[0.08] text-viralyze-white hover:bg-white/[0.05] hover:border-white/20 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          {compareMode && selectedIds.size > 0 && (
            <>
              <span className="text-xs text-viralyze-muted">
                {selectedIds.size}/3 selected
              </span>
              {selectedIds.size >= 2 && (
                <Button
                  size="sm"
                  onClick={handleCompare}
                  className="bg-wine-accent hover:bg-wine-accent/80 text-white gap-1.5"
                >
                  Compare Selected ({selectedIds.size})
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
                className="text-viralyze-muted hover:text-viralyze-white gap-1"
              >
                <X className="h-3 w-3" />
                Clear
              </Button>
            </>
          )}
        </motion.div>
      )}

      {/* Inline Comparison Panel - shows when exactly 2 items selected */}
      <AnimatePresence>
        {showComparePanel && compareA && compareB && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -12 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <Card className="glass glow-wine-sm mb-2">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GitCompareArrows className="h-4 w-4 text-wine-accent" />
                    <span className="text-sm font-semibold text-viralyze-white">Comparison</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={exitCompareMode}
                    className="text-viralyze-muted hover:text-viralyze-white gap-1 h-7 text-xs"
                  >
                    <X className="h-3 w-3" />
                    Clear Comparison
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[compareA, compareB].map((item) => {
                    if (!item) return null;
                    const PI = platformIcons[item.platform];
                    return (
                      <div key={item.id} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <div className="flex items-center gap-2 text-viralyze-white">
                          <PI className="h-4 w-4 text-viralyze-muted" />
                          <span className="text-sm font-medium capitalize">{item.platform}</span>
                        </div>
                        <QuickScoreWidget
                          score={item.overallScore}
                          size="lg"
                          classification={item.classification}
                        />
                        <p className="text-xs text-viralyze-white text-center font-medium leading-snug line-clamp-2">
                          {item.title || 'Untitled'}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {/* Score difference */}
                <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-white/[0.06]">
                  <span className="text-xs text-viralyze-muted">Score difference:</span>
                  {compareScoreDiff > 0 ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-400">
                      <ArrowUp className="h-3 w-3" />
                      +{compareScoreDiff} for {compareA.title || 'Item 1'}
                    </span>
                  ) : compareScoreDiff < 0 ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-400">
                      <ArrowDown className="h-3 w-3" />
                      +{Math.abs(compareScoreDiff)} for {compareB.title || 'Item 2'}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-viralyze-muted">Tied!</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeleton */}
      {loading && (
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </motion.div>
      )}

      {/* Empty state — no analyses at all — animated dashed border */}
      {!loading && isEmpty && (
        <motion.div variants={item}>
          <div className="relative rounded-xl p-px animate-pulse-glow">
            <div className="absolute inset-0 rounded-xl border-2 border-dashed border-white/[0.08]" />
            <Card className="glass relative z-0">
              <CardContent className="p-12 flex flex-col items-center gap-3 text-center">
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Inbox className="h-10 w-10 text-viralyze-muted/40" />
                </motion.div>
                <p className="text-viralyze-muted text-sm">No analyses yet</p>
                <p className="text-viralyze-muted/60 text-xs">Your saved content predictions will appear here</p>
                <Button
                  onClick={() => useAppStore.getState().setCurrentView('predict')}
                  className="bg-gradient-wine hover:opacity-90 text-white mt-2 btn-shine"
                >
                  Analyze Content
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Empty state — filtered results — animated dashed border */}
      {isFilteredEmpty && (
        <motion.div variants={item}>
          <div className="relative rounded-xl p-px">
            <div className="absolute inset-0 rounded-xl border-2 border-dashed border-white/[0.08]" />
            <Card className="glass relative z-0">
              <CardContent className="p-12 flex flex-col items-center gap-3 text-center">
                <Search className="h-10 w-10 text-viralyze-muted/40" />
                <p className="text-viralyze-muted text-sm">No results found</p>
                <p className="text-viralyze-muted/60 text-xs">Try adjusting your search or filter</p>
                <Button
                  variant="outline"
                  onClick={() => { setSearch(''); setPlatformFilter('all'); }}
                  className="mt-2 border-white/10 text-viralyze-white hover:bg-white/[0.05] hover:border-white/20 transition-colors"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((analysis) => {
            const PIcon = platformIcons[analysis.platform];
            const isSelected = selectedIds.has(analysis.id);

            // Compute top 3 score categories
            const scoreKeys = ['hook', 'engagement', 'shareability', 'retention', 'originality', 'audienceFit'] as const;
            const topScores = analysis.scores
              ? scoreKeys
                  .map((k) => ({ key: k, value: analysis.scores![k] ?? 50 }))
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 3)
              : null;

            return (
              <motion.div key={analysis.id} variants={item}>
                <Card
                  className={cn(
                    'glass group transition-all duration-300 cursor-pointer relative overflow-hidden',
                    compareMode && 'hover:bg-white/[0.03]',
                    !compareMode && 'hover:bg-white/[0.03] hover:glow-wine-sm',
                    isSelected && 'border-2 border-wine-accent/60 glow-wine-sm bg-wine-accent/[0.04]',
                    !isSelected && compareMode && 'hover:border-wine-accent/30'
                  )}
                  onClick={() => handleCardClick(analysis.id)}
                >
                  {/* Shimmer overlay on hover */}
                  <motion.div
                    className="absolute inset-0 z-10 pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 55%, transparent 60%)',
                      }}
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '200%' }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                    />
                  </motion.div>
                  <CardContent className="p-4 relative z-20">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {compareMode && (
                          <div className={cn(
                            'h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                            isSelected
                              ? 'bg-wine-accent border-wine-accent'
                              : 'border-white/20 group-hover:border-wine-accent/40'
                          )}>
                            {isSelected && (
                              <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        )}
                        <PIcon className="h-4 w-4 text-viralyze-muted shrink-0" />
                        <span className="text-sm font-medium text-viralyze-white truncate">
                          {analysis.title || 'Untitled'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <QuickScoreWidget
                          score={analysis.overallScore}
                          size="sm"
                          classification={analysis.classification}
                        />
                        {/* Trend indicator based on position in sorted array */}
                        {(() => {
                          const idx = filtered.findIndex((a) => a.id === analysis.id);
                          const mid = Math.floor(filtered.length / 2);
                          if (filtered.length < 2) return <Minus className="h-3 w-3 text-viralyze-muted/30" />;
                          if (idx < mid) return <ArrowDownRight className="h-3.5 w-3.5 text-red-400/70" />;
                          if (idx > mid) return <ArrowUpRight className="h-3.5 w-3.5 text-green-400/70" />;
                          return <Minus className="h-3 w-3 text-viralyze-muted/30" />;
                        })()}
                      </div>
                    </div>
                    {/* Score category sparklines */}
                    {topScores && (
                      <div className="flex items-center gap-2 mb-3">
                        {topScores.map(({ key, value }) => (
                          <div
                            key={key}
                            className="flex flex-col items-center gap-0.5 min-w-0"
                          >
                            <span className="text-[10px] leading-tight text-viralyze-muted/70 font-medium tabular-nums whitespace-nowrap">
                              {categoryLabels[key]}: {value}
                            </span>
                            <div className="h-[1.5px] w-10 rounded-full bg-white/[0.06] overflow-hidden">
                              <div
                                className={cn('h-full rounded-full', scoreBarColor(value))}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-viralyze-muted">
                        <Badge variant="outline" className="text-xs border-white/10 text-viralyze-muted">
                          {analysis.contentType}
                        </Badge>
                        <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                      </div>
                      {confirmDeleteId === analysis.id ? (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-xs text-red-400 font-medium hover:text-red-300 transition-colors"
                          onClick={(e) => handleDelete(e, analysis.id)}
                          disabled={deleting === analysis.id}
                        >
                          {deleting === analysis.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirm?'}
                        </motion.button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-viralyze-muted/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleDelete(e, analysis.id)}
                          disabled={deleting === analysis.id}
                        >
                          {deleting === analysis.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Compare Modal */}
      <CompareModal
        analyses={selectedAnalyses}
        open={compareOpen}
        onOpenChange={setCompareOpen}
      />
    </motion.div>
  );
}
