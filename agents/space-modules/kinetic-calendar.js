// ── Audio-Neural Walls · Sector 5 · Module 24 — Kinetic Calendar ───────────
//
// A wall grid of the current week, one physical cube per day; "today" (the
// real system date) pushes out from the wall and a small hovering task-count
// chip floats above it — the rest of the week sits flush and dim.
export function createKineticCalendar(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const SPOT = { x: 34, z: -31 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 1.7, SPOT.z);
  scene.add(group); markDynamic(group);

  const DAYS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
  const cubes = [];
  for (let i = 0; i < 7; i++) {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.12), new THREE.MeshStandardMaterial({ color: 0x14161c, metalness: 0.5, roughness: 0.4, emissive: 0x0a0e18, emissiveIntensity: 0.3 }));
    cube.position.set((i - 3) * 0.4, 0, 0); group.add(cube);
    const cvs = document.createElement("canvas"); cvs.width = 64; cvs.height = 64; const g = cvs.getContext("2d"); const tex = new THREE.CanvasTexture(cvs);
    g.fillStyle = "#fff"; g.textAlign = "center"; g.font = "800 34px system-ui"; g.fillText(DAYS[i], 32, 42); tex.needsUpdate = true;
    const label = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.28), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
    label.position.set((i - 3) * 0.4, 0, 0.07); group.add(label);
    cubes.push({ cube, label, base: 0 });
  }
  const sign = helpers.buildNeonSign("KINETIC CALENDAR", 0x8fd0ff, 2.2, 0.4); sign.position.set(0, 0.55, 0); group.add(sign);
  const cvs2 = document.createElement("canvas"); cvs2.width = 120; cvs2.height = 60; const g2 = cvs2.getContext("2d"); const tex2 = new THREE.CanvasTexture(cvs2);
  const chip = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.28), new THREE.MeshBasicMaterial({ map: tex2, transparent: true, toneMapped: false }));
  group.add(chip);

  let t = 0;
  return {
    update(dt) {
      t += dt;
      const todayIdx = new Date().getDay();
      const tasks = (liveRef.current.securityAlerts && liveRef.current.securityAlerts.length) || 2;
      cubes.forEach((c, i) => {
        const isToday = i === todayIdx;
        c.base += ((isToday ? 0.14 : 0) - c.base) * Math.min(1, dt * 4);
        c.cube.position.z = c.base; c.label.position.z = c.base + 0.07;
        c.cube.material.emissiveIntensity = isToday ? 0.6 + 0.2 * Math.sin(t * 3) : 0.2;
        c.cube.material.color.setHex(isToday ? 0x2ee6ff : 0x14161c);
      });
      const active = cubes[todayIdx];
      chip.position.set(active.cube.position.x, 0.32, active.base + 0.1);
      g2.clearRect(0, 0, 120, 60); g2.fillStyle = "rgba(6,14,24,0.9)"; g2.fillRect(0, 0, 120, 60); g2.strokeStyle = "rgba(46,230,255,0.6)"; g2.strokeRect(1, 1, 118, 58);
      g2.textAlign = "center"; g2.fillStyle = "#8fd0ff"; g2.font = "700 22px system-ui"; g2.fillText(tasks + " משימות", 60, 36);
      tex2.needsUpdate = true;
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
