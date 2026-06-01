export type GamePhase = 'home' | 'playing' | 'win' | 'lose' | 'rule_break_anim' | 'rule_break';

// warning = 出现前预警; active = 激活可交互; hidden = 消失等待
export type EntityState = 'warning' | 'active' | 'hidden';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Base for all randomly-cycling map entities
export interface CyclingEntity {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  state: EntityState;
  stateTimer: number;     // counts down to 0, then transitions
  warningDuration: number;
  activeDuration: number;
  hiddenDuration: number;
}

export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  flashTimer: number;       // >0 red hit flash, <0 green heal flash
  hitCooldowns: Map<string, number>;
}

export interface Spike extends CyclingEntity {
  type: 'normal' | 'burst';
  damage: number;
  hitCooldown: number;
}

export interface PoisonPool extends CyclingEntity {
  damageTimer: number;
}

export interface LavaPool extends CyclingEntity {
  damageTimer: number;
}

export interface HealingBottle extends CyclingEntity {
  bobTimer: number;
}

export interface Pillar extends CyclingEntity {}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface GameState {
  phase: GamePhase;
  player: Player;
  spikes: Spike[];
  poisonPools: PoisonPool[];
  lavaPools: LavaPool[];
  healingBottles: HealingBottle[];
  pillars: Pillar[];
  floatingTexts: FloatingText[];
  timeElapsed: number;
  timeRemaining: number;
  screenShake: number;
  keys: Set<string>;
  ruleBreakTimer: number; // drives the glitch animation sequence
}
