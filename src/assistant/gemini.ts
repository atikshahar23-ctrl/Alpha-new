import type { AppState } from './state';
import { upcomingText } from './state';

const MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
];

let activeModel = 0;
let busy = false;
const modelCooldowns: number[] = [0, 0, 0];
const COOLDOWN_MS = 5000;

const LANG_INSTRUCTIONS: Record<string, string> = {
  en: 'ALWAYS reply in fluent, natural, warm English. Short, conversational sentences like a person speaking aloud.',
  he: 'ענה תמיד בעברית טבעית, רהוטה ונקייה — דיבור אנושי וזורם, לא מילולי ולא רובוטי. משפטים קצרים כמו בשיחה.',
  ar: 'أجب دائماً بالعربية الفصحى السلسة والطبيعية. جمل قصيرة وحوارية.',
  ru: 'Всегда отвечай на естественном, тёплом русском языке. Короткие, разговорные предложения.',
  fr: 'Réponds toujours en français naturel, chaleureux et fluide. Phrases courtes et conversationnelles.',
  es: 'Responde siempre en español natural, cálido y fluido. Frases cortas y conversacionales.',
  de: 'Antworte immer auf natürlichem, warmem Deutsch. Kurze, gesprächige Sätze.',
};

export function systemPrompt(state: AppState): string {
  const d = new Date();
  const today = d.toISOString().slice(0, 10);
  const wd = d.toLocaleDateString('en-US', { weekday: 'long' });
  const textLang = state.textLang === 'auto' ? state.replyLang : state.textLang;
  const langLine = LANG_INSTRUCTIONS[textLang] || LANG_INSTRUCTIONS['en'];
  return `You are ${state.name}, an advanced personal assistant with a calm, warm, confident presence. ${langLine} No long lists or tables.
Today is ${wd}, ${today}.
Control the app via tags at the END of your reply when relevant (never mention them in your spoken text):
- video: [[VIDEO: search terms]]
- web search: [[SEARCH: query]]
- add a calendar event: [[EVENT: title | YYYY-MM-DD | HH:MM]]
- open the calendar: [[CALENDAR]]
- play music on Spotify: [[SPOTIFY: song or artist name]]
User's calendar: ${upcomingText()}.`;
}

async function tryModel(model: string, state: AppState): Promise<{ ok: true; reply: string } | { ok: false; canFallback: boolean; msg: string }> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': state.key },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt(state) }] },
        contents: state.history.slice(-8),
        generationConfig: { temperature: 0.8, maxOutputTokens: 500 },
      }),
    }
  );
  if (!res.ok) {
    const code = res.status;
    let msg = '';
    let canFallback = false;
    try {
      const e = await res.json();
      const errMsg = e?.error?.message || '';
      const lower = errMsg.toLowerCase();
      if (code === 429 || lower.includes('quota') || lower.includes('rate')) {
        canFallback = true;
        msg = `${model} quota exceeded`;
      } else if (code === 401 || code === 403 || lower.includes('credential') || lower.includes('not found') || lower.includes('not supported')) {
        canFallback = true;
        msg = `${model} not available`;
      } else if (code === 400) msg = 'Bad request — check your API key.';
      else msg = errMsg || `Error ${code}`;
    } catch { msg = `Error ${code}`; }
    return { ok: false, canFallback, msg };
  }
  const data = await res.json();
  const reply: string = (data.candidates?.[0]?.content?.parts || [])
    .map((p: any) => p.text || '')
    .join('')
    .trim() || '…';
  return { ok: true, reply };
}

export async function askGemini(state: AppState, text: string): Promise<string> {
  if (busy) throw new Error('Please wait for the current request to finish.');
  busy = true;

  state.history.push({ role: 'user', parts: [{ text }] });

  try {
    const now = Date.now();
    // Try the last working model first, then fall back to others — skip models on cooldown
    const order = [activeModel, ...MODELS.map((_, i) => i).filter(i => i !== activeModel)];

    for (const idx of order) {
      if (now < modelCooldowns[idx]) continue;
      const model = MODELS[idx];
      const result = await tryModel(model, state);
      if (result.ok) {
        activeModel = idx;
        state.history.push({ role: 'model', parts: [{ text: result.reply }] });
        return result.reply;
      }
      if (!result.canFallback) {
        state.history.pop();
        throw new Error(result.msg);
      }
      modelCooldowns[idx] = Date.now() + COOLDOWN_MS;
    }

    state.history.pop();
    throw new Error('Quota exceeded. Please wait a few seconds and try again.');
  } finally {
    busy = false;
  }
}

export function runTags(
  text: string,
  hooks: {
    onVideo: (q: string) => void;
    onSearch: (q: string) => void;
    onCalendar: () => void;
    onEvent: (title: string, date: string, time: string) => void;
    onSpotify: (q: string) => void;
  }
): string {
  const re = /\[\[(VIDEO|SEARCH|EVENT|CALENDAR|SPOTIFY)\s*:?\s*([^\]]*)\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const type = m[1], arg = m[2].trim();
    if (type === 'VIDEO') hooks.onVideo(arg);
    else if (type === 'SEARCH') hooks.onSearch(arg);
    else if (type === 'CALENDAR') hooks.onCalendar();
    else if (type === 'SPOTIFY') hooks.onSpotify(arg);
    else if (type === 'EVENT') {
      const p = arg.split('|').map(s => s.trim());
      if (p[0] && p[1]) hooks.onEvent(p[0], p[1], p[2] || '');
    }
  }
  return text.replace(re, '').trim();
}
