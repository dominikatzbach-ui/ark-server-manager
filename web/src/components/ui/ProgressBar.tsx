import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  color?: 'default' | 'warning' | 'danger' | 'primary';
  size?: 'sm' | 'md';
  className?: string;
  showValue?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  sublabel,
  color = 'default',
  size = 'sm',
  className,
  showValue,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  const autoColor = color === 'default' ? (pct >= 90 ? 'danger' : pct >= 70 ? 'warning' : 'default') : color;

  const trackColors: Record<string, string> = {
    default: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    primary: 'bg-[rgb(var(--primary))]',
  };

  const trackSize: Record<string, string> = {
    sm: 'h-1.5',
    md: 'h-2',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || sublabel || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex flex-col">
            {label && <span className="text-xs text-[rgb(var(--text-secondary))]">{label}</span>}
            {sublabel && <span className="text-[10px] text-[rgb(var(--text-muted))]">{sublabel}</span>}
          </div>
          {showValue && (
            <span className="text-xs font-mono text-[rgb(var(--text-muted))]">{pct}%</span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-[rgb(var(--bg-overlay))] rounded-full overflow-hidden', trackSize[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', trackColors[autoColor])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
