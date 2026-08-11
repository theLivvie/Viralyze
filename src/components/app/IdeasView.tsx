'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Loader2, Sparkles, Instagram, Youtube, Tv, Twitter, Linkedin, RefreshCw, BookmarkPlus, Sun, Cloud, Moon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import PlatformSelector from '@/components/shared/PlatformSelector';
import type { Platform, IdeaSuggestion, SavedAnalysis } from '@/lib/types';
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

function getPlatformMatchScore(ideaPlatform: Platform, selectedPlatform: Platform): number {
  if (ideaPlatform === selectedPlatform) return 100;
  const related: Record<Platform, Platform[]> = {
    instagram: ['tiktok', 'youtube'],
    youtube: ['tiktok', 'instagram'],
    tiktok: ['instagram', 'youtube'],
    x: ['linkedin'],
    linkedin: ['x'],
  };
  const rel = related[selectedPlatform] || [];
  const idx = rel.indexOf(ideaPlatform);
  if (idx === 0) return 75;
  if (idx === 1) return 55;
  return 30;
}

function getBestPostingTime(platform: Platform): { label: string; icon: React.ElementType; time: string } {
  const times: Record<Platform, { label: string; icon: React.ElementType; time: string }> = {
    instagram: { label: 'Morning', icon: Sun, time: '9–11 AM' },
    youtube: { label: 'Afternoon', icon: Cloud, time: '2–4 PM' },
    tiktok: { label: 'Evening', icon: Moon, time: '7–10 PM' },
    x: { label: 'Morning', icon: Sun, time: '8–10 AM' },
    linkedin: { label: 'Afternoon', icon: Cloud, time: '10–12 PM' },
  };
  return times[platform];
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
  const { predictPlatform, setPredictPlatform, setPredictContentType, setPredictMode, setCurrentView, setAnalysisLoading, setPrefilledIdea, savedAnalyses, addSavedAnalysis, user } = useAppStore();

  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<IdeaSuggestion[]>([]);
  const [regenerating, setRegenerating] = useState(false);

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

  const handleRegenerate = async () => {
    if (!topic.trim()) return;
    setRegenerating(true);
    await handleGenerate();
    setRegenerating(false);
  };

  const handleSaveToLibrary = (idea: IdeaSuggestion) => {
    const newAnalysis: SavedAnalysis = {
      id: `lib-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: idea.title,
      platform: idea.platform,
      contentType: idea.contentType,
      contentText: idea.description,
      ideaText: idea.title,
      overallScore: idea.viralScore,
      confidence: 'medium',
      classification: idea.viralScore >= 85 ? 'viral' : idea.viralScore >= 70 ? 'high' : idea.viralScore >= 45 ? 'moderate' : 'low',
      createdAt: new Date().toISOString(),
    };
    addSavedAnalysis(newAnalysis);
    toast.success('Saved to library!');
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
                  aria-busy={loading}
                  className="bg-gradient-wine hover:opacity-90 text-white font-medium h-11 w-full btn-shine relative z-10"
                  aria-label={loading ? 'Generating ideas, please wait' : 'Generate content ideas'}
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
                      className="min-h-[44px] px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm text-viralyze-muted hover:text-viralyze-white hover:border-wine-accent/40 hover:bg-wine-accent/10 transition-all duration-200"
                      aria-label={`Use topic suggestion: ${chip}`}
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
        <>
        <div aria-live="polite" aria-atomic="true" className="sr-only">{ideas.length} ideas generated</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ideas.map((idea, i) => {
            const PIcon = platformIcons[idea.platform];
            const viralLevel = getViralLevel(idea.viralScore);
            const platformMatch = getPlatformMatchScore(idea.platform, predictPlatform);
            const bestTime = getBestPostingTime(idea.platform);
            const BestTimeIcon = bestTime.icon;
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
                <Card className="glass group hover:bg-white/[0.03] hover:glow-wine-sm transition-all duration-300"
                  role="article"
                  aria-label={`Idea: ${idea.title}, viral score ${idea.viralScore}, ${idea.platform} ${idea.contentType}`}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAnalyze(idea); }}
                >
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
                      {/* Platform Match score */}
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border',
                        platformMatch >= 80
                          ? 'bg-green-500/10 border-green-500/20 text-green-400'
                          : platformMatch >= 50
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          : 'bg-white/[0.04] border-white/[0.08] text-viralyze-muted'
                      )}>
                        Platform Match: {platformMatch}%
                      </span>
                    </div>

                    {/* Best posting time */}
                    <div className="flex items-center gap-1.5 text-[10px] text-viralyze-muted">
                      <BestTimeIcon className="h-3 w-3 text-wine-accent/60" />
                      <span>Best time: {bestTime.label} ({bestTime.time})</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-viralyze-muted">
                        <span className="capitalize">{idea.contentType}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="min-h-[44px] text-xs text-viralyze-muted hover:text-wine-accent hover:bg-wine-accent/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleSaveToLibrary(idea)}
                          aria-label={`Save idea: ${idea.title}`}
                        >
                          <BookmarkPlus className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          className="min-h-[44px] text-xs bg-gradient-wine hover:opacity-90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleAnalyze(idea)}
                          aria-label={`Analyze idea: ${idea.title}`}
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          Analyze
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
        {/* Regenerate button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={regenerating || !topic.trim()}
            className="min-h-[44px] border-white/[0.1] text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.05] gap-2"
            aria-label={regenerating ? 'Regenerating ideas, please wait' : 'Regenerate ideas'}
            aria-busy={regenerating}
          >
            <motion.span
              animate={regenerating ? { rotate: 360 } : { rotate: 0 }}
              transition={regenerating ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </motion.span>
            {regenerating ? 'Regenerating...' : 'Regenerate Ideas'}
          </Button>
        </div>
        </>
      )}
    </motion.div>
  );
}
