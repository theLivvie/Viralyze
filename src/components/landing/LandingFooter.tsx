'use client';

import { Sparkles, Twitter, Github, Linkedin, Instagram } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';

const footerLinks = {
  Product: [
    { label: 'Features', section: 'features' },
    { label: 'Pricing', section: 'pricing' },
    { label: 'How It Works', section: 'how-it-works' },
    { label: 'Changelog', section: null },
  ],
  Company: [
    { label: 'About', section: null },
    { label: 'Blog', section: null },
    { label: 'Careers', section: null },
    { label: 'Contact', section: null },
  ],
  Resources: [
    { label: 'Documentation', section: null },
    { label: 'API Reference', section: null },
    { label: 'Community', section: null },
    { label: 'Status', section: null },
  ],
};

const socialLinks = [
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Github, label: 'GitHub', href: '#' },
];

export default function LandingFooter() {
  const { setScrollToSection } = useAppStore();

  const handleLinkClick = (section: string | null) => {
    if (section) {
      setScrollToSection(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="border-t border-white/5 bg-viralyze-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-wine">
                <Sparkles className="h-4 w-4 text-viralyze-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-viralyze-white">Viralyze</span>
            </div>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-viralyze-muted">
              AI-powered viral content prediction. Know what will go viral before you post.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <button
                  key={social.label}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-viralyze-muted transition-colors hover:border-white/10 hover:text-viralyze-white"
                >
                  <social.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 text-sm font-semibold text-viralyze-white">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleLinkClick(link.section)}
                      className="text-sm text-viralyze-muted transition-colors hover:text-viralyze-white"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-white/5" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-viralyze-muted">
            © {new Date().getFullYear()} Viralyze. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button className="text-xs text-viralyze-muted transition-colors hover:text-viralyze-white">
              Privacy Policy
            </button>
            <button className="text-xs text-viralyze-muted transition-colors hover:text-viralyze-white">
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
