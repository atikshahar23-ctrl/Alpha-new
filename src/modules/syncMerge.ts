// ============================================================
// Record-level merge for cloud sync (Drive + Puter).
//
// Both sync layers historically replaced whole tables with whichever side
// "won" (last writer / cloud-newer / device role). With two active devices
// that guarantees data loss: a device that hasn't seen the latest installs
// uploads its older hg2:index and the other device's records vanish from
// the cloud — the "ההתקנות לא עברו" / vanishing-install reports.
//
// mergeTable() instead unions two serialized tables record-by-record when
// both sides are JSON arrays of objects carrying an `id`, so a sync can
// only ADD records, never silently drop them. Tables that aren't id'd
// arrays (flags, scalars, strings, blobs) keep the old winner-takes-all
// behavior.
//
// Deletions are honored via hg2:tombstones — ids written by Heavy Guard
// when the user explicitly deletes an install (or resets the app) —
// otherwise a deleted record would resurrect from any stale copy on the
// next merge. The tombstone list itself is an id'd array, so it merges
// across devices by the same union rule.
// ============================================================

export const TOMBSTONE_KEY = 'hg2:tombstones';

type Rec = { id: string | number; startTs?: number };

function asIdArray(v: unknown): Rec[] | null {
  if (!Array.isArray(v)) return null;
  // An empty array still counts — a freshly-cleared device must merge as
  // "no records", not fall through to winner-takes-all and clobber the
  // other side's table with [].
  for (const x of v) {
    if (!x || typeof x !== 'object') return null;
    const id = (x as Rec).id;
    if (typeof id !== 'string' && typeof id !== 'number') return null;
  }
  return v as Rec[];
}

function parse(raw: string | null | undefined): unknown {
  if (raw == null || raw === '') return undefined;
  try { return JSON.parse(raw); } catch { return undefined; }
}

// Union of two id-keyed arrays: the winner's version is kept when the same
// id exists on both sides; loser-only records are appended. Sorted
// newest-first by startTs only when every record has one (installs do) —
// otherwise the original winner-then-loser order is preserved, since some
// tables' UIs rely on array order.
function unionById(winner: Rec[], loser: Rec[]): Rec[] {
  const seen = new Set(winner.map((r) => r.id));
  const merged = winner.concat(loser.filter((r) => !seen.has(r.id)));
  if (merged.length && merged.every((r) => Number(r?.startTs) > 0)) {
    return merged.slice().sort((a, b) => Number(b.startTs) - Number(a.startTs));
  }
  return merged;
}

function tombstoneIds(): Set<string | number> | null {
  try {
    const arr = JSON.parse(localStorage.getItem(TOMBSTONE_KEY) || '[]');
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const ids = arr
      .map((t: any) => (t && typeof t === 'object' ? t.id : t))
      .filter((x: any) => x != null);
    return ids.length ? new Set(ids) : null;
  } catch { return null; }
}

// Merge one table's local and incoming serialized values.
// preferIncoming decides who wins an id collision (and who wins outright
// for non-array tables): true on restore/download, false on upload.
// Returns the string to store/upload, or null when neither side has data.
export function mergeTable(
  key: string,
  localRaw: string | null,
  incomingRaw: string | null | undefined,
  preferIncoming: boolean,
): string | null {
  let out: string | null;
  const l = asIdArray(parse(localRaw));
  const c = asIdArray(parse(incomingRaw));
  if (l && c) {
    out = JSON.stringify(preferIncoming ? unionById(c, l) : unionById(l, c));
  } else if (incomingRaw == null || incomingRaw === '') {
    out = localRaw ?? null;
  } else if (localRaw == null || localRaw === '') {
    out = incomingRaw;
  } else {
    out = preferIncoming ? incomingRaw : localRaw;
  }
  // Deleted installs must stay deleted across merges, or any stale copy
  // resurrects them. Applies to hg2:index only — tombstone ids are install
  // ids and other tables' deletions are rare enough to accept resurrection.
  if (out && key === 'hg2:index') {
    const dead = tombstoneIds();
    if (dead) {
      const arr = parse(out);
      if (Array.isArray(arr)) out = JSON.stringify(arr.filter((r: any) => !dead.has(r?.id)));
    }
  }
  return out;
}

// Sync loops must process the tombstone table before hg2:index so that
// deletions made on the OTHER device (arriving in this very sync) are
// already in localStorage when the index merge filters against them.
export function tombstonesFirst(keys: readonly string[]): string[] {
  return [TOMBSTONE_KEY, ...keys.filter((k) => k !== TOMBSTONE_KEY)];
}
