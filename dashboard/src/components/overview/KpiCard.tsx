import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/Card';
import { Sparkline } from '../charts/Sparkline';
import { cn } from '../../utils/cn';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  change: number; // percentage change
  color: string;
  trendData: number[];
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  change,
  color,
  trendData,
}: KpiCardProps) {
  const sparklineData = trendData.map((val, index) => ({ index, value: val }));
  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-semantic-success' : 'text-semantic-error';

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        {change !== 0 && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', changeColor)}>
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-dark-text-primary mb-1">{value}</div>
        <div className="text-xs font-medium text-dark-text-secondary uppercase tracking-wide">
          {label}
        </div>
      </div>

      {sparklineData.length > 0 && (
        <div className="h-12 -mx-1">
          <Sparkline data={sparklineData} color={color} height={48} />
        </div>
      )}
    </Card>
  );
}
