// ── NEURAL-QUANTUM OVERRIDE · Phase 2 — Heavy Guard Sentinel Grid ──────────
//
// A glowing wireframe 3D miniature of the Center District (Rishon LeZion /
// Bat Yam) projected onto the floor beside the Heavy Guard War Table. The
// concrete-pump fleet shows up as data-sparks navigating the lit street
// grid; one spark at a time "expands" a holographic 360° camera feed into
// the air above it, cycling through the fleet. Fleet activity (spark count +
// speed) scales with live securityAlerts / marketRows so the city feels
// busier when the business is.
export function createHgSentinelGrid(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, anchors } = ctx;
  // Just north of the War Table (anchors.warTable ≈ {16,-20}), on open floor
  // between the table and the north hull wall.
  const SPOT = { x: anchors.warTable.x, z: anchors.warTable.z - 6.5 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0.02, SPOT.z);
  scene.add(group); markDynamic(group);

  const HALF = 3.4; // grid half-extent (metres)
  const DIV = 8;    // streets per axis
  const cyan = 0x37e6ff;

  // ── Street grid (glowing wireframe on the floor) ──
  const linePts = [];
  for (let i = 0; i <= DIV; i++) {
    const p = -HALF + (i / DIV) * HALF * 2;
    linePts.push(-HALF, 0, p, HALF, 0, p);
    linePts.push(p, 0, -HALF, p, 0, HALF);
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePts), 3));
  const grid = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, toneMapped: false }));
  group.add(grid);

  // ── City "buildings" — extruded wireframe blocks between the streets ──
  const blocks = [];
  const cell = (HALF * 2) / DIV;
  for (let gx = 0; gx < DIV; gx++) for (let gz = 0; gz < DIV; gz++) {
    if (Math.random() < 0.45) continue; // leave gaps for plazas/roads
    const h = 0.15 + Math.random() * 0.7;
    const b = new THREE.Mesh(new THREE.BoxGeometry(cell * 0.6, h, cell * 0.6), new THREE.MeshBasicMaterial({ color: cyan, wireframe: true, transparent: true, opacity: 0.28, toneMapped: false }));
    b.position.set(-HALF + (gx + 0.5) * cell, h / 2, -HALF + (gz + 0.5) * cell);
    group.add(b); blocks.push({ mesh: b, base: h, phase: Math.random() * 6 });
  }

  // ── Fleet data-sparks — navigate the grid, snapping+turning at junctions ──
  const MAX_SPARKS = 14;
  const sparks = [];
  const sparkGeo = new THREE.SphereGeometry(0.055, 8, 8);
  for (let i = 0; i < MAX_SPARKS; i++) {
    const m = new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, toneMapped: false }));
    const gx = Math.floor(Math.random() * (DIV + 1)), gz = Math.floor(Math.random() * (DIV + 1));
    m.position.set(-HALF + gx * cell, 0.06, -HALF + gz * cell);
    group.add(m);
    const dir = Math.random() < 0.5 ? [1, 0] : [0, 1];
    sparks.push({ mesh: m, gx, gz, dir, prog: 0, speed: 0.6 + Math.random() * 0.5 });
  }

  const sign = helpers.buildNeonSign("SENTINEL GRID · מרכז", cyan, 3.0, 0.5); sign.position.set(0, 1.55, 0); group.add(sign);

  // ── Holographic 360° cam feed that expands over the "active" spark ──
  const cvs = document.createElement("canvas"); cvs.width = 256; cvs.height = 160; const g = cvs.getContext("2d"); const tex = new THREE.CanvasTexture(cvs);
  const feed = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.94), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, side: THREE.DoubleSide, toneMapped: false }));
  feed.position.set(0, 1.0, 0); group.add(feed);
  const drawFeed = (label, load) => {
    g.clearRect(0, 0, 256, 160); g.fillStyle = "rgba(4,10,18,0.92)"; g.fillRect(0, 0, 256, 160);
    g.strokeStyle = "rgba(55,230,255,0.85)"; g.lineWidth = 2; g.strokeRect(3, 3, 250, 154);
    g.strokeStyle = "rgba(55,230,255,0.35)"; g.lineWidth = 1;
    for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(3, i * 32); g.lineTo(253, i * 32); g.stroke(); }
    g.fillStyle = "#ffd23f"; g.font = "700 18px system-ui"; g.textAlign = "left"; g.fillText("● LIVE  " + label, 12, 26);
    g.fillStyle = "#8fe0ff"; g.font = "600 14px system-ui"; g.fillText("עומס: " + Math.round(load * 100) + "%", 12, 148);
    // fake pump-truck blip
    g.fillStyle = "#ffe27a"; g.beginPath(); g.arc(128 + Math.sin(Date.now() / 400) * 40, 90, 6, 0, Math.PI * 2); g.fill();
    tex.needsUpdate = true;
  };

  let t = 0, feedT = 0, feedIdx = 0;
  return {
    update(dt) {
      t += dt;
      const lr = liveRef.current;
      const alerts = (lr.securityAlerts && lr.securityAlerts.length) || 0;
      const activeCount = Math.min(MAX_SPARKS, 6 + alerts * 2);
      const speedMul = 1 + Math.min(1.5, alerts * 0.3);

      sparks.forEach((s, i) => {
        const on = i < activeCount;
        s.mesh.visible = on;
        if (!on) return;
        s.prog += dt * s.speed * speedMul;
        while (s.prog >= 1) {
          s.prog -= 1;
          s.gx += s.dir[0]; s.gz += s.dir[1];
          // bounce off edges + randomly turn at junctions
          if (s.gx < 0 || s.gx > DIV || s.gz < 0 || s.gz > DIV) { s.dir = [-s.dir[0], -s.dir[1]]; s.gx = Math.max(0, Math.min(DIV, s.gx)); s.gz = Math.max(0, Math.min(DIV, s.gz)); }
          else if (Math.random() < 0.35) s.dir = s.dir[0] ? [0, Math.random() < 0.5 ? 1 : -1] : [Math.random() < 0.5 ? 1 : -1, 0];
        }
        const x = -HALF + (s.gx + s.dir[0] * s.prog) * cell;
        const z = -HALF + (s.gz + s.dir[1] * s.prog) * cell;
        s.mesh.position.set(x, 0.06 + Math.sin(t * 5 + i) * 0.01, z);
      });

      blocks.forEach((b) => { b.mesh.material.opacity = 0.22 + 0.12 * (0.5 + 0.5 * Math.sin(t * 1.5 + b.phase)); });
      grid.material.opacity = 0.4 + 0.15 * Math.sin(t * 2);

      // Cycle the expanding cam feed through the active fleet every ~4.5s.
      feedT += dt;
      const anchor = sparks[feedIdx % Math.max(1, activeCount)];
      const phase = feedT % 4.5;
      const vis = phase < 3.2 ? Math.min(1, phase * 4) * Math.min(1, (3.2 - phase) * 4) : 0;
      feed.material.opacity = vis * 0.9;
      if (anchor && anchor.mesh.visible) { feed.position.set(anchor.mesh.position.x, 1.0 + vis * 0.15, anchor.mesh.position.z); feed.scale.setScalar(0.6 + vis * 0.4); }
      feed.lookAt(feed.position.x, feed.position.y, feed.position.z + 1); // face +Z (into room)
      if (vis > 0.1 && Math.floor(t * 6) % 4 === 0) drawFeed("CAM-" + ((feedIdx % 8) + 1), 0.4 + 0.5 * Math.abs(Math.sin(t)));
      if (feedT >= 4.5) { feedT = 0; feedIdx++; }
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
