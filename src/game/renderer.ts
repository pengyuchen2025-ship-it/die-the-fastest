import {
  GameState, Spike, PoisonPool, HealingBottle, Pillar, Player, FloatingText,
} from './types';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, WALL_THICKNESS, TILE_SIZE, COLORS,
} from './constants';

// ─── Entry point ──────────────────────────────────────────────────────────

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  bestTime: number | null,
  animTime: number,
) {
  const shake = state.screenShake;
  const sx = shake > 0 ? (Math.random() - 0.5) * shake * 20 : 0;
  const sy = shake > 0 ? (Math.random() - 0.5) * shake * 20 : 0;

  ctx.save();
  if (shake > 0) ctx.translate(sx, sy);

  drawBackground(ctx);
  drawFloor(ctx);
  drawWalls(ctx);

  for (const pool   of state.poisonPools)    drawPoisonPool(ctx, pool, animTime);
  for (const spike  of state.spikes)         drawSpike(ctx, spike, animTime);
  for (const pillar of state.pillars)        drawPillar(ctx, pillar, animTime);
  for (const bottle of state.healingBottles) drawBottle(ctx, bottle, animTime);

  const isMoving =
    state.keys.has('a') || state.keys.has('A') ||
    state.keys.has('d') || state.keys.has('D') ||
    state.keys.has('w') || state.keys.has('W') ||
    state.keys.has('s') || state.keys.has('S') ||
    state.keys.has('ArrowLeft') || state.keys.has('ArrowRight') ||
    state.keys.has('ArrowUp')   || state.keys.has('ArrowDown');

  drawPlayer(ctx, state.player, animTime, isMoving);
  for (const ft of state.floatingTexts)      drawFloat(ctx, ft);

  ctx.restore();
  drawUrgencyVignette(ctx, state.timeRemaining, animTime);
  drawHUD(ctx, state, bestTime);
}

// ─── Background / floor / walls ───────────────────────────────────────────

function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.BG;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawFloor(ctx: CanvasRenderingContext2D) {
  const W = WALL_THICKNESS;
  const x0 = W, y0 = W, x1 = CANVAS_WIDTH - W, y1 = CANVAS_HEIGHT - W;
  for (let ty = y0; ty < y1; ty += TILE_SIZE) {
    for (let tx = x0; tx < x1; tx += TILE_SIZE) {
      const tw = Math.min(TILE_SIZE, x1 - tx);
      const th = Math.min(TILE_SIZE, y1 - ty);
      ctx.fillStyle =
        (tx / TILE_SIZE + ty / TILE_SIZE) % 2 === 0 ? COLORS.TILE : COLORS.TILE_DARK;
      ctx.fillRect(tx, ty, tw, th);
      ctx.fillStyle = COLORS.TILE_LIGHT;
      ctx.fillRect(tx, ty, tw, 1);
      ctx.fillRect(tx, ty, 1, th);
    }
  }
}

function drawWalls(ctx: CanvasRenderingContext2D) {
  const W = WALL_THICKNESS;
  ctx.fillStyle = COLORS.WALL;
  ctx.fillRect(0, 0, CANVAS_WIDTH, W);
  ctx.fillRect(0, CANVAS_HEIGHT - W, CANVAS_WIDTH, W);
  ctx.fillRect(0, 0, W, CANVAS_HEIGHT);
  ctx.fillRect(CANVAS_WIDTH - W, 0, W, CANVAS_HEIGHT);

  ctx.fillStyle = COLORS.WALL_SHADOW;
  ctx.fillRect(W, W, CANVAS_WIDTH - W * 2, 3);
  ctx.fillRect(W, W, 3, CANVAS_HEIGHT - W * 2);

  ctx.fillStyle = '#3A355A';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 2);
  ctx.fillRect(0, CANVAS_HEIGHT - 2, CANVAS_WIDTH, 2);
  ctx.fillRect(0, 0, 2, CANVAS_HEIGHT);
  ctx.fillRect(CANVAS_WIDTH - 2, 0, 2, CANVAS_HEIGHT);
}

