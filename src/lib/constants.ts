export const PLATFORM = {
  name: 'Square1 Arcade',
  studio: 'Square1 Studios',
  tagline: 'A Square1 Studios Universe',
  description:
    'A futuristic indie arcade universe — retro soul, modern tech, infinite worlds.',
  version: '0.1.0',
  omnistrataUrl: 'https://omnistrata.com',
  /** Lead-developer imprint under Omnistrata (Chandler Hill). */
  leadDevCredit: 'omni.games — lead development by Chandler Hill',
} as const;

export const ROUTES = {
  home: '/',
  games: '/#games',
  boards: '/#boards',
  ecosystem: '/#ecosystem',
  comingSoon: '/#coming-soon',
  game: (slug: string) => `/games/${slug}`,
} as const;

export const FUTURE_FEATURES = [
  'Authentication',
  'Leaderboards',
  'Player Profiles',
  'Cloud Saves',
  'Achievements',
  'Multiplayer',
  'Ecosystem Integrations',
] as const;
