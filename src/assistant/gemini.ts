import type { AppState, AIProvider } from './state';
import { upcomingText } from './state';
import { getBrainContext } from '../brain';
import { conversationSummaryForAI } from '../modules/conversationContext';
import { tradingContextForAI } from '../modules/tradingBridge';

const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
];

// Groq — free, fast (Llama). OpenAI-compatible wire format. Text + vision models.
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Free Groq models, rotated as a "wheel": if one is rate-limited the next is
// tried, so the assistant never gets stuck — and all of them are free.
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it', 'llama3-70b-8192'];
const GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
let activeGroqModel = 0;
const groqCooldowns: number[] = [0, 0, 0, 0];

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
  return `You are ${state.name}, an elite personal AI assistant — superhuman, proactive, and deeply integrated with the user's life and business. ${langLine} Keep responses concise and action-oriented. No long lists or tables unless asked.
Today is ${wd}, ${today}. Current month: ${currentMonth}.

CAPABILITIES — Control the app via tags at the END of your reply (never mention them in spoken text):
[[VIDEO: search terms]] · [[SEARCH: query]] · [[SPOTIFY: song or artist name]]
[[EVENT: title | YYYY-MM-DD | HH:MM]] · [[CALENDAR]]
[[TASK: task text | priority(low/med/high) | YYYY-MM-DD (optional due date)]] · [[NOTE: text to save]]
(Include the due date in TASK whenever the user names a day/date — it gets added to the calendar. Omit it for an unscheduled task.)
[[DIARY: task title | YYYY-MM-DD]] · [[AR_CAMERA]] · [[GDOC: full URL]]
[[TIMER_START: project name]] · [[TIMER_STOP]]
[[HG_SEARCH: plate/chassis number]] · [[HG_EARNINGS: contractor | YYYY-MM]] · [[HG_QUOTE: customer | phone | item:price, item:price]]
[[HG_REPORT: idNumber | idType | contractor | date(YYYY-MM-DD) | price | vehicleType | manufacturer | installType | location | customer | phone]]

HEAVYGUARD INTEGRATION — Field installation management for vehicle security (trackers, cameras, radios for Scania/Volvo etc.). Contractors: קובי, אסי, שגיא מערכות, m.b מערכות, ס.ד מיגונים, Heavy Guard.
Use [[HG_SEARCH:]] for license lookups, [[HG_EARNINGS: | ${currentMonth}]] for income, [[HG_QUOTE:]] for quotes.
When the user reports completing an installation (e.g. "דיווחתי התקנה", "סיימנו התקנה", "הותקן"), emit [[HG_REPORT:]] with all available fields. The reportedAt timestamp is set automatically — do NOT include it in the tag.

USER'S ECOSYSTEM — You manage:
• CRM pipeline with lead tracking, follow-ups, and revenue analytics
• Contact management with tags, notes, and interaction history
• Invoice generation with VAT calculation
• Task management with priority levels
• Calendar with HeavyGuard diary sync
• Habit tracking with streak counting
• Expense tracking with categories and monthly summaries
• Pomodoro focus sessions
• Wellness (mood, water, sleep tracking)
• Goal setting with milestones
• Long-term memory that remembers facts and preferences
• Google Drive cloud backup

When briefing the user, be proactive: mention overdue follow-ups, upcoming events, pending tasks, and actionable insights. Think like a chief of staff who anticipates needs.

Calendar: ${upcomingText()}.${conversationBlock()}${brainBlock()}${tradingBlock()}`;
}

function conversationBlock(): string {
  try {
    const ctx = conversationSummaryForAI();
    return ctx ? `\nConversation context: ${ctx}` : '';
  } catch { return ''; }
}

function brainBlock(): string {
  try {
    const ctx = getBrainContext();
    return ctx ? `\n\n=== MASTER BRAIN CONTEXT ===\n${ctx}` : '';
  } catch { return ''; }
}

