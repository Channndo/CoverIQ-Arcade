import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getGameBySlug } from '../data/games';

export const HUB_TAB = 'hub' as const;
export type ActiveTab = typeof HUB_TAB | string;

interface LauncherContextValue {
  activeTab: ActiveTab;
  openSlugs: string[];
  isHubActive: boolean;
  openGame: (slug: string) => void;
  closeGame: (slug: string) => void;
  focusHub: () => void;
  focusGame: (slug: string) => void;
  closeActiveGame: () => void;
  isGameOpen: (slug: string) => boolean;
}

const LauncherContext = createContext<LauncherContextValue | null>(null);

export function LauncherProvider({ children }: { children: ReactNode }) {
  const [openSlugs, setOpenSlugs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>(HUB_TAB);

  const openGame = useCallback((slug: string) => {
    if (!getGameBySlug(slug)) return;
    setOpenSlugs((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
    setActiveTab(slug);
  }, []);

  const closeGame = useCallback((slug: string) => {
    setOpenSlugs((prev) => {
      const next = prev.filter((s) => s !== slug);
      setActiveTab((current) => {
        if (current !== slug) return current;
        return next.length > 0 ? next[next.length - 1]! : HUB_TAB;
      });
      return next;
    });
  }, []);

  const focusHub = useCallback(() => setActiveTab(HUB_TAB), []);

  const focusGame = useCallback((slug: string) => {
    if (getGameBySlug(slug)) setActiveTab(slug);
  }, []);

  const closeActiveGame = useCallback(() => {
    if (activeTab === HUB_TAB) return;
    closeGame(activeTab);
  }, [activeTab, closeGame]);

  const isGameOpen = useCallback((slug: string) => openSlugs.includes(slug), [openSlugs]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeTab !== HUB_TAB) {
        e.preventDefault();
        focusHub();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTab, focusHub]);

  const value = useMemo(
    () => ({
      activeTab,
      openSlugs,
      isHubActive: activeTab === HUB_TAB,
      openGame,
      closeGame,
      focusHub,
      focusGame,
      closeActiveGame,
      isGameOpen,
    }),
    [
      activeTab,
      openSlugs,
      openGame,
      closeGame,
      focusHub,
      focusGame,
      closeActiveGame,
      isGameOpen,
    ],
  );

  return <LauncherContext.Provider value={value}>{children}</LauncherContext.Provider>;
}

export function useLauncher(): LauncherContextValue {
  const ctx = useContext(LauncherContext);
  if (!ctx) {
    throw new Error('useLauncher must be used within LauncherProvider');
  }
  return ctx;
}
