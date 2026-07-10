// ── Audio-Neural Walls · Sector 6 · Module 26 — Tiggo 7 Diagnostic Mural ───
//
// A flat-shaded schematic of the Chery Tiggo 7 PHEV with a glowing, sparking
// battery section — spec calls this "on the garage wall," but the Hangar is
// a SEPARATE Three.js scene (HangarOverlay) that the space-modules registry
// doesn't wire into, so this lives on a workshop wall in the main deck
// instead as the closest honest equivalent. True Hangar-wall placement would
// need a direct addition inside HangarOverlay's own mount effect.
export function createTiggoDiagnosticMural(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const SPOT = { x: 22, z: -19 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);

  const cvs = document.createElement("canvas"); cvs.width = 420; cvs.height = 260; const g = cvs.getContext("2d"); const tex = new THREE.CanvasTexture(cvs);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.6), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
  panel.position.set(0, 1.5, 0.02); group.add(panel);
  const backing = new THREE.Mesh(new THREE.PlaneGeometry(2.75, 1.75), new THREE.MeshStandardMaterial({ color: 0x0a0e14, roughness: 0.6 }));
  backing.position.set(0, 1.5, -0.02); group.add(backing);
  const sign = helpers.buildNeonSign("TIGGO 7 · DIAGNOSTIC MURAL", 0x2ee6ff, 2.4, 0.4); sign.position.set(0, 2.5, 0); group.add(sign);

  const draw = (spark) => {
    g.clearRect(0, 0, 420, 260); g.fillStyle = "#04060a"; g.fillRect(0, 0, 420, 260);
    g.strokeStyle = "rgba(46,230,255,0.7)"; g.lineWidth = 2;
    g.strokeRect(30, 90, 300, 100); // body outline (simplified schematic)
    g.beginPath(); g.moveTo(30, 90); g.lineTo(60, 55); g.lineTo(280, 55); g.lineTo(330, 90); g.stroke();
    [90, 300].forEach((wx) => { g.beginPath(); g.arc(wx, 200, 28, 0, Math.PI * 2); g.stroke(); });
    // battery pack under the floor pan
    const chg = liveRef.current.phevBattery != null ? liveRef.current.phevBattery / 100 : 0.6;
    g.strokeStyle = "rgba(228,188,99,0.8)"; g.strokeRect(90, 165, 180, 22);
    g.fillStyle = spark ? "#ffe27a" : "#39ff9e"; g.fillRect(92, 167, 176 * chg, 18);
    g.textAlign = "left"; g.fillStyle = "#8fe0c0"; g.font = "700 16px system-ui"; g.fillText("BATTERY " + Math.round(chg * 100) + "%", 90, 155);
    if (spark) { g.fillStyle = "rgba(255,226,122,0.9)"; for (let i = 0; i < 4; i++) g.fillRect(100 + Math.random() * 160, 168 + Math.random() * 14, 2, 2); }
    tex.needsUpdate = true;
  };
  draw(false);

  let drawT = 0, sparkT = 3;
  return {
    update(dt) {
      drawT += dt; sparkT -= dt;
      const spark = sparkT < 0.3;
      if (sparkT <= 0) sparkT = 4 + Math.random() * 4;
      if (drawT > 0.15) { drawT = 0; draw(spark); }
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
