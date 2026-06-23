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
  downloadInvoicePDF, invoiceStats, shareInvoiceWhatsApp, type InvoiceItem,
} from './invoices';
import {
  loadContacts, addContact, removeContact,
} from './contacts';
import {
  revenueTrend, expenseTrend, taskCompletionRate,
  expenseByCategory, leadsByStatus, dailyBriefing,
} from './analytics';
import {
  loadSmartNotes, addSmartNote, removeSmartNote, togglePin,
  NOTE_CATEGORIES,
} from './smartNotes';
import {
  loadRecurring, addRecurring, removeRecurring, toggleRecurring,
  type RecurFreq,
} from './recurring';
import {
  getActiveTimer, startTimer, stopTimer, todayTime, weekTime,
  formatDuration, removeTimeEntry, loadTimeEntries,
} from './timeTracker';
import { downloadReport, businessReport, personalReport } from './reports';
import { sparkline, progressRing } from './sparkline';
import { fillTemplate, addCustomTemplate, removeCustomTemplate, templatesByCategory, type Template } from './templates';
import { sentimentTrend, averageSentiment } from './sentiment';
import { calculateScore, scoreLabel, scoreColor } from './scoring';
import { checkIntegrity, storageUsage, repairCorrupted } from './dataIntegrity';

type CpLang = 'he' | 'en';
function cpLang(): CpLang { return (localStorage.getItem('alpha_uilang') as CpLang) || 'he'; }
function L(he: string, en: string): string { return cpLang() === 'he' ? he : en; }

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
        <div class="cp-title"><span class="cp-glyph">◆</span> ${L('מוח ראשי', 'MASTER BRAIN')}</div>
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
    { id: 'business', label: L('עסקים', 'Business'), hue: 38 },
    { id: 'trading', label: L('מסחר', 'Trading'), hue: 145 },
    { id: 'creative', label: L('יצירתי', 'Creative'), hue: 280 },
    { id: 'personal', label: L('אישי', 'Personal'), hue: 200 },
    { id: 'memory', label: L('זיכרון', 'Memory'), hue: 45 },
    { id: 'advanced', label: L('מתקדם', 'Advanced'), hue: 20 },
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
  const dash = card(L('לוח הכנסות', 'Revenue Dashboard'), L('ביצוע מול צינור · 6 חודשים', 'Realised vs. pipeline · last 6 months'));
  const stats = revenueStats();
  const kpis = el('div', 'cp-kpis');
  kpis.innerHTML =
    `<div class="cp-kpi"><span class="cp-kpi-val">₪${stats.realised.toLocaleString()}</span><span class="cp-kpi-lbl">${L('מומש', 'Realised')}</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">₪${stats.pipeline.toLocaleString()}</span><span class="cp-kpi-lbl">${L('צינור', 'Pipeline')}</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${Math.round(stats.winRate * 100)}%</span><span class="cp-kpi-lbl">${L('אחוז סגירה', 'Win rate')}</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${stats.openLeads}</span><span class="cp-kpi-lbl">${L('לידים פתוחים', 'Open leads')}</span></div>`;
  dash.appendChild(kpis);
  // sparkline of revenue trend
  const revValues = stats.byMonth.map(m => m.total);
  if (revValues.some(v => v > 0)) {
    const sparkEl = el('div', '');
    sparkEl.style.cssText = 'margin:8px 0;display:flex;align-items:center;gap:12px';
    sparkEl.innerHTML = `<span style="font-size:11px;color:var(--dim)">${L('מגמת 6 חודשים', '6-month trend')}</span>${sparkline(revValues, { width: 160, height: 36, showDots: true })}`;
    dash.appendChild(sparkEl);
  }
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
  const aiRev = btn(L('תובנות הכנסה AI', 'AI revenue insights'));
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
    const fu = card(L('⏰ מעקבים ממתינים', '⏰ Follow-ups due'), `${due.length} ${L('לידים לטיפול', 'lead(s) need a touch')}`);
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
  const pipe = card(L('צינור מכירות', 'Sales Pipeline'), L('עקוב אחרי כל ליד מהשיחה הראשונה', 'Track every lead from first call to win'));
  const lName = input(L('לקוח / חברה', 'Customer / company'));
  const lPhone = input(L('טלפון', 'Phone'));
  const lVeh = input(L('רכב — למשל Scania R450', 'Vehicle — e.g. Scania R450'));
  const lSvc = input(L('שירות — למשל מצלמה 360° + גשש', 'Service — e.g. 360° camera + tracker'));
  const lVal = input(L('שווי עסקה (₪)', 'Deal value (₪)'));
  const lFollow = el('input', 'cp-input') as HTMLInputElement; lFollow.type = 'date';
  const addL = btn(L('הוסף ליד', 'Add lead'), true);
  const pipeList = el('div', 'cp-list');
  const STATUS_NEXT_LABEL: Record<LeadStatus, string> = {
    lead: '→ Contacted', contacted: '→ Quoted', quoted: '→ Won', won: 'Won ✓', lost: 'Lost',
  };
  const drawPipe = () => {
    pipeList.innerHTML = '';
    const leads = loadLeads();
    if (!leads.length) { pipeList.appendChild(el('div', 'cp-empty', L('אין לידים עדיין. הוסף את הראשון למעלה.', 'No leads yet. Add your first above.'))); return; }
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
  pipe.appendChild(field(L('לקוח', 'Customer'), lName));
  const pr1 = el('div', 'cp-inline'); pr1.append(lPhone, lVal);
  pipe.appendChild(pr1);
  pipe.appendChild(field(L('רכב', 'Vehicle'), lVeh));
  pipe.appendChild(field(L('שירות', 'Service'), lSvc));
  pipe.appendChild(field(L('מעקב הבא', 'Next follow-up'), lFollow));
  pipe.appendChild(addL);
  pipe.appendChild(pipeList);
  drawPipe();
  root.appendChild(pipe);

  // ── Quotes manager ──
  const qm = card(L('הצעות מחיר', 'Quotes'), L('הצעות שמורות · עדכן סטטוס', 'Saved quotes · update status to feed revenue'));
  const qList = el('div', 'cp-list');
  const drawQuotes = () => {
    qList.innerHTML = '';
    const quotes = loadQuotes();
    if (!quotes.length) { qList.appendChild(el('div', 'cp-empty', L('אין הצעות עדיין. צור אחת למטה.', 'No quotes yet. Create one below.'))); return; }
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
  const inv = card(L('חשבוניות', 'Invoices'), L('חשבוניות מקצועיות כולל מע"מ', 'Professional invoices with VAT'));
  const invStats = invoiceStats();
  if (invStats.total > 0) {
    const invKpis = el('div', 'cp-kpis');
    invKpis.innerHTML =
      `<div class="cp-kpi"><span class="cp-kpi-val">${invStats.total}</span><span class="cp-kpi-lbl">${L('סה"כ', 'Total')}</span></div>` +
      `<div class="cp-kpi"><span class="cp-kpi-val">${invStats.paid}</span><span class="cp-kpi-lbl">${L('שולם', 'Paid')}</span></div>` +
      `<div class="cp-kpi"><span class="cp-kpi-val">${invStats.outstanding}</span><span class="cp-kpi-lbl">${L('ממתין', 'Outstanding')}</span></div>` +
      `<div class="cp-kpi"><span class="cp-kpi-val">₪${invStats.revenue.toLocaleString()}</span><span class="cp-kpi-lbl">${L('הכנסה', 'Revenue')}</span></div>`;
    inv.appendChild(invKpis);
  }
  const invCust = input(L('שם לקוח', 'Customer name'));
  const invPhone = input(L('טלפון (לשליחה בוואטסאפ)', 'Phone (for WhatsApp)'));
  invPhone.type = 'tel';
  const invItems = textarea(L('פריט בכל שורה, למשל:\nמצלמה 360: 4500\nהתקנה: 800 x 2', 'One item per line, e.g.:\n360 camera: 4500\nInstallation: 800 x 2'), 3);
  const invNotes = input(L('הערות (אופציונלי)', 'Notes (optional)'));
  const createInv = btn(L('צור חשבונית', 'Create invoice'), true);
  const invError = el('div', 'cp-note');
  invError.style.color = '#ff5d73';
  const invList = el('div', 'cp-list');
  const drawInvoices = () => {
    invList.innerHTML = '';
    const list = loadInvoices().slice(0, 10);
    if (!list.length) { invList.appendChild(el('div', 'cp-empty', L('אין חשבוניות עדיין.', 'No invoices yet.'))); return; }
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
      const dl = el('button', 'cp-x', '📄'); dl.title = 'Print / PDF';
      dl.onclick = () => downloadInvoicePDF(i);
      r.appendChild(dl);
      if (i.phone) {
        const wa = el('button', 'cp-x', '💬'); wa.title = 'שלח תמונה בוואטסאפ';
        wa.onclick = () => shareInvoiceWhatsApp(i);
        r.appendChild(wa);
      }
      const del = el('button', 'cp-x', '✕');
      del.onclick = () => { removeInvoice(i.id); drawInvoices(); };
      r.appendChild(del);
      invList.appendChild(r);
    });
  };
  createInv.onclick = () => {
    invError.textContent = '';
    if (!invCust.value.trim()) { invError.textContent = L('הכנס שם לקוח.', 'Enter a customer name.'); return; }
    const lines = invItems.value.split('\n').map(s => s.trim()).filter(Boolean);
    if (!lines.length) { invError.textContent = L('הוסף לפחות פריט אחד. פורמט: תיאור: מחיר', 'Add at least one item. Format: Description: Price'); return; }
    const items: InvoiceItem[] = lines.map(l => {
      if (l.includes(':')) {
        const colonIdx = l.lastIndexOf(':');
        const desc = l.slice(0, colonIdx).trim();
        const rest = l.slice(colonIdx + 1).trim();
        const parts = rest.split(/\s*x\s*/i);
        return { description: desc, price: parseFloat(parts[0]) || 0, qty: parseInt(parts[1]) || 1 };
      }
      const numMatch = l.match(/(\d[\d,.]*)\s*(?:x\s*(\d+))?\s*$/);
      if (numMatch) {
        const desc = l.slice(0, numMatch.index).trim();
        return { description: desc || l, price: parseFloat(numMatch[1].replace(/,/g, '')) || 0, qty: parseInt(numMatch[2]) || 1 };
      }
      return { description: l, price: 0, qty: 1 };
    }).filter(i => i.description);
    if (!items.length) { invError.textContent = L('לא ניתן לפרסר פריטים. פורמט: תיאור: מחיר', 'Could not parse items. Use format: Description: Price'); return; }
    if (items.every(i => i.price === 0)) { invError.textContent = L('כל הפריטים במחיר 0. פורמט: תיאור: מחיר (למשל מצלמה: 4500)', 'All items have price 0. Use format: Description: Price (e.g. Camera: 4500)'); return; }
    createInvoice(invCust.value.trim(), items, { notes: invNotes.value.trim(), phone: invPhone.value.trim() });
    invCust.value = ''; invPhone.value = ''; invItems.value = ''; invNotes.value = '';
    root.replaceChildren(); renderBusiness(root, hooks, close);
  };
  inv.appendChild(field(L('לקוח', 'Customer'), invCust));
  inv.appendChild(field(L('טלפון', 'Phone'), invPhone));
  inv.appendChild(field(L('פריטים', 'Items'), invItems));
  inv.appendChild(field(L('הערות', 'Notes'), invNotes));
  inv.appendChild(createInv);
  inv.appendChild(invError);
  inv.appendChild(invList);
  drawInvoices();
  root.appendChild(inv);

  // ── Marketing engine ──
  const mk = card(L('מנוע שיווק', 'Marketing Engine'), L('תוכן ויראלי AI לטיקטוק / פייסבוק', 'AI viral content for TikTok / Facebook'));
  const topic = input(L('נושא — למשל התקנת מצלמה 360° על סקאניה', 'Topic — e.g. 360° camera install on a Scania'));
  const platform = el('select', 'cp-input') as HTMLSelectElement;
  ['TikTok', 'Facebook', 'Instagram Reels'].forEach(p => {
    const o = el('option') as HTMLOptionElement; o.value = p; o.textContent = p; platform.appendChild(o);
  });
  const goal = el('select', 'cp-input') as HTMLSelectElement;
  ['Go viral', 'Generate leads', 'Build trust', 'Showcase a job'].forEach(g => {
    const o = el('option') as HTMLOptionElement; o.value = g; o.textContent = g; goal.appendChild(o);
  });
  const gen = btn(L('צור אסטרטגיית תוכן', 'Generate content strategy'), true);
  gen.onclick = () => {
    const t = topic.value.trim() || '360° truck camera installation';
    const prompt = `Act as a viral social media strategist for a heavy-vehicle safety installation business. ` +
      `Platform: ${platform.value}. Goal: ${goal.value}. Topic: "${t}". ` +
      `Give me: 1) a 3-second hook, 2) a short punchy caption, 3) a shot-list for a 15-30s video, ` +
      `4) 12 optimized hashtags. Keep it tight and ready to post.`;
    hooks.ask(prompt); close();
  };
  mk.appendChild(field(L('נושא', 'Topic'), topic));
  mk.appendChild(field(L('פלטפורמה', 'Platform'), platform));
  mk.appendChild(field(L('מטרה', 'Goal'), goal));
  mk.appendChild(gen);
  root.appendChild(mk);

  // ── Quoting ──
  const q = card(L('הצעה מהירה', 'Quick Quote'), L('הצעת מחיר → נשמר ל-HeavyGuard', 'Natural-language quote → saved to HeavyGuard'));
  const cust = input(L('שם לקוח', 'Customer name'));
  const phone = input(L('טלפון', 'Phone'));
  const items = textarea('One per line — e.g.\n360 camera system: 4500\nInstallation: 800', 4);
  const save = btn(L('צור הצעה', 'Create quote'), true);
  const out = el('div', 'cp-note');
  save.onclick = () => {
    const lines = items.value.split('\n').map(s => s.trim()).filter(Boolean);
    const parsed = lines.map(l => {
      const [desc, price] = l.split(':');
      return { description: (desc || '').trim(), price: parseFloat(price) || 0, qty: 1 };
    }).filter(i => i.description);
    if (!parsed.length) { out.textContent = L('הוסף לפחות שורה אחת.', 'Add at least one line item.'); return; }
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
  q.appendChild(field(L('לקוח', 'Customer'), cust));
  q.appendChild(field(L('טלפון', 'Phone'), phone));
  q.appendChild(field(L('פריטים', 'Line items'), items));
  q.appendChild(save);
  q.appendChild(out);
  root.appendChild(q);

  // ── Contacts CRM ──
  const cc = card(L('אנשי קשר', 'Contacts'), L('אנשים וחברות שאתה עובד איתם', 'People & companies you work with'));
  const renderContacts = () => {
    const contacts = loadContacts();
    let listHtml = '';
    if (!contacts.length) {
      listHtml = `<div class="cp-note" style="text-align:center;padding:16px;color:var(--dim)">${L('אין אנשי קשר עדיין. הוסף את הראשון למטה.', 'No contacts yet. Add your first one below.')}</div>`;
    } else {
      listHtml = contacts.slice(0, 20).map(c => {
        const tagStr = c.tags.length ? c.tags.map(t => `<span class="cp-row-tag">${esc(t)}</span>`).join(' ') : '';
        return `<div class="cp-row" data-cid="${c.id}">
          <span class="cp-row-main">${c.starred ? '★ ' : ''}${esc(c.name || 'Unnamed')}</span>
          <span class="cp-row-sub">${esc(c.phone)}${c.company ? ' · ' + esc(c.company) : ''}</span>
          ${tagStr}
          <button class="cp-row-del" data-del="${c.id}">✕</button>
        </div>`;
      }).join('');
    }
    ccList.innerHTML = listHtml;
    ccList.querySelectorAll('[data-del]').forEach(b => {
      (b as HTMLElement).onclick = (e) => {
        e.stopPropagation();
        removeContact((b as HTMLElement).dataset.del!);
        renderContacts();
      };
    });
  };
  const ccList = el('div', 'cp-list');
  cc.appendChild(ccList);
  const ccName = input(L('שם', 'Name'));
  const ccPhone = input(L('טלפון', 'Phone'));
  const ccCompany = input(L('חברה', 'Company'));
  const ccTags = input(L('תגיות (מופרדות בפסיק)', 'Tags (comma separated)'));
  const ccAdd = btn(L('הוסף איש קשר', 'Add contact'), true);
  ccAdd.onclick = () => {
    if (!ccName.value.trim() && !ccPhone.value.trim()) return;
    addContact({
      name: ccName.value.trim(),
      phone: ccPhone.value.trim(),
      company: ccCompany.value.trim(),
      tags: ccTags.value.split(',').map(t => t.trim()).filter(Boolean),
    });
    ccName.value = ''; ccPhone.value = ''; ccCompany.value = ''; ccTags.value = '';
    renderContacts();
    hooks.addMsgSys(`Contact added: ${ccName.value || ccPhone.value}`);
  };
  cc.appendChild(field(L('שם', 'Name'), ccName));
  cc.appendChild(field(L('טלפון', 'Phone'), ccPhone));
  cc.appendChild(field(L('חברה', 'Company'), ccCompany));
  cc.appendChild(field(L('תגיות', 'Tags'), ccTags));
  cc.appendChild(ccAdd);
  renderContacts();
  root.appendChild(cc);

  // ── Business Analytics ──
  const an = card(L('אנליטיקה', 'Analytics'), L('מגמות ותובנות', 'Trends and insights'));
  const revTrend = revenueTrend();
  const expTrend = expenseTrend();
  const maxRev = Math.max(1, ...revTrend.map(p => p.value));
  const maxExp = Math.max(1, ...expTrend.map(p => p.value));
  let analyticsHtml = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">';
  analyticsHtml += `<div><div class="cp-card-sub" style="margin-bottom:8px">${L('מגמת הכנסה', 'Revenue trend')}</div><div class="cp-chart">`;
  revTrend.forEach(p => {
    const h = Math.max(3, (p.value / maxRev) * 100);
    analyticsHtml += `<div class="cp-bar"><div class="cp-bar-fill" style="height:${h}%"></div><span class="cp-bar-lbl">${p.label}</span></div>`;
  });
  analyticsHtml += '</div></div>';
  analyticsHtml += `<div><div class="cp-card-sub" style="margin-bottom:8px">${L('מגמת הוצאות', 'Expense trend')}</div><div class="cp-chart">`;
  expTrend.forEach(p => {
    const h = Math.max(3, (p.value / maxExp) * 100);
    analyticsHtml += `<div class="cp-bar"><div class="cp-bar-fill" style="height:${h}%;background:linear-gradient(180deg,#ff5d73,#c94455)"></div><span class="cp-bar-lbl">${p.label}</span></div>`;
  });
  analyticsHtml += '</div></div></div>';
  const catBreakdown = expenseByCategory();
  if (catBreakdown.length) {
    analyticsHtml += `<div style="margin-top:12px"><div class="cp-card-sub" style="margin-bottom:8px">${L('הוצאות לפי קטגוריה', 'Expenses by category')}</div>`;
    const catMax = Math.max(1, catBreakdown[0]?.total || 1);
    catBreakdown.slice(0, 6).forEach(c => {
      const pct = Math.round((c.total / catMax) * 100);
      analyticsHtml += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="width:80px;font-size:12px;color:var(--dim)">${esc(c.category)}</span>
        <div style="flex:1;height:6px;background:rgba(255,255,255,.06);border-radius:3px"><div style="height:100%;width:${pct}%;background:var(--gold);border-radius:3px"></div></div>
        <span style="font-size:12px;color:var(--ink)">₪${c.total.toLocaleString()}</span>
      </div>`;
    });
    analyticsHtml += '</div>';
  }
  const taskRate = taskCompletionRate();
  const lStatuses = leadsByStatus();
  analyticsHtml += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px">`;
  analyticsHtml += `<div class="cp-kpi"><span class="cp-kpi-val">${taskRate.rate}%</span><span class="cp-kpi-lbl">${L('השלמת משימות', 'Task completion')}</span></div>`;
  if (lStatuses.length) {
    analyticsHtml += `<div class="cp-kpi"><span class="cp-kpi-val">${lStatuses.map(s => `${s.count} ${s.status}`).join(', ')}</span><span class="cp-kpi-lbl">${L('לידים לפי סטטוס', 'Leads by status')}</span></div>`;
  }
  analyticsHtml += '</div>';
  // inline sparklines for trends
  const revSparkData = revTrend.map(p => p.value);
  const expSparkData = expTrend.map(p => p.value);
  if (revSparkData.some(v => v > 0) || expSparkData.some(v => v > 0)) {
    analyticsHtml += `<div style="display:flex;gap:16px;margin-top:12px;align-items:center">`;
    if (revSparkData.some(v => v > 0)) {
      analyticsHtml += `<div style="display:flex;align-items:center;gap:6px"><span style="font-size:11px;color:var(--dim)">Rev</span>${sparkline(revSparkData, { width: 80, height: 24 })}</div>`;
    }
    if (expSparkData.some(v => v > 0)) {
      analyticsHtml += `<div style="display:flex;align-items:center;gap:6px"><span style="font-size:11px;color:var(--dim)">Exp</span>${sparkline(expSparkData, { width: 80, height: 24, stroke: '#ff5d73', fill: 'rgba(255,93,115,.15)' })}</div>`;
    }
    analyticsHtml += `<div>${progressRing(taskRate.rate, { size: 36 })}</div>`;
    analyticsHtml += `</div>`;
  }
  an.innerHTML += analyticsHtml;
  const aiBrief = btn(L('תדריך יומי AI', 'AI Daily Briefing'));
  aiBrief.onclick = () => { hooks.ask(dailyBriefing()); close(); };
  an.appendChild(aiBrief);
  root.appendChild(an);

  // ── Templates ──
  const tpl = card(L('תבניות', 'Templates'), L('הודעות מוכנות למעקבים ומיילים', 'Pre-built messages for follow-ups and emails'));
  const tplCat = el('select', 'cp-input') as HTMLSelectElement;
  (['follow-up', 'email', 'quote', 'general'] as const).forEach(c => {
    const o = el('option') as HTMLOptionElement; o.value = c; o.textContent = c.charAt(0).toUpperCase() + c.slice(1); tplCat.appendChild(o);
  });
  const tplList = el('div', 'cp-list');
  const drawTemplates = () => {
    tplList.innerHTML = '';
    const templates = templatesByCategory(tplCat.value as Template['category']);
    if (!templates.length) { tplList.appendChild(el('div', 'cp-empty', L('אין תבניות בקטגוריה זו.', 'No templates in this category.'))); return; }
    templates.forEach(t => {
      const r = el('div', 'cp-row');
      r.style.cursor = 'pointer';
      r.innerHTML = `<span class="cp-row-main">${esc(t.name)}</span><span class="cp-row-sub">${t.variables.length} fields</span>`;
      const use = el('button', 'cp-x', '▶'); use.title = 'Use template';
      use.onclick = (e) => {
        e.stopPropagation();
        const values: Record<string, string> = {};
        for (const v of t.variables) {
          const val = prompt(`${v}:`);
          if (val === null) return;
          values[v] = val;
        }
        const filled = fillTemplate(t.id, values);
        hooks.ask(`Here's a message I need you to review, improve, and format nicely:\n\n${filled}`);
        close();
      };
      r.appendChild(use);
      if (t.id.startsWith('tpl_')) {
        const del = el('button', 'cp-x', '✕');
        del.onclick = (e) => { e.stopPropagation(); removeCustomTemplate(t.id); drawTemplates(); };
        r.appendChild(del);
      }
      tplList.appendChild(r);
    });
  };
  tplCat.onchange = () => drawTemplates();
  tpl.appendChild(field(L('קטגוריה', 'Category'), tplCat));
  tpl.appendChild(tplList);
  drawTemplates();
  const tplName = input(L('שם תבנית', 'Template name'));
  const tplBody = textarea(L('גוף תבנית — השתמש ב-{{משתנה}} לשדות', 'Template body — use {{variable}} for fields'), 3);
  const addTpl = btn(L('שמור תבנית מותאמת', 'Save custom template'));
  addTpl.onclick = () => {
    if (!tplName.value.trim() || !tplBody.value.trim()) return;
    addCustomTemplate(tplName.value.trim(), tplCat.value as Template['category'], tplBody.value);
    tplName.value = ''; tplBody.value = '';
    drawTemplates();
  };
  tpl.appendChild(field(L('תבנית חדשה', 'New template'), tplName));
  tpl.appendChild(tplBody);
  tpl.appendChild(addTpl);
  root.appendChild(tpl);
}

// ============================================================
// TRADING — live ticker, alerts, webhook trigger
// ============================================================
function renderTrading(root: HTMLElement, hooks: CockpitHooks, close: () => void) {
  // ── Live ticker (Binance public API, no key) ──
  const tk = card(L('שוק חי', 'Live Market'), L('פיד מחירים ציבורי · Binance', 'Public price feed · Binance'));
  const sym = input(L('סמל — למשל BTCUSDT', 'Symbol — e.g. BTCUSDT'), 'BTCUSDT');
  const price = el('div', 'cp-bignum', '—');
  const refresh = btn(L('קבל מחיר', 'Get price'));
  const auto = btn(L('אוטומטי ⟳', 'Auto ⟳'));
  let timer: any = null;
  const fetchPrice = async () => {
    price.textContent = '…';
    try {
      const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(sym.value.trim().toUpperCase())}`);
      const d = await r.json();
      if (d.lastPrice) {
        const chg = parseFloat(d.priceChangePercent);
        price.innerHTML = `$${parseFloat(d.lastPrice).toLocaleString()} <span class="cp-chg ${chg >= 0 ? 'up' : 'down'}">${chg >= 0 ? '▲' : '▼'} ${Math.abs(chg).toFixed(2)}%</span>`;
      } else price.textContent = L('סמל לא נמצא', 'Symbol not found');
    } catch { price.textContent = L('פיד לא זמין', 'Feed unavailable'); }
  };
  refresh.onclick = fetchPrice;
  auto.onclick = () => {
    if (timer) { clearInterval(timer); timer = null; auto.classList.remove('on'); }
    else { fetchPrice(); timer = setInterval(fetchPrice, 5000); auto.classList.add('on'); }
  };
  const row = el('div', 'cp-inline');
  row.append(refresh, auto);
  tk.appendChild(field(L('סמל', 'Symbol'), sym));
  tk.appendChild(price);
  tk.appendChild(row);
  root.appendChild(tk);

  // ── Price alerts ──
  const al = card(L('התראות מחיר', 'Price Alerts'), L('התראות אוטומטיות בחציית סף', 'Proactive notifications on threshold cross'));
  const aSym = input(L('סמל', 'Symbol'), 'BTCUSDT');
  const above = input(L('התראה מעל ($)', 'Alert above ($)'));
  const below = input(L('התראה מתחת ($)', 'Alert below ($)'));
  const aNote = input(L('הערה (אופציונלי)', 'Note (optional)'));
  const addAl = btn(L('הוסף התראה', 'Add alert'), true);
  const alList = el('div', 'cp-list');
  const drawAlerts = () => {
    alList.innerHTML = '';
    const alerts = loadPriceAlerts();
    if (!alerts.length) { alList.appendChild(el('div', 'cp-empty', L('אין התראות.', 'No alerts set.'))); return; }
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
  al.appendChild(field(L('סמל', 'Symbol'), aSym));
  const cond = el('div', 'cp-inline'); cond.append(above, below);
  al.appendChild(cond);
  al.appendChild(field(L('הערה', 'Note'), aNote));
  al.appendChild(addAl);
  al.appendChild(alList);
  drawAlerts();
  root.appendChild(al);

  // ── Webhook trigger (secure execution stub) ──
  const wh = card(L('ווב-הוק בוט', 'Bot Webhook'), L('הפעל סקריפט מסחר מוגדר', 'Trigger a predefined trading script'));
  const url = input(L('כתובת Webhook (למשל Replit)', 'Webhook URL (e.g. Replit / TradingView relay)'), localStorage.getItem('alpha_webhook_url') || '');
  const payload = textarea('{ "action": "run", "strategy": "alpha-1" }', 3);
  const fire = btn(L('הפעל webhook', 'Trigger webhook'), true);
  const whOut = el('div', 'cp-note');
  fire.onclick = async () => {
    const u = url.value.trim();
    if (!u) { whOut.textContent = L('הכנס כתובת webhook.', 'Enter a webhook URL.'); return; }
    localStorage.setItem('alpha_webhook_url', u);
    whOut.textContent = 'Sending…';
    try {
      let body: any = {}; try { body = JSON.parse(payload.value || '{}'); } catch {}
      await fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      whOut.textContent = '✅ Triggered (response opaque if CORS-restricted).';
    } catch { whOut.textContent = '⚠️ Request sent / blocked by CORS. For secure key handling, route through a backend relay.'; }
  };
  wh.appendChild(field(L('כתובת', 'URL'), url));
  wh.appendChild(field(L('תוכן', 'Payload'), payload));
  wh.appendChild(fire);
  wh.appendChild(whOut);
  wh.appendChild(el('div', 'cp-warn', '⚠ API keys must never live in the frontend. Point this at a serverless relay (Cloudflare Worker / Replit) that holds the secret and forwards the call.'));
  root.appendChild(wh);

  // ── Prediction markets ──
  const pm = card(L('שווקי חיזוי', 'Prediction Markets'), L('ניטור Polymarket', 'Polymarket monitor'));
  const ask = btn(L('נתח שוק', 'Analyze a market'), true);
  ask.onclick = () => { hooks.ask('Act as a prediction-markets analyst. Explain how to monitor a Polymarket market for significant probability shifts and what thresholds are worth an alert.'); close(); };
  pm.appendChild(ask);
  root.appendChild(pm);
}

// ============================================================
// CREATIVE — lyrics workspace + AI music prompts
// ============================================================
function renderCreative(root: HTMLElement, hooks: CockpitHooks, close: () => void) {
  const ws = card(L('סטודיו מילים', 'Lyrics Studio'), L('מבנה ראפ / היפ-הופ · נשמר אוטומטית', 'Rap / hip-hop structure · auto-saved'));
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
  const assist = btn(L('כתיבה משותפת AI', 'AI co-write'), true);
  assist.onclick = () => {
    const lyr = ta.value.trim();
    hooks.ask(`Act as an elite rap lyricist. Here are my lyrics:\n\n${lyr || '(empty — start me off)'}\n\nKeep my voice and theme. Improve the flow, add internal rhyme, and write the next 8 bars in the same style.`);
    close();
  };
  const polish = btn(L('לטש חרוזים', 'Polish rhymes'));
  polish.onclick = () => { hooks.ask(`Tighten the rhyme scheme and flow of these lyrics without changing the meaning:\n\n${ta.value.trim()}`); close(); };
  tools.append(assist, polish);
  ws.appendChild(tools);
  root.appendChild(ws);

  // ── Music generation prompt ──
  const mg = card(L('פרומפט מוזיקה AI', 'AI Music Prompt'), L('ל-Suno / Udio + הערות מאסטרינג', 'For Suno / Udio + mastering notes'));
  const genre = input(L('ז\'אנר / ויב — למשל dark trap, 140bpm', 'Genre / vibe — e.g. dark trap, 140bpm, melodic'));
  const make = btn(L('צור פרומפט מוזיקה', 'Generate music prompt'), true);
  make.onclick = () => {
    hooks.ask(`Create a detailed AI-music-generation prompt (for Suno/Udio) for a ${genre.value.trim() || 'trap'} track using these lyrics as the hook reference:\n\n${(localStorage.getItem('alpha_lyrics') || '').slice(0, 600)}\n\nInclude: BPM, key, instrumentation, mood, song structure, and 3 mastering tips for a loud, clean mix.`);
    close();
  };
  mg.appendChild(field(L('ז\'אנר / ויב', 'Genre / vibe'), genre));
  mg.appendChild(make);
  root.appendChild(mg);
}

// ============================================================
// PERSONAL — daily briefing, tasks, habits, expenses,
//            family calendar, brain-dump auto-tagging
// ============================================================
function renderPersonal(root: HTMLElement, hooks: CockpitHooks, close: () => void) {
  // ── Alpha Score ──
  const sc = calculateScore();
  const scCard = card(L('ציון Alpha', 'Alpha Score'), scoreLabel(sc.total));
  const scColor = scoreColor(sc.total);
  scCard.innerHTML += `<div style="display:flex;align-items:center;gap:16px;margin:8px 0">
    ${progressRing(sc.total, { size: 56, stroke: scColor, width: 4 })}
    <div style="flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:4px">
      <div style="font-size:11px;color:var(--dim)">Tasks <span style="color:${scColor}">${sc.tasks}/20</span></div>
      <div style="font-size:11px;color:var(--dim)">Habits <span style="color:${scColor}">${sc.habits}/15</span></div>
      <div style="font-size:11px;color:var(--dim)">Focus <span style="color:${scColor}">${sc.focus}/15</span></div>
      <div style="font-size:11px;color:var(--dim)">Business <span style="color:${scColor}">${sc.business}/20</span></div>
      <div style="font-size:11px;color:var(--dim)">Goals <span style="color:${scColor}">${sc.goals}/15</span></div>
      <div style="font-size:11px;color:var(--dim)">Wellness <span style="color:${scColor}">${sc.wellness}/15</span></div>
    </div>
  </div>`;
  if (sc.streak > 0) {
    scCard.innerHTML += `<div style="font-size:12px;color:var(--gold);text-align:center">🔥 ${sc.streak}-day streak</div>`;
  }
  root.appendChild(scCard);

  // ── Daily briefing ──
  const brief = card(L('תדריך יומי', 'Daily Briefing'), L('היום שלך במבט חטוף', 'Your day at a glance'));
  const today = new Date().toISOString().slice(0, 10);
  const todayEv = loadEvents().filter(e => e.date === today);
  const openTasks = loadTasks().filter(t => !t.done);
  const habitsToday = loadHabits();
  const habitsDone = habitsToday.filter(isHabitDoneToday).length;
  const sum = el('div', 'cp-kpis');
  sum.innerHTML =
    `<div class="cp-kpi"><span class="cp-kpi-val">${todayEv.length}</span><span class="cp-kpi-lbl">${L('אירועים היום', 'Events today')}</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${openTasks.length}</span><span class="cp-kpi-lbl">${L('משימות פתוחות', 'Open tasks')}</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${habitsDone}/${habitsToday.length}</span><span class="cp-kpi-lbl">${L('הרגלים', 'Habits')}</span></div>`;
  brief.appendChild(sum);
  const briefBtn = btn(L('תדרך אותי על היום', 'Brief me on my day'), true);
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
  const tc = card(L('משימות', 'Tasks'), L('משימות מהירות עם עדיפות', 'Quick to-dos with priority'));
  const tText = input(L('מה צריך לעשות?', 'What needs doing?'));
  const tPrio = el('select', 'cp-input') as HTMLSelectElement;
  ([['med', 'Medium'], ['high', 'High'], ['low', 'Low']] as const).forEach(([v, l]) => {
    const o = el('option') as HTMLOptionElement; o.value = v; o.textContent = l; tPrio.appendChild(o);
  });
  const addT = btn(L('הוסף משימה', 'Add task'), true);
  const tList = el('div', 'cp-list');
  const drawTasks = () => {
    tList.innerHTML = '';
    const tasks = loadTasks().sort((a, b) => Number(a.done) - Number(b.done));
    if (!tasks.length) { tList.appendChild(el('div', 'cp-empty', L('אין משימות. הוסף אחת למעלה.', 'No tasks. Add one above.'))); return; }
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
  const hc = card(L('הרגלים', 'Habits'), L('בנה רצפים · הקש לסימון היום', 'Build streaks · tap to mark done today'));
  const hName = input(L('הרגל חדש — למשל ספורט, קריאה', 'New habit — e.g. Gym, Read, No sugar'));
  const addH = btn(L('הוסף הרגל', 'Add habit'), true);
  const hList = el('div', 'cp-list');
  const drawHabits = () => {
    hList.innerHTML = '';
    const habits = loadHabits();
    if (!habits.length) { hList.appendChild(el('div', 'cp-empty', L('אין הרגלים עדיין.', 'No habits yet.'))); return; }
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
  hc.appendChild(field(L('הרגל', 'Habit'), hName));
  hc.appendChild(addH);
  hc.appendChild(hList);
  drawHabits();
  root.appendChild(hc);

  // ── Expense tracker ──
  const ec = card(L('הוצאות', 'Expenses'), L('החודש · לפי קטגוריה', 'This month · by category'));
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
  const exLabel = input(L('מה — למשל דלק', 'What — e.g. Diesel'));
  const exAmt = input(L('סכום (₪)', 'Amount (₪)'));
  const exCat = el('select', 'cp-input') as HTMLSelectElement;
  EXPENSE_CATEGORIES.forEach(c => { const o = el('option') as HTMLOptionElement; o.value = c; o.textContent = c; exCat.appendChild(o); });
  const addE = btn(L('רשום הוצאה', 'Log expense'), true);
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
  const cal = card(L('משפחה וחיים', 'Family & Life'), L('לוח שנה משותף', 'Shared calendar'));
  const title = input(L('אירוע — למשל שיעור שחייה של מאיה', 'Event — e.g. Maya swimming class'));
  const date = el('input', 'cp-input') as HTMLInputElement; date.type = 'date';
  const time = el('input', 'cp-input') as HTMLInputElement; time.type = 'time';
  const add = btn('Add to calendar', true);
  const upcoming = el('div', 'cp-list');
  const draw = () => {
    upcoming.innerHTML = '';
    const today = new Date().toISOString().slice(0, 10);
    const ev = loadEvents().filter(e => e.date >= today).slice(0, 8);
    if (!ev.length) { upcoming.appendChild(el('div', 'cp-empty', L('אין אירועים קרובים.', 'Nothing upcoming.'))); return; }
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
  cal.appendChild(field(L('אירוע', 'Event'), title));
  const dr = el('div', 'cp-inline'); dr.append(date, time);
  cal.appendChild(dr);
  cal.appendChild(add);
  cal.appendChild(upcoming);
  draw();
  root.appendChild(cal);

  // ── Pomodoro Timer ──
  const pomo = card(L('טיימר מיקוד', 'Focus Timer'), L('טכניקת פומודורו · 25 דקות עבודה / 5 דקות הפסקה', 'Pomodoro technique · 25 min work / 5 min break'));
  const pomoStats = todayPomoStats();
  const weekPomo = weekPomoStats();
  const pomoKpis = el('div', 'cp-kpis');
  pomoKpis.innerHTML =
    `<div class="cp-kpi"><span class="cp-kpi-val">${pomoStats.completed}</span><span class="cp-kpi-lbl">${L('היום', 'Today')}</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${pomoStats.focusMin}m</span><span class="cp-kpi-lbl">${L('מיקוד', 'Focus')}</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${weekPomo.totalSessions}</span><span class="cp-kpi-lbl">${L('השבוע', 'This week')}</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${weekPomo.streak}d</span><span class="cp-kpi-lbl">${L('רצף', 'Streak')}</span></div>`;
  pomo.appendChild(pomoKpis);
  const pomoDisplay = el('div', 'cp-bignum', '25:00');
  pomoDisplay.style.textAlign = 'center';
  pomo.appendChild(pomoDisplay);
  let pomoInterval: any = null;
  let pomoTimeLeft = 25 * 60;
  let pomoIsBreak = false;
  const pomoBtns = el('div', 'cp-inline');
  pomoBtns.style.justifyContent = 'center';
  const pomoStart = btn(L('התחל מיקוד', 'Start focus'), true);
  const pomoReset = btn(L('איפוס', 'Reset'));
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

  // ── Time Tracker ──
  const ttc = card(L('מעקב זמן', 'Time Tracker'), L('מעקב שעות על פרויקטים', 'Track hours on projects'));
  const ttToday = todayTime();
  const ttWeek = weekTime();
  const ttKpis = el('div', 'cp-kpis');
  ttKpis.innerHTML =
    `<div class="cp-kpi"><span class="cp-kpi-val">${formatDuration(ttToday.total)}</span><span class="cp-kpi-lbl">${L('היום', 'Today')}</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${formatDuration(ttWeek.total)}</span><span class="cp-kpi-lbl">${L('השבוע', 'This week')}</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${ttToday.byProject.length}</span><span class="cp-kpi-lbl">${L('פרויקטים', 'Projects')}</span></div>`;
  ttc.appendChild(ttKpis);
  const activeT = getActiveTimer();
  const ttProject = input(activeT ? activeT.project : 'Project name');
  const ttDesc = input('Description (optional)');
  const ttStartBtn = btn(activeT ? L('עצור מעקב', 'Stop tracking') : L('התחל מעקב', 'Start tracking'), true);
  if (activeT) {
    const elapsed = Math.round((Date.now() - activeT.startTime) / 60000);
    ttc.appendChild(el('div', 'cp-bignum', `${formatDuration(elapsed)} running`));
    ttProject.value = activeT.project;
    ttProject.disabled = true;
  }
  ttStartBtn.onclick = () => {
    if (getActiveTimer()) {
      const entry = stopTimer();
      if (entry) hooks.addMsgSys(`⏱️ Tracked ${formatDuration(entry.duration)} on ${entry.project}`);
    } else {
      if (!ttProject.value.trim()) return;
      startTimer(ttProject.value.trim(), ttDesc.value.trim());
    }
    root.replaceChildren(); renderPersonal(root, hooks, close);
  };
  ttc.appendChild(field(L('פרויקט', 'Project'), ttProject));
  ttc.appendChild(field(L('תיאור', 'Description'), ttDesc));
  ttc.appendChild(ttStartBtn);
  const ttList = el('div', 'cp-list');
  const entries = loadTimeEntries().slice(0, 10);
  entries.forEach(e => {
    const r = el('div', 'cp-row');
    r.innerHTML = `<span class="cp-row-main">${esc(e.project)}</span>` +
      `<span class="cp-row-sub">${e.description || e.date}</span>` +
      `<span class="cp-row-tag">${formatDuration(e.duration)}</span>`;
    const x = el('button', 'cp-x', '✕');
    x.onclick = () => { removeTimeEntry(e.id); root.replaceChildren(); renderPersonal(root, hooks, close); };
    r.appendChild(x);
    ttList.appendChild(r);
  });
  if (!entries.length && !activeT) ttList.appendChild(el('div', 'cp-empty', L('אין רשומות זמן עדיין.', 'No time entries yet.')));
  ttc.appendChild(ttList);
  root.appendChild(ttc);

  // ── Wellness Tracker ──
  const well = card(L('בריאות', 'Wellness'), L('מצב רוח · אנרגיה · מים · שינה', 'Mood · Energy · Water · Sleep'));
  const currentMood = todayMood();
  const ms = moodStreak();
  const wellKpis = el('div', 'cp-kpis');
  wellKpis.innerHTML =
    `<div class="cp-kpi"><span class="cp-kpi-val">${currentMood ? MOOD_EMOJI[currentMood.mood] : '—'}</span><span class="cp-kpi-lbl">${L('מצב רוח', 'Mood')}</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${todayWater()}</span><span class="cp-kpi-lbl">${L('מים 💧', 'Water 💧')}</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${sleepAvg().hours || '—'}h</span><span class="cp-kpi-lbl">${L('ממוצע שינה', 'Avg sleep')}</span></div>` +
    `<div class="cp-kpi"><span class="cp-kpi-val">${ms.avg || '—'}</span><span class="cp-kpi-lbl">${L('ממוצע שבועי', 'Week avg')}</span></div>`;
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
  well.appendChild(el('div', 'cp-label', L('איך אתה מרגיש?', 'How are you feeling?')));
  well.appendChild(moodRow);
  const waterBtn = btn(L('+ כוס מים 💧', '+ Water glass 💧'));
  waterBtn.onclick = () => { addWater(); root.replaceChildren(); renderPersonal(root, hooks, close); };
  well.appendChild(waterBtn);
  const sleepRow = el('div', 'cp-inline');
  const sleepH = input(L('שעות שינה', 'Hours slept'));
  sleepH.type = 'number'; sleepH.min = '0'; sleepH.max = '24'; sleepH.step = '0.5';
  const sleepQ = el('select', 'cp-input') as HTMLSelectElement;
  [[5, 'Great'], [4, 'Good'], [3, 'Okay'], [2, 'Poor'], [1, 'Bad']].forEach(([v, l]) => {
    const o = el('option') as HTMLOptionElement; o.value = String(v); o.textContent = l as string; sleepQ.appendChild(o);
  });
  const logS = btn(L('רשום שינה', 'Log sleep'));
  logS.onclick = () => {
    const h = parseFloat(sleepH.value);
    if (!h) return;
    logSleep(h, parseInt(sleepQ.value) || 3);
    root.replaceChildren(); renderPersonal(root, hooks, close);
  };
  sleepRow.append(sleepH, sleepQ, logS);
  well.appendChild(el('div', 'cp-label', L('יומן שינה', 'Sleep log')));
  well.appendChild(sleepRow);
  const wellnessAI = btn(L('תובנות בריאות AI', 'AI wellness insights'), true);
  wellnessAI.onclick = () => {
    const wData = `Mood: ${currentMood ? currentMood.mood + (currentMood.note ? ' - ' + currentMood.note : '') : 'not logged'}, Water: ${todayWater()} glasses, Sleep avg: ${sleepAvg().hours}h (quality ${sleepAvg().quality}/5), Week mood avg: ${ms.avg}/5`;
    hooks.ask(`Act as a wellness coach. Here are my wellness stats: ${wData}. Give me 3 personalized tips to improve my wellbeing today. Be warm and actionable.`);
    close();
  };
  well.appendChild(wellnessAI);
  root.appendChild(well);

  // ── Goals ──
  const gc = card(L('יעדים', 'Goals'), L('מעקב יעדים רבעוניים וחודשיים', 'Track quarterly & monthly objectives'));
  const gs = activeGoalsSummary();
  if (gs.total > 0) {
    const gKpis = el('div', 'cp-kpis');
    gKpis.innerHTML =
      `<div class="cp-kpi"><span class="cp-kpi-val">${gs.total}</span><span class="cp-kpi-lbl">${L('יעדים', 'Goals')}</span></div>` +
      `<div class="cp-kpi"><span class="cp-kpi-val">${gs.completed}</span><span class="cp-kpi-lbl">${L('הושלמו', 'Done')}</span></div>` +
      `<div class="cp-kpi"><span class="cp-kpi-val">${gs.avgProgress}%</span><span class="cp-kpi-lbl">${L('התקדמות', 'Progress')}</span></div>`;
    gc.appendChild(gKpis);
  }
  const gTitle = input(L('יעד — למשל סגור 10 עסקאות הרבעון', 'Goal — e.g. Close 10 deals this quarter'));
  const gTimeframe = el('select', 'cp-input') as HTMLSelectElement;
  (['week', 'month', 'quarter', 'year'] as GoalTimeframe[]).forEach(t => {
    const o = el('option') as HTMLOptionElement; o.value = t; o.textContent = t.charAt(0).toUpperCase() + t.slice(1); gTimeframe.appendChild(o);
  });
  gTimeframe.value = 'month';
  const gCat = el('select', 'cp-input') as HTMLSelectElement;
  (['business', 'personal', 'health', 'creative', 'financial'] as const).forEach(c => {
    const o = el('option') as HTMLOptionElement; o.value = c; o.textContent = c.charAt(0).toUpperCase() + c.slice(1); gCat.appendChild(o);
  });
  const gMilestones = input(L('אבני דרך (מופרדות בפסיק, אופציונלי)', 'Milestones (comma separated, optional)'));
  const addG = btn(L('הוסף יעד', 'Add goal'), true);
  const gList = el('div', 'cp-list');
  const drawGoals = () => {
    gList.innerHTML = '';
    const goals = loadGoals();
    if (!goals.length) { gList.appendChild(el('div', 'cp-empty', L('אין יעדים עדיין. הגדר את הראשון למעלה.', 'No goals yet. Set your first above.'))); return; }
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
  gc.appendChild(field(L('יעד', 'Goal'), gTitle));
  const gRow = el('div', 'cp-inline'); gRow.append(gTimeframe, gCat);
  gc.appendChild(gRow);
  gc.appendChild(field(L('אבני דרך', 'Milestones'), gMilestones));
  gc.appendChild(addG);
  gc.appendChild(gList);
  drawGoals();
  root.appendChild(gc);

  // ── Voice-to-task: dump → auto-tag → categorize ──
  const vt = card(L('סיעור מוחות → משימות', 'Brain Dump → Tasks'), L('ממוין אוטומטית לעסקים / מסחר / אישי', 'Auto-sorted into Business / Trading / Personal'));
  const dump = textarea('One idea per line. I’ll tag each as Business, Trading, Creative or Personal…', 5);
  const sort = btn(L('לכוד ומיין', 'Capture & categorize'), true);
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

  // ── Smart Notes ──
  const snc = card(L('פתקים חכמים', 'Smart Notes'), L('פתקים ממויינים עם הצמדה', 'Categorized notes with pinning'));
  const snText = textarea('Quick note…', 3);
  const snCat = el('select', 'cp-input') as HTMLSelectElement;
  NOTE_CATEGORIES.forEach(c => { const o = el('option') as HTMLOptionElement; o.value = c; o.textContent = c; snCat.appendChild(o); });
  const addSN = btn(L('שמור פתק', 'Save note'), true);
  const snList = el('div', 'cp-list');
  const drawNotes = () => {
    snList.innerHTML = '';
    const notes = loadSmartNotes();
    const pinned = notes.filter(n => n.pinned);
    const unpinned = notes.filter(n => !n.pinned);
    [...pinned, ...unpinned].slice(0, 15).forEach(n => {
      const r = el('div', 'cp-row');
      r.style.flexWrap = 'wrap';
      r.innerHTML =
        `<span class="cp-row-main" style="flex:1;min-width:100px">${n.pinned ? '📌 ' : ''}${esc(n.text.slice(0, 60))}</span>` +
        `<span class="cp-row-tag">${esc(n.category)}</span>` +
        `<span class="cp-row-sub">${n.created}</span>`;
      const pin = el('button', 'cp-x', n.pinned ? '★' : '☆');
      pin.title = 'Pin/unpin';
      pin.onclick = () => { togglePin(n.id); drawNotes(); };
      r.appendChild(pin);
      const x = el('button', 'cp-x', '✕');
      x.onclick = () => { removeSmartNote(n.id); drawNotes(); };
      r.appendChild(x);
      snList.appendChild(r);
    });
    if (!notes.length) snList.appendChild(el('div', 'cp-empty', L('אין פתקים עדיין.', 'No notes yet.')));
  };
  addSN.onclick = () => {
    if (!snText.value.trim()) return;
    addSmartNote(snText.value.trim(), snCat.value);
    snText.value = '';
    drawNotes();
  };
  snc.appendChild(snText);
  snc.appendChild(snCat);
  snc.appendChild(addSN);
  snc.appendChild(snList);
  drawNotes();
  root.appendChild(snc);

  // ── Recurring Tasks ──
  const rc = card(L('משימות חוזרות', 'Recurring Tasks'), L('יצירת משימות אוטומטית לפי לוח זמנים', 'Auto-generate tasks on schedule'));
  const rtText = input(L('שם משימה', 'Task name'));
  const rtFreq = el('select', 'cp-input') as HTMLSelectElement;
  (['daily', 'weekly', 'monthly'] as RecurFreq[]).forEach(f => {
    const o = el('option') as HTMLOptionElement; o.value = f; o.textContent = f.charAt(0).toUpperCase() + f.slice(1); rtFreq.appendChild(o);
  });
  const rtPrio = el('select', 'cp-input') as HTMLSelectElement;
  ([['med', 'Medium'], ['high', 'High'], ['low', 'Low']] as const).forEach(([v, l]) => {
    const o = el('option') as HTMLOptionElement; o.value = v; o.textContent = l; rtPrio.appendChild(o);
  });
  const addRT = btn(L('הוסף משימה חוזרת', 'Add recurring'), true);
  const rtList = el('div', 'cp-list');
  const drawRecurring = () => {
    rtList.innerHTML = '';
    const tasks = loadRecurring();
    if (!tasks.length) { rtList.appendChild(el('div', 'cp-empty', L('אין משימות חוזרות.', 'No recurring tasks.'))); return; }
    tasks.forEach(t => {
      const r = el('div', 'cp-row');
      r.innerHTML =
        `<span class="cp-row-main">${esc(t.text)}</span>` +
        `<span class="cp-row-tag">${t.frequency}</span>` +
        `<span class="cp-row-sub" style="opacity:${t.active ? 1 : 0.4}">${t.active ? 'Active' : 'Paused'}</span>`;
      const toggle = el('button', 'cp-x', t.active ? '⏸' : '▶');
      toggle.onclick = () => { toggleRecurring(t.id); drawRecurring(); };
      r.appendChild(toggle);
      const x = el('button', 'cp-x', '✕');
      x.onclick = () => { removeRecurring(t.id); drawRecurring(); };
      r.appendChild(x);
      rtList.appendChild(r);
    });
  };
  addRT.onclick = () => {
    if (!rtText.value.trim()) return;
    addRecurring(rtText.value.trim(), rtFreq.value as RecurFreq, rtPrio.value as any);
    rtText.value = '';
    drawRecurring();
  };
  rc.appendChild(field(L('משימה', 'Task'), rtText));
  const rtRow = el('div', 'cp-inline'); rtRow.append(rtFreq, rtPrio);
  rc.appendChild(rtRow);
  rc.appendChild(addRT);
  rc.appendChild(rtList);
  drawRecurring();
  root.appendChild(rc);
}

// ============================================================
// MEMORY — profile, facts, projects
// ============================================================
function renderMemory(root: HTMLElement) {
  const m = loadMemory();

  const prof = card(L('פרופיל', 'Profile'), L('זהות ארוכת טווח שהעוזר זוכר', 'Long-term identity the assistant remembers'));
  const name = input('Name', m.profile.name);
  const role = input('Role', m.profile.role);
  const biz = input('Business', m.profile.business);
  const loc = input('Location', m.profile.location);
  const prefs = input('Preferences (comma separated)', m.profile.preferences.join(', '));
  const saveP = btn(L('שמור פרופיל', 'Save profile'), true);
  const pNote = el('div', 'cp-note');
  saveP.onclick = () => {
    updateProfile({
      name: name.value.trim(), role: role.value.trim(), business: biz.value.trim(),
      location: loc.value.trim(),
      preferences: prefs.value.split(',').map(s => s.trim()).filter(Boolean),
    });
    pNote.textContent = L('✅ נשמר. העוזר ישתמש בזה בכל תשובה.', '✅ Saved. The assistant will use this in every reply.');
  };
  [[L('שם', 'Name'), name], [L('תפקיד', 'Role'), role], [L('עסק', 'Business'), biz], [L('מיקום', 'Location'), loc], [L('העדפות', 'Preferences'), prefs]]
    .forEach(([l, i]) => prof.appendChild(field(l as string, i as HTMLElement)));
  prof.appendChild(saveP); prof.appendChild(pNote);
  root.appendChild(prof);

  // ── Facts ──
  const fc = card(L('עובדות שנזכרו', 'Remembered Facts'), `${m.facts.length} ${L('שמורות', 'stored')}`);
  const newFact = input(L('למד אותי משהו לזכור…', 'Teach me something to remember…'));
  const addF = btn(L('זכור', 'Remember'), true);
  const fList = el('div', 'cp-list');
  const drawFacts = () => {
    fList.innerHTML = '';
    const facts = loadMemory().facts.slice(0, 30);
    if (!facts.length) { fList.appendChild(el('div', 'cp-empty', L('אין עובדות עדיין.', 'No facts yet.'))); return; }
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
  fc.appendChild(field(L('עובדה חדשה', 'New fact'), newFact));
  fc.appendChild(addF);
  fc.appendChild(fList);
  drawFacts();
  root.appendChild(fc);

  // ── Projects ──
  const pc = card(L('פרויקטים פעילים', 'Active Projects'), L('מעקב חוצה מודולים', 'Tracked across modules'));
  const pTitle = input(L('שם פרויקט', 'Project title'));
  const pMod = el('select', 'cp-input') as HTMLSelectElement;
  MODULE_LIST.forEach(mo => { const o = el('option') as HTMLOptionElement; o.value = mo.id; o.textContent = mo.label; pMod.appendChild(o); });
  const addPr = btn(L('הוסף פרויקט', 'Add project'), true);
  const pList = el('div', 'cp-list');
  const drawPr = () => {
    pList.innerHTML = '';
    const ps = loadMemory().projects;
    if (!ps.length) { pList.appendChild(el('div', 'cp-empty', L('אין פרויקטים.', 'No projects.'))); return; }
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
  pc.appendChild(field(L('כותרת', 'Title'), pTitle));
  pc.appendChild(field(L('מודול', 'Module'), pMod));
  pc.appendChild(addPr);
  pc.appendChild(pList);
  drawPr();
  root.appendChild(pc);

  // ── Danger ──
  const dz = card(L('איפוס', 'Reset'), L('מחק זיכרון ארוך טווח', 'Wipe long-term memory'));
  const wipe = btn(L('נקה את כל הזיכרון', 'Clear all memory'));
  wipe.onclick = () => { const mm = loadMemory(); mm.facts = []; mm.projects = []; mm.summary = ''; saveMemory(mm); root.innerHTML = ''; renderMemory(root); };
  dz.appendChild(wipe);
  root.appendChild(dz);
}

// ============================================================
// ADVANCED — vision + document parsing
// ============================================================
function renderAdvanced(root: HTMLElement, hooks: CockpitHooks, close: () => void) {
  // ── Vision ──
  const vz = card(L('ראייה', 'Vision'), L('ניתוח תמונה — תא נהג, תרשים או גרף', 'Analyze a photo — truck cabin, diagram, or chart'));
  const imgInput = el('input', 'cp-input') as HTMLInputElement;
  imgInput.type = 'file'; imgInput.accept = 'image/*';
  const q = input('What should I look for?', 'Describe this and give actionable insights');
  const preview = el('img', 'cp-preview') as HTMLImageElement;
  preview.style.display = 'none';
  const analyze = btn(L('נתח תמונה', 'Analyze image'), true);
  const vOut = el('div', 'cp-note');
  let dataUrl = '';
  imgInput.onchange = () => {
    const f = imgInput.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { dataUrl = reader.result as string; preview.src = dataUrl; preview.style.display = 'block'; };
    reader.readAsDataURL(f);
  };
  analyze.onclick = async () => {
    if (!dataUrl) { vOut.textContent = L('בחר תמונה קודם.', 'Choose an image first.'); return; }
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
  vz.appendChild(field(L('תמונה', 'Image'), imgInput));
  vz.appendChild(preview);
  vz.appendChild(field(L('שאלה', 'Question'), q));
  vz.appendChild(analyze);
  vz.appendChild(vOut);
  root.appendChild(vz);

  // ── Document parsing ──
  const dz = card(L('מסמכים', 'Documents'), L('העלה PDF או קובץ טקסט ושאל עליו', 'Drop a PDF or text file and query it'));
  const docInput = el('input', 'cp-input') as HTMLInputElement;
  docInput.type = 'file'; docInput.accept = '.pdf,.txt,.md,.csv';
  const dq = input(L('שאלה על המסמך', 'Question about the document'), L('סכם את הנקודות העיקריות', 'Summarize the key points'));
  const parse = btn(L('פרסר ושאל', 'Parse & ask'), true);
  const dOut = el('div', 'cp-note');
  let docText = '';
  docInput.onchange = async () => {
    const f = docInput.files?.[0]; if (!f) return;
    dOut.textContent = L('קורא…', 'Reading…');
    try {
      if (f.type === 'application/pdf' || f.name.endsWith('.pdf')) {
        docText = await extractPdfText(f);
      } else {
        docText = await f.text();
      }
      dOut.textContent = L(`נטענו ${docText.length.toLocaleString()} תווים מ-${f.name}.`, `Loaded ${docText.length.toLocaleString()} chars from ${f.name}.`);
    } catch (e) { dOut.textContent = L('לא ניתן לקרוא את הקובץ.', 'Could not read that file.'); }
  };
  parse.onclick = () => {
    if (!docText) { dOut.textContent = L('טען מסמך קודם.', 'Load a document first.'); return; }
    const excerpt = docText.slice(0, 6000);
    hooks.ask(`${dq.value.trim() || 'Summarize'} — based on this document:\n\n"""${excerpt}"""`);
    close();
  };
  dz.appendChild(field(L('קובץ', 'File'), docInput));
  dz.appendChild(field(L('שאלה', 'Question'), dq));
  dz.appendChild(parse);
  dz.appendChild(dOut);
  root.appendChild(dz);

  // ── Data Health ──
  const dh = card(L('בריאות נתונים', 'Data Health'), L('שלמות אחסון ושימוש', 'Storage integrity and usage'));
  const integrity = checkIntegrity();
  const storage = storageUsage();
  dh.innerHTML += `<div class="cp-kpis">
    <div class="cp-kpi"><span class="cp-kpi-val" style="color:${integrity.corrupted.length ? '#ff5d73' : '#4dff91'}">${integrity.healthy}</span><span class="cp-kpi-lbl">${L('תקין', 'Healthy')}</span></div>
    <div class="cp-kpi"><span class="cp-kpi-val" style="color:${integrity.corrupted.length ? '#ff5d73' : 'var(--dim)'}">${integrity.corrupted.length}</span><span class="cp-kpi-lbl">${L('פגום', 'Corrupted')}</span></div>
    <div class="cp-kpi"><span class="cp-kpi-val">${integrity.empty.length}</span><span class="cp-kpi-lbl">${L('ריק', 'Empty')}</span></div>
    <div class="cp-kpi"><span class="cp-kpi-val">${storage.percent}%</span><span class="cp-kpi-lbl">${L('אחסון', 'Storage')}</span></div>
  </div>`;
  dh.innerHTML += `<div style="margin:8px 0"><div style="height:6px;background:rgba(255,255,255,.06);border-radius:3px"><div style="height:100%;width:${storage.percent}%;background:${storage.percent > 80 ? '#ff5d73' : 'var(--gold)'};border-radius:3px"></div></div><div style="font-size:11px;color:var(--dim);margin-top:4px">${(storage.used / 1024).toFixed(1)} KB / ${(storage.available / 1024).toFixed(0)} KB</div></div>`;
  if (integrity.corrupted.length) {
    const repairBtn = btn(L('תקן אחסונים פגומים', 'Repair corrupted stores'));
    repairBtn.onclick = () => {
      let fixed = 0;
      for (const key of integrity.corrupted) {
        if (repairCorrupted(key)) fixed++;
      }
      hooks.addMsgSys(`Data repair: ${fixed}/${integrity.corrupted.length} stores fixed.`);
      root.replaceChildren(); renderAdvanced(root, hooks, close);
    };
    dh.appendChild(repairBtn);
  }
  root.appendChild(dh);

  // ── Sentiment Analysis ──
  const sa = card(L('מצב רוח שיחה', 'Conversation Mood'), L('מעקב סנטימנט מהשיחות שלך', 'Sentiment tracking from your conversations'));
  const sent = averageSentiment();
  const sentTrend = sentimentTrend(7);
  const sentIcon = sent.score > 0.3 ? '😊' : sent.score < -0.3 ? '😟' : '😐';
  sa.innerHTML += `<div style="display:flex;align-items:center;gap:16px;margin:8px 0">
    <span style="font-size:28px">${sentIcon}</span>
    <div>
      <div style="font-size:14px;color:var(--ink)">${sent.label}</div>
      <div style="font-size:11px;color:var(--dim)">Score: ${sent.score.toFixed(2)} (7-day avg)</div>
    </div>
    <div style="margin-left:auto">${sparkline(sentTrend.map(v => (v + 1) * 50), { width: 100, height: 28, stroke: sent.score > 0 ? '#4dff91' : '#ff5d73', fill: sent.score > 0 ? 'rgba(77,255,145,.15)' : 'rgba(255,93,115,.15)', showDots: true })}</div>
  </div>`;
  root.appendChild(sa);

  // ── Reports ──
  const rp = card(L('דוחות', 'Reports'), L('צור והורד דוחות מעוצבים', 'Generate and download formatted reports'));
  const rpBiz = btn(L('דוח עסקי', 'Business Report'));
  rpBiz.onclick = () => downloadReport('business');
  const rpPers = btn(L('דוח אישי', 'Personal Report'));
  rpPers.onclick = () => downloadReport('personal');
  const rpFull = btn(L('דוח מלא', 'Full Report'), true);
  rpFull.onclick = () => downloadReport('full');
  const rpAI = btn(L('ניתוח AI של הנתונים שלי', 'AI analysis of my data'));
  rpAI.onclick = () => {
    hooks.ask(`Act as my strategic advisor. Analyze these metrics:\n\n${businessReport()}\n\n${personalReport()}\n\nGive me 5 actionable recommendations for this week. Be specific and data-driven.`);
    close();
  };
  const rpRow = el('div', 'cp-inline');
  rpRow.append(rpBiz, rpPers, rpFull);
  rp.appendChild(rpRow);
  rp.appendChild(rpAI);
  root.appendChild(rp);
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
