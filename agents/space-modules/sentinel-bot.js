// ── Module 13 · Auto-Trading Sentinel Bot ──────────────────────────────────
//
// A red security drone patrols the Deep Space Market Radar. When the live
// market feed shows an asset dumping past a threshold, the sentinel fires a
// "SELL" laser into the radar sphere and the target shatters into a spray of
// gold coins — the autonomous risk-guard, made physical.
//
// Reads liveRef.marketRows (the same live feed the radar uses) and sits at the
// algoZone anchor. Coin pool is recycled; nothing allocates every frame except
// on an actual sell event.
export function createSentinelBot(ctx) {
  const { THREE, scene, liveRef, markDynamic, anchors } = ctx;
  const C = new THREE.Vector3(anchors.algoZone.x, 3.2, anchors.algoZone.z);

  const group = new THREE.Group();
  scene.add(group);
  markDynamic(group);

  const bot = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.34, 0),
    new THREE.MeshStandardMaterial({ color: 0x20304a, metalness: 0.7, roughness: 0.3, emissive: 0xff3b3b, emissiveIntensity: 0.4 })
  );
  bot.add(body);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), new THREE.MeshBasicMaterial({ color: 0xff5c50, toneMapped: false }));
  eye.position.z = 0.32; bot.add(eye);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.03, 8, 24), new THREE.MeshBasicMaterial({ color: 0x3fd79a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, toneMapped: false }));
  ring.rotation.x = Math.PI / 2; bot.add(ring);
  const botLight = new THREE.PointLight(0xff5c50, 0.5, 6); bot.add(botLight);
  group.add(bot);

  // Reusable SELL laser (a Y-axis cylinder scaled/oriented between bot and target).
  const laser = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 1, 6),
    new THREE.MeshBasicMaterial({ color: 0xff3b3b, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false })
  );
  group.add(laser);

  const coins = [];
  const coinGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 10);
  const spawnCoins = (pos) => {
    for (let i = 0; i < 10; i++) {
      const m = new THREE.Mesh(coinGeo, new THREE.MeshStandardMaterial({ color: 0xE4BC63, metalness: 0.9, roughness: 0.25, emissive: 0x3a2a06, emissiveIntensity: 0.5 }));
      m.position.copy(pos);
      const a = Math.random() * Math.PI * 2, e = Math.random() * Math.PI - Math.PI / 2, s = 2 + Math.random() * 3;
      m.userData.vel = new THREE.Vector3(Math.cos(a) * Math.cos(e) * s, Math.sin(e) * s + 2.4, Math.sin(a) * Math.cos(e) * s);
      m.userData.life = 1.3;
      group.add(m); coins.push(m);
    }
  };

  const up = new THREE.Vector3(0, 1, 0);
  const dir = new THREE.Vector3(), targ = new THREE.Vector3();
  let t = 0, fireT = 0, angle = 0;

  return {
    update(dt) {
      t += dt; angle += dt * 0.5;
      bot.position.set(C.x + Math.cos(angle) * 3.4, C.y + Math.sin(t * 0.8) * 0.3, C.z + Math.sin(angle) * 3.4);
      bot.lookAt(C.x, bot.position.y, C.z);
      body.rotation.y += dt * 2; ring.rotation.z += dt * 1.5;

      laser.material.opacity = Math.max(0, laser.material.opacity - dt * 2.4);

      fireT += dt;
      const rows = liveRef.current.marketRows || [];
      const bear = rows.find((r) => (r.chg || 0) < -1.2);
      if (fireT > 3 && bear) {
        fireT = 0;
        targ.set(C.x + (Math.random() - 0.5) * 3, C.y + (Math.random() - 0.5) * 3, C.z + (Math.random() - 0.5) * 3);
        dir.copy(targ).sub(bot.position);
        const len = dir.length(); dir.normalize();
        laser.quaternion.setFromUnitVectors(up, dir);
        laser.position.copy(bot.position).addScaledVector(dir, len / 2);
        laser.scale.set(1, len, 1);
        laser.material.opacity = 0.95;
        spawnCoins(targ);
      }

      for (let i = coins.length - 1; i >= 0; i--) {
        const m = coins[i];
        m.userData.life -= dt; m.userData.vel.y -= 6 * dt;
        m.position.addScaledVector(m.userData.vel, dt);
        m.rotation.x += dt * 6; m.rotation.y += dt * 5;
        if (m.userData.life <= 0) { group.remove(m); m.geometry.dispose(); m.material.dispose(); coins.splice(i, 1); }
      }
      botLight.intensity = 0.4 + (laser.material.opacity > 0.3 ? 1.4 : 0.2 * Math.abs(Math.sin(t * 4)));
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      });
    },
  };
}
