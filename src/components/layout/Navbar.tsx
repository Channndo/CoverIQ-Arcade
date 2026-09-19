import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/constants';
import { Button } from '../ui/Button';
import './Navbar.css';

const NAV_ITEMS = [
  { label: 'Games', href: ROUTES.games },
  { label: 'Boards', href: ROUTES.boards },
  { label: 'Ecosystem', href: ROUTES.ecosystem },
  { label: 'Coming Soon', href: ROUTES.comingSoon },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to={ROUTES.home} className="navbar__brand" onClick={() => setOpen(false)}>
          <img
            className="navbar__mark"
            src={`${import.meta.env.BASE_URL}square1-mark.png`}
            alt="Square1 Arcade"
          />
          <span className="navbar__name">Arcade</span>
        </Link>

        <nav className={`navbar__nav${open ? ' navbar__nav--open' : ''}`} aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="navbar__link"
              onClick={(event) => {
                setOpen(false);
                const hash = item.href.indexOf('#');
                if (hash < 0) return;
                const el = document.getElementById(item.href.slice(hash + 1));
                if (!el) return;
                event.preventDefault();
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
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
