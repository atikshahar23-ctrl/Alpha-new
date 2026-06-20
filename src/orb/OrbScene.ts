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

  // --- glow texture ---
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

  // --- gold glow texture ---
  const ggc = document.createElement('canvas');
  ggc.width = ggc.height = 128;
  const ggctx = ggc.getContext('2d')!;
  const ggr = ggctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  ggr.addColorStop(0, 'rgba(255,220,120,1)');
  ggr.addColorStop(0.3, 'rgba(255,184,51,.7)');
  ggr.addColorStop(0.6, 'rgba(255,160,32,.2)');
  ggr.addColorStop(1, 'rgba(255,140,0,0)');
  ggctx.fillStyle = ggr;
  ggctx.fillRect(0, 0, 128, 128);
  const goldGlowTex = new THREE.CanvasTexture(ggc);

  // --- CORE: Icosahedron wireframe ---
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

  // --- Inner solid sphere (white-cyan glow core) ---
  const innerGeo = new THREE.SphereGeometry(0.55, 32, 32);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x88ddff,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const innerCore = new THREE.Mesh(innerGeo, innerMat);
  scene.add(innerCore);

  // --- Lighting ---
  const pointLight = new THREE.PointLight(0xffffff, 1.5, 100);
  pointLight.position.set(2, 2, 5);
  scene.add(pointLight);
  scene.add(new THREE.AmbientLight(0x303030));

  const cyanLight = new THREE.PointLight(0x00d4ff, 0.8, 50);
  cyanLight.position.set(-2, -1, 3);
  scene.add(cyanLight);

  const goldLight = new THREE.PointLight(0xffb833, 0.4, 30);
  goldLight.position.set(1, -2, 2);
  scene.add(goldLight);

  // --- GOLDEN RING 1 (main, horizontal) ---
  const goldRing1Geo = new THREE.TorusGeometry(1.35, 0.045, 24, 120);
  const goldRing1Mat = new THREE.MeshBasicMaterial({
    color: 0xffb833, transparent: true, opacity: 0.95,
  });
  const goldRing1 = new THREE.Mesh(goldRing1Geo, goldRing1Mat);
  goldRing1.rotation.x = Math.PI * 0.5;
  scene.add(goldRing1);

  const goldGlow1Geo = new THREE.TorusGeometry(1.35, 0.14, 24, 120);
  const goldGlow1Mat = new THREE.MeshBasicMaterial({
    color: 0xffc040, transparent: true, opacity: 0.3,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const goldGlow1 = new THREE.Mesh(goldGlow1Geo, goldGlow1Mat);
  goldGlow1.rotation.x = Math.PI * 0.5;
  scene.add(goldGlow1);

  // --- GOLDEN RING 2 (tilted, thinner) ---
  const goldRing2Geo = new THREE.TorusGeometry(1.55, 0.02, 16, 100);
  const goldRing2Mat = new THREE.MeshBasicMaterial({
    color: 0xffd060, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const goldRing2 = new THREE.Mesh(goldRing2Geo, goldRing2Mat);
  goldRing2.rotation.x = Math.PI * 0.42;
  goldRing2.rotation.z = 0.4;
  scene.add(goldRing2);

  // --- WHITE RING (outer, subtle) ---
  const whiteRingGeo = new THREE.TorusGeometry(1.75, 0.015, 12, 80);
  const whiteRingMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.2,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const whiteRing = new THREE.Mesh(whiteRingGeo, whiteRingMat);
  whiteRing.rotation.x = Math.PI * 0.55;
  whiteRing.rotation.z = -0.3;
  scene.add(whiteRing);

  // --- Center halos ---
  function makeHalo(tex: THREE.Texture, color: number, scale: number, op: number) {
    const m = new THREE.SpriteMaterial({
      map: tex, color, transparent: true, opacity: op,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
    });
    const s = new THREE.Sprite(m);
    s.scale.setScalar(scale);
    scene.add(s);
    return { sprite: s, mat: m };
  }
  const haloCyan = makeHalo(glowTex, 0x00d4ff, 4.5, 0.3);
  const haloGold = makeHalo(goldGlowTex, 0xffb833, 3.0, 0.12);
  const haloWhite = makeHalo(glowTex, 0xffffff, 2.0, 0.1);

  // --- 6 ORBITING COLORED DOTS ---
  const ORBIT_DOTS = 6;
  const dotColors = [0x5fe6ff, 0xffb833, 0xff5d73, 0xb06aff, 0x4dff91, 0xff9f43];
  const dotMeshes: THREE.Mesh[] = [];
  const dotGlows: THREE.Sprite[] = [];
  const dotOrbits: { angle: number; radius: number; speed: number; tilt: number; phase: number }[] = [];

  for (let i = 0; i < ORBIT_DOTS; i++) {
    const dotGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: dotColors[i] });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    scene.add(dot);
    dotMeshes.push(dot);

    const isGold = dotColors[i] === 0xffb833 || dotColors[i] === 0xff9f43;
    const spMat = new THREE.SpriteMaterial({
      map: isGold ? goldGlowTex : glowTex, color: dotColors[i], transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const sp = new THREE.Sprite(spMat);
    sp.scale.setScalar(0.35);
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

  // --- Gold dust particles ---
  const dustN = 25;
  const dustArr = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) {
    const r = 1.5 + Math.random() * 1.0;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    dustArr[i * 3] = r * Math.sin(ph) * Math.cos(th);
    dustArr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    dustArr[i * 3 + 2] = r * Math.cos(ph);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustArr, 3));
  const dustMat = new THREE.PointsMaterial({
    size: 0.04, map: goldGlowTex, color: 0xffd080, transparent: true, opacity: 0.5,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  let amp = 0.06, ampTarget = 0.06;
  let time = 0;
  let raf = 0;

  function frame() {
    raf = requestAnimationFrame(frame);
    time += 0.05;
    amp += (ampTarget - amp) * 0.1;

    // Core rotation & pulse
    core.rotation.x += 0.005 + amp * 0.02;
    core.rotation.y += 0.008 + amp * 0.03;
    const pulse = 1 + Math.sin(time) * (0.05 + amp * 0.15);
    core.scale.set(pulse, pulse, pulse);
    coreMat.opacity = 0.6 + amp * 0.4;
    coreMat.emissive.setHex(amp > 0.3 ? 0x005588 : 0x003366);

    // Inner core glow
    innerMat.opacity = 0.1 + amp * 0.25 + Math.sin(time * 0.4) * 0.03;
    innerCore.scale.setScalar(0.55 + amp * 0.15);

    // Golden ring 1
    goldRing1.rotation.x = Math.PI * 0.5 + Math.sin(time * 0.06) * 0.08;
    goldRing1.rotation.z = time * 0.024;
    goldRing1Mat.opacity = 0.85 + amp * 0.15;
    goldGlow1.rotation.copy(goldRing1.rotation);
    goldGlow1Mat.opacity = 0.2 + amp * 0.35 + Math.sin(time * 0.3) * 0.05;
    const rs1 = 1 + amp * 0.1;
    goldRing1.scale.setScalar(rs1);
    goldGlow1.scale.setScalar(rs1);

    // Golden ring 2
    goldRing2.rotation.z = 0.4 + time * 0.015;
    goldRing2Mat.opacity = 0.35 + amp * 0.3;

    // White ring
    whiteRing.rotation.z = -0.3 - time * 0.01;
    whiteRingMat.opacity = 0.15 + amp * 0.2;

    // Halos
    haloCyan.mat.opacity = 0.25 + amp * 0.3 + Math.sin(time * 0.18) * 0.03;
    haloCyan.sprite.scale.setScalar(4.5 + amp * 1.5);
    haloGold.mat.opacity = 0.08 + amp * 0.2;
    haloGold.sprite.scale.setScalar(3.0 + amp * 1.0);
    haloWhite.mat.opacity = 0.06 + amp * 0.15;
    haloWhite.sprite.scale.setScalar(2.0 + amp * 0.8);

    // Lights
    cyanLight.intensity = 0.8 + amp * 2;
    goldLight.intensity = 0.4 + amp * 1.5;

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
      dotGlows[i].scale.setScalar(0.28 + amp * 0.2 + Math.sin(time * 0.4 + d.phase) * 0.05);
    }

    // Gold dust rotation
    dust.rotation.y = -time * 0.008;
    dust.rotation.x = Math.sin(time * 0.04) * 0.1;
    dustMat.opacity = 0.35 + amp * 0.3;

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
