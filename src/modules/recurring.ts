// Recurring tasks — automatic task generation based on
// user-defined schedules (daily, weekly, monthly).

import { loadTasks, addTask } from '../assistant/state';

export type RecurFreq = 'daily' | 'weekly' | 'monthly';

export interface RecurringTask {
  id: string;
  text: string;
  frequency: RecurFreq;
  priority: 'low' | 'med' | 'high';
  dayOfWeek?: number; // 0=Sun for weekly
  dayOfMonth?: number; // 1-31 for monthly
  lastGenerated: string;
  active: boolean;
}

const KEY = 'alpha_recurring_v1';

export function loadRecurring(): RecurringTask[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

function save(tasks: RecurringTask[]) {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}

export function addRecurring(text: string, frequency: RecurFreq, priority: 'low' | 'med' | 'high' = 'med'): RecurringTask {
  const tasks = loadRecurring();
  const task: RecurringTask = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text: text.trim(),
    frequency,
    priority,
    lastGenerated: '',
    active: true,
  };
  tasks.unshift(task);
  save(tasks);
  return task;
}

export function removeRecurring(id: string) {
  save(loadRecurring().filter(t => t.id !== id));
}

export function toggleRecurring(id: string) {
  const tasks = loadRecurring();
  const t = tasks.find(x => x.id === id);
  if (t) { t.active = !t.active; save(tasks); }
}

export function processRecurring(): number {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const tasks = loadRecurring();
  const existing = loadTasks();
  let generated = 0;

  for (const rt of tasks) {
    if (!rt.active || rt.lastGenerated === today) continue;

    let shouldGenerate = false;
    if (rt.frequency === 'daily') {
      shouldGenerate = true;
    } else if (rt.frequency === 'weekly') {
      shouldGenerate = rt.dayOfWeek != null ? now.getDay() === rt.dayOfWeek : now.getDay() === 0;
    } else if (rt.frequency === 'monthly') {
      shouldGenerate = rt.dayOfMonth != null ? now.getDate() === rt.dayOfMonth : now.getDate() === 1;
    }

    if (shouldGenerate) {
      const alreadyExists = existing.some(t => t.text === rt.text && t.created === today && !t.done);
      if (!alreadyExists) {
        addTask(rt.text, rt.priority);
        rt.lastGenerated = today;
        generated++;
      }
    }
  }

  if (generated) save(tasks);
  return generated;
}
