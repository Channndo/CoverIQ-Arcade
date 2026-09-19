import type { Game } from '../../types/game';
import { PixelArtPlaceholder } from './PixelArtPlaceholder';
import './GameCover.css';

interface GameCoverProps {
  game: Game;
  className?: string;
}

/** Official title-screen art when available; otherwise the generated pixel seed. */
export function GameCover({ game, className = '' }: GameCoverProps) {
  if (!game.coverImage) {
    return <PixelArtPlaceholder game={game} />;
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
