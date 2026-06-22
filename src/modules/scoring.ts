// Performance Scoring — calculates a unified "Alpha Score" from
// all personal and business metrics. Gamifies productivity.

import { loadTasks } from '../assistant/state';
import { loadLeads, revenueStats } from './business';
import { loadHabits, isHabitDoneToday } from './personal';
import { todayPomoStats } from './pomodoro';
import { activeGoalsSummary } from './goals';
import { todayWater } from './wellness';
import { todayTime } from './timeTracker';

export interface ScoreBreakdown {
  total: number;
  tasks: number;
  habits: number;
  focus: number;
  business: number;
  goals: number;
  wellness: number;
  streak: number;
}

const STREAK_KEY = 'alpha_score_streak';

function getStreak(): { days: number; lastDate: string } {
  try {
    return JSON.parse(localStorage.getItem(STREAK_KEY) || '{"days":0,"lastDate":""}');
  } catch { return { days: 0, lastDate: '' }; }
}

function updateStreak(score: number): number {
  const today = new Date().toISOString().slice(0, 10);
  const streak = getStreak();
  if (streak.lastDate === today) return streak.days;
  if (score >= 40) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const days = streak.lastDate === yesterday ? streak.days + 1 : 1;
    localStorage.setItem(STREAK_KEY, JSON.stringify({ days, lastDate: today }));
    return days;
  }
  return streak.days;
}

export function calculateScore(): ScoreBreakdown {
  let tasks = 0, habits = 0, focus = 0, business = 0, goals = 0, wellness = 0;

  try {
    const allTasks = loadTasks();
    const done = allTasks.filter(t => t.done).length;
    const total = allTasks.length || 1;
    tasks = Math.min(Math.round((done / total) * 20), 20);
  } catch {}

  try {
    const allHabits = loadHabits();
    if (allHabits.length) {
      const doneToday = allHabits.filter(isHabitDoneToday).length;
      habits = Math.min(Math.round((doneToday / allHabits.length) * 15), 15);
    }
  } catch {}

  try {
    const pomo = todayPomoStats();
    focus = Math.min(pomo.completed * 5, 15);
    const tt = todayTime();
    if (tt.total >= 60) focus = Math.min(focus + 5, 15);
  } catch {}

  try {
    const rev = revenueStats();
    const leads = loadLeads();
    if (rev.realised > 0) business += 5;
    if (rev.pipeline > 0) business += 3;
    if (leads.some(l => l.status !== 'won' && l.status !== 'lost')) business += 2;
    const followedUp = leads.filter(l => l.followUp && l.followUp > new Date().toISOString().slice(0, 10));
    if (followedUp.length) business += 5;
    business = Math.min(business, 20);
  } catch {}

  try {
    const gs = activeGoalsSummary();
    goals = Math.min(Math.round(gs.avgProgress / 100 * 15), 15);
  } catch {}

  try {
    const water = todayWater();
    if (water >= 6) wellness += 5;
    else if (water >= 3) wellness += 3;
    wellness = Math.min(wellness, 15);
  } catch {}

  const subtotal = tasks + habits + focus + business + goals + wellness;
  const streak = updateStreak(subtotal);

  return {
    total: Math.min(subtotal + streak, 100),
    tasks,
    habits,
    focus,
    business,
    goals,
    wellness,
    streak,
  };
}

export function scoreLabel(score: number): string {
  if (score >= 90) return 'Legendary';
  if (score >= 75) return 'Elite';
  if (score >= 60) return 'Strong';
  if (score >= 40) return 'Growing';
  if (score >= 20) return 'Starting';
  return 'Warming up';
}

export function scoreColor(score: number): string {
  if (score >= 75) return '#4dff91';
  if (score >= 50) return '#daa520';
  if (score >= 25) return '#f0d090';
  return '#ff5d73';
}
