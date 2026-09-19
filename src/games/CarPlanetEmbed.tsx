import { useGameIframeBridge } from '../leaderboard/useGameIframeBridge';
import './CarPlanetEmbed.css';

export function CarPlanetEmbed({ active }: { active: boolean }) {
  const { iframeRef, onFrameLoad } = useGameIframeBridge('car-planet');

  return (
    <div className={`car-planet-embed${active ? '' : ' car-planet-embed--paused'}`}>
      <iframe
        ref={iframeRef}
        src={`${import.meta.env.BASE_URL}games/car-planet/index.html`}
        title="Car Planet"
        className="car-planet-embed__frame"
        allow="fullscreen; gamepad"
        allowFullScreen
        onLoad={onFrameLoad}
      />
      {!active && <div className="car-planet-embed__pause" aria-hidden="true" />}
    </div>
  );
}
