import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export interface OrbHandle {
  setEnergy(v: number): void;
  dispose(): void;
  startBodyDetection(): void;
  stopBodyDetection(): void;
}

// ============================================================
// Shared constants
// ============================================================
const PI = Math.PI;
const PI2 = PI * 2;
const S = 2.5;
const BY = -1.8;

// ============================================================
// Utility helpers
// ============================================================
function rng(lo: number, hi: number) { return lo + Math.random() * (hi - lo); }
function smooth(t: number) { return t * t * (3 - 2 * t); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function hash(n: number) { let s = Math.sin(n) * 43758.5453; return s - Math.floor(s); }

// Simple 1D value noise for organic movement
function noise1D(x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash(i), hash(i + 1), u) * 2 - 1;
}

// ============================================================
// Vertex anchor heights (7.5-head canon)
// ============================================================
const Y = {
  crown: 2.55, brow: 2.30, eye: 2.26, nose: 2.20, mouth: 2.12, chin: 2.16,
  jaw: 2.18, neckTop: 2.10, neckBot: 1.96, shoulder: 1.98, pec: 1.80,
  sternum: 1.72, rib: 1.62, navel: 1.46, waist: 1.42, hip: 1.30,
  crotch: 1.20, thigh: 0.95, knee: 0.78, calf: 0.50, ankle: 0.18, sole: 0.10,
};
const cy = (v: number) => BY + v * S;

// ============================================================
// Custom shader source code
// ============================================================
const BODY_VERTEX = /* glsl */`
  uniform float uTime;
  uniform float uEnergy;
  uniform float uScanY;
  uniform float uGlitchStrength;

  attribute float aPhase;
  attribute float aSpeed;
  attribute float aSize;
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vScan;

  void main() {
    vec3 pos = position;

    // Holographic glitch — horizontal displacement
    float glitchBand = step(0.97, fract(sin(floor(pos.y * 40.0 + uTime * 3.0)) * 43758.5453));
    pos.x += glitchBand * uGlitchStrength * sin(uTime * 50.0 + pos.y * 20.0) * 0.15;

    // Breathing pulse — anisotropic torso expansion
    float breath = sin(uTime * 0.9 + aPhase * 0.5);
    float breathScale = 1.0 + breath * 0.006 + uEnergy * 0.014;
    float breathX = 1.0 + breath * 0.009 + uEnergy * 0.016;
    pos.x *= breathX;
    pos.y *= breathScale;
    pos.z *= breathX;

    // Organic sway using noise
    float sway = sin(uTime * 0.13 + aPhase) * 0.02 + sin(uTime * 0.07 + aPhase * 2.3) * 0.01;
    pos.x += sway;
    pos.y += sin(uTime * 0.19 + aPhase * 0.7) * 0.008;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Animated size with breathing/pulse
    float pulse = 1.0 + sin(uTime * aSpeed * 2.0 + aPhase * 6.28) * 0.3;
    float energyPulse = 1.0 + uEnergy * 0.5;
    float sz = aSize * pulse * energyPulse;

    // Perspective attenuation
    gl_PointSize = sz * (300.0 / -mvPosition.z);

    gl_Position = projectionMatrix * mvPosition;

    // Holographic color shift
    float hueShift = sin(uTime * 0.5 + aPhase * 3.14) * 0.15;
    vColor = aColor + vec3(hueShift * 0.1, hueShift * 0.05, -hueShift * 0.08);

    // Scan line brightness boost
    float scanDist = abs(pos.y - uScanY);
    vScan = smoothstep(0.15, 0.0, scanDist);

    // Alpha based on energy and phase
    vAlpha = 0.7 + uEnergy * 0.3 + sin(uTime * 1.7 + aPhase) * 0.05;
  }
`;

const BODY_FRAGMENT = /* glsl */`
  varying vec3 vColor;
  varying float vAlpha;
  varying float vScan;

  uniform float uTime;
  uniform float uEnergy;

  void main() {
    // Soft circular particle with radial gradient
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.1, dist);
    alpha *= alpha; // softer falloff

    // Chromatic aberration per-particle
    float aberration = 0.02 + 0.01 * sin(uTime * 2.0);
    vec3 col;
    col.r = vColor.r * smoothstep(0.5, 0.08, length(center + vec2(aberration, 0.0)));
    col.g = vColor.g * smoothstep(0.5, 0.08, dist);
    col.b = vColor.b * smoothstep(0.5, 0.08, length(center - vec2(aberration, 0.0)));

    // Scan line brightening
    col += vec3(0.3, 0.6, 0.8) * vScan * 2.0;

    // Energy-driven glow intensifier
    col *= 1.0 + uEnergy * 0.4;

    gl_FragColor = vec4(col, alpha * vAlpha);
  }
`;

const FLOW_VERTEX = /* glsl */`
  uniform float uTime;
  uniform float uEnergy;

  attribute float aPhase;
  attribute float aSpeed;
  attribute float aSize;
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    float pulse = 1.0 + sin(uTime * aSpeed * 3.0 + aPhase * 6.28) * 0.4;
    float sz = aSize * pulse * (1.0 + uEnergy * 0.6);
    gl_PointSize = sz * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    vColor = aColor;
    float fadeCycle = sin(aPhase * 6.28 + uTime * aSpeed);
    vAlpha = (0.5 + fadeCycle * 0.3) * (0.6 + uEnergy * 0.4);
  }
`;

const FLOW_FRAGMENT = /* glsl */`
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.05, dist);
    gl_FragColor = vec4(vColor * 1.3, alpha * vAlpha);
  }
`;

const GRID_VERTEX = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const GRID_FRAGMENT = /* glsl */`
  uniform float uTime;
  uniform float uEnergy;

  varying vec2 vUv;

  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    float dist = length(uv);

    // Concentric rings pulsing outward
    float rings = sin((dist * 12.0 - uTime * 1.5) * 3.14159) * 0.5 + 0.5;
    rings *= smoothstep(1.0, 0.3, dist);

    // Grid lines
    vec2 grid = abs(fract(uv * 8.0) - 0.5);
    float gridLine = 1.0 - smoothstep(0.0, 0.05, min(grid.x, grid.y));
    gridLine *= smoothstep(1.0, 0.2, dist);

    // Radial lines
    float angle = atan(uv.y, uv.x);
    float radialLine = 1.0 - smoothstep(0.0, 0.03, abs(fract(angle / 3.14159 * 8.0) - 0.5));
    radialLine *= smoothstep(1.0, 0.4, dist) * smoothstep(0.05, 0.15, dist);

    float combined = max(gridLine * 0.4, rings * 0.3) + radialLine * 0.15;
    combined *= (0.5 + uEnergy * 0.5);

    // Pulse wave from center
    float pulse = smoothstep(0.02, 0.0, abs(dist - fract(uTime * 0.3) * 1.2));
    combined += pulse * 0.6;

    vec3 color = mix(vec3(0.2, 0.6, 0.8), vec3(0.4, 0.9, 1.0), rings);
    color = mix(color, vec3(1.0, 0.75, 0.3), radialLine * 0.3);

    float alpha = combined * smoothstep(1.0, 0.6, dist);
    gl_FragColor = vec4(color, alpha * 0.4);
  }
`;

const CONE_VERTEX = /* glsl */`
  varying vec2 vUv;
  varying float vY;
  void main() {
    vUv = uv;
    vY = position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CONE_FRAGMENT = /* glsl */`
  uniform float uTime;
  uniform float uEnergy;
  varying vec2 vUv;
  varying float vY;

  void main() {
    float fade = smoothstep(0.0, 1.0, vY);
    float edge = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);

    float flicker = 0.8 + 0.2 * sin(uTime * 3.0 + vY * 10.0);
    float alpha = fade * edge * 0.08 * flicker * (0.6 + uEnergy * 0.4);

    vec3 color = vec3(0.3, 0.7, 0.9);
    gl_FragColor = vec4(color, alpha);
  }
