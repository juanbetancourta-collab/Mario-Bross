import { MarioForm } from './types';

export class SpriteRenderer {
  /**
   * Draws a highly detailed Mario with animations for running, jumping, crouching, etc.
   */
  public static drawMario(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    form: MarioForm,
    facing: 'left' | 'right',
    grounded: boolean,
    vx: number,
    isCrouching: boolean,
    isSkidding: boolean,
    animFrame: number,
    invincibleTimer: number,
    damageCooldown: number
  ) {
    if (damageCooldown > 0 && Math.floor(damageCooldown * 20) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);

    if (facing === 'left') {
      ctx.scale(-1, 1);
    }

    const isBig = form !== 'small';
    const isFire = form === 'fire';
    const isStar = invincibleTimer > 0;

    let capShirtColor = isFire ? '#F8F9FA' : '#E52521';
    let overallsColor = isFire ? '#E52521' : '#002B7F';
    const skinColor = '#FFCD94';
    const hairShoeColor = '#593214';
    const buttonColor = '#FFD700';

    if (isStar) {
      const hue = (Date.now() / 3) % 360;
      capShirtColor = `hsl(${hue}, 90%, 60%)`;
      overallsColor = `hsl(${(hue + 120) % 360}, 90%, 50%)`;
      ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
      ctx.shadowBlur = 14;
    }

    const scale = isBig ? (isCrouching ? 0.85 : 1.2) : (isCrouching ? 0.72 : 0.8);
    ctx.scale(scale, scale);

    const cy = isBig ? -4 : -2;

    // 1. Shadow beneath Mario
    if (grounded) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, height / 2 - 2, width * 0.45, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Legs & Shoes
    const legSwing = grounded ? Math.sin(animFrame * 1.5) * 6 : 0;
    const isJumping = !grounded;

    ctx.fillStyle = overallsColor;
    if (isJumping) {
      ctx.fillRect(-9, cy + 6, 6, 8);
      ctx.fillStyle = hairShoeColor;
      ctx.beginPath();
      ctx.roundRect(-12, cy + 12, 10, 6, 3);
      ctx.fill();
    } else if (isCrouching) {
      ctx.fillRect(-10, cy + 4, 20, 6);
      ctx.fillStyle = hairShoeColor;
      ctx.beginPath();
      ctx.roundRect(-13, cy + 8, 12, 5, 2);
      ctx.roundRect(1, cy + 8, 12, 5, 2);
      ctx.fill();
    } else {
      ctx.fillRect(-8 + legSwing, cy + 8, 5, 7);
      ctx.fillStyle = hairShoeColor;
      ctx.beginPath();
      ctx.roundRect(-11 + legSwing, cy + 13, 9, 6, 2);
      ctx.fill();

      ctx.fillStyle = overallsColor;
      ctx.fillRect(3 - legSwing, cy + 8, 5, 7);
      ctx.fillStyle = hairShoeColor;
      ctx.beginPath();
      ctx.roundRect(0 - legSwing, cy + 13, 9, 6, 2);
      ctx.fill();
    }

    // 3. Torso / Overalls
    if (isCrouching) {
      ctx.fillStyle = overallsColor;
      ctx.beginPath();
      ctx.roundRect(-8, cy + 2, 16, 7, 2);
      ctx.fill();

      ctx.fillStyle = buttonColor;
      ctx.beginPath();
      ctx.arc(-4, cy + 5, 1.4, 0, Math.PI * 2);
      ctx.arc(4, cy + 5, 1.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-9, cy + 5, 3.2, 0, Math.PI * 2);
      ctx.arc(9, cy + 5, 3.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = capShirtColor;
      ctx.fillRect(-7, cy - 2, 14, 10);

      ctx.fillStyle = overallsColor;
      ctx.beginPath();
      ctx.roundRect(-7, cy + 1, 14, 8, 2);
      ctx.fill();

      ctx.fillRect(-6, cy - 2, 3, 5);
      ctx.fillRect(3, cy - 2, 3, 5);

      ctx.fillStyle = buttonColor;
      ctx.beginPath();
      ctx.arc(-4.5, cy + 3, 1.5, 0, Math.PI * 2);
      ctx.arc(4.5, cy + 3, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = capShirtColor;
      if (isJumping) {
        ctx.fillRect(5, cy - 10, 5, 10);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(7.5, cy - 11, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = capShirtColor;
        ctx.fillRect(-10, cy, 4, 7);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-8, cy + 8, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (isSkidding) {
        ctx.fillRect(6, cy - 1, 7, 4);
        ctx.fillRect(-12, cy - 1, 7, 4);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(14, cy + 1, 3.5, 0, Math.PI * 2);
        ctx.arc(-13, cy + 1, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const armSwing = Math.sin(animFrame * 1.5) * 5;
        ctx.fillRect(-10 - armSwing, cy, 4, 8);
        ctx.fillRect(6 + armSwing, cy, 4, 8);

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-8 - armSwing, cy + 9, 3.5, 0, Math.PI * 2);
        ctx.arc(8 + armSwing, cy + 9, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Head & Face
    const headY = isCrouching ? cy - 3 : cy - 8;

    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.roundRect(-6, headY - 4, 13, 11, 3);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(7, headY + 1, 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#002B7F';
    ctx.fillRect(2, headY - 2, 2.5, 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(3, headY - 2, 1.2, 2);

    ctx.fillStyle = hairShoeColor;
    ctx.beginPath();
    ctx.roundRect(1, headY + 2, 8, 3.5, 1.5);
    ctx.roundRect(-2, headY + 3, 5, 2.5, 1);
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(-7, headY - 1, 3.5, 6, 1.5);
    ctx.roundRect(-8, headY + 2, 3, 4, 1.5);
    ctx.fill();

    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(-3, headY + 1, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 5. Cap
    ctx.fillStyle = capShirtColor;
    ctx.beginPath();
    ctx.roundRect(-7, headY - 10, 15, 7, [5, 5, 1, 1]);
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(1, headY - 5, 10, 3.2, 1.5);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, headY - 7, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = capShirtColor;
    ctx.font = 'bold 4.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('M', 0, headY - 6.8);

    ctx.restore();
  }

  public static drawGoomba(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    squished: boolean,
    animFrame: number
  ) {
    ctx.save();
    ctx.translate(x + width / 2, y + height);

    if (squished) {
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.ellipse(0, -4, width * 0.55, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-5, -6);
      ctx.lineTo(-2, -3);
      ctx.moveTo(-2, -6);
      ctx.lineTo(-5, -3);
      ctx.moveTo(2, -6);
      ctx.lineTo(5, -3);
      ctx.moveTo(5, -6);
      ctx.lineTo(2, -3);
      ctx.stroke();

      ctx.restore();
      return;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, -1, width * 0.42, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    const footOffset = Math.sin(animFrame * 2) * 2;
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.roundRect(-9 + footOffset, -5, 7, 5, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(2 - footOffset, -5, 7, 5, 2);
    ctx.fill();

    ctx.fillStyle = '#F4D29C';
    ctx.beginPath();
    ctx.roundRect(-5, -12, 10, 8, 2);
    ctx.fill();

    const capGrad = ctx.createLinearGradient(0, -height, 0, -6);
    capGrad.addColorStop(0, '#B3541E');
    capGrad.addColorStop(1, '#78350F');
    ctx.fillStyle = capGrad;
    ctx.beginPath();
    ctx.moveTo(-width / 2 + 1, -8);
    ctx.quadraticCurveTo(-width / 2 + 1, -height + 3, 0, -height + 1);
    ctx.quadraticCurveTo(width / 2 - 1, -height + 3, width / 2 - 1, -8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.ellipse(0, -height + 4, width * 0.25, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-6, -16, 4, 7);
    ctx.fillRect(2, -16, 4, 7);

    ctx.fillStyle = '#000000';
    ctx.fillRect(-5, -13, 2.5, 4);
    ctx.fillRect(3, -13, 2.5, 4);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-7, -17);
    ctx.lineTo(-2, -15);
    ctx.moveTo(7, -17);
    ctx.lineTo(2, -15);
    ctx.stroke();

    ctx.restore();
  }

  public static drawKoopa(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    isShell: boolean,
    shellMoving: boolean,
    facing: 'left' | 'right',
    animFrame: number,
    isFast: boolean = false
  ) {
    ctx.save();
    ctx.translate(x + width / 2, y + height);

    if (facing === 'left') {
      ctx.scale(-1, 1);
    }

    const shellColor = isFast ? '#DC2626' : '#10B981';
    const shellBorder = isFast ? '#991B1B' : '#047857';

    if (isShell) {
      if (shellMoving) {
        ctx.shadowColor = shellColor;
        ctx.shadowBlur = 10;
      }

      ctx.fillStyle = shellColor;
      ctx.beginPath();
      ctx.arc(0, -9, 9, Math.PI, 0);
      ctx.lineTo(9, -3);
      ctx.lineTo(-9, -3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(-10, -5, 20, 5, 2.5);
      ctx.fill();

      ctx.strokeStyle = shellBorder;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, -9, 5, Math.PI, 0);
      ctx.moveTo(-5, -9);
      ctx.lineTo(-9, -9);
      ctx.moveTo(5, -9);
      ctx.lineTo(9, -9);
      ctx.moveTo(0, -14);
      ctx.lineTo(0, -9);
      ctx.stroke();

      ctx.restore();
      return;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, -1, width * 0.45, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    const legSwing = Math.sin(animFrame * 2) * 3;
    ctx.fillStyle = isFast ? '#EF4444' : '#F59E0B';
    ctx.beginPath();
    ctx.roundRect(-7 + legSwing, -5, 6, 5, 2);
    ctx.roundRect(2 - legSwing, -5, 6, 5, 2);
    ctx.fill();

    ctx.fillStyle = shellColor;
    ctx.beginPath();
    ctx.ellipse(-2, -14, 8, 10, -0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-2, -7, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.roundRect(3, -27, 10, 11, 4);
    ctx.fill();

    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.roundRect(10, -22, 5, 5, 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(6, -25, 4, 6);
    ctx.fillStyle = isFast ? '#DC2626' : '#000000';
    ctx.fillRect(8, -24, 2, 4);

    ctx.restore();
  }

  public static drawBlock(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    type: string,
    bumpOffsetY: number = 0,
    time: number = 0,
    isUnderground: boolean = false
  ) {
    const drawY = y + bumpOffsetY;

    ctx.save();

    if (type === 'mystery') {
      const pulse = Math.sin(time * 4) * 0.15 + 0.85;
      const grad = ctx.createLinearGradient(x, drawY, x, drawY + size);
      grad.addColorStop(0, '#FBBF24');
      grad.addColorStop(0.5, '#F59E0B');
      grad.addColorStop(1, '#D97706');

      ctx.fillStyle = grad;
      ctx.fillRect(x, drawY, size, size);

      ctx.strokeStyle = '#FEF3C7';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, drawY + 1, size - 2, size - 2);

      ctx.strokeStyle = '#92400E';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 3, drawY + 3, size - 6, size - 6);

      ctx.fillStyle = '#78350F';
      const r = 1.5;
      ctx.beginPath();
      ctx.arc(x + 4, drawY + 4, r, 0, Math.PI * 2);
      ctx.arc(x + size - 4, drawY + 4, r, 0, Math.PI * 2);
      ctx.arc(x + 4, drawY + size - 4, r, 0, Math.PI * 2);
      ctx.arc(x + size - 4, drawY + size - 4, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#78350F';
      ctx.font = `bold ${Math.floor(size * 0.65)}px 'Press Start 2P', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', x + size / 2 + 1, drawY + size / 2 + 1);

      ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
      ctx.fillText('?', x + size / 2, drawY + size / 2);

    } else if (type === 'empty_block') {
      const grad = ctx.createLinearGradient(x, drawY, x, drawY + size);
      grad.addColorStop(0, '#92400E');
      grad.addColorStop(1, '#451A03');
      ctx.fillStyle = grad;
      ctx.fillRect(x, drawY, size, size);

      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, drawY + 1, size - 2, size - 2);

      ctx.fillStyle = '#000000';
      const r = 1.5;
      ctx.beginPath();
      ctx.arc(x + 4, drawY + 4, r, 0, Math.PI * 2);
      ctx.arc(x + size - 4, drawY + 4, r, 0, Math.PI * 2);
      ctx.arc(x + 4, drawY + size - 4, r, 0, Math.PI * 2);
      ctx.arc(x + size - 4, drawY + size - 4, r, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 'brick') {
      const baseColor = isUnderground ? '#1E3A8A' : '#B45309';
      const lightColor = isUnderground ? '#3B82F6' : '#D97706';
      const darkColor = isUnderground ? '#0F172A' : '#78350F';

      ctx.fillStyle = baseColor;
      ctx.fillRect(x, drawY, size, size);

      ctx.strokeStyle = darkColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 0.5, drawY + 0.5, size - 1, size - 1);

      ctx.beginPath();
      ctx.moveTo(x, drawY + size / 2);
      ctx.lineTo(x + size, drawY + size / 2);

      ctx.moveTo(x + size / 2, drawY);
      ctx.lineTo(x + size / 2, drawY + size / 2);

      ctx.moveTo(x + size / 4, drawY + size / 2);
      ctx.lineTo(x + size / 4, drawY + size);

      ctx.moveTo(x + (3 * size) / 4, drawY + size / 2);
      ctx.lineTo(x + (3 * size) / 4, drawY + size);
      ctx.stroke();

      ctx.fillStyle = lightColor;
      ctx.fillRect(x + 2, drawY + 2, size / 2 - 4, 2);
      ctx.fillRect(x + size / 2 + 2, drawY + 2, size / 2 - 4, 2);
      ctx.fillRect(x + 2, drawY + size / 2 + 2, size / 4 - 3, 2);
      ctx.fillRect(x + size / 4 + 2, drawY + size / 2 + 2, size / 2 - 4, 2);
      ctx.fillRect(x + (3 * size) / 4 + 2, drawY + size / 2 + 2, size / 4 - 4, 2);

    } else if (type === 'ground') {
      const topColor = isUnderground ? '#2563EB' : '#15803D';
      const baseColor = isUnderground ? '#0F172A' : '#92400E';
      const speckColor = isUnderground ? '#1E293B' : '#78350F';

      ctx.fillStyle = baseColor;
      ctx.fillRect(x, drawY, size, size);

      ctx.fillStyle = speckColor;
      ctx.fillRect(x + 4, drawY + 8, 3, 3);
      ctx.fillRect(x + 18, drawY + 12, 4, 3);
      ctx.fillRect(x + 10, drawY + 20, 3, 3);
      ctx.fillRect(x + 22, drawY + 24, 3, 2);

      ctx.fillStyle = topColor;
      ctx.fillRect(x, drawY, size, 5);

      ctx.beginPath();
      ctx.moveTo(x + 2, drawY + 5);
      ctx.lineTo(x + 5, drawY + 8);
      ctx.lineTo(x + 8, drawY + 5);
      ctx.moveTo(x + 14, drawY + 5);
      ctx.lineTo(x + 17, drawY + 9);
      ctx.lineTo(x + 20, drawY + 5);
      ctx.moveTo(x + 24, drawY + 5);
      ctx.lineTo(x + 27, drawY + 7);
      ctx.lineTo(x + 30, drawY + 5);
      ctx.fill();

    } else if (type === 'stone') {
      ctx.fillStyle = '#64748B';
      ctx.fillRect(x, drawY, size, size);

      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 1, drawY + 1, size - 2, size - 2);

      ctx.fillStyle = '#334155';
      ctx.fillRect(x + size - 3, drawY + 2, 2, size - 3);
      ctx.fillRect(x + 2, drawY + size - 3, size - 3, 2);

    } else if (type === 'lava') {
      const wave = Math.sin(time * 6 + x * 0.1) * 3;
      const grad = ctx.createLinearGradient(x, drawY, x, drawY + size);
      grad.addColorStop(0, '#FEF08A');
      grad.addColorStop(0.3, '#F97316');
      grad.addColorStop(0.8, '#DC2626');
      grad.addColorStop(1, '#7F1D1D');

      ctx.fillStyle = grad;
      ctx.fillRect(x, drawY + wave, size, size - wave);

      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(x + 4, drawY + wave + 2, 4, 3);
      ctx.fillRect(x + 18, drawY + wave + 4, 5, 2);

    } else if (type.startsWith('pipe_')) {
      const grad = ctx.createLinearGradient(x, drawY, x + size, drawY);
      grad.addColorStop(0, '#15803D');
      grad.addColorStop(0.3, '#22C55E');
      grad.addColorStop(0.7, '#16A34A');
      grad.addColorStop(1, '#14532D');

      ctx.fillStyle = grad;
      ctx.fillRect(x, drawY, size, size);

      ctx.strokeStyle = '#052E16';
      ctx.lineWidth = 1.5;

      if (type === 'pipe_top_left') {
        ctx.strokeRect(x, drawY, size + 2, size);
        ctx.fillStyle = '#052E16';
        ctx.fillRect(x + 3, drawY + 1, size - 3, 3);
      } else if (type === 'pipe_top_right') {
        ctx.strokeRect(x - 2, drawY, size + 2, size);
        ctx.fillStyle = '#052E16';
        ctx.fillRect(x, drawY + 1, size - 3, 3);
      } else {
        ctx.strokeRect(x + (type.includes('left') ? 2 : 0), drawY, size - 2, size);
      }
    }

    ctx.restore();
  }

  public static drawItem(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    type: string,
    time: number
  ) {
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);

    if (type === 'coin') {
      const spin = Math.sin(time * 6);
      const coinWidth = Math.abs(spin) * (width * 0.42) + 2;

      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 6;

      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.max(2, coinWidth), height * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.max(1, coinWidth * 0.6), height * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 'mushroom') {
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.roundRect(-5, 0, 10, 8, 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.fillRect(-3, 2, 1.8, 3);
      ctx.fillRect(1.2, 2, 1.8, 3);

      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(0, -1, 9, Math.PI, 0);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, -5, 3.5, 0, Math.PI * 2);
      ctx.arc(-7, -1, 2.5, 0, Math.PI * 2);
      ctx.arc(7, -1, 2.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === '1up') {
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.roundRect(-5, 0, 10, 8, 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.fillRect(-3, 2, 1.8, 3);
      ctx.fillRect(1.2, 2, 1.8, 3);

      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.arc(0, -1, 9, Math.PI, 0);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, -5, 3.5, 0, Math.PI * 2);
      ctx.arc(-7, -1, 2.5, 0, Math.PI * 2);
      ctx.arc(7, -1, 2.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 'flower') {
      const phase = Math.floor(time * 6) % 3;
      const petalColors = ['#EA580C', '#FACC15', '#FFFFFF'];

      ctx.fillStyle = '#15803D';
      ctx.fillRect(-1.5, 0, 3, 9);
      ctx.beginPath();
      ctx.ellipse(-4, 4, 3.5, 1.5, -0.4, 0, Math.PI * 2);
      ctx.ellipse(4, 4, 3.5, 1.5, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = petalColors[phase];
      ctx.beginPath();
      ctx.arc(0, -5, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = petalColors[(phase + 1) % 3];
      ctx.beginPath();
      ctx.arc(0, -5, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.fillRect(-2, -6, 1.5, 3);
      ctx.fillRect(0.5, -6, 1.5, 3);

    } else if (type === 'star') {
      const hue = (time * 300) % 360;
      ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
      ctx.shadowBlur = 10;

      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const xOut = Math.cos(outerAngle) * 9;
        const yOut = Math.sin(outerAngle) * 9;
        if (i === 0) ctx.moveTo(xOut, yOut);
        else ctx.lineTo(xOut, yOut);
      }
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.fillRect(-2, -2, 1.5, 3);
      ctx.fillRect(0.5, -2, 1.5, 3);
    }

    ctx.restore();
  }

  public static drawFireball(ctx: CanvasRenderingContext2D, x: number, y: number, rotation: number) {
    ctx.save();
    ctx.translate(x + 5, y + 5);
    ctx.rotate(rotation);

    ctx.shadowColor = '#F97316';
    ctx.shadowBlur = 10;

    const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, 6);
    grad.addColorStop(0, '#FEF08A');
    grad.addColorStop(0.4, '#F97316');
    grad.addColorStop(1, '#DC2626');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FDE047';
    ctx.fillRect(-2, -6, 2, 2);
    ctx.fillRect(3, 1, 2, 2);
    ctx.fillRect(-5, 2, 2, 2);

    ctx.restore();
  }

  public static drawFlagpoleAndCastle(
    ctx: CanvasRenderingContext2D,
    poleX: number,
    baseY: number,
    poleHeight: number,
    flagY: number,
    castleX: number,
    castleY: number,
    time: number
  ) {
    ctx.save();

    // 1. Flagpole Base block resting directly on ground
    ctx.fillStyle = '#15803D';
    ctx.fillRect(poleX - 6, baseY - 16, 20, 16);
    ctx.strokeStyle = '#052E16';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(poleX - 6, baseY - 16, 20, 16);

    // 2. Pole Mast
    const poleGrad = ctx.createLinearGradient(poleX, baseY - poleHeight, poleX + 8, baseY);
    poleGrad.addColorStop(0, '#E2E8F0');
    poleGrad.addColorStop(0.5, '#94A3B8');
    poleGrad.addColorStop(1, '#475569');

    ctx.fillStyle = poleGrad;
    ctx.fillRect(poleX + 1, baseY - poleHeight, 6, poleHeight - 16);

    ctx.fillStyle = '#FBBF24';
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(poleX + 4, baseY - poleHeight, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 3. Sliding Flag
    const currentFlagY = flagY;
    ctx.fillStyle = '#16A34A';
    ctx.beginPath();
    ctx.moveTo(poleX + 1, currentFlagY);
    ctx.lineTo(poleX - 22, currentFlagY + 9);
    ctx.lineTo(poleX + 1, currentFlagY + 18);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(poleX - 7, currentFlagY + 9, 3, 0, Math.PI * 2);
    ctx.fill();

    // 4. Castle resting directly on ground
    const cWidth = 140;
    const cHeight = 120;
    const cDrawY = baseY - cHeight;

    ctx.fillStyle = '#991B1B';
    ctx.fillRect(castleX, cDrawY, cWidth, cHeight);

    ctx.strokeStyle = '#450A0A';
    ctx.lineWidth = 2;
    ctx.strokeRect(castleX, cDrawY, cWidth, cHeight);

    const crenWidth = 20;
    for (let bx = 0; bx < cWidth; bx += crenWidth * 1.5) {
      ctx.fillRect(castleX + bx, cDrawY - 14, crenWidth, 14);
      ctx.strokeRect(castleX + bx, cDrawY - 14, crenWidth, 14);
    }

    const keepX = castleX + 40;
    const keepWidth = 60;
    const keepHeight = 50;
    const keepY = cDrawY - keepHeight;

    ctx.fillStyle = '#991B1B';
    ctx.fillRect(keepX, keepY, keepWidth, keepHeight);
    ctx.strokeRect(keepX, keepY, keepWidth, keepHeight);

    ctx.fillStyle = '#DC2626';
    for (let bx = 0; bx < keepWidth; bx += 18) {
      ctx.fillRect(keepX + bx, keepY - 10, 12, 10);
      ctx.strokeRect(keepX + bx, keepY - 10, 12, 10);
    }

    ctx.fillStyle = '#0F172A';
    const doorWidth = 40;
    const doorHeight = 48;
    ctx.beginPath();
    ctx.roundRect(castleX + 50, baseY - doorHeight, doorWidth, doorHeight, [16, 16, 0, 0]);
    ctx.fill();

    const flagWave = Math.sin(time * 5) * 3;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(keepX + 28, keepY - 32, 3, 22);

    ctx.fillStyle = '#E11D48';
    ctx.beginPath();
    ctx.moveTo(keepX + 31, keepY - 32);
    ctx.lineTo(keepX + 48, keepY - 26 + flagWave);
    ctx.lineTo(keepX + 31, keepY - 20);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draws a checkpoint pole and animated flag, perfectly anchored at ground level (groundY).
   */
  public static drawCheckpoint(
    ctx: CanvasRenderingContext2D,
    x: number,
    groundY: number,
    passed: boolean,
    time: number
  ) {
    ctx.save();
    ctx.translate(x, groundY);

    // 1. Base plate resting directly on top of the ground block
    ctx.fillStyle = '#334155';
    ctx.fillRect(-6, -6, 20, 6);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-6, -6, 20, 6);

    // 2. Pole Mast rising up 50px from ground
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(2, -56, 4, 50);

    // 3. Golden / Cyan Orb at top
    ctx.fillStyle = passed ? '#38BDF8' : '#64748B';
    if (passed) {
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 10;
    }
    ctx.beginPath();
    ctx.arc(4, -58, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Animated Flag
    const wave = Math.sin(time * 6) * 3;
    ctx.fillStyle = passed ? '#10B981' : '#64748B';
    if (passed) {
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 10;
    }
    ctx.beginPath();
    ctx.moveTo(6, -56);
    ctx.lineTo(26, -46 + wave);
    ctx.lineTo(6, -36);
    ctx.closePath();
    ctx.fill();

    // Checkpoint flag lettering
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 6px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CP', 13, -46 + wave * 0.5);

    ctx.restore();
  }

  /**
   * Draws HD background with parallax sky, clouds, rolling green hills, and bushes.
   * All hills, bushes, and castle backdrops sit EXACTLY flush on top of the ground line (groundY = 416).
   */
  public static drawBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cameraX: number,
    isUnderground: boolean,
    time: number,
    theme: 'overworld' | 'underground' | 'castle' = 'overworld'
  ) {
    const groundY = 416; // Level Ground Top Y

    if (theme === 'castle') {
      const castleGrad = ctx.createLinearGradient(0, 0, 0, height);
      castleGrad.addColorStop(0, '#0F0505');
      castleGrad.addColorStop(0.65, '#2D0A0A');
      castleGrad.addColorStop(0.9, '#450A0A');
      castleGrad.addColorStop(1, '#7F1D1D');
      ctx.fillStyle = castleGrad;
      ctx.fillRect(0, 0, width, height);

      // Castle stone pillars meeting the ground line exactly
      ctx.fillStyle = '#1A0C0C';
      for (let i = 0; i < 8; i++) {
        const px = ((i * 220 - cameraX * 0.25) % (width + 300)) - 60;
        ctx.fillRect(px, 30, 24, groundY - 30);
        ctx.fillRect(px - 10, 30, 44, 16);
      }

      ctx.fillStyle = '#F59E0B';
      for (let i = 0; i < 15; i++) {
        const emberX = ((i * 73 + time * 20 - cameraX * 0.4) % (width + 50)) - 20;
        const emberY = groundY - ((time * 40 + i * 45) % (groundY * 0.7));
        ctx.beginPath();
        ctx.arc(emberX, emberY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    if (isUnderground || theme === 'underground') {
      const caveGrad = ctx.createLinearGradient(0, 0, 0, height);
      caveGrad.addColorStop(0, '#020617');
      caveGrad.addColorStop(0.7, '#0F172A');
      caveGrad.addColorStop(1, '#020617');
      ctx.fillStyle = caveGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#1E293B';
      for (let i = 0; i < 6; i++) {
        const px = ((i * 180 - cameraX * 0.2) % (width + 200)) - 50;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px + 18, 45 + (i % 3) * 15);
        ctx.lineTo(px + 36, 0);
        ctx.fill();
      }
      return;
    }

    // 1. Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#38BDF8');
    skyGrad.addColorStop(0.5, '#7DD3FC');
    skyGrad.addColorStop(0.85, '#BAE6FD');
    skyGrad.addColorStop(1, '#E0F2FE');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Parallax Cloud Layers
    const cloudSpeed1 = cameraX * 0.15 + time * 6;
    const cloudSpeed2 = cameraX * 0.25 + time * 12;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    this.renderCloudPuffs(ctx, 100 - (cloudSpeed1 % (width + 300)), 50, 1.4);
    this.renderCloudPuffs(ctx, 420 - (cloudSpeed1 % (width + 300)), 75, 1.1);
    this.renderCloudPuffs(ctx, 780 - (cloudSpeed1 % (width + 300)), 40, 1.6);

    ctx.fillStyle = '#FFFFFF';
    this.renderCloudPuffs(ctx, 220 - (cloudSpeed2 % (width + 250)), 90, 1.0);
    this.renderCloudPuffs(ctx, 580 - (cloudSpeed2 % (width + 250)), 65, 1.25);
    this.renderCloudPuffs(ctx, 920 - (cloudSpeed2 % (width + 250)), 85, 1.1);

    // 3. Parallax Rolling Green Hills - Flush on Ground line (groundY = 416)
    const hillParallax = cameraX * 0.35;
    ctx.fillStyle = '#166534';
    for (let i = 0; i < 8; i++) {
      const hx = i * 450 - (hillParallax % (450 * 8));
      ctx.beginPath();
      ctx.ellipse(hx, groundY, 180, 120, 0, Math.PI, 0);
      ctx.fill();

      ctx.fillStyle = '#15803D';
      ctx.beginPath();
      ctx.ellipse(hx, groundY, 160, 105, 0, Math.PI, 0);
      ctx.fill();

      // Hill cartoon eyes
      ctx.fillStyle = '#052E16';
      ctx.fillRect(hx - 12, groundY - 75, 3, 9);
      ctx.fillRect(hx + 8, groundY - 75, 3, 9);
      ctx.fillStyle = '#166534';
    }

    // 4. Foreground Bushes - Resting precisely on top of the ground line (groundY = 416)
    const bushParallax = cameraX * 0.65;
    for (let i = 0; i < 10; i++) {
      const bx = i * 360 - (bushParallax % (360 * 10));
      this.renderBush(ctx, bx, groundY);
    }
  }

  private static renderCloudPuffs(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.arc(22, -6, 26, 0, Math.PI * 2);
    ctx.arc(48, -4, 22, 0, Math.PI * 2);
    ctx.arc(70, 2, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0369A1';
    ctx.fillRect(26, -2, 2.5, 7);
    ctx.fillRect(40, -2, 2.5, 7);

    ctx.restore();
  }

  private static renderBush(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
    ctx.save();
    ctx.translate(x, groundY);

    ctx.fillStyle = '#16A34A';
    ctx.beginPath();
    ctx.arc(0, 0, 18, Math.PI, 0);
    ctx.arc(20, -5, 22, Math.PI, 0);
    ctx.arc(42, 0, 18, Math.PI, 0);
    ctx.lineTo(42, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#4ADE80';
    ctx.beginPath();
    ctx.arc(0, 0, 14, Math.PI, 0);
    ctx.arc(20, -5, 18, Math.PI, 0);
    ctx.arc(42, 0, 14, Math.PI, 0);
    ctx.lineTo(42, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
