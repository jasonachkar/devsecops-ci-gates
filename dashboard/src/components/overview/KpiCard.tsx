import type { LucideIcon } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Sparkline } from '../charts/Sparkline';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
  softColor: string;
  trendData?: number[];
  glow?: boolean;
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  color,
  softColor,
  trendData,
  glow = false,
}: KpiCardProps) {
  const sparklineData = trendData?.map((value, index) => ({ index, value })) || [];

  return (
    <GlassCard
      className="p-4"
      elevation="md"
      hover={true}
      glow={glow ? 'critical' : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: softColor }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 truncate">
            {label}
          </div>
          <div className="text-2xl font-semibold text-slate-900 mt-0.5">{value}</div>
        </div>
      </div>
      {sparklineData.length > 0 && (
        <div className="mt-3 h-8">
          <Sparkline data={sparklineData} color={color} />
        </div>
      )}
    </GlassCard>
  );
}
