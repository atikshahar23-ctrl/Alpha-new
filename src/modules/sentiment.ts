// Sentiment Tracker — lightweight sentiment analysis and mood tracking
// for conversation messages. Uses keyword-based scoring (no API calls).

const KEY = 'alpha_sentiment_v1';

export interface SentimentEntry {
  ts: number;
  score: number; // -1 to 1
  magnitude: number; // 0 to 1, how emotional
}

const POSITIVE = [
  'great', 'awesome', 'love', 'amazing', 'perfect', 'wonderful', 'excellent',
  'happy', 'good', 'nice', 'fantastic', 'brilliant', 'super', 'thanks',
  'beautiful', 'excited', 'glad', 'enjoy', 'best', 'win', 'won', 'success',
  'מעולה', 'אחלה', 'מדהים', 'טוב', 'יופי', 'תודה', 'אהבתי', 'נהדר', 'שמח',
];

const NEGATIVE = [
  'bad', 'terrible', 'hate', 'awful', 'horrible', 'worst', 'angry', 'upset',
  'sad', 'frustrated', 'annoyed', 'disappointed', 'fail', 'failed', 'problem',
  'broken', 'wrong', 'error', 'stuck', 'lost', 'stress', 'tired', 'sick',
  'גרוע', 'נורא', 'עצוב', 'כועס', 'מתוסכל', 'בעיה', 'שבור', 'נכשל',
];

export function analyzeSentiment(text: string): { score: number; magnitude: number } {
  const words = text.toLowerCase().split(/\s+/);
  let pos = 0, neg = 0;
  for (const w of words) {
    if (POSITIVE.some(p => w.includes(p))) pos++;
    if (NEGATIVE.some(n => w.includes(n))) neg++;
  }
  const total = pos + neg;
  if (total === 0) return { score: 0, magnitude: 0 };
  const score = (pos - neg) / total;
  const magnitude = Math.min(total / words.length, 1);
  return { score, magnitude };
}

export function trackSentiment(text: string): void {
  const { score, magnitude } = analyzeSentiment(text);
  if (magnitude < 0.05) return;
  const entries = loadSentimentHistory();
  entries.push({ ts: Date.now(), score, magnitude });
  if (entries.length > 200) entries.splice(0, entries.length - 200);
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function loadSentimentHistory(): SentimentEntry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function sentimentTrend(days = 7): number[] {
  const entries = loadSentimentHistory();
  const now = Date.now();
  const result: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = now - (i + 1) * 86400000;
    const dayEnd = now - i * 86400000;
    const dayEntries = entries.filter(e => e.ts >= dayStart && e.ts < dayEnd);
    if (dayEntries.length) {
      result.push(dayEntries.reduce((s, e) => s + e.score, 0) / dayEntries.length);
    } else {
      result.push(0);
    }
  }
  return result;
}

export function averageSentiment(): { label: string; score: number } {
  const entries = loadSentimentHistory();
  if (!entries.length) return { label: 'Neutral', score: 0 };
  const recent = entries.slice(-20);
  const avg = recent.reduce((s, e) => s + e.score, 0) / recent.length;
  const label = avg > 0.3 ? 'Positive' : avg < -0.3 ? 'Negative' : 'Neutral';
  return { label, score: avg };
}
