import type { CSSProperties } from 'react';
import type { Game } from '../../types/game';
import './PixelArtPlaceholder.css';

interface PixelArtPlaceholderProps {
  game: Game;
}

/** Procedural pixel-art style placeholder from game seed + colors */
export function PixelArtPlaceholder({ game }: PixelArtPlaceholderProps) {
  const cells = generatePattern(game.pixelArtSeed, game.flagship ? 12 : 8);

  return (
    <div
      className={`pixel-art${game.flagship ? ' pixel-art--flagship' : ''}`}
      style={{
        '--art-primary': game.accentColor,
        '--art-secondary': game.secondaryColor,
      } as CSSProperties}
      aria-hidden="true"
    >
      <div className="pixel-art__grid">
        {cells.map((on, i) => (
          <span key={i} className={`pixel-art__cell${on ? ' pixel-art__cell--on' : ''}`} />
        ))}
      </div>
    </div>
  );
}

function generatePattern(seed: string, size: number): boolean[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    cells.push((hash % 3) !== 0);
  }
  return cells;
}
