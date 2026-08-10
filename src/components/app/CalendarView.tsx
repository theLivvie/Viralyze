'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X, Instagram, Youtube, Tv, Twitter, Linkedin, Clock, Sparkles, CalendarDays, Bookmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Platform } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

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
}

type WeekSlots = Record<string, CalendarSlot[]>;

const STORAGE_KEY = 'viralyze-calendar-slots';
const SLOT_LIMIT = 3;

function getWeekDays(weekOffset: number): Date[] {
  const now = new Date();
  const currentDay = now.getDay();
  // Get Monday of current week (0=Sun, so Monday = 1)
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

// Time-of-day gradient for day headers based on weekday position
const dayHeaderGradients = [
  'from-amber-900/20 to-transparent',   // Mon - morning warm
  'from-orange-900/15 to-transparent',  // Tue - morning warm
  'from-viralyze-muted/10 to-transparent', // Wed - noon neutral
  'from-viralyze-muted/10 to-transparent', // Thu - noon neutral
  'from-wine-accent/20 to-transparent',  // Fri - evening wine
  'from-wine-deep/25 to-transparent',   // Sat - evening wine
  'from-wine/30 to-transparent',          // Sun - evening wine
];

function isToday(d: Date): boolean {
  const today = new Date();
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
}

function loadSlots(): WeekSlots {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSlots(slots: WeekSlots) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function CalendarView() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [slots, setSlots] = useState<WeekSlots>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState<Platform>('instagram');
  const [newTime, setNewTime] = useState('09:00');
  const [libraryDropdownOpen, setLibraryDropdownOpen] = useState(false);

  const savedAnalyses = useAppStore((s) => s.savedAnalyses);
  const recentAnalyses = savedAnalyses.slice(0, 5);

  const days = getWeekDays(weekOffset);

  const persistSlots = useCallback((updated: WeekSlots) => {
    setSlots(updated);
    saveSlots(updated);
  }, []);

  const addSlot = useCallback(() => {
    if (!activeDay || !newTitle.trim()) return;
    const daySlots = slots[activeDay] || [];
    if (daySlots.length >= SLOT_LIMIT) return;
    const slot: CalendarSlot = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: newTitle.trim(),
      platform: newPlatform,
      time: newTime,
    };
    const updated = { ...slots, [activeDay]: [...daySlots, slot] };
    persistSlots(updated);
    setNewTitle('');
    setNewTime('09:00');
    setNewPlatform('instagram');
  }, [activeDay, newTitle, newPlatform, newTime, slots, persistSlots]);

  const addSlotFromAnalysis = useCallback((analysis: { title: string; platform: Platform }) => {
    if (!activeDay) return;
    const daySlots = slots[activeDay] || [];
    if (daySlots.length >= SLOT_LIMIT) return;
    const slot: CalendarSlot = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: analysis.title,
      platform: analysis.platform,
      time: newTime,
    };
    const updated = { ...slots, [activeDay]: [...daySlots, slot] };
    persistSlots(updated);
    setLibraryDropdownOpen(false);
    setActiveDay(null);
  }, [activeDay, newTime, slots, persistSlots]);

  const removeSlot = useCallback((dayKey: string, slotId: string) => {
    const daySlots = (slots[dayKey] || []).filter((s) => s.id !== slotId);
    const updated = { ...slots, [dayKey]: daySlots };
    if (daySlots.length === 0) delete updated[dayKey];
    persistSlots(updated);
  }, [slots, persistSlots]);

  const weekLabel = `${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const totalSlots = Object.values(slots).reduce((s, arr) => s + arr.length, 0);

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
            onClick={() => setWeekOffset((w) => w - 1)}
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
            onClick={() => setWeekOffset((w) => w + 1)}
            className="h-8 w-8 border-white/[0.08] text-viralyze-white hover:bg-white/[0.05] hover:scale-105 transition-transform"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {/* Today indicator pill */}
          <motion.div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-wine-accent/10 border border-wine-accent/25"
            animate={{ opacity: weekOffset !== 0 ? 1 : 0, scale: weekOffset !== 0 ? 1 : 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <CalendarDays className="h-3 w-3 text-wine-accent" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekOffset(0)}
              className="text-wine-accent hover:text-wine-accent hover:bg-wine-accent/10 text-xs h-auto p-0"
            >
              Today
            </Button>
          </motion.div>
          {weekOffset === 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-wine-accent/10 border border-wine-accent/25 text-wine-accent text-xs font-medium"
            >
              <CalendarDays className="h-3 w-3" />
              Today
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Glow-line separator between header and grid */}
      <div className="glow-line" />

      {/* Gradient mesh background */}
      <div className="relative">
        <div className="pointer-events-none absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-wine-accent/[0.06] blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-wine/[0.08] blur-[100px]" />

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {days.map((day) => {
          const key = dateKey(day);
          const daySlots = slots[key] || [];
          const isDayToday = isToday(day);
          const isActive = activeDay === key;

          return (
            <motion.div key={key} variants={item}>
              <Card
                className={cn(
                  'glass transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-wine-accent/[0.05]',
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
                  {/* Existing slots */}
                  <div className="flex flex-col gap-1.5 mb-2">
                    {daySlots.map((slot) => {
                      const PIcon = platformIcons[slot.platform];
                      return (
                        <motion.div
                          key={slot.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex items-start gap-1.5 p-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] group relative"
                        >
                          <PIcon className="h-3 w-3 text-viralyze-muted mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-viralyze-white leading-tight truncate">
                              {slot.title}
                            </p>
                            <p className="text-[10px] text-viralyze-muted flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {slot.time}
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
                                {Object.entries(platformIcons).map(([key, PI]) => (
                                  <SelectItem key={key} value={key} className="text-viralyze-white text-xs">
                                    <div className="flex items-center gap-1.5"><PI className="h-3 w-3" />{key}</div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="time"
                              value={newTime}
                              onChange={(e) => setNewTime(e.target.value)}
                              className="h-6 text-[10px] bg-white/[0.04] border-white/[0.08] text-viralyze-muted px-1.5 w-[72px]"
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
                                          onClick={() => addSlotFromAnalysis({ title: analysis.title, platform: analysis.platform })}
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
                            'flex items-center justify-center gap-1 py-1.5 rounded-md border text-viralyze-muted/60 hover:text-wine-accent transition-all text-[11px]',
                            daySlots.length === 0
                              ? 'border-dashed border-wine-accent/25 animate-pulse-glow'
                              : 'border-dashed border-white/[0.08] hover:border-wine-accent/30'
                          )}
                        >
                          <Plus className="h-3 w-3" />
                          {daySlots.length === 0 ? 'Add content' : 'Add more'}
                        </motion.button>
                      )}
                    </AnimatePresence>
                  )}

                  {daySlots.length >= SLOT_LIMIT && (
                    <p className="text-[10px] text-viralyze-muted/40 text-center py-1">3/3 slots filled</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      </div>

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
