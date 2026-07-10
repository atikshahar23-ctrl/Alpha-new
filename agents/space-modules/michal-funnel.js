// ── Audio-Neural Walls · Sector 4 · Module 16 — Michal's Funnel Diagram ────
//
// A glowing 3D marketing funnel floating beside Michal's existing crew
// hologram (anchored at the same {-27, 9} spot used by the Crew Holograms
// module) — stacked rings narrowing downward, showing a live simulated
// lead-conversion drop-off. Michal's own model/hologram is untouched.
export function createMichalFunnel(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const SPOT = { x: -24.4, z: 9 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);

  const STAGES = 5;
  const rings = [];
  for (let i = 0; i < STAGES; i++) {
    const r = 0.75 - i * 0.13;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.025, 8, 28), new THREE.MeshBasicMaterial({ color: 0xff3cc7, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, toneMapped: false }));
    ring.rotation.x = Math.PI / 2; ring.position.y = 2.2 - i * 0.32; group.add(ring); rings.push(ring);
  }
  const cvs = document.createElement("canvas"); cvs.width = 220; cvs.height = 110; const g = cvs.getContext("2d"); const tex = new THREE.CanvasTexture(cvs);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.55), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
  label.position.set(0.9, 1.4, 0); group.add(label);
  const sign = helpers.buildNeonSign("MICHAL · LEAD FUNNEL", 0xff3cc7, 2.0, 0.36); sign.position.set(0, 2.7, 0); group.add(sign);

  const draw = (leads) => {
    g.clearRect(0, 0, 220, 110); g.fillStyle = "rgba(10,4,10,0.85)"; g.fillRect(0, 0, 220, 110);
    g.strokeStyle = "rgba(255,60,199,0.6)"; g.lineWidth = 2; g.strokeRect(2, 2, 216, 106);
    g.textAlign = "left"; g.fillStyle = "#ff8fd8"; g.font = "700 15px system-ui";
    leads.forEach((n, i) => { g.fillText(n + " ← שלב " + (i + 1), 10, 22 + i * 18); });
    tex.needsUpdate = true;
  };
  const baseLeads = [120, 88, 54, 27, 12];
  draw(baseLeads);

  let t = 0, drawT = 0;
  return {
    update(dt) {
      t += dt; drawT += dt;
      rings.forEach((r, i) => { r.scale.setScalar(1 + 0.04 * Math.sin(t * 1.5 + i * 0.6)); r.material.opacity = 0.5 + 0.3 * Math.abs(Math.sin(t * 2 - i)); });
      if (drawT > 4) { drawT = 0; const jitter = baseLeads.map((n) => Math.max(1, Math.round(n * (0.9 + Math.random() * 0.2)))); draw(jitter); }
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
