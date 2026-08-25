// ── Module 26 · The 'Amir Bros' Constellation ──────────────────────────────
//
// A holographic star map of the 60 concrete-pump installations floating over a
// console: each pump is a star node — installed sites glow steady green,
// pending sites blink orange. One InstancedMesh for all 60 nodes (single draw
// call) + additive constellation lines linking neighbours.
export function createAmirConstellation(ctx) {
  const { THREE, scene, markDynamic, helpers, obstacles } = ctx;
  const SPOT = { x: 20, z: 26 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.0 });

  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 2.6, 8), new THREE.MeshStandardMaterial({ color: 0x141a24, metalness: 0.6, roughness: 0.4 }));
  stalk.position.y = 1.3; group.add(stalk);
  const baseRing = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.03, 8, 40), new THREE.MeshBasicMaterial({ color: 0x3fd79a, toneMapped: false }));
  baseRing.rotation.x = Math.PI / 2; baseRing.position.y = 0.05; group.add(baseRing);

  const N = 60;
  const nodes = [];
  for (let i = 0; i < N; i++) {
    // scatter in a shallow dome above the console
    const a = Math.random() * Math.PI * 2, r = Math.pow(Math.random(), 0.7) * 2.2;
    nodes.push(new THREE.Vector3(Math.cos(a) * r, 3.4 + Math.random() * 1.6, Math.sin(a) * r));
  }
  const inst = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ toneMapped: false }), N);
  const dummy = new THREE.Object3D();
  const installed = [];
  const GREEN = new THREE.Color(0x3fd79a), ORANGE = new THREE.Color(0xff9a2e);
  for (let i = 0; i < N; i++) {
    dummy.position.copy(nodes[i]); dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
    const isDone = i < 44; installed.push(isDone);
    inst.setColorAt(i, isDone ? GREEN : ORANGE);
  }
  inst.instanceMatrix.needsUpdate = true; if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  group.add(inst);

  // constellation lines: each node to its nearest neighbour.
  const lp = [];
  for (let i = 0; i < N; i++) {
    let best = -1, bd = 1e9;
    for (let j = 0; j < N; j++) if (j !== i) { const d = nodes[i].distanceToSquared(nodes[j]); if (d < bd) { bd = d; best = j; } }
    if (best > i) lp.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[best].x, nodes[best].y, nodes[best].z);
  }
  const lgeo = new THREE.BufferGeometry(); lgeo.setAttribute("position", new THREE.Float32BufferAttribute(lp, 3));
  const lines = new THREE.LineSegments(lgeo, new THREE.LineBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending }));
  group.add(lines);
  const sign = helpers.buildNeonSign("AMIR BROS · 60 PUMPS", 0x3fd79a, 2.6, 0.42);
  sign.position.set(0, 5.6, 0); group.add(sign);

  let t = 0;
  const tmp = new THREE.Color();
  return {
    update(dt) {
      t += dt;
      group.rotation.y += dt * 0.1;
      const blink = Math.sin(t * 5) > 0 ? 1 : 0.25;
      let dirty = false;
      for (let i = 0; i < N; i++) {
        if (!installed[i]) { tmp.copy(ORANGE).multiplyScalar(blink); inst.setColorAt(i, tmp); dirty = true; }
      }
      if (dirty && inst.instanceColor) inst.instanceColor.needsUpdate = true;
      lines.material.opacity = 0.14 + 0.08 * Math.abs(Math.sin(t * 1.2));
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
