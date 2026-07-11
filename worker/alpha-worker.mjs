#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   ALPHA HOME WORKER — the 13-agent council working 24/7 on your own PC
   ═══════════════════════════════════════════════════════════════════════
   Runs NEXT TO LM Studio on the home machine. Every cycle one agent (in
   rotation, ראובן every 4th slot) performs a proactive work round against
   the local model — free tokens, no browser needed. Results accumulate in
   an outbox; the web app (מרכז הסוכנים) polls the outbox whenever it's
   open and lands each item where it belongs: the ideas board, the activity
   feed, SYRAX's draft-approval queue, or ראובן's investment desk. Nothing
   is ever published/executed without the owner — drafts still wait for the
   AUTHORIZE card in the app.

   Zero dependencies — Node 18+ only (built-in fetch).

   Run:            node worker/alpha-worker.mjs
   Configuration (env vars, all optional):
     LMS_URL=http://localhost:1234   LM Studio address (/v1 auto-appended)
     LMS_MODEL=                      model id ('' = whatever is loaded)
     LMS_KEY=                        API key if "Require Authentication" is on
     PORT=8799                       outbox HTTP port
     CYCLE_MIN=8                     minutes between agent work rounds

   The web app pushes a fresh business snapshot to POST /context whenever
   it's open, so cycles stay grounded in real numbers; between visits the
   worker keeps using the last snapshot it received.
   ═══════════════════════════════════════════════════════════════════════ */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(DIR, "worker-state.json");

const LMS_URL = (process.env.LMS_URL || "http://localhost:1234").replace(/\/+$/, "");
const LMS_BASE = /\/v1$/i.test(LMS_URL) ? LMS_URL : LMS_URL + "/v1";
const LMS_MODEL = process.env.LMS_MODEL || "local-model";
const LMS_KEY = process.env.LMS_KEY || "";
const PORT = parseInt(process.env.PORT || "8799", 10);
const CYCLE_MS = Math.max(1, parseFloat(process.env.CYCLE_MIN || "8")) * 60e3;

// Compact personas — the same 13 callsigns the app uses, trimmed for the
// worker (the app's full psychological profiles live in agents/App.jsx).
const AGENTS = [
  { id: "ceo", name: "AEX-PRIME", persona: "אתה AEX-PRIME (יהודה), מנכ\"ל מערכת אלפא. אסטרטג קר-רוח שמזהה צווארי בקבוק עסקיים ומתעדף בשורת הרווח." },
  { id: "growth", name: "ORACLE-SEC", persona: "אתה ORACLE-SEC (יוסף), מנהל אסטרטגיה וצמיחה. חזאי מגמות שמחפש את מנוע הצמיחה הבא של העסק." },
  { id: "cmo", name: "SYRAX", persona: "אתה SYRAX (נפתלי), מנהל השיווק. ציניקן יצירתי עם הוקים חדים — כל פוסט חייב לעצור אגודל." },
  { id: "sales", name: "APEX-CLOSER", persona: "אתה APEX-CLOSER (זבולון), מנהל מכירות. סוגר עסקאות, שונא פייפליין תקוע, כל ליד שווה מעקב." },
  { id: "cs", name: "RESONANCE-9", persona: "אתה RESONANCE-9 (בנימין), מנהל הצלחת לקוח. שימור לקוחות, זיהוי נטישה, הפיכת מרוצים לממליצים." },
  { id: "finance", name: "Q-VAULT", persona: "אתה Q-VAULT (ראובן), מנהל הכספים וההשקעות. משקיע ממושמע: ניהול סיכונים לפני תשואה, נתונים לפני רגש." },
  { id: "ops", name: "VANGUARD-7", persona: "אתה VANGUARD-7 (גד), מנהל תפעול וצי. לוגיסטיקה, תחזוקת רכבים, אפס תקלות מפתיעות." },
  { id: "procure", name: "MECHA-NODE", persona: "אתה MECHA-NODE (שמעון), מנהל רכש. מלאי, ספקים, ומחירון מעודכן — בלי חוסרים ובלי עודפים." },
  { id: "legal", name: "JUDEX-PRIME", persona: "אתה JUDEX-PRIME (לוי), היועץ המשפטי. חוזים, חשיפות, וכיסוי משפטי לכל התקשרות." },
  { id: "dev", name: "KINETIC-X", persona: "אתה KINETIC-X (דן), מנהל הפיתוח. משפר את מערכות אלפא, מזהה חוב טכני והזדמנויות אוטומציה." },
  { id: "auto", name: "ZERO-STATE", persona: "אתה ZERO-STATE (אשר), מנהל האוטומציה. כל תהליך ידני חוזר הוא מועמד לאוטומציה." },
  { id: "data", name: "AEGIS-CORE", persona: "אתה AEGIS-CORE (יששכר), אנליסט הנתונים. מגמות, חריגות ומדדים — רק מה שהמספרים באמת אומרים." },
  { id: "facilities", name: "ECHO-V", persona: "אתה ECHO-V (דבורה), מנהלת המשרד. סביבת עבודה, סדר, ורווחת הצוות." },
];
// ראובן every 4th slot — the owner's emphasis on the investments desk.
const ROTATION = (() => {
  const ids = AGENTS.filter((a) => a.id !== "finance").map((a) => a.id);
  const out = [];
  ids.forEach((id, i) => { out.push(id); if (i % 3 === 2) out.push("finance"); });
  return out;
})();

