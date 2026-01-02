/**
 * Severity Breakdown Component
 * Visual breakdown of findings by severity
 */

import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
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
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-bg-tertiary rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const severities = [
    { key: 'critical' as const, label: 'Critical', count: scan.criticalCount, color: 'error' as const },
    { key: 'high' as const, label: 'High', count: scan.highCount, color: 'error' as const },
    { key: 'medium' as const, label: 'Medium', count: scan.mediumCount, color: 'warning' as const },
    { key: 'low' as const, label: 'Low', count: scan.lowCount, color: 'info' as const },
    { key: 'info' as const, label: 'Info', count: scan.infoCount, color: 'default' as const },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Severity Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {severities.map((severity) => {
            if (severity.count === 0) return null;
            const percentage = (severity.count / scan.totalFindings) * 100;

            return (
              <div key={severity.key} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary capitalize">{severity.label}</span>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-24 sm:w-32 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        severity.key === 'critical' || severity.key === 'high' ? 'bg-error' :
                        severity.key === 'medium' ? 'bg-warning' :
                        severity.key === 'low' ? 'bg-info' : 'bg-text-tertiary'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <Badge variant={severity.color}>{severity.count}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

