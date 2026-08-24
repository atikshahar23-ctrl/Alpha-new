import { useMemo } from 'react';

/**
 * Ambient background: a generated Flower of Life overlaid with a
 * Metatron-style lattice. Both are computed from a hex lattice rather
 * than hand-drawn, so the geometry is actually correct — circles pass
 * through each other's centres, as they should.
 *
 * Held at very low opacity. It should register as texture, not pattern.
 */

/** Hex lattice points with nearest-neighbour distance `d`, `rings` deep. */
function hexLattice(d, rings) {
  const pts = [];
  for (let q = -rings; q <= rings; q++) {
    const lo = Math.max(-rings, -q - rings);
    const hi = Math.min(rings, -q + rings);
    for (let r = lo; r <= hi; r++) {
      pts.push({ x: d * (q + r / 2), y: d * (Math.sqrt(3) / 2) * r });
    }
  }
  return pts;
}

export default function Backdrop() {
  const { circles, lattice } = useMemo(() => {
    const d = 46;
    const pts = hexLattice(d, 2); // 19 circles — the classic figure
    const inner = pts.filter((p) => Math.hypot(p.x, p.y) < d * 2.1);

    // Metatron lattice: every chord between the inner nodes.
    const lines = [];
    for (let i = 0; i < inner.length; i++) {
      for (let j = i + 1; j < inner.length; j++) {
        lines.push([inner[i], inner[j]]);
      }
    }
    return { circles: pts, lattice: lines };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Deep violet floor wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(76,15,122,0.30) 0%, transparent 60%),' +
            'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(57,255,20,0.06) 0%, transparent 62%)',
        }}
      />

      {/* Rotating sacred geometry */}
      <svg
        className="absolute left-1/2 top-1/2 h-[150vmax] w-[150vmax] -translate-x-1/2 -translate-y-1/2 animate-drift"
        viewBox="-200 -200 400 400"
        fill="none"
      >
        <defs>
          <radialGradient id="geo-fade">
            <stop offset="0%" stopColor="#39ff14" stopOpacity="0.28" />
            <stop offset="55%" stopColor="#a855f7" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
          <mask id="geo-mask">
            <rect x="-200" y="-200" width="400" height="400" fill="url(#geo-fade)" />
          </mask>
        </defs>

        <g mask="url(#geo-mask)">
          <g stroke="#39ff14" strokeWidth="0.35" opacity="0.5">
            {circles.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={46} />
            ))}
          </g>

          <g stroke="#a855f7" strokeWidth="0.22" opacity="0.42">
            {lattice.map(([a, b], i) => (
              <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            ))}
          </g>

          <g stroke="#39ff14" strokeWidth="0.3" opacity="0.35">
            {[70, 108, 150, 186].map((r) => (
              <circle key={r} cx="0" cy="0" r={r} />
            ))}
          </g>
        </g>
      </svg>

      {/* Faint measurement grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #39ff14 1px, transparent 1px),' +
            'linear-gradient(to bottom, #39ff14 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at center, #000 20%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 20%, transparent 78%)',
        }}
      />
    </div>
  );
}
