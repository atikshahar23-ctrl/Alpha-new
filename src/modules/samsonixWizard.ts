// ============================================================
// Samsonix DVR — Secure Client Wizard + Saved Forms
// Step-by-step form fill, digital signature on canvas,
// save to localStorage, reprint/delete saved forms.
// CVV is NEVER stored anywhere — only used for the first print.
// ============================================================

const FORMS_KEY = 'alpha_samsonix_forms_v1';

export interface SamsonixFormRecord {
  id: string;
  savedAt: string;
  plan: '2gb' | '4gb' | '10gb';
  audio: 'none' | 'with';
  bsd: boolean;
  fullName: string;
  idNum: string;
  email: string;
  phone: string;
  contactName: string;
  company: string;
  bizNum: string;
  veh1: string;
  veh1Type: string;
  veh2: string;
  veh2Type: string;
  cardNum: string;   // stored — needed for business records
  expiry: string;
  // cvv intentionally omitted — never persisted
  sigDataUrl: string;
}

export function loadSamsonixForms(): SamsonixFormRecord[] {
  try { return JSON.parse(localStorage.getItem(FORMS_KEY) || '[]'); } catch { return []; }
}

function saveForms(list: SamsonixFormRecord[]) {
  localStorage.setItem(FORMS_KEY, JSON.stringify(list));
}

function saveFormRecord(rec: SamsonixFormRecord) {
  const list = loadSamsonixForms();
  list.unshift(rec);
  saveForms(list);
}

export function deleteSamsonixForm(id: string) {
  saveForms(loadSamsonixForms().filter(f => f.id !== id));
}

