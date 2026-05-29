const BASE = '/api/v1'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HTTP ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

export interface Server {
  id: string
  name: string
  status: 'stopped' | 'starting' | 'running' | 'stopping' | 'error'
  map: string
  port: number
}

export const listServers = () => request<Server[]>('/servers')
export const getServer = (id: string) => request<Server>(`/servers/${id}`)
export const startServer = (id: string) => request<void>(`/servers/${id}/start`, { method: 'POST' })
export const stopServer = (id: string) => request<void>(`/servers/${id}/stop`, { method: 'POST' })
export const deleteServer = (id: string) => request<void>(`/servers/${id}`, { method: 'DELETE' })
