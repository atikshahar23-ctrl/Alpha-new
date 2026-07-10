// ── Audio-Neural Walls · Sector 2 · Module 7 — 'Amir Bros' Progress Bar ────
//
// A volumetric cylinder embedded in the wall, filling with neon-green liquid
// to represent the 60-truck Heavy Guard installation rollout. Progress ticks
// slowly upward on its own (a live install counter isn't wired into the
// browser) and pulses brighter each time it crosses a multiple-of-10 mark.
export function createAmirProgressCylinder(ctx) {
  const { THREE, scene, markDynamic, helpers } = ctx;
  const SPOT = { x: -15, z: -32 };
  const TOTAL = 60;
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);

  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 2.4, 24, 1, true), new THREE.MeshPhysicalMaterial({ color: 0x0a1a12, transmission: 0.5, roughness: 0.15, thickness: 0.3, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
  tube.position.y = 1.5; group.add(tube);
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 1, 20), new THREE.MeshBasicMaterial({ color: 0x39ff9e, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, toneMapped: false }));
  group.add(liquid);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.1, 24), new THREE.MeshStandardMaterial({ color: 0x161a20, metalness: 0.6, roughness: 0.4 }));
  cap.position.y = 2.75; group.add(cap);
  const cvs = document.createElement("canvas"); cvs.width = 220; cvs.height = 90; const g = cvs.getContext("2d"); const tex = new THREE.CanvasTexture(cvs);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.45), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
  label.position.set(0, 3.15, 0); group.add(label);
  const sign = helpers.buildNeonSign("AMIR BROS · 60-TRUCK ROLLOUT", 0x39ff9e, 2.8, 0.4); sign.position.set(0, -0.35, 0); group.add(sign);

  const draw = (installed) => { g.clearRect(0, 0, 220, 90); g.textAlign = "center"; g.fillStyle = "#39ff9e"; g.font = "800 30px system-ui"; g.fillText(installed + " / " + TOTAL, 110, 40); g.fillStyle = "#8fe0c0"; g.font = "600 15px system-ui"; g.fillText("משאיות מותקנות", 110, 68); tex.needsUpdate = true; };

  let t = 0, installed = 0, pulse = 0;
  draw(0);
  return {
    update(dt) {
      t += dt;
      installed = Math.min(TOTAL, t * 0.9);
      const frac = installed / TOTAL;
      liquid.scale.y = Math.max(0.02, frac);
      liquid.position.y = 0.05 + (frac * 2.3) / 2;
      liquid.material.opacity = 0.65 + 0.15 * Math.sin(t * 2);
      if (Math.floor(installed / 10) > Math.floor((installed - dt * 0.9) / 10)) pulse = 1;
      pulse = Math.max(0, pulse - dt * 1.5);
      liquid.material.color.setHSL(0.4, 1, 0.5 + pulse * 0.25);
      if (Math.floor(installed) !== Math.floor(installed - dt * 0.9)) draw(Math.floor(installed));
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
