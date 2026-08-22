import { getZAI } from '@/lib/zai';
import type { Platform } from '@/lib/types';
import { asArray, asRecord, asString, extractJSON } from './json';
import {
  PLATFORM_LABELS,
  PLATFORM_METRIC_KEYS,
  PLATFORM_PERSONAS,
  PLATFORM_PRIORITIES,
  clampConfidence,
  clampScore,
  computeWeightedOverall,
  formatPersonaForAudience,
} from './platform-intel';
import type {
  ActionableRecommendation,
  AudienceConsensus,
  AudienceDna,
  AudienceSimulationResult,
  CrossPlatformRow,
  ExplainableScore,
  PacingPoint,
  PersonaReaction,
  PersonaSelection,
  PlatformPrediction,
  PrimaryIssue,
  RemixResult,
  Sentiment,
  SimulatorContentKind,
  SkippedPersona,
  VersionMetrics,
} from './types';

const SCORE_DEFS: { key: string; label: string }[] = [
  { key: 'viralPotential', label: 'Viral Potential' },
  { key: 'engagementPotential', label: 'Engagement Potential' },
  { key: 'hookStrength', label: 'Hook Strength' },
  { key: 'emotionalImpact', label: 'Emotional Impact' },
  { key: 'pacing', label: 'Pacing' },
  { key: 'humor', label: 'Humor' },
  { key: 'tension', label: 'Tension' },
  { key: 'storyConsistency', label: 'Consistency' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'audienceRelevance', label: 'Audience Relevance' },
  { key: 'shareability', label: 'Shareability' },
  { key: 'retentionRisk', label: 'Retention Risk' },
];

async function completeJson(system: string, user: string, temperature = 0.7): Promise<Record<string, unknown>> {
  const zai = await getZAI();
  const completion = await zai.chat.completions.create({
    model: process.env.Z_AI_MODEL || 'glm-4.7-flash',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    stream: false,
    thinking: { type: 'disabled' },
    response_format: { type: 'json_object' },
    temperature,
    max_tokens: 6000,
  });

  const raw = completion?.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error('AI returned an empty response.');
  }
  const parsed = extractJSON(typeof raw === 'string' ? raw : String(raw));
  if (!parsed) {
    throw new Error('Failed to parse AI response as JSON.');
  }
  return parsed;
}

function dnaContext(dna: AudienceDna): string {
  const lines = dna.fields
    .filter((f) => f.origin !== 'unavailable')
    .map((f) => `- ${f.label}: ${f.value} [${f.origin === 'demo' ? 'DEMO DATA' : f.origin === 'authorized' ? 'AUTHORIZED API' : 'AI-DERIVED'}]`)
    .join('\n');
  return `Audience source: ${dna.source === 'demo' ? 'DEMO (simulated for demonstration)' : 'Connected account (authorized fields only)'}
Handle: ${dna.connectedHandle || 'n/a'}
Summary: ${dna.summary}
Available audience DNA:
${lines || '(no quantitative audience fields available)'}

Never treat demo fields as real analytics. If a field is unavailable, do not invent user analytics.`;
}

function personaCatalog(platform: Platform): string {
  return PLATFORM_PERSONAS[platform]
    .map((p) => `- id=${p.id}; name=${p.name}; focus=${p.focus.join(', ')}`)
    .join('\n');
}

