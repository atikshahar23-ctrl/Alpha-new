# Second deployment: standalone Render Static Site + API Rewrite Rule

This document explains how to also serve **Alpha-new** from a Render Static
Site in the same Render project as the trading simulator, with a Rewrite
Rule proxying `/api/*` to the simulator's Node service — so ראובן can reach
the trading API same-origin, with **no manual "Simulator URL" setup** and
**no changes to the simulator's own repo/code at all**.

**GitHub Pages keeps working exactly as it does today** — this is a second,
optional, independent build target. Nothing here changes the default
`npm run build` / `npm run dev` behavior.

## Why this approach (and not the earlier one)

An earlier version of this document described modifying
`heavt-guard-simulator`'s `app.ts` and `render.yaml` to serve Alpha-new from
inside the same Node service. That assumed the simulator's frontend
(`crypto-arb`) is served *by* that Node service. In practice, the Render
project actually has **three separate services**:

- `heavt-guard-simulator` — the real Node API backend.
- `heavt-guard-simulator-1` — a separate Render **Static Site** (same repo,
  different service), with **no** Redirect/Rewrite rules configured today.
- `po` — a PostgreSQL database.

Since the frontend is already a standalone Static Site in this setup, the
simplest and lowest-risk path is to add **another** standalone Static Site
for Alpha-new, right next to it — using the exact same Render feature
(Rewrite Rules) that `heavt-guard-simulator-1` already has available but
isn't using. **No code changes in the simulator's repo are needed at all.**

## What's already done, here in Alpha-new

1. **`vite.config.ts`** — `base`/`build.outDir` are overridable via env
   vars (unchanged from before), plus a new compile-time `define`:
   `__COMBINED_DEPLOY__`, controlled by `VITE_COMBINED_DEPLOY=1`. All three
   default to the exact current values when unset — the default
   `npm run build` (GitHub Pages) is completely unaffected.
2. **New script**: `npm run build:render` — builds with `base=/` (a
   standalone site needs no sub-path prefix) into `dist-render/`, with
   `__COMBINED_DEPLOY__` baked in as `true`.
3. **`src/modules/simulatorBridge.ts`** — `getSimUrl()` now checks the
   compile-time flag: if no URL is manually configured in Settings *and*
   this is a `build:render` build, it defaults to `location.origin` (same
   origin as the site itself — correct once the Rewrite Rule below is in
   place). An explicit Settings override always still wins. The default
   GitHub Pages build never sets the flag, so it's completely unaffected.

## What you need to do on Render (dashboard only, no code)

### 1. Create a new Static Site

In the same Render project ("Heavy guard trading sim bots"):

- **New → Static Site**
- Connect it to the **`atikshahar23-ctrl/alpha-new`** GitHub repo (this
  repo), branch `main`.
- **Build Command:** `npm install && npm run build:render`
- **Publish Directory:** `dist-render`

Render will give it its own `something.onrender.com` URL.

### 2. Add one Rewrite Rule on that new site

On the new static site's page → **Redirect and Rewrite Rules** → **Add
Rule** (the same screen you already saw on `heavt-guard-simulator-1`):

- **Source:** `/api/*`
- **Destination:** `https://heavt-guard-simulator.onrender.com/api/*`
  (the **Node** service's URL — not the `-1` static one)
- **Action:** **Rewrite** (not Redirect — a Rewrite proxies transparently
  so the browser's address bar never changes and it stays same-origin;
  a Redirect would send the browser to a different domain, defeating the
  whole point)

Save. Render will redeploy the rule immediately (no rebuild needed for a
rule change).

### 3. Nothing else

No changes needed in the simulator's repo, `app.ts`, or `render.yaml` at
all.

## Result once deployed

- The new Static Site's URL (e.g. `https://alpha-new-xyz.onrender.com/`) →
  the Alpha personal assistant.
- `.../agents.html` → the office sim / Reuven, with **zero manual
  Simulator URL setup** — `getSimUrl()` resolves to same-origin
  automatically, and `/api/*` calls are transparently proxied to the real
  Node service by the Rewrite Rule.
- `https://atikshahar23-ctrl.github.io/Alpha-new/` → completely
  unaffected, keeps working exactly as it does today.
