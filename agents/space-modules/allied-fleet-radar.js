// ── Module 14 · Allied Fleet Radar ─────────────────────────────────────────
//
// A compact sub-radar beside the main market radar showing friendly green
// ships flying formation alongside the cruiser — secondary portfolios / allied
// market movers. A wireframe dome with a rotating sweep, green ship blips
// orbiting inside on gentle bezier-ish loops, and a nameplate.
export function createAlliedFleetRadar(ctx) {
  const { THREE, scene, markDynamic, helpers } = ctx;
  const GREEN = 0x3fd79a;
  const SPOT = { x: -27, z: 19 };
  const R = 2.2;
  const group = new THREE.Group();
  group.position.set(SPOT.x, 3.0, SPOT.z);
  scene.add(group);
  markDynamic(group);
  ctx.obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.2 });

  // pedestal down to the floor + base ring
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 3.0, 10), new THREE.MeshStandardMaterial({ color: 0x141a24, metalness: 0.6, roughness: 0.4 }));
  stalk.position.y = -1.5; group.add(stalk);
  const baseRing = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.03, 8, 40), new THREE.MeshBasicMaterial({ color: GREEN, toneMapped: false }));
  baseRing.rotation.x = Math.PI / 2; baseRing.position.y = -2.98; group.add(baseRing);

  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(R, 2), new THREE.MeshBasicMaterial({ color: GREEN, wireframe: true, transparent: true, opacity: 0.28, toneMapped: false }));
  group.add(shell);
  const equator = new THREE.Mesh(new THREE.TorusGeometry(R, 0.02, 8, 60), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, toneMapped: false }));
  equator.rotation.x = Math.PI / 2; group.add(equator);
  const sweep = new THREE.Mesh(new THREE.CircleGeometry(R * 0.98, 32, 0, Math.PI * 0.5), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.12, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
  sweep.rotation.x = -Math.PI / 2; group.add(sweep);
  const light = new THREE.PointLight(GREEN, 0.4, 6); group.add(light);
  const sign = helpers.buildNeonSign("ALLIED FLEET", GREEN, 2.0, 0.42);
  sign.position.set(0, 2.9, 0); group.add(sign);

  // Friendly ship blips — little green darts on their own orbital loops.
  const shipGeo = new THREE.ConeGeometry(0.09, 0.34, 5);
  const ships = [];
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(shipGeo, new THREE.MeshBasicMaterial({ color: GREEN, toneMapped: false }));
    group.add(m);
    ships.push({ mesh: m, r: 0.7 + Math.random() * 1.2, incl: (Math.random() - 0.5) * 1.4, phase: Math.random() * Math.PI * 2, speed: 0.4 + Math.random() * 0.5 });
  }
  const prev = new THREE.Vector3();
  let t = 0;
  return {
    update(dt) {
      t += dt;
      shell.rotation.y += dt * 0.15;
      sweep.rotation.z += dt * 1.4;
      equator.material.opacity = 0.45 + 0.25 * Math.abs(Math.sin(t * 1.5));
      for (const s of ships) {
        const a = s.phase + t * s.speed;
        prev.copy(s.mesh.position);
        s.mesh.position.set(Math.cos(a) * s.r, Math.sin(a) * s.r * Math.sin(s.incl), Math.sin(a) * s.r * Math.cos(s.incl));
        s.mesh.lookAt(s.mesh.position.clone().add(s.mesh.position.clone().sub(prev)));
      }
      light.intensity = 0.35 + 0.15 * Math.sin(t * 2);
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
