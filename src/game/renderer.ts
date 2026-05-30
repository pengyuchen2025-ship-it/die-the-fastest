import { GameState, Spike, PoisonPool, HealingBottle, Pillar, Player, FloatingText } from './types';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, WALL_THICKNESS, TILE_SIZE, COLORS, GAME_DURATION,
} from './constants';

// ─── Public entry ─────────────────────────────────────────────────────────

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  bestTime: number | null,
  animTime: number,
) {
  const shake = state.screenShake;
  const sx = shake > 0 ? (Math.random() - 0.5) * shake * 10 : 0;
  const sy = shake > 0 ? (Math.random() - 0.5) * shake * 10 : 0;

  ctx.save();
  if (shake > 0) ctx.translate(sx, sy);

  drawBackground(ctx);
  drawFloor(ctx);
  drawWalls(ctx);

  for (const pool of state.poisonPools) drawPoisonPool(ctx, pool, animTime);
  for (const spike of state.spikes)     drawSpike(ctx, spike, animTime);
  for (const pillar of state.pillars)   drawPillar(ctx, pillar, animTime);
  for (const bottle of state.healingBottles) drawBottle(ctx, bottle, animTime);

  drawPlayer(ctx, state.player);

  for (const ft of state.floatingTexts) drawFloat(ctx, ft);

  ctx.restore();

  drawHUD(ctx, state, bestTime);
}

// ─── Background & floor ───────────────────────────────────────────────────

function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.BG;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawFloor(ctx: CanvasRenderingContext2D) {
  const W = WALL_THICKNESS;
  const startX = W;
  const startY = W;
  const endX = CANVAS_WIDTH - W;
  const endY = CANVAS_HEIGHT - W;

  for (let y = startY; y < endY; y += TILE_SIZE) {
    for (let x = startX; x < endX; x += TILE_SIZE) {
      const tileW = Math.min(TILE_SIZE, endX - x);
      const tileH = Math.min(TILE_SIZE, endY - y);

      // Alternate subtle checker for depth
      const isDark = ((x / TILE_SIZE + y / TILE_SIZE) % 2 === 0);
      ctx.fillStyle = isDark ? COLORS.TILE : COLORS.TILE_DARK;
      ctx.fillRect(x, y, tileW, tileH);

      // Top-left highlight edge
      ctx.fillStyle = COLORS.TILE_LIGHT;
      ctx.fillRect(x, y, tileW, 1);
      ctx.fillRect(x, y, 1, tileH);
    }
  }
}

function drawWalls(ctx: CanvasRenderingContext2D) {
  const W = WALL_THICKNESS;
  ctx.fillStyle = COLORS.WALL;

  // Four wall strips
  ctx.fillRect(0, 0, CANVAS_WIDTH, W);               // top
  ctx.fillRect(0, CANVAS_HEIGHT - W, CANVAS_WIDTH, W); // bottom
  ctx.fillRect(0, 0, W, CANVAS_HEIGHT);               // left
  ctx.fillRect(CANVAS_WIDTH - W, 0, W, CANVAS_HEIGHT); // right

  // Inner shadow on each wall
  ctx.fillStyle = COLORS.WALL_SHADOW;
  ctx.fillRect(W, W, CANVAS_WIDTH - W * 2, 3);
  ctx.fillRect(W, W, 3, CANVAS_HEIGHT - W * 2);

  // Pixel border detail
  ctx.fillStyle = '#3A355A';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 2);
  ctx.fillRect(0, CANVAS_HEIGHT - 2, CANVAS_WIDTH, 2);
  ctx.fillRect(0, 0, 2, CANVAS_HEIGHT);
  ctx.fillRect(CANVAS_WIDTH - 2, 0, 2, CANVAS_HEIGHT);
}

// ─── Poison pool ──────────────────────────────────────────────────────────

