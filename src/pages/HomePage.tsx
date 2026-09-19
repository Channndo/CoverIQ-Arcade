import { HeroSection } from '../features/home/HeroSection';
import { FeaturedGamesSection } from '../features/home/FeaturedGamesSection';
import { ComingSoonSection } from '../features/home/ComingSoonSection';
import { EcosystemSection } from '../features/home/EcosystemSection';
import { LeaderboardSection } from '../leaderboard/LeaderboardSection';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedGamesSection />
      <LeaderboardSection />
      <ComingSoonSection />
      <EcosystemSection />
    </>
  );
}
