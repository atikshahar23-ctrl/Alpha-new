# CLAUDE.md — patterns for working in this repo

Guidance for future Claude Code sessions on `agents/Office3D.jsx` (the 3D
office simulator) and related files. See `ARCHITECTURE.md` for the
platform-wide gap analysis; this file is narrower — hard-won conventions
that aren't obvious from reading the code cold.

## Branches & deploy

Standing convention this repo has followed across sessions: develop on the
feature branch, then fast-forward-merge and push the same commits to
`main` too, so GitHub Pages picks them up without a separate PR/merge step.
Always `npx tsc --noEmit -p .` and `npm run build` clean before committing.

## Office3D.jsx twin-stick control scheme

**Right stick / right touch joystick = movement (`joyVec`). Left stick /
left touch joystick = camera (`turnVec`).** This is the opposite of the
initial left=move/right=look layout and was corrected twice by explicit
user feedback — do not swap it back without being asked again.

Third-person movement is **camera-relative**: raw input (keys + joystick)
is rotated by the camera's own azimuth (`camAz`) before being applied to
position, so "forward" always means "away from the camera," matching
standard third-person game controls. Player rotation in third person is
driven only by auto-facing the direction of travel (`atan2`), never
directly by stick input — the camera orbit (`camAz`/`camEl`, plain closure
vars, not React state) is fully decoupled from player facing. First-person
and vehicle-seated controls are a separate, already-relative code path and
don't need this rotation.

## Gamepad input — the phantom-connection trap

`navigator.getGamepads()` can return stale/phantom entries reporting
`connected: true` with drifting axis values even when no controller was
ever paired (seen with some Bluetooth/OS combinations) — blindly grabbing
"any connected-looking pad" walks the player on its own. Always gate on a
real `gamepadconnected` event (plus one `mapping === "standard"` check for
a pad already connected before mount) and track its `index`:

```js
let gamepadIndex = null;
const onGpConnect = (e) => { gamepadIndex = e.gamepad.index; };
const onGpDisconnect = (e) => { if (gamepadIndex === e.gamepad.index) gamepadIndex = null; };
window.addEventListener("gamepadconnected", onGpConnect);
window.addEventListener("gamepaddisconnected", onGpDisconnect);
try {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  for (const g of pads) { if (g && g.connected && g.mapping === "standard") { gamepadIndex = g.index; break; } }
} catch {}
// then: const gp = gamepadIndex !== null ? navigator.getGamepads()[gamepadIndex] : null;
```

Don't forget to remove both listeners in the effect's cleanup.

## Two-phase loading overlays

A loading veil that drops the instant network downloads resolve (GLB
models, textures) is dropping too early — the *construction* of the scene
(floor, walls, NPC rigging, shader materials, physics setup) can take
meaningfully longer than the download and runs after `Promise.all`
resolves. Split into a `download` phase and a `build` phase, and only call
the final `setLoadPct(null)` (or equivalent) immediately before
`renderer.setAnimationLoop(animate)` — the true end of one-time setup, not
right after assets land. Same pattern applies to `index.html`'s intro/
fast-boot veils, gated on `window.__alphaReady` (set once by `src/ui/app.ts`
after its first real HUD/data render pass).

## Three.js cleanup — dispose every texture slot, not just `.map`

GLTF-loaded models (character/robot/Sophia/Pokemon templates) carry a full
PBR texture set: `map`, `normalMap`, `roughnessMap`, `metalnessMap`,
`emissiveMap`, `aoMap`, `alphaMap`. A cleanup loop that only frees `.map`
leaks the rest on every unmount. Use the shared `disposeMaterial(m)`
helper (defined once, right after `applyAniso`, near the top of
`Office3D.jsx`) in every scene's teardown `scene.traverse` pass instead of
disposing `.map` by hand:

```js
scene.traverse((obj) => {
  if (obj.geometry) obj.geometry.dispose();
  if (obj.material) (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(disposeMaterial);
});
```

Every overlay component (`SpaceOverlay`, `FlightOverlay`, `HangarOverlay`)
and the main scene each run their own independent Three.js scene/camera/
renderer with their own mount effect and cleanup — when adding a new
overlay, give it the same full `scene.traverse` dispose pass rather than
naming individual meshes by hand (easy to forget one, as `SpaceOverlay`'s
planets/rings/sun originally were).

## Overlay-vs-main-scene render pausing

`inHangar` / `inFlight` / `inSpace` gate which overlay is shown, but the
MAIN office scene's `animate()` loop must also **early-return** while any
of them is active (`if (liveRef.current.inHangar || liveRef.current.inFlight
|| liveRef.current.inSpace) return;` right after the delta-time calls) —
otherwise it keeps fully simulating and rendering (SSAO, bloom, shaders,
NPC AI) behind the overlay, invisible but still competing for the GPU.
Each of the three flags needs a `useEffect` mirroring it onto
`liveRef.current` — it's easy to add a new overlay flag as React state
without remembering to also mirror it (this happened once with `inSpace`).

## API rate-limit queue (`agents/App.jsx`)

`LLMQueueService` (Claude/Groq/LM Studio) is a strict FIFO with a per-
provider minimum delay and exponential backoff on 429 — the request stays
at the front of its queue and is retried in place rather than dropped.
`src/assistant/gemini.ts` (the separate main-dashboard assistant) uses a
different, equally valid strategy instead: provider rotation + per-model
cooldown parking on 429, rather than retry-with-backoff. Don't conflate
the two systems — they serve different UI surfaces and aren't meant to
share a queue.
