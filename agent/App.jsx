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
const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const telLink = (p) => `tel:${(p || "").replace(/\s/g, "")}`;
const waLink = (phone, text) => { let p = (phone || "").replace(/\D/g, ""); if (p.startsWith("0")) p = "972" + p.slice(1); return `https://wa.me/${p}?text=${encodeURIComponent(text || "")}`; };
const dealTotals = (items) => {
  const subtotal = items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);
  const vat = Math.round(subtotal * VAT);
  return { subtotal, vat, total: subtotal + vat };
};

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

  return (
    <div className="ag">
      <StyleTag />
      {tab === "home" && <Dashboard leads={leads} deals={deals} custs={custs} go={setTab} onNewDeal={() => setDealDraft({})} />}
      {tab === "leads" && <LeadsView leads={leads} updateCrm={updateCrm} addOutreach={addOutreach} onDeal={(lead) => setDealDraft({ lead })} dealsFor={(id) => deals.filter((d) => d.leadId === id)} showToast={showToast} />}
      {tab === "deals" && <DealsView deals={deals} leads={leads} onEdit={(deal) => setDealDraft({ deal })} onNew={() => setDealDraft({})} onWin={winDeal} onRemove={removeDeal} showToast={showToast} />}
      {tab === "custs" && <CustomersView custs={custs} onSave={saveCustomer} onRemove={removeCustomer} showToast={showToast} />}

      <nav className="ag-nav">
        <button className={tab === "home" ? "on" : ""} onClick={() => setTab("home")}><LayoutDashboard size={20} /><span>בקרה</span></button>
        <button className={tab === "leads" ? "on" : ""} onClick={() => setTab("leads")}><Target size={20} /><span>לידים</span></button>
        <button className={tab === "deals" ? "on" : ""} onClick={() => setTab("deals")}><Handshake size={20} /><span>עסקאות</span></button>
        <button className={tab === "custs" ? "on" : ""} onClick={() => setTab("custs")}><UserRound size={20} /><span>לקוחות</span></button>
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
function Dashboard({ leads, deals, custs, go, onNewDeal }) {
  const k = monthKey();
  const open = deals.filter((d) => d.status === "פתוח");
  const wonMonth = deals.filter((d) => d.status === "נסגר" && (d.wonAt || "").startsWith(k));
  const openValue = open.reduce((s, d) => s + (d.total || 0), 0);
  const wonValue = wonMonth.reduce((s, d) => s + (d.total || 0), 0);
  const inProgress = leads.filter((l) => ["פנייה ראשונה", "בתהליך", "הצעה נשלחה"].includes(l.crmStatus)).length;
  const wonAll = deals.filter((d) => d.status === "נסגר");
  const conv = deals.length ? Math.round((wonAll.length / deals.length) * 100) : 0;

  return (
    <div className="ag-flow">
      <header className="ag-head">
        <img src={BULL_LOGO} className="ag-logo" alt="" />
        <div><div className="ag-title">CRM מכירות · איתי</div><div className="ag-sub">{BIZ} — ניהול לידים ועסקאות</div></div>
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
            <a href={waLink(p, `שלום, מדבר איתי מ-${BIZ}.`)} target="_blank" rel="noreferrer" className="ag-phone-btn wa"><MessageSquare size={13} /> וואטסאפ</a>
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
                  {phone && <a href={waLink(phone, `שלום ${m.n}, מדבר איתי מ-${BIZ}.`)} target="_blank" rel="noreferrer" className="ag-person-btn wa"><MessageSquare size={12} /> וואטסאפ</a>}
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
  lines.push("", `סכום ביניים: ${ils(d.subtotal)}`, `מע"מ (18%): ${ils(d.vat)}`, `סה"כ לתשלום: ${ils(d.total)}`);
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
  const [linkQ, setLinkQ] = useState("");

  const t = dealTotals(items);
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
    items: items.filter((i) => i.desc.trim() || i.price), subtotal: t.subtotal, vat: t.vat, total: t.total,
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

          <div className="ag-totbox">
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
          <button className="ag-btn ghost" onClick={() => { navigator.clipboard?.writeText(dealMessage(build())); showToast("ההצעה הועתקה"); }}><Copy size={15} /> העתק</button>
          <button className="ag-btn" onClick={doSave}>שמור</button>
          <button className="ag-btn wa" onClick={doSend}><Send size={15} /> שלח בוואטסאפ</button>
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
            {c.phone && <a className="ag-wa" href={waLink(c.phone, `שלום ${c.name},`)} target="_blank" rel="noreferrer"><MessageSquare size={16} /></a>}
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

/* ============================ Styles ============================ */
function StyleTag() {
  return <style>{`
.ag{--void:#080B10;--s9:#10151D;--s8:#1A2230;--s7:#2B3543;--s4:#8E9BAB;--silver:#E8EEF4;--gold:#E4BC63;--gold2:#B6883A;--champ:#F7E8C0;--cyan:#6FD3F0;--ok:#3FD79A;--red:#FF5C50;
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
.ag-phone-btn.wa{color:var(--ok);border-color:#2c6b52;background:#143b2c}
.ag-note-line{font-size:11.5px;color:var(--s4);margin-bottom:9px;line-height:1.4}
.ag-person{padding:10px 0;border-bottom:1px solid var(--s8)}
.ag-person:last-child{border-bottom:none}
.ag-person-top{display:flex;align-items:baseline;gap:7px;flex-wrap:wrap}
.ag-person-phone{display:flex;align-items:center;gap:5px;font-size:13px;color:var(--silver);margin-top:5px;font-weight:600}
.ag-person-acts{display:flex;gap:7px;margin-top:8px;flex-wrap:wrap}
.ag-person-btn{display:flex;align-items:center;gap:5px;background:var(--s8);border:1px solid var(--s7);color:var(--cyan);border-radius:9px;padding:7px 13px;font-size:12.5px;font-weight:700;text-decoration:none;white-space:nowrap}
.ag-person-btn.wa{color:var(--ok);border-color:#2c6b52;background:#143b2c}
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
.ag-abtn.wa{color:var(--ok);border-color:#2c6b52}
.ag-abtn.ok{color:#04140d;background:var(--ok);border-color:var(--ok)}
.ag-abtn.d{color:var(--red);margin-right:auto}

.ag-modal{position:fixed;inset:0;background:rgba(4,6,10,.72);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;z-index:200}
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
.ag-wa{background:#143b2c;border:1px solid #2c6b52;color:var(--ok);border-radius:9px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;text-decoration:none}
.ag-wa.tel{background:var(--s8);border-color:var(--s7);color:var(--cyan)}
.ag-icbtn{background:var(--s8);border:1px solid var(--s7);color:var(--s4);border-radius:9px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer}
.ag-icbtn.d{color:var(--red)}

.ag-nav{position:fixed;bottom:0;left:0;right:0;display:flex;background:rgba(16,21,29,.96);border-top:1px solid var(--s7);z-index:100;padding-bottom:env(safe-area-inset-bottom)}
.ag-nav button{flex:1;background:none;border:none;color:var(--s4);padding:9px 0 11px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;font-family:inherit}
.ag-nav button span{font-size:11px;font-weight:700}
.ag-nav button.on{color:var(--gold)}
.ag-toast{position:fixed;bottom:84px;left:50%;transform:translateX(-50%);background:var(--s8);border:1px solid var(--gold);color:var(--champ);padding:11px 18px;border-radius:11px;font-size:13.5px;font-weight:700;z-index:300;box-shadow:0 8px 30px rgba(0,0,0,.5);max-width:90vw;text-align:center}
`}</style>;
}
