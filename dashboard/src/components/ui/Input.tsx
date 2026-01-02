import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex w-full rounded-lg border border-dark-border-primary bg-dark-bg-tertiary',
          'px-3 py-2 text-sm text-dark-text-primary',
          'placeholder:text-dark-text-tertiary',
          'transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };



