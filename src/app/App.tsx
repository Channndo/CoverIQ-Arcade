import { BrowserRouter } from 'react-router-dom';
import { LauncherProvider } from '../context/LauncherContext';
import { PageShell } from '../components/layout/PageShell';
import { AppRoutes } from './routes';

export function App() {
  return (
    <BrowserRouter>
      <LauncherProvider>
        <PageShell>
          <AppRoutes />
        </PageShell>
      </LauncherProvider>
    </BrowserRouter>
  );
}
