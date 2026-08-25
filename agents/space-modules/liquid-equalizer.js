// ── Audio-Neural Walls · Sector 1 · Module 3 — Liquid Equalizer ───────────
//
// A wide horizontal wall section of glowing "liquid" bars that bounce and
// splash per frequency band (mid/high range), rendered as a bank of
// instanced bars whose height + brightness track a per-band energy curve —
// reads as a fluid, physical equalizer rather than a flat spectrum graph.
export function createLiquidEqualizer(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const SPOT = { x: -37, z: 0 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  group.rotation.y = Math.PI / 2;
  scene.add(group); markDynamic(group);

  const N = 24;
  const backing = new THREE.Mesh(new THREE.PlaneGeometry(N * 0.11 + 0.2, 1.3), new THREE.MeshStandardMaterial({ color: 0x060a10, roughness: 0.6 }));
  backing.position.set(0, 1.0, -0.05); group.add(backing);
  const bars = [];
  const barGeo = new THREE.BoxGeometry(0.08, 1, 0.06);
  for (let i = 0; i < N; i++) {
    const m = new THREE.Mesh(barGeo, new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, toneMapped: false }));
    m.position.set((i - (N - 1) / 2) * 0.11, 0.5, 0);
    group.add(m); bars.push({ mesh: m, h: 0.1, phase: Math.random() * 10 });
  }
  const trough = new THREE.Mesh(new THREE.PlaneGeometry(N * 0.11 + 0.2, 0.06), new THREE.MeshBasicMaterial({ color: 0x39ff9e, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, toneMapped: false }));
  trough.position.set(0, 0.42, 0.03); group.add(trough);
  const sign = helpers.buildNeonSign("LIQUID EQUALIZER", 0xff5ad0, 2.5, 0.42); sign.position.set(0, 1.9, 0); group.add(sign);

  const bandLevels = new Float32Array(N);
  const getSpectrum = () => {
    const an = liveRef.current.audioAnalyser;
    if (an && an.frequencyBinCount) {
      try {
        const arr = new Uint8Array(an.frequencyBinCount);
        an.getByteFrequencyData(arr);
        const step = Math.max(1, Math.floor(arr.length / N));
        for (let i = 0; i < N; i++) bandLevels[i] = (arr[i * step] || 0) / 255;
        return true;
      } catch { /* fall through */ }
    }
    return false;
  };

  let t = 0;
  return {
    update(dt) {
      t += dt;
      const live = getSpectrum();
      bars.forEach((b, i) => {
        const target = live ? bandLevels[i] : 0.15 + 0.5 * Math.abs(Math.sin(t * (2 + (i % 5) * 0.4) + b.phase));
        b.h += (target - b.h) * Math.min(1, dt * (target > b.h ? 12 : 4)); // fast splash up, slow settle
        const hh = Math.max(0.06, b.h * 1.15);
        b.mesh.scale.y = hh; b.mesh.position.y = hh / 2;
        b.mesh.material.opacity = 0.5 + b.h * 0.5;
        b.mesh.material.color.setHSL(0.5 - b.h * 0.25, 0.9, 0.55);
      });
      trough.material.opacity = 0.4 + 0.2 * Math.sin(t * 3);
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
