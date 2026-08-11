'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

export default function AuthModal() {
  const { authModalOpen, authModalMode, setAuthModal, login } = useAppStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleOpenChange = (open: boolean) => {
    setAuthModal(open);
    if (!open) resetForm();
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (authModalMode === 'signup' && !name) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: authModalMode === 'forgot' ? 'forgot' : authModalMode === 'signup' ? 'signup' : 'login',
          email,
          password,
          name: authModalMode === 'signup' ? name : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Something went wrong');
        return;
      }

      if (authModalMode === 'forgot') {
        toast.success('Reset link sent to your email');
        setAuthModal(false, 'login');
        return;
      }

      login(data);
      toast.success(authModalMode === 'signup' ? 'Account created!' : 'Welcome back!');
      resetForm();
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={authModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="glass-strong sm:max-w-md border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-viralyze-white">
            {authModalMode === 'login' && 'Welcome Back'}
            {authModalMode === 'signup' && 'Create Account'}
            {authModalMode === 'forgot' && 'Reset Password'}
          </DialogTitle>
          <DialogDescription className="text-viralyze-muted">
            {authModalMode === 'login' && 'Sign in to your Viralyze account'}
            {authModalMode === 'signup' && 'Start predicting viral content today'}
            {authModalMode === 'forgot' && "We'll send you a reset link"}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={authModalMode}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4 mt-2"
          >
            {authModalMode === 'signup' && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="auth-name" className="text-viralyze-muted text-sm">
                  Name
                </Label>
                <Input
                  id="auth-name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/[0.05] border-white/10 text-viralyze-white placeholder:text-viralyze-muted/50 focus-visible:ring-wine-accent"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="auth-email" className="text-viralyze-muted text-sm">
                Email
              </Label>
              <Input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/[0.05] border-white/10 text-viralyze-white placeholder:text-viralyze-muted/50 focus-visible:ring-wine-accent"
              />
            </div>

            {authModalMode !== 'forgot' && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="auth-password" className="text-viralyze-muted text-sm">
                  Password
                </Label>
                <Input
                  id="auth-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/[0.05] border-white/10 text-viralyze-white placeholder:text-viralyze-muted/50 focus-visible:ring-wine-accent"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-wine hover:opacity-90 text-white font-medium h-11 mt-2"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {authModalMode === 'login' && 'Sign In'}
              {authModalMode === 'signup' && 'Create Account'}
              {authModalMode === 'forgot' && 'Send Reset Link'}
            </Button>

            {/* Mode switching links */}
            <div className="flex flex-col gap-2 text-center text-sm">
              {authModalMode === 'login' && (
                <>
                  <button
                    onClick={() => setAuthModal(true, 'forgot')}
                    className="text-viralyze-muted hover:text-viralyze-white transition-colors"
                  >
                    Forgot password?
                  </button>
                  <span className="text-viralyze-muted">
                    Don&apos;t have an account?{' '}
                    <button
                      onClick={() => setAuthModal(true, 'signup')}
                      className="text-wine-accent hover:underline font-medium"
                    >
                      Sign up
                    </button>
                  </span>
                </>
              )}
              {authModalMode === 'signup' && (
                <span className="text-viralyze-muted">
                  Already have an account?{' '}
                  <button
                    onClick={() => setAuthModal(true, 'login')}
                    className="text-wine-accent hover:underline font-medium"
                  >
                    Log in
                  </button>
                </span>
              )}
              {authModalMode === 'forgot' && (
                <button
                  onClick={() => setAuthModal(true, 'login')}
                  className="text-viralyze-muted hover:text-viralyze-white transition-colors"
                >
                  Back to login
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
