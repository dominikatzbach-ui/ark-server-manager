import { cn } from '@/lib/utils';
import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, children, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[rgb(var(--text-secondary))]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-9 rounded-lg bg-[rgb(var(--bg-surface))] border pl-3 pr-9 text-sm text-[rgb(var(--text-primary))] appearance-none',
              'transition-colors duration-150 focus:outline-none focus:border-[rgb(var(--primary))] focus:ring-1 focus:ring-[rgb(var(--primary))]/50',
              error
                ? 'border-[rgb(var(--status-crashed))]'
                : 'border-[rgb(var(--border))] hover:border-[rgb(var(--border-strong))]',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-muted))] pointer-events-none" />
        </div>
        {error && <p className="text-xs text-[rgb(var(--status-crashed))]">{error}</p>}
        {hint && !error && <p className="text-xs text-[rgb(var(--text-muted))]">{hint}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
