import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max: number;
  tone?: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'neutral';
  className?: string;
  showValue?: boolean;
}

const toneClasses: Record<NonNullable<ProgressBarProps['tone']>, string> = {
  critical: 'from-critical/90 to-critical/40',
  high: 'from-high/90 to-high/40',
  medium: 'from-medium/90 to-medium/40',
  low: 'from-low/90 to-low/40',
  info: 'from-slate-500/90 to-slate-400/40',
  neutral: 'from-slate-500/80 to-slate-300/40',
};

export function ProgressBar({
  value,
  max,
  tone = 'neutral',
  className,
  showValue = false,
}: ProgressBarProps) {
  const safeMax = max <= 0 ? 1 : max;
  const progress = Math.min(value / safeMax, 1);

  return (
    <div className={['space-y-1', className].filter(Boolean).join(' ')}>
      <div className="h-2 w-full rounded-full bg-white/20">
        <motion.div
          className={[
            'h-full rounded-full bg-gradient-to-r',
            toneClasses[tone],
          ]
            .filter(Boolean)
            .join(' ')}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
      {showValue ? (
        <div className="text-xs text-slate-600">
          {Math.round(progress * 100)}% of threshold
        </div>
      ) : null}
    </div>
  );
}
