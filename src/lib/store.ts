import { create } from 'zustand';
import type { AppView, AnalysisResult, SavedAnalysis, UserProfile, Platform, ContentType } from './types';

interface AppState {
  // Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  previousView: AppView | null;

  // Auth
  isLoggedIn: boolean;
  user: UserProfile | null;
  login: (user: UserProfile) => void;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;

  // Analysis
  currentAnalysis: AnalysisResult | null;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  analysisLoading: boolean;
  setAnalysisLoading: (loading: boolean) => void;

  // Library
  savedAnalyses: SavedAnalysis[];
  setSavedAnalyses: (analyses: SavedAnalysis[]) => void;
  addSavedAnalysis: (analysis: SavedAnalysis) => void;
  removeSavedAnalysis: (id: string) => void;

  // Predict form
  predictPlatform: Platform;
  setPredictPlatform: (p: Platform) => void;
  predictContentType: ContentType;
  setPredictContentType: (c: ContentType) => void;
  predictMode: 'idea' | 'post';
  setPredictMode: (m: 'idea' | 'post') => void;
  prefilledIdea: string;
  setPrefilledIdea: (idea: string) => void;

  // Mobile sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Auth modals
  authModalOpen: boolean;
  authModalMode: 'login' | 'signup' | 'forgot';
  setAuthModal: (open: boolean, mode?: 'login' | 'signup' | 'forgot') => void;

  // Landing scroll section
  scrollToSection: string | null;
  setScrollToSection: (section: string | null) => void;

  // Onboarding
  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'landing',
  setCurrentView: (view) => set((state) => ({ currentView: view, previousView: state.currentView })),
  previousView: null,

  // Auth
  isLoggedIn: false,
  user: null,
  login: (user) => set({ isLoggedIn: true, user, currentView: 'dashboard', authModalOpen: false }),
  updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
  logout: () => set({ isLoggedIn: false, user: null, currentView: 'landing', savedAnalyses: [], currentAnalysis: null }),

  // Analysis
  currentAnalysis: null,
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  analysisLoading: false,
  setAnalysisLoading: (loading) => set({ analysisLoading: loading }),

  // Library
  savedAnalyses: [],
  setSavedAnalyses: (analyses) => set({ savedAnalyses: analyses }),
  addSavedAnalysis: (analysis) => set((state) => ({ savedAnalyses: [analysis, ...state.savedAnalyses] })),
  removeSavedAnalysis: (id) => set((state) => ({ savedAnalyses: state.savedAnalyses.filter((a) => a.id !== id) })),

  // Predict form
  predictPlatform: 'instagram',
  setPredictPlatform: (p) => set({ predictPlatform: p }),
  predictContentType: 'reel',
  setPredictContentType: (c) => set({ predictContentType: c }),
  predictMode: 'idea',
  setPredictMode: (m) => set({ predictMode: m }),

  // Mobile sidebar
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Auth modals
  authModalOpen: false,
  authModalMode: 'login',
  setAuthModal: (open, mode = 'login') => set({ authModalOpen: open, authModalMode: mode }),

  // Landing scroll section
  scrollToSection: null,
  setScrollToSection: (section) => set({ scrollToSection: section }),

  // Onboarding — persisted to localStorage
  onboardingComplete: false,
  setOnboardingComplete: (v) => {
    try { localStorage.setItem('viralyze-onboarding', JSON.stringify(v)); } catch { /* noop */ }
    set({ onboardingComplete: v });
  },

  // Pre-filled idea from Ideas page
  prefilledIdea: '',
  setPrefilledIdea: (idea) => set({ prefilledIdea: idea }),
}));
