import type { SeverityLevel } from '../../types/scan';
import { severityIcons, statusIcons } from '../../config/icons';
import { useChartColors } from '../../hooks/useChartColors';
import { generateTrendData } from '../../utils/chartData';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Sparkline } from '../charts/Sparkline';

interface SeverityCardProps {
  severity: SeverityLevel;
  count: number;
  threshold?: number;
}

export function SeverityCard({ severity, count, threshold }: SeverityCardProps) {
  const { severityTokens } = useChartColors();
  const Icon = severityIcons[severity];
  const exceeded = threshold !== undefined && count > threshold;
  const trendData = generateTrendData(count);
  const glowLevel = exceeded && severity !== 'info' ? severity : undefined;

  return (
    <GlassCard
      className="p-5"
      elevation="md"
      hover={true}
      glow={glowLevel}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: severityTokens[severity].soft }}
          >
            <Icon className="h-5 w-5" style={{ color: severityTokens[severity].color }} />
          </span>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
              {severityTokens[severity].label}
            </div>
            <div className="text-3xl font-semibold text-slate-900">{count}</div>
          </div>
        </div>
        {threshold !== undefined && (
          <Badge
            status={exceeded ? 'failed' : 'passed'}
            icon={exceeded ? statusIcons.failed : statusIcons.passed}
            size="sm"
          >
            {exceeded ? 'Blocked' : 'OK'}
          </Badge>
        )}
      </div>

      <div className="mt-4">
        <Sparkline data={trendData} color={severityTokens[severity].color} />
      </div>

      {threshold !== undefined && threshold > 0 && (
        <div className="mt-4">
          <ProgressBar
            value={count}
            max={threshold}
            tone={severity}
            showValue={false}
          />
        </div>
      )}
    </GlassCard>
  );
}
