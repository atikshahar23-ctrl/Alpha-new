// ── Audio-Neural Walls · Sector 5 · Module 25 — Biometric Door Scanner ─────
//
// A laser grid arching over the reception/entrance area — the camera's
// approach ("navigating near it") sweeps the scan line through a full cycle
// and flashes a green "CLEARED" pulse, echoing the boot-sequence biometric
// gate aesthetic already used at app startup.
export function createBiometricDoorScanner(ctx) {
  const { THREE, scene, camera, markDynamic, helpers } = ctx;
  const SPOT = new THREE.Vector3(-6.9, 1.6, 13.5); // same entrance vicinity as the reception CCTV view
  const group = new THREE.Group();
  group.position.copy(SPOT);
  scene.add(group); markDynamic(group);

  const arch = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.03, 8, 32, Math.PI), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, toneMapped: false }));
  arch.rotation.z = Math.PI; group.add(arch);
  const grid = new THREE.Group(); group.add(grid);
  for (let i = -4; i <= 4; i++) {
    const line = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 2.1, 4), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.18, toneMapped: false }));
    line.position.x = i * 0.13; grid.add(line);
  }
  const scanLine = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: 0x39ff9e, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, toneMapped: false }));
  group.add(scanLine);
  const sign = helpers.buildNeonSign("BIOMETRIC SCANNER", 0x2ee6ff, 2.0, 0.36); sign.position.set(0, 1.35, 0); group.add(sign);
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0x39ff9e, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  flash.scale.setScalar(1.6); group.add(flash);

  const camDist = new THREE.Vector3();
  let t = 0, scanU = 0, dir = 1, cleared = 0;
  return {
    update(dt) {
      t += dt;
      camDist.subVectors(camera.position, SPOT);
      const near = camDist.length() < 5;
      const scanning = near;
      if (scanning) { scanU += dir * dt * 1.4; if (scanU > 1) { scanU = 1; dir = -1; cleared = 1; } else if (scanU < 0) { scanU = 0; dir = 1; } }
      scanLine.position.y = -1.0 + scanU * 2.0;
      scanLine.material.opacity = scanning ? 0.85 : 0.15;
      grid.children.forEach((l) => { l.material.opacity = scanning ? 0.3 + 0.15 * Math.sin(t * 6) : 0.1; });
      cleared = Math.max(0, cleared - dt * 0.8);
      flash.material.opacity = cleared * 0.35;
      arch.material.opacity = 0.4 + (scanning ? 0.35 : 0) + 0.1 * Math.sin(t * 2);
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
