import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { apiClient } from '../../services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendAnalysisProps {
  repositoryId?: string;
  days?: number;
}

interface TrendData {
  id: string;
  date: string;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  scansCount: number;
}

export function TrendAnalysis({ repositoryId, days = 30 }: TrendAnalysisProps) {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const metricKeyMap = {
    total: 'totalFindings',
    critical: 'criticalCount',
    high: 'highCount',
  } as const;
  type Metric = keyof typeof metricKeyMap;
  const [selectedMetric, setSelectedMetric] = useState<Metric>('total');

  useEffect(() => {
    loadTrends();
  }, [repositoryId, days]);

  const loadTrends = async () => {
    if (!repositoryId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getTrends({
        repositoryId,
        days,
      });

      if (response.success) {
        setTrends(response.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trends');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-dark-text-secondary">
          Loading trend data...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-semantic-error-text mb-2">{error}</div>
          <button
            onClick={loadTrends}
            className="text-sm text-dark-text-secondary hover:text-dark-text-primary"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  if (trends.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-dark-text-secondary">
          No trend data available. Run some scans to see historical trends.
        </CardContent>
      </Card>
    );
  }

  // Format data for charts
  const chartData = trends.map((trend) => ({
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    total: trend.totalFindings,
    critical: trend.criticalCount,
    high: trend.highCount,
    medium: trend.mediumCount,
    low: trend.lowCount,
    info: trend.infoCount,
  }));

  // Calculate trend direction
  const calculateTrend = (metric: Metric) => {
    if (trends.length < 2) return null;
    const metricKey = metricKeyMap[metric];
    const first = trends[0][metricKey];
    const last = trends[trends.length - 1][metricKey];
    const change = last - first;
    const percentChange = first > 0 ? ((change / first) * 100).toFixed(1) : '0';
    return { change, percentChange, isPositive: change < 0 };
  };

  const trend = calculateTrend(selectedMetric);
  const TrendIcon = trend
    ? trend.isPositive
      ? TrendingDown
      : TrendingUp
    : Minus;

  const getMetricColor = (metric: Metric) => {
    switch (metric) {
      case 'total':
        return '#8b5cf6';
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f97316';
      default:
        return '#8b5cf6';
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Selector */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSelectedMetric('total')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedMetric === 'total'
              ? 'bg-dark-bg-elevated text-dark-text-primary border border-dark-border-accent'
              : 'text-dark-text-secondary hover:text-dark-text-primary'
          }`}
        >
          Total Findings
        </button>
        <button
          onClick={() => setSelectedMetric('critical')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedMetric === 'critical'
              ? 'bg-dark-bg-elevated text-dark-text-primary border border-dark-border-accent'
              : 'text-dark-text-secondary hover:text-dark-text-primary'
          }`}
        >
          Critical
        </button>
        <button
          onClick={() => setSelectedMetric('high')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedMetric === 'high'
              ? 'bg-dark-bg-elevated text-dark-text-primary border border-dark-border-accent'
              : 'text-dark-text-secondary hover:text-dark-text-primary'
          }`}
        >
          High
        </button>
      </div>

      {/* Trend Summary */}
      {trend && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-dark-text-secondary mb-1">
                  {selectedMetric === 'total' ? 'Total Findings' : `${selectedMetric} Findings`} Trend
                </div>
                <div className="flex items-center gap-2">
                  <TrendIcon
                    className={`h-5 w-5 ${
                      trend.isPositive ? 'text-semantic-success-text' : 'text-semantic-error-text'
                    }`}
                  />
                  <span
                    className={`text-2xl font-bold ${
                      trend.isPositive ? 'text-semantic-success-text' : 'text-semantic-error-text'
                    }`}
                  >
                    {trend.isPositive ? '-' : '+'}
                    {Math.abs(trend.change)} ({Math.abs(Number(trend.percentChange))}%)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-dark-text-secondary">Current</div>
                <div className="text-xl font-bold text-dark-text-primary">
                  {trends[trends.length - 1][metricKeyMap[selectedMetric]]}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Trends ({days} days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getMetricColor(selectedMetric)} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={getMetricColor(selectedMetric)} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis
                dataKey="date"
                stroke="#737373"
                tick={{ fill: '#a3a3a3' }}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#737373"
                tick={{ fill: '#a3a3a3' }}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 17, 17, 0.95)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f5f5f5',
                }}
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke={getMetricColor(selectedMetric)}
                fill={`url(#gradient-${selectedMetric})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Severity Breakdown Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis
                dataKey="date"
                stroke="#737373"
                tick={{ fill: '#a3a3a3' }}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#737373"
                tick={{ fill: '#a3a3a3' }}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 17, 17, 0.95)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f5f5f5',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="critical"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="Critical"
              />
              <Line
                type="monotone"
                dataKey="high"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                name="High"
              />
              <Line
                type="monotone"
                dataKey="medium"
                stroke="#eab308"
                strokeWidth={2}
                dot={false}
                name="Medium"
              />
              <Line
                type="monotone"
                dataKey="low"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Low"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

