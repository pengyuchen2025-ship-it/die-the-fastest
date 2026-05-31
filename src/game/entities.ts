import { Player, Spike, PoisonPool, LavaPool, HealingBottle, Pillar } from './types';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, WALL_THICKNESS,
  PLAYER_SIZE, PLAYER_MAX_HP,
  SPIKE_SIZE, SPIKE_DAMAGE, SPIKE_WARNING, SPIKE_ACTIVE, SPIKE_HIDDEN, SPIKE_COOLDOWN,
  BURST_SIZE, BURST_DAMAGE, BURST_WARNING, BURST_ACTIVE, BURST_HIDDEN, BURST_COOLDOWN,
  POISON_W, POISON_H, POISON_WARNING, POISON_ACTIVE, POISON_HIDDEN,
  LAVA_W, LAVA_H, LAVA_WARNING, LAVA_ACTIVE, LAVA_HIDDEN,
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
  return [
    {
      id: 'spike_a',
      ...randomPos(SPIKE_SIZE, SPIKE_SIZE), w: SPIKE_SIZE, h: SPIKE_SIZE,
      type: 'normal',
      state: 'warning',
      stateTimer: SPIKE_WARNING,
      warningDuration: SPIKE_WARNING,
      activeDuration: SPIKE_ACTIVE,
      hiddenDuration: SPIKE_HIDDEN,
      damage: SPIKE_DAMAGE,
      hitCooldown: SPIKE_COOLDOWN,
    },
    {
      id: 'spike_b',
      ...randomPos(SPIKE_SIZE, SPIKE_SIZE), w: SPIKE_SIZE, h: SPIKE_SIZE,
      type: 'normal',
      state: 'hidden',
      stateTimer: 0.7,
      warningDuration: SPIKE_WARNING,
      activeDuration: SPIKE_ACTIVE,
      hiddenDuration: SPIKE_HIDDEN,
      damage: SPIKE_DAMAGE,
      hitCooldown: SPIKE_COOLDOWN,
    },
    {
      id: 'spike_c',
      ...randomPos(SPIKE_SIZE, SPIKE_SIZE), w: SPIKE_SIZE, h: SPIKE_SIZE,
      type: 'normal',
      state: 'hidden',
      stateTimer: 1.5,           // staggered so it doesn't sync with spike_b
      warningDuration: SPIKE_WARNING,
      activeDuration: SPIKE_ACTIVE,
      hiddenDuration: SPIKE_HIDDEN,
      damage: SPIKE_DAMAGE,
      hitCooldown: SPIKE_COOLDOWN,
    },
    {
      id: 'burst_a',
      ...randomPos(BURST_SIZE, BURST_SIZE), w: BURST_SIZE, h: BURST_SIZE,
      type: 'burst',
      state: 'hidden',
      stateTimer: 1.4,
      warningDuration: BURST_WARNING,
      activeDuration: BURST_ACTIVE,
      hiddenDuration: BURST_HIDDEN,
      damage: BURST_DAMAGE,
      hitCooldown: BURST_COOLDOWN,
    },
    {
      id: 'burst_b',
      ...randomPos(BURST_SIZE, BURST_SIZE), w: BURST_SIZE, h: BURST_SIZE,
      type: 'burst',
      state: 'hidden',
      stateTimer: 2.2,           // offset from burst_a
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
  return [
    {
      id: 'poison_a',
      ...randomPos(POISON_W, POISON_H), w: POISON_W, h: POISON_H,
      state: 'hidden',
      stateTimer: 1.0,
      warningDuration: POISON_WARNING,
      activeDuration: POISON_ACTIVE,
      hiddenDuration: POISON_HIDDEN,
      damageTimer: 0,
    },
    {
      id: 'poison_b',
      ...randomPos(POISON_W, POISON_H), w: POISON_W, h: POISON_H,
      state: 'hidden',
      stateTimer: 2.5,           // offset so both pools aren't active at the same time
      warningDuration: POISON_WARNING,
      activeDuration: POISON_ACTIVE,
      hiddenDuration: POISON_HIDDEN,
      damageTimer: 0,
    },
  ];
}

// ─── Lava pools ───────────────────────────────────────────────────────────

export function createLavaPools(): LavaPool[] {
  return [
    {
      id: 'lava_a',
      ...randomPos(LAVA_W, LAVA_H), w: LAVA_W, h: LAVA_H,
      state: 'hidden',
      stateTimer: 1.6,
      warningDuration: LAVA_WARNING,
      activeDuration: LAVA_ACTIVE,
      hiddenDuration: LAVA_HIDDEN,
      damageTimer: 0,
    },
    {
      id: 'lava_b',
      ...randomPos(LAVA_W, LAVA_H), w: LAVA_W, h: LAVA_H,
      state: 'hidden',
      stateTimer: 3.0,
      warningDuration: LAVA_WARNING,
      activeDuration: LAVA_ACTIVE,
      hiddenDuration: LAVA_HIDDEN,
      damageTimer: 0,
    },
  ];
}

// ─── Healing bottles ──────────────────────────────────────────────────────

export function createHealingBottles(): HealingBottle[] {
  return [
    {
      id: 'heal_a',
      ...randomPos(HEAL_W, HEAL_H), w: HEAL_W, h: HEAL_H,
      state: 'hidden',
      stateTimer: 1.8,
      warningDuration: HEAL_WARNING,
      activeDuration: HEAL_ACTIVE,
      hiddenDuration: HEAL_HIDDEN,
      bobTimer: 0,
    },
    {
      id: 'heal_b',
      ...randomPos(HEAL_W, HEAL_H), w: HEAL_W, h: HEAL_H,
      state: 'hidden',
      stateTimer: 3.2,           // offset from heal_a
      warningDuration: HEAL_WARNING,
      activeDuration: HEAL_ACTIVE,
      hiddenDuration: HEAL_HIDDEN,
      bobTimer: 0,
    },
  ];
}

// ─── Pillars ──────────────────────────────────────────────────────────────

export function createPillars(): Pillar[] {
  return [
    {
      id: 'pillar_a',
      ...randomPos(PILLAR_SIZE, PILLAR_SIZE), w: PILLAR_SIZE, h: PILLAR_SIZE,
      state: 'warning',
      stateTimer: PILLAR_WARNING,
      warningDuration: PILLAR_WARNING,
      activeDuration: PILLAR_ACTIVE,
      hiddenDuration: PILLAR_HIDDEN,
    },
    {
      id: 'pillar_b',
      ...randomPos(PILLAR_SIZE, PILLAR_SIZE), w: PILLAR_SIZE, h: PILLAR_SIZE,
      state: 'hidden',
      stateTimer: 1.2,
      warningDuration: PILLAR_WARNING,
      activeDuration: PILLAR_ACTIVE,
      hiddenDuration: PILLAR_HIDDEN,
    },
    {
      id: 'pillar_c',
      ...randomPos(PILLAR_SIZE, PILLAR_SIZE), w: PILLAR_SIZE, h: PILLAR_SIZE,
      state: 'hidden',
      stateTimer: 2.0,           // offset so all three pillars cycle differently
      warningDuration: PILLAR_WARNING,
      activeDuration: PILLAR_ACTIVE,
      hiddenDuration: PILLAR_HIDDEN,
    },
  ];
}
