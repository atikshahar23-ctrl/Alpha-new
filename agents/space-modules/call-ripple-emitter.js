// ── Audio-Neural Walls · Sector 4 · Module 19 — 'Me' App Ripple Emitter ────
//
// A floating node near the crew hologram cluster that shoots an expanding
// 3D ripple ring out across the floor whenever an incoming call starts —
// detected as talkTarget transitioning from empty to set, or the phone
// hologram opening (liveRef.phoneOpen), whichever fires first.
export function createCallRippleEmitter(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const SPOT = { x: -24, z: 1 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 1.1, SPOT.z);
  scene.add(group); markDynamic(group);

  const node = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), new THREE.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, toneMapped: false }));
  group.add(node);
  const RINGS = 4;
  const ripples = [];
  for (let i = 0; i < RINGS; i++) {
    const r = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.22, 40), new THREE.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    r.rotation.x = -Math.PI / 2; r.position.y = -1.0; group.add(r); ripples.push({ mesh: r, life: 0 });
  }
  const sign = helpers.buildNeonSign("CALL RIPPLE NODE", 0x8fd0ff, 1.8, 0.34); sign.position.set(0, 0.6, 0); group.add(sign);

  let t = 0, prevActive = false;
  const fire = () => { ripples.forEach((r, i) => { r.life = 1; r.mesh.userData.delay = i * 0.18; }); };
  return {
    update(dt) {
      t += dt;
      node.rotation.y += dt * 1.5;
      const active = !!liveRef.current.talkTarget || !!liveRef.current.phoneOpen;
      if (active && !prevActive) fire();
      prevActive = active;
      ripples.forEach((r) => {
        if (r.life > 0) {
          const delay = r.mesh.userData.delay || 0;
          const eff = Math.max(0, r.life - delay);
          if (eff > 0) { const s = (1 - eff) * 26; r.mesh.scale.setScalar(Math.max(0.01, s)); r.mesh.material.opacity = eff * 0.45; }
          r.life -= dt * 0.55;
        } else r.mesh.material.opacity = 0;
      });
      node.material.opacity = active ? 0.95 : 0.6 + 0.2 * Math.sin(t * 2);
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
