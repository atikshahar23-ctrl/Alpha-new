// ── Audio-Neural Walls · Sector 1 · Module 4 — Holographic Gold Records ────
//
// A cluster of digital vinyl records floating slightly off the wall — gold
// grooved discs that spin while a track is playing (liveRef.radioPlaying) and
// throw a brief spark-burst when a simulated stream-count milestone ticks
// over, like a plaque lighting up.
export function createHoloGoldRecords(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const SPOT = { x: -37, z: 4 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  group.rotation.y = Math.PI / 2;
  scene.add(group); markDynamic(group);

  // Shared grooved-gold-disc texture.
  const cvs = document.createElement("canvas"); cvs.width = 256; cvs.height = 256;
  const g = cvs.getContext("2d");
  const grd = g.createRadialGradient(128, 128, 4, 128, 128, 128);
  grd.addColorStop(0, "#3a2f10"); grd.addColorStop(0.15, "#0e0c08"); grd.addColorStop(1, "#050403");
  g.fillStyle = grd; g.beginPath(); g.arc(128, 128, 128, 0, Math.PI * 2); g.fill();
  for (let r = 26; r < 122; r += 3) { g.strokeStyle = `rgba(228,188,99,${0.06 + Math.random() * 0.08})`; g.lineWidth = 1; g.beginPath(); g.arc(128, 128, r, 0, Math.PI * 2); g.stroke(); }
  g.fillStyle = "#E4BC63"; g.beginPath(); g.arc(128, 128, 22, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#0e0c08"; g.beginPath(); g.arc(128, 128, 3, 0, Math.PI * 2); g.fill();
  const tex = new THREE.CanvasTexture(cvs);

  const records = [];
  const POS = [[0, 1.9, 0.14], [0.55, 1.5, 0.1], [-0.5, 1.55, 0.08], [0.2, 2.25, 0.06]];
  POS.forEach(([rx, ry, rz], i) => {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.02, 32), new THREE.MeshStandardMaterial({ map: tex, metalness: 0.7, roughness: 0.3, emissive: 0x2a1c04, emissiveIntensity: 0.3 }));
    disc.rotation.x = Math.PI / 2; disc.position.set(rx, ry, rz);
    group.add(disc); records.push({ mesh: disc, spin: 0.3 + i * 0.15 });
  });
  const sign = helpers.buildNeonSign("GOLD RECORDS", 0xE4BC63, 2.2, 0.4); sign.position.set(0, 2.85, 0); group.add(sign);

  // Spark burst pool for milestone hits.
  const N = 30;
  const geo = new THREE.BufferGeometry(); const pos = new Float32Array(N * 3);
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const sparks = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffe27a, size: 0.05, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  group.add(sparks);
  const sparkVel = [];
  for (let i = 0; i < N; i++) sparkVel.push({ vx: (Math.random() - 0.5) * 1.4, vy: Math.random() * 1.6, vz: (Math.random() - 0.5) * 1.0 });

  let t = 0, milestoneT = 9, burst = 0;
  const fireBurst = () => { burst = 1; const arr = geo.attributes.position.array; for (let i = 0; i < N; i++) { arr[i * 3] = 0; arr[i * 3 + 1] = 1.9; arr[i * 3 + 2] = 0.14; } };
  return {
    update(dt) {
      t += dt;
      const playing = !!liveRef.current.radioPlaying;
      records.forEach((r) => { if (playing) r.mesh.rotation.z += dt * r.spin; r.mesh.material.emissiveIntensity = 0.3 + (playing ? 0.35 * Math.abs(Math.sin(t * 3)) : 0); });
      milestoneT -= dt; if (milestoneT <= 0) { fireBurst(); milestoneT = 14 + Math.random() * 10; }
      if (burst > 0) {
        burst -= dt * 0.6;
        const arr = geo.attributes.position.array;
        for (let i = 0; i < N; i++) { arr[i * 3] += sparkVel[i].vx * dt; arr[i * 3 + 1] += sparkVel[i].vy * dt; arr[i * 3 + 2] += sparkVel[i].vz * dt; sparkVel[i].vy -= dt * 1.2; }
        geo.attributes.position.needsUpdate = true;
        sparks.material.opacity = Math.max(0, burst);
      } else sparks.material.opacity = 0;
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