export async function understandSelectAndScore(params: {
  content: string;
  platform: Platform;
  contentKind: SimulatorContentKind;
  dna: AudienceDna;
}): Promise<{
  contentUnderstanding: string;
  personaSelection: PersonaSelection[];
  skippedPersonas: SkippedPersona[];
  scores: ExplainableScore[];
  platformPrediction: PlatformPrediction;
  crossPlatform: AudienceSimulationResult['crossPlatform'];
}> {
  const { content, platform, contentKind, dna } = params;
  const metricKeys = PLATFORM_METRIC_KEYS[platform];

  const system = `You are Viralyze's content-understanding and persona-selection engine.
Respond with ONLY valid JSON. No markdown.

You MUST:
- Understand the content first.
- Apply ${PLATFORM_LABELS[platform]}-specific priorities: ${PLATFORM_PRIORITIES[platform].join(', ')}.
- Select 4 most relevant personas from the catalog. Skip personas that do not apply. Always skip lore/detail personas unless the content has world-building, continuity, or established character history.
- Do not select every persona by default.
- Score 0-100. Be honest. Do not inflate.
- Every score needs what/why/impact/action.
- Cross-platform scores MUST differ by platform; do not copy the same numbers.

JSON shape:
{
  "contentUnderstanding": "2-4 sentences",
  "selectedPersonas": [{"id":"","name":"","reason":""}],
  "skippedPersonas": [{"id":"","name":"","reason":""}],
  "scores": {
    "viralPotential": {"value":0,"what":"","why":"","impact":"","action":"","audienceEvidence":""},
    "engagementPotential": {"value":0,"what":"","why":"","impact":"","action":"","audienceEvidence":""},
    "hookStrength": {"value":0,"what":"","why":"","impact":"","action":"","audienceEvidence":""},
    "emotionalImpact": {"value":0,"what":"","why":"","impact":"","action":"","audienceEvidence":""},
    "pacing": {"value":0,"what":"","why":"","impact":"","action":"","audienceEvidence":""},
    "humor": {"value":0,"what":"","why":"","impact":"","action":"","audienceEvidence":""},
    "tension": {"value":0,"what":"","why":"","impact":"","action":"","audienceEvidence":""},
    "storyConsistency": {"value":0,"what":"","why":"","impact":"","action":"","audienceEvidence":""},
    "clarity": {"value":0,"what":"","why":"","impact":"","action":"","audienceEvidence":""},
    "audienceRelevance": {"value":0,"what":"","why":"","impact":"","action":"","audienceEvidence":""},
    "shareability": {"value":0,"what":"","why":"","impact":"","action":"","audienceEvidence":""},
    "retentionRisk": {"value":0,"what":"","why":"","impact":"","action":"","audienceEvidence":""}
  },
  "platformMetrics": { ${metricKeys.map((m) => `"${m.key}": 0`).join(', ')} },
  "primaryRisk": "",
  "primaryRiskWhy": "",
  "crossPlatform": {
    "instagram": {"hook":0,"engagement":0,"shareability":0,"retention":0},
    "youtube": {"hook":0,"engagement":0,"shareability":0,"retention":0},
    "tiktok": {"hook":0,"engagement":0,"shareability":0,"retention":0},
    "x": {"hook":0,"engagement":0,"shareability":0,"retention":0},
    "linkedin": {"hook":0,"engagement":0,"shareability":0,"retention":0},
    "bestFit": "instagram|youtube|tiktok|x|linkedin",
    "explanation": ""
  }
}`;

  const user = `PLATFORM: ${PLATFORM_LABELS[platform]}
CONTENT KIND: ${contentKind}
${dnaContext(dna)}

PERSONA CATALOG:
${personaCatalog(platform)}

CONTENT:
"""
${content}
"""

Select personas autonomously. If this is a short betrayal/twist scene with no established lore, skip lore-focused personas.`;

  const raw = await completeJson(system, user, 0.55);
  const catalog = PLATFORM_PERSONAS[platform];
  const selectedRaw = asArray<Record<string, unknown>>(raw.selectedPersonas);
  const skippedRaw = asArray<Record<string, unknown>>(raw.skippedPersonas);

  let personaSelection: PersonaSelection[] = selectedRaw
    .map((row) => {
      const id = asString(row.id);
      const match = catalog.find((p) => p.id === id) || catalog.find((p) => p.name === asString(row.name));
      if (!match) return null;
      return {
        id: match.id,
        name: match.name,
        emoji: match.emoji,
        reason: asString(row.reason, 'Relevant to this content and platform.'),
      };
    })
    .filter((p): p is PersonaSelection => Boolean(p));

  if (personaSelection.length < 3) {
    personaSelection = catalog.slice(0, 4).map((p) => ({
      id: p.id,
      name: p.name,
      emoji: p.emoji,
      reason: 'Selected as a core platform audience for this content.',
    }));
  }
  personaSelection = personaSelection.slice(0, 5);

  const selectedIds = new Set(personaSelection.map((p) => p.id));
  const skippedPersonas: SkippedPersona[] = catalog
    .filter((p) => !selectedIds.has(p.id))
    .map((p) => {
      const fromAi = skippedRaw.find((s) => asString(s.id) === p.id || asString(s.name) === p.name);
      return {
        id: p.id,
        name: p.name,
        reason: asString(
          fromAi?.reason,
          p.id.includes('lore') || p.name.toLowerCase().includes('lore')
            ? 'The submitted content does not contain enough story/world-building information for lore analysis.'
            : 'Less relevant than the selected audience perspectives for this content.'
        ),
      };
    });

  const scoresObj = asRecord(raw.scores);
  const scores: ExplainableScore[] = SCORE_DEFS.map((def) => {
    const row = asRecord(scoresObj[def.key]);
    return {
      key: def.key,
      label: def.label,
      value: clampScore(row.value, 55),
      what: asString(row.what, `Detected ${def.label.toLowerCase()} relative to ${PLATFORM_LABELS[platform]} norms.`),
      why: asString(row.why, 'Based on content structure and platform audience behavior.'),
      impact: asString(row.impact, 'This affects how the selected audience is likely to stay or drop off.'),
      action: asString(row.action, 'Tighten the opening and make the payoff earlier.'),
      audienceEvidence: asString(row.audienceEvidence) || undefined,
    };
  });

  const metricsRaw = asRecord(raw.platformMetrics);
  const metrics: Record<string, number> = {};
  for (const m of metricKeys) {
    metrics[m.key] = clampScore(metricsRaw[m.key], 60);
  }

  const cp = asRecord(raw.crossPlatform);
  const platforms: Platform[] = ['instagram', 'youtube', 'tiktok', 'x', 'linkedin'];
  const rows: CrossPlatformRow[] = ['hook', 'engagement', 'shareability', 'retention'].map((metric) => {
    const row: CrossPlatformRow = {
      metric: metric.charAt(0).toUpperCase() + metric.slice(1),
      instagram: 0,
      youtube: 0,
      tiktok: 0,
      x: 0,
      linkedin: 0,
    };
    for (const p of platforms) {
      const obj = asRecord(cp[p]);
      row[p] = clampScore(obj[metric], 60);
    }
    return row;
  });

  const bestFitRaw = asString(cp.bestFit, platform);
  const bestFit = platforms.includes(bestFitRaw as Platform) ? (bestFitRaw as Platform) : platform;

  return {
    contentUnderstanding: asString(
      raw.contentUnderstanding,
      'The content presents a high-stakes moment that may under-explain character motivation.'
    ),
    personaSelection,
    skippedPersonas,
    scores,
    platformPrediction: {
      platform,
      metrics,
      primaryRisk: asString(raw.primaryRisk, 'Retention'),
      primaryRiskWhy: asString(
        raw.primaryRiskWhy,
        'The strongest moment may arrive too late for this platform’s attention pattern.'
      ),
    },
    crossPlatform: {
      rows,
      bestFit,
      explanation: asString(
        cp.explanation,
        `Best fit is ${PLATFORM_LABELS[bestFit]} based on hook immediacy versus professional or long-form requirements.`
      ),
    },
  };
}

