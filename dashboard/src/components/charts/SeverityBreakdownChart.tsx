import { useId } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SeverityLevel } from '../../types/scan';
import { useChartColors } from '../../hooks/useChartColors';

interface SeverityBreakdownChartProps {
  data: Record<SeverityLevel, number>;
  thresholds?: Partial<Record<SeverityLevel, number>>;
}

export function SeverityBreakdownChart({
  data,
  thresholds = {},
}: SeverityBreakdownChartProps) {
  const { severityTokens, severityOrder } = useChartColors();
  const gradientId = useId();

  const chartData = severityOrder.map((severity) => ({
    severity,
    label: severityTokens[severity].label,
    count: data[severity] ?? 0,
    threshold: thresholds[severity],
    fill: severityTokens[severity].color,
    gradientId: `gradient-${severity}-${gradientId}`,
  }));

  const thresholdLines = chartData
    .filter((entry) => typeof entry.threshold === 'number' && entry.threshold > 0)
    .map((entry) => ({
      severity: entry.severity,
      label: `${entry.label} threshold`,
      value: entry.threshold as number,
    }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={{ top: 16, right: 16, left: 0, bottom: 8 }}
          barCategoryGap="25%"
        >
          <defs>
            {chartData.map((entry) => (
              <linearGradient
                key={entry.gradientId}
                id={entry.gradientId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={entry.fill} stopOpacity={0.6} />
                <stop offset="100%" stopColor={entry.fill} stopOpacity={0.15} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255, 255, 255, 0.05)"
            vertical={false}
            opacity={0.5}
          />

          <XAxis
            dataKey="label"
            tick={{ fill: '#a3a3a3', fontSize: 11, fontWeight: 500 }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            tickLine={false}
            height={32}
          />

          <YAxis
            tick={{ fill: '#a3a3a3', fontSize: 11, fontWeight: 500 }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            tickLine={false}
            allowDecimals={false}
            width={36}
          />

          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            contentStyle={{
              backgroundColor: '#0f0f0f',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              padding: '10px 12px',
            }}
            itemStyle={{
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 500,
            }}
            labelStyle={{
              color: '#a3a3a3',
              fontSize: 11,
              fontWeight: 500,
              marginBottom: '4px',
            }}
            separator=": "
            formatter={(value: number | undefined) => [value ?? 0, 'Findings']}
          />

          {thresholdLines.map((line) => (
            <ReferenceLine
              key={line.severity}
              y={line.value}
              stroke="#737373"
              strokeDasharray="4 4"
              strokeWidth={1}
              opacity={0.5}
            />
          ))}

          <Bar
            dataKey="count"
            radius={[8, 8, 0, 0]}
            animationDuration={800}
            animationBegin={100}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`url(#${entry.gradientId})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
