'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Twitter, Github, Linkedin, Instagram, Send, Check } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

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
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleLinkClick = (section: string | null) => {
    if (section) {
      setScrollToSection(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    toast.success('Thanks for subscribing! We\'ll keep you updated.');
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="relative border-t border-white/5 bg-viralyze-black">
      {/* Glow line separator at the top of footer */}
      <div className="absolute left-0 right-0 top-0">
        <div
          className="glow-line mx-auto max-w-md"
          style={{
            background: 'linear-gradient(90deg, transparent, #B8325A, #7F1D3A, transparent)',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Image
                src="/viralyze_logo.png"
                alt="Viralyze Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-lg font-bold tracking-tight text-viralyze-white">Viralyze</span>
            </div>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-viralyze-muted">
              AI-powered viral content prediction. Know what will go viral before you post.
            </p>

            {/* Newsletter signup */}
            <div className="mb-6">
              <p className="mb-2.5 text-sm font-semibold text-viralyze-white">Stay in the loop</p>
              <AnimatePresence mode="wait">
                {subscribed ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/[0.08] px-3 py-2.5"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                      <Check className="h-3 w-3 text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-green-400">Subscribed!</span>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubscribe}
                    className="gradient-border rounded-lg"
                  >
                    <div className="focus-glow-wine flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="flex-1 bg-transparent text-sm text-viralyze-white placeholder-viralyze-muted/50 outline-none"
                      />
                      <button
                        type="submit"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-wine-accent text-viralyze-white transition-opacity duration-200 hover:opacity-80"
                        aria-label="Subscribe to newsletter"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <motion.button
                  key={social.label}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-viralyze-muted transition-all duration-300 hover:border-white/10 hover:text-viralyze-white hover:glow-wine-sm"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <social.icon className="h-4 w-4" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 text-sm font-semibold text-viralyze-white border-l-2 border-wine-accent/30 pl-3">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <motion.button
                      onClick={() => handleLinkClick(link.section)}
                      className="inline-block text-sm text-viralyze-muted transition-all duration-300 hover:text-wine-accent"
                      whileHover={{ x: 3 }}
                    >
                      {link.label}
                    </motion.button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="glow-line my-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,50,90,0.3), transparent)' }} />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-viralyze-muted">
            © {new Date().getFullYear()} Viralyze. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <motion.button
              className="text-xs text-viralyze-muted transition-all duration-300 hover:text-viralyze-white"
              whileHover={{ x: 2 }}
            >
              Privacy Policy
            </motion.button>
            <motion.button
              className="text-xs text-viralyze-muted transition-all duration-300 hover:text-viralyze-white"
              whileHover={{ x: 2 }}
            >
              Terms of Service
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}
