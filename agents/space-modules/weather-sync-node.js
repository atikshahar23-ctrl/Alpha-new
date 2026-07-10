// ── Audio-Neural Walls · Sector 5 · Module 22 — Bat Yam Weather Sync Node ──
//
// A wall screen generating real-time 3D weather particles (rain / sun-glare
// / cloud drift) driven by liveRef.weather, the same live Open-Meteo feed
// the chrono-sphere/other modules already read — a genuine weather-reactive
// installation, not a synthetic stand-in.
export function createWeatherSyncNode(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const SPOT = { x: 20, z: -31 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);

  const frame = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.4), new THREE.MeshStandardMaterial({ color: 0x0a1420, roughness: 0.6 }));
  frame.position.set(0, 1.4, -0.03); group.add(frame);
  const clipPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.3), new THREE.MeshBasicMaterial({ color: 0x11324a, transparent: true, opacity: 0.25 }));
  clipPlane.position.set(0, 1.4, -0.02); group.add(clipPlane);
  const sign = helpers.buildNeonSign("BAT YAM WEATHER SYNC", 0x8fd0ff, 2.3, 0.4); sign.position.set(0, 2.35, 0); group.add(sign);

  const N = 90; const geo = new THREE.BufferGeometry(); const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 1.6; pos[i * 3 + 1] = 0.8 + Math.random() * 1.2; pos[i * 3 + 2] = 0.01; }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x9fd6ff, size: 0.025, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  group.add(particles);
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffe27a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  sun.scale.setScalar(0.5); sun.position.set(0.5, 2.0, 0.02); group.add(sun);

  let t = 0;
  return {
    update(dt) {
      t += dt;
      const w = liveRef.current.weather || {};
      const code = w.weatherCode ?? w.weather_code ?? -1;
      const isRain = code >= 51 && code <= 82;
      const isClear = code === 0 || code === 1;
      const cloud = (w.cloudCover ?? 40) / 100;
      const arr = geo.attributes.position.array;
      for (let i = 0; i < N; i++) {
        if (isRain) { arr[i * 3 + 1] -= dt * 3.2; if (arr[i * 3 + 1] < 0.75) { arr[i * 3 + 1] = 2.0; arr[i * 3] = (Math.random() - 0.5) * 1.6; } }
        else { arr[i * 3 + 1] += Math.sin(t * 0.3 + i) * dt * 0.05; arr[i * 3] += Math.sin(t * 0.2 + i * 0.3) * dt * 0.03; }
      }
      geo.attributes.position.needsUpdate = true;
      particles.material.opacity = isRain ? 0.75 : 0.2 + cloud * 0.4;
      particles.material.color.setHex(isRain ? 0x9fd6ff : 0xd8e2ec);
      sun.material.opacity = isClear ? 0.5 + 0.15 * Math.sin(t * 2) : 0;
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
