'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';

const navLinks = [
  { label: 'Features', section: 'features' },
  { label: 'How It Works', section: 'how-it-works' },
  { label: 'Pricing', section: 'pricing' },
] as const;

export default function LandingNav() {
  const { setCurrentView, setScrollToSection, setAuthModal } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (section: string) => {
    setScrollToSection(section);
    setMobileOpen(false);
  };

  const handleGetStarted = () => {
    setAuthModal(true, 'signup');
    setMobileOpen(false);
  };

  const handleLogin = () => {
    setAuthModal(true, 'login');
    setMobileOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-wine">
            <Sparkles className="h-4 w-4 text-viralyze-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-viralyze-white">
            Viralyze
          </span>
        </button>

        {/* Desktop Links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.section}
              onClick={() => handleNavClick(link.section)}
              className="rounded-md px-3 py-2 text-sm text-viralyze-muted transition-colors hover:text-viralyze-white"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" onClick={handleLogin} className="text-viralyze-muted hover:text-viralyze-white">
            Log In
          </Button>
          <Button
            onClick={handleGetStarted}
            className="bg-gradient-wine text-viralyze-white border-0 hover:opacity-90 transition-opacity"
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-viralyze-muted hover:text-viralyze-white">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 border-white/5 bg-viralyze-soft-black">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-viralyze-white">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-wine">
                  <Sparkles className="h-3.5 w-3.5 text-viralyze-white" />
                </div>
                Viralyze
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4 pt-4">
              {navLinks.map((link) => (
                <button
                  key={link.section}
                  onClick={() => handleNavClick(link.section)}
                  className="rounded-md px-3 py-2.5 text-left text-sm text-viralyze-muted transition-colors hover:bg-white/5 hover:text-viralyze-white"
                >
                  {link.label}
                </button>
              ))}
              <Separator className="my-3 bg-white/5" />
              <Button variant="ghost" onClick={handleLogin} className="justify-start text-viralyze-muted hover:text-viralyze-white">
                Log In
              </Button>
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-wine border-0 text-viralyze-white hover:opacity-90 transition-opacity"
              >
                Get Started
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </motion.header>
  );
}
