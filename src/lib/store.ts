import { create } from 'zustand';
import type { AppView, AnalysisResult, SavedAnalysis, UserProfile, Platform, ContentType } from './types';
import type { AudienceSimulationResult, AudienceSource, SimulatorContentKind } from './audience-simulator/types';

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
  /** Fetch the current Supabase session and sync auth state */
  checkSession: () => Promise<void>;
  /** Whether the initial session check has completed */
  sessionChecked: boolean;

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

  audienceSource: AudienceSource;
  setAudienceSource: (s: AudienceSource) => void;
  simulatorContentKind: SimulatorContentKind;
  setSimulatorContentKind: (k: SimulatorContentKind) => void;
  simulatorDraft: string;
  setSimulatorDraft: (v: string) => void;
  lastSimulation: AudienceSimulationResult | null;
  setLastSimulation: (s: AudienceSimulationResult | null) => void;
  runSimulationAfterPredict: boolean;
  setRunSimulationAfterPredict: (v: boolean) => void;

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

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentView: 'landing',
  setCurrentView: (view) => set((state) => ({ currentView: view, previousView: state.currentView })),
  previousView: null,

  // Auth
  isLoggedIn: false,
  user: null,
  sessionChecked: false,
  login: (user) => set({ isLoggedIn: true, user, currentView: 'dashboard', authModalOpen: false }),
  updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
  logout: () => {
    // Clear session via API
    fetch('/api/auth/signout', { method: 'POST' }).catch(() => {});
    set({ isLoggedIn: false, user: null, currentView: 'landing', savedAnalyses: [], currentAnalysis: null, lastSimulation: null });
  },
  checkSession: async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.id) {
          set({
            isLoggedIn: true,
            user: {
              id: data.id,
              email: data.email || '',
              name: data.name || null,
              plan: data.plan || 'free',
              predictionsUsed: data.predictionsUsed || 0,
              predictionsLimit: data.predictionsLimit || 5,
            },
            currentView: 'dashboard',
            sessionChecked: true,
          });
          return;
        }
      }
    } catch {
      // Session check failed — user is not logged in
    }
    set({ isLoggedIn: false, user: null, sessionChecked: true });
  },

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

  audienceSource: 'demo',
  setAudienceSource: (s) => set({ audienceSource: s }),
  simulatorContentKind: 'text',
  setSimulatorContentKind: (k) => set({ simulatorContentKind: k }),
  simulatorDraft: '',
  setSimulatorDraft: (v) => set({ simulatorDraft: v }),
  lastSimulation: null,
  setLastSimulation: (s) => set({ lastSimulation: s }),
  runSimulationAfterPredict: false,
  setRunSimulationAfterPredict: (v) => set({ runSimulationAfterPredict: v }),
}));
