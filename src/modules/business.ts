// ============================================================
// Business platform — sales pipeline (CRM), quotes, revenue analytics.
// Pure data layer over localStorage. Interops with the existing
// HeavyGuard stores (hg2:index installations, hg2:quotes) so the
// assistant and the HeavyGuard OS see the same numbers.
// ============================================================

import { BOOKS_LAST_KEY, bookedIncome, cumulativeIncome } from './books';

export type LeadStatus = 'lead' | 'contacted' | 'quoted' | 'won' | 'lost';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  vehicle: string;      // e.g. "Scania R450"
  service: string;      // what they want installed
  value: number;        // estimated deal value (₪)
  status: LeadStatus;
  followUp: string;     // ISO date for next touch
  notes: string;
  created: number;
}

export interface Quote {
  id: string;
  customer: string;
  phone: string;
  items: { description: string; price: number; qty: number }[];
  total: number;
  date: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  ts: number;
}

const LEADS_KEY = 'alpha_leads_v1';

export const LEAD_STATUSES: { id: LeadStatus; label: string; hue: number }[] = [
  { id: 'lead', label: 'New Lead', hue: 200 },
  { id: 'contacted', label: 'Contacted', hue: 45 },
  { id: 'quoted', label: 'Quoted', hue: 38 },
  { id: 'won', label: 'Won', hue: 140 },
  { id: 'lost', label: 'Lost', hue: 0 },
];

export function statusLabel(s: LeadStatus): string {
  return LEAD_STATUSES.find(x => x.id === s)?.label || s;
}
export function statusHue(s: LeadStatus): number {
  return LEAD_STATUSES.find(x => x.id === s)?.hue ?? 200;
}

// ── Leads CRUD ──────────────────────────────────────────
export function loadLeads(): Lead[] {
  try { return JSON.parse(localStorage.getItem(LEADS_KEY) || '[]'); } catch { return []; }
}
export function saveLeads(l: Lead[]) {
  localStorage.setItem(LEADS_KEY, JSON.stringify(l));
}
export function addLead(p: Partial<Lead>): Lead {
  const lead: Lead = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: p.name || '', phone: p.phone || '', vehicle: p.vehicle || '',
    service: p.service || '', value: p.value || 0,
    status: p.status || 'lead', followUp: p.followUp || '',
    notes: p.notes || '', created: Date.now(),
  };
  const leads = loadLeads();
  leads.unshift(lead);
  saveLeads(leads);
  return lead;
}
export function updateLead(id: string, patch: Partial<Lead>) {
  const leads = loadLeads();
  const i = leads.findIndex(l => l.id === id);
  if (i >= 0) { leads[i] = { ...leads[i], ...patch }; saveLeads(leads); }
}
export function removeLead(id: string) {
  saveLeads(loadLeads().filter(l => l.id !== id));
}

// Advance a lead one step through the pipeline.
export function advanceLead(id: string) {
  const order: LeadStatus[] = ['lead', 'contacted', 'quoted', 'won'];
  const leads = loadLeads();
  const l = leads.find(x => x.id === id);
  if (!l) return;
  const idx = order.indexOf(l.status);
  l.status = idx < 0 || idx >= order.length - 1 ? 'won' : order[idx + 1];
  saveLeads(leads);
}

// ── Quotes (shared with HeavyGuard hg2:quotes) ──────────
export function loadQuotes(): Quote[] {
  try {
    const raw: any[] = JSON.parse(localStorage.getItem('hg2:quotes') || '[]');
    return raw.map(q => ({ status: 'draft', ...q })) as Quote[];
  } catch { return []; }
}
export function saveQuotes(q: Quote[]) {
  localStorage.setItem('hg2:quotes', JSON.stringify(q));
}
export function setQuoteStatus(id: string, status: Quote['status']) {
  const q = loadQuotes();
  const i = q.findIndex(x => x.id === id);
  if (i >= 0) { q[i].status = status; saveQuotes(q); }
}
export function removeQuote(id: string) {
  saveQuotes(loadQuotes().filter(q => q.id !== id));
}

// ── Revenue analytics ───────────────────────────────────
export interface RevenueStats {
  realised: number;        // won deals + completed installs + accepted quotes
  pipeline: number;        // value still in flight (lead/contacted/quoted)
  winRate: number;         // 0..1
  openLeads: number;
  byMonth: { month: string; total: number }[];   // last 6 months realised
}

export function revenueStats(): RevenueStats {
  const leads = loadLeads();
  const quotes = loadQuotes();
  let installs: any[] = [];
  try { installs = JSON.parse(localStorage.getItem('hg2:index') || '[]'); } catch {}

  const wonLeads = leads.filter(l => l.status === 'won');
  const lostLeads = leads.filter(l => l.status === 'lost');
  const openLeads = leads.filter(l => l.status === 'lead' || l.status === 'contacted' || l.status === 'quoted');
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted');

  // Realised income is anchored to the accountant's books (modules/books.ts):
  // months the bookkeeper closed use the exact booked figure; only activity
  // after the last statement adds on top, so the KPI matches the real books.
  const monthOf = (s: string | undefined) => String(s || '').slice(0, 7);
  const liveAfterBooks =
    wonLeads.reduce((s, l) => s + (monthOf(new Date(l.created).toISOString()) > BOOKS_LAST_KEY ? (l.value || 0) : 0), 0) +
    acceptedQuotes.reduce((s, q) => s + (monthOf(q.date) > BOOKS_LAST_KEY ? (q.total || 0) : 0), 0) +
    installs.reduce((s, r) => s + (monthOf(r.date) > BOOKS_LAST_KEY ? (r.price || 0) : 0), 0);
  const realised = cumulativeIncome(liveAfterBooks);

  const pipeline = openLeads.reduce((s, l) => s + (l.value || 0), 0);
  const decided = wonLeads.length + lostLeads.length;
  const winRate = decided ? wonLeads.length / decided : 0;

  // last 6 months realised, from installs (dated) + won leads (by created)
  const byMonth: { month: string; total: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    let total = 0;
    for (const r of installs) if ((r.date || '').startsWith(key)) total += r.price || 0;
    for (const l of wonLeads) if (new Date(l.created).toISOString().slice(0, 7) === key) total += l.value || 0;
    for (const q of acceptedQuotes) if ((q.date || '').startsWith(key)) total += q.total || 0;
    byMonth.push({ month: key, total: bookedIncome(key, total) });
  }

  return { realised, pipeline, winRate, openLeads: openLeads.length, byMonth };
}

// Leads needing a follow-up today or overdue.
export function dueFollowUps(): Lead[] {
  const today = new Date().toISOString().slice(0, 10);
  return loadLeads()
    .filter(l => l.followUp && l.followUp <= today && l.status !== 'won' && l.status !== 'lost')
    .sort((a, b) => a.followUp.localeCompare(b.followUp));
}
