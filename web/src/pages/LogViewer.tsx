import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Lock, Unlock, Download, Trash2, Play, Square, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_SERVERS } from '@/api/client';
import { Button } from '@/components/ui/Button';

type LogLevel = 'all' | 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  id: number;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug' | 'success';
  message: string;
}

const LOG_LEVEL_COLORS: Record<string, string> = {
  info: 'text-[rgb(var(--text-secondary))]',
  warn: 'text-amber-400',
  error: 'text-red-400',
  debug: 'text-violet-400',
  success: 'text-emerald-400',
};

const LOG_LEVEL_LABELS: Record<string, string> = {
  info: 'INFO',
  warn: 'WARN',
  error: 'ERR ',
  debug: 'DBG ',
  success: 'OK  ',
};

// --- Generate realistic ARK server log entries ---
const MOCK_LOG_MESSAGES: Array<{ level: LogEntry['level']; message: string }> = [
  { level: 'info', message: 'ARK:SA Server Manager v0.1.0 starting up...' },
  { level: 'info', message: 'Initializing SteamCMD at /opt/steamcmd' },
  { level: 'success', message: 'SteamCMD initialized successfully' },
  { level: 'info', message: 'Loading server configuration from config.ini' },
  { level: 'info', message: 'Starting ArkAscendedServer.exe via Wine/Proton' },
  { level: 'debug', message: 'PROTON_LOG=1 WINEDEBUG=fixme-all' },
  { level: 'info', message: '[ShooterGameServer] Server Name: PvP Island #1' },
  { level: 'info', message: '[ShooterGameServer] Map: TheIsland_WP' },
  { level: 'info', message: '[ShooterGameServer] Max Players: 70' },
  { level: 'info', message: '[ShooterGameServer] Game Port: 7777' },
  { level: 'info', message: '[ShooterGameServer] Query Port: 27015' },
  { level: 'info', message: '[ShooterGameServer] Starting world load...' },
  { level: 'info', message: '[ShooterGameServer] Loading save file: TheIsland_WP.ark' },
  { level: 'warn', message: '[ShooterGameServer] Save file not found, creating new world' },
  { level: 'info', message: '[ShooterGameServer] Spawning dinos...' },
  { level: 'info', message: '[ShooterGameServer] World load complete (87.3s)' },
  { level: 'success', message: '[ShooterGameServer] Server is now ready for connections!' },
  { level: 'info', message: '[ShooterGameServer] Player "DinoBoss" joined (SteamID: 76561198123456789)' },
  { level: 'info', message: '[ShooterGameServer] Player "SurvivalKing" joined (SteamID: 76561198987654321)' },
  { level: 'debug', message: '[Networking] Tick rate: 30fps | Bandwidth: 2.4MB/s' },
  { level: 'warn', message: '[ShooterGameServer] High ping detected for player "LagSurfer" (423ms)' },
  { level: 'info', message: '[ShooterGameServer] Auto-save triggered' },
  { level: 'success', message: '[ShooterGameServer] World saved successfully (12.4s)' },
  { level: 'error', message: '[Steam] SteamAPI connection lost, retrying...' },
  { level: 'info', message: '[Steam] SteamAPI reconnected' },
  { level: 'info', message: '[ShooterGameServer] Player "DinoBoss" killed dinosaur Rex_Character_BP_C (Level 45)' },
  { level: 'debug', message: '[Memory] RSS: 6.2GB | Heap: 4.8GB | External: 1.4GB' },
  { level: 'info', message: '[RCON] Admin "admin" executed: admincheat settime 12' },
  { level: 'info', message: '[ShooterGameServer] Player "SurvivalKing" disconnected (timeout)' },
  { level: 'warn', message: '[ShooterGameServer] Memory usage above 90%: 14.7GB / 16GB' },
  { level: 'error', message: '[ShooterGameServer] FATAL: Out of memory - server will restart' },
];

function generateLogs(count: number): LogEntry[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const src = MOCK_LOG_MESSAGES[i % MOCK_LOG_MESSAGES.length];
    const ts = new Date(now - (count - i) * 2000);
    return {
      id: i,
      timestamp: ts.toTimeString().slice(0, 8),
      level: src.level,
      message: src.message,
    };
  });
}

