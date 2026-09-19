import { useEffect, useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useArcadeIdentity } from './ArcadeIdentityContext';
import { fetchLeaderboard } from './api';
import { academyVerifyUrl, LEADERBOARD_GAMES } from './config';
import type { LeaderboardEntry, LeaderboardResponse } from './types';
import { AVATAR_GLYPHS } from './types';
import './LeaderboardSection.css';

function glyph(avatarId: string | null): string {
  if (!avatarId) return '◆';
  return AVATAR_GLYPHS[avatarId] ?? '◆';
}

function Board({
  gameSlug,
  statKey,
  label,
  accent,
  sessionToken,
}: {
  gameSlug: string;
  statKey: string;
  label: string;
  accent: string;
  sessionToken: string | null;
}) {
  const [board, setBoard] = useState<LeaderboardResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchLeaderboard(gameSlug, statKey, sessionToken).then((data) => {
      if (!cancelled) setBoard(data);
    });
    return () => {
      cancelled = true;
    };
  }, [gameSlug, sessionToken, statKey]);

  const entries: LeaderboardEntry[] = board?.entries ?? [];
  const you = board?.you;

  return (
    <article className="arcade-board" style={{ ['--board-accent' as string]: accent }}>
      <header className="arcade-board__head">
        <p className="arcade-board__stat">{label}</p>
        {you ? (
          <p className="arcade-board__you">
            You · #{you.rank} · {you.value}
          </p>
        ) : null}
      </header>
      {board?.disabled && entries.length === 0 ? (
        <p className="arcade-board__empty">Boards are warming up — play and save to post a score.</p>
      ) : entries.length === 0 ? (
        <p className="arcade-board__empty">No scores yet. Signed-in saves post here.</p>
      ) : (
        <ol className="arcade-board__list">
          {entries.map((row) => (
            <li key={`${row.rank}-${row.publicName}`} className={row.isYou ? 'is-you' : undefined}>
              <span className="arcade-board__rank">#{row.rank}</span>
              <span className="arcade-board__avatar" aria-hidden="true">
                {glyph(row.avatarId)}
              </span>
              <span className="arcade-board__identity">
                <span className="arcade-board__name">{row.publicName}</span>
                {row.badges?.academy && (
                  <span className="arcade-board__badge">
                    {row.badges.testOut ? 'Academy · Tested out' : 'Academy'}
                    {row.badges.certificateId ? (
                      <>
                        {' · '}
                        <a
                          href={academyVerifyUrl(row.badges.certificateId)}
                          target="_blank"
                          rel="noreferrer"
                          className="arcade-board__cert"
                        >
                          {row.badges.certificateId}
                        </a>
                      </>
                    ) : null}
                  </span>
                )}
              </span>
              <span className="arcade-board__value">{row.value}</span>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}

export function LeaderboardSection() {
  const { identity, sessionToken } = useArcadeIdentity();
  const [gameSlug, setGameSlug] = useState<(typeof LEADERBOARD_GAMES)[number]['slug']>('car-planet');
  const game = LEADERBOARD_GAMES.find((g) => g.slug === gameSlug) ?? LEADERBOARD_GAMES[0];

  return (
    <section id="boards" className="section arcade-boards">
      <div className="container">
        <SectionHeader
          title="Leaderboards"
          subtitle="Public handles only. Car Planet still saves on your device — a CoverIQ account unlocks save and the board."
        />

        <div className="arcade-boards__status">
          {identity.signedIn ? (
            <p>
              Signed in as <strong>{identity.publicName || 'Player'}</strong> · local save enabled
            </p>
          ) : (
            <p>
              Playing is open.{' '}
              <a href={identity.signupUrl} target="_blank" rel="noreferrer">
                Make a CoverIQ account
              </a>{' '}
              to save locally and appear on the board.
            </p>
          )}
        </div>

        <div className="arcade-boards__tabs" role="tablist" aria-label="Game boards">
          {LEADERBOARD_GAMES.map((item) => (
            <button
              key={item.slug}
              type="button"
              role="tab"
              aria-selected={item.slug === gameSlug}
              className={`arcade-boards__tab${item.slug === gameSlug ? ' is-active' : ''}`}
              onClick={() => setGameSlug(item.slug)}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="arcade-boards__grid">
          {game.stats.map((stat) => (
            <Board
              key={`${game.slug}-${stat.key}`}
              gameSlug={game.slug}
              statKey={stat.key}
              label={stat.label}
              accent={game.accent}
              sessionToken={sessionToken}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
