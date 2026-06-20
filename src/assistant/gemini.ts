import type { AppState } from './state';
import { upcomingText } from './state';

const MODEL = 'gemini-3.5-flash';

export function systemPrompt(state: AppState): string {
  const d = new Date();
  const today = d.toISOString().slice(0, 10);
  const wd = d.toLocaleDateString('en-US', { weekday: 'long' });
  const langLine =
    state.replyLang === 'he'
      ? 'ענה תמיד בעברית טבעית, רהוטה ונקייה — דיבור אנושי וזורם, לא מילולי ולא רובוטי. משפטים קצרים כמו בשיחה.'
      : 'ALWAYS reply in fluent, natural, warm English. Short, conversational sentences like a person speaking aloud.';
  return `You are ${state.name}, an advanced personal assistant with a calm, warm, confident presence. ${langLine} No long lists or tables.
Today is ${wd}, ${today}.
Control the app via tags at the END of your reply when relevant (never mention them in your spoken text):
- video: [[VIDEO: search terms]]
- web search: [[SEARCH: query]]
- add a calendar event: [[EVENT: title | YYYY-MM-DD | HH:MM]]
- open the calendar: [[CALENDAR]]
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
    const e = await res.text();
    throw new Error(`${res.status} ${e}`);
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
  }
): string {
  const re = /\[\[(VIDEO|SEARCH|EVENT|CALENDAR)\s*:?\s*([^\]]*)\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const type = m[1], arg = m[2].trim();
    if (type === 'VIDEO') hooks.onVideo(arg);
    else if (type === 'SEARCH') hooks.onSearch(arg);
    else if (type === 'CALENDAR') hooks.onCalendar();
    else if (type === 'EVENT') {
      const p = arg.split('|').map(s => s.trim());
      if (p[0] && p[1]) hooks.onEvent(p[0], p[1], p[2] || '');
    }
  }
  return text.replace(re, '').trim();
}
