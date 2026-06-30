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
  bulbasaur:  { scale: 0.88, source: 'sawtooth', vibRate: 4.0, rasp: 0.40, lowpass: 4500 },
  eevee:      { scale: 1.55, source: 'sine',     vibRate: 7.5, rasp: 0.0,  lowpass: 7500 },
  mewtwo:     { scale: 0.68, source: 'sawtooth', vibRate: 3.0, rasp: 0.08, lowpass: 3800 },
  articuno:   { scale: 1.10, source: 'sine',     vibRate: 5.0, rasp: 0.02, lowpass: 8000 },
  suicune:    { scale: 1.00, source: 'sine',     vibRate: 4.5, rasp: 0.05, lowpass: 7000 },
  raikou:     { scale: 0.90, source: 'sawtooth', vibRate: 8.0, rasp: 0.25, lowpass: 5500 },
  entei:      { scale: 0.75, source: 'sawtooth', vibRate: 3.5, rasp: 0.50, lowpass: 4200 },
  moltres:    { scale: 0.92, source: 'sawtooth', vibRate: 5.0, rasp: 0.45, lowpass: 4800 },
  zapdos:     { scale: 0.95, source: 'square',   vibRate: 9.5, rasp: 0.18, lowpass: 5800 },
  lugia:      { scale: 0.72, source: 'sine',     vibRate: 3.2, rasp: 0.04, lowpass: 5000 },
  'ho-oh':    { scale: 0.80, source: 'sawtooth', vibRate: 4.8, rasp: 0.30, lowpass: 4600 },
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
    case 'bulbasaur':  // deep "bul-ba"
      t = syl(ctx, master, v, null, 'u', 200, 180, 0.20, t);
      t = syl(ctx, master, v, null, 'a', 180, 160, 0.22, t);
      break;
    case 'eevee':      // soft "ee-vee"
      t = syl(ctx, master, v, null, 'i', 520, 580, 0.14, t);
      t = syl(ctx, master, v, null, 'i', 580, 520, 0.16, t);
      break;
    case 'mewtwo':     // deep psychic "mew"
      t = syl(ctx, master, v, 'm', 'u', 160, 140, 0.28, t);
      t = syl(ctx, master, v, null, 'u', 140, 120, 0.18, t);
      break;
    case 'articuno':   // icy "ar-ti-cu-no"
      t = syl(ctx, master, v, null, 'a', 380, 420, 0.12, t);
      t = syl(ctx, master, v, 't', 'i', 420, 460, 0.10, t);
      t = syl(ctx, master, v, 'k', 'u', 380, 340, 0.12, t);
      break;
    case 'suicune':    // flowing "swee-cune"
      t = syl(ctx, master, v, 's', 'i', 400, 450, 0.14, t);
      t = syl(ctx, master, v, 'k', 'u', 450, 380, 0.18, t);
      break;
    case 'raikou':     // thunder bark "rai-kou"
      t = syl(ctx, master, v, null, 'a', 280, 380, 0.10, t);
      t = syl(ctx, master, v, 'k', 'o', 380, 240, 0.16, t);
      break;
    case 'entei':      // volcanic roar "en-tei"
      t = syl(ctx, master, v, null, 'e', 220, 260, 0.18, t);
      t = syl(ctx, master, v, 't', 'a', 260, 180, 0.22, t);
      break;
    case 'moltres':    // fire screech "mol-tres"
      t = syl(ctx, master, v, 'm', 'o', 260, 300, 0.14, t);
      t = syl(ctx, master, v, 't', 'r', 300, 220, 0.18, t);
      break;
    case 'zapdos':     // electric shriek "zap"
      t = syl(ctx, master, v, 's', 'a', 320, 480, 0.08, t);
      t = syl(ctx, master, v, 'p', 'o', 480, 300, 0.12, t);
      break;
    case 'lugia':      // deep resonant "lu-gi-a"
      t = syl(ctx, master, v, null, 'u', 180, 160, 0.22, t);
      t = syl(ctx, master, v, null, 'i', 160, 200, 0.14, t);
      t = syl(ctx, master, v, null, 'a', 200, 160, 0.20, t);
      break;
    case 'ho-oh':      // sacred call "ho-oh"
      t = syl(ctx, master, v, null, 'o', 240, 280, 0.20, t);
      t = syl(ctx, master, v, null, 'o', 280, 200, 0.22, t);
      break;
    default:           // generic
      t = syl(ctx, master, v, 'p', 'i', 360, 430, 0.12, t);
      t = syl(ctx, master, v, 'k', 'a', 430, 350, 0.15, t);
  }
}

export function setCharacterVolume(val: number) { volume = Math.max(0, Math.min(1, val)); }
export function unlockCharacterAudio() { try { getCtx(); } catch {} }

// Real cry audio files from PokeAPI CDN (OGG format, works in all modern browsers).
// IDs from the national Pokédex — same ones used for sprites.
const POKE_CRY_IDS: Record<string, number> = {
  charmander: 4, squirtle: 7, meowth: 52, bulbasaur: 1,
  eevee: 133, mewtwo: 150, articuno: 144, suicune: 245, raikou: 243,
  entei: 244, moltres: 146, zapdos: 145, lugia: 249, 'ho-oh': 250,
  pikachu: 25,
};
const CRY_CACHE = new Map<string, AudioBuffer>();
async function fetchCry(charId: string): Promise<AudioBuffer | null> {
  if (CRY_CACHE.has(charId)) return CRY_CACHE.get(charId)!;
  const id = POKE_CRY_IDS[charId]; if (!id) return null;
  try {
    const url = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    const ctx = getCtx();
    const buf = await ctx.decodeAudioData(ab);
    CRY_CACHE.set(charId, buf);
    return buf;
  } catch { return null; }
}
async function playRealCry(charId: string): Promise<boolean> {
  try {
    const buf = await fetchCry(charId);
    if (!buf) return false;
    const ctx = getCtx();
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = Math.min(1, volume * 1.1);
    src.connect(gain); gain.connect(ctx.destination);
    src.start();
    return true;
  } catch { return false; }
}

// Play a character's cry once — tries real audio first, falls back to synthesis.
// Pikachu's idle timer is separate (pikaVoice.ts), but one-shot cries work for all.
export function playCharacterCry(charId = activeChar) {
  if (!enabled) return;
  playRealCry(charId).then(ok => {
    if (!ok && charId !== 'pikachu') { try { cry(charId); } catch {} }
  });
}

function scheduleNext() {
  if (timer) clearTimeout(timer);
  const delay = 18000 + Math.random() * 30000;
  timer = setTimeout(() => { playCharacterCry(activeChar); scheduleNext(); }, delay);
}

// Switch the active character. Non-pikachu characters run periodic idle cries here;
// Pikachu's idle chirps are handled by pikaVoice.ts to avoid duplication.
export function setActiveCharacter(charId: string) {
  activeChar = charId;
  if (timer) { clearTimeout(timer); timer = null; }
  if (enabled && charId !== 'pikachu') scheduleNext();
}
export function stopCharacterVoice() { if (timer) { clearTimeout(timer); timer = null; } }
// Master on/off for ALL character cries — stops the idle loop immediately when
// off, resumes it for the active character when on.
export function setCharacterVoiceEnabled(on: boolean) {
  enabled = on;
  if (!on) { if (timer) { clearTimeout(timer); timer = null; } }
  else if (activeChar !== 'pikachu') scheduleNext();
}
export function getActiveCharacter() { return activeChar; }
