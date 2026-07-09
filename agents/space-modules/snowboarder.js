// ── Module 34 · The Snowboarder Hologram (Shlomi's Avatar) ─────────────────
//
// A glowing snowboarder rides a holographic half-pipe whose walls ARE the live
// stock-market chart. The rider carves a U-shaped path back and forth, catching
// air at the lips; the half-pipe rail + chart backdrop pulse with the market.
export function createSnowboarder(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles } = ctx;
  const SPOT = { x: -28, z: -8 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  group.rotation.y = 0.4;
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 2.2 });

  // U-shaped half-pipe path (down the left wall, across, up the right wall).
  const half = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.4, 3.0, 0), new THREE.Vector3(-2.0, 1.2, 0), new THREE.Vector3(-1.2, 0.3, 0),
    new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(1.2, 0.3, 0), new THREE.Vector3(2.0, 1.2, 0), new THREE.Vector3(2.4, 3.0, 0),
  ], false, "catmullrom", 0.5);
  const rail = new THREE.Mesh(new THREE.TubeGeometry(half, 40, 0.06, 8, false), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, toneMapped: false }));
  const rail2 = rail.clone(); rail2.position.z = -1.6; rail.position.z = 0.8;
  group.add(rail, rail2);
  // Chart backdrop wall (the "made of stock charts" surface).
  const cvs = document.createElement("canvas"); cvs.width = 320; cvs.height = 180; const tex = new THREE.CanvasTexture(cvs);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 3.0), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.5, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false }));
  wall.position.set(0, 1.6, -1.4); group.add(wall);

  // Snowboarder — a glowing figure on a board.
  const rider = new THREE.Group(); group.add(rider);
  const rmat = new THREE.MeshBasicMaterial({ color: 0xff5ad0, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, toneMapped: false });
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.32, 4, 8), rmat); torso.position.y = 0.42; rider.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), rmat); head.position.y = 0.72; rider.add(head);
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.16), new THREE.MeshBasicMaterial({ color: 0xffe066, toneMapped: false })); board.position.y = 0.06; rider.add(board);
  const sign = helpers.buildNeonSign("SHLOMI · HALF-PIPE", 0xff5ad0, 2.3, 0.42); sign.position.set(0, 3.7, 0); group.add(sign);

  const drawChart = (rows) => {
    const g = cvs.getContext("2d"); g.clearRect(0, 0, 320, 180);
    g.strokeStyle = "rgba(46,230,255,0.7)"; g.lineWidth = 2; g.beginPath();
    const n = 40;
    for (let i = 0; i < n; i++) {
      const base = rows && rows.length ? (rows[i % rows.length].chg || 0) : 0;
      const y = 90 - (base * 6 + Math.sin(i * 0.5 + (rows ? rows.length : 0)) * 30);
      const x = (i / (n - 1)) * 320; i ? g.lineTo(x, Math.max(10, Math.min(170, y))) : g.moveTo(x, y);
    }
    g.stroke(); tex.needsUpdate = true;
  };
  drawChart(liveRef.current.marketRows);

  const pt = new THREE.Vector3(), tan = new THREE.Vector3();
  let t = 0, u = 0, dirn = 1, chartT = 99;
  return {
    update(dt) {
      t += dt;
      u += dirn * dt * 0.35;
      if (u > 1) { u = 1; dirn = -1; } else if (u < 0) { u = 0; dirn = 1; }
      // ease so the rider slows at the lips (catches air) and speeds at the bottom.
      const e = 0.5 - 0.5 * Math.cos(u * Math.PI);
      half.getPointAt(e, pt); rider.position.copy(pt);
      half.getTangentAt(e, tan); rider.rotation.z = Math.atan2(tan.y, tan.x * dirn) - Math.PI / 2;
      rider.position.z = 0; rider.position.x *= 1; // stay centered in z between rails
      const air = Math.abs(u - 0.5) * 2; // near the lips
      rider.position.y += air * 0.2 * Math.abs(Math.sin(t * 4));
      rail.material.opacity = rail2.material.opacity = 0.6 + 0.25 * Math.abs(Math.sin(t * 1.5));
      chartT += dt; if (chartT > 2) { chartT = 0; drawChart(liveRef.current.marketRows); }
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
