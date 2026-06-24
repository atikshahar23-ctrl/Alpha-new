let volume = 0.6;
let pitch = 2.0;
let enabled = true;
let timer: ReturnType<typeof setTimeout> | null = null;

let onChirpStart: (() => void) | null = null;
export function setChirpCallback(fn: (() => void) | null) { onChirpStart = fn; }

function playFMChirp(
  freqStart: number,
  freqEnd: number,
  dur: number,
  when: number,
  ctx: AudioContext,
  dest: AudioNode,
) {
  const t = ctx.currentTime + when;
  const carrier = ctx.createOscillator();
  carrier.type = 'sine';
  carrier.frequency.setValueAtTime(freqStart * (pitch / 1.4), t);
  carrier.frequency.exponentialRampToValueAtTime(freqEnd * (pitch / 1.4), t + dur * 0.7);

  const mod = ctx.createOscillator();
  mod.type = 'triangle';
  mod.frequency.setValueAtTime(freqStart * 0.5 * (pitch / 1.4), t);
  const modG = ctx.createGain();
  modG.gain.setValueAtTime(freqStart * 0.35, t);
  modG.gain.exponentialRampToValueAtTime(freqStart * 0.06, t + dur);
  mod.connect(modG);
  modG.connect(carrier.frequency);

  const vib = ctx.createOscillator();
  vib.frequency.value = 10;
  const vibG = ctx.createGain();
  vibG.gain.setValueAtTime(0, t);
  vibG.gain.linearRampToValueAtTime(freqStart * 0.012, t + dur * 0.3);
  vib.connect(vibG);
  vibG.connect(carrier.frequency);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(volume * 0.75, t + 0.012);
  env.gain.setValueAtTime(volume * 0.55, t + dur * 0.45);
  env.gain.exponentialRampToValueAtTime(0.001, t + dur);

  carrier.connect(env);
  env.connect(dest);
  carrier.start(t); carrier.stop(t + dur + 0.02);
  mod.start(t); mod.stop(t + dur + 0.02);
  vib.start(t); vib.stop(t + dur + 0.02);
}

function playPika(ctx: AudioContext, dest: AudioNode) {
  playFMChirp(1175, 1397, 0.09, 0,    ctx, dest);
  playFMChirp(932,  1175, 0.09, 0.13, ctx, dest);
}

function playPikachu(ctx: AudioContext, dest: AudioNode) {
  playFMChirp(1175, 1397, 0.09, 0,    ctx, dest);
  playFMChirp(932,  1175, 0.09, 0.13, ctx, dest);
  playFMChirp(1397, 1760, 0.18, 0.28, ctx, dest);
}

function playHappyChirp(ctx: AudioContext, dest: AudioNode) {
  playFMChirp(880,  1320, 0.07, 0,    ctx, dest);
  playFMChirp(1175, 1760, 0.07, 0.10, ctx, dest);
  playFMChirp(1320, 1980, 0.12, 0.20, ctx, dest);
}

function playCuriousChirp(ctx: AudioContext, dest: AudioNode) {
  playFMChirp(1100, 1650, 0.10, 0,    ctx, dest);
  playFMChirp(1650, 1050, 0.14, 0.15, ctx, dest);
}

function playAckChirp(ctx: AudioContext, dest: AudioNode) {
  playFMChirp(1320, 1320, 0.05, 0,    ctx, dest);
  playFMChirp(1600, 1600, 0.05, 0.10, ctx, dest);
}

function playExcitedBurst(ctx: AudioContext, dest: AudioNode) {
  playFMChirp(1175, 1500, 0.06, 0,    ctx, dest);
  playFMChirp(1400, 1700, 0.06, 0.09, ctx, dest);
  playFMChirp(1600, 2000, 0.06, 0.18, ctx, dest);
  playFMChirp(1900, 2200, 0.10, 0.27, ctx, dest);
}

function playWebAudioPika() {
  onChirpStart?.();
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)() as AudioContext;
    const master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);

    const pattern = Math.random();
    if      (pattern < 0.25) playPika(ctx, master);
    else if (pattern < 0.50) playPikachu(ctx, master);
    else if (pattern < 0.68) playHappyChirp(ctx, master);
    else if (pattern < 0.82) playCuriousChirp(ctx, master);
    else if (pattern < 0.92) playAckChirp(ctx, master);
    else                     playExcitedBurst(ctx, master);

    setTimeout(() => { try { ctx.close(); } catch {} }, 2000);
  } catch {}
}

function playRandom() {
  if (!enabled) return;
  playWebAudioPika();
}

function scheduleNext() {
  if (timer) clearTimeout(timer);
  const delay = 18000 + Math.random() * 28000;
  timer = setTimeout(() => {
    playRandom();
    scheduleNext();
  }, delay);
}

export function startPikaVoice() { scheduleNext(); }
export function stopPikaVoice() { if (timer) { clearTimeout(timer); timer = null; } }
export function setPikaVolume(v: number) { volume = Math.max(0, Math.min(1, v)); }
export function setPikaPitch(v: number) { pitch = Math.max(0.5, Math.min(8.0, v)); }
export function setPikaEnabled(on: boolean) {
  enabled = on;
  if (on) startPikaVoice(); else stopPikaVoice();
}
export function pikaSpeak() { playRandom(); }
export function getPikaEnabled() { return enabled; }
export function getPikaVolume() { return volume; }
export function getPikaPitch() { return pitch; }
