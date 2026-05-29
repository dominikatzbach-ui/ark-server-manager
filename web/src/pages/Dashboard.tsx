import { useEffect, useState } from 'react'
import { listServers, type Server } from '../api/client'

export default function Dashboard() {
  const [servers, setServers] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listServers()
      .then(setServers)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading servers...</p>
  if (error) return <p style={{ color: 'var(--color-danger)' }}>Error: {error}</p>

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Servers</h1>
      {servers.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>
          No servers configured yet. Add your first server to get started.
        </p>
      ) : (
        <ul>
          {servers.map((s) => (
            <li key={s.id}>{s.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
