import { useNavigate } from 'react-router-dom';
import {
  Play,
  Square,
  Terminal,
  Settings,
  Users,
  Clock,
  MapPin,
  Trash2,
} from 'lucide-react';
import type { Server } from '@/types/server';
import { MAP_INFO } from '@/types/server';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatUptime, formatBytes } from '@/lib/utils';
import { useState } from 'react';

interface ServerCardProps {
  server: Server;
  onStart?: (id: string) => void;
  onStop?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ServerCard({ server, onStart, onStop, onDelete }: ServerCardProps) {
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const mapInfo = MAP_INFO[server.map];

  async function handleAction(action: 'start' | 'stop', fn?: (id: string) => void) {
    if (!fn) return;
    setActionLoading(action);
    try { await fn(server.id); }
    finally { setActionLoading(null); }
  }

  const isRunning = server.status === 'running';
  const isBusy = server.status === 'updating' || server.status === 'installing';

  return (
    <div
      className="surface-card overflow-hidden flex flex-col transition-all duration-200 hover:border-[rgb(var(--border-strong))] hover:shadow-xl hover:shadow-black/30"
      style={{ borderTopColor: mapInfo.color, borderTopWidth: '2px' }}
    >
      {/* Header */}
      <div className="px-4 py-3.5 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={server.status} />
            {server.resources && (
              <span className="text-[10px] text-[rgb(var(--text-muted))] font-mono">
                v{server.version}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] truncate leading-tight">
            {server.name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-[rgb(var(--text-muted))]" />
            <span className="text-xs text-[rgb(var(--text-muted))]">{mapInfo.label}</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4 grid grid-cols-3 gap-3 mb-3">
        <StatCell
          icon={<Users className="w-3 h-3" />}
          label="Spieler"
          value={`${server.currentPlayers}/${server.maxPlayers}`}
        />
        <StatCell
          icon={<Terminal className="w-3 h-3" />}
          label="Port"
          value={server.port.toString()}
        />
        {server.resources ? (
          <StatCell
            icon={<Clock className="w-3 h-3" />}
            label="Uptime"
            value={formatUptime(server.resources.uptimeSeconds)}
          />
        ) : (
          <StatCell icon={<Clock className="w-3 h-3" />} label="Status" value="—" />
        )}
      </div>

      {/* Resource meters (only when running) */}
      {server.resources && (
        <div className="px-4 space-y-2.5 mb-3">
          <ProgressBar
            label="CPU"
            sublabel={`${server.resources.cpuPercent}%`}
            value={server.resources.cpuPercent}
            showValue={false}
          />
          <ProgressBar
            label="RAM"
            sublabel={`${formatBytes(server.resources.ramUsedMb)} / ${formatBytes(server.resources.ramTotalMb)}`}
            value={server.resources.ramUsedMb}
            max={server.resources.ramTotalMb}
            showValue={false}
            color="primary"
          />
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-auto px-3 py-3 border-t border-[rgb(var(--border))] bg-[rgba(0,0,0,0.15)] flex items-center gap-2">
        {isRunning ? (
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            loading={actionLoading === 'stop'}
            onClick={() => handleAction('stop', onStop)}
          >
            <Square className="w-3.5 h-3.5" />
            Stoppen
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            loading={actionLoading === 'start'}
            disabled={isBusy}
            onClick={() => handleAction('start', onStart)}
          >
            <Play className="w-3.5 h-3.5" />
            Starten
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/logs?serverId=${server.id}`)}
          title="Logs anzeigen"
        >
          <Terminal className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/config?serverId=${server.id}`)}
          title="Konfiguration"
        >
          <Settings className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete?.(server.id)}
          title="Server löschen"
          className="text-[rgb(var(--status-crashed))] hover:text-red-400"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function StatCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1 text-[rgb(var(--text-muted))]">
        {icon}
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-sm font-mono font-medium text-[rgb(var(--text-primary))]">{value}</span>
    </div>
  );
}
