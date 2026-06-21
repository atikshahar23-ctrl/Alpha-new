// Contact management — a lightweight CRM contacts system
// with tags, notes, and interaction history.

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  tags: string[];
  notes: string;
  interactions: Interaction[];
  created: string;
  starred: boolean;
}

export interface Interaction {
  date: string;
  type: 'call' | 'meeting' | 'email' | 'note';
  summary: string;
}

const KEY = 'alpha_contacts_v1';

export function loadContacts(): Contact[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

function save(c: Contact[]) {
  localStorage.setItem(KEY, JSON.stringify(c));
}

export function addContact(data: Partial<Contact>): Contact {
  const contacts = loadContacts();
  const c: Contact = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: data.name || '',
    phone: data.phone || '',
    email: data.email || '',
    company: data.company || '',
    tags: data.tags || [],
    notes: data.notes || '',
    interactions: [],
    created: new Date().toISOString().slice(0, 10),
    starred: false,
  };
  contacts.unshift(c);
  save(contacts);
  return c;
}

export function updateContact(id: string, patch: Partial<Contact>) {
  const contacts = loadContacts();
  const c = contacts.find(x => x.id === id);
  if (c) {
    Object.assign(c, patch);
    save(contacts);
  }
}

export function removeContact(id: string) {
  save(loadContacts().filter(c => c.id !== id));
}

export function addInteraction(contactId: string, type: Interaction['type'], summary: string) {
  const contacts = loadContacts();
  const c = contacts.find(x => x.id === contactId);
  if (c) {
    c.interactions.unshift({ date: new Date().toISOString().slice(0, 10), type, summary });
    save(contacts);
  }
}

export function searchContacts(query: string): Contact[] {
  const q = query.toLowerCase();
  return loadContacts().filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.phone.includes(q) ||
    c.email.toLowerCase().includes(q) ||
    c.company.toLowerCase().includes(q) ||
    c.tags.some(t => t.toLowerCase().includes(q))
  );
}

export function contactStats() {
  const contacts = loadContacts();
  const starred = contacts.filter(c => c.starred).length;
  const withInteractions = contacts.filter(c => c.interactions.length > 0).length;
  const tags = new Set(contacts.flatMap(c => c.tags));
  return { total: contacts.length, starred, withInteractions, tagCount: tags.size };
}