function drawPoisonPool(ctx: CanvasRenderingContext2D, pool: PoisonPool, t: number) {
  const { x, y, w, h } = pool;

  // Base fill
  ctx.fillStyle = COLORS.POISON_BG;
  ctx.fillRect(x, y, w, h);

  // Animated inner glow strips
  const strip = Math.sin(t * 2.5) * 0.5 + 0.5;
  ctx.fillStyle = `rgba(26, 127, 78, ${0.4 + strip * 0.3})`;
  ctx.fillRect(x + 4, y + 4, w - 8, h - 8);

  // Border
  ctx.strokeStyle = COLORS.POISON;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

  // Animated bubbles
  const bubbleCount = 5;
  for (let i = 0; i < bubbleCount; i++) {
    const bx = x + 12 + (i * (w - 24)) / (bubbleCount - 1);
    const phase = (t * 1.5 + i * 1.3) % 1;
    const by = y + h - 8 - phase * (h - 16);
    const r = 3 + Math.sin(t * 3 + i) * 1;
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(57,255,136,${0.6 - phase * 0.5})`;
    ctx.fill();
  }

  // Label
  ctx.fillStyle = COLORS.POISON;
  ctx.font = '8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('POISON', x + w / 2, y + h / 2 + 3);
}

// ─── Spikes ───────────────────────────────────────────────────────────────

function drawSpike(ctx: CanvasRenderingContext2D, spike: Spike, t: number) {
  const { x, y, w, h } = spike;
  const isOut = spike.isOut;
  const isBurst = spike.type === 'burst';

  // Progress within current phase (0 = just entered, 1 = about to switch)
  const progress = isOut
    ? spike.cycleTimer / spike.outDuration
    : (spike.cycleTimer - spike.outDuration) / spike.inDuration;

  // Extend/retract animation in first/last 15% of phase
  let scale = 1;
  if (isOut && progress < 0.12) scale = progress / 0.12;
  if (!isOut && progress < 0.12) scale = 1 - progress / 0.12;

  // Ground crack / base
  ctx.fillStyle = isOut
    ? (isBurst ? COLORS.BURST_DARK : COLORS.SPIKE_DARK)
    : '#2A2035';
  ctx.fillRect(x, y, w, h);

  if (!isOut) {
    // Retracted: show just cracks
    ctx.strokeStyle = isBurst ? COLORS.BURST_DARK : COLORS.SPIKE_DARK;
    ctx.lineWidth = 2;
    drawCracks(ctx, x, y, w, h);
    return;
  }

  const color = isBurst ? COLORS.BURST : COLORS.SPIKE;
  const glow  = isBurst ? COLORS.BURST_GLOW : COLORS.SPIKE_GLOW;

  // Draw spike triangles pointing upward
  const count = isBurst ? 4 : 3;
  const tipY  = y + h / 2 - (h * 0.45 * scale);
  const baseY = y + h - 4;

  for (let i = 0; i < count; i++) {
    const cx = x + ((i + 0.5) / count) * w;
    const bw = (w / count) * 0.72;

    // Glow
    ctx.beginPath();
    ctx.moveTo(cx, tipY - 2);
    ctx.lineTo(cx - bw / 2 - 2, baseY);
    ctx.lineTo(cx + bw / 2 + 2, baseY);
    ctx.closePath();
    ctx.fillStyle = `rgba(${hexToRgb(glow)},0.45)`;
    ctx.fill();

    // Main triangle
    ctx.beginPath();
    ctx.moveTo(cx, tipY);
    ctx.lineTo(cx - bw / 2, baseY);
    ctx.lineTo(cx + bw / 2, baseY);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Highlight
    ctx.beginPath();
    ctx.moveTo(cx, tipY);
    ctx.lineTo(cx - bw / 4, tipY + (baseY - tipY) * 0.4);
    ctx.lineTo(cx + bw / 4, tipY + (baseY - tipY) * 0.4);
    ctx.closePath();
    ctx.fillStyle = glow;
    ctx.fill();
  }

  // Pulsing border when fully out
  if (progress > 0.15 && progress < 0.85) {
    const pulse = Math.sin(t * 8) * 0.3 + 0.7;
    ctx.strokeStyle = `rgba(${hexToRgb(color)},${pulse * 0.7})`;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  }
}

function drawCracks(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number
) {
  const cx = x + w / 2, cy = y + h / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 4); ctx.lineTo(cx - 6, cy + 6);
  ctx.moveTo(cx, cy - 4); ctx.lineTo(cx + 5, cy + 8);
  ctx.moveTo(cx - 3, cy + 2); ctx.lineTo(cx - 8, cy - 2);
  ctx.stroke();
}

// ─── Pillars ──────────────────────────────────────────────────────────────

function drawPillar(ctx: CanvasRenderingContext2D, pillar: Pillar, t: number) {
  const { x, y, w, h } = pillar;

  // Transition progress
  const total = pillar.outDuration + pillar.inDuration;
  const phase = pillar.cycleTimer / total; // 0..1 within full cycle

  if (!pillar.isOut) {
    // Base plate only
    ctx.fillStyle = COLORS.PILLAR_SHADOW;
    ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
    ctx.strokeStyle = COLORS.PILLAR_BASE;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);

    // Warning flash before rising
    const timeInPhase = pillar.cycleTimer - pillar.outDuration;
    const timeLeft = pillar.inDuration - timeInPhase;
    if (timeLeft < 0.4) {
      const f = 1 - timeLeft / 0.4;
      ctx.fillStyle = `rgba(138,143,152,${f * 0.5})`;
      ctx.fillRect(x, y, w, h);
    }
    return;
  }

  // Animated rise
  const riseProgress = Math.min(1, (pillar.cycleTimer / (pillar.outDuration * 0.15)));

  // Shadow
  ctx.fillStyle = COLORS.PILLAR_SHADOW;
  ctx.fillRect(x + 5, y + 5, w, h);

  // Body
  ctx.fillStyle = COLORS.PILLAR;
  ctx.fillRect(x, y, w * riseProgress, h); // animate width for "pop" feel...
  // Actually let's animate height for rise effect
  const drawH = h * riseProgress;
  const drawY = y + (h - drawH);
  ctx.fillRect(x, drawY, w, drawH);

  if (riseProgress < 1) return;

  // Full pillar details
  // Light face (top-left)
  ctx.fillStyle = COLORS.PILLAR_LIGHT;
  ctx.fillRect(x, y, w, 4);
  ctx.fillRect(x, y, 4, h);

  // Dark face (bottom-right)
  ctx.fillStyle = COLORS.PILLAR_SHADOW;
  ctx.fillRect(x, y + h - 4, w, 4);
  ctx.fillRect(x + w - 4, y, 4, h);

  // Center cross detail
  ctx.fillStyle = COLORS.PILLAR_BASE;
  ctx.fillRect(x + w / 2 - 1, y + 6, 2, h - 12);
  ctx.fillRect(x + 6, y + h / 2 - 1, w - 12, 2);

  // Pulse outline when fully out
  const pulse = Math.sin(t * 3) * 0.2 + 0.5;
  ctx.strokeStyle = `rgba(170,175,187,${pulse})`;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
}

// ─── Healing bottle ───────────────────────────────────────────────────────

function drawBottle(ctx: CanvasRenderingContext2D, bottle: HealingBottle, t: number) {
  if (!bottle.active) {
    // Respawn countdown indicator
    const ratio = 1 - bottle.respawnTimer / 3;
    if (ratio > 0.7) {
      // Fading in
      const alpha = (ratio - 0.7) / 0.3;
      ctx.globalAlpha = alpha;
      drawBottleShape(ctx, bottle, t);
      ctx.globalAlpha = 1;
    }
    return;
  }
  drawBottleShape(ctx, bottle, t);
}

function drawBottleShape(ctx: CanvasRenderingContext2D, bottle: HealingBottle, t: number) {
  const bob = Math.sin(bottle.bobTimer * 2.5) * 3;
  const { x, w, h } = bottle;
  const y = bottle.y + bob;

  // Glow
  ctx.shadowColor = COLORS.HEAL;
  ctx.shadowBlur = 10;

  // Bottle body (rounded rect via arc)
  const bx = x + 4, by = y + 8, bw = w - 8, bh = h - 10;
  ctx.fillStyle = COLORS.HEAL;
  roundRect(ctx, bx, by, bw, bh, 4);
  ctx.fill();

  // Highlight
  ctx.fillStyle = COLORS.HEAL_LIGHT;
  roundRect(ctx, bx + 2, by + 2, bw / 2 - 2, bh / 2 - 2, 2);
  ctx.fill();

  // Bottle neck
  ctx.fillStyle = COLORS.HEAL_CAP;
  ctx.fillRect(x + w / 2 - 3, y + 2, 6, 8);

  // Cap
  ctx.fillStyle = COLORS.HEAL_LIGHT;
  ctx.fillRect(x + w / 2 - 4, y, 8, 5);

  // Cross
  ctx.fillStyle = '#fff';
  ctx.fillRect(bx + bw / 2 - 1, by + 4, 2, bh - 8);
  ctx.fillRect(bx + 3, by + bh / 2 - 1, bw - 6, 2);

  ctx.shadowBlur = 0;
}

// ─── Player ───────────────────────────────────────────────────────────────

function drawPlayer(ctx: CanvasRenderingContext2D, p: Player) {
  const { x, y, w, h, flashTimer } = p;

  let bodyColor = COLORS.PLAYER;
  if (flashTimer > 0) bodyColor = COLORS.PLAYER_HIT;
  else if (flashTimer < 0) bodyColor = COLORS.PLAYER_HEAL;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x + 3, y + 3, w, h);

  // Body
  ctx.fillStyle = bodyColor;
  ctx.fillRect(x, y, w, h);

  // Outline
  ctx.strokeStyle = COLORS.PLAYER_OUTLINE;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // Face detail (only when not flashing)
  if (flashTimer === 0) {
    ctx.fillStyle = COLORS.PLAYER_DETAIL;
    // Eyes
    ctx.fillRect(x + 4, y + 5, 4, 3);
    ctx.fillRect(x + w - 8, y + 5, 4, 3);
    // Mouth
    ctx.fillRect(x + 5, y + h - 7, w - 10, 2);
  }

  // Glow outline when flash active
  if (flashTimer !== 0) {
    ctx.shadowColor = bodyColor;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);
    ctx.shadowBlur = 0;
  }
}

// ─── Floating damage / heal text ──────────────────────────────────────────

function drawFloat(ctx: CanvasRenderingContext2D, ft: FloatingText) {
  const alpha = ft.life / ft.maxLife;
  const rise = (1 - alpha) * 24;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = ft.color;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(ft.text, ft.x, ft.y - rise);
  ctx.globalAlpha = 1;
}

// ─── HUD ──────────────────────────────────────────────────────────────────

function drawHUD(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  bestTime: number | null,
) {
  const { player, timeRemaining } = state;
  const hudY = 8;

  ctx.font = '11px "Press Start 2P", monospace';
  ctx.textAlign = 'left';

  // HP label
  ctx.fillStyle = COLORS.HUD_WEAK;
  ctx.fillText('HP', 50, hudY + 14);

  // HP bar background
  const barX = 82, barY = hudY + 4, barW = 160, barH = 16;
  ctx.fillStyle = COLORS.HUD_HP_BG;
  ctx.fillRect(barX, barY, barW, barH);

  // HP bar fill
  const hpRatio = Math.max(0, player.hp / player.maxHp);
  const hpColor = hpRatio > 0.5 ? COLORS.HUD_HP_BAR : hpRatio > 0.25 ? '#FF8C00' : '#FF2200';
  ctx.fillStyle = hpColor;
  ctx.fillRect(barX + 1, barY + 1, (barW - 2) * hpRatio, barH - 2);

  // HP bar border
  ctx.strokeStyle = '#FF4D4D88';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barW, barH);

  // HP number
  ctx.fillStyle = COLORS.HUD_TEXT;
  ctx.textAlign = 'left';
  ctx.fillText(`${player.hp}/${player.maxHp}`, barX + barW + 8, hudY + 14);

  // Timer — center top
  const timeStr = timeRemaining.toFixed(2);
  const timeColor = timeRemaining < 5 ? '#FF4D4D' : timeRemaining < 10 ? '#FF8C00' : COLORS.HUD_TIME;
  ctx.font = '14px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = timeColor;
  ctx.fillText(timeStr, CANVAS_WIDTH / 2, hudY + 16);

  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = COLORS.HUD_WEAK;
  ctx.fillText('SEC REMAINING', CANVAS_WIDTH / 2, hudY + 28);

  // Best time — top right
  ctx.textAlign = 'right';
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.fillStyle = COLORS.HUD_BEST;
  const bestStr = bestTime !== null ? `BEST: ${bestTime.toFixed(2)}s` : 'BEST: --';
  ctx.fillText(bestStr, CANVAS_WIDTH - 50, hudY + 14);

  // Controls hint — bottom
  ctx.textAlign = 'center';
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = COLORS.HUD_WEAK;
  ctx.fillText('WASD / ARROWS  ·  R to restart  ·  GOAL: drop HP to 0 in 15s', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 12);
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// Convert #RRGGBB to "R,G,B" string for rgba()
function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r},${g},${b}`;
}
