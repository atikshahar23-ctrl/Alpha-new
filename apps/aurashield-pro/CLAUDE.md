# AuraShield Pro — project conventions

Cyberpunk instrument console. React 18 + Vite + Tailwind v3. No TypeScript,
no router, no state library — plain hooks. Keep it that way unless asked.

## Commands

```bash
npm run dev       # localhost:3000
npm run build     # vite build
npm run preview   # serve dist
```

There is no test runner and no linter configured. Don't add one unprompted.

## The one rule that matters

Two hooks produce **generated** data, not measurements:

- `useCoherenceSim` — mean-reverting random walk. The "quantum coherence"
  percentage and every drain alert come from here. No biometric hardware is
  read. Nothing about the user's body is measured.
- `useAnomalyField` — pseudo-random contacts. Real part is only the frame of
  reference (each contact holds a fixed compass bearing).

`ProvenancePanel.jsx` classifies every readout as HARDWARE or GENERATED, and
the `SIM` badge in `StatusBar` opens it. **Do not remove the badge, the
provenance panel, or the footer disclosure link. Do not relabel generated
output as measured, detected, or scanned in user-facing copy.** The in-code
`[SIMULATED]` comment headers stay.

This is a novelty/aesthetic project. It stays honest about what it is.

## Genuinely real

- `useDeviceOrientation` — live accelerometer/magnetometer
- `useAudioEngine` — Web Audio oscillators at exactly 396/432/528 Hz, and the
  oscilloscope draws real `AnalyserNode` time-domain data
- `useCamera` — live `getUserMedia`, processed on-device, never transmitted

## Architecture notes

- **Radar contacts are pinned to world bearings.** Rendered at
  `bearing − heading`, so the field stays fixed in the room as the device
  turns. This is the signature behaviour — don't refactor it into
  screen-space positioning.
- **Aura glow is CSS compositing, not pixel work.** Same `MediaStream` on two
  `<video>` elements: saturated base + blurred screen-blended copy. Never
  replace with per-frame canvas processing; it won't hold frame rate on mobile.
- **Instruments are coupled.** `audio.engaged` → `shielded` raises the
  coherence attractor and suppresses contact spawn rate. Keep the feedback loop.
- `useDeviceOrientation` publishes at ~30fps from a single rAF loop reading a
  ref. Don't put sensor values directly in state — it re-renders at 60fps.
- Hook returns are `useMemo`'d and `KirlianFeed`/`ScalarJammer`/`LooshMonitor`
  are `React.memo`'d. Adding an unmemoized field to a hook return breaks this.

## Design tokens

Defined in `tailwind.config.js`, never hardcode hex in components except in
SVG/canvas fills where Tailwind can't reach.

| Token | Value | Role |
|---|---|---|
| `void` | `#000000` | base |
| `phosphor` | `#39ff14` | primary / nominal |
| `violet-deep` / `violet-glow` | `#4c0f7a` / `#a855f7` | structure, ambient |
| `amber-alert` | `#ffb000` | degraded |
| `blood` | `#ff2d55` | critical only |

Type: Chakra Petch (display) + JetBrains Mono (data). Signature move is 10px
wide-tracked uppercase labels against large tight tabular numerals. Use the
`.label` / `.readout` component classes in `index.css` rather than respelling
the utility chains.

All user-facing copy lives in `lib/constants.js` (`ANOMALY_CLASSES`,
`DRAIN_ALERTS`, `RECOVERY_LINES`, `BOOT_SEQUENCE`). Add strings there, not
inline in components.

## Accessibility floor

`prefers-reduced-motion` kills scanlines, the radar sweep, and the boot
animation while data stays live. Focus rings visible. Audio master gain capped
at 0.22 — sustained pure tones fatigue fast. Don't raise the cap.

## Browser constraints

`getUserMedia` and `DeviceOrientationEvent` are secure-context only —
`localhost` or `https://`. iOS 13+ requires `DeviceOrientationEvent
.requestPermission()` called synchronously from a user gesture, or it rejects.
Every permission grant must stay behind an explicit button.
