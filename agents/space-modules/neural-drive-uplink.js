// ── NEURAL-QUANTUM OVERRIDE · Phase 4 — Neural-Drive Vehicle Uplink ────────
//
// A "Neural-Drive" installation on the main deck: a hovering holographic
// Chery Tiggo 7 silhouette gliding a few inches above a neon smart-grid
// highway that scrolls out to the horizon, plus a 180° AR HUD arc that
// materializes around it. It idles gently and springs to full hover-magnetic
// life whenever liveRef.inVehicle is true (the shared seat flag that flips
// when the player enters the drivable Tiggo).
//
// Honest scope note: the actually-drivable Tiggo lives inside HangarOverlay —
// a SEPARATE Three.js scene the space-module registry can't reach — so this
// can't literally wrap the in-cabin driving view. It's the closest main-deck
// representation; a true in-vision AR HUD would need a change inside
// HangarOverlay's own vehicle-seated camera path.
export function createNeuralDriveUplink(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles } = ctx;
  const SPOT = { x: -2, z: 24 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 2.4 });

  const neon = 0x33e0ff, magenta = 0xff3fae;

  // ── Scrolling neon smart-grid highway (canvas texture, mobile-safe) ──
  const cvs = document.createElement("canvas"); cvs.width = 128; cvs.height = 256; const g = cvs.getContext("2d");
  const paintGrid = () => {
    g.fillStyle = "#04070f"; g.fillRect(0, 0, 128, 256);
    g.strokeStyle = "rgba(51,224,255,0.85)"; g.lineWidth = 3;
    for (let i = 0; i <= 4; i++) { const x = (i / 4) * 128; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); }
    g.strokeStyle = "rgba(51,224,255,0.5)"; g.lineWidth = 2;
    for (let i = 0; i <= 8; i++) { const y = (i / 8) * 256; g.beginPath(); g.moveTo(0, y); g.lineTo(128, y); g.stroke(); }
  };
  paintGrid();
  const tex = new THREE.CanvasTexture(cvs); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, 4);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 12), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0.03, -3); group.add(road);

  // ── Hovering holographic Tiggo silhouette (wireframe blocks) ──
  const car = new THREE.Group(); car.position.set(0, 0.7, 0); group.add(car);
  const bodyMat = new THREE.MeshBasicMaterial({ color: neon, wireframe: true, transparent: true, opacity: 0.7, toneMapped: false });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.42, 2.1), bodyMat); body.position.y = 0.28; car.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.36, 1.1), bodyMat); cabin.position.set(0, 0.6, -0.1); car.add(cabin);
  const glowSkin = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.44, 2.12), new THREE.MeshBasicMaterial({ color: neon, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false }));
  glowSkin.position.y = 0.28; car.add(glowSkin);
  // Hover-magnetic cushion — a glowing disc + halo under the car.
  const cushion = new THREE.Mesh(new THREE.CircleGeometry(1.0, 32), new THREE.MeshBasicMaterial({ color: magenta, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false, depthWrite: false }));
  cushion.rotation.x = -Math.PI / 2; cushion.position.y = -0.55; car.add(cushion);

  // ── 180° AR HUD arc (half-cylinder wrapping the installation) ──
  const hudCvs = document.createElement("canvas"); hudCvs.width = 1024; hudCvs.height = 128; const hg = hudCvs.getContext("2d"); const hudTex = new THREE.CanvasTexture(hudCvs);
  const hud = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 2.6, 1.1, 48, 1, true, -Math.PI / 2, Math.PI),
    new THREE.MeshBasicMaterial({ map: hudTex, transparent: true, opacity: 0, side: THREE.BackSide, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false }),
  );
  hud.position.set(0, 1.5, 0); group.add(hud);
  const drawHud = (speed, batt) => {
    hg.clearRect(0, 0, 1024, 128);
    hg.strokeStyle = "rgba(51,224,255,0.9)"; hg.lineWidth = 3; hg.beginPath(); hg.moveTo(0, 100); hg.lineTo(1024, 100); hg.stroke();
    hg.fillStyle = "#33e0ff"; hg.font = "800 46px system-ui"; hg.textAlign = "center";
    hg.fillText(Math.round(speed) + " KM/H", 512, 60);
    hg.font = "700 26px system-ui"; hg.fillStyle = "#ff8fd0";
    hg.fillText("◄ NEURAL-LINK ACTIVE ►", 512, 92);
    hg.textAlign = "left"; hg.fillStyle = "#8fe0ff"; hg.font = "700 26px system-ui"; hg.fillText("PHEV " + Math.round(batt) + "%", 40, 60);
    hg.textAlign = "right"; hg.fillText("HOVER-MAG", 984, 60);
    hudTex.needsUpdate = true;
  };

  const sign = helpers.buildNeonSign("NEURAL-DRIVE UPLINK", neon, 2.6, 0.46); sign.position.set(0, 2.55, 0); group.add(sign);

  let t = 0, live = 0, hudT = 0;
  return {
    update(dt) {
      t += dt;
      const active = !!liveRef.current.inVehicle;
      live += ((active ? 1 : 0) - live) * Math.min(1, dt * 3);
      const speedMul = 0.5 + live * 2.5;
      tex.offset.y = (tex.offset.y - dt * 0.35 * speedMul) % 1;
      // Hover-magnetic lift + bob rises with the link level.
      car.position.y = 0.55 + live * 0.35 + Math.sin(t * 2) * (0.03 + live * 0.05);
      car.rotation.y = Math.sin(t * 0.4) * 0.05;
      cushion.material.opacity = 0.25 + live * 0.4 + Math.sin(t * 6) * 0.05 * live;
      cushion.scale.setScalar(1 + live * 0.3 + Math.sin(t * 5) * 0.05);
      glowSkin.material.opacity = 0.1 + live * 0.25;
      bodyMat.opacity = 0.55 + 0.2 * Math.sin(t * 1.5) + live * 0.2;
      hud.material.opacity = live * 0.85;
      hud.rotation.y = Math.sin(t * 0.15) * 0.05;
      road.material.opacity = 0.5 + live * 0.4;
      hudT += dt;
      if (hudT > 0.2) { hudT = 0; const batt = liveRef.current.phevBattery != null ? liveRef.current.phevBattery : 72; drawHud(live * (80 + Math.sin(t) * 20), batt); }
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
