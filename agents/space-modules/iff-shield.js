// ── Module 1 · IFF Deflector Shield (Comm-Link) ────────────────────────────
//
// A glowing hexagonal energy shield arcs over the ship's deep-space viewport.
// Incoming spam calls streak in as red asteroids and bounce off the shield
// (with a hex-ripple flash at each impact); every so often a VERIFIED caller
// clears IFF and a green "Docking Clearance" corridor opens straight through
// the shield toward the ship.
//
// Self-contained: sphere-bounce physics on a small recycled asteroid pool, one
// hex-textured dome, a pooled ripple set — no per-frame allocation on the
// steady state.
export function createIffShield(ctx) {
  const { THREE, scene, markDynamic } = ctx;
  const CS = new THREE.Vector3(0, 4, -30);
  const RS = 14;

  const group = new THREE.Group();
  scene.add(group);
  markDynamic(group);

  // Hex-grid shield texture.
  const hc = document.createElement("canvas"); hc.width = 256; hc.height = 256;
  {
    const g = hc.getContext("2d");
    g.fillStyle = "rgba(0,0,0,0)"; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = "rgba(80,200,255,0.9)"; g.lineWidth = 3; g.shadowColor = "rgba(80,200,255,0.9)"; g.shadowBlur = 4;
    const s = 34, h = s * Math.sqrt(3) / 2;
    for (let row = -1; row < 9; row++) {
      for (let col = -1; col < 9; col++) {
        const cx = col * s * 1.5, cy = row * h * 2 + (col % 2 ? h : 0);
        g.beginPath();
        for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i; const x = cx + s * Math.cos(a), y = cy + s * Math.sin(a); i ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.closePath(); g.stroke();
      }
    }
  }
  const hexTex = new THREE.CanvasTexture(hc);
  hexTex.wrapS = hexTex.wrapT = THREE.RepeatWrapping; hexTex.repeat.set(3, 3);

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(RS, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: hexTex, color: 0x50c8ff, transparent: true, opacity: 0.26, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
  );
  dome.rotation.x = -Math.PI / 2; // bulge toward -z (deep space / incoming)
  dome.position.copy(CS);
  group.add(dome);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(RS, 0.2, 8, 60), new THREE.MeshBasicMaterial({ color: 0x7fe0ff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, toneMapped: false }));
  rim.position.copy(CS); group.add(rim);
  const shieldLight = new THREE.PointLight(0x50c8ff, 0.3, 40); shieldLight.position.copy(CS); group.add(shieldLight);

  // Incoming spam asteroids.
  const astGeo = new THREE.IcosahedronGeometry(0.7, 0);
  const asteroids = [];
  const spawnAst = (a) => {
    const az = Math.random() * Math.PI * 2, el = Math.random() * Math.PI * 0.42;
    const n = new THREE.Vector3(Math.sin(el) * Math.cos(az), Math.cos(el) * 0.6, -Math.abs(Math.cos(el)) - 0.2).normalize();
    a.mesh.position.copy(CS).addScaledVector(n, 30 + Math.random() * 6);
    a.vel.copy(n).multiplyScalar(-(6 + Math.random() * 5));
    a.bounced = 0;
  };
  for (let i = 0; i < 7; i++) {
    const mesh = new THREE.Mesh(astGeo, new THREE.MeshStandardMaterial({ color: 0x3a0e0e, emissive: 0xff2b2b, emissiveIntensity: 0.7, roughness: 0.7, metalness: 0.1 }));
    group.add(mesh);
    const a = { mesh, vel: new THREE.Vector3() };
    spawnAst(a); asteroids.push(a);
  }

  // Impact-ripple pool (expanding hex rings oriented to the impact normal).
  const ripples = [];
  for (let i = 0; i < 6; i++) {
    const r = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.5, 6), new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    group.add(r); ripples.push({ mesh: r, life: 0 });
  }
  const fireRipple = (pos, n) => {
    const r = ripples.find((x) => x.life <= 0) || ripples[0];
    r.mesh.position.copy(pos); r.mesh.lookAt(pos.clone().add(n)); r.life = 0.5; r.mesh.scale.setScalar(1);
  };

  // VERIFIED "Docking Clearance" corridor (green), opened periodically.
  const corridor = new THREE.Group(); corridor.visible = false; group.add(corridor);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 30, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0x3fd79a, transparent: true, opacity: 0.18, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  tube.rotation.x = Math.PI / 2; tube.position.set(CS.x, CS.y, CS.z - 4); corridor.add(tube);
  for (let i = 0; i < 4; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.06, 8, 32), new THREE.MeshBasicMaterial({ color: 0x8fffcf, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, toneMapped: false }));
    ring.position.set(CS.x, CS.y, CS.z - 12 + i * 6); corridor.add(ring);
  }

  const d = new THREE.Vector3(), n = new THREE.Vector3();
  let t = 0, flash = 0, corridorT = 0, corridorTimer = 5;
  return {
    update(dt) {
      t += dt;
      dome.rotation.z += dt * 0.05;
      flash = Math.max(0, flash - dt * 2.2);
      dome.material.opacity = 0.22 + flash * 0.4;
      rim.material.opacity = 0.5 + 0.2 * Math.abs(Math.sin(t * 1.5)) + flash * 0.4;
      shieldLight.intensity = 0.25 + flash * 1.5;

      for (const a of asteroids) {
        a.mesh.position.addScaledVector(a.vel, dt);
        a.mesh.rotation.x += dt * 2; a.mesh.rotation.y += dt * 1.6;
        d.copy(a.mesh.position).sub(CS);
        const dist = d.length();
        if (dist <= RS && d.dot(a.vel) < 0) {
          n.copy(d).multiplyScalar(1 / dist);
          a.vel.addScaledVector(n, -2 * a.vel.dot(n));  // reflect off the shield
          a.mesh.position.copy(CS).addScaledVector(n, RS);
          fireRipple(a.mesh.position, n);
          flash = 1; a.bounced++;
        }
        if (dist > 38 || a.bounced > 2) spawnAst(a);
      }

      for (const r of ripples) {
        if (r.life > 0) { r.life -= dt; r.mesh.scale.setScalar(1 + (0.5 - r.life) * 8); r.mesh.material.opacity = Math.max(0, r.life * 1.6); }
      }

      // Verified-caller corridor cycles open/closed.
      corridorTimer -= dt;
      if (corridorTimer <= 0 && !corridor.visible) { corridor.visible = true; corridorT = 0; }
      if (corridor.visible) {
        corridorT += dt;
        const fade = corridorT < 0.4 ? corridorT / 0.4 : corridorT > 2.6 ? Math.max(0, (3 - corridorT) / 0.4) : 1;
        tube.material.opacity = 0.18 * fade;
        corridor.children.forEach((c, i) => { if (i > 0) { c.position.z += dt * 6; if (c.position.z > CS.z + 6) c.position.z = CS.z - 18; if (c.material) c.material.opacity = 0.8 * fade; } });
        if (corridorT > 3) { corridor.visible = false; corridorTimer = 7 + Math.random() * 5; }
      }
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
