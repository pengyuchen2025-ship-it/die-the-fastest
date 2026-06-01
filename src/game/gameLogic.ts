import { GameState, CyclingEntity, Player, EntityState } from './types';
import { rectsOverlap, resolveOverlap } from './collision';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, WALL_THICKNESS,
  PLAYER_SPEED, PLAYER_MAX_HP,
  POISON_DAMAGE, POISON_INTERVAL,
  LAVA_DAMAGE, LAVA_INTERVAL,
  HEAL_AMOUNT,
  GAME_DURATION,
  RULE_BREAK_THRESHOLD, RULE_BREAK_ANIM_DURATION,
} from './constants';
import {
  createPlayer, createSpikes, createPoisonPools, createLavaPools,
  createHealingBottles, createPillars, randomPos,
} from './entities';

// ─── Sound stubs ──────────────────────────────────────────────────────────
export function playHitSound() {}
export function playHealSound() {}
export function playWinSound() {}
export function playLoseSound() {}
export function playPillarSound() {}

let _fid = 0;

function spawnFloat(
  state: GameState, x: number, y: number, text: string, color: string,
) {
  state.floatingTexts.push({
    id: `f${_fid++}`, x, y, text, color, life: 0.75, maxLife: 0.75,
  });
}

// ─── State factory ────────────────────────────────────────────────────────

export function createInitialState(): GameState {
  return {
    phase: 'playing',
    player: createPlayer(),
    spikes: createSpikes(),
    poisonPools: createPoisonPools(),
    lavaPools: createLavaPools(),
    healingBottles: createHealingBottles(),
    pillars: createPillars(),
    floatingTexts: [],
    timeElapsed: 0,
    timeRemaining: GAME_DURATION,
    screenShake: 0,
    keys: new Set(),
    ruleBreakTimer: 0,
  };
}

export function resetState(state: GameState): void {
  Object.assign(state, createInitialState());
  state.keys = new Set();
}

// ─── Main update ──────────────────────────────────────────────────────────

export function updateGame(state: GameState, dt: number): void {
  if (state.phase === 'rule_break_anim') {
    state.ruleBreakTimer += dt;
    if (state.ruleBreakTimer >= RULE_BREAK_ANIM_DURATION) {
      state.phase = 'rule_break';
    }
    return;
  }
  if (state.phase !== 'playing') return;

  state.timeElapsed += dt;
  state.timeRemaining = Math.max(0, GAME_DURATION - state.timeElapsed);

  updateMovement(state, dt);
  updateSpikes(state, dt);
  updatePillars(state, dt);
  updatePoison(state, dt);
  updateLava(state, dt);
  updateBottles(state, dt);
  updateCooldowns(state, dt);
  updateFloats(state, dt);

  const p = state.player;
  if (p.flashTimer > 0) p.flashTimer = Math.max(0, p.flashTimer - dt);
  else if (p.flashTimer < 0) p.flashTimer = Math.min(0, p.flashTimer + dt);

  // Fast decay so shake feels like a sharp snap, not a wobble
  state.screenShake = Math.max(0, state.screenShake - dt * 22);

  if (p.hp <= 0) {
    p.hp = 0;
    if (state.timeElapsed <= RULE_BREAK_THRESHOLD) {
      state.phase = 'rule_break_anim';
      state.ruleBreakTimer = 0;
    } else {
      state.phase = 'win';
      playWinSound();
    }
    return;
  }
  if (state.timeRemaining <= 0) {
    state.phase = 'lose';
    playLoseSound();
  }
}

// ─── Entity state machine ─────────────────────────────────────────────────
// Transition: hidden → warning (pick new random pos) → active → hidden → ...

function advanceCycle(entity: CyclingEntity, dt: number, avoidX: number, avoidY: number): void {
  entity.stateTimer -= dt;
  if (entity.stateTimer > 0) return;

  const overflow = entity.stateTimer; // negative, carry leftover time

  switch (entity.state) {
    case 'hidden': {
      const pos = randomPos(entity.w, entity.h, avoidX, avoidY);
      entity.x = pos.x;
      entity.y = pos.y;
      entity.state = 'warning';
      entity.stateTimer = entity.warningDuration + overflow;
      break;
    }
    case 'warning':
      entity.state = 'active';
      entity.stateTimer = entity.activeDuration + overflow;
      break;
    case 'active':
      entity.state = 'hidden';
      entity.stateTimer = entity.hiddenDuration + overflow;
      break;
  }
}

// ─── Movement ─────────────────────────────────────────────────────────────

function updateMovement(state: GameState, dt: number) {
  const keys = state.keys;
  let dx = 0, dy = 0;

  if (keys.has('ArrowLeft')  || keys.has('a') || keys.has('A')) dx -= 1;
  if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) dx += 1;
  if (keys.has('ArrowUp')    || keys.has('w') || keys.has('W')) dy -= 1;
  if (keys.has('ArrowDown')  || keys.has('s') || keys.has('S')) dy += 1;

  if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }

  const speed = PLAYER_SPEED * dt;
  const p = state.player;

  p.x += dx * speed;
  clampToRoom(p);
  pushOutOfPillars(state);

  p.y += dy * speed;
  clampToRoom(p);
  pushOutOfPillars(state);
}

