import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { MessageCircle, Eye, User, Mic, VolumeX, Volume2, X, Settings as SettingsIcon } from "lucide-react";

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

function makeTradeTickerState() {
  const rnd = mulberry32(303);
  const symbols = ["HGRD", "BTC", "GOLD", "S&P"];
  const prices = [212.4, 61840, 2384.2, 5312.8];
  return { rnd, symbols, prices, deltas: symbols.map(() => 0), candles: Array.from({ length: 22 }, () => 40 + rnd() * 30) };
}
function stepTradeTicker(state) {
  state.prices = state.prices.map((p, i) => {
    const move = (state.rnd() - 0.48) * p * 0.006;
    state.deltas[i] = (move / p) * 100;
    return Math.max(0.01, p + move);
  });
  state.candles.push(clamp(state.candles[state.candles.length - 1] + (state.rnd() - 0.5) * 12, 8, 92));
  state.candles.shift();
}
function drawTradeScreen(ctx, W, H, state) {
  ctx.fillStyle = "#060a10"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#1fd67a"; ctx.font = "700 30px 'Courier New',monospace";
  ctx.fillText("⚡ LIVE MARKETS", 18, 38);
  ctx.strokeStyle = "#123422"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 52); ctx.lineTo(W, 52); ctx.stroke();
  const chartX = 18, chartY = 66, chartW = W - 36, chartH = H * 0.4;
  ctx.strokeStyle = "#0f1a14"; for (let gy = 0; gy <= 4; gy++) { const y = chartY + (chartH / 4) * gy; ctx.beginPath(); ctx.moveTo(chartX, y); ctx.lineTo(chartX + chartW, y); ctx.stroke(); }
  const cw = chartW / state.candles.length;
  state.candles.forEach((v, i) => {
    const h = (v / 100) * chartH;
    const up = i === 0 || v >= state.candles[i - 1];
    ctx.fillStyle = up ? "#1fd67a" : "#e0473f";
    ctx.fillRect(chartX + i * cw + cw * 0.18, chartY + chartH - h, cw * 0.64, Math.max(2, h));
  });
  let ty = chartY + chartH + 34;
  state.symbols.forEach((s, i) => {
    const p = state.prices[i], d = state.deltas[i];
    ctx.fillStyle = "#cdeeff"; ctx.font = "600 19px 'Courier New',monospace"; ctx.fillText(s, chartX, ty);
    ctx.fillStyle = d >= 0 ? "#1fd67a" : "#e0473f";
    ctx.fillText(`${p >= 1000 ? p.toFixed(0) : p.toFixed(2)}  ${d >= 0 ? "▲" : "▼"}${Math.abs(d).toFixed(2)}%`, chartX + 110, ty);
    ty += 26;
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
  next.reset().setEffectiveWeight(1).fadeIn(0.25).play();
  if (prev) prev.fadeOut(0.25);
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
  // gaping hole, leaving a ~1.3-wide entrance in the middle.
  [-1, 1].forEach((s) => {
    const jamb = new THREE.Mesh(new THREE.PlaneGeometry(1.0, wallH), OFFICE_GLASS_MAT);
    jamb.position.set(s * (W / 2 - 0.5), wallH / 2, D / 2); g.add(jamb);
    addRail(1.0, s * (W / 2 - 0.5), D / 2, false);
  });

  // Collision circles along the three solid walls (doorway gap stays open).
  for (let t = -W / 2; t <= W / 2 + 0.01; t += 0.75) obstacles.push({ x: t, z: -D / 2, r: 0.22 });
  for (let t = -D / 2; t <= D / 2 + 0.01; t += 0.75) { obstacles.push({ x: -W / 2, z: t, r: 0.22 }); obstacles.push({ x: W / 2, z: t, r: 0.22 }); }
  obstacles.push({ x: -(W / 2 - 0.5), z: D / 2, r: 0.28 }, { x: W / 2 - 0.5, z: D / 2, r: 0.28 });

  // Frosted door-header plate with the agent's name + title, over the entrance.
  const plate = buildNameSprite(name, color, title);
  plate.scale.multiplyScalar(1.9);
  plate.position.set(0, wallH + 0.32, D / 2);
  g.add(plate);

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
  cvs.width = 320; cvs.height = 190;
  const ctx = cvs.getContext("2d");
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
  const W = 5.6, D = 5.0, wallH = 2.6;
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
  const W = 3.4, D = 1.0, H = 1.12;
  const wood = new THREE.MeshStandardMaterial({ color: 0x2a2016, roughness: 0.55, metalness: 0.12 });
  const topMat = new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.3, metalness: 0.45 });
  const front = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), wood);
  front.position.set(0, H / 2, 0); front.castShadow = true; front.receiveShadow = true; g.add(front);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(W - 0.2, 0.06, 0.02), new THREE.MeshBasicMaterial({ color }));
  strip.position.set(0, 0.5, D / 2 + 0.011); g.add(strip);
  const top = new THREE.Mesh(new THREE.BoxGeometry(W + 0.3, 0.08, D + 0.35), topMat);
  top.position.set(0, H + 0.04, 0); top.castShadow = true; g.add(top);
  // Welcome monitor on the counter, facing visitors (+Z).
  const monBody = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.4, 0.03), new THREE.MeshStandardMaterial({ color: 0x05070c, metalness: 0.5, roughness: 0.3 }));
  monBody.position.set(0.75, H + 0.34, 0.18); g.add(monBody);
  if (screenTex) {
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.34), new THREE.MeshBasicMaterial({ map: screenTex }));
    scr.position.set(0.75, H + 0.34, 0.197); g.add(scr);
  }
  // A little potted plant on the counter.
  const plant = buildPlant(); plant.scale.setScalar(0.7); plant.position.set(-1.1, H, 0); g.add(plant);
  const sign = buildNeonSign("קבלה · ALPHA", color, 2.8, 0.62);
  sign.position.set(0, 2.5, 0); g.add(sign);
  const light = new THREE.PointLight(color, 0.55, 8); light.position.set(0, 2.2, 0.5); g.add(light);
  for (let t = -W / 2; t <= W / 2 + 0.01; t += 0.7) obstacles.push({ x: t, z: 0, r: 0.5 });
  return { group: g, obstacles, seatLocal: { x: 0, z: -0.85 } };
}

