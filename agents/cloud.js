// ── Owner-only cloud sync for the Agents Command Center (Firebase Firestore) ──
// Deliberately a SEPARATE config from agent/cloud.js (Itai's CRM). Itai only
// ever receives a link to agent.html and pastes his own Firebase config there
// to sync leads/deals/customers with the owner. That config is stored under a
// different localStorage key and a different Firestore collection than this
// one, so even if Itai's browser somehow opens agents.html, it has no cloud
// config here and nothing syncs. Free (Firebase Spark plan).
//
// SECURITY: GitHub tokens and the Groq API key are NEVER synced here — they
// stay device-local only.

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

const CFG_KEY = "alpha:owner:fbconfig";

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

// Local table (localStorage key) → Firestore document id under collection "alphaOwner".
export const CLOUD_TABLES = {
  "alpha:agents:hist": "agentsHist",
  "alpha:agents:ideas": "agentsIdeas",
  "alpha:agents:devtasks": "agentsDevTasks",
  "alpha:agents:biz": "agentsBiz",
  "alpha:agents:activity": "agentsActivity",
};

export async function cloudPush(localKey, value) {
  const d = db(); const seg = CLOUD_TABLES[localKey]; if (!d || !seg) return false;
  try { await setDoc(doc(d, "alphaOwner", seg), { v: value ?? null, ts: Date.now() }); return true; } catch { return false; }
}

export async function cloudGet(localKey) {
  const d = db(); const seg = CLOUD_TABLES[localKey]; if (!d || !seg) return null;
  try { const s = await getDoc(doc(d, "alphaOwner", seg)); return s.exists() ? (s.data().v ?? null) : null; } catch { return null; }
}

// Realtime subscribe: one onSnapshot per table; delivers the table's value to
// onTable(localKey, value). Returns an unsubscribe fn; no-op when unconfigured.
export function cloudSubscribe(onTable, keys = Object.keys(CLOUD_TABLES)) {
  const d = db(); if (!d) return () => {};
  const unsubs = [];
  for (const localKey of keys) {
    const seg = CLOUD_TABLES[localKey];
    try {
      unsubs.push(onSnapshot(doc(d, "alphaOwner", seg), (snap) => {
        try { onTable(localKey, snap.exists() ? (snap.data().v ?? null) : null); } catch {}
      }, () => {}));
    } catch {}
  }
  return () => { unsubs.forEach((u) => { try { u(); } catch {} }); };
}
