// Canvas dimensions
export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 640;
export const WALL_THICKNESS = 40;
export const TILE_SIZE = 32;

// Player
export const PLAYER_SIZE = 20;
export const PLAYER_SPEED = 200; // px/s
export const PLAYER_MAX_HP = 10;

// Game rules
export const GAME_DURATION = 15; // seconds

// Spike (normal)
export const SPIKE_SIZE = 44;
export const SPIKE_DAMAGE = 2;
export const SPIKE_OUT_DURATION = 1.2; // seconds spike is out
export const SPIKE_IN_DURATION = 0.9;  // seconds spike is retracted
export const SPIKE_COOLDOWN = 0.8;     // seconds before same spike can hit again

// Burst spike
export const BURST_SIZE = 50;
export const BURST_DAMAGE = 3;
export const BURST_OUT_DURATION = 1.0;
export const BURST_IN_DURATION = 1.6;
export const BURST_COOLDOWN = 0.8;

// Poison pool
export const POISON_DAMAGE = 1;
export const POISON_INTERVAL = 0.5; // seconds between ticks

// Healing bottle
export const HEAL_AMOUNT = 2;
export const HEAL_RESPAWN = 3.0; // seconds to respawn after pickup

// Life-saving pillar
export const PILLAR_SIZE = 44;
export const PILLAR_OUT_DURATION = 2.2;
export const PILLAR_IN_DURATION = 1.4;

// Colors
export const COLORS = {
  BG: '#14111F',
  TILE: '#1E1A2E',
  TILE_LIGHT: '#232038',
  TILE_DARK: '#17142A',
  WALL: '#2B2740',
  WALL_SHADOW: '#1E1A30',

  SPIKE: '#E5484D',
  SPIKE_DARK: '#5A252B',
  SPIKE_GLOW: '#FF8080',

  BURST: '#FF7A1A',
  BURST_DARK: '#7A3A08',
  BURST_GLOW: '#FFAA60',

  POISON: '#39FF88',
  POISON_DARK: '#1A7F4E',
  POISON_BG: '#0D3320',

  PILLAR: '#8A8F98',
  PILLAR_LIGHT: '#AAAFBB',
  PILLAR_SHADOW: '#4A4F5C',
  PILLAR_BASE: '#5A5F6C',

  HEAL: '#37E6D0',
  HEAL_LIGHT: '#A7FFF4',
  HEAL_CAP: '#1AB8A8',

  PLAYER: '#EAF2FF',
  PLAYER_OUTLINE: '#5DA9FF',
  PLAYER_HIT: '#FF4D4D',
  PLAYER_HEAL: '#39FF88',
  PLAYER_DETAIL: '#B0CFFF',

  FLOAT_DAMAGE: '#FF6060',
  FLOAT_HEAL: '#39FF88',
  FLOAT_POISON: '#39FF88',

  HUD_TEXT: '#F5F3FF',
  HUD_WEAK: '#A8A3C7',
  HUD_HP_BAR: '#E5484D',
  HUD_HP_BG: '#3A1A1C',
  HUD_TIME: '#5DA9FF',
  HUD_BEST: '#FFD700',
};
