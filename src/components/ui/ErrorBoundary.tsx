'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-background rounded-3xl border border-white/10 m-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight">System Interruption</h2>
              <p className="text-sm font-medium text-muted-foreground">
                A critical error occurred in this module. Your progress has been safely persisted.
              </p>
              {this.state.error && (
                <p className="text-[10px] font-mono text-rose-500/60 bg-rose-500/5 p-3 rounded-xl mt-4 border border-rose-500/10 break-all text-left">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <Button onClick={this.handleReset} className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20">
              <RefreshCcw className="w-4 h-4" /> Restart Module
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
