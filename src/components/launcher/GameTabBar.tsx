import type { CSSProperties } from 'react';
import { useLauncher, HUB_TAB } from '../../context/LauncherContext';
import { getGameBySlug } from '../../data/games';
import './GameTabBar.css';

export function GameTabBar() {
  const { activeTab, openSlugs, focusHub, focusGame, closeGame } = useLauncher();

  if (openSlugs.length === 0) return null;

  return (
    <div className="game-tab-bar" role="tablist" aria-label="Open games">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === HUB_TAB}
        className={`game-tab${activeTab === HUB_TAB ? ' game-tab--active' : ''}`}
        onClick={focusHub}
      >
        <span className="game-tab__icon" aria-hidden="true">
          ◈
        </span>
        <span className="game-tab__label">Arcade</span>
      </button>

      {openSlugs.map((slug) => {
        const game = getGameBySlug(slug);
        if (!game) return null;

        return (
          <div
            key={slug}
            className={`game-tab game-tab--game${activeTab === slug ? ' game-tab--active' : ''}`}
            style={{ ['--tab-accent' as string]: game.accentColor } as CSSProperties}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === slug}
              className="game-tab__select"
              onClick={() => focusGame(slug)}
            >
              <span className="game-tab__label">{game.title}</span>
            </button>
            <button
              type="button"
              className="game-tab__close"
              aria-label={`Close ${game.title}`}
              onClick={(e) => {
                e.stopPropagation();
                closeGame(slug);
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
