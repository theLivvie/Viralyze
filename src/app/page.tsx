'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';

// Eager imports -- above the fold / always needed
import LandingNav from '@/components/landing/LandingNav';
import HeroSection from '@/components/landing/HeroSection';
import SocialProofSection from '@/components/landing/SocialProofSection';
import ProblemSection from '@/components/landing/ProblemSection';
import DemoSection from '@/components/landing/DemoSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import PricingSection from '@/components/landing/PricingSection';
import CTASection from '@/components/landing/CTASection';
import LandingFooter from '@/components/landing/LandingFooter';
import AuthModal from '@/components/shared/AuthModal';

import AppLayout from '@/components/app/AppLayout';
import OnboardingOverlay from '@/components/app/OnboardingOverlay';
import KeyboardShortcuts from '@/components/app/KeyboardShortcuts';
import ErrorBoundary from '@/components/app/ErrorBoundary';

// ==========================================
// PAGE LOADER
// ==========================================

function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
      <Loader2 className="h-8 w-8 text-wine-accent animate-spin" />
      <p className="text-sm text-viralyze-muted">
        Loading...
      </p>
    </div>
  );
}

// ==========================================
// DYNAMIC APP VIEWS
// ==========================================

const DashboardView = dynamic(
  () => import('@/components/app/DashboardView'),
  {
    loading: () => <PageLoader />,
  }
);

const PredictView = dynamic(
  () => import('@/components/app/PredictView'),
  {
    loading: () => <PageLoader />,
  }
);

const AnalysisView = dynamic(
  () => import('@/components/app/AnalysisView'),
  {
    loading: () => <PageLoader />,
  }
);

const LibraryView = dynamic(
  () => import('@/components/app/LibraryView'),
  {
    loading: () => <PageLoader />,
  }
);

const IdeasView = dynamic(
  () => import('@/components/app/IdeasView'),
  {
    loading: () => <PageLoader />,
  }
);

const TrendsView = dynamic(
  () => import('@/components/app/TrendsView'),
  {
    loading: () => <PageLoader />,
  }
);

const SettingsView = dynamic(
  () => import('@/components/app/SettingsView'),
  {
    loading: () => <PageLoader />,
  }
);

const AnalyticsView = dynamic(
  () => import('@/components/app/AnalyticsView'),
  {
    loading: () => <PageLoader />,
  }
);

const CalendarView = dynamic(
  () => import('@/components/app/CalendarView'),
  {
    loading: () => <PageLoader />,
  }
);

const ContentTemplatesView = dynamic(
  () => import('@/components/app/ContentTemplatesView'),
  {
    loading: () => <PageLoader />,
  }
);

const AudienceSimulatorView = dynamic(
  () => import('@/components/app/AudienceSimulatorView'),
  {
    loading: () => <PageLoader />,
  }
);

const AudienceDnaView = dynamic(
  () => import('@/components/app/AudienceDnaView'),
  {
    loading: () => <PageLoader />,
  }
);

const ConnectedAccountsView = dynamic(
  () => import('@/components/app/ConnectedAccountsView'),
  {
    loading: () => <PageLoader />,
  }
);

// ==========================================
// VIEW ROUTER
// ==========================================

const viewComponents: Record<
  string,
  React.ComponentType
> = {
  dashboard: DashboardView,
  predict: PredictView,
  analysis: AnalysisView,
  library: LibraryView,
  ideas: IdeasView,
  templates: ContentTemplatesView,
  trends: TrendsView,
  analytics: AnalyticsView,
  calendar: CalendarView,
  settings: SettingsView,
  'audience-simulator': AudienceSimulatorView,
  'audience-dna': AudienceDnaView,
  'connected-accounts': ConnectedAccountsView,
};

// ==========================================
// APP ROUTER
// ==========================================

function AppRouter() {
  const { currentView } = useAppStore();

  const ViewComponent =
    viewComponents[currentView];

  if (!ViewComponent) {
    return null;
  }

  return (
    <AppLayout>
      <OnboardingOverlay />
      <KeyboardShortcuts />
      <ViewComponent />
    </AppLayout>
  );
}

