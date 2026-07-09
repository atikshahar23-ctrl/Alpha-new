// ── Module 53 · Zero-Gravity Anomaly Button ────────────────────────────────
//
// A big red "DO NOT PRESS" button on a pedestal. Pressing it (auto-demo on a
// long cycle, or liveRef.triggerZeroG()) flips liveRef.zeroGravity on for a
// spell: the anomaly's own cloud of loose debris — crates, bolts, a mug, a
// clipboard — lifts off and tumbles weightlessly, then everything settles as
// gravity returns. Self-contained so it can't strand the host's own objects.
export function createZeroGButton(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles } = ctx;
  const SPOT = { x: 6, z: 26 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.0 });

  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 1.0, 12), new THREE.MeshStandardMaterial({ color: 0x1a1a1e, metalness: 0.6, roughness: 0.4 }));
  stand.position.y = 0.5; group.add(stand);
  const guard = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 8, 24), new THREE.MeshStandardMaterial({ color: 0xffcc33, metalness: 0.7, roughness: 0.3, emissive: 0x332600, emissiveIntensity: 0.4 }));
  guard.rotation.x = Math.PI / 2; guard.position.y = 1.05; group.add(guard);
  const button = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.18, 20), new THREE.MeshStandardMaterial({ color: 0xff2a2a, metalness: 0.4, roughness: 0.3, emissive: 0x5a0000, emissiveIntensity: 0.6 }));
  button.position.y = 1.12; group.add(button);
  const sign = helpers.buildNeonSign("⚠ DO NOT PRESS", 0xff4444, 2.2, 0.42); sign.position.set(0, 2.2, 0); group.add(sign);

  // Loose debris that will float.
  const debris = [];
  const mk = (geo, col) => { const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, metalness: 0.3, roughness: 0.7 })); group.add(m); return m; };
  const items = [
    mk(new THREE.BoxGeometry(0.4, 0.3, 0.4), 0x8a6a3a), mk(new THREE.BoxGeometry(0.3, 0.3, 0.3), 0x6a7a8a),
    mk(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 12), 0xcfd6de), mk(new THREE.BoxGeometry(0.28, 0.02, 0.36), 0xf0e8d0),
    mk(new THREE.DodecahedronGeometry(0.12, 0), 0x9a9a9a), mk(new THREE.TorusGeometry(0.1, 0.04, 6, 12), 0xE4BC63),
  ];
  items.forEach((m, i) => {
    const a = (i / items.length) * Math.PI * 2, r = 1.0 + Math.random() * 0.6;
    const home = new THREE.Vector3(Math.cos(a) * r, 0.15 + Math.random() * 0.1, Math.sin(a) * r);
    m.position.copy(home);
    debris.push({ m, home, vel: new THREE.Vector3(), spin: new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2) });
    obstacles.push({ x: SPOT.x + home.x, z: SPOT.z + home.z, r: 0.3 });
  });

  let t = 0, zg = 0, timer = 45, pressT = 0;
  const trigger = () => { if (zg <= 0) { zg = 12; liveRef.current.zeroGravity = true; pressT = 0.2; } };
  liveRef.current.triggerZeroG = trigger;
  return {
    update(dt) {
      t += dt; timer -= dt;
      if (timer <= 0) { trigger(); timer = 80 + Math.random() * 60; }
      pressT = Math.max(0, pressT - dt);
      button.position.y = 1.12 - (pressT > 0 ? 0.06 : 0);
      button.material.emissiveIntensity = 0.5 + 0.4 * Math.abs(Math.sin(t * (zg > 0 ? 12 : 2)));
      const active = zg > 0;
      if (active) { zg -= dt; if (zg <= 0) liveRef.current.zeroGravity = false; }
      debris.forEach((d) => {
        if (active) {
          d.vel.y += dt * 0.35; // buoyant drift up
          d.vel.x += (Math.random() - 0.5) * dt * 0.2; d.vel.z += (Math.random() - 0.5) * dt * 0.2;
          d.m.position.addScaledVector(d.vel, dt);
          d.m.rotation.x += d.spin.x * dt; d.m.rotation.y += d.spin.y * dt; d.m.rotation.z += d.spin.z * dt;
          if (d.m.position.y > 3.2) d.vel.y = Math.min(d.vel.y, 0); // gently cap at ceiling
        } else {
          // settle back home
          d.vel.multiplyScalar(0.9);
          d.m.position.lerp(d.home, Math.min(1, dt * 1.2));
          d.m.rotation.x *= (1 - dt); d.m.rotation.z *= (1 - dt);
        }
      });
    },
    dispose() {
      liveRef.current.zeroGravity = false;
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
