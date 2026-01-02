import { format } from 'date-fns';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import type { SecurityToolStatus } from '../../data/mockDashboardData';

interface SecurityToolsStatusProps {
  tools: SecurityToolStatus[];
}

export function SecurityToolsStatus({ tools }: SecurityToolsStatusProps) {
  const getStatusIcon = (status: SecurityToolStatus['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-4 w-4 text-semantic-success" />;
      case 'warn':
        return <AlertCircle className="h-4 w-4 text-semantic-warning" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-semantic-error" />;
    }
  };

  const getStatusBadge = (status: SecurityToolStatus['status']) => {
    switch (status) {
      case 'pass':
        return 'passed';
      case 'warn':
        return 'warning';
      case 'fail':
        return 'failed';
    }
  };

  const getStatusColor = (status: SecurityToolStatus['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-semantic-success';
      case 'warn':
        return 'bg-semantic-warning';
      case 'fail':
        return 'bg-semantic-error';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Tools Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="flex items-center justify-between rounded-lg border border-dark-border-primary bg-dark-bg-tertiary p-3 transition-all hover:bg-dark-bg-elevated hover:border-dark-border-accent"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn('h-2 w-2 rounded-full flex-shrink-0', getStatusColor(tool.status))} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-dark-text-primary">{tool.name}</div>
                  <div className="text-xs text-dark-text-secondary mt-0.5">
                    Last run: {format(new Date(tool.lastRun), 'MMM d, HH:mm')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {getStatusIcon(tool.status)}
                <Badge status={getStatusBadge(tool.status)} size="sm">
                  {tool.findings} {tool.findings === 1 ? 'finding' : 'findings'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

