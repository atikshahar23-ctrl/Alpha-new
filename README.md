# Alpha Assistant

A futuristic personal AI assistant: Gemini-powered chat, voice in/out, a
hands-free "Hey Alpha" wake word, a local calendar the assistant manages,
in-app video/search windows, soft Japanese-koto sound design — and a custom
WebGL orb with a real procedural fire+water shader at its core, orbited by a
holographic data-network shell.

Built with **TypeScript + Vite + Three.js** — a real modular codebase
(`src/orb`, `src/assistant`, `src/ui`), not a single HTML file.

## Apps in this repo

This is a multi-app suite, all built and deployed together from one Vite
config (`vite.config.ts`) and served as static files under one origin:

| Entry point | App | Who it's for |
|---|---|---|
| `index.html` | **Alpha** — the main 3D assistant (orb, voice, HUD/dock) | Owner |
| `agent.html` | **Itai's CRM** — leads, deals, customers, showroom, Samsonix forms | Owner + Itai (external salesperson, link-only access) |
| `heavyguard.html` | **HeavyGuard OS** — installation logging, pricing, fleet/vehicle, finance | Owner (operations) |
| `agents.html` | **Agents Command Center** — a team of 12 AI agents (named after the tribes of Israel) with individual chats, a live office simulator, a dev console that can open real GitHub PRs/Issues, and a live business-knowledge layer | Owner only |
| `widget.html` / `chat-widget.html` | Small embeddable task/chat widgets | External (embed on a site) |

**Owner-vs-external boundary:** `agent.html` is the only app meant to be
shared externally (with Itai). It must never link or redirect into the other
apps — see the comment on `exitToAlpha` in `agent/App.jsx`. The Agents
Command Center also runs its own, separate cloud-sync config
(`agents/cloud.js`, key `alpha:owner:fbconfig`) from the CRM's shared one
(`agent/cloud.js`, key `itai:fbconfig`), so Itai's CRM access never
implicitly unlocks owner-only data.

## Run locally

```bash
npm install
npm run dev
```

Open the printed `http://localhost:5173` URL. The microphone and the
"Hey Alpha" wake word only work over `https://` or `localhost` — never when
opening a file directly — so always use `npm run dev` or a deployed link.

## Build

```bash
npm run build
```

Outputs static files to `dist/`. This is sometimes only an `.html` file by
necessity (every website needs one HTML entry point — even GitHub Pages
itself ultimately serves HTML/CSS/JS) but unlike before, that file is now
just a thin entry point; all real logic lives in the TypeScript modules.

## Deploy to GitHub Pages

This repo includes `.github/workflows/deploy.yml`, which auto-builds and
deploys on every push to `main`.

1. Push this project to a new GitHub repository.
2. In the repo: **Settings → Pages → Source → GitHub Actions**.
3. Push to `main` — the included workflow builds and deploys automatically.
4. Your app will be live at `https://<username>.github.io/<repo-name>/`.

If you deploy under a sub-path like the URL above, that's already handled —
`vite.config.ts` uses a relative `base: './'`, so it works at any path
without edits.

## Configuration (in-app)

Click **⚙ SETTINGS** to set:
- Your free Gemini API key — get one at <https://aistudio.google.com/apikey>.
  Stored only in your browser's local storage, never sent anywhere else.
- Microphone language and reply language (English or Hebrew), independently.
- Voice (auto-picks the most natural one available, with a manual picker).
- Background ambient volume (0 = off).

## Project structure

```
src/                    Main Alpha assistant (index.html)
  orb/
    OrbScene.ts        Three.js scene: fire+water shader core + network shell
    fireWaterShader.ts Custom GLSL vertex/fragment shaders
  assistant/
    state.ts           Persisted app state + local calendar storage
    gemini.ts          Gemini API calls + in-reply control tags
    voice.ts           Speech recognition, wake word, text-to-speech
    audio.ts           Japanese-koto sound effects + ambient pad
  ui/
    app.ts             DOM construction and event wiring
  style.css
  main.ts              Entry point

agent/                  Itai's CRM (agent.html) — React, leads/deals/customers
heavyguard/              HeavyGuard OS (heavyguard.html) — React, install logging
agents/                  Agents Command Center (agents.html) — React, 12 AI agents
```

## Notes on the orb

The core sphere uses a single custom fragment shader (`fireWaterShader.ts`)
that procedurally generates rising, turbulent fire on one hemisphere and
rippling, caustic-like water on the other, blended across a noisy boundary —
real shader-driven simulation, not colored particles standing in for it.

The renderer clears every frame to the exact same color as the page
background (`#04060d`) instead of relying on canvas alpha transparency. Some
mobile browsers/WebViews silently fail to grant a true alpha-enabled WebGL
context, which causes a visible opaque square. Matching the clear color
sidesteps that bug reliably across devices.
