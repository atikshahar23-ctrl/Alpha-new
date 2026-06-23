// ============================================================
// Google Calendar bidirectional sync
// Uses Google Identity Services (same client_id as driveSync).
// Merges alpha_events + hg2:tasks with the user's Google Calendar.
// ============================================================
import { getClientId } from './driveSync';

const CAL_SCOPES = 'https://www.googleapis.com/auth/calendar';
const CAL_TOKEN_KEY = 'alpha_gcal_token';
const CAL_SYNC_KEY = 'alpha_gcal_last_sync';
const CAL_ID = 'primary';

interface CalToken { access_token: string; expires_at: number }
let calToken: CalToken | null = null;

// ── Token helpers ──

function getToken(): CalToken | null {
  if (calToken && calToken.expires_at > Date.now()) return calToken;
  try {
    const raw = localStorage.getItem(CAL_TOKEN_KEY);
    if (!raw) return null;
    calToken = JSON.parse(raw);
    return calToken && calToken.expires_at > Date.now() ? calToken : null;
  } catch { return null; }
}

function saveToken(t: CalToken) { calToken = t; localStorage.setItem(CAL_TOKEN_KEY, JSON.stringify(t)); }

export function isCalConnected(): boolean {
  const t = getToken(); return !!t && t.expires_at > Date.now();
}

export function calLastSync(): string { return localStorage.getItem(CAL_SYNC_KEY) || ''; }

export function calDisconnect() { calToken = null; localStorage.removeItem(CAL_TOKEN_KEY); }

// ── OAuth ──

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

export async function calSignIn(): Promise<boolean> {
  const clientId = getClientId();
  if (!clientId) throw new Error('NO_CLIENT_ID');
  await loadGIS();
  const google = (window as any).google;
  if (!google?.accounts?.oauth2) throw new Error('GIS_LOAD_FAILED');
  return new Promise((resolve) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: CAL_SCOPES,
      callback: (resp: any) => {
        if (resp.error) { resolve(false); return; }
        saveToken({ access_token: resp.access_token, expires_at: Date.now() + (resp.expires_in || 3600) * 1000 });
        resolve(true);
      },
    });
    client.requestAccessToken();
  });
}

// ── Google Calendar REST helpers ──

async function calReq(path: string, opts: RequestInit = {}): Promise<any> {
  const token = getToken();
  if (!token) throw new Error('NOT_AUTHENTICATED');
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token.access_token}`,
    ...(opts.headers as Record<string, string> || {}),
  };
  const base = 'https://www.googleapis.com/calendar/v3';
  const res = await fetch(`${base}${path}`, { ...opts, headers });
  if (!res.ok) {
    if (res.status === 401) { calDisconnect(); throw new Error('TOKEN_EXPIRED'); }
    throw new Error(`Calendar API error: ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('json') ? res.json() : res.text();
}

// Fetch events from Google Calendar (next 60 days + past 7 days)
async function fetchGoogleEvents(): Promise<{ id: string; summary: string; start: string; end?: string }[]> {
  const now = new Date();
  const from = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
  const to = new Date(now.getTime() + 60 * 24 * 3600 * 1000).toISOString();
  const qs = new URLSearchParams({
    timeMin: from,
    timeMax: to,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '500',
  }).toString();
  const data = await calReq(`/calendars/${encodeURIComponent(CAL_ID)}/events?${qs}`);
  return (data.items || []).map((item: any) => ({
    id: item.id,
    summary: item.summary || '',
    start: (item.start?.date || item.start?.dateTime || '').slice(0, 10),
    end: (item.end?.date || item.end?.dateTime || '').slice(0, 10),
  }));
}

