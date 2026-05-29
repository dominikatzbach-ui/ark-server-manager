import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-base))] disabled:opacity-50 disabled:pointer-events-none';

    const variants: Record<string, string> = {
      primary:
        'bg-[rgb(var(--primary))] text-[rgb(var(--bg-base))] hover:bg-[rgb(var(--primary-dim))] active:scale-[0.98] font-semibold',
      secondary:
        'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-overlay))] hover:border-[rgb(var(--border-strong))] active:scale-[0.98]',
      outline:
        'border border-[rgb(var(--border-strong))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary))] hover:text-[rgb(var(--primary))] active:scale-[0.98]',
      ghost:
        'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))] hover:text-[rgb(var(--text-primary))] active:scale-[0.98]',
      danger:
        'bg-[rgb(var(--status-crashed))] text-white hover:bg-red-600 active:scale-[0.98] font-semibold',
    };

    const sizes: Record<string, string> = {
      sm: 'h-7 px-3 text-xs',
      md: 'h-9 px-4 text-sm',
      lg: 'h-11 px-6 text-sm',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
