import * as THREE from 'three';
import { vertexShader, fragmentShader } from './fireWaterShader';

// The page background color. The renderer clears to this EXACT color every
// frame instead of relying on canvas alpha transparency. Some mobile
// browsers/WebViews silently fail to grant a true alpha-enabled WebGL
// context, which causes an opaque (often white) square to appear. Matching
// the clear color to the page background makes the canvas blend perfectly
// regardless of whether alpha transparency is actually supported — this is
// the robust, production-grade fix rather than chasing alpha support.
const PAGE_BG = 0x04060d;

export interface OrbHandle {
  setEnergy(v: number): void;
  dispose(): void;
}

export function mountOrb(container: HTMLElement): OrbHandle {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(PAGE_BG, 1);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.set(0, 0, 6.2);

  const group = new THREE.Group();
  scene.add(group);

  function size() {
    return container.clientWidth || 240;
  }
  function resize() {
    const s = size();
    renderer.setSize(s, s, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // shared soft glow sprite texture
  const sc = document.createElement('canvas');
  sc.width = sc.height = 64;
  const sctx = sc.getContext('2d')!;
  const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(170,235,255,.75)');
  g.addColorStop(1, 'rgba(170,235,255,0)');
  sctx.fillStyle = g;
  sctx.fillRect(0, 0, 64, 64);
  const glowTex = new THREE.CanvasTexture(sc);

  // --- fire+water shader core ---
  const uniforms = { uTime: { value: 0 }, uAmp: { value: 0.06 } };
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.62, 64, 64),
    new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader })
  );
  group.add(core);

  // depth occluder so the network shell correctly passes behind the core
  const occluder = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 24, 24),
    new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true })
  );
  group.add(occluder);

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

  // --- holographic network shell ---
  const NN = 150;
  const shellR = 1.18;
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
  const ACCENT = 0xffa64d, MAIN = 0x5fe6ff, MAIN2 = 0x9fe9ff;
  const nodeColors = nodePos.map(() => (Math.random() < 0.14 ? ACCENT : Math.random() < 0.5 ? MAIN : MAIN2));
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
    size: 0.045, map: glowTex, vertexColors: true, transparent: true, opacity: 0.95,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  const nodeCloud = new THREE.Points(nodeGeo, nodeMat);
  group.add(nodeCloud);

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
    vertexColors: true, transparent: true, opacity: 0.34, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  group.add(lines);

  const dustN = 26;
  const dustArr = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) {
    const r = shellR * (1.35 + Math.random() * 0.55);
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    dustArr[i * 3] = r * Math.sin(ph) * Math.cos(th);
    dustArr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    dustArr[i * 3 + 2] = r * Math.cos(ph);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustArr, 3));
  const dustMat = new THREE.PointsMaterial({
    size: 0.03, map: glowTex, color: 0x9fe9ff, transparent: true, opacity: 0.5,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  group.add(dust);

  function petal(radius: number, phiStart: number, phiLen: number, thetaStart: number, thetaLen: number, hex: number, op: number, rotX: number, rotY: number) {
    const geo = new THREE.SphereGeometry(radius, 28, 18, phiStart, phiLen, thetaStart, thetaLen);
    const mat = new THREE.MeshBasicMaterial({
      color: hex, transparent: true, opacity: op, side: THREE.DoubleSide,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.set(rotX, rotY, 0);
    group.add(mesh);
    return mesh;
  }
  const petal1 = petal(1.32, 0, 2.0, 0.6, 1.3, 0xff6a3d, 0.1, 0.5, 0.3);
  const petal2 = petal(1.4, 2.4, 1.8, 0.9, 1.0, 0x3da0ff, 0.07, -0.4, 1.6);

  let amp = 0.06, ampTarget = 0.06;
  let raf = 0;
  const clock = new THREE.Clock();

  function frame() {
    raf = requestAnimationFrame(frame);
    const t = clock.getElapsedTime();
    amp += (ampTarget - amp) * 0.07;

    uniforms.uTime.value = t;
    uniforms.uAmp.value = amp;
    core.scale.setScalar(1 + amp * 0.18);
    occluder.scale.setScalar(1 + amp * 0.16);

    group.rotation.y = t * 0.09;
    haloFire.mat.opacity = 0.22 + amp * 0.2;
    haloWater.mat.opacity = 0.16 + amp * 0.16;
    nodeCloud.rotation.y = t * 0.04;
    lines.rotation.y = t * 0.04;
    dust.rotation.y = -t * 0.02;
    nodeMat.opacity = 0.85 + amp * 0.15;
    lineMat.opacity = 0.28 + amp * 0.18;
    petal1.rotation.z = t * 0.06;
    petal2.rotation.z = -t * 0.05;

    renderer.render(scene, camera);
  }
  frame();

  return {
    setEnergy(v: number) {
      ampTarget = Math.max(0, Math.min(1, v));
    },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    },
  };
}
