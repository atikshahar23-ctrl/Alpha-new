import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus, X, Trash2, Search, Phone, Mail, MapPin, Building2, Users, Wallet, Tag,
  Globe, ChevronLeft, MessageSquare, Pencil, Target, Bell, FileText, TrendingUp,
  CheckCircle2, Handshake, LayoutDashboard, UserRound, Send, Copy, Briefcase,
} from "lucide-react";
import BULL_LOGO from "../heavyguard/heavyguard-logo.png";
import leadsData from "../heavyguard/leadsData.json";

/* ============================ Constants ============================ */
const BIZ = "Heavy Guard";
const VAT = 0.18; // מע"מ ישראל
const CRM_STATUSES = ["חדש", "פנייה ראשונה", "בתהליך", "הצעה נשלחה", "לקוח", "אבד"];
const CRM_COLOR = { "חדש": "#8E9BAB", "פנייה ראשונה": "#6FD3F0", "בתהליך": "#E4BC63", "הצעה נשלחה": "#8b5cf6", "לקוח": "#3FD79A", "אבד": "#FF5C50" };
const GEO_OPTS = ["צפון", "מרכז", "דרום", "שרון", "שפלה", "ירושלים"];
const OUTREACH_TYPES = ["שיחה", "וואטסאפ", "מייל", "פגישה", "הודעה", "אחר"];
const OUTREACH_RESULTS = ["חיובי", "אין מענה", "שלילי", "מעניין", "לחזור"];
const DEAL_STATES = ["פתוח", "נסגר", "אבד"];
const DEAL_COLOR = { "פתוח": "#E4BC63", "נסגר": "#3FD79A", "אבד": "#FF5C50" };

/* ============================ Storage (itai namespace) ============================ */
const K_CRM = "itai:crm";       // { [leadId]: { crmStatus, crmNotes, outreach:[] } }
const K_DEALS = "itai:deals";   // [ {id, leadId, name, phone, items, subtotal, vat, total, status, note, createdAt, wonAt} ]
const K_CUST = "itai:customers"; // [ {id, name, phone, email, city, notes, source} ]
const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* ============================ Helpers ============================ */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const ils = (n) => "₪" + (Number(n) || 0).toLocaleString("he-IL");
const todayISO = () => new Date().toISOString().slice(0, 10);
const dmy = (iso) => { try { const d = new Date(iso); return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`; } catch { return iso; } };
// Heavy Guard company profile + quote defaults — kept 1:1 with the HeavyGuard app.
const HG_COMPANY = { name: "Heavy Guard", brand: "HEAVY GUARD", address: "דן 7, ראשל\"צ", taxId: "305794067", phone: "054-771-9070" };
const HG_QUOTE_NOTES = ["דמי מנוי בכרטיס אשראי לחברת סמסוניקס +₪60+מע\"מ", "התקנה בבית הלקוח", "אחריות לשנה על המוצרים וההתקנה"];
const HG_QUOTE_PAY = "ניתן לשלם באשראי או בהעברה בנקאית לחשבון 1087434, בנק לאומי (10) סניף 739. עד 3 תשלומים ללא ריבית.";
// Continue the SAME quote counter the HeavyGuard app uses (shared localStorage).
const nextQuoteNumber = () => { try { let n = JSON.parse(localStorage.getItem("hg2:quoteseq") || "387"); n = (Number(n) || 387) + 1; localStorage.setItem("hg2:quoteseq", JSON.stringify(n)); return n; } catch { return Math.floor(Date.now() / 1000) % 100000; } };
const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const telLink = (p) => `tel:${(p || "").replace(/\s/g, "")}`;
const waLink = (phone, text) => { let p = (phone || "").replace(/\D/g, ""); if (p.startsWith("0")) p = "972" + p.slice(1); return `https://wa.me/${p}?text=${encodeURIComponent(text || "")}`; };
const dealTotals = (items, discountPct = 0) => {
  const gross = items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);
  const pct = Math.max(0, Math.min(15, Number(discountPct) || 0));
  const discount = Math.round(gross * pct / 100);
  const subtotal = gross - discount;
  const vat = Math.round(subtotal * VAT);
  return { gross, discount, discountPct: pct, subtotal, vat, total: subtotal + vat };
};

/* ── Me caller-ID app: copy the number for instant paste (the core ask), then
   best-effort hop to the phone's Me app. No guessed deep-link that could show a
   broken page — copy always works and Me reads the clipboard on open. ── */
const copyText = async (t) => { try { await navigator.clipboard.writeText(t); return true; } catch { try { const ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); return true; } catch { return false; } } };
const meLookup = async (phone, showToast) => {
  const num = (phone || "").replace(/\s/g, "");
  const ok = await copyText(num);
  showToast(ok ? "המספר הועתק ✓ פתח את Me והדבק לחיפוש" : "העתק ידנית: " + num);
};

/* ── Israel city → coordinates (covers the bulk of the lead base). Names are
   normalised (strips "ישוב ", common variants) before lookup. ── */
const CITY_COORDS = {
  "ירושלים": [31.7683, 35.2137], "תל אביב יפו": [32.0853, 34.7818], "תל אביב": [32.0853, 34.7818],
  "חיפה": [32.7940, 34.9896], "ראשון לציון": [31.9730, 34.8066], "פתח תקווה": [32.0840, 34.8878],
  "אשדוד": [31.8014, 34.6435], "נתניה": [32.3215, 34.8532], "באר שבע": [31.2520, 34.7915],
  "בני ברק": [32.0807, 34.8338], "חולון": [32.0167, 34.7795], "רמת גן": [32.0700, 34.8245],
  "אשקלון": [31.6688, 34.5715], "רחובות": [31.8928, 34.8113], "בת ים": [32.0231, 34.7503],
  "כפר סבא": [32.1750, 34.9070], "הרצליה": [32.1624, 34.8447], "חדרה": [32.4340, 34.9196],
  "מודיעין": [31.8980, 35.0104], "נצרת": [32.7019, 35.2978], "רמלה": [31.9288, 34.8667],
  "לוד": [31.9514, 34.8953], "רעננה": [32.1848, 34.8713], "רהט": [31.3920, 34.7544],
  "אילת": [29.5577, 34.9519], "עכו": [32.9281, 35.0818], "נהריה": [33.0085, 35.0950],
  "קרית אתא": [32.8110, 35.1130], "קרית גת": [31.6100, 34.7642], "קרית ביאליק": [32.8307, 35.0865],
  "קרית מוצקין": [32.8380, 35.0760], "קרית ים": [32.8480, 35.0680], "טבריה": [32.7959, 35.5300],
  "צפת": [32.9646, 35.4960], "דימונה": [31.0707, 35.0327], "אופקים": [31.3147, 34.6200],
  "שדרות": [31.5249, 34.5963], "נס ציונה": [31.9293, 34.7986], "יבנה": [31.8783, 34.7390],
  "טייבה": [32.2660, 35.0090], "טירה": [32.2340, 34.9510], "אום אל פחם": [32.5160, 35.1530],
  "כפר קאסם": [32.1140, 34.9760], "באקה אל גרביה": [32.4170, 35.0370], "טמרה": [32.8520, 35.1980],
  "סחנין": [32.8650, 35.2980], "שפרעם": [32.8060, 35.1690], "מעלות תרשיחא": [33.0160, 35.2700],
  "כרמיאל": [32.9170, 35.2920], "עפולה": [32.6078, 35.2897], "בית שאן": [32.4969, 35.4997],
  "בית שמש": [31.7497, 34.9886], "מגדל העמק": [32.6750, 35.2410], "יקנעם": [32.6580, 35.1100],
  "נוף הגליל": [32.7090, 35.3170], "ערד": [31.2590, 35.2120], "נתיבות": [31.4220, 34.5950],
  "קרית שמונה": [33.2070, 35.5700], "זכרון יעקב": [32.5720, 34.9530], "פרדס חנה כרכור": [32.4750, 34.9740],
  "אזור": [32.0290, 34.8000], "גבעתיים": [32.0720, 34.8120], "אור יהודה": [32.0300, 34.8530],
  "יהוד": [32.0330, 34.8890], "ראש העין": [32.0956, 34.9560], "טורעאן": [32.7790, 35.3760],
  "דבורייה": [32.6960, 35.3760], "עראבה": [32.8510, 35.3370], "מעלה אדומים": [31.7730, 35.2980],
  "גבעת שמואל": [32.0780, 34.8480], "כפר יונה": [32.3170, 34.9340], "קצרין": [32.9920, 35.6900],
};
const REGION_CENTROID = { "צפון": [32.85, 35.25], "מרכז": [32.05, 34.85], "דרום": [31.25, 34.79], "שרון": [32.30, 34.90], "שפלה": [31.90, 34.85], "ירושלים": [31.77, 35.21] };
const normCity = (c) => (c || "").replace(/^ישוב\s+/, "").replace(/^עיריית\s+/, "").trim();
const cityCoords = (city) => CITY_COORDS[normCity(city)] || null;
// Stable per-id jitter so many businesses in one city fan out instead of stacking.
const jitter = (id, amp = 0.02) => { let h = 0; const s = String(id); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return [((h % 1000) / 1000 - 0.5) * amp, (((h >> 10) % 1000) / 1000 - 0.5) * amp]; };
const geoFor = (lead) => {
  const c = cityCoords(lead.city);
  const j = jitter(lead.id);
  if (c) return [c[0] + j[0], c[1] + j[1]];
  const r = REGION_CENTROID[lead.geo];
  return r ? [r[0] + j[0] * 3, r[1] + j[1] * 3] : null;
};
const wazeTo = (lead) => { const c = cityCoords(lead.city); if (c) return `https://waze.com/ul?ll=${c[0]},${c[1]}&navigate=yes`; const q = encodeURIComponent([lead.addr, lead.city].filter(Boolean).join(" ")); return `https://waze.com/ul?q=${q}&navigate=yes`; };

/* ── Leaflet + MarkerCluster loader (CDN, once). Clustering lets the whole
   lead base (thousands of pins) render smoothly. ── */
const addCss = (href) => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; document.head.appendChild(l); };
const addJs = (src) => new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
let _leafletPromise = null;
const loadLeaflet = () => {
  if (window.L && window.L.markerClusterGroup) return Promise.resolve(window.L);
  if (_leafletPromise) return _leafletPromise;
  _leafletPromise = (async () => {
    if (!window.L) { addCss("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"); await addJs("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"); }
    try {
      addCss("https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css");
      addCss("https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css");
      await addJs("https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js");
    } catch { /* clustering optional — falls back to a plain layer group */ }
    return window.L;
  })();
  return _leafletPromise;
};

/* ── HeavyGuard pricelist — read LIVE from the shared (same-origin) storage so
   it always matches HeavyGuard and updates whenever HeavyGuard changes it. ── */
const HG_PRICELIST_KEY = "hg2:pricelist";
const DEFAULT_PRICES = [
  { id: "p1", name: "איתוראן 2 מערכות", price: 300 },
  { id: "p2", name: "איתוראן 3 מערכות", price: 400 },
  { id: "p3", name: "מצלמת רוורס + מסך", price: 1000 },
  { id: "p4", name: "סט מסך חכם 4 מצלמות", price: 3500 },
  { id: "p5", name: "פוינטר TOP רב קודן", price: 150 },
];
const loadHgPricelist = () => {
  try { const v = localStorage.getItem(HG_PRICELIST_KEY); const a = v ? JSON.parse(v) : null; return (Array.isArray(a) && a.length) ? a : DEFAULT_PRICES; }
  catch { return DEFAULT_PRICES; }
};
function useHgPricelist() {
  const [pl, setPl] = useState(loadHgPricelist);
  useEffect(() => {
    const refresh = () => setPl(loadHgPricelist());
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const iv = setInterval(refresh, 5000);   // pick up HeavyGuard edits while open
    return () => { window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); clearInterval(iv); };
  }, []);
  return pl;
}
const HG_SITE = "https://heavygurad.com";
const FB_URL = "https://www.facebook.com/share/18k1Sn62EM/";
const TT_URL = "https://www.tiktok.com/@heavy.guard?_r=1&_t=ZS-97cp13u5MKV";

