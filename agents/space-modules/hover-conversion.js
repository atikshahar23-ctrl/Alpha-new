// ── Module 38 · Hover-Conversion Demo Pad ──────────────────────────────────
//
// A display pad where a demo craft cycles between grounded (wheels out) and
// hover mode (wheels fold inward, blue downward thrust jets fire, the body
// lifts and drifts frictionlessly). Mirrors the vehicle's 'Y' hover-conversion;
// exposes liveRef.hoverMode so the real drive system can read the same state.
export function createHoverConversion(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles } = ctx;
  const SPOT = { x: 34, z: -6 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.6 });

  const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.14, 32), new THREE.MeshStandardMaterial({ color: 0x10161f, metalness: 0.6, roughness: 0.4, emissive: 0x0a1830, emissiveIntensity: 0.3 }));
  pad.position.y = 0.07; group.add(pad);
  const padRing = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.04, 8, 48), new THREE.MeshBasicMaterial({ color: 0x2e7bff, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, toneMapped: false }));
  padRing.rotation.x = Math.PI / 2; padRing.position.y = 0.14; group.add(padRing);

  // Craft body + four wheels + four thrust jets.
  const craft = new THREE.Group(); craft.position.y = 0.55; group.add(craft);
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.34, 0.62), new THREE.MeshStandardMaterial({ color: 0xdfe6ee, metalness: 0.8, roughness: 0.25, emissive: 0x12233a, emissiveIntensity: 0.2 }));
  craft.add(body);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.24, 0.5), new THREE.MeshPhysicalMaterial({ color: 0x0a1526, metalness: 0.3, roughness: 0.1, transmission: 0.6, transparent: true, opacity: 0.7 }));
  cab.position.set(0.05, 0.26, 0); craft.add(cab);
  const wheelGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.1, 14);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x14181e, roughness: 0.8 });
  const wheels = [[0.42, 0.34], [0.42, -0.34], [-0.42, 0.34], [-0.42, -0.34]].map(([x, z]) => {
    const w = new THREE.Mesh(wheelGeo, wheelMat); w.rotation.x = Math.PI / 2; w.position.set(x, -0.18, z); craft.add(w); return { w, x, z };
  });
  const jetMat = new THREE.MeshBasicMaterial({ color: 0x4aa8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false });
  const jets = [[0.42, 0.34], [0.42, -0.34], [-0.42, 0.34], [-0.42, -0.34]].map(([x, z]) => {
    const j = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.6, 12, 1, true), jetMat.clone()); j.position.set(x, -0.4, z); craft.add(j); return j;
  });
  const sign = helpers.buildNeonSign("HOVER-CONVERSION", 0x4aa8ff, 2.1, 0.4); sign.position.set(0, 2.2, 0); group.add(sign);

  let t = 0, hov = 0; // 0 grounded → 1 hover
  return {
    update(dt) {
      t += dt;
      const wantHover = (Math.sin(t * 0.35) > 0);
      hov += ((wantHover ? 1 : 0) - hov) * Math.min(1, dt * 1.6);
      liveRef.current.hoverMode = hov > 0.5;
      // fold wheels inward + up as hover engages
      wheels.forEach((wl) => { wl.w.position.x = wl.x * (1 - hov * 0.45); wl.w.position.z = wl.z * (1 - hov * 0.45); wl.w.position.y = -0.18 + hov * 0.14; });
      // thrust jets fire, body lifts + drifts frictionlessly
      jets.forEach((j, i) => { j.material.opacity = hov * (0.5 + 0.4 * Math.sin(t * 20 + i)); j.scale.y = 0.6 + hov * (0.8 + 0.3 * Math.sin(t * 15 + i)); j.position.y = -0.4 - hov * 0.2; });
      craft.position.y = 0.55 + hov * 0.35 + hov * 0.05 * Math.sin(t * 3);
      craft.position.x = hov * 0.25 * Math.sin(t * 0.7);
      craft.position.z = hov * 0.25 * Math.cos(t * 0.5);
      craft.rotation.z = hov * 0.06 * Math.sin(t * 1.3);
      craft.rotation.y = hov * 0.4 * Math.sin(t * 0.4);
      padRing.material.color.setHex(hov > 0.5 ? 0x4aa8ff : 0x2e7bff);
      padRing.material.opacity = 0.5 + 0.3 * Math.sin(t * 4) + hov * 0.2;
    },
    dispose() {
      liveRef.current.hoverMode = false;
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
