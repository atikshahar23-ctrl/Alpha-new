# Combined single-origin deployment (Alpha + Heavy Guard simulator)

This document explains how to serve **Alpha-new** (this repo) from the same
Render web service that already hosts the **heavt-guard-simulator** API and
its `crypto-arb` frontend — so ראובן can call the trading API same-origin,
with no "Simulator URL" to type into Settings at all.

**GitHub Pages keeps working exactly as it does today.** Nothing here
changes the default `npm run build` / `npm run dev` behavior — this is a
second, optional build target.

## Why this works

`heavt-guard-simulator`'s `artifacts/api-server/src/app.ts` already serves
its own frontend as static files from the same Express server:

```js
const frontendDist = path.resolve(import.meta.dirname, "../../crypto-arb/dist/public");
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  ...
}
```

We add a second `express.static()` mount, at a distinct path prefix
(`/alpha`) so it never collides with `crypto-arb`'s routes.

## What's already done, here in Alpha-new

1. **`vite.config.ts`** — `base` and `build.outDir` now read from env vars
   (`VITE_BASE_PATH`, `VITE_OUT_DIR`), defaulting to the exact same values as
   before (`/Alpha-new/`, `dist`) when unset. The default `npm run build`
   is byte-for-byte unaffected.
2. **New script**: `npm run build:combined` — builds with
   `base=/alpha/` into `dist-combined/` instead of `dist/`, so it never
   clobbers the GitHub Pages output.
3. **`src/modules/simulatorBridge.ts`** — `getSimUrl()` now auto-detects the
   combined deployment: if no URL is manually configured in Settings *and*
   the app is running from a path starting with `/alpha/`, it defaults to
   `location.origin` (same-origin — no CORS, no manual URL). An explicit
   Settings override always still wins, and the standalone GitHub Pages
   build (path never starts with `/alpha/`) is completely unaffected —
   verified with a direct logic test covering all four cases (combined
   auto-detect, GH Pages standalone unconfigured, GH Pages standalone
   configured, and explicit override winning even under `/alpha/`).

## What you need to apply on the `heavt-guard-simulator` repo

I don't have access to that repo in this session, so these three changes
need to be applied there manually (or grant repo access in a future session
and I'll do it directly).

### 1. `artifacts/api-server/src/app.ts` — add the second static mount

Add this **right after** `app.use("/api", router);` and **before** the
existing `crypto-arb` block:

```js
// Serve the built Alpha-new personal assistant (combined single-origin
// deployment). Mounted at /alpha so it never collides with crypto-arb's
// routes or its own catch-all SPA fallback below. Built separately (see
// the buildCommand in render.yaml) and copied into
// artifacts/alpha-web/dist-combined before this server starts.
const alphaDist = path.resolve(import.meta.dirname, "../../alpha-web/dist-combined");
if (existsSync(alphaDist)) {
  app.use("/alpha", express.static(alphaDist));
}
```

(`existsSync` and `path` are already imported at the top of this file for
the `crypto-arb` block, so no new imports needed.)

### 2. `render.yaml` — build Alpha-new during the same deploy

Replace the `buildCommand` with:

```yaml
buildCommand: >-
  npm install -g pnpm &&
  pnpm install --config.minimumReleaseAge=0 &&
  pnpm run build &&
  git clone --depth 1 https://github.com/atikshahar23-ctrl/alpha-new.git /tmp/alpha-web-src &&
  (cd /tmp/alpha-web-src && npm install && npm run build:combined) &&
  mkdir -p artifacts/alpha-web &&
  cp -r /tmp/alpha-web-src/dist-combined artifacts/alpha-web/dist-combined
```

This clones the **public** Alpha-new repo fresh on every Render build (no
auth token needed), builds it with the combined-mode script, and drops the
output exactly where `app.ts` expects it.

**Operational note:** this means the combined deployment always serves
whatever is on Alpha-new's `main` branch **at the time of the simulator's
last Render build** — pushing to Alpha-new alone does *not* auto-update the
combined copy. You'd trigger a manual redeploy on Render (or wire up a
deploy hook) after a significant Alpha-new push if you want the combined
copy to pick it up.

### 3. Nothing else

No changes needed to `simulatorBridge.ts`'s consumers, Reuven's tool
definitions, or any existing standalone deployment — the auto-detection is
one-directional and additive.

## Result once deployed

- `https://poly-market-api.onrender.com/` → still the existing `crypto-arb` dashboard.
- `https://poly-market-api.onrender.com/alpha/` → the Alpha personal assistant, same origin as `/api`.
- `https://poly-market-api.onrender.com/alpha/agents.html` → the office sim / Reuven, with **zero manual Simulator URL setup** — `getSimUrl()` resolves to same-origin automatically.
- `https://atikshahar23-ctrl.github.io/Alpha-new/` → completely unaffected, keeps working exactly as it does today, still needs the manual URL for cross-origin calls to the simulator.