function clampToRoom(p: Player) {
  const W = WALL_THICKNESS;
  p.x = Math.max(W, Math.min(CANVAS_WIDTH  - W - p.w, p.x));
  p.y = Math.max(W, Math.min(CANVAS_HEIGHT - W - p.h, p.y));
}

function pushOutOfPillars(state: GameState) {
  for (const pillar of state.pillars) {
    if (pillar.state !== 'active') continue;
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
    advanceCycle(spike, dt, p.x + p.w / 2, p.y + p.h / 2);

    if (spike.state !== 'active') continue;
    if (!rectsOverlap(p, spike)) continue;

    const cd = p.hitCooldowns.get(spike.id) ?? 0;
    if (cd > 0) continue;

    p.hp = Math.max(0, p.hp - spike.damage);
    p.flashTimer = 0.28;
    p.hitCooldowns.set(spike.id, spike.hitCooldown);
    // Burst spike hits harder than normal spike
    state.screenShake = spike.type === 'burst' ? 1.4 : 1.0;
    spawnFloat(state, p.x + p.w / 2, p.y - 4, `-${spike.damage}`, '#FF6060');
    playHitSound();
  }
}

// ─── Pillars ──────────────────────────────────────────────────────────────

function updatePillars(state: GameState, dt: number) {
  const p = state.player;
  for (const pillar of state.pillars) {
    const wasActive = pillar.state === 'active';
    advanceCycle(pillar, dt, p.x + p.w / 2, p.y + p.h / 2);
    const isActive = pillar.state === 'active';
    if (isActive !== wasActive) {
      playPillarSound();
    }
  }
}

// ─── Poison pool ──────────────────────────────────────────────────────────

function updatePoison(state: GameState, dt: number) {
  const p = state.player;
  for (const pool of state.poisonPools) {
    advanceCycle(pool, dt, p.x + p.w / 2, p.y + p.h / 2);
    // Reset damage timer when pool moves or is inactive
    if (pool.state !== 'active') {
      pool.damageTimer = 0;
      continue;
    }
    if (rectsOverlap(p, pool)) {
      if (pool.damageTimer === 0) pool.damageTimer = POISON_INTERVAL; // immediate first tick
      pool.damageTimer += dt;
      while (pool.damageTimer >= POISON_INTERVAL) {
        pool.damageTimer -= POISON_INTERVAL;
        if (p.hp < p.maxHp) {
          p.hp = Math.min(p.maxHp, p.hp + POISON_DAMAGE);
          p.flashTimer = -0.18;
          spawnFloat(state, p.x + p.w / 2, p.y - 4, `+${POISON_DAMAGE}`, '#39FF88');
          playHealSound();
        }
      }
    } else {
      pool.damageTimer = 0;
    }
  }
}

// ─── Lava pool ────────────────────────────────────────────────────────────

function updateLava(state: GameState, dt: number) {
  const p = state.player;
  for (const pool of state.lavaPools) {
    advanceCycle(pool, dt, p.x + p.w / 2, p.y + p.h / 2);
    if (pool.state !== 'active') {
      pool.damageTimer = 0;
      continue;
    }
    if (rectsOverlap(p, pool)) {
      if (pool.damageTimer === 0) pool.damageTimer = LAVA_INTERVAL; // immediate first tick
      pool.damageTimer += dt;
      while (pool.damageTimer >= LAVA_INTERVAL) {
        pool.damageTimer -= LAVA_INTERVAL;
        p.hp = Math.max(0, p.hp - LAVA_DAMAGE);
        p.flashTimer = 0.18;
        state.screenShake = Math.max(state.screenShake, 0.45);
        spawnFloat(state, p.x + p.w / 2, p.y - 4, `-${LAVA_DAMAGE}`, '#FF6B1A');
        playHitSound();
      }
    } else {
      pool.damageTimer = 0;
    }
  }
}

// ─── Healing bottles ──────────────────────────────────────────────────────

function updateBottles(state: GameState, dt: number) {
  const p = state.player;
  for (const bottle of state.healingBottles) {
    bottle.bobTimer += dt;
    advanceCycle(bottle, dt, p.x + p.w / 2, p.y + p.h / 2);

    if (bottle.state !== 'active') continue;
    if (!rectsOverlap(p, bottle)) continue;

    const prev = p.hp;
    p.hp = Math.min(p.maxHp, p.hp + HEAL_AMOUNT);
    const gained = p.hp - prev;
    if (gained > 0) {
      p.flashTimer = -0.28;
      spawnFloat(state, p.x + p.w / 2, p.y - 4, `+${gained}`, '#39FF88');
      playHealSound();
    }
    // Immediately hide the bottle after pickup
    bottle.state = 'hidden';
    bottle.stateTimer = bottle.hiddenDuration;
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
