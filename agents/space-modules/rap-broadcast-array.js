// ── Module 17 · Galactic Rap Broadcast Array ───────────────────────────────
//
// A broadcast dish that projects kinetic typography into the starry sky: preset
// hype bars (rap/reggaeton) rise as huge glowing text panels drifting up into
// deep space, pulsing to a synthetic beat. (Cycles built-in bars; a future
// input hook can feed custom lyrics into the same projector.)
export function createRapBroadcastArray(ctx) {
  const { THREE, scene, markDynamic, helpers, obstacles } = ctx;
  const PINK = 0xff3cc7;
  const SPOT = { x: -24, z: -20 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.2 });

  const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 2.6, 10), new THREE.MeshStandardMaterial({ color: 0x1a1424, metalness: 0.6, roughness: 0.4 }));
  pylon.position.y = 1.3; group.add(pylon);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.9, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: 0x2a1f38, metalness: 0.5, roughness: 0.4, emissive: PINK, emissiveIntensity: 0.3, side: THREE.DoubleSide }));
  dish.position.set(0, 2.7, 0); dish.rotation.x = -Math.PI * 0.35; group.add(dish);
  const light = new THREE.PointLight(PINK, 0.6, 10); light.position.y = 2.8; group.add(light);
  const sign = helpers.buildNeonSign("RAP BROADCAST", PINK, 2.2, 0.42);
  sign.position.set(0, 3.6, 0); group.add(sign);

  const BARS = ["ALPHA ON TOP", "TO THE MOON 🚀", "SECURED 🔒", "FLEET OUT", "GG WP", "אלפא בשליטה"];
  const makeText = (txt, colorHex) => {
    const c = document.createElement("canvas"); c.width = 512; c.height = 128;
    const g = c.getContext("2d");
    g.clearRect(0, 0, 512, 128);
    g.font = "800 72px system-ui"; g.textAlign = "center"; g.textBaseline = "middle";
    g.shadowColor = "#" + colorHex.toString(16).padStart(6, "0"); g.shadowBlur = 22;
    g.fillStyle = "#fff"; g.fillText(txt, 256, 68);
    const tex = new THREE.CanvasTexture(c);
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    spr.scale.set(10, 2.5, 1);
    return spr;
  };
  // Pool of flying text panels (world-space, projected up into the sky).
  const panels = [];
  for (let i = 0; i < 4; i++) { const s = makeText(BARS[i], PINK); s.visible = false; group.add(s); panels.push({ spr: s, life: 0 }); }
  let idx = 0;

  let t = 0, beat = 0, spawnT = 0;
  return {
    update(dt) {
      t += dt;
      beat = (beat + dt) % 0.46;
      const pump = beat < 0.08 ? 1 : 0.4;
      dish.scale.setScalar(1 + pump * 0.06);
      light.intensity = 0.4 + pump * 0.6;

      spawnT += dt;
      if (spawnT > 2.2) {
        spawnT = 0;
        const p = panels.find((x) => x.life <= 0);
        if (p) {
          const c = document.createElement("canvas"); c.width = 512; c.height = 128;
          const g = c.getContext("2d"); g.font = "800 72px system-ui"; g.textAlign = "center"; g.textBaseline = "middle";
          g.shadowColor = "#ff3cc7"; g.shadowBlur = 22; g.fillStyle = "#fff"; g.fillText(BARS[idx % BARS.length], 256, 68);
          p.spr.material.map.image = c; p.spr.material.map.needsUpdate = true;
          idx++;
          p.life = 4; p.spr.visible = true;
          p.spr.position.set((Math.random() - 0.5) * 6, 4, -6 - Math.random() * 4);
        }
      }
      for (const p of panels) {
        if (p.life > 0) {
          p.life -= dt;
          p.spr.position.y += dt * 4; p.spr.position.z -= dt * 6;
          p.spr.material.opacity = Math.min(1, p.life) * (0.7 + pump * 0.3);
          if (p.life <= 0) p.spr.visible = false;
        }
      }
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
