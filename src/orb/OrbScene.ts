import * as THREE from 'three';

export interface OrbHandle {
  setEnergy(v: number): void;
  dispose(): void;
}

export function mountOrb(container: HTMLElement): OrbHandle {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 1.6, 5.8);
  camera.lookAt(0, 1.4, 0);

  function size() { return container.clientWidth || 240; }
  function getH() { return container.clientHeight || size(); }
  function resize() {
    const w = size();
    const h = getH();
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  function makeGlow(r: number, g: number, b: number) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    const grd = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, `rgba(${r},${g},${b},1)`);
    grd.addColorStop(0.3, `rgba(${r},${g},${b},.6)`);
    grd.addColorStop(0.6, `rgba(${r},${g},${b},.15)`);
    grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }
  const glowCyan = makeGlow(95, 230, 255);
  const glowGold = makeGlow(255, 200, 80);

  const group = new THREE.Group();
  scene.add(group);

  const S = 2.8;
  const BY = -2.0;

  // --- HUMANOID PARTICLE FIGURE ---
  const figurePoints: number[] = [];

  // Head (sphere)
  for (let i = 0; i < 800; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r = 0.22 * S;
    figurePoints.push(
      r * Math.sin(phi) * Math.cos(theta),
      BY + 2.1 * S + r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }

  // Neck
  for (let i = 0; i < 150; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.08 * S;
    figurePoints.push(r * Math.cos(a), BY + (1.85 + Math.random() * 0.15) * S, r * Math.sin(a));
  }

  // Torso (tapered cylinder)
  for (let i = 0; i < 1800; i++) {
    const y = Math.random();
    const rTop = 0.32 * S, rBot = 0.22 * S;
    const r = rTop + (rBot - rTop) * y;
    const a = Math.random() * Math.PI * 2;
    figurePoints.push(r * Math.cos(a), BY + (1.85 - y * 0.9) * S, r * Math.sin(a));
  }

  // Shoulders & arms
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 300; i++) {
      const t = Math.random();
      const x = side * (0.28 + t * 0.45) * S;
      const y = BY + (1.75 - t * 0.15) * S;
      const z = (Math.random() - 0.5) * 0.12 * S;
      figurePoints.push(x, y, z);
    }
    for (let i = 0; i < 450; i++) {
      const t = Math.random();
      const x = side * (0.73 + t * 0.55) * S;
      const y = BY + (1.6 - t * 0.4) * S;
      const z = (Math.random() - 0.5) * 0.1 * S;
      const a = Math.random() * Math.PI * 2;
      const r = 0.06 * S;
      figurePoints.push(x + r * Math.cos(a), y, z + r * Math.sin(a));
    }
    for (let i = 0; i < 350; i++) {
      const t = Math.random();
      const x = side * (1.28 + t * 0.4) * S;
      const y = BY + (1.2 + t * 0.25) * S;
      const z = (0.1 + t * 0.15 + (Math.random() - 0.5) * 0.06) * S;
      figurePoints.push(x, y, z);
    }
    for (let f = 0; f < 5; f++) {
      for (let i = 0; i < 40; i++) {
        const t = Math.random() * 0.15 * S;
        const angle = (f / 5) * 0.7 - 0.35;
        figurePoints.push(
          side * (1.68 * S + t * Math.cos(angle) * side),
          BY + (1.45 + f * 0.02) * S + t * Math.sin(angle),
          0.28 * S + t * 0.1
        );
      }
    }
  }

  const figArr = new Float32Array(figurePoints);
  const figGeo = new THREE.BufferGeometry();
  figGeo.setAttribute('position', new THREE.BufferAttribute(figArr, 3));
  const figMat = new THREE.PointsMaterial({
    size: 0.03, map: glowCyan, color: 0x44ccff,
    transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const figure = new THREE.Points(figGeo, figMat);
  group.add(figure);

  // --- Gold edge highlights ---
  const goldPts: number[] = [];
  for (let i = 0; i < 600; i++) {
    const idx = Math.floor(Math.random() * (figurePoints.length / 3)) * 3;
    goldPts.push(
      figurePoints[idx] + (Math.random() - 0.5) * 0.04,
      figurePoints[idx + 1] + (Math.random() - 0.5) * 0.04,
      figurePoints[idx + 2] + (Math.random() - 0.5) * 0.04
    );
  }
  const goldGeo = new THREE.BufferGeometry();
  goldGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(goldPts), 3));
  const goldMat = new THREE.PointsMaterial({
    size: 0.045, map: glowGold, color: 0xffcc44,
    transparent: true, opacity: 0.7,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const goldParticles = new THREE.Points(goldGeo, goldMat);
  group.add(goldParticles);

  // --- FLOWING ENERGY RIBBONS ---
  const ribbonCount = 4;
  const ribbonSegs = 80;
  const ribbons: { line: THREE.Line; geo: THREE.BufferGeometry; baseY: number[]; baseX: number[]; baseZ: number[] }[] = [];
  const ribbonColors = [0x44ddff, 0xffcc44, 0x44ddff, 0xffaa22];

  for (let r = 0; r < ribbonCount; r++) {
    const pts: number[] = [];
    const baseY: number[] = [];
    const baseX: number[] = [];
    const baseZ: number[] = [];
    const side = r < 2 ? -1 : 1;
    const offset = r % 2 === 0 ? 0 : 0.3;

    for (let i = 0; i <= ribbonSegs; i++) {
      const t = i / ribbonSegs;
      const x = (side * (0.3 + t * 1.6) + Math.sin(t * 4 + offset) * 0.2) * S;
      const y = BY + (1.7 - t * 0.8 + Math.sin(t * 3 + offset) * 0.25) * S;
      const z = Math.sin(t * 5 + offset + r) * 0.3 * S;
      pts.push(x, y, z);
      baseX.push(x);
      baseY.push(y);
      baseZ.push(z);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    const mat = new THREE.LineBasicMaterial({
      color: ribbonColors[r], transparent: true, opacity: 0.4,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const line = new THREE.Line(geo, mat);
    group.add(line);
    ribbons.push({ line, geo, baseY, baseX, baseZ });
  }

  // --- Ribbon glow particles ---
  const ribbonGlowN = 80;
  const ribbonGlowArr = new Float32Array(ribbonGlowN * 3);
  const ribbonGlowGeo = new THREE.BufferGeometry();
  ribbonGlowGeo.setAttribute('position', new THREE.BufferAttribute(ribbonGlowArr, 3));
  const ribbonGlowMat = new THREE.PointsMaterial({
    size: 0.06, map: glowCyan, color: 0x66eeff,
    transparent: true, opacity: 0.6,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const ribbonGlow = new THREE.Points(ribbonGlowGeo, ribbonGlowMat);
  group.add(ribbonGlow);

  // --- BRAIN CORE (glowing icosahedron in chest) ---
  const brainGeo = new THREE.IcosahedronGeometry(0.3 * S, 1);
  const brainMat = new THREE.MeshBasicMaterial({
    color: 0x66eeff, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const brain = new THREE.Mesh(brainGeo, brainMat);
  brain.position.set(0, BY + 1.5 * S, 0);
  group.add(brain);

  const brainWireGeo = new THREE.IcosahedronGeometry(0.36 * S, 1);
  const brainWireMat = new THREE.MeshBasicMaterial({
    color: 0x44aacc, wireframe: true, transparent: true, opacity: 0.3,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const brainWire = new THREE.Mesh(brainWireGeo, brainWireMat);
  brainWire.position.set(0, BY + 1.5 * S, 0);
  group.add(brainWire);

  // --- CONCENTRIC BASE RINGS ---
  const baseRings: THREE.Mesh[] = [];
  const ringRadii = [0.8, 1.15, 1.5, 1.85, 2.2];
  const ringColors = [0x44ddff, 0xffcc44, 0x44ddff, 0xffcc44, 0x44ddff];
  for (let i = 0; i < ringRadii.length; i++) {
    const rGeo = new THREE.TorusGeometry(ringRadii[i] * S, 0.012, 8, 120);
    const rMat = new THREE.MeshBasicMaterial({
      color: ringColors[i], transparent: true, opacity: 0.45 - i * 0.06,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.rotation.x = Math.PI * 0.5;
    ring.position.y = BY + 0.7 * S;
    group.add(ring);
    baseRings.push(ring);
  }

  // --- Base glow sprite ---
  const baseGlowMat = new THREE.SpriteMaterial({
    map: glowCyan, color: 0x44ddff, transparent: true, opacity: 0.3,
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
  });
  const baseGlow = new THREE.Sprite(baseGlowMat);
  baseGlow.scale.set(6 * S, 1.5 * S, 1);
  baseGlow.position.y = BY + 0.7 * S;
  group.add(baseGlow);

  // --- Figure halo (behind head) ---
  const haloMat = new THREE.SpriteMaterial({
    map: glowCyan, color: 0x66eeff, transparent: true, opacity: 0.2,
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
  });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.setScalar(4 * S);
  halo.position.set(0, BY + 2.1 * S, -0.5);
  group.add(halo);

  // --- 6 ORBITING DOTS ---
  const ORBIT_DOTS = 6;
  const dotColors = [0x5fe6ff, 0xffb833, 0xff5d73, 0xb06aff, 0x4dff91, 0xff9f43];
  const dotMeshes: THREE.Mesh[] = [];
  const dotGlows: THREE.Sprite[] = [];
  const dotOrbits: { angle: number; radius: number; speed: number; tilt: number; phase: number }[] = [];

  for (let i = 0; i < ORBIT_DOTS; i++) {
    const dGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const dMat = new THREE.MeshBasicMaterial({ color: dotColors[i] });
    const dot = new THREE.Mesh(dGeo, dMat);
    group.add(dot);
    dotMeshes.push(dot);

    const isGold = dotColors[i] === 0xffb833 || dotColors[i] === 0xff9f43;
    const spMat = new THREE.SpriteMaterial({
      map: isGold ? glowGold : glowCyan, color: dotColors[i],
      transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const sp = new THREE.Sprite(spMat);
    sp.scale.setScalar(0.5);
    group.add(sp);
    dotGlows.push(sp);

    dotOrbits.push({
      angle: (i / ORBIT_DOTS) * Math.PI * 2,
      radius: (2.0 + (i % 2) * 0.3) * S,
      speed: 0.4 + i * 0.07,
      tilt: (Math.PI / 5) * (i % 3 - 1),
      phase: i * 1.1,
    });
  }

  let amp = 0.06, ampTarget = 0.06;
  let time = 0;
  let raf = 0;

  function frame() {
    raf = requestAnimationFrame(frame);
    time += 0.016;
    amp += (ampTarget - amp) * 0.08;

    // Figure breathing
    const breathe = 1 + Math.sin(time * 1.2) * 0.008 + amp * 0.02;
    figure.scale.set(breathe, breathe, breathe);
    goldParticles.scale.set(breathe, breathe, breathe);

    // Brain pulse
    const brainPulse = 1 + Math.sin(time * 2.5) * 0.1 + amp * 0.3;
    brain.scale.setScalar(brainPulse);
    brainWire.scale.setScalar(brainPulse * 1.1);
    brainMat.opacity = 0.4 + amp * 0.4 + Math.sin(time * 3) * 0.1;
    brainWireMat.opacity = 0.2 + amp * 0.3;
    brain.rotation.y = time * 0.8;
    brainWire.rotation.y = -time * 0.5;

    // Ribbon animation
    for (const rb of ribbons) {
      const pos = rb.geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i <= ribbonSegs; i++) {
        const t = i / ribbonSegs;
        pos.setX(i, rb.baseX[i] + Math.sin(time * 2 + t * 6) * 0.08 * S * (1 + amp * 2));
        pos.setY(i, rb.baseY[i] + Math.sin(time * 1.5 + t * 4) * 0.06 * S * (1 + amp));
        pos.setZ(i, rb.baseZ[i] + Math.cos(time * 1.8 + t * 5) * 0.07 * S * (1 + amp));
      }
      pos.needsUpdate = true;
      (rb.line.material as THREE.LineBasicMaterial).opacity = 0.3 + amp * 0.4;
    }

    // Ribbon glow particles
    for (let i = 0; i < ribbonGlowN; i++) {
      const rIdx = i % ribbonCount;
      const rb = ribbons[rIdx];
      const trav = ((time * (0.8 + amp * 2) + i * 0.4) % 1);
      const seg = Math.floor(trav * ribbonSegs);
      const pos = rb.geo.attributes.position as THREE.BufferAttribute;
      ribbonGlowArr[i * 3] = pos.getX(seg);
      ribbonGlowArr[i * 3 + 1] = pos.getY(seg);
      ribbonGlowArr[i * 3 + 2] = pos.getZ(seg);
    }
    ribbonGlowGeo.attributes.position.needsUpdate = true;
    ribbonGlowMat.opacity = 0.4 + amp * 0.4;

    // Base rings
    for (let i = 0; i < baseRings.length; i++) {
      baseRings[i].rotation.z = time * (0.08 + i * 0.04) * (i % 2 === 0 ? 1 : -1);
      (baseRings[i].material as THREE.MeshBasicMaterial).opacity = (0.4 - i * 0.05) + amp * 0.2;
    }
    baseGlowMat.opacity = 0.25 + amp * 0.25;

    // Halo
    haloMat.opacity = 0.15 + amp * 0.2 + Math.sin(time * 1.5) * 0.03;
    halo.scale.setScalar((2.5 + amp * 0.8) * S);

    // Figure shimmer
    figMat.opacity = 0.75 + amp * 0.2 + Math.sin(time * 2) * 0.03;
    goldMat.opacity = 0.5 + amp * 0.3 + Math.sin(time * 1.8) * 0.05;

    // Orbiting dots
    const speedMult = 1 + amp * 4;
    for (let i = 0; i < ORBIT_DOTS; i++) {
      const d = dotOrbits[i];
      d.angle += d.speed * 0.016 * speedMult;
      const r = d.radius + Math.sin(time * 0.5 + d.phase) * 0.12 + amp * 0.4 * Math.sin(time * 2 + d.phase);
      const x = Math.cos(d.angle) * r;
      const z = Math.sin(d.angle) * r;
      const y = BY + 1.5 * S + Math.sin(d.angle + d.tilt) * 0.8 * S + Math.sin(time * 0.3 + d.phase) * 0.15;
      dotMeshes[i].position.set(x, y, z);
      dotGlows[i].position.set(x, y, z);
      dotGlows[i].scale.setScalar(0.4 + amp * 0.2 + Math.sin(time * 1.5 + d.phase) * 0.06);
    }

    // Slow group sway
    group.rotation.y = Math.sin(time * 0.15) * 0.1;

    renderer.render(scene, camera);
  }
  frame();

  return {
    setEnergy(v: number) { ampTarget = Math.max(0, Math.min(1, v)); },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    },
  };
}
