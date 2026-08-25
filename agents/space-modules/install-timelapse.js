// ── Module 30 · Installation Time-Lapse ────────────────────────────────────
//
// When a Heavy Guard deal closes (fired periodically here as a simulated
// event, or via liveRef.triggerInstall()), a swarm of micro-drones streaks in
// and rapidly assembles a glowing camera + cable network around a truck
// hologram over ~3 seconds — a build-out time-lapse. Then it dissolves and
// resets, ready for the next close.
export function createInstallTimelapse(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles } = ctx;
  const SPOT = { x: -2, z: -25 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.6 });

  const pad = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.1, 0.1, 6), new THREE.MeshStandardMaterial({ color: 0x10141c, metalness: 0.6, roughness: 0.4 }));
  pad.position.y = 0.05; group.add(pad);
  const padRing = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.03, 8, 48), new THREE.MeshBasicMaterial({ color: 0x6fd3f0, toneMapped: false }));
  padRing.rotation.x = Math.PI / 2; padRing.position.y = 0.12; group.add(padRing);

  // Truck hologram (wireframe).
  const truck = new THREE.Group(); truck.position.y = 0.9; group.add(truck);
  const holoMat = new THREE.MeshBasicMaterial({ color: 0x6fd3f0, wireframe: true, transparent: true, opacity: 0.4, toneMapped: false });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.7, 1.1), holoMat); body.position.y = 0.4; truck.add(body);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 1.0), holoMat); cab.position.set(-1.1, 0.35, 0); truck.add(cab);

  // Camera+cable nodes that "build" onto the truck. Hidden until the timelapse.
  const NODE = [[1.1, 0.85, 0.5], [1.1, 0.85, -0.5], [-1.1, 0.85, 0.5], [-1.1, 0.85, -0.5], [0, 0.95, 0.6], [0, 0.95, -0.6]];
  const nodes = NODE.map((p) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), new THREE.MeshBasicMaterial({ color: 0x3fd79a, toneMapped: false }));
    m.position.set(p[0], p[1], p[2]); m.scale.setScalar(0); truck.add(m); return m;
  });
  // Cable lines between nodes (built progressively).
  const cablePts = []; for (let i = 0; i < nodes.length; i++) { const a = NODE[i], b = NODE[(i + 1) % nodes.length]; cablePts.push(a[0], a[1], a[2], b[0], b[1], b[2]); }
  const cableGeo = new THREE.BufferGeometry(); cableGeo.setAttribute("position", new THREE.Float32BufferAttribute(cablePts, 3));
  const cables = new THREE.LineSegments(cableGeo, new THREE.LineBasicMaterial({ color: 0x3fd79a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
  truck.add(cables);

  // Micro-drone swarm.
  const SW = 8; const drones = [];
  for (let i = 0; i < SW; i++) {
    const d = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), new THREE.MeshBasicMaterial({ color: 0x8fffcf, toneMapped: false }));
    d.visible = false; group.add(d); drones.push(d);
  }
  const sign = helpers.buildNeonSign("INSTALL TIME-LAPSE", 0x6fd3f0, 2.5, 0.42); sign.position.set(0, 3.2, 0); group.add(sign);

  let t = 0, phase = 0, timer = 10; // phase 0 idle, else 0..1 build progress driver
  const trigger = () => { if (phase === 0) { phase = 0.0001; } };
  liveRef.current.triggerInstall = trigger;

  return {
    update(dt) {
      t += dt;
      truck.rotation.y += dt * 0.3;
      padRing.material.color.setHSL(0.52, 0.7, 0.45 + 0.12 * Math.sin(t * 2));

      if (phase === 0) {
        timer -= dt;
        if (timer <= 0) { phase = 0.0001; timer = 16 + Math.random() * 10; }
        nodes.forEach((n) => n.scale.setScalar(Math.max(0, n.scale.x - dt * 3)));
        cables.material.opacity = Math.max(0, cables.material.opacity - dt);
        drones.forEach((d) => (d.visible = false));
        return;
      }
      // Build over ~3s.
      phase = Math.min(1, phase + dt / 3);
      const built = Math.floor(phase * nodes.length);
      nodes.forEach((n, i) => { const target = i < built ? 1 : 0; n.scale.setScalar(THREE.MathUtils.lerp(n.scale.x, target, Math.min(1, dt * 8))); });
      cables.material.opacity = Math.min(0.8, phase * 1.2);
      // Drones swarm toward the next unbuilt node.
      drones.forEach((d, i) => {
        d.visible = true;
        const ni = (built + i) % nodes.length;
        const target = nodes[ni].position;
        const a = t * 3 + i, orbit = 0.5 + 0.3 * Math.sin(t * 4 + i);
        d.position.set(target.x + Math.cos(a) * orbit, target.y + 0.9 + Math.sin(t * 5 + i) * 0.2, target.z + Math.sin(a) * orbit);
      });
      if (phase >= 1) { phase = 0; }
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
