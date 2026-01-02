/**
 * Dashboard Page
 * Main dashboard with real-time security metrics
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
          // Invalidate queries to refetch latest data
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

  if (isLoading && !latestScan) {
    return (
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-bg-secondary rounded animate-pulse" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-bg-secondary rounded-lg border border-border animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-text-primary mb-2 font-semibold text-error">Error loading data</p>
            <p className="text-text-secondary text-sm mb-4">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <p className="text-text-tertiary text-xs mb-4">
              Make sure the backend API is running at: {import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-info text-white rounded-md hover:bg-info/90 transition-colors"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!latestScan && !isLoading) {
    return (
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-text-primary mb-2 font-semibold">No scan data available</p>
            <p className="text-text-secondary text-sm mb-2">
              {repositories && repositories.length === 0 
                ? 'No repositories found. Make sure repositories are configured in the backend.'
                : 'Run a security scan to see dashboard metrics'}
            </p>
            {activeRepositoryId && (
              <p className="text-text-tertiary text-xs">
                Repository ID: {activeRepositoryId}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary mb-2">Security Dashboard</h2>
            {latestScan && (
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <span>{latestScan.repository?.name || 'Unknown Repository'}</span>
                <span>•</span>
                <span>{latestScan.branch}</span>
                <span>•</span>
                {latestScan.completedAt && (
                  <span>{format(new Date(latestScan.completedAt), 'MMM d, yyyy HH:mm')}</span>
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

        {/* Metrics */}
        <DashboardMetrics scan={latestScan} findingsCount={findings.length} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SeverityBreakdown scan={latestScan} />
          <ToolDistribution findings={findings} />
        </div>

        {/* Trends Chart */}
        <TrendsChart repositoryId={activeRepositoryId} days={30} />

        {/* Findings Table */}
        <FindingsTable findings={findings} isLoading={isLoading} />
      </div>
    </div>
  );
}

