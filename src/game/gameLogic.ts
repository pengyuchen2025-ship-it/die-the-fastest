import { GameState, Player } from './types';
import { rectsOverlap, resolveOverlap } from './collision';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, WALL_THICKNESS,
  PLAYER_SPEED, PLAYER_MAX_HP,
  POISON_DAMAGE, POISON_INTERVAL,
  HEAL_AMOUNT, HEAL_RESPAWN,
  GAME_DURATION,
} from './constants';
import { createPlayer, createSpikes, createPoisonPools, createHealingBottles, createPillars } from './entities';

// ─── Sound stubs (wire real audio here later) ─────────────────────────────
export function playHitSound() {}
export function playHealSound() {}
export function playWinSound() {}
export function playLoseSound() {}
export function playPillarSound() {}

let _floatId = 0;

function spawnFloat(
  state: GameState,
  x: number, y: number,
  text: string, color: string
) {
  state.floatingTexts.push({
    id: `f${_floatId++}`,
    x, y, text, color,
    life: 0.75,
    maxLife: 0.75,
  });
}

// ─── State factory ────────────────────────────────────────────────────────

export function createInitialState(): GameState {
  return {
    phase: 'playing',
    player: createPlayer(),
    spikes: createSpikes(),
    poisonPools: createPoisonPools(),
    healingBottles: createHealingBottles(),
    pillars: createPillars(),
    floatingTexts: [],
    timeElapsed: 0,
    timeRemaining: GAME_DURATION,
    screenShake: 0,
    keys: new Set(),
  };
}

// ─── Main update (called each frame) ─────────────────────────────────────
// Mutates state in-place for performance (refs/maps etc.)

export function updateGame(state: GameState, dt: number): void {
  if (state.phase !== 'playing') return;

  state.timeElapsed += dt;
  state.timeRemaining = Math.max(0, GAME_DURATION - state.timeElapsed);

  updateMovement(state, dt);
  updateSpikes(state, dt);
  updatePillars(state, dt);
  updatePoison(state, dt);
  updateBottles(state, dt);
  updateCooldowns(state, dt);
  updateFloats(state, dt);

  // Flash decay
  const p = state.player;
  if (p.flashTimer > 0) p.flashTimer = Math.max(0, p.flashTimer - dt);
  else if (p.flashTimer < 0) p.flashTimer = Math.min(0, p.flashTimer + dt);

  // Screen shake decay
  state.screenShake = Math.max(0, state.screenShake - dt * 6);

  // Win / lose checks
  if (p.hp <= 0) {
    p.hp = 0;
    state.phase = 'win';
    playWinSound();
    return;
  }
  if (state.timeRemaining <= 0) {
    state.phase = 'lose';
    playLoseSound();
  }
}

// ─── Movement & collision ─────────────────────────────────────────────────

function updateMovement(state: GameState, dt: number) {
  const keys = state.keys;
  let dx = 0, dy = 0;

  if (keys.has('ArrowLeft')  || keys.has('a') || keys.has('A')) dx -= 1;
  if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) dx += 1;
  if (keys.has('ArrowUp')    || keys.has('w') || keys.has('W')) dy -= 1;
  if (keys.has('ArrowDown')  || keys.has('s') || keys.has('S')) dy += 1;

  if (dx !== 0 && dy !== 0) {
    // Normalize diagonal so speed stays constant
    dx *= 0.7071;
    dy *= 0.7071;
  }

  const speed = PLAYER_SPEED * dt;
  const p = state.player;

  // Apply movement one axis at a time for clean wall sliding
  p.x += dx * speed;
  clampToRoom(p);
  pushOutOfPillars(state, 'x');

  p.y += dy * speed;
  clampToRoom(p);
  pushOutOfPillars(state, 'y');
}

function clampToRoom(p: Player) {
  const W = WALL_THICKNESS;
  p.x = Math.max(W, Math.min(CANVAS_WIDTH  - W - p.w, p.x));
  p.y = Math.max(W, Math.min(CANVAS_HEIGHT - W - p.h, p.y));
}

function pushOutOfPillars(state: GameState, _axis: 'x' | 'y') {
  for (const pillar of state.pillars) {
    if (!pillar.isOut) continue;
    const v = resolveOverlap(state.player, pillar);
    if (v) {
      state.player.x += v.dx;
      state.player.y += v.dy;
    }
  }
}

