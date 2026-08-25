// ── Audio-Neural Walls · Sector 4 · Module 17 — CFO's Digital Safe ─────────
//
// A detailed metallic vault door beside ראובן's crew hologram (anchored at
// the same {-27, 1} spot the Crew Holograms module uses) — the ring of gears
// rotates and the door glows brighter for a few seconds whenever bizData
// changes (the closest observable proxy for "financial data exported").
// ראובן's own model/hologram is untouched.
export function createCfoDigitalSafe(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const SPOT = { x: -24.4, z: 1 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);

  const doorFrame = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.09, 12, 32), new THREE.MeshStandardMaterial({ color: 0x8a7638, metalness: 0.85, roughness: 0.25 }));
  doorFrame.position.y = 1.5; group.add(doorFrame);
  const door = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.14, 32), new THREE.MeshStandardMaterial({ color: 0x1c1f26, metalness: 0.8, roughness: 0.3 }));
  door.rotation.x = Math.PI / 2; door.position.set(0, 1.5, 0.02); group.add(door);
  const gearRing = new THREE.Group(); gearRing.position.set(0, 1.5, 0.1); group.add(gearRing);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const cog = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 8), new THREE.MeshStandardMaterial({ color: 0xE4BC63, metalness: 0.8, roughness: 0.25, emissive: 0x2a1c04, emissiveIntensity: 0.4 })); cog.rotation.x = Math.PI / 2; cog.position.set(Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0); gearRing.add(cog); }
  const spokeRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.02, 8, 20), new THREE.MeshStandardMaterial({ color: 0xE4BC63, metalness: 0.85, roughness: 0.2 }));
  gearRing.add(spokeRing);
  const seam = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.012, 6, 32), new THREE.MeshBasicMaterial({ color: 0xE4BC63, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, toneMapped: false }));
  seam.position.set(0, 1.5, 0.1); group.add(seam);
  const sign = helpers.buildNeonSign("CFO · DIGITAL SAFE", 0xE4BC63, 2.0, 0.36); sign.position.set(0, 2.35, 0); group.add(sign);

  let t = 0, unlocked = 0, lastBiz = null;
  return {
    update(dt) {
      t += dt;
      const biz = liveRef.current.bizData;
      const sig = biz ? JSON.stringify(Object.values(biz).slice(0, 3)) : null;
      if (sig && sig !== lastBiz) { lastBiz = sig; unlocked = 3; }
      unlocked = Math.max(0, unlocked - dt);
      const active = unlocked > 0;
      gearRing.rotation.z += dt * (active ? 2.4 : 0.3);
      seam.material.opacity = active ? (0.5 + 0.4 * Math.abs(Math.sin(t * 8))) : 0.25 + 0.1 * Math.sin(t * 1.5);
      gearRing.children.forEach((c) => { if (c.material.emissiveIntensity !== undefined) c.material.emissiveIntensity = active ? 0.9 : 0.4; });
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
