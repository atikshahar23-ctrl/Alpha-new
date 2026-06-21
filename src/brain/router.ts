// ============================================================
// Master Brain — Semantic Router
// Deterministic, multilingual intent router. Scores a query against each
// module's weighted vocabulary and picks the strongest. Fast, offline,
// no extra LLM round-trip. Sticky: keeps the last module on ambiguous
// follow-ups so multi-turn threads don't thrash between worlds.
// ============================================================
import type { ModuleId } from './memory';
import { MODULE_LIST } from './modules';

export interface RouteResult {
  module: ModuleId;
  confidence: number;          // 0..1
  scores: Record<string, number>;
  switched: boolean;           // did the active module change?
}

let lastModule: ModuleId = 'general';

const STICKY_THRESHOLD = 1.2;  // below this, keep previous module

export function getActiveModule(): ModuleId {
  return lastModule;
}

export function setActiveModule(m: ModuleId) {
  lastModule = m;
}

export function route(query: string): RouteResult {
  const q = query.toLowerCase();
  const scores: Record<string, number> = {};

  for (const mod of MODULE_LIST) {
    let s = 0;
    for (const [kw, w] of Object.entries(mod.keywords)) {
      if (q.includes(kw.toLowerCase())) s += w;
    }
    scores[mod.id] = s;
  }

  // best module by score
  let bestId: ModuleId = 'general';
  let best = 0;
  for (const [id, s] of Object.entries(scores)) {
    if (s > best) { best = s; bestId = id as ModuleId; }
  }

  let chosen: ModuleId;
  if (best >= STICKY_THRESHOLD) {
    chosen = bestId;
  } else if (best > 0 && lastModule !== 'general') {
    // weak signal on a follow-up — stay where we are
    chosen = lastModule;
  } else if (best > 0) {
    chosen = bestId;
  } else {
    chosen = lastModule; // no signal — continue in current context
  }

  // confidence = margin between top and runner-up, normalized
  const sorted = Object.values(scores).sort((a, b) => b - a);
  const margin = (sorted[0] || 0) - (sorted[1] || 0);
  const confidence = Math.max(0, Math.min(1, (best > 0 ? 0.4 : 0) + margin / 6));

  const switched = chosen !== lastModule;
  lastModule = chosen;

  return { module: chosen, confidence, scores, switched };
}
