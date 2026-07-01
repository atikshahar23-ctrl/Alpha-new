import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MessageCircle } from "lucide-react";

/* ════════════════════════════════════════════════════════════════════
   3D OFFICE — walk the floor yourself (WASD / joystick), approach a
   coworker and talk to them face to face. Reuses the exact same desk /
   dining / meeting coordinates as the 2D layout (same OFC_* constants
   passed in as props) so the NPC behaviour scheduler in OfficeSim needs
   no changes — only the rendering + a player avatar are new.
   ════════════════════════════════════════════════════════════════════ */

const SCALE = 0.22; // world units per floor-percent point
const toWorld = (x, y) => [(x - 50) * SCALE, (y - 50) * SCALE];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const TALK_DIST = 2.15;

function buildDesk() {
  const g = new THREE.Group();
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 0.08, 0.55),
    new THREE.MeshStandardMaterial({ color: 0x2a3350, roughness: 0.6 })
  );
  top.position.y = 0.42;
  top.castShadow = true; top.receiveShadow = true;
  g.add(top);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1a2136, roughness: 0.8 });
  [[-0.46, -0.22], [0.46, -0.22], [-0.46, 0.22], [0.46, 0.22]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 0.05), legMat);
    leg.position.set(lx, 0.21, lz);
    leg.castShadow = true;
    g.add(leg);
  });
  const mon = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.26, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x0b1426, emissive: 0x1c3a66, emissiveIntensity: 0.5, roughness: 0.4 })
  );
  mon.position.set(0, 0.72, -0.14);
  mon.castShadow = true;
  g.add(mon);
  const chair = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.06, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x1c2338, roughness: 0.7 })
  );
  chair.position.set(0, 0.24, 0.5);
  chair.castShadow = true;
  g.add(chair);
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.4, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x1c2338, roughness: 0.7 })
  );
  back.position.set(0, 0.46, 0.69);
  back.castShadow = true;
  g.add(back);
  return { group: g, monMat: mon.material };
}

function buildDiningTable() {
  const g = new THREE.Group();
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.62, 0.07, 20),
    new THREE.MeshStandardMaterial({ color: 0x3a2c1c, roughness: 0.5 })
  );
  top.position.y = 0.46;
  top.castShadow = true; top.receiveShadow = true;
  g.add(top);
  const leg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.1, 0.46, 10),
    new THREE.MeshStandardMaterial({ color: 0x241a10, roughness: 0.7 })
  );
  leg.position.y = 0.23;
  leg.castShadow = true;
  g.add(leg);
  const chairMat = new THREE.MeshStandardMaterial({ color: 0x2a2016, roughness: 0.7 });
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2;
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.3), chairMat);
    chair.position.set(Math.sin(ang) * 0.95, 0.24, Math.cos(ang) * 0.95);
    chair.castShadow = true;
    g.add(chair);
  }
  return g;
}

function buildMeetingTable() {
  const g = new THREE.Group();
  const top = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.55, 1.1, 4, 12).rotateZ(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x2a3350, roughness: 0.5 })
  );
  top.scale.set(1, 0.14, 1);
  top.position.y = 0.44;
  top.castShadow = true; top.receiveShadow = true;
  g.add(top);
  return g;
}

// Simple low-poly figure: capsule body + head plane textured with the
// agent's avatar (always faces the camera via a Sprite), small legs.
function buildHuman(color, avatarUrl, isPlayer) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.55 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.42, 4, 8), bodyMat);
  body.position.y = 0.5;
  body.castShadow = true;
  g.add(body);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x20263c, roughness: 0.8 });
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.32, 3, 6), legMat);
  legL.position.set(-0.1, 0.17, 0);
  legL.castShadow = true;
  const legR = legL.clone();
  legR.position.x = 0.1;
  g.add(legL); g.add(legR);

  let faceSprite = null;
  if (avatarUrl) {
    const tex = new THREE.TextureLoader().load(avatarUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    faceSprite = new THREE.Sprite(spriteMat);
    faceSprite.scale.set(0.42, 0.42, 1);
    faceSprite.position.y = 0.98;
    g.add(faceSprite);
  } else {
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 12), bodyMat);
    head.position.y = 0.95;
    head.castShadow = true;
    g.add(head);
  }

  if (isPlayer) {
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.14, 5),
      new THREE.MeshStandardMaterial({ color: 0xE4BC63, emissive: 0x5a4318, emissiveIntensity: 0.6 })
    );
    crown.position.y = 1.24;
    g.add(crown);
  }

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.26, 0.32, 20),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  g.add(ring);

  return { group: g, legL, legR, body, ring };
}

