import type { CSSProperties } from 'react';
import { useLauncher } from '../../context/LauncherContext';
import { getGameBySlug } from '../../data/games';
import { BUILTIN_GAMES, isBuiltinGame } from '../../games/registry';
import type { Game } from '../../types/game';
import { PixelArtPlaceholder } from '../arcade/PixelArtPlaceholder';
import './GameWindow.css';

function canEmbedExternal(game: Game): boolean {
  return Boolean(game.playUrl) && game.status !== 'coming-soon';
}

function GameWindowHeader({ game }: { game: Game }) {
  const { focusHub, closeGame } = useLauncher();

  return (
    <header className="game-window__header">
      <div className="game-window__title-wrap">
        <span className="game-window__title">{game.title}</span>
        <span className="game-window__tagline">{game.tagline}</span>
      </div>
      <div className="game-window__actions">
        <button type="button" className="game-window__btn game-window__btn--ghost" onClick={focusHub}>
          Arcade
        </button>
        <button
          type="button"
          className="game-window__btn game-window__btn--close"
          aria-label={`Close ${game.title}`}
          onClick={() => closeGame(game.slug)}
        >
          ×
        </button>
      </div>
    </header>
  );
}

function GameWindowPanel({
  game,
  isVisible,
  style,
}: {
  game: Game;
  isVisible: boolean;
  style: CSSProperties;
}) {
  const builtin = isBuiltinGame(game.slug);
  const Builtin = builtin ? BUILTIN_GAMES[game.slug as keyof typeof BUILTIN_GAMES] : null;
  const external = canEmbedExternal(game);

  return (
    <div
      className={`game-window${isVisible ? ' game-window--visible' : ''}`}
      style={style}
      role="dialog"
      aria-modal={isVisible}
      aria-label={`${game.title} cabinet`}
      aria-hidden={!isVisible}
    >
      <div className="game-window__frame">
        <GameWindowHeader game={game} />

        <div className={`game-window__screen${builtin ? ' game-window__screen--builtin' : ''}`}>
          {Builtin ? (
            <Builtin active={isVisible} />
          ) : external && game.playUrl ? (
            <iframe
              src={game.playUrl}
              title={game.title}
              className="game-window__iframe"
              allow="fullscreen; gamepad"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          ) : (
            <div className="game-window__placeholder">
              <PixelArtPlaceholder game={game} />
              <div className="game-window__coming-soon">
                <p className="pixel-text">Insert Coin — Coming Soon</p>
                <p className="game-window__repo">
                  Repo: <code>{game.repository}</code>
                </p>
              </div>
            </div>
          )}
        </div>

        <footer className="game-window__footer pixel-text">
          {builtin || external
            ? 'Esc → Arcade · Tabs to switch games'
            : 'Esc → Arcade · Game build not deployed yet'}
        </footer>
      </div>
    </div>
  );
}

export function GameWindows() {
  const { openSlugs, activeTab } = useLauncher();

  return (
    <>
      {openSlugs.map((slug) => {
        const game = getGameBySlug(slug);
        if (!game) return null;

        return (
          <GameWindowPanel
            key={slug}
            game={game}
            isVisible={activeTab === slug}
            style={{ ['--window-accent' as string]: game.accentColor }}
          />
        );
      })}
    </>
  );
}
