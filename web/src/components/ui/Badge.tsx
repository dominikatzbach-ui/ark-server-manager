import { cn } from '@/lib/utils';
import type { ServerStatus } from '@/types/server';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'running' | 'stopped' | 'crashed' | 'updating' | 'installing' | 'primary';
  className?: string;
  dot?: boolean;
}

const VARIANT_STYLES: Record<string, string> = {
  default: 'bg-[rgb(var(--bg-overlay))] text-[rgb(var(--text-secondary))] border border-[rgb(var(--border))]',
  running: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  stopped: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
  crashed: 'bg-red-500/10 text-red-400 border border-red-500/20',
  updating: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  installing: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  primary: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
};

const DOT_STYLES: Record<string, string> = {
  running: 'bg-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.8)]',
  stopped: 'bg-gray-400',
  crashed: 'bg-red-400 shadow-[0_0_4px_rgba(239,68,68,0.8)]',
  updating: 'bg-blue-400 shadow-[0_0_4px_rgba(59,130,246,0.8)]',
  installing: 'bg-violet-400',
  default: 'bg-[rgb(var(--text-muted))]',
  primary: 'bg-amber-400',
};

export function Badge({ children, variant = 'default', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        VARIANT_STYLES[variant] ?? VARIANT_STYLES.default,
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            DOT_STYLES[variant] ?? DOT_STYLES.default
          )}
        />
      )}
      {children}
    </span>
  );
}

const STATUS_LABELS: Record<ServerStatus, string> = {
  running: 'Online',
  stopped: 'Gestoppt',
  crashed: 'Abgestürzt',
  updating: 'Update',
  installing: 'Installation',
};

export function StatusBadge({ status }: { status: ServerStatus }) {
  return (
    <Badge variant={status} dot>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
