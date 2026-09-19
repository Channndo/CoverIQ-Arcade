import { useGameIframeBridge } from '../leaderboard/useGameIframeBridge';
import './AutoWorldEmbed.css';

export function AutoWorldEmbed({ active }: { active: boolean }) {
  const { iframeRef, onFrameLoad } = useGameIframeBridge('auto-world');

  return (
    <div className={`auto-world-embed${active ? '' : ' auto-world-embed--paused'}`}>
      <iframe
        ref={iframeRef}
        src={`${import.meta.env.BASE_URL}games/auto-world/index.html`}
        title="Auto World"
        className="auto-world-embed__frame"
        allow="fullscreen; gamepad"
        allowFullScreen
        onLoad={onFrameLoad}
      />
      {!active && <div className="auto-world-embed__pause" aria-hidden="true" />}
    </div>
  );
}
