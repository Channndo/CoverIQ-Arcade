import type { Game } from '../types/game';

export const GAMES: Game[] = [
  {
    id: 'uninsured-mayhem',
    slug: 'uninsured-mayhem',
    title: 'Uninsured Mayhem',
    tagline: 'Highway chaos. Zero coverage.',
    description:
      'Fast-paced arcade highway chaos. Dodge disasters, outrun liability, and survive the uninsured streets.',
    genre: 'arcade',
    genreLabel: 'Arcade Action',
    status: 'beta',
    featured: true,
    accentColor: '#ff2d55',
    secondaryColor: '#ff9500',
    pixelArtSeed: 'mayhem',
    repository: 'uninsured-mayhem',
    coverIQCompatible: true,
  },
  {
    id: 'claim-chaos',
    slug: 'claim-chaos',
    title: 'Claim Chaos',
    tagline: 'Disaster defense. Claim survival.',
    description:
      'Arcade disaster survival and defense. Hold the line against escalating catastrophes before the claim window closes.',
    genre: 'survival',
    genreLabel: 'Survival Defense',
    status: 'beta',
    featured: true,
    accentColor: '#00f0ff',
    secondaryColor: '#0066ff',
    pixelArtSeed: 'chaos',
    repository: 'claim-chaos',
    coverIQCompatible: true,
  },
  {
    id: 'risk-rush',
    slug: 'risk-rush',
    title: 'Risk Rush',
    tagline: 'React fast. Risk smarter.',
    description:
      'Fast-paced reaction and risk management arcade. Split-second decisions, escalating stakes, pure adrenaline.',
    genre: 'action',
    genreLabel: 'Reaction Arcade',
    status: 'beta',
    featured: true,
    accentColor: '#ffe156',
    secondaryColor: '#ff6b00',
    pixelArtSeed: 'rush',
    repository: 'risk-rush',
    coverIQCompatible: true,
  },
  {
    id: 'agent-mode',
    slug: 'agent-mode',
    title: 'Agent Mode',
    tagline: 'Build the agency. Master the grind.',
    description:
      'Slow-burn insurance agency management simulator inspired by retro tycoon and progression systems. Grow your empire one policy at a time.',
    genre: 'simulation',
    genreLabel: 'Tycoon Sim',
    status: 'beta',
    featured: false,
    accentColor: '#b24bff',
    secondaryColor: '#6b2fff',
    pixelArtSeed: 'agent',
    repository: 'agent-mode',
    coverIQCompatible: true,
  },
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
    playUrl: '/games/car-planet/index.html',
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