export function LogViewer() {
  const [searchParams] = useSearchParams();
  const serverId = searchParams.get('serverId');
  const server = MOCK_SERVERS.find((s) => s.id === serverId) ?? MOCK_SERVERS[0];

  const [logs, setLogs] = useState<LogEntry[]>(() => generateLogs(30));
  const [filter, setFilter] = useState<LogLevel>('all');
  const [search, setSearch] = useState('');
  const [scrollLock, setScrollLock] = useState(true);
  const [streaming, setStreaming] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef(30);

  // Simulate live log streaming
  useEffect(() => {
    if (!streaming) return;
    const interval = setInterval(() => {
      const src = MOCK_LOG_MESSAGES[counterRef.current % MOCK_LOG_MESSAGES.length];
      const entry: LogEntry = {
        id: counterRef.current,
        timestamp: new Date().toTimeString().slice(0, 8),
        level: src.level,
        message: src.message,
      };
      counterRef.current++;
      setLogs((prev) => [...prev.slice(-500), entry]);
    }, 1800);
    return () => clearInterval(interval);
  }, [streaming]);

  // Auto-scroll when locked
  useEffect(() => {
    if (scrollLock && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, scrollLock]);

  const filtered = logs.filter((l) => {
    const matchesLevel = filter === 'all' || l.level === filter;
    const matchesSearch = !search || l.message.toLowerCase().includes(search.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  function handleDownload() {
    const text = filtered
      .map((l) => `${l.timestamp} [${LOG_LEVEL_LABELS[l.level]}] ${l.message}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${server.name}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const FILTER_TABS: { id: LogLevel; label: string; color?: string }[] = [
    { id: 'all', label: 'Alle' },
    { id: 'info', label: 'Info' },
    { id: 'warn', label: 'Warnung', color: 'text-amber-400' },
    { id: 'error', label: 'Fehler', color: 'text-red-400' },
    { id: 'debug', label: 'Debug', color: 'text-violet-400' },
  ];

  const errorCount = logs.filter((l) => l.level === 'error').length;
  const warnCount = logs.filter((l) => l.level === 'warn').length;

  return (
    <div className="flex flex-col h-screen p-4 gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-base font-bold text-[rgb(var(--text-primary))]">Live-Logs</h1>
          <p className="text-xs text-[rgb(var(--text-muted))]">{server.name}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status counters */}
          {errorCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              <Circle className="w-2 h-2 fill-current" />
              {errorCount} Fehler
            </span>
          )}
          {warnCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
              {warnCount} Warnungen
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={() => setLogs([])}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={scrollLock ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setScrollLock((v) => !v)}
            title={scrollLock ? 'Scroll-Lock aktiv' : 'Scroll-Lock inaktiv'}
          >
            {scrollLock ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            {scrollLock ? 'Gesperrt' : 'Entsperrt'}
          </Button>
          <Button
            variant={streaming ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setStreaming((v) => !v)}
          >
            {streaming ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {streaming ? 'Pause' : 'Live'}
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[rgb(var(--text-muted))] pointer-events-none" />
          <input
            type="text"
            placeholder="Logs durchsuchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 rounded-lg bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border))] pl-8 pr-3 text-xs text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:border-[rgb(var(--primary))] transition-colors"
          />
        </div>

        {/* Level filter */}
        <div className="flex items-center gap-1 p-1 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border))] rounded-lg">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150',
                filter === tab.id
                  ? 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] shadow-sm'
                  : `text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-secondary))] ${tab.color ?? ''}`
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-[rgb(var(--text-muted))] ml-auto">
          {filtered.length} von {logs.length} Zeilen
        </span>
      </div>

      {/* Log terminal */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-4 font-mono"
        onScroll={(e) => {
          const el = e.currentTarget;
          const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20;
          if (!isAtBottom && scrollLock) setScrollLock(false);
        }}
      >
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[rgb(var(--text-muted))] text-sm">
            Keine Log-Einträge
          </div>
        ) : (
          <div className="space-y-0">
            {filtered.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 log-line hover:bg-white/[0.02] px-1 py-0.5 rounded"
              >
                <span className="text-[rgb(var(--text-muted))] flex-shrink-0 text-[11px]">{entry.timestamp}</span>
                <span
                  className={cn(
                    'flex-shrink-0 text-[11px] font-bold w-8',
                    LOG_LEVEL_COLORS[entry.level]
                  )}
                >
                  {LOG_LEVEL_LABELS[entry.level]}
                </span>
                <span className={cn('flex-1 min-w-0 text-[11px]', LOG_LEVEL_COLORS[entry.level])}>
                  {entry.message}
                </span>
              </div>
            ))}
            {streaming && (
              <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-[rgb(var(--text-muted))]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live-Stream aktiv
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
