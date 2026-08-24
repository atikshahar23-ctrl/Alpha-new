import { memo, useEffect, useRef } from 'react';
import Panel from './Panel';
import { FREQUENCIES, WAVEFORMS } from '../lib/constants';

/**
 * Oscilloscope fed by the real AnalyserNode. When the jammer is off the
 * trace flatlines, because there is genuinely no signal on the bus —
 * nothing here is faked.
 */
function Oscilloscope({ analyserRef, engaged }) {
  const canvasRef = useRef(null);
  const raf = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const analyser = analyserRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Graticule
      ctx.strokeStyle = 'rgba(57,255,20,0.10)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo((w / 8) * i, 0);
        ctx.lineTo((w / 8) * i, h);
        ctx.stroke();
      }
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (h / 4) * i);
        ctx.lineTo(w, (h / 4) * i);
        ctx.stroke();
      }

      ctx.lineWidth = 1.8 * dpr;
      ctx.strokeStyle = '#39ff14';
      ctx.shadowBlur = 10 * dpr;
      ctx.shadowColor = '#39ff14';
      ctx.beginPath();

      if (analyser && engaged) {
        const buf = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(buf);
        const slice = w / buf.length;
        for (let i = 0; i < buf.length; i++) {
          // Amplify: master gain is low, so the raw trace would be a
          // near-flat line. Scale for legibility, not for honesty —
          // the shape and period are the real signal.
          const v = ((buf[i] - 128) / 128) * 4.2;
          const y = h / 2 + v * (h / 2) * 0.85;
          i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * slice, y);
        }
      } else {
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
    };
  }, [analyserRef, engaged]);

  return <canvas ref={canvasRef} className="h-20 w-full" />;
}

function ScalarJammer({ audio }) {
  const {
    engaged,
    active,
    waveform,
    volume,
    pulse,
    toggle,
    toggleFrequency,
    setWaveform,
    setVolume,
    setPulse,
    analyser,
    activeHz,
    error,
  } = audio;

  return (
    <Panel
      designation="INST-03"
      title="Scalar Frequency Jammer"
      status={engaged ? 'ok' : 'off'}
      statusLabel={engaged ? 'emitting' : 'cold'}
      bodyClassName="p-0"
    >
      <div className="border-b border-phosphor/15 bg-black">
        <Oscilloscope analyserRef={analyser} engaged={engaged} />
      </div>

      <div className="p-4">
        {/* ── The engage control ─────────────────────────────────── */}
        <button
          onClick={toggle}
          aria-pressed={engaged}
          className="group relative w-full overflow-hidden border px-4 py-4 transition-all duration-300"
          style={{
            borderColor: engaged ? '#39ff14' : 'rgba(57,255,20,0.3)',
            background: engaged
              ? 'linear-gradient(180deg, rgba(57,255,20,0.18), rgba(76,15,122,0.35))'
              : 'linear-gradient(180deg, rgba(57,255,20,0.03), rgba(76,15,122,0.12))',
            boxShadow: engaged
              ? '0 0 32px rgba(57,255,20,0.35), inset 0 0 40px rgba(57,255,20,0.14)'
              : 'none',
          }}
        >
          <span
            className={`block font-display text-base font-700 uppercase tracking-[0.3em] transition-colors ${
              engaged ? 'text-phosphor glow-text' : 'text-phosphor-dim group-hover:text-phosphor'
            }`}
          >
            {engaged ? 'Shielding engaged' : 'Engage quantum shielding'}
          </span>
          <span className="mt-1 block font-mono text-[9.5px] uppercase tracking-[0.2em] text-ash">
            {engaged
              ? `emitting ${activeHz.join(' · ') || '—'} Hz · ${waveform}`
              : 'tap to open the carrier'}
          </span>

          {engaged && (
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-px animate-pulse-alert"
              style={{ background: '#39ff14', boxShadow: '0 0 12px #39ff14' }}
            />
          )}
        </button>

        {error && (
          <p className="mt-3 border border-blood/40 bg-blood/10 px-3 py-2 font-mono text-[10px] text-blood">
            {error}
          </p>
        )}

        {/* ── Carrier selection ──────────────────────────────────── */}
        <div className="mt-4">
          <span className="label">Carrier bands</span>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f.id}
                onClick={() => toggleFrequency(f.id)}
                data-active={active[f.id]}
                aria-pressed={active[f.id]}
                className="btn-hud flex flex-col items-start gap-0.5 !px-2.5 !py-2 text-left"
                style={
                  active[f.id]
                    ? { borderColor: f.color, color: f.color, boxShadow: `inset 0 0 18px ${f.color}22` }
                    : undefined
                }
              >
                <span className="font-display text-[11px] font-600 tracking-[0.1em]">
                  {f.name}
                </span>
                <span className="text-[8.5px] normal-case tracking-normal opacity-70">
                  {f.subtitle}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Modulation ─────────────────────────────────────────── */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <span className="label">Waveform</span>
            <div className="mt-2 grid grid-cols-4 gap-1">
              {WAVEFORMS.map((w) => (
                <button
                  key={w}
                  onClick={() => setWaveform(w)}
                  data-active={waveform === w}
                  className="btn-hud !px-1 !py-1.5 !text-[9px]"
                >
                  {w.slice(0, 4)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="label">Emission gain</span>
              <span className="font-mono text-[10px] tabular-nums text-phosphor-dim">
                {(volume * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Emission gain"
              className="mt-3 h-1 w-full cursor-pointer appearance-none bg-phosphor/20 accent-phosphor
                         [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-phosphor
                         [&::-webkit-slider-thumb]:shadow-[0_0_10px_#39ff14]"
            />
          </div>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={pulse}
            onChange={(e) => setPulse(e.target.checked)}
            className="h-3.5 w-3.5 accent-violet-glow"
          />
          <span className="label-live">Pulsed envelope · 0.5 Hz amplitude modulation</span>
        </label>

        <p className="mt-3 border-l border-phosphor/20 pl-3 font-mono text-[9.5px] leading-relaxed text-ash">
          Output is capped well below full scale. Sustained pure tones fatigue
          quickly — keep sessions short and reduce gain if the tone becomes
          uncomfortable.
        </p>
      </div>
    </Panel>
  );
}

// Memoised: only re-renders when its own instrument state changes.
export default memo(ScalarJammer);
