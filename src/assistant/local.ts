import { loadEvents, addEvent, loadTasks, addTask, toggleTask, removeTask, saveNote, loadNotes, clearNotes, type Task } from './state';

const GREETINGS_EN = ['Hey! How can I help?', 'Hello! What can I do for you?', 'Hi there! Ready to help.'];
const GREETINGS_HE = ['היי! איך אפשר לעזור?', 'שלום! מה אפשר לעשות בשבילך?', 'אהלן! מוכן לעזור.'];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function isHebrew(text: string): boolean {
  return /[֐-׿]/.test(text);
}

function formatTasks(tasks: Task[], he: boolean): string {
  const pending = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);
  if (!tasks.length) return he ? 'אין משימות. אמור "הוסף משימה" כדי להוסיף.' : 'No tasks yet. Say "add task" to create one.';
  let out = he ? `📋 משימות (${pending.length} פתוחות):\n` : `📋 Tasks (${pending.length} open):\n`;
  for (const t of pending) {
    const p = t.priority === 'high' ? '🔴' : t.priority === 'med' ? '🟡' : '🟢';
    out += `${p} ${t.text}\n`;
  }
  if (done.length) out += (he ? `\n✅ הושלמו: ${done.length}` : `\n✅ Completed: ${done.length}`);
  return out;
}

