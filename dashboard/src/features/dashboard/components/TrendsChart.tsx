/**
 * Trends Chart Component
 * Displays historical security trends with modern styling
 */

import { useQuery } from '@tanstack/react-query';
import { trendsApi } from '../../../shared/api/services/trends';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { format } from 'date-fns';

interface TrendsChartProps {
  repositoryId?: string;
  days?: number;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-elevated border border-border rounded-lg shadow-lg p-3">
        <p className="text-xs text-text-secondary mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-text-secondary capitalize">{entry.dataKey}:</span>
              <span className="text-text-primary font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

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
          <div className="h-72 skeleton rounded-lg" />
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
          <div className="h-72 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-bg-tertiary flex items-center justify-center mb-3">
              <Activity className="h-6 w-6 text-text-tertiary" />
            </div>
            <p className="text-text-secondary text-sm">No trend data available</p>
            <p className="text-text-tertiary text-xs mt-1">Run more scans to see trends</p>
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

  // Calculate trend direction
  const firstTotal = chartData[0]?.total || 0;
  const lastTotal = chartData[chartData.length - 1]?.total || 0;
  const trendDirection = lastTotal - firstTotal;
  const trendPercentage = firstTotal > 0 ? Math.round((trendDirection / firstTotal) * 100) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Security Trends</CardTitle>
          <p className="text-xs text-text-tertiary mt-1">
            Last {days} days
          </p>
        </div>
        <div className="flex items-center gap-2">
          {trendDirection !== 0 && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
              trendDirection < 0 ? 'bg-success/10' : 'bg-error/10'
            }`}>
              {trendDirection < 0 ? (
                <TrendingDown className="h-4 w-4 text-success" />
              ) : (
                <TrendingUp className="h-4 w-4 text-error" />
              )}
              <span className={`text-xs font-medium ${
                trendDirection < 0 ? 'text-success' : 'text-error'
              }`}>
                {Math.abs(trendPercentage)}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
              <defs>
                <linearGradient id="criticalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F85149" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#F85149" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="highGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F85149" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#F85149" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="mediumGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="lowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#58A6FF" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#58A6FF" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#30363D"
                opacity={0.4}
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tick={{ fill: '#8B949E', fontSize: 11 }}
                axisLine={{ stroke: '#30363D' }}
                tickLine={false}
                dy={8}
              />

              <YAxis
                tick={{ fill: '#8B949E', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                dx={-8}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                wrapperStyle={{
                  paddingTop: '16px',
                }}
                formatter={(value) => (
                  <span className="text-xs text-text-secondary capitalize">{value}</span>
                )}
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
                strokeWidth={1.5}
                strokeOpacity={0.7}
              />
              <Area
                type="monotone"
                dataKey="medium"
                stackId="1"
                stroke="#F59E0B"
                fill="url(#mediumGradient)"
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="low"
                stackId="1"
                stroke="#58A6FF"
                fill="url(#lowGradient)"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Summary */}
        <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-error" />
            <span className="text-xs text-text-secondary">Critical/High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-xs text-text-secondary">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-info" />
            <span className="text-xs text-text-secondary">Low</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
