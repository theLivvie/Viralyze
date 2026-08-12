'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, Lightbulb, TrendingUp, BarChart3 } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
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

function AppLayoutInner({ children }: AppLayoutProps) {
  const { currentView, user, isLoggedIn, setSavedAnalyses, setCurrentView } = useAppStore();
  const { isMobile, setOpenMobile } = useSidebar();

  // Load library from DB when user changes
  const loadLibrary = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/library?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSavedAnalyses(data);
        }
      }
    } catch {
      // Silent fail — library will be empty until next prediction
    }
  }, [user, setSavedAnalyses]);

  // Close mobile sidebar on view change
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [currentView, isMobile, setOpenMobile]);

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      loadLibrary();
    }
  }, [isLoggedIn, user, loadLibrary]);

  const title = viewTitles[currentView] || 'Dashboard';
  const breadcrumbs = viewBreadcrumbs[currentView] || [];
  const predictionsUsed = user?.predictionsUsed || 0;
  const predictionsLimit = user?.predictionsLimit || 10;

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass-strong flex items-center justify-between h-14 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden text-viralyze-muted hover:text-viralyze-white" aria-label="Toggle sidebar menu" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-viralyze-white">{title}</h1>
              {/* Breadcrumb navigation indicator — hidden on small screens */}
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

        {/* Animated wine accent glow line below header */}
        <motion.div
          className="glow-line bg-gradient-wine"
          key={currentView}
          initial={{ width: '0%', marginLeft: '50%' }}
          animate={{ width: '100%', marginLeft: '0%' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Content with subtle radial wine gradient + page transition */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto bg-gradient-wine-radial">
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

        {/* Quick Actions floating bar with 44px touch targets */}
        {isLoggedIn && currentView !== 'landing' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
            className="fixed bottom-0 left-0 right-0 z-20 md:left-[var(--sidebar-width,0px)]"
          >
            <div className="glass-strong border-t border-white/[0.06] px-4 py-2 flex items-center justify-center gap-2 sm:gap-6">
              <button
                onClick={() => setCurrentView('predict')}
                aria-label="New Prediction"
                className="flex flex-col items-center justify-center gap-0.5 text-viralyze-muted hover:text-wine-accent transition-colors min-h-[44px] min-w-[44px] px-3"
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-[10px] leading-tight">New</span>
              </button>
              <button
                onClick={() => setCurrentView('ideas')}
                aria-label="Generate Ideas"
                className="flex flex-col items-center justify-center gap-0.5 text-viralyze-muted hover:text-wine-accent transition-colors min-h-[44px] min-w-[44px] px-3"
              >
                <Lightbulb className="h-4 w-4" />
                <span className="text-[10px] leading-tight">Ideas</span>
              </button>
              <button
                onClick={() => setCurrentView('trends')}
                aria-label="View Trends"
                className="flex flex-col items-center justify-center gap-0.5 text-viralyze-muted hover:text-wine-accent transition-colors min-h-[44px] min-w-[44px] px-3"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="text-[10px] leading-tight">Trends</span>
              </button>
              <button
                onClick={() => setCurrentView('analytics')}
                aria-label="View Analytics"
                className="flex flex-col items-center justify-center gap-0.5 text-viralyze-muted hover:text-wine-accent transition-colors min-h-[44px] min-w-[44px] px-3"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="text-[10px] leading-tight">Analytics</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </SidebarProvider>
  );
}
