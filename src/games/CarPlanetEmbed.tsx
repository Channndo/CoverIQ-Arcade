import './CarPlanetEmbed.css';

export function CarPlanetEmbed({ active }: { active: boolean }) {
  return (
    <div className={`car-planet-embed${active ? '' : ' car-planet-embed--paused'}`}>
      <iframe
        src="/games/car-planet/index.html"
        title="Car Planet"
        className="car-planet-embed__frame"
        allow="fullscreen"
      />
      {!active && <div className="car-planet-embed__pause" aria-hidden="true" />}
    </div>
  );
}
