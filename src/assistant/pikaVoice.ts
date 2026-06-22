let volume = 0.6;
let enabled = true;
let timer: ReturnType<typeof setTimeout> | null = null;

const lines = [
  'pika pika',
  'pikachu',
  'pika',
  'pika pika pikachu',
  'pikaaaa',
  'pika pi',
  'pikachu pika pika',
  'pika pika pika',
  'chuuuu',
];

function speak(text: string) {
  if (!enabled || typeof speechSynthesis === 'undefined') return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.3;
  u.pitch = 2.0;
  u.volume = volume;
  u.lang = 'ja-JP';
  const voices = speechSynthesis.getVoices();
  const jp = voices.find(v => v.lang.startsWith('ja'));
  const hi = voices.find(v => v.lang.startsWith('ja') && /female|girl/i.test(v.name))
    || jp
    || voices.find(v => /female|girl/i.test(v.name))
    || voices.find(v => v.lang.startsWith('en'));
  if (hi) u.voice = hi;
  speechSynthesis.speak(u);
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
