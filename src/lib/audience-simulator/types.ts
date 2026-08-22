import type { Platform } from '@/lib/types';

export type AudienceSource = 'demo' | 'connected';

export type SimulatorContentKind = 'text' | 'script' | 'caption' | 'transcript';

export type Sentiment = 'positive' | 'neutral' | 'negative';

export type DataOrigin = 'demo' | 'authorized' | 'ai' | 'unavailable';

export interface DnaField {
  key: string;
  label: string;
  value: string;
  origin: DataOrigin;
}

export interface AudienceDna {
  platform: Platform;
  source: AudienceSource;
  label: string;
  fields: DnaField[];
  summary: string;
  connectedHandle?: string;
}

export interface PlatformPersona {
  id: string;
  name: string;
  emoji: string;
  focus: string[];
}

export interface PersonaSelection {
  id: string;
  name: string;
  emoji: string;
  reason: string;
}

export interface SkippedPersona {
  id: string;
  name: string;
  reason: string;
}

export interface ExplainableScore {
  key: string;
  label: string;
  value: number;
  what: string;
  why: string;
  impact: string;
  action: string;
  audienceEvidence?: string;
}

export interface PersonaReaction {
  persona: string;
  personaId: string;
  personaLabel: string;
  emoji: string;
  sentiment: Sentiment;
  reaction: string;
  reason: string;
  engagement_score: number;
  clarity_score: number;
  emotional_score: number;
  confidence: number;
  recommendation: string;
  keyConcern?: string;
}

export interface AudienceConsensus {
  positive: number;
  neutral: number;
  negative: number;
  mostAppreciated: string;
  mostCommonConcern: string;
  biggestRisk: string;
}

export interface PrimaryIssue {
  title: string;
  confidence: number;
  evidence: string;
  affectedAudiences: string[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceCount: number;
  totalPersonas: number;
}

export interface ActionableRecommendation {
  title: string;
  problem: string;
  evidence: string;
  impact: string;
  recommendedAction: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PacingPoint {
  moment: string;
  tension: number;
  emotion: number;
  humor: number;
  engagement: number;
}

export interface PlatformPrediction {
  platform: Platform;
  metrics: Record<string, number>;
  primaryRisk: string;
  primaryRiskWhy: string;
}

export interface CrossPlatformRow {
  metric: string;
  instagram: number;
  youtube: number;
  tiktok: number;
  x: number;
  linkedin: number;
}

export interface RemixResult {
  originalContent: string;
  improvedContent: string;
  changeExplanation: string;
}

export interface VersionMetrics {
  clarity: number;
  consistency: number;
  emotion: number;
  pacing: number;
  engagement: number;
}

export interface AudienceSimulationResult {
  content: string;
  platform: Platform;
  contentKind: SimulatorContentKind;
  audienceSource: AudienceSource;
  audienceDna: AudienceDna;
  contentUnderstanding: string;
  personaSelection: PersonaSelection[];
  skippedPersonas: SkippedPersona[];
  scores: ExplainableScore[];
  weightedOverall: number;
  platformPrediction: PlatformPrediction;
  reactions: PersonaReaction[];
  consensus: AudienceConsensus;
  primaryIssue: PrimaryIssue;
  recommendation: ActionableRecommendation;
  pacingGraph: PacingPoint[];
  crossPlatform: {
    rows: CrossPlatformRow[];
    bestFit: Platform;
    explanation: string;
  };
  remix?: RemixResult;
  comparison?: {
    before: VersionMetrics;
    after: VersionMetrics;
  };
  analysisId?: string | null;
}

export interface ConnectedAccountPublic {
  platform: Platform;
  status: 'connected' | 'demo' | 'disconnected' | 'error';
  platformUsername: string | null;
  connectedAt: string | null;
  oauthConfigured: boolean;
  lastError?: string | null;
  availableDataNotes: string;
}