// A tidy restrooms block: a small tiled room with two colour-coded doors
// (♂ / ♀) and a "שירותים" sign, tucked into a corner. Players read it from
// the outside, so the interior is just implied.
function buildRestrooms() {
  const g = new THREE.Group();
  const obstacles = [];
  const W = 3.0, D = 2.2, wallH = 2.5;
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x252a34, roughness: 0.65, metalness: 0.1 });
  const tileMat = new THREE.MeshStandardMaterial({ color: 0x30373f, roughness: 0.4, metalness: 0.15 });
  // Back + two sides solid; front (south) has the two doors.
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W, wallH), wallMat);
  back.position.set(0, wallH / 2, -D / 2); back.receiveShadow = true; g.add(back);
  [-W / 2, W / 2].forEach((sx) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(D, wallH), wallMat);
    wall.rotation.y = Math.PI / 2; wall.position.set(sx, wallH / 2, 0); g.add(wall);
  });
  // Front tiled wall with two recessed doors.
  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(W, wallH), tileMat);
  frontWall.position.set(0, wallH / 2, D / 2); g.add(frontWall);
  const doorGeo = new THREE.PlaneGeometry(0.9, 1.9);
  const mkDoor = (x, col, label) => {
    const door = new THREE.Mesh(doorGeo, new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.5, metalness: 0.3 }));
    door.position.set(x, 0.98, D / 2 + 0.02); g.add(door);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshBasicMaterial({ color: col }));
    sign.position.set(x, 1.7, D / 2 + 0.03); g.add(sign);
    const plate = buildNameSprite(label, col); plate.scale.multiplyScalar(0.7); plate.position.set(x, 2.05, D / 2 + 0.05); g.add(plate);
  };
  mkDoor(-0.7, 0x4ea8de, "גברים");
  mkDoor(0.7, 0xff6b9d, "נשים");
  // roof so it reads as an enclosed room from the chase cam
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(W, D), wallMat);
  roof.rotation.x = Math.PI / 2; roof.position.set(0, wallH, 0); g.add(roof);
  const sign = buildNeonSign("שירותים", 0x9fd6ff, 2.0, 0.5);
  sign.position.set(0, wallH + 0.35, D / 2); g.add(sign);
  // solid on all four sides (it's a closed room)
  for (let t = -W / 2; t <= W / 2 + 0.01; t += 0.6) { obstacles.push({ x: t, z: -D / 2, r: 0.28 }); obstacles.push({ x: t, z: D / 2, r: 0.28 }); }
  for (let t = -D / 2; t <= D / 2 + 0.01; t += 0.6) { obstacles.push({ x: -W / 2, z: t, r: 0.28 }); obstacles.push({ x: W / 2, z: t, r: 0.28 }); }
  return { group: g, obstacles };
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

