import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { arcadeStatsUrl, coveriqSignupUrl } from './config';
import { postArcadeStats } from './api';
import {
  identityRequest,
  isArcadeIdentity,
  tokenlessIdentity,
  type ArcadeIdentityPayload,
} from './protocol';
import type { ArcadeIdentityState } from './types';

interface ArcadeIdentityContextValue {
  identity: ArcadeIdentityState;
  sessionToken: string | null;
  publishStats: (gameSlug: string, stats: Record<string, number>) => Promise<void>;
}

const ArcadeIdentityContext = createContext<ArcadeIdentityContextValue | null>(null);

const signedOutIdentity = (): ArcadeIdentityState => ({
  signedIn: false,
  publicName: null,
  avatarId: null,
  signupUrl: coveriqSignupUrl(),
  statsApiUrl: arcadeStatsUrl(),
});

export function ArcadeIdentityProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<ArcadeIdentityState>(signedOutIdentity);
  const tokenRef = useRef<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const applyIdentity = useCallback((payload: ArcadeIdentityPayload) => {
    const token = payload.sessionToken && payload.sessionToken.length > 10 ? payload.sessionToken : null;
    tokenRef.current = payload.signedIn ? token : null;
    setSessionToken(tokenRef.current);
    setIdentity({
      signedIn: Boolean(payload.signedIn && tokenRef.current),
      publicName: payload.publicName,
      avatarId: payload.avatarId,
      signupUrl: payload.signupUrl || coveriqSignupUrl(),
      statsApiUrl: payload.statsApiUrl || arcadeStatsUrl(),
    });
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isArcadeIdentity(event.data)) return;
      applyIdentity(event.data);
    };
    window.addEventListener('message', onMessage);
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(identityRequest(), '*');
    }
    return () => window.removeEventListener('message', onMessage);
  }, [applyIdentity]);

  useEffect(() => {
    const forward = tokenlessIdentity({
      source: 'coveriq-arcade',
      type: 'identity',
      v: 1,
      signedIn: identity.signedIn,
      publicName: identity.publicName,
      avatarId: identity.avatarId,
      signupUrl: identity.signupUrl,
      statsApiUrl: identity.statsApiUrl,
      sessionToken: null,
    });
    for (const iframe of Array.from(document.querySelectorAll('iframe'))) {
      iframe.contentWindow?.postMessage(forward, '*');
    }
  }, [identity]);

  const publishStats = useCallback(
    async (gameSlug: string, stats: Record<string, number>) => {
      const token = tokenRef.current;
      if (!token || !identity.signedIn) return;
      await postArcadeStats(gameSlug, stats, token, {
        publicName: identity.publicName,
        avatarId: identity.avatarId,
      });
    },
    [identity.avatarId, identity.publicName, identity.signedIn],
  );

  const value = useMemo(
    () => ({ identity, sessionToken, publishStats }),
    [identity, publishStats, sessionToken],
  );

  return <ArcadeIdentityContext.Provider value={value}>{children}</ArcadeIdentityContext.Provider>;
}

export function useArcadeIdentity() {
  const ctx = useContext(ArcadeIdentityContext);
  if (!ctx) throw new Error('useArcadeIdentity must be used within ArcadeIdentityProvider');
  return ctx;
}
