/**
 * Button Component
 * Modern button with variants, sizes, and glow effects
 */

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', glow = false, ...props }, ref) => {
    const variants = {
      primary: 'bg-info text-white hover:bg-info/90 border-info/50',
      secondary: 'bg-bg-tertiary text-text-primary hover:bg-bg-elevated border-border hover:border-border-accent/30',
      ghost: 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary border-transparent',
      danger: 'bg-error text-white hover:bg-error/90 border-error/50',
      success: 'bg-success text-white hover:bg-success/90 border-success/50',
    };

    const sizes = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const glowStyles = {
      primary: 'shadow-glow-sm hover:shadow-glow',
      secondary: 'hover:shadow-glow-sm',
      ghost: '',
      danger: 'shadow-[0_0_10px_rgba(248,81,73,0.2)] hover:shadow-[0_0_15px_rgba(248,81,73,0.3)]',
      success: 'shadow-[0_0_10px_rgba(34,197,94,0.2)] hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium',
          'border transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-info/50 focus:ring-offset-2 focus:ring-offset-bg-primary',
          'disabled:opacity-50 disabled:pointer-events-none',
          'active:scale-[0.98]',
          variants[variant],
          sizes[size],
          glow && glowStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
