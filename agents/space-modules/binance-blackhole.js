// ── Module 41 · The Binance Black Hole ─────────────────────────────────────
//
// When the market turns bear (net 24h change across liveRef.marketRows drops
// below a threshold) a gravitational-lensing black hole tears open above the
// finance radar: a dark lensing core ringed by a spinning orange accretion
// disk, dragging red asset-motes inward on a spiral before they vanish past
// the event horizon. It seals shut again when the market recovers.
export function createBinanceBlackhole(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const group = new THREE.Group();
  group.position.set(10, 8, 24);
  scene.add(group); markDynamic(group);

  // Lensing core — black sphere with a thin fresnel rim (fake lensing).
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 24), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  group.add(core);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(1.05, 32, 24), new THREE.MeshBasicMaterial({ color: 0x7a3bff, transparent: true, opacity: 0.0, side: THREE.BackSide, blending: THREE.AdditiveBlending, toneMapped: false }));
  group.add(halo);
  // Accretion disk.
  const disk = new THREE.Mesh(new THREE.RingGeometry(1.1, 2.4, 64), new THREE.MeshBasicMaterial({ color: 0xff8a2a, transparent: true, opacity: 0.0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false }));
  disk.rotation.x = Math.PI * 0.42; group.add(disk);
  const disk2 = disk.clone(); disk2.material = disk.material.clone(); disk2.material.color.setHex(0xffd23a); disk2.scale.setScalar(0.7); group.add(disk2);
  const sign = helpers.buildNeonSign("BEAR SINGULARITY", 0xff8a2a, 2.4, 0.44); sign.position.set(0, 2.8, 0); group.add(sign);

  // Red asset-motes spiralling in.
  const N = 120;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  const orb = []; // per-mote {a, r, y, spd}
  for (let i = 0; i < N; i++) { orb.push({ a: Math.random() * Math.PI * 2, r: 2.4 + Math.random() * 3, y: (Math.random() - 0.5) * 1.6, spd: 0.4 + Math.random() * 0.8 }); }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const motes = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xff4d4d, size: 0.14, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  group.add(motes);

  let t = 0, open = 0;
  return {
    update(dt) {
      t += dt;
      const rows = liveRef.current.marketRows;
      let net = 0; if (rows && rows.length) { rows.forEach((r) => { net += (r.chg || 0); }); net /= rows.length; }
      const bear = net < -1.2 || liveRef.current.redAlert; // net down > 1.2% avg, or red-alert
      open += ((bear ? 1 : 0) - open) * Math.min(1, dt * 0.7);
      const vis = open;
      core.scale.setScalar(0.6 + open * 0.6);
      halo.material.opacity = vis * (0.25 + 0.1 * Math.sin(t * 3));
      disk.material.opacity = vis * 0.55; disk2.material.opacity = vis * 0.5;
      disk.rotation.z += dt * 0.6; disk2.rotation.z -= dt * 0.9;
      motes.material.opacity = vis * 0.9;
      const arr = geo.attributes.position.array;
      for (let i = 0; i < N; i++) {
        const o = orb[i];
        o.a += dt * o.spd * (1 + (2.4 / Math.max(0.4, o.r))); // faster as it nears
        o.r -= dt * o.spd * 0.8 * open;
        o.y *= (1 - dt * 0.5 * open);
        if (o.r < 0.5) { o.r = 2.4 + Math.random() * 3; o.y = (Math.random() - 0.5) * 1.6; o.a = Math.random() * Math.PI * 2; }
        arr[i * 3] = Math.cos(o.a) * o.r; arr[i * 3 + 1] = o.y * Math.cos(t + i); arr[i * 3 + 2] = Math.sin(o.a) * o.r;
      }
      geo.attributes.position.needsUpdate = true;
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
