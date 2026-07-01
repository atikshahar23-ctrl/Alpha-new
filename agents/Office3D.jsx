import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MessageCircle, Eye, User } from "lucide-react";

/* ════════════════════════════════════════════════════════════════════
   3D OFFICE — walk the floor yourself (WASD / joystick), approach a
   coworker and talk to them face to face. Reuses the exact same desk /
   dining / meeting coordinates as the 2D layout (same OFC_* constants
   passed in as props) so the NPC behaviour scheduler in OfficeSim needs
   no changes — only the rendering + a player avatar are new.
   A New York-style office shell: a window wall with a skyline view,
   ceiling light panels + pendant lamps, a wood floor, rugs, plants and a
   lounge corner, with day/night lighting actually driven by the phase
   clock (sun colour/intensity, ambient tint and fog all lerp toward it).
   ════════════════════════════════════════════════════════════════════ */

const SCALE = 0.22; // world units per floor-percent point
const toWorld = (x, y) => [(x - 50) * SCALE, (y - 50) * SCALE];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const TALK_DIST = 2.15;
const FLOOR_W = 26, FLOOR_D = 22;

// User-supplied real desk + laptop models (converted from the Sketchfab OBJ
// downloads to optimized GLB via obj2gltf + gltf-transform). Loaded once and
// cloned per desk. Scale factors + recentring offsets were measured directly
// off each model's bounding box (desk: size 2.934×1.494×3.801, centre
// 0.813,0.747,0; laptop: size 4.063×4.049×5.828, centre -0.032,2.017,0.001 —
// both already sit base-down at y≈0 in their own space, only X needed
// recentring) so they drop onto the existing desk grid without guesswork.
const DESK_MODEL_URL = "office-models/office_desk.glb";
const LAPTOP_MODEL_URL = "office-models/thin_laptop.glb";
const DESK_SCALE = 0.37;
const DESK_CENTER_OFFSET = [-0.813 * DESK_SCALE, 0, 0];
const LAPTOP_SCALE = 0.09;
const LAPTOP_CENTER_OFFSET = [0.032 * LAPTOP_SCALE, 0, -0.001 * LAPTOP_SCALE];

