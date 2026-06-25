// ──────────────────────────────────────────────────────────────────────────
//  Character voices — synthesized cries for the swappable main characters.
//
//  Same formant-synthesis approach as pikaVoice.ts (no audio samples, works
//  offline, no copyright). Each character has a distinct timbre so it clearly
//  "speaks" its own cry. When the main character is NOT Pikachu, Pikachu's
//  voice is muted and the active character does its cries instead.
// ──────────────────────────────────────────────────────────────────────────

let volume = 0.6;
let enabled = true;
let activeChar = 'pikachu';
let timer: ReturnType<typeof setTimeout> | null = null;

let _ctx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (_ctx.state === 'suspended') _ctx.resume().catch(() => {});
  return _ctx;
}

type Vowel = [number, number, number]; // formants F1,F2,F3 (Hz)
const VOWELS: Record<string, Vowel> = {
  i: [320, 2500, 3100], a: [820, 1300, 2600], u: [330, 950, 2400],
  e: [560, 1900, 2550], o: [500, 900, 2500], r: [490, 1350, 1700],
};

function noiseBuf(ctx: AudioContext, dur: number): AudioBuffer {
  const len = Math.max(1, Math.ceil(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

interface Voice {
  scale: number;       // formant scale (higher = smaller/cuter)
  source: OscillatorType;
  vibRate: number;
  rasp: number;        // 0..1 added noise (growl)
  lowpass: number;     // master tone
}
const VOICES: Record<string, Voice> = {
  charmander: { scale: 1.05, source: 'sawtooth', vibRate: 5.5, rasp: 0.35, lowpass: 5200 },
  squirtle:   { scale: 1.5,  source: 'square',   vibRate: 9.0, rasp: 0.05, lowpass: 7000 },
  meowth:     { scale: 1.25, source: 'sawtooth', vibRate: 6.0, rasp: 0.12, lowpass: 6000 },
  pikachu:    { scale: 1.45, source: 'sawtooth', vibRate: 6.5, rasp: 0.0,  lowpass: 6500 },
};

function consonant(ctx: AudioContext, dest: AudioNode, type: 'p'|'k'|'ch'|'t'|'s'|'m', t: number) {
  const dur = (type === 'ch' || type === 's') ? 0.08 : 0.025;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf(ctx, dur + 0.03);
  const filt = ctx.createBiquadFilter();
  if (type === 'p' || type === 'm') { filt.type = 'lowpass'; filt.frequency.value = 1300; }
  else if (type === 'k' || type === 't') { filt.type = 'bandpass'; filt.frequency.value = 2000; filt.Q.value = 1.1; }
  else { filt.type = 'highpass'; filt.frequency.value = 2600; filt.Q.value = 0.6; } // ch / s
  const g = ctx.createGain();
  const peak = volume * 0.45;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filt); filt.connect(g); g.connect(dest);
  src.start(t); src.stop(t + dur + 0.03);
}

function vowel(ctx: AudioContext, dest: AudioNode, v: Voice, name: keyof typeof VOWELS,
               f0a: number, f0b: number, dur: number, t: number) {
  const f = VOWELS[name];
  const osc = ctx.createOscillator();
  osc.type = v.source;
  osc.frequency.setValueAtTime(f0a, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, f0b), t + dur);

  const vib = ctx.createOscillator(); vib.type = 'sine'; vib.frequency.value = v.vibRate;
  const vibG = ctx.createGain(); vibG.gain.value = f0a * 0.02;
  vib.connect(vibG); vibG.connect(osc.frequency);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.linearRampToValueAtTime(volume, t + 0.02);
  env.gain.setValueAtTime(volume * 0.9, t + dur * 0.55);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  const mix = ctx.createGain();
  osc.connect(mix);
  // optional rasp (growl) — noise blended in for fiery/cat voices
  if (v.rasp > 0) {
    const ns = ctx.createBufferSource(); ns.buffer = noiseBuf(ctx, dur + 0.05);
    const ng = ctx.createGain(); ng.gain.value = v.rasp * 0.4;
    ns.connect(ng); ng.connect(mix); ns.start(t); ns.stop(t + dur + 0.03);
  }
  const relGains = [1.0, 0.65, 0.28];
  for (let i = 0; i < 3; i++) {
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = f[i] * v.scale; bp.Q.value = 7 + i * 2.5;
    const fg = ctx.createGain(); fg.gain.value = relGains[i];
    mix.connect(bp); bp.connect(fg); fg.connect(env);
  }
  env.connect(dest);
  osc.start(t); osc.stop(t + dur + 0.03);
  vib.start(t); vib.stop(t + dur + 0.03);
}

function syl(ctx: AudioContext, dest: AudioNode, v: Voice, cons: any, vow: keyof typeof VOWELS,
             f0a: number, f0b: number, dur: number, t: number): number {
  let c = t;
  if (cons) { consonant(ctx, dest, cons, c); c += (cons === 'ch' || cons === 's') ? 0.07 : 0.022; }
  vowel(ctx, dest, v, vow, f0a, f0b, dur, c);
  return c + dur;
}

// Per-character cry patterns.
function cry(charId: string) {
  const v = VOICES[charId] || VOICES.pikachu;
  const ctx = getCtx();
  const master = ctx.createGain(); master.gain.value = 1;
  const soft = ctx.createBiquadFilter(); soft.type = 'lowpass'; soft.frequency.value = v.lowpass; soft.Q.value = 0.4;
  master.connect(soft); soft.connect(ctx.destination);
  let t = ctx.currentTime + 0.01;
  switch (charId) {
    case 'charmander': // low growly "chaa-rr"
      t = syl(ctx, master, v, 'ch', 'a', 250, 200, 0.22, t);
      t = syl(ctx, master, v, null, 'r', 200, 160, 0.20, t);
      break;
    case 'squirtle':   // bubbly "squir-tle"
      t = syl(ctx, master, v, 's', 'i', 520, 600, 0.10, t);
      t = syl(ctx, master, v, 'k', 'u', 600, 500, 0.12, t);
      t = syl(ctx, master, v, 't', 'e', 480, 560, 0.14, t);
      break;
    case 'meowth':     // cat "me-ow-th"
      t = syl(ctx, master, v, 'm', 'e', 480, 560, 0.12, t);
      t = syl(ctx, master, v, null, 'a', 560, 360, 0.16, t);
      t = syl(ctx, master, v, null, 'u', 360, 300, 0.18, t);
      t = syl(ctx, master, v, 's', 'i', 420, 420, 0.06, t);
      break;
    default:           // generic
      t = syl(ctx, master, v, 'p', 'i', 360, 430, 0.12, t);
      t = syl(ctx, master, v, 'k', 'a', 430, 350, 0.15, t);
  }
}

export function setCharacterVolume(val: number) { volume = Math.max(0, Math.min(1, val)); }
export function unlockCharacterAudio() { try { getCtx(); } catch {} }

// Play the active character's cry once.
export function playCharacterCry(charId = activeChar) {
  if (!enabled || charId === 'pikachu') return;
  try { cry(charId); } catch {}
}

function scheduleNext() {
  if (timer) clearTimeout(timer);
  const delay = 16000 + Math.random() * 26000;
  timer = setTimeout(() => { playCharacterCry(activeChar); scheduleNext(); }, delay);
}

// Switch the active character. When non-Pikachu, periodic idle cries run; the
// caller is responsible for muting Pikachu's own voice.
export function setActiveCharacter(charId: string) {
  activeChar = charId;
  if (timer) { clearTimeout(timer); timer = null; }
  if (charId !== 'pikachu') scheduleNext();
}
export function stopCharacterVoice() { if (timer) { clearTimeout(timer); timer = null; } }
export function getActiveCharacter() { return activeChar; }
