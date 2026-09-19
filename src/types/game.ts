export type GameStatus = 'coming-soon' | 'alpha' | 'beta' | 'live';

export type GameGenre =
  | 'arcade'
  | 'action'
  | 'survival'
  | 'strategy'
  | 'simulation'
  | 'rpg'
  | 'collection';

export interface Game {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  genre: GameGenre;
  genreLabel: string;
  status: GameStatus;
  featured: boolean;
  flagship?: boolean;
  accentColor: string;
  secondaryColor: string;
  pixelArtSeed: string;
  repository: string;
  coverIQCompatible: boolean;
  /** Deployed game URL for iframe embed (null = placeholder until live) */
  playUrl?: string | null;
  /** Lead-developer credit / imprint shown subtly on the card (e.g. omni.games). */
  leadDevCredit?: string;
}
