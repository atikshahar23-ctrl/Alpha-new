import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { MessageCircle, Eye, User, Mic, VolumeX, Volume2, X, Zap, Settings as SettingsIcon } from "lucide-react";

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

// The floor was doubled (owner request): the same 0–100% layout grid now maps
// onto a much larger room (SCALE 0.22→0.33, floor 26×22→39×33 ≈ ×2.25 area),
// so every desk pod gets wide clear corridors around it instead of the old
// packed-maze center. All hand-placed world coordinates below are scaled by
// the same ×1.5 factor so wall-anchored fixtures stay on their walls.
const SCALE = 0.33; // world units per floor-percent point
const toWorld = (x, y) => [(x - 50) * SCALE, (y - 50) * SCALE];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const TALK_DIST = 2.5;
const FLOOR_W = 39, FLOOR_D = 33;
// Every desk in the grid shares one orientation, so a single heading makes
// every seated worker face their own monitor. The desk groups themselves are
// also rotated by this same angle at placement, so the station + the seated
// character always turn together and stay aligned (chair ↔ seat offset).
const DESK_FACE_ROT = Math.PI;
// The sit_idle animation's hip position doesn't naturally land on this
// desk model's built-in chair seat — both tuned by eye (isolated render
// test) against the actual chair mesh so seated workers look properly
// settled into it instead of hovering just above/in front of it.
const SEAT_BACK = -0.12;
const SEAT_DROP = -0.06;

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
// without the animation itself also sliding the mesh forward. Every agent
// (including the CEO) uses this one animated model so they all walk/sit.
const CLIP = { idle: "man_idle", walk: "man_walk_in_place", sit: "man_sit_idle" };

// User-supplied real furniture pack (40 named pieces in one GLB, a home/
// office asset set) — only the pieces that make sense in an office are used
// (lounge, break-room, storage); measuring each named node's own local bbox
// showed they're already real-world-meter scale sitting base-down at y≈0,
// same as this scene's units, so pieces are placed with no extra scale/
// recentring — just position + a facing rotation per spot.
const FURNITURE_MODEL_URL = "office-models/furniture.glb";
// User-supplied "LP Officeroom" pack (FBX → GLB, one small furnished office
// scene, single shared texture atlas) — used to furnish each agent's private
// glass office with a couple of real decor pieces (a leafy plant + a little
// side table) instead of the plain procedural placeholders. Raw room is a 5m
// box; OFFICE_DECOR_SCALE brings its pieces down to this scene's ~3.3m office
// footprint.
const OFFICE_DECOR_MODEL_URL = "office-models/officeroom.glb";
const OFFICE_DECOR_SCALE = 0.55;
function cloneFurniturePiece(template, name) {
  if (!template) return null;
  const node = template.getObjectByName(name);
  if (!node) return null;
  const piece = node.clone(true);
  // Reset to the pack's own flat preview-layout position first — see
  // buildTvScreen for why this matters.
  piece.position.set(0, 0, 0);
  piece.rotation.set(0, 0, 0);
  piece.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true;
    if (o.material) o.material = o.material.clone();
  });
  return piece;
}
// The LP Officeroom pack's geometry is authored in absolute room-space
// coordinates (identity node transforms, vertex positions baked at each
// piece's original spot in that 5m room) rather than locally centred at the
// object's own origin — the opposite of the furniture.glb convention above.
// Wrapping the recentred clone in its own group lets the caller then freely
// set position/scale on that outer group without fighting the baked offset.
function cloneDecorPiece(template, name) {
  if (!template) return null;
  const node = template.getObjectByName(name);
  if (!node) return null;
  const raw = node.clone(true);
  raw.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(raw);
  const center = new THREE.Vector3(); box.getCenter(center);
  raw.position.set(-center.x, -box.min.y, -center.z);
  raw.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true;
    if (o.material) o.material = o.material.clone();
  });
  const wrap = new THREE.Group();
  wrap.add(raw);
  return wrap;
}
function placeFurniturePiece(scene, template, name, x, y, z, rotY = 0) {
  const piece = cloneFurniturePiece(template, name);
  if (!piece) return null;
  piece.position.set(x, y, z);
  piece.rotation.y = rotY;
  scene.add(piece);
  return piece;
}

// Two wall TVs give the office a lived-in, "always something on" feel — one
// tuned to a live-markets ticker, one to the real HeavyGuard/CRM numbers
// (via bizSnapshot(), passed down as `bizData`). The furniture pack's own
// texture atlas is shared across every piece, so the "screen" can't just be
// the TV mesh's own material — a separate unlit plane is layered just in
// front of it instead, carrying its own CanvasTexture that gets redrawn a
// few times a second to feel live without hammering the GPU every frame.
function buildTvScreen(furnitureTemplate, canvas) {
  const g = new THREE.Group();
  const tvNode = furnitureTemplate ? furnitureTemplate.getObjectByName("tv_wall_001") : null;
  if (tvNode) {
    const tv = tvNode.clone(true);
    // The node keeps its position from the furniture pack's own flat
    // preview layout (each of the 40 pieces sits at a different spot in
    // that single shared scene) — reset to the group's local origin so it
    // lands exactly where this group is placed, not offset by that layout.
    tv.position.set(0, 0, 0);
    tv.rotation.set(0, 0, 0);
    tv.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true; o.receiveShadow = true;
      if (o.material) o.material = o.material.clone();
    });
    g.add(tv);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 1.38),
    new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })
  );
  screen.position.set(0.02, 0.846, 0.26);
  g.add(screen);
  return { group: g, tex };
}

// The markets wall TV shows the REAL live board — the exact same rows the
// Business view's investments world fetches (CoinGecko crypto + Yahoo
// indices/commodities), passed in via the marketRows prop. No simulated
// prices anywhere: until the first real fetch lands, the screen says it's
// loading instead of inventing numbers.
function drawTradeScreen(ctx, W, H, rows) {
  ctx.fillStyle = "#060a10"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#1fd67a"; ctx.font = "700 30px 'Courier New',monospace";
  ctx.textAlign = "left";
  ctx.fillText("⚡ LIVE MARKETS", 18, 38);
  ctx.font = "600 15px 'Courier New',monospace";
  ctx.fillStyle = "#4d6a5c"; ctx.textAlign = "right";
  ctx.fillText(new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }), W - 16, 36);
  ctx.textAlign = "left";
  ctx.strokeStyle = "#123422"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 52); ctx.lineTo(W, 52); ctx.stroke();
  if (!rows || !rows.length) {
    ctx.fillStyle = "#5f7d6f"; ctx.font = "600 22px 'Courier New',monospace";
    ctx.fillText("טוען נתוני שוק חיים…", 18, H / 2);
    return;
  }
  let ty = 84;
  rows.slice(0, 9).forEach((r) => {
    ctx.fillStyle = "#cdeeff"; ctx.font = "600 19px 'Courier New',monospace";
    ctx.fillText(r.name, 18, ty);
    ctx.fillStyle = r.chg >= 0 ? "#1fd67a" : "#e0473f";
    ctx.fillText(`${r.price}  ${r.chg >= 0 ? "▲" : "▼"}${Math.abs(r.chg).toFixed(2)}%`, 200, ty);
    ty += 30;
  });
}

function drawHgScreen(ctx, W, H, biz) {
  ctx.fillStyle = "#050b0a"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#5fd0ff"; ctx.font = "700 28px 'Courier New',monospace";
  ctx.fillText("🛡 HEAVYGUARD OPS", 18, 38);
  ctx.strokeStyle = "#0e2430"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 52); ctx.lineTo(W, 52); ctx.stroke();
  const ils = (n) => "₪" + Math.round(n).toLocaleString();
  const kpis = biz ? [
    ["התקנות", biz.installs], ["הכנסה מצטברת", ils(biz.hgRevenue)], ["לקוחות", biz.custCount],
    ["עסקאות פתוחות", biz.openDeals], ["שווי פייפליין", ils(biz.openVal)], ["נסגרו החודש", biz.wonMonth],
  ] : [["ממתין לנתונים", "…"]];
  let ty = 88;
  kpis.forEach(([label, val]) => {
    ctx.fillStyle = "#8fe3c0"; ctx.font = "17px 'Courier New',monospace"; ctx.fillText(label, 18, ty);
    ctx.fillStyle = "#fff"; ctx.font = "700 25px 'Courier New',monospace"; ctx.fillText(String(val), 18, ty + 26);
    ty += 58;
  });
}

function loadGltf(url, manager) {
  return new Promise((resolve, reject) => {
    new GLTFLoader(manager).load(url, (gltf) => resolve(gltf.scene), undefined, reject);
  });
}

function loadGltfFull(url, manager) {
  return new Promise((resolve, reject) => {
    new GLTFLoader(manager).load(url, (gltf) => resolve(gltf), undefined, reject);
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
  tex.anisotropy = 8;
  return tex;
}

// Painted-plaster wall: warm slate-blue paint with subtle roller noise, a
// darker wainscot band at the bottom and a thin brass trim line between —
// so the walls read as designed and painted, not a flat untextured fill.
// The canvas maps the full 6.4m wall height; callers set horizontal repeat.
function buildWallTexture(repeatX) {
  const cvs = document.createElement("canvas");
  cvs.width = 512; cvs.height = 512;
  const ctx = cvs.getContext("2d");
  const rnd = mulberry32(7);
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, "#3b4a73"); g.addColorStop(0.7, "#33405f"); g.addColorStop(1, "#2a3550");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1500; i++) {
    ctx.fillStyle = rnd() < 0.5 ? `rgba(255,255,255,${(rnd() * 0.045).toFixed(3)})` : `rgba(0,0,0,${(rnd() * 0.06).toFixed(3)})`;
    ctx.fillRect(rnd() * 512, rnd() * 512, 1 + rnd() * 3, 2 + rnd() * 16);
  }
  // wainscot: bottom ~1.1m of the 6.4m wall ≈ 88px
  ctx.fillStyle = "#151b2c"; ctx.fillRect(0, 512 - 88, 512, 88);
  for (let i = 0; i < 350; i++) {
    ctx.fillStyle = `rgba(255,255,255,${(rnd() * 0.035).toFixed(3)})`;
    ctx.fillRect(rnd() * 512, 512 - 88 + rnd() * 88, 2, 1 + rnd() * 7);
  }
  ctx.fillStyle = "#E4BC63"; ctx.fillRect(0, 512 - 92, 512, 4);
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// Designed ceiling — dark coffered panels with warm LED light strips and a
// brass perimeter trim, baked into one canvas so the whole ceiling costs a
// single textured plane.
function buildCeilingTexture() {
  const cvs = document.createElement("canvas");
  cvs.width = 1024; cvs.height = 866; // ≈ FLOOR_W:FLOOR_D
  const ctx = cvs.getContext("2d");
  ctx.fillStyle = "#10141f"; ctx.fillRect(0, 0, 1024, 866);
  const cols = 10, rows = 8, cw = 1024 / cols, rh = 866 / rows;
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    const x = c * cw, y = r * rh;
    const g = ctx.createLinearGradient(x, y, x, y + rh);
    g.addColorStop(0, "#1b2233"); g.addColorStop(1, "#141a28");
    ctx.fillStyle = g;
    ctx.fillRect(x + 6, y + 6, cw - 12, rh - 12);
    ctx.strokeStyle = "rgba(228,188,99,.14)"; ctx.lineWidth = 2;
    ctx.strokeRect(x + 6, y + 6, cw - 12, rh - 12);
    if (r % 2 === 1) {
      // recessed warm LED strip with a soft halo
      ctx.fillStyle = "rgba(255,237,196,.2)";
      ctx.fillRect(x + cw * 0.16, y + rh / 2 - 10, cw * 0.68, 20);
      ctx.fillStyle = "#ffedc4";
      ctx.fillRect(x + cw * 0.22, y + rh / 2 - 4, cw * 0.56, 8);
    }
  }
  ctx.strokeStyle = "#E4BC63"; ctx.lineWidth = 6; ctx.strokeRect(8, 8, 1008, 850);
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// A real Manhattan reference photo (a spired Empire State-style tower,
// dense windows, a river catching the light) drove this — a day and a
// night version of the same skyline, drawn onto a shared canvas and swapped
// (redrawn + texture.needsUpdate) whenever the office's day/night phase
// actually changes, so the window isn't a single static image any more.
export function drawSkyline(ctx, W, H, mode) {
  const isDay = mode === "day";
  const isSunset = mode === "sunset";
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  if (isDay) {
    sky.addColorStop(0, "#6fb3e6"); sky.addColorStop(0.5, "#a9d4ee");
    sky.addColorStop(0.8, "#d8ecf6"); sky.addColorStop(1, "#eef7fb");
  } else if (isSunset) {
    sky.addColorStop(0, "#3d2f63"); sky.addColorStop(0.45, "#b4507a");
    sky.addColorStop(0.72, "#f08a4b"); sky.addColorStop(1, "#ffc27a");
  } else {
    sky.addColorStop(0, "#0a1230"); sky.addColorStop(0.45, "#122043");
    sky.addColorStop(0.8, "#1c2f52"); sky.addColorStop(1, "#2c3d5c");
  }
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  const rnd = mulberry32(7);
  const horizon = H * 0.86;

  if (isDay) {
    const sunGrad = ctx.createRadialGradient(W * 0.78, H * 0.16, 0, W * 0.78, H * 0.16, 150);
    sunGrad.addColorStop(0, "rgba(255,252,225,.85)");
    sunGrad.addColorStop(1, "rgba(255,252,225,0)");
    ctx.fillStyle = sunGrad; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,.7)";
    for (let i = 0; i < 4; i++) {
      const cx = rnd() * W, cy = 40 + rnd() * 90, s = 40 + rnd() * 50;
      ctx.beginPath();
      ctx.ellipse(cx, cy, s, s * 0.4, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + s * 0.6, cy + 6, s * 0.7, s * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (isSunset) {
    // A low, huge sun melting into the skyline + lit cloud streaks.
    const sunGrad = ctx.createRadialGradient(W * 0.32, H * 0.74, 0, W * 0.32, H * 0.74, 240);
    sunGrad.addColorStop(0, "rgba(255,214,140,.95)");
    sunGrad.addColorStop(0.25, "rgba(255,164,84,.6)");
    sunGrad.addColorStop(1, "rgba(255,150,70,0)");
    ctx.fillStyle = sunGrad; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,215,170,.9)";
    ctx.beginPath(); ctx.arc(W * 0.32, H * 0.74, 42, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 5; i++) {
      const cy = H * (0.2 + rnd() * 0.35), cw = 120 + rnd() * 260;
      ctx.fillStyle = `rgba(255,${(150 + rnd() * 60) | 0},${(110 + rnd() * 50) | 0},${(0.25 + rnd() * 0.25).toFixed(2)})`;
      ctx.beginPath();
      ctx.ellipse(rnd() * W, cy, cw, 7 + rnd() * 9, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Moon + a soft halo and a scatter of stars.
    const mx = W * 0.72, my = H * 0.15;
    const halo = ctx.createRadialGradient(mx, my, 0, mx, my, 120);
    halo.addColorStop(0, "rgba(220,235,255,.5)"); halo.addColorStop(1, "rgba(220,235,255,0)");
    ctx.fillStyle = halo; ctx.fillRect(mx - 130, my - 130, 260, 260);
    ctx.fillStyle = "#e8f1fb";
    ctx.beginPath(); ctx.arc(mx, my, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(180,200,220,.55)";
    ctx.beginPath(); ctx.arc(mx - 8, my - 5, 5, 0, Math.PI * 2); ctx.arc(mx + 9, my + 8, 3.4, 0, Math.PI * 2); ctx.arc(mx + 3, my - 12, 2.6, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 90; i++) {
      const sx = rnd() * W, sy = rnd() * H * 0.55;
      ctx.fillStyle = `rgba(255,255,255,${(0.25 + rnd() * 0.6).toFixed(2)})`;
      ctx.fillRect(sx, sy, rnd() > 0.9 ? 2 : 1, rnd() > 0.9 ? 2 : 1);
    }
  }

  // hazy far skyline layer — low-contrast silhouettes for depth.
  const farColors = isDay ? ["#9fc3de", "#89b3d2", "#b0d0e6"]
    : isSunset ? ["#5a3f66", "#4e3759", "#684a72"]
    : ["#1a2338", "#161f30", "#202b44"];
  let fx = 0;
  while (fx < W) {
    const w = 20 + rnd() * 40, h = 40 + rnd() * 90;
    ctx.fillStyle = farColors[Math.floor(rnd() * farColors.length)];
    ctx.fillRect(fx, horizon - h, w, h);
    fx += w + 2 + rnd() * 6;
  }

  // river strip — sunlit ripples by day, molten orange at sunset, warm
  // reflected light by night.
  ctx.fillStyle = isDay ? "#5f9dc4" : isSunset ? "#472e42" : "#0d1626";
  ctx.fillRect(0, horizon, W, H - horizon);
  for (let i = 0; i < 70; i++) {
    const rx = rnd() * W, ry = horizon + rnd() * (H - horizon) * 0.7;
    ctx.fillStyle = isDay
      ? `rgba(255,255,255,${(0.2 + rnd() * 0.35).toFixed(2)})`
      : isSunset
      ? `rgba(255,${(150 + rnd() * 60) | 0},${(80 + rnd() * 50) | 0},${(0.25 + rnd() * 0.35).toFixed(2)})`
      : `rgba(255,${(190 + rnd() * 40) | 0},${(120 + rnd() * 60) | 0},${(0.15 + rnd() * 0.25).toFixed(2)})`;
    ctx.fillRect(rx, ry, 2 + rnd() * 3, 1);
  }

  function windows(x, y, w, h, ratio) {
    for (let wy = y + 6; wy < y + h - 4; wy += 12) {
      for (let wx = x + 4; wx < x + w - 4; wx += 9) {
        const r = rnd();
        if (r < ratio) {
          ctx.fillStyle = isDay
            ? (r < ratio * 0.3 ? "rgba(255,255,255,.5)" : "rgba(150,195,220,.35)")
            : isSunset
            ? (r < ratio * 0.4 ? "rgba(255,196,120,.8)" : "rgba(90,60,90,.5)")
            : (r < ratio * 0.12 ? "rgba(150,220,255,.85)" : "rgba(255,206,130,.9)");
          ctx.fillRect(wx, wy, 3.4, 6.5);
        }
      }
    }
  }

  // main skyline — varied silhouettes, one signature spired tower.
  const bodyColors = isDay ? ["#5a6b7d", "#6b7c8e", "#4d5c6d", "#7189a0"]
    : isSunset ? ["#241c38", "#1d1830", "#2a2140", "#171226"]
    : ["#0c1220", "#0f1626", "#080d18", "#111a2c"];
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
      ctx.fillStyle = isDay ? "rgba(255,255,255,.9)" : "rgba(255,230,190,.95)";
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
}
function buildSkylineTexture(mode) {
  const cvs = document.createElement("canvas");
  cvs.width = 1600; cvs.height = 600;
  const ctx = cvs.getContext("2d");
  drawSkyline(ctx, cvs.width, cvs.height, mode);
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { canvas: cvs, ctx, tex };
}

// A real building facade (a tileable window grid) so the skyline outside
// the window can be genuine 3D geometry instead of a flat painted plane —
// the actual "depth in the window" fix. Two separate textures, both cloned
// per building (cheap — shares the image, only `repeat` differs) so each
// tiles its own grid to its own size: a neutral grey-glass albedo (so
// buildings read as ordinary daytime glass/concrete, not permanently lit),
// and a mostly-black emissive layer with only the window squares bright,
// ramped in at night in animate() so nothing glows unless it's actually dark.
function buildFacadeAlbedo() {
  const cvs = document.createElement("canvas");
  cvs.width = 128; cvs.height = 128;
  const ctx = cvs.getContext("2d");
  const rnd = mulberry32(4242);
  ctx.fillStyle = "#48505e"; ctx.fillRect(0, 0, 128, 128);
  for (let y = 6; y < 122; y += 13) {
    for (let x = 6; x < 122; x += 11) {
      ctx.fillStyle = rnd() > 0.3 ? "#5f7488" : "#333b46";
      ctx.fillRect(x, y, 6, 8);
    }
  }
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
function buildFacadeEmissive() {
  const cvs = document.createElement("canvas");
  cvs.width = 128; cvs.height = 128;
  const ctx = cvs.getContext("2d");
  const rnd = mulberry32(4242); // same seed as the albedo grid so lit windows line up
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 128, 128);
  for (let y = 6; y < 122; y += 13) {
    for (let x = 6; x < 122; x += 11) {
      if (rnd() > 0.3) { ctx.fillStyle = "#ffd696"; ctx.fillRect(x, y, 6, 8); }
    }
  }
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// A thin animated "street" strip layered at the base of the skyline wall —
// a few colored light streaks crawling left/right — so the window reads as
// a live city outside, not a painted backdrop. Cheap: a small 1024×48
// canvas redrawn every frame.
function makeTrafficState() {
  const rnd = mulberry32(555);
  const cars = Array.from({ length: 14 }, () => ({
    x: rnd() * 1024,
    y: 10 + rnd() * 28,
    speed: (rnd() > 0.5 ? 1 : -1) * (40 + rnd() * 70),
    color: rnd() > 0.25 ? "#ffcf8a" : "#ff5a4a",
  }));
  return { cars };
}
function drawTraffic(ctx, W, H, state, dt) {
  ctx.fillStyle = "#0b0f18"; ctx.fillRect(0, 0, W, H);
  state.cars.forEach((c) => {
    c.x += c.speed * dt;
    if (c.x < -20) c.x = W + 20; if (c.x > W + 20) c.x = -20;
    ctx.fillStyle = c.color;
    ctx.fillRect(c.x, c.y, c.speed > 0 ? 14 : -14, 2.4);
  });
}

// A gaming battlestation — the user's real desk model, restyled into a dark
// carbon gaming desk with an owner-color RGB edge strip + underglow, dual
// curved monitors (screens glow in the owner's color and pulse when they're
// working), a glowing mechanical keyboard + mouse, and the desk's built-in
// chair re-tinted black with an owner-color racing accent. Falls back to a
// procedural dark desk if the model failed to load so the room is never empty.
const DESK_ITEM_NAMES = ["flower_001", "dish_001", "drink_001", "box_001"];
function buildDesk(color = 0x3a6ad8, deskTemplate = null, laptopTemplate = null, furnitureTemplate = null, itemVariant = 0) {
  const g = new THREE.Group();
  const col = new THREE.Color(color);
  const deskTopY = DESK_SCALE * 1.494;

  if (deskTemplate) {
    const desk = deskTemplate.clone(true);
    desk.scale.setScalar(DESK_SCALE);
    desk.position.set(...DESK_CENTER_OFFSET);
    desk.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true; o.receiveShadow = true;
      if (o.material) {
        o.material = o.material.clone();
        const isChair = /chair/i.test(o.name || "");
        // Gaming makeover: near-black carbon desk; the built-in chair gets a
        // dark shell with a subtle owner-color racing accent glow.
        o.material.color = new THREE.Color(isChair ? 0x14161c : 0x0c0e13);
        o.material.roughness = 0.45;
        o.material.metalness = 0.55;
        if (isChair) { o.material.emissive = col.clone(); o.material.emissiveIntensity = 0.18; }
      }
    });
    g.add(desk);
  } else {
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.08, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x0c0e13, roughness: 0.4, metalness: 0.55 })
    );
    top.position.y = 0.42; top.castShadow = true; top.receiveShadow = true;
    g.add(top);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x090a0e, roughness: 0.5, metalness: 0.6 });
    [[-0.46, -0.22], [0.46, -0.22], [-0.46, 0.22], [0.46, 0.22]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 0.05), legMat);
      leg.position.set(lx, 0.21, lz); leg.castShadow = true; g.add(leg);
    });
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.42), new THREE.MeshStandardMaterial({ color: 0x14161c, emissive: col.clone(), emissiveIntensity: 0.18, roughness: 0.6 }));
    chair.position.set(0, 0.24, 0.5); chair.castShadow = true; g.add(chair);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.4, 0.06), new THREE.MeshStandardMaterial({ color: 0x14161c, emissive: col.clone(), emissiveIntensity: 0.18, roughness: 0.6 }));
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

  // RGB edge trim around the desk surface + an underglow patch on the floor.
  const trimMat = new THREE.MeshBasicMaterial({ color });
  const trimY = deskTopY - 0.01;
  const tFront = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.02, 0.02), trimMat);
  tFront.position.set(0, trimY, 0.34); g.add(tFront);
  [-0.52, 0.52].forEach((sx) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.68), trimMat);
    s.position.set(sx, trimY, 0); g.add(s);
  });
  const underglow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 0.85),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.28, side: THREE.DoubleSide })
  );
  underglow.rotation.x = -Math.PI / 2;
  underglow.position.y = 0.02;
  g.add(underglow);

  // Dual curved gaming monitors — one shared emissive screen material so both
  // glow (and pulse when working) together; kept as monMat for the animate loop.
  const monMat = new THREE.MeshStandardMaterial({ color: 0x02040a, emissive: col.clone(), emissiveIntensity: 0.55, roughness: 0.25, toneMapped: false });
  const bezelMat = new THREE.MeshStandardMaterial({ color: 0x05060a, roughness: 0.4, metalness: 0.35 });
  [-0.3, 0.3].forEach((mxp) => {
    const mon = new THREE.Group();
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.31, 0.025), bezelMat);
    bezel.castShadow = true; mon.add(bezel);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.47, 0.26), monMat);
    scr.position.z = 0.015; mon.add(scr);
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.14, 8), bezelMat);
    stand.position.y = -0.22; mon.add(stand);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.015, 0.13), bezelMat);
    foot.position.y = -0.29; mon.add(foot);
    mon.position.set(mxp, deskTopY + 0.22, -0.2);
    mon.rotation.y = -Math.sign(mxp) * 0.4 + Math.PI; // face the seated worker (turned to match the 180° desk)
    g.add(mon);
  });

  // Glowing mechanical keyboard + mouse.
  const gearMat = new THREE.MeshStandardMaterial({ color: 0x0a0b10, emissive: col.clone(), emissiveIntensity: 0.35, roughness: 0.6 });
  const kb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.16), gearMat);
  kb.position.set(0, deskTopY + 0.02, 0.02); g.add(kb);
  const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.02, 0.11), gearMat);
  mouse.position.set(0.34, deskTopY + 0.02, 0.02); g.add(mouse);

  // Small holographic ring floating above the desk — a personal sci-fi touch.
  const holo = new THREE.Mesh(
    new THREE.TorusGeometry(0.09, 0.008, 8, 20),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 })
  );
  holo.position.set(0, deskTopY + 0.34, -0.16);
  holo.rotation.x = Math.PI / 2.3;
  g.add(holo);

  // A real desk lamp + a rotating personal item (plant/dish/drink/box) from
  // the furniture pack, tucked at the back corners behind the monitors.
  const lamp = cloneFurniturePiece(furnitureTemplate, "lamp_001");
  if (lamp) {
    lamp.scale.setScalar(0.72);
    lamp.position.set(0.42, deskTopY, -0.42);
    g.add(lamp);
  }
  const personal = cloneFurniturePiece(furnitureTemplate, DESK_ITEM_NAMES[itemVariant % DESK_ITEM_NAMES.length]);
  if (personal) {
    personal.scale.setScalar(0.6);
    personal.position.set(-0.42, deskTopY, -0.42);
    g.add(personal);
  }

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
  // Small props stay out of the shadow map — a dozen plants each casting an
  // invisible 10cm shadow is pure shadow-pass cost.
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.24, 10), new THREE.MeshStandardMaterial({ color: 0x2a2016, roughness: 0.8 }));
  pot.position.y = 0.12;
  g.add(pot);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f7d4f, roughness: 0.7 });
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5 + Math.random() * 0.3, 6), leafMat);
    const ang = (i / 5) * Math.PI * 2;
    leaf.position.set(Math.sin(ang) * 0.06, 0.5, Math.cos(ang) * 0.06);
    leaf.rotation.z = Math.sin(ang) * 0.25;
    leaf.rotation.x = Math.cos(ang) * 0.25;
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
    // polygonOffset pulls the rug decisively in front of the floor in the
    // depth buffer — the tiny y-offset alone left the two planes close
    // enough to z-fight (shimmer) at grazing camera angles.
    new THREE.MeshStandardMaterial({ color, roughness: 1, transparent: true, opacity: 0.85, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })
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
// Floating badge over each character: their name (top line) and — when given —
// their job title on a second line in their own colour, so you can read what
// every agent does just by looking at who's standing where.
function buildNameSprite(name, color, role) {
  const cvs = document.createElement("canvas");
  cvs.width = 340; cvs.height = role ? 104 : 64;
  const ctx = cvs.getContext("2d");
  const hex = "#" + new THREE.Color(color).getHexString();
  ctx.fillStyle = "rgba(10,10,20,.62)";
  ctx.beginPath();
  ctx.roundRect(6, 8, 328, role ? 88 : 44, 16);
  ctx.fill();
  if (role) {
    // thin coloured underline separating name from role
    ctx.strokeStyle = hex; ctx.globalAlpha = 0.5; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(24, 56); ctx.lineTo(316, 56); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  const nameY = role ? 34 : 32;
  ctx.fillStyle = hex;
  ctx.beginPath(); ctx.arc(30, nameY, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "700 27px system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(name || "", 50, nameY + 1);
  if (role) {
    ctx.fillStyle = hex;
    ctx.font = "600 20px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(role, 170, 78);
  }
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  if (role) sprite.scale.set(1.16, 0.355, 1);
  else sprite.scale.set(0.9, 0.225, 1);
  sprite.renderOrder = 999;
  return sprite;
}

// The real rigged "Casual Male" character (FBX → GLB, temporarily standing
// in for every agent + the player). SkeletonUtils' clone() is required
// (not group.clone(true)) so each instance gets its own independent
// skeleton/bones — a plain clone shares bone objects across instances and
// every character would end up mirroring the same pose.
function buildHuman(color, name, isPlayer, charTemplate, charClips, modelScale = CHAR_SCALE, modelOffset = CHAR_CENTER_OFFSET, tintClothes = true, role = "") {
  const g = new THREE.Group();

  let mixer = null, actions = {}, current = null;
  if (charTemplate) {
    const model = cloneSkinned(charTemplate);
    model.scale.setScalar(modelScale);
    model.position.set(...modelOffset);
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
        // personal touch even though everyone shares one base texture. Skipped
        // for models that already have their own distinct textured outfit.
        if (tintClothes) o.material.color = new THREE.Color(0xffffff).lerp(new THREE.Color(color), 0.2);
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

  const nameSprite = buildNameSprite(name, color, role);
  nameSprite.position.y = role ? 1.66 : 1.55;
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
  next.reset().setEffectiveWeight(1).fadeIn(0.35).play();
  if (prev) prev.fadeOut(0.35);
  h.current = name;
}

const hexToInt = (hex) => parseInt(hex.replace("#", ""), 16);

// Simple circle-vs-circle push-out so the player can't walk straight through
// desks/furniture — this was the biggest source of "uncomfortable to move
// around", since clipping into a desk with a chase camera right behind you
// reads as broken rather than just visually odd.
function resolveCollisions(pos, obstacles) {
  for (const o of obstacles) {
    const dx = pos.x - o.x, dz = pos.z - o.z;
    const d = Math.hypot(dx, dz);
    const minD = o.r + 0.32; // + player's own rough radius
    if (d > 0 && d < minD) {
      const push = (minD - d) / d;
      pos.x += dx * push; pos.z += dz * push;
    }
  }
}

// A glowing neon sign (canvas text on an unlit plane) — cheap way to give
// the room a real gaming-den identity without any extra lights.
function buildNeonSign(text, color, w = 3.4, h = 0.8) {
  const cvs = document.createElement("canvas");
  cvs.width = 1024; cvs.height = 200;
  const ctx = cvs.getContext("2d");
  const hex = "#" + new THREE.Color(color).getHexString();
  // Auto-fit the font so the text never clips at the canvas edge (RTL Hebrew
  // was getting its leading characters cut off at a fixed size).
  let fs = 120;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  do { ctx.font = `900 ${fs}px 'Arial Black', system-ui, sans-serif`; fs -= 4; }
  while (ctx.measureText(text).width > 960 && fs > 24);
  ctx.shadowColor = hex; ctx.shadowBlur = 40;
  ctx.fillStyle = "#fff"; ctx.fillText(text, 512, 108);
  ctx.shadowBlur = 22; ctx.fillStyle = hex; ctx.fillText(text, 512, 108);
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false })
  );
  return mesh;
}

