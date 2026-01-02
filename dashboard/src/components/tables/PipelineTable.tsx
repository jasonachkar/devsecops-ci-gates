import { format } from 'date-fns';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import type { PipelineRun } from '../../data/mockDashboardData';

interface PipelineTableProps {
  pipelines: PipelineRun[];
}

export function PipelineTable({ pipelines }: PipelineTableProps) {
  const getStatusIcon = (status: PipelineRun['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-4 w-4 text-semantic-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-semantic-error" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-semantic-info animate-spin" />;
    }
  };

  const getStatusBadge = (status: PipelineRun['status']) => {
    switch (status) {
      case 'passed':
        return 'passed';
      case 'failed':
        return 'failed';
      case 'running':
        return 'info';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Pipeline Runs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border-primary">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark-text-secondary">
                  Repository
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark-text-secondary">
                  Branch
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark-text-secondary">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark-text-secondary">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark-text-secondary">
                  Triggered By
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark-text-secondary">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {pipelines.map((pipeline) => (
                <tr
                  key={pipeline.id}
                  className="border-b border-dark-border-primary transition-colors hover:bg-dark-bg-tertiary/30"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm text-dark-text-primary">{pipeline.repo}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md bg-dark-bg-tertiary border border-dark-border-primary px-2 py-0.5 text-xs font-medium text-dark-text-secondary font-mono">
                      {pipeline.branch}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(pipeline.status)}
                      <Badge status={getStatusBadge(pipeline.status)} size="sm">
                        {pipeline.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-dark-text-secondary font-mono">{pipeline.duration}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-dark-text-secondary">{pipeline.triggeredBy}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-dark-text-tertiary">
                      {format(new Date(pipeline.timestamp), 'MMM d, HH:mm')}
                    </span>
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

