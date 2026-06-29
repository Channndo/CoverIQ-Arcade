import { useRef } from 'react';
import { GameShell } from './shared/GameShell';
import { drawMiniCar, drawRoad, GAME_H, GAME_W } from './shared/pixel';

interface Obstacle {
  x: number;
  y: number;
  w: number;
  color: string;
}

interface MayhemState {
  playerX: number;
  scroll: number;
  score: number;
  lives: number;
  obstacles: Obstacle[];
  spawnTimer: number;
  gameOver: boolean;
  invuln: number;
}

function init(): MayhemState {
  return {
    playerX: GAME_W / 2 - 12,
    scroll: 0,
    score: 0,
    lives: 3,
    obstacles: [],
    spawnTimer: 0,
    gameOver: false,
    invuln: 0,
  };
}

const COLORS = ['#cc2222', '#2244cc', '#228822', '#f97316', '#881111'];

export function UninsuredMayhem({ active }: { active: boolean }) {
  const state = useRef(init());

  const reset = () => {
    state.current = init();
  };

  return (
    <GameShell
      title="Uninsured Mayhem"
      active={active}
      hint="← → move · Survive the highway"
      onFrame={(ctx, input, dt) => {
        const s = state.current;

        if (s.gameOver) {
          if (input.a || input.start) reset();
          drawRoad(ctx, GAME_W, GAME_H, s.scroll);
          drawMiniCar(ctx, s.playerX, GAME_H - 36, '#ffe156');
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillRect(0, 0, GAME_W, GAME_H);
          ctx.fillStyle = '#ff2d55';
          ctx.font = '10px "Press Start 2P"';
          ctx.textAlign = 'center';
          ctx.fillText('WRECKED!', GAME_W / 2, GAME_H / 2 - 8);
          ctx.fillStyle = '#fff';
          ctx.font = '8px "Press Start 2P"';
          ctx.fillText(`SCORE ${s.score}`, GAME_W / 2, GAME_H / 2 + 12);
          ctx.fillText('A = RETRY', GAME_W / 2, GAME_H / 2 + 28);
          ctx.textAlign = 'left';
          return;
        }

        const speed = 120 + s.score * 0.5;
        s.scroll += speed * dt;
        s.score += Math.floor(dt * 10);

        if (input.left) s.playerX -= 200 * dt;
        if (input.right) s.playerX += 200 * dt;
        s.playerX = Math.max(48, Math.min(GAME_W - 72, s.playerX));

        s.spawnTimer -= dt;
        if (s.spawnTimer <= 0) {
          s.spawnTimer = 0.6 + Math.random() * 0.8;
          s.obstacles.push({
            x: 56 + Math.random() * (GAME_W - 112),
            y: -20,
            w: 20 + Math.random() * 12,
            color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
          });
        }

        s.obstacles = s.obstacles
          .map((o) => ({ ...o, y: o.y + speed * dt }))
          .filter((o) => o.y < GAME_H + 30);

        const px = s.playerX;
        const py = GAME_H - 36;
        if (s.invuln > 0) s.invuln -= dt;

        for (const o of s.obstacles) {
          if (
            s.invuln <= 0 &&
            px < o.x + o.w &&
            px + 24 > o.x &&
            py < o.y + 16 &&
            py + 12 > o.y
          ) {
            s.lives -= 1;
            s.invuln = 1.2;
            if (s.lives <= 0) s.gameOver = true;
          }
        }

        drawRoad(ctx, GAME_W, GAME_H, s.scroll);
        for (const o of s.obstacles) {
          drawMiniCar(ctx, o.x, o.y, o.color);
        }
        drawMiniCar(ctx, px, py, s.invuln > 0 && Math.floor(s.invuln * 10) % 2 ? '#fff' : '#ffe156');

        ctx.fillStyle = '#fff';
        ctx.font = '8px "Press Start 2P"';
        ctx.fillText(`SCORE ${s.score}`, 8, 14);
        ctx.fillStyle = '#ff2d55';
        ctx.fillText('♥'.repeat(s.lives), GAME_W - 40, 14);
        ctx.fillStyle = '#0055a4';
        ctx.font = '6px "Press Start 2P"';
        ctx.fillText('UNINSURED MAYHEM', 8, GAME_H - 8);
      }}
    />
  );
}
