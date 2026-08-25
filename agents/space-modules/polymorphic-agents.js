// ── NEURAL-QUANTUM OVERRIDE · Phase 3 — Polymorphic Liquid Agents ──────────
//
// Around each of the three crew-hologram stations (Michal, Reuven/CFO,
// Dvora) sits an iridescent "liquid-metal" shell that idles as a slow,
// oil-on-water sheen. When an agent is processing LLM data — detected as
// talkTarget/phoneOpen going active — that shell SHATTERS into a swirling
// vortex of glowing binary-code shards and geometry, then reforms smoothly
// once the interaction settles.
//
// IMPORTANT: this is purely additive. It wraps the *hologram* positions and
// never touches any existing agent GLB/particle mesh — no geometry of the
// crew models is read, replaced, or modified.
export function createPolymorphicAgents(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  // Fixed crew-hologram anchors (from Office3D.jsx crew cluster).
  const STATIONS = [
    { x: -27, z: 9, tint: 0xff4fa3, label: "MICHAL" },
    { x: -27, z: 1, tint: 0x4fd0ff, label: "CFO" },
    { x: -27, z: -7, tint: 0xffd23f, label: "DVORA" },
  ];
  const group = new THREE.Group();
  scene.add(group); markDynamic(group);

  const agents = STATIONS.map((st) => {
    const g = new THREE.Group();
    g.position.set(st.x, 1.3, st.z);
    group.add(g);
    // Iridescent liquid shell — a low-poly sphere, additive so it survives the
    // mobile material-flatten pass and reads as a glowing metal skin.
    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.6, 2),
      new THREE.MeshBasicMaterial({ color: st.tint, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, wireframe: false, toneMapped: false, depthWrite: false }),
    );
    g.add(shell);
    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.66, 1),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, wireframe: true, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false }),
    );
    g.add(wire);
    // Vortex shards — hidden until the agent "processes"; each is a tiny
    // glowing quad that spirals out then back in.
    const SHARDS = 22;
    const shards = [];
    for (let i = 0; i < SHARDS; i++) {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.07), new THREE.MeshBasicMaterial({ color: 0x8fffc0, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false }));
      g.add(s);
      shards.push({ mesh: s, a: (i / SHARDS) * Math.PI * 2, r: 0.4 + Math.random() * 0.5, y: (Math.random() - 0.5) * 0.9, spin: 1 + Math.random() * 2 });
    }
    const sign = helpers.buildNeonSign(st.label, st.tint, 1.3, 0.28); sign.position.set(0, 1.05, 0); g.add(sign);
    return { g, shell, wire, shards, morph: 0, prevActive: false };
  });

  let t = 0;
  return {
    update(dt) {
      t += dt;
      const lr = liveRef.current;
      // No per-agent "is thinking" flag is exposed to space-modules, so use the
      // best available processing proxy: an active voice/phone interaction.
      const busy = !!lr.talkTarget || !!lr.phoneOpen;
      agents.forEach((a, idx) => {
        // Stagger which station reacts so all three don't shatter identically.
        const active = busy && (Math.floor(t * 0.7) % 3 === idx || busy);
        a.morph += ((active ? 1 : 0) - a.morph) * Math.min(1, dt * (active ? 5 : 2.5));
        const m = a.morph;
        // Idle iridescence — hue drifts through the oil-sheen palette.
        const hue = (t * 0.06 + idx * 0.33) % 1;
        a.shell.material.color.setHSL(hue, 0.7, 0.55);
        a.shell.material.opacity = 0.32 * (1 - m) + 0.08;
        a.shell.rotation.y += dt * (0.4 + m * 3); a.shell.rotation.x += dt * 0.2;
        a.shell.scale.setScalar(1 - m * 0.6 + Math.sin(t * 4) * 0.03);
        a.wire.material.opacity = 0.25 * (1 - m);
        a.wire.rotation.y -= dt * (0.3 + m * 2);
        // Vortex — shards spiral outward while morphed.
        a.shards.forEach((sh, i) => {
          sh.a += dt * sh.spin * (0.5 + m * 2);
          const r = sh.r * (0.3 + m * 1.1);
          sh.mesh.position.set(Math.cos(sh.a) * r, sh.y * m + Math.sin(t * 3 + i) * 0.05, Math.sin(sh.a) * r);
          sh.mesh.material.opacity = m * 0.85;
          sh.mesh.rotation.z = sh.a * 2;
          sh.mesh.material.color.setHSL((0.35 + hue * 0.3) % 1, 0.9, 0.6);
        });
        a.prevActive = active;
      });
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((mm) => mm.dispose()); } });
    },
  };
}