function tradingBlock(): string {
  try {
    const ctx = tradingContextForAI();
    return ctx ? `\n\n${ctx}` : '';
  } catch { return ''; }
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

// ─── Groq (free, fast — Llama) ───

async function tryGroqModel(model: string, state: AppState): Promise<{ ok: true; reply: string } | { ok: false; rotate: boolean; msg: string }> {
  const messages = [
    { role: 'system' as const, content: systemPrompt(state) },
    ...state.history.slice(-8).map(h => ({
      role: h.role === 'user' ? 'user' as const : 'assistant' as const,
      content: h.parts.map(p => p.text).join(''),
    })),
  ];
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.groqKey}` },
    body: JSON.stringify({ model, messages, temperature: 0.8, max_tokens: 600 }),
  });
  if (!res.ok) {
    const code = res.status;
    // 429 (rate) / 503 (busy) / 400 (model decommissioned) → rotate to next free model.
    if (code === 429 || code === 503 || code === 400 || code === 404) return { ok: false, rotate: true, msg: `${model} ${code}` };
    if (code === 401 || code === 403) return { ok: false, rotate: false, msg: 'AUTH' };
    return { ok: false, rotate: true, msg: `Groq ${code}` };
  }
  const data = await res.json();
  return { ok: true, reply: data.choices?.[0]?.message?.content?.trim() || '…' };
}

async function askGroqProvider(state: AppState): Promise<string> {
  if (!state.groqKey) throw new Error('PROVIDER_NO_KEY');
  const now = Date.now();
  const order = [activeGroqModel, ...GROQ_MODELS.map((_, i) => i).filter(i => i !== activeGroqModel)];
  for (const idx of order) {
    if (now < groqCooldowns[idx]) continue;
    const r = await tryGroqModel(GROQ_MODELS[idx], state);
    if (r.ok) { activeGroqModel = idx; return r.reply; }
    if (!r.rotate) throw new Error('PROVIDER_EXHAUSTED');   // auth → let chain fall through
    groqCooldowns[idx] = Date.now() + COOLDOWN_MS;          // park this model, try next
  }
  throw new Error('PROVIDER_EXHAUSTED');                    // whole wheel cooling → next provider
}

// ─── Unified ask with auto-fallback ───

const PROVIDER_ORDER: AIProvider[] = ['groq', 'gemini', 'grok', 'openai'];

async function askProvider(provider: AIProvider, state: AppState): Promise<string> {
  if (provider === 'groq') return askGroqProvider(state);
  if (provider === 'gemini') return askGeminiProvider(state);
  if (provider === 'grok') return askGrokProvider(state);
  return askOpenAIProvider(state);
}

function hasKey(provider: AIProvider, state: AppState): boolean {
  if (provider === 'groq') return !!state.groqKey;
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

// ─── Vision: ask about an image (screen capture) ──────────────────────────
// Sends a prompt + image (data URL) to a multimodal model. Tries the provider
// chain; returns '' if none can answer. Grok is skipped (image support varies).
export async function askVision(state: AppState, prompt: string, imageDataUrl: string): Promise<string> {
  const order = [state.provider, ...PROVIDER_ORDER.filter(p => p !== state.provider)];
  for (const provider of order) {
    try {
      if (provider === 'groq') {
        if (!state.groqKey) continue;
        const res = await fetch(GROQ_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.groqKey}` },
          body: JSON.stringify({
            model: GROQ_VISION_MODEL, max_tokens: 600,
            messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: imageDataUrl } }] }],
          }),
        });
        if (!res.ok) continue;
        const data = await res.json();
        const t = data.choices?.[0]?.message?.content?.trim();
        if (t) return t;
      } else if (provider === 'openai') {
        if (!state.openaiKey) continue;
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.openaiKey}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini', max_tokens: 600,
            messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: imageDataUrl } }] }],
          }),
        });
        if (!res.ok) continue;
        const data = await res.json();
        const t = data.choices?.[0]?.message?.content?.trim();
        if (t) return t;
      } else if (provider === 'gemini') {
        if (!state.key) continue;
        const b64 = imageDataUrl.split(',')[1] || '';
        const res = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': state.key },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: b64 } }] }],
              generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
            }),
          },
        );
        if (!res.ok) continue;
        const data = await res.json();
        const t = (data.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || '').join('').trim();
        if (t) return t;
      }
    } catch {}
  }
  return '';
}

