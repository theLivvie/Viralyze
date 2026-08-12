'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Copy,
  Check,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  BookmarkIcon,
  Zap,
  Target,
  Sparkles,
  CheckCircle2,
  Download,
  RefreshCw,
  ClipboardCopy,
  Plus,
  FileText,
  LayoutGrid,
  GitCompareArrows,
  Trophy,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  X,
  Minus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppStore } from '@/lib/store';
import ScoreRing from '@/components/shared/ScoreRing';
import ScoreBar from '@/components/shared/ScoreBar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const platformIcons: Record<string, string> = {
  instagram: '📸',
  youtube: '▶️',
  tiktok: '🎵',
  x: '✖️',
  linkedin: '💼',
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AnalysisView() {
  const { currentAnalysis, setCurrentView, setPrefilledIdea, setPredictMode, savedAnalyses } = useAppStore();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareTo, setCompareTo] = useState<string | null>(null);

  // Other saved analyses with scores (exclude current) for Compare with Past
  const otherAnalyses = savedAnalyses.filter(
    (a) => a.id !== currentAnalysis?.id && a.scores && Object.keys(a.scores).length > 0
  );
  const canCompare = savedAnalyses.length >= 2;
  const selectedPastAnalysis = compareTo ? savedAnalyses.find((a) => a.id === compareTo) : null;

  if (!currentAnalysis) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-white/[0.05] flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-viralyze-muted" />
        </div>
        <p className="text-viralyze-muted text-lg">No analysis to display</p>
        <Button
          variant="outline"
          onClick={() => setCurrentView('predict')}
          className="border-wine-accent/30 text-wine-accent hover:bg-wine-accent/10"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Analyze Content
        </Button>
      </motion.div>
    );
  }

  const {
    overallScore,
    confidence,
    classification,
    scores,
    platformFit,
    strengths = [],
    weaknesses = [],
    improvements = [],
    optimizedHook,
    optimizedCaption,
    optimizedTitle,
    variations = [],
    emotionalBreakdown,
    predictedEngagement,
  } = currentAnalysis;

  // Find original content from saved analyses
  const savedItem = savedAnalyses.find((a) => a.id === currentAnalysis.id);
  const originalContent = savedItem?.contentText || savedItem?.ideaText || '';

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShare = async () => {
    const text = `My content scored ${overallScore}/100 on Viralyze! ${classification === 'viral' ? '🔥' : classification === 'high' ? '✨' : '📊'}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Summary copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleReanalyze = async () => {
    if (currentAnalysis?.id) {
      try {
        const res = await fetch(`/api/library?id=${currentAnalysis.id}`);
        if (res.ok) {
          const data = await res.json();
          const content = data.contentText || data.ideaText || '';
          if (content) {
            setPrefilledIdea(content);
            setCurrentView('predict');
            toast.success('Content loaded for re-analysis');
            return;
          }
        }
      } catch {
        // fall through to default behavior
      }
    }
    setCurrentView('predict');
    toast.success('Navigate to predict to start a new analysis');
  };

  const handleCopyAll = async () => {
    const parts = [optimizedTitle, optimizedHook, optimizedCaption].filter(Boolean);
    if (parts.length === 0) {
      toast.error('No optimized content to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(parts.join('\n\n'));
      toast.success('All optimized content copied!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleExport = () => {
    const report = {
      'Viralyze Analysis Report': '',
      'Overall Score': `${overallScore}/100`,
      'Classification': classification,
      'Confidence': confidence,
      'Category Scores': scores,
      'Platform Fit': platformFit,
      'Strengths': strengths,
      'Weaknesses': weaknesses,
      'Improvements': improvements,
      'Optimized Title': optimizedTitle || 'N/A',
      'Optimized Hook': optimizedHook || 'N/A',
      'Optimized Caption': optimizedCaption || 'N/A',
      'Variations': variations.map((v) => ({ label: v.label, score: v.score, content: v.content })),
      'Predicted Engagement': predictedEngagement,
      'Emotional Breakdown': emotionalBreakdown,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viralyze-analysis-${overallScore}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Analysis exported!');
  };

  const categoryLabels: Record<string, string> = {
    hook: 'Hook Strength',
    engagement: 'Engagement Potential',
    shareability: 'Shareability',
    retention: 'Content Retention',
    originality: 'Originality',
    audienceFit: 'Audience Fit',
    emotionalImpact: 'Emotional Impact',
    contentQuality: 'Content Quality',
    trendAlignment: 'Trend Alignment',
  };

  const scoreEntries = scores
    ? Object.entries(scores).filter(([, v]) => typeof v === 'number')
    : [];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 max-w-4xl mx-auto relative"
    >
      {/* Floating Action Button — New Analysis */}
      <motion.button
        onClick={() => setCurrentView('predict')}
        title="New Analysis"
        aria-label="Start new analysis"
        className="fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full bg-gradient-wine btn-shine flex items-center justify-center text-white shadow-lg glow-wine-sm hover:scale-110 transition-transform duration-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      {/* Top bar: Back + Actions */}
      <motion.div variants={item} className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentView('predict')}
          className="min-h-[44px] text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.05]"
          aria-label="Go back to new analysis"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          New Analysis
        </Button>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-green-400/80">
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">Saved</span>
          </div>
          {/* Button group: Export + Share */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="border-white/[0.1] text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.05] rounded-r-none border-r-0 min-h-[44px]"
              aria-label="Export analysis report"
            >
              <Download className="mr-2 h-3.5 w-3.5" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-white/[0.1] text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.05] rounded-none min-h-[44px]"
              aria-label="Share analysis summary"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
          </div>
          {canCompare && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'border-white/[0.1] text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.05] gap-1.5 min-h-[44px]',
                    compareTo && 'border-wine-accent/40 text-wine-accent bg-wine-accent/10'
                  )}
                  aria-label="Compare with past analysis"
                  aria-expanded={!!compareTo}
                >
                  <GitCompareArrows className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Compare</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 bg-viralyze-soft-black border-white/[0.08] p-2" align="end" role="dialog" aria-label="Compare with past analysis">
                <div className="flex items-center gap-2 px-2 pb-2 border-b border-white/[0.06]">
                  <GitCompareArrows className="h-3.5 w-3.5 text-wine-accent" />
                  <span className="text-xs font-medium text-viralyze-white">Compare with Past Analysis</span>
                </div>
                <div className="max-h-64 overflow-y-auto scrollbar-thin mt-1">
                  {compareTo && (
                    <button
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.04] transition-colors mb-1 min-h-[44px]"
                      onClick={() => setCompareTo(null)}
                      aria-label="Clear comparison selection"
                    >
                      <X className="h-3 w-3" />
                      Clear comparison
                    </button>
                  )}
                  {otherAnalyses.length === 0 ? (
                    <p className="text-xs text-viralyze-muted/60 px-2 py-3 text-center">No other analyses with scores</p>
                  ) : (
                    otherAnalyses.map((a) => {
                      const PI = platformIcons[a.platform];
                      return (
                        <button
                          key={a.id}
                          className={cn(
                            'w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors min-h-[44px]',
                            compareTo === a.id
                              ? 'bg-wine-accent/10 border border-wine-accent/30'
                              : 'hover:bg-white/[0.04] border border-transparent'
                          )}
                          onClick={() => setCompareTo(compareTo === a.id ? null : a.id)}
                          aria-label={`Compare with ${a.title || 'Untitled'}, score ${a.overallScore}`}
                          aria-pressed={compareTo === a.id}
                        >
                          <span className="text-sm">{PI}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-viralyze-white truncate">{a.title || 'Untitled'}</p>
                            <p className="text-[10px] text-viralyze-muted">
                              {new Date(a.createdAt).toLocaleDateString()} &middot; {a.overallScore}/100
                            </p>
                          </div>
                          {compareTo === a.id && <Check className="h-3.5 w-3.5 text-wine-accent shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReanalyze}
            className="border-white/[0.1] text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.05] min-h-[44px]"
            aria-label="Re-analyze content"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Re-analyze
          </Button>
        </div>
      </motion.div>

      {/* Content Preview Card (original content) */}
      {originalContent && (
        <motion.div variants={item}>
          <Card className="glass overflow-hidden relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium text-viralyze-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-wine-accent" />
                  Original Content
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-h-[44px] px-2.5 text-viralyze-muted hover:text-viralyze-white gap-1.5"
                  onClick={() => copyToClipboard(originalContent, 'original')}
                  aria-label="Copy original content"
                >
                  {copiedField === 'original' ? (
                    <Check className="h-3.5 w-3.5 text-green-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-viralyze-white/80 leading-relaxed bg-white/[0.02] rounded-lg p-4 border border-white/[0.06] max-h-40 overflow-y-auto scrollbar-thin whitespace-pre-wrap">
                {originalContent}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Score Header */}
      <motion.div variants={item}>
        <Card className="glass overflow-hidden relative">
          <div className="scan-line-animated" />
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Score Ring with floating dots + tooltip on segments */}
              <div className="relative flex-shrink-0 animate-pulse-glow" style={{ animationDuration: '3s', borderRadius: '50%' }} aria-live="polite" aria-atomic="true">
                <div className="absolute -top-3 -left-3 w-2 h-2 rounded-full bg-wine-accent animate-pulse" aria-hidden="true" />
                <div className="absolute -bottom-2 -right-2 w-1.5 h-1.5 rounded-full bg-wine-accent/60 animate-pulse [animation-delay:0.5s]" aria-hidden="true" />
                <div className="absolute top-1/2 -right-4 w-1 h-1 rounded-full bg-wine-accent/40 animate-pulse [animation-delay:1s]" aria-hidden="true" />
                <div title={scoreEntries.map(([k, v]) => `${categoryLabels[k] || k}: ${v}`).join(' · ')}>
                  <ScoreRing
                    score={overallScore}
                    size={160}
                    classification={classification}
                    confidence={confidence}
                  />
                </div>
                {/* Category score tooltips around the ring */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[260px]">
                  <p className="text-[10px] text-viralyze-muted/50 text-center leading-relaxed">
                    {scoreEntries.slice(0, 3).map(([k, v]) => `${categoryLabels[k] || k}: ${v}`).join(' · ')}
                  </p>
                </div>
              </div>

              {/* Right side info */}
              <div className="flex-1 flex flex-col gap-4 w-full">
                <div>
                  <h2 className="text-xl font-semibold text-viralyze-white mb-1">
                    Viral Potential Analysis
                  </h2>
                  <p className="text-viralyze-muted text-sm">
                    AI-powered analysis with <span className="text-wine-accent font-medium">{confidence}</span> confidence
                  </p>
                </div>

                {/* Predicted Engagement */}
                {predictedEngagement && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {[
                      { icon: Heart, label: 'Likes', value: predictedEngagement.likes, color: 'text-red-400' },
                      { icon: MessageCircle, label: 'Comments', value: predictedEngagement.comments, color: 'text-blue-400' },
                      { icon: Share2, label: 'Shares', value: predictedEngagement.shares, color: 'text-green-400' },
                      { icon: BookmarkIcon, label: 'Saves', value: predictedEngagement.saves, color: 'text-amber-400' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="glass rounded-lg p-3 flex flex-col items-center gap-1 hover:glow-wine-sm transition-all duration-300"
                      >
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        <span className="text-lg font-bold text-viralyze-white tabular-nums">
                          {stat.value}
                        </span>
                        <span className="text-xs text-viralyze-muted">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Emotional Breakdown */}
                {emotionalBreakdown && Object.keys(emotionalBreakdown).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-viralyze-muted mb-2">Emotional Breakdown</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(emotionalBreakdown)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .slice(0, 6)
                        .map(([emotion, pct]) => (
                          <span
                            key={emotion}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.05] border border-white/[0.08] text-viralyze-white hover:border-wine-accent/30 transition-colors"
                            title={`${emotion}: ${pct}%`}
                          >
                            {emotion}
                            <span className="text-wine-accent font-bold tabular-nums">{pct}%</span>
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Compare with Past Analysis Panel */}
      <AnimatePresence>
        {selectedPastAnalysis && selectedPastAnalysis.scores && (
          <motion.div
            key={selectedPastAnalysis.id}
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <Card className="glass glow-wine-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium text-viralyze-white flex items-center gap-2">
                    <GitCompareArrows className="h-4 w-4 text-wine-accent" />
                    Score Comparison
                  </CardTitle>
                  <button
                    className="text-viralyze-muted hover:text-viralyze-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    onClick={() => setCompareTo(null)}
                    aria-label="Close score comparison"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-viralyze-muted mt-1">
                  Comparing with <span className="text-viralyze-white font-medium">{selectedPastAnalysis.title || 'Untitled'}</span>
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 overflow-x-auto">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-viralyze-muted">Current</span>
                      <span className="text-sm font-bold tabular-nums text-wine-accent">{overallScore}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${overallScore}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-full',
                          overallScore >= selectedPastAnalysis.overallScore ? 'bg-wine-accent' : 'bg-white/30'
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center shrink-0">
                    {(() => {
                      const diff = overallScore - selectedPastAnalysis.overallScore;
                      return (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className={cn(
                            'text-sm font-bold tabular-nums flex items-center gap-0.5',
                            diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-viralyze-muted'
                          )}
                        >
                          {diff > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : diff < 0 ? <AlertTriangle className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                          {diff > 0 ? `+${diff}` : diff === 0 ? '0' : `${diff}`}
                        </motion.span>
                      );
                    })()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-viralyze-muted">Past</span>
                      <span className="text-sm font-bold tabular-nums text-viralyze-muted">{selectedPastAnalysis.overallScore}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedPastAnalysis.overallScore}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-full',
                          selectedPastAnalysis.overallScore > overallScore ? 'bg-wine-accent' : 'bg-white/30'
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Dimension-by-dimension comparison */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-viralyze-muted uppercase tracking-wider">Dimension Breakdown</span>
                  {scoreEntries.map(([key, currentVal], i) => {
                    const pastVal = selectedPastAnalysis.scores?.[key as keyof typeof selectedPastAnalysis.scores];
                    if (typeof pastVal !== 'number') return null;
                    const cVal = currentVal as number;
                    const diff = cVal - pastVal;
                    const isHigher = cVal >= pastVal;
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.3 }}
                        className="flex items-center gap-3"
                      >
                        <span className="text-xs text-viralyze-muted w-24 shrink-0 truncate" title={categoryLabels[key] || key}>
                          {categoryLabels[key] || key}
                        </span>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${cVal}%` }}
                              transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
                              className={cn('h-full rounded-full', isHigher ? 'bg-wine-accent' : 'bg-white/20')}
                            />
                          </div>
                          <span className={cn('text-xs font-bold tabular-nums w-6 text-right', isHigher ? 'text-wine-accent' : 'text-viralyze-muted/50')}>
                            {cVal}
                          </span>
                        </div>
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.06 + 0.15, type: 'spring', stiffness: 400, damping: 20 }}
                          className={cn(
                            'text-[10px] font-bold tabular-nums w-10 text-center shrink-0',
                            diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-viralyze-muted/40'
                          )}
                        >
                          {diff > 0 ? `+${diff}` : diff === 0 ? '--' : `${diff}`}
                        </motion.span>
                        <div className="flex-1 flex items-center gap-2">
                          <span className={cn('text-xs font-bold tabular-nums w-6', !isHigher ? 'text-wine-accent' : 'text-viralyze-muted/50')}>
                            {pastVal}
                          </span>
                          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pastVal}%` }}
                              transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
                              className={cn('h-full rounded-full', !isHigher ? 'bg-wine-accent' : 'bg-white/20')}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Scores with tooltips on hover */}
      {scoreEntries.length > 0 && (
        <motion.div variants={item}>
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-viralyze-white flex items-center gap-2">
                <Target className="h-4 w-4 text-wine-accent" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {scoreEntries.map(([key, value], i) => (
                <div key={key} title={`${categoryLabels[key] || key}: ${value}/100`}>
                  <ScoreBar
                    label={categoryLabels[key] || key}
                    score={value as number}
                    delay={i * 0.08}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Score Insights Panel */}
      {scoreEntries.length > 0 && (
        <motion.div variants={item}>
          <Card className="glass overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-viralyze-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-wine-accent" />
                Score Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Top 3 Strengths */}
              <div>
                <h3 className="text-sm font-medium text-green-400 flex items-center gap-1.5 mb-3">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Top 3 Strengths
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {scoreEntries
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 3)
                    .map(([key, value], i) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.35 }}
                        className="rounded-lg p-3 border border-green-500/20 bg-green-500/[0.05]"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-viralyze-muted">{categoryLabels[key] || key}</span>
                          <span className="text-sm font-bold tabular-nums text-green-400">{value as number}</span>
                        </div>
                        <p className="text-xs text-viralyze-white/60 leading-relaxed">
                          {strengths[i] || `${categoryLabels[key] || key} is a key strength of this content.`}
                        </p>
                      </motion.div>
                    ))}
                </div>
              </div>

              {/* Top 3 Improvement Areas */}
              <div>
                <h3 className="text-sm font-medium text-amber-400 flex items-center gap-1.5 mb-3">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Top 3 Improvement Areas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {scoreEntries
                    .sort(([, a], [, b]) => (a as number) - (b as number))
                    .slice(0, 3)
                    .map(([key, value], i) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.3, duration: 0.35 }}
                        className="rounded-lg p-3 border border-amber-500/20 bg-amber-500/[0.05]"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-viralyze-muted">{categoryLabels[key] || key}</span>
                          <span className="text-sm font-bold tabular-nums text-amber-400">{value as number}</span>
                        </div>
                        <p className="text-xs text-viralyze-white/60 leading-relaxed">
                          {improvements[i] || weaknesses[i] || `Consider improving ${categoryLabels[key] || key.toLowerCase()} to boost viral potential.`}
                        </p>
                      </motion.div>
                    ))}
                </div>
              </div>

              {/* Score vs Average Comparison */}
              <div>
                <h3 className="text-sm font-medium text-viralyze-white flex items-center gap-1.5 mb-3">
                  <Target className="h-3.5 w-3.5 text-wine-accent" />
                  Score vs Platform Average
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-viralyze-white">Your Score</span>
                      <span className="text-xs font-bold tabular-nums text-wine-accent">{overallScore}/100</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${overallScore}%` }}
                        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-wine-accent to-wine"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-viralyze-muted">Platform Average</span>
                      <span className="text-xs font-bold tabular-nums text-viralyze-muted">65/100</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '65%' }}
                        transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' }}
                        className="h-full rounded-full bg-white/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Platform Fit */}
      {platformFit && platformFit.length > 0 && (
        <motion.div variants={item}>
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-viralyze-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-wine-accent" />
                Platform Fit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {platformFit.map((pf, i) => (
                  <motion.div
                    key={pf.platform}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-lg p-3 flex flex-col items-center gap-2 hover:glow-wine-sm transition-all duration-300 cursor-default"
                    title={`${pf.platform}: ${pf.score}/100`}
                  >
                    <span className="text-2xl">{platformIcons[pf.platform] || '📱'}</span>
                    <span className="text-xs text-viralyze-muted capitalize">
                      {pf.platform}
                    </span>
                    <span
                      className={`text-lg font-bold tabular-nums ${
                        pf.score >= 80
                          ? 'text-green-400'
                          : pf.score >= 60
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }`}
                    >
                      {pf.score}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Strengths, Weaknesses, Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {strengths.length > 0 && (
          <motion.div variants={item}>
            <Card className="glass h-full">
              <div className="h-1 rounded-t-xl bg-gradient-to-r from-green-500 to-green-400" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-400 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {strengths.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-2 text-sm text-viralyze-white/80"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {weaknesses.length > 0 && (
          <motion.div variants={item}>
            <Card className="glass h-full">
              <div className="h-1 rounded-t-xl bg-gradient-to-r from-amber-500 to-amber-400" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-400 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {weaknesses.map((w, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-2 text-sm text-viralyze-white/80"
                  >
                    <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                    <span>{w}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {improvements.length > 0 && (
          <motion.div variants={item}>
            <Card className="glass h-full">
              <div className="h-1 rounded-t-xl bg-gradient-to-r from-wine-accent to-wine" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-wine-accent flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Improvements
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {improvements.map((imp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-2 text-sm text-viralyze-white/80"
                  >
                    <Lightbulb className="h-4 w-4 text-wine-accent mt-0.5 shrink-0" />
                    <span>{imp}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Optimized Content */}
      {(optimizedHook || optimizedCaption || optimizedTitle) && (
        <motion.div variants={item}>
          <Card className="glass overflow-hidden relative">
            <div className="glow-line w-full bg-gradient-to-r from-transparent via-wine-accent to-transparent" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium text-viralyze-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-wine-accent" />
                  AI-Optimized Content
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-h-[44px] px-2.5 text-viralyze-muted hover:text-viralyze-white gap-1.5"
                  onClick={handleCopyAll}
                  aria-label="Copy all optimized content"
                >
                  <ClipboardCopy className="h-3.5 w-3.5" />
                  Copy All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {optimizedTitle && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-viralyze-muted uppercase tracking-wider">
                      Optimized Title
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-[44px] px-2 text-viralyze-muted hover:text-viralyze-white"
                      onClick={() => copyToClipboard(optimizedTitle, 'title')}
                      aria-label="Copy optimized title"
                    >
                      {copiedField === 'title' ? (
                        <Check className="h-3 w-3 text-green-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-viralyze-white bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                    {optimizedTitle}
                  </p>
                </div>
              )}

              {optimizedHook && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-viralyze-muted uppercase tracking-wider">
                      Optimized Hook
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-[44px] px-2 text-viralyze-muted hover:text-viralyze-white"
                      onClick={() => copyToClipboard(optimizedHook, 'hook')}
                      aria-label="Copy optimized hook"
                    >
                      {copiedField === 'hook' ? (
                        <Check className="h-3 w-3 text-green-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-viralyze-white bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                    {optimizedHook}
                  </p>
                </div>
              )}

              {optimizedCaption && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-viralyze-muted uppercase tracking-wider">
                      Optimized Caption
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-[44px] px-2 text-viralyze-muted hover:text-viralyze-white"
                      onClick={() => copyToClipboard(optimizedCaption, 'caption')}
                      aria-label="Copy optimized caption"
                    >
                      {copiedField === 'caption' ? (
                        <Check className="h-3 w-3 text-green-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-viralyze-white bg-white/[0.03] rounded-lg p-3 border border-white/[0.06] whitespace-pre-wrap">
                    {optimizedCaption}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Content Variations */}
      {variations.length > 0 && (
        <motion.div variants={item}>
          <Card className="glass">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium text-viralyze-white flex items-center gap-2">
                    <Zap className="h-4 w-4 text-wine-accent" />
                    Content Variations
                  </CardTitle>
                  <p className="text-xs text-viralyze-muted mt-1">
                    Alternative versions optimized for different engagement strategies
                  </p>
                </div>
                {variations.length >= 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCompareMode(!compareMode)}
                    className={cn(
                      'border-white/[0.1] text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.05] gap-1.5 min-h-[44px]',
                      compareMode && 'border-wine-accent/40 text-wine-accent bg-wine-accent/10'
                    )}
                    aria-label={compareMode ? 'Switch to grid view' : 'Switch to compare view'}
                    aria-pressed={compareMode}
                  >
                    {compareMode ? <LayoutGrid className="h-3.5 w-3.5" /> : <GitCompareArrows className="h-3.5 w-3.5" />}
                    {compareMode ? 'Grid View' : 'Compare View'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <AnimatePresence mode="wait">
                {!compareMode ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-4"
                  >
                    {variations.map((v, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group glass-strong rounded-lg p-4 flex flex-col gap-2 hover:glow-wine-sm transition-all duration-300 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-wine-accent uppercase tracking-wider">
                              {v.label}
                            </span>
                            <span className="text-xs text-viralyze-muted px-2 py-0.5 rounded-full bg-white/[0.05]">
                              {v.style}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold tabular-nums ${
                                v.score >= 80
                                  ? 'text-green-400'
                                  : v.score >= 60
                                  ? 'text-amber-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {v.score}/100
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="min-h-[44px] px-2 text-viralyze-muted hover:text-viralyze-white"
                              onClick={() => copyToClipboard(v.content, `var-${i}`)}
                              aria-label={`Copy variation: ${v.label}`}
                            >
                              {copiedField === `var-${i}` ? (
                                <Check className="h-3 w-3 text-green-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-viralyze-white/80 leading-relaxed">
                          {v.content}
                        </p>
                        {/* Hover-reveal action */}
                        <motion.div
                          className="flex justify-end opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 mt-1"
                        >
                          <Button
                            size="sm"
                            className="min-h-[44px] px-3 bg-gradient-wine/60 hover:bg-gradient-wine text-white btn-shine text-xs gap-1.5"
                            onClick={() => {
                              setPrefilledIdea(v.content);
                              setPredictMode('idea');
                              setCurrentView('predict');
                              toast.success('Variation loaded for prediction');
                            }}
                            aria-label={`Use variation ${v.label} for prediction`}
                          >
                            <Sparkles className="h-3 w-3" />
                            Use for Prediction
                          </Button>
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="compare"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-0"
                  >
                    {/* Table header */}
                    <div className="grid grid-cols-[1fr_70px_60px_70px] sm:grid-cols-[1fr_100px_100px_100px] gap-2 sm:gap-3 px-4 py-2 border-b border-white/[0.08]">
                      <span className="text-xs font-medium text-viralyze-muted uppercase tracking-wider">Variation</span>
                      <span className="text-xs font-medium text-viralyze-muted uppercase tracking-wider text-center">Score</span>
                      <span className="text-xs font-medium text-viralyze-muted uppercase tracking-wider text-center">Diff</span>
                      <span className="text-xs font-medium text-viralyze-muted uppercase tracking-wider text-right">Action</span>
                    </div>
                    {/* Rows */}
                    {[...variations]
                      .sort((a, b) => b.score - a.score)
                      .map((v, i) => {
                        const isBest = i === 0;
                        const bestScore = variations.reduce((max, x) => Math.max(max, x.score), 0);
                        const diff = bestScore - v.score;
                        const truncated = v.content.length > 80 ? v.content.slice(0, 80) + '...' : v.content;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className={cn(
                              'grid grid-cols-[1fr_70px_60px_70px] sm:grid-cols-[1fr_100px_100px_100px] gap-2 sm:gap-3 px-4 py-3 border-b border-white/[0.04] items-center',
                              isBest && 'border border-wine-accent/30 rounded-lg bg-wine-accent/[0.05] mb-2'
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isBest && (
                                <Badge className="bg-wine-accent/20 text-wine-accent text-[10px] font-bold border-0 px-1.5 py-0 shrink-0">
                                  <Trophy className="h-3 w-3 mr-0.5" /> Best
                                </Badge>
                              )}
                              <div className="min-w-0">
                                <span className="text-xs font-medium text-wine-accent uppercase tracking-wider">{v.label}</span>
                                <p className="text-sm text-viralyze-white/70 truncate">{truncated}</p>
                              </div>
                            </div>
                            <div className="flex justify-center">
                              <span className={cn(
                                'text-sm font-bold tabular-nums',
                                v.score >= 80 ? 'text-green-400' : v.score >= 60 ? 'text-amber-400' : 'text-red-400'
                              )}>
                                {v.score}
                              </span>
                            </div>
                            <div className="flex justify-center">
                              <span className={cn(
                                'text-xs font-semibold tabular-nums',
                                diff === 0 ? 'text-viralyze-muted' : 'text-red-400'
                              )}>
                                {diff === 0 ? '+0' : `-${diff}`}
                              </span>
                            </div>
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                className="min-h-[44px] px-2 bg-gradient-wine/60 hover:bg-gradient-wine text-white"
                                onClick={() => {
                                  setPrefilledIdea(v.content);
                                  setPredictMode('idea');
                                  setCurrentView('predict');
                                  toast.success('Variation loaded for re-analysis');
                                }}
                                aria-label={`Use ${v.label} for re-analysis`}
                              >
                                <Sparkles className="h-3 w-3" />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}