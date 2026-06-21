// ============================================================
// Master Brain Cockpit
// A unified, Apple-style command center with one tab per module:
// Business · Trading · Creative · Personal · Memory · Advanced.
// Self-contained: reads/writes the same localStorage the assistant uses
// and can hand a crafted prompt back to the chat via the `ask` hook.
// ============================================================
import { MODULE_LIST } from '../brain/modules';
import {
  loadMemory, saveMemory, remember, forgetFact, addProject, removeProject,
  updateProfile, type ModuleId,
} from '../brain/memory';
import { route } from '../brain/router';
import { loadPriceAlerts, savePriceAlerts, type PriceAlert } from './proactive';
import {
  addEvent, loadEvents, addTask, loadTasks, toggleTask, removeTask,
} from '../assistant/state';
import {
  loadLeads, addLead, updateLead, removeLead, advanceLead,
  loadQuotes, setQuoteStatus, removeQuote,
  revenueStats, dueFollowUps, statusLabel, statusHue,
  type LeadStatus,
} from './business';
import {
  loadHabits, addHabit, removeHabit, toggleHabitToday, isHabitDoneToday, habitStreak,
  loadExpenses, addExpense, removeExpense, expenseSummary, EXPENSE_CATEGORIES,
} from './personal';
import {
  todayPomoStats, weekPomoStats, recordPomoSession,
} from './pomodoro';
import {
  MOODS, MOOD_EMOJI, todayMood, logMood, moodStreak,
  todayWater, addWater, sleepAvg, logSleep,
} from './wellness';
import {
  loadGoals, addGoal, removeGoal, toggleMilestone, addMilestoneToGoal, goalProgress,
  activeGoalsSummary, type GoalTimeframe,
} from './goals';
import {
  loadInvoices, createInvoice, setInvoiceStatus, removeInvoice,
  downloadInvoicePDF, invoiceStats, type InvoiceItem,
} from './invoices';

export interface CockpitHooks {
  ask: (q: string) => void;
  addMsgSys: (m: string) => void;
}
export interface CockpitHandle {
  open: () => void;
  close: () => void;
}

type Tab = 'business' | 'trading' | 'creative' | 'personal' | 'memory' | 'advanced';

const el = (tag: string, cls?: string, html?: string): HTMLElement => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

export function mountCockpit(container: HTMLElement, hooks: CockpitHooks): CockpitHandle {
  const overlay = el('div', 'cockpit-overlay');
  overlay.innerHTML = `
    <div class="cockpit">
      <div class="cp-head">
        <div class="cp-title"><span class="cp-glyph">◆</span> MASTER BRAIN</div>
        <button class="cp-close" id="cpClose">✕</button>
      </div>
      <div class="cp-tabs" id="cpTabs"></div>
      <div class="cp-body" id="cpBody"></div>
    </div>`;
  container.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  (overlay.querySelector('#cpClose') as HTMLElement).onclick = () => close();

  const tabsEl = overlay.querySelector('#cpTabs') as HTMLElement;
  const bodyEl = overlay.querySelector('#cpBody') as HTMLElement;

  const TABS: { id: Tab; label: string; hue: number }[] = [
    { id: 'business', label: 'Business', hue: 38 },
    { id: 'trading', label: 'Trading', hue: 145 },
    { id: 'creative', label: 'Creative', hue: 280 },
    { id: 'personal', label: 'Personal', hue: 200 },
    { id: 'memory', label: 'Memory', hue: 45 },
    { id: 'advanced', label: 'Advanced', hue: 20 },
  ];
  let active: Tab = 'business';

  TABS.forEach(t => {
    const b = el('button', 'cp-tab');
    b.textContent = t.label;
    b.style.setProperty('--tab-hue', String(t.hue));
    b.onclick = () => { active = t.id; renderTabs(); renderBody(); };
    (b as any)._tab = t.id;
    tabsEl.appendChild(b);
  });

  function renderTabs() {
    tabsEl.querySelectorAll('.cp-tab').forEach(b => {
      b.classList.toggle('active', (b as any)._tab === active);
    });
  }

  function renderBody() {
    bodyEl.innerHTML = '';
    if (active === 'business') renderBusiness(bodyEl, hooks, close);
    else if (active === 'trading') renderTrading(bodyEl, hooks, close);
    else if (active === 'creative') renderCreative(bodyEl, hooks, close);
    else if (active === 'personal') renderPersonal(bodyEl, hooks, close);
    else if (active === 'memory') renderMemory(bodyEl);
    else if (active === 'advanced') renderAdvanced(bodyEl, hooks, close);
  }

  function open() { overlay.classList.add('show'); renderTabs(); renderBody(); }
  function close() { overlay.classList.remove('show'); }

  return { open, close };
}

// ── shared UI builders ─────────────────────────────────
function card(title: string, sub?: string): HTMLElement {
  const c = el('div', 'cp-card');
  c.appendChild(el('div', 'cp-card-title', esc(title)));
  if (sub) c.appendChild(el('div', 'cp-card-sub', esc(sub)));
  return c;
}
function field(label: string, input: HTMLElement): HTMLElement {
  const w = el('div', 'cp-field');
  w.appendChild(el('label', 'cp-label', esc(label)));
  w.appendChild(input);
  return w;
}
function btn(label: string, primary = false): HTMLButtonElement {
  const b = el('button', 'cp-btn' + (primary ? ' primary' : '')) as HTMLButtonElement;
  b.textContent = label;
  return b;
}
function input(placeholder = '', value = ''): HTMLInputElement {
  const i = el('input', 'cp-input') as HTMLInputElement;
  i.placeholder = placeholder; i.value = value;
  return i;
}
function textarea(placeholder = '', rows = 4): HTMLTextAreaElement {
  const t = el('textarea', 'cp-textarea') as HTMLTextAreaElement;
  t.placeholder = placeholder; t.rows = rows;
  return t;
}

