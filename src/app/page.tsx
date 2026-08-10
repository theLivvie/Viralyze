'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
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
import DashboardView from '@/components/app/DashboardView';
import PredictView from '@/components/app/PredictView';
import AnalysisView from '@/components/app/AnalysisView';
import LibraryView from '@/components/app/LibraryView';
import IdeasView from '@/components/app/IdeasView';
import TrendsView from '@/components/app/TrendsView';
import SettingsView from '@/components/app/SettingsView';
import AnalyticsView from '@/components/app/AnalyticsView';

const viewComponents: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  predict: PredictView,
  analysis: AnalysisView,
  library: LibraryView,
  ideas: IdeasView,
  trends: TrendsView,
  analytics: AnalyticsView,
  settings: SettingsView,
};

function AppRouter() {
  const { currentView } = useAppStore();
  const ViewComponent = viewComponents[currentView];

  if (!ViewComponent) return null;

  return (
    <AppLayout>
      <ViewComponent />
    </AppLayout>
  );
}

export default function Home() {
  const { currentView, isLoggedIn, scrollToSection, setScrollToSection } = useAppStore();
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

  // Show app views when logged in and not on landing
  if (isLoggedIn) {
    if (currentView === 'landing') {
      // Logged in user can still see landing page
      return (
        <main className="min-h-screen bg-viralyze-black">
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
        </main>
      );
    }
    return <AppRouter />;
  }

  // Show landing page for non-logged-in users
  return (
    <main className="min-h-screen bg-viralyze-black">
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
    </main>
  );
}
