// ── Module 7 · Holographic Blind-Spot Drone ────────────────────────────────
//
// A miniature heavy-truck hologram on a pedestal with a micro-drone circling
// it, casting rotating green scan cones that sweep every side — a physical demo
// of 360° camera coverage eliminating blind spots. (Auto-orbits; if a gamepad
// is connected its left stick nudges the drone's orbit, so it's also flyable.)
export function createBlindspotDrone(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles } = ctx;
  const GREEN = 0x3fd79a;
  const SPOT = { x: -6, z: -26 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.4 });

  const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 0.12, 6), new THREE.MeshStandardMaterial({ color: 0x10141c, metalness: 0.6, roughness: 0.4 }));
  pad.position.y = 0.06; group.add(pad);
  const padRing = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.03, 8, 48), new THREE.MeshBasicMaterial({ color: GREEN, toneMapped: false }));
  padRing.rotation.x = Math.PI / 2; padRing.position.y = 0.13; group.add(padRing);

  // Mini heavy-truck hologram (cab + trailer + wheels), all glowing cyan.
  const truck = new THREE.Group(); truck.position.y = 1.0; group.add(truck);
  const holoMat = () => new THREE.MeshBasicMaterial({ color: 0x6fd3f0, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, toneMapped: false });
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.55), holoMat()); cab.position.set(-0.55, 0.28, 0); truck.add(cab);
  const trailer = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.6), holoMat()); trailer.position.set(0.35, 0.32, 0); truck.add(trailer);
  const wire = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.62, 0.62), new THREE.MeshBasicMaterial({ color: 0x6fd3f0, wireframe: true, transparent: true, opacity: 0.5, toneMapped: false })); wire.position.set(0.05, 0.32, 0); truck.add(wire);

  // Four scan cones (one per side) + the drone.
  const cones = [];
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.3, 16, 1, true), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.12, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    truck.add(c); cones.push(c);
  }
  const drone = new THREE.Group(); group.add(drone);
  const dbody = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), new THREE.MeshStandardMaterial({ color: 0x1a2230, metalness: 0.7, roughness: 0.3, emissive: GREEN, emissiveIntensity: 0.6 }));
  drone.add(dbody);
  const deye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: 0x8fffcf, toneMapped: false })); deye.position.z = 0.14; drone.add(deye);
  const dlight = new THREE.PointLight(GREEN, 0.5, 4); drone.add(dlight);
  const sign = helpers.buildNeonSign("360° BLIND-SPOT", GREEN, 2.2, 0.42);
  sign.position.set(0, 3.0, 0); group.add(sign);

  let t = 0, orbit = 0;
  return {
    update(dt) {
      t += dt;
      const gp = (typeof navigator !== "undefined" && navigator.getGamepads) ? navigator.getGamepads()[0] : null;
      const push = gp && Math.abs(gp.axes[0] || 0) > 0.15 ? gp.axes[0] : 0.4;
      orbit += dt * (0.5 + push);
      drone.position.set(Math.cos(orbit) * 1.8, 1.3 + Math.sin(t * 1.5) * 0.2, Math.sin(orbit) * 1.8);
      drone.lookAt(group.position.x, group.position.y + 1.0, group.position.z); // face the truck
      truck.rotation.y += dt * 0.25;
      cones.forEach((c, i) => {
        const a = (i / 4) * Math.PI * 2;
        c.position.set(Math.cos(a) * 0.55, 0.3, Math.sin(a) * 0.55);
        c.rotation.set(Math.PI / 2, 0, -a);
        c.material.opacity = 0.08 + 0.1 * (0.5 + 0.5 * Math.sin(t * 3 + i));
      });
      padRing.material.color.setHSL(0.42, 0.7, 0.45 + 0.12 * Math.sin(t * 2));
      dlight.intensity = 0.4 + 0.2 * Math.sin(t * 5);
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
