// ── Audio-Neural Walls · Sector 2 · Module 10 — Blind-Spot Alarms ──────────
//
// Red emergency strobes mounted high on the north wall that flash briefly
// when a simulated truck enters a "blind spot" — a periodic random event,
// occasionally chained into a double-flash for urgency, syncing loosely with
// the deck's redAlert state if one is already in progress elsewhere.
export function createBlindspotAlarms(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const SPOT = { x: 30, z: -32 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 2.6, SPOT.z);
  scene.add(group); markDynamic(group);

  const strobes = [-0.5, 0, 0.5].map((sx) => {
    const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.14, 12), new THREE.MeshStandardMaterial({ color: 0x1a1010, metalness: 0.5, roughness: 0.5 }));
    housing.rotation.x = Math.PI / 2; housing.position.x = sx; group.add(housing);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), new THREE.MeshBasicMaterial({ color: 0xff2a2a, transparent: true, opacity: 0.2, toneMapped: false }));
    bulb.position.set(sx, 0, 0.08); group.add(bulb);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xff2a2a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.setScalar(0.7); glow.position.copy(bulb.position); group.add(glow);
    return { bulb, glow };
  });
  const sign = helpers.buildNeonSign("BLIND-SPOT WATCH", 0xff5555, 2.2, 0.4); sign.position.set(0, 0.5, 0); group.add(sign);

  let t = 0, alarmT = 0, alarmActive = 0, timer = 8;
  return {
    update(dt) {
      t += dt;
      timer -= dt;
      if (timer <= 0 || liveRef.current.redAlert) { alarmActive = 0.8; alarmT = 0; timer = 12 + Math.random() * 14; }
      if (alarmActive > 0) {
        alarmActive -= dt;
        alarmT += dt;
        const on = (Math.floor(alarmT * 6) % 2) === 0;
        strobes.forEach((s) => { s.bulb.material.opacity = on ? 0.95 : 0.15; s.glow.material.opacity = on ? 0.55 : 0; });
      } else {
        strobes.forEach((s) => { s.bulb.material.opacity = 0.15 + 0.05 * Math.sin(t * 2); s.glow.material.opacity = 0; });
      }
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
