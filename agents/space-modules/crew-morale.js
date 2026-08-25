// ── Module 35 · Crew Morale Idle Animations ────────────────────────────────
//
// Ambient "the crew is busy" life around the agent pods: a ring of floating
// gold crypto coins the CFO (Reuven, finance pod) inspects, and crackling data
// conduits Michal (cs pod) is patching. Self-contained props at the pods' known
// world spots — reads as agents at work without touching the NPC AI.
export function createCrewMorale(ctx) {
  const { THREE, scene, markDynamic } = ctx;
  const group = new THREE.Group();
  scene.add(group); markDynamic(group);

  // Floating crypto coins above the finance pod (~10.5, 11.9).
  const FIN = new THREE.Vector3(10.5, 1.6, 11.9);
  const coins = [];
  const coinGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.03, 16);
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(coinGeo, new THREE.MeshStandardMaterial({ color: 0xE4BC63, metalness: 0.9, roughness: 0.22, emissive: 0x3a2a06, emissiveIntensity: 0.5 }));
    group.add(m); coins.push({ m, a: (i / 6) * Math.PI * 2, r: 0.5 + (i % 2) * 0.25, h: (i % 3) * 0.18 });
  }
  const finGlow = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xE4BC63, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }));
  finGlow.position.copy(FIN); finGlow.scale.setScalar(2.2); group.add(finGlow);

  // Data conduits Michal is patching, above the cs pod (~14.8, 5.6).
  const CS = new THREE.Vector3(14.8, 1.4, 5.6);
  const conduits = [];
  for (let i = 0; i < 4; i++) {
    const pts = [];
    for (let k = 0; k < 8; k++) pts.push(new THREE.Vector3(CS.x + (Math.random() - 0.5) * 1.2, CS.y + k * 0.16, CS.z + (Math.random() - 0.5) * 1.2));
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }));
    group.add(line); conduits.push({ line, pts, phase: Math.random() * 10 });
  }
  const spark = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  spark.scale.setScalar(0.5); group.add(spark);

  let t = 0;
  return {
    update(dt) {
      t += dt;
      coins.forEach((c) => {
        const a = c.a + t * 0.6;
        c.m.position.set(FIN.x + Math.cos(a) * c.r, FIN.y + c.h + Math.sin(t * 1.5 + c.a) * 0.12, FIN.z + Math.sin(a) * c.r);
        c.m.rotation.y += dt * 3; c.m.rotation.x = Math.PI / 2 + Math.sin(t + c.a) * 0.3;
      });
      finGlow.material.opacity = 0.2 + 0.08 * Math.sin(t * 2);
      // conduit crackle — jitter the mid points + a travelling spark.
      conduits.forEach((cd, ci) => {
        const arr = cd.line.geometry.attributes.position.array;
        for (let k = 1; k < cd.pts.length - 1; k++) { arr[k * 3] = cd.pts[k].x + Math.sin(t * 12 + k + cd.phase) * 0.04; arr[k * 3 + 2] = cd.pts[k].z + Math.cos(t * 11 + k) * 0.04; }
        cd.line.geometry.attributes.position.needsUpdate = true;
        cd.line.material.opacity = 0.35 + 0.3 * Math.abs(Math.sin(t * 3 + ci));
      });
      const sc = conduits[Math.floor(t) % conduits.length];
      const sk = Math.floor((t % 1) * sc.pts.length);
      spark.position.copy(sc.pts[Math.min(sk, sc.pts.length - 1)]);
      spark.material.opacity = 0.6 + 0.4 * Math.abs(Math.sin(t * 20));
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
    },
  };
}
