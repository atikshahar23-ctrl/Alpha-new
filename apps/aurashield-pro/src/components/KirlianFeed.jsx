import { memo, useCallback, useEffect, useRef, useState } from 'react';
import Panel from './Panel';
import { AURA_MODES } from '../lib/constants';

/**
 * Live camera feed with a stacked-filter corona effect.
 *
 * The glow is produced by attaching the *same* MediaStream to two video
 * elements: a base layer with a saturating filter chain, and a heavily
 * blurred copy composited over it in screen/color-dodge blend mode. No
 * per-frame pixel work, so it stays at full frame rate on a phone.
 *
 * A small offscreen canvas samples average luminance once a second to
 * warn when the room is too dark for the effect to read.
 */
function KirlianFeed({ camera }) {
  const { status, error, facing, start, stop, flip, attach, settings } = camera;
  const [mode, setMode] = useState(AURA_MODES[1]); // Kirlian
  const [intensity, setIntensity] = useState(0.75);
  const [luma, setLuma] = useState(null);

  const baseRef = useRef(null);
  const bloomRef = useRef(null);
  const sampleRef = useRef(null);

  const bind = useCallback(
    (el) => {
      if (el) attach(el);
    },
    [attach]
  );

  useEffect(() => {
    if (status !== 'live') return;
    bind(baseRef.current);
    bind(bloomRef.current);
  }, [status, bind, facing]);

  // Luminance sampling — real measurement, drives the fallback guidance.
  useEffect(() => {
    if (status !== 'live') {
      setLuma(null);
      return;
    }
    const canvas = sampleRef.current ?? document.createElement('canvas');
    sampleRef.current = canvas;
    canvas.width = 32;
    canvas.height = 24;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const id = window.setInterval(() => {
      const v = baseRef.current;
      if (!v || v.readyState < 2) return;
      try {
        ctx.drawImage(v, 0, 0, 32, 24);
        const { data } = ctx.getImageData(0, 0, 32, 24);
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
          sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        }
        setLuma(sum / (data.length / 4) / 255);
      } catch {
        /* cross-origin or not ready */
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [status]);

  const tooDark = luma !== null && luma < 0.11;

  const baseFilter =
    mode.base === 'none' ? 'none' : `${mode.base} saturate(${1 + intensity * 2})`;

  return (
    <Panel
      designation="INST-04"
      title="Kirlian Aura Filter"
      status={status === 'live' ? (tooDark ? 'warn' : 'ok') : status === 'denied' ? 'crit' : 'off'}
      statusLabel={
        { live: tooDark ? 'low light' : 'imaging', requesting: 'linking', denied: 'refused', error: 'fault', unsupported: 'n/a' }[
          status
        ] ?? 'cold'
      }
      actions={
        status === 'live' && (
          <>
            <button onClick={flip} className="btn-hud !px-2 !py-1 !text-[9px]">
              Flip
            </button>
            <button onClick={stop} className="btn-hud !px-2 !py-1 !text-[9px]">
              Stop
            </button>
          </>
        )
      }
      bodyClassName="p-0"
    >
      {/* ── Viewport ──────────────────────────────────────────────── */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {status === 'live' ? (
          <>
            <video
              ref={baseRef}
              playsInline
              muted
              autoPlay
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                filter: baseFilter,
                transform: facing === 'user' ? 'scaleX(-1)' : 'none',
              }}
            />
            {mode.bloom !== 'none' && (
              <video
                ref={bloomRef}
                playsInline
                muted
                autoPlay
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  filter: mode.bloom,
                  mixBlendMode: mode.blend,
                  opacity: 0.35 + intensity * 0.5,
                  transform: facing === 'user' ? 'scaleX(-1)' : 'none',
                }}
              />
            )}

            {/* HUD furniture over the feed */}
            <div className="pointer-events-none absolute inset-0">
              <svg className="h-full w-full" viewBox="0 0 320 180" preserveAspectRatio="none">
                <path d="M8 8 H36 M8 8 V28" stroke="#39ff14" strokeWidth="1" opacity="0.55" fill="none" />
                <path d="M312 8 H284 M312 8 V28" stroke="#39ff14" strokeWidth="1" opacity="0.55" fill="none" />
                <path d="M8 172 H36 M8 172 V152" stroke="#39ff14" strokeWidth="1" opacity="0.55" fill="none" />
                <path d="M312 172 H284 M312 172 V152" stroke="#39ff14" strokeWidth="1" opacity="0.55" fill="none" />
                <circle cx="160" cy="90" r="34" stroke="#39ff14" strokeWidth="0.4" opacity="0.3" fill="none" />
                <line x1="150" y1="90" x2="170" y2="90" stroke="#39ff14" strokeWidth="0.4" opacity="0.45" />
                <line x1="160" y1="80" x2="160" y2="100" stroke="#39ff14" strokeWidth="0.4" opacity="0.45" />
              </svg>

              <div className="absolute left-3 top-3 font-mono text-[9px] leading-relaxed text-phosphor/85">
                <div>◈ CORONA FIELD · {mode.label.toUpperCase()}</div>
                <div className="text-phosphor-dim">
                  {settings.width ?? '—'}×{settings.height ?? '—'} · {facing === 'user' ? 'FRONT' : 'REAR'}
                </div>
              </div>

              <div className="absolute bottom-3 right-3 text-right font-mono text-[9px] text-phosphor-dim">
                <div>LUMA {luma === null ? '—' : (luma * 100).toFixed(0).padStart(2, '0')}</div>
                <div className="text-violet-glow/70">GAIN {(intensity * 100).toFixed(0)}</div>
              </div>
            </div>

            {tooDark && (
              <div className="absolute inset-x-0 bottom-0 border-t border-amber-alert/40 bg-black/85 px-3 py-2">
                <p className="font-mono text-[10px] leading-snug text-amber-alert">
                  Ambient light below imaging threshold. Move to a brighter room or
                  add a light source — corona structure will not resolve in the dark.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="font-mono text-[11px] text-phosphor-dim">
              {status === 'requesting'
                ? '◈ establishing optical link…'
                : error
                  ? error
                  : 'Optical sensor offline.'}
            </div>
            {status !== 'requesting' && (
              <button onClick={() => start()} className="btn-hud">
                {status === 'denied' ? 'Retry optical link' : 'Open optical link'}
              </button>
            )}
            <p className="max-w-xs font-mono text-[9px] leading-relaxed text-ash">
              The feed is processed entirely on this device. No frames leave the
              browser and nothing is recorded.
            </p>
          </div>
        )}
      </div>

      {/* ── Controls ──────────────────────────────────────────────── */}
      <div className="border-t border-phosphor/15 p-4">
        <span className="label">Spectral profile</span>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {AURA_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m)}
              data-active={mode.id === m.id}
              className="btn-hud !px-1 !py-1.5 !text-[9px]"
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mt-2 font-mono text-[9.5px] text-ash">{mode.caption}</p>

        <div className="mt-4 flex items-baseline justify-between">
          <span className="label">Corona gain</span>
          <span className="font-mono text-[10px] tabular-nums text-phosphor-dim">
            {(intensity * 100).toFixed(0)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={intensity}
          onChange={(e) => setIntensity(parseFloat(e.target.value))}
          aria-label="Corona gain"
          className="mt-3 h-1 w-full cursor-pointer appearance-none bg-phosphor/20
                     [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-violet-glow
                     [&::-webkit-slider-thumb]:shadow-[0_0_10px_#a855f7]"
        />
      </div>
    </Panel>
  );
}

// Memoised: only re-renders when its own instrument state changes.
export default memo(KirlianFeed);