function loadGltf(url) {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(url, (gltf) => resolve(gltf.scene), undefined, reject);
  });
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Deterministic wood-plank floor — warm, real-office feel instead of flat colour.
function buildFloorTexture() {
  const cvs = document.createElement("canvas");
  cvs.width = 512; cvs.height = 512;
  const ctx = cvs.getContext("2d");
  const rnd = mulberry32(42);
  const planks = ["#3a2c1e", "#40311f", "#362a1c", "#443423"];
  const plankW = 512 / 8;
  for (let col = 0; col < 8; col++) {
    ctx.fillStyle = planks[Math.floor(rnd() * planks.length)];
    ctx.fillRect(col * plankW, 0, plankW, 512);
    ctx.strokeStyle = "rgba(0,0,0,.25)"; ctx.lineWidth = 2;
    ctx.strokeRect(col * plankW, 0, plankW, 512);
    for (let s = 0; s < 6; s++) {
      const y = rnd() * 512;
      ctx.strokeStyle = "rgba(0,0,0,.12)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(col * plankW, y); ctx.lineTo(col * plankW + plankW, y + rnd() * 6 - 3); ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(FLOOR_W / 4, FLOOR_D / 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// NYC skyline at dusk, baked once into a texture — buildings + lit windows.
function buildSkylineTexture() {
  const cvs = document.createElement("canvas");
  cvs.width = 1024; cvs.height = 400;
  const ctx = cvs.getContext("2d");
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, "#1b2a55"); sky.addColorStop(0.55, "#3a3468"); sky.addColorStop(1, "#5a4a72");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 1024, 400);
  const rnd = mulberry32(7);
  const buildingColors = ["#0c1020", "#12172c", "#080b16"];
  let x = 0;
  while (x < 1024) {
    const w = 26 + rnd() * 48;
    const h = 90 + rnd() * 220;
    ctx.fillStyle = buildingColors[Math.floor(rnd() * buildingColors.length)];
    ctx.fillRect(x, 400 - h, w, h);
    // spire on some towers
    if (rnd() > 0.7) { ctx.fillRect(x + w / 2 - 2, 400 - h - 30, 4, 30); }
    // lit windows
    ctx.fillStyle = "rgba(255,208,140,.92)";
    for (let wy = 400 - h + 10; wy < 392; wy += 13) {
      for (let wx = x + 4; wx < x + w - 4; wx += 11) {
        if (rnd() > 0.5) ctx.fillRect(wx, wy, 3.4, 6);
      }
    }
    x += w + 5 + rnd() * 8;
  }
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// A personalized workstation — the user's own real desk + laptop models
// when they've loaded (desk already includes its own chair), tinted/marked
// with the agent's own color via a floor ring + a glow on the laptop
// screen; falls back to the earlier procedural sci-fi desk if either model
// failed to load, so a slow/broken asset never blanks out the room.
function buildDesk(color = 0x3a6ad8, deskTemplate = null, laptopTemplate = null) {
  const g = new THREE.Group();
  let monMat = null;

  if (deskTemplate) {
    const desk = deskTemplate.clone(true);
    desk.scale.setScalar(DESK_SCALE);
    desk.position.set(...DESK_CENTER_OFFSET);
    desk.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true; o.receiveShadow = true;
      if (o.material) o.material = o.material.clone();
    });
    g.add(desk);
  } else {
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.08, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x1c2136, roughness: 0.35, metalness: 0.3 })
    );
    top.position.y = 0.42; top.castShadow = true; top.receiveShadow = true;
    g.add(top);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x14182a, roughness: 0.5, metalness: 0.4 });
    [[-0.46, -0.22], [0.46, -0.22], [-0.46, 0.22], [0.46, 0.22]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 0.05), legMat);
      leg.position.set(lx, 0.21, lz); leg.castShadow = true; g.add(leg);
    });
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.42), new THREE.MeshStandardMaterial({ color: 0x1c2338, roughness: 0.7 }));
    chair.position.set(0, 0.24, 0.5); chair.castShadow = true; g.add(chair);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.4, 0.06), new THREE.MeshStandardMaterial({ color: 0x1c2338, roughness: 0.7 }));
    back.position.set(0, 0.46, 0.69); back.castShadow = true; g.add(back);
  }

  // Floor ring in the owner's color at the base of the desk — a consistent
  // "whose desk is this" marker regardless of the desk model's own shape.
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.72, 0.82, 24),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.015;
  g.add(ring);

  if (laptopTemplate) {
    const laptop = laptopTemplate.clone(true);
    laptop.scale.setScalar(LAPTOP_SCALE);
    laptop.rotation.y = Math.PI; // screen facing the seated character
    laptop.position.set(LAPTOP_CENTER_OFFSET[0], DESK_SCALE * 1.494, LAPTOP_CENTER_OFFSET[2] - 0.22);
    laptop.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      if (o.material) {
        o.material = o.material.clone();
        o.material.side = THREE.DoubleSide;
        if (o.material.name === "wallpeper") {
          o.material.emissive = new THREE.Color(color);
          o.material.emissiveIntensity = 0.15;
          monMat = o.material;
        }
      }
    });
    g.add(laptop);
  } else {
    const mon = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.27, 0.03),
      new THREE.MeshStandardMaterial({ color: 0x060a14, emissive: color, emissiveIntensity: 0.55, roughness: 0.3 })
    );
    mon.position.set(0, 0.74, -0.16); mon.castShadow = true; g.add(mon);
    monMat = mon.material;
  }

  // Small holographic ring floating above the desk — a personal sci-fi touch.
  const holo = new THREE.Mesh(
    new THREE.TorusGeometry(0.09, 0.008, 8, 20),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 })
  );
  holo.position.set(0, DESK_SCALE * 1.494 + 0.32, -0.16);
  holo.rotation.x = Math.PI / 2.3;
  g.add(holo);

  return { group: g, monMat, holo };
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

