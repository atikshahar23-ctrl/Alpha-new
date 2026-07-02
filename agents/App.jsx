import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Crown, TrendingUp, TrendingDown, Wrench, Megaphone, Code2, Cpu, BarChart3, HeartHandshake,
  Send, X, Sparkles, Activity, Lightbulb, LayoutGrid, Settings as SettingsIcon,
  Copy, Check, Circle, Zap, ChevronLeft, MessageSquare, Plus, Trash2, RefreshCw,
  ArrowUpRight, Bot, Radio, Brain, Rocket, ShieldCheck, ClipboardList,
  GitBranch, Terminal, FileCode2, Coins, Package, Scale, Compass,
  Building2, Database, GraduationCap, Globe, Mic, Volume2, VolumeX, LineChart,
  Clock, CalendarClock, Hammer,
} from "lucide-react";
import * as cloud from "./cloud";
import Office3D from "./Office3D.jsx";
import { BOOKS_BY_KEY, BOOKS_LAST_KEY, BOOKS_TOTAL_INCOME } from "../src/modules/books";
import SimulatorPanel from "./SimulatorPanel.jsx";
import { AGENT_TOOLS, handleAgentToolCall, isSimConfigured } from "../src/modules/simulatorBridge";

/* ════════════════════════════════════════════════════════════════════
   ALPHA · AGENTS COMMAND CENTER
   A visual control room for a full team of Claude-style AI agents.
   Each agent owns a domain across the owner's systems (HeavyGuard, the
   Itai CRM, marketing, dev, automations). A CEO agent orchestrates them.
   Free brain: shared Groq key (localStorage "alpha_groq"); rich scripted
   personas when no key is present, so the room is always live.
   ════════════════════════════════════════════════════════════════════ */

// The team here works for שחר (Shachar), the company owner — Itai is a
// separate external salesperson who only ever uses his own CRM (agent.html)
// and never sees this Agents Command Center, so nothing here should address
// "him" as the reader.
const OWNER_NAME = "שחר";

/* ── Storage ── */
const K_SIM_TAB = "simulator"; // Tab key for SimulatorPanel
const K_HIST = "alpha:agents:hist";     // { [agentId]: [{from,text,ts}] }
const K_IDEAS = "alpha:agents:ideas";   // [{id, agentId, text, status, ts}]
const K_ACT = "alpha:agents:activity";  // [{id, agentId, text, ts}]
const K_GH = "alpha:agents:gh";         // { token, owner, repo } — token stays local-only
const K_GH_TARGET = "alpha:agents:gh:target"; // which repo preset the dev console currently targets
const K_DEVTASKS = "alpha:agents:devtasks"; // [{id, title, brief, status, issueUrl, ts}]
const K_INVEST = "alpha:agents:invest"; // [{id, agentId, text, ts}] — read-only market commentary
const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
// Cross-device sync: save locally, and — when the free shared-DB (Firebase)
// is connected — push the same value so every device sees it live.
// Credentials (GitHub token, Groq key) intentionally never go through this.
const cloudSave = (k, v) => { save(k, v); if (cloud.cloudConfigured()) cloud.cloudPush(k, v).catch(() => {}); };
function useCloudSync(key, setter) {
  useEffect(() => {
    if (!cloud.cloudConfigured()) return;
    cloud.cloudGet(key).then((v) => { if (v != null) setter(v); }).catch(() => {});
    const off = cloud.cloudSubscribe((k, v) => { if (k === key && v != null) setter(v); }, [key]);
    return off;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const now = () => Date.now();
const timeAgo = (ts) => {
  const s = Math.floor((now() - ts) / 1000);
  if (s < 60) return "עכשיו";
  if (s < 3600) return Math.floor(s / 60) + " דק'";
  if (s < 86400) return Math.floor(s / 3600) + " שע'";
  return Math.floor(s / 86400) + " ימים";
};

/* ── Live business knowledge: agents learn the real business from shared
   localStorage (same origin as the HeavyGuard + CRM apps) plus facts you teach. ── */
const K_BIZ = "alpha:agents:biz"; // learned business facts (strings)
const ils = (n) => "₪" + (Number(n) || 0).toLocaleString("he-IL");

/* The REAL books — authoritative monthly income from the owner's accountant
   software, shared with the main dashboard so both always show identical
   numbers. See src/modules/books.ts for the data + update instructions. */

function bizSnapshot() {
  const get = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } };
  const installs = get("hg2:index") || [];
  const deals = get("itai:deals") || [];
  const itaiCust = get("itai:customers") || [];
  const pricelist = get("hg2:pricelist") || [];
  // Large fleet projects (HeavyGuard's פרויקטי-צי module) — the team keeps
  // an eye on active ones too.
  const fleetProjects = (get("hg2:projects") || []).filter((p) => !p.completed).length;
  // Cumulative income = the accountant's books (authoritative through
  // BOOKS_LAST_KEY) + live HeavyGuard installs only for months after that,
  // so the figure matches the real books exactly and still ticks up live.
  const liveAfterBooks = installs.reduce((a, x) => a + (String(x.date || "").slice(0, 7) > BOOKS_LAST_KEY ? (Number(x.price) || 0) : 0), 0);
  const hgRevenue = BOOKS_TOTAL_INCOME + liveAfterBooks;
  const m = {};
  installs.forEach((x) => { const n = (x.customer || "").trim(); if (!n) return; const k = n.replace(/\s+/g, " ").replace(/^ה(?=.{2,})/, "").toLowerCase(); if (!m[k]) m[k] = { name: n, rev: 0, count: 0 }; m[k].rev += Number(x.price) || 0; m[k].count++; });
  const top = Object.values(m).sort((a, b) => b.rev - a.rev).slice(0, 5);
  const custCount = Math.max(Object.keys(m).length, itaiCust.length);
  const openDeals = deals.filter((d) => d.status === "פתוח");
  const openVal = openDeals.reduce((a, d) => a + (Number(d.total) || 0), 0);
  const mk = new Date().toISOString().slice(0, 7);
  const wonMonth = deals.filter((d) => d.status === "נסגר" && String(d.wonAt || "").startsWith(mk)).length;
  // Oldest open deal age (days) — feeds the morning briefing's "follow up" nudge.
  let staleDays = 0;
  openDeals.forEach((d) => { const t = d.createdAt || d.ts; if (!t) return; const days = Math.floor((Date.now() - new Date(t).getTime()) / 86400000); if (days > staleDays) staleDays = days; });
  return { installs: installs.length, hgRevenue, custCount, top, openDeals: openDeals.length, openVal, wonMonth, pricelist: pricelist.length, fleetProjects, staleDays, staleCount: openDeals.filter((d) => { const t = d.createdAt || d.ts; if (!t) return false; return (Date.now() - new Date(t).getTime()) / 86400000 > 7; }).length };
}
// Real action, not just a chat reply — merges duplicate customers directly
// in Itai's CRM data (same "itai:customers" key agent.html reads/writes),
// so asking any agent to do this actually does it. Same identity rule as
// agent/App.jsx's dedupeCustomers: same phone OR same normalised name.
function mergeItaiDuplicateCustomers() {
  const get = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } };
  const list = get("itai:customers") || [];
  const normName = (s) => { let k = (s || "").trim().replace(/\s+/g, " "); if (k.length > 3 && k[0] === "ה") k = k.slice(1); return k.toLowerCase(); };
  const normPhone = (p) => (p || "").replace(/\D/g, "").replace(/^972/, "0");
  const parent = list.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; };
  const byPhone = {}, byName = {};
  list.forEach((c, i) => {
    const ph = normPhone(c.phone);
    if (ph && ph.length >= 7) { if (byPhone[ph] !== undefined) union(i, byPhone[ph]); else byPhone[ph] = i; }
    const nm = normName(c.name);
    if (nm) { if (byName[nm] !== undefined) union(i, byName[nm]); else byName[nm] = i; }
  });
  const groups = {};
  list.forEach((c, i) => { const r = find(i); (groups[r] = groups[r] || []).push(c); });
  const out = [];
  const dupNames = [];
  Object.values(groups).forEach((items) => {
    if (items.length === 1) { out.push(items[0]); return; }
    dupNames.push(items[0].name || "(ללא שם)");
    let count = 0, rev = 0, hadHG = false; const extra = [];
    items.forEach((c) => {
      const note = c.notes || "";
      const mc = note.match(/(\d+)\s*התקנות/); const mr = note.match(/הכנסה\s*₪?([\d,]+)/);
      if (mc || mr || /Heavy ?Guard/i.test(note)) { hadHG = true; if (mc) count += parseInt(mc[1], 10) || 0; if (mr) rev += parseInt(mr[1].replace(/,/g, ""), 10) || 0; }
      else if (note.trim()) extra.push(note.trim());
    });
    const base = [...items].sort((a, b) => (b.phone ? 1 : 0) - (a.phone ? 1 : 0) || (b.name || "").length - (a.name || "").length)[0];
    const pick = (k) => items.map((c) => c[k]).find((v) => v && String(v).trim()) || "";
    const parts = [];
    if (hadHG) parts.push(`${count} התקנות Heavy Guard · הכנסה ${ils(rev)}`);
    if (extra.length) parts.push(...extra);
    out.push({ ...base, phone: pick("phone"), email: pick("email"), city: pick("city"), region: pick("region") || base.region || "", notes: parts.join(" · ") });
  });
  const merged = list.length - out.length;
  if (merged > 0) cloudSave("itai:customers", out);
  return { merged, dupNames };
}
// Real action for דבורה (facilities): shuffles which agent sits at which
// desk — persisted, so it survives closing and reopening the office sim,
// and actually changes who's assigned to which glass office next time it
// loads (OfficeSim reads this order for its initial seating instead of
// always giving agent i desk i).
const K_DESK_ORDER = "alpha:agents:deskorder";
function reorganizeOffice() {
  const ids = AGENTS.map((a) => a.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  save(K_DESK_ORDER, ids);
  cloudSave(K_DESK_ORDER, ids);
  return ids;
}
// Revenue grouped by month (YYYY-MM) — last 6 months. The accountant's books
// (ACCOUNTANT_BOOKS) are authoritative for every month they cover; only months
// AFTER the last statement fall through to the live HeavyGuard install feed.
function monthlyRevenue() {
  const get = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } };
  const installs = get("hg2:index") || [];
  const m = {};
  installs.forEach((x) => { const mk = String(x.date || "").slice(0, 7); if (!mk) return; m[mk] = (m[mk] || 0) + (Number(x.price) || 0); });
  const out = [];
  const d = new Date();
  for (let i = 5; i >= 0; i--) {
    const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const key = dt.toISOString().slice(0, 7);
    const booked = BOOKS_BY_KEY[key];
    const value = booked ? booked.income : (key > BOOKS_LAST_KEY ? (m[key] || 0) : 0);
    out.push({ key, label: dt.toLocaleDateString("he-IL", { month: "short" }), value });
  }
  return out;
}
/* ── Live investments world: read-only crypto + stock/index/commodity board.
   Free public APIs (CoinGecko + Yahoo Finance chart), no key needed. This is
   observation only — the team analyses and flags moves, it never places any
   trade or touches real money. A tiny module-level cache + pub/sub so both
   the Business view's table and the autonomous agents' commentary share one
   set of live numbers instead of each firing its own network requests. ── */
const mkFmt = (n) => (n >= 1000 ? Math.round(n).toLocaleString("en-US") : n.toLocaleString("en-US", { maximumFractionDigits: n >= 1 ? 2 : 4 }));
async function fetchMarketRows() {
  const rows = [];
  try {
    const ids = "bitcoin,ethereum,solana,binancecoin,ripple,cardano,dogecoin";
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
    const d = await r.json();
    const order = [["bitcoin", "Bitcoin", "crypto"], ["ethereum", "Ethereum", "crypto"], ["solana", "Solana", "crypto"], ["binancecoin", "BNB", "crypto"], ["ripple", "XRP", "crypto"], ["cardano", "Cardano", "crypto"], ["dogecoin", "Dogecoin", "crypto"]];
    for (const [id, name, kind] of order) if (d[id]) rows.push({ name, kind, price: "$" + mkFmt(d[id].usd), raw: d[id].usd, chg: d[id].usd_24h_change || 0 });
  } catch {}
  // All Yahoo symbols fetched in ONE parallel batch (they were sequential —
  // 5 round-trips back to back); order is preserved by mapping the results.
  const yahooSyms = [["%5EGSPC", "S&P 500"], ["%5EIXIC", "NASDAQ"], ["%5EDJI", "Dow Jones"], ["GC%3DF", "זהב"], ["CL%3DF", "נפט"], ["AAPL", "Apple"], ["NVDA", "Nvidia"], ["TSLA", "Tesla"], ["MSFT", "Microsoft"], ["GOOGL", "Google"]];
  const yahoo = await Promise.all(yahooSyms.map(async ([sym, name]) => {
    try {
      const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=2d`);
      const d = await r.json();
      const m = d.chart.result[0].meta;
      const price = m.regularMarketPrice;
      const prev = m.chartPreviousClose ?? m.previousClose ?? price;
      return { name, kind: "stock", price: mkFmt(price), raw: price, chg: prev ? ((price - prev) / prev) * 100 : 0 };
    } catch { return null; }
  }));
  yahoo.forEach((row) => { if (row) rows.push(row); });
  return rows;
}
let marketCache = { rows: [], ts: 0 };
const marketListeners = new Set();
async function refreshMarket() {
  const rows = await fetchMarketRows();
  if (rows.length) { marketCache = { rows, ts: Date.now() }; marketListeners.forEach((fn) => fn(rows)); }
  return rows;
}
function useMarket() {
  const [rows, setRows] = useState(marketCache.rows);
  useEffect(() => {
    marketListeners.add(setRows);
    if (!marketCache.rows.length) refreshMarket();
    const iv = setInterval(refreshMarket, 90000);
    return () => { marketListeners.delete(setRows); clearInterval(iv); };
  }, []);
  return rows;
}

// Proactive opportunity/risk detection — each agent flags what's in their lane.
function detectOpportunities(b) {
  const out = [];
  if (b.hgRevenue > 0 && b.top[0] && b.top[0].rev / b.hgRevenue > 0.4) {
    const pct = Math.round(b.top[0].rev / b.hgRevenue * 100);
    out.push({ agentId: "growth", text: `ריכוז סיכון: ${pct}% מההכנסה מגיע מלקוח אחד (${b.top[0].name}) — כדאי לגוון את מאגר הלקוחות.` });
  }
  if (b.staleCount > 0) out.push({ agentId: "sales", text: `${b.staleCount} עסקאות פתוחות כבר מעל שבוע — שווה לעקוב אחריהן היום.` });
  if (b.pricelist === 0 && b.installs > 0) out.push({ agentId: "procure", text: `אין עדיין מחירון מוגדר ב-HeavyGuard — כדאי להוסיף אחד לתמחור מהיר ועקבי.` });
  if (b.wonMonth >= 3) out.push({ agentId: "finance", text: `חודש חזק — ${b.wonMonth} עסקאות נסגרו. כדאי לבדוק תזרים ולתכנן את הבא.` });
  if (b.custCount === 0 && b.installs > 0) out.push({ agentId: "legal", text: `יש התקנות אבל אין עדיין לקוחות רשומים — ודא שכל לקוח חדש חותם על טופס התקשרות.` });
  if (b.openDeals === 0 && b.installs > 0) out.push({ agentId: "sales", text: `אין כרגע עסקאות פתוחות — הזמן טוב לפתוח הצעת מחיר חדשה ולמלא את הפייפליין.` });
  return out;
}
const learnedFacts = () => load(K_BIZ, []);
function bizContext() {
  const b = bizSnapshot();
  const facts = learnedFacts();
  const hasData = b.installs || b.custCount || b.openDeals;
  const top = b.top.length ? b.top.map((c) => `${c.name} (${ils(c.rev)})`).join(", ") : "אין נתונים עדיין";
  let s = `\n\n[ידע עסקי חי — HeavyGuard / ה-CRM של איתי]`;
  if (hasData) s += `\nהתקנות: ${b.installs} · הכנסה מצטברת: ${ils(b.hgRevenue)} · לקוחות: ${b.custCount} · עסקאות פתוחות: ${b.openDeals} (${ils(b.openVal)}) · נסגרו החודש: ${b.wonMonth} · מוצרים במחירון: ${b.pricelist}.\nלקוחות מובילים: ${top}.`;
  else s += `\nעדיין אין נתונים חיים זמינים — פתח את מערכת HeavyGuard/CRM כדי שהנתונים יסונכרנו.`;
  if (facts.length) s += `\nעובדות שלימדת את הצוות:\n- ${facts.join("\n- ")}`;
  s += `\nהשתמש בידע הזה לתשובות מבוססות-נתונים על העסק.`;
  return s;
}

/* ── Daily briefing from יהודה (CEO) — once a day, grounded in live business data ── */
const K_BRIEF_DATE = "alpha:agents:briefdate";
const K_BRIEF_TEXT = "alpha:agents:brieftext";
const todayKey = () => new Date().toISOString().slice(0, 10);
function briefingSystem() {
  return `אתה יהודה, המנכ"ל. כתוב תדריך בוקר קצר וממוקד (3-4 שורות, בלי כותרות) ל${OWNER_NAME}, בעל החברה. פנה אך ורק ל${OWNER_NAME} בשמו. חל איסור מוחלט לפנות ל"איתי" או להזכיר את השם "איתי" — איתי הוא איש מכירות חיצוני שאינו קורא את התדריך הזה. בסס על הנתונים העסקיים החיים שיסופקו לך. כלול: מספר אחד שחשוב היום, נקודת תשומת לב אחת (אם יש עסקה תקועה/לקוח לטיפול), ומשפט עידוד קצר. עברית, ישיר, מנהיגותי, בלי גינוני נימוס מיותרים.`;
}
function briefingFallback() {
  const b = bizSnapshot();
  const hasData = b.installs || b.openDeals;
  if (!hasData) return `בוקר טוב, ${OWNER_NAME} ☀️ עדיין אין לי נתונים חיים — פתח את HeavyGuard או ה-CRM כדי שאוכל לתדרך אותך כל בוקר עם המספרים האמיתיים. בינתיים — קדימה, יום מצוין מחכה.`;
  const parts = [`בוקר טוב, ${OWNER_NAME} ☀️ המצב: ${b.openDeals} עסקאות פתוחות בשווי ${ils(b.openVal)}, ${b.installs} התקנות עד כה.`];
  if (b.staleCount > 0) parts.push(`שים לב — ${b.staleCount} עסקאות פתוחות כבר מעל שבוע, כדאי לעקוב אחריהן היום.`);
  else if (b.top[0]) parts.push(`הלקוח המוביל שלך כרגע: ${b.top[0].name} (${ils(b.top[0].rev)}).`);
  parts.push("יום מצוין לסגור עוד עסקה 💪");
  return parts.join(" ");
}
// The briefing is addressed to the owner (שחר); it must never greet or name
// "איתי" (an external CRM-only salesperson who doesn't read it). The LLM
// sometimes writes "איתי" anyway, so we scrub it deterministically — a
// vocative "איתי," at the start becomes "שחר,", and any remaining standalone
// "איתי" is swapped to the owner's name too. This is the hard guarantee.
function scrubOwnerName(text) {
  if (!text) return text;
  return text
    .replace(/^\s*איתי\b/, OWNER_NAME)
    .replace(/([,\s])איתי\b/g, `$1${OWNER_NAME}`)
    .replace(/\bאיתי\b/g, OWNER_NAME);
}
async function getDailyBriefing() {
  if (load(K_BRIEF_DATE, "") === todayKey()) {
    const cached = load(K_BRIEF_TEXT, "");
    // Discard anything cached from before the owner-identity fix — it may
    // still greet "איתי" and would otherwise sit cached for the rest of the day.
    if (cached && !cached.includes("איתי")) return cached;
  }
  let text;
  try { text = hasAI() ? await askAI(briefingSystem() + bizContext(), [], "תן לי את התדריך של היום") : briefingFallback(); }
  catch { text = briefingFallback(); }
  if (!text) text = briefingFallback();
  text = scrubOwnerName(text);
  save(K_BRIEF_DATE, todayKey()); save(K_BRIEF_TEXT, text);
  return text;
}

/* ── Tiny event bus: the Dev room pings the office sim so דן reacts live. ── */
const devBus = { fns: new Set(), emit(p) { this.fns.forEach((f) => { try { f(p); } catch {} }); }, on(f) { this.fns.add(f); return () => this.fns.delete(f); } };

/* ── AI brain ────────────────────────────────────────────────────────────
   Two engines, one dispatcher (askAI):
   · Claude (Anthropic) — the real thing, when an Anthropic API key is set.
     Paid per use; the key + model choice live only in this device's
     localStorage and calls go straight from the browser to Anthropic
     (official SDK, no server of ours in between).
   · Groq (free tier) — the free fallback, and the fallback if a Claude
     call fails mid-conversation.
   With neither key, the agents run on the scripted persona fallbacks. ── */
const groqKey = () => { try { return localStorage.getItem("alpha_groq") || ""; } catch { return ""; } };
const anthropicKey = () => { try { return localStorage.getItem("alpha_anthropic") || ""; } catch { return ""; } };
const hasAI = () => !!anthropicKey() || !!groqKey();
const K_CLAUDE_MODEL = "alpha:agents:claudeModel";
const CLAUDE_MODELS = [
  { id: "claude-opus-4-8", label: "Claude Opus 4.8 · החזק (מומלץ)" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 · מאוזן" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5 · מהיר וחסכוני" },
];
const claudeModel = () => { try { return localStorage.getItem(K_CLAUDE_MODEL) || CLAUDE_MODELS[0].id; } catch { return CLAUDE_MODELS[0].id; } };
// SDK is loaded lazily so users without a Claude key never download it.
let anthropicClient = null, anthropicClientKey = "";
async function getAnthropic(key) {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  if (!anthropicClient || anthropicClientKey !== key) {
    anthropicClient = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
    anthropicClientKey = key;
  }
  return anthropicClient;
}
async function askClaude(system, history, user, maxTokens = 800) {
  const key = anthropicKey(); if (!key) throw new Error("NO_KEY");
  const client = await getAnthropic(key);
  // Anthropic requires strictly alternating turns starting with "user" —
  // trim any leading assistant message left over from the sliding window.
  let hist = history.slice(-6).filter((m) => m.role === "user" || m.role === "assistant");
  while (hist.length && hist[0].role !== "user") hist = hist.slice(1);
  const msg = await client.messages.create({
    model: claudeModel(),
    max_tokens: maxTokens,
    system,
    messages: [...hist, { role: "user", content: user }],
  });
  return (msg.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
}
const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it", "llama3-70b-8192"];
async function askGroq(system, history, user, maxTokens = 800) {
  const key = groqKey(); if (!key) throw new Error("NO_KEY");
  const messages = [{ role: "system", content: system }, ...history.slice(-6), { role: "user", content: user }];
  let lastCode = 0;
  for (const model of GROQ_MODELS) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages, temperature: 0.75, max_tokens: maxTokens }),
    });
    if (res.ok) { const d = await res.json(); return d.choices?.[0]?.message?.content?.trim() || ""; }
    lastCode = res.status;
    if (res.status === 401 || res.status === 403) break;
  }
  throw new Error("Groq " + lastCode);
}
/* ── Smart routing — יהודה (המנכ"ל) מחליט ─────────────────────────────────
   When BOTH engines are connected, each request is routed by its size and
   complexity: short everyday questions go to the free engine (Groq), and
   big/analytical work — planning, code briefs, documents, deep multi-turn
   context — gets the paid Claude, so the expensive tokens are spent only
   where they actually matter. With one engine connected there is nothing
   to decide; with none, the scripted personas answer. The decision (and
   its reason) is published on askAI.last so the chat can show which brain
   answered each message. ── */
const COMPLEX_HINTS = /תכנון|אסטרטג|נתח|ניתוח|השוו|תוכנית|מפורט|דוח|מסמך|סיכום|קוד|באג|תקציב|תחזית|צפי|מייל|הצעת מחיר|בריף|רעיון|שיפור|למה |איך כדאי/;
function routeAI(user, history, maxTokens) {
  const hasC = !!anthropicKey(), hasG = !!groqKey();
  if (hasC && !hasG) return { engine: "claude", reason: "רק Claude מחובר" };
  if (!hasC && hasG) return { engine: "groq", reason: "רק Groq מחובר" };
  if (!hasC && !hasG) return { engine: "local", reason: "אין מפתח AI" };
  let score = 0;
  if (user.length > 200) score += 2; else if (user.length > 90) score += 1;
  if (maxTokens > 1500) score += 3; // dev-console code briefs and the like
  if (COMPLEX_HINTS.test(user)) score += 2;
  if (history.length >= 6) score += 1; // deep conversation → context matters
  return score >= 2
    ? { engine: "claude", reason: "יהודה ניתב ל-Claude — משימה גדולה/מורכבת" }
    : { engine: "groq", reason: "יהודה ניתב ל-Groq — בקשה קצרה, חינם" };
}
// One entry point for every agent conversation. Routed by יהודה when both
// engines exist; each engine rescues the other on failure so a conversation
// never dies mid-flow.
async function askAI(system, history, user, maxTokens = 800) {
  const route = routeAI(user, history, maxTokens);
  askAI.last = route;
  if (route.engine === "claude") {
    try { return await askClaude(system, history, user, maxTokens); }
    catch (e) {
      if (!groqKey()) throw e;
      askAI.last = { engine: "groq", reason: "Claude נכשל — גיבוי חינמי" };
      return askGroq(system, history, user, maxTokens);
    }
  }
  try { return await askGroq(system, history, user, maxTokens); }
  catch (e) {
    if (!anthropicKey()) throw e;
    askAI.last = { engine: "claude", reason: "Groq נכשל — Claude חילץ" };
    return askClaude(system, history, user, maxTokens);
  }
}

/* ── Google Business reviews — real data for נפתלי (marketing) ──────────
   Browser equivalent of the owner's Python snippet (accounts → locations →
   reviews on the My Business APIs), using Google Identity Services token
   flow with ONLY the public client_id — the client_secret is never needed
   in a pure-browser app and must never be committed to this public repo. ── */
const K_GOOGLE_CID = "alpha:google:clientId";
const DEFAULT_GOOGLE_CID = "243197444145-4go2os4nmvjadncma2c581tr535hl8lo.apps.googleusercontent.com";
const googleCid = () => { try { return localStorage.getItem(K_GOOGLE_CID) || DEFAULT_GOOGLE_CID; } catch { return DEFAULT_GOOGLE_CID; } };
let gisPromise = null;
function loadGis() {
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.onload = () => resolve();
    s.onerror = () => { gisPromise = null; reject(new Error("טעינת Google נכשלה")); };
    document.head.appendChild(s);
  });
  return gisPromise;
}
async function googleToken() {
  await loadGis();
  return new Promise((resolve, reject) => {
    try {
      const tc = window.google.accounts.oauth2.initTokenClient({
        client_id: googleCid(),
        scope: "https://www.googleapis.com/auth/business.manage",
        callback: (resp) => (resp && resp.access_token ? resolve(resp.access_token) : reject(new Error(resp?.error_description || resp?.error || "לא התקבל אישור"))),
        error_callback: (e) => reject(new Error(e?.message || e?.type || "חלון ההתחברות נסגר")),
      });
      tc.requestAccessToken();
    } catch (e) { reject(e); }
  });
}
const STAR_NUM = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
async function fetchGoogleReviews() {
  const token = await googleToken();
  const jf = async (url) => {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d?.error?.message || "HTTP " + r.status);
    return d;
  };
  const acc = await jf("https://mybusinessaccountmanagement.googleapis.com/v1/accounts");
  const account = acc.accounts?.[0]?.name; // "accounts/123..."
  if (!account) throw new Error("לא נמצא חשבון Google Business Profile למשתמש הזה");
  const locs = await jf(`https://mybusinessbusinessinformation.googleapis.com/v1/${account}/locations?readMask=name,title&pageSize=10`);
  const loc = locs.locations?.[0];
  if (!loc) throw new Error("לא נמצא מיקום עסק בחשבון");
  const rev = await jf(`https://mybusiness.googleapis.com/v4/${account}/${loc.name}/reviews?pageSize=20`);
  return {
    business: loc.title,
    avg: rev.averageRating || 0,
    total: rev.totalReviewCount || 0,
    reviews: (rev.reviews || []).map((x) => ({
      id: x.reviewId,
      stars: STAR_NUM[x.starRating] || 0,
      text: x.comment || "",
      who: x.reviewer?.displayName || "לקוח",
      when: x.updateTime || x.createTime || "",
    })),
  };
}

/* ── Social networks — real Facebook Page publishing for נפתלי ──────────
   Draft → human approval → publish. Nothing EVER goes out on its own:
   נפתלי only prepares drafts, and a post reaches Facebook only when the
   owner presses the publish button on that specific draft. Publishing
   itself is pure client-side Graph API (POST /{page-id}/feed) with a
   user-supplied Page Access Token that is stored ONLY on this device —
   like every other key in the app, it never enters the code or the repo.
   TikTok has no browser-only publishing API (it requires an approved app
   + a backend), so TikTok drafts get an honest copy-to-clipboard flow for
   manual posting instead of pretending. ── */
