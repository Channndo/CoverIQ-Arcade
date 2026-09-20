import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLauncher } from '../../context/LauncherContext';
import { getGameBySlug } from '../../data/games';
import { isAgeVerified, setAgeVerified } from '../../lib/ageGate';
import { BUILTIN_GAMES, isBuiltinGame } from '../../games/registry';
import type { Game } from '../../types/game';
import { AgeGate } from '../arcade/AgeGate';
import { GameCover } from '../arcade/GameCover';
import './GameWindow.css';

function canEmbedExternal(game: Game): boolean {
  return Boolean(game.playUrl) && game.status !== 'coming-soon';
}

type FullscreenCapableElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

function requestFullscreen(el: HTMLElement | null) {
  if (!el) return;
  const target = el as FullscreenCapableElement;
  const req =
    target.requestFullscreen || target.webkitRequestFullscreen || target.msRequestFullscreen;
  if (!req) {
    return;
  }
  Promise.resolve(req.call(target)).catch(() => {
    /* CSS play-mode already fills the viewport when native fullscreen is blocked. */
  });
}

function GameWindowHeader({
  game,
  canFullscreen,
  onFullscreen,
}: {
  game: Game;
  canFullscreen: boolean;
  onFullscreen: () => void;
}) {
  const { focusHub, closeGame } = useLauncher();

  return (
    <header className="game-window__header">
      <div className="game-window__title-wrap">
        <span className="game-window__title">{game.title}</span>
        <span className="game-window__tagline">{game.tagline}</span>
      </div>
      <div className="game-window__actions">
        {canFullscreen && (
          <button
            type="button"
            className="game-window__btn game-window__btn--ghost"
            aria-label={`Play ${game.title} in full screen`}
            onClick={onFullscreen}
          >
            ⛶ Full Screen
          </button>
        )}
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
  const { playMode, enterPlayMode, exitPlayToArcade } = useLauncher();
  const builtin = isBuiltinGame(game.slug);
  const Builtin = builtin ? BUILTIN_GAMES[game.slug as keyof typeof BUILTIN_GAMES] : null;
  const external = canEmbedExternal(game);
  const windowRef = useRef<HTMLDivElement | null>(null);
  const minAge = game.minAge;
  const needsAgeGate = typeof minAge === 'number' && minAge > 0;
  const [ageOk, setAgeOk] = useState(() => (needsAgeGate ? isAgeVerified(game.slug) : true));
  const gated = needsAgeGate && !ageOk;
  const playable = (builtin || external) && !gated;
  const isPlay = playMode && isVisible;

  useEffect(() => {
    if (!isPlay) return;
    requestFullscreen(windowRef.current);
  }, [isPlay]);

  return (
    <div
      ref={windowRef}
      className={`game-window${isVisible ? ' game-window--visible' : ''}${isPlay ? ' game-window--play' : ''}`}
      style={style}
      role="dialog"
      aria-modal={isVisible}
      aria-label={`${game.title} cabinet`}
      aria-hidden={!isVisible}
    >
      {isPlay && (
        <button
          type="button"
          className="game-window__exit"
          aria-label="Exit fullscreen and return to Arcade"
          onClick={exitPlayToArcade}
        >
          ×
        </button>
      )}

      <div className="game-window__frame">
        <GameWindowHeader
          game={game}
          canFullscreen={playable}
          onFullscreen={enterPlayMode}
        />

        <div
          className={`game-window__screen${builtin ? ' game-window__screen--builtin' : ''}`}
        >
          {gated && minAge ? (
            <AgeGate
              game={game}
              minAge={minAge}
              onVerified={() => {
                setAgeVerified(game.slug);
                setAgeOk(true);
              }}
            />
          ) : Builtin ? (
            <Builtin active={isVisible} />
          ) : external && game.playUrl ? (
            <iframe
              src={game.playUrl}
              title={game.title}
              className="game-window__iframe"
              allow="fullscreen; gamepad"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          ) : (
            <div className="game-window__placeholder">
              <GameCover game={game} />
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
          {gated
            ? 'Age verification required · Esc → Arcade'
            : playable
              ? '⛶ Full Screen fills the device · × returns to Arcade'
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
