// ── Module 20 · Warp-Drive Battery Link ────────────────────────────────────
//
// Links the Chery Tiggo PHEV's battery to the ship's hyper-jump fuel gauge —
// "the car powers the ship." A console with a battery bar and a ship fuel bar
// joined by an animated energy conduit; charge flows from the car into the
// ship, and the ship gauge tracks the battery level. Reads liveRef.phevBattery
// if present, else runs a slow charge/discharge sim.
export function createWarpBatteryLink(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles } = ctx;
  const SPOT = { x: 34, z: 15 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 0.9 });

  const console_ = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 0.4), new THREE.MeshStandardMaterial({ color: 0x12161f, metalness: 0.6, roughness: 0.35 }));
  console_.position.y = 1.1; console_.rotation.y = -0.4; group.add(console_);

  const cvs = document.createElement("canvas"); cvs.width = 512; cvs.height = 288;
  const tex = new THREE.CanvasTexture(cvs);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.95), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
  screen.position.set(0, 1.1, 0.22); screen.rotation.y = -0.4; group.add(screen);
  const light = new THREE.PointLight(0x2ee6ff, 0.5, 6); light.position.set(0, 1.6, 0.4); group.add(light);
  const sign = helpers.buildNeonSign("WARP-BATTERY LINK", 0x2ee6ff, 2.4, 0.42);
  sign.position.set(0, 2.4, 0); group.add(sign);

  const draw = (batt, fuel, flow) => {
    const g = cvs.getContext("2d");
    g.fillStyle = "#060a12"; g.fillRect(0, 0, 512, 288);
    g.strokeStyle = "rgba(46,230,255,0.5)"; g.lineWidth = 3; g.strokeRect(6, 6, 500, 276);
    g.textAlign = "left"; g.font = "700 22px system-ui";
    const bar = (x, y, w, h, v, c1, c2, label, val) => {
      g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(x, y, w, h);
      const grd = g.createLinearGradient(x, 0, x + w, 0); grd.addColorStop(0, c1); grd.addColorStop(1, c2);
      g.fillStyle = grd; g.fillRect(x, y, w * Math.max(0, Math.min(1, v)), h);
      g.fillStyle = "#cfe0f5"; g.fillText(label, x, y - 10); g.textAlign = "right"; g.fillText(val, x + w, y - 10); g.textAlign = "left";
    };
    g.fillStyle = "#3fd79a"; g.font = "700 24px system-ui"; g.fillText("🔋 סוללת Tiggo PHEV", 30, 44);
    bar(30, 66, 452, 40, batt / 100, "#1c7a4a", "#3fd79a", "", Math.round(batt) + "%");
    // conduit arrows
    g.fillStyle = "#2ee6ff"; g.font = "700 26px system-ui"; g.textAlign = "center";
    const ax = 256, ay = 150; g.fillText(flow > 0 ? "⚡ ▼ ▼ ▼ ⚡" : "— — —", ax, ay);
    g.textAlign = "left";
    g.fillStyle = "#2ee6ff"; g.font = "700 24px system-ui"; g.fillText("🚀 דלק קפיצת-על", 30, 196);
    bar(30, 218, 452, 40, fuel / 100, "#1c5a7a", "#2ee6ff", "", Math.round(fuel) + "%");
    tex.needsUpdate = true;
  };

  let batt = 82, fuel = 40, t = 0, redrawT = 99;
  return {
    update(dt) {
      t += dt;
      const live = liveRef.current.phevBattery;
      if (typeof live === "number") batt = live;
      else { batt += Math.sin(t * 0.15) * dt * 3; batt = Math.max(20, Math.min(100, batt)); }
      // ship fuel eases toward the battery level (car powers the ship).
      fuel += (batt - fuel) * Math.min(1, dt * 0.3);
      const flow = batt - fuel;
      light.intensity = 0.4 + Math.max(0, flow) * 0.02 + 0.15 * Math.sin(t * 4);
      redrawT += dt;
      if (redrawT > 0.2) { redrawT = 0; draw(batt, fuel, flow); }
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
