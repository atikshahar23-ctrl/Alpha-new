// ── Shared realtime cloud for Itai's CRM (Firebase Firestore SDK) ─────────
// The owner and Itai paste the SAME Firebase web-config into the agent (cloud
// button → settings) and therefore read + edit the SAME data in real time via
// Firestore onSnapshot. The owner's other systems (HeavyGuard / Alpha) never
// touch this DB, so they stay owner-only. Free (Firebase Spark plan).
//
// SECURITY: credit-card / CVV data is NEVER written here — only non-sensitive
// CRM data is synced.

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

const CFG_KEY = "itai:fbconfig";

export const cloudConfigRaw = () => { try { return localStorage.getItem(CFG_KEY) || ""; } catch { return ""; } };
export function setCloudConfig(json) { try { localStorage.setItem(CFG_KEY, (json || "").trim()); } catch {} _db = null; }
function parseCfg() { try { const o = JSON.parse(cloudConfigRaw()); return (o && o.projectId && o.apiKey) ? o : null; } catch { return null; } }
export const cloudConfigured = () => !!parseCfg();

let _db = null;
function db() {
  if (_db) return _db;
  const cfg = parseCfg(); if (!cfg) return null;
  try { const app = getApps().length ? getApps()[0] : initializeApp(cfg); _db = getFirestore(app); return _db; } catch { return null; }
}

// Local table (localStorage key) → Firestore document id under collection "itai".
export const CLOUD_TABLES = {
  "itai:crm": "crm",
  "itai:deals": "deals",
  "itai:customers": "customers",
  "itai:samsonix": "samsonix",   // Itai's own saved-form history
  "itai:saminbox": "saminbox",   // customer-submitted Samsonix forms (via link)
  // Agents Command Center — same shared DB, so it syncs across every device.
  // Never includes credentials (GitHub token / Groq key stay device-local).
  "alpha:agents:hist": "agentsHist",
  "alpha:agents:ideas": "agentsIdeas",
  "alpha:agents:devtasks": "agentsDevTasks",
  "alpha:agents:biz": "agentsBiz",
  "alpha:agents:activity": "agentsActivity",
};

// A customer-form link carries the Firebase config (base64) so an external
// customer — who has nothing in localStorage — can still submit to the right DB.
export function applyCloudFromLink() {
  try {
    const h = new URLSearchParams((location.hash || "").replace(/^#/, ""));
    const c = h.get("cfg");
    if (c && !cloudConfigured()) {
      const json = decodeURIComponent(escape(atob(decodeURIComponent(c))));
      localStorage.setItem(CFG_KEY, json); _db = null;
    }
  } catch {}
}
export function cloudLinkToken() {
  try { return encodeURIComponent(btoa(unescape(encodeURIComponent(cloudConfigRaw())))); } catch { return ""; }
}

// Write a whole table (last-write-wins; fine for this scale).
export async function cloudPush(localKey, value) {
  const d = db(); const seg = CLOUD_TABLES[localKey]; if (!d || !seg) return false;
  try { await setDoc(doc(d, "itai", seg), { v: value ?? null, ts: Date.now() }); return true; } catch { return false; }
}

// Merge a single keyed record into a table's map (used by the customer form → inbox).
export async function cloudPushChild(localKey, id, record) {
  const d = db(); const seg = CLOUD_TABLES[localKey]; if (!d || !seg) return false;
  try { await setDoc(doc(d, "itai", seg), { v: { [id]: record } }, { merge: true }); return true; } catch { return false; }
}

export async function cloudGet(localKey) {
  const d = db(); const seg = CLOUD_TABLES[localKey]; if (!d || !seg) return null;
  try { const s = await getDoc(doc(d, "itai", seg)); return s.exists() ? (s.data().v ?? null) : null; } catch { return null; }
}

// Realtime subscribe: one onSnapshot per table; delivers the table's value to
// onTable(localKey, value). Returns an unsubscribe fn; no-op when unconfigured.
export function cloudSubscribe(onTable, keys = Object.keys(CLOUD_TABLES)) {
  const d = db(); if (!d) return () => {};
  const unsubs = [];
  for (const localKey of keys) {
    const seg = CLOUD_TABLES[localKey];
    try {
      unsubs.push(onSnapshot(doc(d, "itai", seg), (snap) => {
        try { onTable(localKey, snap.exists() ? (snap.data().v ?? null) : null); } catch {}
      }, () => {}));
    } catch {}
  }
  return () => { unsubs.forEach((u) => { try { u(); } catch {} }); };
}
