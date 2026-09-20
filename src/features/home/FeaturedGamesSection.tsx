import { getExtraGames, getFlagshipGames } from '../../data/games';
import { GameCard } from '../../components/arcade/GameCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import './GamesSection.css';

export function FeaturedGamesSection() {
  const flagships = getFlagshipGames();
  const extras = getExtraGames();

  return (
    <section id="games" className="section games-section">
      <div className="container">
        <SectionHeader
          title="Featured Arcade"
          subtitle="Policy Quest and Car Planet share the flagship row. Everything else sits on the extras shelf."
        />
        <div className="games-grid games-grid--flagships">
          {flagships.map((game, i) => (
            <GameCard key={game.id} game={game} index={i} />
          ))}
        </div>
        {extras.length > 0 ? (
          <div className="games-extras">
            <p className="games-extras__label pixel-text">Extras</p>
            <div className="games-grid games-grid--extras">
              {extras.map((game, i) => (
                <GameCard key={game.id} game={game} index={i} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