/* ============================ Root App ============================ */
export default function App() {
  const [tab, setTab] = useState("home");
  const [crm, setCrm] = useState(() => load(K_CRM, {}));
  const [deals, setDeals] = useState(() => load(K_DEALS, []));
  const [custs, setCusts] = useState(() => load(K_CUST, []));
  const [toast, setToast] = useState(null);
  const [dealDraft, setDealDraft] = useState(null); // {lead?, deal?} open editor when set

  const leads = useMemo(() => leadsData.map((l) => ({
    ...l,
    crmStatus: crm[l.id]?.crmStatus || (l.xStatus === "לקוח" ? "לקוח" : "חדש"),
    crmNotes: crm[l.id]?.crmNotes || "",
    outreach: crm[l.id]?.outreach || [],
  })), [crm]);

  const showToast = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); }, []);

  const updateCrm = useCallback((id, changes) => {
    setCrm((prev) => { const next = { ...prev, [id]: { ...prev[id], ...changes } }; save(K_CRM, next); return next; });
  }, []);
  const addOutreach = useCallback((id, entry) => {
    setCrm((prev) => { const cur = prev[id] || {}; const next = { ...prev, [id]: { ...cur, outreach: [entry, ...(cur.outreach || [])] } }; save(K_CRM, next); return next; });
  }, []);

  const upsertDeal = useCallback((deal) => {
    setDeals((prev) => {
      const exists = prev.some((d) => d.id === deal.id);
      const next = exists ? prev.map((d) => (d.id === deal.id ? deal : d)) : [deal, ...prev];
      save(K_DEALS, next); return next;
    });
  }, []);
  const removeDeal = useCallback((id) => { setDeals((prev) => { const next = prev.filter((d) => d.id !== id); save(K_DEALS, next); return next; }); }, []);

  const addCustomer = useCallback((c) => {
    setCusts((prev) => {
      if (c.phone && prev.some((x) => x.phone === c.phone)) return prev; // de-dupe by phone
      const next = [{ ...c, id: c.id || uid() }, ...prev]; save(K_CUST, next); return next;
    });
  }, []);
  const saveCustomer = useCallback((c) => {
    setCusts((prev) => { const next = c.id && prev.some((x) => x.id === c.id) ? prev.map((x) => (x.id === c.id ? c : x)) : [{ ...c, id: uid() }, ...prev]; save(K_CUST, next); return next; });
  }, []);
  const removeCustomer = useCallback((id) => { setCusts((prev) => { const next = prev.filter((x) => x.id !== id); save(K_CUST, next); return next; }); }, []);

  // Closing a deal as "won" promotes the lead to customer.
  const winDeal = useCallback((deal, lead) => {
    upsertDeal({ ...deal, status: "נסגר", wonAt: todayISO() });
    updateCrm(deal.leadId, { crmStatus: "לקוח" });
    if (lead || deal.name) addCustomer({ name: deal.name || lead?.n, phone: deal.phone || (lead?.phones || [])[0] || "", email: lead?.e || "", city: lead?.city || "", notes: `נסגרה עסקה: ${ils(deal.total)}`, source: "עסקה" });
    showToast("מזל טוב! העסקה נסגרה והלקוח נוסף 🎉");
  }, [upsertDeal, updateCrm, addCustomer, showToast]);

  const exitToAlpha = () => { try { window.close(); } catch {} setTimeout(() => { window.location.href = "./"; }, 120); };

  return (
    <div className="ag">
      <StyleTag />
      {tab === "home" && <Dashboard leads={leads} deals={deals} custs={custs} go={setTab} onNewDeal={() => setDealDraft({})} showToast={showToast} />}
      {tab === "leads" && <LeadsView leads={leads} updateCrm={updateCrm} addOutreach={addOutreach} onDeal={(lead) => setDealDraft({ lead })} dealsFor={(id) => deals.filter((d) => d.leadId === id)} showToast={showToast} />}
      {tab === "deals" && <DealsView deals={deals} leads={leads} onEdit={(deal) => setDealDraft({ deal })} onNew={() => setDealDraft({})} onWin={winDeal} onRemove={removeDeal} showToast={showToast} />}
      {tab === "custs" && <CustomersView custs={custs} onSave={saveCustomer} onRemove={removeCustomer} showToast={showToast} />}
      {tab === "map" && <MapView leads={leads} custs={custs} deals={deals} showToast={showToast} />}

      <nav className="ag-nav">
        <button className={tab === "home" ? "on" : ""} onClick={() => setTab("home")}><LayoutDashboard size={20} /><span>בקרה</span></button>
        <button className={tab === "leads" ? "on" : ""} onClick={() => setTab("leads")}><Target size={20} /><span>לידים</span></button>
        <button className={tab === "map" ? "on" : ""} onClick={() => setTab("map")}><MapPin size={20} /><span>מפה</span></button>
        <button className={tab === "deals" ? "on" : ""} onClick={() => setTab("deals")}><Handshake size={20} /><span>עסקאות</span></button>
        <button className={tab === "custs" ? "on" : ""} onClick={() => setTab("custs")}><UserRound size={20} /><span>לקוחות</span></button>
        <button className="ag-nav-exit" onClick={exitToAlpha}><ChevronLeft size={20} /><span>יציאה</span></button>
      </nav>

      {dealDraft && (
        <DealEditor
          lead={dealDraft.lead}
          deal={dealDraft.deal}
          leads={leads}
          onClose={() => setDealDraft(null)}
          onSave={(d) => { upsertDeal(d); setDealDraft(null); showToast("העסקה נשמרה"); }}
          showToast={showToast}
        />
      )}
      {toast && <div className="ag-toast">{toast}</div>}
    </div>
  );
}

/* ============================ Dashboard ============================ */
function Dashboard({ leads, deals, custs, go, onNewDeal, showToast }) {
  const k = monthKey();
  const open = deals.filter((d) => d.status === "פתוח");
  const wonMonth = deals.filter((d) => d.status === "נסגר" && (d.wonAt || "").startsWith(k));
  const openValue = open.reduce((s, d) => s + (d.total || 0), 0);
  const wonValue = wonMonth.reduce((s, d) => s + (d.total || 0), 0);
  const inProgress = leads.filter((l) => ["פנייה ראשונה", "בתהליך", "הצעה נשלחה"].includes(l.crmStatus)).length;
  const wonAll = deals.filter((d) => d.status === "נסגר");
  const conv = deals.length ? Math.round((wonAll.length / deals.length) * 100) : 0;

  const shareWorks = async () => {
    const text = `הנה עבודות וההמלצות שלנו ב-${BIZ} 🚛🛡️\nאתר: ${HG_SITE}\nFacebook: ${FB_URL}\nTikTok: ${TT_URL}`;
    try { if (navigator.share) { await navigator.share({ title: BIZ, text }); return; } } catch { return; }
    const ok = await copyText(text); showToast && showToast(ok ? "הקישורים הועתקו — הדבק ושלח ללקוח" : "העתקה נכשלה");
  };

  return (
    <div className="ag-flow">
      <header className="ag-head">
        <img src={BULL_LOGO} className="ag-logo" alt="" />
        <div style={{ flex: 1 }}><div className="ag-title">CRM מכירות · איתי</div><div className="ag-sub">{BIZ} — ניהול לידים ועסקאות</div></div>
        <div className="ag-links">
          <a className="ag-site" href={HG_SITE} target="_blank" rel="noreferrer" title="heavygurad.com">
            <img src={BULL_LOGO} alt="" /><span>האתר</span>
          </a>
          <a className="ag-soc fb" href={FB_URL} target="_blank" rel="noreferrer" title="Facebook — עבודות" aria-label="Facebook">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z"/></svg>
          </a>
          <a className="ag-soc tt" href={TT_URL} target="_blank" rel="noreferrer" title="TikTok — עבודות" aria-label="TikTok">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16.5 3c.3 2.3 1.6 3.7 3.8 3.9v2.5c-1.3.1-2.5-.3-3.8-1v5.9c0 4.6-3.7 6.9-7 5.4-2.6-1.2-3.4-4.6-1.6-6.9 1-1.3 2.6-2 4.5-1.7v2.6c-.4-.1-.8-.2-1.3-.1-1 .1-1.7.8-1.7 1.8 0 1.2 1.1 2 2.3 1.7 1-.3 1.5-1.1 1.5-2.2V3h2.6z"/></svg>
          </a>
          <button className="ag-soc send" onClick={shareWorks} title="שלח עבודות ללקוח" aria-label="שלח עבודות"><Send size={15} /></button>
        </div>
      </header>

      <div className="ag-kpis">
        <button className="ag-kpi" onClick={() => go("leads")}><b>{leads.length.toLocaleString()}</b><span>לידים במאגר</span></button>
        <button className="ag-kpi" onClick={() => go("leads")}><b>{inProgress.toLocaleString()}</b><span>בתהליך</span></button>
        <button className="ag-kpi" onClick={() => go("deals")}><b className="cy">{open.length}</b><span>עסקאות פתוחות</span></button>
        <button className="ag-kpi" onClick={() => go("custs")}><b className="ok">{custs.length}</b><span>לקוחות</span></button>
      </div>

      <div className="ag-card big">
        <div className="ag-card-row"><span><Briefcase size={15} /> שווי צבר פתוח</span><b className="cy">{ils(openValue)}</b></div>
        <div className="ag-card-row"><span><TrendingUp size={15} /> נסגר החודש</span><b className="ok">{ils(wonValue)}</b></div>
        <div className="ag-card-row"><span><CheckCircle2 size={15} /> אחוז סגירה</span><b>{conv}%</b></div>
      </div>

      <button className="ag-cta" onClick={onNewDeal}><Plus size={20} /> עסקה חדשה</button>

      <AssistantPanel leads={leads} deals={deals} custs={custs} go={go} onNewDeal={onNewDeal} showToast={showToast} />

      <button className="ag-mapcard" onClick={() => go("map")}>
        <div className="ag-mapcard-glow" />
        <div className="ag-mapcard-txt"><b><MapPin size={15} /> מפת העסקים · ארץ ישראל</b><span>צפה בלקוחות והלידים על המפה ותכנן מסלול פגישות</span></div>
        <ChevronLeft size={22} />
      </button>

      <div className="ag-secttl">עסקאות אחרונות</div>
      {deals.length === 0 && <div className="ag-empty"><Handshake size={32} /><div>אין עדיין עסקאות</div><p>פתח ליד וצור הצעת מחיר כדי להתחיל</p></div>}
      {deals.slice(0, 5).map((d) => (
        <button className="ag-deal-row" key={d.id} onClick={() => go("deals")}>
          <span className="ag-dot" style={{ background: DEAL_COLOR[d.status] }} />
          <div className="ag-deal-mid"><b>{d.name || "ללא שם"}</b><span>{d.items.length} פריטים · {d.createdAt}</span></div>
          <div className="ag-deal-val">{ils(d.total)}</div>
        </button>
      ))}
    </div>
  );
}