function buildPlant() {
  const g = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.24, 10), new THREE.MeshStandardMaterial({ color: 0x2a2016, roughness: 0.8 }));
  pot.position.y = 0.12; pot.castShadow = true;
  g.add(pot);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f7d4f, roughness: 0.7 });
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5 + Math.random() * 0.3, 6), leafMat);
    const ang = (i / 5) * Math.PI * 2;
    leaf.position.set(Math.sin(ang) * 0.06, 0.5, Math.cos(ang) * 0.06);
    leaf.rotation.z = Math.sin(ang) * 0.25;
    leaf.rotation.x = Math.cos(ang) * 0.25;
    leaf.castShadow = true;
    g.add(leaf);
  }
  return g;
}

function buildCouch() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x4a3a5a, roughness: 0.75 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.34, 0.6), mat);
  seat.position.y = 0.24; seat.castShadow = true; seat.receiveShadow = true;
  g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 0.16), mat);
  back.position.set(0, 0.55, -0.28); back.castShadow = true;
  g.add(back);
  [-0.68, 0.68].forEach((ax) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.44, 0.6), mat);
    arm.position.set(ax, 0.36, 0); arm.castShadow = true;
    g.add(arm);
  });
  return g;
}

function buildBookshelf() {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.7, 0.28), new THREE.MeshStandardMaterial({ color: 0x2a2016, roughness: 0.8 }));
  frame.position.y = 0.85; frame.castShadow = true; frame.receiveShadow = true;
  g.add(frame);
  const bookColors = [0xC0392B, 0x2980B9, 0xE4BC63, 0x27AE60, 0x8E44AD, 0xE67E22];
  for (let shelf = 0; shelf < 3; shelf++) {
    let bx = -0.5;
    while (bx < 0.5) {
      const bw = 0.06 + Math.random() * 0.06;
      const bh = 0.28 + Math.random() * 0.08;
      const book = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.2), new THREE.MeshStandardMaterial({ color: bookColors[Math.floor(Math.random() * bookColors.length)], roughness: 0.6 }));
      book.position.set(bx, 0.22 + shelf * 0.52, 0.03);
      book.castShadow = true;
      g.add(book);
      bx += bw + 0.015;
    }
  }
  return g;
}

function buildRug(w, d, color) {
  const rug = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshStandardMaterial({ color, roughness: 1, transparent: true, opacity: 0.85 })
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.008;
  rug.receiveShadow = true;
  return rug;
}

function buildPendantLamp() {
  const g = new THREE.Group();
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.0, 6), new THREE.MeshBasicMaterial({ color: 0x111111 }));
  cord.position.y = 0.5;
  g.add(cord);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.16, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0x1a1710, side: THREE.DoubleSide, roughness: 0.6 }));
  g.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffdca0 }));
  bulb.position.y = -0.05;
  g.add(bulb);
  const light = new THREE.PointLight(0xffcf8a, 0.9, 3.2);
  light.position.y = -0.08;
  g.add(light);
  return g;
}

