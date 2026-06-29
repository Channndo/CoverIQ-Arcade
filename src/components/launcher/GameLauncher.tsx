import { GameTabBar } from './GameTabBar';
import { GameWindows } from './GameWindow';
import { useLauncher } from '../../context/LauncherContext';
export function GameLauncher() {
  const { openSlugs } = useLauncher();
  const hasOpenGames = openSlugs.length > 0;

  return (
    <div className={`game-launcher${hasOpenGames ? ' game-launcher--active' : ''}`}>
      <GameWindows />
      <GameTabBar />
    </div>
  );
}
