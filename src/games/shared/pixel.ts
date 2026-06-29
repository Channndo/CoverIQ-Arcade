/** Car Planet / Auto World style procedural pixel drawing */

export const GAME_W = 320;
export const GAME_H = 240;
export const TILE = 16;

export function dR(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
}

export function drawMiniCar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  body: string,
  scale = 1,
) {
  const w = 24 * scale;
  const h = 12 * scale;
  dR(ctx, x, y, w, h, body);
  dR(ctx, x + 4 * scale, y + 2 * scale, 16 * scale, 6 * scale, '#111');
  dR(ctx, x + 5 * scale, y + 3 * scale, 14 * scale, 4 * scale, '#6699cc');
  dR(ctx, x + 2 * scale, y - 2 * scale, 5 * scale, 2 * scale, '#111');
  dR(ctx, x + 17 * scale, y - 2 * scale, 5 * scale, 2 * scale, '#111');
  dR(ctx, x + 2 * scale, y + h, 5 * scale, 2 * scale, '#333');
  dR(ctx, x + 17 * scale, y + h, 5 * scale, 2 * scale, '#333');
}

export function drawChibi(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  shirt: string,
  skin = '#ffccaa',
  hair = '#4a3121',
) {
  dR(ctx, x + 4, y + 2, 8, 8, skin);
  dR(ctx, x + 4, y + 2, 8, 3, hair);
  dR(ctx, x + 3, y + 10, 10, 6, shirt);
  dR(ctx, x + 4, y + 16, 3, 4, shirt);
  dR(ctx, x + 9, y + 16, 3, 4, shirt);
  dR(ctx, x + 6, y + 5, 2, 2, '#111');
  dR(ctx, x + 10, y + 5, 2, 2, '#111');
}

export function drawDealershipFloor(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  for (let ty = 0; ty < h / TILE; ty++) {
    for (let tx = 0; tx < w / TILE; tx++) {
      const px = tx * TILE;
      const py = ty * TILE;
      const base = ty < 2 ? '#fdfdfd' : '#5a5a5a';
      dR(ctx, px, py, TILE, TILE, base);
      if (ty >= 2 && (tx + ty) % 4 === 0) dR(ctx, px + 4, py + 4, 8, 8, '#636363');
      if (ty < 2 && tx % 5 === 0) dR(ctx, px + 2, py + 10, 12, 4, '#0055a4');
    }
  }
}

export function drawRoad(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scroll: number,
) {
  dR(ctx, 0, 0, w, h, '#5a6b4a');
  dR(ctx, 40, 0, w - 80, h, '#333');
  for (let y = -20 + (scroll % 24); y < h; y += 24) {
    dR(ctx, w / 2 - 2, y, 4, 12, '#ffe156');
  }
  dR(ctx, 40, 0, 4, h, '#fff');
  dR(ctx, w - 44, 0, 4, h, '#fff');
}
