export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 640;
export const WALL_THICKNESS = 40;
export const TILE_SIZE = 32;

export const PLAYER_SIZE = 20;
export const PLAYER_SPEED = 200;
export const PLAYER_MAX_HP = 10;

export const GAME_DURATION = 15;

// Spike (normal): warning → active → hidden
export const SPIKE_SIZE = 44;
export const SPIKE_DAMAGE = 2;
export const SPIKE_WARNING  = 0.8;
export const SPIKE_ACTIVE   = 1.2;
export const SPIKE_HIDDEN   = 1.0;
export const SPIKE_COOLDOWN = 0.8;

// Burst spike
export const BURST_SIZE     = 50;
export const BURST_DAMAGE   = 3;
export const BURST_WARNING  = 0.7;
export const BURST_ACTIVE   = 1.0;
export const BURST_HIDDEN   = 1.3;
export const BURST_COOLDOWN = 0.8;

// Heal pool (heals player — bad for the player's goal)
export const POISON_DAMAGE   = 1;
export const POISON_INTERVAL = 1.0;
export const POISON_W        = 120;
export const POISON_H        = 80;
export const POISON_WARNING  = 0.9;
export const POISON_ACTIVE   = 2.5;
export const POISON_HIDDEN   = 0.8;

// Healing bottle (enemy - heals player, bad)
export const HEAL_AMOUNT  = 2;
export const HEAL_W       = 24;
export const HEAL_H       = 30;
export const HEAL_WARNING = 0.9;
export const HEAL_ACTIVE  = 1.8;
export const HEAL_HIDDEN  = 1.2;

// Life-saving pillar (blocks path)
export const PILLAR_SIZE    = 44;
export const PILLAR_WARNING = 0.6;
export const PILLAR_ACTIVE  = 2.5;
export const PILLAR_HIDDEN  = 0.8;

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

  HUD_TEXT: '#F5F3FF',
  HUD_WEAK: '#A8A3C7',
  HUD_HP_BAR: '#E5484D',
  HUD_HP_BG: '#3A1A1C',
  HUD_TIME: '#5DA9FF',
  HUD_BEST: '#FFD700',
};
