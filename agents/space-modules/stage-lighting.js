// ── Module 48 · Bad Bunny / Stromae Lighting Toggles ───────────────────────
//
// An overhead concert rig with two moods that cross-fade on a cycle (or via
// liveRef.stageMode = "stromae" | "badbunny"):
//   · Stromae   — dark, elegant, sweeping yellow/white spotlights.
//   · Bad Bunny — neon Caribbean psychedelia (toxic green / hot pink / purple).
// Built from additive volumetric cone beams + floor pools (no real lights) to
// stay inside the deck's mobile light budget while still washing the room.
export function createStageLighting(ctx) {
  const { THREE, scene, markDynamic, liveRef } = ctx;
  const group = new THREE.Group();
  group.position.set(-8, 0, 24);
  scene.add(group); markDynamic(group);

  const truss = new THREE.Mesh(new THREE.TorusGeometry(4.5, 0.08, 6, 48), new THREE.MeshStandardMaterial({ color: 0x15181e, metalness: 0.7, roughness: 0.4 }));
  truss.rotation.x = Math.PI / 2; truss.position.y = 6.5; group.add(truss);

  const STROMAE = [0xfff2c0, 0xffe066, 0xffffff, 0xf0d48a];
  const BADBUNNY = [0x39ff9e, 0xff4dd2, 0x9a4dff, 0x2ee6ff];
  const HEADS = 6;
  const beams = [];
  for (let i = 0; i < HEADS; i++) {
    const a = (i / HEADS) * Math.PI * 2;
    const head = new THREE.Group(); head.position.set(Math.cos(a) * 4.5, 6.4, Math.sin(a) * 4.5); group.add(head);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.1, 6.2, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.14, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    cone.position.y = -3.1; head.add(cone);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(1.3, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    pool.rotation.x = -Math.PI / 2; group.add(pool);
    beams.push({ head, cone, pool, a, phase: Math.random() * 6 });
  }
  const col = new THREE.Color(), tmp = new THREE.Color();

  let t = 0, mode = 0; // 0=stromae .. 1=badbunny
  return {
    update(dt) {
      t += dt;
      const want = liveRef.current.stageMode === "badbunny" ? 1 : liveRef.current.stageMode === "stromae" ? 0 : (Math.sin(t * 0.12) > 0 ? 1 : 0);
      mode += (want - mode) * Math.min(1, dt * 0.8);
      const palette = mode > 0.5 ? BADBUNNY : STROMAE;
      const speed = mode > 0.5 ? 2.2 : 0.7; // psychedelic vs elegant sweep
      beams.forEach((b, i) => {
        col.setHex(STROMAE[i % STROMAE.length]); tmp.setHex(BADBUNNY[i % BADBUNNY.length]);
        col.lerp(tmp, mode);
        b.cone.material.color.copy(col); b.pool.material.color.copy(col);
        // sweep the head + move its floor pool under the cone
        const sweep = Math.sin(t * speed + b.phase);
        b.head.rotation.z = sweep * (mode > 0.5 ? 0.7 : 0.35);
        const px = b.head.position.x + Math.sin(t * speed + b.phase) * 2.4;
        const pz = b.head.position.z + Math.cos(t * speed * 0.8 + b.phase) * 2.4;
        b.pool.position.set(px, 0.04, pz);
        const flick = mode > 0.5 ? (0.2 + 0.25 * Math.abs(Math.sin(t * 10 + i))) : (0.16 + 0.06 * Math.sin(t * 1.5 + i));
        b.cone.material.opacity = flick; b.pool.material.opacity = flick + 0.1;
      });
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
