// ── Module 55 · The Self-Destruct Sequence ─────────────────────────────────
//
// A safety-locked console. It does NOTHING until explicitly armed
// (liveRef.armSelfDestruct() → liveRef.selfDestructArmed = true). Only while
// armed does holding the red gamepad button (or liveRef.triggerSelfDestruct())
// start a 10-second klaxon countdown; disarming aborts it cleanly. At zero the
// screen floods pure white and the app calls window.location.reload(). Because
// it never auto-arms, it can never fire on its own — safe by default.
export function createSelfDestruct(ctx) {
  const { THREE, scene, camera, markDynamic, helpers, liveRef, obstacles } = ctx;
  const SPOT = { x: 36, z: -14 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.0 });

  const console_ = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.7), new THREE.MeshStandardMaterial({ color: 0x1c1416, metalness: 0.6, roughness: 0.4, emissive: 0x200000, emissiveIntensity: 0.25 }));
  console_.position.y = 0.7; group.add(console_);
  const keyslot = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12), new THREE.MeshStandardMaterial({ color: 0x554400, metalness: 0.8, roughness: 0.3, emissive: 0x221a00, emissiveIntensity: 0.5 }));
  keyslot.rotation.x = Math.PI / 2; keyslot.position.set(-0.4, 0.9, 0.36); group.add(keyslot);
  const redBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 20), new THREE.MeshStandardMaterial({ color: 0xff2020, metalness: 0.3, roughness: 0.3, emissive: 0x400000, emissiveIntensity: 0.5 }));
  redBtn.rotation.x = Math.PI / 2; redBtn.position.set(0.3, 0.95, 0.36); group.add(redBtn);
  const cvs = document.createElement("canvas"); cvs.width = 256; cvs.height = 128; const tex = new THREE.CanvasTexture(cvs);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.55), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false })); screen.position.set(0, 1.35, 0.36); group.add(screen);
  const sign = helpers.buildNeonSign("SELF-DESTRUCT", 0xff2020, 2.2, 0.42); sign.position.set(0, 2.3, 0); group.add(sign);

  // Full-frame red alarm + terminal white flood (camera child).
  const alarmMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: false });
  const alarm = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), alarmMat); alarm.frustumCulled = false; alarm.renderOrder = 996; alarm.position.z = -0.5; camera.add(alarm);
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: false });
  const white = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), whiteMat); white.frustumCulled = false; white.renderOrder = 999; white.position.z = -0.49; camera.add(white);

  const draw = (armed, count) => {
    const g = cvs.getContext("2d"); g.clearRect(0, 0, 256, 128);
    g.fillStyle = count != null ? "rgba(40,0,0,0.92)" : (armed ? "rgba(30,20,0,0.9)" : "rgba(10,10,12,0.85)"); g.fillRect(0, 0, 256, 128);
    g.strokeStyle = count != null ? "#ff2020" : (armed ? "#ffcc33" : "#556"); g.lineWidth = 3; g.strokeRect(3, 3, 250, 122);
    g.textAlign = "center";
    if (count != null) { g.fillStyle = "#ff4040"; g.font = "800 30px system-ui"; g.fillText("⚠ SELF-DESTRUCT", 128, 44); g.fillStyle = "#fff"; g.font = "900 46px system-ui"; g.fillText("T-" + Math.ceil(count), 128, 100); }
    else if (armed) { g.fillStyle = "#ffcc33"; g.font = "800 24px system-ui"; g.fillText("ARMED", 128, 52); g.fillStyle = "#e0c060"; g.font = "600 16px system-ui"; g.fillText("לחצן אדום להפעלה", 128, 90); }
    else { g.fillStyle = "#7f8090"; g.font = "700 22px system-ui"; g.fillText("LOCKED", 128, 52); g.fillStyle = "#556"; g.font = "600 15px system-ui"; g.fillText("דורש מפתח הפעלה", 128, 88); }
    tex.needsUpdate = true;
  };
  draw(false, null);

  let counting = -1, t = 0, prevRed = false, drawT = 99, detonated = false;
  liveRef.current.armSelfDestruct = () => { liveRef.current.selfDestructArmed = true; };
  liveRef.current.disarmSelfDestruct = () => { liveRef.current.selfDestructArmed = false; counting = -1; };
  const begin = () => { if (liveRef.current.selfDestructArmed && counting < 0) counting = 10; };
  liveRef.current.triggerSelfDestruct = begin;

  return {
    update(dt) {
      t += dt;
      const armed = !!liveRef.current.selfDestructArmed;
      // red gamepad button (standard mapping: index 1 = B / red) — only matters while armed
      let redDown = false;
      try { const pads = navigator.getGamepads ? navigator.getGamepads() : []; for (const g of pads) { if (g && g.buttons && g.buttons[1] && g.buttons[1].pressed) redDown = true; } } catch { /* ignore */ }
      if (armed && redDown && !prevRed) begin();
      prevRed = redDown;
      redBtn.material.emissiveIntensity = armed ? 0.5 + 0.5 * Math.abs(Math.sin(t * 6)) : 0.3;
      keyslot.material.emissiveIntensity = armed ? 0.7 : 0.4;

      if (counting >= 0 && !detonated) {
        counting -= dt;
        if (!liveRef.current.selfDestructArmed) { counting = -1; } // disarm aborts
        else {
          const blink = 0.5 + 0.5 * Math.sin(t * 18);
          alarmMat.opacity = 0.15 + 0.3 * blink;
          if (counting <= 0) {
            detonated = true; alarmMat.opacity = 0;
            // flood white, then reload on the next tick after it paints.
            whiteMat.opacity = 1;
            liveRef.current.selfDestructArmed = false;
            setTimeout(() => { try { window.location.reload(); } catch { /* ignore */ } }, 260);
          }
        }
      } else if (!detonated) {
        alarmMat.opacity = Math.max(0, alarmMat.opacity - dt * 2);
      }
      drawT += dt; if (drawT > 0.2) { drawT = 0; draw(armed, counting >= 0 ? counting : null); }
    },
    dispose() {
      liveRef.current.selfDestructArmed = false;
      [alarm, white].forEach((q) => { if (q.parent) q.parent.remove(q); q.geometry.dispose(); q.material.dispose(); });
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
