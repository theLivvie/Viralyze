'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  CheckCircle2,
  AlertTriangle,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Inbox,
  Instagram,
  Youtube,
  Tv,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import ScoreRing from '@/components/shared/ScoreRing';
import ScoreBar from '@/components/shared/ScoreBar';
import type { Platform } from '@/lib/types';
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
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function FloatingDots() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute h-1.5 w-1.5 rounded-full bg-wine-accent/40"
        style={{ top: '20%', left: '25%' }}
        animate={{
          y: [-4, 4, -4],
          x: [2, -2, 2],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute h-1 w-1 rounded-full bg-wine-accent/30"
        style={{ top: '35%', right: '20%' }}
        animate={{
          y: [3, -5, 3],
          x: [-3, 2, -3],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute h-1 w-1 rounded-full bg-wine/[0.4]"
        style={{ bottom: '25%', left: '30%' }}
        animate={{
          y: [-3, 6, -3],
          x: [4, -1, 4],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </div>
  );
}

function GlowAccentLine({ color }: { color: string }) {
  return (
    <div
      className="glow-line w-full"
      style={{
        background: color,
      }}
    />
  );
}

export default function AnalysisView() {
  const { currentAnalysis, setCurrentView, addSavedAnalysis, user } = useAppStore();
  const [optimizedOpen, setOptimizedOpen] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleSave = () => {
    if (!currentAnalysis) return;
    addSavedAnalysis({
      id: currentAnalysis.id || Date.now().toString(),
      title: 'Untitled Analysis',
      platform: 'instagram',
      contentType: 'post',
      overallScore: currentAnalysis.overallScore,
      classification: currentAnalysis.classification,
      createdAt: new Date().toISOString(),
    });
    toast.success('Saved to library');
  };

  if (!currentAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Inbox className="h-12 w-12 text-viralyze-muted/30" />
        <p className="text-viralyze-muted">No analysis to display</p>
        <Button
          variant="outline"
          onClick={() => setCurrentView('predict')}
          className="border-white/10 text-viralyze-muted hover:text-viralyze-white"
        >
          Start a new analysis
        </Button>
      </div>
    );
  }

  const { scores, platformFit, strengths, weaknesses, improvements, variations } = currentAnalysis;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-6xl mx-auto"
    >
      {/* LEFT COLUMN - 60% */}
      <motion.div variants={item} className="lg:col-span-3 flex flex-col gap-6">
        {/* Score Ring with floating dots */}
        <Card className="glass relative overflow-hidden">
          <FloatingDots />
          <CardContent className="p-6 flex flex-col items-center gap-2 relative z-10">
            <ScoreRing
              score={currentAnalysis.overallScore}
              size={180}
              classification={currentAnalysis.classification}
              confidence={currentAnalysis.confidence}
            />
          </CardContent>
        </Card>

        {/* Content Health */}
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-viralyze-muted uppercase tracking-wider">
              Content Health
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3.5">
            <ScoreBar label="Hook" score={scores.hook} delay={0} />
            <ScoreBar label="Engagement" score={scores.engagement} delay={0.1} />
            <ScoreBar label="Shareability" score={scores.shareability} delay={0.2} />
            <ScoreBar label="Retention" score={scores.retention} delay={0.3} />
            <ScoreBar label="Originality" score={scores.originality} delay={0.4} />
            <ScoreBar label="Audience Fit" score={scores.audienceFit} delay={0.5} />
          </CardContent>
        </Card>

        {/* Emotional Impact Radar */
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-viralyze-muted uppercase tracking-wider">
              Emotional Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={(() => {
                  const bd = currentAnalysis.emotionalBreakdown || {};
                  return Object.entries(bd).map(([key, val]) => ({ emotion: key.charAt(0).toUpperCase() + key.slice(1), value: Number(val) }));
                })()}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis
                    dataKey="emotion"
                    tick={{ fill: '#A1A1AA', fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    name="Impact"
                    dataKey="value"
                    stroke="#B8325A"
                    fill="#B8325A"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#121214',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#FAFAF9',
                      fontSize: '12px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Platform Fit */}
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-viralyze-muted uppercase tracking-wider">
              Platform Fit
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {platformFit.map((pf, i) => {
              const PIcon = platformIcons[pf.platform];
              return (
                <div key={pf.platform} className="flex items-center gap-3 w-full">
                  <PIcon className="h-4 w-4 text-viralyze-muted w-6 shrink-0" />
                  <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          pf.score >= 70
                            ? 'linear-gradient(90deg, #22C55E, #4ADE80)'
                            : pf.score >= 50
                            ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                            : 'linear-gradient(90deg, #7F1D3A, #B8325A)',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pf.score}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                  </div>
                  <span className="text-sm font-medium text-viralyze-white tabular-nums w-8 text-right">
                    {pf.score}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* RIGHT COLUMN - 40% */}
      <motion.div variants={item} className="lg:col-span-2 flex flex-col gap-6">
        {/* Strengths */}
        <Card className="glass overflow-hidden">
          <GlowAccentLine color="linear-gradient(90deg, transparent, #22C55E, transparent)" />
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-400 uppercase tracking-wider">
              What&apos;s Working
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {strengths.map((s, i) => (
              <div key={i} className="flex gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                <span className="text-sm text-viralyze-white/90">{s}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card className="glass overflow-hidden">
          <GlowAccentLine color="linear-gradient(90deg, transparent, #F59E0B, transparent)" />
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-400 uppercase tracking-wider">
              What&apos;s Holding It Back
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {weaknesses.map((w, i) => (
              <div key={i} className="flex gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm text-viralyze-white/90">{w}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Improvements */}
        <Card className="glass overflow-hidden">
          <GlowAccentLine color="linear-gradient(90deg, transparent, #B8325A, transparent)" />
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-wine-accent uppercase tracking-wider">
              How to Improve
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {improvements.map((imp, i) => (
              <div key={i} className="flex gap-3">
                <span className="h-5 w-5 rounded-full bg-wine-accent/20 text-wine-accent text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
                  {i + 1}
                </span>
                <span className="text-sm text-viralyze-white/90">{imp}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Optimized Content */}
        {(currentAnalysis.optimizedHook || currentAnalysis.optimizedCaption || currentAnalysis.optimizedTitle) && (
          <Card className="glass">
            <CardContent className="p-0">
              <button
                onClick={() => setOptimizedOpen(!optimizedOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-sm font-medium text-viralyze-white uppercase tracking-wider">
                  Optimized Content
                </span>
                {optimizedOpen ? (
                  <ChevronUp className="h-4 w-4 text-viralyze-muted" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-viralyze-muted" />
                )}
              </button>

              {optimizedOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4 flex flex-col gap-4"
                >
                  {currentAnalysis.optimizedHook && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-viralyze-muted uppercase">Hook</span>
                      <div className="flex gap-2">
                        <p className="flex-1 text-sm text-viralyze-white/90 bg-white/[0.03] rounded-lg p-3">
                          {currentAnalysis.optimizedHook}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-viralyze-muted hover:text-viralyze-white h-8 w-8"
                          onClick={() => handleCopy(currentAnalysis.optimizedHook!)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentAnalysis.optimizedCaption && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-viralyze-muted uppercase">Caption</span>
                      <div className="flex gap-2">
                        <p className="flex-1 text-sm text-viralyze-white/90 bg-white/[0.03] rounded-lg p-3 whitespace-pre-wrap">
                          {currentAnalysis.optimizedCaption}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-viralyze-muted hover:text-viralyze-white h-8 w-8"
                          onClick={() => handleCopy(currentAnalysis.optimizedCaption!)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentAnalysis.optimizedTitle && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-viralyze-muted uppercase">Title</span>
                      <div className="flex gap-2">
                        <p className="flex-1 text-sm text-viralyze-white/90 bg-white/[0.03] rounded-lg p-3">
                          {currentAnalysis.optimizedTitle}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-viralyze-muted hover:text-viralyze-white h-8 w-8"
                          onClick={() => handleCopy(currentAnalysis.optimizedTitle!)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Variations */}
        {variations && variations.length > 0 && (
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-viralyze-muted uppercase tracking-wider">
                Variations
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {variations.map((v, i) => (
                <div key={i}>
                  <button
                    onClick={() => setSelectedVariation(selectedVariation === i ? null : i)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-viralyze-white">
                        {v.label}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          v.score >= 70
                            ? 'border-green-500/30 text-green-400'
                            : v.score >= 50
                            ? 'border-amber-500/30 text-amber-400'
                            : 'border-red-500/30 text-red-400'
                        }
                      >
                        {v.score}
                      </Badge>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-viralyze-muted transition-transform ${
                        selectedVariation === i ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {selectedVariation === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="px-3 pb-3"
                    >
                      <p className="text-sm text-viralyze-white/80 bg-white/[0.03] rounded-lg p-3 whitespace-pre-wrap">
                        {v.content}
                      </p>
                    </motion.div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons - Save with shine effect */}
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-wine hover:opacity-90 text-white font-medium btn-shine"
          >
            Save to Library
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentView('predict')}
            className="flex-1 border-white/10 text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.04]"
          >
            Analyze Another
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
