// ── Module 37 · 1:1 Tiggo 7 PHEV Telemetry Dashboard ───────────────────────
//
// A holographic recreation of the Chery Tiggo 7 PHEV's digital cluster,
// floating by the vehicle bay: sweeping speedo + power gauge, a battery/fuel
// bar, gear + range readout. Values ride liveRef (phevBattery, and a synthetic
// cruise speed) so it reads as a live 1:1 instrument panel.
export function createTiggoDashboard(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const SPOT = { x: 34, z: 6 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 2.1, SPOT.z);
  group.rotation.y = -Math.PI / 2;
  scene.add(group); markDynamic(group);

  const cvs = document.createElement("canvas"); cvs.width = 640; cvs.height = 300; const tex = new THREE.CanvasTexture(cvs);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.6), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false }));
  group.add(panel);
  const frame = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.78), new THREE.MeshBasicMaterial({ color: 0x0a1424, transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
  frame.position.z = -0.02; group.add(frame);
  const sign = helpers.buildNeonSign("TIGGO 7 PHEV · TELEMETRY", 0x2ee6ff, 2.6, 0.4); sign.position.set(0, 1.2, 0); group.add(sign);

  const g = cvs.getContext("2d");
  const gauge = (cx, cy, r, frac, col, label, val) => {
    g.lineWidth = 12; g.strokeStyle = "rgba(255,255,255,0.08)"; g.beginPath(); g.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25); g.stroke();
    g.strokeStyle = col; g.beginPath(); g.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5 * Math.max(0, Math.min(1, frac))); g.stroke();
    g.fillStyle = "#fff"; g.textAlign = "center"; g.font = "800 34px system-ui"; g.fillText(val, cx, cy + 6);
    g.fillStyle = "#7fa8d8"; g.font = "600 15px system-ui"; g.fillText(label, cx, cy + 30);
  };
  const draw = (speed, batt, powr, range, gear) => {
    g.clearRect(0, 0, 640, 300);
    g.fillStyle = "rgba(4,10,20,0.9)"; g.fillRect(0, 0, 640, 300);
    g.strokeStyle = "rgba(46,230,255,0.5)"; g.lineWidth = 3; g.strokeRect(4, 4, 632, 292);
    gauge(150, 150, 92, speed / 220, "#2ee6ff", "km/h", Math.round(speed));
    gauge(490, 150, 92, (powr + 100) / 200, powr < 0 ? "#39ff9e" : "#ffb400", "POWER kW", Math.round(powr));
    // centre battery + info
    g.fillStyle = "#8fe0c0"; g.textAlign = "center"; g.font = "700 20px system-ui"; g.fillText("HYBRID", 320, 70);
    g.fillStyle = "rgba(255,255,255,0.1)"; g.fillRect(250, 92, 140, 18);
    g.fillStyle = batt > 20 ? "#39ff9e" : "#ff5a5a"; g.fillRect(250, 92, 140 * Math.max(0, Math.min(1, batt / 100)), 18);
    g.fillStyle = "#fff"; g.font = "700 22px system-ui"; g.fillText(Math.round(batt) + "%", 320, 138);
    g.fillStyle = "#E4BC63"; g.font = "800 40px system-ui"; g.fillText(gear, 320, 196);
    g.fillStyle = "#7fa8d8"; g.font = "600 16px system-ui"; g.fillText("טווח " + Math.round(range) + " ק״מ", 320, 230);
    tex.needsUpdate = true;
  };

  let t = 0, speed = 0, drawT = 99;
  return {
    update(dt) {
      t += dt;
      // synthetic cruise: gentle sinusoidal speed, power negative while "regen"/coasting.
      const cruise = 60 + 45 * (0.5 + 0.5 * Math.sin(t * 0.25));
      speed += (cruise - speed) * Math.min(1, dt * 0.6);
      const powr = Math.cos(t * 0.25) * 60 - 10; // + accel, - regen
      const batt = liveRef.current.phevBattery != null ? liveRef.current.phevBattery : 62;
      const range = 55 * (batt / 100) + 480; // EV + tank
      const gear = speed < 4 ? "P" : "D";
      panel.position.y = Math.sin(t * 1.2) * 0.02;
      drawT += dt; if (drawT > 0.2) { drawT = 0; draw(speed, batt, powr, range, gear); }
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
