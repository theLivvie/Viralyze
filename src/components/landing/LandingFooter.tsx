'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Twitter, Github, Linkedin, Instagram, Send, Check, X } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

const footerLinks = {
  Product: [
    { label: 'Features', section: 'features' },
    { label: 'Pricing', section: 'pricing' },
    { label: 'How It Works', section: 'how-it-works' },
  ],
  Company: [
    { label: 'About', section: null },
  ],
  Resources: [
    { label: 'Documentation', section: null },
    { label: 'Status', section: null },
  ],
};

const socialLinks = [
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Github, label: 'GitHub', href: '#' },
];

const LEGAL_CONTENT: Record<string, string> = {
  'Privacy Policy': `
## Privacy Policy

**Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}**

Viralyze ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our service.

### Information We Collect
- **Account data**: Email address and name you provide during sign-up.
- **Content data**: Text you submit for analysis. This data is processed by our AI and stored to provide your content library.
- **Usage data**: Interaction patterns, feature usage, and analytics to improve our service.

### How We Use Your Data
- To provide and improve our viral content prediction service.
- To store your analysis history and content library.
- To communicate service updates and account notifications.
- To analyze usage patterns for product improvement.

### Data Sharing
We do not sell, trade, or rent your personal information to third parties. We may share anonymized, aggregated usage data for analytics purposes.

### Data Retention
You may delete your account and all associated data at any time through the Settings page.

### Contact
For privacy-related inquiries, contact us at privacy@viralyze.com.

*This is a placeholder document. A legal professional should review and customize this policy before production deployment.*
`,
  'Terms of Service': `
## Terms of Service

**Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}**

By accessing or using Viralyze, you agree to be bound by these Terms of Service.

### Service Description
Viralyze provides AI-powered content analysis and prediction services. Results are estimates based on AI analysis and do not guarantee actual performance.

### User Accounts
You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information during registration.

### Acceptable Use
You may not use Viralyze to generate harmful, illegal, or misleading content. You retain ownership of content you submit.

### Intellectual Property
Viralyze's analysis output and suggestions are provided for your use. The Viralyze platform, branding, and technology remain our intellectual property.

### Limitation of Liability
Viralyze provides content predictions as estimates. We are not liable for decisions made based on our analysis results. We do not guarantee virality or any specific engagement metrics.

### Modifications
We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.

### Contact
For questions about these terms, contact us at legal@viralyze.com.

*This is a placeholder document. A legal professional should review and customize these terms before production deployment.*
`,
};

export default function LandingFooter() {
  const { setScrollToSection } = useAppStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalTitle, setLegalTitle] = useState('');

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

  const openLegal = (title: string) => {
    setLegalTitle(title);
    setLegalOpen(true);
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
            &copy; {new Date().getFullYear()} Viralyze. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => openLegal('Privacy Policy')}
              className="text-xs text-viralyze-muted transition-all duration-300 hover:text-viralyze-white"
              whileHover={{ x: 2 }}
            >
              Privacy Policy
            </motion.button>
            <motion.button
              onClick={() => openLegal('Terms of Service')}
              className="text-xs text-viralyze-muted transition-all duration-300 hover:text-viralyze-white"
              whileHover={{ x: 2 }}
            >
              Terms of Service
            </motion.button>
          </div>
        </div>
      </div>

      {/* Legal Dialog */}
      <Dialog open={legalOpen} onOpenChange={setLegalOpen}>
        <DialogContent className="glass-strong sm:max-w-2xl max-h-[80vh] overflow-y-auto border-white/10" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-viralyze-white">{legalTitle}</DialogTitle>
          </DialogHeader>
          <div className="prose prose-invert prose-sm max-w-none text-viralyze-muted/80 [&_h2]:text-viralyze-white [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-3 [&_p]:mb-2 [&_p]:text-sm [&_p]:leading-relaxed [&_strong]:text-viralyze-white [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_em]:text-wine-accent/80">
            {LEGAL_CONTENT[legalTitle]?.split('\n').map((line, i) => {
              if (line.startsWith('## ')) return <h2 key={i}>{line.replace('## ', '')}</h2>;
              if (line.startsWith('### ')) return <h3 key={i} className="text-viralyze-white font-medium mt-4 mb-2">{line.replace('### ', '')}</h3>;
              if (line.startsWith('- ')) return <li key={i}>{line.replace('- ', '')}</li>;
              if (line.startsWith('*')) return <p key={i} className="text-xs text-viralyze-muted/50 italic mt-4">{line.replace(/\*/g, '')}</p>;
              if (line.trim() === '') return <br key={i} />;
              return <p key={i}>{line}</p>;
            })}
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
