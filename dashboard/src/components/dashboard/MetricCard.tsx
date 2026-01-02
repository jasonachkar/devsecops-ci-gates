import { Card, CardContent } from '../ui/Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function MetricCard({ title, value, subtitle, trend }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="text-xs font-medium mb-1" style={{ color: '#8B949E' }}>{title}</div>
        <div className="text-2xl font-semibold mb-1" style={{ color: '#F0F6FC' }}>{value}</div>
        {subtitle && (
          <div className="text-xs" style={{ color: '#6E7681' }}>{subtitle}</div>
        )}
        {trend && (
          <div className="text-xs mt-2" style={{ color: trend.isPositive ? '#22C55E' : '#F85149' }}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}
