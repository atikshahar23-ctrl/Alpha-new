// Heavy Guard · OMEGA CRM — shared FX bus (Web Audio cues + haptics).
//
// Gesture-gated: browsers keep a fresh AudioContext suspended until a user
// gesture, so unlockAudio() must be called from inside a real tap/click. All
// cues are synthesized (no asset files), matching the repo's procedural
// boot-chime convention, and every call is guarded so a device without Web
// Audio / Vibration is a silent no-op, never a throw. Reused across Phases
// 1 (access-granted), 2 (deal thud), 4 (AI hum), 8 (whale bass-drop) and the
// mobile-haptics layer (Phase 7).

let ctx = null;
let hum = null; // active processing-hum nodes, or null

function ac() {
  if (ctx) return ctx;
  try { const AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC(); } catch { ctx = null; }
  return ctx;
}

export function unlockAudio() {
  const c = ac();
  if (c && c.state !== "running") { try { c.resume(); } catch {} }
  return !!c;
}

// Chrome blocks navigator.vibrate (with a console error) until the user has
// tapped the page at least once — the boot sequence fired one before any
// gesture. Gate haptics on the first real interaction instead.
let userTapped = false;
if (typeof window !== "undefined") {
  const mark = () => { userTapped = true; };
  window.addEventListener("pointerdown", mark, { once: true, passive: true });
  window.addEventListener("keydown", mark, { once: true, passive: true });
}
export function haptic(pattern) {
  if (!userTapped) return;
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch {}
}

function noiseBuffer(c, seconds) {
  const n = Math.max(1, Math.floor(c.sampleRate * seconds));
  const buf = c.createBuffer(1, n, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

export function cue(name) {
  const c = ac();
  if (!c) return;
  if (c.state !== "running") { try { c.resume(); } catch {} }
  const t = c.currentTime;
  const master = c.createGain(); master.connect(c.destination);

  if (name === "access") {
    // Rising confirm sweep + a two-note "granted" chord.
    master.gain.value = 0.0001;
    master.gain.exponentialRampToValueAtTime(0.5, t + 0.1);
    master.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    const sweep = c.createOscillator(); sweep.type = "sawtooth";
    sweep.frequency.setValueAtTime(200, t); sweep.frequency.exponentialRampToValueAtTime(900, t + 0.5);
    const sg = c.createGain(); sg.gain.value = 0.15; sweep.connect(sg).connect(master); sweep.start(t); sweep.stop(t + 0.55);
    [523.25, 783.99].forEach((f, i) => {
      const o = c.createOscillator(); o.type = "triangle"; o.frequency.value = f;
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t + 0.5 + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.3, t + 0.56 + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
      o.connect(g).connect(master); o.start(t + 0.5 + i * 0.12); o.stop(t + 1.35);
    });
  } else if (name === "thud") {
    // Heavy mechanical drop — filtered noise transient + a sub thump.
    master.gain.value = 0.9;
    const nz = c.createBufferSource(); nz.buffer = noiseBuffer(c, 0.25);
    const nf = c.createBiquadFilter(); nf.type = "lowpass"; nf.frequency.setValueAtTime(600, t); nf.frequency.exponentialRampToValueAtTime(80, t + 0.2);
    const ng = c.createGain(); ng.gain.setValueAtTime(0.9, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    nz.connect(nf).connect(ng).connect(master); nz.start(t); nz.stop(t + 0.28);
    const th = c.createOscillator(); th.type = "sine"; th.frequency.setValueAtTime(120, t); th.frequency.exponentialRampToValueAtTime(38, t + 0.22);
    const tg = c.createGain(); tg.gain.setValueAtTime(0.9, t); tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    th.connect(tg).connect(master); th.start(t); th.stop(t + 0.32);
  } else if (name === "stamp") {
    // Approval stamp — a short sharp mechanical clack.
    master.gain.value = 0.8;
    const nz = c.createBufferSource(); nz.buffer = noiseBuffer(c, 0.09);
    const nf = c.createBiquadFilter(); nf.type = "bandpass"; nf.frequency.value = 1800; nf.Q.value = 1.2;
    const ng = c.createGain(); ng.gain.setValueAtTime(0.9, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    nz.connect(nf).connect(ng).connect(master); nz.start(t); nz.stop(t + 0.12);
    const th = c.createOscillator(); th.type = "sine"; th.frequency.setValueAtTime(90, t); th.frequency.exponentialRampToValueAtTime(45, t + 0.1);
    const tg = c.createGain(); tg.gain.setValueAtTime(0.6, t); tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    th.connect(tg).connect(master); th.start(t); th.stop(t + 0.16);
  } else if (name === "bass") {
    // Whale-deal bass drop.
    master.gain.value = 1.0;
    const o = c.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(28, t + 1.2);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(1.0, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(g).connect(master); o.start(t); o.stop(t + 1.7);
  }
}

// Looping electronic "processing" hum — start when the AI begins working,
// stop when it's done. Both are idempotent.
export function humStart() {
  const c = ac(); if (!c || hum) return;
  if (c.state !== "running") { try { c.resume(); } catch {} }
  const osc = c.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = 68;
  const osc2 = c.createOscillator(); osc2.type = "square"; osc2.frequency.value = 137;
  const filter = c.createBiquadFilter(); filter.type = "bandpass"; filter.frequency.value = 340; filter.Q.value = 6;
  const gain = c.createGain(); gain.gain.value = 0.0001;
  gain.gain.linearRampToValueAtTime(0.05, c.currentTime + 0.3);
  osc.connect(filter); osc2.connect(filter); filter.connect(gain).connect(c.destination);
  osc.start(); osc2.start();
  hum = { osc, osc2, gain };
}
export function humStop() {
  const c = ac(); if (!c || !hum) return;
  const h = hum; hum = null;
  try {
    h.gain.gain.cancelScheduledValues(c.currentTime);
    h.gain.gain.setValueAtTime(h.gain.gain.value, c.currentTime);
    h.gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.25);
    h.osc.stop(c.currentTime + 0.3); h.osc2.stop(c.currentTime + 0.3);
  } catch {}
}
