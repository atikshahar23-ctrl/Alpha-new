// Time Tracker — log work sessions with project/category,
// view daily/weekly totals, and generate time reports.

export interface TimeEntry {
  id: string;
  project: string;
  description: string;
  startTime: number;
  endTime: number;
  duration: number; // minutes
  date: string;
}

export interface ActiveTimer {
  project: string;
  description: string;
  startTime: number;
}

const KEY = 'alpha_timetracker_v1';
const ACTIVE_KEY = 'alpha_timer_active';

export function loadTimeEntries(): TimeEntry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

function save(entries: TimeEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function getActiveTimer(): ActiveTimer | null {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function startTimer(project: string, description = ''): ActiveTimer {
  const timer: ActiveTimer = { project, description, startTime: Date.now() };
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(timer));
  return timer;
}

export function stopTimer(): TimeEntry | null {
  const timer = getActiveTimer();
  if (!timer) return null;

  const endTime = Date.now();
  const duration = Math.round((endTime - timer.startTime) / 60000);
  const entry: TimeEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    project: timer.project,
    description: timer.description,
    startTime: timer.startTime,
    endTime,
    duration,
    date: new Date().toISOString().slice(0, 10),
  };

  const entries = loadTimeEntries();
  entries.unshift(entry);
  save(entries);
  localStorage.removeItem(ACTIVE_KEY);
  return entry;
}

export function removeTimeEntry(id: string) {
  save(loadTimeEntries().filter(e => e.id !== id));
}

export function todayTime(): { total: number; byProject: { project: string; minutes: number }[] } {
  const today = new Date().toISOString().slice(0, 10);
  const entries = loadTimeEntries().filter(e => e.date === today);
  const total = entries.reduce((s, e) => s + e.duration, 0);
  const map = new Map<string, number>();
  for (const e of entries) map.set(e.project, (map.get(e.project) || 0) + e.duration);
  return {
    total,
    byProject: Array.from(map.entries())
      .map(([project, minutes]) => ({ project, minutes }))
      .sort((a, b) => b.minutes - a.minutes),
  };
}

export function weekTime(): { total: number; byDay: { date: string; minutes: number }[] } {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
  const entries = loadTimeEntries().filter(e => e.date >= weekAgo);
  const total = entries.reduce((s, e) => s + e.duration, 0);
  const map = new Map<string, number>();
  for (const e of entries) map.set(e.date, (map.get(e.date) || 0) + e.duration);
  return {
    total,
    byDay: Array.from(map.entries())
      .map(([date, minutes]) => ({ date, minutes }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function timeTrackerProjects(): string[] {
  const entries = loadTimeEntries();
  const projects = new Set(entries.map(e => e.project));
  return Array.from(projects);
}
