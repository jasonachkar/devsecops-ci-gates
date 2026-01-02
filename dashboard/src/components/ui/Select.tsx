import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'flex w-full rounded-lg border border-dark-border-primary bg-dark-bg-tertiary',
          'px-3 py-2 text-sm text-dark-text-primary',
          'transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23a3a3a3\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_0.75rem_center] pr-8',
          className
        )}
        {...props}
      />
    );
  }
);
Select.displayName = 'Select';

export { Select };



