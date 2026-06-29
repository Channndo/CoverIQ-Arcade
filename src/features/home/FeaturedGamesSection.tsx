import { getFeaturedGames } from '../../data/games';
import { GameCard } from '../../components/arcade/GameCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import './GamesSection.css';

export function FeaturedGamesSection() {
  const games = getFeaturedGames();

  return (
    <section id="games" className="section games-section">
      <div className="container">
        <SectionHeader
          title="Featured Arcade"
          subtitle="Flagship worlds and headline titles from the omni.games universe — all launching soon."
        />
        <div className="games-grid">
          {games.map((game, i) => (
            <GameCard key={game.id} game={game} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
