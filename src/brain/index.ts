// ============================================================
// Master Brain — Central Orchestrator
// The single entry point the app calls before every AI request.
// Routes intent → activates a module → assembles token-budgeted context
// (profile + projects + relevant memory + rolling summary) → returns the
// extra system-prompt block. Also captures durable facts automatically.
// ============================================================
import { route, getActiveModule } from './router';
import { buildMemoryContext, autoCapture, setSummary, loadMemory, type ModuleId } from './memory';
import { moduleById } from './modules';
import { liveSnapshot } from '../modules/snapshot';

export * from './memory';
export * from './modules';
export { route, getActiveModule, setActiveModule } from './router';

let injectedContext = '';

// Called by the app before askAI(). Returns the routing decision so the UI
// can reflect the active module.
export function orchestrate(userText: string): { module: ModuleId; switched: boolean; confidence: number } {
  const r = route(userText);
  const mod = moduleById(r.module);

  // Auto-capture durable facts from the user's own words.
  autoCapture(userText, r.module);

  // Assemble the brain block injected into the system prompt.
  const memBlock = buildMemoryContext(userText, r.module);
  const snapshot = liveSnapshot(r.module);
  const fragment = mod ? mod.systemFragment : '';
  injectedContext = [fragment, snapshot, memBlock].filter(Boolean).join('\n\n');

  return { module: r.module, switched: r.switched, confidence: r.confidence };
}

// Read by gemini.systemPrompt() to extend the prompt without a circular dep.
export function getBrainContext(): string {
  return injectedContext;
}

// Maintain a compact rolling summary from history so old turns can drop out
// of the token window. Deterministic + cheap (no extra LLM call): keeps the
// last few user intents as a breadcrumb trail.
export function refreshSummary(history: { role: string; parts: { text: string }[] }[]) {
  const userTurns = history.filter(h => h.role === 'user').slice(-6);
  if (!userTurns.length) return;
  const trail = userTurns
    .map(h => h.parts.map(p => p.text).join(' ').slice(0, 80))
    .join(' → ');
  setSummary(trail);
}

export function brainStats() {
  const m = loadMemory();
  return {
    facts: m.facts.length,
    projects: m.projects.filter(p => p.status === 'active').length,
    module: getActiveModule(),
  };
}
