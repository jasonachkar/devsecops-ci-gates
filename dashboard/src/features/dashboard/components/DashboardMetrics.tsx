/**
 * Dashboard Metrics Component
 * Displays key security metrics
 */

import { MetricCard } from '../../../shared/components/ui/MetricCard';
import { AlertTriangle, Shield, FileWarning, CheckCircle2 } from 'lucide-react';
import type { Scan } from '../../../shared/types/api';

interface DashboardMetricsProps {
  scan: Scan | null;
  findingsCount: number;
}

export function DashboardMetrics({ scan, findingsCount }: DashboardMetricsProps) {
  if (!scan) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-bg-secondary rounded-lg border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  const hasCriticalOrHigh = scan.criticalCount > 0 || scan.highCount > 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Findings"
        value={scan.totalFindings}
        icon={<FileWarning className="h-4 w-4" />}
      />
      <MetricCard
        title="Critical Issues"
        value={scan.criticalCount}
        subtitle={`${scan.highCount} high severity`}
        icon={<AlertTriangle className="h-4 w-4" />}
      />
      <MetricCard
        title="Gate Status"
        value={scan.gateStatus === 'passed' ? 'Passed' : scan.gateStatus === 'failed' ? 'Failed' : 'Warning'}
        subtitle={hasCriticalOrHigh ? 'Issues detected' : 'All checks passed'}
        icon={scan.gateStatus === 'passed' ? <CheckCircle2 className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
      />
      <MetricCard
        title="Scan Status"
        value={scan.status === 'completed' ? 'Completed' : scan.status === 'running' ? 'Running' : 'Failed'}
        subtitle={scan.completedAt ? new Date(scan.completedAt).toLocaleDateString() : 'In progress'}
      />
    </div>
  );
}