// The owner's private executive gaming office — a glass-partitioned corner
// suite with a premium battlestation, a crown-topped nameplate, a rug and
// a couple of accent lights. Returns the group plus collision circles so
// the player walks around the partition and in through the doorway.
// A shared, cheap glass material for every partition in the room. One instance
// (not per-wall clones) keeps draw-state changes down. depthWrite:false is
// essential — a transparent pane that still writes depth occludes the agents
// and player standing behind it (the original "everyone is invisible" bug).
const OFFICE_GLASS_MAT = new THREE.MeshPhysicalMaterial({
  color: 0x9fd6ff, transparent: true, opacity: 0.09, roughness: 0.05,
  metalness: 0.1, side: THREE.DoubleSide, depthWrite: false,
});

// The real Heavy Guard logo (the bull-over-gear brand mark, transparent PNG)
// as a shared texture — created once per mount from the effect (which knows
// the base URL) and reused by every builder that hangs the brand somewhere.
let HG_LOGO_TEX = null;
function buildLogoPlane(w) {
  if (!HG_LOGO_TEX) return null;
  // 240x279 source → keep the mark's true aspect so the bull never distorts.
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, w * 1.16),
    new THREE.MeshBasicMaterial({ map: HG_LOGO_TEX, transparent: true, toneMapped: false, depthWrite: false })
  );
}

// A proper office-door nameplate: dark brushed plate, gold frame, the
// agent's name big + role under it, with a colour accent bar — mounted at
// eye height beside every office entrance, like a real office floor.
function buildDoorSign(name, title, color) {
  const cvs = document.createElement("canvas");
  cvs.width = 512; cvs.height = 256;
  const c = cvs.getContext("2d");
  const hex = "#" + new THREE.Color(color).getHexString();
  const grd = c.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, "#1b1f2a"); grd.addColorStop(1, "#0c0e14");
  c.fillStyle = grd; c.fillRect(0, 0, 512, 256);
  c.strokeStyle = "rgba(228,188,99,.8)"; c.lineWidth = 6; c.strokeRect(7, 7, 498, 242);
  c.strokeStyle = "rgba(228,188,99,.25)"; c.lineWidth = 2; c.strokeRect(16, 16, 480, 224);
  c.fillStyle = hex; c.fillRect(452, 44, 10, 168);
  c.textAlign = "right";
  c.fillStyle = "#f2f4f8"; c.font = "800 76px system-ui";
  c.fillText(name, 428, 122);
  c.fillStyle = "#aeb8ca"; c.font = "500 42px system-ui";
  c.fillText(title, 428, 194);
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.33), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
}

// A private glass-walled office wrapped around one agent's battlestation:
// a back wall + two side walls (front left open as the doorway) with a neon
// top rail and a floating title/name plate over the entrance, all in the
// agent's own colour. Doorway faces +Z (south, toward the aisle the worker
// faces). Returns the group + collision circles for the three solid walls.
function buildGlassOffice(color, name, title, screenTex, decorTemplate) {
  const g = new THREE.Group();
  const obstacles = [];
  const W = 3.3, D = 3.1, wallH = 2.35;
  const neon = new THREE.MeshBasicMaterial({ color });

  const addRail = (w, x, z, alongZ) => {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(alongZ ? 0.05 : w, 0.05, alongZ ? w : 0.05), neon);
    rail.position.set(x, wallH, z); g.add(rail);
  };
  // Back wall (north, -Z)
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W, wallH), OFFICE_GLASS_MAT);
  back.position.set(0, wallH / 2, -D / 2); g.add(back);
  addRail(W, 0, -D / 2, false);
  // Side walls (west -X, east +X)
  [-W / 2, W / 2].forEach((sx) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(D, wallH), OFFICE_GLASS_MAT);
    wall.rotation.y = Math.PI / 2; wall.position.set(sx, wallH / 2, 0); g.add(wall);
    addRail(D, sx, 0, true);
  });
  // A short glass return on each side of the doorway so the front isn't a
  // gaping hole, leaving a ~1.7-wide entrance in the middle (widened along
  // with the floor doubling so walking in never feels like threading a maze).
  [-1, 1].forEach((s) => {
    const jamb = new THREE.Mesh(new THREE.PlaneGeometry(0.8, wallH), OFFICE_GLASS_MAT);
    jamb.position.set(s * (W / 2 - 0.4), wallH / 2, D / 2); g.add(jamb);
    addRail(0.8, s * (W / 2 - 0.4), D / 2, false);
  });

  // Collision circles along the three solid walls (doorway gap stays open).
  for (let t = -W / 2; t <= W / 2 + 0.01; t += 0.75) obstacles.push({ x: t, z: -D / 2, r: 0.22 });
  for (let t = -D / 2; t <= D / 2 + 0.01; t += 0.75) { obstacles.push({ x: -W / 2, z: t, r: 0.22 }); obstacles.push({ x: W / 2, z: t, r: 0.22 }); }
  obstacles.push({ x: -(W / 2 - 0.4), z: D / 2, r: 0.24 }, { x: W / 2 - 0.4, z: D / 2, r: 0.24 });

  // Frosted door-header plate with the agent's name + title, over the entrance.
  const plate = buildNameSprite(name, color, title);
  plate.scale.multiplyScalar(1.9);
  plate.position.set(0, wallH + 0.32, D / 2);
  g.add(plate);

  // Entrance nameplate on the right door jamb at eye height — name + role,
  // the standard sign you'd find beside a real office door.
  const doorSign = buildDoorSign(name, title, color);
  doorSign.position.set(W / 2 - 0.4, 1.45, D / 2 + 0.015);
  g.add(doorSign);

  // A real leafy plant + a little side table (from the user's LP Officeroom
  // pack) for a lived-in, furnished feel — falls back to the plain
  // procedural plant if that pack failed to load.
  const flower = cloneDecorPiece(decorTemplate, "Office2_Flower");
  if (flower) {
    flower.scale.setScalar(OFFICE_DECOR_SCALE);
    flower.position.set(-W / 2 + 0.4, 0, -D / 2 + 0.4);
    g.add(flower);
  } else {
    const plant = buildPlant();
    plant.scale.setScalar(1.15);
    plant.position.set(-W / 2 + 0.35, 0, -D / 2 + 0.35);
    g.add(plant);
  }
  const littleTable = cloneDecorPiece(decorTemplate, "Office2_little_table");
  if (littleTable) {
    littleTable.scale.setScalar(OFFICE_DECOR_SCALE);
    littleTable.position.set(W / 2 - 0.4, 0, -D / 2 + 0.4);
    g.add(littleTable);
  }

  // A small wall-mounted status screen on the back wall showing the agent's
  // own live domain data (passed in as a canvas texture).
  if (screenTex) {
    const bezel = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 0.82), new THREE.MeshBasicMaterial({ color: 0x05060a }));
    bezel.position.set(W / 2 - 0.9, 1.62, -D / 2 + 0.03); g.add(bezel);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.24, 0.74), new THREE.MeshBasicMaterial({ map: screenTex }));
    screen.position.set(W / 2 - 0.9, 1.62, -D / 2 + 0.04); g.add(screen);
  }

  // A soft accent uplight tinted to the agent's colour so each office reads
  // as its own lit pod.
  const up = new THREE.PointLight(color, 0.32, 6);
  up.position.set(0, 1.9, -D / 2 + 0.4);
  g.add(up);
  return { group: g, obstacles };
}

// Small canvas screen for an agent's office wall: their title + a couple of
// real metrics drawn as a mini dashboard, in their own colour.
function buildOfficeScreenTex(title, color, lines) {
  const cvs = document.createElement("canvas");
  // 2x supersampled (drawn in 320x190 logical coords) — the office wall
  // screens sit close to the walk path and read crisp instead of fuzzy.
  cvs.width = 640; cvs.height = 380;
  const ctx = cvs.getContext("2d");
  ctx.scale(2, 2);
  const hex = "#" + new THREE.Color(color).getHexString();
  const grd = ctx.createLinearGradient(0, 0, 0, 190);
  grd.addColorStop(0, "#0d1424"); grd.addColorStop(1, "#080b14");
  ctx.fillStyle = grd; ctx.fillRect(0, 0, 320, 190);
  ctx.fillStyle = hex; ctx.fillRect(0, 0, 320, 6);
  ctx.fillStyle = "#fff"; ctx.font = "700 22px system-ui, sans-serif"; ctx.textAlign = "right";
  ctx.fillText(title || "", 304, 36);
  ctx.font = "600 17px system-ui, sans-serif";
  (lines || []).slice(0, 4).forEach((ln, i) => {
    const y = 74 + i * 28;
    ctx.fillStyle = "#9fb2d4"; ctx.textAlign = "right"; ctx.fillText(ln[0], 304, y);
    ctx.fillStyle = hex; ctx.textAlign = "left"; ctx.fillText(String(ln[1]), 16, y);
  });
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// Real per-agent metrics pulled from the live business snapshot, chosen to
// match each agent's domain so every office wall shows information that's
// actually relevant to whoever sits there.
function agentScreenLines(id, b) {
  const money = (n) => "₪" + Math.round(n || 0).toLocaleString();
  const by = {
    ceo: [["הכנסה כוללת", money(b.hgRevenue)], ["לקוחות", b.custCount], ["עסקאות פתוחות", b.openDeals], ["נסגרו החודש", b.wonMonth]],
    sales: [["עסקאות פתוחות", b.openDeals], ["שווי פייפליין", money(b.openVal)], ["נסגרו החודש", b.wonMonth], ["לקוחות", b.custCount]],
    ops: [["התקנות", b.installs], ["הכנסת HeavyGuard", money(b.hgRevenue)], ["פריטים במחירון", b.pricelist], ["לקוחות", b.custCount]],
    cmo: [["לקוחות", b.custCount], ["התקנות", b.installs], ["מוצר מוביל", (b.top && b.top[0] && b.top[0].name) || "—"], ["נסגרו החודש", b.wonMonth]],
    dev: [["מערכות פעילות", 6], ["משימות פתוחות", Math.max(1, b.staleCount)], ["פריסות החודש", 4], ["זמינות", "99.9%"]],
    auto: [["זרימות פעילות", 9], ["שעות נחסכו", 128], ["שילובים", 5], ["הרצות היום", 240]],
    data: [["לקוחות", b.custCount], ["התקנות", b.installs], ["שווי פייפליין", money(b.openVal)], ["עסקאות ישנות", b.staleCount]],
    cs: [["לקוחות", b.custCount], ["עסקאות ישנות", b.staleCount], ["שביעות רצון", "94%"], ["פניות פתוחות", Math.max(0, b.staleCount)]],
    finance: [["הכנסה כוללת", money(b.hgRevenue)], ["שווי פייפליין", money(b.openVal)], ["נסגרו החודש", b.wonMonth], ["גבייה פתוחה", money(b.openVal * 0.3)]],
    procure: [["פריטים במחירון", b.pricelist], ["ספקים", 8], ["התקנות", b.installs], ["הזמנות פתוחות", 3]],
    legal: [["חוזים פעילים", b.custCount], ["טפסים", 12], ["בבדיקה", 2], ["עמידה בתקנות", "✓"]],
    growth: [["הזדמנויות", 7], ["שווי פייפליין", money(b.openVal)], ["לקוחות", b.custCount], ["יעד חודשי", money(b.hgRevenue * 1.4)]],
    facilities: [["עמדות במשרד", 13], ["סדר כללי", "✓"], ["שיפוצים פעילים", 1], ["בקשות פתוחות", 2]],
  };
  return by[id] || [["לקוחות", b.custCount], ["הכנסה", money(b.hgRevenue)], ["עסקאות", b.openDeals]];
}

// The shared conference room — a glass box around the meeting table with a
// doorway on the south side, a big presentation screen on the back wall, and
// a "חדר ישיבות" sign over the door.
function buildConferenceRoom(color, screenTex) {
  const g = new THREE.Group();
  const obstacles = [];
  // Grew with the doubled floor so the meeting seats (spread wider now)
  // still sit comfortably inside the glass, with room to walk around them.
  const W = 7.6, D = 6.8, wallH = 2.6;
  const neon = new THREE.MeshBasicMaterial({ color });
  const rail = (geo, x, y, z) => { const m = new THREE.Mesh(geo, neon); m.position.set(x, y, z); g.add(m); };

  // Back + two sides = solid glass; front (south) has a centred doorway gap.
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W, wallH), OFFICE_GLASS_MAT);
  back.position.set(0, wallH / 2, -D / 2); g.add(back);
  rail(new THREE.BoxGeometry(W, 0.06, 0.06), 0, wallH, -D / 2);
  [-W / 2, W / 2].forEach((sx) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(D, wallH), OFFICE_GLASS_MAT);
    wall.rotation.y = Math.PI / 2; wall.position.set(sx, wallH / 2, 0); g.add(wall);
    rail(new THREE.BoxGeometry(0.06, 0.06, D), sx, wallH, 0);
  });
  [-1, 1].forEach((s) => {
    const seg = new THREE.Mesh(new THREE.PlaneGeometry(1.7, wallH), OFFICE_GLASS_MAT);
    seg.position.set(s * (W / 2 - 0.85), wallH / 2, D / 2); g.add(seg);
    rail(new THREE.BoxGeometry(1.7, 0.06, 0.06), s * (W / 2 - 0.85), wallH, D / 2);
  });

  // Presentation screen on the inside of the back wall.
  if (screenTex) {
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 1.9),
      new THREE.MeshBasicMaterial({ map: screenTex })
    );
    screen.position.set(0, 1.5, -D / 2 + 0.06); g.add(screen);
    const bezel = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.1), new THREE.MeshBasicMaterial({ color: 0x05060a }));
    bezel.position.set(0, 1.5, -D / 2 + 0.05); g.add(bezel);
  }

  // Collisions on the three solid walls + the two door jambs.
  for (let t = -W / 2; t <= W / 2 + 0.01; t += 0.7) obstacles.push({ x: t, z: -D / 2, r: 0.24 });
  for (let t = -D / 2; t <= D / 2 + 0.01; t += 0.7) { obstacles.push({ x: -W / 2, z: t, r: 0.24 }); obstacles.push({ x: W / 2, z: t, r: 0.24 }); }
  [-1, 1].forEach((s) => { for (let k = 0; k < 2; k++) obstacles.push({ x: s * (W / 2 - 0.4 - k * 0.7), z: D / 2, r: 0.24 }); });

  const sign = buildNeonSign("חדר ישיבות", color, 3.2, 0.7);
  sign.position.set(0, wallH + 0.4, D / 2);
  g.add(sign);
  // Entrance nameplate beside the door + the company mark next to the
  // presentation screen, so the meeting room carries the brand too.
  const doorSign = buildDoorSign("חדר ישיבות", "פגישות צוות והנהלה", color);
  doorSign.position.set(W / 2 - 0.85, 1.45, D / 2 + 0.02);
  g.add(doorSign);
  const roomLogo = buildLogoPlane(0.95);
  if (roomLogo) { roomLogo.position.set(-2.85, 1.55, -D / 2 + 0.07); g.add(roomLogo); }
  const glow = new THREE.PointLight(color, 0.45, 12);
  glow.position.set(0, 2.2, 0); g.add(glow);
  return { group: g, obstacles };
}

