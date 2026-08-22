import type { Platform } from '@/lib/types';
import type { AudienceDna, DnaField, PlatformPersona } from './types';

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  x: 'X',
  linkedin: 'LinkedIn',
};

export const PLATFORM_PRIORITIES: Record<Platform, string[]> = {
  instagram: [
    'First impression',
    'Visual appeal',
    'Hook',
    'Emotional impact',
    'Short-form retention',
    'Shares',
    'Saves',
    'Comments',
    'Relatability',
    'Aesthetic appeal',
  ],
  youtube: [
    'Opening hook',
    'Watch retention',
    'Watch time',
    'Storytelling',
    'Information value',
    'Returning viewers',
    'Thumbnail/title relationship',
    'Long-form engagement',
  ],
  tiktok: [
    'First-second hook',
    'Fast pacing',
    'Trend compatibility',
    'Entertainment',
    'Rewatchability',
    'Shareability',
    'Comment potential',
    'Short-form retention',
  ],
  x: [
    'Opinion',
    'Discussion potential',
    'Conciseness',
    'Relevance',
    'Debate potential',
    'Replies',
    'Reposts',
    'Emotional/intellectual reaction',
    'Clarity',
  ],
  linkedin: [
    'Professional relevance',
    'Credibility',
    'Insight',
    'Clarity',
    'Business value',
    'Expertise',
    'Discussion',
    'Professional storytelling',
    'Evidence',
  ],
};

export const PLATFORM_METRIC_KEYS: Record<Platform, { key: string; label: string }[]> = {
  instagram: [
    { key: 'hook', label: 'Hook' },
    { key: 'engagement', label: 'Engagement' },
    { key: 'shareability', label: 'Shareability' },
    { key: 'saves', label: 'Saves' },
    { key: 'retention', label: 'Short-form retention' },
  ],
  youtube: [
    { key: 'hook', label: 'Opening hook' },
    { key: 'retention', label: 'Retention' },
    { key: 'watchTime', label: 'Watch time' },
    { key: 'storytelling', label: 'Storytelling' },
    { key: 'returningAudience', label: 'Returning audience' },
  ],
  tiktok: [
    { key: 'hook', label: 'First-second hook' },
    { key: 'rewatchability', label: 'Rewatchability' },
    { key: 'trendFit', label: 'Trend compatibility' },
    { key: 'entertainment', label: 'Entertainment' },
    { key: 'shareability', label: 'Shares' },
  ],
  x: [
    { key: 'discussion', label: 'Discussion' },
    { key: 'opinion', label: 'Opinion' },
    { key: 'replies', label: 'Replies' },
    { key: 'reposts', label: 'Reposts' },
    { key: 'conciseness', label: 'Conciseness' },
  ],
  linkedin: [
    { key: 'professionalValue', label: 'Professional value' },
    { key: 'credibility', label: 'Credibility' },
    { key: 'insight', label: 'Insight' },
    { key: 'clarity', label: 'Clarity' },
    { key: 'discussion', label: 'Discussion' },
  ],
};

