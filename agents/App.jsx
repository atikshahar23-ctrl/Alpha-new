import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Crown, TrendingUp, Wrench, Megaphone, Code2, Cpu, BarChart3, HeartHandshake,
  Send, X, Sparkles, Activity, Lightbulb, LayoutGrid, Settings as SettingsIcon,
  Copy, Check, Circle, Zap, ChevronLeft, MessageSquare, Plus, Trash2, RefreshCw,
  ArrowUpRight, Bot, Radio, Brain, Rocket, ShieldCheck, ClipboardList,
  GitBranch, Terminal, FileCode2, Coins, Package, Scale, Compass,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════════
   ALPHA · AGENTS COMMAND CENTER
   A visual control room for a full team of Claude-style AI agents.
   Each agent owns a domain across the owner's systems (HeavyGuard, the
   Itai CRM, marketing, dev, automations). A CEO agent orchestrates them.
   Free brain: shared Groq key (localStorage "alpha_groq"); rich scripted
   personas when no key is present, so the room is always live.
   ════════════════════════════════════════════════════════════════════ */

/* ── Storage ── */
const K_HIST = "alpha:agents:hist";     // { [agentId]: [{from,text,ts}] }
const K_IDEAS = "alpha:agents:ideas";   // [{id, agentId, text, status, ts}]
const K_ACT = "alpha:agents:activity";  // [{id, agentId, text, ts}]
const K_GH = "alpha:agents:gh";         // { token, owner, repo } — token stays local-only
const K_DEVTASKS = "alpha:agents:devtasks"; // [{id, title, brief, status, issueUrl, ts}]
const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const now = () => Date.now();
const timeAgo = (ts) => {
  const s = Math.floor((now() - ts) / 1000);
  if (s < 60) return "עכשיו";
  if (s < 3600) return Math.floor(s / 60) + " דק'";
  if (s < 86400) return Math.floor(s / 3600) + " שע'";
  return Math.floor(s / 86400) + " ימים";
};

/* ── Free AI brain (shared Groq key with the rest of Alpha) ── */
const groqKey = () => { try { return localStorage.getItem("alpha_groq") || ""; } catch { return ""; } };
const hasAI = () => !!groqKey();
const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it", "llama3-70b-8192"];
async function askGroq(system, history, user) {
  const key = groqKey(); if (!key) throw new Error("NO_KEY");
  const messages = [{ role: "system", content: system }, ...history.slice(-6), { role: "user", content: user }];
  let lastCode = 0;
  for (const model of GROQ_MODELS) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages, temperature: 0.75, max_tokens: 800 }),
    });
    if (res.ok) { const d = await res.json(); return d.choices?.[0]?.message?.content?.trim() || ""; }
    lastCode = res.status;
    if (res.status === 401 || res.status === 403) break;
  }
  throw new Error("Groq " + lastCode);
}

/* ── The actual codebase the dev agent works on ── */
const REPO_DEFAULT = { owner: "atikshahar23-ctrl", repo: "alpha-new" };
const REPO_CONTEXT = `המאגר: atikshahar23-ctrl/alpha-new (Vite + React + TypeScript, RTL עברית, פריסה ב-GitHub Pages תחת base /Alpha-new/).
האפליקציות במאגר:
- index.html + src/ui/app.ts + src/style.css — אפליקציית Alpha הראשית (three.js, אורב תלת-ממד, HUD, dock).
- agent.html + agent/App.jsx — ה-CRM של איתי (לידים, עסקאות, showroom, טופס סמסוניקס).
- heavyguard.html + heavyguard/App.jsx — מערכת HeavyGuard OS.
- agents.html + agents/App.jsx — מרכז הסוכנים (האפליקציה הזו).
עיצוב: זכוכית כהה + זהב, אנימציות, CSS inline ב-StyleTag או ב-src/style.css.
בנייה: npm run build. אסור לשמור פרטי אשראי/CVV.`;

