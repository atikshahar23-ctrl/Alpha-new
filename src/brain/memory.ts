// ============================================================
// Master Brain — Long-Term Memory
// Client-side, token-budgeted memory store that survives reloads.
// Designed so it can later be swapped for a server-side vector DB:
// the public surface (remember / recall / buildContext) stays the same.
// ============================================================

export type ModuleId = 'business' | 'trading' | 'creative' | 'personal' | 'general';

export interface MemoryFact {
  id: string;
  text: string;
  module: ModuleId;
  ts: number;
  weight: number; // importance 0..1, decays with age when scoring
}

export interface MemoryProject {
  id: string;
  module: ModuleId;
  title: string;
  status: 'active' | 'paused' | 'done';
  notes: string;
  ts: number;
}

export interface MemoryProfile {
  name: string;
  role: string;
  business: string;
  location: string;
  preferences: string[];
}

export interface BrainMemory {
  profile: MemoryProfile;
  facts: MemoryFact[];
  projects: MemoryProject[];
  summary: string; // rolling conversation summary
  updated: number;
}

const KEY = 'alpha_brain_memory_v1';
const MAX_FACTS = 200;

function blank(): BrainMemory {
  return {
    profile: { name: '', role: '', business: '', location: '', preferences: [] },
    facts: [],
    projects: [],
    summary: '',
    updated: Date.now(),
  };
}

let cache: BrainMemory | null = null;

export function loadMemory(): BrainMemory {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BrainMemory;
      cache = { ...blank(), ...parsed, profile: { ...blank().profile, ...parsed.profile } };
      return cache;
    }
  } catch {}
  cache = blank();
  return cache;
}

export function saveMemory(m: BrainMemory) {
  m.updated = Date.now();
  cache = m;
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch {}
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Facts ──────────────────────────────────────────────
export function remember(text: string, module: ModuleId = 'general', weight = 0.6) {
  const clean = text.trim();
  if (!clean) return;
  const m = loadMemory();
  // de-dup near-identical facts
  const norm = clean.toLowerCase();
  if (m.facts.some(f => f.text.toLowerCase() === norm)) return;
  m.facts.unshift({ id: uid(), text: clean, module, ts: Date.now(), weight });
  if (m.facts.length > MAX_FACTS) m.facts.length = MAX_FACTS;
  saveMemory(m);
}

export function forgetFact(id: string) {
  const m = loadMemory();
  m.facts = m.facts.filter(f => f.id !== id);
  saveMemory(m);
}

// Recall the most relevant facts for a query using lightweight scoring:
// term overlap + importance weight + recency. Stand-in for vector search.
export function recall(query: string, limit = 6, module?: ModuleId): MemoryFact[] {
  const m = loadMemory();
  const terms = tokenize(query);
  const now = Date.now();
  const scored = m.facts.map(f => {
    const fterms = tokenize(f.text);
    let overlap = 0;
    for (const t of terms) if (fterms.includes(t)) overlap++;
    const ageDays = (now - f.ts) / 86_400_000;
    const recency = Math.exp(-ageDays / 45); // ~45-day half-life-ish decay
    const moduleBoost = module && f.module === module ? 0.5 : 0;
    const score = overlap * 1.0 + f.weight * 0.8 + recency * 0.4 + moduleBoost;
    return { f, score };
  });
  return scored
    .filter(s => s.score > 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.f);
}

function tokenize(s: string): string[] {
  return s.toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

// ── Projects ───────────────────────────────────────────
export function addProject(title: string, module: ModuleId, notes = ''): MemoryProject {
  const m = loadMemory();
  const p: MemoryProject = { id: uid(), module, title: title.trim(), status: 'active', notes, ts: Date.now() };
  m.projects.unshift(p);
  saveMemory(m);
  return p;
}
export function updateProject(id: string, patch: Partial<MemoryProject>) {
  const m = loadMemory();
  const p = m.projects.find(x => x.id === id);
  if (p) { Object.assign(p, patch); saveMemory(m); }
}
export function removeProject(id: string) {
  const m = loadMemory();
  m.projects = m.projects.filter(p => p.id !== id);
  saveMemory(m);
}

// ── Profile ────────────────────────────────────────────
export function updateProfile(patch: Partial<MemoryProfile>) {
  const m = loadMemory();
  m.profile = { ...m.profile, ...patch };
  saveMemory(m);
}

// ── Rolling summary ────────────────────────────────────
// Keeps a compact running summary so old turns can be dropped from the
// token window without losing the thread.
export function setSummary(s: string) {
  const m = loadMemory();
  m.summary = s.slice(0, 1200);
  saveMemory(m);
}

// ── Context builder ────────────────────────────────────
// Produces a compact, token-budgeted memory block for the system prompt.
export function buildMemoryContext(query: string, module: ModuleId, charBudget = 1400): string {
  const m = loadMemory();
  const parts: string[] = [];

  const p = m.profile;
  const profileBits = [
    p.name && `name: ${p.name}`,
    p.role && `role: ${p.role}`,
    p.business && `business: ${p.business}`,
    p.location && `location: ${p.location}`,
    p.preferences.length && `prefs: ${p.preferences.join(', ')}`,
  ].filter(Boolean);
  if (profileBits.length) parts.push(`USER PROFILE — ${profileBits.join('; ')}.`);
  if (p.name) parts.push(`Address the user warmly by their name ("${p.name}") naturally in replies, without overusing it.`);

  const active = m.projects.filter(x => x.status === 'active').slice(0, 8);
  if (active.length) {
    parts.push('ACTIVE PROJECTS — ' + active.map(x => `[${x.module}] ${x.title}${x.notes ? ' (' + x.notes + ')' : ''}`).join('; ') + '.');
  }

  const facts = recall(query, 8, module);
  if (facts.length) {
    parts.push('RELEVANT MEMORY — ' + facts.map(f => f.text).join(' • ') + '.');
  }

  if (m.summary) parts.push('CONVERSATION SO FAR — ' + m.summary);

  let out = parts.join('\n');
  if (out.length > charBudget) out = out.slice(0, charBudget) + '…';
  return out;
}

export function clearMemory() {
  cache = blank();
  try { localStorage.removeItem(KEY); } catch {}
}

// ── Automatic fact extraction ──────────────────────────
// Heuristic capture of durable facts from the user's own messages, in
// English + Hebrew. Cheap, deterministic, no extra LLM call.
const FACT_TRIGGERS: RegExp[] = [
  /\b(?:remember that|note that|keep in mind|for the record)\b\s+(.+)/i,
  /\b(?:my|i'm|i am|i prefer|i like|i work|i drive|i own)\b.+/i,
  /\b(?:תזכור ש|תזכרי ש|זכור ש|שים לב ש|לידיעתך)\b\s*(.+)/,
  /\b(?:אני|שלי|אני מעדיף|אני אוהב|אני עובד|אני נוהג)\b.+/,
];

export function autoCapture(userText: string, module: ModuleId): string | null {
  const t = userText.trim();
  if (t.length < 6 || t.length > 240) return null;
  for (const re of FACT_TRIGGERS) {
    const m = re.exec(t);
    if (m) {
      const captured = (m[1] || m[0]).trim();
      const before = loadMemory().facts.length;
      remember(captured, module, 0.7);
      // Only report it as newly captured if it wasn't a duplicate.
      return loadMemory().facts.length > before ? captured : null;
    }
  }
  return null;
}
