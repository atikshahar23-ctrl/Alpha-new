// Conversation Context — extracts and maintains key topics, entities,
// and intent from recent messages to enrich AI context.

import { loadChatHistory, type ChatMessage } from './chatHistory';

export interface ConversationTopic {
  topic: string;
  count: number;
  lastMentioned: number;
}

const TOPIC_PATTERNS: [RegExp, string][] = [
  [/\b(lead|leads|customer|client|prospect)\b/i, 'Sales/Leads'],
  [/\b(invoice|payment|paid|billing)\b/i, 'Invoicing'],
  [/\b(task|todo|to-do|deadline)\b/i, 'Tasks'],
  [/\b(goal|objective|milestone|target)\b/i, 'Goals'],
  [/\b(expense|cost|spending|budget)\b/i, 'Expenses'],
  [/\b(event|calendar|meeting|schedule|appointment)\b/i, 'Calendar'],
  [/\b(camera|tracker|install|vehicle|truck|scania|volvo)\b/i, 'HeavyGuard'],
  [/\b(habit|streak|routine|daily)\b/i, 'Habits'],
  [/\b(report|analytics|summary|brief)\b/i, 'Reports'],
  [/\b(note|memo|remember|remind)\b/i, 'Notes'],
  [/\b(music|lyrics|song|beat|rap)\b/i, 'Creative'],
  [/\b(trade|crypto|bitcoin|market|stock)\b/i, 'Trading'],
  [/\b(health|sleep|mood|water|wellness)\b/i, 'Wellness'],
  [/\b(contact|phone|email|company)\b/i, 'Contacts'],
  [/\b(quote|proposal|offer)\b/i, 'Quotes'],
  [/\b(לקוח|ליד|מכירה|עסקה)\b/, 'Sales/Leads'],
  [/\b(חשבונית|תשלום|חוב)\b/, 'Invoicing'],
  [/\b(משימה|מטלה)\b/, 'Tasks'],
  [/\b(מצלמה|מערכת|התקנה|משאית)\b/, 'HeavyGuard'],
];

export function extractTopics(messages?: ChatMessage[]): ConversationTopic[] {
  const msgs = messages || loadChatHistory();
  const topicMap = new Map<string, ConversationTopic>();

  for (const msg of msgs) {
    if (msg.who === 'sys') continue;
    for (const [pattern, topic] of TOPIC_PATTERNS) {
      if (pattern.test(msg.text)) {
        const existing = topicMap.get(topic);
        if (existing) {
          existing.count++;
          existing.lastMentioned = Math.max(existing.lastMentioned, msg.ts);
        } else {
          topicMap.set(topic, { topic, count: 1, lastMentioned: msg.ts });
        }
      }
    }
  }

  return Array.from(topicMap.values())
    .sort((a, b) => b.count - a.count);
}

export function conversationSummaryForAI(): string {
  const topics = extractTopics();
  if (!topics.length) return '';

  const top = topics.slice(0, 5).map(t => t.topic).join(', ');
  const history = loadChatHistory();
  const recentUserMsgs = history.filter(m => m.who === 'me').slice(-5);
  const recentTopics = recentUserMsgs.length
    ? `Recent focus: ${extractTopics(recentUserMsgs).slice(0, 3).map(t => t.topic).join(', ') || 'general conversation'}`
    : '';

  const parts = [`Session topics: ${top}`];
  if (recentTopics) parts.push(recentTopics);
  parts.push(`${history.length} messages in session`);

  return parts.join('. ') + '.';
}
