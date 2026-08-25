// ── Module 45 · Space-Whale Entities ───────────────────────────────────────
//
// On a 'Whale Alert' (a big single-asset 24h move in liveRef.marketRows, fired
// periodically, or via liveRef.triggerWhale()) a colossal cosmic gas-whale
// swims slowly across the far starfield beyond the viewport: a translucent
// bioluminescent body with undulating fins/tail and a trailing plankton glow,
// drifting from one side to the other before dissolving back into the dark.
export function createSpaceWhale(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const group = new THREE.Group();
  group.visible = false;
  scene.add(group); markDynamic(group);

  const skin = new THREE.MeshStandardMaterial({ color: 0x2b6ea8, transparent: true, opacity: 0.5, roughness: 0.5, metalness: 0.1, emissive: 0x123a6a, emissiveIntensity: 0.6, side: THREE.DoubleSide });
  const body = new THREE.Mesh(new THREE.SphereGeometry(3.4, 24, 16), skin);
  body.scale.set(3.4, 1.0, 1.2); group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(2.0, 20, 14), skin); head.scale.set(1.4, 1.1, 1.2); head.position.set(9.5, 0.3, 0); group.add(head);
  const tail = new THREE.Group(); tail.position.set(-11, 0, 0); group.add(tail);
  const fluke = new THREE.Mesh(new THREE.ConeGeometry(2.4, 3.2, 4), skin); fluke.rotation.z = Math.PI / 2; fluke.scale.set(1, 0.3, 1.6); tail.add(fluke);
  const finGeo = new THREE.ConeGeometry(1.2, 3.0, 4);
  const finL = new THREE.Mesh(finGeo, skin); finL.position.set(1, -0.6, 2.2); finL.rotation.set(0.4, 0, -0.6); group.add(finL);
  const finR = new THREE.Mesh(finGeo, skin); finR.position.set(1, -0.6, -2.2); finR.rotation.set(-0.4, 0, -0.6); group.add(finR);
  // bioluminescent belly spots.
  const spots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, toneMapped: false }), 40);
  const dm = new THREE.Object3D();
  for (let i = 0; i < 40; i++) { dm.position.set((Math.random() - 0.5) * 20, -0.8 - Math.random() * 0.6, (Math.random() - 0.5) * 2.4); dm.scale.setScalar(0.5 + Math.random()); dm.updateMatrix(); spots.setMatrixAt(i, dm.matrix); }
  group.add(spots);
  // plankton trail.
  const N = 80; const geo = new THREE.BufferGeometry(); const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = -13 - Math.random() * 14; pos[i * 3 + 1] = (Math.random() - 0.5) * 3; pos[i * 3 + 2] = (Math.random() - 0.5) * 3; }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const trail = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x6fd0ff, size: 0.2, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  group.add(trail);
  const sign = helpers.buildNeonSign("🐋 WHALE ALERT", 0x8fe0ff, 5.0, 0.9); sign.position.set(0, 5.5, 0); sign.scale.setScalar(1.4); group.add(sign);

  const START = new THREE.Vector3(-70, 20, -48), END = new THREE.Vector3(70, 14, -52);
  let t = 0, swim = -1, timer = 25;
  const trigger = () => { if (swim < 0) { swim = 0; group.visible = true; } };
  liveRef.current.triggerWhale = trigger;
  return {
    update(dt) {
      t += dt;
      // auto whale-alert on a big single-asset move
      timer -= dt;
      if (timer <= 0) {
        const rows = liveRef.current.marketRows; let big = false;
        if (rows && rows.length) big = rows.some((r) => Math.abs(r.chg || 0) > 6);
        if (big || Math.random() < 0.5) trigger();
        timer = 40 + Math.random() * 40;
      }
      if (swim >= 0) {
        swim += dt * 0.035; // slow crossing (~28s)
        if (swim >= 1) { swim = -1; group.visible = false; return; }
        group.position.lerpVectors(START, END, swim);
        group.position.y += Math.sin(t * 0.4) * 2;
        group.rotation.y = -0.2 + Math.sin(t * 0.15) * 0.15;
        body.rotation.z = Math.sin(t * 0.8) * 0.06;
        tail.rotation.y = Math.sin(t * 1.4) * 0.5; // fluke stroke
        finL.rotation.x = 0.4 + Math.sin(t * 1.1) * 0.2; finR.rotation.x = -0.4 - Math.sin(t * 1.1) * 0.2;
        const fade = Math.sin(Math.min(1, swim) * Math.PI);
        skin.opacity = 0.45 * fade; spots.material.opacity = 0.9 * fade; trail.material.opacity = 0.6 * fade;
        const arr = geo.attributes.position.array;
        for (let i = 0; i < N; i++) { arr[i * 3 + 1] += Math.sin(t * 2 + i) * dt * 0.3; }
        geo.attributes.position.needsUpdate = true;
      }
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
