import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { GAME_H, GAME_W } from './pixel';
import './GameShell.css';

export type GameInput = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  a: boolean;
  b: boolean;
  start: boolean;
};

const EMPTY_INPUT: GameInput = {
  up: false,
  down: false,
  left: false,
  right: false,
  a: false,
  b: false,
  start: false,
};

interface GameShellProps {
  title: string;
  active: boolean;
  hint?: string;
  onFrame: (
    ctx: CanvasRenderingContext2D,
    input: GameInput,
    dt: number,
  ) => void;
  overlay?: ReactNode;
}

export function GameShell({ title, active, hint, onFrame, overlay }: GameShellProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<GameInput>({ ...EMPTY_INPUT });
  const pressedRef = useRef<Set<string>>(new Set());
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  const setKey = useCallback((code: string, down: boolean) => {
    const map: Record<string, keyof GameInput> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      KeyW: 'up',
      KeyS: 'down',
      KeyA: 'left',
      KeyD: 'right',
      KeyZ: 'a',
      KeyX: 'b',
      Enter: 'start',
      Space: 'a',
    };
    const key = map[code];
    if (key) inputRef.current[key] = down;
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!active) return;
      setKey(e.code, true);
      pressedRef.current.add(e.code);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      setKey(e.code, false);
      pressedRef.current.delete(e.code);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [active, setKey]);

  useEffect(() => {
    if (!active) {
      inputRef.current = { ...EMPTY_INPUT };
      return;
    }

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          onFrameRef.current(ctx, { ...inputRef.current }, dt);
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const bindBtn = (field: keyof GameInput) => ({
    onPointerDown: (e: ReactPointerEvent) => {
      e.preventDefault();
      if (!active) return;
      inputRef.current[field] = true;
    },
    onPointerUp: () => {
      inputRef.current[field] = false;
    },
    onPointerLeave: () => {
      inputRef.current[field] = false;
    },
  });

  return (
    <div className="gb-shell">
      <div className="gb-shell__screen">
        <canvas
          ref={canvasRef}
          width={GAME_W}
          height={GAME_H}
          className="gb-shell__canvas"
          aria-label={title}
        />
        {overlay}
        {hint && active && <p className="gb-shell__hint pixel-text">{hint}</p>}
      </div>
      <div className="gb-shell__controls control-board-black">
        <div className="gb-shell__dpad">
          <button type="button" className="gb-btn" aria-label="Up" {...bindBtn('up')}>
            ↑
          </button>
          <button type="button" className="gb-btn" aria-label="Left" {...bindBtn('left')}>
            ←
          </button>
          <button type="button" className="gb-btn" aria-label="Right" {...bindBtn('right')}>
            →
          </button>
          <button type="button" className="gb-btn" aria-label="Down" {...bindBtn('down')}>
            ↓
          </button>
        </div>
        <button type="button" className="gb-btn gb-btn--start" {...bindBtn('start')}>
          START
        </button>
        <div className="gb-shell__actions">
          <button type="button" className="gb-btn gb-btn--b" {...bindBtn('b')}>
            B
          </button>
          <button type="button" className="gb-btn gb-btn--a" {...bindBtn('a')}>
            A
          </button>
        </div>
      </div>
    </div>
  );
}
