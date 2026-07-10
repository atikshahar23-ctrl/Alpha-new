// ── Audio-Neural Walls · Sector 4 · Module 20 — Agent Power Tethers ────────
//
// Glowing curved laser cables connecting each existing crew hologram (the
// same three {-27, z} anchors the Crew Holograms module uses) back to a
// shared data-spine node — a visual "they're all wired into Alpha" tether,
// built from CatmullRom curves so each cable sags/arcs naturally rather than
// running as a straight rigid line. No agent model is touched.
export function createAgentPowerTethers(ctx) {
  const { THREE, scene, markDynamic, helpers } = ctx;
  const HUB = new THREE.Vector3(-24, 2.6, 1);
  const AGENTS = [{ x: -27, z: 9, color: 0xff3cc7 }, { x: -27, z: 1, color: 0xffcf3a }, { x: -27, z: -7, color: 0x2ee6ff }];
  const group = new THREE.Group();
  scene.add(group); markDynamic(group);

  const hubNode = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 1), new THREE.MeshBasicMaterial({ color: 0xE4BC63, wireframe: true, transparent: true, opacity: 0.85, toneMapped: false }));
  hubNode.position.copy(HUB); group.add(hubNode);
  const sign = helpers.buildNeonSign("DATA SPINE", 0xE4BC63, 1.8, 0.34); sign.position.copy(HUB).add(new THREE.Vector3(0, 0.5, 0)); group.add(sign);

  const tethers = AGENTS.map((a) => {
    const start = new THREE.Vector3(a.x, 1.3, a.z);
    const mid = new THREE.Vector3((a.x + HUB.x) / 2, Math.max(a.z, 1.3, HUB.y) + 0.6, (a.z + HUB.z) / 2);
    const curve = new THREE.CatmullRomCurve3([start, mid, HUB]);
    const geo = new THREE.TubeGeometry(curve, 24, 0.012, 6, false);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: a.color, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, toneMapped: false }));
    group.add(mesh);
    // A traveling pulse sprite along the tether.
    const pulse = new THREE.Sprite(new THREE.SpriteMaterial({ color: a.color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    pulse.scale.setScalar(0.09); group.add(pulse);
    return { mesh, curve, pulse, phase: Math.random() };
  });

  let t = 0;
  const pt = new THREE.Vector3();
  return {
    update(dt) {
      t += dt;
      hubNode.rotation.y += dt * 0.6; hubNode.rotation.x += dt * 0.3;
      tethers.forEach((tt) => {
        tt.mesh.material.opacity = 0.4 + 0.25 * Math.sin(t * 2 + tt.phase * 6);
        const u = (t * 0.25 + tt.phase) % 1;
        tt.curve.getPointAt(u, pt); tt.pulse.position.copy(pt);
      });
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
