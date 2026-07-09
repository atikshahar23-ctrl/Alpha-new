// ── Module 46 · Suno AI Lyric Projector ────────────────────────────────────
//
// A studio console that projects lyrics into the room as glowing, floating 3D
// typography: each line rises off the console, drifts and fades like light
// calligraphy. Lines come from liveRef.lyricLines (set by whatever UI captures
// typed lyrics) and fall back to an ambient reel so the projector is never dark.
export function createLyricProjector(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles } = ctx;
  const SPOT = { x: -24, z: 22 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  group.rotation.y = 0.6;
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.0 });

  const desk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.7), new THREE.MeshStandardMaterial({ color: 0x120a1e, metalness: 0.5, roughness: 0.35, emissive: 0x2a0a3a, emissiveIntensity: 0.35 }));
  desk.position.y = 0.8; group.add(desk);
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshBasicMaterial({ color: 0xd48fff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, toneMapped: false }));
  lens.position.set(0, 1.3, 0); group.add(lens);
  const sign = helpers.buildNeonSign("SUNO · LYRIC PROJECTOR", 0xd48fff, 2.6, 0.44); sign.position.set(0, 2.9, 0); group.add(sign);

  const AMBIENT = ["ALPHA ONLINE", "מרימים את התדר", "CITY LIGHTS BELOW", "בׂאס נכנס עכשיו", "WE RUN THE NIGHT", "אין גבול לשמיים", "TURN IT UP", "אלפא בשליטה"];
  // A pool of floating lyric sprites.
  const POOL = 6;
  const makeSprite = () => {
    const cvs = document.createElement("canvas"); cvs.width = 512; cvs.height = 128; const tex = new THREE.CanvasTexture(cvs);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    sp.scale.set(3.2, 0.8, 1); group.add(sp); return { sp, cvs, tex, life: 0 };
  };
  const pool = Array.from({ length: POOL }, makeSprite);
  const drawText = (item, text, hue) => {
    const g = item.cvs.getContext("2d"); g.clearRect(0, 0, 512, 128);
    g.textAlign = "center"; g.font = "800 60px system-ui";
    g.shadowColor = `hsl(${hue},90%,65%)`; g.shadowBlur = 24; g.fillStyle = `hsl(${hue},90%,80%)`;
    g.fillText(text, 256, 84); g.fillText(text, 256, 84);
    item.tex.needsUpdate = true;
  };

  let t = 0, timer = 0, idx = 0;
  const emit = () => {
    const item = pool.find((p) => p.life <= 0); if (!item) return;
    const lines = (liveRef.current.lyricLines && liveRef.current.lyricLines.length) ? liveRef.current.lyricLines : AMBIENT;
    const text = (lines[idx % lines.length] || "").toString().slice(0, 22); idx++;
    drawText(item, text, (idx * 47) % 360);
    item.life = 1; item.x0 = (Math.random() - 0.5) * 1.2; item.z0 = (Math.random() - 0.5) * 0.6; item.sway = Math.random() * 6;
  };
  return {
    update(dt) {
      t += dt;
      lens.scale.setScalar(1 + 0.2 * Math.sin(t * 5));
      timer -= dt; if (timer <= 0) { emit(); timer = 1.4; }
      pool.forEach((p) => {
        if (p.life > 0) {
          p.life -= dt * 0.35;
          const up = (1 - p.life);
          p.sp.position.set(p.x0 + Math.sin(t + p.sway) * 0.25, 1.4 + up * 2.6, p.z0);
          p.sp.material.opacity = Math.sin(Math.min(1, p.life) * Math.PI) * 0.95;
          p.sp.scale.x = 3.2 + up * 0.6; p.sp.scale.y = 0.8 + up * 0.15;
        } else p.sp.material.opacity = 0;
      });
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