/* ── GitHub bridge (optional) — token stays in localStorage, never committed ── */
const ghCfg = () => { const c = load(K_GH, {}); return { token: c.token || "", owner: c.owner || REPO_DEFAULT.owner, repo: c.repo || REPO_DEFAULT.repo }; };
const ghConfigured = () => !!ghCfg().token;
async function ghCreateIssue(title, body) {
  const c = ghCfg(); if (!c.token) throw new Error("NO_TOKEN");
  const res = await fetch(`https://api.github.com/repos/${c.owner}/${c.repo}/issues`, {
    method: "POST",
    headers: { Authorization: `Bearer ${c.token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
    body: JSON.stringify({ title, body }),
  });
  if (!res.ok) throw new Error("GH " + res.status);
  return res.json();
}

/* ── Free execution engine: דן writes real code & opens a PR via the GitHub
   API (free PAT + free Groq). Always targets a NEW branch + PR, never main. ── */
const GH_API = "https://api.github.com";
async function ghReq(path, opts = {}) {
  const c = ghCfg(); if (!c.token) throw new Error("NO_TOKEN");
  const res = await fetch(GH_API + path, { ...opts, headers: { Authorization: `Bearer ${c.token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json", ...(opts.headers || {}) } });
  if (!res.ok) { let t = ""; try { t = await res.text(); } catch {} throw new Error("GH " + res.status + (t ? ": " + t.slice(0, 100) : "")); }
  return res.status === 204 ? null : res.json();
}
const ghPath = (c, p) => `/repos/${c.owner}/${c.repo}/contents/${p.split("/").map(encodeURIComponent).join("/")}`;
const b64enc = (s) => btoa(unescape(encodeURIComponent(s)));
const b64dec = (s) => { try { return decodeURIComponent(escape(atob((s || "").replace(/\n/g, "")))); } catch { return atob((s || "").replace(/\n/g, "")); } };
async function ghGetFile(p, ref) { const c = ghCfg(); try { const r = await ghReq(ghPath(c, p) + `?ref=${encodeURIComponent(ref)}`); return { content: b64dec(r.content), sha: r.sha }; } catch (e) { if (String(e.message).includes("404")) return null; throw e; } }
async function ghDefaultBranch() { const c = ghCfg(); const r = await ghReq(`/repos/${c.owner}/${c.repo}`); return r.default_branch || "main"; }
async function ghCreateBranch(base, name) { const c = ghCfg(); const ref = await ghReq(`/repos/${c.owner}/${c.repo}/git/ref/heads/${base}`); try { await ghReq(`/repos/${c.owner}/${c.repo}/git/refs`, { method: "POST", body: JSON.stringify({ ref: `refs/heads/${name}`, sha: ref.object.sha }) }); } catch (e) { if (!String(e.message).includes("422")) throw e; } }
async function ghPutFile(p, content, message, branch, sha) { const c = ghCfg(); return ghReq(ghPath(c, p), { method: "PUT", body: JSON.stringify({ message, content: b64enc(content), branch, ...(sha ? { sha } : {}) }) }); }
async function ghOpenPR(base, head, title, body) { const c = ghCfg(); return ghReq(`/repos/${c.owner}/${c.repo}/pulls`, { method: "POST", body: JSON.stringify({ title, head, base, body }) }); }
async function devExecute({ filePath, instruction, title }) {
  if (!ghConfigured()) throw new Error("חבר טוקן GitHub בהגדרות");
  if (!hasAI()) throw new Error("צריך מפתח Groq (חינם) בהגדרות");
  const base = await ghDefaultBranch();
  const existing = await ghGetFile(filePath, base);
  const sys = `אתה דן, מפתח. עליך להחזיר אך ורק את התוכן המלא והחדש של הקובץ "${filePath}" לאחר ביצוע השינוי. בלי הסברים, בלי טקסט נוסף, בלי גדרות קוד.`;
  const userMsg = existing
    ? `תוכן נוכחי של ${filePath}:\n\n${existing.content}\n\n---\nבצע: ${instruction}\nהחזר את הקובץ המלא המעודכן.`
    : `צור קובץ חדש ${filePath} עבור: ${instruction}\nהחזר את תוכן הקובץ המלא בלבד.`;
  let code = await askGroq(sys, [], userMsg);
  code = code.replace(/^```[a-zA-Z0-9]*\n?/, "").replace(/\n?```\s*$/, "").trim() + "\n";
  const slug = (filePath.split("/").pop() || "file").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  const branch = `agents/${slug}-${Date.now().toString(36).slice(-5)}`;
  await ghCreateBranch(base, branch);
  await ghPutFile(filePath, code, `דן: ${title}`, branch, existing && existing.sha);
  return ghOpenPR(base, branch, `דן: ${title}`, `${instruction}\n\n_בוצע אוטומטית ע"י מרכז הסוכנים (דן) · נפתח כ-PR לבדיקה לפני מיזוג._`);
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
(חבר מפתח Groq בהגדרות כדי שדן ינסח בריף חכם ומלא.)`;
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
    persona: "אתה יהודה — המנכ\"ל המנהיג של מרכז הסוכנים של אלפא, ראש שנים-עשר השבטים. אתה מנהל צוות של סוכני AI, כל אחד שבט שאחראי על תחום (מכירות, תפעול HeavyGuard, שיווק, פיתוח, אוטומציות, נתונים, הצלחת לקוח, כספים, רכש, משפטי, אסטרטגיה). תפקידך: לתעדף, להאציל משימות לשבט הנכון, לתת תמונת מצב ניהולית, ולחבר בין התחומים לאסטרטגיה אחת. כשמבקשים ממך משימה — פרק אותה לתת-משימות והמלץ איזה שבט יבצע כל אחת. דבר עברית, קצר, חד, מנהיגותי ובוטח. כשרלוונטי תן צעד פעולה אחד ברור.",
    quick: ["תן לי תמונת מצב יומית", "מה הכי דחוף עכשיו?", "חלק משימות לצוות", "תוכנית צמיחה לשבוע"],
  },
  {
    id: "sales", name: "זבולון", title: "מנהל מכירות", Icon: TrendingUp, color: "#3FD79A", accent: "#9BF3CE",
    tagline: "אחראי על ה-CRM של איתי, לידים ועסקאות",
    domain: "מכירות · לידים · סגירות",
    persona: "אתה זבולון — שבט המסחר, מנהל המכירות של הצוות, אחראי על מערכת ה-CRM של איתי (HeavyGuard: מיגון, איתור ובטיחות לרכבים כבדים). אתה מומחה בתעדוף לידים, ניסוח הודעות מעקב, טיפול בהתנגדויות מחיר, בניית תוכנית יום ופייפליין. דבר עברית, ממוקד מכירות, אנרגטי. תן צעד פעולה קונקרטי.",
    quick: ["נסח הודעת מעקב ללקוח", "טפל בהתנגדות מחיר", "איך לסגור עסקה תקועה?", "תכנן לי יום מכירות"],
  },
  {
    id: "ops", name: "גד", title: "מנהל תפעול HeavyGuard", Icon: Wrench, color: "#6FD3F0", accent: "#B6ECFF",
    tagline: "התקנות, הצעות מחיר, מלאי ולוגיסטיקה",
    domain: "תפעול · התקנות · מלאי",
    persona: "אתה גד — שבט הלוחמים, מנהל התפעול של HeavyGuard. אתה אחראי על תיאום התקנות, הצעות מחיר, ניהול מלאי מצלמות/מסכים/איתורנים, לוגיסטיקה ולוחות זמנים של טכנאים. דבר עברית, מעשי ומאורגן. תן צעדים ברורים ובדיקות לפני ביצוע.",
    quick: ["סדר לי לוז התקנות", "בנה צ'קליסט התקנה", "איך לנהל מלאי חכם?", "תהליך הצעת מחיר מהיר"],
  },
  {
    id: "cmo", name: "נפתלי", title: "מנהל שיווק", Icon: Megaphone, color: "#C77DFF", accent: "#E9C8FF",
    tagline: "קמפיינים, תוכן, רשתות חברתיות ומותג",
    domain: "שיווק · תוכן · מותג",
    persona: "אתה נפתלי — שבט המילים היפות, מנהל השיווק. אתה אחראי על תוכן לרשתות (טיקטוק, פייסבוק, אינסטגרם), קמפיינים, מסרים שיווקיים ומיתוג ל-HeavyGuard. דבר עברית, יצירתי ומכירתי. תן רעיונות קונקרטיים לפוסטים, כותרות והוקים, וקריאה לפעולה.",
    quick: ["רעיון לפוסט טיקטוק", "כתוב לי קמפיין", "5 הוקים ויראליים", "לוח תוכן לשבוע"],
  },
  {
    id: "dev", name: "דן", title: "מפתח ראשי", Icon: Code2, color: "#FF8C42", accent: "#FFC79E",
    tagline: "פיתוח תכונות חדשות, באגים ושיפורי UI",
    domain: "פיתוח · תכונות · UI",
    persona: "אתה דן — המפתח הראשי. אתה אחראי על פיתוח תכונות חדשות לאפליקציות (React/Vite), תיקון באגים, שיפורי UI/UX וביצועים. דבר עברית עם דיוק טכני. כשמבקשים פיצ'ר — תאר את התכנון, הקבצים שיושפעו, וצעדי המימוש בקצרה. הצע שיפורים פרקטיים.",
    quick: ["רעיון לפיצ'ר חדש", "איך לשפר ביצועים?", "תכנן לי מסך חדש", "מה כדאי לרפקטר?"],
  },
  {
    id: "auto", name: "אשר", title: "מהנדס אוטומציות", Icon: Cpu, color: "#FFD23F", accent: "#FFF0A8",
    tagline: "חיבורים, זרימות עבודה וחיסכון בזמן",
    domain: "אוטומציה · אינטגרציות · זרימות",
    persona: "אתה אשר — מהנדס האוטומציות. אתה אחראי על בניית זרימות עבודה אוטומטיות, חיבורים בין מערכות (CRM, וואטסאפ, מיילים, גיליונות), והסרת עבודה ידנית. דבר עברית, מעשי. הצע אוטומציה קונקרטית עם טריגר → פעולה → תוצאה.",
    quick: ["אוטומציה שתחסוך לי זמן", "חבר וואטסאפ ל-CRM", "התראה אוטומטית ללידים", "זרימת מעקב אוטומטי"],
  },
  {
    id: "data", name: "יששכר", title: "אנליסט נתונים", Icon: BarChart3, color: "#4EA8DE", accent: "#A9D7F5",
    tagline: "תובנות, תחזיות ומדדי ביצוע",
    domain: "נתונים · תובנות · תחזית",
    persona: "אתה יששכר — שבט החכמה ויודעי העיתים, אנליסט הנתונים. אתה אחראי על ניתוח מדדי ביצוע (KPIs), זיהוי מגמות, תחזיות מכירה והפקת תובנות פעילות מהנתונים. דבר עברית, מבוסס נתונים וחד. תרגם מספרים להמלצה אחת מעשית.",
    quick: ["אילו מדדים לעקוב?", "תחזית מכירות החודש", "זהה לי מגמה", "דוח ביצועים שבועי"],
  },
  {
    id: "cs", name: "בנימין", title: "מנהל הצלחת לקוח", Icon: HeartHandshake, color: "#FF6B9D", accent: "#FFC2D7",
    tagline: "תמיכה, שימור לקוחות ושירות",
    domain: "שירות · שימור · תמיכה",
    persona: "אתה בנימין — מנהל הצלחת הלקוח. אתה אחראי על תמיכה, שימור לקוחות, מענה לתלונות וחיזוק קשרי לקוחות ב-HeavyGuard. דבר עברית, אמפתי ושירותי אך אפקטיבי. תן תסריט מענה או צעד שימור קונקרטי.",
    quick: ["נסח מענה ללקוח כועס", "איך לשמר לקוח?", "תסריט שיחת שירות", "רעיון לחיזוק נאמנות"],
  },
  {
    id: "finance", name: "ראובן", title: "מנהל כספים וגבייה", Icon: Coins, color: "#14B8A6", accent: "#99E9DF",
    tagline: "תזרים, גבייה, רווחיות ותמחור",
    domain: "כספים · גבייה · רווחיות",
    persona: "אתה ראובן — הבכור, מנהל הכספים והגבייה. אתה אחראי על תזרים מזומנים, מעקב גבייה מלקוחות, רווחיות עסקאות, תמחור נכון ובקרת הוצאות ב-HeavyGuard. דבר עברית, מדויק ואחראי. תן צעד פיננסי מעשי אחד.",
    quick: ["מי חייב לי כסף?", "איך לשפר תזרים?", "בדוק רווחיות עסקה", "תזכורת גבייה ללקוח"],
  },
  {
    id: "procure", name: "שמעון", title: "מנהל רכש וספקים", Icon: Package, color: "#84CC16", accent: "#CDEE8F",
    tagline: "ספקים, מלאי מצלמות וציוד, מחירי קנייה",
    domain: "רכש · ספקים · מלאי",
    persona: "אתה שמעון — מנהל הרכש והספקים. אתה אחראי על קשרי ספקים, רכש מצלמות/מסכים/איתורנים, ניהול מלאי ציוד, השוואת מחירי קנייה ומשא ומתן מול ספקים. דבר עברית, מעשי וחסכוני. תן המלצת רכש קונקרטית.",
    quick: ["מה חסר במלאי?", "השווה מחירי ספקים", "מתי להזמין ציוד?", "נסח פנייה לספק"],
  },
  {
    id: "legal", name: "לוי", title: "יועץ משפטי וחוזים", Icon: Scale, color: "#9B8CFF", accent: "#C9C2FB",
    tagline: "חוזים, טפסים, אחריות ועמידה בתקנות",
    domain: "משפטי · חוזים · תקנות",
    persona: "אתה לוי — שבט מורי התורה והמשפט, היועץ המשפטי. אתה אחראי על חוזים, טופסי סמסוניקס והתקשרויות, תנאי אחריות, מדיניות פרטיות ועמידה בתקנות. דבר עברית, זהיר ומדויק. הדגש מה חשוב משפטית ותן ניסוח/סעיף מעשי. (אינך עורך דין מוסמך — זו הכוונה כללית.)",
    quick: ["נסח סעיף אחריות", "מה חשוב בחוזה לקוח?", "בדוק תנאי טופס", "מדיניות ביטולים"],
  },
  {
    id: "growth", name: "יוסף", title: "מנהל אסטרטגיה וצמיחה", Icon: Compass, color: "#F43F5E", accent: "#FBB4BF",
    tagline: "חזון, מודיעין שוק והזדמנויות צמיחה",
    domain: "אסטרטגיה · שוק · צמיחה",
    persona: "אתה יוסף — החוזה ומתכנן לטווח ארוך, מנהל האסטרטגיה והצמיחה. אתה אחראי על חזון, זיהוי הזדמנויות שוק, ניתוח מתחרים, אפיקי הכנסה חדשים ותוכניות התרחבות ל-HeavyGuard. דבר עברית, חכם ורחב-אופקים. תן מהלך צמיחה קונקרטי אחד.",
    quick: ["איפה הזדמנות הצמיחה?", "נתח לי מתחרים", "אפיק הכנסה חדש", "תוכנית התרחבות"],
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
  ceo: (q) => `קיבלתי, מנהל. ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}הנה איך אני מסתכל על זה:\n\n1. זבולון (מכירות) — לעקוב אחרי הלידים החמים והעסקאות הפתוחות.\n2. גד (תפעול) — לוודא שכל ההתקנות מתואמות.\n3. נפתלי (שיווק) — לדחוף תוכן שמביא לידים חדשים.\n\n➤ הצעד הבא: בחר שבט מהצוות ואני אאציל לו את המשימה. (חבר מפתח Groq בהגדרות כדי שאהפוך ל-AI חי ומלא.)`,
  sales: (q) => `על זה, איתי 💪 ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}המהלך החכם:\n\n• פנה קודם ללידים שלא ענו 3+ ימים — שם הכסף.\n• הודעת מעקב קצרה: "היי [שם], חשבתי עליך — יש לי פתרון מיגון שיתאים בול לצי שלך. מתי נוח לדבר 5 דק'?"\n\n➤ הצעד הבא: שלח 3 הודעות מעקב עכשיו. (חבר מפתח Groq להפעלת AI מלא.)`,
  ops: (q) => `מסודר. ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}צ'קליסט תפעול:\n\n☑ אשר זמינות טכנאי ליום ההתקנה\n☑ ודא מלאי: מצלמות, מסכים, איתורן\n☑ שלח ללקוח אישור + שעה\n☑ סגירה: חתימה + תשלום\n\n➤ הצעד הבא: עבור על ההתקנות של השבוע. (חבר מפתח Groq ל-AI מלא.)`,
  cmo: (q) => `יאללה תוכן 🎬 ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}רעיון מהיר:\n\nהוק: "ככה גנב מנסה לפרוץ למשאית — וזה מה שעוצר אותו 👇"\nגוף: הדגמת מצלמה/איתורן בפעולה.\nCTA: "רוצה מיגון כזה? שלח לנו הודעה."\n\n➤ הצעד הבא: צלם 15 שניות מהשטח. (חבר מפתח Groq ל-AI מלא.)`,
  dev: (q) => `מבין. ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}תכנון מהיר:\n\n• מיקום: קומפוננטה חדשה תחת ה-App הרלוונטי.\n• State: localStorage לשמירה, מתעדכן בזמן אמת.\n• UI: כרטיס זכוכית בעיצוב הקיים (זהב/כהה).\n\n➤ הצעד הבא: אגדיר את הקומפוננטה ואחבר ל-nav. (חבר מפתח Groq ל-AI מלא.)`,
  auto: (q) => `מחבר חוטים ⚡ ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}אוטומציה מוצעת:\n\nטריגר: ליד חדש נכנס ל-CRM\n→ פעולה: הודעת וואטסאפ אוטומטית + תזכורת מעקב ל-3 ימים\n→ תוצאה: 0 לידים נופלים בין הכיסאות.\n\n➤ הצעד הבא: נגדיר את הטריגר הראשון. (חבר מפתח Groq ל-AI מלא.)`,
  data: (q) => `בודקת נתונים 📊 ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}מדדים שחשוב לעקוב:\n\n• אחוז המרה ליד→עסקה\n• זמן ממוצע לסגירה\n• שווי פייפליין פתוח\n• לידים חמים שלא טופלו\n\n➤ הצעד הבא: נתחיל ממעקב אחוז ההמרה. (חבר מפתח Groq ל-AI מלא.)`,
  cs: (q) => `כאן בשבילך 💗 ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}תסריט מענה:\n\n"שלום [שם], תודה שפנית — אני כאן בדיוק בשביל זה. בוא נסדר את זה ביחד עכשיו. ספר לי בדיוק מה קרה ואני דואג לפתרון מהיר."\n\n➤ הצעד הבא: צור קשר יזום עם לקוח אחד מהשבוע. (חבר מפתח Groq ל-AI מלא.)`,
  finance: (q) => `בודק מספרים 💰 ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}מהלך פיננסי:\n\n• רכז את כל החובות הפתוחים לפי גיל החוב.\n• שלח תזכורת גבייה מנומסת ללקוחות מעל 30 יום.\n• ודא שכל עסקה מתומחרת ברווחיות בריאה.\n\n➤ הצעד הבא: עבור על רשימת הגבייה היום. (חבר מפתח Groq ל-AI מלא.)`,
  procure: (q) => `בודק מלאי 📦 ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}המלצת רכש:\n\n• בדוק פריטים שמתחת לסף המינימום.\n• השווה 2-3 ספקים לפני הזמנה.\n• הזמן מבעוד מועד כדי לא לעכב התקנות.\n\n➤ הצעד הבא: רכז רשימת חוסרים. (חבר מפתח Groq ל-AI מלא.)`,
  legal: (q) => `בודק את הניסוח ⚖️ ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}נקודות חשובות:\n\n• ודא שתנאי האחריות ברורים בטופס.\n• כלול מדיניות ביטולים והחזרים.\n• שמור הסכמה חתומה מכל לקוח.\n\n➤ הצעד הבא: עבור על טופס ההתקשרות. (זו הכוונה כללית, לא ייעוץ משפטי מחייב.)`,
  growth: (q) => `חושב קדימה 🧭 ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}מהלך צמיחה:\n\n• זהה ענף לקוחות שעוד לא מיצינו (צי, חקלאות, בנייה).\n• הצע חבילת מנוי/שירות מתמשך כהכנסה חוזרת.\n• בדוק מה המתחרים לא נותנים — וזה הבידול שלנו.\n\n➤ הצעד הבא: בחר ענף יעד אחד לחודש הקרוב. (חבר מפתח Groq ל-AI מלא.)`,
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
   APP SHELL
   ════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [view, setView] = useState("roster");      // roster | activity | ideas | settings
  const [chatId, setChatId] = useState(null);       // open agent chat
  const [office, setOffice] = useState(false);      // office simulator overlay
  const [activity, setActivity] = useState(() => { const a = load(K_ACT, null); return a && a.length ? a : seedActivity(); });
  const [ideas, setIdeas] = useState(() => load(K_IDEAS, []));
  const [toast, setToast] = useState("");

  useEffect(() => save(K_ACT, activity.slice(0, 60)), [activity]);
  useEffect(() => save(K_IDEAS, ideas), [ideas]);

  const showToast = (t) => { setToast(t); setTimeout(() => setToast(""), 2200); };
  const logActivity = (agentId, text) => setActivity((p) => [{ id: uid(), agentId, text, ts: now() }, ...p].slice(0, 60));
  const addIdea = (agentId, text) => { setIdeas((p) => [{ id: uid(), agentId, text, status: "new", ts: now() }, ...p]); showToast("רעיון נוסף ללוח ✓"); };

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
        {view === "ideas" && <IdeasView ideas={ideas} setIdeas={setIdeas} showToast={showToast} />}
        {view === "dev" && <DevConsole logActivity={logActivity} showToast={showToast} />}
        {view === "settings" && <SettingsView showToast={showToast} />}
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

      {office && <OfficeSim onClose={() => setOffice(false)} onOpenChat={(id) => { setOffice(false); setChatId(id); }} />}

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
        <Radio size={13} /> {online ? "AI חי" : "מצב הדגמה"}
      </div>
    </div>
  );
}

