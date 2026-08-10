'use client';

import { useState, useEffect } from 'react';
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
import type { Platform, Classification } from '@/lib/types';
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

export default function LibraryView() {
  const { savedAnalyses, setSavedAnalyses, removeSavedAnalysis, setCurrentAnalysis, setCurrentView, user } = useAppStore();
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sort, setSort] = useState<string>('newest');

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/library?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setSavedAnalyses(data);
        }
      } catch {
        // Silently fail — use local state
      }
    };
    fetchLibrary();
  }, [user?.id, setSavedAnalyses]);

  const filtered = savedAnalyses
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

  const handleDelete = (id: string) => {
    removeSavedAnalysis(id);
    toast.success('Removed from library');
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 max-w-4xl mx-auto"
    >
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

      {/* Results */}
      {filtered.length === 0 ? (
        <motion.div variants={item}>
          <Card className="glass">
            <CardContent className="p-12 flex flex-col items-center gap-3 text-center">
              <Inbox className="h-10 w-10 text-viralyze-muted/40" />
              <p className="text-viralyze-muted text-sm">No analyses found</p>
              <Button
                onClick={() => setCurrentView('predict')}
                className="bg-gradient-wine hover:opacity-90 text-white mt-2"
              >
                Analyze Content
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((analysis) => {
            const PIcon = platformIcons[analysis.platform];
            return (
              <motion.div key={analysis.id} variants={item}>
                <Card className="glass group hover:bg-white/[0.03] transition-colors cursor-pointer">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(analysis.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