/** Weights used to compute a platform-aware overall score from explainable metrics. */
export const SCORE_WEIGHTS: Record<Platform, Record<string, number>> = {
  instagram: {
    viralPotential: 1,
    engagementPotential: 1.1,
    hookStrength: 1.4,
    emotionalImpact: 1.3,
    pacing: 1.1,
    humor: 0.8,
    tension: 0.8,
    storyConsistency: 0.7,
    clarity: 1,
    audienceRelevance: 1.2,
    shareability: 1.4,
    retentionRisk: 1.2,
  },
  youtube: {
    viralPotential: 1,
    engagementPotential: 1.1,
    hookStrength: 1.4,
    emotionalImpact: 1,
    pacing: 1.3,
    humor: 0.7,
    tension: 1.1,
    storyConsistency: 1.3,
    clarity: 1.2,
    audienceRelevance: 1.2,
    shareability: 0.8,
    retentionRisk: 1.5,
  },
  tiktok: {
    viralPotential: 1.2,
    engagementPotential: 1.2,
    hookStrength: 1.5,
    emotionalImpact: 1.2,
    pacing: 1.4,
    humor: 1.2,
    tension: 0.8,
    storyConsistency: 0.6,
    clarity: 0.9,
    audienceRelevance: 1.1,
    shareability: 1.4,
    retentionRisk: 1.3,
  },
  x: {
    viralPotential: 1,
    engagementPotential: 1.2,
    hookStrength: 1.1,
    emotionalImpact: 1,
    pacing: 0.7,
    humor: 0.8,
    tension: 0.9,
    storyConsistency: 0.7,
    clarity: 1.4,
    audienceRelevance: 1.3,
    shareability: 1.3,
    retentionRisk: 0.6,
  },
  linkedin: {
    viralPotential: 0.7,
    engagementPotential: 1,
    hookStrength: 0.9,
    emotionalImpact: 0.8,
    pacing: 0.8,
    humor: 0.4,
    tension: 0.5,
    storyConsistency: 1,
    clarity: 1.5,
    audienceRelevance: 1.4,
    shareability: 0.9,
    retentionRisk: 0.7,
  },
};

export const CORE_PERSONAS: PlatformPersona[] = [
  {
    id: 'casual',
    name: 'Casual Viewer',
    emoji: '😎',
    focus: ['Immediate understanding', 'Entertainment', 'First impression', 'Attention', 'Confusion'],
  },
  {
    id: 'loyal',
    name: 'Loyal Follower',
    emoji: '❤️',
    focus: ['Familiarity with creator', 'Previous content', 'Creator style', 'Expectations'],
  },
  {
    id: 'critical',
    name: 'Critical Viewer',
    emoji: '🎬',
    focus: ['Logic', 'Pacing', 'Story structure', 'Weak writing', 'Plot holes'],
  },
  {
    id: 'lore',
    name: 'Lore / Detail-Focused Viewer',
    emoji: '📚',
    focus: ['Continuity', 'World-building', 'Character history', 'Internal consistency'],
  },
  {
    id: 'new',
    name: 'New Viewer',
    emoji: '🆕',
    focus: ['Context', 'Accessibility', 'Hook', 'First impression', 'Understanding without prior knowledge'],
  },
];

