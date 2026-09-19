import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import type { Game } from '../../types/game';
import { useLauncher } from '../../context/LauncherContext';
import { Badge } from '../ui/Badge';
import { Tag } from '../ui/Tag';
import { GameCover } from './GameCover';
import { ComingSoonOverlay } from './ComingSoonOverlay';
import './GameCard.css';

interface GameCardProps {
  game: Game;
  index?: number;
}

export function GameCard({ game, index = 0 }: GameCardProps) {
  const { openGame, isGameOpen } = useLauncher();
  const style: CSSProperties = { ['--card-accent' as string]: game.accentColor };
  const isOpen = isGameOpen(game.slug);

  return (
    <motion.article
      className={`game-card${game.flagship ? ' game-card--flagship' : ''}${isOpen ? ' game-card--open' : ''}`}
      style={style}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
    >
      <button
        type="button"
        className="game-card__link"
        onClick={() => openGame(game.slug)}
        aria-label={`Launch ${game.title}`}
      >
        <div className="game-card__cabinet">
          <div className="game-card__marquee">
            <span className="game-card__marquee-text pixel-text">{game.title}</span>
          </div>
          <div className="game-card__screen">
            <GameCover game={game} />
            <ComingSoonOverlay />
          </div>
          <div className="game-card__panel">
            {game.flagship ? <Badge variant="flagship">Flagship</Badge> : null}
            <Tag label={game.genreLabel} color={game.accentColor} />
            {game.minAge ? <Badge variant="default">{game.minAge}+</Badge> : null}
            {isOpen ? <Badge variant="default">Open</Badge> : null}
          </div>
        </div>
        <div className="game-card__info">
          <h3 className="game-card__title">{game.title}</h3>
          <p className="game-card__tagline">{game.tagline}</p>
          <p className="game-card__description">{game.description}</p>
          {game.leadDevCredit ? (
            <span className="game-card__credit pixel-text">{game.leadDevCredit}</span>
          ) : null}
          <span className="game-card__launch pixel-text">
            {isOpen ? 'Switch to cabinet' : 'Launch cabinet'}
          </span>
        </div>
      </button>
    </motion.article>
  );
}
