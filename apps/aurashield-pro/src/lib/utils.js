// ─── Math + formatting helpers ────────────────────────────────────────

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Angular interpolation that takes the short way around the circle.
 * Without this, a compass crossing 359° -> 1° spins the whole radar
 * the long way and looks broken.
 */
export function lerpAngle(a, b, t) {
  let diff = ((b - a + 540) % 360) - 180;
  return (a + diff * t + 360) % 360;
}

export const normalizeDeg = (d) => ((d % 360) + 360) % 360;

/** Shortest absolute angular distance between two bearings, 0..180. */
export function angularDistance(a, b) {
  const d = Math.abs(normalizeDeg(a) - normalizeDeg(b));
  return d > 180 ? 360 - d : d;
}

/** mulberry32 — small deterministic PRNG so a session's field is stable. */
export function makeRng(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export const randRange = (rng, lo, hi) => lo + rng() * (hi - lo);

export const pick = (rng, arr) => arr[Math.floor(rng() * arr.length) % arr.length];

/** Polar -> cartesian with 0° pointing up (screen convention). */
export function polarToXY(cx, cy, radius, bearingDeg) {
  const rad = ((bearingDeg - 90) * Math.PI) / 180;
  return { x: cx + Math.cos(rad) * radius, y: cy + Math.sin(rad) * radius };
}

export const pad = (n, w = 2) => String(Math.floor(Math.abs(n))).padStart(w, '0');

export function formatClock(date = new Date()) {
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(
    date.getUTCSeconds()
  )}`;
}

/** Stable pseudo-hex ident, e.g. "7F2A-C104". Cosmetic only. */
export function makeIdent(rng) {
  const hex = () =>
    Math.floor(rng() * 65536)
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');
  return `${hex()}-${hex()}`;
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
