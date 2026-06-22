// GTA-level cinematic 2D canvas background.
// Warm/gold theme preserved: gold (#daa520 -> hue ~43), pearl/champagne whites, warm obsidian.
// Layers (back -> front): bg gradient, star field, nebula clouds, perspective floor grid,
// hex grid (filled + connections), flow lines (multi-pass glow), particles (trails + glow).

interface FlowLine {
  points: { x: number; y: number }[];
  speed: number;
  offset: number;
  width: number;
  opacity: number;
  hue: number;
  sat: number;
  light: number;
  depth: number;
  dashPhase: number;
  dashSpeed: number;
  pulsePhase: number;
  pulseSpeed: number;
}

// Particle "kinds": 0 = small fast, 1 = medium orbiting, 2 = large slow ambient.
interface Particle {
  x: number;
  y: number;
  px: number; // previous x (for trail)
  py: number; // previous y
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  opacity: number;
  hue: number;
  sat: number;
  light: number;
  life: number;
  maxLife: number;
  depth: number;
  kind: number;
  pulsePhase: number;
  pulseSpeed: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitPhase: number;
  ox: number; // orbit anchor
  oy: number;
}

interface HexCell {
  x: number;
  y: number;
  size: number;
  opacity: number;
  phase: number;
  waveDist: number; // distance used for cross-screen pulse wave
  neighbors: number[]; // indices of nearby hexes for connecting lines
}

interface NebulaCloud {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  baseRadius: number;
  opacity: number;
  hue: number;
  driftX: number;
  driftY: number;
  driftPhaseX: number;
  driftPhaseY: number;
  scalePhase: number;
  scaleSpeed: number;
  depth: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  twinklePhase: number;
  twinkleSpeed: number;
  warm: number; // 0 = pearl white, 1 = warm gold
  depth: number;
}

