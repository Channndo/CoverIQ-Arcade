import type { Game } from '../types/game';

const base = import.meta.env.BASE_URL;

export const GAMES: Game[] = [
  {
    id: 'policy-quest',
    slug: 'policy-quest',
    title: 'Policy Quest',
    tagline: 'A Legend of Coverage',
    description:
      'Flagship insurance adventure — clear risks off the neighborhood, bind the right coverage, and face TOTALED in the Claims Cave.',
    genre: 'action',
    genreLabel: 'Action Adventure',
    status: 'live',
    featured: true,
    flagship: true,
    accentColor: '#e8c84a',
    secondaryColor: '#2a7d3f',
    pixelArtSeed: 'policyquest',
    repository: 'policy-quest',
    coverIQCompatible: true,
    coverImage: `${base}covers/policy-quest-cover.jpg`,
    playUrl: `${base}games/policy-quest/index.html`,
    leadDevCredit: 'omni.games',
  },
  {
    id: 'car-planet',
    slug: 'car-planet',
    title: 'Car Planet',
    tagline: 'Collect. Upgrade. Conquer the lot.',
    description:
      'Dealership exploration, vehicle collecting, retro RPG progression, and deep upgrade loops across an expandable automotive world.',
    genre: 'rpg',
    genreLabel: 'Collection RPG',
    status: 'beta',
    featured: true,
    accentColor: '#00ff88',
    secondaryColor: '#00ccff',
    pixelArtSeed: 'planet',
    repository: 'car-planet',
    coverIQCompatible: true,
    coverImage: `${base}covers/car-planet-cover.jpg`,
    playUrl: `${base}games/car-planet/index.html`,
    leadDevCredit: 'omni.games',
  },
  {
    id: 'auto-world',
    slug: 'auto-world',
    title: 'Auto World',
    tagline: 'Wrench forever. Fight for the lot.',
    description:
      'Side-view arcade brawler from the Car Planet universe — pick your tech and battle through the shop with punches, kicks, specials, and finisher combos.',
    genre: 'action',
    genreLabel: 'Arcade Fighter',
    status: 'beta',
    featured: true,
    accentColor: '#ffd700',
    secondaryColor: '#ff6b00',
    pixelArtSeed: 'autoworld',
    repository: 'auto-world',
    coverIQCompatible: true,
    coverImage: `${base}covers/auto-world-cover.jpg`,
    minAge: 13,
    playUrl: `${base}games/auto-world/index.html`,
    leadDevCredit: 'omni.games',
  },
];

export function getGameBySlug(slug: string): Game | undefined {
  return GAMES.find((g) => g.slug === slug);
}

export function getFeaturedGames(): Game[] {
  return GAMES.filter((g) => g.featured);
}

export function getComingSoonGames(): Game[] {
  return GAMES.filter((g) => g.status === 'coming-soon');
}
