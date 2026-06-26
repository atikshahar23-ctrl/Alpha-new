// ============================================================
// Puter cloud sync — bidirectional backup via puter.kv
// Puter supports Google sign-in and persists data per-user
// across all devices (phone, tablet, desktop).
// No setup required — just sign in with Google.
// ============================================================

const KV_PREFIX = 'alpha_sync_v1:';
const LAST_SYNC_KEY = 'alpha_puter_last_sync';
const DIRTY_KEY = 'alpha_data_dirty';
const SYNC_ROLE_KEY = 'alpha_sync_role'; // 'primary' | 'secondary' | 'auto'

// Mark local data as changed so smartSync knows to upload rather than download
export function markDirty() {
  localStorage.setItem(DIRTY_KEY, Date.now().toString());
}

const SYNC_TABLES = [
  'alpha_leads_v1',
  'alpha_habits_v1',
  'alpha_expenses_v1',
  'alpha_events',
  'alpha_tasks',
  'alpha_notes',
  // HeavyGuard — full dataset (everything is stored in localStorage).
  // Photos/galleries/videos use dynamic per-record keys and are synced
  // separately (see hg2 media handling in syncToCloud/syncFromCloud).
  'hg2:index',
  'hg2:quotes',
  'hg2:tasks',
  'hg2:customers',
  'hg2:pricelist',
  'hg2:quoteseq',
  'hg2:vehicle',
  'hg2:carstock',
  'hg2:suppliers',
  'hg2:invoices',
  'hg2:wanumber',
  'hg2:init',
  'hg2:lastbackup',
  'hg2:crm',
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
  'char_rot_v3',
  'alpha_main_character',
];

function puter(): any {
  return (window as any).puter;
}

// HeavyGuard stores photos/galleries/videos and per-invoice blobs under
// dynamic per-record keys (hg2:photo:<id>, hg2:gallery:<id>, hg2:video:<id>,
// hg2:inv:<id>). Collect them from localStorage so they can be synced too.
const HG_MEDIA_RE = /^hg2:(photo|gallery|video|inv):/;
function collectHgMediaKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && HG_MEDIA_RE.test(k)) keys.push(k);
  }
  return keys;
}
const HG_MEDIA_MANIFEST = '__hg_media__';

// Media (photos/galleries/videos) are far larger than puter.kv's ~400KB value
// limit, so they're stored in puter.fs (file storage) instead. One file per
// media key under this directory.
const FS_DIR = 'alpha_sync_media_v1';
function fsName(key: string): string { return key.replace(/[:/\\]/g, '_'); }

// Write one media value to puter.fs; falls back to kv for small values if fs
// is unavailable. Returns true on success.
async function putMedia(key: string, val: string): Promise<boolean> {
  const p = puter();
  if (p?.fs?.write) {
    try {
      await p.fs.write(`${FS_DIR}/${fsName(key)}`, val, { overwrite: true, createMissingParents: true });
      return true;
    } catch { /* fall through to kv */ }
  }
  try { await p.kv.set(KV_PREFIX + key, val); return true; } catch { return false; }
}

