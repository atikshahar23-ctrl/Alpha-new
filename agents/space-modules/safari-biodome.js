// ── Module 32 · The Safari Bio-Dome (Ori's Zone) ───────────────────────────
//
// An ecological biodome under a glass sphere: an instanced grass field, a few
// stylised creatures, and a little robotic companion playing hide-and-seek —
// the companion drifts toward one creature, it "hides" (ducks into the grass),
// then a new one is sought. A soft, living pocket of nature on the deck.
export function createSafariBiodome(ctx) {
  const { THREE, scene, markDynamic, helpers, obstacles } = ctx;
  const SPOT = { x: -34, z: 18 };
  const R = 2.4;
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 2.3 });

  const floor = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.2, 28), new THREE.MeshStandardMaterial({ color: 0x2c5a2e, roughness: 0.95 }));
  floor.position.y = 0.1; group.add(floor);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R, 26, 18, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0xbfe3ff, transparent: true, opacity: 0.12, roughness: 0.05, transmission: 0.7, side: THREE.DoubleSide }));
  dome.position.y = 0.2; group.add(dome);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.04, 8, 48), new THREE.MeshBasicMaterial({ color: 0x8fffcf, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, toneMapped: false }));
  rim.rotation.x = Math.PI / 2; rim.position.y = 0.2; group.add(rim);

  // Instanced grass blades.
  const G = 300;
  const blade = new THREE.PlaneGeometry(0.06, 0.3); blade.translate(0, 0.15, 0);
  const grass = new THREE.InstancedMesh(blade, new THREE.MeshStandardMaterial({ color: 0x4a8a3e, roughness: 0.9, side: THREE.DoubleSide }), G);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < G; i++) { const a = Math.random() * Math.PI * 2, r = Math.random() * (R - 0.3); dummy.position.set(Math.cos(a) * r, 0.2, Math.sin(a) * r); dummy.rotation.y = Math.random() * Math.PI; dummy.scale.setScalar(0.7 + Math.random() * 0.8); dummy.updateMatrix(); grass.setMatrixAt(i, dummy.matrix); }
  grass.instanceMatrix.needsUpdate = true; group.add(grass);

  // Stylised creatures (colored blobs with ears) + the companion.
  const COLS = [0xffe066, 0xff8fb0, 0x8fd0ff, 0xb0ff8f];
  const critters = COLS.map((c, i) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 })); g.add(body);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 6), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 })); ear.position.set(0.1, 0.22, 0); g.add(ear);
    const a = (i / COLS.length) * Math.PI * 2; g.position.set(Math.cos(a) * 1.4, 0.42, Math.sin(a) * 1.4);
    group.add(g); return { g, home: g.position.clone(), hidden: 0 };
  });
  const comp = new THREE.Group(); group.add(comp);
  const cbody = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 12), new THREE.MeshStandardMaterial({ color: 0xf0f4fa, metalness: 0.5, roughness: 0.3, emissive: 0x2a4a7a, emissiveIntensity: 0.3 })); comp.add(cbody);
  const ceye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, toneMapped: false })); ceye.position.z = 0.18; comp.add(ceye);
  const sign = helpers.buildNeonSign("SAFARI BIO-DOME", 0x8fffcf, 2.2, 0.42); sign.position.set(0, 3.0, 0); group.add(sign);

  let t = 0, seek = 0, seekT = 0;
  return {
    update(dt) {
      t += dt;
      // Companion seeks a critter; on reaching it, the critter hides.
      const target = critters[seek];
      const to = target.g.position;
      comp.position.lerp(new THREE.Vector3(to.x, 0.5 + Math.sin(t * 3) * 0.1, to.z), Math.min(1, dt * 1.5));
      comp.lookAt(to.x, comp.position.y, to.z);
      seekT += dt;
      if (comp.position.distanceTo(to) < 0.4 || seekT > 5) {
        target.hidden = 1; seek = (seek + 1) % critters.length; seekT = 0;
      }
      critters.forEach((c) => {
        c.hidden = Math.max(0, c.hidden - dt * 0.4);
        c.g.position.y = c.home.y - c.hidden * 0.35; // duck into the grass
        c.g.scale.setScalar(1 - c.hidden * 0.4);
        c.g.position.x = c.home.x + Math.sin(t * 1.2 + c.home.x) * 0.05;
      });
      rim.material.opacity = 0.5 + 0.15 * Math.sin(t * 1.5);
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
