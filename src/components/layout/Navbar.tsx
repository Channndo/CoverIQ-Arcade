import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PLATFORM, ROUTES } from '../../lib/constants';
import { Button } from '../ui/Button';
import './Navbar.css';

const NAV_ITEMS = [
  { label: 'Games', href: ROUTES.games },
  { label: 'Ecosystem', href: ROUTES.ecosystem },
  { label: 'Coming Soon', href: ROUTES.comingSoon },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to={ROUTES.home} className="navbar__brand" onClick={() => setOpen(false)}>
          <span className="navbar__logo">◈</span>
          <span className="navbar__name">{PLATFORM.name}</span>
        </Link>

        <nav className={`navbar__nav${open ? ' navbar__nav--open' : ''}`} aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className="navbar__link" onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="navbar__actions">
          <Button href={ROUTES.games} variant="secondary" size="sm">
            Enter Arcade
          </Button>
          <button
            type="button"
            className="navbar__toggle"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
