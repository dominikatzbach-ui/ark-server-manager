import { useParams } from 'react-router-dom'

export default function ServerDetail() {
  const { id } = useParams<{ id: string }>()

  return (
    <div>
      <h1>Server {id}</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>Server detail view — coming soon.</p>
    </div>
  )
}
