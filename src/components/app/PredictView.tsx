'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Check, Timer } from 'lucide-react';
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
import { toast } from 'sonner';

const contentTypes: { value: ContentType; label: string }[] = [
  { value: 'reel', label: 'Reel' },
  { value: 'video', label: 'Video' },
  { value: 'short', label: 'Short' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'post', label: 'Post' },
  { value: 'thread', label: 'Thread' },
  { value: 'article', label: 'Article' },
  { value: 'story', label: 'Story' },
];

const loadingSteps = [
  'Extracting features...',
  'Analyzing hook strength...',
  'Evaluating engagement potential...',
  'Generating recommendations...',
  'Complete',
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
    prefilledIdea,
    setPrefilledIdea,
  } = useAppStore();

  const [ideaText, setIdeaText] = useState('');

  useEffect(() => {
    if (prefilledIdea) {
      setIdeaText(prefilledIdea);
      setPrefilledIdea('');
      toast.success('Idea pre-filled from Ideas page');
    }
  }, [prefilledIdea, setPrefilledIdea]);
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
        if (prev < loadingSteps.length - 1) return prev + 1;
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
      setLoadingStep(loadingSteps.length - 1);

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Analysis failed');
        return;
      }

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
      {/* Mode Tabs */}
      <Tabs
        value={predictMode}
        onValueChange={(v) => setPredictMode(v as 'idea' | 'post')}
      >
        <TabsList className="bg-white/[0.05] border border-white/[0.08]">
          <TabsTrigger
            value="idea"
            className="data-[state=active]:bg-wine-accent/20 data-[state=active]:text-wine-accent"
          >
            New Idea
          </TabsTrigger>
          <TabsTrigger
            value="post"
            className="data-[state=active]:bg-wine-accent/20 data-[state=active]:text-wine-accent"
          >
            Existing Content
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Form with gradient border */}
      <div className="gradient-border rounded-xl">
        <Card className="glass rounded-xl relative z-0">
          <CardContent className="p-6 flex flex-col gap-5">
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
                className="bg-white/[0.05] border-white/[0.08] text-viralyze-white placeholder:text-viralyze-muted/40 focus-visible:ring-wine-accent resize-none rounded-lg"
              />
              <motion.div
                className="flex items-center justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: charCount > 0 ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-[10px] tabular-nums text-viralyze-muted/30">{charCount}</span>
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

            {/* Content Type */}
            <div className="flex flex-col gap-2">
              <Label className="text-viralyze-muted text-sm">Content Type</Label>
              <Select
                value={predictContentType}
                onValueChange={(v) => setPredictContentType(v as ContentType)}
              >
                <SelectTrigger className="bg-white/[0.05] border-white/[0.08] text-viralyze-white hover:border-wine-accent/30 hover:shadow-[0_0_12px_rgba(127,29,58,0.15)] transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-viralyze-soft-black border-white/[0.08]">
                  {contentTypes.map((ct) => (
                    <SelectItem
                      key={ct.value}
                      value={ct.value}
                      className="text-viralyze-white focus:bg-wine-accent/20 focus:text-wine-accent"
                    >
                      {ct.label}
                    </SelectItem>
                  ))}
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
                className="bg-white/[0.05] border-white/[0.08] text-viralyze-white placeholder:text-viralyze-muted/40 focus-visible:ring-wine-accent"
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
                className="bg-white/[0.05] border-white/[0.08] text-viralyze-white placeholder:text-viralyze-muted/40 focus-visible:ring-wine-accent"
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
                className="bg-white/[0.05] border-white/[0.08] text-viralyze-white placeholder:text-viralyze-muted/40 focus-visible:ring-wine-accent"
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

            {/* Loading Steps */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-2 mt-2">
                    {loadingSteps.map((step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: i <= loadingStep ? 1 : 0.3, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-2 text-sm"
                      >
                        {i < loadingStep ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : i === loadingStep ? (
                          <Loader2 className="h-4 w-4 text-wine-accent animate-spin" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-white/10" />
                        )}
                        <span
                          className={
                            i <= loadingStep
                              ? 'text-viralyze-white'
                              : 'text-viralyze-muted'
                          }
                        >
                          {step}
                        </span>
                      </motion.div>
                    ))}
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
