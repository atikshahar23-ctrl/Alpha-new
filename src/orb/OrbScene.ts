import * as THREE from 'three';

export interface OrbHandle {
  setEnergy(v: number): void;
  dispose(): void;
  startBodyDetection(): void;
  stopBodyDetection(): void;
}

export function mountOrb(container: HTMLElement): OrbHandle {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 1.6, 6.5);
  camera.lookAt(0, 1.4, 0);

  function resize() {
    const w = container.clientWidth || 240;
    const h = container.clientHeight || w;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // --- GLOW TEXTURES (high-res) ---
  function makeGlow(r: number, g: number, b: number, sz = 128) {
    const c = document.createElement('canvas');
    c.width = c.height = sz;
    const ctx = c.getContext('2d')!;
    const h = sz / 2;
    const grd = ctx.createRadialGradient(h, h, 0, h, h, h);
    grd.addColorStop(0, `rgba(${r},${g},${b},1)`);
    grd.addColorStop(0.15, `rgba(${r},${g},${b},.85)`);
    grd.addColorStop(0.35, `rgba(${r},${g},${b},.4)`);
    grd.addColorStop(0.6, `rgba(${r},${g},${b},.1)`);
    grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, sz, sz);
    return new THREE.CanvasTexture(c);
  }
  const glowCyan = makeGlow(95, 230, 255);
  const glowGold = makeGlow(255, 194, 77);
  const glowWhite = makeGlow(240, 248, 255);
  const glowPurple = makeGlow(176, 106, 255);

  const group = new THREE.Group();
  scene.add(group);

  const S = 2.5;
  const BY = -1.8;
  const PI = Math.PI;
  const PI2 = PI * 2;

  // ============================================================
  //  PREMIUM HUMANOID — anatomical layered particle construction
  // ------------------------------------------------------------
  //  Strategy: the body is a stack of cross-sections defined by a
  //  radius profile r(y). Particles are scattered on the SURFACE
  //  shell of those sections (not solid blobs) so the silhouette
  //  reads sharply. A per-section depth squash (z thinner than x)
  //  plus a front-density bias make it read as a human facing the
  //  camera. Multiple layers (inner shell / volume / aura / flow)
  //  build holographic depth.
  // ============================================================

  const innerPts: number[] = [];   // dense sharp body shell
  const midPts: number[] = [];     // volume layer (soft edges)
  const outerPts: number[] = [];   // ethereal glow aura
  const nervePts: number[] = [];   // skeleton / neural lines
  const veinPts: number[] = [];    // energy veins (gold)

  // Helpers
  function rng(lo: number, hi: number) { return lo + Math.random() * (hi - lo); }
  function smooth(t: number) { return t * t * (3 - 2 * t); }

  // Scatter particles around an elliptical cross-section ring at height y.
  // depth = z-radius / x-radius (humans are flatter front-to-back).
  // frontBias>0 pushes more particles toward +z (camera side) and
  // gives the section a subtle chest/face curvature.
  function ringScatter(arr: number[], cx: number, cy: number, cz: number,
                       rx: number, depth: number, jitter: number) {
    const a = Math.random() * PI2;
    const rz = rx * depth;
    // soft shell thickness so the surface isn't a razor line
    const sh = 1 - Math.random() * Math.random() * 0.22;
    arr.push(
      cx + rx * sh * Math.cos(a) + rng(-jitter, jitter),
      cy + rng(-jitter, jitter),
      cz + rz * sh * Math.sin(a) + rng(-jitter, jitter),
    );
  }

  // Build a tapered limb/segment from y0..y1 with radius profile fn(t).
  function segment(arr: number[], n: number,
                   x0: number, y0: number, z0: number,
                   x1: number, y1: number, z1: number,
                   rFn: (t: number) => number, depth: number, jitter: number) {
    for (let i = 0; i < n; i++) {
      const t = Math.random();
      const cx = x0 + (x1 - x0) * t;
      const cy = y0 + (y1 - y0) * t;
      const cz = z0 + (z1 - z0) * t;
      ringScatter(arr, cx, cy, cz, rFn(t), depth, jitter);
    }
  }

  function spherePts(arr: number[], cx: number, cy: number, cz: number, r: number, n: number, sq = 1) {
    for (let i = 0; i < n; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const th = Math.random() * PI2;
      const sr = r * (0.9 + Math.random() * 0.1);
      arr.push(
        cx + sr * Math.sin(phi) * Math.cos(th),
        cy + sr * Math.cos(phi),
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

  // Vertical anchor heights (in S-units above BY) — 7.5-head proportions.
  // head top ~2.55, chin ~2.16, shoulders ~1.98, chest ~1.78, waist ~1.42,
  // hips ~1.30, knee ~0.78, ankle ~0.18, foot sole ~0.10.
  const Y = {
    crown: 2.55, brow: 2.30, eye: 2.26, nose: 2.20, mouth: 2.12, chin: 2.16,
    jaw: 2.18, neckTop: 2.10, neckBot: 1.96, shoulder: 1.98, pec: 1.80,
    sternum: 1.72, rib: 1.62, navel: 1.46, waist: 1.42, hip: 1.30,
    crotch: 1.20, thigh: 0.95, knee: 0.78, calf: 0.50, ankle: 0.18, sole: 0.10,
  };
  const cy = (v: number) => BY + v * S;

  // ----- HEAD: ellipsoid skull + tapered face -----
  const headR = 0.135 * S;
  for (let i = 0; i < 2600; i++) {
    // bias slightly toward an egg shape (narrower at chin)
    const u = Math.random();
    const yy = cy(Y.chin) + (cy(Y.crown) - cy(Y.chin)) * u;
    const ty = (yy - cy(Y.chin)) / (cy(Y.crown) - cy(Y.chin)); // 0 chin -> 1 crown
    // face width profile: narrow chin, wide cheek/temples, round crown
    const w = (0.55 + 0.55 * Math.sin(ty * 0.85 * PI + 0.18)) * headR;
    ringScatter(innerPts, 0, yy, 0, w, 0.92, 0.006 * S);
  }
  // jaw / chin mass (denser, brings out jawline)
  for (let i = 0; i < 700; i++) {
    const t = Math.random();
    const yy = cy(Y.chin) + t * 0.07 * S;
    const w = (0.45 + 0.45 * t) * headR;
    // push chin forward (+z)
    ringScatter(innerPts, 0, yy, 0.03 * S * (1 - t), w, 0.85, 0.005 * S);
  }

  // ----- FACIAL FEATURES (denser concentration on the front face plane) -----
  const faceZ = 0.115 * S;
  // brow ridge
  for (let i = 0; i < 220; i++) {
    const x = rng(-0.085, 0.085) * S;
    innerPts.push(x, cy(Y.brow) + Math.abs(x) * 0.15 + rng(-0.004, 0.004) * S, faceZ + rng(-0.004, 0.004) * S);
  }
  // eye sockets — ring of denser points (sharp "scan" eyes)
  const eyeY = cy(Y.eye);
  const eyeZ = faceZ + 0.01 * S;
  const eyeDX = 0.052 * S;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 160; i++) {
      const a = Math.random() * PI2;
      const rr = 0.026 * S * (0.7 + Math.random() * 0.3);
      innerPts.push(side * eyeDX + rr * Math.cos(a), eyeY + rr * 0.7 * Math.sin(a), eyeZ + rng(-0.003, 0.003) * S);
    }
  }
  // nose bridge + tip
  for (let i = 0; i < 180; i++) {
    const t = Math.random();
    const yy = cy(Y.eye) - t * (Y.eye - Y.nose) * S;
    innerPts.push(rng(-0.012, 0.012) * S, yy, faceZ + t * 0.03 * S);
  }
  // nostrils flare
  spherePts(innerPts, -0.018 * S, cy(Y.nose), faceZ + 0.02 * S, 0.012 * S, 40, 0.8);
  spherePts(innerPts, 0.018 * S, cy(Y.nose), faceZ + 0.02 * S, 0.012 * S, 40, 0.8);
  // lips outline (two arcs)
  for (let lip = 0; lip < 2; lip++) {
    for (let i = 0; i < 80; i++) {
      const t = i / 79;
      const x = (t - 0.5) * 0.07 * S;
      const yy = cy(Y.mouth) + (lip === 0 ? 0.006 : -0.006) * S - Math.abs(x) * 0.06;
      innerPts.push(x, yy, faceZ + rng(-0.002, 0.002) * S);
    }
  }
  // cheekbones
  for (let side = -1; side <= 1; side += 2) {
    spherePts(innerPts, side * 0.075 * S, cy(Y.eye) - 0.025 * S, faceZ - 0.01 * S, 0.022 * S, 60, 0.8);
  }
  // ears
  for (let side = -1; side <= 1; side += 2) {
    spherePts(innerPts, side * headR * 0.98, cy(Y.eye) - 0.01 * S, -0.01 * S, 0.025 * S, 70, 0.6);
  }
  // hair / crown shimmer (slightly outside skull, swept back)
  for (let i = 0; i < 500; i++) {
    const t = Math.random();
    const yy = cy(Y.brow) + t * (Y.crown - Y.brow) * S;
    const ty = (yy - cy(Y.brow)) / (cy(Y.crown) - cy(Y.brow));
    const w = (0.6 + 0.4 * Math.sin(ty * PI)) * headR * 1.08;
    const a = rng(-PI, 0); // back/top hemisphere bias
    midPts.push(w * Math.cos(a), yy, w * 0.92 * Math.sin(a) - 0.01 * S);
  }

  // ----- NECK (tapered cylinder, sternocleidomastoid hint) -----
  segment(innerPts, 600, 0, cy(Y.neckBot), 0, 0, cy(Y.neckTop), 0,
    () => 0.06 * S, 0.9, 0.005 * S);
  // collarbone shelf -> trapezius rise toward shoulders
  for (let side = -1; side <= 1; side += 2) {
    segment(innerPts, 200, side * 0.04 * S, cy(Y.shoulder + 0.04), 0,
      side * 0.18 * S, cy(Y.shoulder), 0, () => 0.03 * S, 0.9, 0.006 * S);
  }

  // ----- TORSO: V-taper chest -> waist (anatomical radius profile) -----
  // r(t): t=0 at shoulders, t=1 at waist. Wide deltoid line, full chest,
  // tucked waist. Depth bias for ribcage.
  const torsoTopY = cy(Y.shoulder);
  const torsoBotY = cy(Y.waist);
  for (let i = 0; i < 5200; i++) {
    const t = Math.random();
    const ty = smooth(t);
    const yy = torsoTopY + (torsoBotY - torsoTopY) * t;
    // width: shoulders broad (0.30), chest (0.27), waist narrow (0.165)
    const w = (0.30 - 0.135 * ty + 0.02 * Math.sin(t * PI)) * S;
    const depth = 0.66 + 0.06 * Math.sin(t * PI); // ribcage rounder mid
    ringScatter(innerPts, 0, yy, 0, w, depth, 0.006 * S);
  }
  // Pectorals
  for (let side = -1; side <= 1; side += 2) {
    spherePts(innerPts, side * 0.10 * S, cy(Y.pec), 0.115 * S, 0.075 * S, 420, 0.55);
  }
  // Sternum line
  for (let i = 0; i < 120; i++) {
    const t = i / 119;
    innerPts.push(0, cy(Y.pec) - t * (Y.pec - Y.navel) * S, (0.14 - t * 0.02) * S);
  }
  // Abs — six-pack grid (denser nodes)
  for (let row = 0; row < 3; row++) {
    for (let side = -1; side <= 1; side += 2) {
      spherePts(innerPts, side * 0.045 * S, cy(Y.navel + 0.16) - row * 0.07 * S, 0.125 * S, 0.03 * S, 90, 0.5);
    }
  }
  // Obliques taper to waist
  for (let side = -1; side <= 1; side += 2) {
    segment(innerPts, 300, side * 0.20 * S, cy(Y.rib), 0.06 * S,
      side * 0.15 * S, cy(Y.waist), 0.05 * S, (t) => (0.05 - t * 0.015) * S, 0.7, 0.006 * S);
  }

  // ----- HIPS / PELVIS -----
  const hipTopY = cy(Y.waist);
  const hipBotY = cy(Y.crotch);
  for (let i = 0; i < 1800; i++) {
    const t = Math.random();
    const yy = hipTopY + (hipBotY - hipTopY) * t;
    const w = (0.165 + 0.085 * smooth(t)) * S; // flare out to hips
    ringScatter(innerPts, 0, yy, 0, w, 0.72, 0.006 * S);
  }

  // ----- LEGS (thigh -> knee -> calf -> ankle -> foot), both sides -----
  for (let side = -1; side <= 1; side += 2) {
    const hipX = side * 0.13 * S;
    const kneeX = side * 0.105 * S;
    const ankX = side * 0.085 * S;
    // Thigh (quadriceps): thick top, narrowing to knee
    segment(innerPts, 2600, hipX, cy(Y.crotch + 0.02), 0,
      kneeX, cy(Y.knee + 0.03), 0.01 * S,
      (t) => (0.115 - 0.045 * smooth(t)) * S, 0.8, 0.006 * S);
    // Knee joint
    spherePts(innerPts, kneeX, cy(Y.knee), 0.02 * S, 0.058 * S, 360, 0.85);
    // Calf (gastrocnemius bulge): swells then tapers to ankle
    segment(innerPts, 2000, kneeX, cy(Y.knee - 0.02), 0.01 * S,
      ankX, cy(Y.ankle), 0,
      (t) => (0.07 + 0.022 * Math.sin(smooth(t) * PI) - 0.03 * t) * S, 0.78, 0.006 * S);
    // Shin sharpening (front)
    segment(innerPts, 300, kneeX, cy(Y.knee - 0.04), 0.05 * S,
      ankX, cy(Y.ankle + 0.02), 0.04 * S, () => 0.02 * S, 0.6, 0.005 * S);
    // Ankle
    spherePts(innerPts, ankX, cy(Y.ankle), 0.01 * S, 0.04 * S, 200, 0.85);
    // Foot (extends forward +z), arch + toes
    for (let i = 0; i < 700; i++) {
      const t = Math.random();
      const x = ankX + side * rng(-0.02, 0.02) * S;
      const yy = cy(Y.sole) + rng(0, 0.03) * S * (1 - t);
      const z = (0.0 + t * 0.16) * S;
      const w = (0.045 - t * 0.02) * S;
      const a = Math.random() * PI2;
      innerPts.push(x + w * Math.cos(a), yy, z + w * 0.5 * Math.sin(a));
    }
    // Heel
    spherePts(innerPts, ankX, cy(Y.sole + 0.01), -0.02 * S, 0.035 * S, 150, 0.7);
  }

  // ----- SHOULDERS & ARMS (relaxed, slightly forward) -----
  for (let side = -1; side <= 1; side += 2) {
    const shX = side * 0.30 * S;
    const elbowX = side * 0.36 * S;
    const wristX = side * 0.40 * S;
    // Deltoid cap
    spherePts(innerPts, shX, cy(Y.shoulder), 0, 0.085 * S, 700, 0.85);
    // Upper arm (bicep/tricep)
    segment(innerPts, 1300, shX, cy(Y.shoulder - 0.04), 0,
      elbowX, cy(Y.rib - 0.06), 0.03 * S,
      (t) => (0.055 - 0.01 * t + 0.012 * Math.sin(t * PI)) * S, 0.85, 0.006 * S);
    // Elbow
    spherePts(innerPts, elbowX, cy(Y.rib - 0.06), 0.03 * S, 0.045 * S, 260, 0.85);
    // Forearm (angles slightly inward & forward, tapering to wrist)
    segment(innerPts, 1100, elbowX, cy(Y.rib - 0.08), 0.04 * S,
      wristX, cy(Y.navel - 0.02), 0.10 * S,
      (t) => (0.05 - 0.02 * t) * S, 0.82, 0.006 * S);
    // Wrist
    spherePts(innerPts, wristX, cy(Y.navel - 0.02), 0.10 * S, 0.03 * S, 160, 0.85);
    // Palm
    spherePts(innerPts, wristX + side * 0.01 * S, cy(Y.navel - 0.07), 0.13 * S, 0.04 * S, 240, 0.5);
    // Fingers (5, splayed slightly)
    for (let f = 0; f < 5; f++) {
      const spread = ((f - 2) / 4) * 0.06 * S;
      const fx = wristX + side * 0.01 * S + spread;
      const len = (0.06 + (f === 0 ? -0.015 : f === 2 ? 0.01 : 0)) * S;
      segment(innerPts, 70, fx, cy(Y.navel - 0.09), 0.14 * S,
        fx + spread * 0.4, cy(Y.navel - 0.09) - len, 0.16 * S,
        () => 0.012 * S, 0.7, 0.004 * S);
    }
  }

  // ============================================================
  //  VOLUME LAYER (mid) — softer, slightly offset copy of the shell
  //  Sampled from the inner shell and pushed gently outward to fill
  //  silhouette interior and round the edges.
  // ============================================================
  const innerCount = innerPts.length / 3;
  for (let i = 0; i < 4200; i++) {
    const idx = Math.floor(Math.random() * innerCount) * 3;
    const px = innerPts[idx], py = innerPts[idx + 1], pz = innerPts[idx + 2];
    // pull a little toward the central axis (fills interior) + jitter
    midPts.push(
      px * 0.93 + rng(-0.02, 0.02) * S,
      py + rng(-0.02, 0.02) * S,
      pz * 0.93 + rng(-0.02, 0.02) * S,
    );
  }

  // ============================================================
  //  ETHEREAL AURA (outer) — large soft particles ballooning the body
  // ============================================================
  for (let i = 0; i < 1500; i++) {
    const idx = Math.floor(Math.random() * innerCount) * 3;
    const px = innerPts[idx], py = innerPts[idx + 1], pz = innerPts[idx + 2];
    outerPts.push(
      px * 1.14 + rng(-0.05, 0.05) * S,
      py + rng(-0.04, 0.04) * S,
      pz * 1.14 + rng(-0.05, 0.05) * S,
    );
  }

  // ============================================================
  //  SKELETON / NEURAL LINES (the "internal scan" look)
  // ============================================================
  // Spine
  linePts(nervePts, 0, cy(Y.hip), -0.03 * S, 0, cy(Y.neckTop), 0, 48);
  // Skull cross
  linePts(nervePts, 0, cy(Y.chin), faceZ, 0, cy(Y.crown), 0, 22);
  // Collarbones
  for (let side = -1; side <= 1; side += 2)
    linePts(nervePts, 0, cy(Y.shoulder + 0.02), 0.04 * S, side * 0.28 * S, cy(Y.shoulder), 0, 22);
  // Rib arcs
  for (let rib = 0; rib < 5; rib++) {
    const ry = cy(Y.rib + rib * 0.06);
    for (let i = 0; i < 26; i++) {
      const t = i / 25;
      const ang = (t - 0.5) * PI * 0.95;
      const rr = (0.24 - rib * 0.012) * S;
      nervePts.push(rr * Math.sin(ang), ry, rr * Math.cos(ang) * 0.65);
    }
  }
  // Pelvis ring
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * PI2;
    nervePts.push(0.18 * S * Math.cos(a), cy(Y.hip), 0.13 * S * Math.sin(a));
  }
  // Limb bones
  for (let side = -1; side <= 1; side += 2) {
    // arm
    linePts(nervePts, side * 0.30 * S, cy(Y.shoulder), 0, side * 0.36 * S, cy(Y.rib - 0.06), 0.03 * S, 18);
    linePts(nervePts, side * 0.36 * S, cy(Y.rib - 0.06), 0.03 * S, side * 0.40 * S, cy(Y.navel - 0.02), 0.10 * S, 18);
    // leg
    linePts(nervePts, side * 0.13 * S, cy(Y.crotch), 0, side * 0.105 * S, cy(Y.knee), 0.02 * S, 24);
    linePts(nervePts, side * 0.105 * S, cy(Y.knee), 0.02 * S, side * 0.085 * S, cy(Y.ankle), 0, 24);
  }
  // Face mesh hint (eye + brow connectors)
  for (let side = -1; side <= 1; side += 2) {
    linePts(nervePts, side * eyeDX, eyeY, eyeZ, 0, cy(Y.nose), faceZ + 0.02 * S, 12);
    linePts(nervePts, side * eyeDX, eyeY, eyeZ, side * 0.08 * S, cy(Y.brow), faceZ, 10);
  }

  // ============================================================
  //  ENERGY VEINS (gold) — central + lateral channels through body
  // ============================================================
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
    // down each leg
    for (let i = 0; i < 36; i++) {
      const t = i / 35;
      const yy = cy(Y.crotch) - t * (Y.crotch - Y.ankle) * S;
      veinPts.push(side * (0.12 - t * 0.04) * S + Math.sin(t * PI * 5) * 0.01 * S, yy, 0.04 * S);
    }
  }

  // ============================================================
  //  FLOWING SURFACE ENERGY — particles that travel UP the body
  //  surface. Each stores a base position + a normalized height
  //  phase that scrolls over time, re-sampled to the shell.
  // ============================================================
  const FLOW_N = 900;
  const flowArr = new Float32Array(FLOW_N * 3);
  const flowBase = new Float32Array(FLOW_N * 3); // surface anchor
  const flowPhase = new Float32Array(FLOW_N);    // 0..1 travel offset
  const flowSpeed = new Float32Array(FLOW_N);
  for (let i = 0; i < FLOW_N; i++) {
    const idx = Math.floor(Math.random() * innerCount) * 3;
    flowBase[i * 3] = innerPts[idx] * 1.04;
    flowBase[i * 3 + 1] = innerPts[idx + 1];
    flowBase[i * 3 + 2] = innerPts[idx + 2] * 1.04;
    flowArr[i * 3] = flowBase[i * 3];
    flowArr[i * 3 + 1] = flowBase[i * 3 + 1];
    flowArr[i * 3 + 2] = flowBase[i * 3 + 2];
    flowPhase[i] = Math.random();
    flowSpeed[i] = 0.3 + Math.random() * 0.5;
  }

  // ============================================================
  //  DNA HELIX (purple) — spiraling full body height
  // ============================================================
  const helixPts: number[] = [];
  const helixN = 160;
  for (let i = 0; i < helixN; i++) {
    const t = i / helixN;
    const yy = cy(Y.crotch) + t * (Y.crown - Y.crotch) * S;
    const r = (0.42 + Math.sin(t * PI * 2) * 0.05) * S;
    const a = t * PI * 7;
    helixPts.push(r * Math.cos(a), yy, r * Math.sin(a));
    helixPts.push(r * Math.cos(a + PI), yy, r * Math.sin(a + PI));
    if (i % 8 === 0) {
      for (let j = 0; j < 6; j++) {
        const lt = j / 5;
        helixPts.push(
          r * Math.cos(a) * (1 - lt) + r * Math.cos(a + PI) * lt,
          yy,
          r * Math.sin(a) * (1 - lt) + r * Math.sin(a + PI) * lt,
        );
      }
    }
  }

  // ============================================================
  //  BUILD GEOMETRIES
  // ============================================================

  // LAYER 1: Inner shell — tiny, dense, bright cyan (sharp silhouette)
  const innerGeo = new THREE.BufferGeometry();
  innerGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(innerPts), 3));
  const innerMat = new THREE.PointsMaterial({
    size: 0.014, map: glowCyan, color: 0x8af2ff,
    transparent: true, opacity: 0.92,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const innerBody = new THREE.Points(innerGeo, innerMat);
  group.add(innerBody);

  // LAYER 1b: Volume — medium particles, fills interior, soft cyan
  const midGeo = new THREE.BufferGeometry();
  midGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(midPts), 3));
  const midMat = new THREE.PointsMaterial({
    size: 0.03, map: glowCyan, color: 0x49c6e8,
    transparent: true, opacity: 0.32,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const midBody = new THREE.Points(midGeo, midMat);
  group.add(midBody);

  // LAYER 2: Ethereal aura — large, faint glow
  const outerGeo = new THREE.BufferGeometry();
  outerGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(outerPts), 3));
  const outerMat = new THREE.PointsMaterial({
    size: 0.075, map: glowCyan, color: 0x2f8fc8,
    transparent: true, opacity: 0.14,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const outerBody = new THREE.Points(outerGeo, outerMat);
  group.add(outerBody);

  // LAYER 3: Skeleton / neural lines — white-blue fine dots
  const nerveGeo = new THREE.BufferGeometry();
  nerveGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nervePts), 3));
  const nerveMat = new THREE.PointsMaterial({
    size: 0.011, map: glowWhite, color: 0xbfe8ff,
    transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const nerveNet = new THREE.Points(nerveGeo, nerveMat);
  group.add(nerveNet);

  // LAYER 4: Energy veins — gold
  const veinGeo = new THREE.BufferGeometry();
  veinGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(veinPts), 3));
  const veinMat = new THREE.PointsMaterial({
    size: 0.022, map: glowGold, color: 0xffc24d,
    transparent: true, opacity: 0.7,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const veins = new THREE.Points(veinGeo, veinMat);
  group.add(veins);

  // LAYER 5: Flowing surface energy — bright travelling motes
  const flowGeo = new THREE.BufferGeometry();
  flowGeo.setAttribute('position', new THREE.BufferAttribute(flowArr, 3));
  const flowMat = new THREE.PointsMaterial({
    size: 0.026, map: glowWhite, color: 0xaef6ff,
    transparent: true, opacity: 0.75,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const flowParticles = new THREE.Points(flowGeo, flowMat);
  group.add(flowParticles);

  // LAYER 6: DNA Helix — purple
  const helixGeo = new THREE.BufferGeometry();
  helixGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(helixPts), 3));
  const helixMat = new THREE.PointsMaterial({
    size: 0.014, map: glowPurple, color: 0xc79bff,
    transparent: true, opacity: 0.32,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const helix = new THREE.Points(helixGeo, helixMat);
  group.add(helix);

  // --- GOLD SPARKLE HIGHLIGHTS (sampled on the shell) ---
  const sparkN = 1100;
  const sparkArr = new Float32Array(sparkN * 3);
  for (let i = 0; i < sparkN; i++) {
    const idx = Math.floor(Math.random() * innerCount) * 3;
    sparkArr[i * 3] = innerPts[idx] + rng(-0.015, 0.015) * S;
    sparkArr[i * 3 + 1] = innerPts[idx + 1] + rng(-0.015, 0.015) * S;
    sparkArr[i * 3 + 2] = innerPts[idx + 2] + rng(-0.015, 0.015) * S;
  }
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkArr, 3));
  const sparkMat = new THREE.PointsMaterial({
    size: 0.028, map: glowGold, color: 0xffe0a0,
    transparent: true, opacity: 0.45,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const sparkles = new THREE.Points(sparkGeo, sparkMat);
  group.add(sparkles);

  // --- WIREFRAME SCAN OVERLAYS (face + chest "holographic mesh") ---
  const wireMats: THREE.MeshBasicMaterial[] = [];
  // Face shell wireframe
  const faceWireGeo = new THREE.SphereGeometry(headR * 1.05, 10, 10);
  const faceWireMat = new THREE.MeshBasicMaterial({
    color: 0x6fe0ff, wireframe: true, transparent: true, opacity: 0.12,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const faceWire = new THREE.Mesh(faceWireGeo, faceWireMat);
  faceWire.position.set(0, cy((Y.crown + Y.chin) / 2), 0);
  faceWire.scale.set(1, 1.1, 0.95);
  group.add(faceWire);
  wireMats.push(faceWireMat);
  // Chest wireframe panel (icosa for triangulated scan grid)
  const chestWireGeo = new THREE.IcosahedronGeometry(0.26 * S, 1);
  const chestWireMat = new THREE.MeshBasicMaterial({
    color: 0x5fe6ff, wireframe: true, transparent: true, opacity: 0.1,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const chestWire = new THREE.Mesh(chestWireGeo, chestWireMat);
  chestWire.position.set(0, cy(Y.pec - 0.05), 0);
  chestWire.scale.set(1.05, 0.8, 0.7);
  group.add(chestWire);
  wireMats.push(chestWireMat);

  // --- EYE GLOW (intense, with secondary glow) ---
  function makeEye(x: number) {
    const m = new THREE.SpriteMaterial({
      map: glowCyan, color: 0xaaffff, transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const s = new THREE.Sprite(m);
    s.scale.setScalar(0.14 * S);
    s.position.set(x, eyeY, eyeZ + 0.025 * S);
    group.add(s);
    // Secondary outer glow
    const m2 = new THREE.SpriteMaterial({
      map: glowWhite, color: 0x55ccff, transparent: true, opacity: 0.25,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const s2 = new THREE.Sprite(m2);
    s2.scale.setScalar(0.3 * S);
    s2.position.set(x, eyeY, eyeZ + 0.01 * S);
    group.add(s2);
    return { inner: m, outer: m2 };
  }
  const eyeL = makeEye(-eyeDX);
  const eyeR = makeEye(eyeDX);

  // --- HEART CORE (multi-layer) — seated at the sternum/heart ---
  const heartGeo = new THREE.IcosahedronGeometry(0.09 * S, 2);
  const heartMat = new THREE.MeshBasicMaterial({
    color: 0x66eeff, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const heart = new THREE.Mesh(heartGeo, heartMat);
  heart.position.set(0, cy(Y.sternum), 0.06 * S);
  group.add(heart);

  const heartWireGeo = new THREE.IcosahedronGeometry(0.14 * S, 1);
  const heartWireMat = new THREE.MeshBasicMaterial({
    color: 0x44aacc, wireframe: true, transparent: true, opacity: 0.2,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const heartWire = new THREE.Mesh(heartWireGeo, heartWireMat);
  heartWire.position.copy(heart.position);
  group.add(heartWire);

  // Heart inner glow sprite
  const heartGlowMat = new THREE.SpriteMaterial({
    map: glowCyan, color: 0x66eeff, transparent: true, opacity: 0.35,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const heartGlow = new THREE.Sprite(heartGlowMat);
  heartGlow.scale.setScalar(0.6 * S);
  heartGlow.position.copy(heart.position);
  group.add(heartGlow);

  // --- HEAD HALO (layered) ---
  const haloMat = new THREE.SpriteMaterial({
    map: glowCyan, color: 0x55ccee, transparent: true, opacity: 0.12,
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
  });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.setScalar(2.6 * S);
  halo.position.set(0, cy(Y.brow), -0.3);
  group.add(halo);

  const halo2Mat = new THREE.SpriteMaterial({
    map: glowGold, color: 0xffc24d, transparent: true, opacity: 0.06,
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
  });
  const halo2 = new THREE.Sprite(halo2Mat);
  halo2.scale.setScalar(3.8 * S);
  halo2.position.set(0, cy(Y.brow), -0.5);
  group.add(halo2);

  // --- ENERGY RIBBONS (flowing curves) ---
  const ribbonCount = 8;
  const ribbonSegs = 80;
  const ribbons: { geo: THREE.BufferGeometry; bx: number[]; by: number[]; bz: number[]; mat: THREE.LineBasicMaterial }[] = [];
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
    group.add(new THREE.Line(geo, mat));
    ribbons.push({ geo, bx, by, bz, mat });
  }

  // --- SCAN LINES (sweep full body height, sole -> crown) ---
  const scanCount = 22;
  const scanLo = 0.1, scanHi = 2.6, scanSpan = scanHi - scanLo;
  const scanMats: THREE.LineBasicMaterial[] = [];
  const scans: { geo: THREE.BufferGeometry; y0: number }[] = [];
  for (let i = 0; i < scanCount; i++) {
    const y = BY + (scanLo + (i / scanCount) * scanSpan) * S;
    const pts = [];
    for (let j = 0; j <= 50; j++) {
      const t = j / 50;
      pts.push((t - 0.5) * 1.0 * S, y, 0);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    const mat = new THREE.LineBasicMaterial({
      color: 0x44ddff, transparent: true, opacity: 0.04,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    group.add(new THREE.Line(geo, mat));
    scans.push({ geo, y0: y });
    scanMats.push(mat);
  }

  // --- BASE PLATFORM ---
  const baseRings: THREE.Mesh[] = [];
  const baseRingMats: THREE.MeshBasicMaterial[] = [];
  const ringR = [0.6, 0.9, 1.2, 1.5, 1.8, 2.1];
  const ringC = [0x44ddff, 0xffc24d, 0x44ddff, 0xbb88ff, 0xffc24d, 0x44ddff];
  for (let i = 0; i < ringR.length; i++) {
    const rGeo = new THREE.TorusGeometry(ringR[i] * S, 0.008, 6, 140);
    const rMat = new THREE.MeshBasicMaterial({
      color: ringC[i], transparent: true, opacity: 0.35 - i * 0.04,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.rotation.x = PI * 0.5;
    ring.position.y = cy(Y.sole);
    group.add(ring);
    baseRings.push(ring);
    baseRingMats.push(rMat);
  }

  // Base glow
  const baseGlowMat = new THREE.SpriteMaterial({
    map: glowCyan, color: 0x44ddff, transparent: true, opacity: 0.15,
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
  });
  const baseGlow = new THREE.Sprite(baseGlowMat);
  baseGlow.scale.set(6 * S, 1.5 * S, 1);
  baseGlow.position.y = cy(Y.sole);
  group.add(baseGlow);

  // --- ORBITING NODES ---
  const ORBIT_N = 8;
  const nodeColors = [0x5fe6ff, 0xffc24d, 0xff5d73, 0xb06aff, 0x4dff91, 0xff9f43, 0x55aaff, 0xffdd44];
  const nodeMeshes: THREE.Mesh[] = [];
  const nodeGlows: THREE.Sprite[] = [];
  const nodeOrbits: { a: number; r: number; spd: number; tilt: number; ph: number }[] = [];

  for (let i = 0; i < ORBIT_N; i++) {
    const dGeo = new THREE.SphereGeometry(0.04, 10, 10);
    const dMat = new THREE.MeshBasicMaterial({ color: nodeColors[i] });
    const dot = new THREE.Mesh(dGeo, dMat);
    group.add(dot); nodeMeshes.push(dot);

    const isWarm = i % 3 === 1;
    const spMat = new THREE.SpriteMaterial({
      map: isWarm ? glowGold : glowCyan, color: nodeColors[i],
      transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const sp = new THREE.Sprite(spMat);
    sp.scale.setScalar(0.35);
    group.add(sp); nodeGlows.push(sp);

    nodeOrbits.push({
      a: (i / ORBIT_N) * PI2,
      r: (1.6 + (i % 3) * 0.25) * S,
      spd: 0.3 + i * 0.05,
      tilt: (PI / 6) * ((i % 3) - 1),
      ph: i * 0.9,
    });
  }

  // --- FLOATING DATA PARTICLES ---
  const dataN = 60;
  const dataArr = new Float32Array(dataN * 3);
  const dataVel = new Float32Array(dataN);
  for (let i = 0; i < dataN; i++) {
    dataArr[i * 3] = rng(-1.5, 1.5) * S;
    dataArr[i * 3 + 1] = BY + rng(0.5, 2.5) * S;
    dataArr[i * 3 + 2] = rng(-1, 1) * S;
    dataVel[i] = 0.001 + Math.random() * 0.004;
  }
  const dataGeo = new THREE.BufferGeometry();
  dataGeo.setAttribute('position', new THREE.BufferAttribute(dataArr, 3));
  const dataMat = new THREE.PointsMaterial({
    size: 0.025, map: glowGold, color: 0xffd080, transparent: true, opacity: 0.35,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const dataParticles = new THREE.Points(dataGeo, dataMat);
  group.add(dataParticles);

  // ============================================================
  //  ANIMATION
  // ============================================================
  let amp = 0.06, ampTarget = 0.06;
  let time = 0;
  let raf = 0;

  const drift = { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0, timer: 0, interval: 4 };

  function pickDrift() {
    drift.tx = rng(-1.2, 1.2);
    drift.ty = rng(-0.4, 0.4);
    drift.tz = rng(-0.8, 0.8);
    drift.interval = 3 + Math.random() * 5;
    drift.timer = 0;
  }

  // --- BODY DETECTION ---
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

  function frame() {
    raf = requestAnimationFrame(frame);
    time += 0.016;
    amp += (ampTarget - amp) * 0.07;

    // Drift
    drift.timer += 0.016;
    if (drift.timer >= drift.interval) pickDrift();
    drift.x += (drift.tx - drift.x) * 0.01;
    drift.y += (drift.ty - drift.y) * 0.01;
    drift.z += (drift.tz - drift.z) * 0.01;
    group.position.x = drift.x + Math.sin(time * 0.13) * 0.25;
    group.position.y = drift.y + Math.sin(time * 0.19) * 0.12;
    group.position.z = drift.z + Math.sin(time * 0.16) * 0.15;

    // Breathing — chest expands a touch more than the rest (anisotropic)
    const breath = Math.sin(time * 0.9);
    const br = 1 + breath * 0.006 + amp * 0.014;
    const brX = 1 + breath * 0.009 + amp * 0.016; // ribcage widens
    innerBody.scale.set(brX, br, brX);
    midBody.scale.set(brX, br, brX);
    outerBody.scale.set(brX, br, brX);
    sparkles.scale.set(brX, br, brX);
    nerveNet.scale.set(brX, br, brX);
    chestWire.scale.set(1.05 * brX, 0.8 * br, 0.7 * brX);

    // Flowing surface energy — motes travel upward along the body shell
    for (let i = 0; i < FLOW_N; i++) {
      flowPhase[i] = (flowPhase[i] + flowSpeed[i] * 0.0016 * (1 + amp * 1.5)) % 1;
      const rise = flowPhase[i] * 0.45 * S;            // travel distance up
      const fade = Math.sin(flowPhase[i] * PI);         // fade in/out over path
      const sway = Math.sin(time * 1.3 + i) * 0.012 * S * fade;
      flowArr[i * 3] = flowBase[i * 3] + sway;
      flowArr[i * 3 + 1] = flowBase[i * 3 + 1] + rise;
      flowArr[i * 3 + 2] = flowBase[i * 3 + 2] + Math.cos(time * 1.1 + i) * 0.01 * S * fade;
    }
    flowGeo.attributes.position.needsUpdate = true;
    flowMat.opacity = (0.35 + amp * 0.4) * 0.9;

    // DNA helix rotation
    helix.rotation.y = time * 0.15;
    helixMat.opacity = 0.25 + amp * 0.2 + Math.sin(time * 1.5) * 0.05;

    // Heart pulse
    const hp = 1 + Math.sin(time * 2.5) * 0.15 + amp * 0.4;
    heart.scale.setScalar(hp);
    heartWire.scale.setScalar(hp * 1.2);
    heartMat.opacity = 0.35 + amp * 0.5 + Math.sin(time * 3) * 0.1;
    heartWireMat.opacity = 0.12 + amp * 0.25;
    heartGlowMat.opacity = 0.2 + amp * 0.3 + Math.sin(time * 2.8) * 0.08;
    heartGlow.scale.setScalar((0.5 + amp * 0.3 + Math.sin(time * 2.5) * 0.08) * S);
    heart.rotation.y = time * 0.6;
    heartWire.rotation.y = -time * 0.35;

    // Eyes
    const eg = 0.6 + amp * 0.35 + Math.sin(time * 2.2) * 0.1;
    eyeL.inner.opacity = eg;
    eyeR.inner.opacity = eg;
    eyeL.outer.opacity = eg * 0.35;
    eyeR.outer.opacity = eg * 0.35;

    // Scans — sweep up the full figure
    for (let i = 0; i < scanCount; i++) {
      const sc = scans[i];
      const pos = sc.geo.attributes.position as THREE.BufferAttribute;
      const newY = BY + (scanLo * S) + ((sc.y0 - BY - scanLo * S + time * 0.3 * S) % (scanSpan * S));
      for (let j = 0; j <= 50; j++) pos.setY(j, newY);
      pos.needsUpdate = true;
      scanMats[i].opacity = 0.035 + amp * 0.05;
    }

    // Ribbons
    for (const rb of ribbons) {
      const pos = rb.geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i <= ribbonSegs; i++) {
        const t = i / ribbonSegs;
        pos.setX(i, rb.bx[i] + Math.sin(time * 1.6 + t * 5) * 0.07 * S * (1 + amp * 2));
        pos.setY(i, rb.by[i] + Math.sin(time * 1.2 + t * 4) * 0.04 * S * (1 + amp));
        pos.setZ(i, rb.bz[i] + Math.cos(time * 1.4 + t * 5) * 0.05 * S * (1 + amp));
      }
      pos.needsUpdate = true;
      rb.mat.opacity = 0.2 + amp * 0.35;
    }

    // Base rings
    for (let i = 0; i < baseRings.length; i++) {
      baseRings[i].rotation.z = time * (0.05 + i * 0.025) * (i % 2 === 0 ? 1 : -1);
      baseRingMats[i].opacity = (0.3 - i * 0.04) + amp * 0.15;
    }

    // Halos
    haloMat.opacity = 0.08 + amp * 0.15 + Math.sin(time * 1.1) * 0.02;
    halo.scale.setScalar((2.5 + amp * 0.5) * S);
    halo2Mat.opacity = 0.04 + amp * 0.06;
    halo2.scale.setScalar((3.5 + amp * 0.4) * S);

    // Shimmer
    innerMat.opacity = 0.85 + amp * 0.15 + Math.sin(time * 1.7) * 0.03;
    midMat.opacity = 0.28 + amp * 0.14 + Math.sin(time * 1.3) * 0.03;
    outerMat.opacity = 0.12 + amp * 0.1 + Math.sin(time * 0.8) * 0.02;
    sparkMat.opacity = 0.38 + amp * 0.25 + Math.sin(time * 1.4) * 0.04;
    nerveMat.opacity = 0.4 + amp * 0.2;
    veinMat.opacity = 0.5 + amp * 0.3 + Math.sin(time * 2) * 0.08;

    // Holographic wireframe scan pulse (face + chest)
    wireMats[0].opacity = 0.08 + amp * 0.12 + Math.sin(time * 1.6) * 0.04;
    wireMats[1].opacity = 0.07 + amp * 0.14 + Math.sin(time * 1.9 + 1) * 0.04;
    faceWire.rotation.y = Math.sin(time * 0.3) * 0.15;
    chestWire.rotation.y = time * 0.2;

    // Orbiting nodes
    const sm = 1 + amp * 3.5;
    for (let i = 0; i < ORBIT_N; i++) {
      const d = nodeOrbits[i];
      d.a += d.spd * 0.016 * sm;
      const rr = d.r + Math.sin(time * 0.35 + d.ph) * 0.08 + amp * 0.3 * Math.sin(time * 1.8 + d.ph);
      const x = Math.cos(d.a) * rr;
      const z = Math.sin(d.a) * rr;
      const y = BY + 1.5 * S + Math.sin(d.a + d.tilt) * 0.5 * S + Math.sin(time * 0.25 + d.ph) * 0.08;
      nodeMeshes[i].position.set(x, y, z);
      nodeGlows[i].position.set(x, y, z);
      nodeGlows[i].scale.setScalar(0.3 + amp * 0.12 + Math.sin(time * 1.1 + d.ph) * 0.04);
    }

    // Data particles
    for (let i = 0; i < dataN; i++) {
      dataArr[i * 3 + 1] += dataVel[i] * S;
      if (dataArr[i * 3 + 1] > BY + 2.8 * S) {
        dataArr[i * 3 + 1] = BY + 0.5 * S;
        dataArr[i * 3] = rng(-1.5, 1.5) * S;
        dataArr[i * 3 + 2] = rng(-1, 1) * S;
      }
    }
    dataGeo.attributes.position.needsUpdate = true;
    dataMat.opacity = 0.25 + amp * 0.25;

    // Rotation
    group.rotation.y = Math.sin(time * 0.1) * 0.1 + time * 0.015;

    renderer.render(scene, camera);
  }
  frame();

  return {
    setEnergy(v: number) { ampTarget = Math.max(0, Math.min(1, v)); },
    dispose() {
      cancelAnimationFrame(raf);
      stopBodyDetection();
      window.removeEventListener('resize', resize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    },
    startBodyDetection,
    stopBodyDetection,
  };
}
