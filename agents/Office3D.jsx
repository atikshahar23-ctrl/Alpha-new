import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
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
// Every desk in the grid sits at the same (unrotated) orientation, so one
// fixed heading makes every seated worker face their own monitor — value
// tuned by eye against the desk model's own screen-facing direction.
const DESK_FACE_ROT = 0;

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

// User-supplied rigged "Casual Male" character (FBX → GLB, 15 baked
// animation clips) — temporarily standing in for every agent + the player
// per the owner's request. Bbox measured directly off the model: size
// 1.696×1.888×0.383, centre 0,0.940,-0.019 (feet already sit at y≈0). Scale
// chosen so the total height roughly matches the old procedural figure
// (~1.35 world units) that the desk/camera/TALK_DIST constants were tuned for.
const CHAR_MODEL_URL = "office-models/casual_male.glb";
const CHAR_SCALE = 0.72;
const CHAR_CENTER_OFFSET = [-0.0 * CHAR_SCALE, 0, 0.019 * CHAR_SCALE];
// Clip names are baked as "Rig|<name>" — the "_in_place" walk/run variants
// have no root motion, so they can loop under a character whose position is
// already driven manually (WASD for the player, lerp-to-target for NPCs)
// without the animation itself also sliding the mesh forward.
const CLIP = { idle: "man_idle", walk: "man_walk_in_place", sit: "man_sit_idle" };

// User-supplied real furniture pack (40 named pieces in one GLB, a home/
// office asset set) — only the pieces that make sense in an office are used
// (lounge, break-room, storage); measuring each named node's own local bbox
// showed they're already real-world-meter scale sitting base-down at y≈0,
// same as this scene's units, so pieces are placed with no extra scale/
// recentring — just position + a facing rotation per spot.
const FURNITURE_MODEL_URL = "office-models/furniture.glb";
function placeFurniturePiece(scene, template, name, x, y, z, rotY = 0) {
  if (!template) return null;
  const node = template.getObjectByName(name);
  if (!node) return null;
  const piece = node.clone(true);
  piece.position.set(x, y, z);
  piece.rotation.y = rotY;
  piece.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true;
    if (o.material) o.material = o.material.clone();
  });
  scene.add(piece);
  return piece;
}

function loadGltf(url) {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(url, (gltf) => resolve(gltf.scene), undefined, reject);
  });
}

