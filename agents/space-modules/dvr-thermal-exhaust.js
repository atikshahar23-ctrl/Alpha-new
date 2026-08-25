// ── Audio-Neural Walls · Sector 2 · Module 8 — DVR Thermal Exhaust ─────────
//
// A physical wall vent glowing red, simulating the heat output of the
// fleet's DVR/NVR servers. A wobbling additive heat-shimmer plane over the
// louvers fakes refraction distortion cheaply (a real screen-space heat-haze
// shader would need an extra render pass, not worth it for a background prop).
export function createDvrThermalExhaust(ctx) {
  const { THREE, scene, markDynamic, helpers } = ctx;
  const SPOT = { x: 0, z: -32 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 1.5, SPOT.z);
  scene.add(group); markDynamic(group);

  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, 0.12), new THREE.MeshStandardMaterial({ color: 0x14161c, metalness: 0.6, roughness: 0.4 }));
  group.add(frame);
  const louvers = [];
  for (let i = 0; i < 6; i++) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.06, 0.1), new THREE.MeshStandardMaterial({ color: 0x1a1010, emissive: 0xff2a1a, emissiveIntensity: 0.5, roughness: 0.5 }));
    l.rotation.x = 0.5; l.position.set(0, (i - 2.5) * 0.1, 0.02); group.add(l); louvers.push(l);
  }
  // Heat-shimmer plane (additive noise stripes, wobbling UV offset).
  const cvs = document.createElement("canvas"); cvs.width = 64; cvs.height = 64; const g = cvs.getContext("2d");
  for (let y = 0; y < 64; y++) { g.fillStyle = `rgba(255,80,40,${0.05 + Math.random() * 0.1})`; g.fillRect(0, y, 64, 1); }
  const shimmerTex = new THREE.CanvasTexture(cvs); shimmerTex.wrapS = shimmerTex.wrapT = THREE.RepeatWrapping;
  const shimmer = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.9), new THREE.MeshBasicMaterial({ map: shimmerTex, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  shimmer.position.set(0, 0.55, 0.1); group.add(shimmer);
  const sign = helpers.buildNeonSign("DVR THERMAL EXHAUST", 0xff5533, 2.4, 0.4); sign.position.set(0, -0.65, 0); group.add(sign);

  let t = 0;
  return {
    update(dt) {
      t += dt;
      const heat = 0.55 + 0.25 * Math.sin(t * 1.7);
      louvers.forEach((l, i) => { l.material.emissiveIntensity = heat + 0.1 * Math.sin(t * 4 + i); });
      shimmerTex.offset.y = (t * 0.4) % 1;
      shimmer.material.opacity = 0.25 + heat * 0.2;
      shimmer.scale.y = 1 + 0.03 * Math.sin(t * 6);
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
