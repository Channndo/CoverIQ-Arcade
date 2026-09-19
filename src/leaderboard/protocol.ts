/** Keep in sync with coveriq-site `src/features/arcade-stats/protocol.ts`. */

export const ARCADE_MESSAGE_SOURCE = 'coveriq-arcade' as const;
export const ARCADE_PROTOCOL_VERSION = 1 as const;

export type ArcadeIdentityPayload = {
  source: typeof ARCADE_MESSAGE_SOURCE;
  type: 'identity';
  v: typeof ARCADE_PROTOCOL_VERSION;
  signedIn: boolean;
  publicName: string | null;
  avatarId: string | null;
  signupUrl: string;
  statsApiUrl: string;
  sessionToken?: string | null;
};

export type ArcadeIdentityRequest = {
  source: typeof ARCADE_MESSAGE_SOURCE;
  type: 'identity-request';
  v: typeof ARCADE_PROTOCOL_VERSION;
};

export type ArcadeStatsSnapshot = {
  source: typeof ARCADE_MESSAGE_SOURCE;
  type: 'stats-snapshot';
  v: typeof ARCADE_PROTOCOL_VERSION;
  gameSlug: string;
  stats: Record<string, number>;
};

export function isArcadeIdentity(data: unknown): data is ArcadeIdentityPayload {
  if (!data || typeof data !== 'object') return false;
  const msg = data as Partial<ArcadeIdentityPayload>;
  return msg.source === ARCADE_MESSAGE_SOURCE && msg.type === 'identity' && msg.v === ARCADE_PROTOCOL_VERSION;
}

export function isArcadeStatsSnapshot(data: unknown): data is ArcadeStatsSnapshot {
  if (!data || typeof data !== 'object') return false;
  const msg = data as Partial<ArcadeStatsSnapshot>;
  return msg.source === ARCADE_MESSAGE_SOURCE && msg.type === 'stats-snapshot';
}

export function identityRequest(): ArcadeIdentityRequest {
  return {
    source: ARCADE_MESSAGE_SOURCE,
    type: 'identity-request',
    v: ARCADE_PROTOCOL_VERSION,
  };
}

export function tokenlessIdentity(payload: ArcadeIdentityPayload): ArcadeIdentityPayload {
  return {
    source: ARCADE_MESSAGE_SOURCE,
    type: 'identity',
    v: ARCADE_PROTOCOL_VERSION,
    signedIn: payload.signedIn,
    publicName: payload.publicName,
    avatarId: payload.avatarId,
    signupUrl: payload.signupUrl,
    statsApiUrl: payload.statsApiUrl,
  };
}
