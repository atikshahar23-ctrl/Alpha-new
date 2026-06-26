// ============================================================
// On-device text embeddings — free, no server, no API keys.
// Runs Transformers.js (multilingual, Hebrew-capable) inside a Web Worker so
// the model forward pass never touches the main thread. The model (~25MB) is
// fetched from a CDN on first use and cached by the browser afterwards.
//
// Everything degrades gracefully: if the worker can't start or the model can't
// load (offline / blocked), embed() resolves to null and callers fall back to
// the lexical keyword recall — so behaviour is never worse than before.
// ============================================================

let worker: Worker | null = null;
let failed = false;
let ready = false;     // becomes true after the first successful embedding
let warming = false;
let reqId = 0;
const pending = new Map<number, (v: Float32Array | null) => void>();

// The worker is built from an inline Blob so it needs no separate bundle entry;
// it dynamically imports Transformers.js from a CDN (keeps it free + tiny).
const WORKER_SRC = `
let extractor = null, loading = null;
async function load() {
  if (extractor) return extractor;
  if (!loading) loading = (async () => {
    const mod = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2');
    mod.env.allowLocalModels = false;
    extractor = await mod.pipeline('feature-extraction', 'Xenova/multilingual-e5-small');
    return extractor;
  })();
  return loading;
}
self.onmessage = async (e) => {
  const { id, text } = e.data;
  try {
    const ex = await load();
    const out = await ex(text, { pooling: 'mean', normalize: true });
    self.postMessage({ id, vec: Array.from(out.data) });
  } catch (err) {
    self.postMessage({ id, error: String(err && err.message || err) });
  }
};
`;

function ensureWorker(): Worker | null {
  if (worker || failed) return worker;
  try {
    const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'application/javascript' }));
    worker = new Worker(url, { type: 'module' });
    worker.onmessage = (e: MessageEvent) => {
      const { id, vec, error } = e.data || {};
      if (vec && !error) ready = true;   // model is loaded & producing vectors
      const resolve = pending.get(id);
      if (!resolve) return;
      pending.delete(id);
      resolve(error || !vec ? null : Float32Array.from(vec));
    };
    worker.onerror = () => { failed = true; };
  } catch {
    failed = true;
  }
  return worker;
}

/** Embed text on-device. Resolves null if embeddings are unavailable. */
export function embed(text: string, timeoutMs = 20000): Promise<Float32Array | null> {
  const clean = (text || '').trim();
  if (!clean) return Promise.resolve(null);
  const w = ensureWorker();
  if (!w) return Promise.resolve(null);
  return new Promise(resolve => {
    const id = ++reqId;
    const to = setTimeout(() => { if (pending.delete(id)) resolve(null); }, timeoutMs);
    pending.set(id, v => { clearTimeout(to); resolve(v); });
    try { w.postMessage({ id, text: clean }); }
    catch { clearTimeout(to); pending.delete(id); resolve(null); }
  });
}

export function embeddingsAvailable(): boolean {
  return !failed;
}

/** True once the model has loaded and produced at least one vector. */
export function isReady(): boolean {
  return ready;
}

/** Kick off model loading in the background without blocking anything. */
export function warmup(): void {
  if (ready || warming || failed) return;
  warming = true;
  embed('warmup', 60000).finally(() => { warming = false; });
}

/** Cosine similarity. Vectors are L2-normalized by the model, so this is a dot
 *  product in practice, but we normalize defensively for mock/other inputs. */
export function cosine(a: Float32Array | number[], b: Float32Array | number[]): number {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
