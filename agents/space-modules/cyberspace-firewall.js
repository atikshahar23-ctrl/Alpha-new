// ── Audio-Neural Walls · Sector 6 · Module 29 — Cyberspace Firewall ────────
//
// A section of the workshop wall covered in glowing red hexagonal shields
// that continuously shatter (scale/fade out, tumble) and rebuild themselves
// (fade back in) on staggered per-cell timers — a self-repairing digital
// barrier, brighter and faster-cycling whenever liveRef.redAlert is active.
export function createCyberspaceFirewall(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const SPOT = { x: 34, z: -19 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 1.6, SPOT.z);
  scene.add(group); markDynamic(group);

  const hexShape = new THREE.Shape();
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const fn = i ? "lineTo" : "moveTo"; hexShape[fn](Math.cos(a) * 0.22, Math.sin(a) * 0.22); }
  const hexGeo = new THREE.ShapeGeometry(hexShape);
  const cells = [];
  const ROWS = 4, COLS = 6;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const x = (c - (COLS - 1) / 2) * 0.4 + (r % 2 ? 0.2 : 0);
    const y = (r - (ROWS - 1) / 2) * 0.36;
    const mesh = new THREE.Mesh(hexGeo, new THREE.MeshBasicMaterial({ color: 0xff2a2a, transparent: true, opacity: 0.4, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    mesh.position.set(x, y, 0); group.add(mesh);
    cells.push({ mesh, phase: Math.random() * 6, cycle: 2.5 + Math.random() * 2 });
  }
  const sign = helpers.buildNeonSign("CYBERSPACE FIREWALL", 0xff2a2a, 2.3, 0.4); sign.position.set(0, ROWS * 0.2, 0); group.add(sign);

  let t = 0;
  return {
    update(dt) {
      t += dt;
      const alert = !!liveRef.current.redAlert;
      cells.forEach((cell) => {
        const cyc = alert ? cell.cycle * 0.4 : cell.cycle;
        const u = ((t + cell.phase) % cyc) / cyc; // 0..1 shatter->rebuild loop
        const shattered = u > 0.5;
        const local = shattered ? (u - 0.5) * 2 : 1 - u * 2; // 0..1 within each half
        cell.mesh.scale.setScalar(shattered ? Math.max(0.05, 1 - local) : local);
        cell.mesh.rotation.z = shattered ? local * 2.4 : (1 - local) * -0.6;
        cell.mesh.material.opacity = (alert ? 0.65 : 0.4) * (shattered ? Math.max(0, 1 - local * 1.3) : local);
      });
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