function normalizeSentiment(v: unknown): Sentiment {
  const s = asString(v, 'neutral').toLowerCase();
  if (s === 'positive' || s === 'negative' || s === 'neutral') return s;
  return 'neutral';
}

export function aggregateReactions(reactions: PersonaReaction[]): AudienceConsensus {
  const total = Math.max(reactions.length, 1);
  const positive = Math.round((reactions.filter((r) => r.sentiment === 'positive').length / total) * 100);
  const negative = Math.round((reactions.filter((r) => r.sentiment === 'negative').length / total) * 100);
  const neutral = Math.max(0, 100 - positive - negative);

  const concerns = reactions
    .map((r) => (r.keyConcern || r.reason || '').trim())
    .filter(Boolean);
  const mostCommonConcern = modeString(concerns) || 'Setup and motivation are unclear.';

  const likes = reactions
    .filter((r) => r.sentiment !== 'negative')
    .map((r) => r.reaction)
    .filter(Boolean);
  const mostAppreciated = likes[0] ? summarizeLike(likes[0]) : 'The core idea has shock value.';

  const weakest = [...reactions].sort((a, b) => a.clarity_score - b.clarity_score)[0];
  const biggestRisk = weakest
    ? `${weakest.personaLabel} may drop off: ${weakest.keyConcern || weakest.reason}`
    : 'Early audience drop-off.';

  return { positive, neutral, negative, mostAppreciated, mostCommonConcern, biggestRisk };
}

