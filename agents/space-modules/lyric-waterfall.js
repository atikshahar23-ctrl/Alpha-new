// ── Audio-Neural Walls · Sector 1 · Module 2 — Matrix Lyric Waterfall ──────
//
// A tall vertical wall panel where Suno AI lyric lines scroll downward like
// digital rain, each column's fall speed and brightness pulsing with vocal-
// range audio energy. Reads liveRef.lyricLines when set (same source the
// existing lyric-projector module uses), falls back to an ambient reel.
export function createLyricWaterfall(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const SPOT = { x: -37, z: -4 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  group.rotation.y = Math.PI / 2;
  scene.add(group); markDynamic(group);

  const W = 512, H = 640;
  const cvs = document.createElement("canvas"); cvs.width = W; cvs.height = H;
  const g = cvs.getContext("2d");
  const tex = new THREE.CanvasTexture(cvs);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.75), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
  panel.position.set(0, 1.5, 0.02); group.add(panel);
  const backing = new THREE.Mesh(new THREE.PlaneGeometry(2.36, 2.9), new THREE.MeshStandardMaterial({ color: 0x05070a, roughness: 0.7 }));
  backing.position.set(0, 1.5, -0.02); group.add(backing);
  const sign = helpers.buildNeonSign("LYRIC WATERFALL", 0x39ff9e, 2.4, 0.42); sign.position.set(0, 3.05, 0); group.add(sign);

  const AMBIENT = ["ALPHA ONLINE", "מרימים תדר", "CITY LIGHTS", "בׂאס נכנס", "WE RUN THE NIGHT", "אין גבול", "TURN IT UP", "אלפא בשליטה", "HEAVY GUARD", "מספרים לא משקרים"];
  const COLS = 9;
  const cols = [];
  for (let i = 0; i < COLS; i++) cols.push({ x: (i / (COLS - 1)) * W, y: Math.random() * H, spd: 60 + Math.random() * 90, txt: AMBIENT[i % AMBIENT.length] });

  const getVocal = () => {
    const lr = liveRef.current;
    if (typeof lr.midLevel === "number") return Math.max(0, Math.min(1, lr.midLevel));
    return -1;
  };

  let t = 0, lineT = 0, lineIdx = 0;
  return {
    update(dt) {
      t += dt;
      let energy = getVocal();
      if (energy < 0) energy = 0.35 + 0.25 * Math.abs(Math.sin(t * 2));
      lineT += dt;
      if (lineT > 3) { lineT = 0; const lines = (liveRef.current.lyricLines && liveRef.current.lyricLines.length) ? liveRef.current.lyricLines : AMBIENT; lineIdx = (lineIdx + 1) % lines.length; cols[(cols.length * Math.random()) | 0].txt = (lines[lineIdx] || "").toString().slice(0, 14) || AMBIENT[lineIdx % AMBIENT.length]; }
      g.fillStyle = "rgba(3,6,4,0.35)"; g.fillRect(0, 0, W, H); // trailing fade
      g.textAlign = "center"; g.font = "700 22px monospace";
      cols.forEach((c) => {
        c.y += c.spd * dt * (0.5 + energy);
        if (c.y > H + 40) { c.y = -40; }
        const glow = 0.5 + energy * 0.5;
        g.save(); g.translate(c.x, c.y); g.rotate(Math.PI / 2);
        g.shadowColor = `rgba(57,255,158,${glow})`; g.shadowBlur = 14;
        g.fillStyle = `rgba(140,255,190,${0.6 + energy * 0.4})`;
        g.fillText(c.txt, 0, 0);
        g.restore();
      });
      tex.needsUpdate = true;
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
