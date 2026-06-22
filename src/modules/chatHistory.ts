// Chat History — persists conversation messages to localStorage
// so they survive page reloads. Maintains a rolling window.

export interface ChatMessage {
  text: string;
  who: 'me' | 'al' | 'sys';
  ts: number;
}

const KEY = 'alpha_chat_history_v1';
const MAX_MESSAGES = 100;

export function loadChatHistory(): ChatMessage[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function saveChatMessage(text: string, who: 'me' | 'al' | 'sys') {
  const history = loadChatHistory();
  history.push({ text, who, ts: Date.now() });
  if (history.length > MAX_MESSAGES) history.splice(0, history.length - MAX_MESSAGES);
  localStorage.setItem(KEY, JSON.stringify(history));
}

export function clearChatHistory() {
  localStorage.removeItem(KEY);
}

export function chatMessageCount(): number {
  return loadChatHistory().length;
}
