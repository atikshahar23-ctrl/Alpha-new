import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { DragControls } from "three/examples/jsm/controls/DragControls.js";
import * as CANNON from "cannon-es";
import jsPDF from "jspdf";
import { MessageCircle, Eye, User, Mic, VolumeX, Volume2, X, Zap, Settings as SettingsIcon, Trash2, Radio, Pause, Lock, Unlock } from "lucide-react";
import { useDeviceProfile } from "./deviceProfiler.js";
import RadioController from "./RadioController.jsx";

// Hardware's real max anisotropic filtering — set once the renderer exists
// (renderer.capabilities.getMaxAnisotropy()); every canvas texture below reads
// this instead of a hardcoded guess, so distant/oblique surfaces (floors,
// signage, the wall screens) stay sharp instead of smearing into mush.
let MAX_ANISO = 8;
// GLTF-loaded model textures get NO anisotropy from the loader itself (unlike
// the canvas textures above, which set it explicitly) — exactly the assets
// most often seen at a distance/oblique angle (statues, characters across the
// room), so this is the actual biggest source of "distance blur." Call once
// per loaded template right after MAX_ANISO is known; clones made via
// SkeletonUtils share the same texture instances, so one call covers every
// agent built from that template.
function applyAniso(root) {
  if (!root) return;
  root.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      ["map", "normalMap", "roughnessMap", "metalnessMap", "emissiveMap", "aoMap"].forEach((k) => {
        if (m[k]) m[k].anisotropy = MAX_ANISO;
      });
    });
  });
}
// Scene-teardown texture disposal — every unmount cleanup used to free only
// material.map, but the GLTF character/robot/Sophia/Pokemon models loaded
// into this scene carry a full PBR texture set (normal/roughness/metalness/
// emissive/ao, same slots applyAniso touches above), so every one of those
// besides the base color map was leaking on unmount. One shared helper so
// every cleanup path (main scene + each overlay) disposes the same slots.
const MATERIAL_TEX_SLOTS = ["map", "normalMap", "roughnessMap", "metalnessMap", "emissiveMap", "aoMap", "alphaMap"];
function disposeMaterial(m) {
  MATERIAL_TEX_SLOTS.forEach((k) => { if (m[k]) m[k].dispose(); });
  m.dispose();
}

/* ════════════════════════════════════════════════════════════════════
   3D OFFICE — walk the floor yourself (WASD / joystick), approach a
   coworker and talk to them face to face. Reuses the exact same desk /
   dining / meeting coordinates as the 2D layout (same OFC_* constants
   passed in as props) so the NPC behaviour scheduler in OfficeSim needs
   no changes — only the rendering + a player avatar are new.
   A starship office shell (owner request — the business "flew to space"):
   a viewport wall looking out on a starfield/nebula/planet, ceiling strip
   lighting + pendant lamps, metal deck plating, rugs, plants and a lounge
   corner, with day/night lighting actually driven by the phase clock (sun
   colour/intensity, ambient tint and fog all lerp toward it) — reused here
   as three space moods (bright system / nebula glow / deep space) instead
   of literal time of day.
   ════════════════════════════════════════════════════════════════════ */

// The floor was doubled (owner request): the same 0–100% layout grid now maps
// onto a much larger room (SCALE 0.22→0.33, floor 26×22→39×33 ≈ ×2.25 area),
// so every desk pod gets wide clear corridors around it instead of the old
// packed-maze center. All hand-placed world coordinates below are scaled by
// the same ×1.5 factor so wall-anchored fixtures stay on their walls.
// Enlarged ×3 (owner request, mobile navigation felt cramped), then dialed
// back to ×2 overall (owner request, ×3 read as too big): SCALE and
// FLOOR_W/FLOOR_D scale together, spreading every toWorld()-derived fixture
// (desks, offices, dining, reception, cafeteria) apart by the same factor —
// but CHAR_SCALE/DESK_SCALE below are untouched, so people and furniture
// stay their current size; only the room's spaciousness changes. TALK_DIST
// and the player's own walk SPEED scale with it so proximity and crossing
// time still feel right. RCP (reception), the one hand-placed absolute
// fixture left after the original 1.5x pass, is re-positioned by hand below
// since it's not derived from toWorld(). (The executive mezzanine that
// used to live here too was removed entirely — single floor only, per
// owner request.)
const SCALE = 0.66; // world units per floor-percent point
const toWorld = (x, y) => [(x - 50) * SCALE, (y - 50) * SCALE];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const TALK_DIST = 5.0;
const FLOOR_W = 78, FLOOR_D = 66;
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

// Every agent except דבורה (facilities) — owner request — wears the
// uploaded "Legendary Robot" rig instead of the human model. Converted with
// the same raw height (1.8846) and centered/grounded pivot as casual_male.glb,
// so it drops into buildHuman() with the same CHAR_SCALE/zero offset — only
// its own clip names differ (no baked sit pose, so CLIP.sit falls back to
// its idle animation instead of leaving the character frozen mid-transition).
const ROBOT_MODEL_URL = "office-models/legendary_robot.glb";
const ROBOT_CENTER_OFFSET = [0, 0, 0];
const ROBOT_CLIP = { idle: "idle", walk: "walk", sit: "idle" };

// דבורה herself was later given a specific real model (uploaded "Sophia"
// character) instead of the shared casual_male template — same rig-swap
// pattern as the robot, just for one named agent. The source FBX's one
// baked "idling" clip turned out to be authored against a doubly-transformed
// rig hierarchy: fixing that hierarchy for a correct static pose left the
// animation itself deforming the mesh into an invisible off-screen blob
// (confirmed by rendering the identical rest pose with the clip disabled —
// perfectly fine standing) — so this asset ships with no animation at all;
// she holds one fixed standing pose regardless of idle/walk/sit state,
// same "no clip" tradeoff already accepted for the robot's missing sit pose,
// just across all three here instead of one.
const SOPHIA_MODEL_URL = "office-models/sophia.glb";
const SOPHIA_CENTER_OFFSET = [0, 0, 0];
const SOPHIA_CLIP = { idle: "idle", walk: "idle", sit: "idle" };

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

// Global Operations Wall — the "Pentagon big board": one combined dashboard
// (fleet pipeline, security alerts, system health) instead of scattered
// single-metric screens. Same real bizData the phone's Security tab and the
// HeavyGuard screen already use — no invented numbers.
function drawOpsWall(ctx, W, H, biz, alerts) {
  ctx.fillStyle = "#03060a"; ctx.fillRect(0, 0, W, H);
  const colW = W / 3;
  for (let i = 1; i < 3; i++) {
    ctx.strokeStyle = "rgba(46,230,255,.18)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(colW * i, 10); ctx.lineTo(colW * i, H - 10); ctx.stroke();
  }
  ctx.fillStyle = "#2ee6ff"; ctx.font = "700 22px 'Courier New',monospace";
  ctx.fillText("🛰 GLOBAL OPERATIONS", 16, 34);
  ctx.fillStyle = "#5f8ea0"; ctx.font = "13px 'Courier New',monospace"; ctx.textAlign = "right";
  ctx.fillText(new Date().toLocaleTimeString("he-IL"), W - 16, 34);
  ctx.textAlign = "left";

  const b = biz || {};
  const cols = [
    { title: "FLEET PIPELINE", rows: [
      ["פרויקטי צי פעילים", String(b.fleetProjects ?? "—")],
      ["התקנות", String(b.installs ?? "—")],
      ["עסקאות פתוחות", String(b.openDeals ?? "—")],
      ["נסגרו החודש", String(b.wonMonth ?? "—")],
    ] },
    { title: "SECURITY STATUS", rows: (alerts || []).slice(0, 4).map((a) => [a.level === "high" ? "🔴" : a.level === "mid" ? "🟡" : "🟢", a.text]) },
    { title: "SYSTEM HEALTH", rows: [
      ["מערכות פעילות", "6/6"],
      ["זמינות", "99.9%"],
      ["מצב סימולציה", "תקין"],
      ["חיבור רשת", navigator.onLine ? "מקוון" : "לא מקוון"],
    ] },
  ];
  cols.forEach((col, ci) => {
    const x = ci * colW + 16;
    let ty = 66;
    ctx.fillStyle = "#8fe3c0"; ctx.font = "700 14px 'Courier New',monospace";
    ctx.fillText(col.title, x, ty);
    ty += 26;
    col.rows.forEach(([label, val]) => {
      ctx.fillStyle = "#5f8ea0"; ctx.font = "12px 'Courier New',monospace";
      const wrapped = String(label).length > 20 ? String(label).slice(0, 20) + "…" : label;
      ctx.fillText(wrapped, x, ty);
      ty += 16;
      ctx.fillStyle = "#d7f6ff"; ctx.font = "700 15px 'Courier New',monospace";
      const wv = String(val).length > 22 ? String(val).slice(0, 22) + "…" : val;
      ctx.fillText(wv, x, ty);
      ty += 26;
    });
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
// Starship deck plating: brushed-metal panels with riveted seams and a thin
// recessed cyan conduit line down each seam — the floor of a ship corridor,
// not a carpeted office.
function buildFloorTexture() {
  const cvs = document.createElement("canvas");
  cvs.width = 512; cvs.height = 512;
  const ctx = cvs.getContext("2d");
  const rnd = mulberry32(42);
  const panels = ["#2a3038", "#2e343d", "#272c34", "#313842"];
  const plankW = 512 / 8;
  for (let col = 0; col < 8; col++) {
    ctx.fillStyle = panels[Math.floor(rnd() * panels.length)];
    ctx.fillRect(col * plankW, 0, plankW, 512);
    ctx.strokeStyle = "rgba(0,0,0,.4)"; ctx.lineWidth = 2;
    ctx.strokeRect(col * plankW, 0, plankW, 512);
    // recessed conduit glow down the seam
    ctx.fillStyle = "rgba(80,220,255,.22)";
    ctx.fillRect(col * plankW + plankW - 2, 0, 2, 512);
    // rivets at regular intervals
    for (let s = 0; s < 6; s++) {
      const y = 40 + s * 86;
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.beginPath(); ctx.arc(col * plankW + 8, y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(col * plankW + plankW - 8, y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.08)";
      ctx.beginPath(); ctx.arc(col * plankW + 8, y - 0.6, 1.4, 0, Math.PI * 2); ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(FLOOR_W / 4, FLOOR_D / 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = MAX_ANISO;
  return tex;
}

// Ship hull wall panel: dark gunmetal bulkhead plating with a recessed
// horizontal cyan trim line and a darker service-conduit band at the base —
// same silhouette (trim line + base band) as the old painted-plaster wall so
// every caller's proportions still line up, just re-skinned for a hull
// interior instead of drywall. The canvas maps the full 6.4m wall height;
// callers set horizontal repeat.
function buildWallTexture(repeatX) {
  const cvs = document.createElement("canvas");
  cvs.width = 512; cvs.height = 512;
  const ctx = cvs.getContext("2d");
  const rnd = mulberry32(7);
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, "#232a36"); g.addColorStop(0.7, "#1b212c"); g.addColorStop(1, "#151a23");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
  // brushed-metal noise
  for (let i = 0; i < 1500; i++) {
    ctx.fillStyle = rnd() < 0.5 ? `rgba(255,255,255,${(rnd() * 0.04).toFixed(3)})` : `rgba(0,0,0,${(rnd() * 0.07).toFixed(3)})`;
    ctx.fillRect(rnd() * 512, rnd() * 512, 1 + rnd() * 3, 2 + rnd() * 16);
  }
  // vertical panel seams every ~85px with a rivet at each seam/rail crossing
  for (let x = 0; x < 512; x += 85) {
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(x, 0, 2, 512);
    for (let y = 30; y < 512; y += 110) {
      ctx.fillStyle = "rgba(180,200,220,.18)";
      ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill();
    }
  }
  // service-conduit band: bottom ~1.1m of the 6.4m wall ≈ 88px
  ctx.fillStyle = "#0c1016"; ctx.fillRect(0, 512 - 88, 512, 88);
  for (let i = 0; i < 350; i++) {
    ctx.fillStyle = `rgba(255,255,255,${(rnd() * 0.03).toFixed(3)})`;
    ctx.fillRect(rnd() * 512, 512 - 88 + rnd() * 88, 2, 1 + rnd() * 7);
  }
  // recessed cyan conduit trim line between the bulkhead and the base band
  ctx.fillStyle = "#2ee6ff"; ctx.fillRect(0, 512 - 92, 512, 3);
  ctx.fillStyle = "rgba(46,230,255,.35)"; ctx.fillRect(0, 512 - 95, 512, 8);
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = MAX_ANISO;
  return tex;
}

// Ship ceiling — dark coffered hull panels with cyan strip-lighting and
// exposed conduit piping between bays, baked into one canvas so the whole
// ceiling costs a single textured plane.
function buildCeilingTexture() {
  const cvs = document.createElement("canvas");
  cvs.width = 1024; cvs.height = 866; // ≈ FLOOR_W:FLOOR_D
  const ctx = cvs.getContext("2d");
  ctx.fillStyle = "#0a0d13"; ctx.fillRect(0, 0, 1024, 866);
  const cols = 10, rows = 8, cw = 1024 / cols, rh = 866 / rows;
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    const x = c * cw, y = r * rh;
    const g = ctx.createLinearGradient(x, y, x, y + rh);
    g.addColorStop(0, "#131a24"); g.addColorStop(1, "#0d1219");
    ctx.fillStyle = g;
    ctx.fillRect(x + 6, y + 6, cw - 12, rh - 12);
    ctx.strokeStyle = "rgba(46,230,255,.16)"; ctx.lineWidth = 2;
    ctx.strokeRect(x + 6, y + 6, cw - 12, rh - 12);
    if (r % 2 === 1) {
      // recessed cyan strip-light with a soft halo
      ctx.fillStyle = "rgba(120,235,255,.2)";
      ctx.fillRect(x + cw * 0.16, y + rh / 2 - 10, cw * 0.68, 20);
      ctx.fillStyle = "#bdf3ff";
      ctx.fillRect(x + cw * 0.22, y + rh / 2 - 4, cw * 0.56, 8);
    } else {
      // exposed conduit pipe run across the bay
      ctx.strokeStyle = "rgba(120,130,145,.5)"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(x + 10, y + rh * 0.3); ctx.lineTo(x + cw - 10, y + rh * 0.3); ctx.stroke();
    }
  }
  ctx.strokeStyle = "#2ee6ff"; ctx.lineWidth = 6; ctx.strokeRect(8, 8, 1008, 850);
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = MAX_ANISO;
  return tex;
}

// The view from the ship's bridge windows: deep space, a drifting nebula and
// one lit planet, drawn onto a shared canvas and swapped (redrawn +
// texture.needsUpdate) whenever the office's day/night phase actually
// changes — reusing the same three "mode" buckets the office always had
// (day/sunset/night) as three space moods instead of three times of day:
// "day" = bright system, close to the star, nebula lit up bright; "sunset" =
// a warm gas-cloud belt with the planet gold-lit; "night" = deep space, far
// from any star, dense cold starfield. Same palette family as the Space
// Portal overlay (SpaceOverlay, above) so both views read as the same universe.
export function drawSkyline(ctx, W, H, mode) {
  const isDay = mode === "day";
  const isSunset = mode === "sunset";
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  if (isDay) {
    sky.addColorStop(0, "#050a18"); sky.addColorStop(0.5, "#0a1226");
    sky.addColorStop(0.85, "#0d1a2e"); sky.addColorStop(1, "#0f1d33");
  } else if (isSunset) {
    sky.addColorStop(0, "#0d0a1c"); sky.addColorStop(0.45, "#1c1230");
    sky.addColorStop(0.75, "#2a1830"); sky.addColorStop(1, "#331a24");
  } else {
    sky.addColorStop(0, "#020308"); sky.addColorStop(0.5, "#04060f");
    sky.addColorStop(0.85, "#050813"); sky.addColorStop(1, "#060a16");
  }
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  const rnd = mulberry32(7);

  // Starfield — denser and colder deep in "night" mode, sparser and warmer
  // close to the star in "day" mode.
  const starCount = isDay ? 260 : isSunset ? 340 : 520;
  for (let i = 0; i < starCount; i++) {
    const sx = rnd() * W, sy = rnd() * H * 0.92;
    const b = 0.2 + rnd() * 0.75;
    ctx.fillStyle = `rgba(255,255,255,${b.toFixed(2)})`;
    const s = rnd() > 0.94 ? 2.4 : rnd() > 0.8 ? 1.6 : 1;
    ctx.fillRect(sx, sy, s, s);
    if (rnd() > 0.985) {
      // occasional bright star with a tiny cross-flare
      ctx.fillStyle = `rgba(200,225,255,${(0.5 + rnd() * 0.4).toFixed(2)})`;
      ctx.fillRect(sx - 5, sy, 10, 1); ctx.fillRect(sx, sy - 5, 1, 10);
    }
  }

  // Nebula bands — soft colored gas clouds drifting across the view.
  const nebPalette = isDay ? ["rgba(143,208,255,.10)", "rgba(111,224,200,.08)"]
    : isSunset ? ["rgba(232,111,176,.16)", "rgba(185,143,232,.14)", "rgba(255,164,110,.10)"]
    : ["rgba(111,140,224,.07)", "rgba(143,111,232,.06)"];
  for (let i = 0; i < 7; i++) {
    const cx = rnd() * W, cy = rnd() * H * 0.8, rw = 180 + rnd() * 340, rh = 60 + rnd() * 120;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rw, rh));
    grad.addColorStop(0, nebPalette[Math.floor(rnd() * nebPalette.length)]);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.ellipse(cx, cy, rw, rh, rnd() * Math.PI, 0, Math.PI * 2); ctx.fill();
  }

  // The planet — one big lit sphere, position/light angle varies with mode:
  // close and bright by "day", low and gold at "sunset", small and dim by
  // "night" (far system).
  const planet = isDay ? { x: W * 0.74, y: H * 0.32, r: 190, lit: "#bfe0ff", shadow: "#0a1220", termX: -0.35 }
    : isSunset ? { x: W * 0.28, y: H * 0.56, r: 150, lit: "#ffcf8a", shadow: "#241226", termX: 0.3 }
    : { x: W * 0.68, y: H * 0.22, r: 70, lit: "#7f97c9", shadow: "#050810", termX: -0.2 };
  const pg = ctx.createRadialGradient(
    planet.x + planet.r * planet.termX, planet.y - planet.r * 0.25, planet.r * 0.1,
    planet.x, planet.y, planet.r
  );
  pg.addColorStop(0, planet.lit);
  pg.addColorStop(0.55, planet.lit);
  pg.addColorStop(0.75, planet.shadow);
  pg.addColorStop(1, planet.shadow);
  ctx.fillStyle = pg;
  ctx.beginPath(); ctx.arc(planet.x, planet.y, planet.r, 0, Math.PI * 2); ctx.fill();
  // faint atmosphere halo
  const halo = ctx.createRadialGradient(planet.x, planet.y, planet.r * 0.95, planet.x, planet.y, planet.r * 1.18);
  halo.addColorStop(0, "rgba(180,210,255,.28)"); halo.addColorStop(1, "rgba(180,210,255,0)");
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(planet.x, planet.y, planet.r * 1.18, 0, Math.PI * 2); ctx.fill();
  // a thin ring
  ctx.save();
  ctx.translate(planet.x, planet.y);
  ctx.rotate(-0.22);
  ctx.scale(1, 0.22);
  ctx.strokeStyle = "rgba(230,220,190,.35)"; ctx.lineWidth = planet.r * 0.05;
  ctx.beginPath(); ctx.arc(0, 0, planet.r * 1.45, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  // Distant asteroid silhouettes drifting along the lower third — reads as
  // depth/parallax without needing real 3D geometry for every rock.
  const rockColors = isDay ? ["#1c2536", "#222c40"] : isSunset ? ["#26182c", "#2c1e34"] : ["#0a0d16", "#0d1119"];
  let rx = 0;
  while (rx < W) {
    const rs = 8 + rnd() * 26;
    const ry = H * (0.78 + rnd() * 0.14);
    ctx.fillStyle = rockColors[Math.floor(rnd() * rockColors.length)];
    ctx.beginPath();
    const pts = 6 + Math.floor(rnd() * 3);
    for (let p = 0; p < pts; p++) {
      const ang = (p / pts) * Math.PI * 2;
      const rr = rs * (0.6 + rnd() * 0.5);
      const px = rx + Math.cos(ang) * rr, py = ry + Math.sin(ang) * rr * 0.6;
      if (p === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    rx += rs * 2 + 30 + rnd() * 90;
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

// A tileable hull-plate + porthole grid so the near-field "buildings" outside
// the window read as other station modules/derelict hulls drifting nearby —
// genuine 3D geometry instead of a flat painted plane. Two separate
// textures, both cloned per module (cheap — shares the image, only `repeat`
// differs) so each tiles its own grid to its own size: a neutral grey-metal
// albedo (so modules read as unlit hull plating by default), and a mostly-
// black emissive layer with only the porthole squares bright, ramped in at
// "night" in animate() so nothing glows unless the mode is actually dark.
function buildFacadeAlbedo() {
  const cvs = document.createElement("canvas");
  cvs.width = 128; cvs.height = 128;
  const ctx = cvs.getContext("2d");
  const rnd = mulberry32(4242);
  ctx.fillStyle = "#3a3f48"; ctx.fillRect(0, 0, 128, 128);
  for (let y = 6; y < 122; y += 13) {
    for (let x = 6; x < 122; x += 11) {
      ctx.fillStyle = rnd() > 0.3 ? "#4a5158" : "#24272d";
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
  const rnd = mulberry32(4242); // same seed as the albedo grid so lit portholes line up
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 128, 128);
  for (let y = 6; y < 122; y += 13) {
    for (let x = 6; x < 122; x += 11) {
      if (rnd() > 0.3) { ctx.fillStyle = "#8fd0ff"; ctx.fillRect(x, y, 6, 8); }
    }
  }
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// A thin animated debris-streak strip layered at the base of the space
// view — a few icy light streaks crawling left/right, like distant micro-
// meteors caught in the ship's running lights — so the window reads as a
// live starfield outside, not a painted backdrop. Cheap: a small 1024×48
// canvas redrawn every frame.
function makeTrafficState() {
  const rnd = mulberry32(555);
  const cars = Array.from({ length: 14 }, () => ({
    x: rnd() * 1024,
    y: 10 + rnd() * 28,
    speed: (rnd() > 0.5 ? 1 : -1) * (40 + rnd() * 70),
    color: rnd() > 0.25 ? "#bfe0ff" : "#8fd0ff",
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
function buildHuman(color, name, isPlayer, charTemplate, charClips, modelScale = CHAR_SCALE, modelOffset = CHAR_CENTER_OFFSET, tintClothes = true, role = "", clipMap = CLIP) {
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
      current = findClip(clipMap.idle);
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

  return { group: g, ring, mixer, actions, current, clipMap, nameSprite };
}

// Crossfade to a named clip — CLIP.walk/CLIP.idle/CLIP.sit used to be passed
// in directly, but every character now carries its own clipMap (the human
// rig's baked names vs. the Legendary Robot's own "idle"/"walk", which also
// has no sit pose and falls back to its idle) — callers pass the generic
// key ("idle"/"walk"/"sit") and it's resolved through h.clipMap here, only
// crossfading when the resolved clip is actually changing.
function setClip(h, action) {
  if (!h.mixer) return;
  const shortName = (h.clipMap || CLIP)[action] || action;
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

// ── Room registry: the fully-walled spaces (each agent's private glass
// office, the shared conference room, the owner suite) so NPC pathing can
// funnel through their actual doorway instead of beelining straight through
// a wall to reach a desk/seat that happens to sit inside one. Every wall in
// this scene already leaves a doorway gap in its collision-circle list (see
// buildGlassOffice/buildConferenceRoom/buildOwnerOffice) — this registry
// just records, per room, its world footprint and the world position of
// that gap so routing can use it as a waypoint.
// `box` is defined in the room's own local (pre-rotation) frame: { cx, cz,
// halfW, halfD, doorX, doorZ, doorNX, doorNZ } — doorN{X,Z} is the outward
// unit normal of the doorway, used to place an approach point just outside it.
function registerRoom(rooms, ox, oz, rot, box) {
  const cr = Math.cos(rot), sr = Math.sin(rot);
  const toW = (lx, lz) => ({ x: ox + lx * cr + lz * sr, z: oz - lx * sr + lz * cr });
  rooms.push({
    ox, oz, rot,
    lcx: box.cx, lcz: box.cz, halfW: box.halfW, halfD: box.halfD,
    door: toW(box.doorX, box.doorZ),
    doorOut: toW(box.doorX + box.doorNX * 0.7, box.doorZ + box.doorNZ * 0.7),
  });
}
function roomContaining(rooms, x, z) {
  for (const r of rooms) {
    const dx = x - r.ox, dz = z - r.oz;
    const cr = Math.cos(r.rot), sr = Math.sin(r.rot);
    const lx = dx * cr - dz * sr, lz = dx * sr + dz * cr;
    if (Math.abs(lx - r.lcx) <= r.halfW && Math.abs(lz - r.lcz) <= r.halfD) return r;
  }
  return null;
}

// Free real-world blurb about a truck model — same DuckDuckGo Instant
// Answer API pattern used elsewhere in this app (no key, no cost). Fails
// honestly (returns "") rather than inventing specs.
async function fetchTruckBlurb(query) {
  try {
    const r = await fetch("https://api.duckduckgo.com/?q=" + encodeURIComponent(query + " truck specifications") + "&format=json&no_html=1&skip_disambig=1", { signal: AbortSignal.timeout(7000) });
    const d = await r.json();
    const bits = [];
    if (d.AbstractText) bits.push(d.AbstractText);
    (d.RelatedTopics || []).slice(0, 2).forEach((t) => { if (t && t.Text) bits.push(t.Text); });
    return bits.length ? bits.join(" · ").slice(0, 420) : "";
  } catch { return ""; }
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
// "Physical Glass" — real transmission/IOR instead of the old flat-opacity
// fake, so office dividers/pods actually refract and pick up the room's
// neon the way a real glass panel would (Electric Sanctuary layer 3).
const OFFICE_GLASS_MAT = new THREE.MeshPhysicalMaterial({
  color: 0xdcf0ff, metalness: 0, roughness: 0.06,
  transmission: 0.93, ior: 1.5, thickness: 0.35,
  transparent: true, opacity: 1, side: THREE.DoubleSide,
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
  tex.anisotropy = MAX_ANISO;
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

  // דבורה is the one human crew member left on the bridge (owner request —
  // she stays the "Sophia" human, not a robot), running the ship as its
  // ops-center captain. Her station is themed as a command console instead
  // of an office: a bit of greenery from the crew quarters plus a glowing
  // holographic ops pedestal where the old wooden side table used to sit.
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
  // Holographic ops console — a hexagonal pedestal with an emissive top and a
  // floating tinted holo ring + wire-globe, standing in for the office side
  // table so the bridge station reads as a control post, not a desk.
  {
    const consoleG = new THREE.Group();
    const pedMat = new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.35, metalness: 0.55 });
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.9, 6), pedMat);
    ped.position.y = 0.45; ped.castShadow = true; consoleG.add(ped);
    const topGlow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.36, 0.03, 6),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 })
    );
    topGlow.position.y = 0.92; consoleG.add(topGlow);
    const holoRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.012, 8, 32),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 })
    );
    holoRing.rotation.x = Math.PI / 2; holoRing.position.y = 1.16; consoleG.add(holoRing);
    const holoGlobe = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.17, 1),
      new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.55 })
    );
    holoGlobe.position.y = 1.16; consoleG.add(holoGlobe);
    const consoleLight = new THREE.PointLight(color, 0.4, 3.5);
    consoleLight.position.y = 1.2; consoleG.add(consoleLight);
    consoleG.position.set(W / 2 - 0.5, 0, -D / 2 + 0.5);
    g.add(consoleG);
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

// Robot charging capsule — replaces the private glass office for every robot
// agent (all except דבורה, who keeps her human office). An open-front glass
// tube on a glowing dock ring: the robot walks in to charge and steps out for
// its routines, the live data screen moved OUTSIDE onto a side stand, and a
// charge-meter panel above the opening is redrawn live from the animate loop.
function buildChargingPod(color, name, title, screenTex) {
  const g = new THREE.Group();
  const obstacles = [];
  const R = 0.95, H = 2.5;

  // Dock base + glowing ring — same staging language as the display podiums.
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.25, R + 0.4, 0.12, 28),
    new THREE.MeshStandardMaterial({ color: 0x161a24, roughness: 0.4, metalness: 0.6 })
  );
  base.position.y = 0.06; base.receiveShadow = true; g.add(base);
  const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R + 0.14, 0.03, 8, 40), ringMat);
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.13; g.add(ring);

  // Rear glass shell — a 3/4 tube with the opening facing +Z (the walk-in
  // side, same direction the old office doorway faced), so entering the
  // capsule is just walking to its center — no door logic needed.
  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, H, 30, 1, true, Math.PI * 0.25, Math.PI * 1.5),
    OFFICE_GLASS_MAT
  );
  shell.position.y = 0.12 + H / 2; g.add(shell);
  // Vertical frame ribs on the opening's two edges + a colored top halo.
  const ribMat = new THREE.MeshStandardMaterial({ color: 0x1d2330, roughness: 0.35, metalness: 0.7 });
  [-1, 1].forEach((s) => {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.07, H, 0.07), ribMat);
    rib.position.set(s * R * Math.SQRT1_2, 0.12 + H / 2, R * Math.SQRT1_2);
    g.add(rib);
  });
  const halo = new THREE.Mesh(new THREE.TorusGeometry(R, 0.045, 8, 40), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 }));
  halo.rotation.x = Math.PI / 2; halo.position.y = 0.12 + H; g.add(halo);
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.12, R + 0.02, 0.14, 28),
    new THREE.MeshStandardMaterial({ color: 0x161a24, roughness: 0.4, metalness: 0.6 })
  );
  cap.position.y = 0.12 + H + 0.07; g.add(cap);

  // Inner energy column — additive glow the animate loop pulses while the
  // robot is actually docked and charging.
  const glowMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const glow = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.28, R - 0.28, H - 0.35, 20, 1, true), glowMat);
  glow.position.y = 0.12 + H / 2; g.add(glow);

  // Charge-meter panel above the opening — live canvas, drawn by drawPodMeter.
  const meterCvs = document.createElement("canvas");
  meterCvs.width = 256; meterCvs.height = 140;
  const meterTex = new THREE.CanvasTexture(meterCvs);
  meterTex.colorSpace = THREE.SRGBColorSpace;
  const meterBezel = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.56), new THREE.MeshBasicMaterial({ color: 0x05060a }));
  meterBezel.position.set(0, 0.12 + H + 0.48, 0.30); g.add(meterBezel);
  const meterScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.5), new THREE.MeshBasicMaterial({ map: meterTex }));
  meterScreen.position.set(0, 0.12 + H + 0.48, 0.315); g.add(meterScreen);

  // Frosted name/title plate over the meter, same as the old office door had.
  const plate = buildNameSprite(name, color, title);
  plate.scale.multiplyScalar(1.9);
  plate.position.set(0, 0.12 + H + 1.05, 0.3);
  g.add(plate);

  // The agent's live data screen — outside the capsule on a slim side stand,
  // facing the walkway (owner request: the data stays visible without the
  // robot's own body blocking the old in-office wall screen).
  if (screenTex) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.5, 10), ribMat);
    pole.position.set(R + 0.75, 0.75, 0.35); g.add(pole);
    const bezel = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 0.82), new THREE.MeshBasicMaterial({ color: 0x05060a }));
    bezel.position.set(R + 0.75, 1.78, 0.35); bezel.rotation.y = -0.22; g.add(bezel);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.24, 0.74), new THREE.MeshBasicMaterial({ map: screenTex }));
    screen.position.set(R + 0.75, 1.78, 0.36); screen.rotation.y = -0.22; g.add(screen);
    obstacles.push({ x: R + 0.75, z: 0.35, r: 0.28 });
  }

  // Accent light so the dock reads as its own lit pod, like the offices did.
  const up = new THREE.PointLight(color, 0.35, 5.5);
  up.position.set(0, 2.0, 0);
  g.add(up);

  // Collision along the rear shell arc only — the opening stays walkable.
  for (let a = Math.PI * 0.3; a <= Math.PI * 1.7; a += Math.PI / 7) {
    obstacles.push({ x: Math.sin(a + Math.PI) * R, z: Math.cos(a + Math.PI) * R, r: 0.22 });
  }

  // Neon high-voltage arcs, shown only while actually docked+charging (wired
  // up by the animate loop) — hidden by default.
  const lightning = buildPodLightning(R, H);
  g.add(lightning.group);

  return { group: g, obstacles, glowMat, ringMat, lightning, meter: { canvas: meterCvs, ctx: meterCvs.getContext("2d"), tex: meterTex } };
}

// Neon lightning arcs for a charging pod: a handful of jagged strands from
// the docked agent to fixed anchor points on the inner glass wall (the same
// wall arc the collision ring above uses, so bolts never reach into the open
// doorway), regenerated on a flicker timer rather than every frame — bloom
// (already in the postprocessing chain) supplies the actual glow.
const POD_LIGHTNING_COLORS = [0x36e6ff, 0xb84bff];
function buildPodLightning(R, H) {
  const group = new THREE.Group();
  group.visible = false;
  const N = 5;
  const bolts = [];
  for (let k = 0; k < N; k++) {
    const a = Math.PI * 0.3 + ((k + 0.5) / N) * (Math.PI * 1.4);
    const anchor = new THREE.Vector3(
      Math.sin(a + Math.PI) * (R - 0.12),
      0.12 + H * (0.3 + 0.5 * (k / Math.max(1, N - 1))),
      Math.cos(a + Math.PI) * (R - 0.12)
    );
    const segN = 5;
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(segN * 3), 3));
    const mat = new THREE.LineBasicMaterial({
      color: POD_LIGHTNING_COLORS[k % 2], transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const line = new THREE.Line(geom, mat);
    group.add(line);
    bolts.push({ line, mat, anchor });
  }
  return { group, bolts };
}

// Re-jitters every bolt's midpoints between the agent's current (pod-local)
// position and its fixed wall anchor. Called ~14x/sec per charging pod, not
// every frame — cheap, and a real per-frame update would look too smooth/CG
// rather than a crackling arc.
const _podBoltDir = new THREE.Vector3();
const _podBoltUp = new THREE.Vector3();
const _podBoltPerp1 = new THREE.Vector3();
const _podBoltPerp2 = new THREE.Vector3();
const _podBoltPt = new THREE.Vector3();
function updatePodBolt(bolt, originLocal) {
  const posAttr = bolt.line.geometry.attributes.position;
  const segN = posAttr.count;
  _podBoltDir.subVectors(bolt.anchor, originLocal);
  const dirLen = Math.max(0.001, _podBoltDir.length());
  _podBoltUp.set(0, 1, 0);
  if (Math.abs(_podBoltDir.y) > 0.9 * dirLen) _podBoltUp.set(1, 0, 0);
  _podBoltPerp1.crossVectors(_podBoltDir, _podBoltUp).normalize();
  _podBoltPerp2.crossVectors(_podBoltDir, _podBoltPerp1).normalize();
  for (let i = 0; i < segN; i++) {
    const t = i / (segN - 1);
    _podBoltPt.lerpVectors(originLocal, bolt.anchor, t);
    const envelope = Math.sin(Math.PI * t); // pinches to zero at both ends
    _podBoltPt.addScaledVector(_podBoltPerp1, (Math.random() - 0.5) * 0.24 * envelope);
    _podBoltPt.addScaledVector(_podBoltPerp2, (Math.random() - 0.5) * 0.24 * envelope);
    posAttr.setXYZ(i, _podBoltPt.x, _podBoltPt.y, _podBoltPt.z);
  }
  posAttr.needsUpdate = true;
  bolt.mat.opacity = 0.5 + Math.random() * 0.5;
}

// ── Electric Sanctuary layer 2: "High-Voltage Arc" corner pillars ────────
// A small Tesla-coil-style pillar with a glowing orb on top, arcing 4 jagged
// bolts down to floor anchors around its base, plus a flickering point
// light — reuses the same jagged-bolt technique as the charging pods, just
// standalone rather than tied to a docked agent.
function buildVoltageArcPillar(hex) {
  const g = new THREE.Group();
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x1c2029, roughness: 0.4, metalness: 0.7 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.3, 16), baseMat);
  base.position.y = 0.15; g.add(base);
  const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.6, 12), baseMat);
  coil.position.y = 1.1; g.add(coil);
  const orbMat = new THREE.MeshBasicMaterial({ color: hex });
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), orbMat);
  orb.position.y = 2.0; g.add(orb);
  const light = new THREE.PointLight(hex, 1.1, 8);
  light.position.y = 2.0; g.add(light);
  const N = 4;
  const bolts = [];
  for (let k = 0; k < N; k++) {
    const a = (k / N) * Math.PI * 2;
    const anchor = new THREE.Vector3(Math.cos(a) * 1.1, 0.05, Math.sin(a) * 1.1);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(5 * 3), 3));
    const mat = new THREE.LineBasicMaterial({ color: hex, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
    const line = new THREE.Line(geom, mat);
    g.add(line);
    bolts.push({ line, mat, anchor, origin: new THREE.Vector3(0, 2.0, 0) });
  }
  g.userData.bolts = bolts;
  g.userData.orbMat = orbMat;
  g.userData.light = light;
  return g;
}

// Small canvas-sprite label (a single letter/short tag) — used by the war
// table's day grid instead of the fuller buildNameSprite (name+title layout).
function buildTinyLabelSprite(text, colorHex) {
  const cvs = document.createElement("canvas");
  cvs.width = 128; cvs.height = 128;
  const ctx = cvs.getContext("2d");
  ctx.fillStyle = colorHex;
  ctx.font = "900 84px 'Space Grotesk', system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, 64, 68);
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  return new THREE.Sprite(mat);
}

// ── Electric Sanctuary layer 5: "Nanotech Hologram" particle cloud ───────
// A cylinder of drifting, twinkling points hovering over a station — the
// idea being the hologram reads as "assembled" from suspended digital motes
// rather than a flat plane. Applied to the war table + algo zone as the
// demonstrative pass (converting every 2D HUD panel this way is a much
// larger job left for a follow-up, not attempted here).
function buildNanoParticleCloud(radius, height, count, hex) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * radius;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.random() * height;
    pos[i * 3 + 2] = Math.sin(a) * r;
    phase[i] = Math.random() * Math.PI * 2;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: hex, size: 0.045, transparent: true, opacity: 0.75,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  pts.userData.basePos = pos.slice();
  pts.userData.phase = phase;
  return pts;
}
function updateNanoParticleCloud(pts, t) {
  const posAttr = pts.geometry.attributes.position;
  const base = pts.userData.basePos;
  const phase = pts.userData.phase;
  for (let i = 0; i < phase.length; i++) {
    posAttr.array[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 1.2 + phase[i]) * 0.15;
  }
  posAttr.needsUpdate = true;
  pts.material.opacity = 0.55 + Math.sin(t * 2 + phase[0]) * 0.25;
}

// ── Module 1: Heavy Guard Holographic War Table ───────────────────────────
// A table with a 7-day isometric grid on top; truck miniatures (one per
// pending install ticket) start in a staging row and get DragControls-
// dragged onto a day tile to schedule them (wiring is in the main effect,
// where the renderer/camera/DOM element exist).
function buildWarTable() {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.12, 3.4),
    new THREE.MeshStandardMaterial({ color: 0x141a24, roughness: 0.3, metalness: 0.6 }));
  top.position.y = 0.95; top.castShadow = true; top.receiveShadow = true; g.add(top);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(3.15, 0.03, 8, 40), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.5 }));
  rim.rotation.x = Math.PI / 2; rim.scale.set(1, 0.63, 1); rim.position.y = 1.02; g.add(rim);
  const days = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
  const cols = 7;
  const tileW = 0.66, gap = 0.06;
  const startX = -((cols - 1) * (tileW + gap)) / 2;
  const tiles = [];
  days.forEach((d, i) => {
    const tile = new THREE.Mesh(new THREE.BoxGeometry(tileW, 0.03, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x1c2636, roughness: 0.5, emissive: 0x0b3f52, emissiveIntensity: 0.4 }));
    tile.position.set(startX + i * (tileW + gap), 1.02, 0);
    g.add(tile);
    const label = buildTinyLabelSprite(d, "#8fe6ff");
    label.scale.set(0.28, 0.28, 1);
    label.position.set(tile.position.x, 1.1, -1.35);
    g.add(label);
    tiles.push({ x: tile.position.x, z: 0, day: i, label: d });
  });
  const legMat = new THREE.MeshStandardMaterial({ color: 0x10141c, roughness: 0.4, metalness: 0.6 });
  [[-2.5, -1.4], [2.5, -1.4], [-2.5, 1.4], [2.5, 1.4]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.95, 0.12), legMat);
    leg.position.set(x, 0.475, z); g.add(leg);
  });
  return { group: g, tiles };
}

// A single low-poly heavy-truck miniature representing one pending install
// ticket — cab + trailer + wheels, tinted by ticket status.
function buildTruckMini(hex) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.4, metalness: 0.5 });
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.12), bodyMat);
  cab.position.set(0.11, 0.1, 0); g.add(cab);
  const trailer = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.11), new THREE.MeshStandardMaterial({ color: 0xe8e8ec, roughness: 0.5 }));
  trailer.position.set(-0.1, 0.09, 0); g.add(trailer);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.7 });
  [[0.11, -0.06], [-0.02, -0.06], [-0.18, -0.06], [0.11, 0.06], [-0.02, 0.06], [-0.18, 0.06]].forEach(([x, z]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 10), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.035, z); g.add(wheel);
  });
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  g.userData.isTruckMini = true;
  return g;
}

// ── Module 3: Interactive Companion (Kids Mode) ───────────────────────────
// A friendly Pokémon-x-rescue-pup mascot for Ori: round body, big ears, big
// eyes, a Paw-Patrol-style rescue vest with a cross badge, and a small
// lightning-bolt marking. Fully procedural — no external model.
function buildKidsCompanion() {
  const g = new THREE.Group();
  const furMat = new THREE.MeshStandardMaterial({ color: 0xffd166, roughness: 0.75 });
  const bellyMat = new THREE.MeshStandardMaterial({ color: 0xfff3d6, roughness: 0.8 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 16), furMat);
  body.scale.set(1, 0.92, 1.1); body.position.y = 0.4; g.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 14), bellyMat);
  belly.position.set(0, 0.34, 0.22); g.add(belly);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 14), furMat);
  head.position.set(0, 0.74, 0.14); g.add(head);
  [-1, 1].forEach((s) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 10), furMat);
    ear.position.set(s * 0.18, 0.95, 0.1); ear.rotation.z = s * 0.3; g.add(ear);
  });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a1410 });
  [-1, 1].forEach((s) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), eyeMat);
    eye.position.set(s * 0.09, 0.78, 0.34); g.add(eye);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    glint.position.set(s * 0.09 + 0.014, 0.79, 0.36); g.add(glint);
  });
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), new THREE.MeshBasicMaterial({ color: 0x8a5a3a }));
  nose.position.set(0, 0.7, 0.38); g.add(nose);
  const vest = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.22, 16, 1, true, 0, Math.PI * 1.6),
    new THREE.MeshStandardMaterial({ color: 0xff5c50, roughness: 0.6, side: THREE.DoubleSide }));
  vest.position.y = 0.45; vest.rotation.y = Math.PI * 0.7; g.add(vest);
  const badgeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const badgeH = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.01), badgeMat);
  const badgeV = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.01), badgeMat);
  badgeH.position.set(0, 0.46, 0.31); badgeV.position.set(0, 0.46, 0.31);
  g.add(badgeH); g.add(badgeV);
  const boltShape = new THREE.Shape();
  boltShape.moveTo(0, 0.06); boltShape.lineTo(0.03, 0.02); boltShape.lineTo(0.01, 0.02);
  boltShape.lineTo(0.04, -0.06); boltShape.lineTo(0, -0.01); boltShape.lineTo(0.02, -0.01); boltShape.closePath();
  const bolt = new THREE.Mesh(new THREE.ExtrudeGeometry(boltShape, { depth: 0.01, bevelEnabled: false }),
    new THREE.MeshBasicMaterial({ color: 0xffe066 }));
  bolt.position.set(-0.1, 0.42, -0.28); bolt.rotation.y = Math.PI; g.add(bolt);
  [[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.1, 4, 8), furMat);
    leg.position.set(x, 0.12, z); g.add(leg);
  });
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}

// ── Module 4: Bookkeeper Export Terminal (prop) ───────────────────────────
function buildBookkeeperTerminal() {
  const g = new THREE.Group();
  const desk = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.75, 0.6), new THREE.MeshStandardMaterial({ color: 0x1b1f28, roughness: 0.5, metalness: 0.4 }));
  desk.position.y = 0.375; g.add(desk);
  const screenMat = new THREE.MeshBasicMaterial({ color: 0xeef3ff });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.44), screenMat);
  screen.position.set(0, 1.05, 0.28); g.add(screen);
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.52), new THREE.MeshStandardMaterial({ color: 0x0a0d12 }));
  bezel.position.set(0, 1.05, 0.275); g.add(bezel);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), new THREE.MeshStandardMaterial({ color: 0x14161c }));
  stand.position.set(0, 0.9, 0.2); g.add(stand);
  const glowRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.02, 8, 30), new THREE.MeshBasicMaterial({ color: 0xE4BC63, transparent: true, opacity: 0.6 }));
  glowRing.rotation.x = Math.PI / 2; glowRing.position.y = 0.02; g.add(glowRing);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { group: g, screenMat };
}

// Compiles the same figures already tracked in bizData (the app's own real
// business data — nothing fabricated) into a clean, corporate black-and-
// white PDF for Mor to review. Drawn directly with jsPDF's text/line API
// rather than an html2canvas screenshot — a rasterized canvas capture of the
// 3D scene wouldn't read as a bookkeeping document; crisp vector text does.
function exportBookkeeperPdf(b) {
  b = b || {};
  const money = (n) => "₪" + Math.round(n || 0).toLocaleString();
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  let y = 56;
  doc.setFont("helvetica", "bold"); doc.setFontSize(18);
  doc.text("HeavyGuard / Alpha - Financial Summary", W / 2, y, { align: "center" });
  y += 22;
  doc.setFont("helvetica", "normal"); doc.setFontSize(11);
  doc.text(`Prepared for: Mor (Senior Bookkeeper)   |   Date: ${new Date().toLocaleDateString("en-GB")}`, W / 2, y, { align: "center" });
  y += 30;
  doc.setDrawColor(0); doc.line(48, y, W - 48, y);
  y += 26;
  const rows = [
    ["Total Revenue", money(b.hgRevenue)],
    ["Open Pipeline Value", money(b.openVal)],
    ["Closed This Month", money(b.wonMonth)],
    ["Open Deals", String(b.openDeals ?? "-")],
    ["Total Customers", String(b.custCount ?? "-")],
    ["Total Installs", String(b.installs ?? "-")],
    ["Stale Deals (needs follow-up)", String(b.staleCount ?? "-")],
    ["Pricelist Items", String(b.pricelist ?? "-")],
  ];
  doc.setFontSize(12);
  rows.forEach(([label, val]) => {
    doc.setFont("helvetica", "normal"); doc.text(label, 64, y);
    doc.setFont("helvetica", "bold"); doc.text(val, W - 64, y, { align: "right" });
    y += 24;
  });
  y += 20;
  doc.setDrawColor(0); doc.line(48, y, W - 48, y);
  y += 30;
  doc.setFont("helvetica", "italic"); doc.setFontSize(10);
  doc.text("Generated automatically from the Alpha command-center's live business data.", W / 2, y, { align: "center" });
  doc.save(`heavyguard-financial-summary-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ── Module 6: Tiggo 7 PHEV virtual-garage stats ───────────────────────────
// Battery/mileage are a simulated live feed (a smooth deterministic wander,
// not a real OBD/telematics connection). Loan figures are PLACEHOLDER
// EXAMPLE terms for an August-2025 balloon contract — swap in the real
// principal/rate/term the moment they're known; nothing here is the actual
// contract.
const LOAN_START = new Date(2025, 7, 1);
const LOAN_MONTHS = 36;
const LOAN_PRINCIPAL = 120000;
const LOAN_BALLOON = 45000;
function loanStatus(now) {
  const monthsElapsed = Math.max(0, (now.getFullYear() - LOAN_START.getFullYear()) * 12 + (now.getMonth() - LOAN_START.getMonth()));
  const monthsLeft = Math.max(0, LOAN_MONTHS - monthsElapsed);
  const monthlyPrincipal = (LOAN_PRINCIPAL - LOAN_BALLOON) / LOAN_MONTHS;
  const paidSoFar = Math.min(LOAN_PRINCIPAL - LOAN_BALLOON, monthlyPrincipal * monthsElapsed);
  return { monthsLeft, paidSoFar, balloon: LOAN_BALLOON, done: monthsLeft <= 0 };
}
function carLiveStats() {
  const t = Date.now() / 60000;
  const battery = Math.round(62 + 22 * Math.sin(t * 0.05));
  const mileage = 18420 + Math.floor(t * 0.8);
  return { battery: Math.max(15, Math.min(100, battery)), mileage };
}

// ── Module 5: 'Me' Comm-Link relay station (prop) ─────────────────────────
// SIMULATED ONLY — there is no real integration with the Me caller-ID app
// (no API access); the hologram card it shows is generated locally and says
// so on its own face.
function buildCommLinkStation() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.14, 20), new THREE.MeshStandardMaterial({ color: 0x161a24, roughness: 0.4, metalness: 0.6 }));
  base.position.y = 0.07; g.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.3, 10), new THREE.MeshStandardMaterial({ color: 0x1d2330, roughness: 0.4, metalness: 0.6 }));
  pole.position.y = 0.75; g.add(pole);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
    new THREE.MeshStandardMaterial({ color: 0x2ee6ff, roughness: 0.2, metalness: 0.7, side: THREE.DoubleSide, emissive: 0x0a3540, emissiveIntensity: 0.4 }));
  dish.rotation.x = Math.PI; dish.position.y = 1.42; g.add(dish);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.015, 6, 26), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.5 }));
  ring.position.y = 1.42; g.add(ring);
  const beacon = new THREE.PointLight(0x2ee6ff, 0.6, 3);
  beacon.position.y = 1.5; g.add(beacon);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { group: g, beacon };
}

// Fake incoming-call hologram card texture — explicitly labelled as a
// simulation on its own face so it's never mistaken for a real Me lookup.
function buildCallerCardTexture(name, phone, tag) {
  const cvs = document.createElement("canvas");
  cvs.width = 384; cvs.height = 224;
  const ctx = cvs.getContext("2d");
  const grd = ctx.createLinearGradient(0, 0, 0, 224);
  grd.addColorStop(0, "rgba(10,20,35,.94)"); grd.addColorStop(1, "rgba(5,10,18,.94)");
  ctx.fillStyle = grd; ctx.fillRect(0, 0, 384, 224);
  ctx.strokeStyle = "rgba(46,230,255,.6)"; ctx.lineWidth = 3; ctx.strokeRect(4, 4, 376, 216);
  ctx.fillStyle = "#6fe6ff"; ctx.font = "700 15px 'Space Grotesk', sans-serif"; ctx.textAlign = "right";
  ctx.fillText("📞 שיחה נכנסת · זוהה על ידי Me", 364, 34);
  ctx.fillStyle = "#eaf6ff"; ctx.font = "900 30px 'Rubik', sans-serif";
  ctx.fillText(name, 364, 84);
  ctx.fillStyle = "#9fe6f4"; ctx.font = "600 18px 'Rubik', sans-serif";
  ctx.fillText(phone, 364, 116);
  ctx.fillStyle = "#7fd8ea"; ctx.font = "600 14px 'Rubik', sans-serif";
  ctx.fillText(tag, 364, 146);
  ctx.fillStyle = "rgba(46,230,255,.15)";
  ctx.fillRect(20, 170, 344, 34);
  ctx.fillStyle = "#c9f2ff"; ctx.font = "700 13px 'Rubik', sans-serif"; ctx.textAlign = "center";
  ctx.fillText("סימולציה בלבד — לא חיבור אמיתי ל-Me", 192, 191);
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ── Module 8: Heavy Guard 360° Drone/CCTV shader ──────────────────────────
// ── Electric Sanctuary Layer 1: Energy Grid floor overlay ─────────────────
// A thin additive-blended plane laid a hair above the real floor: a faint
// circuit-board grid plus concentric pulse rings that travel inward toward
// the central hologram hub. Speed/intensity scale with uWorkload (0..1,
// driven by how many agents are actively "working" right now — a real,
// if simplified, stand-in for API load).
const EnergyGridShader = {
  uniforms: {
    uTime: { value: 0 },
    uWorkload: { value: 0.15 },
    uCenter: { value: new THREE.Vector2(0.5, 0.5) },
    uColorA: { value: new THREE.Color(0x1c8fd6) },
    uColorB: { value: new THREE.Color(0xe4bc63) },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uTime; uniform float uWorkload; uniform vec2 uCenter;
    uniform vec3 uColorA; uniform vec3 uColorB;
    void main(){
      vec2 uv = vUv;
      float dist = length(uv - uCenter);
      float gx = pow(abs(sin(uv.x * 90.0)), 160.0);
      float gy = pow(abs(sin(uv.y * 70.0)), 160.0);
      float grid = max(gx, gy) * 0.3;
      // Slowed way down and softened — the original fast, sharp-edged
      // outward pulse read as a spinning/expanding ring under the reflective
      // floor and caused real vertigo (owner report), not just a style note.
      float speed = 0.025 + uWorkload * 0.1;
      float ring = fract(dist * 6.0 - uTime * speed);
      float pulse = smoothstep(0.24, 0.0, abs(ring - 0.5)) * (0.12 + uWorkload * 0.28);
      float edgeFade = smoothstep(0.02, 0.12, uv.x) * smoothstep(0.98, 0.88, uv.x) * smoothstep(0.02, 0.12, uv.y) * smoothstep(0.98, 0.88, uv.y);
      float glow = (grid + pulse) * edgeFade;
      vec3 col = mix(uColorA, uColorB, pulse);
      gl_FragColor = vec4(col * glow, glow * 0.6);
    }`,
};

// Fisheye barrel distortion + CRT scanlines/static + vignette, toggled onto
// the composer only while the drone view is active ('C' key).
const DroneCamShader = {
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, amount: { value: 0.4 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float time; uniform float amount; varying vec2 vUv;
    void main(){
      vec2 uv = vUv * 2.0 - 1.0;
      float r2 = dot(uv, uv);
      vec2 warped = uv * (1.0 + amount * r2);
      vec2 suv = warped * 0.5 + 0.5;
      vec3 col;
      if (suv.x < 0.0 || suv.x > 1.0 || suv.y < 0.0 || suv.y > 1.0) { col = vec3(0.0); }
      else { col = texture2D(tDiffuse, suv).rgb; }
      float scan = sin(suv.y * 720.0) * 0.04;
      col -= scan;
      float noise = fract(sin(dot(suv * time, vec2(12.9898, 78.233))) * 43758.5453);
      col += (noise - 0.5) * 0.06;
      col *= 1.0 - r2 * 0.35;
      gl_FragColor = vec4(col, 1.0);
    }`,
};

// ── Module 7: procedural hype-track (Web Audio) ───────────────────────────
// A synthesized reggaeton/hip-hop-flavored beat (dembow-ish kick pattern,
// sub bass, hand claps) — there's no licensed track to embed, so this is a
// genuine synth performance rather than a stub, same procedural-audio
// approach the boot sequence already uses for its own SFX.
function playHypeBeat() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const ctx = new AC();
    const t0 = ctx.currentTime;
    const bpm = 96, beat = 60 / bpm;
    const kick = (t) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
      g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.25);
    };
    const clap = (t) => {
      const len = Math.floor(ctx.sampleRate * 0.15);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
      const src = ctx.createBufferSource(); src.buffer = buf;
      const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1200;
      const g = ctx.createGain(); g.gain.value = 0.5;
      src.connect(hp); hp.connect(g); g.connect(ctx.destination); src.start(t);
    };
    const bass = (t, freq) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sawtooth"; o.frequency.value = freq;
      g.gain.setValueAtTime(0.001, t); g.gain.linearRampToValueAtTime(0.22, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.9);
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 400;
      o.connect(lp); lp.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + beat);
    };
    const bassLine = [55, 55, 65.4, 61.7];
    for (let bar = 0; bar < 8; bar++) {
      const barT = t0 + bar * beat;
      kick(barT);
      if (bar % 2 === 1) clap(barT);
      kick(barT + beat * 0.75);
      bass(barT, bassLine[bar % bassLine.length]);
    }
    setTimeout(() => { try { ctx.close(); } catch {} }, 8000);
  } catch {}
}

// Battery panel for a charging pod: level bar + % + a ⚡ while docked, in the
// agent's own colour. Redrawn once a second from the animate loop, not per frame.
function drawPodMeter(pod) {
  const { ctx, canvas } = pod.meter;
  const W = canvas.width, Hh = canvas.height;
  const lvl = Math.round(pod.charge);
  const barColor = lvl > 50 ? "#3FD79A" : lvl > 20 ? "#E4A63C" : "#F4504A";
  ctx.clearRect(0, 0, W, Hh);
  const grd = ctx.createLinearGradient(0, 0, 0, Hh);
  grd.addColorStop(0, "#0d1424"); grd.addColorStop(1, "#080b14");
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W, Hh);
  ctx.fillStyle = pod.hex; ctx.fillRect(0, 0, W, 5);
  ctx.font = "700 26px system-ui, sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = "#9fb2d4";
  ctx.fillText("CHARGE", 14, 40);
  ctx.textAlign = "right"; ctx.fillStyle = barColor; ctx.font = "800 30px system-ui, sans-serif";
  ctx.fillText(lvl + "%" + (pod.charging ? " ⚡" : ""), W - 14, 42);
  // battery outline + fill
  const bx = 14, by = 62, bw = W - 46, bh = 48;
  ctx.strokeStyle = "#2a3550"; ctx.lineWidth = 3; ctx.strokeRect(bx, by, bw, bh);
  ctx.fillStyle = "#2a3550"; ctx.fillRect(bx + bw + 4, by + 14, 10, 20); // battery tip
  ctx.fillStyle = barColor;
  ctx.fillRect(bx + 4, by + 4, Math.max(4, (bw - 8) * lvl / 100), bh - 8);
  pod.meter.tex.needsUpdate = true;
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
  tex.anisotropy = MAX_ANISO;
  return tex;
}

// Real per-agent metrics pulled from the live business snapshot, chosen to
// match each agent's domain so every office wall shows information that's
// actually relevant to whoever sits there.
function agentScreenLines(id, b) {
  const money = (n) => "₪" + Math.round(n || 0).toLocaleString();
  const by = {
    ceo: [["Total Revenue", money(b.hgRevenue)], ["Customers", b.custCount], ["Open Deals", b.openDeals], ["Closed This Month", b.wonMonth]],
    sales: [["Open Deals", b.openDeals], ["Pipeline Value", money(b.openVal)], ["Closed This Month", b.wonMonth], ["Customers", b.custCount]],
    ops: [["Installs", b.installs], ["HeavyGuard Revenue", money(b.hgRevenue)], ["Pricelist Items", b.pricelist], ["Customers", b.custCount]],
    cmo: [["Customers", b.custCount], ["Installs", b.installs], ["Top Product", (b.top && b.top[0] && b.top[0].name) || "—"], ["Closed This Month", b.wonMonth]],
    dev: [["Active Systems", 6], ["Open Tasks", Math.max(1, b.staleCount)], ["Deploys This Month", 4], ["Uptime", "99.9%"]],
    auto: [["Active Flows", 9], ["Hours Saved", 128], ["Integrations", 5], ["Runs Today", 240]],
    data: [["Customers", b.custCount], ["Installs", b.installs], ["Pipeline Value", money(b.openVal)], ["Stale Deals", b.staleCount]],
    cs: [["Customers", b.custCount], ["Stale Deals", b.staleCount], ["Satisfaction", "94%"], ["Open Tickets", Math.max(0, b.staleCount)]],
    finance: [["Total Revenue", money(b.hgRevenue)], ["Pipeline Value", money(b.openVal)], ["Closed This Month", b.wonMonth], ["Open Collections", money(b.openVal * 0.3)]],
    procure: [["Pricelist Items", b.pricelist], ["Suppliers", 8], ["Installs", b.installs], ["Open Orders", 3]],
    legal: [["Active Contracts", b.custCount], ["Forms", 12], ["Under Review", 2], ["Compliance", "✓"]],
    growth: [["Opportunities", 7], ["Pipeline Value", money(b.openVal)], ["Customers", b.custCount], ["Monthly Target", money(b.hgRevenue * 1.4)]],
    facilities: [["Desks in Office", 13], ["Overall Order", "✓"], ["Active Renovations", 1], ["Open Requests", 2]],
  };
  return by[id] || [["Customers", b.custCount], ["Revenue", money(b.hgRevenue)], ["Deals", b.openDeals]];
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

// A compact mini-gym: a treadmill (slanted deck + display), a dumbbell rack
// with a few weight pairs, and a wall mirror panel — for the 10:00/12:00/
//16:00 break windows.
function buildMiniGym(color) {
  const g = new THREE.Group();
  const obstacles = [];
  const dark = new THREE.MeshStandardMaterial({ color: 0x1a1c22, roughness: 0.5, metalness: 0.35 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x101114, roughness: 0.85 });

  // Treadmill.
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.12, 1.8), rubber);
  deck.position.set(-1.1, 0.16, 0); deck.rotation.x = -0.05; deck.castShadow = true; deck.receiveShadow = true;
  g.add(deck);
  const console_ = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.08), dark);
  console_.position.set(-1.1, 0.75, 0.82); console_.rotation.x = -0.35; console_.castShadow = true;
  g.add(console_);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.24), new THREE.MeshBasicMaterial({ color }));
  screen.position.set(-1.1, 0.8, 0.86); screen.rotation.x = -0.35;
  g.add(screen);
  const rails = [[-0.32, -1.1], [0.32, -1.1]];
  rails.forEach(([ox]) => {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.1, 6), dark);
    rail.position.set(-1.1 + ox, 0.55, 0.1); g.add(rail);
  });
  obstacles.push({ x: -1.1, z: 0, r: 0.75 });

  // Dumbbell rack (A-frame + three weight pairs, ascending size).
  const rackMat = new THREE.MeshStandardMaterial({ color: 0x22252c, roughness: 0.4, metalness: 0.6 });
  const rackFrame = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.65, 0.35), rackMat);
  rackFrame.position.set(0.9, 0.32, -0.1); rackFrame.castShadow = true; rackFrame.receiveShadow = true;
  g.add(rackFrame);
  const weightMat = new THREE.MeshStandardMaterial({ color: 0x2a2d34, roughness: 0.6, metalness: 0.4 });
  [-0.28, 0, 0.28].forEach((dx, i) => {
    const r = 0.06 + i * 0.02;
    [-0.09, 0.09].forEach((dz) => {
      const head = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), weightMat);
      head.position.set(0.9 + dx, 0.65 + r, -0.1 + dz); head.castShadow = true;
      g.add(head);
    });
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.18, 6), new THREE.MeshStandardMaterial({ color: 0x3a3d44, metalness: 0.7, roughness: 0.3 }));
    bar.rotation.z = Math.PI / 2; bar.position.set(0.9 + dx, 0.65 + r, -0.1); g.add(bar);
  });
  obstacles.push({ x: 0.9, z: -0.1, r: 0.6 });

  // Wall mirror behind the equipment (reflective-looking, cheap fresnel fake).
  const mirror = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 1.7),
    new THREE.MeshStandardMaterial({ color: 0x2a3550, roughness: 0.08, metalness: 0.9 })
  );
  mirror.position.set(0, 1.0, -1.05); mirror.rotation.x = 0.02;
  g.add(mirror);
  const light = new THREE.PointLight(0xdfe8ff, 0.55, 7);
  light.position.set(0, 2.1, -0.2); g.add(light);
  const sign = buildNeonSign("חדר כושר", color, 2.2, 0.55);
  sign.position.set(0, 2.35, -1.0); g.add(sign);
  return { group: g, obstacles };
}

// A lounge/break corner facing the north skyline window: two couches around
// a low table, a rug and a couple of plants — where agents unwind during a
// break window instead of loitering at their desks.
function buildLoungeArea(color) {
  const g = new THREE.Group();
  const obstacles = [];
  const rug = buildRug(3.2, 2.6, 0x2c2438);
  rug.position.y = 0.005; g.add(rug);

  const couchA = buildCouch();
  couchA.position.set(0, 0, -0.75); couchA.rotation.y = Math.PI;
  g.add(couchA);
  obstacles.push({ x: 0, z: -0.75, r: 0.9 });

  const couchB = buildCouch();
  couchB.scale.set(0.75, 1, 0.75);
  couchB.position.set(-1.15, 0, 0.55); couchB.rotation.y = Math.PI / 2;
  g.add(couchB);
  obstacles.push({ x: -1.15, z: 0.55, r: 0.7 });

  const table = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.32, 16),
    new THREE.MeshStandardMaterial({ color: 0x17181e, roughness: 0.3, metalness: 0.4 })
  );
  table.position.set(-0.1, 0.16, 0.05); table.castShadow = true; table.receiveShadow = true;
  g.add(table);
  const glassTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.46, 0.02, 16),
    new THREE.MeshPhysicalMaterial({ color: 0x9fd6ff, transparent: true, opacity: 0.2, roughness: 0.1, metalness: 0.1 })
  );
  glassTop.position.set(-0.1, 0.33, 0.05); g.add(glassTop);
  obstacles.push({ x: -0.1, z: 0.05, r: 0.5 });

  [[1.35, -1.2], [1.3, 1.1]].forEach(([px, pz]) => {
    const plant = buildPlant();
    plant.position.set(px, 0, pz); plant.scale.setScalar(1.3);
    g.add(plant);
  });

  const light = new THREE.PointLight(0xffd8b0, 0.5, 7);
  light.position.set(0, 2.0, 0); g.add(light);
  const sign = buildNeonSign("לאונג' והפסקות", color, 2.6, 0.55);
  sign.position.set(0, 2.35, -1.15); g.add(sign);
  return { group: g, obstacles };
}

// Employee kitchenette — counter with sink, upper cabinets, a fridge and a
// microwave. Decor only (west wall, just outside the percent-space grid
// the animated agents walk in), same category as reception/the fleet
// podiums: a real amenity to look at, not a scripted NPC destination.
function buildKitchen(color) {
  const g = new THREE.Group();
  const obstacles = [];
  const cab = new THREE.MeshStandardMaterial({ color: 0x22242c, roughness: 0.45, metalness: 0.3 });
  const counterTop = new THREE.MeshStandardMaterial({ color: 0x0e0f14, roughness: 0.2, metalness: 0.5 });

  const counter = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.9, 2.6), cab);
  counter.position.set(0, 0.45, 0); counter.castShadow = true; counter.receiveShadow = true;
  g.add(counter);
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.06, 2.7), counterTop);
  top.position.set(0, 0.93, 0); g.add(top);
  // Sink basin, inset into the counter.
  const sink = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.55), new THREE.MeshStandardMaterial({ color: 0x0a0a10, roughness: 0.15, metalness: 0.8 }));
  sink.position.set(0.05, 0.9, 0.5); g.add(sink);
  const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 6), new THREE.MeshStandardMaterial({ color: 0xc8d0da, metalness: 0.85, roughness: 0.2 }));
  faucet.position.set(-0.15, 1.08, 0.5); g.add(faucet);

  // Upper cabinets.
  const upper = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 2.2), cab);
  upper.position.set(0.05, 1.85, -0.1); upper.castShadow = true;
  g.add(upper);
  const upperStrip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.55, 2.1), new THREE.MeshBasicMaterial({ color }));
  upperStrip.position.set(0.31, 1.85, -0.1); g.add(upperStrip);

  // Fridge, at the counter's end.
  const fridge = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.75, 0.68), new THREE.MeshStandardMaterial({ color: 0xd7dde4, roughness: 0.3, metalness: 0.6 }));
  fridge.position.set(0, 0.875, 1.65); fridge.castShadow = true; fridge.receiveShadow = true;
  g.add(fridge);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.0, 6), new THREE.MeshStandardMaterial({ color: 0x8a8f98, metalness: 0.8, roughness: 0.25 }));
  handle.rotation.z = Math.PI / 2; handle.position.set(0.36, 1.1, 1.5); g.add(handle);
  obstacles.push({ x: 0, z: 1.65, r: 0.5 });

  // Microwave on the counter.
  const micro = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.3), new THREE.MeshStandardMaterial({ color: 0x1b1e26, roughness: 0.4, metalness: 0.5 }));
  micro.position.set(0.05, 1.08, -0.9); micro.castShadow = true;
  g.add(micro);
  const microLed = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.06), new THREE.MeshBasicMaterial({ color: 0x2ee6ff }));
  microLed.position.set(0.23, 1.1, -0.9); microLed.rotation.y = Math.PI / 2;
  g.add(microLed);

  for (let t = -1.3; t <= 1.3 + 0.01; t += 0.75) obstacles.push({ x: 0, z: t, r: 0.5 });
  const light = new THREE.PointLight(0xfff0d8, 0.55, 7);
  light.position.set(-0.3, 2.1, 0); g.add(light);
  const sign = buildNeonSign("מטבח", color, 1.8, 0.55);
  sign.rotation.y = Math.PI / 2; sign.position.set(0.5, 2.3, -0.1); g.add(sign);
  return { group: g, obstacles };
}

// God Mode spawn props — a small security camera (wall-style dome mount,
// blinking record LED) and a rack-mount DVR box. Plain primitives, not
// GLB models — cheap to spawn on demand from the admin panel.
function buildSecurityCameraProp() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.22, 16),
    new THREE.MeshStandardMaterial({ color: 0x1a1c22, roughness: 0.4, metalness: 0.6 })
  );
  body.rotation.z = Math.PI / 2; body.castShadow = true; g.add(body);
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.07, 0.06, 16),
    new THREE.MeshStandardMaterial({ color: 0x0a0c12, roughness: 0.1, metalness: 0.3 })
  );
  lens.rotation.z = Math.PI / 2; lens.position.x = 0.14; g.add(lens);
  const mount = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.06), new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.5, metalness: 0.5 }));
  mount.position.set(-0.14, 0.1, 0); g.add(mount);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff3b30 }));
  led.position.set(0.1, 0.06, 0); g.add(led);
  const glow = new THREE.PointLight(0xff3b30, 0.25, 1.5);
  glow.position.copy(led.position); g.add(glow);
  return g;
}
function buildDvrBoxProp() {
  const g = new THREE.Group();
  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.08, 0.32),
    new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.4, metalness: 0.5 })
  );
  chassis.position.y = 0.04; chassis.castShadow = true; chassis.receiveShadow = true;
  g.add(chassis);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.07), new THREE.MeshStandardMaterial({ color: 0x0a0c12, roughness: 0.3, metalness: 0.4 }));
  face.rotation.y = Math.PI / 2; face.position.set(0.221, 0.04, 0); g.add(face);
  for (let i = 0; i < 4; i++) {
    const led = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.012), new THREE.MeshBasicMaterial({ color: i === 0 ? 0x3FD79A : 0x2ee6ff }));
    led.rotation.y = Math.PI / 2; led.position.set(0.222, 0.055, -0.13 + i * 0.06); g.add(led);
  }
  return g;
}

// The owner's private executive suite, rebuilt around real meetings: a much
// bigger glass corner office (grew with the doubled floor), the desk now
// faces INTO the room so the owner looks at whoever walks in, and two guest
// chairs sit across the desk — the summon flow walks the called agent in
// through the door and sits them down on one, facing the owner. Returns the
// local seat spots (owner chair + guest chair) so the sim can snap the player
// and the summoned agent onto them precisely.
function buildOwnerOffice(color, deskTemplate, laptopTemplate, furnitureTemplate, guestLocal, rackTradeCanvas, rackHgCanvas) {
  const g = new THREE.Group();
  const obstacles = [];

  // Solid partition — an L in the SE corner. North wall spans the full suite;
  // the west wall has a wide doorway gap (local z −0.8..0.9, ~1.7 wide) that
  // the summoned agent's walk-in route passes through, filled by a real door
  // leaf below. Owner request: unlike every other office's glass walls, this
  // one is fully opaque — nobody can see (or shoot a camera) straight through
  // into the private suite from the floor.
  const wallMat = new THREE.MeshStandardMaterial({ map: buildWallTexture(4), roughness: 0.8, metalness: 0.08 });
  const neonEdge = new THREE.MeshBasicMaterial({ color });
  const wallH = 2.6;
  // North wall (runs along x, at local z = -4.3), spanning to the room's east wall.
  const nWall = new THREE.Mesh(new THREE.PlaneGeometry(11.8, wallH), wallMat);
  nWall.position.set(0.6, wallH / 2, -4.3); nWall.receiveShadow = true; g.add(nWall);
  const nTop = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.06, 0.06), neonEdge); nTop.position.set(0.6, wallH, -4.3); g.add(nTop);
  // West wall (runs along z, at local x = -5.3) in two segments around the door.
  [[-2.55, 3.5], [2.45, 3.1]].forEach(([cz, len]) => {
    const seg = new THREE.Mesh(new THREE.PlaneGeometry(len, wallH), wallMat);
    seg.rotation.y = Math.PI / 2; seg.position.set(-5.3, wallH / 2, cz); seg.receiveShadow = true; g.add(seg);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, len), neonEdge); top.position.set(-5.3, wallH, cz); g.add(top);
  });
  // A real door leaf filling the west-wall gap — hinged on the south jamb,
  // permanently propped half-open (no per-frame animation needed) so it
  // reads as an actual door instead of an empty gap in the wall.
  {
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x1c1f28, roughness: 0.4, metalness: 0.3 });
    const doorW = 1.6, doorT = 0.06;
    const hinge = new THREE.Group();
    hinge.position.set(-5.3, 0, 0.9); // south jamb of the doorway gap
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(doorT, wallH - 0.08, doorW), doorMat);
    leaf.position.set(0, (wallH - 0.08) / 2, -doorW / 2);
    leaf.castShadow = leaf.receiveShadow = true;
    hinge.add(leaf);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 8), new THREE.MeshStandardMaterial({ color: 0xC9A24B, metalness: 0.8, roughness: 0.25 }));
    handle.rotation.z = Math.PI / 2; handle.position.set(doorT / 2 + 0.02, (wallH - 0.08) / 2, -doorW + 0.12);
    hinge.add(handle);
    hinge.rotation.y = -0.85; // propped open into the room
    g.add(hinge);
  }
  // collision circles along the walls + the door leaf's own swept footprint
  // (doorway gap otherwise left open).
  for (let t = -5.3; t <= 6.5; t += 0.85) obstacles.push({ x: t, z: -4.3, r: 0.26 });
  for (let t = -4.3; t <= -0.8; t += 0.8) obstacles.push({ x: -5.3, z: t, r: 0.26 });
  for (let t = 0.9; t <= 4.0; t += 0.8) obstacles.push({ x: -5.3, z: t, r: 0.26 });
  obstacles.push({ x: -4.6, z: 0.4, r: 0.35 });

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
  let rackTradeTex = null, rackHgTex = null;
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
    // Owner request: this globe IS Alpha, the main assistant - bigger and
    // more present than a decorative desk prop.
    holo.scale.setScalar(1.7);
    g.add(holo);
    obstacles.push({ x: 3.0, z: -1.4, r: 0.85 });

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

    // A real data screen above the racks — live markets + HeavyGuard ops,
    // the same canvases/draw functions the wall TVs use, not decoration.
    // Owner request: "the info received there should go into the financial
    // area in my office" — the racks used to be LED-bar decor only.
    if (rackTradeCanvas) {
      rackTradeTex = new THREE.CanvasTexture(rackTradeCanvas);
      rackTradeTex.colorSpace = THREE.SRGBColorSpace;
      const bezel = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.5), new THREE.MeshBasicMaterial({ color: 0x03040a }));
      bezel.position.set(-3.4, 2.3, -3.95);
      g.add(bezel);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.44), new THREE.MeshBasicMaterial({ map: rackTradeTex }));
      screen.position.set(-3.4, 2.3, -3.94);
      g.add(screen);
    }
    if (rackHgCanvas) {
      rackHgTex = new THREE.CanvasTexture(rackHgCanvas);
      rackHgTex.colorSpace = THREE.SRGBColorSpace;
      const bezel = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.5), new THREE.MeshBasicMaterial({ color: 0x03040a }));
      bezel.position.set(-2.2, 2.3, -3.95);
      g.add(bezel);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.44), new THREE.MeshBasicMaterial({ map: rackHgTex }));
      screen.position.set(-2.2, 2.3, -3.94);
      g.add(screen);
    }

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

  return { group: g, obstacles, deskMon: desk.monMat, deskHolo: desk.holo, seatLocal, spinners, blinkMats, holoLocal: { x: 3.0, z: -1.4 }, rackTradeTex, rackHgTex };
}

/* ── Space portal overlay ────────────────────────────────────────────
   A small, self-contained three.js scene (its own renderer/camera/RAF
   loop, entirely separate from the office scene underneath — the office
   keeps simulating in the background so nothing has to pause/resume).
   Starfield + a colored nebula particle field + a glowing sun + a handful
   of planets on simple circular orbits + three "data-stream" rings whose
   glow tracks real business metrics, slow free-look via drag, a Focus Mode
   dim/zoom, and a return button.
   `load` (0..1) is a real, live figure — see the caller in Office3D below —
   not a cosmetic random wobble: it speeds the orbits up when the business
   is actually busier (more open deals + active fleet projects). */
function SpaceOverlay({ onReturn, load = 0 }) {
  const mountRef = useRef(null);
  const loadRef = useRef(load);
  useEffect(() => { loadRef.current = load; }, [load]);
  const [focusMode, setFocusMode] = useState(false);
  const focusRef = useRef(focusMode);
  useEffect(() => { focusRef.current = focusMode; }, [focusMode]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000107);
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 2000);
    camera.position.set(0, 14, 34);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Starfield — a big cloud of tight white points scattered across a sphere.
    const starCount = 2200;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 400 + Math.random() * 600;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      starPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      starPos[i * 3 + 2] = r * Math.cos(ph);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.1, sizeAttenuation: false }));
    scene.add(stars);

    // Nebula — a looser, closer, colored particle field (additive blend for
    // glow) drifting slowly, so the backdrop reads as a living gas cloud
    // rather than a flat starfield.
    const nebCount = 900;
    const nebPos = new Float32Array(nebCount * 3);
    const nebCol = new Float32Array(nebCount * 3);
    const nebPalette = [new THREE.Color(0x8fd0ff), new THREE.Color(0xb98fe8), new THREE.Color(0xe86fb0), new THREE.Color(0x6fe0c8)];
    for (let i = 0; i < nebCount; i++) {
      const r = 60 + Math.random() * 220;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1) * 0.7 + Math.PI * 0.15; // flattened toward the ecliptic
      nebPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      nebPos[i * 3 + 1] = r * Math.cos(ph) * 0.4;
      nebPos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      const c = nebPalette[Math.floor(Math.random() * nebPalette.length)];
      nebCol[i * 3] = c.r; nebCol[i * 3 + 1] = c.g; nebCol[i * 3 + 2] = c.b;
    }
    const nebGeo = new THREE.BufferGeometry();
    nebGeo.setAttribute("position", new THREE.BufferAttribute(nebPos, 3));
    nebGeo.setAttribute("color", new THREE.BufferAttribute(nebCol, 3));
    const nebula = new THREE.Points(nebGeo, new THREE.PointsMaterial({
      size: 2.6, vertexColors: true, transparent: true, opacity: 0.45,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    }));
    scene.add(nebula);

    // The sun — emissive core + a light so the planets actually shade.
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(5, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffd27a })
    );
    scene.add(sun);
    const sunLight = new THREE.PointLight(0xfff2d0, 3.2, 0, 0);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x304060, 0.5));

    // "Data-stream" rings around the sun — each one visualizes a real
    // business channel (installs / open pipeline / fleet projects); its
    // emissive brightness is set once from the live bizData snapshot the
    // portal was opened with, not re-polled every frame (this is a mood
    // read of "how busy things are right now", not a dashboard).
    const streamRings = [
      { r: 7, tilt: 0.15, speed: 0.6, color: 0x2ee6ff },
      { r: 8.4, tilt: -0.28, speed: -0.42, color: 0xE4BC63 },
      { r: 9.8, tilt: 0.42, speed: 0.3, color: 0x3FD79A },
    ].map((s) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(s.r, 0.035, 8, 96),
        new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0.55 })
      );
      ring.rotation.x = Math.PI / 2 + s.tilt;
      scene.add(ring);
      return { mesh: ring, ...s };
    });

    const PLANETS = [
      { color: 0x8fd0ff, size: 0.9, dist: 11, speed: 0.55, tilt: 0.1 },
      { color: 0xe4a25a, size: 1.4, dist: 17, speed: 0.34, tilt: 0.04 },
      { color: 0x6fe0a0, size: 1.1, dist: 23, speed: 0.24, tilt: 0.18 },
      { color: 0xd06fe0, size: 1.7, dist: 30, speed: 0.16, tilt: 0.02 },
      { color: 0xe45a5a, size: 0.7, dist: 36, speed: 0.12, tilt: 0.12 },
    ];
    const planets = PLANETS.map((p) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(p.size, 24, 24),
        new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.7, metalness: 0.1 })
      );
      scene.add(mesh);
      const ringGeo = new THREE.RingGeometry(p.dist - 0.02, p.dist + 0.02, 96);
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.12, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2;
      scene.add(ring);
      return { mesh, angle: Math.random() * Math.PI * 2, ...p };
    });

    // Slow free-look: drag to orbit the camera around the sun.
    let dragging = false, lastX = 0, lastY = 0, az = 0.0, el = 0.38;
    const onDown = (e) => { dragging = true; const p = e.touches ? e.touches[0] : e; lastX = p.clientX; lastY = p.clientY; };
    const onMove = (e) => {
      if (!dragging) return;
      const p = e.touches ? e.touches[0] : e;
      az -= (p.clientX - lastX) * 0.005;
      el = Math.max(0.08, Math.min(1.3, el - (p.clientY - lastY) * 0.004));
      lastX = p.clientX; lastY = p.clientY;
    };
    const onUp = () => { dragging = false; };
    mount.addEventListener("mousedown", onDown);
    mount.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    mount.addEventListener("touchstart", onDown, { passive: true });
    mount.addEventListener("touchmove", onMove, { passive: true });
    mount.addEventListener("touchend", onUp);

    let raf = null;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      // Real load, not decoration — 1x at idle, up to 2.5x when the
      // business snapshot shows a lot of open work in flight.
      const loadMul = 1 + loadRef.current * 1.5;
      planets.forEach((p) => {
        p.angle += dt * p.speed * 0.2 * loadMul;
        p.mesh.position.set(Math.cos(p.angle) * p.dist, Math.sin(p.angle * 0.4) * p.dist * p.tilt, Math.sin(p.angle) * p.dist);
        p.mesh.rotation.y += dt * 0.3;
      });
      streamRings.forEach((s) => { s.mesh.rotation.z += dt * s.speed * loadMul; });
      nebula.rotation.y += dt * 0.006;
      sun.rotation.y += dt * 0.05;
      const focus = focusRef.current;
      const camDist = focus ? 30 : 48;
      camera.position.set(
        Math.cos(az) * Math.cos(el) * camDist,
        Math.sin(el) * camDist,
        Math.sin(az) * Math.cos(el) * camDist
      );
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      mount.removeEventListener("mousedown", onDown);
      mount.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      mount.removeEventListener("touchstart", onDown);
      mount.removeEventListener("touchmove", onMove);
      mount.removeEventListener("touchend", onUp);
      // The sun, stream rings, and all 5 planets + their orbit rings (10 more
      // geometry/material pairs) were never disposed here — only the two
      // particle-field geometries were, and not even their own materials.
      // Every Space-portal visit was leaking a full scene's worth of GPU
      // buffers. A generic traverse catches all of it, particle fields
      // included, instead of naming each mesh by hand.
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach(disposeMaterial);
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className={"off3-space-wrap" + (focusMode ? " focus" : "")}>
      <div ref={mountRef} className="off3-space-canvas" />
      {!focusMode && <div className="off3-space-hint">גרור כדי להביט מסביב · רחף בחלל בין כוכבי הלכת</div>}
      <button className="off3-space-focus" onClick={() => setFocusMode((v) => !v)} title="מצב פוקוס">
        {focusMode ? "⤢ יציאה ממצב פוקוס" : "⤡ מצב פוקוס"}
      </button>
      <button className="off3-space-return" onClick={onReturn}>🚪 חזרה למשרד</button>
    </div>
  );
}

// Procedural fighter-jet model — no external GLB (the old uploaded RQ-180
// model rendered as an unlit black slab, likely baked textures that never
// resolved; owner asked for a from-scratch build instead of debugging it).
// Delta wings + tail fin are flat extruded shapes (a real triangular
// silhouette, not a stretched box), fuselage/nose/canopy are primitives, all
// dressed with a small canvas panel-line + roundel texture for detail.
function buildJetSkinTexture(hex) {
  const cvs = document.createElement("canvas");
  cvs.width = 256; cvs.height = 256;
  const ctx = cvs.getContext("2d");
  const hexStr = "#" + new THREE.Color(hex).getHexString();
  ctx.fillStyle = hexStr; ctx.fillRect(0, 0, 256, 256);
  const rnd = mulberry32(31);
  // panel lines
  ctx.strokeStyle = "rgba(0,0,0,.22)"; ctx.lineWidth = 1.5;
  for (let i = 0; i < 14; i++) {
    ctx.beginPath();
    const y = rnd() * 256;
    ctx.moveTo(0, y); ctx.lineTo(256, y + (rnd() - 0.5) * 30);
    ctx.stroke();
  }
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    const x = rnd() * 256;
    ctx.moveTo(x, 0); ctx.lineTo(x + (rnd() - 0.5) * 20, 256);
    ctx.stroke();
  }
  // subtle weathering streaks
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(0,0,0,${(rnd() * 0.08).toFixed(3)})`;
    ctx.fillRect(rnd() * 256, rnd() * 256, 2 + rnd() * 3, 10 + rnd() * 40);
  }
  // roundel insignia
  ctx.save(); ctx.translate(128, 90);
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fillStyle = "#e4bc63"; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fillStyle = "#151a22"; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fillStyle = "#e4bc63"; ctx.fill();
  ctx.restore();
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
function jetWingShape(span, sweep, tipCut) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(span, -sweep);
  s.lineTo(span * tipCut, -sweep - 0.35);
  s.lineTo(0.25, -0.9);
  s.closePath();
  return s;
}
function buildFighterJet(hex) {
  const g = new THREE.Group();
  const skinTex = buildJetSkinTexture(hex);
  const bodyMat = new THREE.MeshStandardMaterial({ map: skinTex, roughness: 0.45, metalness: 0.6 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x20242b, roughness: 0.4, metalness: 0.7 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a3b52, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.78 });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xff7a2e });

  // Fuselage — tapered cylinder, nose toward -Z (matches the flight state's
  // forward-vector convention below: dir points -Z-ish at yaw 0).
  const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.58, 6.2, 16), bodyMat);
  fuse.rotation.x = Math.PI / 2;
  g.add(fuse);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.1, 16), darkMat);
  nose.rotation.x = -Math.PI / 2;
  nose.position.z = -3.65;
  g.add(nose);
  const tailCone = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.9, 16), darkMat);
  tailCone.rotation.x = Math.PI / 2;
  tailCone.position.z = 3.55;
  g.add(tailCone);
  // engine nozzle + afterburner glow disc
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.4, 16), darkMat);
  nozzle.rotation.x = Math.PI / 2;
  nozzle.position.z = 4.05;
  g.add(nozzle);
  const flame = new THREE.Mesh(new THREE.CircleGeometry(0.26, 16), glowMat);
  flame.position.z = 4.28;
  g.add(flame);

  // Bubble canopy over the cockpit.
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), glassMat);
  canopy.scale.set(1, 0.85, 1.9);
  canopy.position.set(0, 0.34, -1.3);
  g.add(canopy);

  // Delta main wings — flat extruded triangles, mirrored left/right.
  const wingGeo = new THREE.ExtrudeGeometry(jetWingShape(2.9, 0.6, 0.28), { depth: 0.07, bevelEnabled: false });
  wingGeo.rotateX(-Math.PI / 2);
  wingGeo.translate(0, -0.02, 0);
  [1, -1].forEach((side) => {
    const wing = new THREE.Mesh(wingGeo, darkMat);
    wing.position.set(side * 0.5, -0.05, 0.4);
    wing.scale.x = side;
    g.add(wing);
  });
  // Smaller horizontal stabilizers near the tail.
  const stabGeo = new THREE.ExtrudeGeometry(jetWingShape(1.3, 0.4, 0.2), { depth: 0.06, bevelEnabled: false });
  stabGeo.rotateX(-Math.PI / 2);
  [1, -1].forEach((side) => {
    const stab = new THREE.Mesh(stabGeo, darkMat);
    stab.position.set(side * 0.42, 0.05, 3.0);
    stab.scale.x = side;
    g.add(stab);
  });
  // Vertical tail fin — the same triangular shape, stood upright.
  const finGeo = new THREE.ExtrudeGeometry(jetWingShape(1.5, 0.55, 0.22), { depth: 0.07, bevelEnabled: false });
  finGeo.rotateY(Math.PI / 2);
  const fin = new THREE.Mesh(finGeo, bodyMat);
  fin.position.set(0, 0.35, 2.5);
  g.add(fin);

  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}

// Ground + sea beneath the flight scene: one big canvas-textured landmass
// (fields, forest patches, a river) whose texture alpha fades to transparent
// along one edge, layered a hair above a separate tiled sea plane so the two
// read as a real coastline instead of a single flat green square.
function buildFlightLandTexture() {
  const cvs = document.createElement("canvas");
  cvs.width = cvs.height = 1024;
  const ctx = cvs.getContext("2d");
  const grd = ctx.createLinearGradient(0, 0, 1024, 1024);
  grd.addColorStop(0, "#4d7a3f"); grd.addColorStop(0.55, "#5c8a46"); grd.addColorStop(1, "#7d8f4d");
  ctx.fillStyle = grd; ctx.fillRect(0, 0, 1024, 1024);
  const rnd = mulberry32(77);
  for (let i = 0; i < 260; i++) {
    const w = 40 + rnd() * 140, h = 40 + rnd() * 140;
    ctx.fillStyle = `hsl(${75 + rnd() * 45},${30 + rnd() * 25}%,${26 + rnd() * 20}%)`;
    ctx.fillRect(rnd() * 1024, rnd() * 1024, w, h);
  }
  for (let i = 0; i < 70; i++) {
    ctx.fillStyle = `rgba(28,58,24,${(0.3 + rnd() * 0.3).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(rnd() * 1024, rnd() * 1024, 20 + rnd() * 60, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = "rgba(100,150,195,.55)"; ctx.lineWidth = 7;
  ctx.beginPath();
  let rx = 0, ry = 250 + rnd() * 300;
  ctx.moveTo(rx, ry);
  while (rx < 1024) { rx += 30 + rnd() * 35; ry += (rnd() - 0.5) * 90; ctx.lineTo(rx, ry); }
  ctx.stroke();
  // coastline fade: solid land for ~62% of the plane, transparent past that
  // so the sea mesh underneath shows through with a soft edge, not a seam.
  const mask = ctx.createLinearGradient(1024 * 0.58, 0, 1024, 0);
  mask.addColorStop(0, "rgba(255,255,255,1)");
  mask.addColorStop(0.18, "rgba(255,255,255,1)");
  mask.addColorStop(1, "rgba(255,255,255,0)");
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = mask; ctx.fillRect(0, 0, 1024, 1024);
  ctx.globalCompositeOperation = "source-over";
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
function buildFlightSeaTexture() {
  const cvs = document.createElement("canvas");
  cvs.width = cvs.height = 256;
  const ctx = cvs.getContext("2d");
  const grd = ctx.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, "#1d5d87"); grd.addColorStop(1, "#0f3452");
  ctx.fillStyle = grd; ctx.fillRect(0, 0, 256, 256);
  const rnd = mulberry32(4);
  ctx.strokeStyle = "rgba(255,255,255,.14)"; ctx.lineWidth = 2;
  for (let i = 0; i < 46; i++) {
    const y = rnd() * 256;
    ctx.beginPath();
    for (let x = 0; x <= 256; x += 16) ctx.lineTo(x, y + Math.sin(x * 0.05 + i) * 5);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(24, 24);
  return tex;
}

// A real flyable flight simulator — its own self-contained scene/camera/
// render-loop (same pattern as SpaceOverlay above), entered from the plane's
// showroom spot near a window. Arcade flight model (pitch/roll/yaw +
// throttle, no stall/lift physics) over an open sky with clouds and a real
// ground-and-sea coastline far below, chase camera, and a full instrument
// HUD (speed, altitude, heading, vertical speed, throttle, artificial horizon).
function FlightOverlay({ onReturn }) {
  const mountRef = useRef(null);
  const speedRef = useRef(null);
  const altRef = useRef(null);
  const hdgRef = useRef(null);
  const vspeedRef = useRef(null);
  const throttleRef = useRef(null);
  const horizonRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let cancelled = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8fc7ef);
    scene.fog = new THREE.Fog(0xbfe3ff, 200, 2600);

    const camera = new THREE.PerspectiveCamera(68, mount.clientWidth / mount.clientHeight, 0.5, 6000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const sun = new THREE.DirectionalLight(0xffffff, 1.3);
    sun.position.set(400, 600, 200);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 900;
    // Cheap stand-in for a full cascaded-shadow-map/LOD terrain system: the
    // sun's shadow frustum is small (just enough to cover the jet) and gets
    // re-centered on the jet's own XZ position every frame further down, so
    // it stays sharp right under the aircraft without the cost of shadowing
    // the entire multi-thousand-unit coastline.
    const SHADOW_SPAN = 140;
    sun.shadow.camera.left = -SHADOW_SPAN;
    sun.shadow.camera.right = SHADOW_SPAN;
    sun.shadow.camera.top = SHADOW_SPAN;
    sun.shadow.camera.bottom = -SHADOW_SPAN;
    sun.shadow.camera.updateProjectionMatrix();
    sun.target.position.set(0, 0, 0);
    scene.add(sun);
    scene.add(sun.target);
    scene.add(new THREE.AmbientLight(0xbcd6ff, 0.55));

    // Ground far below: a real coastline, not a flat green square — a wide
    // sea plane everywhere, with a textured landmass laid a hair above it
    // whose texture fades to transparent along one edge, so a stretch of sea
    // is always visible past the coast no matter which way you fly.
    const sea = new THREE.Mesh(
      new THREE.PlaneGeometry(9000, 9000),
      new THREE.MeshStandardMaterial({ map: buildFlightSeaTexture(), roughness: 0.25, metalness: 0.15 })
    );
    sea.rotation.x = -Math.PI / 2;
    sea.position.y = -300;
    sea.receiveShadow = true;
    scene.add(sea);
    const land = new THREE.Mesh(
      new THREE.PlaneGeometry(6000, 9000),
      new THREE.MeshStandardMaterial({ map: buildFlightLandTexture(), roughness: 0.95, transparent: true })
    );
    land.rotation.x = -Math.PI / 2;
    land.position.set(-1200, -299, 0);
    land.receiveShadow = true;
    scene.add(land);

    // Soft round cloud sprites scattered through the sky at varying altitude.
    const cloudCvs = document.createElement("canvas");
    cloudCvs.width = cloudCvs.height = 128;
    const cctx = cloudCvs.getContext("2d");
    const cg = cctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    cg.addColorStop(0, "rgba(255,255,255,0.95)"); cg.addColorStop(1, "rgba(255,255,255,0)");
    cctx.fillStyle = cg; cctx.fillRect(0, 0, 128, 128);
    const cloudTex = new THREE.CanvasTexture(cloudCvs);
    const cloudMat = new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0.85, depthWrite: false });
    for (let i = 0; i < 140; i++) {
      const spr = new THREE.Sprite(cloudMat);
      spr.position.set((Math.random() - 0.5) * 4000, Math.random() * 350 - 60, (Math.random() - 0.5) * 4000);
      const s = 60 + Math.random() * 180;
      spr.scale.set(s * 1.6, s, 1);
      scene.add(spr);
    }

    // The plane itself — a procedurally built fighter jet (see buildFighterJet
    // above), always visible immediately with no network/model-load step.
    const plane = new THREE.Group();
    scene.add(plane);
    const jetMesh = buildFighterJet(0x64707d);
    jetMesh.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    plane.add(jetMesh);

    // Flight state — a lightweight analytic thrust/drag/lift model rather
    // than a full rigid-body physics engine (no other part of this app pulls
    // in a physics library, and this is one arcade mini-mode inside a much
    // bigger sim — a proper Cannon-es/Rapier integration would be a large,
    // separate undertaking for a small slice of the experience). Throttle
    // builds thrust, drag grows with the square of speed, and climbing at
    // low speed genuinely costs you energy (a soft stall) instead of a flat
    // pitch→climb mapping, so the stick has real weight without needing a
    // full rigid-body solver.
    const st = { x: 0, y: 120, z: 0, pitch: 0, roll: 0, yaw: 0, speed: 55, throttle: 0.55 };
    const keys = {};
    const onKeyDown = (e) => { keys[e.key.toLowerCase()] = true; };
    const onKeyUp = (e) => { keys[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // Gamepad — same "only trust a real gamepadconnected event" guard used by
    // the main office scene, so a phantom/stale pad entry can never fly the
    // jet on its own. Deadzone tight (0.05) with a cubic response curve: fine
    // control near center, full authority pushed to the edges — standard
    // flight-stick feel instead of the office scene's linear walk deadzone.
    let gamepadIndex = null;
    // Only accept a standard-mapping pad — some Windows HID peripherals
    // (wireless mouse/keyboard dongles, headset controls) fire a genuine
    // "gamepadconnected" event with a non-standard mapping and drifting
    // axis values, which without this check gets treated as a real
    // controller and spins the camera on its own with nothing plugged in.
    const onGpConnect = (e) => { if (e.gamepad.mapping === "standard") gamepadIndex = e.gamepad.index; };
    const onGpDisconnect = (e) => { if (gamepadIndex === e.gamepad.index) gamepadIndex = null; };
    window.addEventListener("gamepadconnected", onGpConnect);
    window.addEventListener("gamepaddisconnected", onGpDisconnect);
    try {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (const g of pads) { if (g && g.connected && g.mapping === "standard") { gamepadIndex = g.index; break; } }
    } catch {}
    const GP_DEADZONE = 0.05;
    const gpCurve = (v) => {
      const s = v < 0 ? -1 : 1, a = Math.min(1, Math.abs(v));
      if (a < GP_DEADZONE) return 0;
      const remapped = (a - GP_DEADZONE) / (1 - GP_DEADZONE);
      return s * remapped * remapped * remapped; // cubic = gentle near center, sharp at the edges
    };

    const clock = new THREE.Clock();
    let raf;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const animate = () => {
      if (cancelled) return;
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.05, clock.getDelta());

      const gp = (gamepadIndex !== null && navigator.getGamepads) ? navigator.getGamepads()[gamepadIndex] : null;
      const kPitch = (keys["s"] || keys["arrowdown"] ? 1 : 0) - (keys["w"] || keys["arrowup"] ? 1 : 0);
      const kRoll = (keys["d"] || keys["arrowright"] ? 1 : 0) - (keys["a"] || keys["arrowleft"] ? 1 : 0);
      const kThrottle = (keys["shift"] ? 1 : 0) - (keys["control"] ? 1 : 0);
      const gpPitch = gp ? gpCurve(gp.axes[1] || 0) : 0;
      const gpRoll = gp ? gpCurve(gp.axes[0] || 0) : 0;
      const gpThrottle = gp ? ((gp.buttons[7] ? gp.buttons[7].value : 0) - (gp.buttons[6] ? gp.buttons[6].value : 0)) : 0;
      const pitchIn = kPitch || gpPitch;
      const rollIn = kRoll || gpRoll;
      const throttleIn = kThrottle || gpThrottle;

      // Soft stall: below STALL_SPD, nose-up authority mushes out and altitude
      // bleeds off even while climbing — pulling the stick at low speed costs
      // you instead of being a free, instant climb.
      const STALL_SPD = 42;
      const stallT = clamp((STALL_SPD - st.speed) / STALL_SPD, 0, 1);
      const pitchAuthority = 1 - stallT * 0.6;
      st.pitch = clamp(st.pitch + pitchIn * pitchAuthority * dt * 0.7, -0.85, 0.85);
      st.roll = clamp(st.roll + rollIn * dt * 1.4 - st.roll * dt * 0.8 + (stallT > 0.3 ? (Math.random() - 0.5) * stallT * 0.5 : 0), -1.1, 1.1);
      st.yaw += st.roll * dt * 0.5;

      const dir = new THREE.Vector3(
        Math.sin(st.yaw) * Math.cos(st.pitch),
        Math.sin(st.pitch),
        Math.cos(st.yaw) * Math.cos(st.pitch)
      );

      // Thrust/drag: throttle builds thrust, drag grows with speed squared,
      // and climbing/diving trades speed for altitude (and back) instead of
      // altitude being free. Arcade-simple, but no longer floaty.
      st.throttle = clamp(st.throttle + throttleIn * dt * 0.7, 0.1, 1);
      const THRUST_MAX = 70, DRAG_K = 0.0026, MIN_SPEED = 18, MAX_SPEED = 168;
      const thrustAccel = st.throttle * THRUST_MAX;
      const dragAccel = st.speed * st.speed * DRAG_K;
      const gravityAccel = -dir.y * 26;
      st.speed = clamp(st.speed + (thrustAccel - dragAccel + gravityAccel) * dt, MIN_SPEED, MAX_SPEED);

      st.x += dir.x * st.speed * dt;
      st.y += dir.y * st.speed * dt - stallT * 14 * dt;
      st.z += dir.z * st.speed * dt;
      st.y = clamp(st.y, 8, 900);

      plane.position.set(st.x, st.y, st.z);
      plane.rotation.order = "YXZ";
      plane.rotation.y = st.yaw + Math.PI;
      plane.rotation.x = -st.pitch;
      plane.rotation.z = -st.roll;

      const behind = dir.clone().multiplyScalar(-16);
      const desired = plane.position.clone().add(behind).add(new THREE.Vector3(0, 4.5, 0));
      camera.position.lerp(desired, Math.min(1, dt * 4));
      camera.up.set(0, 1, 0);
      camera.lookAt(plane.position.clone().add(dir.clone().multiplyScalar(20)));

      // Shadow frustum rides along with the jet (see the SHADOW_SPAN comment
      // at setup) instead of trying to cover the whole coastline.
      sun.target.position.set(st.x, st.y, st.z);
      sun.position.set(st.x + 260, st.y + 420, st.z + 140);

      // Atmospheric depth-fog reacts to altitude — hazy and close-in down
      // low, progressively clearer and farther-reaching up high.
      const altT = clamp((st.y - 8) / (700 - 8), 0, 1);
      scene.fog.near = 60 + altT * 380;
      scene.fog.far = 1100 + altT * 2400;
      scene.fog.color.setHSL(0.58, 0.5, 0.6 + altT * 0.12);

      if (speedRef.current) speedRef.current.textContent = Math.round(st.speed * 6) + " קמ״ש";
      if (altRef.current) altRef.current.textContent = Math.round(st.y) + " מ'";
      if (hdgRef.current) hdgRef.current.textContent = Math.round(((st.yaw * 180 / Math.PI) % 360 + 360) % 360) + "°";
      if (vspeedRef.current) {
        const vs = Math.round(dir.y * st.speed * 6);
        vspeedRef.current.textContent = (vs > 0 ? "+" : "") + vs + " מ׳/ש";
      }
      if (throttleRef.current) {
        const pct = clamp((st.speed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED), 0, 1);
        throttleRef.current.style.height = Math.round(pct * 100) + "%";
      }
      // Artificial horizon: a rolling/pitching sky-ground disc behind a fixed
      // aircraft reference chevron — the one instrument every real HUD has.
      const hz = horizonRef.current;
      if (hz) {
        const hctx = hz.getContext("2d");
        const W = hz.width, H = hz.height, cx = W / 2, cy = H / 2, R = W / 2 - 3;
        hctx.clearRect(0, 0, W, H);
        hctx.save();
        hctx.beginPath(); hctx.arc(cx, cy, R, 0, Math.PI * 2); hctx.clip();
        hctx.translate(cx, cy);
        hctx.rotate(-st.roll);
        hctx.translate(0, st.pitch * 130);
        hctx.fillStyle = "#2b6cb0"; hctx.fillRect(-W * 1.4, -H * 3, W * 2.8, H * 3);
        hctx.fillStyle = "#6b4a2b"; hctx.fillRect(-W * 1.4, 0, W * 2.8, H * 3);
        hctx.strokeStyle = "#eef6ff"; hctx.lineWidth = 2.5;
        hctx.beginPath(); hctx.moveTo(-W * 1.4, 0); hctx.lineTo(W * 1.4, 0); hctx.stroke();
        hctx.restore();
        hctx.strokeStyle = "rgba(230,240,255,.55)"; hctx.lineWidth = 2;
        hctx.beginPath(); hctx.arc(cx, cy, R, 0, Math.PI * 2); hctx.stroke();
        hctx.strokeStyle = "#ffd23f"; hctx.lineWidth = 3;
        hctx.beginPath(); hctx.moveTo(cx - R * 0.5, cy); hctx.lineTo(cx - R * 0.15, cy); hctx.stroke();
        hctx.beginPath(); hctx.moveTo(cx + R * 0.15, cy); hctx.lineTo(cx + R * 0.5, cy); hctx.stroke();
        hctx.beginPath(); hctx.moveTo(cx, cy); hctx.lineTo(cx, cy - R * 0.22); hctx.stroke();
      }

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("gamepadconnected", onGpConnect);
      window.removeEventListener("gamepaddisconnected", onGpDisconnect);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach(disposeMaterial);
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="off3-space-wrap">
      <div ref={mountRef} className="off3-space-canvas" style={{ cursor: "default" }} />
      <div className="off3-space-hint">W/S להטיה · A/D לגלגול ופנייה · Shift/Ctrl להאצה ולהאטה · תמיכה בג'ויסטיק</div>
      <canvas ref={horizonRef} width={120} height={120} className="off3-flight-horizon" />
      <div className="off3-flight-hud">
        <div><span>מהירות</span><b ref={speedRef}>0 קמ״ש</b></div>
        <div><span>גובה</span><b ref={altRef}>0 מ'</b></div>
        <div><span>כיוון</span><b ref={hdgRef}>0°</b></div>
        <div><span>קצב טיפוס</span><b ref={vspeedRef}>0 מ׳/ש</b></div>
      </div>
      <div className="off3-flight-throttle" title="מצערת">
        <i ref={throttleRef} />
      </div>
      <button className="off3-space-return" onClick={onReturn}>🚪 חזרה למשרד</button>
    </div>
  );
}

// Procedural corrugated-metal wall texture for the hangar — vertical ridge
// shading + a hazard stripe near the floor, same canvas-texture convention
// as every other surface in this file (no external image assets).
function buildHangarWallTexture() {
  const cvs = document.createElement("canvas");
  cvs.width = 256; cvs.height = 512;
  const ctx = cvs.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, "#3a3f47"); g.addColorStop(1, "#22262c");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 512);
  // Corrugation: repeating vertical ridge highlight/shadow pairs.
  for (let x = 0; x < 256; x += 16) {
    ctx.fillStyle = "rgba(255,255,255,.06)"; ctx.fillRect(x, 0, 6, 512);
    ctx.fillStyle = "rgba(0,0,0,.18)"; ctx.fillRect(x + 6, 0, 6, 512);
  }
  // Rust/streak accents.
  const rnd = mulberry32(11);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(120,70,40,${(rnd() * 0.12).toFixed(3)})`;
    ctx.fillRect(rnd() * 256, 0, 3 + rnd() * 5, 512 * (0.2 + rnd() * 0.6));
  }
  // Hazard stripe band near the floor.
  const bandY = 512 - 46;
  ctx.fillStyle = "#e8b93c";
  ctx.fillRect(0, bandY, 256, 46);
  ctx.fillStyle = "#141414";
  for (let x = -46; x < 256 + 46; x += 46) {
    ctx.save(); ctx.beginPath();
    ctx.moveTo(x, bandY + 46); ctx.lineTo(x + 23, bandY); ctx.lineTo(x + 46, bandY); ctx.lineTo(x + 23 + 23, bandY + 46);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = MAX_ANISO;
  return tex;
}

// Sealed concrete floor — subtle mottling + a few painted parking-bay
// rectangles, drawn once and tiled across the whole hangar slab.
function buildHangarFloorTexture() {
  const cvs = document.createElement("canvas");
  cvs.width = cvs.height = 512;
  const ctx = cvs.getContext("2d");
  ctx.fillStyle = "#3d4147"; ctx.fillRect(0, 0, 512, 512);
  const rnd = mulberry32(23);
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = rnd() < 0.5 ? `rgba(255,255,255,${(rnd() * 0.03).toFixed(3)})` : `rgba(0,0,0,${(rnd() * 0.05).toFixed(3)})`;
    ctx.fillRect(rnd() * 512, rnd() * 512, 1 + rnd() * 2, 1 + rnd() * 2);
  }
  ctx.strokeStyle = "#e8b93c"; ctx.lineWidth = 5;
  ctx.strokeRect(30, 30, 452, 452);
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = MAX_ANISO;
  return tex;
}

// Clapboard-siding texture with a painted trim band — the house's upgraded
// wall material (was a flat noisy tint before).
function buildHouseSidingTexture() {
  const cvs = document.createElement("canvas");
  cvs.width = 256; cvs.height = 256;
  const ctx = cvs.getContext("2d");
  ctx.fillStyle = "#d8c9a8"; ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 14) {
    ctx.strokeStyle = "rgba(0,0,0,.12)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.15)"; ctx.beginPath(); ctx.moveTo(0, y + 1.5); ctx.lineTo(256, y + 1.5); ctx.stroke();
  }
  const rnd = mulberry32(31);
  for (let i = 0; i < 500; i++) {
    ctx.fillStyle = `rgba(0,0,0,${(rnd() * 0.05).toFixed(3)})`;
    ctx.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 2, 1);
  }
  ctx.fillStyle = "#6b4a35"; ctx.fillRect(0, 228, 256, 28); // baseboard trim
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = MAX_ANISO;
  return tex;
}
// Wood-shingle roof texture — rows of overlapping shingle tabs instead of a
// flat brown cone.
function buildHouseShingleTexture() {
  const cvs = document.createElement("canvas");
  cvs.width = 256; cvs.height = 256;
  const ctx = cvs.getContext("2d");
  ctx.fillStyle = "#4a3226"; ctx.fillRect(0, 0, 256, 256);
  const rnd = mulberry32(9);
  for (let row = 0; row < 16; row++) {
    const y = row * 16;
    for (let col = 0; col < 12; col++) {
      const x = col * 22 + (row % 2 ? 11 : 0);
      const shade = 0.85 + rnd() * 0.3;
      ctx.fillStyle = `rgb(${Math.round(74 * shade)},${Math.round(50 * shade)},${Math.round(38 * shade)})`;
      ctx.fillRect(x, y, 20, 14);
      ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.strokeRect(x, y, 20, 14);
    }
  }
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = MAX_ANISO;
  return tex;
}

// A real (if still procedural) house exterior beyond the hangar's open bay
// door — upgraded from the original bare box+cone placeholder to a proper
// clapboard cottage: covered porch with posts and steps, a real framed door
// with a handle, mullioned windows with flower boxes, a shingled roof with a
// smoking chimney, a perimeter fence, and landscaping (bushes + a tree).
function buildHouseExterior() {
  const g = new THREE.Group();
  const sidingTex = buildHouseSidingTexture();
  const W = 9, D = 8, H = 4.4;
  const wallMat = new THREE.MeshStandardMaterial({ map: sidingTex, roughness: 0.85 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), wallMat);
  body.position.y = H / 2; body.castShadow = true; body.receiveShadow = true;
  g.add(body);

  const roofMat = new THREE.MeshStandardMaterial({ map: buildHouseShingleTexture(), roughness: 0.9 });
  const roof = new THREE.Mesh(new THREE.ConeGeometry(7.2, 2.8, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = H + 1.4;
  roof.castShadow = true;
  g.add(roof);

  // Chimney + a soft drifting smoke puff (sprite trail, not a full particle
  // system — cheap and reads fine from yard distance).
  const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x7a5a48, roughness: 0.8 });
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.2, 0.7), chimneyMat);
  chimney.position.set(W / 2 - 1.6, H + 1.6, -D / 2 + 1.6);
  chimney.castShadow = true;
  g.add(chimney);
  const smokeCvs = document.createElement("canvas");
  smokeCvs.width = smokeCvs.height = 64;
  const sctx = smokeCvs.getContext("2d");
  const sg = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  sg.addColorStop(0, "rgba(220,220,225,.55)"); sg.addColorStop(1, "rgba(220,220,225,0)");
  sctx.fillStyle = sg; sctx.fillRect(0, 0, 64, 64);
  const smokeTex = new THREE.CanvasTexture(smokeCvs);
  const smokeMat = new THREE.SpriteMaterial({ map: smokeTex, transparent: true, opacity: 0.5, depthWrite: false });
  const smokePuffs = [];
  for (let i = 0; i < 5; i++) {
    const puff = new THREE.Sprite(smokeMat);
    puff.position.set(chimney.position.x, chimney.position.y + 1.2 + i * 0.5, chimney.position.z);
    puff.scale.setScalar(0.5 + i * 0.25);
    puff.userData.phase = i * 1.3;
    g.add(puff);
    smokePuffs.push(puff);
  }
  g.userData.smokePuffs = smokePuffs;

  // Covered porch — roof overhang on two posts, three steps up to the door.
  const porchPostMat = new THREE.MeshStandardMaterial({ color: 0xf3ead6, roughness: 0.6 });
  [-1, 1].forEach((s) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.6, 10), porchPostMat);
    post.position.set(s * 1.7, 1.3, -D / 2 - 1.3);
    post.castShadow = true;
    g.add(post);
  });
  const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 2.0), new THREE.MeshStandardMaterial({ color: 0x6b4a35, roughness: 0.8 }));
  porchRoof.position.set(0, 2.65, -D / 2 - 1.3);
  porchRoof.castShadow = true;
  g.add(porchRoof);
  const porchFloor = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.15, 2.2), new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.75 }));
  porchFloor.position.set(0, 0.08, -D / 2 - 1.3);
  porchFloor.receiveShadow = true;
  g.add(porchFloor);
  for (let i = 0; i < 3; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(2.4 - i * 0.3, 0.14, 0.5), new THREE.MeshStandardMaterial({ color: 0x9a8060, roughness: 0.8 }));
    step.position.set(0, -0.08 - i * 0.15, -D / 2 - 2.4 - i * 0.5);
    g.add(step);
  }

  // Real framed door with a handle + porch light above it.
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 0.12), new THREE.MeshStandardMaterial({ color: 0xf3ead6, roughness: 0.6 }));
  doorFrame.position.set(0, 1.25, -D / 2 - 0.06);
  g.add(doorFrame);
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.25, 2.3, 0.08), new THREE.MeshStandardMaterial({ color: 0x5a2e1f, roughness: 0.55, metalness: 0.1 }));
  door.position.set(0, 1.15, -D / 2 - 0.02);
  g.add(door);
  const handle = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshStandardMaterial({ color: 0xe8c96a, metalness: 0.8, roughness: 0.3 }));
  handle.position.set(0.45, 1.15, -D / 2 + 0.05);
  g.add(handle);
  const porchLight = new THREE.PointLight(0xffd9a0, 0.7, 5);
  porchLight.position.set(0, 2.5, -D / 2 - 1.2);
  g.add(porchLight);
  const porchLightFixture = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe9b8 }));
  porchLightFixture.position.copy(porchLight.position);
  g.add(porchLightFixture);

  // Mullioned windows with flower boxes, either side of the porch.
  [-1, 1].forEach((s) => {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xf3ead6, roughness: 0.6 });
    const winFrame = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 0.1), frameMat);
    winFrame.position.set(s * 2.8, 2.4, -D / 2 - 0.05);
    g.add(winFrame);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshStandardMaterial({ color: 0xffdf8c, emissive: 0xffcf6a, emissiveIntensity: 1.3 }));
    win.position.set(s * 2.8, 2.4, -D / 2 - 0.001);
    g.add(win);
    // cross mullion
    const mullH = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.05, 0.02), frameMat);
    const mullV = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.12, 0.02), frameMat);
    mullH.position.set(s * 2.8, 2.4, -D / 2 - 0.01); mullV.position.set(s * 2.8, 2.4, -D / 2 - 0.01);
    g.add(mullH); g.add(mullV);
    const light = new THREE.PointLight(0xffcf8a, 0.5, 6);
    light.position.set(s * 2.8, 2.4, -D / 2 - 0.6);
    g.add(light);
    // flower box + a few procedural blooms
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 0.3), new THREE.MeshStandardMaterial({ color: 0x5a3a28, roughness: 0.8 }));
    box.position.set(s * 2.8, 1.7, -D / 2 - 0.25);
    g.add(box);
    const bloomColors = [0xff6b9d, 0xffd23f, 0xff8c42];
    for (let i = 0; i < 5; i++) {
      const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), new THREE.MeshStandardMaterial({ color: bloomColors[i % bloomColors.length], roughness: 0.6 }));
      bloom.position.set(s * 2.8 - 0.5 + i * 0.25, 1.85, -D / 2 - 0.25 + (i % 2 ? 0.08 : -0.08));
      g.add(bloom);
    }
  });

  // Landscaping — a tree + a few bushes flanking the porch.
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x3a6b3f, roughness: 0.9 });
  [[-3.4, -D / 2 - 0.5], [3.4, -D / 2 - 0.5], [-4.2, -D / 2 + 1.5]].forEach(([x, z]) => {
    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.55 + Math.random() * 0.15, 10, 8), bushMat);
    bush.position.set(x, 0.5, z); bush.scale.y = 0.8;
    bush.castShadow = true; bush.receiveShadow = true;
    g.add(bush);
  });
  const treeTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 3.2, 10), new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.85 }));
  treeTrunk.position.set(5.5, 1.6, -D / 2 - 3);
  treeTrunk.castShadow = true;
  g.add(treeTrunk);
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2f6b3a, roughness: 0.9 });
  [[0, 3.6, 0, 1.4], [0.6, 3.9, 0.4, 1.05], [-0.5, 4.0, -0.3, 1.0]].forEach(([dx, y, dz, r]) => {
    const foliage = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), foliageMat);
    foliage.position.set(5.5 + dx, y, -D / 2 - 3 + dz);
    foliage.castShadow = true;
    g.add(foliage);
  });

  // A little patch of ground + a path leading back toward the hangar.
  const yard = new THREE.Mesh(new THREE.CircleGeometry(16, 24), new THREE.MeshStandardMaterial({ color: 0x2f5c3a, roughness: 1 }));
  yard.rotation.x = -Math.PI / 2; yard.position.y = -0.02; yard.receiveShadow = true;
  g.add(yard);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(3, 20), new THREE.MeshStandardMaterial({ color: 0x8a8478, roughness: 1 }));
  path.rotation.x = -Math.PI / 2; path.position.set(0, -0.01, -D / 2 - 10);
  g.add(path);

  // A simple perimeter fence around the front yard — evenly spaced posts +
  // horizontal rails, three sides (the hangar-facing side stays open).
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0xece2cc, roughness: 0.7 });
  const fenceRadius = 9.5;
  const postCount = 22;
  for (let i = 0; i <= postCount; i++) {
    const a = (i / postCount) * Math.PI * 1.5 - Math.PI * 0.75; // 270° arc, open toward +Z (hangar side)
    const x = Math.sin(a) * fenceRadius, z = Math.cos(a) * fenceRadius - D / 2 - 2;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 0.1), fenceMat);
    post.position.set(x, 0.45, z);
    g.add(post);
  }
  return g;
}

// ── Pokémon Sanctuary — a small landscaped habitat beside the house, built
// from the project's real Gen-1 GLB library (public/ar-models/, plus the
// separately-hosted pikachu.glb) rather than placeholders. Each creature is
// normalized to a friendly, human-scale size and given a gentle idle bob so
// the area doesn't read as a static diorama.
const POKEMON_SANCTUARY_ROSTER = [
  { file: "pikachu.glb", root: true, scale: 0.7 },
  { file: "eevee.glb", scale: 0.75 },
  { file: "bulbasaur.glb", scale: 0.75 },
  { file: "squirtle.glb", scale: 0.7 },
  { file: "charmander.glb", scale: 0.75 },
  { file: "jigglypuff.glb", scale: 0.65 },
  { file: "meowth.glb", scale: 0.75 },
  { file: "snorlax.glb", scale: 1.6 },
  { file: "dratini.glb", scale: 0.9 },
  { file: "clefairy.glb", scale: 0.7 },
  { file: "vulpix.glb", scale: 0.8 },
  { file: "growlithe.glb", scale: 0.95 },
  { file: "ditto.glb", scale: 0.6 },
];
function buildPokemonSanctuary(loader, base, center) {
  const group = new THREE.Group();
  group.position.set(center.x, 0, center.z);
  const bobbers = [];
  // A soft ring fence + a "פינת פוקימון" sign so this reads as a deliberate
  // habitat, not stray assets scattered on the lawn.
  const ringMat = new THREE.MeshStandardMaterial({ color: 0xece2cc, roughness: 0.7 });
  const RING_R = 7.5;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8), ringMat);
    post.position.set(Math.cos(a) * RING_R, 0.3, Math.sin(a) * RING_R);
    group.add(post);
  }
  const signPlate = buildTinyLabelSprite("⚡", "#ffd23f");
  signPlate.position.set(0, 2.6, -RING_R - 0.5);
  signPlate.scale.set(1.1, 1.1, 1);
  group.add(signPlate);

  const slots = POKEMON_SANCTUARY_ROSTER.length;
  POKEMON_SANCTUARY_ROSTER.forEach((p, i) => {
    const a = (i / slots) * Math.PI * 2;
    const r = 3.5 + (i % 3) * 1.3;
    const px = Math.cos(a) * r, pz = Math.sin(a) * r;
    const url = (p.root ? base : base + "ar-models/") + p.file;
    loader.load(url, (g) => {
      const m = g.scene;
      m.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      const bb = new THREE.Box3().setFromObject(m);
      const size = bb.getSize(new THREE.Vector3());
      const scaleF = p.scale / Math.max(size.y || 0.01, 0.01);
      m.scale.setScalar(scaleF);
      const bb2 = new THREE.Box3().setFromObject(m);
      m.position.x -= (bb2.min.x + bb2.max.x) / 2;
      m.position.z -= (bb2.min.z + bb2.max.z) / 2;
      m.position.y -= bb2.min.y;
      const wrap = new THREE.Group();
      wrap.add(m);
      wrap.position.set(px, 0, pz);
      wrap.rotation.y = Math.random() * Math.PI * 2;
      wrap.userData.bobPhase = i * 0.7;
      wrap.userData.baseY = 0;
      group.add(wrap);
      bobbers.push(wrap);
    }, undefined, () => {});
  });
  group.userData.bobbers = bobbers;
  return group;
}

// ── Driving mini-mode helpers ────────────────────────────────────────────
// A closed-loop "proving ground" oval — two straights joined by two
// semicircular turns — rather than an open/infinite road: no streaming or
// procedural-generation complexity, the car never runs out of track, and a
// fixed layout can be decorated consistently (curbs, lamp posts, trees) all
// the way around.
const TRACK_STRAIGHT = 70, TRACK_RADIUS = 20, TRACK_WIDTH = 9;
const TRACK_LENGTH = 2 * TRACK_STRAIGHT + 2 * Math.PI * TRACK_RADIUS;
// Centerline sample, evenly spaced by arc length around the whole loop.
function buildTrackCenterline(n) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const s = (i / n) * TRACK_LENGTH;
    let x, z;
    if (s < TRACK_STRAIGHT) {
      x = -TRACK_STRAIGHT / 2 + s; z = -TRACK_RADIUS;
    } else if (s < TRACK_STRAIGHT + Math.PI * TRACK_RADIUS) {
      const a = -Math.PI / 2 + (s - TRACK_STRAIGHT) / TRACK_RADIUS;
      x = TRACK_STRAIGHT / 2 + Math.cos(a) * TRACK_RADIUS; z = Math.sin(a) * TRACK_RADIUS;
    } else if (s < 2 * TRACK_STRAIGHT + Math.PI * TRACK_RADIUS) {
      const s2 = s - (TRACK_STRAIGHT + Math.PI * TRACK_RADIUS);
      x = TRACK_STRAIGHT / 2 - s2; z = TRACK_RADIUS;
    } else {
      const s2 = s - (2 * TRACK_STRAIGHT + Math.PI * TRACK_RADIUS);
      const a = Math.PI / 2 + s2 / TRACK_RADIUS;
      x = -TRACK_STRAIGHT / 2 + Math.cos(a) * TRACK_RADIUS; z = Math.sin(a) * TRACK_RADIUS;
    }
    pts.push({ x, z });
  }
  return pts;
}
// Asphalt + dashed centerline + red/white curb stripes, sampled once and
// repeated along the ribbon via wrapT — the road's actual visual detail
// lives entirely in this texture rather than extra curb/line geometry.
function buildTrackTexture() {
  const cvs = document.createElement("canvas");
  cvs.width = 128; cvs.height = 512;
  const ctx = cvs.getContext("2d");
  ctx.fillStyle = "#33363b"; ctx.fillRect(0, 0, 128, 512);
  const rnd = mulberry32(71);
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = rnd() < 0.5 ? `rgba(255,255,255,${(rnd() * 0.04).toFixed(3)})` : `rgba(0,0,0,${(rnd() * 0.06).toFixed(3)})`;
    ctx.fillRect(rnd() * 128, rnd() * 512, 1 + rnd() * 2, 1 + rnd() * 2);
  }
  // Dashed centerline
  ctx.fillStyle = "#f2e6a8";
  for (let y = 0; y < 512; y += 64) ctx.fillRect(60, y, 8, 36);
  // Curb stripes along both edges (red/white)
  for (let side = 0; side < 2; side++) {
    const x0 = side === 0 ? 0 : 118;
    for (let y = 0; y < 512; y += 48) {
      ctx.fillStyle = (Math.floor(y / 48) % 2 === 0) ? "#c23b2e" : "#eef0ef";
      ctx.fillRect(x0, y, 10, 48);
    }
  }
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = THREE.ClampToEdgeWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = MAX_ANISO;
  return tex;
}
function buildGrassTexture() {
  const cvs = document.createElement("canvas");
  cvs.width = cvs.height = 256;
  const ctx = cvs.getContext("2d");
  ctx.fillStyle = "#3a5c34"; ctx.fillRect(0, 0, 256, 256);
  const rnd = mulberry32(19);
  for (let i = 0; i < 2200; i++) {
    ctx.fillStyle = rnd() < 0.5 ? `rgba(120,170,90,${(0.15 + rnd() * 0.25).toFixed(3)})` : `rgba(30,50,25,${(0.1 + rnd() * 0.2).toFixed(3)})`;
    ctx.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 2, 1 + rnd() * 3);
  }
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = MAX_ANISO;
  return tex;
}
// The road ribbon itself: two vertices (inner/outer edge) per centerline
// sample, triangulated as a closed strip. UV.v accumulates by arc length so
// the dashed line/curb texture repeats evenly all the way around the loop.
function buildTrackGeometry(centerline) {
  const n = centerline.length;
  const positions = [], uvs = [], indices = [];
  let arc = 0;
  for (let i = 0; i < n; i++) {
    const p = centerline[i], pNext = centerline[(i + 1) % n], pPrev = centerline[(i - 1 + n) % n];
    const tx = pNext.x - pPrev.x, tz = pNext.z - pPrev.z;
    const tlen = Math.hypot(tx, tz) || 1;
    const nx = -tz / tlen, nz = tx / tlen; // left-hand normal in the XZ plane
    const hw = TRACK_WIDTH / 2;
    positions.push(p.x + nx * hw, 0.01, p.z + nz * hw); // outer edge (u=0)
    positions.push(p.x - nx * hw, 0.01, p.z - nz * hw); // inner edge (u=1)
    const v = arc / (TRACK_WIDTH * 2);
    uvs.push(0, v, 1, v);
    arc += Math.hypot(pNext.x - p.x, pNext.z - p.z);
  }
  for (let i = 0; i < n; i++) {
    const a = i * 2, b = ((i + 1) % n) * 2;
    indices.push(a, a + 1, b, b, a + 1, b + 1);
  }
  // The ribbon is perfectly flat and horizontal by construction, so every
  // vertex's true normal is exactly straight up — computeVertexNormals()
  // derives normals from triangle winding instead, and getting that winding
  // backward anywhere along a hand-built strip like this would quietly
  // back-face-cull the road invisible from directly above. Set them
  // directly rather than trust the derivation.
  const normals = [];
  for (let i = 0; i < n; i++) normals.push(0, 1, 0, 0, 1, 0);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setIndex(indices);
  return geo;
}
// Nearest signed lateral offset from the car's (x,z) to the track
// centerline — used for the off-track grass-drag penalty. Coarse linear
// scan over ~180 samples is cheap enough once a frame.
function nearestTrackOffset(centerline, x, z) {
  let best = Infinity;
  for (const p of centerline) { const d = Math.hypot(x - p.x, z - p.z); if (d < best) best = d; }
  return best;
}
function buildRoadsideTree() {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 2.2, 8), new THREE.MeshStandardMaterial({ color: 0x5a4028, roughness: 0.9 }));
  trunk.position.y = 1.1; trunk.castShadow = true;
  const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.5, 10, 10), new THREE.MeshStandardMaterial({ color: 0x2f6b34, roughness: 0.85 }));
  leaves.position.y = 2.8; leaves.castShadow = true; leaves.scale.set(1, 1.15, 1);
  g.add(trunk, leaves);
  return g;
}
function buildRoadsideLamp() {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.2, 8), new THREE.MeshStandardMaterial({ color: 0x2a2d31, roughness: 0.5, metalness: 0.6 }));
  pole.position.y = 2.1; pole.castShadow = true;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), new THREE.MeshStandardMaterial({ color: 0xfff2d0, emissive: 0xfff2d0, emissiveIntensity: 1.4 }));
  head.position.y = 4.3;
  const bulb = new THREE.PointLight(0xfff2d0, 0.7, 12);
  bulb.position.y = 4.3;
  g.add(pole, head, bulb);
  return g;
}

// Procedural asphalt normal map — a seeded noise heightfield, box-blurred
// once for smoother bumps, then converted to a tangent-space normal via
// central differences (the same principle any offline normal-map bake
// uses, just done in a canvas instead of an image-editing tool). Gives the
// track's asphalt real per-pixel light response instead of a flat-shaded
// color texture, without needing an actual authored PBR asset.
function buildAsphaltNormalMap() {
  const size = 128;
  const height = new Float32Array(size * size);
  const rnd = mulberry32(53);
  for (let i = 0; i < size * size; i++) height[i] = rnd();
  const blurred = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        sum += height[((y + dy + size) % size) * size + ((x + dx + size) % size)];
      }
      blurred[y * size + x] = sum / 9;
    }
  }
  const cvs = document.createElement("canvas");
  cvs.width = cvs.height = size;
  const ctx = cvs.getContext("2d");
  const img = ctx.createImageData(size, size);
  const strength = 1.6;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const l = blurred[y * size + ((x - 1 + size) % size)], r = blurred[y * size + ((x + 1) % size)];
      const u = blurred[((y - 1 + size) % size) * size + x], d = blurred[((y + 1) % size) * size + x];
      const nx = (l - r) * strength, ny = (u - d) * strength, nz = 1;
      const len = Math.hypot(nx, ny, nz) || 1;
      const i = (y * size + x) * 4;
      img.data[i] = ((nx / len) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
// One wheel — tire + rim, cylinder axis rotated onto the local X (axle)
// axis so it reads as a wheel regardless of which way the car body faces.
// Driven independently from the RaycastVehicle's own wheelInfos each frame
// (position, steer angle, spin), not baked into the car's GLB — the model
// wasn't authored with rigged wheel nodes to hook into.
function buildCarWheel(radius = 0.34, width = 0.24) {
  const g = new THREE.Group();
  const tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, width, 20), new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.92 }));
  tire.rotation.z = Math.PI / 2;
  tire.castShadow = true;
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.56, radius * 0.56, width * 1.08, 12), new THREE.MeshStandardMaterial({ color: 0xaeb4bb, roughness: 0.32, metalness: 0.75 }));
  rim.rotation.z = Math.PI / 2;
  g.add(tire, rim);
  return g;
}
// 360° tactical camera shader — same fisheye-distortion + scanline family
// as the office's own DroneCamShader (Module 8), plus a screen-space
// digital grid overlay for the "tactical" HUD read Heavy Guard's own
// 360-camera systems use.
const TacticalCamShader = {
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, amount: { value: 0.35 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float time; uniform float amount; varying vec2 vUv;
    void main(){
      vec2 uv = vUv * 2.0 - 1.0;
      float r2 = dot(uv, uv);
      vec2 warped = uv * (1.0 + amount * r2);
      vec2 suv = warped * 0.5 + 0.5;
      vec3 col;
      if (suv.x < 0.0 || suv.x > 1.0 || suv.y < 0.0 || suv.y > 1.0) { col = vec3(0.02, 0.05, 0.03); }
      else { col = texture2D(tDiffuse, suv).rgb; }
      float gx = abs(fract(suv.x * 24.0) - 0.5);
      float gy = abs(fract(suv.y * 24.0) - 0.5);
      float grid = smoothstep(0.485, 0.5, max(gx, gy));
      col += vec3(0.15, 0.9, 0.5) * grid * 0.22;
      float scan = sin(suv.y * 720.0 + time * 2.0) * 0.03;
      col -= scan;
      col *= 1.0 - r2 * 0.3;
      gl_FragColor = vec4(col, 1.0);
    }`,
};
// Cheap radial speed-blur — a fixed multi-tap sample toward screen center,
// intensity driven by the car's own speed. Not true per-object motion-
// vector blur (that needs a velocity G-buffer and its own render pass —
// disproportionate for one arcade driving mode), but the same "speed
// lines toward center" trick racing games have used for decades, and it
// reads convincingly at speed.
const SpeedBlurShader = {
  uniforms: { tDiffuse: { value: null }, amount: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float amount; varying vec2 vUv;
    void main(){
      vec2 dir = vUv - 0.5;
      vec3 col = vec3(0.0);
      const int SAMPLES = 8;
      for (int i = 0; i < SAMPLES; i++) {
        float t = float(i) / float(SAMPLES - 1);
        col += texture2D(tDiffuse, vUv - dir * amount * t * 0.06).rgb;
      }
      gl_FragColor = vec4(col / float(SAMPLES), 1.0);
    }`,
};

function HangarOverlay({ onReturn, liveRef, onDrive, onDriveTruck, onPilotRobot }) {
  const mountRef = useRef(null);
  const [nearTiggo, setNearTiggo] = useState(false);
  const [nearTruck, setNearTruck] = useState(false);
  const [nearHyperion, setNearHyperion] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let cancelled = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1016);
    scene.fog = new THREE.Fog(0x0d1016, 30, 110);

    const camera = new THREE.PerspectiveCamera(70, mount.clientWidth / mount.clientHeight, 0.1, 500);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x8f9bbf, 0.55));
    const sun = new THREE.DirectionalLight(0xfff2d8, 0.5);
    sun.position.set(20, 40, -20);
    scene.add(sun);

    const W = 34, D = 46, H = 9; // hangar interior footprint (open on +Z toward the house)
    const wallMat = new THREE.MeshStandardMaterial({ map: buildHangarWallTexture(), roughness: 0.6, metalness: 0.35, side: THREE.DoubleSide });
    wallMat.map.repeat.set(W / 4, H / 4);
    const backWallMat = wallMat.clone(); backWallMat.map = wallMat.map.clone(); backWallMat.map.repeat.set(D / 4, H / 4); backWallMat.map.needsUpdate = true;

    const floorTex = buildHangarFloorTexture();
    floorTex.repeat.set(W / 5, D / 5);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.85, metalness: 0.15 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Back wall (entrance side, -Z — away from the house) + two side walls.
    // The +Z wall stays fully open: that's the bay door leading out to the house.
    const back = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat);
    back.position.set(0, H / 2, -D / 2); scene.add(back);
    [-1, 1].forEach((s) => {
      const side = new THREE.Mesh(new THREE.PlaneGeometry(D, H), backWallMat);
      side.rotation.y = Math.PI / 2; side.position.set(s * W / 2, H / 2, 0); scene.add(side);
    });
    // A header beam over the open bay door so the opening reads as a real
    // rolling door, not just a missing wall.
    const header = new THREE.Mesh(new THREE.BoxGeometry(W, 1.1, 0.4), new THREE.MeshStandardMaterial({ color: 0xe8b93c, roughness: 0.5, metalness: 0.4 }));
    header.position.set(0, H - 0.55, D / 2);
    scene.add(header);

    // Ceiling trusses + hanging industrial lights.
    for (let z = -D / 2 + 4; z <= D / 2 - 4; z += 7) {
      const truss = new THREE.Mesh(new THREE.BoxGeometry(W - 1, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: 0x24272c, roughness: 0.5, metalness: 0.6 }));
      truss.position.set(0, H - 0.3, z);
      scene.add(truss);
      const bulb = new THREE.PointLight(0xfff2d0, 0.9, 16);
      bulb.position.set(0, H - 1.0, z);
      scene.add(bulb);
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.5, 12), new THREE.MeshStandardMaterial({ color: 0x1a1c20, emissive: 0xfff2d0, emissiveIntensity: 0.6 }));
      shade.rotation.x = Math.PI; shade.position.set(0, H - 0.75, z);
      scene.add(shade);
    }

    const base = import.meta.env.BASE_URL || "/";
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    // Hyperion statue — the centerpiece, toward the back of the hangar on a
    // lit plinth with its own dramatic spotlight.
    const statuePos = { x: 0, z: -D / 2 + 10 };
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 0.5, 28), new THREE.MeshStandardMaterial({ color: 0x1c1f24, roughness: 0.4, metalness: 0.5 }));
    plinth.position.set(statuePos.x, 0.25, statuePos.z);
    plinth.castShadow = true; plinth.receiveShadow = true;
    scene.add(plinth);
    const plinthRing = new THREE.Mesh(new THREE.TorusGeometry(2.85, 0.05, 8, 48), new THREE.MeshBasicMaterial({ color: 0xe8b93c }));
    plinthRing.rotation.x = Math.PI / 2; plinthRing.position.set(statuePos.x, 0.52, statuePos.z);
    scene.add(plinthRing);
    const statueSpot = new THREE.SpotLight(0xdfe8ff, 3.2, 30, Math.PI / 7, 0.4, 1.2);
    statueSpot.position.set(statuePos.x, H - 0.5, statuePos.z + 1);
    statueSpot.target.position.set(statuePos.x, 3, statuePos.z);
    scene.add(statueSpot, statueSpot.target);
    loader.load(base + "office-models/hyperion.glb", (g) => {
      const m = g.scene;
      m.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      const bb = new THREE.Box3().setFromObject(m);
      const size = bb.getSize(new THREE.Vector3());
      const scale = 6.8 / Math.max(size.y, 0.01); // ~6.8m tall display, towers over the room
      m.scale.setScalar(scale);
      const bb2 = new THREE.Box3().setFromObject(m);
      m.position.x -= (bb2.min.x + bb2.max.x) / 2;
      m.position.z -= (bb2.min.z + bb2.max.z) / 2;
      m.position.y -= bb2.min.y;
      m.position.x += statuePos.x; m.position.y += 0.5; m.position.z += statuePos.z;
      scene.add(m);
    }, undefined, () => {});

    // Vehicle bay — real models parked along one side wall, each on its own
    // painted floor spot (the hazard-striped rectangle baked into the floor
    // texture reads as the bay outline; these are just the actual cars).
    const TIGGO_POS = { x: -W / 2 + 4, z: -8 };
    const TRUCK_POS = { x: -W / 2 + 4.5, z: 4 };
    [
      { url: "tiggo7.glb", x: TIGGO_POS.x, z: TIGGO_POS.z, target: 4.2, rotY: Math.PI / 2 },
      { url: "volvo_fh16.glb", x: TRUCK_POS.x, z: TRUCK_POS.z, target: 6.5, rotY: Math.PI / 2 },
    ].forEach((v) => {
      loader.load(base + "office-models/" + v.url, (g) => {
        const m = g.scene;
        m.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        const bb = new THREE.Box3().setFromObject(m);
        const size = bb.getSize(new THREE.Vector3());
        const scale = v.target / Math.max(size.x, size.z, 0.01);
        m.scale.setScalar(scale);
        const bb2 = new THREE.Box3().setFromObject(m);
        m.position.x -= (bb2.min.x + bb2.max.x) / 2;
        m.position.z -= (bb2.min.z + bb2.max.z) / 2;
        m.position.y -= bb2.min.y;
        m.position.x += v.x; m.position.z += v.z;
        m.rotation.y = v.rotY;
        scene.add(m);
      }, undefined, () => {});
    });

    // The house, visible beyond the open bay door.
    const house = buildHouseExterior();
    house.position.set(0, 0, D / 2 + 15);
    scene.add(house);
    // Pokémon Sanctuary — the real Gen-1 GLB library, beside the house.
    const sanctuary = buildPokemonSanctuary(loader, base, { x: 11, z: D / 2 + 17 });
    scene.add(sanctuary);
    // Night sky beyond the door + a big ground plane so the yard doesn't
    // just fall off into the fog color at the edges.
    const outerGround = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0x1c2b20, roughness: 1 }));
    outerGround.rotation.x = -Math.PI / 2; outerGround.position.set(0, -0.03, D / 2 + 40);
    scene.add(outerGround);
    const moon = new THREE.PointLight(0xbfd4ff, 0.4, 200);
    moon.position.set(-30, 60, D / 2 + 60);
    scene.add(moon);

    // ── Crew Deck annex (+X wall, opposite the vehicle bay) ─────────────────
    // The office went full spaceship (owner request) and kept only the agent
    // pods, the central hologram and part of the owner suite on the main
    // floor — reception, the cafeteria and the kitchen moved bodily out here
    // since none of them are tied to the agents' break-schedule pathing
    // (unlike the gym/lounge/dining tables, which agents actually walk to on
    // a timer and had to stay put in the main scene).
    const crewDeckSign = buildNeonSign("מחלקת צוות", 0xE4BC63, 3.2, 0.6);
    crewDeckSign.position.set(W / 2 - 5, 3.6, -20);
    crewDeckSign.rotation.y = -Math.PI / 2;
    scene.add(crewDeckSign);

    {
      const wCvs = document.createElement("canvas"); wCvs.width = 300; wCvs.height = 170;
      const wctx = wCvs.getContext("2d");
      const wg = wctx.createLinearGradient(0, 0, 0, 170); wg.addColorStop(0, "#12203a"); wg.addColorStop(1, "#0a1120");
      wctx.fillStyle = wg; wctx.fillRect(0, 0, 300, 170);
      wctx.fillStyle = "#E4BC63"; wctx.font = "700 26px system-ui"; wctx.textAlign = "center";
      wctx.fillText("ברוכים הבאים", 150, 60);
      wctx.fillStyle = "#9fd6ff"; wctx.font = "600 18px system-ui"; wctx.fillText("בניין אלפא · קומת הסוכנים", 150, 98);
      wctx.fillStyle = "#7fe6b0"; wctx.font = "600 16px system-ui"; wctx.fillText("● הצוות זמין", 150, 132);
      const welcomeTex = new THREE.CanvasTexture(wCvs); welcomeTex.colorSpace = THREE.SRGBColorSpace;
      const reception = buildReception(0xE4BC63, welcomeTex);
      const RCP = { x: W / 2 - 5, z: -20 };
      reception.group.position.set(RCP.x, 0, RCP.z);
      scene.add(reception.group);
      loader.load(base + "office-models/reception_desk.glb", (g) => {
        const real = g.scene;
        const rb = new THREE.Box3().setFromObject(real);
        const rc = rb.getCenter(new THREE.Vector3());
        const wrap = new THREE.Group();
        real.position.set(-rc.x, -rb.min.y, -rc.z);
        wrap.add(real);
        real.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
        wrap.position.set(RCP.x, 0, RCP.z);
        scene.add(wrap);
        reception.group.visible = false;
      }, undefined, () => { /* model failed to load — procedural counter stays visible */ });
      loader.load(base + "office-models/michal_receptionist.glb", (g) => {
        const m = g.scene;
        const mb = new THREE.Box3().setFromObject(m);
        const ms = mb.getSize(new THREE.Vector3());
        const mc = mb.getCenter(new THREE.Vector3());
        const s = (1.55 / ms.y) || 1;
        const wrap = new THREE.Group();
        m.position.set(-mc.x, -mb.min.y, -mc.z);
        m.scale.setScalar(s);
        wrap.add(m);
        m.traverse((o) => { if (o.isMesh) o.castShadow = true; });
        const tag = buildNameSprite("מיכל", "#D96A9E", "קבלה");
        tag.scale.multiplyScalar(1.7);
        tag.position.y = 1.65;
        wrap.add(tag);
        wrap.position.set(RCP.x - reception.seatLocal.x, 0, RCP.z - reception.seatLocal.z);
        scene.add(wrap);
      }, undefined, () => { /* model failed to load — desk stays as decor */ });
    }
    {
      const caf = buildCafeteria(0xffb454);
      caf.group.position.set(W / 2 - 5, 0, -4);
      scene.add(caf.group);
    }
    {
      const kitchen = buildKitchen(0x3FD79A);
      kitchen.group.position.set(W / 2 - 5, 0, 12);
      scene.add(kitchen.group);
    }

    // Walk controls — same first-person "tank" scheme the office itself
    // uses (W/S forward-back relative to facing, A/D turn), simplified: no
    // player body to render, the camera IS the eye. Movement clamps to the
    // hangar footprint but is allowed to walk out through the open door
    // (+Z) into the yard toward the house.
    // This used to be keyboard-only — the always-mounted touch joysticks
    // and any connected gamepad kept working for the main office scene but
    // did nothing here, so walking the Hangar "like the office" was only
    // possible with a physical keyboard. liveRef.current.joyVec/turnVec are
    // the same channel the office's on-screen joysticks write into (those
    // DOM elements stay mounted and live while this overlay is showing), and
    // the main scene's own animate loop — which is what normally turns
    // gamepad axes into that channel — is paused while inHangar is true, so
    // gamepad needs its own read here too, same phantom-connection guard as
    // everywhere else in this file.
    const keys = {};
    const onKeyDown = (e) => { keys[e.key.toLowerCase()] = true; };
    const onKeyUp = (e) => { keys[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    let gamepadIndex = null;
    // Only accept a standard-mapping pad — some Windows HID peripherals
    // (wireless mouse/keyboard dongles, headset controls) fire a genuine
    // "gamepadconnected" event with a non-standard mapping and drifting
    // axis values, which without this check gets treated as a real
    // controller and spins the camera on its own with nothing plugged in.
    const onGpConnect = (e) => { if (e.gamepad.mapping === "standard") gamepadIndex = e.gamepad.index; };
    const onGpDisconnect = (e) => { if (gamepadIndex === e.gamepad.index) gamepadIndex = null; };
    window.addEventListener("gamepadconnected", onGpConnect);
    window.addEventListener("gamepaddisconnected", onGpDisconnect);
    try {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (const g of pads) { if (g && g.connected && g.mapping === "standard") { gamepadIndex = g.index; break; } }
    } catch {}
    const GP_DEADZONE = 0.2;
    const gpAxis = (v) => (Math.abs(v) < GP_DEADZONE ? 0 : v);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    let yaw = Math.PI;
    let nearTiggoPrev = false;
    let nearTruckPrev = false;
    let nearHyperionPrev = false;
    const pos = new THREE.Vector3(0, 1.7, D / 2 - 5);
    const clock = new THREE.Clock();
    let raf;
    const animate = () => {
      if (cancelled) return;
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.05, clock.getDelta());
      const jv = liveRef?.current?.joyVec || { x: 0, y: 0 };
      const tv = liveRef?.current?.turnVec || { x: 0, y: 0 };
      const gp = (gamepadIndex !== null && navigator.getGamepads) ? navigator.getGamepads()[gamepadIndex] : null;
      // Standard controller convention (same as the main office scene):
      // left stick = movement, right stick = look/turn.
      const gy = gp ? gpAxis(gp.axes[1] || 0) : 0;
      const gcx = gp ? gpAxis(gp.axes[2] || 0) : 0;
      let turn = -((keys["d"] || keys["arrowright"] ? 1 : 0) - (keys["a"] || keys["arrowleft"] ? 1 : 0));
      if (!turn) turn = gcx ? -gcx : (Math.hypot(tv.x, tv.y) > 0.001 ? -tv.x : 0);
      yaw += turn * 2.3 * dt;
      let fwd = (keys["w"] || keys["arrowup"] ? 1 : 0) - (keys["s"] || keys["arrowdown"] ? 1 : 0);
      if (!fwd) fwd = gy ? -gy : (Math.hypot(jv.x, jv.y) > 0.001 ? -jv.y : 0);
      const speed = keys["shift"] ? 9 : 5;
      pos.x += Math.sin(yaw) * fwd * speed * dt;
      pos.z += Math.cos(yaw) * fwd * speed * dt;
      pos.x = clamp(pos.x, -W / 2 + 1.2, W / 2 - 1.2);
      pos.z = clamp(pos.z, -D / 2 + 1.2, D / 2 + 32);
      camera.position.copy(pos);
      const tiggoDist = Math.hypot(pos.x - TIGGO_POS.x, pos.z - TIGGO_POS.z);
      const nearTiggoNow = tiggoDist < 4;
      if (nearTiggoNow !== nearTiggoPrev) { nearTiggoPrev = nearTiggoNow; setNearTiggo(nearTiggoNow); }
      const truckDist = Math.hypot(pos.x - TRUCK_POS.x, pos.z - TRUCK_POS.z);
      const nearTruckNow = truckDist < 5;
      if (nearTruckNow !== nearTruckPrev) { nearTruckPrev = nearTruckNow; setNearTruck(nearTruckNow); }
      const hyperionDist = Math.hypot(pos.x - statuePos.x, pos.z - statuePos.z);
      const nearHyperionNow = hyperionDist < 5;
      if (nearHyperionNow !== nearHyperionPrev) { nearHyperionPrev = nearHyperionNow; setNearHyperion(nearHyperionNow); }
      camera.rotation.order = "YXZ";
      camera.rotation.y = yaw;
      // Chimney smoke — each puff drifts up and fades, looping back to the
      // chimney once it's cleared the roofline.
      (house.userData.smokePuffs || []).forEach((puff) => {
        puff.userData.phase += dt * 0.4;
        const t = puff.userData.phase % 3;
        puff.position.y += dt * 0.35;
        puff.position.x += Math.sin(clock.elapsedTime + puff.userData.phase) * dt * 0.15;
        puff.material.opacity = Math.max(0, 0.5 - t * 0.15);
        if (t < dt * 0.4) puff.position.y = house.position.y + 4.4 + 1.6 + 1.2;
      });
      // Pokémon Sanctuary — a gentle idle bob per creature.
      (sanctuary.userData.bobbers || []).forEach((wrap) => {
        wrap.position.y = wrap.userData.baseY + Math.sin(clock.elapsedTime * 1.4 + wrap.userData.bobPhase) * 0.08;
      });
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("gamepadconnected", onGpConnect);
      window.removeEventListener("gamepaddisconnected", onGpDisconnect);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach(disposeMaterial);
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="off3-space-wrap">
      <div ref={mountRef} className="off3-space-canvas" style={{ cursor: "default" }} />
      <div className="off3-space-hint">WASD / חצים / ג'ויסטיקים לתזוזה · Shift לריצה · יציאה מהשער אל הבית</div>
      {nearTiggo && (
        <button className="off3-sit" onClick={onDrive} title="צא לנסיעה (E)">
          🚗 צא לנסיעה עם הטיגו
        </button>
      )}
      {nearTruck && (
        <button className="off3-sit" style={{ top: "58px" }} onClick={onDriveTruck} title="צא לנסיעה עם המשאית (E)">
          🚛 צא לנסיעה עם המשאית
        </button>
      )}
      {nearHyperion && (
        <button className="off3-sit" style={{ top: "106px" }} onClick={onPilotRobot} title="הפעל את הענק (E)">
          🤖 הפעל את הענק
        </button>
      )}
      <button className="off3-space-return" onClick={onReturn}>🚪 חזרה למשרד</button>
    </div>
  );
}

// Driving mini-mode — entered from beside the parked Tiggo 7 inside the
// Hangar. A real closed-loop proving-ground track (not just a parking lot),
// the actual Tiggo 7 GLB model, and an arcade-but-not-floaty thrust/drag/
// steering model in the same spirit as the fighter jet's flight physics:
// throttle builds speed, drag pulls it back down, and running onto the
// grass costs you instead of being free.
// Per-vehicle physics/visual tuning — same RaycastVehicle rig, different
// mass/dimensions/power so the truck actually drives like a truck (heavier,
// taller ride height, bigger wheels, slower to build speed) instead of just
// being a reskinned car.
const VEHICLE_CONFIGS = {
  car: {
    glb: "tiggo7.glb", targetSize: 4.2, rideY: 0.35, rotYFix: Math.PI / 2, label: "טיגו 7",
    mass: 1400, halfW: 0.9, halfL: 1.55, connY: -0.1, chassisHalf: { x: 0.95, y: 0.55, z: 1.95 }, startY: 0.9,
    wheelRadius: 0.34, suspensionStiffness: 32, suspensionRestLength: 0.3, frictionSlip: 1.5,
    dampingRelaxation: 2.4, dampingCompression: 4.5, maxSuspensionForce: 100000, maxSuspensionTravel: 0.28,
    rollInfluence: 0.012, maxEngine: 2600, maxBrake: 55, maxSteer: 0.5,
    camDist: 8.5, camHeight: 3.4, lookHeight: 1,
  },
  truck: {
    glb: "volvo_fh16.glb", targetSize: 6.5, rideY: 0.15, rotYFix: Math.PI / 2, label: "וולוו FH16",
    mass: 8500, halfW: 1.15, halfL: 2.6, connY: -0.15, chassisHalf: { x: 1.2, y: 1.15, z: 2.9 }, startY: 1.9,
    wheelRadius: 0.5, suspensionStiffness: 45, suspensionRestLength: 0.35, frictionSlip: 1.35,
    dampingRelaxation: 2.6, dampingCompression: 4.8, maxSuspensionForce: 220000, maxSuspensionTravel: 0.32,
    rollInfluence: 0.02, maxEngine: 5200, maxBrake: 110, maxSteer: 0.38,
    camDist: 13, camHeight: 4.8, lookHeight: 2,
  },
};
function DriveOverlay({ onReturn, liveRef, vehicle: vehicleType = "car" }) {
  const cfg = VEHICLE_CONFIGS[vehicleType] || VEHICLE_CONFIGS.car;
  const mountRef = useRef(null);
  const speedRef = useRef(null);
  const distRef = useRef(null);
  const gaugeRef = useRef(null);
  const rpmRef = useRef(null);
  const battRef = useRef(null);
  const radarRef = useRef(null);
  const [view360, setView360] = useState(false);
  const view360Ref = useRef(false);
  useEffect(() => { view360Ref.current = view360; }, [view360]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let cancelled = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9fd3f0);
    scene.fog = new THREE.Fog(0xbfe3ff, 60, 320);

    const camera = new THREE.PerspectiveCamera(66, mount.clientWidth / mount.clientHeight, 0.1, 800);
    const BASE_FOV = 66;
    // Top-down "tactical" camera for the 360° view — a separate orthographic
    // camera (not just a repositioned perspective one) so the bird's-eye
    // read is genuinely flat/undistorted before the fisheye pass warps it,
    // the way a real overhead surround-view stitch would be.
    const ORTHO_SIZE = 14;
    const camera360 = new THREE.OrthographicCamera(-ORTHO_SIZE, ORTHO_SIZE, ORTHO_SIZE, -ORTHO_SIZE, 0.1, 400);
    camera360.up.set(0, 0, -1); // looking straight down; keep "car forward" reading as "up" on screen

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const speedBlurPass = new ShaderPass(SpeedBlurShader);
    composer.addPass(speedBlurPass);
    const tacticalPass = new ShaderPass(TacticalCamShader);
    tacticalPass.enabled = false;
    composer.addPass(tacticalPass);
    composer.addPass(new OutputPass());
    composer.setSize(mount.clientWidth, mount.clientHeight);

    const sun = new THREE.DirectionalLight(0xfff2d8, 1.2);
    sun.position.set(60, 90, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -40; sun.shadow.camera.right = 40;
    sun.shadow.camera.top = 40; sun.shadow.camera.bottom = -40;
    sun.shadow.camera.near = 10; sun.shadow.camera.far = 260;
    scene.add(sun, sun.target);
    scene.add(new THREE.AmbientLight(0xbcd6ff, 0.6));

    // Grass field under and well past the track — the blades themselves are
    // InstancedMesh (one draw call for thousands of them) rather than one
    // mesh each, so the scene can afford real per-blade geometry instead of
    // a flat texture doing all the work, without tanking frame rate.
    const grassTex = buildGrassTexture(); grassTex.repeat.set(60, 60);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ map: grassTex, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // The track itself — asphalt color map plus a procedurally-generated
    // normal map (real per-pixel bump response to the sun, not a flat tint).
    const centerline = buildTrackCenterline(180);
    const trackGeo = buildTrackGeometry(centerline);
    const trackNormalMap = buildAsphaltNormalMap();
    trackNormalMap.repeat.set(1, Math.round(TRACK_LENGTH / (TRACK_WIDTH * 2)) * 3);
    const trackMat = new THREE.MeshStandardMaterial({
      map: buildTrackTexture(), normalMap: trackNormalMap, normalScale: new THREE.Vector2(0.6, 0.6),
      roughness: 0.85, metalness: 0.05, side: THREE.DoubleSide,
    });
    trackMat.map.repeat.set(1, Math.round(TRACK_LENGTH / (TRACK_WIDTH * 2)));
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.receiveShadow = true;
    scene.add(track);

    // Roadside dressing. Trees are the numerous ones (one every 6th sample
    // around a 180-point loop), so their trunks and leaves are each a single
    // InstancedMesh — lamps are far fewer and each needs its own PointLight
    // anyway, so those stay as individual objects. obstaclePts feeds the
    // 360° view's proximity-sensor arcs later.
    const obstaclePts = [];
    const treeMatrices = [];
    const lampGroups = [];
    for (let i = 0; i < centerline.length; i += 6) {
      const p = centerline[i], pn = centerline[(i + 1) % centerline.length];
      const tx = pn.x - p.x, tz = pn.z - p.z, tl = Math.hypot(tx, tz) || 1;
      const nx = -tz / tl, nz = tx / tl;
      const off = TRACK_WIDTH / 2 + 4.5 + (i % 12 === 0 ? 3 : 0);
      const px = p.x + nx * off, pz = p.z + nz * off;
      obstaclePts.push({ x: px, z: pz });
      if (i % 12 === 0) {
        const lamp = buildRoadsideLamp();
        lamp.position.set(px, 0, pz);
        scene.add(lamp);
        lampGroups.push(lamp);
      } else {
        const m = new THREE.Matrix4().compose(
          new THREE.Vector3(px, 0, pz),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.random() * Math.PI * 2, 0)),
          new THREE.Vector3(1, 1, 1)
        );
        treeMatrices.push(m);
      }
    }
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.24, 2.2, 8);
    const leavesGeo = new THREE.SphereGeometry(1.5, 10, 10);
    const trunkMesh = new THREE.InstancedMesh(trunkGeo, new THREE.MeshStandardMaterial({ color: 0x5a4028, roughness: 0.9 }), treeMatrices.length);
    const leavesMesh = new THREE.InstancedMesh(leavesGeo, new THREE.MeshStandardMaterial({ color: 0x2f6b34, roughness: 0.85 }), treeMatrices.length);
    treeMatrices.forEach((m, i) => {
      const trunkM = m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 1.1, 0));
      trunkMesh.setMatrixAt(i, trunkM);
      const leavesM = m.clone().multiply(new THREE.Matrix4().compose(new THREE.Vector3(0, 2.8, 0), new THREE.Quaternion(), new THREE.Vector3(1, 1.15, 1)));
      leavesMesh.setMatrixAt(i, leavesM);
    });
    trunkMesh.castShadow = true; leavesMesh.castShadow = true;
    scene.add(trunkMesh, leavesMesh);

    // Grass blades — thousands of thin double-sided crossed quads, scattered
    // across the field but skipped within the track's own footprint.
    const bladeGeo = new THREE.PlaneGeometry(0.06, 0.34, 1, 1);
    bladeGeo.translate(0, 0.17, 0);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x4a7a3e, roughness: 0.9, side: THREE.DoubleSide });
    const BLADE_COUNT = 3500;
    const bladeMesh = new THREE.InstancedMesh(bladeGeo, bladeMat, BLADE_COUNT);
    {
      const dummy = new THREE.Object3D();
      let placed = 0, tries = 0;
      while (placed < BLADE_COUNT && tries < BLADE_COUNT * 4) {
        tries++;
        const bx = (Math.random() - 0.5) * 240, bz = (Math.random() - 0.5) * 240;
        if (nearestTrackOffset(centerline, bx, bz) < TRACK_WIDTH / 2 + 1.2) continue;
        dummy.position.set(bx, 0, bz);
        dummy.rotation.y = Math.random() * Math.PI;
        const s = 0.7 + Math.random() * 0.8;
        dummy.scale.set(s, s * (0.8 + Math.random() * 0.6), s);
        dummy.updateMatrix();
        bladeMesh.setMatrixAt(placed, dummy.matrix);
        placed++;
      }
    }
    scene.add(bladeMesh);

    const distantBuildingMat = new THREE.MeshStandardMaterial({ color: 0x8a93a8, roughness: 0.9 });
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2;
      const r = 140 + (i % 3) * 20;
      const b = new THREE.Mesh(new THREE.BoxGeometry(14 + (i % 4) * 4, 20 + (i % 5) * 8, 14), distantBuildingMat);
      b.position.set(Math.cos(ang) * r, b.geometry.parameters.height / 2, Math.sin(ang) * r);
      scene.add(b);
      obstaclePts.push({ x: b.position.x, z: b.position.z });
    }

    // ── Physics world (cannon-es) ───────────────────────────────────────
    // Real vehicle physics instead of a kinematic speed/heading model: a
    // RaycastVehicle chassis with 4 independently-raycast wheels, each with
    // its own suspension (stiffness/damping/travel) and tire friction. The
    // ground is a single infinite physics plane — the visible track/grass
    // are all coplanar at y=0, so one flat collider covers the whole scene;
    // no per-mesh collision geometry needed.
    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
    world.defaultContactMaterial.friction = 0.3;
    // The chassis box and the ground plane must NOT collide with each other:
    // ground support comes entirely from the RaycastVehicle's own per-wheel
    // suspension rays. If the chassis rigid shape is also allowed to collide
    // with the ground, both systems fight for vertical support at once and
    // the chassis pops/flips on spawn (same filter-group split used in the
    // upstream cannon-es RaycastVehicle demo).
    const GROUP_GROUND = 1, GROUP_CHASSIS = 2;
    const groundBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    groundBody.collisionFilterGroup = GROUP_GROUND;
    groundBody.collisionFilterMask = GROUP_GROUND;
    world.addBody(groundBody);

    const startP = centerline[0], startNext = centerline[1];
    // The car used to always spawn facing a fixed heading regardless of
    // which way the track actually ran at the start line — derive it from
    // the track's own tangent instead (same fix as before, now applied to
    // the physics chassis' initial orientation rather than a plain number).
    const startHeading = Math.atan2(startNext.x - startP.x, startNext.z - startP.z);

    const HALF_W = cfg.halfW, HALF_L = cfg.halfL, CONN_Y = cfg.connY;
    const chassisShape = new CANNON.Box(new CANNON.Vec3(cfg.chassisHalf.x, cfg.chassisHalf.y, cfg.chassisHalf.z));
    const chassisBody = new CANNON.Body({ mass: cfg.mass });
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(startP.x, cfg.startY, startP.z);
    chassisBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), startHeading);
    chassisBody.angularDamping = 0.6;
    chassisBody.collisionFilterGroup = GROUP_CHASSIS;
    chassisBody.collisionFilterMask = GROUP_CHASSIS;
    world.addBody(chassisBody);

    const vehicle = new CANNON.RaycastVehicle({ chassisBody, indexRightAxis: 0, indexUpAxis: 1, indexForwardAxis: 2 });
    const wheelOptions = {
      radius: cfg.wheelRadius,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: cfg.suspensionStiffness,
      suspensionRestLength: cfg.suspensionRestLength,
      frictionSlip: cfg.frictionSlip,
      dampingRelaxation: cfg.dampingRelaxation,
      dampingCompression: cfg.dampingCompression,
      maxSuspensionForce: cfg.maxSuspensionForce,
      rollInfluence: cfg.rollInfluence,
      axleLocal: new CANNON.Vec3(1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(1, 0, 0),
      maxSuspensionTravel: cfg.maxSuspensionTravel,
      customSlidingRotationalSpeed: -32,
      useCustomSlidingRotationalSpeed: true,
    };
    const wheelConn = [
      { x: -HALF_W, y: CONN_Y, z: HALF_L },  // front-left
      { x: HALF_W, y: CONN_Y, z: HALF_L },   // front-right
      { x: -HALF_W, y: CONN_Y, z: -HALF_L }, // rear-left
      { x: HALF_W, y: CONN_Y, z: -HALF_L },  // rear-right
    ];
    wheelConn.forEach((c) => {
      vehicle.addWheel({ ...wheelOptions, chassisConnectionPointLocal: new CANNON.Vec3(c.x, c.y, c.z) });
    });
    vehicle.addToWorld(world);

    // The car — same procedural-fit loader pattern used for the vehicle-bay
    // display models, just driven by the physics chassis instead of parked.
    const base = import.meta.env.BASE_URL || "/";
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const car = new THREE.Group();
    scene.add(car);
    loader.load(base + "office-models/" + cfg.glb, (g) => {
      const m = g.scene;
      m.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      const bb = new THREE.Box3().setFromObject(m);
      const size = bb.getSize(new THREE.Vector3());
      const scale = cfg.targetSize / Math.max(size.x, size.z, 0.01);
      m.scale.setScalar(scale);
      // Same parked orientation used in the Hangar's vehicle bay (rotY=PI/2)
      // reads as the model's own local +Z being its side, not its nose —
      // rotate an extra quarter turn so "forward" matches the chassis'
      // own local +Z (indexForwardAxis above). This MUST happen before the
      // bounding-box recenter below: centering against the pre-rotation box
      // and then rotating only the geometry (not the already-computed
      // offset) left the model visibly displaced from its own origin —
      // the wheels (driven directly off the physics chassis) stayed put
      // while the car body rendered a couple of units away from them.
      m.rotation.y = cfg.rotYFix;
      const bb2 = new THREE.Box3().setFromObject(m);
      m.position.x -= (bb2.min.x + bb2.max.x) / 2;
      m.position.z -= (bb2.min.z + bb2.max.z) / 2;
      m.position.y -= bb2.min.y - cfg.rideY; // sit on top of the physics chassis, not sunk into it
      car.add(m);
    }, undefined, () => {});
    // Wheels are driven independently from the RaycastVehicle's own
    // wheelInfos every frame — the GLB wasn't authored with rigged wheel
    // nodes to hook a spin animation into, so these are separate meshes
    // layered on top instead of hidden ones inside the model.
    const wheelMeshes = wheelConn.map(() => { const w = buildCarWheel(cfg.wheelRadius, cfg.wheelRadius * 0.7); scene.add(w); return w; });

    const keys = {};
    let audioCtx = null, evOsc = null, evGain = null, iceOsc = null, iceGain = null, iceLp = null, audioStarted = false;
    // PHEV dual-motor audio: a quiet EV hum under ~40 km/h, crossfading into
    // a deeper combustion note above that (or under hard acceleration) with
    // a simulated gear-step lowpass sweep. Lazily created on the first real
    // input — browsers block audio until a user gesture, same pattern the
    // main dashboard's own boot sound already uses.
    function ensureAudio() {
      if (audioStarted) return;
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      audioStarted = true;
      audioCtx = new AC();
      evOsc = audioCtx.createOscillator(); evOsc.type = "sine"; evOsc.frequency.value = 90;
      evGain = audioCtx.createGain(); evGain.gain.value = 0;
      evOsc.connect(evGain); evGain.connect(audioCtx.destination); evOsc.start();
      iceOsc = audioCtx.createOscillator(); iceOsc.type = "sawtooth"; iceOsc.frequency.value = 60;
      iceLp = audioCtx.createBiquadFilter(); iceLp.type = "lowpass"; iceLp.frequency.value = 700;
      iceGain = audioCtx.createGain(); iceGain.gain.value = 0;
      iceOsc.connect(iceLp); iceLp.connect(iceGain); iceGain.connect(audioCtx.destination); iceOsc.start();
    }
    const onKeyDown = (e) => { keys[e.key.toLowerCase()] = true; ensureAudio(); };
    const onKeyUp = (e) => { keys[e.key.toLowerCase()] = false; };
    const onPointerDown = () => ensureAudio();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    mount.addEventListener("pointerdown", onPointerDown);
    let gamepadIndex = null;
    // Only accept a standard-mapping pad — some Windows HID peripherals
    // (wireless mouse/keyboard dongles, headset controls) fire a genuine
    // "gamepadconnected" event with a non-standard mapping and drifting
    // axis values, which without this check gets treated as a real
    // controller and spins the camera on its own with nothing plugged in.
    const onGpConnect = (e) => { if (e.gamepad.mapping === "standard") gamepadIndex = e.gamepad.index; };
    const onGpDisconnect = (e) => { if (gamepadIndex === e.gamepad.index) gamepadIndex = null; };
    window.addEventListener("gamepadconnected", onGpConnect);
    window.addEventListener("gamepaddisconnected", onGpDisconnect);
    try {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (const g of pads) { if (g && g.connected && g.mapping === "standard") { gamepadIndex = g.index; break; } }
    } catch {}
    const GP_DEADZONE = 0.12;
    const gpAxis = (v) => (Math.abs(v) < GP_DEADZONE ? 0 : v);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    // Simulated hybrid range — not tied to anything mechanical, just a
    // simple drain/regen model so the HUD's battery/fuel readout means
    // something: EV power drains the battery, ICE power drains fuel,
    // braking regenerates a little charge.
    let battery = 78, fuel = 62;
    let totalDistM = 0;
    let steerSmoothed = 0;
    // Chase-camera spring-damper state (position + velocity) — a real
    // critically-damped spring follow instead of a plain exponential lerp,
    // so the camera has actual inertia (lags into corners, settles out of
    // them) rather than snapping toward the target every frame.
    const camPos = new THREE.Vector3();
    const camVel = new THREE.Vector3();
    let camPosInit = false;
    const tmpVec = new THREE.Vector3(), tmpVec2 = new THREE.Vector3(), tmpQuat = new THREE.Quaternion();

    const clock = new THREE.Clock();
    let raf;
    const animate = () => {
      if (cancelled) return;
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.05, clock.getDelta());

      const jv = liveRef?.current?.joyVec || { x: 0, y: 0 };
      const gp = (gamepadIndex !== null && navigator.getGamepads) ? navigator.getGamepads()[gamepadIndex] : null;
      const kThrottle = (keys["w"] || keys["arrowup"] ? 1 : 0) - (keys["s"] || keys["arrowdown"] ? 1 : 0);
      const kSteer = -((keys["d"] || keys["arrowright"] ? 1 : 0) - (keys["a"] || keys["arrowleft"] ? 1 : 0));
      const gpThrottle = gp ? ((gp.buttons[7] ? gp.buttons[7].value : 0) - (gp.buttons[6] ? gp.buttons[6].value : 0)) : 0;
      const gpSteer = gp ? -gpAxis(gp.axes[0] || 0) : 0;
      const throttleIn = kThrottle || gpThrottle || (Math.hypot(jv.x, jv.y) > 0.001 ? -jv.y : 0);
      const steerIn = kSteer || gpSteer || (Math.hypot(jv.x, jv.y) > 0.001 ? -jv.x : 0);
      if (gp && (Math.abs(gpThrottle) > 0.05 || Math.abs(gpAxis(gp.axes[0] || 0)) > 0.05)) ensureAudio();

      // Smoothed/progressive steering — no snapping between full-left and
      // full-right, matches a real steering rack's own response lag.
      steerSmoothed += (steerIn - steerSmoothed) * Math.min(1, dt * 6);
      const MAX_STEER = cfg.maxSteer;
      vehicle.setSteeringValue(steerSmoothed * MAX_STEER, 0);
      vehicle.setSteeringValue(steerSmoothed * MAX_STEER, 1);

      // Forward speed signed along the chassis' own local +Z (its forward
      // axis) — used for both the brake/reverse decision and every display.
      const fwd = new CANNON.Vec3(0, 0, 1);
      chassisBody.vectorToWorldFrame(fwd, fwd);
      const forwardSpeed = chassisBody.velocity.dot(fwd);

      const MAX_ENGINE = cfg.maxEngine, MAX_BRAKE = cfg.maxBrake;
      let engineForce = 0, brakeForce = 0;
      if (throttleIn > 0.02) {
        engineForce = -throttleIn * MAX_ENGINE;
      } else if (throttleIn < -0.02) {
        if (forwardSpeed > 0.6) brakeForce = -throttleIn * MAX_BRAKE;
        else engineForce = -throttleIn * MAX_ENGINE * 0.45;
      } else {
        brakeForce = 4; // light idle rolling resistance so it actually coasts to a stop
      }
      for (let i = 0; i < 4; i++) {
        vehicle.applyEngineForce(engineForce, i);
        vehicle.setBrake(brakeForce, i);
      }

      // Off-track penalty: extra brake-like drag while on the grass, same
      // intent as the old kinematic model's off-road cost, just expressed
      // as a physical brake force on all four wheels this time.
      const offset = nearestTrackOffset(centerline, chassisBody.position.x, chassisBody.position.z);
      if (offset > TRACK_WIDTH / 2) for (let i = 0; i < 4; i++) vehicle.setBrake(Math.abs(brakeForce) + 8, i);

      world.step(1 / 60, dt, 4);

      car.position.set(chassisBody.position.x, chassisBody.position.y, chassisBody.position.z);
      car.quaternion.set(chassisBody.quaternion.x, chassisBody.quaternion.y, chassisBody.quaternion.z, chassisBody.quaternion.w);
      for (let i = 0; i < 4; i++) {
        vehicle.updateWheelTransform(i);
        const wt = vehicle.wheelInfos[i].worldTransform;
        wheelMeshes[i].position.set(wt.position.x, wt.position.y, wt.position.z);
        wheelMeshes[i].quaternion.set(wt.quaternion.x, wt.quaternion.y, wt.quaternion.z, wt.quaternion.w);
      }

      const speedKmh = Math.abs(forwardSpeed) * 3.6;
      totalDistM += Math.abs(forwardSpeed) * dt;
      const totalDistKm = totalDistM / 1000;

      // PHEV audio crossfade + simulated gear-step lowpass sweep.
      if (audioStarted && audioCtx) {
        const now = audioCtx.currentTime;
        const iceOn = speedKmh > 40 || Math.abs(throttleIn) > 0.7;
        evOsc.frequency.setTargetAtTime(80 + speedKmh * 2.2, now, 0.05);
        evGain.gain.setTargetAtTime(iceOn ? 0.025 : Math.min(0.12, 0.02 + speedKmh * 0.0028), now, 0.35);
        iceGain.gain.setTargetAtTime(iceOn ? Math.min(0.17, 0.05 + speedKmh * 0.0022) : 0, now, 0.45);
        iceOsc.frequency.setTargetAtTime(50 + speedKmh * 3.2, now, 0.15);
        const gear = Math.min(4, 1 + Math.floor(speedKmh / 32));
        iceLp.frequency.setTargetAtTime(450 + gear * 260, now, 0.3);
        // Simulated PHEV range: EV power drains the battery, ICE drains
        // fuel, braking regenerates a little charge back into the battery.
        if (iceOn) fuel = clamp(fuel - speedKmh * 0.0009 * dt, 0, 100);
        else if (speedKmh > 1) battery = clamp(battery - speedKmh * 0.0018 * dt, 0, 100);
        if (throttleIn < -0.3 && Math.abs(forwardSpeed) > 1.5) battery = clamp(battery + 6 * dt, 0, 100);
      }

      // Chase camera — critically-damped spring follow instead of a flat
      // lerp, plus speed-reactive FOV widening and a subtle high-speed
      // screen shake, for the "visceral" sense of speed a static FOV can't
      // give. Reuses the same world-space forward vector computed above
      // (local +Z rotated into world space) rather than re-deriving it —
      // an earlier version recomputed it from local -Z here by mistake,
      // which put the camera in FRONT of the car instead of behind it.
      const carFwd = tmpVec.set(fwd.x, 0, fwd.z).normalize();
      const behindTarget = tmpVec2.copy(carFwd).multiplyScalar(-cfg.camDist).add(car.position).add(new THREE.Vector3(0, cfg.camHeight, 0));
      if (!camPosInit) { camPos.copy(behindTarget); camPosInit = true; }
      const springK = 55, springD = 11;
      const accelX = (behindTarget.x - camPos.x) * springK - camVel.x * springD;
      const accelY = (behindTarget.y - camPos.y) * springK - camVel.y * springD;
      const accelZ = (behindTarget.z - camPos.z) * springK - camVel.z * springD;
      camVel.x += accelX * dt; camVel.y += accelY * dt; camVel.z += accelZ * dt;
      camPos.x += camVel.x * dt; camPos.y += camVel.y * dt; camPos.z += camVel.z * dt;
      const speedT = clamp(speedKmh / 150, 0, 1);
      const shake = speedT > 0.35 ? (speedT - 0.35) * 0.05 : 0;
      camera.position.set(
        camPos.x + (Math.random() - 0.5) * shake,
        camPos.y + (Math.random() - 0.5) * shake,
        camPos.z + (Math.random() - 0.5) * shake
      );
      camera.lookAt(car.position.clone().add(new THREE.Vector3(0, cfg.lookHeight, 0)));
      const targetFov = BASE_FOV + speedT * 22;
      if (Math.abs(camera.fov - targetFov) > 0.05) { camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 3); camera.updateProjectionMatrix(); }

      // 360° tactical camera — orthographic, top-down, rotates with the car.
      if (view360Ref.current) {
        camera360.position.set(car.position.x, car.position.y + 30, car.position.z);
        const carYaw = Math.atan2(carFwd.x, carFwd.z);
        camera360.rotation.set(-Math.PI / 2, 0, 0);
        camera360.rotateZ(carYaw);
      }
      speedBlurPass.uniforms.amount.value = speedT * 1.4;
      tacticalPass.enabled = view360Ref.current;
      tacticalPass.uniforms.time.value += dt;
      renderPass.camera = view360Ref.current ? camera360 : camera;

      if (speedRef.current) speedRef.current.textContent = Math.round(speedKmh) + " קמ״ש";
      if (distRef.current) distRef.current.textContent = totalDistKm.toFixed(2) + " ק״מ";
      if (rpmRef.current) {
        const gear = Math.min(4, 1 + Math.floor(speedKmh / 32));
        const rpm = Math.round(900 + (speedKmh % 32) / 32 * 5600);
        rpmRef.current.textContent = rpm.toLocaleString("he-IL") + " · הילוך " + gear;
      }
      if (battRef.current) battRef.current.textContent = Math.round(battery) + "% 🔋 · " + Math.round(fuel) + "% ⛽";

      const gz = gaugeRef.current;
      if (gz) {
        const gctx = gz.getContext("2d");
        const W = gz.width, H = gz.height, cx = W / 2, cy = H - 6, R = W / 2 - 6;
        gctx.clearRect(0, 0, W, H);
        gctx.strokeStyle = "rgba(230,240,255,.35)"; gctx.lineWidth = 3;
        gctx.beginPath(); gctx.arc(cx, cy, R, Math.PI, 0); gctx.stroke();
        for (let t = 0; t <= 10; t++) {
          const a = Math.PI + (t / 10) * Math.PI;
          gctx.strokeStyle = "rgba(230,240,255,.5)"; gctx.lineWidth = 1.5;
          gctx.beginPath();
          gctx.moveTo(cx + Math.cos(a) * R * 0.86, cy + Math.sin(a) * R * 0.86);
          gctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
          gctx.stroke();
        }
        const pct = clamp(speedKmh / 180, 0, 1);
        gctx.strokeStyle = pct > 0.85 ? "#ff5a4a" : "#ffd23f"; gctx.lineWidth = 4;
        gctx.beginPath(); gctx.arc(cx, cy, R, Math.PI, Math.PI + pct * Math.PI); gctx.stroke();
        const needleA = Math.PI + pct * Math.PI;
        gctx.strokeStyle = "#eef6ff"; gctx.lineWidth = 2.5;
        gctx.beginPath(); gctx.moveTo(cx, cy); gctx.lineTo(cx + Math.cos(needleA) * R * 0.82, cy + Math.sin(needleA) * R * 0.82); gctx.stroke();
      }

      // Proximity-sensor arcs — only meaningful (and only drawn) in the
      // 360° tactical view: green/yellow/red rings toward the nearest
      // roadside object (tree, lamp, building) relative to the car.
      const rd = radarRef.current;
      if (rd) {
        if (view360Ref.current) {
          const rctx = rd.getContext("2d");
          const W = rd.width, H = rd.height, cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 4;
          rctx.clearRect(0, 0, W, H);
          rctx.strokeStyle = "rgba(120,255,180,.5)"; rctx.lineWidth = 1;
          rctx.beginPath(); rctx.arc(cx, cy, R, 0, Math.PI * 2); rctx.stroke();
          let best = Infinity, bestAng = 0;
          const carYaw2 = Math.atan2(carFwd.x, carFwd.z);
          obstaclePts.forEach((o) => {
            const ddx = o.x - car.position.x, ddz = o.z - car.position.z;
            const d = Math.hypot(ddx, ddz);
            if (d < best) { best = d; bestAng = Math.atan2(ddx, ddz) - carYaw2; }
          });
          if (best < 20) {
            const color = best < 4 ? "#ff4a3e" : best < 8 ? "#ffd23f" : "#3fd79a";
            rctx.strokeStyle = color; rctx.lineWidth = 5;
            const span = 0.5;
            rctx.beginPath(); rctx.arc(cx, cy, R - 4, -Math.PI / 2 + bestAng - span, -Math.PI / 2 + bestAng + span); rctx.stroke();
          }
          rctx.fillStyle = "#eafff2";
          rctx.beginPath(); rctx.moveTo(cx, cy - 7); rctx.lineTo(cx - 5, cy + 6); rctx.lineTo(cx + 5, cy + 6); rctx.fill();
        } else {
          rd.getContext("2d").clearRect(0, 0, rd.width, rd.height);
        }
      }

      composer.render();
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      camera360.left = -ORTHO_SIZE * (w / h); camera360.right = ORTHO_SIZE * (w / h);
      camera360.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      mount.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("gamepadconnected", onGpConnect);
      window.removeEventListener("gamepaddisconnected", onGpDisconnect);
      if (audioCtx) { try { audioCtx.close(); } catch {} }
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach(disposeMaterial);
        }
      });
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="off3-space-wrap">
      <div ref={mountRef} className="off3-space-canvas" style={{ cursor: "default" }} />
      <div className="off3-space-hint">{cfg.label} · W/S להאיץ ולבלום · A/D / ג'ויסטיק להיגוי · מסלול סגור — סעו כמה שתרצו</div>
      <canvas ref={gaugeRef} width={110} height={70} className="off3-drive-gauge" />
      <canvas ref={radarRef} width={120} height={120} className="off3-drive-radar" />
      <div className="off3-drive-hud">
        <div><span>מהירות</span><b ref={speedRef}>0 קמ״ש</b></div>
        <div><span>סל״ד</span><b ref={rpmRef}>900 · הילוך 1</b></div>
        <div><span>סוללה/דלק</span><b ref={battRef}>78% 🔋 · 62% ⛽</b></div>
        <div><span>מרחק</span><b ref={distRef}>0.00 ק״מ</b></div>
      </div>
      <button className={"off3-sit" + (view360 ? " on" : "")} onClick={() => setView360((v) => !v)} title="מצב מצלמת 360°">
        📹 {view360 ? "חזרה למצלמה רגילה" : "מצב 360°"}
      </button>
      <button className="off3-space-return" onClick={onReturn}>🚪 חזרה לאנגר</button>
    </div>
  );
}

// Giant-robot piloting mode — entered from beside the Hyperion statue in the
// Hangar. No vehicle physics needed here (it's a walking mech, not a car):
// the same camera-relative third-person movement scheme the main office
// avatar uses (raw input rotated by the camera's own orbit before being
// applied to position — see CLAUDE.md), just scaled up to a many-meter-tall
// robot, with a footstep-timed camera thud so the extra mass actually reads.
function RobotPilotOverlay({ onReturn, liveRef }) {
  const mountRef = useRef(null);
  const powerRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let cancelled = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a2436);
    scene.fog = new THREE.Fog(0x1a2436, 70, 340);

    const camera = new THREE.PerspectiveCamera(62, mount.clientWidth / mount.clientHeight, 0.1, 900);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const moon = new THREE.DirectionalLight(0xcfe0ff, 1.1);
    moon.position.set(-60, 100, 40);
    moon.castShadow = true;
    moon.shadow.mapSize.set(1024, 1024);
    moon.shadow.camera.left = -50; moon.shadow.camera.right = 50;
    moon.shadow.camera.top = 50; moon.shadow.camera.bottom = -50;
    moon.shadow.camera.far = 300;
    scene.add(moon, moon.target);
    scene.add(new THREE.AmbientLight(0x7c8bb0, 0.65));

    const grassTex = buildGrassTexture(); grassTex.repeat.set(80, 80);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), new THREE.MeshStandardMaterial({ map: grassTex, roughness: 1, color: 0x8fa878 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Distant city blocks purely for scale reference — without something
    // human-scale-ish in the distance a many-meter-tall robot doesn't read
    // as "giant," it just reads as "normal-sized in an empty field."
    const buildingMat = new THREE.MeshStandardMaterial({ color: 0x2b3448, roughness: 0.85 });
    const distantBuildings = [];
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2;
      const r = 160 + (i % 4) * 30;
      const h = 16 + (i % 5) * 9;
      const b = new THREE.Mesh(new THREE.BoxGeometry(12 + (i % 3) * 5, h, 12 + (i % 3) * 5), buildingMat);
      b.position.set(Math.cos(ang) * r, h / 2, Math.sin(ang) * r);
      b.castShadow = true; b.receiveShadow = true;
      scene.add(b);
      distantBuildings.push(b);
    }

    const base = import.meta.env.BASE_URL || "/";
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const robot = new THREE.Group();
    robot.position.set(0, 0, 20);
    scene.add(robot);
    const ROBOT_HEIGHT = 9; // towers over the distant "buildings" above
    loader.load(base + "office-models/hyperion.glb", (g) => {
      const m = g.scene;
      m.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      const bb = new THREE.Box3().setFromObject(m);
      const size = bb.getSize(new THREE.Vector3());
      const scale = ROBOT_HEIGHT / Math.max(size.y, 0.01);
      m.scale.setScalar(scale);
      const bb2 = new THREE.Box3().setFromObject(m);
      m.position.x -= (bb2.min.x + bb2.max.x) / 2;
      m.position.z -= (bb2.min.z + bb2.max.z) / 2;
      m.position.y -= bb2.min.y;
      robot.add(m);
    }, undefined, () => {});

    const keys = {};
    const onKeyDown = (e) => { keys[e.key.toLowerCase()] = true; };
    const onKeyUp = (e) => { keys[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    let gamepadIndex = null;
    // Only accept a standard-mapping pad — some Windows HID peripherals
    // (wireless mouse/keyboard dongles, headset controls) fire a genuine
    // "gamepadconnected" event with a non-standard mapping and drifting
    // axis values, which without this check gets treated as a real
    // controller and spins the camera on its own with nothing plugged in.
    const onGpConnect = (e) => { if (e.gamepad.mapping === "standard") gamepadIndex = e.gamepad.index; };
    const onGpDisconnect = (e) => { if (gamepadIndex === e.gamepad.index) gamepadIndex = null; };
    window.addEventListener("gamepadconnected", onGpConnect);
    window.addEventListener("gamepaddisconnected", onGpDisconnect);
    try {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (const g of pads) { if (g && g.connected && g.mapping === "standard") { gamepadIndex = g.index; break; } }
    } catch {}
    const GP_DEADZONE = 0.15;
    const gpAxis = (v) => (Math.abs(v) < GP_DEADZONE ? 0 : v);

    // Footstep thud — a heavy low-frequency thump every couple of strides,
    // timed off distance traveled rather than a fixed interval so it speeds
    // up and slows down with the robot's own pace.
    let audioCtx = null;
    const thud = () => {
      if (!audioCtx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; audioCtx = new AC(); }
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator(); osc.type = "sine";
      osc.frequency.setValueAtTime(60, now); osc.frequency.exponentialRampToValueAtTime(28, now + 0.25);
      const gain = audioCtx.createGain(); gain.gain.setValueAtTime(0.5, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.4);
    };

    let camAz = Math.PI, camEl = 0.32;
    let strideDist = 0;
    let shakeT = 0;
    let facing = Math.PI;
    const clock = new THREE.Clock();
    let raf;
    const animate = () => {
      if (cancelled) return;
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.05, clock.getDelta());

      const jv = liveRef?.current?.joyVec || { x: 0, y: 0 };
      const tv = liveRef?.current?.turnVec || { x: 0, y: 0 };
      const gp = (gamepadIndex !== null && navigator.getGamepads) ? navigator.getGamepads()[gamepadIndex] : null;
      const gMoveX = gp ? gpAxis(gp.axes[2] || 0) : 0, gMoveY = gp ? gpAxis(gp.axes[3] || 0) : 0;
      const gLookX = gp ? gpAxis(gp.axes[0] || 0) : 0;
      let mx = (keys["d"] || keys["arrowright"] ? 1 : 0) - (keys["a"] || keys["arrowleft"] ? 1 : 0);
      let mz = (keys["s"] || keys["arrowdown"] ? 1 : 0) - (keys["w"] || keys["arrowup"] ? 1 : 0);
      if (!mx && !mz) { mx = gMoveX || jv.x; mz = gMoveY || jv.y; }
      let lookX = (keys["q"] ? -1 : 0) + (keys["e"] ? 1 : 0);
      if (!lookX) lookX = gLookX || tv.x;
      camAz += lookX * 1.4 * dt;

      const mag = Math.hypot(mx, mz);
      const speed = 5.5; // giant strides eat ground fast despite the mass
      if (mag > 0.05) {
        // Camera-relative: rotate raw input by the camera's own azimuth
        // before applying to position (CLAUDE.md convention).
        const rx = mx * Math.cos(camAz) - mz * Math.sin(camAz);
        const rz = mx * Math.sin(camAz) + mz * Math.cos(camAz);
        const nrm = Math.min(1, mag);
        robot.position.x += (rx / mag) * nrm * speed * dt;
        robot.position.z += (rz / mag) * nrm * speed * dt;
        facing = Math.atan2(rx, rz);
        strideDist += speed * nrm * dt;
        if (strideDist > 5.5) { strideDist = 0; thud(); shakeT = 1; }
      }
      // Shortest-path rotation toward the facing angle.
      let da = facing - robot.rotation.y;
      da = ((da + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      robot.rotation.y += da * Math.min(1, dt * 6);

      shakeT = Math.max(0, shakeT - dt * 3.2);
      const camDist = 16, camHeight = 7;
      const camX = robot.position.x - Math.sin(camAz) * camDist * Math.cos(camEl);
      const camZ = robot.position.z - Math.cos(camAz) * camDist * Math.cos(camEl);
      const camY = robot.position.y + camHeight + camDist * Math.sin(camEl);
      const shake = shakeT * 0.25;
      camera.position.set(
        camX + (Math.random() - 0.5) * shake,
        camY + (Math.random() - 0.5) * shake,
        camZ + (Math.random() - 0.5) * shake
      );
      camera.lookAt(robot.position.x, robot.position.y + ROBOT_HEIGHT * 0.55, robot.position.z);

      if (powerRef.current) powerRef.current.textContent = Math.round(70 + Math.sin(clock.elapsedTime * 0.7) * 8) + "%";

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("gamepadconnected", onGpConnect);
      window.removeEventListener("gamepaddisconnected", onGpDisconnect);
      if (audioCtx) audioCtx.close();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach(disposeMaterial);
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="off3-space-wrap">
      <div ref={mountRef} className="off3-space-canvas" style={{ cursor: "default" }} />
      <div className="off3-space-hint">היפריון · WASD / ג'ויסטיק ימני לתזוזה · Q/E או ג'ויסטיק שמאלי לסיבוב מצלמה</div>
      <div className="off3-drive-hud">
        <div><span>כוח ליבה</span><b ref={powerRef}>70%</b></div>
      </div>
      <button className="off3-space-return" onClick={onReturn}>🚪 חזרה לאנגר</button>
    </div>
  );
}

// Hebrew labels for the God Mode "Super-Detailed" spec panel — every
// registerEditable() call attaches a metadata object keyed like this.
const GOD_META_LABELS = {
  id: "מזהה", origin_date: "תאריך התקנה", material_spec: "חומרים", security_level: "רמת אבטחה",
  maintenance_status: "סטטוס תחזוקה", firmware: "קושחה", resolution: "רזולוציה", night_vision: "ראיית לילה",
  coverage_angle: "זווית כיסוי", battery_status: "מצב סוללה", storage: "אחסון", channels: "ערוצים",
};

// Loading-screen feature tour — shown while the sim finishes assembling, so
// the wait teaches instead of just sitting on a percentage. Kept as data so
// it's easy to extend as new systems ship.
const SIM_TIPS = [
  { icon: "🕹️", title: "תנועה", desc: "ג'ויסטיק ימני לתזוזה, שמאלי למצלמה/מבט (הפוך בגוף ראשון) · WASD/חצים + Shift לספרינט במחשב · תומך גם בג'ויסטיק פיזי (Xbox/PlayStation)." },
  { icon: "💬", title: "שיחה עם הצוות", desc: "התקרב לכל סוכן ודבר איתו בקול או בכתיבה — לכל אחד אישיות, תפקיד ונתונים אמיתיים משלו." },
  { icon: "🛠️", title: "God Mode", desc: "עורך תלת-ממד מלא: גרור, סובב והתאם כל אובייקט בזמן אמת, כולל תאורה ומהירות סוכנים." },
  { icon: "🔋", title: "קפסולות טעינה", desc: "הרובוטים עוגנים בקפסולה משלהם — מרחפים, זוהרים וניצוצות חשמל כשהם נטענים בפועל." },
  { icon: "🚛", title: "שולחן המלחמה", desc: "גרור משאית התקנה ליום בלוח השבועי כדי לתזמן — מיכל תאשר בהודעה." },
  { icon: "₿", title: "איזור המסחר", desc: "נרות תלת-ממד שצומחים מהרצפה לפי מחיר BTC/USDT חי מ-Binance." },
  { icon: "🐾", title: "משחק לאורי", desc: "לצד הבית שליד ההאנגר — משחק צבעים/צורות ידידותי לגיל 3, ללא כישלון, רק עידוד." },
  { icon: "📄", title: "ייצוא להנהלת חשבונות", desc: "טרמינל ייעודי מפיק PDF נקי לבדיקת מור מתוך נתוני העסק האמיתיים." },
  { icon: "🚗", title: "מוסך Tiggo 7", desc: "לוח מידע מרחף ליד הרכב: סוללה, קילומטראז' ומעקב הלוואת בלון." },
  { icon: "🎉", title: "מצב חגיגה", desc: "סגירת עסקה גדולה ליד שולחן המלחמה מדליקה לייזרים, מחשיכה ומנגנת ביט חגיגי." },
  { icon: "📹", title: "מצלמת רחפן", desc: "מקש C מנתק למצלמת 360° מדומה עם עיוות עין-דג ורעש CRT, בדיוק כמו במצלמות האמיתיות." },
  { icon: "⏩", title: "מחוגת זמן", desc: "ב-God Mode: מריצה יום/לילה, יוצרת נרות עתידיים ומתזמנת תחזיות בשולחן המלחמה." },
  { icon: "🌌", title: "Lights Out", desc: "מצב מועדון UV: התאורה מתעמעמת והקפסולות/ההולוגרמה זוהרות בניאון." },
  { icon: "🛫", title: "סימולטור טיסה", desc: "מטוס קרב, חוף אמיתי עם ים ויבשה, ולוח מכשירים מלא — מהירות, גובה, קצב טיפוס ואופק מלאכותי." },
  { icon: "🏛️", title: "ההאנגר והבית", desc: "פסל היפריון, מפרץ רכבים, בית מפורט ופינת פוקימון — כולם נגישים מהמשרד." },
];

// Module 3: kids color/shape-finding game targets — big, high-contrast,
// unambiguous shapes for a 3-year-old (Ori) to match against a spoken/
// written prompt.
const KIDS_SHAPES = [
  { id: "orange", label: "כתום", color: "#ff8c42", shape: "circle" },
  { id: "blue", label: "כחול", color: "#3fc6ff", shape: "square" },
  { id: "green", label: "ירוק", color: "#3fd79a", shape: "triangle" },
  { id: "purple", label: "סגול", color: "#b84bff", shape: "star" },
];

export default function Office3D({ chars, byId, phase, phases, deskPositions, seatPositions, dineTablePositions, meetingSpot, bizData, marketRows, weather, voice, onClose, onOpenChat, onAutoFix, onTalkChange, agentVoiceDefaults }) {
  const mountRef = useRef(null);
  const liveRef = useRef({ chars, phase, bizData, weather, joyVec: { x: 0, y: 0 }, turnVec: { x: 0, y: 0 }, keys: {}, firstPerson: false });
  const [talkTarget, setTalkTarget] = useState(null);
  // Tell the owning scheduler who (if anyone) you're actively in a live
  // conversation with, so it can hold that agent in place and pause the
  // random meeting sweep instead of having other agents interrupt.
  useEffect(() => { onTalkChange?.(talkTarget); }, [talkTarget, onTalkChange]);
  // Sitting on your own chair in your office ("שב"/"קום" button, or E key when
  // near the chair). While seated, look input just turns your head/view —
  // only the explicit stand button (or E) actually gets you up.
  const [sitting, setSitting] = useState(false);
  const [canSit, setCanSit] = useState(false);
  // "Feet on the desk" — a relaxed recline toggle, only available while
  // seated (auto-clears the moment you stand).
  const [feetUp, setFeetUp] = useState(false);
  useEffect(() => { if (!sitting) setFeetUp(false); }, [sitting]);
  // Space portal (owner request): walk into the glowing ring at the office
  // edge and get whisked into a full solar-system view; a return button
  // brings you back. The office's own renderer/scene keep running quietly
  // underneath — simpler and safer than trying to pause the existing
  // animate() loop, and the overlay's opaque background + pointer-events
  // hide/block it completely while active.
  const [inSpace, setInSpace] = useState(false);
  useEffect(() => { liveRef.current.inSpace = inSpace; }, [inSpace]);
  // Flight simulator — walk up to the RQ-180 display near the window and a
  // "Take Flight" prompt appears, same pattern as the vehicle/space portal.
  const [nearPlane, setNearPlane] = useState(false);
  const [inFlight, setInFlight] = useState(false);
  useEffect(() => { liveRef.current.setNearPlane = setNearPlane; }, []);
  // Hangar — a garage-door portal on the west wall leads to a separate
  // walkable hangar area (Hyperion statue + vehicle bay + the house beyond
  // its open door), same "walk up, prompt appears" pattern as the plane.
  const [nearHangar, setNearHangar] = useState(false);
  const [inHangar, setInHangar] = useState(false);
  // Driving mini-mode, entered from beside the parked Tiggo 7 inside the
  // Hangar — nested under inHangar (stays true the whole time) rather than
  // its own top-level pause flag, so the main office scene's existing
  // inHangar pause guard already covers it with no extra wiring.
  const [inDrive, setInDrive] = useState(false);
  const [driveVehicle, setDriveVehicle] = useState("car");
  // Giant-robot piloting mode, entered from beside the Hyperion statue —
  // same nested-under-inHangar reasoning as inDrive above.
  const [inRobot, setInRobot] = useState(false);
  useEffect(() => { liveRef.current.setNearHangar = setNearHangar; }, []);
  useEffect(() => { liveRef.current.inHangar = inHangar; }, [inHangar]);
  // Real business activity, normalized 0..1 — drives the space portal's
  // orbit speed (busier pipeline = faster orbits), not a random wobble.
  const spacePortalLoad = Math.min(1, ((bizData?.openDeals || 0) + (bizData?.fleetProjects || 0) * 2) / 20);
  // Security tab feed — real Heavy Guard fleet/pipeline signal (bizData),
  // not fabricated DVR events: a stuck deal or an active fleet project is
  // an actual thing worth a tactical notification, so we surface exactly
  // that instead of inventing camera alerts with no data behind them.
  const securityAlerts = useMemo(() => {
    const b = bizData || {};
    const out = [];
    if (b.staleCount > 0) out.push({ level: "high", text: `${b.staleCount} עסקאות תקועות מעל שבוע (הישנה ביותר: ${b.staleDays || 0} ימים)` });
    if (b.fleetProjects > 0) out.push({ level: "mid", text: `${b.fleetProjects} פרויקטי צי פעילים במעקב` });
    if (b.openDeals > 0) out.push({ level: "low", text: `${b.openDeals} עסקאות פתוחות בצנרת (₪${Math.round(b.openVal || 0).toLocaleString()})` });
    if (out.length === 0) out.push({ level: "low", text: "אין התראות פעילות — כל המערכות תקינות" });
    return out;
  }, [bizData]);
  // God Mode — owner-only admin overlay (off by default): click-select the
  // car/trucks/portal/spawned props and transform/delete them, spawn new
  // ones, pause the sim clock, and override the light level.
  const [godOpen, setGodOpen] = useState(false);
  const [selectedObj, setSelectedObj] = useState(null);
  const [godPaused, setGodPaused] = useState(false);
  const [godLight, setGodLight] = useState(1);
  const [godGlow, setGodGlow] = useState(1); // bloom-strength multiplier — separate from raw light intensity
  const [godSpeed, setGodSpeed] = useState(1); // agent walk-speed multiplier — Command Center dial
  // Blueprint Tactical Mode — God Mode's construction view: the whole scene
  // drops to a cyan wireframe schematic over a laser floor grid, and every
  // position change snaps to a 0.5m grid for precision placement.
  const [blueprint, setBlueprint] = useState(false);
  const [gizmoMode, setGizmoMode] = useState("translate"); // translate | rotate | scale — on-canvas TransformControls handle
  // Stand Still — God Mode's movement lock: dragging the on-canvas gizmo (or
  // just clicking to select an object) shares the same pointer as the walk
  // joystick, so without this the player would wander off mid-edit. Freezes
  // both translation and turning until released.
  const [standStill, setStandStill] = useState(false);
  // State Persistence — named office layouts (saved spawned props only).
  const [showLoadPrompt, setShowLoadPrompt] = useState(false);
  const [layoutNames, setLayoutNames] = useState([]);
  const [layoutNameInput, setLayoutNameInput] = useState("");
  const [layoutMsg, setLayoutMsg] = useState("");
  // Enter Vehicle — walk up to the showroom car, hop in: camera moves to a
  // driver POV and a monitoring HUD replaces the normal walk-around HUD.
  // No actual driving (there's nowhere to drive inside a single office
  // floor) — this is the monitoring/inspection use the ask was really
  // about, framed honestly rather than faking a driving sim.
  const [nearVehicle, setNearVehicle] = useState(false);
  const [inVehicle, setInVehicle] = useState(false);
  useEffect(() => { liveRef.current.inVehicle = inVehicle; }, [inVehicle]);
  useEffect(() => { liveRef.current.inFlight = inFlight; }, [inFlight]);
  useEffect(() => { liveRef.current.setInVehicle = setInVehicle; liveRef.current.setNearVehicle = setNearVehicle; }, []);
  // Truck info signs: standing near a truck's podium sign fetches (and
  // caches) a short real-world blurb about that model from the free
  // DuckDuckGo Instant Answer API — no key, no cost.
  const [nearTruck, setNearTruck] = useState(null); // { label } | null
  const [truckInfo, setTruckInfo] = useState({}); // label -> "loading" | text | "unavailable"
  useEffect(() => { liveRef.current.setNearTruck = setNearTruck; }, []);
  useEffect(() => {
    if (!nearTruck || truckInfo[nearTruck.label]) return;
    let cancelled = false;
    setTruckInfo((p) => ({ ...p, [nearTruck.label]: "loading" }));
    fetchTruckBlurb(nearTruck.label).then((text) => {
      if (!cancelled) setTruckInfo((p) => ({ ...p, [nearTruck.label]: text || "אין מידע זמין כרגע." }));
    });
    return () => { cancelled = true; };
  }, [nearTruck]);
  // Twin-stick walk controls — the standard game-controller layout: a fixed
  // left stick for movement, a fixed right stick for turning/looking, each
  // anchored to its own corner instead of the old single stick that floated
  // wherever you first touched (which also meant any click anywhere on the
  // canvas — including a God Mode gizmo drag — doubled as a walk input).
  const [leftKnob, setLeftKnob] = useState({ x: 0, y: 0 });
  const [leftActive, setLeftActive] = useState(false);
  const [rightKnob, setRightKnob] = useState({ x: 0, y: 0 });
  const [rightActive, setRightActive] = useState(false);
  const [firstPerson, setFirstPerson] = useState(false);
  const [voiceState, setVoiceState] = useState("idle"); // idle | listening | thinking | speaking
  const [voiceLine, setVoiceLine] = useState(null);      // { who, text } subtitle — sticky, only the user's own X closes it
  // 📱 ALPHA-LINK-01 — the owner's tactical secure terminal: a HUD handset
  // that mirrors the live conversation (the same lines the 3D hologram
  // projects) plus a control tab for the main assistant and every system.
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phoneTab, setPhoneTab] = useState("home");
  const [phoneLog, setPhoneLog] = useState([]);
  // Spotify — a simple embed widget (no login/API key): paste any public
  // track/album/playlist/show link and it plays via Spotify's own official
  // embed iframe, reusing the same phoneEmbed viewer as the trade system.
  const [spotifyUrl, setSpotifyUrlState] = useState(() => { try { return localStorage.getItem("alpha:office:spotifyUrl") || ""; } catch { return ""; } });
  const setSpotifyUrl = (u) => { setSpotifyUrlState(u); try { localStorage.setItem("alpha:office:spotifyUrl", u); } catch {} };
  const toSpotifyEmbedUrl = (input) => {
    // Accepts a plain share link (open.spotify.com/playlist/ID), an already-
    // built embed link (open.spotify.com/embed/playlist/ID), or the full
    // <iframe> snippet Spotify's own "Share → Embed" dialog gives you (which
    // most people actually copy-paste, not the raw link) — pull the src out
    // of that first if that's what got pasted in.
    const srcMatch = (input || "").match(/src=["']([^"']+)["']/);
    const url = srcMatch ? srcMatch[1] : (input || "");
    const m = url.match(/open\.spotify\.com\/(?:embed\/)?(?:intl-\w+\/)?(track|album|playlist|show|episode|artist)\/([a-zA-Z0-9]+)/);
    return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?theme=0` : null;
  };
  // A brief "biometric unlock" beat plays every time the terminal wakes —
  // pure CSS animation gated by this flag, cleared after it finishes.
  const [phoneUnlocking, setPhoneUnlocking] = useState(false);
  const [phoneClock, setPhoneClock] = useState(() => new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }));
  useEffect(() => {
    const iv = setInterval(() => setPhoneClock(new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })), 15000);
    return () => clearInterval(iv);
  }, []);
  // Sandbox mode: HeavyGuard/CRM/TRADE render inside the phone's own iframe
  // instead of navigating away, so the user never leaves the simulation.
  const [phoneEmbed, setPhoneEmbed] = useState(null); // { url, title } | null
  // Maximize: a short 3D flip-and-scale beat (CSS-driven, see .off3-phone-flip)
  // bridges the small corner terminal into a big centered one you can actually
  // work with, then flips back the same way on close/minimize.
  const [phoneMaximized, setPhoneMaximized] = useState(false);
  const [phoneFlipping, setPhoneFlipping] = useState(false);
  const togglePhoneMax = () => {
    setPhoneFlipping(true);
    try { navigator.vibrate?.(10); } catch {}
    setTimeout(() => { setPhoneMaximized((v) => !v); setPhoneFlipping(false); }, 420);
  };
  // Camera app — a real getUserMedia preview, snap-to-canvas capture, and a
  // small saved-photos gallery (persisted so photos survive closing the phone).
  const camVideoRef = useRef(null);
  const camStreamRef = useRef(null);
  const [camError, setCamError] = useState("");
  const [phonePhotos, setPhonePhotos] = useState(() => {
    try { return JSON.parse(localStorage.getItem("alpha_phone_photos_v1") || "[]"); } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem("alpha_phone_photos_v1", JSON.stringify(phonePhotos.slice(0, 24))); } catch {}
  }, [phonePhotos]);
  useEffect(() => {
    const active = !phoneEmbed && phoneTab === "cam";
    if (!active) {
      if (camStreamRef.current) { camStreamRef.current.getTracks().forEach((t) => t.stop()); camStreamRef.current = null; }
      return;
    }
    let cancelled = false;
    setCamError("");
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        camStreamRef.current = stream;
        if (camVideoRef.current) camVideoRef.current.srcObject = stream;
      })
      .catch(() => { if (!cancelled) setCamError("אין גישה למצלמה — בדוק הרשאות דפדפן"); });
    return () => {
      cancelled = true;
      if (camStreamRef.current) { camStreamRef.current.getTracks().forEach((t) => t.stop()); camStreamRef.current = null; }
    };
  }, [phoneTab, phoneEmbed]);
  const snapPhoto = () => {
    const v = camVideoRef.current;
    if (!v || !v.videoWidth) return;
    const cvs = document.createElement("canvas");
    cvs.width = v.videoWidth; cvs.height = v.videoHeight;
    cvs.getContext("2d").drawImage(v, 0, 0);
    const dataUrl = cvs.toDataURL("image/jpeg", 0.9);
    setPhonePhotos((p) => [{ id: Date.now() + "_" + Math.random().toString(36).slice(2, 6), dataUrl, ts: new Date().toISOString() }, ...p].slice(0, 24));
    try { navigator.vibrate?.(18); } catch {}
  };
  const downloadPhoto = (p) => {
    const a = document.createElement("a");
    a.href = p.dataUrl; a.download = "alpha-" + p.id + ".jpg";
    document.body.appendChild(a); a.click(); a.remove();
  };
  const deletePhoto = (id) => setPhonePhotos((p) => p.filter((x) => x.id !== id));
  useEffect(() => { liveRef.current.phoneOpen = phoneOpen; }, [phoneOpen]);
  useEffect(() => {
    if (!phoneOpen) return;
    setPhoneUnlocking(true);
    try { navigator.vibrate?.(14); } catch {}
    const t = setTimeout(() => setPhoneUnlocking(false), 550);
    return () => clearTimeout(t);
  }, [phoneOpen]);
  useEffect(() => {
    liveRef.current.voiceLine = voiceLine;
    if (voiceLine && voiceLine.text) setPhoneLog((p) => [...p.slice(-11), voiceLine]);
  }, [voiceLine]);
  const recogRef = useRef(null);
  const leftDrag = useRef(null);
  const rightDrag = useRef(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Model-download progress for the branded loading overlay (0..100, then
  // null once the ENTIRE scene — not just the network downloads — is built
  // and the animate loop has actually started; previously this went null
  // right after the GLB downloads finished, while the much longer
  // synchronous scene-construction (hundreds of objects, procedural
  // textures/shaders, NPC rigging) still had to run, so the sim visibly
  // popped in/stuttered together for a few seconds right after "loading" said
  // it was done. loadPhase distinguishes the two stages for the overlay text.
  const [loadPct, setLoadPct] = useState(0);
  const [loadPhase, setLoadPhase] = useState("download"); // "download" | "build"
  // Loading-screen feature tour — auto-advances every 4.2s, and doubles as
  // the "interactive" bit via the clickable dots below it.
  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    if (loadPct === null) return; // overlay is gone — stop ticking
    const t = setInterval(() => setTipIndex((i) => (i + 1) % SIM_TIPS.length), 4200);
    return () => clearInterval(t);
  }, [loadPct]);
  // DeviceProfiler picks the *first-run* default for graphicsHigh/turbo
  // (iPad/mobile-low starts lean, desktop starts maxed) — a saved manual
  // choice in localStorage always wins over the detected default. "מצב
  // חסכוני" (Comfort Mode, set from the main dashboard before the sim ever
  // opens) outranks even a saved manual choice — it's an explicit "this
  // machine needs the light path, full stop" declaration.
  const { budget: perfBudget } = useDeviceProfile();
  const comfortMode = (() => { try { return localStorage.getItem("alpha:comfortMode") === "1"; } catch { return false; } })();
  const [graphicsHigh, setGraphicsHigh] = useState(() => {
    if (comfortMode) return false;
    try { const v = localStorage.getItem("alpha:agents:graphicsHigh"); if (v !== null) return v === "1"; } catch {}
    return perfBudget.graphicsHigh;
  }); // bloom + SSAO on/off, for low-end devices
  useEffect(() => { try { localStorage.setItem("alpha:agents:graphicsHigh", graphicsHigh ? "1" : "0"); } catch {} }, [graphicsHigh]);
  // Turbo mode 🚀 — the "make it actually smooth" switch for machines where
  // the sim stutters (the owner's Mac): renders at 1x DPR straight through
  // the renderer (no post chain), drops shadows, freezes the CCTV feed,
  // hides the sky-life extras and the live iframe wall. Persisted so a
  // laggy machine stays fast on the next visit.
  const [turbo, setTurbo] = useState(() => {
    if (comfortMode) return true;
    try { const v = localStorage.getItem("alpha:agents:turbo"); if (v !== null) return v === "1"; } catch {}
    return perfBudget.turbo;
  });
  useEffect(() => {
    liveRef.current.setTurbo?.(turbo);
    try { localStorage.setItem("alpha:agents:turbo", turbo ? "1" : "0"); } catch {}
  }, [turbo]);
  // UV Nightclub Mode — "lights out", blacklight-reactive pods/hologram.
  const [nightclub, setNightclub] = useState(false);
  useEffect(() => { liveRef.current.setNightclub?.(nightclub); }, [nightclub]);
  // ── ALPHA MEGA-PATCH V1.0 — module state ──────────────────────────────
  const [warToast, setWarToast] = useState(null); // Module 1 — Michal's scheduling toast
  useEffect(() => {
    liveRef.current.showToast = (msg) => { setWarToast(msg); };
  }, []);
  useEffect(() => {
    if (!warToast) return;
    const t = setTimeout(() => setWarToast(null), 3600);
    return () => clearTimeout(t);
  }, [warToast]);
  const [nearWarTable, setNearWarTable] = useState(false); // Module 1/7 proximity
  useEffect(() => { liveRef.current.setNearWarTable = setNearWarTable; }, []);
  const [nearBookkeeper, setNearBookkeeper] = useState(false); // Module 4 proximity
  useEffect(() => { liveRef.current.setNearBookkeeper = setNearBookkeeper; }, []);
  const [nearCommLink, setNearCommLink] = useState(false); // Module 5 proximity
  useEffect(() => { liveRef.current.setNearCommLink = setNearCommLink; }, []);
  const [kidsGame, setKidsGame] = useState(false); // Module 3 minigame overlay
  const [kidsPrompt, setKidsPrompt] = useState(null);
  const [kidsFeedback, setKidsFeedback] = useState(null);
  const [nearKids, setNearKids] = useState(false);
  useEffect(() => { liveRef.current.setNearKids = setNearKids; }, []);
  useEffect(() => {
    liveRef.current.toggleKidsGame = () => setKidsGame((v) => {
      const next = !v;
      if (next) setKidsPrompt(KIDS_SHAPES[Math.floor(Math.random() * KIDS_SHAPES.length)].id);
      return next;
    });
  }, []);
  const pickKidsShape = (id) => {
    if (id === kidsPrompt) {
      setKidsFeedback("yay");
      setTimeout(() => {
        setKidsFeedback(null);
        setKidsPrompt(KIDS_SHAPES[Math.floor(Math.random() * KIDS_SHAPES.length)].id);
      }, 900);
    } else {
      setKidsFeedback("try");
      setTimeout(() => setKidsFeedback(null), 700);
    }
  };
  const [drone, setDrone] = useState(false); // Module 8
  useEffect(() => { liveRef.current.setDrone?.(drone); }, [drone]);
  useEffect(() => { liveRef.current.reactSetDrone = setDrone; }, []);
  const [dilation, setDilationState] = useState(0); // Module 9 — 0..1 slider
  useEffect(() => { liveRef.current.setTimeDilation?.(dilation); }, [dilation]);
  // Adaptive perf watchdog needs the real React setter (distinct from the
  // imperative liveRef.current.setTurbo above, which only pushes an
  // already-decided value INTO the scene) so a sustained-low-FPS detection
  // inside animate() can actually flip the state and have it flow through
  // the normal one-way binding, same as a manual toggle would.
  useEffect(() => { liveRef.current.reactSetTurbo = setTurbo; }, []);
  const [autoTurboNotice, setAutoTurboNotice] = useState(false);
  useEffect(() => { liveRef.current.setAutoTurboNotice = setAutoTurboNotice; }, []);
  // Whether the mic should keep re-listening on its own while you're near an
  // agent — on by default (mic is "always listening" while in the sim), the
  // user can pause it (mic button, or the settings panel) without losing the
  // conversation text on screen. State (not a ref) so the settings panel can
  // show and toggle it.
  const [autoListen, setAutoListen] = useState(true);
  // Mic protocol: while the office radio is broadcasting, the always-
  // listening mic goes quiet (otherwise it'd try to transcribe the
  // stream) — a live recognition session is cut short too. Whatever the
  // user had autoListen set to before the broadcast is restored after.
  const autoListenBeforeRadioRef = useRef(true);
  // Persistent radio — the player itself lives mounted for the whole office
  // session (see the always-mounted .off3-phone below), this just tracks
  // "is it on and what's playing" for the mini-widget shown when the
  // phone's closed, and exposes toggle() via radioRef for that widget.
  const radioRef = useRef(null);
  const [radioPlaying, setRadioPlaying] = useState(false);
  const [radioStationName, setRadioStationName] = useState("");
  const handleRadioPlayState = (isPlaying, stationName) => {
    if (stationName) setRadioStationName(stationName);
    // Edge-triggered: switching stations mid-broadcast re-fires this with
    // isPlaying still true, which must NOT re-run the mute/restore dance
    // (that would stomp the saved autoListen value with "false").
    setRadioPlaying((wasPlaying) => {
      if (isPlaying && !wasPlaying) {
        autoListenBeforeRadioRef.current = autoListen;
        setAutoListen(false);
        try { recogRef.current?.stop(); } catch {}
        setVoiceState((s) => (s === "listening" ? "idle" : s));
      } else if (!isPlaying && wasPlaying) {
        setAutoListen(autoListenBeforeRadioRef.current);
      }
      return isPlaying;
    });
  };
  // Voice picker — same localStorage key App.jsx's speakText() reads, so
  // choosing a voice here actually changes what every agent sounds like,
  // both in the sim and in the regular text-chat modal.
  const [voiceList, setVoiceList] = useState([]);
  const [voiceUri, setVoiceUriState] = useState(() => { try { return localStorage.getItem("alpha:agents:voiceUri") || ""; } catch { return ""; } });
  const setVoiceUri = (uri) => { setVoiceUriState(uri); try { localStorage.setItem("alpha:agents:voiceUri", uri); } catch {} };
  // Reply language — same localStorage key App.jsx's askAI()/speakText() read,
  // so switching it here changes what every agent (sim, chat modal, briefings,
  // trading) actually replies in, not just this panel's own labels.
  const [agentLang, setAgentLangState] = useState(() => { try { return localStorage.getItem("alpha:agents:lang") || "he"; } catch { return "he"; } });
  const setAgentLang = (lang) => { setAgentLangState(lang); try { localStorage.setItem("alpha:agents:lang", lang); } catch {} };
  // Per-agent voice overrides — same localStorage key prefix App.jsx's
  // speakText()/agentVoiceProfile() read, so a voice/speed/pitch picked here
  // for one agent actually changes how just that agent sounds everywhere
  // (sim, chat modal, briefings), not the whole team at once.
  const [voiceAgentId, setVoiceAgentId] = useState(() => (chars[0] && chars[0].id) || "");
  const readAgentVoiceCfg = (id) => { try { return JSON.parse(localStorage.getItem("alpha:agents:voiceCfg:" + id) || "null") || {}; } catch { return {}; } };
  const writeAgentVoiceCfg = (id, patch) => {
    const cur = readAgentVoiceCfg(id);
    try { localStorage.setItem("alpha:agents:voiceCfg:" + id, JSON.stringify({ ...cur, ...patch })); } catch {}
    setVoiceCfgTick((t) => t + 1);
  };
  const [, setVoiceCfgTick] = useState(0); // forces a re-render after a localStorage write above
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
  useEffect(() => { liveRef.current.feetUp = feetUp; }, [feetUp]);
  useEffect(() => { liveRef.current.phase = phase; }, [phase]);
  useEffect(() => { liveRef.current.bizData = bizData; }, [bizData]);
  useEffect(() => { liveRef.current.marketRows = marketRows; }, [marketRows]);
  useEffect(() => { liveRef.current.weather = weather; }, [weather]);
  useEffect(() => { liveRef.current.securityAlerts = securityAlerts; }, [securityAlerts]);
  useEffect(() => { liveRef.current.onAutoFix = onAutoFix; }, [onAutoFix]);
  // Push the graphics-quality toggle down into the postprocessing passes
  // once they exist (they're created inside the async mount effect below).
  useEffect(() => { liveRef.current.setGraphicsHigh?.(graphicsHigh); }, [graphicsHigh]);
  useEffect(() => { liveRef.current.godMode = godOpen; if (!godOpen) { liveRef.current.deselect?.(); setBlueprint(false); setStandStill(false); } }, [godOpen]);
  useEffect(() => { liveRef.current.standStill = standStill; }, [standStill]);
  useEffect(() => { liveRef.current.setBlueprint?.(blueprint); }, [blueprint]);
  useEffect(() => { liveRef.current.setGizmoMode?.(gizmoMode); }, [gizmoMode]);
  useEffect(() => { liveRef.current.godPaused = godPaused; }, [godPaused]);
  useEffect(() => { liveRef.current.godLightMul = godLight; }, [godLight]);
  useEffect(() => { liveRef.current.godGlowMul = godGlow; }, [godGlow]);
  useEffect(() => { liveRef.current.godSpeedMul = godSpeed; }, [godSpeed]);
  useEffect(() => { liveRef.current.setSelectedObj = setSelectedObj; }, []);
  useEffect(() => { liveRef.current.setShowLoadPrompt = setShowLoadPrompt; liveRef.current.setLayoutNames = setLayoutNames; }, []);
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
      HG_LOGO_TEX.anisotropy = MAX_ANISO;
      // One shared manager so the loading overlay can show real download
      // progress across all five models instead of an indeterminate spinner.
      const manager = new THREE.LoadingManager();
      manager.onProgress = (_url, loaded, total) => {
        if (!cancelled && total > 0) setLoadPct(Math.min(99, Math.round((loaded / total) * 100)));
      };
      const [deskTemplate, laptopTemplate, charGltf, furnitureTemplate, officeDecorTemplate, robotGltf, sophiaGltf] = await Promise.all([
        loadGltf(base + DESK_MODEL_URL, manager).catch((e) => { console.error("[office3d] desk model failed to load", e); return null; }),
        loadGltf(base + LAPTOP_MODEL_URL, manager).catch((e) => { console.error("[office3d] laptop model failed to load", e); return null; }),
        loadGltfFull(base + CHAR_MODEL_URL, manager).catch((e) => { console.error("[office3d] character model failed to load", e); return null; }),
        loadGltf(base + FURNITURE_MODEL_URL, manager).catch((e) => { console.error("[office3d] furniture model failed to load", e); return null; }),
        loadGltf(base + OFFICE_DECOR_MODEL_URL, manager).catch((e) => { console.error("[office3d] office decor model failed to load", e); return null; }),
        loadGltfFull(base + ROBOT_MODEL_URL, manager).catch((e) => { console.error("[office3d] robot model failed to load", e); return null; }),
        loadGltfFull(base + SOPHIA_MODEL_URL, manager).catch((e) => { console.error("[office3d] sophia model failed to load", e); return null; }),
      ]);
      if (cancelled) return;
      setLoadPct(99);
      setLoadPhase("build"); // downloads are in — the overlay stays up while the world is actually assembled
      const charTemplate = charGltf ? charGltf.scene : null;
      const charClips = charGltf ? charGltf.animations : [];
      // Falls back to the human model/clips if the robot ever fails to load,
      // so a bad fetch degrades to "everyone looks human" instead of an
      // empty desk.
      const robotTemplate = robotGltf ? robotGltf.scene : charTemplate;
      const robotClips = robotGltf ? robotGltf.animations : charClips;
      const robotClipMap = robotGltf ? ROBOT_CLIP : CLIP;
      const sophiaTemplate = sophiaGltf ? sophiaGltf.scene : charTemplate;
      const sophiaClips = sophiaGltf ? sophiaGltf.animations : charClips;
      const sophiaClipMap = sophiaGltf ? SOPHIA_CLIP : CLIP;

    // "מצב חסכוני" (Comfort Mode) — a main-dashboard toggle for machines that
    // report as full desktops (no touch, wide screen — a 2020 MacBook Pro's
    // Intel/AMD integrated GPU included) but still can't carry the full
    // HDRI+SSAO+shadow pipeline. Unlike the in-sim turbo toggle, this is
    // read BEFORE any of the heavy one-time construction below runs (HDRI
    // download+prefilter, SSAO pass, shadow maps) — turbo only lightens
    // ongoing per-frame cost after that construction already happened, so it
    // can't help with a freeze that happens during the initial mount itself.
    let lowSpec = false;
    try { lowSpec = localStorage.getItem("alpha:comfortMode") === "1"; } catch {}
    const isMobile = lowSpec || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || ("ontouchstart" in window) || window.innerWidth < 900;
    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    // Desktop renders at its true device pixel ratio (most displays are
    // 2x, some are higher) rather than a flat 2x cap, for the sharpest
    // picture the screen can actually show; mobile stays lighter. The
    // existing auto-turbo safety net below (watches real frame times over
    // the first several seconds) still catches a GPU that can't keep up
    // and drops quality automatically, so this doesn't trade away smoothness.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 3));
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Cinematic colour: ACES filmic tone-mapping + sRGB output so the neon /
    // emissive materials roll off gracefully instead of clipping to flat white.
    // (The final tone-map/encode is done by OutputPass at the end of the
    // post-processing chain below.)
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Calibrated down from 1.1 — bright neon/emissive surfaces were crushing
    // to flat blinding white before the tone-mapper could roll them off.
    renderer.toneMappingExposure = 0.95;
    MAX_ANISO = renderer.capabilities.getMaxAnisotropy() || 8;
    // GLTF character/statue templates ship with no anisotropy set at all —
    // apply it once per shared template now that the real hardware max is
    // known (cloned agents reuse these same texture instances).
    applyAniso(charTemplate); applyAniso(robotTemplate); applyAniso(sophiaTemplate);
    mount.appendChild(renderer.domElement);
    // WebXR — a real VR entry point (not a stub): renderer.xr.enabled plus
    // the standard VRButton, feature-detected so it silently does nothing
    // on a browser/device with no XR support (desktop, most phones) rather
    // than showing a button that can't work. No hand-controller grabbing —
    // that's a separate, larger interaction layer — this is "you can put on
    // a headset and look around the office," the first real step toward it.
    renderer.xr.enabled = true;
    if (navigator.xr) {
      navigator.xr.isSessionSupported("immersive-vr").then((supported) => {
        if (!supported || cancelled) return;
        const btn = VRButton.createButton(renderer);
        // Default VRButton centers itself at the bottom, right where the
        // mic/talk bar lives — move it clear, to the bottom-left corner.
        btn.style.left = "14px";
        btn.style.right = "auto";
        btn.style.bottom = "160px";
        mount.appendChild(btn);
      }).catch(() => {});
    }

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
    // Mobile gets gentler bloom — post-processing is the first thing to
    // give up on a phone GPU (per the responsive perf budget). Lower
    // threshold + softer strength + wider radius than before: a broad soft
    // cinematic glow on genuinely bright surfaces instead of a narrow,
    // blinding halo that was washing out nearby text/detail.
    const BASE_BLOOM_STRENGTH = isMobile ? 0.22 : 0.38;
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), BASE_BLOOM_STRENGTH, 0.9, 0.4);
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
    // EffectComposer renders through its own WebGLRenderTargets, so the
    // renderer's own `antialias: true` context flag never actually applies
    // once post-processing is in the chain — a well-known three.js gotcha,
    // and the real cause of soft/jagged edges on the wireframes, HUD text
    // canvases and God Mode gizmo. SMAA (image-space, no extra render-target
    // cost like MSAA would need here) restores real edge sharpness; desktop
    // only — mobile stays on bloom/SSAO's existing lighter budget.
    let smaaPass = null;
    if (!isMobile) {
      smaaPass = new SMAAPass(width * renderer.getPixelRatio(), height * renderer.getPixelRatio());
      composer.addPass(smaaPass);
    }
    // Module 8: Heavy Guard 360° Drone/CCTV mode — fisheye + CRT static,
    // applied last (on the final sRGB image) so it reads as a camera/lens
    // effect, not a scene-lighting change. Off by default; 'C' toggles it.
    const dronePass = new ShaderPass(DroneCamShader);
    dronePass.enabled = false;
    composer.addPass(dronePass);
    // Settings-panel graphics toggle — both passes support .enabled out of
    // the box (base three.js Pass class), so this is a cheap on/off for
    // slower devices without rebuilding the composer chain. Turbo overrides
    // both passes off regardless of the quality toggle (turboOn is shared
    // with setTurbo, defined once the whole scene exists).
    let gfxHigh = graphicsHigh;
    let turboOn = false;
    // UV Nightclub Mode — the day/night lerp block below reads this and
    // targets deep indigo + 5% lights instead of the normal phase sky/sun
    // whenever it's on, so the switch fades in through the SAME smooth
    // damping the day/night system already uses (no separate transition code).
    let nightclubOn = false;
    const applyPasses = () => {
      bloomPass.enabled = gfxHigh && !turboOn;
      if (ssaoPass) ssaoPass.enabled = gfxHigh && !turboOn;
    };
    liveRef.current.setGraphicsHigh = (high) => { gfxHigh = high; applyPasses(); };
    liveRef.current.setGraphicsHigh(graphicsHigh);

    // ── Real HDRI environment (free CC0 Poly Haven) for image-based lighting
    // + realistic reflections on glass/marble/metal, with a hard fallback to
    // the procedural sky so the scene never breaks if the CDN is unreachable.
    // Skipped entirely on the lite tier — downloading a 2K HDR image and
    // running its GPU-side cubemap prefiltering is one of the more expensive
    // one-time costs in the whole mount, previously unconditional (it ran
    // even on real phones). The procedural sky/lights are already a
    // complete fallback, not a degraded one.
    if (!isMobile) {
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
    }

    // Sky/ground hemisphere fill for a soft, realistic ambient gradient, on
    // top of a low flat ambient so nothing goes fully black. Tuned cool —
    // charcoal ground bounce instead of a warm one — for the tactical
    // command-center mood; the day/night phase system (fog/sun, below)
    // still drives the actual lighting swings on top of this base.
    // Electric Sanctuary layer 4: darkened base ambient so the room's
    // emissive/neon sources (pods, arcs, energy grid, screens) actually read
    // as the light in the room, instead of competing with a bright flat fill.
    const ambient = new THREE.AmbientLight(0xc9d9f2, 0.3);
    scene.add(ambient);
    const hemi = new THREE.HemisphereLight(0xbfd4ff, 0x161a24, 0.4);
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

    // Floor — polished obsidian command-deck plating: a physical clearcoat
    // over dark brushed metal, so the neon UI, hologram and starfield read in
    // the floor as reflections (env-map image-based reflection stands in for a
    // true screen-space pass, which would cost a full extra scene render). The
    // clearcoat gives the AAA "wet obsidian" double-reflection without pushing
    // it to a full mirror (a near-mirror floor + the animated energy grid was
    // genuinely disorienting before — owner reported dizziness), so roughness
    // stays moderate and the clearcoat carries the gloss.
    const floorTex = buildFloorTexture();
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(FLOOR_W, FLOOR_D),
      new THREE.MeshPhysicalMaterial({
        map: floorTex, color: 0x2a2f38, roughness: 0.42, metalness: 0.6,
        clearcoat: 1.0, clearcoatRoughness: 0.28, envMapIntensity: 1.0,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Electric Sanctuary layer 1: Energy Grid overlay, converging on the
    // central hologram (the giant Alpha Brain sun, at SUN_SPOT below — its
    // literal {-2.5, -1.0} is duplicated here since that const isn't
    // declared yet this early in the same scope).
    const energyGridMat = new THREE.ShaderMaterial({
      ...EnergyGridShader,
      uniforms: THREE.UniformsUtils.clone(EnergyGridShader.uniforms),
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    energyGridMat.uniforms.uCenter.value.set((-2.5 + FLOOR_W / 2) / FLOOR_W, (-1.0 + FLOOR_D / 2) / FLOOR_D);
    const energyGrid = new THREE.Mesh(new THREE.PlaneGeometry(FLOOR_W, FLOOR_D), energyGridMat);
    energyGrid.rotation.x = -Math.PI / 2;
    energyGrid.position.y = 0.015;
    scene.add(energyGrid);

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
    // Recessed hull strip-lighting flush to the ceiling — cool cyan-white
    // bars set INTO the ceiling panels (no hanging office pendants, no warm
    // globes-on-cords, which were the biggest "corporate drop-ceiling" tell).
    // Each column also gets a cool, non-shadow-casting PointLight so the deck
    // stays lit in the evening/night phases; ramped in animate() below
    // alongside the sun/ambient lerp (interiorLights is read there).
    const stripMat = new THREE.MeshBasicMaterial({ color: 0xbfeeff, toneMapped: false });
    const interiorLights = [];
    {
      const cols = [...new Set(deskPositions.map((d) => Math.round(toWorld(d.x, d.y)[0])))];
      cols.forEach((cx) => {
        [-9, -3, 3, 9].forEach((cz) => {
          // a flush recessed light bar running across the ceiling (thin, just
          // below the 5.4m ceiling plane so it reads as an inset panel)
          const bar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 0.32), stripMat);
          bar.position.set(cx + 0.8, 5.33, cz);
          scene.add(bar);
          const halo = new THREE.Mesh(
            new THREE.PlaneGeometry(2.9, 0.8),
            new THREE.MeshBasicMaterial({ color: 0x9fe6ff, transparent: true, opacity: 0.16, depthWrite: false, toneMapped: false })
          );
          halo.rotation.x = Math.PI / 2; halo.position.set(cx + 0.8, 5.28, cz);
          scene.add(halo);
        });
        const roomLight = new THREE.PointLight(0xbfe6ff, 0.3, 15, 1.7);
        roomLight.position.set(cx + 0.8, 3.9, 0);
        scene.add(roomLight);
        interiorLights.push(roomLight);
      });
    }

    // North viewport wall — a real 3D starfield with actual depth, not a
    // flat painted picture. The old single texture-plane is pushed far back
    // as a distant hazy starfield/nebula backdrop; a cluster of real 3D
    // modules (boxes with a tiled hull-plate/porthole texture) sits between
    // the viewport and that backdrop so moving the camera gives genuine
    // parallax. A near-transparent glass pane at the actual window line
    // keeps a slight reflective feel.
    let skylineMode = liveRef.current.phase <= 1 ? "day" : "night";
    const skyline = buildSkylineTexture(skylineMode);
    const [nwx, nwz] = [0, -(FLOOR_D / 2) - 0.05];
    const skyWall = new THREE.Mesh(
      new THREE.PlaneGeometry(150, 46),
      new THREE.MeshBasicMaterial({ map: skyline.tex, fog: false })
    );
    skyWall.position.set(nwx, 14, nwz - 46);
    scene.add(skyWall);

    // Drifting nebula-wisp layer — one repeating transparent strip just in
    // front of the star wall, scrolled slowly in the render loop for real
    // motion in the view (opacity retuned per mode: bright system by "day",
    // warm gas-cloud glow at "sunset", near-invisible deep in "night" space).
    const cloudCvs = document.createElement("canvas");
    cloudCvs.width = 1024; cloudCvs.height = 200;
    {
      const cctx2 = cloudCvs.getContext("2d");
      const crnd = mulberry32(1234);
      const wispPalette = ["rgba(143,208,255,", "rgba(185,143,232,", "rgba(232,111,176,", "rgba(111,224,200,"];
      cctx2.clearRect(0, 0, 1024, 200);
      for (let i = 0; i < 9; i++) {
        const cx = crnd() * 1024, cy = 30 + crnd() * 120, s = 45 + crnd() * 75;
        const a = 0.2 + crnd() * 0.28;
        cctx2.fillStyle = wispPalette[Math.floor(crnd() * wispPalette.length)] + a.toFixed(2) + ")";
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
    const cloudMat = new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, opacity: 0.85, depthWrite: false, fog: false, blending: THREE.AdditiveBlending });
    const cloudLayer = new THREE.Mesh(new THREE.PlaneGeometry(150, 13), cloudMat);
    cloudLayer.position.set(nwx, 26, nwz - 44.5);
    scene.add(cloudLayer);

    // A tiny drifting probe/shuttle crossing the view with a blinking nav beacon.
    const planeGroup = new THREE.Group();
    const planeBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.12), new THREE.MeshBasicMaterial({ color: 0x4a5158, fog: false }));
    planeGroup.add(planeBody);
    const planeWing = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 1.1), new THREE.MeshBasicMaterial({ color: 0x3a3f48, fog: false }));
    planeGroup.add(planeWing);
    const planeBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.9, fog: false })
    );
    planeBeacon.position.set(-0.85, 0.05, 0);
    planeGroup.add(planeBeacon);
    planeGroup.position.set(-60, 25.5, nwz - 40);
    scene.add(planeGroup);

    // A small cluster of drifting debris/asteroid chunks (bright-system mode
    // only) — three dark angular sprites tumbling slowly.
    const birdGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const bc = document.createElement("canvas"); bc.width = bc.height = 32;
      const bx2 = bc.getContext("2d");
      bx2.fillStyle = "rgba(40,44,52,.9)";
      bx2.beginPath(); bx2.moveTo(6, 22); bx2.lineTo(14, 6); bx2.lineTo(24, 10); bx2.lineTo(27, 22); bx2.lineTo(16, 27); bx2.closePath(); bx2.fill();
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

    // ── Volumetric god-rays through the forward viewport ─────────────────
    // Soft light shafts raking in from the bridge canopy — several long
    // additive quads with a bright-at-the-window gradient, fanned across the
    // window width and raked down into the deck, so starlight/nebula glow
    // pours in as shafts. Cheap (additive quads, no raymarch) but reads as
    // the cinematic volumetric light the brief asks for. A slow opacity
    // breathe is ticked in the animate loop (godRayMats).
    const godRayMats = [];
    {
      const rayCvs = document.createElement("canvas"); rayCvs.width = 16; rayCvs.height = 128;
      const rc = rayCvs.getContext("2d");
      const rg = rc.createLinearGradient(0, 0, 0, 128);
      rg.addColorStop(0, "rgba(180,224,255,0.55)");
      rg.addColorStop(0.4, "rgba(150,205,255,0.22)");
      rg.addColorStop(1, "rgba(120,180,255,0)");
      rc.fillStyle = rg; rc.fillRect(0, 0, 16, 128);
      // feather the vertical edges so each shaft has soft sides
      const eg = rc.createLinearGradient(0, 0, 16, 0);
      eg.addColorStop(0, "rgba(0,0,0,1)"); eg.addColorStop(0.5, "rgba(0,0,0,0)"); eg.addColorStop(1, "rgba(0,0,0,1)");
      rc.globalCompositeOperation = "destination-out"; rc.fillStyle = eg; rc.fillRect(0, 0, 16, 128);
      rc.globalCompositeOperation = "source-over";
      const rayTex = new THREE.CanvasTexture(rayCvs); rayTex.colorSpace = THREE.SRGBColorSpace;
      const godRays = new THREE.Group();
      const nShafts = isMobile ? 5 : 9;
      for (let i = 0; i < nShafts; i++) {
        const f = (i / (nShafts - 1)) - 0.5; // -0.5..0.5 across the window width
        const mat = new THREE.MeshBasicMaterial({
          map: rayTex, transparent: true, opacity: 0.10 + Math.random() * 0.06,
          blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide,
        });
        godRayMats.push(mat);
        const shaft = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 15), mat);
        // top anchored high at the window, raked down-and-into the room
        shaft.position.set(f * FLOOR_W * 0.72, 3.6, nwz + 6.5);
        shaft.rotation.x = -0.62;                // rake toward the floor
        shaft.rotation.z = f * 0.28;             // slight fan spread
        godRays.add(shaft);
      }
      scene.add(godRays);
    }

    // Deep-space scenery beyond the bridge windows — real 3D bodies drifting
    // past the glass instead of a city skyline: a ringed gas giant, a spiral
    // galaxy, an asteroid belt, a moon, and the ALPHA orbital station (which
    // the exterior sign + beacon anchor to). This is the "no buildings, stars
    // and galaxies" view the ship actually flies through.
    const nearBuildingMats = []; // kept empty — the old night window-glow ramp now no-ops
    const spaceSpin = []; // slow-rotating bodies, ticked in animate()
    let earthGroup = null; // the orbital Earth (fleet-deploy target), assigned in the block below
    {
      // ── The planet below: Earth, filling the lower viewport ─────────────
      // The ship is in orbit; the forward window overlooks a rotating,
      // atmospheric Earth (Orbital Fleet Deployment). Procedural: an ocean
      // sphere with green/tan landmass blobs + white poles, a drifting cloud
      // shell, and an additive atmosphere rim. `earthGroup` is the fleet-drop
      // target (nodes/lasers parent to it so they rotate with the surface).
      const earthCvs = document.createElement("canvas"); earthCvs.width = 1024; earthCvs.height = 512;
      const ex = earthCvs.getContext("2d");
      const og = ex.createLinearGradient(0, 0, 0, 512);
      og.addColorStop(0, "#0a2a5e"); og.addColorStop(0.5, "#0e3f79"); og.addColorStop(1, "#0a2a5e");
      ex.fillStyle = og; ex.fillRect(0, 0, 1024, 512);
      const eRnd = mulberry32(88);
      const land = ["#1f6b3a", "#2a7d42", "#3a6a2c", "#6b5a2c", "#7a6636"];
      for (let i = 0; i < 46; i++) {
        ex.fillStyle = land[Math.floor(eRnd() * land.length)];
        const cx = eRnd() * 1024, cy = 60 + eRnd() * 392, blobs = 5 + Math.floor(eRnd() * 7);
        ex.beginPath();
        for (let b = 0; b < blobs; b++) {
          const bx = cx + (eRnd() - 0.5) * 150, by = cy + (eRnd() - 0.5) * 90, br = 12 + eRnd() * 48;
          ex.moveTo(bx + br, by); ex.arc(bx, by, br, 0, Math.PI * 2);
        }
        ex.fill();
      }
      // polar caps
      ex.fillStyle = "rgba(240,248,255,.85)";
      ex.fillRect(0, 0, 1024, 34); ex.fillRect(0, 478, 1024, 34);
      const earthTex = new THREE.CanvasTexture(earthCvs); earthTex.colorSpace = THREE.SRGBColorSpace;
      const EARTH_R = 40, EARTH_POS = new THREE.Vector3(0, -30, nwz - 82);
      earthGroup = new THREE.Group();
      earthGroup.position.copy(EARTH_POS);
      const earthMesh = new THREE.Mesh(
        new THREE.SphereGeometry(EARTH_R, 64, 48),
        new THREE.MeshStandardMaterial({ map: earthTex, emissive: 0x0a1a33, emissiveIntensity: 0.35, roughness: 1, metalness: 0, fog: false })
      );
      earthGroup.add(earthMesh);
      // drifting cloud shell
      const cloudCvs2 = document.createElement("canvas"); cloudCvs2.width = 1024; cloudCvs2.height = 512;
      const cx2 = cloudCvs2.getContext("2d");
      for (let i = 0; i < 70; i++) {
        cx2.fillStyle = `rgba(255,255,255,${(0.12 + eRnd() * 0.3).toFixed(2)})`;
        const cwx = eRnd() * 1024, cwy = eRnd() * 512, cwr = 14 + eRnd() * 40;
        cx2.beginPath(); cx2.ellipse(cwx, cwy, cwr, cwr * 0.5, eRnd() * Math.PI, 0, Math.PI * 2); cx2.fill();
      }
      const cloudTex2 = new THREE.CanvasTexture(cloudCvs2); cloudTex2.colorSpace = THREE.SRGBColorSpace;
      const earthClouds = new THREE.Mesh(
        new THREE.SphereGeometry(EARTH_R * 1.015, 48, 32),
        new THREE.MeshStandardMaterial({ map: cloudTex2, transparent: true, opacity: 0.55, roughness: 1, depthWrite: false, fog: false })
      );
      earthGroup.add(earthClouds);
      earthGroup.userData.clouds = earthClouds;
      // additive atmosphere rim (backside shell)
      const atmo = new THREE.Mesh(
        new THREE.SphereGeometry(EARTH_R * 1.09, 48, 32),
        new THREE.MeshBasicMaterial({ color: 0x5aa8ff, transparent: true, opacity: 0.16, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
      );
      earthGroup.add(atmo);
      earthGroup.rotation.z = 0.35; // axial tilt
      scene.add(earthGroup);

      // Spiral galaxy — a glowing disc (procedural spiral canvas) far off to
      // starboard, additive so it reads as light, not a solid plate.
      const galCvs = document.createElement("canvas"); galCvs.width = galCvs.height = 256;
      const gx = galCvs.getContext("2d");
      const gcore = gx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gcore.addColorStop(0, "rgba(255,246,220,.95)"); gcore.addColorStop(0.12, "rgba(224,204,255,.6)");
      gcore.addColorStop(0.5, "rgba(150,120,220,.16)"); gcore.addColorStop(1, "rgba(0,0,0,0)");
      gx.fillStyle = gcore; gx.fillRect(0, 0, 256, 256);
      for (let arm = 0; arm < 2; arm++) {
        for (let t = 0; t < 230; t++) {
          const a = arm * Math.PI + t * 0.055;
          const r = 6 + t * 0.5;
          const px = 128 + Math.cos(a) * r, py = 128 + Math.sin(a) * r;
          const al = Math.max(0, 0.5 - t / 500);
          gx.fillStyle = `rgba(${180 + (t % 40)},190,255,${al.toFixed(2)})`;
          gx.beginPath(); gx.arc(px, py, 2.1, 0, Math.PI * 2); gx.fill();
        }
      }
      const galTex = new THREE.CanvasTexture(galCvs); galTex.colorSpace = THREE.SRGBColorSpace;
      const galaxy = new THREE.Mesh(
        new THREE.PlaneGeometry(64, 64),
        new THREE.MeshBasicMaterial({ map: galTex, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
      );
      galaxy.position.set(54, 36, nwz - 98); galaxy.rotation.z = 0.4; galaxy.rotation.x = -0.5;
      scene.add(galaxy);

      // Small moon, closer in.
      const moon = new THREE.Mesh(
        new THREE.SphereGeometry(4.5, 24, 20),
        new THREE.MeshStandardMaterial({ color: 0x9aa4b4, emissive: 0x11151c, emissiveIntensity: 0.5, roughness: 1, fog: false })
      );
      moon.position.set(20, 11, nwz - 42);
      scene.add(moon); spaceSpin.push(moon);

      // Asteroid belt — a scatter of low-poly rocks drifting at varied depth.
      const astRnd = mulberry32(555);
      const astMat = new THREE.MeshStandardMaterial({ color: 0x39414f, roughness: 1, metalness: 0.1, fog: false });
      for (let i = 0; i < 34; i++) {
        const rs = 0.4 + astRnd() * 1.8;
        const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(rs, 0), astMat);
        rock.position.set(-72 + astRnd() * 144, 3 + astRnd() * 34, nwz - 14 - astRnd() * 46);
        rock.rotation.set(astRnd() * 6, astRnd() * 6, astRnd() * 6);
        scene.add(rock); spaceSpin.push(rock);
      }

      // ALPHA orbital station — a stylised hub the exterior sign/beacon attach
      // to (it takes over the "tallest module" anchor the billboard used).
      const station = new THREE.Group();
      const hubMat = new THREE.MeshStandardMaterial({ color: 0x2a3140, emissive: 0x0a1a2a, emissiveIntensity: 0.5, roughness: 0.5, metalness: 0.6, fog: false });
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 5, 20), hubMat);
      station.add(hub);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x1f2733, emissive: 0x0a1420, emissiveIntensity: 0.4, roughness: 0.5, metalness: 0.6, fog: false });
      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(4.5, 0.4, 10, 40), ringMat);
      ring1.rotation.x = Math.PI / 2; station.add(ring1);
      const winMat = new THREE.MeshBasicMaterial({ color: 0x9fe6ff, fog: false });
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const w = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), winMat);
        w.position.set(Math.cos(a) * 4.5, 0, Math.sin(a) * 4.5);
        station.add(w);
      }
      station.position.set(30, 22, nwz - 30);
      station.rotation.z = 0.18;
      scene.add(station);
      scene.userData.tallB = { x: 30, h: 22, z: nwz - 30, d: 4 }; // billboard/beacon anchor
    }

    // ── Orbital Fleet Deployment ─────────────────────────────────────────
    // The ship deploys Heavy Guard fleets to the planet below: when a big
    // install ticket is confirmed, glowing drop-pods arc down to Earth, impact
    // into an expanding shockwave, and leave a permanent "secured" node linked
    // back to the ship by a live, pulsing telemetry laser. Ticked from the
    // animate loop via updateFleetOps(dt); triggered by the war-table ticket
    // schedule (liveRef.current.deployFleet) plus an opening volley.
    const fleetShipPoint = new THREE.Vector3(0, 2.2, nwz + 3);
    const fleetPods = [];    // in-flight drop pods
    const fleetShocks = [];  // expanding impact rings (children of earthGroup)
    const fleetNodes = [];   // { node, laser, lm } secured surface nodes + telemetry
    const EARTH_R2 = 40;
    const podCoreMat = new THREE.MeshBasicMaterial({ color: 0x8fe6ff, fog: false });
    const nodeCoreMat = new THREE.MeshBasicMaterial({ color: 0x3fd79a, fog: false });
    const surfacePointLocal = () => {
      // a point on the hemisphere facing the ship + upper side (visible through
      // the window), in earthGroup-local coords, on the surface.
      for (let tries = 0; tries < 16; tries++) {
        const v = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
        if (v.z > 0.25 && v.y > 0.15) return v.multiplyScalar(EARTH_R2);
      }
      return new THREE.Vector3(0.2, 0.5, 0.8).normalize().multiplyScalar(EARTH_R2);
    };
    const deployDrop = (count = 1) => {
      if (!earthGroup) return;
      earthGroup.updateWorldMatrix(true, false);
      for (let i = 0; i < count; i++) {
        const local = surfacePointLocal();
        const pod = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), podCoreMat);
        const trail = new THREE.Mesh(
          new THREE.ConeGeometry(0.32, 2.6, 8),
          new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
        );
        trail.position.z = -1.5; trail.rotation.x = -Math.PI / 2; pod.add(trail);
        pod.position.copy(fleetShipPoint);
        scene.add(pod);
        const target = earthGroup.localToWorld(local.clone());
        const ctrl = fleetShipPoint.clone().lerp(target, 0.5).add(new THREE.Vector3((Math.random() - 0.5) * 24, 22 + Math.random() * 10, 4));
        fleetPods.push({ mesh: pod, t: -i * 0.3, dur: 2.0 + Math.random() * 0.5, p0: fleetShipPoint.clone(), p1: ctrl, p2: target, local });
      }
    };
    const updateFleetOps = (dt) => {
      if (earthGroup) {
        earthGroup.rotation.y += dt * 0.03;
        if (earthGroup.userData.clouds) earthGroup.userData.clouds.rotation.y += dt * 0.006;
      }
      for (let i = fleetPods.length - 1; i >= 0; i--) {
        const p = fleetPods[i];
        p.t += dt;
        if (p.t < 0) continue;
        const u = Math.min(1, p.t / p.dur);
        const a = p.p0.clone().lerp(p.p1, u), b = p.p1.clone().lerp(p.p2, u);
        p.mesh.position.copy(a.lerp(b, u));
        p.mesh.lookAt(p.p2);
        if (u >= 1) {
          scene.remove(p.mesh);
          p.mesh.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
          const nrm = p.local.clone().normalize();
          const shock = new THREE.Mesh(
            new THREE.RingGeometry(0.3, 0.75, 32),
            new THREE.MeshBasicMaterial({ color: 0x6fffc0, transparent: true, opacity: 0.95, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
          );
          shock.position.copy(p.local);
          shock.lookAt(p.local.clone().add(nrm));
          earthGroup.add(shock);
          fleetShocks.push({ mesh: shock, t: 0 });
          const node = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), nodeCoreMat);
          node.position.copy(p.local.clone().multiplyScalar(1.012));
          earthGroup.add(node);
          const lm = new THREE.LineBasicMaterial({ color: 0x3fd79a, transparent: true, opacity: 0.6 });
          const laser = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]), lm);
          scene.add(laser);
          fleetNodes.push({ node, laser, lm });
          liveRef.current.showToast?.("🛰️ צי Heavy Guard נפרס — אתר מאובטח ✓");
          fleetPods.splice(i, 1);
        }
      }
      for (let i = fleetShocks.length - 1; i >= 0; i--) {
        const s = fleetShocks[i]; s.t += dt;
        const k = s.t / 1.2;
        s.mesh.scale.setScalar(1 + k * 10);
        s.mesh.material.opacity = Math.max(0, 0.95 * (1 - k));
        if (k >= 1) { earthGroup.remove(s.mesh); s.mesh.geometry.dispose(); s.mesh.material.dispose(); fleetShocks.splice(i, 1); }
      }
      if (fleetNodes.length) {
        const tmp = new THREE.Vector3();
        for (const fn of fleetNodes) {
          fn.node.getWorldPosition(tmp);
          const p0 = tmp.clone(), p2 = fleetShipPoint;
          const p1 = p0.clone().lerp(p2, 0.5).add(new THREE.Vector3(0, 14, 0));
          const pts = [];
          for (let s = 0; s <= 12; s++) { const u = s / 12; const a = p0.clone().lerp(p1, u), b = p1.clone().lerp(p2, u); pts.push(a.lerp(b, u)); }
          fn.laser.geometry.setFromPoints(pts);
          fn.lm.opacity = 0.3 + 0.35 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 3 + p0.x));
        }
      }
    };
    liveRef.current.deployFleet = deployDrop;
    // Opening deployment so the orbital command reads as live from the start.
    deployDrop(2);
    setTimeout(() => { try { deployDrop(3); } catch {} }, 6500);

    // A blinking red collision-avoidance beacon on the tallest module — the
    // kind of small real-detail that reads as a genuinely inhabited field
    // of hulls rather than static decoration.
    let rooftopBeacon = null;
    if (scene.userData.tallB) {
      const tall = scene.userData.tallB;
      rooftopBeacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0.9, fog: false })
      );
      rooftopBeacon.position.set(tall.x, tall.h + 0.35, tall.z);
      scene.add(rooftopBeacon);
    }

    // A soft cyan glow along the horizon behind the module field, only
    // visible deep in "night" mode — ambient nebula backlight bleeding
    // around the hulls, standing in for the old city light-pollution dome.
    const cityGlowCvs = document.createElement("canvas");
    cityGlowCvs.width = 512; cityGlowCvs.height = 128;
    {
      const gctx = cityGlowCvs.getContext("2d");
      const grad = gctx.createLinearGradient(0, 128, 0, 0);
      grad.addColorStop(0, "rgba(120,180,255,0.5)");
      grad.addColorStop(1, "rgba(120,180,255,0)");
      gctx.fillStyle = grad; gctx.fillRect(0, 0, 512, 128);
    }
    const cityGlowTex = new THREE.CanvasTexture(cityGlowCvs);
    const cityGlowMat = new THREE.MeshBasicMaterial({
      map: cityGlowTex, transparent: true, opacity: 0, depthWrite: false,
      blending: THREE.AdditiveBlending, fog: false,
    });
    const cityGlow = new THREE.Mesh(new THREE.PlaneGeometry(150, 14), cityGlowMat);
    cityGlow.position.set(nwx, 5, nwz - 45.5);
    scene.add(cityGlow);

    /* ── Showcase-window life v3 ──────────────────────────────────────────
       The view out the glass gets a living deep-space layer: a billboard
       module cycling REAL content (Heavy Guard ad → ALPHA → live Bitcoin
       off the market feed), a small shuttle/drone crossing opposite the
       probe, a drifting cargo-pod module by "day", and two beacon-sweep
       beams from a distant station at "night". All sprite/canvas-cheap. ── */
    const bbCvs = document.createElement("canvas");
    // 2x supersampled (drawn in 220x320 logical coords) so the billboard
    // text and the brand mark stay crisp instead of soft up close.
    bbCvs.width = 440; bbCvs.height = 640;
    const bbCtx = bbCvs.getContext("2d");
    bbCtx.scale(2, 2);
    const bbTex = new THREE.CanvasTexture(bbCvs);
    bbTex.colorSpace = THREE.SRGBColorSpace;
    bbTex.anisotropy = MAX_ANISO;
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
      } else if (mode === 2) {
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
      } else {
        // Data-center mode — the same tower doubles as an outdoor financial
        // landmark, cycling real HeavyGuard ops numbers, not just an ad.
        const b = liveRef.current.bizData || {};
        c.fillStyle = "#5fd0ff"; c.font = "900 26px system-ui";
        c.fillText("מרכז נתונים", 110, 56);
        c.fillStyle = "#8fe3c0"; c.font = "700 15px system-ui";
        c.fillText("ALPHA · HEAVY GUARD", 110, 82);
        const rows = [
          ["התקנות", b.installs ?? "…"],
          ["הכנסה", b.hgRevenue != null ? "₪" + Math.round(b.hgRevenue).toLocaleString() : "…"],
          ["לקוחות", b.custCount ?? "…"],
        ];
        let ry = 130;
        rows.forEach(([label, val]) => {
          c.fillStyle = "#7d93ad"; c.font = "600 15px system-ui"; c.fillText(label, 110, ry);
          c.fillStyle = "#fff"; c.font = "800 22px system-ui"; c.fillText(String(val), 110, ry + 26);
          ry += 58;
        });
        c.fillStyle = "#5f7d6f"; c.font = "600 14px system-ui";
        c.fillText("LIVE", 110, 300);
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
      // Owner request: an outdoor "whole futuristic data-center area" —
      // this tallest tower is the one landmark visible from both the office
      // window and outside, so it gets a distinct data-center identity:
      // vertical server-rack LED striping up its face + its own sign, on
      // top of the ad billboard it already carried.
      const dcLedMat = new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.55, fog: false });
      const dcLedMat2 = new THREE.MeshBasicMaterial({ color: 0x3fd79a, transparent: true, opacity: 0.5, fog: false });
      const dcFace = tall.z + tall.d / 2 + 0.04;
      for (let row = 0; row < Math.floor(tall.h / 1.4); row++) {
        const strip = new THREE.Mesh(new THREE.PlaneGeometry(tall.d * 0.7, 0.06), row % 2 === 0 ? dcLedMat : dcLedMat2);
        strip.position.set(tall.x - 2.9, 0.9 + row * 1.4, dcFace);
        scene.add(strip);
      }
      const dcSign = buildNeonSign("מרכז נתונים · ALPHA", 0x2ee6ff, 3.4, 0.6);
      dcSign.position.set(tall.x, tall.h + 0.9, tall.z);
      scene.add(dcSign);
    }

    // Patrol shuttle — crosses right-to-left (opposite the probe), higher.
    const heliGroup = new THREE.Group();
    const heliBodyMat = new THREE.MeshBasicMaterial({ color: 0x2a3038, fog: false });
    const heliBody = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), heliBodyMat);
    heliBody.scale.set(1.5, 0.75, 0.7); heliGroup.add(heliBody);
    const heliTail = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.14, 0.12), heliBodyMat);
    heliTail.position.set(-1.2, 0.12, 0); heliGroup.add(heliTail);
    const heliRotor = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.04, 0.16), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.55, fog: false }));
    heliRotor.position.y = 0.52; heliGroup.add(heliRotor);
    const heliStrobe = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.9, fog: false }));
    heliStrobe.position.set(0.2, -0.42, 0); heliGroup.add(heliStrobe);
    heliGroup.position.set(70, 23, nwz - 24);
    scene.add(heliGroup);

    // Drifting cargo-pod module — a small station module + tethered
    // container, drifting slowly, bright-system mode only.
    const balloonGroup = new THREE.Group();
    {
      const sc = document.createElement("canvas"); sc.width = 64; sc.height = 32;
      const sctx = sc.getContext("2d");
      const cols = ["#3a3f48", "#4a5158", "#2ee6ff", "#24272d"];
      for (let i = 0; i < 8; i++) { sctx.fillStyle = cols[i % cols.length]; sctx.fillRect(i * 8, 0, 8, 32); }
      const st = new THREE.CanvasTexture(sc); st.colorSpace = THREE.SRGBColorSpace;
      const env = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 12), new THREE.MeshStandardMaterial({ map: st, roughness: 0.5, metalness: 0.4, fog: false }));
      env.scale.set(1, 1.15, 1); balloonGroup.add(env);
      const basket = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.5), new THREE.MeshStandardMaterial({ color: 0x2a3038, roughness: 0.6, metalness: 0.3, fog: false }));
      basket.position.y = -2.3; balloonGroup.add(basket);
      [[-0.3, -0.3], [0.3, 0.3]].forEach(([rx, rz]) => {
        const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.0, 4), heliBodyMat);
        rope.position.set(rx, -1.75, rz); balloonGroup.add(rope);
      });
    }
    balloonGroup.position.set(-45, 14, nwz - 30);
    scene.add(balloonGroup);

    // Deep-space beacon sweep — two additive cyan beams from a distant
    // station, only visible in "night" mode.
    const searchGroup = new THREE.Group();
    const mkBeam = (px, tilt) => {
      const bc = document.createElement("canvas"); bc.width = 32; bc.height = 128;
      const bx2 = bc.getContext("2d");
      const grd = bx2.createLinearGradient(0, 128, 0, 0);
      grd.addColorStop(0, "rgba(120,220,255,.5)"); grd.addColorStop(1, "rgba(120,220,255,0)");
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

    // A thin animated debris-streak strip at the base — small, cheap,
    // redrawn every frame — so the viewport always has some motion in it.
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
    // ══════════════════════════════════════════════════════════════════
    // STARSHIP HULL — the structure around the agents is a command deck,
    // not an office room: dark gunmetal bulkhead walls, chunky viewport
    // frames onto space, fuselage ribs arching overhead, corner hull
    // columns and a glowing conduit spine. (Owner: "the whole structure
    // should look like a futuristic spaceship, not a New York office.")
    // ══════════════════════════════════════════════════════════════════
    const hullMat = new THREE.MeshStandardMaterial({ map: buildWallTexture(5), roughness: 0.7, metalness: 0.55 });
    const hullDark = new THREE.MeshStandardMaterial({ color: 0x0c0f16, roughness: 0.55, metalness: 0.7 });
    const hullGlow = new THREE.MeshBasicMaterial({ color: 0x2ee6ff });
    const hullGlowSoft = new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.4 });

    // Side + aft bulkhead walls (kept solid — the forward wall is the big
    // viewport onto space, built from the skyline plane further up).
    const wallL = new THREE.Mesh(new THREE.PlaneGeometry(FLOOR_D, 6.4), hullMat);
    wallL.rotation.y = Math.PI / 2;
    wallL.position.set(-(FLOOR_W / 2) - 0.05, 3.2, 0);
    scene.add(wallL);
    const wallR = wallL.clone();
    wallR.rotation.y = -Math.PI / 2;
    wallR.position.x = (FLOOR_W / 2) + 0.05;
    scene.add(wallR);
    const wallS = new THREE.Mesh(
      new THREE.PlaneGeometry(FLOOR_W, 6.4),
      new THREE.MeshStandardMaterial({ map: buildWallTexture(6), roughness: 0.7, metalness: 0.55 })
    );
    wallS.rotation.y = Math.PI;
    wallS.position.set(0, 3.2, FLOOR_D / 2 + 0.05);
    scene.add(wallS);

    // Chunky forward-viewport frame over the space window (replaces the
    // thin office window-mullions): a few heavy hull dividers with a cyan
    // light channel, so the forward wall reads as a bridge canopy.
    for (let i = -3; i <= 3; i++) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.28, 6.4, 0.35), hullDark);
      post.position.set(i * (FLOOR_W / 7), 3.2, nwz + 0.06);
      scene.add(post);
      const lightCh = new THREE.Mesh(new THREE.BoxGeometry(0.06, 6.0, 0.02), hullGlowSoft);
      lightCh.position.set(i * (FLOOR_W / 7), 3.2, nwz + 0.25);
      scene.add(lightCh);
    }
    // Header + sill beams framing the forward canopy top and bottom.
    [[5.9, 0x0c0f16], [0.5, 0x0c0f16]].forEach(([yy]) => {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(FLOOR_W, 0.5, 0.4), hullDark);
      beam.position.set(0, yy, nwz + 0.1);
      scene.add(beam);
      const strip = new THREE.Mesh(new THREE.BoxGeometry(FLOOR_W, 0.06, 0.02), hullGlowSoft);
      strip.position.set(0, yy, nwz + 0.31);
      scene.add(strip);
    });

    // Fuselage ribs — shallow structural arches spanning the deck from wall
    // to wall, the defining "inside a ship's hull" cue. A half-torus (radius
    // = half the deck width) flattened in Y so it springs from ~2.5m up each
    // side wall and peaks just under the ceiling, repeated down the length.
    const ribR = FLOOR_W / 2;
    const ribBaseY = 2.4;
    const ribScaleY = (5.4 - ribBaseY) / ribR; // peak just under the 5.4m ceiling
    for (let z = -FLOOR_D / 2 + 5; z <= FLOOR_D / 2 - 5; z += 9) {
      const rib = new THREE.Mesh(new THREE.TorusGeometry(ribR, 0.34, 8, 60, Math.PI), hullDark);
      rib.scale.y = ribScaleY;
      rib.position.set(0, ribBaseY, z);
      scene.add(rib);
      // bright cyan conduit running along the inner edge of the rib, on both
      // faces, so the arch clearly reads as ship structure from across the deck
      [z + 0.26, z - 0.26].forEach((cz) => {
        const conduit = new THREE.Mesh(new THREE.TorusGeometry(ribR - 0.3, 0.07, 6, 60, Math.PI), hullGlow);
        conduit.scale.y = ribScaleY;
        conduit.position.set(0, ribBaseY, cz);
        scene.add(conduit);
      });
    }
    // Longitudinal conduit spine — a glowing line running fore-to-aft along
    // the ceiling apex, tying the ribs together like a real fuselage keel.
    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, FLOOR_D - 6), hullGlow);
    spine.position.set(0, 5.25, 0);
    scene.add(spine);

    // Corner hull columns — chunky structural pillars at the four corners
    // with a vertical cyan light seam, grounding the deck in real structure.
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(1.1, 6.4, 1.1), hullDark);
      col.position.set(sx * (FLOOR_W / 2 - 0.9), 3.2, sz * (FLOOR_D / 2 - 0.9));
      scene.add(col);
      const seam = new THREE.Mesh(new THREE.BoxGeometry(0.09, 5.4, 0.09), hullGlowSoft);
      seam.position.set(sx * (FLOOR_W / 2 - 0.34), 3.0, sz * (FLOOR_D / 2 - 0.34));
      scene.add(seam);
    });

    // Side-wall viewports onto space — two tall angled windows per side wall
    // (port + starboard) so the deck is ringed by stars, not blank bulkhead.
    const sideWinTex = skyline.tex.clone();
    sideWinTex.repeat.set(0.3, 0.5);
    sideWinTex.offset.set(0.4, 0.1);
    sideWinTex.needsUpdate = true;
    [-1, 1].forEach((side) => {
      [-11, 11].forEach((zc) => {
        const frame = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.0), hullDark);
        frame.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
        frame.position.set(side * (FLOOR_W / 2 - 0.03), 3.4, zc);
        scene.add(frame);
        const win = new THREE.Mesh(new THREE.PlaneGeometry(8.3, 2.4), new THREE.MeshBasicMaterial({ map: sideWinTex, fog: false }));
        win.rotation.y = frame.rotation.y;
        win.position.set(side * (FLOOR_W / 2 - 0.07), 3.4, zc);
        scene.add(win);
        // glowing frame edge
        const edge = new THREE.Mesh(new THREE.PlaneGeometry(8.7, 0.08), hullGlowSoft);
        edge.rotation.y = frame.rotation.y;
        edge.position.set(side * (FLOOR_W / 2 - 0.06), 4.65, zc);
        scene.add(edge);
      });
    });

    // Radial deck conduits — glowing lines running out from the central
    // agent/hologram core toward the hull, so the layout literally reads as
    // "the crew is the heart of the ship." Each is a flat strip parented to
    // a group that's spun around vertical to point outward (robust vs. the
    // fragile double-Euler approach). Thin, just above the floor, no collision.
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2;
      const len = 26, gap = 3.5;
      const g2 = new THREE.Group();
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.16, len), hullGlowSoft);
      strip.rotation.x = -Math.PI / 2;
      strip.position.z = len / 2 + gap;
      g2.add(strip);
      g2.position.set(-2.5, 0.03, -1.0); // the central hologram core (SUN_SPOT)
      g2.rotation.y = ang;
      scene.add(g2);
    }

    // (The "lived-in office" furniture pack — lounge sofa, air-hockey table,
    // closet/dresser/boxes/toys, break-room kitchenette and bookshelf — was
    // the biggest remaining "New York office" tell and is gone in the
    // spaceship retheme. The room around the agents is now hull structure +
    // viewports, built below, not an office lounge.)

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
    // Global Operations Wall — a "big board" suspended over the showroom car
    // (not mounted on any wall, so it can't collide with existing wall
    // decor) combining fleet/security/system-health into one dashboard.
    // Double-sided so it reads from either direction as you walk around.
    // Hangs over the car's own spot (near the owner's office — the car and
    // its full podium/ring/light rig relocated there so the Alpha hologram
    // could take the floor's center; the ops board is fleet/vehicle data,
    // so it travels with the car rather than staying centered over Alpha).
    const opsCanvas = document.createElement("canvas");
    opsCanvas.width = 900; opsCanvas.height = 300;
    const opsCtx = opsCanvas.getContext("2d");
    const opsTex = new THREE.CanvasTexture(opsCanvas);
    opsTex.colorSpace = THREE.SRGBColorSpace;
    // Ceiling sits at y=5.4 — the board (and its short hanging chain) stay
    // safely under it, well above head height (~1.8m) and the showroom car.
    const opsBezel = new THREE.Mesh(new THREE.PlaneGeometry(5.7, 1.66), new THREE.MeshBasicMaterial({ color: 0x03040a, side: THREE.DoubleSide }));
    opsBezel.position.set(21, 4.5, 18.0);
    scene.add(opsBezel);
    const opsScreen = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 1.5), new THREE.MeshBasicMaterial({ map: opsTex, side: THREE.DoubleSide }));
    opsScreen.position.set(21, 4.5, 18.02);
    scene.add(opsScreen);
    const opsChain = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.75, 6), new THREE.MeshStandardMaterial({ color: 0x2a2e38, metalness: 0.7, roughness: 0.4 }));
    opsChain.position.set(21, 5.0, 18.0);
    scene.add(opsChain);
    drawOpsWall(opsCtx, opsCanvas.width, opsCanvas.height, liveRef.current.bizData, liveRef.current.securityAlerts);
    let screenT = 0;
    // (Floor plants removed — potted office greenery was another "office, not
    // spaceship" tell. The deck stays clear metal + light around the pods.)

    // Furniture — each desk is tinted with its owner's own color (same
    // index mapping as chars[i]'s permanent home desk), and fully kitted
    // out with a lamp + a personal item that rotates by desk index for
    // variety. Also collects a collision circle per obstacle so the player
    // can't walk straight through any of it (see resolveCollisions above).
    const deskMons = [];
    const deskHolos = [];
    const obstacles = [];
    // Every fully-walled space (private glass offices, conference room, owner
    // suite) — see registerRoom above — so NPCs walking to a target inside one
    // of these get funneled through its actual doorway.
    const rooms = [];
    // Extra non-agent humans (e.g. the receptionist) that still need their
    // animation mixer ticked and to be disposed on unmount.
    const allExtraHumans = [];
    // Robot charging pods, tracked for the animate loop: charge level rises
    // while its robot is actually docked (standing inside), drains slowly
    // while it's out on a routine, and the pod's meter/glow reflect it live.
    const chargePods = [];
    deskPositions.forEach((d, i) => {
      const owner = byId(chars[i]?.id);
      const [wx, wz] = toWorld(d.x, d.y);
      // Per-desk facing (perimeter layout): the whole station turns to the
      // desk's own rot so the seated worker looks the right way for the wall
      // their office sits against.
      const rot = typeof d.rot === "number" ? d.rot : DESK_FACE_ROT;
      if (!owner || owner.id === "facilities") {
        // דבורה (the one human left on the floor) keeps the full battlestation
        // + private glass office; the fallback (no owner) keeps a plain desk.
        const { group, monMat, holo } = buildDesk(owner ? hexToInt(owner.color) : 0x3a6ad8, deskTemplate, laptopTemplate, furnitureTemplate, i);
        group.position.set(wx, 0, wz);
        group.rotation.y = rot;
        scene.add(group);
        deskMons.push(monMat);
        deskHolos.push(holo);
        obstacles.push({ x: wx, z: wz, r: 0.85 });
        if (owner) {
          const scrTex = buildOfficeScreenTex(owner.title, hexToInt(owner.color), agentScreenLines(owner.id, liveRef.current.bizData || {}));
          const off = buildGlassOffice(hexToInt(owner.color), owner.name, owner.title, scrTex, officeDecorTemplate);
          const offRot = rot - Math.PI;
          off.group.position.set(wx, 0, wz);
          off.group.rotation.y = offRot;
          scene.add(off.group);
          const cr = Math.cos(offRot), sr = Math.sin(offRot);
          off.obstacles.forEach((o) => obstacles.push({ x: wx + o.x * cr + o.z * sr, z: wz - o.x * sr + o.z * cr, r: o.r }));
          registerRoom(rooms, wx, wz, offRot, { cx: 0, cz: 0, halfW: 1.65, halfD: 1.55, doorX: 0, doorZ: 1.55, doorNX: 0, doorNZ: 1 });
        }
        return;
      }
      // Every robot agent: the office + desk are replaced by a charging
      // capsule on the same ring spot (owner request — they're robots now,
      // they dock instead of sitting). The capsule's opening faces where the
      // old office doorway faced, so the agents' existing walk-to-desk
      // routine now walks them straight into the dock; no obstacle at the
      // pod center (player collision covers only the rear shell arc), and no
      // registerRoom — there's nothing to funnel through a door anymore.
      const scrTex = buildOfficeScreenTex(owner.title, hexToInt(owner.color), agentScreenLines(owner.id, liveRef.current.bizData || {}));
      const pod = buildChargingPod(hexToInt(owner.color), owner.name, owner.title, scrTex);
      const podRot = rot - Math.PI;
      pod.group.position.set(wx, 0, wz);
      pod.group.rotation.y = podRot;
      scene.add(pod.group);
      const cr = Math.cos(podRot), sr = Math.sin(podRot);
      pod.obstacles.forEach((o) => obstacles.push({ x: wx + o.x * cr + o.z * sr, z: wz - o.x * sr + o.z * cr, r: o.r }));
      const entry = {
        id: owner.id, x: wx, z: wz, hex: owner.color,
        glowMat: pod.glowMat, ringMat: pod.ringMat, meter: pod.meter,
        podGroup: pod.group, lightning: pod.lightning,
        charge: 55 + Math.random() * 40, charging: false,
      };
      drawPodMeter(entry);
      chargePods.push(entry);
    });
    // Which agents live in pods (vs. דבורה's real desk) — the NPC anchor
    // logic branches on this: pod robots stand at pod-center facing out,
    // no chair nudge, no sit drop.
    const podIdSet = new Set(chargePods.map((p) => p.id));
    const podById = new Map(chargePods.map((p) => [p.id, p]));

    // Electric Sanctuary layer 2: 4 High-Voltage Arc pillars in the corners.
    const ARC_COLORS = [0x36e6ff, 0xb84bff, 0x36e6ff, 0xb84bff];
    const arcPillars = [];
    [[-FLOOR_W / 2 + 3, -FLOOR_D / 2 + 3], [FLOOR_W / 2 - 3, -FLOOR_D / 2 + 3], [-FLOOR_W / 2 + 3, FLOOR_D / 2 - 3], [FLOOR_W / 2 - 3, FLOOR_D / 2 - 3]]
      .forEach(([x, z], i) => {
        const pillar = buildVoltageArcPillar(ARC_COLORS[i]);
        pillar.position.set(x, 0, z);
        scene.add(pillar);
        obstacles.push({ x, z, r: 0.5 });
        arcPillars.push(pillar);
      });

    // ══════════════════════════════════════════════════════════════════
    // ALPHA MEGA-PATCH V1.0 — 9 new modules. Positions below are placed on
    // open floor within the FLOOR_W×FLOOR_D bounds but not exhaustively
    // checked against every existing prop; God Mode's 3D editor can
    // reposition any of them afterward if something overlaps.
    // ══════════════════════════════════════════════════════════════════

    // ── Module 1: Heavy Guard Holographic War Table ──────────────────────
    const warTablePos = { x: 16, z: -20 };
    const warTable = buildWarTable();
    warTable.group.position.set(warTablePos.x, 0, warTablePos.z);
    scene.add(warTable.group);
    obstacles.push({ x: warTablePos.x, z: warTablePos.z, r: 2.9 });
    // Electric Sanctuary layer 4: "Smart Interaction Light" — dim by
    // default, brightens smoothly as the player approaches (updated per
    // frame below), guiding attention the way a real smart space would.
    const warTableLight = new THREE.PointLight(0x6fe6ff, 0.3, 9);
    warTableLight.position.set(warTablePos.x, 3.2, warTablePos.z);
    scene.add(warTableLight);
    // Electric Sanctuary layer 5: nano-particle hologram hovering over the grid.
    const warTableNano = buildNanoParticleCloud(2.6, 1.4, 260, 0x6fe6ff);
    warTableNano.position.set(warTablePos.x, 1.3, warTablePos.z);
    scene.add(warTableNano);
    const warTableTiles = warTable.tiles.map((t) => ({ ...t, wx: warTablePos.x + t.x, wz: warTablePos.z + t.z }));
    // Representative demo install tickets (real HeavyGuard ticket data isn't
    // wired into this sim) — drag one onto a day tile to "schedule" it.
    const TICKET_COLORS = [0x2ee6ff, 0xffd23f, 0xff6b6b, 0x3fd79a];
    const warTickets = [];
    // Module 9: ghost/"projected" tickets the time-dilation slider spawns —
    // tracked separately so they can be cleared when the slider resets.
    const projectedTickets = [];
    for (let i = 0; i < 6; i++) {
      const truck = buildTruckMini(TICKET_COLORS[i % TICKET_COLORS.length]);
      truck.position.set(warTablePos.x - 1.6 + (i % 3) * 1.1, 1.0, warTablePos.z + 2.3 + Math.floor(i / 3) * 0.7);
      scene.add(truck);
      warTickets.push(truck);
    }
    const warDragControls = new DragControls(warTickets, camera, renderer.domElement);
    warDragControls.addEventListener("dragstart", (e) => { e.object.userData.dragY = e.object.position.y; });
    warDragControls.addEventListener("drag", (e) => { e.object.position.y = e.object.userData.dragY; });
    warDragControls.addEventListener("dragend", (e) => {
      const obj = e.object;
      let nearest = null, bestD = Infinity;
      warTableTiles.forEach((t) => { const d = Math.hypot(obj.position.x - t.wx, obj.position.z - t.wz); if (d < bestD) { bestD = d; nearest = t; } });
      if (nearest && bestD < 1.3) {
        obj.position.set(nearest.wx, 1.02, nearest.wz);
        liveRef.current.showToast?.(`מיכל: 🚛 נקבע ליום ${nearest.label} — ההתקנה מתוזמנת ✓`);
        // Scheduling a fleet install fires an orbital drop to the planet below.
        liveRef.current.deployFleet?.(1);
      } else {
        obj.position.y = 1.0;
      }
    });

    // ── Module 2: Binance 3D Candlestick Floor ("Algo-Trading Zone") ─────
    const algoZonePos = { x: -18, z: 16 };
    const algoZoneLight = new THREE.PointLight(0xffd23f, 0.3, 9);
    algoZoneLight.position.set(algoZonePos.x, 3.2, algoZonePos.z);
    scene.add(algoZoneLight);
    const algoZoneNano = buildNanoParticleCloud(2.9, 2.2, 260, 0xffd23f);
    algoZoneNano.position.set(algoZonePos.x, 0.3, algoZonePos.z);
    scene.add(algoZoneNano);
    {
      const zoneRing = new THREE.Mesh(new THREE.RingGeometry(2.6, 2.9, 40), new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
      zoneRing.rotation.x = -Math.PI / 2; zoneRing.position.set(algoZonePos.x, 0.02, algoZonePos.z);
      scene.add(zoneRing);
      const zoneLabel = buildTinyLabelSprite("₿", "#ffd23f");
      zoneLabel.scale.set(0.9, 0.9, 1); zoneLabel.position.set(algoZonePos.x, 2.6, algoZonePos.z);
      scene.add(zoneLabel);
    }
    const CANDLE_SLOTS = 14;
    const candleGroup = new THREE.Group();
    candleGroup.position.set(algoZonePos.x - (CANDLE_SLOTS - 1) * 0.19, 0, algoZonePos.z);
    scene.add(candleGroup);
    const candleMats = {
      up: new THREE.MeshStandardMaterial({ color: 0x3fd79a, emissive: 0x1f7a52, emissiveIntensity: 0.6 }),
      down: new THREE.MeshStandardMaterial({ color: 0xff4a3e, emissive: 0x7a231f, emissiveIntensity: 0.6 }),
    };
    const candles = [];
    for (let i = 0; i < CANDLE_SLOTS; i++) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.3), candleMats.up);
      mesh.position.set(i * 0.38, 0.05, 0);
      candleGroup.add(mesh);
      candles.push({ mesh, price: null, predicted: false });
    }
    let lastCandlePrice = null;
    function pushCandle(price, predicted) {
      const oldest = candles.shift();
      if (oldest) { candleGroup.remove(oldest.mesh); oldest.mesh.geometry.dispose(); oldest.mesh.material.dispose(); }
      const up = lastCandlePrice === null || price >= lastCandlePrice;
      lastCandlePrice = price;
      const h = 0.12 + Math.random() * 0.1; // real tick deltas vary too widely for a fixed floor scale
      const mat = (up ? candleMats.up : candleMats.down).clone();
      if (predicted) { mat.transparent = true; mat.opacity = 0.4; }
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, 0.3), mat);
      mesh.position.y = h / 2;
      candleGroup.add(mesh);
      candles.push({ mesh, price, predicted });
      candles.forEach((c, i) => { c.mesh.position.x = i * 0.38; });
    }
    // Public Binance stream, no API key needed — silently no-ops if the
    // network is unavailable (sandboxed/offline preview), same fallback
    // posture as every other live-data widget in this app.
    let candleWs = null;
    try {
      candleWs = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");
      candleWs.onmessage = (ev) => {
        try { const price = parseFloat(JSON.parse(ev.data).p); if (!isNaN(price)) pushCandle(price, false); } catch {}
      };
      candleWs.onerror = () => {};
    } catch {}
    // The finance/"CFO" agent (ראובן) periodically walks over to watch the
    // board instead of a scripted permanent post — a bounded visit that
    // takes over his position directly (see the early-return in the NPC
    // walk loop below) rather than fighting the desk/status state machine.
    let financeVisit = { active: false, t: 0, duration: 0 };
    let financeVisitCheckT = 0;

    // ── Module 4: Deep Space Market Radar ────────────────────────────────
    // A giant rotating transparent radar sphere floating over the trading
    // zone. Live market rows (liveRef.current.marketRows) become "asteroids"
    // orbiting inside it: bullish glow green and rise with a comet tail,
    // bearish glow red, crackle and sink; size scales with how far they've
    // moved. The biggest mover is auto target-locked with a ring + a floating
    // HUD of its live stats. Ticked by updateRadar(dt) from the animate loop.
    const RADAR_R = 2.3;
    const radarGroup = new THREE.Group();
    radarGroup.position.set(algoZonePos.x, 3.2, algoZonePos.z);
    scene.add(radarGroup);
    radarGroup.add(new THREE.Mesh(
      new THREE.IcosahedronGeometry(RADAR_R, 2),
      new THREE.MeshBasicMaterial({ color: 0x2ee6ff, wireframe: true, transparent: true, opacity: 0.13, fog: false })
    ));
    // equator + two latitude rings for the radar-scope read
    [[0, RADAR_R], [1.3, Math.sqrt(RADAR_R * RADAR_R - 1.69)], [-1.3, Math.sqrt(RADAR_R * RADAR_R - 1.69)]].forEach(([yy, rr]) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.015, 6, 64), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.32, fog: false }));
      ring.rotation.x = Math.PI / 2; ring.position.y = yy; radarGroup.add(ring);
    });
    // rotating sweep meridian (bright half-ring)
    const radarSweep = new THREE.Mesh(new THREE.TorusGeometry(RADAR_R, 0.03, 6, 48, Math.PI), new THREE.MeshBasicMaterial({ color: 0x7ff0ff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    radarGroup.add(radarSweep);
    // target-lock ring (follows the locked asteroid)
    const lockRing = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.02, 6, 24), new THREE.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0.9, fog: false }));
    lockRing.visible = false; radarGroup.add(lockRing);
    // floating HUD sprite above the sphere
    const radarHudCvs = document.createElement("canvas"); radarHudCvs.width = 512; radarHudCvs.height = 216;
    const rhx = radarHudCvs.getContext("2d");
    const radarHudTex = new THREE.CanvasTexture(radarHudCvs); radarHudTex.colorSpace = THREE.SRGBColorSpace;
    const radarHud = new THREE.Sprite(new THREE.SpriteMaterial({ map: radarHudTex, transparent: true, depthTest: false, fog: false }));
    radarHud.scale.set(2.9, 1.22, 1); radarHud.position.set(0, RADAR_R + 1.15, 0);
    radarGroup.add(radarHud);
    const radarAsteroids = []; // { mesh, trail, angle, orbitR, speed, y, targetY, chg }
    let radarLockIdx = -1, radarRefreshT = 99;
    const radarAstGeo = new THREE.IcosahedronGeometry(1, 0);
    const makeAsteroid = () => {
      const mesh = new THREE.Mesh(radarAstGeo, new THREE.MeshBasicMaterial({ color: 0x3fd79a, transparent: true, opacity: 0.95, fog: false }));
      const trail = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 3.2, 8),
        new THREE.MeshBasicMaterial({ color: 0x3fd79a, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
      );
      trail.position.y = -1.7; trail.rotation.x = Math.PI; // comet tail points down (whence it rose)
      mesh.add(trail);
      radarGroup.add(mesh);
      return { mesh, trail, angle: Math.random() * Math.PI * 2, orbitR: 0.7 + Math.random() * 1.15, speed: 0.18 + Math.random() * 0.3, y: 0, targetY: 0, chg: 0, bull: true };
    };
    const drawRadarHud = (lock) => {
      rhx.clearRect(0, 0, 512, 216);
      rhx.fillStyle = "rgba(6,16,26,.82)"; rhx.strokeStyle = "rgba(46,230,255,.7)"; rhx.lineWidth = 3;
      rhx.beginPath(); rhx.roundRect(6, 6, 500, 204, 14); rhx.fill(); rhx.stroke();
      rhx.fillStyle = "#2ee6ff"; rhx.font = "700 26px system-ui,sans-serif"; rhx.textAlign = "left";
      rhx.fillText("🎯 TARGET LOCK", 24, 44);
      if (lock) {
        const bull = lock.chg >= 0;
        rhx.fillStyle = "#eaf6ff"; rhx.font = "800 40px system-ui,sans-serif";
        rhx.fillText(String(lock.name).slice(0, 16), 24, 96);
        rhx.fillStyle = bull ? "#3fd79a" : "#ff5a4e"; rhx.font = "700 34px 'Courier New',monospace";
        rhx.fillText(`${lock.price}  ${bull ? "▲" : "▼"}${Math.abs(lock.chg).toFixed(2)}%`, 24, 146);
        rhx.fillStyle = "#9fd6ff"; rhx.font = "600 24px system-ui,sans-serif";
        const sug = lock.chg > 2 ? "מומנטום חיובי חזק · הזדמנות לונג" : lock.chg < -2 ? "חולשה · זהירות / שורט" : "יציב · המתנה לאיתות";
        rhx.fillText(sug, 24, 190);
      } else {
        rhx.fillStyle = "#5f7d8f"; rhx.font = "600 24px system-ui,sans-serif";
        rhx.fillText("סורק שווקים…", 24, 110);
      }
      radarHudTex.needsUpdate = true;
    };
    drawRadarHud(null);
    const refreshRadar = () => {
      const rows = (liveRef.current.marketRows || []).slice(0, 12);
      while (radarAsteroids.length < rows.length) radarAsteroids.push(makeAsteroid());
      let lock = null, lockAbs = -1;
      radarAsteroids.forEach((a, i) => {
        const r = rows[i];
        a.mesh.visible = !!r;
        if (!r) return;
        a.chg = r.chg || 0; a.bull = a.chg >= 0;
        const col = a.bull ? 0x3fd79a : 0xff4a3e;
        a.mesh.material.color.setHex(col); a.trail.material.color.setHex(col);
        a.trail.visible = a.bull; // comet tail only for risers
        a.mesh.scale.setScalar(0.12 + Math.min(0.34, Math.abs(a.chg) * 0.045));
        a.targetY = Math.max(-1.4, Math.min(1.4, a.chg * 0.12));
        if (Math.abs(a.chg) > lockAbs) { lockAbs = Math.abs(a.chg); lock = { name: r.name, price: r.price, chg: a.chg }; radarLockIdx = i; }
      });
      if (!rows.length) radarLockIdx = -1;
      drawRadarHud(lock);
    };
    const updateRadar = (dt) => {
      radarGroup.rotation.y += dt * 0.08;
      radarSweep.rotation.y += dt * 0.9;
      radarRefreshT += dt;
      if (radarRefreshT >= 4) { radarRefreshT = 0; refreshRadar(); }
      for (let i = 0; i < radarAsteroids.length; i++) {
        const a = radarAsteroids[i];
        if (!a.mesh.visible) continue;
        a.angle += dt * a.speed;
        a.y += (a.targetY - a.y) * Math.min(1, dt * 1.4);
        a.mesh.position.set(Math.cos(a.angle) * a.orbitR, a.y, Math.sin(a.angle) * a.orbitR);
        a.mesh.rotation.y += dt * 1.1; a.mesh.rotation.x += dt * 0.7;
        if (!a.bull) a.mesh.material.opacity = 0.65 + Math.random() * 0.35; // bearish electric crackle
        else a.mesh.material.opacity = 0.95;
      }
      if (radarLockIdx >= 0 && radarAsteroids[radarLockIdx]?.mesh.visible) {
        lockRing.visible = true;
        lockRing.position.copy(radarAsteroids[radarLockIdx].mesh.position);
        lockRing.rotation.z += dt * 2.2;
        const s = 1 + 0.12 * Math.sin(clock.elapsedTime * 4);
        lockRing.scale.setScalar(s);
      } else { lockRing.visible = false; }
    };

    // ── Module 3: Interactive Companion (Kids Mode) ──────────────────────
    const kidsCompanionPos = { x: -22, z: -16 };
    const kidsCompanion = buildKidsCompanion();
    kidsCompanion.position.set(kidsCompanionPos.x, 0, kidsCompanionPos.z);
    scene.add(kidsCompanion);

    // ── Module 4: Bookkeeper Export Terminal ─────────────────────────────
    const bookkeeperPos = { x: 4, z: -24 };
    const bookkeeperTerminal = buildBookkeeperTerminal();
    bookkeeperTerminal.group.position.set(bookkeeperPos.x, 0, bookkeeperPos.z);
    scene.add(bookkeeperTerminal.group);
    obstacles.push({ x: bookkeeperPos.x, z: bookkeeperPos.z, r: 0.75 });

    // ── Module 5: 'Me' Comm-Link Integrator (SIMULATED — see comment on
    // buildCallerCardTexture) ────────────────────────────────────────────
    const commLinkPos = { x: -12, z: 22 };
    const commLink = buildCommLinkStation();
    commLink.group.position.set(commLinkPos.x, 0, commLinkPos.z);
    scene.add(commLink.group);
    obstacles.push({ x: commLinkPos.x, z: commLinkPos.z, r: 0.5 });
    const callerCardMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide });
    const callerCard = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.88), callerCardMat);
    callerCard.position.set(commLinkPos.x, 2.35, commLinkPos.z);
    callerCard.visible = false;
    scene.add(callerCard);
    const FAKE_CALLERS = [
      ["דוד לוי · אשדוד", "052-XXX-4471", "לקוח פוטנציאלי · התעניין באתמול"],
      ["רונית כהן · באר שבע", "054-XXX-8820", "לקוח קיים · חוזה מתחדש"],
      ["משה אברהם · קריית גת", "050-XXX-1193", "פנייה חדשה · התקנת מצלמות"],
    ];
    let callerCardT = 0, callerCardShowing = false;
    function triggerFakeCall() {
      if (callerCardShowing) return;
      const [name, phone, tag] = FAKE_CALLERS[Math.floor(Math.random() * FAKE_CALLERS.length)];
      callerCardMat.map = buildCallerCardTexture(name, phone, tag);
      callerCardMat.needsUpdate = true;
      callerCard.visible = true;
      callerCardShowing = true;
      callerCardT = 0;
    }
    liveRef.current.triggerFakeCall = triggerFakeCall;

    // ── Module 6: Chery Tiggo 7 PHEV Virtual Garage ──────────────────────
    // Reuses the existing Tiggo 7 display podium (CAR_SPOT/VEHICLE_POS,
    // built further below) rather than a second duplicate bay — the hovering
    // battery/mileage/loan readout is rendered as a React overlay gated on
    // the existing `nearVehicle` proximity flag, further below.

    // Department zoning — the 13 desks are grouped into three clusters
    // (declared in that order in AGENTS, zipped 1:1 onto deskPositions):
    // north row = revenue/growth, west column = finance/ops, south row =
    // engineering. A floating neon zone label over each cluster's midpoint
    // makes the grouping actually readable on the floor, not just an
    // invisible convention in the data.
    {
      const zones = [
        { range: [0, 5], label: "צמיחה · הכנסות", color: 0xF43F5E },
        { range: [5, 9], label: "כספים · תפעול", color: 0x14B8A6 },
        { range: [9, 13], label: "הנדסה · מערכות", color: 0xFF8C42 },
      ];
      zones.forEach((z) => {
        const group = deskPositions.slice(z.range[0], z.range[1]);
        const cx = group.reduce((s, p) => s + p.x, 0) / group.length;
        const cy = group.reduce((s, p) => s + p.y, 0) / group.length;
        const [wx, wz] = toWorld(cx, cy);
        const sign = buildNeonSign(z.label, z.color, 2.6, 0.5);
        sign.position.set(wx, 4.1, wz);
        scene.add(sign);
      });
    }
    dineTablePositions.forEach((t) => {
      const tbl = buildDiningTable();
      const [wx, wz] = toWorld(t.x, t.y);
      tbl.position.set(wx, 0, wz);
      scene.add(tbl);
      // (warm office pendant lamp over each table removed — the recessed hull
      // strip-lighting overhead covers this area; a hanging globe lamp read
      // as a break-room, not a ship's mess.)
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
      // The owner's real marble-and-gold conference table replaces the
      // procedural capsule once it loads (which stays as the fallback if
      // the model ever fails to fetch — same pattern as the podium car).
      {
        const tableLoader = new GLTFLoader();
        tableLoader.setMeshoptDecoder(MeshoptDecoder);
        tableLoader.load(base + "office-models/meeting_table.glb", (g) => {
          const real = g.scene;
          real.position.set(wx, 0, wz);
          real.rotation.y = Math.PI / 2; // long axis across the room, matching the seat spread
          scene.add(real);
          real.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
          mt.visible = false;
        }, undefined, () => { /* model failed to load — procedural capsule stays visible */ });
      }
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
      registerRoom(rooms, wx, wz, 0, { cx: 0, cz: 0, halfW: 3.8, halfD: 3.4, doorX: 0, doorZ: 3.4, doorNX: 0, doorNZ: 1 });

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
    // The owner-suite rack screens — same live-data pattern as the wall TVs
    // below, just mounted above the two server racks instead of a separate
    // TV frame. Canvases live here so the periodic redraw loop can reach
    // them by plain closure, same as tradeCanvas/hgCanvas.
    const rackTradeCanvas = document.createElement("canvas");
    rackTradeCanvas.width = 480; rackTradeCanvas.height = 282;
    const rackTradeCtx = rackTradeCanvas.getContext("2d");
    const rackHgCanvas = document.createElement("canvas");
    rackHgCanvas.width = 480; rackHgCanvas.height = 282;
    const rackHgCtx = rackHgCanvas.getContext("2d");
    const ownerOffice = buildOwnerOffice(0xE4BC63, deskTemplate, laptopTemplate, furnitureTemplate, guestLocal, rackTradeCanvas, rackHgCanvas);
    drawTradeScreen(rackTradeCtx, rackTradeCanvas.width, rackTradeCanvas.height, liveRef.current.marketRows);
    drawHgScreen(rackHgCtx, rackHgCanvas.width, rackHgCanvas.height, liveRef.current.bizData);
    ownerOffice.group.position.set(OFFICE_ORIGIN.x, 0, OFFICE_ORIGIN.z);
    scene.add(ownerOffice.group);
    ownerOffice.obstacles.forEach((o) => obstacles.push({ x: OFFICE_ORIGIN.x + o.x, z: OFFICE_ORIGIN.z + o.z, r: o.r }));
    registerRoom(rooms, OFFICE_ORIGIN.x, OFFICE_ORIGIN.z, 0, { cx: 0.6, cz: -0.15, halfW: 5.9, halfD: 4.15, doorX: -5.3, doorZ: 0.05, doorNX: -1, doorNZ: 0 });
    if (ownerOffice.deskMon) deskMons.push(ownerOffice.deskMon);
    if (ownerOffice.deskHolo) deskHolos.push(ownerOffice.deskHolo);
    const ownerSpinners = ownerOffice.spinners || [];
    const ownerBlinkMats = ownerOffice.blinkMats || [];
    // Both the in-office holo and the giant one over the showroom (below)
    // ARE Alpha, the main assistant — walking up to either one starts a
    // conversation with it, same as approaching any of the tribe agents.
    const alphaSpots = [];
    if (ownerOffice.holoLocal) {
      alphaSpots.push({ x: OFFICE_ORIGIN.x + ownerOffice.holoLocal.x, z: OFFICE_ORIGIN.z + ownerOffice.holoLocal.z });
    }
    // A giant version of the same globe, grounded at the room's dead center
    // (owner request: "like a small sun", standing on the floor where the
    // car used to be — the car and its podium moved out near the owner's
    // office so this could take the center without the two competing for
    // the same floor space).
    {
      const sunColor = 0xE4BC63;
      const SUN_SPOT = { x: -2.5, z: -1.0 };
      // A ground stage of its own — same staging language as the car's old
      // podium+ring, so the giant hologram reads as deliberately grounded
      // centerpiece rather than a sphere dropped in an empty spot.
      const sunStage = new THREE.Mesh(
        new THREE.CylinderGeometry(2.7, 2.9, 0.14, 40),
        new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.35, metalness: 0.5 })
      );
      sunStage.position.set(SUN_SPOT.x, 0.07, SUN_SPOT.z);
      sunStage.receiveShadow = true;
      scene.add(sunStage);
      const sunStageRing = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.035, 8, 60), new THREE.MeshBasicMaterial({ color: sunColor }));
      sunStageRing.rotation.x = Math.PI / 2;
      sunStageRing.position.set(SUN_SPOT.x, 0.15, SUN_SPOT.z);
      scene.add(sunStageRing);
      obstacles.push({ x: SUN_SPOT.x, z: SUN_SPOT.z, r: 3.0 });
      const sunGroup = new THREE.Group();
      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.8, 2),
        new THREE.MeshBasicMaterial({ color: 0xfff2d0 })
      );
      sunGroup.add(core);
      const wire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.3, 1),
        new THREE.MeshBasicMaterial({ color: sunColor, wireframe: true, transparent: true, opacity: 0.8 })
      );
      sunGroup.add(wire);
      const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
        color: sunColor, transparent: true, opacity: 0.5, depthWrite: false,
        map: (() => {
          const cvs = document.createElement("canvas"); cvs.width = cvs.height = 256;
          const cx2 = cvs.getContext("2d");
          const grd = cx2.createRadialGradient(128, 128, 0, 128, 128, 128);
          grd.addColorStop(0, "rgba(255,240,200,0.9)"); grd.addColorStop(1, "rgba(255,240,200,0)");
          cx2.fillStyle = grd; cx2.fillRect(0, 0, 256, 256);
          return new THREE.CanvasTexture(cvs);
        })(),
      }));
      glowSprite.scale.setScalar(11);
      sunGroup.add(glowSprite);
      const sunLight = new THREE.PointLight(sunColor, 1.4, 26);
      sunGroup.add(sunLight);
      // Nameplate floats just above the ball (under the 5.4m ceiling)
      // instead of below it now that the ball itself sits near the floor.
      const sunSign = buildNeonSign("אלפא · העוזר הראשי", sunColor, 4.2, 0.8);
      sunSign.position.y = 2.7;
      sunGroup.add(sunSign);
      // Grounded: the wireframe's own 2.3 radius rests just above the floor
      // instead of floating up past the ceiling.
      sunGroup.position.set(SUN_SPOT.x, 2.4, SUN_SPOT.z);
      scene.add(sunGroup);
      ownerSpinners.push(wire, core);
      alphaSpots.push({ x: SUN_SPOT.x, z: SUN_SPOT.z });
    }
    scene.userData.alphaSpots = alphaSpots;
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
      siteTex.anisotropy = MAX_ANISO;
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
    // ── God Mode registry — the curated set of objects an owner can select,
    // move/rotate/scale or delete from the admin panel. Deliberately NOT the
    // whole scene: desks/agents/walls are data-driven (positions come from
    // OFC_DESKS etc.) and moving them here wouldn't persist or would fight
    // the sim, so only free-standing display pieces (car, trucks, portal)
    // and anything spawned from the panel are registered.
    const editableObjects = [];
    // Persistent inventory log (localStorage) — every spawned asset gets a
    // unique ID + its spawn coordinates recorded here, same pattern as the
    // rest of the app's hg2:*/alpha:* stores. Legacy showroom pieces (car/
    // trucks/portal) aren't logged here — they're built into the scene,
    // not "installed" assets — only things the owner actually adds are.
    const logInventoryAsset = (id, type, label, pos) => {
      try {
        const key = "alpha:sim:inventory";
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        list.push({ id, type, label, x: pos.x, y: pos.y, z: pos.z, spawnedAt: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(list));
      } catch {}
    };
    const registerEditable = (obj, label, deletable = false, meta = {}) => {
      obj.userData.editable = true;
      obj.userData.label = label;
      obj.userData.deletable = deletable;
      obj.userData.meta = meta;
      editableObjects.push(obj);
    };
    // (The Tiggo 7 + fleet-truck showroom podiums that used to stand on the
    // main floor were moved out to the Hangar's vehicle bay — owner request,
    // spaceship retheme. The Hangar already parks a drivable Tiggo 7 and
    // Volvo FH16 there, reached through the office's Hangar door, so the
    // vehicles live in one place instead of duplicated on bridge podiums.
    // scanRing / centerSpin stay declared above but empty — the LIDAR sweep
    // and turntable spin simply have nothing to act on now, and every
    // consumer already guards on `scanRing`/`centerSpin.length`.)
    scene.userData.trucks = []; // no bridge truck signs — vehicles are in the Hangar now

    // ── RQ-180 display, near the east window band — walk up to it and a
    // "Take Flight" prompt appears, opening the flight simulator overlay.
    const PLANE_POS = { x: 34.5, z: -14 };
    scene.userData.planeSpot = { x: PLANE_POS.x, z: PLANE_POS.z };
    {
      const podium = new THREE.Mesh(
        new THREE.CylinderGeometry(2.6, 2.8, 0.14, 40),
        new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.35, metalness: 0.5 })
      );
      podium.position.set(PLANE_POS.x, 0.07, PLANE_POS.z);
      podium.receiveShadow = true;
      scene.add(podium);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.03, 8, 60), new THREE.MeshBasicMaterial({ color: 0x2ee6ff }));
      ring.rotation.x = Math.PI / 2;
      ring.position.set(PLANE_POS.x, 0.15, PLANE_POS.z);
      scene.add(ring);
      const spot = new THREE.PointLight(0xcfeaff, 0.7, 9);
      spot.position.set(PLANE_POS.x, 3.6, PLANE_POS.z);
      scene.add(spot);
      obstacles.push({ x: PLANE_POS.x, z: PLANE_POS.z, r: 2.9 });
      const sign = buildNeonSign("RQ-180", 0x2ee6ff, 2.0, 0.45);
      sign.position.set(PLANE_POS.x, 3.9, PLANE_POS.z);
      scene.add(sign);
      const planeLoader = new GLTFLoader();
      planeLoader.setMeshoptDecoder(MeshoptDecoder);
      planeLoader.load(base + "office-models/rq180.glb", (g) => {
        const model = g.scene;
        const pb = new THREE.Box3().setFromObject(model);
        const ps = pb.getSize(new THREE.Vector3());
        const pc = pb.getCenter(new THREE.Vector3());
        const s = 4.2 / Math.max(ps.x, ps.z, 0.01);
        const wrap = new THREE.Group();
        model.position.set(-pc.x, -pb.min.y, -pc.z);
        wrap.add(model);
        wrap.scale.setScalar(s);
        wrap.position.set(PLANE_POS.x, 0.14, PLANE_POS.z);
        scene.add(wrap);
        model.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
        centerSpin.push(wrap);
        registerEditable(wrap, "RQ-180 (תצוגה)", false, {
          origin_date: "2024", material_spec: "מרוכב פחמן, ציפוי חמקן", security_level: "מסווג", maintenance_status: "תקין",
        });
      }, undefined, () => { /* model failed to load — podium stays empty */ });
    }

    // ── Hangar bay door, on the west wall — walk up to it and an "Enter
    // Hangar" prompt appears, opening the hangar overlay (Hyperion statue +
    // vehicle bay + the house beyond its open door).
    const HANGAR_POS = { x: -FLOOR_W / 2 + 1.2, z: 5 };
    scene.userData.hangarSpot = { x: HANGAR_POS.x, z: HANGAR_POS.z };
    {
      const doorMat = new THREE.MeshStandardMaterial({ color: 0xe8b93c, roughness: 0.5, metalness: 0.4 });
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 4.6), doorMat);
      frame.position.set(HANGAR_POS.x + 0.1, 1.6, HANGAR_POS.z);
      scene.add(frame);
      const doorTex = buildHangarWallTexture();
      doorTex.repeat.set(1.5, 1);
      const doorPanel = new THREE.Mesh(new THREE.PlaneGeometry(4.3, 2.9), new THREE.MeshStandardMaterial({ map: doorTex, roughness: 0.6, metalness: 0.3 }));
      doorPanel.rotation.y = Math.PI / 2;
      doorPanel.position.set(HANGAR_POS.x + 0.24, 1.55, HANGAR_POS.z);
      scene.add(doorPanel);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.03, 8, 40), new THREE.MeshBasicMaterial({ color: 0xe8b93c }));
      ring.position.set(HANGAR_POS.x + 0.3, 1.55, HANGAR_POS.z);
      scene.add(ring);
      const spot = new THREE.PointLight(0xffe2a0, 0.6, 8);
      spot.position.set(HANGAR_POS.x + 1.5, 2.8, HANGAR_POS.z);
      scene.add(spot);
      const sign = buildNeonSign("ההאנגר", 0xe8b93c, 2.2, 0.5);
      sign.rotation.y = Math.PI / 2;
      sign.position.set(HANGAR_POS.x + 0.3, 3.5, HANGAR_POS.z);
      scene.add(sign);
      obstacles.push({ x: HANGAR_POS.x + 0.8, z: HANGAR_POS.z, r: 1.4 });
    }

    // ── Space portal ─────────────────────────────────────────────────────
    // Placed on the south wall — clear of the desk ring (max radius ~15.84),
    // reception (-13.8, 28.8) and the cafeteria (30.6, 11.2). Walking into
    // it (proximity check in animate(), below) opens the solar-system view.
    const PORTAL = { x: 0, z: 30 };
    scene.userData.portal = PORTAL;
    let portalObj = null;
    {
      const glow = new THREE.PointLight(0x8fd0ff, 1.1, 8);
      glow.position.set(PORTAL.x, 1.3, PORTAL.z);
      scene.add(glow);
      const ringMark = new THREE.Mesh(new THREE.RingGeometry(1.6, 1.9, 40), new THREE.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
      ringMark.rotation.x = -Math.PI / 2;
      ringMark.position.set(PORTAL.x, 0.02, PORTAL.z);
      scene.add(ringMark);
      const sign = buildNeonSign("SPACE SIM", 0x8fd0ff, 2.0, 0.42);
      sign.position.set(PORTAL.x, 3.6, PORTAL.z - 1.6);
      scene.add(sign);
      const portalLoader = new GLTFLoader();
      portalLoader.setMeshoptDecoder(MeshoptDecoder);
      portalLoader.load(base + "office-models/space_portal.glb", (g) => {
        const p = g.scene;
        const pb = new THREE.Box3().setFromObject(p);
        const ps = pb.getSize(new THREE.Vector3());
        const pc = pb.getCenter(new THREE.Vector3());
        const s = 2.2 / ps.y; // fit a 2.2m-tall ring
        const wrap = new THREE.Group();
        p.position.set(-pc.x, -pb.min.y, -pc.z);
        wrap.add(p);
        wrap.scale.setScalar(s);
        wrap.position.set(PORTAL.x, 0, PORTAL.z);
        wrap.traverse((o) => { if (o.isMesh) { o.material.side = THREE.DoubleSide; } });
        scene.add(wrap);
        portalObj = wrap;
        registerEditable(wrap, "SPACE PORTAL", false, {
          origin_date: "2026", material_spec: "זכוכית/מתכת, ליבה זוהרת", security_level: "מוגבל — גישת בעלים בלבד", maintenance_status: "פעיל",
        });
      }, undefined, () => {});
    }

    // (The office pets — ניקי the pomeranian and טיארה — were removed for the
    // starship retheme: live animals wandering the deck broke the "crew on a
    // ship" read. `dogs` stays an empty array so the wander loop + God-Mode
    // dump that iterate it simply no-op.)
    const dogs = [];
    const dogSpot = () => ({ x: -10 + Math.random() * 15, z: -7 + Math.random() * 12 });

    // (Reception + the cafeteria moved to the Hangar's new Crew Deck annex —
    // owner request, full spaceship retheme: neither is tied to the agents'
    // break-schedule pathing, unlike the gym/lounge/dining tables below,
    // which stay put since agents actually walk to these exact spots.
    // Restroom stalls stay removed — the SW corner stays open.)

    // ── Mini-gym + lounge (north window strip between the two truck podiums)
    // World coordinates are the toWorld() image of OFC_GYM/OFC_LOUNGE in
    // App.jsx — the animated agents actually walk to these exact spots
    // during a break window, so the props sit right where they'll stand.
    {
      const gym = buildMiniGym(0x6fd3f0);
      const GYM = { x: -11.5, z: -24.5 };
      gym.group.position.set(GYM.x, 0, GYM.z);
      scene.add(gym.group);
      gym.obstacles.forEach((o) => obstacles.push({ x: GYM.x + o.x, z: GYM.z + o.z, r: o.r }));

      const lounge = buildLoungeArea(0xE4BC63);
      const LNG = { x: 11.5, z: -24.5 };
      lounge.group.position.set(LNG.x, 0, LNG.z);
      scene.add(lounge.group);
      lounge.obstacles.forEach((o) => obstacles.push({ x: LNG.x + o.x, z: LNG.z + o.z, r: o.r }));
    }

    // (Kitchen moved to the Hangar's Crew Deck annex too — decor only, same
    // reasoning as reception/the cafeteria above.)

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
      // (the record player + vinyls used to sit on the cafeteria counter at
      // world coords that no longer matched its position after an earlier
      // move — removed along with the cafeteria rather than left floating.)
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
    // 📱 Phone-in-hand + hologram: whenever a conversation is live (or the
    // phone UI is open), a glowing handset appears at the owner's hand
    // projecting a light cone with the current line of dialogue floating
    // above it — the conversation, physically in the room.
    const phoneGrp = new THREE.Group();
    const phoneBeam = new THREE.Mesh(
      new THREE.ConeGeometry(0.30, 0.55, 18, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.10, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false, fog: false })
    );
    {
      const handset = new THREE.Mesh(
        new THREE.BoxGeometry(0.055, 0.115, 0.012),
        new THREE.MeshStandardMaterial({ color: 0x0b0e14, metalness: 0.6, roughness: 0.3, emissive: 0x2ee6ff, emissiveIntensity: 0.35 })
      );
      phoneGrp.add(handset);
      phoneBeam.position.y = 0.34;
      phoneGrp.add(phoneBeam);
    }
    const phoneHoloCvs = document.createElement("canvas");
    phoneHoloCvs.width = 512; phoneHoloCvs.height = 224;
    const phCtx = phoneHoloCvs.getContext("2d");
    const phoneHoloTex = new THREE.CanvasTexture(phoneHoloCvs);
    phoneHoloTex.colorSpace = THREE.SRGBColorSpace;
    const drawPhoneHolo = (who, text) => {
      phCtx.clearRect(0, 0, 512, 224);
      phCtx.fillStyle = "rgba(4,16,26,.72)"; phCtx.fillRect(0, 0, 512, 224);
      phCtx.strokeStyle = "rgba(46,230,255,.75)"; phCtx.lineWidth = 3; phCtx.strokeRect(2, 2, 508, 220);
      phCtx.fillStyle = "#2ee6ff"; phCtx.font = "800 30px system-ui"; phCtx.textAlign = "right";
      phCtx.fillText("📡 " + (who || "ALPHA"), 488, 46);
      phCtx.fillStyle = "#d7f6ff"; phCtx.font = "500 24px system-ui";
      const words = String(text || "").split(" ");
      let line = "", y = 92;
      for (const w of words) {
        if ((line + " " + w).length > 34) { phCtx.fillText(line, 488, y); y += 34; line = w; if (y > 200) break; }
        else line = line ? line + " " + w : w;
      }
      if (y <= 200 && line) phCtx.fillText(line, 488, y);
      // holographic scan lines
      phCtx.fillStyle = "rgba(46,230,255,.06)";
      for (let sy = 4; sy < 224; sy += 6) phCtx.fillRect(2, sy, 508, 1);
      phoneHoloTex.needsUpdate = true;
    };
    drawPhoneHolo("", "מחובר · ALPHA");
    const phoneHolo = new THREE.Sprite(new THREE.SpriteMaterial({ map: phoneHoloTex, transparent: true, opacity: 0.95, depthWrite: false }));
    phoneHolo.scale.set(1.05, 0.46, 1);
    phoneHolo.position.y = 0.85;
    phoneGrp.add(phoneHolo);
    phoneGrp.position.set(0.21, 1.03, 0.2);
    phoneGrp.visible = false;
    playerH.group.add(phoneGrp);
    let lastHoloLine = "";
    let phoneAnimT = 1; // 0→1 raise/flicker-in progress
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
      // Every agent except דבורה (facilities) wears the uploaded Legendary
      // Robot rig instead of the human model — owner request. דבורה herself
      // was later given the uploaded "Sophia" character model instead of the
      // shared casual_male template. Both real-textured models carry their
      // own look, so they skip the per-agent colour tint the plain human
      // template uses to differentiate otherwise-identical bodies.
      const h = a.id === "facilities"
        ? buildHuman(a.color, a.name, false, sophiaTemplate, sophiaClips, CHAR_SCALE, SOPHIA_CENTER_OFFSET, false, a.title, sophiaClipMap)
        : buildHuman(a.color, a.name, false, robotTemplate, robotClips, CHAR_SCALE, ROBOT_CENTER_OFFSET, false, a.title, robotClipMap);
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

    let integrityT = 0;
    let frameNo = 0;
    let secSwitchT = 0;
    let podT = 0;      // 1Hz charging-pod meter/charge tick
    let lightningT = 0; // ~14Hz pod lightning-bolt flicker tick
    // Module 7: Rap/Reggaeton victory hype mode
    let hypeOn = false, hypeT = 0, hypeDuration = 0, hypeLasers = null;
    // Module 8: 360° drone/CCTV camera mode
    let droneOn = false, droneT = 0;
    // Module 9: time-dilation slider (0 = normal speed, up to ~40x fast-forward)
    let timeDilation = 0;
    let dilationCandleT = 0;
    let dilationPhaseT = 0;
    let dilationTicketT = 0;
    // Module 3: gamepad-triggered kids game debounce (edge-detect button 1)
    let gpBtn1Prev = false;
    let workload = 0.15; // smoothed 0..1 "system workload" driving the energy-grid floor
    // Only trust a gamepad index that fired a REAL "gamepadconnected" event —
    // navigator.getGamepads() can return stale/phantom entries (Bluetooth
    // devices, leftover browser state) reporting connected:true with drifting
    // or stuck axis values even when no controller was ever actually paired,
    // which was walking the player on its own with nothing touched.
    let gamepadIndex = null;
    // Only accept a standard-mapping pad — some Windows HID peripherals
    // (wireless mouse/keyboard dongles, headset controls) fire a genuine
    // "gamepadconnected" event with a non-standard mapping and drifting
    // axis values, which without this check gets treated as a real
    // controller and spins the camera on its own with nothing plugged in.
    const onGamepadConnected = (e) => { if (e.gamepad.mapping === "standard") gamepadIndex = e.gamepad.index; };
    const onGamepadDisconnected = (e) => { if (gamepadIndex === e.gamepad.index) gamepadIndex = null; };
    window.addEventListener("gamepadconnected", onGamepadConnected);
    window.addEventListener("gamepaddisconnected", onGamepadDisconnected);
    // A real controller already connected before this component mounted may
    // never fire its own "gamepadconnected" event again — pick it up now,
    // but only if it reports the standard mapping (a genuine recognized
    // controller; phantom/stale entries typically report a blank mapping).
    try {
      const existingPads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (const g of existingPads) { if (g && g.connected && g.mapping === "standard") { gamepadIndex = g.index; break; } }
    } catch {}
    let scanT = 0;     // diagnostic sweep timer over the showroom car
    let spatialT = 9;  // spatial-bridge refresh timer (starts ripe)
    // Third-person chase-cam orbit — the left stick swings the CAMERA around
    // the player without turning the player's own facing (owner request:
    // right stick walks, left stick moves the camera, not the character).
    // Defaults reproduce the old fixed (0, 6.4, 7.6) offset exactly (dist
    // 9.94, elevation ~40°) so the view is unchanged until the stick is used.
    let camAz = 0, camEl = 0.6999;
    const CAM_DIST = 9.94, CAM_EL_MIN = 0.15, CAM_EL_MAX = 1.4;
    // Adaptive perf watchdog — CPU core count / RAM (DeviceProfiler's only
    // real signals) say nothing about GPU strength, and that's exactly the
    // blind spot on older Apple hardware: a 2020 MacBook Pro or an iMac with
    // integrated/older discrete graphics reports plenty of cores and still
    // chokes on SSAO+bloom+shadows together. Rather than guess at Mac model
    // strings (fragile, breaks on the next hardware refresh), measure the
    // actual achieved frame time after the initial asset-load settles, and
    // drop to turbo once — same lever the manual toggle already uses —  if
    // it's genuinely struggling, on ANY machine, Apple or not.
    let perfWatchT = 0;
    let perfFrameCount = 0;
    let perfBadFrames = 0;
    let perfChecked = false;
    const clock = new THREE.Clock();
    const curSky = new THREE.Color(0x1b2440);
    const tmpColor = new THREE.Color();
    // Reused every frame (never allocated inside animate()) — feeds the CCTV
    // frustum check below.
    const camFrustum = new THREE.Frustum();
    const camFrustumMat = new THREE.Matrix4();

    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      liveRef.current.keys[k] = true;
      // E toggles sitting on your own office chair (only when near it).
      if (k === "e") { liveRef.current.toggleSit?.(); liveRef.current.toggleVehicle?.(); liveRef.current.toggleFlight?.(); liveRef.current.toggleHangar?.(); }
      if (k === "escape" && liveRef.current.inVehicle) liveRef.current.setInVehicle?.(false);
      // Module 8: 'C' detaches into the Heavy Guard 360° drone/CCTV cam.
      if (k === "c") liveRef.current.reactSetDrone?.((v) => !v);
    };
    const onKeyUp = (e) => { liveRef.current.keys[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // renderer.setAnimationLoop (not requestAnimationFrame) drives this loop
    // — required for WebXR: an active XR session calls the loop at the
    // headset's own refresh rate and requestAnimationFrame simply doesn't
    // fire during a session. Works identically to rAF outside of XR too.
    function animate() {
      const rawDt = clock.getDelta();
      const dt = Math.min(0.05, rawDt);
      // The office scene never actually unmounts while a full-screen overlay
      // (Hangar / Flight / Space) is open — it just sits hidden behind it —
      // so without this guard it kept fully simulating AND rendering (SSAO +
      // bloom + the new Energy Grid/arc-pillar/nano-particle work) every
      // single frame for a scene nobody can see, competing with the overlay's
      // own renderer for the same GPU and dragging it down. Skip all of it
      // while any overlay is active; clock.getDelta() above still gets called
      // every tick so time doesn't jump when the overlay closes.
      if (liveRef.current.inHangar || liveRef.current.inFlight || liveRef.current.inSpace) return;
      // Sample real (unclamped) frame time for ~2s starting 6s in — long
      // enough for the initial GLB/texture loads to be done so their one-time
      // hitches don't get mistaken for a sustained low-power GPU. One shot
      // per session (perfChecked): downgrades if warranted, then gets out of
      // the way — this isn't a continuous rebalancer, just a one-time safety
      // net for hardware the manual turbo toggle would otherwise never reach
      // (most people never open Settings after something feels "just a bit slow").
      if (!perfChecked && !turboOn) {
        perfWatchT += rawDt;
        if (perfWatchT > 6 && perfWatchT < 8) {
          perfFrameCount++;
          if (rawDt > 1 / 24) perfBadFrames++; // slower than 24fps this frame
        } else if (perfWatchT >= 8) {
          perfChecked = true;
          // Over 40% of the sampled window ran under 24fps → genuinely
          // struggling GPU, not a one-off hitch. Same lever as the manual
          // toggle, triggered once, with a visible one-time notice so it
          // doesn't read as the sim randomly changing quality on its own.
          if (perfFrameCount > 10 && perfBadFrames / perfFrameCount > 0.4) {
            liveRef.current.reactSetTurbo?.(true);
            liveRef.current.setAutoTurboNotice?.(true);
          }
        }
      }
      const keys = liveRef.current.keys;

      // ── Gamepad (Xbox / PlayStation, native HTML5 Gamepad API) — feeds the
      // same joyVec/turnVec channel the touch joysticks use, so every branch
      // below (movement, first-person look, camera orbit) already works with
      // no separate control path to keep in sync. Left stick = movement,
      // right stick = camera/look — standard controller convention; this
      // runs alongside keyboard/touch, never replacing them, and only
      // overwrites a vec when its OWN touch stick isn't mid-drag so a
      // finger on the on-screen stick always wins over a stale controller.
      const GP_DEADZONE = 0.2;
      const gpAxis = (v) => (Math.abs(v) < GP_DEADZONE ? 0 : v);
      const gp = (gamepadIndex !== null && navigator.getGamepads) ? navigator.getGamepads()[gamepadIndex] : null;
      if (gp && gp.connected) {
        const gx = gpAxis(gp.axes[0] || 0), gy = gpAxis(gp.axes[1] || 0);
        const gcx = gpAxis(gp.axes[2] || 0), gcy = gpAxis(gp.axes[3] || 0);
        if (gx || gy) liveRef.current.joyVec = { x: gx, y: gy };
        else if (!rightDrag.current) liveRef.current.joyVec = { x: 0, y: 0 };
        if (gcx || gcy) liveRef.current.turnVec = { x: gcx, y: gcy };
        else if (!leftDrag.current) liveRef.current.turnVec = { x: 0, y: 0 };
        // Button 0 (Xbox A / PS Cross) — edge-triggered like the "E" key so a
        // held button fires the interact/talk trigger once per press.
        const gpBtn0 = !!(gp.buttons[0] && gp.buttons[0].pressed);
        if (gpBtn0 && !liveRef.current.gpBtn0Prev) {
          liveRef.current.toggleSit?.(); liveRef.current.toggleVehicle?.(); liveRef.current.toggleFlight?.(); liveRef.current.toggleHangar?.();
        }
        liveRef.current.gpBtn0Prev = gpBtn0;
        // Module 3: Button 1 (Xbox B / PS Circle) — edge-triggered — toggles
        // Dvora's kids color/shape-finding minigame for Ori, near her companion.
        const gpBtn1 = !!(gp.buttons[1] && gp.buttons[1].pressed);
        if (gpBtn1 && !gpBtn1Prev) liveRef.current.toggleKidsGame?.();
        gpBtn1Prev = gpBtn1;
      }

      const jv = liveRef.current.joyVec;

      // Day/night: lerp sun/ambient/fog toward the current phase's sky colour
      // and vary sun intensity + warmth so morning/noon/evening/night are
      // actually visible, not just a header label. God Mode's pause freezes
      // this clock (the lerp targets stop moving); its light slider scales
      // the target intensities so it still visibly reacts to the slider
      // even while paused, without touching the color transition itself.
      // Bloom strength reacts to its own slider immediately, independent of
      // the day/night pause state below (glow shouldn't need the clock
      // running to respond).
      bloomPass.strength = BASE_BLOOM_STRENGTH * (liveRef.current.godGlowMul || 1);
      if (!liveRef.current.godPaused) {
        const ph = phases[liveRef.current.phase] || phases[0];
        tmpColor.set(nightclubOn ? "#050015" : (ph.sky || "#1b2440"));
        curSky.lerp(tmpColor, Math.min(1, dt * 0.6));
        scene.fog.color.copy(curSky);
        renderer.setClearColor(curSky, 1);
        const lightMul = nightclubOn ? 0.05 : (liveRef.current.godLightMul || 1);
        const isNight = liveRef.current.phase >= 3;
        const isEvening = liveRef.current.phase === 2;
        // Real overcast/rain over Rishon LeZion knocks a bit off both
        // lights — an honest touch of "it's actually grey outside today",
        // not a full replacement for the phase-driven day/night system.
        const cloudCover = liveRef.current.weather?.cloudCover ?? 0;
        const overcastMul = 1 - Math.min(0.3, cloudCover / 100 * 0.3);
        const sunTargetInt = (isNight ? 0.35 : isEvening ? 0.8 : 1.15) * lightMul * overcastMul;
        const sunTargetHex = isNight ? 0x27407a : isEvening ? 0xffb46a : 0xfff2d8;
        sun.intensity += (sunTargetInt - sun.intensity) * Math.min(1, dt * 0.8);
        sun.color.lerp(tmpColor.set(sunTargetHex), Math.min(1, dt * 0.8));
        const ambTargetInt = (isNight ? 0.35 : 0.65) * lightMul * overcastMul;
        ambient.intensity += (ambTargetInt - ambient.intensity) * Math.min(1, dt * 0.8);
        // Near-module portholes light up after dark — same lit-window feel as
        // the painted starfield behind them, but on real 3D geometry.
        const buildingGlowTarget = isNight ? 0.85 : isEvening ? 0.4 : 0.02;
        nearBuildingMats.forEach((mat) => {
          mat.emissiveIntensity += (buildingGlowTarget - mat.emissiveIntensity) * Math.min(1, dt * 0.8);
        });
        // Interior office lights compensate for the dimming sun/ambient so
        // the room itself stays clearly readable after dark — a real office
        // keeps its ceiling lights on regardless of what the sky is doing
        // outside the window. Nightclub mode wants the OPPOSITE — the room
        // itself goes dark too, so only the UV-reactive glows read.
        const roomLightTarget = nightclubOn ? 0.06 : (isNight ? 1.7 : isEvening ? 1.1 : 0.3) * lightMul;
        interiorLights.forEach((lt) => {
          lt.intensity += (roomLightTarget - lt.intensity) * Math.min(1, dt * 0.8);
        });
        // UV Nightclub Mode: the recessed hull strip-lighting swaps from its
        // normal cyan-white to fluorescent purple — the actual "blacklight"
        // reactive element, faded in with the same damping as everything else.
        // (The old warm globe pendants are gone; stripMat is a basic material,
        // so we lerp its base colour rather than an emissive channel.)
        stripMat.color.lerp(tmpColor.set(nightclubOn ? 0x8b3fff : 0xbfeeff), Math.min(1, dt * 0.8));
        chargePods.forEach((pod, pi) => {
          const uvHex = pi % 2 === 0 ? 0x36e6ff : 0xff2ecb;
          const podTargetColor = nightclubOn ? uvHex : pod.hex;
          pod.glowMat.color.lerp(tmpColor.set(podTargetColor), Math.min(1, dt * 0.8));
          pod.ringMat.color.lerp(tmpColor.set(podTargetColor), Math.min(1, dt * 0.8));
        });
      }

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
        drawTradeScreen(rackTradeCtx, rackTradeCanvas.width, rackTradeCanvas.height, liveRef.current.marketRows);
        if (ownerOffice.rackTradeTex) ownerOffice.rackTradeTex.needsUpdate = true;
        drawHgScreen(rackHgCtx, rackHgCanvas.width, rackHgCanvas.height, liveRef.current.bizData);
        if (ownerOffice.rackHgTex) ownerOffice.rackHgTex.needsUpdate = true;
        drawOpsWall(opsCtx, opsCanvas.width, opsCanvas.height, liveRef.current.bizData, liveRef.current.securityAlerts);
        opsTex.needsUpdate = true;
        drawSiteScreen(); // wall site-board follows the same live refresh
        if (scene.userData.drawCarHolo) scene.userData.drawCarHolo(); // car telemetry tag too
        // The billboard module flips to its next ad every other screen tick.
        bbTick++;
        if (bbTick % 2 === 0) {
          bbMode = (bbMode + 1) % 4;
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
      // Frustum-cull the capture itself: this re-render is a full second pass
      // over the whole scene from another camera — genuinely expensive, and
      // was previously running on a timer with zero regard for whether the
      // player could even see the screen. Most of a session is spent at a
      // desk or walking somewhere that isn't facing this wall, so skipping
      // the capture whenever it's off-screen is close to a free win the rest
      // of the time. The moment the player turns toward it, the frustum test
      // passes again and it's refreshed within 3 frames — no visible staleness.
      if (!turboOn && frameNo % 3 === 0) {
        camFrustumMat.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        camFrustum.setFromProjectionMatrix(camFrustumMat);
        if (camFrustum.intersectsObject(secScreen)) {
          secScreen.visible = false;
          renderer.setRenderTarget(secRT);
          renderer.render(scene, secCam);
          renderer.setRenderTarget(null);
          secScreen.visible = true;
        }
      }
      // Center-stage car turns slowly on its podium.
      if (!liveRef.current.godPaused) centerSpin.forEach((w) => { w.rotation.y += dt * 0.28; });
      // 📱 phone hologram — appears while talking (or with the phone UI
      // open) and mirrors the current line of dialogue.
      const phoneOn = !!liveRef.current.talkTarget || !!liveRef.current.phoneOpen;
      if (phoneGrp.visible !== phoneOn) {
        phoneGrp.visible = phoneOn;
        if (phoneOn) phoneAnimT = 0; // raise + flicker-in starts
      }
      if (phoneOn) {
        const cv = liveRef.current.voiceLine;
        const key = cv ? cv.who + "|" + cv.text : "";
        if (key !== lastHoloLine) { lastHoloLine = key; drawPhoneHolo(cv && cv.who, (cv && cv.text) || "מחובר · ALPHA"); }
        // raise animation: the handset lifts to viewing height while the
        // hologram flickers into existence.
        if (phoneAnimT < 1) {
          phoneAnimT = Math.min(1, phoneAnimT + dt * 2.2);
          const e = 1 - Math.pow(1 - phoneAnimT, 3);
          phoneGrp.position.y = 0.82 + 0.21 * e;
          const flick = phoneAnimT < 0.85 ? (Math.sin(clock.elapsedTime * 40) > -0.4 ? 1 : 0.25) : 1;
          phoneHolo.material.opacity = 0.95 * e * flick;
          phoneHolo.scale.set(1.05 * e, 0.46 * e, 1);
        } else {
          phoneHolo.material.opacity = 0.95;
        }
        phoneBeam.rotation.y += dt * 1.2;
        phoneBeam.material.opacity = 0.08 + 0.05 * Math.abs(Math.sin(clock.elapsedTime * 2.2));
      }
      // Diagnostic sweep: the glowing ring rises over the car for ~2.6s of
      // every 18s cycle, shrinking with the body's taper.
      if (scanRing && !isMobile) { // sweep skipped on phones (perf budget)
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

      // Space viewport — swap the whole canvas only when the mode actually
      // flips (cheap, rare): bright system by "day" → warm nebula glow in
      // the evening phase → deep starry space at "night". The debris-streak
      // strip redraws every frame (tiny canvas) so the view is never static.
      const desiredSkyMode = liveRef.current.phase <= 1 ? "day" : liveRef.current.phase === 2 ? "sunset" : "night";
      if (desiredSkyMode !== skylineMode) {
        skylineMode = desiredSkyMode;
        drawSkyline(skyline.ctx, skyline.canvas.width, skyline.canvas.height, skylineMode);
        skyline.tex.needsUpdate = true;
        sideWinTex.needsUpdate = true; // same canvas, its own texture instance
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
      // slow drift-spin on the space bodies (gas giant, moon, asteroids) so
      // the deep-space view outside the windows is alive, never a flat matte
      for (let si = 0; si < spaceSpin.length; si++) spaceSpin[si].rotation.y += dt * (0.02 + (si % 5) * 0.006);
      // god-ray shafts breathe softly so the volumetric light feels alive
      for (let gi = 0; gi < godRayMats.length; gi++) godRayMats[gi].opacity = 0.09 + 0.05 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 0.5 + gi * 0.9));
      // orbital fleet deployment: Earth spin, drop-pod flight, impact
      // shockwaves and live telemetry-laser links to the secured nodes
      updateFleetOps(dt);
      // deep-space market radar: sphere spin, live "asteroid" motion + lock
      updateRadar(dt);
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
      // Rooftop obstruction light blinks around the clock; the horizon glow
      // only builds up once the sky actually turns to sunset/night.
      if (rooftopBeacon) rooftopBeacon.material.opacity = (Math.sin(clock.elapsedTime * 3.4) > 0.3) ? 0.95 : 0.15;
      const cityGlowTarget = skylineMode === "night" ? 0.85 : skylineMode === "sunset" ? 0.35 : 0;
      cityGlowMat.opacity += (cityGlowTarget - cityGlowMat.opacity) * Math.min(1, dt * 0.8);

      let mx = 0, mz = 0;
      // Stand Still (God Mode): freezes all walk/turn input dead so a
      // click-drag on the gizmo or the settings sliders can never also
      // shove the player across the room.
      const moveLocked = !!liveRef.current.standStill;
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
      // Inside a vehicle, the player is parked at the wheel — no walk input.
      let kFwd = (liveRef.current.inVehicle || moveLocked) ? 0 : (keys["w"] || keys["arrowup"] ? 1 : 0) - (keys["s"] || keys["arrowdown"] ? 1 : 0);
      let kTurn = (liveRef.current.inVehicle || moveLocked) ? 0 : -((keys["d"] || keys["arrowright"] ? 1 : 0) - (keys["a"] || keys["arrowleft"] ? 1 : 0));
      // Mobile has no keyboard, so the touch joystick was the only way to
      // move in first person — but it still used the old absolute-world
      // scheme (push "up" = fixed compass heading, not "forward"), which
      // is exactly what made it disorienting: once you'd turned away from
      // that heading, pushing "up" no longer walked you where the locked
      // first-person camera was looking. Route the stick into the same
      // relative forward the keyboard fix above already uses — turning is
      // the left stick's job now (below), not this one's X axis.
      if (!moveLocked && liveRef.current.firstPerson && Math.hypot(jv.x, jv.y) > 0.001) {
        kFwd = kFwd || -jv.y;
      }
      // Left stick — camera control. In first person (and while seated) it
      // turns your own facing, same as the keyboard's A/D; in third person
      // it's reserved for orbiting the chase camera around you instead (see
      // the camera block below) and must NOT touch player rotation here.
      const tv = liveRef.current.turnVec;
      const tvActive = !moveLocked && Math.hypot(tv.x, tv.y) > 0.001;
      if (tvActive && (liveRef.current.firstPerson || liveRef.current.sitting)) kTurn = kTurn || -tv.x;
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
      } else if (!liveRef.current.inVehicle && !moveLocked) {
        // Third-person movement used to be locked to fixed compass directions —
        // "up" always walked toward -Z no matter which way the chase camera had
        // been orbited (left stick), so once you spun the camera, pushing the
        // stick "forward" sent you sideways or backward relative to what you
        // were looking at. That mismatch is exactly what reads as "flying a
        // drone" instead of a normal third-person game. Real games walk you
        // relative to the camera: push forward, you go into the screen,
        // whichever way the camera is currently facing. Collect the raw
        // input first, then rotate it by the camera's own azimuth (camAz)
        // before it becomes a world-space direction.
        let rawX = 0, rawZ = 0;
        if (keys["w"] || keys["arrowup"]) rawZ -= 1;
        if (keys["s"] || keys["arrowdown"]) rawZ += 1;
        if (keys["a"] || keys["arrowleft"]) rawX -= 1;
        if (keys["d"] || keys["arrowright"]) rawX += 1;
        rawX += jv.x; rawZ += jv.y;
        const caz = Math.sin(camAz), cazC = Math.cos(camAz);
        mx += rawX * cazC + rawZ * caz;
        mz += -rawX * caz + rawZ * cazC;
      }
      const mlen = Math.hypot(mx, mz);
      // Sitting on your own chair: any movement input stands you up; otherwise
      // glide onto the seat (position, drop, and facing — south, toward the
      // guest chairs) and hold the sit animation.
      if (liveRef.current.sitting) {
        const k = Math.min(1, dt * 6);
        const feetUp = liveRef.current.feetUp;
        // "Feet on the desk": a stylized recline — nudged back and slightly
        // lower, with a small backward tilt (no dedicated animation clip on
        // the rig, so this is a pose approximation, not literal crossed legs).
        const seatX = OWNER_SEAT.x - Math.sin(OWNER_SEAT.ry) * (feetUp ? 0.35 : 0);
        const seatZ = OWNER_SEAT.z - Math.cos(OWNER_SEAT.ry) * (feetUp ? 0.35 : 0);
        const seatY = SEAT_DROP - (feetUp ? 0.05 : 0);
        playerH.group.position.x += (seatX - playerH.group.position.x) * k;
        playerH.group.position.z += (seatZ - playerH.group.position.z) * k;
        playerH.group.position.y += (seatY - playerH.group.position.y) * k;
        // Look around freely while seated — turning your head never stands
        // you up; only the explicit stand button (or E) does. With no active
        // turn input, ease back to facing the desk instead of fighting it.
        if (kTurn) {
          const TURN_SPEED = 2.6;
          playerH.group.rotation.y += kTurn * TURN_SPEED * dt;
        } else {
          let dSit = OWNER_SEAT.ry - playerH.group.rotation.y;
          while (dSit > Math.PI) dSit -= Math.PI * 2;
          while (dSit < -Math.PI) dSit += Math.PI * 2;
          playerH.group.rotation.y += dSit * Math.min(1, dt * 2);
        }
        playerH.group.rotation.x += ((feetUp ? -0.12 : 0) - playerH.group.rotation.x) * k;
        setClip(playerH, "sit");
      } else if (mlen > 0.08) {
        mx /= mlen; mz /= mlen;
        // Tactical Sprint — hold Shift for a burst pace, same collision/turn
        // logic as the professional walk, just faster.
        const sprinting = !!keys["shift"];
        liveRef.current.sprinting = sprinting;
        const SPEED = (sprinting ? 17.5 : 10.0); // scales with the floor, so crossing time still feels right
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
        setClip(playerH, "walk");
        // Same foot-slide fix the NPCs use: the walk clip plays at the pace
        // that actually matches SPEED, instead of always at 1x — previously
        // the player's stride visibly skated/shuffled against the ground at
        // the fixed movement speed, reading as "robotic".
        const pact = playerH.current && playerH.actions[playerH.current];
        if (pact) pact.timeScale = Math.max(0.35, Math.min(1.25, SPEED / 2.5));
      } else {
        liveRef.current.sprinting = false;
        setClip(playerH, fpTankControls && kTurn ? "walk" : "idle");
      }
      // Third-person camera orbit — the left stick swings the chase camera
      // around the player without turning the player's own facing.
      if (tvActive && !liveRef.current.firstPerson && !liveRef.current.inVehicle) {
        camAz -= tv.x * 1.8 * dt;
        camEl = clamp(camEl + tv.y * 1.8 * dt, CAM_EL_MIN, CAM_EL_MAX);
      }
      // "You can sit here" prompt — near your own chair (or already seated).
      const nearSeat = Math.hypot(playerH.group.position.x - OWNER_SEAT.x, playerH.group.position.z - OWNER_SEAT.z) < 3.2;
      liveRef.current.canSit = nearSeat;
      if (liveRef.current.canSitShown !== nearSeat) {
        liveRef.current.canSitShown = nearSeat;
        liveRef.current.setCanSit?.(nearSeat);
      }
      // "Enter Vehicle" prompt — near the showroom car.
      const nearVeh = !liveRef.current.inVehicle && Math.hypot(playerH.group.position.x - VEHICLE_POS.x, playerH.group.position.z - VEHICLE_POS.z) < 3.0;
      liveRef.current.nearVehicle = nearVeh;
      if (liveRef.current.nearVehicleShown !== nearVeh) {
        liveRef.current.nearVehicleShown = nearVeh;
        liveRef.current.setNearVehicle?.(nearVeh);
      }

      // Electric Sanctuary layer 4: Smart Interaction Lights — smoothly
      // brighten as the player approaches the war table / algo zone, dim
      // otherwise, so the room reads as reacting to presence rather than
      // sitting at one fixed brightness.
      const warTableDist = Math.hypot(playerH.group.position.x - warTablePos.x, playerH.group.position.z - warTablePos.z);
      warTableLight.intensity += ((warTableDist < 8 ? 1.6 : 0.3) - warTableLight.intensity) * Math.min(1, dt * 2);
      const algoZoneDist = Math.hypot(playerH.group.position.x - algoZonePos.x, playerH.group.position.z - algoZonePos.z);
      algoZoneLight.intensity += ((algoZoneDist < 8 ? 1.6 : 0.3) - algoZoneLight.intensity) * Math.min(1, dt * 2);
      updateNanoParticleCloud(warTableNano, clock.elapsedTime);
      updateNanoParticleCloud(algoZoneNano, clock.elapsedTime);

      // ALPHA MEGA-PATCH V1.0 proximity prompts — war table (Modules 1/7),
      // bookkeeper terminal (Module 4), comm-link station (Module 5).
      const nearWar = Math.hypot(playerH.group.position.x - warTablePos.x, playerH.group.position.z - warTablePos.z) < 3.4;
      if (liveRef.current.nearWarShown !== nearWar) { liveRef.current.nearWarShown = nearWar; liveRef.current.setNearWarTable?.(nearWar); }
      const nearBook = Math.hypot(playerH.group.position.x - bookkeeperPos.x, playerH.group.position.z - bookkeeperPos.z) < 1.6;
      if (liveRef.current.nearBookShown !== nearBook) { liveRef.current.nearBookShown = nearBook; liveRef.current.setNearBookkeeper?.(nearBook); }
      const nearComm = Math.hypot(playerH.group.position.x - commLinkPos.x, playerH.group.position.z - commLinkPos.z) < 1.8;
      if (liveRef.current.nearCommShown !== nearComm) {
        liveRef.current.nearCommShown = nearComm;
        liveRef.current.setNearCommLink?.(nearComm);
        if (nearComm) triggerFakeCall();
      }
      const nearKidsSpot = Math.hypot(playerH.group.position.x - kidsCompanionPos.x, playerH.group.position.z - kidsCompanionPos.z) < 2.2;
      if (liveRef.current.nearKidsShown !== nearKidsSpot) { liveRef.current.nearKidsShown = nearKidsSpot; liveRef.current.setNearKids?.(nearKidsSpot); }

      // "Take Flight" prompt — near the RQ-180 display.
      const planeSpot = scene.userData.planeSpot;
      const nearPln = !!planeSpot && !liveRef.current.inFlight && Math.hypot(playerH.group.position.x - planeSpot.x, playerH.group.position.z - planeSpot.z) < 3.5;
      if (liveRef.current.nearPlaneShown !== nearPln) {
        liveRef.current.nearPlaneShown = nearPln;
        liveRef.current.setNearPlane?.(nearPln);
      }

      // "Enter Hangar" prompt — near the bay door on the west wall.
      const hangarSpot = scene.userData.hangarSpot;
      const nearHgr = !!hangarSpot && !liveRef.current.inHangar && Math.hypot(playerH.group.position.x - hangarSpot.x, playerH.group.position.z - hangarSpot.z) < 3.2;
      if (liveRef.current.nearHangarShown !== nearHgr) {
        liveRef.current.nearHangarShown = nearHgr;
        liveRef.current.setNearHangar?.(nearHgr);
      }

      // Truck info sign — standing near a truck's nameplate shows real info
      // about that model (fetched once per truck, cached in React state).
      const trucks = scene.userData.trucks || [];
      const nearestTruck = trucks.find((t) => Math.hypot(playerH.group.position.x - t.x, playerH.group.position.z - t.z) < 4.5) || null;
      if (liveRef.current.nearTruckLabel !== (nearestTruck && nearestTruck.label)) {
        liveRef.current.nearTruckLabel = nearestTruck && nearestTruck.label;
        liveRef.current.setNearTruck?.(nearestTruck);
      }

      // Space portal — walk into it and get launched into the space overlay.
      // Edge-triggered like canSit above: only fires on the rising edge, and
      // the return-to-office handler steps the player back off the portal
      // marker so this naturally re-arms for the next visit.
      const portal = scene.userData.portal;
      const nearPortal = portal && Math.hypot(playerH.group.position.x - portal.x, playerH.group.position.z - portal.z) < 1.8;
      if (liveRef.current.inSpaceShown !== nearPortal) {
        liveRef.current.inSpaceShown = nearPortal;
        if (nearPortal) liveRef.current.setInSpace?.(true);
      }

      // NPCs: walk a simple two-point "aisle" route to their live target
      // (down their column to the destination's row, then across) instead
      // of cutting a diagonal beeline through every desk in between — reads
      // as deliberate human wayfinding rather than gliding through furniture.
      const liveChars = liveRef.current.chars || [];
      // Electric Sanctuary layer 1: workload = share of agents actively
      // "working" right now — a real (if simplified) stand-in for API load,
      // smoothed so the floor pulses ease rather than snap between values.
      const targetWorkload = liveChars.length
        ? liveChars.filter((c) => c.status === "work" || c.status === "summoned" || c.status === "meet").length / liveChars.length
        : 0.15;
      workload += (targetWorkload - workload) * Math.min(1, dt * 0.5);
      energyGridMat.uniforms.uTime.value = clock.elapsedTime;
      energyGridMat.uniforms.uWorkload.value = workload;
      // Electric Sanctuary layer 4: a low-frequency ambient "hum" — a subtle
      // ±6% breathing pulse on top of whatever the day/night system already
      // set, synced to the same workload reading so a busier system visibly
      // pulses a little faster/harder.
      const humHz = 0.15 + workload * 0.35;
      const hum = 1 + Math.sin(clock.elapsedTime * humHz * Math.PI * 2) * 0.06;
      ambient.intensity *= hum; hemi.intensity *= hum;
      liveChars.forEach((c, ci) => {
        const h = npc[c.id]; if (!h) return;
        // Module 2: the finance/"CFO" agent temporarily takes over his own
        // position for a bounded visit to the algo-trading zone — an early
        // return so this never fights the normal desk/status walk logic below.
        if (c.id === "finance" && financeVisit.active) {
          financeVisit.t += dt;
          h.group.position.x = algoZonePos.x + Math.sin(financeVisit.t * 0.6) * 1.6;
          h.group.position.z = algoZonePos.z + Math.cos(financeVisit.t * 0.4) * 1.2;
          h.group.rotation.y += dt * 0.3;
          h.isWalking = true;
          setClip(h, "walk");
          if (financeVisit.t >= financeVisit.duration) financeVisit.active = false;
          return;
        }
        const atDesk = c.status === "work";
        // Robots dock standing at their charging pod's center — no chair, so
        // the seat-back nudge and the sit-drop below don't apply to them.
        const inPod = podIdSet.has(c.id);
        // Per-desk facing (perimeter layout) — the direction this worker's
        // own station points; falls back to the old shared heading.
        const drot = c.home && typeof c.home.rot === "number" ? c.home.rot : DESK_FACE_ROT;
        // The sit_idle clip's hip height/depth doesn't line up with this
        // specific chair model at the desk's exact floor spot — nudge the
        // walk target itself back and down onto the visible chair seat
        // (tuned by eye), so there's no separate snap once they arrive.
        const [rawTx, rawTz] = toWorld(c.x, c.y);
        const seatNudge = atDesk && !inPod;
        const finalX = seatNudge ? rawTx + Math.sin(drot) * SEAT_BACK : rawTx;
        const finalZ = seatNudge ? rawTz + Math.cos(drot) * SEAT_BACK : rawTz;
        if (h.destX === undefined || Math.abs(h.destX - finalX) > 0.05 || Math.abs(h.destZ - finalZ) > 0.05) {
          h.destX = finalX; h.destZ = finalZ;
          // Funnel through actual doorways: whenever the walker's current
          // spot and/or the destination sit inside a walled room (private
          // office / conference room / owner suite) and it isn't the SAME
          // room, route out through that room's own door and in through the
          // destination room's door — instead of a straight/column-row line
          // that would clip straight through the glass to get there.
          const curRoom = roomContaining(rooms, h.group.position.x, h.group.position.z);
          const destRoom = roomContaining(rooms, finalX, finalZ);
          const gates = [];
          if (curRoom && curRoom !== destRoom) { gates.push(curRoom.door); gates.push(curRoom.doorOut); }
          if (destRoom && curRoom !== destRoom) { gates.push(destRoom.doorOut); gates.push(destRoom.door); }
          h.gates = gates; h.gi = 0;
          const leg0 = gates.length ? gates[0] : { x: finalX, z: finalZ };
          h.wpX = h.group.position.x; h.wpZ = leg0.z;
          h.wpDone = false;
        }
        // The active leg's target: the next pending doorway gate, or the
        // true final desk/seat once every gate has been passed through.
        const legTarget = (h.gates && h.gi < h.gates.length) ? h.gates[h.gi] : { x: finalX, z: finalZ };
        // Waypoint arrival must be sticky: the first step toward the final
        // target can be longer than the 0.1 arrival radius (dt is clamped at
        // 0.05s, so below 20fps a step is up to 0.125), and without the flag
        // the walker bounces back to the waypoint forever, jammed mid-route.
        const atWp = h.wpDone || Math.hypot(h.wpX - h.group.position.x, h.wpZ - h.group.position.z) < 0.1;
        h.wpDone = atWp;
        const tx = atWp ? legTarget.x : h.wpX, tz = atWp ? legTarget.z : h.wpZ;
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
            // teleporting rather than walking across the room. Capped at a
            // realistic human pace (~1.4 m/s) with an actual accel/decel
            // curve: h.curSpeed ramps up to that pace over ~0.3s and eases
            // back down over the final ~0.6m of the route, instead of
            // snapping to full speed or stopping dead on arrival.
            const NPC_SPEED = 1.4 * (liveRef.current.godSpeedMul || 1);
            const targetSpeed = NPC_SPEED * Math.min(1, distFinal / 0.6);
            h.curSpeed = (h.curSpeed ?? 0) + (targetSpeed - (h.curSpeed ?? 0)) * Math.min(1, dt * 3);
            const maxStep = h.curSpeed * dt;
            if (dist <= maxStep) {
              h.group.position.x = tx; h.group.position.z = tz;
              stepped = dist;
            } else {
              h.group.position.x += (dx / dist) * maxStep;
              h.group.position.z += (dz / dist) * maxStep;
              stepped = maxStep;
            }
          } else {
            h.curSpeed = (h.curSpeed ?? 0) * Math.max(0, 1 - dt * 3); // still pivoting — ease speed back down
          }
        } else {
          h.curSpeed = 0; // arrived / not moving — next departure starts from rest
        }
        // Reached the current doorway gate — advance to the next one (or,
        // once the queue is empty, the remaining movement above already
        // targets the true final desk/seat directly).
        if (h.gates && h.gi < h.gates.length && Math.hypot(legTarget.x - h.group.position.x, legTarget.z - h.group.position.z) < 0.15) {
          h.gi++;
          const nextLeg = h.gi < h.gates.length ? h.gates[h.gi] : { x: finalX, z: finalZ };
          h.wpX = h.group.position.x; h.wpZ = nextLeg.z;
          h.wpDone = false;
        }
        const summoned = c.status === "summoned";
        // Docked + actively charging: "gravity" is off, they hover in place
        // with a gentle continuous sine bob instead of standing flat-footed —
        // pod.charging itself only ticks at 1Hz (see podT below) but reading
        // it here every frame is what makes the hover motion actually smooth.
        const dockedPod = inPod ? podById.get(c.id) : null;
        const levitating = !!dockedPod && dockedPod.charging && distFinal <= 0.03;
        // The capsule already carries its own name/title plate right above the
        // opening — hide the character's own floating head nameplate while
        // docked there so the two don't render stacked on top of each other.
        if (h.nameSprite) h.nameSprite.visible = !dockedPod;
        // Pod robots never take the chair-seat Y drop — they have no sit
        // animation (clipMap falls back to idle), so dropping the standing
        // rig would just sink it into the floor.
        const targetY = levitating
          ? 0.32 + Math.sin(clock.elapsedTime * 1.6 + ci * 1.7) * 0.12
          : !inPod && (atDesk || summoned) && distFinal <= 0.03 ? SEAT_DROP : 0;
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
          setClip(h, "walk");
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
          setClip(h, seated ? "sit" : "idle");
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
            // the owner's desk when summoned, the table in a meeting. A
            // docked robot faces OUT through its pod's opening (drot + π —
            // the opening faces away from the wall the old desk faced),
            // watching the floor while it charges instead of the shell.
            const face = summoned ? Math.PI
              : atDesk ? (inPod ? drot + Math.PI : drot)
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
      // Electric Sanctuary layer 2 ("Smart Dust"): motes within ~2.2 units
      // of the player get an extra outward nudge, so walking through the
      // haze visibly scatters it instead of drifting through it inertly.
      if (!turboOn) {
        const t = clock.elapsedTime;
        const arr = dust.geometry.attributes.position.array;
        const px = playerH.group.position.x, pz = playerH.group.position.z;
        for (let i = 0; i < dustCount; i++) {
          arr[i * 3 + 1] += Math.sin(t * 0.3 + dustPhase[i]) * dt * 0.06 + dt * 0.02;
          if (arr[i * 3 + 1] > 5.2) arr[i * 3 + 1] = 0.4;
          arr[i * 3] += Math.sin(t * 0.2 + dustPhase[i]) * dt * 0.04;
          const ddx = arr[i * 3] - px, ddz = arr[i * 3 + 2] - pz;
          const dd = Math.hypot(ddx, ddz);
          if (dd < 2.2 && dd > 0.01) {
            const push = (1 - dd / 2.2) * dt * 1.4;
            arr[i * 3] += (ddx / dd) * push;
            arr[i * 3 + 2] += (ddz / dd) * push;
          }
        }
        dust.geometry.attributes.position.needsUpdate = true;
      }

      // desk monitor glow follows work status (index i is agent i's home desk,
      // same 1:1 mapping the 2D behaviour scheduler already relies on).
      deskMons.forEach((mat, i) => {
        if (!mat) return; // bench-pod seats share one model with no per-agent monitor material
        const owner = liveChars[i];
        const occ = !!owner && owner.status === "work" && !owner.walking;
        mat.emissiveIntensity = occ ? 0.5 + Math.sin(clock.elapsedTime * 2.2) * 0.25 : 0.15;
      });
      deskHolos.forEach((holo, i) => { if (holo) holo.rotation.z = clock.elapsedTime * 0.6 + i; });
      // Charging pods: once a second, dock detection + charge bookkeeping +
      // meter redraw (12 small canvases — cheap at 1Hz, wasteful per frame);
      // the energy-column glow pulses per frame only while actually charging.
      podT += dt;
      if (podT >= 1) {
        podT = 0;
        chargePods.forEach((pod) => {
          const h = npc[pod.id];
          const docked = !!h && Math.hypot(h.group.position.x - pod.x, h.group.position.z - pod.z) < 1.15;
          pod.charging = docked;
          pod.charge = clamp(pod.charge + (docked ? 2.2 : -0.25), 5, 100);
          drawPodMeter(pod);
        });
      }
      chargePods.forEach((pod) => {
        pod.glowMat.opacity = pod.charging ? 0.16 + Math.abs(Math.sin(clock.elapsedTime * 2.4)) * 0.1 : 0.07;
      });
      // Neon arcs: flicker/re-jitter ~14x/sec, only for pods actually
      // charging right now (typically a handful at once) — visibility and
      // geometry both skip entirely for idle pods.
      lightningT += dt;
      const boltFlick = lightningT >= 0.07;
      if (boltFlick) lightningT = 0;
      chargePods.forEach((pod) => {
        if (!pod.lightning) return;
        pod.lightning.group.visible = pod.charging;
        if (!pod.charging || !boltFlick) return;
        const h = npc[pod.id];
        if (!h) return;
        const originWorld = new THREE.Vector3(h.group.position.x, h.group.position.y + 1.05, h.group.position.z);
        pod.podGroup.worldToLocal(originWorld);
        pod.lightning.bolts.forEach((b) => updatePodBolt(b, originWorld));
      });
      // Electric Sanctuary layer 2: corner arc pillars flicker on the same
      // cadence as the pod lightning above.
      if (boltFlick) {
        arcPillars.forEach((pillar) => {
          pillar.userData.bolts.forEach((b) => updatePodBolt(b, b.origin));
          pillar.userData.light.intensity = 0.8 + Math.random() * 0.7;
          pillar.userData.orbMat.color.setHSL(0.55 + Math.random() * 0.1, 1, 0.6);
        });
      }

      // ── Module 2 (cont'd): finance agent's occasional visit to the algo
      // zone — checked once a second, same cadence as the pod bookkeeping.
      financeVisitCheckT += dt;
      if (financeVisitCheckT >= 1) {
        financeVisitCheckT = 0;
        if (!financeVisit.active) {
          const fc = liveChars.find((c) => c.id === "finance");
          if (fc && !["work", "meet", "eat", "summoned"].includes(fc.status) && Math.random() < 0.01) {
            financeVisit = { active: true, t: 0, duration: 8 + Math.random() * 6 };
          }
        }
      }

      // ── Module 5: fake incoming-call hologram auto-dismiss ──────────────
      if (callerCardShowing) {
        callerCardT += dt;
        callerCardMat.opacity = Math.min(1, callerCardT * 3) * (callerCardT > 6 ? Math.max(0, 1 - (callerCardT - 6) * 2) : 1);
        callerCard.lookAt(camera.position.x, callerCard.position.y, camera.position.z);
        if (callerCardT > 6.5) { callerCardShowing = false; callerCard.visible = false; }
      }

      // ── Module 7: victory hype mode — rotating lasers + agent scale-pulse,
      // for a bounded duration after "סגור עסקה" is pressed near the war table.
      if (hypeOn) {
        hypeT += dt;
        if (hypeLasers) hypeLasers.children.forEach((b, i) => { b.rotation.y += dt * (2 + i * 0.35); });
        liveChars.forEach((c) => {
          const h2 = npc[c.id]; if (!h2) return;
          h2.group.scale.setScalar(1 + Math.sin(hypeT * 6 + h2.group.position.x) * 0.06);
        });
        if (hypeT >= hypeDuration) {
          hypeOn = false;
          liveChars.forEach((c) => { const h2 = npc[c.id]; if (h2) h2.group.scale.setScalar(1); });
          if (hypeLasers) { scene.remove(hypeLasers); hypeLasers.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); hypeLasers = null; }
        }
      }

      // ── Module 8: 360° drone/CCTV camera mode ('C' key) — handled in the
      // camera branch below; just ticks the shader's noise/REC timers here.
      if (droneOn) { droneT += dt; dronePass.uniforms.time.value = droneT; }

      // ── Module 9: time-dilation — fast-forwards the day/night phase clock
      // (safe to override directly: liveRef.current.phase only gets reset by
      // the React state mirror when the real clock/God-Mode actually changes
      // phase, not every frame) and periodically injects a burst of
      // predictive candles + projected war-table tickets while active.
      if (timeDilation > 0.01) {
        dilationPhaseT += dt * timeDilation;
        if (dilationPhaseT >= 3) {
          dilationPhaseT = 0;
          liveRef.current.phase = ((liveRef.current.phase ?? 0) + 1) % (phases?.length || 5);
        }
        dilationCandleT += dt * timeDilation;
        if (dilationCandleT >= 1) {
          dilationCandleT = 0;
          const base = lastCandlePrice || 60000;
          pushCandle(base * (1 + (Math.random() - 0.45) * 0.01), true);
        }
        dilationTicketT += dt * timeDilation;
        if (dilationTicketT >= 1.4 && projectedTickets.length < 24) {
          dilationTicketT = 0;
          const tile = warTableTiles[Math.floor(Math.random() * warTableTiles.length)];
          const ghost = buildTruckMini(0xE4BC63);
          ghost.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.4; } });
          const stack = projectedTickets.filter((t) => t.day === tile.day).length;
          ghost.position.set(tile.wx, 1.0 + stack * 0.05, tile.wz + 0.5);
          scene.add(ghost);
          projectedTickets.push({ day: tile.day, mesh: ghost });
        }
      }

      // camera: third-person chase cam by default, or first-person from the
      // player's own eyes (toggle button) — own body hidden in first-person
      // so it doesn't block the view from the inside.
      if (droneOn) {
        // Module 8: detached hovering drone view — slow circling orbit over
        // the player's own position, mimicking a wall-mounted 360° unit.
        playerH.group.visible = true;
        const orbitR = 9, orbitH = 7;
        const ang = droneT * 0.35;
        camera.position.set(
          playerH.group.position.x + Math.cos(ang) * orbitR,
          orbitH,
          playerH.group.position.z + Math.sin(ang) * orbitR
        );
        camera.lookAt(playerH.group.position.x, 1.2, playerH.group.position.z);
      } else if (liveRef.current.inVehicle) {
        playerH.group.visible = false;
        camera.position.lerp(VEHICLE_CAM, 0.35);
        camera.lookAt(VEHICLE_LOOK);
      } else if (liveRef.current.firstPerson) {
        playerH.group.visible = false;
        const eyeY = liveRef.current.sitting ? 0.96 : 1.32;
        const fx = Math.sin(playerH.group.rotation.y), fz = Math.cos(playerH.group.rotation.y);
        const eyePos = new THREE.Vector3(playerH.group.position.x, eyeY, playerH.group.position.z);
        camera.position.lerp(eyePos, 0.4);
        camera.lookAt(eyePos.x + fx, eyeY, eyePos.z + fz);
      } else {
        playerH.group.visible = true;
        const camOffset = new THREE.Vector3(
          Math.sin(camAz) * Math.cos(camEl) * CAM_DIST,
          Math.sin(camEl) * CAM_DIST,
          Math.cos(camAz) * Math.cos(camEl) * CAM_DIST
        );
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
      // Alpha's two hologram spots (checked on the horizontal plane only —
      // the giant one hovers well above head height, so a straight 3D
      // distance would never trigger for it).
      (scene.userData.alphaSpots || []).forEach((s) => {
        const d = Math.hypot(playerH.group.position.x - s.x, playerH.group.position.z - s.z);
        if (d < TALK_DIST + 1.5 && d < nearestDist) { nearest = "alpha"; nearestDist = d; }
      });
      if (liveRef.current.talkTarget !== nearest) {
        liveRef.current.talkTarget = nearest;
        liveRef.current.setTalkTarget(nearest);
      }

      if (turboOn || renderer.xr.isPresenting) {
        // Straight render: skips the SSAO/bloom/output passes — the biggest
        // per-frame GPU cost on weak machines. EffectComposer also isn't
        // XR-aware in this three.js version, so an active VR session always
        // takes this branch regardless of the turbo setting.
        renderer.render(scene, camera);
      } else {
        composer.render();
      }
    }
    liveRef.current.setTalkTarget = setTalkTarget;
    liveRef.current.setSitting = setSitting;
    liveRef.current.setCanSit = setCanSit;
    liveRef.current.setInSpace = setInSpace;
    // Called by the space overlay's return button — steps the player back
    // off the portal marker (otherwise nearPortal would stay true and the
    // rising-edge check above could never re-arm for the next visit).
    liveRef.current.exitPortal = () => {
      const portal = scene.userData.portal;
      if (portal) playerH.group.position.set(portal.x, 0, portal.z - 3.5); // step north, back toward the room (the south wall sits just past the portal)
      liveRef.current.inSpaceShown = false;
      setInSpace(false);
    };
    liveRef.current.toggleSit = () => setSitting((v) => (v ? false : !!liveRef.current.canSit));
    // The showroom Tiggo moved to the Hangar's vehicle bay, so there's no
    // car on the bridge to "enter" — parked far off-grid so the proximity
    // check below can never fire a ghost prompt where the podium used to be.
    // (Driving is still available from beside the parked Tiggo in the
    // Hangar, which has always had its own enter-to-drive flow.)
    const VEHICLE_POS = { x: 99999, z: 99999 };
    const VEHICLE_CAM = new THREE.Vector3(21, 1.35, 18.85);
    const VEHICLE_LOOK = new THREE.Vector3(21, 1.1, 15.5);
    liveRef.current.toggleVehicle = () => {
      if (liveRef.current.inVehicle) { liveRef.current.setInVehicle?.(false); return; }
      if (liveRef.current.nearVehicle) liveRef.current.setInVehicle?.(true);
    };
    liveRef.current.toggleFlight = () => {
      if (liveRef.current.inFlight) return; // exit only via the overlay's own return button
      if (liveRef.current.nearPlaneShown) liveRef.current.setInFlight?.(true);
    };
    liveRef.current.toggleHangar = () => {
      if (liveRef.current.inHangar) return; // exit only via the overlay's own return button
      if (liveRef.current.nearHangarShown) liveRef.current.setInHangar?.(true);
    };

    // ── God Mode — owner-only admin tools ───────────────────────────────
    // Click-to-select one of the curated editable objects (car/trucks/
    // portal/anything spawned from the panel — never desks/agents/walls,
    // see the registerEditable() comment above), then move/rotate/scale it
    // or delete it (spawned objects only). A spawn menu adds new props, a
    // pause toggle freezes the day/night clock + podium turntables, and a
    // lighting slider scales sun/ambient intensity on top of whatever the
    // real day-phase would otherwise set.
    let selectedThreeObj = null;
    const godRaycaster = new THREE.Raycaster();
    const findEditableAncestor = (obj) => {
      let o = obj;
      while (o) { if (o.userData?.editable) return o; o = o.parent; }
      return null;
    };
    const snapshotSelected = () => {
      if (!selectedThreeObj) return null;
      return {
        label: selectedThreeObj.userData.label || "אובייקט",
        deletable: !!selectedThreeObj.userData.deletable,
        x: selectedThreeObj.position.x, y: selectedThreeObj.position.y, z: selectedThreeObj.position.z,
        rotY: selectedThreeObj.rotation.y, scale: selectedThreeObj.scale.x,
        meta: selectedThreeObj.userData.meta || {},
      };
    };
    // ── TransformControls — the "GTA-style" drag gizmo for God Mode. A
    // click selects the object (raycast above), and the gizmo attaches to
    // it for direct drag/rotate/scale on the canvas; the slider panel and
    // the gizmo both write through applyPos/applyRotY/applyScale, so they
    // always agree on the object's live transform.
    const transformControls = new TransformControls(camera, renderer.domElement);
    const gizmoHelper = transformControls.getHelper();
    gizmoHelper.traverse((o) => { o.userData.isGizmo = true; });
    scene.add(gizmoHelper);
    transformControls.addEventListener("dragging-changed", (e) => { liveRef.current.gizmoDragging = e.value; });
    transformControls.addEventListener("objectChange", () => {
      liveRef.current.setSelectedObj?.(snapshotSelected());
    });
    liveRef.current.setGizmoMode = (mode) => transformControls.setMode(mode);
    const onGodClick = (e) => {
      if (!liveRef.current.godMode || liveRef.current.gizmoDragging) return;
      const rect = mount.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      godRaycaster.setFromCamera(ndc, camera);
      const hits = godRaycaster.intersectObjects(editableObjects, true);
      const hit = hits.length ? findEditableAncestor(hits[0].object) : null;
      selectedThreeObj = hit;
      if (hit) transformControls.attach(hit); else transformControls.detach();
      liveRef.current.setSelectedObj?.(snapshotSelected());
    };
    mount.addEventListener("click", onGodClick);
    liveRef.current.applyPos = (axis, val) => {
      if (!selectedThreeObj) return;
      // Blueprint mode = construction mode: placements snap to a 0.5m grid
      // so equipment lines up MIL-SPEC straight instead of eyeballed.
      if (liveRef.current.blueprintOn) val = Math.round(val * 2) / 2;
      selectedThreeObj.position[axis] = val;
      liveRef.current.setSelectedObj?.(snapshotSelected());
    };
    liveRef.current.applyRotY = (val) => {
      if (!selectedThreeObj) return;
      selectedThreeObj.rotation.y = val;
      liveRef.current.setSelectedObj?.(snapshotSelected());
    };
    liveRef.current.applyScale = (val) => {
      if (!selectedThreeObj) return;
      selectedThreeObj.scale.setScalar(val);
      liveRef.current.setSelectedObj?.(snapshotSelected());
    };
    // scene.remove() only unlinks a node from the graph — it does NOT free
    // its GPU-side geometry/texture memory. A spawned truck in particular
    // carries a full GLB's worth of geometry + textures; spawning and
    // deleting one repeatedly without this leaked real WebGL memory for
    // the rest of the session. Mirrors the generic disposal loop already
    // run once at unmount (below), just triggered per-object, immediately.
    const disposeObject3D = (obj) => {
      obj.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => {
            Object.values(m).forEach((v) => { if (v && v.isTexture) v.dispose(); });
            m.dispose();
          });
        }
      });
    };
    liveRef.current.deleteSelected = () => {
      if (!selectedThreeObj || !selectedThreeObj.userData.deletable) return;
      transformControls.detach();
      scene.remove(selectedThreeObj);
      disposeObject3D(selectedThreeObj);
      const idx = editableObjects.indexOf(selectedThreeObj);
      if (idx >= 0) editableObjects.splice(idx, 1);
      const spinIdx = centerSpin.indexOf(selectedThreeObj);
      if (spinIdx >= 0) centerSpin.splice(spinIdx, 1);
      selectedThreeObj = null;
      liveRef.current.setSelectedObj?.(null);
    };
    liveRef.current.deselect = () => { selectedThreeObj = null; transformControls.detach(); liveRef.current.setSelectedObj?.(null); };
    // ── Blueprint Tactical Mode ─────────────────────────────────────────
    // One shared wireframe material for the whole scene (not one per mesh)
    // + a laser reference grid on the floor. Each mesh's real material is
    // parked on userData while active and restored on exit — meshes whose
    // materials the animate() loop keeps mutating (screen canvases, blink
    // pulses) are untouched by this: those writes go to the parked
    // originals and simply reappear intact when blueprint mode ends.
    const bpWireMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.35 });
    const bpGrid = new THREE.GridHelper(Math.max(FLOOR_W, FLOOR_D), Math.max(FLOOR_W, FLOOR_D), 0x00ffff, 0x123540);
    bpGrid.position.y = 0.02;
    bpGrid.material.transparent = true;
    bpGrid.material.opacity = 0.5;
    liveRef.current.setBlueprint = (active) => {
      if (!!liveRef.current.blueprintOn === !!active) return;
      liveRef.current.blueprintOn = active;
      if (active) {
        scene.traverse((o) => {
          if (o.isMesh && !o.userData.isGizmo && o.material !== bpWireMat && o.userData._bpSaved === undefined) {
            o.userData._bpSaved = o.material;
            o.material = bpWireMat;
          }
        });
        scene.add(bpGrid);
      } else {
        scene.traverse((o) => {
          if (o.isMesh && o.userData._bpSaved !== undefined) {
            o.material = o.userData._bpSaved;
            delete o.userData._bpSaved;
          }
        });
        scene.remove(bpGrid);
      }
      // Placement precision follows Blueprint: 0.5m snap on the on-canvas
      // gizmo too, matching applyPos's own snap for the slider panel.
      transformControls.setTranslationSnap(active ? 0.5 : null);
      transformControls.setRotationSnap(active ? THREE.MathUtils.degToRad(15) : null);
    };
    // Spawn menu — procedural props for the camera/DVR (no GLB needed), and
    // the Volvo GLB reloaded for "truck" (the browser caches the file, so a
    // second load is cheap). New spawns land just south of the desk ring
    // and are immediately selected so the transform panel is ready to use.
    const spawnPoint = () => ({ x: 0, z: 22 });
    const newAssetId = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;
    // restoreOpts lets State Persistence recreate a saved layout: explicit
    // x/y/z/rotY/scale instead of the default spawn point, and `silent` to
    // skip the inventory log + auto-select (loading 12 saved props
    // shouldn't spam the log or leave only the last one selected... though
    // in practice leaving the last one selected is harmless and simpler).
    liveRef.current.spawnAsset = (type, restoreOpts) => {
      const p = restoreOpts || spawnPoint();
      const today = new Date().toISOString().slice(0, 10);
      if (type === "camera") {
        const id = newAssetId("CAM");
        const cam = buildSecurityCameraProp();
        cam.position.set(p.x, p.y != null ? p.y : 2.4, p.z);
        if (p.rotY != null) cam.rotation.y = p.rotY;
        if (p.scale != null) cam.scale.setScalar(p.scale);
        cam.userData.type = "camera";
        scene.add(cam);
        registerEditable(cam, "מצלמת אבטחה", true, {
          id, origin_date: today, material_spec: "פלסטיק/מתכת, עמיד למים IP66", security_level: "גבוה", maintenance_status: "תקין",
          firmware: "v4.2.1", resolution: "4K", night_vision: true, coverage_angle: "110°", battery_status: "מחובר לחשמל (ללא סוללה)",
        });
        if (!restoreOpts?.silent) logInventoryAsset(id, "camera", "מצלמת אבטחה", cam.position);
        selectedThreeObj = cam;
        transformControls.attach(cam);
        liveRef.current.setSelectedObj?.(snapshotSelected());
      } else if (type === "dvr") {
        const id = newAssetId("DVR");
        const dvr = buildDvrBoxProp();
        dvr.position.set(p.x, p.y != null ? p.y : 0, p.z);
        if (p.rotY != null) dvr.rotation.y = p.rotY;
        if (p.scale != null) dvr.scale.setScalar(p.scale);
        dvr.userData.type = "dvr";
        scene.add(dvr);
        registerEditable(dvr, "DVR", true, {
          id, origin_date: today, material_spec: "מתכת, רכיבים אלקטרוניים", security_level: "גבוה", maintenance_status: "תקין",
          firmware: "v2.0.4", storage: "2TB HDD", channels: 8,
        });
        if (!restoreOpts?.silent) logInventoryAsset(id, "dvr", "DVR", dvr.position);
        selectedThreeObj = dvr;
        transformControls.attach(dvr);
        liveRef.current.setSelectedObj?.(snapshotSelected());
      } else if (type === "truck") {
        const spawnLoader = new GLTFLoader();
        spawnLoader.setMeshoptDecoder(MeshoptDecoder);
        spawnLoader.load(base + "office-models/volvo_fh16.glb", (g) => {
          const truck = g.scene;
          const tb = new THREE.Box3().setFromObject(truck);
          const ts = tb.getSize(new THREE.Vector3());
          const tc = tb.getCenter(new THREE.Vector3());
          // p.scale (when restoring) is the truck's own final saved scale,
          // not a multiplier on the auto-fit — apply it as-is instead of
          // recomputing the fit, so a resized truck restores at the exact
          // size it was left at.
          const s = p.scale != null ? p.scale : 5.8 / Math.max(ts.x, ts.z);
          const wrap = new THREE.Group();
          truck.position.set(-tc.x, -tb.min.y, -tc.z);
          wrap.add(truck);
          wrap.scale.setScalar(s);
          wrap.position.set(p.x, p.y != null ? p.y : 0, p.z);
          if (p.rotY != null) wrap.rotation.y = p.rotY;
          wrap.userData.type = "truck";
          scene.add(wrap);
          const id = newAssetId("TRK");
          registerEditable(wrap, "משאית (חדשה)", true, {
            id, origin_date: today, material_spec: "פלדה/אלומיניום, תא נהג מרופד", security_level: "רגיל", maintenance_status: "תקין",
          });
          if (!restoreOpts?.silent) logInventoryAsset(id, "truck", "משאית (חדשה)", wrap.position);
          selectedThreeObj = wrap;
          transformControls.attach(wrap);
          liveRef.current.setSelectedObj?.(snapshotSelected());
        }, undefined, () => {});
      }
    };
    // ── State Persistence — named office layouts (localStorage) ─────────
    // Only the owner-spawned props (camera/DVR/truck — same set God Mode
    // can already select/delete) are ever saved; the built-in showroom
    // (car, portal, desks, walls) is data-driven from the sim's own props
    // and always rebuilds itself on load, so saving it here would be
    // redundant and risks fighting the live sim on restore.
    const LAYOUTS_KEY = "alpha:sim:layouts";
    const readLayouts = () => { try { return JSON.parse(localStorage.getItem(LAYOUTS_KEY) || "{}"); } catch { return {}; } };
    const writeLayouts = (all) => { try { localStorage.setItem(LAYOUTS_KEY, JSON.stringify(all)); } catch {} };
    const captureLayout = () => editableObjects
      .filter((o) => o.userData.deletable && o.userData.type)
      .map((o) => ({ type: o.userData.type, x: o.position.x, y: o.position.y, z: o.position.z, rotY: o.rotation.y, scale: o.scale.x }));
    liveRef.current.saveLayout = (name) => {
      const all = readLayouts();
      all[name] = { items: captureLayout(), savedAt: new Date().toISOString() };
      writeLayouts(all);
      liveRef.current.setLayoutNames?.(Object.keys(all).filter((n) => n !== "__auto__"));
      return all[name].items.length;
    };
    liveRef.current.clearSpawned = () => {
      [...editableObjects].filter((o) => o.userData.deletable).forEach((o) => {
        transformControls.detach();
        scene.remove(o);
        disposeObject3D(o);
        const idx = editableObjects.indexOf(o);
        if (idx >= 0) editableObjects.splice(idx, 1);
      });
      selectedThreeObj = null;
      liveRef.current.setSelectedObj?.(null);
    };
    liveRef.current.loadLayout = (name) => {
      const all = readLayouts();
      const layout = all[name];
      if (!layout) return 0;
      liveRef.current.clearSpawned();
      layout.items.forEach((item) => {
        liveRef.current.spawnAsset(item.type, { x: item.x, y: item.y, z: item.z, rotY: item.rotY, scale: item.scale, silent: true });
      });
      return layout.items.length;
    };
    liveRef.current.listLayouts = () => Object.keys(readLayouts()).filter((n) => n !== "__auto__");
    liveRef.current.deleteLayout = (name) => {
      const all = readLayouts();
      delete all[name];
      writeLayouts(all);
      liveRef.current.setLayoutNames?.(Object.keys(all).filter((n) => n !== "__auto__"));
    };
    // Auto-save every 60s to a reserved "__auto__" slot — never lose a
    // session's placements even if the owner never hits Save explicitly.
    const autoSaveIv = setInterval(() => {
      const items = captureLayout();
      if (items.length === 0) return; // nothing placed yet — skip the write
      const all = readLayouts();
      all.__auto__ = { items, savedAt: new Date().toISOString() };
      writeLayouts(all);
    }, 60000);
    // Startup prompt — only if a previous session actually left something
    // placed; an empty auto-save slot has nothing worth restoring.
    {
      const auto = readLayouts().__auto__;
      if (auto && auto.items && auto.items.length > 0) {
        liveRef.current.pendingRestore = auto.items.length;
        liveRef.current.setShowLoadPrompt?.(true);
      }
      liveRef.current.setLayoutNames?.(Object.keys(readLayouts()).filter((n) => n !== "__auto__"));
    }
    liveRef.current.confirmLoadLast = () => { liveRef.current.loadLayout("__auto__"); liveRef.current.setShowLoadPrompt?.(false); };
    liveRef.current.dismissLoadPrompt = () => liveRef.current.setShowLoadPrompt?.(false);
    // Pause — freezes the day/night clock and the podium turntables (see
    // the gates inside animate(), below). Player movement/camera keep
    // working so the admin can still walk around while paused.
    liveRef.current.godPaused = false;
    // Lighting override — a 0.4x..1.8x multiplier on top of whatever the
    // real day-phase would set for sun/ambient intensity this frame.
    liveRef.current.godLightMul = 1;
    // Glow override — separate 0x..2x multiplier on the bloom pass's own
    // strength, so "how lit" and "how much halo/glow" can be dialed
    // independently instead of glow only ever following raw brightness.
    liveRef.current.godGlowMul = 1;
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
      if (smaaPass) smaaPass.setSize(mount.clientWidth * renderer.getPixelRatio(), mount.clientHeight * renderer.getPixelRatio());
      renderer.shadowMap.autoUpdate = !on;
      sun.castShadow = !on && !isMobile;
      dust.visible = !on;
      heliGroup.visible = !on;
      balloonGroup.visible = !on && skylineMode === "day";
      searchGroup.visible = !on && skylineMode === "night";
    };
    liveRef.current.setTurbo(turbo);
    // UV Nightclub Mode toggle — the actual color/light targets are read
    // every frame from the `nightclubOn` flag (day/night block above); this
    // just flips that flag and widens the bloom radius for the softer,
    // wider "blacklight" glow the mode wants (reverts with it).
    liveRef.current.setNightclub = (on) => {
      nightclubOn = on;
      bloomPass.radius = on ? 0.75 : 0.4;
    };
    // Module 7: "סגור עסקה" — one-shot trigger, not a persistent toggle.
    liveRef.current.triggerHype = () => {
      if (hypeOn) return;
      hypeOn = true; hypeT = 0; hypeDuration = 7;
      hypeLasers = new THREE.Group();
      const laserColors = [0xff2ecb, 0x36e6ff, 0xffe066, 0x7cff5c];
      for (let i = 0; i < 6; i++) {
        const mat = new THREE.MeshBasicMaterial({ color: laserColors[i % laserColors.length], transparent: true, opacity: 0.55 });
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 16, 6), mat);
        beam.position.set(warTablePos.x, 7, warTablePos.z);
        beam.rotation.z = Math.PI / 2;
        beam.rotation.y = (i / 6) * Math.PI * 2;
        hypeLasers.add(beam);
      }
      scene.add(hypeLasers);
      playHypeBeat();
    };
    // Module 8: '360° drone/CCTV' camera mode toggle.
    liveRef.current.setDrone = (on) => {
      droneOn = on;
      dronePass.enabled = on;
      droneT = 0;
    };
    // Module 9: time-dilation slider (0..1 from the HUD, scaled up here).
    liveRef.current.setTimeDilation = (v) => {
      timeDilation = v * 40;
      if (v <= 0.01 && projectedTickets.length) {
        projectedTickets.forEach((t) => { scene.remove(t.mesh); t.mesh.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); });
        projectedTickets.length = 0;
      }
    };
    // Module 4: Bookkeeper Export Terminal.
    liveRef.current.exportBookkeeperPdf = () => exportBookkeeperPdf(liveRef.current.bizData);
    // The world is now actually fully assembled (not just downloaded) and
    // about to render its first real frame — only now does the loading
    // overlay come down.
    setLoadPct(null);
    renderer.setAnimationLoop(animate);

    const onResize = () => {
      const w = mount.clientWidth || window.innerWidth, h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloomPass.setSize(w, h);
      if (ssaoPass) ssaoPass.setSize(w, h);
      if (smaaPass) smaaPass.setSize(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
    };
    window.addEventListener("resize", onResize);

      cleanupFn = () => {
        renderer.setAnimationLoop(null);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("resize", onResize);
        mount.removeEventListener("click", onGodClick);
        transformControls.dispose();
        clearInterval(autoSaveIv);
        // ALPHA MEGA-PATCH V1.0 teardown
        try { warDragControls.dispose(); } catch {}
        try { candleWs?.close(); } catch {}
        window.removeEventListener("gamepadconnected", onGamepadConnected);
        window.removeEventListener("gamepaddisconnected", onGamepadDisconnected);
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach(disposeMaterial);
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

  // Twin-stick walk controls — a fixed left stick for movement, a fixed
  // right stick for turning/looking, the standard dual-analog layout. Each
  // stick captures its own pointer the moment it's pressed (setPointerCapture)
  // so dragging keeps working even once the finger slides off the small
  // on-screen circle, same as a real controller thumbstick.
  const JOY_R = 52;         // px from centre = full deflection
  const JOY_DEAD = 0.14;    // fraction of the radius ignored as a dead-zone
  const makeStick = (dragRef, setKnob, setActive, vecKey) => {
    const onDown = (e) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      dragRef.current = { ox: rect.left + rect.width / 2, oy: rect.top + rect.height / 2, id: e.pointerId };
      setActive(true);
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    };
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d || e.pointerId !== d.id) return;
      let dx = e.clientX - d.ox, dy = e.clientY - d.oy;
      const len = Math.hypot(dx, dy);
      const clamped = Math.min(len, JOY_R);
      if (len > 0) { dx = (dx / len) * clamped; dy = (dy / len) * clamped; }
      setKnob({ x: dx, y: dy });
      // Dead-zone + smooth remap so small movements are precise and there's
      // no jitter when you're barely touching the centre.
      let mag = clamped / JOY_R;
      if (mag < JOY_DEAD) { liveRef.current[vecKey] = { x: 0, y: 0 }; return; }
      mag = (mag - JOY_DEAD) / (1 - JOY_DEAD);
      const ux = len > 0 ? dx / clamped : 0, uy = len > 0 ? dy / clamped : 0;
      liveRef.current[vecKey] = { x: ux * mag, y: uy * mag };
    };
    const onUp = (e) => {
      const d = dragRef.current;
      if (d && e.pointerId !== d.id) return;
      dragRef.current = null;
      setActive(false);
      setKnob({ x: 0, y: 0 });
      liveRef.current[vecKey] = { x: 0, y: 0 };
    };
    return { onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp };
  };
  // Left stick = camera (orbits the view in third person, turns your own
  // head in first person); right stick = movement — owner-specified split,
  // opposite of the initial left=move/right=look layout.
  const leftStick = makeStick(leftDrag, setLeftKnob, setLeftActive, "turnVec");
  const rightStick = makeStick(rightDrag, setRightKnob, setRightActive, "joyVec");

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
      // Background noise in an always-listening mic often gets misheard as a
      // stray word or two - filter those out before they turn into a real API
      // call. A genuine question is essentially never this short.
      if (!said || said.length < 4 || !said.includes(" ")) { setVoiceState("idle"); return; }
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
      <div ref={mountRef} className="off3-canvas" />
      <div className="off3-hint">ג'ויסטיק ימני לתזוזה · שמאלי למבט/מצלמה · חצים / WASD במחשב · Shift לספרינט טקטי · התקרב לעובד ודבר איתו · ליד הכיסא שלך: E לשבת · {ph.emoji} {ph.label}</div>
      {autoTurboNotice && (
        <div className="off3-autoturbo">
          🚀 זיהינו שהמכשיר מתקשה — הפעלנו מצב טורבו אוטומטית לתצוגה חלקה. אפשר לכבות בהגדרות.
          <button onClick={() => setAutoTurboNotice(false)}><X size={13} /></button>
        </div>
      )}
      {loadPct !== null && (
        <div className="off3-loader">
          <div className="off3-loader-logo">🏢</div>
          <b>{loadPhase === "download" ? "מוריד נכסים…" : "בונה את המשרד החי…"}</b>
          <div className="off3-loader-bar"><i style={{ width: `${Math.max(6, loadPct)}%` }} /></div>
          <span>{loadPct}%</span>
          <div className="off3-loader-tip" key={tipIndex}>
            <div className="off3-loader-tip-ic">{SIM_TIPS[tipIndex].icon}</div>
            <div className="off3-loader-tip-txt">
              <b>{SIM_TIPS[tipIndex].title}</b>
              <p>{SIM_TIPS[tipIndex].desc}</p>
            </div>
          </div>
          <div className="off3-loader-dots">
            {SIM_TIPS.map((_, i) => (
              <button
                key={i}
                className={"off3-loader-dot" + (i === tipIndex ? " on" : "")}
                onClick={() => setTipIndex(i)}
                aria-label={SIM_TIPS[i].title}
              />
            ))}
          </div>
        </div>
      )}
      {showLoadPrompt && (
        <div className="off3-restore">
          <div className="off3-restore-box">
            <b>📐 שחזור תצורה</b>
            <p>נמצאה תצורת ציוד שמורה מהפעם הקודמת ({liveRef.current.pendingRestore} פריטים). לטעון אותה?</p>
            <div className="off3-restore-row">
              <button className="off3-restore-yes" onClick={() => liveRef.current.confirmLoadLast?.()}>טען תצורה אחרונה</button>
              <button className="off3-restore-no" onClick={() => liveRef.current.dismissLoadPrompt?.()}>התחל ריק</button>
            </div>
          </div>
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
      <button
        className={"off3-nightclub" + (nightclub ? " on" : "")}
        onClick={() => setNightclub((v) => !v)}
        title={nightclub ? "מצב UV פעיל — כבה את האורות" : "Lights Out — מצב מועדון UV"}
      >
        🪩 {nightclub ? "UV פעיל" : "Lights Out"}
      </button>
      {radioPlaying && !(phoneOpen && phoneTab === "radio") && (
        <div className="off3-radio-mini" title={radioStationName}>
          <Radio size={13} />
          <span>{radioStationName}</span>
          <button onClick={() => radioRef.current?.toggle()} title="השתק"><Pause size={12} /></button>
        </div>
      )}
      <button className={"off3-phonebtn" + (phoneOpen ? " on" : "")} onClick={() => { setPhoneOpen((v) => !v); setPhoneMaximized(false); setPhoneFlipping(false); }} title="הטלפון שלך — שיחה חיה ושליטה במערכות">
        📱
      </button>
      {/* Always mounted (CSS-hidden when the phone is closed, not unmounted)
          so the radio panel inside it never loses its <audio> element and
          the broadcast keeps running in the background exactly like a real
          radio when you close the phone — only the JSX conditionals for
          chat/ctrl/embed content still mount-on-demand, they don't need to
          survive being closed. */}
      <div className={"off3-phone" + (phoneOpen ? "" : " off3-phone-closed") + (phoneMaximized ? " off3-phone-max" : "") + (phoneFlipping ? " off3-phone-flip" : "")}>
          <div className="off3-phone-notch" />
          <button className="off3-phone-maxbtn" onClick={togglePhoneMax} title={phoneMaximized ? "מזער" : "הגדל מסך"}>
            {phoneMaximized ? "🗕" : "⤢"}
          </button>
          <div className="off3-phone-brand">ALPHA-LINK-01 <i>· מוצפן</i></div>
          {phoneUnlocking && (
            <div className="off3-phone-unlock">
              <div className="off3-phone-unlock-ring" />
              <b>ALPHA-LINK-01</b>
              <span>מאמת זיהוי ביומטרי…</span>
            </div>
          )}
          <div className="off3-phone-tabs">
            <button className={phoneTab === "home" ? "on" : ""} onClick={() => { setPhoneTab("home"); setPhoneEmbed(null); }} title="בית">🏠</button>
            <button className={phoneTab === "chat" ? "on" : ""} onClick={() => { setPhoneTab("chat"); setPhoneEmbed(null); }} title="שיחה חיה">💬</button>
            <button className={phoneTab === "ctrl" ? "on" : ""} onClick={() => { setPhoneTab("ctrl"); setPhoneEmbed(null); }} title="שליטה">🎛</button>
            <button className={phoneTab === "radio" ? "on" : ""} onClick={() => { setPhoneTab("radio"); setPhoneEmbed(null); }} title="רדיו">📻</button>
            <button className={phoneTab === "spotify" ? "on" : ""} onClick={() => { setPhoneTab("spotify"); setPhoneEmbed(null); }} title="ספוטיפי">🎵</button>
            <button className={phoneTab === "cam" ? "on" : ""} onClick={() => { setPhoneTab("cam"); setPhoneEmbed(null); }} title="מצלמה">📷</button>
            <button className={"off3-phone-tab-sec" + (phoneTab === "sec" ? " on" : "")} onClick={() => { setPhoneTab("sec"); setPhoneEmbed(null); }} title="אבטחה">
              🛡{securityAlerts.some((a) => a.level === "high") && <i className="off3-phone-badge" />}
            </button>
          </div>
          {!phoneEmbed && phoneTab === "home" && (
            <div className="off3-phone-body off3-phone-home">
              <div className="off3-phone-homeclock">{phoneClock}</div>
              <div className="off3-phone-homesub">ALPHA-LINK-01 · מסוף מאובטח</div>
              <div className="off3-phone-apps">
                <button className="off3-phone-app" onClick={() => setPhoneTab("chat")}><span>💬</span>שיחה חיה</button>
                <button className="off3-phone-app" onClick={() => setPhoneTab("ctrl")}><span>🎛</span>מרכז פיקוד</button>
                <button className="off3-phone-app" onClick={() => setPhoneTab("radio")}><span>📻</span>רדיו</button>
                <button className="off3-phone-app" onClick={() => setPhoneTab("spotify")}><span>🎵</span>ספוטיפי</button>
                <button className="off3-phone-app" onClick={() => setPhoneTab("cam")}><span>📷</span>מצלמה</button>
                <button className="off3-phone-app" onClick={() => setPhoneTab("sec")}>
                  <span>🛡</span>אבטחה{securityAlerts.some((a) => a.level === "high") && <i className="off3-phone-badge" />}
                </button>
              </div>
            </div>
          )}
          {!phoneEmbed && phoneTab === "sec" && (
            <div className="off3-phone-body">
              <div className="off3-phone-sec">HEAVY GUARD · התראות צי בזמן אמת</div>
              {securityAlerts.map((a, i) => (
                <div key={i} className={"off3-phone-alert lvl-" + a.level}>
                  <b>{a.level === "high" ? "🔴" : a.level === "mid" ? "🟡" : "🟢"}</b>
                  <span>{a.text}</span>
                </div>
              ))}
            </div>
          )}
          {!phoneEmbed && phoneTab === "cam" && (
            <div className="off3-phone-body off3-cam">
              <div className="off3-phone-sec">📷 מצלמה</div>
              {camError
                ? <p className="off3-phone-empty">{camError}</p>
                : <video ref={camVideoRef} className="off3-cam-video" autoPlay playsInline muted />}
              <button className="off3-voice-test" disabled={!!camError} onClick={snapPhoto}>📸 צלם</button>
              {phonePhotos.length === 0
                ? <p className="off3-phone-empty">התמונות שתצלמו יישמרו כאן, וגם יורדות למחשב בלחיצת כפתור.</p>
                : (
                  <div className="off3-cam-gallery">
                    {phonePhotos.map((p) => (
                      <div key={p.id} className="off3-cam-thumb">
                        <img src={p.dataUrl} alt="" />
                        <div className="off3-cam-thumb-actions">
                          <button onClick={() => downloadPhoto(p)} title="הורד">⬇</button>
                          <button onClick={() => deletePhoto(p.id)} title="מחק">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}
          {phoneEmbed && (
            <div className="off3-phone-embed">
              <div className="off3-phone-embed-bar">
                <button className="off3-phone-back" onClick={() => setPhoneEmbed(null)}>← חזרה</button>
                <span>{phoneEmbed.title}</span>
              </div>
              <iframe
                key={phoneEmbed.url}
                src={phoneEmbed.url}
                title={phoneEmbed.title}
                className="off3-phone-iframe"
                allow="clipboard-write"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          {!phoneEmbed && phoneTab === "chat" && (
            <div className="off3-phone-body">
              {talkAgent
                ? <div className="off3-phone-live">📡 בשיחה חיה עם {talkAgent.name} — ההולוגרמה מוקרנת מהיד</div>
                : <div className="off3-phone-live dim">אין שיחה פעילה — התקרב לסוכן ודבר איתו</div>}
              {phoneLog.length === 0 && <p className="off3-phone-empty">כל שורת שיחה תופיע כאן וגם על ההולוגרמה שמעל הטלפון ביד שלך.</p>}
              {phoneLog.map((l, i) => (
                <div key={i} className="off3-phone-line" style={{ "--c": l.color || "#2ee6ff" }}>
                  <b>{l.who}</b><span>{l.text}</span>
                </div>
              ))}
            </div>
          )}
          <div className={"off3-phone-body" + (!phoneEmbed && phoneTab === "radio" ? "" : " off3-phone-body-hidden")}>
            <RadioController ref={radioRef} visible={!phoneEmbed && phoneTab === "radio"} onPlayStateChange={handleRadioPlayState} />
          </div>
          {!phoneEmbed && phoneTab === "spotify" && (
            <div className="off3-phone-body off3-spotify">
              <div className="off3-phone-sec">🎵 ספוטיפי — הדבק קישור לשיר/פלייליסט/אלבום ציבורי</div>
              <input
                className="off3-spotify-input"
                type="text"
                dir="ltr"
                placeholder="https://open.spotify.com/playlist/..."
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
              />
              <button
                className="off3-voice-test"
                disabled={!toSpotifyEmbedUrl(spotifyUrl)}
                onClick={() => { const u = toSpotifyEmbedUrl(spotifyUrl); if (u) setPhoneEmbed({ title: "ספוטיפי", url: u }); }}
              >
                ▶ פתח נגן ספוטיפי
              </button>
              {spotifyUrl && !toSpotifyEmbedUrl(spotifyUrl) && (
                <p className="off3-phone-empty">זה לא נראה כמו קישור open.spotify.com תקין (שיר/אלבום/פלייליסט/פודקאסט).</p>
              )}
              <p className="off3-phone-empty">וידג'ט חינמי ללא התחברות — מנגן פלייליסטים/שירים ציבוריים. אפשר להדביק גם קישור רגיל (כפתור "שתף" → "העתק קישור") וגם את קוד ה-embed המלא (כפתור "שתף" → "הטמעה") — שניהם עובדים.</p>
            </div>
          )}
          {!phoneEmbed && phoneTab === "ctrl" && (
            <div className="off3-phone-body">
              <div className="off3-phone-sec">העוזר הראשי · ALPHA</div>
              {/* Command Center runs its own full 3D scene, same as this
                  office sim — embedding two live WebGL contexts in one phone
                  panel would tank performance on mobile, so this one still
                  navigates instead of sandboxing. Everything else below is a
                  plain 2D app and renders fine inside the phone's iframe. */}
              <button className="off3-phone-act" onClick={() => { window.location.href = "./"; }}>🤖 פתח את מרכז הפיקוד הראשי</button>
              <button className="off3-phone-act" onClick={() => setTurbo((v) => !v)}>🚀 טורבו: {turbo ? "פעיל — כבה" : "כבוי — הפעל"}</button>
              <button className="off3-phone-act" onClick={() => setFirstPerson((v) => !v)}>👁 תצוגה: {firstPerson ? "גוף ראשון" : "גוף שלישי"}</button>
              <div className="off3-phone-sec">בקרת מתקן</div>
              <label className="off3-phone-slider">
                <span>💡 תאורה</span>
                <input type="range" min="0.4" max="1.8" step="0.05" value={godLight} onChange={(e) => setGodLight(parseFloat(e.target.value))} />
              </label>
              <label className="off3-phone-slider">
                <span>✨ זוהר</span>
                <input type="range" min="0" max="2" step="0.05" value={godGlow} onChange={(e) => setGodGlow(parseFloat(e.target.value))} />
              </label>
              <label className="off3-phone-slider">
                <span>🏃 מהירות סוכנים</span>
                <input type="range" min="0.3" max="2.5" step="0.1" value={godSpeed} onChange={(e) => setGodSpeed(parseFloat(e.target.value))} />
              </label>
              <div className="off3-phone-sec">המערכות שלך</div>
              <button className="off3-phone-act" onClick={() => setPhoneEmbed({ url: "heavyguard.html", title: "🛡 HEAVY GUARD OS" })}>🛡 HEAVY GUARD OS</button>
              <button className="off3-phone-act" onClick={() => setPhoneEmbed({ url: "https://heavt-guard-simulator-1.onrender.com/", title: "📈 מערכת מסחר · TRADE" })}>📈 מערכת מסחר · TRADE</button>
              <button className="off3-phone-act" onClick={() => setPhoneEmbed({ url: "agent.html", title: "👔 CRM מכירות · איתי" })}>👔 CRM מכירות · איתי</button>
              <button className="off3-phone-act" onClick={() => onOpenChat("cmo")}>📣 שיווק · נפתלי (טיוטות ופרסום)</button>
              <button className="off3-phone-act" onClick={() => onOpenChat("ceo")}>🧑‍💼 דבר עם יהודה — המנכ"ל</button>
            </div>
          )}
      </div>
      {(canSit || sitting) && (
        <button className={"off3-sit" + (sitting ? " on" : "")} onClick={() => setSitting((v) => !v)} title={sitting ? "קום מהכיסא" : "שב בכיסא שלך (E)"}>
          {sitting ? "🚶 קום" : "🪑 שב בכיסא שלך"}
        </button>
      )}
      {sitting && (
        <button className={"off3-sit" + (feetUp ? " on" : "")} style={{ top: "58px" }} onClick={() => setFeetUp((v) => !v)} title={feetUp ? "הורד רגליים" : "שים רגליים על השולחן"}>
          {feetUp ? "🦵 הורד רגליים" : "🦶 רגליים על השולחן"}
        </button>
      )}
      {nearVehicle && !inVehicle && (
        <button className="off3-sit" onClick={() => setInVehicle(true)} title="היכנס לרכב (E)">
          🚗 היכנס לרכב
        </button>
      )}
      {nearVehicle && !inVehicle && (() => {
        const stats = carLiveStats();
        const loan = loanStatus(new Date());
        return (
          <div className="off3-garage-hud">
            <b>🔋 Tiggo 7 PHEV · Virtual Garage</b>
            <div><span>סוללה</span><b>{stats.battery}%</b></div>
            <div><span>קילומטראז'</span><b>{stats.mileage.toLocaleString()} ק"מ</b></div>
            <div><span>הלוואת בלון</span><b>{loan.done ? "הסתיימה" : `${loan.monthsLeft} חודשים נותרו`}</b></div>
            <p>* נתוני סוללה/ק"מ סימולציה; תנאי ההלוואה דוגמה בלבד — עדכן מול החוזה האמיתי.</p>
          </div>
        );
      })()}
      {nearWarTable && (
        <div className="off3-wartable-hud">
          <b>🚛 שולחן מלחמה · Heavy Guard</b>
          <p>גרור משאית ליום כדי לתזמן התקנה</p>
          <button className="off3-hype-btn" onClick={() => liveRef.current.triggerHype?.()}>🎉 סגור עסקה — 60 משאיות!</button>
        </div>
      )}
      {nearBookkeeper && (
        <button className="off3-sit" onClick={() => liveRef.current.exportBookkeeperPdf?.()} title="ייצוא PDF להנהלת חשבונות">
          📄 ייצוא ל-מור (PDF)
        </button>
      )}
      {nearKids && !kidsGame && (
        <button className="off3-sit" onClick={() => liveRef.current.toggleKidsGame?.()} title="פתח משחק (או כפתור B בג'ויסטיק)">
          🐾 משחק לאורי
        </button>
      )}
      {warToast && <div className="off3-war-toast">{warToast}</div>}
      {drone && (
        <div className="off3-drone-rec"><i /> REC · Heavy Guard 360°</div>
      )}
      {kidsGame && (
        <div className="off3-kids-overlay">
          <div className="off3-kids-card">
            <button className="off3-kids-close" onClick={() => setKidsGame(false)}>✕</button>
            <h3>🐾 בואי נמצא צבע!</h3>
            <p>{kidsFeedback === "yay" ? "כל הכבוד אורי! 🎉" : kidsFeedback === "try" ? "כמעט! נסי שוב 💛" : `איפה ה${KIDS_SHAPES.find((s) => s.id === kidsPrompt)?.label}?`}</p>
            <div className="off3-kids-shapes">
              {KIDS_SHAPES.map((s) => (
                <button key={s.id} className={"off3-kids-shape shape-" + s.shape} style={{ "--kc": s.color }} onClick={() => pickKidsShape(s.id)}>
                  {s.shape === "circle" ? "⬤" : s.shape === "square" ? "■" : s.shape === "triangle" ? "▲" : "★"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {nearPlane && !inFlight && (
        <button className="off3-sit" onClick={() => setInFlight(true)} title="צא לטיסה (E)">
          🛫 צא לטיסה
        </button>
      )}
      {nearHangar && !inHangar && (
        <button className="off3-sit" onClick={() => setInHangar(true)} title="היכנס להאנגר (E)">
          🏗️ היכנס להאנגר
        </button>
      )}
      {nearTruck && (
        <div className="off3-subtitle">
          <b style={{ color: "#E4BC63" }}>🚚 {nearTruck.label}</b>
          <span>{truckInfo[nearTruck.label] === "loading" ? "טוען מידע…" : (truckInfo[nearTruck.label] || "טוען מידע…")}</span>
        </div>
      )}
      {inVehicle && (
        <div className="off3-vehicle-hud">
          <div className="off3-vehicle-head">
            <b>🛡 Heavy Guard Monitoring Active</b>
            <button onClick={() => setInVehicle(false)} title="צא מהרכב (E / Esc)">✕ צא</button>
          </div>
          {securityAlerts.map((a, i) => (
            <div key={i} className={"off3-phone-alert lvl-" + a.level}>
              <b>{a.level === "high" ? "🔴" : a.level === "mid" ? "🟡" : "🟢"}</b>
              <span>{a.text}</span>
            </div>
          ))}
          <p className="off3-vehicle-note">מסך רכב לדגם תצוגה — ללא נהיגה בפועל בתוך קומת המשרד.</p>
        </div>
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
          <button className="off3-settings-row" onClick={() => { setSettingsOpen(false); setGodOpen(true); }}>
            <span>🛠 God Mode — עריכת סצנה</span>
            <b className={godOpen ? "on" : ""}>{godOpen ? "פתוח" : "כלים למנהל"}</b>
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
          <div className="off3-settings-row off3-settings-select">
            <span><MessageCircle size={15} /> שפת תשובות הסוכנים</span>
            <select value={agentLang} onChange={(e) => setAgentLang(e.target.value)}>
              <option value="he">עברית</option>
              <option value="en">English</option>
            </select>
          </div>
          {chars.length > 0 && (() => {
            const agentOpts = chars.map((c) => byId(c.id)).filter(Boolean);
            const va = byId(voiceAgentId) ? voiceAgentId : (agentOpts[0] && agentOpts[0].id) || "";
            const cfg = readAgentVoiceCfg(va);
            const dflt = (agentVoiceDefaults && agentVoiceDefaults[va]) || { pitch: 1, rate: 1.02 };
            const rate = cfg.rate ?? dflt.rate;
            const pitch = cfg.pitch ?? dflt.pitch;
            const langPrefix = agentLang === "en" ? "en" : "he";
            const relevantVoices = voiceList.filter((v) => v.lang?.startsWith(langPrefix) || (langPrefix === "he" && v.lang?.startsWith("iw")));
            return (
              <div className="off3-settings-voice">
                <div className="off3-settings-row off3-settings-select">
                  <span>🎙️ קול מותאם אישית — סוכן</span>
                  <select value={va} onChange={(e) => setVoiceAgentId(e.target.value)}>
                    {agentOpts.map((a) => <option key={a.id} value={a.id}>{a.name} · {a.title}</option>)}
                  </select>
                </div>
                <div className="off3-settings-row off3-settings-select">
                  <span>קול</span>
                  <select value={cfg.voiceURI || ""} onChange={(e) => writeAgentVoiceCfg(va, { voiceURI: e.target.value })}>
                    <option value="">ברירת מחדל (אוטומטי)</option>
                    {relevantVoices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
                  </select>
                </div>
                <label><span>מהירות</span> <span className="range-val">{rate.toFixed(2)}x</span></label>
                <input type="range" min="0.6" max="1.6" step="0.02" value={rate} onChange={(e) => writeAgentVoiceCfg(va, { rate: parseFloat(e.target.value) })} />
                <label><span>גובה צליל</span> <span className="range-val">{pitch.toFixed(2)}</span></label>
                <input type="range" min="0.5" max="1.6" step="0.02" value={pitch} onChange={(e) => writeAgentVoiceCfg(va, { pitch: parseFloat(e.target.value) })} />
                <div className="off3-settings-row">
                  <button className="off3-voice-test" onClick={() => voice?.speak?.(`שלום, אני ${byId(va)?.name}. ככה אני נשמע עכשיו.`, va)}>▶ נסה קול</button>
                  <button className="off3-voice-test" onClick={() => { try { localStorage.removeItem("alpha:agents:voiceCfg:" + va); } catch {} setVoiceCfgTick((t) => t + 1); }}>↺ אפס לברירת מחדל</button>
                </div>
              </div>
            );
          })()}
          <p className="off3-settings-note">בגוף ראשון: ↑/W מתקדם ו-↓/S נסוג לפי הכיוון שאתה מסתכל אליו (בלי לסובב את המצלמה), ←/→ או A/D מסובבים אותך (בכיוון הפוך). כל סוכן מדבר בגובה קול מעט שונה כדי שיהיה קל להבחין ביניהם.</p>
        </div>
      )}
      {godOpen && (
        <div className="off3-god">
          <div className="off3-god-head">
            🛠 God Mode
            <button onClick={() => setGodOpen(false)}><X size={14} /></button>
          </div>
          <p className="off3-god-hint">לחץ על הרכב / משאית / פורטל בסביבה כדי לבחור אותו.</p>
          <button className={"off3-god-standstill" + (standStill ? " on" : "")} onClick={() => setStandStill((v) => !v)}>
            {standStill ? <><Lock size={14} /> עומד במקום — לחץ לשחרר</> : <><Unlock size={14} /> עמוד במקום כדי לשלוט באובייקט</>}
          </button>
          {selectedObj ? (
            <div className="off3-god-sel">
              <div className="off3-god-sel-head">
                <b>{selectedObj.label}</b>
                <span className="off3-god-secure">🔒 SECURE LINK</span>
                {selectedObj.deletable && (
                  <button className="off3-god-del" onClick={() => liveRef.current.deleteSelected?.()} title="מחק אובייקט">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="off3-god-gizmo">
                <button className={gizmoMode === "translate" ? "on" : ""} onClick={() => setGizmoMode("translate")}>✥ הזזה</button>
                <button className={gizmoMode === "rotate" ? "on" : ""} onClick={() => setGizmoMode("rotate")}>↻ סיבוב</button>
                <button className={gizmoMode === "scale" ? "on" : ""} onClick={() => setGizmoMode("scale")}>⤢ גודל</button>
              </div>
              <p className="off3-god-hint">גרור את הידית הצבעונית שמופיעה על האובייקט בסצנה — או השתמש במחוונים למטה.</p>
              <label className="off3-god-row">
                <span>X</span>
                <input type="range" min="-38" max="38" step="0.2" value={selectedObj.x}
                  onChange={(e) => liveRef.current.applyPos?.("x", parseFloat(e.target.value))} />
              </label>
              <label className="off3-god-row">
                <span>Y</span>
                <input type="range" min="-1" max="6" step="0.1" value={selectedObj.y}
                  onChange={(e) => liveRef.current.applyPos?.("y", parseFloat(e.target.value))} />
              </label>
              <label className="off3-god-row">
                <span>Z</span>
                <input type="range" min="-32" max="32" step="0.2" value={selectedObj.z}
                  onChange={(e) => liveRef.current.applyPos?.("z", parseFloat(e.target.value))} />
              </label>
              <label className="off3-god-row">
                <span>סיבוב</span>
                <input type="range" min="0" max={Math.PI * 2} step="0.05" value={selectedObj.rotY}
                  onChange={(e) => liveRef.current.applyRotY?.(parseFloat(e.target.value))} />
              </label>
              <label className="off3-god-row">
                <span>גודל</span>
                <input type="range" min="0.2" max="3" step="0.05" value={selectedObj.scale}
                  onChange={(e) => liveRef.current.applyScale?.(parseFloat(e.target.value))} />
              </label>
              <div className="off3-god-tacspec">
                <div className="off3-god-sec off3-god-sec-in">TACTICAL SPECIFICATIONS</div>
                <div className="off3-god-tacspec-xyz">
                  <span>X <b>{selectedObj.x.toFixed(2)}</b></span>
                  <span>Y <b>{selectedObj.y.toFixed(2)}</b></span>
                  <span>Z <b>{selectedObj.z.toFixed(2)}</b></span>
                </div>
                <div className="off3-god-tacspec-row">
                  <span>סיווג ביטחוני</span>
                  <b>{selectedObj.deletable ? "ALPHA-3 · ציוד" : "ALPHA-1 · נכס ליבה"}</b>
                </div>
                {blueprint && <div className="off3-god-tacspec-snap">📐 הצמדה לרשת · 0.5m</div>}
              </div>
              {selectedObj.meta && Object.keys(selectedObj.meta).length > 0 && (
                <div className="off3-god-specs">
                  <div className="off3-god-sec off3-god-sec-in">מפרט טכני</div>
                  {Object.entries(selectedObj.meta).map(([k, v]) => (
                    <div key={k} className="off3-god-spec-row">
                      <span>{GOD_META_LABELS[k] || k}</span>
                      <b>{typeof v === "boolean" ? (v ? "כן" : "לא") : String(v)}</b>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="off3-god-empty">אין אובייקט נבחר</div>
          )}
          <div className="off3-god-sec">הוספת אובייקט</div>
          <div className="off3-god-spawn">
            <button onClick={() => liveRef.current.spawnAsset?.("truck")}>🚚 משאית</button>
            <button onClick={() => liveRef.current.spawnAsset?.("camera")}>📷 מצלמת אבטחה</button>
            <button onClick={() => liveRef.current.spawnAsset?.("dvr")}>📼 DVR</button>
          </div>
          <div className="off3-god-sec">מצב בנייה</div>
          <button className="off3-god-row off3-god-toggle" onClick={() => setBlueprint((v) => !v)}>
            <span>📐 Blueprint — שרטוט טקטי</span>
            <b className={blueprint ? "on" : ""}>{blueprint ? "פעיל" : "כבוי"}</b>
          </button>
          {blueprint && <p className="off3-god-hint">כל הסצנה בתצוגת שרטוט + רשת לייזר · מיקומים נצמדים לרשת של 0.5m</p>}
          <div className="off3-god-sec">תצורות משרד (שמירה אוטומטית כל 60 שנ׳)</div>
          <div className="off3-god-layout-save">
            <input
              type="text" placeholder="שם תצורה, למשל Mission-Ready"
              value={layoutNameInput} onChange={(e) => setLayoutNameInput(e.target.value)}
            />
            <button onClick={() => {
              const name = layoutNameInput.trim();
              if (!name) return;
              const n = liveRef.current.saveLayout?.(name) || 0;
              setLayoutMsg(`נשמר "${name}" — ${n} פריטים`);
              setLayoutNameInput("");
              setTimeout(() => setLayoutMsg(""), 3500);
            }}>💾 שמור</button>
          </div>
          {layoutMsg && <p className="off3-god-hint off3-god-layout-msg">{layoutMsg}</p>}
          {layoutNames.length > 0 ? layoutNames.map((name) => (
            <div key={name} className="off3-god-layout-row">
              <span>{name}</span>
              <button onClick={() => { const n = liveRef.current.loadLayout?.(name) || 0; setLayoutMsg(`נטען "${name}" — ${n} פריטים`); setTimeout(() => setLayoutMsg(""), 3500); }}>טען</button>
              <button className="off3-god-layout-del" onClick={() => liveRef.current.deleteLayout?.(name)}><Trash2 size={12} /></button>
            </div>
          )) : <p className="off3-god-hint">אין עדיין תצורות שמורות בשם — רק שמירה אוטומטית ברקע.</p>}
          <div className="off3-god-sec">סימולציה</div>
          <button className="off3-god-row off3-god-toggle" onClick={() => setGodPaused((v) => !v)}>
            <span>⏸ השהה זמן/סיבובים</span>
            <b className={godPaused ? "on" : ""}>{godPaused ? "מושהה" : "רץ"}</b>
          </button>
          <label className="off3-god-row">
            <span>💡 עוצמת תאורה</span>
            <input type="range" min="0.4" max="1.8" step="0.05" value={godLight} onChange={(e) => setGodLight(parseFloat(e.target.value))} />
          </label>
          <label className="off3-god-row">
            <span>✨ זוהר (Glow)</span>
            <input type="range" min="0" max="2" step="0.05" value={godGlow} onChange={(e) => setGodGlow(parseFloat(e.target.value))} />
          </label>
          <label className="off3-god-row">
            <span>🏃 מהירות סוכנים</span>
            <input type="range" min="0.3" max="2.5" step="0.1" value={godSpeed} onChange={(e) => setGodSpeed(parseFloat(e.target.value))} />
          </label>
          <div className="off3-god-sec">⏩ Module 9 — Time-Dilation</div>
          <label className="off3-god-row off3-god-dilation">
            <span>מחוגת זמן — מריצה יום/לילה, יוצרת נרות ותזמונים חזויים</span>
            <input type="range" min="0" max="1" step="0.02" value={dilation} onChange={(e) => setDilationState(parseFloat(e.target.value))} />
            <b>{dilation <= 0.01 ? "רגיל" : `x${Math.round(dilation * 40)}`}</b>
          </label>
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
          <div className={"off3-eq" + (voiceState === "speaking" ? " on" : "")} style={{ "--c": talkAgent.color }} aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
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
      <div className={"off3-joy-fixed off3-joy-left" + (leftActive ? " active" : "")}
        onPointerDown={leftStick.onPointerDown} onPointerMove={leftStick.onPointerMove}
        onPointerUp={leftStick.onPointerUp} onPointerCancel={leftStick.onPointerCancel}>
        <div className="off3-joy-knob" style={{ transform: `translate(${leftKnob.x}px, ${leftKnob.y}px)` }} />
      </div>
      <div className={"off3-joy-fixed off3-joy-right" + (rightActive ? " active" : "")}
        onPointerDown={rightStick.onPointerDown} onPointerMove={rightStick.onPointerMove}
        onPointerUp={rightStick.onPointerUp} onPointerCancel={rightStick.onPointerCancel}>
        <div className="off3-joy-knob" style={{ transform: `translate(${rightKnob.x}px, ${rightKnob.y}px)` }} />
      </div>
      {inSpace && <SpaceOverlay onReturn={() => liveRef.current.exitPortal?.()} load={spacePortalLoad} />}
      {inFlight && <FlightOverlay onReturn={() => setInFlight(false)} />}
      {inHangar && !inDrive && !inRobot && (
        <HangarOverlay
          onReturn={() => setInHangar(false)}
          liveRef={liveRef}
          onDrive={() => { setDriveVehicle("car"); setInDrive(true); }}
          onDriveTruck={() => { setDriveVehicle("truck"); setInDrive(true); }}
          onPilotRobot={() => setInRobot(true)}
        />
      )}
      {inDrive && <DriveOverlay onReturn={() => setInDrive(false)} liveRef={liveRef} vehicle={driveVehicle} />}
      {inRobot && <RobotPilotOverlay onReturn={() => setInRobot(false)} liveRef={liveRef} />}
    </div>
  );
}
