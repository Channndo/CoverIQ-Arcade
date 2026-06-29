import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './ParticleField.css';

const PARTICLE_COUNT = 40;

export function ParticleField() {
  const reducedMotion = useReducedMotion();

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 8}s`,
        duration: `${6 + Math.random() * 8}s`,
        dx: `${(Math.random() - 0.5) * 60}px`,
        dy: `${-80 - Math.random() * 120}px`,
        size: `${2 + Math.random() * 3}px`,
        hue: Math.random() > 0.5 ? 'cyan' : 'pink',
      })),
    [],
  );

  if (reducedMotion) return null;

  return (
    <div className="particle-field" aria-hidden="true">
      {particles.map((p) => {
        const style: CSSProperties = {
          left: p.left,
          animationDelay: p.delay,
          animationDuration: p.duration,
          width: p.size,
          height: p.size,
          ['--dx' as string]: p.dx,
          ['--dy' as string]: p.dy,
        };

        return (
          <span
            key={p.id}
            className={`particle particle--${p.hue}`}
            style={style}
          />
        );
      })}
    </div>
  );
}
