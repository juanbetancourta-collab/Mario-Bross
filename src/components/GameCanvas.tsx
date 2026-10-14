import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { SpriteRenderer } from '../game/sprites';

interface GameCanvasProps {
  engine: GameEngine;
  showScanlines: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine, showScanlines }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      // Update game loop
      engine.update(dt);

      const width = canvas.width;
      const height = canvas.height;
      const camX = engine.state.cameraX;

      // Clear
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Background & Parallax layers (Supports overworld, underground, and castle theme)
      SpriteRenderer.drawBackground(
        ctx,
        width,
        height,
        camX,
        engine.state.isUnderground,
        time / 1000,
        engine.level.theme
      );

      // 2. Camera Transform for World Objects
      ctx.save();
      ctx.translate(-camX, 0);

      // Flagpole and Castle
      if (!engine.state.isUnderground) {
        SpriteRenderer.drawFlagpoleAndCastle(
          ctx,
          engine.level.flagpole.x,
          engine.level.flagpole.baseY,
          engine.level.flagpole.height,
          engine.level.flagpole.flagY,
          engine.level.castle.x,
          engine.level.castle.y,
          time / 1000
        );
      }

      // Checkpoints
      if (!engine.state.isUnderground && engine.level.checkpoints) {
        for (const cp of engine.level.checkpoints) {
          if (cp.x + 32 >= camX - 32 && cp.x <= camX + width + 32) {
            SpriteRenderer.drawCheckpoint(ctx, cp.x, cp.y, cp.passed, time / 1000);
          }
        }
      }

      // Draw Blocks (mystery, brick, ground, pipe, lava, stone)
      for (const b of engine.level.blocks) {
        if (b.x + 32 >= camX - 32 && b.x <= camX + width + 32) {
          SpriteRenderer.drawBlock(
            ctx,
            b.x,
            b.y,
            32,
            b.type,
            b.bumpOffsetY,
            time / 1000,
            engine.state.isUnderground
          );
        }
      }

      // Draw Items (coins, mushrooms, stars, flowers)
      for (const it of engine.items) {
        if (it.x + it.width >= camX - 32 && it.x <= camX + width + 32) {
          SpriteRenderer.drawItem(
            ctx,
            it.x,
            it.y,
            it.width,
            it.height,
            it.type,
            time / 1000
          );
        }
      }

      // Draw Enemies (Goombas, Koopas, Fast Red Koopas)
      for (const en of engine.level.enemies) {
        if (en.alive || (en.squished && en.squishTimer < 0.6)) {
          if (en.x + en.width >= camX - 32 && en.x <= camX + width + 32) {
            if (en.type === 'goomba') {
              SpriteRenderer.drawGoomba(
                ctx,
                en.x,
                en.y,
                en.width,
                en.height,
                en.squished,
                en.animFrame
              );
            } else if (en.type === 'koopa' || en.type === 'fast_koopa') {
              SpriteRenderer.drawKoopa(
                ctx,
                en.x,
                en.y,
                en.width,
                en.height,
                en.isShell,
                en.shellMoving,
                en.facing,
                en.animFrame,
                en.type === 'fast_koopa'
              );
            }
          }
        }
      }

      // Draw Fireballs
      for (const fb of engine.fireballs) {
        SpriteRenderer.drawFireball(ctx, fb.x, fb.y, fb.rotation);
      }

      // Draw Mario Player
      if (engine.state.status !== 'level_cleared' || engine.player.x < engine.level.castle.doorX) {
        SpriteRenderer.drawMario(
          ctx,
          engine.player.x,
          engine.player.y,
          engine.player.width,
          engine.player.height,
          engine.player.form,
          engine.player.facing,
          engine.player.grounded,
          engine.player.vx,
          engine.player.isCrouching,
          engine.player.isSkidding,
          engine.player.runAnimFrame,
          engine.player.invincibleTimer,
          engine.player.damageCooldown
        );
      }

      // Draw Particles & Floating Scores
      engine.particles.render(ctx);

      // Secret Pipe hint when Mario is on top of it in World 1-1
      if (engine.state.status === 'playing' && !engine.state.isUnderground && engine.state.currentLevel === 1) {
        const pipeX = 57 * 32;
        if (Math.abs(engine.player.x - pipeX) < 40 && engine.player.grounded) {
          ctx.save();
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = '#22C55E';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(pipeX - 80, 230, 220, 24, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#4ADE80';
          ctx.font = 'bold 8px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⬇ PULSA ABAJO PARA ENTRAR', pipeX + 30, 242);
          ctx.restore();
        }
      }

      // Restore camera transform
      ctx.restore();

      // 3. Screen-Space Overlays (HUD elements drawn directly on canvas)

      // A. Checkpoint notification popup banner
      if (engine.state.checkpointNotification) {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        const bannerW = 340;
        const bannerH = 34;
        const bannerX = width / 2 - bannerW / 2;
        const bannerY = 16;
        ctx.beginPath();
        ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#34D399';
        ctx.font = 'bold 11px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(engine.state.checkpointNotification, width / 2, bannerY + bannerH / 2);
        ctx.restore();
      }

      // B. Persistent small-text controls guide banner at bottom of canvas
      if (engine.state.status === 'playing' || engine.state.status === 'paused') {
        ctx.save();
        ctx.fillStyle = 'rgba(2, 6, 23, 0.78)';
        ctx.beginPath();
        ctx.roundRect(width / 2 - 370, height - 22, 740, 18, 6);
        ctx.fill();

        ctx.fillStyle = 'rgba(226, 232, 240, 0.9)';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          '🎮 [← → / A D] MOVER · [ESPACIO / A] SALTAR · [F / B] FUEGO (CON FLOR) · [SHIFT] CORRER · [↓ / S] AGACHARSE · [P] PAUSA',
          width / 2,
          height - 13
        );
        ctx.restore();
      }

      // 4. Scanline overlay effect (optional aesthetic)
      if (showScanlines) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1.5);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [engine, showScanlines]);

  return (
    <div className="relative w-full max-w-[960px] aspect-[800/480] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-500/40">
      <canvas
        ref={canvasRef}
        width={800}
        height={480}
        className="w-full h-full object-contain block image-rendering-pixelated"
      />
    </div>
  );
};
