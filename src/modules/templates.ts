// Templates — pre-built message and document templates
// for follow-ups, emails, quotes, and common business communications.

export interface Template {
  id: string;
  name: string;
  category: 'follow-up' | 'email' | 'quote' | 'invoice' | 'general';
  body: string;
  variables: string[]; // placeholders like {{name}}, {{amount}}
}

const BUILT_IN: Template[] = [
  {
    id: 'fu-first',
    name: 'First Follow-up',
    category: 'follow-up',
    body: `Hi {{name}},\n\nThank you for our conversation. I wanted to follow up regarding {{service}}.\n\nWould you like to schedule a time to discuss the details? I'm available at your convenience.\n\nBest regards`,
    variables: ['name', 'service'],
  },
  {
    id: 'fu-reminder',
    name: 'Gentle Reminder',
    category: 'follow-up',
    body: `Hi {{name}},\n\nJust a gentle reminder about {{topic}}. Let me know if you need any additional information.\n\nLooking forward to hearing from you.`,
    variables: ['name', 'topic'],
  },
  {
    id: 'fu-closing',
    name: 'Deal Closing',
    category: 'follow-up',
    body: `Hi {{name}},\n\nI wanted to check in on the quote for {{service}} (₪{{amount}}). Are you ready to move forward? I can schedule the installation for {{date}} if that works.\n\nLet me know!`,
    variables: ['name', 'service', 'amount', 'date'],
  },
  {
    id: 'email-intro',
    name: 'Business Introduction',
    category: 'email',
    body: `Subject: {{subject}}\n\nDear {{name}},\n\nI hope this message finds you well. My name is {{sender}} and I specialize in {{specialty}}.\n\nI'd love the opportunity to discuss how we can help with {{need}}.\n\nBest regards,\n{{sender}}`,
    variables: ['subject', 'name', 'sender', 'specialty', 'need'],
  },
  {
    id: 'email-thanks',
    name: 'Thank You',
    category: 'email',
    body: `Hi {{name}},\n\nThank you for choosing us for {{service}}. It was a pleasure working with you.\n\nIf you ever need anything in the future, don't hesitate to reach out. We'd also appreciate a referral if you know anyone who could benefit from our services.\n\nWarm regards`,
    variables: ['name', 'service'],
  },
  {
    id: 'quote-simple',
    name: 'Simple Quote',
    category: 'quote',
    body: `QUOTE\nDate: {{date}}\nCustomer: {{name}}\nPhone: {{phone}}\n\nItems:\n{{items}}\n\nSubtotal: ₪{{subtotal}}\nVAT (17%): ₪{{vat}}\nTotal: ₪{{total}}\n\nValid for 30 days.\nPayment: bank transfer or credit card.`,
    variables: ['date', 'name', 'phone', 'items', 'subtotal', 'vat', 'total'],
  },
];

const CUSTOM_KEY = 'alpha_templates_v1';

function loadCustom(): Template[] {
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]'); } catch { return []; }
}

function saveCustom(t: Template[]) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(t));
}

export function allTemplates(): Template[] {
  return [...BUILT_IN, ...loadCustom()];
}

export function templatesByCategory(cat: Template['category']): Template[] {
  return allTemplates().filter(t => t.category === cat);
}

export function getTemplate(id: string): Template | undefined {
  return allTemplates().find(t => t.id === id);
}

export function addCustomTemplate(name: string, category: Template['category'], body: string): Template {
  const t: Template = {
    id: 'tpl_' + Date.now().toString(36),
    name,
    category,
    body,
    variables: extractVariables(body),
  };
  const custom = loadCustom();
  custom.push(t);
  saveCustom(custom);
  return t;
}

export function removeCustomTemplate(id: string) {
  saveCustom(loadCustom().filter(t => t.id !== id));
}

function extractVariables(body: string): string[] {
  const matches = body.match(/\{\{(\w+)\}\}/g) || [];
  return [...new Set(matches.map(m => m.slice(2, -2)))];
}

export function fillTemplate(id: string, values: Record<string, string>): string {
  const t = getTemplate(id);
  if (!t) return '';
  let result = t.body;
  for (const [key, val] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
  }
  return result;
}

export function templateCategories(): Template['category'][] {
  return ['follow-up', 'email', 'quote', 'invoice', 'general'];
}
