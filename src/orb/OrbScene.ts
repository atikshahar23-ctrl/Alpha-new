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
  renderer.toneMappingExposure = 1.2;
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

  // --- glow texture ---
  const sc = document.createElement('canvas');
  sc.width = sc.height = 128;
  const sctx = sc.getContext('2d')!;
  const gr = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.2, 'rgba(200,240,255,.9)');
  gr.addColorStop(0.5, 'rgba(170,235,255,.4)');
  gr.addColorStop(1, 'rgba(170,235,255,0)');
  sctx.fillStyle = gr;
  sctx.fillRect(0, 0, 128, 128);
  const glowTex = new THREE.CanvasTexture(sc);

  // --- soft ring texture for energy rings ---
  const rc = document.createElement('canvas');
  rc.width = rc.height = 256;
  const rctx = rc.getContext('2d')!;
  const rgr = rctx.createRadialGradient(128, 128, 80, 128, 128, 128);
  rgr.addColorStop(0, 'rgba(255,255,255,0)');
  rgr.addColorStop(0.6, 'rgba(255,255,255,0)');
  rgr.addColorStop(0.78, 'rgba(200,240,255,.5)');
  rgr.addColorStop(0.82, 'rgba(255,255,255,.8)');
  rgr.addColorStop(0.86, 'rgba(200,240,255,.5)');
  rgr.addColorStop(1, 'rgba(200,240,255,0)');
  rctx.fillStyle = rgr;
  rctx.fillRect(0, 0, 256, 256);
  const ringTex = new THREE.CanvasTexture(rc);

  // --- fire+water shader core (high-res sphere) ---
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

  // --- multi-layer halo system ---
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
  const haloFire = haloSprite(0xff7a2e, 4.4, 0.28);
  const haloWater = haloSprite(0x2fb6ff, 5.0, 0.2);
  const haloCore = haloSprite(0xffffff, 2.8, 0.12);
  const haloOuter = haloSprite(0x6e4fff, 6.5, 0.06);

  // --- energy rings ---
  const rings: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.RingGeometry(0.9 + i * 0.25, 1.0 + i * 0.25, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      map: ringTex, color: i === 0 ? 0x5fe6ff : i === 1 ? 0xff7a2e : 0xb06aff,
      transparent: true, opacity: 0.12, side: THREE.DoubleSide,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.5 + (i - 1) * 0.4;
    ring.rotation.z = i * 1.2;
    group.add(ring);
    rings.push(ring);
  }

  // --- holographic network shell ---
  const NN = 200;
  const shellR = 1.22;
  const nodePos: THREE.Vector3[] = [];
  for (let i = 0; i < NN; i++) {
    const y = 1 - (i / (NN - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    nodePos.push(
      new THREE.Vector3(Math.cos(theta) * rad, y, Math.sin(theta) * rad).multiplyScalar(
        shellR * (0.94 + Math.random() * 0.12)
      )
    );
  }
  const ACCENT = 0xffa64d, MAIN = 0x5fe6ff, MAIN2 = 0x9fe9ff, PURPLE = 0xb06aff;
  const nodeColors = nodePos.map(() => {
    const r = Math.random();
    return r < 0.12 ? ACCENT : r < 0.2 ? PURPLE : r < 0.55 ? MAIN : MAIN2;
  });
  const nodeArr = new Float32Array(NN * 3);
  const nodeColArr = new Float32Array(NN * 3);
  const nodeSizes = new Float32Array(NN);
  nodePos.forEach((p, i) => {
    nodeArr[i * 3] = p.x; nodeArr[i * 3 + 1] = p.y; nodeArr[i * 3 + 2] = p.z;
    const c = new THREE.Color(nodeColors[i]);
    nodeColArr[i * 3] = c.r; nodeColArr[i * 3 + 1] = c.g; nodeColArr[i * 3 + 2] = c.b;
    nodeSizes[i] = 0.03 + Math.random() * 0.035;
  });
  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodeArr, 3));
  nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeColArr, 3));
  const nodeMat = new THREE.PointsMaterial({
    size: 0.05, map: glowTex, vertexColors: true, transparent: true, opacity: 0.95,
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
      .slice(0, 3);
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
  const orbitN = 40;
  const orbitData: { angle: number; radius: number; speed: number; y: number; phase: number }[] = [];
  const orbitArr = new Float32Array(orbitN * 3);
  const orbitColArr = new Float32Array(orbitN * 3);
  for (let i = 0; i < orbitN; i++) {
    const data = {
      angle: Math.random() * Math.PI * 2,
      radius: 0.85 + Math.random() * 0.6,
      speed: (0.3 + Math.random() * 0.7) * (Math.random() < 0.5 ? 1 : -1),
      y: (Math.random() - 0.5) * 1.6,
      phase: Math.random() * Math.PI * 2,
    };
    orbitData.push(data);
    const c = new THREE.Color(Math.random() < 0.5 ? 0x5fe6ff : Math.random() < 0.5 ? 0xff7a2e : 0xb06aff);
    orbitColArr[i * 3] = c.r; orbitColArr[i * 3 + 1] = c.g; orbitColArr[i * 3 + 2] = c.b;
  }
  const orbitGeo = new THREE.BufferGeometry();
  orbitGeo.setAttribute('position', new THREE.BufferAttribute(orbitArr, 3));
  orbitGeo.setAttribute('color', new THREE.BufferAttribute(orbitColArr, 3));
  const orbitMat = new THREE.PointsMaterial({
    size: 0.04, map: glowTex, vertexColors: true, transparent: true, opacity: 0.8,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  const orbitCloud = new THREE.Points(orbitGeo, orbitMat);
  group.add(orbitCloud);

  // --- ambient dust ---
  const dustN = 50;
  const dustArr = new Float32Array(dustN * 3);
  const dustSpeeds: number[] = [];
  for (let i = 0; i < dustN; i++) {
    const r = shellR * (1.3 + Math.random() * 0.8);
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    dustArr[i * 3] = r * Math.sin(ph) * Math.cos(th);
    dustArr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    dustArr[i * 3 + 2] = r * Math.cos(ph);
    dustSpeeds.push(0.005 + Math.random() * 0.015);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustArr, 3));
  const dustMat = new THREE.PointsMaterial({
    size: 0.025, map: glowTex, color: 0x9fe9ff, transparent: true, opacity: 0.45,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  group.add(dust);

  // --- petals (atmospheric shells) ---
  function petal(radius: number, phiStart: number, phiLen: number, thetaStart: number, thetaLen: number, hex: number, op: number, rotX: number, rotY: number) {
    const geo = new THREE.SphereGeometry(radius, 32, 20, phiStart, phiLen, thetaStart, thetaLen);
    const mat = new THREE.MeshBasicMaterial({
      color: hex, transparent: true, opacity: op, side: THREE.DoubleSide,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.set(rotX, rotY, 0);
    group.add(mesh);
    return mesh;
  }
  const petal1 = petal(1.32, 0, 2.0, 0.6, 1.3, 0xff6a3d, 0.08, 0.5, 0.3);
  const petal2 = petal(1.4, 2.4, 1.8, 0.9, 1.0, 0x3da0ff, 0.06, -0.4, 1.6);
  const petal3 = petal(1.5, 1.0, 1.5, 0.5, 1.2, 0x8040ff, 0.04, 0.8, 2.4);

  let amp = 0.06, ampTarget = 0.06;
  let raf = 0;
  const clock = new THREE.Clock();

  function frame() {
    raf = requestAnimationFrame(frame);
    const t = clock.getElapsedTime();
    amp += (ampTarget - amp) * 0.07;

    uniforms.uTime.value = t;
    uniforms.uAmp.value = amp;

    const breathe = 1 + Math.sin(t * 0.8) * 0.02;
    core.scale.setScalar((1 + amp * 0.18) * breathe);
    occluder.scale.setScalar((1 + amp * 0.16) * breathe);

    group.rotation.y = t * 0.08;
    group.rotation.x = Math.sin(t * 0.15) * 0.05;

    // halos
    haloFire.mat.opacity = 0.22 + amp * 0.25;
    haloWater.mat.opacity = 0.16 + amp * 0.2;
    haloCore.mat.opacity = 0.08 + amp * 0.15 + Math.sin(t * 1.2) * 0.03;
    haloOuter.mat.opacity = 0.04 + amp * 0.08;
    haloFire.sprite.scale.setScalar(4.4 + amp * 0.8 + Math.sin(t * 0.7) * 0.15);
    haloWater.sprite.scale.setScalar(5.0 + amp * 1.0 + Math.sin(t * 0.5 + 1) * 0.2);

    // energy rings
    rings.forEach((ring, i) => {
      ring.rotation.z += (0.003 + amp * 0.01) * (i % 2 === 0 ? 1 : -1);
      ring.rotation.x += 0.001 * (i === 1 ? -1 : 1);
      const rm = ring.material as THREE.MeshBasicMaterial;
      rm.opacity = (0.08 + amp * 0.2) * (0.7 + 0.3 * Math.sin(t * (0.8 + i * 0.3)));
      ring.scale.setScalar(1 + amp * 0.3 + Math.sin(t * 0.6 + i) * 0.05);
    });

    // network shell
    nodeCloud.rotation.y = t * 0.04;
    lines.rotation.y = t * 0.04;
    nodeMat.opacity = 0.8 + amp * 0.2;
    lineMat.opacity = 0.22 + amp * 0.2;

    // orbiting particles
    const posAttr = orbitGeo.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < orbitN; i++) {
      const d = orbitData[i];
      d.angle += d.speed * 0.016 * (1 + amp * 2);
      const r = d.radius + Math.sin(t * 0.5 + d.phase) * 0.1 * (1 + amp);
      posAttr.setXYZ(i,
        Math.cos(d.angle) * r,
        d.y + Math.sin(t * 0.3 + d.phase) * 0.15,
        Math.sin(d.angle) * r
      );
    }
    posAttr.needsUpdate = true;
    orbitMat.opacity = 0.5 + amp * 0.4;

    // dust rotation
    dust.rotation.y = -t * 0.015;
    dust.rotation.x = Math.sin(t * 0.1) * 0.03;

    // petals
    petal1.rotation.z = t * 0.06;
    petal2.rotation.z = -t * 0.05;
    petal3.rotation.z = t * 0.04;
    (petal1.material as THREE.MeshBasicMaterial).opacity = 0.06 + amp * 0.08;
    (petal2.material as THREE.MeshBasicMaterial).opacity = 0.05 + amp * 0.06;
    (petal3.material as THREE.MeshBasicMaterial).opacity = 0.03 + amp * 0.05;

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
