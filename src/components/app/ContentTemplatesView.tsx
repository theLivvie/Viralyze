'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  FileText,
  Instagram,
  Youtube,
  Tv,
  Twitter,
  Linkedin,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import type { Platform, ContentType, Classification } from '@/lib/types';
import { cn } from '@/lib/utils';
import QuickScoreWidget from '@/components/shared/QuickScoreWidget';

const platformIcons: Record<Platform, React.ElementType> = {
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Tv,
  x: Twitter,
  linkedin: Linkedin,
};

type TemplateCategory = 'Hooks' | 'Storytelling' | 'Educational' | 'Controversial' | 'Trending' | 'Behind the Scenes';

interface ContentTemplate {
  id: string;
  title: string;
  description: string;
  platform: Platform;
  contentType: ContentType;
  category: TemplateCategory;
  content: string;
  tags: string[];
  popularity: number;
  estimatedScore: number;
  classification: Classification;
}

const templates: ContentTemplate[] = [
  {
    id: 'hook-1',
    title: 'The "Stop Scrolling" Hook',
    description: 'Open with a bold, contrarian statement that immediately challenges a common belief in your niche.',
    platform: 'instagram',
    contentType: 'reel',
    category: 'Hooks',
    content: 'Everything you\'ve been told about [topic] is wrong. In the next 30 seconds, I\'m going to prove it — and show you what actually works. Save this before it gets taken down.',
    tags: ['hook', 'contrarian', 'pattern-interrupt'],
    popularity: 94,
    estimatedScore: 88,
    classification: 'viral',
  },
  {
    id: 'story-1',
    title: 'Origin Story with Twist',
    description: 'Share your personal journey with an unexpected setback that changed everything.',
    platform: 'youtube',
    contentType: 'video',
    category: 'Storytelling',
    content: 'Two years ago, I quit my 6-figure job to start this business. Within 3 months, I was broke, sleeping on a friend\'s couch, and ready to give up. Then one phone call changed everything. Here\'s the full story...',
    tags: ['storytelling', 'personal', 'origin'],
    popularity: 87,
    estimatedScore: 82,
    classification: 'high',
  },
  {
    id: 'edu-1',
    title: '3-Step Framework Reveal',
    description: 'Teach a simple but powerful 3-step framework that solves a painful problem in your niche.',
    platform: 'tiktok',
    contentType: 'short',
    category: 'Educational',
    content: 'Here\'s the exact 3-step framework I used to go from [before state] to [after state]:\n\nStep 1: [Action] — This is what 99% of people get wrong.\nStep 2: [Action] — The counterintuitive part that makes all the difference.\nStep 3: [Action] — The glue that holds it all together.\n\nFollow for more [niche] tips.',
    tags: ['educational', 'framework', 'tutorial'],
    popularity: 91,
    estimatedScore: 85,
    classification: 'viral',
  },
  {
    id: 'controv-1',
    title: 'Hot Take + Data Drop',
    description: 'State a controversial opinion, then back it up with surprising data or research.',
    platform: 'x',
    contentType: 'thread',
    category: 'Controversial',
    content: 'Unpopular opinion: [Bold claim about industry]\n\nI analyzed 1,000+ [content type] and the data is clear:\n\n→ [Stat 1 that surprises]\n→ [Stat 2 that contradicts common belief]\n→ [Stat 3 that recontextualizes]\n\nThe people who ignore this will be left behind.\n\nA thread 🧵',
    tags: ['controversial', 'data', 'hot-take'],
    popularity: 78,
    estimatedScore: 76,
    classification: 'high',
  },
  {
    id: 'trend-1',
    title: 'Trend Jack + Value Add',
    description: 'Ride a trending format but inject unique expertise that elevates it beyond the trend.',
    platform: 'instagram',
    contentType: 'reel',
    category: 'Trending',
    content: '[Trending audio/format]\n\nEveryone is doing [trend], but they\'re missing the real lesson.\n\nHere\'s what [trend] actually teaches us about [your expertise area]:\n\n1. [Insight 1]\n2. [Insight 2]\n3. [Insight 3]\n\nThe version you haven\'t seen yet →',
    tags: ['trending', 'value', 'trend-jacking'],
    popularity: 85,
    estimatedScore: 79,
    classification: 'high',
  },
  {
    id: 'bts-1',
    title: 'Raw Behind the Scenes',
    description: 'Show the unfiltered reality behind your work — failures, messes, and all.',
    platform: 'youtube',
    contentType: 'video',
    category: 'Behind the Scenes',
    content: 'What my work day ACTUALLY looks like (no filters):\n\n• 6:00am — Wake up, check analytics from yesterday\'s post (it flopped)\n• 7:30am — Film the 4th take because the lighting was wrong\n• 11:00am — Respond to 200+ DMs while eating cold coffee\n• 2:00pm — Realize the footage has audio issues, reshoot\n• 8:00pm — Finally hit publish\n\nThis is the reality nobody shows you.',
    tags: ['bts', 'authentic', 'vlog'],
    popularity: 82,
    estimatedScore: 74,
    classification: 'high',
  },
  {
    id: 'hook-2',
    title: 'The Curiosity Gap',
    description: 'Start mid-story at the most dramatic moment, then loop back to explain.',
    platform: 'tiktok',
    contentType: 'short',
    category: 'Hooks',
    content: 'I just made $47,000 from a single post — and it almost didn\'t happen.\n\nHere\'s the thing: I almost deleted it at 2am because I thought it was too honest.\n\nBut that\'s exactly why it worked...\n\n[Continue story]',
    tags: ['hook', 'curiosity', 'storytelling'],
    popularity: 89,
    estimatedScore: 86,
    classification: 'viral',
  },
  {
    id: 'edu-2',
    title: 'Myth vs Reality Carousel',
    description: 'Bust 5 common myths in your niche using a swipe-to-reveal carousel format.',
    platform: 'instagram',
    contentType: 'carousel',
    category: 'Educational',
    content: 'Slide 1: "5 [Niche] Myths That Are Costing You [Result]\"\nSlide 2: Myth #1 — [Common myth]\n→ Reality: [Truth with data]\nSlide 3: Myth #2 — [Common myth]\n→ Reality: [Truth with data]\nSlide 4: Myth #3 — [Common myth]\n→ Reality: [Truth with data]\nSlide 5: Myth #4 — [Common myth]\n→ Reality: [Truth with data]\nSlide 6: Myth #5 — [Common myth]\n→ Reality: [Truth with data]\nSlide 7: "Save this & share with someone who needs to hear it" + CTA',
    tags: ['educational', 'myth-busting', 'carousel'],
    popularity: 92,
    estimatedScore: 90,
    classification: 'viral',
  },
  {
    id: 'controv-2',
    title: 'The "Stop Doing This" Rant',
    description: 'Passionately call out a bad practice in your niche and provide the better alternative.',
    platform: 'linkedin',
    contentType: 'post',
    category: 'Controversial',
    content: 'Can we stop pretending that [bad practice] is working?\n\nI\'ve seen hundreds of [professionals/creators] do this, and the results are always the same: burnout and zero growth.\n\nHere\'s what to do instead:\n\n1. [Better approach 1]\n2. [Better approach 2]\n3. [Better approach 3]\n\nThe difference? [Measurable result].\n\nAgree or disagree?',
    tags: ['controversial', 'rant', 'professional'],
    popularity: 71,
    estimatedScore: 68,
    classification: 'moderate',
  },
  {
    id: 'bts-2',
    title: 'The Process Breakdown',
    description: 'Reveal your exact creative process step-by-step with timestamps and real numbers.',
    platform: 'youtube',
    contentType: 'video',
    category: 'Behind the Scenes',
    content: 'How I create a [content type] from scratch (full process):\n\n0:00 — Research & ideation (45 min)\n2:30 — Scripting & outlining (1.5 hours)\n6:00 — Setup & filming (3 hours)\n12:00 — Editing & effects (4 hours)\n18:00 — Thumbnail design (30 min)\n20:00 — SEO & caption writing (20 min)\n\nTotal: ~10 hours for one piece of content.\n\nWorth it? Last one got [X views/results].',
    tags: ['bts', 'process', 'transparent'],
    popularity: 80,
    estimatedScore: 77,
    classification: 'high',
  },
];

