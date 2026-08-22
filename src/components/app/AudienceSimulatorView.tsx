'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  Loader2,
  RefreshCw,
  Sparkles,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlatformSelector from '@/components/shared/PlatformSelector';
import { useAppStore } from '@/lib/store';
import type { AudienceDna, AudienceSimulationResult, ConnectedAccountPublic, SimulatorContentKind } from '@/lib/audience-simulator/types';
import { PLATFORM_LABELS, PLATFORM_METRIC_KEYS, PLATFORM_PRIORITIES, getDemoAudienceDna } from '@/lib/audience-simulator/platform-intel';
import AudienceDnaCard from '@/components/app/audience/AudienceDnaCard';
import PipelineLoader, { PIPELINE_STEPS } from '@/components/app/audience/PipelineLoader';
import ReactionFeed from '@/components/app/audience/ReactionFeed';
import PacingChart from '@/components/app/audience/PacingChart';
import { cn } from '@/lib/utils';

const DEMO_SCENE = 'The main ally suddenly betrays the team.';

export default function AudienceSimulatorView() {
  const {
    predictPlatform,
    setPredictPlatform,
    audienceSource,
    setAudienceSource,
    simulatorContentKind,
    setSimulatorContentKind,
    simulatorDraft,
    setSimulatorDraft,
    lastSimulation,
    setLastSimulation,
    addSavedAnalysis,
  } = useAppStore();

  const [content, setContent] = useState(simulatorDraft || DEMO_SCENE);
  const [dna, setDna] = useState<AudienceDna>(() => getDemoAudienceDna(predictPlatform));
  const [accounts, setAccounts] = useState<ConnectedAccountPublic[]>([]);
  const [loading, setLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [remixing, setRemixing] = useState(false);
  const [resimulating, setResimulating] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [showCross, setShowCross] = useState(false);

  useEffect(() => {
    if (simulatorDraft) setContent(simulatorDraft);
  }, [simulatorDraft]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/audience/connect?platform=${predictPlatform}&source=${audienceSource}`
        );
        const data = await res.json();
        if (cancelled) return;
        if (data.accounts) setAccounts(data.accounts);
        if (data.dna) setDna(data.dna);
        if (data.warning) setWarning(data.warning);
      } catch {
        if (!cancelled) setDna(getDemoAudienceDna(predictPlatform));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [predictPlatform, audienceSource]);

  const connectedForPlatform = accounts.find((a) => a.platform === predictPlatform);
  const canUseConnected =
    connectedForPlatform?.status === 'connected' || connectedForPlatform?.status === 'demo';

  useEffect(() => {
    if (audienceSource === 'connected' && connectedForPlatform?.status === 'disconnected') {
      // keep selection; UI will explain
    }
  }, [audienceSource, connectedForPlatform?.status]);

  const runSimulate = async () => {
    if (content.trim().length < 10) {
      toast.error('Paste at least 10 characters of content.');
      return;
    }
    setLoading(true);
    setPipelineStep(0);
    setLastSimulation(null);
    const interval = window.setInterval(() => {
      setPipelineStep((s) => Math.min(s + 1, PIPELINE_STEPS.length - 2));
    }, 1400);

    try {
      const res = await fetch('/api/audience-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate',
          content,
          platform: predictPlatform,
          contentKind: simulatorContentKind,
          audienceSource,
        }),
      });
      const data = await res.json();
      window.clearInterval(interval);
      setPipelineStep(PIPELINE_STEPS.length);
      if (!res.ok) {
        toast.error(data.error || 'Simulation failed.');
        return;
      }
      if (data.warning) {
        setWarning(data.warning);
        toast.message(data.warning);
      }
      const result = data.result as AudienceSimulationResult;
      setLastSimulation(result);
      setSimulatorDraft(content);
      if (result.analysisId) {
        addSavedAnalysis({
          id: result.analysisId,
          title: content.slice(0, 80),
          platform: result.platform,
          contentType: 'post',
          contentText: content,
          overallScore: result.weightedOverall,
          confidence: result.primaryIssue.confidence >= 0.8 ? 'high' : 'medium',
          classification: result.weightedOverall >= 85 ? 'viral' : result.weightedOverall >= 65 ? 'high' : 'moderate',
          createdAt: new Date().toISOString(),
        });
      }
      toast.success('Audience simulation complete.');
    } catch {
      window.clearInterval(interval);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemix = async () => {
    if (!lastSimulation) return;
    setRemixing(true);
    try {
      const res = await fetch('/api/audience-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remix', previous: lastSimulation }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Could not improve content.');
        return;
      }
      setLastSimulation({ ...lastSimulation, remix: data.remix });
    } catch {
      toast.error('Network error while improving content.');
    } finally {
      setRemixing(false);
    }
  };

  const handleResimulate = async () => {
    if (!lastSimulation?.remix?.improvedContent) return;
    setResimulating(true);
    setPipelineStep(0);
    const interval = window.setInterval(() => {
      setPipelineStep((s) => Math.min(s + 1, PIPELINE_STEPS.length - 2));
    }, 1200);
    try {
      const res = await fetch('/api/audience-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resimulate',
          previous: lastSimulation,
          improvedContent: lastSimulation.remix.improvedContent,
        }),
      });
      const data = await res.json();
      window.clearInterval(interval);
      if (!res.ok) {
        toast.error(data.error || 'Re-simulation failed.');
        return;
      }
      setLastSimulation(data.result);
      toast.success('Re-simulation complete. Compare before vs after below.');
    } catch {
      window.clearInterval(interval);
      toast.error('Network error during re-simulation.');
    } finally {
      setResimulating(false);
    }
  };

  const result = lastSimulation;
  const metricDefs = PLATFORM_METRIC_KEYS[predictPlatform];

  const lowScores = useMemo(
    () => (result?.scores || []).filter((s) => s.value < 62),
    [result]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto flex flex-col gap-6 pb-16"
    >
      <div>
        <div className="flex items-center gap-2 text-wine-accent text-xs tracking-widest uppercase font-semibold">
          <Users className="h-4 w-4" />
          Audience Simulator
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-viralyze-white mt-1">
          Know how your audience will react before you publish.
        </h1>
        <p className="text-sm text-viralyze-muted mt-2 max-w-2xl">
          Viralyze simulates how different audience types may react to your content, identifies what
          is likely to work or fail, recommends improvements, and lets you test the improved version
          again. AI-simulated — not real users.
        </p>
      </div>

      <Card className="glass border-white/[0.08]">
        <CardContent className="p-4 sm:p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-viralyze-muted">Platform</Label>
            <PlatformSelector value={predictPlatform} onChange={setPredictPlatform} />
            <p className="text-xs text-viralyze-muted">
              This platform changes personas, scoring weights, and recommendations:{' '}
              {PLATFORM_PRIORITIES[predictPlatform].slice(0, 4).join(' · ')}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-viralyze-muted">Audience Source</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setAudienceSource('connected')}
                className={cn(
                  'flex-1 rounded-lg border px-4 py-3 text-left text-sm transition-colors min-h-[44px]',
                  audienceSource === 'connected'
                    ? 'border-wine-accent bg-wine-accent/10 text-wine-accent'
                    : 'border-white/10 text-viralyze-muted hover:border-white/20'
                )}
              >
                Connected Account
                <span className="block text-[11px] text-viralyze-muted mt-0.5">
                  {canUseConnected
                    ? `${connectedForPlatform?.platformUsername || 'Connected'} · ${connectedForPlatform?.status}`
                    : 'Connect from Connected Accounts, or OAuth may be unavailable'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAudienceSource('demo')}
                className={cn(
                  'flex-1 rounded-lg border px-4 py-3 text-left text-sm transition-colors min-h-[44px]',
                  audienceSource === 'demo'
                    ? 'border-wine-accent bg-wine-accent/10 text-wine-accent'
                    : 'border-white/10 text-viralyze-muted hover:border-white/20'
                )}
              >
                Demo Audience
                <span className="block text-[11px] text-viralyze-muted mt-0.5">
                  Demo Data — Simulated for demonstration
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-viralyze-muted">Analyze content</Label>
            <Tabs
              value={simulatorContentKind}
              onValueChange={(v) => setSimulatorContentKind(v as SimulatorContentKind)}
            >
              <TabsList className="bg-white/[0.05] border border-white/[0.08] flex-wrap h-auto">
                {(['text', 'script', 'caption', 'transcript'] as const).map((k) => (
                  <TabsTrigger
                    key={k}
                    value={k}
                    className="capitalize data-[state=active]:bg-wine-accent/20 data-[state=active]:text-wine-accent min-h-[40px]"
                  >
                    {k}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="bg-white/[0.05] border-white/[0.08] text-viralyze-white min-h-[140px]"
              placeholder="Paste a caption, script, transcript, or scene..."
            />
            <Button
              type="button"
              variant="ghost"
              className="self-start text-xs text-viralyze-muted"
              onClick={() => setContent(DEMO_SCENE)}
            >
              Load demo scene (ally betrayal)
            </Button>
          </div>

          <Button
            onClick={runSimulate}
            disabled={loading || resimulating}
            className="bg-gradient-wine text-white h-12 font-semibold"
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
            {loading ? 'Simulating audience...' : 'Analyze with AI Audience Simulation'}
          </Button>
        </CardContent>
      </Card>

      {warning && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {warning}
        </div>
      )}

      <AudienceDnaCard dna={result?.audienceDna || dna} />

      {(loading || resimulating) && (
        <PipelineLoader
          activeIndex={pipelineStep}
          title={resimulating ? 'RE-SIMULATING IMPROVED CONTENT...' : 'ANALYZING YOUR CONTENT...'}
        />
      )}

      {result && !loading && (
        <div className="flex flex-col gap-6">
          <Card className="glass border-white/[0.08]">
            <CardContent className="p-5">
              <p className="text-[11px] tracking-widest uppercase text-wine-accent font-semibold">
                Platform Audience Prediction · {PLATFORM_LABELS[result.platform]}
              </p>
              <p className="text-xs text-viralyze-muted mt-1">AI Simulation Estimate</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                {metricDefs.map((m) => (
                  <div key={m.key} className="rounded-lg bg-white/[0.04] p-3">
                    <p className="text-[11px] text-viralyze-muted">{m.label}</p>
                    <p className="text-2xl font-bold tabular-nums text-viralyze-white">
                      {result.platformPrediction.metrics[m.key] ?? '—'}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-viralyze-white mt-4">
                <span className="text-wine-accent font-semibold">Primary Risk: {result.platformPrediction.primaryRisk}.</span>{' '}
                {result.platformPrediction.primaryRiskWhy}
              </p>
              <p className="text-xs text-viralyze-muted mt-2">{result.contentUnderstanding}</p>
            </CardContent>
          </Card>

          <Card className="glass border-white/[0.08]">
            <CardContent className="p-5">
              <p className="text-[11px] tracking-widest uppercase text-wine-accent font-semibold mb-3">
                Relevant Audience
              </p>
              <div className="flex flex-col gap-2">
                {result.personaSelection.map((p) => (
                  <div key={p.id} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-viralyze-success mt-0.5 shrink-0" />
                    <div>
                      <span className="text-viralyze-white font-medium">
                        {p.emoji} {p.name}
                      </span>
                      <p className="text-xs text-viralyze-muted">{p.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
              {result.skippedPersonas.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <p className="text-xs text-viralyze-muted mb-2">Skipped</p>
                  {result.skippedPersonas.map((p) => (
                    <p key={p.id} className="text-xs text-viralyze-muted/80 mb-1">
                      {p.name} — {p.reason}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <ReactionFeed reactions={result.reactions} live />

          <Card className="glass border-white/[0.08]">
            <CardContent className="p-5">
              <p className="text-[11px] tracking-widest uppercase text-wine-accent font-semibold mb-3">
                Content analysis
              </p>
              <div className="flex flex-col gap-3">
                {result.scores.map((s) => (
                  <details key={s.key} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <summary className="cursor-pointer flex items-center justify-between gap-3 list-none">
                      <span className="text-sm text-viralyze-white">{s.label}</span>
                      <span
                        className={cn(
                          'tabular-nums text-sm font-semibold',
                          s.value < 60 ? 'text-amber-400' : 'text-viralyze-white'
                        )}
                      >
                        {s.value}
                        {s.value < 60 ? ' ⚠' : ''}
                      </span>
                    </summary>
                    <div className="mt-3 space-y-1.5 text-xs text-viralyze-muted">
                      <p><span className="text-viralyze-white">What?</span> {s.what}</p>
                      <p><span className="text-viralyze-white">Why?</span> {s.why}</p>
                      {s.audienceEvidence && (
                        <p><span className="text-viralyze-white">Audience evidence:</span> {s.audienceEvidence}</p>
                      )}
                      <p><span className="text-viralyze-white">Impact?</span> {s.impact}</p>
                      <p><span className="text-viralyze-white">Action?</span> {s.action}</p>
                    </div>
                  </details>
                ))}
              </div>
              <p className="text-xs text-viralyze-muted mt-3">
                Platform-weighted overall (AI Simulation Estimate):{' '}
                <span className="text-viralyze-white font-semibold tabular-nums">{result.weightedOverall}</span>
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-white/[0.08]">
            <CardContent className="p-5">
              <p className="text-[11px] tracking-widest uppercase text-wine-accent font-semibold mb-4">
                Audience Consensus
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  ['Positive', result.consensus.positive, 'text-emerald-400'],
                  ['Neutral', result.consensus.neutral, 'text-viralyze-muted'],
                  ['Negative', result.consensus.negative, 'text-red-400'],
                ].map(([label, value, color]) => (
                  <div key={String(label)} className="rounded-lg bg-white/[0.04] p-3 text-center">
                    <p className="text-[11px] text-viralyze-muted">{label}</p>
                    <p className={cn('text-2xl font-bold tabular-nums', color)}>{value}%</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-viralyze-white">Most appreciated: {result.consensus.mostAppreciated}</p>
              <p className="text-sm text-amber-300 mt-1">Most common concern: {result.consensus.mostCommonConcern}</p>
              <p className="text-sm text-red-300 mt-1">Biggest risk: {result.consensus.biggestRisk}</p>
            </CardContent>
          </Card>

          <Card className="glass border-wine-accent/30">
            <CardContent className="p-5">
              <p className="text-[11px] tracking-widest uppercase text-wine-accent font-semibold">
                AI Decision · Primary Issue
              </p>
              <h3 className="text-xl font-bold text-viralyze-white mt-2">{result.primaryIssue.title}</h3>
              <p className="text-sm text-viralyze-muted mt-1">
                Confidence {Math.round(result.primaryIssue.confidence * 100)}% · Priority {result.primaryIssue.priority}
              </p>
              <p className="text-sm text-viralyze-white mt-3">{result.primaryIssue.evidence}</p>
              <p className="text-xs text-viralyze-muted mt-2">
                Affected: {result.primaryIssue.affectedAudiences.join(', ') || 'Multiple personas'}
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-white/[0.08]">
            <CardContent className="p-5">
              <p className="text-[11px] tracking-widest uppercase text-wine-accent font-semibold">
                What should you change?
              </p>
              <p className="text-xs text-wine-accent mt-1">{result.recommendation.priority} PRIORITY</p>
              <h3 className="text-lg font-semibold text-viralyze-white mt-1">{result.recommendation.title}</h3>
              <div className="mt-3 space-y-2 text-sm text-viralyze-muted">
                <p><span className="text-viralyze-white">Problem:</span> {result.recommendation.problem}</p>
                <p><span className="text-viralyze-white">Evidence:</span> {result.recommendation.evidence}</p>
                <p><span className="text-viralyze-white">Impact:</span> {result.recommendation.impact}</p>
                <p><span className="text-viralyze-white">Recommended action:</span> {result.recommendation.recommendedAction}</p>
              </div>
              <Button
                onClick={handleRemix}
                disabled={remixing}
                className="mt-4 bg-gradient-wine text-white"
              >
                {remixing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Improve Content
              </Button>
            </CardContent>
          </Card>

          {result.remix && (
            <Card className="glass border-white/[0.08]">
              <CardContent className="p-5">
                <p className="text-[11px] tracking-widest uppercase text-wine-accent font-semibold mb-4">
                  Before / After
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-white/[0.03] p-4 border border-white/[0.06]">
                    <p className="text-xs text-viralyze-muted mb-2">Original</p>
                    <p className="text-sm text-viralyze-white whitespace-pre-wrap">{result.remix.originalContent}</p>
                  </div>
                  <div className="rounded-lg bg-wine-accent/10 p-4 border border-wine-accent/30">
                    <p className="text-xs text-wine-accent mb-2">AI improved version</p>
                    <p className="text-sm text-viralyze-white whitespace-pre-wrap">{result.remix.improvedContent}</p>
                  </div>
                </div>
                <p className="text-sm text-viralyze-muted mt-4">
                  <span className="text-viralyze-white">Why did Viralyze change this?</span>{' '}
                  {result.remix.changeExplanation}
                </p>
                <Button
                  onClick={handleResimulate}
                  disabled={resimulating}
                  variant="outline"
                  className="mt-4 border-wine-accent/40 text-wine-accent"
                >
                  {resimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Simulate Again
                </Button>
              </CardContent>
            </Card>
          )}

          {result.comparison && (
            <Card className="glass border-white/[0.08]">
              <CardContent className="p-5">
                <p className="text-[11px] tracking-widest uppercase text-wine-accent font-semibold">
                  Before vs After
                </p>
                <p className="text-xs text-viralyze-muted mb-4">AI Simulation Estimate — not a guaranteed real-world result</p>
                <div className="flex flex-col gap-2">
                  {(
                    [
                      ['Clarity', result.comparison.before.clarity, result.comparison.after.clarity],
                      ['Consistency', result.comparison.before.consistency, result.comparison.after.consistency],
                      ['Emotion', result.comparison.before.emotion, result.comparison.after.emotion],
                      ['Pacing', result.comparison.before.pacing, result.comparison.after.pacing],
                      ['Engagement', result.comparison.before.engagement, result.comparison.after.engagement],
                    ] as const
                  ).map(([label, before, after]) => (
                    <div key={label} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center text-sm">
                      <span className="text-viralyze-muted">{label}</span>
                      <span className="tabular-nums text-viralyze-muted">{before}</span>
                      <span className={cn('tabular-nums font-semibold', after >= before ? 'text-emerald-400' : 'text-amber-300')}>
                        {after} {after >= before ? '↑' : '↓'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="glass border-white/[0.08]">
            <CardContent className="p-5">
              <p className="text-[11px] tracking-widest uppercase text-wine-accent font-semibold mb-1">
                Story Pacing
              </p>
              <p className="text-xs text-viralyze-muted mb-3">Tension, emotion, humor, and engagement across the content</p>
              <PacingChart data={result.pacingGraph} />
            </CardContent>
          </Card>

          <Card className="glass border-white/[0.08]">
            <CardContent className="p-5">
              <button
                type="button"
                onClick={() => setShowCross((v) => !v)}
                className="text-[11px] tracking-widest uppercase text-wine-accent font-semibold"
              >
                Cross-platform prediction {showCross ? '▾' : '▸'}
              </button>
              <AnimatePresence>
                {showCross && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-x-auto mt-4">
                    <table className="w-full text-xs text-left min-w-[520px]">
                      <thead>
                        <tr className="text-viralyze-muted">
                          <th className="pb-2 font-medium">Metric</th>
                          {(['instagram', 'youtube', 'tiktok', 'x', 'linkedin'] as const).map((p) => (
                            <th key={p} className="pb-2 font-medium">{PLATFORM_LABELS[p]}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.crossPlatform.rows.map((row) => (
                          <tr key={row.metric} className="border-t border-white/[0.06]">
                            <td className="py-2 text-viralyze-white">{row.metric}</td>
                            <td className="tabular-nums">{row.instagram}</td>
                            <td className="tabular-nums">{row.youtube}</td>
                            <td className="tabular-nums">{row.tiktok}</td>
                            <td className="tabular-nums">{row.x}</td>
                            <td className="tabular-nums">{row.linkedin}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-sm text-viralyze-white mt-3">
                      Best fit: {PLATFORM_LABELS[result.crossPlatform.bestFit]}. {result.crossPlatform.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {lowScores.length > 0 && (
            <p className="text-xs text-viralyze-muted flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              Scores below 60 are flagged as likely drop-off or confusion risks.
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
