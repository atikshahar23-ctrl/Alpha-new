import * as THREE from 'three';
import { vertexShader, fragmentShader } from './fireWaterShader';

export interface OrbHandle {
  setEnergy(v: number): void;
  dispose(): void;
}

export function mountOrb(container: HTMLElement): OrbHandle {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.set(0, 3.5, 5.0);
  camera.lookAt(0, 0, 0);

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
  gr.addColorStop(0.15, 'rgba(200,250,255,.95)');
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

  // --- GOLDEN RING (thick and prominent like reference) ---
  const goldRingGeo = new THREE.TorusGeometry(0.88, 0.045, 24, 120);
  const goldRingMat = new THREE.MeshBasicMaterial({
    color: 0xffb833,
    transparent: true,
    opacity: 0.95,
  });
  const goldRing = new THREE.Mesh(goldRingGeo, goldRingMat);
  goldRing.rotation.x = Math.PI * 0.5;
  group.add(goldRing);

  // Gold ring inner glow
  const goldGlowGeo = new THREE.TorusGeometry(0.88, 0.13, 24, 120);
  const goldGlowMat = new THREE.MeshBasicMaterial({
    color: 0xffc040,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const goldGlow = new THREE.Mesh(goldGlowGeo, goldGlowMat);
  goldGlow.rotation.x = Math.PI * 0.5;
  group.add(goldGlow);

  // Gold ring outer glow (wider)
  const goldGlow2Geo = new THREE.TorusGeometry(0.88, 0.22, 16, 100);
  const goldGlow2Mat = new THREE.MeshBasicMaterial({
    color: 0xffa020,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const goldGlow2 = new THREE.Mesh(goldGlow2Geo, goldGlow2Mat);
  goldGlow2.rotation.x = Math.PI * 0.5;
  group.add(goldGlow2);

  // --- multi-layer halos (glow around sphere) ---
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
  const haloCyan = haloSprite(0x40d8ff, 4.5, 0.35);
  const haloWhite = haloSprite(0xffffff, 2.8, 0.18);
  const haloOuter = haloSprite(0x2080ff, 6.5, 0.06);

  // --- 6 ORBITING COLORED DOTS (key feature from reference) ---
  const ORBIT_DOTS = 6;
  const dotColors = [0x5fe6ff, 0xffb833, 0xff5d73, 0xb06aff, 0x4dff91, 0xff9f43];
  const dotMeshes: THREE.Mesh[] = [];
  const dotGlows: THREE.Sprite[] = [];
  const dotOrbits: { angle: number; radius: number; speed: number; tilt: number; phase: number }[] = [];

  for (let i = 0; i < ORBIT_DOTS; i++) {
    const dotGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: dotColors[i] });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    group.add(dot);
    dotMeshes.push(dot);

    const glowMat = new THREE.SpriteMaterial({
      map: glowTex, color: dotColors[i], transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const glow = new THREE.Sprite(glowMat);
    glow.scale.setScalar(0.25);
    group.add(glow);
    dotGlows.push(glow);

    dotOrbits.push({
      angle: (i / ORBIT_DOTS) * Math.PI * 2,
      radius: 1.15 + (i % 2) * 0.15,
      speed: 0.5 + i * 0.08,
      tilt: (Math.PI / 6) * (i % 3 - 1),
      phase: i * 1.2,
    });
  }

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

    group.rotation.y = t * 0.06;

    // golden ring animation
    goldRing.rotation.x = Math.PI * 0.5 + Math.sin(t * 0.3) * 0.08;
    goldRing.rotation.z = t * 0.12;
    goldRingMat.opacity = 0.85 + amp * 0.15;
    goldGlow.rotation.copy(goldRing.rotation);
    goldGlowMat.opacity = 0.25 + amp * 0.35 + Math.sin(t * 1.5) * 0.05;
    goldGlow2.rotation.copy(goldRing.rotation);
    goldGlow2Mat.opacity = 0.1 + amp * 0.15;
    const ringScale = 1 + amp * 0.12;
    goldRing.scale.setScalar(ringScale);
    goldGlow.scale.setScalar(ringScale);
    goldGlow2.scale.setScalar(ringScale);

    // halos
    haloCyan.mat.opacity = 0.3 + amp * 0.3 + Math.sin(t * 0.9) * 0.03;
    haloWhite.mat.opacity = 0.12 + amp * 0.2;
    haloOuter.mat.opacity = 0.04 + amp * 0.08;
    haloCyan.sprite.scale.setScalar(4.5 + amp * 1.0);
    haloWhite.sprite.scale.setScalar(2.8 + amp * 0.6);

    // 6 orbiting dots - speed up when speaking/thinking
    const speedMult = 1 + amp * 4;
    const bounceAmp = amp * 0.3;
    for (let i = 0; i < ORBIT_DOTS; i++) {
      const d = dotOrbits[i];
      d.angle += d.speed * 0.016 * speedMult;
      const r = d.radius + Math.sin(t * 0.6 + d.phase) * 0.06 + bounceAmp * Math.sin(t * 3 + d.phase);
      const x = Math.cos(d.angle) * r;
      const z = Math.sin(d.angle) * r;
      const y = Math.sin(d.angle + d.tilt) * 0.3 + Math.sin(t * 0.4 + d.phase) * 0.08;
      dotMeshes[i].position.set(x, y, z);
      dotGlows[i].position.set(x, y, z);

      const scale = 0.2 + amp * 0.15 + Math.sin(t * 2 + d.phase) * 0.04;
      dotGlows[i].scale.setScalar(scale);
    }

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