// ── Shared print function (used by wizard + reprint) ──
export function printSamsonixForm(rec: SamsonixFormRecord, cvv = '***') {
  const today = new Date(rec.savedAt).toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const PLAN_LABELS: Record<string, string> = {
    '2gb':  'שימוש בשרת + גלישה 2GB לחודש 39 ש"ח + מע"מ (מומלץ-עד 2 משתמשים ו/או עד 1T)',
    '4gb':  'שימוש בשרת + גלישה 4GB לחודש 49 ש"ח + מע"מ (מומלץ-עד 4 משתמשים ו/או עד 2T)',
    '10gb': 'שימוש בשרת + גלישה 10GB לחודש 59 ש"ח + מע"מ (מומלץ-מעל 5 משתמשים ו/או עד 4T)',
  };
  const maskedCard = rec.cardNum.replace(/(.{4})(?=.)/g, '$1 ');

  const win = window.open('', '_blank', 'width=820,height=1000');
  if (!win) { alert('אנא אפשר חלונות קופצים'); return; }

  win.document.write(`<!DOCTYPE html><html dir="rtl" lang="he"><head>
<meta charset="utf-8"><title>Samsonix DVR – ${rec.fullName}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,Helvetica,sans-serif;direction:rtl;padding:28px 32px;color:#111;background:#fff;font-size:13px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1a1a2e;padding-bottom:14px;margin-bottom:14px}
  .logo-txt{font-size:26px;font-weight:900;color:#1a1a2e;letter-spacing:1px}
  .logo-txt em{color:#e63946;font-style:normal}
  .logo-sub{font-size:10px;color:#666;letter-spacing:3px;font-weight:400;margin-top:2px}
  .date-box{font-size:12px;color:#444;text-align:left}
  h2{text-align:center;font-size:17px;text-decoration:underline;font-weight:800;margin:12px 0 8px;color:#1a1a2e}
  .intro{font-size:12px;color:#333;line-height:1.75;margin-bottom:12px}
  .section{margin-bottom:14px}
  .section-title{font-weight:700;font-size:13px;margin-bottom:6px;color:#1a1a2e;border-bottom:1px solid #ddd;padding-bottom:4px}
  .check-row{display:flex;align-items:flex-start;gap:8px;margin:5px 0;font-size:12.5px;line-height:1.5}
  .box{width:13px;height:13px;border:1.5px solid #222;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;font-size:10px;font-weight:700}
  .checked-box{background:#1a1a2e;color:#fff}
  .product-row{background:#fffbe6;border:1.5px solid #d4a017;border-radius:6px;padding:8px 12px;margin:8px 0;font-size:13px;font-weight:600;display:flex;justify-content:space-between}
  .fields-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px}
  .field-item{border-bottom:1px solid #bbb;padding-bottom:3px}
  .field-lbl{font-size:10px;color:#777;margin-bottom:1px}
  .field-val{font-size:13px;font-weight:600;color:#111;min-height:16px}
  .security-note{background:#f0faf0;border:1px solid #5cb85c;border-radius:6px;padding:8px 12px;font-size:11px;color:#2d7a2d;margin-bottom:14px}
  .sig-area{display:flex;justify-content:space-between;align-items:flex-end;margin-top:16px;gap:20px}
  .sig-block{text-align:center}
  .sig-img{border:1.5px solid #555;border-radius:6px;height:90px;width:200px;object-fit:contain;background:#fff}
  .sig-caption{font-size:11px;color:#555;margin-top:4px}
  .footer-box{margin-top:20px;border-top:1px solid #ccc;padding-top:10px;font-size:10.5px;color:#666;text-align:center;line-height:1.8}
  .note-box{background:#fff8e1;border:1px solid #e6b800;border-radius:5px;padding:7px 10px;font-size:11px;color:#7a5f00;margin:10px 0}
  @media print{body{padding:14px 18px}@page{margin:8mm;size:A4}}
</style></head><body>

<div class="header">
  <div>
    <div class="logo-txt">⚡ <em>samsonix</em></div>
    <div class="logo-sub">ENJOY YOUR DRIVE</div>
  </div>
  <div class="date-box">
    <div>תאריך: <strong>${today}</strong></div>
    <div style="margin-top:4px;font-size:11px;color:#888">DVR Subscription Agreement</div>
  </div>
</div>

<h2>שימוש בשרת לצפייה ב DVR</h2>

<p class="intro">
  הננו שמחים שבחרתם להתקין מערכת DVR עם מצלמות מרחוק ובהקלטות שהוקלטו לצפייה מרחוק.<br>
  המערכת הינה המתקדמת ביותר כוללת זיכרון פנימי ומאפשרת צפייה מרחוק ובהקלטות online באזור קלוטרי תקין.<br>
  על מנת לצפות מרחוק דרך אפליקציה בטלפון ו/או במחשב ביתי – נדרש תשלום חודשי לשרת – ענן · בהוראת קבע.<br>
  ניתן לבטל הוראה זו בהודעה בכתב של 7 ימים מראש.
</p>

<div class="section">
  <div class="section-title">חבילת מנוי – הוראת קבע חודשית</div>
  ${['2gb','4gb','10gb'].map(id => `
  <div class="check-row">
    <span class="box ${rec.plan === id ? 'checked-box' : ''}">${rec.plan === id ? '✓' : ''}</span>
    <span>${PLAN_LABELS[id]}</span>
  </div>`).join('')}
  <div class="note-box">***שימוש חורג מהחבילה החודשית <u>לא</u> מאפשר צפייה מרחוק ו/או הקלטות***</div>
</div>

<div class="section">
  <div class="section-title">הקלטת קול</div>
  <div class="check-row">
    <span class="box ${rec.audio === 'none' ? 'checked-box' : ''}">${rec.audio === 'none' ? '✓' : ''}</span>
    <span><strong>ללא הקלטת קול</strong> – כל המצלמות ללא מיקרופון</span>
  </div>
  <div class="check-row">
    <span class="box ${rec.audio === 'with' ? 'checked-box' : ''}">${rec.audio === 'with' ? '✓' : ''}</span>
    <span><strong>עם הקלטת קול</strong> – הוספת מיקרופון לחלל הפנימי של הרכב <u>בעלות נוספת</u></span>
  </div>
</div>

${rec.bsd ? `
<div class="section">
  <div class="product-row">
    <span>✓ &nbsp;התקנת מסך BSD + 4 מצלמות</span>
    <span>₪4,500</span>
  </div>
</div>` : ''}

<div class="section">
  <div class="section-title">פרטי הלקוח</div>
  <div class="fields-grid">
    <div class="field-item"><div class="field-lbl">שם מלא של בעל הכרטיס</div><div class="field-val">${rec.fullName}</div></div>
    <div class="field-item"><div class="field-lbl">מספר ת"ז</div><div class="field-val">${rec.idNum}</div></div>
    <div class="field-item"><div class="field-lbl">כתובת מייל</div><div class="field-val">${rec.email}</div></div>
    <div class="field-item"><div class="field-lbl">מספר טלפון</div><div class="field-val">${rec.phone}</div></div>
    ${rec.contactName ? `<div class="field-item"><div class="field-lbl">איש קשר</div><div class="field-val">${rec.contactName}</div></div>` : ''}
    ${rec.company ? `<div class="field-item"><div class="field-lbl">שם חברה</div><div class="field-val">${rec.company}</div></div>` : ''}
    ${rec.bizNum ? `<div class="field-item"><div class="field-lbl">ע.מ / ח.פ</div><div class="field-val">${rec.bizNum}</div></div>` : ''}
  </div>
</div>

<div class="section">
  <div class="section-title">פרטי כלי הרכב</div>
  <div class="fields-grid">
    <div class="field-item"><div class="field-lbl">מספר רכב</div><div class="field-val">${rec.veh1}</div></div>
    <div class="field-item"><div class="field-lbl">סוג רכב</div><div class="field-val">${rec.veh1Type}</div></div>
    ${rec.veh2 ? `<div class="field-item"><div class="field-lbl">מספר רכב 2</div><div class="field-val">${rec.veh2}</div></div><div class="field-item"><div class="field-lbl">סוג רכב 2</div><div class="field-val">${rec.veh2Type}</div></div>` : ''}
  </div>
</div>

<div class="section">
  <div class="section-title">פרטי תשלום – הוראת קבע</div>
  <div class="security-note">🔒 פרטי כרטיס האשראי מעובדים ומוצגים בטופס זה בלבד ולא נשמרים בשום מסד נתונים.</div>
  <div class="fields-grid">
    <div class="field-item" style="grid-column:1/-1">
      <div class="field-lbl">מספר כרטיס אשראי</div>
      <div class="field-val" style="letter-spacing:3px;font-size:15px">${maskedCard}</div>
    </div>
    <div class="field-item"><div class="field-lbl">תוקף</div><div class="field-val">${rec.expiry}</div></div>
    <div class="field-item"><div class="field-lbl">CVV</div><div class="field-val">${cvv}</div></div>
  </div>
</div>

<div class="sig-area">
  <div style="flex:1;font-size:12px;color:#333;line-height:1.8">
    <strong>בברכה,</strong><br>
    <strong>קונטקט ליין</strong><br>
    שיווק ומכירות<br>
    <div style="margin-top:6px;font-size:11px;color:#888">Samsonix · info@samsonix.com · 03-5662259</div>
  </div>
  <div class="sig-block">
    <img src="${rec.sigDataUrl}" class="sig-img" alt="חתימה" />
    <div class="sig-caption">חתימת הלקוח: <strong>${rec.fullName}</strong></div>
    <div class="sig-caption">${today}</div>
  </div>
</div>

<div class="footer-box">
  St. Hametzuda 31, Azur, 5800174, Israel · טל: 03-5662259 · פקס: 5568999<br>
  Website: www.samsonix.com · Email: info@samsonix.com
</div>

<script>
  window.addEventListener('load', () => setTimeout(() => window.print(), 400));
<\/script>
</body></html>`);
  win.document.close();
}

