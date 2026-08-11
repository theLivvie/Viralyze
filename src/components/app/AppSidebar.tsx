'use client';

import {
  LayoutDashboard,
  Sparkles,
  Library,
  Lightbulb,
  LayoutTemplate,
  TrendingUp,
  BarChart3,
  CalendarDays,
  Settings,
  LogOut,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { useAppStore } from '@/lib/store';
import type { AppView } from '@/lib/types';

type NavItem = {
  view: AppView;
  label: string;
  icon: React.ElementType;
  highlight?: boolean;
};

const navItems: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'predict', label: 'Predict Content', icon: Sparkles, highlight: true },
  { view: 'library', label: 'Content Library', icon: Library },
  { view: 'ideas', label: 'Idea Generator', icon: Lightbulb },
  { view: 'templates', label: 'Templates', icon: LayoutTemplate },
  { view: 'trends', label: 'Trend Radar', icon: TrendingUp },
  { view: 'analytics', label: 'Analytics', icon: BarChart3 },
  { view: 'calendar', label: 'Content Calendar', icon: CalendarDays },
  { view: 'settings', label: 'Settings', icon: Settings },
];

export default function AppSidebar() {
  const { currentView, setCurrentView, user, logout, savedAnalyses } = useAppStore();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNav = (view: AppView) => {
    setCurrentView(view);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const predictionsUsed = user?.predictionsUsed || 0;
  const predictionsLimit = user?.predictionsLimit || 10;
  const usagePercent = Math.min(100, (predictionsUsed / predictionsLimit) * 100);
  const isNearLimit = usagePercent >= 80;

  return (
    <Sidebar collapsible="offcanvas" className="bg-viralyze-black border-r border-white/[0.06]">
      <SidebarHeader className="px-4 py-5">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [1, 0.8, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="h-7 w-7 text-wine-accent" />
          </motion.div>
          <span className="text-lg font-bold text-viralyze-white tracking-tight">
            Viralyze
          </span>
        </button>
      </SidebarHeader>

      <SidebarSeparator className="bg-white/[0.06]" />

      <SidebarContent className="px-3 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = currentView === item.view;
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.view} className="relative">
                    {/* Vertical glow line on left edge for active item */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full bg-gradient-to-b from-wine-accent via-wine to-wine-deep animate-pulse-glow" />
                    )}
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => handleNav(item.view)}
                      title={item.label}
                      aria-label={`Navigate to ${item.label}`}
                      className={
                        isActive
                          ? 'bg-wine-accent/10 text-wine-accent hover:bg-wine-accent/15 hover:text-wine-accent min-h-[44px]'
                          : 'text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.04] min-h-[44px]'
                      }
                    >
                      <Icon className="h-4.5 w-4.5" />
                      <span>{item.label}</span>
                      {/* Pulsing dot for Predict nav item */}
                      {item.highlight && !isActive && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-wine-accent animate-pulse-glow" />
                      )}
                      {/* Badge on Library showing saved analyses count */}
                      {item.view === 'library' && savedAnalyses.length > 0 && (
                        <span className="ml-auto h-5 min-w-[20px] px-1.5 rounded-full bg-wine-accent/20 text-wine-accent text-[10px] font-bold flex items-center justify-center tabular-nums">
                          {savedAnalyses.length}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Glow line divider between nav items and footer/usage section */}
      <div className="glow-line mx-5 bg-gradient-wine" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,50,90,0.4), transparent)' }} />

      {/* Usage bar above footer */}
      <div className="px-5 pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-viralyze-muted">Usage</span>
          <span className={`text-[11px] tabular-nums ${isNearLimit ? 'text-wine-accent' : 'text-viralyze-muted'}`}>
            {predictionsUsed}/{predictionsLimit}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-wine transition-all duration-500 ${isNearLimit ? 'animate-pulse-glow' : ''}`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      <SidebarFooter className="px-3 pb-6">
        <SidebarSeparator className="bg-white/[0.06] mb-2" />
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-gradient-wine flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-viralyze-white truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-viralyze-muted truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              title="Log Out"
              aria-label="Log out of your account"
              className="text-viralyze-muted hover:text-red-400 hover:bg-red-500/10 min-h-[44px]"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      {/* Gradient fade at bottom for mobile sheet — prevents home indicator cutoff */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 h-12 pointer-events-none" style={{ background: 'linear-gradient(to top, #09090B 0%, transparent 100%)' }} />
    </Sidebar>
  );
}