// ── Module 28 · Thermal / Night-Vision Mode ────────────────────────────────
//
// A toggleable thermal overlay (press 'T', or gamepad button 3). A cold-blue
// full-screen veil (a quad parented to the camera) chills the whole deck, and
// bright additive "heat-signature" blooms flare over the hot systems — the
// reactor core, the crypto market radar, and the server racks — so they read
// hot white/red through the cold field. A lightweight approximation of a
// real thermal post-pass that stays inside the pure-module architecture.
export function createThermalVision(ctx) {
  const { THREE, scene, camera, markDynamic, anchors } = ctx;

  // Cold-blue veil, parented to the camera so it always fills the view.
  const veil = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshBasicMaterial({ color: 0x0a2a4a, transparent: true, opacity: 0.0, depthTest: false, depthWrite: false })
  );
  veil.position.set(0, 0, -1); veil.renderOrder = 999;
  camera.add(veil);

  // World-space heat blooms over the hottest systems.
  const heatGroup = new THREE.Group();
  scene.add(heatGroup); markDynamic(heatGroup);
  const glowTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d");
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32); grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(0.4, "rgba(255,120,40,0.8)"); grd.addColorStop(1, "rgba(255,40,20,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
  })();
  const HOT = [
    { x: anchors.sun.x, y: 2.6, z: anchors.sun.z, s: 5 },      // reactor core
    { x: anchors.algoZone.x, y: 3.2, z: anchors.algoZone.z, s: 3.5 }, // market radar
    { x: -33, y: 2.4, z: -18, s: 3 },                          // CCTV / server bank
    { x: 16, y: 1.2, z: -12, s: 2.5 },                         // Tiggo hub
  ];
  const heats = HOT.map((h) => {
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }));
    spr.position.set(h.x, h.y, h.z); spr.scale.setScalar(h.s); heatGroup.add(spr);
    return { spr, s: h.s };
  });

  let on = false, mix = 0, t = 0, prevBtn = false;
  const onKey = (e) => { if ((e.key || "").toLowerCase() === "t") on = !on; };
  window.addEventListener("keydown", onKey);

  return {
    update(dt) {
      t += dt;
      const gp = (typeof navigator !== "undefined" && navigator.getGamepads) ? navigator.getGamepads()[0] : null;
      const btn = gp && gp.buttons[3] && gp.buttons[3].pressed;
      if (btn && !prevBtn) on = !on; prevBtn = btn;
      mix += ((on ? 1 : 0) - mix) * Math.min(1, dt * 6);
      veil.material.opacity = mix * 0.55;
      const flare = 0.6 + 0.4 * Math.sin(t * 6);
      heats.forEach((h) => { h.spr.material.opacity = mix * flare; h.spr.scale.setScalar(h.s * (1 + mix * 0.1 * Math.sin(t * 4))); });
    },
    dispose() {
      window.removeEventListener("keydown", onKey);
      if (veil.parent) veil.parent.remove(veil);
      veil.geometry.dispose(); veil.material.dispose();
      scene.remove(heatGroup);
      heatGroup.traverse((o) => { if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
    },
  };
}
