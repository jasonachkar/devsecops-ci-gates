import { Shield, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { statusIcons } from '../../config/icons';

interface CommandHeaderProps {
  repository: string;
  branch: string;
  commit: string;
  timestamp: string;
  isPassed: boolean;
  totalFindings: number;
  onRefresh?: () => void;
}

export function CommandHeader({
  repository,
  branch,
  commit,
  timestamp,
  isPassed,
  totalFindings,
  onRefresh,
}: CommandHeaderProps) {
  const StatusIcon = isPassed ? statusIcons.passed : statusIcons.failed;

  return (
    <GlassCard className="p-5" hover={false}>
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/30">
            <Shield className="h-5 w-5 text-slate-700" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-slate-900">
              Security Scan Overview
            </h1>
            <p className="text-xs text-slate-500 truncate">
              {repository} • {branch} • {commit.substring(0, 8)} • {format(new Date(timestamp), 'MMM d, yyyy HH:mm')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Badge
            icon={StatusIcon}
            status={isPassed ? 'passed' : 'failed'}
          >
            {isPassed ? 'Passed' : 'Failed'}
          </Badge>
          <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-semibold text-slate-700">
            {totalFindings} findings
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/30 bg-white/20 text-slate-700 transition hover:bg-white/30 hover:scale-105"
              aria-label="Refresh scan data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
