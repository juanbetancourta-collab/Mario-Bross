import { Particle } from './types';

export class ParticleSystem {
  private particles: Particle[] = [];

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;

      // Gravity on physics particles
      if (p.type === 'brick' || p.type === 'firework') {
        p.vy += 0.35 * dt * 60;
      } else if (p.type === 'score') {
        p.vy *= 0.94;
      }

      if (p.rotation !== undefined && p.rotSpeed !== undefined) {
        p.rotation += p.rotSpeed * dt * 60;
      }

      p.life += dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.type === 'brick') {
        ctx.translate(p.x, p.y);
        if (p.rotation) ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.strokeStyle = '#451A03';
        ctx.lineWidth = 1;
        ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);

      } else if (p.type === 'score') {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(p.text || '', p.x, p.y);

      } else if (p.type === 'sparkle') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

      } else if (p.type === 'smoke') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + (p.life / p.maxLife) * 0.8), 0, Math.PI * 2);
        ctx.fill();

      } else if (p.type === 'firework') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  public spawnBrickDebris(x: number, y: number, isUnderground: boolean) {
    const color = isUnderground ? '#3B82F6' : '#B45309';
    // 4 pieces bouncing in different directions
    const trajectories = [
      { vx: -2.5, vy: -6 },
      { vx: 2.5, vy: -6 },
      { vx: -1.5, vy: -4 },
      { vx: 1.5, vy: -4 },
    ];

    trajectories.forEach((t) => {
      this.particles.push({
        id: Math.random().toString(),
        x,
        y,
        vx: t.vx,
        vy: t.vy,
        color,
        size: 8,
        alpha: 1,
        life: 0,
        maxLife: 1.2,
        type: 'brick',
        rotation: 0,
        rotSpeed: (Math.random() - 0.5) * 0.4,
      });
    });
  }

  public spawnScoreText(x: number, y: number, text: string) {
    this.particles.push({
      id: Math.random().toString(),
      x,
      y,
      vx: 0,
      vy: -1.8,
      color: '#FFFFFF',
      size: 10,
      alpha: 1,
      life: 0,
      maxLife: 0.9,
      type: 'score',
      text,
    });
  }

  public spawnDust(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        id: Math.random().toString(),
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -0.5 - Math.random() * 0.8,
        color: '#E2E8F0',
        size: 3.5,
        alpha: 0.8,
        life: 0,
        maxLife: 0.35,
        type: 'smoke',
      });
    }
  }

  public spawnSparkles(x: number, y: number, color = '#FDE047') {
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const speed = 1.8 + Math.random() * 1.2;
      this.particles.push({
        id: Math.random().toString(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3,
        alpha: 1,
        life: 0,
        maxLife: 0.5,
        type: 'sparkle',
      });
    }
  }

  public spawnFirework(x: number, y: number) {
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#A855F7'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];
    const count = 18;

    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count;
      const speed = 2.5 + Math.random() * 2;
      this.particles.push({
        id: Math.random().toString(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: chosenColor,
        size: 4,
        alpha: 1,
        life: 0,
        maxLife: 1.0,
        type: 'firework',
      });
    }
  }

  public clear() {
    this.particles = [];
  }
}
