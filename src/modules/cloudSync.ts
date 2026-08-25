// ============================================================
// Cloud sync — Google Drive ONLY (Puter has been removed).
//
// This module presents the SAME API the app used to import from puterSync, but
// every call is backed by Google Drive (src/modules/driveSync). Swapping the
// app's `import * as puterSync from './puterSync'` to point here routes all
// existing sync call-sites through the owner's Google account with no other
// code changes. Login is exclusively Google (driveSync's GIS OAuth).
// ============================================================
import * as drive from './driveSync';

const SYNC_ROLE_KEY = 'alpha_sync_role';
let lastError: string | null = null;

// markDirty() was a Puter optimization (only upload changed tables). Drive
// uploads one consolidated backup file, so there's nothing to flag — no-op.
export function markDirty(): void {}

// Debounced auto-sync: coalesce bursts of edits into one Drive upload ~12s
// after the last change. No-ops immediately if Google isn't connected.
let syncTimer: any = null;
export function scheduleSync(onDone?: () => void, delayMs = 12000): void {
  if (!isSignedIn()) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    syncTimer = null;
    try { if (await drive.ensureToken()) { const r = await drive.syncToCloud(); if (!r.ok) lastError = r.error || null; else lastError = null; } } catch (e: any) { lastError = e?.message || 'sync failed'; }
    onDone?.();
  }, delayMs);
}

// "Available" in the Puter sense meant the SDK had loaded; Google Drive is
// always reachable, so these are trivially true.
export function isPuterAvailable(): boolean { return true; }
export function waitForPuter(_timeoutMs = 10_000): Promise<boolean> { return Promise.resolve(true); }

// Signed in = Google consent granted and a token is (silently) obtainable.
export function isSignedIn(): boolean { return drive.canAutoConnect(); }

export async function getUser(): Promise<{ username: string; email?: string } | null> {
  return drive.canAutoConnect() ? { username: 'Google Drive' } : null;
}

export async function signIn(): Promise<boolean> {
  const ok = await drive.signIn();
  if (!ok) lastError = 'Google sign-in failed';
  return ok;
}

export async function signOut(): Promise<void> { drive.disconnect(); }

export function lastSyncTime(): string { return drive.lastSyncTime(); }
export function getLastSyncError(): string | null { return lastError; }

export async function syncToCloud(onProgress?: (msg: string) => void): Promise<{ ok: boolean; error?: string }> {
  const r = await drive.syncToCloud(onProgress);
  lastError = r.ok ? null : (r.error || null);
  return r;
}

export async function syncFromCloud(onProgress?: (msg: string) => void): Promise<{ ok: boolean; tables?: number; error?: string }> {
  const r = await drive.syncFromCloud(onProgress);
  lastError = r.ok ? null : (r.error || null);
  return r;
}

export async function hasCloudBackup(): Promise<boolean> {
  // Best-effort: a real check needs a token; treat "connected with a prior
  // sync" as having a backup so the UI can offer restore.
  return drive.canAutoConnect() && !!drive.lastSyncTime();
}

export async function getCloudMeta(): Promise<{ ts: string; tables: number } | null> {
  const ts = drive.lastSyncTime();
  return ts ? { ts, tables: 0 } : null;
}

export function getSyncRole(): string { try { return localStorage.getItem(SYNC_ROLE_KEY) || 'auto'; } catch { return 'auto'; } }
export function setSyncRole(role: 'primary' | 'secondary' | 'auto'): void { try { localStorage.setItem(SYNC_ROLE_KEY, role); } catch {} }

// smartSync previously chose upload-vs-download from a dirty flag. With a
// single Drive backup file the safe default is: ensure a token, then upload the
// current local state. (First-run restore is handled by app.ts's boot path via
// syncFromCloud when canAutoConnect() is true.)
export async function smartSync(onProgress?: (msg: string) => void): Promise<'downloaded' | 'uploaded' | 'none'> {
  if (!(await drive.ensureToken())) return 'none';
  const r = await drive.syncToCloud(onProgress);
  return r.ok ? 'uploaded' : 'none';
}
