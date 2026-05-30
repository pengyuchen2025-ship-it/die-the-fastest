import { Player, Spike, PoisonPool, HealingBottle, Pillar } from './types';
import {
  CANVAS_HEIGHT,
  PLAYER_SIZE, PLAYER_MAX_HP,
  SPIKE_SIZE, SPIKE_DAMAGE, SPIKE_OUT_DURATION, SPIKE_IN_DURATION, SPIKE_COOLDOWN,
  BURST_SIZE, BURST_DAMAGE, BURST_OUT_DURATION, BURST_IN_DURATION, BURST_COOLDOWN,
  PILLAR_SIZE, PILLAR_OUT_DURATION, PILLAR_IN_DURATION,
} from './constants';

// ─── Map layout (all values in canvas px) ─────────────────────────────────
//
//  Playable area: x 40..920, y 40..600
//
//  Player spawn:      (180, 300)
//  Spike A:           top-left   (128, 105)   — size 44×44
//  Spike B:           top-right  (728, 105)   — size 44×44
//  Burst Spike:       bot-right  (765, 462)   — size 50×50
//  Poison Pool:       bot-center (400, 458)   — 140×80
//  Pillar A:          center-top (468, 152)   blocks path to Spike B
//  Pillar B:          center-bot-right (618, 385)  blocks Poison→Burst path
//  Pillar C:          center-bot-left  (338, 385)  adds route complexity
//  Healing Bottle:    mid-center (318, 292)   — 24×30

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

export function createSpikes(): Spike[] {
  return [
    {
      id: 'spike_a',
      x: 128, y: 105, w: SPIKE_SIZE, h: SPIKE_SIZE,
      type: 'normal',
      cycleTimer: 0.45, // starts mid-out so it's immediately dangerous
      isOut: true,
      damage: SPIKE_DAMAGE,
      outDuration: SPIKE_OUT_DURATION,
      inDuration: SPIKE_IN_DURATION,
      hitCooldown: SPIKE_COOLDOWN,
    },
    {
      id: 'spike_b',
      x: 728, y: 105, w: SPIKE_SIZE, h: SPIKE_SIZE,
      type: 'normal',
      cycleTimer: 0.0, // starts retracted — player must wait or time arrival
      isOut: false,
      damage: SPIKE_DAMAGE,
      outDuration: SPIKE_OUT_DURATION,
      inDuration: SPIKE_IN_DURATION,
      hitCooldown: SPIKE_COOLDOWN,
    },
    {
      id: 'burst_spike',
      x: 765, y: 462, w: BURST_SIZE, h: BURST_SIZE,
      type: 'burst',
      cycleTimer: 0.3,
      isOut: false,
      damage: BURST_DAMAGE,
      outDuration: BURST_OUT_DURATION,
      inDuration: BURST_IN_DURATION,
      hitCooldown: BURST_COOLDOWN,
    },
  ];
}

export function createPoisonPools(): PoisonPool[] {
  return [
    {
      id: 'poison_a',
      x: 400, y: 458, w: 140, h: 80,
      damageTimer: 0,
    },
  ];
}

export function createHealingBottles(): HealingBottle[] {
  return [
    {
      id: 'heal_a',
      x: 318, y: 292, w: 24, h: 30,
      active: true,
      respawnTimer: 0,
      bobTimer: 0,
    },
  ];
}

export function createPillars(): Pillar[] {
  return [
    {
      id: 'pillar_a',
      x: 468, y: 152, w: PILLAR_SIZE, h: PILLAR_SIZE,
      cycleTimer: 0,       // starts out — blocks top-right path immediately
      isOut: true,
      outDuration: PILLAR_OUT_DURATION,
      inDuration: PILLAR_IN_DURATION,
    },
    {
      id: 'pillar_b',
      x: 618, y: 382, w: PILLAR_SIZE, h: PILLAR_SIZE,
      cycleTimer: 1.0,     // offset so pillars don't all retract together
      isOut: true,
      outDuration: PILLAR_OUT_DURATION,
      inDuration: PILLAR_IN_DURATION,
    },
    {
      id: 'pillar_c',
      x: 338, y: 382, w: PILLAR_SIZE, h: PILLAR_SIZE,
      cycleTimer: 0.7,
      isOut: false,
      outDuration: PILLAR_OUT_DURATION,
      inDuration: PILLAR_IN_DURATION,
    },
  ];
}
