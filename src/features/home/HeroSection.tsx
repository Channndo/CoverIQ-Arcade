import { motion } from 'framer-motion';
import { PLATFORM, ROUTES } from '../../lib/constants';
import { Button } from '../../components/ui/Button';
import './HeroSection.css';

export function HeroSection() {
  return (
    <section className="hero">
      <div className="container hero__content">
        <motion.p
          className="hero__eyebrow pixel-text"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          A Square1 Studios Universe
        </motion.p>

        <motion.h1
          className="hero__title"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
        >
          <img
            className="hero__logo-img"
            src={`${import.meta.env.BASE_URL}square1-logo.png`}
            alt="Square1 Arcade"
          />
          <span className="hero__title-arcade">Arcade</span>
        </motion.h1>

        <motion.p
          className="hero__description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          {PLATFORM.description}
        </motion.p>

        <motion.div
          className="hero__actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button href={ROUTES.games} variant="primary" size="lg">
            Explore Games
          </Button>
          <Button href={ROUTES.ecosystem} variant="secondary" size="lg">
            The Ecosystem
          </Button>
        </motion.div>

        <motion.div
          className="hero__stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="hero__stat">
            <span className="hero__stat-value">5</span>
            <span className="hero__stat-label">Worlds In Development</span>
          </div>
          <div className="hero__stat-divider" aria-hidden="true" />
          <div className="hero__stat">
            <span className="hero__stat-value">∞</span>
            <span className="hero__stat-label">Expandable Universe</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}