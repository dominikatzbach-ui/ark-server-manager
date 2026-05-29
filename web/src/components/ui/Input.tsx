import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  hint?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, startAdornment, endAdornment, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[rgb(var(--text-secondary))]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {startAdornment && (
            <div className="absolute left-3 text-[rgb(var(--text-muted))] flex items-center">
              {startAdornment}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-9 rounded-lg bg-[rgb(var(--bg-surface))] border text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))]',
              'transition-colors duration-150 focus:outline-none focus:border-[rgb(var(--primary))] focus:ring-1 focus:ring-[rgb(var(--primary))]/50',
              error
                ? 'border-[rgb(var(--status-crashed))]'
                : 'border-[rgb(var(--border))] hover:border-[rgb(var(--border-strong))]',
              startAdornment ? 'pl-10' : 'pl-3',
              endAdornment ? 'pr-10' : 'pr-3',
              className
            )}
            {...props}
          />
          {endAdornment && (
            <div className="absolute right-3 text-[rgb(var(--text-muted))] flex items-center">
              {endAdornment}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-[rgb(var(--status-crashed))]">{error}</p>}
        {hint && !error && <p className="text-xs text-[rgb(var(--text-muted))]">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[rgb(var(--text-secondary))]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg bg-[rgb(var(--bg-surface))] border px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] resize-y',
            'transition-colors duration-150 focus:outline-none focus:border-[rgb(var(--primary))] focus:ring-1 focus:ring-[rgb(var(--primary))]/50',
            error
              ? 'border-[rgb(var(--status-crashed))]'
              : 'border-[rgb(var(--border))] hover:border-[rgb(var(--border-strong))]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[rgb(var(--status-crashed))]">{error}</p>}
        {hint && !error && <p className="text-xs text-[rgb(var(--text-muted))]">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
