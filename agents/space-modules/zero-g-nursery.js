// ── Module 16 · Zero-G Nursery Dome ────────────────────────────────────────
//
// A transparent glass sphere for the child. A little robotic companion floats
// freely inside, and glowing 3D stars drift and bounce off the dome walls in
// zero-G. (Gamepad South button gives the stars a playful shove — the seed of
// the catch-the-stars puzzle.)
export function createZeroGNursery(ctx) {
  const { THREE, scene, markDynamic, helpers, obstacles } = ctx;
  const SPOT = { x: 34, z: 4 };
  const R = 2.0;
  const group = new THREE.Group();
  group.position.set(SPOT.x, 1.6, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.9 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.3, 24), new THREE.MeshStandardMaterial({ color: 0x121722, metalness: 0.5, roughness: 0.4 }));
  base.position.y = -1.75; group.add(base);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R, 28, 20), new THREE.MeshPhysicalMaterial({ color: 0xbfe3ff, transparent: true, opacity: 0.12, roughness: 0.05, metalness: 0, transmission: 0.7, side: THREE.DoubleSide }));
  group.add(dome);
  const domeRim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.04, 8, 48), new THREE.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, toneMapped: false }));
  domeRim.rotation.x = Math.PI / 2; group.add(domeRim);
  const light = new THREE.PointLight(0xbfe3ff, 0.6, 8); group.add(light);

  // Floating robot companion.
  const bot = new THREE.Group(); group.add(bot);
  const bbody = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 14), new THREE.MeshStandardMaterial({ color: 0xf0f4fa, metalness: 0.5, roughness: 0.3, emissive: 0x3a5a8a, emissiveIntensity: 0.3 })); bot.add(bbody);
  const beye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, toneMapped: false })); beye.position.set(0, 0.05, 0.25); bot.add(beye);
  const bant = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff6bd0, toneMapped: false })); bant.position.y = 0.34; bot.add(bant);

  // Bouncing glowing stars.
  const stars = [];
  const starGeo = new THREE.IcosahedronGeometry(0.13, 0);
  const COLORS = [0xffe066, 0xff6bd0, 0x6fe0c8, 0x8fd0ff];
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(starGeo, new THREE.MeshBasicMaterial({ color: COLORS[i % COLORS.length], toneMapped: false }));
    group.add(m);
    stars.push({ mesh: m, p: new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2), v: new THREE.Vector3((Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6) });
  }
  const sign = helpers.buildNeonSign("ZERO-G NURSERY", 0xff9ad8, 2.2, 0.42);
  sign.position.set(0, 2.6, 0); group.add(sign);

  let t = 0, botA = 0;
  return {
    update(dt) {
      t += dt; botA += dt * 0.6;
      bot.position.set(Math.cos(botA) * 1.0, Math.sin(t * 0.9) * 0.8, Math.sin(botA) * 1.0);
      bot.rotation.y += dt * 1.2; bant.material.opacity = Math.sin(t * 6) > 0 ? 1 : 0.3;
      const gp = (typeof navigator !== "undefined" && navigator.getGamepads) ? navigator.getGamepads()[0] : null;
      const shove = gp && gp.buttons[0] && gp.buttons[0].pressed;
      for (const s of stars) {
        if (shove) s.v.multiplyScalar(1.02);
        s.p.addScaledVector(s.v, dt);
        // bounce off the dome interior (radius R - star size)
        const d = s.p.length(), lim = R - 0.2;
        if (d > lim) { const n = s.p.clone().multiplyScalar(1 / d); s.v.addScaledVector(n, -2 * s.v.dot(n)); s.p.copy(n).multiplyScalar(lim); }
        s.mesh.position.copy(s.p);
        s.mesh.rotation.x += dt * 3; s.mesh.rotation.y += dt * 2.4;
      }
      domeRim.material.opacity = 0.5 + 0.2 * Math.sin(t * 1.5);
      light.intensity = 0.5 + 0.15 * Math.sin(t * 2);
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
