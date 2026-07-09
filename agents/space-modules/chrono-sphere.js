// ── Module 21 · The Bat-Yam Chrono-Sphere (Real-World Sync) ─────────────────
//
// Breaks the fourth wall: fetches REAL current weather + time for Bat Yam,
// Israel (Open-Meteo, keyless + CORS) and syncs a live Earth globe to it — the
// sun light orbits to the real local hour so the viewer sees the lit day side
// or the dark night side with glowing city lights; when it's actually raining
// in Bat Yam, cosmic ice/rain streaks fall past the console. Degrades cleanly
// to device-local time + clear skies if the network is unavailable.
export function createChronoSphere(ctx) {
  const { THREE, scene, markDynamic, helpers, obstacles } = ctx;
  const SPOT = { x: 26, z: 18 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.1 });

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 1.0, 20), new THREE.MeshStandardMaterial({ color: 0x10141c, metalness: 0.6, roughness: 0.4 }));
  pedestal.position.y = 0.5; group.add(pedestal);

  // Day + night Earth textures (procedural).
  const mkTex = (night) => {
    const c = document.createElement("canvas"); c.width = 256; c.height = 128; const g = c.getContext("2d");
    g.fillStyle = night ? "#020308" : "#0d3b66"; g.fillRect(0, 0, 256, 128);
    // continents
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * 256, y = 10 + Math.random() * 108, r = 6 + Math.random() * 22;
      g.fillStyle = night ? "#05070c" : (Math.random() < 0.5 ? "#2f7d44" : "#3a8a4a");
      g.beginPath(); g.ellipse(x, y, r, r * 0.7, 0, 0, Math.PI * 2); g.fill();
    }
    if (night) { // city lights
      g.fillStyle = "#ffd76a";
      for (let i = 0; i < 200; i++) { g.globalAlpha = 0.4 + Math.random() * 0.6; g.fillRect(Math.random() * 256, 15 + Math.random() * 98, 1.5, 1.5); }
      g.globalAlpha = 1;
    }
    return new THREE.CanvasTexture(c);
  };
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, 40, 28),
    new THREE.MeshStandardMaterial({ map: mkTex(false), emissiveMap: mkTex(true), emissive: 0xffffff, emissiveIntensity: 0.0, roughness: 0.9, metalness: 0.0 })
  );
  earth.position.y = 2.0; group.add(earth);
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.18, 32, 22), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, roughness: 1 }));
  clouds.position.y = 2.0; group.add(clouds);
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.3, 28, 20), new THREE.MeshBasicMaterial({ color: 0x3a86ff, transparent: true, opacity: 0.12, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false }));
  atmo.position.y = 2.0; group.add(atmo);
  const sun = new THREE.PointLight(0xfff2d0, 1.6, 12); sun.position.set(4, 2.4, 2); group.add(sun);

  // Readout panel.
  const cvs = document.createElement("canvas"); cvs.width = 320; cvs.height = 150; const tex = new THREE.CanvasTexture(cvs);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.set(2.4, 1.125, 1); sprite.position.set(0, 3.55, 0); group.add(sprite);
  const sign = helpers.buildNeonSign("BAT-YAM CHRONO", 0x3a86ff, 2.2, 0.42);
  sign.position.set(0, 4.4, 0); group.add(sign);

  // Cosmic rain (hidden until it's actually raining).
  const RN = 120; const rp = new Float32Array(RN * 3);
  for (let i = 0; i < RN; i++) { rp[i * 3] = (Math.random() - 0.5) * 6; rp[i * 3 + 1] = Math.random() * 8; rp[i * 3 + 2] = (Math.random() - 0.5) * 6; }
  const rgeo = new THREE.BufferGeometry(); rgeo.setAttribute("position", new THREE.BufferAttribute(rp, 3));
  const rain = new THREE.Points(rgeo, new THREE.PointsMaterial({ color: 0x9fd0ff, size: 0.09, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
  rain.visible = false; group.add(rain);

  const state = { isDay: null, raining: false, temp: null, hour: null };
  const drawPanel = () => {
    const g = cvs.getContext("2d"); g.clearRect(0, 0, 320, 150);
    g.fillStyle = "rgba(6,12,22,0.82)"; g.fillRect(0, 0, 320, 150);
    g.strokeStyle = "rgba(58,134,255,0.6)"; g.lineWidth = 2; g.strokeRect(4, 4, 312, 142);
    const d = new Date();
    const hh = state.hour != null ? state.hour : d.getHours();
    const timeStr = String(hh).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    g.textAlign = "center";
    g.fillStyle = "#8fd0ff"; g.font = "700 20px system-ui"; g.fillText("בת ים · ישראל", 160, 34);
    g.fillStyle = "#fff"; g.font = "800 46px system-ui"; g.fillText(timeStr, 160, 82);
    g.fillStyle = state.isDay === false ? "#9fb6e0" : "#ffd76a"; g.font = "600 20px system-ui";
    const cond = state.raining ? "🌧 גשם" : state.isDay === false ? "🌙 לילה" : "☀ יום";
    g.fillText(cond + (state.temp != null ? "  ·  " + Math.round(state.temp) + "°C" : ""), 160, 122);
    tex.needsUpdate = true;
  };
  drawPanel();

  const applyRealData = () => {
    // Sun position + emissive from the real hour; rain visibility from precip.
    const d = new Date();
    const hour = state.hour != null ? state.hour : d.getHours();
    const day = state.isDay != null ? state.isDay : (hour >= 6 && hour < 19);
    const ang = ((hour + d.getMinutes() / 60) / 24) * Math.PI * 2 - Math.PI / 2;
    sun.position.set(Math.cos(ang) * 5, 2.4, Math.sin(ang) * 5);
    earth.material.emissiveIntensity = day ? 0.15 : 1.0; // city lights blaze at night
    atmo.material.opacity = day ? 0.14 : 0.06;
    rain.visible = state.raining;
    drawPanel();
  };

  const fetchReal = () => {
    try {
      fetch("https://api.open-meteo.com/v1/forecast?latitude=32.017&longitude=34.745&current=temperature_2m,precipitation,is_day&timezone=Asia%2FJerusalem")
        .then((r) => r.json())
        .then((j) => {
          const cur = j && j.current;
          if (cur) {
            state.isDay = cur.is_day === 1;
            state.raining = (cur.precipitation || 0) > 0;
            state.temp = cur.temperature_2m;
            if (cur.time) { const t = new Date(cur.time); if (!isNaN(t)) state.hour = t.getHours(); }
            applyRealData();
          }
        })
        .catch(() => {});
    } catch {}
  };
  fetchReal();
  applyRealData();
  const iv = setInterval(fetchReal, 10 * 60 * 1000);

  let t = 0;
  return {
    update(dt) {
      t += dt;
      earth.rotation.y += dt * 0.08; clouds.rotation.y += dt * 0.1;
      if (rain.visible) {
        const arr = rgeo.attributes.position.array;
        for (let i = 0; i < RN; i++) { arr[i * 3 + 1] -= dt * (5 + (i % 5)); if (arr[i * 3 + 1] < 0) arr[i * 3 + 1] = 8; }
        rgeo.attributes.position.needsUpdate = true;
      }
    },
    dispose() {
      clearInterval(iv);
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m.map) m.map.dispose(); if (m.emissiveMap) m.emissiveMap.dispose(); m.dispose(); }); });
    },
  };
}
