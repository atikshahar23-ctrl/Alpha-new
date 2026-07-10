// ── NEURAL-QUANTUM OVERRIDE · Phase 5 — The Omni-Environment ───────────────
//
// The room becomes programmable matter. A run of wall slats physically
// undulates as a travelling wave whose amplitude tracks the bass frequencies
// of the active audio stream (Reggaeton kick → the wall ripples like digital
// water). Outside the hull, a cluster of towering cyberpunk billboards rises
// above the walls, each rendering the live stats of the crypto trading bots
// (liveRef.marketRows) so the external skyline reflects the business in
// real-time.
export function createOmniEnvironment(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const group = new THREE.Group();
  scene.add(group); markDynamic(group);

  const cyan = 0x33e0ff, magenta = 0xff3fae;

  // ── Undulating wall slats — a travelling bass wave along the south wall ──
  const slatWall = new THREE.Group();
  slatWall.position.set(0, 0, 31); // just inside the south hull wall
  group.add(slatWall);
  const N = 24;
  const slats = [];
  for (let i = 0; i < N; i++) {
    const s = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 4.2, 0.16),
      new THREE.MeshBasicMaterial({ color: cyan, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false }),
    );
    s.position.set((i - (N - 1) / 2) * 1.0, 2.4, 0);
    slatWall.add(s); slats.push(s);
  }

  const getBass = () => {
    const lr = liveRef.current;
    if (typeof lr.bassLevel === "number") return Math.max(0, Math.min(1, lr.bassLevel));
    const an = lr.audioAnalyser;
    if (an && an.frequencyBinCount) {
      try { const arr = new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(arr); let s = 0; const n = Math.min(6, arr.length); for (let i = 0; i < n; i++) s += arr[i]; return (s / n) / 255; } catch { /* fall through */ }
    }
    return -1;
  };

  // ── Towering external cyberpunk billboards (crypto-bot stats) ──
  // Placed OUTSIDE the hull (|z|>33 / |x|>39) and tall enough to clear the
  // walls, so they read as the surrounding metropolis skyline.
  const billboards = [];
  const bbSpots = [
    { x: -14, z: -47, ry: 0 }, { x: 16, z: -47, ry: 0 },
    { x: 50, z: -6, ry: -Math.PI / 2 }, { x: -50, z: 8, ry: Math.PI / 2 },
  ];
  bbSpots.forEach((sp, i) => {
    const tower = new THREE.Group();
    tower.position.set(sp.x, 0, sp.z); tower.rotation.y = sp.ry;
    group.add(tower);
    // Dark structural pillar.
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(4.2, 15, 1.2), new THREE.MeshBasicMaterial({ color: 0x05070e, toneMapped: false }));
    pillar.position.y = 7.5; tower.add(pillar);
    const cvs = document.createElement("canvas"); cvs.width = 256; cvs.height = 384; const g = cvs.getContext("2d"); const tex = new THREE.CanvasTexture(cvs);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 6.0), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
    screen.position.set(0, 9.5, 0.62); tower.add(screen);
    billboards.push({ g, tex, screen, hue: i * 0.25 });
  });

  const drawBillboard = (b, t) => {
    const { g } = b; g.clearRect(0, 0, 256, 384);
    g.fillStyle = "#050912"; g.fillRect(0, 0, 256, 384);
    g.strokeStyle = "rgba(51,224,255,0.7)"; g.lineWidth = 4; g.strokeRect(4, 4, 248, 376);
    g.fillStyle = "#33e0ff"; g.font = "800 30px system-ui"; g.textAlign = "center"; g.fillText("ALPHA BOTS", 128, 46);
    const rows = (liveRef.current.marketRows || []).slice(0, 6);
    if (rows.length) {
      rows.forEach((r, i) => {
        const y = 90 + i * 46;
        const sym = (r.symbol || r.sym || r.name || "—").toString().slice(0, 8).toUpperCase();
        const chg = Number(r.changePct != null ? r.changePct : r.chg != null ? r.chg : 0);
        g.textAlign = "left"; g.fillStyle = "#cfe8ff"; g.font = "700 26px system-ui"; g.fillText(sym, 20, y);
        g.textAlign = "right"; g.fillStyle = chg >= 0 ? "#39ff9e" : "#ff5a6a"; g.fillText((chg >= 0 ? "+" : "") + chg.toFixed(2) + "%", 236, y);
      });
    } else {
      g.fillStyle = "#6f88a8"; g.font = "600 22px system-ui"; g.fillText("SYNCING FEED…", 128, 200);
    }
    // scanline pulse
    g.fillStyle = "rgba(255,63,174,0.10)"; const sy = ((t * 60) % 384); g.fillRect(0, sy, 256, 10);
    b.tex.needsUpdate = true;
  };

  const sign = helpers.buildNeonSign("OMNI-ENVIRONMENT", magenta, 3.0, 0.5); sign.position.set(0, 5.0, 30.5); group.add(sign);

  let t = 0, kick = 0, bbT = 0;
  return {
    update(dt) {
      t += dt;
      let bass = getBass();
      if (bass < 0) { const ph = (t * 1.9) % 1; bass = ph < 0.12 ? 1 : 0.12; } // synthetic reggaeton kick
      kick += (bass - kick) * Math.min(1, dt * (bass > kick ? 12 : 4));
      slats.forEach((s, i) => {
        const wave = Math.sin(i * 0.55 - t * 6);
        s.position.z = wave * kick * 0.6;               // ripple out of the wall
        s.scale.x = 1 + wave * kick * 0.15;
        s.material.opacity = 0.35 + kick * 0.5 * (0.5 + 0.5 * wave);
        s.material.color.setHSL((0.5 + i * 0.01 + kick * 0.15) % 1, 0.85, 0.55);
      });
      bbT += dt;
      if (bbT > 0.4) { bbT = 0; billboards.forEach((b) => drawBillboard(b, t)); }
      billboards.forEach((b, i) => { b.screen.material.opacity = 0.85 + 0.15 * Math.sin(t * 2 + i); });
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
