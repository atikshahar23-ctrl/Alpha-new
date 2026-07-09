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
//   ctx.camera           the deck camera (read-only for most; shake modules opt in)
//   ctx.liveRef          React live-data ref → .bizData, .marketRows,
//                        .securityAlerts, .radioPlaying, .joyVec, .keys …
//   ctx.obstacles        walk-collision array (push {x,z,r} for floor props)
//   ctx.base             import.meta.env.BASE_URL for GLB/asset paths
//   ctx.markDynamic(obj) opt an animated root OUT of the scene's matrix-freeze
//                        optimization so its per-frame transforms actually apply
//   ctx.helpers          { buildNeonSign, disposeMaterial }
//   ctx.anchors          { sun, warTable, algoZone, droneBay } world {x,z} spots
//
// Each factory returns { update(dt)?, dispose()? }. The host calls update()
// every frame inside the deck's animate loop (which already early-returns while
// an overlay is open) and dispose() once on unmount. A throwing factory is
// caught and skipped so one bad module can never blank the whole deck.
//
// NOTE: 7 of the V3.0 catalogue's 20 modules already ship inline in Office3D
// from MEGA-PATCH V2.0 (Crew Holograms #3, Interstellar Comms #4, Orbital Drop
// #6, Drone Bay #8, Market Radar #11, Quantum Holodeck #18, Musical Core #19).
// Those stay where they are; new V3.0 modules land here as separate files and
// get appended below as they're built.

import { createSolarSails } from "./solar-sails.js";

export const SPACE_MODULES = [
  { id: "solar-sails", create: createSolarSails }, // M12 · Staking & Yield Solar Sails
];
