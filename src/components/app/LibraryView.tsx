'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
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

const classificationBorderStyles: Record<Classification, string> = {
  low: 'border-red-400',
  moderate: 'border-amber-400',
  high: 'border-green-400',
  viral: 'border-emerald-400',
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
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
                <tr>
                  <td className="py-3 pr-4 text-viralyze-muted text-xs">Score</td>
                  {selected.map((a) => (
                    <td key={a.id} className="py-3 px-3">
                      <span className={cn('text-lg font-bold tabular-nums', scoreColor(a.overallScore))}>
                        {a.overallScore}
                      </span>
                    </td>
                  ))}
                </tr>
                {/* Classification */}
                <tr>
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
                <tr>
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
                <tr>
                  <td className="py-3 pr-4 text-viralyze-muted text-xs">Content Type</td>
                  {selected.map((a) => (
                    <td key={a.id} className="py-3 px-3">
                      <span className="text-xs text-viralyze-white capitalize">{a.contentType}</span>
                    </td>
                  ))}
                </tr>
                {/* Date */}
                <tr>
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
                {/* Visual score bar */}
                <tr>
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
  const { setSavedAnalyses, removeSavedAnalysis, user } = useAppStore();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sort, setSort] = useState<string>('newest');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);

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

  const handleCardClick = (id: string) => {
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
      toast.info('Full analysis requires re-running prediction');
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
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
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
            return (
              <motion.div key={analysis.id} variants={item}>
                <Card
                  className={cn(
                    'glass group transition-all duration-300 cursor-pointer',
                    compareMode && 'hover:bg-white/[0.03]',
                    !compareMode && 'hover:bg-white/[0.03] hover:glow-wine-sm',
                    isSelected && 'border-2 border-wine-accent/60 glow-wine-sm bg-wine-accent/[0.04]',
                    !isSelected && compareMode && 'hover:border-wine-accent/30'
                  )}
                  onClick={() => handleCardClick(analysis.id)}
                >
                  <CardContent className="p-4">
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
                      <Badge
                        variant="outline"
                        className={cn('text-xs shrink-0', classificationStyles[analysis.classification])}
                      >
                        {analysis.overallScore}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-viralyze-muted">
                        <Badge variant="outline" className="text-xs border-white/10 text-viralyze-muted">
                          {analysis.contentType}
                        </Badge>
                        <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                      </div>
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
