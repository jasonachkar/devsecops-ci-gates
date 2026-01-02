/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */

import { Component, ReactNode, ErrorInfo } from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
          <Card className="max-w-md w-full">
            <CardContent className="py-8 text-center">
              <AlertTriangle className="h-12 w-12 text-error mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">Something went wrong</h2>
              <p className="text-text-secondary mb-4 text-sm">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
              >
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

