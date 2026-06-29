import { useRef } from 'react';
import { GameShell } from './shared/GameShell';
import { dR, GAME_H, GAME_W } from './shared/pixel';

interface RushState {
  lane: number;
  targetLane: number;
  signal: 'wait' | 'go' | 'risk';
  timer: number;
  score: number;
  combo: number;
  misses: number;
  gameOver: boolean;
  flash: number;
}

function init(): RushState {
  return {
    lane: 1,
    targetLane: 1,
    signal: 'wait',
    timer: 1.2,
    score: 0,
    combo: 0,
    misses: 0,
    gameOver: false,
    flash: 0,
  };
}

const LANES = [80, 160, 240];

export function RiskRush({ active }: { active: boolean }) {
  const state = useRef(init());
  const wasA = useRef(false);

  return (
    <GameShell
      title="Risk Rush"
      active={active}
      hint="← → pick lane · A when GOLD"
      onFrame={(ctx, input, dt) => {
        const s = state.current;

        if (s.gameOver) {
          ctx.fillStyle = '#1a1f2e';
          ctx.fillRect(0, 0, GAME_W, GAME_H);
          ctx.fillStyle = '#ffe156';
          ctx.font = '10px "Press Start 2P"';
          ctx.textAlign = 'center';
          ctx.fillText('BANKRUPT', GAME_W / 2, GAME_H / 2 - 8);
          ctx.fillStyle = '#fff';
          ctx.font = '8px "Press Start 2P"';
          ctx.fillText(`SCORE ${s.score}`, GAME_W / 2, GAME_H / 2 + 12);
          ctx.fillText('A = RETRY', GAME_W / 2, GAME_H / 2 + 28);
          ctx.textAlign = 'left';
          if (input.a && !wasA.current) Object.assign(s, init());
          wasA.current = input.a;
          return;
        }

        if (input.left && s.lane > 0) s.lane -= 1;
        if (input.right && s.lane < 2) s.lane += 1;

        s.timer -= dt;
        if (s.timer <= 0) {
          s.targetLane = Math.floor(Math.random() * 3);
          s.signal = Math.random() > 0.35 ? 'go' : 'risk';
          s.timer = Math.max(0.35, 1.1 - s.score * 0.002);
        }

        const pressed = input.a && !wasA.current;
        wasA.current = input.a;

        if (pressed && s.signal !== 'wait') {
          if (s.lane === s.targetLane && s.signal === 'go') {
            s.score += 100 + s.combo * 25;
            s.combo += 1;
            s.flash = 0.15;
          } else {
            s.misses += 1;
            s.combo = 0;
            s.flash = 0.15;
            if (s.misses >= 5) s.gameOver = true;
          }
          s.signal = 'wait';
          s.timer = 0.4;
        }

        if (s.flash > 0) s.flash -= dt;

        ctx.fillStyle = '#1a1f2e';
        ctx.fillRect(0, 0, GAME_W, GAME_H);
        for (let i = 0; i < 3; i++) {
          const lx = LANES[i]! - 20;
          dR(ctx, lx, 40, 40, GAME_H - 80, i === s.lane ? '#2a3550' : '#151a28');
          if (i === s.targetLane && s.signal !== 'wait') {
            const col = s.signal === 'go' ? '#ffe156' : '#ff2d55';
            dR(ctx, lx + 8, GAME_H / 2 - 20, 24, 40, col);
            ctx.fillStyle = '#111';
            ctx.font = '8px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(s.signal === 'go' ? '!' : 'X', lx + 20, GAME_H / 2 + 4);
            ctx.textAlign = 'left';
          }
        }

        dR(ctx, LANES[s.lane]! - 14, GAME_H - 56, 28, 20, s.flash > 0 ? '#fff' : '#ff6b00');

        ctx.fillStyle = '#fff';
        ctx.font = '8px "Press Start 2P"';
        ctx.fillText(`SCORE ${s.score}`, 8, 14);
        ctx.fillStyle = '#ffe156';
        ctx.fillText(`x${s.combo}`, GAME_W - 48, 14);
        ctx.fillStyle = '#ff2d55';
        ctx.fillText(`MISS ${s.misses}/5`, 8, 26);
      }}
    />
  );
}
