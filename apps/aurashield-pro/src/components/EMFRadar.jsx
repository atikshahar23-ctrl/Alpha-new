import { useEffect, useRef, useState } from 'react';
import Panel from './Panel';
import { angularDistance, normalizeDeg, polarToXY, prefersReducedMotion } from '../lib/utils';

const CX = 100;
const CY = 100;
const R = 86;
const SWEEP_PERIOD = 4200; // ms per revolution

const THREAT_COLOR = {
  low: '#39ff14',
  mid: '#ffb000',
  high: '#ff2d55',
};

/**
 * Plan Position Indicator.
 *
 * The contacts carry fixed world bearings; we render each one at
 * (contact.bearing − device heading), so rotating the device rotates the
 * scope underneath a stationary field. That single transform is what
 * makes the instrument feel physical.
 */
export default function EMFRadar({ orientation, contacts, shielded }) {
  const [sweep, setSweep] = useState(0);
  const [selected, setSelected] = useState(null);
  const reduced = useRef(prefersReducedMotion());
  const raf = useRef(0);

  // Sweep clock, throttled to ~30fps. Drives both the trace and the
  // per-contact decay so the two can never drift apart.
  useEffect(() => {
    if (reduced.current) return;
    let last = 0;
    const tick = (now) => {
      if (now - last > 33) {
        setSweep(((now % SWEEP_PERIOD) / SWEEP_PERIOD) * 360);
        last = now;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const { alpha, beta, gamma, source, tiltMagnitude } = orientation;

  // Tilt parallax — nudges the whole field a few units. Subtle enough
  // that you feel it rather than see it.
  const px = (gamma / 90) * 6;
  const py = (beta / 90) * 6;

  const sourceLabel = {
    absolute: 'MAGNETOMETER LOCK',
    relative: 'RELATIVE GYRO',
    'dead-reckoning': 'INERTIAL DEAD RECKONING',
    none: 'NO SENSOR ARRAY',
  }[source];

  const rendered = contacts.map((c) => {
    const relative = normalizeDeg(c.bearing - alpha);
    const phase = normalizeDeg(sweep - relative);
    const intensity = reduced.current ? 1 : Math.pow(1 - phase / 360, 1.7);
    const fresh = phase < 14;
    const { x, y } = polarToXY(CX, CY, c.distance * R, relative);
    return { ...c, relative, x: x + px, y: y + py, intensity, fresh };
  });

  return (
    <Panel
      designation="INST-01"
      title="Quantum EMF Scanner"
      status={source === 'dead-reckoning' || source === 'none' ? 'warn' : 'ok'}
      statusLabel={source === 'none' ? 'standby' : 'scanning'}
      bodyClassName="p-0"
    >
      <div className="grid gap-0 lg:grid-cols-[1fr_190px]">
        {/* ── Scope ─────────────────────────────────────────────── */}
        <div className="relative p-4">
          <svg viewBox="0 0 200 200" className="mx-auto block w-full max-w-[380px]">
            <defs>
              <radialGradient id="scope-floor">
                <stop offset="0%" stopColor="#4c0f7a" stopOpacity="0.42" />
                <stop offset="70%" stopColor="#000" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#000" stopOpacity="1" />
              </radialGradient>
              <linearGradient id="sweep-trace" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#39ff14" stopOpacity="0" />
                <stop offset="100%" stopColor="#39ff14" stopOpacity="0.55" />
              </linearGradient>
              <filter id="blip-glow" x="-120%" y="-120%" width="340%" height="340%">
                <feGaussianBlur stdDeviation="2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <circle cx={CX} cy={CY} r={R} fill="url(#scope-floor)" />

            {/* Range rings */}
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <circle
                key={f}
                cx={CX}
                cy={CY}
                r={R * f}
                fill="none"
                stroke="#39ff14"
                strokeOpacity={f === 1 ? 0.4 : 0.16}
                strokeWidth="0.5"
              />
            ))}

            {/* Bearing graticule */}
            {Array.from({ length: 36 }, (_, i) => i * 10).map((deg) => {
              const major = deg % 30 === 0;
              const a = polarToXY(CX, CY, R - (major ? 7 : 3.5), deg);
              const b = polarToXY(CX, CY, R, deg);
              return (
                <line
                  key={deg}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#39ff14"
                  strokeOpacity={major ? 0.4 : 0.18}
                  strokeWidth="0.5"
                />
              );
            })}

            <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke="#39ff14" strokeOpacity="0.14" strokeWidth="0.5" />
            <line x1={CX} y1={CY - R} x2={CX} y2={CY + R} stroke="#39ff14" strokeOpacity="0.14" strokeWidth="0.5" />

            {/* Cardinal marks rotate with the device heading */}
            <g style={{ transform: `rotate(${-alpha}deg)`, transformOrigin: '100px 100px' }}>
              {[
                ['N', 0],
                ['E', 90],
                ['S', 180],
                ['W', 270],
              ].map(([letter, deg]) => {
                const p = polarToXY(CX, CY, R - 15, deg);
                return (
                  <text
                    key={letter}
                    x={p.x}
                    y={p.y + 2.5}
                    textAnchor="middle"
                    fontSize="7"
                    fill={letter === 'N' ? '#a855f7' : '#39ff14'}
                    fillOpacity={letter === 'N' ? 0.95 : 0.45}
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {letter}
                  </text>
                );
              })}
            </g>

            {/* Sweep trace */}
            <g
              style={{
                transform: `rotate(${sweep}deg)`,
                transformOrigin: '100px 100px',
              }}
            >
              <path
                d={`M ${CX} ${CY} L ${CX} ${CY - R} A ${R} ${R} 0 0 1 ${
                  polarToXY(CX, CY, R, 55).x
                } ${polarToXY(CX, CY, R, 55).y} Z`}
                fill="url(#sweep-trace)"
                opacity="0.32"
              />
              <line
                x1={CX}
                y1={CY}
                x2={CX}
                y2={CY - R}
                stroke="#39ff14"
                strokeWidth="0.9"
                opacity="0.9"
              />
            </g>

            {/* Contacts */}
            <g filter="url(#blip-glow)">
              {rendered.map((c) => {
                const color = THREAT_COLOR[c.threat];
                return (
                  <g
                    key={c.id}
                    opacity={Math.max(0.05, c.intensity)}
                    onClick={() => setSelected(c.id === selected ? null : c.id)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={2 + c.strength * 2.2}
                      fill={color}
                      fillOpacity={0.9}
                    />
                    {c.fresh && (
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r={7 + c.strength * 4}
                        fill="none"
                        stroke={color}
                        strokeWidth="0.6"
                        opacity="0.7"
                      />
                    )}
                    {(selected === c.id || c.threat === 'high') && (
                      <text
                        x={c.x + 6}
                        y={c.y - 4}
                        fontSize="4.4"
                        fill={color}
                        fontFamily="JetBrains Mono, monospace"
                        opacity={0.95}
                      >
                        {c.code}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Operator position */}
            <circle cx={CX + px} cy={CY + py} r="2.4" fill="#a855f7" />
            <circle
              cx={CX + px}
              cy={CY + py}
              r="6"
              fill="none"
              stroke="#a855f7"
              strokeWidth="0.5"
              opacity="0.6"
            />
          </svg>

          {shielded && (
            <div className="pointer-events-none absolute inset-4 flex items-end justify-center pb-1">
              <span className="label-live text-[9px] text-violet-glow">
                ◈ shield envelope active — contact acquisition suppressed
              </span>
            </div>
          )}
        </div>

        {/* ── Telemetry column ──────────────────────────────────── */}
        <div className="border-t border-phosphor/15 lg:border-l lg:border-t-0">
          <div className="grid grid-cols-3 lg:grid-cols-1">
            {[
              ['Azimuth', `${alpha.toFixed(1)}°`, 'α'],
              ['Pitch', `${beta.toFixed(1)}°`, 'β'],
              ['Roll', `${gamma.toFixed(1)}°`, 'γ'],
            ].map(([label, value, sym]) => (
              <div
                key={label}
                className="border-b border-r border-phosphor/10 px-3 py-2.5 last:border-r-0 lg:border-r-0"
              >
                <div className="label flex items-center gap-1.5">
                  <span className="text-violet-glow/60">{sym}</span>
                  {label}
                </div>
                <div className="readout mt-0.5 text-lg text-phosphor">{value}</div>
              </div>
            ))}
          </div>

          <div className="border-b border-phosphor/10 px-3 py-2.5">
            <div className="label">Field intensity</div>
            <div className="mt-1.5 h-1 w-full bg-phosphor/10">
              <div
                className="h-full bg-phosphor transition-[width] duration-200"
                style={{
                  width: `${(tiltMagnitude * 100).toFixed(0)}%`,
                  boxShadow: '0 0 8px #39ff14',
                }}
              />
            </div>
            <div className="mt-1 font-mono text-[10px] tabular-nums text-phosphor-dim">
              {(tiltMagnitude * 847).toFixed(0)} mG · torsion
            </div>
          </div>

          <div className="px-3 py-2.5">
            <div className="label">Reference frame</div>
            <div className="mt-0.5 font-mono text-[10px] leading-relaxed text-phosphor-dim">
              {sourceLabel}
            </div>
            <div className="mt-2 label">Contacts</div>
            <div className="readout text-lg text-phosphor">
              {String(contacts.length).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* ── Contact manifest ─────────────────────────────────────── */}
      <div className="border-t border-phosphor/15">
        <div className="flex items-center gap-2 px-4 py-1.5">
          <span className="label">Contact manifest</span>
          <span className="h-px flex-1 bg-phosphor/15" />
        </div>
        <ul className="max-h-32 overflow-y-auto">
          {rendered.length === 0 && (
            <li className="px-4 py-3 font-mono text-[11px] text-ash">
              Field clear. No contacts within scope range.
            </li>
          )}
          {rendered.map((c) => (
            <li
              key={c.id}
              onClick={() => setSelected(c.id === selected ? null : c.id)}
              className={`flex cursor-pointer items-center gap-3 border-b border-phosphor/[0.07] px-4 py-1.5 font-mono text-[10px] transition-colors hover:bg-phosphor/[0.05] ${
                selected === c.id ? 'bg-phosphor/[0.08]' : ''
              }`}
            >
              <span
                className="h-1.5 w-1.5 shrink-0"
                style={{ background: THREAT_COLOR[c.threat] }}
              />
              <span className="w-10 shrink-0 text-violet-glow/80">{c.code}</span>
              <span className="flex-1 truncate text-phosphor/80">{c.label}</span>
              <span className="tabular-nums text-ash">{c.ident}</span>
              <span className="w-12 shrink-0 text-right tabular-nums text-phosphor-dim">
                {c.relative.toFixed(0).padStart(3, '0')}°
              </span>
              <span className="w-10 shrink-0 text-right tabular-nums text-phosphor-dim">
                {(c.distance * 12).toFixed(1)}m
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
