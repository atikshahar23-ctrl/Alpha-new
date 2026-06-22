// Analytics module — provides trend data and summaries
// for business and personal metrics over time.

import { loadLeads, revenueStats } from './business';
import { loadExpenses } from './personal';
import { loadTasks, loadEvents } from '../assistant/state';
import { invoiceStats, loadInvoices } from './invoices';
import { loadContacts } from './contacts';

export interface TrendPoint { label: string; value: number }

export function revenueTrend(months = 6): TrendPoint[] {
  const leads = loadLeads();
  const now = new Date();
  const points: TrendPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString('en', { month: 'short' });
    const val = leads
      .filter(l => l.status === 'won' && new Date(l.created).toISOString().slice(0, 7) === key)
      .reduce((s, l) => s + (l.value || 0), 0);
    points.push({ label, value: val });
  }
  return points;
}

export function expenseTrend(months = 6): TrendPoint[] {
  const expenses = loadExpenses();
  const now = new Date();
  const points: TrendPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString('en', { month: 'short' });
    const val = expenses
      .filter(e => e.date?.startsWith(key))
      .reduce((s, e) => s + (e.amount || 0), 0);
    points.push({ label, value: val });
  }
  return points;
}

export function taskCompletionRate(): { total: number; done: number; rate: number } {
  const tasks = loadTasks();
  const done = tasks.filter(t => t.done).length;
  return { total: tasks.length, done, rate: tasks.length ? Math.round((done / tasks.length) * 100) : 0 };
}

export function expenseByCategory(): { category: string; total: number }[] {
  const expenses = loadExpenses();
  const map = new Map<string, number>();
  for (const e of expenses) {
    const cat = e.category || 'Other';
    map.set(cat, (map.get(cat) || 0) + (e.amount || 0));
  }
  return Array.from(map.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export function leadsByStatus(): { status: string; count: number }[] {
  const leads = loadLeads();
  const map = new Map<string, number>();
  for (const l of leads) {
    const s = l.status || 'new';
    map.set(s, (map.get(s) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}

export function dailyBriefing(): string {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const parts: string[] = [`${greeting}! Here's your daily briefing for ${today}:`];

  const events = loadEvents().filter(e => e.date === today);
  if (events.length) {
    parts.push(`📅 ${events.length} event(s) today: ${events.map(e => `${e.time || ''} ${e.title}`.trim()).join(', ')}`);
  } else {
    parts.push('📅 No events scheduled for today');
  }

  const tasks = loadTasks();
  const open = tasks.filter(t => !t.done);
  const highPri = open.filter(t => t.priority === 'high');
  if (open.length) {
    parts.push(`✓ ${open.length} open task(s)${highPri.length ? ` (${highPri.length} high priority)` : ''}`);
  }

  try {
    const rev = revenueStats();
    if (rev.pipeline > 0) parts.push(`💰 Pipeline: ₪${rev.pipeline.toLocaleString()}, Realised: ₪${rev.realised.toLocaleString()}`);
  } catch {}

  try {
    const inv = invoiceStats();
    if (inv.outstanding > 0) parts.push(`📄 ${inv.outstanding} unpaid invoice(s)`);
  } catch {}

  const leads = loadLeads();
  const followUps = leads.filter(l => l.followUp && l.followUp <= today && l.status !== 'won' && l.status !== 'lost');
  if (followUps.length) {
    parts.push(`📋 ${followUps.length} follow-up(s) due: ${followUps.slice(0, 3).map(l => l.name || l.phone).join(', ')}`);
  }

  try {
    const contacts = loadContacts();
    if (contacts.length) parts.push(`👥 ${contacts.length} contacts in CRM`);
  } catch {}

  const expenses = loadExpenses();
  const monthExpenses = expenses.filter(e => e.date?.startsWith(today.slice(0, 7)));
  if (monthExpenses.length) {
    const total = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    parts.push(`💸 ₪${total.toLocaleString()} spent this month (${monthExpenses.length} transactions)`);
  }

  return parts.join('\n');
}

export function weeklyReport(): string {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
  const parts: string[] = ['📊 WEEKLY REPORT'];

  const tasks = loadTasks();
  const completed = tasks.filter(t => t.done).length;
  parts.push(`Tasks: ${completed} completed, ${tasks.length - completed} remaining`);

  const leads = loadLeads();
  const weekAgoTs = new Date(weekAgo).getTime();
  const newLeads = leads.filter(l => l.created >= weekAgoTs).length;
  const won = leads.filter(l => l.status === 'won' && l.created >= weekAgoTs);
  const wonValue = won.reduce((s, l) => s + (l.value || 0), 0);
  parts.push(`Leads: ${newLeads} new, ${won.length} won (₪${wonValue.toLocaleString()})`);

  const inv = loadInvoices();
  const newInv = inv.filter(i => i.date && i.date >= weekAgo);
  if (newInv.length) {
    const total = newInv.reduce((s, i) => s + (i.total || 0), 0);
    parts.push(`Invoices: ${newInv.length} created (₪${total.toLocaleString()})`);
  }

  return parts.join('\n');
}
