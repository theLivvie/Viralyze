'use client';

import {
  LayoutDashboard,
  Sparkles,
  Library,
  Lightbulb,
  TrendingUp,
  BarChart3,
  CalendarDays,
  Settings,
  LogOut,
} from 'lucide-react';
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
  { view: 'predict', label: 'Predict', icon: Sparkles, highlight: true },
  { view: 'library', label: 'Content Library', icon: Library },
  { view: 'ideas', label: 'Ideas', icon: Lightbulb },
  { view: 'trends', label: 'Trend Radar', icon: TrendingUp },
  { view: 'analytics', label: 'Analytics', icon: BarChart3 },
  { view: 'calendar', label: 'Calendar', icon: CalendarDays },
  { view: 'settings', label: 'Settings', icon: Settings },
];

export default function AppSidebar() {
  const { currentView, setCurrentView, user, logout, sidebarOpen, setSidebarOpen } = useAppStore();

  const handleNav = (view: AppView) => {
    setCurrentView(view);
    setSidebarOpen(false);
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
          <Sparkles className="h-7 w-7 text-wine-accent" />
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
                      className={
                        isActive
                          ? 'bg-wine-accent/10 text-wine-accent hover:bg-wine-accent/15 hover:text-wine-accent'
                          : 'text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.04]'
                      }
                    >
                      <Icon className="h-4.5 w-4.5" />
                      <span>{item.label}</span>
                      {/* Pulsing dot for Predict nav item */}
                      {item.highlight && !isActive && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-wine-accent animate-pulse-glow" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

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

      <SidebarFooter className="px-3 pb-4">
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
              className="text-viralyze-muted hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