// ─── One-shot, history-free call ──────────────────────────────────────────
// A single isolated request with a custom system+user prompt that does NOT
// touch state.history — used for background tasks like auto-fixing code. Tries
// the provider chain and returns '' if none answer (caller treats '' as no-op).
export async function askOnce(state: AppState, system: string, user: string): Promise<string> {
  const order = [state.provider, ...PROVIDER_ORDER.filter(p => p !== state.provider)];
  for (const provider of order) {
    if (!hasKey(provider, state)) continue;
    try {
      if (provider === 'groq') {
        if (!state.groqKey) continue;
        const res = await fetch(GROQ_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.groqKey}` },
          body: JSON.stringify({ model: GROQ_MODELS[activeGroqModel], messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.2, max_tokens: 600 }),
        });
        if (!res.ok) continue;
        const data = await res.json();
        const t = data.choices?.[0]?.message?.content?.trim();
        if (t) return t;
      } else if (provider === 'gemini') {
        if (!state.key) continue;
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODELS[0]}:generateContent`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': state.key },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: system }] },
              contents: [{ role: 'user', parts: [{ text: user }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 600 },
            }),
          },
        );
        if (!res.ok) continue;
        const data = await res.json();
        const t = (data.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || '').join('').trim();
        if (t) return t;
      } else {
        const key = provider === 'grok' ? state.grokKey : state.openaiKey;
        if (!key) continue;
        const url = provider === 'grok' ? 'https://api.x.ai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
        const model = provider === 'grok' ? 'grok-3-mini' : 'gpt-4o-mini';
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
          body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.2, max_tokens: 600 }),
        });
        if (!res.ok) continue;
        const data = await res.json();
        const t = data.choices?.[0]?.message?.content?.trim();
        if (t) return t;
      }
    } catch {}
  }
  return '';
}

// ─── Streaming (SSE / async-iterator) ─────────────────────────────────────
// Same provider chain + fallback as askAI, but emits partial text as it
// arrives so the UI can render tokens live (real time-to-first-token instead
// of waiting for the whole reply). onText receives the FULL text-so-far each
// tick. Any streaming failure falls back to the non-streaming call for that
// provider, so behaviour is never worse than askAI.

async function* sseLines(res: Response): AsyncGenerator<string> {
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buf = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (line) yield line;
    }
  }
  if (buf.trim()) yield buf.trim();
}

function chatMessages(state: AppState) {
  return [
    { role: 'system', content: systemPrompt(state) },
    ...state.history.slice(-8).map(h => ({
      role: h.role === 'user' ? 'user' : 'assistant',
      content: h.parts.map(p => p.text).join(''),
    })),
  ];
}

// OpenAI + Grok share the OpenAI-compatible streaming wire format.
async function streamOpenAICompat(
  url: string, key: string, model: string, state: AppState, onText: (full: string) => void,
): Promise<string> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages: chatMessages(state), temperature: 0.8, max_tokens: 500, stream: true }),
  });
  if (!res.ok || !res.body) {
    if (res.status === 429 || res.status === 401 || res.status === 403) throw new Error('PROVIDER_EXHAUSTED');
    throw new Error('STREAM_FAIL');
  }
  let full = '';
  for await (const line of sseLines(res)) {
    if (!line.startsWith('data:')) continue;
    const data = line.slice(5).trim();
    if (data === '[DONE]') break;
    try {
      const j = JSON.parse(data);
      const d = j.choices?.[0]?.delta?.content || '';
      if (d) { full += d; onText(full); }
    } catch {}
  }
  return full;
}

async function streamGeminiModel(model: string, state: AppState, onText: (full: string) => void): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': state.key },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt(state) }] },
        contents: state.history.slice(-8),
        generationConfig: { temperature: 0.8, maxOutputTokens: 500 },
      }),
    },
  );
  if (!res.ok || !res.body) throw new Error('STREAM_FAIL');
  let full = '';
  for await (const line of sseLines(res)) {
    if (!line.startsWith('data:')) continue;
    try {
      const j = JSON.parse(line.slice(5).trim());
      const d = (j.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || '').join('');
      if (d) { full += d; onText(full); }
    } catch {}
  }
  return full;
}

