// ── Module 54 · The "Alpha" Awakening ──────────────────────────────────────
//
// A ceremonial system event, fired ONLY on demand (liveRef.triggerAlphaAwakening()
// or the on-screen ritual UI) — never on a timer, so it can't strand the view in
// white. On trigger: a blinding white light blooms over the screen, a robotic
// voice announces "Alpha Protocol Initiated", liveRef.alphaProtocol latches on,
// and a ring of ascending light glyphs rises as the deck "upgrades". The white
// flash always eases fully back to transparent — the screen never stays white.
export function createAlphaAwakening(ctx) {
  const { THREE, scene, camera, markDynamic, helpers, liveRef } = ctx;

  // Full-frame white flash quad on the camera.
  const flashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: false });
  const flash = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), flashMat);
  flash.frustumCulled = false; flash.renderOrder = 997; flash.position.z = -0.5;
  camera.add(flash);

  // A rising ring of glyphs at deck centre.
  const glyphs = new THREE.Group(); glyphs.position.set(0, 0, 0); scene.add(glyphs); markDynamic(glyphs);
  const ring = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const g = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.9), new THREE.MeshBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
    g.position.set(Math.cos(a) * 4, 0.5, Math.sin(a) * 4); g.lookAt(0, 0.5, 0); glyphs.add(g); ring.push(g);
  }
  const sign = helpers.buildNeonSign("ALPHA PROTOCOL", 0xffffff, 3.0, 0.5); sign.position.set(0, 5, 0); sign.material && (sign.visible = false); glyphs.add(sign);

  const speak = () => {
    try { if (window.speechSynthesis && !liveRef.current.muteVoice) { const u = new SpeechSynthesisUtterance("Alpha Protocol Initiated"); u.rate = 0.85; u.pitch = 0.6; window.speechSynthesis.speak(u); } } catch { /* ignore */ }
  };

  let phase = 0, pt = 0; // 0 idle, 1 flash-in, 2 hold/rise, 3 flash-out
  const trigger = () => { if (phase === 0) { phase = 1; pt = 0; liveRef.current.alphaProtocol = true; sign.visible = true; speak(); } };
  liveRef.current.triggerAlphaAwakening = trigger;

  let t = 0;
  return {
    update(dt) {
      t += dt;
      if (phase === 1) { pt += dt; flashMat.opacity = Math.min(1, pt / 0.6); if (pt >= 0.6) { phase = 2; pt = 0; } }
      else if (phase === 2) {
        pt += dt; flashMat.opacity = Math.max(0.25, 1 - pt / 1.2);
        ring.forEach((g, i) => { g.material.opacity = Math.min(0.9, pt) * (0.5 + 0.5 * Math.sin(t * 4 + i)); g.position.y = 0.5 + Math.min(3, pt * 2) + Math.sin(t * 2 + i) * 0.1; });
        if (pt >= 2.4) { phase = 3; pt = 0; }
      } else if (phase === 3) {
        pt += dt; flashMat.opacity = Math.max(0, 0.25 * (1 - pt / 1.0));
        ring.forEach((g) => { g.material.opacity = Math.max(0, g.material.opacity - dt * 0.8); });
        if (pt >= 1.0) { phase = 0; flashMat.opacity = 0; liveRef.current.alphaProtocol = false; sign.visible = false; ring.forEach((g) => { g.position.y = 0.5; }); }
      }
    },
    dispose() {
      liveRef.current.alphaProtocol = false;
      if (flash.parent) flash.parent.remove(flash);
      flash.geometry.dispose(); flashMat.dispose();
      scene.remove(glyphs);
      glyphs.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
