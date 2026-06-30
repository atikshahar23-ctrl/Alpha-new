// ── Shared realtime cloud for Itai's CRM ──────────────────────────────────
// Uses Firebase Realtime Database over plain REST + Server-Sent-Events, so
// there is NO SDK / npm dependency and it works browser-direct, free, and in
// real time. The owner and Itai both point the agent at the SAME database URL
// and therefore see + edit the SAME data. The owner's other systems
// (HeavyGuard / Alpha) never touch this DB, so they stay owner-only.
//
// SECURITY: credit-card / CVV data is NEVER written here (Samsonix card fields
// stay on the device). Only non-sensitive CRM data is synced.

const URL_KEY = "itai:cloud_url";
const AUTH_KEY = "itai:cloud_auth"; // optional DB secret / token

// Local tables (localStorage key → cloud path segment) that are shared.
export const CLOUD_TABLES = {
  "itai:crm": "crm",
  "itai:deals": "deals",
  "itai:customers": "customers",
  "itai:samsonix": "samsonix",        // Itai's own saved-form history
  "itai:saminbox": "saminbox",        // customer-submitted Samsonix forms (via link)
};

export const cloudURL = () => { try { return (localStorage.getItem(URL_KEY) || "").replace(/\/+$/, ""); } catch { return ""; } };
export const cloudAuth = () => { try { return localStorage.getItem(AUTH_KEY) || ""; } catch { return ""; } };
export const cloudConfigured = () => !!cloudURL();
export function setCloud(url, auth) {
  try {
    localStorage.setItem(URL_KEY, (url || "").trim().replace(/\/+$/, ""));
    localStorage.setItem(AUTH_KEY, (auth || "").trim());
  } catch {}
}
const q = () => { const a = cloudAuth(); return a ? `?auth=${encodeURIComponent(a)}` : ""; };

// Allow a customer-form link to carry the DB target so an external customer
// (who has nothing in localStorage) can still submit to the right database.
export function applyCloudFromLink() {
  try {
    const h = new URLSearchParams((location.hash || "").replace(/^#/, ""));
    const db = h.get("db");
    if (db && !cloudURL()) localStorage.setItem(URL_KEY, decodeURIComponent(db).replace(/\/+$/, ""));
    const au = h.get("au");
    if (au && !cloudAuth()) localStorage.setItem(AUTH_KEY, decodeURIComponent(au));
  } catch {}
}

// Write a whole table to the cloud (last-write-wins; fine for this scale).
export async function cloudPush(localKey, value) {
  const u = cloudURL(); const seg = CLOUD_TABLES[localKey];
  if (!u || !seg) return false;
  try {
    const r = await fetch(`${u}/itai/${seg}.json${q()}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value ?? null),
    });
    return r.ok;
  } catch { return false; }
}

// Push a single keyed record (used by the external customer form → inbox).
export async function cloudPushChild(localKey, id, record) {
  const u = cloudURL(); const seg = CLOUD_TABLES[localKey];
  if (!u || !seg) return false;
  try {
    const r = await fetch(`${u}/itai/${seg}/${encodeURIComponent(id)}.json${q()}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record),
    });
    return r.ok;
  } catch { return false; }
}

export async function cloudGet(localKey) {
  const u = cloudURL(); const seg = CLOUD_TABLES[localKey];
  if (!u || !seg) return null;
  try { const r = await fetch(`${u}/itai/${seg}.json${q()}`); return r.ok ? await r.json() : null; } catch { return null; }
}

// Subscribe to realtime updates. Opens one SSE stream per table; on any change
// the table's full value is delivered to onTable(localKey, value). Returns an
// unsubscribe function. No-ops (returns a noop) when not configured.
export function cloudSubscribe(onTable, keys = Object.keys(CLOUD_TABLES)) {
  const u = cloudURL();
  if (!u || typeof EventSource === "undefined") return () => {};
  const streams = [];
  for (const localKey of keys) {
    const seg = CLOUD_TABLES[localKey];
    try {
      const es = new EventSource(`${u}/itai/${seg}.json${q()}`);
      const handle = (e) => {
        try {
          const msg = JSON.parse(e.data || "{}");
          // For a per-table stream the top-level 'put' carries the full table at
          // path "/"; nested patches carry sub-paths — we just re-pull to stay simple.
          if (msg && Object.prototype.hasOwnProperty.call(msg, "data")) {
            if (msg.path === "/") onTable(localKey, msg.data);
            else cloudGet(localKey).then((v) => onTable(localKey, v));
          }
        } catch {}
      };
      es.addEventListener("put", handle);
      es.addEventListener("patch", handle);
      streams.push(es);
    } catch {}
  }
  return () => { streams.forEach((s) => { try { s.close(); } catch {} }); };
}
