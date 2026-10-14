import { Block, Checkpoint, Enemy, LevelConfig } from './types';

export const TILE_SIZE = 32;
export const LEVEL_HEIGHT = 480;
export const GROUND_Y = LEVEL_HEIGHT - TILE_SIZE * 2; // 416

export function buildWorld11(): LevelConfig {
  const blocks: Block[] = [];
  const enemies: Enemy[] = [];

  let blockIdCounter = 0;
  const createBlock = (
    tx: number,
    ty: number,
    type: Block['type'],
    content: Block['content'] = 'empty',
    options: Partial<Block> = {}
  ): Block => {
    return {
      id: `w11_${blockIdCounter++}`,
      x: tx * TILE_SIZE,
      y: ty * TILE_SIZE,
      type,
      content,
      coinsRemaining: content === 'multi_coin' ? 10 : content === 'coin' ? 1 : 0,
      bumpOffsetY: 0,
      bumpVy: 0,
      isBumping: false,
      ...options,
    };
  };

  // Helper: Ground generator with holes/pits
  const addGroundSegment = (startTile: number, endTile: number) => {
    for (let tx = startTile; tx < endTile; tx++) {
      blocks.push(createBlock(tx, 13, 'ground'));
      blocks.push(createBlock(tx, 14, 'ground'));
    }
  };

  // Ground segments with classic pits:
  // Pit 1 at tiles 69-71
  // Pit 2 at tiles 86-89
  // Pit 3 at tiles 153-155
  addGroundSegment(0, 69);
  addGroundSegment(71, 86);
  addGroundSegment(89, 153);
  addGroundSegment(155, 215);

  // Helper: Pipe generator
  const addPipe = (tx: number, heightTiles: number, isEntrance = false, isExit = false) => {
    const topTy = 13 - heightTiles;
    // Top
    blocks.push(
      createBlock(tx, topTy, 'pipe_top_left', 'empty', {
        isSecretEntrancePipe: isEntrance,
        isSecretExitPipe: isExit,
      })
    );
    blocks.push(createBlock(tx + 1, topTy, 'pipe_top_right'));

    // Body
    for (let ty = topTy + 1; ty < 13; ty++) {
      blocks.push(createBlock(tx, ty, 'pipe_body_left'));
      blocks.push(createBlock(tx + 1, ty, 'pipe_body_right'));
    }
  };

  // Pipes
  addPipe(28, 2); // First small pipe
  addPipe(38, 3); // Medium pipe
  addPipe(46, 4); // Tall pipe
  addPipe(57, 4, true); // Secret entrance pipe down to bonus underground room!
  addPipe(163, 2); // Pipe near the staircase
  addPipe(179, 2); // Pipe after the pit

  // --- Floating Blocks & Mystery Blocks ---
  // Tile 16: Solitary ? block
  blocks.push(createBlock(16, 9, 'mystery', 'coin'));

  // Tiles 20-24: Brick, ?, Brick, ?, Brick
  blocks.push(createBlock(20, 9, 'brick', 'empty'));
  blocks.push(createBlock(21, 9, 'mystery', 'mushroom_or_flower')); // Powerup!
  blocks.push(createBlock(22, 9, 'brick', 'empty'));
  blocks.push(createBlock(23, 9, 'mystery', 'flower')); // Fire Flower!
  blocks.push(createBlock(24, 9, 'brick', 'empty'));

  // High ? block at tile 22, ty 5
  blocks.push(createBlock(22, 5, 'mystery', 'coin'));

  // Hidden 1-Up block near pipe 4
  blocks.push(createBlock(64, 8, 'mystery', '1up'));

  // Tiles 77-84: Floating platform
  blocks.push(createBlock(77, 9, 'brick', 'empty'));
  blocks.push(createBlock(78, 9, 'mystery', 'mushroom_or_flower'));
  blocks.push(createBlock(79, 9, 'brick', 'empty'));
  // High brick platform above
  for (let bx = 80; bx <= 87; bx++) {
    blocks.push(createBlock(bx, 5, 'brick', bx === 84 ? 'multi_coin' : 'empty'));
  }

  // Tiles 91-94: Platform with Starman!
  blocks.push(createBlock(91, 5, 'brick', 'empty'));
  blocks.push(createBlock(92, 5, 'brick', 'empty'));
  blocks.push(createBlock(93, 5, 'brick', 'empty'));
  blocks.push(createBlock(94, 9, 'brick', 'star')); // Hidden Starman!
  blocks.push(createBlock(100, 9, 'mystery', 'coin'));
  blocks.push(createBlock(101, 9, 'mystery', 'coin'));
  blocks.push(createBlock(106, 9, 'mystery', 'mushroom_or_flower'));
  blocks.push(createBlock(109, 9, 'brick', 'empty'));
  blocks.push(createBlock(110, 9, 'brick', 'empty'));

  // Helper: Staircase builder (solid stone steps)
  const addStairs = (startTx: number, height: number, direction: 'up' | 'down') => {
    for (let step = 1; step <= height; step++) {
      const curTx = startTx + step - 1;
      const curHeight = direction === 'up' ? step : height - step + 1;
      for (let h = 0; h < curHeight; h++) {
        blocks.push(createBlock(curTx, 13 - (h + 1), 'stone'));
      }
    }
  };

  // Pyramid 1 (tiles 134-137 ascending, 138-141 descending)
  addStairs(134, 4, 'up');
  addStairs(138, 4, 'down');

  // Pyramid 2 (tiles 148-152 ascending 4 steps, gap, then descending)
  addStairs(148, 4, 'up');
  blocks.push(createBlock(152, 9, 'stone')); // floating ledge
  addStairs(156, 4, 'down');

  // Final Grand Staircase to Flagpole (8 steps high! tiles 181-188)
  addStairs(181, 8, 'up');

  // Ground leading up to flagpole
  const flagpoleTx = 198;
  const castleTx = 203;

  // --- Enemies (Goombas and Koopas) ---
  let enemyIdCounter = 0;
  const addGoomba = (tx: number, ty: number = 12) => {
    enemies.push({
      id: `w11_goomba_${enemyIdCounter++}`,
      type: 'goomba',
      x: tx * TILE_SIZE,
      y: ty * TILE_SIZE,
      vx: -1.0,
      vy: 0,
      width: 28,
      height: 28,
      grounded: true,
      alive: true,
      squished: false,
      squishTimer: 0,
      isShell: false,
      shellMoving: false,
      facing: 'left',
      animTimer: 0,
      animFrame: 0,
    });
  };

  const addKoopa = (tx: number, ty: number = 11) => {
    enemies.push({
      id: `w11_koopa_${enemyIdCounter++}`,
      type: 'koopa',
      x: tx * TILE_SIZE,
      y: ty * TILE_SIZE - 4,
      vx: -1.2,
      vy: 0,
      width: 28,
      height: 36,
      grounded: true,
      alive: true,
      squished: false,
      squishTimer: 0,
      isShell: false,
      shellMoving: false,
      facing: 'left',
      animTimer: 0,
      animFrame: 0,
    });
  };

  // Strategic enemy placements:
  addGoomba(22);
  addGoomba(40);
  addGoomba(51);
  addGoomba(52.5);
  addKoopa(80);
  addGoomba(97);
  addGoomba(98.5);
  addKoopa(107);
  addGoomba(124);
  addGoomba(126);
  addGoomba(128);
  addGoomba(174);
  addGoomba(176);

  // Checkpoints: Midpoint at tile 90, directly at GROUND_Y (416)
  const checkpoints: Checkpoint[] = [
    {
      x: 90 * TILE_SIZE,
      y: GROUND_Y,
      passed: false,
    },
  ];

  return {
    width: 215 * TILE_SIZE,
    height: LEVEL_HEIGHT,
    backgroundColor: '#38BDF8',
    theme: 'overworld',
    blocks,
    enemies,
    scenery: [],
    checkpoints,
    flagpole: {
      x: flagpoleTx * TILE_SIZE,
      baseY: GROUND_Y,
      height: 280,
      flagY: GROUND_Y - 260,
    },
    castle: {
      x: castleTx * TILE_SIZE,
      y: GROUND_Y,
      doorX: castleTx * TILE_SIZE + 50,
    },
  };
}

