import { useGameIframeBridge } from '../leaderboard/useGameIframeBridge';
import './PolicyQuestEmbed.css';

export function PolicyQuestEmbed({ active }: { active: boolean }) {
  const { iframeRef, onFrameLoad } = useGameIframeBridge('policy-quest');

  return (
    <div className={`policy-quest-embed${active ? '' : ' policy-quest-embed--paused'}`}>
      <iframe
        ref={iframeRef}
        src={`${import.meta.env.BASE_URL}games/policy-quest/index.html`}
        title="Policy Quest"
        className="policy-quest-embed__frame"
        allow="fullscreen; gamepad"
        allowFullScreen
        onLoad={onFrameLoad}
      />
      {!active && <div className="policy-quest-embed__pause" aria-hidden="true" />}
    </div>
  );
}
