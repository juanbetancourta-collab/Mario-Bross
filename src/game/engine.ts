import { sound } from './audio';
import { buildUndergroundRoom, buildWorld11, buildWorld12, GROUND_Y, LEVEL_HEIGHT, TILE_SIZE } from './levelData';
import { ParticleSystem } from './particles';
import {
  Block,
  Enemy,
  Fireball,
  GameState,
  Item,
  LevelConfig,
  Player,
} from './types';

export class GameEngine {
  public player: Player;
  public state: GameState;
  public level: LevelConfig;
  public particles: ParticleSystem;
  public items: Item[] = [];
  public fireballs: Fireball[] = [];

  // Active checkpoint for respawning
  public currentCheckpoint: { x: number; y: number } | null = null;

  // Overworld backup when visiting underground bonus room
  private overworldLevel: LevelConfig | null = null;
  private overworldItems: Item[] = [];
  private returnPipeX: number = 59 * TILE_SIZE;

  // Input states
  public keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    run: false,
    fire: false,
  };

  private prevJumpKey = false;
  private prevFireKey = false;
  private gameTime = 0;
  private flagTargetY = 0;
  private castleTargetX = 0;

  constructor() {
    this.particles = new ParticleSystem();
    this.level = buildWorld11();
    this.player = this.createDefaultPlayer();
    this.state = this.createDefaultState();
  }

  private createDefaultPlayer(): Player {
    return {
      x: 40,
      y: GROUND_Y - 32,
      vx: 0,
      vy: 0,
      width: 24,
      height: 28,
      form: 'small',
      grounded: true,
      facing: 'right',
      invincibleTimer: 0,
      damageCooldown: 0,
      runAnimFrame: 0,
      runAnimTimer: 0,
      isCrouching: false,
      isSkidding: false,
      growTimer: 0,
      shrinkTimer: 0,
      coyoteTimer: 0,
      jumpBuffered: false,
      jumpHoldTimer: 0,
    };
  }

  private createDefaultState(): GameState {
    const savedHighScore = localStorage.getItem('mario_high_score');
    return {
      status: 'title',
      score: 0,
      coins: 0,
      lives: 3,
      timeRemaining: 400,
      world: '1-1',
      currentLevel: 1,
      isUnderground: false,
      cameraX: 0,
      fireworksCount: 0,
      highScore: savedHighScore ? parseInt(savedHighScore, 10) : 10000,
      hasCheckpoint: false,
      checkpointNotification: null,
      checkpointNotificationTimer: 0,
    };
  }

  public startGame() {
    this.state.currentLevel = 1;
    this.state.world = '1-1';
    this.currentCheckpoint = null;
    this.resetLevel(true);
    this.state.status = 'playing';
    sound.playMusic('overworld');
  }

  public restartGame() {
    this.state = this.createDefaultState();
    this.currentCheckpoint = null;
    this.resetLevel(true);
    this.state.status = 'playing';
    sound.playMusic('overworld');
  }

  public goToTitle() {
    this.state = this.createDefaultState();
    this.state.status = 'title';
    this.currentCheckpoint = null;
    this.resetLevel(true);
    sound.stopMusic();
  }

  public startLevel(levelNum: 1 | 2) {
    this.state.currentLevel = levelNum;
    this.state.world = levelNum === 1 ? '1-1' : '1-2';
    this.currentCheckpoint = null;
    this.state.hasCheckpoint = false;
    this.resetLevel(false);
    this.state.status = 'playing';
    sound.playMusic(levelNum === 2 ? 'underground' : 'overworld');
  }

  public advanceToNextLevel() {
    if (this.state.currentLevel === 1) {
      this.startLevel(2);
    } else {
      // Completed all levels!
      this.state.status = 'level_cleared';
    }
  }

  public resetLevel(fullReset = false) {
    if (fullReset) {
      this.state.score = 0;
      this.state.coins = 0;
      this.state.lives = 3;
      this.currentCheckpoint = null;
      this.state.hasCheckpoint = false;
    }
    this.state.timeRemaining = 400;
    this.state.isUnderground = false;
    this.state.fireworksCount = 0;
    this.state.checkpointNotification = null;
    this.state.checkpointNotificationTimer = 0;

    // Load appropriate level
    if (this.state.currentLevel === 2) {
      this.level = buildWorld12();
      this.state.world = '1-2';
    } else {
      this.level = buildWorld11();
      this.state.world = '1-1';
    }

    this.player = this.createDefaultPlayer();
    this.items = [];
    this.fireballs = [];
    this.particles.clear();
    this.overworldLevel = null;

    // Checkpoint respawn positioning: Mario respawns directly on the ground!
    if (!fullReset && this.currentCheckpoint) {
      this.player.x = this.currentCheckpoint.x;
      this.player.y = GROUND_Y - this.player.height;
      this.player.grounded = true;
      this.player.vy = 0;
      this.state.cameraX = Math.max(0, this.currentCheckpoint.x - 320);
      // Mark checkpoint as passed in new level instance
      for (const cp of this.level.checkpoints) {
        if (Math.abs(cp.x - this.currentCheckpoint.x) < 50) {
          cp.passed = true;
        }
      }
    } else {
      this.state.cameraX = 0;
    }
  }

  public update(dt: number) {
    this.gameTime += dt;

    // Checkpoint notification banner timer
    if (this.state.checkpointNotificationTimer > 0) {
      this.state.checkpointNotificationTimer -= dt;
      if (this.state.checkpointNotificationTimer <= 0) {
        this.state.checkpointNotification = null;
      }
    }

    if (this.state.status === 'playing') {
      this.updateTimer(dt);
      this.handlePlayerInput(dt);
      this.updatePhysics(dt);
      this.updateBlocks(dt);
      this.updateItems(dt);
      this.updateFireballs(dt);
      this.updateEnemies(dt);
      this.updateCheckpoints(dt);
      this.updateCamera();
      this.checkPitfall();
    } else if (this.state.status === 'piping_down') {
      this.updatePipingDown(dt);
    } else if (this.state.status === 'piping_up') {
      this.updatePipingUp(dt);
    } else if (this.state.status === 'flagpole') {
      this.updateFlagpole(dt);
    } else if (this.state.status === 'walking_to_castle') {
      this.updateWalkingToCastle(dt);
    } else if (this.state.status === 'level_cleared') {
      this.updateLevelCleared(dt);
    } else if (this.state.status === 'dying') {
      this.updateDying(dt);
    }

    this.particles.update(dt);
    this.prevJumpKey = this.keys.jump;
    this.prevFireKey = this.keys.fire;
  }

  private updateTimer(dt: number) {
    this.state.timeRemaining -= dt * 2.5;
    if (this.state.timeRemaining <= 0) {
      this.state.timeRemaining = 0;
      this.killPlayer();
    }
  }

  private updateCheckpoints(dt: number) {
    const p = this.player;
    if (this.state.isUnderground) return;

    for (const cp of this.level.checkpoints) {
      if (!cp.passed && p.x >= cp.x) {
        cp.passed = true;
        this.currentCheckpoint = { x: cp.x, y: cp.y };
        this.state.hasCheckpoint = true;
        this.state.checkpointNotification = '🚩 ¡CHECKPOINT ALCANZADO!';
        this.state.checkpointNotificationTimer = 3.5;
        sound.playPowerUpAppear();
        this.particles.spawnSparkles(cp.x + 8, cp.y - 20, '#38BDF8');
        this.addScore(500, cp.x, cp.y - 30);
      }
    }
  }

  private handlePlayerInput(dt: number) {
    const p = this.player;

    // Crouch handling: Big/Fire Mario ducks down, Small Mario ducks
    const normalHeight = p.form === 'small' ? 28 : 36;
    const crouchHeight = p.form === 'small' ? 20 : 22;

    if (this.keys.down) {
      p.isCrouching = true;
      p.height = crouchHeight;
    } else {
      if (p.isCrouching) {
        p.isCrouching = false;
        p.height = normalHeight;
      }
    }

    // Secret Pipe Entrance check (Enterable 4th pipe on surface of World 1-1)
    if (this.keys.down && !this.state.isUnderground && this.state.currentLevel === 1) {
      const entranceBlock = this.level.blocks.find((b) => b.isSecretEntrancePipe);
      if (entranceBlock) {
        const pipeLeft = entranceBlock.x - 8;
        const pipeRight = entranceBlock.x + TILE_SIZE * 2 + 8;
        const marioMidX = p.x + p.width / 2;
        const marioFeet = p.y + p.height;
        const onPipeX = marioMidX >= pipeLeft && marioMidX <= pipeRight;
        const onPipeY = Math.abs(marioFeet - entranceBlock.y) <= 14 || (p.grounded && Math.abs(p.y - entranceBlock.y) <= 40);

        if (onPipeX && onPipeY) {
          p.x = entranceBlock.x + TILE_SIZE - p.width / 2;
          this.enterUnderground();
          return;
        }
      }
    }

    // Secret Underground Exit Pipe check
    if (this.state.isUnderground && (this.keys.right || this.keys.down)) {
      const exitBlock = this.level.blocks.find(
        (b) =>
          b.isSecretExitPipe &&
          Math.abs(p.x + p.width - b.x) < 28 &&
          Math.abs(p.y + p.height - (b.y + TILE_SIZE * 2)) < 45
      );
      if (exitBlock) {
        this.exitUnderground();
        return;
      }
    }

    // Horizontal Movement
    const maxSpeed = this.keys.run ? 4.6 : 2.9;
    const accel = p.grounded ? 0.36 : 0.22;
    const friction = p.grounded ? 0.82 : 0.94;

    if (!p.isCrouching) {
      if (this.keys.left) {
        if (p.vx > 0.8) {
          p.isSkidding = true;
          this.particles.spawnDust(p.x + p.width / 2, p.y + p.height);
        } else {
          p.isSkidding = false;
        }
        p.vx -= accel;
        p.facing = 'left';
      } else if (this.keys.right) {
        if (p.vx < -0.8) {
          p.isSkidding = true;
          this.particles.spawnDust(p.x + p.width / 2, p.y + p.height);
        } else {
          p.isSkidding = false;
        }
        p.vx += accel;
        p.facing = 'right';
      } else {
        p.isSkidding = false;
        p.vx *= friction;
        if (Math.abs(p.vx) < 0.05) p.vx = 0;
      }
    } else {
      p.vx *= 0.72; // Sliding crouch
    }

    // Clamp speed
    p.vx = Math.max(-maxSpeed, Math.min(maxSpeed, p.vx));

    // Jump Buffering and Coyote Time
    if (p.grounded) {
      p.coyoteTimer = 0.14;
    } else {
      p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
    }

    const jumpJustPressed = this.keys.jump && !this.prevJumpKey;
    if (jumpJustPressed) {
      p.jumpBuffered = true;
      window.setTimeout(() => {
        p.jumpBuffered = false;
      }, 160);
    }

    // Jump Execution
    if (p.jumpBuffered && (p.grounded || p.coyoteTimer > 0)) {
      p.vy = -10.3;
      p.grounded = false;
      p.coyoteTimer = 0;
      p.jumpBuffered = false;
      p.jumpHoldTimer = 0.25;

      if (p.form === 'small') {
        sound.playJumpSmall();
      } else {
        sound.playJumpSuper();
      }
      this.particles.spawnDust(p.x + p.width / 2, p.y + p.height);
    }

    // Variable jump height: Holding jump sustains lift
    if (this.keys.jump && p.jumpHoldTimer > 0) {
      p.vy -= 0.35;
      p.jumpHoldTimer -= dt;
    } else {
      p.jumpHoldTimer = 0;
    }

    // Shooting Fireball with F / Run
    const fireJustPressed = (this.keys.fire && !this.prevFireKey) || (this.keys.run && !this.prevFireKey && this.keys.fire);
    if (fireJustPressed) {
      this.triggerFire();
    }

    // Running animation
    if (p.grounded && Math.abs(p.vx) > 0.2) {
      p.runAnimTimer += Math.abs(p.vx) * dt * 3.5;
      p.runAnimFrame = Math.floor(p.runAnimTimer) % 3;
    } else {
      p.runAnimFrame = 0;
    }

    // Timers
    if (p.damageCooldown > 0) {
      p.damageCooldown = Math.max(0, p.damageCooldown - dt);
    }
    if (p.invincibleTimer > 0) {
      p.invincibleTimer = Math.max(0, p.invincibleTimer - dt);
      if (p.invincibleTimer === 0) {
        sound.playMusic(this.state.currentLevel === 2 ? 'underground' : 'overworld');
      }
    }
  }

  public triggerFire() {
    const p = this.player;
    if (this.state.status !== 'playing') return;

    // Mario can ONLY shoot fireballs if he has collected a Fire Flower (form === 'fire')
    if (p.form !== 'fire') {
      return;
    }

    if (this.fireballs.length < 4) {
      sound.playFireball();
      const spawnX = p.facing === 'right' ? p.x + p.width + 4 : p.x - 14;
      const spawnY = p.y + p.height * 0.35;
      this.fireballs.push({
        id: Math.random().toString(),
        x: spawnX,
        y: spawnY,
        vx: p.facing === 'right' ? 7.2 : -7.2,
        vy: 1.5,
        width: 12,
        height: 12,
        bounces: 0,
        alive: true,
        rotation: 0,
      });
      this.particles.spawnSparkles(spawnX, spawnY, '#FDE047');
    }
  }

  private shootFireball() {
    this.triggerFire();
  }

  private updatePhysics(dt: number) {
    const p = this.player;

    // Apply gravity
    p.vy += 0.55 * dt * 60;
    if (p.vy > 12) p.vy = 12;

    // Move X
    p.x += p.vx * dt * 60;

    // Prevent moving back past level start (Mario can freely backtrack all the way to 0!)
    const minX = this.state.isUnderground ? 32 : 0;
    if (p.x < minX) {
      p.x = minX;
      p.vx = 0;
    }

    // Horizontal block collisions
    for (const b of this.level.blocks) {
      if (this.checkCollision(p, b)) {
        if (b.type === 'lava') {
          this.killPlayer();
          return;
        }
        if (p.vx > 0) {
          p.x = b.x - p.width;
          p.vx = 0;
        } else if (p.vx < 0) {
          p.x = b.x + TILE_SIZE;
          p.vx = 0;
        }
      }
    }

    // Move Y
    p.y += p.vy * dt * 60;
    p.grounded = false;

    // Vertical block collisions
    for (const b of this.level.blocks) {
      if (this.checkCollision(p, b)) {
        if (b.type === 'lava') {
          this.killPlayer();
          return;
        }
        if (p.vy > 0) {
          // Landing on top
          p.y = b.y - p.height;
          p.vy = 0;
          p.grounded = true;
        } else if (p.vy < 0) {
          // Hitting block from bottom!
          p.y = b.y + TILE_SIZE;
          p.vy = 0;
          this.hitBlock(b);
        }
      }
    }

    // Check Flagpole Collision (Level completion!)
    if (!this.state.isUnderground && this.state.status === 'playing') {
      const pole = this.level.flagpole;
      if (
        p.x + p.width >= pole.x &&
        p.x <= pole.x + 10 &&
        p.y + p.height >= pole.baseY - pole.height &&
        p.y <= pole.baseY
      ) {
        this.startFlagpoleSequence();
      }
    }
  }

  private hitBlock(b: Block) {
    const p = this.player;

    if (b.type === 'mystery') {
      b.isBumping = true;
      b.bumpVy = -4.5;
      b.type = 'empty_block';

      if (b.content === 'coin') {
        sound.playCoin();
        this.addScore(200, b.x, b.y - 12);
        this.state.coins++;
        this.particles.spawnSparkles(b.x + TILE_SIZE / 2, b.y, '#FBBF24');
      } else if (b.content === 'mushroom_or_flower') {
        sound.playPowerUpAppear();
        const itemType = p.form === 'small' ? 'mushroom' : 'flower';
        this.spawnItem(b.x, b.y - TILE_SIZE, itemType);
      } else if (b.content === 'flower') {
        sound.playPowerUpAppear();
        this.spawnItem(b.x, b.y - TILE_SIZE, 'flower');
      } else if (b.content === 'star') {
        sound.playPowerUpAppear();
        this.spawnItem(b.x, b.y - TILE_SIZE, 'star');
      } else if (b.content === '1up') {
        sound.playPowerUpAppear();
        this.spawnItem(b.x, b.y - TILE_SIZE, '1up');
      }
    } else if (b.type === 'brick') {
      if (b.content === 'coin' || b.content === 'multi_coin') {
        b.isBumping = true;
        b.bumpVy = -3.5;
        sound.playCoin();
        this.addScore(200, b.x, b.y - 12);
        this.state.coins++;
        this.particles.spawnSparkles(b.x + TILE_SIZE / 2, b.y, '#FBBF24');
        if (b.coinsRemaining) {
          b.coinsRemaining--;
          if (b.coinsRemaining <= 0) {
            b.type = 'empty_block';
          }
        }
      } else if (p.form === 'small') {
        b.isBumping = true;
        b.bumpVy = -3.5;
        sound.playBump();
      } else {
        sound.playBreakBlock();
        this.particles.spawnBrickDebris(b.x + TILE_SIZE / 2, b.y + TILE_SIZE / 2, this.state.isUnderground);
        this.addScore(50, b.x, b.y);

        const idx = this.level.blocks.indexOf(b);
        if (idx !== -1) {
          this.level.blocks.splice(idx, 1);
        }
      }
    }
  }

  private spawnItem(x: number, y: number, type: Item['type']) {
    this.items.push({
      id: Math.random().toString(),
      type,
      x: x + 4,
      y: y + TILE_SIZE,
      vx: type === 'flower' ? 0 : 1.6,
      vy: 0,
      width: 24,
      height: 24,
      grounded: true,
      spawning: true,
      spawnTargetY: y,
      collected: false,
    });
  }

  private updateBlocks(dt: number) {
    for (const b of this.level.blocks) {
      if (b.isBumping) {
        b.bumpOffsetY += b.bumpVy * dt * 60;
        b.bumpVy += 0.8 * dt * 60;
        if (b.bumpOffsetY >= 0) {
          b.bumpOffsetY = 0;
          b.bumpVy = 0;
          b.isBumping = false;
        }
      }
    }
  }

  private updateItems(dt: number) {
    const p = this.player;

    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];

      if (it.spawning) {
        it.y -= 1.0 * dt * 60;
        if (it.y <= it.spawnTargetY) {
          it.y = it.spawnTargetY;
          it.spawning = false;
        }
        continue;
      }

      if (it.type !== 'flower') {
        it.vy += 0.5 * dt * 60;
        it.x += it.vx * dt * 60;

        for (const b of this.level.blocks) {
          if (this.checkCollision(it, b)) {
            if (it.vx > 0) {
              it.vx = -Math.abs(it.vx);
            } else if (it.vx < 0) {
              it.vx = Math.abs(it.vx);
            }
          }
        }

        it.y += it.vy * dt * 60;
        for (const b of this.level.blocks) {
          if (this.checkCollision(it, b)) {
            if (it.vy > 0) {
              it.y = b.y - it.height;
              it.vy = it.type === 'star' ? -6.5 : 0;
            }
          }
        }
      }

      if (this.checkCollision(p, it)) {
        it.collected = true;
        this.items.splice(i, 1);

        if (it.type === 'mushroom') {
          sound.playPowerUp();
          this.addScore(1000, it.x, it.y);
          if (p.form === 'small') {
            p.form = 'big';
            p.height = 36;
            p.y -= 8;
          }
        } else if (it.type === 'flower') {
          sound.playPowerUp();
          this.addScore(1000, it.x, it.y);
          p.form = 'fire';
          p.height = 36;
          this.particles.spawnSparkles(p.x + p.width / 2, p.y + p.height / 2, '#F97316');
          this.state.checkpointNotification = '🔥 ¡MARIO DE FUEGO! Pulsa [F] para lanzar fuego';
          this.state.checkpointNotificationTimer = 3.5;
        } else if (it.type === 'star') {
          sound.playPowerUp();
          this.addScore(1000, it.x, it.y);
          p.invincibleTimer = 12;
          sound.playMusic('star');
        } else if (it.type === '1up') {
          sound.playPowerUp();
          this.state.lives++;
          this.particles.spawnScoreText(it.x, it.y, '1UP');
        }
      }
    }
  }

  private updateFireballs(dt: number) {
    for (let i = this.fireballs.length - 1; i >= 0; i--) {
      const fb = this.fireballs[i];
      fb.vy += 0.55 * dt * 60;
      fb.x += fb.vx * dt * 60;
      fb.rotation += 0.25 * dt * 60;

      for (const b of this.level.blocks) {
        if (this.checkCollision(fb, b)) {
          fb.alive = false;
          this.particles.spawnSparkles(fb.x, fb.y, '#F97316');
          break;
        }
      }

      fb.y += fb.vy * dt * 60;
      for (const b of this.level.blocks) {
        if (this.checkCollision(fb, b)) {
          if (fb.vy > 0) {
            fb.y = b.y - fb.height;
            fb.vy = -4.8;
            fb.bounces++;
            if (fb.bounces > 6) fb.alive = false;
          }
        }
      }

      for (const en of this.level.enemies) {
        if (en.alive && this.checkCollision(fb, en)) {
          fb.alive = false;
          this.defeatEnemy(en, true);
          this.particles.spawnSparkles(en.x, en.y, '#F97316');
          break;
        }
      }

      if (!fb.alive || fb.y > LEVEL_HEIGHT) {
        this.fireballs.splice(i, 1);
      }
    }
  }

  private updateEnemies(dt: number) {
    const p = this.player;

    for (let i = this.level.enemies.length - 1; i >= 0; i--) {
      const en = this.level.enemies[i];

      if (!en.alive) {
        if (en.squished) {
          en.squishTimer += dt;
          if (en.squishTimer > 0.6) {
            this.level.enemies.splice(i, 1);
          }
        }
        continue;
      }

      // Check pitfall/void: if enemy plunged into the abyss, clean it up
      if (en.y > LEVEL_HEIGHT + 60) {
        en.alive = false;
        this.level.enemies.splice(i, 1);
        continue;
      }

      // Only update enemies within active view range
      if (en.x > this.state.cameraX + 900 || en.x < this.state.cameraX - 150) {
        continue;
      }

      en.animTimer += dt * 5;
      en.animFrame = Math.floor(en.animTimer) % 2;

      // 1. Horizontal Movement & Solid Wall Collisions (Pipes, Bricks, Stones)
      en.x += en.vx * dt * 60;

      for (const b of this.level.blocks) {
        // Lava is not a solid wall!
        if (b.type === 'lava') continue;

        if (this.checkCollision(en, b)) {
          if (en.vx > 0) {
            // Snaps flush to the left of the wall and reverses direction
            en.x = b.x - en.width;
            en.vx = -Math.abs(en.vx);
            en.facing = 'left';
          } else if (en.vx < 0) {
            // Snaps flush to the right of the wall and reverses direction
            en.x = b.x + TILE_SIZE;
            en.vx = Math.abs(en.vx);
            en.facing = 'right';
          }
        }
      }

      // 2. Enemy vs Enemy bounce
      for (let j = 0; j < this.level.enemies.length; j++) {
        const other = this.level.enemies[j];
        if (other !== en && other.alive && !other.isShell && !en.isShell) {
          if (this.checkCollision(en, other)) {
            if (en.vx > 0 && en.x < other.x) {
              en.x = other.x - en.width;
              en.vx = -Math.abs(en.vx);
              en.facing = 'left';
              other.vx = Math.abs(other.vx);
              other.facing = 'right';
            } else if (en.vx < 0 && en.x > other.x) {
              en.x = other.x + other.width;
              en.vx = Math.abs(en.vx);
              en.facing = 'right';
              other.vx = -Math.abs(other.vx);
              other.facing = 'left';
            }
          }
        }
      }

      // 3. Vertical Gravity & Floor / Lava / Void Collisions
      en.vy += 0.55 * dt * 60;
      if (en.vy > 12) en.vy = 12;
      en.y += en.vy * dt * 60;
      en.grounded = false;

      for (const b of this.level.blocks) {
        if (this.checkCollision(en, b)) {
          // If enemy touches lava, it falls in, burns with sparkles and dies!
          if (b.type === 'lava') {
            en.alive = false;
            this.particles.spawnSparkles(en.x + en.width / 2, en.y + en.height / 2, '#F97316');
            this.particles.spawnSparkles(en.x + en.width / 2, en.y + en.height / 2, '#FEF08A');
            sound.playKick();
            break;
          }

          // Solid floor landing: only when landing on top from above
          if (en.vy > 0 && en.y + en.height - en.vy * dt * 60 <= b.y + 6) {
            en.y = b.y - en.height;
            en.vy = 0;
            en.grounded = true;
          }
        }
      }

      // If enemy was incinerated by lava, skip to next
      if (!en.alive) continue;

      // 4. Moving Shell mechanics
      if (en.isShell && en.shellMoving) {
        for (const other of this.level.enemies) {
          if (other !== en && other.alive && this.checkCollision(en, other)) {
            this.defeatEnemy(other, true);
            this.addScore(500, other.x, other.y);
          }
        }
      }

      // 5. Mario vs Enemy interaction
      if (this.checkCollision(p, en)) {
        if (p.invincibleTimer > 0) {
          this.defeatEnemy(en, true);
          this.addScore(1000, en.x, en.y);
        } else {
          const marioBottom = p.y + p.height;
          const enemyMid = en.y + en.height * 0.55;
          const isDescending = p.vy >= -1.0;
          const isAboveEnemy = marioBottom <= enemyMid || (marioBottom - p.vy) <= en.y + 14;

          if (isDescending && isAboveEnemy) {
            this.stompEnemy(en);
          } else if (en.isShell && !en.shellMoving) {
            sound.playKick();
            en.shellMoving = true;
            const kickRight = p.x + p.width / 2 < en.x + en.width / 2;
            en.vx = kickRight ? 7.5 : -7.5;
            p.damageCooldown = 0.2;
            this.addScore(400, en.x, en.y);
          } else {
            if (p.damageCooldown === 0) {
              this.damagePlayer();
            }
          }
        }
      }
    }
  }

  private stompEnemy(en: Enemy) {
    const p = this.player;

    p.y = en.y - p.height;
    p.vy = this.keys.jump ? -9.5 : -6.5;
    p.damageCooldown = 0.25;

    if (en.type === 'goomba') {
      sound.playStomp();
      en.squished = true;
      en.alive = false;
      this.addScore(100, en.x, en.y);
    } else if (en.type === 'koopa' || en.type === 'fast_koopa') {
      sound.playStomp();
      if (!en.isShell) {
        en.isShell = true;
        en.vx = 0;
        en.height = 20;
        this.addScore(100, en.x, en.y);
      } else if (en.shellMoving) {
        en.shellMoving = false;
        en.vx = 0;
        this.addScore(100, en.x, en.y);
      }
    }
  }

  private defeatEnemy(en: Enemy, flip = false) {
    sound.playKick();
    en.alive = false;
    if (flip) {
      en.vy = -6;
      en.vx = (Math.random() - 0.5) * 4;
    }
  }

  private damagePlayer() {
    const p = this.player;

    if (p.form === 'fire') {
      sound.playPowerDown();
      p.form = 'big';
      p.damageCooldown = 2.0;
    } else if (p.form === 'big') {
      sound.playPowerDown();
      p.form = 'small';
      p.height = 28;
      p.damageCooldown = 2.0;
    } else {
      this.killPlayer();
    }
  }

  private killPlayer() {
    const p = this.player;
    this.state.status = 'dying';
    sound.playDie();
    p.vy = -11;
    p.vx = 0;
  }

  private updateDying(dt: number) {
    const p = this.player;
    p.vy += 0.5 * dt * 60;
    p.y += p.vy * dt * 60;

    if (p.y > LEVEL_HEIGHT + 100) {
      this.state.lives--;
      if (this.state.lives > 0) {
        this.resetLevel(false);
        this.state.status = 'playing';
        sound.playMusic(this.state.currentLevel === 2 ? 'underground' : 'overworld');
      } else {
        this.state.status = 'game_over';
        this.saveHighScore();
      }
    }
  }

  private checkPitfall() {
    if (this.player.y > LEVEL_HEIGHT && this.state.status === 'playing') {
      this.killPlayer();
    }
  }

  // --- Underground Secret Room Transitions ---

  private enterUnderground() {
    sound.playPipe();
    this.state.status = 'piping_down';
  }

  private updatePipingDown(dt: number) {
    this.player.y += 1.2 * dt * 60;
    if (this.player.y > GROUND_Y + 16) {
      this.overworldLevel = this.level;
      this.overworldItems = this.items;

      const ug = buildUndergroundRoom();
      this.level = {
        width: 25 * TILE_SIZE,
        height: LEVEL_HEIGHT,
        backgroundColor: '#020617',
        theme: 'underground',
        blocks: ug.blocks,
        enemies: [],
        scenery: [],
        checkpoints: [],
        flagpole: this.level.flagpole,
        castle: this.level.castle,
      };

      this.items = ug.items.map((pos) => ({
        id: Math.random().toString(),
        type: 'coin',
        x: pos.x,
        y: pos.y,
        vx: 0,
        vy: 0,
        width: 20,
        height: 24,
        grounded: true,
        spawning: false,
        spawnTargetY: pos.y,
        collected: false,
      }));

      this.state.isUnderground = true;
      this.state.cameraX = 0;
      this.player.x = 2 * TILE_SIZE;
      this.player.y = 3 * TILE_SIZE;
      this.player.vx = 0;
      this.player.vy = 0;
      this.state.status = 'playing';
      sound.playMusic('underground');
    }
  }

  private exitUnderground() {
    sound.playPipe();
    this.state.status = 'piping_up';
  }

  private updatePipingUp(dt: number) {
    if (this.overworldLevel) {
      this.level = this.overworldLevel;
      this.items = this.overworldItems;
      this.state.isUnderground = false;
      this.state.cameraX = this.returnPipeX - 200;
      this.player.x = this.returnPipeX;
      this.player.y = GROUND_Y - 80;
      this.player.vx = 0;
      this.player.vy = -3.5;
      this.state.status = 'playing';
      sound.playMusic('overworld');
    }
  }

  // --- Flagpole & Victory Sequence ---

  private startFlagpoleSequence() {
    const pole = this.level.flagpole;
    this.state.status = 'flagpole';
    sound.playFlagpole();

    const heightRatio = 1 - Math.max(0, this.player.y - (pole.baseY - pole.height)) / pole.height;
    const flagpoleScore =
      heightRatio > 0.8 ? 5000 : heightRatio > 0.5 ? 2000 : heightRatio > 0.3 ? 800 : 400;
    this.addScore(flagpoleScore, pole.x, this.player.y);

    this.player.x = pole.x - 8;
    this.player.vx = 0;
    this.player.vy = 2.5;
    this.flagTargetY = pole.baseY - 24;
    this.castleTargetX = this.level.castle.doorX;
  }

  private updateFlagpole(dt: number) {
    const pole = this.level.flagpole;

    if (this.player.y < pole.baseY - this.player.height) {
      this.player.y += 2.8 * dt * 60;
    } else {
      this.player.y = pole.baseY - this.player.height;
    }

    if (pole.flagY < pole.baseY - 32) {
      pole.flagY += 2.8 * dt * 60;
    }

    if (this.player.y >= pole.baseY - this.player.height && pole.flagY >= pole.baseY - 36) {
      this.state.status = 'walking_to_castle';
      this.player.x = pole.x + 12;
      this.player.facing = 'right';
      this.player.vx = 2.2;
      sound.playStageClear();
    }
  }

  private updateWalkingToCastle(dt: number) {
    const p = this.player;
    p.x += p.vx * dt * 60;
    p.runAnimTimer += dt * 8;
    p.runAnimFrame = Math.floor(p.runAnimTimer) % 3;

    if (p.x >= this.castleTargetX) {
      p.vx = 0;
      this.state.status = 'level_cleared';

      const timeBonus = Math.floor(this.state.timeRemaining) * 50;
      this.state.score += timeBonus;
      this.saveHighScore();

      for (let i = 0; i < 5; i++) {
        window.setTimeout(() => {
          this.particles.spawnFirework(
            this.level.castle.x + 30 + Math.random() * 80,
            this.level.castle.y - 120 - Math.random() * 50
          );
        }, i * 350);
      }
    }
  }

  private updateLevelCleared(dt: number) {
    // Fireworks celebration animation loop
  }

  private updateCamera() {
    if (this.state.isUnderground) {
      this.state.cameraX = 0;
      return;
    }
    // Bidirectional smooth camera: tracks Mario smoothly both forwards and backwards!
    const targetCameraX = Math.max(0, this.player.x - 320);
    const maxCameraX = Math.max(0, this.level.width - 800);
    const clampedTarget = Math.min(maxCameraX, Math.max(0, targetCameraX));

    // Smooth camera glide
    this.state.cameraX += (clampedTarget - this.state.cameraX) * 0.15;
    if (Math.abs(clampedTarget - this.state.cameraX) < 0.5) {
      this.state.cameraX = clampedTarget;
    }
  }

  public addScore(pts: number, x?: number, y?: number) {
    this.state.score += pts;
    if (x !== undefined && y !== undefined) {
      this.particles.spawnScoreText(x, y, `+${pts}`);
    }
    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score;
    }
  }

  private saveHighScore() {
    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score;
    }
    localStorage.setItem('mario_high_score', this.state.highScore.toString());
  }

  private checkCollision(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width?: number; height?: number }
  ): boolean {
    const bw = b.width ?? TILE_SIZE;
    const bh = b.height ?? TILE_SIZE;
    return (
      a.x < b.x + bw &&
      a.x + a.width > b.x &&
      a.y < b.y + bh &&
      a.y + a.height > b.y
    );
  }
}