function formatDate(d: Date, he: boolean): string {
  const days = he
    ? ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = he
    ? ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return he
    ? `יום ${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
    : `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function calculate(expr: string): string | null {
  const clean = expr.replace(/[^0-9+\-*/().%^ ]/g, '').trim();
  if (!clean || clean.length < 2) return null;
  try {
    const safe = clean.replace(/\^/g, '**');
    const result = new Function(`"use strict"; return (${safe})`)();
    if (typeof result === 'number' && isFinite(result)) return String(Math.round(result * 1e10) / 1e10);
  } catch {}
  return null;
}

function coinFlip(he: boolean): string {
  return Math.random() > 0.5 ? (he ? 'עץ! 🪙' : 'Heads! 🪙') : (he ? 'פלי! 🪙' : 'Tails! 🪙');
}

function diceRoll(he: boolean): string {
  const n = Math.floor(Math.random() * 6) + 1;
  const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  return he ? `${faces[n - 1]} יצא ${n}` : `${faces[n - 1]} Rolled ${n}`;
}

function randomNumber(min: number, max: number): string {
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

const JOKES_EN = [
  'Why do programmers prefer dark mode? Because light attracts bugs.',
  'I told my computer I needed a break... now it won\'t stop sending me vacation ads.',
  'Why was the JavaScript developer sad? Because he didn\'t Node how to Express himself.',
  'What do you call 8 hobbits? A hobbyte.',
  'Why do Java developers wear glasses? Because they can\'t C#.',
];
const JOKES_HE = [
  'למה המתכנת לא יוצא מהבית? כי הוא לא רוצה לעשות push.',
  'מה ההבדל בין HTML למנהל? HTML יודע לסגור תגיות.',
  'למה מתכנתים מעדיפים חושך? כי אור מושך באגים.',
  'מה עושה מתכנת שלא יודע לשחות? הוא מחפש pool.',
];

const FACTS_EN = [
  'Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs that was still edible.',
  'Octopuses have three hearts and blue blood.',
  'A day on Venus is longer than a year on Venus.',
  'Bananas are berries, but strawberries aren\'t.',
  'The shortest war in history lasted 38 minutes (Britain vs Zanzibar, 1896).',
  'A group of flamingos is called a "flamboyance."',
  'The inventor of the Pringles can is buried in one.',
];
const FACTS_HE = [
  'דבש לא מתקלקל לעולם. נמצא דבש בן 3000 שנה בקברים במצרים.',
  'לתמנון יש שלושה לבבות ודם כחול.',
  'יום על נוגה ארוך יותר משנה על נוגה.',
  'בננות הן פירות יער, אבל תותים לא.',
  'המלחמה הקצרה בהיסטוריה נמשכה 38 דקות.',
];

export function tryLocalCommand(text: string): string | null {
  const t = text.trim();
  const low = t.toLowerCase();
  const he = isHebrew(t);

  // --- GREETINGS ---
  if (/^(hi|hello|hey|שלום|היי|אהלן|בוקר טוב|ערב טוב|מה קורה|מה נשמע)/i.test(t)) {
    return pick(he ? GREETINGS_HE : GREETINGS_EN);
  }

  // --- TIME ---
  if (/\b(what time|the time|מה השעה|כמה שעה|time now)\b/i.test(low)) {
    const d = new Date();
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return he ? `השעה עכשיו ${time}` : `It's currently ${time}`;
  }

  // --- DATE ---
  if (/\b(what date|today'?s? date|what day|מה התאריך|איזה יום|תאריך)\b/i.test(low)) {
    return formatDate(new Date(), he);
  }

  // --- CALCULATOR ---
  if (/^[\d(].*[+\-*/^%]/.test(t.replace(/\s/g, '')) || /\b(calculate|calc|חשב|תחשב)\b/i.test(low)) {
    const expr = t.replace(/^(calculate|calc|חשב|תחשב)\s*/i, '');
    const result = calculate(expr);
    if (result) return he ? `התוצאה: ${result}` : `Result: ${result}`;
  }

  // --- ADD TASK ---
  if (/^(add task|new task|הוסף משימה|משימה חדשה)\s*[:\-]?\s*/i.test(t)) {
    const taskText = t.replace(/^(add task|new task|הוסף משימה|משימה חדשה)\s*[:\-]?\s*/i, '').trim();
    if (!taskText) return he ? 'מה המשימה? לדוגמה: "הוסף משימה לקנות חלב"' : 'What\'s the task? Example: "add task buy groceries"';
    const priority = /\b(urgent|important|דחוף|חשוב|high)\b/i.test(taskText) ? 'high' as const : 'med' as const;
    addTask(taskText.replace(/\b(urgent|important|דחוף|חשוב)\b/i, '').trim(), priority);
    return he ? `✅ המשימה נוספה: "${taskText}"` : `✅ Task added: "${taskText}"`;
  }

  // --- LIST TASKS ---
  if (/\b(my tasks|show tasks|list tasks|המשימות שלי|הצג משימות|רשימת משימות|tasks)\b/i.test(low)) {
    return formatTasks(loadTasks(), he);
  }

  // --- COMPLETE TASK ---
  if (/^(done|complete|finish|סיימתי|הושלם|בוצע)\s+/i.test(t)) {
    const keyword = t.replace(/^(done|complete|finish|סיימתי|הושלם|בוצע)\s+/i, '').trim().toLowerCase();
    const tasks = loadTasks();
    const found = tasks.find(x => !x.done && x.text.toLowerCase().includes(keyword));
    if (found) { toggleTask(found.id); return he ? `✅ "${found.text}" סומנה כהושלמה!` : `✅ "${found.text}" marked as done!`; }
    return he ? 'לא מצאתי משימה כזו.' : 'Couldn\'t find that task.';
  }

  // --- DELETE TASK ---
  if (/^(delete task|remove task|מחק משימה|הסר משימה)\s+/i.test(t)) {
    const keyword = t.replace(/^(delete task|remove task|מחק משימה|הסר משימה)\s+/i, '').trim().toLowerCase();
    const tasks = loadTasks();
    const found = tasks.find(x => x.text.toLowerCase().includes(keyword));
    if (found) { removeTask(found.id); return he ? `🗑️ המשימה "${found.text}" נמחקה.` : `🗑️ Task "${found.text}" removed.`; }
    return he ? 'לא מצאתי משימה כזו.' : 'Couldn\'t find that task.';
  }

  // --- ADD NOTE ---
  if (/^(note|remember|save note|שמור|תזכור|הערה)\s*[:\-]?\s+/i.test(t)) {
    const note = t.replace(/^(note|remember|save note|שמור|תזכור|הערה)\s*[:\-]?\s*/i, '').trim();
    if (!note) return he ? 'מה לשמור?' : 'What should I note?';
    saveNote(note);
    return he ? `📝 נשמר: "${note}"` : `📝 Noted: "${note}"`;
  }

  // --- LIST NOTES ---
  if (/\b(my notes|show notes|list notes|ההערות שלי|הצג הערות)\b/i.test(low)) {
    const notes = loadNotes();
    if (!notes.length) return he ? 'אין הערות שמורות.' : 'No saved notes.';
    return (he ? '📝 הערות:\n' : '📝 Notes:\n') + notes.slice(0, 10).map((n, i) => `${i + 1}. ${n}`).join('\n');
  }

  // --- CLEAR NOTES ---
  if (/\b(clear notes|delete notes|מחק הערות|נקה הערות)\b/i.test(low)) {
    clearNotes();
    return he ? '🗑️ כל ההערות נמחקו.' : '🗑️ All notes cleared.';
  }

  // --- CALENDAR ---
  if (/\b(my calendar|my schedule|my events|לוח שנה|היומן שלי|אירועים)\b/i.test(low)) {
    const today = new Date().toISOString().slice(0, 10);
    const ev = loadEvents().filter(e => e.date >= today);
    if (!ev.length) return he ? '📅 היומן ריק.' : '📅 Calendar is empty.';
    let out = he ? '📅 אירועים קרובים:\n' : '📅 Upcoming events:\n';
    for (const e of ev.slice(0, 8)) out += `• ${e.date}${e.time ? ' ' + e.time : ''} — ${e.title}\n`;
    return out.trim();
  }

  // --- ADD EVENT (local) ---
  if (/^(add event|new event|הוסף אירוע|אירוע חדש)\s/i.test(t)) {
    const raw = t.replace(/^(add event|new event|הוסף אירוע|אירוע חדש)\s*/i, '').trim();
    const dateMatch = raw.match(/(\d{4}-\d{2}-\d{2})/);
    const timeMatch = raw.match(/(\d{1,2}:\d{2})/);
    const title = raw.replace(/\d{4}-\d{2}-\d{2}/, '').replace(/\d{1,2}:\d{2}/, '').replace(/[,|]/g, '').trim();
    if (!title || !dateMatch) return he ? 'ציין כותרת ותאריך (YYYY-MM-DD). לדוגמה: "הוסף אירוע פגישה 2026-06-25 14:00"' : 'Please include a title and date (YYYY-MM-DD). Example: "add event meeting 2026-06-25 14:00"';
    addEvent(title, dateMatch[1], timeMatch?.[1] || '');
    return he ? `📅 האירוע נוסף: "${title}" ב-${dateMatch[1]}${timeMatch ? ' ' + timeMatch[1] : ''}` : `📅 Event added: "${title}" on ${dateMatch[1]}${timeMatch ? ' at ' + timeMatch[1] : ''}`;
  }

  // --- COIN FLIP ---
  if (/\b(flip|coin|heads|tails|הטל מטבע|מטבע|עץ או פלי)\b/i.test(low)) {
    return coinFlip(he);
  }

  // --- DICE ---
  if (/\b(roll|dice|die|הטל קובייה|קובייה)\b/i.test(low)) {
    return diceRoll(he);
  }

  // --- RANDOM NUMBER ---
  if (/\b(random number|random between|מספר אקראי)\b/i.test(low)) {
    const nums = t.match(/\d+/g);
    const min = nums?.[0] ? parseInt(nums[0]) : 1;
    const max = nums?.[1] ? parseInt(nums[1]) : 100;
    const result = randomNumber(min, max);
    return he ? `🎲 מספר אקראי: ${result}` : `🎲 Random number: ${result}`;
  }

  // --- JOKE ---
  if (/\b(joke|tell me a joke|בדיחה|תספר בדיחה|ספר בדיחה)\b/i.test(low)) {
    return pick(he ? JOKES_HE : JOKES_EN);
  }

  // --- FUN FACT ---
  if (/\b(fun fact|fact|עובדה|עובדה מעניינת)\b/i.test(low)) {
    return pick(he ? FACTS_HE : FACTS_EN);
  }

  // --- TIMER (display countdown info) ---
  if (/^(timer|set timer|טיימר|הגדר טיימר)\s+(\d+)\s*(min|minutes|דקות|sec|seconds|שניות)?/i.test(t)) {
    const m = t.match(/(\d+)\s*(min|minutes|דקות|sec|seconds|שניות)?/i);
    if (m) {
      const n = parseInt(m[1]);
      const isSec = /sec|seconds|שניות/i.test(m[2] || '');
      const ms = isSec ? n * 1000 : n * 60000;
      setTimeout(() => {
        try { new Notification(he ? '⏰ הטיימר נגמר!' : '⏰ Timer done!', { body: `${n} ${isSec ? (he ? 'שניות' : 'seconds') : (he ? 'דקות' : 'minutes')}` }); } catch {}
      }, ms);
      if (Notification.permission === 'default') Notification.requestPermission();
      return he ? `⏱️ טיימר הוגדר ל-${n} ${isSec ? 'שניות' : 'דקות'}. תקבל התראה.` : `⏱️ Timer set for ${n} ${isSec ? 'seconds' : 'minutes'}. You'll be notified.`;
    }
  }

  // --- HELP ---
  if (/\b(help|what can you do|מה אתה יכול|עזרה|יכולות)\b/i.test(low)) {
    return he
      ? `🤖 הנה מה שאני יכול לעשות בלי אינטרנט:
• "הוסף משימה ..." — ניהול משימות
• "המשימות שלי" — הצג משימות
• "סיימתי ..." — סמן משימה כהושלמה
• "שמור ..." — שמור הערה
• "ההערות שלי" — הצג הערות
• "הוסף אירוע ... 2026-07-01 14:00" — יומן
• "היומן שלי" — הצג אירועים
• "מה השעה" / "מה התאריך"
• "חשב 15*3+7" — מחשבון
• "הטל מטבע" / "הטל קובייה"
• "מספר אקראי 1 100"
• "טיימר 5 דקות" — טיימר
• "בדיחה" / "עובדה"
ולשאלות מורכבות יותר — אשתמש ב-AI.`
      : `🤖 Here's what I can do offline:
• "add task ..." — task management
• "my tasks" — show tasks
• "done ..." — complete a task
• "note ..." — save a note
• "my notes" — show notes
• "add event ... 2026-07-01 14:00" — calendar
• "my calendar" — show events
• "what time" / "what date"
• "calculate 15*3+7" — calculator
• "flip a coin" / "roll a dice"
• "random number 1 100"
• "timer 5 minutes" — timer
• "joke" / "fun fact"
For complex questions — I'll use AI.`;
  }

  return null;
}
