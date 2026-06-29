export const PLATFORM = {
  name: 'omni.games',
  tagline: 'The Omnistrata Arcade Universe',
  description:
    'A futuristic indie arcade ecosystem — retro soul, modern tech, infinite worlds.',
  version: '0.1.0',
  omnistrataUrl: 'https://omnistrata.com',
} as const;

export const ROUTES = {
  home: '/',
  games: '/#games',
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
