import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variantClasses = {
      primary: 'bg-gradient-purple text-white hover:opacity-90 border-transparent',
      secondary: 'border-dark-border-secondary bg-transparent text-dark-text-primary hover:bg-dark-bg-tertiary',
      ghost: 'border-transparent bg-transparent text-dark-text-secondary hover:bg-dark-bg-tertiary hover:text-dark-text-primary',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg border font-medium',
          'transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:ring-offset-2 focus:ring-offset-dark-bg-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };



