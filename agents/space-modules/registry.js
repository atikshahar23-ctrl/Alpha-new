// ── GOD-TIER MEGA-PATCH V3.0 — space-module registry ───────────────────────
//
// The ONE import Office3D.jsx needs for the whole fleet of sci-fi modules.
// Every module is a *pure factory* — it imports nothing itself and receives
// everything through a single shared context object, so modules stay
// decoupled from the host scene and from each other, and the host owns the
// lifecycle (tick + teardown).
//
// Shared context contract (passed to every `create(ctx)`):
//   ctx.THREE            the Three.js namespace (one shared instance)
//   ctx.scene            the main command-deck scene
//   ctx.camera           the deck camera (read-only for most)
//   ctx.liveRef          React live-data ref → .bizData, .marketRows,
//                        .securityAlerts, .radioPlaying, .joyVec, .keys …
//   ctx.obstacles        walk-collision array (push {x,z,r} for floor props)
//   ctx.base             import.meta.env.BASE_URL for GLB/asset paths
//   ctx.markDynamic(obj) opt an animated root OUT of the scene's matrix-freeze
//   ctx.helpers          { buildNeonSign, disposeMaterial }
//   ctx.anchors          { sun, warTable, algoZone, droneBay } world {x,z} spots
//
// Each factory returns { update(dt)?, dispose()? }. The host ticks update()
// every frame (auto-disabling any module that throws) and calls dispose() on
// unmount. A throwing factory is caught + skipped so one bad module can never
// blank the whole deck.
//
// NOTE: 7 of the V3.0 catalogue's 20 modules already ship inline in Office3D
// from MEGA-PATCH V2.0 (Crew Holograms #3, Interstellar Comms #4, Orbital Drop
// #6, Drone Bay #8, Market Radar #11, Quantum Holodeck #18, Musical Core #19).
// The remaining 13 live here as one file each.

import { createIffShield } from "./iff-shield.js";
import { createQuartermaster } from "./quartermaster.js";
import { createVipChannel } from "./vip-channel.js";
import { createBlindspotDrone } from "./blindspot-drone.js";
import { createHyperspaceDealCloser } from "./hyperspace-deal-closer.js";
import { createConcretePumpArray } from "./concrete-pump-array.js";
import { createSolarSails } from "./solar-sails.js";
import { createSentinelBot } from "./sentinel-bot.js";
import { createAlliedFleetRadar } from "./allied-fleet-radar.js";
import { createTimeDilationEngine } from "./time-dilation-engine.js";
import { createZeroGNursery } from "./zero-g-nursery.js";
import { createRapBroadcastArray } from "./rap-broadcast-array.js";
import { createWarpBatteryLink } from "./warp-battery-link.js";
// ── SINGULARITY BRIDGE · reality-bridge modules ──
import { createChronoSphere } from "./chrono-sphere.js";
import { createCctvMatrix } from "./cctv-matrix.js";
import { createRedAlert } from "./red-alert.js";
import { createTiggoTelemetry } from "./tiggo-telemetry.js";
import { createNeuralCore } from "./neural-core.js";

export const SPACE_MODULES = [
  // ── CORE SYSTEM ALPHA · comms & AI ──
  { id: "iff-shield", create: createIffShield },                 // M1
  { id: "quartermaster", create: createQuartermaster },          // M2
  { id: "vip-channel", create: createVipChannel },               // M5
  // ── CORE SYSTEM BETA · fleet & logistics ──
  { id: "blindspot-drone", create: createBlindspotDrone },       // M7
  { id: "hyperspace-deal-closer", create: createHyperspaceDealCloser }, // M9
  { id: "concrete-pump-array", create: createConcretePumpArray },// M10
  // ── CORE SYSTEM GAMMA · finance & trading ──
  { id: "solar-sails", create: createSolarSails },               // M12
  { id: "sentinel-bot", create: createSentinelBot },             // M13
  { id: "allied-fleet-radar", create: createAlliedFleetRadar },  // M14
  { id: "time-dilation-engine", create: createTimeDilationEngine }, // M15
  // ── CORE SYSTEM DELTA · immersion ──
  { id: "zero-g-nursery", create: createZeroGNursery },          // M16
  { id: "rap-broadcast-array", create: createRapBroadcastArray },// M17
  { id: "warp-battery-link", create: createWarpBatteryLink },    // M20
  // ── SINGULARITY BRIDGE · reality-bridge (M21-M25) ──
  { id: "chrono-sphere", create: createChronoSphere },           // M21 · real-world time/weather sync
  { id: "cctv-matrix", create: createCctvMatrix },               // M22 · live CCTV uplink + glitch shader
  { id: "red-alert", create: createRedAlert },                   // M23 · cyber-warfare lockdown (F9)
  { id: "tiggo-telemetry", create: createTiggoTelemetry },       // M24 · Tiggo OBD2 telemetry hub
  { id: "neural-core", create: createNeuralCore },               // M25 · Neural Singularity Core
];
