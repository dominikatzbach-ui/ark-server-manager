import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  Terminal,
  Plus,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/servers/new', icon: Plus, label: 'Server erstellen' },
  { to: '/config', icon: Settings, label: 'Konfiguration' },
  { to: '/logs', icon: Terminal, label: 'Logs' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-[rgb(var(--bg-surface))] border-r border-[rgb(var(--border))] min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[rgb(var(--border))]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[rgb(var(--primary))] flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-[rgb(var(--bg-base))]" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-[rgb(var(--text-primary))] leading-tight">
              ARK:SA
            </div>
            <div className="text-[10px] text-[rgb(var(--text-muted))] leading-tight tracking-wide uppercase">
              Server Manager
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="text-[10px] font-semibold text-[rgb(var(--text-muted))] uppercase tracking-widest px-2 pb-2">
          Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-[rgba(245,158,11,0.12)] text-[rgb(var(--primary))]'
                  : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))] hover:text-[rgb(var(--text-primary))]'
              )}
            >
              <item.icon
                className={cn(
                  'w-4 h-4 flex-shrink-0',
                  isActive ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--text-secondary))]'
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[rgb(var(--border))]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[rgb(var(--status-running))]" />
          <span className="text-xs text-[rgb(var(--text-muted))]">Manager v0.1.0</span>
        </div>
      </div>
    </aside>
  );
}