function loadGltfFull(url) {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(url, (gltf) => resolve(gltf), undefined, reject);
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

// A real Manhattan-at-night reference photo (blue hour, a spired Empire
// State-style tower, dense lit windows, a river catching the light) drove
// this — baked once into a canvas texture: a hazy far layer for depth, a
// river strip with light reflections, then the main skyline with one
// signature tiered/spired tower and varied building silhouettes.
function buildSkylineTexture() {
  const cvs = document.createElement("canvas");
  cvs.width = 1600; cvs.height = 600;
  const ctx = cvs.getContext("2d");
  const W = cvs.width, H = cvs.height;

  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#0a1230");
  sky.addColorStop(0.45, "#122043");
  sky.addColorStop(0.8, "#1c2f52");
  sky.addColorStop(1, "#2c3d5c");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  const rnd = mulberry32(7);
  const horizon = H * 0.86;

  // hazy far skyline layer — low-contrast silhouettes for depth.
  const farColors = ["#1a2338", "#161f30", "#202b44"];
  let fx = 0;
  while (fx < W) {
    const w = 20 + rnd() * 40;
    const h = 40 + rnd() * 90;
    ctx.fillStyle = farColors[Math.floor(rnd() * farColors.length)];
    ctx.fillRect(fx, horizon - h, w, h);
    fx += w + 2 + rnd() * 6;
  }

  // river strip with warm reflected light.
  ctx.fillStyle = "#0d1626";
  ctx.fillRect(0, horizon, W, H - horizon);
  for (let i = 0; i < 70; i++) {
    const rx = rnd() * W;
    const ry = horizon + rnd() * (H - horizon) * 0.7;
    ctx.fillStyle = `rgba(255,${(190 + rnd() * 40) | 0},${(120 + rnd() * 60) | 0},${(0.15 + rnd() * 0.25).toFixed(2)})`;
    ctx.fillRect(rx, ry, 2 + rnd() * 3, 1);
  }

  function windows(x, y, w, h, warmRatio) {
    for (let wy = y + 6; wy < y + h - 4; wy += 12) {
      for (let wx = x + 4; wx < x + w - 4; wx += 9) {
        const r = rnd();
        if (r < warmRatio) {
          ctx.fillStyle = r < warmRatio * 0.12 ? "rgba(150,220,255,.85)" : "rgba(255,206,130,.9)";
          ctx.fillRect(wx, wy, 3.4, 6.5);
        }
      }
    }
  }

  // main skyline — varied silhouettes, one signature spired tower.
  const bodyColors = ["#0c1220", "#0f1626", "#080d18", "#111a2c"];
  let x = 0, towerPlaced = false;
  while (x < W) {
    const w = 34 + rnd() * 70;
    let h = 110 + rnd() * 240;
    const placeTower = !towerPlaced && x > W * 0.28 && x < W * 0.42;
    if (placeTower) { h = H * 0.62; towerPlaced = true; }
    const bx = x, by = horizon - h;
    ctx.fillStyle = bodyColors[Math.floor(rnd() * bodyColors.length)];

    if (placeTower) {
      let ty = by, tw = w;
      for (let t = 0; t < 4; t++) {
        const th = h * 0.16;
        ctx.fillRect(bx + (w - tw) / 2, ty, tw, th);
        ty += th; tw *= 0.72;
      }
      ctx.fillStyle = "rgba(255,230,190,.95)";
      ctx.fillRect(bx + w / 2 - 1.5, by - 46, 3, 46);
      ctx.fillStyle = bodyColors[0];
    } else if (rnd() > 0.6) {
      ctx.fillRect(bx, by + h * 0.08, w, h * 0.92);
      ctx.fillRect(bx + w * 0.15, by, w * 0.7, h * 0.1);
    } else {
      ctx.fillRect(bx, by, w, h);
    }
    if (!placeTower && rnd() > 0.75) { ctx.fillRect(bx + w / 2 - 1, by - 18, 2, 18); }

    windows(bx, by, w, h, 0.4 + rnd() * 0.3);
    x += w + 3 + rnd() * 7;
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

// A small canvas-texture nameplate floating above the head — the character
// model itself now has one fixed face/body, so this (plus the colored floor
// ring below) is what lets you tell agents apart at a glance.
function buildNameSprite(name, color) {
  const cvs = document.createElement("canvas");
  cvs.width = 256; cvs.height = 64;
  const ctx = cvs.getContext("2d");
  const hex = "#" + new THREE.Color(color).getHexString();
  ctx.fillStyle = "rgba(10,10,20,.55)";
  ctx.beginPath();
  ctx.roundRect(4, 14, 248, 36, 14);
  ctx.fill();
  ctx.fillStyle = hex;
  ctx.beginPath(); ctx.arc(28, 32, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "700 26px system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(name || "", 46, 33);
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.9, 0.225, 1);
  sprite.renderOrder = 999;
  return sprite;
}

// The real rigged "Casual Male" character (FBX → GLB, temporarily standing
// in for every agent + the player). SkeletonUtils' clone() is required
// (not group.clone(true)) so each instance gets its own independent
// skeleton/bones — a plain clone shares bone objects across instances and
// every character would end up mirroring the same pose.
function buildHuman(color, name, isPlayer, charTemplate, charClips) {
  const g = new THREE.Group();

  let mixer = null, actions = {}, current = null;
  if (charTemplate) {
    const model = cloneSkinned(charTemplate);
    model.scale.setScalar(CHAR_SCALE);
    model.position.set(...CHAR_CENTER_OFFSET);
    model.traverse((o) => {
      if (!o.isMesh && !o.isSkinnedMesh) return;
      o.castShadow = true; o.receiveShadow = true;
      // The skinned mesh's own cached bounding sphere (baked at parse time)
      // doesn't track this nested Rig/mesh scale hierarchy correctly, so
      // the default frustum-culling check was wrongly culling the whole
      // body out of view — only the crown/ring/nametag ever rendered.
      o.frustumCulled = false;
      if (o.material) {
        o.material = o.material.clone();
        // Subtle tint toward the owner's color so clothing still carries a
        // personal touch even though everyone shares one base texture.
        o.material.color = new THREE.Color(0xffffff).lerp(new THREE.Color(color), 0.2);
      }
    });
    g.add(model);

    if (charClips && charClips.length) {
      mixer = new THREE.AnimationMixer(model);
      charClips.forEach((clip) => { actions[clip.name] = mixer.clipAction(clip); });
      const findClip = (short) => Object.keys(actions).find((n) => n.endsWith(short));
      current = findClip(CLIP.idle);
      if (current && actions[current]) actions[current].play();
    }
  }

  if (isPlayer) {
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.12, 5),
      new THREE.MeshStandardMaterial({ color: 0xE4BC63, emissive: 0x5a4318, emissiveIntensity: 0.6 })
    );
    crown.position.y = 1.42;
    g.add(crown);
  }

  const nameSprite = buildNameSprite(name, color);
  nameSprite.position.y = 1.55;
  g.add(nameSprite);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.26, 0.32, 20),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  g.add(ring);

  return { group: g, ring, mixer, actions, current };
}

