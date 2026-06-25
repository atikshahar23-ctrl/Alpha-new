// ============================================================
// Puter cloud sync — bidirectional backup via puter.kv
// Puter supports Google sign-in and persists data per-user
// across all devices (phone, tablet, desktop).
// No setup required — just sign in with Google.
// ============================================================

const KV_PREFIX = 'alpha_sync_v1:';
const LAST_SYNC_KEY = 'alpha_puter_last_sync';

const SYNC_TABLES = [
  'alpha_leads_v1',
  'alpha_habits_v1',
  'alpha_expenses_v1',
  'alpha_events',
  'alpha_tasks',
  'alpha_notes',
  'hg2:index',
  'hg2:quotes',
  'hg2:tasks',
  'alpha_brain_memory_v1',
  'alpha_pomodoro_v1',
  'alpha_mood_v1',
  'alpha_water_v1',
  'alpha_sleep_v1',
  'alpha_goals_v1',
  'alpha_invoices_v1',
  'alpha_contacts_v1',
  'alpha_smart_notes_v1',
  'alpha_recurring_v1',
  'alpha_timetracker_v1',
  'alpha_chat_history_v1',
  'alpha_sentiment_v1',
  'alpha_templates_v1',
  // user settings
  'alpha_name',
  'alpha_brain_memory_v1',
  // samsonix forms
  'alpha_samsonix_forms_v1',
];

function puter(): any {
  return (window as any).puter;
}

export function isPuterAvailable(): boolean {
  return typeof (window as any).puter !== 'undefined';
}

// Wait for the async puter.js script to finish loading (up to timeoutMs)
export function waitForPuter(timeoutMs = 10_000): Promise<boolean> {
  return new Promise(resolve => {
    if (isPuterAvailable()) { resolve(true); return; }
    const deadline = Date.now() + timeoutMs;
    const timer = setInterval(() => {
      if (isPuterAvailable()) { clearInterval(timer); resolve(true); }
      else if (Date.now() >= deadline) { clearInterval(timer); resolve(false); }
    }, 150);
  });
}

export function isSignedIn(): boolean {
  try { return puter()?.auth?.isSignedIn?.() ?? false; } catch { return false; }
}

export async function getUser(): Promise<{ username: string; email?: string } | null> {
  try { return await puter().auth.getUser(); } catch { return null; }
}

export async function signIn(): Promise<boolean> {
  try {
    await puter().auth.signIn();
    return isSignedIn();
  } catch { return false; }
}

export async function signOut(): Promise<void> {
  try { await puter().auth.signOut(); } catch {}
}

export function lastSyncTime(): string {
  return localStorage.getItem(LAST_SYNC_KEY) || '';
}

// Upload all localStorage tables to puter.kv
export async function syncToCloud(onProgress?: (msg: string) => void): Promise<{ ok: boolean; error?: string }> {
  if (!isPuterAvailable()) return { ok: false, error: 'Puter not available' };
  if (!isSignedIn()) return { ok: false, error: 'Not signed in' };
  try {
    const tables = [...new Set(SYNC_TABLES)]; // dedupe
    let i = 0;
    for (const key of tables) {
      const val = localStorage.getItem(key);
      if (val !== null) {
        await puter().kv.set(KV_PREFIX + key, val);
      }
      i++;
      if (onProgress && i % 5 === 0) onProgress(`מעלה נתונים… ${Math.round(i / tables.length * 100)}%`);
    }
    const ts = new Date().toISOString();
    await puter().kv.set(KV_PREFIX + '__meta__', JSON.stringify({ ts, tables: tables.length }));
    localStorage.setItem(LAST_SYNC_KEY, ts);
    onProgress?.('סנכרון הושלם ✓');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'שגיאת ענן' };
  }
}

// Download all tables from puter.kv and restore to localStorage
export async function syncFromCloud(onProgress?: (msg: string) => void): Promise<{ ok: boolean; tables?: number; error?: string }> {
  if (!isPuterAvailable()) return { ok: false, error: 'Puter not available' };
  if (!isSignedIn()) return { ok: false, error: 'Not signed in' };
  try {
    onProgress?.('מוריד נתונים…');
    const tables = [...new Set(SYNC_TABLES)];
    let count = 0;
    for (const key of tables) {
      const val = await puter().kv.get(KV_PREFIX + key);
      if (val !== null && val !== undefined && val !== '') {
        localStorage.setItem(key, val);
        count++;
      }
    }
    const ts = new Date().toISOString();
    localStorage.setItem(LAST_SYNC_KEY, ts);
    onProgress?.(`שוחזרו ${count} טבלאות ✓`);
    return { ok: true, tables: count };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'שגיאת ענן' };
  }
}

// Check if there's a backup in the cloud (for startup restore)
export async function hasCloudBackup(): Promise<boolean> {
  try {
    const meta = await puter().kv.get(KV_PREFIX + '__meta__');
    return !!meta;
  } catch { return false; }
}

// Get cloud metadata (timestamp of last cloud upload)
export async function getCloudMeta(): Promise<{ ts: string; tables: number } | null> {
  try {
    if (!isPuterAvailable() || !isSignedIn()) return null;
    const raw = await puter().kv.get(KV_PREFIX + '__meta__');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// Smart startup sync: compare cloud vs local timestamps, pull or push accordingly.
// Returns what action was taken.
export async function smartSync(onProgress?: (msg: string) => void): Promise<'downloaded' | 'uploaded' | 'none'> {
  if (!isPuterAvailable() || !isSignedIn()) return 'none';
  try {
    const cloudMeta = await getCloudMeta();
    const localLastSync = localStorage.getItem(LAST_SYNC_KEY);

    if (cloudMeta && (!localLastSync || cloudMeta.ts > localLastSync)) {
      // Cloud has newer data → download (phone changes will appear on this device)
      onProgress?.('מוריד נתונים חדשים מהענן…');
      await syncFromCloud(onProgress);
      return 'downloaded';
    } else {
      // Local is same or newer → upload this device's data to cloud
      onProgress?.('מעלה נתונים לענן…');
      await syncToCloud(onProgress);
      return 'uploaded';
    }
  } catch { return 'none'; }
}
