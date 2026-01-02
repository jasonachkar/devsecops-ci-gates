import { useId } from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import type { SparklinePoint } from '../../utils/chartData';

interface SparklineProps {
  data: SparklinePoint[];
  color: string;
  height?: number;
}

export function Sparkline({ data, color, height = 48 }: SparklineProps) {
  const gradientId = useId();

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={`sparkline-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={`url(#sparkline-${gradientId})`}
            strokeWidth={2}
            dot={false}
            animationDuration={600}
            animationBegin={50}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