// A real (if low-poly) human figure: skin head + avatar face sprite, shirt
// torso, arms with hands, trousers legs with shoes — built so limbs are
// Groups hinged at the shoulder/hip, giving natural walking / sitting poses
// instead of a single blob capsule.
function buildHuman(color, avatarUrl, isPlayer) {
  const g = new THREE.Group();
  const SKIN = 0xE0AC80;
  const skinMat = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.65 });
  const shirtMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x242b42, roughness: 0.75 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x14182a, roughness: 0.55 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.34, 4, 8), shirtMat);
  torso.position.y = 0.78;
  torso.castShadow = true;
  g.add(torso);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.09, 8), skinMat);
  neck.position.y = 1.0;
  g.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.165, 14, 14), skinMat);
  head.position.y = 1.15;
  head.castShadow = true;
  g.add(head);

  if (avatarUrl) {
    const tex = new THREE.TextureLoader().load(avatarUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    // A Sprite always faces the camera regardless of the parent's rotation,
    // so it can't be pushed "in front of" the head with a fixed local
    // z-offset (that offset rotates with the character and ends up behind
    // the head from some angles). Disabling depth-test + a high render
    // order instead guarantees the face always draws on top of the head
    // sphere sitting right behind it, from any angle — otherwise the face
    // was getting silently depth-occluded and every character read bald.
    const faceMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const face = new THREE.Sprite(faceMat);
    face.scale.set(0.37, 0.37, 1);
    face.position.y = 1.16;
    face.renderOrder = 999;
    g.add(face);
  }

  function buildArm(side) {
    const arm = new THREE.Group();
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.22, 3, 6), shirtMat);
    upper.position.y = -0.11;
    upper.castShadow = true;
    arm.add(upper);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), skinMat);
    hand.position.y = -0.24;
    arm.add(hand);
    arm.position.set(side * 0.24, 0.92, 0);
    return arm;
  }
  const armL = buildArm(-1), armR = buildArm(1);
  g.add(armL); g.add(armR);

  function buildLeg(side) {
    const leg = new THREE.Group();
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.32, 3, 6), pantsMat);
    upper.position.y = -0.16;
    upper.castShadow = true;
    leg.add(upper);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.06, 0.19), shoeMat);
    shoe.position.set(0, -0.35, 0.03);
    shoe.castShadow = true;
    leg.add(shoe);
    leg.position.set(side * 0.1, 0.56, 0);
    return leg;
  }
  const legL = buildLeg(-1), legR = buildLeg(1);
  g.add(legL); g.add(legR);

  if (isPlayer) {
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.12, 5),
      new THREE.MeshStandardMaterial({ color: 0xE4BC63, emissive: 0x5a4318, emissiveIntensity: 0.6 })
    );
    crown.position.y = 1.4;
    g.add(crown);
  }

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.26, 0.32, 20),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  g.add(ring);

  return { group: g, legL, legR, armL, armR, torso, ring };
}

const hexToInt = (hex) => parseInt(hex.replace("#", ""), 16);

