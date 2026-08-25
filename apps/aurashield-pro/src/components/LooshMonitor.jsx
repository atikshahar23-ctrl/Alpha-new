import { memo, useMemo } from 'react';
import Panel from './Panel';
import { COHERENCE } from '../lib/constants';
import { formatClock } from '../lib/utils';

const LEVEL = {
  nominal: { color: '#39ff14', word: 'Nominal', status: 'ok' },
  degraded: { color: '#ffb000', word: 'Degraded', status: 'warn' },
  warning: { color: '#ffb000', word: 'Compromised', status: 'warn' },
  critical: { color: '#ff2d55', word: 'Critical', status: 'crit' },
};

function Sparkline({ history, color }) {
  const path = useMemo(() => {
    const w = 300;
    const h = 56;
    const step = w / (history.length - 1);
    return history
      .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i * step).toFixed(1)} ${(h - (v / 100) * h).toFixed(1)}`)
      .join(' ');
  }, [history]);

  const area = `${path} L 300 56 L 0 56 Z`;

  return (
    <svg viewBox="0 0 300 56" preserveAspectRatio="none" className="h-14 w-full">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {[COHERENCE.NOMINAL, COHERENCE.DEGRADED, COHERENCE.CRITICAL].map((t) => (
        <line
          key={t}
          x1="0"
          y1={56 - (t / 100) * 56}
          x2="300"
          y2={56 - (t / 100) * 56}
          stroke="#39ff14"
          strokeOpacity="0.13"
          strokeWidth="0.5"
          strokeDasharray="3 4"
        />
      ))}

      <path d={area} fill="url(#spark-fill)" />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        vectorEffect="non-scaling-stroke"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}

function LooshMonitor({ sim, shielded }) {
  const { coherence, history, level, alert, log, stats } = sim;
  const meta = LEVEL[level];

  return (
    <Panel
      designation="INST-02"
      title="Loosh Drain Detector"
      status={meta.status}
      statusLabel={meta.word}
      bodyClassName="p-0"
    >
      {/* Alert rail */}
      <div
        className={`flex items-center gap-2 border-b px-4 py-2 transition-colors duration-300 ${
          alert
            ? alert.level === 'critical'
              ? 'border-blood/40 bg-blood/10'
              : 'border-amber-alert/40 bg-amber-alert/10'
            : 'border-phosphor/15 bg-transparent'
        }`}
      >
        {alert ? (
          <>
            <span
              className="animate-pulse-alert font-mono text-[11px]"
              style={{ color: alert.level === 'critical' ? '#ff2d55' : '#ffb000' }}
            >
              ▲
            </span>
            <span
              className="font-mono text-[10.5px] leading-tight"
              style={{ color: alert.level === 'critical' ? '#ff2d55' : '#ffb000' }}
            >
              {alert.text}
            </span>
          </>
        ) : (
          <span className="font-mono text-[10.5px] text-phosphor-dim">
            ◇ Biofield perimeter holding. No active siphon.
          </span>
        )}
      </div>

      <div className="grid gap-0 sm:grid-cols-[150px_1fr]">
        <div className="border-b border-phosphor/10 px-4 py-3 sm:border-b-0 sm:border-r">
          <div className="label">Quantum coherence</div>
          <div
            className="readout mt-1 text-[42px] leading-none"
            style={{ color: meta.color, textShadow: `0 0 18px ${meta.color}66` }}
          >
            {coherence.toFixed(1)}
            <span className="ml-0.5 font-mono text-base opacity-50">%</span>
          </div>
          <div className="mt-2 space-y-0.5 font-mono text-[9.5px] text-ash">
            <div>
              floor <span className="tabular-nums text-phosphor-dim">{stats.deepest.toFixed(1)}%</span>
            </div>
            <div>
              events <span className="tabular-nums text-phosphor-dim">{stats.events}</span>
            </div>
            <div>
              watch <span className="tabular-nums text-phosphor-dim">{stats.uptime}s</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-baseline justify-between">
            <span className="label">Coherence trace · 21s window</span>
            {shielded && (
              <span className="label-live text-violet-glow">shield bias +4</span>
            )}
          </div>
          <Sparkline history={history} color={meta.color} />
        </div>
      </div>

      {/* Event log */}
      <div className="border-t border-phosphor/15">
        <div className="flex items-center gap-2 px-4 py-1.5">
          <span className="label">Incident log</span>
          <span className="h-px flex-1 bg-phosphor/15" />
        </div>
        <ul className="max-h-28 overflow-y-auto">
          {log.length === 0 && (
            <li className="px-4 py-3 font-mono text-[10px] text-ash">
              No incidents recorded this session.
            </li>
          )}
          {log.map((e, i) => (
            <li
              key={`${e.t}-${i}`}
              className="flex gap-2.5 border-b border-phosphor/[0.07] px-4 py-1.5 font-mono text-[10px]"
            >
              <span className="shrink-0 tabular-nums text-ash">
                {formatClock(new Date(e.t))}
              </span>
              <span
                className="flex-1 leading-snug"
                style={{
                  color:
                    e.level === 'critical'
                      ? '#ff2d55'
                      : e.level === 'warning'
                        ? '#ffb000'
                        : '#1f8c0c',
                }}
              >
                {e.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

// Memoised: only re-renders when its own instrument state changes.
export default memo(LooshMonitor);
