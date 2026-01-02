/**
 * Metric Card Component
 * Displays key metrics with optional trend indicators
 */

import { Card, CardContent } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, subtitle, trend, icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between mb-2">
          <div className="text-xs font-medium text-text-secondary">{title}</div>
          {icon && <div className="text-text-tertiary">{icon}</div>}
        </div>
        <div className="text-2xl font-semibold text-text-primary mb-1">{value}</div>
        {subtitle && (
          <div className="text-xs text-text-tertiary mb-2">{subtitle}</div>
        )}
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${
            trend.isPositive ? 'text-success' : 'text-error'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