/**
 * World 1-2: "El Castillo Subterráneo / Caverna de Lava"
 * Rebalanced: thrilling, accessible, with wide platforms, fair jumps, checkpoints, and rewards!
 */
export function buildWorld12(): LevelConfig {
  const blocks: Block[] = [];
  const enemies: Enemy[] = [];
  let blockIdCounter = 0;

  const createBlock = (
    tx: number,
    ty: number,
    type: Block['type'],
    content: Block['content'] = 'empty',
    options: Partial<Block> = {}
  ): Block => {
    return {
      id: `w12_${blockIdCounter++}`,
      x: tx * TILE_SIZE,
      y: ty * TILE_SIZE,
      type,
      content,
      coinsRemaining: content === 'multi_coin' ? 10 : content === 'coin' ? 1 : 0,
      bumpOffsetY: 0,
      bumpVy: 0,
      isBumping: false,
      underground: true,
      ...options,
    };
  };

  // Add lava at the bottom pits
  const addLavaPit = (startTx: number, endTx: number) => {
    for (let tx = startTx; tx < endTx; tx++) {
      blocks.push(createBlock(tx, 13, 'lava'));
      blocks.push(createBlock(tx, 14, 'lava'));
    }
  };

  // Add castle stone ground
  const addStoneGround = (startTx: number, endTx: number) => {
    for (let tx = startTx; tx < endTx; tx++) {
      blocks.push(createBlock(tx, 13, 'stone'));
      blocks.push(createBlock(tx, 14, 'stone'));
    }
  };

  // High ceiling blocks with secret entry gap
  for (let tx = 0; tx < 185; tx++) {
    if (tx < 25 || tx > 28) {
      blocks.push(createBlock(tx, 0, 'brick'));
      blocks.push(createBlock(tx, 1, 'brick'));
    }
  }

  // --- Ground & Rebalanced Lava Pits ---
  // Safe entrance zone
  addStoneGround(0, 18);
  // Pit 1: Manageable 3-tile lava gap
  addLavaPit(18, 21);
  // Stepping island 1: generous 5-tile platform
  addStoneGround(21, 26);
  // Pit 2: 3-tile lava gap
  addLavaPit(26, 29);
  // Medium stone runway with pipes
  addStoneGround(29, 46);

  // Power-up before Pit 3
  blocks.push(createBlock(44, 9, 'mystery', 'mushroom_or_flower'));

  // Pit 3: Double lava pit with wide 3-tile stepping island in middle
  addLavaPit(46, 50);
  for (let tx = 50; tx <= 52; tx++) {
    blocks.push(createBlock(tx, 11, 'stone'));
  }
  addLavaPit(53, 56);

  // Elevated runway
  addStoneGround(56, 68);
  // Pit 4: 3-tile gap
  addLavaPit(68, 71);

  // --- Checkpoint Zone (Tiles 71-90) ---
  addStoneGround(71, 90);
  blocks.push(createBlock(73, 9, 'mystery', 'flower')); // Fire Flower checkpoint reward!
  blocks.push(createBlock(75, 9, 'brick', 'coin'));

  // Pit 5: Rebalanced fun jumping sequence with 2-3 tile wide platforms!
  addLavaPit(90, 115);
  // Platform 1 (3 tiles wide, ty 11)
  for (let tx = 93; tx <= 95; tx++) blocks.push(createBlock(tx, 11, 'stone'));
  // Platform 2 (3 tiles wide, ty 9)
  for (let tx = 98; tx <= 100; tx++) blocks.push(createBlock(tx, 9, 'stone'));
  // Platform 3 (3 tiles wide, ty 8)
  for (let tx = 103; tx <= 105; tx++) blocks.push(createBlock(tx, 8, 'stone'));
  // Platform 4 (3 tiles wide, ty 10)
  for (let tx = 108; tx <= 110; tx++) blocks.push(createBlock(tx, 10, 'stone'));

  // Fortress zone
  addStoneGround(115, 130);
  blocks.push(createBlock(118, 8, 'brick', 'star')); // Hidden Starman reward!

  // Pit 6 (Final grand lava bridge with solid floor and breakable top)
  addLavaPit(130, 134);
  addStoneGround(134, 142);
  addLavaPit(142, 146);
  // Overhead brick bridge
  for (let bx = 132; bx < 144; bx++) {
    blocks.push(createBlock(bx, 9, 'brick', 'empty'));
  }

  // Final castle courtyard
  addStoneGround(146, 185);

  // --- Pipes in Level 2 ---
  const addPipe12 = (tx: number, heightTiles: number) => {
    const topTy = 13 - heightTiles;
    blocks.push(createBlock(tx, topTy, 'pipe_top_left'));
    blocks.push(createBlock(tx + 1, topTy, 'pipe_top_right'));
    for (let ty = topTy + 1; ty < 13; ty++) {
      blocks.push(createBlock(tx, ty, 'pipe_body_left'));
      blocks.push(createBlock(tx + 1, ty, 'pipe_body_right'));
    }
  };

  addPipe12(34, 3);
  addPipe12(42, 4);
  addPipe12(62, 3);
  addPipe12(82, 4);
  addPipe12(122, 3);

  // Secret ceiling path bonus coins
  for (let cx = 30; cx < 45; cx += 2) {
    blocks.push(createBlock(cx, 3, 'brick', 'coin'));
  }

  // Final stone staircase (8 steps)
  for (let step = 1; step <= 8; step++) {
    for (let h = 0; h < step; h++) {
      blocks.push(createBlock(158 + step - 1, 13 - (h + 1), 'stone'));
    }
  }

  // Enemies: Rebalanced speeds so it's active and fun but fair!
  let enemyId = 0;
  const addGoomba12 = (tx: number, ty = 12) => {
    enemies.push({
      id: `w12_g_${enemyId++}`,
      type: 'goomba',
      x: tx * TILE_SIZE,
      y: ty * TILE_SIZE,
      vx: -1.0,
      vy: 0,
      width: 28,
      height: 28,
      grounded: true,
      alive: true,
      squished: false,
      squishTimer: 0,
      isShell: false,
      shellMoving: false,
      facing: 'left',
      animTimer: 0,
      animFrame: 0,
    });
  };

  const addFastKoopa = (tx: number, ty = 11) => {
    enemies.push({
      id: `w12_k_${enemyId++}`,
      type: 'fast_koopa',
      x: tx * TILE_SIZE,
      y: ty * TILE_SIZE - 4,
      vx: -1.4, // Fair, fun, manageable speed
      vy: 0,
      width: 28,
      height: 36,
      grounded: true,
      alive: true,
      squished: false,
      squishTimer: 0,
      isShell: false,
      shellMoving: false,
      facing: 'left',
      animTimer: 0,
      animFrame: 0,
    });
  };

  // Rebalanced placements
  addGoomba12(14);
  addFastKoopa(23);
  addGoomba12(32);
  addFastKoopa(40);
  addFastKoopa(59);
  addGoomba12(64);
  // Post-checkpoint enemies
  addFastKoopa(80);
  addGoomba12(117);
  addFastKoopa(124);
  addGoomba12(136);

  // Checkpoints: Midpoint at tile 76, directly on ground (y: GROUND_Y)
  const checkpoints: Checkpoint[] = [
    {
      x: 76 * TILE_SIZE,
      y: GROUND_Y,
      passed: false,
    },
  ];

  const flagpoleTx = 172;
  const castleTx = 177;

  return {
    width: 185 * TILE_SIZE,
    height: LEVEL_HEIGHT,
    backgroundColor: '#0F172A',
    theme: 'castle',
    blocks,
    enemies,
    scenery: [],
    checkpoints,
    flagpole: {
      x: flagpoleTx * TILE_SIZE,
      baseY: GROUND_Y,
      height: 280,
      flagY: GROUND_Y - 260,
    },
    castle: {
      x: castleTx * TILE_SIZE,
      y: GROUND_Y,
      doorX: castleTx * TILE_SIZE + 50,
    },
  };
}

