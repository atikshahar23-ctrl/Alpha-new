#!/usr/bin/env node
// ── scalp-shift — the server-side shift of the 3-candle scalp desk ─────
//
// Runs on GitHub Actions (schedule ~every 5 min) so the paper desk keeps
// trading when no phone is open. Same method as scalp.html, same honesty
// rules:
//   • paper first — the paper ledger is always the source of truth
//   • OPTIONAL Binance Futures TESTNET mirror (v460): when the repo has
//     BINANCE_TESTNET_KEY/SECRET secrets, every paper entry/exit is
//     mirrored as a REAL order on testnet.binancefuture.com — demo money
//     by design, and the keys live ONLY in GitHub Secrets, never in the
//     browser and never in this repo's files
//   • every number from real market data; unreachable market = honest
//     error in the state, not invented candles
//   • stop is graded from candle WICKS before the close (conservative,
//     same as the browser's shadow ledger) because a scheduled run has
//     no live tick
//   • its own wallet + ledger, separate from the phone wallet — the two
//     are never merged, so no balance is ever double-counted
//
// State lives on the orphan branch `shift-data` as shift.json; the page
// reads it from raw.githubusercontent.com. Commands (arg 1):
//   run (default) — one trading cycle
//   on / off      — arm / disarm the shift
//   reset         — fresh $1000 wallet (ledger kept)
//   cfg ...       — method settings (stop/ct/floor/score/size/lev/fee)
//
// Local testing: SHIFT_STATE_FILE=<path> switches state to a local file,
// SHIFT_FAPI / SHIFT_SPOT / SHIFT_TN_BASE override bases (mock servers).

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHmac } from 'node:crypto';

const FAPI = process.env.SHIFT_FAPI || 'https://fapi.binance.com';
const SPOT = process.env.SHIFT_SPOT || 'https://data-api.binance.vision';
const TN_BASE = process.env.SHIFT_TN_BASE || 'https://testnet.binancefuture.com';
const TN_KEY = process.env.BINANCE_TESTNET_KEY || '';
const TN_SEC = process.env.BINANCE_TESTNET_SECRET || '';
const TN_ON = !!(TN_KEY && TN_SEC);
const STATE_FILE = process.env.SHIFT_STATE_FILE || null;
const BRANCH = 'shift-data';
const CMD = (process.argv[2] || 'run').toLowerCase();

const DEF = () => ({ v: 1, on: true, paper: true,
  w: { bal: 1000, size: 100, lev: 5, stop: 1.5, fee: 0.05 },
  pos: null, hist: [], cooldown: {}, pauseUntil: 0,
  lastRun: 0, runs: 0, src: null, err: null, note: '',
  tn: null, tnPending: null, tnSteps: null });

// ── state I/O ──────────────────────────────────────────────────────────
function git(args, opts = {}) {
  return execFileSync('git', args, { encoding: 'utf8', ...opts }).trim();
}
function loadState() {
  if (STATE_FILE) {
    try { return Object.assign(DEF(), JSON.parse(readFileSync(STATE_FILE, 'utf8'))); }
    catch { return DEF(); }
  }
  try {
    git(['fetch', 'origin', BRANCH]);
    return Object.assign(DEF(), JSON.parse(git(['show', 'FETCH_HEAD:shift.json'])));
  } catch { return DEF(); }
}
function saveState(s) {
  s.hist = s.hist.slice(-80);
  const json = JSON.stringify(s, null, 1);
  if (STATE_FILE) { writeFileSync(STATE_FILE, json); return; }
  writeFileSync('shift.json', json);
  const blob = git(['hash-object', '-w', 'shift.json']);
  const tree = git(['mktree'], { input: `100644 blob ${blob}\tshift.json\n` });
  const commit = git(['commit-tree', tree, '-m', 'shift state ' + new Date().toISOString()],
    { env: { ...process.env,
      GIT_AUTHOR_NAME: 'scalp-shift', GIT_AUTHOR_EMAIL: 'actions@github.com',
      GIT_COMMITTER_NAME: 'scalp-shift', GIT_COMMITTER_EMAIL: 'actions@github.com' } });
  git(['push', '--force', 'origin', `${commit}:refs/heads/${BRANCH}`]);
}

