# Alpha — Architecture & Gap Analysis ("Jarvis" roadmap)

> Snapshot of what the platform is today, the gap to the "extreme" assistant
> vision, and the order of operations to close it. Companion to the streaming
> work landed in `src/assistant/gemini.ts` (`askAIStream`).

## 1. What this platform is today

A **100% client-side static SPA** — no backend tier.

| Layer | Implementation | Files |
|---|---|---|
| Build / host | Vite + TS → static → GitHub Pages | `package.json`, `.github/workflows/deploy.yml` |
| UI / render | Three.js orb + canvas-2D FX + CSS | `src/orb/OrbScene.ts`, `src/effects/` |
| AI | Multi-provider `fetch` (Puter→Gemini→Grok→OpenAI) | `src/assistant/gemini.ts` |
| "Brain" | Keyword router + keyword-overlap recall | `src/brain/router.ts`, `src/brain/memory.ts` |
| Memory | `localStorage` only (200-fact cap) | `src/brain/memory.ts` |
| Voice | Web Speech API STT + `speechSynthesis` TTS | `src/assistant/voice.ts` |
| Vision | MediaPipe Hands (CDN) | `src/ui/app.ts` |
| Actions | `[[TAG:]]` post-response parsing | `gemini.ts` (`runTags`) |
| Business | HeavyGuard React app, WhatsApp `SX:` encoding | `heavyguard/App.jsx` |

**No** WebSocket, SSE (until streaming below), Web Workers, vector DB, or sandbox.

## 2. Gap checklist (✅ have · ⚠️ partial · ❌ missing)

**Core intelligence**
- ❌ Vector RAG — keyword overlap only. Swap seam: `recall()/buildContext()` in `memory.ts`.
- ❌ Self-correction / reflection — no critic pass.
- ⚠️ Proactive — `proactive.ts` only fires while tab is open; real triggers need a server worker + Web Push.

**API & automation**
- ❌ Trading WebSockets · ❌ Sandboxed code exec · ⚠️ social automation (text only).

**Multi-modal**
- ⚠️ Voice (Web Speech API; not low-latency / interruptible) · ❌ music gen · ❌ live screen vision.

**OS / device**
- ❌ Local terminal/files/OS · ❌ IoT (MQTT/Home Assistant). Both require a desktop shell — impossible from the web sandbox.

**Performance**
- ✅ GPU-friendly intent · ⚠️ 120Hz discipline (see §3) · ⚠️ streaming (just added for AI replies) · ❌ edge/Rust-Go services.

Self-test:
```bash
grep -rn "WebSocket\|EventSource\|getReader\|new Worker" src   # concurrency/streaming
grep -rn "embedding\|pgvector\|cosine" src                     # real RAG
# DevTools → Performance → record an interaction → long tasks >50ms / frames >8ms
```

## 3. 120Hz / zero-lag bottlenecks

8.3ms per frame at 120Hz. The killers here:
1. **Non-streaming AI** (now fixed for the chat path) — was the #1 perceived lag.
2. **Main-thread everything** — MediaPipe + gestures + Three.js + UI compete → move inference to a **Web Worker / OffscreenCanvas**.
3. **Synchronous `localStorage`** on hot paths → migrate to **IndexedDB** / debounced persistence.
4. **Layout-triggering animations** → keep to `transform`/`opacity`; `content-visibility:auto` for offscreen panels.
5. **HeavyGuard re-render storms** (2MB `leadsData`) → virtualize + code-split.

Rule: **main thread = render + input only.** Everything else → workers/server.

## 4. Target stack (evolve, don't replace)

- **Frontend:** keep Vite+TS+Three.js; add streaming, Web Workers, IndexedDB, OffscreenCanvas.
- **Edge/API:** Cloudflare Workers / Vercel Edge for SSE LLM proxy (hide keys, reflection passes, <200ms TTFT).
- **Heavy lifting:** Go (market-data WS fan-out) / Rust (Axum); Python (FastAPI) for agent orchestration + audio tools.
- **Data:** Postgres + pgvector (relational + vectors in one); Redis for agent↔UI pub/sub.
- **Realtime:** WebSocket (bidirectional) + SSE (token streams).
- **Sandbox:** E2B / Modal / Daytona (managed microVMs).
- **OS/IoT:** Tauri desktop shell + localhost bridge + MQTT/Home Assistant connector.
- **Voice:** Deepgram/Whisper-streaming (STT) + ElevenLabs/Cartesia (TTS) + VAD turn-taking.

## 5. Multi-agent architecture

**Orchestrator:** LangGraph (Python) behind a WebSocket gateway. The **System Commander = supervisor node**; the other agents = worker nodes. Stream each node's partial output to the UI over WS so nothing blocks.

```
Browser (Three.js UI)
  │  WebSocket (streamed tokens + agent status)
  ▼
Edge Gateway (auth, rate-limit, SSE→LLMs)
  │  Redis pub/sub
  ▼
LangGraph Supervisor = Agent 6 System Commander
  ├ Agent 1 Fleet/Project Architect   (Postgres: inventory, truck specs)
  ├ Agent 2 Sales/CRM (WhatsApp)       ← guardrail: REJECT 8-camera quotes
  ├ Agent 3 Marketing (TikTok/FB)
  ├ Agent 4 Trading/Finance Dev        (Go market-data WS)
  └ Agent 5 Audio/Music Producer
```

**HeavyGuard rule (no 8-camera systems):** enforce as a hard guardrail, not a prompt hint — a pre-flight validator node short-circuits with a polite redirect *before* any quote is drafted, plus a post-generation validator that blocks quotes referencing 8-cam configs. Enforcement point: the `HG_QUOTE`/`runTags` flow.

**Memory partitioning:** one pgvector table; every row tagged `{domain, agent_id, project_id}`. The existing `ModuleId` (`business|trading|creative|personal|general`) is the partition key. Each agent retrieves with a **mandatory metadata filter** (`WHERE domain='creative'`) so the Music agent can't see truck specs. A small `domain='global'` namespace holds shared facts. Maps onto the current `recall(query, limit, module)` signature.

**Async speed:** fire-and-stream (UI never blocks); run sub-agents concurrently (`asyncio.gather`/parallel branches); browser stays a thin client rendering streamed deltas; coalesce WS messages to one paint per `requestAnimationFrame` (backpressure).

## 6. Order of operations

1. ✅ **Stream AI replies** (SSE) — done (`askAIStream`).
2. Move MediaPipe + persistence off the main thread (Worker + IndexedDB).
3. Edge endpoint + Postgres/pgvector; migrate `memory.ts` recall to embeddings.
4. LangGraph supervisor with 2 agents over WebSocket; prove streaming-status UX.
5. Tauri shell for OS/file/terminal/IoT (Agent 6 core).
6. Sandbox code-exec, realtime voice, social automation as separate services.

**Caveats:** 120Hz is realistic for UI/animation, not for LLM round-trips (there, *stream* so it feels instant). OS/IoT control cannot come from the web app — it needs the desktop shell.
