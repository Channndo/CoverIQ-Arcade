import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGameBySlug } from '../data/games';
import { useLauncher } from '../context/LauncherContext';
import { ROUTES } from '../lib/constants';
import { Button } from '../components/ui/Button';

/** Deep link: /games/:slug opens the cabinet and returns to the hub */
export function GamePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { openGame } = useLauncher();
  const game = slug ? getGameBySlug(slug) : undefined;

  useEffect(() => {
    if (game) {
      openGame(game.slug);
      navigate(ROUTES.home, { replace: true });
    }
  }, [game, openGame, navigate]);

  if (!game) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h1>Game Not Found</h1>
        <Button href={ROUTES.home} variant="primary">
          Return to Arcade
        </Button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
      <p className="pixel-text" style={{ color: 'var(--omni-neon-cyan)' }}>
        Opening {game.title}…
      </p>
    </div>
  );
}
