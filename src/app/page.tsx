'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';

// Eager imports — above the fold / always needed
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

// Inline PageLoader component
function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
      <Loader2 className="h-8 w-8 text-wine-accent animate-spin" />
      <p className="text-sm text-viralyze-muted">Loading...</p>
    </div>
  );
}

// Dynamic imports for app views (code splitting)
const DashboardView = dynamic(() => import('@/components/app/DashboardView'), { loading: () => <PageLoader /> });
const PredictView = dynamic(() => import('@/components/app/PredictView'), { loading: () => <PageLoader /> });
const AnalysisView = dynamic(() => import('@/components/app/AnalysisView'), { loading: () => <PageLoader /> });
const LibraryView = dynamic(() => import('@/components/app/LibraryView'), { loading: () => <PageLoader /> });
const IdeasView = dynamic(() => import('@/components/app/IdeasView'), { loading: () => <PageLoader /> });
const TrendsView = dynamic(() => import('@/components/app/TrendsView'), { loading: () => <PageLoader /> });
const SettingsView = dynamic(() => import('@/components/app/SettingsView'), { loading: () => <PageLoader /> });
const AnalyticsView = dynamic(() => import('@/components/app/AnalyticsView'), { loading: () => <PageLoader /> });
const CalendarView = dynamic(() => import('@/components/app/CalendarView'), { loading: () => <PageLoader /> });
const ContentTemplatesView = dynamic(() => import('@/components/app/ContentTemplatesView'), { loading: () => <PageLoader /> });

const viewComponents: Record<string, React.ComponentType> = {
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
};

function AppRouter() {
  const { currentView } = useAppStore();
  const ViewComponent = viewComponents[currentView];

  if (!ViewComponent) return null;

  return (
    <AppLayout>
      <OnboardingOverlay />
      <KeyboardShortcuts />
      <ViewComponent />
    </AppLayout>
  );
}

function LandingPageContent() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

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

function LandingPageWithRefs() {
  const { scrollToSection, setScrollToSection } = useAppStore();
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  const sectionMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
    features: featuresRef,
    'how-it-works': howItWorksRef,
    pricing: pricingRef,
  };

  useEffect(() => {
    if (scrollToSection) {
      const el = sectionMap[scrollToSection];
      if (el?.current) {
        const offset = 80;
        const top = el.current.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      setScrollToSection(null);
    }
  }, [scrollToSection, setScrollToSection, sectionMap]);

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

export default function Home() {
  const { currentView, isLoggedIn } = useAppStore();

  // Show app views when logged in and not on landing
  if (isLoggedIn) {
    if (currentView === 'landing') {
      // Logged in user can still see landing page
      return (
        <main className="min-h-screen bg-viralyze-black">
          <ErrorBoundary>
            <LandingPageWithRefs />
          </ErrorBoundary>
        </main>
      );
    }
    return (
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    );
  }

  // Show landing page for non-logged-in users
  return (
    <main className="min-h-screen bg-viralyze-black">
      <ErrorBoundary>
        <LandingPageWithRefs />
      </ErrorBoundary>
    </main>
  );
}
