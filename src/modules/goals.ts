// ============================================================
// Goals — quarterly/monthly/weekly goals with progress tracking.
// Each goal has milestones that can be ticked off.
// ============================================================

const GOALS_KEY = 'alpha_goals_v1';

export type GoalTimeframe = 'week' | 'month' | 'quarter' | 'year';

export interface Goal {
  id: string;
  title: string;
  timeframe: GoalTimeframe;
  category: 'business' | 'personal' | 'health' | 'creative' | 'financial';
  milestones: { text: string; done: boolean }[];
  created: string;
  deadline: string;
  notes: string;
}

export function loadGoals(): Goal[] {
  try { return JSON.parse(localStorage.getItem(GOALS_KEY) || '[]'); } catch { return []; }
}
export function saveGoals(g: Goal[]) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(g));
}
export function addGoal(
  title: string, timeframe: GoalTimeframe, category: Goal['category'],
  milestones: string[] = [], deadline = ''
): Goal {
  const goal: Goal = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title, timeframe, category,
    milestones: milestones.map(m => ({ text: m, done: false })),
    created: new Date().toISOString().slice(0, 10),
    deadline: deadline || '',
    notes: '',
  };
  const list = loadGoals();
  list.unshift(goal);
  saveGoals(list);
  return goal;
}
export function removeGoal(id: string) {
  saveGoals(loadGoals().filter(g => g.id !== id));
}
export function toggleMilestone(goalId: string, idx: number) {
  const list = loadGoals();
  const g = list.find(x => x.id === goalId);
  if (g && g.milestones[idx]) {
    g.milestones[idx].done = !g.milestones[idx].done;
    saveGoals(list);
  }
}
export function addMilestoneToGoal(goalId: string, text: string) {
  const list = loadGoals();
  const g = list.find(x => x.id === goalId);
  if (g) {
    g.milestones.push({ text, done: false });
    saveGoals(list);
  }
}
export function goalProgress(g: Goal): number {
  if (!g.milestones.length) return 0;
  return g.milestones.filter(m => m.done).length / g.milestones.length;
}
export function activeGoalsSummary(): { total: number; completed: number; avgProgress: number } {
  const goals = loadGoals();
  const total = goals.length;
  if (!total) return { total: 0, completed: 0, avgProgress: 0 };
  const completed = goals.filter(g => goalProgress(g) === 1).length;
  const avgProgress = goals.reduce((s, g) => s + goalProgress(g), 0) / total;
  return { total, completed, avgProgress: Math.round(avgProgress * 100) };
}
