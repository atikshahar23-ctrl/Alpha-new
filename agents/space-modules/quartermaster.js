// ── Module 2 · The Veteran Quartermaster ───────────────────────────────────
//
// A 4th holographic AI crew member (amber glow) stationed in the cargo bay,
// projected on an anti-grav pad, tracking hardware inventory and simulated
// vehicle-maintenance alerts on a floating manifest panel beside it.
export function createQuartermaster(ctx) {
  const { THREE, scene, markDynamic, helpers, obstacles } = ctx;
  const AMBER = 0xE4A11A;
  const SPOT = { x: 26, z: -9 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group);
  markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 0.9 });

  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.1, 24), new THREE.MeshStandardMaterial({ color: 0x0c0f16, metalness: 0.6, roughness: 0.4 }));
  pad.position.y = 0.05; group.add(pad);
  const padRing = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.03, 8, 40), new THREE.MeshBasicMaterial({ color: AMBER, toneMapped: false }));
  padRing.rotation.x = Math.PI / 2; padRing.position.y = 0.11; group.add(padRing);

  const holo = new THREE.Group(); holo.position.y = 0.15; group.add(holo);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.2, 2.2, 20, 1, true), new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.08, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
  beam.position.y = 1.1; holo.add(beam);
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.72, 12), new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, toneMapped: false }));
  torso.position.y = 1.0; holo.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, toneMapped: false }));
  head.position.y = 1.5; holo.add(head);
  const light = new THREE.PointLight(AMBER, 0.6, 7); light.position.y = 1.4; group.add(light);

  const cvs = document.createElement("canvas"); cvs.width = 420; cvs.height = 300;
  const tex = new THREE.CanvasTexture(cvs);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.set(2.9, 2.07, 1); sprite.position.set(0, 2.5, 0); group.add(sprite);
  const sign = helpers.buildNeonSign("QUARTERMASTER", AMBER, 2.3, 0.5);
  sign.position.set(0, 3.5, 0); group.add(sign);

  const INV = [["מצלמות 4K", 128], ["מקליטי DVR", 34], ["כבלים (מ׳)", 1250], ["ספקי כוח", 62]];
  const MAINT = [["טנדר #3 · טיפול 10K׳", "בעוד 4 ימים", "#E4A11A"], ["מנוף · בדיקת בטיחות", "השבוע", "#ff6b6b"]];
  const draw = () => {
    const g = cvs.getContext("2d");
    g.clearRect(0, 0, 420, 300);
    const rr = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
    g.fillStyle = "rgba(10,8,3,0.85)"; rr(6, 6, 408, 288, 18); g.fill();
    g.strokeStyle = "rgba(228,161,26,0.6)"; g.lineWidth = 3; g.stroke();
    g.textAlign = "right"; g.fillStyle = "#E4A11A"; g.font = "700 24px system-ui"; g.fillText("📦 מלאי חומרה", 398, 42);
    g.font = "600 20px system-ui";
    INV.forEach((row, i) => { const y = 84 + i * 34; g.fillStyle = "#d8e2ee"; g.fillText(row[0], 300, y); g.fillStyle = "#8fe0c0"; g.fillText(String(row[1]), 398, y); });
    g.fillStyle = "#E4A11A"; g.font = "700 20px system-ui"; g.fillText("🔧 תחזוקת צי", 398, 236);
    g.font = "600 16px system-ui";
    MAINT.forEach((row, i) => { const y = 262 + i * 22; g.fillStyle = row[2]; g.fillText(`${row[1]} · ${row[0]}`, 398, y); });
    tex.needsUpdate = true;
  };
  draw();

  let t = 0;
  return {
    update(dt) {
      t += dt;
      holo.position.y = 0.15 + Math.sin(t * 1.2) * 0.06;
      holo.rotation.y += dt * 0.5;
      torso.material.opacity = 0.45 + 0.15 * Math.abs(Math.sin(t * 3));
      padRing.material.color.setHSL(0.11, 0.85, 0.5 + 0.12 * Math.sin(t * 2));
      light.intensity = 0.5 + 0.2 * Math.sin(t * 2.5);
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
