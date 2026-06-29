import './CRTOverlay.css';

export function CRTOverlay() {
  return (
    <div className="crt-overlay" aria-hidden="true">
      <div className="crt-overlay__scanlines" />
      <div className="crt-overlay__vignette" />
      <div className="crt-overlay__flicker" />
    </div>
  );
}