/* ============================ Leads ============================ */
function LeadsView({ leads, updateCrm, addOutreach, onDeal, dealsFor, showToast }) {
  const [search, setSearch] = useState("");
  const [geo, setGeo] = useState("");
  const [status, setStatus] = useState("");
  const [sel, setSel] = useState(null);
  const [page, setPage] = useState(0);
  const PAGE = 50;

  const filtered = useMemo(() => leads.filter((l) => {
    if (geo && l.geo !== geo) return false;
    if (status && l.crmStatus !== status) return false;
    if (search) { const q = search.toLowerCase(); return (l.n || "").toLowerCase().includes(q) || (l.city || "").toLowerCase().includes(q) || (l.sector || "").toLowerCase().includes(q) || (l.phones || []).some((p) => p.includes(q)); }
    return true;
  }), [leads, search, geo, status]);
  const paged = filtered.slice(0, (page + 1) * PAGE);

  const selLead = sel ? leads.find((l) => l.id === sel) : null;
  if (selLead) return (
    <LeadDetail lead={selLead} onBack={() => setSel(null)}
      onStatus={(s) => updateCrm(selLead.id, { crmStatus: s })}
      onNotes={(n) => updateCrm(selLead.id, { crmNotes: n })}
      onOutreach={(e) => addOutreach(selLead.id, e)}
      onDeal={() => onDeal(selLead)} deals={dealsFor(selLead.id)} showToast={showToast} />
  );

  return (
    <div className="ag-flow">
      <header className="ag-head sm"><div><div className="ag-title">ניהול לידים</div><div className="ag-sub">{filtered.length.toLocaleString()} תוצאות</div></div></header>
      <div className="ag-searchbox"><Search size={15} /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="חיפוש שם, עיר, תחום, טלפון…" dir="rtl" />{search && <button onClick={() => setSearch("")}><X size={14} /></button>}</div>
      <div className="ag-chips">
        <button className={!geo ? "on" : ""} onClick={() => { setGeo(""); setPage(0); }}>הכל</button>
        {GEO_OPTS.map((g) => <button key={g} className={geo === g ? "on" : ""} onClick={() => { setGeo(g); setPage(0); }}>{g}</button>)}
      </div>
      <div className="ag-chips sm">
        <button className={!status ? "on" : ""} onClick={() => { setStatus(""); setPage(0); }}>כל הסטטוסים</button>
        {CRM_STATUSES.map((s) => <button key={s} className={status === s ? "on" : ""} style={{ "--sc": CRM_COLOR[s] }} onClick={() => { setStatus(s); setPage(0); }}>{s}</button>)}
      </div>
      {paged.map((l) => <LeadCard key={l.id} lead={l} onClick={() => setSel(l.id)} />)}
      {filtered.length > paged.length && <button className="ag-more" onClick={() => setPage((p) => p + 1)}>טען עוד · {(filtered.length - paged.length).toLocaleString()} נותרו</button>}
      {filtered.length === 0 && <div className="ag-empty"><Target size={32} /><div>אין תוצאות</div></div>}
    </div>
  );
}

function LeadCard({ lead, onClick }) {
  const color = CRM_COLOR[lead.crmStatus] || "#8E9BAB";
  return (
    <button className="ag-card lead" onClick={onClick}>
      <div className="ag-card-top"><div className="ag-card-name">{lead.n}</div><span className="ag-badge" style={{ background: color + "22", color, border: `1px solid ${color}55` }}>{lead.crmStatus}</span></div>
      <div className="ag-card-meta">
        {lead.city && <span><MapPin size={11} />{lead.city}</span>}
        {(lead.phones || [])[0] && <span><Phone size={11} />{lead.phones[0]}</span>}
        {lead.outreach?.length > 0 && <span className="ag-act"><Bell size={10} />{lead.outreach.length}</span>}
      </div>
      {lead.sector && <div className="ag-card-sector">{lead.sector}</div>}
    </button>
  );
}

