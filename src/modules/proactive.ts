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

function checkFollowUps(notify: Notify, s: Record<string, number>) {
  // Sales leads whose follow-up date is today or overdue.
  const today = new Date().toISOString().slice(0, 10);
  let leads: any[] = [];
  try { leads = JSON.parse(localStorage.getItem('alpha_leads_v1') || '[]'); } catch {}
  for (const l of leads) {
    if (!l.followUp || l.status === 'won' || l.status === 'lost') continue;
    if (l.followUp <= today) {
      const key = 'followup:' + l.id + ':' + l.followUp;
      if (!s[key]) {
        s[key] = Date.now();
        const who = l.name || l.phone || 'lead';
        notify('Follow-up due', `${who}${l.vehicle ? ' · ' + l.vehicle : ''}`);
        pushNotification('📋 Follow-up due', who);
      }
    }
  }
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

function checkHighPriorityTasks(notify: Notify, s: Record<string, number>) {
  try {
    const tasks: { id: string; text: string; done: boolean; priority: string }[] = JSON.parse(localStorage.getItem('alpha_tasks') || '[]');
    const high = tasks.filter(t => !t.done && t.priority === 'high');
    if (high.length >= 3) {
      const key = 'hightasks:' + new Date().toISOString().slice(0, 10);
      if (!s[key]) {
        s[key] = Date.now();
        notify('High priority tasks', `${high.length} high-priority tasks need attention`);
        pushNotification('⚡ High Priority', `${high.length} tasks need your attention`);
      }
    }
  } catch {}
}

function checkGoalDeadlines(notify: Notify, s: Record<string, number>) {
  try {
    const goals: { id: string; title: string; deadline?: string }[] = JSON.parse(localStorage.getItem('alpha_goals_v1') || '[]');
    const soon = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10);
    for (const g of goals) {
      if (g.deadline && g.deadline <= soon) {
        const key = 'goal:' + g.id;
        if (!s[key]) {
          s[key] = Date.now();
          notify('Goal deadline approaching', g.title);
          pushNotification('🎯 Goal deadline', g.title);
        }
      }
    }
  } catch {}
}

function checkInvoiceDue(notify: Notify, s: Record<string, number>) {
  try {
    const invoices: { id: string; number: string; customer: string; dueDate: string; status: string }[] = JSON.parse(localStorage.getItem('alpha_invoices_v1') || '[]');
    const today = new Date().toISOString().slice(0, 10);
    for (const inv of invoices) {
      if (inv.status !== 'paid' && inv.dueDate && inv.dueDate <= today) {
        const key = 'invdue:' + inv.id;
        if (!s[key]) {
          s[key] = Date.now();
          notify('Invoice overdue', `${inv.number} — ${inv.customer}`);
          pushNotification('📄 Invoice overdue', `${inv.number} — ${inv.customer}`);
        }
      }
    }
  } catch {}
}

export function runProactive(notify: Notify) {
  const tick = async () => {
    const s = seen();
    try { checkInstalls(notify, s); } catch {}
    try { checkFollowUps(notify, s); } catch {}
    try { checkHighPriorityTasks(notify, s); } catch {}
    try { checkGoalDeadlines(notify, s); } catch {}
    try { checkInvoiceDue(notify, s); } catch {}
    try { await checkPrices(notify); } catch {}
    markSeen(s);
  };
  setTimeout(tick, 8000);
  setInterval(tick, CHECK_MS);
}
