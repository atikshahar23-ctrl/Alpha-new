// ── Audio-Neural Walls · Sector 4 · Module 18 — Dvora's Bio-Rhythm Monitor ─
//
// A calming teal heartbeat monitor beside דבורה's crew hologram (anchored at
// the same {-27, -7} spot the Crew Holograms module uses), its pulse tied to
// the real wall-clock second hand, with the current home-world task count
// (liveRef.securityAlerts as the closest live "tasks" proxy) shown alongside.
export function createDvoraBiorhythm(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const SPOT = { x: -24.4, z: -7 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);

  const W = 300, H = 130;
  const cvs = document.createElement("canvas"); cvs.width = W; cvs.height = H; const g = cvs.getContext("2d"); const tex = new THREE.CanvasTexture(cvs);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.6), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
  screen.position.set(0, 1.6, 0.02); group.add(screen);
  const backing = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 0.72), new THREE.MeshStandardMaterial({ color: 0x061412, roughness: 0.6 }));
  backing.position.set(0, 1.6, -0.02); group.add(backing);
  const sign = helpers.buildNeonSign("DVORA · BIO-RHYTHM", 0x2ee6ff, 2.0, 0.36); sign.position.set(0, 2.15, 0); group.add(sign);

  const trace = []; const N = 80;
  for (let i = 0; i < N; i++) trace.push(0.5);
  let t = 0, secLast = -1;
  const draw = (bpm, tasks) => {
    g.clearRect(0, 0, W, H); g.fillStyle = "rgba(3,10,9,0.92)"; g.fillRect(0, 0, W, H);
    g.strokeStyle = "rgba(46,230,255,0.6)"; g.lineWidth = 2; g.strokeRect(2, 2, W - 4, H - 4);
    g.beginPath(); g.strokeStyle = "#8fe6ff"; g.lineWidth = 2;
    trace.forEach((v, i) => { const x = (i / (N - 1)) * (W - 20) + 10, y = 70 - v * 44; i ? g.lineTo(x, y) : g.moveTo(x, y); });
    g.stroke();
    g.textAlign = "left"; g.fillStyle = "#39ff9e"; g.font = "800 20px system-ui"; g.fillText(bpm + " BPM", 12, 110);
    g.textAlign = "right"; g.fillStyle = "#8fe0c0"; g.font = "600 15px system-ui"; g.fillText(tasks + " משימות", W - 12, 110);
    tex.needsUpdate = true;
  };

  return {
    update(dt) {
      t += dt;
      const sec = new Date().getSeconds();
      const beat = sec !== secLast;
      secLast = sec;
      trace.shift();
      trace.push(0.5 + (beat ? 0.42 * Math.sin(t * 40) * Math.exp(-((t % 1) * 6)) : 0.02 * Math.sin(t * 3)));
      const tasks = (liveRef.current.securityAlerts && liveRef.current.securityAlerts.length) || 3;
      draw(64 + (new Date().getMinutes() % 8), tasks);
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
