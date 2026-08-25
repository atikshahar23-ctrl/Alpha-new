// ── Audio-Neural Walls · Sector 2 · Module 6 — 360-Cam Hex-Grid ────────────
//
// A honeycomb of glowing hexagons mounted on the north hull wall, each one a
// simulated Heavy Guard truck camera tile — a stylised live-look feed (scan
// lines, drifting silhouette, timestamp) since the real fleet cameras aren't
// wired into the browser; reads exactly like a DVR wall at a glance.
export function createHexCamGrid(ctx) {
  const { THREE, scene, markDynamic, helpers } = ctx;
  const SPOT = { x: -30, z: -32 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 1.7, SPOT.z);
  scene.add(group); markDynamic(group);

  const hexShape = new THREE.Shape();
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const fn = i ? "lineTo" : "moveTo"; hexShape[fn](Math.cos(a) * 0.34, Math.sin(a) * 0.34); }
  const hexGeo = new THREE.ShapeGeometry(hexShape);
  const cells = [];
  const ROWS = 3, COLS = 5;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const x = (c - (COLS - 1) / 2) * 0.62 + (r % 2 ? 0.31 : 0);
    const y = (r - (ROWS - 1) / 2) * 0.56;
    const cvs = document.createElement("canvas"); cvs.width = 96; cvs.height = 96;
    const g = cvs.getContext("2d"); const tex = new THREE.CanvasTexture(cvs);
    const mesh = new THREE.Mesh(hexGeo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
    mesh.position.set(x, y, 0); group.add(mesh);
    const rim = new THREE.LineLoop(new THREE.EdgesGeometry(hexGeo), new THREE.LineBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.5, toneMapped: false }));
    rim.position.copy(mesh.position); group.add(rim);
    cells.push({ g, tex, seed: Math.random() * 10, rim });
  }
  const sign = helpers.buildNeonSign("360 CAM HEX-GRID", 0x2ee6ff, 2.4, 0.4); sign.position.set(0, 1.3, 0); group.add(sign);

  let t = 0, drawT = 0;
  return {
    update(dt) {
      t += dt; drawT += dt;
      if (drawT > 0.35) {
        drawT = 0;
        cells.forEach((c) => {
          const g = c.g; g.fillStyle = "#050a10"; g.fillRect(0, 0, 96, 96);
          g.strokeStyle = "rgba(46,230,255,0.12)"; for (let y = 0; y < 96; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(96, y); g.stroke(); }
          const px = 20 + ((t * 20 + c.seed * 13) % 56);
          g.fillStyle = "rgba(120,150,120,0.55)"; g.fillRect(px, 40, 14, 26);
          g.strokeStyle = "rgba(46,230,255,0.6)"; g.strokeRect(2, 2, 92, 92);
          c.tex.needsUpdate = true;
          c.rim.material.opacity = 0.4 + 0.25 * Math.sin(t * 3 + c.seed);
        });
      }
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
