export type Platform = 'instagram' | 'youtube' | 'tiktok' | 'x' | 'linkedin';

export type ContentType = 'video' | 'image' | 'carousel' | 'story' | 'reel' | 'short' | 'thread' | 'post' | 'article';

export type PredictionMode = 'idea' | 'post';

export type Confidence = 'low' | 'medium' | 'high';

export type Classification = 'low' | 'moderate' | 'high' | 'viral';

export type AppView =
  | 'landing'
  | 'dashboard'
  | 'predict'
  | 'analysis'
  | 'library'
  | 'ideas'
  | 'trends'
  | 'analytics'
  | 'calendar'
  | 'settings'
  | 'pricing'
  | 'features'
  | 'how-it-works';

export interface PlatformFitScore {
  platform: Platform;
  score: number;
}

export interface CategoryScores {
  hook: number;
  engagement: number;
  shareability: number;
  retention: number;
  originality: number;
  audienceFit: number;
  emotionalImpact: number;
  contentQuality: number;
  trendAlignment: number;
}

export interface Recommendation {
  type: 'strength' | 'weakness' | 'improvement';
  text: string;
}

export interface ContentVariation {
  label: string;
  style: string;
  score: number;
  content: string;
}

export interface AnalysisResult {
  id?: string;
  overallScore: number;
  confidence: Confidence;
  classification: Classification;
  scores: CategoryScores;
  platformFit: PlatformFitScore[];
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  optimizedHook?: string;
  optimizedCaption?: string;
  optimizedTitle?: string;
  variations?: ContentVariation[];
  emotionalBreakdown?: Record<string, number>;
  predictedEngagement?: {
    likes: string;
    comments: string;
    shares: string;
    saves: string;
  };
}

export interface PredictRequest {
  mode: PredictionMode;
  platform: Platform;
  contentType: ContentType;
  audience: string;
  ideaText?: string;
  contentText?: string;
  title?: string;
  hashtags?: string;
  userId?: string;
}

export interface SavedAnalysis {
  id: string;
  title: string;
  platform: Platform;
  contentType: ContentType;
  overallScore: number;
  classification: Classification;
  createdAt: string;
}

export interface IdeaSuggestion {
  title: string;
  description: string;
  viralScore: number;
  platform: Platform;
  contentType: ContentType;
}

export interface TrendItem {
  name: string;
  category: string;
  heat: number;
  growth: string;
  platforms: Platform[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  predictionsUsed: number;
  predictionsLimit: number;
}
