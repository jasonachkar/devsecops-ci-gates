/**
 * Badge Component
 * Status and label badges with semantic colors and subtle glow effects
 */

import { cn } from '../../lib/utils';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default' | 'critical' | 'high' | 'medium' | 'low' | 'passed' | 'failed' | 'running';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  /** @deprecated Use variant instead */
  status?: string;
  size?: 'xs' | 'sm' | 'md';
  glow?: boolean;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function Badge({
  children,
  variant,
  status,
  size = 'sm',
  glow = false,
  className,
  icon: Icon,
}: BadgeProps) {
  // Support legacy status prop as alias for variant
  const resolvedVariant = variant || (status as BadgeVariant) || 'default';

  // Map status values to variants
  const variantMap: Record<string, BadgeVariant> = {
    passed: 'success',
    failed: 'error',
    running: 'info',
  };

  const finalVariant = variantMap[resolvedVariant] || resolvedVariant;

  const variants: Record<BadgeVariant, string> = {
    success: 'bg-success/15 text-success border-success/30',
    passed: 'bg-success/15 text-success border-success/30',
    error: 'bg-error/15 text-error border-error/30',
    failed: 'bg-error/15 text-error border-error/30',
    warning: 'bg-warning/15 text-warning border-warning/30',
    info: 'bg-info/15 text-info border-info/30',
    running: 'bg-info/15 text-info border-info/30',
    default: 'bg-bg-tertiary text-text-secondary border-border',
    critical: 'bg-error/20 text-error border-error/40 font-semibold',
    high: 'bg-error/15 text-error border-error/30',
    medium: 'bg-warning/15 text-warning border-warning/30',
    low: 'bg-info/15 text-info border-info/30',
  };

  const glowStyles: Record<BadgeVariant, string> = {
    success: 'shadow-[0_0_8px_rgba(34,197,94,0.3)]',
    passed: 'shadow-[0_0_8px_rgba(34,197,94,0.3)]',
    error: 'shadow-[0_0_8px_rgba(248,81,73,0.3)]',
    failed: 'shadow-[0_0_8px_rgba(248,81,73,0.3)]',
    warning: 'shadow-[0_0_8px_rgba(245,158,11,0.3)]',
    info: 'shadow-[0_0_8px_rgba(88,166,255,0.3)]',
    running: 'shadow-[0_0_8px_rgba(88,166,255,0.3)]',
    default: '',
    critical: 'shadow-[0_0_10px_rgba(248,81,73,0.4)]',
    high: 'shadow-[0_0_8px_rgba(248,81,73,0.3)]',
    medium: 'shadow-[0_0_8px_rgba(245,158,11,0.3)]',
    low: 'shadow-[0_0_8px_rgba(88,166,255,0.3)]',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-1 rounded-md border font-medium uppercase tracking-wide transition-all duration-200',
        variants[finalVariant as BadgeVariant] || variants.default,
        sizes[size],
        glow && (glowStyles[finalVariant as BadgeVariant] || ''),
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}

export type { BadgeProps };