/**
 * Builds the secret Underground Bonus Vault Room
 */
export function buildUndergroundRoom(): { blocks: Block[]; items: { x: number; y: number }[] } {
  const blocks: Block[] = [];
  const items: { x: number; y: number }[] = [];
  let blockIdCounter = 1000;

  const createUndergroundBlock = (tx: number, ty: number, type: Block['type']) => {
    blocks.push({
      id: `ug_${blockIdCounter++}`,
      x: tx * TILE_SIZE,
      y: ty * TILE_SIZE,
      type,
      content: 'empty',
      bumpOffsetY: 0,
      bumpVy: 0,
      isBumping: false,
      underground: true,
    });
  };

  const roomWidthTiles = 25;

  for (let tx = 0; tx < roomWidthTiles; tx++) {
    createUndergroundBlock(tx, 0, 'brick');
    createUndergroundBlock(tx, 1, 'brick');
    createUndergroundBlock(tx, 13, 'brick');
    createUndergroundBlock(tx, 14, 'brick');
  }

  for (let ty = 2; ty < 13; ty++) {
    createUndergroundBlock(0, ty, 'brick');
  }

  for (let ty = 2; ty < 13; ty++) {
    if (ty < 9 || ty > 11) {
      createUndergroundBlock(roomWidthTiles - 1, ty, 'brick');
    }
  }

  blocks.push({
    id: `ug_pipe_tl`,
    x: 21 * TILE_SIZE,
    y: 9 * TILE_SIZE,
    type: 'pipe_top_left',
    content: 'empty',
    bumpOffsetY: 0,
    bumpVy: 0,
    isBumping: false,
    underground: true,
    isSecretExitPipe: true,
  });
  blocks.push({
    id: `ug_pipe_tr`,
    x: 22 * TILE_SIZE,
    y: 9 * TILE_SIZE,
    type: 'pipe_top_right',
    content: 'empty',
    bumpOffsetY: 0,
    bumpVy: 0,
    isBumping: false,
    underground: true,
  });
  for (let ty = 10; ty < 13; ty++) {
    blocks.push({
      id: `ug_pipe_bl_${ty}`,
      x: 21 * TILE_SIZE,
      y: ty * TILE_SIZE,
      type: 'pipe_body_left',
      content: 'empty',
      bumpOffsetY: 0,
      bumpVy: 0,
      isBumping: false,
      underground: true,
    });
    blocks.push({
      id: `ug_pipe_br_${ty}`,
      x: 22 * TILE_SIZE,
      y: ty * TILE_SIZE,
      type: 'pipe_body_right',
      content: 'empty',
      bumpOffsetY: 0,
      bumpVy: 0,
      isBumping: false,
      underground: true,
    });
  }

  for (let tx = 4; tx < 18; tx++) {
    items.push({ x: tx * TILE_SIZE + 4, y: 7 * TILE_SIZE });
    if (tx >= 6 && tx <= 16) {
      items.push({ x: tx * TILE_SIZE + 4, y: 4 * TILE_SIZE });
    }
  }

  return { blocks, items };
}
