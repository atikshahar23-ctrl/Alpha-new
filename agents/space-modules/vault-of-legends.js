// ── Module 43 · The Vault of Legends ───────────────────────────────────────
//
// A secured hall of fame: a row of golden pedestals, each crowned by a slowly
// rotating trophy and a floating plaque naming a legendary historical trade
// (asset · P&L). A laser containment grid seals the vault; the trophies bob and
// catch the light. Reads live winners off liveRef.marketRows when available,
// else falls back to a canonical roll of famous wins.
export function createVaultOfLegends(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles } = ctx;
  const SPOT = { x: 40, z: 18 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  group.rotation.y = -0.5;
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 3.4 });

  const GOLD = 0xE4BC63;
  const floor = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.14, 2.2), new THREE.MeshStandardMaterial({ color: 0x14110a, metalness: 0.6, roughness: 0.4, emissive: 0x1a1204, emissiveIntensity: 0.2 }));
  floor.position.y = 0.07; group.add(floor);
  const sign = helpers.buildNeonSign("VAULT OF LEGENDS", GOLD, 3.0, 0.5); sign.position.set(0, 3.1, 0); group.add(sign);

  const LEGENDS = [["BTC", "+412%"], ["ETH", "+268%"], ["SOL", "+880%"], ["NVDA", "+194%"], ["גב״י", "+57%"]];
  const trophyGeo = new THREE.CylinderGeometry(0.001, 0.28, 0.7, 5);
  const statues = [];
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 1.25;
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 0.9, 6), new THREE.MeshStandardMaterial({ color: 0x2a2113, metalness: 0.7, roughness: 0.35, emissive: 0x0f0a03, emissiveIntensity: 0.3 }));
    ped.position.set(x, 0.55, 0); group.add(ped);
    const trophy = new THREE.Mesh(trophyGeo, new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1.0, roughness: 0.16, emissive: 0x3a2a06, emissiveIntensity: 0.5 }));
    trophy.position.set(x, 1.5, 0); group.add(trophy);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1.0, roughness: 0.1, emissive: 0x4a3608, emissiveIntensity: 0.6 }));
    orb.position.set(x, 1.95, 0); group.add(orb);
    // plaque
    const cvs = document.createElement("canvas"); cvs.width = 200; cvs.height = 96; const tex = new THREE.CanvasTexture(cvs);
    const plaque = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); plaque.scale.set(1.0, 0.48, 1); plaque.position.set(x, 2.4, 0); group.add(plaque);
    statues.push({ trophy, orb, tex, cvs, plaque, x });
  }
  // Laser containment grid across the front.
  const grid = new THREE.Group(); group.add(grid);
  for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.015, 0.015), new THREE.MeshBasicMaterial({ color: 0xff4d4d, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, toneMapped: false })); l.position.set(0, 0.4 + i * 0.5, 1.0); grid.add(l); }

  const drawPlaque = (s, name, pl) => {
    const g = s.cvs.getContext("2d"); g.clearRect(0, 0, 200, 96);
    g.fillStyle = "rgba(20,16,6,0.9)"; g.fillRect(0, 0, 200, 96); g.strokeStyle = "rgba(228,188,99,0.8)"; g.lineWidth = 3; g.strokeRect(3, 3, 194, 90);
    g.textAlign = "center"; g.fillStyle = "#E4BC63"; g.font = "800 30px system-ui"; g.fillText(name, 100, 42);
    g.fillStyle = "#8fe0a0"; g.font = "700 26px system-ui"; g.fillText(pl, 100, 76);
    s.tex.needsUpdate = true;
  };
  const refresh = () => {
    const rows = liveRef.current.marketRows;
    const winners = rows && rows.length ? [...rows].filter((r) => (r.chg || 0) > 0).sort((a, b) => (b.chg || 0) - (a.chg || 0)) : [];
    statues.forEach((s, i) => {
      if (winners[i]) drawPlaque(s, (winners[i].sym || winners[i].name || LEGENDS[i][0]).toString().slice(0, 6), "+" + (winners[i].chg || 0).toFixed(1) + "%");
      else drawPlaque(s, LEGENDS[i][0], LEGENDS[i][1]);
    });
  };
  refresh();

  let t = 0, refT = 0;
  return {
    update(dt) {
      t += dt;
      statues.forEach((s, i) => { s.trophy.rotation.y += dt * 0.8; s.orb.position.y = 1.95 + Math.sin(t * 1.5 + i) * 0.06; s.orb.rotation.y -= dt * 1.2; });
      grid.children.forEach((l, i) => { l.material.opacity = 0.25 + 0.2 * Math.abs(Math.sin(t * 2 + i * 0.5)); });
      refT += dt; if (refT > 8) { refT = 0; refresh(); }
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
