// ── Module 29 · The Senior Maintenance Skiff ───────────────────────────────
//
// A reliable veteran maintenance drone that patrols a slow circuit over the
// deck. Every so often it stops at a "flickering" wall panel and fires a blue
// welding laser to fix it — the panel stops flickering and glows steady for a
// while. Quiet, dependable background life.
export function createMaintenanceSkiff(ctx) {
  const { THREE, scene, markDynamic } = ctx;

  const group = new THREE.Group();
  scene.add(group); markDynamic(group);

  // The skiff — a chunky utilitarian drone with a work-light.
  const skiff = new THREE.Group(); group.add(skiff);
  const hull = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.5, 6, 12), new THREE.MeshStandardMaterial({ color: 0x3a4250, metalness: 0.6, roughness: 0.4, emissive: 0x101820, emissiveIntensity: 0.3 }));
  hull.rotation.z = Math.PI / 2; skiff.add(hull);
  const drum = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.06, 8, 24), new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, toneMapped: false }));
  drum.rotation.y = Math.PI / 2; skiff.add(drum);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffd76a, toneMapped: false })); eye.position.x = 0.5; skiff.add(eye);
  const welder = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 6), new THREE.MeshBasicMaterial({ color: 0x66d0ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false }));
  scene.add(welder); markDynamic(welder);
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), new THREE.MeshBasicMaterial({ color: 0xbfeaff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false }));
  scene.add(spark); markDynamic(spark);

  // Patrol path (a lap around the deck perimeter, kept low).
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-26, 2.4, -22), new THREE.Vector3(-30, 2.6, 4), new THREE.Vector3(-20, 2.4, 24),
    new THREE.Vector3(6, 2.6, 28), new THREE.Vector3(28, 2.4, 20), new THREE.Vector3(30, 2.6, -8),
    new THREE.Vector3(20, 2.4, -26), new THREE.Vector3(-4, 2.6, -30),
  ], true, "catmullrom", 0.5);
  // Flicker-panel repair targets on the walls.
  const PANELS = [new THREE.Vector3(-33, 3, 4), new THREE.Vector3(6, 3, 31), new THREE.Vector3(31, 3, -8), new THREE.Vector3(-4, 3, -32)];

  const up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3(), tan = new THREE.Vector3(), pos = new THREE.Vector3();
  let t = 0, prog = 0, weldT = 0, weldTarget = null, weldTimer = 6;
  return {
    update(dt) {
      t += dt;
      prog = (prog + dt * 0.012) % 1;
      path.getPointAt(prog, pos); skiff.position.copy(pos);
      path.getTangentAt(prog, tan); skiff.lookAt(pos.x + tan.x, pos.y + tan.y, pos.z + tan.z);
      drum.rotation.x += dt * 2;
      eye.material.opacity = Math.sin(t * 5) > 0 ? 1 : 0.4;

      weldTimer -= dt;
      if (weldTimer <= 0 && !weldTarget) { weldTarget = PANELS[Math.floor(Math.random() * PANELS.length)]; weldT = 1.4; weldTimer = 9 + Math.random() * 6; }
      if (weldTarget) {
        weldT -= dt;
        dir.copy(weldTarget).sub(skiff.position); const len = dir.length(); dir.normalize();
        welder.position.copy(skiff.position).addScaledVector(dir, len / 2);
        welder.quaternion.setFromUnitVectors(up, dir); welder.scale.set(1, len, 1);
        welder.material.opacity = 0.6 + 0.4 * Math.abs(Math.sin(t * 30));
        spark.position.copy(weldTarget); spark.material.opacity = 0.7 + 0.3 * Math.abs(Math.sin(t * 40)); spark.scale.setScalar(0.8 + 0.5 * Math.random());
        if (weldT <= 0) { weldTarget = null; welder.material.opacity = 0; spark.material.opacity = 0; }
      } else { welder.material.opacity = 0; spark.material.opacity = 0; }
    },
    dispose() {
      scene.remove(group); scene.remove(welder); scene.remove(spark);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
      [welder, spark].forEach((o) => { o.geometry.dispose(); o.material.dispose(); });
    },
  };
}