// ── Main wizard ──
export function openSamsonixWizard(onSaved?: () => void) {
  const ov = document.createElement('div');
  ov.style.cssText = [
    'position:fixed;inset:0;z-index:99990',
    'background:linear-gradient(135deg,#0a0806 0%,#120f08 60%,#0d0a05 100%)',
    'display:flex;flex-direction:column;align-items:center',
    'font-family:system-ui,Arial,sans-serif;direction:rtl;overflow-y:auto',
  ].join(';');
  document.body.appendChild(ov);

  // In-memory state — credit card in memory ONLY
  const data = {
    plan: '4gb' as '2gb' | '4gb' | '10gb',
    audio: 'none' as 'none' | 'with',
    bsd: false,
    fullName: '', idNum: '', email: '', phone: '', contactName: '',
    company: '', bizNum: '',
    veh1: '', veh1Type: '', veh2: '', veh2Type: '',
    cardNum: '', expiry: '', cvv: '',
    sigDataUrl: '',
  };

  let step = 0;
  const TOTAL = 6;

  const GOLD = '#c9a84c';
  const GOLD20 = 'rgba(201,168,76,0.15)';
  const BORDER = 'rgba(201,168,76,0.25)';
  const BG2 = 'rgba(255,255,255,0.04)';

  function el(tag: string, css = '', text = '') {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text) e.textContent = text;
    return e;
  }
  function inp(placeholder: string, type = 'text', maxLen?: number): HTMLInputElement {
    const i = document.createElement('input');
    i.type = type;
    i.placeholder = placeholder;
    if (maxLen) i.maxLength = maxLen;
    i.style.cssText = [
      `background:${BG2};border:1px solid ${BORDER};border-radius:10px`,
      'padding:12px 14px;font-size:15px;color:#f5e6c8;width:100%;box-sizing:border-box',
      'outline:none;transition:border .2s',
    ].join(';');
    i.onfocus = () => { i.style.borderColor = GOLD; };
    i.onblur = () => { i.style.borderColor = BORDER; };
    return i;
  }
  function lbl(text: string, required = false): HTMLElement {
    const d = el('div', 'font-size:12px;color:#a08040;margin-bottom:4px;margin-top:12px;font-weight:600');
    d.textContent = text + (required ? ' *' : '');
    return d;
  }
  function rowEl(...children: HTMLElement[]): HTMLElement {
    const d = el('div', 'display:flex;gap:10px;width:100%');
    children.forEach(c => { c.style.flex = '1'; d.appendChild(c); });
    return d;
  }
  function primaryBtn(text: string): HTMLButtonElement {
    const b = document.createElement('button');
    b.textContent = text;
    b.style.cssText = [
      `background:linear-gradient(135deg,${GOLD},#8a6a20);color:#0a0806`,
      'border:none;border-radius:12px;padding:14px 28px;font-size:16px;font-weight:700',
      'cursor:pointer;width:100%;margin-top:18px;transition:opacity .2s',
    ].join(';');
    b.onmouseenter = () => { b.style.opacity = '.88'; };
    b.onmouseleave = () => { b.style.opacity = '1'; };
    return b;
  }
  function secBtn(text: string): HTMLButtonElement {
    const b = document.createElement('button');
    b.textContent = text;
    b.style.cssText = [
      'background:transparent;color:#a08040;border:1px solid #a08040;border-radius:12px',
      'padding:11px 22px;font-size:14px;cursor:pointer;margin-top:10px;width:100%;transition:background .2s',
    ].join(';');
    b.onmouseenter = () => { b.style.background = GOLD20; };
    b.onmouseleave = () => { b.style.background = 'transparent'; };
    return b;
  }

  const shell = el('div', 'width:100%;max-width:480px;padding:24px 20px 40px;box-sizing:border-box;min-height:100vh');
  ov.appendChild(shell);

  const progressWrap = el('div', 'display:flex;gap:6px;margin-bottom:28px;margin-top:16px');
  function updateProgress() {
    progressWrap.innerHTML = '';
    for (let i = 0; i < TOTAL; i++) {
      const dot = el('div', `flex:1;height:4px;border-radius:4px;transition:background .3s;background:${i <= step ? GOLD : 'rgba(201,168,76,0.2)'}`);
      progressWrap.appendChild(dot);
    }
  }

  const closeBtn = el('button', [
    'position:fixed;top:16px;left:16px;background:rgba(255,255,255,0.07)',
    'border:1px solid rgba(255,255,255,0.15);border-radius:50%;width:36px;height:36px',
    'color:#ccc;font-size:18px;cursor:pointer;z-index:99991;display:flex;align-items:center;justify-content:center',
  ].join(';'), '✕');
  closeBtn.onclick = () => { data.cardNum = ''; data.expiry = ''; data.cvv = ''; data.sigDataUrl = ''; ov.remove(); };
  ov.appendChild(closeBtn);

  const content = el('div', 'width:100%');
  shell.appendChild(progressWrap);
  shell.appendChild(content);

  function render() { content.innerHTML = ''; updateProgress(); [s0,s1,s2,s3,s4,s5][step](); }

  // ─── Step 0: Plan ───
  function s0() {
    content.appendChild(el('div', `font-size:22px;font-weight:800;color:${GOLD};margin-bottom:4px`, 'Samsonix DVR'));
    content.appendChild(el('div', 'font-size:14px;color:#a08040;margin-bottom:24px', 'בחר חבילת מנוי חודשי'));
    const PLANS = [
      { id: '2gb' as const, name: '2GB', price: '39 ₪', sub: 'מומלץ לעד 2 משתמשים · עד 1T', icon: '📡' },
      { id: '4gb' as const, name: '4GB', price: '49 ₪', sub: 'מומלץ לעד 4 משתמשים · עד 2T', icon: '📡' },
      { id: '10gb' as const, name: '10GB', price: '59 ₪', sub: 'מומלץ ל-5+ משתמשים · עד 4T', icon: '🛰' },
    ];
    PLANS.forEach(p => {
      const card = el('div', [
        `background:${data.plan === p.id ? GOLD20 : BG2}`,
        `border:2px solid ${data.plan === p.id ? GOLD : BORDER}`,
        'border-radius:14px;padding:16px 18px;margin-bottom:10px;cursor:pointer',
        'display:flex;align-items:center;gap:14px;transition:all .2s',
      ].join(';'));
      card.appendChild(el('div', 'font-size:28px', p.icon));
      const txt = el('div', 'flex:1');
      txt.appendChild(el('div', `font-size:17px;font-weight:700;color:#f5e6c8`, `${p.name} / חודש`));
      txt.appendChild(el('div', `font-size:13px;color:#a08040;margin-top:2px`, p.sub));
      const priceCol = el('div', 'display:flex;flex-direction:column;align-items:flex-end');
      priceCol.appendChild(el('div', `font-size:20px;font-weight:800;color:${GOLD}`, p.price));
      priceCol.appendChild(el('div', 'font-size:11px;color:#a08040', '+ מע"מ'));
      card.appendChild(txt);
      card.appendChild(priceCol);
      card.onclick = () => { data.plan = p.id; render(); };
      content.appendChild(card);
    });
    content.appendChild(el('div', 'font-size:11px;color:#6b5020;text-align:center;margin:12px 4px;line-height:1.6',
      '***שימוש חורג מהחבילה החודשית לא מאפשר צפייה מרחוק ו/או הקלטות***'));
    const next = primaryBtn('המשך ←');
    next.onclick = () => { step = 1; render(); };
    content.appendChild(next);
  }

  // ─── Step 1: Products ───
  function s1() {
    content.appendChild(el('div', `font-size:20px;font-weight:800;color:${GOLD};margin-bottom:4px`, 'אפשרויות נוספות'));
    content.appendChild(el('div', 'font-size:14px;color:#a08040;margin-bottom:20px', 'הקלטת קול ומוצרים'));
    content.appendChild(el('div', 'font-size:13px;color:#a08040;font-weight:600;margin-bottom:10px', 'הקלטת קול:'));
    [
      { id: 'none' as const, title: 'ללא הקלטת קול', sub: 'כל המצלמות ללא מיקרופון', icon: '🔇' },
      { id: 'with' as const, title: 'עם הקלטת קול', sub: 'מיקרופון לחלל הפנימי של הרכב (עלות נוספת)', icon: '🎙' },
    ].forEach(a => {
      const card = el('div', [
        `background:${data.audio === a.id ? GOLD20 : BG2}`,
        `border:2px solid ${data.audio === a.id ? GOLD : BORDER}`,
        'border-radius:12px;padding:14px 16px;margin-bottom:8px;cursor:pointer',
        'display:flex;align-items:center;gap:12px;transition:all .2s',
      ].join(';'));
      card.appendChild(el('div', 'font-size:22px', a.icon));
      const txt = el('div');
      txt.appendChild(el('div', 'font-size:15px;font-weight:600;color:#f5e6c8', a.title));
      txt.appendChild(el('div', 'font-size:12px;color:#a08040;margin-top:2px', a.sub));
      card.appendChild(txt);
      card.onclick = () => { data.audio = a.id; render(); };
      content.appendChild(card);
    });
    content.appendChild(el('div', 'font-size:13px;color:#a08040;font-weight:600;margin:18px 0 10px', 'מוצרים נוספים:'));
    const bsdCard = el('div', [
      `background:${data.bsd ? GOLD20 : BG2}`,
      `border:2px solid ${data.bsd ? GOLD : BORDER}`,
      'border-radius:12px;padding:14px 16px;cursor:pointer',
      'display:flex;align-items:center;gap:12px;transition:all .2s',
    ].join(';'));
    const chk = el('div', [
      `width:22px;height:22px;border-radius:6px;border:2px solid ${GOLD}`,
      `background:${data.bsd ? GOLD : 'transparent'}`,
      'display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .2s',
      `color:${data.bsd ? '#0a0806' : 'transparent'};font-weight:700`,
    ].join(';'), '✓');
    const bsdTxt = el('div', 'flex:1');
    bsdTxt.appendChild(el('div', 'font-size:15px;font-weight:600;color:#f5e6c8', 'התקנת מסך BSD + 4 מצלמות'));
    bsdTxt.appendChild(el('div', 'font-size:12px;color:#a08040;margin-top:2px', 'חבילת התקנה מלאה'));
    bsdCard.appendChild(chk);
    bsdCard.appendChild(bsdTxt);
    bsdCard.appendChild(el('div', `font-size:20px;font-weight:800;color:${GOLD}`, '₪4,500'));
    bsdCard.onclick = () => { data.bsd = !data.bsd; render(); };
    content.appendChild(bsdCard);
    const back = secBtn('← חזור');
    back.onclick = () => { step = 0; render(); };
    const next = primaryBtn('המשך ←');
    next.onclick = () => { step = 2; render(); };
    content.appendChild(next);
    content.appendChild(back);
  }

  // ─── Step 2: Personal ───
  function s2() {
    content.appendChild(el('div', `font-size:20px;font-weight:800;color:${GOLD};margin-bottom:4px`, 'פרטים אישיים'));
    content.appendChild(el('div', 'font-size:14px;color:#a08040;margin-bottom:20px', 'פרטי בעל הכרטיס ואיש הקשר'));
    const f = { fullName: inp('שם מלא *'), idNum: inp('מספר ת"ז *','number',9),
      email: inp('כתובת מייל *','email'), phone: inp('טלפון איש קשר *','tel'),
      contactName: inp('שם איש קשר (אם שונה)'), company: inp('שם חברה (לחשבונות)'),
      bizNum: inp('ע.מ / ח.פ (מספר עסק)') };
    f.fullName.value = data.fullName; f.idNum.value = data.idNum;
    f.email.value = data.email; f.phone.value = data.phone;
    f.contactName.value = data.contactName; f.company.value = data.company;
    f.bizNum.value = data.bizNum;
    [['שם מלא של בעל הכרטיס',true,'fullName'],['מספר ת"ז',true,'idNum'],
     ['כתובת מייל',true,'email'],['טלפון',true,'phone'],
     ['שם איש קשר',false,'contactName'],['שם חברה',false,'company'],
     ['מספר עסק (ע.מ/ח.פ)',false,'bizNum']
    ].forEach(([t,r,k]) => {
      content.appendChild(lbl(t as string, r as boolean));
      content.appendChild(f[k as keyof typeof f]);
    });
    const err = el('div', 'color:#ff5d73;font-size:13px;margin-top:8px;text-align:center');
    content.appendChild(err);
    const back = secBtn('← חזור'); back.onclick = () => { step = 1; render(); };
    const next = primaryBtn('המשך ←');
    next.onclick = () => {
      if (!f.fullName.value.trim() || !f.idNum.value.trim() || !f.email.value.trim() || !f.phone.value.trim()) {
        err.textContent = '⚠ אנא מלא את כל השדות החובה (*)'; return;
      }
      data.fullName = f.fullName.value.trim(); data.idNum = f.idNum.value.trim();
      data.email = f.email.value.trim(); data.phone = f.phone.value.trim();
      data.contactName = f.contactName.value.trim(); data.company = f.company.value.trim();
      data.bizNum = f.bizNum.value.trim();
      step = 3; render();
    };
    content.appendChild(next);
    content.appendChild(back);
  }

  // ─── Step 3: Vehicles ───
  function s3() {
    content.appendChild(el('div', `font-size:20px;font-weight:800;color:${GOLD};margin-bottom:4px`, 'פרטי כלי הרכב'));
    content.appendChild(el('div', 'font-size:14px;color:#a08040;margin-bottom:20px', 'לפחות כלי רכב אחד נדרש'));
    const veh1 = inp('מספר רכב 1 *'); veh1.value = data.veh1;
    const veh1Type = inp('סוג רכב 1 (אוטובוס / משאית / נגרר)'); veh1Type.value = data.veh1Type;
    const veh2 = inp('מספר רכב 2 (אופציונלי)'); veh2.value = data.veh2;
    const veh2Type = inp('סוג רכב 2'); veh2Type.value = data.veh2Type;
    content.appendChild(lbl('מספר רכב 1', true)); content.appendChild(veh1);
    content.appendChild(lbl('סוג רכב 1')); content.appendChild(veh1Type);
    content.appendChild(el('div', `height:1px;background:${BORDER};margin:18px 0`));
    content.appendChild(lbl('מספר רכב 2')); content.appendChild(veh2);
    content.appendChild(lbl('סוג רכב 2')); content.appendChild(veh2Type);
    const err = el('div', 'color:#ff5d73;font-size:13px;margin-top:8px;text-align:center');
    content.appendChild(err);
    const back = secBtn('← חזור'); back.onclick = () => { step = 2; render(); };
    const next = primaryBtn('המשך ←');
    next.onclick = () => {
      if (!veh1.value.trim()) { err.textContent = '⚠ נא להזין לפחות מספר רכב אחד'; return; }
      data.veh1 = veh1.value.trim(); data.veh1Type = veh1Type.value.trim();
      data.veh2 = veh2.value.trim(); data.veh2Type = veh2Type.value.trim();
      step = 4; render();
    };
    content.appendChild(next);
    content.appendChild(back);
  }

  // ─── Step 4: Payment ───
  function s4() {
    const badge = el('div', [
      'background:rgba(0,160,80,0.12);border:1px solid rgba(0,160,80,0.35)',
      'border-radius:10px;padding:10px 14px;margin-bottom:18px',
      'display:flex;align-items:center;gap:10px;font-size:12px;color:#4caf50;line-height:1.5',
    ].join(';'));
    badge.innerHTML = '<span style="font-size:20px">🔒</span><span>פרטי כרטיס האשראי מעובדים <strong>מקומית בלבד</strong>. אינם נשמרים בשום שרת. CVV לא נשמר גם לאחר ההדפסה.</span>';
    content.appendChild(badge);
    content.appendChild(el('div', `font-size:20px;font-weight:800;color:${GOLD};margin-bottom:4px`, 'פרטי תשלום'));
    content.appendChild(el('div', 'font-size:14px;color:#a08040;margin-bottom:20px', 'הוראת קבע חודשית'));
    const cardNum = inp('מספר כרטיס אשראי (16 ספרות) *', 'number', 16);
    cardNum.value = data.cardNum; cardNum.inputMode = 'numeric';
    const expiry = inp('תוקף (MM/YY) *'); expiry.value = data.expiry; expiry.maxLength = 5;
    expiry.oninput = () => { let v = expiry.value.replace(/\D/g,''); if (v.length >= 2) v = v.slice(0,2)+'/'+v.slice(2,4); expiry.value = v; };
    const cvv = inp('CVV (3 ספרות) *', 'password', 3); cvv.value = data.cvv; cvv.inputMode = 'numeric';
    content.appendChild(lbl('מספר כרטיס אשראי', true)); content.appendChild(cardNum);
    content.appendChild(lbl(''));
    const expiryWrap = el('div', 'flex:1'); expiryWrap.appendChild(lbl('תוקף', true)); expiryWrap.appendChild(expiry);
    const cvvWrap = el('div', 'flex:1'); cvvWrap.appendChild(lbl('CVV', true)); cvvWrap.appendChild(cvv);
    content.appendChild(rowEl(expiryWrap, cvvWrap));
    const err = el('div', 'color:#ff5d73;font-size:13px;margin-top:8px;text-align:center');
    content.appendChild(err);
    const back = secBtn('← חזור'); back.onclick = () => { step = 3; render(); };
    const next = primaryBtn('המשך לחתימה ←');
    next.onclick = () => {
      if (!cardNum.value.trim() || cardNum.value.replace(/\D/g,'').length < 16) { err.textContent = '⚠ נא להזין 16 ספרות של הכרטיס'; return; }
      if (!expiry.value.match(/^\d{2}\/\d{2}$/)) { err.textContent = '⚠ נא להזין תוקף בפורמט MM/YY'; return; }
      if (!cvv.value || cvv.value.replace(/\D/g,'').length < 3) { err.textContent = '⚠ נא להזין 3 ספרות CVV'; return; }
      data.cardNum = cardNum.value.trim(); data.expiry = expiry.value.trim(); data.cvv = cvv.value.trim();
      step = 5; render();
    };
    content.appendChild(next);
    content.appendChild(back);
  }

  // ─── Step 5: Signature + Save ───
  function s5() {
    content.appendChild(el('div', `font-size:20px;font-weight:800;color:${GOLD};margin-bottom:4px`, 'חתימה דיגיטלית'));
    content.appendChild(el('div', 'font-size:14px;color:#a08040;margin-bottom:20px', 'חתום בתיבה למטה לאישור ההזמנה'));

    const PLAN_SHORT: Record<string,string> = { '2gb':'2GB – 39₪/חודש', '4gb':'4GB – 49₪/חודש', '10gb':'10GB – 59₪/חודש' };
    const sumBox = el('div', `background:${BG2};border:1px solid ${BORDER};border-radius:12px;padding:14px 16px;margin-bottom:18px;font-size:13px;color:#c8a870;line-height:1.8`);
    const masked = data.cardNum ? `****-****-****-${data.cardNum.slice(-4)}` : '';
    sumBox.innerHTML = [
      `<strong style="color:${GOLD}">סיכום הזמנה</strong>`,
      `<div>חבילה: <strong>${PLAN_SHORT[data.plan]}</strong></div>`,
      `<div>קול: <strong>${data.audio === 'with' ? 'עם הקלטה + מיקרופון' : 'ללא הקלטת קול'}</strong></div>`,
      data.bsd ? `<div>BSD + 4 מצלמות: <strong>₪4,500</strong></div>` : '',
      `<div>לקוח: <strong>${data.fullName}</strong></div>`,
      `<div>כרטיס: <strong>${masked}</strong></div>`,
    ].filter(Boolean).join('');
    content.appendChild(sumBox);

    const canvasWrap = el('div', `background:#fff;border:2px solid ${GOLD};border-radius:12px;overflow:hidden;margin-bottom:8px`);
    const canvas = document.createElement('canvas');
    canvas.width = 440; canvas.height = 160;
    canvas.style.cssText = 'display:block;width:100%;height:160px;touch-action:none;cursor:crosshair';
    canvasWrap.appendChild(canvas);
    const ctx2d = canvas.getContext('2d')!;
    ctx2d.strokeStyle = '#1a1a2e'; ctx2d.lineWidth = 2.5; ctx2d.lineCap = 'round'; ctx2d.lineJoin = 'round';
    ctx2d.fillStyle = '#ccc'; ctx2d.font = '14px Arial'; ctx2d.textAlign = 'center';
    ctx2d.fillText('חתום כאן', canvas.width / 2, canvas.height / 2); ctx2d.textAlign = 'right';

    let drawing = false, hasSig = false;
    function getPos(e: MouseEvent | TouchEvent) {
      const r = canvas.getBoundingClientRect();
      const sx = canvas.width / r.width, sy = canvas.height / r.height;
      if ('touches' in e) return { x: (e.touches[0].clientX - r.left) * sx, y: (e.touches[0].clientY - r.top) * sy };
      return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
    }
    canvas.addEventListener('mousedown', e => { if (!hasSig) { ctx2d.clearRect(0,0,canvas.width,canvas.height); hasSig = true; } drawing = true; const p = getPos(e); ctx2d.beginPath(); ctx2d.moveTo(p.x, p.y); });
    canvas.addEventListener('mousemove', e => { if (!drawing) return; const p = getPos(e); ctx2d.lineTo(p.x, p.y); ctx2d.stroke(); });
    canvas.addEventListener('mouseup', () => { drawing = false; });
    canvas.addEventListener('mouseleave', () => { drawing = false; });
    canvas.addEventListener('touchstart', e => { e.preventDefault(); if (!hasSig) { ctx2d.clearRect(0,0,canvas.width,canvas.height); hasSig = true; } drawing = true; const p = getPos(e); ctx2d.beginPath(); ctx2d.moveTo(p.x, p.y); }, { passive: false });
    canvas.addEventListener('touchmove', e => { e.preventDefault(); if (!drawing) return; const p = getPos(e); ctx2d.lineTo(p.x, p.y); ctx2d.stroke(); }, { passive: false });
    canvas.addEventListener('touchend', () => { drawing = false; });

    const clearSigBtn = el('button', 'background:transparent;border:none;color:#a08040;font-size:12px;cursor:pointer;padding:4px 0;text-decoration:underline', 'נקה חתימה');
    (clearSigBtn as HTMLButtonElement).onclick = () => {
      ctx2d.clearRect(0,0,canvas.width,canvas.height);
      ctx2d.fillStyle = '#ccc'; ctx2d.font = '14px Arial'; ctx2d.textAlign = 'center';
      ctx2d.fillText('חתום כאן', canvas.width/2, canvas.height/2); ctx2d.textAlign = 'right';
      hasSig = false;
    };
    content.appendChild(canvasWrap);
    content.appendChild(clearSigBtn);

    const err = el('div', 'color:#ff5d73;font-size:13px;margin-top:8px;text-align:center');
    content.appendChild(err);

    const back = secBtn('← חזור'); back.onclick = () => { step = 4; render(); };
    const saveBtn = primaryBtn('💾 שמור + הדפס טופס');
    saveBtn.onclick = () => {
      if (!hasSig) { err.textContent = '⚠ נא לחתום בתיבה לפני השמירה'; return; }
      data.sigDataUrl = canvas.toDataURL('image/png');

      // Build record — CVV intentionally excluded
      const rec: SamsonixFormRecord = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
        savedAt: new Date().toISOString(),
        plan: data.plan, audio: data.audio, bsd: data.bsd,
        fullName: data.fullName, idNum: data.idNum, email: data.email,
        phone: data.phone, contactName: data.contactName, company: data.company,
        bizNum: data.bizNum, veh1: data.veh1, veh1Type: data.veh1Type,
        veh2: data.veh2, veh2Type: data.veh2Type,
        cardNum: data.cardNum, expiry: data.expiry,
        sigDataUrl: data.sigDataUrl,
      };
      saveFormRecord(rec);

      // Print with CVV (from memory, before clearing)
      printSamsonixForm(rec, data.cvv);

      // Clear sensitive in-memory data
      data.cardNum = ''; data.expiry = ''; data.cvv = ''; data.sigDataUrl = '';

      // Success screen
      content.innerHTML = '';
      const ok = el('div', 'text-align:center;padding:32px 16px');
      ok.appendChild(el('div', 'font-size:52px;margin-bottom:16px', '✅'));
      ok.appendChild(el('div', `font-size:22px;font-weight:800;color:${GOLD};margin-bottom:8px`, 'הטופס נשמר!'));
      ok.appendChild(el('div', `font-size:14px;color:#a08040;margin-bottom:24px;line-height:1.7`,
        `הטופס של ${rec.fullName} נשמר בהצלחה.\nחלון ההדפסה נפתח — שמור/הדפס כ-PDF.`));
      ok.appendChild(el('div', `font-size:12px;color:#6b5020;margin-bottom:28px`, '(CVV נמחק מהזיכרון — לא נשמר בשום מקום)'));
      const closeOk = primaryBtn('סגור');
      closeOk.onclick = () => { ov.remove(); onSaved?.(); };
      ok.appendChild(closeOk);
      content.appendChild(ok);
      updateProgress();
    };
    content.appendChild(saveBtn);
    content.appendChild(back);
  }

  render();
}
