import type { ComponentType } from 'react';
import { AutoWorldEmbed } from './AutoWorldEmbed';
import { CarPlanetEmbed } from './CarPlanetEmbed';
import { PolicyQuestEmbed } from './PolicyQuestEmbed';

export type BuiltinGameSlug = 'policy-quest' | 'car-planet' | 'auto-world';

export interface BuiltinGameProps {
  active: boolean;
}

export const BUILTIN_GAMES: Record<BuiltinGameSlug, ComponentType<BuiltinGameProps>> = {
  'policy-quest': PolicyQuestEmbed,
  'car-planet': CarPlanetEmbed,
  'auto-world': AutoWorldEmbed,
};

export function isBuiltinGame(slug: string): slug is BuiltinGameSlug {
  return slug in BUILTIN_GAMES;
}
