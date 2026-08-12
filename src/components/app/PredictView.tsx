'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Check, Timer, Film, Image, FileText, Play, Video, BookOpen, LayoutGrid, MessageSquare, Camera } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import PlatformSelector from '@/components/shared/PlatformSelector';
import type { ContentType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const contentTypes: { value: ContentType; label: string; icon: React.ElementType }[] = [
  { value: 'reel', label: 'Reel', icon: Film },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'short', label: 'Short', icon: Play },
  { value: 'carousel', label: 'Carousel', icon: LayoutGrid },
  { value: 'post', label: 'Post', icon: Image },
  { value: 'thread', label: 'Thread', icon: MessageSquare },
  { value: 'article', label: 'Article', icon: FileText },
  { value: 'story', label: 'Story', icon: Camera },
];

const enhancedLoadingSteps = [
  'Analyzing Content...',
  'Scoring Dimensions...',
  'Generating Recommendations...',
];

export default function PredictView() {
  const {
    predictMode,
    setPredictMode,
    predictPlatform,
    setPredictPlatform,
    predictContentType,
    setPredictContentType,
    setAnalysisLoading,
    setCurrentAnalysis,
    setCurrentView,
    user,
    updateUser,
    prefilledIdea,
    setPrefilledIdea,
    addSavedAnalysis,
    savedAnalyses,
  } = useAppStore();

  const [ideaText, setIdeaText] = useState('');

  useEffect(() => {
  if (!prefilledIdea) return;

  const timeoutId = window.setTimeout(() => {
    setIdeaText(prefilledIdea);
    setPrefilledIdea('');
    toast.success('Idea pre-filled from Ideas page');
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [prefilledIdea, setIdeaText, setPrefilledIdea]);
  const [contentText, setContentText] = useState('');
  const [audience, setAudience] = useState('');
  const [title, setTitle] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const isIdea = predictMode === 'idea';
  const mainText = isIdea ? ideaText : contentText;
  const setMainText = isIdea ? setIdeaText : setContentText;
  const textareaRows = isIdea ? 4 : 6;

  const recentPredictions = savedAnalyses.slice(0, 3);

  const charCountColor = charCount >= 500
    ? 'text-viralyze-danger'
    : charCount >= 200
      ? 'text-viralyze-warning'
      : 'text-viralyze-muted/30';

  const handleRecentClick = (analysis: typeof savedAnalyses[0]) => {
    setCurrentAnalysis({
      overallScore: analysis.overallScore,
      confidence: analysis.confidence,
      classification: analysis.classification,
      scores: analysis.scores || { hook: 0, engagement: 0, shareability: 0, retention: 0, originality: 0, audienceFit: 0, emotionalImpact: 0, contentQuality: 0, trendAlignment: 0 },
      platformFit: analysis.platformFit || [],
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      improvements: analysis.improvements || [],
      optimizedHook: analysis.optimizedHook,
      optimizedCaption: analysis.optimizedCaption,
      optimizedTitle: analysis.optimizedTitle,
      variations: analysis.variations,
      emotionalBreakdown: analysis.emotionalBreakdown,
      predictedEngagement: analysis.predictedEngagement,
      id: analysis.id,
    });
    setCurrentView('analysis');
  };

  const handleSubmit = async () => {
    if (!mainText.trim()) {
      toast.error(isIdea ? 'Please describe your content idea' : 'Please paste your content');
      return;
    }

    setLoading(true);
    setAnalysisLoading(true);
    setLoadingStep(0);

    // Animate through loading steps
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < enhancedLoadingSteps.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 1200);

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: predictMode,
          platform: predictPlatform,
          contentType: predictContentType,
          audience,
          ideaText: isIdea ? ideaText : undefined,
          contentText: !isIdea ? contentText : undefined,
          title: title || undefined,
          hashtags: hashtags || undefined,
          userId: user?.id,
        }),
      });

      clearInterval(stepInterval);
      setLoadingStep(enhancedLoadingSteps.length - 1);

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Analysis failed');
        return;
      }

      // Update usage counter if server returned updated count
      if (data.userUsage) {
        updateUser(data.userUsage);
      } else {
        // Fallback: increment locally
        updateUser({ predictionsUsed: (user?.predictionsUsed || 0) + 1 });
      }

      // Add to saved analyses for library
      addSavedAnalysis({
        id: data.id,
        title: title || (ideaText || contentText || '').slice(0, 80),
        platform: predictPlatform,
        contentType: predictContentType,
        contentText: ideaText || contentText || '',
        overallScore: data.overallScore,
        confidence: data.confidence,
        classification: data.classification,
        createdAt: new Date().toISOString(),
        scores: data.scores,
        platformFit: data.platformFit,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        improvements: data.improvements,
        optimizedHook: data.optimizedHook,
        optimizedCaption: data.optimizedCaption,
        optimizedTitle: data.optimizedTitle,
        variations: data.variations,
        emotionalBreakdown: data.emotionalBreakdown,
        predictedEngagement: data.predictedEngagement,
      });

      setCurrentAnalysis(data);
      setTimeout(() => {
        setCurrentView('analysis');
      }, 600);
    } catch {
      clearInterval(stepInterval);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
      setAnalysisLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto flex flex-col gap-6 relative"
    >
      {/* Gradient mesh background — 2 blurred circles */}
      <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-wine-accent/[0.08] blur-[100px] pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-wine/[0.1] blur-[80px] pointer-events-none" aria-hidden="true" />

      {/* Recent Predictions Pills */}
      <AnimatePresence>
        {recentPredictions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-2"
          >
            <span className="text-[11px] text-viralyze-muted/60 uppercase tracking-wider font-medium">Recent</span>
            <div className="flex gap-2 overflow-x-auto scrollbar-thin -mx-1 px-1 pb-1 sm:overflow-x-visible sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap">
              {recentPredictions.map((analysis) => (
                <motion.button
                  key={analysis.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleRecentClick(analysis)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-wine-accent/30 hover:bg-wine-accent/10 transition-all duration-200 text-xs text-viralyze-muted hover:text-viralyze-white max-w-[200px] shrink-0 min-h-[36px]"
                >
                  <span className={cn(
                    'h-1.5 w-1.5 rounded-full shrink-0',
                    analysis.overallScore >= 70 ? 'bg-viralyze-success' : analysis.overallScore >= 45 ? 'bg-viralyze-warning' : 'bg-viralyze-danger'
                  )} />
                  <span className="truncate">{analysis.title}</span>
                  <span className="text-viralyze-muted/40 tabular-nums shrink-0">{analysis.overallScore}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Tabs */}
      <Tabs
        value={predictMode}
        onValueChange={(v) => setPredictMode(v as 'idea' | 'post')}
      >
        <TabsList className="bg-white/[0.05] border border-white/[0.08] w-full sm:w-auto">
          <TabsTrigger
            value="idea"
            className="data-[state=active]:bg-wine-accent/20 data-[state=active]:text-wine-accent flex-1 min-h-[44px]"
          >
            New Idea
          </TabsTrigger>
          <TabsTrigger
            value="post"
            className="data-[state=active]:bg-wine-accent/20 data-[state=active]:text-wine-accent flex-1 min-h-[44px]"
          >
            Existing Content
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Form with gradient border */}
      <div className="gradient-border rounded-xl">
        <Card className="glass rounded-xl relative z-0">
          <CardContent className="p-4 sm:p-6 flex flex-col gap-5">
            {/* Main textarea with focus glow and typing indicator */}
            <div className="flex flex-col gap-2 focus-glow-wine rounded-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <Label className="text-viralyze-muted text-sm">
                  {isIdea ? 'Describe your content idea' : 'Paste your content/caption'}
                </Label>
                <motion.div
                  className="flex items-center gap-1.5 text-viralyze-muted/40"
                  animate={{ opacity: mainText.length > 0 ? 0 : [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Timer className="h-3 w-3" />
                  <span className="text-[10px] tracking-wide">typing...</span>
                </motion.div>
              </div>
              <Textarea
                placeholder={
                  isIdea
                    ? 'e.g., A day-in-the-life video of a startup founder, showing the real struggles of building a company...'
                    : 'Paste your full caption, script, or post content here...'
                }
                rows={textareaRows}
                value={mainText}
                onChange={(e) => { setMainText(e.target.value); setCharCount(e.target.value.length); }}
                className="bg-white/[0.05] border-white/[0.08] text-viralyze-white placeholder:text-viralyze-muted/40 focus-visible:ring-wine-accent resize-none rounded-lg min-h-[120px]"
              />
              <motion.div
                className="flex items-center justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: charCount > 0 ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.span
                  key={charCountColor}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className={cn('text-[10px] tabular-nums', charCountColor)}
                >
                  {charCount}
                </motion.span>
              </motion.div>
            </div>

            {/* Platform — with scale micro-animation on click */}
            <div className="flex flex-col gap-2">
              <Label className="text-viralyze-muted text-sm">Platform</Label>
              <div className="[&>div>button]:active:scale-95 [&>div>button]:transition-transform [&>div>button]:duration-100">
                <PlatformSelector
                  value={predictPlatform}
                  onChange={setPredictPlatform}
                />
              </div>
            </div>

            {/* Content Type with icons */}
            <div className="flex flex-col gap-2">
              <Label className="text-viralyze-muted text-sm">Content Type</Label>
              <Select
                value={predictContentType}
                onValueChange={(v) => setPredictContentType(v as ContentType)}
              >
                <SelectTrigger className="w-full bg-white/[0.05] border-white/[0.08] text-viralyze-white hover:border-wine-accent/30 hover:shadow-[0_0_12px_rgba(127,29,58,0.15)] transition-all duration-200 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-viralyze-soft-black border-white/[0.08]">
                  {contentTypes.map((ct) => {
                    const Icon = ct.icon;
                    return (
                      <SelectItem
                        key={ct.value}
                        value={ct.value}
                        className="text-viralyze-white focus:bg-wine-accent/20 focus:text-wine-accent"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 text-viralyze-muted" />
                          {ct.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Target Audience */}
            <div className="flex flex-col gap-2">
              <Label className="text-viralyze-muted text-sm">Target Audience</Label>
              <Input
                placeholder="e.g., young entrepreneurs, 18-30, interested in tech"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="bg-white/[0.05] border-white/[0.08] text-viralyze-white placeholder:text-viralyze-muted/40 focus-visible:ring-wine-accent h-11"
              />
            </div>

            {/* Title (optional for idea, required for post) */}
            <div className="flex flex-col gap-2">
              <Label className="text-viralyze-muted text-sm">
                Title {isIdea ? '(optional)' : ''}
              </Label>
              <Input
                placeholder="Give your content a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/[0.05] border-white/[0.08] text-viralyze-white placeholder:text-viralyze-muted/40 focus-visible:ring-wine-accent h-11"
              />
            </div>

            {/* Hashtags (optional for idea) */}
            <div className="flex flex-col gap-2">
              <Label className="text-viralyze-muted text-sm">
                Hashtags {isIdea ? '(optional)' : ''}
              </Label>
              <Input
                placeholder="#viral #startup #content..."
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="bg-white/[0.05] border-white/[0.08] text-viralyze-white placeholder:text-viralyze-muted/40 focus-visible:ring-wine-accent h-11"
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-wine hover:opacity-90 text-white font-semibold h-12 w-full text-base mt-2 btn-shine"
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              {loading ? 'Analyzing your content...' : 'Analyze Content'}
            </Button>

            {/* Enhanced Loading Steps with pulsing wine ring */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="relative flex flex-col items-center gap-4 mt-4 py-4">
                    {/* Pulsing wine-accent ring */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-wine-accent/30 pointer-events-none"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-wine-accent/15 pointer-events-none"
                      animate={{
                        scale: [1.2, 1.8, 1.2],
                        opacity: [0.15, 0.3, 0.15],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.3,
                      }}
                    />

                    {/* 3-step progress indicator — stacks vertically on mobile */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-3 relative z-10">
                      {enhancedLoadingSteps.map((step, i) => (
                        <motion.div
                          key={step}
                          className="flex flex-col items-center gap-1.5"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.15 }}
                        >
                          {/* Step circle */}
                          <motion.div
                            className={cn(
                              'flex items-center justify-center h-8 w-8 rounded-full border transition-colors duration-300',
                              i < loadingStep
                                ? 'bg-wine-accent border-wine-accent'
                                : i === loadingStep
                                  ? 'border-wine-accent/60 bg-wine-accent/10'
                                  : 'border-white/10 bg-white/[0.03]'
                            )}
                            animate={i === loadingStep ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            {i < loadingStep ? (
                              <Check className="h-4 w-4 text-white" />
                            ) : i === loadingStep ? (
                              <Loader2 className="h-4 w-4 text-wine-accent animate-spin" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-white/20" />
                            )}
                          </motion.div>
                          {/* Step label */}
                          <motion.span
                            className={cn(
                              'text-[10px] text-center leading-tight max-w-[80px]',
                              i <= loadingStep ? 'text-viralyze-white' : 'text-viralyze-muted/50'
                            )}
                          >
                            {step}
                          </motion.span>
                          {/* Connector line between steps — hidden on mobile, shown on sm+ */}
                          {i < enhancedLoadingSteps.length - 1 && (
                            <motion.div
                              className="hidden sm:block absolute top-4 left-[calc(50%+20px)] h-[2px] w-[calc(100%-40px)] -translate-x-1/2 rounded-full"
                              style={{
                                background: i < loadingStep
                                  ? 'linear-gradient(90deg, #B8325A, rgba(184,50,90,0.3))'
                                  : 'rgba(255,255,255,0.06)',
                              }}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ delay: i * 0.2 + 0.3, duration: 0.4 }}
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
