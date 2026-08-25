import { useEffect, useRef, useState } from 'react';
import { BOOT_SEQUENCE } from '../lib/constants';
import { prefersReducedMotion } from '../lib/utils';

/**
 * Cold-start sequence, then the permission grants.
 *
 * Every browser permission here must originate in a user gesture:
 * iOS gates DeviceOrientation behind requestPermission(), and every
 * browser suspends AudioContext until a click. So each grant is its own
 * button — no auto-requesting on mount, which would silently fail.
 */
export default function ClearanceGate({ orientation, camera, onEnter }) {
  const [line, setLine] = useState(0);
  const [booted, setBooted] = useState(false);
  const [busy, setBusy] = useState(null);
  const scroller = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setLine(BOOT_SEQUENCE.length);
      setBooted(true);
      return;
    }
    if (line >= BOOT_SEQUENCE.length) {
      const t = window.setTimeout(() => setBooted(true), 260);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setLine((l) => l + 1), 150 + Math.random() * 130);
    return () => window.clearTimeout(t);
  }, [line]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [line]);

  const grantMotion = async () => {
    setBusy('motion');
    await orientation.request();
    setBusy(null);
  };

  const grantCamera = async () => {
    setBusy('camera');
    await camera.start();
    setBusy(null);
  };

  const grants = [
    {
      key: 'motion',
      code: 'A-1',
      title: 'Inertial sensor array',
      body: 'Accelerometer and magnetometer access. Drives the EMF scope. Required for bearing-locked contacts.',
      state:
        orientation.permission === 'granted'
          ? 'granted'
          : orientation.permission === 'denied'
            ? 'refused'
            : orientation.permission === 'unsupported'
              ? 'n/a'
              : 'pending',
      action: grantMotion,
    },
    {
      key: 'camera',
      code: 'A-2',
      title: 'Optical sensor',
      body: 'Camera access for corona imaging. Processed on-device; no frames are transmitted or stored.',
      state:
        camera.status === 'live'
          ? 'granted'
          : camera.status === 'denied' || camera.status === 'error'
            ? 'refused'
            : camera.status === 'unsupported'
              ? 'n/a'
              : 'pending',
      action: grantCamera,
    },
  ];

  const STATE_STYLE = {
    granted: 'text-phosphor border-phosphor/50',
    refused: 'text-amber-alert border-amber-alert/50',
    pending: 'text-ash border-ash/40',
    'n/a': 'text-ash border-ash/40',
  };

  return (
    <div className="relative z-10 flex min-h-[100dvh] items-center justify-center p-5">
      <div className="w-full max-w-lg">
        {/* Boot log */}
        <div
          ref={scroller}
          className="max-h-56 overflow-hidden border border-phosphor/20 bg-black/70 p-4 font-mono text-[11px] leading-relaxed backdrop-blur"
        >
          {BOOT_SEQUENCE.slice(0, line).map((l, i) => (
            <div
              key={i}
              className={
                i === 0
                  ? 'font-display text-[13px] font-700 tracking-[0.16em] text-phosphor glow-text'
                  : l === 'AUTHORISATION REQUIRED'
                    ? 'mt-1 text-amber-alert glow-amber'
                    : 'text-phosphor-dim'
              }
            >
              {l || '\u00A0'}
            </div>
          ))}
          {!booted && <span className="inline-block h-3 w-2 animate-pulse bg-phosphor align-middle" />}
        </div>

        {/* Grants */}
        <div
          className={`mt-4 space-y-2 transition-opacity duration-500 ${
            booted ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          {grants.map((g) => (
            <div
              key={g.key}
              className="bay clip-corner flex items-start gap-3 p-3.5"
            >
              <span className="label mt-0.5 shrink-0 text-violet-glow/70">{g.code}</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-[12px] font-600 uppercase tracking-[0.14em] text-phosphor/90">
                  {g.title}
                </h3>
                <p className="mt-1 font-mono text-[9.5px] leading-relaxed text-ash">{g.body}</p>
              </div>
              {g.state === 'granted' ? (
                <span className={`shrink-0 border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] ${STATE_STYLE.granted}`}>
                  ✓ ok
                </span>
              ) : (
                <button
                  onClick={g.action}
                  disabled={busy === g.key || g.state === 'n/a'}
                  className="btn-hud shrink-0"
                >
                  {busy === g.key ? '···' : g.state === 'refused' ? 'Retry' : 'Grant'}
                </button>
              )}
            </div>
          ))}

          <button
            onClick={onEnter}
            className="mt-3 w-full border border-phosphor/60 bg-phosphor/10 px-4 py-3.5 font-display text-sm font-700 uppercase tracking-[0.3em] text-phosphor transition-all hover:bg-phosphor/20"
            style={{ boxShadow: '0 0 26px rgba(57,255,20,0.22)' }}
          >
            Enter terminal
          </button>

          <p className="pt-1 text-center font-mono text-[9px] leading-relaxed text-ash">
            Grants are optional — instruments run in reduced mode without them.
            <br />
            Simulation. Contact and coherence readings are generated, not measured.
          </p>
        </div>
      </div>
    </div>
  );
}
