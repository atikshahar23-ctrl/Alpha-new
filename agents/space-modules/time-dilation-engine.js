// ── Module 15 · Time-Dilation Engine (Backtesting) ─────────────────────────
//
// A glowing hourglass module. It idles slowly, then periodically "activates" —
// spinning up, flooding its sand stream, and emitting expanding time-ripples —
// to visualize fast-forwarding the market/fleet timeline for predictive AI
// backtesting. Exposes liveRef.timeDilation (a 1..N factor other systems can
// read if they choose); purely additive, never blocks anything.
export function createTimeDilationEngine(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles } = ctx;
  const CY = 0x8f6bff;
  const SPOT = { x: -33, z: 6 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.0 });

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.75, 0.9, 8), new THREE.MeshStandardMaterial({ color: 0x14101f, metalness: 0.6, roughness: 0.4 }));
  pedestal.position.y = 0.45; group.add(pedestal);

  // Hourglass: two cones tip-to-tip inside a glass frame.
  const hg = new THREE.Group(); hg.position.y = 1.7; group.add(hg);
  const glassMat = new THREE.MeshBasicMaterial({ color: CY, transparent: true, opacity: 0.14, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.65, 20, 1, true), glassMat); top.position.y = 0.34; hg.add(top);
  const bot = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.65, 20, 1, true), glassMat); bot.rotation.z = Math.PI; bot.position.y = -0.34; hg.add(bot);
  const cap1 = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 8, 28), new THREE.MeshBasicMaterial({ color: CY, toneMapped: false })); cap1.rotation.x = Math.PI / 2; cap1.position.y = 0.66; hg.add(cap1);
  const cap2 = cap1.clone(); cap2.position.y = -0.66; hg.add(cap2);

  // Sand stream — a vertical point column.
  const SN = 90;
  const sp = new Float32Array(SN * 3);
  for (let i = 0; i < SN; i++) { sp[i * 3] = (Math.random() - 0.5) * 0.06; sp[i * 3 + 1] = 0.66 - Math.random() * 1.32; sp[i * 3 + 2] = (Math.random() - 0.5) * 0.06; }
  const sgeo = new THREE.BufferGeometry(); sgeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  const sand = new THREE.Points(sgeo, new THREE.PointsMaterial({ color: 0xe0c8ff, size: 0.05, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  hg.add(sand);
  const light = new THREE.PointLight(CY, 0.5, 7); light.position.y = 1.7; group.add(light);

  // Ripple pool.
  const ripples = [];
  for (let i = 0; i < 4; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.03, 8, 32), new THREE.MeshBasicMaterial({ color: CY, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); r.rotation.x = Math.PI / 2; r.position.y = 1.7; group.add(r); ripples.push({ mesh: r, life: 0 }); }
  const sign = helpers.buildNeonSign("TIME-DILATION", CY, 2.2, 0.42);
  sign.position.set(0, 3.0, 0); group.add(sign);

  let t = 0, activeT = 0, timer = 8, rippleT = 0;
  return {
    update(dt) {
      t += dt; timer -= dt;
      if (timer <= 0) { activeT = 3.2; timer = 12 + Math.random() * 8; }
      const active = activeT > 0;
      if (active) activeT -= dt;
      const factor = active ? 6 : 1;
      liveRef.current.timeDilation = factor;

      hg.rotation.y += dt * (active ? 3 : 0.4);
      // Sand falls (faster when active), recycling top→bottom.
      const arr = sgeo.attributes.position.array;
      for (let i = 0; i < SN; i++) { arr[i * 3 + 1] -= dt * (0.5 + factor * 0.3); if (arr[i * 3 + 1] < -0.66) arr[i * 3 + 1] = 0.66; }
      sgeo.attributes.position.needsUpdate = true;
      light.intensity = 0.4 + (active ? 1.4 : 0.1) * (0.6 + 0.4 * Math.sin(t * 6));

      if (active) { rippleT += dt; if (rippleT > 0.4) { rippleT = 0; const r = ripples.find((x) => x.life <= 0); if (r) { r.life = 1; r.mesh.scale.setScalar(1); } } }
      for (const r of ripples) { if (r.life > 0) { r.life -= dt; r.mesh.scale.setScalar(1 + (1 - r.life) * 6); r.mesh.material.opacity = Math.max(0, r.life * 0.7); } }
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
