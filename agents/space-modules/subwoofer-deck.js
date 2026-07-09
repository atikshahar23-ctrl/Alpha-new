// ── Module 47 · The Subwoofer Deck ─────────────────────────────────────────
//
// A circular section of floor that behaves like a subwoofer membrane: bass
// kicks drive an outward-rippling displacement across a segmented disc, plus
// concentric shockwave rings that expand and fade on each hit. Bass energy is
// read from a deck audio analyser if one is exposed (liveRef.audioAnalyser /
// bassLevel); otherwise a musical synthetic kick keeps it pumping.
export function createSubwooferDeck(ctx) {
  const { THREE, scene, markDynamic, helpers } = ctx;
  const { liveRef } = ctx;
  const SPOT = { x: 0, z: 22 };
  const R = 5;
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0.03, SPOT.z);
  scene.add(group); markDynamic(group);

  // Segmented membrane disc.
  const seg = 48;
  const geo = new THREE.CircleGeometry(R, seg, 0, Math.PI * 2);
  geo.rotateX(-Math.PI / 2);
  const base = geo.attributes.position.array.slice();
  const mat = new THREE.MeshStandardMaterial({ color: 0x0c0f16, metalness: 0.5, roughness: 0.5, emissive: 0x0a1830, emissiveIntensity: 0.3, side: THREE.DoubleSide });
  const membrane = new THREE.Mesh(geo, mat); group.add(membrane);
  const rimRing = new THREE.Mesh(new THREE.TorusGeometry(R, 0.06, 8, 64), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, toneMapped: false }));
  rimRing.rotation.x = Math.PI / 2; group.add(rimRing);
  const sign = helpers.buildNeonSign("SUBWOOFER DECK", 0x2ee6ff, 2.4, 0.44); sign.position.set(0, 2.4, 0); group.add(sign);

  // Shockwave ring pool.
  const rings = [];
  for (let i = 0; i < 4; i++) {
    const r = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.55, 48), new THREE.MeshBasicMaterial({ color: 0x39ff9e, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    r.rotation.x = -Math.PI / 2; r.position.y = 0.05; group.add(r); rings.push({ mesh: r, life: 0 });
  }

  const getBass = () => {
    const lr = liveRef.current;
    if (typeof lr.bassLevel === "number") return Math.max(0, Math.min(1, lr.bassLevel));
    const an = lr.audioAnalyser;
    if (an && an.frequencyBinCount) {
      try { const arr = new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(arr); let s = 0; const n = Math.min(8, arr.length); for (let i = 0; i < n; i++) s += arr[i]; return (s / n) / 255; } catch { /* fall through */ }
    }
    return -1; // signal: use synthetic
  };

  let t = 0, kick = 0, beatT = 0, waveCd = 0;
  return {
    update(dt) {
      t += dt; waveCd -= dt;
      let bass = getBass();
      if (bass < 0) { beatT += dt; const bpm = 120 / 60; const ph = (t * bpm) % 1; bass = ph < 0.12 ? 1 : 0.15 + 0.1 * Math.sin(t * 8); }
      kick = Math.max(kick * (1 - dt * 6), bass);
      // membrane displacement — radial standing wave pushed by the kick.
      const pos = geo.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        const x = base[i], z = base[i + 2]; const rad = Math.hypot(x, z);
        pos[i + 1] = Math.sin(rad * 1.6 - t * 6) * 0.18 * kick * (1 - rad / R);
      }
      geo.attributes.position.needsUpdate = true;
      membrane.material.emissiveIntensity = 0.3 + kick * 0.6;
      rimRing.material.opacity = 0.4 + kick * 0.5;
      // spawn a shockwave on a strong kick
      if (kick > 0.7 && waveCd <= 0) { const r = rings.find((x) => x.life <= 0); if (r) { r.life = 1; waveCd = 0.18; } }
      rings.forEach((r) => {
        if (r.life > 0) { r.life -= dt * 1.2; const s = (1 - r.life) * R; r.mesh.scale.setScalar(Math.max(0.01, s)); r.mesh.material.opacity = r.life * 0.6; }
        else r.mesh.material.opacity = 0;
      });
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
