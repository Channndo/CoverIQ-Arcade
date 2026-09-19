import { BrowserRouter } from 'react-router-dom';
import { LauncherProvider } from '../context/LauncherContext';
import { ArcadeIdentityProvider } from '../leaderboard/ArcadeIdentityContext';
import { PageShell } from '../components/layout/PageShell';
import { AppRoutes } from './routes';

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ArcadeIdentityProvider>
        <LauncherProvider>
          <PageShell>
            <AppRoutes />
          </PageShell>
        </LauncherProvider>
      </ArcadeIdentityProvider>
    </BrowserRouter>
  );
}
