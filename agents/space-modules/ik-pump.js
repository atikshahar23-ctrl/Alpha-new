// ── Module 27 · Concrete Pump IK Arm ───────────────────────────────────────
//
// A 3D concrete-pump truck with an articulated 3-segment boom you can drive
// with the gamepad (left stick = base yaw + shoulder pitch, right stick =
// elbow + wrist) to sweep the nozzle around and test camera blind spots. A
// green nozzle beam traces where it points. Simple forward-kinematic joints
// (an "IK feel" without a solver — reliable and cheap).
export function createIkPump(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles } = ctx;
  const SPOT = { x: 8, z: -25 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.6 });

  const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.8, 0.12, 8), new THREE.MeshStandardMaterial({ color: 0x14171e, metalness: 0.6, roughness: 0.4 }));
  pad.position.y = 0.06; group.add(pad);
  const padRing = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.03, 8, 48), new THREE.MeshBasicMaterial({ color: 0xE4BC63, toneMapped: false }));
  padRing.rotation.x = Math.PI / 2; padRing.position.y = 0.13; group.add(padRing);

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a3242, metalness: 0.5, roughness: 0.5 });
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 0.9), bodyMat); chassis.position.y = 0.5; group.add(chassis);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.85), bodyMat); cab.position.set(-0.85, 0.95, 0); group.add(cab);
  [[-0.7, 0.45], [0.7, 0.45], [-0.7, -0.45], [0.7, -0.45]].forEach(([x, z]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 14), new THREE.MeshStandardMaterial({ color: 0x0e1116, metalness: 0.4, roughness: 0.6 })); w.rotation.x = Math.PI / 2; w.position.set(x, 0.28, z); group.add(w); });

  // Articulated boom.
  const armMat = new THREE.MeshStandardMaterial({ color: 0xE4BC63, metalness: 0.6, roughness: 0.35, emissive: 0x2a1e05, emissiveIntensity: 0.3 });
  const base = new THREE.Group(); base.position.set(0.4, 0.8, 0); group.add(base);
  const seg = (len, parent) => { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.14, 0.16), armMat); m.position.x = len / 2; g.add(m); parent.add(g); return g; };
  const j1 = seg(1.1, base); j1.position.y = 0.2; j1.rotation.z = 0.9;
  const j2 = seg(0.95, j1); j2.position.x = 1.1; j2.rotation.z = -0.7;
  const j3 = seg(0.7, j2); j3.position.x = 0.95; j3.rotation.z = -0.6;
  const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 10), new THREE.MeshBasicMaterial({ color: 0x3fd79a, toneMapped: false }));
  nozzle.position.set(0.7, 0, 0); nozzle.rotation.z = -Math.PI / 2; j3.add(nozzle);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 3, 6), new THREE.MeshBasicMaterial({ color: 0x3fd79a, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false }));
  beam.position.set(2.2, 0, 0); beam.rotation.z = -Math.PI / 2; j3.add(beam);
  const sign = helpers.buildNeonSign("IK PUMP · G-PAD", 0xE4BC63, 2.2, 0.42); sign.position.set(0, 3.2, 0); group.add(sign);

  let t = 0;
  return {
    update(dt) {
      t += dt;
      const gp = (typeof navigator !== "undefined" && navigator.getGamepads) ? navigator.getGamepads()[0] : null;
      const ax = (i) => { const v = gp ? (gp.axes[i] || 0) : 0; return Math.abs(v) < 0.12 ? 0 : v; };
      if (gp) {
        base.rotation.y += ax(0) * dt * 1.2;
        j1.rotation.z = THREE.MathUtils.clamp(j1.rotation.z - ax(1) * dt * 1.0, 0.2, 1.4);
        j2.rotation.z = THREE.MathUtils.clamp(j2.rotation.z + ax(2) * dt * 1.2, -1.6, 0.2);
        j3.rotation.z = THREE.MathUtils.clamp(j3.rotation.z + ax(3) * dt * 1.2, -1.4, 0.4);
      } else {
        // Idle auto-sweep so the demo is alive without a controller.
        base.rotation.y = Math.sin(t * 0.3) * 0.8;
        j2.rotation.z = -0.7 + Math.sin(t * 0.5) * 0.4;
      }
      padRing.material.color.setHSL(0.12, 0.7, 0.45 + 0.12 * Math.sin(t * 2));
      beam.material.opacity = 0.3 + 0.2 * Math.abs(Math.sin(t * 4));
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
