// ============================================================
// Google Drive cloud sync — bidirectional backup of all
// localStorage tables to Google Drive as JSON files.
// Uses Google Identity Services (GIS) for OAuth + Drive REST API.
// Falls back to manual JSON export/import when not connected.
// ============================================================

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const FOLDER_NAME = 'Alpha Assistant Backup';
const TOKEN_KEY = 'alpha_gdrive_token';
const SYNC_TS_KEY = 'alpha_gdrive_last_sync';
const CLIENT_ID_KEY = 'alpha_gdrive_client_id';
// Set once the user has interactively granted Drive consent. As long as this
// is set (and their Google session is alive), we can silently mint a fresh
// access token without any popup — the fix for "synced at 13:04 then stopped":
// GIS access tokens expire after ~1h with no refresh token, so without silent
// re-auth the periodic sync just died an hour after sign-in.
const CONSENT_KEY = 'alpha_gdrive_consent';

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
  'hg2:customers',
  'hg2:pricelist',
  'hg2:quoteseq',
  'hg2:trips',
  'hg2:vehicle',
  'hg2:odometer',
  'hg2:projects',
  'hg2:carstock',
  'hg2:suppliers',
  'hg2:invoices',
  'hg2:wanumber',
  'hg2:init',
  'hg2:lastbackup',
  'hg2:crm_data',
  'hg2:profile',
  'hg2:samsonix',
  'alpha:social:drafts',
  'alpha_name',
  'char_rot_v3',
  'alpha_main_character',
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
  'alpha_samsonix_forms_v1',
];

interface DriveToken {
  access_token: string;
  expires_at: number;
}

let cachedToken: DriveToken | null = null;
let folderId: string | null = null;
let syncInProgress = false;

// Default OAuth client — the SAME Google Cloud project the CRM/agents app uses,
// so the whole platform authenticates through one Google account and one origin
// registration. Override per-device by entering a different ID in Settings.
// NOTE: for sign-in to succeed, the app's origin (e.g. the GitHub Pages URL and
// http://localhost:5173) must be listed under this client's "Authorized
// JavaScript origins" in the Google Cloud Console — otherwise Google returns
// "invalid_client / no registered origin".
const DEFAULT_CLIENT_ID = '243197444145-4go2os4nmvjadncma2c581tr535hl8lo.apps.googleusercontent.com';
export function getClientId(): string {
  return localStorage.getItem(CLIENT_ID_KEY) || DEFAULT_CLIENT_ID;
}
export function setClientId(id: string) {
  localStorage.setItem(CLIENT_ID_KEY, id.trim());
}

export function isConnected(): boolean {
  const t = getToken();
  return !!t && t.expires_at > Date.now();
}

export function lastSyncTime(): string {
  return localStorage.getItem(SYNC_TS_KEY) || '';
}

function getToken(): DriveToken | null {
  if (cachedToken && cachedToken.expires_at > Date.now()) return cachedToken;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    cachedToken = JSON.parse(raw);
    return cachedToken && cachedToken.expires_at > Date.now() ? cachedToken : null;
  } catch { return null; }
}

function saveToken(token: DriveToken) {
  cachedToken = token;
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
}

export function disconnect() {
  cachedToken = null;
  folderId = null;
  localStorage.removeItem(TOKEN_KEY);
}

function loadGIS(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.oauth2) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(s);
  });
}

// The GIS token client is created once and reused for both the interactive
// sign-in and every silent refresh. Its single callback resolves whichever
// request is currently pending.
let tokenClient: any = null;
let pendingResolve: ((v: boolean) => void) | null = null;

async function getTokenClient(): Promise<any> {
  const clientId = getClientId();
  if (!clientId) throw new Error('NO_CLIENT_ID');
  await loadGIS();
  const google = (window as any).google;
  if (!google?.accounts?.oauth2) throw new Error('GIS_LOAD_FAILED');
  if (!tokenClient) {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (resp: any) => {
        const r = pendingResolve; pendingResolve = null;
        if (resp.error || !resp.access_token) { r?.(false); return; }
        saveToken({
          access_token: resp.access_token,
          expires_at: Date.now() + (resp.expires_in || 3600) * 1000,
        });
        try { localStorage.setItem(CONSENT_KEY, '1'); } catch {}
        r?.(true);
      },
    });
  }
  return tokenClient;
}

// prompt '' = silent (no UI) — works only if consent was already granted and
// the Google session is alive; 'consent'/'' handled by GIS. A popup only
// appears for the interactive sign-in.
function requestToken(prompt: '' | 'consent'): Promise<boolean> {
  return new Promise((resolve) => {
    getTokenClient().then((client) => {
      // if a request is already pending, don't stomp it
      if (pendingResolve) { resolve(false); return; }
      pendingResolve = resolve;
      try { client.requestAccessToken({ prompt }); }
      catch { pendingResolve = null; resolve(false); }
    }).catch(() => resolve(false));
  });
}

export async function signIn(): Promise<boolean> {
  // interactive: shows the account/consent popup, then records consent so all
  // later refreshes can be silent.
  return requestToken('consent');
}

// Ensure we hold a usable access token, silently minting a fresh one when the
// current one is missing or within 2 min of expiry. Returns false only when an
// interactive sign-in is genuinely required (no prior consent, or the silent
// refresh was rejected because the Google session ended).
export async function ensureToken(): Promise<boolean> {
  const t = getToken();
  if (t && t.expires_at > Date.now() + 120_000) return true; // valid, with margin
  if (getClientId() && localStorage.getItem(CONSENT_KEY) === '1') {
    const ok = await requestToken('');
    if (ok) return true;
  }
  return !!getToken();
}