async function streamGeminiChain(state: AppState, onText: (full: string) => void): Promise<string> {
  const now = Date.now();
  const order = [activeGeminiModel, ...GEMINI_MODELS.map((_, i) => i).filter(i => i !== activeGeminiModel)];
  for (const idx of order) {
    if (now < geminiCooldowns[idx]) continue;
    try {
      const r = await streamGeminiModel(GEMINI_MODELS[idx], state, onText);
      if (r.trim()) { activeGeminiModel = idx; return r; }
    } catch {}
    geminiCooldowns[idx] = Date.now() + COOLDOWN_MS;
  }
  throw new Error('GEMINI_EXHAUSTED');
}

async function streamProvider(provider: AIProvider, state: AppState, onText: (full: string) => void): Promise<string> {
  if (provider === 'groq') {
    if (!state.groqKey) throw new Error('PROVIDER_NO_KEY');
    return streamOpenAICompat(GROQ_URL, state.groqKey, GROQ_MODELS[activeGroqModel], state, onText);
  }
  if (provider === 'gemini') return streamGeminiChain(state, onText);
  if (provider === 'grok') {
    if (!state.grokKey) throw new Error('PROVIDER_NO_KEY');
    return streamOpenAICompat('https://api.x.ai/v1/chat/completions', state.grokKey, 'grok-3-mini', state, onText);
  }
  if (!state.openaiKey) throw new Error('PROVIDER_NO_KEY');
  return streamOpenAICompat('https://api.openai.com/v1/chat/completions', state.openaiKey, 'gpt-4o-mini', state, onText);
}

export async function askAIStream(state: AppState, text: string, onText: (full: string) => void): Promise<string> {
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
        let reply = await streamProvider(provider, state, onText);
        if (!reply.trim()) {
          // Streaming produced nothing — fall back to the blocking call.
          reply = await askProvider(provider, state);
          onText(reply);
        }
        state.history.push({ role: 'model', parts: [{ text: reply }] });
        return reply;
      } catch (err: any) {
        const m = err?.message;
        if (m === 'GEMINI_EXHAUSTED' || m === 'PROVIDER_EXHAUSTED' || m === 'PROVIDER_NO_KEY') continue;
        // Transient stream error — try this provider once without streaming.
        try {
          const reply = await askProvider(provider, state);
          onText(reply);
          state.history.push({ role: 'model', parts: [{ text: reply }] });
          return reply;
        } catch { continue; }
      }
    }

    state.history.pop();
    throw new Error('All providers exhausted. Try again later or add more API keys in settings.');
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
    onDiary?: (title: string, date: string) => void;
    onHgSearch?: (query: string) => void;
    onHgEarnings?: (contractor: string, month: string) => void;
    onHgQuote?: (customer: string, phone: string, items: string) => void;
    onHgReport?: (fields: string[]) => void;
    onArCamera?: () => void;
    onGDoc?: (url: string) => void;
    onTask?: (text: string, priority: string, due?: string) => void;
    onNote?: (text: string) => void;
    onTimerStart?: (project: string) => void;
    onTimerStop?: () => void;
  }
): string {
  const re = /\[\[(VIDEO|SEARCH|EVENT|CALENDAR|SPOTIFY|DIARY|HG_SEARCH|HG_EARNINGS|HG_QUOTE|HG_REPORT|AR_CAMERA|GDOC|TASK|NOTE|TIMER_START|TIMER_STOP)\s*:?\s*([^\]]*)\]\]/g;
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
    else if (type === 'HG_REPORT' && hooks.onHgReport) {
      hooks.onHgReport(arg.split('|').map(s => s.trim()));
    }
    else if (type === 'AR_CAMERA' && hooks.onArCamera) {
      hooks.onArCamera();
    }
    else if (type === 'GDOC' && hooks.onGDoc) {
      hooks.onGDoc(arg);
    }
    else if (type === 'TASK' && hooks.onTask) {
      const p = arg.split('|').map(s => s.trim());
      // p[2] = optional due date (YYYY-MM-DD). When present the task is scheduled
      // on the calendar; otherwise it stays unscheduled.
      hooks.onTask(p[0] || '', p[1] || 'med', p[2] || '');
    }
    else if (type === 'NOTE' && hooks.onNote) {
      hooks.onNote(arg);
    }
    else if (type === 'TIMER_START' && hooks.onTimerStart) {
      hooks.onTimerStart(arg || 'General');
    }
    else if (type === 'TIMER_STOP' && hooks.onTimerStop) {
      hooks.onTimerStop();
    }
  }
  return text.replace(re, '').trim();
}