export function mountFlowLines(container: HTMLElement): { dispose: () => void } {
  const canvas = document.createElement('canvas');
  canvas.className = 'flow-bg';
  container.prepend(canvas);
  const ctx = canvas.getContext('2d')!;

  let w = 0, h = 0;
  let dpr = 1;
  let raf = 0;

  // Raw mouse target and smoothed (lerped) values for parallax.
  let fMouseTX = 0, fMouseTY = 0;
  let fMouseX = 0, fMouseY = 0;
  const onFlowMouse = (e: MouseEvent) => {
    fMouseTX = (e.clientX / window.innerWidth - 0.5) * 2;
    fMouseTY = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('mousemove', onFlowMouse);

  const lines: FlowLine[] = [];
  const particles: Particle[] = [];
  const hexes: HexCell[] = [];
  const nebulas: NebulaCloud[] = [];
  const stars: Star[] = [];

  const isMob = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
  const LINE_COUNT = isMob ? 14 : 28;
  const PARTICLE_COUNT = isMob ? 50 : 160;
  const HEX_COUNT = isMob ? 16 : 40;
  const NEBULA_COUNT = isMob ? 5 : 8;
  const STAR_COUNT = isMob ? 80 : 200;

  // Warm palette anchors (hue/sat/light triples for hsl).
  // GOLD ~ #daa520, CHAMPAGNE soft amber, PEARL warm white.
  const HUE_GOLD = 43;
  const HUE_AMBER = 33;
  const HUE_CHAMPAGNE = 45;

  // ---- Reusable scratch (avoid per-frame allocations where possible) ----
  const TWO_PI = Math.PI * 2;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const cw = window.innerWidth;
    const ch = window.innerHeight;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const first = lines.length === 0;
    w = cw;
    h = ch;
    if (first) init();
    else relayout();
  }

  // Reposition layout-dependent elements on resize without losing animation state.
  function relayout() {
    buildHexGrid();
  }

  function init() {
    lines.length = 0;
    particles.length = 0;
    hexes.length = 0;
    nebulas.length = 0;
    stars.length = 0;

    // ---- Flow lines ----
    for (let i = 0; i < LINE_COUNT; i++) {
      const numPoints = 10 + Math.floor(Math.random() * 5); // 10-14
      const points: { x: number; y: number }[] = [];
      const baseY = h * (0.05 + Math.random() * 0.9);
      const sway = h * (0.12 + Math.random() * 0.28);
      // Smooth organic vertical drift using layered sines per control point.
      const phaseA = Math.random() * TWO_PI;
      const phaseB = Math.random() * TWO_PI;
      for (let j = 0; j < numPoints; j++) {
        const f = j / (numPoints - 1);
        const y = baseY +
          Math.sin(f * Math.PI * 1.6 + phaseA) * sway +
          Math.sin(f * Math.PI * 3.3 + phaseB) * sway * 0.35;
        points.push({ x: f * (w + 700) - 350, y });
      }
      const tone = i % 4;
      const isPearl = tone === 0;
      const isAmber = tone === 2;
      lines.push({
        points,
        speed: 0.08 + Math.random() * 0.22,
        offset: Math.random() * TWO_PI,
        width: 0.5 + Math.random() * 1.9,
        opacity: 0.025 + Math.random() * 0.06,
        hue: isAmber ? HUE_AMBER : isPearl ? HUE_CHAMPAGNE : HUE_GOLD + Math.random() * 6,
        sat: isPearl ? 28 : isAmber ? 75 : 68,
        light: isPearl ? 86 : isAmber ? 62 : 60,
        depth: 0.3 + Math.random() * 1.5,
        dashPhase: Math.random() * 100,
        dashSpeed: 18 + Math.random() * 40,
        pulsePhase: Math.random() * TWO_PI,
        pulseSpeed: 0.4 + Math.random() * 0.9,
      });
    }

    // ---- Particles ----
    for (let i = 0; i < PARTICLE_COUNT; i++) spawnParticle();

    // ---- Hex grid ----
    buildHexGrid();

    // ---- Nebula clouds ----
    for (let i = 0; i < NEBULA_COUNT; i++) {
      const baseR = (isMob ? 220 : 320) + Math.random() * (isMob ? 260 : 420);
      const bx = Math.random() * w;
      const by = Math.random() * h;
      nebulas.push({
        x: bx, y: by, baseX: bx, baseY: by,
        radius: baseR, baseRadius: baseR,
        opacity: 0.008 + Math.random() * 0.012,
        hue: Math.random() < 0.5 ? HUE_GOLD : HUE_AMBER,
        driftX: 60 + Math.random() * 140,
        driftY: 40 + Math.random() * 100,
        driftPhaseX: Math.random() * TWO_PI,
        driftPhaseY: Math.random() * TWO_PI,
        scalePhase: Math.random() * TWO_PI,
        scaleSpeed: 0.04 + Math.random() * 0.08,
        depth: 0.15 + Math.random() * 0.5,
      });
    }

    // ---- Star field ----
    for (let i = 0; i < STAR_COUNT; i++) {
      const lvl = Math.random();
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: lvl > 0.92 ? 1.6 : lvl > 0.6 ? 1.0 : 0.6,
        baseOpacity: lvl > 0.92 ? 0.5 : lvl > 0.6 ? 0.32 : 0.18,
        twinklePhase: Math.random() * TWO_PI,
        twinkleSpeed: 0.5 + Math.random() * 2.2,
        warm: Math.random() < 0.4 ? 1 : 0,
        depth: 0.1 + Math.random() * 0.6,
      });
    }
  }

  function buildHexGrid() {
    hexes.length = 0;
    // Loose scattered grid: jittered rows/cols so connections look organic.
    const cols = Math.ceil(Math.sqrt(HEX_COUNT * (w / Math.max(h, 1)))) + 1;
    const rows = Math.ceil(HEX_COUNT / Math.max(cols - 1, 1)) + 1;
    const cellW = w / (cols - 1);
    const cellH = h / (rows - 1);
    let placed = 0;
    for (let r = 0; r < rows && placed < HEX_COUNT; r++) {
      for (let c = 0; c < cols && placed < HEX_COUNT; c++) {
        const jx = (Math.random() - 0.5) * cellW * 0.6;
        const jy = (Math.random() - 0.5) * cellH * 0.6;
        const x = c * cellW + jx + (r % 2) * cellW * 0.5;
        const y = r * cellH + jy;
        hexes.push({
          x, y,
          size: 16 + Math.random() * 42,
          opacity: 0.014 + Math.random() * 0.026,
          phase: Math.random() * TWO_PI,
          waveDist: x + y, // diagonal sweep
          neighbors: [],
        });
        placed++;
      }
    }
    // Precompute neighbor connections (within distance threshold), once.
    const maxDist = Math.min(w, h) * 0.22 + 120;
    const maxDist2 = maxDist * maxDist;
    for (let i = 0; i < hexes.length; i++) {
      const a = hexes[i];
      for (let j = i + 1; j < hexes.length; j++) {
        const b = hexes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        if (dx * dx + dy * dy < maxDist2) a.neighbors.push(j);
      }
    }
  }

  function spawnParticle() {
    const roll = Math.random();
    // distribution: ~55% small fast, ~30% medium orbiting, ~15% large slow ambient
    const kind = roll < 0.55 ? 0 : roll < 0.85 ? 1 : 2;
    const depth = 0.2 + Math.random() * 1.6;
    const x = Math.random() * w;
    const y = Math.random() * h;

    let vx: number, vy: number, baseSize: number, opacity: number, maxLife: number;
    let orbitRadius = 0, orbitSpeed = 0;
    if (kind === 0) {
      vx = (Math.random() - 0.5) * 0.9;
      vy = -0.25 - Math.random() * 0.7;
      baseSize = 0.5 + Math.random() * 1.1;
      opacity = 0.1 + Math.random() * 0.16;
      maxLife = 140 + Math.random() * 260;
    } else if (kind === 1) {
      vx = (Math.random() - 0.5) * 0.25;
      vy = -0.05 - Math.random() * 0.2;
      baseSize = 1.4 + Math.random() * 1.8;
      opacity = 0.08 + Math.random() * 0.14;
      maxLife = 300 + Math.random() * 400;
      orbitRadius = 6 + Math.random() * 18;
      orbitSpeed = (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * 1.1);
    } else {
      vx = (Math.random() - 0.5) * 0.12;
      vy = -0.02 - Math.random() * 0.08;
      baseSize = 3.0 + Math.random() * 4.5;
      opacity = 0.04 + Math.random() * 0.07;
      maxLife = 500 + Math.random() * 600;
    }

    const sizeDepth = 0.5 + depth * 0.4;
    const warm = Math.random();
    particles.push({
      x, y, px: x, py: y, vx, vy,
      size: baseSize * sizeDepth,
      baseSize: baseSize * sizeDepth,
      opacity: opacity * (0.4 + depth * 0.4),
      hue: warm > 0.7 ? HUE_CHAMPAGNE : warm > 0.35 ? HUE_GOLD : HUE_AMBER,
      sat: warm > 0.7 ? 40 : 78,
      light: warm > 0.7 ? 82 : 66,
      life: 0,
      maxLife,
      depth,
      kind,
      pulsePhase: Math.random() * TWO_PI,
      pulseSpeed: 0.6 + Math.random() * 1.8,
      orbitRadius,
      orbitSpeed,
      orbitPhase: Math.random() * TWO_PI,
      ox: x,
      oy: y,
    });
  }

  function hexPath(cx: number, cy: number, r: number) {
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

  // Build the wavy stroke path for a flow line into the current ctx path.
  function buildLinePath(line: FlowLine, t: number, parallaxX: number, yOff: number) {
    const pts = line.points;
    ctx.beginPath();
    ctx.moveTo(pts[0].x + parallaxX, pts[0].y + yOff);
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const localWave = Math.sin(t * line.speed * 1.3 + line.offset + i * 0.8) * 22;
      const cpx = (curr.x + next.x) / 2 + parallaxX;
      const cpy = (curr.y + next.y) / 2 + yOff + localWave;
      ctx.quadraticCurveTo(curr.x + parallaxX, curr.y + yOff + localWave * 0.5, cpx, cpy);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x + parallaxX, last.y + yOff);
  }

  function drawLine(line: FlowLine, t: number) {
    const wave = Math.sin(t * line.speed + line.offset);
    const wave2 = Math.cos(t * line.speed * 0.7 + line.offset + 1.5);
    const parallaxX = fMouseX * line.depth * 28;
    const parallaxY = fMouseY * line.depth * 20;
    const yOff = wave * 32 + wave2 * 16 + parallaxY;

    // Traveling brightness pulse along the line (boosts overall opacity rhythmically).
    const pulse = 0.65 + 0.35 * Math.sin(t * line.pulseSpeed + line.pulsePhase);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 6-pass cinematic glow: wide soft -> tight bright core.
    const PASSES = 6;
    // multipliers for width and opacity per pass (outer..inner)
    const widthMul = [7.5, 5.0, 3.2, 2.0, 1.1, 0.55];
    const opMul = [0.05, 0.09, 0.16, 0.3, 0.6, 1.0];

    for (let pass = 0; pass < PASSES; pass++) {
      buildLinePath(line, t, parallaxX, yOff);
      ctx.lineWidth = line.width * widthMul[pass];
      const a = line.opacity * opMul[pass] * pulse;
      // Inner passes are brighter/whiter for an energized core.
      const lightBoost = pass >= 4 ? 12 : pass >= 3 ? 6 : 0;
      ctx.strokeStyle = `hsla(${line.hue}, ${line.sat}%, ${Math.min(line.light + lightBoost, 95)}%, ${a})`;

      // Animated dash on the bright inner passes only (energy flowing through).
      if (pass >= 4) {
        const dashOn = 14 + line.width * 6;
        const dashOff = 22 + line.width * 8;
        ctx.setLineDash([dashOn, dashOff]);
        ctx.lineDashOffset = -(t * line.dashSpeed + line.dashPhase * 10);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  function drawNebula(n: NebulaCloud, t: number) {
    const px = fMouseX * n.depth * 30;
    const py = fMouseY * n.depth * 24;
    n.x = n.baseX + Math.sin(t * 0.06 + n.driftPhaseX) * n.driftX + px;
    n.y = n.baseY + Math.cos(t * 0.045 + n.driftPhaseY) * n.driftY + py;
    const scale = 1 + Math.sin(t * n.scaleSpeed + n.scalePhase) * 0.22;
    n.radius = n.baseRadius * scale;
    const op = n.opacity * (0.7 + 0.3 * Math.sin(t * 0.1 + n.scalePhase));

    const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
    g.addColorStop(0, `hsla(${n.hue}, 70%, 60%, ${op})`);
    g.addColorStop(0.45, `hsla(${n.hue}, 65%, 55%, ${op * 0.45})`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(n.x - n.radius, n.y - n.radius, n.radius * 2, n.radius * 2);
  }

  // Perspective floor grid across bottom 30% of the screen.
  function drawFloorGrid(t: number) {
    const top = h * 0.7;
    const height = h - top;
    if (height <= 0) return;
    const vanishX = w * 0.5 + fMouseX * 40;
    const horizon = top - height * 0.15; // virtual horizon a little above grid top
    const baseColor = `rgba(218, 165, 32,`;
    const px = fMouseX * 18;

    ctx.lineWidth = 1;

    // Horizontal lines: spacing grows toward the viewer (perspective).
    const HROWS = 9;
    for (let i = 0; i <= HROWS; i++) {
      const f = i / HROWS;
      // ease so lines bunch near the horizon
      const ef = f * f;
      const y = top + ef * height;
      const op = 0.04 * (0.35 + f * 0.65);
      ctx.strokeStyle = `${baseColor} ${op})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Vertical converging lines.
    const VCOLS = 16;
    for (let i = 0; i <= VCOLS; i++) {
      const f = i / VCOLS;
      const bottomX = f * w * 1.6 - w * 0.3 + px;
      ctx.strokeStyle = `${baseColor} 0.03)`;
      ctx.beginPath();
      ctx.moveTo(vanishX, horizon);
      ctx.lineTo(bottomX, h);
      ctx.stroke();
    }

    // Animated scan line sweeping from horizon toward viewer.
    const scanF = (t * 0.18) % 1;
    const sef = scanF * scanF;
    const scanY = top + sef * height;
    const scanOp = 0.12 * (1 - scanF);
    const sg = ctx.createLinearGradient(0, scanY - 24, 0, scanY + 6);
    sg.addColorStop(0, 'rgba(218, 165, 32, 0)');
    sg.addColorStop(1, `rgba(245, 220, 170, ${scanOp})`);
    ctx.fillStyle = sg;
    ctx.fillRect(0, scanY - 24, w, 30);
  }

  function drawStars(t: number) {
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const tw = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinklePhase);
      const op = s.baseOpacity * (0.35 + 0.65 * tw);
      const sx = s.x + fMouseX * s.depth * 6;
      const sy = s.y + fMouseY * s.depth * 6;
      if (s.warm) {
        ctx.fillStyle = `rgba(245, 215, 150, ${op})`;
      } else {
        ctx.fillStyle = `rgba(240, 238, 230, ${op})`;
      }
      ctx.beginPath();
      ctx.arc(sx, sy, s.size * (0.8 + tw * 0.4), 0, TWO_PI);
      ctx.fill();
    }
  }

  function drawBackground(t: number) {
    // Primary radial: warm core glow, multi-stop, pulsing.
    const pulse = Math.sin(t * 0.25) * 0.3 + 0.55;
    const cx = w * 0.5 + fMouseX * 20;
    const cy = h * 0.4 + fMouseY * 16;
    const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.7);
    g1.addColorStop(0, `rgba(218, 165, 32, ${0.014 * pulse})`);
    g1.addColorStop(0.25, `rgba(232, 200, 140, ${0.009 * pulse})`);
    g1.addColorStop(0.55, `rgba(245, 230, 200, ${0.005 * pulse})`);
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    // Secondary offset radial for depth (warm obsidian/amber lower glow).
    const pulse2 = Math.cos(t * 0.18) * 0.3 + 0.5;
    const c2x = w * 0.72 + fMouseX * 14;
    const c2y = h * 0.78 + fMouseY * 12;
    const g2 = ctx.createRadialGradient(c2x, c2y, 0, c2x, c2y, w * 0.55);
    g2.addColorStop(0, `rgba(120, 85, 30, ${0.012 * pulse2})`);
    g2.addColorStop(0.5, `rgba(80, 55, 20, ${0.006 * pulse2})`);
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);
  }

  function drawHexes(t: number) {
    const waveSpeed = 90; // px/sec the pulse wave travels across the diagonal
    const waveWidth = Math.min(w, h) * 0.5 + 200;
    const waveHead = (t * waveSpeed) % ((w + h) + waveWidth);

    ctx.lineWidth = 0.6;

    // Connecting lines first (under the cells).
    for (let i = 0; i < hexes.length; i++) {
      const a = hexes[i];
      const ax = a.x + fMouseX * 14;
      const ay = a.y + fMouseY * 10;
      for (let k = 0; k < a.neighbors.length; k++) {
        const b = hexes[a.neighbors[k]];
        const bx = b.x + fMouseX * 14;
        const by = b.y + fMouseY * 10;
        const lop = 0.012 * (0.4 + 0.6 * Math.sin(t * 0.5 + a.phase));
        ctx.strokeStyle = `rgba(218, 165, 32, ${lop})`;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
    }

    // Cells: subtle gradient fill + outline, with cross-screen pulse wave.
    for (let i = 0; i < hexes.length; i++) {
      const hex = hexes[i];
      const hx = hex.x + fMouseX * 14;
      const hy = hex.y + fMouseY * 10;

      // Distance of this hex from the moving wave head -> brightness boost.
      const d = Math.abs(hex.waveDist - waveHead);
      const waveBoost = d < waveWidth ? (1 - d / waveWidth) : 0;

      const breathe = 0.5 + 0.5 * Math.sin(t * 0.45 + hex.phase);
      const baseOp = hex.opacity * (0.4 + 0.6 * breathe);
      const fillOp = baseOp * (0.35 + waveBoost * 1.6);
      const strokeOp = baseOp * (0.8 + waveBoost * 1.2);

      // Gradient fill.
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, hex.size);
      const fillHue = waveBoost > 0.3 ? HUE_CHAMPAGNE : HUE_GOLD;
      g.addColorStop(0, `hsla(${fillHue}, 70%, ${60 + waveBoost * 20}%, ${fillOp})`);
      g.addColorStop(1, `hsla(${HUE_AMBER}, 70%, 50%, 0)`);
      hexPath(hx, hy, hex.size);
      ctx.fillStyle = g;
      ctx.fill();

      // Outline.
      ctx.strokeStyle = `hsla(${HUE_GOLD}, 65%, ${58 + waveBoost * 22}%, ${strokeOp})`;
      ctx.lineWidth = 0.5 + waveBoost * 0.8;
      ctx.stroke();
    }
  }

  function drawParticle(p: Particle, t: number) {
    // Size pulsing.
    const pulse = 0.75 + 0.25 * Math.sin(t * p.pulseSpeed + p.pulsePhase);
    p.size = p.baseSize * pulse;

    const fade = lifeFade(p);
    const px = fMouseX * p.depth * 12;
    const py = fMouseY * p.depth * 9;
    const dx = p.x + px;
    const dy = p.y + py;

    // Motion trail: faint line/blob at previous position.
    if (p.kind !== 2) {
      const tx = p.px + px;
      const ty = p.py + py;
      const tg = ctx.createRadialGradient(tx, ty, 0, tx, ty, p.size * 2.2);
      tg.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${p.opacity * fade * 0.18})`);
      tg.addColorStop(1, 'transparent');
      ctx.fillStyle = tg;
      ctx.fillRect(tx - p.size * 2.2, ty - p.size * 2.2, p.size * 4.4, p.size * 4.4);
    }

    // 4-layer gaussian-ish glow.
    const r = p.size * 3.5;
    const g = ctx.createRadialGradient(dx, dy, 0, dx, dy, r);
    const a = p.opacity * fade;
    g.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, ${Math.min(p.light + 10, 92)}%, ${a})`);
    g.addColorStop(0.25, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${a * 0.55})`);
    g.addColorStop(0.55, `hsla(${p.hue}, ${p.sat}%, ${p.light - 6}%, ${a * 0.2})`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(dx - r, dy - r, r * 2, r * 2);
  }

  function lifeFade(p: Particle) {
    const lr = p.life / p.maxLife;
    if (lr < 0.1) return lr / 0.1;
    if (lr > 0.8) return (1 - lr) / 0.2;
    return 1;
  }

  let startTime = 0;
  function frame(ts: number) {
    raf = requestAnimationFrame(frame);
    if (!startTime) startTime = ts;
    const t = (ts - startTime) / 1000;

    // Smooth (lerped) mouse parallax — higher factor = snappier but still smooth.
    fMouseX += (fMouseTX - fMouseX) * 0.06;
    fMouseY += (fMouseTY - fMouseY) * 0.06;

    ctx.clearRect(0, 0, w, h);

    // 1. Background gradients
    drawBackground(t);

    // 2. Star field (uses normal compositing for crisp points)
    drawStars(t);

    // Switch to additive blending for all the glowy energy layers.
    ctx.globalCompositeOperation = 'lighter';

    // 3. Nebula clouds (deep, very soft)
    for (let i = 0; i < nebulas.length; i++) drawNebula(nebulas[i], t);

    // 4. Perspective floor grid
    drawFloorGrid(t);

    // 5. Hex grid (fills + connections + wave)
    drawHexes(t);

    // 6. Flow lines (6-pass glow + dash + pulse)
    for (let i = 0; i < lines.length; i++) drawLine(lines[i], t);

    // 7. Particles (trails + glow + pulse + orbit)
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.px = p.x;
      p.py = p.y;

      if (p.kind === 1 && p.orbitRadius > 0) {
        // medium orbiting: anchor drifts, position orbits the anchor
        p.ox += p.vx;
        p.oy += p.vy;
        p.orbitPhase += p.orbitSpeed * 0.02;
        p.x = p.ox + Math.cos(p.orbitPhase) * p.orbitRadius;
        p.y = p.oy + Math.sin(p.orbitPhase) * p.orbitRadius;
      } else {
        p.x += p.vx;
        p.y += p.vy;
      }
      p.life++;

      if (p.life >= p.maxLife || p.y < -20 || p.x < -20 || p.x > w + 20) {
        particles.splice(i, 1);
        spawnParticle();
        continue;
      }

      drawParticle(p, t);
    }

    // Restore default compositing.
    ctx.globalCompositeOperation = 'source-over';
  }

  resize();
  window.addEventListener('resize', resize);
  raf = requestAnimationFrame(frame);

  return {
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onFlowMouse);
      canvas.remove();
    },
  };
}
