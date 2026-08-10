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
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

export default function LibraryView() {
  const { setSavedAnalyses, removeSavedAnalysis, user } = useAppStore();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sort, setSort] = useState<string>('newest');
  const [deleting, setDeleting] = useState<string | null>(null);

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

  const handleCardClick = () => {
    toast.info('Full analysis requires re-running prediction');
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
      {/* Header */}
      <motion.div variants={item}>
        <h2 className="text-2xl md:text-3xl font-bold text-viralyze-white">
          Content Library
        </h2>
        <p className="text-viralyze-muted mt-1">
          Your saved content analyses
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-viralyze-muted" />
          <Input
            placeholder="Search analyses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/[0.05] border-white/[0.08] text-viralyze-white placeholder:text-viralyze-muted/40 focus-visible:ring-wine-accent"
          />
        </div>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-white/[0.05] border-white/[0.08] text-viralyze-white">
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
          <SelectTrigger className="w-full sm:w-40 bg-white/[0.05] border-white/[0.08] text-viralyze-white">
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

      {/* Loading skeleton */}
      {loading && (
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </motion.div>
      )}

      {/* Empty state — no analyses at all */}
      {!loading && isEmpty && (
        <motion.div variants={item}>
          <Card className="glass">
            <CardContent className="p-12 flex flex-col items-center gap-3 text-center">
              <Inbox className="h-10 w-10 text-viralyze-muted/40" />
              <p className="text-viralyze-muted text-sm">No analyses yet</p>
              <p className="text-viralyze-muted/60 text-xs">Your saved content predictions will appear here</p>
              <Button
                onClick={() => useAppStore.getState().setCurrentView('predict')}
                className="bg-gradient-wine hover:opacity-90 text-white mt-2"
              >
                Analyze Content
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty state — filtered results */}
      {isFilteredEmpty && (
        <motion.div variants={item}>
          <Card className="glass">
            <CardContent className="p-12 flex flex-col items-center gap-3 text-center">
              <Search className="h-10 w-10 text-viralyze-muted/40" />
              <p className="text-viralyze-muted text-sm">No results found</p>
              <p className="text-viralyze-muted/60 text-xs">Try adjusting your search or filter</p>
              <Button
                variant="outline"
                onClick={() => { setSearch(''); setPlatformFilter('all'); }}
                className="mt-2 border-white/10 text-viralyze-white hover:bg-white/[0.05]"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((analysis) => {
            const PIcon = platformIcons[analysis.platform];
            return (
              <motion.div key={analysis.id} variants={item}>
                <Card
                  className="glass group hover:bg-white/[0.03] transition-colors cursor-pointer"
                  onClick={handleCardClick}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
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
    </motion.div>
  );
}
