// ── Shared cloud copy of the leads dataset (Firebase Firestore) ──────────
// leadsData.json is a static, bundled seed (2MB+, ~6,500 records) that needs
// a full rebuild + redeploy to change — not a real database. This mirrors it
// into Firestore instead, so both HeavyGuard and Itai's CRM can read the same
// live dataset without shipping a new build every time a lead is added.
//
// Reuses whichever Firebase project is already configured for the owner's
// Agents Command Center or Itai's CRM sync (agents/cloud.js / agent/cloud.js
// paste the SAME web-config into the same project) — no separate setup
// needed if either is already configured. Falls back to null (caller uses
// the static leadsData.json import) when neither is configured, or on any
// Firestore error, so this never blocks the app from loading.
//
// Stored as a handful of chunked documents rather than one-per-lead: a
// single document is capped at 1 MiB by Firestore, and reading 6,500
// individual documents on every page load would burn through the free
// tier's 50K-reads/day quota in a handful of visits. Chunked, a page load
// costs one read per chunk (a few) instead of one per lead.
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const CFG_KEYS = ["alpha:owner:fbconfig", "itai:fbconfig"];
const COLLECTION = "sharedLeads";
const META_DOC = "meta";
const CHUNK_BYTES = 700_000; // safe margin under Firestore's 1 MiB/doc cap

function parseCfg() {
  for (const k of CFG_KEYS) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const o = JSON.parse(raw);
      if (o && o.projectId && o.apiKey) return o;
    } catch {}
  }
  return null;
}
export const leadsCloudConfigured = () => !!parseCfg();

let _db = null;
function db() {
  if (_db) return _db;
  const cfg = parseCfg(); if (!cfg) return null;
  try { const app = getApps().length ? getApps()[0] : initializeApp(cfg); _db = getFirestore(app); return _db; } catch { return null; }
}

// Groups by running byte-size (JSON-stringified), not record count — leads
// vary in size (some have many phones/managers), so this keeps every chunk
// safely under the cap regardless of which records land where.
function chunkArray(arr) {
  const chunks = [];
  let cur = [];
  let curBytes = 0;
  for (const item of arr) {
    const itemBytes = JSON.stringify(item).length;
    if (curBytes + itemBytes > CHUNK_BYTES && cur.length) {
      chunks.push(cur);
      cur = [];
      curBytes = 0;
    }
    cur.push(item);
    curBytes += itemBytes;
  }
  if (cur.length) chunks.push(cur);
  return chunks;
}

// One-time (or whenever re-seeding is wanted) upload — owner-triggered from
// a button in HeavyGuard, since this environment has no way to run a
// service-account script against the owner's actual Firebase project.
export async function pushLeadsToCloud(leadsArray) {
  const d = db(); if (!d) return false;
  try {
    const chunks = chunkArray(leadsArray);
    await Promise.all(chunks.map((c, i) => setDoc(doc(d, COLLECTION, "chunk" + i), { v: c })));
    await setDoc(doc(d, COLLECTION, META_DOC), { chunkCount: chunks.length, total: leadsArray.length, ts: Date.now() });
    return chunks.length;
  } catch { return false; }
}

// Fetch + reassemble. Returns null (not []) if unconfigured, never seeded,
// or on any failure — callers fall back to the static leadsData.json import.
export async function fetchLeadsFromCloud() {
  const d = db(); if (!d) return null;
  try {
    const metaSnap = await getDoc(doc(d, COLLECTION, META_DOC));
    if (!metaSnap.exists()) return null;
    const { chunkCount } = metaSnap.data();
    if (!chunkCount) return null;
    const snaps = await Promise.all(
      Array.from({ length: chunkCount }, (_, i) => getDoc(doc(d, COLLECTION, "chunk" + i)))
    );
    const out = [];
    for (const s of snaps) { if (s.exists()) out.push(...(s.data().v || [])); }
    return out.length ? out : null;
  } catch { return null; }
}
