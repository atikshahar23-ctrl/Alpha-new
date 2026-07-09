// ── Module 33 · Caller-ID Interceptor (Gil Relay) ──────────────────────────
//
// A massive external relay satellite hangs off the ship's flank. When a call
// comes in (fired periodically, or via liveRef.triggerCallerId()) it swings to
// face the hull and fires a scanning beam at the deck; a holographic caller-ID
// card materialises mid-air with the intercepted profile, then fades.
export function createCallerIdInterceptor(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;

  // The satellite, out in space off the starboard side.
  const sat = new THREE.Group();
  sat.position.set(46, 16, -8);
  scene.add(sat); markDynamic(sat);
  const core = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.6), new THREE.MeshStandardMaterial({ color: 0x2a3242, metalness: 0.7, roughness: 0.35, emissive: 0x101828, emissiveIntensity: 0.3 }));
  sat.add(core);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(1.6, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: 0xcfd8e6, metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide, emissive: 0x11314a, emissiveIntensity: 0.2 }));
  dish.rotation.x = -Math.PI * 0.4; dish.position.set(0, 0.4, 0.9); sat.add(dish);
  [[-1, 0], [1, 0]].forEach(([s]) => { const panel = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.05, 1.2), new THREE.MeshBasicMaterial({ color: 0x2e7bff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, toneMapped: false })); panel.position.set(s * 2.6, 0, 0); sat.add(panel); });

  // Scanning beam + holographic caller card (near the deck).
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.4, 1, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false }));
  scene.add(beam); markDynamic(beam);
  const CARD_POS = new THREE.Vector3(-12, 2.4, 14);
  const cvs = document.createElement("canvas"); cvs.width = 360; cvs.height = 200; const tex = new THREE.CanvasTexture(cvs);
  const card = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false })); card.scale.set(2.6, 1.44, 1); card.position.copy(CARD_POS); scene.add(card); markDynamic(card);

  const CALLERS = [["דוד לוי · אשדוד", "052-XXX-4471", "לקוח פוטנציאלי"], ["רונית כהן · ב״ש", "054-XXX-8820", "חוזה מתחדש"], ["משה אברהם · ק. גת", "050-XXX-1193", "פנייה חדשה"]];
  const drawCard = (c) => {
    const g = cvs.getContext("2d"); g.clearRect(0, 0, 360, 200);
    g.fillStyle = "rgba(6,14,26,0.88)"; g.fillRect(0, 0, 360, 200); g.strokeStyle = "rgba(46,230,255,0.7)"; g.lineWidth = 3; g.strokeRect(4, 4, 352, 192);
    g.textAlign = "right"; g.fillStyle = "#2ee6ff"; g.font = "700 22px system-ui"; g.fillText("📡 יירוט שיחה", 340, 40);
    g.fillStyle = "#fff"; g.font = "700 26px system-ui"; g.fillText(c[0], 340, 88);
    g.fillStyle = "#8fe0c0"; g.font = "600 22px system-ui"; g.fillText(c[1], 340, 128);
    g.fillStyle = "#E4BC63"; g.font = "600 20px system-ui"; g.fillText(c[2], 340, 168);
    tex.needsUpdate = true;
  };

  const CORE = new THREE.Vector3(0, 3, 4);
  const up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3();
  let t = 0, active = 0, timer = 12;
  const trigger = () => { if (active <= 0) { active = 4; drawCard(CALLERS[Math.floor(Math.random() * CALLERS.length)]); } };
  liveRef.current.triggerCallerId = trigger;
  return {
    update(dt) {
      t += dt;
      sat.rotation.y = -0.4 + Math.sin(t * 0.3) * 0.2;
      timer -= dt; if (timer <= 0) { trigger(); timer = 18 + Math.random() * 14; }
      if (active > 0) {
        active -= dt;
        const on = Math.min(1, active) * Math.min(1, (4 - active) * 2);
        dir.copy(CARD_POS).sub(sat.position); const len = dir.length(); dir.normalize();
        beam.position.copy(sat.position).addScaledVector(dir, len / 2);
        beam.quaternion.setFromUnitVectors(up, dir); beam.scale.set(1, len, 1);
        beam.material.opacity = on * (0.5 + 0.3 * Math.abs(Math.sin(t * 20)));
        card.material.opacity = on; card.position.y = 2.4 + Math.sin(t * 2) * 0.05;
      } else { beam.material.opacity = 0; card.material.opacity = Math.max(0, card.material.opacity - dt * 2); }
    },
    dispose() {
      [sat, beam, card].forEach((o) => scene.remove(o));
      sat.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
      beam.geometry.dispose(); beam.material.dispose(); if (card.material.map) card.material.map.dispose(); card.material.dispose();
    },
  };
}