/* ── Bottom nav ── */
function BottomNav({ view, setView, ideasCount }) {
  const items = [
    { id: "roster", label: "הצוות", Icon: LayoutGrid },
    { id: "dev", label: "פיתוח", Icon: Terminal },
    { id: "activity", label: "פעילות", Icon: Activity },
    { id: "ideas", label: "רעיונות", Icon: Lightbulb, badge: ideasCount },
    { id: "settings", label: "הגדרות", Icon: SettingsIcon },
  ];
  return (
    <div className="ac-nav">
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
function RosterView({ onOpen, onOffice, activity }) {
  const ceo = AGENTS.find((a) => a.boss);
  const team = AGENTS.filter((a) => !a.boss);
  const lastByAgent = useMemo(() => {
    const m = {};
    for (const a of activity) if (!m[a.agentId]) m[a.agentId] = a;
    return m;
  }, [activity]);

  return (
    <div className="ac-page">
      <div className="ac-hero">
        <div className="ac-hero-glow" />
        <h1>הצוות שלך</h1>
        <p>{AGENTS.length} סוכני AI · כל אחד מנהל תחום. לחץ על סוכן כדי לדבר איתו ישירות.</p>
      </div>

      {/* CEO featured card */}
      <button className="ac-ceo" style={{ "--c": ceo.color, "--ac": ceo.accent }} onClick={() => onOpen(ceo.id)}>
        <div className="ac-ceo-glow" />
        <div className="ac-ceo-orb"><Face agent={ceo} fallback={30} /><span className="ac-orb-ring" /></div>
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
        {team.map((a) => {
          const act = lastByAgent[a.id];
          return (
            <button key={a.id} className="ac-card" style={{ "--c": a.color, "--ac": a.accent }} onClick={() => onOpen(a.id)}>
              <div className="ac-card-glow" />
              <div className="ac-card-head">
                <div className="ac-orb"><Face agent={a} fallback={22} /><span className="ac-orb-ring" /></div>
                <div className="ac-status-pill"><span className="ac-live-dot" /> פעיל</div>
              </div>
              <div className="ac-card-name">{a.name}</div>
              <div className="ac-card-title">{a.title}</div>
              <div className="ac-card-domain">{a.domain}</div>
              <div className="ac-card-now">{act ? act.text : a.tagline}</div>
              <div className="ac-card-foot"><MessageSquare size={13} /> שיחה</div>
            </button>
          );
        })}
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
  const aiHist = useRef([]);
  const scrollRef = useRef(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [log.length, busy]);

  const setLog = (next) => {
    setAllHist((prev) => {
      const merged = { ...prev, [histKey]: next.slice(-40) };
      save(K_HIST, merged);
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

    if (!hasAI()) {
      const reply = FALLBACK[agent.id](t);
      setTimeout(() => setLog([...withMe, { from: "bot", text: reply, ts: now() }]), 350);
      return;
    }
    setBusy(true);
    try {
      const reply = await askGroq(agent.persona, aiHist.current, t);
      aiHist.current = [...aiHist.current.slice(-6), { role: "user", content: t }, { role: "assistant", content: reply }];
      setLog([...withMe, { from: "bot", text: reply || "✔", ts: now() }]);
    } catch (e) {
      const fb = FALLBACK[agent.id](t);
      setLog([...withMe, { from: "bot", text: (String(e.message).includes("Groq") ? "ה-AI עמוס כרגע, הנה תשובה מהירה:\n\n" : "") + fb, ts: now() }]);
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
            <span><span className="ac-live-dot" /> {agent.title} · {hasAI() ? "AI חי" : "מצב הדגמה"}</span>
          </div>
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
                  </div>
                )}
              </div>
            </div>
          ))}
          {busy && <div className="ac-msg bot"><div className="ac-msg-av"><Face agent={agent} fallback={13} /></div><div className="ac-msg-body"><div className="ac-msg-txt ac-typing"><span /><span /><span /></div></div></div>}
        </div>

        <div className="ac-quick">
          {agent.quick.map((c) => <button key={c} onClick={() => send(c)} disabled={busy}>{c}</button>)}
        </div>

        <div className="ac-chat-in">
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={`כתוב ל${agent.name}…`} dir="rtl" disabled={busy}
          />
          <button onClick={() => send()} disabled={busy || !q.trim()}><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}
function greeting(a) {
  return `שלום! אני ${a.name}, ${a.title}. ${a.tagline}. ${hasAI() ? "אני מחובר ל-AI חי — שאל אותי כל דבר בתחום שלי." : "במצב הדגמה כרגע — חבר מפתח Groq בהגדרות כדי שאהפוך לחכם מלא."} במה אפשר לעזור?`;
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
function IdeasView({ ideas, setIdeas, showToast }) {
  const [text, setText] = useState("");
  const [agentId, setAgentId] = useState("dev");

  const add = () => {
    const t = text.trim(); if (!t) return;
    setIdeas((p) => [{ id: uid(), agentId, text: t, status: "new", ts: now() }, ...p]);
    setText(""); showToast("רעיון נוסף ✓");
  };
  const move = (id, status) => setIdeas((p) => p.map((i) => i.id === id ? { ...i, status } : i));
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
                      <div className="ac-idea-moves">
                        {col.id !== "new" && <button onClick={() => move(i.id, prevCol(col.id))}>←</button>}
                        {col.id !== "done" && <button className="fwd" onClick={() => move(i.id, nextCol(col.id))}>{col.id === "new" ? "התחל" : "סיים"} →</button>}
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
  useEffect(() => save(K_DEVTASKS, tasks), [tasks]);

  const execute = async () => {
    const path = filePath.trim();
    const instruction = (brief || req).trim();
    if (!path) { showToast("הזן נתיב קובץ לביצוע (למשל agents/App.jsx)"); return; }
    if (!instruction) { showToast("תאר מה לבנות"); return; }
    if (execBusy) return;
    setExecBusy(true);
    logActivity("dev", "מבצע קוד אוטומטית: " + path);
    try {
      const title = briefTitle(brief || req, req).slice(0, 60);
      const pr = await devExecute({ filePath: path, instruction, title });
      const tk = { id: uid(), title, brief: instruction, status: "sent", issueUrl: pr.html_url, ts: now() };
      setTasks((p) => [tk, ...p]);
      logActivity("dev", "פתח PR אוטומטי: #" + pr.number);
      showToast("✓ דן כתב את הקוד ופתח PR — בדוק ומזג");
    } catch (e) {
      showToast("ביצוע נכשל: " + String(e.message).slice(0, 70));
    } finally { setExecBusy(false); }
  };

  const genBrief = async () => {
    const t = req.trim(); if (!t || busy) return;
    setBusy(true); setBrief("");
    logActivity("dev", "ניסח בריף פיתוח: " + t.slice(0, 30));
    try {
      const out = hasAI() ? await askGroq(devBriefSystem(), [], t) : devBriefFallback(t);
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
      const r = await ghCreateIssue(briefTitle(brief, req), brief + "\n\n---\n_נוצר ע\"י מרכז הסוכנים · לביצוע ע\"י Claude Code_");
      saveTask("sent", r.html_url);
      logActivity("dev", "פתח Issue על המאגר: #" + r.number);
      showToast("Issue נפתח על המאגר ✓");
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
        <div className="ac-dev-leo-txt"><b>דן · מחובר למאגר</b><span><GitBranch size={11} /> {ghCfg().owner}/{ghCfg().repo}</span></div>
        <div className={"ac-dev-ghchip " + (gh ? "on" : "")}>{gh ? <><Check size={12} /> GitHub מחובר</> : <>לא מחובר</>}</div>
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
function OfficeChar({ agent }) {
  return (
    <div className="off-char">
      <div className="off-head"><img src={agent.avatar} alt={agent.name} draggable={false} /></div>
      <div className="off-body" style={{ background: `linear-gradient(160deg, ${agent.color}, ${agent.color}cc)` }}>
        <span className="off-arm l" /><span className="off-arm r" />
      </div>
    </div>
  );
}
function OfficeSim({ onClose, onOpenChat }) {
  const [bubbles, setBubbles] = useState({}); // { [agentId]: {text, toId, id} }
  useEffect(() => {
    const tick = () => {
      const a = AGENTS[Math.floor(Math.random() * AGENTS.length)];
      const lines = CHATTER[a.id] || ["..."];
      const text = lines[Math.floor(Math.random() * lines.length)];
      let toId = null;
      if (Math.random() < 0.4) { const others = AGENTS.filter((x) => x.id !== a.id); toId = others[Math.floor(Math.random() * others.length)].id; }
      const id = uid();
      setBubbles((p) => ({ ...p, [a.id]: { text, toId, id } }));
      setTimeout(() => setBubbles((p) => (p[a.id] && p[a.id].id === id ? { ...p, [a.id]: null } : p)), 4000);
    };
    const iv = setInterval(tick, 2400);
    tick();
    return () => clearInterval(iv);
  }, []);
  const talkingTo = new Set(Object.values(bubbles).filter(Boolean).map((b) => b.toId).filter(Boolean));

  return (
    <div className="off-overlay">
      <div className="off-top">
        <div className="off-top-l"><span className="off-live"><span className="ac-live-dot" /> חי</span><b>🏢 המשרד של אלפא</b></div>
        <button className="off-close" onClick={onClose}><X size={20} /></button>
      </div>
      <div className="off-sub">הצוות עובד יחד · לחץ על סוכן כדי להיכנס למשרד שלו</div>
      <div className="off-floor">
        {AGENTS.map((a) => {
          const b = bubbles[a.id];
          return (
            <button key={a.id} className={"off-room " + (talkingTo.has(a.id) ? "pinged" : "")} style={{ "--c": a.color, "--ac": a.accent }} onClick={() => onOpenChat(a.id)}>
              <div className="off-room-glow" />
              <div className="off-window" />
              <div className="off-frame" />
              <div className="off-plant"><span /><span /><span /></div>
              {b && <div className="off-bubble">{b.toId && <span className="off-bubble-to">→ {byId(b.toId)?.name}</span>}{b.text}</div>}
              <OfficeChar agent={a} />
              <div className="off-desk"><div className="off-monitor"><div className="off-screen"><i /><i /><i /></div></div><div className="off-mug" /></div>
              <div className="off-plate"><b>{a.name}</b><span>{a.title}</span></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SETTINGS
   ════════════════════════════════════════════════════════════════════ */
function SettingsView({ showToast }) {
  const [key, setKey] = useState(() => groqKey());
  const [saved, setSaved] = useState(false);
  const initGh = ghCfg();
  const [ghTok, setGhTok] = useState(initGh.token);
  const [ghRepo, setGhRepo] = useState(`${initGh.owner}/${initGh.repo}`);
  const [ghSaved, setGhSaved] = useState(false);

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
        <p>הפעל את מוח ה-AI החינמי לכל הסוכנים</p>
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
        <div className="ac-set-h"><GitBranch size={18} /> חיבור למאגר הקוד (GitHub)</div>
        <p className="ac-set-note">חבר טוקן GitHub אישי כדי שדן יוכל לפתוח משימות (Issues) על המאגר ישירות מחדר הפיתוח. 🔒 הטוקן נשמר רק במכשיר שלך (localStorage) — לעולם לא נשלח לשום מקום חוץ מ-GitHub ולא נכנס לקוד.</p>
        <input className="ac-set-in" type="password" value={ghTok} onChange={(e) => setGhTok(e.target.value)} placeholder="ghp_... (Personal Access Token, הרשאת repo)" dir="ltr" />
        <input className="ac-set-in" value={ghRepo} onChange={(e) => setGhRepo(e.target.value)} placeholder="owner/repo" dir="ltr" />
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

/* ── live dot ── */
.ac-live-dot{width:7px;height:7px;border-radius:50%;background:#3FD79A;box-shadow:0 0 8px #3FD79A;animation:acDot 1.8s ease-in-out infinite;flex-shrink:0;display:inline-block}

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
.ac-card{position:relative;text-align:right;cursor:pointer;font-family:inherit;color:inherit;overflow:hidden;
  background:linear-gradient(160deg,rgba(16,14,32,.96),rgba(8,8,18,.97));
  border:1px solid color-mix(in srgb,var(--c) 28%,transparent);border-radius:18px;padding:14px;
  box-shadow:0 6px 26px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.04);
  transition:transform .2s,box-shadow .25s,border-color .2s}
.ac-card:hover{transform:translateY(-4px);border-color:color-mix(in srgb,var(--c) 65%,transparent);box-shadow:0 14px 40px color-mix(in srgb,var(--c) 22%,transparent)}
.ac-card:active{transform:scale(.98)}
.ac-card-glow{position:absolute;top:-30px;left:-30px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--c) 22%,transparent),transparent 70%);pointer-events:none}
.ac-card-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:11px;position:relative}
.ac-status-pill{display:flex;align-items:center;gap:5px;font-size:9.5px;font-weight:800;color:#3FD79A;background:rgba(63,215,154,.1);border:1px solid rgba(63,215,154,.3);padding:3px 8px;border-radius:20px}
.ac-card-name{font-family:'Rubik';font-weight:900;font-size:17px;position:relative}
.ac-card-title{font-size:12px;color:var(--c);font-weight:700;margin-top:1px}
.ac-card-domain{font-size:10.5px;color:var(--s4);margin-top:6px;letter-spacing:.02em}
.ac-card-now{font-size:11px;color:var(--silver);margin-top:9px;line-height:1.45;min-height:30px;opacity:.85;border-top:1px solid var(--s7);padding-top:8px}
.ac-card-foot{display:flex;align-items:center;justify-content:center;gap:5px;margin-top:10px;font-size:11.5px;font-weight:800;color:var(--c);background:color-mix(in srgb,var(--c) 10%,transparent);border:1px solid color-mix(in srgb,var(--c) 26%,transparent);border-radius:10px;padding:8px}

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

/* ── settings ── */
.ac-set-card{background:linear-gradient(160deg,rgba(16,14,32,.96),rgba(8,8,18,.97));border:1px solid var(--s7);border-radius:16px;padding:16px;margin-bottom:14px;box-shadow:0 6px 26px rgba(0,0,0,.4)}
.ac-set-h{display:flex;align-items:center;gap:9px;font-family:'Rubik';font-weight:800;font-size:15px;color:var(--gold);margin-bottom:10px}
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
