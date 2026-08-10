'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Loader2, Sparkles, Inbox, Instagram, Youtube, Tv, Twitter, Linkedin } from 'lucide-react';
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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

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
    setPrefilledIdea(idea.title + '. ' + idea.description);
    toast.success('Idea loaded — customize and analyze!');
    setCurrentView('predict');
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 max-w-4xl mx-auto"
    >
      {/* Input Section — with gradient border */}
      <motion.div variants={item}>
        <div className="gradient-border rounded-xl">
          <Card className="glass relative z-0">
            <CardContent className="p-6 flex flex-col gap-4">
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

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-gradient-wine hover:opacity-90 text-white font-medium h-11 w-full btn-shine"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lightbulb className="mr-2 h-4 w-4" />
                )}
                {loading ? 'Generating ideas...' : 'Generate Ideas'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Loading — shimmer skeleton grid */}
      {loading && (
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShimmerCard key={i} />
          ))}
        </motion.div>
      )}

      {/* Results */}
      {!loading && ideas.length === 0 && !topic && (
        <motion.div variants={item}>
          <Card className="glass">
            <CardContent className="p-12 flex flex-col items-center gap-3 text-center">
              <Lightbulb className="h-10 w-10 text-viralyze-muted/40" />
              <p className="text-viralyze-muted text-sm">Enter a topic to generate viral content ideas</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!loading && ideas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ideas.map((idea, i) => {
            const PIcon = platformIcons[idea.platform];
            return (
              <motion.div key={i} variants={item}>
                <Card className="glass group hover:bg-white/[0.03] hover:glow-wine-sm transition-all duration-300">
                  <CardContent className="p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-viralyze-white text-sm leading-snug">
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
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-viralyze-muted">
                        <PIcon className="h-3.5 w-3.5" />
                        <span className="capitalize">{idea.platform}</span>
                        <span className="mx-1">·</span>
                        <span>{idea.contentType}</span>
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
