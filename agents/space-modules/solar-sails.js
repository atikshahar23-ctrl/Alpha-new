// ── Module 12 · Staking & Yield Solar Sails ────────────────────────────────
//
// Two great glowing solar sails hang in space outside the ship, flanking the
// deep-space viewport. As the simulated passive yield (derived from the live
// business revenue) climbs, the sails expand and brighten and pump faster
// pulses of blue energy down long conduits into the ship's core — "the money
// that works while you sleep, powering the ship."
//
// Perf: each sail's face is a single InstancedMesh of glowing panels (one draw
// call for the whole grid), not N separate meshes. The energy pulses are a
// tiny fixed pool of additive spheres, recycled — no per-frame allocation.
export function createSolarSails(ctx) {
  const { THREE, scene, liveRef, markDynamic } = ctx;
  const CORE = new THREE.Vector3(ctx.anchors.sun.x, 2.4, ctx.anchors.sun.z);

  const group = new THREE.Group();
  scene.add(group);
  markDynamic(group);

  const SAIL_SPOTS = [
    { x: -44, y: 8, z: -50 },
    { x: 44, y: 8, z: -50 },
  ];
  const panelGeo = new THREE.PlaneGeometry(1, 1);
  const sails = [];
  const pulses = [];

  SAIL_SPOTS.forEach((p) => {
    const sail = new THREE.Group();
    sail.position.set(p.x, p.y, p.z);

    // Central spine + a bright rim ring so the sail reads as an engineered
    // megastructure rather than a floating billboard.
    const spine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 22, 8),
      new THREE.MeshStandardMaterial({ color: 0x1a2740, metalness: 0.75, roughness: 0.4, emissive: 0x0a1830, emissiveIntensity: 0.4 })
    );
    sail.add(spine);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(10.5, 0.14, 8, 48),
      new THREE.MeshBasicMaterial({ color: 0x2e7bff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, toneMapped: false })
    );
    sail.add(rim);

    // Instanced sail face — a grid of glowing panels.
    const COLS = 6, ROWS = 5, N = COLS * ROWS;
    const CW = 3.0, CH = 3.4;
    const mat = new THREE.MeshBasicMaterial({ color: 0x2e7bff, transparent: true, opacity: 0.42, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false });
    const inst = new THREE.InstancedMesh(panelGeo, mat, N);
    inst.frustumCulled = false;
    const dummy = new THREE.Object3D();
    let k = 0;
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        dummy.position.set((c - (COLS - 1) / 2) * CW * 1.04, (r - (ROWS - 1) / 2) * CH * 1.04, 0);
        dummy.scale.set(CW, CH, 1);
        dummy.updateMatrix();
        inst.setMatrixAt(k++, dummy.matrix);
      }
    }
    inst.instanceMatrix.needsUpdate = true;
    sail.add(inst);

    sail.lookAt(CORE); // angle the whole sail toward the ship's core
    const glow = new THREE.PointLight(0x2e7bff, 0.6, 60);
    glow.position.copy(sail.position);
    group.add(sail);
    group.add(glow);
    sails.push({ sail, mat, rim, glow, base: sail.position.clone() });

    // Three energy pulses per sail, travelling sail → core, staggered.
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false })
      );
      group.add(m);
      pulses.push({ mesh: m, from: sail.position.clone(), t: i / 3 });
    }
  });

  const tmp = new THREE.Vector3();
  let t = 0, yield01 = 0.4;

  return {
    update(dt) {
      t += dt;
      // Simulated passive yield 0..1 from live revenue (with a gentle floor so
      // the sails are always alive), eased toward its target.
      const b = liveRef.current.bizData || {};
      const target = Math.min(1, 0.35 + (b.hgRevenue || 0) / 600000);
      yield01 += (target - yield01) * Math.min(1, dt * 0.4);
      const breathe = 0.85 + 0.15 * Math.sin(t * 0.6);

      for (const s of sails) {
        // Expand + brighten with yield; gentle solar-wind sway.
        const scl = (0.8 + yield01 * 0.5) * breathe;
        s.sail.scale.setScalar(scl);
        s.sail.rotation.z = Math.sin(t * 0.3 + s.base.x) * 0.05;
        s.mat.opacity = 0.3 + yield01 * 0.35;
        s.rim.material.opacity = 0.55 + 0.35 * Math.abs(Math.sin(t * 1.2));
        s.glow.intensity = 0.4 + yield01 * 1.2;
      }
      // Faster pulses when yield is high — the "channelling into the core".
      const speed = 0.25 + yield01 * 0.55;
      for (const p of pulses) {
        p.t += dt * speed;
        if (p.t >= 1) p.t -= 1;
        tmp.copy(p.from).lerp(CORE, p.t);
        p.mesh.position.copy(tmp);
        p.mesh.material.opacity = 0.9 * (1 - p.t) + 0.15;
        const ps = 0.4 + yield01 * 0.6;
        p.mesh.scale.setScalar(ps);
      }
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
