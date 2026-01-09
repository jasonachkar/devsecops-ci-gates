/**
 * Findings Table Component
 * Displays security findings in a modern, polished table
 */

import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { cn } from '../../../shared/lib/utils';
import { FileCode, AlertCircle, ExternalLink } from 'lucide-react';
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
              <div key={i} className="h-16 skeleton rounded-lg" />
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center mb-4">
              <svg className="h-7 w-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">All Clear</h3>
            <p className="text-text-secondary text-sm">No security findings to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getBadgeVariant = (severity: string): 'critical' | 'high' | 'medium' | 'low' | 'default' => {
    const s = severity.toLowerCase();
    if (s === 'critical') return 'critical';
    if (s === 'high') return 'high';
    if (s === 'medium') return 'medium';
    if (s === 'low') return 'low';
    return 'default';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Findings</CardTitle>
          <p className="text-xs text-text-tertiary mt-1">
            Showing {Math.min(findings.length, 10)} of {findings.length} findings
          </p>
        </div>
        {findings.length > 10 && (
          <button className={cn(
            'text-xs font-medium text-info hover:text-info/80',
            'flex items-center gap-1 transition-colors'
          )}>
            View All
            <ExternalLink className="h-3 w-3" />
          </button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-bg-tertiary/30">
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Issue
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider hidden md:table-cell">
                  Tool
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {findings.slice(0, 10).map((finding, index) => (
                <tr
                  key={finding.id}
                  className={cn(
                    'group transition-colors duration-150',
                    'hover:bg-bg-tertiary/50'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={getBadgeVariant(finding.severity)}
                      size="sm"
                      glow={finding.severity.toLowerCase() === 'critical'}
                    >
                      {finding.severity}
                    </Badge>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <AlertCircle className={cn(
                          'h-4 w-4',
                          finding.severity.toLowerCase() === 'critical' || finding.severity.toLowerCase() === 'high'
                            ? 'text-error'
                            : finding.severity.toLowerCase() === 'medium'
                              ? 'text-warning'
                              : 'text-text-tertiary'
                        )} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary group-hover:text-info transition-colors line-clamp-1">
                          {finding.title}
                        </p>
                        {finding.message && (
                          <p className="text-xs text-text-tertiary mt-0.5 line-clamp-1">
                            {finding.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-bg-tertiary/50 text-xs font-mono text-text-secondary">
                      {finding.tool}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    {finding.filePath && (
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCode className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-mono text-text-secondary truncate max-w-[200px]">
                            {finding.filePath.split('/').pop()}
                          </p>
                          {finding.lineNumber && (
                            <p className="text-xs text-text-muted">
                              Line {finding.lineNumber}
                            </p>
                          )}
                        </div>
                      </div>
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
