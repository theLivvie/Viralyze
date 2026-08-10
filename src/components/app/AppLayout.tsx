'use client';

import { useEffect } from 'react';
import { Menu } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import AppSidebar from './AppSidebar';
import type { AppView } from '@/lib/types';

const viewTitles: Record<AppView, string> = {
  landing: '',
  dashboard: 'Dashboard',
  predict: 'Predict Content',
  analysis: 'Analysis',
  library: 'Content Library',
  ideas: 'Idea Generator',
  trends: 'Trend Radar',
  analytics: 'Analytics',
  calendar: 'Content Calendar',
  settings: 'Settings',
  pricing: 'Pricing',
  features: 'Features',
  'how-it-works': 'How It Works',
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { currentView, user, setSidebarOpen } = useAppStore();

  useEffect(() => {
    setSidebarOpen(false);
  }, [currentView, setSidebarOpen]);

  const title = viewTitles[currentView] || 'Dashboard';
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
              <h1 className="text-lg font-semibold text-viralyze-white">{title}</h1>
            </div>
            <div className="flex items-center gap-2.5">
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

          {/* Wine accent glow line below header */}
          <div className="glow-line bg-gradient-wine" />

          {/* Content with subtle radial wine gradient */}
          <main className="flex-1 p-4 md:p-6 overflow-auto bg-gradient-wine-radial">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
