// ── Audio-Neural Walls · Sector 1 · Module 1 — Bass Displacement Panels ────
//
// A row of five wall panels that physically extrude outward in sync with the
// kick drum (20-80Hz band) of the active audio stream — each panel's local Z
// offset punches out on the beat and eases back, like the wall itself is
// breathing with the bass. Existing agent models are untouched; this is a
// standalone installation, not a modification to any character.
export function createBassDisplacementPanels(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const SPOT = { x: -37, z: -8 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  group.rotation.y = Math.PI / 2; // face into the room off the west hull wall
  scene.add(group); markDynamic(group);

  const N = 5;
  const panels = [];
  const backing = new THREE.Mesh(new THREE.PlaneGeometry(N * 0.9 + 0.3, 2.1), new THREE.MeshStandardMaterial({ color: 0x0c0f16, roughness: 0.6, metalness: 0.4 }));
  backing.position.set(0, 1.2, -0.06); group.add(backing);
  for (let i = 0; i < N; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.7, 0.1), new THREE.MeshStandardMaterial({ color: 0x151a24, metalness: 0.6, roughness: 0.35, emissive: 0x2ee6ff, emissiveIntensity: 0.12 }));
    p.position.set((i - (N - 1) / 2) * 0.9, 1.2, 0);
    group.add(p); panels.push({ mesh: p, phase: i * 0.13 });
  }
  const sign = helpers.buildNeonSign("BASS DISPLACEMENT", 0x2ee6ff, 2.6, 0.42); sign.position.set(0, 2.5, 0); group.add(sign);

  const getBass = () => {
    const lr = liveRef.current;
    if (typeof lr.bassLevel === "number") return Math.max(0, Math.min(1, lr.bassLevel));
    const an = lr.audioAnalyser;
    if (an && an.frequencyBinCount) {
      try { const arr = new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(arr); let s = 0; const n = Math.min(6, arr.length); for (let i = 0; i < n; i++) s += arr[i]; return (s / n) / 255; } catch { /* fall through */ }
    }
    return -1;
  };

  let t = 0, kick = 0;
  return {
    update(dt) {
      t += dt;
      let bass = getBass();
      if (bass < 0) { const ph = (t * 2) % 1; bass = ph < 0.1 ? 1 : 0.1; } // synthetic 120bpm kick
      kick += (bass - kick) * Math.min(1, dt * (bass > kick ? 14 : 5));
      panels.forEach((p) => {
        const push = kick * (0.7 + 0.3 * Math.sin(t * 3 + p.phase));
        p.mesh.position.z = push * 0.32;
        p.mesh.material.emissiveIntensity = 0.12 + push * 0.9;
      });
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
