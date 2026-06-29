import type { ReactNode } from 'react';
import './Badge.css';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'flagship' | 'coming-soon';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`omni-badge omni-badge--${variant} ${className}`.trim()}>
      {children}
    </span>
  );
}
