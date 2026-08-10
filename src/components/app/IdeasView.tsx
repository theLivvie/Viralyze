'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Loader2, Sparkles, Instagram, Youtube, Tv, Twitter, Linkedin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import PlatformSelector from '@/components/shared/PlatformSelector';
import type { Platform, IdeaSuggestion } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const platformIcons: Record<Platform, React.ElementType> = {
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Tv,
  x: Twitter,
  linkedin: Linkedin,
};

const suggestionChips = ['AI & Tech', 'Health & Wellness', 'Business Growth'];

function getViralLevel(score: number): { label: string; color: string; emoji: string } {
  if (score >= 75) return { label: 'High', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', emoji: '🔥' };
  if (score >= 50) return { label: 'Medium', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', emoji: '🔥' };
  return { label: 'Low', color: 'text-red-400 bg-red-500/10 border-red-500/30', emoji: '🔥' };
}

function ShimmerCard() {
  return (
    <Card className="glass animate-pulse">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="h-4 w-3/4 rounded bg-white/[0.06]" />
          <div className="h-5 w-10 rounded bg-white/[0.06] shrink-0" />
        </div>
        <div className="h-3 w-full rounded bg-white/[0.06]" />
        <div className="h-3 w-5/6 rounded bg-white/[0.06]" />
        <div className="h-3 w-2/3 rounded bg-white/[0.06]" />
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="h-3 w-24 rounded bg-white/[0.06]" />
          <div className="h-7 w-20 rounded bg-white/[0.06]" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function IdeasView() {
  const { predictPlatform, setPredictPlatform, setPredictContentType, setPredictMode, setCurrentView, setAnalysisLoading, setPrefilledIdea } = useAppStore();

  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<IdeaSuggestion[]>([]);

  const hasTopic = topic.trim().length > 0;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          platform: predictPlatform,
          audience,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to generate ideas');
        return;
      }

      // API may return array directly or wrapped in {ideas: [...]}
      const ideasList = Array.isArray(data) ? data : data.ideas || [];
      setIdeas(ideasList);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = (idea: IdeaSuggestion) => {
    setPredictMode('idea');
    setPredictPlatform(idea.platform);
    setPredictContentType(idea.contentType);
    setPrefilledIdea(idea.title);
    setCurrentView('predict');
  };

  const handleChipClick = (chip: string) => {
    setTopic(chip);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 max-w-4xl mx-auto"
    >
      {/* Input Section — with gradient border */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="gradient-border rounded-xl">
          <Card className="glass relative z-0">
            <CardContent className="p-4 sm:p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-viralyze-muted text-sm">Topic</Label>
                <div className="focus-glow-wine rounded-md transition-all">
                  <Textarea
                    placeholder="e.g., Productivity tips for remote workers, AI tools for creators, fitness myths debunked..."
                    rows={3}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-white/[0.05] border-white/[0.08] text-viralyze-white placeholder:text-viralyze-muted/40 focus-visible:ring-wine-accent focus-visible:border-wine-accent/50 resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-viralyze-muted text-sm">Platform</Label>
                <PlatformSelector value={predictPlatform} onChange={setPredictPlatform} />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-viralyze-muted text-sm">Target Audience</Label>
                <Input
                  placeholder="e.g., young professionals, content creators, fitness enthusiasts"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="bg-white/[0.05] border-white/[0.08] text-viralyze-white placeholder:text-viralyze-muted/40 focus-visible:ring-wine-accent hover:border-white/[0.12] transition-colors"
                />
              </div>

              {/* Generate button with pulse effect when topic has text */}
              <div className="relative">
                <AnimatePresence>
                  {hasTopic && !loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 rounded-lg pointer-events-none"
                      style={{
                        boxShadow: '0 0 20px rgba(184, 50, 90, 0.3), 0 0 40px rgba(127, 29, 58, 0.15)',
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-lg border-2 border-wine-accent/40"
                        animate={{
                          opacity: [0.4, 0.8, 0.4],
                          scale: [1, 1.02, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-gradient-wine hover:opacity-90 text-white font-medium h-11 w-full btn-shine relative z-10"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lightbulb className="mr-2 h-4 w-4" />
                  )}
                  {loading ? 'Generating ideas...' : 'Generate Ideas'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Loading — shimmer skeleton grid */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShimmerCard key={i} />
          ))}
        </div>
      )}

      {/* Enhanced Empty State */}
      <AnimatePresence>
        {!loading && ideas.length === 0 && !topic && (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass">
              <CardContent className="p-10 sm:p-14 flex flex-col items-center gap-5 text-center">
                {/* Floating lightbulb with wine tint */}
                <motion.div
                  className="relative"
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full bg-wine-accent/20 blur-xl"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.2,
                    }}
                  />
                  <Lightbulb className="h-14 w-14 text-wine-accent/70 relative z-10" />
                </motion.div>

                <div className="flex flex-col gap-1.5">
                  <p className="text-viralyze-white text-lg font-semibold">
                    What should go viral next?
                  </p>
                  <p className="text-viralyze-muted text-sm max-w-xs">
                    Enter a topic above or try one of these trending categories
                  </p>
                </div>

                {/* Suggestion chips */}
                <div className="flex flex-wrap justify-center gap-2 mt-1">
                  {suggestionChips.map((chip) => (
                    <motion.button
                      key={chip}
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleChipClick(chip)}
                      className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm text-viralyze-muted hover:text-viralyze-white hover:border-wine-accent/40 hover:bg-wine-accent/10 transition-all duration-200"
                    >
                      {chip}
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results — single column on mobile, 2 cols on sm+ */}
      {!loading && ideas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ideas.map((idea, i) => {
            const PIcon = platformIcons[idea.platform];
            const viralLevel = getViralLevel(idea.viralScore);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.05,
                }}
              >
                <Card className="glass group hover:bg-white/[0.03] hover:glow-wine-sm transition-all duration-300">
                  <CardContent className="p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-viralyze-white text-sm leading-snug flex-1">
                        {idea.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs shrink-0',
                          idea.viralScore >= 70
                            ? 'border-emerald-500/30 text-emerald-400'
                            : idea.viralScore >= 50
                            ? 'border-amber-500/30 text-amber-400'
                            : 'border-red-500/30 text-red-400'
                        )}
                      >
                        {idea.viralScore}
                      </Badge>
                    </div>
                    <p className="text-sm text-viralyze-muted leading-relaxed line-clamp-3">
                      {idea.description}
                    </p>

                    {/* Engagement indicators */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Fire + viral potential badge */}
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border',
                        viralLevel.color
                      )}>
                        <span>{viralLevel.emoji}</span>
                        {viralLevel.label}
                      </span>
                      {/* Platform suggestion badge */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.04] border border-white/[0.08] text-viralyze-muted">
                        <PIcon className="h-2.5 w-2.5" />
                        <span className="capitalize">{idea.platform}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-viralyze-muted">
                        <span className="capitalize">{idea.contentType}</span>
                      </div>
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-gradient-wine hover:opacity-90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleAnalyze(idea)}
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Analyze
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
