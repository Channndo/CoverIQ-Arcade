import type { Game } from '../types/game';

const base = import.meta.env.BASE_URL;

export const GAMES: Game[] = [
  {
    id: 'car-planet',
    slug: 'car-planet',
    title: 'Car Planet',
    tagline: 'Collect. Upgrade. Conquer the lot.',
    description:
      'Flagship universe — dealership exploration, vehicle collecting, retro RPG progression, and deep upgrade loops across an expandable automotive world.',
    genre: 'rpg',
    genreLabel: 'Collection RPG',
    status: 'beta',
    featured: true,
    flagship: true,
    accentColor: '#00ff88',
    secondaryColor: '#00ccff',
    pixelArtSeed: 'planet',
    repository: 'car-planet',
    coverIQCompatible: true,
    playUrl: `${base}games/car-planet/index.html`,
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
    playUrl: `${base}games/auto-world/index.html`,
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
