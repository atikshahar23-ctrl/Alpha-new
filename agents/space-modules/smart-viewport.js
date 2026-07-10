// ── Audio-Neural Walls · Sector 5 · Module 21 — Smart Glass Viewports ──────
//
// A wall section that cycles from opaque metallic to a starfield-showing
// glass viewport and back — the same materialize idea as the Neural-Quantum
// Smart Glass system (Phase 1), applied to a standalone wall. NOTE: true
// player-proximity detection needs the live player world position, which
// isn't currently exposed through the space-module context (only 2D chars/
// summon data is) — this cycles on a slow ambient timer instead. Wiring a
// real liveRef.current.playerWorldPos through from Office3D.jsx would let
// this (and the owner-suite smart-glass panels) react to the actual player,
// not just gaze-direction — happy to add that plumbing on request.
export function createSmartViewport(ctx) {
  const { THREE, scene, markDynamic, helpers } = ctx;
  const SPOT = { x: 8, z: -31 };
  const W = 3.2, H = 2.4;
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);

  const metal = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({ color: 0x2a2f38, metalness: 0.75, roughness: 0.3 }));
  metal.position.set(0, 1.4, 0.02); group.add(metal);
  // Starfield behind the "glass" — a small sprite field that only reads once the metal fades.
  const N = 60; const geo = new THREE.BufferGeometry(); const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * W * 0.9; pos[i * 3 + 1] = 0.3 + Math.random() * H * 0.85; pos[i * 3 + 2] = -0.15; }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xbfe0ff, size: 0.03, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  stars.position.set(0, 0, 0.01); group.add(stars);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(W + 0.1, H + 0.1)), new THREE.LineBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.4, toneMapped: false }));
  edge.position.set(0, 1.4, 0.03); group.add(edge);
  const sign = helpers.buildNeonSign("SMART GLASS VIEWPORT", 0x2ee6ff, 2.4, 0.4); sign.position.set(0, 2.85, 0); group.add(sign);

  metal.material.transparent = true;
  let t = 0, prox = 0;
  return {
    update(dt) {
      t += dt;
      const target = 0.5 + 0.5 * Math.sin(t * 0.3);
      prox += (target - prox) * Math.min(1, dt * 2);
      metal.material.opacity = 1 - prox * 0.85;
      stars.material.opacity = prox * 0.9;
      edge.material.opacity = 0.3 + prox * 0.5;
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
