// ── Module 25 · The Neural Singularity Core (AI Visualization) ──────────────
//
// A massive translucent "digital brain" — a neural-network mesh of glowing
// nodes and synaptic connections — hangs over the command deck. It's linked to
// the AI's state: while an agent conversation is live (liveRef.talkTarget), the
// brain expands and fires brilliant electrical synapses along its connections;
// idle, it pulses slowly like a heartbeat.
export function createNeuralCore(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const CENTER = new THREE.Vector3(10, 4.0, -6);

  const group = new THREE.Group();
  group.position.copy(CENTER);
  scene.add(group); markDynamic(group);

  // Tether to the ceiling.
  const tether = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 6), new THREE.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: 0.4, toneMapped: false }));
  tether.position.y = 1.4; group.add(tether);

  // Brain nodes — two lobes in an ellipsoid cloud.
  const N = 52;
  const nodes = [];
  for (let i = 0; i < N; i++) {
    const lobe = i < N / 2 ? -0.7 : 0.7;
    const u = Math.random() * Math.PI * 2, v = Math.acos(2 * Math.random() - 1), rr = Math.pow(Math.random(), 0.6);
    nodes.push(new THREE.Vector3(lobe + Math.sin(v) * Math.cos(u) * 1.5 * rr, Math.cos(v) * 1.0 * rr, Math.sin(v) * Math.sin(u) * 1.3 * rr));
  }
  // Node instanced spheres.
  const nodeMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, toneMapped: false }), N);
  const dummy = new THREE.Object3D();
  nodes.forEach((p, i) => { dummy.position.copy(p); dummy.updateMatrix(); nodeMesh.setMatrixAt(i, dummy.matrix); });
  nodeMesh.instanceMatrix.needsUpdate = true;
  group.add(nodeMesh);

  // Connections — each node to its 2 nearest neighbours.
  const conns = [];
  const linePos = [];
  for (let i = 0; i < N; i++) {
    const dists = [];
    for (let j = 0; j < N; j++) if (j !== i) dists.push([nodes[i].distanceTo(nodes[j]), j]);
    dists.sort((a, b) => a[0] - b[0]);
    for (let k = 0; k < 2; k++) { const j = dists[k][1]; if (j > i) { conns.push([i, j]); linePos.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z); } }
  }
  const lineGeo = new THREE.BufferGeometry(); lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePos, 3));
  const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0x3a86ff, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending }));
  group.add(lines);

  // Translucent glow shell + light.
  const shell = new THREE.Mesh(new THREE.SphereGeometry(2.0, 24, 18), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.05, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false }));
  group.add(shell);
  const light = new THREE.PointLight(0x8fd0ff, 0.6, 16); group.add(light);
  const sign = helpers.buildNeonSign("NEURAL CORE", 0x8fd0ff, 2.2, 0.42); sign.position.set(0, -1.5, 0); group.add(sign);

  // Synapse pulses travelling along connections.
  const SYN = 14;
  const synGeo = new THREE.BufferGeometry();
  const synPos = new Float32Array(SYN * 3);
  synGeo.setAttribute("position", new THREE.BufferAttribute(synPos, 3));
  const syn = new THREE.Points(synGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.22, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  group.add(syn);
  const synState = [];
  for (let i = 0; i < SYN; i++) synState.push({ c: Math.floor(Math.random() * conns.length), t: Math.random(), speed: 0 });

  let t = 0;
  return {
    update(dt) {
      t += dt;
      const active = !!liveRef.current.talkTarget;
      const beat = 0.5 + 0.5 * Math.sin(t * (active ? 6 : 1.4));
      const scl = (active ? 1.12 : 1.0) + beat * (active ? 0.06 : 0.03);
      group.scale.setScalar(scl);
      group.rotation.y += dt * (active ? 0.5 : 0.15);
      lines.material.opacity = (active ? 0.4 : 0.18) + beat * 0.1;
      nodeMesh.material.opacity = 0.6 + beat * 0.35;
      shell.material.opacity = 0.04 + (active ? 0.06 : 0.02) * beat;
      light.intensity = (active ? 1.4 : 0.5) + beat * 0.5;
      light.color.setHex(active ? 0xffffff : 0x8fd0ff);

      // Fire synapses (fast + bright when thinking).
      const arr = synGeo.attributes.position.array;
      for (let i = 0; i < SYN; i++) {
        const s = synState[i];
        if (s.speed === 0) s.speed = 0.5 + Math.random();
        s.t += dt * s.speed * (active ? 3 : 1);
        if (s.t >= 1) { s.t = 0; s.c = Math.floor(Math.random() * conns.length); s.speed = 0.5 + Math.random(); }
        const [a, b] = conns[s.c];
        arr[i * 3] = nodes[a].x + (nodes[b].x - nodes[a].x) * s.t;
        arr[i * 3 + 1] = nodes[a].y + (nodes[b].y - nodes[a].y) * s.t;
        arr[i * 3 + 2] = nodes[a].z + (nodes[b].z - nodes[a].z) * s.t;
      }
      synGeo.attributes.position.needsUpdate = true;
      syn.material.opacity = active ? 0.95 : 0.35;
      syn.material.size = active ? 0.28 : 0.16;
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
