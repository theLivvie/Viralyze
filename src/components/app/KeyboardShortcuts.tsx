'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Command } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAppStore } from '@/lib/store';

interface Shortcut {
  keys: string[];
  label: string;
  action: () => void;
}

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const { setCurrentView } = useAppStore();

  const navigateTo = useCallback(
    (view: 'predict' | 'library' | 'ideas') => {
      setCurrentView(view);
    },
    [setCurrentView]
  );

  const shortcuts: Shortcut[] = [
    {
      keys: ['Ctrl', 'K'],
      label: 'Predict',
      action: () => navigateTo('predict'),
    },
    {
      keys: ['Ctrl', 'L'],
      label: 'Library',
      action: () => navigateTo('library'),
    },
    {
      keys: ['Ctrl', 'I'],
      label: 'Ideas',
      action: () => navigateTo('ideas'),
    },
    {
      keys: ['Ctrl', '/'],
      label: 'Toggle this dialog',
      action: () => setOpen((o) => !o),
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key === 'k') {
        e.preventDefault();
        navigateTo('predict');
      } else if (isCtrl && e.key === 'l') {
        e.preventDefault();
        navigateTo('library');
      } else if (isCtrl && e.key === 'i') {
        e.preventDefault();
        navigateTo('ideas');
      } else if (isCtrl && e.key === '/') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateTo]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-4 right-4 z-40 h-10 w-10 rounded-full glass-strong noise-bg border border-white/[0.08] flex items-center justify-center text-viralyze-muted/60 hover:text-viralyze-white hover:border-wine-accent/30 transition-colors shadow-lg group animate-pulse-glow"
          aria-label="Keyboard shortcuts"
        >
          <HelpCircle className="h-5 w-5" />
          <span className="absolute -top-1 -left-1 h-4 w-4 rounded-full bg-wine-accent/80 text-[9px] text-white font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            ?
          </span>
        </motion.button>
      </DialogTrigger>

      <DialogContent className="glass-strong border-white/[0.08] max-w-sm mx-auto p-0 overflow-hidden">
        <div className="gradient-border rounded-lg">
        <div className="p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-viralyze-white text-base">
            <Command className="h-4 w-4 text-wine-accent" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 mt-2">
          {shortcuts.map((shortcut) => (
            <button
              key={shortcut.label}
              onClick={() => {
                shortcut.action();
                setOpen(false);
              }}
              className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-wine-accent/20 hover:bg-white/[0.05] hover:glow-wine-sm px-4 py-3 transition-all duration-200 group"
            >
              <span className="text-sm text-viralyze-muted group-hover:text-viralyze-white transition-colors">
                {shortcut.label}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, i) => (
                  <span key={i}>
                    <kbd className="h-7 min-w-7 px-2 rounded-md bg-white/[0.08] border border-white/[0.1] text-xs font-mono text-viralyze-white/70 group-hover:text-viralyze-white group-hover:border-wine-accent/30 transition-colors inline-flex items-center justify-center">
                      {key === 'Ctrl' ? '⌘' : key}
                    </kbd>
                    {i < shortcut.keys.length - 1 && (
                      <span className="text-viralyze-muted/30 mx-0.5 text-xs">+</span>
                    )}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
