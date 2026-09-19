import { useCallback, useEffect, useRef } from 'react';
import { useArcadeIdentity } from './ArcadeIdentityContext';
import {
  ARCADE_MESSAGE_SOURCE,
  ARCADE_PROTOCOL_VERSION,
  isArcadeStatsSnapshot,
  tokenlessIdentity,
} from './protocol';

export function useGameIframeBridge(gameSlug: string) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { identity, publishStats } = useArcadeIdentity();

  const postIdentity = useCallback(() => {
    const frame = iframeRef.current?.contentWindow;
    if (!frame) return;
    frame.postMessage(
      tokenlessIdentity({
        source: ARCADE_MESSAGE_SOURCE,
        type: 'identity',
        v: ARCADE_PROTOCOL_VERSION,
        signedIn: identity.signedIn,
        publicName: identity.publicName,
        avatarId: identity.avatarId,
        signupUrl: identity.signupUrl,
        statsApiUrl: identity.statsApiUrl,
      }),
      '*',
    );
  }, [identity]);

  useEffect(() => {
    postIdentity();
  }, [postIdentity, gameSlug]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { source?: string; type?: string } | null;
      if (data?.source === ARCADE_MESSAGE_SOURCE && data.type === 'identity-request') {
        postIdentity();
        return;
      }
      if (!isArcadeStatsSnapshot(event.data)) return;
      if (event.data.gameSlug !== gameSlug) return;
      void publishStats(gameSlug, event.data.stats);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [gameSlug, postIdentity, publishStats]);

  return { iframeRef, onFrameLoad: postIdentity };
}