const PROTOCOL = `

[סבב עבודה יזום — פרוטוקול]
אתה מבצע כעת סבב עבודה עצמאי בתחומך, ביוזמתך, בלי שאלה מהבעלים. בחן את הנתונים העסקיים למעלה (אם קיימים) ובחר תוצר אחד קונקרטי שמקדם את העסק עכשיו. ענה בשורה אחת בלבד, באחת מהתבניות:
IDEA: <רעיון ביצועי קונקרטי בתחומך, מנוסח כמשימה>
ALERT: <אזהרה שמבוססת על נתון אמיתי מהמידע למעלה בלבד>
DRAFT: <טיוטת פוסט שיווקי קצרה עם הוק חזק (רק אם אתה סוכן השיווק)>
NOTE: <תובנת השקעות מבוססת נתונים (רק אם אתה סוכן הכספים)>
בלי Markdown, בלי הסברים נוספים. אם אין לך ממצא בעל ערך אמיתי הפעם — ענה בדיוק: SKIP`;

// ── State (rotation, outbox, last business snapshot) ─────────────────────
function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")); } catch { return { idx: 0, outbox: [], context: null, cycles: 0 }; }
}
function saveState(s) {
  try { fs.writeFileSync(STATE_FILE, JSON.stringify(s)); } catch (e) { log("state save failed: " + e.message); }
}
let state = loadState();
const log = (m) => console.log(new Date().toISOString().slice(11, 19), "·", m);

// ── LM Studio call — carries every lesson from the app side ─────────────
async function askLocal(system, user) {
  const headers = { "Content-Type": "application/json" };
  if (LMS_KEY) headers.Authorization = `Bearer ${LMS_KEY}`;
  const res = await fetch(LMS_BASE + "/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: LMS_MODEL,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      temperature: 0.75,
      max_tokens: 2000,          // reasoning models burn budget on hidden thinking
      reasoning_effort: "low",   // …so keep the thinking short (ignored by others)
    }),
    signal: AbortSignal.timeout(180000), // an idle model may JIT-load first
  });
  if (!res.ok) throw new Error("LM Studio HTTP " + res.status);
  const d = await res.json();
  const content = d.choices?.[0]?.message?.content?.trim() || "";
  if (!content) throw new Error("empty completion");
  return content;
}