function buildOwnerOffice(color, deskTemplate, laptopTemplate, furnitureTemplate) {
  const g = new THREE.Group();
  const obstacles = [];
  const col = new THREE.Color(color);

  // Glass partition — an L in the SE corner with a doorway gap on the inner
  // (west) side. Frames + faint tinted glass.
  // depthWrite:false is essential — a transparent pane that still writes depth
  // occludes everything behind it, which was making the agents (seen through
  // these partition walls) and the player (spawned inside the glass box) vanish.
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x8fd0ff, transparent: true, opacity: 0.1, roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x0c0e13, roughness: 0.4, metalness: 0.6 });
  const neonEdge = new THREE.MeshBasicMaterial({ color });
  const wallH = 2.6;
  // North wall (runs along x, at local z = -3), full width.
  const nWall = new THREE.Mesh(new THREE.PlaneGeometry(7, wallH), glassMat);
  nWall.position.set(0, wallH / 2, -3); g.add(nWall);
  const nTop = new THREE.Mesh(new THREE.BoxGeometry(7, 0.06, 0.06), neonEdge); nTop.position.set(0, wallH, -3); g.add(nTop);
  // West wall (runs along z, at local x = -3.5), with a doorway gap at the south end.
  const wWall = new THREE.Mesh(new THREE.PlaneGeometry(4.4, wallH), glassMat);
  wWall.rotation.y = Math.PI / 2; wWall.position.set(-3.5, wallH / 2, -0.8); g.add(wWall);
  const wTop = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 4.4), neonEdge); wTop.position.set(-3.5, wallH, -0.8); g.add(wTop);
  // collision circles along the two walls (doorway left open at south-west).
  for (let t = -3; t <= 3; t += 0.9) obstacles.push({ x: t, z: -3, r: 0.28 });
  for (let t = -3; t <= 1; t += 0.9) obstacles.push({ x: -3.5, z: t, r: 0.28 });

  // Premium rug.
  const rug = buildRug(5.4, 4.8, 0x14161c);
  rug.position.set(0, 0.006, -0.5);
  g.add(rug);
  const rugTrim = new THREE.Mesh(new THREE.RingGeometry(2.5, 2.62, 40), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
  rugTrim.rotation.x = -Math.PI / 2; rugTrim.position.set(0, 0.012, -0.5); g.add(rugTrim);

  // Executive battlestation at the back, facing the doorway (south-west).
  const desk = buildDesk(color, deskTemplate, laptopTemplate, furnitureTemplate, 0);
  desk.group.position.set(0.6, 0, -2.0);
  desk.group.rotation.y = Math.PI; // face into the room (south)
  desk.group.scale.setScalar(1.15);
  g.add(desk.group);
  obstacles.push({ x: 0.6, z: -2.0, r: 1.0 });

  // Nameplate floating over the suite, with a little gold crown above it.
  const sign = buildNeonSign("המשרד של שחר", color, 3.6, 0.7);
  sign.position.set(0, 2.95, -2.92);
  g.add(sign);
  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.18, 5),
    new THREE.MeshStandardMaterial({ color: 0xE4BC63, emissive: 0x5a4318, emissiveIntensity: 0.8, metalness: 0.6, roughness: 0.3 })
  );
  crown.position.set(0, 3.4, -2.92);
  g.add(crown);

  // Two accent uplights hidden behind the desk for a premium glow.
  const up = new THREE.PointLight(color, 0.8, 6);
  up.position.set(0.6, 0.5, -2.4); g.add(up);

  return { group: g, obstacles, deskMon: desk.monMat, deskHolo: desk.holo };
}

