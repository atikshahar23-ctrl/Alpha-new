// ── Module 40 · Algorithmic Ghost Racing ───────────────────────────────────
//
// A translucent ghost car laps a glowing oval circuit; its lap speed is driven
// by the real-time activity of the trading bots — the summed absolute 24h change
// across liveRef.marketRows stands in for transaction volume, so a busy market
// sends the ghost screaming round the track and a flat one leaves it cruising.
export function createGhostRacer(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const SPOT = { x: 0, z: -30 };
  const RX = 7, RZ = 4;
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0.05, SPOT.z);
  scene.add(group); markDynamic(group);

  // Oval track curve.
  const pts = [];
  for (let i = 0; i <= 64; i++) { const a = (i / 64) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * RX, 0, Math.sin(a) * RZ)); }
  const curve = new THREE.CatmullRomCurve3(pts, true);
  const track = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.12, 8, true), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, toneMapped: false }));
  group.add(track);
  const inner = track.clone(); inner.scale.set(0.82, 1, 0.72); inner.material = track.material.clone(); inner.material.opacity = 0.2; group.add(inner);
  const sign = helpers.buildNeonSign("ALGORITHMIC GHOST RACE", 0xff5ad0, 3.0, 0.5); sign.position.set(0, 3.2, 0); group.add(sign);

  // Build one ghostly car (chassis + cabin) — reused for both racer + ghost.
  const makeCar = (col, op) => {
    const c = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false });
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.44), mat); b.position.y = 0.24; c.add(b);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.2, 0.4), mat); cab.position.set(-0.05, 0.42, 0); c.add(cab);
    const wire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.92, 0.24, 0.46)), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: Math.min(1, op + 0.3), toneMapped: false })); wire.position.y = 0.24; c.add(wire);
    group.add(c); return c;
  };
  const you = makeCar(0x39ff9e, 0.7);   // your car — solid green
  const ghost = makeCar(0xff5ad0, 0.32); // the ghost — faint magenta

  const p1 = new THREE.Vector3(), p2 = new THREE.Vector3(), tn = new THREE.Vector3();
  const place = (car, u, prev) => {
    curve.getPointAt(u % 1, p1); car.position.copy(p1);
    curve.getPointAt((u + 0.01) % 1, p2); car.rotation.y = Math.atan2(p2.x - p1.x, p2.z - p1.z);
  };
  let uYou = 0, uGhost = 0.06, t = 0;
  return {
    update(dt) {
      t += dt;
      const rows = liveRef.current.marketRows;
      let vol = 0; if (rows && rows.length) rows.forEach((r) => { vol += Math.abs(r.chg || 0); });
      const ghostSpd = 0.05 + Math.min(0.25, vol * 0.006); // faster when the bots are busy
      const youSpd = 0.09 + 0.02 * Math.sin(t * 0.5);       // your steady pace
      uYou = (uYou + youSpd * dt) % 1;
      uGhost = (uGhost + ghostSpd * dt) % 1;
      place(you, uYou); place(ghost, uGhost);
      ghost.children.forEach((m) => { if (m.material) m.material.opacity = (m.type === "LineSegments" ? 0.5 : 0.28) + 0.12 * Math.sin(t * 6); });
      track.material.opacity = 0.35 + 0.12 * Math.sin(t * 2);
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
