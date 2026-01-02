import { useState } from 'react';
import { useId } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { cn } from '../../utils/cn';
import type { TrendDataPoint } from '../../data/mockDashboardData';

interface FindingsOverTimeChartProps {
  data: TrendDataPoint[];
}

export function FindingsOverTimeChart({ data }: FindingsOverTimeChartProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');
  const gradientId = useId();

  const chartData = data.map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: point.value,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Security Findings Over Time</CardTitle>
          <div className="flex items-center gap-1 rounded-lg border border-dark-border-primary bg-dark-bg-tertiary p-1">
            {(['7d', '14d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded transition-colors',
                  timeRange === range
                    ? 'bg-dark-bg-elevated text-dark-text-primary'
                    : 'text-dark-text-secondary hover:text-dark-text-primary'
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <defs>
                <linearGradient id={`findings-gradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.05)"
                vertical={false}
                opacity={0.5}
              />

              <XAxis
                dataKey="date"
                tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11, fontWeight: 500 }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.06)' }}
                tickLine={false}
                height={32}
              />

              <YAxis
                tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11, fontWeight: 500 }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.06)' }}
                tickLine={false}
                allowDecimals={false}
                width={36}
              />

              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                contentStyle={{
                  backgroundColor: '#0E1117',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                  padding: '10px 12px',
                }}
                itemStyle={{
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 500,
                }}
                labelStyle={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: 11,
                  fontWeight: 500,
                  marginBottom: '4px',
                }}
                separator=": "
                formatter={(value: number | undefined) => [value ?? 0, 'Findings']}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#38BDF8"
                strokeWidth={2}
                fill={`url(#findings-gradient-${gradientId})`}
                animationDuration={800}
                animationBegin={100}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

