// Trading Bridge — reads Poly-Market data from shared localStorage.
// Both apps run on the same GitHub Pages origin (atikshahar23-ctrl.github.io)
// so they share localStorage automatically.

export interface AlphaState {
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  confidence: number;
  longVotes: number;
  shortVotes: number;
  total: number;
  sources: string[];
  recentWinRate: number;
  masteryScore: number;
  updatedAt: string;
}

export interface BotStat {
  trades: number;
  wins: number;
  losses: number;
  netPnl: number;
  edge: number;
  lastAt: number;
}

export interface RiskGuard {
  paused: boolean;
  reason?: string;
  consecutiveLosses: number;
  dailyLossHalt: boolean;
}

export interface AutotraderSnapshot {
  alphaState: AlphaState | null;
  botStats: Record<string, BotStat>;
  riskGuard: Record<string, RiskGuard>;
  activeBots: string[];
  pausedBots: string[];
  totalTrades: number;
  totalPnl: number;
  fleetWinRate: number;
}

export interface PositionSummary {
  id: string;
  symbol: string;
  type: string;
  side: string;
  entry: number;
  qty: number;
  leverage?: number;
  openedAt: number;
  wallet: string;
}

export function readAutotraderState(): AutotraderSnapshot | null {
  try {
    const raw = localStorage.getItem('arb_scan_autotrader');
    if (!raw) return null;
    const data = JSON.parse(raw);
    const botStats: Record<string, BotStat> = data.botStats || {};
    const riskGuard: Record<string, RiskGuard> = data.riskGuard || {};
    const alphaState: AlphaState | null = data.alphaState || null;

    const activeBots = Object.entries(riskGuard).filter(([, g]) => !g.paused).map(([k]) => k);
    const pausedBots = Object.entries(riskGuard).filter(([, g]) => g.paused).map(([k]) => k);

    let totalTrades = 0, totalWins = 0, totalPnl = 0;
    for (const s of Object.values(botStats)) {
      totalTrades += s.trades || 0;
      totalWins += s.wins || 0;
      totalPnl += s.netPnl || 0;
    }
    const fleetWinRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;

    return { alphaState, botStats, riskGuard, activeBots, pausedBots, totalTrades, totalPnl, fleetWinRate };
  } catch { return null; }
}

export function readPortfolioPositions(): PositionSummary[] {
  const out: PositionSummary[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith('arb_scan_wallets_v2:')) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const data = JSON.parse(raw);
      const wallets: any[] = data.wallets ?? (Array.isArray(data) ? data : []);
      for (const w of wallets) {
        const wName = w.name || w.id || 'Default';
        for (const p of (w.positions || [])) {
          out.push({
            id: p.id || '',
            symbol: p.symbol || p.market || '?',
            type: p.type || 'binance',
            side: p.side || p.outcomeSide || 'LONG',
            entry: Number(p.entry ?? p.avgEntry ?? 0),
            qty: Number(p.qty ?? p.size ?? 1),
            leverage: p.leverage ? Number(p.leverage) : undefined,
            openedAt: Number(p.openedAt ?? p.entryTime ?? Date.now()),
            wallet: wName,
          });
        }
      }
    }
  } catch {}
  return out;
}

export function tradingContextForAI(): string {
  const at = readAutotraderState();
  const positions = readPortfolioPositions();
  if (!at && positions.length === 0) return '';

  const lines: string[] = ['=== Poly-Market Trading System (live data) ==='];
  if (at?.alphaState) {
    const s = at.alphaState;
    lines.push(`Alpha Signal: ${s.direction} | confidence ${s.confidence.toFixed(0)}% | mastery ${(s.masteryScore ?? 0).toFixed(1)}`);
    lines.push(`Votes: ${s.longVotes} LONG / ${s.shortVotes} SHORT (total ${s.total})`);
    lines.push(`Recent win rate: ${(s.recentWinRate * 100).toFixed(1)}%`);
    if (s.updatedAt) lines.push(`Signal at: ${new Date(s.updatedAt).toLocaleString('he-IL')}`);
  }
  if (at) {
    lines.push(`Bots: ${at.activeBots.length} active${at.pausedBots.length ? `, ${at.pausedBots.length} paused` : ''}`);
    lines.push(`Fleet: ${at.totalTrades} trades | win rate ${at.fleetWinRate.toFixed(1)}% | net P&L ${at.totalPnl >= 0 ? '+' : ''}${at.totalPnl.toFixed(2)}`);
    if (at.pausedBots.length) lines.push(`Paused: ${at.pausedBots.slice(0, 6).join(', ')}`);
  }
  if (positions.length) {
    lines.push(`Open positions (${positions.length}):`);
    positions.slice(0, 10).forEach(p => {
      const lev = p.leverage ? ` x${p.leverage}` : '';
      lines.push(`  • ${p.symbol} ${p.side}${lev} @ ${p.entry} [${p.type}] — ${p.wallet}`);
    });
    if (positions.length > 10) lines.push(`  ... +${positions.length - 10} more`);
  }
  return lines.join('\n');
}
