export type ReplyLang = 'en' | 'he';
export type MicLang = 'he' | 'en';
export type TextLang = 'en' | 'he' | 'ar' | 'ru' | 'fr' | 'es' | 'de' | 'auto';

export interface AppState {
  key: string;
  name: string;
  micLang: MicLang;
  replyLang: ReplyLang;
  textLang: TextLang;
  history: { role: 'user' | 'model'; parts: { text: string }[] }[];
  voiceOn: boolean;
  ambLevel: number;
  sfxOn: boolean;
  wakeOn: boolean;
}

const KEY = 'alpha_key', NAME = 'alpha_name', MICLANG = 'alpha_micLang', REPLYLANG = 'alpha_replyLang',
  TEXTLANG = 'alpha_textLang', AMB = 'alpha_amb', SFX = 'alpha_sfx', WAKE = 'alpha_wake';

export function loadState(): AppState {
  let amb = parseFloat(localStorage.getItem(AMB) || '');
  if (isNaN(amb)) amb = 0.4;
  return {
    key: localStorage.getItem(KEY) || '',
    name: localStorage.getItem(NAME) || 'ALPHA',
    micLang: (localStorage.getItem(MICLANG) as MicLang) || 'he',
    replyLang: (localStorage.getItem(REPLYLANG) as ReplyLang) || 'en',
    textLang: (localStorage.getItem(TEXTLANG) as TextLang) || 'auto',
    history: [],
    voiceOn: true,
    ambLevel: amb,
    sfxOn: localStorage.getItem(SFX) !== '0',
    wakeOn: localStorage.getItem(WAKE) === '1',
  };
}

export function saveState(s: AppState) {
  localStorage.setItem(KEY, s.key);
  localStorage.setItem(NAME, s.name);
  localStorage.setItem(MICLANG, s.micLang);
  localStorage.setItem(REPLYLANG, s.replyLang);
  localStorage.setItem(TEXTLANG, s.textLang);
  localStorage.setItem(AMB, s.ambLevel.toFixed(2));
  localStorage.setItem(SFX, s.sfxOn ? '1' : '0');
  localStorage.setItem(WAKE, s.wakeOn ? '1' : '0');
}

export interface CalEvent { id: string; title: string; date: string; time: string }

export function loadEvents(): CalEvent[] {
  try { return JSON.parse(localStorage.getItem('alpha_events') || '[]'); } catch { return []; }
}
export function saveEvents(ev: CalEvent[]) {
  localStorage.setItem('alpha_events', JSON.stringify(ev));
}
export function addEvent(title: string, date: string, time: string) {
  const ev = loadEvents();
  ev.push({ id: Date.now() + '_' + Math.random(), title, date, time: time || '' });
  ev.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  saveEvents(ev);
  return ev;
}
export function upcomingText(): string {
  const today = new Date().toISOString().slice(0, 10);
  const ev = loadEvents().filter(e => e.date >= today).slice(0, 10);
  return ev.length ? ev.map(e => `${e.date} ${e.time} ${e.title}`).join(' ; ') : 'empty';
}
