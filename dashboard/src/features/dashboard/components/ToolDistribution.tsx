/**
 * Tool Distribution Component
 * Shows findings distribution by security tool with modern styling
 */

import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { cn } from '../../../shared/lib/utils';
import { Wrench } from 'lucide-react';
import type { Finding } from '../../../shared/types/api';

interface ToolDistributionProps {
  findings: Finding[];
}

// Tool color mapping for visual distinction
const toolColors: Record<string, string> = {
  'semgrep': 'bg-accent-purple',
  'trivy': 'bg-accent-cyan',
  'gitleaks': 'bg-error',
  'checkov': 'bg-success',
  'snyk': 'bg-warning',
  'dependabot': 'bg-info',
  'default': 'bg-info',
};

export function ToolDistribution({ findings }: ToolDistributionProps) {
  if (findings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Findings by Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-bg-tertiary flex items-center justify-center mb-3">
              <Wrench className="h-6 w-6 text-text-tertiary" />
            </div>
            <p className="text-text-secondary text-sm">No tool data available</p>
          </div>
        </CardContent>
      </Card>
    );
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

  const getToolColor = (tool: string) => {
    const lowerTool = tool.toLowerCase();
    for (const [key, color] of Object.entries(toolColors)) {
      if (lowerTool.includes(key)) return color;
    }
    return toolColors.default;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Findings by Tool</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tools.map(({ tool, count }, index) => {
            const percentage = (count / total) * 100;
            const barColor = getToolColor(tool);

            return (
              <div key={tool} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('h-2 w-2 rounded-full', barColor)} />
                    <span className="text-sm font-medium text-text-primary font-mono">
                      {tool}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-tertiary">
                      {percentage.toFixed(1)}%
                    </span>
                    <Badge variant="info" size="sm">
                      {count}
                    </Badge>
                  </div>
                </div>
                <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500 ease-out',
                      barColor,
                      'group-hover:opacity-90'
                    )}
                    style={{
                      width: `${percentage}%`,
                      animationDelay: `${index * 100}ms`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Tools Used</span>
            <span className="font-semibold text-text-primary">{tools.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
