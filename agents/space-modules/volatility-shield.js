// ── Module 44 · Volatility Deflector Shields ───────────────────────────────
//
// A guardian console that watches market volatility (the spread of 24h changes
// across liveRef.marketRows stands in for the VIX). When volatility spikes, a
// hexagonal yellow deflector dome slams up over the console and a scrolling
// "VOLATILITY LOCK" warning band lights — systems held safe behind the shield —
// then lowers as the market calms.
export function createVolatilityShield(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles } = ctx;
  const SPOT = { x: 20, z: 8 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.8 });

  const YEL = 0xffcc33;
  const console_ = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.9, 6), new THREE.MeshStandardMaterial({ color: 0x161a10, metalness: 0.6, roughness: 0.4, emissive: 0x1a1500, emissiveIntensity: 0.25 }));
  console_.position.y = 0.45; group.add(console_);
  const cvs = document.createElement("canvas"); cvs.width = 256; cvs.height = 128; const tex = new THREE.CanvasTexture(cvs);
  const readout = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.65), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
  readout.position.set(0, 1.1, 0.55); group.add(readout);

  // Hex deflector dome (icosa wireframe + faint fill), scaled up when engaged.
  const domeGeo = new THREE.IcosahedronGeometry(1.9, 1);
  const dome = new THREE.Mesh(domeGeo, new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  dome.position.y = 1.0; group.add(dome);
  const wire = new THREE.LineSegments(new THREE.EdgesGeometry(domeGeo), new THREE.LineBasicMaterial({ color: YEL, transparent: true, opacity: 0, toneMapped: false }));
  wire.position.y = 1.0; group.add(wire);
  const sign = helpers.buildNeonSign("DEFLECTOR SHIELD", YEL, 2.2, 0.42); sign.position.set(0, 3.0, 0); group.add(sign);

  const draw = (vix, locked) => {
    const g = cvs.getContext("2d"); g.clearRect(0, 0, 256, 128);
    g.fillStyle = locked ? "rgba(40,32,0,0.9)" : "rgba(10,14,8,0.85)"; g.fillRect(0, 0, 256, 128);
    g.strokeStyle = locked ? "rgba(255,204,51,0.9)" : "rgba(120,140,90,0.6)"; g.lineWidth = 3; g.strokeRect(3, 3, 250, 122);
    g.textAlign = "center"; g.fillStyle = locked ? "#ffcc33" : "#9fb080"; g.font = "800 22px system-ui";
    g.fillText(locked ? "⚠ VOLATILITY LOCK" : "MARKET STABLE", 128, 40);
    g.fillStyle = "#fff"; g.font = "700 30px system-ui"; g.fillText("VIX " + vix.toFixed(1), 128, 82);
    g.fillStyle = locked ? "#ffe066" : "#8fe0a0"; g.font = "600 15px system-ui"; g.fillText(locked ? "מערכות נעולות מאחורי המגן" : "מגן במצב המתנה", 128, 110);
    tex.needsUpdate = true;
  };

  let t = 0, engage = 0, drawT = 99;
  return {
    update(dt) {
      t += dt;
      const rows = liveRef.current.marketRows;
      let vix = 14;
      if (rows && rows.length) { let mn = 99, mx = -99, s = 0; rows.forEach((r) => { const c = r.chg || 0; mn = Math.min(mn, c); mx = Math.max(mx, c); s += Math.abs(c); }); vix = (mx - mn) * 3 + (s / rows.length) * 2; }
      const locked = vix > 28 || liveRef.current.redAlert;
      engage += ((locked ? 1 : 0) - engage) * Math.min(1, dt * 1.4);
      dome.scale.setScalar(0.5 + engage * 0.6);
      wire.scale.copy(dome.scale);
      dome.material.opacity = engage * (0.06 + 0.03 * Math.sin(t * 6));
      wire.material.opacity = engage * (0.5 + 0.3 * Math.abs(Math.sin(t * 4)));
      wire.rotation.y += dt * 0.3;
      console_.material.emissiveIntensity = 0.25 + engage * 0.4 * Math.abs(Math.sin(t * 8));
      drawT += dt; if (drawT > 0.4) { drawT = 0; draw(vix, engage > 0.5); }
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