// Crossfade to a named clip (matched by suffix, e.g. "man_walk_in_place")
// only when it's actually changing, so idle/walk/sit don't restart every frame.
function setClip(h, shortName) {
  if (!h.mixer) return;
  const name = Object.keys(h.actions).find((n) => n.endsWith(shortName));
  if (!name || name === h.current) return;
  const next = h.actions[name];
  const prev = h.current ? h.actions[h.current] : null;
  next.reset().setEffectiveWeight(1).fadeIn(0.25).play();
  if (prev) prev.fadeOut(0.25);
  h.current = name;
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
      const [deskTemplate, laptopTemplate, charGltf, furnitureTemplate] = await Promise.all([
        loadGltf(base + DESK_MODEL_URL).catch((e) => { console.error("[office3d] desk model failed to load", e); return null; }),
        loadGltf(base + LAPTOP_MODEL_URL).catch((e) => { console.error("[office3d] laptop model failed to load", e); return null; }),
        loadGltfFull(base + CHAR_MODEL_URL).catch((e) => { console.error("[office3d] character model failed to load", e); return null; }),
        loadGltf(base + FURNITURE_MODEL_URL).catch((e) => { console.error("[office3d] furniture model failed to load", e); return null; }),
      ]);
      if (cancelled) return;
      const charTemplate = charGltf ? charGltf.scene : null;
      const charClips = charGltf ? charGltf.animations : [];

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
      new THREE.MeshStandardMaterial({ color: 0x1a2c4a, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.16, side: THREE.BackSide, depthWrite: false })
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

    // Lounge corner + bookshelf for a lived-in office feel — the user's own
    // furniture pack pieces (real sofa, coffee table, floor lamp, wall TV)
    // replace the earlier procedural couch when the model loads; falls back
    // to the procedural one so the corner is never empty.
    if (furnitureTemplate) {
      placeFurniturePiece(scene, furnitureTemplate, "sofa_001", -9.5, 0, 8.5, Math.PI);
      placeFurniturePiece(scene, furnitureTemplate, "coffee_table_001", -9.5, 0, 7.1, 0);
      placeFurniturePiece(scene, furnitureTemplate, "lamp_002", -7.3, 0, 9.3, 0);
      placeFurniturePiece(scene, furnitureTemplate, "flower_001", -11.9, 0, 8.9, 0);
      placeFurniturePiece(scene, furnitureTemplate, "tv_wall_001", -(FLOOR_W / 2) + 0.2, 1.6, 8.5, Math.PI / 2);
      // Storage corner (south-east) — closet, dresser, a stacked box.
      placeFurniturePiece(scene, furnitureTemplate, "closet_001", 9.0, 0, -9.5, 0);
      placeFurniturePiece(scene, furnitureTemplate, "dresser_001", 10.6, 0, -9.5, 0);
      placeFurniturePiece(scene, furnitureTemplate, "box_001", 11.6, 0, -9.2, 0);
      // Break-room kitchenette (east wall) — a counter with small appliances
      // and clutter, plus a fridge and sink, near the existing dining tables.
      placeFurniturePiece(scene, furnitureTemplate, "kitchen_table_001", 12.1, 0, 3.7, Math.PI / 2);
      placeFurniturePiece(scene, furnitureTemplate, "fridge_001", 12.5, 0, 1.0, -Math.PI / 2);
      placeFurniturePiece(scene, furnitureTemplate, "kitchen_sink_001", 12.5, 0, 6.3, -Math.PI / 2);
      placeFurniturePiece(scene, furnitureTemplate, "coffee_machine_001", 12.0, 1.036, 3.1, 0);
      placeFurniturePiece(scene, furnitureTemplate, "microwave_oven_001", 12.2, 1.036, 4.2, 0);
      placeFurniturePiece(scene, furnitureTemplate, "dish_001", 11.85, 1.036, 3.6, 0);
      placeFurniturePiece(scene, furnitureTemplate, "dish_002", 12.45, 1.036, 3.9, 0);
      placeFurniturePiece(scene, furnitureTemplate, "drink_001", 11.95, 1.036, 4.0, 0);
      placeFurniturePiece(scene, furnitureTemplate, "drink_002", 12.35, 1.036, 3.4, 0);
    } else {
      const couch = buildCouch();
      couch.position.set(-9.5, 0, 8.5);
      couch.rotation.y = Math.PI;
      scene.add(couch);
    }
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
    const playerH = buildHuman(0xE4BC63, "אתה", true, charTemplate, charClips);
    playerH.group.position.set(0, 0, 6.2);
    scene.add(playerH.group);

    // NPCs
    const npc = {};
    chars.forEach((c) => {
      const a = byId(c.id);
      if (!a) return;
      const h = buildHuman(a.color, a.name, false, charTemplate, charClips);
      const [wx, wz] = toWorld(c.x, c.y);
      h.group.position.set(wx, 0, wz);
      scene.add(h.group);
      npc[c.id] = h;
    });
    const allHumans = [playerH, ...Object.values(npc)];

    let raf = 0;
    const clock = new THREE.Clock();
    const curSky = new THREE.Color(0x1b2440);
    const tmpColor = new THREE.Color();

    const onKeyDown = (e) => { liveRef.current.keys[e.key.toLowerCase()] = true; };
    const onKeyUp = (e) => { liveRef.current.keys[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

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
        setClip(playerH, CLIP.walk);
      } else {
        setClip(playerH, CLIP.idle);
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
          setClip(h, CLIP.walk);
        } else {
          const seated = c.status === "work" || c.status === "meet" || c.status === "eat";
          setClip(h, seated ? CLIP.sit : CLIP.idle);
          // Working at the desk: face the monitor head-on instead of
          // whatever direction they happened to walk in from — every desk
          // in the grid shares the same unrotated layout, so one fixed
          // heading squares everyone up to their own screen.
          if (c.status === "work") {
            let dRot = DESK_FACE_ROT - h.group.rotation.y;
            while (dRot > Math.PI) dRot -= Math.PI * 2;
            while (dRot < -Math.PI) dRot += Math.PI * 2;
            h.group.rotation.y += dRot * Math.min(1, dt * 6);
          }
        }
      });
      allHumans.forEach((h) => { if (h.mixer) h.mixer.update(dt); });

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
