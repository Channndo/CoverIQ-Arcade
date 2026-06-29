import { useRef } from 'react';
import { GameShell } from './shared/GameShell';
import { dR, drawChibi, drawDealershipFloor, drawMiniCar, GAME_H, GAME_W, TILE } from './shared/pixel';

interface Disaster {
  id: number;
  x: number;
  y: number;
  type: 'hail' | 'flood' | 'fire';
  hp: number;
}

interface ChaosState {
  playerX: number;
  disasters: Disaster[];
  spawnTimer: number;
  score: number;
  claims: number;
  wave: number;
  gameOver: boolean;
  nextId: number;
}

function init(): ChaosState {
  return {
    playerX: GAME_W / 2,
    disasters: [],
    spawnTimer: 1.5,
    score: 0,
    claims: 0,
    wave: 1,
    gameOver: false,
    nextId: 0,
  };
}

const TYPE_COLORS = {
  hail: '#cce6ff',
  flood: '#3b82f6',
  fire: '#dc2626',
};

export function ClaimChaos({ active }: { active: boolean }) {
  const state = useRef(init());

  return (
    <GameShell
      title="Claim Chaos"
      active={active}
      hint="← → move · A to file claim on nearest disaster"
      onFrame={(ctx, input, dt) => {
        const s = state.current;

        if (s.gameOver) {
          drawDealershipFloor(ctx, GAME_W, GAME_H);
          ctx.fillStyle = 'rgba(0,0,0,0.75)';
          ctx.fillRect(0, 0, GAME_W, GAME_H);
          ctx.fillStyle = '#00f0ff';
          ctx.font = '10px "Press Start 2P"';
          ctx.textAlign = 'center';
          ctx.fillText('LOT LOST!', GAME_W / 2, GAME_H / 2 - 8);
          ctx.fillStyle = '#fff';
          ctx.font = '8px "Press Start 2P"';
          ctx.fillText(`CLAIMS ${s.claims}`, GAME_W / 2, GAME_H / 2 + 12);
          ctx.fillText('A = RETRY', GAME_W / 2, GAME_H / 2 + 28);
          ctx.textAlign = 'left';
          if (input.a || input.start) Object.assign(s, init());
          return;
        }

        s.spawnTimer -= dt;
        if (s.spawnTimer <= 0) {
          const types: Disaster['type'][] = ['hail', 'flood', 'fire'];
          s.disasters.push({
            id: s.nextId++,
            x: TILE * 2 + Math.random() * (GAME_W - TILE * 6),
            y: TILE * 3 + Math.random() * (GAME_H - TILE * 8),
            type: types[Math.floor(Math.random() * 3)]!,
            hp: 2 + Math.floor(s.wave / 2),
          });
          s.spawnTimer = Math.max(0.4, 1.8 - s.wave * 0.1);
        }

        if (input.left) s.playerX -= 160 * dt;
        if (input.right) s.playerX += 160 * dt;
        s.playerX = Math.max(40, Math.min(GAME_W - 40, s.playerX));

        if (input.a) {
          let nearest: Disaster | null = null;
          let best = 99999;
          for (const d of s.disasters) {
            const dx = d.x + 14 - s.playerX;
            const dy = d.y + 14 - (GAME_H - 40);
            const dist = dx * dx + dy * dy;
            if (dist < best && dist < 70 * 70) {
              best = dist;
              nearest = d;
            }
          }
          if (nearest) {
            nearest.hp -= 1;
            s.claims += 1;
            s.score += 50;
          }
        }

        s.disasters = s.disasters.filter((d) => d.hp > 0);
        if (s.disasters.length > 8) s.gameOver = true;

        s.score += Math.floor(dt * 5);
        if (s.score > s.wave * 500) s.wave += 1;

        drawDealershipFloor(ctx, GAME_W, GAME_H);
        drawMiniCar(ctx, 48, GAME_H - 48, '#0055a4');
        drawMiniCar(ctx, GAME_W - 80, GAME_H - 56, '#dc2626');
        drawChibi(ctx, s.playerX - 8, GAME_H - 44, '#1e3a8a');

        for (const d of s.disasters) {
          const c = TYPE_COLORS[d.type];
          dR(ctx, d.x, d.y, 28, 28, c);
          dR(ctx, d.x + 4, d.y + 4, 20, 20, '#111');
          ctx.fillStyle = '#fff';
          ctx.font = '6px "Press Start 2P"';
          ctx.fillText(d.type.slice(0, 4).toUpperCase(), d.x + 2, d.y + 18);
          if (d.hp > 1) {
            dR(ctx, d.x, d.y - 4, 28, 3, '#ffe156');
            dR(ctx, d.x, d.y - 4, (28 * (d.hp - 1)) / 2, 3, '#ff2d55');
          }
        }

        ctx.fillStyle = '#fff';
        ctx.font = '8px "Press Start 2P"';
        ctx.fillText(`SCORE ${s.score}`, 8, 14);
        ctx.fillStyle = '#00f0ff';
        ctx.fillText(`WAVE ${s.wave}`, GAME_W - 70, 14);
        ctx.fillStyle = '#dc2626';
        ctx.fillText(`THREAT ${s.disasters.length}/8`, 8, 26);
      }}
    />
  );
}
