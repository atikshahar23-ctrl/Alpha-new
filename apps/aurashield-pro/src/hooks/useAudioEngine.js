import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FREQUENCIES } from '../lib/constants';

// Pure sustained tones get fatiguing fast, and a square wave at 528 Hz is
// genuinely unpleasant at volume. We cap the master gain well below unity.
const MAX_GAIN = 0.22;
const RAMP = 0.09; // seconds — long enough to kill the click, short enough to feel instant

/**
 * Generates real solfeggio tones with the Web Audio API.
 *
 * One oscillator + one gain node per frequency, summed into a master gain,
 * through an AnalyserNode so the UI can draw the actual waveform rather
 * than a decorative fake.
 *
 * Browsers suspend AudioContext until a user gesture, so `engage()` must
 * be called from a click handler.
 */
export function useAudioEngine() {
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const analyserRef = useRef(null);
  const voicesRef = useRef({}); // id -> { osc, gain }
  const lfoRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [active, setActive] = useState({ f528: true, f432: true, f396: false });
  const [waveform, setWaveform] = useState('sine');
  const [volume, setVolume] = useState(0.55); // 0..1 of MAX_GAIN
  const [pulse, setPulse] = useState(false);
  const [error, setError] = useState(null);

  const ensureContext = useCallback(async () => {
    if (ctxRef.current) {
      if (ctxRef.current.state === 'suspended') await ctxRef.current.resume();
      return ctxRef.current;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
      setError('Web Audio API unavailable in this browser.');
      return null;
    }

    const ctx = new AC();
    const master = ctx.createGain();
    const analyser = ctx.createAnalyser();

    master.gain.value = 0;
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.75;

    master.connect(analyser);
    analyser.connect(ctx.destination);

    // Slow amplitude LFO — the "pulsed shielding" mode.
    const lfo = ctx.createOscillator();
    const lfoDepth = ctx.createGain();
    lfo.frequency.value = 0.5;
    lfoDepth.gain.value = 0;
    lfo.connect(lfoDepth);
    lfoDepth.connect(master.gain);
    lfo.start();

    ctxRef.current = ctx;
    masterRef.current = master;
    analyserRef.current = analyser;
    lfoRef.current = { lfo, depth: lfoDepth };

    if (ctx.state === 'suspended') await ctx.resume();
    setReady(true);
    return ctx;
  }, []);

  const startVoice = useCallback((id) => {
    const ctx = ctxRef.current;
    if (!ctx || voicesRef.current[id]) return;
    const spec = FREQUENCIES.find((f) => f.id === id);
    if (!spec) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = waveform;
    osc.frequency.value = spec.hz;
    gain.gain.value = 0;

    osc.connect(gain);
    gain.connect(masterRef.current);
    osc.start();

    // Split headroom across simultaneous voices so stacking tones
    // doesn't clip the master bus.
    gain.gain.linearRampToValueAtTime(1 / FREQUENCIES.length, ctx.currentTime + RAMP);
    voicesRef.current[id] = { osc, gain };
  }, [waveform]);

  const stopVoice = useCallback((id) => {
    const ctx = ctxRef.current;
    const voice = voicesRef.current[id];
    if (!ctx || !voice) return;
    const t = ctx.currentTime;
    voice.gain.gain.cancelScheduledValues(t);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, t);
    voice.gain.gain.linearRampToValueAtTime(0, t + RAMP);
    voice.osc.stop(t + RAMP + 0.02);
    delete voicesRef.current[id];
  }, []);

  const engage = useCallback(async () => {
    const ctx = await ensureContext();
    if (!ctx) return;
    Object.entries(active).forEach(([id, on]) => on && startVoice(id));
    const t = ctx.currentTime;
    masterRef.current.gain.cancelScheduledValues(t);
    masterRef.current.gain.setValueAtTime(masterRef.current.gain.value, t);
    masterRef.current.gain.linearRampToValueAtTime(volume * MAX_GAIN, t + 0.35);
    setEngaged(true);
  }, [ensureContext, active, startVoice, volume]);

  const disengage = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const t = ctx.currentTime;
    masterRef.current.gain.cancelScheduledValues(t);
    masterRef.current.gain.setValueAtTime(masterRef.current.gain.value, t);
    masterRef.current.gain.linearRampToValueAtTime(0, t + 0.3);
    window.setTimeout(() => {
      Object.keys(voicesRef.current).forEach(stopVoice);
    }, 340);
    setEngaged(false);
  }, [stopVoice]);

  const toggle = useCallback(() => {
    engaged ? disengage() : engage();
  }, [engaged, engage, disengage]);

  const toggleFrequency = useCallback(
    (id) => {
      // Side effects stay outside the updater — StrictMode double-invokes
      // updaters in dev, and starting an oscillator twice is not free.
      const next = !active[id];
      setActive((prev) => ({ ...prev, [id]: next }));
      if (engaged) (next ? startVoice : stopVoice)(id);
    },
    [active, engaged, startVoice, stopVoice]
  );

  // Live-apply volume
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx || !engaged) return;
    const t = ctx.currentTime;
    masterRef.current.gain.cancelScheduledValues(t);
    masterRef.current.gain.setValueAtTime(masterRef.current.gain.value, t);
    masterRef.current.gain.linearRampToValueAtTime(volume * MAX_GAIN, t + 0.12);
  }, [volume, engaged]);

  // Live-apply waveform
  useEffect(() => {
    Object.values(voicesRef.current).forEach((v) => {
      v.osc.type = waveform;
    });
  }, [waveform]);

  // Live-apply pulse depth
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx || !lfoRef.current) return;
    const t = ctx.currentTime;
    lfoRef.current.depth.gain.linearRampToValueAtTime(
      pulse ? volume * MAX_GAIN * 0.85 : 0,
      t + 0.25
    );
  }, [pulse, volume]);

  useEffect(
    () => () => {
      try {
        Object.values(voicesRef.current).forEach((v) => v.osc.stop());
        lfoRef.current?.lfo.stop();
        ctxRef.current?.close();
      } catch {
        /* context already torn down */
      }
    },
    []
  );

  // Stable identity so consumers can be memoised and skip the ~30fps
  // re-renders driven by the orientation loop.
  return useMemo(
    () => ({
      ready,
      engaged,
      error,
      active,
      waveform,
      volume,
      pulse,
      toggle,
      toggleFrequency,
      setWaveform,
      setVolume,
      setPulse,
      analyser: analyserRef,
      activeHz: FREQUENCIES.filter((f) => active[f.id]).map((f) => f.hz),
    }),
    [ready, engaged, error, active, waveform, volume, pulse, toggle, toggleFrequency]
  );
}
