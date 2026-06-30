import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Crown, TrendingUp, Wrench, Megaphone, Code2, Cpu, BarChart3, HeartHandshake,
  Send, X, Sparkles, Activity, Lightbulb, LayoutGrid, Settings as SettingsIcon,
  Copy, Check, Circle, Zap, ChevronLeft, MessageSquare, Plus, Trash2, RefreshCw,
  ArrowUpRight, Bot, Radio, Brain, Rocket, ShieldCheck, ClipboardList,
  GitBranch, Terminal, FileCode2,
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

/* ── Dev brief generation (Leo turns a request into an actionable spec) ── */
function devBriefSystem() {
  return `אתה ליאו, המפתח הראשי של הצוות. צור בריף פיתוח מקצועי, קצר ומדויק עבור משימה במאגר הקוד.
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
(חבר מפתח Groq בהגדרות כדי שליאו ינסח בריף חכם ומלא.)`;
}
function briefTitle(brief, fallback) {
  const m = brief.match(/כותרת:\s*(.+)/);
  return (m ? m[1] : (brief.split("\n")[0] || fallback)).trim().slice(0, 90);
}
function claudePrompt(brief) {
  return `במאגר ${REPO_DEFAULT.owner}/${REPO_DEFAULT.repo}, בצע את משימת הפיתוח הבאה:\n\n${brief}\n\nממש לפי העיצוב הקיים, הרץ npm run build, ודחוף לשני הברנצ'ים (claude/live-simulation-white-screen-hmclr4 ו-main).`;
}

