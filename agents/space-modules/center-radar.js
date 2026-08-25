// ── Module 51 · Real-World Center District Radar ───────────────────────────
//
// A cyberpunk holo-table: a 3D wireframe map of the Bat Yam / Rishon LeZion
// district with a sweeping radar line and Heavy Guard truck blips crawling the
// road grid between depots. Trailing comet tails mark heading; a scan ring
// pulses out from centre. Pure procedural street lattice — no map tiles fetched.
export function createCenterRadar(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles } = ctx;
  const SPOT = { x: 28, z: 14 };
  const S = 3.4;
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 2.0 });

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(S * 0.5, S * 0.6, 0.9, 8), new THREE.MeshStandardMaterial({ color: 0x0a1420, metalness: 0.7, roughness: 0.35, emissive: 0x06131f, emissiveIntensity: 0.3 }));
  pedestal.position.y = 0.45; group.add(pedestal);
  const table = new THREE.Group(); table.position.y = 0.95; group.add(table);
  const base = new THREE.Mesh(new THREE.CircleGeometry(S, 48), new THREE.MeshBasicMaterial({ color: 0x02141f, transparent: true, opacity: 0.55, side: THREE.DoubleSide, toneMapped: false }));
  base.rotation.x = -Math.PI / 2; table.add(base);

  // Street lattice — a jittered grid ring-clipped to a disc.
  const CYAN = 0x2ee6ff;
  const segs = [];
  const GRID = 9;
  for (let i = 0; i <= GRID; i++) {
    const o = (i / GRID - 0.5) * 2 * S;
    segs.push([-S, o, S, o]); segs.push([o, -S, o, S]);
  }
  const verts = [];
  segs.forEach(([x1, z1, x2, z2]) => { if (Math.hypot(x1, z1) < S && Math.hypot(x2, z2) < S) { verts.push(x1, 0.02, z1, x2, 0.02, z2); } });
  const roadsGeo = new THREE.BufferGeometry(); roadsGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(verts), 3));
  const roads = new THREE.LineSegments(roadsGeo, new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, toneMapped: false }));
  table.add(roads);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(S, 0.03, 8, 64), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, toneMapped: false }));
  rim.rotation.x = Math.PI / 2; table.add(rim);

  // Sweeping radar line.
  const sweep = new THREE.Mesh(new THREE.CircleGeometry(S, 32, 0, Math.PI / 6), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.18, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  sweep.rotation.x = -Math.PI / 2; sweep.position.y = 0.03; table.add(sweep);
  // Scan ring.
  const scan = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.16, 40), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  scan.rotation.x = -Math.PI / 2; scan.position.y = 0.04; table.add(scan);

  // Depot markers + moving truck blips.
  const DEPOTS = [[-1.8, -1.2], [1.6, 1.4], [0.2, -2.2], [2.0, -0.6]]; // Bat Yam / Rishon nodes
  DEPOTS.forEach(([x, z]) => { const d = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), new THREE.MeshBasicMaterial({ color: 0xE4BC63, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, toneMapped: false })); d.position.set(x, 0.08, z); table.add(d); });
  const TRUCKS = 5;
  const trucks = [];
  for (let i = 0; i < TRUCKS; i++) {
    const blip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0x39ff9e, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, toneMapped: false }));
    table.add(blip);
    const trailGeo = new THREE.BufferGeometry(); trailGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(8 * 3), 3));
    const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: 0x39ff9e, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, toneMapped: false }));
    table.add(trail);
    trucks.push({ blip, trail, from: (i) % DEPOTS.length, to: (i + 1) % DEPOTS.length, u: Math.random(), spd: 0.1 + Math.random() * 0.12, hist: [] });
  }
  const sign = helpers.buildNeonSign("DISTRICT RADAR · בת ים / ראשל״צ", CYAN, 3.2, 0.5); sign.position.set(0, 2.6, 0); group.add(sign);

  let t = 0, scanT = 0;
  const p = new THREE.Vector3();
  return {
    update(dt) {
      t += dt;
      sweep.rotation.z -= dt * 1.4;
      rim.material.opacity = 0.45 + 0.2 * Math.sin(t * 2);
      scanT += dt; if (scanT > 2.2) scanT = 0;
      const sf = scanT / 2.2; scan.scale.setScalar(Math.max(0.01, sf * S * 6.2)); scan.material.opacity = (1 - sf) * 0.5;
      // idle radars sync loosely to redAlert (turns hostile red)
      const hostile = liveRef.current.redAlert;
      trucks.forEach((tr) => {
        tr.u += dt * tr.spd; if (tr.u >= 1) { tr.u = 0; tr.from = tr.to; tr.to = (tr.to + 1 + ((Math.random() * 2) | 0)) % DEPOTS.length; }
        const a = DEPOTS[tr.from], b = DEPOTS[tr.to];
        p.set(a[0] + (b[0] - a[0]) * tr.u, 0.08, a[1] + (b[1] - a[1]) * tr.u);
        tr.blip.position.copy(p);
        tr.blip.material.color.setHex(hostile ? 0xff4d4d : 0x39ff9e);
        tr.hist.unshift(p.x, p.y, p.z); if (tr.hist.length > 24) tr.hist.length = 24;
        const arr = tr.trail.geometry.attributes.position.array;
        for (let k = 0; k < 8; k++) { const idx = Math.min(tr.hist.length - 3, k * 3); arr[k * 3] = tr.hist[idx] || p.x; arr[k * 3 + 1] = tr.hist[idx + 1] || p.y; arr[k * 3 + 2] = tr.hist[idx + 2] || p.z; }
        tr.trail.geometry.attributes.position.needsUpdate = true;
        tr.trail.material.color.setHex(hostile ? 0xff4d4d : 0x39ff9e);
      });
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
