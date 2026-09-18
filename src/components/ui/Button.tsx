import { motion } from 'framer-motion';
import type { MouseEvent, ReactNode } from 'react';
import './Button.css';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  className = '',
}: ButtonProps) {
  const classes = `omni-btn omni-btn--${variant} omni-btn--${size} ${className}`.trim();

  const content = (
    <motion.span
      className="omni-btn__inner"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.span>
  );

  if (href) {
    // In-page hash links (e.g. "/#games", "#ecosystem") should smooth-scroll to
    // the section instead of navigating — a hard navigation breaks under a base
    // path (e.g. GitHub Pages) and 404s.
    const hashIndex = href.indexOf('#');
    const isHashLink = href.startsWith('#') || href.startsWith('/#');

    if (isHashLink) {
      const targetId = href.slice(hashIndex + 1);
      const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        const el = document.getElementById(targetId);
        if (el) {
          event.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      return (
        <a href={href} className={classes} onClick={handleClick}>
          {content}
        </a>
      );
    }

    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick}>
      {content}
    </button>
  );
}
