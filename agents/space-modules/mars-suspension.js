// ── Module 39 · Off-Road Mars Suspension Track ─────────────────────────────
//
// A Martian terrain patch behind a bay door where a rover drives a loop over
// dunes and rocks. Each of the four wheels independently raycasts the heightfield
// beneath it, so the chassis pitches/rolls from genuine per-wheel suspension —
// the body height is the average of the wheel contacts, its tilt their difference.
export function createMarsSuspension(ctx) {
  const { THREE, scene, markDynamic, helpers, obstacles } = ctx;
  const SPOT = { x: -40, z: -16 };
  const S = 9; // track half-extent
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: S * 0.7 });

  // Height function for the Martian dunes (cheap, analytic — no texture fetch).
  const H = (x, z) => 0.55 * Math.sin(x * 0.6) * Math.cos(z * 0.5) + 0.3 * Math.sin(x * 0.25 + z * 0.4) + 0.18 * Math.cos(x * 1.1 - z * 0.9);

  const seg = 40;
  const terra = new THREE.PlaneGeometry(S * 2, S * 2, seg, seg);
  terra.rotateX(-Math.PI / 2);
  const p = terra.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, H(p.getX(i), p.getZ(i)));
  terra.computeVertexNormals();
  const ground = new THREE.Mesh(terra, new THREE.MeshStandardMaterial({ color: 0xb5502f, roughness: 1.0, metalness: 0.0, flatShading: true }));
  group.add(ground);
  // scattered rocks
  const rockGeo = new THREE.DodecahedronGeometry(0.3, 0);
  const rocks = new THREE.InstancedMesh(rockGeo, new THREE.MeshStandardMaterial({ color: 0x7a3b26, roughness: 1 }), 22);
  const dm = new THREE.Object3D();
  for (let i = 0; i < 22; i++) { const x = (Math.random() - 0.5) * S * 1.8, z = (Math.random() - 0.5) * S * 1.8; dm.position.set(x, H(x, z) + 0.05, z); dm.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3); dm.scale.setScalar(0.4 + Math.random()); dm.updateMatrix(); rocks.setMatrixAt(i, dm.matrix); }
  group.add(rocks);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(S, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff7a4a, transparent: true, opacity: 0.06, side: THREE.BackSide }));
  group.add(dome);
  const sign = helpers.buildNeonSign("MARS SUSPENSION TRACK", 0xff7a4a, 3.0, 0.5); sign.position.set(0, S * 0.7, 0); group.add(sign);

  // Rover — chassis + 4 independent wheels.
  const rover = new THREE.Group(); group.add(rover);
  const chassis = new THREE.Group(); rover.add(chassis);
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.28, 0.8), new THREE.MeshStandardMaterial({ color: 0xd8dde3, metalness: 0.7, roughness: 0.3 })); body.position.y = 0.35; chassis.add(body);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0x9aa4b0 })); mast.position.set(0.4, 0.7, 0); chassis.add(mast);
  const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1d22, roughness: 0.9 });
  const WB = [[0.55, 0.42], [0.55, -0.42], [-0.55, 0.42], [-0.55, -0.42]]; // wheel local offsets
  const wheels = WB.map(([lx, lz]) => { const w = new THREE.Mesh(wheelGeo, wheelMat); w.rotation.x = Math.PI / 2; rover.add(w); return { w, lx, lz }; });

  const up = new THREE.Vector3(0, 1, 0), n = new THREE.Vector3(), ex = new THREE.Vector3(), ez = new THREE.Vector3();
  let t = 0;
  return {
    update(dt) {
      t += dt;
      // drive a lissajous loop across the track
      const cx = Math.sin(t * 0.4) * S * 0.6, cz = Math.cos(t * 0.3) * S * 0.6;
      const heading = Math.atan2(Math.cos(t * 0.4) * 0.4 * S * 0.6, -Math.sin(t * 0.3) * 0.3 * S * 0.6);
      rover.position.set(cx, 0, cz);
      rover.rotation.y = heading;
      const ca = Math.cos(heading), sa = Math.sin(heading);
      // per-wheel ground contact (independent suspension)
      let sumH = 0; const wy = [];
      wheels.forEach((wl) => {
        const wx = cx + wl.lx * ca - wl.lz * sa, wz = cz + wl.lx * sa + wl.lz * ca;
        const h = H(wx, wz) + 0.24; wy.push(h); sumH += h;
        wl.w.position.set(wx - cx, h, wz - cz).applyAxisAngle(up, -heading); // back to rover-local
        wl.w.rotation.z = t * 6; // rolling
      });
      const avg = sumH / 4;
      chassis.position.y = avg - 0.05;
      // pitch from front-back contact diff, roll from left-right diff
      const pitch = ((wy[0] + wy[1]) - (wy[2] + wy[3])) * 0.35;
      const roll = ((wy[0] + wy[2]) - (wy[1] + wy[3])) * 0.35;
      chassis.rotation.z = THREE.MathUtils.clamp(-pitch, -0.5, 0.5);
      chassis.rotation.x = THREE.MathUtils.clamp(roll, -0.5, 0.5);
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
