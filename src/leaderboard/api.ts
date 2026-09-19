import { arcadeStatsUrl } from './config';
import type { LeaderboardResponse } from './types';

function failOpen(partial?: Partial<LeaderboardResponse>): LeaderboardResponse {
  return { ok: true, disabled: true, entries: [], you: null, ...partial };
}

export async function fetchLeaderboard(
  gameSlug: string,
  statKey: string,
  sessionToken?: string | null,
): Promise<LeaderboardResponse> {
  try {
    const url = new URL(arcadeStatsUrl());
    url.searchParams.set('game', gameSlug);
    url.searchParams.set('stat', statKey);
    url.searchParams.set('limit', '15');
    if (sessionToken) url.searchParams.set('me', '1');

    const headers: HeadersInit = { Accept: 'application/json' };
    if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;

    const res = await fetch(url.toString(), { headers });
    const data = (await res.json().catch(() => ({}))) as LeaderboardResponse;
    if (!res.ok || data.ok === false) return failOpen();
    return {
      ok: true,
      disabled: data.disabled,
      gameSlug: data.gameSlug ?? gameSlug,
      statKey: data.statKey ?? statKey,
      label: data.label,
      entries: data.entries ?? [],
      you: data.you ?? null,
    };
  } catch {
    return failOpen();
  }
}

export async function postArcadeStats(
  gameSlug: string,
  stats: Record<string, number>,
  sessionToken: string,
  extras?: { publicName?: string | null; avatarId?: string | null },
): Promise<boolean> {
  try {
    const res = await fetch(arcadeStatsUrl(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        gameSlug,
        stats,
        publicName: extras?.publicName ?? undefined,
        avatarId: extras?.avatarId ?? undefined,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; disabled?: boolean };
    return Boolean(res.ok && data.ok && !data.disabled);
  } catch {
    return false;
  }
}