// Reception desk for the entrance: a lit wood-and-glass counter with a
// monitor, a welcome screen, and a "קבלה" sign. The doorway/visitor side
// faces +Z (south, the entrance); the receptionist sits behind it (−Z).
function buildReception(color, screenTex) {
  const g = new THREE.Group();
  const obstacles = [];
  // Sized to the character (counter ~waist-chest height), not a monument.
  const W = 2.4, D = 0.8, H = 0.95;
  const wood = new THREE.MeshStandardMaterial({ color: 0x2a2016, roughness: 0.55, metalness: 0.12 });
  const topMat = new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.3, metalness: 0.45 });
  const front = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), wood);
  front.position.set(0, H / 2, 0); front.castShadow = true; front.receiveShadow = true; g.add(front);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(W - 0.2, 0.06, 0.02), new THREE.MeshBasicMaterial({ color }));
  strip.position.set(0, 0.14, D / 2 + 0.011); g.add(strip);
  // The company mark front-and-centre on the counter — the first brand
  // touchpoint a visitor sees walking in.
  const deskLogo = buildLogoPlane(0.52);
  if (deskLogo) { deskLogo.position.set(0, 0.52, D / 2 + 0.013); g.add(deskLogo); }
  const top = new THREE.Mesh(new THREE.BoxGeometry(W + 0.2, 0.07, D + 0.25), topMat);
  top.position.set(0, H + 0.035, 0); top.castShadow = true; g.add(top);
  // Welcome monitor on the counter, facing visitors (+Z).
  const monBody = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.34, 0.03), new THREE.MeshStandardMaterial({ color: 0x05070c, metalness: 0.5, roughness: 0.3 }));
  monBody.position.set(0.6, H + 0.28, 0.14); g.add(monBody);
  if (screenTex) {
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.28), new THREE.MeshBasicMaterial({ map: screenTex }));
    scr.position.set(0.6, H + 0.28, 0.157); g.add(scr);
  }
  // A little potted plant on the counter.
  const plant = buildPlant(); plant.scale.setScalar(0.55); plant.position.set(-0.85, H, 0); g.add(plant);
  const sign = buildNeonSign("קבלה · ALPHA", color, 2.4, 0.56);
  sign.position.set(0, 2.3, 0); g.add(sign);
  const light = new THREE.PointLight(color, 0.55, 8); light.position.set(0, 2.0, 0.5); g.add(light);
  for (let t = -W / 2; t <= W / 2 + 0.01; t += 0.6) obstacles.push({ x: t, z: 0, r: 0.45 });
  return { group: g, obstacles, seatLocal: { x: 0, z: -0.7 } };
}

// A cafeteria / coffee counter beside the dining tables: a counter with two
// coffee machines, a stack of cups, a menu board and a warm light — the food
// zone of the office. Serving side faces −X (west, into the room).
function buildCafeteria(color) {
  const g = new THREE.Group();
  const obstacles = [];
  const W = 0.9, D = 3.6, H = 1.05; // long counter running along Z
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), new THREE.MeshStandardMaterial({ color: 0x201a26, roughness: 0.5, metalness: 0.2 }));
  body.position.set(0, H / 2, 0); body.castShadow = true; body.receiveShadow = true; g.add(body);
  const top = new THREE.Mesh(new THREE.BoxGeometry(W + 0.25, 0.08, D + 0.2), new THREE.MeshStandardMaterial({ color: 0x0e0f14, roughness: 0.25, metalness: 0.5 }));
  top.position.set(0, H + 0.04, 0); g.add(top);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, D - 0.2), new THREE.MeshBasicMaterial({ color }));
  strip.position.set(-W / 2 - 0.011, 0.55, 0); g.add(strip);
  // Two espresso machines + cup stacks on the counter.
  [-0.9, 0.9].forEach((dz) => {
    const machine = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.42, 0.4), new THREE.MeshStandardMaterial({ color: 0x1b1e26, metalness: 0.6, roughness: 0.3 }));
    machine.position.set(0.05, H + 0.25, dz); machine.castShadow = true; g.add(machine);
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.18), new THREE.MeshBasicMaterial({ color }));
    led.position.set(-0.16, H + 0.25, dz); g.add(led);
    const cups = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 8), new THREE.MeshStandardMaterial({ color: 0xf0efe8, roughness: 0.6 }));
    cups.position.set(-0.15, H + 0.17, dz + 0.4); g.add(cups);
  });
  // Menu board above the counter.
  const boardCvs = document.createElement("canvas"); boardCvs.width = 256; boardCvs.height = 160;
  const bx = boardCvs.getContext("2d"); bx.fillStyle = "#0d1018"; bx.fillRect(0, 0, 256, 160);
  bx.fillStyle = "#" + new THREE.Color(color).getHexString(); bx.font = "700 22px system-ui"; bx.textAlign = "right"; bx.fillText("קפה · אלפא", 240, 32);
  bx.fillStyle = "#cfd8e6"; bx.font = "500 17px system-ui";
  ["אספרסו", "קפוצ'ינו", "לאטה", "שוקו חם", "תה"].forEach((it, i) => bx.fillText(it, 240, 60 + i * 22));
  const boardTex = new THREE.CanvasTexture(boardCvs); boardTex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.8), new THREE.MeshBasicMaterial({ map: boardTex }));
  board.rotation.y = -Math.PI / 2; board.position.set(-W / 2 - 0.02, 1.9, 0); g.add(board);
  const sign = buildNeonSign("קפיטריה", color, 2.2, 0.55);
  sign.rotation.y = -Math.PI / 2; sign.position.set(-W / 2 - 0.05, 2.55, 0); g.add(sign);
  const light = new THREE.PointLight(0xffdca8, 0.5, 8); light.position.set(-0.6, 2.1, 0); g.add(light);
  for (let t = -D / 2; t <= D / 2 + 0.01; t += 0.7) obstacles.push({ x: 0, z: t, r: 0.55 });
  return { group: g, obstacles };
}

// A visitor chair for the owner's meeting corner — a simple executive guest
// chair (seat, backrest, four legs) in near-black with a thin accent glow, so
// a summoned agent has a real chair to sit on across the desk from the owner.
function buildGuestChair(color) {
  const g = new THREE.Group();
  const shell = new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.55, metalness: 0.25, emissive: new THREE.Color(color), emissiveIntensity: 0.12 });
  const legMat = new THREE.MeshStandardMaterial({ color: 0x0c0e13, roughness: 0.4, metalness: 0.7 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.07, 0.5), shell);
  seat.position.y = 0.27; seat.castShadow = true; g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.55, 0.07), shell);
  back.position.set(0, 0.57, -0.22); back.castShadow = true; g.add(back);
  [[-0.21, -0.19], [0.21, -0.19], [-0.21, 0.19], [0.21, 0.19]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.27, 6), legMat);
    leg.position.set(lx, 0.135, lz); g.add(leg);
  });
  return g;
}

// The owner's private executive suite, rebuilt around real meetings: a much
// bigger glass corner office (grew with the doubled floor), the desk now
// faces INTO the room so the owner looks at whoever walks in, and two guest
// chairs sit across the desk — the summon flow walks the called agent in
// through the door and sits them down on one, facing the owner. Returns the
// local seat spots (owner chair + guest chair) so the sim can snap the player
// and the summoned agent onto them precisely.
function buildOwnerOffice(color, deskTemplate, laptopTemplate, furnitureTemplate, guestLocal) {
  const g = new THREE.Group();
  const obstacles = [];

  // Glass partition — an L in the SE corner. North wall spans the full suite;
  // the west wall has a wide doorway gap (local z −0.8..0.9, ~1.7 wide) that
  // the summoned agent's walk-in route passes through.
  // depthWrite:false is essential — a transparent pane that still writes depth
  // occludes everything behind it, which was making the agents (seen through
  // these partition walls) and the player (spawned inside the glass box) vanish.
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x8fd0ff, transparent: true, opacity: 0.1, roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false });
  const neonEdge = new THREE.MeshBasicMaterial({ color });
  const wallH = 2.6;
  // North wall (runs along x, at local z = -4.3), spanning to the room's east wall.
  const nWall = new THREE.Mesh(new THREE.PlaneGeometry(11.8, wallH), glassMat);
  nWall.position.set(0.6, wallH / 2, -4.3); g.add(nWall);
  const nTop = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.06, 0.06), neonEdge); nTop.position.set(0.6, wallH, -4.3); g.add(nTop);
  // West wall (runs along z, at local x = -5.3) in two segments around the door.
  [[-2.55, 3.5], [2.45, 3.1]].forEach(([cz, len]) => {
    const seg = new THREE.Mesh(new THREE.PlaneGeometry(len, wallH), glassMat);
    seg.rotation.y = Math.PI / 2; seg.position.set(-5.3, wallH / 2, cz); g.add(seg);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, len), neonEdge); top.position.set(-5.3, wallH, cz); g.add(top);
  });
  // collision circles along the walls (doorway gap left open).
  for (let t = -5.3; t <= 6.5; t += 0.85) obstacles.push({ x: t, z: -4.3, r: 0.26 });
  for (let t = -4.3; t <= -0.8; t += 0.8) obstacles.push({ x: -5.3, z: t, r: 0.26 });
  for (let t = 0.9; t <= 4.0; t += 0.8) obstacles.push({ x: -5.3, z: t, r: 0.26 });

  // Entrance nameplate beside the suite door (west wall, facing the
  // approach) + the company mark on the glass behind the desk, executive-
  // office style.
  const doorSign = buildDoorSign("שחר", "מנכ\"ל ובעלים", color);
  doorSign.rotation.y = -Math.PI / 2;
  doorSign.position.set(-5.33, 1.45, 1.5);
  g.add(doorSign);
  const suiteLogo = buildLogoPlane(1.45);
  if (suiteLogo) { suiteLogo.position.set(0.5, 1.55, -4.26); g.add(suiteLogo); }

  // Premium rug under the whole meeting area.
  const rug = buildRug(7.4, 5.6, 0x14161c);
  rug.position.set(0.6, 0.006, -0.8);
  g.add(rug);
  const rugTrim = new THREE.Mesh(new THREE.RingGeometry(2.6, 2.72, 40), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
  rugTrim.rotation.x = -Math.PI / 2; rugTrim.position.set(0.6, 0.012, -0.8); g.add(rugTrim);

  // Executive battlestation — now facing SOUTH into the room, so sitting at
  // it means facing the door and whoever was summoned to the meeting.
  const desk = buildDesk(color, deskTemplate, laptopTemplate, furnitureTemplate, 0);
  desk.group.position.set(0.5, 0, -2.2);
  desk.group.rotation.y = 0;
  desk.group.scale.setScalar(1.2);
  g.add(desk.group);
  obstacles.push({ x: 0.5, z: -2.2, r: 1.0 });
  // The owner's own chair spot (matches the desk model's built-in chair, same
  // SEAT_BACK offset convention as the agents' desks) — where the player sits.
  const seatLocal = { x: 0.5, z: -2.2 + SEAT_BACK, ry: 0 };

  // Two guest chairs across the desk, facing the owner. The first one is
  // placed exactly on the summon meeting spot so the called agent walks in
  // and sits right down on it.
  const guests = guestLocal && guestLocal.length ? guestLocal : [{ x: 0.2, z: -0.29 }, { x: 1.9, z: -0.29 }];
  guests.forEach((p) => {
    const chair = buildGuestChair(color);
    chair.position.set(p.x, 0, p.z);
    chair.rotation.y = Math.PI; // backrest to the south — sitter faces the desk
    g.add(chair);
  });

  // A leafy plant in the far corner for warmth.
  const plant = buildPlant();
  plant.scale.setScalar(1.25);
  plant.position.set(5.6, 0, -3.5);
  g.add(plant);

  /* ── Command-center upgrades (owner request: "Iron Man"-style suite) ──
     A holographic projector pedestal with a slowly-spinning wireframe
     globe, two server racks with breathing LED columns along the back
     wall, an IoT control slab angled on the desk, and two wall-wash light
     bars. All emissive/cheap; the spinner + blink material are returned
     so the render loop can animate them. */
  const spinners = [];
  const blinkMats = [];
  {
    // Holographic projector — pedestal + wireframe icosahedron + light cone.
    const holo = new THREE.Group();
    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.42, 0.5, 18),
      new THREE.MeshStandardMaterial({ color: 0x0c0e13, roughness: 0.35, metalness: 0.7 })
    );
    ped.position.y = 0.25; ped.castShadow = true; holo.add(ped);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.02, 8, 24), new THREE.MeshBasicMaterial({ color }));
    rim.rotation.x = Math.PI / 2; rim.position.y = 0.51; holo.add(rim);
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.36, 0.9, 20, 1, true),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false })
    );
    cone.position.y = 0.97; cone.rotation.x = Math.PI; holo.add(cone);
    const globe = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.3, 1),
      new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.75 })
    );
    globe.position.y = 1.15; holo.add(globe);
    spinners.push(globe);
    const holoLight = new THREE.PointLight(color, 0.5, 3.5);
    holoLight.position.y = 1.1; holo.add(holoLight);
    holo.position.set(3.0, 0, -1.4);
    g.add(holo);
    obstacles.push({ x: 3.0, z: -1.4, r: 0.55 });

    // Two server racks against the back wall — dark cabinets with LED rows.
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x33ff88, transparent: true, opacity: 0.85 });
    const ledMat2 = new THREE.MeshBasicMaterial({ color: 0x3fa8ff, transparent: true, opacity: 0.7 });
    blinkMats.push(ledMat, ledMat2);
    [-3.4, -2.2].forEach((rx, ri) => {
      const rack = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 2.0, 0.55),
        new THREE.MeshStandardMaterial({ color: 0x0b0d12, roughness: 0.45, metalness: 0.5 })
      );
      rack.position.set(rx, 1.0, -3.95); rack.castShadow = true; g.add(rack);
      for (let row = 0; row < 6; row++) {
        const led = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.05), row % 2 === ri ? ledMat : ledMat2);
        led.position.set(rx, 0.35 + row * 0.28, -3.67);
        g.add(led);
      }
      obstacles.push({ x: rx, z: -3.95, r: 0.6 });
    });

    // IoT control slab angled on the desk — a drawn touch panel.
    const iotCvs = document.createElement("canvas"); iotCvs.width = 128; iotCvs.height = 80;
    const ic = iotCvs.getContext("2d");
    ic.fillStyle = "#060a12"; ic.fillRect(0, 0, 128, 80);
    const hex = "#" + new THREE.Color(color).getHexString();
    ic.fillStyle = hex; ic.font = "700 11px system-ui"; ic.textAlign = "right"; ic.fillText("ALPHA · בקרה", 122, 15);
    [26, 40, 54].forEach((y, i) => {
      ic.fillStyle = "rgba(120,160,255,.25)"; ic.fillRect(10, y, 88, 5);
      ic.fillStyle = hex; ic.fillRect(10 + [22, 48, 70][i], y - 2, 8, 9);
    });
    ["תאורה", "אקלים", "אבטחה"].forEach((t, i) => { ic.fillStyle = "#8ea0c4"; ic.font = "9px system-ui"; ic.fillText(t, 122, 32 + i * 14); });
    ic.fillStyle = "#3FD79A"; ic.beginPath(); ic.arc(14, 14, 4, 0, 7); ic.fill();
    const iotTex = new THREE.CanvasTexture(iotCvs); iotTex.colorSpace = THREE.SRGBColorSpace;
    const iot = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.26), new THREE.MeshBasicMaterial({ map: iotTex }));
    iot.position.set(1.55, 0.83, -1.75);
    iot.rotation.set(-0.9, Math.PI, 0);
    g.add(iot);

    // Wall-wash light bars on the back wall.
    [-0.6, 2.2].forEach((wx2) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 0.05), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 }));
      bar.position.set(wx2, 2.25, -4.24);
      g.add(bar);
    });
  }

  // Nameplate floating over the suite, with a little gold crown above it.
  const sign = buildNeonSign("המשרד של שחר", color, 3.6, 0.7);
  sign.position.set(0.6, 2.95, -4.22);
  g.add(sign);
  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.18, 5),
    new THREE.MeshStandardMaterial({ color: 0xE4BC63, emissive: 0x5a4318, emissiveIntensity: 0.8, metalness: 0.6, roughness: 0.3 })
  );
  crown.position.set(0.6, 3.4, -4.22);
  g.add(crown);

  // Accent uplight hidden behind the desk for a premium glow.
  const up = new THREE.PointLight(color, 0.8, 7);
  up.position.set(0.5, 0.5, -2.6); g.add(up);

  return { group: g, obstacles, deskMon: desk.monMat, deskHolo: desk.holo, seatLocal, spinners, blinkMats };
}

