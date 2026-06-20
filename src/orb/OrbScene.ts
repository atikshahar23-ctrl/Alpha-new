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
  //  PREMIUM HUMANOID — layered particle construction
  // ============================================================

  const innerPts: number[] = [];   // dense core particles
  const outerPts: number[] = [];   // soft outer aura
  const nervePts: number[] = [];   // neural network lines
  const veinPts: number[] = [];    // energy veins (gold)

  // Helpers
  function rng(lo: number, hi: number) { return lo + Math.random() * (hi - lo); }

  function spherePts(arr: number[], cx: number, cy: number, cz: number, r: number, n: number, noise = 0) {
    for (let i = 0; i < n; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const th = Math.random() * PI2;
      const sr = r * (0.92 + Math.random() * 0.08);
      arr.push(
        cx + sr * Math.sin(phi) * Math.cos(th) + rng(-noise, noise),
        cy + sr * Math.cos(phi) + rng(-noise, noise),
        cz + sr * Math.sin(phi) * Math.sin(th) + rng(-noise, noise),
      );
    }
  }

  function ellipsoidPts(arr: number[], cx: number, cy: number, cz: number, rx: number, ry: number, rz: number, n: number) {
    for (let i = 0; i < n; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const th = Math.random() * PI2;
      const f = 0.92 + Math.random() * 0.08;
      arr.push(
        cx + rx * f * Math.sin(phi) * Math.cos(th),
        cy + ry * f * Math.cos(phi),
        cz + rz * f * Math.sin(phi) * Math.sin(th),
      );
    }
  }

  function tubePts(arr: number[], x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, r1: number, r2: number, n: number) {
    for (let i = 0; i < n; i++) {
      const t = Math.random();
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      const z = z1 + (z2 - z1) * t;
      const r = r1 + (r2 - r1) * t;
      const a = Math.random() * PI2;
      const rr = r * (0.9 + Math.random() * 0.1);
      arr.push(x + rr * Math.cos(a), y, z + rr * Math.sin(a));
    }
  }

  function linePts(arr: number[], x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, n: number) {
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      arr.push(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, z1 + (z2 - z1) * t);
    }
  }

  // --- HEAD (detailed, slightly elongated) ---
  ellipsoidPts(innerPts, 0, BY + 2.15 * S, 0, 0.18 * S, 0.22 * S, 0.19 * S, 2000);
  ellipsoidPts(outerPts, 0, BY + 2.15 * S, 0, 0.24 * S, 0.28 * S, 0.24 * S, 600);

  // Jaw definition
  ellipsoidPts(innerPts, 0, BY + 2.04 * S, 0.04 * S, 0.14 * S, 0.06 * S, 0.12 * S, 400);

  // Eyes — bright, intense
  const eyeY = BY + 2.18 * S;
  const eyeZ = 0.16 * S;
  spherePts(innerPts, -0.065 * S, eyeY, eyeZ, 0.028 * S, 120);
  spherePts(innerPts, 0.065 * S, eyeY, eyeZ, 0.028 * S, 120);

  // Nose bridge
  for (let i = 0; i < 60; i++) {
    const t = Math.random();
    innerPts.push(rng(-0.01, 0.01) * S, BY + (2.12 + t * 0.08) * S, (0.17 + t * 0.03) * S);
  }

  // --- NECK (muscular, defined) ---
  tubePts(innerPts, 0, BY + 1.92 * S, 0, 0, BY + 2.02 * S, 0, 0.065 * S, 0.08 * S, 400);

  // --- TORSO (anatomical, tapered) ---
  // Upper chest (broad)
  for (let i = 0; i < 3000; i++) {
    const t = Math.random();
    const y = BY + (1.55 + t * 0.37) * S;
    const chestWidth = (0.22 + t * 0.12) * S;
    const chestDepth = (0.14 + t * 0.06) * S;
    const a = Math.random() * PI2;
    const f = 0.92 + Math.random() * 0.08;
    innerPts.push(
      chestWidth * f * Math.cos(a),
      y,
      chestDepth * f * Math.sin(a),
    );
  }
  // Chest contour — pecs
  ellipsoidPts(innerPts, -0.1 * S, BY + 1.8 * S, 0.1 * S, 0.09 * S, 0.06 * S, 0.06 * S, 500);
  ellipsoidPts(innerPts, 0.1 * S, BY + 1.8 * S, 0.1 * S, 0.09 * S, 0.06 * S, 0.06 * S, 500);
  // Abs definition
  for (let row = 0; row < 3; row++) {
    for (let col = -1; col <= 1; col += 2) {
      spherePts(innerPts, col * 0.055 * S, BY + (1.58 + row * 0.08) * S, 0.13 * S, 0.035 * S, 80);
    }
  }
  // Outer torso aura
  ellipsoidPts(outerPts, 0, BY + 1.73 * S, 0, 0.38 * S, 0.25 * S, 0.22 * S, 800);

  // --- SHOULDERS & ARMS ---
  for (let side = -1; side <= 1; side += 2) {
    // Deltoid
    spherePts(innerPts, side * 0.34 * S, BY + 1.88 * S, 0, 0.09 * S, 600);
    // Upper arm (bicep/tricep)
    tubePts(innerPts, side * 0.38 * S, BY + 1.58 * S, 0, side * 0.36 * S, BY + 1.85 * S, 0, 0.06 * S, 0.065 * S, 600);
    // Elbow
    spherePts(innerPts, side * 0.4 * S, BY + 1.53 * S, 0.03 * S, 0.045 * S, 200);
    // Forearm (slightly forward, relaxed)
    for (let i = 0; i < 500; i++) {
      const t = Math.random();
      const x = side * (0.4 + t * 0.25) * S;
      const y = BY + (1.53 - t * 0.05 + t * t * 0.2) * S;
      const z = (0.03 + t * 0.15) * S;
      const a = Math.random() * PI2;
      const r = (0.045 - t * 0.012) * S;
      innerPts.push(x + r * Math.cos(a), y, z + r * Math.sin(a));
    }
    // Wrist
    spherePts(innerPts, side * 0.65 * S, BY + 1.68 * S, 0.18 * S, 0.035 * S, 150);
    // Hand (open, slightly spread)
    spherePts(innerPts, side * 0.7 * S, BY + 1.7 * S, 0.22 * S, 0.04 * S, 200);
    // Fingers
    for (let f = 0; f < 5; f++) {
      const fa = ((f - 2) / 5) * 0.7;
      for (let i = 0; i < 50; i++) {
        const t = Math.random() * 0.1 * S;
        innerPts.push(
          side * (0.73 * S + t * Math.cos(fa) * side * 0.5),
          BY + (1.72 + f * 0.012) * S + t * Math.sin(fa),
          0.24 * S + t * 0.06,
        );
      }
    }

    // Arm aura
    tubePts(outerPts, side * 0.38 * S, BY + 1.55 * S, 0.02 * S, side * 0.7 * S, BY + 1.7 * S, 0.22 * S, 0.1 * S, 0.06 * S, 300);

    // Neural lines: shoulder→elbow→hand
    linePts(nervePts, side * 0.34 * S, BY + 1.88 * S, 0, side * 0.4 * S, BY + 1.53 * S, 0.03 * S, 25);
    linePts(nervePts, side * 0.4 * S, BY + 1.53 * S, 0.03 * S, side * 0.7 * S, BY + 1.7 * S, 0.22 * S, 30);
  }

  // --- SPINE & SKELETON NERVES ---
  linePts(nervePts, 0, BY + 1.4 * S, -0.05 * S, 0, BY + 2.15 * S, 0, 40);
  // Collarbone
  linePts(nervePts, -0.34 * S, BY + 1.88 * S, 0, 0.34 * S, BY + 1.88 * S, 0, 25);
  // Ribs (subtle curves)
  for (let rib = 0; rib < 4; rib++) {
    const ribY = BY + (1.62 + rib * 0.07) * S;
    for (let i = 0; i < 30; i++) {
      const t = i / 29;
      const angle = (t - 0.5) * PI * 0.9;
      const rr = (0.22 - rib * 0.015) * S;
      nervePts.push(rr * Math.sin(angle), ribY, rr * Math.cos(angle) * 0.7);
    }
  }

  // --- ENERGY VEINS (gold pathways through body) ---
  // Central channel
  for (let i = 0; i < 60; i++) {
    const t = i / 59;
    const y = BY + (1.4 + t * 0.75) * S;
    veinPts.push(Math.sin(t * PI * 4) * 0.03 * S, y, 0.05 * S + Math.cos(t * PI * 3) * 0.02 * S);
  }
  // Lateral channels
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 40; i++) {
      const t = i / 39;
      const y = BY + (1.5 + t * 0.45) * S;
      veinPts.push(side * (0.08 + t * 0.06) * S + Math.sin(t * PI * 6) * 0.015 * S, y, 0.06 * S);
    }
  }

  // --- DNA HELIX (spiraling around torso) ---
  const helixPts: number[] = [];
  const helixN = 120;
  for (let i = 0; i < helixN; i++) {
    const t = i / helixN;
    const y = BY + (1.4 + t * 0.8) * S;
    const r = (0.35 + Math.sin(t * PI * 2) * 0.05) * S;
    const a = t * PI * 6;
    helixPts.push(r * Math.cos(a), y, r * Math.sin(a));
    helixPts.push(r * Math.cos(a + PI), y, r * Math.sin(a + PI));
    // Cross-links
    if (i % 8 === 0) {
      for (let j = 0; j < 6; j++) {
        const lt = j / 5;
        helixPts.push(
          r * Math.cos(a) * (1 - lt) + r * Math.cos(a + PI) * lt,
          y,
          r * Math.sin(a) * (1 - lt) + r * Math.sin(a + PI) * lt,
        );
      }
    }
  }

  // ============================================================
  //  BUILD GEOMETRIES
  // ============================================================

  // LAYER 1: Inner core (bright cyan particles)
  const innerGeo = new THREE.BufferGeometry();
  innerGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(innerPts), 3));
  const innerMat = new THREE.PointsMaterial({
    size: 0.018, map: glowCyan, color: 0x66eeff,
    transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const innerBody = new THREE.Points(innerGeo, innerMat);
  group.add(innerBody);

  // LAYER 2: Outer aura (soft, larger particles)
  const outerGeo = new THREE.BufferGeometry();
  outerGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(outerPts), 3));
  const outerMat = new THREE.PointsMaterial({
    size: 0.06, map: glowCyan, color: 0x3399cc,
    transparent: true, opacity: 0.15,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const outerBody = new THREE.Points(outerGeo, outerMat);
  group.add(outerBody);

  // LAYER 3: Neural network (white-blue fine dots)
  const nerveGeo = new THREE.BufferGeometry();
  nerveGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nervePts), 3));
  const nerveMat = new THREE.PointsMaterial({
    size: 0.012, map: glowWhite, color: 0xaaddff,
    transparent: true, opacity: 0.55,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const nerveNet = new THREE.Points(nerveGeo, nerveMat);
  group.add(nerveNet);

  // LAYER 4: Energy veins (gold)
  const veinGeo = new THREE.BufferGeometry();
  veinGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(veinPts), 3));
  const veinMat = new THREE.PointsMaterial({
    size: 0.025, map: glowGold, color: 0xffc24d,
    transparent: true, opacity: 0.7,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const veins = new THREE.Points(veinGeo, veinMat);
  group.add(veins);

  // LAYER 5: DNA Helix (purple)
  const helixGeo = new THREE.BufferGeometry();
  helixGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(helixPts), 3));
  const helixMat = new THREE.PointsMaterial({
    size: 0.015, map: glowPurple, color: 0xbb88ff,
    transparent: true, opacity: 0.35,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const helix = new THREE.Points(helixGeo, helixMat);
  group.add(helix);

  // --- GOLD SPARKLE HIGHLIGHTS ---
  const sparkN = 1200;
  const sparkArr = new Float32Array(sparkN * 3);
  for (let i = 0; i < sparkN; i++) {
    const idx = Math.floor(Math.random() * (innerPts.length / 3)) * 3;
    sparkArr[i * 3] = innerPts[idx] + rng(-0.02, 0.02);
    sparkArr[i * 3 + 1] = innerPts[idx + 1] + rng(-0.02, 0.02);
    sparkArr[i * 3 + 2] = innerPts[idx + 2] + rng(-0.02, 0.02);
  }
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkArr, 3));
  const sparkMat = new THREE.PointsMaterial({
    size: 0.03, map: glowGold, color: 0xffe0a0,
    transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const sparkles = new THREE.Points(sparkGeo, sparkMat);
  group.add(sparkles);

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
  const eyeL = makeEye(-0.065 * S);
  const eyeR = makeEye(0.065 * S);

  // --- HEART CORE (multi-layer) ---
  const heartGeo = new THREE.IcosahedronGeometry(0.1 * S, 2);
  const heartMat = new THREE.MeshBasicMaterial({
    color: 0x66eeff, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const heart = new THREE.Mesh(heartGeo, heartMat);
  heart.position.set(0, BY + 1.72 * S, 0.06 * S);
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
  halo.scale.setScalar(2.8 * S);
  halo.position.set(0, BY + 2.15 * S, -0.3);
  group.add(halo);

  const halo2Mat = new THREE.SpriteMaterial({
    map: glowGold, color: 0xffc24d, transparent: true, opacity: 0.06,
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
  });
  const halo2 = new THREE.Sprite(halo2Mat);
  halo2.scale.setScalar(4 * S);
  halo2.position.set(0, BY + 2.1 * S, -0.5);
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

  // --- SCAN LINES ---
  const scanCount = 16;
  const scanMats: THREE.LineBasicMaterial[] = [];
  const scans: { geo: THREE.BufferGeometry; y0: number }[] = [];
  for (let i = 0; i < scanCount; i++) {
    const y = BY + (0.8 + i * 0.1) * S;
    const pts = [];
    for (let j = 0; j <= 50; j++) {
      const t = j / 50;
      pts.push((t - 0.5) * 1.2 * S, y, 0);
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
    ring.position.y = BY + 0.8 * S;
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
  baseGlow.position.y = BY + 0.8 * S;
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

    // Breathing
    const br = 1 + Math.sin(time * 0.9) * 0.005 + amp * 0.012;
    innerBody.scale.set(br, br, br);
    sparkles.scale.set(br, br, br);
    nerveNet.scale.set(br, br, br);

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

    // Scans
    for (let i = 0; i < scanCount; i++) {
      const sc = scans[i];
      const pos = sc.geo.attributes.position as THREE.BufferAttribute;
      const newY = BY + ((sc.y0 - BY + time * 0.25 * S) % (2.0 * S));
      for (let j = 0; j <= 50; j++) pos.setY(j, newY);
      pos.needsUpdate = true;
      scanMats[i].opacity = 0.03 + amp * 0.04;
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
    innerMat.opacity = 0.8 + amp * 0.18 + Math.sin(time * 1.7) * 0.03;
    outerMat.opacity = 0.12 + amp * 0.1;
    sparkMat.opacity = 0.4 + amp * 0.25 + Math.sin(time * 1.4) * 0.04;
    nerveMat.opacity = 0.4 + amp * 0.2;
    veinMat.opacity = 0.5 + amp * 0.3 + Math.sin(time * 2) * 0.08;

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