const categories: TemplateCategory[] = [
  'Hooks',
  'Storytelling',
  'Educational',
  'Controversial',
  'Trending',
  'Behind the Scenes',
];

const categoryColors: Record<TemplateCategory, string> = {
  Hooks: 'border-wine-accent/40 text-wine-accent bg-wine-accent/10',
  Storytelling: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
  Educational: 'border-blue-400/40 text-blue-400 bg-blue-400/10',
  Controversial: 'border-red-400/40 text-red-400 bg-red-500/10',
  Trending: 'border-emerald-400/40 text-emerald-400 bg-emerald-400/10',
  'Behind the Scenes': 'border-purple-400/40 text-purple-400 bg-purple-400/10',
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function ContentTemplatesView() {
  const { setPrefilledIdea, setPredictMode, setPredictPlatform, setPredictContentType, setCurrentView } = useAppStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (activeCategory !== 'all' && t.category !== activeCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [search, activeCategory]);

  const handleUseTemplate = (template: ContentTemplate) => {
    setPredictMode('idea');
    setPredictPlatform(template.platform);
    setPredictContentType(template.contentType);
    setPrefilledIdea(template.content);
    setCurrentView('predict');
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl md:text-3xl font-bold text-viralyze-white">
              Content Templates
            </h2>
            <Badge
              variant="outline"
              className="text-xs border-wine-accent/30 text-wine-accent bg-wine-accent/10 tabular-nums"
            >
              {templates.length}
            </Badge>
          </div>
          <p className="text-viralyze-muted mt-1">
            Ready-to-use viral content frameworks curated by our AI
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-viralyze-muted" />
        <Input
          placeholder="Search templates by title, description, or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white/[0.05] border-white/[0.08] text-viralyze-white placeholder:text-viralyze-muted/40 focus-visible:ring-wine-accent hover:border-white/[0.12] transition-colors"
        />
      </motion.div>

      {/* Category Filters */}
      <motion.div variants={item} className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border',
            activeCategory === 'all'
              ? 'bg-wine-accent/20 border-wine-accent/40 text-wine-accent'
              : 'bg-white/[0.03] border-white/[0.08] text-viralyze-muted hover:bg-white/[0.06] hover:text-viralyze-white'
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border',
              activeCategory === cat
                ? categoryColors[cat]
                : 'bg-white/[0.03] border-white/[0.08] text-viralyze-muted hover:bg-white/[0.06] hover:text-viralyze-white'
            )}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Templates Grid */}
      {filtered.length === 0 ? (
        <motion.div variants={item}>
          <Card className="glass">
            <CardContent className="p-12 flex flex-col items-center gap-3 text-center">
              <FileText className="h-10 w-10 text-viralyze-muted/40" />
              <p className="text-viralyze-muted text-sm">No templates match your search</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((template) => {
            const PIcon = platformIcons[template.platform];
            return (
              <motion.div key={template.id} variants={item}>
                <Card className="glass group hover:bg-white/[0.03] hover:glow-wine-sm transition-all duration-300">
                  <CardContent className="p-5 flex flex-col gap-3">
                    {/* Title row with score widget */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-viralyze-white text-sm leading-snug">
                          {template.title}
                        </h3>
                      </div>
                      <QuickScoreWidget
                        score={template.estimatedScore}
                        size="sm"
                        classification={template.classification}
                      />
                    </div>

                    {/* Description */}
                    <p className="text-sm text-viralyze-muted leading-relaxed">
                      {template.description}
                    </p>

                    {/* Platform + Category */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs text-viralyze-muted">
                        <PIcon className="h-3.5 w-3.5" />
                        <span className="capitalize">{template.platform}</span>
                        <span className="mx-0.5">·</span>
                        <span>{template.contentType}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] px-1.5 py-0', categoryColors[template.category])}
                      >
                        {template.category}
                      </Badge>
                    </div>

                    {/* Content Preview */}
                    <p className="text-xs text-viralyze-muted/70 leading-relaxed line-clamp-2 bg-white/[0.02] rounded-md p-2.5">
                      {template.content}
                    </p>

                    {/* Tags + Popularity */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-viralyze-muted border border-white/[0.06]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Popularity bar */}
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-viralyze-muted/50 shrink-0" />
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${template.popularity}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded-full bg-wine-accent/60"
                        />
                      </div>
                      <span className="text-[10px] tabular-nums text-viralyze-muted/50">{template.popularity}%</span>
                    </div>

                    {/* Use Template button */}
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-gradient-wine hover:opacity-90 text-white opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Use Template
                    </Button>
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
