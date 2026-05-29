import type { Server, ServerConfig } from '@/types/server';

const BASE = '/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string }>('/health'),
  servers: {
    list: () => request<Server[]>('/servers'),
    get: (id: string) => request<Server>(`/servers/${id}`),
    create: (config: ServerConfig) =>
      request<Server>('/servers', { method: 'POST', body: JSON.stringify(config) }),
    delete: (id: string) =>
      request<void>(`/servers/${id}`, { method: 'DELETE' }),
    start: (id: string) =>
      request<void>(`/servers/${id}/start`, { method: 'POST' }),
    stop: (id: string) =>
      request<void>(`/servers/${id}/stop`, { method: 'POST' }),
  },
};

// --- Mock data for UI development ---
export const MOCK_SERVERS: Server[] = [
  {
    id: '1',
    name: 'PvP Island #1',
    map: 'TheIsland',
    status: 'running',
    port: 7777,
    queryPort: 27015,
    rconPort: 32330,
    maxPlayers: 70,
    currentPlayers: 12,
    version: '35.15',
    lastStarted: new Date(Date.now() - 3600 * 5 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 86400 * 7 * 1000).toISOString(),
    resources: { cpuPercent: 34, ramUsedMb: 6400, ramTotalMb: 16384, uptimeSeconds: 18000 },
  },
  {
    id: '2',
    name: 'PvE Fjordur',
    map: 'Fjordur',
    status: 'running',
    port: 7779,
    queryPort: 27017,
    rconPort: 32332,
    maxPlayers: 50,
    currentPlayers: 3,
    version: '35.15',
    lastStarted: new Date(Date.now() - 3600 * 2 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 86400 * 14 * 1000).toISOString(),
    resources: { cpuPercent: 18, ramUsedMb: 4200, ramTotalMb: 16384, uptimeSeconds: 7200 },
  },
  {
    id: '3',
    name: 'Hardcore Aberration',
    map: 'Aberration',
    status: 'stopped',
    port: 7781,
    queryPort: 27019,
    rconPort: 32334,
    maxPlayers: 30,
    currentPlayers: 0,
    version: '35.12',
    createdAt: new Date(Date.now() - 86400 * 3 * 1000).toISOString(),
  },
  {
    id: '4',
    name: 'Genesis Cluster',
    map: 'Genesis2',
    status: 'updating',
    port: 7783,
    queryPort: 27021,
    rconPort: 32336,
    maxPlayers: 40,
    currentPlayers: 0,
    createdAt: new Date(Date.now() - 86400 * 1 * 1000).toISOString(),
  },
];
