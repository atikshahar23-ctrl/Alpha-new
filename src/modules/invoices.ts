// ============================================================
// Invoices — professional invoice generator.
// Creates printable/PDF-downloadable invoices from quotes.
// ============================================================

const INVOICE_KEY = 'alpha_invoices_v1';

export interface InvoiceItem {
  description: string;
  qty: number;
  price: number;
}

export interface Invoice {
  id: string;
  number: string;
  customer: string;
  phone: string;
  email: string;
  address: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  date: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes: string;
  created: number;
}

let nextInvoiceNum = 0;

export function loadInvoices(): Invoice[] {
  try { return JSON.parse(localStorage.getItem(INVOICE_KEY) || '[]'); } catch { return []; }
}
export function saveInvoices(list: Invoice[]) {
  localStorage.setItem(INVOICE_KEY, JSON.stringify(list));
}

function getNextNumber(): string {
  if (!nextInvoiceNum) {
    const existing = loadInvoices();
    nextInvoiceNum = existing.reduce((max, inv) => {
      const n = parseInt(inv.number.replace(/\D/g, ''));
      return n > max ? n : max;
    }, 0);
  }
  nextInvoiceNum++;
  return `INV-${String(nextInvoiceNum).padStart(4, '0')}`;
}

export function createInvoice(
  customer: string, items: InvoiceItem[],
  opts: { phone?: string; email?: string; address?: string; notes?: string; taxRate?: number; dueDate?: string } = {}
): Invoice {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const taxRate = opts.taxRate ?? 0.17;
  const tax = Math.round(subtotal * taxRate);
  const inv: Invoice = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    number: getNextNumber(),
    customer,
    phone: opts.phone || '',
    email: opts.email || '',
    address: opts.address || '',
    items,
    subtotal, tax, total: subtotal + tax,
    date: new Date().toISOString().slice(0, 10),
    dueDate: opts.dueDate || '',
    status: 'draft',
    notes: opts.notes || '',
    created: Date.now(),
  };
  const list = loadInvoices();
  list.unshift(inv);
  saveInvoices(list);
  return inv;
}

export function setInvoiceStatus(id: string, status: Invoice['status']) {
  const list = loadInvoices();
  const inv = list.find(i => i.id === id);
  if (inv) { inv.status = status; saveInvoices(list); }
}

export function removeInvoice(id: string) {
  saveInvoices(loadInvoices().filter(i => i.id !== id));
}

