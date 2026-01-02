/**
 * Findings Table Component
 * Displays security findings in a clean table
 */

import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import type { Finding } from '../../../shared/types/api';

interface FindingsTableProps {
  findings: Finding[];
  isLoading?: boolean;
}

export function FindingsTable({ findings, isLoading }: FindingsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-bg-tertiary rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (findings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-text-secondary">No findings available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getBadgeVariant = (severity: string): 'error' | 'warning' | 'info' | 'default' => {
    if (severity === 'critical' || severity === 'high') return 'error';
    if (severity === 'medium') return 'warning';
    if (severity === 'low') return 'info';
    return 'default';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Findings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Severity
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Issue
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase hidden sm:table-cell">
                  Tool
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  File
                </th>
              </tr>
            </thead>
            <tbody>
              {findings.slice(0, 10).map((finding) => (
                <tr
                  key={finding.id}
                  className="border-b border-border hover:bg-bg-tertiary/50 transition-colors"
                >
                  <td className="px-2 sm:px-4 py-3">
                    <Badge variant={getBadgeVariant(finding.severity)}>
                      {finding.severity}
                    </Badge>
                  </td>
                  <td className="px-2 sm:px-4 py-3 min-w-0">
                    <div className="text-sm text-text-primary break-words">{finding.title}</div>
                    {finding.message && (
                      <div className="text-xs text-text-tertiary mt-1 line-clamp-1">{finding.message}</div>
                    )}
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-sm text-text-secondary hidden sm:table-cell">
                    {finding.tool}
                  </td>
                  <td className="px-2 sm:px-4 py-3 min-w-0">
                    {finding.filePath && (
                      <div className="text-sm text-text-secondary font-mono truncate">
                        {finding.filePath}
                      </div>
                    )}
                    {finding.lineNumber && (
                      <div className="text-xs text-text-tertiary">Line {finding.lineNumber}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