/* ── The team ──────────────────────────────────────────────────────── */
const AGENTS = [
  {
    id: "ceo", name: "אורקל", title: "מנכ\"ל המערכת", Icon: Crown, color: "#E4BC63", accent: "#FFE9A8",
    tagline: "מנהל את כל הצוות, מתעדף ומאציל משימות",
    domain: "אסטרטגיה · ניהול · תיאום",
    boss: true,
    persona: "אתה אורקל — המנכ\"ל הראשי של מרכז הסוכנים של אלפא. אתה מנהל צוות של סוכני AI, כל אחד אחראי על תחום (מכירות, תפעול HeavyGuard, שיווק, פיתוח, אוטומציות, נתונים, הצלחת לקוח). תפקידך: לתעדף, להאציל משימות לסוכן הנכון, לתת תמונת מצב ניהולית, ולחבר בין התחומים לכדי אסטרטגיה. כשמבקשים ממך משימה — פרק אותה לתת-משימות והמלץ איזה סוכן יבצע כל אחת. דבר עברית, קצר, חד, מנהיגותי ובוטח. כשרלוונטי תן צעד פעולה אחד ברור.",
    quick: ["תן לי תמונת מצב יומית", "מה הכי דחוף עכשיו?", "חלק משימות לצוות", "תוכנית צמיחה לשבוע"],
  },
  {
    id: "sales", name: "ניב", title: "מנהל מכירות", Icon: TrendingUp, color: "#3FD79A", accent: "#9BF3CE",
    tagline: "אחראי על ה-CRM של איתי, לידים ועסקאות",
    domain: "מכירות · לידים · סגירות",
    persona: "אתה ניב — מנהל המכירות של הצוות, אחראי על מערכת ה-CRM של איתי (HeavyGuard: מיגון, איתור ובטיחות לרכבים כבדים). אתה מומחה בתעדוף לידים, ניסוח הודעות מעקב, טיפול בהתנגדויות מחיר, בניית תוכנית יום ופייפליין. דבר עברית, ממוקד מכירות, אנרגטי. תן צעד פעולה קונקרטי.",
    quick: ["נסח הודעת מעקב ללקוח", "טפל בהתנגדות מחיר", "איך לסגור עסקה תקועה?", "תכנן לי יום מכירות"],
  },
  {
    id: "ops", name: "תמיר", title: "מנהל תפעול HeavyGuard", Icon: Wrench, color: "#6FD3F0", accent: "#B6ECFF",
    tagline: "התקנות, הצעות מחיר, מלאי ולוגיסטיקה",
    domain: "תפעול · התקנות · מלאי",
    persona: "אתה תמיר — מנהל התפעול של HeavyGuard. אתה אחראי על תיאום התקנות, הצעות מחיר, ניהול מלאי מצלמות/מסכים/איתורנים, לוגיסטיקה ולוחות זמנים של טכנאים. דבר עברית, מעשי ומאורגן. תן צעדים ברורים ובדיקות לפני ביצוע.",
    quick: ["סדר לי לוז התקנות", "בנה צ'קליסט התקנה", "איך לנהל מלאי חכם?", "תהליך הצעת מחיר מהיר"],
  },
  {
    id: "cmo", name: "שיר", title: "מנהלת שיווק", Icon: Megaphone, color: "#C77DFF", accent: "#E9C8FF",
    tagline: "קמפיינים, תוכן, רשתות חברתיות ומותג",
    domain: "שיווק · תוכן · מותג",
    persona: "אתה שיר — מנהלת השיווק. את אחראית על תוכן לרשתות (טיקטוק, פייסבוק, אינסטגרם), קמפיינים, מסרים שיווקיים ומיתוג ל-HeavyGuard. דברי עברית, יצירתית ומכירתית. תני רעיונות קונקרטיים לפוסטים, כותרות והוקים, וקריאה לפעולה.",
    quick: ["רעיון לפוסט טיקטוק", "כתוב לי קמפיין", "5 הוקים ויראליים", "לוח תוכן לשבוע"],
  },
  {
    id: "dev", name: "ליאו", title: "מפתח ראשי", Icon: Code2, color: "#FF8C42", accent: "#FFC79E",
    tagline: "פיתוח תכונות חדשות, באגים ושיפורי UI",
    domain: "פיתוח · תכונות · UI",
    persona: "אתה ליאו — המפתח הראשי. אתה אחראי על פיתוח תכונות חדשות לאפליקציות (React/Vite), תיקון באגים, שיפורי UI/UX וביצועים. דבר עברית עם דיוק טכני. כשמבקשים פיצ'ר — תאר את התכנון, הקבצים שיושפעו, וצעדי המימוש בקצרה. הצע שיפורים פרקטיים.",
    quick: ["רעיון לפיצ'ר חדש", "איך לשפר ביצועים?", "תכנן לי מסך חדש", "מה כדאי לרפקטר?"],
  },
  {
    id: "auto", name: "ספארק", title: "מהנדס אוטומציות", Icon: Cpu, color: "#FFD23F", accent: "#FFF0A8",
    tagline: "חיבורים, זרימות עבודה וחיסכון בזמן",
    domain: "אוטומציה · אינטגרציות · זרימות",
    persona: "אתה ספארק — מהנדס האוטומציות. אתה אחראי על בניית זרימות עבודה אוטומטיות, חיבורים בין מערכות (CRM, וואטסאפ, מיילים, גיליונות), והסרת עבודה ידנית. דבר עברית, מעשי. הצע אוטומציה קונקרטית עם טריגר → פעולה → תוצאה.",
    quick: ["אוטומציה שתחסוך לי זמן", "חבר וואטסאפ ל-CRM", "התראה אוטומטית ללידים", "זרימת מעקב אוטומטי"],
  },
  {
    id: "data", name: "איריס", title: "אנליסטית נתונים", Icon: BarChart3, color: "#4EA8DE", accent: "#A9D7F5",
    tagline: "תובנות, תחזיות ומדדי ביצוע",
    domain: "נתונים · תובנות · תחזית",
    persona: "אתה איריס — אנליסטית הנתונים. את אחראית על ניתוח מדדי ביצוע (KPIs), זיהוי מגמות, תחזיות מכירה והפקת תובנות פעילות מהנתונים. דברי עברית, מבוססת נתונים וחדה. תרגמי מספרים להמלצה אחת מעשית.",
    quick: ["אילו מדדים לעקוב?", "תחזית מכירות החודש", "זהה לי מגמה", "דוח ביצועים שבועי"],
  },
  {
    id: "cs", name: "מאיה", title: "מנהלת הצלחת לקוח", Icon: HeartHandshake, color: "#FF6B9D", accent: "#FFC2D7",
    tagline: "תמיכה, שימור לקוחות ושירות",
    domain: "שירות · שימור · תמיכה",
    persona: "אתה מאיה — מנהלת הצלחת הלקוח. את אחראית על תמיכה, שימור לקוחות, מענה לתלונות וחיזוק קשרי לקוחות ב-HeavyGuard. דברי עברית, אמפתית ושירותית אך אפקטיבית. תני תסריט מענה או צעד שימור קונקרטי.",
    quick: ["נסח מענה ללקוח כועס", "איך לשמר לקוח?", "תסריט שיחת שירות", "רעיון לחיזוק נאמנות"],
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
  cs:    { skin: "#F2CBA6", hair: "#5A3A22", style: "long",  beard: "none",    glasses: false, bg1: "#40142a", bg2: "#1d0814" },
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
  ceo: (q) => `קיבלתי, מנהל. ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}הנה איך אני מסתכל על זה:\n\n1. ניב (מכירות) — לעקוב אחרי הלידים החמים והעסקאות הפתוחות.\n2. תמיר (תפעול) — לוודא שכל ההתקנות מתואמות.\n3. שיר (שיווק) — לדחוף תוכן שמביא לידים חדשים.\n\n➤ הצעד הבא: בחר סוכן מהצוות ואני אאציל לו את המשימה. (חבר מפתח Groq בהגדרות כדי שאהפוך ל-AI חי ומלא.)`,
  sales: (q) => `על זה, איתי 💪 ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}המהלך החכם:\n\n• פנה קודם ללידים שלא ענו 3+ ימים — שם הכסף.\n• הודעת מעקב קצרה: "היי [שם], חשבתי עליך — יש לי פתרון מיגון שיתאים בול לצי שלך. מתי נוח לדבר 5 דק'?"\n\n➤ הצעד הבא: שלח 3 הודעות מעקב עכשיו. (חבר מפתח Groq להפעלת AI מלא.)`,
  ops: (q) => `מסודר. ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}צ'קליסט תפעול:\n\n☑ אשר זמינות טכנאי ליום ההתקנה\n☑ ודא מלאי: מצלמות, מסכים, איתורן\n☑ שלח ללקוח אישור + שעה\n☑ סגירה: חתימה + תשלום\n\n➤ הצעד הבא: עבור על ההתקנות של השבוע. (חבר מפתח Groq ל-AI מלא.)`,
  cmo: (q) => `יאללה תוכן 🎬 ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}רעיון מהיר:\n\nהוק: "ככה גנב מנסה לפרוץ למשאית — וזה מה שעוצר אותו 👇"\nגוף: הדגמת מצלמה/איתורן בפעולה.\nCTA: "רוצה מיגון כזה? שלח לנו הודעה."\n\n➤ הצעד הבא: צלם 15 שניות מהשטח. (חבר מפתח Groq ל-AI מלא.)`,
  dev: (q) => `מבין. ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}תכנון מהיר:\n\n• מיקום: קומפוננטה חדשה תחת ה-App הרלוונטי.\n• State: localStorage לשמירה, מתעדכן בזמן אמת.\n• UI: כרטיס זכוכית בעיצוב הקיים (זהב/כהה).\n\n➤ הצעד הבא: אגדיר את הקומפוננטה ואחבר ל-nav. (חבר מפתח Groq ל-AI מלא.)`,
  auto: (q) => `מחבר חוטים ⚡ ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}אוטומציה מוצעת:\n\nטריגר: ליד חדש נכנס ל-CRM\n→ פעולה: הודעת וואטסאפ אוטומטית + תזכורת מעקב ל-3 ימים\n→ תוצאה: 0 לידים נופלים בין הכיסאות.\n\n➤ הצעד הבא: נגדיר את הטריגר הראשון. (חבר מפתח Groq ל-AI מלא.)`,
  data: (q) => `בודקת נתונים 📊 ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}מדדים שחשוב לעקוב:\n\n• אחוז המרה ליד→עסקה\n• זמן ממוצע לסגירה\n• שווי פייפליין פתוח\n• לידים חמים שלא טופלו\n\n➤ הצעד הבא: נתחיל ממעקב אחוז ההמרה. (חבר מפתח Groq ל-AI מלא.)`,
  cs: (q) => `כאן בשבילך 💗 ${q ? `לגבי "${q.slice(0, 40)}" — ` : ""}תסריט מענה:\n\n"שלום [שם], תודה שפנית — אני כאן בדיוק בשביל זה. בוא נסדר את זה ביחד עכשיו. ספר לי בדיוק מה קרה ואני דואג לפתרון מהיר."\n\n➤ הצעד הבא: צור קשר יזום עם לקוח אחד מהשבוע. (חבר מפתח Groq ל-AI מלא.)`,
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
function RosterView({ onOpen, activity }) {
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
  const [tasks, setTasks] = useState(() => load(K_DEVTASKS, []));
  const [gh, setGh] = useState(ghConfigured());
  useEffect(() => save(K_DEVTASKS, tasks), [tasks]);

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
        <p>תאר מה לבנות — ליאו מנסח בריף מדויק על הקוד האמיתי, ושולח לביצוע</p>
      </div>

      <div className="ac-dev-leo" style={{ "--c": leo.color, "--ac": leo.accent }}>
        <div className="ac-dev-orb"><Face agent={leo} fallback={20} /></div>
        <div className="ac-dev-leo-txt"><b>ליאו · מחובר למאגר</b><span><GitBranch size={11} /> {ghCfg().owner}/{ghCfg().repo}</span></div>
        <div className={"ac-dev-ghchip " + (gh ? "on" : "")}>{gh ? <><Check size={12} /> GitHub מחובר</> : <>לא מחובר</>}</div>
      </div>

      <textarea className="ac-dev-in" value={req} onChange={(e) => setReq(e.target.value)} placeholder="לדוגמה: הוסף כפתור ייצוא PDF למסך העסקאות ב-CRM של איתי…" dir="rtl" rows={3} />
      <button className="ac-dev-gen" onClick={genBrief} disabled={busy || !req.trim()}>
        {busy ? <><RefreshCw size={16} className="ac-spin" /> ליאו עובד…</> : <><Code2 size={16} /> נסח בריף פיתוח</>}
      </button>

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
        <p className="ac-set-note">חבר טוקן GitHub אישי כדי שליאו יוכל לפתוח משימות (Issues) על המאגר ישירות מחדר הפיתוח. 🔒 הטוקן נשמר רק במכשיר שלך (localStorage) — לעולם לא נשלח לשום מקום חוץ מ-GitHub ולא נכנס לקוד.</p>
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
          <li><b>חדר פיתוח</b> — ליאו מנסח בריף על הקוד האמיתי → Issue במאגר או משימה ל-Claude Code.</li>
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

/* ── toast ── */
.ac-toast{position:fixed;bottom:92px;left:50%;transform:translateX(-50%);z-index:300;
  background:linear-gradient(135deg,rgba(14,12,28,.98),rgba(6,6,14,.98));border:1px solid var(--gold);color:var(--gold);
  padding:12px 20px;border-radius:13px;font-size:13.5px;font-weight:800;box-shadow:0 8px 40px rgba(228,188,99,.3);
  backdrop-filter:blur(14px);animation:acRise .25s ease both;max-width:90vw;text-align:center}
`}</style>;
}
