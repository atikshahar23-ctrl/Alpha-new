// ──────────────────────────────────────────────────────────────────────────
//  Pikachu voice — FORMANT synthesis so he clearly says "pika pika" / "pikachu"
//
//  Instead of abstract FM "chirps", we synthesise the real syllables:
//    • voiced vowels (i / a / u) shaped with parallel band-pass formant filters
//      driven by a buzzy sawtooth glottal source (with vibrato)
//    • plosive / affricate consonants (p / k / ch) as short filtered-noise bursts
//  Strung together this reads as intelligible "pi-ka pi-ka" and "pi-ka-chuu".
// ──────────────────────────────────────────────────────────────────────────

let volume = 0.6;
let pitch = 1.25;
let pitch = 1.25;          // user slider — multiplies the fundamental
let enabled = true;
let timer: ReturnType<typeof setTimeout> | null = null;

let onChirpStart: (() => void) | null = null;
export function setChirpCallback(fn: (() => void) | null) { onChirpStart = fn; }

// Vowel formant frequencies [F1, F2, F3] in Hz (neutral adult), scaled up below
// for Pikachu's small/cute resonant cavity.
const VOWELS: Record<string, [number, number, number]> = {
  i: [320, 2500, 3100],   // "ee"  — bright, the "pi"
  a: [820, 1300, 2600],   // "ah"  — open, the "ka"
  u: [330, 950, 2400],    // "oo"  — rounded, the "chu"
  e: [560, 1900, 2550],   // "eh"  — spare
};

// Pikachu's voice is small & high → push formants up so it sounds child/critter-like
const FORMANT_SCALE = 1.45;

