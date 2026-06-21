// ============================================================
// Proactive Alerts — client-side background worker
// Runs while the tab is open: checks for tomorrow's installs, trading
// price thresholds, and saved trend reminders, then fires a browser
// Notification + an in-app system message. (True push-when-closed needs a
// server + Web Push; this is the client-side maximum.)
// ============================================================

export interface PriceAlert {
  id: string;
  symbol: string;        // e.g. BTCUSDT
  above?: number;
  below?: number;
  note: string;
  fired?: boolean;
}

const SEEN_KEY = 'alpha_proactive_seen_v1';
const CHECK_MS = 60_000; // re-check every minute

type Notify = (title: string, body: string) => void;

function seen(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}'); } catch { return {}; }
}
function markSeen(s: Record<string, number>) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(s)); } catch {}
}

function pushNotification(title: string, body: string) {
  try {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') new Notification(title, { body });
      else if (Notification.permission === 'default') Notification.requestPermission();
    }
  } catch {}
}

export function loadPriceAlerts(): PriceAlert[] {
  try { return JSON.parse(localStorage.getItem('alpha_price_alerts') || '[]'); } catch { return []; }
}
export function savePriceAlerts(a: PriceAlert[]) {
  localStorage.setItem('alpha_price_alerts', JSON.stringify(a));
}

async function fetchPrice(symbol: string): Promise<number | null> {
  try {
    const r = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${encodeURIComponent(symbol)}`);
    if (!r.ok) return null;
    const d = await r.json();
    return parseFloat(d.price);
  } catch { return null; }
}

function checkInstalls(notify: Notify, s: Record<string, number>) {
  // Upcoming HeavyGuard installs / calendar events for tomorrow.
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  let events: { id: string; title: string; date: string }[] = [];
  try {
    const alpha = JSON.parse(localStorage.getItem('alpha_events') || '[]');
    const hg = JSON.parse(localStorage.getItem('hg2:tasks') || '[]')
      .filter((t: any) => !t.done && t.date)
      .map((t: any) => ({ id: 'hg:' + t.id, title: t.title, date: t.date }));
    events = [...alpha, ...hg];
  } catch {}
  for (const e of events) {
    if (e.date === tomorrow) {
      const key = 'install:' + e.id;
      if (!s[key]) {
        s[key] = Date.now();
        notify('Tomorrow', `${e.title} (${e.date})`);
        pushNotification('📅 Tomorrow', `${e.title}`);
      }
    }
  }
}

async function checkPrices(notify: Notify) {
  const alerts = loadPriceAlerts().filter(a => !a.fired);
  if (!alerts.length) return;
  let changed = false;
  for (const a of alerts) {
    const price = await fetchPrice(a.symbol);
    if (price == null) continue;
    const hitAbove = a.above != null && price >= a.above;
    const hitBelow = a.below != null && price <= a.below;
    if (hitAbove || hitBelow) {
      a.fired = true; changed = true;
      const dir = hitAbove ? `above ${a.above}` : `below ${a.below}`;
      notify(`${a.symbol} ${dir}`, `Now ${price}. ${a.note || ''}`.trim());
      pushNotification(`📈 ${a.symbol}`, `${dir} — now ${price}`);
    }
  }
  if (changed) savePriceAlerts(loadPriceAlerts().map(a => alerts.find(x => x.id === a.id) || a));
}

export function runProactive(notify: Notify) {
  const tick = async () => {
    const s = seen();
    try { checkInstalls(notify, s); } catch {}
    try { await checkPrices(notify); } catch {}
    markSeen(s);
  };
  // first pass shortly after load, then on an interval
  setTimeout(tick, 8000);
  setInterval(tick, CHECK_MS);
}