// ─── Spikes ───────────────────────────────────────────────────────────────

function updateSpikes(state: GameState, dt: number) {
  const p = state.player;
  for (const spike of state.spikes) {
    spike.cycleTimer += dt;
    const total = spike.outDuration + spike.inDuration;
    if (spike.cycleTimer >= total) spike.cycleTimer -= total;
    spike.isOut = spike.cycleTimer < spike.outDuration;

    if (!spike.isOut) continue;
    if (!rectsOverlap(p, spike)) continue;

    const cd = p.hitCooldowns.get(spike.id) ?? 0;
    if (cd > 0) continue;

    p.hp = Math.max(0, p.hp - spike.damage);
    p.flashTimer = 0.28;
    p.hitCooldowns.set(spike.id, spike.hitCooldown);
    state.screenShake = Math.min(1, state.screenShake + 0.3);
    spawnFloat(state, p.x + p.w / 2, p.y - 4, `-${spike.damage}`, '#FF6060');
    playHitSound();
  }
}

// ─── Pillars ──────────────────────────────────────────────────────────────

function updatePillars(state: GameState, dt: number) {
  for (const pillar of state.pillars) {
    const wasOut = pillar.isOut;
    pillar.cycleTimer += dt;
    const total = pillar.outDuration + pillar.inDuration;
    if (pillar.cycleTimer >= total) pillar.cycleTimer -= total;
    pillar.isOut = pillar.cycleTimer < pillar.outDuration;

    if (pillar.isOut !== wasOut) playPillarSound();
  }
}

// ─── Poison pool ──────────────────────────────────────────────────────────

function updatePoison(state: GameState, dt: number) {
  const p = state.player;
  for (const pool of state.poisonPools) {
    if (rectsOverlap(p, pool)) {
      pool.damageTimer += dt;
      while (pool.damageTimer >= POISON_INTERVAL) {
        pool.damageTimer -= POISON_INTERVAL;
        p.hp = Math.max(0, p.hp - POISON_DAMAGE);
        p.flashTimer = 0.18;
        state.screenShake = Math.min(1, state.screenShake + 0.15);
        spawnFloat(state, p.x + p.w / 2, p.y - 4, `-${POISON_DAMAGE}`, '#39FF88');
        playHitSound();
      }
    } else {
      // Reset timer when player leaves so ticks restart on re-entry
      pool.damageTimer = 0;
    }
  }
}

// ─── Healing bottles ──────────────────────────────────────────────────────

function updateBottles(state: GameState, dt: number) {
  const p = state.player;
  for (const bottle of state.healingBottles) {
    bottle.bobTimer += dt;
    if (!bottle.active) {
      bottle.respawnTimer -= dt;
      if (bottle.respawnTimer <= 0) bottle.active = true;
      continue;
    }
    if (!rectsOverlap(p, bottle)) continue;

    const prev = p.hp;
    p.hp = Math.min(p.maxHp, p.hp + HEAL_AMOUNT);
    const gained = p.hp - prev;
    if (gained > 0) {
      p.flashTimer = -0.28;
      spawnFloat(state, p.x + p.w / 2, p.y - 4, `+${gained}`, '#39FF88');
      playHealSound();
    }
    bottle.active = false;
    bottle.respawnTimer = HEAL_RESPAWN;
  }
}

// ─── Hit cooldowns ────────────────────────────────────────────────────────

function updateCooldowns(state: GameState, dt: number) {
  const cd = state.player.hitCooldowns;
  for (const [key, val] of cd.entries()) {
    const next = val - dt;
    if (next <= 0) cd.delete(key);
    else cd.set(key, next);
  }
}

// ─── Floating texts ───────────────────────────────────────────────────────

function updateFloats(state: GameState, dt: number) {
  state.floatingTexts = state.floatingTexts
    .map(ft => ({ ...ft, life: ft.life - dt }))
    .filter(ft => ft.life > 0);
}

// ─── Restart ─────────────────────────────────────────────────────────────

export function resetState(state: GameState): void {
  const fresh = createInitialState();
  // Copy all properties into the existing object so refs remain stable
  Object.assign(state, fresh);
  state.keys = new Set(); // always reset keys
}