function makeNoise(ctx: AudioContext, dur: number): AudioBuffer {
  const len = Math.max(1, Math.ceil(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

// A consonant burst: 'p' bilabial, 'k' velar, 'ch' affricate
function consonant(
  ctx: AudioContext, dest: AudioNode,
  type: 'p' | 'k' | 'ch', t: number,
) {
  const dur = type === 'ch' ? 0.075 : 0.022;
  const src = ctx.createBufferSource();
  src.buffer = makeNoise(ctx, dur + 0.03);

  const filt = ctx.createBiquadFilter();
  if (type === 'p') {                       // soft low burst
    filt.type = 'lowpass'; filt.frequency.value = 1400; filt.Q.value = 0.7;
  } else if (type === 'k') {                // mid click
    filt.type = 'bandpass'; filt.frequency.value = 1900; filt.Q.value = 1.1;
  } else {                                  // 'ch' — bright noisy hiss
    filt.type = 'highpass'; filt.frequency.value = 2600; filt.Q.value = 0.6;
  }

  const g = ctx.createGain();
  const peak = volume * (type === 'ch' ? 0.55 : 0.4);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + (type === 'ch' ? 0.02 : 0.005));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  src.connect(filt); filt.connect(g); g.connect(dest);
  src.start(t); src.stop(t + dur + 0.03);
}

// A voiced vowel with formant shaping and a pitch glide (intonation)
function vowel(
  ctx: AudioContext, dest: AudioNode,
  name: keyof typeof VOWELS,
  f0Start: number, f0End: number,
  dur: number, t: number,
) {
  const P = pitch;
  const f = VOWELS[name];

  // glottal source — sawtooth is rich in harmonics for the filters to carve
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(f0Start * P, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, f0End * P), t + dur);

  // a touch of second source detuned for a fuller buzz
  const osc2 = ctx.createOscillator();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(f0Start * P, t);
  osc2.frequency.exponentialRampToValueAtTime(Math.max(40, f0End * P), t + dur);
  osc2.detune.value = 8;
  const osc2g = ctx.createGain(); osc2g.gain.value = 0.25;

  // vibrato for liveliness
  const vib = ctx.createOscillator(); vib.type = 'sine'; vib.frequency.value = 6.5;
  const vibG = ctx.createGain(); vibG.gain.value = f0Start * P * 0.018;
  vib.connect(vibG); vibG.connect(osc.frequency); vibG.connect(osc2.frequency);

  // overall amplitude envelope (vowel onset/sustain/release)
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.linearRampToValueAtTime(volume, t + 0.018);
  env.gain.setValueAtTime(volume * 0.92, t + dur * 0.55);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  // three parallel formant band-pass filters
  const relGains = [1.0, 0.65, 0.28];
  const src = ctx.createGain();              // mix point for the two oscillators
  osc.connect(src);
  osc2.connect(osc2g); osc2g.connect(src);

  for (let i = 0; i < 3; i++) {
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = f[i] * FORMANT_SCALE;
    bp.Q.value = 7 + i * 2.5;
    const fg = ctx.createGain(); fg.gain.value = relGains[i];
    src.connect(bp); bp.connect(fg); fg.connect(env);
  }
  env.connect(dest);

  osc.start(t);  osc.stop(t + dur + 0.03);
  osc2.start(t); osc2.stop(t + dur + 0.03);
  vib.start(t);  vib.stop(t + dur + 0.03);
}

// One syllable = optional consonant onset + a vowel. Returns when the
// syllable ends so the next can be scheduled right after.
function syllable(
  ctx: AudioContext, dest: AudioNode,
  cons: 'p' | 'k' | 'ch' | null,
  vow: keyof typeof VOWELS,
  f0Start: number, f0End: number,
  vowDur: number, t: number,
): number {
  let cursor = t;
  if (cons) {
    consonant(ctx, dest, cons, cursor);
    cursor += cons === 'ch' ? 0.07 : 0.02;   // consonant length before the vowel
  }
  vowel(ctx, dest, vow, f0Start, f0End, vowDur, cursor);
  return cursor + vowDur;
}

// ── Word patterns ──────────────────────────────────────────────────────────

// "pi-ka pi-ka" — two bright rising/falling pairs
function sayPikaPika(ctx: AudioContext, dest: AudioNode) {
  let t = 0;
  t = syllable(ctx, dest, 'p', 'i', 360, 430, 0.12, t);   // pi (rise)
  t = syllable(ctx, dest, 'k', 'a', 430, 350, 0.15, t);   // ka (fall)
  t += 0.10;                                               // small gap
  t = syllable(ctx, dest, 'p', 'i', 370, 440, 0.12, t);   // pi
  t = syllable(ctx, dest, 'k', 'a', 440, 360, 0.16, t);   // ka
}

// "pi-ka-chuu" — classic, with the long rising "chu"
function sayPikachu(ctx: AudioContext, dest: AudioNode) {
  let t = 0;
  t = syllable(ctx, dest, 'p',  'i', 360, 420, 0.11, t);  // pi
  t = syllable(ctx, dest, 'k',  'a', 420, 380, 0.12, t);  // ka
  t = syllable(ctx, dest, 'ch', 'u', 360, 560, 0.30, t);  // chuuu (long rise)
}

// short single "pika"
function sayPika(ctx: AudioContext, dest: AudioNode) {
  let t = 0;
  t = syllable(ctx, dest, 'p', 'i', 380, 450, 0.12, t);
  t = syllable(ctx, dest, 'k', 'a', 450, 360, 0.15, t);
}

// excited "pika pika piiika!" — three pairs, last one stretched up
function sayPikaExcited(ctx: AudioContext, dest: AudioNode) {
  let t = 0;
  t = syllable(ctx, dest, 'p', 'i', 380, 450, 0.10, t);
  t = syllable(ctx, dest, 'k', 'a', 450, 380, 0.12, t);
  t += 0.07;
  t = syllable(ctx, dest, 'p', 'i', 400, 470, 0.10, t);
  t = syllable(ctx, dest, 'k', 'a', 470, 400, 0.12, t);
  t += 0.07;
  t = syllable(ctx, dest, 'p', 'i', 420, 620, 0.26, t);   // piiii rising
}

function playWebAudioPika() {
  onChirpStart?.();
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)() as AudioContext;
    const master = ctx.createGain();
    master.gain.value = 1;
    // gentle final lowpass to keep edges soft / non-harsh
    const soft = ctx.createBiquadFilter();
    soft.type = 'lowpass'; soft.frequency.value = 6500; soft.Q.value = 0.4;
    master.connect(soft); soft.connect(ctx.destination);

    const r = Math.random();
    if      (r < 0.42) sayPikaPika(ctx, master);
    else if (r < 0.74) sayPikachu(ctx, master);
    else if (r < 0.90) sayPika(ctx, master);
    else               sayPikaExcited(ctx, master);

    setTimeout(() => { try { ctx.close(); } catch {} }, 2500);
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
export function pikaSpeak() { playWebAudioPika(); }   // always speak when asked
export function getPikaEnabled() { return enabled; }
export function getPikaVolume() { return volume; }
export function getPikaPitch() { return pitch; }
