import type { AppState, AIProvider } from './state';
import { upcomingText } from './state';

const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
];

let activeGeminiModel = 0;
let busy = false;
const geminiCooldowns: number[] = [0, 0, 0];
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
  const currentMonth = today.slice(0, 7);
  const wd = d.toLocaleDateString('en-US', { weekday: 'long' });
  const textLang = state.textLang === 'auto' ? state.replyLang : state.textLang;
  const langLine = LANG_INSTRUCTIONS[textLang] || LANG_INSTRUCTIONS['en'];
  return `You are ${state.name}, an advanced personal assistant with a calm, warm, confident presence. ${langLine} No long lists or tables.
Today is ${wd}, ${today}. Current month: ${currentMonth}.
Control the app via tags at the END of your reply when relevant (never mention them in your spoken text):
- video: [[VIDEO: search terms]]
- web search: [[SEARCH: query]]
- add a calendar event: [[EVENT: title | YYYY-MM-DD | HH:MM]]
- open the calendar: [[CALENDAR]]
- play music on Spotify: [[SPOTIFY: song or artist name]]
- add task to HeavyGuard diary: [[DIARY: task title | YYYY-MM-DD]]
- search HeavyGuard by license plate or chassis number: [[HG_SEARCH: number]]
- get earnings report (contractor is optional, month format YYYY-MM): [[HG_EARNINGS: contractor name | YYYY-MM]]
- create a price quote: [[HG_QUOTE: customer name | phone | item1 description:price, item2 description:price]]
- open the AR camera with hand tracking: [[AR_CAMERA]]
- open a Google Doc/Sheet/Slide link: [[GDOC: full URL]]

You have deep integration with HeavyGuard — a field installation management system for vehicle security (trackers, cameras, radios). Contractors: קובי, אסי, שגיא מערכות, m.b מערכות, ס.ד מיגונים, Heavy Guard.
When the user asks about a license plate number, installation, earnings from a contractor, or wants to create a quote — use the appropriate HG tag.
When user asks "כמה הרווחתי" or about earnings/income, use [[HG_EARNINGS:]]. Example: [[HG_EARNINGS: קובי | ${currentMonth}]] or [[HG_EARNINGS: | ${currentMonth}]] for all contractors.
When user asks about a specific license/registration number (מספר רישוי, לוחית), use [[HG_SEARCH: the number]].
When user wants a price quote (הצעת מחיר), use [[HG_QUOTE:]].
User's calendar: ${upcomingText()}.`;
}

// ─── Gemini ───

async function tryGeminiModel(model: string, state: AppState): Promise<{ ok: true; reply: string } | { ok: false; canFallback: boolean; msg: string }> {
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
      } else if (code === 400) msg = 'Bad request — check your Gemini API key.';
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

async function askGeminiProvider(state: AppState): Promise<string> {
  const now = Date.now();
  const order = [activeGeminiModel, ...GEMINI_MODELS.map((_, i) => i).filter(i => i !== activeGeminiModel)];
  for (const idx of order) {
    if (now < geminiCooldowns[idx]) continue;
    const result = await tryGeminiModel(GEMINI_MODELS[idx], state);
    if (result.ok) { activeGeminiModel = idx; return result.reply; }
    if (!result.canFallback) throw new Error(result.msg);
    geminiCooldowns[idx] = Date.now() + COOLDOWN_MS;
  }
  throw new Error('GEMINI_EXHAUSTED');
}

// ─── Grok (xAI) ───

