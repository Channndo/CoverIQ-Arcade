import type { ComponentType } from 'react';
import { AgentMode } from './AgentMode';
import { CarPlanetEmbed } from './CarPlanetEmbed';
import { ClaimChaos } from './ClaimChaos';
import { RiskRush } from './RiskRush';
import { UninsuredMayhem } from './UninsuredMayhem';

export type BuiltinGameSlug =
  | 'uninsured-mayhem'
  | 'claim-chaos'
  | 'risk-rush'
  | 'agent-mode'
  | 'car-planet';

export interface BuiltinGameProps {
  active: boolean;
}

export const BUILTIN_GAMES: Record<BuiltinGameSlug, ComponentType<BuiltinGameProps>> = {
  'uninsured-mayhem': UninsuredMayhem,
  'claim-chaos': ClaimChaos,
  'risk-rush': RiskRush,
  'agent-mode': AgentMode,
  'car-planet': CarPlanetEmbed,
};

export function isBuiltinGame(slug: string): slug is BuiltinGameSlug {
  return slug in BUILTIN_GAMES;
}