// ── market data — futures first, honest spot fallback, honest failure ──
async function jget(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}
const STABLES = new Set(['USDC', 'FDUSD', 'TUSD', 'DAI', 'BUSD', 'USDP', 'EUR', 'USD1']);
async function universe(s) {
  try {
    const t = await jget(FAPI + '/fapi/v1/ticker/24hr');
    s.src = 'fapi';
    return top12(t);
  } catch {
    const t = await jget(SPOT + '/api/v3/ticker/24hr');   // real spot data — labeled as such
    s.src = 'spot';
    return top12(t);
  }
}
function top12(t) {
  return t.filter(x => /USDT$/.test(x.symbol) && !STABLES.has(x.symbol.replace(/USDT$/, '')))
    .map(x => ({ pair: x.symbol, sym: x.symbol.replace(/USDT$/, ''), vol: +x.quoteVolume || 0 }))
    .sort((a, b) => b.vol - a.vol).slice(0, 12);
}
async function klines(s, pair, params) {
  const base = s.src === 'spot' ? SPOT + '/api/v3/klines' : FAPI + '/fapi/v1/klines';
  const raw = await jget(base + '?symbol=' + pair + '&interval=1m&' + params);
  if (!Array.isArray(raw)) throw new Error('bad klines');
  return raw.map(a => ({ t: +a[0], o: +a[1], h: +a[2], l: +a[3], c: +a[4], v: +a[5] || 0 }));
}

// ── the brain — EXACT copy of scalp.html brainCore factor math ─────────
function emaLast(a, n) { const k = 2 / (n + 1); let e = a[0];
  for (let i = 1; i < a.length; i++) e = a[i] * k + e * (1 - k); return e; }
function rsi14(closes) {
  const n = closes.length; if (n < 16) return 50;
  let g = 0, l = 0;
  for (let i = n - 14; i < n; i++) { const d = closes[i] - closes[i - 1]; if (d >= 0) g += d; else l -= d; }
  if (g + l === 0) return 50;
  if (l === 0) return 100;
  return 100 - 100 / (1 + (g / 14) / (l / 14));
}
function brainCore(cs) {
  if (!cs || cs.length < 25) return null;
  const closes = cs.map(c => c.c), n = closes.length, p = closes[n - 1];
  if (!(p > 0)) return null;
  const gap = (emaLast(closes, 9) - emaLast(closes, 21)) / p * 100;
  const rsi = rsi14(closes);
  const b5 = closes[Math.max(0, n - 6)], b15 = closes[Math.max(0, n - 16)];
  const m5 = b5 > 0 ? (p - b5) / b5 * 100 : 0, m15 = b15 > 0 ? (p - b15) / b15 * 100 : 0;
  const vols = cs.map(c => c.v || 0);
  const histV = vols.slice(-31, -1).slice().sort((x, y) => x - y);
  const med = histV[Math.floor(histV.length / 2)] || 0;
  const volX = med > 0 ? vols[n - 1] / med : 1;
  const ls = [m15 > 0.1, m5 > 0.05, gap > 0, rsi >= 45 && rsi <= 70, volX >= 1.2].filter(Boolean).length;
  const ss = [m15 < -0.1, m5 < -0.05, gap < 0, rsi >= 30 && rsi <= 55, volX >= 1.2].filter(Boolean).length;
  return { p, m15: +m15.toFixed(2), ls, ss };
}

