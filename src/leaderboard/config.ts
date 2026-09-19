const DEFAULT_SITE = 'https://cover-iq.com';

export function coveriqSiteUrl(): string {
  const env = (import.meta.env.VITE_COVERIQ_SITE_URL as string | undefined)?.replace(/\/$/, '');
  return env || DEFAULT_SITE;
}

export function arcadeStatsUrl(): string {
  const env = (import.meta.env.VITE_ARCADE_STATS_URL as string | undefined)?.replace(/\/$/, '');
  return env || `${coveriqSiteUrl()}/api/arcade-stats`;
}

export function coveriqSignupUrl(): string {
  return `${coveriqSiteUrl()}/signup`;
}

export const LEADERBOARD_GAMES = [
  {
    slug: 'car-planet',
    title: 'Car Planet',
    accent: '#00ff88',
    stats: [
      { key: 'day', label: 'Day reached' },
      { key: 'csi', label: 'Best CSI' },
      { key: 'ros', label: 'ROs written' },
    ],
  },
  {
    slug: 'auto-world',
    title: 'Auto World',
    accent: '#ffd700',
    stats: [
      { key: 'fights_won', label: 'Fights won' },
      { key: 'run_complete', label: 'Drive cleared' },
    ],
  },
] as const;

export type LeaderboardGameSlug = (typeof LEADERBOARD_GAMES)[number]['slug'];