export const PLATFORM_PERSONAS: Record<Platform, PlatformPersona[]> = {
  instagram: [
    { id: 'ig-scroller', name: 'Casual Scroller', emoji: '😎', focus: ['First impression', 'Visual hook', 'Stop-the-scroll'] },
    { id: 'ig-loyal', name: 'Loyal Follower', emoji: '❤️', focus: ['Creator style', 'Emotional connection'] },
    { id: 'ig-new', name: 'New Viewer', emoji: '🆕', focus: ['Context', 'Accessibility'] },
    { id: 'ig-share', name: 'Share-Oriented Viewer', emoji: '📤', focus: ['Shareability', 'Relatability'] },
    { id: 'ig-emotion', name: 'Emotion-Driven Viewer', emoji: '💔', focus: ['Emotional impact', 'Aesthetic appeal'] },
  ],
  youtube: [
    { id: 'yt-return', name: 'Returning Viewer', emoji: '🔁', focus: ['Watch time', 'Creator familiarity'] },
    { id: 'yt-new', name: 'New Viewer', emoji: '🆕', focus: ['Opening hook', 'Context'] },
    { id: 'yt-long', name: 'Long-Form Viewer', emoji: '📺', focus: ['Storytelling', 'Retention'] },
    { id: 'yt-critical', name: 'Critical Viewer', emoji: '🎬', focus: ['Structure', 'Information value'] },
    { id: 'yt-topic', name: 'Topic-Focused Viewer', emoji: '🎯', focus: ['Topic payoff', 'Search intent'] },
  ],
  tiktok: [
    { id: 'tt-scroller', name: 'Casual Scroller', emoji: '😎', focus: ['First-second hook', 'Pacing'] },
    { id: 'tt-trend', name: 'Trend-Seeking Viewer', emoji: '🔥', focus: ['Trend compatibility', 'Entertainment'] },
    { id: 'tt-rewatch', name: 'Rewatch Viewer', emoji: '🔂', focus: ['Rewatchability', 'Payoff'] },
    { id: 'tt-short', name: 'Short-Attention Viewer', emoji: '⚡', focus: ['Speed', 'Drop-off risk'] },
    { id: 'tt-share', name: 'Share-Oriented Viewer', emoji: '📤', focus: ['Shareability', 'Comment bait'] },
  ],
  x: [
    { id: 'x-casual', name: 'Casual Reader', emoji: '👀', focus: ['Clarity', 'Conciseness'] },
    { id: 'x-opinion', name: 'Opinionated User', emoji: '💬', focus: ['Opinion', 'Stance'] },
    { id: 'x-debate', name: 'Debate-Seeker', emoji: '⚔️', focus: ['Discussion potential', 'Replies'] },
    { id: 'x-industry', name: 'Industry Observer', emoji: '📡', focus: ['Relevance', 'Insight'] },
    { id: 'x-loyal', name: 'Loyal Follower', emoji: '❤️', focus: ['Voice', 'Consistency'] },
  ],
  linkedin: [
    { id: 'li-pro', name: 'Professional Viewer', emoji: '💼', focus: ['Professional relevance', 'Clarity'] },
    { id: 'li-expert', name: 'Industry Expert', emoji: '🧠', focus: ['Credibility', 'Evidence'] },
    { id: 'li-recruiter', name: 'Recruiter / Decision-Maker', emoji: '🧭', focus: ['Business value', 'Expertise'] },
    { id: 'li-casual', name: 'Casual Professional', emoji: '☕', focus: ['Storytelling', 'Readability'] },
    { id: 'li-seeker', name: 'Knowledge-Seeker', emoji: '📘', focus: ['Insight', 'Takeaway'] },
  ],
};

function field(key: string, label: string, value: string, origin: DnaField['origin'] = 'demo'): DnaField {
  return { key, label, value, origin };
}

const unavailable = (key: string, label: string): DnaField =>
  field(key, label, 'Not available from this platform.', 'unavailable');

