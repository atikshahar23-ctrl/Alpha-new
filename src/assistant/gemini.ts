import type { AppState } from './state';
import { upcomingText } from './state';

const MODEL = 'gemini-2.0-flash';

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

export async function askGemini(state: AppState, text: string): Promise<string> {
  state.history.push({ role: 'user', parts: [{ text }] });
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': state.key },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt(state) }] },
        contents: state.history.slice(-16),
        generationConfig: { temperature: 0.8, maxOutputTokens: 800 },
      }),
    }
  );
  if (!res.ok) {
    const code = res.status;
    let msg = '';
    try {
      const e = await res.json();
      const errMsg = e?.error?.message || '';
      if (code === 429 || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate'))
        msg = 'API quota exceeded. Wait a minute and try again.';
      else if (code === 400) msg = 'Bad request — check your API key.';
      else if (code === 403) msg = 'API key invalid or unauthorized.';
      else msg = errMsg || `Error ${code}`;
    } catch { msg = `Error ${code}`; }
    state.history.pop();
    throw new Error(msg);
  }
  const data = await res.json();
  const reply: string = (data.candidates?.[0]?.content?.parts || [])
    .map((p: any) => p.text || '')
    .join('')
    .trim() || '…';
  state.history.push({ role: 'model', parts: [{ text: reply }] });
  return reply;
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
