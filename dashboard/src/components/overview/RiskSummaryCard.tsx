import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import type { RiskSummary } from '../../utils/riskSummary';

interface RiskSummaryCardProps {
  summary: RiskSummary;
}

export function RiskSummaryCard({ summary }: RiskSummaryCardProps) {
  const { status, message, details } = summary;

  const config = {
    blocked: {
      icon: AlertTriangle,
      iconColor: '#b91c1c',
      bgColor: 'rgba(185, 28, 28, 0.08)',
      borderColor: 'rgba(185, 28, 28, 0.2)',
    },
    warning: {
      icon: AlertCircle,
      iconColor: '#a16207',
      bgColor: 'rgba(161, 98, 7, 0.08)',
      borderColor: 'rgba(161, 98, 7, 0.2)',
    },
    clear: {
      icon: CheckCircle,
      iconColor: '#16a34a',
      bgColor: 'rgba(22, 163, 74, 0.08)',
      borderColor: 'rgba(22, 163, 74, 0.2)',
    },
  };

  const { icon: Icon, iconColor, bgColor, borderColor } = config[status];

  return (
    <div
      className="rounded-2xl border p-4 backdrop-blur"
      style={{ backgroundColor: bgColor, borderColor }}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
        >
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">{message}</h3>
          <ul className="mt-2 space-y-1">
            {details.map((detail, index) => (
              <li key={index} className="text-xs text-slate-600">
                • {detail}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