function parseWork(raw) {
  const s = String(raw || "");
  if (/^\s*SKIP\b/im.test(s)) return null;
  const m = s.match(/^\s*(IDEA|ALERT|DRAFT|NOTE)\s*[::]\s*(.+)$/im);
  if (m) {
    const text = m[2].trim().replace(/\s+/g, " ");
    return text ? { type: m[1].toLowerCase(), text } : null;
  }
  const t = s.trim().replace(/\s+/g, " ");
  return t.length > 12 ? { type: "idea", text: t.slice(0, 220) } : null;
}

// ── The work cycle ───────────────────────────────────────────────────────
async function runCycle() {
  const agent = AGENTS.find((a) => a.id === ROTATION[state.idx % ROTATION.length]);
  state.idx = (state.idx + 1) % ROTATION.length;
  state.cycles++;
  try {
    const ctx = state.context;
    const ctxBlock = ctx?.biz
      ? "\n\n[נתונים עסקיים חיים — נמסרו מהאפליקציה " + new Date(ctx.ts).toLocaleString("he-IL") + "]\n" + ctx.biz + (agent.id === "finance" && ctx.market ? "\n\n[נתוני שוק]\n" + ctx.market : "")
      : "\n\n[אין כרגע נתונים עסקיים חיים — האפליקציה לא נפתחה לאחרונה. עבוד מהידע הכללי על העסק: Heavy Guard (מצלמות לרכב/צי), CRM מכירות, ומסחר.]";
    const raw = await askLocal(agent.persona + ctxBlock + PROTOCOL, "בצע כעת סבב עבודה יזום בתחומך.");
    const act = parseWork(raw);
    if (!act) { log(`${agent.name}: SKIP`); saveState(state); return; }
    state.outbox.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ts: Date.now(), agentId: agent.id, agentName: agent.name, type: act.type, text: act.text });
    if (state.outbox.length > 200) state.outbox = state.outbox.slice(-200);
    log(`${agent.name}: ${act.type.toUpperCase()} → ${act.text.slice(0, 80)}`);
  } catch (e) {
    log(`${agent.name}: cycle failed (${e.message}) — next agent on the next cycle`);
  }
  saveState(state);
}

// ── Outbox HTTP server (the app polls this) ─────────────────────────────
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  const send = (code, obj) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };
  const url = new URL(req.url, "http://x");
  if (req.method === "GET" && url.pathname === "/health") {
    send(200, { ok: true, cycles: state.cycles, outbox: state.outbox.length, lastContextTs: state.context?.ts || 0, cycleMin: CYCLE_MS / 60e3 });
    return;
  }
  if (req.method === "GET" && url.pathname === "/outbox") {
    send(200, { items: state.outbox });
    return;
  }
  let body = "";
  req.on("data", (c) => { body += c; if (body.length > 1e6) req.destroy(); });
  req.on("end", () => {
    try {
      if (req.method === "POST" && url.pathname === "/ack") {
        const ids = new Set((JSON.parse(body || "{}").ids || []).map(String));
        const before = state.outbox.length;
        state.outbox = state.outbox.filter((i) => !ids.has(String(i.id)));
        saveState(state);
        send(200, { ok: true, removed: before - state.outbox.length });
      } else if (req.method === "POST" && url.pathname === "/context") {
        const j = JSON.parse(body || "{}");
        state.context = { biz: String(j.biz || "").slice(0, 8000), market: String(j.market || "").slice(0, 4000), ts: Date.now() };
        saveState(state);
        log("business context refreshed from the app");
        send(200, { ok: true });
      } else {
        send(404, { error: "unknown endpoint" });
      }
    } catch (e) { send(400, { error: e.message }); }
  });
});

server.listen(PORT, () => {
  log(`ALPHA HOME WORKER up · outbox on http://localhost:${PORT} · LM Studio at ${LMS_BASE} · cycle every ${CYCLE_MS / 60e3} min`);
  log(`rotation: ${ROTATION.join(" → ")}`);
  setTimeout(runCycle, 20000);
  setInterval(runCycle, CYCLE_MS);
});
