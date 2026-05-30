import { Player, Spike, PoisonPool, HealingBottle, Pillar } from './types';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, WALL_THICKNESS,
  PLAYER_SIZE, PLAYER_MAX_HP,
  SPIKE_SIZE, SPIKE_DAMAGE, SPIKE_WARNING, SPIKE_ACTIVE, SPIKE_HIDDEN, SPIKE_COOLDOWN,
  BURST_SIZE, BURST_DAMAGE, BURST_WARNING, BURST_ACTIVE, BURST_HIDDEN, BURST_COOLDOWN,
  POISON_W, POISON_H, POISON_WARNING, POISON_ACTIVE, POISON_HIDDEN,
  HEAL_W, HEAL_H, HEAL_WARNING, HEAL_ACTIVE, HEAL_HIDDEN,
  PILLAR_SIZE, PILLAR_WARNING, PILLAR_ACTIVE, PILLAR_HIDDEN,
} from './constants';

// ─── Spawn area ───────────────────────────────────────────────────────────
// Entities spawn anywhere in the playable area, avoiding wall edges and HUD.
const SPAWN_PAD   = 18;
const SPAWN_TOP   = WALL_THICKNESS + 48; // leave room for HUD
const SPAWN_BOT   = WALL_THICKNESS + 35; // leave room for bottom hint

export function randomPos(w: number, h: number, avoidX = -999, avoidY = -999): { x: number; y: number } {
  const minX = WALL_THICKNESS + SPAWN_PAD;
  const maxX = CANVAS_WIDTH  - WALL_THICKNESS - w - SPAWN_PAD;
  const minY = SPAWN_TOP;
  const maxY = CANVAS_HEIGHT - SPAWN_BOT - h;

  let x = 0, y = 0;
  for (let i = 0; i < 20; i++) {
    x = minX + Math.random() * (maxX - minX);
    y = minY + Math.random() * (maxY - minY);
    // Don't spawn directly on top of the player
    const tooClose =
      Math.abs(x + w / 2 - avoidX) < 90 &&
      Math.abs(y + h / 2 - avoidY) < 90;
    if (!tooClose) break;
  }
  return { x, y };
}

// ─── Player ───────────────────────────────────────────────────────────────

export function createPlayer(): Player {
  return {
    x: 180,
    y: CANVAS_HEIGHT / 2 - PLAYER_SIZE / 2,
    w: PLAYER_SIZE,
    h: PLAYER_SIZE,
    hp: PLAYER_MAX_HP,
    maxHp: PLAYER_MAX_HP,
    flashTimer: 0,
    hitCooldowns: new Map(),
  };
}

// ─── Spikes ───────────────────────────────────────────────────────────────
// Stagger initial states so entities don't all appear at the same time.

export function createSpikes(): Spike[] {
  const p1 = randomPos(SPIKE_SIZE, SPIKE_SIZE);
  const p2 = randomPos(SPIKE_SIZE, SPIKE_SIZE);
  const p3 = randomPos(BURST_SIZE, BURST_SIZE);

  return [
    {
      id: 'spike_a',
      ...p1, w: SPIKE_SIZE, h: SPIKE_SIZE,
      type: 'normal',
      state: 'warning',          // already warning at game start
      stateTimer: SPIKE_WARNING,
      warningDuration: SPIKE_WARNING,
      activeDuration: SPIKE_ACTIVE,
      hiddenDuration: SPIKE_HIDDEN,
      damage: SPIKE_DAMAGE,
      hitCooldown: SPIKE_COOLDOWN,
    },
    {
      id: 'spike_b',
      ...p2, w: SPIKE_SIZE, h: SPIKE_SIZE,
      type: 'normal',
      state: 'hidden',           // appears after a short delay
      stateTimer: 0.7,
      warningDuration: SPIKE_WARNING,
      activeDuration: SPIKE_ACTIVE,
      hiddenDuration: SPIKE_HIDDEN,
      damage: SPIKE_DAMAGE,
      hitCooldown: SPIKE_COOLDOWN,
    },
    {
      id: 'burst_spike',
      ...p3, w: BURST_SIZE, h: BURST_SIZE,
      type: 'burst',
      state: 'hidden',
      stateTimer: 1.4,           // appears a bit later
      warningDuration: BURST_WARNING,
      activeDuration: BURST_ACTIVE,
      hiddenDuration: BURST_HIDDEN,
      damage: BURST_DAMAGE,
      hitCooldown: BURST_COOLDOWN,
    },
  ];
}

// ─── Poison pool ──────────────────────────────────────────────────────────

export function createPoisonPools(): PoisonPool[] {
  const p = randomPos(POISON_W, POISON_H);
  return [
    {
      id: 'poison_a',
      ...p, w: POISON_W, h: POISON_H,
      state: 'hidden',
      stateTimer: 1.0,
      warningDuration: POISON_WARNING,
      activeDuration: POISON_ACTIVE,
      hiddenDuration: POISON_HIDDEN,
      damageTimer: 0,
    },
  ];
}

// ─── Healing bottles ──────────────────────────────────────────────────────

export function createHealingBottles(): HealingBottle[] {
  const p = randomPos(HEAL_W, HEAL_H);
  return [
    {
      id: 'heal_a',
      ...p, w: HEAL_W, h: HEAL_H,
      state: 'hidden',
      stateTimer: 1.8,
      warningDuration: HEAL_WARNING,
      activeDuration: HEAL_ACTIVE,
      hiddenDuration: HEAL_HIDDEN,
      bobTimer: 0,
    },
  ];
}

// ─── Pillars ──────────────────────────────────────────────────────────────

export function createPillars(): Pillar[] {
  const p1 = randomPos(PILLAR_SIZE, PILLAR_SIZE);
  const p2 = randomPos(PILLAR_SIZE, PILLAR_SIZE);

  return [
    {
      id: 'pillar_a',
      ...p1, w: PILLAR_SIZE, h: PILLAR_SIZE,
      state: 'warning',
      stateTimer: PILLAR_WARNING,
      warningDuration: PILLAR_WARNING,
      activeDuration: PILLAR_ACTIVE,
      hiddenDuration: PILLAR_HIDDEN,
    },
    {
      id: 'pillar_b',
      ...p2, w: PILLAR_SIZE, h: PILLAR_SIZE,
      state: 'hidden',
      stateTimer: 1.2,
      warningDuration: PILLAR_WARNING,
      activeDuration: PILLAR_ACTIVE,
      hiddenDuration: PILLAR_HIDDEN,
    },
  ];
}
