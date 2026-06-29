import { useReducedMotion } from '../../hooks/useReducedMotion';
import './AnimatedGrid.css';

export function AnimatedGrid() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={`animated-grid${reducedMotion ? ' animated-grid--static' : ''}`}
      aria-hidden="true"
    >
      <div className="animated-grid__plane" />
    </div>
  );
}
