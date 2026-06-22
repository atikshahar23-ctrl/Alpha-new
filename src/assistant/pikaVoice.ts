let ctx: AudioContext | null = null;
let volume = 0.6;
let enabled = true;
let timer: ReturnType<typeof setTimeout> | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playPikaSound(phrase: 'pika' | 'pikachu' | 'pikapi' | 'chaaa') {
  if (!enabled) return;
  const ac = getCtx();
  if (ac.state === 'suspended') ac.resume();
  const gain = ac.createGain();
  gain.connect(ac.destination);
  gain.gain.value = volume;

  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const formant = ac.createBiquadFilter();
  formant.type = 'bandpass';
  formant.Q.value = 5;

  const env = ac.createGain();
  osc.connect(formant);
  formant.connect(env);
  env.connect(gain);

  osc.type = 'sawtooth';

  switch (phrase) {
    case 'pika': {
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(1100, now + 0.12);
      osc.frequency.setValueAtTime(800, now + 0.18);
      osc.frequency.linearRampToValueAtTime(1100, now + 0.30);
      formant.frequency.setValueAtTime(1200, now);
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(0.35, now + 0.03);
      env.gain.linearRampToValueAtTime(0.1, now + 0.14);
      env.gain.linearRampToValueAtTime(0.35, now + 0.18);
      env.gain.linearRampToValueAtTime(0.0, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.36);
      break;
    }
    case 'pikachu': {
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(1100, now + 0.12);
      osc.frequency.setValueAtTime(800, now + 0.18);
      osc.frequency.linearRampToValueAtTime(1100, now + 0.30);
      osc.frequency.linearRampToValueAtTime(600, now + 0.35);
      osc.frequency.linearRampToValueAtTime(1400, now + 0.55);
      formant.frequency.setValueAtTime(1200, now);
      formant.frequency.setValueAtTime(2500, now + 0.35);
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(0.3, now + 0.03);
      env.gain.linearRampToValueAtTime(0.08, now + 0.14);
      env.gain.linearRampToValueAtTime(0.3, now + 0.18);
      env.gain.linearRampToValueAtTime(0.1, now + 0.32);
      env.gain.linearRampToValueAtTime(0.4, now + 0.38);
      env.gain.linearRampToValueAtTime(0.0, now + 0.60);
      osc.start(now);
      osc.stop(now + 0.61);
      break;
    }
    case 'pikapi': {
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.linearRampToValueAtTime(1000, now + 0.10);
      osc.frequency.setValueAtTime(750, now + 0.15);
      osc.frequency.linearRampToValueAtTime(1050, now + 0.25);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.35);
      formant.frequency.setValueAtTime(1200, now);
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(0.3, now + 0.03);
      env.gain.linearRampToValueAtTime(0.08, now + 0.12);
      env.gain.linearRampToValueAtTime(0.3, now + 0.15);
      env.gain.linearRampToValueAtTime(0.1, now + 0.22);
      env.gain.linearRampToValueAtTime(0.35, now + 0.28);
      env.gain.linearRampToValueAtTime(0.0, now + 0.40);
      osc.start(now);
      osc.stop(now + 0.41);
      break;
    }
    case 'chaaa': {
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(1500, now + 0.25);
      osc.frequency.linearRampToValueAtTime(1800, now + 0.5);
      formant.frequency.setValueAtTime(2000, now);
      formant.Q.value = 3;
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(0.45, now + 0.05);
      env.gain.setValueAtTime(0.45, now + 0.3);
      env.gain.linearRampToValueAtTime(0.0, now + 0.55);
      osc.start(now);
      osc.stop(now + 0.56);

      const noise = ac.createBufferSource();
      const buf = ac.createBuffer(1, ac.sampleRate * 0.4, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() - 0.5) * 0.3;
      noise.buffer = buf;
      const nGain = ac.createGain();
      nGain.gain.setValueAtTime(0, now + 0.15);
      nGain.gain.linearRampToValueAtTime(0.15 * volume, now + 0.25);
      nGain.gain.linearRampToValueAtTime(0, now + 0.55);
      noise.connect(nGain);
      nGain.connect(gain);
      noise.start(now + 0.15);
      noise.stop(now + 0.56);
      break;
    }
  }
}

const phrases: (() => void)[] = [
  () => playPikaSound('pika'),
  () => playPikaSound('pikachu'),
  () => playPikaSound('pikapi'),
  () => { playPikaSound('pika'); setTimeout(() => playPikaSound('pika'), 400); },
  () => { playPikaSound('pika'); setTimeout(() => playPikaSound('pikachu'), 400); },
  () => { playPikaSound('pika'); setTimeout(() => playPikaSound('pika'), 350); setTimeout(() => playPikaSound('pikachu'), 750); },
  () => playPikaSound('chaaa'),
];

function playRandom() {
  if (!enabled) return;
  phrases[Math.floor(Math.random() * phrases.length)]();
}

function scheduleNext() {
  if (timer) clearTimeout(timer);
  const delay = 12000 + Math.random() * 25000;
  timer = setTimeout(() => {
    playRandom();
    scheduleNext();
  }, delay);
}

export function startPikaVoice() {
  scheduleNext();
}

export function stopPikaVoice() {
  if (timer) { clearTimeout(timer); timer = null; }
}

export function setPikaVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
}

export function setPikaEnabled(on: boolean) {
  enabled = on;
  if (on) { startPikaVoice(); } else { stopPikaVoice(); }
}

export function pikaSpeak() {
  playRandom();
}

export function getPikaEnabled() { return enabled; }
export function getPikaVolume() { return volume; }
