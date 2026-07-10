// ── Audio-Neural Walls · Sector 3 · Module 11 — Cyberpunk Ticker-Tape ──────
//
// A glowing marquee LED strip spanning the top of the east wall, scrolling
// live crypto/stock prices off liveRef.marketRows in a continuous cyberpunk
// ticker, colour-coded green/red per line.
export function createTickerMarquee(ctx) {
  const { THREE, scene, markDynamic, liveRef } = ctx;
  const SPOT = { x: 38, z: 0 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 3.05, SPOT.z);
  group.rotation.y = -Math.PI / 2;
  scene.add(group); markDynamic(group);

  const W = 1024, H = 64;
  const cvs = document.createElement("canvas"); cvs.width = W; cvs.height = H;
  const g = cvs.getContext("2d"); const tex = new THREE.CanvasTexture(cvs);
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(20, 0.5), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
  group.add(strip);
  const backing = new THREE.Mesh(new THREE.PlaneGeometry(20.3, 0.6), new THREE.MeshStandardMaterial({ color: 0x030507, roughness: 0.6 }));
  backing.position.z = -0.02; group.add(backing);

  let scrollX = W, t = 0, drawT = 0;
  const buildLine = () => {
    const rows = liveRef.current.marketRows || [];
    if (!rows.length) return "טוען נתוני שוק חיים… ";
    return rows.map((r) => { const chg = r.chg || 0; return (r.sym || r.name || "—") + " " + (chg >= 0 ? "▲+" : "▼") + chg.toFixed(2) + "%"; }).join("    ·    ") + "    ·    ";
  };
  let lineText = "טוען…";
  return {
    update(dt) {
      t += dt; drawT += dt;
      if (drawT > 2) { drawT = 0; lineText = buildLine(); }
      g.fillStyle = "#04060a"; g.fillRect(0, 0, W, H);
      scrollX -= dt * 130; if (scrollX < -800) scrollX = W;
      g.textAlign = "left"; g.font = "700 30px ui-monospace,monospace";
      const rows = liveRef.current.marketRows || [];
      let x = scrollX;
      const parts = lineText.split("    ·    ").filter(Boolean);
      parts.forEach((p, i) => {
        const src = rows[i]; const up = src ? (src.chg || 0) >= 0 : true;
        g.fillStyle = up ? "#3FD79A" : "#ff5f6d";
        g.shadowColor = g.fillStyle; g.shadowBlur = 8;
        g.fillText(p, x, 40);
        x += g.measureText(p + "    ·    ").width;
      });
      g.shadowBlur = 0;
      tex.needsUpdate = true;
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
