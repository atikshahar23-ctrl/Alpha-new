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
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  camera.position.set(0, 1.8, 2.2);
  camera.lookAt(0, 0, 0);

  function size() { return container.clientWidth || 240; }
  function resize() {
    const s = size();
    renderer.setSize(s, s, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // --- glow texture for sprites ---
  const gc = document.createElement('canvas');
  gc.width = gc.height = 128;
  const gctx = gc.getContext('2d')!;
  const gr = gctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.2, 'rgba(200,250,255,.9)');
  gr.addColorStop(0.5, 'rgba(95,230,255,.3)');
  gr.addColorStop(1, 'rgba(95,230,255,0)');
  gctx.fillStyle = gr;
  gctx.fillRect(0, 0, 128, 128);
  const glowTex = new THREE.CanvasTexture(gc);

  // --- CORE: Icosahedron wireframe (from user's code) ---
  const coreGeo = new THREE.IcosahedronGeometry(1, 12);
  const coreMat = new THREE.MeshPhongMaterial({
    color: 0x00d4ff,
    wireframe: true,
    emissive: 0x003366,
    transparent: true,
    opacity: 0.7,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  // --- Lighting ---
  const pointLight = new THREE.PointLight(0xffffff, 1.5, 100);
  pointLight.position.set(2, 2, 5);
  scene.add(pointLight);
  scene.add(new THREE.AmbientLight(0x202020));

  const cyanLight = new THREE.PointLight(0x00d4ff, 0.8, 50);
  cyanLight.position.set(-2, -1, 3);
  scene.add(cyanLight);

  // --- GOLDEN RING ---
  const goldRingGeo = new THREE.TorusGeometry(1.35, 0.04, 24, 120);
  const goldRingMat = new THREE.MeshBasicMaterial({
    color: 0xffb833,
    transparent: true,
    opacity: 0.9,
  });
  const goldRing = new THREE.Mesh(goldRingGeo, goldRingMat);
  goldRing.rotation.x = Math.PI * 0.5;
  scene.add(goldRing);

  const goldGlowGeo = new THREE.TorusGeometry(1.35, 0.12, 24, 120);
  const goldGlowMat = new THREE.MeshBasicMaterial({
    color: 0xffc040,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const goldGlow = new THREE.Mesh(goldGlowGeo, goldGlowMat);
  goldGlow.rotation.x = Math.PI * 0.5;
  scene.add(goldGlow);

  // --- Center glow sprite ---
  const haloMat = new THREE.SpriteMaterial({
    map: glowTex, color: 0x00d4ff, transparent: true, opacity: 0.35,
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
  });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.setScalar(4.5);
  scene.add(halo);

  // --- 6 ORBITING COLORED DOTS ---
  const ORBIT_DOTS = 6;
  const dotColors = [0x5fe6ff, 0xffb833, 0xff5d73, 0xb06aff, 0x4dff91, 0xff9f43];
  const dotMeshes: THREE.Mesh[] = [];
  const dotGlows: THREE.Sprite[] = [];
  const dotOrbits: { angle: number; radius: number; speed: number; tilt: number; phase: number }[] = [];

  for (let i = 0; i < ORBIT_DOTS; i++) {
    const dotGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: dotColors[i] });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    scene.add(dot);
    dotMeshes.push(dot);

    const spMat = new THREE.SpriteMaterial({
      map: glowTex, color: dotColors[i], transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const sp = new THREE.Sprite(spMat);
    sp.scale.setScalar(0.28);
    scene.add(sp);
    dotGlows.push(sp);

    dotOrbits.push({
      angle: (i / ORBIT_DOTS) * Math.PI * 2,
      radius: 1.7 + (i % 2) * 0.2,
      speed: 0.5 + i * 0.08,
      tilt: (Math.PI / 6) * (i % 3 - 1),
      phase: i * 1.2,
    });
  }

  let amp = 0.06, ampTarget = 0.06;
  let time = 0;
  let raf = 0;

  function frame() {
    raf = requestAnimationFrame(frame);
    time += 0.05;
    amp += (ampTarget - amp) * 0.1;

    // Core rotation (from user's code)
    core.rotation.x += 0.005 + amp * 0.02;
    core.rotation.y += 0.008 + amp * 0.03;

    // Core pulse
    const pulse = 1 + Math.sin(time) * (0.05 + amp * 0.15);
    core.scale.set(pulse, pulse, pulse);

    // Core reactivity
    coreMat.opacity = 0.6 + amp * 0.4;
    coreMat.emissive.setHex(amp > 0.3 ? 0x005588 : 0x003366);

    // Golden ring
    goldRing.rotation.x = Math.PI * 0.5 + Math.sin(time * 0.06) * 0.08;
    goldRing.rotation.z = time * 0.024;
    goldRingMat.opacity = 0.85 + amp * 0.15;
    goldGlow.rotation.copy(goldRing.rotation);
    goldGlowMat.opacity = 0.2 + amp * 0.35 + Math.sin(time * 0.3) * 0.05;
    const rs = 1 + amp * 0.1;
    goldRing.scale.setScalar(rs);
    goldGlow.scale.setScalar(rs);

    // Center glow
    haloMat.opacity = 0.3 + amp * 0.3;
    halo.scale.setScalar(4.5 + amp * 1.5);

    // Cyan light intensity follows energy
    cyanLight.intensity = 0.8 + amp * 2;

    // 6 orbiting dots
    const speedMult = 1 + amp * 4;
    for (let i = 0; i < ORBIT_DOTS; i++) {
      const d = dotOrbits[i];
      d.angle += d.speed * 0.016 * speedMult;
      const r = d.radius + Math.sin(time * 0.12 + d.phase) * 0.06 + amp * 0.3 * Math.sin(time * 0.6 + d.phase);
      const x = Math.cos(d.angle) * r;
      const z = Math.sin(d.angle) * r;
      const y = Math.sin(d.angle + d.tilt) * 0.35 + Math.sin(time * 0.08 + d.phase) * 0.08;
      dotMeshes[i].position.set(x, y, z);
      dotGlows[i].position.set(x, y, z);
      dotGlows[i].scale.setScalar(0.22 + amp * 0.18 + Math.sin(time * 0.4 + d.phase) * 0.04);
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