// ==========================================
// LANDING PAGE
// ==========================================

function LandingPageWithRefs() {
  const {
    scrollToSection,
    setScrollToSection,
  } = useAppStore();

  const featuresRef =
    useRef<HTMLDivElement>(null);

  const howItWorksRef =
    useRef<HTMLDivElement>(null);

  const pricingRef =
    useRef<HTMLDivElement>(null);

  const sectionMap: Record<
    string,
    React.RefObject<HTMLDivElement | null>
  > = {
    features: featuresRef,
    'how-it-works': howItWorksRef,
    pricing: pricingRef,
  };

  useEffect(() => {
    if (!scrollToSection) {
      return;
    }

    const el =
      sectionMap[scrollToSection];

    if (el?.current) {
      const offset = 80;

      const top =
        el.current.getBoundingClientRect()
          .top +
        window.scrollY -
        offset;

      window.scrollTo({
        top,
        behavior: 'smooth',
      });
    }

    setScrollToSection(null);
  }, [
    scrollToSection,
    setScrollToSection,
  ]);

  return (
    <>
      <LandingNav />

      <HeroSection />

      <SocialProofSection />

      <ProblemSection />

      <DemoSection />

      <div ref={featuresRef}>
        <FeaturesSection />
      </div>

      <div ref={howItWorksRef}>
        <HowItWorksSection />
      </div>

      <div ref={pricingRef}>
        <PricingSection />
      </div>

      <CTASection />

      <LandingFooter />

      <AuthModal />
    </>
  );
}

// ==========================================
// HOME CONTENT
// ==========================================
//
// IMPORTANT:
// useSearchParams() is inside this component.
// The component itself is wrapped with Suspense
// at the bottom of this file.
//

function HomeContent() {
  const {
    currentView,
    isLoggedIn,
    sessionChecked,
    checkSession,
    setCurrentView,
  } = useAppStore();

  const searchParams =
    useSearchParams();

  const authParam =
    searchParams.get('auth');
  const audienceOauth =
    searchParams.get('audience_oauth');

  // ==========================================
  // CHECK SESSION
  // ==========================================

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // ==========================================
  // CLEAN AUTH URL PARAMETER
  // ==========================================

  useEffect(() => {
    if (
      (authParam || audienceOauth) &&
      sessionChecked
    ) {
      if (audienceOauth === 'success' && isLoggedIn) {
        setCurrentView('connected-accounts');
      }
      window.history.replaceState(
        {},
        '',
        '/'
      );
    }
  }, [
    authParam,
    audienceOauth,
    sessionChecked,
    isLoggedIn,
    setCurrentView,
  ]);

  // ==========================================
  // SESSION LOADING
  // ==========================================

  if (!sessionChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-viralyze-black">
        <Loader2 className="h-6 w-6 text-wine-accent animate-spin" />
      </div>
    );
  }

  // ==========================================
  // LOGGED-IN USER
  // ==========================================

  if (isLoggedIn) {
    // ----------------------------------------
    // User is logged in but currently viewing
    // the landing page.
    // ----------------------------------------

    if (currentView === 'landing') {
      return (
        <main className="min-h-screen bg-viralyze-black">
          <ErrorBoundary>
            <LandingPageWithRefs />
          </ErrorBoundary>
        </main>
      );
    }

    // ----------------------------------------
    // User is logged in and inside the app.
    // ----------------------------------------

    return (
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    );
  }

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  return (
    <main className="min-h-screen bg-viralyze-black">
      <ErrorBoundary>
        <LandingPageWithRefs />
      </ErrorBoundary>
    </main>
  );
}

// ==========================================
// HOME PAGE
// ==========================================
//
// Suspense fixes the Next.js production build
// error caused by useSearchParams().
//

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-viralyze-black">
          <Loader2 className="h-6 w-6 text-wine-accent animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}