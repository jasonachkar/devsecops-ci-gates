import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const variants = {
      primary: 'bg-info text-white hover:bg-info/90',
      secondary: 'bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/80 border border-border',
      ghost: 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-2 focus:ring-offset-bg-primary',
          'disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