// True when a silent (re)connection is possible without user interaction —
// used to decide whether to auto-start the periodic sync at load.
export function canAutoConnect(): boolean {
  return !!getClientId() && (isConnected() || localStorage.getItem(CONSENT_KEY) === '1');
}

async function driveRequest(path: string, opts: RequestInit = {}): Promise<any> {
  const token = getToken();
  if (!token) throw new Error('NOT_AUTHENTICATED');
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token.access_token}`,
    ...(opts.headers as Record<string, string> || {}),
  };
  const res = await fetch(`https://www.googleapis.com/drive/v3${path}`, { ...opts, headers });
  if (!res.ok) {
    if (res.status === 401) { disconnect(); throw new Error('TOKEN_EXPIRED'); }
    throw new Error(`Drive API error: ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('json') ? res.json() : res.text();
}

async function ensureFolder(): Promise<string> {
  if (folderId) return folderId;
  const q = `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const list = await driveRequest(`/files?q=${encodeURIComponent(q)}&fields=files(id,name)&spaces=drive`);
  if (list.files && list.files.length > 0) {
    folderId = list.files[0].id;
    return folderId!;
  }
  const token = getToken()!;
  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
  });
  const folder = await res.json();
  folderId = folder.id;
  return folderId!;
}

async function findFile(name: string, parentId: string): Promise<string | null> {
  const q = `name='${name}' and '${parentId}' in parents and trashed=false`;
  const list = await driveRequest(`/files?q=${encodeURIComponent(q)}&fields=files(id)&spaces=drive`);
  return list.files?.[0]?.id || null;
}

async function uploadFile(name: string, content: string, parentId: string): Promise<void> {
  const existingId = await findFile(name, parentId);
  const token = getToken()!;
  if (existingId) {
    await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'Content-Type': 'application/json',
      },
      body: content,
    });
  } else {
    const metadata = { name, parents: [parentId], mimeType: 'application/json' };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: 'application/json' }));
    await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token.access_token}` },
      body: form,
    });
  }
}

async function downloadFile(fileId: string): Promise<string> {
  const token = getToken()!;
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { 'Authorization': `Bearer ${token.access_token}` },
  });
  return res.text();
}

export async function syncToCloud(onProgress?: (msg: string) => void): Promise<{ ok: boolean; error?: string }> {
  if (syncInProgress) return { ok: false, error: 'Sync already in progress' };
  syncInProgress = true;
  try {
    if (!(await ensureToken())) return { ok: false, error: 'Not connected to Google Drive' };
    const pid = await ensureFolder();
    onProgress?.('Uploading data…');

    const allData: Record<string, any> = {};
    for (const key of SYNC_TABLES) {
      const raw = localStorage.getItem(key);
      if (raw) allData[key] = raw;
    }
    const content = JSON.stringify({ version: 1, timestamp: Date.now(), data: allData }, null, 2);
    await uploadFile('alpha_backup.json', content, pid);

    localStorage.setItem(SYNC_TS_KEY, new Date().toISOString());
    onProgress?.('Sync complete ✓');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message || 'Unknown error' };
  } finally {
    syncInProgress = false;
  }
}

export async function syncFromCloud(onProgress?: (msg: string) => void): Promise<{ ok: boolean; error?: string; tables?: number }> {
  if (syncInProgress) return { ok: false, error: 'Sync already in progress' };
  syncInProgress = true;
  try {
    if (!(await ensureToken())) return { ok: false, error: 'Not connected to Google Drive' };
    const pid = await ensureFolder();
    onProgress?.('Downloading data…');

    const fileId = await findFile('alpha_backup.json', pid);
    if (!fileId) return { ok: false, error: 'No backup found on Google Drive' };

    const raw = await downloadFile(fileId);
    const backup = JSON.parse(raw);
    if (!backup.data) return { ok: false, error: 'Invalid backup format' };

    let count = 0;
    for (const [key, value] of Object.entries(backup.data)) {
      if (SYNC_TABLES.includes(key) && typeof value === 'string') {
        localStorage.setItem(key, value);
        count++;
      }
    }
    localStorage.setItem(SYNC_TS_KEY, new Date().toISOString());
    onProgress?.(`Restored ${count} tables ✓`);
    return { ok: true, tables: count };
  } catch (e: any) {
    return { ok: false, error: e.message || 'Unknown error' };
  } finally {
    syncInProgress = false;
  }
}

export function exportAllData(): string {
  const allData: Record<string, any> = {};
  for (const key of SYNC_TABLES) {
    const raw = localStorage.getItem(key);
    if (raw) allData[key] = raw;
  }
  return JSON.stringify({ version: 1, timestamp: Date.now(), data: allData }, null, 2);
}

export function importAllData(json: string): { ok: boolean; tables: number; error?: string } {
  try {
    const backup = JSON.parse(json);
    if (!backup.data) return { ok: false, tables: 0, error: 'Invalid format' };
    let count = 0;
    for (const [key, value] of Object.entries(backup.data)) {
      if (SYNC_TABLES.includes(key) && typeof value === 'string') {
        localStorage.setItem(key, value);
        count++;
      }
    }
    return { ok: true, tables: count };
  } catch (e: any) {
    return { ok: false, tables: 0, error: e.message };
  }
}

export function downloadAsFile() {
  const data = exportAllData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `alpha_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function uploadFromFile(): Promise<{ ok: boolean; tables: number; error?: string }> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) { resolve({ ok: false, tables: 0, error: 'No file selected' }); return; }
      const text = await file.text();
      resolve(importAllData(text));
    };
    input.click();
  });
}