// ── Binance Futures TESTNET mirror (v460) — demo money, keys in Secrets ──
async function tnCall(method, path, params) {
  const q = new URLSearchParams({ ...params, timestamp: Date.now(), recvWindow: 10000 }).toString();
  const sig = createHmac('sha256', TN_SEC).update(q).digest('hex');
  const r = await fetch(`${TN_BASE}${path}?${q}&signature=${sig}`,
    { method, headers: { 'X-MBX-APIKEY': TN_KEY }, signal: AbortSignal.timeout(10000) });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error((j && (j.msg || j.code)) || ('HTTP ' + r.status));
  return j;
}
async function tnEnsureSteps(s, sym) {
  if (s.tnSteps && s.tnSteps[sym]) return;
  const info = await jget(TN_BASE + '/fapi/v1/exchangeInfo');
  const map = {};
  for (const x of info.symbols || []) {
    const f = (x.filters || []).find(f2 => f2.filterType === 'LOT_SIZE');
    if (f) map[x.baseAsset] = +f.stepSize;
  }
  s.tnSteps = map;
}
function tnQty(s, sym, raw) {
  const step = (s.tnSteps && s.tnSteps[sym]) || 0.001;
  const q = Math.floor(raw / step) * step;
  const dec = Math.max(0, (String(step).split('.')[1] || '').length);
  return +q.toFixed(dec);
}
async function tnMirrorEntry(s, pair, sym, dir, px) {
  if (!TN_ON) return;
  try {
    await tnEnsureSteps(s, sym);
    try { await tnCall('POST', '/fapi/v1/leverage', { symbol: pair, leverage: s.w.lev }); } catch (e) {}
    const qty = tnQty(s, sym, s.w.size * s.w.lev / px);
    if (!(qty > 0)) { s.tn = { ...(s.tn || {}), enabled: true, err: 'כמות קטנה מדי לטסטנט (' + sym + ')' }; return; }
    const o = await tnCall('POST', '/fapi/v1/order',
      { symbol: pair, side: dir === 'long' ? 'BUY' : 'SELL', type: 'MARKET', quantity: qty });
    s.pos.tnQty = qty; s.pos.tnOrderId = o.orderId;
    s.tn = { ...(s.tn || {}), enabled: true, lastAct: 'כניסה ' + sym + ' ×' + qty, err: null, at: Date.now() };
  } catch (e) { s.tn = { ...(s.tn || {}), enabled: true, err: 'כניסת טסטנט נכשלה: ' + (e.message || e), at: Date.now() }; }
}
async function tnFlushPending(s) {
  if (!TN_ON || !s.tnPending) return;
  try {
    const pd = s.tnPending;
    const o = await tnCall('POST', '/fapi/v1/order',
      { symbol: pd.symbol, side: pd.side, type: 'MARKET', quantity: pd.qty, reduceOnly: 'true' });
    s.tn = { ...(s.tn || {}), enabled: true, lastAct: 'סגירה ' + pd.symbol + ' ×' + pd.qty, err: null, at: Date.now() };
    s.tnPending = null; void o;
  } catch (e) {
    // kept pending — retried honestly on the next run
    s.tn = { ...(s.tn || {}), enabled: true, err: 'סגירת טסטנט נכשלה (ינוסה שוב): ' + (e.message || e), at: Date.now() };
  }
}
async function tnBalance(s) {
  if (!TN_ON) { if (s.tn) s.tn.enabled = false; return; }
  try {
    const bal = await tnCall('GET', '/fapi/v2/balance', {});
    const usdt = (bal || []).find(b2 => b2.asset === 'USDT');
    s.tn = { ...(s.tn || {}), enabled: true, bal: usdt ? +(+usdt.balance).toFixed(2) : null, at: Date.now() };
  } catch (e) { s.tn = { ...(s.tn || {}), enabled: true, err: 'יתרת טסטנט לא נקראה: ' + (e.message || e), at: Date.now() }; }
}

// ── the 3-candle method, replayed over closed candles ──────────────────
function closeTrade(s, px, reason, ct) {
  const p = s.pos, exp = p.size * p.lev;
  const fees = +(exp * (p.fee || 0) / 100 * 2).toFixed(2);
  const mv = p.dir === 'long' ? px / p.entry - 1 : 1 - px / p.entry;
  const pnl = +(mv * exp - fees).toFixed(2);            // NET, like the browser
  s.w.bal = +(s.w.bal + pnl).toFixed(2);
  s.hist.push({ sym: p.sym, dir: p.dir, entry: p.entry, exit: px, pnl, fees,
    reason, ct, t: p.t, xt: Date.now(), srv: true, score: p.score });
  // v460: queue the testnet close — sent (and retried if needed) by cycle()
  if (TN_ON && p.tnQty > 0)
    s.tnPending = { symbol: p.sym + 'USDT', side: p.dir === 'long' ? 'SELL' : 'BUY', qty: p.tnQty };
  s.pos = null;
}
function walkPosition(s, cs) {
  const p = s.pos;
  const stopLv = p.dir === 'long' ? p.entry * (1 - p.stop / 100) : p.entry * (1 + p.stop / 100);
  const exp = p.size * p.lev, fees = exp * (p.fee || 0) / 100 * 2;
  const maxCt = p.maxCt || 3, floor = p.floor || 0;     // v457: frozen at entry, like the phone
  for (let i = 0; i < cs.length - 1; i++) {            // last candle may still be forming
    const c = cs[i];
    if (c.t < p.fromT || c.t <= (p.doneT || 0)) continue;
    // stop by WICK first — conservative, a scheduled run has no live tick
    const hitStop = p.dir === 'long' ? c.l <= stopLv : c.h >= stopLv;
    if (hitStop) { closeTrade(s, stopLv, 'סטופ חירום (-' + p.stop + '%)', p.candles); return; }
    p.candles++; p.doneT = c.t;
    const mv = p.dir === 'long' ? c.c / p.entry - 1 : 1 - c.c / p.entry;
    const net = mv * exp - fees;
    if (net > floor) { closeTrade(s, c.c, 'רווח מהיר — נר ' + p.candles, p.candles); return; }
    if (p.candles >= maxCt) { closeTrade(s, c.c, maxCt + ' נרות — יציאה', p.candles); return; }
  }
}
function coffeePaused(s) {
  const h = s.hist;
  if (h.length >= 3 && h.slice(-3).every(x => x.pnl < 0)) {
    s.pauseUntil = h[h.length - 1].xt + 2 * 3600e3;     // server cool-down: 2h, stated on the page
    return Date.now() < s.pauseUntil;
  }
  s.pauseUntil = 0;
  return false;
}

