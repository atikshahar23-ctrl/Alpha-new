// ── The REAL books ─────────────────────────────────────────────────────
// Authoritative monthly income/expenses, copied verbatim from the owner's
// accountant software ("מצב העסק", screenshots provided 2026-07-02).
// Every revenue chart and cumulative-income figure across the apps (main
// dashboard HUD, business briefing, agents command center) must match
// these numbers exactly. Months AFTER the last accountant month (the one
// the bookkeeper hasn't closed yet) fall through to the live HeavyGuard
// install feed, so "now" keeps updating between statements.
// To refresh after the accountant enters a new month: add a row here.

export interface BooksRow { key: string; income: number; expenses: number | null }

export const ACCOUNTANT_BOOKS: BooksRow[] = [
  { key: '2025-09', income: 19420, expenses: 1204 },
  { key: '2025-10', income: 21760, expenses: 1548 },
  { key: '2025-11', income: 13240, expenses: 3908 },
  { key: '2025-12', income: 13000, expenses: 350 },
  { key: '2026-01', income: 16680, expenses: 12182 },
  { key: '2026-02', income: 10180, expenses: 5212 },
  { key: '2026-03', income: 20350, expenses: 5309 },
  { key: '2026-04', income: 6424, expenses: 7803 },
  { key: '2026-05', income: 42520, expenses: 3430 },
  { key: '2026-06', income: 36974, expenses: null }, // being filled now
];

export const BOOKS_BY_KEY: Record<string, BooksRow> =
  Object.fromEntries(ACCOUNTANT_BOOKS.map((r) => [r.key, r]));

export const BOOKS_LAST_KEY = ACCOUNTANT_BOOKS[ACCOUNTANT_BOOKS.length - 1].key;

export const BOOKS_TOTAL_INCOME = ACCOUNTANT_BOOKS.reduce((a, r) => a + r.income, 0);

/** Income for a given YYYY-MM: the books if covered; otherwise the caller's
 *  live figure, but only for months after the last accountant statement
 *  (earlier uncovered months are 0 — the books are complete history). */
export function bookedIncome(key: string, liveValue: number): number {
  const row = BOOKS_BY_KEY[key];
  if (row) return row.income;
  return key > BOOKS_LAST_KEY ? liveValue : 0;
}

/** Cumulative income: full books total + live income after the last
 *  statement, so the headline matches the accountant exactly and still
 *  ticks up as the current unclosed month accumulates installs. */
export function cumulativeIncome(liveAfterBooks: number): number {
  return BOOKS_TOTAL_INCOME + liveAfterBooks;
}