async function askGrokProvider(state: AppState): Promise<string> {
  if (!state.grokKey) throw new Error('PROVIDER_NO_KEY');
  const sys = systemPrompt(state);
  const messages = [
    { role: 'system' as const, content: sys },
    ...state.history.slice(-8).map(h => ({
      role: h.role === 'user' ? 'user' as const : 'assistant' as const,
      content: h.parts.map(p => p.text).join(''),
    })),
  ];
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.grokKey}` },
    body: JSON.stringify({ model: 'grok-3-mini', messages, temperature: 0.8, max_tokens: 500 }),
  });
  if (!res.ok) {
    const code = res.status;
    if (code === 429) throw new Error('PROVIDER_EXHAUSTED');
    let msg = `Grok error ${code}`;
    try { const e = await res.json(); msg = e?.error?.message || msg; } catch {}
    if (code === 401 || code === 403) throw new Error('PROVIDER_EXHAUSTED');
    throw new Error(msg);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '…';
}

// ─── OpenAI (ChatGPT) ───

async function askOpenAIProvider(state: AppState): Promise<string> {
  if (!state.openaiKey) throw new Error('PROVIDER_NO_KEY');
  const sys = systemPrompt(state);
  const messages = [
    { role: 'system' as const, content: sys },
    ...state.history.slice(-8).map(h => ({
      role: h.role === 'user' ? 'user' as const : 'assistant' as const,
      content: h.parts.map(p => p.text).join(''),
    })),
  ];
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.openaiKey}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages, temperature: 0.8, max_tokens: 500 }),
  });
  if (!res.ok) {
    const code = res.status;
    if (code === 429) throw new Error('PROVIDER_EXHAUSTED');
    let msg = `OpenAI error ${code}`;
    try { const e = await res.json(); msg = e?.error?.message || msg; } catch {}
    if (code === 401 || code === 403) throw new Error('PROVIDER_EXHAUSTED');
    throw new Error(msg);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '…';
}

// ─── Puter.js (free, keyless — user-pays model) ───

function extractPuterText(r: any): string {
  if (!r) return '';
  if (typeof r === 'string') return r.trim();
  const c = r.message?.content ?? r.content ?? r.text;
  if (typeof c === 'string') return c.trim();
  if (Array.isArray(c)) return c.map((p: any) => (typeof p === 'string' ? p : p?.text || '')).join('').trim();
  if (typeof r.toString === 'function') {
    const s = r.toString();
    if (s && s !== '[object Object]') return s.trim();
  }
  return '';
}

async function askPuterProvider(state: AppState): Promise<string> {
  const puter = (window as any).puter;
  if (!puter?.ai?.chat) throw new Error('PROVIDER_EXHAUSTED');
  const messages = [
    { role: 'system', content: systemPrompt(state) },
    ...state.history.slice(-8).map(h => ({
      role: h.role === 'user' ? 'user' : 'assistant',
      content: h.parts.map(p => p.text).join(''),
    })),
  ];
  try {
    const r = await puter.ai.chat(messages, { model: state.puterModel || 'gpt-4o-mini' });
    const text = extractPuterText(r);
    if (!text) throw new Error('PROVIDER_EXHAUSTED');
    return text;
  } catch (err: any) {
    if (err?.message === 'PROVIDER_EXHAUSTED') throw err;
    // auth popup dismissed, network, or rate issue — let the chain fall through
    throw new Error('PROVIDER_EXHAUSTED');
  }
}

// ─── Unified ask with auto-fallback ───

const PROVIDER_ORDER: AIProvider[] = ['puter', 'gemini', 'grok', 'openai'];

async function askProvider(provider: AIProvider, state: AppState): Promise<string> {
  if (provider === 'puter') return askPuterProvider(state);
  if (provider === 'gemini') return askGeminiProvider(state);
  if (provider === 'grok') return askGrokProvider(state);
  return askOpenAIProvider(state);
}

function hasKey(provider: AIProvider, state: AppState): boolean {
  if (provider === 'puter') return typeof (window as any).puter !== 'undefined';
  if (provider === 'gemini') return !!state.key;
  if (provider === 'grok') return !!state.grokKey;
  return !!state.openaiKey;
}

export async function askAI(state: AppState, text: string): Promise<string> {
  if (busy) throw new Error('Please wait for the current request to finish.');
  busy = true;
  state.history.push({ role: 'user', parts: [{ text }] });

  try {
    const primary = state.provider;
    const fallbacks = PROVIDER_ORDER.filter(p => p !== primary && hasKey(p, state));
    const chain = [primary, ...fallbacks];

    for (const provider of chain) {
      if (!hasKey(provider, state)) continue;
      try {
        const reply = await askProvider(provider, state);
        state.history.push({ role: 'model', parts: [{ text: reply }] });
        return reply;
      } catch (err: any) {
        if (err.message === 'GEMINI_EXHAUSTED' || err.message === 'PROVIDER_EXHAUSTED') continue;
        if (err.message === 'PROVIDER_NO_KEY') continue;
        state.history.pop();
        throw err;
      }
    }

    state.history.pop();
    throw new Error('All providers exhausted. Try again later or add more API keys in settings.');
  } finally {
    busy = false;
  }
}

export { askAI as askGemini };

export function runTags(
  text: string,
  hooks: {
    onVideo: (q: string) => void;
    onSearch: (q: string) => void;
    onCalendar: () => void;
    onEvent: (title: string, date: string, time: string) => void;
    onSpotify: (q: string) => void;
    onDiary?: (title: string, date: string) => void;
    onHgSearch?: (query: string) => void;
    onHgEarnings?: (contractor: string, month: string) => void;
    onHgQuote?: (customer: string, phone: string, items: string) => void;
    onArCamera?: () => void;
    onGDoc?: (url: string) => void;
  }
): string {
  const re = /\[\[(VIDEO|SEARCH|EVENT|CALENDAR|SPOTIFY|DIARY|HG_SEARCH|HG_EARNINGS|HG_QUOTE|AR_CAMERA|GDOC)\s*:?\s*([^\]]*)\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const type = m[1], arg = m[2].trim();
    if (type === 'VIDEO') hooks.onVideo(arg);
    else if (type === 'SEARCH') hooks.onSearch(arg);
    else if (type === 'CALENDAR') hooks.onCalendar();
    else if (type === 'SPOTIFY') hooks.onSpotify(arg);
    else if (type === 'DIARY' && hooks.onDiary) {
      const p = arg.split('|').map(s => s.trim());
      if (p[0]) hooks.onDiary(p[0], p[1] || new Date().toISOString().slice(0, 10));
    }
    else if (type === 'EVENT') {
      const p = arg.split('|').map(s => s.trim());
      if (p[0] && p[1]) hooks.onEvent(p[0], p[1], p[2] || '');
    }
    else if (type === 'HG_SEARCH' && hooks.onHgSearch) {
      hooks.onHgSearch(arg);
    }
    else if (type === 'HG_EARNINGS' && hooks.onHgEarnings) {
      const p = arg.split('|').map(s => s.trim());
      hooks.onHgEarnings(p[0] || '', p[1] || '');
    }
    else if (type === 'HG_QUOTE' && hooks.onHgQuote) {
      const p = arg.split('|').map(s => s.trim());
      hooks.onHgQuote(p[0] || '', p[1] || '', p[2] || '');
    }
    else if (type === 'AR_CAMERA' && hooks.onArCamera) {
      hooks.onArCamera();
    }
    else if (type === 'GDOC' && hooks.onGDoc) {
      hooks.onGDoc(arg);
    }
  }
  return text.replace(re, '').trim();
}
