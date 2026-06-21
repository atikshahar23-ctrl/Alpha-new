// ============================================================
// Personal platform — habits, expenses, and a daily-briefing builder.
// Pure data layer over localStorage. Tasks / events / notes already
// live in assistant/state.ts; this adds the missing life-OS pieces.
// ============================================================

// ── Habits with streaks ─────────────────────────────────
export interface Habit {
  id: string;
  name: string;
  icon: string;          // emoji
  done: string[];        // ISO dates completed
  created: number;
}

const HABITS_KEY = 'alpha_habits_v1';

export function loadHabits(): Habit[] {
  try { return JSON.parse(localStorage.getItem(HABITS_KEY) || '[]'); } catch { return []; }
}
export function saveHabits(h: Habit[]) {
  localStorage.setItem(HABITS_KEY, JSON.stringify(h));
}
export function addHabit(name: string, icon = '✓'): Habit {
  const habit: Habit = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name, icon, done: [], created: Date.now(),
  };
  const habits = loadHabits();
  habits.push(habit);
  saveHabits(habits);
  return habit;
}
export function removeHabit(id: string) {
  saveHabits(loadHabits().filter(h => h.id !== id));
}
export function toggleHabitToday(id: string) {
  const today = new Date().toISOString().slice(0, 10);
  const habits = loadHabits();
  const h = habits.find(x => x.id === id);
  if (!h) return;
  h.done = h.done.includes(today) ? h.done.filter(d => d !== today) : [...h.done, today];
  saveHabits(habits);
}
export function isHabitDoneToday(h: Habit): boolean {
  return h.done.includes(new Date().toISOString().slice(0, 10));
}
// Consecutive-day streak ending today (or yesterday if today not yet done).
export function habitStreak(h: Habit): number {
  const set = new Set(h.done);
  let streak = 0;
  const d = new Date();
  // allow today to be pending without breaking the streak
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (set.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// ── Expenses ────────────────────────────────────────────
export interface Expense {
  id: string;
  label: string;
  amount: number;
  category: string;
  date: string;
}

const EXPENSE_KEY = 'alpha_expenses_v1';
export const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Fun', 'Other'];

export function loadExpenses(): Expense[] {
  try { return JSON.parse(localStorage.getItem(EXPENSE_KEY) || '[]'); } catch { return []; }
}
export function saveExpenses(e: Expense[]) {
  localStorage.setItem(EXPENSE_KEY, JSON.stringify(e));
}
export function addExpense(label: string, amount: number, category: string): Expense {
  const exp: Expense = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    label, amount, category, date: new Date().toISOString().slice(0, 10),
  };
  const list = loadExpenses();
  list.unshift(exp);
  saveExpenses(list);
  return exp;
}
export function removeExpense(id: string) {
  saveExpenses(loadExpenses().filter(e => e.id !== id));
}
export interface ExpenseSummary {
  monthTotal: number;
  byCategory: { category: string; total: number }[];
}
export function expenseSummary(): ExpenseSummary {
  const month = new Date().toISOString().slice(0, 7);
  const list = loadExpenses().filter(e => e.date.startsWith(month));
  const monthTotal = list.reduce((s, e) => s + e.amount, 0);
  const map: Record<string, number> = {};
  for (const e of list) map[e.category] = (map[e.category] || 0) + e.amount;
  const byCategory = Object.entries(map)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
  return { monthTotal, byCategory };
}
