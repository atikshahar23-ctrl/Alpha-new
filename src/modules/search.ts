// ============================================================
// Universal Search — search across all data stores simultaneously.
// Returns ranked results from leads, tasks, events, habits,
// expenses, invoices, goals, notes, quotes, and memory.
// ============================================================

import { loadLeads } from './business';
import { loadHabits, loadExpenses } from './personal';
import { loadTasks, loadEvents, loadNotes } from '../assistant/state';
import { loadGoals } from './goals';
import { loadInvoices } from './invoices';

export interface SearchResult {
  type: 'lead' | 'task' | 'event' | 'habit' | 'expense' | 'invoice' | 'goal' | 'note' | 'quote';
  title: string;
  subtitle: string;
  score: number;
  data: any;
}

function matchScore(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t === q) return 10;
  if (t.startsWith(q)) return 8;
  if (t.includes(q)) return 5;
  const words = q.split(/\s+/);
  const matched = words.filter(w => t.includes(w)).length;
  return matched > 0 ? (matched / words.length) * 4 : 0;
}

export function universalSearch(query: string, limit = 20): SearchResult[] {
  if (!query.trim()) return [];
  const results: SearchResult[] = [];

  try {
    for (const l of loadLeads()) {
      const text = `${l.name} ${l.phone} ${l.vehicle} ${l.service} ${l.notes}`;
      const s = matchScore(text, query);
      if (s > 0) results.push({ type: 'lead', title: l.name || l.phone, subtitle: `${l.vehicle} · ${l.service} · ₪${l.value}`, score: s, data: l });
    }
  } catch {}

  try {
    for (const t of loadTasks()) {
      const s = matchScore(t.text, query);
      if (s > 0) results.push({ type: 'task', title: t.text, subtitle: `${t.priority} · ${t.done ? 'done' : 'open'}`, score: s, data: t });
    }
  } catch {}

  try {
    for (const e of loadEvents()) {
      const s = matchScore(e.title, query);
      if (s > 0) results.push({ type: 'event', title: e.title, subtitle: `${e.date} ${e.time || ''}`, score: s, data: e });
    }
  } catch {}

  try {
    for (const h of loadHabits()) {
      const s = matchScore(h.name, query);
      if (s > 0) results.push({ type: 'habit', title: h.name, subtitle: `${h.done.length} completions`, score: s, data: h });
    }
  } catch {}

  try {
    for (const e of loadExpenses()) {
      const s = matchScore(`${e.label} ${e.category}`, query);
      if (s > 0) results.push({ type: 'expense', title: e.label, subtitle: `₪${e.amount} · ${e.category} · ${e.date}`, score: s, data: e });
    }
  } catch {}

  try {
    for (const i of loadInvoices()) {
      const text = `${i.customer} ${i.number} ${i.notes}`;
      const s = matchScore(text, query);
      if (s > 0) results.push({ type: 'invoice', title: `${i.number} — ${i.customer}`, subtitle: `₪${i.total} · ${i.status}`, score: s, data: i });
    }
  } catch {}

  try {
    for (const g of loadGoals()) {
      const text = `${g.title} ${g.milestones.map(m => m.text).join(' ')}`;
      const s = matchScore(text, query);
      if (s > 0) results.push({ type: 'goal', title: g.title, subtitle: `${g.timeframe} · ${g.category}`, score: s, data: g });
    }
  } catch {}

  try {
    for (const n of loadNotes()) {
      const s = matchScore(n, query);
      if (s > 0) results.push({ type: 'note', title: n.slice(0, 80), subtitle: 'note', score: s, data: n });
    }
  } catch {}

  try {
    const quotes = JSON.parse(localStorage.getItem('hg2:quotes') || '[]');
    for (const q of quotes) {
      const text = `${q.customer || ''} ${(q.items || []).map((i: any) => i.description).join(' ')}`;
      const s = matchScore(text, query);
      if (s > 0) results.push({ type: 'quote', title: q.customer || 'Quote', subtitle: `₪${q.total || 0} · ${q.status || 'draft'}`, score: s, data: q });
    }
  } catch {}

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

export const TYPE_ICONS: Record<SearchResult['type'], string> = {
  lead: '👤', task: '✓', event: '📅', habit: '🔥', expense: '💰',
  invoice: '📄', goal: '🎯', note: '📝', quote: '💼',
};
