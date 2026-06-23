let volume = 0.6;
let pitch = 1.4;
let enabled = true;
let timer: ReturnType<typeof setTimeout> | null = null;

const lines = [
  'pika pika',
  'pikachu',
];

if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.getVoices();
  speechSynthesis.addEventListener('voiceschanged', () => { speechSynthesis.getVoices(); }, { once: true });
}

function findVoice(): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return undefined;
  return voices.find(v => v.lang.startsWith('en') && /female|samantha|victoria|zira|karen|fiona/i.test(v.name))
    || voices.find(v => v.lang.startsWith('en') && !/male/i.test(v.name))
    || voices.find(v => v.lang.startsWith('en'))
    || voices.find(v => /female/i.test(v.name))
    || voices[0];
}

function playWebAudioPika() {
  try {
    const ac = new AudioContext();
    const master = ac.createGain();
    master.gain.setValueAtTime(volume * 0.5, ac.currentTime);
    master.connect(ac.destination);

    const baseMult = pitch / 1.4;
    const notes = [
      { freq: 880 * baseMult, dur: 0.09, t: 0 },
      { freq: 698 * baseMult, dur: 0.09, t: 0.11 },
      { freq: 880 * baseMult, dur: 0.09, t: 0.28 },
      { freq: 698 * baseMult, dur: 0.09, t: 0.39 },
      { freq: 988 * baseMult, dur: 0.18, t: 0.56 },
    ];

    for (const n of notes) {
      const osc = ac.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = n.freq;
      const g = ac.createGain();
      const start = ac.currentTime + n.t;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.8, start + 0.01);
      g.gain.setValueAtTime(0.6, start + n.dur * 0.5);
      g.gain.exponentialRampToValueAtTime(0.001, start + n.dur);
      osc.connect(g);
      g.connect(master);
      osc.start(start);
      osc.stop(start + n.dur + 0.01);
    }
    setTimeout(() => ac.close(), 2000);
  } catch {}
}

function speak(text: string) {
  if (!enabled) return;

  if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.pitch = pitch;
    u.rate = 1.0;
    u.volume = volume;
    const voice = findVoice();
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);

    try {
      const ac = new AudioContext();
      const g = ac.createGain();
      g.gain.setValueAtTime(volume * 0.12, ac.currentTime);
      g.connect(ac.destination);
      const sparkles = [
        { freq: 1200, t: 0 },
        { freq: 1600, t: 0.07 },
        { freq: 1400, t: text.length * 0.06 },
        { freq: 1800, t: text.length * 0.06 + 0.07 },
      ];
      for (const s of sparkles) {
        const osc = ac.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = s.freq;
        const sg = ac.createGain();
        const st = ac.currentTime + s.t;
        sg.gain.setValueAtTime(0, st);
        sg.gain.linearRampToValueAtTime(1, st + 0.005);
        sg.gain.exponentialRampToValueAtTime(0.001, st + 0.06);
        osc.connect(sg);
        sg.connect(g);
        osc.start(st);
        osc.stop(st + 0.07);
      }
      setTimeout(() => ac.close(), 2000);
    } catch {}
    return;
  }

  playWebAudioPika();
}

function playRandom() {
  if (!enabled) return;
  speak(lines[Math.floor(Math.random() * lines.length)]);
}

function scheduleNext() {
  if (timer) clearTimeout(timer);
  const delay = 15000 + Math.random() * 30000;
  timer = setTimeout(() => {
    playRandom();
    scheduleNext();
  }, delay);
}

export function startPikaVoice() { scheduleNext(); }
export function stopPikaVoice() { if (timer) { clearTimeout(timer); timer = null; } }
export function setPikaVolume(v: number) { volume = Math.max(0, Math.min(1, v)); }
export function setPikaPitch(v: number) { pitch = Math.max(0.5, Math.min(2.0, v)); }
export function setPikaEnabled(on: boolean) {
  enabled = on;
  if (on) startPikaVoice(); else stopPikaVoice();
}
export function pikaSpeak() { playRandom(); }
export function getPikaEnabled() { return enabled; }
export function getPikaVolume() { return volume; }
export function getPikaPitch() { return pitch; }