function LeadDetail({ lead, onBack, onStatus, onNotes, onOutreach, onDeal, deals, showToast }) {
  const [notes, setNotes] = useState(lead.crmNotes || "");
  const [showAdd, setShowAdd] = useState(false);
  const [oType, setOType] = useState("שיחה");
  const [oResult, setOResult] = useState("חיובי");
  const [oNotes, setONotes] = useState("");

  const submitOut = () => {
    if (!oNotes.trim()) { showToast("הוסף פרטי פנייה"); return; }
    onOutreach({ id: uid(), type: oType, result: oResult, notes: oNotes.trim(), date: todayISO() });
    setONotes(""); setShowAdd(false); showToast("הפנייה נרשמה");
  };

  return (
    <div className="ag-flow">
      <header className="ag-head sm"><button className="ag-back" onClick={onBack}><ChevronLeft size={22} /></button><div style={{ flex: 1, minWidth: 0 }}><div className="ag-title" style={{ fontSize: 16 }}>{lead.n}</div><div className="ag-sub">{[lead.city, lead.geo].filter(Boolean).join(" · ")}</div></div></header>

      <div className="ag-pipeline">{CRM_STATUSES.map((s) => <button key={s} className={"ag-pipe" + (lead.crmStatus === s ? " on" : "")} style={{ "--sc": CRM_COLOR[s] }} onClick={() => onStatus(s)}>{s}</button>)}</div>

      <button className="ag-cta" onClick={onDeal}><FileText size={18} /> צור / שלח הצעת מחיר</button>

      {deals.length > 0 && (
        <div className="ag-section">
          <div className="ag-section-ttl">עסקאות לליד זה ({deals.length})</div>
          {deals.map((d) => <div className="ag-deal-row flat" key={d.id}><span className="ag-dot" style={{ background: DEAL_COLOR[d.status] }} /><div className="ag-deal-mid"><b>{d.status}</b><span>{d.items.length} פריטים · {d.createdAt}</span></div><div className="ag-deal-val">{ils(d.total)}</div></div>)}
        </div>
      )}

      <div className="ag-section">
        <div className="ag-section-ttl">טלפונים{(lead.phones || []).length > 1 ? ` (${lead.phones.length})` : ""}</div>
        {(lead.phones || []).length === 0 && <div className="ag-empty sm">אין מספרי טלפון לליד זה</div>}
        {(lead.phones || []).map((p, i) => (
          <div key={i} className="ag-phone">
            <Phone size={14} className="ag-phone-ic" />
            <span className="ag-phone-num" dir="ltr">{p}</span>
            <a href={telLink(p)} className="ag-phone-btn"><Phone size={13} /> חייג</a>
            <button onClick={() => meLookup(p, showToast)} className="ag-phone-btn me"><Copy size={13} /> Me · העתק</button>
          </div>
        ))}
        {lead.e && <a href={`mailto:${lead.e}`} className="ag-info"><Mail size={13} /><span className="ag-trunc">{lead.e}</span></a>}
        {lead.addr && <div className="ag-info"><MapPin size={13} />{lead.addr}, {lead.city}</div>}
        {lead.w && <div className="ag-info"><Globe size={13} /><span className="ag-trunc">{lead.w}</span></div>}
      </div>

      <div className="ag-section">
        <div className="ag-section-ttl">פרטי עסק</div>
        {lead.sector && <div className="ag-info"><Building2 size={13} />{lead.sector}</div>}
        {lead.emp && <div className="ag-info"><Users size={13} />{lead.emp} מועסקים</div>}
        {lead.rev && <div className="ag-info"><Wallet size={13} />מחזור: ₪{Number(lead.rev).toLocaleString()} אלף</div>}
        {lead.activity && <div className="ag-info"><Tag size={13} />{lead.activity.replace(/;/g, " · ")}</div>}
      </div>

      {(lead.mgrs || []).length > 0 && (
        <div className="ag-section">
          <div className="ag-section-ttl">אנשי קשר ({lead.mgrs.length})</div>
          {(lead.phones || []).length > 0 && <div className="ag-note-line">המספרים הם קווי העסק — חייג/שלח וואטסאפ אל איש הקשר דרכם</div>}
          {lead.mgrs.slice(0, 12).map((m, i) => {
            const phone = (lead.phones || [])[0];
            return (
              <div key={i} className="ag-person">
                <div className="ag-person-top">
                  <span className="ag-mgr-name">{m.n}</span>
                  {m.r && <span className="ag-mgr-role">{m.r}</span>}
                </div>
                {phone && <div className="ag-person-phone" dir="ltr"><Phone size={11} /> {phone}</div>}
                <div className="ag-person-acts">
                  {phone && <a href={telLink(phone)} className="ag-person-btn"><Phone size={12} /> חייג</a>}
                  {phone && <button onClick={() => meLookup(phone, showToast)} className="ag-person-btn me"><Copy size={12} /> Me · העתק</button>}
                  {m.e && <a href={`mailto:${m.e}`} className="ag-person-btn"><Mail size={12} /> מייל</a>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="ag-section">
        <div className="ag-section-ttl">הערות</div>
        <textarea className="ag-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="הערות אישיות על הליד…" rows={3} dir="rtl" />
        <button className="ag-btn" onClick={() => { onNotes(notes); showToast("ההערות נשמרו"); }}>שמור הערות</button>
      </div>

      <div className="ag-section">
        <div className="ag-section-ttl-row"><span className="ag-section-ttl">יומן פניות ({lead.outreach.length})</span><button className="ag-mini" onClick={() => setShowAdd((v) => !v)}>+ פנייה</button></div>
        {showAdd && (
          <div className="ag-addform">
            <div className="ag-row"><select value={oType} onChange={(e) => setOType(e.target.value)} className="ag-select">{OUTREACH_TYPES.map((t) => <option key={t}>{t}</option>)}</select><select value={oResult} onChange={(e) => setOResult(e.target.value)} className="ag-select">{OUTREACH_RESULTS.map((r) => <option key={r}>{r}</option>)}</select></div>
            <textarea value={oNotes} onChange={(e) => setONotes(e.target.value)} placeholder="פרטי הפנייה…" rows={2} className="ag-textarea" dir="rtl" />
            <div className="ag-row"><button className="ag-btn" onClick={submitOut}>שמור</button><button className="ag-btn ghost" onClick={() => setShowAdd(false)}>ביטול</button></div>
          </div>
        )}
        {lead.outreach.length === 0 && !showAdd && <div className="ag-empty sm">אין פניות מתועדות עדיין</div>}
        {lead.outreach.map((e) => (
          <div key={e.id} className="ag-out"><div className="ag-out-h"><span className="ag-out-t">{e.type}</span><span className="ag-out-r">{e.result}</span><span className="ag-out-d">{e.date}</span></div><div className="ag-out-n">{e.notes}</div></div>
        ))}
      </div>
    </div>
  );
}

/* ============================ Deals ============================ */
function DealsView({ deals, leads, onEdit, onNew, onWin, onRemove, showToast }) {
  const [f, setF] = useState("");
  const list = f ? deals.filter((d) => d.status === f) : deals;
  const pipe = deals.filter((d) => d.status === "פתוח").reduce((s, d) => s + (d.total || 0), 0);

  return (
    <div className="ag-flow">
      <header className="ag-head sm"><div><div className="ag-title">עסקאות</div><div className="ag-sub">צבר פתוח: {ils(pipe)}</div></div></header>
      <button className="ag-cta" onClick={onNew}><Plus size={18} /> עסקה חדשה</button>
      <div className="ag-chips sm">
        <button className={!f ? "on" : ""} onClick={() => setF("")}>הכל</button>
        {DEAL_STATES.map((s) => <button key={s} className={f === s ? "on" : ""} style={{ "--sc": DEAL_COLOR[s] }} onClick={() => setF(s)}>{s}</button>)}
      </div>
      {list.length === 0 && <div className="ag-empty"><Handshake size={32} /><div>אין עסקאות</div><p>לחץ "עסקה חדשה" כדי לבנות הצעת מחיר</p></div>}
      {list.map((d) => {
        const lead = leads.find((l) => l.id === d.leadId);
        return (
          <div className="ag-card deal" key={d.id}>
            <div className="ag-card-top"><div className="ag-card-name">{d.name || "ללא שם"}</div><span className="ag-badge" style={{ background: DEAL_COLOR[d.status] + "22", color: DEAL_COLOR[d.status], border: `1px solid ${DEAL_COLOR[d.status]}55` }}>{d.status}</span></div>
            <div className="ag-card-meta"><span>{d.items.length} פריטים</span><span>{d.createdAt}</span><b className="ag-deal-val">{ils(d.total)}</b></div>
            <div className="ag-deal-acts">
              <a className="ag-abtn wa" href={waLink(d.phone, dealMessage(d))} target="_blank" rel="noreferrer"><MessageSquare size={14} /> שלח</a>
              <button className="ag-abtn" onClick={() => onEdit(d)}><Pencil size={14} /> ערוך</button>
              {d.status !== "נסגר" && <button className="ag-abtn ok" onClick={() => onWin(d, lead)}><CheckCircle2 size={14} /> נסגר!</button>}
              <button className="ag-abtn d" onClick={() => onRemove(d.id)}><Trash2 size={14} /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function dealMessage(d) {
  const lines = [`שלום ${d.name || ""},`, `הצעת מחיר מ-${BIZ}:`, ""];
  d.items.forEach((i) => { const lt = (Number(i.price) || 0) * (Number(i.qty) || 1); lines.push(`• ${i.desc} ${(Number(i.qty) || 1) > 1 ? "x" + i.qty : ""} — ${ils(lt)}`); });
  lines.push("");
  if (d.discount > 0) { lines.push(`מחיר מלא: ${ils(d.gross)}`, `הנחה ${d.discountPct}%: −${ils(d.discount)}`); }
  lines.push(`סכום ביניים: ${ils(d.subtotal)}`, `מע"מ (18%): ${ils(d.vat)}`, `סה"כ לתשלום: ${ils(d.total)}`);
  if (d.note) lines.push("", d.note);
  lines.push("", "בברכה, איתי");
  return lines.join("\n");
}

function DealEditor({ lead, deal, leads, onClose, onSave, showToast }) {
  const [name, setName] = useState(deal?.name || lead?.n || "");
  const [phone, setPhone] = useState(deal?.phone || (lead?.phones || [])[0] || "");
  const [leadId, setLeadId] = useState(deal?.leadId || lead?.id || "");
  const [items, setItems] = useState(deal?.items?.length ? deal.items : [{ desc: "", qty: 1, price: "" }]);
  const [note, setNote] = useState(deal?.note || "");
  const [status, setStatus] = useState(deal?.status || "פתוח");
  const [discount, setDiscount] = useState(deal?.discountPct || 0);
  const [linkQ, setLinkQ] = useState("");
  const [showQuote, setShowQuote] = useState(false);
  const pricelist = useHgPricelist();
  const addFromPrice = (p) => setItems((prev) => {
    const clean = prev.filter((it) => it.desc.trim() || it.price);
    return [...clean, { desc: p.name, qty: 1, price: p.price }];
  });

  const t = dealTotals(items, discount);
  const setItem = (i, k, v) => setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
  const addItem = () => setItems((prev) => [...prev, { desc: "", qty: 1, price: "" }]);
  const delItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const linkMatches = useMemo(() => {
    if (!linkQ.trim()) return [];
    const q = linkQ.toLowerCase();
    return leads.filter((l) => (l.n || "").toLowerCase().includes(q) || (l.phones || []).some((p) => p.includes(q))).slice(0, 6);
  }, [linkQ, leads]);

  const build = () => ({
    id: deal?.id || uid(), leadId, name: name.trim(), phone: phone.trim(),
    items: items.filter((i) => i.desc.trim() || i.price),
    gross: t.gross, discountPct: t.discountPct, discount: t.discount, subtotal: t.subtotal, vat: t.vat, total: t.total,
    status, note: note.trim(), createdAt: deal?.createdAt || todayISO(), wonAt: deal?.wonAt || null,
  });
  const doSave = () => { if (!name.trim()) { showToast("הזן שם לקוח/עסק"); return; } onSave(build()); };
  const doSend = () => { if (!phone.trim()) { showToast("הזן טלפון לשליחה"); return; } const d = build(); onSave(d); window.open(waLink(phone, dealMessage(d)), "_blank"); };

  return (
    <div className="ag-modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ag-sheet">
        <div className="ag-sheet-head"><b>{deal ? "עריכת עסקה" : "עסקה חדשה"}</b><button onClick={onClose}><X size={20} /></button></div>
        <div className="ag-sheet-body">
          <label className="ag-lbl">שם לקוח / עסק</label>
          <input className="ag-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="שם" dir="rtl" />
          {!lead && !deal && (
            <>
              <label className="ag-lbl">קשר לליד קיים (אופציונלי)</label>
              <input className="ag-input" value={linkQ} onChange={(e) => setLinkQ(e.target.value)} placeholder="חפש ליד לפי שם/טלפון…" dir="rtl" />
              {linkMatches.map((l) => <button key={l.id} className="ag-link-opt" onClick={() => { setLeadId(l.id); setName(l.n); setPhone((l.phones || [])[0] || ""); setLinkQ(""); }}>{l.n} · {(l.phones || [])[0] || ""}</button>)}
            </>
          )}
          <label className="ag-lbl">טלפון</label>
          <input className="ag-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="050…" dir="ltr" />

          <label className="ag-lbl">מחירון Heavy Guard · לחיצה מוסיפה פריט</label>
          <div className="ag-chips">
            {pricelist.map((p) => (
              <button key={p.id || p.name} type="button" onClick={() => addFromPrice(p)}>{p.name} · {ils(p.price)}</button>
            ))}
          </div>

          <label className="ag-lbl">פריטי הצעה</label>
          {items.map((it, i) => (
            <div className="ag-item" key={i}>
              <input className="ag-input desc" value={it.desc} onChange={(e) => setItem(i, "desc", e.target.value)} placeholder="תיאור פריט/שירות" dir="rtl" />
              <input className="ag-input qty" type="number" min="1" value={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} placeholder="כמ'" />
              <input className="ag-input price" type="number" min="0" value={it.price} onChange={(e) => setItem(i, "price", e.target.value)} placeholder="₪" dir="ltr" />
              {items.length > 1 && <button className="ag-item-del" onClick={() => delItem(i)}><X size={14} /></button>}
            </div>
          ))}
          <button className="ag-additem" onClick={addItem}><Plus size={14} /> הוסף פריט</button>

          <label className="ag-lbl">הנחה ללקוח</label>
          <div className="ag-chips sm nowrap ag-disc">
            {[0, 5, 10, 15].map((p) => <button key={p} className={discount === p ? "on" : ""} onClick={() => setDiscount(p)}>{p === 0 ? "ללא" : p + "%"}</button>)}
          </div>

          <div className="ag-totbox">
            {t.discount > 0 && <div className="ag-totrow"><span>מחיר מלא</span><b>{ils(t.gross)}</b></div>}
            {t.discount > 0 && <div className="ag-totrow disc"><span>הנחה {t.discountPct}%</span><b>−{ils(t.discount)}</b></div>}
            <div className="ag-totrow"><span>סכום ביניים</span><b>{ils(t.subtotal)}</b></div>
            <div className="ag-totrow"><span>מע"מ 18%</span><b>{ils(t.vat)}</b></div>
            <div className="ag-totrow grand"><span>סה"כ</span><b>{ils(t.total)}</b></div>
          </div>

          <label className="ag-lbl">סטטוס</label>
          <div className="ag-chips sm nowrap">{DEAL_STATES.map((s) => <button key={s} className={status === s ? "on" : ""} style={{ "--sc": DEAL_COLOR[s] }} onClick={() => setStatus(s)}>{s}</button>)}</div>

          <label className="ag-lbl">הערה להצעה (אופציונלי)</label>
          <textarea className="ag-textarea" value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="תנאים, תוקף הצעה…" dir="rtl" />
        </div>
        <div className="ag-sheet-foot">
          <button className="ag-btn ghost" onClick={() => { if (!name.trim()) { showToast("הזן שם לקוח/עסק"); return; } setShowQuote(true); }}><FileText size={15} /> מעוצבת</button>
          <button className="ag-btn" onClick={doSave}>שמור</button>
          <button className="ag-btn wa" onClick={doSend}><Send size={15} /> וואטסאפ</button>
        </div>
      </div>
      {showQuote && <DesignedQuote deal={build()} onClose={() => setShowQuote(false)} showToast={showToast} />}
    </div>
  );
}

/* ============================ Designed (branded, printable) quote ============================ */
// Designed quote — a 1:1 replica of the HeavyGuard app's QuoteView (same layout,
// teal letterhead band, company block, table, totals, notes & payment lines).
function DesignedQuote({ deal, onClose, showToast }) {
  const co = HG_COMPANY;
  const number = useMemo(() => nextQuoteNumber(), []);
  const date = todayISO();
  const validUntil = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); }, []);
  const lines = (deal.items || []).filter((i) => (i.desc || "").trim() || i.price).map((i) => ({ name: i.desc, qty: Number(i.qty) || 1, price: Number(i.price) || 0 }));
  const vatRate = 18;
  const notes = HG_QUOTE_NOTES.concat(deal.note ? [deal.note] : []);
  const pay = HG_QUOTE_PAY;
  const text = () => {
    let t = `*הצעת מחיר מספר ${number}* — ${co.name}\nלכבוד: ${deal.name || ""}\nתאריך: ${dmy(date)}\nבתוקף עד: ${dmy(validUntil)}\n\n`;
    lines.forEach((l) => { t += `• ${l.name}${l.qty > 1 ? " ×" + l.qty : ""} — ${ils(l.price * l.qty)}\n`; });
    t += `\nסה"כ לפני מע"מ: ${ils(deal.subtotal)}\n*סה"כ כולל ${vatRate}% מע"מ: ${ils(deal.total)}*\n\n${pay}\n\n${co.name} · ${co.address} · נייד ${co.phone}`;
    return t;
  };
  const copy = async () => { const ok = await copyText(text()); showToast(ok ? "ההצעה הועתקה" : "העתקה נכשלה"); };
  return (
    <div className="ag-modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ag-sheet">
        <div className="ag-sheet-head ag-quote-noprint"><b>הצעת מחיר · Heavy Guard</b><button onClick={onClose}><X size={20} /></button></div>
        <div className="ag-sheet-body">
          <div className="hg2-quotedoc" id="quotedoc">
            <div className="hg2-qd-band">
              <div className="hg2-qd-brand">
                <img src={BULL_LOGO} alt="" className="hg2-qd-logo" />
                <div className="hg2-qd-name">{co.brand}</div>
                <div className="hg2-qd-co">עוסק מורשה {co.taxId}<br />נייד: {co.phone}<br />{co.address}</div>
              </div>
              <div className="hg2-qd-titlebox">
                <div className="hg2-qd-title">הצעת מחיר</div>
                <div className="hg2-qd-num">הצעת מחיר מספר {number}</div>
                <div className="hg2-qd-meta"><b>לכבוד: {deal.name || "—"}</b></div>
                <div className="hg2-qd-meta">תאריך: {dmy(date)}</div>
                <div className="hg2-qd-meta">בתוקף עד: {dmy(validUntil)}</div>
              </div>
            </div>
            <table className="hg2-qd-table">
              <thead><tr><th>תיאור הפריט</th><th>מחיר ליחידה</th><th>כמות</th><th>סה"כ</th></tr></thead>
              <tbody>{lines.map((l, i) => <tr key={i}><td>{l.name}</td><td>{ils(l.price)}</td><td>{l.qty}</td><td>{ils(l.price * l.qty)}</td></tr>)}</tbody>
            </table>
            <div className="hg2-qd-sums">
              <div><span>סה"כ לפני מע"מ</span><b>{ils(deal.subtotal)}</b></div>
              <div className="tot"><span>סה"כ כולל {vatRate}% מע"מ</span><b>{ils(deal.total)}</b></div>
            </div>
            <div className="hg2-qd-sec">הערות:</div>
            <ul className="hg2-qd-list">{notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
            <div className="hg2-qd-sec">דרכי תשלום:</div>
            <div className="hg2-qd-pay">{pay}</div>
            <div className="hg2-qd-foot">כאן לשירותכם וזמינים לשאלות ובירורים.</div>
            <div className="hg2-qd-bottomband" />
          </div>
        </div>
        <div className="ag-sheet-foot ag-quote-noprint">
          <button className="ag-btn ghost" onClick={copy}><Copy size={15} /> העתק</button>
          <button className="ag-btn" onClick={() => window.print()}><FileText size={15} /> הדפס / PDF</button>
          {deal.phone && <a className="ag-btn wa" href={waLink(deal.phone, text())} target="_blank" rel="noreferrer"><Send size={15} /> וואטסאפ</a>}
        </div>
      </div>
    </div>
  );
}

/* ============================ Customers ============================ */
function CustomersView({ custs, onSave, onRemove, showToast }) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [q, setQ] = useState("");
  const list = q ? custs.filter((c) => (c.name || "").toLowerCase().includes(q.toLowerCase()) || (c.phone || "").includes(q)) : custs;

  return (
    <div className="ag-flow">
      <header className="ag-head sm"><div><div className="ag-title">לקוחות</div><div className="ag-sub">{custs.length} לקוחות</div></div></header>
      <button className="ag-cta" onClick={() => { setEdit(null); setOpen(true); }}><Plus size={18} /> לקוח חדש</button>
      <div className="ag-searchbox"><Search size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש לקוח…" dir="rtl" />{q && <button onClick={() => setQ("")}><X size={14} /></button>}</div>
      {list.length === 0 && <div className="ag-empty"><UserRound size={32} /><div>אין עדיין לקוחות</div><p>לקוחות נוצרים אוטומטית כשסוגרים עסקה, או הוסף ידנית</p></div>}
      {list.map((c) => (
        <div className="ag-card cust" key={c.id}>
          <div className="ag-cust-mid"><b>{c.name}</b><span dir="ltr">{c.phone || "—"}{c.city ? " · " + c.city : ""}</span>{c.notes && <span className="ag-cust-note">{c.notes}</span>}</div>
          <div className="ag-cust-acts">
            {c.phone && <button className="ag-wa me" title="העתק ל-Me" onClick={() => meLookup(c.phone, showToast)}><Copy size={15} /></button>}
            {c.phone && <a className="ag-wa tel" href={telLink(c.phone)}><Phone size={15} /></a>}
            <button className="ag-icbtn" onClick={() => { setEdit(c); setOpen(true); }}><Pencil size={14} /></button>
            <button className="ag-icbtn d" onClick={async () => { onRemove(c.id); showToast("הלקוח נמחק"); }}><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
      {open && <CustomerForm initial={edit} onClose={() => setOpen(false)} onSave={(c) => { onSave(c); setOpen(false); showToast(edit ? "הלקוח עודכן" : "הלקוח נוסף"); }} />}
    </div>
  );
}

function CustomerForm({ initial, onClose, onSave }) {
  const [c, setC] = useState(initial || { name: "", phone: "", email: "", city: "", notes: "" });
  const set = (k, v) => setC((p) => ({ ...p, [k]: v }));
  return (
    <div className="ag-modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ag-sheet sm">
        <div className="ag-sheet-head"><b>{initial ? "עריכת לקוח" : "לקוח חדש"}</b><button onClick={onClose}><X size={20} /></button></div>
        <div className="ag-sheet-body">
          <label className="ag-lbl">שם</label><input className="ag-input" value={c.name} onChange={(e) => set("name", e.target.value)} dir="rtl" />
          <label className="ag-lbl">טלפון</label><input className="ag-input" value={c.phone} onChange={(e) => set("phone", e.target.value)} dir="ltr" />
          <label className="ag-lbl">אימייל</label><input className="ag-input" value={c.email} onChange={(e) => set("email", e.target.value)} dir="ltr" />
          <label className="ag-lbl">עיר</label><input className="ag-input" value={c.city} onChange={(e) => set("city", e.target.value)} dir="rtl" />
          <label className="ag-lbl">הערות</label><textarea className="ag-textarea" value={c.notes} onChange={(e) => set("notes", e.target.value)} rows={2} dir="rtl" />
        </div>
        <div className="ag-sheet-foot"><button className="ag-btn ghost" onClick={onClose}>ביטול</button><button className="ag-btn" onClick={() => c.name.trim() && onSave(c)}>שמור</button></div>
      </div>
    </div>
  );
}

/* ============================ Digital assistant (rule-based, no AI) ============================ */
const daysSince = (iso) => { if (!iso) return 9999; const d = (Date.now() - new Date(iso).getTime()) / 86400000; return isNaN(d) ? 9999 : Math.floor(d); };
function assistantReply(q, ctx) {
  const { leads, deals, custs, go, onNewDeal } = ctx;
  const s = (q || "").trim().toLowerCase();
  const open = deals.filter((d) => d.status === "פתוח");
  const openVal = open.reduce((a, d) => a + (d.total || 0), 0);
  const wonMonth = deals.filter((d) => d.status === "נסגר" && (d.wonAt || "").startsWith(monthKey()));
  const followups = leads.filter((l) => ["פנייה ראשונה", "בתהליך"].includes(l.crmStatus) && daysSince((l.outreach || [])[0]?.date) >= 3);
  const sent = leads.filter((l) => l.crmStatus === "הצעה נשלחה");
  const hot = leads.filter((l) => ["בתהליך", "הצעה נשלחה"].includes(l.crmStatus));
  const has = (...w) => w.some((x) => s.includes(x));

  if (!s || has("עזרה", "פקודות", "מה אתה", "?")) return { text: "אני העוזר של איתי 🤝 נסה: \"מעקבים להיום\", \"הצעות שנשלחו\", \"לידים חמים\", \"עסקאות פתוחות\", \"סיכום\", \"פתח מסלול\", \"הצעת מחיר חדשה\"." };
  if (has("נסח", "הודעה", "וואטסאפ", "טקסט", "מה לכתוב")) return { text: `הצעה להודעת מעקב:\n"שלום, כאן איתי מ-${BIZ} 🛡️ רציתי לבדוק אם הספקתם לעבור על ההצעה למערכות המיגון לרכב. אשמח לענות על כל שאלה ולהתאים לכם פתרון. מתי נוח לדבר?"\n(להצעות חכמות ומותאמות — הוסף מפתח Groq חינמי בהגדרות.)` };
  if (has("מעקב", "לבדוק", "היום", "תזכור")) return { text: followups.length ? `יש ${followups.length} לידים שמחכים למעקב (3+ ימים ללא פנייה). הבולטים: ${followups.slice(0, 3).map((l) => l.n).join(" · ")}.` : "אין מעקבים דחופים כרגע — כל הכבוד! 👏", action: { label: "פתח לידים", run: () => go("leads") } };
  if (has("נשלח", "הצעות") || (has("הצעה") && !has("חדש", "צור"))) return { text: sent.length ? `${sent.length} הצעות מחיר ממתינות לתשובה. שווה לחזור אליהן: ${sent.slice(0, 3).map((l) => l.n).join(" · ")}.` : "אין כרגע הצעות שנשלחו וממתינות.", action: { label: "פתח לידים", run: () => go("leads") } };
  if (has("חם", "לוהט")) return { text: hot.length ? `${hot.length} לידים חמים (בתהליך/הצעה נשלחה). תעדף אותם: ${hot.slice(0, 4).map((l) => l.n).join(" · ")}.` : "אין כרגע לידים חמים.", action: { label: "פתח לידים", run: () => go("leads") } };
  if (has("עסקא", "פתוח", "צבר")) return { text: `${open.length} עסקאות פתוחות בשווי ${ils(openVal)}. נסגרו החודש: ${wonMonth.length}.`, action: { label: "פתח עסקאות", run: () => go("deals") } };
  if (has("לקוח")) return { text: `יש לך ${custs.length} לקוחות פעילים.`, action: { label: "פתח לקוחות", run: () => go("custs") } };
  if (has("מסלול", "מפה", "נסיע", "פגיש")) return { text: "פותח את מפת העסקים — בחר עיר ואבנה לך מסלול פגישות יעיל. 🗺️", action: { label: "פתח מפה", run: () => go("map") } };
  if (has("הצעת מחיר", "חדש", "צור", "בנה הצעה")) { onNewDeal && onNewDeal(); return { text: "פתחתי עסקה חדשה — בחר פריטים מהמחירון והוסף הנחה אם צריך. 📝" }; }
  if (has("סיכום", "דוח", "מצב", "בוקר טוב", "מה המצב")) return { text: `סיכום: ${leads.length.toLocaleString()} לידים · ${followups.length} מעקבים להיום · ${sent.length} הצעות ממתינות · ${open.length} עסקאות פתוחות (${ils(openVal)}) · ${custs.length} לקוחות.` };
  return { text: "לא הבנתי את הפקודה. כתוב \"עזרה\" כדי לראות מה אני יודע לעשות. (טיפ: עם מפתח Groq חינמי אני הופך ל-AI מלא.)" };
}
const ASSIST_QUICK = ["מעקבים להיום", "הצעות שנשלחו", "לידים חמים", "עסקאות פתוחות", "סיכום", "פתח מסלול"];

/* ── Free AI brain via Groq (same key as the Alpha app, shared localStorage).
   When a key exists the assistant becomes a real AI that knows the live CRM
   and can draft messages, handle objections, prioritise and navigate. ── */
const groqKey = () => { try { return localStorage.getItem("alpha_groq") || ""; } catch { return ""; } };
const hasAI = () => !!groqKey();
function assistSystem({ leads, deals, custs }) {
  const open = deals.filter((d) => d.status === "פתוח");
  const openVal = open.reduce((a, d) => a + (d.total || 0), 0);
  const wonMonth = deals.filter((d) => d.status === "נסגר" && (d.wonAt || "").startsWith(monthKey()));
  const fu = leads.filter((l) => ["פנייה ראשונה", "בתהליך"].includes(l.crmStatus) && daysSince((l.outreach || [])[0]?.date) >= 3).length;
  const sent = leads.filter((l) => l.crmStatus === "הצעה נשלחה").length;
  const hot = leads.filter((l) => ["בתהליך", "הצעה נשלחה"].includes(l.crmStatus)).length;
  const pl = loadHgPricelist().map((p) => `${p.name} ₪${p.price}`).join(", ");
  return `אתה העוזר האישי החכם של איתי — איש מכירות בכיר ב-${BIZ} (מערכות מיגון, איתור ובטיחות לרכבים כבדים: איתוראן, מצלמות רוורס, מסכים חכמים, פוינטר רב-קודן וכו'). דבר עברית טבעית, קצרה וממוקדת מכירות, בטון מקצועי, אנרגטי וחם. אתה עוזר ב: ניסוח הודעות מעקב/וואטסאפ ללקוח, טיפול בהתנגדויות מחיר, ניסוח הצעות ותמחור, תעדוף לידים, בניית תוכנית יום, וטיפים לסגירת עסקאות. כשרלוונטי תן צעד פעולה קונקרטי אחד.
היום ${todayISO()}. נתוני ה-CRM החיים של איתי: ${leads.length.toLocaleString()} לידים, ${fu} מעקבים להיום, ${sent} הצעות שנשלחו וממתינות, ${hot} לידים חמים, ${open.length} עסקאות פתוחות בשווי ${ils(openVal)}, נסגרו החודש ${wonMonth.length}, ${custs.length} לקוחות.
מחירון Heavy Guard: ${pl}.
אם המשתמש מבקש לנווט במערכת, הוסף בסוף התשובה תג מתאים (ואל תזכיר אותו בטקסט): [[GO:home]] לבקרה, [[GO:leads]] ללידים, [[GO:deals]] לעסקאות, [[GO:custs]] ללקוחות, [[GO:map]] למפה/מסלולים, [[NEWDEAL]] לפתיחת הצעת מחיר חדשה.`;
}
const TAGRE = /\[\[(GO:(?:home|leads|deals|custs|map)|NEWDEAL)\]\]/g;
function applyAssistTags(text, { go, onNewDeal }) {
  let m; TAGRE.lastIndex = 0;
  while ((m = TAGRE.exec(text))) { const tag = m[1]; if (tag === "NEWDEAL") onNewDeal && onNewDeal(); else go(tag.split(":")[1]); }
  return text.replace(TAGRE, "").trim();
}
async function askGroqChat(system, history, user) {
  const key = groqKey(); if (!key) throw new Error("NO_KEY");
  const messages = [{ role: "system", content: system }, ...history.slice(-6), { role: "user", content: user }];
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages, temperature: 0.7, max_tokens: 700 }),
  });
  if (!res.ok) throw new Error("Groq " + res.status);
  const d = await res.json();
  return d.choices?.[0]?.message?.content?.trim() || "";
}

function AssistantPanel({ leads, deals, custs, go, onNewDeal, showToast }) {
  const ai = hasAI();
  const welcome = ai
    ? "שלום איתי 👋 אני העוזר החכם שלך (AI). אני מכיר את נתוני ה-CRM שלך — בקש ממני לנסח הודעת מעקב, לטפל בהתנגדות מחיר, לתעדף לידים, לבנות תוכנית יום או כל שאלת מכירות."
    : "שלום איתי 👋 אני העוזר הדיגיטלי שלך. כרגע אני במצב פקודות מהירות. כדי לפתוח AI חכם וחינמי — הוסף מפתח Groq בהגדרות של Alpha (חינם, בלי כרטיס). כתוב \"עזרה\" לפקודות.";
  const [log, setLog] = useState([{ from: "bot", text: welcome }]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const histRef = React.useRef([]);

  const push = (entry) => setLog((p) => [...p.slice(-8), entry]);

  // Instant rule-based (quick chips + offline fallback)
  const runRule = (text) => {
    const t = (text ?? q).trim(); if (!t) return;
    push({ from: "me", text: t });
    const r = assistantReply(t, { leads, deals, custs, go, onNewDeal });
    push({ from: "bot", text: r.text, action: r.action });
    setQ("");
  };

  // Smart AI path (Groq, free) for free-typed questions; falls back to rules
  const runAsk = async () => {
    const t = q.trim(); if (!t || busy) return;
    push({ from: "me", text: t }); setQ("");
    if (!ai) { const r = assistantReply(t, { leads, deals, custs, go, onNewDeal }); push({ from: "bot", text: r.text, action: r.action }); return; }
    setBusy(true);
    try {
      const sys = assistSystem({ leads, deals, custs });
      const reply = await askGroqChat(sys, histRef.current, t);
      const clean = applyAssistTags(reply, { go, onNewDeal }) || "✔";
      histRef.current = [...histRef.current.slice(-6), { role: "user", content: t }, { role: "assistant", content: reply }];
      push({ from: "bot", text: clean });
    } catch (e) {
      const r = assistantReply(t, { leads, deals, custs, go, onNewDeal });
      push({ from: "bot", text: (String(e.message).includes("Groq") ? "ה-AI עמוס כרגע, עניתי במצב מהיר: " : "") + r.text, action: r.action });
    } finally { setBusy(false); }
  };

  return (
    <div className="ag-assist">
      <div className="ag-assist-h"><span className="ag-assist-orb" /> <b>עוזר אישי</b><i>{ai ? "AI חינם · Groq" : "פקודות מהירות"}</i></div>
      <div className="ag-assist-log">
        {log.map((m, i) => (
          <div key={i} className={"ag-msg " + m.from}>
            <span>{m.text}</span>
            {m.action && <button className="ag-msg-act" onClick={() => m.action.run()}>{m.action.label} ←</button>}
            {m.from === "bot" && i > 0 && <button className="ag-msg-copy" title="העתק" onClick={async () => { const ok = await copyText(m.text); showToast && showToast(ok ? "הועתק ✓" : "העתקה נכשלה"); }}><Copy size={12} /></button>}
          </div>
        ))}
        {busy && <div className="ag-msg bot ag-typing"><span>חושב…</span></div>}
      </div>
      <div className="ag-assist-quick">{ASSIST_QUICK.map((c) => <button key={c} onClick={() => runRule(c)}>{c}</button>)}</div>
      <div className="ag-assist-in">
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runAsk()} placeholder={ai ? "שאל אותי כל דבר על מכירות…" : "כתוב פקודה…"} dir="rtl" disabled={busy} />
        <button onClick={runAsk} disabled={busy}><Send size={16} /></button>
      </div>
    </div>
  );
}

/* ============================ Map + route planner ============================ */
function MapView({ leads, custs, deals, showToast }) {
  const mapRef = React.useRef(null);
  const layerRef = React.useRef(null);
  const [scope, setScope] = useState("all"); // all | active
  const [region, setRegion] = useState("");
  const [sat, setSat] = useState(false);
  const [ready, setReady] = useState(false);
  const [routeCity, setRouteCity] = useState("");

  const dealLeadIds = useMemo(() => new Set(deals.map((d) => d.leadId)), [deals]);
  const points = useMemo(() => {
    const base = leads.filter((l) => {
      if (region && l.geo !== region) return false;
      if (scope === "active") return ["פנייה ראשונה", "בתהליך", "הצעה נשלחה", "לקוח"].includes(l.crmStatus) || dealLeadIds.has(l.id);
      return true;
    }).filter((l) => geoFor(l));
    return base.map((l) => ({
      id: l.id, n: l.n, city: l.city, geo: l.geo, addr: l.addr, status: l.crmStatus,
      phone: (l.phones || [])[0] || "", phones: l.phones || [], email: l.e || "", web: l.w || "",
      sector: l.sector || "", emp: l.emp || "", rev: l.rev || "", ll: geoFor(l),
    }));
  }, [leads, scope, region, dealLeadIds]);

  const routeCities = useMemo(() => {
    const m = {}; points.forEach((p) => { if (p.city) m[p.city] = (m[p.city] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 40);
  }, [points]);
  const routeStops = useMemo(() => routeCity ? points.filter((p) => p.city === routeCity) : [], [points, routeCity]);
  const gmapsRoute = () => {
    const stops = routeStops.slice(0, 10);
    if (!stops.length) return;
    const enc = (p) => encodeURIComponent([p.addr, p.city].filter(Boolean).join(" ") || p.n);
    const dest = enc(stops[stops.length - 1]);
    const wp = stops.slice(0, -1).map(enc).join("%7C");
    const url = `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${dest}${wp ? `&waypoints=${wp}` : ""}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    let alive = true;
    loadLeaflet().then((L) => {
      if (!alive || mapRef.current) return;
      const map = L.map("ag-map", { zoomControl: true, attributionControl: false }).setView([31.6, 34.9], 7.4);
      mapRef.current = map; setReady(true);
    }).catch(() => showToast("טעינת המפה נכשלה — בדוק חיבור לאינטרנט"));
    return () => { alive = false; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  // base tiles (switch on sat toggle)
  const tileRef = React.useRef(null);
  useEffect(() => {
    const L = window.L; const map = mapRef.current; if (!L || !map) return;
    if (tileRef.current) { map.removeLayer(tileRef.current); tileRef.current = null; }
    tileRef.current = sat
      ? L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19 })
      : L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { maxZoom: 20 });
    tileRef.current.addTo(map);
  }, [sat, ready]);

  // markers — clustered so the whole base renders smoothly
  useEffect(() => {
    const L = window.L; const map = mapRef.current; if (!L || !map) return;
    if (layerRef.current) { map.removeLayer(layerRef.current); }
    const grp = L.markerClusterGroup ? L.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 50, spiderfyOnMaxZoom: true }) : L.layerGroup();
    window.__agMe = (num) => meLookup(num, showToast);
    const esc = (s) => String(s || "").replace(/'/g, "\\'").replace(/</g, "&lt;");
    const webUrl = (w) => w ? (/^https?:\/\//.test(w) ? w : "https://" + w) : "";
    points.forEach((p) => {
      const color = CRM_COLOR[p.status] || "#C2912E";
      const icon = L.divIcon({ className: "ag-pin", html: `<span style="background:${color}"></span>`, iconSize: [16, 16] });
      const m = L.marker(p.ll, { icon });
      const tel = `tel:${(p.phone || "").replace(/\s/g, "")}`;
      const wu = webUrl(p.web);
      const info = [];
      if (p.sector) info.push(`<div style="font-size:11.5px;color:#5a4d28;margin-top:3px">🏷️ ${esc(p.sector)}</div>`);
      if (p.addr || p.city) info.push(`<div style="font-size:11.5px;color:#5a4d28">📍 ${esc([p.addr, p.city].filter(Boolean).join(", "))}</div>`);
      if (p.emp) info.push(`<div style="font-size:11.5px;color:#5a4d28">👥 ${esc(p.emp)} מועסקים</div>`);
      if (p.rev) info.push(`<div style="font-size:11.5px;color:#5a4d28">💰 מחזור: ₪${Number(p.rev).toLocaleString()} אלף</div>`);
      if (p.phones.length > 1) info.push(`<div dir="ltr" style="font-size:11px;color:#917E50">${esc(p.phones.slice(1, 4).join(" · "))}</div>`);
      const html = `<div style="font-family:Heebo,Arial;direction:rtl;min-width:210px;max-width:250px">
        <b style="font-size:14px;color:#2C2510">${esc(p.n)}</b>
        <span style="display:inline-block;background:${color}22;color:${color};border:1px solid ${color}66;border-radius:20px;padding:1px 8px;font-size:10px;font-weight:700;margin-right:5px">${esc(p.status)}</span>
        ${info.join("")}
        ${p.phone ? `<div dir="ltr" style="margin:6px 0 2px;font-weight:800;font-size:13px;color:#2C2510">${esc(p.phone)}</div>` : ""}
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px">
          ${wu ? `<a href="${esc(wu)}" target="_blank" rel="noreferrer" style="background:#C2912E;color:#241A06;border-radius:7px;padding:5px 10px;text-decoration:none;font-size:11px;font-weight:800">🌐 אתר</a>` : ""}
          ${p.phone ? `<a href="${tel}" style="background:#1B7E9C;color:#fff;border-radius:7px;padding:5px 10px;text-decoration:none;font-size:11px;font-weight:700">חייג</a>` : ""}
          <a href="${wazeTo(p)}" target="_blank" style="background:#33CCFF;color:#062a36;border-radius:7px;padding:5px 10px;text-decoration:none;font-size:11px;font-weight:700">Waze</a>
          ${p.email ? `<a href="mailto:${esc(p.email)}" style="background:#F5EDD9;color:#917E50;border:1px solid #E6D4A8;border-radius:7px;padding:5px 10px;text-decoration:none;font-size:11px;font-weight:700">מייל</a>` : ""}
          ${p.phone ? `<button onclick="window.__agMe('${esc(p.phone)}')" style="background:#FBF3DF;color:#A2761F;border:1px solid #C2912E;border-radius:7px;padding:5px 10px;font-size:11px;font-weight:700;cursor:pointer">Me · העתק</button>` : ""}
        </div></div>`;
      m.bindPopup(html);
      grp.addLayer(m);
    });
    grp.addTo(map); layerRef.current = grp;
  }, [points, ready]);

  return (
    <div className="ag-flow map">
      <header className="ag-head sm"><div style={{ flex: 1 }}><div className="ag-title">מפת העסקים</div><div className="ag-sub">{points.length.toLocaleString()} עסקים על המפה</div></div>
        <button className={"ag-mini" + (sat ? " on" : "")} onClick={() => setSat((v) => !v)}>{sat ? "🛰 לוויין" : "🗺 מפה"}</button>
      </header>
      <div className="ag-chips sm">
        <button className={scope === "active" ? "on" : ""} onClick={() => setScope("active")}>פעילים</button>
        <button className={scope === "all" ? "on" : ""} onClick={() => setScope("all")}>כל המאגר</button>
        <span className="ag-chip-sep" />
        <button className={!region ? "on" : ""} onClick={() => setRegion("")}>כל הארץ</button>
        {GEO_OPTS.map((g) => <button key={g} className={region === g ? "on" : ""} onClick={() => setRegion(g)}>{g}</button>)}
      </div>
      <div id="ag-map" className="ag-map" />
      <div className="ag-section">
        <div className="ag-section-ttl">🧭 תכנון מסלול פגישות</div>
        <select className="ag-select" value={routeCity} onChange={(e) => setRouteCity(e.target.value)}>
          <option value="">בחר עיר לבניית מסלול…</option>
          {routeCities.map(([c, n]) => <option key={c} value={c}>{c} ({n})</option>)}
        </select>
        {routeCity && (
          <>
            <div className="ag-route-list">
              {routeStops.slice(0, 10).map((p, i) => (
                <div className="ag-route-row" key={p.id}>
                  <span className="ag-route-n">{i + 1}</span>
                  <div className="ag-route-mid"><b>{p.n}</b><span>{[p.addr, p.city].filter(Boolean).join(", ")}</span></div>
                  <a className="ag-route-waze" href={wazeTo(p)} target="_blank" rel="noreferrer">Waze</a>
                </div>
              ))}
              {routeStops.length > 10 && <div className="ag-note-line">מציג 10 תחנות ראשונות מתוך {routeStops.length}</div>}
            </div>
            <button className="ag-btn" onClick={gmapsRoute}><MapPin size={15} /> פתח מסלול ב-Google Maps</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================ Styles ============================ */
function StyleTag() {
  return <style>{`
.ag{--void:#FAF5E9;--s9:#FFFFFF;--s8:#F5EDD9;--s7:#E6D4A8;--s4:#917E50;--silver:#2C2510;--gold:#C2912E;--gold2:#A2761F;--champ:#9A6E13;--cyan:#1B7E9C;--ok:#1E9A60;--red:#CF3A2E;
  font-family:'Heebo',Arial,sans-serif;color:var(--silver);background:var(--void);min-height:100%;direction:rtl;padding-bottom:74px}
.ag *{box-sizing:border-box}
.ag-flow{max-width:560px;margin:0 auto;padding:16px 14px 24px}
.ag-head{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.ag-head.sm{margin-bottom:12px}
.ag-logo{width:46px;height:46px;border-radius:11px;object-fit:cover;flex-shrink:0}
.ag-title{font-family:'Rubik';font-weight:900;font-size:19px;letter-spacing:-.3px}
.ag-sub{font-size:12.5px;color:var(--s4);margin-top:2px}
.ag-back{background:var(--s8);border:1px solid var(--s7);color:var(--silver);border-radius:10px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}

.ag-kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin-bottom:14px}
.ag-kpi{background:var(--s9);border:1px solid var(--s7);border-radius:13px;padding:13px;text-align:right;cursor:pointer;color:inherit;font-family:inherit}
.ag-kpi:active{transform:scale(.98)}
.ag-kpi b{display:block;font-family:'Rubik';font-weight:900;font-size:23px}
.ag-kpi b.cy{color:var(--cyan)} .ag-kpi b.ok{color:var(--ok)}
.ag-kpi span{font-size:12px;color:var(--s4)}

.ag-card{background:var(--s9);border:1px solid var(--s7);border-radius:13px;padding:13px;margin-bottom:10px}
.ag-card.big{margin-bottom:14px}
.ag-card-row{display:flex;align-items:center;justify-content:space-between;padding:7px 0}
.ag-card-row span{display:flex;align-items:center;gap:7px;font-size:13.5px;color:var(--s4)}
.ag-card-row b{font-family:'Rubik';font-weight:900;font-size:17px}
.ag-card-row b.cy{color:var(--cyan)} .ag-card-row b.ok{color:var(--ok)}

.ag-cta{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,var(--champ),var(--gold) 45%,var(--gold2));color:#241A06;border:none;border-radius:13px;padding:15px;font-family:'Rubik';font-weight:900;font-size:16px;cursor:pointer;margin-bottom:16px;box-shadow:0 8px 24px rgba(228,188,99,.28)}
.ag-cta:active{transform:scale(.985)}

.ag-secttl{font-family:'Rubik';font-weight:700;font-size:15px;margin:6px 0 10px}
.ag-deal-row{display:flex;align-items:center;gap:10px;width:100%;background:var(--s9);border:1px solid var(--s7);border-radius:12px;padding:11px;margin-bottom:8px;cursor:pointer;color:inherit;font-family:inherit;text-align:right}
.ag-deal-row.flat{cursor:default}
.ag-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
.ag-deal-mid{flex:1;min-width:0}
.ag-deal-mid b{display:block;font-size:14px;font-weight:700}
.ag-deal-mid span{font-size:11.5px;color:var(--s4)}
.ag-deal-val{font-family:'Rubik';font-weight:900;font-size:15px;color:var(--champ);white-space:nowrap}

.ag-searchbox{display:flex;align-items:center;gap:9px;background:var(--s9);border:1px solid var(--s7);border-radius:11px;padding:11px 13px;margin-bottom:10px;color:var(--s4)}
.ag-searchbox input{flex:1;background:none;border:none;outline:none;color:var(--silver);font-size:15px;font-family:inherit;min-width:0}
.ag-searchbox button{background:none;border:none;color:var(--s4);cursor:pointer;display:flex;padding:0}
.ag-chips{display:flex;gap:7px;overflow-x:auto;padding-bottom:8px;margin-bottom:6px;scrollbar-width:none}
.ag-chips::-webkit-scrollbar{display:none}
.ag-chips.nowrap{flex-wrap:wrap}
.ag-chips button{flex-shrink:0;background:var(--s8);border:1px solid var(--s7);color:var(--s4);border-radius:20px;padding:7px 15px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap}
.ag-chips button.on{background:color-mix(in srgb,var(--sc,var(--gold)) 16%,transparent);border-color:var(--sc,var(--gold));color:var(--sc,var(--gold))}
.ag-chips.sm button{padding:6px 12px;font-size:12px}

.ag-card.lead,.ag-card.deal{cursor:pointer;text-align:right;width:100%;font-family:inherit;color:inherit;display:block}
.ag-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px}
.ag-card-name{font-size:14.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ag-badge{font-size:10.5px;font-weight:700;padding:3px 9px;border-radius:20px;white-space:nowrap;flex-shrink:0}
.ag-card-meta{display:flex;gap:12px;font-size:11.5px;color:var(--s4);flex-wrap:wrap;align-items:center}
.ag-card-meta span{display:flex;align-items:center;gap:3px}
.ag-card-meta .ag-act{color:var(--cyan)}
.ag-card-sector{font-size:11.5px;color:var(--s4);margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ag-more{width:100%;background:var(--s8);border:1px solid var(--s7);color:var(--silver);border-radius:11px;padding:12px;font-family:inherit;font-weight:700;font-size:13.5px;cursor:pointer;margin:6px 0}

.ag-pipeline{display:flex;gap:6px;overflow-x:auto;padding-bottom:10px;margin-bottom:12px;scrollbar-width:none}
.ag-pipeline::-webkit-scrollbar{display:none}
.ag-pipe{flex-shrink:0;background:var(--s8);border:1px solid var(--s7);color:var(--s4);border-radius:10px;padding:9px 13px;font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;white-space:nowrap}
.ag-pipe.on{background:color-mix(in srgb,var(--sc) 18%,transparent);border-color:var(--sc);color:var(--sc)}

.ag-section{background:var(--s9);border:1px solid var(--s7);border-radius:13px;padding:13px;margin-bottom:10px}
.ag-section-ttl{font-family:'Rubik';font-weight:700;font-size:13.5px;color:var(--champ);margin-bottom:9px}
.ag-section-ttl-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}
.ag-section-ttl-row .ag-section-ttl{margin-bottom:0}
.ag-contact{display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid var(--s8);font-size:13.5px}
.ag-contact span{flex:1}
.ag-contact-a{background:var(--s8);border:1px solid var(--s7);color:var(--cyan);border-radius:8px;padding:5px 11px;font-size:12px;font-weight:700;text-decoration:none;display:flex;align-items:center;gap:4px}
.ag-contact-a.wa{color:var(--ok)}
.ag-info{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px;color:var(--s4)}
.ag-trunc{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.ag-mgr-name{font-weight:700;font-size:14px}
.ag-mgr-role{font-size:11.5px;color:var(--s4);margin-right:7px}
.ag-phone{display:flex;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid var(--s8);flex-wrap:wrap}
.ag-phone-ic{color:var(--cyan);flex-shrink:0}
.ag-phone-num{font-size:15px;font-weight:700;letter-spacing:.3px;flex:1;min-width:90px}
.ag-phone-btn{display:flex;align-items:center;gap:5px;background:var(--s8);border:1px solid var(--s7);color:var(--cyan);border-radius:9px;padding:7px 12px;font-size:12.5px;font-weight:700;text-decoration:none;white-space:nowrap}
.ag-phone-btn.wa{color:var(--ok);border-color:#9AD3B4;background:#E2F4EA}
.ag-note-line{font-size:11.5px;color:var(--s4);margin-bottom:9px;line-height:1.4}
.ag-person{padding:10px 0;border-bottom:1px solid var(--s8)}
.ag-person:last-child{border-bottom:none}
.ag-person-top{display:flex;align-items:baseline;gap:7px;flex-wrap:wrap}
.ag-person-phone{display:flex;align-items:center;gap:5px;font-size:13px;color:var(--silver);margin-top:5px;font-weight:600}
.ag-person-acts{display:flex;gap:7px;margin-top:8px;flex-wrap:wrap}
.ag-person-btn{display:flex;align-items:center;gap:5px;background:var(--s8);border:1px solid var(--s7);color:var(--cyan);border-radius:9px;padding:7px 13px;font-size:12.5px;font-weight:700;text-decoration:none;white-space:nowrap}
.ag-person-btn.wa{color:var(--ok);border-color:#9AD3B4;background:#E2F4EA}
.ag-textarea,.ag-input,.ag-select{width:100%;background:var(--s8);border:1px solid var(--s7);color:var(--silver);border-radius:10px;padding:10px 12px;font-family:inherit;font-size:14px;outline:none}
.ag-textarea{resize:vertical}
.ag-btn{background:linear-gradient(135deg,var(--champ),var(--gold) 50%,var(--gold2));color:#241A06;border:none;border-radius:10px;padding:11px 16px;font-family:'Rubik';font-weight:900;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;margin-top:9px}
.ag-btn.ghost{background:var(--s8);border:1px solid var(--s7);color:var(--silver)}
.ag-btn.wa{background:linear-gradient(135deg,#3FD79A,#1faa70);color:#04140d}
.ag-mini{background:var(--s8);border:1px solid var(--s7);color:var(--cyan);border-radius:8px;padding:6px 11px;font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer}
.ag-row{display:flex;gap:8px;margin-top:8px}
.ag-row .ag-btn,.ag-row .ag-select{flex:1;margin-top:0}
.ag-addform{margin-top:8px}
.ag-empty{text-align:center;padding:34px 16px;color:var(--s4)}
.ag-empty svg{opacity:.5;margin-bottom:10px}
.ag-empty div{font-weight:700;font-size:15px;color:var(--silver)}
.ag-empty p{font-size:12.5px;margin-top:5px}
.ag-empty.sm{padding:14px;font-size:12.5px}
.ag-out{background:var(--s8);border-radius:9px;padding:9px 11px;margin-top:7px}
.ag-out-h{display:flex;align-items:center;gap:8px;font-size:12px;margin-bottom:4px}
.ag-out-t{font-weight:700;color:var(--champ)}
.ag-out-r{color:var(--cyan)}
.ag-out-d{margin-right:auto;color:var(--s4)}
.ag-out-n{font-size:13px}

.ag-deal-acts{display:flex;gap:7px;margin-top:10px;flex-wrap:wrap}
.ag-abtn{display:flex;align-items:center;gap:5px;background:var(--s8);border:1px solid var(--s7);color:var(--silver);border-radius:9px;padding:8px 12px;font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;text-decoration:none}
.ag-abtn.wa{color:var(--ok);border-color:#9AD3B4}
.ag-abtn.ok{color:#04140d;background:var(--ok);border-color:var(--ok)}
.ag-abtn.d{color:var(--red);margin-right:auto}

.ag-modal{position:fixed;inset:0;background:rgba(40,30,8,.45);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;z-index:200}
.ag-sheet{background:var(--s9);border:1px solid var(--s7);border-radius:18px 18px 0 0;width:100%;max-width:560px;max-height:92vh;display:flex;flex-direction:column}
.ag-sheet.sm{max-height:80vh}
.ag-sheet-head{display:flex;align-items:center;justify-content:space-between;padding:15px 16px;border-bottom:1px solid var(--s7)}
.ag-sheet-head b{font-family:'Rubik';font-weight:900;font-size:16px}
.ag-sheet-head button{background:none;border:none;color:var(--s4);cursor:pointer;display:flex}
.ag-sheet-body{padding:14px 16px;overflow-y:auto}
.ag-lbl{display:block;font-size:12px;color:var(--s4);margin:11px 0 5px;font-weight:700}
.ag-lbl:first-child{margin-top:0}
.ag-item{display:flex;gap:6px;margin-bottom:7px;align-items:center}
.ag-input.desc{flex:1}
.ag-input.qty{width:58px;text-align:center}
.ag-input.price{width:80px}
.ag-item-del{background:var(--s8);border:1px solid var(--s7);color:var(--red);border-radius:8px;width:34px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}
.ag-additem{background:var(--s8);border:1px dashed var(--s7);color:var(--cyan);border-radius:10px;padding:10px;width:100%;font-family:inherit;font-weight:700;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;margin-top:4px}
.ag-totbox{background:var(--s8);border-radius:11px;padding:12px;margin-top:12px}
.ag-totrow{display:flex;justify-content:space-between;padding:5px 0;font-size:13.5px;color:var(--s4)}
.ag-totrow b{color:var(--silver);font-family:'Rubik';font-weight:700}
.ag-totrow.grand{border-top:1px solid var(--s7);margin-top:5px;padding-top:9px;font-size:16px}
.ag-totrow.grand span,.ag-totrow.grand b{color:var(--champ);font-weight:900}
.ag-link-opt{display:block;width:100%;text-align:right;background:var(--s8);border:1px solid var(--s7);color:var(--silver);border-radius:9px;padding:9px 11px;font-family:inherit;font-size:13px;cursor:pointer;margin-top:6px}
.ag-sheet-foot{display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--s7)}
.ag-sheet-foot .ag-btn{flex:1;margin-top:0}

.ag-card.cust{display:flex;align-items:center;gap:10px}
.ag-cust-mid{flex:1;min-width:0}
.ag-cust-mid b{display:block;font-size:14px;font-weight:700}
.ag-cust-mid span{font-size:12px;color:var(--s4);display:block}
.ag-cust-note{color:var(--champ)!important;font-size:11.5px!important}
.ag-cust-acts{display:flex;gap:6px;align-items:center}
.ag-wa{background:#E2F4EA;border:1px solid #9AD3B4;color:var(--ok);border-radius:9px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;text-decoration:none}
.ag-wa.tel{background:var(--s8);border-color:var(--s7);color:var(--cyan)}
.ag-icbtn{background:var(--s8);border:1px solid var(--s7);color:var(--s4);border-radius:9px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer}
.ag-icbtn.d{color:var(--red)}

.ag-nav{position:fixed;bottom:0;left:0;right:0;display:flex;background:rgba(255,255,255,.97);border-top:1px solid var(--s7);z-index:100;padding-bottom:env(safe-area-inset-bottom)}
.ag-nav button{flex:1;background:none;border:none;color:var(--s4);padding:9px 0 11px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;font-family:inherit}
.ag-nav button span{font-size:11px;font-weight:700}
.ag-nav button.on{color:var(--gold)}
.ag-nav-exit{color:var(--red)!important}
.ag-toast{position:fixed;bottom:84px;left:50%;transform:translateX(-50%);background:var(--s8);border:1px solid var(--gold);color:var(--champ);padding:11px 18px;border-radius:11px;font-size:13.5px;font-weight:700;z-index:300;box-shadow:0 8px 30px rgba(120,90,20,.25);max-width:90vw;text-align:center}

/* heavyguard.com link + social quick links */
.ag-links{display:flex;align-items:center;gap:6px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end;max-width:190px}
.ag-site{display:flex;align-items:center;gap:6px;background:linear-gradient(135deg,var(--champ),var(--gold) 55%,var(--gold2));color:#241A06;border-radius:10px;padding:7px 11px;text-decoration:none;font-weight:900;font-size:12.5px;flex-shrink:0;box-shadow:0 4px 14px rgba(194,145,46,.3)}
.ag-site img{width:18px;height:18px;border-radius:4px;object-fit:cover}
.ag-soc{width:34px;height:34px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:10px;text-decoration:none;cursor:pointer;border:1px solid var(--s7);background:var(--s9);color:var(--silver)}
.ag-soc.fb{background:#1877F2;border-color:#1877F2;color:#fff}
.ag-soc.tt{background:#111;border-color:#111;color:#fff}
.ag-soc.send{background:linear-gradient(135deg,var(--champ),var(--gold2));border:none;color:#fff}

/* discount row */
.ag-disc{margin-bottom:2px}
.ag-totrow.disc span,.ag-totrow.disc b{color:var(--ok)}
.ag-q-disc span,.ag-q-disc b{color:var(--ok)!important}

/* digital assistant */
.ag-assist{background:linear-gradient(160deg,#fffdf6,#fbf3df);border:1px solid var(--s7);border-radius:15px;padding:13px;margin-bottom:14px;box-shadow:0 6px 22px rgba(160,118,31,.10)}
.ag-assist-h{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.ag-assist-h b{font-family:'Rubik';font-weight:900;font-size:14.5px}
.ag-assist-h i{font-style:normal;font-size:10.5px;color:var(--s4);margin-right:auto;background:var(--s8);border:1px solid var(--s7);padding:2px 8px;border-radius:20px}
.ag-assist-orb{width:13px;height:13px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,var(--gold) 55%,var(--gold2));box-shadow:0 0 10px rgba(194,145,46,.6);animation:agpulse 2.4s ease-in-out infinite}
@keyframes agpulse{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.18);opacity:1}}
.ag-assist-log{display:flex;flex-direction:column;gap:7px;max-height:210px;overflow-y:auto;margin-bottom:10px}
.ag-msg{font-size:13px;line-height:1.5;padding:8px 11px;border-radius:11px;max-width:92%}
.ag-msg.bot{background:var(--s8);border:1px solid var(--s7);color:var(--silver);align-self:flex-start;border-top-right-radius:3px}
.ag-msg.me{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#241A06;align-self:flex-end;font-weight:700;border-top-left-radius:3px}
.ag-msg.bot{position:relative;padding-left:26px;white-space:pre-wrap}
.ag-msg-act{display:block;margin-top:6px;background:var(--champ);color:#fff;border:none;border-radius:8px;padding:6px 11px;font-family:inherit;font-weight:700;font-size:12px;cursor:pointer}
.ag-msg-copy{position:absolute;top:5px;left:5px;background:none;border:none;color:var(--s4);cursor:pointer;opacity:.55;padding:2px;display:flex}
.ag-msg-copy:hover{opacity:1;color:var(--gold2)}
.ag-typing span{opacity:.7;font-style:italic}
.ag-assist-quick{display:flex;gap:6px;overflow-x:auto;padding-bottom:7px;margin-bottom:9px;scrollbar-width:none}
.ag-assist-quick::-webkit-scrollbar{display:none}
.ag-assist-quick button{flex-shrink:0;background:var(--s9);border:1px solid var(--gold);color:var(--gold2);border-radius:20px;padding:6px 13px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap}
.ag-assist-in{display:flex;gap:7px}
.ag-assist-in input{flex:1;background:var(--s9);border:1px solid var(--s7);border-radius:10px;padding:10px 12px;font-family:inherit;font-size:14px;color:var(--silver);outline:none}
.ag-assist-in button{background:linear-gradient(135deg,var(--champ),var(--gold2));color:#fff;border:none;border-radius:10px;width:44px;display:flex;align-items:center;justify-content:center;cursor:pointer}

/* map entry card on dashboard */
.ag-mapcard{position:relative;overflow:hidden;width:100%;display:flex;align-items:center;gap:10px;background:linear-gradient(120deg,#2C2510,#5a4416 60%,var(--gold2));color:#fff8e8;border:none;border-radius:14px;padding:15px 14px;margin-bottom:16px;cursor:pointer;text-align:right;font-family:inherit;box-shadow:0 8px 24px rgba(60,45,10,.3)}
.ag-mapcard-glow{position:absolute;inset:0;background:radial-gradient(circle at 85% 20%,rgba(228,188,99,.45),transparent 55%);pointer-events:none}
.ag-mapcard-txt{flex:1;position:relative}
.ag-mapcard-txt b{display:flex;align-items:center;gap:6px;font-family:'Rubik';font-weight:900;font-size:15px}
.ag-mapcard-txt span{display:block;font-size:11.5px;color:#e8d9b0;margin-top:3px}

/* map view */
.ag-map{height:54vh;min-height:340px;border-radius:14px;overflow:hidden;border:1px solid var(--s7);margin-bottom:12px;box-shadow:0 8px 24px rgba(120,90,20,.12);background:var(--s8)}
.ag-chip-sep{width:1px;background:var(--s7);margin:2px 4px;flex-shrink:0}
.ag-mini.on{background:color-mix(in srgb,var(--gold) 18%,transparent);border-color:var(--gold);color:var(--gold2)}
.ag-route-list{margin:10px 0 6px}
.ag-route-row{display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid var(--s8)}
.ag-route-n{width:24px;height:24px;flex-shrink:0;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#241A06;font-family:'Rubik';font-weight:900;font-size:12px;display:flex;align-items:center;justify-content:center}
.ag-route-mid{flex:1;min-width:0}
.ag-route-mid b{display:block;font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ag-route-mid span{font-size:11px;color:var(--s4)}
.ag-route-waze{background:#33CCFF;color:#062a36;border-radius:8px;padding:6px 11px;font-size:11.5px;font-weight:800;text-decoration:none;flex-shrink:0}
.leaflet-popup-content-wrapper{border-radius:12px}
.ag-pin span{display:block;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45)}

/* Me copy button (replaces WhatsApp next to numbers) */
.ag-phone-btn.me,.ag-person-btn.me{color:var(--gold2);border-color:var(--gold);background:#FBF3DF}
.ag-wa.me{background:#FBF3DF;border:1px solid var(--gold);color:var(--gold2);cursor:pointer}

/* designed quote — 1:1 with the HeavyGuard app (hg2-qd-*) */
.hg2-quotedoc{background:#fff;color:#1b2733;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.4)}
.hg2-qd-band{display:flex;gap:14px;background:linear-gradient(135deg,#bfe3e6,#d6eef0);padding:20px 18px}
.hg2-qd-brand{text-align:center;flex-shrink:0;width:118px}
.hg2-qd-logo{width:84px;height:84px;object-fit:contain;margin:0 auto}
.hg2-qd-name{font-family:'Rubik',sans-serif;font-weight:900;font-size:18px;color:#16313a;margin-top:4px;letter-spacing:.5px}
.hg2-qd-co{font-size:10.5px;line-height:1.7;color:#2c4a52;margin-top:5px}
.hg2-qd-titlebox{flex:1;text-align:right;padding-top:4px}
.hg2-qd-title{font-family:'Rubik';font-weight:900;font-size:30px;color:#16313a;line-height:1}
.hg2-qd-num{font-size:13px;color:#2c4a52;margin:4px 0 12px}
.hg2-qd-meta{font-size:13px;color:#1b2733;line-height:1.7}
.hg2-qd-meta b{font-size:15px}
.hg2-qd-table{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:4px}
.hg2-qd-table th{color:#5a6b78;font-weight:700;padding:11px 10px;text-align:right;border-bottom:1.5px solid #cfd8e0}
.hg2-qd-table th:nth-child(n+2),.hg2-qd-table td:nth-child(n+2){text-align:center}
.hg2-qd-table td{padding:13px 10px;border-bottom:1px solid #eef1f5;font-family:ui-monospace,monospace;vertical-align:top}
.hg2-qd-table td:first-child{font-family:'Heebo',sans-serif;font-weight:600;text-align:right;line-height:1.5}
.hg2-qd-sums{padding:4px 10px}
.hg2-qd-sums>div{display:flex;justify-content:space-between;align-items:center;padding:7px 0;font-size:13.5px;font-weight:700;color:#1b2733}
.hg2-qd-sums>div b{font-family:ui-monospace,monospace}
.hg2-qd-sums .tot{border-top:1px solid #e3e8ee;font-size:15px}
.hg2-qd-sums .tot b{color:#0e7d8c;font-size:17px}
.hg2-qd-sec{padding:14px 10px 4px;font-size:13px;font-weight:700;text-decoration:underline;color:#1b2733}
.hg2-qd-list{margin:0;padding:0 28px 0 10px;font-size:12.5px;color:#2c4a52;line-height:1.9}
.hg2-qd-pay{padding:2px 10px;font-size:12.5px;color:#2c4a52;line-height:1.6}
.hg2-qd-foot{text-align:center;font-size:12.5px;color:#5a6b78;padding:16px 10px}
.hg2-qd-bottomband{height:18px;background:linear-gradient(135deg,#bfe3e6,#d6eef0)}
@media print{
  body *{visibility:hidden!important}
  .hg2-quotedoc,.hg2-quotedoc *{visibility:visible!important}
  .hg2-quotedoc{position:absolute;inset:0;margin:0;box-shadow:none;border-radius:0}
  .ag-quote-noprint{display:none!important}
}
`}</style>;
}