// ============================================================
// BUSINESS — revenue dashboard, sales pipeline (CRM), quotes,
//           follow-ups, marketing engine, quick quote
// ============================================================
function renderBusiness(root: HTMLElement, hooks: CockpitHooks, close: () => void) {
  // ── Revenue dashboard ──
  const dash = card('Revenue Dashboard', 'Realised vs. pipeline · last 6 months');
  const stats = revenueStats();
  const kpis = el('div', 'cp-kpis');
  kpis.innerHTML =
    `<div class="cp-kpi"><span class="cp-kpi-val">₪${stats.realised.toLocaleString()}</span><span class="cp-kpi-lbl">Realised</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">₪${stats.pipeline.toLocaleString()}</span><span class="cp-kpi-lbl">Pipeline</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${Math.round(stats.winRate * 100)}%</span><span class="cp-kpi-lbl">Win rate</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${stats.openLeads}</span><span class="cp-kpi-lbl">Open leads</span></div>`;
  dash.appendChild(kpis);
  // mini bar chart of last 6 months
  const maxM = Math.max(1, ...stats.byMonth.map(m => m.total));
  const chart = el('div', 'cp-chart');
  stats.byMonth.forEach(m => {
    const bar = el('div', 'cp-bar');
    const fill = el('div', 'cp-bar-fill');
    fill.style.height = `${Math.max(3, (m.total / maxM) * 100)}%`;
    bar.appendChild(fill);
    bar.appendChild(el('span', 'cp-bar-lbl', m.month.slice(5)));
    bar.title = `${m.month}: ₪${m.total.toLocaleString()}`;
    chart.appendChild(bar);
  });
  dash.appendChild(chart);
  const aiRev = btn('AI revenue insights');
  aiRev.onclick = () => {
    hooks.ask(`Act as my business CFO. Here are my numbers: realised revenue ₪${stats.realised.toLocaleString()}, ` +
      `open pipeline ₪${stats.pipeline.toLocaleString()}, win rate ${Math.round(stats.winRate * 100)}%, ` +
      `${stats.openLeads} open leads, last 6 months: ${stats.byMonth.map(m => m.month + '=₪' + m.total).join(', ')}. ` +
      `Give me 3 concrete actions to grow revenue this month.`);
    close();
  };
  dash.appendChild(aiRev);
  root.appendChild(dash);

  // ── Follow-ups due ──
  const due = dueFollowUps();
  if (due.length) {
    const fu = card('⏰ Follow-ups due', `${due.length} lead(s) need a touch`);
    const fuList = el('div', 'cp-list');
    due.forEach(l => {
      const r = el('div', 'cp-row');
      r.innerHTML = `<span class="cp-row-main">${esc(l.name || 'Lead')}</span>` +
        `<span class="cp-row-sub">${esc(l.vehicle || l.service || '')}</span>` +
        `<span class="cp-row-tag" style="color:#ff5d73">${esc(l.followUp)}</span>`;
      if (l.phone) {
        const callA = el('a', 'cp-x') as HTMLAnchorElement;
        callA.textContent = '📞'; callA.href = `tel:${l.phone}`;
        r.appendChild(callA);
      }
      fuList.appendChild(r);
    });
    fu.appendChild(fuList);
    root.appendChild(fu);
  }

  // ── Sales pipeline (CRM) ──
  const pipe = card('Sales Pipeline', 'Track every lead from first call to win');
  const lName = input('Customer / company');
  const lPhone = input('Phone');
  const lVeh = input('Vehicle — e.g. Scania R450');
  const lSvc = input('Service — e.g. 360° camera + tracker');
  const lVal = input('Deal value (₪)');
  const lFollow = el('input', 'cp-input') as HTMLInputElement; lFollow.type = 'date';
  const addL = btn('Add lead', true);
  const pipeList = el('div', 'cp-list');
  const STATUS_NEXT_LABEL: Record<LeadStatus, string> = {
    lead: '→ Contacted', contacted: '→ Quoted', quoted: '→ Won', won: 'Won ✓', lost: 'Lost',
  };
  const drawPipe = () => {
    pipeList.innerHTML = '';
    const leads = loadLeads();
    if (!leads.length) { pipeList.appendChild(el('div', 'cp-empty', 'No leads yet. Add your first above.')); return; }
    leads.forEach(l => {
      const r = el('div', 'cp-row');
      const hue = statusHue(l.status);
      r.innerHTML =
        `<span class="cp-row-main">${esc(l.name || 'Lead')}` +
        (l.value ? ` <span class="cp-row-sub">₪${l.value.toLocaleString()}</span>` : '') + `</span>` +
        `<span class="cp-row-tag" style="color:hsl(${hue},70%,60%)">${esc(statusLabel(l.status))}</span>`;
      if (l.status !== 'won' && l.status !== 'lost') {
        const adv = el('button', 'cp-x') as HTMLButtonElement;
        adv.textContent = STATUS_NEXT_LABEL[l.status];
        adv.style.color = 'var(--cyan)'; adv.style.fontSize = '11px';
        adv.onclick = () => { advanceLead(l.id); drawPipe(); root.replaceChildren(); renderBusiness(root, hooks, close); };
        r.appendChild(adv);
      }
      if (l.status !== 'lost' && l.status !== 'won') {
        const lost = el('button', 'cp-x', '✕'); lost.title = 'Mark lost';
        lost.onclick = () => { updateLead(l.id, { status: 'lost' }); drawPipe(); };
        r.appendChild(lost);
      }
      const del = el('button', 'cp-x', '🗑'); del.title = 'Delete';
      del.onclick = () => { removeLead(l.id); drawPipe(); };
      r.appendChild(del);
      pipeList.appendChild(r);
    });
  };
  addL.onclick = () => {
    if (!lName.value.trim() && !lPhone.value.trim()) return;
    addLead({
      name: lName.value.trim(), phone: lPhone.value.trim(), vehicle: lVeh.value.trim(),
      service: lSvc.value.trim(), value: parseFloat(lVal.value) || 0, followUp: lFollow.value,
    });
    [lName, lPhone, lVeh, lSvc, lVal].forEach(i => i.value = ''); lFollow.value = '';
    root.replaceChildren(); renderBusiness(root, hooks, close);
  };
  pipe.appendChild(field('Customer', lName));
  const pr1 = el('div', 'cp-inline'); pr1.append(lPhone, lVal);
  pipe.appendChild(pr1);
  pipe.appendChild(field('Vehicle', lVeh));
  pipe.appendChild(field('Service', lSvc));
  pipe.appendChild(field('Next follow-up', lFollow));
  pipe.appendChild(addL);
  pipe.appendChild(pipeList);
  drawPipe();
  root.appendChild(pipe);

  // ── Quotes manager ──
  const qm = card('Quotes', 'Saved quotes · update status to feed revenue');
  const qList = el('div', 'cp-list');
  const drawQuotes = () => {
    qList.innerHTML = '';
    const quotes = loadQuotes();
    if (!quotes.length) { qList.appendChild(el('div', 'cp-empty', 'No quotes yet. Create one below.')); return; }
    quotes.slice(0, 15).forEach(q => {
      const r = el('div', 'cp-row');
      const stHue = { draft: 200, sent: 45, accepted: 140, rejected: 0 }[q.status] ?? 200;
      r.innerHTML = `<span class="cp-row-main">${esc(q.customer || 'Customer')} <span class="cp-row-sub">₪${(q.total || 0).toLocaleString()}</span></span>`;
      const sel = el('select', 'cp-mini-sel') as HTMLSelectElement;
      (['draft', 'sent', 'accepted', 'rejected'] as const).forEach(s => {
        const o = el('option') as HTMLOptionElement; o.value = s; o.textContent = s; if (q.status === s) o.selected = true; sel.appendChild(o);
      });
      sel.style.color = `hsl(${stHue},70%,60%)`;
      sel.onchange = () => { setQuoteStatus(q.id, sel.value as any); root.replaceChildren(); renderBusiness(root, hooks, close); };
      r.appendChild(sel);
      const del = el('button', 'cp-x', '✕');
      del.onclick = () => { removeQuote(q.id); drawQuotes(); };
      r.appendChild(del);
      qList.appendChild(r);
    });
  };
  qm.appendChild(qList);
  drawQuotes();
  root.appendChild(qm);

  // ── Invoices ──
  const inv = card('Invoices', 'Professional invoices with VAT');
  const invStats = invoiceStats();
  if (invStats.total > 0) {
    const invKpis = el('div', 'cp-kpis');
    invKpis.innerHTML =
      `<div class="cp-kpi"><span class="cp-kpi-val">${invStats.total}</span><span class="cp-kpi-lbl">Total</span></div>` +
      `<div class="cp-kpi"><span class="cp-kpi-val">${invStats.paid}</span><span class="cp-kpi-lbl">Paid</span></div>` +
      `<div class="cp-kpi"><span class="cp-kpi-val">${invStats.outstanding}</span><span class="cp-kpi-lbl">Outstanding</span></div>` +
      `<div class="cp-kpi"><span class="cp-kpi-val">₪${invStats.revenue.toLocaleString()}</span><span class="cp-kpi-lbl">Revenue</span></div>`;
    inv.appendChild(invKpis);
  }
  const invCust = input('Customer name');
  const invItems = textarea('One per line: Description: Price x Qty\ne.g. 360 camera: 4500 x 1', 3);
  const invNotes = input('Notes (optional)');
  const createInv = btn('Create invoice', true);
  const invList = el('div', 'cp-list');
  const drawInvoices = () => {
    invList.innerHTML = '';
    const list = loadInvoices().slice(0, 10);
    if (!list.length) { invList.appendChild(el('div', 'cp-empty', 'No invoices yet.')); return; }
    list.forEach(i => {
      const r = el('div', 'cp-row');
      const stHue = { draft: 200, sent: 45, paid: 140, overdue: 0 }[i.status] ?? 200;
      r.innerHTML = `<span class="cp-row-main">${esc(i.number)} — ${esc(i.customer)} <span class="cp-row-sub">₪${i.total.toLocaleString()}</span></span>`;
      const sel = el('select', 'cp-mini-sel') as HTMLSelectElement;
      (['draft', 'sent', 'paid', 'overdue'] as const).forEach(s => {
        const o = el('option') as HTMLOptionElement; o.value = s; o.textContent = s; if (i.status === s) o.selected = true; sel.appendChild(o);
      });
      sel.style.color = `hsl(${stHue},70%,60%)`;
      sel.onchange = () => { setInvoiceStatus(i.id, sel.value as any); root.replaceChildren(); renderBusiness(root, hooks, close); };
      r.appendChild(sel);
      const dl = el('button', 'cp-x', '📄'); dl.title = 'Print';
      dl.onclick = () => downloadInvoicePDF(i);
      r.appendChild(dl);
      const del = el('button', 'cp-x', '✕');
      del.onclick = () => { removeInvoice(i.id); drawInvoices(); };
      r.appendChild(del);
      invList.appendChild(r);
    });
  };
  createInv.onclick = () => {
    if (!invCust.value.trim()) return;
    const items: InvoiceItem[] = invItems.value.split('\n').map(l => {
      const [desc, rest] = l.split(':');
      const parts = (rest || '').trim().split(/\s*x\s*/i);
      return { description: (desc || '').trim(), price: parseFloat(parts[0]) || 0, qty: parseInt(parts[1]) || 1 };
    }).filter(i => i.description);
    if (!items.length) return;
    createInvoice(invCust.value.trim(), items, { notes: invNotes.value.trim() });
    invCust.value = ''; invItems.value = ''; invNotes.value = '';
    root.replaceChildren(); renderBusiness(root, hooks, close);
  };
  inv.appendChild(field('Customer', invCust));
  inv.appendChild(field('Items', invItems));
  inv.appendChild(field('Notes', invNotes));
  inv.appendChild(createInv);
  inv.appendChild(invList);
  drawInvoices();
  root.appendChild(inv);

  // ── Marketing engine ──
  const mk = card('Marketing Engine', 'AI viral content for TikTok / Facebook');
  const topic = input('Topic — e.g. 360° camera install on a Scania');
  const platform = el('select', 'cp-input') as HTMLSelectElement;
  ['TikTok', 'Facebook', 'Instagram Reels'].forEach(p => {
    const o = el('option') as HTMLOptionElement; o.value = p; o.textContent = p; platform.appendChild(o);
  });
  const goal = el('select', 'cp-input') as HTMLSelectElement;
  ['Go viral', 'Generate leads', 'Build trust', 'Showcase a job'].forEach(g => {
    const o = el('option') as HTMLOptionElement; o.value = g; o.textContent = g; goal.appendChild(o);
  });
  const gen = btn('Generate content strategy', true);
  gen.onclick = () => {
    const t = topic.value.trim() || '360° truck camera installation';
    const prompt = `Act as a viral social media strategist for a heavy-vehicle safety installation business. ` +
      `Platform: ${platform.value}. Goal: ${goal.value}. Topic: "${t}". ` +
      `Give me: 1) a 3-second hook, 2) a short punchy caption, 3) a shot-list for a 15-30s video, ` +
      `4) 12 optimized hashtags. Keep it tight and ready to post.`;
    hooks.ask(prompt); close();
  };
  mk.appendChild(field('Topic', topic));
  mk.appendChild(field('Platform', platform));
  mk.appendChild(field('Goal', goal));
  mk.appendChild(gen);
  root.appendChild(mk);

  // ── Quoting ──
  const q = card('Quick Quote', 'Natural-language quote → saved to HeavyGuard');
  const cust = input('Customer name');
  const phone = input('Phone');
  const items = textarea('One per line — e.g.\n360 camera system: 4500\nInstallation: 800', 4);
  const save = btn('Create quote', true);
  const out = el('div', 'cp-note');
  save.onclick = () => {
    const lines = items.value.split('\n').map(s => s.trim()).filter(Boolean);
    const parsed = lines.map(l => {
      const [desc, price] = l.split(':');
      return { description: (desc || '').trim(), price: parseFloat(price) || 0, qty: 1 };
    }).filter(i => i.description);
    if (!parsed.length) { out.textContent = 'Add at least one line item.'; return; }
    const total = parsed.reduce((s, i) => s + i.price, 0);
    const quote = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      customer: cust.value.trim(), phone: phone.value.trim(), items: parsed, total,
      date: new Date().toISOString().slice(0, 10), status: 'draft', ts: Date.now(),
    };
    let quotes: any[] = [];
    try { quotes = JSON.parse(localStorage.getItem('hg2:quotes') || '[]'); } catch {}
    quotes.unshift(quote);
    localStorage.setItem('hg2:quotes', JSON.stringify(quotes));
    out.textContent = `✅ Quote for ${quote.customer || 'customer'} — ₪${total.toLocaleString()} saved.`;
    hooks.addMsgSys(`הצעת מחיר נשמרה: ${quote.customer || 'לקוח'} · ₪${total.toLocaleString()}`);
    cust.value = ''; phone.value = ''; items.value = '';
  };
  q.appendChild(field('Customer', cust));
  q.appendChild(field('Phone', phone));
  q.appendChild(field('Line items', items));
  q.appendChild(save);
  q.appendChild(out);
  root.appendChild(q);
}

