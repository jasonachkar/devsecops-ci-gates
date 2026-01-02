import { useId } from 'react';
import {
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useChartColors } from '../../hooks/useChartColors';

interface ToolDistributionChartProps {
  data: Record<string, number>;
}

export function ToolDistributionChart({ data }: ToolDistributionChartProps) {
  const { toolPalette } = useChartColors();
  const gradientId = useId();

  const chartData = Object.entries(data)
    .map(([name, value], index) => ({
      name,
      value,
      color: toolPalette[index % toolPalette.length],
      gradientId: `tool-gradient-${index}-${gradientId}`,
    }))
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, entry) => sum + entry.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-dark-text-secondary">
        No tool data available.
      </div>
    );
  }

  const renderCenterLabel = ({ viewBox }: { viewBox?: { cx?: number; cy?: number } }) => {
    const cx = viewBox?.cx ?? 0;
    const cy = viewBox?.cy ?? 0;

    return (
      <g>
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          className="fill-dark-text-primary text-2xl font-semibold"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          className="fill-dark-text-secondary text-xs font-medium"
        >
          Total
        </text>
      </g>
    );
  };

  return (
    <div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {chartData.map((entry) => (
                <linearGradient
                  key={entry.gradientId}
                  id={entry.gradientId}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>

            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={3}
              stroke="rgba(0, 0, 0, 0.3)"
              strokeWidth={2}
              animationDuration={800}
              animationBegin={150}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={`url(#${entry.gradientId})`} />
              ))}
              <Label content={renderCenterLabel as any} />
            </Pie>

            <Tooltip
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
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {chartData.map((entry) => {
          const percentage = ((entry.value / total) * 100).toFixed(1);
          return (
            <div
              key={entry.name}
              className="flex items-center gap-2 rounded-md p-2 hover:bg-dark-bg-tertiary transition-colors"
            >
              <div
                className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="min-w-0 truncate text-sm text-dark-text-primary">
                {entry.name}
              </span>
              <span className="ml-auto flex-shrink-0 text-xs text-dark-text-secondary">
                {entry.value} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
