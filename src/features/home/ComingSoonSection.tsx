import { GAMES } from '../../data/games';
import { GameCard } from '../../components/arcade/GameCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import './GamesSection.css';

export function ComingSoonSection() {
  const nonFeatured = GAMES.filter((g) => !g.featured);

  if (nonFeatured.length === 0) return null;

  return (
    <section id="coming-soon" className="section games-section games-section--alt">
      <div className="container">
        <SectionHeader
          title="More Worlds Incoming"
          subtitle="Additional titles expanding the arcade — each in its own repository, united by Square1 Arcade."
        />
        <div className="games-grid games-grid--compact">
          {nonFeatured.map((game, i) => (
            <GameCard key={game.id} game={game} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
