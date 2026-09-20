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
import { playModeMessage } from '../leaderboard/protocol';

export const HUB_TAB = 'hub' as const;
export type ActiveTab = typeof HUB_TAB | string;

interface LauncherContextValue {
  activeTab: ActiveTab;
  openSlugs: string[];
  isHubActive: boolean;
  playMode: boolean;
  openGame: (slug: string) => void;
  closeGame: (slug: string) => void;
  focusHub: () => void;
  focusGame: (slug: string) => void;
  closeActiveGame: () => void;
  enterPlayMode: () => void;
  exitPlayToArcade: () => void;
  isGameOpen: (slug: string) => boolean;
}

const LauncherContext = createContext<LauncherContextValue | null>(null);

function notifyPlayMode(active: boolean) {
  if (!window.parent || window.parent === window) return;
  try {
    window.parent.postMessage(playModeMessage(active), '*');
  } catch {
    /* standalone hub */
  }
}

function exitNativeFullscreen() {
  const doc = document as Document & {
    webkitExitFullscreen?: () => Promise<void> | void;
    msExitFullscreen?: () => Promise<void> | void;
    webkitFullscreenElement?: Element | null;
  };
  if (!document.fullscreenElement && !doc.webkitFullscreenElement) return;
  const exit = document.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
  if (exit) void Promise.resolve(exit.call(document)).catch(() => undefined);
}

export function LauncherProvider({ children }: { children: ReactNode }) {
  const [openSlugs, setOpenSlugs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>(HUB_TAB);
  const [playMode, setPlayMode] = useState(false);

  const setPlayModeActive = useCallback((active: boolean) => {
    setPlayMode(active);
    notifyPlayMode(active);
    if (!active) exitNativeFullscreen();
  }, []);

  const openGame = useCallback((slug: string) => {
    if (!getGameBySlug(slug)) return;
    setOpenSlugs((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
    setActiveTab(slug);
  }, []);

  const closeGame = useCallback((slug: string) => {
    setPlayModeActive(false);
    setOpenSlugs((prev) => {
      const next = prev.filter((s) => s !== slug);
      setActiveTab((current) => {
        if (current !== slug) return current;
        return next.length > 0 ? next[next.length - 1]! : HUB_TAB;
      });
      return next;
    });
  }, [setPlayModeActive]);

  const focusHub = useCallback(() => {
    setPlayModeActive(false);
    setActiveTab(HUB_TAB);
  }, [setPlayModeActive]);

  const focusGame = useCallback((slug: string) => {
    if (getGameBySlug(slug)) {
      setPlayModeActive(false);
      setActiveTab(slug);
    }
  }, [setPlayModeActive]);

  const closeActiveGame = useCallback(() => {
    if (activeTab === HUB_TAB) return;
    closeGame(activeTab);
  }, [activeTab, closeGame]);

  const enterPlayMode = useCallback(() => {
    if (activeTab === HUB_TAB) return;
    setPlayModeActive(true);
  }, [activeTab, setPlayModeActive]);

  const exitPlayToArcade = useCallback(() => {
    setPlayModeActive(false);
    if (activeTab !== HUB_TAB) closeGame(activeTab);
    else setActiveTab(HUB_TAB);
  }, [activeTab, closeGame, setPlayModeActive]);

  const isGameOpen = useCallback((slug: string) => openSlugs.includes(slug), [openSlugs]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || activeTab === HUB_TAB) return;
      if (playMode) {
        e.preventDefault();
        exitPlayToArcade();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTab, exitPlayToArcade, playMode]);

  const value = useMemo(
    () => ({
      activeTab,
      openSlugs,
      isHubActive: activeTab === HUB_TAB,
      playMode,
      openGame,
      closeGame,
      focusHub,
      focusGame,
      closeActiveGame,
      enterPlayMode,
      exitPlayToArcade,
      isGameOpen,
    }),
    [
      activeTab,
      openSlugs,
      playMode,
      openGame,
      closeGame,
      focusHub,
      focusGame,
      closeActiveGame,
      enterPlayMode,
      exitPlayToArcade,
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
