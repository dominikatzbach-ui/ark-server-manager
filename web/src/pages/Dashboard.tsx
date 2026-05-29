import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Server, Cpu, Activity, RefreshCw, Zap } from 'lucide-react';
import type { Server as ServerType } from '@/types/server';
import { MOCK_SERVERS } from '@/api/client';
import { ServerCard } from '@/components/servers/ServerCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

function SummaryCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="surface-card px-4 py-4 flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: color ? `${color}18` : 'rgb(var(--bg-overlay))' }}
      >
        <span style={{ color: color ?? 'rgb(var(--text-muted))' }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <div className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{label}</div>
        <div className="text-xl font-bold text-[rgb(var(--text-primary))] leading-tight">{value}</div>
        {sub && <div className="text-[11px] text-[rgb(var(--text-muted))]">{sub}</div>}
      </div>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const [servers, setServers] = useState<ServerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadServers(silent = false) {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    await new Promise((r) => setTimeout(r, silent ? 500 : 800));
    setServers(MOCK_SERVERS);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { loadServers(); }, []);

  const running = servers.filter((s) => s.status === 'running');
  const stopped = servers.filter((s) => s.status === 'stopped');
  const crashed = servers.filter((s) => s.status === 'crashed');
  const totalPlayers = running.reduce((acc, s) => acc + s.currentPlayers, 0);
  const totalCpu = running.reduce((acc, s) => acc + (s.resources?.cpuPercent ?? 0), 0);
  const avgCpu = running.length > 0 ? Math.round(totalCpu / running.length) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[rgb(var(--text-primary))]">Server-Übersicht</h1>
          <p className="text-sm text-[rgb(var(--text-muted))] mt-0.5">
            {servers.length} Server konfiguriert · {running.length} online
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            loading={refreshing}
            onClick={() => loadServers(true)}
          >
            <RefreshCw className="w-4 h-4" />
            Aktualisieren
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/servers/new')}>
            <Plus className="w-4 h-4" />
            Neuer Server
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          icon={<Activity className="w-5 h-5" />}
          label="Online"
          value={running.length}
          sub={`von ${servers.length} Servern`}
          color="#10b981"
        />
        <SummaryCard
          icon={<Zap className="w-5 h-5" />}
          label="Spieler online"
          value={totalPlayers}
          sub="aktive Verbindungen"
          color="#f59e0b"
        />
        <SummaryCard
          icon={<Cpu className="w-5 h-5" />}
          label="Ø CPU"
          value={`${avgCpu}%`}
          sub="laufende Server"
          color={avgCpu > 80 ? '#ef4444' : '#3b82f6'}
        />
        <SummaryCard
          icon={<Server className="w-5 h-5" />}
          label="Gestoppt"
          value={stopped.length + crashed.length}
          sub={crashed.length > 0 ? `${crashed.length} abgestürzt` : 'alle kontrolliert'}
          color={crashed.length > 0 ? '#ef4444' : '#6b7280'}
        />
      </div>

      {/* Server grid */}
      {servers.length === 0 ? (
        <EmptyState onAdd={() => navigate('/servers/new')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {servers.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              onStart={(id) => {
                setServers((prev) =>
                  prev.map((s) => (s.id === id ? { ...s, status: 'running', currentPlayers: 0, resources: { cpuPercent: 5, ramUsedMb: 3200, ramTotalMb: 16384, uptimeSeconds: 0 } } : s))
                );
              }}
              onStop={(id) => {
                setServers((prev) =>
                  prev.map((s) => (s.id === id ? { ...s, status: 'stopped', currentPlayers: 0, resources: undefined } : s))
                );
              }}
              onDelete={(id) => {
                setServers((prev) => prev.filter((s) => s.id !== id));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="surface-card py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--bg-overlay))] flex items-center justify-center mx-auto mb-4">
        <Server className="w-8 h-8 text-[rgb(var(--text-muted))]" />
      </div>
      <h2 className="text-base font-semibold text-[rgb(var(--text-primary))] mb-1.5">
        Noch keine Server
      </h2>
      <p className="text-sm text-[rgb(var(--text-muted))] mb-6 max-w-xs mx-auto">
        Erstelle deinen ersten ARK:SA-Server mit dem Setup-Wizard.
      </p>
      <Button variant="primary" onClick={onAdd}>
        <Plus className="w-4 h-4" />
        Ersten Server erstellen
      </Button>
    </div>
  );
}
