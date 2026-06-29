import type { ReactNode } from 'react';
import { useLauncher } from '../../context/LauncherContext';
import { AnimatedGrid } from '../effects/AnimatedGrid';
import { ParticleField } from '../effects/ParticleField';
import { CRTOverlay } from '../effects/CRTOverlay';
import { GameLauncher } from '../launcher/GameLauncher';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import './PageShell.css';

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  const { openSlugs } = useLauncher();
  const hasLauncher = openSlugs.length > 0;

  return (
    <div className={`page-shell${hasLauncher ? ' page-shell--launcher' : ''}`}>
      <AnimatedGrid />
      <ParticleField />
      <CRTOverlay />
      <Navbar />
      <main className="page-shell__main">{children}</main>
      <Footer />
      <GameLauncher />
    </div>
  );
}
