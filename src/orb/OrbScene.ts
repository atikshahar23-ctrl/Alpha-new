import * as THREE from 'three';
import { vertexShader, fragmentShader } from './fireWaterShader';

const PAGE_BG = 0x04060d;

export interface OrbHandle {
  setEnergy(v: number): void;
  dispose(): void;
}

export function mountOrb(container: HTMLElement): OrbHandle {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(PAGE_BG, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.set(0, 0, 6.2);

  const group = new THREE.Group();
  scene.add(group);

  function size() { return container.clientWidth || 240; }
  function resize() {
    const s = size();
    renderer.setSize(s, s, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // --- glow texture (128px) ---
  const sc = document.createElement('canvas');
  sc.width = sc.height = 128;
  const sctx = sc.getContext('2d')!;
  const gr = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.15, 'rgba(180,245,255,.95)');
  gr.addColorStop(0.5, 'rgba(95,230,255,.35)');
  gr.addColorStop(1, 'rgba(95,230,255,0)');
  sctx.fillStyle = gr;
  sctx.fillRect(0, 0, 128, 128);
  const glowTex = new THREE.CanvasTexture(sc);

  // --- shader core sphere ---
  const uniforms = { uTime: { value: 0 }, uAmp: { value: 0.06 } };
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.62, 96, 96),
    new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader })
  );
  group.add(core);

  // depth occluder
  const occluder = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 32, 32),
    new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true })
  );
  group.add(occluder);

  // --- GOLDEN RING (prominent, like reference image) ---
  const goldRingGeo = new THREE.TorusGeometry(0.82, 0.025, 16, 100);
  const goldRingMat = new THREE.MeshBasicMaterial({
    color: 0xffb833,
    transparent: true,
    opacity: 0.9,
  });
  const goldRing = new THREE.Mesh(goldRingGeo, goldRingMat);
  goldRing.rotation.x = Math.PI * 0.5;
  group.add(goldRing);

  // Gold ring glow (wider, softer)
  const goldGlowGeo = new THREE.TorusGeometry(0.82, 0.08, 16, 100);
  const goldGlowMat = new THREE.MeshBasicMaterial({
    color: 0xffc040,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const goldGlow = new THREE.Mesh(goldGlowGeo, goldGlowMat);
  goldGlow.rotation.x = Math.PI * 0.5;
  group.add(goldGlow);

  // Second subtle ring
  const ring2Geo = new THREE.TorusGeometry(1.05, 0.012, 12, 80);
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0x5fe6ff,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = Math.PI * 0.55;
  ring2.rotation.z = 0.3;
  group.add(ring2);

  // --- multi-layer halos ---
  function haloSprite(hex: number, scale: number, op: number) {
    const m = new THREE.SpriteMaterial({
      map: glowTex, color: hex, transparent: true, opacity: op,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
    });
    const s = new THREE.Sprite(m);
    s.scale.setScalar(scale);
    group.add(s);
    return { sprite: s, mat: m };
  }
  const haloCyan = haloSprite(0x40d8ff, 4.0, 0.3);
  const haloWhite = haloSprite(0xffffff, 2.5, 0.15);
  const haloOuter = haloSprite(0x2080ff, 6.0, 0.06);

  // --- holographic network shell ---
  const NN = 180;
  const shellR = 1.3;
  const nodePos: THREE.Vector3[] = [];
  for (let i = 0; i < NN; i++) {
    const y = 1 - (i / (NN - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    nodePos.push(
      new THREE.Vector3(Math.cos(theta) * rad, y, Math.sin(theta) * rad).multiplyScalar(
        shellR * (0.95 + Math.random() * 0.1)
      )
    );
  }
  const ACCENT = 0xffb833, MAIN = 0x5fe6ff, MAIN2 = 0xa0eeff;
  const nodeColors = nodePos.map(() => {
    const r = Math.random();
    return r < 0.1 ? ACCENT : r < 0.55 ? MAIN : MAIN2;
  });
  const nodeArr = new Float32Array(NN * 3);
  const nodeColArr = new Float32Array(NN * 3);
  nodePos.forEach((p, i) => {
    nodeArr[i * 3] = p.x; nodeArr[i * 3 + 1] = p.y; nodeArr[i * 3 + 2] = p.z;
    const c = new THREE.Color(nodeColors[i]);
    nodeColArr[i * 3] = c.r; nodeColArr[i * 3 + 1] = c.g; nodeColArr[i * 3 + 2] = c.b;
  });
  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodeArr, 3));
  nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeColArr, 3));
  const nodeMat = new THREE.PointsMaterial({
    size: 0.045, map: glowTex, vertexColors: true, transparent: true, opacity: 0.9,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  const nodeCloud = new THREE.Points(nodeGeo, nodeMat);
  group.add(nodeCloud);

  // connections
  const linePos: number[] = [], lineCol: number[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < NN; i++) {
    const nearest = nodePos
      .map((p, j) => ({ j, d: i === j ? 1e9 : p.distanceTo(nodePos[i]) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    for (const { j } of nearest) {
      const key = i < j ? `${i}_${j}` : `${j}_${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const a = nodePos[i], b = nodePos[j];
      const ca = new THREE.Color(nodeColors[i]), cb = new THREE.Color(nodeColors[j]);
      linePos.push(a.x, a.y, a.z, b.x, b.y, b.z);
      lineCol.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b);
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePos), 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(lineCol), 3));
  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  group.add(lines);

  // --- orbiting energy particles ---
  const orbitN = 30;
  const orbitData: { angle: number; radius: number; speed: number; y: number; phase: number }[] = [];
  const orbitArr = new Float32Array(orbitN * 3);
  const orbitColArr = new Float32Array(orbitN * 3);
  for (let i = 0; i < orbitN; i++) {
    orbitData.push({
      angle: Math.random() * Math.PI * 2,
      radius: 0.85 + Math.random() * 0.5,
      speed: (0.3 + Math.random() * 0.6) * (Math.random() < 0.5 ? 1 : -1),
      y: (Math.random() - 0.5) * 1.4,
      phase: Math.random() * Math.PI * 2,
    });
    const c = new THREE.Color(Math.random() < 0.6 ? 0x5fe6ff : 0xffb833);
    orbitColArr[i * 3] = c.r; orbitColArr[i * 3 + 1] = c.g; orbitColArr[i * 3 + 2] = c.b;
  }
  const orbitGeo = new THREE.BufferGeometry();
  orbitGeo.setAttribute('position', new THREE.BufferAttribute(orbitArr, 3));
  orbitGeo.setAttribute('color', new THREE.BufferAttribute(orbitColArr, 3));
  const orbitMat = new THREE.PointsMaterial({
    size: 0.04, map: glowTex, vertexColors: true, transparent: true, opacity: 0.7,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  const orbitCloud = new THREE.Points(orbitGeo, orbitMat);
  group.add(orbitCloud);

  // --- ambient dust ---
  const dustN = 40;
  const dustArr = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) {
    const r = shellR * (1.2 + Math.random() * 0.7);
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    dustArr[i * 3] = r * Math.sin(ph) * Math.cos(th);
    dustArr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    dustArr[i * 3 + 2] = r * Math.cos(ph);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustArr, 3));
  const dustMat = new THREE.PointsMaterial({
    size: 0.02, map: glowTex, color: 0xa0eeff, transparent: true, opacity: 0.4,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  group.add(dust);

  let amp = 0.06, ampTarget = 0.06;
  let raf = 0;
  const clock = new THREE.Clock();

  function frame() {
    raf = requestAnimationFrame(frame);
    const t = clock.getElapsedTime();
    amp += (ampTarget - amp) * 0.07;

    uniforms.uTime.value = t;
    uniforms.uAmp.value = amp;

    const breathe = 1 + Math.sin(t * 0.8) * 0.015;
    core.scale.setScalar((1 + amp * 0.15) * breathe);
    occluder.scale.setScalar((1 + amp * 0.13) * breathe);

    group.rotation.y = t * 0.08;

    // golden ring animation
    goldRing.rotation.x = Math.PI * 0.5 + Math.sin(t * 0.3) * 0.1;
    goldRing.rotation.z = t * 0.15;
    goldRingMat.opacity = 0.8 + amp * 0.2;
    goldGlow.rotation.copy(goldRing.rotation);
    goldGlowMat.opacity = 0.2 + amp * 0.3 + Math.sin(t * 1.5) * 0.05;
    const ringScale = 1 + amp * 0.15;
    goldRing.scale.setScalar(ringScale);
    goldGlow.scale.setScalar(ringScale);

    // second ring
    ring2.rotation.z += 0.003;
    ring2Mat.opacity = 0.15 + amp * 0.25;

    // halos
    haloCyan.mat.opacity = 0.25 + amp * 0.25 + Math.sin(t * 0.9) * 0.03;
    haloWhite.mat.opacity = 0.1 + amp * 0.15;
    haloOuter.mat.opacity = 0.04 + amp * 0.06;
    haloCyan.sprite.scale.setScalar(4.0 + amp * 0.8);
    haloWhite.sprite.scale.setScalar(2.5 + amp * 0.5);

    // shell
    nodeCloud.rotation.y = t * 0.04;
    lines.rotation.y = t * 0.04;
    nodeMat.opacity = 0.8 + amp * 0.2;
    lineMat.opacity = 0.22 + amp * 0.2;

    // orbiting particles
    const posAttr = orbitGeo.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < orbitN; i++) {
      const d = orbitData[i];
      d.angle += d.speed * 0.016 * (1 + amp * 2);
      const r = d.radius + Math.sin(t * 0.5 + d.phase) * 0.08 * (1 + amp);
      posAttr.setXYZ(i,
        Math.cos(d.angle) * r,
        d.y + Math.sin(t * 0.3 + d.phase) * 0.12,
        Math.sin(d.angle) * r
      );
    }
    posAttr.needsUpdate = true;
    orbitMat.opacity = 0.5 + amp * 0.4;

    dust.rotation.y = -t * 0.015;

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
