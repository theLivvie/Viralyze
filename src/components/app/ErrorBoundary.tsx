'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const setCurrentView = useAppStore((s) => s.setCurrentView);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center border border-wine-accent/20">
        {/* Animated glow behind the icon */}
        <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-wine-accent/10 animate-pulse-glow" style={{ animationDuration: '3s' }} />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-wine-accent/15 border border-wine-accent/30">
            <AlertTriangle className="h-6 w-6 text-wine-accent" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-viralyze-white mb-2">
          Something went wrong
        </h3>

        <p className="text-sm text-viralyze-muted mb-2 leading-relaxed">
          An unexpected error occurred while rendering this view.
        </p>

        {error && (
          <p className="text-xs text-viralyze-muted/60 mb-6 font-mono bg-white/[0.03] rounded-lg p-3 border border-white/[0.06] break-all text-left">
            {error.message}
          </p>
        )}

        {!error && <div className="mb-6" />}

        <div className="flex flex-col gap-3">
          <Button
            onClick={onReset}
            className="bg-gradient-wine hover:opacity-90 text-white w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentView('dashboard')}
            className="border-white/10 text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.05] hover:border-white/20 w-full"
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