`;

// ============================================================
// Particle generation — anatomy helpers
// ============================================================

function ringScatter(arr: number[], cx: number, cy: number, cz: number,
                     rx: number, depth: number, jitter: number) {
  const a = Math.random() * PI2;
  const rz = rx * depth;
  const sh = 1 - Math.random() * Math.random() * 0.22;
  arr.push(
    cx + rx * sh * Math.cos(a) + rng(-jitter, jitter),
    cy + rng(-jitter, jitter),
    cz + rz * sh * Math.sin(a) + rng(-jitter, jitter),
  );
}

function segment(arr: number[], n: number,
                 x0: number, y0: number, z0: number,
                 x1: number, y1: number, z1: number,
                 rFn: (t: number) => number, depth: number, jitter: number) {
  for (let i = 0; i < n; i++) {
    const t = Math.random();
    const cx = x0 + (x1 - x0) * t;
    const cy2 = y0 + (y1 - y0) * t;
    const cz = z0 + (z1 - z0) * t;
    ringScatter(arr, cx, cy2, cz, rFn(t), depth, jitter);
  }
}

function spherePts(arr: number[], cx: number, cy2: number, cz: number, r: number, n: number, sq = 1) {
  for (let i = 0; i < n; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const th = Math.random() * PI2;
    const sr = r * (0.9 + Math.random() * 0.1);
    arr.push(
      cx + sr * Math.sin(phi) * Math.cos(th),
      cy2 + sr * Math.cos(phi),
      cz + sr * sq * Math.sin(phi) * Math.sin(th),
    );
  }
}

function linePts(arr: number[], x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, n: number) {
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    arr.push(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, z1 + (z2 - z1) * t);
  }
}

// ============================================================
// Build humanoid particle positions — anatomically accurate
// ============================================================
function buildHumanoidParticles(q = 1.0) {
  const n = (count: number) => Math.max(10, Math.floor(count * q));
  const innerPts: number[] = [];   // core shell
  const midPts: number[] = [];     // volume fill
  const outerPts: number[] = [];   // aura
  const nervePts: number[] = [];   // skeleton/neural
  const veinPts: number[] = [];    // energy veins
  const faceZ = 0.115 * S;
  const headR = 0.135 * S;
  const eyeDX = 0.052 * S;

  // ---------- HEAD ----------
  for (let i = 0; i < n(4200); i++) {
    const u = Math.random();
    const yy = cy(Y.chin) + (cy(Y.crown) - cy(Y.chin)) * u;
    const ty = (yy - cy(Y.chin)) / (cy(Y.crown) - cy(Y.chin));
    const w = (0.55 + 0.55 * Math.sin(ty * 0.85 * PI + 0.18)) * headR;
    ringScatter(innerPts, 0, yy, 0, w, 0.92, 0.006 * S);
  }
  // Jaw/chin
  for (let i = 0; i < n(1000); i++) {
    const t = Math.random();
    const yy = cy(Y.chin) + t * 0.07 * S;
    const w = (0.45 + 0.45 * t) * headR;
    ringScatter(innerPts, 0, yy, 0.03 * S * (1 - t), w, 0.85, 0.005 * S);
  }

  // ---------- FACIAL FEATURES ----------
  // Brow ridge
  for (let i = 0; i < n(320); i++) {
    const x = rng(-0.085, 0.085) * S;
    innerPts.push(x, cy(Y.brow) + Math.abs(x) * 0.15 + rng(-0.004, 0.004) * S, faceZ + rng(-0.004, 0.004) * S);
  }
  // Eye sockets
  const eyeY = cy(Y.eye);
  const eyeZ = faceZ + 0.01 * S;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < n(240); i++) {
      const a = Math.random() * PI2;
      const rr = 0.026 * S * (0.7 + Math.random() * 0.3);
      innerPts.push(side * eyeDX + rr * Math.cos(a), eyeY + rr * 0.7 * Math.sin(a), eyeZ + rng(-0.003, 0.003) * S);
    }
  }
  // Nose
  for (let i = 0; i < n(260); i++) {
    const t = Math.random();
    const yy = cy(Y.eye) - t * (Y.eye - Y.nose) * S;
    innerPts.push(rng(-0.012, 0.012) * S, yy, faceZ + t * 0.03 * S);
  }
  // Nostrils
  spherePts(innerPts, -0.018 * S, cy(Y.nose), faceZ + 0.02 * S, 0.012 * S, n(60), 0.8);
  spherePts(innerPts, 0.018 * S, cy(Y.nose), faceZ + 0.02 * S, 0.012 * S, n(60), 0.8);
  // Lips
  for (let lip = 0; lip < 2; lip++) {
    for (let i = 0; i < n(120); i++) {
      const t = i / 119;
      const x = (t - 0.5) * 0.07 * S;
      const yy = cy(Y.mouth) + (lip === 0 ? 0.006 : -0.006) * S - Math.abs(x) * 0.06;
      innerPts.push(x, yy, faceZ + rng(-0.002, 0.002) * S);
    }
  }
  // Cheekbones
  for (let side = -1; side <= 1; side += 2) {
    spherePts(innerPts, side * 0.075 * S, cy(Y.eye) - 0.025 * S, faceZ - 0.01 * S, 0.022 * S, n(90), 0.8);
  }
  // Ears
  for (let side = -1; side <= 1; side += 2) {
    spherePts(innerPts, side * headR * 0.98, cy(Y.eye) - 0.01 * S, -0.01 * S, 0.025 * S, n(100), 0.6);
  }
  // Hair/crown shimmer
  for (let i = 0; i < n(800); i++) {
    const t = Math.random();
    const yy = cy(Y.brow) + t * (Y.crown - Y.brow) * S;
    const ty = (yy - cy(Y.brow)) / (cy(Y.crown) - cy(Y.brow));
    const w = (0.6 + 0.4 * Math.sin(ty * PI)) * headR * 1.08;
    const a = rng(-PI, 0);
    midPts.push(w * Math.cos(a), yy, w * 0.92 * Math.sin(a) - 0.01 * S);
  }

  // ---------- NECK ----------
  segment(innerPts, n(900), 0, cy(Y.neckBot), 0, 0, cy(Y.neckTop), 0, () => 0.06 * S, 0.9, 0.005 * S);
  for (let side = -1; side <= 1; side += 2) {
    segment(innerPts, n(300), side * 0.04 * S, cy(Y.shoulder + 0.04), 0,
      side * 0.18 * S, cy(Y.shoulder), 0, () => 0.03 * S, 0.9, 0.006 * S);
  }

  // ---------- TORSO ----------
  const torsoTopY = cy(Y.shoulder);
  const torsoBotY = cy(Y.waist);
  for (let i = 0; i < n(8000); i++) {
    const t = Math.random();
    const ty = smooth(t);
    const yy = torsoTopY + (torsoBotY - torsoTopY) * t;
    const w = (0.30 - 0.135 * ty + 0.02 * Math.sin(t * PI)) * S;
    const depth = 0.66 + 0.06 * Math.sin(t * PI);
    ringScatter(innerPts, 0, yy, 0, w, depth, 0.006 * S);
  }
  // Pectorals
  for (let side = -1; side <= 1; side += 2) {
    spherePts(innerPts, side * 0.10 * S, cy(Y.pec), 0.115 * S, 0.075 * S, n(640), 0.55);
  }
  // Sternum
  for (let i = 0; i < n(180); i++) {
    const t = i / 179;
    innerPts.push(0, cy(Y.pec) - t * (Y.pec - Y.navel) * S, (0.14 - t * 0.02) * S);
  }
  // Abs
  for (let row = 0; row < 3; row++) {
    for (let side = -1; side <= 1; side += 2) {
      spherePts(innerPts, side * 0.045 * S, cy(Y.navel + 0.16) - row * 0.07 * S, 0.125 * S, 0.03 * S, n(140), 0.5);
    }
  }
  // Obliques
  for (let side = -1; side <= 1; side += 2) {
    segment(innerPts, n(450), side * 0.20 * S, cy(Y.rib), 0.06 * S,
      side * 0.15 * S, cy(Y.waist), 0.05 * S, (t) => (0.05 - t * 0.015) * S, 0.7, 0.006 * S);
  }

  // ---------- HIPS / PELVIS ----------
  const hipTopY = cy(Y.waist);
  const hipBotY = cy(Y.crotch);
  for (let i = 0; i < n(2800); i++) {
    const t = Math.random();
    const yy = hipTopY + (hipBotY - hipTopY) * t;
    const w = (0.165 + 0.085 * smooth(t)) * S;
    ringScatter(innerPts, 0, yy, 0, w, 0.72, 0.006 * S);
  }

  // ---------- LEGS ----------
  for (let side = -1; side <= 1; side += 2) {
    const hipX = side * 0.13 * S;
    const kneeX = side * 0.105 * S;
    const ankX = side * 0.085 * S;
    // Thigh
    segment(innerPts, n(4000), hipX, cy(Y.crotch + 0.02), 0,
      kneeX, cy(Y.knee + 0.03), 0.01 * S,
      (t) => (0.115 - 0.045 * smooth(t)) * S, 0.8, 0.006 * S);
    // Knee
    spherePts(innerPts, kneeX, cy(Y.knee), 0.02 * S, 0.058 * S, n(540), 0.85);
    // Calf
    segment(innerPts, n(3000), kneeX, cy(Y.knee - 0.02), 0.01 * S,
      ankX, cy(Y.ankle), 0,
      (t) => (0.07 + 0.022 * Math.sin(smooth(t) * PI) - 0.03 * t) * S, 0.78, 0.006 * S);
    // Shin
    segment(innerPts, n(450), kneeX, cy(Y.knee - 0.04), 0.05 * S,
      ankX, cy(Y.ankle + 0.02), 0.04 * S, () => 0.02 * S, 0.6, 0.005 * S);
    // Ankle
    spherePts(innerPts, ankX, cy(Y.ankle), 0.01 * S, 0.04 * S, n(300), 0.85);
    // Foot
    for (let i = 0; i < n(1000); i++) {
      const t = Math.random();
      const x = ankX + side * rng(-0.02, 0.02) * S;
      const yy = cy(Y.sole) + rng(0, 0.03) * S * (1 - t);
      const z = (0.0 + t * 0.16) * S;
      const w = (0.045 - t * 0.02) * S;
      const a = Math.random() * PI2;
      innerPts.push(x + w * Math.cos(a), yy, z + w * 0.5 * Math.sin(a));
    }
    // Heel
    spherePts(innerPts, ankX, cy(Y.sole + 0.01), -0.02 * S, 0.035 * S, n(220), 0.7);
  }

  // ---------- ARMS ----------
  for (let side = -1; side <= 1; side += 2) {
    const shX = side * 0.30 * S;
    const elbowX = side * 0.36 * S;
    const wristX = side * 0.40 * S;
    // Deltoid
    spherePts(innerPts, shX, cy(Y.shoulder), 0, 0.085 * S, n(1000), 0.85);
    // Upper arm
    segment(innerPts, n(2000), shX, cy(Y.shoulder - 0.04), 0,
      elbowX, cy(Y.rib - 0.06), 0.03 * S,
      (t) => (0.055 - 0.01 * t + 0.012 * Math.sin(t * PI)) * S, 0.85, 0.006 * S);
    // Elbow
    spherePts(innerPts, elbowX, cy(Y.rib - 0.06), 0.03 * S, 0.045 * S, n(380), 0.85);
    // Forearm
    segment(innerPts, n(1600), elbowX, cy(Y.rib - 0.08), 0.04 * S,
      wristX, cy(Y.navel - 0.02), 0.10 * S,
      (t) => (0.05 - 0.02 * t) * S, 0.82, 0.006 * S);
    // Wrist
    spherePts(innerPts, wristX, cy(Y.navel - 0.02), 0.10 * S, 0.03 * S, n(240), 0.85);
    // Palm
    spherePts(innerPts, wristX + side * 0.01 * S, cy(Y.navel - 0.07), 0.13 * S, 0.04 * S, n(360), 0.5);
    // Fingers
    for (let f = 0; f < 5; f++) {
      const spread = ((f - 2) / 4) * 0.06 * S;
      const fx = wristX + side * 0.01 * S + spread;
      const len = (0.06 + (f === 0 ? -0.015 : f === 2 ? 0.01 : 0)) * S;
      segment(innerPts, n(100), fx, cy(Y.navel - 0.09), 0.14 * S,
        fx + spread * 0.4, cy(Y.navel - 0.09) - len, 0.16 * S,
        () => 0.012 * S, 0.7, 0.004 * S);
    }
  }

  // ---------- VOLUME LAYER (mid) ----------
  const innerCount = innerPts.length / 3;
  for (let i = 0; i < n(6000); i++) {
    const idx = Math.floor(Math.random() * innerCount) * 3;
    midPts.push(
      innerPts[idx] * 0.93 + rng(-0.02, 0.02) * S,
      innerPts[idx + 1] + rng(-0.02, 0.02) * S,
      innerPts[idx + 2] * 0.93 + rng(-0.02, 0.02) * S,
    );
  }

  // ---------- AURA (outer) ----------
  for (let i = 0; i < n(5000); i++) {
    const idx = Math.floor(Math.random() * innerCount) * 3;
    outerPts.push(
      innerPts[idx] * 1.14 + rng(-0.05, 0.05) * S,
      innerPts[idx + 1] + rng(-0.04, 0.04) * S,
      innerPts[idx + 2] * 1.14 + rng(-0.05, 0.05) * S,
    );
  }

  // ---------- SKELETON / NEURAL LINES ----------
  linePts(nervePts, 0, cy(Y.hip), -0.03 * S, 0, cy(Y.neckTop), 0, 48);
  linePts(nervePts, 0, cy(Y.chin), faceZ, 0, cy(Y.crown), 0, 22);
  for (let side = -1; side <= 1; side += 2)
    linePts(nervePts, 0, cy(Y.shoulder + 0.02), 0.04 * S, side * 0.28 * S, cy(Y.shoulder), 0, 22);
  for (let rib = 0; rib < 5; rib++) {
    const ry = cy(Y.rib + rib * 0.06);
    for (let i = 0; i < 26; i++) {
      const t = i / 25;
      const ang = (t - 0.5) * PI * 0.95;
      const rr = (0.24 - rib * 0.012) * S;
      nervePts.push(rr * Math.sin(ang), ry, rr * Math.cos(ang) * 0.65);
    }
  }
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * PI2;
    nervePts.push(0.18 * S * Math.cos(a), cy(Y.hip), 0.13 * S * Math.sin(a));
  }
  for (let side = -1; side <= 1; side += 2) {
    linePts(nervePts, side * 0.30 * S, cy(Y.shoulder), 0, side * 0.36 * S, cy(Y.rib - 0.06), 0.03 * S, 18);
    linePts(nervePts, side * 0.36 * S, cy(Y.rib - 0.06), 0.03 * S, side * 0.40 * S, cy(Y.navel - 0.02), 0.10 * S, 18);
    linePts(nervePts, side * 0.13 * S, cy(Y.crotch), 0, side * 0.105 * S, cy(Y.knee), 0.02 * S, 24);
    linePts(nervePts, side * 0.105 * S, cy(Y.knee), 0.02 * S, side * 0.085 * S, cy(Y.ankle), 0, 24);
  }
  for (let side = -1; side <= 1; side += 2) {
    linePts(nervePts, side * eyeDX, eyeY, eyeZ, 0, cy(Y.nose), faceZ + 0.02 * S, 12);
    linePts(nervePts, side * eyeDX, eyeY, eyeZ, side * 0.08 * S, cy(Y.brow), faceZ, 10);
  }

  // ---------- ENERGY VEINS ----------
  for (let i = 0; i < 70; i++) {
    const t = i / 69;
    const yy = cy(Y.hip) + t * (Y.neckTop - Y.hip) * S;
    veinPts.push(Math.sin(t * PI * 5) * 0.025 * S, yy, 0.05 * S + Math.cos(t * PI * 3) * 0.02 * S);
  }
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 50; i++) {
      const t = i / 49;
      const yy = cy(Y.crotch) + t * (Y.shoulder - Y.crotch) * S;
      veinPts.push(side * (0.07 + t * 0.05) * S + Math.sin(t * PI * 6) * 0.012 * S, yy, 0.055 * S);
    }
    for (let i = 0; i < 36; i++) {
      const t = i / 35;
      const yy = cy(Y.crotch) - t * (Y.crotch - Y.ankle) * S;
      veinPts.push(side * (0.12 - t * 0.04) * S + Math.sin(t * PI * 5) * 0.01 * S, yy, 0.04 * S);
    }
  }

  return { innerPts, midPts, outerPts, nervePts, veinPts, innerCount };
}

// ============================================================
// Create shader material for a particle layer
// ============================================================
function createShaderParticles(
  positions: number[],
  baseColor: [number, number, number],
  baseSizePx: number,
  opts: {
    colorVariance?: number;
    vertexShader?: string;
    fragmentShader?: string;
  } = {},
) {
  const count = positions.length / 3;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));

  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  const cv = opts.colorVariance ?? 0.1;

  for (let i = 0; i < count; i++) {
    phases[i] = Math.random() * PI2;
    speeds[i] = 0.5 + Math.random() * 1.5;
    sizes[i] = baseSizePx * (0.6 + Math.random() * 0.8);
    colors[i * 3] = baseColor[0] + rng(-cv, cv);
    colors[i * 3 + 1] = baseColor[1] + rng(-cv, cv);
    colors[i * 3 + 2] = baseColor[2] + rng(-cv, cv);
  }

  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uEnergy: { value: 0 },
      uScanY: { value: 0 },
      uGlitchStrength: { value: 0 },
    },
    vertexShader: opts.vertexShader ?? BODY_VERTEX,
    fragmentShader: opts.fragmentShader ?? BODY_FRAGMENT,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  return { geo, mat, points };
}

// ============================================================
// MAIN: mountOrb
// ============================================================
export function mountOrb(container: HTMLElement): OrbHandle {
  // ---------- Mobile detection ----------
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
  const quality = isMobile ? 0.3 : 1.0;

  // ---------- Renderer ----------
  const renderer = new THREE.WebGLRenderer({
    antialias: !isMobile,
    alpha: true,
    powerPreference: isMobile ? 'low-power' : 'high-performance',
  });
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 1.6, 6.5);
  camera.lookAt(0, 1.4, 0);

  // ---------- Post-processing (skip on mobile for GPU perf) ----------
  let composer: EffectComposer | null = null;
  if (!isMobile) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, 0.8, 0.1,
    ));
    composer.addPass(new OutputPass());
  }

  function resize() {
    const w = container.clientWidth || 240;
    const h = container.clientHeight || w;
    renderer.setSize(w, h, false);
    if (composer) composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const group = new THREE.Group();
  scene.add(group);

  // ============================================================
  // Build all particle layers
  // ============================================================
  const { innerPts, midPts, outerPts, nervePts, veinPts, innerCount } = buildHumanoidParticles(quality);

  // --- LAYER a) Core shell --- cyan, tiny, sharp
  const coreShell = createShaderParticles(innerPts, [0.54, 0.95, 1.0], isMobile ? 2.5 : 1.8, { colorVariance: 0.08 });
  group.add(coreShell.points);

  // --- Mid-volume fill ---
  const midVolume = createShaderParticles(midPts, [0.29, 0.78, 0.91], isMobile ? 4.5 : 3.5, { colorVariance: 0.06 });
  group.add(midVolume.points);

  // --- LAYER b) Energy flow --- animated upward
  const FLOW_N = Math.floor(15000 * quality);
  const flowPositions: number[] = [];
  for (let i = 0; i < FLOW_N; i++) {
    const idx = Math.floor(Math.random() * innerCount) * 3;
    flowPositions.push(
      innerPts[idx] * 1.04 + rng(-0.01, 0.01) * S,
      innerPts[idx + 1],
      innerPts[idx + 2] * 1.04 + rng(-0.01, 0.01) * S,
    );
  }
  const energyFlow = createShaderParticles(flowPositions, [0.68, 0.96, 1.0], 2.5, {
    colorVariance: 0.1,
    vertexShader: FLOW_VERTEX,
    fragmentShader: FLOW_FRAGMENT,
  });
  // Store base positions for animation
  const flowBasePos = new Float32Array(flowPositions);
  const flowPhase = new Float32Array(FLOW_N);
  const flowSpeed = new Float32Array(FLOW_N);
  for (let i = 0; i < FLOW_N; i++) {
    flowPhase[i] = Math.random();
    flowSpeed[i] = 0.3 + Math.random() * 0.5;
  }
  group.add(energyFlow.points);

  // --- LAYER c) Holographic interference --- purple/magenta
  const HOLO_N = Math.floor(10000 * quality);
  const interferePts: number[] = [];
  for (let i = 0; i < HOLO_N; i++) {
    const idx = Math.floor(Math.random() * innerCount) * 3;
    const scale = 1.02 + Math.random() * 0.06;
    interferePts.push(
      innerPts[idx] * scale + rng(-0.015, 0.015) * S,
      innerPts[idx + 1] + rng(-0.01, 0.01) * S,
      innerPts[idx + 2] * scale + rng(-0.015, 0.015) * S,
    );
  }
  const interference = createShaderParticles(interferePts, [0.69, 0.42, 1.0], 2.0, { colorVariance: 0.15 });
  group.add(interference.points);

  // --- LAYER d) Data streams --- vertical flowing
  const dataStreamPts: number[] = [];
  const DATA_STREAM_N = Math.floor(5000 * quality);
  const streamColumns = isMobile ? 12 : 30;
  for (let col = 0; col < streamColumns; col++) {
    const baseIdx = Math.floor(Math.random() * innerCount) * 3;
    const baseX = innerPts[baseIdx];
    const baseZ = innerPts[baseIdx + 2];
    const perCol = Math.floor(DATA_STREAM_N / streamColumns);
    for (let i = 0; i < perCol; i++) {
      dataStreamPts.push(
        baseX + rng(-0.01, 0.01) * S,
        cy(Y.sole) + Math.random() * (Y.crown - Y.sole) * S,
        baseZ + rng(-0.01, 0.01) * S,
      );
    }
  }
  const dataStreams = createShaderParticles(dataStreamPts, [0.3, 0.9, 0.6], 1.5, {
    colorVariance: 0.15,
    vertexShader: FLOW_VERTEX,
    fragmentShader: FLOW_FRAGMENT,
  });
  const dataStreamBase = new Float32Array(dataStreamPts);
  const dataStreamPhase = new Float32Array(DATA_STREAM_N);
  const dataStreamSpeed = new Float32Array(DATA_STREAM_N);
  for (let i = 0; i < DATA_STREAM_N; i++) {
    dataStreamPhase[i] = Math.random();
    dataStreamSpeed[i] = 0.5 + Math.random() * 1.0;
  }
  group.add(dataStreams.points);

  // --- LAYER e) Outer aura (5k particles) --- large, faint, atmospheric
  const aura = createShaderParticles(outerPts, [0.18, 0.56, 0.78], 8.0, { colorVariance: 0.05 });
  group.add(aura.points);

  // --- Skeleton / neural lines ---
  const neural = createShaderParticles(nervePts, [0.75, 0.91, 1.0], 1.4, { colorVariance: 0.04 });
  group.add(neural.points);

  // --- Energy veins (gold) ---
  const veins = createShaderParticles(veinPts, [1.0, 0.76, 0.3], 2.8, { colorVariance: 0.08 });
  group.add(veins.points);

  // All shader layers for uniform updating
  const allShaderLayers = [coreShell, midVolume, energyFlow, interference, dataStreams, aura, neural, veins];

  // ============================================================
  // EYE SYSTEM — glowing rings with animated iris
  // ============================================================
  const eyeY = cy(Y.eye);
  const eyeZ = 0.115 * S + 0.01 * S;
  const eyeDX = 0.052 * S;

  function makeEyeRing(x: number) {
    // Torus ring for iris
    const irisGeo = new THREE.TorusGeometry(0.022 * S, 0.004 * S, 8, 32);
    const irisMat = new THREE.MeshBasicMaterial({
      color: 0xaaffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const iris = new THREE.Mesh(irisGeo, irisMat);
    iris.position.set(x, eyeY, eyeZ + 0.025 * S);
    iris.lookAt(x, eyeY, eyeZ + 1);
    group.add(iris);

    // Inner pupil glow
    const pupilGeo = new THREE.CircleGeometry(0.012 * S, 16);
    const pupilMat = new THREE.MeshBasicMaterial({
      color: 0x55eeff,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.position.set(x, eyeY, eyeZ + 0.026 * S);
    pupil.lookAt(x, eyeY, eyeZ + 1);
    group.add(pupil);

    // Outer glow sprite
    const glowMat = new THREE.SpriteMaterial({
      color: 0x55ccff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Sprite(glowMat);
    glow.scale.setScalar(0.25 * S);
    glow.position.set(x, eyeY, eyeZ + 0.01 * S);
    group.add(glow);

    return { iris, irisMat, pupil, pupilMat, glow, glowMat };
  }

  const eyeLeft = makeEyeRing(-eyeDX);
  const eyeRight = makeEyeRing(eyeDX);

  // ============================================================
  // HEART / CORE REACTOR
  // ============================================================
  const heartY = cy(Y.sternum);
  const heartZ = 0.06 * S;

  // Inner core — bright sphere
  const heartCoreGeo = new THREE.IcosahedronGeometry(0.06 * S, 2);
  const heartCoreMat = new THREE.MeshBasicMaterial({
    color: 0x66eeff, transparent: true, opacity: 0.6,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const heartCore = new THREE.Mesh(heartCoreGeo, heartCoreMat);
  heartCore.position.set(0, heartY, heartZ);
  group.add(heartCore);

  // Nested wireframe icosahedrons — reactor cage
  const cageFrames: THREE.Mesh[] = [];
  const cageFrameMats: THREE.MeshBasicMaterial[] = [];
  const cageSizes = [0.10, 0.14, 0.19];
  const cageColors = [0x66eeff, 0x44aacc, 0x3388aa];
  for (let i = 0; i < cageSizes.length; i++) {
    const cGeo = new THREE.IcosahedronGeometry(cageSizes[i] * S, 1);
    const cMat = new THREE.MeshBasicMaterial({
      color: cageColors[i], wireframe: true, transparent: true,
      opacity: 0.25 - i * 0.06,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const cage = new THREE.Mesh(cGeo, cMat);
    cage.position.set(0, heartY, heartZ);
    if (!isMobile) group.add(cage);
    cageFrames.push(cage);
    cageFrameMats.push(cMat);
  }

  // Heart glow sprite
  const heartGlowMat = new THREE.SpriteMaterial({
    color: 0x66eeff, transparent: true, opacity: 0.35,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const heartGlow = new THREE.Sprite(heartGlowMat);
  heartGlow.scale.setScalar(0.6 * S);
  heartGlow.position.set(0, heartY, heartZ);
  group.add(heartGlow);

  // Energy tendrils from heart — radial lines
  const tendrilCount = 8;
  const tendrilLines: { geo: THREE.BufferGeometry; mat: THREE.LineBasicMaterial }[] = [];
  for (let i = 0; i < tendrilCount; i++) {
    const angle = (i / tendrilCount) * PI2;
    const pts: number[] = [];
    const segs = 20;
    for (let j = 0; j <= segs; j++) {
      const t = j / segs;
      const r = t * 0.25 * S;
      pts.push(
        Math.cos(angle) * r,
        heartY + Math.sin(t * PI * 2 + angle) * 0.04 * S,
        heartZ + Math.sin(angle) * r,
      );
    }
    const tGeo = new THREE.BufferGeometry();
    tGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    const tMat = new THREE.LineBasicMaterial({
      color: 0x66eeff, transparent: true, opacity: 0.3,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const line = new THREE.Line(tGeo, tMat);
    if (!isMobile) group.add(line);
    tendrilLines.push({ geo: tGeo, mat: tMat });
  }

  // ============================================================
  // HOLOGRAPHIC PLATFORM / BASE
  // ============================================================
  // Grid floor using custom shader
  const gridGeo = new THREE.PlaneGeometry(8 * S, 8 * S, 1, 1);
  const gridMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uEnergy: { value: 0 },
    },
    vertexShader: GRID_VERTEX,
    fragmentShader: GRID_FRAGMENT,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const gridFloor = new THREE.Mesh(gridGeo, gridMat);
  gridFloor.rotation.x = -PI / 2;
  gridFloor.position.y = cy(Y.sole) - 0.01;
  if (!isMobile) group.add(gridFloor);

  // Concentric rings
  const baseRings: THREE.Mesh[] = [];
  const baseRingMats: THREE.MeshBasicMaterial[] = [];
  const ringR = [0.6, 0.9, 1.2, 1.5, 1.8, 2.1, 2.5];
  const ringC = [0x44ddff, 0xffc24d, 0x44ddff, 0xbb88ff, 0xffc24d, 0x44ddff, 0xbb88ff];
  for (let i = 0; i < ringR.length; i++) {
    const rGeo = new THREE.TorusGeometry(ringR[i] * S, 0.006, 6, 140);
    const rMat = new THREE.MeshBasicMaterial({
      color: ringC[i], transparent: true, opacity: 0.35 - i * 0.04,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.rotation.x = PI * 0.5;
    ring.position.y = cy(Y.sole);
    if (!isMobile) group.add(ring);
    baseRings.push(ring);
    baseRingMats.push(rMat);
  }

  // Holographic symbols rotating around base (torus ring with text-like markers)
  const symbolRingGeo = new THREE.TorusGeometry(2.3 * S, 0.003, 4, 80);
  const symbolRingMat = new THREE.MeshBasicMaterial({
    color: 0x5fe6ff, transparent: true, opacity: 0.15,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const symbolRing = new THREE.Mesh(symbolRingGeo, symbolRingMat);
  symbolRing.rotation.x = PI * 0.5;
  symbolRing.position.y = cy(Y.sole) + 0.05;
  if (!isMobile) group.add(symbolRing);

  // Small marker nodes on the symbol ring
  const symbolMarkers: THREE.Mesh[] = [];
  const markerCount = 16;
  for (let i = 0; i < markerCount; i++) {
    const a = (i / markerCount) * PI2;
    const mGeo = new THREE.BoxGeometry(0.04 * S, 0.02 * S, 0.005 * S);
    const mMat = new THREE.MeshBasicMaterial({
      color: i % 3 === 0 ? 0xffc24d : 0x5fe6ff,
      transparent: true, opacity: 0.3,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const marker = new THREE.Mesh(mGeo, mMat);
    marker.position.set(Math.cos(a) * 2.3 * S, cy(Y.sole) + 0.05, Math.sin(a) * 2.3 * S);
    marker.lookAt(0, cy(Y.sole) + 0.05, 0);
    if (!isMobile) group.add(marker);
    symbolMarkers.push(marker);
  }

  // ============================================================
  // VOLUMETRIC LIGHT CONE from above
  // ============================================================
  const coneGeo = new THREE.ConeGeometry(1.5 * S, 6 * S, 32, 1, true);
  const coneMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uEnergy: { value: 0 },
    },
    vertexShader: CONE_VERTEX,
    fragmentShader: CONE_FRAGMENT,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const lightCone = new THREE.Mesh(coneGeo, coneMat);
  lightCone.position.set(0, cy(Y.crown) + 2.5 * S, 0);
  lightCone.rotation.x = PI; // point down
  if (!isMobile) group.add(lightCone);

  // ============================================================
  // DNA / ENERGY HELIX
  // ============================================================
  const helixSegments = 200;
  const helixPtsA: number[] = [];
  const helixPtsB: number[] = [];
  const helixBridges: number[] = [];

  for (let i = 0; i <= helixSegments; i++) {
    const t = i / helixSegments;
    const yy = cy(Y.crotch) + t * (Y.crown - Y.crotch) * S;
    const r = (0.42 + Math.sin(t * PI * 2) * 0.05) * S;
    const a = t * PI * 7;
    helixPtsA.push(r * Math.cos(a), yy, r * Math.sin(a));
    helixPtsB.push(r * Math.cos(a + PI), yy, r * Math.sin(a + PI));
  }
  // Bridges
  for (let i = 0; i <= helixSegments; i += 10) {
    const t = i / helixSegments;
    const yy = cy(Y.crotch) + t * (Y.crown - Y.crotch) * S;
    const r = (0.42 + Math.sin(t * PI * 2) * 0.05) * S;
    const a = t * PI * 7;
    for (let j = 0; j <= 8; j++) {
      const lt = j / 8;
      helixBridges.push(
        r * Math.cos(a) * (1 - lt) + r * Math.cos(a + PI) * lt,
        yy,
        r * Math.sin(a) * (1 - lt) + r * Math.sin(a + PI) * lt,
      );
    }
  }

  // Helix strand A
  const helixGeoA = new THREE.BufferGeometry();
  helixGeoA.setAttribute('position', new THREE.BufferAttribute(new Float32Array(helixPtsA), 3));
  const helixMatA = new THREE.LineBasicMaterial({
    color: 0x55ddff, transparent: true, opacity: 0.35,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const helixLineA = new THREE.Line(helixGeoA, helixMatA);
  group.add(helixLineA);

  // Helix strand B
  const helixGeoB = new THREE.BufferGeometry();
  helixGeoB.setAttribute('position', new THREE.BufferAttribute(new Float32Array(helixPtsB), 3));
  const helixMatB = new THREE.LineBasicMaterial({
    color: 0xffc24d, transparent: true, opacity: 0.3,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const helixLineB = new THREE.Line(helixGeoB, helixMatB);
  group.add(helixLineB);

  // Helix bridges as particles
  const helixBridgeParticles = createShaderParticles(helixBridges, [0.7, 0.5, 1.0], 1.5, { colorVariance: 0.15 });
  group.add(helixBridgeParticles.points);
  allShaderLayers.push(helixBridgeParticles);

  // Helix group for independent rotation
  const helixGroup = new THREE.Group();
  helixGroup.add(helixLineA);
  helixGroup.add(helixLineB);
  helixGroup.add(helixBridgeParticles.points);
  if (!isMobile) group.add(helixGroup);

  // ============================================================
  // ORBITING DATA NODES
  // ============================================================
  const ORBIT_N = 8;
  const nodeColors = [0x5fe6ff, 0xffc24d, 0xff5d73, 0xb06aff, 0x4dff91, 0xff9f43, 0x55aaff, 0xffdd44];

  interface OrbitalNode {
    mesh: THREE.Mesh;
    glow: THREE.Sprite;
    line: THREE.Line;
    lineGeo: THREE.BufferGeometry;
    orbit: { a: number; r: number; spd: number; tilt: number; ph: number; yBase: number };
  }

  const orbitNodes: OrbitalNode[] = [];

  for (let i = 0; i < ORBIT_N; i++) {
    // Node sphere
    const nGeo = new THREE.IcosahedronGeometry(0.035, 1);
    const nMat = new THREE.MeshBasicMaterial({
      color: nodeColors[i], transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const node = new THREE.Mesh(nGeo, nMat);
    if (!isMobile) group.add(node);

    // Node glow
    const glMat = new THREE.SpriteMaterial({
      color: nodeColors[i], transparent: true, opacity: 0.4,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const gl = new THREE.Sprite(glMat);
    gl.scale.setScalar(0.3);
    if (!isMobile) group.add(gl);

    // Connection line to body
    const lGeo = new THREE.BufferGeometry();
    const lPositions = new Float32Array(6); // 2 points
    lGeo.setAttribute('position', new THREE.BufferAttribute(lPositions, 3));
    const lMat = new THREE.LineBasicMaterial({
      color: nodeColors[i], transparent: true, opacity: 0.15,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const line = new THREE.Line(lGeo, lMat);
    if (!isMobile) group.add(line);

    orbitNodes.push({
      mesh: node,
      glow: gl,
      line,
      lineGeo: lGeo,
      orbit: {
        a: (i / ORBIT_N) * PI2,
        r: (1.6 + (i % 3) * 0.25) * S,
        spd: 0.3 + i * 0.05,
        tilt: (PI / 6) * ((i % 3) - 1),
        ph: i * 0.9,
        yBase: BY + (1.2 + (i % 4) * 0.3) * S,
      },
    });
  }

  // ============================================================
  // WIREFRAME SCAN OVERLAYS
  // ============================================================
  const faceWireGeo = new THREE.SphereGeometry(0.135 * S * 1.05, 10, 10);
  const faceWireMat = new THREE.MeshBasicMaterial({
    color: 0x6fe0ff, wireframe: true, transparent: true, opacity: 0.12,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const faceWire = new THREE.Mesh(faceWireGeo, faceWireMat);
  faceWire.position.set(0, cy((Y.crown + Y.chin) / 2), 0);
  faceWire.scale.set(1, 1.1, 0.95);
  if (!isMobile) group.add(faceWire);

  const chestWireGeo = new THREE.IcosahedronGeometry(0.26 * S, 1);
  const chestWireMat = new THREE.MeshBasicMaterial({
    color: 0x5fe6ff, wireframe: true, transparent: true, opacity: 0.1,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const chestWire = new THREE.Mesh(chestWireGeo, chestWireMat);
  chestWire.position.set(0, cy(Y.pec - 0.05), 0);
  chestWire.scale.set(1.05, 0.8, 0.7);
  if (!isMobile) group.add(chestWire);

  // ============================================================
  // SCAN LINE EFFECT — bright horizontal sweep
  // ============================================================
  const scanLineGeo = new THREE.PlaneGeometry(3 * S, 0.03 * S);
  const scanLineMat = new THREE.MeshBasicMaterial({
    color: 0x88eeff, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false,
    side: THREE.DoubleSide,
  });
  const scanLine = new THREE.Mesh(scanLineGeo, scanLineMat);
  scanLine.position.set(0, cy(Y.sole), 0.2);
  if (!isMobile) group.add(scanLine);

  // Secondary ambient scan lines
  const scanCount = 16;
  const ambientScans: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; baseY: number }[] = [];
  const scanLo = Y.sole, scanHi = Y.crown;
  for (let i = 0; i < scanCount; i++) {
    const sGeo = new THREE.PlaneGeometry(1.5 * S, 0.005 * S);
    const sMat = new THREE.MeshBasicMaterial({
      color: 0x44ddff, transparent: true, opacity: 0.04,
      blending: THREE.AdditiveBlending, depthWrite: false,
      side: THREE.DoubleSide,
    });
    const sm = new THREE.Mesh(sGeo, sMat);
    const baseY = cy(scanLo + (i / scanCount) * (scanHi - scanLo));
    sm.position.set(0, baseY, 0);
    if (!isMobile) group.add(sm);
    ambientScans.push({ mesh: sm, mat: sMat, baseY });
  }

  // ============================================================
  // HEAD HALO
  // ============================================================
  const haloMat = new THREE.SpriteMaterial({
    color: 0x55ccee, transparent: true, opacity: 0.12,
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
  });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.setScalar(2.6 * S);
  halo.position.set(0, cy(Y.brow), -0.3);
  group.add(halo);

  const halo2Mat = new THREE.SpriteMaterial({
    color: 0xffc24d, transparent: true, opacity: 0.06,
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
  });
  const halo2 = new THREE.Sprite(halo2Mat);
  halo2.scale.setScalar(3.8 * S);
  halo2.position.set(0, cy(Y.brow), -0.5);
  group.add(halo2);

  // ============================================================
  // ENERGY RIBBONS (flowing curves)
  // ============================================================
  const ribbonCount = 8;
  const ribbonSegs = 80;
  interface RibbonData {
    geo: THREE.BufferGeometry;
    bx: number[];
    by: number[];
    bz: number[];
    mat: THREE.LineBasicMaterial;
  }
  const ribbons: RibbonData[] = [];
  const rColors = [0x44ddff, 0xffc24d, 0x55aaff, 0xffaa44, 0x44ddff, 0xbb88ff, 0x44ddff, 0xffc24d];

  for (let r = 0; r < ribbonCount; r++) {
    const pts: number[] = [];
    const bx: number[] = [], by: number[] = [], bz: number[] = [];
    const side = r % 2 === 0 ? -1 : 1;
    const phase = r * 0.8;

    for (let i = 0; i <= ribbonSegs; i++) {
      const t = i / ribbonSegs;
      const x = (side * (0.15 + t * 1.2) + Math.sin(t * 6 + phase) * 0.1) * S;
      const y = BY + (1.9 - (r % 3) * 0.15 - t * 0.5 + Math.sin(t * 5 + phase) * 0.12) * S;
      const z = Math.sin(t * 7 + phase) * 0.18 * S;
      pts.push(x, y, z);
      bx.push(x); by.push(y); bz.push(z);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    const mat = new THREE.LineBasicMaterial({
      color: rColors[r], transparent: true, opacity: 0.3,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const ribbonLine = new THREE.Line(geo, mat);
    if (!isMobile) group.add(ribbonLine);
    ribbons.push({ geo, bx, by, bz, mat });
  }

  // ============================================================
  // ANIMATION STATE
  // ============================================================
  let amp = 0.06, ampTarget = 0.06;
  let time = 0;
  let raf = 0;
  let glitchTimer = 0;
  let glitchStrength = 0;
  let nextGlitchAt = 3 + Math.random() * 5;

  const drift = { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0, timer: 0, interval: 4 };

  function pickDrift() {
    drift.tx = rng(-1.2, 1.2);
    drift.ty = rng(-0.4, 0.4);
    drift.tz = rng(-0.8, 0.8);
    drift.interval = 3 + Math.random() * 5;
    drift.timer = 0;
  }

  // ============================================================
  // BODY DETECTION (MediaPipe) — kept exactly as-is
  // ============================================================
  let holisticActive = false;
  let holisticVideo: HTMLVideoElement | null = null;
  let holisticCanvas: HTMLCanvasElement | null = null;
  let holisticCtx: CanvasRenderingContext2D | null = null;
  let holisticInstance: any = null;
  let holisticCamera: any = null;
  let holisticOverlay: HTMLDivElement | null = null;

  function createHolisticOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'holisticOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:3;display:flex;align-items:center;justify-content:center;pointer-events:none;';
    const cvs = document.createElement('canvas');
    cvs.style.cssText = 'width:60%;height:70%;max-width:640px;max-height:480px;border-radius:16px;border:1px solid rgba(95,230,255,.2);box-shadow:0 0 40px rgba(95,230,255,.1);background:transparent;';
    overlay.appendChild(cvs);
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'position:absolute;top:20px;right:20px;width:36px;height:36px;border-radius:10px;background:rgba(8,12,24,.7);border:1px solid rgba(255,194,77,.2);color:#ffc24d;font-size:16px;cursor:pointer;pointer-events:all;z-index:10;backdrop-filter:blur(10px);';
    closeBtn.onclick = () => stopBodyDetection();
    overlay.appendChild(closeBtn);
    const label = document.createElement('div');
    label.style.cssText = 'position:absolute;top:20px;left:50%;transform:translateX(-50%);font-family:"Space Grotesk",sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#5fe6ff;opacity:.7;background:rgba(8,12,24,.6);padding:6px 16px;border-radius:8px;border:1px solid rgba(95,230,255,.15);backdrop-filter:blur(10px);';
    label.textContent = 'BODY DETECTION';
    overlay.appendChild(label);
    const status = document.createElement('div');
    status.id = 'holisticStatus';
    status.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);font-family:"Space Grotesk",sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#ffc24d;opacity:.6;background:rgba(8,12,24,.6);padding:5px 14px;border-radius:8px;border:1px solid rgba(255,194,77,.15);backdrop-filter:blur(10px);';
    status.textContent = 'INITIALIZING...';
    overlay.appendChild(status);
    document.body.appendChild(overlay);
    holisticOverlay = overlay;
    holisticCanvas = cvs;
    holisticCtx = cvs.getContext('2d');
    return { cvs, status };
  }

  async function loadHolisticScripts(): Promise<boolean> {
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
    ];
    for (const src of scripts) {
      if (document.querySelector(`script[src="${src}"]`)) continue;
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src; s.crossOrigin = 'anonymous';
        s.onload = () => resolve(); s.onerror = () => reject(new Error('Failed to load: ' + src));
        document.head.appendChild(s);
      });
    }
    return true;
  }

  async function startBodyDetection() {
    if (holisticActive) return;
    holisticActive = true;
    const { cvs, status } = createHolisticOverlay();
    try {
      await loadHolisticScripts();
      status.textContent = 'LOADING MODEL...';
      const W = window as any;
      const vid = document.createElement('video');
      vid.style.display = 'none';
      document.body.appendChild(vid);
      holisticVideo = vid;
      const holistic = new W.Holistic({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}` });
      holisticInstance = holistic;
      holistic.setOptions({ modelComplexity: 1, smoothLandmarks: true, refineFaceLandmarks: true });
      holistic.onResults((results: any) => {
        if (!holisticCtx || !holisticCanvas) return;
        const cw = cvs.width = cvs.clientWidth * (window.devicePixelRatio || 1);
        const ch = cvs.height = cvs.clientHeight * (window.devicePixelRatio || 1);
        const ctx = holisticCtx;
        ctx.clearRect(0, 0, cw, ch);
        ctx.save(); ctx.globalAlpha = 0.15;
        if (results.image) ctx.drawImage(results.image, 0, 0, cw, ch);
        ctx.restore();
        if (results.poseLandmarks) {
          W.drawConnectors(ctx, results.poseLandmarks, W.POSE_CONNECTIONS, { color: '#5fe6ff', lineWidth: 2 });
          W.drawLandmarks(ctx, results.poseLandmarks, { color: '#ffc24d', fillColor: '#ffc24d', lineWidth: 1, radius: 3 });
        }
        if (results.faceLandmarks) W.drawConnectors(ctx, results.faceLandmarks, W.FACEMESH_TESSELATION, { color: 'rgba(95,230,255,0.3)', lineWidth: 0.5 });
        if (results.leftHandLandmarks) W.drawConnectors(ctx, results.leftHandLandmarks, W.HAND_CONNECTIONS, { color: '#b06aff', lineWidth: 1.5 });
        if (results.rightHandLandmarks) W.drawConnectors(ctx, results.rightHandLandmarks, W.HAND_CONNECTIONS, { color: '#ff7a2e', lineWidth: 1.5 });
        status.textContent = 'TRACKING ACTIVE'; status.style.color = '#39e75f';
      });
      const cam = new W.Camera(vid, { onFrame: async () => { await holistic.send({ image: vid }); }, width: 640, height: 480 });
      holisticCamera = cam;
      await cam.start();
      status.textContent = 'CAMERA READY';
    } catch (err: any) {
      status.textContent = 'ERROR: ' + (err.message || 'Camera failed');
      status.style.color = '#ff5d73';
    }
  }

  function stopBodyDetection() {
    holisticActive = false;
    if (holisticCamera) { try { holisticCamera.stop(); } catch {} holisticCamera = null; }
    if (holisticInstance) { try { holisticInstance.close(); } catch {} holisticInstance = null; }
    if (holisticVideo) { holisticVideo.remove(); holisticVideo = null; }
    if (holisticOverlay) { holisticOverlay.remove(); holisticOverlay = null; }
    holisticCanvas = null; holisticCtx = null;
  }

  // ============================================================
  // ANIMATION LOOP
  // ============================================================
  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = 0.016;
    time += dt;
    amp += (ampTarget - amp) * 0.07;

    // ---- Drift ----
    drift.timer += dt;
    if (drift.timer >= drift.interval) pickDrift();
    drift.x += (drift.tx - drift.x) * 0.01;
    drift.y += (drift.ty - drift.y) * 0.01;
    drift.z += (drift.tz - drift.z) * 0.01;

    // Noise-based idle sway
    const swayX = noise1D(time * 0.13) * 0.25 + noise1D(time * 0.31) * 0.08;
    const swayY = noise1D(time * 0.19 + 100) * 0.12 + noise1D(time * 0.43 + 100) * 0.05;
    const swayZ = noise1D(time * 0.16 + 200) * 0.15;

    group.position.x = drift.x + swayX;
    group.position.y = drift.y + swayY;
    group.position.z = drift.z + swayZ;

    // ---- Holographic glitch ----
    glitchTimer += dt;
    if (glitchTimer >= nextGlitchAt) {
      glitchStrength = 0.5 + Math.random() * 0.5;
      nextGlitchAt = glitchTimer + 2 + Math.random() * 6;
    }
    glitchStrength *= 0.92; // decay
    if (glitchStrength < 0.01) glitchStrength = 0;

    // ---- Scan line sweep ----
    const scanRange = (Y.crown - Y.sole) * S;
    const scanYRaw = cy(Y.sole) + ((time * 0.5 * S) % scanRange);
    scanLine.position.y = scanYRaw;
    scanLineMat.opacity = 0.3 + amp * 0.4 + Math.sin(time * 8) * 0.1;

    // ---- Update all shader uniforms ----
    for (const layer of allShaderLayers) {
      layer.mat.uniforms.uTime.value = time;
      layer.mat.uniforms.uEnergy.value = amp;
      layer.mat.uniforms.uScanY.value = scanYRaw;
      layer.mat.uniforms.uGlitchStrength.value = glitchStrength;
    }

    // Grid + cone uniforms
    gridMat.uniforms.uTime.value = time;
    gridMat.uniforms.uEnergy.value = amp;
    coneMat.uniforms.uTime.value = time;
    coneMat.uniforms.uEnergy.value = amp;

    // ---- Energy flow animation ----
    const flowPos = energyFlow.geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < FLOW_N; i++) {
      flowPhase[i] = (flowPhase[i] + flowSpeed[i] * 0.0016 * (1 + amp * 1.5)) % 1;
      const rise = flowPhase[i] * 0.45 * S;
      const fade = Math.sin(flowPhase[i] * PI);
      const sway2 = Math.sin(time * 1.3 + i * 0.1) * 0.012 * S * fade;
      flowPos.setXYZ(i,
        flowBasePos[i * 3] + sway2,
        flowBasePos[i * 3 + 1] + rise,
        flowBasePos[i * 3 + 2] + Math.cos(time * 1.1 + i * 0.1) * 0.01 * S * fade,
      );
    }
    flowPos.needsUpdate = true;

    // ---- Data stream animation ----
    const dsPos = dataStreams.geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < DATA_STREAM_N; i++) {
      dataStreamPhase[i] = (dataStreamPhase[i] + dataStreamSpeed[i] * 0.002 * (1 + amp)) % 1;
      const rise = dataStreamPhase[i] * 0.6 * S;
      dsPos.setXYZ(i,
        dataStreamBase[i * 3] + Math.sin(time * 2 + i) * 0.005 * S,
        dataStreamBase[i * 3 + 1] + rise,
        dataStreamBase[i * 3 + 2],
      );
    }
    dsPos.needsUpdate = true;

    // ---- DNA helix rotation + color shift ----
    helixGroup.rotation.y = time * 0.15;
    const helixHue = Math.sin(time * 0.3) * 0.5 + 0.5; // 0-1
    helixMatA.color.setHSL(0.52 + helixHue * 0.1, 0.8, 0.6);
    helixMatB.color.setHSL(0.12 + helixHue * 0.05, 0.85, 0.55);
    helixMatA.opacity = 0.25 + amp * 0.2 + Math.sin(time * 1.5) * 0.05;
    helixMatB.opacity = 0.2 + amp * 0.18 + Math.sin(time * 1.5 + 1) * 0.05;

    // ---- Heart / Core Reactor ----
    const hp = 1 + Math.sin(time * 2.5) * 0.15 + amp * 0.4;
    heartCore.scale.setScalar(hp);
    heartCoreMat.opacity = 0.35 + amp * 0.5 + Math.sin(time * 3) * 0.1;
    heartCore.rotation.y = time * 0.6;

    for (let i = 0; i < cageFrames.length; i++) {
      const cage = cageFrames[i];
      cage.scale.setScalar(hp * (1 + i * 0.15));
      cage.rotation.y = time * (0.4 - i * 0.15) * (i % 2 === 0 ? 1 : -1);
      cage.rotation.x = time * (0.2 + i * 0.05);
      cage.rotation.z = Math.sin(time * 0.3 + i) * 0.2;
      cageFrameMats[i].opacity = (0.2 - i * 0.04) + amp * 0.2;
    }

    heartGlowMat.opacity = 0.2 + amp * 0.3 + Math.sin(time * 2.8) * 0.08;
    heartGlow.scale.setScalar((0.5 + amp * 0.3 + Math.sin(time * 2.5) * 0.08) * S);

    // Heart tendrils animation
    for (let t = 0; t < tendrilCount; t++) {
      const td = tendrilLines[t];
      td.mat.opacity = 0.15 + amp * 0.25 + Math.sin(time * 2 + t) * 0.1;
      const pos = td.geo.attributes.position as THREE.BufferAttribute;
      const angle = (t / tendrilCount) * PI2 + time * 0.3;
      for (let j = 0; j <= 20; j++) {
        const frac = j / 20;
        const r = frac * 0.25 * S * (1 + amp * 0.3);
        pos.setXYZ(j,
          Math.cos(angle) * r,
          heartY + Math.sin(frac * PI * 2 + time * 2 + angle) * 0.04 * S,
          heartZ + Math.sin(angle) * r,
        );
      }
      pos.needsUpdate = true;
    }

    // ---- Eyes ----
    const eg = 0.6 + amp * 0.35 + Math.sin(time * 2.2) * 0.1;
    eyeLeft.irisMat.opacity = eg;
    eyeRight.irisMat.opacity = eg;
    eyeLeft.pupilMat.opacity = eg * 0.8;
    eyeRight.pupilMat.opacity = eg * 0.8;
    eyeLeft.glowMat.opacity = eg * 0.35;
    eyeRight.glowMat.opacity = eg * 0.35;

    // Eye scanning/tracking — subtle iris rotation
    eyeLeft.iris.rotation.z = time * 0.5 + Math.sin(time * 0.7) * 0.3;
    eyeRight.iris.rotation.z = time * 0.5 + Math.sin(time * 0.7 + 0.5) * 0.3;

    // Head tilt/nod
    const headNod = Math.sin(time * 0.35) * 0.02;
    const headTilt = Math.sin(time * 0.23) * 0.015;
    faceWire.rotation.x = headNod;
    faceWire.rotation.z = headTilt;

    // ---- Wireframe overlays ----
    faceWireMat.opacity = 0.08 + amp * 0.12 + Math.sin(time * 1.6) * 0.04;
    chestWireMat.opacity = 0.07 + amp * 0.14 + Math.sin(time * 1.9 + 1) * 0.04;
    faceWire.rotation.y = Math.sin(time * 0.3) * 0.15;
    chestWire.rotation.y = time * 0.2;
    const breath = Math.sin(time * 0.9);
    const brX = 1 + breath * 0.009 + amp * 0.016;
    const br = 1 + breath * 0.006 + amp * 0.014;
    chestWire.scale.set(1.05 * brX, 0.8 * br, 0.7 * brX);

    // ---- Ambient scan lines ----
    for (let i = 0; i < scanCount; i++) {
      const sc = ambientScans[i];
      const newY = cy(Y.sole) + ((sc.baseY - cy(Y.sole) + time * 0.3 * S) % scanRange);
      sc.mesh.position.y = newY;
      sc.mat.opacity = 0.035 + amp * 0.05;
    }

    // ---- Ribbons ----
    for (const rb of ribbons) {
      const pos = rb.geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i <= ribbonSegs; i++) {
        const t2 = i / ribbonSegs;
        pos.setX(i, rb.bx[i] + Math.sin(time * 1.6 + t2 * 5) * 0.07 * S * (1 + amp * 2));
        pos.setY(i, rb.by[i] + Math.sin(time * 1.2 + t2 * 4) * 0.04 * S * (1 + amp));
        pos.setZ(i, rb.bz[i] + Math.cos(time * 1.4 + t2 * 5) * 0.05 * S * (1 + amp));
      }
      pos.needsUpdate = true;
      rb.mat.opacity = 0.2 + amp * 0.35;
    }

    // ---- Base rings ----
    for (let i = 0; i < baseRings.length; i++) {
      baseRings[i].rotation.z = time * (0.05 + i * 0.025) * (i % 2 === 0 ? 1 : -1);
      baseRingMats[i].opacity = (0.3 - i * 0.04) + amp * 0.15;
    }

    // Symbol ring rotation
    symbolRing.rotation.z = time * 0.08;
    for (let i = 0; i < symbolMarkers.length; i++) {
      const a = (i / markerCount) * PI2 + time * 0.08;
      symbolMarkers[i].position.set(
        Math.cos(a) * 2.3 * S,
        cy(Y.sole) + 0.05,
        Math.sin(a) * 2.3 * S,
      );
      symbolMarkers[i].lookAt(0, cy(Y.sole) + 0.05, 0);
    }

    // ---- Halos ----
    haloMat.opacity = 0.08 + amp * 0.15 + Math.sin(time * 1.1) * 0.02;
    halo.scale.setScalar((2.5 + amp * 0.5) * S);
    halo2Mat.opacity = 0.04 + amp * 0.06;
    halo2.scale.setScalar((3.5 + amp * 0.4) * S);

    // ---- Orbiting nodes ----
    const sm = 1 + amp * 3.5;
    for (let i = 0; i < ORBIT_N; i++) {
      const nd = orbitNodes[i];
      const d = nd.orbit;
      d.a += d.spd * dt * sm;
      const rr = d.r + Math.sin(time * 0.35 + d.ph) * 0.08 + amp * 0.3 * Math.sin(time * 1.8 + d.ph);
      const x = Math.cos(d.a) * rr;
      const z = Math.sin(d.a) * rr;
      const y = d.yBase + Math.sin(d.a + d.tilt) * 0.5 * S + Math.sin(time * 0.25 + d.ph) * 0.08;

      nd.mesh.position.set(x, y, z);
      nd.glow.position.set(x, y, z);
      nd.glow.scale.setScalar(0.3 + amp * 0.12 + Math.sin(time * 1.1 + d.ph) * 0.04);
      nd.mesh.rotation.y = time * 2;
      nd.mesh.rotation.x = time * 1.3;

      // Update connection line
      const lPos = nd.lineGeo.attributes.position as THREE.BufferAttribute;
      lPos.setXYZ(0, x, y, z);
      // Connect to nearest body point (approximate — aim at body center at same height)
      lPos.setXYZ(1, 0, y, 0);
      lPos.needsUpdate = true;
    }

    // ---- Rotation with parallax ----
    group.rotation.y = Math.sin(time * 0.1) * 0.1 + time * 0.015;

    // ---- Render ----
    if (composer) composer.render();
    else renderer.render(scene, camera);
  }

  frame();

  // ============================================================
  // PUBLIC INTERFACE
  // ============================================================
  return {
    setEnergy(v: number) { ampTarget = Math.max(0, Math.min(1, v)); },
    dispose() {
      cancelAnimationFrame(raf);
      stopBodyDetection();
      window.removeEventListener('resize', resize);
      renderer.dispose();
      if (composer) composer.dispose();
      container.removeChild(renderer.domElement);
    },
    startBodyDetection,
    stopBodyDetection,
  };
}
