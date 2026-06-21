interface FlowLine {
  points: { x: number; y: number }[];
  speed: number;
  offset: number;
  width: number;
  opacity: number;
  hue: number;
  sat: number;
  light: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
  life: number;
  maxLife: number;
}

interface HexGrid {
  x: number;
  y: number;
  size: number;
  opacity: number;
  phase: number;
}

export function mountFlowLines(container: HTMLElement): { dispose: () => void } {
  const canvas = document.createElement('canvas');
  canvas.className = 'flow-bg';
  container.prepend(canvas);
  const ctx = canvas.getContext('2d')!;

  let w = 0, h = 0;
  let raf = 0;
  const lines: FlowLine[] = [];
  const particles: Particle[] = [];
  const hexes: HexGrid[] = [];
  const isMob = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
  const LINE_COUNT = isMob ? 6 : 14;
  const PARTICLE_COUNT = isMob ? 20 : 60;
  const HEX_COUNT = isMob ? 8 : 20;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    if (lines.length === 0) init();
  }

  function init() {
    lines.length = 0;
    particles.length = 0;
    hexes.length = 0;

    for (let i = 0; i < LINE_COUNT; i++) {
      const numPoints = 6 + Math.floor(Math.random() * 4);
      const points: { x: number; y: number }[] = [];
      const baseY = h * (0.1 + Math.random() * 0.8);
      for (let j = 0; j < numPoints; j++) {
        points.push({
          x: (j / (numPoints - 1)) * (w + 600) - 300,
          y: baseY + (Math.random() - 0.5) * h * 0.4,
        });
      }
      const isGold = i % 4 === 0;
      const isPurple = i % 5 === 0;
      lines.push({
        points,
        speed: 0.1 + Math.random() * 0.3,
        offset: Math.random() * Math.PI * 2,
        width: 0.5 + Math.random() * 2,
        opacity: 0.04 + Math.random() * 0.1,
        hue: isPurple ? 270 : isGold ? 38 : 185 + Math.random() * 20,
        sat: isGold ? 100 : 80,
        light: isGold ? 65 : isPurple ? 60 : 65,
      });
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      spawnParticle();
    }

    for (let i = 0; i < HEX_COUNT; i++) {
      hexes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 15 + Math.random() * 40,
        opacity: 0.02 + Math.random() * 0.04,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function spawnParticle() {
    const maxLife = 200 + Math.random() * 400;
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.1 - Math.random() * 0.5,
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.1 + Math.random() * 0.2,
      hue: Math.random() > 0.7 ? 38 : 190,
      life: 0,
      maxLife,
    });
  }

  function drawHex(cx: number, cy: number, r: number) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function drawLine(line: FlowLine, t: number) {
    const pts = line.points;
    const wave = Math.sin(t * line.speed + line.offset);
    const wave2 = Math.cos(t * line.speed * 0.7 + line.offset + 1.5);

    ctx.beginPath();
    const yOff = wave * 35 + wave2 * 18;

    const startX = pts[0].x;
    const startY = pts[0].y + yOff;
    ctx.moveTo(startX, startY);

    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const localWave = Math.sin(t * line.speed * 1.3 + line.offset + i * 0.8) * 25;
      const cpx = (curr.x + next.x) / 2;
      const cpy = (curr.y + next.y) / 2 + yOff + localWave;
      ctx.quadraticCurveTo(curr.x, curr.y + yOff + localWave * 0.5, cpx, cpy);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y + yOff);

    const passes = isMob ? 2 : 4;
    for (let pass = 0; pass < passes; pass++) {
      const mult = [5, 3, 1.5, 0.5][pass];
      const opMult = [0.1, 0.25, 0.6, 1][pass];
      ctx.lineWidth = line.width * mult;
      ctx.strokeStyle = `hsla(${line.hue}, ${line.sat}%, ${line.light}%, ${line.opacity * opMult})`;
      ctx.stroke();
    }
  }

  let startTime = 0;
  function frame(ts: number) {
    raf = requestAnimationFrame(frame);
    if (!startTime) startTime = ts;
    const t = (ts - startTime) / 1000;

    ctx.clearRect(0, 0, w, h);

    // Subtle radial gradient background pulse
    const pulse = Math.sin(t * 0.3) * 0.3 + 0.5;
    const grd = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.6);
    grd.addColorStop(0, `rgba(95, 230, 255, ${0.015 * pulse})`);
    grd.addColorStop(0.4, `rgba(255, 194, 77, ${0.008 * pulse})`);
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // Hexagonal grid
    for (const hex of hexes) {
      const hop = hex.opacity * (0.5 + Math.sin(t * 0.5 + hex.phase) * 0.5);
      ctx.strokeStyle = `rgba(95, 230, 255, ${hop})`;
      ctx.lineWidth = 0.5;
      drawHex(hex.x, hex.y, hex.size);
      ctx.stroke();
    }

    // Flow lines
    for (const line of lines) {
      drawLine(line, t);
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      const lifeRatio = p.life / p.maxLife;
      const fade = lifeRatio < 0.1 ? lifeRatio / 0.1 : lifeRatio > 0.8 ? (1 - lifeRatio) / 0.2 : 1;

      if (p.life >= p.maxLife || p.y < -10 || p.x < -10 || p.x > w + 10) {
        particles.splice(i, 1);
        spawnParticle();
        continue;
      }

      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      glow.addColorStop(0, `hsla(${p.hue}, 90%, 70%, ${p.opacity * fade})`);
      glow.addColorStop(0.5, `hsla(${p.hue}, 90%, 60%, ${p.opacity * fade * 0.3})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(p.x - p.size * 3, p.y - p.size * 3, p.size * 6, p.size * 6);
    }
  }

  resize();
  window.addEventListener('resize', resize);
  raf = requestAnimationFrame(frame);

  return {
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.remove();
    },
  };
}
