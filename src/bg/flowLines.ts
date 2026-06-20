interface FlowLine {
  points: { x: number; y: number }[];
  speed: number;
  offset: number;
  width: number;
  opacity: number;
  hue: number;
}

export function mountFlowLines(container: HTMLElement): { dispose: () => void } {
  const canvas = document.createElement('canvas');
  canvas.className = 'flow-bg';
  container.prepend(canvas);
  const ctx = canvas.getContext('2d')!;

  let w = 0, h = 0;
  let raf = 0;
  const lines: FlowLine[] = [];
  const LINE_COUNT = 8;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    if (lines.length === 0) initLines();
  }

  function initLines() {
    lines.length = 0;
    for (let i = 0; i < LINE_COUNT; i++) {
      const numPoints = 5 + Math.floor(Math.random() * 3);
      const points: { x: number; y: number }[] = [];
      const baseY = h * (0.15 + Math.random() * 0.7);
      for (let j = 0; j < numPoints; j++) {
        points.push({
          x: (j / (numPoints - 1)) * (w + 400) - 200,
          y: baseY + (Math.random() - 0.5) * h * 0.35,
        });
      }
      lines.push({
        points,
        speed: 0.15 + Math.random() * 0.35,
        offset: Math.random() * Math.PI * 2,
        width: 1 + Math.random() * 1.5,
        opacity: 0.08 + Math.random() * 0.15,
        hue: 175 + Math.random() * 25,
      });
    }
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

    for (let pass = 0; pass < 3; pass++) {
      const mult = [3, 1.5, 1][pass];
      const opMult = [0.2, 0.5, 1][pass];
      ctx.lineWidth = line.width * mult;
      ctx.strokeStyle = `hsla(${line.hue}, 90%, 65%, ${line.opacity * opMult})`;
      ctx.stroke();
    }
  }

  let startTime = 0;
  function frame(ts: number) {
    raf = requestAnimationFrame(frame);
    if (!startTime) startTime = ts;
    const t = (ts - startTime) / 1000;

    ctx.clearRect(0, 0, w, h);

    for (const line of lines) {
      drawLine(line, t);
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
