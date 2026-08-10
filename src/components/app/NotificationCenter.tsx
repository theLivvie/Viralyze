'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellOff,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAppStore } from '@/lib/store';
import type { SavedAnalysis } from '@/lib/types';

const platformIcons: Record<string, string> = {
  instagram: '📸',
  youtube: '▶️',
  tiktok: '🎵',
  x: '✖️',
  linkedin: '💼',
};

interface Notification {
  id: string;
  type: 'score' | 'summary';
  icon: React.ElementType;
  iconColor: string;
  text: string;
  relativeTime: string;
  action?: () => void;
  actionLabel?: string;
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getThisWeekCount(analyses: SavedAnalysis[]): number {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  return analyses.filter((a) => new Date(a.createdAt) >= weekStart).length;
}

export default function NotificationCenter() {
  const { savedAnalyses, setCurrentView } = useAppStore();
  const [read, setRead] = useState(false);

  const notifications = useMemo<Notification[]>(() => {
    const items: Notification[] = [];

    // Individual analysis notifications
    savedAnalyses.slice(0, 7).forEach((analysis) => {
      const icon = analysis.overallScore >= 70 ? CheckCircle2 : BarChart3;
      const iconColor = analysis.overallScore >= 70 ? 'text-green-400' : analysis.overallScore >= 45 ? 'text-amber-400' : 'text-red-400';
      const platIcon = platformIcons[analysis.platform] || '📱';
      items.push({
        id: analysis.id,
        type: 'score',
        icon,
        iconColor,
        text: `Your analysis scored ${analysis.overallScore}/100 on ${platIcon} ${analysis.platform}`,
        relativeTime: getRelativeTime(analysis.createdAt),
        action: () => {
          useAppStore.getState().setCurrentView('library');
        },
        actionLabel: 'View',
      });
    });

    // Summary notifications
    const weekCount = getThisWeekCount(savedAnalyses);
    if (weekCount > 0) {
      items.push({
        id: 'week-summary',
        type: 'summary',
        icon: TrendingUp,
        iconColor: 'text-wine-accent',
        text: `You've completed ${weekCount} ${weekCount === 1 ? 'analysis' : 'analyses'} this week`,
        relativeTime: 'This week',
        action: () => {
          useAppStore.getState().setCurrentView('analytics');
        },
        actionLabel: 'View',
      });
    }

    if (savedAnalyses.length > 0) {
      const avgScore = Math.round(
        savedAnalyses.reduce((sum, a) => sum + a.overallScore, 0) / savedAnalyses.length
      );
      items.push({
        id: 'avg-summary',
        type: 'summary',
        icon: BarChart3,
        iconColor: 'text-wine-accent',
        text: `Your average score is ${avgScore}`,
        relativeTime: 'Overall',
        action: () => {
          useAppStore.getState().setCurrentView('analytics');
        },
        actionLabel: 'View',
      });
    }

    return items;
  }, [savedAnalyses]);

  const total = notifications.length;
  const maxShown = notifications.slice(0, 10);
  const unreadCount = read ? 0 : total;

  const handleMarkAllRead = () => {
    setRead(true);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.05]"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-wine-accent text-white text-[10px] font-bold flex items-center justify-center tabular-nums"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="w-80 sm:w-96 p-0 glass-strong border border-white/[0.08] rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-wine-accent" />
            <span className="text-sm font-semibold text-viralyze-white">Notifications</span>
            {total > 0 && (
              <Badge className="bg-wine-accent/20 text-wine-accent text-[10px] font-bold border-0 px-1.5 py-0">
                {total}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-viralyze-muted hover:text-viralyze-white"
              onClick={handleMarkAllRead}
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notification list */}
        <div className="max-h-80 overflow-y-auto scrollbar-thin">
          {maxShown.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 gap-3"
            >
              <div className="h-12 w-12 rounded-full bg-white/[0.04] flex items-center justify-center">
                <BellOff className="h-5 w-5 text-viralyze-muted/40" />
              </div>
              <p className="text-sm text-viralyze-muted">No notifications yet</p>
              <p className="text-xs text-viralyze-muted/60 text-center px-6">
                Run some content predictions to get notifications about your scores and trends.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {maxShown.map((notif, i) => {
                const Icon = notif.icon;
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className={`h-4 w-4 ${notif.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-viralyze-white/80 leading-snug">{notif.text}</p>
                      <span className="text-xs text-viralyze-muted/60 mt-0.5 block">{notif.relativeTime}</span>
                    </div>
                    {notif.action && notif.actionLabel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-wine-accent hover:text-wine-accent hover:bg-wine-accent/10 shrink-0 gap-1"
                        onClick={notif.action}
                      >
                        <Eye className="h-3 w-3" />
                        {notif.actionLabel}
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
