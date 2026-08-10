'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ChevronRight, Sparkles, Lightbulb, TrendingUp, BarChart3 } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import AppSidebar from './AppSidebar';
import NotificationCenter from './NotificationCenter';
import type { AppView } from '@/lib/types';

const viewTitles: Record<AppView, string> = {
  landing: '',
  dashboard: 'Dashboard',
  predict: 'Predict Content',
  analysis: 'Analysis',
  library: 'Content Library',
  ideas: 'Idea Generator',
  templates: 'Templates',
  trends: 'Trend Radar',
  analytics: 'Analytics',
  calendar: 'Content Calendar',
  settings: 'Settings',
  pricing: 'Pricing',
  features: 'Features',
  'how-it-works': 'How It Works',
};

const viewBreadcrumbs: Record<AppView, string[]> = {
  landing: [],
  dashboard: ['Dashboard'],
  predict: ['Dashboard', 'Predict'],
  analysis: ['Dashboard', 'Predict', 'Analysis'],
  library: ['Dashboard', 'Library'],
  ideas: ['Dashboard', 'Ideas'],
  templates: ['Dashboard', 'Templates'],
  trends: ['Dashboard', 'Trends'],
  analytics: ['Dashboard', 'Analytics'],
  calendar: ['Dashboard', 'Calendar'],
  settings: ['Dashboard', 'Settings'],
  pricing: ['Pricing'],
  features: ['Features'],
  'how-it-works': ['How It Works'],
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { currentView, user, setSidebarOpen, isLoggedIn, setCurrentView } = useAppStore();

  useEffect(() => {
    setSidebarOpen(false);
  }, [currentView, setSidebarOpen]);

  const title = viewTitles[currentView] || 'Dashboard';
  const breadcrumbs = viewBreadcrumbs[currentView] || [];
  const predictionsUsed = user?.predictionsUsed || 0;
  const predictionsLimit = user?.predictionsLimit || 10;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top bar */}
          <header className="sticky top-0 z-30 glass-strong flex items-center justify-between h-14 px-4 md:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden text-viralyze-muted hover:text-viralyze-white" />
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-viralyze-white">{title}</h1>
                {/* Breadcrumb navigation indicator */}
                {breadcrumbs.length > 1 && (
                  <div className="hidden sm:flex items-center gap-1 ml-1">
                    {breadcrumbs.slice(0, -1).map((crumb, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <ChevronRight className="h-3 w-3 text-viralyze-muted/40" />
                        <span className="text-xs text-viralyze-muted/60">{crumb}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              {/* Notification Center */}
              <NotificationCenter />
              {/* Usage counter badge */}
              <Badge
                variant="outline"
                className="text-xs border-white/10 text-viralyze-muted bg-white/[0.03] tabular-nums hover:border-wine-accent/30 hover:text-wine-accent transition-colors cursor-default"
              >
                {predictionsUsed}/{predictionsLimit}
              </Badge>
              <div className="h-8 w-8 rounded-full bg-gradient-wine flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </header>

          {/* Animated wine accent glow line below header — animates width from center on view change */}
            <motion.div
              className="glow-line bg-gradient-wine"
              key={currentView}
              initial={{ width: '0%', marginLeft: '50%' }}
              animate={{ width: '100%', marginLeft: '0%' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />

          {/* Content with subtle radial wine gradient + page transition */}
          <main className="flex-1 p-4 md:p-6 pb-16 overflow-auto bg-gradient-wine-radial">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Quick Actions floating bar */}
          {isLoggedIn && currentView !== 'landing' && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
              className="fixed bottom-0 left-0 right-0 z-20 md:left-[var(--sidebar-width,0px)]"
            >
              <div className="glass-strong border-t border-white/[0.06] px-4 py-2 flex items-center justify-center gap-4 sm:gap-6">
                <button
                  onClick={() => setCurrentView('predict')}
                  className="flex flex-col items-center gap-0.5 text-viralyze-muted hover:text-wine-accent transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="text-[10px] leading-tight">New Prediction</span>
                </button>
                <button
                  onClick={() => setCurrentView('ideas')}
                  className="flex flex-col items-center gap-0.5 text-viralyze-muted hover:text-wine-accent transition-colors"
                >
                  <Lightbulb className="h-4 w-4" />
                  <span className="text-[10px] leading-tight">Generate Ideas</span>
                </button>
                <button
                  onClick={() => setCurrentView('trends')}
                  className="flex flex-col items-center gap-0.5 text-viralyze-muted hover:text-wine-accent transition-colors"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-[10px] leading-tight">View Trends</span>
                </button>
                <button
                  onClick={() => setCurrentView('analytics')}
                  className="flex flex-col items-center gap-0.5 text-viralyze-muted hover:text-wine-accent transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-[10px] leading-tight">View Analytics</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
