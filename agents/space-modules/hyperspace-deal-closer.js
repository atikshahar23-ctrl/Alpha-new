// ── Module 9 · Hyperspace Deal-Closer ──────────────────────────────────────
//
// When a massive installation is "scheduled" (fired periodically here as a
// simulated event), the deck erupts in a cinematic warp: a shell of white star
// streaks stretches outward from the core and a heavy bass drop hits. A brief,
// earned celebration — the physical "deal closed!". No camera hijacking (the
// deck's own third-person rig owns the camera); the drama is all in the field.
export function createHyperspaceDealCloser(ctx) {
  const { THREE, scene, markDynamic } = ctx;
  const C = new THREE.Vector3(ctx.anchors.sun.x, 3.0, ctx.anchors.sun.z);

  const group = new THREE.Group();
  scene.add(group); markDynamic(group);

  const N = 420;
  const pos = new Float32Array(N * 3);
  const dirs = [];
  const reset = () => {
    for (let i = 0; i < N; i++) {
      const az = Math.random() * Math.PI * 2, el = Math.acos(2 * Math.random() - 1);
      const n = new THREE.Vector3(Math.sin(el) * Math.cos(az), Math.cos(el) * 0.5, Math.sin(el) * Math.sin(az)).normalize();
      dirs[i] = n;
      pos[i * 3] = C.x + n.x * 2; pos[i * 3 + 1] = C.y + n.y * 2; pos[i * 3 + 2] = C.z + n.z * 2;
    }
  };
  reset();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const streaks = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  streaks.frustumCulled = false;
  group.add(streaks);
  const flash = new THREE.PointLight(0x9fd0ff, 0, 60); flash.position.copy(C); group.add(flash);

  // WebAudio bass drop, created lazily.
  let actx = null;
  const bassDrop = () => {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume().catch(() => {});
      const now = actx.currentTime;
      const o = actx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(120, now); o.frequency.exponentialRampToValueAtTime(32, now + 0.9);
      const g = actx.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.32, now + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
      o.connect(g); g.connect(actx.destination); o.start(now); o.stop(now + 1.15);
    } catch {}
  };

  let timer = 14 + Math.random() * 8, warp = 0;
  return {
    update(dt) {
      timer -= dt;
      if (timer <= 0 && warp <= 0) { warp = 1; reset(); bassDrop(); timer = 22 + Math.random() * 14; }
      if (warp > 0) {
        warp = Math.max(0, warp - dt * 0.7);
        const reach = (1 - warp) * 90 + 2;
        const arr = geo.attributes.position.array;
        for (let i = 0; i < N; i++) {
          const n = dirs[i];
          arr[i * 3] = C.x + n.x * reach; arr[i * 3 + 1] = C.y + n.y * reach; arr[i * 3 + 2] = C.z + n.z * reach;
        }
        geo.attributes.position.needsUpdate = true;
        streaks.material.opacity = warp * 0.9;
        streaks.material.size = 0.4 + warp * 1.6;
        flash.intensity = warp * warp * 4;
      }
    },
    dispose() {
      if (actx) { try { actx.close(); } catch {} }
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
