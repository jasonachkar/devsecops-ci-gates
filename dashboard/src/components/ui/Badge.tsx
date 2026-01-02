import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: ReactNode;
  icon?: LucideIcon;
  status?: 'passed' | 'failed' | 'warning' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

const statusClasses = {
  passed: 'border-semantic-success-border bg-semantic-success-bg text-semantic-success',
  failed: 'border-semantic-error-border bg-semantic-error-bg text-semantic-error',
  warning: 'border-semantic-warning-border bg-semantic-warning-bg text-semantic-warning',
  info: 'border-semantic-info-border bg-semantic-info-bg text-semantic-info',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs font-medium',
  md: 'px-2.5 py-1 text-xs font-medium',
};

export function Badge({
  children,
  icon: Icon,
  status = 'info',
  size = 'md',
  className
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border',
        'transition-colors duration-150',
        statusClasses[status],
        sizeClasses[size],
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}