export default function Office3D({ chars, byId, phase, phases, deskPositions, seatPositions, dineTablePositions, meetingSpot, bizData, marketRows, voice, onClose, onOpenChat, onAutoFix }) {
  const mountRef = useRef(null);
  const liveRef = useRef({ chars, phase, bizData, joyVec: { x: 0, y: 0 }, keys: {}, firstPerson: false });
  const [talkTarget, setTalkTarget] = useState(null);
  // Sitting on your own chair in your office ("שב"/"קום" button, or E key when
  // near the chair). While seated the sit animation plays and any movement
  // input stands you back up.
  const [sitting, setSitting] = useState(false);
  const [canSit, setCanSit] = useState(false);
  const [joyKnob, setJoyKnob] = useState({ x: 0, y: 0 });
  const [joyBase, setJoyBase] = useState(null); // floating joystick anchor (screen px), null = hidden
  const [firstPerson, setFirstPerson] = useState(false);
  const [voiceState, setVoiceState] = useState("idle"); // idle | listening | thinking | speaking
  const [voiceLine, setVoiceLine] = useState(null);      // { who, text } subtitle — sticky, only the user's own X closes it
  const recogRef = useRef(null);
  const joyDrag = useRef(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Model-download progress for the branded loading overlay (0..100, then
  // null once everything is in and the room is live).
  const [loadPct, setLoadPct] = useState(0);
  const [graphicsHigh, setGraphicsHigh] = useState(true); // bloom + SSAO on/off, for low-end devices
  // Turbo mode 🚀 — the "make it actually smooth" switch for machines where
  // the sim stutters (the owner's Mac): renders at 1x DPR straight through
  // the renderer (no post chain), drops shadows, freezes the CCTV feed,
  // hides the sky-life extras and the live iframe wall. Persisted so a
  // laggy machine stays fast on the next visit.
  const [turbo, setTurbo] = useState(() => { try { return localStorage.getItem("alpha:agents:turbo") === "1"; } catch { return false; } });
  useEffect(() => {
    liveRef.current.setTurbo?.(turbo);
    try { localStorage.setItem("alpha:agents:turbo", turbo ? "1" : "0"); } catch {}
  }, [turbo]);
  // Whether the mic should keep re-listening on its own while you're near an
  // agent — on by default (mic is "always listening" while in the sim), the
  // user can pause it (mic button, or the settings panel) without losing the
  // conversation text on screen. State (not a ref) so the settings panel can
  // show and toggle it.
  const [autoListen, setAutoListen] = useState(true);
  // Voice picker — same localStorage key App.jsx's speakText() reads, so
  // choosing a voice here actually changes what every agent sounds like,
  // both in the sim and in the regular text-chat modal.
  const [voiceList, setVoiceList] = useState([]);
  const [voiceUri, setVoiceUriState] = useState(() => { try { return localStorage.getItem("alpha:agents:voiceUri") || ""; } catch { return ""; } });
  const setVoiceUri = (uri) => { setVoiceUriState(uri); try { localStorage.setItem("alpha:agents:voiceUri", uri); } catch {} };
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const refresh = () => setVoiceList(window.speechSynthesis.getVoices());
    refresh();
    window.speechSynthesis.onvoiceschanged = refresh;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  useEffect(() => { liveRef.current.chars = chars; }, [chars]);
  useEffect(() => { liveRef.current.firstPerson = firstPerson; }, [firstPerson]);
  useEffect(() => { liveRef.current.sitting = sitting; }, [sitting]);
  useEffect(() => { liveRef.current.phase = phase; }, [phase]);
  useEffect(() => { liveRef.current.bizData = bizData; }, [bizData]);
  useEffect(() => { liveRef.current.marketRows = marketRows; }, [marketRows]);
  useEffect(() => { liveRef.current.onAutoFix = onAutoFix; }, [onAutoFix]);
  // Push the graphics-quality toggle down into the postprocessing passes
  // once they exist (they're created inside the async mount effect below).
  useEffect(() => { liveRef.current.setGraphicsHigh?.(graphicsHigh); }, [graphicsHigh]);
  // Stop any live mic / speech when the sim unmounts.
  useEffect(() => () => { try { recogRef.current?.stop(); window.speechSynthesis?.cancel(); } catch {} }, []);
  // Walk away from an agent → stop the live mic (nothing to listen for), but
  // the subtitle/transcript stays on screen until you dismiss it yourself —
  // it used to vanish the instant you stepped back, which read as "the text
  // disappears too fast".
  useEffect(() => {
    if (!talkTarget) { try { recogRef.current?.stop(); } catch {} setVoiceState("idle"); }
  }, [talkTarget]);
  // Approaching a new agent re-arms the always-listening mic for them.
  useEffect(() => { if (talkTarget) setAutoListen(true); }, [talkTarget]);
  // The "always listening" loop: whenever you're standing near an agent, the
  // mic is idle, and auto-listen hasn't been paused, start listening on its
  // own — no need to tap the mic every single time you want to talk.
  // autoListen is a dependency too, so re-enabling it (mic button/settings)
  // immediately restarts the loop instead of waiting for a state change.
  useEffect(() => {
    if (!talkTarget || !voice?.canListen || !autoListen) return;
    if (voiceState !== "idle") return;
    const t = setTimeout(() => startVoiceTalk(true), 550);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [talkTarget, voiceState, autoListen]);
  // Watchdog: the flowing-chat loop must ALWAYS come back to "idle" (that's
  // what re-opens the mic). If any stage silently stalls — a hung AI request
  // in "thinking", a speech-synthesis glitch in "speaking", a recognition
  // session that never fires onend — force it back to idle after that
  // stage's worst-case time, so the conversation never dies mid-flow.
  useEffect(() => {
    if (voiceState === "idle") return;
    const cap = voiceState === "listening" ? 20000 : voiceState === "thinking" ? 30000 : 60000;
    const t = setTimeout(() => {
      try { recogRef.current?.stop(); } catch {}
      try { window.speechSynthesis?.cancel(); } catch {}
      setVoiceState("idle");
    }, cap);
    return () => clearTimeout(t);
  }, [voiceState]);

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
      // Real Heavy Guard brand mark, shared by every logo placement in the
      // room (reception counter, owner suite, meeting room, floor decal…).
      HG_LOGO_TEX = new THREE.TextureLoader().load(base + "office-models/hg-logo.png");
      HG_LOGO_TEX.colorSpace = THREE.SRGBColorSpace;
      HG_LOGO_TEX.anisotropy = 8;
      // One shared manager so the loading overlay can show real download
      // progress across all five models instead of an indeterminate spinner.
      const manager = new THREE.LoadingManager();
      manager.onProgress = (_url, loaded, total) => {
        if (!cancelled && total > 0) setLoadPct(Math.min(99, Math.round((loaded / total) * 100)));
      };
      const [deskTemplate, laptopTemplate, charGltf, furnitureTemplate, officeDecorTemplate] = await Promise.all([
        loadGltf(base + DESK_MODEL_URL, manager).catch((e) => { console.error("[office3d] desk model failed to load", e); return null; }),
        loadGltf(base + LAPTOP_MODEL_URL, manager).catch((e) => { console.error("[office3d] laptop model failed to load", e); return null; }),
        loadGltfFull(base + CHAR_MODEL_URL, manager).catch((e) => { console.error("[office3d] character model failed to load", e); return null; }),
        loadGltf(base + FURNITURE_MODEL_URL, manager).catch((e) => { console.error("[office3d] furniture model failed to load", e); return null; }),
        loadGltf(base + OFFICE_DECOR_MODEL_URL, manager).catch((e) => { console.error("[office3d] office decor model failed to load", e); return null; }),
      ]);
      if (cancelled) return;
      setLoadPct(null); // room is live
      const charTemplate = charGltf ? charGltf.scene : null;
      const charClips = charGltf ? charGltf.animations : [];

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || ("ontouchstart" in window) || window.innerWidth < 900;
    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    // A touch under 2× keeps postprocessing (bloom + SSAO) smooth while still
    // looking crisp; mobile stays lighter.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Cinematic colour: ACES filmic tone-mapping + sRGB output so the neon /
    // emissive materials roll off gracefully instead of clipping to flat white.
    // (The final tone-map/encode is done by OutputPass at the end of the
    // post-processing chain below.)
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    // ── Post-processing chain: RenderPass → SSAO (desktop) → Bloom → Output ──
    // Bloom gives the neon/monitors a soft realistic glow; SSAO grounds every
    // object with contact shadowing; OutputPass applies the ACES tone-map +
    // sRGB at the very end so nothing double-encodes.
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(width, height);
    composer.addPass(new RenderPass(scene, camera));
    let ssaoPass = null;
    if (!isMobile) {
      ssaoPass = new SSAOPass(scene, camera, width, height);
      ssaoPass.kernelRadius = 0.6;
      ssaoPass.minDistance = 0.0008;
      ssaoPass.maxDistance = 0.12;
      composer.addPass(ssaoPass);
    }
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.55, 0.7, 0.85);
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
    // Settings-panel graphics toggle — both passes support .enabled out of
    // the box (base three.js Pass class), so this is a cheap on/off for
    // slower devices without rebuilding the composer chain. Turbo overrides
    // both passes off regardless of the quality toggle (turboOn is shared
    // with setTurbo, defined once the whole scene exists).
    let gfxHigh = graphicsHigh;
    let turboOn = false;
    const applyPasses = () => {
      bloomPass.enabled = gfxHigh && !turboOn;
      if (ssaoPass) ssaoPass.enabled = gfxHigh && !turboOn;
    };
    liveRef.current.setGraphicsHigh = (high) => { gfxHigh = high; applyPasses(); };
    liveRef.current.setGraphicsHigh(graphicsHigh);

    // ── Real HDRI environment (free CC0 Poly Haven) for image-based lighting
    // + realistic reflections on glass/marble/metal, with a hard fallback to
    // the procedural sky so the scene never breaks if the CDN is unreachable.
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    new RGBELoader()
      .setDataType(THREE.HalfFloatType)
      .load(
        "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/kloppenheim_06_puresky_2k.hdr",
        (hdr) => {
          if (cancelled) { hdr.dispose(); return; }
          hdr.mapping = THREE.EquirectangularReflectionMapping;
          const env = pmrem.fromEquirectangular(hdr).texture;
          scene.environment = env;
          hdr.dispose(); pmrem.dispose();
        },
        undefined,
        () => { /* offline/blocked — keep the procedural skyline + lights */ }
      );

    // Sky/ground hemisphere fill for a soft, realistic ambient gradient, on
    // top of a low flat ambient so nothing goes fully black.
    const ambient = new THREE.AmbientLight(0xffffff, 0.42);
    scene.add(ambient);
    const hemi = new THREE.HemisphereLight(0xbfd4ff, 0x2a2030, 0.55);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff2df, 1.25);
    sun.position.set(9, 14, 6);
    sun.castShadow = !isMobile;
    if (!isMobile) {
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -15; sun.shadow.camera.right = 15;
      sun.shadow.camera.top = 15; sun.shadow.camera.bottom = -15;
      sun.shadow.camera.near = 1; sun.shadow.camera.far = 46;
      sun.shadow.bias = -0.0004;
      sun.shadow.normalBias = 0.035; // higher normal bias kills acne banding on curved character meshes
      sun.shadow.radius = 3;
    }
    scene.add(sun);
    // A cool fill from the window side so the room has depth, not one flat key.
    const fill = new THREE.DirectionalLight(0x6f9dff, 0.35);
    fill.position.set(-8, 9, -12);
    scene.add(fill);
    scene.fog = new THREE.Fog(0x11162a, 18, 38);

    // Dust motes drifting through the room — a soft round sprite, additively
    // blended, catching the light for a lived-in, sunbeam feel. Cheap (one
    // draw call) and animated by slow drift in the loop.
    const dustCount = isMobile ? 120 : 320;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustPhase = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * FLOOR_W;
      dustPos[i * 3 + 1] = 0.4 + Math.random() * 4.6;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * FLOOR_D;
      dustPhase[i] = Math.random() * Math.PI * 2;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustCvs = document.createElement("canvas"); dustCvs.width = dustCvs.height = 32;
    const dctx = dustCvs.getContext("2d");
    const dgrad = dctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    dgrad.addColorStop(0, "rgba(255,248,230,0.9)"); dgrad.addColorStop(1, "rgba(255,248,230,0)");
    dctx.fillStyle = dgrad; dctx.fillRect(0, 0, 32, 32);
    const dustTex = new THREE.CanvasTexture(dustCvs);
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      size: 0.06, map: dustTex, transparent: true, opacity: 0.5, depthWrite: false,
      blending: THREE.AdditiveBlending, sizeAttenuation: true,
    }));
    scene.add(dust);

    // Floor — polished hardwood: warm wood texture + low roughness so it
    // catches soft reflections of the room + HDRI sky (image-based lighting).
    const floorTex = buildFloorTexture();
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(FLOOR_W, FLOOR_D),
      // Showroom-polished: a touch glossier + stronger HDRI reflection so
      // the car, agents and neon read in the floor (env-map "SSR" — the
      // real screen-space pass would cost a full extra scene render).
      new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.34, metalness: 0.22, envMapIntensity: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Rugs under the meeting nook and dining room for warmth.
    {
      const cx = seatPositions.reduce((s, p) => s + p.x, 0) / seatPositions.length;
      const cy = seatPositions.reduce((s, p) => s + p.y, 0) / seatPositions.length;
      const [wx, wz] = toWorld(cx, cy);
      const rug = buildRug(5.0, 4.8, 0x3a2c1c);
      rug.position.set(wx, 0, wz);
      scene.add(rug);
    }
    if (dineTablePositions.length) {
      const cx = dineTablePositions.reduce((s, p) => s + p.x, 0) / dineTablePositions.length;
      const cy = dineTablePositions.reduce((s, p) => s + p.y, 0) / dineTablePositions.length;
      const [wx, wz] = toWorld(cx, cy);
      const rug = buildRug(9.0, 8.2, 0x2a2440);
      rug.position.set(wx, 0, wz);
      scene.add(rug);
    }

    // Designed ceiling — coffered panels + warm LED strips + brass trim,
    // one textured plane. Single-sided facing DOWN (rotation.x = +π/2, the
    // same orientation the old light panels used), so from inside/first
    // person it reads as a real finished ceiling, while the third-person
    // chase camera above it looks straight through — its backface is
    // culled, so it never hides the room from the owner's usual view.
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(FLOOR_W, FLOOR_D),
      new THREE.MeshBasicMaterial({ map: buildCeilingTexture(), toneMapped: false })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 5.4;
    scene.add(ceiling);
    // Designer hanging pendant lamps over each desk column — an emissive
    // glass globe on a slim cord, for a more upscale/luxurious ceiling. No
    // per-lamp light (kept cheap); the emissive globes read as lit fixtures.
    {
      const cordMat = new THREE.MeshStandardMaterial({ color: 0x0c0e13, roughness: 0.5, metalness: 0.6 });
      const globeMat = new THREE.MeshStandardMaterial({ color: 0xfff2d0, emissive: 0xffe6b0, emissiveIntensity: 0.9, roughness: 0.3 });
      const cols = [...new Set(deskPositions.map((d) => Math.round(toWorld(d.x, d.y)[0])))];
      cols.forEach((cx) => {
        [-6.8, 0, 6.8].forEach((cz) => {
          const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.1, 6), cordMat);
          cord.position.set(cx + 0.8, 4.85, cz); scene.add(cord);
          const globe = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), globeMat);
          globe.position.set(cx + 0.8, 4.25, cz); scene.add(globe);
        });
      });
    }

    // North window wall — a real 3D skyline with actual depth, not a flat
    // painted picture. The old single texture-plane is pushed far back as a
    // distant hazy horizon; a cluster of real 3D buildings (boxes with a
    // tiled window-facade texture) sits between the window and that horizon
    // so moving the camera gives genuine parallax. A near-transparent glass
    // pane at the actual window line keeps a slight reflective feel.
    let skylineMode = liveRef.current.phase <= 1 ? "day" : "night";
    const skyline = buildSkylineTexture(skylineMode);
    const [nwx, nwz] = [0, -(FLOOR_D / 2) - 0.05];
    const skyWall = new THREE.Mesh(
      new THREE.PlaneGeometry(150, 46),
      new THREE.MeshBasicMaterial({ map: skyline.tex, fog: false })
    );
    skyWall.position.set(nwx, 14, nwz - 46);
    scene.add(skyWall);

    // Drifting cloud layer — one repeating transparent strip just in front
    // of the sky wall, scrolled slowly in the render loop for real motion
    // in the view (opacity retuned per sky mode: bright by day, warm-dim at
    // sunset, near-invisible at night).
    const cloudCvs = document.createElement("canvas");
    cloudCvs.width = 1024; cloudCvs.height = 200;
    {
      const cctx2 = cloudCvs.getContext("2d");
      const crnd = mulberry32(1234);
      cctx2.clearRect(0, 0, 1024, 200);
      for (let i = 0; i < 9; i++) {
        const cx = crnd() * 1024, cy = 30 + crnd() * 120, s = 45 + crnd() * 75;
        const a = 0.25 + crnd() * 0.3;
        cctx2.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
        cctx2.beginPath();
        cctx2.ellipse(cx, cy, s, s * 0.32, 0, 0, Math.PI * 2);
        cctx2.ellipse(cx + s * 0.55, cy + 7, s * 0.62, s * 0.26, 0, 0, Math.PI * 2);
        cctx2.ellipse(cx - s * 0.5, cy + 9, s * 0.5, s * 0.22, 0, 0, Math.PI * 2);
        cctx2.fill();
      }
    }
    const cloudTex = new THREE.CanvasTexture(cloudCvs);
    cloudTex.wrapS = THREE.RepeatWrapping;
    cloudTex.colorSpace = THREE.SRGBColorSpace;
    const cloudMat = new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, opacity: 0.85, depthWrite: false, fog: false });
    const cloudLayer = new THREE.Mesh(new THREE.PlaneGeometry(150, 13), cloudMat);
    cloudLayer.position.set(nwx, 26, nwz - 44.5);
    scene.add(cloudLayer);

    // A tiny airliner crossing the view with a blinking beacon.
    const planeGroup = new THREE.Group();
    const planeBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.12), new THREE.MeshBasicMaterial({ color: 0xd8dde6, fog: false }));
    planeGroup.add(planeBody);
    const planeWing = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 1.1), new THREE.MeshBasicMaterial({ color: 0xb9c0cc, fog: false }));
    planeGroup.add(planeWing);
    const planeBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0.9, fog: false })
    );
    planeBeacon.position.set(-0.85, 0.05, 0);
    planeGroup.add(planeBeacon);
    planeGroup.position.set(-60, 25.5, nwz - 40);
    scene.add(planeGroup);

    // A small flock of birds (day only) — three dark 'v' sprites bobbing.
    const birdGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const bc = document.createElement("canvas"); bc.width = bc.height = 32;
      const bx2 = bc.getContext("2d");
      bx2.strokeStyle = "rgba(20,24,32,.9)"; bx2.lineWidth = 3; bx2.lineCap = "round";
      bx2.beginPath(); bx2.moveTo(4, 20); bx2.quadraticCurveTo(16, 8, 16, 18); bx2.quadraticCurveTo(16, 8, 28, 20); bx2.stroke();
      const bt = new THREE.CanvasTexture(bc);
      const bird = new THREE.Sprite(new THREE.SpriteMaterial({ map: bt, transparent: true, fog: false }));
      bird.scale.set(0.9, 0.9, 1);
      bird.position.set(i * 2.1 - 2, (i % 2) * 0.5, i * 0.4);
      birdGroup.add(bird);
    }
    birdGroup.position.set(-30, 17.5, nwz - 34);
    scene.add(birdGroup);

    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(FLOOR_W, 6.4),
      new THREE.MeshPhysicalMaterial({ color: 0xbcd8f0, transparent: true, opacity: 0.06, roughness: 0.05, metalness: 0.1, depthWrite: false })
    );
    glass.position.set(nwx, 3.2, nwz);
    scene.add(glass);

    // Real 3D buildings for actual foreground depth/parallax — sparse and
    // set well back from the glass (12–40 units past the window) so they
    // read as a skyline in the distance with real sky between them, not a
    // wall of texture pressed up against the window.
    const facadeAlbedo = buildFacadeAlbedo();
    const facadeEmissive = buildFacadeEmissive();
    const nearBuildingMats = [];
    {
      const cityRnd = mulberry32(9091);
      let bx = -70;
      while (bx < 70) {
        const w = 3 + cityRnd() * 5, h = 7 + cityRnd() * 20, d = 3 + cityRnd() * 5;
        const bz = nwz - 12 - cityRnd() * 28;
        const gap = w + 5 + cityRnd() * 9;
        if (Math.abs(bx) > 5) {
          const albedoTex = facadeAlbedo.clone();
          const emissiveTex = facadeEmissive.clone();
          albedoTex.repeat.set(Math.max(1, w / 2.2), Math.max(1, h / 3.2));
          emissiveTex.repeat.copy(albedoTex.repeat);
          albedoTex.needsUpdate = true; emissiveTex.needsUpdate = true;
          const mat = new THREE.MeshStandardMaterial({
            map: albedoTex, emissiveMap: emissiveTex, emissive: 0xffd8a0, emissiveIntensity: 0,
            roughness: 0.75, metalness: 0.15, fog: false,
          });
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
          mesh.position.set(bx, h / 2, bz);
          scene.add(mesh);
          nearBuildingMats.push(mat);
          if (!scene.userData.tallB || h > scene.userData.tallB.h) scene.userData.tallB = { x: bx, h, z: bz, d };
        }
        bx += gap;
      }
    }

    /* ── Showcase-window life v3 ──────────────────────────────────────────
       The view out the glass gets a living city layer: a Times-Square-style
       billboard on the tallest nearby tower cycling REAL content (Heavy
       Guard ad → ALPHA → live Bitcoin off the market feed), a helicopter
       with a spinning rotor + strobe crossing opposite the airliner, a
       striped hot-air balloon drifting by day, and two searchlight beams
       sweeping the sky at night. All sprite/canvas-cheap. ── */
    const bbCvs = document.createElement("canvas");
    // 2x supersampled (drawn in 220x320 logical coords) so the billboard
    // text and the brand mark stay crisp instead of soft up close.
    bbCvs.width = 440; bbCvs.height = 640;
    const bbCtx = bbCvs.getContext("2d");
    bbCtx.scale(2, 2);
    const bbTex = new THREE.CanvasTexture(bbCvs);
    bbTex.colorSpace = THREE.SRGBColorSpace;
    bbTex.anisotropy = 8;
    // The REAL Heavy Guard logo on the tower ad (repaints the board when the
    // image lands, replacing the old placeholder hexagon).
    let bbLogoImg = null;
    const drawBillboard = (mode) => {
      const c = bbCtx;
      c.fillStyle = "#05070d"; c.fillRect(0, 0, 220, 320);
      c.textAlign = "center";
      if (mode === 0) {
        if (bbLogoImg && bbLogoImg.complete && bbLogoImg.naturalWidth) {
          const lw = 132, lh = lw * 1.16;
          c.drawImage(bbLogoImg, 110 - lw / 2, 24, lw, lh);
          c.fillStyle = "#E4BC63"; c.font = "900 27px system-ui";
          c.fillText("HEAVY GUARD", 110, 216);
        } else {
          c.fillStyle = "#E4BC63"; c.font = "900 34px system-ui";
          c.fillText("HEAVY", 110, 96); c.fillText("GUARD", 110, 140);
        }
        c.fillStyle = "#cfd8e6"; c.font = "700 19px system-ui";
        c.fillText("מיגון כלי צמ\"ה", 110, 296);
      } else if (mode === 1) {
        c.fillStyle = "#18e0ff"; c.font = "900 44px system-ui";
        c.fillText("ALPHA", 110, 130);
        c.fillStyle = "#ff3ea5"; c.font = "800 26px system-ui";
        c.fillText("HQ · 24/7", 110, 176);
        c.fillStyle = "#9fb2d4"; c.font = "600 17px system-ui";
        c.fillText("13 סוכנים · עיר אחת", 110, 232);
      } else {
        const btc = (liveRef.current.marketRows || []).find((r) => r.name === "Bitcoin");
        c.fillStyle = "#f7931a"; c.font = "900 52px system-ui";
        c.fillText("₿", 110, 92);
        c.font = "800 24px system-ui"; c.fillText("BITCOIN", 110, 136);
        c.fillStyle = "#fff"; c.font = "800 26px system-ui";
        c.fillText(btc ? btc.price : "…", 110, 196);
        if (btc) {
          c.fillStyle = btc.chg >= 0 ? "#3FD79A" : "#ff5f6d"; c.font = "800 22px system-ui";
          c.fillText(`${btc.chg >= 0 ? "▲" : "▼"} ${Math.abs(btc.chg).toFixed(2)}%`, 110, 244);
        }
        c.fillStyle = "#5f7d6f"; c.font = "600 14px system-ui";
        c.fillText("LIVE", 110, 290);
      }
    };
    drawBillboard(0);
    let bbMode = 0, bbTick = 0;
    {
      const img = new Image();
      img.onload = () => { bbLogoImg = img; if (bbMode === 0) { drawBillboard(0); bbTex.needsUpdate = true; } };
      img.src = base + "office-models/hg-logo.png";
    }
    const bbMat = new THREE.MeshBasicMaterial({ map: bbTex, toneMapped: false, fog: false });
    {
      const tall = scene.userData.tallB || { x: 24, h: 20, z: nwz - 24, d: 4 };
      const frame = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 7.0), new THREE.MeshBasicMaterial({ color: 0x02030a, fog: false }));
      frame.position.set(tall.x, tall.h * 0.62, tall.z + tall.d / 2 + 0.05);
      scene.add(frame);
      const billboard = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 6.5), bbMat);
      billboard.position.set(tall.x, tall.h * 0.62, tall.z + tall.d / 2 + 0.09);
      scene.add(billboard);
    }

    // Helicopter — crosses right-to-left (opposite the airliner), higher.
    const heliGroup = new THREE.Group();
    const heliBodyMat = new THREE.MeshBasicMaterial({ color: 0x11141c, fog: false });
    const heliBody = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), heliBodyMat);
    heliBody.scale.set(1.5, 0.75, 0.7); heliGroup.add(heliBody);
    const heliTail = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.14, 0.12), heliBodyMat);
    heliTail.position.set(-1.2, 0.12, 0); heliGroup.add(heliTail);
    const heliRotor = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.04, 0.16), new THREE.MeshBasicMaterial({ color: 0x2a3040, transparent: true, opacity: 0.75, fog: false }));
    heliRotor.position.y = 0.52; heliGroup.add(heliRotor);
    const heliStrobe = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.9, fog: false }));
    heliStrobe.position.set(0.2, -0.42, 0); heliGroup.add(heliStrobe);
    heliGroup.position.set(70, 23, nwz - 24);
    scene.add(heliGroup);

    // Hot-air balloon — striped envelope + basket, drifting slowly, day only.
    const balloonGroup = new THREE.Group();
    {
      const sc = document.createElement("canvas"); sc.width = 64; sc.height = 32;
      const sctx = sc.getContext("2d");
      const cols = ["#e2504c", "#f2b134", "#f7f4ea", "#3a7bd5"];
      for (let i = 0; i < 8; i++) { sctx.fillStyle = cols[i % cols.length]; sctx.fillRect(i * 8, 0, 8, 32); }
      const st = new THREE.CanvasTexture(sc); st.colorSpace = THREE.SRGBColorSpace;
      const env = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 12), new THREE.MeshStandardMaterial({ map: st, roughness: 0.7, fog: false }));
      env.scale.set(1, 1.15, 1); balloonGroup.add(env);
      const basket = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.5), new THREE.MeshStandardMaterial({ color: 0x6b4a26, roughness: 0.8, fog: false }));
      basket.position.y = -2.3; balloonGroup.add(basket);
      [[-0.3, -0.3], [0.3, 0.3]].forEach(([rx, rz]) => {
        const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.0, 4), heliBodyMat);
        rope.position.set(rx, -1.75, rz); balloonGroup.add(rope);
      });
    }
    balloonGroup.position.set(-45, 14, nwz - 30);
    scene.add(balloonGroup);

    // Night searchlights — two additive beams sweeping from behind the city.
    const searchGroup = new THREE.Group();
    const mkBeam = (px, tilt) => {
      const bc = document.createElement("canvas"); bc.width = 32; bc.height = 128;
      const bx2 = bc.getContext("2d");
      const grd = bx2.createLinearGradient(0, 128, 0, 0);
      grd.addColorStop(0, "rgba(210,230,255,.55)"); grd.addColorStop(1, "rgba(210,230,255,0)");
      bx2.fillStyle = grd; bx2.fillRect(0, 0, 32, 128);
      const bt = new THREE.CanvasTexture(bc);
      const geo = new THREE.PlaneGeometry(1.0, 30);
      geo.translate(0, 15, 0); // pivot at the base so rotation sweeps the beam
      const beam = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: bt, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
      beam.position.set(px, 5, nwz - 33);
      beam.rotation.z = tilt;
      searchGroup.add(beam);
      return beam;
    };
    const beam1 = mkBeam(-20, -0.15);
    const beam2 = mkBeam(28, 0.2);
    searchGroup.visible = false;
    scene.add(searchGroup);

    // A thin animated street strip at the base — small, cheap, redrawn
    // every frame — so the window always has some motion in it.
    const trafficCanvas = document.createElement("canvas");
    trafficCanvas.width = 1024; trafficCanvas.height = 48;
    const trafficCtx = trafficCanvas.getContext("2d");
    const trafficState = makeTrafficState();
    const trafficTex = new THREE.CanvasTexture(trafficCanvas);
    trafficTex.colorSpace = THREE.SRGBColorSpace;
    const trafficStrip = new THREE.Mesh(
      new THREE.PlaneGeometry(FLOOR_W, 0.5),
      new THREE.MeshBasicMaterial({ map: trafficTex, toneMapped: false })
    );
    trafficStrip.position.set(nwx, 0.42, nwz - 4);
    scene.add(trafficStrip);
    // Window mullions for structure over the glass.
    const mullionMat = new THREE.MeshStandardMaterial({ color: 0x0e1220, roughness: 0.6 });
    for (let i = -5; i <= 5; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.08, 6.4, 0.1), mullionMat);
      m.position.set(i * (FLOOR_W / 11), 3.2, nwz + 0.03);
      scene.add(m);
    }
    // Painted walls — slate-blue plaster with a dark wainscot + brass trim
    // (buildWallTexture). The side walls got the paint job, and the south
    // side finally gets a REAL wall: it never existed, so the big wall
    // screen and the art there floated against the open sky, which is a
    // big part of why that side of the room shimmered. Front-side only,
    // facing in — the chase camera outside the south edge sees through it.
    const wallMat = new THREE.MeshStandardMaterial({ map: buildWallTexture(5), roughness: 0.85, metalness: 0.05 });
    const wallL = new THREE.Mesh(new THREE.PlaneGeometry(FLOOR_D, 6.4), wallMat);
    wallL.rotation.y = Math.PI / 2;
    wallL.position.set(-(FLOOR_W / 2) - 0.05, 3.2, 0);
    scene.add(wallL);
    const wallR = wallL.clone();
    wallR.rotation.y = -Math.PI / 2;
    wallR.position.x = (FLOOR_W / 2) + 0.05;
    scene.add(wallR);
    const wallS = new THREE.Mesh(
      new THREE.PlaneGeometry(FLOOR_W, 6.4),
      new THREE.MeshStandardMaterial({ map: buildWallTexture(6), roughness: 0.85, metalness: 0.05 })
    );
    wallS.rotation.y = Math.PI;
    wallS.position.set(0, 3.2, FLOOR_D / 2 + 0.05);
    scene.add(wallS);

    // High clerestory window band on the east wall — a second slice of the
    // city visible from the dining/owner side, using the same skyline canvas
    // with its own offset/repeat so it reads as a different part of town.
    const eastWinTex = skyline.tex.clone();
    eastWinTex.repeat.set(0.34, 0.42);
    eastWinTex.offset.set(0.42, 0.12);
    eastWinTex.needsUpdate = true;
    {
      const bandFrame = new THREE.Mesh(new THREE.PlaneGeometry(13.5, 2.3), new THREE.MeshBasicMaterial({ color: 0x0a0e18 }));
      bandFrame.rotation.y = -Math.PI / 2;
      bandFrame.position.set(FLOOR_W / 2 - 0.02, 4.2, -4.5);
      scene.add(bandFrame);
      const band = new THREE.Mesh(new THREE.PlaneGeometry(13, 1.9), new THREE.MeshBasicMaterial({ map: eastWinTex, fog: false }));
      band.rotation.y = -Math.PI / 2;
      band.position.set(FLOOR_W / 2 - 0.06, 4.2, -4.5);
      scene.add(band);
      for (let i = -2; i <= 2; i++) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.09, 2.1, 0.07), mullionMat);
        m.rotation.y = -Math.PI / 2;
        m.position.set(FLOOR_W / 2 - 0.08, 4.2, -4.5 + i * 3.25);
        scene.add(m);
      }
    }

    // Lounge corner + bookshelf for a lived-in office feel — the user's own
    // furniture pack pieces (real sofa, coffee table, floor lamp, wall TV)
    // replace the earlier procedural couch when the model loads; falls back
    // to the procedural one so the corner is never empty.
    if (furnitureTemplate) {
      placeFurniturePiece(scene, furnitureTemplate, "sofa_001", -14.3, 0, 12.8, Math.PI);
      placeFurniturePiece(scene, furnitureTemplate, "coffee_table_001", -14.3, 0, 10.7, 0);
      placeFurniturePiece(scene, furnitureTemplate, "lamp_002", -11.0, 0, 14.0, 0);
      placeFurniturePiece(scene, furnitureTemplate, "flower_001", -17.9, 0, 13.4, 0);
      // A little "treat/surprise" — an air-hockey table between the lounge
      // and dining room, for the cozy-office-with-perks feel.
      placeFurniturePiece(scene, furnitureTemplate, "air_hockey_001", -5.3, 0, 12.3, Math.PI / 2);
      // Storage corner (south-east) — closet, dresser, a stacked box, and a
      // couple of toys tucked by it for a lived-in, playful touch.
      placeFurniturePiece(scene, furnitureTemplate, "closet_001", 13.5, 0, -14.3, 0);
      placeFurniturePiece(scene, furnitureTemplate, "dresser_001", 15.9, 0, -14.3, 0);
      placeFurniturePiece(scene, furnitureTemplate, "box_001", 17.4, 0, -13.8, 0);
      placeFurniturePiece(scene, furnitureTemplate, "toy_001", 12.5, 0, -12.9, 0.6);
      placeFurniturePiece(scene, furnitureTemplate, "toy_002", 13.1, 0, -12.3, -0.4);
      // Break-room kitchenette (east wall) — a counter with small appliances
      // and clutter, plus a fridge and sink, near the existing dining tables.
      placeFurniturePiece(scene, furnitureTemplate, "kitchen_table_001", 18.4, 0, 5.6, Math.PI / 2);
      placeFurniturePiece(scene, furnitureTemplate, "fridge_001", 18.8, 0, 1.5, -Math.PI / 2);
      placeFurniturePiece(scene, furnitureTemplate, "kitchen_sink_001", 18.8, 0, 7.6, -Math.PI / 2);
      placeFurniturePiece(scene, furnitureTemplate, "coffee_machine_001", 18.3, 1.036, 5.0, 0);
      placeFurniturePiece(scene, furnitureTemplate, "microwave_oven_001", 18.5, 1.036, 6.1, 0);
      placeFurniturePiece(scene, furnitureTemplate, "dish_001", 18.15, 1.036, 5.5, 0);
      placeFurniturePiece(scene, furnitureTemplate, "dish_002", 18.75, 1.036, 5.8, 0);
      placeFurniturePiece(scene, furnitureTemplate, "drink_001", 18.25, 1.036, 5.9, 0);
      placeFurniturePiece(scene, furnitureTemplate, "drink_002", 18.65, 1.036, 5.3, 0);
    } else {
      const couch = buildCouch();
      couch.position.set(-14.3, 0, 12.8);
      couch.rotation.y = Math.PI;
      scene.add(couch);
    }
    const shelf = buildBookshelf();
    shelf.position.set(-18.6, 0, 9.8);
    shelf.rotation.y = Math.PI / 2;
    scene.add(shelf);

    // Two wall TVs for a lived-in "always something on" office feel — a
    // live-markets ticker over the lounge sofa, and the real HeavyGuard/CRM
    // numbers near the meeting nook. Redrawn a few times a second in the
    // animate loop below, not every frame.
    const tradeCanvas = document.createElement("canvas");
    tradeCanvas.width = 640; tradeCanvas.height = 356;
    const tradeCtx = tradeCanvas.getContext("2d");
    const tvTrade = buildTvScreen(furnitureTemplate, tradeCanvas);
    tvTrade.group.position.set(-(FLOOR_W / 2) + 0.2, 1.5, 12.8);
    tvTrade.group.rotation.y = Math.PI / 2;
    scene.add(tvTrade.group);

    const hgCanvas = document.createElement("canvas");
    hgCanvas.width = 640; hgCanvas.height = 356;
    const hgCtx = hgCanvas.getContext("2d");
    const tvHg = buildTvScreen(furnitureTemplate, hgCanvas);
    tvHg.group.position.set((FLOOR_W / 2) - 0.2, 1.5, -8.3);
    tvHg.group.rotation.y = -Math.PI / 2;
    scene.add(tvHg.group);
    drawTradeScreen(tradeCtx, tradeCanvas.width, tradeCanvas.height, liveRef.current.marketRows);
    drawHgScreen(hgCtx, hgCanvas.width, hgCanvas.height, liveRef.current.bizData);
    let screenT = 0;
    // (SE corner plant removed — that corner is now the owner's office; the
    // SW plant moved out of the restrooms footprint.)
    // (middle plant pulled out of the storage-corner cluster so it doesn't
    // crowd the dresser/box pieces)
    [[-11.1, 15.5], [16.2, -11.3], [2.3, 15.6]].forEach(([px, pz]) => {
      const plant = buildPlant();
      plant.position.set(px, 0, pz);
      scene.add(plant);
    });

    // Furniture — each desk is tinted with its owner's own color (same
    // index mapping as chars[i]'s permanent home desk), and fully kitted
    // out with a lamp + a personal item that rotates by desk index for
    // variety. Also collects a collision circle per obstacle so the player
    // can't walk straight through any of it (see resolveCollisions above).
    const deskMons = [];
    const deskHolos = [];
    const obstacles = [];
    // Extra non-agent humans (e.g. the receptionist) that still need their
    // animation mixer ticked and to be disposed on unmount.
    const allExtraHumans = [];
    deskPositions.forEach((d, i) => {
      const owner = byId(chars[i]?.id);
      const { group, monMat, holo } = buildDesk(owner ? hexToInt(owner.color) : 0x3a6ad8, deskTemplate, laptopTemplate, furnitureTemplate, i);
      const [wx, wz] = toWorld(d.x, d.y);
      // Per-desk facing (perimeter layout): the whole station turns to the
      // desk's own rot so the seated worker looks the right way for the wall
      // their office sits against.
      const rot = typeof d.rot === "number" ? d.rot : DESK_FACE_ROT;
      group.position.set(wx, 0, wz);
      group.rotation.y = rot;
      scene.add(group);
      deskMons.push(monMat);
      deskHolos.push(holo);
      obstacles.push({ x: wx, z: wz, r: 0.85 });
      // Each agent gets their own private glass office wrapped around their
      // battlestation — colour-coded, with their name + title over the door,
      // a potted plant, and a wall screen showing their own live domain data.
      // The office turns with the desk (doorway on the worker's back side),
      // and its wall collision circles get the same rotation applied.
      if (owner) {
        const scrTex = buildOfficeScreenTex(owner.title, hexToInt(owner.color), agentScreenLines(owner.id, liveRef.current.bizData || {}));
        const off = buildGlassOffice(hexToInt(owner.color), owner.name, owner.title, scrTex, officeDecorTemplate);
        const offRot = rot - Math.PI;
        off.group.position.set(wx, 0, wz);
        off.group.rotation.y = offRot;
        scene.add(off.group);
        const cr = Math.cos(offRot), sr = Math.sin(offRot);
        off.obstacles.forEach((o) => obstacles.push({ x: wx + o.x * cr + o.z * sr, z: wz - o.x * sr + o.z * cr, r: o.r }));
      }
    });
    dineTablePositions.forEach((t) => {
      const tbl = buildDiningTable();
      const [wx, wz] = toWorld(t.x, t.y);
      tbl.position.set(wx, 0, wz);
      scene.add(tbl);
      const lamp = buildPendantLamp();
      lamp.position.set(wx, 5.0, wz);
      scene.add(lamp);
      obstacles.push({ x: wx, z: wz, r: 1.1 });
    });
    {
      const mt = buildMeetingTable();
      const cx = seatPositions.reduce((s, p) => s + p.x, 0) / seatPositions.length;
      const cy = seatPositions.reduce((s, p) => s + p.y, 0) / seatPositions.length;
      const [wx, wz] = toWorld(cx, cy);
      mt.position.set(wx, 0, wz);
      scene.add(mt);
      obstacles.push({ x: wx, z: wz, r: 1.0 });
      // Wrap the whole meeting nook in a shared glass conference room with a
      // presentation screen + "חדר ישיבות" sign over the door.
      const confCvs = document.createElement("canvas");
      confCvs.width = 512; confCvs.height = 288;
      const cctx = confCvs.getContext("2d");
      const cg = cctx.createLinearGradient(0, 0, 0, 288);
      cg.addColorStop(0, "#101a2e"); cg.addColorStop(1, "#0a1120");
      cctx.fillStyle = cg; cctx.fillRect(0, 0, 512, 288);
      cctx.fillStyle = "#E4BC63"; cctx.font = "700 40px system-ui, sans-serif";
      cctx.textAlign = "center"; cctx.fillText("מרכז הסוכנים · אלפא", 256, 60);
      cctx.fillStyle = "#9fd6ff"; cctx.font = "600 24px system-ui, sans-serif";
      cctx.fillText("ישיבת צוות · יעדים ושיתופי פעולה", 256, 100);
      const bars = [0.5, 0.72, 0.6, 0.88, 0.66, 0.95];
      bars.forEach((b, bi) => {
        cctx.fillStyle = ["#3FD79A", "#6FD3F0", "#C77DFF", "#FF8C42", "#FFD23F", "#FF6B9D"][bi];
        const bw = 44, gap = 24, x0 = 70 + bi * (bw + gap);
        cctx.fillRect(x0, 250 - b * 110, bw, b * 110);
      });
      const confScreenTex = new THREE.CanvasTexture(confCvs);
      confScreenTex.colorSpace = THREE.SRGBColorSpace;
      const conf = buildConferenceRoom(0xE4BC63, confScreenTex);
      conf.group.position.set(wx, 0, wz);
      scene.add(conf.group);
      conf.obstacles.forEach((o) => obstacles.push({ x: wx + o.x, z: wz + o.z, r: o.r }));

      // Real chairs under every meeting seat — agents used to sit on thin
      // air at the nook (the classic "floating character" anomaly). Each
      // chair sits exactly on the walk-target the scheduler sends sitters
      // to, backrest away from the table; the render loop also turns
      // arriving sitters toward the table (see the "meet" facing below).
      scene.userData.meetCenter = { x: wx, z: wz };
      const meetChairs = seatPositions.map((p) => {
        const [sx, sz] = toWorld(p.x, p.y);
        const chair = buildGuestChair(0xE4BC63);
        chair.position.set(sx, 0, sz);
        chair.rotation.y = Math.atan2(wx - sx, wz - sz) + Math.PI;
        scene.add(chair);
        return chair;
      });
      // ── דבורה's environment watchdog ─────────────────────────────────
      // Self-healing integrity check: if the meeting table or any chair
      // ever drops out of the scene (a bad future edit, a broken asset
      // pass), it is re-attached on the spot and the office manager
      // reports the fix — no user intervention needed.
      scene.userData.integrityCheck = () => {
        let fixed = 0;
        if (mt.parent !== scene) { scene.add(mt); fixed++; }
        meetChairs.forEach((ch) => { if (ch.parent !== scene) { scene.add(ch); fixed++; } });
        return fixed;
      };
    }
    // A few fixed pieces the player would otherwise walk straight through.
    [[-14.3, 12.8, 1.0], [-5.3, 12.3, 0.9], [18.4, 5.6, 1.6], [13.5, -14.3, 0.9], [15.9, -14.3, 0.8]]
      .forEach(([ox, oz, r]) => obstacles.push({ x: ox, z: oz, r }));

    // The owner's private executive suite in the SE corner — anchored to the
    // room walls so it stays a corner office at any floor size. The first
    // guest chair is placed exactly on the 2D summon meeting spot, so a
    // summoned agent's walk target IS the chair.
    const OFFICE_ORIGIN = { x: FLOOR_W / 2 - 6.5, z: FLOOR_D / 2 - 4.0 };
    const guestLocal = (() => {
      if (!meetingSpot) return null;
      const [gx, gz] = toWorld(meetingSpot.x, meetingSpot.y);
      return [{ x: gx - OFFICE_ORIGIN.x, z: gz - OFFICE_ORIGIN.z }, { x: gx - OFFICE_ORIGIN.x + 1.7, z: gz - OFFICE_ORIGIN.z }];
    })();
    const ownerOffice = buildOwnerOffice(0xE4BC63, deskTemplate, laptopTemplate, furnitureTemplate, guestLocal);
    ownerOffice.group.position.set(OFFICE_ORIGIN.x, 0, OFFICE_ORIGIN.z);
    scene.add(ownerOffice.group);
    ownerOffice.obstacles.forEach((o) => obstacles.push({ x: OFFICE_ORIGIN.x + o.x, z: OFFICE_ORIGIN.z + o.z, r: o.r }));
    if (ownerOffice.deskMon) deskMons.push(ownerOffice.deskMon);
    if (ownerOffice.deskHolo) deskHolos.push(ownerOffice.deskHolo);
    const ownerSpinners = ownerOffice.spinners || [];
    const ownerBlinkMats = ownerOffice.blinkMats || [];
    // The owner's chair in world coordinates — where the player can sit down.
    const OWNER_SEAT = {
      x: OFFICE_ORIGIN.x + ownerOffice.seatLocal.x,
      z: OFFICE_ORIGIN.z + ownerOffice.seatLocal.z,
      ry: ownerOffice.seatLocal.ry,
    };

    // Security wall screen inside the owner suite — LIVE VIDEO, not a
    // picture (owner request): a real render-to-texture feed of the office
    // itself, from a CCTV camera that cycles between four vantage points
    // (reception, bullpen, cafeteria, the suite) every few seconds. Agents
    // walking by genuinely appear on the monitor. A slim overlay bar shows
    // the active camera name, running clock and blinking REC.
    const secRT = new THREE.WebGLRenderTarget(512, 288);
    const secCam = new THREE.PerspectiveCamera(64, 512 / 288, 0.1, 60);
    const SEC_VIEWS = [
      { name: "כניסה וקבלה", pos: [-2.5, 3.2, 15.6], look: [-6.9, 0.8, 13.5] },
      { name: "קומת הסוכנים", pos: [0, 4.2, 6.0], look: [0, 0.6, -8] },
      { name: "קפיטריה", pos: [17.8, 3.0, 1.0], look: [11.5, 0.7, 4.5] },
      { name: "המשרד שלך", pos: [8.6, 3.0, 15.6], look: [13.5, 0.7, 10.3] },
    ];
    let secViewIdx = 0;
    const applySecView = () => {
      const v = SEC_VIEWS[secViewIdx];
      secCam.position.set(...v.pos);
      secCam.lookAt(...v.look);
    };
    applySecView();
    const secBarCvs = document.createElement("canvas");
    secBarCvs.width = 512; secBarCvs.height = 44;
    const secBarCtx = secBarCvs.getContext("2d");
    const secBarTex = new THREE.CanvasTexture(secBarCvs);
    secBarTex.colorSpace = THREE.SRGBColorSpace;
    let secBlink = false;
    const drawSecurityBar = () => {
      const c = secBarCtx;
      c.fillStyle = "rgba(3,5,10,.92)"; c.fillRect(0, 0, 512, 44);
      c.fillStyle = "#3FD79A"; c.font = "700 20px system-ui"; c.textAlign = "right";
      c.fillText("🎥 " + SEC_VIEWS[secViewIdx].name, 498, 29);
      c.fillStyle = "#8ea0c4"; c.font = "16px ui-monospace,monospace"; c.textAlign = "left";
      c.fillText(new Date().toLocaleTimeString("he-IL"), 46, 29);
      if (secBlink) { c.fillStyle = "#ff5f6d"; c.beginPath(); c.arc(22, 22, 7, 0, 7); c.fill(); }
      secBlink = !secBlink;
    };
    drawSecurityBar();
    let secScreen;
    {
      const bezel = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 2.25), new THREE.MeshBasicMaterial({ color: 0x03040a }));
      bezel.rotation.y = -Math.PI / 2;
      bezel.position.set(FLOOR_W / 2 - 0.1, 2.1, 12.6);
      scene.add(bezel);
      secScreen = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 2.06), new THREE.MeshBasicMaterial({ map: secRT.texture }));
      secScreen.rotation.y = -Math.PI / 2;
      secScreen.position.set(FLOOR_W / 2 - 0.12, 2.1, 12.6);
      scene.add(secScreen);
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 0.27), new THREE.MeshBasicMaterial({ map: secBarTex, transparent: true }));
      bar.rotation.y = -Math.PI / 2;
      bar.position.set(FLOOR_W / 2 - 0.13, 2.995, 12.6);
      scene.add(bar);
    }

    // The 100-inch wall screen — the old CSS3D iframe is gone: heavyguard.com
    // refuses to be embedded (X-Frame-Options), which left a black hole, and
    // the DOM layer itself flickered against the WebGL canvas on Macs. The
    // screen is now a plain WebGL surface drawing a site-style board from
    // the LIVE business numbers, refreshed with the other TVs; the neon
    // label still points visitors at the real URL.
    let drawSiteScreen = () => {};
    {
      const bez = new THREE.Mesh(new THREE.PlaneGeometry(2.45, 1.5), new THREE.MeshBasicMaterial({ color: 0x03040a }));
      bez.rotation.y = Math.PI;
      bez.position.set(13.6, 2.15, FLOOR_D / 2 - 0.08);
      scene.add(bez);
      const label = buildNeonSign("HEAVYGUARD.COM · LIVE", 0xE4BC63, 2.2, 0.4);
      label.rotation.y = Math.PI;
      label.position.set(13.6, 3.15, FLOOR_D / 2 - 0.1);
      scene.add(label);
      const siteCvs = document.createElement("canvas");
      siteCvs.width = 1104; siteCvs.height = 620;
      const sc = siteCvs.getContext("2d");
      const siteTex = new THREE.CanvasTexture(siteCvs);
      siteTex.colorSpace = THREE.SRGBColorSpace;
      siteTex.anisotropy = 8;
      drawSiteScreen = () => {
        const b = liveRef.current.bizData || {};
        const W = 1104, H = 620;
        sc.fillStyle = "#0a0e16"; sc.fillRect(0, 0, W, H);
        sc.fillStyle = "#0f1420"; sc.fillRect(0, 0, W, 64);
        sc.fillStyle = "#E4BC63"; sc.font = "900 30px system-ui"; sc.textAlign = "right";
        sc.fillText("HEAVY GUARD", W - 28, 43);
        sc.fillStyle = "#8ea0c4"; sc.font = "500 20px system-ui"; sc.textAlign = "left";
        sc.fillText("heavyguard.com", 28, 40);
        sc.strokeStyle = "rgba(228,188,99,.35)"; sc.lineWidth = 2;
        sc.beginPath(); sc.moveTo(0, 64); sc.lineTo(W, 64); sc.stroke();
        if (bbLogoImg && bbLogoImg.complete && bbLogoImg.naturalWidth) {
          const lw = 180;
          sc.drawImage(bbLogoImg, W - 120 - lw, 100, lw, lw * 1.16);
        }
        sc.fillStyle = "#f2f4f8"; sc.font = "900 50px system-ui"; sc.textAlign = "right";
        sc.fillText("מיגון כלי צמ\"ה מתקדם", W - 340, 185);
        sc.fillStyle = "#aeb8ca"; sc.font = "500 26px system-ui";
        sc.fillText("מצלמות · איתור · שמשות ממוגנות · התקנה בשטח", W - 340, 232);
        sc.fillStyle = "#E4BC63"; sc.fillRect(W - 690, 262, 350, 54);
        sc.fillStyle = "#0a0e16"; sc.font = "800 26px system-ui"; sc.textAlign = "center";
        sc.fillText("heavyguard.com ↗", W - 515, 297);
        const stats = [["לקוחות", b.custCount ?? "—"], ["התקנות", b.installs ?? "—"], ["עסקאות פתוחות", b.openDeals ?? "—"]];
        stats.forEach(([lbl, val], i) => {
          const x = W - 74 - i * 330;
          sc.fillStyle = "#11182a"; sc.fillRect(x - 290, 350, 290, 150);
          sc.strokeStyle = "rgba(228,188,99,.3)"; sc.lineWidth = 2; sc.strokeRect(x - 290, 350, 290, 150);
          sc.fillStyle = "#E4BC63"; sc.font = "900 52px system-ui"; sc.textAlign = "center";
          sc.fillText(String(val), x - 145, 428);
          sc.fillStyle = "#8ea0c4"; sc.font = "600 22px system-ui";
          sc.fillText(lbl, x - 145, 472);
        });
        sc.fillStyle = "#3FD79A"; sc.font = "700 20px system-ui"; sc.textAlign = "right";
        sc.fillText("● LIVE — נתוני העסק בזמן אמת · " + new Date().toLocaleTimeString("he-IL"), W - 28, H - 24);
        siteTex.needsUpdate = true;
      };
      drawSiteScreen();
      const siteScreen = new THREE.Mesh(new THREE.PlaneGeometry(2.21, 1.25), new THREE.MeshBasicMaterial({ map: siteTex, toneMapped: false }));
      siteScreen.rotation.y = Math.PI;
      siteScreen.position.set(13.6, 2.15, FLOOR_D / 2 - 0.1);
      scene.add(siteScreen);
    }

    // ── The brand around the room ─────────────────────────────────────────
    // The real Heavy Guard mark in the places a real HQ would carry it:
    // a big backlit wall logo on the south wall beside the browser screen,
    // and a floor decal in the lobby in front of the car podium.
    {
      const wallLogo = buildLogoPlane(1.9);
      if (wallLogo) {
        wallLogo.rotation.y = Math.PI;
        wallLogo.position.set(8.6, 2.05, FLOOR_D / 2 - 0.1);
        scene.add(wallLogo);
        const wallGlow = new THREE.PointLight(0xE4BC63, 0.35, 6);
        wallGlow.position.set(8.6, 2.2, FLOOR_D / 2 - 1.2);
        scene.add(wallGlow);
      }
      const floorLogo = buildLogoPlane(2.6);
      if (floorLogo) {
        floorLogo.rotation.x = -Math.PI / 2;
        floorLogo.material.opacity = 0.92;
        floorLogo.material.polygonOffset = true;
        floorLogo.material.polygonOffsetFactor = -2;
        floorLogo.material.polygonOffsetUnits = -2;
        floorLogo.position.set(-2.5, 0.02, 4.4);
        scene.add(floorLogo);
      }
    }

    // The owner's real Tiggo 7, center stage — a display podium in the
    // middle of the open floor with the actual car model slowly turning.
    const centerSpin = [];
    let scanRing = null;
    {
      const podium = new THREE.Mesh(
        new THREE.CylinderGeometry(2.7, 2.9, 0.14, 40),
        new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.35, metalness: 0.5 })
      );
      podium.position.set(-2.5, 0.07, -1.0);
      podium.receiveShadow = true;
      scene.add(podium);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.035, 8, 60), new THREE.MeshBasicMaterial({ color: 0xE4BC63 }));
      ring.rotation.x = Math.PI / 2;
      ring.position.set(-2.5, 0.15, -1.0);
      scene.add(ring);
      const spot = new THREE.PointLight(0xfff2d8, 0.7, 9);
      spot.position.set(-2.5, 3.4, -1.0);
      scene.add(spot);
      obstacles.push({ x: -2.5, z: -1.0, r: 3.0 });
      // Diagnostic "LIDAR" sweep — a glowing ring that rises over the car
      // every ~18s, like a showroom scanner. One additive torus; the full
      // post-process scan-line pass the spec asks for would cost more per
      // frame than the entire car.
      scanRing = new THREE.Mesh(
        new THREE.TorusGeometry(2.45, 0.022, 8, 64),
        new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
      );
      scanRing.rotation.x = Math.PI / 2;
      scanRing.position.set(-2.5, 0.1, -1.0);
      scanRing.visible = false;
      scene.add(scanRing);
      const carLoader = new GLTFLoader();
      carLoader.setMeshoptDecoder(MeshoptDecoder);
      carLoader.load(base + "office-models/tiggo7.glb", (g) => {
        const car = g.scene;
        const cb = new THREE.Box3().setFromObject(car);
        const cs = cb.getSize(new THREE.Vector3());
        const cc = cb.getCenter(new THREE.Vector3());
        const s = 4.2 / Math.max(cs.x, cs.z);
        const wrap = new THREE.Group();
        car.position.set(-cc.x, -cb.min.y, -cc.z);
        wrap.add(car);
        wrap.scale.setScalar(s);
        wrap.position.set(-2.5, 0.14, -1.0);
        scene.add(wrap);
        // Showroom automotive paint: body panels get a physical clearcoat
        // (the lacquer-over-paint double reflection of real car paint) and
        // the tinted glass becomes actual thin glass. Materials are shared
        // palettes after optimization, so upgrades are mapped per-material.
        const upgraded = new Map();
        wrap.traverse((o) => {
          if (!o.isMesh) return;
          o.castShadow = true; o.matrixAutoUpdate = true;
          const m = o.material;
          if (!m || !m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) return;
          if (!upgraded.has(m)) {
            const phys = new THREE.MeshPhysicalMaterial({
              color: m.color ? m.color.clone() : new THREE.Color(0xffffff),
              map: m.map || null,
              normalMap: m.normalMap || null,
              emissive: m.emissive ? m.emissive.clone() : new THREE.Color(0),
              emissiveMap: m.emissiveMap || null,
              emissiveIntensity: m.emissiveIntensity ?? 1,
              side: m.side,
              transparent: m.transparent,
              opacity: m.opacity,
            });
            if (m.transparent && m.opacity < 0.9) {
              // window glass — smooth, reflective, barely-there
              phys.metalness = 0; phys.roughness = 0.05;
              phys.opacity = Math.min(m.opacity, 0.35);
              phys.envMapIntensity = 1.4;
            } else {
              phys.metalness = Math.max(m.metalness ?? 0, 0.55);
              phys.roughness = Math.min(m.roughness ?? 1, 0.34);
              phys.clearcoat = 1;
              phys.clearcoatRoughness = 0.08;
              phys.envMapIntensity = 1.1;
            }
            upgraded.set(m, phys);
          }
          o.material = upgraded.get(m);
        });
        centerSpin.push(wrap);
        // Holographic data anchor — a glowing callout line from the hood up
        // to a floating telemetry tag showing the REAL odometer reading from
        // Heavy Guard's shared vehicle record (hg2:odometer), refreshed with
        // the other live screens.
        const holoCvs = document.createElement("canvas");
        holoCvs.width = 512; holoCvs.height = 160;
        const hx = holoCvs.getContext("2d");
        const holoTex = new THREE.CanvasTexture(holoCvs);
        holoTex.colorSpace = THREE.SRGBColorSpace;
        const drawCarHolo = () => {
          let odo = null;
          try { odo = JSON.parse(localStorage.getItem("hg2:odometer") || "null"); } catch {}
          hx.clearRect(0, 0, 512, 160);
          hx.fillStyle = "rgba(6,14,24,.78)"; hx.fillRect(0, 0, 512, 160);
          hx.strokeStyle = "rgba(46,230,255,.8)"; hx.lineWidth = 3; hx.strokeRect(2, 2, 508, 156);
          hx.fillStyle = "#2ee6ff"; hx.font = "800 40px system-ui"; hx.textAlign = "right";
          hx.fillText("TIGGO 7 PHEV", 492, 52);
          hx.fillStyle = "#d7f6ff"; hx.font = "600 30px system-ui";
          hx.fillText(odo && odo.km ? `ק"מ כולל: ${Number(odo.km).toLocaleString("he-IL")}` : "טלמטריה · Heavy Guard", 492, 100);
          hx.fillStyle = "#8fd8e8"; hx.font = "500 24px system-ui";
          hx.fillText((odo && odo.date ? odo.date + " · " : "") + "LIVE", 492, 142);
          holoTex.needsUpdate = true;
        };
        drawCarHolo();
        const holo = new THREE.Sprite(new THREE.SpriteMaterial({ map: holoTex, transparent: true, opacity: 0.92, depthWrite: false }));
        holo.scale.set(1.9, 0.6, 1);
        holo.position.set(-1.15, 2.75, -1.0);
        scene.add(holo);
        const anchorLine = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-2.1, 1.1, -1.0), new THREE.Vector3(-1.15, 2.45, -1.0)]),
          new THREE.LineBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.65 })
        );
        scene.add(anchorLine);
        scene.userData.drawCarHolo = drawCarHolo;
      }, undefined, () => { /* car download failed — podium stays as decor */ });
    }

    // ── The two office dogs 🐾 — ניקי וטיארה ────────────────────────────
    // The full pack was removed by request; these two stay, by name: ניקי
    // the pomeranian (tinted sable like the owner's real dog) and טיארה the
    // chihuahua (rigged, her baked idle clip keeps her alive). They wander
    // the open centre floor, pause to sniff, and waddle while walking.
    const dogs = [];
    {
      const spawnDog = (template, clips, cfg) => {
        const skinned = !!(clips && clips.length);
        const body = skinned ? cloneSkinned(template) : template.clone(true);
        const db = new THREE.Box3().setFromObject(body);
        const ds = db.getSize(new THREE.Vector3());
        const dc = db.getCenter(new THREE.Vector3());
        const scale = cfg.height / (ds.y || 1);
        const wrap = new THREE.Group();
        body.position.set(-dc.x * scale, -db.min.y * scale, -dc.z * scale);
        body.scale.setScalar(scale);
        body.traverse((o) => {
          if (!o.isMesh && !o.isSkinnedMesh) return;
          o.castShadow = true; o.frustumCulled = false;
          if (cfg.tint && o.material) { o.material = o.material.clone(); o.material.color = new THREE.Color(cfg.tint); }
        });
        wrap.add(body);
        const tag = buildNameSprite(cfg.name, "#E4BC63", "");
        tag.scale.multiplyScalar(0.62);
        tag.position.y = cfg.height + 0.28;
        wrap.add(tag);
        wrap.position.set(cfg.x, 0, cfg.z);
        scene.add(wrap);
        let mixer = null;
        if (skinned) {
          mixer = new THREE.AnimationMixer(body);
          mixer.clipAction(clips[0]).play();
        }
        dogs.push({ group: wrap, mixer, target: null, pauseT: 1 + dogs.length * 1.5, speed: 1.0 + dogs.length * 0.2 });
      };
      const dogLoader = new GLTFLoader();
      dogLoader.setMeshoptDecoder(MeshoptDecoder);
      dogLoader.load(base + "office-models/pomeranian.glb", (g) => {
        spawnDog(g.scene, null, { name: "ניקי", height: 0.5, tint: 0xc9803e, x: -6.5, z: 3.5 });
      }, undefined, () => {});
      dogLoader.load(base + "office-models/chihuahua.glb", (g) => {
        spawnDog(g.scene, g.animations, { name: "טיארה", height: 0.36, x: 1.5, z: 4.5 });
      }, undefined, () => {});
    }
    // A wandering dog's next stop — somewhere on the open centre floor,
    // clear of the car podium and the perimeter offices.
    const dogSpot = () => ({ x: -10 + Math.random() * 15, z: -7 + Math.random() * 12 });

    // ── Reception at the entrance ────────────────────────────────────────
    // A welcome desk with a receptionist just inside the south entrance, so
    // walking in reads like arriving at a real company lobby.
    {
      const wCvs = document.createElement("canvas"); wCvs.width = 300; wCvs.height = 170;
      const wx2 = wCvs.getContext("2d");
      const wg = wx2.createLinearGradient(0, 0, 0, 170); wg.addColorStop(0, "#12203a"); wg.addColorStop(1, "#0a1120");
      wx2.fillStyle = wg; wx2.fillRect(0, 0, 300, 170);
      wx2.fillStyle = "#E4BC63"; wx2.font = "700 26px system-ui"; wx2.textAlign = "center";
      wx2.fillText("ברוכים הבאים", 150, 60);
      wx2.fillStyle = "#9fd6ff"; wx2.font = "600 18px system-ui"; wx2.fillText("בניין אלפא · קומת הסוכנים", 150, 98);
      wx2.fillStyle = "#7fe6b0"; wx2.font = "600 16px system-ui"; wx2.fillText("● הצוות זמין", 150, 132);
      const welcomeTex = new THREE.CanvasTexture(wCvs); welcomeTex.colorSpace = THREE.SRGBColorSpace;
      const reception = buildReception(0xE4BC63, welcomeTex);
      const RCP = { x: -6.9, z: 14.4 };
      // Flipped 180° (owner request): the welcome screen + front face the
      // room/entrance walkway on the north side, מיכל sits on the south side.
      reception.group.position.set(RCP.x, 0, RCP.z);
      reception.group.rotation.y = Math.PI;
      scene.add(reception.group);
      reception.obstacles.forEach((o) => obstacles.push({ x: RCP.x - o.x, z: RCP.z - o.z, r: o.r }));
      // Receptionist — a seated greeter behind the counter (not one of the
      // 12 agents). Restyled to actually look like her own person: petite,
      // rose outfit, dark hair (cap + low ponytail attached to the head bone
      // so it follows the sit pose).
      const recep = buildHuman(0xD96A9E, "מיכל", false, charTemplate, charClips, CHAR_SCALE * 0.94, CHAR_CENTER_OFFSET, true, "קבלה");
      recep.group.traverse((o) => {
        if ((o.isMesh || o.isSkinnedMesh) && o.material && o.material.color) {
          o.material.color = new THREE.Color(0xffffff).lerp(new THREE.Color(0xD96A9E), 0.45);
        }
      });
      {
        let head = null;
        recep.group.traverse((o) => { if (!head && o.isBone && /head/i.test(o.name)) head = o; });
        if (head) {
          // Bone space in this FBX-converted rig is NOT world scale — attach
          // via the bone's actual world scale so the hair comes out head-
          // sized (a raw attach rendered as a building-sized brown blob).
          recep.group.updateMatrixWorld(true);
          const ws = new THREE.Vector3();
          head.getWorldScale(ws);
          const inv = 1 / (ws.x || 1);
          const hairMat = new THREE.MeshStandardMaterial({ color: 0x33200f, roughness: 0.55 });
          const hair = new THREE.Group();
          // Sizes below are WORLD units (head radius ≈ 0.08 at this model's
          // scale); the inverse-scale on the group maps them into bone space.
          const cap = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat);
          cap.scale.set(1.02, 1.15, 1.1);
          hair.add(cap);
          const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.15, 4, 8), hairMat);
          tail.position.set(0, -0.075, -0.08);
          tail.rotation.x = 0.45;
          hair.add(tail);
          hair.scale.setScalar(inv);
          hair.position.set(0, 0.035 * inv, 0.008 * inv);
          head.add(hair);
        }
      }
      recep.group.position.set(RCP.x - reception.seatLocal.x, 0, RCP.z - reception.seatLocal.z);
      recep.group.rotation.y = Math.PI; // face the flipped counter front (north)
      setClip(recep, CLIP.sit);
      scene.add(recep.group);
      allExtraHumans.push(recep);
    }

    // (Restroom stalls removed — owner request; the SW corner stays open.)

    // ── Cafeteria / coffee counter (beside the dining tables) ────────────
    {
      const caf = buildCafeteria(0xffb454);
      const CAF = { x: 15.3, z: 5.6 };
      caf.group.position.set(CAF.x, 0, CAF.z);
      scene.add(caf.group);
      caf.obstacles.forEach((o) => obstacles.push({ x: CAF.x + o.x, z: CAF.z + o.z, r: o.r }));
    }

    // ── Wall decor from the user's LP Officeroom pack ────────────────────
    // Real modeled pieces (wall clock, framed art, a record player for the
    // cafeteria counter) hung on the side walls so the shell doesn't read
    // as bare drywall between the neon signs.
    {
      const hang = (name, x, y, z, rotY, s = 1) => {
        const piece = cloneDecorPiece(officeDecorTemplate, name);
        if (!piece) return;
        piece.scale.setScalar(s);
        piece.position.set(x, y, z);
        piece.rotation.y = rotY;
        scene.add(piece);
      };
      // wall clock on the east wall, over the lounge area
      hang("Office2_clock_1", FLOOR_W / 2 - 0.12, 2.6, -2.1, -Math.PI / 2, 1.3);
      // two framed decorations on the west wall near reception
      hang("Office2_decoration1", -(FLOOR_W / 2) + 0.12, 2.6, 10.5, Math.PI / 2, 1.4);
      hang("Office2_decoration2", -(FLOOR_W / 2) + 0.12, 2.6, 8.4, Math.PI / 2, 1.4);
      // big framed picture on the east wall near the owner's office
      hang("Office2_picture", FLOOR_W / 2 - 0.12, 1.9, 8.1, Math.PI, 1.2);
      // record player + vinyls on the cafeteria counter — kept within the
      // counter top's actual span (z 3.8..7.4) so nothing floats off its edge
      hang("Office2_Vinyl_players", 15.35, 1.1, 4.7, -Math.PI / 2, 1.0);
      hang("Office2_Vinyls", 15.35, 1.1, 5.3, -Math.PI / 2, 1.0);
    }

    // ── The owner's real field photos, framed on the walls ──────────────
    // Five photos from actual Heavy Guard installs (uploaded by the owner),
    // hung poster-sized (~1.7 units tall next to the 1.35-tall characters)
    // in dark frames, each at its true aspect ratio, on stretches of wall
    // that were still bare: two on the west wall, two on the east wall
    // around the clerestory band, one on the south wall behind reception.
    {
      const texLoader = new THREE.TextureLoader();
      const photoFrameMat = new THREE.MeshStandardMaterial({ color: 0x0c0e13, roughness: 0.4, metalness: 0.5 });
      const hangPhoto = (file, x, y, z, rotY, h, aspect) => {
        const w = h * aspect;
        const g = new THREE.Group();
        const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.14, h + 0.14, 0.05), photoFrameMat);
        frame.castShadow = true;
        g.add(frame);
        const tex = texLoader.load(base + "wall-art/" + file);
        tex.colorSpace = THREE.SRGBColorSpace;
        const pic = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0 }));
        pic.position.z = 0.031;
        g.add(pic);
        g.position.set(x, y, z);
        g.rotation.y = rotY;
        scene.add(g);
      };
      hangPhoto("art1.jpg", -(FLOOR_W / 2) + 0.1, 2.7, -9.5, Math.PI / 2, 1.7, 0.709);
      hangPhoto("art2.jpg", -(FLOOR_W / 2) + 0.1, 2.7, -1.0, Math.PI / 2, 1.7, 0.558);
      hangPhoto("art3.jpg", (FLOOR_W / 2) - 0.1, 2.3, -13.2, -Math.PI / 2, 1.6, 0.585);
      hangPhoto("art4.jpg", (FLOOR_W / 2) - 0.1, 2.2, 6.3, -Math.PI / 2, 1.6, 0.647);
      hangPhoto("art5.jpg", 1.0, 2.6, (FLOOR_D / 2) - 0.1, Math.PI, 1.7, 0.75);
    }

    // ── Gaming-den ambiance ──────────────────────────────────────────────
    // Neon accent floor strips down the main aisles + two big neon wall signs
    // + a pair of coloured accent lights, so the whole floor reads as a fun
    // gaming HQ rather than a plain bullpen. All emissive/unlit except the two
    // point lights, so it's cheap.
    const neonStripMat1 = new THREE.MeshBasicMaterial({ color: 0x18e0ff, transparent: true, opacity: 0.5, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    const neonStripMat2 = new THREE.MeshBasicMaterial({ color: 0xff3ea5, transparent: true, opacity: 0.5, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    // Aisle strips end BEFORE the south office row (pods start at z≈8) —
    // they used to run under the glass walls into two of the offices.
    [-9.75, -4.1, 1.5].forEach((ax, i) => {
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 18), i % 2 ? neonStripMat2 : neonStripMat1);
      strip.rotation.x = -Math.PI / 2;
      strip.position.set(ax, 0.02, -3.0);
      scene.add(strip);
    });
    const alphaSign = buildNeonSign("ALPHA HQ", 0x18e0ff, 5.2, 1.3);
    alphaSign.rotation.y = Math.PI / 2;
    alphaSign.position.set(-(FLOOR_W / 2) + 0.15, 4.4, -4.5);
    scene.add(alphaSign);
    const ggSign = buildNeonSign("GG · LEVEL UP", 0xff3ea5, 4.6, 1.1);
    ggSign.rotation.y = -Math.PI / 2;
    ggSign.position.set((FLOOR_W / 2) - 0.15, 4.6, 3.75);
    scene.add(ggSign);
    const accentCyan = new THREE.PointLight(0x18e0ff, 0.5, 26);
    accentCyan.position.set(-9, 4.8, 0); scene.add(accentCyan);
    const accentMagenta = new THREE.PointLight(0xff3ea5, 0.5, 26);
    accentMagenta.position.set(9, 4.8, 3); scene.add(accentMagenta);

    // Player — spawns in the open central aisle just south of the bullpen,
    // clear of any wall/desk so movement is free and comfortable from the
    // first step, facing north toward the team (the owner's glass office is
    // right there to the east to walk into).
    const playerH = buildHuman(0xE4BC63, "אתה", true, charTemplate, charClips, CHAR_SCALE, CHAR_CENTER_OFFSET, true, "הבעלים · שחר");
    playerH.group.position.set(3.3, 0, 12.9);
    playerH.group.rotation.y = Math.PI;
    scene.add(playerH.group);

    // NPCs — every agent uses the one animated casual model so they all
    // walk and sit, each tinted toward their own colour and badged with
    // their name + job title.
    const npc = {};
    chars.forEach((c) => {
      const a = byId(c.id);
      if (!a) return;
      const h = buildHuman(a.color, a.name, false, charTemplate, charClips, CHAR_SCALE, CHAR_CENTER_OFFSET, true, a.title);
      const [wx, wz] = toWorld(c.x, c.y);
      h.group.position.set(wx, 0, wz);
      scene.add(h.group);
      npc[c.id] = h;
    });
    const allHumans = [playerH, ...Object.values(npc), ...allExtraHumans];

    // Freeze matrix auto-update on everything whose LOCAL transform never
    // changes after assembly — the walls, desks, offices, plants, city
    // buildings, signage… (hundreds of objects). three.js recomposes every
    // auto-update matrix each frame; the only things that actually move
    // locally are the characters (and their animated bones), the sky-life
    // sprites, and the spinning desk holos, so everything else can be
    // composed once. A child with a frozen local matrix still follows its
    // parent — world matrices are re-derived when a parent moves — so this
    // is safe for nested static content. Worth several ms/frame on mobile.
    {
      const dynamicRoots = new Set([
        ...allHumans.map((h) => h.group),
        planeGroup, birdGroup, heliGroup, balloonGroup, searchGroup,
        ...deskHolos.filter(Boolean),
        ...ownerSpinners,
        ...(scanRing ? [scanRing] : []),
        camera,
      ]);
      const isDynamic = (o) => {
        for (let p = o; p; p = p.parent) if (dynamicRoots.has(p)) return true;
        return false;
      };
      scene.traverse((o) => {
        if (isDynamic(o)) return;
        o.matrixAutoUpdate = false;
        o.updateMatrix();
      });
    }

    let raf = 0;
    let integrityT = 0;
    let frameNo = 0;
    let secSwitchT = 0;
    let scanT = 0;     // diagnostic sweep timer over the showroom car
    let spatialT = 9;  // spatial-bridge refresh timer (starts ripe)
    const clock = new THREE.Clock();
    const curSky = new THREE.Color(0x1b2440);
    const tmpColor = new THREE.Color();

    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      liveRef.current.keys[k] = true;
      // E toggles sitting on your own office chair (only when near it).
      if (k === "e") liveRef.current.toggleSit?.();
    };
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
      // Near-building windows light up after dark — same lit-window feel as
      // the painted skyline behind them, but on real 3D geometry.
      const buildingGlowTarget = isNight ? 0.85 : isEvening ? 0.4 : 0.02;
      nearBuildingMats.forEach((mat) => {
        mat.emissiveIntensity += (buildingGlowTarget - mat.emissiveIntensity) * Math.min(1, dt * 0.8);
      });

      // Wall TVs — redrawn every few seconds, not every frame; BOTH screens
      // show real data now: the markets TV renders the live CoinGecko/Yahoo
      // rows (marketRows prop), the HeavyGuard screen the real business
      // numbers (bizData prop).
      screenT += dt;
      if (screenT >= 3) {
        screenT = 0;
        drawTradeScreen(tradeCtx, tradeCanvas.width, tradeCanvas.height, liveRef.current.marketRows);
        tvTrade.tex.needsUpdate = true;
        drawHgScreen(hgCtx, hgCanvas.width, hgCanvas.height, liveRef.current.bizData);
        tvHg.tex.needsUpdate = true;
        drawSiteScreen(); // wall site-board follows the same live refresh
        if (scene.userData.drawCarHolo) scene.userData.drawCarHolo(); // car telemetry tag too
        // The city billboard flips to its next ad every other screen tick.
        bbTick++;
        if (bbTick % 2 === 0) {
          bbMode = (bbMode + 1) % 3;
          drawBillboard(bbMode);
          bbTex.needsUpdate = true;
        }
        // Security feed: clock + REC blink refresh.
        drawSecurityBar();
        secBarTex.needsUpdate = true;
      }
      // Live CCTV: render the actual office into the security screen's
      // texture every 3rd frame (the screen hides during its own capture to
      // avoid a feedback loop), and cycle the vantage point every ~6s.
      secSwitchT += dt;
      if (secSwitchT >= 6) {
        secSwitchT = 0;
        secViewIdx = (secViewIdx + 1) % SEC_VIEWS.length;
        applySecView();
        drawSecurityBar();
        secBarTex.needsUpdate = true;
      }
      if (!turboOn && frameNo % 3 === 0) {
        secScreen.visible = false;
        renderer.setRenderTarget(secRT);
        renderer.render(scene, secCam);
        renderer.setRenderTarget(null);
        secScreen.visible = true;
      }
      // Center-stage car turns slowly on its podium.
      centerSpin.forEach((w) => { w.rotation.y += dt * 0.28; });
      // Diagnostic sweep: the glowing ring rises over the car for ~2.6s of
      // every 18s cycle, shrinking with the body's taper.
      if (scanRing) {
        scanT += dt;
        if (scanT > 18) scanT = 0;
        const k = scanT / 2.6;
        if (k < 1 && centerSpin.length) {
          scanRing.visible = true;
          scanRing.position.y = 0.12 + k * 1.7;
          scanRing.scale.setScalar(1 - k * 0.38);
          scanRing.material.opacity = 0.85 * Math.sin(Math.PI * k);
        } else if (scanRing.visible) {
          scanRing.visible = false;
        }
      }
      // ניקי + טיארה: wander → pause/sniff → wander, waddling while walking.
      dogs.forEach((d, di) => {
        if (d.mixer) d.mixer.update(dt);
        if (d.pauseT > 0) { d.pauseT -= dt; d.group.rotation.z = 0; return; }
        if (!d.target) d.target = dogSpot();
        const dx = d.target.x - d.group.position.x, dz = d.target.z - d.group.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.15) {
          d.pauseT = 2 + Math.random() * 6;
          d.target = null;
          return;
        }
        const step = Math.min(dist, d.speed * dt);
        d.group.position.x += (dx / dist) * step;
        d.group.position.z += (dz / dist) * step;
        d.group.rotation.y = Math.atan2(dx, dz);
        d.group.rotation.z = Math.sin(clock.elapsedTime * 9 + di * 2) * 0.055; // waddle
      });
      // Command-center life in the owner suite: the hologram globe spins,
      // the server-rack LED columns breathe.
      ownerSpinners.forEach((s) => { s.rotation.y += dt * 0.9; s.rotation.x += dt * 0.22; });
      ownerBlinkMats.forEach((m, i) => { m.opacity = 0.45 + Math.abs(Math.sin(clock.elapsedTime * (1.6 + i * 0.7))) * 0.5; });
      // דבורה's watchdog: periodic environment-integrity sweep (missing
      // meeting furniture is respawned and reported) — cheap parent checks.
      integrityT += dt;
      if (integrityT >= 15) {
        integrityT = 0;
        const fixed = scene.userData.integrityCheck ? scene.userData.integrityCheck() : 0;
        if (fixed > 0) liveRef.current.onAutoFix?.(`🔧 דבורה תיקנה את הסביבה אוטומטית: ${fixed} פריטי ריהוט חסרים שוחזרו בחדר הישיבות והצוות עוגן חזרה למקומו`);
      }

      // Skyline window — swap the whole canvas only when the sky mode
      // actually flips (cheap, rare): full day → golden-hour sunset in the
      // evening phase → starry night with a moon. The street traffic strip
      // redraws every frame (tiny canvas) so the view is never static.
      const desiredSkyMode = liveRef.current.phase <= 1 ? "day" : liveRef.current.phase === 2 ? "sunset" : "night";
      if (desiredSkyMode !== skylineMode) {
        skylineMode = desiredSkyMode;
        drawSkyline(skyline.ctx, skyline.canvas.width, skyline.canvas.height, skylineMode);
        skyline.tex.needsUpdate = true;
        eastWinTex.needsUpdate = true; // same canvas, its own texture instance
        cloudMat.opacity = skylineMode === "day" ? 0.85 : skylineMode === "sunset" ? 0.5 : 0.16;
        birdGroup.visible = skylineMode === "day";
        balloonGroup.visible = !turboOn && skylineMode === "day";
        searchGroup.visible = !turboOn && skylineMode === "night";
        bbMat.color.setScalar(skylineMode === "day" ? 0.8 : 1); // billboard pops after dark
      }
      drawTraffic(trafficCtx, trafficCanvas.width, trafficCanvas.height, trafficState, dt);
      trafficTex.needsUpdate = true;

      // Sky life: clouds drift on a repeating layer; a tiny airliner with a
      // blinking beacon crosses every so often; a small flock of birds bobs
      // across by day. All a handful of sprites — effectively free.
      cloudTex.offset.x = (cloudTex.offset.x + dt * 0.0035) % 1;
      planeGroup.position.x += dt * 3.2;
      if (planeGroup.position.x > 85) planeGroup.position.x = -85 - Math.random() * 160;
      planeBeacon.material.opacity = (Math.sin(clock.elapsedTime * 6) > 0.4) ? 0.95 : 0.08;
      if (birdGroup.visible) {
        birdGroup.position.x += dt * 1.6;
        if (birdGroup.position.x > 80) birdGroup.position.x = -80;
        birdGroup.children.forEach((b, i) => { b.position.y = Math.sin(clock.elapsedTime * 2.2 + i * 1.7) * 0.35; });
      }
      // Helicopter crosses right-to-left, rotor spinning, strobe blinking.
      heliGroup.position.x -= dt * 4.6;
      if (heliGroup.position.x < -85) heliGroup.position.x = 85 + Math.random() * 130;
      heliRotor.rotation.y += dt * 26;
      heliStrobe.material.opacity = (Math.sin(clock.elapsedTime * 9) > 0) ? 0.9 : 0.12;
      // Balloon drifts + bobs by day; searchlights sweep by night.
      if (balloonGroup.visible) {
        balloonGroup.position.x += dt * 0.55;
        if (balloonGroup.position.x > 75) balloonGroup.position.x = -75;
        balloonGroup.position.y = 14 + Math.sin(clock.elapsedTime * 0.35) * 0.6;
      }
      if (searchGroup.visible) {
        beam1.rotation.z = -0.15 + Math.sin(clock.elapsedTime * 0.22) * 0.42;
        beam2.rotation.z = 0.2 + Math.sin(clock.elapsedTime * 0.17 + 2.1) * 0.36;
      }

      let mx = 0, mz = 0;
      // First-person keyboard nav used to feel "backwards": every key press
      // (including S/↓) snapped the character — and with it, the locked-on
      // first-person camera — to face the absolute world direction of that
      // key, so walking "backward" actually spun you 180° to face the new
      // heading instead of just stepping back. In first person, ↑/W and
      // ↓/S now walk forward/backward relative to whichever way you're
      // already looking (no spin), and ←/→ / A/D turn you in place instead
      // of strafing — classic, predictable first-person controls. Third-
      // person and the touch joystick keep the original absolute-direction
      // scheme, which reads fine from an outside chase camera.
      // Turn direction inverted by request; forward/backward flipped back
      // (a second invert request restored ↑/W = forward, ↓/S = backward,
      // both still relative to the direction you're looking).
      const kFwd = (keys["w"] || keys["arrowup"] ? 1 : 0) - (keys["s"] || keys["arrowdown"] ? 1 : 0);
      const kTurn = -((keys["d"] || keys["arrowright"] ? 1 : 0) - (keys["a"] || keys["arrowleft"] ? 1 : 0));
      const fpTankControls = liveRef.current.firstPerson && (kFwd !== 0 || kTurn !== 0);
      if (fpTankControls) {
        if (kTurn) {
          const TURN_SPEED = 2.6;
          playerH.group.rotation.y += kTurn * TURN_SPEED * dt;
        }
        if (kFwd) {
          mx = Math.sin(playerH.group.rotation.y) * kFwd;
          mz = Math.cos(playerH.group.rotation.y) * kFwd;
        }
      } else {
        if (keys["w"] || keys["arrowup"]) mz -= 1;
        if (keys["s"] || keys["arrowdown"]) mz += 1;
        if (keys["a"] || keys["arrowleft"]) mx -= 1;
        if (keys["d"] || keys["arrowright"]) mx += 1;
      }
      mx += jv.x; mz += jv.y;
      const mlen = Math.hypot(mx, mz);
      // Sitting on your own chair: any movement input stands you up; otherwise
      // glide onto the seat (position, drop, and facing — south, toward the
      // guest chairs) and hold the sit animation.
      if (liveRef.current.sitting && (mlen > 0.08 || fpTankControls)) {
        liveRef.current.setSitting?.(false);
      } else if (liveRef.current.sitting) {
        const k = Math.min(1, dt * 6);
        playerH.group.position.x += (OWNER_SEAT.x - playerH.group.position.x) * k;
        playerH.group.position.z += (OWNER_SEAT.z - playerH.group.position.z) * k;
        playerH.group.position.y += (SEAT_DROP - playerH.group.position.y) * k;
        let dSit = OWNER_SEAT.ry - playerH.group.rotation.y;
        while (dSit > Math.PI) dSit -= Math.PI * 2;
        while (dSit < -Math.PI) dSit += Math.PI * 2;
        playerH.group.rotation.y += dSit * k;
        setClip(playerH, CLIP.sit);
      } else if (mlen > 0.08) {
        playerH.group.position.y += (0 - playerH.group.position.y) * Math.min(1, dt * 8);
        mx /= mlen; mz /= mlen;
        const SPEED = 5.0;
        playerH.group.position.x = clamp(playerH.group.position.x + mx * SPEED * dt, -(FLOOR_W / 2 - 1), FLOOR_W / 2 - 1);
        playerH.group.position.z = clamp(playerH.group.position.z + mz * SPEED * dt, -(FLOOR_D / 2 - 1), FLOOR_D / 2 - 1);
        resolveCollisions(playerH.group.position, obstacles);
        if (!fpTankControls) {
          const targetRot = Math.atan2(mx, mz);
          let dRot = targetRot - playerH.group.rotation.y;
          while (dRot > Math.PI) dRot -= Math.PI * 2;
          while (dRot < -Math.PI) dRot += Math.PI * 2;
          playerH.group.rotation.y += dRot * Math.min(1, dt * 10);
        }
        setClip(playerH, CLIP.walk);
      } else {
        playerH.group.position.y += (0 - playerH.group.position.y) * Math.min(1, dt * 8);
        setClip(playerH, fpTankControls && kTurn ? CLIP.walk : CLIP.idle);
      }
      // "You can sit here" prompt — near your own chair (or already seated).
      const nearSeat = Math.hypot(playerH.group.position.x - OWNER_SEAT.x, playerH.group.position.z - OWNER_SEAT.z) < 3.2;
      liveRef.current.canSit = nearSeat;
      if (liveRef.current.canSitShown !== nearSeat) {
        liveRef.current.canSitShown = nearSeat;
        liveRef.current.setCanSit?.(nearSeat);
      }

      // NPCs: walk a simple two-point "aisle" route to their live target
      // (down their column to the destination's row, then across) instead
      // of cutting a diagonal beeline through every desk in between — reads
      // as deliberate human wayfinding rather than gliding through furniture.
      const liveChars = liveRef.current.chars || [];
      liveChars.forEach((c) => {
        const h = npc[c.id]; if (!h) return;
        const atDesk = c.status === "work";
        // Per-desk facing (perimeter layout) — the direction this worker's
        // own station points; falls back to the old shared heading.
        const drot = c.home && typeof c.home.rot === "number" ? c.home.rot : DESK_FACE_ROT;
        // The sit_idle clip's hip height/depth doesn't line up with this
        // specific chair model at the desk's exact floor spot — nudge the
        // walk target itself back and down onto the visible chair seat
        // (tuned by eye), so there's no separate snap once they arrive.
        const [rawTx, rawTz] = toWorld(c.x, c.y);
        const finalX = atDesk ? rawTx + Math.sin(drot) * SEAT_BACK : rawTx;
        const finalZ = atDesk ? rawTz + Math.cos(drot) * SEAT_BACK : rawTz;
        if (h.destX === undefined || Math.abs(h.destX - finalX) > 0.05 || Math.abs(h.destZ - finalZ) > 0.05) {
          h.destX = finalX; h.destZ = finalZ;
          h.wpX = h.group.position.x; h.wpZ = finalZ;
          h.wpDone = false;
        }
        // Waypoint arrival must be sticky: the first step toward the final
        // target can be longer than the 0.1 arrival radius (dt is clamped at
        // 0.05s, so below 20fps a step is up to 0.125), and without the flag
        // the walker bounces back to the waypoint forever, jammed mid-route.
        const atWp = h.wpDone || Math.hypot(h.wpX - h.group.position.x, h.wpZ - h.group.position.z) < 0.1;
        h.wpDone = atWp;
        const tx = atWp ? finalX : h.wpX, tz = atWp ? finalZ : h.wpZ;
        const dx = tx - h.group.position.x, dz = tz - h.group.position.z;
        const dist = Math.hypot(dx, dz);
        const distFinal = Math.hypot(finalX - h.group.position.x, finalZ - h.group.position.z);
        // Pivot-then-walk: rotation is smoothly damped toward the travel
        // direction, and the agent only advances once roughly facing it
        // (<~55°) — a route now starts with a clean turn in place instead
        // of a sideways moonwalk toward the target.
        let stepped = 0;
        if (dist > 0.01 && distFinal > 0.03) {
          const targetRot = Math.atan2(dx, dz);
          let dRot = targetRot - h.group.rotation.y;
          while (dRot > Math.PI) dRot -= Math.PI * 2;
          while (dRot < -Math.PI) dRot += Math.PI * 2;
          h.group.rotation.y += dRot * Math.min(1, dt * 8);
          if (Math.abs(dRot) < 0.95) {
            // A real walking pace (units/sec), not a percent-of-remaining-
            // distance lerp — the old lerp closed most of the gap in the
            // first frame or two for any far-off desk, reading as
            // teleporting rather than walking across the room.
            const NPC_SPEED = 2.5;
            const maxStep = NPC_SPEED * dt;
            if (dist <= maxStep) {
              h.group.position.x = tx; h.group.position.z = tz;
              stepped = dist;
            } else {
              h.group.position.x += (dx / dist) * maxStep;
              h.group.position.z += (dz / dist) * maxStep;
              stepped = maxStep;
            }
          }
        }
        const summoned = c.status === "summoned";
        const targetY = (atDesk || summoned) && distFinal <= 0.03 ? SEAT_DROP : 0;
        h.group.position.y += (targetY - h.group.position.y) * Math.min(1, dt * 6);
        h.isWalking = distFinal > 0.03;
        // Perfect-seat settle: once anchored, glide the last residual onto
        // the exact seat anchor so every sitter lines up with their chair
        // and keyboard instead of hovering a few centimetres off.
        if (!h.isWalking) {
          h.group.position.x += (finalX - h.group.position.x) * Math.min(1, dt * 5);
          h.group.position.z += (finalZ - h.group.position.z) * Math.min(1, dt * 5);
        }
        if (distFinal > 0.03) {
          setClip(h, CLIP.walk);
          // Foot-slide fix: the walk clip plays at the speed the body is
          // actually covering ground — a pivoting or arriving agent steps
          // slowly, a mid-route one at full pace.
          const act = h.current && h.actions[h.current];
          if (act) act.timeScale = Math.max(0.35, Math.min(1.25, (stepped / Math.max(dt, 1e-4)) / 2.5));
        } else {
          // A summoned agent has walked into your office and reached the
          // guest chair — they sit down on it, facing the owner's desk
          // (north), so a scheduled meeting reads as two people actually
          // sitting across the desk from each other.
          const seated = c.status === "work" || c.status === "meet" || c.status === "eat" || summoned;
          setClip(h, seated ? CLIP.sit : CLIP.idle);
          const act = h.current && h.actions[h.current];
          // Deep-work loop: desk workers breathe at their own slow cadence —
          // the sit clip's speed waves gently per agent (the model ships one
          // sitting clip; typing variety is expressed through cadence + the
          // monitor glow that already pulses on working desks).
          if (act) act.timeScale = atDesk ? 1 + 0.14 * Math.sin(clock.elapsedTime * 0.55 + h.group.position.x * 2.7) : 1;
          // Working at the desk: face the monitor head-on instead of
          // whatever direction they happened to walk in from — every desk
          // in the grid shares the same unrotated layout, so one fixed
          // heading squares everyone up to their own screen.
          const meetC = c.status === "meet" ? scene.userData.meetCenter : null;
          if (atDesk || summoned || meetC) {
            // Anchored sitters face the right way: their monitor at a desk,
            // the owner's desk when summoned, the table in a meeting.
            const face = summoned ? Math.PI
              : atDesk ? drot
              : Math.atan2(meetC.x - h.group.position.x, meetC.z - h.group.position.z);
            let dRot = face - h.group.rotation.y;
            while (dRot > Math.PI) dRot -= Math.PI * 2;
            while (dRot < -Math.PI) dRot += Math.PI * 2;
            h.group.rotation.y += dRot * Math.min(1, dt * 6);
          } else {
            // Unanchored bystanders notice the owner: within ~3m they turn
            // smoothly to face him as he passes — a rig-safe whole-body
            // "look at" (bone-level head tracking on this rig risked broken
            // necks, so attention is expressed with the body).
            const pdx = playerH.group.position.x - h.group.position.x;
            const pdz = playerH.group.position.z - h.group.position.z;
            if (Math.hypot(pdx, pdz) < 3.2) {
              const face = Math.atan2(pdx, pdz);
              let dRot = face - h.group.rotation.y;
              while (dRot > Math.PI) dRot -= Math.PI * 2;
              while (dRot < -Math.PI) dRot += Math.PI * 2;
              h.group.rotation.y += dRot * Math.min(1, dt * 4);
            }
          }
        }
      });
      // Walking agents give each other shoulder room: a light pairwise
      // push-out so two people crossing the same aisle sidestep each other
      // instead of clipping through. Seated/anchored agents stay planted —
      // only active walkers take part, so the pass stays tiny.
      {
        const walkers = liveChars.map((c) => npc[c.id]).filter((h) => h && h.isWalking);
        for (let i = 0; i < walkers.length; i++) {
          for (let j = i + 1; j < walkers.length; j++) {
            const A = walkers[i].group.position, B = walkers[j].group.position;
            const sdx = B.x - A.x, sdz = B.z - A.z;
            const sd = Math.hypot(sdx, sdz);
            if (sd > 1e-4 && sd < 0.55) {
              const push = ((0.55 - sd) * 0.5) / sd;
              A.x -= sdx * push; A.z -= sdz * push;
              B.x += sdx * push; B.z += sdz * push;
            }
          }
        }
      }
      // Animation LOD: characters far from the camera tick their skinned
      // animation every 3rd frame (with accumulated dt so playback speed
      // stays correct) instead of every frame — with ~15 characters the
      // mixers are one of the biggest CPU costs, and at distance the lower
      // sample rate is invisible.
      frameNo++;
      // Turbo tightens the LOD: "far" starts at ~11 units instead of ~18,
      // and far characters tick every 4th frame instead of every 3rd.
      const lodFar = turboOn ? 120 : 340;
      const lodEvery = turboOn ? 4 : 3;
      allHumans.forEach((h, hi) => {
        if (!h.mixer) return;
        const far = camera.position.distanceToSquared(h.group.position) > lodFar;
        if (far) {
          h.lodDt = (h.lodDt || 0) + dt;
          if ((frameNo + hi) % lodEvery !== 0) return;
          h.mixer.update(h.lodDt);
          h.lodDt = 0;
        } else {
          if (h.lodDt) { h.mixer.update(h.lodDt); h.lodDt = 0; }
          h.mixer.update(dt);
        }
      });
      // Spatial bridge for the AI brains: a compact live map of where every
      // agent, the player, the dogs and the key landmarks are, refreshed
      // every ~2s. OfficeSim attaches it to the voice/chat prompt so an
      // agent literally knows who's standing where when it answers.
      spatialT += dt;
      if (spatialT >= 2 && typeof window !== "undefined") {
        spatialT = 0;
        const agentsMap = {};
        liveChars.forEach((c) => {
          const h = npc[c.id]; if (!h) return;
          agentsMap[c.id] = [Math.round(h.group.position.x * 10) / 10, Math.round(h.group.position.z * 10) / 10, c.status];
        });
        window.__off3spatial = {
          יחידות: "מטרים, [x,z]",
          הבעלים: [Math.round(playerH.group.position.x * 10) / 10, Math.round(playerH.group.position.z * 10) / 10],
          סוכנים: agentsMap,
          כלבים: dogs.map((d, i) => [i === 0 ? "ניקי" : "טיארה", Math.round(d.group.position.x * 10) / 10, Math.round(d.group.position.z * 10) / 10]),
          נקודות_ציון: {
            רכב_התצוגה: [-2.5, -1.0],
            חדר_ישיבות: scene.userData.meetCenter ? [Math.round(scene.userData.meetCenter.x * 10) / 10, Math.round(scene.userData.meetCenter.z * 10) / 10] : null,
            המשרד_של_הבעלים: [FLOOR_W / 2 - 6.5, FLOOR_D / 2 - 4.0],
            קבלה: [-6.9, 13.5],
            קפיטריה: [17.8, 1.0],
          },
        };
      }
      // QA hook: live world positions, only published when a debugger opts in
      // (window.__off3debug = true) — zero cost otherwise.
      if (typeof window !== "undefined" && window.__off3debug) {
        const npcs = {};
        liveChars.forEach((c) => { const h = npc[c.id]; if (h) npcs[c.id] = [h.group.position.x, h.group.position.z, c.status]; });
        window.__off3pos = { player: [playerH.group.position.x, playerH.group.position.z], npcs };
        window.__off3scene = scene;
      }

      // Slow dust drift — a gentle upward bob + lateral sway per mote.
      if (!turboOn) {
        const t = clock.elapsedTime;
        const arr = dust.geometry.attributes.position.array;
        for (let i = 0; i < dustCount; i++) {
          arr[i * 3 + 1] += Math.sin(t * 0.3 + dustPhase[i]) * dt * 0.06 + dt * 0.02;
          if (arr[i * 3 + 1] > 5.2) arr[i * 3 + 1] = 0.4;
          arr[i * 3] += Math.sin(t * 0.2 + dustPhase[i]) * dt * 0.04;
        }
        dust.geometry.attributes.position.needsUpdate = true;
      }

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
        const eyeY = liveRef.current.sitting ? 0.96 : 1.32;
        const fx = Math.sin(playerH.group.rotation.y), fz = Math.cos(playerH.group.rotation.y);
        const eyePos = new THREE.Vector3(playerH.group.position.x, eyeY, playerH.group.position.z);
        camera.position.lerp(eyePos, 0.4);
        camera.lookAt(eyePos.x + fx, eyeY, eyePos.z + fz);
      } else {
        playerH.group.visible = true;
        const camOffset = new THREE.Vector3(0, 6.4, 7.6);
        const desired = playerH.group.position.clone().add(camOffset);
        camera.position.lerp(desired, Math.min(1, dt * 5.2));
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

      if (turboOn) {
        // Straight render: skips the SSAO/bloom/output passes — the biggest
        // per-frame GPU cost on weak machines.
        renderer.render(scene, camera);
      } else {
        composer.render();
      }
    }
    liveRef.current.setTalkTarget = setTalkTarget;
    liveRef.current.setSitting = setSitting;
    liveRef.current.setCanSit = setCanSit;
    liveRef.current.toggleSit = () => setSitting((v) => (v ? false : !!liveRef.current.canSit));
    // Turbo 🚀 — every lever at once: 1x pixel ratio, post chain bypassed
    // (animate renders straight through the renderer), shadows off, dust +
    // sky-life extras hidden, CCTV frozen on its last frame.
    liveRef.current.setTurbo = (on) => {
      turboOn = on;
      applyPasses();
      renderer.setPixelRatio(on ? 1 : Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
      composer.setPixelRatio(renderer.getPixelRatio());
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      composer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.shadowMap.autoUpdate = !on;
      sun.castShadow = !on && !isMobile;
      dust.visible = !on;
      heliGroup.visible = !on;
      balloonGroup.visible = !on && skylineMode === "day";
      searchGroup.visible = !on && skylineMode === "night";
    };
    liveRef.current.setTurbo(turbo);
    animate();

    const onResize = () => {
      const w = mount.clientWidth || window.innerWidth, h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloomPass.setSize(w, h);
      if (ssaoPass) ssaoPass.setSize(w, h);
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
        try { composer.dispose(); } catch {}
        try { secRT.dispose(); } catch {}
        if (scene.environment) { scene.environment.dispose(); scene.environment = null; }
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      };
    })();

    return () => { cancelled = true; cleanupFn(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Floating joystick — touch/click anywhere on the floor view and the stick
  // appears right under your finger, so it's always comfortable to reach. A
  // larger radius gives finer control, and a small dead-zone kills drift/jitter
  // near the centre for precise stops.
  const JOY_R = 64;         // px from centre = full speed
  const JOY_DEAD = 0.14;    // fraction of the radius ignored as a dead-zone
  const onJoyStart = (e) => {
    const t = e.touches ? e.touches[0] : e;
    joyDrag.current = { ox: t.clientX, oy: t.clientY };
    setJoyBase({ x: t.clientX, y: t.clientY });
    setJoyKnob({ x: 0, y: 0 });
    liveRef.current.joyVec = { x: 0, y: 0 };
  };
  const onJoyMove = (e) => {
    if (!joyDrag.current) return;
    const t = e.touches ? e.touches[0] : e;
    let dx = t.clientX - joyDrag.current.ox, dy = t.clientY - joyDrag.current.oy;
    const len = Math.hypot(dx, dy);
    const clamped = Math.min(len, JOY_R);
    if (len > 0) { dx = (dx / len) * clamped; dy = (dy / len) * clamped; }
    setJoyKnob({ x: dx, y: dy });
    // Dead-zone + smooth remap so small movements are precise and there's no
    // jitter when you're barely touching the centre.
    let mag = clamped / JOY_R;
    if (mag < JOY_DEAD) { liveRef.current.joyVec = { x: 0, y: 0 }; return; }
    mag = (mag - JOY_DEAD) / (1 - JOY_DEAD);
    const ux = len > 0 ? (dx / clamped) : 0, uy = len > 0 ? (dy / clamped) : 0;
    liveRef.current.joyVec = { x: ux * mag, y: uy * mag };
  };
  const onJoyEnd = () => {
    joyDrag.current = null;
    setJoyBase(null);
    setJoyKnob({ x: 0, y: 0 });
    liveRef.current.joyVec = { x: 0, y: 0 };
  };

  const talkAgent = talkTarget ? byId(talkTarget) : null;
  const ph = phases[phase];

  // Talk to the agent you're standing next to, by voice, right here in the
  // simulator. The mic is "always listening" while you're near an agent —
  // it starts on its own (see the auto-listen effect above) and, once the
  // agent finishes replying, quietly starts listening again on its own, so
  // you can have a real back-and-forth without tapping anything. Tapping the
  // mic button while it's listening pauses the auto-loop (so it doesn't
  // immediately restart); tapping again resumes it. Falls back to a spoken
  // greeting if speech-to-text isn't available in the browser at all.
  const startVoiceTalk = (auto = false) => {
    const agent = talkTarget ? byId(talkTarget) : null;
    if (!agent || !voice) return;
    if (voiceState === "listening") {
      // Manual tap while listening = the user wants to pause, not restart.
      if (!auto) setAutoListen(false);
      try { recogRef.current?.stop(); } catch {}
      setVoiceState("idle");
      return;
    }
    if (!auto) setAutoListen(true);
    if (!voice.canListen) {
      const line = `שלום, אני ${agent.name}. ${agent.tagline || ""}`;
      setVoiceLine({ who: agent.name, text: line, color: agent.color });
      if (voice.canSpeak) { setVoiceState("speaking"); voice.speak(line, agent.id); setTimeout(() => setVoiceState((s) => (s === "speaking" ? "idle" : s)), 3000); }
      return;
    }
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new Rec();
    rec.lang = "he-IL"; rec.continuous = false; rec.interimResults = false;
    rec.onresult = async (e) => {
      const said = e.results?.[0]?.[0]?.transcript?.trim();
      if (!said) { setVoiceState("idle"); return; }
      setVoiceLine({ who: "אתה", text: said, color: "#E4BC63" });
      setVoiceState("thinking");
      let reply = "";
      try { reply = await voice.ask(agent.id, said); } catch {}
      reply = reply || "סליחה, לא הצלחתי לענות כרגע.";
      setVoiceLine({ who: agent.name, text: reply, color: agent.color });
      // Return to idle the moment the spoken reply actually ends (real
      // utterance onend), so the mic re-opens right away and the chat keeps
      // flowing; the estimated-duration timer stays only as a fallback for
      // browsers that never fire onend.
      const backToIdle = () => setVoiceState((s) => (s === "speaking" ? "idle" : s));
      if (voice.canSpeak) { setVoiceState("speaking"); voice.speak(reply, agent.id, backToIdle); }
      const dur = Math.min(30000, 1600 + reply.length * 65);
      setTimeout(backToIdle, voice.canSpeak ? dur : 4500);
    };
    rec.onerror = () => setVoiceState((s) => (s === "listening" ? "idle" : s));
    rec.onend = () => setVoiceState((s) => (s === "listening" ? "idle" : s));
    recogRef.current = rec;
    setVoiceState("listening");
    setVoiceLine({ who: agent.name, text: "מקשיב… דבר עכשיו 🎤", color: agent.color });
    try { rec.start(); } catch { setVoiceState("idle"); }
  };
  // Mute the agent mid-sentence — stops the spoken reply immediately and
  // (since the mic stays "always listening") quietly resumes listening for
  // your next line a moment later, instead of leaving the conversation stuck.
  const muteSpeaking = () => {
    try { window.speechSynthesis?.cancel(); } catch {}
    setVoiceState((s) => (s === "speaking" ? "idle" : s));
  };
  const voiceLabel = voiceState === "listening" ? "מקשיב…" : voiceState === "thinking" ? "חושב…" : voiceState === "speaking" ? "מדבר…" : (talkAgent ? `דבר בקול עם ${talkAgent.name}` : "");

  return (
    <div className="off3-wrap">
      <div ref={mountRef} className="off3-canvas"
        onTouchStart={onJoyStart} onTouchMove={onJoyMove} onTouchEnd={onJoyEnd}
        onMouseDown={onJoyStart} onMouseMove={onJoyMove} onMouseUp={onJoyEnd} onMouseLeave={onJoyEnd} />
      <div className="off3-hint">גע במסך וגרור כדי לנווט · חצים / WASD במחשב · התקרב לעובד ודבר איתו · ליד הכיסא שלך: E לשבת · {ph.emoji} {ph.label}</div>
      {loadPct !== null && (
        <div className="off3-loader">
          <div className="off3-loader-logo">🏢</div>
          <b>בונה את המשרד החי…</b>
          <div className="off3-loader-bar"><i style={{ width: `${Math.max(6, loadPct)}%` }} /></div>
          <span>{loadPct}%</span>
        </div>
      )}
      <button className="off3-view-toggle" onClick={() => setFirstPerson((v) => !v)} title="החלף תצוגה">
        {firstPerson ? <User size={18} /> : <Eye size={18} />}
      </button>
      <button
        className={"off3-turbo" + (turbo ? " on" : "")}
        onClick={() => setTurbo((v) => !v)}
        title={turbo ? "מצב טורבו פעיל — הסימולטור רץ במהירות מקסימלית" : "מצב טורבו — האצה לסימולטור חלק 100%"}
      >
        <Zap size={16} /> {turbo ? "טורבו פעיל" : "טורבו"}
      </button>
      {(canSit || sitting) && (
        <button className={"off3-sit" + (sitting ? " on" : "")} onClick={() => setSitting((v) => !v)} title={sitting ? "קום מהכיסא" : "שב בכיסא שלך (E)"}>
          {sitting ? "🚶 קום" : "🪑 שב בכיסא שלך"}
        </button>
      )}
      <button className="off3-settings-toggle" onClick={() => setSettingsOpen((v) => !v)} title="הגדרות סימולטור">
        <SettingsIcon size={18} />
      </button>
      {settingsOpen && (
        <div className="off3-settings">
          <div className="off3-settings-head">הגדרות סימולטור<button onClick={() => setSettingsOpen(false)}><X size={14} /></button></div>
          <button className="off3-settings-row" onClick={() => setFirstPerson((v) => !v)}>
            <span>{firstPerson ? <User size={15} /> : <Eye size={15} />} תצוגה</span>
            <b>{firstPerson ? "גוף ראשון" : "גוף שלישי"}</b>
          </button>
          <button className="off3-settings-row" onClick={() => setAutoListen((v) => !v)}>
            <span><Mic size={15} /> מיקרופון תמיד מאזין</span>
            <b className={autoListen ? "on" : ""}>{autoListen ? "פעיל" : "כבוי"}</b>
          </button>
          <button className="off3-settings-row" onClick={() => setGraphicsHigh((v) => !v)}>
            <span><Eye size={15} /> איכות גרפית (זוהר + הצללות)</span>
            <b className={graphicsHigh ? "on" : ""}>{graphicsHigh ? "גבוהה" : "חסכונית"}</b>
          </button>
          <button className="off3-settings-row" onClick={() => setTurbo((v) => !v)}>
            <span><Zap size={15} /> מצב טורבו — האצה מקסימלית</span>
            <b className={turbo ? "on" : ""}>{turbo ? "פעיל 🚀" : "כבוי"}</b>
          </button>
          {voiceList.length > 0 && (
            <div className="off3-settings-row off3-settings-select">
              <span><Volume2 size={15} /> קול הסוכנים</span>
              <select value={voiceUri} onChange={(e) => setVoiceUri(e.target.value)}>
                <option value="">אוטומטי (עברית)</option>
                {voiceList.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
              </select>
            </div>
          )}
          <p className="off3-settings-note">בגוף ראשון: ↑/W מתקדם ו-↓/S נסוג לפי הכיוון שאתה מסתכל אליו (בלי לסובב את המצלמה), ←/→ או A/D מסובבים אותך (בכיוון הפוך). כל סוכן מדבר בגובה קול מעט שונה כדי שיהיה קל להבחין ביניהם.</p>
        </div>
      )}
      {voiceLine && (
        <div className="off3-subtitle">
          <b style={{ color: voiceLine.color }}>{voiceLine.who}</b>
          <span>{voiceLine.text}</span>
          <button className="off3-subtitle-x" onClick={() => setVoiceLine(null)} title="סגור"><X size={14} /></button>
        </div>
      )}
      {talkAgent && (
        <div className="off3-talkbar">
          <button className={"off3-mic " + voiceState} style={{ "--c": talkAgent.color }} onClick={() => startVoiceTalk(false)} title={voiceLabel}>
            <Mic size={20} />
          </button>
          {voiceState === "speaking" && (
            <button className="off3-mute" style={{ "--c": talkAgent.color }} onClick={muteSpeaking} title="השתק">
              <VolumeX size={18} />
            </button>
          )}
          <button className="off3-talk" style={{ "--c": talkAgent.color }} onClick={() => onOpenChat(talkAgent.id)}>
            <MessageCircle size={18} /> {voiceLabel}
          </button>
        </div>
      )}
      {joyBase && (
        <div className="off3-joy floating" style={{ left: joyBase.x, top: joyBase.y }}>
          <div className="off3-joy-knob" style={{ transform: `translate(${joyKnob.x}px, ${joyKnob.y}px)` }} />
        </div>
      )}
    </div>
  );
}
