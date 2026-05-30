export type GamePhase = 'home' | 'playing' | 'win' | 'lose';

// Axis-aligned rectangle — shared by all entities
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  // >0 = red hit flash, <0 = green heal flash, 0 = normal
  flashTimer: number;
  // maps entity id -> remaining cooldown seconds
  hitCooldowns: Map<string, number>;
}

export interface Spike {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'normal' | 'burst';
  cycleTimer: number; // position within current out+in cycle
  isOut: boolean;
  damage: number;
  outDuration: number;
  inDuration: number;
  hitCooldown: number;
}

export interface PoisonPool {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  damageTimer: number;
}

export interface HealingBottle {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
  respawnTimer: number;
  bobTimer: number; // for visual bob animation
}

export interface Pillar {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cycleTimer: number;
  isOut: boolean;
  outDuration: number;
  inDuration: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;    // remaining seconds
  maxLife: number;
}

export interface GameState {
  phase: GamePhase;
  player: Player;
  spikes: Spike[];
  poisonPools: PoisonPool[];
  healingBottles: HealingBottle[];
  pillars: Pillar[];
  floatingTexts: FloatingText[];
  timeElapsed: number;  // seconds since game start
  timeRemaining: number;
  screenShake: number;  // 0..1 intensity, decays over time
  // key set is mutated in-place (not copied) for performance
  keys: Set<string>;
}
