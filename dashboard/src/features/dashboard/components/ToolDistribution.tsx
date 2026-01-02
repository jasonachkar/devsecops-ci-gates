/**
 * Tool Distribution Component
 * Shows findings distribution by security tool
 */

import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import type { Finding } from '../../../shared/types/api';

interface ToolDistributionProps {
  findings: Finding[];
}

export function ToolDistribution({ findings }: ToolDistributionProps) {
  if (findings.length === 0) {
    return null;
  }

  // Calculate tool distribution
  const toolCounts = findings.reduce((acc, finding) => {
    acc[finding.tool] = (acc[finding.tool] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tools = Object.entries(toolCounts)
    .map(([tool, count]) => ({ tool, count }))
    .sort((a, b) => b.count - a.count);

  const total = findings.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Findings by Tool</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tools.map(({ tool, count }) => {
            const percentage = ((count / total) * 100).toFixed(1);
            return (
              <div key={tool} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary font-mono">{tool}</span>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-24 sm:w-32 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-info"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <Badge variant="info">{count}</Badge>
                  <span className="text-xs text-text-tertiary w-12 text-right">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