// ============================================================
// TRADING — live ticker, alerts, webhook trigger
// ============================================================
function renderTrading(root: HTMLElement, hooks: CockpitHooks, close: () => void) {
  // ── Live ticker (Binance public API, no key) ──
  const tk = card('Live Market', 'Public price feed · Binance');
  const sym = input('Symbol — e.g. BTCUSDT', 'BTCUSDT');
  const price = el('div', 'cp-bignum', '—');
  const refresh = btn('Get price');
  const auto = btn('Auto ⟳');
  let timer: any = null;
  const fetchPrice = async () => {
    price.textContent = '…';
    try {
      const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(sym.value.trim().toUpperCase())}`);
      const d = await r.json();
      if (d.lastPrice) {
        const chg = parseFloat(d.priceChangePercent);
        price.innerHTML = `$${parseFloat(d.lastPrice).toLocaleString()} <span class="cp-chg ${chg >= 0 ? 'up' : 'down'}">${chg >= 0 ? '▲' : '▼'} ${Math.abs(chg).toFixed(2)}%</span>`;
      } else price.textContent = 'Symbol not found';
    } catch { price.textContent = 'Feed unavailable'; }
  };
  refresh.onclick = fetchPrice;
  auto.onclick = () => {
    if (timer) { clearInterval(timer); timer = null; auto.classList.remove('on'); }
    else { fetchPrice(); timer = setInterval(fetchPrice, 5000); auto.classList.add('on'); }
  };
  const row = el('div', 'cp-inline');
  row.append(refresh, auto);
  tk.appendChild(field('Symbol', sym));
  tk.appendChild(price);
  tk.appendChild(row);
  root.appendChild(tk);

  // ── Price alerts ──
  const al = card('Price Alerts', 'Proactive notifications on threshold cross');
  const aSym = input('Symbol', 'BTCUSDT');
  const above = input('Alert above ($)');
  const below = input('Alert below ($)');
  const aNote = input('Note (optional)');
  const addAl = btn('Add alert', true);
  const alList = el('div', 'cp-list');
  const drawAlerts = () => {
    alList.innerHTML = '';
    const alerts = loadPriceAlerts();
    if (!alerts.length) { alList.appendChild(el('div', 'cp-empty', 'No alerts set.')); return; }
    alerts.forEach(a => {
      const r = el('div', 'cp-row');
      const cond = [a.above != null ? `≥ ${a.above}` : '', a.below != null ? `≤ ${a.below}` : ''].filter(Boolean).join(' / ');
      r.innerHTML = `<span class="cp-row-main">${esc(a.symbol)}</span><span class="cp-row-sub">${esc(cond)}${a.fired ? ' · fired' : ''}</span>`;
      const del = el('button', 'cp-x', '✕');
      del.onclick = () => { savePriceAlerts(loadPriceAlerts().filter(x => x.id !== a.id)); drawAlerts(); };
      r.appendChild(del);
      alList.appendChild(r);
    });
  };
  addAl.onclick = () => {
    const a: PriceAlert = {
      id: Date.now().toString(36),
      symbol: aSym.value.trim().toUpperCase() || 'BTCUSDT',
      above: above.value ? parseFloat(above.value) : undefined,
      below: below.value ? parseFloat(below.value) : undefined,
      note: aNote.value.trim(),
    };
    if (a.above == null && a.below == null) return;
    savePriceAlerts([...loadPriceAlerts(), a]);
    above.value = ''; below.value = ''; aNote.value = '';
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    drawAlerts();
  };
  al.appendChild(field('Symbol', aSym));
  const cond = el('div', 'cp-inline'); cond.append(above, below);
  al.appendChild(cond);
  al.appendChild(field('Note', aNote));
  al.appendChild(addAl);
  al.appendChild(alList);
  drawAlerts();
  root.appendChild(al);

  // ── Webhook trigger (secure execution stub) ──
  const wh = card('Bot Webhook', 'Trigger a predefined trading script');
  const url = input('Webhook URL (e.g. Replit / TradingView relay)', localStorage.getItem('alpha_webhook_url') || '');
  const payload = textarea('{ "action": "run", "strategy": "alpha-1" }', 3);
  const fire = btn('Trigger webhook', true);
  const whOut = el('div', 'cp-note');
  fire.onclick = async () => {
    const u = url.value.trim();
    if (!u) { whOut.textContent = 'Enter a webhook URL.'; return; }
    localStorage.setItem('alpha_webhook_url', u);
    whOut.textContent = 'Sending…';
    try {
      let body: any = {}; try { body = JSON.parse(payload.value || '{}'); } catch {}
      await fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      whOut.textContent = '✅ Triggered (response opaque if CORS-restricted).';
    } catch { whOut.textContent = '⚠️ Request sent / blocked by CORS. For secure key handling, route through a backend relay.'; }
  };
  wh.appendChild(field('URL', url));
  wh.appendChild(field('Payload', payload));
  wh.appendChild(fire);
  wh.appendChild(whOut);
  wh.appendChild(el('div', 'cp-warn', '⚠ API keys must never live in the frontend. Point this at a serverless relay (Cloudflare Worker / Replit) that holds the secret and forwards the call.'));
  root.appendChild(wh);

  // ── Prediction markets ──
  const pm = card('Prediction Markets', 'Polymarket monitor');
  const ask = btn('Analyze a market', true);
  ask.onclick = () => { hooks.ask('Act as a prediction-markets analyst. Explain how to monitor a Polymarket market for significant probability shifts and what thresholds are worth an alert.'); close(); };
  pm.appendChild(ask);
  root.appendChild(pm);
}

// ============================================================
// CREATIVE — lyrics workspace + AI music prompts
// ============================================================
function renderCreative(root: HTMLElement, hooks: CockpitHooks, close: () => void) {
  const ws = card('Lyrics Studio', 'Rap / hip-hop structure · auto-saved');
  const struct = el('div', 'cp-inline cp-wrap');
  const ta = textarea('Drop your bars here…', 12);
  ta.value = localStorage.getItem('alpha_lyrics') || '';
  ta.oninput = () => localStorage.setItem('alpha_lyrics', ta.value);
  ['[Intro]', '[Verse]', '[Hook]', '[Bridge]', '[Outro]'].forEach(tag => {
    const b = btn(tag);
    b.onclick = () => {
      const pos = ta.selectionStart;
      ta.value = ta.value.slice(0, pos) + `\n${tag}\n` + ta.value.slice(pos);
      localStorage.setItem('alpha_lyrics', ta.value);
      ta.focus();
    };
    struct.appendChild(b);
  });
  ws.appendChild(struct);
  ws.appendChild(ta);

  const tools = el('div', 'cp-inline');
  const assist = btn('AI co-write', true);
  assist.onclick = () => {
    const lyr = ta.value.trim();
    hooks.ask(`Act as an elite rap lyricist. Here are my lyrics:\n\n${lyr || '(empty — start me off)'}\n\nKeep my voice and theme. Improve the flow, add internal rhyme, and write the next 8 bars in the same style.`);
    close();
  };
  const polish = btn('Polish rhymes');
  polish.onclick = () => { hooks.ask(`Tighten the rhyme scheme and flow of these lyrics without changing the meaning:\n\n${ta.value.trim()}`); close(); };
  tools.append(assist, polish);
  ws.appendChild(tools);
  root.appendChild(ws);

  // ── Music generation prompt ──
  const mg = card('AI Music Prompt', 'For Suno / Udio + mastering notes');
  const genre = input('Genre / vibe — e.g. dark trap, 140bpm, melodic');
  const make = btn('Generate music prompt', true);
  make.onclick = () => {
    hooks.ask(`Create a detailed AI-music-generation prompt (for Suno/Udio) for a ${genre.value.trim() || 'trap'} track using these lyrics as the hook reference:\n\n${(localStorage.getItem('alpha_lyrics') || '').slice(0, 600)}\n\nInclude: BPM, key, instrumentation, mood, song structure, and 3 mastering tips for a loud, clean mix.`);
    close();
  };
  mg.appendChild(field('Genre / vibe', genre));
  mg.appendChild(make);
  root.appendChild(mg);
}

// ============================================================
// PERSONAL — daily briefing, tasks, habits, expenses,
//            family calendar, brain-dump auto-tagging
// ============================================================
function renderPersonal(root: HTMLElement, hooks: CockpitHooks, close: () => void) {
  // ── Daily briefing ──
  const brief = card('Daily Briefing', 'Your day at a glance');
  const today = new Date().toISOString().slice(0, 10);
  const todayEv = loadEvents().filter(e => e.date === today);
  const openTasks = loadTasks().filter(t => !t.done);
  const habitsToday = loadHabits();
  const habitsDone = habitsToday.filter(isHabitDoneToday).length;
  const sum = el('div', 'cp-kpis');
  sum.innerHTML =
    `<div class="cp-kpi"><span class="cp-kpi-val">${todayEv.length}</span><span class="cp-kpi-lbl">Events today</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${openTasks.length}</span><span class="cp-kpi-lbl">Open tasks</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${habitsDone}/${habitsToday.length}</span><span class="cp-kpi-lbl">Habits</span></div>`;
  brief.appendChild(sum);
  const briefBtn = btn('Brief me on my day', true);
  briefBtn.onclick = () => {
    const ev = todayEv.map(e => `${e.time || ''} ${e.title}`).join('; ') || 'none';
    const tk = openTasks.slice(0, 8).map(t => t.text).join('; ') || 'none';
    hooks.ask(`Act as my chief of staff. Give me a short, motivating morning briefing for today. ` +
      `Events: ${ev}. Open tasks: ${tk}. Habits done: ${habitsDone}/${habitsToday.length}. ` +
      `Prioritise what matters and suggest the single most important focus for today.`);
    close();
  };
  brief.appendChild(briefBtn);
  root.appendChild(brief);

  // ── Tasks ──
  const tc = card('Tasks', 'Quick to-dos with priority');
  const tText = input('What needs doing?');
  const tPrio = el('select', 'cp-input') as HTMLSelectElement;
  ([['med', 'Medium'], ['high', 'High'], ['low', 'Low']] as const).forEach(([v, l]) => {
    const o = el('option') as HTMLOptionElement; o.value = v; o.textContent = l; tPrio.appendChild(o);
  });
  const addT = btn('Add task', true);
  const tList = el('div', 'cp-list');
  const drawTasks = () => {
    tList.innerHTML = '';
    const tasks = loadTasks().sort((a, b) => Number(a.done) - Number(b.done));
    if (!tasks.length) { tList.appendChild(el('div', 'cp-empty', 'No tasks. Add one above.')); return; }
    tasks.slice(0, 20).forEach(t => {
      const r = el('div', 'cp-row');
      const pHue = { high: 0, med: 45, low: 200 }[t.priority] ?? 45;
      const box = el('button', 'cp-check' + (t.done ? ' on' : ''), t.done ? '✓' : '');
      box.onclick = () => { toggleTask(t.id); drawTasks(); };
      r.appendChild(box);
      const main = el('span', 'cp-row-main', esc(t.text));
      if (t.done) main.style.opacity = '.45', main.style.textDecoration = 'line-through';
      r.appendChild(main);
      r.appendChild(el('span', 'cp-row-tag', t.priority) as HTMLElement).setAttribute('style', `color:hsl(${pHue},70%,60%)`);
      const x = el('button', 'cp-x', '✕');
      x.onclick = () => { removeTask(t.id); drawTasks(); };
      r.appendChild(x);
      tList.appendChild(r);
    });
  };
  addT.onclick = () => { if (tText.value.trim()) { addTask(tText.value.trim(), tPrio.value as any); tText.value = ''; drawTasks(); } };
  tText.addEventListener('keydown', e => { if (e.key === 'Enter') addT.click(); });
  const tRow = el('div', 'cp-inline'); tRow.append(tText, tPrio);
  tc.appendChild(tRow);
  tc.appendChild(addT);
  tc.appendChild(tList);
  drawTasks();
  root.appendChild(tc);

  // ── Habit tracker ──
  const hc = card('Habits', 'Build streaks · tap to mark done today');
  const hName = input('New habit — e.g. Gym, Read, No sugar');
  const addH = btn('Add habit', true);
  const hList = el('div', 'cp-list');
  const drawHabits = () => {
    hList.innerHTML = '';
    const habits = loadHabits();
    if (!habits.length) { hList.appendChild(el('div', 'cp-empty', 'No habits yet.')); return; }
    habits.forEach(h => {
      const r = el('div', 'cp-row');
      const doneToday = isHabitDoneToday(h);
      const box = el('button', 'cp-check' + (doneToday ? ' on' : ''), doneToday ? '✓' : '');
      box.onclick = () => { toggleHabitToday(h.id); drawHabits(); };
      r.appendChild(box);
      r.appendChild(el('span', 'cp-row-main', esc(h.name)));
      const streak = habitStreak(h);
      r.appendChild(el('span', 'cp-row-tag', streak > 0 ? `🔥 ${streak}d` : '—'));
      const x = el('button', 'cp-x', '✕');
      x.onclick = () => { removeHabit(h.id); drawHabits(); };
      r.appendChild(x);
      hList.appendChild(r);
    });
  };
  addH.onclick = () => { if (hName.value.trim()) { addHabit(hName.value.trim()); hName.value = ''; drawHabits(); } };
  hName.addEventListener('keydown', e => { if (e.key === 'Enter') addH.click(); });
  hc.appendChild(field('Habit', hName));
  hc.appendChild(addH);
  hc.appendChild(hList);
  drawHabits();
  root.appendChild(hc);

  // ── Expense tracker ──
  const ec = card('Expenses', 'This month · by category');
  const eSummary = expenseSummary();
  ec.appendChild(el('div', 'cp-bignum', `₪${eSummary.monthTotal.toLocaleString()}`));
  if (eSummary.byCategory.length) {
    const maxC = Math.max(1, ...eSummary.byCategory.map(c => c.total));
    const catWrap = el('div', 'cp-catbars');
    eSummary.byCategory.forEach(c => {
      const row = el('div', 'cp-catbar');
      row.innerHTML = `<span class="cp-catbar-lbl">${esc(c.category)}</span>` +
        `<div class="cp-catbar-track"><div class="cp-catbar-fill" style="width:${(c.total / maxC) * 100}%"></div></div>` +
        `<span class="cp-catbar-val">₪${c.total.toLocaleString()}</span>`;
      catWrap.appendChild(row);
    });
    ec.appendChild(catWrap);
  }
  const exLabel = input('What — e.g. Diesel');
  const exAmt = input('Amount (₪)');
  const exCat = el('select', 'cp-input') as HTMLSelectElement;
  EXPENSE_CATEGORIES.forEach(c => { const o = el('option') as HTMLOptionElement; o.value = c; o.textContent = c; exCat.appendChild(o); });
  const addE = btn('Log expense', true);
  const exList = el('div', 'cp-list');
  const drawExp = () => {
    exList.innerHTML = '';
    const list = loadExpenses().slice(0, 8);
    list.forEach(e => {
      const r = el('div', 'cp-row');
      r.innerHTML = `<span class="cp-row-main">${esc(e.label)} <span class="cp-row-sub">${esc(e.category)}</span></span>` +
        `<span class="cp-row-tag">₪${e.amount.toLocaleString()}</span>`;
      const x = el('button', 'cp-x', '✕');
      x.onclick = () => { removeExpense(e.id); root.replaceChildren(); renderPersonal(root, hooks, close); };
      r.appendChild(x);
      exList.appendChild(r);
    });
  };
  addE.onclick = () => {
    const amt = parseFloat(exAmt.value);
    if (!exLabel.value.trim() || isNaN(amt)) return;
    addExpense(exLabel.value.trim(), amt, exCat.value);
    root.replaceChildren(); renderPersonal(root, hooks, close);
  };
  const exRow = el('div', 'cp-inline'); exRow.append(exLabel, exAmt);
  ec.appendChild(exRow);
  ec.appendChild(exCat);
  ec.appendChild(addE);
  ec.appendChild(exList);
  drawExp();
  root.appendChild(ec);

  // ── Family calendar ──
  const cal = card('Family & Life', 'Shared calendar');
  const title = input('Event — e.g. Maya swimming class');
  const date = el('input', 'cp-input') as HTMLInputElement; date.type = 'date';
  const time = el('input', 'cp-input') as HTMLInputElement; time.type = 'time';
  const add = btn('Add to calendar', true);
  const upcoming = el('div', 'cp-list');
  const draw = () => {
    upcoming.innerHTML = '';
    const today = new Date().toISOString().slice(0, 10);
    const ev = loadEvents().filter(e => e.date >= today).slice(0, 8);
    if (!ev.length) { upcoming.appendChild(el('div', 'cp-empty', 'Nothing upcoming.')); return; }
    ev.forEach(e => {
      const r = el('div', 'cp-row');
      r.innerHTML = `<span class="cp-row-main">${esc(e.title)}</span><span class="cp-row-tag">${esc(e.date)}${e.time ? ' ' + esc(e.time) : ''}</span>`;
      upcoming.appendChild(r);
    });
  };
  add.onclick = () => {
    if (!title.value.trim() || !date.value) return;
    addEvent(title.value.trim(), date.value, time.value);
    title.value = ''; draw();
  };
  cal.appendChild(field('Event', title));
  const dr = el('div', 'cp-inline'); dr.append(date, time);
  cal.appendChild(dr);
  cal.appendChild(add);
  cal.appendChild(upcoming);
  draw();
  root.appendChild(cal);

  // ── Pomodoro Timer ──
  const pomo = card('Focus Timer', 'Pomodoro technique · 25 min work / 5 min break');
  const pomoStats = todayPomoStats();
  const weekPomo = weekPomoStats();
  const pomoKpis = el('div', 'cp-kpis');
  pomoKpis.innerHTML =
    `<div class="cp-kpi"><span class="cp-kpi-val">${pomoStats.completed}</span><span class="cp-kpi-lbl">Today</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${pomoStats.focusMin}m</span><span class="cp-kpi-lbl">Focus</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${weekPomo.totalSessions}</span><span class="cp-kpi-lbl">This week</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${weekPomo.streak}d</span><span class="cp-kpi-lbl">Streak</span></div>`;
  pomo.appendChild(pomoKpis);
  const pomoDisplay = el('div', 'cp-bignum', '25:00');
  pomoDisplay.style.textAlign = 'center';
  pomo.appendChild(pomoDisplay);
  let pomoInterval: any = null;
  let pomoTimeLeft = 25 * 60;
  let pomoIsBreak = false;
  const pomoBtns = el('div', 'cp-inline');
  pomoBtns.style.justifyContent = 'center';
  const pomoStart = btn('Start focus', true);
  const pomoReset = btn('Reset');
  const updatePomoDisplay = () => {
    const m = Math.floor(pomoTimeLeft / 60);
    const s = pomoTimeLeft % 60;
    pomoDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    if (pomoIsBreak) pomoDisplay.style.color = 'var(--cyan)';
    else pomoDisplay.style.color = 'var(--ink)';
  };
  pomoStart.onclick = () => {
    if (pomoInterval) { clearInterval(pomoInterval); pomoInterval = null; pomoStart.textContent = pomoIsBreak ? 'Start break' : 'Start focus'; return; }
    pomoStart.textContent = 'Pause';
    pomoInterval = setInterval(() => {
      pomoTimeLeft--;
      updatePomoDisplay();
      if (pomoTimeLeft <= 0) {
        clearInterval(pomoInterval); pomoInterval = null;
        if (!pomoIsBreak) {
          recordPomoSession();
          hooks.addMsgSys('🍅 Focus session complete! Take a break.');
          pomoIsBreak = true; pomoTimeLeft = 5 * 60;
          pomoStart.textContent = 'Start break';
        } else {
          pomoIsBreak = false; pomoTimeLeft = 25 * 60;
          pomoStart.textContent = 'Start focus';
          hooks.addMsgSys('☕ Break over! Ready for another round?');
        }
        updatePomoDisplay();
        root.replaceChildren(); renderPersonal(root, hooks, close);
      }
    }, 1000);
  };
  pomoReset.onclick = () => {
    if (pomoInterval) { clearInterval(pomoInterval); pomoInterval = null; }
    pomoIsBreak = false; pomoTimeLeft = 25 * 60;
    pomoStart.textContent = 'Start focus';
    updatePomoDisplay();
  };
  pomoBtns.append(pomoStart, pomoReset);
  pomo.appendChild(pomoBtns);
  root.appendChild(pomo);

  // ── Wellness Tracker ──
  const well = card('Wellness', 'Mood · Energy · Water · Sleep');
  const currentMood = todayMood();
  const ms = moodStreak();
  const wellKpis = el('div', 'cp-kpis');
  wellKpis.innerHTML =
    `<div class="cp-kpi"><span class="cp-kpi-val">${currentMood ? MOOD_EMOJI[currentMood.mood] : '—'}</span><span class="cp-kpi-lbl">Mood</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${todayWater()}</span><span class="cp-kpi-lbl">Water 💧</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${sleepAvg().hours || '—'}h</span><span class="cp-kpi-lbl">Avg sleep</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${ms.avg || '—'}</span><span class="cp-kpi-lbl">Week avg</span></div>`;
  well.appendChild(wellKpis);
  const moodRow = el('div', 'cp-inline');
  moodRow.style.justifyContent = 'center';
  moodRow.style.gap = '12px';
  MOODS.forEach(m => {
    const mb = el('button', 'cp-btn' + (currentMood?.mood === m ? ' primary' : ''));
    mb.textContent = MOOD_EMOJI[m];
    mb.style.fontSize = '20px'; mb.style.minWidth = '44px';
    mb.onclick = () => { logMood(m); root.replaceChildren(); renderPersonal(root, hooks, close); };
    moodRow.appendChild(mb);
  });
  well.appendChild(el('div', 'cp-label', 'How are you feeling?'));
  well.appendChild(moodRow);
  const waterBtn = btn('+ Water glass 💧');
  waterBtn.onclick = () => { addWater(); root.replaceChildren(); renderPersonal(root, hooks, close); };
  well.appendChild(waterBtn);
  const sleepRow = el('div', 'cp-inline');
  const sleepH = input('Hours slept');
  sleepH.type = 'number'; sleepH.min = '0'; sleepH.max = '24'; sleepH.step = '0.5';
  const sleepQ = el('select', 'cp-input') as HTMLSelectElement;
  [[5, 'Great'], [4, 'Good'], [3, 'Okay'], [2, 'Poor'], [1, 'Bad']].forEach(([v, l]) => {
    const o = el('option') as HTMLOptionElement; o.value = String(v); o.textContent = l as string; sleepQ.appendChild(o);
  });
  const logS = btn('Log sleep');
  logS.onclick = () => {
    const h = parseFloat(sleepH.value);
    if (!h) return;
    logSleep(h, parseInt(sleepQ.value) || 3);
    root.replaceChildren(); renderPersonal(root, hooks, close);
  };
  sleepRow.append(sleepH, sleepQ, logS);
  well.appendChild(el('div', 'cp-label', 'Sleep log'));
  well.appendChild(sleepRow);
  const wellnessAI = btn('AI wellness insights', true);
  wellnessAI.onclick = () => {
    const wData = `Mood: ${currentMood ? currentMood.mood + (currentMood.note ? ' - ' + currentMood.note : '') : 'not logged'}, Water: ${todayWater()} glasses, Sleep avg: ${sleepAvg().hours}h (quality ${sleepAvg().quality}/5), Week mood avg: ${ms.avg}/5`;
    hooks.ask(`Act as a wellness coach. Here are my wellness stats: ${wData}. Give me 3 personalized tips to improve my wellbeing today. Be warm and actionable.`);
    close();
  };
  well.appendChild(wellnessAI);
  root.appendChild(well);

  // ── Goals ──
  const gc = card('Goals', 'Track quarterly & monthly objectives');
  const gs = activeGoalsSummary();
  if (gs.total > 0) {
    const gKpis = el('div', 'cp-kpis');
    gKpis.innerHTML =
      `<div class="cp-kpi"><span class="cp-kpi-val">${gs.total}</span><span class="cp-kpi-lbl">Goals</span></div>` +
      `<div class="cp-kpi"><span class="cp-kpi-val">${gs.completed}</span><span class="cp-kpi-lbl">Done</span></div>` +
      `<div class="cp-kpi"><span class="cp-kpi-val">${gs.avgProgress}%</span><span class="cp-kpi-lbl">Progress</span></div>`;
    gc.appendChild(gKpis);
  }
  const gTitle = input('Goal — e.g. Close 10 deals this quarter');
  const gTimeframe = el('select', 'cp-input') as HTMLSelectElement;
  (['week', 'month', 'quarter', 'year'] as GoalTimeframe[]).forEach(t => {
    const o = el('option') as HTMLOptionElement; o.value = t; o.textContent = t.charAt(0).toUpperCase() + t.slice(1); gTimeframe.appendChild(o);
  });
  gTimeframe.value = 'month';
  const gCat = el('select', 'cp-input') as HTMLSelectElement;
  (['business', 'personal', 'health', 'creative', 'financial'] as const).forEach(c => {
    const o = el('option') as HTMLOptionElement; o.value = c; o.textContent = c.charAt(0).toUpperCase() + c.slice(1); gCat.appendChild(o);
  });
  const gMilestones = input('Milestones (comma separated, optional)');
  const addG = btn('Add goal', true);
  const gList = el('div', 'cp-list');
  const drawGoals = () => {
    gList.innerHTML = '';
    const goals = loadGoals();
    if (!goals.length) { gList.appendChild(el('div', 'cp-empty', 'No goals yet. Set your first above.')); return; }
    goals.forEach(g => {
      const prog = goalProgress(g);
      const r = el('div', 'cp-row');
      r.style.flexWrap = 'wrap';
      const catHue = { business: 38, personal: 200, health: 145, creative: 280, financial: 45 }[g.category] ?? 200;
      r.innerHTML =
        `<span class="cp-row-main" style="flex:1;min-width:120px">${esc(g.title)}</span>` +
        `<span class="cp-row-tag" style="color:hsl(${catHue},70%,60%)">${g.category} · ${g.timeframe}</span>` +
        `<span class="cp-row-sub">${Math.round(prog * 100)}%</span>`;
      const progBar = el('div', 'cp-catbar-track');
      progBar.style.width = '100%'; progBar.style.margin = '4px 0';
      const progFill = el('div', 'cp-catbar-fill');
      progFill.style.width = `${prog * 100}%`;
      if (prog === 1) progFill.style.background = 'linear-gradient(90deg, #4dff91, #39e75f)';
      progBar.appendChild(progFill);
      r.appendChild(progBar);
      if (g.milestones.length) {
        const msWrap = el('div', '');
        msWrap.style.cssText = 'width:100%;display:flex;flex-direction:column;gap:4px;margin-top:4px';
        g.milestones.forEach((m, mi) => {
          const mRow = el('div', 'cp-inline');
          mRow.style.gap = '6px';
          const mBox = el('button', 'cp-check' + (m.done ? ' on' : ''), m.done ? '✓' : '');
          mBox.onclick = () => { toggleMilestone(g.id, mi); drawGoals(); };
          mRow.appendChild(mBox);
          const mText = el('span', '', esc(m.text));
          mText.style.fontSize = '12px';
          if (m.done) { mText.style.opacity = '.45'; mText.style.textDecoration = 'line-through'; }
          mRow.appendChild(mText);
          msWrap.appendChild(mRow);
        });
        r.appendChild(msWrap);
      }
      const addMs = el('button', 'cp-x', '+');
      addMs.title = 'Add milestone';
      addMs.onclick = () => {
        const ms = prompt('New milestone:');
        if (ms?.trim()) { addMilestoneToGoal(g.id, ms.trim()); drawGoals(); }
      };
      r.appendChild(addMs);
      const del = el('button', 'cp-x', '✕');
      del.onclick = () => { removeGoal(g.id); drawGoals(); };
      r.appendChild(del);
      gList.appendChild(r);
    });
  };
  addG.onclick = () => {
    if (!gTitle.value.trim()) return;
    const ms = gMilestones.value.split(',').map(s => s.trim()).filter(Boolean);
    addGoal(gTitle.value.trim(), gTimeframe.value as GoalTimeframe, gCat.value as any, ms);
    gTitle.value = ''; gMilestones.value = '';
    drawGoals();
  };
  gc.appendChild(field('Goal', gTitle));
  const gRow = el('div', 'cp-inline'); gRow.append(gTimeframe, gCat);
  gc.appendChild(gRow);
  gc.appendChild(field('Milestones', gMilestones));
  gc.appendChild(addG);
  gc.appendChild(gList);
  drawGoals();
  root.appendChild(gc);

  // ── Voice-to-task: dump → auto-tag → categorize ──
  const vt = card('Brain Dump → Tasks', 'Auto-sorted into Business / Trading / Personal');
  const dump = textarea('One idea per line. I’ll tag each as Business, Trading, Creative or Personal…', 5);
  const sort = btn('Capture & categorize', true);
  const result = el('div', 'cp-list');
  sort.onclick = () => {
    result.innerHTML = '';
    const lines = dump.value.split('\n').map(s => s.trim()).filter(Boolean);
    if (!lines.length) return;
    const tally: Record<string, number> = {};
    lines.forEach(line => {
      const r = route(line);
      const mod: ModuleId = r.module === 'general' ? 'personal' : r.module;
      tally[mod] = (tally[mod] || 0) + 1;
      addTask(`[${mod}] ${line}`, 'med');
      const row = el('div', 'cp-row');
      const m = MODULE_LIST.find(x => x.id === mod);
      row.innerHTML = `<span class="cp-row-main">${esc(line)}</span><span class="cp-row-tag" style="color:hsl(${m?.hue ?? 200},70%,60%)">${mod}</span>`;
      result.appendChild(row);
    });
    hooks.addMsgSys(`Captured ${lines.length} item(s): ` + Object.entries(tally).map(([k, v]) => `${v} ${k}`).join(', '));
    dump.value = '';
  };
  vt.appendChild(dump);
  vt.appendChild(sort);
  vt.appendChild(result);
  root.appendChild(vt);
}

// ============================================================
// MEMORY — profile, facts, projects
// ============================================================
function renderMemory(root: HTMLElement) {
  const m = loadMemory();

  const prof = card('Profile', 'Long-term identity the assistant remembers');
  const name = input('Name', m.profile.name);
  const role = input('Role', m.profile.role);
  const biz = input('Business', m.profile.business);
  const loc = input('Location', m.profile.location);
  const prefs = input('Preferences (comma separated)', m.profile.preferences.join(', '));
  const saveP = btn('Save profile', true);
  const pNote = el('div', 'cp-note');
  saveP.onclick = () => {
    updateProfile({
      name: name.value.trim(), role: role.value.trim(), business: biz.value.trim(),
      location: loc.value.trim(),
      preferences: prefs.value.split(',').map(s => s.trim()).filter(Boolean),
    });
    pNote.textContent = '✅ Saved. The assistant will use this in every reply.';
  };
  [['Name', name], ['Role', role], ['Business', biz], ['Location', loc], ['Preferences', prefs]]
    .forEach(([l, i]) => prof.appendChild(field(l as string, i as HTMLElement)));
  prof.appendChild(saveP); prof.appendChild(pNote);
  root.appendChild(prof);

  // ── Facts ──
  const fc = card('Remembered Facts', `${m.facts.length} stored`);
  const newFact = input('Teach me something to remember…');
  const addF = btn('Remember', true);
  const fList = el('div', 'cp-list');
  const drawFacts = () => {
    fList.innerHTML = '';
    const facts = loadMemory().facts.slice(0, 30);
    if (!facts.length) { fList.appendChild(el('div', 'cp-empty', 'No facts yet.')); return; }
    facts.forEach(f => {
      const r = el('div', 'cp-row');
      r.innerHTML = `<span class="cp-row-main">${esc(f.text)}</span><span class="cp-row-tag">${esc(f.module)}</span>`;
      const x = el('button', 'cp-x', '✕');
      x.onclick = () => { forgetFact(f.id); drawFacts(); };
      r.appendChild(x);
      fList.appendChild(r);
    });
  };
  addF.onclick = () => { if (newFact.value.trim()) { remember(newFact.value.trim(), 'general', 0.8); newFact.value = ''; drawFacts(); } };
  fc.appendChild(field('New fact', newFact));
  fc.appendChild(addF);
  fc.appendChild(fList);
  drawFacts();
  root.appendChild(fc);

  // ── Projects ──
  const pc = card('Active Projects', 'Tracked across modules');
  const pTitle = input('Project title');
  const pMod = el('select', 'cp-input') as HTMLSelectElement;
  MODULE_LIST.forEach(mo => { const o = el('option') as HTMLOptionElement; o.value = mo.id; o.textContent = mo.label; pMod.appendChild(o); });
  const addPr = btn('Add project', true);
  const pList = el('div', 'cp-list');
  const drawPr = () => {
    pList.innerHTML = '';
    const ps = loadMemory().projects;
    if (!ps.length) { pList.appendChild(el('div', 'cp-empty', 'No projects.')); return; }
    ps.forEach(p => {
      const r = el('div', 'cp-row');
      r.innerHTML = `<span class="cp-row-main">${esc(p.title)}</span><span class="cp-row-tag">${esc(p.module)} · ${esc(p.status)}</span>`;
      const x = el('button', 'cp-x', '✕');
      x.onclick = () => { removeProject(p.id); drawPr(); };
      r.appendChild(x);
      pList.appendChild(r);
    });
  };
  addPr.onclick = () => { if (pTitle.value.trim()) { addProject(pTitle.value.trim(), pMod.value as ModuleId); pTitle.value = ''; drawPr(); } };
  pc.appendChild(field('Title', pTitle));
  pc.appendChild(field('Module', pMod));
  pc.appendChild(addPr);
  pc.appendChild(pList);
  drawPr();
  root.appendChild(pc);

  // ── Danger ──
  const dz = card('Reset', 'Wipe long-term memory');
  const wipe = btn('Clear all memory');
  wipe.onclick = () => { const mm = loadMemory(); mm.facts = []; mm.projects = []; mm.summary = ''; saveMemory(mm); root.innerHTML = ''; renderMemory(root); };
  dz.appendChild(wipe);
  root.appendChild(dz);
}

// ============================================================
// ADVANCED — vision + document parsing
// ============================================================
function renderAdvanced(root: HTMLElement, hooks: CockpitHooks, close: () => void) {
  // ── Vision ──
  const vz = card('Vision', 'Analyze a photo — truck cabin, diagram, or chart');
  const imgInput = el('input', 'cp-input') as HTMLInputElement;
  imgInput.type = 'file'; imgInput.accept = 'image/*';
  const q = input('What should I look for?', 'Describe this and give actionable insights');
  const preview = el('img', 'cp-preview') as HTMLImageElement;
  preview.style.display = 'none';
  const analyze = btn('Analyze image', true);
  const vOut = el('div', 'cp-note');
  let dataUrl = '';
  imgInput.onchange = () => {
    const f = imgInput.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { dataUrl = reader.result as string; preview.src = dataUrl; preview.style.display = 'block'; };
    reader.readAsDataURL(f);
  };
  analyze.onclick = async () => {
    if (!dataUrl) { vOut.textContent = 'Choose an image first.'; return; }
    const puter = (window as any).puter;
    if (!puter?.ai?.chat) { vOut.textContent = 'Vision needs the Puter engine (default). Open settings and ensure provider = Puter.'; return; }
    vOut.textContent = 'Analyzing…';
    try {
      const r = await puter.ai.chat(q.value.trim() || 'Describe this image and give actionable insights.', dataUrl);
      const text = typeof r === 'string' ? r : (r?.message?.content || r?.text || JSON.stringify(r));
      hooks.addMsgSys('👁 ' + (text || 'No description returned.'));
      close();
    } catch { vOut.textContent = 'Vision request failed.'; }
  };
  vz.appendChild(field('Image', imgInput));
  vz.appendChild(preview);
  vz.appendChild(field('Question', q));
  vz.appendChild(analyze);
  vz.appendChild(vOut);
  root.appendChild(vz);

  // ── Document parsing ──
  const dz = card('Documents', 'Drop a PDF or text file and query it');
  const docInput = el('input', 'cp-input') as HTMLInputElement;
  docInput.type = 'file'; docInput.accept = '.pdf,.txt,.md,.csv';
  const dq = input('Question about the document', 'Summarize the key points');
  const parse = btn('Parse & ask', true);
  const dOut = el('div', 'cp-note');
  let docText = '';
  docInput.onchange = async () => {
    const f = docInput.files?.[0]; if (!f) return;
    dOut.textContent = 'Reading…';
    try {
      if (f.type === 'application/pdf' || f.name.endsWith('.pdf')) {
        docText = await extractPdfText(f);
      } else {
        docText = await f.text();
      }
      dOut.textContent = `Loaded ${docText.length.toLocaleString()} chars from ${f.name}.`;
    } catch (e) { dOut.textContent = 'Could not read that file.'; }
  };
  parse.onclick = () => {
    if (!docText) { dOut.textContent = 'Load a document first.'; return; }
    const excerpt = docText.slice(0, 6000);
    hooks.ask(`${dq.value.trim() || 'Summarize'} — based on this document:\n\n"""${excerpt}"""`);
    close();
  };
  dz.appendChild(field('File', docInput));
  dz.appendChild(field('Question', dq));
  dz.appendChild(parse);
  dz.appendChild(dOut);
  root.appendChild(dz);
}

// Lazy-load pdf.js from CDN only when a PDF is actually parsed.
const PDFJS_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs';
const PDFJS_WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';
async function extractPdfText(file: File): Promise<string> {
  const w = window as any;
  if (!w.pdfjsLib) {
    const url = PDFJS_URL; // variable URL avoids static resolution by tsc/vite
    const mod: any = await import(/* @vite-ignore */ url);
    w.pdfjsLib = mod;
    mod.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  }
  const buf = await file.arrayBuffer();
  const pdf = await w.pdfjsLib.getDocument({ data: buf }).promise;
  let text = '';
  for (let i = 1; i <= Math.min(pdf.numPages, 30); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it: any) => it.str).join(' ') + '\n';
  }
  return text;
}
