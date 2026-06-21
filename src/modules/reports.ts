// Reports — generate formatted text/HTML reports
// for business performance, personal progress, and combined summaries.

import { revenueStats, loadLeads, dueFollowUps } from './business';
import { loadTasks } from '../assistant/state';
import { invoiceStats } from './invoices';
import { expenseSummary } from './personal';
import { activeGoalsSummary } from './goals';
import { todayPomoStats, weekPomoStats } from './pomodoro';
import { contactStats } from './contacts';
import { todayTime, weekTime, formatDuration } from './timeTracker';

export function businessReport(): string {
  const rev = revenueStats();
  const leads = loadLeads();
  const followUps = dueFollowUps();
  const inv = invoiceStats();
  const contacts = contactStats();

  return `
BUSINESS PERFORMANCE REPORT
Generated: ${new Date().toLocaleString()}
${'═'.repeat(40)}

REVENUE
  Realised:    ₪${rev.realised.toLocaleString()}
  Pipeline:    ₪${rev.pipeline.toLocaleString()}
  Win Rate:    ${Math.round(rev.winRate * 100)}%

LEADS
  Total:       ${leads.length}
  Open:        ${rev.openLeads}
  Follow-ups:  ${followUps.length} due

INVOICES
  Total:       ${inv.total}
  Paid:        ${inv.paid}
  Outstanding: ${inv.outstanding}
  Collected:   ₪${inv.revenue.toLocaleString()}

CONTACTS
  Total:       ${contacts.total}
  Starred:     ${contacts.starred}

MONTHLY REVENUE (Last 6 Months)
${rev.byMonth.map(m => `  ${m.month}: ₪${m.total.toLocaleString()}`).join('\n')}
`.trim();
}

export function personalReport(): string {
  const tasks = loadTasks();
  const open = tasks.filter(t => !t.done).length;
  const done = tasks.filter(t => t.done).length;
  const goals = activeGoalsSummary();
  const pomo = weekPomoStats();
  const pomoToday = todayPomoStats();
  const exp = expenseSummary();
  const tt = todayTime();
  const tw = weekTime();

  return `
PERSONAL PROGRESS REPORT
Generated: ${new Date().toLocaleString()}
${'═'.repeat(40)}

TASKS
  Open:        ${open}
  Completed:   ${done}
  Rate:        ${tasks.length ? Math.round((done / tasks.length) * 100) : 0}%

GOALS
  Active:      ${goals.total}
  Completed:   ${goals.completed}
  Avg Progress:${goals.avgProgress}%

FOCUS
  Today:       ${pomoToday.completed} sessions (${pomoToday.focusMin}min)
  This Week:   ${pomo.totalSessions} sessions
  Streak:      ${pomo.streak} days

TIME TRACKED
  Today:       ${formatDuration(tt.total)}
  This Week:   ${formatDuration(tw.total)}

EXPENSES
  This Month:  ₪${exp.monthTotal.toLocaleString()}
${exp.byCategory.map(c => `  ${c.category}: ₪${c.total.toLocaleString()}`).join('\n')}
`.trim();
}

export function downloadReport(type: 'business' | 'personal' | 'full') {
  let content: string;
  if (type === 'business') content = businessReport();
  else if (type === 'personal') content = personalReport();
  else content = businessReport() + '\n\n' + personalReport();

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `alpha_${type}_report_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