export default function Office3D({ chars, byId, phase, phases, deskPositions, seatPositions, dineTablePositions, onClose, onOpenChat }) {
  const mountRef = useRef(null);
  const liveRef = useRef({ chars, phase, joyVec: { x: 0, y: 0 }, keys: {}, firstPerson: false });
  const [talkTarget, setTalkTarget] = useState(null);
  const [joyKnob, setJoyKnob] = useState({ x: 0, y: 0 });
  const [firstPerson, setFirstPerson] = useState(false);
  const joyDrag = useRef(null);

  useEffect(() => { liveRef.current.chars = chars; }, [chars]);
  useEffect(() => { liveRef.current.firstPerson = firstPerson; }, [firstPerson]);
  useEffect(() => { liveRef.current.phase = phase; }, [phase]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    // Load the user's own desk/laptop models before building the room —
    // both are tiny (well under 200KB combined) so this delay is negligible,
    // and it keeps the rest of the scene-building code below unchanged
    // (buildDesk just receives the templates instead of building blind).
    // If either fails to load, buildDesk() falls back to the procedural
    // desk/monitor so the room never ends up empty.
    let cancelled = false;
    let cleanupFn = () => {};
    (async () => {
      const base = import.meta.env.BASE_URL || "/";
      const [deskTemplate, laptopTemplate] = await Promise.all([
        loadGltf(base + DESK_MODEL_URL).catch((e) => { console.error("[office3d] desk model failed to load", e); return null; }),
        loadGltf(base + LAPTOP_MODEL_URL).catch((e) => { console.error("[office3d] laptop model failed to load", e); return null; }),
      ]);
      if (cancelled) return;

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
    scene.fog = new THREE.Fog(0x11162a, 16, 34);

    // Floor — warm wood texture instead of flat colour.
    const floorTex = buildFloorTexture();
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(FLOOR_W, FLOOR_D),
      new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.85 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Rugs under the meeting nook and dining room for warmth.
    {
      const cx = seatPositions.reduce((s, p) => s + p.x, 0) / seatPositions.length;
      const cy = seatPositions.reduce((s, p) => s + p.y, 0) / seatPositions.length;
      const [wx, wz] = toWorld(cx, cy);
      const rug = buildRug(3.4, 3.2, 0x3a2c1c);
      rug.position.set(wx, 0, wz);
      scene.add(rug);
    }
    if (dineTablePositions.length) {
      const cx = dineTablePositions.reduce((s, p) => s + p.x, 0) / dineTablePositions.length;
      const cy = dineTablePositions.reduce((s, p) => s + p.y, 0) / dineTablePositions.length;
      const [wx, wz] = toWorld(cx, cy);
      const rug = buildRug(6.2, 5.6, 0x2a2440);
      rug.position.set(wx, 0, wz);
      scene.add(rug);
    }

    // Ceiling + recessed light panels over the bullpen. BackSide only — the
    // chase camera sits at y=6.4 (above this ceiling's y=5.4), and a
    // DoubleSide ceiling was visible from above too, blocking the whole
    // view straight down onto the room. A real ceiling is never seen from
    // above anyway, so BackSide (visible only from inside, looking up)
    // fixes it regardless of how high any future camera mode goes.
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(FLOOR_W, FLOOR_D),
      new THREE.MeshStandardMaterial({ color: 0x0a0d18, roughness: 1, side: THREE.BackSide })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 5.4;
    scene.add(ceiling);
    const panelMat = new THREE.MeshBasicMaterial({ color: 0xdfe8ff });
    deskPositions.forEach((d, i) => {
      if (i % 4 !== 0) return; // one panel per desk row-group, not every desk
      const [wx, wz] = toWorld(d.x, d.y);
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.5), panelMat);
      panel.rotation.x = Math.PI / 2;
      panel.position.set(wx + 1.6, 5.35, wz);
      scene.add(panel);
    });

    // North window wall — floor-to-ceiling NYC skyline view.
    const skylineTex = buildSkylineTexture();
    const [nwx, nwz] = [0, -(FLOOR_D / 2) - 0.05];
    const skyWall = new THREE.Mesh(
      new THREE.PlaneGeometry(FLOOR_W, 6.4),
      new THREE.MeshBasicMaterial({ map: skylineTex })
    );
    skyWall.position.set(nwx, 3.2, nwz);
    scene.add(skyWall);
    // Window mullions for structure over the glass.
    const mullionMat = new THREE.MeshStandardMaterial({ color: 0x0e1220, roughness: 0.6 });
    for (let i = -5; i <= 5; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.08, 6.4, 0.1), mullionMat);
      m.position.set(i * (FLOOR_W / 11), 3.2, nwz + 0.03);
      scene.add(m);
    }
    // Side walls (plain — enclose the room without competing with the skyline).
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x151c30, roughness: 0.9 });
    const wallL = new THREE.Mesh(new THREE.PlaneGeometry(FLOOR_D, 6.4), wallMat);
    wallL.rotation.y = Math.PI / 2;
    wallL.position.set(-(FLOOR_W / 2) - 0.05, 3.2, 0);
    scene.add(wallL);
    const wallR = wallL.clone();
    wallR.rotation.y = -Math.PI / 2;
    wallR.position.x = (FLOOR_W / 2) + 0.05;
    scene.add(wallR);

    // Lounge corner + bookshelf for a lived-in office feel.
    const couch = buildCouch();
    couch.position.set(-9.5, 0, 8.5);
    couch.rotation.y = Math.PI;
    scene.add(couch);
    const shelf = buildBookshelf();
    shelf.position.set(-11.8, 0, 6.5);
    shelf.rotation.y = Math.PI / 2;
    scene.add(shelf);
    [[-10.4, 9.4], [10.8, -8.6], [7.6, 8.4]].forEach(([px, pz]) => {
      const plant = buildPlant();
      plant.position.set(px, 0, pz);
      scene.add(plant);
    });

    // Furniture — each desk is tinted with its owner's own color (same
    // index mapping as chars[i]'s permanent home desk).
    const deskMons = [];
    const deskHolos = [];
    deskPositions.forEach((d, i) => {
      const owner = byId(chars[i]?.id);
      const { group, monMat, holo } = buildDesk(owner ? hexToInt(owner.color) : 0x3a6ad8, deskTemplate, laptopTemplate);
      const [wx, wz] = toWorld(d.x, d.y);
      group.position.set(wx, 0, wz);
      scene.add(group);
      deskMons.push(monMat);
      deskHolos.push(holo);
    });
    dineTablePositions.forEach((t) => {
      const tbl = buildDiningTable();
      const [wx, wz] = toWorld(t.x, t.y);
      tbl.position.set(wx, 0, wz);
      scene.add(tbl);
      const lamp = buildPendantLamp();
      lamp.position.set(wx, 5.0, wz);
      scene.add(lamp);
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
    const curSky = new THREE.Color(0x1b2440);
    const tmpColor = new THREE.Color();

    const onKeyDown = (e) => { liveRef.current.keys[e.key.toLowerCase()] = true; };
    const onKeyUp = (e) => { liveRef.current.keys[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    function setSeated(h, seated, dt) {
      const target = seated ? -1.25 : 0;
      h.legL.rotation.x += (target - h.legL.rotation.x) * Math.min(1, dt * 7);
      h.legR.rotation.x += (target - h.legR.rotation.x) * Math.min(1, dt * 7);
      const torsoY = seated ? 0.7 : 0.78;
      h.torso.position.y += (torsoY - h.torso.position.y) * Math.min(1, dt * 7);
    }

    function animate() {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.05, clock.getDelta());
      const keys = liveRef.current.keys;
      const jv = liveRef.current.joyVec;

      // Day/night: lerp sun/ambient/fog toward the current phase's sky colour
      // and vary sun intensity + warmth so morning/noon/evening/night are
      // actually visible, not just a header label.
      const ph = phases[liveRef.current.phase] || phases[0];
      tmpColor.set(ph.sky || "#1b2440");
      curSky.lerp(tmpColor, Math.min(1, dt * 0.6));
      scene.fog.color.copy(curSky);
      renderer.setClearColor(curSky, 1);
      const isNight = liveRef.current.phase >= 3;
      const isEvening = liveRef.current.phase === 2;
      const sunTargetInt = isNight ? 0.35 : isEvening ? 0.8 : 1.15;
      const sunTargetHex = isNight ? 0x27407a : isEvening ? 0xffb46a : 0xfff2d8;
      sun.intensity += (sunTargetInt - sun.intensity) * Math.min(1, dt * 0.8);
      sun.color.lerp(tmpColor.set(sunTargetHex), Math.min(1, dt * 0.8));
      const ambTargetInt = isNight ? 0.35 : 0.65;
      ambient.intensity += (ambTargetInt - ambient.intensity) * Math.min(1, dt * 0.8);

      let mx = 0, mz = 0;
      if (keys["w"] || keys["arrowup"]) mz -= 1;
      if (keys["s"] || keys["arrowdown"]) mz += 1;
      if (keys["a"] || keys["arrowleft"]) mx -= 1;
      if (keys["d"] || keys["arrowright"]) mx += 1;
      mx += jv.x; mz += jv.y;
      const mlen = Math.hypot(mx, mz);
      if (mlen > 0.08) {
        mx /= mlen; mz /= mlen;
        const SPEED = 4.4;
        playerH.group.position.x = clamp(playerH.group.position.x + mx * SPEED * dt, -12.2, 12.2);
        playerH.group.position.z = clamp(playerH.group.position.z + mz * SPEED * dt, -10.2, 10.2);
        const targetRot = Math.atan2(mx, mz);
        let dRot = targetRot - playerH.group.rotation.y;
        while (dRot > Math.PI) dRot -= Math.PI * 2;
        while (dRot < -Math.PI) dRot += Math.PI * 2;
        playerH.group.rotation.y += dRot * Math.min(1, dt * 10);
        walkT += dt * 9;
        playerH.legL.rotation.x = Math.sin(walkT) * 0.6;
        playerH.legR.rotation.x = Math.sin(walkT + Math.PI) * 0.6;
        playerH.armL.rotation.x = Math.sin(walkT + Math.PI) * 0.5;
        playerH.armR.rotation.x = Math.sin(walkT) * 0.5;
      } else {
        playerH.legL.rotation.x *= 0.8; playerH.legR.rotation.x *= 0.8;
        playerH.armL.rotation.x *= 0.8; playerH.armR.rotation.x *= 0.8;
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
          h.armL.rotation.x = Math.sin(walkT * 1.1 + Math.PI) * 0.45;
          h.armR.rotation.x = Math.sin(walkT * 1.1) * 0.45;
          setSeated(h, false, dt);
        } else {
          const seated = c.status === "work" || c.status === "meet" || c.status === "eat";
          setSeated(h, seated, dt);
          h.legL.rotation.x *= 0.85; h.legR.rotation.x *= 0.85;
          if (seated && c.status === "work") {
            // subtle typing motion
            h.armL.rotation.x = -1.15 + Math.sin(clock.elapsedTime * 6 + h.group.position.x) * 0.06;
            h.armR.rotation.x = -1.15 + Math.sin(clock.elapsedTime * 6.3 + h.group.position.x) * 0.06;
          } else {
            h.armL.rotation.x *= 0.85; h.armR.rotation.x *= 0.85;
          }
        }
      });

      // desk monitor glow follows work status (index i is agent i's home desk,
      // same 1:1 mapping the 2D behaviour scheduler already relies on).
      deskMons.forEach((mat, i) => {
        const owner = liveChars[i];
        const occ = !!owner && owner.status === "work" && !owner.walking;
        mat.emissiveIntensity = occ ? 0.5 + Math.sin(clock.elapsedTime * 2.2) * 0.25 : 0.15;
      });
      deskHolos.forEach((holo, i) => { if (holo) holo.rotation.z = clock.elapsedTime * 0.6 + i; });

      // camera: third-person chase cam by default, or first-person from the
      // player's own eyes (toggle button) — own body hidden in first-person
      // so it doesn't block the view from the inside.
      if (liveRef.current.firstPerson) {
        playerH.group.visible = false;
        const eyeY = 1.32;
        const fx = Math.sin(playerH.group.rotation.y), fz = Math.cos(playerH.group.rotation.y);
        const eyePos = new THREE.Vector3(playerH.group.position.x, eyeY, playerH.group.position.z);
        camera.position.lerp(eyePos, 0.4);
        camera.lookAt(eyePos.x + fx, eyeY, eyePos.z + fz);
      } else {
        playerH.group.visible = true;
        const camOffset = new THREE.Vector3(0, 6.4, 7.6);
        const desired = playerH.group.position.clone().add(camOffset);
        camera.position.lerp(desired, 0.07);
        camera.lookAt(playerH.group.position.x, 1.1, playerH.group.position.z);
      }

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

      cleanupFn = () => {
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
    })();

    return () => { cancelled = true; cleanupFn(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <button className="off3-view-toggle" onClick={() => setFirstPerson((v) => !v)} title="החלף תצוגה">
        {firstPerson ? <User size={18} /> : <Eye size={18} />}
      </button>
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
