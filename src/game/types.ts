export type MarioForm = 'small' | 'big' | 'fire';

export type GameStatus =
  | 'title'
  | 'playing'
  | 'paused'
  | 'piping_down'
  | 'piping_up'
  | 'flagpole'
  | 'walking_to_castle'
  | 'level_cleared'
  | 'dying'
  | 'game_over';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  form: MarioForm;
  grounded: boolean;
  facing: 'left' | 'right';
  invincibleTimer: number; // Invincibility star timer
  damageCooldown: number; // Mercy invulnerability after taking damage
  runAnimFrame: number;
  runAnimTimer: number;
  isCrouching: boolean;
  isSkidding: boolean;
  growTimer: number; // Transition animation when eating mushroom / getting hit
  shrinkTimer: number;
  coyoteTimer: number;
  jumpBuffered: boolean;
  jumpHoldTimer: number;
}

export type BlockType =
  | 'ground'
  | 'brick'
  | 'mystery'
  | 'empty_block'
  | 'pipe_top_left'
  | 'pipe_top_right'
  | 'pipe_body_left'
  | 'pipe_body_right'
  | 'stone'
  | 'castle_brick'
  | 'lava';

export type BlockContent =
  | 'coin'
  | 'mushroom_or_flower'
  | 'flower'
  | 'star'
  | '1up'
  | 'multi_coin'
  | 'empty';

export interface Block {
  id: string;
  x: number;
  y: number;
  type: BlockType;
  content: BlockContent;
  coinsRemaining?: number;
  bumpOffsetY: number;
  bumpVy: number;
  isBumping: boolean;
  isSecretExitPipe?: boolean;
  isSecretEntrancePipe?: boolean;
  underground?: boolean;
}

export interface Checkpoint {
  x: number;
  y: number;
  passed: boolean;
}

export type EnemyType = 'goomba' | 'koopa' | 'fast_koopa';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  grounded: boolean;
  alive: boolean;
  squished: boolean;
  squishTimer: number;
  isShell: boolean; // Koopa inside shell
  shellMoving: boolean; // Shell sliding fast
  facing: 'left' | 'right';
  animTimer: number;
  animFrame: number;
}

export type ItemType = 'mushroom' | 'flower' | 'star' | '1up' | 'coin';

export interface Item {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  grounded: boolean;
  spawning: boolean;
  spawnTargetY: number;
  collected: boolean;
}

export interface Fireball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  bounces: number;
  alive: boolean;
  rotation: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'brick' | 'sparkle' | 'smoke' | 'firework' | 'score';
  text?: string;
  rotation?: number;
  rotSpeed?: number;
}

export interface SceneryElement {
  type: 'hill_big' | 'hill_small' | 'bush_1' | 'bush_2' | 'bush_3' | 'cloud_1' | 'cloud_2' | 'cloud_3';
  x: number;
  y: number;
}

export interface LevelConfig {
  width: number;
  height: number;
  backgroundColor: string;
  theme: 'overworld' | 'underground' | 'castle';
  blocks: Block[];
  enemies: Enemy[];
  scenery: SceneryElement[];
  checkpoints: Checkpoint[];
  flagpole: {
    x: number;
    baseY: number;
    height: number;
    flagY: number;
  };
  castle: {
    x: number;
    y: number;
    doorX: number;
  };
}

export interface GameState {
  status: GameStatus;
  score: number;
  coins: number;
  lives: number;
  timeRemaining: number;
  world: string;
  currentLevel: number;
  isUnderground: boolean;
  cameraX: number;
  fireworksCount: number;
  highScore: number;
  hasCheckpoint: boolean;
  checkpointNotification: string | null;
  checkpointNotificationTimer: number;
}
