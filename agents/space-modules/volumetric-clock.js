// ── Audio-Neural Walls · Sector 5 · Module 23 — Volumetric Clock ───────────
//
// The current time shown on the wall as floating, disconnected geometric
// shards that drift apart at rest and snap into aligned digit-strokes only
// while the player is looking straight at the installation (reusing the
// same gaze-detection math as the Neural-Quantum Smart Glass system).
export function createVolumetricClock(ctx) {
  const { THREE, scene, camera, markDynamic, helpers } = ctx;
  const SPOT = new THREE.Vector3(28, 2.0, -31);
  const group = new THREE.Group();
  group.position.copy(SPOT);
  scene.add(group); markDynamic(group);

  const sign = helpers.buildNeonSign("VOLUMETRIC CLOCK", 0xE4BC63, 2.0, 0.36); sign.position.set(0, 0.95, 0); group.add(sign);

  // 4 digit slots (HH MM), each built from 7 small shard segments (7-segment
  // layout) that can be individually toggled on/off per digit and, at rest,
  // drift to a scattered "disconnected" position.
  const DIGIT_SEGS = { 0: [1, 1, 1, 1, 1, 1, 0], 1: [0, 1, 1, 0, 0, 0, 0], 2: [1, 1, 0, 1, 1, 0, 1], 3: [1, 1, 1, 1, 0, 0, 1], 4: [0, 1, 1, 0, 0, 1, 1], 5: [1, 0, 1, 1, 0, 1, 1], 6: [1, 0, 1, 1, 1, 1, 1], 7: [1, 1, 1, 0, 0, 0, 0], 8: [1, 1, 1, 1, 1, 1, 1], 9: [1, 1, 1, 1, 0, 1, 1] };
  const SEG_POS = [[0, 0.34, 0, 0], [0.15, 0.17, Math.PI / 2, 0], [0.15, -0.17, Math.PI / 2, 0], [0, -0.34, 0, 0], [-0.15, -0.17, Math.PI / 2, 0], [-0.15, 0.17, Math.PI / 2, 0], [0, 0, 0, 0]];
  const shardGeo = new THREE.BoxGeometry(0.09, 0.02, 0.02);
  const mat = new THREE.MeshBasicMaterial({ color: 0xE4BC63, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, toneMapped: false });
  const digits = [];
  for (let d = 0; d < 4; d++) {
    const dx = (d - 1.5) * 0.5 + (d >= 2 ? 0.12 : 0);
    const segs = SEG_POS.map(([sx, sy]) => {
      const m = new THREE.Mesh(shardGeo, mat.clone());
      const home = new THREE.Vector3(dx + sx, sy, 0);
      const scatter = home.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 1.0, (Math.random() - 0.5) * 1.2));
      m.position.copy(scatter);
      group.add(m);
      return { m, home, scatter, rotSpeed: (Math.random() - 0.5) * 2 };
    });
    digits.push(segs);
  }

  const gazeDir = new THREE.Vector3(), toGroup = new THREE.Vector3();
  let t = 0, gaze = 0, lastStr = "";
  const setDigits = (str) => {
    for (let d = 0; d < 4; d++) {
      const n = DIGIT_SEGS[str[d]] || [0, 0, 0, 0, 0, 0, 0];
      digits[d].forEach((seg, i) => { seg.on = !!n[i]; });
    }
  };
  return {
    update(dt) {
      t += dt;
      camera.getWorldDirection(gazeDir);
      toGroup.subVectors(SPOT, camera.position).normalize();
      const looking = toGroup.dot(gazeDir) > 0.85 && camera.position.distanceTo(SPOT) < 8;
      gaze += ((looking ? 1 : 0) - gaze) * Math.min(1, dt * 3);

      const now = new Date();
      const str = String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0");
      if (str !== lastStr) { lastStr = str; setDigits(str); }

      digits.forEach((segs) => {
        segs.forEach((seg) => {
          const target = seg.on ? seg.home : seg.scatter;
          seg.m.position.lerp(target, Math.min(1, dt * (gaze > 0.5 ? 3 : 1)));
          seg.m.material.opacity = seg.on ? (0.3 + gaze * 0.65) : 0.15 * gaze;
          if (gaze < 0.9) seg.m.rotation.y += dt * seg.rotSpeed * (1 - gaze);
        });
      });
    },
    dispose() {
      scene.remove(group);
      // All 28 shard meshes share one shardGeo instance — geometry.dispose()
      // is idempotent, so disposing it once per mesh here is harmless.
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