// ── one cycle ──────────────────────────────────────────────────────────
async function cycle(s) {
  s.err = null;
  let uni;
  try { uni = await universe(s); }
  catch (e) { s.err = 'השוק לא נגיש מהשרת: ' + (e.message || e); return; }
  // 1) manage the open position against what the market ACTUALLY did
  if (s.pos) {
    try {
      const cs = await klines(s, s.pos.sym + 'USDT', 'startTime=' + s.pos.fromT + '&limit=500');
      walkPosition(s, cs);
    } catch (e) { s.err = 'ניהול הפוזיציה נכשל: ' + (e.message || e); return; }
  }
  // 2) scan for a new entry — same gate as the phone sniper: 4/5+ flow
  //    alignment with |15-min momentum| ≥ 0.25%, one trade at a time
  if (!s.pos && s.on && !coffeePaused(s)) {
    for (const u of uni) {
      if (Date.now() - (s.cooldown[u.sym] || 0) < 10 * 60000) continue;
      let cs;
      try { cs = await klines(s, u.pair, 'limit=30'); } catch { continue; }
      if (cs.length < 25) continue;
      const bn = brainCore(cs); if (!bn) continue;
      const ms = s.w.score === 5 ? 5 : 4;               // v457: configurable threshold
      const dir = (bn.ls >= ms && bn.m15 >= 0.25) ? 'long'
                : (bn.ss >= ms && bn.m15 <= -0.25) ? 'short' : null;
      if (!dir) continue;
      s.cooldown[u.sym] = Date.now();
      const last = cs[cs.length - 1];                   // newest CLOSED candle by fromT below
      if (s.w.size > s.w.bal) { s.note = 'גודל העסקה גדול מהיתרה — אין כניסה'; break; }
      s.pos = { sym: u.sym, dir, entry: last.c, t: Date.now(),
        fromT: last.t + 60000, doneT: 0, candles: 0,
        size: s.w.size, lev: s.w.lev, stop: s.w.stop, fee: s.w.fee,
        maxCt: s.w.maxCt || 3, floor: s.w.floor || 0,
        score: dir === 'long' ? bn.ls : bn.ss, m15: bn.m15 };
      await tnMirrorEntry(s, u.pair, u.sym, dir, last.c);   // v460: demo-money echo
      break;                                            // one trade at a time — the method
    }
  }
  // 3) testnet housekeeping: flush a pending close, read the demo balance
  await tnFlushPending(s);
  await tnBalance(s);
}

// ── main ───────────────────────────────────────────────────────────────
const s = loadState();
if (CMD === 'on') { s.on = true; s.pauseUntil = 0; s.note = 'המשמרת הופעלה'; }
else if (CMD === 'off') { s.on = false; s.note = 'המשמרת כובתה — פוזיציה פתוחה עדיין תנוהל עד סגירה'; }
else if (CMD === 'reset') { s.w.bal = 1000; s.note = 'הארנק אופס ל-$1000'; }
else if (CMD.startsWith('cfg')) {
  // v457: full method parity from GitHub mobile — e.g.
  //   cfg stop=1 ct=2 floor=0.5 score=5 size=50 lev=10
  // (also accepts cfg:stop=1,ct=2). Applies from the NEXT entry; an open
  // position keeps the rules it entered with, like the phone.
  const kv = {};
  CMD.replace(/(stop|ct|floor|score|size|lev|fee)\s*=\s*([\d.]+)/g, (m, k, v) => { kv[k] = +v; return m; });
  if (kv.stop > 0 && kv.stop <= 5) s.w.stop = kv.stop;
  if (kv.ct >= 1 && kv.ct <= 6) s.w.maxCt = Math.round(kv.ct);
  if (kv.floor >= 0 && kv.floor <= 10) s.w.floor = kv.floor;
  if (kv.score === 4 || kv.score === 5) s.w.score = kv.score;
  if (kv.size >= 1) s.w.size = kv.size;
  if (kv.lev >= 1 && kv.lev <= 50) s.w.lev = Math.round(kv.lev);
  if (kv.fee >= 0 && kv.fee <= 1) s.w.fee = kv.fee;
  s.note = 'קונפיג עודכן: ' + Object.entries(kv).map(([k, v]) => k + '=' + v).join(' ');
}
else { await cycle(s); }
s.lastRun = Date.now(); s.runs = (s.runs || 0) + 1;
saveState(s);
console.log(JSON.stringify({ on: s.on, bal: s.w.bal, pos: s.pos && s.pos.sym,
  trades: s.hist.length, src: s.src, err: s.err }, null, 1));
