'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

export default function AuthModal() {
  const { authModalOpen, authModalMode, setAuthModal, login } = useAppStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleOpenChange = (open: boolean) => {
    setAuthModal(open);
    if (!open) resetForm();
  };

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    // Redirect to the server-side Google OAuth route
    window.location.href = '/api/auth/google';
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (password.length < 1) {
      toast.error('Please enter a password');
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
            {/* Google OAuth button — only for login and signup */}
            {authModalMode !== 'forgot' && (
              <>
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                  variant="outline"
                  className="h-11 bg-white/[0.05] border-white/10 text-viralyze-white hover:bg-white/[0.1] hover:border-white/20 font-medium"
                >
                  {googleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                  Continue with Google
                </Button>
                <div className="relative">
                  <Separator className="bg-white/10" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-viralyze-black/80 px-2 text-xs text-viralyze-muted">
                    or
                  </span>
                </div>
              </>
            )}

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
                  placeholder="......"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/[0.05] border-white/10 text-viralyze-white placeholder:text-viralyze-muted/50 focus-visible:ring-wine-accent"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            )}

            {authModalMode !== 'forgot' && (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gradient-wine hover:opacity-90 text-white font-medium h-11 mt-1"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {authModalMode === 'login' && 'Sign In with Email'}
                {authModalMode === 'signup' && 'Create Account'}
              </Button>
            )}

            {authModalMode === 'forgot' && (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gradient-wine hover:opacity-90 text-white font-medium h-11 mt-1"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
            )}

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
