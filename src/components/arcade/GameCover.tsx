import type { Game } from '../../types/game';
import { PixelArtPlaceholder } from './PixelArtPlaceholder';
import './GameCover.css';

interface GameCoverProps {
  game: Game;
  className?: string;
}

/** Official title-screen art when available; otherwise a cabinet title card. */
export function GameCover({ game, className = '' }: GameCoverProps) {
  if (!game.coverImage) {
    return (
      <div
        className={`game-cover game-cover--title-card${game.flagship ? ' game-cover--flagship' : ''} ${className}`.trim()}
      >
        <PixelArtPlaceholder game={game} />
        <div className="game-cover__title-card">
          <span className="game-cover__mark" aria-hidden="true">
            1
          </span>
          <span className="game-cover__title-text">{game.title}</span>
          <span className="game-cover__title-tag">{game.tagline}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`game-cover${game.flagship ? ' game-cover--flagship' : ''} ${className}`.trim()}
    >
      <img
        src={game.coverImage}
        alt=""
        className="game-cover__image"
        draggable={false}
      />
    </div>
  );
}