function summarizeLike(reaction: string): string {
  if (/twist|shock|unexpected/i.test(reaction)) return 'Unexpected twist';
  if (/hook|open/i.test(reaction)) return 'Opening energy';
  return reaction.slice(0, 80);
}

function modeString(items: string[]): string | null {
  if (!items.length) return null;
  const map = new Map<string, number>();
  for (const item of items) {
    const key = item.toLowerCase();
    map.set(key, (map.get(key) || 0) + 1);
  }
  let best = items[0];
  let bestN = 0;
  for (const item of items) {
    const n = map.get(item.toLowerCase()) || 0;
    if (n > bestN) {
      best = item;
      bestN = n;
    }
  }
  return best;
}

export async function simulateAndDecide(params: {
  content: string;
  platform: Platform;
  dna: AudienceDna;
  contentUnderstanding: string;
  selected: PersonaSelection[];
}): Promise<{
  reactions: PersonaReaction[];
  consensus: AudienceConsensus;
  primaryIssue: PrimaryIssue;
  recommendation: ActionableRecommendation;
  pacingGraph: PacingPoint[];
}> {
  const { content, platform, dna, contentUnderstanding, selected } = params;
  const catalog = PLATFORM_PERSONAS[platform];

  const system = `You are Viralyze's audience simulation engine.
Respond with ONLY valid JSON.

RULES:
- Simulate EACH selected persona independently. Reactions MUST be meaningfully different in tone, concern, and scores.
- Do not generate five paraphrases of the same comment.
- Use ${PLATFORM_LABELS[platform]} behavior. Example concerns:
  Instagram: visual hook vs delayed payoff.
  YouTube: first 20 seconds too slow.
  TikTok: strongest moment too late.
  X: no reason to reply.
  LinkedIn: professional takeaway unclear.
- Sentiment must vary when personas would actually disagree.
- confidence is 0-1.
- Scores 0-100.
- After simulations, identify ONE primary issue autonomously from the reactions (majority concern). Provide evidence like "4/5 personas...".
- Recommendation must be specific and actionable.
- pacingGraph: 6-8 beats.

JSON:
{
  "reactions": [
    {
      "personaId": "",
      "sentiment": "positive|neutral|negative",
      "reaction": "short in-character quote",
      "reason": "",
      "engagement_score": 0,
      "clarity_score": 0,
      "emotional_score": 0,
      "confidence": 0.0,
      "recommendation": "",
      "keyConcern": ""
    }
  ],
  "primaryIssue": {
    "title": "",
    "confidence": 0.0,
    "evidence": "",
    "affectedAudiences": [],
    "priority": "HIGH|MEDIUM|LOW",
    "evidenceCount": 0,
    "totalPersonas": 0
  },
  "recommendation": {
    "title": "",
    "problem": "",
    "evidence": "",
    "impact": "",
    "recommendedAction": "",
    "priority": "HIGH|MEDIUM|LOW"
  },
  "pacingGraph": [
    {"moment": "Opening", "tension": 0, "emotion": 0, "humor": 0, "engagement": 0}
  ]
}`;

  const user = `PLATFORM: ${PLATFORM_LABELS[platform]}
${dnaContext(dna)}

CONTENT UNDERSTANDING:
${contentUnderstanding}

SELECTED PERSONAS (simulate only these):
${selected
  .map((p) => {
    const base = catalog.find((c) => c.id === p.id);
    const label = base ? formatPersonaForAudience(base, dna) : p.name;
    return `- ${p.id} | ${label} | why selected: ${p.reason} | focus: ${(base?.focus || []).join(', ')}`;
  })
  .join('\n')}

CONTENT:
"""
${content}
"""`;

  const raw = await completeJson(system, user, 0.75);
  const reactionRows = asArray<Record<string, unknown>>(raw.reactions);

  const reactions: PersonaReaction[] = selected.map((sel, i) => {
    const row =
      reactionRows.find((r) => asString(r.personaId) === sel.id) ||
      reactionRows[i] ||
      {};
    const base = catalog.find((c) => c.id === sel.id);
    return {
      persona: sel.name,
      personaId: sel.id,
      personaLabel: base ? formatPersonaForAudience(base, dna) : `${PLATFORM_LABELS[platform]} ${sel.name}`,
      emoji: sel.emoji,
      sentiment: normalizeSentiment(row.sentiment),
      reaction: asString(row.reaction, 'I’m not sure how to feel about this yet.'),
      reason: asString(row.reason, 'The content leaves motivation under-explained.'),
      engagement_score: clampScore(row.engagement_score, 60),
      clarity_score: clampScore(row.clarity_score, 55),
      emotional_score: clampScore(row.emotional_score, 60),
      confidence: clampConfidence(row.confidence, 0.75),
      recommendation: asString(row.recommendation, 'Clarify motivation earlier.'),
      keyConcern: asString(row.keyConcern) || undefined,
    };
  });

  const consensus = aggregateReactions(reactions);
  const issueRaw = asRecord(raw.primaryIssue);
  const recRaw = asRecord(raw.recommendation);

  const negativeOrConfused = reactions.filter(
    (r) =>
      r.sentiment === 'negative' ||
      r.clarity_score < 60 ||
      /setup|motivat|confus|late|unclear|payoff|takeaway/i.test(`${r.reason} ${r.keyConcern || ''}`)
  );

  const primaryIssue: PrimaryIssue = {
    title: asString(issueRaw.title, 'Insufficient Story Setup'),
    confidence: clampConfidence(issueRaw.confidence, Math.min(0.95, 0.55 + negativeOrConfused.length * 0.08)),
    evidence: asString(
      issueRaw.evidence,
      `${negativeOrConfused.length}/${reactions.length} simulated audience personas identified setup, motivation, or delayed payoff as a concern.`
    ),
    affectedAudiences: asArray<string>(issueRaw.affectedAudiences).length
      ? asArray<string>(issueRaw.affectedAudiences).map(String)
      : negativeOrConfused.map((r) => r.persona),
    priority: (['HIGH', 'MEDIUM', 'LOW'].includes(asString(issueRaw.priority))
      ? asString(issueRaw.priority)
      : negativeOrConfused.length >= Math.ceil(reactions.length * 0.5)
        ? 'HIGH'
        : 'MEDIUM') as PrimaryIssue['priority'],
    evidenceCount: Number(issueRaw.evidenceCount) || negativeOrConfused.length,
    totalPersonas: Number(issueRaw.totalPersonas) || reactions.length,
  };

  const recommendation: ActionableRecommendation = {
    title: asString(recRaw.title, primaryIssue.title),
    problem: asString(recRaw.problem, 'The turning point happens without earned setup.'),
    evidence: asString(recRaw.evidence, primaryIssue.evidence),
    impact: asString(
      recRaw.impact,
      'The moment may feel random instead of emotionally satisfying, increasing drop-off.'
    ),
    recommendedAction: asString(
      recRaw.recommendedAction,
      'Add a subtle indication of internal conflict earlier so the turn feels earned without spoiling it.'
    ),
    priority: (['HIGH', 'MEDIUM', 'LOW'].includes(asString(recRaw.priority))
      ? asString(recRaw.priority)
      : primaryIssue.priority) as ActionableRecommendation['priority'],
  };

  const pacingRaw = asArray<Record<string, unknown>>(raw.pacingGraph);
  const defaultMoments = ['Opening', 'Setup', 'Rising', 'Turn', 'Peak', 'Aftermath'];
  const pacingGraph: PacingPoint[] = (pacingRaw.length ? pacingRaw : defaultMoments.map((m) => ({ moment: m }))).map(
    (row, i) => ({
      moment: asString(row.moment, defaultMoments[i] || `Beat ${i + 1}`),
      tension: clampScore(row.tension, 30 + i * 10),
      emotion: clampScore(row.emotion, 25 + i * 8),
      humor: clampScore(row.humor, 20),
      engagement: clampScore(row.engagement, 35 + i * 8),
    })
  );

  return { reactions, consensus, primaryIssue, recommendation, pacingGraph };
}