export function generateInvoiceHTML(inv: Invoice, businessName = 'HeavyGuard'): string {
  const rows = inv.items.map(i =>
    `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.description}</td>
     <td style="padding:8px;text-align:center;border-bottom:1px solid #eee">${i.qty}</td>
     <td style="padding:8px;text-align:right;border-bottom:1px solid #eee">₪${i.price.toLocaleString()}</td>
     <td style="padding:8px;text-align:right;border-bottom:1px solid #eee">₪${(i.price * i.qty).toLocaleString()}</td></tr>`
  ).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
body{font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#333}
h1{color:#daa520;font-size:28px;margin-bottom:4px}
.inv-header{display:flex;justify-content:space-between;margin-bottom:30px}
.inv-num{font-size:14px;color:#666}
.inv-meta{text-align:right}
table{width:100%;border-collapse:collapse;margin:20px 0}
th{background:#f8f6f0;padding:10px 8px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#666;border-bottom:2px solid #daa520}
.totals{text-align:right;margin-top:20px}
.totals .total{font-size:24px;color:#daa520;font-weight:bold}
.footer{margin-top:40px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#999}
@media print{body{padding:20px}}
</style></head><body>
<div class="inv-header">
  <div><h1>${businessName}</h1><div class="inv-num">${inv.number}</div></div>
  <div class="inv-meta"><div><strong>Date:</strong> ${inv.date}</div>
    ${inv.dueDate ? `<div><strong>Due:</strong> ${inv.dueDate}</div>` : ''}
    <div style="margin-top:8px;padding:4px 12px;background:${inv.status === 'paid' ? '#e8f5e9' : '#fff8e1'};border-radius:4px;display:inline-block;font-weight:600">${inv.status.toUpperCase()}</div>
  </div>
</div>
<div><strong>Bill to:</strong> ${inv.customer}${inv.phone ? ` · ${inv.phone}` : ''}${inv.email ? ` · ${inv.email}` : ''}</div>
${inv.address ? `<div>${inv.address}</div>` : ''}
<table><thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead><tbody>${rows}</tbody></table>
<div class="totals">
  <div>Subtotal: ₪${inv.subtotal.toLocaleString()}</div>
  <div>VAT (17%): ₪${inv.tax.toLocaleString()}</div>
  <div class="total">Total: ₪${inv.total.toLocaleString()}</div>
</div>
${inv.notes ? `<div style="margin-top:20px;padding:12px;background:#f8f6f0;border-radius:8px"><strong>Notes:</strong> ${inv.notes}</div>` : ''}
<div class="footer">Generated by Alpha Assistant · ${businessName}</div>
</body></html>`;
}

export function downloadInvoicePDF(inv: Invoice, businessName = 'HeavyGuard') {
  const html = generateInvoiceHTML(inv, businessName);
  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  }
}

export function generateInvoiceImage(inv: Invoice, businessName = 'HeavyGuard'): Promise<Blob> {
  return new Promise(resolve => {
    const W = 800;
    const GOLD = '#DAA520';
    const BG = '#FFFFFF';
    const TEXT = '#333333';
    const DIM = '#888888';
    const LINE = '#EEEEEE';
    const PAD = 40;

    // Estimate height: header + items + totals + footer
    const rowH = 32;
    const bodyH = 200 + inv.items.length * rowH + 160 + (inv.notes ? 60 : 0);
    const H = Math.max(500, bodyH);

    const canvas = document.createElement('canvas');
    canvas.width = W * 2; canvas.height = H * 2; // 2x for sharpness
    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // Gold top bar
    ctx.fillStyle = GOLD;
    ctx.fillRect(0, 0, W, 6);

    // Business name
    ctx.fillStyle = GOLD;
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText(businessName, PAD, PAD + 30);

    // Invoice number
    ctx.fillStyle = DIM;
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(inv.number, PAD, PAD + 50);

    // Date / status (right side)
    ctx.textAlign = 'right';
    ctx.fillStyle = TEXT;
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(`תאריך: ${inv.date}`, W - PAD, PAD + 30);
    if (inv.dueDate) ctx.fillText(`לתשלום: ${inv.dueDate}`, W - PAD, PAD + 48);

    // Status badge
    const statusColor = inv.status === 'paid' ? '#4CAF50' : inv.status === 'overdue' ? '#F44336' : '#FFC107';
    ctx.fillStyle = statusColor + '22';
    ctx.beginPath();
    ctx.roundRect(W - PAD - 80, PAD + 55, 80, 22, 4);
    ctx.fill();
    ctx.fillStyle = statusColor;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText(inv.status.toUpperCase(), W - PAD - 40, PAD + 70);
    ctx.textAlign = 'left';

    // Divider
    let y = PAD + 90;
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke();
    y += 16;

    // Customer
    ctx.fillStyle = DIM;
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('לקוח', PAD, y);
    y += 18;
    ctx.fillStyle = TEXT;
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(inv.customer, PAD, y);
    if (inv.phone) { ctx.fillStyle = DIM; ctx.font = '13px system-ui, sans-serif'; ctx.fillText(inv.phone, PAD + ctx.measureText(inv.customer).width + 12, y); }
    y += 24;

    // Table header
    ctx.fillStyle = '#F8F6F0';
    ctx.fillRect(PAD, y, W - PAD * 2, 30);
    ctx.fillStyle = DIM;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText('תיאור', PAD + 8, y + 20);
    ctx.textAlign = 'center';
    ctx.fillText('כמות', PAD + 420, y + 20);
    ctx.textAlign = 'right';
    ctx.fillText('מחיר', W - PAD - 120, y + 20);
    ctx.fillText('סה"כ', W - PAD - 8, y + 20);
    ctx.textAlign = 'left';

    // Gold underline on header
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(PAD, y + 30); ctx.lineTo(W - PAD, y + 30); ctx.stroke();
    y += 30;

    // Items
    ctx.font = '13px system-ui, sans-serif';
    for (const item of inv.items) {
      y += rowH;
      ctx.fillStyle = TEXT;
      ctx.fillText(item.description.slice(0, 40), PAD + 8, y);
      ctx.textAlign = 'center';
      ctx.fillText(String(item.qty), PAD + 420, y);
      ctx.textAlign = 'right';
      ctx.fillText(`₪${item.price.toLocaleString()}`, W - PAD - 120, y);
      ctx.fillText(`₪${(item.price * item.qty).toLocaleString()}`, W - PAD - 8, y);
      ctx.textAlign = 'left';
      ctx.strokeStyle = LINE; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(PAD, y + 8); ctx.lineTo(W - PAD, y + 8); ctx.stroke();
    }
    y += 24;

    // Totals
    ctx.textAlign = 'right';
    ctx.fillStyle = DIM; ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(`לפני מע"מ: ₪${inv.subtotal.toLocaleString()}`, W - PAD, y); y += 20;
    ctx.fillText(`מע"מ (17%): ₪${inv.tax.toLocaleString()}`, W - PAD, y); y += 24;

    ctx.strokeStyle = GOLD; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W - PAD - 200, y - 4); ctx.lineTo(W - PAD, y - 4); ctx.stroke();

    ctx.fillStyle = GOLD; ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText(`סה"כ לתשלום: ₪${inv.total.toLocaleString()}`, W - PAD, y + 18);
    ctx.textAlign = 'left';
    y += 40;

    // Notes
    if (inv.notes) {
      ctx.fillStyle = '#F8F6F0';
      ctx.fillRect(PAD, y, W - PAD * 2, 44);
      ctx.fillStyle = TEXT; ctx.font = '12px system-ui, sans-serif';
      ctx.fillText(inv.notes.slice(0, 90), PAD + 10, y + 26);
      y += 52;
    }

    // Footer
    y = H - 24;
    ctx.strokeStyle = LINE; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, y - 8); ctx.lineTo(W - PAD, y - 8); ctx.stroke();
    ctx.fillStyle = DIM; ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(`Generated by Alpha Assistant · ${businessName}`, PAD, y);

    canvas.toBlob(b => resolve(b!), 'image/png');
  });
}

export async function shareInvoiceWhatsApp(inv: Invoice, businessName = 'HeavyGuard') {
  const blob = await generateInvoiceImage(inv, businessName);
  const file = new File([blob], `${inv.number}.png`, { type: 'image/png' });
  const num = inv.phone.replace(/\D/g, '').replace(/^0/, '972');

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: `חשבונית ${inv.number}` });
  } else {
    // Fallback: download image + open WhatsApp
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${inv.number}.png`; a.click();
    URL.revokeObjectURL(url);
    if (num.length >= 10) window.open(`https://wa.me/${num}`, '_blank');
  }
}

export function invoiceStats(): { total: number; paid: number; outstanding: number; revenue: number } {
  const list = loadInvoices();
  const paid = list.filter(i => i.status === 'paid');
  const outstanding = list.filter(i => i.status !== 'paid' && i.status !== 'draft');
  return {
    total: list.length,
    paid: paid.length,
    outstanding: outstanding.length,
    revenue: paid.reduce((s, i) => s + i.total, 0),
  };
}
