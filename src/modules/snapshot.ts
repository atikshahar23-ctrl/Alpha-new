// ============================================================
// Live snapshot — a compact, current-state summary of the business
// and personal platforms, injected into the AI's context so replies
// are grounded in the user's real data (pipeline, tasks, day).
// Kept short and token-cheap; read fresh on every request.
// ============================================================
import { revenueStats, dueFollowUps, loadLeads } from './business';
import { loadHabits, isHabitDoneToday, expenseSummary } from './personal';
import { loadTasks, loadEvents } from '../assistant/state';

export function liveSnapshot(module: string): string {
  const parts: string[] = [];

  if (module === 'business') {
    try {
      const s = revenueStats();
      const due = dueFollowUps();
      const open = loadLeads().filter(l => l.status !== 'won' && l.status !== 'lost').length;
      parts.push(
        `BUSINESS STATE — realised ₪${s.realised.toLocaleString()}, ` +
        `pipeline ₪${s.pipeline.toLocaleString()}, win rate ${Math.round(s.winRate * 100)}%, ` +
        `${open} open leads, ${due.length} follow-up(s) due` +
        (due.length ? ` (${due.slice(0, 3).map(l => l.name || l.phone).join(', ')})` : '') + '.',
      );
    } catch {}
  }

  if (module === 'personal' || module === 'general') {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const ev = loadEvents().filter(e => e.date === today);
      const open = loadTasks().filter(t => !t.done);
      const habits = loadHabits();
      const hd = habits.filter(isHabitDoneToday).length;
      const exp = expenseSummary();
      const bits: string[] = [];
      if (ev.length) bits.push(`${ev.length} event(s) today (${ev.slice(0, 3).map(e => e.title).join(', ')})`);
      if (open.length) bits.push(`${open.length} open task(s) (${open.slice(0, 3).map(t => t.text).join(', ')})`);
      if (habits.length) bits.push(`habits ${hd}/${habits.length} done`);
      if (exp.monthTotal) bits.push(`₪${exp.monthTotal.toLocaleString()} spent this month`);
      if (bits.length) parts.push('PERSONAL STATE — ' + bits.join('; ') + '.');
    } catch {}
  }

  return parts.join('\n');
}
