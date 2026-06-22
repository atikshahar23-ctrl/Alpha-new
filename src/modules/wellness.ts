// ============================================================
// Wellness — mood tracking, water intake, sleep log.
// Pure data layer over localStorage.
// ============================================================

const MOOD_KEY = 'alpha_mood_v1';
const WATER_KEY = 'alpha_water_v1';
const SLEEP_KEY = 'alpha_sleep_v1';

export type Mood = 'great' | 'good' | 'okay' | 'low' | 'bad';
export const MOOD_EMOJI: Record<Mood, string> = { great: '🤩', good: '😊', okay: '😐', low: '😔', bad: '😞' };
export const MOODS: Mood[] = ['great', 'good', 'okay', 'low', 'bad'];

export interface MoodEntry { date: string; mood: Mood; note: string; energy: number }

export function loadMoods(): MoodEntry[] {
  try { return JSON.parse(localStorage.getItem(MOOD_KEY) || '[]'); } catch { return []; }
}
export function logMood(mood: Mood, note = '', energy = 3) {
  const list = loadMoods();
  const today = new Date().toISOString().slice(0, 10);
  const existing = list.findIndex(m => m.date === today);
  if (existing >= 0) list[existing] = { date: today, mood, note, energy };
  else list.unshift({ date: today, mood, note, energy });
  localStorage.setItem(MOOD_KEY, JSON.stringify(list));
}
export function todayMood(): MoodEntry | null {
  const today = new Date().toISOString().slice(0, 10);
  return loadMoods().find(m => m.date === today) || null;
}
export function moodStreak(): { days: number; avg: number } {
  const list = loadMoods();
  const vals: Record<Mood, number> = { great: 5, good: 4, okay: 3, low: 2, bad: 1 };
  const week = list.slice(0, 7);
  const avg = week.length ? week.reduce((s, m) => s + vals[m.mood], 0) / week.length : 0;
  return { days: list.length, avg: Math.round(avg * 10) / 10 };
}

// Water intake
export function todayWater(): number {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const data = JSON.parse(localStorage.getItem(WATER_KEY) || '{}');
    return data[today] || 0;
  } catch { return 0; }
}
export function addWater(glasses = 1) {
  const today = new Date().toISOString().slice(0, 10);
  let data: Record<string, number> = {};
  try { data = JSON.parse(localStorage.getItem(WATER_KEY) || '{}'); } catch {}
  data[today] = (data[today] || 0) + glasses;
  localStorage.setItem(WATER_KEY, JSON.stringify(data));
  return data[today];
}

// Sleep
export interface SleepEntry { date: string; hours: number; quality: number }
export function loadSleep(): SleepEntry[] {
  try { return JSON.parse(localStorage.getItem(SLEEP_KEY) || '[]'); } catch { return []; }
}
export function logSleep(hours: number, quality: number) {
  const list = loadSleep();
  const today = new Date().toISOString().slice(0, 10);
  const existing = list.findIndex(s => s.date === today);
  if (existing >= 0) list[existing] = { date: today, hours, quality };
  else list.unshift({ date: today, hours, quality });
  localStorage.setItem(SLEEP_KEY, JSON.stringify(list));
}
export function sleepAvg(): { hours: number; quality: number } {
  const week = loadSleep().slice(0, 7);
  if (!week.length) return { hours: 0, quality: 0 };
  return {
    hours: Math.round(week.reduce((s, e) => s + e.hours, 0) / week.length * 10) / 10,
    quality: Math.round(week.reduce((s, e) => s + e.quality, 0) / week.length * 10) / 10,
  };
}
