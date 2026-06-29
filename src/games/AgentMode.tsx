import { useRef } from 'react';
import { GameShell } from './shared/GameShell';
import { dR, drawChibi, drawDealershipFloor, drawMiniCar, GAME_H, GAME_W } from './shared/pixel';

interface Customer {
  x: number;
  y: number;
  sold: boolean;
  mood: number;
}

interface AgentState {
  x: number;
  y: number;
  dir: 'up' | 'down' | 'left' | 'right';
  customers: Customer[];
  policies: number;
  cash: number;
  spawnTimer: number;
  message: string;
  msgTimer: number;
}

function init(): AgentState {
  return {
    x: GAME_W / 2,
    y: GAME_H / 2 + 20,
    dir: 'down',
    customers: [
      { x: 80, y: 100, sold: false, mood: 0 },
      { x: 200, y: 140, sold: false, mood: 0 },
    ],
    policies: 0,
    cash: 0,
    spawnTimer: 8,
    message: 'SELL POLICIES! A near client',
    msgTimer: 4,
  };
}

export function AgentMode({ active }: { active: boolean }) {
  const state = useRef(init());

  return (
    <GameShell
      title="Agent Mode"
      active={active}
      hint="D-pad walk · A to sell policy"
      onFrame={(ctx, input, dt) => {
        const s = state.current;
        const speed = 90;

        if (input.up) {
          s.y -= speed * dt;
          s.dir = 'up';
        }
        if (input.down) {
          s.y += speed * dt;
          s.dir = 'down';
        }
        if (input.left) {
          s.x -= speed * dt;
          s.dir = 'left';
        }
        if (input.right) {
          s.x += speed * dt;
          s.dir = 'right';
        }

        s.x = Math.max(24, Math.min(GAME_W - 40, s.x));
        s.y = Math.max(48, Math.min(GAME_H - 48, s.y));

        if (input.a) {
          for (const c of s.customers) {
            if (c.sold) continue;
            const dx = c.x - s.x;
            const dy = c.y - s.y;
            if (dx * dx + dy * dy < 48 * 48) {
              c.sold = true;
              s.policies += 1;
              s.cash += 250 + Math.floor(Math.random() * 150);
              s.message = 'POLICY SOLD!';
              s.msgTimer = 2;
            }
          }
        }

        s.spawnTimer -= dt;
        if (s.spawnTimer <= 0 && s.customers.filter((c) => !c.sold).length < 4) {
          s.customers.push({
            x: 60 + Math.random() * (GAME_W - 120),
            y: 70 + Math.random() * (GAME_H - 120),
            sold: false,
            mood: 0,
          });
          s.spawnTimer = 6;
        }

        if (s.msgTimer > 0) s.msgTimer -= dt;

        drawDealershipFloor(ctx, GAME_W, GAME_H);
        drawMiniCar(ctx, 32, 72, '#2244cc');
        drawMiniCar(ctx, GAME_W - 72, 88, '#228822');

        for (const c of s.customers) {
          if (c.sold) continue;
          drawChibi(ctx, c.x, c.y, '#fff', '#ffdbac', '#f6c944');
          dR(ctx, c.x + 2, c.y - 6, 12, 4, '#b24bff');
        }

        drawChibi(ctx, s.x, s.y, '#111', '#ffccaa', '#4a3121');

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, GAME_W, 28);
        ctx.fillStyle = '#fff';
        ctx.font = '8px "Press Start 2P"';
        ctx.fillText(`$${s.cash}`, 8, 12);
        ctx.fillStyle = '#b24bff';
        ctx.fillText(`POL ${s.policies}`, GAME_W - 72, 12);

        if (s.msgTimer > 0) {
          ctx.fillStyle = '#fff';
          ctx.font = '6px "Press Start 2P"';
          ctx.textAlign = 'center';
          ctx.fillText(s.message, GAME_W / 2, GAME_H - 16);
          ctx.textAlign = 'left';
        }

        dR(ctx, 8, GAME_H - 22, 120, 14, '#0055a4');
        ctx.fillStyle = '#fff';
        ctx.font = '6px "Press Start 2P"';
        ctx.fillText('AGENT MODE', 12, GAME_H - 12);
      }}
    />
  );
}
