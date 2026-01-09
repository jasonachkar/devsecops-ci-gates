/**
 * Metric Card Component
 * Displays key metrics with modern styling and optional animations
 */

import { Card, CardContent } from './Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  iconColor?: 'info' | 'success' | 'warning' | 'error' | 'default';
  highlight?: boolean;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconColor = 'default',
  highlight = false
}: MetricCardProps) {
  const iconColors = {
    info: 'text-info bg-info/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    error: 'text-error bg-error/10',
    default: 'text-text-secondary bg-bg-tertiary',
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden',
        highlight && 'border-border-accent/30 shadow-glow-sm'
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-bg-tertiary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardContent className="py-5 relative">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            {title}
          </span>
          {icon && (
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110',
              iconColors[iconColor]
            )}>
              {icon}
            </div>
          )}
        </div>

        <div className="text-3xl font-bold text-text-primary tracking-tight mb-1">
          {value}
        </div>

        {subtitle && (
          <div className="text-xs text-text-tertiary mb-2">
            {subtitle}
          </div>
        )}

        {trend && (
          <div className={cn(
            'inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5',
            trend.value === 0
              ? 'text-text-secondary bg-bg-tertiary'
              : trend.isPositive
                ? 'text-success bg-success/10'
                : 'text-error bg-error/10'
          )}>
            {trend.value === 0 ? (
              <Minus className="h-3 w-3" />
            ) : trend.isPositive ? (
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
