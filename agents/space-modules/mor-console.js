// ── Module 31 · Co-Captain's Override Terminal (Mor's Console) ──────────────
//
// A sleek high-priority white/gold console. When a VIP 'Home' message arrives
// (fired periodically, or via liveRef.triggerVipHome()) it takes command: the
// deck softly dims (host reads liveRef.vipOverride), the reactor/audio "engine"
// ducks, and the console glows with an incoming-family banner for a few
// seconds before releasing control back.
export function createMorConsole(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles } = ctx;
  const GOLD = 0xF0D48A;
  const SPOT = { x: 30, z: -22 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.0 });

  const desk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 0.6), new THREE.MeshStandardMaterial({ color: 0xf4efe6, metalness: 0.5, roughness: 0.25, emissive: 0x20180a, emissiveIntensity: 0.2 }));
  desk.position.y = 0.9; desk.rotation.y = 0.5; group.add(desk);
  const trim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 8, 40), new THREE.MeshBasicMaterial({ color: GOLD, toneMapped: false }));
  trim.rotation.x = Math.PI / 2; trim.position.y = 1.4; group.add(trim);
  const cvs = document.createElement("canvas"); cvs.width = 420; cvs.height = 180; const tex = new THREE.CanvasTexture(cvs);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.73), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
  screen.position.set(0, 1.55, 0); group.add(screen);
  const sign = helpers.buildNeonSign("MOR · CO-CAPTAIN", GOLD, 2.3, 0.42); sign.position.set(0, 2.4, 0); group.add(sign);

  const draw = (active) => {
    const g = cvs.getContext("2d"); g.clearRect(0, 0, 420, 180);
    g.fillStyle = active ? "rgba(30,24,8,0.9)" : "rgba(10,12,18,0.85)"; g.fillRect(0, 0, 420, 180);
    g.strokeStyle = "rgba(240,212,138,0.7)"; g.lineWidth = 3; g.strokeRect(4, 4, 412, 172);
    g.textAlign = "center";
    if (active) {
      g.fillStyle = "#F0D48A"; g.font = "800 30px system-ui"; g.fillText("📞 הודעת בית · VIP", 210, 60);
      g.fillStyle = "#fff"; g.font = "600 22px system-ui"; g.fillText("עוקף מצבי חירום · השתקת מנוע", 210, 104);
      g.fillStyle = "#8fe0c0"; g.font = "600 18px system-ui"; g.fillText("ערוץ פרטי פעיל", 210, 142);
    } else {
      g.fillStyle = "#cfe0f5"; g.font = "700 24px system-ui"; g.fillText("קונסולת מפקדת-משנה", 210, 78);
      g.fillStyle = "#7f93b0"; g.font = "600 18px system-ui"; g.fillText("ממתין לערוץ בית…", 210, 116);
    }
    tex.needsUpdate = true;
  };
  draw(false);

  let t = 0, active = false, activeT = 0, timer = 20;
  const trigger = () => { if (!active) { active = true; activeT = 6; liveRef.current.vipOverride = true; draw(true); } };
  liveRef.current.triggerVipHome = trigger;
  return {
    update(dt) {
      t += dt; timer -= dt;
      if (timer <= 0) { trigger(); timer = 40 + Math.random() * 30; }
      if (active) {
        activeT -= dt;
        trim.material.color.setHSL(0.12, 0.7, 0.55 + 0.15 * Math.sin(t * 3));
        if (activeT <= 0) { active = false; liveRef.current.vipOverride = false; draw(false); }
      } else {
        trim.material.color.setHex(GOLD);
      }
    },
    dispose() {
      liveRef.current.vipOverride = false;
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
