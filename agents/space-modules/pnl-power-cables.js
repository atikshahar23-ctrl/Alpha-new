// ── Audio-Neural Walls · Sector 3 · Module 12 — PNL Power Cables ───────────
//
// Thick translucent cables running down the east wall — green light flows
// UP when the portfolio's net PnL (derived from liveRef.marketRows) is
// positive, red light flows DOWN when negative, via a scrolling texture
// offset that reverses direction with the sign of the trend.
export function createPnlPowerCables(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const SPOT = { x: 38, z: -10 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  group.rotation.y = -Math.PI / 2;
  scene.add(group); markDynamic(group);

  const cvs = document.createElement("canvas"); cvs.width = 16; cvs.height = 128; const g = cvs.getContext("2d");
  const drawStripes = (col) => { g.clearRect(0, 0, 16, 128); for (let y = 0; y < 128; y += 16) { g.fillStyle = col; g.globalAlpha = 0.15 + (y % 32 === 0 ? 0.5 : 0); g.fillRect(0, y, 16, 8); } g.globalAlpha = 1; };
  drawStripes("#39ff9e");
  const tex = new THREE.CanvasTexture(cvs); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, 4);

  const cables = [-0.9, -0.3, 0.3, 0.9].map((cx) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 10), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, toneMapped: false }));
    c.position.set(cx, 1.3, 0.03); group.add(c); return c;
  });
  const sign = helpers.buildNeonSign("PNL POWER CABLES", 0x39ff9e, 2.2, 0.4); sign.position.set(0, 2.85, 0); group.add(sign);

  let t = 0, pnl = 0;
  return {
    update(dt) {
      t += dt;
      const rows = liveRef.current.marketRows || [];
      const net = rows.length ? rows.reduce((s, r) => s + (r.chg || 0), 0) / rows.length : 0;
      pnl += (net - pnl) * Math.min(1, dt * 0.6);
      const up = pnl >= 0;
      tex.offset.y += dt * (up ? 0.9 : -0.9);
      cables.forEach((c) => { c.material.color.setHex(up ? 0x39ff9e : 0xff5f6d); c.material.opacity = 0.65 + Math.min(0.3, Math.abs(pnl) * 0.15); });
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