export function getDemoAudienceDna(platform: Platform): AudienceDna {
  const labeled = `Demo ${PLATFORM_LABELS[platform]} audience`;

  const byPlatform: Record<Platform, DnaField[]> = {
    instagram: [
      field('primaryAudience', 'Primary Audience', '18–24'),
      field('topInterest', 'Top Interest', 'Entertainment'),
      field('engagementStyle', 'Engagement Style', 'Highly Interactive'),
      field('topContentType', 'Top Content Type', 'Short-form Storytelling'),
      field('preference', 'Audience Preference', 'Fast-paced openings'),
      field('returning', 'Returning Audience', '68%'),
      field('peak', 'Peak Engagement', '7 PM – 10 PM'),
      field('saves', 'Save Rate Pattern', 'Above-average on emotional posts'),
      unavailable('watchTime', 'Average Watch Time'),
    ],
    youtube: [
      field('primaryAudience', 'Primary Audience', '18–34'),
      field('topInterest', 'Top Interest', 'How-to & storytelling'),
      field('engagementStyle', 'Engagement Style', 'Long-session viewers'),
      field('topContentType', 'Top Content Type', 'Narrative explainers'),
      field('preference', 'Audience Preference', 'Payoff in first 20 seconds'),
      field('returning', 'Returning Viewers', '54%'),
      field('newViewers', 'New Viewers', '46%'),
      field('peak', 'Peak Watch Window', '6 PM – 9 PM'),
      unavailable('saves', 'Saves'),
    ],
    tiktok: [
      field('primaryAudience', 'Primary Audience', '16–24'),
      field('topInterest', 'Top Interest', 'Entertainment'),
      field('engagementStyle', 'Engagement Style', 'High comment / share'),
      field('topContentType', 'Top Content Type', 'Fast-cut story clips'),
      field('preference', 'Audience Preference', 'Conflict in first 3 seconds'),
      field('rewatch', 'Rewatch Tendency', 'High on twist endings'),
      field('peak', 'Peak Engagement', '8 PM – 11 PM'),
      unavailable('returning', 'Returning Audience Share'),
    ],
    x: [
      field('primaryAudience', 'Primary Audience', '25–34'),
      field('topInterest', 'Top Interest', 'Culture & industry takes'),
      field('engagementStyle', 'Engagement Style', 'Reply-heavy discussion'),
      field('topContentType', 'Top Content Type', 'Opinion posts'),
      field('preference', 'Audience Preference', 'Clear stance + a reason to reply'),
      field('peak', 'Peak Activity', '12 PM – 2 PM, 8 PM – 10 PM'),
      unavailable('saves', 'Saves'),
      unavailable('watchTime', 'Watch Time'),
    ],
    linkedin: [
      field('primaryAudience', 'Primary Audience', '28–44'),
      field('topInterest', 'Top Interest', 'Career & industry insight'),
      field('engagementStyle', 'Engagement Style', 'Thoughtful comments'),
      field('topContentType', 'Top Content Type', 'Professional stories with takeaways'),
      field('preference', 'Audience Preference', 'Evidence + a clear lesson'),
      field('peak', 'Peak Engagement', 'Tue–Thu, 8 AM – 10 AM'),
      unavailable('rewatch', 'Rewatchability'),
      unavailable('saves', 'Saves (not exposed)'),
    ],
  };

  const summaries: Record<Platform, string> = {
    instagram: '18–24 entertainment audience with high interaction and a preference for fast-paced short-form storytelling.',
    youtube: 'Mixed new/returning viewers who reward openings that reach the point within ~20 seconds and sustain watch time.',
    tiktok: 'Young, entertainment-first audience that drops off if the strongest moment arrives late.',
    x: 'Discussion-oriented readers who engage when a post takes a clear stance and invites a reply.',
    linkedin: 'Professionals who engage when a story ends in a credible, specific business or career takeaway.',
  };

  return {
    platform,
    source: 'demo',
    label: labeled,
    fields: byPlatform[platform],
    summary: summaries[platform],
    connectedHandle: 'Demo Creator Account',
  };
}

export function formatPersonaForAudience(persona: PlatformPersona, dna: AudienceDna): string {
  const age = dna.fields.find((f) => f.key === 'primaryAudience' && f.origin !== 'unavailable');
  const pref = dna.fields.find((f) => f.key === 'preference' && f.origin !== 'unavailable');
  const extras = [age?.value, pref?.value].filter(Boolean).join(' · ');
  const platformName = PLATFORM_LABELS[dna.platform];
  return extras
    ? `${platformName} ${persona.name} — ${extras}`
    : `${platformName} ${persona.name}`;
}

export function clampScore(n: unknown, fallback = 50): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function clampConfidence(n: unknown, fallback = 0.7): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  if (v > 1 && v <= 100) return Math.max(0, Math.min(1, v / 100));
  return Math.max(0, Math.min(1, v));
}

export function computeWeightedOverall(
  platform: Platform,
  scores: { key: string; value: number }[]
): number {
  const weights = SCORE_WEIGHTS[platform];
  let total = 0;
  let weightSum = 0;
  for (const s of scores) {
    const w = weights[s.key] ?? 1;
    // retentionRisk is inverted: higher risk should lower overall
    const value = s.key === 'retentionRisk' ? 100 - s.value : s.value;
    total += value * w;
    weightSum += w;
  }
  if (!weightSum) return 50;
  return Math.round(total / weightSum);
}
