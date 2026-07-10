// ── Audio-Neural Walls · Sector 3 · Module 13 — Candlestick Extrusions ─────
//
// Real-time 3D market candlesticks that physically push out of the east wall
// (local Z) — height + push distance driven by liveRef.marketRows' 24h
// change and a synthetic volume proxy, green up-candles / red down-candles.
export function createCandlestickExtrusions(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const SPOT = { x: 38, z: 8 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  group.rotation.y = -Math.PI / 2;
  scene.add(group); markDynamic(group);

  const N = 8;
  const backing = new THREE.Mesh(new THREE.PlaneGeometry(N * 0.32 + 0.3, 1.6), new THREE.MeshStandardMaterial({ color: 0x05070a, roughness: 0.6 }));
  backing.position.set(0, 1.2, -0.05); group.add(backing);
  const candles = [];
  for (let i = 0; i < N; i++) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.16), new THREE.MeshStandardMaterial({ color: 0x39ff9e, emissive: 0x0a2a1a, emissiveIntensity: 0.4 }));
    const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6), new THREE.MeshBasicMaterial({ color: 0x39ff9e, toneMapped: false }));
    body.position.set((i - (N - 1) / 2) * 0.32, 1.2, 0); wick.position.copy(body.position);
    group.add(body, wick); candles.push({ body, wick, base: body.position.z, phase: Math.random() * 6 });
  }
  const sign = helpers.buildNeonSign("MARKET EXTRUSIONS", 0x39ff9e, 2.4, 0.4); sign.position.set(0, 2.15, 0); group.add(sign);

  let t = 0;
  return {
    update(dt) {
      t += dt;
      const rows = liveRef.current.marketRows || [];
      candles.forEach((c, i) => {
        const r = rows[i];
        const chg = r ? (r.chg || 0) : Math.sin(t * 0.5 + c.phase) * 3;
        const up = chg >= 0;
        const vol = 0.15 + Math.min(0.7, Math.abs(chg) * 0.08);
        const push = 0.02 + vol * (0.5 + 0.5 * Math.sin(t * 2 + c.phase));
        c.body.scale.y = 0.6 + Math.abs(chg) * 0.12;
        c.body.position.z = push; c.wick.position.z = push;
        c.body.material.color.setHex(up ? 0x39ff9e : 0xff5f6d);
        c.wick.material.color.setHex(up ? 0x39ff9e : 0xff5f6d);
        // Mobile flattens MeshStandardMaterial to MeshBasicMaterial scene-wide
        // (no .emissive there) — guard so a re-flatten sweep can't crash this.
        if (c.body.material.emissive) c.body.material.emissive.setHex(up ? 0x0a2a1a : 0x2a0a0a);
      });
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
