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
const clr = (n) => parseFloat(n) >= 0 ? "text-emerald-400" : "text-red-400";

/* ── Setup form ────────────────────────────────────────── */
function SetupForm({ onSave }) {
    const [url, setUrl] = useState(getSimUrl());
    const [key, setKey] = useState(getSimApiKey());
    const save = () => {
          setSimUrl(url);
          setSimApiKey(key);
          onSave();
    };
    return (
          <div className="flex flex-col gap-4 p-6 bg-gray-900 rounded-xl border border-gray-700 max-w-md mx-auto mt-8">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                        <SettingsIcon size={18} />
                        Connect to HeavyGuard Simulator
                </div>
                <p className="text-gray-400 text-sm">
                        Enter the deployed URL of the <code>heavt-guard-simulator</code> backend
                        (e.g.&nbsp;<code>https://heavt-guard-simulator.onrender.com</code>).
                        Leave the API key blank if the server has no auth.
                </p>
                <label className="flex flex-col gap-1 text-sm text-gray-300">
                        Simulator URL
                        <input
                                    className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    placeholder="https://..."
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-300">
                        API Key (optional)
                        <input
                                    className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    placeholder="Leave blank if not required"
                                    value={key}
                                    type="password"
                                    onChange={(e) => setKey(e.target.value)}
                                  />
                </label>
        <button
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 font-semibold transition"
                  onClick={save}
                  disabled={!url.startsWith("http")}
                >
                Save &amp; Connect
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
          <div className="bg-gray-800 rounded-lg p-3 flex flex-col gap-1 min-w-[110px]">
                <span className="text-gray-400 text-xs font-mono">{sym}/USDT</span>
                <span className="text-white font-bold text-base">${fmt(d.markPrice)}</span>
                <span className={`text-xs ${funding >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        Funding {pct(d.lastFundingRate)}
                </span>
          </div>
        );
}

/* ── Scalp signal row ──────────────────────────────────── */
function SignalRow({ s }) {
    const isLong = s.direction === "LONG";
    return (
          <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2 text-sm">
                <span className={`font-bold w-16 ${isLong ? "text-emerald-400" : "text-red-400"}`}>
                  {isLong ? "▲" : "▼"} {s.direction}
                </span>
                <span className="text-white font-mono w-24">{s.symbol}</span>
                <span className="text-gray-400">entry <span className="text-white">{fmt(s.entry)}</span></span>
                <span className="text-gray-400">SL <span className="text-red-400">{fmt(s.sl)}</span></span>
                <span className="text-gray-400">TP <span className="text-emerald-400">{fmt(s.tp)}</span></span>
                <span className="ml-auto text-xs text-gray-500">conf {Math.round(s.confidence * 100)}%</span>
          </div>
        );
}

/* ── Position row ──────────────────────────────────────── */
function PositionRow({ p, onClose }) {
    const pnl = parseFloat(p.unRealizedProfit);
    return (
          <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2 text-sm">
                <span className="text-white font-mono w-24">{p.symbol}</span>
                <span className="text-gray-400">qty <span className="text-white">{p.positionAmt}</span></span>
                <span className="text-gray-400">@ <span className="text-white">{fmt(p.entryPrice)}</span></span>
                <span className={`ml-auto font-bold ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)} USDT
                </span>
                <button
                          className="ml-2 text-gray-500 hover:text-red-400 transition"
                          title="Close position"
                          onClick={() => onClose(p.symbol)}
                        >
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
    const [busyClose, setBusyClose] = useState(null);
  
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
          setBusyClose(symbol);
          try {
                  await sim.closeFuturesPosition(symbol);
                  await load();
          } catch (e) {
                  setError(e.message);
          } finally {
                  setBusyClose(null);
          }
    };
  
    const closeAll = async () => {
          if (!window.confirm("Close ALL open paper positions?")) return;
          try {
                  await sim.closeAllPositions();
                  await load();
          } catch (e) {
                  setError(e.message);
          }
    };
  
    if (!configured) {
          return <SetupForm onSave={() => { setConfigured(true); }} />;
    }
  
    return (
          <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto text-white">
            {/* Header */}
                <div className="flex items-center gap-3">
                        <BarChart3 size={20} className="text-blue-400" />
                        <span className="font-semibold text-lg">HeavyGuard Simulator</span>
                        <span className="text-xs text-gray-500 truncate max-w-[200px]">{getSimUrl()}</span>
                        <div className="ml-auto flex items-center gap-2">
                          {status === "online" && (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                                      <CheckCircle2 size={12} /> Live
                        </span>
                                  )}
                          {status === "offline" && (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                                      <XCircle size={12} /> Offline
                        </span>
                                  )}
                                  <button
                                                className="text-gray-400 hover:text-white transition"
                                                onClick={load}
                                                title="Refresh"
                                              >
                                              <RefreshCw size={16} className={status === "loading" ? "animate-spin" : ""} />
                                  </button>
                                  <button
                                                className="text-gray-500 hover:text-amber-400 transition"
                                                onClick={() => { setConfigured(false); }}
                                                title="Settings"
                                              >
                                              <SettingsIcon size={16} />
                                  </button>
                        </div>
                </div>
          
            {/* Error banner */}
            {error && (
                    <div className="flex items-center gap-2 bg-red-900/40 border border-red-700 rounded px-3 py-2 text-red-300 text-sm">
                              <AlertTriangle size={14} />
                      {error}
                    </div>
                )}
          
            {/* Fear & Greed */}
            {overview?.fearGreed && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Activity size={14} />
                              Fear &amp; Greed:
                              <span className="text-white font-bold">{overview.fearGreed.value}</span>
                              <span className="text-gray-500">({overview.fearGreed.classification})</span>
                    </div>
                )}
          
            {/* Price cards */}
            {prices.length > 0 && (
                    <div>
                              <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Live Prices</div>
                              <div className="flex flex-wrap gap-2">
                                {prices.map((d) => <PriceCard key={d.symbol} d={d} />)}
                              </div>
                    </div>
                )}
          
            {/* Scalp signals */}
            {signals.length > 0 && (
                    <div>
                              <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1">
                                          <Zap size={12} /> Scalp Signals
                              </div>
                              <div className="flex flex-col gap-1">
                                {signals.map((s) => <SignalRow key={s.symbol} s={s} />)}
                              </div>
                    </div>
                )}
          
            {/* Open positions */}
                <div>
                        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider flex items-center justify-between">
                                  <span className="flex items-center gap-1"><Shield size={12} /> Paper Positions ({positions.length})</span>
                          {positions.length > 0 && (
                        <button
                                        className="text-red-400 hover:text-red-300 text-xs transition"
                                        onClick={closeAll}
                                      >
                                      Close All
                        </button>
                                  )}
                        </div>
                  {positions.length === 0 ? (
                      <div className="text-gray-600 text-sm italic">No open positions</div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {positions.map((p) => (
                                      <PositionRow
                                                        key={p.symbol}
                                                        p={p}
                                                        onClose={closePosition}
                                                      />
                                    ))}
                      </div>
                        )}
                </div>
          
                <div className="text-xs text-gray-700 mt-auto pt-2 border-t border-gray-800">
                        Paper trading only — no real funds involved.
                </div>
          </div>
        );
}
