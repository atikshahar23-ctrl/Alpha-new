/**
 * SimulatorPanel.jsx
 * ---------------------------------------------------------
 * A self-contained React panel that plugs into agents/App.jsx,
 * giving every agent a live window into the HeavyGuard trading
 * simulator (heavt-guard-simulator repo).
 *
 * How to add it to agents/App.jsx
 * --------------------------------
 * 1. Import at the top:
 *      import SimulatorPanel from "./SimulatorPanel.jsx";
 *
 * 2. Add a "Simulator" tab button alongside the existing agent tabs.
 *
 * 3. Render <SimulatorPanel /> when that tab is active.
 *
 * 4. To give an individual agent access to simulator tools, pass
 *    agentTools={AGENT_TOOLS} and onToolCall={handleAgentToolCall}
 *    (both from simulatorBridge.ts) into the agent's askAI call.
 *
 * The panel works in three modes:
 *   - Not configured  → shows a setup form (URL + optional API key)
 *   - Configured, offline → shows a clear error + retry button
 *   - Configured, online → shows live market data + action buttons
 *
 * Styling note: this file uses plain CSS classes (prefixed "sp-"),
 * defined in the <SimulatorPanelStyle/> block below and matching the
 * app's existing dark-glass-gold design system — not Tailwind, which
 * isn't part of this project's build.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity, Settings as SettingsIcon, RefreshCw, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, XCircle, Zap, Shield, BarChart3, X,
} from "lucide-react";
import {
  sim,
  isSimConfigured,
  getSimUrl,
  setSimUrl,
  getSimApiKey,
  setSimApiKey,
} from "../src/modules/simulatorBridge";

/* ── Tiny helpers ──────────────────────────────────────── */
const fmt = (n) => parseFloat(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
const pct = (n) => (parseFloat(n || 0) * 100).toFixed(4) + "%";

/* ── Scoped styling (plain CSS, no Tailwind in this project) ── */
function SimulatorPanelStyle() {
  return (
    <style>{`
.sp-root{font-family:'Heebo',Arial,sans-serif;color:#E4E8FA;height:100%;display:flex;flex-direction:column}
.sp-setup{display:flex;flex-direction:column;gap:14px;padding:22px;margin:32px auto;max-width:380px;
  background:linear-gradient(160deg,rgba(16,14,32,.96),rgba(8,8,18,.97));border:1px solid rgba(218,165,32,.28);
  border-radius:16px;box-shadow:0 10px 34px rgba(0,0,0,.45)}
.sp-setup-head{display:flex;align-items:center;gap:8px;color:#E4BC63;font-weight:800;font-size:14.5px}
.sp-setup-note{color:#7886B8;font-size:12.5px;line-height:1.65}
.sp-setup-note code{background:rgba(228,188,99,.12);color:#E4BC63;padding:1px 5px;border-radius:5px;font-size:11.5px}
.sp-field{display:flex;flex-direction:column;gap:5px;font-size:12.5px;color:#B7BEE0}
.sp-input{background:#10101F;border:1px solid rgba(120,134,184,.35);border-radius:10px;padding:10px 12px;
  color:#E4E8FA;font-size:13.5px;font-family:inherit;direction:ltr;text-align:left}
.sp-input:focus{outline:none;border-color:#E4BC63}
.sp-btn{background:linear-gradient(135deg,#E4BC63,#B48828);color:#1A1305;border:none;border-radius:11px;
  padding:11px 18px;font-weight:800;font-size:13.5px;cursor:pointer;transition:opacity .15s,transform .15s;
  font-family:inherit}
.sp-btn:hover{transform:translateY(-1px)}
.sp-btn:disabled{opacity:.4;cursor:not-allowed;transform:none}
.sp-head{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid rgba(110,170,240,.18)}
.sp-head-title{font-weight:800;font-size:15px}
.sp-head-url{font-size:11px;color:#7886B8;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;direction:ltr}
.sp-badge{display:flex;align-items:center;gap:4px;font-size:11.5px}
.sp-badge.on{color:#34D399}
.sp-badge.off{color:#F87171}
.sp-icon-btn{background:none;border:none;color:#7886B8;cursor:pointer;padding:4px;display:flex;transition:color .15s}
.sp-icon-btn:hover{color:#E4E8FA}
.sp-icon-btn.spin svg{animation:spSpin 1s linear infinite}
@keyframes spSpin{to{transform:rotate(360deg)}}
.sp-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:16px}
.sp-error{display:flex;align-items:center;gap:8px;background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.4);
  border-radius:10px;padding:9px 12px;color:#FCA5A5;font-size:12.5px}
.sp-fg{display:flex;align-items:center;gap:6px;font-size:12.5px;color:#7886B8}
.sp-fg b{color:#E4E8FA}
.sp-section-label{font-size:11px;color:#7886B8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;
  display:flex;align-items:center;gap:5px}
.sp-price-row{display:flex;flex-wrap:wrap;gap:8px}
.sp-price-card{background:#10101F;border:1px solid rgba(120,134,184,.2);border-radius:12px;padding:10px 12px;
  display:flex;flex-direction:column;gap:3px;min-width:104px}
.sp-price-sym{font-size:11px;color:#7886B8;font-family:monospace}
.sp-price-val{font-weight:800;font-size:14.5px}
.sp-price-fund{font-size:11px}
.sp-price-fund.up{color:#34D399}
.sp-price-fund.down{color:#F87171}
.sp-row{display:flex;align-items:center;gap:10px;background:#10101F;border-radius:11px;padding:9px 12px;font-size:12.5px}
.sp-dir{font-weight:800;width:56px}
.sp-dir.up{color:#34D399}
.sp-dir.down{color:#F87171}
.sp-sym{font-family:monospace;color:#E4E8FA;width:82px}
.sp-muted{color:#7886B8}
.sp-conf{margin-inline-start:auto;font-size:11px;color:#5C6690}
.sp-pos-pnl{margin-inline-start:auto;font-weight:800}
.sp-pos-pnl.up{color:#34D399}
.sp-pos-pnl.down{color:#F87171}
.sp-close-x{margin-inline-start:6px;color:#5C6690;background:none;border:none;cursor:pointer;display:flex}
.sp-close-x:hover{color:#F87171}
.sp-empty{color:#5C6690;font-size:12.5px;font-style:italic}
.sp-closeall{color:#F87171;background:none;border:none;font-size:11.5px;cursor:pointer;font-family:inherit}
.sp-closeall:hover{text-decoration:underline}
.sp-foot{margin-top:auto;padding-top:10px;border-top:1px solid rgba(110,170,240,.14);font-size:10.5px;color:#4B5480}
    `}</style>
  );
}

/* ── Setup form ────────────────────────────────────────── */
// Same real, deployed URL already used everywhere else in the app (the
// phone's TRADE button, the main dashboard's trade FAB) — pre-filled here
// too so this form can't send someone off to guess/mistype a hostname.
const DEFAULT_SIM_URL = "https://heavt-guard-simulator-1.onrender.com/";

function SetupForm({ onSave }) {
  const [url, setUrl] = useState(getSimUrl() || DEFAULT_SIM_URL);
  const [key, setKey] = useState(getSimApiKey());
  const save = () => {
    setSimUrl(url);
    setSimApiKey(key);
    onSave();
  };
  return (
    <div className="sp-setup">
      <div className="sp-setup-head">
        <SettingsIcon size={17} />
        חיבור לסימולטור HeavyGuard
      </div>
      <p className="sp-setup-note">
        הזינו את כתובת ה-URL של השרת <code>heavt-guard-simulator</code>
        {" "}(השרת שלכם רץ ב-<code>https://heavt-guard-simulator-1.onrender.com/</code>).
        אם לשרת אין הרשאה — השאירו את שדה המפתח ריק.
      </p>
      <label className="sp-field">
        כתובת הסימולטור
        <input
          className="sp-input"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>
      <label className="sp-field">
        מפתח API (אופציונלי)
        <input
          className="sp-input"
          placeholder="השאירו ריק אם לא נדרש"
          value={key}
          type="password"
          onChange={(e) => setKey(e.target.value)}
        />
      </label>
      <button className="sp-btn" onClick={save} disabled={!url.startsWith("http")}>
        שמירה וחיבור
      </button>
    </div>
  );
}

/* ── Price card ────────────────────────────────────────── */
function PriceCard({ d }) {
  if (!d) return null;
  const sym = d.symbol.replace("USDT", "");
  const funding = parseFloat(d.lastFundingRate) * 100;
  return (
    <div className="sp-price-card">
      <span className="sp-price-sym">{sym}/USDT</span>
      <span className="sp-price-val">${fmt(d.markPrice)}</span>
      <span className={`sp-price-fund ${funding >= 0 ? "up" : "down"}`}>
        Funding {pct(d.lastFundingRate)}
      </span>
    </div>
  );
}

/* ── Scalp signal row ──────────────────────────────────── */
function SignalRow({ s }) {
  const isLong = s.direction === "LONG";
  return (
    <div className="sp-row">
      <span className={`sp-dir ${isLong ? "up" : "down"}`}>{isLong ? "▲" : "▼"} {s.direction}</span>
      <span className="sp-sym">{s.symbol}</span>
      <span className="sp-muted">entry <span style={{ color: "#E4E8FA" }}>{fmt(s.entry)}</span></span>
      <span className="sp-muted">SL <span style={{ color: "#F87171" }}>{fmt(s.sl)}</span></span>
      <span className="sp-muted">TP <span style={{ color: "#34D399" }}>{fmt(s.tp)}</span></span>
      <span className="sp-conf">conf {Math.round(s.confidence * 100)}%</span>
    </div>
  );
}

/* ── Position row ──────────────────────────────────────── */
function PositionRow({ p, onClose }) {
  const pnl = parseFloat(p.unRealizedProfit);
  return (
    <div className="sp-row">
      <span className="sp-sym">{p.symbol}</span>
      <span className="sp-muted">qty <span style={{ color: "#E4E8FA" }}>{p.positionAmt}</span></span>
      <span className="sp-muted">@ <span style={{ color: "#E4E8FA" }}>{fmt(p.entryPrice)}</span></span>
      <span className={`sp-pos-pnl ${pnl >= 0 ? "up" : "down"}`}>{pnl >= 0 ? "+" : ""}{pnl.toFixed(2)} USDT</span>
      <button className="sp-close-x" title="סגירת פוזיציה" onClick={() => onClose(p.symbol)}>
        <X size={14} />
      </button>
    </div>
  );
}

/* ── Main panel ────────────────────────────────────────── */
export default function SimulatorPanel() {
  const [configured, setConfigured] = useState(isSimConfigured());
  const [status, setStatus] = useState("idle"); // idle | loading | online | offline
  const [prices, setPrices] = useState([]);
  const [signals, setSignals] = useState([]);
  const [positions, setPositions] = useState([]);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!isSimConfigured()) return;
    setStatus("loading");
    setError("");
    try {
      const [p, s, pos, ov] = await Promise.allSettled([
        sim.getBinanceMulti(),
        sim.getScalpSignals(),
        sim.getOpenPositions(),
        sim.getMarketOverview(),
      ]);
      setPrices(p.status === "fulfilled" ? p.value : []);
      setSignals(s.status === "fulfilled" ? s.value.slice(0, 6) : []);
      setPositions(pos.status === "fulfilled" ? pos.value : []);
      setOverview(ov.status === "fulfilled" ? ov.value : null);
      setStatus("online");
    } catch (e) {
      setError(e.message);
      setStatus("offline");
    }
  }, []);

  useEffect(() => {
    if (configured) load();
  }, [configured, load]);

  // Auto-refresh every 30 s when online
  useEffect(() => {
    if (status !== "online") return;
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [status, load]);

  const closePosition = async (symbol) => {
    try {
      await sim.closeFuturesPosition(symbol);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const closeAll = async () => {
    if (!window.confirm("לסגור את כל הפוזיציות הפתוחות?")) return;
    try {
      await sim.closeAllPositions();
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (!configured) {
    return (
      <div className="sp-root">
        <SimulatorPanelStyle />
        <SetupForm onSave={() => setConfigured(true)} />
      </div>
    );
  }

  return (
    <div className="sp-root">
      <SimulatorPanelStyle />
      <div className="sp-head">
        <BarChart3 size={19} color="#6EA6F0" />
        <span className="sp-head-title">HeavyGuard Simulator</span>
        <span className="sp-head-url">{getSimUrl()}</span>
        <div style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {status === "online" && <span className="sp-badge on"><CheckCircle2 size={12} /> חי</span>}
          {status === "offline" && <span className="sp-badge off"><XCircle size={12} /> לא זמין</span>}
          <button className={`sp-icon-btn ${status === "loading" ? "spin" : ""}`} onClick={load} title="רענון">
            <RefreshCw size={16} />
          </button>
          <button className="sp-icon-btn" onClick={() => setConfigured(false)} title="הגדרות">
            <SettingsIcon size={16} />
          </button>
        </div>
      </div>

      <div className="sp-body">
        {error && (
          <div className="sp-error">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {overview?.fearGreed && (
          <div className="sp-fg">
            <Activity size={14} />
            פחד ותאוות בצע: <b>{overview.fearGreed.value}</b>
            <span>({overview.fearGreed.classification})</span>
          </div>
        )}

        {prices.length > 0 && (
          <div>
            <div className="sp-section-label">מחירים חיים</div>
            <div className="sp-price-row">
              {prices.map((d) => <PriceCard key={d.symbol} d={d} />)}
            </div>
          </div>
        )}

        {signals.length > 0 && (
          <div>
            <div className="sp-section-label"><Zap size={12} /> איתותי סקאלפינג</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {signals.map((s) => <SignalRow key={s.symbol} s={s} />)}
            </div>
          </div>
        )}

        <div>
          <div className="sp-section-label" style={{ justifyContent: "space-between", display: "flex" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Shield size={12} /> פוזיציות פתוחות ({positions.length})</span>
            {positions.length > 0 && <button className="sp-closeall" onClick={closeAll}>סגירת הכול</button>}
          </div>
          {positions.length === 0 ? (
            <div className="sp-empty">אין פוזיציות פתוחות</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {positions.map((p) => <PositionRow key={p.symbol} p={p} onClose={closePosition} />)}
            </div>
          )}
        </div>

        <div className="sp-foot">מסחר נייר בלבד — ללא כסף אמיתי מעורב.</div>
      </div>
    </div>
  );
}
