export type ReplyLang = 'en' | 'he' | 'es';
export type MicLang = 'he' | 'en' | 'es';
export type TextLang = 'en' | 'he' | 'ar' | 'ru' | 'fr' | 'es' | 'de' | 'auto';

export type AIProvider = 'puter' | 'gemini' | 'grok' | 'openai';

export type VoiceGender = 'female' | 'male' | 'auto';

export interface AppState {
  key: string;
  grokKey: string;
  openaiKey: string;
  provider: AIProvider;
  puterModel: string;
  name: string;
  micLang: MicLang;
  replyLang: ReplyLang;
  textLang: TextLang;
  history: { role: 'user' | 'model'; parts: { text: string }[] }[];
  voiceOn: boolean;
  voiceGender: VoiceGender;
  voiceSpeed: number;
  voicePitch: number;
  ambLevel: number;
  ambPreset: string;
  sfxOn: boolean;
  wakeOn: boolean;
  theme: 'dark' | 'light';
  fontSize: number;
  haptics: boolean;
  autoSpeak: boolean;
}

const KEY = 'alpha_key', GROK = 'alpha_grok', OPENAI = 'alpha_openai', PROV = 'alpha_provider',
  PUTERMODEL = 'alpha_putermodel',
  NAME = 'alpha_name', MICLANG = 'alpha_micLang', REPLYLANG = 'alpha_replyLang',
  TEXTLANG = 'alpha_textLang', AMB = 'alpha_amb', AMBPRESET = 'alpha_ambpreset',
  SFX = 'alpha_sfx', WAKE = 'alpha_wake',
  VOICE = 'alpha_voice', VGENDER = 'alpha_vgender', VSPEED = 'alpha_vspeed',
  VPITCH = 'alpha_vpitch', THEME = 'alpha_theme', FONTSIZE = 'alpha_fontsize',
  HAPTICS = 'alpha_haptics', AUTOSPEAK = 'alpha_autospeak';

export function loadState(): AppState {
  let amb = parseFloat(localStorage.getItem(AMB) || '');
  if (isNaN(amb)) amb = 0.4;
  let vspeed = parseFloat(localStorage.getItem(VSPEED) || '');
  if (isNaN(vspeed)) vspeed = 1.0;
  let vpitch = parseFloat(localStorage.getItem(VPITCH) || '');
  if (isNaN(vpitch)) vpitch = 1.0;
  let fontSize = parseInt(localStorage.getItem(FONTSIZE) || '');
  if (isNaN(fontSize)) fontSize = 14;
  return {
    key: localStorage.getItem(KEY) || '',
    grokKey: localStorage.getItem(GROK) || '',
    openaiKey: localStorage.getItem(OPENAI) || '',
    provider: (localStorage.getItem(PROV) as AIProvider) || 'puter',
    puterModel: localStorage.getItem(PUTERMODEL) || 'gpt-4o-mini',
    name: localStorage.getItem(NAME) || 'ALPHA',
    micLang: (localStorage.getItem(MICLANG) as MicLang) || 'he',
    replyLang: (localStorage.getItem(REPLYLANG) as ReplyLang) || 'en',
    textLang: (localStorage.getItem(TEXTLANG) as TextLang) || 'auto',
    history: [],
    voiceOn: localStorage.getItem(VOICE) !== '0',
    voiceGender: (localStorage.getItem(VGENDER) as VoiceGender) || 'female',
    voiceSpeed: vspeed,
    voicePitch: vpitch,
    ambLevel: amb,
    ambPreset: localStorage.getItem(AMBPRESET) || 'pad',
    sfxOn: localStorage.getItem(SFX) !== '0',
    wakeOn: localStorage.getItem(WAKE) === '1',
    theme: (localStorage.getItem(THEME) as 'dark' | 'light') || 'dark',
    fontSize,
    haptics: localStorage.getItem(HAPTICS) !== '0',
    autoSpeak: localStorage.getItem(AUTOSPEAK) !== '0',
  };
}

export function saveState(s: AppState) {
  localStorage.setItem(KEY, s.key);
  localStorage.setItem(GROK, s.grokKey);
  localStorage.setItem(OPENAI, s.openaiKey);
  localStorage.setItem(PROV, s.provider);
  localStorage.setItem(PUTERMODEL, s.puterModel);
  localStorage.setItem(NAME, s.name);
  localStorage.setItem(MICLANG, s.micLang);
  localStorage.setItem(REPLYLANG, s.replyLang);
  localStorage.setItem(TEXTLANG, s.textLang);
  localStorage.setItem(AMB, s.ambLevel.toFixed(2));
  localStorage.setItem(AMBPRESET, s.ambPreset);
  localStorage.setItem(SFX, s.sfxOn ? '1' : '0');
  localStorage.setItem(WAKE, s.wakeOn ? '1' : '0');
  localStorage.setItem(VOICE, s.voiceOn ? '1' : '0');
  localStorage.setItem(VGENDER, s.voiceGender);
  localStorage.setItem(VSPEED, s.voiceSpeed.toFixed(2));
  localStorage.setItem(VPITCH, s.voicePitch.toFixed(2));
  localStorage.setItem(THEME, s.theme);
  localStorage.setItem(FONTSIZE, String(s.fontSize));
  localStorage.setItem(HAPTICS, s.haptics ? '1' : '0');
  localStorage.setItem(AUTOSPEAK, s.autoSpeak ? '1' : '0');
}

