// ── Module 36 · PHEV Regen-Braking Charge Tower ────────────────────────────
//
// A charge pylon by the vehicle bay that visualises the PHEV's regenerative
// braking: green energy motes spiral UP the pylon into a capacitor ring, whose
// fill tracks liveRef.phevBattery. When the ring tops out it flashes
// "TURBO READY" and sets liveRef.turboReady for the drive system to consume.
export function createRegenBrake(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles } = ctx;
  const SPOT = { x: 24, z: 20 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 0.9 });

  const GREEN = 0x39ff9e;
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 3.2, 16), new THREE.MeshStandardMaterial({ color: 0x14201a, metalness: 0.7, roughness: 0.3, emissive: 0x08160f, emissiveIntensity: 0.4 }));
  column.position.y = 1.6; group.add(column);
  // Capacitor fill bar climbing the pylon (scaled on Y by battery %).
  const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 3.0, 12), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, toneMapped: false }));
  fill.position.y = 0.15; fill.scale.y = 0.01; column.add(fill);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 10, 40), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, toneMapped: false }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 3.35; group.add(ring);
  const sign = helpers.buildNeonSign("REGEN · TURBO", GREEN, 2.1, 0.4); sign.position.set(0, 4.0, 0); group.add(sign);

  // Spiral of green motes rising into the capacitor.
  const N = 90;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) { seed[i] = Math.random(); pos[i * 3] = 0; pos[i * 3 + 1] = Math.random() * 3.2; pos[i * 3 + 2] = 0; }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const motes = new THREE.Points(geo, new THREE.PointsMaterial({ color: GREEN, size: 0.12, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  group.add(motes);

  let t = 0, pct = 0, flash = 0;
  return {
    update(dt) {
      t += dt;
      const target = Math.max(0, Math.min(1, (liveRef.current.phevBattery != null ? liveRef.current.phevBattery : 60) / 100));
      pct += (target - pct) * Math.min(1, dt * 0.8);
      fill.scale.y = Math.max(0.01, pct);
      fill.position.y = 0.15 - (3.0 * (1 - pct)) / 2;
      // rising spiral motes
      const arr = geo.attributes.position.array;
      for (let i = 0; i < N; i++) {
        let y = arr[i * 3 + 1] + dt * (0.6 + seed[i] * 0.8);
        if (y > 3.2) y = 0;
        const a = seed[i] * Math.PI * 2 + t * 2 + y * 2;
        const r = 0.22 * (1 - y / 3.2) + 0.05;
        arr[i * 3] = Math.cos(a) * r; arr[i * 3 + 1] = y; arr[i * 3 + 2] = Math.sin(a) * r;
      }
      geo.attributes.position.needsUpdate = true;
      ring.scale.setScalar(1 + 0.08 * Math.sin(t * 4));
      const ready = pct > 0.985;
      liveRef.current.turboReady = ready;
      if (ready) { flash = (flash + dt) % 1; ring.material.color.setHex(flash < 0.5 ? 0xffe066 : GREEN); ring.material.opacity = 0.7 + 0.3 * Math.sin(t * 12); }
      else { ring.material.color.setHex(GREEN); ring.material.opacity = 0.5 + 0.25 * Math.sin(t * 3); }
    },
    dispose() {
      liveRef.current.turboReady = false;
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
