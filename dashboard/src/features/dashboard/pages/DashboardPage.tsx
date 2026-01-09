/**
 * Dashboard Page
 * Main dashboard with real-time security metrics and modern UI
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardMetrics } from '../components/DashboardMetrics';
import { SeverityBreakdown } from '../components/SeverityBreakdown';
import { ToolDistribution } from '../components/ToolDistribution';
import { FindingsTable } from '../components/FindingsTable';
import { TrendsChart } from '../components/TrendsChart';
import { RepositorySelector } from '../../../shared/components/RepositorySelector';
import { Card, CardContent } from '../../../shared/components/ui/Card';
import { useWebSocket } from '../../../app/providers/WebSocketProvider';
import { useQueryClient } from '@tanstack/react-query';
import { Shield, RefreshCw, Calendar, GitBranch } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';

export function DashboardPage() {
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string | undefined>();
  const { latestScan, findings, isLoading, repositories, activeRepositoryId, error } = useDashboardData(selectedRepositoryId);
  const { isConnected, joinRepository, on } = useWebSocket();
  const queryClient = useQueryClient();

  // Set up real-time updates
  useEffect(() => {
    if (activeRepositoryId && isConnected) {
      joinRepository(activeRepositoryId);

      const unsubscribe = on('scan:completed', (data: any) => {
        if (data.repositoryId === activeRepositoryId) {
          queryClient.invalidateQueries({ queryKey: ['scans', 'latest', activeRepositoryId] });
          queryClient.invalidateQueries({ queryKey: ['findings'] });
          queryClient.invalidateQueries({ queryKey: ['trends'] });
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [activeRepositoryId, isConnected, joinRepository, on, queryClient]);

  // Loading State
  if (isLoading && !latestScan) {
    return (
      <div className="min-h-screen bg-mesh-gradient">
        <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6 animate-fade-in">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 w-64 skeleton rounded-lg" />
                <div className="h-4 w-48 skeleton rounded-lg" />
              </div>
              <div className="h-10 w-48 skeleton rounded-lg" />
            </div>

            {/* Metrics skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 skeleton rounded-xl" />
              ))}
            </div>

            {/* Charts skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 skeleton rounded-xl" />
              <div className="h-80 skeleton rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-mesh-gradient flex items-center justify-center p-4">
        <Card className="max-w-md w-full animate-fade-in-up">
          <CardContent className="py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-error/10 mx-auto mb-6">
              <Shield className="h-8 w-8 text-error" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Connection Error</h2>
            <p className="text-text-secondary text-sm mb-6">
              {error instanceof Error ? error.message : 'Unable to connect to the security dashboard'}
            </p>
            <p className="text-text-tertiary text-xs mb-6 font-mono bg-bg-tertiary/50 p-3 rounded-lg">
              API: {import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className={cn(
                'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl',
                'bg-info text-white font-medium',
                'hover:bg-info/90 transition-all duration-200',
                'shadow-glow-sm hover:shadow-glow',
                'focus:outline-none focus:ring-2 focus:ring-info/50'
              )}
            >
              <RefreshCw className="h-4 w-4" />
              Retry Connection
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty State
  if (!latestScan && !isLoading) {
    return (
      <div className="min-h-screen bg-mesh-gradient flex items-center justify-center p-4">
        <Card className="max-w-md w-full animate-fade-in-up">
          <CardContent className="py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-info/10 mx-auto mb-6">
              <Shield className="h-8 w-8 text-info" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">No Scan Data</h2>
            <p className="text-text-secondary text-sm mb-4">
              {repositories && repositories.length === 0
                ? 'No repositories configured. Add a repository to start scanning.'
                : 'Run a security scan to see dashboard metrics and findings.'}
            </p>
            {activeRepositoryId && (
              <p className="text-text-tertiary text-xs font-mono bg-bg-tertiary/50 p-2 rounded-lg">
                Repository: {activeRepositoryId}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh-gradient">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 animate-fade-in">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2 tracking-tight">
                Security Overview
              </h2>
              {latestScan && (
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Shield className="h-4 w-4 text-info" />
                    <span className="font-medium">{latestScan.repository?.name || 'Repository'}</span>
                  </div>
                  <span className="text-text-muted">|</span>
                  <div className="flex items-center gap-1.5 text-text-tertiary">
                    <GitBranch className="h-4 w-4" />
                    <span>{latestScan.branch}</span>
                  </div>
                  {latestScan.completedAt && (
                    <>
                      <span className="text-text-muted">|</span>
                      <div className="flex items-center gap-1.5 text-text-tertiary">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(latestScan.completedAt), 'MMM d, yyyy HH:mm')}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            {repositories && repositories.length > 1 && (
              <RepositorySelector
                selectedId={selectedRepositoryId}
                onSelect={setSelectedRepositoryId}
              />
            )}
          </div>

          {/* Metrics Grid */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <DashboardMetrics scan={latestScan ?? null} findingsCount={findings.length} />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <SeverityBreakdown scan={latestScan ?? null} />
            <ToolDistribution findings={findings} />
          </div>

          {/* Trends Chart */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <TrendsChart repositoryId={activeRepositoryId} days={30} />
          </div>

          {/* Findings Table */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <FindingsTable findings={findings} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
