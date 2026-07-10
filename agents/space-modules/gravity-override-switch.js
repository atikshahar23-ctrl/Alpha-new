// ── Audio-Neural Walls · Sector 6 · Module 28 — Gravity Override Switch ────
//
// A physical-looking massive lever on the workshop wall. Pulling it (E when
// nearby, or liveRef.triggerGravityOverride()) sets liveRef.zeroGravity for a
// spell — the same flag the existing Zero-G Anomaly Button (module 53) reads,
// so both switches drive the identical weightless effect consistently.
export function createGravityOverrideSwitch(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles } = ctx;
  const SPOT = { x: 30, z: -19 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 0.7 });

  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.1), new THREE.MeshStandardMaterial({ color: 0x1a1d24, metalness: 0.6, roughness: 0.4 }));
  plate.position.set(0, 1.4, 0); group.add(plate);
  const pivot = new THREE.Group(); pivot.position.set(0, 1.15, 0.08); group.add(pivot);
  const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.55, 10), new THREE.MeshStandardMaterial({ color: 0xff4433, metalness: 0.5, roughness: 0.35, emissive: 0x4a0f08, emissiveIntensity: 0.4 }));
  lever.geometry.translate(0, 0.27, 0); pivot.add(lever);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), new THREE.MeshStandardMaterial({ color: 0xff4433, metalness: 0.4, roughness: 0.3, emissive: 0x4a0f08, emissiveIntensity: 0.5 }));
  knob.position.y = 0.55; pivot.add(knob);
  const sign = helpers.buildNeonSign("GRAVITY OVERRIDE", 0xff4433, 2.0, 0.36); sign.position.set(0, 2.05, 0); group.add(sign);

  let t = 0, pull = 0, cooldown = 0;
  const trigger = () => { if (cooldown <= 0) { pull = 1; cooldown = 20; liveRef.current.zeroGravity = true; setTimeout(() => { liveRef.current.zeroGravity = false; }, 8000); } };
  liveRef.current.triggerGravityOverride = trigger;
  return {
    update(dt) {
      t += dt; cooldown -= dt;
      pivot.rotation.z += ((pull > 0.5 ? -0.6 : 0) - pivot.rotation.z) * Math.min(1, dt * 4);
      pull = Math.max(0, pull - dt * 0.15);
      knob.material.emissiveIntensity = 0.4 + (liveRef.current.zeroGravity ? 0.5 * Math.abs(Math.sin(t * 6)) : 0);
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
