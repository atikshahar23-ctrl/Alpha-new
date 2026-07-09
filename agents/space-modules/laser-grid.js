// ── Module 42 · Algorithmic Laser Grid ─────────────────────────────────────
//
// The trading bots rendered as an invisible tactical lattice over the algo
// zone: node beacons wired by dim beams that stay dark until a trade "fires".
// On execution a beam flares bright between two nodes and a floating data-block
// is captured — pulled up into the ledger tower with a bright flash. Fire rate
// scales with live market activity (summed |24h change| across marketRows).
export function createLaserGrid(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles, anchors } = ctx;
  const SPOT = anchors && anchors.algoZone ? anchors.algoZone : { x: -18, z: 16 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 2.4 });

  // Node beacons on a ring.
  const NODES = 8;
  const nodes = [];
  for (let i = 0; i < NODES; i++) {
    const a = (i / NODES) * Math.PI * 2, r = 2.2;
    const p = new THREE.Vector3(Math.cos(a) * r, 0.6 + Math.random() * 1.8, Math.sin(a) * r);
    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, toneMapped: false }));
    beacon.position.copy(p); group.add(beacon); nodes.push({ p, beacon });
  }
  // Ledger tower the captured blocks fly into.
  const tower = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.2, 0.5), new THREE.MeshStandardMaterial({ color: 0x0e1a2a, metalness: 0.7, roughness: 0.3, emissive: 0x0a3a5a, emissiveIntensity: 0.4 }));
  tower.position.set(0, 1.6, 0); group.add(tower);
  const sign = helpers.buildNeonSign("ALGO LASER GRID", 0x2ee6ff, 2.2, 0.42); sign.position.set(0, 3.6, 0); group.add(sign);

  // A pool of laser beams (reused). Each is a thin cylinder we reposition.
  const POOL = 5;
  const up = new THREE.Vector3(0, 1, 0), d = new THREE.Vector3();
  const beams = [];
  for (let i = 0; i < POOL; i++) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 6), new THREE.MeshBasicMaterial({ color: 0x39ff9e, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false }));
    group.add(b); beams.push({ mesh: b, life: 0 });
  }
  // Captured data blocks flying to the tower.
  const blocks = [];
  for (let i = 0; i < POOL; i++) {
    const bl = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), new THREE.MeshBasicMaterial({ color: 0x39ff9e, transparent: true, opacity: 0, wireframe: true, toneMapped: false }));
    group.add(bl); blocks.push({ mesh: bl, life: 0, from: new THREE.Vector3() });
  }

  const fire = () => {
    const beam = beams.find((b) => b.life <= 0); const blk = blocks.find((b) => b.life <= 0);
    if (!beam) return;
    const a = nodes[(Math.random() * NODES) | 0], b = nodes[(Math.random() * NODES) | 0];
    if (a === b) return;
    d.copy(b.p).sub(a.p); const len = d.length(); d.normalize();
    beam.mesh.position.copy(a.p).addScaledVector(d, len / 2);
    beam.mesh.quaternion.setFromUnitVectors(up, d); beam.mesh.scale.set(1, len, 1);
    beam.life = 0.5; a.beacon.scale.setScalar(1.8); b.beacon.scale.setScalar(1.8);
    if (blk) { blk.from.copy(b.p); blk.life = 1; }
  };

  let t = 0, timer = 0;
  return {
    update(dt) {
      t += dt;
      const rows = liveRef.current.marketRows;
      let vol = 0; if (rows && rows.length) rows.forEach((r) => { vol += Math.abs(r.chg || 0); });
      const rate = 0.6 + Math.min(4, vol * 0.12); // trades/sec
      timer -= dt; if (timer <= 0) { fire(); timer = 1 / rate; }
      nodes.forEach((n, i) => { n.beacon.scale.lerp(new THREE.Vector3(1, 1, 1), Math.min(1, dt * 4)); n.beacon.material.opacity = 0.6 + 0.3 * Math.sin(t * 2 + i); });
      beams.forEach((b) => { if (b.life > 0) { b.life -= dt; b.mesh.material.opacity = Math.min(1, b.life * 2) * (0.6 + 0.4 * Math.sin(t * 40)); } else b.mesh.material.opacity = 0; });
      blocks.forEach((bl) => {
        if (bl.life > 0) {
          bl.life -= dt * 1.3;
          const k = 1 - Math.max(0, bl.life);
          bl.mesh.position.lerpVectors(bl.from, new THREE.Vector3(0, 1.6 + (1 - bl.life) * 0.8, 0), k);
          bl.mesh.material.opacity = Math.sin(Math.min(1, bl.life) * Math.PI) * 0.9;
          bl.mesh.rotation.x += dt * 5; bl.mesh.rotation.y += dt * 6;
        } else bl.mesh.material.opacity = 0;
      });
      tower.material.emissiveIntensity = 0.4 + 0.3 * Math.abs(Math.sin(t * 3));
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