// ─── Warning indicator (shared by all entity types) ───────────────────────
// Draws pulsing corner brackets + faint fill.
// progress: 0 = just entered warning, 1 = about to become active

function drawWarning(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string,
  progress: number,
  animTime: number,
) {
  // Pulse faster as entity is about to appear
  const freq  = 3 + progress * 9;
  const pulse = (Math.sin(animTime * freq * Math.PI * 2) + 1) / 2;
  const alpha = 0.35 + pulse * 0.65;

  ctx.globalAlpha = alpha;

  // Faint fill
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha * 0.12;
  ctx.fillRect(x, y, w, h);

  // Corner brackets
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'square';

  const cs = Math.min(12, w / 3, h / 3);

  // Top-left
  ctx.beginPath();
  ctx.moveTo(x, y + cs); ctx.lineTo(x, y); ctx.lineTo(x + cs, y);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(x + w - cs, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cs);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(x, y + h - cs); ctx.lineTo(x, y + h); ctx.lineTo(x + cs, y + h);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(x + w, y + h - cs); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - cs, y + h);
  ctx.stroke();

  // Center icon — small matching symbol
  ctx.globalAlpha = alpha * 0.8;
  ctx.fillStyle = color;
  ctx.font = `bold ${Math.min(14, w * 0.3)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('!', x + w / 2, y + h / 2);
  ctx.textBaseline = 'alphabetic';

  ctx.globalAlpha = 1;
  ctx.lineCap = 'butt';
}

// Helper: progress ratio for the current state (0=just entered, 1=about to exit)
function stateProgress(stateTimer: number, duration: number): number {
  return Math.max(0, Math.min(1, 1 - stateTimer / duration));
}

// Helper: appear-scale for a newly active entity (pop-in effect)
function appearScale(stateTimer: number, activeDuration: number): number {
  const elapsed = activeDuration - stateTimer;
  return Math.min(1, elapsed / 0.12);
}

// ─── Spike ────────────────────────────────────────────────────────────────

function drawSpike(ctx: CanvasRenderingContext2D, spike: Spike, animTime: number) {
  const { x, y, w, h } = spike;

  if (spike.state === 'hidden') return;

  if (spike.state === 'warning') {
    const color = spike.type === 'burst' ? COLORS.BURST : COLORS.SPIKE;
    drawWarning(ctx, x, y, w, h, color,
      stateProgress(spike.stateTimer, spike.warningDuration), animTime);
    return;
  }

  // Active
  const isBurst = spike.type === 'burst';
  const color   = isBurst ? COLORS.BURST      : COLORS.SPIKE;
  const glow    = isBurst ? COLORS.BURST_GLOW : COLORS.SPIKE_GLOW;
  const dark    = isBurst ? COLORS.BURST_DARK : COLORS.SPIKE_DARK;
  const scale   = appearScale(spike.stateTimer, spike.activeDuration);

  // Base plate
  ctx.fillStyle = dark;
  ctx.fillRect(x, y, w, h);

  // Spike triangles
  const count = isBurst ? 4 : 3;
  const tipY  = y + h / 2 - h * 0.45 * scale;
  const baseY = y + h - 4;

  for (let i = 0; i < count; i++) {
    const cx = x + ((i + 0.5) / count) * w;
    const bw = (w / count) * 0.72;

    // Glow halo
    ctx.beginPath();
    ctx.moveTo(cx, tipY - 2);
    ctx.lineTo(cx - bw / 2 - 2, baseY);
    ctx.lineTo(cx + bw / 2 + 2, baseY);
    ctx.closePath();
    ctx.fillStyle = `rgba(${hexRgb(glow)},0.4)`;
    ctx.fill();

    // Main triangle
    ctx.beginPath();
    ctx.moveTo(cx, tipY);
    ctx.lineTo(cx - bw / 2, baseY);
    ctx.lineTo(cx + bw / 2, baseY);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Tip highlight
    ctx.beginPath();
    ctx.moveTo(cx, tipY);
    ctx.lineTo(cx - bw / 4, tipY + (baseY - tipY) * 0.4);
    ctx.lineTo(cx + bw / 4, tipY + (baseY - tipY) * 0.4);
    ctx.closePath();
    ctx.fillStyle = glow;
    ctx.fill();
  }

  // Active pulse border
  const pulse = Math.sin(animTime * 8) * 0.3 + 0.7;
  ctx.strokeStyle = `rgba(${hexRgb(color)},${pulse * 0.6})`;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
}

// ─── Poison pool ──────────────────────────────────────────────────────────

function drawPoisonPool(ctx: CanvasRenderingContext2D, pool: PoisonPool, animTime: number) {
  const { x, y, w, h } = pool;

  if (pool.state === 'hidden') return;

  if (pool.state === 'warning') {
    drawWarning(ctx, x, y, w, h, COLORS.POISON,
      stateProgress(pool.stateTimer, pool.warningDuration), animTime);
    return;
  }

  const scale     = appearScale(pool.stateTimer, pool.activeDuration);
  const baseAlpha = Math.min(1, scale * 2);
  ctx.globalAlpha = baseAlpha;

  // Base
  ctx.fillStyle = COLORS.POISON_BG;
  ctx.fillRect(x, y, w, h);

  // Animated inner glow
  const s = Math.sin(animTime * 2.5) * 0.5 + 0.5;
  ctx.fillStyle = `rgba(26,127,78,${0.4 + s * 0.3})`;
  ctx.fillRect(x + 4, y + 4, w - 8, h - 8);

  // Border
  ctx.strokeStyle = COLORS.POISON;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

  // Rising "+" symbols
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = '#39FF88';
  for (let i = 0; i < 5; i++) {
    const bx    = x + 14 + (i * (w - 28)) / 4;
    const phase = (animTime * 1.4 + i * 1.3) % 1;
    const by    = y + h - 8 - phase * (h - 18);
    const size  = Math.round(8 + Math.sin(animTime * 3 + i) * 2);
    ctx.globalAlpha = baseAlpha * (0.6 - phase * 0.45);
    ctx.font = `bold ${size}px monospace`;
    ctx.fillText('+', bx, by);
  }
  ctx.textBaseline = 'alphabetic';

  ctx.globalAlpha = 1;
}

// ─── Pillar ───────────────────────────────────────────────────────────────

function drawPillar(ctx: CanvasRenderingContext2D, pillar: Pillar, animTime: number) {
  const { x, y, w, h } = pillar;

  if (pillar.state === 'hidden') return;

  if (pillar.state === 'warning') {
    drawWarning(ctx, x, y, w, h, COLORS.PILLAR,
      stateProgress(pillar.stateTimer, pillar.warningDuration), animTime);
    return;
  }

  // Active — draw full pillar with rise animation
  const scale = appearScale(pillar.stateTimer, pillar.activeDuration);
  const drawH = h * scale;
  const drawY = y + (h - drawH);

  // Shadow
  ctx.fillStyle = COLORS.PILLAR_SHADOW;
  ctx.fillRect(x + 5, drawY + 5, w, drawH);

  // Body
  ctx.fillStyle = COLORS.PILLAR;
  ctx.fillRect(x, drawY, w, drawH);

  if (scale < 0.95) return; // skip detail until fully risen

  // Light edge (top-left)
  ctx.fillStyle = COLORS.PILLAR_LIGHT;
  ctx.fillRect(x, y, w, 4);
  ctx.fillRect(x, y, 4, h);

  // Dark edge (bottom-right)
  ctx.fillStyle = COLORS.PILLAR_SHADOW;
  ctx.fillRect(x, y + h - 4, w, 4);
  ctx.fillRect(x + w - 4, y, 4, h);

  // Cross detail
  ctx.fillStyle = COLORS.PILLAR_BASE;
  ctx.fillRect(x + w / 2 - 1, y + 6, 2, h - 12);
  ctx.fillRect(x + 6, y + h / 2 - 1, w - 12, 2);

  // Pulse outline
  const pulse = Math.sin(animTime * 3) * 0.2 + 0.5;
  ctx.strokeStyle = `rgba(170,175,187,${pulse})`;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
}

// ─── Healing bottle ───────────────────────────────────────────────────────

function drawBottle(ctx: CanvasRenderingContext2D, bottle: HealingBottle, animTime: number) {
  const { x, y, w, h } = bottle;

  if (bottle.state === 'hidden') return;

  if (bottle.state === 'warning') {
    drawWarning(ctx, x, y, w, h, COLORS.HEAL,
      stateProgress(bottle.stateTimer, bottle.warningDuration), animTime);
    return;
  }

  // Active with bob animation
  const bob  = Math.sin(bottle.bobTimer * 2.5) * 3;
  const by   = y + bob;
  const bx   = x + 4, bw = w - 8, bh = h - 10;

  ctx.shadowColor = COLORS.HEAL;
  ctx.shadowBlur  = 10;

  ctx.fillStyle = COLORS.HEAL;
  roundRect(ctx, bx, by + 8, bw, bh, 4); ctx.fill();

  ctx.fillStyle = COLORS.HEAL_LIGHT;
  roundRect(ctx, bx + 2, by + 10, bw / 2 - 2, bh / 2 - 2, 2); ctx.fill();

  ctx.fillStyle = COLORS.HEAL_CAP;
  ctx.fillRect(x + w / 2 - 3, by + 2, 6, 8);

  ctx.fillStyle = COLORS.HEAL_LIGHT;
  ctx.fillRect(x + w / 2 - 4, by, 8, 5);

  ctx.fillStyle = '#fff';
  ctx.fillRect(bx + bw / 2 - 1, by + 12, 2, bh - 6);
  ctx.fillRect(bx + 3, by + bh / 2 + 4, bw - 6, 2);

  ctx.shadowBlur = 0;
}

// ─── Player (pixel art humanoid) ─────────────────────────────────────────
//
// Bounding box: 20×20px (collision stays at this size)
// Visual layout (px relative to player.x/y):
//   Head  : (+6,  0, 8×7)   hair top 2px + face 5px
//   Body  : (+5,  7, 10×6)  shirt
//   L Arm : (+2,  7, 3×5)   shirt color
//   R Arm : (+15, 7, 3×5)
//   L Leg : (+5, 13, 4×5)   pants bottom 2px = shoe color
//   R Leg : (+11,13, 4×5)

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  p: Player,
  animTime: number,
  isMoving: boolean,
) {
  const { x, y, flashTimer } = p;

  const isHit  = flashTimer > 0;
  const isHeal = flashTimer < 0;

  // Palette — tint everything on hit/heal
  const skin    = isHit ? '#FF9090' : isHeal ? '#90FFB8' : '#FFD4B2';
  const hair    = isHit ? '#CC2020' : isHeal ? '#20CC60' : '#2A4A7F';
  const shirt   = isHit ? '#FF3030' : isHeal ? '#30FF70' : '#5DA9FF';
  const pants   = isHit ? '#CC1515' : isHeal ? '#15CC50' : '#2B5EA7';
  const shoe    = isHit ? '#880000' : isHeal ? '#007730' : '#1A2848';
  const outline = isHit ? '#FF2020' : isHeal ? '#20FF60' : COLORS.PLAYER_OUTLINE;
  const eye     = '#0A0A1E';

  // Walk cycle — legs alternate, arms swing opposite
  const cycle   = isMoving ? Math.sin(animTime * 11) : Math.sin(animTime * 2) * 0.3;
  const legOff  = Math.round(cycle * 2.5);   // ±2px
  const armOff  = Math.round(-cycle * 2);    // opposite
  // Whole body bobs up/down slightly
  const bob     = isMoving
    ? Math.round(Math.abs(Math.sin(animTime * 11)) * 1)
    : 0;

  const px = Math.round(x);
  const py = Math.round(y) - bob;

  // Ground shadow (ellipse)
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(px + 10, y + 21, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Legs (drawn first so body overlaps the top) ──
  // Left leg
  ctx.fillStyle = pants;
  ctx.fillRect(px + 5, py + 13 + legOff, 4, 3);
  // Left shoe
  ctx.fillStyle = shoe;
  ctx.fillRect(px + 4, py + 16 + legOff, 5, 2);

  // Right leg
  ctx.fillStyle = pants;
  ctx.fillRect(px + 11, py + 13 - legOff, 4, 3);
  // Right shoe
  ctx.fillStyle = shoe;
  ctx.fillRect(px + 11, py + 16 - legOff, 5, 2);

  // ── Arms (behind body visually — draw before body) ──
  // Left arm
  ctx.fillStyle = shirt;
  ctx.fillRect(px + 2, py + 8 + armOff, 3, 5);
  ctx.strokeStyle = outline;
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 2, py + 8 + armOff, 3, 5);

  // Right arm
  ctx.fillStyle = shirt;
  ctx.fillRect(px + 15, py + 8 - armOff, 3, 5);
  ctx.strokeStyle = outline;
  ctx.strokeRect(px + 15, py + 8 - armOff, 3, 5);

  // ── Torso / shirt ──
  ctx.fillStyle = shirt;
  ctx.fillRect(px + 5, py + 7, 10, 7);
  ctx.strokeStyle = outline;
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 5, py + 7, 10, 7);

  // Shirt collar detail
  ctx.fillStyle = '#fff';
  ctx.fillRect(px + 8, py + 7, 4, 1);

  // ── Head ──
  // Hair (top 3px)
  ctx.fillStyle = hair;
  ctx.fillRect(px + 6, py, 8, 3);

  // Face
  ctx.fillStyle = skin;
  ctx.fillRect(px + 6, py + 3, 8, 4);

  // Head outline
  ctx.strokeStyle = outline;
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 6, py, 8, 7);

  // Eyes — 2×2 each
  ctx.fillStyle = eye;
  ctx.fillRect(px + 8, py + 4, 2, 2);
  ctx.fillRect(px + 11, py + 4, 2, 2);

  // Eye whites (top pixel)
  ctx.fillStyle = '#fff';
  ctx.fillRect(px + 8, py + 4, 2, 1);
  ctx.fillRect(px + 11, py + 4, 2, 1);
  ctx.fillStyle = eye;
  ctx.fillRect(px + 8, py + 5, 2, 1);
  ctx.fillRect(px + 11, py + 5, 2, 1);

  // Mouth (happy expression when normal, grimace when flashing)
  ctx.fillStyle = isHit ? '#FF0000' : isHeal ? '#00CC44' : '#C07050';
  if (!isHit && !isHeal) {
    // Smile: 4px wide, 1px
    ctx.fillRect(px + 9, py + 6, 3, 1);
    // Smile corners go down
    ctx.fillRect(px + 8,  py + 5, 1, 1);
    ctx.fillRect(px + 12, py + 5, 1, 1);
  } else {
    // Flat line
    ctx.fillRect(px + 9, py + 6, 3, 1);
  }

  // ── Flash glow outline ──
  if (flashTimer !== 0) {
    const glowColor = isHit ? COLORS.PLAYER_HIT : COLORS.PLAYER_HEAL;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur  = 16;
    ctx.strokeStyle = glowColor;
    ctx.lineWidth   = 2;
    // Outline entire character bounds
    ctx.strokeRect(px + 2, py - 1, 17, 22);
    ctx.shadowBlur  = 0;
  }
}

// ─── Floating text ────────────────────────────────────────────────────────

function drawFloat(ctx: CanvasRenderingContext2D, ft: FloatingText) {
  const alpha = ft.life / ft.maxLife;
  const rise  = (1 - alpha) * 24;
  ctx.globalAlpha = alpha;
  ctx.fillStyle   = ft.color;
  ctx.font        = 'bold 14px monospace';
  ctx.textAlign   = 'center';
  ctx.fillText(ft.text, ft.x, ft.y - rise);
  ctx.globalAlpha = 1;
}

// ─── Urgency vignette (time < 5s) ────────────────────────────────────────
// Red radial gradient on screen edges, pulsing faster as time runs out.

function drawUrgencyVignette(
  ctx: CanvasRenderingContext2D,
  timeRemaining: number,
  animTime: number,
) {
  if (timeRemaining >= 5) return;

  // 0 at 5 s remaining → 1 at 0 s remaining
  const intensity = (5 - timeRemaining) / 5;

  // Pulse frequency ramps from 2 Hz → 10 Hz
  const freq  = 2 + intensity * 8;
  const pulse = (Math.sin(animTime * freq * Math.PI * 2) + 1) / 2; // 0..1

  // Alpha: modest at start, peaks near ~0.55 at 0 s
  const alpha = intensity * (0.2 + pulse * 0.35);

  const cx = CANVAS_WIDTH  / 2;
  const cy = CANVAS_HEIGHT / 2;
  const grad = ctx.createRadialGradient(
    cx, cy, CANVAS_HEIGHT * 0.2,   // inner radius — clear center
    cx, cy, CANVAS_WIDTH  * 0.78,  // outer radius — red edges
  );
  grad.addColorStop(0, 'rgba(200,0,0,0)');
  grad.addColorStop(1, `rgba(220,0,0,${alpha.toFixed(3)})`);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

// ─── HUD ──────────────────────────────────────────────────────────────────

function drawHUD(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  bestTime: number | null,
) {
  const { player, timeRemaining } = state;
  const hudY = 8;

  // HP label
  ctx.font      = '13px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.HUD_WEAK;
  ctx.fillText('HP', 48, hudY + 16);

  // HP bar
  const barX = 82, barY = hudY + 4, barW = 170, barH = 18;
  ctx.fillStyle = COLORS.HUD_HP_BG;
  ctx.fillRect(barX, barY, barW, barH);

  const ratio    = Math.max(0, player.hp / player.maxHp);
  const hpColor  = ratio > 0.5 ? COLORS.HUD_HP_BAR : ratio > 0.25 ? '#FF8C00' : '#FF2200';
  ctx.fillStyle  = hpColor;
  ctx.fillRect(barX + 1, barY + 1, (barW - 2) * ratio, barH - 2);

  ctx.strokeStyle = '#FF4D4D88';
  ctx.lineWidth   = 1;
  ctx.strokeRect(barX, barY, barW, barH);

  ctx.fillStyle  = COLORS.HUD_TEXT;
  ctx.font       = '12px "Press Start 2P", monospace';
  ctx.textAlign  = 'left';
  ctx.fillText(`${player.hp}/${player.maxHp}`, barX + barW + 8, hudY + 16);

  // Timer — center
  const timeColor = timeRemaining < 5 ? '#FF4D4D' : timeRemaining < 10 ? '#FF8C00' : COLORS.HUD_TIME;
  ctx.font        = '17px "Press Start 2P", monospace';
  ctx.textAlign   = 'center';
  ctx.fillStyle   = timeColor;
  ctx.fillText(timeRemaining.toFixed(2), CANVAS_WIDTH / 2, hudY + 18);

  ctx.font      = '9px "Press Start 2P", monospace';
  ctx.fillStyle = COLORS.HUD_WEAK;
  ctx.fillText('秒剩余', CANVAS_WIDTH / 2, hudY + 31);

  // Best time — right
  ctx.textAlign = 'right';
  ctx.font      = '10px "Press Start 2P", monospace';
  ctx.fillStyle = COLORS.HUD_BEST;
  ctx.fillText(
    bestTime !== null ? `最佳: ${bestTime.toFixed(2)}s` : '最佳: --',
    CANVAS_WIDTH - 46, hudY + 16,
  );

  // Controls hint — bottom
  ctx.textAlign = 'center';
  ctx.font      = '9px "Press Start 2P", monospace';
  ctx.fillStyle = COLORS.HUD_WEAK;
  ctx.fillText(
    'WASD / 方向键  ·  R 重开  ·  目标：15秒内HP归零',
    CANVAS_WIDTH / 2, CANVAS_HEIGHT - 12,
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function roundRect(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number,
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

function hexRgb(hex: string): string {
  const h = hex.replace('#', '');
  return `${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)}`;
}
