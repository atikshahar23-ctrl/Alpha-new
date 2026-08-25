# Maintenance Report

Scoped audit/repair pass over `agents/Office3D.jsx`, `agents/App.jsx`, and
related files, run interactively (verified and committed in reviewable
batches, not as an unsupervised autonomous run).

## Fixed

### 1. Three.js memory leaks

- **Missing PBR texture-slot disposal.** Every scene's unmount cleanup only
  ever disposed `material.map`. GLTF-loaded character/robot/Sophia/Pokemon
  models carry a full texture set (`normalMap`, `roughnessMap`,
  `metalnessMap`, `emissiveMap`, `aoMap`, `alphaMap`) that was never freed —
  leaking every time the simulator unmounted. Added a shared
  `disposeMaterial()` helper (next to the existing `applyAniso()`) that
  disposes every known slot, and swapped it into all three existing
  cleanup sites (main scene, `FlightOverlay`, `HangarOverlay`).
- **`SpaceOverlay` never disposed most of its own scene.** Only the two
  particle-field geometries (`starGeo`/`nebGeo`) were freed on unmount —
  not their materials, and not the sun, the 3 data-stream rings, or all 5
  planets + their 5 orbit rings (10+ more geometry/material pairs). Every
  visit to the Space portal was leaking a full scene's worth of GPU
  buffers. Replaced the two manual `.dispose()` calls with a full
  `scene.traverse` pass using the same shared helper.

### 2. React re-renders (`agents/App.jsx`, roster view)

`actsFor(id)` ran a fresh `activity.filter()` per team member on every
render of the roster view (13 full scans of the same array), several
times a minute from `App()`'s various polling intervals, even when the
underlying activity log hadn't changed. Replaced with a single `useMemo`
grouping pass (`actsByAgent`), keyed on the `activity` array itself — one
O(n) pass instead of 13 per render, with a stable per-agent array
reference. Deliberately **not** wrapping `AgentCube` itself in
`React.memo`: its "recently executed" glow depends on `Date.now()` versus
the agent's last activity timestamp, and memoizing the component would
freeze that glow until an unrelated prop changed, silently breaking a
real feature. Also had to check `AgentPanel`'s use of the same data (it
reads `acts.length` for a total count and `acts.slice(0,7)`) before
capping the memoized arrays anywhere — an initial top-3-only cap would
have quietly broken that panel's count and list.

### 3. Skills folder cleanup

Deleted the top-level `SKILL.md/` directory — 14 raw `.skill` zip uploads
that were already unpacked into `.claude/skills/*/SKILL.md` by an earlier
commit ("Wire uploaded skill packages into .claude/skills/"). Verified
contents matched before deleting (unzipped one, diffed against its
`.claude/skills/` counterpart).

### 4. Docs

- Added `CLAUDE.md` — patterns learned this session that aren't obvious
  from reading the code cold (twin-stick control mapping, camera-relative
  movement, the gamepad phantom-connection guard, the two-phase loading
  pattern, the texture-disposal gap above, the overlay-vs-main-scene
  render-pause requirement, and the two independent 429-handling systems).
- This report.

## Investigated, no change needed

- **UV Nightclub Mode / global illumination.** Traced every
  `nightclubOn`-dependent value (sky/fog color, sun/ambient intensity,
  interior lights, hologram globe emissive, charging-pod colors, bloom
  radius). All of them re-target every frame from the current flag state
  via exponential-smoothing lerps (`x += (target - x) * k`), so toggling
  on/off converges cleanly either direction with no persistent state to
  corrupt. No fix applied.
- **API 429 handling.** `LLMQueueService` (Claude/Groq/LM Studio in
  `agents/App.jsx`) is a strict FIFO with per-provider minimum delay,
  exponential backoff, and a retry cap; 429 detection correctly matches
  both raw-fetch errors (Groq) and `Anthropic.APIError.status` (Claude
  SDK). `src/assistant/gemini.ts` (a separate system, for the main
  dashboard assistant) uses provider rotation + per-model cooldown parking
  instead of retry-with-backoff — an intentionally different, equally
  valid strategy for a different UI surface. Left both as-is.
- **Xbox/PS joystick deadzone.** Already addressed earlier this session
  (the phantom-gamepad-connection fix, described above and now in
  `CLAUDE.md`) plus a cubic response curve added to the flight overlay's
  gamepad input. No further gap found.

## Not done (out of scope for this pass)

- No external physics engine (Cannon-es/Rapier) or terrain LOD system —
  nothing else in this app pulls one in; that would be a large, separate
  undertaking disproportionate to one arcade flight mini-mode.
- Anisotropic filtering for distant textures was already implemented
  earlier this session (`MAX_ANISO`/`applyAniso()`), applied to every
  loaded character/robot/Sophia template — re-verified as part of this
  pass, no gap found.
