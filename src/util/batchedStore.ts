// ============================================================
// Batched, write-through localStorage.
// Reads come from an in-memory cache, and a burst of writes (e.g. dragging a
// transform slider, which fires on every input event) updates that cache
// instantly and coalesces the actual JSON.stringify + localStorage.setItem
// into a single idle-time flush. This keeps synchronous storage IO off the
// main thread during interactions, protecting the 120Hz frame budget.
//
// Persistence is still guaranteed: dirty keys are flushed synchronously on
// pagehide / tab-hide, so nothing is lost if the page closes before idle.
// ============================================================

const cache = new Map<string, unknown>();
const dirty = new Set<string>();
let flushScheduled = false;

function flush(): void {
  flushScheduled = false;
  for (const key of dirty) {
    try { localStorage.setItem(key, JSON.stringify(cache.get(key))); } catch {}
  }
  dirty.clear();
}

function scheduleFlush(): void {
  if (flushScheduled) return;
  flushScheduled = true;
  const ric = (window as any).requestIdleCallback as
    | ((cb: () => void, opts?: { timeout: number }) => number)
    | undefined;
  if (ric) ric(flush, { timeout: 500 });
  else setTimeout(flush, 150);
}

/** Read a JSON object/value, served from the in-memory cache after first load. */
export function readObj<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  try {
    const raw = localStorage.getItem(key);
    const v = raw ? (JSON.parse(raw) as T) : fallback;
    cache.set(key, v);
    return v;
  } catch {
    cache.set(key, fallback);
    return fallback;
  }
}

/** Update the cache instantly and schedule a coalesced persist (non-blocking). */
export function writeObj(key: string, value: unknown): void {
  cache.set(key, value);
  dirty.add(key);
  scheduleFlush();
}

/** Force any pending writes to disk now (e.g. before navigation). */
export function flushNow(): void {
  if (dirty.size) flush();
}

// Never lose data: persist synchronously when the tab is hidden or closing.
if (typeof window !== 'undefined') {
  const persist = () => flushNow();
  window.addEventListener('pagehide', persist);
  window.addEventListener('beforeunload', persist);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persist();
  });
}
