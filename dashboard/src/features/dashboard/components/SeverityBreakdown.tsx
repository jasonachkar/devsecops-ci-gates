/**
 * Severity Breakdown Component
 * Visual breakdown of findings by severity with modern styling
 */

import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { cn } from '../../../shared/lib/utils';
import type { Scan } from '../../../shared/types/api';

interface SeverityBreakdownProps {
  scan: Scan | null;
}

export function SeverityBreakdown({ scan }: SeverityBreakdownProps) {
  if (!scan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Severity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 skeleton rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const severities = [
    { key: 'critical' as const, label: 'Critical', count: scan.criticalCount, variant: 'critical' as const, barColor: 'bg-error' },
    { key: 'high' as const, label: 'High', count: scan.highCount, variant: 'high' as const, barColor: 'bg-error/70' },
    { key: 'medium' as const, label: 'Medium', count: scan.mediumCount, variant: 'medium' as const, barColor: 'bg-warning' },
    { key: 'low' as const, label: 'Low', count: scan.lowCount, variant: 'low' as const, barColor: 'bg-info' },
    { key: 'info' as const, label: 'Info', count: scan.infoCount, variant: 'default' as const, barColor: 'bg-text-tertiary' },
  ];

  const hasFindings = severities.some(s => s.count > 0);

  if (!hasFindings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Severity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
              <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-text-secondary text-sm">No security findings detected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Severity Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {severities.map((severity) => {
            if (severity.count === 0) return null;
            const percentage = (severity.count / scan.totalFindings) * 100;

            return (
              <div key={severity.key} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary capitalize">
                    {severity.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-tertiary">
                      {percentage.toFixed(1)}%
                    </span>
                    <Badge variant={severity.variant} size="sm" glow={severity.key === 'critical'}>
                      {severity.count}
                    </Badge>
                  </div>
                </div>
                <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500 ease-out',
                      severity.barColor,
                      'group-hover:opacity-90'
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Total Findings</span>
            <span className="font-semibold text-text-primary">{scan.totalFindings.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