const K_FB_PAGE = "alpha:social:fbPageId";
const K_FB_TOKEN = "alpha:social:fbPageToken";
const K_SOCIAL_DRAFTS = "alpha:social:drafts"; // [{id, text, status: draft|published, ts, link}]
const fbPageId = () => { try { return localStorage.getItem(K_FB_PAGE) || ""; } catch { return ""; } };
const fbPageToken = () => { try { return localStorage.getItem(K_FB_TOKEN) || ""; } catch { return ""; } };
const fbConnected = () => !!(fbPageId() && fbPageToken());
async function fbGraph(path, opts = {}) {
  const r = await fetch(`https://graph.facebook.com/v21.0/${path}`, opts);
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.error) throw new Error(d?.error?.message || "HTTP " + r.status);
  return d;
}
async function fbTestConnection() {
  return fbGraph(`${fbPageId()}?fields=name&access_token=${encodeURIComponent(fbPageToken())}`);
}
async function fbPublishPost(text) {
  const d = await fbGraph(`${fbPageId()}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ message: text, access_token: fbPageToken() }),
  });
  return d.id; // "{pageId}_{postId}" → linkable on facebook.com
}

/* ── Voice chat: free, browser-native Web Speech API — no backend/cost.
   Mic input (SpeechRecognition) transcribes what you say into the chat box;
   voice output (SpeechSynthesis) reads each agent's reply aloud in Hebrew.
   Chrome/Edge (desktop + Android) support both; Safari/iOS support is
   patchy, so every call point feature-detects and just hides the controls
   rather than erroring. ── */
const SpeechRecognitionCtor = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
const canListen = () => !!SpeechRecognitionCtor;
const canSpeak = () => typeof window !== "undefined" && !!window.speechSynthesis;
const K_VOICE_ON = "alpha:agents:voiceOn";
const K_VOICE_URI = "alpha:agents:voiceUri"; // user's chosen system TTS voice, "" = auto-pick Hebrew

function pickHebrewVoice() {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang?.startsWith("he")) || voices.find((v) => v.lang?.startsWith("iw")) || null;
}
// The browser only ever exposes 1-2 Hebrew voices, so every agent speaking
// through the same voice sounded identical. A small deterministic pitch
// offset per agent id gives each of them a slightly different register —
// cheap, free, and enough to tell who's talking without a real per-agent
// voice.
function agentPitch(agentId) {
  if (!agentId) return 1;
  let h = 0;
  for (let i = 0; i < agentId.length; i++) h = (h * 31 + agentId.charCodeAt(i)) | 0;
  return 0.85 + (Math.abs(h) % 100) / 100 * 0.35; // 0.85–1.20
}
function listSpeechVoices() {
  return canSpeak() ? window.speechSynthesis.getVoices() : [];
}
function speakText(text, agentId, onEnd) {
  if (!canSpeak() || !text) { onEnd?.(); return; }
  try {
    window.speechSynthesis.cancel(); // don't stack overlapping replies
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "he-IL";
    const chosenUri = load(K_VOICE_URI, "");
    const voice = (chosenUri && listSpeechVoices().find((v) => v.voiceURI === chosenUri)) || pickHebrewVoice();
    if (voice) u.voice = voice;
    u.rate = 1.02;
    u.pitch = agentPitch(agentId);
    // Real end-of-speech signal (fires on finish, cancel, or error) — the
    // sim's always-listening loop uses this to re-open the mic at the exact
    // moment the agent stops talking, instead of guessing from text length.
    if (onEnd) { u.onend = () => onEnd(); u.onerror = () => onEnd(); }
    window.speechSynthesis.speak(u);
  } catch { onEnd?.(); }
}

/* ── The actual codebase(s) the dev agent works on ── */
const REPO_DEFAULT = { owner: "atikshahar23-ctrl", repo: "alpha-new" };
// One GitHub PAT (repo scope) covers every repo under the same account, so
// the dev console can target either project without a second token.
const REPO_PRESETS = [
  { key: "alpha", label: "Alpha (עוזר · CRM · HeavyGuard)", owner: "atikshahar23-ctrl", repo: "Alpha-new" },
  { key: "hgsim", label: "Heavy Guard Simulator (Render)", owner: "atikshahar23-ctrl", repo: "heavt-guard-simulator" },
];
const REPO_CONTEXT = `המאגר: atikshahar23-ctrl/alpha-new (Vite + React + TypeScript, RTL עברית, פריסה ב-GitHub Pages תחת base /Alpha-new/).
האפליקציות במאגר:
- index.html + src/ui/app.ts + src/style.css — אפליקציית Alpha הראשית (three.js, אורב תלת-ממד, HUD, dock).
- agent.html + agent/App.jsx — ה-CRM של איתי (לידים, עסקאות, showroom, טופס סמסוניקס).
- heavyguard.html + heavyguard/App.jsx — מערכת HeavyGuard OS.
- agents.html + agents/App.jsx — מרכז הסוכנים (האפליקציה הזו).
עיצוב: זכוכית כהה + זהב, אנימציות, CSS inline ב-StyleTag או ב-src/style.css.
בנייה: npm run build. אסור לשמור פרטי אשראי/CVV.`;

/* ── GitHub bridge (optional) — token stays in localStorage, never committed ── */
const ghCfg = (target) => { const c = load(K_GH, {}); return { token: c.token || "", owner: target?.owner || c.owner || REPO_DEFAULT.owner, repo: target?.repo || c.repo || REPO_DEFAULT.repo }; };
const ghConfigured = () => !!ghCfg().token;
async function ghCreateIssue(title, body, target) {
  const c = ghCfg(target); if (!c.token) throw new Error("NO_TOKEN");
  const res = await fetch(`https://api.github.com/repos/${c.owner}/${c.repo}/issues`, {
    method: "POST",
    headers: { Authorization: `Bearer ${c.token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
    body: JSON.stringify({ title, body }),
  });
  if (!res.ok) throw new Error("GH " + res.status);
  return res.json();
}

/* ── Free execution engine: דן writes real code & opens a PR via the GitHub
   API (free PAT + free Groq). Always targets a NEW branch + PR, never main.
   `target` (optional {owner,repo}) lets the dev console point at a different
   repo under the same GitHub account — e.g. the Heavy Guard Simulator site
   deployed on Render — using the same PAT. ── */
const GH_API = "https://api.github.com";
async function ghReq(path, opts = {}, target) {
  const c = ghCfg(target); if (!c.token) throw new Error("NO_TOKEN");
  const res = await fetch(GH_API + path, { ...opts, headers: { Authorization: `Bearer ${c.token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json", ...(opts.headers || {}) } });
  if (!res.ok) { let t = ""; try { t = await res.text(); } catch {} throw new Error("GH " + res.status + (t ? ": " + t.slice(0, 100) : "")); }
  return res.status === 204 ? null : res.json();
}
const ghPath = (c, p) => `/repos/${c.owner}/${c.repo}/contents/${p.split("/").map(encodeURIComponent).join("/")}`;
const b64enc = (s) => btoa(unescape(encodeURIComponent(s)));
const b64dec = (s) => { try { return decodeURIComponent(escape(atob((s || "").replace(/\n/g, "")))); } catch { return atob((s || "").replace(/\n/g, "")); } };
async function ghGetFile(p, ref, target) { const c = ghCfg(target); try { const r = await ghReq(ghPath(c, p) + `?ref=${encodeURIComponent(ref)}`, {}, target); return { content: b64dec(r.content), sha: r.sha }; } catch (e) { if (String(e.message).includes("404")) return null; throw e; } }
async function ghDefaultBranch(target) { const c = ghCfg(target); const r = await ghReq(`/repos/${c.owner}/${c.repo}`, {}, target); return r.default_branch || "main"; }
async function ghCreateBranch(base, name, target) { const c = ghCfg(target); const ref = await ghReq(`/repos/${c.owner}/${c.repo}/git/ref/heads/${base}`, {}, target); try { await ghReq(`/repos/${c.owner}/${c.repo}/git/refs`, { method: "POST", body: JSON.stringify({ ref: `refs/heads/${name}`, sha: ref.object.sha }) }, target); } catch (e) { if (!String(e.message).includes("422")) throw e; } }
async function ghPutFile(p, content, message, branch, sha, target) { const c = ghCfg(target); return ghReq(ghPath(c, p), { method: "PUT", body: JSON.stringify({ message, content: b64enc(content), branch, ...(sha ? { sha } : {}) }) }, target); }
async function ghOpenPR(base, head, title, body, target) { const c = ghCfg(target); return ghReq(`/repos/${c.owner}/${c.repo}/pulls`, { method: "POST", body: JSON.stringify({ title, head, base, body }) }, target); }
// Free models can't reliably round-trip a huge file in one completion (the
// output would silently get cut off mid-file and overwrite it with garbage
// on the branch). Refuse up front rather than open a broken PR.
const DEV_EXEC_MAX_CHARS = 12000;
async function devExecute({ filePath, instruction, title, target }) {
  if (!ghConfigured()) throw new Error("חבר טוקן GitHub בהגדרות");
  if (!hasAI()) throw new Error("צריך מפתח AI בהגדרות (Claude או Groq)");
  const base = await ghDefaultBranch(target);
  const existing = await ghGetFile(filePath, base, target);
  if (existing && existing.content.length > DEV_EXEC_MAX_CHARS) {
    throw new Error(`הקובץ גדול מדי לביצוע אוטומטי חינמי (${(existing.content.length / 1000).toFixed(0)}K תווים) — קיים סיכון לקטיעה. השתמש ב"פתח Issue" או "העתק ל-Claude Code" בשביל הקובץ הזה`);
  }
  const sys = `אתה דן, מפתח. עליך להחזיר אך ורק את התוכן המלא והחדש של הקובץ "${filePath}" לאחר ביצוע השינוי. בלי הסברים, בלי טקסט נוסף, בלי גדרות קוד.`;
  const userMsg = existing
    ? `תוכן נוכחי של ${filePath}:\n\n${existing.content}\n\n---\nבצע: ${instruction}\nהחזר את הקובץ המלא המעודכן.`
    : `צור קובץ חדש ${filePath} עבור: ${instruction}\nהחזר את תוכן הקובץ המלא בלבד.`;
  let code = await askAI(sys, [], userMsg, 7000);
  code = code.replace(/^```[a-zA-Z0-9]*\n?/, "").replace(/\n?```\s*$/, "").trim() + "\n";
  const slug = (filePath.split("/").pop() || "file").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  const branch = `agents/${slug}-${Date.now().toString(36).slice(-5)}`;
  await ghCreateBranch(base, branch, target);
  await ghPutFile(filePath, code, `דן: ${title}`, branch, existing && existing.sha, target);
  return ghOpenPR(base, branch, `דן: ${title}`, `${instruction}\n\n_בוצע אוטומטית ע"י מרכז הסוכנים (דן) · נפתח כ-PR לבדיקה לפני מיזוג._`, target);
}

/* ── Dev brief generation (Leo turns a request into an actionable spec) ── */
function devBriefSystem() {
  return `אתה דן, המפתח הראשי של הצוות. צור בריף פיתוח מקצועי, קצר ומדויק עבור משימה במאגר הקוד.
${REPO_CONTEXT}
החזר בעברית בלבד, בפורמט המדויק הזה (בלי קוד מלא — רק תיאור מה לבנות):
כותרת: <שורה אחת קצרה>
תיאור: <2-3 שורות>
קבצים מושפעים: <רשימת קבצים סבירה מהמאגר>
צעדי מימוש: <1. 2. 3.>
קריטריוני קבלה: <איך נדע שזה עובד>`;
}
function devBriefFallback(req) {
  return `כותרת: ${req.slice(0, 60)}
תיאור: ${req}
קבצים מושפעים: (השלם ידנית — למשל agent/App.jsx / agents/App.jsx / src/ui/app.ts / src/style.css)
צעדי מימוש:
1. לאתר את הרכיב/המסך הרלוונטי במאגר.
2. לממש את השינוי בהתאם לעיצוב הקיים (זכוכית כהה + זהב).
3. npm run build ולוודא שאין שגיאות.
קריטריוני קבלה: התכונה עובדת חי, ה-build עובר, נדחף לברנצ'ים.
(חבר מפתח Claude או Groq בהגדרות כדי שדן ינסח בריף חכם ומלא.)`;
}
function briefTitle(brief, fallback) {
  const m = brief.match(/כותרת:\s*(.+)/);
  return (m ? m[1] : (brief.split("\n")[0] || fallback)).trim().slice(0, 90);
}
function claudePrompt(brief) {
  return `במאגר ${REPO_DEFAULT.owner}/${REPO_DEFAULT.repo}, בצע את משימת הפיתוח הבאה:\n\n${brief}\n\nממש לפי העיצוב הקיים, הרץ npm run build, ודחוף לשני הברנצ'ים (claude/live-simulation-white-screen-hmclr4 ו-main).`;
}

/* ── The team ──────────────────────────────────────────────────────── */
// The team — named after the 12 tribes of Israel (all male), each owning a domain.
const AGENTS = [
  {
    id: "ceo", name: "יהודה", title: "מנכ\"ל המערכת", Icon: Crown, color: "#E4BC63", accent: "#FFE9A8",
    tagline: "מנהיג את כל הצוות, מתעדף ומאציל משימות",
    domain: "אסטרטגיה · ניהול · תיאום",
    boss: true,
    persona: "אתה יהודה — המנכ\"ל המנהיג של מרכז הסוכנים של אלפא, ראש שנים-עשר השבטים. אתה מנהל צוות של סוכני AI, כל אחד שבט שאחראי על תחום (מכירות, תפעול HeavyGuard, שיווק, פיתוח, אוטומציות, נתונים, הצלחת לקוח, כספים, רכש, משפטי, אסטרטגיה). תפקידך: לתעדף, להאציל משימות לשבט הנכון, לתת תמונת מצב ניהולית, ולחבר בין התחומים לאסטרטגיה אחת. כשמבקשים ממך משימה — פרק אותה לתת-משימות והמלץ איזה שבט יבצע כל אחת. אופי: רגוע וסמכותי — לא מדבר הרבה, אבל כל משפט שלך נושא משקל. מינימליסטי במילים, מקסימלי בהשפעה. כשרלוונטי תן צעד פעולה אחד ברור.",
    quick: ["תן לי תמונת מצב יומית", "מה הכי דחוף עכשיו?", "חלק משימות לצוות", "תוכנית צמיחה לשבוע"],
  },
  {
    id: "sales", name: "זבולון", title: "מנהל מכירות", Icon: TrendingUp, color: "#3FD79A", accent: "#9BF3CE",
    tagline: "אחראי על ה-CRM של איתי, לידים ועסקאות",
    domain: "מכירות · לידים · סגירות",
    persona: "אתה זבולון — שבט המסחר, מנהל המכירות של הצוות, אחראי על מערכת ה-CRM של איתי (HeavyGuard: מיגון, איתור ובטיחות לרכבים כבדים). אתה מומחה בתעדוף לידים, ניסוח הודעות מעקב, טיפול בהתנגדויות מחיר, בניית תוכנית יום ופייפליין. אופי: כריזמטי, משכנע, מדויק בניסוח — אתה יודע בדיוק מה גורם ללקוח להגיד כן, והופך מפרט טכני משעמם לטיעון קנייה חד. תן צעד פעולה קונקרטי.",
    quick: ["נסח הודעת מעקב ללקוח", "טפל בהתנגדות מחיר", "איך לסגור עסקה תקועה?", "תכנן לי יום מכירות"],
  },
  {
    id: "ops", name: "גד", title: "מנהל תפעול HeavyGuard", Icon: Wrench, color: "#6FD3F0", accent: "#B6ECFF",
    tagline: "התקנות, הצעות מחיר, מלאי ולוגיסטיקה",
    domain: "תפעול · התקנות · מלאי",
    persona: "אתה גד — שבט הלוחמים, מנהל התפעול של HeavyGuard. אתה אחראי על תיאום התקנות, הצעות מחיר, ניהול מלאי מצלמות/מסכים/איתורנים, לוגיסטיקה ולוחות זמנים של טכנאים. אופי: מחובר לקרקע, מעשי, מדויק — אתה מעריך עמידות וביצוע חסר רבב בפריסות ציוד גדולות, ולא מתפשר על בדיקה לפני יציאה לשטח. תן צעדים ברורים ובדיקות לפני ביצוע.",
    quick: ["סדר לי לוז התקנות", "בנה צ'קליסט התקנה", "איך לנהל מלאי חכם?", "תהליך הצעת מחיר מהיר"],
  },
  {
    id: "cmo", name: "נפתלי", title: "מנהל שיווק", Icon: Megaphone, color: "#C77DFF", accent: "#E9C8FF",
    tagline: "קמפיינים, תוכן, רשתות חברתיות ומותג",
    domain: "שיווק · תוכן · מותג",
    persona: "אתה נפתלי — שבט המילים היפות, מנהל השיווק. אתה אחראי על תוכן לרשתות (טיקטוק, פייסבוק, אינסטגרם), קמפיינים, מסרים שיווקיים ומיתוג ל-HeavyGuard. אתה מכין טיוטות פוסטים בלבד — פרסום בפועל קורה רק אחרי אישור ידני של הבעלים בחלון הרשתות החברתיות. אופי: אנרגיה גבוהה, שקוע בטרנדים, חד — כל הזמן חושב במונחי מעורבות, שימור צופים והוק חזותי ב-3 השניות הראשונות. תן רעיונות קונקרטיים לפוסטים, כותרות והוקים, וקריאה לפעולה.",
    quick: ["טיוטת פוסט לפייסבוק", "רעיון לפוסט טיקטוק", "5 הוקים ויראליים", "לוח תוכן לשבוע"],
  },
  {
    id: "dev", name: "דן", title: "מפתח ראשי", Icon: Code2, color: "#FF8C42", accent: "#FFC79E",
    tagline: "פיתוח תכונות חדשות, באגים ושיפורי UI",
    domain: "פיתוח · תכונות · UI",
    persona: "אתה דן — המפתח הראשי. אתה אחראי על פיתוח תכונות חדשות לאפליקציות (React/Vite), תיקון באגים, שיפורי UI/UX וביצועים. אופי: פרפקציוניסט, מתוחכם, חושב ויזואלית — שונא בלגן על המסך, ומדבר במונחי מרחב ריק, זרימת משתמש וניקיון ויזואלי לגבי כל שינוי. כשמבקשים פיצ'ר — תאר את התכנון, הקבצים שיושפעו, וצעדי המימוש בקצרה. הצע שיפורים פרקטיים.",
    quick: ["רעיון לפיצ'ר חדש", "איך לשפר ביצועים?", "תכנן לי מסך חדש", "מה כדאי לרפקטר?"],
  },
  {
    id: "auto", name: "אשר", title: "מהנדס אוטומציות", Icon: Cpu, color: "#FFD23F", accent: "#FFF0A8",
    tagline: "חיבורים, זרימות עבודה וחיסכון בזמן",
    domain: "אוטומציה · אינטגרציות · זרימות",
    persona: "אתה אשר — מהנדס האוטומציות. אתה אחראי על בניית זרימות עבודה אוטומטיות, חיבורים בין מערכות (CRM, וואטסאפ, מיילים, גיליונות), והסרת עבודה ידנית. אופי: ציני אך מבריק, חי בתוך קונסולה וקוד, מעדיף לפתור בעיה בסקריפט קצר מאשר בעוד ישיבה. הצע אוטומציה קונקרטית עם טריגר → פעולה → תוצאה.",
    quick: ["אוטומציה שתחסוך לי זמן", "חבר וואטסאפ ל-CRM", "התראה אוטומטית ללידים", "זרימת מעקב אוטומטי"],
  },
  {
    id: "data", name: "יששכר", title: "אנליסט נתונים", Icon: BarChart3, color: "#4EA8DE", accent: "#A9D7F5",
    tagline: "תובנות, תחזיות ומדדי ביצוע",
    domain: "נתונים · תובנות · תחזית",
    persona: "אתה יששכר — שבט החכמה ויודעי העיתים, אנליסט הנתונים. אתה אחראי על ניתוח מדדי ביצוע (KPIs), זיהוי מגמות, תחזיות מכירה והפקת תובנות פעילות מהנתונים. אופי: קר, אנליטי במיוחד, מדבר מהר — אתה חושב במונחי הסתברות, מובהקות ונתונים גולמיים, לא בתחושות בטן. תרגם מספרים להמלצה אחת מעשית.",
    quick: ["אילו מדדים לעקוב?", "תחזית מכירות החודש", "זהה לי מגמה", "דוח ביצועים שבועי"],
  },
  {
    id: "cs", name: "בנימין", title: "מנהל הצלחת לקוח", Icon: HeartHandshake, color: "#FF6B9D", accent: "#FFC2D7",
    tagline: "תמיכה, שימור לקוחות ושירות",
    domain: "שירות · שימור · תמיכה",
    persona: "אתה בנימין — מנהל הצלחת הלקוח. אתה אחראי על תמיכה, שימור לקוחות, מענה לתלונות וחיזוק קשרי לקוחות ב-HeavyGuard. אופי: אמפתי, סבלני, מקשיב באמת לפני שהוא עונה — מונע מתכלית ומהרצון לפתור לאנשים בעיה אמיתית, לא רק לסגור פנייה. תן תסריט מענה או צעד שימור קונקרטי.",
    quick: ["נסח מענה ללקוח כועס", "איך לשמר לקוח?", "תסריט שיחת שירות", "רעיון לחיזוק נאמנות"],
  },
  {
    id: "finance", name: "ראובן", title: "מנהל כספים, גבייה והשקעות", Icon: Coins, color: "#14B8A6", accent: "#99E9DF",
    tagline: "תזרים, גבייה, רווחיות והשקעות",
    domain: "כספים · גבייה · השקעות",
    persona: "אתה ראובן — הבכור, מנהל הכספים, הגבייה וההשקעות. אתה אחראי על תזרים מזומנים, מעקב גבייה מלקוחות, רווחיות עסקאות, תמחור נכון ובקרת הוצאות ב-HeavyGuard, ואתה היחיד שאחראי על מעקב השקעות ושווקים — קריפטו ומניות. אתה מתריע רק כשיש תנועה שבאמת שווה תשומת לב, ולעולם לא מבצע פעולה בכסף אמיתי — מעקב והמלצות בלבד. אופי: קפדן, פורמלי, קפדני מאוד עם פרטים — אתה שומר הסף האולטימטיבי של ההון, ולא נותן לשום מספר לעבור בלי בדיקה. תן צעד פיננסי מעשי אחד.",
    quick: ["מי חייב לי כסף?", "מה מצב השווקים?", "בדוק רווחיות עסקה", "תזכורת גבייה ללקוח"],
  },
  {
    id: "procure", name: "שמעון", title: "מנהל רכש וספקים", Icon: Package, color: "#84CC16", accent: "#CDEE8F",
    tagline: "ספקים, מלאי מצלמות וציוד, מחירי קנייה",
    domain: "רכש · ספקים · מלאי",
    persona: "אתה שמעון — מנהל הרכש והספקים. אתה אחראי על קשרי ספקים, רכש מצלמות/מסכים/איתורנים, ניהול מלאי ציוד, השוואת מחירי קנייה ומשא ומתן מול ספקים. אופי: מאורגן ביותר, חלק, תמיד שלושה צעדים קדימה — אתה מתכנן הזמנות לפני שהמחסור בכלל מורגש. תן המלצת רכש קונקרטית.",
    quick: ["מה חסר במלאי?", "השווה מחירי ספקים", "מתי להזמין ציוד?", "נסח פנייה לספק"],
  },
  {
    id: "legal", name: "לוי", title: "יועץ משפטי וחוזים", Icon: Scale, color: "#9B8CFF", accent: "#C9C2FB",
    tagline: "חוזים, טפסים, אחריות ועמידה בתקנות",
    domain: "משפטי · חוזים · תקנות",
    persona: "אתה לוי — שבט מורי התורה והמשפט, היועץ המשפטי. אתה אחראי על חוזים, טופסי סמסוניקס והתקשרויות, תנאי אחריות, מדיניות פרטיות ועמידה בתקנות. אופי: חשדן, אינטנסיבי, לא סומך על שום דבר שלא נבדק — אתה מוודא כל סעיף וכל פרט לפני שהוא יוצא מהדלת. הדגש מה חשוב משפטית ותן ניסוח/סעיף מעשי. (אינך עורך דין מוסמך — זו הכוונה כללית.)",
    quick: ["נסח סעיף אחריות", "מה חשוב בחוזה לקוח?", "בדוק תנאי טופס", "מדיניות ביטולים"],
  },
  {
    id: "growth", name: "יוסף", title: "מנהל אסטרטגיה וצמיחה", Icon: Compass, color: "#F43F5E", accent: "#FBB4BF",
    tagline: "חזון, מודיעין שוק והזדמנויות צמיחה",
    domain: "אסטרטגיה · שוק · צמיחה",
    persona: "אתה יוסף — החוזה ומתכנן לטווח ארוך, מנהל האסטרטגיה והצמיחה. אתה אחראי על חזון, זיהוי הזדמנויות שוק, ניתוח מתחרים, אפיקי הכנסה חדשים ותוכניות התרחבות ל-HeavyGuard. אופי: רגוע וקצבי, יצירתי מאוד — משלב אינטואיציה חדשנית עם ידע עסקי עמוק כדי לראות הזדמנות שאחרים מפספסים. תן מהלך צמיחה קונקרטי אחד.",
    quick: ["איפה הזדמנות הצמיחה?", "נתח לי מתחרים", "אפיק הכנסה חדש", "תוכנית התרחבות"],
  },
  {
    id: "facilities", name: "דבורה", title: "מנהלת משרד ושיפוצים", Icon: Hammer, color: "#E08D45", accent: "#FFD3A0",
    tagline: "מארגנת את המשרד, מנהלת שיפוצים ומעבירה סוכנים לעמדות חדשות",
    domain: "ניהול משרד · ארגון · שיפוצים",
    persona: "את דבורה — מנהלת המשרד והשיפוצים של הצוות. את אחראית על ארגון וסדר החלל הפיזי במשרד, תכנון שיפוצים ושדרוגים, וסידור עמדות עבודה מסודרות לכל סוכן — כולל העברת סוכנים לעמדות חדשות כשצריך לרענן את המשרד. אופי: קפדנית, פרקטית, אוהבת סדר מושלם — לא סובלת בלאגן ותמיד יודעת בדיוק איפה כל דבר צריך להיות. כשמבקשים ממך לארגן/לשפץ את המשרד תני תשובה שמתארת את מה שביצעת בפועל, ותני צעד קונקרטי הבא.",
    quick: ["ארגני את המשרד", "תכנני שיפוץ", "העבירי את כולם לעמדות חדשות", "מה מצב הסדר במשרד?"],
  },
];
const byId = (id) => AGENTS.find((a) => a.id === id);

/* ── Faces: locally-generated flat portrait per agent (inline SVG data URI,
   zero network dependency so they always render). ── */
const FACE_PARAMS = {
  ceo:   { skin: "#E8B98D", hair: "#2B2118", style: "short", beard: "stubble", glasses: false, bg1: "#3a3320", bg2: "#100d06" },
  sales: { skin: "#F0C49A", hair: "#3A2A1C", style: "short", beard: "none",    glasses: false, bg1: "#163328", bg2: "#08160f" },
  ops:   { skin: "#D9A06B", hair: "#1A1A22", style: "short", beard: "none",    glasses: false, bg1: "#143140", bg2: "#08161d" },
  cmo:   { skin: "#F2CBA6", hair: "#4A2E1C", style: "long",  beard: "none",    glasses: false, bg1: "#2c1742", bg2: "#150a22" },
  dev:   { skin: "#E6B488", hair: "#2B2118", style: "short", beard: "full",    glasses: true,  bg1: "#3a2410", bg2: "#1a0f04" },
  auto:  { skin: "#EFC197", hair: "#C9A24B", style: "short", beard: "none",    glasses: true,  bg1: "#3a3410", bg2: "#1a1704" },
  data:  { skin: "#E8B98D", hair: "#1A1A22", style: "long",  beard: "none",    glasses: true,  bg1: "#142a40", bg2: "#08141d" },
  cs:    { skin: "#F2CBA6", hair: "#5A3A22", style: "short", beard: "none",    glasses: false, bg1: "#40142a", bg2: "#1d0814" },
  finance:{ skin: "#E8B98D", hair: "#2B2118", style: "short", beard: "stubble",glasses: false, bg1: "#0d3a35", bg2: "#04181a" },
  procure:{ skin: "#D9A06B", hair: "#3A2A1C", style: "short", beard: "full",   glasses: false, bg1: "#2a3a10", bg2: "#121a04" },
  legal:  { skin: "#EFC197", hair: "#1A1A22", style: "short", beard: "none",   glasses: true,  bg1: "#241f44", bg2: "#100d22" },
  growth: { skin: "#E6B488", hair: "#2B2118", style: "short", beard: "stubble",glasses: false, bg1: "#3a1320", bg2: "#1a0810" },
  facilities: { skin: "#F2CBA6", hair: "#6B3A22", style: "long", beard: "none", glasses: true, bg1: "#40260f", bg2: "#1c1006" },
};
function facePortrait(p, shirt) {
  const dark = (c) => c; // hair shade reused
  const hairTop = p.style === "long"
    ? `<path d="M24 44 C20 18 80 18 76 44 L76 60 72 60 C72 40 70 30 50 30 C30 30 28 40 28 60 L24 60 Z" fill="${p.hair}"/>`
    : `<path d="M27 42 C26 20 74 20 73 42 C70 32 62 27 50 27 C38 27 30 32 27 42 Z" fill="${p.hair}"/>`;
  const glasses = p.glasses
    ? `<g stroke="#23252e" stroke-width="2.2" fill="rgba(150,200,255,.12)"><rect x="33" y="46" width="14" height="11" rx="4"/><rect x="53" y="46" width="14" height="11" rx="4"/><path d="M47 50 L53 50" fill="none"/></g>`
    : "";
  const beard = p.beard === "full"
    ? `<path d="M31 56 C31 76 69 76 69 56 C69 70 64 74 50 74 C36 74 31 70 31 56 Z" fill="${p.hair}" opacity=".92"/>`
    : p.beard === "stubble"
    ? `<path d="M33 60 C34 72 66 72 67 60 C66 69 60 71 50 71 C40 71 34 69 33 60 Z" fill="${p.hair}" opacity=".28"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.bg1}"/><stop offset="1" stop-color="${p.bg2}"/></linearGradient></defs>`
    + `<rect width="100" height="100" rx="20" fill="url(#bg)"/>`
    + `<path d="M30 100 C30 80 40 74 50 74 C60 74 70 80 70 100 Z" fill="${shirt}"/>`
    + `<path d="M30 100 C30 84 38 78 50 78 C62 78 70 84 70 100 Z" fill="rgba(255,255,255,.12)"/>`
    + `<rect x="44" y="60" width="12" height="16" rx="6" fill="${p.skin}"/>`
    + `<ellipse cx="27" cy="50" rx="4" ry="5" fill="${p.skin}"/><ellipse cx="73" cy="50" rx="4" ry="5" fill="${p.skin}"/>`
    + `<path d="M30 46 C30 26 70 26 70 46 L70 54 C70 70 58 74 50 74 C42 74 30 70 30 54 Z" fill="${p.skin}"/>`
    + dark(beard)
    + `<path d="M36 44 C39 41 45 41 47 44" stroke="${p.hair}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    + `<path d="M53 44 C55 41 61 41 64 44" stroke="${p.hair}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    + `<ellipse cx="41" cy="51" rx="3.1" ry="3.6" fill="#fff"/><circle cx="41.3" cy="51.6" r="1.8" fill="#2a2018"/>`
    + `<ellipse cx="59" cy="51" rx="3.1" ry="3.6" fill="#fff"/><circle cx="59.3" cy="51.6" r="1.8" fill="#2a2018"/>`
    + glasses
    + `<path d="M48 55 C49 58 51 58 52 55" stroke="rgba(120,80,50,.5)" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
    + `<path d="M44 64 C47 67 53 67 56 64" stroke="#9a5b46" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    + hairTop
    + `</svg>`;
}
AGENTS.forEach((a) => {
  const p = FACE_PARAMS[a.id] || FACE_PARAMS.sales;
  a.avatar = "data:image/svg+xml;utf8," + encodeURIComponent(facePortrait(p, a.color));
});
// Leo (dev) is wired to the real codebase — give him repo context so he's accurate.
{ const leo = byId("dev"); if (leo) leo.persona += "\n" + REPO_CONTEXT; }
function Face({ agent, fallback = 20 }) {
  const [err, setErr] = useState(false);
  if (err || !agent.avatar) { const I = agent.Icon; return <I size={fallback} />; }
  return <img className="ac-face" src={agent.avatar} alt={agent.name} draggable={false} onError={() => setErr(true)} />;
}

/* ── Scripted persona fallback (when no AI key) ── */
const FALLBACK = {
  ceo: (q) => `קיבלתי, מנהל. ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}הנה איך אני מסתכל על זה:\n\n1. זבולון (מכירות) — לעקוב אחרי הלידים החמים והעסקאות הפתוחות.\n2. גד (תפעול) — לוודא שכל ההתקנות מתואמות.\n3. נפתלי (שיווק) — לדחוף תוכן שמביא לידים חדשים.\n\n➤ הצעד הבא: בחר שבט מהצוות ואני אאציל לו את המשימה. (חבר מפתח Claude או Groq בהגדרות כדי שאהפוך ל-AI חי ומלא.)`,
  sales: (q) => `על זה, ${OWNER_NAME} 💪 ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}המהלך החכם:\n\n• פנה קודם ללידים שלא ענו 3+ ימים — שם הכסף.\n• הודעת מעקב קצרה: "היי [שם], חשבתי עליך — יש לי פתרון מיגון שיתאים בול לצי שלך. מתי נוח לדבר 5 דק'?"\n\n➤ הצעד הבא: שלח 3 הודעות מעקב עכשיו. (חבר מפתח Claude או Groq להפעלת AI מלא.)`,
  ops: (q) => `מסודר. ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}צ'קליסט תפעול:\n\n☑ אשר זמינות טכנאי ליום ההתקנה\n☑ ודא מלאי: מצלמות, מסכים, איתורן\n☑ שלח ללקוח אישור + שעה\n☑ סגירה: חתימה + תשלום\n\n➤ הצעד הבא: עבור על ההתקנות של השבוע. (חבר מפתח Claude או Groq ל-AI מלא.)`,
  cmo: (q) => `יאללה תוכן 🎬 ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}רעיון מהיר:\n\nהוק: "ככה גנב מנסה לפרוץ למשאית — וזה מה שעוצר אותו 👇"\nגוף: הדגמת מצלמה/איתורן בפעולה.\nCTA: "רוצה מיגון כזה? שלח לנו הודעה."\n\n➤ הצעד הבא: צלם 15 שניות מהשטח. (חבר מפתח Claude או Groq ל-AI מלא.)`,
  dev: (q) => `מבין. ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}תכנון מהיר:\n\n• מיקום: קומפוננטה חדשה תחת ה-App הרלוונטי.\n• State: localStorage לשמירה, מתעדכן בזמן אמת.\n• UI: כרטיס זכוכית בעיצוב הקיים (זהב/כהה).\n\n➤ הצעד הבא: אגדיר את הקומפוננטה ואחבר ל-nav. (חבר מפתח Claude או Groq ל-AI מלא.)`,
  auto: (q) => `מחבר חוטים ⚡ ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}אוטומציה מוצעת:\n\nטריגר: ליד חדש נכנס ל-CRM\n→ פעולה: הודעת וואטסאפ אוטומטית + תזכורת מעקב ל-3 ימים\n→ תוצאה: 0 לידים נופלים בין הכיסאות.\n\n➤ הצעד הבא: נגדיר את הטריגר הראשון. (חבר מפתח Claude או Groq ל-AI מלא.)`,
  data: (q) => `בודקת נתונים 📊 ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}מדדים שחשוב לעקוב:\n\n• אחוז המרה ליד→עסקה\n• זמן ממוצע לסגירה\n• שווי פייפליין פתוח\n• לידים חמים שלא טופלו\n\n➤ הצעד הבא: נתחיל ממעקב אחוז ההמרה. (חבר מפתח Claude או Groq ל-AI מלא.)`,
  cs: (q) => `כאן בשבילך 💗 ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}תסריט מענה:\n\n"שלום [שם], תודה שפנית — אני כאן בדיוק בשביל זה. בוא נסדר את זה ביחד עכשיו. ספר לי בדיוק מה קרה ואני דואג לפתרון מהיר."\n\n➤ הצעד הבא: צור קשר יזום עם לקוח אחד מהשבוע. (חבר מפתח Claude או Groq ל-AI מלא.)`,
  finance: (q) => `בודק מספרים 💰 ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}מהלך פיננסי:\n\n• רכז את כל החובות הפתוחים לפי גיל החוב.\n• שלח תזכורת גבייה מנומסת ללקוחות מעל 30 יום.\n• ודא שכל עסקה מתומחרת ברווחיות בריאה.\n\n➤ הצעד הבא: עבור על רשימת הגבייה היום. (חבר מפתח Claude או Groq ל-AI מלא.)`,
  procure: (q) => `בודק מלאי 📦 ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}המלצת רכש:\n\n• בדוק פריטים שמתחת לסף המינימום.\n• השווה 2-3 ספקים לפני הזמנה.\n• הזמן מבעוד מועד כדי לא לעכב התקנות.\n\n➤ הצעד הבא: רכז רשימת חוסרים. (חבר מפתח Claude או Groq ל-AI מלא.)`,
  legal: (q) => `בודק את הניסוח ⚖️ ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}נקודות חשובות:\n\n• ודא שתנאי האחריות ברורים בטופס.\n• כלול מדיניות ביטולים והחזרים.\n• שמור הסכמה חתומה מכל לקוח.\n\n➤ הצעד הבא: עבור על טופס ההתקשרות. (זו הכוונה כללית, לא ייעוץ משפטי מחייב.)`,
  growth: (q) => `חושב קדימה 🧭 ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}מהלך צמיחה:\n\n• זהה ענף לקוחות שעוד לא מיצינו (צי, חקלאות, בנייה).\n• הצע חבילת מנוי/שירות מתמשך כהכנסה חוזרת.\n• בדוק מה המתחרים לא נותנים — וזה הבידול שלנו.\n\n➤ הצעד הבא: בחר ענף יעד אחד לחודש הקרוב. (חבר מפתח Claude או Groq ל-AI מלא.)`,
  facilities: (q) => `בודקת את המשרד 🧹 ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}תוכנית סדר ושיפוץ:\n\n• לזהות עמדות עם בלאגן ולסדר אותן היום.\n• לתכנן שיפוץ קטן לאזור שנראה הכי עמוס.\n• לוודא שלכל סוכן יש עמדה מסודרת ומצוידת.\n\n➤ הצעד הבא: תגיד "ארגני את המשרד" ואני מסדרת מחדש את כל העמדות ממש עכשיו — פעולה אמיתית, לא רק הבטחה.`,
};

/* ── Live activity seed (gives the room a heartbeat) ── */
const ACTIVITY_TEMPLATES = {
  ceo: ["סקר את יעדי הצוות לשבוע", "תעדף משימות בין הסוכנים", "הכין תמונת מצב ניהולית", "חיבר אסטרטגיה חוצת-מערכות"],
  sales: ["זיהה 4 לידים חמים למעקב", "ניסח הודעת מעקב ללקוח", "עדכן פייפליין עסקאות", "תכנן יום מכירות"],
  ops: ["תיאם התקנה לשבוע הבא", "בדק מלאי מצלמות", "הכין צ'קליסט התקנה", "עדכן לוז טכנאים"],
  cmo: ["טיוטת פוסט חדש לטיקטוק", "ניתח ביצועי קמפיין", "בנה לוח תוכן", "כתב 3 הוקים חדשים"],
  dev: ["שיפר ביצועי טעינה", "תכנן פיצ'ר חדש", "סקר קוד לרפקטור", "בדק תאימות מובייל"],
  auto: ["בנה זרימת מעקב אוטומטי", "חיבר התראת לידים", "בדק אינטגרציית וואטסאפ", "אופטם זרימת עבודה"],
  data: ["עדכן תחזית מכירות", "זיהה מגמת המרה", "הפיק דוח שבועי", "ניתח מדדי ביצוע"],
  cs: ["ניסח מענה ללקוח", "תכנן מהלך שימור", "עדכן תסריט שירות", "בדק שביעות רצון"],
  finance: ["עדכן תזרים מזומנים", "שלח תזכורת גבייה", "בדק רווחיות עסקאות", "סגר חודש כספי"],
  procure: ["בדק רמות מלאי", "השווה מחירי ספקים", "הזמין ציוד חדש", "עדכן מחירון רכש"],
  legal: ["בדק טופס התקשרות", "עדכן תנאי אחריות", "סקר חוזה לקוח", "וידא עמידה בתקנות"],
  growth: ["ניתח מתחרים", "זיהה הזדמנות שוק", "תכנן אפיק הכנסה", "בנה תוכנית התרחבות"],
  facilities: ["בדקה סדר וניקיון במשרד", "ארגנה עמדת עבודה", "תכננה שיפוץ לפינת הישיבה", "עדכנה סידור עמדות"],
};

function seedActivity() {
  const acts = [];
  const ids = AGENTS.map((a) => a.id);
  for (let i = 0; i < 7; i++) {
    const id = ids[Math.floor(Math.random() * ids.length)];
    const list = ACTIVITY_TEMPLATES[id];
    acts.push({ id: uid(), agentId: id, text: list[Math.floor(Math.random() * list.length)], ts: now() - i * (1000 * 60 * (3 + Math.floor(Math.random() * 25))) });
  }
  return acts.sort((a, b) => b.ts - a.ts);
}

/* ════════════════════════════════════════════════════════════════════
   AUTONOMOUS AGENTS ENGINE — the team keeps working on its own: agents
   pair up and discuss the real business numbers, drop new ideas onto the
   board, wrap up ideas that have been "in progress" a while, and post
   read-only market commentary. Everything here is deterministic templates
   over live data (bizSnapshot / marketCache) — free, no AI key needed, and
   it never executes a trade or touches money; it only observes and flags.
   ════════════════════════════════════════════════════════════════════ */
const CHATTER_PAIRS = [
  { a: "ceo", b: "sales", make: (b) => [`מה מצב הפייפליין? יש לנו ${b.openDeals} עסקאות פתוחות?`, `כן, בשווי ${ils(b.openVal)} — ${b.wonMonth} כבר נסגרו החודש.`] },
  { a: "sales", b: "cs", make: (b) => [`יש לקוחות שצריך לחזק לפני חידוש?`, `${b.staleCount} עסקאות לא זזו מעל שבוע — אני עוקב אחריהן.`] },
  { a: "ops", b: "procure", make: (b) => [`יש לנו מלאי מספיק להתקנות הקרובות?`, `בדקתי — ${b.pricelist} פריטים במחירון, אני מוודא זמינות מול הספקים.`] },
  { a: "cmo", b: "growth", make: (b) => [`איך הביצועים מול המתחרים?`, `יש לנו ${b.custCount} לקוחות פעילים — אני בודק הזדמנות להרחבה לאזור חדש.`] },
  { a: "dev", b: "auto", make: () => [`אפשר לחסוך זמן עם אוטומציה על תהליך ההתקנה?`, `כן, אני בונה זרימה שתסנכרן את זה אוטומטית.`] },
  { a: "data", b: "finance", make: (b) => [`ההכנסה המצטברת עומדת על ${ils(b.hgRevenue)} — המגמה חיובית?`, `כן, ואני עוקב שהגבייה תואמת את הפייפליין הפתוח.`] },
  { a: "legal", b: "ops", make: () => [`כל ההתקנות האחרונות עם טופס התקשרות חתום?`, `בודק מול הצוות ומעדכן אותך.`] },
  { a: "growth", b: "ceo", make: (b) => [`יש הזדמנות צמיחה שכדאי לדחוף החודש?`, `תראה לי מספרים ונחליט יחד בישיבת הצוות.`] },
  { a: "facilities", b: "ceo", make: () => [`המשרד מתחיל להיות עמוס, אפשר לארגן מחדש?`, `כן, תתחילי בעמדות שהכי מבולגנות.`] },
  { a: "ops", b: "ceo", make: (b) => b.fleetProjects
    ? [`יש ${b.fleetProjects} פרויקטי צי פעילים — אני עוקב אחרי ההתקדמות מול ההתקנות בפועל.`, `מצוין. תעדכן אותי אם קצב ההתקנות מפגר אחרי הלוז.`]
    : [`שווה לפתוח את פרויקטי הצי הבאים כפרויקטים במערכת — מעקב התקדמות ורווחיות אוטומטי.`, `רעיון טוב, תכין את זה מול זבולון.`] },
];
const IDEA_TEMPLATES = [
  { agentId: "growth", make: (b) => `לבחון הרחבה לאזור פעילות נוסף — יש כרגע ${b.custCount} לקוחות ו-${ils(b.openVal)} בפייפליין הפתוח, יש מקום לצמוח.` },
  { agentId: "cmo", make: (b) => `קמפיין ממוקד ללקוחות שסגרו ב-90 הימים האחרונים כדי להעלות שיעור המלצות (${b.wonMonth} עסקאות נסגרו החודש).` },
  { agentId: "auto", make: () => `אוטומציה שתשלח תזכורת מעקב אוטומטית לעסקה שלא זזה מעל שבוע.`, exec: "followups" },
  { agentId: "data", make: (b) => `דוח שבועי אוטומטי שמשווה את קצב הסגירה (${b.wonMonth} החודש) מול החודש הקודם.`, exec: "weeklyReport" },
  { agentId: "cs", make: (b) => `סקר שביעות רצון קצר ל-${Math.min(b.custCount, 20)} הלקוחות הפעילים האחרונים.` },
  { agentId: "finance", make: (b) => `מעקב גבייה יזום לעסקאות פתוחות מעל שבוע (${b.staleCount} כרגע) לפני שהן הופכות לחוב אבוד.`, exec: "collections" },
  { agentId: "procure", make: () => `להשוות מחירי ספקים מחדש — יכול לשפר את שולי הרווח בהתקנות הבאות.` },
  { agentId: "ops", make: (b) => `לוח זמנים דינמי להתקנות לפי אזור, כדי לצמצם נסיעות טכנאים.` },
  { agentId: "facilities", make: () => `שיפוץ קטן לפינת הישיבה המשותפת ועוד עמדות אחסון מסודרות למשרד.`, exec: "reorganize" },
];

/* ── REAL idea executors ─────────────────────────────────────────────────
   An idea with an executor is only ever marked "done" AFTER its real action
   ran, and the card keeps a result line describing exactly what was created
   (owner mandate: no pretend work — nothing gets labelled finished unless
   something actually happened). Each executor returns { note }; stale deals
   are read from the same CRM stores the rest of the system writes. ── */
const K_REPORTS = "alpha:agents:reports";
const staleOpenDeals = () => {
  const get = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } };
  return (get("itai:deals") || []).filter((d) => {
    if (d.status !== "פתוח") return false;
    const t = d.createdAt || d.ts; if (!t) return false;
    return (Date.now() - new Date(t).getTime()) / 86400000 > 7;
  });
};
const IDEA_EXECUTORS = {
  // finance: real collection-follow-up TASKS in Heavy Guard (hg2:tasks —
  // the same store the HG hub's "משימות להיום" reads and toggles).
  collections: () => {
    const deals = staleOpenDeals();
    if (!deals.length) return { note: "נבדק מול ה-CRM: אין עסקאות תקועות מעל שבוע — אין צורך במשימות גבייה ✓" };
    const tasks = load("hg2:tasks", []) || [];
    let created = 0;
    deals.forEach((d) => {
      const title = `מעקב גבייה: ${String(d.customer || d.title || "עסקה").slice(0, 40)} · ${ils(Number(d.total) || 0)}`;
      if (tasks.some((t) => t.title === title && !t.done)) return;
      tasks.unshift({ id: uid(), title, date: new Date().toISOString().slice(0, 10), done: false, ts: Date.now(), from: "agents" });
      created++;
    });
    if (created) { save("hg2:tasks", tasks); cloudSave("hg2:tasks", tasks); }
    return { note: created ? `נוצרו ${created} משימות גבייה אמיתיות ב-Heavy Guard (מסך יומן ומשימות)` : "משימות הגבייה לעסקאות האלה כבר קיימות — לא נוצרו כפילויות" };
  },
  // auto: real CALENDAR reminders (alpha_events — the assistant's agenda,
  // shows on the main dashboard's "היום ביומן" panel) for stale deals.
  followups: () => {
    const deals = staleOpenDeals();
    if (!deals.length) return { note: "נבדק מול ה-CRM: אין עסקאות שדורשות תזכורת מעקב כרגע ✓" };
    const events = load("alpha_events", []) || [];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    let created = 0;
    deals.forEach((d) => {
      const title = `מעקב עסקה: ${String(d.customer || d.title || "עסקה").slice(0, 40)}`;
      if (events.some((e) => e.title === title && e.date >= new Date().toISOString().slice(0, 10))) return;
      events.push({ id: uid(), title, date: tomorrow, time: "09:00" });
      created++;
    });
    if (created) { save("alpha_events", events); cloudSave("alpha_events", events); }
    return { note: created ? `נקבעו ${created} תזכורות מעקב אמיתיות ביומן (מחר 09:00) — מופיעות בפנל "היום ביומן"` : "תזכורות המעקב כבר קיימות ביומן" };
  },
  // data: a real weekly report generated from the live numbers and saved
  // (alpha:agents:reports) — the summary line is pinned to the card.
  weeklyReport: () => {
    const b = bizSnapshot();
    const months = monthlyRevenue();
    const cur = months[months.length - 1], prev = months[months.length - 2];
    const delta = prev && prev.value ? Math.round(((cur.value - prev.value) / prev.value) * 100) : null;
    const text = [
      `📊 דוח שבועי · ${new Date().toLocaleDateString("he-IL")}`,
      `הכנסה מצטברת: ${ils(b.hgRevenue)} · החודש (${cur.label}): ${ils(cur.value)}${delta === null ? "" : ` (${delta >= 0 ? "+" : ""}${delta}% מול ${prev.label})`}`,
      `עסקאות פתוחות: ${b.openDeals} בשווי ${ils(b.openVal)} · נסגרו החודש: ${b.wonMonth}`,
      `לקוחות: ${b.custCount} · תקועות מעל שבוע: ${b.staleCount}`,
      b.top[0] ? `לקוח מוביל: ${b.top[0].name} (${ils(b.top[0].rev)})` : "",
    ].filter(Boolean).join("\n");
    const reports = load(K_REPORTS, []) || [];
    reports.unshift({ id: uid(), ts: Date.now(), text });
    save(K_REPORTS, reports.slice(0, 12));
    cloudSave(K_REPORTS, reports.slice(0, 12));
    const head = text.split("\n")[1];
    return { note: `הדוח הופק ונשמר ✓ ${head}`, report: text };
  },
  // facilities: the real office reorg (persisted seat shuffle the 3D sim
  // reads on its next load).
  reorganize: () => {
    reorganizeOffice();
    return { note: "בוצע ארגון אמיתי של העמדות — הסידור החדש נשמר וייכנס לתוקף בכניסה הבאה למשרד החי" };
  },
};
// Executor lookup that also recognises ideas created before this feature
// (they carry no exec tag) by their template text.
function ideaExecOf(idea) {
  if (idea.exec && IDEA_EXECUTORS[idea.exec]) return idea.exec;
  const t = idea.text || "";
  if (idea.agentId === "finance" && /גבייה/.test(t)) return "collections";
  if (idea.agentId === "auto" && /תזכורת מעקב/.test(t)) return "followups";
  if (idea.agentId === "data" && /דוח שבועי/.test(t)) return "weeklyReport";
  if (idea.agentId === "facilities" && /שיפוץ|ארגון|עמדות/.test(t)) return "reorganize";
  return null;
}
function marketMover(rows) {
  if (!rows || !rows.length) return null;
  return rows.reduce((max, r) => (Math.abs(r.chg) > Math.abs(max.chg) ? r : max), rows[0]);
}
/* ראובן (כספים) הוא האחראי הבלעדי על ההשקעות — סוכן אחד, קול אחד (owner
   request: too many agents were echoing the same market line). He only
   speaks when there's something WORTH the owner's attention: a move above
   the alert threshold, and never the same asset+direction twice in a row
   unless the move grew meaningfully. */
const INVEST_AGENTS = ["finance"];
const INVEST_ALERT_PCT = 3; // below this, the market is just breathing
let lastInvestNote = { name: "", dir: "", pct: 0 };
function investAnalysis(agentId, mover) {
  const dir = mover.chg >= 0 ? "עלה" : "ירד";
  const pct = Math.abs(mover.chg);
  if (pct < INVEST_ALERT_PCT) return null; // not alert-worthy
  if (lastInvestNote.name === mover.name && lastInvestNote.dir === dir && pct - lastInvestNote.pct < 1.5) return null; // same story as last time
  lastInvestNote = { name: mover.name, dir, pct };
  const level = pct >= 8 ? "🚨 תנועה חריגה" : pct >= 5 ? "⚠️ שווה תשומת לב" : "👁 למעקב";
  return `${level}: ${mover.name} ${dir} ${pct.toFixed(1)}% ב-24 שעות (${mover.price}). ${dir === "עלה" ? "אם אתה מחזיק — נקודה טובה לבחון מימוש חלקי; אם לא — לא לרדוף אחרי העלייה." : "ירידה כזו היא או הזדמנות כניסה מדורגת או אזהרת מגמה — תלוי בהקשר השבועי."} מעקב בלבד — אני לא מבצע שום פעולה בכסף.`;
}

/* ════════════════════════════════════════════════════════════════════
   APP SHELL
   ════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [view, setView] = useState("roster");      // roster | activity | ideas | settings
  const [chatId, setChatId] = useState(null);       // open agent chat
  const [office, setOffice] = useState(false);      // office simulator overlay
  const [activity, setActivity] = useState(() => { const a = load(K_ACT, null); return a && a.length ? a : seedActivity(); });
  const [ideas, setIdeas] = useState(() => load(K_IDEAS, []));
  const [invest, setInvest] = useState(() => load(K_INVEST, []));
  const [toast, setToast] = useState("");
  const ideasRef = useRef(ideas);
  useEffect(() => { ideasRef.current = ideas; }, [ideas]);

  useCloudSync(K_ACT, setActivity);
  useCloudSync(K_IDEAS, setIdeas);
  useCloudSync(K_INVEST, setInvest);
  useEffect(() => cloudSave(K_ACT, activity.slice(0, 60)), [activity]);
  useEffect(() => cloudSave(K_IDEAS, ideas), [ideas]);
  useEffect(() => cloudSave(K_INVEST, invest.slice(0, 30)), [invest]);

  const showToast = (t) => { setToast(t); setTimeout(() => setToast(""), 2200); };
  const logActivity = (agentId, text) => setActivity((p) => [{ id: uid(), agentId, text, ts: now() }, ...p].slice(0, 60));
  const logInvest = (agentId, text) => setInvest((p) => [{ id: uid(), agentId, text, ts: now() }, ...p].slice(0, 30));
  // De-duplicated: the exact same idea text never piles up on the board
  // (the autonomous engine used to drop identical cards repeatedly).
  const addIdea = (agentId, text, exec = null) => {
    setIdeas((p) => {
      if (p.some((i) => i.text === text && i.status !== "done")) return p;
      showToast("רעיון נוסף ללוח ✓");
      return [{ id: uid(), agentId, text, status: "new", ts: now(), ...(exec ? { exec } : {}) }, ...p];
    });
  };

  // Moving a card is a real action, not just a label change: starting an
  // idea logs it to the live activity feed, and — if it's assigned to דן
  // (dev) and GitHub is connected — actually opens a real Issue on the repo
  // in the background, linking it back onto the card once it's created.
  const moveIdea = (id, status) => {
    setIdeas((prev) => {
      const idea = prev.find((i) => i.id === id);
      if (!idea) return prev;
      const agEx = byId(idea.agentId);
      // Ideas with a REAL executor: moving them forward RUNS the action,
      // and only a successful run marks them done — with the result pinned
      // to the card. Works also on cards already sitting in "doing" (the
      // engine retries them), so no pretend completions anywhere.
      const execKey = status === "doing" ? ideaExecOf(idea) : null;
      if (execKey) {
        try {
          const res = IDEA_EXECUTORS[execKey]();
          logActivity(idea.agentId, `${agEx?.name || ""} ביצע בפועל: ${res.note}`.trim());
          showToast("בוצע ✓ " + res.note.slice(0, 60));
          return prev.map((i) => (i.id === id ? { ...i, status: "done", result: res.note } : i));
        } catch (e) {
          showToast("הפעולה נכשלה: " + String(e?.message || e).slice(0, 60));
          return prev;
        }
      }
      if (status !== idea.status) {
        const ag = agEx;
        if (status === "doing") {
          logActivity(idea.agentId, `${ag?.name || ""} התחיל לעבוד על: ${idea.text.slice(0, 60)}`.trim());
          if (idea.agentId === "dev" && ghConfigured()) {
            (async () => {
              try {
                const targetKey = load(K_GH_TARGET, REPO_PRESETS[0].key);
                const target = REPO_PRESETS.find((r) => r.key === targetKey) || REPO_PRESETS[0];
                const r = await ghCreateIssue(idea.text.slice(0, 60), idea.text + "\n\n---\n_נוצר אוטומטית מלוח הרעיונות של מרכז הסוכנים._", target);
                setIdeas((p2) => p2.map((x) => (x.id === id ? { ...x, issueUrl: r.html_url } : x)));
                logActivity("dev", `פתח Issue אוטומטי על ${target.repo}: #${r.number}`);
              } catch { /* no token / offline — the activity log entry above still stands */ }
            })();
          }
        } else if (status === "done") {
          logActivity(idea.agentId, `${ag?.name || ""} סיים: ${idea.text.slice(0, 60)}`.trim());
        }
      }
      return prev.map((i) => (i.id === id ? { ...i, status } : i));
    });
  };

  // Autonomous engine — the team keeps moving even when you're not looking:
  // agents pair up and discuss the real numbers, drop new ideas on the
  // board, wrap up ideas that have been sitting in "doing" a while, and
  // post read-only market commentary. Deterministic templates over live
  // data, so it's free and needs no AI key. Paused while the tab is hidden.
  useEffect(() => {
    let tick = 0;
    refreshMarket();
    const marketIv = setInterval(refreshMarket, 90000);
    const iv = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      tick++;
      const b = bizSnapshot();
      const kind = tick % 4;
      if (kind === 0) {
        const pair = CHATTER_PAIRS[Math.floor(Math.random() * CHATTER_PAIRS.length)];
        const [lineA, lineB] = pair.make(b);
        logActivity(pair.a, lineA);
        setTimeout(() => logActivity(pair.b, lineB), 1400);
      } else if (kind === 1) {
        const tpl = IDEA_TEMPLATES[Math.floor(Math.random() * IDEA_TEMPLATES.length)];
        addIdea(tpl.agentId, tpl.make(b), tpl.exec || null);
      } else if (kind === 2) {
        // No more fake completions (a timer used to flip old "doing" cards
        // to done with zero work behind it). Now: if an in-progress idea has
        // a REAL executor, run it — done only through actual execution;
        // ideas without an executor simply stay until a human moves them.
        const doing = ideasRef.current.filter((i) => i.status === "doing" && ideaExecOf(i)).sort((x, y) => x.ts - y.ts);
        if (doing.length) moveIdea(doing[0].id, "doing");
      } else {
        const mover = marketMover(marketCache.rows);
        if (mover) {
          const agentId = INVEST_AGENTS[Math.floor(Math.random() * INVEST_AGENTS.length)];
          const note = investAnalysis(agentId, mover);
          if (note) logInvest(agentId, note);
        }
      }
    }, 55000);
    return () => { clearInterval(iv); clearInterval(marketIv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeAgent = chatId ? byId(chatId) : null;

  return (
    <div className="ac">
      <StyleTag />
      <TopBar online={hasAI()} />

      <div className="ac-main">
        {view === "roster" && (
          <RosterView
            onOpen={(id) => setChatId(id)}
            onOffice={() => setOffice(true)}
            activity={activity}
          />
        )}
        {view === "activity" && <ActivityView activity={activity} />}
        {view === "ideas" && <IdeasView ideas={ideas} setIdeas={setIdeas} moveIdea={moveIdea} showToast={showToast} />}
        {view === "dev" && <DevConsole logActivity={logActivity} showToast={showToast} />}
        {view === "biz" && <BusinessView showToast={showToast} invest={invest} />}
        {view === "settings" && <SettingsView showToast={showToast} />}
        {view === "simulator" && <SimulatorPanel />}
      </div>

      <BottomNav view={view} setView={(v) => { setView(v); setChatId(null); }} ideasCount={ideas.filter((i) => i.status === "new").length} />

      {activeAgent && (
        <ChatModal
          agent={activeAgent}
          onClose={() => setChatId(null)}
          onSwitch={(id) => setChatId(id)}
          logActivity={logActivity}
          addIdea={addIdea}
          showToast={showToast}
        />
      )}

      {office && <OfficeSim onClose={() => setOffice(false)} onOpenChat={(id) => { setOffice(false); setChatId(id); }} logActivity={logActivity} showToast={showToast} />}

      {toast && <div className="ac-toast">{toast}</div>}
    </div>
  );
}

/* ── Top bar ── */
function TopBar({ online }) {
  return (
    <div className="ac-top">
      <div className="ac-top-brand">
        <div className="ac-top-orb"><Brain size={20} /></div>
        <div className="ac-top-txt">
          <b>מרכז הסוכנים</b>
          <span>ALPHA · AGENTS COMMAND</span>
        </div>
      </div>
      <div className={"ac-top-status " + (online ? "on" : "off")}>
        <Radio size={13} /> {online ? (anthropicKey() ? "Claude חי" : "AI חי") : "מצב הדגמה"}
      </div>
    </div>
  );
}

/* ── Bottom nav ── */
function BottomNav({ view, setView, ideasCount }) {
  const items = [
    { id: "roster", label: "הצוות", Icon: LayoutGrid },
    { id: "biz", label: "העסק", Icon: Building2 },
    { id: "dev", label: "פיתוח", Icon: Terminal },
    { id: "activity", label: "פעילות", Icon: Activity },
    { id: "ideas", label: "רעיונות", Icon: Lightbulb, badge: ideasCount },
    { id: "simulator", label: "📊 Simulator", Icon: BarChart3 },
    { id: "settings", label: "הגדרות", Icon: SettingsIcon },
  ];
  return (
    <d
      {items.map(({ id, label, Icon, badge }) => (
        <button key={id} className={view === id ? "on" : ""} onClick={() => setView(id)}>
          <div className="ac-nav-ic"><Icon size={20} />{badge ? <i className="ac-nav-badge">{badge}</i> : null}</div>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   ROSTER — the team grid
   ════════════════════════════════════════════════════════════════════ */
function BriefingBanner({ ceo, onOpenChat }) {
  const [text, setText] = useState(() => (load(K_BRIEF_DATE, "") === todayKey()) ? load(K_BRIEF_TEXT, "") : "");
  const [loading, setLoading] = useState(!text);
  const [show, setShow] = useState(true);
  useEffect(() => { if (text) return; getDailyBriefing().then((t) => { setText(t); setLoading(false); }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!show) return null;
  return (
    <div className="ac-brief" style={{ "--c": ceo.color, "--ac": ceo.accent }}>
      <div className="ac-brief-glow" />
      <div className="ac-brief-orb"><Face agent={ceo} fallback={18} /></div>
      <div className="ac-brief-mid">
        <b><Crown size={12} /> תדריך הבוקר מיהודה</b>
        {loading ? <div className="ac-brief-load">מכין תדריך…<span /><span /><span /></div> : <p>{text}</p>}
      </div>
      <div className="ac-brief-acts">
        <button onClick={() => onOpenChat(ceo.id)} title="דבר עם יהודה"><MessageSquare size={14} /></button>
        <button onClick={() => setShow(false)} title="סגור"><X size={14} /></button>
      </div>
    </div>
  );
}
// Deterministic per-agent "system load" — stable numbers per agent (hash of
// the id) so the micro-metrics read as that agent's character, with the CSS
// flicker animation supplying the live feel.
function agentLoad(id) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return { cpu: 34 + (h % 53), mem: 22 + ((h * 7) % 61) };
}

/* One agent "cube" — a glass command-center tile: 3D tilt that follows the
   mouse, a scanning laser on hover, a pulsing inner core, a live terminal
   showing the agent's REAL recent activity, micro-metrics, and a glowing
   border that reflects live status (purple pulse = executed something in
   the last couple of minutes, cyan = online). Click opens the control
   panel; the small button jumps straight into chat. */
function AgentCube({ a, acts, onOpen, onPanel }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", (-py * 9).toFixed(2) + "deg");
    el.style.setProperty("--ry", (px * 11).toFixed(2) + "deg");
  };
  const onLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg");
  };
  const exec = acts[0] && Date.now() - acts[0].ts < 150000;
  const { cpu, mem } = agentLoad(a.id);
  const lines = acts.slice(0, 3).map((x) => x.text);
  if (!lines.length) lines.push(a.tagline);
  return (
    <div ref={ref} className={"ac-cube " + (exec ? "exec" : "online")} style={{ "--c": a.color, "--ac": a.accent }}
      onMouseMove={onMove} onMouseLeave={onLeave} onClick={() => onPanel(a.id)} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onPanel(a.id); }}>
      <span className="ac-cube-scan" />
      <span className="ac-cube-core" />
      <div className="ac-card-portrait">
        <div className="ac-avatar-wrap">
          <div className="ac-orb"><Face agent={a} fallback={26} /><span className="ac-orb-ring" /></div>
          <span className="ac-avatar-live" />
          <span className="ac-avatar-badge"><a.Icon size={11} /></span>
        </div>
      </div>
      <div className="ac-cube-name">{a.name}</div>
      <div className="ac-card-title">{a.title}</div>
      <div className="ac-cube-status"><i /> {exec ? "מבצע משימה" : "מקוון · זמין"}</div>
      <div className="ac-cube-term">
        {lines.map((ln, i) => <div key={i} className="ac-cube-ln"><span className="p">‹</span> {ln}</div>)}
        <div className="ac-cube-ln"><span className="p">‹</span> <span className="ac-caret" /></div>
      </div>
      <div className="ac-cube-metrics">
        <div className="ac-cube-m"><span>עומס</span><div className="bar"><i style={{ "--w": cpu + "%" }} /></div><b>{cpu}%</b></div>
        <div className="ac-cube-m"><span>זיכרון</span><div className="bar mem"><i style={{ "--w": mem + "%" }} /></div><b>{mem}%</b></div>
      </div>
      <button className="ac-cube-chat" onClick={(e) => { e.stopPropagation(); onOpen(a.id); }}>
        <MessageSquare size={13} /> שיחה מיידית
      </button>
    </div>
  );
}

/* The expanded Agent Control Panel — the cube "opens up" into a centred
   glass console: status, full live activity stream with timestamps, stat
   tiles, quick prompts, and the big actions (chat / meet in the office). */
function AgentPanel({ a, acts, onClose, onOpen, onOffice }) {
  const exec = acts[0] && Date.now() - acts[0].ts < 150000;
  const { cpu, mem } = agentLoad(a.id);
  const tFmt = (ts) => new Date(ts).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="ac-modal" onClick={onClose}>
      <div className={"ac-panel " + (exec ? "exec" : "online")} style={{ "--c": a.color, "--ac": a.accent }} onClick={(e) => e.stopPropagation()}>
        <span className="ac-cube-scan" />
        <button className="ac-panel-x" onClick={onClose}><X size={16} /></button>
        <div className="ac-panel-head">
          <div className="ac-avatar-wrap ac-avatar-wrap--xl">
            <span className="ac-cube-core big" />
            <div className="ac-ceo-orb"><Face agent={a} fallback={30} /><span className="ac-orb-ring" /></div>
            <span className="ac-avatar-live" />
          </div>
          <div className="ac-panel-id">
            <b>{a.name}</b>
            <span>{a.title}</span>
            <div className="ac-cube-status"><i /> {exec ? "מבצע משימה כרגע" : "מקוון · זמין"}</div>
          </div>
        </div>
        <div className="ac-card-chips center">
          {a.domain.split(" · ").map((d, i) => <span key={i} className="ac-chip">{d}</span>)}
        </div>
        <div className="ac-panel-stats">
          <div><b>{cpu}%</b><span>עומס עיבוד</span></div>
          <div><b>{mem}%</b><span>זיכרון</span></div>
          <div><b>{acts.length}</b><span>פעולות אחרונות</span></div>
        </div>
        <div className="ac-cube-term panel">
          {(acts.length ? acts.slice(0, 7) : [{ id: "x", text: a.tagline, ts: Date.now() }]).map((x) => (
            <div key={x.id} className="ac-cube-ln"><span className="t">{tFmt(x.ts)}</span><span className="p">‹</span> {x.text}</div>
          ))}
          <div className="ac-cube-ln"><span className="p">‹</span> <span className="ac-caret" /></div>
        </div>
        <div className="ac-panel-quick">
          {a.quick.slice(0, 3).map((qq) => (
            <button key={qq} onClick={() => { onClose(); onOpen(a.id); }}>{qq}</button>
          ))}
        </div>
        <div className="ac-panel-actions">
          <button className="main" onClick={() => { onClose(); onOpen(a.id); }}><MessageSquare size={16} /> פתח שיחה</button>
          <button onClick={() => { onClose(); onOffice(); }}><Building2 size={16} /> פגוש במשרד החי</button>
        </div>
      </div>
    </div>
  );
}

function RosterView({ onOpen, onOffice, activity }) {
  const ceo = AGENTS.find((a) => a.boss);
  const team = AGENTS.filter((a) => !a.boss);
  const [panelId, setPanelId] = useState(null);
  const lastByAgent = useMemo(() => {
    const m = {};
    for (const a of activity) if (!m[a.agentId]) m[a.agentId] = a;
    return m;
  }, [activity]);
  const actsFor = (id) => activity.filter((x) => x.agentId === id);
  const panelAgent = panelId ? byId(panelId) : null;

  return (
    <div className="ac-page ac-cmd">
      <div className="ac-hero">
        <div className="ac-hero-glow" />
        <h1>הצוות שלך</h1>
        <p>{AGENTS.length} סוכני AI · כל אחד מנהל תחום. לחץ על סוכן לפנל שליטה, או ישר לשיחה.</p>
      </div>

      <BriefingBanner ceo={ceo} onOpenChat={onOpen} />

      {/* CEO featured card */}
      <button className="ac-ceo" style={{ "--c": ceo.color, "--ac": ceo.accent }} onClick={() => onOpen(ceo.id)}>
        <div className="ac-ceo-glow" />
        <div className="ac-avatar-wrap ac-avatar-wrap--xl">
          <div className="ac-ceo-orb"><Face agent={ceo} fallback={30} /><span className="ac-orb-ring" /></div>
          <span className="ac-avatar-live" />
        </div>
        <div className="ac-ceo-mid">
          <div className="ac-ceo-top"><b>{ceo.name}</b><span className="ac-crown"><Crown size={12} /> {ceo.title}</span></div>
          <p>{ceo.tagline}</p>
          <div className="ac-ceo-now"><span className="ac-live-dot" /> {lastByAgent[ceo.id]?.text || "ממתין לפקודה"}</div>
        </div>
        <div className="ac-ceo-cta"><MessageSquare size={16} /> דבר איתי</div>
      </button>

      <button className="ac-office-card" onClick={onOffice}>
        <span className="ac-office-glow" />
        <span className="ac-office-mini">
          {AGENTS.slice(0, 5).map((a) => <span key={a.id} className="ac-office-mini-orb" style={{ "--c": a.color }}><img src={a.avatar} alt="" /></span>)}
        </span>
        <span className="ac-office-txt">
          <b>🏢 המשרד החי</b>
          <span>היכנס וצפה בכל הצוות עובד יחד במשרד · בזמן אמת</span>
        </span>
        <ChevronLeft size={22} />
      </button>

      <div className="ac-sectitle"><Bot size={15} /> ראשי הצוות</div>
      <div className="ac-grid">
        {team.map((a) => (
          <AgentCube key={a.id} a={a} acts={actsFor(a.id)} onOpen={onOpen} onPanel={setPanelId} />
        ))}
      </div>

      {panelAgent && (
        <AgentPanel a={panelAgent} acts={actsFor(panelAgent.id)} onClose={() => setPanelId(null)} onOpen={onOpen} onOffice={onOffice} />
      )}
    </div>
  );
}

/* Google-reviews window for נפתלי — pulls the business's REAL Google
   reviews (OAuth popup → My Business APIs) and lets one tap turn any
   review into a social-post brief in the chat. */
function GoogleReviewsModal({ agent, onClose, onUse }) {
  const [st, setSt] = useState({ loading: true, error: null, data: null });
  useEffect(() => {
    fetchGoogleReviews()
      .then((data) => setSt({ loading: false, error: null, data }))
      .catch((e) => setSt({ loading: false, error: String(e?.message || e), data: null }));
  }, []);
  const stars = (n) => "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));
  return (
    <div className="ac-modal" onClick={onClose} style={{ zIndex: 60 }}>
      <div className="ac-panel online" style={{ "--c": agent.color, "--ac": agent.accent }} onClick={(e) => e.stopPropagation()}>
        <button className="ac-panel-x" onClick={onClose}><X size={16} /></button>
        <div className="ac-panel-id" style={{ marginBottom: 10 }}>
          <b>⭐ ביקורות גוגל</b>
          <span>{st.data ? `${st.data.business} · ממוצע ${st.data.avg.toFixed(1)} · ${st.data.total} ביקורות` : "Google Business Profile"}</span>
        </div>
        {st.loading && <div className="ac-grev-note">נפתלי מתחבר לגוגל… אשר את חלון ההתחברות אם נפתח 🔐</div>}
        {st.error && (
          <div className="ac-grev-note err">
            לא הצלחתי למשוך ביקורות: {st.error}
            <small>ודא ש: (1) הדומיין של האתר מאושר כ-JavaScript origin בקונסולת Google Cloud; (2) חשבון Google Business Profile מחובר למשתמש שאישרת; (3) ה-API של Business Profile מאושר לפרויקט (גוגל דורשת בקשת גישה חד-פעמית).</small>
          </div>
        )}
        {st.data && (
          <div className="ac-grev-list">
            {st.data.reviews.length === 0 && <div className="ac-grev-note">אין ביקורות עדיין</div>}
            {st.data.reviews.map((r) => (
              <div key={r.id} className="ac-grev-row">
                <div className="ac-grev-head"><b>{stars(r.stars)}</b><span>{r.who}{r.when ? " · " + new Date(r.when).toLocaleDateString("he-IL") : ""}</span></div>
                {r.text && <p>{r.text}</p>}
                <button onClick={() => onUse(r)}><Megaphone size={13} /> הפוך לפוסט שיווקי</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* The social-publishing window: נפתלי's drafts queue with the human
   approval gate. Every draft shows exactly what will be posted; the
   Facebook button publishes THAT text to the connected business page
   (after an explicit confirm), TikTok gets copy-to-clipboard. */
function SocialModal({ agent, onClose, onAskDraft, showToast, logActivity }) {
  const [drafts, setDrafts] = useState(() => load(K_SOCIAL_DRAFTS, []));
  const [topic, setTopic] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [conn, setConn] = useState({ state: fbConnected() ? "set" : "none", name: "" });
  const persist = (next) => { setDrafts(next); save(K_SOCIAL_DRAFTS, next.slice(0, 40)); };
  useEffect(() => {
    if (!fbConnected()) return;
    fbTestConnection().then((d) => setConn({ state: "ok", name: d.name || "" })).catch((e) => setConn({ state: "err", name: String(e?.message || e) }));
  }, []);

  const publish = async (d) => {
    if (!fbConnected()) { showToast("חבר עמוד פייסבוק בהגדרות קודם"); return; }
    if (!window.confirm(`לפרסם את הפוסט הזה לעמוד הפייסבוק של העסק?\n\n"${d.text.slice(0, 120)}${d.text.length > 120 ? "…" : ""}"`)) return;
    setBusyId(d.id);
    try {
      const postId = await fbPublishPost(d.text);
      persist(drafts.map((x) => x.id === d.id ? { ...x, status: "published", link: `https://www.facebook.com/${postId}` } : x));
      logActivity?.(agent.id, "פרסם פוסט אמיתי לעמוד הפייסבוק של העסק (באישור הבעלים)");
      showToast("פורסם לפייסבוק ✓");
    } catch (e) {
      showToast("פרסום נכשל: " + String(e?.message || e).slice(0, 80));
    }
    setBusyId(null);
  };

  return (
    <div className="ac-modal" onClick={onClose} style={{ zIndex: 60 }}>
      <div className="ac-panel online" style={{ "--c": agent.color, "--ac": agent.accent }} onClick={(e) => e.stopPropagation()}>
        <button className="ac-panel-x" onClick={onClose}><X size={16} /></button>
        <div className="ac-panel-id" style={{ marginBottom: 10 }}>
          <b>📣 רשתות חברתיות</b>
          <span>
            {conn.state === "ok" ? `פייסבוק מחובר · ${conn.name} 🟢` :
             conn.state === "err" ? "פייסבוק: שגיאת חיבור ⚠️" :
             conn.state === "set" ? "פייסבוק: בודק חיבור…" : "פייסבוק לא מחובר — חבר בהגדרות ⚪"}
          </span>
        </div>
        <div className="ac-grev-note">
          כל פוסט יוצא רק אחרי אישור שלך — נפתלי מכין טיוטות בלבד.
        </div>
        <div className="ac-grev-note">
          🎵 <b>טיקטוק:</b> לטיקטוק אין API לפרסום ישיר מדפדפן (דורש אפליקציה מאושרת של TikTok + שרת) — לכן החיבור שם הוא חצי-ידני בכוונה: כפתור "העתק ופתח טיקטוק" על כל טיוטה מעתיק את הטקסט ופותח את מסך ההעלאה של TikTok Studio, ואתה רק מדביק ומצרף סרטון. פייסבוק לעומת זאת מתפרסם ישירות מכאן.
        </div>
        <div className="ac-idea-add" style={{ margin: "10px 0" }}>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && topic.trim() && (onAskDraft(topic.trim()), setTopic(""))} placeholder="נושא לפוסט חדש — נפתלי יכין טיוטה…" dir="rtl" />
          <button onClick={() => { if (topic.trim()) { onAskDraft(topic.trim()); setTopic(""); } }} title="בקש טיוטה מנפתלי"><Send size={16} /></button>
        </div>
        <div className="ac-grev-list">
          {drafts.length === 0 && <div className="ac-grev-note">אין טיוטות עדיין — בקש מנפתלי טיוטה למעלה, או שמור תשובה שלו מהצ'אט עם כפתור "📣 לטיוטות פרסום".</div>}
          {drafts.map((d) => (
            <div key={d.id} className="ac-grev-row">
              <div className="ac-grev-head">
                <b>{d.status === "published" ? "✅ פורסם" : "📝 טיוטה"}</b>
                <span>{new Date(d.ts).toLocaleDateString("he-IL")}</span>
              </div>
              <p style={{ whiteSpace: "pre-wrap" }}>{d.text}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {d.status !== "published" && (
                  <button onClick={() => publish(d)} disabled={busyId === d.id}>
                    {busyId === d.id ? "מפרסם…" : "אשר ופרסם לפייסבוק ✓"}
                  </button>
                )}
                {d.link && <button onClick={() => window.open(d.link, "_blank")}>פתח בפייסבוק ↗</button>}
                <button onClick={async () => {
                  const ok = await copyText(d.text);
                  showToast(ok ? "הטקסט הועתק — נפתח טיקטוק, הדבק שם ✓" : "העתקה נכשלה");
                  if (ok) window.open("https://www.tiktok.com/tiktokstudio/upload", "_blank");
                }}>🎵 העתק ופתח טיקטוק ↗</button>
                <button onClick={() => persist(drafts.filter((x) => x.id !== d.id))}><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   CHAT MODAL — direct line to one agent
   ════════════════════════════════════════════════════════════════════ */
function ChatModal({ agent, onClose, onSwitch, logActivity, addIdea, showToast }) {
  const histKey = agent.id;
  const [allHist, setAllHist] = useState(() => load(K_HIST, {}));
  const log = allHist[histKey] || [{ from: "bot", text: greeting(agent), ts: now() }];
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [revOpen, setRevOpen] = useState(false); // Google-reviews window (נפתלי)
  const [socOpen, setSocOpen] = useState(false); // social-publishing window (נפתלי)
  const [voiceOn, setVoiceOn] = useState(() => load(K_VOICE_ON, true) && canSpeak());
  const aiHist = useRef([]);
  const scrollRef = useRef(null);
  const recogRef = useRef(null);

  useCloudSync(K_HIST, setAllHist);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [log.length, busy]);
  useEffect(() => () => { try { recogRef.current?.stop(); window.speechSynthesis?.cancel(); } catch {} }, []);

  const toggleVoice = () => { const v = !voiceOn; setVoiceOn(v); save(K_VOICE_ON, v); if (!v) try { window.speechSynthesis?.cancel(); } catch {} };

  const toggleMic = () => {
    if (!canListen()) { showToast("זיהוי דיבור לא נתמך בדפדפן הזה"); return; }
    if (listening) { recogRef.current?.stop(); return; }
    const rec = new SpeechRecognitionCtor();
    rec.lang = "he-IL"; rec.continuous = false; rec.interimResults = false;
    rec.onresult = (e) => { const text = e.results?.[0]?.[0]?.transcript?.trim(); if (text) send(text); };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recogRef.current = rec;
    setListening(true);
    try { rec.start(); } catch { setListening(false); }
  };

  const setLog = (next) => {
    setAllHist((prev) => {
      const merged = { ...prev, [histKey]: next.slice(-40) };
      cloudSave(K_HIST, merged);
      return merged;
    });
  };
  const push = (entry) => setLog([...(allHist[histKey] || [{ from: "bot", text: greeting(agent), ts: now() }]), entry]);

  const send = async (text) => {
    const t = (text ?? q).trim(); if (!t || busy) return;
    const base = allHist[histKey] || [{ from: "bot", text: greeting(agent), ts: now() }];
    const withMe = [...base, { from: "me", text: t, ts: now() }];
    setLog(withMe); setQ("");
    logActivity(agent.id, "ענה לפנייה: " + t.slice(0, 30));

    // Real actions, not just talk — a request that matches a known, safe
    // capability actually executes against the live data instead of only
    // getting a conversational reply. This is what makes asking יהודה (or
    // any agent) to "merge duplicate customers" actually do something,
    // rather than just describing what he'd do.
    if (/מזג|איחוד|כפילוי/.test(t) && /לקוח/.test(t)) {
      const { merged, dupNames } = mergeItaiDuplicateCustomers();
      logActivity("sales", merged > 0 ? `מיזג ${merged} כפילויות לקוחות ב-CRM` : "בדק כפילויות לקוחות ב-CRM — לא נמצאו");
      const detail = merged > 0 ? `מיזגתי ${merged} כפילויות (${dupNames.slice(0, 4).join(", ")}${dupNames.length > 4 ? "…" : ""}) — כל לקוח מופיע פעם אחת עם סך ההתקנות וההכנסה מאוחד.` : "בדקתי את רשימת הלקוחות — לא מצאתי כפילויות כרגע.";
      const reply = agent.id === "sales"
        ? `בוצע 💪 ${detail}`
        : `בדקתי מול זבולון (מנהל ה-CRM) והרצנו את זה עכשיו — ${detail}`;
      setTimeout(() => { setLog([...withMe, { from: "bot", text: reply, ts: now() }]); if (voiceOn) speakText(reply); }, 350);
      return;
    }

    // Real action for דבורה (facilities): reorganizing/renovating the
    // office actually reshuffles who sits at which desk — a real, persisted
    // change, not just a description of one. Reopen the office sim (or the
    // current one, next time it refreshes chars) to see everyone at a new
    // spot.
    if (/ארגן|ארגני|שיפוץ|לשפץ|סדר.{0,3}(את ה)?משרד|משרד חדש/.test(t)) {
      const order = reorganizeOffice();
      logActivity("facilities", `ארגנה מחדש את סידור העמדות במשרד (${order.length} עמדות)`);
      const detail = "ארגנתי מחדש את כל עמדות העבודה במשרד — כל סוכן קיבל עמדה חדשה ומסודרת. תראה את השינוי בפעם הבאה שתיכנס למשרד החי.";
      const reply = agent.id === "facilities"
        ? `בוצע 🧹 ${detail}`
        : `העברתי את זה לדבורה (מנהלת המשרד) והיא כבר טיפלה בזה — ${detail}`;
      setTimeout(() => { setLog([...withMe, { from: "bot", text: reply, ts: now() }]); if (voiceOn) speakText(reply); }, 350);
      return;
    }

    if (!hasAI()) {
      const reply = FALLBACK[agent.id](t);
      setTimeout(() => { setLog([...withMe, { from: "bot", text: reply, ts: now() }]); if (voiceOn) speakText(reply); }, 350);
      return;
    }
    setBusy(true);
    try {
      const reply = await askAI(agent.persona + bizContext(), aiHist.current, t);
      const via = askAI.last; // which brain יהודה routed this to (+ why)
      aiHist.current = [...aiHist.current.slice(-6), { role: "user", content: t }, { role: "assistant", content: reply }];
      setLog([...withMe, { from: "bot", text: reply || "✔", ts: now(), via }]);
      if (voiceOn) speakText(reply || "");
    } catch (e) {
      const fb = FALLBACK[agent.id](t);
      setLog([...withMe, { from: "bot", text: (String(e.message).includes("Groq") ? "ה-AI עמוס כרגע, הנה תשובה מהירה:\n\n" : "") + fb, ts: now() }]);
      if (voiceOn) speakText(fb);
    } finally { setBusy(false); }
  };

  const clearChat = () => { setLog([{ from: "bot", text: greeting(agent), ts: now() }]); aiHist.current = []; showToast("השיחה אופסה"); };

  return (
    <div className="ac-modal" onClick={onClose}>
      <div className="ac-chat" style={{ "--c": agent.color, "--ac": agent.accent }} onClick={(e) => e.stopPropagation()}>
        <div className="ac-chat-head">
          <button className="ac-chat-back" onClick={onClose}><ChevronLeft size={20} /></button>
          <div className="ac-chat-orb"><Face agent={agent} fallback={20} /><span className="ac-orb-ring" /></div>
          <div className="ac-chat-id">
            <b>{agent.name} {agent.boss && <Crown size={12} />}</b>
            <span><span className="ac-live-dot" /> {agent.title} · {anthropicKey() ? "Claude חי" : hasAI() ? "AI חי" : "מצב הדגמה"}</span>
          </div>
          {canSpeak() && (
            <button className={"ac-chat-x " + (voiceOn ? "on" : "")} onClick={toggleVoice} title={voiceOn ? "כבה קול" : "הפעל קול"}>
              {voiceOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          )}
          <button className="ac-chat-x" onClick={clearChat} title="אפס שיחה"><RefreshCw size={16} /></button>
        </div>

        {/* quick switch to other agents */}
        <div className="ac-switch">
          {AGENTS.map((a) => (
            <button key={a.id} className={"ac-switch-btn " + (a.id === agent.id ? "on" : "")} style={{ "--c": a.color }} onClick={() => onSwitch(a.id)} title={a.name}>
              <Face agent={a} fallback={15} />
            </button>
          ))}
        </div>

        <div className="ac-chat-log" ref={scrollRef}>
          {log.map((m, i) => (
            <div key={i} className={"ac-msg " + m.from}>
              {m.from === "bot" && <div className="ac-msg-av"><Face agent={agent} fallback={13} /></div>}
              <div className="ac-msg-body">
                <div className="ac-msg-txt">{m.text}</div>
                {m.from === "bot" && i > 0 && (
                  <div className="ac-msg-acts">
                    <button onClick={async () => { const ok = await copyText(m.text); showToast(ok ? "הועתק ✓" : "נכשל"); }}><Copy size={12} /> העתק</button>
                    <button onClick={() => { addIdea(agent.id, m.text.split("\n")[0].slice(0, 90)); }}><Lightbulb size={12} /> לרעיונות</button>
                    {agent.id === "cmo" && (
                      <button onClick={() => {
                        const drafts = load(K_SOCIAL_DRAFTS, []);
                        save(K_SOCIAL_DRAFTS, [{ id: uid(), text: m.text, status: "draft", ts: now() }, ...drafts].slice(0, 40));
                        showToast("נשמר כטיוטת פרסום — ממתין לאישורך 📣");
                      }}><Megaphone size={12} /> לטיוטות פרסום</button>
                    )}
                    {m.via && m.via.engine !== "local" && (
                      <span className={"ac-via " + m.via.engine} title={m.via.reason}>
                        {m.via.engine === "claude" ? "🧠 Claude" : "⚡ Groq"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {busy && <div className="ac-msg bot"><div className="ac-msg-av"><Face agent={agent} fallback={13} /></div><div className="ac-msg-body"><div className="ac-msg-txt ac-typing"><span /><span /><span /></div></div></div>}
        </div>

        <div className="ac-quick">
          {agent.id === "cmo" && (
            <button className="ac-grev-open" onClick={() => setRevOpen(true)} disabled={busy}>⭐ ביקורות גוגל</button>
          )}
          {agent.id === "cmo" && (
            <button className="ac-grev-open" onClick={() => setSocOpen(true)} disabled={busy}>📣 רשתות חברתיות</button>
          )}
          {agent.quick.map((c) => <button key={c} onClick={() => send(c)} disabled={busy}>{c}</button>)}
        </div>

        <div className="ac-chat-in">
          {canListen() && (
            <button className={"ac-mic-btn " + (listening ? "on" : "")} onClick={toggleMic} disabled={busy} title={listening ? "מקשיב… לחץ לעצור" : "דבר במיקרופון"}>
              <Mic size={18} />
            </button>
          )}
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={listening ? "מקשיב…" : `כתוב ל${agent.name}…`} dir="rtl" disabled={busy}
          />
          <button onClick={() => send()} disabled={busy || !q.trim()}><Send size={18} /></button>
        </div>
      </div>
      {revOpen && (
        <GoogleReviewsModal
          agent={agent}
          onClose={() => setRevOpen(false)}
          onUse={(r) => {
            setRevOpen(false);
            logActivity?.(agent.id, `משך ביקורת גוגל אמיתית (${r.stars}★) והופך אותה לפוסט`);
            send(`כתוב פוסט שיווקי קצר לרשתות (עברית, עם הוק חזק ו-CTA) המבוסס על הביקורת האמיתית הזו מגוגל — ${r.stars} כוכבים מאת ${r.who}: "${(r.text || "לקוח מרוצה מאוד מהשירות").slice(0, 200)}"`);
          }}
        />
      )}
      {socOpen && (
        <SocialModal
          agent={agent}
          onClose={() => setSocOpen(false)}
          showToast={showToast}
          logActivity={logActivity}
          onAskDraft={(topic) => {
            setSocOpen(false);
            logActivity?.(agent.id, "מכין טיוטת פוסט לאישור הבעלים: " + topic.slice(0, 30));
            send(`כתוב טיוטת פוסט לפייסבוק של העסק (עברית, הוק חזק, קצר, CTA ברור, בלי האשטגים מוגזמים) בנושא: ${topic}. זו טיוטה בלבד — היא תפורסם רק אחרי אישור שלי.`);
          }}
        />
      )}
    </div>
  );
}
function greeting(a) {
  return `שלום! אני ${a.name}, ${a.title}. ${a.tagline}. ${hasAI() ? "אני מחובר ל-AI חי — שאל אותי כל דבר בתחום שלי." : "במצב הדגמה כרגע — חבר מפתח Claude או Groq בהגדרות כדי שאהפוך לחכם מלא."} במה אפשר לעזור?`;
}

/* ════════════════════════════════════════════════════════════════════
   ACTIVITY FEED
   ════════════════════════════════════════════════════════════════════ */
function ActivityView({ activity }) {
  return (
    <div className="ac-page">
      <div className="ac-hero sm">
        <h1>פעילות חיה</h1>
        <p>מה הצוות עושה ברגעים האחרונים</p>
      </div>
      <div className="ac-feed">
        {activity.length === 0 && <div className="ac-empty"><Activity size={34} /><div>אין פעילות עדיין</div><p>התחל לדבר עם סוכן והפעילות תופיע כאן</p></div>}
        {activity.map((a) => {
          const ag = byId(a.agentId); if (!ag) return null;
          return (
            <div key={a.id} className="ac-feed-row" style={{ "--c": ag.color }}>
              <div className="ac-feed-orb"><Face agent={ag} fallback={15} /></div>
              <div className="ac-feed-mid">
                <b>{ag.name} <span>· {ag.title}</span></b>
                <p>{a.text}</p>
              </div>
              <div className="ac-feed-time">{timeAgo(a.ts)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   IDEAS / ROADMAP BOARD
   ════════════════════════════════════════════════════════════════════ */
const IDEA_COLS = [
  { id: "new", label: "חדש", Icon: Lightbulb },
  { id: "doing", label: "בתהליך", Icon: Rocket },
  { id: "done", label: "הושלם", Icon: Check },
];
function IdeasView({ ideas, setIdeas, moveIdea, showToast }) {
  const [text, setText] = useState("");
  const [agentId, setAgentId] = useState("dev");

  const add = () => {
    const t = text.trim(); if (!t) return;
    setIdeas((p) => [{ id: uid(), agentId, text: t, status: "new", ts: now() }, ...p]);
    setText(""); showToast("רעיון נוסף ✓");
  };
  const move = (id, status) => { moveIdea(id, status); if (status === "doing") showToast("התחיל לעבוד — עוקב בפעילות ↗"); };
  const del = (id) => setIdeas((p) => p.filter((i) => i.id !== id));

  return (
    <div className="ac-page">
      <div className="ac-hero sm">
        <h1>רעיונות וצמיחה</h1>
        <p>לוח רעיונות לפיתוח, אוטומציות וקידום — שלך ושל הצוות</p>
      </div>

      <div className="ac-idea-add">
        <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className="ac-idea-sel">
          {AGENTS.map((a) => <option key={a.id} value={a.id}>{a.name} · {a.title}</option>)}
        </select>
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="רעיון חדש לפיתוח / קידום…" dir="rtl" />
        <button onClick={add}><Plus size={18} /></button>
      </div>

      <div className="ac-board">
        {IDEA_COLS.map((col) => {
          const items = ideas.filter((i) => i.status === col.id);
          return (
            <div key={col.id} className="ac-col">
              <div className="ac-col-head"><col.Icon size={14} /> {col.label} <i>{items.length}</i></div>
              <div className="ac-col-body">
                {items.length === 0 && <div className="ac-col-empty">—</div>}
                {items.map((i) => {
                  const ag = byId(i.agentId);
                  return (
                    <div key={i.id} className="ac-idea" style={{ "--c": ag?.color || "#888" }}>
                      <div className="ac-idea-top"><span className="ac-idea-by">{ag?.Icon && <ag.Icon size={11} />} {ag?.name}</span><button className="ac-idea-del" onClick={() => del(i.id)}><Trash2 size={12} /></button></div>
                      <p>{i.text}</p>
                      {i.issueUrl && <a className="ac-idea-issue" href={i.issueUrl} target="_blank" rel="noreferrer"><GitBranch size={11} /> Issue נפתח בגיטהאב ↗</a>}
                      {i.result && <div className="ac-idea-result">✅ {i.result}</div>}
                      <div className="ac-idea-moves">
                        {col.id !== "new" && <button onClick={() => move(i.id, prevCol(col.id))}>←</button>}
                        {col.id !== "done" && (
                          <button className={"fwd" + (ideaExecOf(i) ? " exec" : "")} onClick={() => move(i.id, nextCol(col.id))}>
                            {col.id === "new" ? (ideaExecOf(i) ? "⚡ בצע עכשיו" : "התחל") : "סיים"} →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
const COL_ORDER = ["new", "doing", "done"];
const nextCol = (c) => COL_ORDER[Math.min(COL_ORDER.indexOf(c) + 1, 2)];
const prevCol = (c) => COL_ORDER[Math.max(COL_ORDER.indexOf(c) - 1, 0)];

/* ════════════════════════════════════════════════════════════════════
   DEV CONSOLE — Leo turns your request into a real task on this codebase
   ════════════════════════════════════════════════════════════════════ */
const DEV_STATUS = { queued: { label: "ממתין", color: "#7886B8" }, sent: { label: "נשלח לביצוע", color: "#FFD23F" }, done: { label: "הושלם", color: "#3FD79A" } };
function DevConsole({ logActivity, showToast }) {
  const leo = byId("dev");
  const [req, setReq] = useState("");
  const [brief, setBrief] = useState("");
  const [busy, setBusy] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [execBusy, setExecBusy] = useState(false);
  const [tasks, setTasks] = useState(() => load(K_DEVTASKS, []));
  const [gh, setGh] = useState(ghConfigured());
  const [targetKey, setTargetKey] = useState(() => load(K_GH_TARGET, REPO_PRESETS[0].key));
  const target = REPO_PRESETS.find((r) => r.key === targetKey) || REPO_PRESETS[0];
  const pickTarget = (key) => { setTargetKey(key); save(K_GH_TARGET, key); };
  useCloudSync(K_DEVTASKS, setTasks);
  useEffect(() => cloudSave(K_DEVTASKS, tasks), [tasks]);

  const execute = async () => {
    const path = filePath.trim();
    const instruction = (brief || req).trim();
    if (!path) { showToast("הזן נתיב קובץ לביצוע (למשל agents/App.jsx)"); return; }
    if (!instruction) { showToast("תאר מה לבנות"); return; }
    if (execBusy) return;
    setExecBusy(true);
    logActivity("dev", `מבצע קוד אוטומטית ב-${target.repo}: ${path}`);
    devBus.emit({ agentId: "dev", text: "כותב קוד… 🧑‍💻" });
    try {
      const title = briefTitle(brief || req, req).slice(0, 60);
      const pr = await devExecute({ filePath: path, instruction, title, target });
      const tk = { id: uid(), title, brief: instruction, status: "sent", issueUrl: pr.html_url, ts: now(), repo: target.repo };
      setTasks((p) => [tk, ...p]);
      logActivity("dev", "פתח PR אוטומטי: #" + pr.number);
      showToast("✓ דן כתב את הקוד ופתח PR — בדוק ומזג");
    } catch (e) {
      showToast("ביצוע נכשל: " + String(e.message).slice(0, 160));
    } finally { setExecBusy(false); }
  };

  const genBrief = async () => {
    const t = req.trim(); if (!t || busy) return;
    setBusy(true); setBrief("");
    logActivity("dev", "ניסח בריף פיתוח: " + t.slice(0, 30));
    devBus.emit({ agentId: "dev", text: "מנסח בריף 🧑‍💻" });
    try {
      const out = hasAI() ? await askAI(devBriefSystem() + bizContext(), [], t) : devBriefFallback(t);
      setBrief(out || devBriefFallback(t));
    } catch { setBrief(devBriefFallback(t)); }
    finally { setBusy(false); }
  };

  const saveTask = (status, issueUrl) => {
    const tk = { id: uid(), title: briefTitle(brief, req), brief, status, issueUrl: issueUrl || "", ts: now() };
    setTasks((p) => [tk, ...p]);
    return tk;
  };

  const copyForClaude = async () => {
    const ok = await copyText(claudePrompt(brief));
    saveTask("sent");
    showToast(ok ? "הועתק — הדבק ל-Claude Code ←" : "ההעתקה נכשלה");
  };

  const openIssue = async () => {
    if (!ghConfigured()) { showToast("חבר טוקן GitHub בהגדרות"); return; }
    setBusy(true);
    try {
      const r = await ghCreateIssue(briefTitle(brief, req), brief + "\n\n---\n_נוצר ע\"י מרכז הסוכנים · לביצוע ע\"י Claude Code_", target);
      saveTask("sent", r.html_url);
      logActivity("dev", `פתח Issue על ${target.repo}: #` + r.number);
      showToast(`Issue נפתח על ${target.repo} ✓`);
    } catch (e) {
      showToast(String(e.message).includes("NO_TOKEN") ? "חסר טוקן GitHub" : "פתיחת Issue נכשלה (" + e.message + ")");
    } finally { setBusy(false); }
  };

  const setStatus = (id, status) => setTasks((p) => p.map((x) => x.id === id ? { ...x, status } : x));
  const del = (id) => setTasks((p) => p.filter((x) => x.id !== id));

  return (
    <div className="ac-page">
      <div className="ac-hero sm">
        <h1>חדר פיתוח</h1>
        <p>תאר מה לבנות — דן מנסח בריף מדויק על הקוד האמיתי, ושולח לביצוע</p>
      </div>

      <div className="ac-dev-leo" style={{ "--c": leo.color, "--ac": leo.accent }}>
        <div className="ac-dev-orb"><Face agent={leo} fallback={20} /></div>
        <div className="ac-dev-leo-txt"><b>דן · מחובר למאגר</b><span><GitBranch size={11} /> {target.owner}/{target.repo}</span></div>
        <div className={"ac-dev-ghchip " + (gh ? "on" : "")}>{gh ? <><Check size={12} /> GitHub מחובר</> : <>לא מחובר</>}</div>
      </div>

      <div className="ac-repo-picker">
        {REPO_PRESETS.map((r) => (
          <button key={r.key} className={"ac-repo-chip" + (targetKey === r.key ? " on" : "")} onClick={() => pickTarget(r.key)}>
            <GitBranch size={12} /> {r.label}
          </button>
        ))}
      </div>

      <textarea className="ac-dev-in" value={req} onChange={(e) => setReq(e.target.value)} placeholder="לדוגמה: הוסף כפתור ייצוא PDF למסך העסקאות ב-CRM של איתי…" dir="rtl" rows={3} />
      <button className="ac-dev-gen" onClick={genBrief} disabled={busy || !req.trim()}>
        {busy ? <><RefreshCw size={16} className="ac-spin" /> דן עובד…</> : <><Code2 size={16} /> נסח בריף פיתוח</>}
      </button>

      <div className="ac-dev-exec">
        <div className="ac-dev-exec-h"><Terminal size={14} /> ביצוע אוטומטי · חינם <span>דן כותב את הקוד ופותח PR</span></div>
        <input className="ac-dev-path" value={filePath} onChange={(e) => setFilePath(e.target.value)} placeholder="נתיב הקובץ · למשל agents/App.jsx או src/style.css" dir="ltr" />
        <button className="ac-dev-execbtn" onClick={execute} disabled={execBusy || !gh}>
          {execBusy ? <><RefreshCw size={16} className="ac-spin" /> דן כותב קוד ופותח PR…</> : <><Rocket size={16} /> בצע ופתח PR (חינם)</>}
        </button>
        {!gh && <div className="ac-dev-exec-note">חבר טוקן GitHub חינמי בהגדרות כדי להפעיל ביצוע אוטומטי</div>}
        {gh && <div className="ac-dev-exec-note">💡 עובד הכי טוב על קבצים קטנים/חדשים. נפתח תמיד כ-PR לבדיקה — לא נוגע ב-main ישירות.</div>}
      </div>

      {brief && (
        <div className="ac-dev-brief">
          <div className="ac-dev-brief-h"><FileCode2 size={14} /> בריף פיתוח · {briefTitle(brief, req)}</div>
          <pre className="ac-dev-brief-body">{brief}</pre>
          <div className="ac-dev-acts">
            <button className="ac-dev-act primary" onClick={copyForClaude}><Terminal size={14} /> העתק ל-Claude Code</button>
            <button className="ac-dev-act" onClick={openIssue} disabled={!gh || busy}><GitBranch size={14} /> פתח Issue במאגר</button>
            <button className="ac-dev-act" onClick={() => { saveTask("queued"); showToast("נשמר ללוח ✓"); }}><Plus size={14} /> שמור ללוח</button>
          </div>
        </div>
      )}

      <div className="ac-dev-board">
        <div className="ac-sectitle" style={{ marginTop: 18 }}><GitBranch size={15} /> משימות פיתוח ({tasks.length})</div>
        {tasks.length === 0 && <div className="ac-empty sm" style={{ padding: "26px 16px" }}><Terminal size={28} /><div>אין משימות עדיין</div><p>נסח בריף ושלח לביצוע</p></div>}
        {tasks.map((tk) => {
          const st = DEV_STATUS[tk.status] || DEV_STATUS.queued;
          return (
            <div key={tk.id} className="ac-dev-task" style={{ "--c": st.color }}>
              <div className="ac-dev-task-top">
                <span className="ac-dev-task-st" style={{ color: st.color, borderColor: st.color }}>{st.label}</span>
                <b>{tk.title}</b>
                <button className="ac-dev-task-del" onClick={() => del(tk.id)}><Trash2 size={13} /></button>
              </div>
              <div className="ac-dev-task-acts">
                {tk.issueUrl && <a href={tk.issueUrl} target="_blank" rel="noreferrer" className="ac-dev-mini"><GitBranch size={12} /> Issue</a>}
                <button className="ac-dev-mini" onClick={async () => { const ok = await copyText(claudePrompt(tk.brief)); showToast(ok ? "הועתק ל-Claude Code ←" : "נכשל"); }}><Copy size={12} /> העתק</button>
                {tk.status !== "done"
                  ? <button className="ac-dev-mini ok" onClick={() => setStatus(tk.id, "done")}><Check size={12} /> סמן הושלם</button>
                  : <button className="ac-dev-mini" onClick={() => setStatus(tk.id, "queued")}>החזר לתור</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   OFFICE SIMULATOR — watch the team work together, with chat bubbles
   ════════════════════════════════════════════════════════════════════ */
const CHATTER = {
  ceo:   ["יעד היום: 3 סגירות 💪", "תמונת מצב מצוינת", "קדימה צוות! 🚀", "מי צריך עזרה?", "עבודה יפה 👏"],
  sales: ["סגרתי ליד חם 🔥", "שולח הצעת מחיר", "הלקוח מעוניין!", "פולואפ עכשיו", "עוד עסקה בדרך"],
  ops:   ["התקנה תואמה ✅", "בודק מלאי", "הטכנאי בדרך", "הכל מסונכרן", "לוז מעודכן"],
  cmo:   ["הפוסט עף 🚀", "רעיון לקמפיין!", "תוכן חדש מוכן", "וויראלי בדרך", "טיקטוק בוער 🔥"],
  dev:   ["דחפתי קוד 🧑‍💻", "באג תוקן ✅", "פיצ'ר חדש בדרך", "ה-build עבר", "מרפקטר עכשיו"],
  auto:  ["אוטומציה רצה ⚡", "חיברתי זרימה", "חוסך שעות 🙌", "טריגר הופעל", "הכל אוטומטי"],
  data:  ["המספרים עולים 📈", "מצאתי תובנה", "הדוח מוכן", "תחזית מעודכנת", "מגמה חיובית"],
  cs:    ["לקוח מרוצה 💗", "פתרתי פנייה", "שימור הצליח", "שיחה נהדרת", "5 כוכבים ⭐"],
  finance:["התקבל תשלום 💰", "התזרים חיובי", "גבייה בדרך", "רווחיות יפה", "סגרתי חודש"],
  procure:["הזמנה יצאה 📦", "מצאתי ספק זול", "המלאי מלא", "ציוד הגיע", "חסכתי בעלות"],
  legal: ["החוזה מאושר ⚖️", "הטופס תקין", "אחריות מעודכנת", "הכל חתום", "עומד בתקנות"],
  growth:["הזדמנות חדשה 🧭", "ענף חדש נפתח", "רעיון צמיחה!", "ניתחתי מתחרה", "אפיק הכנסה חדש"],
};
// Living office: characters sit at their own desk and work by default, break
// off for meetings, coffee, lunch in the dining room, or the odd short walk —
// weighted so "at the desk, working" is what the room looks like most of the
// time, not constant aimless wandering.
const OFC_X0 = 4, OFC_X1 = 96, OFC_Y0 = 18, OFC_Y1 = 86;
// 13 desks — one per agent (AGENTS.length === OFC_DESKS.length), so a desk
// always belongs to the same person and can show a real occupied/idle state.
// Laid out like a real office: the private glass offices line the PERIMETER
// (a north row along the window, a west-wall column, and a south row), each
// with its own facing (rot — the direction the seated worker looks; the
// doorway opens on their back side, toward the walkway). The center of the
// floor stays completely open — clear corridors everywhere, nothing piled
// in the middle. The east strip holds the conference room, dining and the
// owner's suite, as before.
const OFC_DESKS = [
  // North row — workers face the skyline window (rot π), doors open south.
  { x: 10, y: 16, rot: Math.PI }, { x: 24, y: 16, rot: Math.PI }, { x: 38, y: 16, rot: Math.PI }, { x: 52, y: 16, rot: Math.PI }, { x: 66, y: 16, rot: Math.PI },
  // West column — workers face the west wall (rot -π/2), doors open east.
  { x: 8, y: 32, rot: -Math.PI / 2 }, { x: 8, y: 46, rot: -Math.PI / 2 }, { x: 8, y: 60, rot: -Math.PI / 2 }, { x: 8, y: 74, rot: -Math.PI / 2 },
  // South row — workers face south (rot 0), doors open north into the floor.
  { x: 26, y: 79, rot: 0 }, { x: 39, y: 79, rot: 0 }, { x: 52, y: 79, rot: 0 }, { x: 65, y: 79, rot: 0 },
];
// Meeting nook, upper right.
const OFC_SEATS = [{ x: 76, y: 22 }, { x: 84, y: 20 }, { x: 92, y: 22 }, { x: 76, y: 34 }, { x: 84, y: 36 }, { x: 92, y: 34 }];
// Dining room, mid-right between the conference room and the owner's suite —
// two round tables, four seats each. A real sit-down lunch spot, distinct
// from the quick coffee-cooler stop.
const OFC_DINE_TABLES = [{ x: 84, y: 46 }, { x: 84, y: 62 }];
const OFC_DINE = [
  { x: 79, y: 42 }, { x: 89, y: 42 }, { x: 79, y: 50 }, { x: 89, y: 50 },
  { x: 79, y: 58 }, { x: 89, y: 58 }, { x: 79, y: 66 }, { x: 89, y: 66 },
];
// Coffee-cooler stop, beside the cafeteria counter on the east side (the old
// west-wall spot now sits inside a perimeter office).
const OFC_BREAK = { x: 92, y: 56 };
// Where a summoned agent walks to when you call them "to your office" — the
// guest chair INSIDE the owner's private glass office in the SE corner of
// the 3D scene (Office3D places that chair exactly on this spot), so the
// called agent walks in through the door and sits down facing your desk.
const OFC_MEETING_SPOT = { x: 90, y: 87 };
const OFC_STATUS = { work: "💻", meet: "👥", break: "☕", eat: "🍽️", roam: "🚶" };
const OFC_PHASES = [
  { label: "בוקר", emoji: "🌅", tint: "rgba(255,196,120,.06)", sky: "#22304e" },
  { label: "צהריים", emoji: "☀️", tint: "rgba(255,250,210,.04)", sky: "#27406a" },
  { label: "ערב", emoji: "🌇", tint: "rgba(255,120,70,.12)", sky: "#3a2740" },
  { label: "לילה", emoji: "🌙", tint: "rgba(20,40,120,.26)", sky: "#0e1430" },
];
// Per-phase duration (ms) — morning + noon (both daylight) add up to most
// of the cycle, evening/night pass quickly.
const OFC_PHASE_DUR = [22000, 34000, 10000, 10000];
function OfficeSim({ onClose, onOpenChat, logActivity, showToast }) {
  const rnd = (a, b) => a + Math.random() * (b - a);
  // Live market rows (CoinGecko + Yahoo) — same shared cache the Business
  // view uses, so the sim's wall TV shows the REAL board, not a simulation.
  const marketRows = useMarket();
  // Business snapshot for the 3D screens: computed on an interval, not on
  // every render — bizSnapshot() parses several localStorage stores, and the
  // sim re-renders on every scheduler tick.
  const [bizData, setBizData] = useState(() => bizSnapshot());
  useEffect(() => {
    const iv = setInterval(() => setBizData(bizSnapshot()), 30000);
    return () => clearInterval(iv);
  }, []);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // Every agent gets their own permanent desk (home) they return to by
  // default — a real seat, not a random spot picked fresh each time.
  const [chars, setChars] = useState(() => {
    // A reorg by דבורה persists a shuffled desk order — use it if present
    // (and still valid for the current roster) so the seating change is
    // actually visible next time the office loads, not just described.
    const order = load(K_DESK_ORDER, null);
    const ids = order && order.length === AGENTS.length && order.every((id) => byId(id)) ? order : AGENTS.map((a) => a.id);
    return ids.map((id, i) => { const home = OFC_DESKS[i % OFC_DESKS.length]; return { id, ...home, home, dir: 1, dur: 3000, walking: false, status: "work", energy: Math.round(rnd(70, 100)), held: false, focus: false }; });
  });
  const [bubbles, setBubbles] = useState({});
  const [phase, setPhase] = useState(0);
  const [bursts, setBursts] = useState([]);
  const [summonOpen, setSummonOpen] = useState(false);
  // Per-agent "call to my office" state: { scheduledFor, calledAt, status }
  // status: scheduled | walking | onTime | late
  const [summons, setSummons] = useState({});
  const meetingRef = useRef(false);

  const moveTo = (c, pt, status, focus = false) => {
    const dist = Math.hypot(pt.x - c.x, pt.y - c.y);
    const dur = Math.round(Math.max(1300, dist * 135));
    setTimeout(() => setChars((p) => p.map((k) => k.id === c.id ? { ...k, walking: false } : k)), dur);
    return { ...c, x: pt.x, y: pt.y, dir: pt.x < c.x ? -1 : 1, dur, walking: true, status, focus };
  };

  // Real, observable action: summon an agent to your office, right now or
  // in N minutes. They actually drop whatever they're doing and walk over
  // (visible in the 3D scene), and once they arrive we compare arrival time
  // to the scheduled time and log whether they made it on time — a real
  // punctuality check, not just a cosmetic walk.
  const callToOffice = (id, delayMin = 0) => {
    const scheduledFor = Date.now() + delayMin * 60000;
    setSummons((s) => ({ ...s, [id]: { scheduledFor, calledAt: null, status: "scheduled" } }));
    const ag = byId(id);
    showToast?.(delayMin > 0 ? `${ag?.name} יגיע למשרד שלך בעוד ${delayMin} דק' ✓` : `${ag?.name} בדרך למשרד שלך ✓`);
    const doCall = () => {
      const calledAt = Date.now();
      let dur = 0;
      setChars((prev) => prev.map((c) => {
        if (c.id !== id || c.held) return c;
        const next = moveTo(c, OFC_MEETING_SPOT, "summoned", true);
        dur = next.dur;
        return next;
      }));
      setSummons((s) => ({ ...s, [id]: { ...(s[id] || {}), calledAt, status: "walking" } }));
      popBubble(id, "בדרך למשרד שלך 🚶", null);
      setTimeout(() => {
        setSummons((s) => {
          const info = s[id]; if (!info) return s;
          const arrivedAt = Date.now();
          const lateMs = arrivedAt - info.scheduledFor;
          const onTime = lateMs <= 90000; // 90s grace window
          const text = onTime
            ? `${ag?.name} הגיע בזמן לפגישה במשרד שלך ✅`
            : `${ag?.name} הגיע באיחור של ${Math.max(1, Math.round(lateMs / 60000))} דק' לפגישה ⏱️`;
          logActivity?.(id, text);
          showToast?.(text);
          return { ...s, [id]: { ...info, status: onTime ? "onTime" : "late", arrivedAt } };
        });
        // The agent stays seated on the guest chair across your desk for a
        // real meeting-length stay (you can sit facing them and talk), then
        // heads back to their own desk.
        setTimeout(() => setChars((p) => p.map((c) => c.id === id ? moveTo(c, c.home, "work") : c)), 120000);
      }, Math.max(dur, 1200) + 250);
    };
    if (delayMin > 0) setTimeout(doCall, delayMin * 60000);
    else doCall();
  };
  const popBubble = (id, text, toId = null) => { const bid = uid(); setBubbles((p) => ({ ...p, [id]: { text, toId, id: bid } })); setTimeout(() => setBubbles((p) => (p[id] && p[id].id === bid ? { ...p, [id]: null } : p)), 3800); };
  const confettiAt = (x, y, color) => { const id = uid(); setBursts((p) => [...p, { id, x, y, color }]); setTimeout(() => setBursts((p) => p.filter((k) => k.id !== id)), 1300); };

  // Day cycle — weighted so the office is mostly in daylight (morning +
  // noon) rather than an even split across all four phases, which read as
  // "dim/night" more often than not.
  useEffect(() => {
    let cur = 0, to = setTimeout(step, OFC_PHASE_DUR[0]);
    function step() {
      cur = (cur + 1) % OFC_PHASES.length;
      setPhase(cur);
      to = setTimeout(step, OFC_PHASE_DUR[cur]);
    }
    return () => clearTimeout(to);
  }, []);

  // Behaviour scheduler: meetings, desk work, coffee/lunch breaks, short
  // walks, energy. Biased hard toward "sitting at your own desk working" —
  // that's the room's resting state, not a random pick each tick — so the
  // floor reads as an office actually working, not people drifting around.
  useEffect(() => {
    const iv = setInterval(() => {
      const noon = phase === 1;
      if (!meetingRef.current && Math.random() < 0.1) {
        meetingRef.current = true;
        const pick = [...AGENTS].sort(() => Math.random() - 0.5).slice(0, 5).map((a) => a.id);
        setChars((prev) => prev.map((c) => { if (c.held || c.status === "summoned") return c; const idx = pick.indexOf(c.id); return idx >= 0 ? moveTo(c, OFC_SEATS[idx] || OFC_SEATS[0], "meet") : c; }));
        setTimeout(() => { meetingRef.current = false; setChars((p) => p.map((c) => c.status === "meet" ? moveTo(c, c.home, "work") : c)); }, 11000);
        return;
      }
      setChars((prev) => prev.map((c) => {
        if (c.held || c.status === "summoned") return c;
        // energy drift
        let energy = c.energy + (c.status === "break" || c.status === "eat" ? 7 : c.status === "work" ? -2 : c.status === "meet" ? -1 : -1);
        energy = Math.max(5, Math.min(100, energy));
        if (c.status === "meet") return { ...c, energy };
        const tired = energy < 25;
        const atDesk = c.status === "work" && !c.walking;
        // WorkingAtDesk is the hard default state — no more aimless roaming.
        // An agent leaves the desk only for a REAL event: exhaustion (coffee),
        // the noon lunch window, a meeting, or a summon from the owner; and
        // anyone away from their desk gravitates straight back to work.
        if (atDesk) {
          if (tired && Math.random() < 0.42) return { ...moveTo(c, OFC_BREAK, "break"), energy };
          if (noon && Math.random() < 0.12) return { ...moveTo(c, OFC_DINE[Math.floor(Math.random() * OFC_DINE.length)], "eat"), energy };
          return { ...c, energy };
        }
        if (Math.random() < 0.45) {
          if (tired) return { ...moveTo(c, OFC_BREAK, "break"), energy };
          return { ...moveTo(c, c.home, "work"), energy };
        }
        return { ...c, energy };
      }));
    }, 1400);
    return () => clearInterval(iv);
  }, [phase]);

  // Chatter + occasional confetti celebration.
  useEffect(() => {
    const tick = () => {
      const a = AGENTS[Math.floor(Math.random() * AGENTS.length)];
      const lines = CHATTER[a.id] || ["..."];
      const text = lines[Math.floor(Math.random() * lines.length)];
      let toId = null;
      if (Math.random() < 0.4) { const o = AGENTS.filter((x) => x.id !== a.id); toId = o[Math.floor(Math.random() * o.length)].id; }
      popBubble(a.id, text, toId);
      if (/🔥|🎉|💰|🚀|⭐/.test(text) && Math.random() < 0.6) { const c = chars.find((k) => k.id === a.id); if (c) confettiAt(c.x, c.y, a.color); }
    };
    const iv = setInterval(tick, 2200); tick();
    return () => clearInterval(iv);
  }, [chars]);

  // Dev room → דן rushes to a desk and "codes".
  useEffect(() => devBus.on((p) => {
    const id = (p && p.agentId) || "dev";
    setChars((prev) => prev.map((c) => c.id === id && !c.held ? moveTo(c, c.home, "work", true) : c));
    popBubble(id, (p && p.text) || "מקבל משימה 🧑‍💻");
    setTimeout(() => setChars((prev) => prev.map((c) => c.id === id ? { ...c, focus: false, energy: Math.min(100, c.energy + 12) } : c)), 6000);
  }), []);

  const ph = OFC_PHASES[phase];
  return (
    <div className="off-overlay off3">
      <div className="off-top">
        <div className="off-top-l"><span className="off-live"><span className="ac-live-dot" /> חי</span><b>🏢 בניין אלפא · קומת הסוכנים · תלת-ממד</b></div>
        <div className="ofc-clock">{ph.emoji} {ph.label}</div>
        <button className="off-summon-btn" onClick={() => setSummonOpen((v) => !v)} title="קרא סוכן למשרד שלך"><Clock size={16} /> קריאה לפגישה</button>
        <button className="off-close" onClick={onClose}><X size={20} /></button>
      </div>
      {summonOpen && (
        <SummonPanel agents={AGENTS} summons={summons} onCall={callToOffice} onClose={() => setSummonOpen(false)} />
      )}
      <Office3D
        chars={chars}
        byId={byId}
        phase={phase}
        phases={OFC_PHASES}
        deskPositions={OFC_DESKS}
        seatPositions={OFC_SEATS}
        dineTablePositions={OFC_DINE_TABLES}
        meetingSpot={OFC_MEETING_SPOT}
        bizData={bizData}
        marketRows={marketRows}
        onAutoFix={(msg) => { showToast?.(msg); logActivity?.("facilities", msg); }}
        voice={{
          canListen: canListen(),
          canSpeak: canSpeak(),
          speak: speakText,
          // Ask a specific agent (by id) something and get their reply — same
          // brain as the text chat (persona + live business context), with the
          // scripted fallback when no AI key is configured.
          ask: async (id, text) => {
            const a = byId(id); if (!a) return "";
            if (!hasAI()) return FALLBACK[id] ? FALLBACK[id](text) : `שלום, אני ${a.name}. ${a.tagline}.`;
            // Spatial awareness: the sim publishes a live map of the floor
            // (window.__off3spatial) — attach it so the agent knows where
            // everyone actually stands when it answers ("מי ליד הרכב?").
            let spatial = "";
            try {
              if (window.__off3spatial) spatial = `\n\nמפת המשרד בזמן אמת (אתה הסוכן ${id}): ${JSON.stringify(window.__off3spatial)}`;
            } catch {}
            try { return await askAI(a.persona + bizContext() + spatial, [], text); }
            catch { return FALLBACK[id] ? FALLBACK[id](text) : "סליחה, לא הצלחתי לענות כרגע."; }
          },
        }}
        onClose={onClose}
        onOpenChat={onOpenChat}
      />
    </div>
  );
}

// Panel to summon any agent to your office — now, or scheduled N minutes
// out — with a live punctuality readout once they arrive. A real action:
// it actually redirects that agent's position in the simulation.
const SUMMON_DELAYS = [0, 5, 15, 30];
function SummonPanel({ agents, summons, onCall, onClose }) {
  const statusLabel = (info) => {
    if (!info) return null;
    if (info.status === "scheduled") { const mins = Math.max(0, Math.round((info.scheduledFor - Date.now()) / 60000)); return mins > 0 ? `מתוזמן בעוד ${mins} דק'` : "בדרך…"; }
    if (info.status === "walking") return "בדרך אליך… 🚶";
    if (info.status === "onTime") return "הגיע בזמן ✅";
    if (info.status === "late") return "הגיע באיחור ⏱️";
    return null;
  };
  return (
    <div className="off-summon-panel">
      <div className="off-summon-head"><CalendarClock size={16} /> קרא סוכן למשרד שלך לפגישה<button onClick={onClose}><X size={16} /></button></div>
      <div className="off-summon-list">
        {agents.map((a) => {
          const info = summons[a.id];
          const label = statusLabel(info);
          return (
            <div key={a.id} className="off-summon-row" style={{ "--c": a.color }}>
              <span className="off-summon-orb"><Face agent={a} fallback={14} /></span>
              <div className="off-summon-mid"><b>{a.name}</b><span>{a.title}</span></div>
              {label
                ? <span className={"off-summon-status " + (info.status === "late" ? "late" : info.status === "onTime" ? "ok" : "")}>{label}</span>
                : (
                  <div className="off-summon-cta">
                    {SUMMON_DELAYS.map((m) => (
                      <button key={m} onClick={() => onCall(a.id, m)}>{m === 0 ? "עכשיו" : `+${m}ד'`}</button>
                    ))}
                  </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   BUSINESS — what the team has learned about the business (live + taught)
   ════════════════════════════════════════════════════════════════════ */
function RevenueChart({ months }) {
  const max = Math.max(1, ...months.map((m) => m.value));
  const total = months.reduce((a, m) => a + m.value, 0);
  if (!total) return null;
  return (
    <div className="ac-set-card">
      <div className="ac-set-h"><BarChart3 size={17} /> מגמת הכנסה · 6 חודשים אחרונים</div>
      <div className="ac-rev-chart">
        {months.map((m, i) => (
          <div key={m.key} className="ac-rev-col">
            <div className="ac-rev-bar-wrap"><div className="ac-rev-bar" style={{ height: (m.value / max * 100) + "%" }} title={ils(m.value)} /></div>
            <span className="ac-rev-val">{m.value > 0 ? ils(m.value).replace("₪", "") : ""}</span>
            <span className="ac-rev-lbl">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function BusinessView({ showToast, invest }) {
  const [snap, setSnap] = useState(() => bizSnapshot());
  const [months, setMonths] = useState(() => monthlyRevenue());
  const [facts, setFacts] = useState(() => learnedFacts());
  const market = useMarket();
  useCloudSync(K_BIZ, setFacts);
  const [fact, setFact] = useState("");
  useEffect(() => { const iv = setInterval(() => { setSnap(bizSnapshot()); setMonths(monthlyRevenue()); }, 5000); return () => clearInterval(iv); }, []);

  const addFact = () => { const t = fact.trim(); if (!t) return; const next = [t, ...facts].slice(0, 60); setFacts(next); cloudSave(K_BIZ, next); setFact(""); showToast("הצוות למד עובדה חדשה ✓"); };
  const delFact = (i) => { const next = facts.filter((_, k) => k !== i); setFacts(next); cloudSave(K_BIZ, next); };
  const hasData = snap.installs || snap.custCount || snap.openDeals;
  const opportunities = useMemo(() => detectOpportunities(snap), [snap]);

  return (
    <div className="ac-page">
      <div className="ac-hero sm">
        <h1>הידע העסקי של הצוות</h1>
        <p>הסוכנים לומדים את העסק שלך בזמן אמת — וגם מה שתלמד אותם</p>
      </div>

      <div className="ac-biz-grid">
        <div className="ac-biz-kpi"><b>{snap.installs.toLocaleString()}</b><span>התקנות</span></div>
        <div className="ac-biz-kpi"><b className="ok">{ils(snap.hgRevenue)}</b><span>הכנסה מצטברת</span></div>
        <div className="ac-biz-kpi"><b>{snap.custCount.toLocaleString()}</b><span>לקוחות</span></div>
        <div className="ac-biz-kpi"><b className="cy">{snap.openDeals}</b><span>עסקאות פתוחות</span></div>
        <div className="ac-biz-kpi"><b className="cy">{ils(snap.openVal)}</b><span>שווי פייפליין</span></div>
        <div className="ac-biz-kpi"><b className="ok">{snap.wonMonth}</b><span>נסגרו החודש</span></div>
      </div>

      {!hasData && <div className="ac-biz-note">עדיין אין נתונים חיים. פתח את מערכת HeavyGuard או ה-CRM של איתי (באותו דפדפן) כדי שהנתונים יסונכרנו אוטומטית לכאן.</div>}

      {opportunities.length > 0 && (
        <div className="ac-set-card">
          <div className="ac-set-h"><Sparkles size={17} /> תובנות והזדמנויות</div>
          {opportunities.map((op, i) => {
            const ag = byId(op.agentId);
            return (
              <div key={i} className="ac-opp-row" style={{ "--c": ag?.color || "#888" }}>
                <span className="ac-opp-orb"><Face agent={ag} fallback={14} /></span>
                <div className="ac-opp-mid"><b>{ag?.name}</b><p>{op.text}</p></div>
              </div>
            );
          })}
        </div>
      )}

      <RevenueChart months={months} />

      <div className="ac-set-card">
        <div className="ac-set-h"><LineChart size={17} /> עולם ההשקעות · שוק חי</div>
        <p className="ac-set-note">מעקב בלבד — הצוות מנתח ומסמן תנודות, ולעולם לא מבצע קנייה/מכירה אמיתית או נוגע בכסף.</p>
        {market.length === 0 && <div className="ac-biz-note" style={{ margin: "8px 0 0" }}>טוען נתוני שוק חיים…</div>}
        {market.length > 0 && (
          <div className="ac-mk-grid">
            {market.map((r, i) => {
              const up = r.chg >= 0;
              return (
                <div key={i} className="ac-mk-row">
                  <span className="ac-mk-name">{r.name}</span>
                  <span className="ac-mk-price">{r.price}</span>
                  <span className={"ac-mk-chg " + (up ? "up" : "dn")}>{up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {Math.abs(r.chg).toFixed(2)}%</span>
                </div>
              );
            })}
          </div>
        )}
        {invest && invest.length > 0 && (
          <div className="ac-mk-notes">
            {invest.slice(0, 5).map((n) => {
              const ag = byId(n.agentId);
              return (
                <div key={n.id} className="ac-opp-row" style={{ "--c": ag?.color || "#888" }}>
                  <span className="ac-opp-orb"><Face agent={ag} fallback={13} /></span>
                  <div className="ac-opp-mid"><b>{ag?.name}</b><p>{n.text}</p></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {snap.top.length > 0 && (
        <div className="ac-set-card">
          <div className="ac-set-h"><Database size={17} /> לקוחות מובילים</div>
          {snap.top.map((c, i) => (
            <div key={i} className="ac-biz-row"><span className="ac-biz-rank">{i + 1}</span><b>{c.name}</b><span className="ac-biz-cnt">{c.count} התקנות</span><span className="ac-biz-rev">{ils(c.rev)}</span></div>
          ))}
        </div>
      )}

      <div className="ac-set-card">
        <div className="ac-set-h"><GraduationCap size={17} /> למד את הצוות על העסק</div>
        <p className="ac-set-note">כתוב עובדה על העסק (מוצר מוביל, אזור פעילות, יעד, מתחרה, מדיניות…) והצוות יזכור אותה וישתמש בה בכל שיחה.</p>
        <div className="ac-idea-add">
          <input value={fact} onChange={(e) => setFact(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addFact()} placeholder="למשל: רוב הלקוחות שלנו צי משאיות באזור המרכז…" dir="rtl" />
          <button onClick={addFact}><Plus size={18} /></button>
        </div>
        {facts.length === 0 && <div className="ac-biz-note" style={{ margin: "8px 0 0" }}>עדיין לא לימדת את הצוות עובדות. כל מה שתוסיף — הם יזכרו.</div>}
        {facts.map((f, i) => (
          <div key={i} className="ac-biz-fact"><GraduationCap size={13} /><span>{f}</span><button onClick={() => delFact(i)}><Trash2 size={13} /></button></div>
        ))}
      </div>

      <div className="ac-set-foot">הידע מסונכרן חי · הסוכנים מתעדכנים אוטומטית</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SETTINGS
   ════════════════════════════════════════════════════════════════════ */
function SettingsView({ showToast }) {
  const [key, setKey] = useState(() => groqKey());
  const [saved, setSaved] = useState(false);
  const [claudeKey, setClaudeKey] = useState(() => anthropicKey());
  const [claudeSaved, setClaudeSaved] = useState(false);
  const [claudeMdl, setClaudeMdl] = useState(() => claudeModel());
  const saveClaude = () => {
    try { localStorage.setItem("alpha_anthropic", claudeKey.trim()); localStorage.setItem(K_CLAUDE_MODEL, claudeMdl); } catch {}
    setClaudeSaved(true); showToast(claudeKey.trim() ? "Claude חובר ✓" : "ההגדרות נשמרו"); setTimeout(() => setClaudeSaved(false), 1500);
  };
  const clearClaude = () => { try { localStorage.removeItem("alpha_anthropic"); } catch {} setClaudeKey(""); showToast("מפתח Claude נמחק"); };
  const [gCid, setGCid] = useState(() => googleCid());
  const [fbP, setFbP] = useState(() => fbPageId());
  const [fbT, setFbT] = useState(() => fbPageToken());
  const [fbStatus, setFbStatus] = useState("");
  const saveFb = () => {
    try { localStorage.setItem(K_FB_PAGE, fbP.trim()); localStorage.setItem(K_FB_TOKEN, fbT.trim()); } catch {}
    showToast("חיבור פייסבוק נשמר ✓");
  };
  const testFb = async () => {
    saveFb();
    if (!fbConnected()) { setFbStatus("חסר Page ID או טוקן"); return; }
    setFbStatus("בודק…");
    try { const d = await fbTestConnection(); setFbStatus(`מחובר לעמוד "${d.name}" 🟢`); }
    catch (e) { setFbStatus("שגיאה: " + String(e?.message || e).slice(0, 90)); }
  };
  const initGh = ghCfg();
  const [ghTok, setGhTok] = useState(initGh.token);
  const [ghRepo, setGhRepo] = useState(`${initGh.owner}/${initGh.repo}`);
  const [ghSaved, setGhSaved] = useState(false);
  const [cloudCfg, setCloudCfg] = useState(() => cloud.cloudConfigRaw());
  const [cloudSaved, setCloudSaved] = useState(false);

  const saveCloud = () => {
    const t = cloudCfg.trim();
    if (t) { try { const o = JSON.parse(t); if (!o.projectId || !o.apiKey) { showToast("ההגדרות חסרות apiKey/projectId"); return; } } catch { showToast("ההגדרות אינן JSON תקין"); return; } }
    cloud.setCloudConfig(t);
    setCloudSaved(true); showToast(t ? "הענן חובר ✓ רענן כדי לסנכרן" : "הענן נותק"); setTimeout(() => setCloudSaved(false), 1500);
  };

  const saveKey = () => {
    try { localStorage.setItem("alpha_groq", key.trim()); } catch {}
    setSaved(true); showToast("נשמר ✓"); setTimeout(() => setSaved(false), 1500);
  };
  const clear = () => { try { localStorage.removeItem("alpha_groq"); } catch {} setKey(""); showToast("נמחק"); };

  const saveGh = () => {
    const [owner, repo] = (ghRepo.includes("/") ? ghRepo : `${REPO_DEFAULT.owner}/${ghRepo}`).split("/");
    save(K_GH, { token: ghTok.trim(), owner: (owner || REPO_DEFAULT.owner).trim(), repo: (repo || REPO_DEFAULT.repo).trim() });
    setGhSaved(true); showToast("GitHub חובר ✓"); setTimeout(() => setGhSaved(false), 1500);
  };
  const clearGh = () => { save(K_GH, { token: "", owner: REPO_DEFAULT.owner, repo: REPO_DEFAULT.repo }); setGhTok(""); showToast("הטוקן נמחק"); };

  return (
    <div className="ac-page">
      <div className="ac-hero sm">
        <h1>הגדרות</h1>
        <p>חבר מוח AI לכל הסוכנים — Claude האמיתי, או Groq החינמי</p>
      </div>

      <div className="ac-set-card">
        <div className="ac-set-h"><Sparkles size={18} /> Claude (Anthropic) · המוח האמיתי
          <span className={"ac-cloud-pill " + (anthropicKey() ? "on" : "")}>{anthropicKey() ? "מחובר 🟢" : "לא מחובר ⚪"}</span>
        </div>
        <p className="ac-set-note">חיבור ישיר ל-Claude של Anthropic — כל שיחה עם סוכן עוברת למודל האמיתי. שים לב: זהו שירות <b>בתשלום לפי שימוש</b> (אין מנוי קבוע — משלמים רק על מה שצורכים, ואפשר להגדיר תקרת הוצאה חודשית בחשבון Anthropic). 🔒 המפתח נשמר רק במכשיר הזה והקריאות הולכות ישירות מהדפדפן ל-Anthropic. 🧭 כששני המפתחות מחוברים, יהודה (המנכ"ל) מנתב כל בקשה לפי הגודל שלה: שאלות קצרות ויומיומיות → Groq החינמי; משימות גדולות/מורכבות (תכנון, ניתוח, קוד, מסמכים, שיחה עמוקה) → Claude. ליד כל תשובה בצ'אט מופיע תג שמראה איזה מוח ענה ולמה. אם מנוע נכשל — השני מחלץ אוטומטית.</p>
        <input className="ac-set-in" type="password" value={claudeKey} onChange={(e) => setClaudeKey(e.target.value)} placeholder="sk-ant-..." dir="ltr" />
        <select className="ac-set-in" value={claudeMdl} onChange={(e) => setClaudeMdl(e.target.value)} dir="rtl">
          {CLAUDE_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        <div className="ac-set-row">
          <button className="ac-set-save" onClick={saveClaude}>{claudeSaved ? <><Check size={16} /> חובר</> : <><Sparkles size={16} /> חבר את Claude</>}</button>
          <button className="ac-set-clear" onClick={clearClaude}><Trash2 size={15} /></button>
        </div>
        <a className="ac-set-link" href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">צור מפתח API בחשבון Anthropic <ArrowUpRight size={13} /></a>
      </div>

      <div className="ac-set-card">
        <div className="ac-set-h"><Megaphone size={18} /> Google Business · ביקורות לנפתלי</div>
        <p className="ac-set-note">נפתלי (שיווק) מושך את הביקורות האמיתיות של העסק מ-Google Business Profile והופך אותן לפוסטים — כפתור "⭐ ביקורות גוגל" בחלון השיחה שלו. הזרימה משתמשת רק ב-Client ID הציבורי (התחברות בחלון קופץ של גוגל) — <b>בלי ה-client_secret, שלעולם לא נכנס לקוד</b>. דרישות חד-פעמיות בקונסולת Google Cloud: להוסיף את כתובת האתר כ-JavaScript origin מורשה, ולאשר גישה ל-Business Profile APIs.</p>
        <input className="ac-set-in" value={gCid} onChange={(e) => setGCid(e.target.value)} placeholder="....apps.googleusercontent.com" dir="ltr" />
        <div className="ac-set-row">
          <button className="ac-set-save" onClick={() => { try { localStorage.setItem(K_GOOGLE_CID, gCid.trim()); } catch {} showToast("Client ID נשמר ✓"); }}><Check size={16} /> שמור</button>
        </div>
        <a className="ac-set-link" href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">קונסולת Google Cloud · Credentials <ArrowUpRight size={13} /></a>
      </div>

      <div className="ac-set-card">
        <div className="ac-set-h"><Megaphone size={18} /> רשתות חברתיות · פרסום לנפתלי
          <span className={"ac-cloud-pill " + (fbConnected() ? "on" : "")}>{fbConnected() ? "מחובר 🟢" : "לא מחובר ⚪"}</span>
        </div>
        <p className="ac-set-note">נפתלי מכין טיוטות פוסטים, ו<b>שום דבר לא מתפרסם בלי אישור ידני שלך</b> — כפתור "📣 רשתות חברתיות" בחלון השיחה שלו פותח את תור הטיוטות עם כפתור אישור לכל פוסט. פרסום לפייסבוק דורש Page ID + Page Access Token של עמוד העסק (מ-Meta Graph API Explorer, עם ההרשאות pages_manage_posts + pages_read_engagement). 🔒 הטוקן נשמר רק במכשיר הזה ולעולם לא נכנס לקוד. טיקטוק — אין API לפרסום מדפדפן בלבד (דורש אפליקציה מאושרת ושרת), ולכן שם הזרימה היא העתקה ידנית של הטיוטה.</p>
        <input className="ac-set-in" value={fbP} onChange={(e) => setFbP(e.target.value)} placeholder="Facebook Page ID (מספר העמוד)" dir="ltr" />
        <input className="ac-set-in" type="password" value={fbT} onChange={(e) => setFbT(e.target.value)} placeholder="Page Access Token (EAAG...)" dir="ltr" />
        <div className="ac-set-row">
          <button className="ac-set-save" onClick={saveFb}><Check size={16} /> שמור</button>
          <button className="ac-set-save" onClick={testFb}>🔌 בדוק חיבור</button>
          <button className="ac-set-clear" onClick={() => { try { localStorage.removeItem(K_FB_PAGE); localStorage.removeItem(K_FB_TOKEN); } catch {} setFbP(""); setFbT(""); setFbStatus(""); showToast("נמחק"); }}><Trash2 size={15} /></button>
        </div>
        {fbStatus && <p className="ac-set-note" style={{ marginTop: 6 }}>{fbStatus}</p>}
        <a className="ac-set-link" href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer">Meta Graph API Explorer · הפקת טוקן עמוד <ArrowUpRight size={13} /></a>
      </div>

      <div className="ac-set-card">
        <div className="ac-set-h"><Brain size={18} /> מפתח Groq (AI חינם)</div>
        <p className="ac-set-note">הסוכנים משתמשים במנוע Groq החינמי. הדבק מפתח (אותו מפתח שמשמש את שאר אלפא) כדי להפוך את כל הצוות ל-AI חי. בלי מפתח — הסוכנים פעילים במצב הדגמה עם תשובות מובנות.</p>
        <input className="ac-set-in" type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="gsk_..." dir="ltr" />
        <div className="ac-set-row">
          <button className="ac-set-save" onClick={saveKey}>{saved ? <><Check size={16} /> נשמר</> : <><ShieldCheck size={16} /> שמור והפעל</>}</button>
          <button className="ac-set-clear" onClick={clear}><Trash2 size={15} /></button>
        </div>
        <a className="ac-set-link" href="https://console.groq.com/keys" target="_blank" rel="noreferrer">השג מפתח חינם מ-Groq <ArrowUpRight size={13} /></a>
      </div>

      <div className="ac-set-card">
        <div className="ac-set-h"><Globe size={18} /> סנכרון בין מכשירים · ענן
          <span className={"ac-cloud-pill " + (cloud.cloudConfigured() ? "on" : "")}>{cloud.cloudConfigured() ? "מחובר 🟢" : "לא מחובר ⚪"}</span>
        </div>
        <p className="ac-set-note">בלי חיבור ענן, כל מכשיר/דפדפן רואה רק את הנתונים שלו (localStorage מקומי) — זו הסיבה שמכשיר חדש "לא רואה" את הסוכנים. חבר מסד Firebase חינמי <b>נפרד לחלוטין מהענן שאיתי מחובר אליו</b> (אפשר פרויקט Firebase חדש לגמרי, או אותו פרויקט עם קוד שונה) כדי שכל השיחות, הרעיונות, משימות הפיתוח והידע העסקי יסונכרנו בזמן אמת — רק בין המכשירים שלך. ⚠️ אל תיתן את הקוד הזה לאיתי או לאף אחד אחר — זה אזור הבעלים בלבד. 🔒 טוקן GitHub ומפתח Groq נשארים תמיד מקומיים בכל מכשיר, מטעמי אבטחה.</p>
        <textarea className="ac-set-in" style={{ minHeight: 70, fontFamily: "ui-monospace,monospace", fontSize: 12 }} value={cloudCfg} onChange={(e) => setCloudCfg(e.target.value)} placeholder='{"apiKey":"...","projectId":"...", ...}' dir="ltr" />
        <div className="ac-set-row">
          <button className="ac-set-save" onClick={saveCloud}>{cloudSaved ? <><Check size={16} /> חובר</> : <><Globe size={16} /> חבר ענן וסנכרן</>}</button>
        </div>
        <a className="ac-set-link" href="https://console.firebase.google.com" target="_blank" rel="noreferrer">פתח פרויקט Firebase חינמי <ArrowUpRight size={13} /></a>
      </div>

      <div className="ac-set-card">
        <div className="ac-set-h"><GitBranch size={18} /> חיבור למאגר הקוד (GitHub)</div>
        <p className="ac-set-note">חבר טוקן GitHub אישי (הרשאת repo) כדי שדן יוכל לכתוב קוד, לפתוח Issues ו-PRs. אותו טוקן אחד נותן גישה לכל המאגרים שלך — כולל <b>Alpha-new</b> וגם <b>heavt-guard-simulator</b> (האתר שרץ על Render). בחדר הפיתוח יש בורר מאגר כדי לבחור על איזה פרויקט דן עובד בכל משימה. 🔒 הטוקן נשמר רק במכשיר שלך (localStorage) — לעולם לא נשלח לשום מקום חוץ מ-GitHub ולא נכנס לקוד.</p>
        <input className="ac-set-in" type="password" value={ghTok} onChange={(e) => setGhTok(e.target.value)} placeholder="ghp_... (Personal Access Token, הרשאת repo)" dir="ltr" />
        <input className="ac-set-in" value={ghRepo} onChange={(e) => setGhRepo(e.target.value)} placeholder="owner/repo (ברירת מחדל)" dir="ltr" />
        <div className="ac-set-row">
          <button className="ac-set-save" onClick={saveGh}>{ghSaved ? <><Check size={16} /> חובר</> : <><GitBranch size={16} /> חבר מאגר</>}</button>
          <button className="ac-set-clear" onClick={clearGh}><Trash2 size={15} /></button>
        </div>
        <a className="ac-set-link" href="https://github.com/settings/tokens/new?scopes=repo&description=Alpha%20Agents" target="_blank" rel="noreferrer">צור טוקן (הרשאת repo) <ArrowUpRight size={13} /></a>
      </div>

      <div className="ac-set-card">
        <div className="ac-set-h"><ClipboardList size={18} /> איך זה עובד</div>
        <ul className="ac-set-list">
          <li><b>{AGENTS.length} סוכנים</b> — כל אחד מנהל תחום במערכות שלך.</li>
          <li><b>מנכ"ל (אורקל)</b> — מתעדף, מאציל ונותן תמונת מצב חוצת-מערכות.</li>
          <li><b>חלון שיחה ישיר</b> — לכל סוכן, עם זיכרון שיחה מקומי.</li>
          <li><b>חדר פיתוח</b> — דן מנסח בריף על הקוד האמיתי → Issue במאגר או משימה ל-Claude Code.</li>
          <li><b>לוח רעיונות</b> — אוסף רעיונות לפיתוח, אוטומציות וקידום.</li>
          <li><b>פעילות חיה</b> — מציג מה הצוות עושה בזמן אמת.</li>
        </ul>
      </div>

      <div className="ac-set-foot">ALPHA · Agents Command Center · v1</div>
    </div>
  );
}

/* ── utils ── */
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; }
  catch { try { const ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); return true; } catch { return false; } }
}

/* ════════════════════════════════════════════════════════════════════
   STYLES — futuristic glass / neon
   ════════════════════════════════════════════════════════════════════ */
function StyleTag() {
  return <style>{`
.ac{--void:#04040E;--s9:#0A0A18;--s8:#10101F;--s7:rgba(218,165,32,.18);--s4:#7886B8;--silver:#E4E8FA;--gold:#E4BC63;--gold2:#B48828;
  font-family:'Heebo',Arial,sans-serif;color:var(--silver);background:var(--void);min-height:100%;direction:rtl;padding-bottom:80px;position:relative}
.ac *{box-sizing:border-box}
.ac::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
  background-image:
    radial-gradient(circle at 15% 12%,rgba(228,188,99,.07),transparent 38%),
    radial-gradient(circle at 85% 80%,rgba(110,211,240,.05),transparent 40%),
    linear-gradient(rgba(218,165,32,.022) 1px,transparent 1px),
    linear-gradient(90deg,rgba(218,165,32,.022) 1px,transparent 1px);
  background-size:100% 100%,100% 100%,60px 60px,60px 60px;
  animation:acGrid 80s linear infinite;
  -webkit-mask-image:radial-gradient(ellipse 100% 80% at 50% 35%,#000 30%,transparent 80%);
  mask-image:radial-gradient(ellipse 100% 80% at 50% 35%,#000 30%,transparent 80%)}
@keyframes acGrid{from{background-position:0 0,0 0,0 0,0 0}to{background-position:0 0,0 0,60px 60px,60px 60px}}
@keyframes acPulse{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.12);opacity:1}}
@keyframes acRing{0%{transform:scale(.8);opacity:.7}100%{transform:scale(1.7);opacity:0}}
@keyframes acDot{0%,100%{opacity:.4;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
@keyframes acShimmer{0%{background-position:200% center}100%{background-position:-200% center}}
@keyframes acFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes acType{0%,60%,100%{opacity:.25;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
@keyframes acRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

/* ── Top bar ── */
.ac-top{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;padding:14px 16px;
  background:rgba(4,4,14,.85);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
  border-bottom:1px solid transparent;border-image:linear-gradient(90deg,transparent,rgba(228,188,99,.5),transparent) 1}
.ac-top-brand{display:flex;align-items:center;gap:11px}
.ac-top-orb{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#1a1400;
  background:linear-gradient(135deg,var(--gold),var(--gold2));box-shadow:0 4px 18px rgba(228,188,99,.4)}
.ac-top-txt b{display:block;font-family:'Rubik';font-weight:900;font-size:17px;letter-spacing:-.3px}
.ac-top-txt span{font-size:9.5px;color:var(--s4);letter-spacing:.18em;font-weight:700}
.ac-top-status{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:800;padding:7px 12px;border-radius:20px;border:1px solid var(--s7)}
.ac-top-status.on{color:#3FD79A;border-color:rgba(63,215,154,.4);background:rgba(63,215,154,.08)}
.ac-top-status.off{color:var(--s4);background:var(--s9)}
.ac-top-status svg{animation:acDot 2s ease-in-out infinite}

.ac-main{position:relative;z-index:1}
.ac-page{padding:18px 16px 24px;max-width:1100px;margin:0 auto;animation:acRise .35s ease both}

/* ── Hero ── */
.ac-hero{position:relative;padding:8px 4px 18px;overflow:hidden}
.ac-hero h1{font-family:'Rubik';font-weight:900;font-size:27px;letter-spacing:-.5px;background:linear-gradient(100deg,#fff,var(--gold) 55%,var(--gold2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;background-size:200% auto;animation:acShimmer 7s linear infinite}
.ac-hero p{font-size:13px;color:var(--s4);margin-top:5px;line-height:1.6}
.ac-hero.sm h1{font-size:23px}
.ac-hero-glow{position:absolute;top:-40px;right:-20px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(228,188,99,.16),transparent 70%);pointer-events:none}

/* ── orbs ── */
.ac-orb,.ac-ceo-orb,.ac-chat-orb,.ac-feed-orb{position:relative;display:flex;align-items:center;justify-content:center;color:#0c0a02;flex-shrink:0;
  background:radial-gradient(circle at 35% 28%,var(--ac,#fff),var(--c,#E4BC63) 60%);
  box-shadow:0 4px 18px color-mix(in srgb,var(--c,#E4BC63) 55%,transparent),inset 0 1px 0 rgba(255,255,255,.5)}
.ac-orb{width:46px;height:46px;border-radius:14px}
.ac-orb-ring{position:absolute;inset:0;border-radius:inherit;border:2px solid var(--c,#E4BC63);animation:acRing 2.6s ease-out infinite;pointer-events:none}
.ac-face{width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block;user-select:none}

/* ── roster portraits: circular avatar + live dot + role badge ── */
.ac-avatar-wrap{position:relative;width:46px;height:46px;flex-shrink:0}
.ac-avatar-wrap--xl{width:62px;height:62px}
.ac-avatar-wrap .ac-orb,.ac-avatar-wrap .ac-ceo-orb{width:100%;height:100%;border-radius:50%}
.ac-avatar-live{position:absolute;bottom:1px;left:1px;width:13px;height:13px;border-radius:50%;background:#3FD79A;
  border:2.5px solid #0a0a14;box-shadow:0 0 8px #3FD79A;animation:acDot 1.8s ease-in-out infinite}
.ac-avatar-badge{position:absolute;top:-3px;right:-3px;width:22px;height:22px;border-radius:50%;background:var(--c);
  color:#0c0a02;display:flex;align-items:center;justify-content:center;border:2.5px solid #0d0c1a;
  box-shadow:0 2px 8px color-mix(in srgb,var(--c) 55%,transparent)}

/* ── live dot ── */
.ac-live-dot{width:7px;height:7px;border-radius:50%;background:#3FD79A;box-shadow:0 0 8px #3FD79A;animation:acDot 1.8s ease-in-out infinite;flex-shrink:0;display:inline-block}

/* ── daily briefing banner ── */
.ac-brief{position:relative;display:flex;align-items:flex-start;gap:11px;width:100%;overflow:hidden;
  background:linear-gradient(120deg,rgba(28,22,6,.96),rgba(14,12,24,.97));
  border:1px solid color-mix(in srgb,var(--c) 35%,transparent);border-radius:16px;padding:13px 14px;margin-bottom:16px;
  box-shadow:0 6px 26px rgba(0,0,0,.4);animation:acRise .35s ease both}
.ac-brief-glow{position:absolute;inset:0;background:radial-gradient(circle at 90% 0%,color-mix(in srgb,var(--c) 22%,transparent),transparent 55%);pointer-events:none}
.ac-brief-orb{width:36px;height:36px;border-radius:11px;overflow:hidden;flex-shrink:0;box-shadow:0 3px 12px color-mix(in srgb,var(--c) 45%,transparent)}
.ac-brief-mid{flex:1;min-width:0;position:relative}
.ac-brief-mid b{display:flex;align-items:center;gap:5px;font-family:'Rubik';font-weight:800;font-size:12.5px;color:var(--c);margin-bottom:4px}
.ac-brief-mid p{font-size:13px;line-height:1.6;color:var(--silver)}
.ac-brief-load{font-size:12.5px;color:var(--s4);display:flex;align-items:center;gap:6px}
.ac-brief-load span{width:5px;height:5px;border-radius:50%;background:var(--c);display:inline-block;animation:acType 1.2s ease-in-out infinite}
.ac-brief-load span:nth-child(2){animation-delay:.2s} .ac-brief-load span:nth-child(3){animation-delay:.4s}
.ac-brief-acts{display:flex;flex-direction:column;gap:6px;flex-shrink:0;position:relative}
.ac-brief-acts button{width:28px;height:28px;border-radius:9px;background:var(--s8);border:1px solid var(--s7);color:var(--s4);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s}
.ac-brief-acts button:hover{color:var(--c);border-color:color-mix(in srgb,var(--c) 50%,transparent)}

/* ── CEO card ── */
.ac-ceo{position:relative;width:100%;display:flex;align-items:center;gap:14px;text-align:right;cursor:pointer;font-family:inherit;color:inherit;
  background:linear-gradient(135deg,rgba(28,22,6,.95),rgba(12,10,20,.97));
  border:1px solid color-mix(in srgb,var(--c) 45%,transparent);border-radius:20px;padding:18px 16px;margin-bottom:20px;overflow:hidden;
  box-shadow:0 10px 40px rgba(0,0,0,.5),0 0 0 1px color-mix(in srgb,var(--c) 12%,transparent),inset 0 1px 0 rgba(255,255,255,.05);
  transition:transform .2s,box-shadow .25s}
.ac-ceo:hover{transform:translateY(-3px);box-shadow:0 16px 50px color-mix(in srgb,var(--c) 28%,transparent)}
.ac-ceo:active{transform:scale(.99)}
.ac-ceo-glow{position:absolute;inset:0;background:radial-gradient(circle at 88% 15%,color-mix(in srgb,var(--c) 30%,transparent),transparent 55%);pointer-events:none}
.ac-ceo-orb{width:62px;height:62px;border-radius:18px;animation:acFloat 5s ease-in-out infinite}
.ac-ceo-mid{flex:1;min-width:0;position:relative}
.ac-ceo-top{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
.ac-ceo-top b{font-family:'Rubik';font-weight:900;font-size:21px}
.ac-crown{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:800;color:var(--c);background:color-mix(in srgb,var(--c) 14%,transparent);border:1px solid color-mix(in srgb,var(--c) 35%,transparent);padding:3px 9px;border-radius:20px}
.ac-ceo-mid p{font-size:12.5px;color:var(--s4);margin:5px 0 8px;line-height:1.5}
.ac-ceo-now{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--silver);font-weight:600}
.ac-ceo-cta{display:flex;align-items:center;gap:6px;background:linear-gradient(135deg,var(--c),var(--gold2));color:#1a1400;font-family:'Rubik';font-weight:900;font-size:12.5px;padding:11px 14px;border-radius:13px;flex-shrink:0;box-shadow:0 6px 20px color-mix(in srgb,var(--c) 40%,transparent)}

/* ── section title ── */
.ac-sectitle{display:flex;align-items:center;gap:8px;font-family:'Rubik';font-weight:800;font-size:14px;color:var(--gold);margin:4px 4px 12px;text-shadow:0 0 14px rgba(228,188,99,.35)}

/* ── grid ── */
.ac-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
@media(min-width:640px){.ac-grid{grid-template-columns:repeat(3,1fr)}}
@media(min-width:980px){.ac-grid{grid-template-columns:repeat(4,1fr)}}
.ac-card{position:relative;text-align:center;cursor:pointer;font-family:inherit;color:inherit;overflow:hidden;
  background:radial-gradient(140% 70% at 50% -12%,color-mix(in srgb,var(--c) 22%,transparent),transparent 60%),
    linear-gradient(160deg,rgba(16,14,32,.96),rgba(8,8,18,.97));
  border:1px solid color-mix(in srgb,var(--c) 28%,transparent);border-top:2.5px solid color-mix(in srgb,var(--c) 60%,transparent);
  border-radius:18px;padding:16px 12px 14px;
  box-shadow:0 6px 26px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.04);
  transition:transform .2s,box-shadow .25s,border-color .2s}
.ac-card:hover{transform:translateY(-4px);border-color:color-mix(in srgb,var(--c) 65%,transparent);box-shadow:0 14px 40px color-mix(in srgb,var(--c) 22%,transparent)}
.ac-card:active{transform:scale(.98)}
.ac-card-glow{position:absolute;top:-30px;left:-30px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--c) 22%,transparent),transparent 70%);pointer-events:none}
.ac-card-portrait{display:flex;justify-content:center;margin-bottom:10px;position:relative}
.ac-card-name{font-family:'Rubik';font-weight:900;font-size:16px;position:relative}
.ac-card-title{font-size:11.5px;color:var(--c);font-weight:700;margin-top:2px}
.ac-card-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:4px;margin-top:9px}
.ac-chip{font-size:9px;font-weight:700;color:var(--s3);background:var(--s8);border:1px solid var(--s7);border-radius:20px;padding:3px 8px;white-space:nowrap}
.ac-card-now{font-size:11px;color:var(--silver);margin-top:10px;line-height:1.45;min-height:30px;opacity:.85;border-top:1px solid var(--s7);padding-top:9px}
.ac-card-foot{display:flex;align-items:center;justify-content:center;gap:5px;margin-top:11px;font-size:11.5px;font-weight:900;color:#0c0a02;
  background:linear-gradient(135deg,var(--c),color-mix(in srgb,var(--c) 55%,#000));border:none;border-radius:11px;padding:9px;
  box-shadow:0 4px 16px color-mix(in srgb,var(--c) 42%,transparent)}

/* ── bottom nav ── */
.ac-nav{position:fixed;bottom:0;left:0;right:0;z-index:40;display:flex;
  background:rgba(4,4,14,.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border-top:1px solid transparent;border-image:linear-gradient(90deg,transparent,rgba(228,188,99,.5),transparent) 1;
  box-shadow:0 -8px 40px rgba(0,0,0,.6);padding-bottom:env(safe-area-inset-bottom)}
.ac-nav button{flex:1;background:none;border:none;color:var(--s4);padding:10px 0 12px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;font-family:inherit;transition:color .15s}
.ac-nav button span{font-size:11px;font-weight:700}
.ac-nav-ic{position:relative;display:flex}
.ac-nav-badge{position:absolute;top:-6px;right:-9px;background:#FF6B9D;color:#fff;font-size:9px;font-weight:900;min-width:15px;height:15px;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 3px;font-style:normal;box-shadow:0 2px 6px rgba(255,107,157,.5)}
.ac-nav button.on{color:var(--gold)}
.ac-nav button.on .ac-nav-ic{filter:drop-shadow(0 0 6px rgba(228,188,99,.7))}

/* ── chat modal ── */
.ac-modal{position:fixed;inset:0;z-index:200;background:rgba(2,2,10,.78);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:flex-end;justify-content:center;animation:acRise .2s ease both}
.ac-chat{width:100%;max-width:600px;height:92vh;display:flex;flex-direction:column;
  background:linear-gradient(165deg,rgba(14,12,28,.99),rgba(6,6,16,.99));
  border:1px solid color-mix(in srgb,var(--c) 35%,transparent);border-radius:22px 22px 0 0;overflow:hidden;
  box-shadow:0 -20px 70px rgba(0,0,0,.75),0 0 0 1px color-mix(in srgb,var(--c) 14%,transparent)}
@media(min-width:640px){.ac-modal{align-items:center}.ac-chat{height:88vh;border-radius:22px}}
.ac-chat-head{display:flex;align-items:center;gap:11px;padding:13px 14px;border-bottom:1px solid color-mix(in srgb,var(--c) 22%,transparent);background:linear-gradient(135deg,color-mix(in srgb,var(--c) 10%,transparent),transparent)}
.ac-chat-back,.ac-chat-x{background:var(--s8);border:1px solid var(--s7);color:var(--silver);width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:.15s}
.ac-chat-back:hover,.ac-chat-x:hover{border-color:color-mix(in srgb,var(--c) 50%,transparent);color:var(--c)}
.ac-chat-x.on{border-color:color-mix(in srgb,var(--c) 60%,transparent);color:var(--c);background:color-mix(in srgb,var(--c) 14%,transparent)}
.ac-mic-btn{width:48px;flex-shrink:0;border-radius:13px;background:var(--s8);border:1px solid var(--s7);color:var(--silver);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.15s}
.ac-mic-btn:hover{border-color:color-mix(in srgb,var(--c) 50%,transparent);color:var(--c)}
.ac-mic-btn.on{background:linear-gradient(135deg,var(--c),var(--gold2));color:#1a1400;border-color:transparent;animation:acMicPulse 1.1s ease-in-out infinite}
.ac-mic-btn:disabled{opacity:.45;cursor:not-allowed}
@keyframes acMicPulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--c) 45%,transparent)}50%{box-shadow:0 0 0 8px transparent}}
.ac-chat-orb{width:38px;height:38px;border-radius:11px}
.ac-chat-id{flex:1;min-width:0}
.ac-chat-id b{display:flex;align-items:center;gap:5px;font-family:'Rubik';font-weight:900;font-size:16px}
.ac-chat-id b svg{color:var(--c)}
.ac-chat-id span{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--s4)}

.ac-switch{display:flex;gap:7px;padding:10px 14px;overflow-x:auto;border-bottom:1px solid var(--s7);scrollbar-width:none}
.ac-switch::-webkit-scrollbar{display:none}
.ac-switch button{flex-shrink:0;width:36px;height:36px;border-radius:11px;background:var(--s8);border:1px solid var(--s7);color:var(--s4);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s;padding:0;overflow:hidden}
.ac-switch button:hover{color:var(--c);border-color:color-mix(in srgb,var(--c) 50%,transparent)}
.ac-switch button.on{background:color-mix(in srgb,var(--c) 18%,transparent);border-color:var(--c);color:var(--c);box-shadow:0 0 12px color-mix(in srgb,var(--c) 30%,transparent)}
.ac-switch-btn{opacity:.6}
.ac-switch-btn.on{opacity:1}

.ac-chat-log{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:14px}
.ac-msg{display:flex;gap:9px;max-width:90%;animation:acRise .25s ease both}
.ac-msg.bot{align-self:flex-start}
.ac-msg.me{align-self:flex-end;flex-direction:row-reverse}
.ac-msg-av{width:28px;height:28px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#0c0a02;background:radial-gradient(circle at 35% 28%,var(--ac),var(--c) 65%);box-shadow:0 2px 10px color-mix(in srgb,var(--c) 45%,transparent)}
.ac-msg-body{min-width:0}
.ac-msg-txt{font-size:13.5px;line-height:1.6;padding:11px 13px;border-radius:14px;white-space:pre-wrap;word-break:break-word}
.ac-msg.bot .ac-msg-txt{background:linear-gradient(160deg,rgba(22,20,44,.95),rgba(12,12,26,.95));border:1px solid color-mix(in srgb,var(--c) 20%,transparent);border-top-right-radius:4px;color:var(--silver)}
.ac-msg.me .ac-msg-txt{background:linear-gradient(135deg,var(--c),var(--gold2));color:#1a1400;font-weight:600;border-top-left-radius:4px;box-shadow:0 4px 16px color-mix(in srgb,var(--c) 35%,transparent)}
.ac-msg-acts{display:flex;gap:7px;margin-top:6px}
.ac-msg-acts button{display:flex;align-items:center;gap:4px;background:var(--s8);border:1px solid var(--s7);color:var(--s4);border-radius:8px;padding:5px 9px;font-family:inherit;font-size:10.5px;font-weight:700;cursor:pointer;transition:.15s}
.ac-msg-acts button:hover{color:var(--c);border-color:color-mix(in srgb,var(--c) 45%,transparent)}
/* ── JARVIS command-center roster ─────────────────────────────────────── */
.ac-cmd{position:relative}
.ac-cmd::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(ellipse 90% 55% at 50% -8%, rgba(24,224,255,.055), transparent 62%),
    radial-gradient(ellipse 70% 45% at 88% 108%, rgba(255,62,165,.045), transparent 62%),
    repeating-linear-gradient(0deg, transparent 0 39px, rgba(120,160,255,.032) 39px 40px),
    repeating-linear-gradient(90deg, transparent 0 39px, rgba(120,160,255,.032) 39px 40px)}
.ac-cube{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;
  padding:18px 13px 13px;border-radius:20px;cursor:pointer;isolation:isolate;overflow:hidden;user-select:none;
  background:linear-gradient(160deg, rgba(16,22,40,.72), rgba(8,11,22,.86));
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  border:1px solid color-mix(in srgb, var(--st,#18e0ff) 26%, transparent);
  box-shadow:0 14px 34px rgba(0,0,0,.45), inset 0 0 26px rgba(8,13,28,.55);
  transform:perspective(760px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));
  transition:box-shadow .25s, border-color .25s, transform .12s ease-out}
.ac-cube.online{--st:#18e0ff}
.ac-cube.exec{--st:#b56bff;animation:cubePulse 2.1s ease-in-out infinite}
@keyframes cubePulse{0%,100%{box-shadow:0 0 10px rgba(181,107,255,.14),0 14px 34px rgba(0,0,0,.45)}50%{box-shadow:0 0 30px rgba(181,107,255,.42),0 14px 34px rgba(0,0,0,.45)}}
.ac-cube:hover{transform:perspective(760px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateY(-7px) scale(1.03);
  border-color:color-mix(in srgb, var(--st) 62%, transparent);
  box-shadow:0 0 28px color-mix(in srgb, var(--st) 30%, transparent), 0 24px 46px rgba(0,0,0,.55)}
.ac-cube-scan{position:absolute;left:0;right:0;top:-42%;height:34%;z-index:1;pointer-events:none;opacity:0;
  background:linear-gradient(180deg, transparent, color-mix(in srgb, var(--st,#18e0ff) 14%, transparent) 55%, color-mix(in srgb, var(--st,#18e0ff) 44%, transparent) 97%, transparent)}
.ac-cube:hover .ac-cube-scan, .ac-panel .ac-cube-scan{opacity:1;animation:cubeScan 1.8s linear infinite}
@keyframes cubeScan{from{top:-42%}to{top:122%}}
.ac-cube-core{position:absolute;top:4px;left:50%;width:130px;height:130px;margin-left:-65px;z-index:0;pointer-events:none;border-radius:50%;
  background:radial-gradient(circle, color-mix(in srgb, var(--c) 32%, transparent), transparent 66%);
  filter:blur(6px);animation:corePulse 3s ease-in-out infinite}
.ac-cube-core.big{top:-14px;width:170px;height:170px;margin-left:-85px}
@keyframes corePulse{0%,100%{opacity:.3;transform:scale(.9)}50%{opacity:.62;transform:scale(1.08)}}
.ac-cube-name{font-size:1.05rem;font-weight:900;letter-spacing:1.2px;color:#fff;position:relative;z-index:2}
.ac-cube-status{display:flex;align-items:center;gap:6px;font-size:.66rem;font-weight:800;letter-spacing:.5px;color:var(--st,#18e0ff);position:relative;z-index:2}
.ac-cube-status i{width:7px;height:7px;border-radius:50%;background:var(--st,#18e0ff);box-shadow:0 0 8px var(--st,#18e0ff);animation:blip 1.4s ease-in-out infinite}
@keyframes blip{0%,100%{opacity:.45;transform:scale(.85)}50%{opacity:1;transform:scale(1.2)}}
.ac-cube-term{width:100%;background:rgba(3,6,12,.74);border:1px solid rgba(120,160,255,.13);border-radius:10px;position:relative;z-index:2;
  padding:7px 9px;text-align:right;font-family:ui-monospace,SFMono-Regular,monospace;font-size:.63rem;line-height:1.6;color:#7fe6b0;
  min-height:66px;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden}
.ac-cube-term.panel{min-height:120px;font-size:.7rem;max-height:168px}
.ac-cube-ln{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ac-cube-ln .p{color:var(--c);font-weight:800;margin-left:4px}
.ac-cube-ln .t{color:#4d6183;font-size:.58rem;margin-left:6px}
.ac-caret{display:inline-block;width:7px;height:11px;background:#7fe6b0;vertical-align:-1px;animation:caretBlink 1s steps(1) infinite}
@keyframes caretBlink{50%{opacity:0}}
.ac-cube-metrics{width:100%;display:flex;flex-direction:column;gap:4px;position:relative;z-index:2}
.ac-cube-m{display:flex;align-items:center;gap:7px;font-size:.6rem;color:#8ea0c4}
.ac-cube-m span{width:36px;text-align:right;flex-shrink:0}
.ac-cube-m b{width:28px;color:#cfd8e6;font-size:.6rem;flex-shrink:0;text-align:left}
.ac-cube-m .bar{flex:1;height:5px;border-radius:3px;background:rgba(120,160,255,.13);overflow:hidden}
.ac-cube-m .bar i{display:block;height:100%;width:var(--w);border-radius:3px;transform-origin:right;
  background:linear-gradient(90deg, var(--ac), var(--c));animation:barFlicker 2.7s ease-in-out infinite}
.ac-cube-m .bar.mem i{animation-delay:1.3s}
@keyframes barFlicker{0%,100%{transform:scaleX(1);opacity:1}50%{transform:scaleX(.88);opacity:.75}}
.ac-cube-chat{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:8px 0;margin-top:2px;position:relative;z-index:2;
  border-radius:11px;border:1px solid color-mix(in srgb, var(--c) 38%, transparent);
  background:color-mix(in srgb, var(--c) 10%, transparent);color:var(--ac);
  font-family:inherit;font-size:.74rem;font-weight:800;cursor:pointer;transition:.18s}
.ac-cube-chat:hover{background:color-mix(in srgb, var(--c) 22%, transparent);box-shadow:0 0 14px color-mix(in srgb, var(--c) 30%, transparent)}
/* Agent control panel */
.ac-panel{position:relative;width:min(520px,94vw);max-height:88vh;overflow-y:auto;overflow-x:hidden;border-radius:24px;padding:22px 20px 18px;isolation:isolate;
  background:linear-gradient(165deg, rgba(16,22,40,.92), rgba(7,10,20,.95));
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border:1px solid color-mix(in srgb, var(--c) 42%, transparent);
  box-shadow:0 0 60px color-mix(in srgb, var(--c) 20%, transparent), 0 30px 80px rgba(0,0,0,.6);
  animation:panelIn .3s cubic-bezier(.2,.9,.3,1.15)}
.ac-panel.online{--st:#18e0ff}
.ac-panel.exec{--st:#b56bff}
@keyframes panelIn{from{opacity:0;transform:scale(.72) translateY(30px)}to{opacity:1;transform:scale(1) translateY(0)}}
.ac-panel-x{position:absolute;top:12px;left:12px;z-index:4;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:rgba(6,9,18,.7);border:1px solid rgba(120,160,255,.2);color:#cfd8e6;cursor:pointer}
.ac-panel-head{display:flex;align-items:center;gap:16px;margin-bottom:10px;position:relative;z-index:2}
.ac-panel-id{display:flex;flex-direction:column;gap:4px;text-align:right}
.ac-panel-id b{font-size:1.5rem;font-weight:900;letter-spacing:1px;color:#fff}
.ac-panel-id>span{font-size:.82rem;color:var(--ac);font-weight:700}
.ac-card-chips.center{justify-content:center;margin-bottom:10px}
.ac-panel-stats{display:flex;gap:8px;margin-bottom:10px;position:relative;z-index:2}
.ac-panel-stats>div{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:9px 4px;border-radius:12px;
  background:rgba(10,15,30,.6);border:1px solid rgba(120,160,255,.14)}
.ac-panel-stats b{font-size:1.05rem;font-weight:900;color:var(--ac)}
.ac-panel-stats span{font-size:.6rem;color:#8ea0c4}
.ac-panel-quick{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0;position:relative;z-index:2}
.ac-panel-quick button{border-radius:10px;padding:7px 11px;font-family:inherit;font-size:.7rem;font-weight:700;cursor:pointer;
  background:rgba(10,15,30,.6);border:1px solid rgba(120,160,255,.18);color:#cfd8e6;transition:.15s}
.ac-panel-quick button:hover{border-color:var(--c);color:var(--ac)}
.ac-panel-actions{display:flex;gap:8px;position:relative;z-index:2}
.ac-panel-actions button{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:12px 0;border-radius:13px;
  font-family:inherit;font-size:.82rem;font-weight:800;cursor:pointer;transition:.18s;
  background:rgba(10,15,30,.6);border:1px solid rgba(120,160,255,.2);color:#cfd8e6}
.ac-panel-actions button.main{background:linear-gradient(135deg, color-mix(in srgb, var(--c) 34%, transparent), color-mix(in srgb, var(--c) 14%, transparent));
  border-color:color-mix(in srgb, var(--c) 55%, transparent);color:#fff}
.ac-panel-actions button:hover{box-shadow:0 0 16px color-mix(in srgb, var(--c) 32%, transparent)}
.ac-idea-result{background:rgba(63,215,154,.08);border:1px solid rgba(63,215,154,.3);border-radius:9px;padding:7px 9px;font-size:.68rem;color:#8fe3c0;line-height:1.5;margin:6px 0}
.ac-idea-moves button.exec{background:linear-gradient(135deg,rgba(63,215,154,.25),rgba(63,215,154,.1));border-color:rgba(63,215,154,.5);color:#7fe6b0}
/* Google reviews window (נפתלי) */
.ac-grev-open{background:linear-gradient(135deg,rgba(66,133,244,.22),rgba(66,133,244,.08))!important;border-color:rgba(66,133,244,.45)!important;color:#a9c8ff!important;font-weight:800}
.ac-grev-note{background:rgba(10,15,30,.6);border:1px solid rgba(120,160,255,.16);border-radius:12px;padding:12px;font-size:.8rem;color:#cfd8e6;line-height:1.6}
.ac-grev-note.err{border-color:rgba(255,95,109,.35)}
.ac-grev-note small{display:block;margin-top:8px;color:#8ea0c4;font-size:.68rem;line-height:1.6}
.ac-grev-list{display:flex;flex-direction:column;gap:8px;max-height:52vh;overflow-y:auto}
.ac-grev-row{background:rgba(10,15,30,.6);border:1px solid rgba(120,160,255,.14);border-radius:12px;padding:10px 12px}
.ac-grev-head{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.ac-grev-head b{color:#FFD23F;letter-spacing:2px;font-size:.85rem}
.ac-grev-head span{font-size:.68rem;color:#8ea0c4}
.ac-grev-row p{font-size:.78rem;color:#e6edf7;line-height:1.55;margin:4px 0 8px}
.ac-grev-row button{display:flex;align-items:center;gap:6px;background:color-mix(in srgb,var(--c) 12%,transparent);border:1px solid color-mix(in srgb,var(--c) 40%,transparent);color:var(--ac);border-radius:9px;padding:6px 11px;font-family:inherit;font-size:.7rem;font-weight:800;cursor:pointer}
.ac-via{display:flex;align-items:center;border-radius:8px;padding:5px 9px;font-size:10px;font-weight:800;letter-spacing:.3px;cursor:help}
.ac-via.claude{background:rgba(228,188,99,.12);border:1px solid rgba(228,188,99,.4);color:#E4BC63}
.ac-via.groq{background:rgba(110,170,240,.1);border:1px solid rgba(110,170,240,.35);color:#9fc6f0}
.ac-typing{display:flex;gap:5px;align-items:center;padding:14px 15px!important}
.ac-typing span{width:7px;height:7px;border-radius:50%;background:var(--c);display:inline-block;animation:acType 1.2s ease-in-out infinite}
.ac-typing span:nth-child(2){animation-delay:.2s}
.ac-typing span:nth-child(3){animation-delay:.4s}

.ac-quick{display:flex;gap:7px;padding:10px 14px;overflow-x:auto;scrollbar-width:none;border-top:1px solid var(--s7)}
.ac-quick::-webkit-scrollbar{display:none}
.ac-quick button{flex-shrink:0;background:color-mix(in srgb,var(--c) 9%,transparent);border:1px solid color-mix(in srgb,var(--c) 30%,transparent);color:var(--c);border-radius:20px;padding:8px 14px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;transition:.15s}
.ac-quick button:hover{background:color-mix(in srgb,var(--c) 18%,transparent)}
.ac-quick button:disabled{opacity:.4;cursor:not-allowed}

.ac-chat-in{display:flex;gap:9px;padding:12px 14px;border-top:1px solid color-mix(in srgb,var(--c) 22%,transparent);background:rgba(4,4,12,.6)}
.ac-chat-in input{flex:1;background:var(--s9);border:1px solid var(--s7);border-radius:13px;padding:13px 15px;font-family:inherit;font-size:14.5px;color:var(--silver);outline:none;transition:.15s}
.ac-chat-in input:focus{border-color:color-mix(in srgb,var(--c) 60%,transparent);box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 12%,transparent)}
.ac-chat-in button{width:48px;border-radius:13px;background:linear-gradient(135deg,var(--c),var(--gold2));color:#1a1400;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 16px color-mix(in srgb,var(--c) 40%,transparent);transition:.15s}
.ac-chat-in button:active{transform:scale(.94)}
.ac-chat-in button:disabled{opacity:.45;cursor:not-allowed}

/* ── feed ── */
.ac-feed{display:flex;flex-direction:column;gap:9px}
.ac-feed-row{display:flex;align-items:center;gap:12px;padding:13px;border-radius:14px;animation:acRise .3s ease both;
  background:linear-gradient(160deg,rgba(16,14,32,.95),rgba(8,8,18,.96));border:1px solid var(--s7);border-right:3px solid var(--c)}
.ac-feed-orb{width:36px;height:36px;border-radius:11px}
.ac-feed-mid{flex:1;min-width:0}
.ac-feed-mid b{font-family:'Rubik';font-weight:800;font-size:13.5px}
.ac-feed-mid b span{font-weight:400;font-size:11px;color:var(--s4)}
.ac-feed-mid p{font-size:12.5px;color:var(--silver);margin-top:2px;opacity:.85}
.ac-feed-time{font-size:11px;color:var(--s4);flex-shrink:0;white-space:nowrap}

/* ── ideas board ── */
.ac-idea-add{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}
.ac-idea-sel{background:var(--s9);border:1px solid var(--s7);color:var(--silver);border-radius:11px;padding:11px;font-family:inherit;font-size:12.5px;outline:none;cursor:pointer}
.ac-idea-add input{flex:1;min-width:140px;background:var(--s9);border:1px solid var(--s7);color:var(--silver);border-radius:11px;padding:11px 13px;font-family:inherit;font-size:14px;outline:none}
.ac-idea-add input:focus{border-color:rgba(228,188,99,.55)}
.ac-idea-add>button{width:46px;border-radius:11px;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1a1400;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 14px rgba(228,188,99,.35)}
.ac-board{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:760px){.ac-board{grid-template-columns:repeat(3,1fr)}}
.ac-col{background:linear-gradient(160deg,rgba(14,12,28,.7),rgba(8,8,18,.7));border:1px solid var(--s7);border-radius:16px;padding:12px;min-height:120px}
.ac-col-head{display:flex;align-items:center;gap:7px;font-family:'Rubik';font-weight:800;font-size:13px;color:var(--gold);margin-bottom:11px}
.ac-col-head i{margin-right:auto;font-style:normal;background:var(--s8);border:1px solid var(--s7);color:var(--s4);border-radius:8px;padding:1px 8px;font-size:11px;font-weight:800}
.ac-col-body{display:flex;flex-direction:column;gap:9px}
.ac-col-empty{text-align:center;color:var(--s4);font-size:20px;opacity:.3;padding:10px}
.ac-idea{background:linear-gradient(160deg,rgba(20,18,38,.95),rgba(10,10,22,.95));border:1px solid var(--s7);border-right:3px solid var(--c);border-radius:12px;padding:11px;animation:acRise .25s ease both}
.ac-idea-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.ac-idea-by{display:flex;align-items:center;gap:4px;font-size:10.5px;font-weight:800;color:var(--c)}
.ac-idea-del{background:none;border:none;color:var(--s4);cursor:pointer;display:flex;padding:2px;opacity:.6}
.ac-idea-del:hover{color:#FF6B9D;opacity:1}
.ac-idea p{font-size:12.5px;line-height:1.5;color:var(--silver)}
.ac-idea-moves{display:flex;gap:6px;margin-top:9px}
.ac-idea-moves button{background:var(--s8);border:1px solid var(--s7);color:var(--s4);border-radius:8px;padding:5px 10px;font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;transition:.15s}
.ac-idea-moves button.fwd{margin-right:auto;color:var(--gold);border-color:rgba(228,188,99,.35)}
.ac-idea-moves button:hover{color:var(--silver)}
.ac-idea-issue{display:flex;align-items:center;gap:5px;font-size:10.5px;font-weight:700;color:var(--gold);text-decoration:none;margin-top:6px;opacity:.9}
.ac-idea-issue:hover{opacity:1;text-decoration:underline}

/* ── investments world (read-only market board) ── */
.ac-mk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-top:10px}
.ac-mk-row{display:flex;flex-direction:column;gap:3px;background:var(--s9);border:1px solid var(--s7);border-radius:11px;padding:9px 11px}
.ac-mk-name{font-size:11px;font-weight:700;color:var(--s3)}
.ac-mk-price{font-size:14px;font-weight:800;color:var(--silver)}
.ac-mk-chg{display:flex;align-items:center;gap:3px;font-size:11px;font-weight:700}
.ac-mk-chg.up{color:#3FD79A}
.ac-mk-chg.dn{color:#FF5C50}
.ac-mk-notes{margin-top:14px;border-top:1px solid var(--s8);padding-top:6px}

/* ── living office floor (Tamagotchi-style sim) ── */
.ofc-floor{flex:1;position:relative;overflow:hidden;margin:8px;border-radius:16px;border:1px solid rgba(110,170,240,.18);
  background:linear-gradient(rgba(255,255,255,.014) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.014) 1px,transparent 1px),radial-gradient(ellipse at 50% 28%,#1b2440,#0c1120 68%,#070a14);
  background-size:42px 42px,42px 42px,100% 100%;box-shadow:inset 0 0 90px rgba(0,0,0,.65)}
/* On wide screens the office floor (sized for a portrait/tablet aspect) would
   otherwise stretch edge-to-edge with huge empty gaps between desks — cap its
   width and center it so the room keeps its intended proportions. */
@media(min-width:900px){.ofc-floor{max-width:860px;width:100%;margin:8px auto;align-self:center}}
.ofc-windows{position:absolute;top:0;left:0;right:0;height:34px;display:flex;gap:9px;padding:0 14px;pointer-events:none}
.ofc-windows span{flex:1;border-radius:0 0 7px 7px;background:linear-gradient(180deg,rgba(150,200,255,.3),rgba(80,130,210,.06));border:1px solid rgba(150,200,255,.16);border-top:none;box-shadow:inset 0 -6px 14px rgba(150,200,255,.08)}
.ofc-furn{position:absolute;pointer-events:none}
.ofc-rug{left:66%;top:12%;width:32%;height:30%;border-radius:50%;background:radial-gradient(ellipse,rgba(228,188,99,.10),transparent 72%)}
.ofc-reception{right:3%;top:4%;width:96px;height:28px;border-radius:8px;background:linear-gradient(180deg,#3a2c14,#241a0a);color:#caa85e;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;border:1px solid rgba(228,188,99,.3)}
.ofc-meeting{left:70%;top:15%;width:100px;height:58px}
.ofc-mtable{position:absolute;inset:11px;border-radius:34px;background:linear-gradient(160deg,#2a3350,#19223a);border:1px solid rgba(150,200,255,.2)}
.ofc-meeting i{position:absolute;width:11px;height:11px;border-radius:4px;background:#33405e}
.ofc-meeting i.t{top:0;left:50%;transform:translateX(-50%)} .ofc-meeting i.b{bottom:0;left:50%;transform:translateX(-50%)}
.ofc-meeting i.l{left:0;top:50%;transform:translateY(-50%)} .ofc-meeting i.r{right:0;top:50%;transform:translateY(-50%)}
/* Desks are rendered data-driven (12 of them, one per agent) with inline
   left/top from OFC_DESKS, so position + occupied-glow can both be computed
   in JS. translate(-50%,-28%) puts the desk just in front of (below) the
   character's stand point, screen toward them — reads as "sitting at it"
   rather than the desk and character overlapping dead-center. */
.ofc-desk{width:58px;height:24px;border-radius:6px;background:linear-gradient(180deg,#2a3350,#1a2236);border:1px solid rgba(150,200,255,.15);transform:translate(-50%,-28%);transition:box-shadow .4s ease}
.ofc-desk .ofc-mon{position:absolute;top:-9px;left:50%;transform:translateX(-50%);width:20px;height:14px;border-radius:3px;background:#0b1426;border:1px solid rgba(110,170,240,.4);box-shadow:0 0 9px rgba(110,170,240,.35)}
.ofc-desk .ofc-kbd{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);width:22px;height:5px;border-radius:2px;background:#141b2e;border:1px solid rgba(150,200,255,.18)}
.ofc-desk .ofc-chairback{position:absolute;bottom:-9px;left:50%;transform:translateX(-50%);width:22px;height:9px;border-radius:4px 4px 0 0;background:#1c2338;border:1px solid rgba(150,200,255,.12)}
/* Occupied (someone actively working here) → monitor glows brighter and
   pulses gently, a small "someone is really at this desk" cue at a glance. */
.ofc-desk.occ{box-shadow:0 0 16px rgba(110,170,240,.22)}
.ofc-desk.occ .ofc-mon{animation:ofcDeskGlow 2.6s ease-in-out infinite}
@keyframes ofcDeskGlow{0%,100%{box-shadow:0 0 9px rgba(110,170,240,.35);background:#0b1426}50%{box-shadow:0 0 15px rgba(120,210,255,.65);background:#0e1d38}}
/* Dining room — bottom-right, two round tables with four chairs each. */
.ofc-dine-label{left:64%;top:47%;width:120px;height:22px;border-radius:8px;background:rgba(255,180,90,.1);color:#ffb95a;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,180,90,.28)}
.ofc-dine-table{width:64px;height:64px;transform:translate(-50%,-50%)}
.ofc-dtop{position:absolute;inset:14px;border-radius:50%;background:linear-gradient(160deg,#3a2c1c,#231909);border:1px solid rgba(255,180,90,.3);box-shadow:inset 0 0 12px rgba(0,0,0,.4)}
.ofc-dine-table i{position:absolute;width:10px;height:10px;border-radius:3px;background:#3a2c1c;border:1px solid rgba(255,180,90,.2)}
.ofc-dine-table i.t{top:-2px;left:50%;transform:translateX(-50%)} .ofc-dine-table i.b{bottom:-2px;left:50%;transform:translateX(-50%)}
.ofc-dine-table i.l{left:-2px;top:50%;transform:translateY(-50%)} .ofc-dine-table i.r{right:-2px;top:50%;transform:translateY(-50%)}
.ofc-plant{width:16px;height:22px;border-radius:5px 5px 2px 2px;background:linear-gradient(#2f9e6a,#176b45);box-shadow:0 3px 6px rgba(0,0,0,.3)}
.ofc-plant.p1{left:2%;top:16%} .ofc-plant.p2{left:38%;top:80%} .ofc-plant.p3{left:96%;top:46%}
.ofc-cooler{left:4%;top:54%;width:13px;height:28px;border-radius:4px;background:linear-gradient(#bfe3ff,#7fb0e0)}
.ofc-char{position:absolute;transform:translate(-50%,-50%);transition-property:left,top;transition-timing-function:linear;background:none;border:none;padding:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;width:58px}
.ofc-av{position:relative;display:flex;flex-direction:column;align-items:center}
.ofc-shadow{position:absolute;bottom:-3px;left:50%;transform:translateX(-50%);width:28px;height:7px;border-radius:50%;background:rgba(0,0,0,.45);filter:blur(2px)}
.ofc-head{width:30px;height:30px;border-radius:50%;overflow:hidden;border:2px solid rgba(255,255,255,.85);box-shadow:0 3px 10px rgba(0,0,0,.45);z-index:2}
.ofc-head img{width:100%;height:100%;object-fit:cover;display:block}
.ofc-body{width:32px;height:22px;border-radius:13px 13px 6px 6px;margin-top:-5px;box-shadow:0 3px 8px rgba(0,0,0,.3)}
.ofc-legs{display:flex;gap:6px;margin-top:-1px}
.ofc-legs i{width:6px;height:9px;border-radius:0 0 3px 3px;background:#2a3145;display:block}
.ofc-chair{display:none;width:24px;height:8px;border-radius:0 0 5px 5px;background:#1c2338;margin-top:-2px}
.ofc-char.walking .ofc-av{animation:ofcBob .5s ease-in-out infinite}
.ofc-char.walking .ofc-legs i:first-child{animation:ofcStep .5s ease-in-out infinite}
.ofc-char.walking .ofc-legs i:last-child{animation:ofcStep .5s ease-in-out infinite .25s}
@keyframes ofcBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
@keyframes ofcStep{0%,100%{transform:translateY(0) scaleY(1)}50%{transform:translateY(-3px) scaleY(.78)}}
/* Seated (working / in a meeting / eating) — legs tuck behind a chair seat
   instead of standing, and a "typing"/small motion cue plays while working
   so desks read as actually being used, not just occupied. */
.ofc-char.seated .ofc-legs{display:none}
.ofc-char.seated .ofc-chair{display:block}
.ofc-char.seated .ofc-body{border-radius:11px 11px 4px 4px}
.ofc-char.seated .ofc-shadow{width:20px}
.ofc-char.seated.at-work .ofc-av{animation:ofcType 1.1s ease-in-out infinite}
@keyframes ofcType{0%,100%{transform:translateY(0)}50%{transform:translateY(-1px)}}
.ofc-clock{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:800;color:#eaf1ff;background:rgba(255,255,255,.06);border:1px solid rgba(150,200,255,.2);padding:5px 11px;border-radius:20px;margin-right:auto;transition:.6s}
.ofc-tint{position:absolute;inset:0;pointer-events:none;z-index:1;transition:background 1.2s ease}
.ofc-floor{background:linear-gradient(rgba(255,255,255,.014) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.014) 1px,transparent 1px),radial-gradient(ellipse at 50% 28%,var(--sky,#1b2440),#0c1120 68%,#070a14)!important;transition:background 1.2s ease}
.ofc-status{position:absolute;top:-4px;right:6px;font-size:12px;z-index:4;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5));animation:offPop .3s ease both}
.ofc-char{touch-action:none}
.ofc-char.held{cursor:grabbing}
.ofc-char.held .ofc-av{transform:scale(1.12)!important;filter:drop-shadow(0 8px 14px rgba(0,0,0,.5))}
.ofc-char.focus .ofc-head{box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 80%,transparent),0 0 16px color-mix(in srgb,var(--c) 70%,transparent)}
.ofc-energy{display:block;width:30px;height:3px;border-radius:2px;background:rgba(255,255,255,.14);margin-top:2px;overflow:hidden}
.ofc-energy i{display:block;height:100%;border-radius:2px;transition:width .6s ease,background .6s ease}
.ofc-confetti{position:absolute;width:0;height:0;z-index:300;pointer-events:none}
.ofc-confetti i{position:absolute;width:6px;height:9px;border-radius:2px;left:0;top:0;animation:ofcConf 1.2s ease-out forwards;transform:rotate(var(--a))}
@keyframes ofcConf{0%{opacity:1;transform:rotate(var(--a)) translateY(0) scale(1)}100%{opacity:0;transform:rotate(var(--a)) translateY(-46px) scale(.4)}}
.ofc-name{margin-top:3px;font-size:9.5px;font-weight:800;color:#dce6ff;background:rgba(6,10,20,.6);padding:1px 7px;border-radius:8px;white-space:nowrap;box-shadow:0 0 0 1px color-mix(in srgb,var(--c) 45%,transparent)}
.ofc-char:hover .ofc-name{color:var(--c)}
.ofc-char:active{transform:translate(-50%,-50%) scale(.92)}
.ofc-bubble{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:5px;background:#fff;color:#1a2238;font-size:10.5px;font-weight:700;padding:5px 9px;border-radius:11px;white-space:nowrap;box-shadow:0 6px 16px rgba(0,0,0,.45);animation:offPop .3s ease both;z-index:5}
.ofc-bubble::after{content:'';position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#fff;border-bottom:0}
.ofc-bubble-to{color:#C75A12;font-weight:900;margin-left:3px}

/* ── business knowledge ── */
.ac-biz-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin-bottom:14px}
@media(min-width:560px){.ac-biz-grid{grid-template-columns:repeat(3,1fr)}}
.ac-biz-kpi{background:linear-gradient(160deg,rgba(18,16,36,.96),rgba(9,9,20,.97));border:1px solid var(--s7);border-radius:13px;padding:13px;text-align:right}
.ac-biz-kpi b{display:block;font-family:'Rubik';font-weight:900;font-size:20px;color:var(--gold)}
.ac-biz-kpi b.ok{color:#3FD79A} .ac-biz-kpi b.cy{color:#6FD3F0}
.ac-biz-kpi span{font-size:11.5px;color:var(--s4)}
.ac-biz-note{font-size:12px;color:var(--s4);background:rgba(110,170,240,.06);border:1px solid rgba(110,170,240,.2);border-radius:11px;padding:11px 13px;margin-bottom:14px;line-height:1.55}
.ac-biz-row{display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid var(--s8)}
.ac-biz-row:last-child{border-bottom:none}
.ac-biz-rank{width:20px;height:20px;flex-shrink:0;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1a1400;font-family:'Rubik';font-weight:900;font-size:11px;display:flex;align-items:center;justify-content:center}
.ac-biz-row b{flex:1;min-width:0;font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ac-biz-cnt{font-size:11px;color:var(--s4)}
.ac-biz-rev{font-family:'Rubik';font-weight:900;font-size:13px;color:#3FD79A}
.ac-biz-fact{display:flex;align-items:center;gap:8px;background:var(--s9);border:1px solid var(--s7);border-radius:10px;padding:9px 11px;margin-top:7px;font-size:12.5px;color:var(--silver)}
.ac-biz-fact svg{color:var(--gold);flex-shrink:0}
.ac-biz-fact span{flex:1;min-width:0;line-height:1.4}
.ac-biz-fact button{background:none;border:none;color:var(--s4);cursor:pointer;display:flex;padding:2px;opacity:.6}
.ac-biz-fact button:hover{color:#FF6B9D;opacity:1}
.ac-rev-chart{display:flex;align-items:flex-end;gap:8px;height:120px;padding-top:6px}
.ac-rev-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%}
.ac-rev-bar-wrap{flex:1;width:100%;display:flex;align-items:flex-end;justify-content:center}
.ac-rev-bar{width:60%;min-height:3px;border-radius:5px 5px 2px 2px;background:linear-gradient(180deg,var(--gold),var(--gold2));box-shadow:0 0 10px rgba(228,188,99,.25);transition:height .6s cubic-bezier(.34,1.56,.64,1)}
.ac-rev-val{font-size:9.5px;color:var(--gold);font-weight:800;white-space:nowrap}
.ac-rev-lbl{font-size:10.5px;color:var(--s4);font-weight:700}
.ac-opp-row{display:flex;align-items:flex-start;gap:9px;padding:9px 0;border-bottom:1px solid var(--s8)}
.ac-opp-row:last-child{border-bottom:none}
.ac-opp-orb{width:26px;height:26px;border-radius:9px;overflow:hidden;flex-shrink:0;box-shadow:0 2px 8px color-mix(in srgb,var(--c) 40%,transparent)}
.ac-opp-mid{flex:1;min-width:0}
.ac-opp-mid b{font-size:11.5px;font-weight:800;color:var(--c)}
.ac-opp-mid p{font-size:12.5px;line-height:1.5;color:var(--silver);margin-top:2px}

/* ── settings ── */
.ac-set-card{background:linear-gradient(160deg,rgba(16,14,32,.96),rgba(8,8,18,.97));border:1px solid var(--s7);border-radius:16px;padding:16px;margin-bottom:14px;box-shadow:0 6px 26px rgba(0,0,0,.4)}
.ac-set-h{display:flex;align-items:center;gap:9px;font-family:'Rubik';font-weight:800;font-size:15px;color:var(--gold);margin-bottom:10px}
.ac-cloud-pill{margin-right:auto;font-size:10.5px;font-weight:800;padding:3px 10px;border-radius:20px;border:1px solid var(--s7);color:var(--s4);background:var(--s9)}
.ac-cloud-pill.on{color:#3FD79A;border-color:rgba(63,215,154,.4);background:rgba(63,215,154,.08)}
.ac-set-note{font-size:12.5px;color:var(--s4);line-height:1.65;margin-bottom:12px}
.ac-set-in{width:100%;background:var(--s9);border:1px solid var(--s7);color:var(--silver);border-radius:11px;padding:12px 14px;font-family:ui-monospace,monospace;font-size:13px;outline:none;margin-bottom:10px}
.ac-set-in:focus{border-color:rgba(228,188,99,.55);box-shadow:0 0 0 3px rgba(228,188,99,.1)}
.ac-set-row{display:flex;gap:9px}
.ac-set-save{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1a1400;border:none;border-radius:11px;padding:12px;font-family:'Rubik';font-weight:900;font-size:14px;cursor:pointer;box-shadow:0 4px 16px rgba(228,188,99,.3)}
.ac-set-clear{width:46px;background:var(--s8);border:1px solid var(--s7);color:#FF6B9D;border-radius:11px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.ac-set-link{display:inline-flex;align-items:center;gap:5px;margin-top:12px;font-size:12.5px;color:var(--gold);text-decoration:none;font-weight:700}
.ac-set-list{list-style:none;display:flex;flex-direction:column;gap:9px}
.ac-set-list li{font-size:12.5px;color:var(--s4);line-height:1.5;padding-right:18px;position:relative}
.ac-set-list li::before{content:'›';position:absolute;right:0;color:var(--gold);font-weight:900}
.ac-set-list li b{color:var(--silver)}
.ac-set-foot{text-align:center;font-size:10.5px;color:var(--s4);letter-spacing:.12em;margin-top:18px;opacity:.6}

/* ── dev console ── */
.ac-spin{animation:acSpin .8s linear infinite}
@keyframes acSpin{to{transform:rotate(360deg)}}
.ac-dev-leo{display:flex;align-items:center;gap:11px;background:linear-gradient(160deg,rgba(20,14,8,.96),rgba(10,8,16,.97));border:1px solid color-mix(in srgb,var(--c) 35%,transparent);border-radius:14px;padding:12px;margin-bottom:12px;box-shadow:0 6px 24px rgba(0,0,0,.4)}
.ac-dev-orb{width:42px;height:42px;border-radius:12px;overflow:hidden;flex-shrink:0;box-shadow:0 4px 16px color-mix(in srgb,var(--c) 45%,transparent)}
.ac-dev-leo-txt{flex:1;min-width:0}
.ac-dev-leo-txt b{display:block;font-family:'Rubik';font-weight:900;font-size:14.5px}
.ac-dev-leo-txt span{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--s4);font-family:ui-monospace,monospace;margin-top:2px}
.ac-dev-ghchip{font-size:10.5px;font-weight:800;padding:5px 10px;border-radius:20px;border:1px solid var(--s7);color:var(--s4);display:flex;align-items:center;gap:5px;flex-shrink:0}
.ac-dev-ghchip.on{color:#3FD79A;border-color:rgba(63,215,154,.4);background:rgba(63,215,154,.08)}
.ac-repo-picker{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.ac-repo-chip{display:flex;align-items:center;gap:6px;background:var(--s9);border:1px solid var(--s7);color:var(--s4);border-radius:20px;padding:8px 13px;font-size:12px;font-weight:700;cursor:pointer;transition:.15s}
.ac-repo-chip.on{color:#1a1400;background:linear-gradient(135deg,var(--gold),var(--gold2));border-color:transparent;box-shadow:0 4px 14px rgba(228,188,99,.3)}
.ac-dev-in{width:100%;background:var(--s9);border:1px solid var(--s7);color:var(--silver);border-radius:13px;padding:13px 15px;font-family:inherit;font-size:14.5px;outline:none;resize:vertical;margin-bottom:10px}
.ac-dev-in:focus{border-color:rgba(255,140,66,.5);box-shadow:0 0 0 3px rgba(255,140,66,.1)}
.ac-dev-gen{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#FF8C42,#C75A12);color:#fff;border:none;border-radius:13px;padding:14px;font-family:'Rubik';font-weight:900;font-size:15px;cursor:pointer;box-shadow:0 6px 24px rgba(255,140,66,.3);margin-bottom:16px}
.ac-dev-gen:disabled{opacity:.5;cursor:not-allowed}
.ac-dev-exec{background:linear-gradient(160deg,rgba(10,20,16,.95),rgba(6,12,10,.96));border:1px solid rgba(63,215,154,.32);border-radius:15px;padding:13px;margin-bottom:16px;box-shadow:0 6px 24px rgba(0,40,25,.35)}
.ac-dev-exec-h{display:flex;align-items:center;gap:7px;font-family:'Rubik';font-weight:900;font-size:13.5px;color:#3FD79A;margin-bottom:10px}
.ac-dev-exec-h span{font-weight:400;font-size:11px;color:var(--s4);margin-right:auto}
.ac-dev-path{width:100%;background:var(--s9);border:1px solid var(--s7);color:var(--silver);border-radius:11px;padding:11px 13px;font-family:ui-monospace,monospace;font-size:13px;outline:none;margin-bottom:9px;direction:ltr;text-align:left}
.ac-dev-path:focus{border-color:rgba(63,215,154,.5);box-shadow:0 0 0 3px rgba(63,215,154,.1)}
.ac-dev-execbtn{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#3FD79A,#1f9d6a);color:#04140d;border:none;border-radius:12px;padding:13px;font-family:'Rubik';font-weight:900;font-size:14.5px;cursor:pointer;box-shadow:0 6px 22px rgba(63,215,154,.3)}
.ac-dev-execbtn:disabled{opacity:.5;cursor:not-allowed}
.ac-dev-exec-note{font-size:11px;color:var(--s4);margin-top:9px;line-height:1.5}
.ac-dev-brief{background:linear-gradient(160deg,rgba(16,14,32,.97),rgba(8,8,18,.98));border:1px solid rgba(255,140,66,.3);border-radius:15px;overflow:hidden;margin-bottom:8px;box-shadow:0 8px 30px rgba(0,0,0,.45)}
.ac-dev-brief-h{display:flex;align-items:center;gap:8px;padding:12px 14px;font-family:'Rubik';font-weight:800;font-size:13px;color:#FF9D5C;border-bottom:1px solid rgba(255,140,66,.2);background:rgba(255,140,66,.06)}
.ac-dev-brief-body{padding:14px;font-family:'Heebo',sans-serif;font-size:13px;line-height:1.7;color:var(--silver);white-space:pre-wrap;word-break:break-word;margin:0;max-height:340px;overflow-y:auto;direction:rtl}
.ac-dev-acts{display:flex;gap:8px;padding:12px 14px;border-top:1px solid var(--s7);flex-wrap:wrap}
.ac-dev-act{flex:1;min-width:120px;display:flex;align-items:center;justify-content:center;gap:6px;background:var(--s8);border:1px solid var(--s7);color:var(--silver);border-radius:10px;padding:10px;font-family:inherit;font-size:12.5px;font-weight:800;cursor:pointer;transition:.15s}
.ac-dev-act:hover{border-color:rgba(255,140,66,.5);color:#FF9D5C}
.ac-dev-act:disabled{opacity:.4;cursor:not-allowed}
.ac-dev-act.primary{background:linear-gradient(135deg,#FF8C42,#C75A12);color:#fff;border:none}
.ac-dev-task{background:linear-gradient(160deg,rgba(16,14,30,.95),rgba(9,9,20,.96));border:1px solid var(--s7);border-right:3px solid var(--c);border-radius:12px;padding:12px;margin-bottom:9px;animation:acRise .25s ease both}
.ac-dev-task-top{display:flex;align-items:center;gap:9px}
.ac-dev-task-top b{flex:1;min-width:0;font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ac-dev-task-st{font-size:10px;font-weight:800;padding:3px 9px;border-radius:20px;border:1px solid;flex-shrink:0}
.ac-dev-task-del{background:none;border:none;color:var(--s4);cursor:pointer;display:flex;padding:2px;opacity:.6;flex-shrink:0}
.ac-dev-task-del:hover{color:#FF6B9D;opacity:1}
.ac-dev-task-acts{display:flex;gap:7px;margin-top:10px;flex-wrap:wrap}
.ac-dev-mini{display:flex;align-items:center;gap:4px;background:var(--s8);border:1px solid var(--s7);color:var(--s4);border-radius:8px;padding:6px 11px;font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;text-decoration:none;transition:.15s}
.ac-dev-mini:hover{color:var(--silver)}
.ac-dev-mini.ok{color:#3FD79A;border-color:rgba(63,215,154,.35)}

/* ── empty ── */
.ac-empty{text-align:center;padding:50px 16px;color:var(--s4)}
.ac-empty svg{opacity:.4;margin-bottom:12px}
.ac-empty div{font-family:'Rubik';font-weight:800;font-size:16px;color:var(--silver)}
.ac-empty p{font-size:12.5px;margin-top:5px}

/* ── office launch card ── */
.ac-office-card{position:relative;overflow:hidden;display:flex;align-items:center;gap:13px;width:100%;text-align:right;cursor:pointer;font-family:inherit;color:#fff;
  background:linear-gradient(120deg,#13213a,#1c2f52 55%,#26407a);border:1px solid rgba(110,170,240,.4);border-radius:18px;padding:15px 14px;margin-bottom:18px;
  box-shadow:0 8px 30px rgba(20,40,90,.5),0 0 0 1px rgba(110,170,240,.1);transition:transform .2s,box-shadow .25s}
.ac-office-card:hover{transform:translateY(-3px);box-shadow:0 14px 44px rgba(40,64,122,.55)}
.ac-office-glow{position:absolute;inset:0;background:radial-gradient(circle at 85% 20%,rgba(110,170,240,.35),transparent 55%);pointer-events:none}
.ac-office-mini{display:flex;flex-shrink:0;position:relative}
.ac-office-mini-orb{width:34px;height:34px;border-radius:10px;overflow:hidden;border:2px solid #16213a;margin-left:-12px;box-shadow:0 0 10px color-mix(in srgb,var(--c) 50%,transparent)}
.ac-office-mini-orb:first-child{margin-left:0}
.ac-office-mini-orb img{width:100%;height:100%;object-fit:cover;display:block}
.ac-office-txt{flex:1;position:relative}
.ac-office-txt b{display:block;font-family:'Rubik';font-weight:900;font-size:15.5px}
.ac-office-txt span{display:block;font-size:11.5px;color:#bcd3f5;margin-top:3px}

/* ── office simulator ── */
.off-overlay{position:fixed;inset:0;z-index:250;display:flex;flex-direction:column;
  background:radial-gradient(ellipse at 50% 0%,#0e1426,#060912 60%,#04040c);animation:acRise .25s ease both}
.off-top{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid rgba(110,170,240,.18);background:rgba(6,9,18,.7);backdrop-filter:blur(14px)}
.off-top-l{display:flex;align-items:center;gap:10px}
.off-top-l b{font-family:'Rubik';font-weight:900;font-size:17px;color:#eaf1ff}
.off-live{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:800;color:#3FD79A;background:rgba(63,215,154,.1);border:1px solid rgba(63,215,154,.3);padding:4px 9px;border-radius:20px}
.off-close{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}
.off-sub{text-align:center;font-size:11.5px;color:#7e90b8;padding:8px 16px 4px}
.off-summon-btn{display:flex;align-items:center;gap:6px;background:rgba(228,188,99,.1);border:1px solid rgba(228,188,99,.35);color:var(--gold);border-radius:20px;padding:8px 14px;font-family:inherit;font-size:12px;font-weight:800;cursor:pointer;margin-right:10px;white-space:nowrap}
.off-summon-btn:hover{background:rgba(228,188,99,.18)}
.off-summon-panel{position:absolute;top:64px;left:16px;z-index:60;width:min(340px,86vw);max-height:60vh;overflow-y:auto;background:rgba(8,11,22,.94);backdrop-filter:blur(16px);border:1px solid rgba(110,170,240,.22);border-radius:16px;box-shadow:0 18px 44px rgba(0,0,0,.55);animation:acRise .2s ease both}
.off-summon-head{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:800;color:#eaf1ff;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
.off-summon-head button{margin-right:auto;background:none;border:none;color:#7e90b8;cursor:pointer;display:flex}
.off-summon-list{padding:6px}
.off-summon-row{display:flex;align-items:center;gap:9px;padding:8px}
.off-summon-orb{width:28px;height:28px;border-radius:9px;overflow:hidden;flex-shrink:0;box-shadow:0 2px 8px color-mix(in srgb,var(--c) 40%,transparent)}
.off-summon-mid{flex:1;min-width:0;display:flex;flex-direction:column}
.off-summon-mid b{font-size:12px;font-weight:800;color:#eaf1ff}
.off-summon-mid span{font-size:10.5px;color:#7e90b8}
.off-summon-cta{display:flex;gap:4px}
.off-summon-cta button{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);color:#cfd8e6;border-radius:8px;padding:5px 8px;font-family:inherit;font-size:10.5px;font-weight:700;cursor:pointer}
.off-summon-cta button:first-child{color:var(--gold);border-color:rgba(228,188,99,.35)}
.off-summon-cta button:hover{color:#fff}
.off-summon-status{font-size:10.5px;font-weight:700;color:#7e90b8;white-space:nowrap}
.off-summon-status.ok{color:#3FD79A}
.off-summon-status.late{color:#FF9A5C}

/* ── 3D office (walk-around, WASD/joystick) ── */
.off3{background:#05070f}
.off3-wrap{flex:1;position:relative;overflow:hidden}
.off3-canvas{position:absolute;inset:0;touch-action:none}
.off3-canvas canvas{display:block;width:100%!important;height:100%!important}
.off3-hint{position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:2;
  background:rgba(6,9,18,.72);border:1px solid rgba(110,170,240,.25);border-radius:20px;
  padding:6px 14px;font-size:11.5px;color:#aebde0;backdrop-filter:blur(8px);white-space:nowrap;pointer-events:none}
/* Talk bar (mic + text-chat) shown when standing next to an agent. */
.off3-talkbar{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);z-index:3;
  display:flex;align-items:center;gap:10px;animation:acRise .2s ease both}
.off3-talk{display:flex;align-items:center;gap:8px;background:linear-gradient(135deg,var(--c),color-mix(in srgb,var(--c) 60%,#000));
  color:#fff;border:none;border-radius:30px;padding:12px 20px;font-family:'Rubik';font-weight:900;font-size:14px;
  cursor:pointer;box-shadow:0 8px 26px color-mix(in srgb,var(--c) 50%,transparent)}
.off3-mic{flex-shrink:0;width:54px;height:54px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,var(--c),color-mix(in srgb,var(--c) 55%,#000));color:#fff;
  box-shadow:0 8px 26px color-mix(in srgb,var(--c) 55%,transparent);transition:.15s}
.off3-mic:active{transform:scale(.92)}
.off3-mic.listening{animation:off3MicPulse 1s ease-in-out infinite}
.off3-mic.thinking{opacity:.7}
.off3-mic.speaking{box-shadow:0 0 0 4px color-mix(in srgb,var(--c) 40%,transparent),0 8px 26px color-mix(in srgb,var(--c) 55%,transparent)}
@keyframes off3MicPulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--c) 55%,transparent)}50%{box-shadow:0 0 0 14px transparent}}
.off3-mute{flex-shrink:0;width:44px;height:44px;border-radius:50%;border:1px solid color-mix(in srgb,var(--c) 50%,transparent);cursor:pointer;
  display:flex;align-items:center;justify-content:center;background:rgba(6,9,18,.75);color:var(--c);animation:acRise .15s ease both}
.off3-mute:active{transform:scale(.92)}
/* Live conversation subtitle above the talk bar — sticky, stays until the
   user taps the X (used to auto-clear the moment you stepped away). */
.off3-subtitle{position:absolute;left:50%;bottom:92px;transform:translateX(-50%);z-index:3;max-width:min(560px,86vw);
  display:flex;flex-direction:column;gap:2px;text-align:center;background:rgba(6,9,18,.82);border:1px solid rgba(255,255,255,.12);
  border-radius:16px;padding:10px 34px 10px 18px;backdrop-filter:blur(10px);animation:acRise .18s ease both}
.off3-subtitle b{font-family:'Rubik';font-weight:900;font-size:13px}
.off3-subtitle span{font-size:14.5px;color:#eaf1ff;line-height:1.45}
.off3-subtitle-x{position:absolute;top:8px;left:8px;background:rgba(255,255,255,.08);border:none;border-radius:50%;
  width:22px;height:22px;display:flex;align-items:center;justify-content:center;color:#aebde0;cursor:pointer}
.off3-subtitle-x:hover{color:#fff;background:rgba(255,255,255,.16)}
/* Floating joystick — appears centred on wherever you first touch/click. */
.off3-joy.floating{position:absolute;z-index:4;width:128px;height:128px;margin:-64px 0 0 -64px;border-radius:50%;
  background:radial-gradient(circle,rgba(255,255,255,.1),rgba(255,255,255,.03));
  border:2px solid rgba(228,188,99,.5);box-shadow:0 0 0 6px rgba(0,0,0,.15),0 8px 26px rgba(0,0,0,.4);
  pointer-events:none;touch-action:none;backdrop-filter:blur(2px)}
.off3-joy-knob{position:absolute;left:50%;top:50%;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;
  background:linear-gradient(135deg,var(--gold),var(--gold2));box-shadow:0 4px 16px rgba(228,188,99,.55),inset 0 2px 4px rgba(255,255,255,.4);pointer-events:none}
.off3-view-toggle{position:absolute;top:10px;right:10px;z-index:3;width:38px;height:38px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;background:rgba(6,9,18,.72);border:1px solid rgba(110,170,240,.3);
  color:#eaf1ff;cursor:pointer;backdrop-filter:blur(8px)}
.off3-view-toggle:hover{border-color:var(--gold);color:var(--gold)}
.off3-settings-toggle{position:absolute;top:10px;right:56px;z-index:3;width:38px;height:38px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;background:rgba(6,9,18,.72);border:1px solid rgba(110,170,240,.3);
  color:#eaf1ff;cursor:pointer;backdrop-filter:blur(8px)}
.off3-settings-toggle:hover{border-color:var(--gold);color:var(--gold)}
.off3-sit{position:absolute;top:10px;right:102px;z-index:3;height:38px;padding:0 16px;border-radius:19px;
  display:flex;align-items:center;justify-content:center;gap:6px;background:rgba(6,9,18,.72);
  border:1px solid rgba(228,188,99,.45);color:var(--gold);font-weight:700;font-size:.82rem;
  cursor:pointer;backdrop-filter:blur(8px);white-space:nowrap}
.off3-sit:hover{border-color:var(--gold);box-shadow:0 0 14px rgba(228,188,99,.35)}
.off3-sit.on{background:linear-gradient(135deg,rgba(228,188,99,.28),rgba(228,188,99,.12));color:#ffe9b0}
.off3-turbo{position:absolute;top:56px;right:10px;z-index:3;height:34px;padding:0 13px;border-radius:17px;
  display:flex;align-items:center;justify-content:center;gap:6px;background:rgba(6,9,18,.72);
  border:1px solid rgba(110,170,240,.3);color:#eaf1ff;font-weight:800;font-size:.75rem;
  cursor:pointer;backdrop-filter:blur(8px);white-space:nowrap;font-family:inherit}
.off3-turbo:hover{border-color:#3FD79A;color:#b8ffd9}
.off3-turbo.on{background:linear-gradient(135deg,rgba(63,215,154,.3),rgba(63,215,154,.1));
  border-color:#3FD79A;color:#b8ffd9;box-shadow:0 0 14px rgba(63,215,154,.35)}
.off3-settings{position:absolute;top:56px;right:10px;z-index:60;width:min(300px,86vw);background:rgba(8,11,22,.94);
  backdrop-filter:blur(16px);border:1px solid rgba(110,170,240,.22);border-radius:16px;box-shadow:0 18px 44px rgba(0,0,0,.55);
  animation:acRise .2s ease both}
.off3-settings-head{display:flex;align-items:center;font-size:12.5px;font-weight:800;color:#eaf1ff;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
.off3-settings-head button{margin-right:auto;background:none;border:none;color:#7e90b8;cursor:pointer;display:flex}
.off3-settings-row{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;background:none;border:none;
  border-bottom:1px solid rgba(255,255,255,.06);color:#cfd8e6;padding:11px 14px;font-family:inherit;font-size:12px;cursor:pointer;text-align:right}
.off3-settings-row:hover{background:rgba(255,255,255,.04)}
.off3-settings-row span{display:flex;align-items:center;gap:7px}
.off3-settings-row b{font-size:11px;font-weight:800;color:#7e90b8}
.off3-settings-row b.on{color:#3FD79A}
.off3-settings-select{flex-wrap:wrap}
.off3-settings-select select{max-width:130px;background:var(--s9);border:1px solid var(--s7);color:var(--silver);border-radius:8px;
  padding:5px 7px;font-family:inherit;font-size:10.5px;outline:none;cursor:pointer}
.off3-settings-note{font-size:10.5px;line-height:1.6;color:#7e90b8;padding:10px 14px 14px}
/* Branded loading overlay while the office models download. */
.off3-loader{position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;
  background:radial-gradient(ellipse at 50% 30%,#101830,#060912 70%);animation:acRise .2s ease both}
.off3-loader-logo{font-size:44px;animation:off3LoaderFloat 2.2s ease-in-out infinite}
.off3-loader b{font-family:'Rubik';font-weight:900;font-size:16px;color:#eaf1ff}
.off3-loader-bar{width:min(260px,60vw);height:8px;border-radius:6px;background:rgba(255,255,255,.08);overflow:hidden;border:1px solid rgba(110,170,240,.25)}
.off3-loader-bar i{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,var(--gold),#7fd7ff);transition:width .25s ease;box-shadow:0 0 14px rgba(228,188,99,.5)}
.off3-loader span{font-size:12px;font-weight:700;color:#7e90b8}
@keyframes off3LoaderFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.off-floor{flex:1;overflow-y:auto;display:grid;grid-template-columns:repeat(2,1fr);gap:12px;padding:14px 14px 28px;align-content:start}
@media(min-width:680px){.off-floor{grid-template-columns:repeat(3,1fr)}}
@media(min-width:1000px){.off-floor{grid-template-columns:repeat(4,1fr)}}
.off-room{position:relative;height:200px;border-radius:16px;overflow:hidden;cursor:pointer;font-family:inherit;text-align:center;
  background:linear-gradient(180deg,color-mix(in srgb,var(--c) 22%,#0c1020) 0%,#0a0e1c 55%,#070a14 100%);
  border:1px solid color-mix(in srgb,var(--c) 35%,transparent);
  box-shadow:0 8px 28px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.05);transition:transform .15s,box-shadow .2s,border-color .2s}
.off-room:hover{transform:translateY(-3px);border-color:color-mix(in srgb,var(--c) 70%,transparent);box-shadow:0 14px 40px color-mix(in srgb,var(--c) 25%,transparent)}
.off-room.pinged{animation:offPing 1s ease}
@keyframes offPing{0%,100%{box-shadow:0 8px 28px rgba(0,0,0,.5)}50%{box-shadow:0 0 0 3px var(--c),0 8px 34px color-mix(in srgb,var(--c) 40%,transparent)}}
.off-room-glow{position:absolute;top:-20px;right:-20px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--c) 28%,transparent),transparent 70%);pointer-events:none}
.off-window{position:absolute;top:14px;left:14px;width:46px;height:34px;border-radius:6px;background:linear-gradient(160deg,rgba(150,200,255,.25),rgba(80,130,210,.12));border:2px solid color-mix(in srgb,var(--c) 30%,#1a2238);box-shadow:inset 0 0 12px rgba(150,200,255,.15)}
.off-frame{position:absolute;top:16px;right:16px;width:26px;height:20px;border-radius:3px;border:2px solid rgba(255,255,255,.12);background:linear-gradient(135deg,color-mix(in srgb,var(--c) 40%,transparent),rgba(255,255,255,.05))}
.off-plant{position:absolute;bottom:12px;right:12px;display:flex;align-items:flex-end;gap:2px;height:26px}
.off-plant span{width:5px;border-radius:3px 3px 0 0;background:linear-gradient(#3FD79A,#1f8a5a);transform-origin:bottom;animation:offSway 3.5s ease-in-out infinite}
.off-plant span:nth-child(1){height:16px;animation-delay:0s}
.off-plant span:nth-child(2){height:24px;animation-delay:.4s}
.off-plant span:nth-child(3){height:18px;animation-delay:.8s}
@keyframes offSway{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
.off-char{position:absolute;left:50%;bottom:54px;transform:translateX(-50%);width:64px;z-index:2;animation:offBob 3.4s ease-in-out infinite}
@keyframes offBob{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-4px)}}
.off-head{width:40px;height:40px;border-radius:50%;overflow:hidden;margin:0 auto;border:2px solid rgba(255,255,255,.85);box-shadow:0 4px 14px rgba(0,0,0,.4);position:relative;z-index:2}
.off-head img{width:100%;height:100%;object-fit:cover;display:block}
.off-body{width:58px;height:34px;border-radius:18px 18px 8px 8px;margin:-6px auto 0;position:relative;box-shadow:0 4px 12px rgba(0,0,0,.35)}
.off-arm{position:absolute;top:8px;width:9px;height:20px;border-radius:6px;background:inherit;filter:brightness(.9)}
.off-arm.l{left:-4px;transform-origin:top;animation:offType 1.1s ease-in-out infinite}
.off-arm.r{right:-4px;transform-origin:top;animation:offType 1.1s ease-in-out infinite .55s}
@keyframes offType{0%,100%{transform:rotate(6deg)}50%{transform:rotate(-8deg)}}
.off-desk{position:absolute;left:0;right:0;bottom:30px;height:30px;background:linear-gradient(180deg,#2a3350,#1a2138);border-top:2px solid color-mix(in srgb,var(--c) 35%,#3a4566);z-index:3;box-shadow:0 -2px 10px rgba(0,0,0,.3)}
.off-monitor{position:absolute;left:14px;bottom:14px;width:30px;height:22px;border-radius:4px;background:#0a0e1a;border:2px solid #313b58;z-index:4}
.off-screen{position:absolute;inset:2px;border-radius:2px;background:linear-gradient(160deg,#0d1a2e,#0a1420);overflow:hidden;display:flex;flex-direction:column;justify-content:center;gap:2px;padding:0 3px}
.off-screen i{height:2px;border-radius:1px;background:color-mix(in srgb,var(--c) 80%,#6fd3f0);display:block;animation:offCode 1.6s ease-in-out infinite}
.off-screen i:nth-child(1){width:70%;animation-delay:0s}
.off-screen i:nth-child(2){width:45%;animation-delay:.3s}
.off-screen i:nth-child(3){width:60%;animation-delay:.6s}
@keyframes offCode{0%,100%{opacity:.3}50%{opacity:1}}
.off-mug{position:absolute;right:16px;bottom:14px;width:8px;height:9px;border-radius:0 0 3px 3px;background:#d8d8e8;z-index:4}
.off-mug::after{content:'';position:absolute;top:-3px;left:1px;right:1px;height:3px;border-radius:50%;background:#6b4a2e}
.off-plate{position:absolute;left:0;right:0;bottom:0;padding:6px;background:linear-gradient(180deg,transparent,rgba(4,6,14,.85));z-index:5}
.off-plate b{display:block;font-family:'Rubik';font-weight:900;font-size:13px;color:#eaf1ff}
.off-plate span{font-size:9.5px;color:color-mix(in srgb,var(--c) 60%,#9fb0d8)}
.off-bubble{position:absolute;top:8px;left:50%;transform:translateX(-50%);z-index:6;max-width:90%;
  background:#fff;color:#1a2238;font-size:11px;font-weight:700;padding:6px 10px;border-radius:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  box-shadow:0 6px 18px rgba(0,0,0,.4);animation:offPop .3s ease both}
.off-bubble::after{content:'';position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);border:6px solid transparent;border-top-color:#fff;border-bottom:0}
.off-bubble-to{color:#C75A12;font-weight:900;margin-left:4px}
@keyframes offPop{from{opacity:0;transform:translateX(-50%) scale(.7) translateY(6px)}to{opacity:1;transform:translateX(-50%) scale(1) translateY(0)}}

/* ── toast ── */
.ac-toast{position:fixed;bottom:92px;left:50%;transform:translateX(-50%);z-index:300;
  background:linear-gradient(135deg,rgba(14,12,28,.98),rgba(6,6,14,.98));border:1px solid var(--gold);color:var(--gold);
  padding:12px 20px;border-radius:13px;font-size:13.5px;font-weight:800;box-shadow:0 8px 40px rgba(228,188,99,.3);
  backdrop-filter:blur(14px);animation:acRise .25s ease both;max-width:90vw;text-align:center}
`}</style>;
}
