'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X, Instagram, Youtube, Tv, Twitter, Linkedin, Clock, Sparkles, CalendarDays, Bookmark, StickyNote, Sun, SunDim, Moon, GripVertical, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Platform, ContentType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

const platformIcons: Record<Platform, React.ElementType> = {
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Tv,
  x: Twitter,
  linkedin: Linkedin,
};

interface CalendarSlot {
  id: string;
  title: string;
  platform: Platform;
  time: string;
  contentType: ContentType;
  note?: string;
  date: string;
  analysisId?: string | null;
}

type WeekSlots = Record<string, CalendarSlot[]>;

const SLOT_LIMIT = 3;

const contentTypeColors: Record<string, string> = {
  reel: 'border-l-wine-accent',
  video: 'border-l-wine-accent',
  short: 'border-l-wine-accent',
  post: 'border-l-emerald-500',
  image: 'border-l-emerald-500',
  thread: 'border-l-emerald-500',
  story: 'border-l-amber-500',
  article: 'border-l-blue-500',
  carousel: 'border-l-purple-500',
};

const contentTypeGradients: Record<string, string> = {
  reel: 'bg-gradient-to-br from-wine-accent/8 to-transparent',
  video: 'bg-gradient-to-br from-wine-accent/6 to-transparent',
  short: 'bg-gradient-to-br from-wine-accent/8 to-transparent',
  post: 'bg-gradient-to-br from-emerald-500/6 to-transparent',
  image: 'bg-gradient-to-br from-emerald-500/6 to-transparent',
  thread: 'bg-gradient-to-br from-emerald-500/6 to-transparent',
  story: 'bg-gradient-to-br from-amber-500/6 to-transparent',
  article: 'bg-gradient-to-br from-blue-500/6 to-transparent',
  carousel: 'bg-gradient-to-br from-purple-500/6 to-transparent',
};

function getTimeOfDayIcon(timeStr: string) {
  if (!timeStr) return Clock;
  const hour = parseInt(timeStr.split(':')[0], 10);
  if (hour >= 5 && hour < 12) return Sun;
  if (hour >= 12 && hour < 18) return SunDim;
  return Moon;
}

function getTimeOfDayColor(timeStr: string) {
  if (!timeStr) return 'text-viralyze-muted';
  const hour = parseInt(timeStr.split(':')[0], 10);
  if (hour >= 5 && hour < 12) return 'text-amber-400';
  if (hour >= 12 && hour < 18) return 'text-orange-400';
  return 'text-purple-400';
}

