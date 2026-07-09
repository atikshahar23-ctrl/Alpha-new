// ── Module 5 · VIP 'Home-World' Channel ────────────────────────────────────
//
// An elegant white/gold high-priority comms terminal that bypasses every
// red-alert state — a serene, secure line for family / bookkeeping. Always
// calm gold, never tints to alert, with a soft "SECURE" beacon.
export function createVipChannel(ctx) {
  const { THREE, scene, markDynamic, helpers, obstacles } = ctx;
  const GOLD = 0xE9C877;
  const SPOT = { x: 34, z: 24 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 0.9 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 1.0, 8), new THREE.MeshStandardMaterial({ color: 0xf3efe6, metalness: 0.5, roughness: 0.25, emissive: 0x2a2416, emissiveIntensity: 0.2 }));
  base.position.y = 0.5; group.add(base);
  const ringGold = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 10, 40), new THREE.MeshBasicMaterial({ color: GOLD, toneMapped: false }));
  ringGold.rotation.x = Math.PI / 2; ringGold.position.y = 1.02; group.add(ringGold);
  // A calm floating white/gold panel.
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshBasicMaterial({ color: 0xfff6e0, transparent: true, opacity: 0.16, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  panel.position.set(0, 1.9, 0); group.add(panel);
  // diamond insignia
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), new THREE.MeshStandardMaterial({ color: 0xfff2cf, metalness: 0.9, roughness: 0.12, emissive: GOLD, emissiveIntensity: 0.5 }));
  gem.position.set(0, 1.9, 0.05); group.add(gem);
  const beacon = new THREE.PointLight(GOLD, 0.7, 8); beacon.position.set(0, 2.1, 0); group.add(beacon);
  const sign = helpers.buildNeonSign("VIP · HOME-WORLD", GOLD, 2.4, 0.5);
  sign.position.set(0, 3.0, 0); group.add(sign);
  const sub = helpers.buildNeonSign("SECURE · משפחה", GOLD, 1.8, 0.34);
  sub.position.set(0, 1.2, 0); group.add(sub);

  let t = 0;
  return {
    update(dt) {
      t += dt;
      gem.rotation.y += dt * 0.9; gem.rotation.x += dt * 0.4;
      gem.position.y = 1.9 + Math.sin(t * 1.3) * 0.05;
      // Calm, steady pulse — deliberately NEVER red, bypassing alerts.
      const p = 0.55 + 0.2 * Math.sin(t * 1.8);
      panel.material.opacity = 0.12 + p * 0.1;
      ringGold.material.opacity = 1;
      beacon.intensity = 0.5 + p * 0.4;
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
