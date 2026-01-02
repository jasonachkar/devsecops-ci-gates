import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const styles = {
    success: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      color: '#22C55E',
      borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    error: {
      backgroundColor: 'rgba(248, 81, 73, 0.1)',
      color: '#F85149',
      borderColor: 'rgba(248, 81, 73, 0.2)',
    },
    warning: {
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      color: '#F59E0B',
      borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    info: {
      backgroundColor: 'rgba(88, 166, 255, 0.1)',
      color: '#58A6FF',
      borderColor: 'rgba(88, 166, 255, 0.2)',
    },
    default: {
      backgroundColor: '#21262D',
      color: '#8B949E',
      borderColor: '#30363D',
    },
  };

  const style = styles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}
