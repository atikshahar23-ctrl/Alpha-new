// ── Module 10 · Concrete Pump Hologram Array ───────────────────────────────
//
// An interactive 3D blueprint viewer for a massive concrete pump: a slowly
// rotating wireframe pump-truck (cab + outrigger base + articulated boom) with
// the 4 exact camera-mount nodes marked — each pulsing GREEN when "secured" or
// flashing RED when "offline". Node states cycle so the demo shows both.
export function createConcretePumpArray(ctx) {
  const { THREE, scene, markDynamic, helpers, obstacles } = ctx;
  const SPOT = { x: -33, z: -10 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.5 });

  const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.12, 6), new THREE.MeshStandardMaterial({ color: 0x10141c, metalness: 0.6, roughness: 0.4 }));
  pad.position.y = 0.06; group.add(pad);
  const padRing = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.03, 8, 48), new THREE.MeshBasicMaterial({ color: 0x6fd3f0, toneMapped: false }));
  padRing.rotation.x = Math.PI / 2; padRing.position.y = 0.13; group.add(padRing);

  // Blueprint pump-truck (all glowing wireframe cyan).
  const bp = new THREE.Group(); bp.position.y = 1.1; group.add(bp);
  const wf = (geo) => new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x6fd3f0, wireframe: true, transparent: true, opacity: 0.55, toneMapped: false }));
  const chassis = wf(new THREE.BoxGeometry(1.6, 0.3, 0.6)); chassis.position.y = 0.2; bp.add(chassis);
  const cab = wf(new THREE.BoxGeometry(0.5, 0.45, 0.58)); cab.position.set(-0.65, 0.55, 0); bp.add(cab);
  // articulated boom (three segments)
  const seg1 = wf(new THREE.BoxGeometry(1.1, 0.08, 0.12)); seg1.position.set(0.1, 0.9, 0); seg1.rotation.z = 0.5; bp.add(seg1);
  const seg2 = wf(new THREE.BoxGeometry(0.9, 0.07, 0.1)); seg2.position.set(0.75, 1.35, 0); seg2.rotation.z = -0.3; bp.add(seg2);
  const seg3 = wf(new THREE.BoxGeometry(0.7, 0.06, 0.08)); seg3.position.set(1.25, 1.15, 0); seg3.rotation.z = -1.0; bp.add(seg3);
  // outrigger legs
  [-1, 1].forEach((s) => { const leg = wf(new THREE.BoxGeometry(0.08, 0.5, 0.08)); leg.position.set(s * 0.7, 0.0, s * 0.35); bp.add(leg); });

  // 4 camera-mount nodes.
  const NODE_POS = [[-0.65, 0.85, 0.32], [0.6, 0.55, 0.32], [0.6, 0.55, -0.32], [-0.65, 0.55, -0.32]];
  const nodes = NODE_POS.map((p, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), new THREE.MeshBasicMaterial({ color: 0x3fd79a, toneMapped: false }));
    m.position.set(p[0], p[1], p[2]); bp.add(m);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), new THREE.MeshBasicMaterial({ color: 0x3fd79a, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    m.add(halo);
    return { m, halo, offline: i === 2 }; // one starts "offline" for the demo
  });
  const sign = helpers.buildNeonSign("PUMP · 4 CAMS", 0x6fd3f0, 2.1, 0.42);
  sign.position.set(0, 3.0, 0); group.add(sign);

  const GREEN = new THREE.Color(0x3fd79a), RED = new THREE.Color(0xff3b3b);
  let t = 0, cycleT = 0;
  return {
    update(dt) {
      t += dt; cycleT += dt;
      bp.rotation.y += dt * 0.3;
      if (cycleT > 4) { cycleT = 0; nodes[Math.floor(Math.random() * nodes.length)].offline = Math.random() < 0.5; }
      nodes.forEach((nd) => {
        const col = nd.offline ? RED : GREEN;
        const blink = nd.offline ? (Math.sin(t * 8) > 0 ? 1 : 0.25) : 0.6 + 0.4 * Math.sin(t * 2);
        nd.m.material.color.copy(col);
        nd.halo.material.color.copy(col);
        nd.halo.material.opacity = 0.2 + blink * 0.3;
        nd.halo.scale.setScalar(1 + blink * 0.4);
      });
      padRing.material.color.setHSL(0.52, 0.7, 0.45 + 0.12 * Math.sin(t * 2));
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
