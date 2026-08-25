// ── Audio-Neural Walls · Sector 1 · Module 5 — Audio-Reactive Ambient Strips ─
//
// Neon LED lines running along the baseboard and crown of the studio-wall
// cluster (Sector 1's other four modules), smoothly color-shifting through
// the spectrum at a rate tied to the current track's BPM — a slow warm crawl
// at rest, a fast hue-cycle once the beat is detected.
export function createAmbientLedStrips(ctx) {
  const { THREE, scene, markDynamic, liveRef } = ctx;
  const SPOT = { x: -37, z: -8 };
  const LEN = 20; // spans the whole Sector 1 wall cluster (z -8..8ish)
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  group.rotation.y = Math.PI / 2;
  scene.add(group); markDynamic(group);

  const mkStrip = (y) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(LEN, 0.03, 0.03), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, toneMapped: false }));
    m.position.set(0, y, 0.02); group.add(m); return m;
  };
  const baseboard = mkStrip(0.04);
  const crown = mkStrip(2.9);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(LEN, 0.14), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.position.set(0, 0.04, 0.03); group.add(glow);

  let t = 0, hue = 0.5;
  return {
    update(dt) {
      t += dt;
      let bpmRate = 0.04; // slow idle crawl
      const an = liveRef.current.audioAnalyser;
      let energy = 0;
      if (an && an.frequencyBinCount) {
        try { const arr = new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(arr); let s = 0; const n = Math.min(6, arr.length); for (let i = 0; i < n; i++) s += arr[i]; energy = (s / n) / 255; } catch { /* ignore */ }
      } else if (liveRef.current.radioPlaying) energy = 0.4 + 0.3 * Math.abs(Math.sin(t * 6));
      bpmRate = 0.04 + energy * 0.5;
      hue = (hue + bpmRate * dt) % 1;
      [baseboard, crown].forEach((s) => { s.material.color.setHSL(hue, 0.85, 0.55); s.material.opacity = 0.55 + energy * 0.4; });
      glow.material.color.setHSL(hue, 0.85, 0.55); glow.material.opacity = 0.08 + energy * 0.14;
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