export async function remixContent(params: {
  content: string;
  platform: Platform;
  primaryIssue: PrimaryIssue;
  recommendation: ActionableRecommendation;
}): Promise<RemixResult> {
  const { content, platform, primaryIssue, recommendation } = params;
  const system = `You are Viralyze's content remix engine.
Respond with ONLY valid JSON: {"improvedContent":"","changeExplanation":""}

Preserve core idea, creator intent, tone, characters, main message, and important events.
Do not completely rewrite unless the original is a single sentence — then expand it slightly to fix the issue.
The change should specifically address: ${primaryIssue.title}.
Recommended action: ${recommendation.recommendedAction}.
Write for ${PLATFORM_LABELS[platform]}.`;

  const user = `ORIGINAL CONTENT:
"""
${content}
"""`;

  const raw = await completeJson(system, user, 0.6);
  return {
    originalContent: content,
    improvedContent: asString(raw.improvedContent, content),
    changeExplanation: asString(
      raw.changeExplanation,
      'Added a subtle motivation cue so the turning point feels earned without revealing the twist.'
    ),
  };
}

export function metricsFromSimulation(
  scores: ExplainableScore[],
  reactions: PersonaReaction[]
): VersionMetrics {
  const get = (key: string, fallback: number) =>
    scores.find((s) => s.key === key)?.value ?? fallback;
  const avg = (pick: (r: PersonaReaction) => number) =>
    reactions.length
      ? Math.round(reactions.reduce((s, r) => s + pick(r), 0) / reactions.length)
      : fallbackAvg(get);

  function fallbackAvg(fn: (k: string, f: number) => number) {
    return Math.round((fn('clarity', 55) + fn('engagementPotential', 60)) / 2);
  }

  return {
    clarity: Math.round((get('clarity', 55) + avg((r) => r.clarity_score)) / 2),
    consistency: get('storyConsistency', 60),
    emotion: Math.round((get('emotionalImpact', 60) + avg((r) => r.emotional_score)) / 2),
    pacing: get('pacing', 55),
    engagement: Math.round((get('engagementPotential', 60) + avg((r) => r.engagement_score)) / 2),
  };
}

export async function runFullSimulation(params: {
  content: string;
  platform: Platform;
  contentKind: SimulatorContentKind;
  dna: AudienceDna;
}): Promise<Omit<AudienceSimulationResult, 'remix' | 'comparison' | 'analysisId'>> {
  const understood = await understandSelectAndScore(params);
  const simulated = await simulateAndDecide({
    content: params.content,
    platform: params.platform,
    dna: params.dna,
    contentUnderstanding: understood.contentUnderstanding,
    selected: understood.personaSelection,
  });

  return {
    content: params.content,
    platform: params.platform,
    contentKind: params.contentKind,
    audienceSource: params.dna.source,
    audienceDna: params.dna,
    contentUnderstanding: understood.contentUnderstanding,
    personaSelection: understood.personaSelection,
    skippedPersonas: understood.skippedPersonas,
    scores: understood.scores,
    weightedOverall: computeWeightedOverall(params.platform, understood.scores),
    platformPrediction: understood.platformPrediction,
    reactions: simulated.reactions,
    consensus: simulated.consensus,
    primaryIssue: simulated.primaryIssue,
    recommendation: simulated.recommendation,
    pacingGraph: simulated.pacingGraph,
    crossPlatform: understood.crossPlatform,
  };
}