function getWeekDays(weekOffset: number): Date[] {
  const now = new Date();
  const currentDay = now.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function dateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

function formatDayLabel(d: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const dayHeaderGradients = [
  'from-amber-900/20 to-transparent',
  'from-orange-900/15 to-transparent',
  'from-viralyze-muted/10 to-transparent',
  'from-viralyze-muted/10 to-transparent',
  'from-wine-accent/20 to-transparent',
  'from-wine-deep/25 to-transparent',
  'from-wine/30 to-transparent',
];

function isToday(d: Date): boolean {
  const today = new Date();
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface DBEvent {
  id: string;
  title: string;
  date: string;
  time: string | null;
  platform: string;
  contentType: string;
  notes: string | null;
  analysisId: string | null;
}

function eventsToWeekSlots(events: DBEvent[]): WeekSlots {
  const slots: WeekSlots = {};
  for (const ev of events) {
    const key = ev.date;
    if (!slots[key]) slots[key] = [];
    slots[key].push({
      id: ev.id,
      title: ev.title,
      platform: ev.platform as Platform,
      time: ev.time || '',
      contentType: ev.contentType as ContentType,
      note: ev.notes || undefined,
      date: ev.date,
      analysisId: ev.analysisId,
    });
  }
  return slots;
}

export default function CalendarView() {
  const userId = useAppStore((s) => s.user?.id);
  const [weekOffset, setWeekOffset] = useState(0);
  const [slots, setSlots] = useState<WeekSlots>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState<Platform>('instagram');
  const [newTime, setNewTime] = useState('09:00');
  const [newContentType, setNewContentType] = useState<ContentType>('reel');
  const [libraryDropdownOpen, setLibraryDropdownOpen] = useState(false);

  // Mobile 3-day page
  const [mobilePage, setMobilePage] = useState(0);

  // Note dialog state
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteDialogDay, setNoteDialogDay] = useState<string | null>(null);
  const [noteDialogSlotId, setNoteDialogSlotId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const savedAnalyses = useAppStore((s) => s.savedAnalyses);
  const recentAnalyses = savedAnalyses.slice(0, 5);

  const days = getWeekDays(weekOffset);

  // Fetch events from DB
  const fetchEvents = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/calendar?userId=${userId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch calendar events');
      }
      const events: DBEvent[] = await res.json();
      setSlots(eventsToWeekSlots(events));
    } catch (err) {
      console.error('Calendar fetch error:', err);
      setError('Failed to load calendar events');
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void fetchEvents();
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [fetchEvents]);

  const addSlot = useCallback(async () => {
    if (!activeDay || !newTitle.trim() || !userId) return;
    const daySlots = slots[activeDay] || [];
    if (daySlots.length >= SLOT_LIMIT) return;
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: newTitle.trim(),
          date: activeDay,
          time: newTime,
          platform: newPlatform,
          contentType: newContentType,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create event');
      }
      const created: DBEvent = await res.json();
      const newSlot: CalendarSlot = {
        id: created.id,
        title: created.title,
        date: created.date,
        platform: created.platform as Platform,
        time: created.time || newTime,
        contentType: created.contentType as ContentType,
        note: created.notes || undefined,
        analysisId: created.analysisId,
      };
      setSlots((prev) => ({ ...prev, [activeDay]: [...(prev[activeDay] || []), newSlot] }));
      setNewTitle('');
      setNewTime('09:00');
      setNewPlatform('instagram');
      setNewContentType('reel');
      toast.success('Event added to calendar');
    } catch (err) {
      console.error('Calendar add error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to add event');
    }
  }, [activeDay, newTitle, newPlatform, newTime, newContentType, slots, userId]);

  const addSlotFromAnalysis = useCallback(async (analysis: { title: string; platform: Platform; id: string }) => {
    if (!activeDay || !userId) return;
    const daySlots = slots[activeDay] || [];
    if (daySlots.length >= SLOT_LIMIT) return;
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: analysis.title,
          date: activeDay,
          time: newTime,
          platform: analysis.platform,
          contentType: newContentType,
          analysisId: analysis.id,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create event');
      }
      const created: DBEvent = await res.json();
      const newSlot: CalendarSlot = {
        id: created.id,
        title: created.title,
        date: created.date,
        platform: created.platform as Platform,
        time: created.time || newTime,
        contentType: created.contentType as ContentType,
        note: created.notes || undefined,
        analysisId: created.analysisId,
      };
      setSlots((prev) => ({ ...prev, [activeDay]: [...(prev[activeDay] || []), newSlot] }));
      setLibraryDropdownOpen(false);
      setActiveDay(null);
      toast.success('Analysis linked to calendar');
    } catch (err) {
      console.error('Calendar add from analysis error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to add event');
    }
  }, [activeDay, newTime, newContentType, slots, userId]);

  const removeSlot = useCallback(async (dayKey: string, slotId: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/calendar?id=${slotId}&userId=${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete event');
      }
      setSlots((prev) => {
        const daySlots = (prev[dayKey] || []).filter((s) => s.id !== slotId);
        const updated = { ...prev, [dayKey]: daySlots };
        if (daySlots.length === 0) delete updated[dayKey];
        return updated;
      });
      toast.success('Event removed');
    } catch (err) {
      console.error('Calendar delete error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete event');
    }
  }, [userId]);

  const openNoteDialog = useCallback((dayKey: string) => {
    setNoteDialogDay(dayKey);
    const daySlots = slots[dayKey];
    if (daySlots && daySlots.length > 0 && daySlots[0].note) {
      setNoteText(daySlots[0].note);
      setNoteDialogSlotId(daySlots[0].id);
    } else {
      setNoteText('');
      setNoteDialogSlotId(daySlots && daySlots.length > 0 ? daySlots[0].id : null);
    }
    setNoteDialogOpen(true);
  }, [slots]);

  const saveNote = useCallback(async () => {
    if (!noteDialogDay || !userId) return;
    if (!noteText.trim()) { setNoteDialogOpen(false); return; }
    try {
      if (noteDialogSlotId) {
        // Update existing event's notes
        const res = await fetch('/api/calendar', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: noteDialogSlotId, notes: noteText.trim() }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update note');
        }
        setSlots((prev) => {
          const daySlots = (prev[noteDialogDay] || []).map((s) =>
            s.id === noteDialogSlotId ? { ...s, note: noteText.trim() } : s
          );
          return { ...prev, [noteDialogDay]: daySlots };
        });
      } else {
        // Create new event with note
        const res = await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            title: noteText.trim(),
            date: noteDialogDay,
            time: '00:00',
            platform: 'instagram',
            contentType: 'post',
            notes: noteText.trim(),
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to save note');
        }
        const created: DBEvent = await res.json();
        setSlots((prev) => ({
          ...prev,
          [noteDialogDay]: [
            ...(prev[noteDialogDay] || []),
            {
              id: created.id,
              title: created.title,
              date: created.date,
              platform: created.platform as Platform,
              time: created.time || '00:00',
              contentType: created.contentType as ContentType,
              note: created.notes || undefined,
              analysisId: created.analysisId,
            },
          ],
        }));
      }
      setNoteDialogOpen(false);
      setNoteText('');
      toast.success('Reminder added');
    } catch (err) {
      console.error('Calendar note save error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save note');
    }
  }, [noteDialogDay, noteDialogSlotId, noteText, userId]);

  const weekLabel = `${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} \u2013 ${days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const totalSlots = Object.values(slots).reduce((s, arr) => s + arr.length, 0);

  const daysWithContent = days.filter((d) => {
    const key = dateKey(d);
    return slots[key] && slots[key].length > 0;
  }).length;
  const weekFillPercent = (daysWithContent / 7) * 100;

  // Mobile: show 3 days at a time
  const mobileDayStart = mobilePage * 3;
  const mobileDays = days.slice(mobileDayStart, mobileDayStart + 3);
  const hasMorePages = mobileDayStart + 3 < 7;
  const hasPrevPages = mobilePage > 0;

  const displayDays = mobileDays; // Will be overridden for desktop below

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-wine-accent animate-spin" />
          <p className="text-sm text-viralyze-muted">Loading calendar...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-sm text-viralyze-muted">{error}</p>
          <Button
            variant="outline"
            onClick={fetchEvents}
            className="border-wine-accent/30 text-wine-accent hover:bg-wine-accent/10"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <CalendarDays className="h-6 w-6 text-wine-accent/40" />
            <h2 className="text-2xl md:text-3xl font-bold text-viralyze-white">
              Content Calendar
            </h2>
            {totalSlots > 0 && (
              <span className="text-xs font-medium tabular-nums px-2 py-0.5 rounded-full bg-wine-accent/10 text-wine-accent border border-wine-accent/30">
                {totalSlots} scheduled
              </span>
            )}
          </div>
          <p className="text-viralyze-muted mt-1">
            Plan your content across the week
          </p>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => { setWeekOffset((w) => w - 1); setMobilePage(0); }}
            className="h-8 w-8 border-white/[0.08] text-viralyze-white hover:bg-white/[0.05] hover:scale-105 transition-transform"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-viralyze-white font-medium min-w-[180px] text-center">
            {weekLabel}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => { setWeekOffset((w) => w + 1); setMobilePage(0); }}
            className="h-8 w-8 border-white/[0.08] text-viralyze-white hover:bg-white/[0.05] hover:scale-105 transition-transform"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {weekOffset === 0 ? (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-wine-accent/10 border border-wine-accent/25 text-wine-accent text-xs font-medium"
            >
              <motion.span
                className="absolute inset-0 rounded-full border border-wine-accent/30"
                animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <CalendarDays className="h-3 w-3 relative z-10" />
              <span className="relative z-10">Today</span>
            </motion.span>
          ) : (
            <motion.div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-wine-accent/10 border border-wine-accent/25"
              animate={{ opacity: weekOffset !== 0 ? 1 : 0, scale: weekOffset !== 0 ? 1 : 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <CalendarDays className="h-3 w-3 text-wine-accent" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setWeekOffset(0); setMobilePage(0); }}
                className="text-wine-accent hover:text-wine-accent hover:bg-wine-accent/10 text-xs h-auto p-0"
              >
                Today
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Week Overview Stats Bar */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-2">
            <motion.div
              className="h-2 w-2 rounded-full bg-wine-accent"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="text-xs text-viralyze-muted">
              <span className="text-viralyze-white font-medium tabular-nums">{daysWithContent}</span>/7 days with content
            </span>
          </div>
          <div className="flex items-center gap-2 flex-1 max-w-[160px]">
            <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #7F1D3A 0%, #B8325A 50%, #7F1D3A 100%)',
                  backgroundSize: '200% 100%',
                }}
                initial={{ width: 0, backgroundPosition: '0% 0' }}
                animate={{
                  width: `${weekFillPercent}%`,
                  backgroundPosition: ['0% 0', '100% 0', '0% 0'],
                }}
                transition={{
                  width: { duration: 0.8, ease: 'easeOut' },
                  backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
                }}
              />
            </div>
            <span className="text-[10px] text-viralyze-muted/60 tabular-nums w-7 text-right">
              {Math.round(weekFillPercent)}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Glow-line separator */}
      <div className="glow-line" />

      {/* Gradient mesh background with dot-grid pattern */}
      <div className="relative">
        <div className="pointer-events-none absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-wine-accent/[0.06] blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-wine/[0.08] blur-[100px]" />
        {/* Dot-grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(250,250,249,0.8) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Mobile: 3-day navigation arrows */}
        <div className="flex md:hidden items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobilePage((p) => Math.max(0, p - 1))}
            disabled={!hasPrevPages}
            className="h-7 w-7 text-viralyze-muted disabled:opacity-30 hover:bg-white/[0.05]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-viralyze-muted">
            {displayDays[0]?.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })} \u2013 {displayDays[displayDays.length - 1]?.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobilePage((p) => Math.min(2, p + 1))}
            disabled={!hasMorePages}
            className="h-7 w-7 text-viralyze-muted disabled:opacity-30 hover:bg-white/[0.05]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Desktop: Full 7-day grid */}
        <div className="hidden md:grid grid-cols-7 gap-3">
          {days.map((day) => {
            const key = dateKey(day);
            const daySlots = slots[key] || [];
            const isDayToday = isToday(day);
            const isActive = activeDay === key;
            return renderDayCard({
              day, key, daySlots, isDayToday, isActive,
              activeDay, setActiveDay, slots,
              newTitle, setNewTitle, newPlatform, setNewPlatform,
              newTime, setNewTime, newContentType, setNewContentType,
              addSlot, addSlotFromAnalysis, removeSlot,
              openNoteDialog, recentAnalyses,
              libraryDropdownOpen, setLibraryDropdownOpen,
            });
          })}
        </div>

        {/* Mobile: 3-day grid (1 col) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-3">
          {displayDays.map((day) => {
            const key = dateKey(day);
            const daySlots = slots[key] || [];
            const isDayToday = isToday(day);
            const isActive = activeDay === key;
            return renderDayCard({
              day, key, daySlots, isDayToday, isActive,
              activeDay, setActiveDay, slots,
              newTitle, setNewTitle, newPlatform, setNewPlatform,
              newTime, setNewTime, newContentType, setNewContentType,
              addSlot, addSlotFromAnalysis, removeSlot,
              openNoteDialog, recentAnalyses,
              libraryDropdownOpen, setLibraryDropdownOpen,
            });
          })}
        </div>
      </div>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="bg-viralyze-soft-black border-white/[0.1] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-viralyze-white flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-wine-accent" />
              Content Reminder
            </DialogTitle>
            <DialogDescription className="text-viralyze-muted">
              Add a quick note or reminder for this day
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g., Draft carousel for product launch, film behind-the-scenes reel..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="bg-white/[0.05] border-white/[0.08] text-viralyze-white placeholder:text-viralyze-muted/40 focus-visible:ring-wine-accent resize-none min-h-[80px]"
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setNoteDialogOpen(false)}
              className="text-viralyze-muted hover:text-viralyze-white"
            >
              Cancel
            </Button>
            <Button
              onClick={saveNote}
              disabled={!noteText.trim()}
              className="bg-gradient-wine hover:opacity-90 text-white"
            >
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Empty state hint */}
      {totalSlots === 0 && (
        <motion.div variants={item} className="text-center pb-4">
          <div className="flex flex-col items-center gap-2">
            <Sparkles className="h-6 w-6 text-viralyze-muted/20" />
            <p className="text-xs text-viralyze-muted/50">
              Click on any day to schedule your first content idea
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// --- Render helpers (pure functions, no hooks) ---

interface DayCardProps {
  day: Date;
  key: string;
  daySlots: CalendarSlot[];
  isDayToday: boolean;
  isActive: boolean;
  activeDay: string | null;
  setActiveDay: (k: string | null) => void;
  slots: WeekSlots;
  newTitle: string;
  setNewTitle: (v: string) => void;
  newPlatform: Platform;
  setNewPlatform: (p: Platform) => void;
  newTime: string;
  setNewTime: (v: string) => void;
  newContentType: ContentType;
  setNewContentType: (c: ContentType) => void;
  addSlot: () => void;
  addSlotFromAnalysis: (a: { title: string; platform: Platform; id: string }) => void;
  removeSlot: (d: string, id: string) => void;
  openNoteDialog: (d: string) => void;
  recentAnalyses: { id: string; title: string; platform: Platform; overallScore: number }[];
  libraryDropdownOpen: boolean;
  setLibraryDropdownOpen: (o: boolean) => void;
}

function renderDayCard(props: DayCardProps) {
  const {
    day, key, daySlots, isDayToday, isActive,
    setActiveDay,
    newTitle, setNewTitle, newPlatform, setNewPlatform,
    newTime, setNewTime, newContentType, setNewContentType,
    addSlot, addSlotFromAnalysis, removeSlot,
    openNoteDialog, recentAnalyses,
    libraryDropdownOpen, setLibraryDropdownOpen,
  } = props;

  return (
    <motion.div key={key} variants={item}>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={cn(
            'glass relative transition-all duration-200 hover:shadow-lg hover:shadow-wine-accent/[0.08]',
            isDayToday && 'border-wine-accent/30',
            isActive && 'border-wine-accent/50 glow-wine-sm',
            daySlots.length > 0 && !isActive && 'hover:glow-wine-sm',
          )}
        >
        <CardHeader className={cn('p-3 pb-2 bg-gradient-to-br rounded-t-xl', dayHeaderGradients[day.getDay() === 0 ? 6 : day.getDay() - 1])}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-viralyze-white">
              {day.toLocaleDateString('en-US', { weekday: 'short' })}
            </CardTitle>
            {isDayToday && (
              <span className="h-1.5 w-1.5 rounded-full bg-wine-accent" />
            )}
          </div>
          <p className={cn(
            'text-[11px] text-viralyze-muted',
            isDayToday && 'text-wine-accent'
          )}>
            {formatDayLabel(day)}
          </p>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {/* Existing slots with content type color coding and drag feedback */}
          <div className="flex flex-col gap-1.5 mb-2">
            {daySlots.map((slot) => {
              const PIcon = platformIcons[slot.platform];
              const borderColor = contentTypeColors[slot.contentType] || 'border-l-wine-accent';
              const gradientBg = contentTypeGradients[slot.contentType] || '';
              const TimeIcon = slot.note ? Clock : getTimeOfDayIcon(slot.time);
              const timeColor = slot.note ? 'text-viralyze-muted' : getTimeOfDayColor(slot.time);
              return (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    'flex items-start gap-1.5 p-1.5 rounded-md border border-white/[0.06] group relative border-l-2 cursor-grab active:cursor-grabbing hover:-translate-y-[1px] hover:shadow-md hover:shadow-black/20 transition-all duration-200',
                    borderColor,
                    gradientBg
                  )}
                >
                  {/* Drag handle indicator */}
                  <div className="flex flex-col gap-px mt-0.5 opacity-0 group-hover:opacity-40 transition-opacity shrink-0">
                    <div className="h-0.5 w-2.5 rounded-full bg-viralyze-white" />
                    <div className="h-0.5 w-2.5 rounded-full bg-viralyze-white" />
                  </div>
                  <PIcon className="h-3 w-3 text-viralyze-muted mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-viralyze-white leading-tight truncate">
                      {slot.title}
                    </p>
                    <p className={cn('text-[10px] flex items-center gap-0.5', timeColor)}>
                      <TimeIcon className="h-2.5 w-2.5" />
                      {slot.note ? 'Reminder' : slot.time}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSlot(key, slot.id); }}
                    className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-viralyze-black border border-white/10 items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:border-red-500/30 transition-all hidden sm:flex"
                  >
                    <X className="h-2.5 w-2.5 text-viralyze-muted" />
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Add slot button or inline form */}
          {daySlots.length < SLOT_LIMIT && (
            <AnimatePresence mode="wait">
              {isActive ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-1.5"
                >
                  <Input
                    placeholder="Title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addSlot(); if (e.key === 'Escape') setActiveDay(null); }}
                    className="h-7 text-[11px] bg-white/[0.04] border-white/[0.08] text-viralyze-white placeholder:text-viralyze-muted/40 focus-visible:ring-wine-accent focus-visible:ring-1 px-2"
                    autoFocus
                  />
                  <div className="flex gap-1.5">
                    <Select value={newPlatform} onValueChange={(v) => setNewPlatform(v as Platform)}>
                      <SelectTrigger className="h-6 text-[10px] bg-white/[0.04] border-white/[0.08] text-viralyze-muted px-1.5 flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-viralyze-soft-black border-white/[0.08]">
                        {Object.entries(platformIcons).map(([pKey, PI]) => (
                          <SelectItem key={pKey} value={pKey} className="text-viralyze-white text-xs">
                            <div className="flex items-center gap-1.5"><PI className="h-3 w-3" />{pKey}</div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={newContentType} onValueChange={(v) => setNewContentType(v as ContentType)}>
                      <SelectTrigger className="h-6 text-[10px] bg-white/[0.04] border-white/[0.08] text-viralyze-muted px-1.5 w-[68px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-viralyze-soft-black border-white/[0.08]">
                        {(['reel','post','story','article','carousel','video','short','thread'] as ContentType[]).map((ct) => (
                          <SelectItem key={ct} value={ct} className="text-viralyze-white text-xs capitalize">
                            {ct}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="h-6 text-[10px] bg-white/[0.04] border-white/[0.08] text-viralyze-muted px-1.5 w-[68px]"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={addSlot}
                      disabled={!newTitle.trim()}
                      className="h-6 text-[10px] bg-wine-accent hover:bg-wine-accent/80 text-white px-2 flex-1"
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setActiveDay(null)}
                      className="h-6 text-[10px] text-viralyze-muted hover:text-viralyze-white px-2"
                    >
                      Cancel
                    </Button>
                  </div>
                  {/* Link from Library */}
                  {recentAnalyses.length > 0 && (
                    <div className="relative mt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setLibraryDropdownOpen(!libraryDropdownOpen)}
                        className="h-6 text-[10px] border-dashed text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.05] w-full"
                      >
                        <Bookmark className="h-3 w-3 mr-1" />
                        Link from Library
                      </Button>
                      {libraryDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg bg-viralyze-soft-black border border-white/[0.1] shadow-xl overflow-hidden"
                        >
                          <div className="max-h-48 overflow-y-auto flex flex-col divide-y divide-white/[0.06]">
                            {recentAnalyses.map((analysis) => {
                              const PI = platformIcons[analysis.platform];
                              return (
                                <button
                                  key={analysis.id}
                                  onClick={() => addSlotFromAnalysis({ title: analysis.title, platform: analysis.platform, id: analysis.id })}
                                  className="flex items-center gap-2 px-2.5 py-2 hover:bg-white/[0.05] transition-colors text-left w-full"
                                >
                                  <PI className="h-3 w-3 text-viralyze-muted shrink-0" />
                                  <span className="text-[11px] text-viralyze-white truncate flex-1">
                                    {analysis.title}
                                  </span>
                                  <span className={cn(
                                    'text-[9px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full shrink-0',
                                    analysis.overallScore >= 70
                                      ? 'bg-green-500/15 text-green-400'
                                      : analysis.overallScore >= 45
                                        ? 'bg-amber-500/15 text-amber-400'
                                        : 'bg-red-500/15 text-red-400'
                                  )}>
                                    {analysis.overallScore}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.button
                  key="btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActiveDay(key)}
                  className={cn(
                    'relative flex items-center justify-center gap-1 py-1.5 rounded-md border text-viralyze-muted/60 hover:text-wine-accent transition-all text-[11px] group/empty',
                    daySlots.length === 0
                      ? 'border-dashed border-wine-accent/25'
                      : 'border-dashed border-white/[0.08] hover:border-wine-accent/30'
                  )}
                >
                  <Plus className="h-3 w-3" />
                  {daySlots.length === 0 ? 'Add content' : 'Add more'}
                  {/* Hover glow + icon for empty slots */}
                  {daySlots.length === 0 && (
                    <motion.div
                      className="absolute inset-0 rounded-md pointer-events-none"
                      initial={{ boxShadow: '0 0 0px rgba(184,50,90,0)' }}
                      whileHover={{ boxShadow: '0 0 16px rgba(184,50,90,0.2), 0 0 32px rgba(127,29,58,0.1)' }}
                    />
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          )}

          {/* Note button for empty slots \u2014 appears with hover */}
          {!isActive && daySlots.length < SLOT_LIMIT && (
            <motion.button
              onClick={(e) => { e.stopPropagation(); openNoteDialog(key); }}
              className="absolute bottom-3 right-3 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity text-viralyze-muted/30 hover:text-wine-accent"
              title="Add a quick reminder"
            >
              <StickyNote className="h-3.5 w-3.5" />
            </motion.button>
          )}

          {daySlots.length >= SLOT_LIMIT && (
            <p className="text-[10px] text-viralyze-muted/40 text-center py-1">3/3 slots filled</p>
          )}
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  );
}
