// ── Audio-Neural Walls · Sector 3 · Module 15 — Gas Fee Pressure Dials ─────
//
// Two steampunk-meets-cyberpunk glowing analog dials tracking a simulated
// Ethereum/network gas-fee reading — needle sweeps driven by a slow random
// walk (no live gas-fee API wired in), brass rims + a soft amber glow.
export function createGasFeeDials(ctx) {
  const { THREE, scene, markDynamic, helpers } = ctx;
  const SPOT = { x: 38, z: 24 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 1.7, SPOT.z);
  group.rotation.y = -Math.PI / 2;
  scene.add(group); markDynamic(group);

  const BRASS = 0xC9A24B;
  const dials = [-0.5, 0.5].map((dx) => {
    const face = new THREE.Group(); face.position.x = dx; group.add(face);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 10, 32), new THREE.MeshStandardMaterial({ color: BRASS, metalness: 0.85, roughness: 0.25 }));
    face.add(rim);
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.29, 32), new THREE.MeshBasicMaterial({ color: 0x0a1420, transparent: true, opacity: 0.9 }));
    glass.position.z = 0.01; face.add(glass);
    for (let i = 0; i <= 8; i++) { const a = Math.PI * 0.75 + (i / 8) * Math.PI * 1.5; const t = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.01), new THREE.MeshBasicMaterial({ color: 0xffb84d, toneMapped: false })); t.position.set(Math.cos(a) * 0.24, Math.sin(a) * 0.24, 0.02); t.rotation.z = a + Math.PI / 2; face.add(t); }
    const needleGeo = new THREE.ConeGeometry(0.015, 0.24, 6); needleGeo.translate(0, 0.12, 0); // pivot at the base
    const needle = new THREE.Mesh(needleGeo, new THREE.MeshBasicMaterial({ color: 0xff5533, toneMapped: false }));
    needle.position.z = 0.03; face.add(needle);
    return { face, needle, val: 0.4, target: 0.4, phase: Math.random() * 10 };
  });
  const sign = helpers.buildNeonSign("GAS FEE PRESSURE", BRASS, 2.2, 0.4); sign.position.set(0, 0.55, 0); group.add(sign);

  let t = 0, retimer = 3;
  return {
    update(dt) {
      t += dt; retimer -= dt;
      if (retimer <= 0) { dials.forEach((d) => { d.target = 0.15 + Math.random() * 0.8; }); retimer = 3 + Math.random() * 4; }
      dials.forEach((d) => {
        d.val += (d.target - d.val) * Math.min(1, dt * 1.5);
        const angle = Math.PI * 0.75 + d.val * Math.PI * 1.5;
        d.needle.rotation.z = angle - Math.PI / 2;
      });
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
