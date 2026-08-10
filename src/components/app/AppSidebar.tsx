'use client';

import {
  LayoutDashboard,
  Sparkles,
  Library,
  Lightbulb,
  TrendingUp,
  BarChart3,
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
};

const navItems: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'predict', label: 'Predict', icon: Sparkles },
  { view: 'library', label: 'Content Library', icon: Library },
  { view: 'ideas', label: 'Ideas', icon: Lightbulb },
  { view: 'trends', label: 'Trend Radar', icon: TrendingUp },
  { view: 'analytics', label: 'Analytics', icon: BarChart3 },
  { view: 'settings', label: 'Settings', icon: Settings },
];

export default function AppSidebar() {
  const { currentView, setCurrentView, user, logout, sidebarOpen, setSidebarOpen } = useAppStore();

  const handleNav = (view: AppView) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  return (
    <Sidebar collapsible="none" className="bg-viralyze-black border-r border-white/[0.06]">
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
                  <SidebarMenuItem key={item.view}>
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
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

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
