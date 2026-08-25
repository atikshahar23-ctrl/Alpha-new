// ── Audio-Neural Walls · Sector 6 · Module 27 — Legendary Pokémon Neon Signs ─
//
// Two subtle, elegant neon-tube silhouettes on the workshop wall — Lugia
// (soft cyan) and Ho-Oh (warm gold) — built from thin glowing tube outlines
// rather than a printed texture, so they read as literal neon fixtures.
export function createLegendaryNeonSigns(ctx) {
  const { THREE, scene, markDynamic } = ctx;
  const SPOT = { x: 26, z: -19 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 1.7, SPOT.z);
  scene.add(group); markDynamic(group);

  const mkTube = (points, color, cx) => {
    const curve = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x + cx, y, 0)), true, "catmullrom", 0.3);
    const geo = new THREE.TubeGeometry(curve, 64, 0.012, 6, true);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, toneMapped: false }));
    group.add(mesh); return mesh;
  };
  // Lugia: elongated serpentine silhouette (simplified).
  const lugia = mkTube([[-0.5, 0.1], [-0.2, 0.35], [0.1, 0.3], [0.35, 0.42], [0.2, 0.15], [0.4, -0.05], [0.1, -0.1], [-0.15, -0.02], [-0.4, -0.15]], 0x9fe6ff, -0.7);
  // Ho-Oh: winged bird silhouette (simplified).
  const hooh = mkTube([[-0.4, 0], [-0.15, 0.3], [0, 0.15], [0.15, 0.32], [0.4, 0.02], [0.18, -0.05], [0, -0.28], [-0.18, -0.05]], 0xffcf6a, 0.7);
  const backing = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.1), new THREE.MeshStandardMaterial({ color: 0x0a0a10, roughness: 0.7 }));
  backing.position.z = -0.06; group.add(backing);

  let t = 0;
  return {
    update(dt) {
      t += dt;
      lugia.material.opacity = 0.6 + 0.3 * Math.abs(Math.sin(t * 1.3));
      hooh.material.opacity = 0.6 + 0.3 * Math.abs(Math.sin(t * 1.3 + 1.5));
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
