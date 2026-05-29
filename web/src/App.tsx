import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ServerDetail from './pages/ServerDetail'
import Layout from './components/Layout'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/servers/:id" element={<ServerDetail />} />
      </Routes>
    </Layout>
  )
}
