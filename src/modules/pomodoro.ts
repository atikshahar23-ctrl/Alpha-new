// ============================================================
// Pomodoro Timer — focus sessions with configurable work/break
// intervals. Tracks completed sessions per day in localStorage.
// ============================================================

const POMO_KEY = 'alpha_pomodoro_v1';

export interface PomoSession {
  date: string;
  focus: number;
  completed: number;
}

export function loadPomoHistory(): PomoSession[] {
  try { return JSON.parse(localStorage.getItem(POMO_KEY) || '[]'); } catch { return []; }
}

export function recordPomoSession() {
  const today = new Date().toISOString().slice(0, 10);
  const h = loadPomoHistory();
  const entry = h.find(s => s.date === today);
  if (entry) { entry.completed++; entry.focus += 25; }
  else h.push({ date: today, focus: 25, completed: 1 });
  localStorage.setItem(POMO_KEY, JSON.stringify(h));
}

export function todayPomoStats(): { completed: number; focusMin: number } {
  const today = new Date().toISOString().slice(0, 10);
  const entry = loadPomoHistory().find(s => s.date === today);
  return { completed: entry?.completed || 0, focusMin: entry?.focus || 0 };
}

export function weekPomoStats(): { totalSessions: number; totalFocus: number; streak: number } {
  const h = loadPomoHistory();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
  const week = h.filter(s => s.date >= weekAgo);
  const totalSessions = week.reduce((s, e) => s + e.completed, 0);
  const totalFocus = week.reduce((s, e) => s + e.focus, 0);

  let streak = 0;
  const d = new Date();
  const dateSet = new Set(h.map(s => s.date));
  while (dateSet.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }

  return { totalSessions, totalFocus, streak };
}