// Read one media value: try puter.fs first, then kv.
async function getMedia(key: string): Promise<string | null> {
  const p = puter();
  if (p?.fs?.read) {
    try {
      const blob = await p.fs.read(`${FS_DIR}/${fsName(key)}`);
      const text = typeof blob?.text === 'function' ? await blob.text() : String(blob ?? '');
      if (text) return text;
    } catch { /* fall through to kv */ }
  }
  try { const v = await p.kv.get(KV_PREFIX + key); return (v ?? null) as string | null; } catch { return null; }
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

    // HeavyGuard media (photos / galleries / videos / invoice blobs) — dynamic
    // per-record keys. Upload each, then store a manifest so download knows
    // which keys to fetch. Each is wrapped so one oversized photo doesn't abort.
    const mediaKeys = collectHgMediaKeys();
    let mediaDone = 0;
    for (const key of mediaKeys) {
      const val = localStorage.getItem(key);
      if (val !== null) {
        if (await putMedia(key, val)) mediaDone++;
      }
      if (onProgress && mediaDone % 3 === 0 && mediaKeys.length) {
        onProgress(`מעלה תמונות… ${Math.round(mediaDone / mediaKeys.length * 100)}%`);
      }
    }
    await puter().kv.set(KV_PREFIX + HG_MEDIA_MANIFEST, JSON.stringify(mediaKeys));

    const ts = new Date().toISOString();
    await puter().kv.set(KV_PREFIX + '__meta__', JSON.stringify({ ts, tables: tables.length, media: mediaDone }));
    localStorage.setItem(LAST_SYNC_KEY, ts);
    localStorage.removeItem(DIRTY_KEY);
    onProgress?.(`סנכרון הושלם ✓ (${mediaDone} תמונות)`);
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

    // HeavyGuard media — read the manifest, then download each photo/video.
    let mediaCount = 0;
    try {
      const manifestRaw = await puter().kv.get(KV_PREFIX + HG_MEDIA_MANIFEST);
      const mediaKeys: string[] = manifestRaw ? JSON.parse(manifestRaw) : [];
      for (const key of mediaKeys) {
        try {
          const val = await getMedia(key);
          if (val !== null && val !== undefined && val !== '') {
            localStorage.setItem(key, val);
            mediaCount++;
          }
        } catch { /* skip individual failures */ }
        if (onProgress && mediaCount % 3 === 0 && mediaKeys.length) {
          onProgress(`מוריד תמונות… ${Math.round(mediaCount / mediaKeys.length * 100)}%`);
        }
      }
    } catch { /* no media manifest yet */ }

    const ts = new Date().toISOString();
    localStorage.setItem(LAST_SYNC_KEY, ts);
    onProgress?.(`שוחזרו ${count} טבלאות + ${mediaCount} תמונות ✓`);
    return { ok: true, tables: count + mediaCount };
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

export function getSyncRole(): string {
  return localStorage.getItem(SYNC_ROLE_KEY) || 'auto';
}
export function setSyncRole(role: 'primary' | 'secondary' | 'auto') {
  localStorage.setItem(SYNC_ROLE_KEY, role);
}

// Smart startup sync: respects device role and dirty flag.
// primary (phone) → always upload, never overwrite local with cloud.
// secondary (computer/tablet) → always download from cloud.
// auto → compare timestamps, but prioritise dirty (unsaved local changes) over cloud.
export async function smartSync(onProgress?: (msg: string) => void): Promise<'downloaded' | 'uploaded' | 'none'> {
  if (!isPuterAvailable() || !isSignedIn()) return 'none';
  try {
    const role = getSyncRole();

    if (role === 'primary') {
      onProgress?.('מעלה נתונים לענן…');
      const r = await syncToCloud(onProgress);
      return r.ok ? 'uploaded' : 'none';
    }

    if (role === 'secondary') {
      onProgress?.('מוריד נתונים מהענן…');
      const r = await syncFromCloud(onProgress);
      return r.ok ? 'downloaded' : 'none';
    }

    // auto mode — dirty local changes always win over cloud
    const dirtyTs = localStorage.getItem(DIRTY_KEY);
    const localLastSync = localStorage.getItem(LAST_SYNC_KEY);
    const hasLocalChanges = dirtyTs && (!localLastSync || dirtyTs > localLastSync);

    if (hasLocalChanges) {
      onProgress?.('מעלה שינויים מקומיים לענן…');
      await syncToCloud(onProgress);
      return 'uploaded';
    }

    const cloudMeta = await getCloudMeta();
    if (cloudMeta && (!localLastSync || cloudMeta.ts > localLastSync)) {
      onProgress?.('מוריד נתונים חדשים מהענן…');
      await syncFromCloud(onProgress);
      return 'downloaded';
    } else {
      onProgress?.('מעלה נתונים לענן…');
      await syncToCloud(onProgress);
      return 'uploaded';
    }
  } catch { return 'none'; }
}
