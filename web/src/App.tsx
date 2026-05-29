import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { ServerWizard } from '@/pages/ServerWizard';
import { ConfigEditor } from '@/pages/ConfigEditor';
import { LogViewer } from '@/pages/LogViewer';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/servers/new" element={<ServerWizard />} />
          <Route path="/config" element={<ConfigEditor />} />
          <Route path="/logs" element={<LogViewer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
