import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface SimpleChartProps {
  title: string;
  data: Array<{ name: string; value: number }>;
}

export function SimpleChart({ title, data }: SimpleChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#8B949E', fontSize: 12 }}
                axisLine={{ stroke: '#30363D' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#8B949E', fontSize: 12 }}
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
              />
              <Bar dataKey="value" fill="#58A6FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

