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
// ── DOOMSDAY PAYLOAD · Pack 1 — tactical operations ──
import { createAmirConstellation } from "./amir-constellation.js";
import { createIkPump } from "./ik-pump.js";
import { createThermalVision } from "./thermal-vision.js";
import { createMaintenanceSkiff } from "./maintenance-skiff.js";
import { createInstallTimelapse } from "./install-timelapse.js";
// ── DOOMSDAY PAYLOAD · Pack 2 — crew & relays ──
import { createMorConsole } from "./mor-console.js";
import { createSafariBiodome } from "./safari-biodome.js";
import { createCallerIdInterceptor } from "./caller-id-interceptor.js";
import { createSnowboarder } from "./snowboarder.js";
import { createCrewMorale } from "./crew-morale.js";
// ── DOOMSDAY PAYLOAD · Pack 3 — vehicle physics ──
import { createRegenBrake } from "./regen-brake.js";
import { createTiggoDashboard } from "./tiggo-dashboard.js";
import { createHoverConversion } from "./hover-conversion.js";
import { createMarsSuspension } from "./mars-suspension.js";
import { createGhostRacer } from "./ghost-racer.js";
// ── DOOMSDAY PAYLOAD · Pack 4 — deep crypto ──
import { createBinanceBlackhole } from "./binance-blackhole.js";
import { createLaserGrid } from "./laser-grid.js";
import { createVaultOfLegends } from "./vault-of-legends.js";
import { createVolatilityShield } from "./volatility-shield.js";
import { createSpaceWhale } from "./space-whale.js";
// ── DOOMSDAY PAYLOAD · Pack 5 — studio & sound ──
import { createLyricProjector } from "./lyric-projector.js";
import { createSubwooferDeck } from "./subwoofer-deck.js";
import { createStageLighting } from "./stage-lighting.js";
import { createMicLaserCannon } from "./mic-laser-cannon.js";
import { createVinylGalaxy } from "./vinyl-galaxy.js";
// ── DOOMSDAY PAYLOAD · Pack 6 — system overrides ──
import { createCenterRadar } from "./center-radar.js";
import { createCryoPod } from "./cryo-pod.js";
import { createZeroGButton } from "./zero-g-button.js";
import { createAlphaAwakening } from "./alpha-awakening.js";
import { createSelfDestruct } from "./self-destruct.js";
// ── Owner request · command video wall (CCTV + live data twin screens) ──
import { createCommandVideoWall } from "./command-video-wall.js";
// ── AUDIO-NEURAL WALLS · Sector 1 — audio & studio matrix ──
import { createBassDisplacementPanels } from "./bass-displacement-panels.js";
import { createLyricWaterfall } from "./lyric-waterfall.js";
import { createLiquidEqualizer } from "./liquid-equalizer.js";
import { createHoloGoldRecords } from "./holo-gold-records.js";
import { createAmbientLedStrips } from "./ambient-led-strips.js";
// ── AUDIO-NEURAL WALLS · Sector 2 — Heavy Guard fleet command ──
import { createHexCamGrid } from "./hex-cam-grid.js";
import { createAmirProgressCylinder } from "./amir-progress-cylinder.js";
import { createDvrThermalExhaust } from "./dvr-thermal-exhaust.js";
import { createBlueprintProjector } from "./blueprint-projector.js";
import { createBlindspotAlarms } from "./blindspot-alarms.js";
// ── AUDIO-NEURAL WALLS · Sector 3 — crypto & finance ──
import { createTickerMarquee } from "./ticker-marquee.js";
import { createPnlPowerCables } from "./pnl-power-cables.js";
import { createCandlestickExtrusions } from "./candlestick-extrusions.js";
import { createWhaleSiren } from "./whale-siren.js";
import { createGasFeeDials } from "./gas-fee-dials.js";
// ── AUDIO-NEURAL WALLS · Sector 4 — agent uplinks ──
import { createMichalFunnel } from "./michal-funnel.js";
import { createCfoDigitalSafe } from "./cfo-digital-safe.js";
import { createDvoraBiorhythm } from "./dvora-biorhythm.js";
import { createCallRippleEmitter } from "./call-ripple-emitter.js";
import { createAgentPowerTethers } from "./agent-power-tethers.js";
// ── AUDIO-NEURAL WALLS · Sector 5 — smart environment & UX ──
import { createSmartViewport } from "./smart-viewport.js";
import { createWeatherSyncNode } from "./weather-sync-node.js";
import { createVolumetricClock } from "./volumetric-clock.js";
import { createKineticCalendar } from "./kinetic-calendar.js";
import { createBiometricDoorScanner } from "./biometric-door-scanner.js";
// ── AUDIO-NEURAL WALLS · Sector 6 — hangar & easter eggs ──
import { createTiggoDiagnosticMural } from "./tiggo-diagnostic-mural.js";
import { createLegendaryNeonSigns } from "./legendary-neon-signs.js";
import { createGravityOverrideSwitch } from "./gravity-override-switch.js";
import { createCyberspaceFirewall } from "./cyberspace-firewall.js";
import { createAlphaNeuralWeb } from "./alpha-neural-web.js";
// ── NEURAL-QUANTUM OVERRIDE · Phases 2-5 (Phase 1 Smart Glass ships inline in Office3D) ──
import { createHgSentinelGrid } from "./hg-sentinel-grid.js";
import { createPolymorphicAgents } from "./polymorphic-agents.js";
import { createNeuralDriveUplink } from "./neural-drive-uplink.js";
import { createOmniEnvironment } from "./omni-environment.js";

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
  // ── DOOMSDAY PAYLOAD · Pack 1 · tactical operations (M26-30) ──
  { id: "amir-constellation", create: createAmirConstellation }, // M26 · 60-pump star map
  { id: "ik-pump", create: createIkPump },                       // M27 · gamepad IK pump arm
  { id: "thermal-vision", create: createThermalVision },         // M28 · thermal/night-vision (T)
  { id: "maintenance-skiff", create: createMaintenanceSkiff },   // M29 · welding maintenance drone
  { id: "install-timelapse", create: createInstallTimelapse },   // M30 · deal-close build time-lapse
  // ── DOOMSDAY PAYLOAD · Pack 2 · crew & relays (M31-35) ──
  { id: "mor-console", create: createMorConsole },               // M31 · VIP override console dim
  { id: "safari-biodome", create: createSafariBiodome },         // M32 · glass biodome + hide-and-seek
  { id: "caller-id-interceptor", create: createCallerIdInterceptor }, // M33 · relay sat + caller card
  { id: "snowboarder", create: createSnowboarder },              // M34 · half-pipe market rider
  { id: "crew-morale", create: createCrewMorale },               // M35 · pod idle-life props
  // ── DOOMSDAY PAYLOAD · Pack 3 · vehicle physics (M36-40) ──
  { id: "regen-brake", create: createRegenBrake },               // M36 · regen charge tower + turbo
  { id: "tiggo-dashboard", create: createTiggoDashboard },       // M37 · 1:1 PHEV telemetry cluster
  { id: "hover-conversion", create: createHoverConversion },     // M38 · wheel-fold hovercraft demo
  { id: "mars-suspension", create: createMarsSuspension },       // M39 · per-wheel suspension rover
  { id: "ghost-racer", create: createGhostRacer },               // M40 · volume-driven ghost race
  // ── DOOMSDAY PAYLOAD · Pack 4 · deep crypto (M41-45) ──
  { id: "binance-blackhole", create: createBinanceBlackhole },   // M41 · bear-market lensing singularity
  { id: "laser-grid", create: createLaserGrid },                 // M42 · trade-fire laser lattice
  { id: "vault-of-legends", create: createVaultOfLegends },      // M43 · golden hall of legendary trades
  { id: "volatility-shield", create: createVolatilityShield },   // M44 · VIX deflector dome
  { id: "space-whale", create: createSpaceWhale },               // M45 · whale-alert cosmic leviathan
  // ── DOOMSDAY PAYLOAD · Pack 5 · studio & sound (M46-50) ──
  { id: "lyric-projector", create: createLyricProjector },       // M46 · floating 3D lyric typography
  { id: "subwoofer-deck", create: createSubwooferDeck },         // M47 · bass-ripple membrane floor
  { id: "stage-lighting", create: createStageLighting },         // M48 · Stromae / Bad Bunny rig
  { id: "mic-laser-cannon", create: createMicLaserCannon },      // M49 · voice-amplitude bow cannon
  { id: "vinyl-galaxy", create: createVinylGalaxy },             // M50 · cosmic vinyl backdrop
  // ── DOOMSDAY PAYLOAD · Pack 6 · system overrides (M51-55) ──
  { id: "center-radar", create: createCenterRadar },             // M51 · Bat Yam/Rishon truck radar
  { id: "cryo-pod", create: createCryoPod },                     // M52 · AFK frost-shader cryo veil
  { id: "zero-g-button", create: createZeroGButton },            // M53 · "do not press" zero-G anomaly
  { id: "alpha-awakening", create: createAlphaAwakening },       // M54 · on-demand Alpha Protocol ritual
  { id: "self-destruct", create: createSelfDestruct },           // M55 · armed-only self-destruct + reload
  // ── Owner request · twin command monitors in the walkway ──
  { id: "command-video-wall", create: createCommandVideoWall },  // CCTV place-cams + live markets/HG data
  // ── AUDIO-NEURAL WALLS · Sector 1 · audio & studio matrix ──
  { id: "bass-displacement-panels", create: createBassDisplacementPanels }, // kick-driven wall extrusion
  { id: "lyric-waterfall", create: createLyricWaterfall },        // scrolling lyric "digital rain"
  { id: "liquid-equalizer", create: createLiquidEqualizer },      // bouncing liquid frequency bars
  { id: "holo-gold-records", create: createHoloGoldRecords },     // spinning gold vinyl + milestone sparks
  { id: "ambient-led-strips", create: createAmbientLedStrips },   // BPM-synced baseboard/crown LEDs
  // ── AUDIO-NEURAL WALLS · Sector 2 · Heavy Guard fleet command ──
  { id: "hex-cam-grid", create: createHexCamGrid },                // honeycomb truck-cam DVR wall
  { id: "amir-progress-cylinder", create: createAmirProgressCylinder }, // 60-truck rollout liquid gauge
  { id: "dvr-thermal-exhaust", create: createDvrThermalExhaust },  // server-heat vent + shimmer
  { id: "blueprint-projector", create: createBlueprintProjector }, // wireframe pump-truck hologram
  { id: "blindspot-alarms", create: createBlindspotAlarms },       // wall strobes on blind-spot events
  // ── AUDIO-NEURAL WALLS · Sector 3 · crypto & finance ──
  { id: "ticker-marquee", create: createTickerMarquee },           // scrolling LED price ticker
  { id: "pnl-power-cables", create: createPnlPowerCables },        // green/red flowing wall cables
  { id: "candlestick-extrusions", create: createCandlestickExtrusions }, // wall candles pushing out
  { id: "whale-siren", create: createWhaleSiren },                 // rotating beacon + sonar ping
  { id: "gas-fee-dials", create: createGasFeeDials },               // steampunk gas-fee gauges
  // ── AUDIO-NEURAL WALLS · Sector 4 · agent uplinks ──
  { id: "michal-funnel", create: createMichalFunnel },              // marketing funnel beside Michal
  { id: "cfo-digital-safe", create: createCfoDigitalSafe },         // vault door beside Reuven/CFO
  { id: "dvora-biorhythm", create: createDvoraBiorhythm },          // heartbeat monitor beside Dvora
  { id: "call-ripple-emitter", create: createCallRippleEmitter },   // ripple burst on incoming call
  { id: "agent-power-tethers", create: createAgentPowerTethers },   // laser cables to a data spine
  // ── AUDIO-NEURAL WALLS · Sector 5 · smart environment & UX ──
  { id: "smart-viewport", create: createSmartViewport },            // opaque-to-glass wall section
  { id: "weather-sync-node", create: createWeatherSyncNode },       // live Open-Meteo rain/sun/cloud
  { id: "volumetric-clock", create: createVolumetricClock },        // gaze-aligning shard-digit clock
  { id: "kinetic-calendar", create: createKineticCalendar },        // week grid, today pushes out
  { id: "biometric-door-scanner", create: createBiometricDoorScanner }, // entrance laser-grid scan
  // ── AUDIO-NEURAL WALLS · Sector 6 · hangar & easter eggs (workshop-corner substitute — see file comments) ──
  { id: "tiggo-diagnostic-mural", create: createTiggoDiagnosticMural }, // M26 · PHEV schematic + battery sparks
  { id: "legendary-neon-signs", create: createLegendaryNeonSigns },     // M27 · Lugia/Ho-Oh neon-tube silhouettes
  { id: "gravity-override-switch", create: createGravityOverrideSwitch }, // M28 · lever → zero-G (shares M53's flag)
  { id: "cyberspace-firewall", create: createCyberspaceFirewall },      // M29 · self-shattering hex shield wall
  { id: "alpha-neural-web", create: createAlphaNeuralWeb },             // M30 · ceiling neuron web, pulses on agent talk
  // ── NEURAL-QUANTUM OVERRIDE · Phases 2-5 — glassmorphic neural-matrix retheme ──
  { id: "hg-sentinel-grid", create: createHgSentinelGrid },            // P2 · wireframe Center-District city grid + fleet sparks
  { id: "polymorphic-agents", create: createPolymorphicAgents },       // P3 · liquid-metal crew shells, shatter-vortex on processing
  { id: "neural-drive-uplink", create: createNeuralDriveUplink },      // P4 · hover-mag Tiggo + 180° AR HUD on inVehicle
  { id: "omni-environment", create: createOmniEnvironment },           // P5 · bass-undulating walls + external crypto billboards
];
