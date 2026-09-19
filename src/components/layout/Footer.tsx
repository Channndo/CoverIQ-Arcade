import { PLATFORM, FUTURE_FEATURES } from '../../lib/constants';
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <p className="footer__logo">{PLATFORM.name}</p>
          <p className="footer__tagline">{PLATFORM.tagline}</p>
          <p className="footer__copy">
            A <strong>{PLATFORM.studio}</strong> studio · part of the{' '}
            <a href={PLATFORM.omnistrataUrl} target="_blank" rel="noopener noreferrer">
              Omnistrata
            </a>{' '}
            ecosystem · v{PLATFORM.version}
          </p>
          <p className="footer__credit">{PLATFORM.leadDevCredit}</p>
        </div>
        <div className="footer__future">
          <p className="footer__future-title pixel-text">Future Systems</p>
          <ul className="footer__future-list">
            {FUTURE_FEATURES.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
