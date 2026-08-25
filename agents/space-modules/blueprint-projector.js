// ── Audio-Neural Walls · Sector 2 · Module 9 — Floating Blueprint Projector ─
//
// A wall-mounted lens that projects a rotating wireframe 3D concrete pump
// truck out into the middle of the room — a small lens fixture on the wall,
// the actual hologram floating well clear of it so it reads as a beamed
// projection rather than a wall decal.
export function createBlueprintProjector(ctx) {
  const { THREE, scene, markDynamic, helpers } = ctx;
  const SPOT = { x: 15, z: -32 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);

  const lens = new THREE.Group(); lens.position.set(0, 2.0, 0); group.add(lens);
  const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.3, 16), new THREE.MeshStandardMaterial({ color: 0x161a20, metalness: 0.6, roughness: 0.4 }));
  housing.rotation.x = Math.PI / 2; lens.add(housing);
  const iris = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.13, 20), new THREE.MeshBasicMaterial({ color: 0xE4BC63, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, toneMapped: false }));
  iris.position.z = 0.16; lens.add(iris);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.9, 3.0, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xE4BC63, transparent: true, opacity: 0.05, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  beam.rotation.x = -Math.PI / 2; beam.position.set(0, 0.9, 1.6); lens.add(beam);

  // Wireframe concrete-pump truck (simplified): chassis + boom arms + base.
  const pump = new THREE.Group(); pump.position.set(0, 1.5, 3.2); group.add(pump);
  const wireMat = new THREE.MeshBasicMaterial({ color: 0xE4BC63, wireframe: true, transparent: true, opacity: 0.7, toneMapped: false });
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 0.5), wireMat); chassis.position.y = 0.2; pump.add(chassis);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.45), wireMat); cab.position.set(0.55, 0.35, 0); pump.add(cab);
  const boomA = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8), wireMat); boomA.position.set(-0.2, 0.7, 0); boomA.rotation.z = 0.5; pump.add(boomA);
  const boomB = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 8), wireMat); boomB.position.set(-0.5, 1.15, 0); boomB.rotation.z = -0.6; pump.add(boomB);
  const wheels = [[-0.4, -0.55], [0.4, -0.55], [-0.4, 0.55], [0.4, 0.55]].map(([wx, wz]) => { const w = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 6, 14), wireMat); w.rotation.y = Math.PI / 2; w.position.set(wx, 0.02, wz); pump.add(w); return w; });
  const sign = helpers.buildNeonSign("BLUEPRINT PROJECTOR", 0xE4BC63, 2.4, 0.4); sign.position.set(0, 1.2, 0); group.add(sign);

  let t = 0;
  return {
    update(dt) {
      t += dt;
      pump.rotation.y += dt * 0.5;
      iris.rotation.z += dt * 1.2; iris.material.opacity = 0.6 + 0.25 * Math.sin(t * 3);
      beam.material.opacity = 0.04 + 0.02 * Math.sin(t * 4);
      pump.position.y = 1.5 + Math.sin(t * 0.8) * 0.06;
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
