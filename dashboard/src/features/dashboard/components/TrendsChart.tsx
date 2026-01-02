/**
 * Trends Chart Component
 * Displays historical security trends
 */

import { useQuery } from '@tanstack/react-query';
import { trendsApi } from '../../../shared/api/services/trends';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format } from 'date-fns';

interface TrendsChartProps {
  repositoryId?: string;
  days?: number;
}

export function TrendsChart({ repositoryId, days = 30 }: TrendsChartProps) {
  const { data: trends, isLoading } = useQuery({
    queryKey: ['trends', repositoryId, days],
    queryFn: async () => {
      const response = await trendsApi.get({ repositoryId, days });
      if (!response.success) throw new Error(response.error || 'Failed to fetch trends');
      return response.data;
    },
    enabled: !!repositoryId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-bg-tertiary rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-text-secondary">
            No trend data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = trends.map((point) => ({
    date: format(new Date(point.date), 'MMM d'),
    total: point.total,
    critical: point.critical,
    high: point.high,
    medium: point.medium,
    low: point.low,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Trends ({days} days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <defs>
                <linearGradient id="criticalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F85149" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#F85149" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="highGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F85149" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#F85149" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="mediumGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" opacity={0.3} />

              <XAxis
                dataKey="date"
                tick={{ fill: '#8B949E', fontSize: 11 }}
                axisLine={{ stroke: '#30363D' }}
                tickLine={false}
              />

              <YAxis
                tick={{ fill: '#8B949E', fontSize: 11 }}
                axisLine={{ stroke: '#30363D' }}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#161B22',
                  border: '1px solid #30363D',
                  borderRadius: '6px',
                  color: '#F0F6FC',
                }}
                labelStyle={{ color: '#8B949E', fontSize: 11 }}
                itemStyle={{ fontSize: 12 }}
              />

              <Area
                type="monotone"
                dataKey="critical"
                stackId="1"
                stroke="#F85149"
                fill="url(#criticalGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="high"
                stackId="1"
                stroke="#F85149"
                fill="url(#highGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="medium"
                stackId="1"
                stroke="#F59E0B"
                fill="url(#mediumGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

