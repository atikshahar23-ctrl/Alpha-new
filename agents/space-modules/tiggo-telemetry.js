// ── Module 24 · Tiggo 7 Real-Time OBD2 Telemetry ───────────────────────────
//
// Turns the cargo-bay Chery Tiggo 7 PHEV into a live diagnostic hub: a
// holographic car on a charge pad with floating telemetry (Battery %, Tire
// PSI, Engine Temp) from a simulated OBD2/IoT feed. While charging, a pulsing
// energy umbilical runs from the pad into the car. Publishes the battery level
// to liveRef.phevBattery so the Warp-Battery Link (M20) reads the same value —
// the car literally powers the ship.
export function createTiggoTelemetry(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles } = ctx;
  const SPOT = { x: 16, z: -12 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.6 });

  const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.0, 0.1, 6), new THREE.MeshStandardMaterial({ color: 0x0e1218, metalness: 0.6, roughness: 0.4 }));
  pad.position.y = 0.05; group.add(pad);
  const padRing = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.04, 8, 48), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, toneMapped: false }));
  padRing.rotation.x = Math.PI / 2; padRing.position.y = 0.12; group.add(padRing);

  // Holographic car (blocky Tiggo silhouette, glowing cyan).
  const car = new THREE.Group(); car.position.y = 0.5; group.add(car);
  const holo = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color: 0x6fd3f0, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, toneMapped: false })); m.position.set(x, y, z); car.add(m); return m; };
  holo(2.6, 0.5, 1.2, 0, 0.3, 0);        // body
  holo(1.4, 0.5, 1.05, -0.1, 0.75, 0);   // cabin
  const wire = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.05, 1.25), new THREE.MeshBasicMaterial({ color: 0x6fd3f0, wireframe: true, transparent: true, opacity: 0.5, toneMapped: false })); wire.position.y = 0.55; car.add(wire);
  [[-0.85, 0.62], [0.85, 0.62], [-0.85, -0.62], [0.85, -0.62]].forEach(([x, z]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.16, 14), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.5, toneMapped: false })); w.rotation.x = Math.PI / 2; w.position.set(x, 0.05, z); car.add(w); });

  // Charging umbilical (pulsing energy cord from pad to car).
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8), new THREE.MeshBasicMaterial({ color: 0x3fd79a, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false }));
  cord.position.set(1.5, 0.7, 0.7); cord.rotation.z = 0.7; group.add(cord);

  // Telemetry panel.
  const cvs = document.createElement("canvas"); cvs.width = 360; cvs.height = 200; const tex = new THREE.CanvasTexture(cvs);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); sprite.scale.set(2.7, 1.5, 1); sprite.position.set(0, 2.6, 0); group.add(sprite);
  const sign = helpers.buildNeonSign("TIGGO · OBD2 LIVE", 0x2ee6ff, 2.4, 0.42); sign.position.set(0, 3.5, 0); group.add(sign);
  const light = new THREE.PointLight(0x2ee6ff, 0.5, 8); light.position.set(0, 1.4, 1.2); group.add(light);

  let batt = 76, psi = 33, temp = 62, charging = true, t = 0, redrawT = 99;
  const draw = () => {
    const g = cvs.getContext("2d"); g.clearRect(0, 0, 360, 200);
    g.fillStyle = "rgba(6,12,22,0.85)"; g.fillRect(0, 0, 360, 200); g.strokeStyle = "rgba(46,230,255,0.6)"; g.lineWidth = 2; g.strokeRect(4, 4, 352, 192);
    g.textAlign = "left"; g.font = "700 20px system-ui";
    g.fillStyle = charging ? "#3fd79a" : "#8fd0ff"; g.fillText(charging ? "⚡ בטעינה" : "🔋 מוכן", 20, 34);
    const row = (y, label, val, col) => { g.fillStyle = "#9fb6e0"; g.font = "600 18px system-ui"; g.fillText(label, 20, y); g.fillStyle = col; g.textAlign = "right"; g.font = "700 22px system-ui"; g.fillText(val, 340, y); g.textAlign = "left"; };
    row(78, "מצב סוללה", Math.round(batt) + "%", "#3fd79a");
    row(120, "לחץ צמיגים", psi.toFixed(1) + " PSI", "#8fd0ff");
    row(162, "חום מנוע", Math.round(temp) + "°C", temp > 95 ? "#ff6b6b" : "#E4BC63");
    tex.needsUpdate = true;
  };
  draw();

  return {
    update(dt) {
      t += dt;
      // Simulated OBD2 feed.
      if (charging) { batt = Math.min(100, batt + dt * 1.2); if (batt >= 100) charging = false; temp = 62 + Math.sin(t * 0.3) * 3; }
      else { batt = Math.max(30, batt - dt * 0.5); temp = 70 + Math.sin(t * 0.5) * 8; if (batt <= 30) charging = true; }
      psi = 33 + Math.sin(t * 0.2) * 0.6;
      liveRef.current.phevBattery = batt; // feed the Warp-Battery Link (M20)

      car.position.y = 0.5 + Math.sin(t * 1.1) * 0.06; car.rotation.y += dt * 0.25;
      padRing.material.color.setHSL(charging ? 0.42 : 0.52, 0.7, 0.45 + 0.12 * Math.sin(t * 3));
      cord.visible = charging;
      if (charging) { cord.material.opacity = 0.4 + 0.4 * Math.abs(Math.sin(t * 6)); cord.scale.y = 1 + 0.1 * Math.sin(t * 8); }
      light.intensity = 0.4 + (charging ? 0.3 : 0.1) * (0.5 + 0.5 * Math.sin(t * 4));
      redrawT += dt; if (redrawT > 0.3) { redrawT = 0; draw(); }
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
