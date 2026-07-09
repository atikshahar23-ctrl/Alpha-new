// ── Module 50 · The Vinyl Galaxy ───────────────────────────────────────────
//
// A colossal cosmic vinyl record hangs in the far starfield as the room's
// centrepiece backdrop: concentric groove rings, a glowing centre label, and a
// slow rotation that sheds drifting stardust from its rim. Placed far out and
// unlit (emissive/additive) so it reads as sky, not a prop, without touching
// the scene's real skybox/background.
export function createVinylGalaxy(ctx) {
  const { THREE, scene, markDynamic, helpers } = ctx;
  const group = new THREE.Group();
  group.position.set(-10, 34, -150);
  group.rotation.set(-0.35, 0.4, 0);
  scene.add(group); markDynamic(group);

  const R = 60;
  // Grooved disc via a radial canvas texture.
  const cvs = document.createElement("canvas"); cvs.width = 1024; cvs.height = 1024; const g = cvs.getContext("2d");
  const cx = 512, cy = 512;
  const grd = g.createRadialGradient(cx, cy, 0, cx, cy, 512);
  grd.addColorStop(0, "#1a1030"); grd.addColorStop(0.18, "#0a0a12"); grd.addColorStop(1, "#050508");
  g.fillStyle = grd; g.beginPath(); g.arc(cx, cy, 512, 0, Math.PI * 2); g.fill();
  for (let r = 90; r < 500; r += 3 + Math.random() * 2) { g.strokeStyle = `rgba(${120 + Math.random() * 60},${120 + Math.random() * 60},${160 + Math.random() * 80},${0.04 + Math.random() * 0.06})`; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke(); }
  // label
  g.fillStyle = "#d48fff"; g.beginPath(); g.arc(cx, cy, 88, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#12071e"; g.beginPath(); g.arc(cx, cy, 12, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#12071e"; g.textAlign = "center"; g.font = "800 46px system-ui"; g.fillText("ALPHA", cx, cy - 6); g.font = "600 26px system-ui"; g.fillText("SIDE A", cx, cy + 30);
  const tex = new THREE.CanvasTexture(cvs);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(R, 96), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, toneMapped: false, depthWrite: false }));
  group.add(disc);
  // faint sheen rim
  const rim = new THREE.Mesh(new THREE.RingGeometry(R * 0.98, R * 1.02, 96), new THREE.MeshBasicMaterial({ color: 0x8f6fff, transparent: true, opacity: 0.25, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  group.add(rim);
  const label = new THREE.Mesh(new THREE.CircleGeometry(R * 0.16, 48), new THREE.MeshBasicMaterial({ color: 0xd48fff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
  label.position.z = 0.1; group.add(label);
  const sign = helpers.buildNeonSign("THE VINYL GALAXY", 0xd48fff, 24, 4); sign.position.set(0, -R - 8, 2); group.add(sign);

  // Drifting stardust shed from the rim.
  const N = 260; const geo = new THREE.BufferGeometry(); const pos = new Float32Array(N * 3);
  const star = [];
  for (let i = 0; i < N; i++) { const a = Math.random() * Math.PI * 2, r = R * (0.7 + Math.random() * 0.6); star.push({ a, r, spd: 0.02 + Math.random() * 0.06, drift: Math.random() * 8 }); pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = Math.sin(a) * r; pos[i * 3 + 2] = (Math.random() - 0.5) * 8; }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xbfa8ff, size: 0.8, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, sizeAttenuation: true }));
  group.add(dust);

  let t = 0;
  return {
    update(dt) {
      t += dt;
      disc.rotation.z -= dt * 0.06; label.rotation.z -= dt * 0.06; rim.rotation.z += dt * 0.02;
      rim.material.opacity = 0.18 + 0.1 * Math.sin(t * 0.5);
      const arr = geo.attributes.position.array;
      for (let i = 0; i < N; i++) { const s = star[i]; s.a -= dt * s.spd; s.r += dt * s.drift * 0.05; if (s.r > R * 1.6) s.r = R * 0.7; arr[i * 3] = Math.cos(s.a) * s.r; arr[i * 3 + 1] = Math.sin(s.a) * s.r; }
      geo.attributes.position.needsUpdate = true;
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
