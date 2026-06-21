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
import { addEvent, loadEvents, addTask } from '../assistant/state';

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
// BUSINESS — CRM, marketing engine, quoting
// ============================================================
function renderBusiness(root: HTMLElement, hooks: CockpitHooks, close: () => void) {
  // ── CRM snapshot from HeavyGuard records ──
  let records: any[] = [];
  try { records = JSON.parse(localStorage.getItem('hg2:index') || '[]'); } catch {}
  const crm = card('CRM · HeavyGuard', `${records.length} installation records`);
  const list = el('div', 'cp-list');
  if (!records.length) {
    list.appendChild(el('div', 'cp-empty', 'No records yet. Add installations in HeavyGuard.'));
  } else {
    records.slice(0, 12).forEach(r => {
      const row = el('div', 'cp-row');
      row.innerHTML =
        `<span class="cp-row-main">${esc(r.idNumber || '—')}</span>` +
        `<span class="cp-row-sub">${esc([r.vehicleType, r.manufacturer].filter(Boolean).join(' '))}</span>` +
        `<span class="cp-row-tag">${esc(r.date || '')}</span>`;
      list.appendChild(row);
    });
  }
  crm.appendChild(list);
  root.appendChild(crm);

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
// PERSONAL — family calendar + voice-to-task auto-tagging
// ============================================================
function renderPersonal(root: HTMLElement, hooks: CockpitHooks, _close: () => void) {
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
