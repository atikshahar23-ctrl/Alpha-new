// ── Module 23 · Cyber-Warfare 'Red Alert' Event ────────────────────────────
//
// A holographic firewall terminal + a full ship-lockdown mechanic. On trigger
// (press F9, or call liveRef.triggerRedAlert()) the deck blacks out (host reads
// liveRef.redAlert), rotating red sirens sweep the bridge and a two-tone klaxon
// blares via Web Audio. Neutralize by entering the combo on a gamepad
// (D-Pad Up, Down, Left, Right, then A) OR the keyboard (Arrow Up, Down, Left,
// Right, then A). Auto-stands-down after 20s so it can never trap the sim.
export function createRedAlert(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles } = ctx;
  const SPOT = { x: -33, z: -22 };

  // Firewall terminal (always present).
  const term = new THREE.Group();
  term.position.set(SPOT.x, 0, SPOT.z);
  scene.add(term); markDynamic(term);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.0 });
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.62, 1.6, 6), new THREE.MeshStandardMaterial({ color: 0x140a0a, metalness: 0.6, roughness: 0.4 }));
  pillar.position.y = 0.8; term.add(pillar);
  const shield = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, wireframe: true, transparent: true, opacity: 0.7, toneMapped: false }));
  shield.position.y = 2.0; term.add(shield);
  const shieldCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 0), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, toneMapped: false }));
  shieldCore.position.y = 2.0; term.add(shieldCore);
  const termLight = new THREE.PointLight(0x2ee6ff, 0.5, 6); termLight.position.y = 2.0; term.add(termLight);
  const sign = helpers.buildNeonSign("FIREWALL", 0x2ee6ff, 1.8, 0.42); sign.position.set(0, 2.9, 0); term.add(sign);
  const promptCvs = document.createElement("canvas"); promptCvs.width = 512; promptCvs.height = 96; const promptTex = new THREE.CanvasTexture(promptCvs);
  const promptSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: promptTex, transparent: true, depthWrite: false })); promptSpr.scale.set(3.4, 0.64, 1); promptSpr.position.set(0, 3.5, 0); promptSpr.visible = false; term.add(promptSpr);

  // Rotating sirens over the deck centre.
  const sirens = new THREE.Group(); sirens.position.set(0, 4.6, 0); sirens.visible = false;
  scene.add(sirens); markDynamic(sirens);
  const sirenLights = [];
  for (let i = 0; i < 2; i++) {
    const l = new THREE.SpotLight(0xff2020, 0, 40, Math.PI / 5, 0.5, 1.2);
    l.position.set(0, 0, 0); l.target.position.set(Math.cos(i * Math.PI) * 10, -6, Math.sin(i * Math.PI) * 10);
    sirens.add(l); sirens.add(l.target);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff2020, toneMapped: false }));
    bulb.position.copy(l.target.position).normalize().multiplyScalar(0.4); sirens.add(bulb);
    sirenLights.push(l);
  }

  // Klaxon (Web Audio, lazy).
  let actx = null, klaxOsc = null, klaxGain = null;
  const klaxonOn = () => {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume().catch(() => {});
      if (klaxOsc) return;
      klaxOsc = actx.createOscillator(); klaxOsc.type = "sawtooth"; klaxOsc.frequency.value = 420;
      const lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1200;
      klaxGain = actx.createGain(); klaxGain.gain.value = 0.0;
      klaxOsc.connect(lp); lp.connect(klaxGain); klaxGain.connect(actx.destination); klaxOsc.start();
    } catch {}
  };
  const klaxonOff = () => { try { if (klaxOsc) { klaxOsc.stop(); klaxOsc.disconnect(); klaxOsc = null; } } catch {} };

  // Neutralize combo state.
  const GP_SEQ = [12, 13, 14, 15, 0];          // D-pad U,D,L,R + A
  const KB_SEQ = ["arrowup", "arrowdown", "arrowleft", "arrowright", "a"];
  let seqIdx = 0, active = false, alertT = 0, prevBtn = {};
  const drawPrompt = () => {
    const g = promptCvs.getContext("2d"); g.clearRect(0, 0, 512, 96);
    g.fillStyle = "rgba(30,0,0,0.85)"; g.fillRect(0, 0, 512, 96); g.strokeStyle = "#ff4040"; g.lineWidth = 3; g.strokeRect(3, 3, 506, 90);
    g.textAlign = "center"; g.fillStyle = "#ff6b6b"; g.font = "700 22px system-ui"; g.fillText("⚠ פריצת סייבר — נטרל איום", 256, 34);
    const seq = ["↑", "↓", "←", "→", "A"];
    g.font = "700 26px system-ui";
    seq.forEach((s, i) => { g.fillStyle = i < seqIdx ? "#3fd79a" : "#fff"; g.fillText(s, 130 + i * 63, 74); });
    promptTex.needsUpdate = true;
  };
  const neutralize = () => { active = false; seqIdx = 0; liveRef.current.redAlert = false; sirens.visible = false; promptSpr.visible = false; klaxonOff(); };
  const trigger = () => { if (active) return; active = true; alertT = 0; seqIdx = 0; liveRef.current.redAlert = true; sirens.visible = true; promptSpr.visible = true; drawPrompt(); klaxonOn(); };
  liveRef.current.triggerRedAlert = trigger;

  const onKey = (e) => {
    const k = (e.key || "").toLowerCase();
    if (e.code === "F9") { trigger(); return; }
    if (!active) return;
    if (k === KB_SEQ[seqIdx]) { seqIdx++; drawPrompt(); if (seqIdx >= KB_SEQ.length) neutralize(); }
    else if (KB_SEQ.includes(k)) { seqIdx = (k === KB_SEQ[0]) ? 1 : 0; drawPrompt(); }
  };
  window.addEventListener("keydown", onKey);

  let t = 0;
  return {
    update(dt) {
      t += dt;
      shield.rotation.y += dt * (active ? 3 : 0.5); shield.rotation.x += dt * 0.3;
      shield.material.color.setHex(active ? 0xff3030 : 0x2ee6ff);
      shieldCore.material.color.setHex(active ? 0xff3030 : 0x2ee6ff);
      termLight.color.setHex(active ? 0xff2020 : 0x2ee6ff);
      if (active) {
        alertT += dt;
        sirens.rotation.y += dt * 3.5;
        const pulse = 0.5 + 0.5 * Math.sin(t * 10);
        sirenLights.forEach((l) => { l.intensity = pulse * 6; });
        if (klaxGain && actx) klaxGain.gain.setTargetAtTime(0.12, actx.currentTime, 0.05);
        if (klaxOsc) klaxOsc.frequency.setValueAtTime(Math.sin(t * 5) > 0 ? 440 : 300, actx.currentTime);
        // gamepad combo
        const gp = (typeof navigator !== "undefined" && navigator.getGamepads) ? navigator.getGamepads()[0] : null;
        if (gp) {
          GP_SEQ.forEach((bi) => {
            const pressed = gp.buttons[bi] && gp.buttons[bi].pressed;
            if (pressed && !prevBtn[bi]) {
              if (bi === GP_SEQ[seqIdx]) { seqIdx++; drawPrompt(); if (seqIdx >= GP_SEQ.length) neutralize(); }
              else { seqIdx = 0; drawPrompt(); }
            }
            prevBtn[bi] = pressed;
          });
        }
        if (alertT > 20) neutralize(); // fail-safe stand-down
      } else {
        shieldCore.scale.setScalar(1 + 0.08 * Math.sin(t * 2));
      }
    },
    dispose() {
      window.removeEventListener("keydown", onKey);
      klaxonOff(); if (actx) { try { actx.close(); } catch {} }
      liveRef.current.redAlert = false;
      scene.remove(term); scene.remove(sirens);
      [term, sirens].forEach((grp) => grp.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); }));
    },
  };
}