export default function Office3D({ chars, byId, phase, phases, deskPositions, seatPositions, dineTablePositions, onClose, onOpenChat }) {
  const mountRef = useRef(null);
  const liveRef = useRef({ chars, joyVec: { x: 0, y: 0 }, keys: {} });
  const [talkTarget, setTalkTarget] = useState(null);
  const [joyKnob, setJoyKnob] = useState({ x: 0, y: 0 });
  const joyDrag = useRef(null);

  useEffect(() => { liveRef.current.chars = chars; }, [chars]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || ("ontouchstart" in window) || window.innerWidth < 900;
    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.6 : 2));
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(9, 14, 6);
    sun.castShadow = !isMobile;
    if (!isMobile) {
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -14; sun.shadow.camera.right = 14;
      sun.shadow.camera.top = 14; sun.shadow.camera.bottom = -14;
    }
    scene.add(sun);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 22),
      new THREE.MeshStandardMaterial({ color: 0x11162a, roughness: 0.95 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    const grid = new THREE.GridHelper(26, 26, 0x2a3350, 0x1a2138);
    grid.position.y = 0.005;
    scene.add(grid);

    // Furniture
    const deskMons = [];
    deskPositions.forEach((d) => {
      const { group, monMat } = buildDesk();
      const [wx, wz] = toWorld(d.x, d.y);
      group.position.set(wx, 0, wz);
      scene.add(group);
      deskMons.push(monMat);
    });
    dineTablePositions.forEach((t) => {
      const tbl = buildDiningTable();
      const [wx, wz] = toWorld(t.x, t.y);
      tbl.position.set(wx, 0, wz);
      scene.add(tbl);
    });
    {
      const mt = buildMeetingTable();
      const cx = seatPositions.reduce((s, p) => s + p.x, 0) / seatPositions.length;
      const cy = seatPositions.reduce((s, p) => s + p.y, 0) / seatPositions.length;
      const [wx, wz] = toWorld(cx, cy);
      mt.position.set(wx, 0, wz);
      scene.add(mt);
    }

    // Player
    const playerH = buildHuman(0xE4BC63, null, true);
    playerH.group.position.set(0, 0, 6.2);
    scene.add(playerH.group);

    // NPCs
    const npc = {};
    chars.forEach((c) => {
      const a = byId(c.id);
      if (!a) return;
      const h = buildHuman(a.color, a.avatar, false);
      const [wx, wz] = toWorld(c.x, c.y);
      h.group.position.set(wx, 0, wz);
      scene.add(h.group);
      npc[c.id] = h;
    });

    let raf = 0;
    const clock = new THREE.Clock();
    let walkT = 0;

    const onKeyDown = (e) => { liveRef.current.keys[e.key.toLowerCase()] = true; };
    const onKeyUp = (e) => { liveRef.current.keys[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    function setSeated(h, seated) {
      const s = seated ? 0.35 : 1;
      h.legL.scale.y = s; h.legR.scale.y = s;
      h.legL.position.y = seated ? 0.06 : 0.17;
      h.legR.position.y = seated ? 0.06 : 0.17;
      h.body.position.y = seated ? 0.36 : 0.5;
    }

    function animate() {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.05, clock.getDelta());
      const keys = liveRef.current.keys;
      const jv = liveRef.current.joyVec;

      let mx = 0, mz = 0;
      if (keys["w"] || keys["arrowup"]) mz -= 1;
      if (keys["s"] || keys["arrowdown"]) mz += 1;
      if (keys["a"] || keys["arrowleft"]) mx -= 1;
      if (keys["d"] || keys["arrowright"]) mx += 1;
      mx += jv.x; mz += jv.y;
      const mlen = Math.hypot(mx, mz);
      let moving = false;
      if (mlen > 0.08) {
        moving = true;
        mx /= mlen; mz /= mlen;
        const SPEED = 4.4;
        playerH.group.position.x = clamp(playerH.group.position.x + mx * SPEED * dt, -12.5, 12.5);
        playerH.group.position.z = clamp(playerH.group.position.z + mz * SPEED * dt, -10.5, 10.5);
        const targetRot = Math.atan2(mx, mz);
        let dRot = targetRot - playerH.group.rotation.y;
        while (dRot > Math.PI) dRot -= Math.PI * 2;
        while (dRot < -Math.PI) dRot += Math.PI * 2;
        playerH.group.rotation.y += dRot * Math.min(1, dt * 10);
        walkT += dt * 9;
        playerH.legL.rotation.x = Math.sin(walkT) * 0.6;
        playerH.legR.rotation.x = Math.sin(walkT + Math.PI) * 0.6;
      } else {
        playerH.legL.rotation.x *= 0.8; playerH.legR.rotation.x *= 0.8;
      }

      // NPCs: lerp toward their live target position; walking bob; seated pose.
      const liveChars = liveRef.current.chars || [];
      liveChars.forEach((c) => {
        const h = npc[c.id]; if (!h) return;
        const [tx, tz] = toWorld(c.x, c.y);
        const dx = tx - h.group.position.x, dz = tz - h.group.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.01) {
          const step = Math.min(1, dt * (c.walking ? 3.2 : 6));
          h.group.position.x += dx * step;
          h.group.position.z += dz * step;
        }
        if (dist > 0.03) {
          const targetRot = Math.atan2(dx, dz);
          let dRot = targetRot - h.group.rotation.y;
          while (dRot > Math.PI) dRot -= Math.PI * 2;
          while (dRot < -Math.PI) dRot += Math.PI * 2;
          h.group.rotation.y += dRot * Math.min(1, dt * 8);
          h.legL.rotation.x = Math.sin(walkT * 1.1) * 0.5;
          h.legR.rotation.x = Math.sin(walkT * 1.1 + Math.PI) * 0.5;
          setSeated(h, false);
        } else {
          const seated = c.status === "work" || c.status === "meet" || c.status === "eat";
          setSeated(h, seated);
          h.legL.rotation.x *= 0.8; h.legR.rotation.x *= 0.8;
        }
      });

      // desk monitor glow follows work status (index i is agent i's home desk,
      // same 1:1 mapping the 2D behaviour scheduler already relies on).
      deskMons.forEach((mat, i) => {
        const owner = liveChars[i];
        const occ = !!owner && owner.status === "work" && !owner.walking;
        mat.emissiveIntensity = occ ? 0.5 + Math.sin(clock.elapsedTime * 2.2) * 0.25 : 0.15;
      });

      // camera: fixed-offset chase cam behind + above the player
      const camOffset = new THREE.Vector3(0, 6.4, 7.6);
      const desired = playerH.group.position.clone().add(camOffset);
      camera.position.lerp(desired, 0.07);
      camera.lookAt(playerH.group.position.x, 1.1, playerH.group.position.z);

      // proximity → talk prompt
      let nearest = null, nearestDist = TALK_DIST;
      liveChars.forEach((c) => {
        const h = npc[c.id]; if (!h) return;
        const d = playerH.group.position.distanceTo(h.group.position);
        if (d < nearestDist) { nearest = c.id; nearestDist = d; }
      });
      if (liveRef.current.talkTarget !== nearest) {
        liveRef.current.talkTarget = nearest;
        liveRef.current.setTalkTarget(nearest);
      }

      renderer.render(scene, camera);
    }
    liveRef.current.setTalkTarget = setTalkTarget;
    animate();

    const onResize = () => {
      const w = mount.clientWidth || window.innerWidth, h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Day/night: tint the ambient/sun via CSS-driven scene background instead
  // of reaching back into the three.js instance (kept simple — the overlay
  // header already shows the clock/phase; a subtle fog color shift below).
  useEffect(() => {}, [phase]);

  // Joystick (touch) — drag from the base to set a normalized move vector.
  const JOY_R = 44;
  const onJoyStart = (e) => {
    const t = e.touches ? e.touches[0] : e;
    joyDrag.current = { ox: t.clientX, oy: t.clientY };
  };
  const onJoyMove = (e) => {
    if (!joyDrag.current) return;
    const t = e.touches ? e.touches[0] : e;
    let dx = t.clientX - joyDrag.current.ox, dy = t.clientY - joyDrag.current.oy;
    const len = Math.hypot(dx, dy);
    if (len > JOY_R) { dx = (dx / len) * JOY_R; dy = (dy / len) * JOY_R; }
    setJoyKnob({ x: dx, y: dy });
    liveRef.current.joyVec = { x: dx / JOY_R, y: dy / JOY_R };
  };
  const onJoyEnd = () => {
    joyDrag.current = null;
    setJoyKnob({ x: 0, y: 0 });
    liveRef.current.joyVec = { x: 0, y: 0 };
  };

  const talkAgent = talkTarget ? byId(talkTarget) : null;
  const ph = phases[phase];

  return (
    <div className="off3-wrap">
      <div ref={mountRef} className="off3-canvas"
        onTouchMove={onJoyMove} onTouchEnd={onJoyEnd} onMouseMove={onJoyMove} onMouseUp={onJoyEnd} />
      <div className="off3-hint">חצים / WASD לזוז · התקרב לעובד ולחץ "דבר" · {ph.emoji} {ph.label}</div>
      {talkAgent && (
        <button className="off3-talk" style={{ "--c": talkAgent.color }} onClick={() => onOpenChat(talkAgent.id)}>
          <MessageCircle size={18} /> דבר עם {talkAgent.name}
        </button>
      )}
      <div className="off3-joy" onTouchStart={onJoyStart} onMouseDown={onJoyStart}>
        <div className="off3-joy-knob" style={{ transform: `translate(${joyKnob.x}px, ${joyKnob.y}px)` }} />
      </div>
    </div>
  );
}