// Create an event in Google Calendar
async function createGoogleEvent(title: string, date: string, time: string): Promise<string> {
  const start = time
    ? { dateTime: `${date}T${time}:00`, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
    : { date };
  const end = time
    ? { dateTime: `${date}T${String(parseInt(time.split(':')[0]) + 1).padStart(2, '0')}:${time.split(':')[1]}:00`, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
    : { date };
  const token = getToken()!;
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CAL_ID)}/events`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary: title, start, end }),
  });
  if (!res.ok) throw new Error(`Create event failed: ${res.status}`);
  const ev = await res.json();
  return ev.id;
}

// ── Bidirectional sync ──

export interface SyncResult {
  ok: boolean;
  pushed: number;
  pulled: number;
  error?: string;
}

export async function syncCalendar(onProgress?: (msg: string) => void): Promise<SyncResult> {
  if (!isCalConnected()) return { ok: false, pushed: 0, pulled: 0, error: 'Not connected to Google Calendar' };
  try {
    onProgress?.('Fetching Google Calendar events…');
    const gEvents = await fetchGoogleEvents();
    const gKeys = new Set(gEvents.map(e => (e.summary || '').toLowerCase() + '|' + e.start));

    // ── Push local → Google ──
    onProgress?.('Pushing local events to Google…');
    const localAlpha: { id: string; title: string; date: string; time: string }[] = [];
    try { localAlpha.push(...JSON.parse(localStorage.getItem('alpha_events') || '[]')); } catch {}

    const hgTasks: { id: string; title: string; date: string; done: boolean }[] = [];
    try { hgTasks.push(...JSON.parse(localStorage.getItem('hg2:tasks') || '[]')); } catch {}

    const toCreate: { title: string; date: string; time: string }[] = [];
    for (const ev of localAlpha) {
      if (!ev.date) continue;
      const key = ev.title.toLowerCase() + '|' + ev.date;
      if (!gKeys.has(key)) toCreate.push({ title: ev.title, date: ev.date, time: ev.time || '' });
    }
    for (const t of hgTasks) {
      if (!t.date || t.done) continue;
      const key = t.title.toLowerCase() + '|' + t.date;
      if (!gKeys.has(key)) toCreate.push({ title: t.title, date: t.date, time: '' });
    }

    let pushed = 0;
    for (const ev of toCreate) {
      try { await createGoogleEvent(ev.title, ev.date, ev.time); pushed++; } catch {}
    }

    // ── Pull Google → local ──
    onProgress?.('Pulling Google events into Alpha…');
    const existingAlpha: { id: string; title: string; date: string; time: string }[] = [];
    try { existingAlpha.push(...JSON.parse(localStorage.getItem('alpha_events') || '[]')); } catch {}
    const localKeys = new Set(existingAlpha.map(e => e.title.toLowerCase() + '|' + e.date));

    let pulled = 0;
    const now = new Date().toISOString().slice(0, 10);
    for (const gEv of gEvents) {
      if (!gEv.start || gEv.start < now) continue;
      const key = gEv.summary.toLowerCase() + '|' + gEv.start;
      if (!localKeys.has(key)) {
        existingAlpha.push({ id: Date.now() + '_gcal_' + gEv.id, title: gEv.summary, date: gEv.start, time: '' });
        localKeys.add(key);
        // Also sync to HeavyGuard
        try {
          const hg: any[] = JSON.parse(localStorage.getItem('hg2:tasks') || '[]');
          if (!hg.some((t: any) => t.title === gEv.summary && t.date === gEv.start)) {
            hg.unshift({ id: Date.now().toString(36) + '_gcal', title: gEv.summary, date: gEv.start, done: false, ts: Date.now() });
            localStorage.setItem('hg2:tasks', JSON.stringify(hg));
          }
        } catch {}
        pulled++;
      }
    }
    existingAlpha.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    localStorage.setItem('alpha_events', JSON.stringify(existingAlpha));
    localStorage.setItem(CAL_SYNC_KEY, new Date().toISOString());

    onProgress?.(`Sync complete: ↑${pushed} pushed, ↓${pulled} pulled`);
    return { ok: true, pushed, pulled };
  } catch (e: any) {
    return { ok: false, pushed: 0, pulled: 0, error: e.message || 'Unknown error' };
  }
}

// Generate a Google Calendar "add event" URL for one-click import
export function googleCalendarLink(title: string, date: string, time: string): string {
  const dt = time ? date.replace(/-/g, '') + 'T' + time.replace(':', '') + '00' : date.replace(/-/g, '');
  const end = time ? dt.slice(0, 9) + String(parseInt(dt.slice(9, 11)) + 1).padStart(2, '0') + dt.slice(11) : dt;
  return `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(title)}&dates=${dt}/${end}`;
}
