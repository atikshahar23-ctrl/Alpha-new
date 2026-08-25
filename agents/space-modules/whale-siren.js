// ── Audio-Neural Walls · Sector 3 · Module 14 — The Whale Siren ────────────
//
// A rotating wall beacon that glows intense blue and pulses a sonar "ping"
// ring outward whenever a massive trade is detected — a big single-asset
// move in liveRef.marketRows (or a periodic auto-trigger so the beacon is
// never fully idle).
export function createWhaleSiren(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const SPOT = { x: 38, z: 16 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 2.0, SPOT.z);
  group.rotation.y = -Math.PI / 2;
  scene.add(group); markDynamic(group);

  const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.3, 16), new THREE.MeshStandardMaterial({ color: 0x0e1420, metalness: 0.6, roughness: 0.4 }));
  housing.rotation.x = Math.PI / 2; group.add(housing);
  const beam = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.9, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  beam.rotation.x = -Math.PI / 2; beam.position.z = 0.5; group.add(beam);
  const sign = helpers.buildNeonSign("🐋 WHALE SIREN", 0x2ee6ff, 2.2, 0.4); sign.position.set(0, -0.7, 0); group.add(sign);

  const pings = [];
  for (let i = 0; i < 3; i++) {
    const r = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.16, 32), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    r.position.z = 0.05; group.add(r); pings.push({ mesh: r, life: 0 });
  }

  let t = 0, timer = 10, ping = 0;
  const fire = () => { ping = 1; const r = pings.find((p) => p.life <= 0); if (r) r.life = 1; };
  return {
    update(dt) {
      t += dt;
      housing.rotation.z += dt * 1.4;
      timer -= dt;
      const rows = liveRef.current.marketRows || [];
      const big = rows.some((r) => Math.abs(r.chg || 0) > 7);
      if (timer <= 0 || big) { fire(); timer = 15 + Math.random() * 12; }
      ping = Math.max(0, ping - dt * 1.5);
      beam.material.opacity = 0.1 + ping * 0.25 + 0.04 * Math.sin(t * 4);
      pings.forEach((p) => { if (p.life > 0) { p.life -= dt * 0.7; const s = (1 - p.life) * 3; p.mesh.scale.setScalar(Math.max(0.01, s)); p.mesh.material.opacity = p.life * 0.6; } else p.mesh.material.opacity = 0; });
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