export default function Office3D({ chars, byId, phase, phases, deskPositions, seatPositions, dineTablePositions, bizData, voice, onClose, onOpenChat }) {
  const mountRef = useRef(null);
  const liveRef = useRef({ chars, phase, bizData, joyVec: { x: 0, y: 0 }, keys: {}, firstPerson: false });
  const [talkTarget, setTalkTarget] = useState(null);
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
  useEffect(() => { liveRef.current.phase = phase; }, [phase]);
  useEffect(() => { liveRef.current.bizData = bizData; }, [bizData]);
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
  useEffect(() => {
    if (!talkTarget || !voice?.canListen || !autoListen) return;
    if (voiceState !== "idle") return;
    const t = setTimeout(() => startVoiceTalk(true), 550);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [talkTarget, voiceState]);

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
    // slower devices without rebuilding the composer chain.
    liveRef.current.setGraphicsHigh = (high) => {
      bloomPass.enabled = high;
      if (ssaoPass) ssaoPass.enabled = high;
    };
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
      sun.shadow.normalBias = 0.02;
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
      new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.42, metalness: 0.18, envMapIntensity: 0.7 })
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
    // Designer hanging pendant lamps over each desk column — an emissive
    // glass globe on a slim cord, for a more upscale/luxurious ceiling. No
    // per-lamp light (kept cheap); the emissive globes read as lit fixtures.
    {
      const cordMat = new THREE.MeshStandardMaterial({ color: 0x0c0e13, roughness: 0.5, metalness: 0.6 });
      const globeMat = new THREE.MeshStandardMaterial({ color: 0xfff2d0, emissive: 0xffe6b0, emissiveIntensity: 0.9, roughness: 0.3 });
      const cols = [...new Set(deskPositions.map((d) => Math.round(toWorld(d.x, d.y)[0])))];
      cols.forEach((cx) => {
        [-4.5, 0, 4.5].forEach((cz) => {
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
        }
        bx += gap;
      }
    }

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
      // A little "treat/surprise" — an air-hockey table between the lounge
      // and dining room, for the cozy-office-with-perks feel.
      placeFurniturePiece(scene, furnitureTemplate, "air_hockey_001", -3.5, 0, 8.2, Math.PI / 2);
      // Storage corner (south-east) — closet, dresser, a stacked box, and a
      // couple of toys tucked by it for a lived-in, playful touch.
      placeFurniturePiece(scene, furnitureTemplate, "closet_001", 9.0, 0, -9.5, 0);
      placeFurniturePiece(scene, furnitureTemplate, "dresser_001", 10.6, 0, -9.5, 0);
      placeFurniturePiece(scene, furnitureTemplate, "box_001", 11.6, 0, -9.2, 0);
      placeFurniturePiece(scene, furnitureTemplate, "toy_001", 8.3, 0, -8.6, 0.6);
      placeFurniturePiece(scene, furnitureTemplate, "toy_002", 8.7, 0, -8.2, -0.4);
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

    // Two wall TVs for a lived-in "always something on" office feel — a
    // live-markets ticker over the lounge sofa, and the real HeavyGuard/CRM
    // numbers near the meeting nook. Redrawn a few times a second in the
    // animate loop below, not every frame.
    const tradeCanvas = document.createElement("canvas");
    tradeCanvas.width = 640; tradeCanvas.height = 356;
    const tradeCtx = tradeCanvas.getContext("2d");
    const tradeState = makeTradeTickerState();
    const tvTrade = buildTvScreen(furnitureTemplate, tradeCanvas);
    tvTrade.group.position.set(-(FLOOR_W / 2) + 0.2, 1.5, 8.5);
    tvTrade.group.rotation.y = Math.PI / 2;
    scene.add(tvTrade.group);

    const hgCanvas = document.createElement("canvas");
    hgCanvas.width = 640; hgCanvas.height = 356;
    const hgCtx = hgCanvas.getContext("2d");
    const tvHg = buildTvScreen(furnitureTemplate, hgCanvas);
    tvHg.group.position.set((FLOOR_W / 2) - 0.2, 1.5, -5.5);
    tvHg.group.rotation.y = -Math.PI / 2;
    scene.add(tvHg.group);
    drawTradeScreen(tradeCtx, tradeCanvas.width, tradeCanvas.height, tradeState);
    drawHgScreen(hgCtx, hgCanvas.width, hgCanvas.height, liveRef.current.bizData);
    let screenT = 0;
    // (SE corner plant removed — that corner is now the owner's office; the
    // SW plant moved out of the restrooms footprint.)
    [[-7.4, 10.3], [10.8, -8.6], [1.5, 10.4]].forEach(([px, pz]) => {
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
      group.position.set(wx, 0, wz);
      group.rotation.y = DESK_FACE_ROT; // turn the whole station to match the seated worker
      scene.add(group);
      deskMons.push(monMat);
      deskHolos.push(holo);
      obstacles.push({ x: wx, z: wz, r: 0.85 });
      // Each agent gets their own private glass office wrapped around their
      // battlestation — colour-coded, with their name + title over the door,
      // a potted plant, and a wall screen showing their own live domain data.
      if (owner) {
        const scrTex = buildOfficeScreenTex(owner.title, hexToInt(owner.color), agentScreenLines(owner.id, liveRef.current.bizData || {}));
        const off = buildGlassOffice(hexToInt(owner.color), owner.name, owner.title, scrTex, officeDecorTemplate);
        off.group.position.set(wx, 0, wz);
        scene.add(off.group);
        off.obstacles.forEach((o) => obstacles.push({ x: wx + o.x, z: wz + o.z, r: o.r }));
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
    }
    // A few fixed pieces the player would otherwise walk straight through.
    [[-9.5, 8.5, 1.0], [-3.5, 8.2, 0.9], [12.1, 3.7, 1.4], [9.0, -9.5, 0.9], [10.6, -9.5, 0.8]]
      .forEach(([ox, oz, r]) => obstacles.push({ x: ox, z: oz, r }));

    // The owner's private executive gaming office in the SE corner.
    const ownerOffice = buildOwnerOffice(0xE4BC63, deskTemplate, laptopTemplate, furnitureTemplate);
    const OFFICE_ORIGIN = { x: 8.5, z: 8.2 };
    ownerOffice.group.position.set(OFFICE_ORIGIN.x, 0, OFFICE_ORIGIN.z);
    scene.add(ownerOffice.group);
    ownerOffice.obstacles.forEach((o) => obstacles.push({ x: OFFICE_ORIGIN.x + o.x, z: OFFICE_ORIGIN.z + o.z, r: o.r }));
    if (ownerOffice.deskMon) deskMons.push(ownerOffice.deskMon);
    if (ownerOffice.deskHolo) deskHolos.push(ownerOffice.deskHolo);

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
      const RCP = { x: -4.6, z: 9.6 };
      reception.group.position.set(RCP.x, 0, RCP.z);
      scene.add(reception.group);
      reception.obstacles.forEach((o) => obstacles.push({ x: RCP.x + o.x, z: RCP.z + o.z, r: o.r }));
      // Receptionist — a seated greeter behind the counter (not one of the
      // 12 agents), using the same animated model, sitting.
      const recep = buildHuman(0xE4BC63, "מיכל", false, charTemplate, charClips, CHAR_SCALE, CHAR_CENTER_OFFSET, true, "קבלה");
      recep.group.position.set(RCP.x + reception.seatLocal.x, 0, RCP.z + reception.seatLocal.z);
      recep.group.rotation.y = 0; // face the visitors (+Z)
      setClip(recep, CLIP.sit);
      scene.add(recep.group);
      allExtraHumans.push(recep);
    }

    // ── Restrooms (SW corner) ────────────────────────────────────────────
    {
      const wc = buildRestrooms();
      const WC = { x: -11.3, z: 9.0 };
      wc.group.position.set(WC.x, 0, WC.z);
      scene.add(wc.group);
      wc.obstacles.forEach((o) => obstacles.push({ x: WC.x + o.x, z: WC.z + o.z, r: o.r }));
    }

    // ── Cafeteria / coffee counter (beside the dining tables) ────────────
    {
      const caf = buildCafeteria(0xffb454);
      const CAF = { x: 10.2, z: 3.7 };
      caf.group.position.set(CAF.x, 0, CAF.z);
      scene.add(caf.group);
      caf.obstacles.forEach((o) => obstacles.push({ x: CAF.x + o.x, z: CAF.z + o.z, r: o.r }));
    }

    // ── Gaming-den ambiance ──────────────────────────────────────────────
    // Neon accent floor strips down the main aisles + two big neon wall signs
    // + a pair of coloured accent lights, so the whole floor reads as a fun
    // gaming HQ rather than a plain bullpen. All emissive/unlit except the two
    // point lights, so it's cheap.
    const neonStripMat1 = new THREE.MeshBasicMaterial({ color: 0x18e0ff, transparent: true, opacity: 0.5 });
    const neonStripMat2 = new THREE.MeshBasicMaterial({ color: 0xff3ea5, transparent: true, opacity: 0.5 });
    [-6.5, -2.75, 1.0].forEach((ax, i) => {
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 15), i % 2 ? neonStripMat2 : neonStripMat1);
      strip.rotation.x = -Math.PI / 2;
      strip.position.set(ax, 0.02, -1.5);
      scene.add(strip);
    });
    const alphaSign = buildNeonSign("ALPHA HQ", 0x18e0ff, 5.2, 1.3);
    alphaSign.rotation.y = Math.PI / 2;
    alphaSign.position.set(-(FLOOR_W / 2) + 0.15, 4.4, -3);
    scene.add(alphaSign);
    const ggSign = buildNeonSign("GG · LEVEL UP", 0xff3ea5, 4.6, 1.1);
    ggSign.rotation.y = -Math.PI / 2;
    ggSign.position.set((FLOOR_W / 2) - 0.15, 4.6, 2.5);
    scene.add(ggSign);
    const accentCyan = new THREE.PointLight(0x18e0ff, 0.5, 20);
    accentCyan.position.set(-6, 4.8, 0); scene.add(accentCyan);
    const accentMagenta = new THREE.PointLight(0xff3ea5, 0.5, 20);
    accentMagenta.position.set(6, 4.8, 2); scene.add(accentMagenta);

    // Player — spawns in the open central aisle just south of the bullpen,
    // clear of any wall/desk so movement is free and comfortable from the
    // first step, facing north toward the team (the owner's glass office is
    // right there to the east to walk into).
    const playerH = buildHuman(0xE4BC63, "אתה", true, charTemplate, charClips, CHAR_SCALE, CHAR_CENTER_OFFSET, true, "הבעלים · שחר");
    playerH.group.position.set(2.2, 0, 8.6);
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
        planeGroup, birdGroup,
        ...deskHolos.filter(Boolean),
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
      // Near-building windows light up after dark — same lit-window feel as
      // the painted skyline behind them, but on real 3D geometry.
      const buildingGlowTarget = isNight ? 0.85 : isEvening ? 0.4 : 0.02;
      nearBuildingMats.forEach((mat) => {
        mat.emissiveIntensity += (buildingGlowTarget - mat.emissiveIntensity) * Math.min(1, dt * 0.8);
      });

      // Wall TVs — redrawn ~once a second, not every frame; the trading
      // screen ticks a simulated market, the HeavyGuard screen reflects
      // whatever real business numbers came in via the bizData prop.
      screenT += dt;
      if (screenT >= 1) {
        screenT = 0;
        stepTradeTicker(tradeState);
        drawTradeScreen(tradeCtx, tradeCanvas.width, tradeCanvas.height, tradeState);
        tvTrade.tex.needsUpdate = true;
        drawHgScreen(hgCtx, hgCanvas.width, hgCanvas.height, liveRef.current.bizData);
        tvHg.tex.needsUpdate = true;
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
        cloudMat.opacity = skylineMode === "day" ? 0.85 : skylineMode === "sunset" ? 0.5 : 0.16;
        birdGroup.visible = skylineMode === "day";
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
      if (mlen > 0.08) {
        mx /= mlen; mz /= mlen;
        const SPEED = 4.4;
        playerH.group.position.x = clamp(playerH.group.position.x + mx * SPEED * dt, -12.2, 12.2);
        playerH.group.position.z = clamp(playerH.group.position.z + mz * SPEED * dt, -10.2, 10.2);
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
        setClip(playerH, fpTankControls && kTurn ? CLIP.walk : CLIP.idle);
      }

      // NPCs: walk a simple two-point "aisle" route to their live target
      // (down their column to the destination's row, then across) instead
      // of cutting a diagonal beeline through every desk in between — reads
      // as deliberate human wayfinding rather than gliding through furniture.
      const liveChars = liveRef.current.chars || [];
      liveChars.forEach((c) => {
        const h = npc[c.id]; if (!h) return;
        const atDesk = c.status === "work";
        // The sit_idle clip's hip height/depth doesn't line up with this
        // specific chair model at the desk's exact floor spot — nudge the
        // walk target itself back and down onto the visible chair seat
        // (tuned by eye), so there's no separate snap once they arrive.
        const [rawTx, rawTz] = toWorld(c.x, c.y);
        const finalX = atDesk ? rawTx + Math.sin(DESK_FACE_ROT) * SEAT_BACK : rawTx;
        const finalZ = atDesk ? rawTz + Math.cos(DESK_FACE_ROT) * SEAT_BACK : rawTz;
        if (h.destX === undefined || Math.abs(h.destX - finalX) > 0.05 || Math.abs(h.destZ - finalZ) > 0.05) {
          h.destX = finalX; h.destZ = finalZ;
          h.wpX = h.group.position.x; h.wpZ = finalZ;
        }
        const atWp = Math.hypot(h.wpX - h.group.position.x, h.wpZ - h.group.position.z) < 0.1;
        const tx = atWp ? finalX : h.wpX, tz = atWp ? finalZ : h.wpZ;
        const dx = tx - h.group.position.x, dz = tz - h.group.position.z;
        const dist = Math.hypot(dx, dz);
        const distFinal = Math.hypot(finalX - h.group.position.x, finalZ - h.group.position.z);
        if (dist > 0.01) {
          // A real walking pace (units/sec), not a percent-of-remaining-
          // distance lerp — the old lerp closed most of the gap in the
          // first frame or two for any far-off desk, reading as teleporting
          // rather than walking across the room.
          const NPC_SPEED = 1.9;
          const maxStep = NPC_SPEED * dt;
          if (dist <= maxStep) {
            h.group.position.x = tx; h.group.position.z = tz;
          } else {
            h.group.position.x += (dx / dist) * maxStep;
            h.group.position.z += (dz / dist) * maxStep;
          }
        }
        const targetY = atDesk && distFinal <= 0.03 ? SEAT_DROP : 0;
        h.group.position.y += (targetY - h.group.position.y) * Math.min(1, dt * 6);
        if (distFinal > 0.03) {
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
          if (atDesk) {
            let dRot = DESK_FACE_ROT - h.group.rotation.y;
            while (dRot > Math.PI) dRot -= Math.PI * 2;
            while (dRot < -Math.PI) dRot += Math.PI * 2;
            h.group.rotation.y += dRot * Math.min(1, dt * 6);
          }
        }
      });
      allHumans.forEach((h) => { if (h.mixer) h.mixer.update(dt); });

      // Slow dust drift — a gentle upward bob + lateral sway per mote.
      {
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
        const eyeY = 1.32;
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

      composer.render();
    }
    liveRef.current.setTalkTarget = setTalkTarget;
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
      if (voice.canSpeak) { setVoiceState("speaking"); voice.speak(reply, agent.id); }
      const dur = Math.min(14000, 1600 + reply.length * 55);
      setTimeout(() => setVoiceState((s) => (s === "speaking" ? "idle" : s)), voice.canSpeak ? dur : 4500);
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
      <div className="off3-hint">גע במסך וגרור כדי לנווט · חצים / WASD במחשב · התקרב לעובד ודבר איתו · {ph.emoji} {ph.label}</div>
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