export interface CalEvent { id: string; title: string; date: string; time: string }

function loadAlphaEvents(): CalEvent[] {
  try { return JSON.parse(localStorage.getItem('alpha_events') || '[]'); } catch { return []; }
}

export function loadEvents(): CalEvent[] {
  const alpha = loadAlphaEvents();
  let hg: CalEvent[] = [];
  try {
    const tasks: { id: string; title: string; date: string; done: boolean }[] = JSON.parse(localStorage.getItem('hg2:tasks') || '[]');
    hg = tasks
      .filter(t => t.date && !t.done)
      .map(t => ({ id: 'hg:' + t.id, title: t.title, date: t.date, time: '' }));
  } catch {}
  const alphaKeys = new Set(alpha.map(e => e.title.toLowerCase() + '|' + e.date));
  const unique = hg.filter(t => !alphaKeys.has(t.title.toLowerCase() + '|' + t.date));
  return [...alpha, ...unique].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export function saveEvents(ev: CalEvent[]) {
  localStorage.setItem('alpha_events', JSON.stringify(ev.filter(e => !e.id.startsWith('hg:'))));
}

export function removeEvent(id: string) {
  if (id.startsWith('hg:')) {
    const hgId = id.slice(3);
    try {
      const tasks = JSON.parse(localStorage.getItem('hg2:tasks') || '[]');
      localStorage.setItem('hg2:tasks', JSON.stringify(tasks.filter((t: { id: string }) => t.id !== hgId)));
    } catch {}
  } else {
    const ev = loadAlphaEvents();
    saveEvents(ev.filter(e => e.id !== id));
  }
}

export function addEvent(title: string, date: string, time: string) {
  const ev = loadAlphaEvents();
  ev.push({ id: Date.now() + '_' + Math.random(), title, date, time: time || '' });
  ev.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  localStorage.setItem('alpha_events', JSON.stringify(ev));
  try {
    const tasks = JSON.parse(localStorage.getItem('hg2:tasks') || '[]');
    if (!tasks.some((t: { title: string; date: string }) => t.title === title && t.date === date)) {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      tasks.unshift({ id, title, date, done: false, ts: Date.now() });
      localStorage.setItem('hg2:tasks', JSON.stringify(tasks));
    }
  } catch {}
  return loadEvents();
}

export function upcomingText(): string {
  const today = new Date().toISOString().slice(0, 10);
  const ev = loadEvents().filter(e => e.date >= today).slice(0, 10);
  return ev.length ? ev.map(e => `${e.date} ${e.time} ${e.title}`).join(' ; ') : 'empty';
}

// --- TASKS ---
export interface Task { id: string; text: string; done: boolean; created: string; priority: 'low' | 'med' | 'high' }

export function loadTasks(): Task[] {
  try { return JSON.parse(localStorage.getItem('alpha_tasks') || '[]'); } catch { return []; }
}
export function saveTasks(t: Task[]) { localStorage.setItem('alpha_tasks', JSON.stringify(t)); }
export function addTask(text: string, priority: 'low' | 'med' | 'high' = 'med'): Task[] {
  const tasks = loadTasks();
  tasks.push({ id: Date.now() + '_' + Math.random(), text, done: false, created: new Date().toISOString().slice(0, 10), priority });
  saveTasks(tasks);
  return tasks;
}
export function toggleTask(id: string): Task[] {
  const tasks = loadTasks();
  const t = tasks.find(x => x.id === id);
  if (t) t.done = !t.done;
  saveTasks(tasks);
  return tasks;
}
export function removeTask(id: string): Task[] {
  const tasks = loadTasks().filter(x => x.id !== id);
  saveTasks(tasks);
  return tasks;
}

// --- NOTES ---
export function loadNotes(): string[] {
  try { return JSON.parse(localStorage.getItem('alpha_notes') || '[]'); } catch { return []; }
}
export function saveNote(note: string) {
  const notes = loadNotes();
  notes.unshift(note);
  if (notes.length > 50) notes.length = 50;
  localStorage.setItem('alpha_notes', JSON.stringify(notes));
}
export function clearNotes() { localStorage.setItem('alpha_notes', '[]'); }
