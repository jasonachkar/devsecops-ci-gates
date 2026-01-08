/**
 * Dashboard Metrics Component
 * Displays key security metrics with modern styling
 */

import { MetricCard } from '../../../shared/components/ui/MetricCard';
import { AlertTriangle, Shield, FileWarning, CheckCircle2, XCircle, Clock } from 'lucide-react';
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
          <div key={i} className="h-32 skeleton rounded-xl" />
        ))}
      </div>
    );
  }

  const hasCriticalOrHigh = scan.criticalCount > 0 || scan.highCount > 0;

  const getGateIcon = () => {
    if (scan.gateStatus === 'passed') return <CheckCircle2 className="h-5 w-5" />;
    if (scan.gateStatus === 'failed') return <XCircle className="h-5 w-5" />;
    return <Shield className="h-5 w-5" />;
  };

  const getGateColor = (): 'success' | 'error' | 'warning' | 'info' | 'default' => {
    if (scan.gateStatus === 'passed') return 'success';
    if (scan.gateStatus === 'failed') return 'error';
    return 'warning';
  };

  const getScanIcon = () => {
    if (scan.status === 'completed') return <CheckCircle2 className="h-5 w-5" />;
    if (scan.status === 'running') return <Clock className="h-5 w-5" />;
    return <XCircle className="h-5 w-5" />;
  };

  const getScanColor = (): 'success' | 'error' | 'warning' | 'info' | 'default' => {
    if (scan.status === 'completed') return 'success';
    if (scan.status === 'failed') return 'error';
    return 'info';
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Findings"
        value={scan.totalFindings.toLocaleString()}
        subtitle={`${findingsCount} in current view`}
        icon={<FileWarning className="h-5 w-5" />}
        iconColor="info"
      />
      <MetricCard
        title="Critical Issues"
        value={scan.criticalCount}
        subtitle={`${scan.highCount} high severity`}
        icon={<AlertTriangle className="h-5 w-5" />}
        iconColor={scan.criticalCount > 0 ? 'error' : 'default'}
        highlight={scan.criticalCount > 0}
      />
      <MetricCard
        title="Gate Status"
        value={scan.gateStatus === 'passed' ? 'Passed' : scan.gateStatus === 'failed' ? 'Failed' : 'Warning'}
        subtitle={hasCriticalOrHigh ? 'Issues require attention' : 'All checks passed'}
        icon={getGateIcon()}
        iconColor={getGateColor()}
        highlight={scan.gateStatus !== 'passed'}
      />
      <MetricCard
        title="Scan Status"
        value={scan.status === 'completed' ? 'Completed' : scan.status === 'running' ? 'Running' : 'Failed'}
        subtitle={scan.completedAt ? new Date(scan.completedAt).toLocaleDateString() : 'In progress'}
        icon={getScanIcon()}
        iconColor={getScanColor()}
      />
    </div>
  );
}
