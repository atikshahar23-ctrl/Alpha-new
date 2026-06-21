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
  let dpr = 1;
  let raf = 0;
  const lines: FlowLine[] = [];
  const particles: Particle[] = [];
  const hexes: HexGrid[] = [];
  const isMob = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
  const LINE_COUNT = isMob ? 8 : 16;
  const PARTICLE_COUNT = isMob ? 28 : 80;
  const HEX_COUNT = isMob ? 10 : 24;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    const cw = window.innerWidth;
    const ch = window.innerHeight;
    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    w = cw;
    h = ch;
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
      const isWhite = i % 3 === 0;
      const isRose = i % 5 === 0;
      lines.push({
        points,
        speed: 0.08 + Math.random() * 0.2,
        offset: Math.random() * Math.PI * 2,
        width: 0.5 + Math.random() * 1.8,
        opacity: 0.03 + Math.random() * 0.06,
        hue: isRose ? 25 : isWhite ? 45 : 38 + Math.random() * 10,
        sat: isWhite ? 30 : 70,
        light: isWhite ? 85 : isRose ? 65 : 60,
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
        opacity: 0.015 + Math.random() * 0.025,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function spawnParticle() {
    const maxLife = 200 + Math.random() * 400;
    const kind = Math.random();
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -0.08 - Math.random() * 0.35,
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.08 + Math.random() * 0.15,
      hue: kind > 0.7 ? 45 : 38,
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
    const yOff = wave * 30 + wave2 * 15;

    const startX = pts[0].x;
    const startY = pts[0].y + yOff;
    ctx.moveTo(startX, startY);

    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const localWave = Math.sin(t * line.speed * 1.3 + line.offset + i * 0.8) * 20;
      const cpx = (curr.x + next.x) / 2;
      const cpy = (curr.y + next.y) / 2 + yOff + localWave;
      ctx.quadraticCurveTo(curr.x, curr.y + yOff + localWave * 0.5, cpx, cpy);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y + yOff);

    const passes = isMob ? 2 : 4;
    for (let pass = 0; pass < passes; pass++) {
      const mult = [5, 3, 1.5, 0.5][pass];
      const opMult = [0.08, 0.2, 0.5, 1][pass];
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

    const pulse = Math.sin(t * 0.25) * 0.3 + 0.5;
    const grd = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.6);
    grd.addColorStop(0, `rgba(218, 165, 32, ${0.012 * pulse})`);
    grd.addColorStop(0.4, `rgba(245, 230, 200, ${0.006 * pulse})`);
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    for (const hex of hexes) {
      const hop = hex.opacity * (0.5 + Math.sin(t * 0.4 + hex.phase) * 0.5);
      ctx.strokeStyle = `rgba(218, 165, 32, ${hop})`;
      ctx.lineWidth = 0.5;
      drawHex(hex.x, hex.y, hex.size);
      ctx.stroke();
    }

    for (const line of lines) {
      drawLine(line, t);
    }

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
      glow.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${p.opacity * fade})`);
      glow.addColorStop(0.5, `hsla(${p.hue}, 70%, 60%, ${p.opacity * fade * 0.25})`);
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
