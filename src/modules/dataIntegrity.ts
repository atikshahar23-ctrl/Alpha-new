// Data Integrity — validates localStorage data stores and reports
// any corruption or inconsistencies. Runs on startup silently.

const STORES: { key: string; validator: (data: any) => boolean }[] = [
  { key: 'alpha_leads_v1', validator: (d) => Array.isArray(d) },
  { key: 'alpha_tasks', validator: (d) => Array.isArray(d) },
  { key: 'alpha_events', validator: (d) => Array.isArray(d) },
  { key: 'alpha_habits_v1', validator: (d) => Array.isArray(d) },
  { key: 'alpha_expenses_v1', validator: (d) => Array.isArray(d) },
  { key: 'alpha_goals_v1', validator: (d) => Array.isArray(d) },
  { key: 'alpha_invoices_v1', validator: (d) => Array.isArray(d) },
  { key: 'alpha_contacts_v1', validator: (d) => Array.isArray(d) },
  { key: 'alpha_smart_notes_v1', validator: (d) => Array.isArray(d) },
  { key: 'alpha_recurring_v1', validator: (d) => Array.isArray(d) },
  { key: 'alpha_timetracker_v1', validator: (d) => Array.isArray(d) },
  { key: 'alpha_pomodoro_v1', validator: (d) => Array.isArray(d) },
  { key: 'alpha_brain_memory_v1', validator: (d) => d && typeof d === 'object' && 'profile' in d },
  { key: 'alpha_chat_history_v1', validator: (d) => Array.isArray(d) },
  { key: 'alpha_sentiment_v1', validator: (d) => Array.isArray(d) },
];

export interface IntegrityReport {
  healthy: number;
  corrupted: string[];
  empty: string[];
  totalSize: number;
}

export function checkIntegrity(): IntegrityReport {
  let healthy = 0;
  const corrupted: string[] = [];
  const empty: string[] = [];
  let totalSize = 0;

  for (const store of STORES) {
    const raw = localStorage.getItem(store.key);
    if (!raw) {
      empty.push(store.key);
      continue;
    }
    totalSize += raw.length;
    try {
      const data = JSON.parse(raw);
      if (store.validator(data)) {
        healthy++;
      } else {
        corrupted.push(store.key);
      }
    } catch {
      corrupted.push(store.key);
    }
  }

  return { healthy, corrupted, empty, totalSize };
}

export function repairCorrupted(key: string): boolean {
  try {
    const store = STORES.find(s => s.key === key);
    if (!store) return false;
    const raw = localStorage.getItem(key);
    if (!raw) return true;
    try {
      const data = JSON.parse(raw);
      if (store.validator(data)) return true;
    } catch {}
    // If corrupted, back up and reset
    localStorage.setItem(key + '_backup_' + Date.now(), raw);
    if (key === 'alpha_brain_memory_v1') {
      localStorage.setItem(key, JSON.stringify({ profile: { name: '', role: '', business: '', location: '', preferences: [] }, facts: [], projects: [], summary: '', updated: Date.now() }));
    } else {
      localStorage.setItem(key, '[]');
    }
    return true;
  } catch { return false; }
}

export function storageUsage(): { used: number; available: number; percent: number } {
  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      used += key.length + (localStorage.getItem(key)?.length || 0);
    }
  }
  const available = 5 * 1024 * 1024; // typical 5MB limit
  return { used, available, percent: Math.round((used / available) * 100) };
}
