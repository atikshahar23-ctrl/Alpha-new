// ── Audio-Neural Walls · Sector 6 · Module 30 — The "Alpha" Neural Web ─────
//
// A glowing web of neuron nodes + synapse lines spanning the ceiling above
// the workshop cluster (M26-29). Idle, it pulses slowly on its own — no
// direct "AI just generated a response" event is exposed to space-modules,
// so as an honest proxy it also fires a bright traveling pulse whenever
// liveRef.talkTarget or liveRef.phoneOpen goes from empty/false to
// set/true (an agent/voice interaction starting), the same rising-edge
// pattern already used by call-ripple-emitter.js.
export function createAlphaNeuralWeb(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const SPOT = { x: 28, z: -19 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 3.6, SPOT.z);
  scene.add(group); markDynamic(group);

  const NODE_COUNT = 22;
  const nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const x = (Math.random() - 0.5) * 7.4;
    const z = (Math.random() - 0.5) * 2.4;
    const y = Math.random() * 0.5;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), new THREE.MeshBasicMaterial({ color: 0x9f6cff, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, toneMapped: false }));
    mesh.position.set(x, y, z); group.add(mesh);
    nodes.push({ mesh, pos: new THREE.Vector3(x, y, z), phase: Math.random() * 6 });
  }
  // Connect each node to its 2 nearest neighbors → sparse synapse mesh.
  const edges = [];
  nodes.forEach((n, i) => {
    const dists = nodes.map((o, j) => ({ j, d: i === j ? Infinity : n.pos.distanceTo(o.pos) })).sort((a, b) => a.d - b.d);
    for (let k = 0; k < 2; k++) {
      const j = dists[k].j;
      if (edges.some((e) => (e.a === i && e.b === j) || (e.a === j && e.b === i))) continue;
      edges.push({ a: i, b: j });
    }
  });
  const linePositions = new Float32Array(edges.length * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({ color: 0x7a4fd6, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, toneMapped: false });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  group.add(lines);
  edges.forEach((e, i) => {
    const a = nodes[e.a].pos, b = nodes[e.b].pos;
    linePositions.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
  });
  lineGeo.attributes.position.needsUpdate = true;

  const PULSE_MAX = 3;
  const pulses = [];
  for (let i = 0; i < PULSE_MAX; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xd6b8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, toneMapped: false }));
    group.add(p);
    pulses.push({ mesh: p, edge: null, u: 0, active: false });
  }
  const sign = helpers.buildNeonSign("ALPHA · NEURAL WEB", 0xb98cff, 2.4, 0.4); sign.position.set(0, -0.55, 0); group.add(sign);

  const spawnPulse = () => {
    const free = pulses.find((p) => !p.active);
    if (!free) return;
    free.edge = edges[Math.floor(Math.random() * edges.length)];
    free.u = 0; free.active = true;
  };

  let t = 0, prevActive = false, ambientT = 2;
  return {
    update(dt) {
      t += dt;
      nodes.forEach((n) => { n.mesh.material.opacity = 0.5 + 0.35 * Math.abs(Math.sin(t * 1.4 + n.phase)); });

      const active = !!liveRef.current.talkTarget || !!liveRef.current.phoneOpen;
      if (active && !prevActive) { spawnPulse(); spawnPulse(); }
      prevActive = active;

      ambientT -= dt;
      if (ambientT <= 0) { spawnPulse(); ambientT = 4 + Math.random() * 4; }

      pulses.forEach((p) => {
        if (!p.active) return;
        const a = nodes[p.edge.a].pos, b = nodes[p.edge.b].pos;
        p.mesh.position.lerpVectors(a, b, p.u);
        p.mesh.material.opacity = 0.9 * Math.sin(Math.PI * p.u);
        p.u += dt * 0.9;
        if (p.u >= 1) p.active = false;
      });
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
