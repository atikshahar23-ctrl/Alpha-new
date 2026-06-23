import { loadEvents, addEvent, loadTasks, addTask, toggleTask, removeTask, saveNote, loadNotes, clearNotes, type Task } from './state';
import { dailyBriefing, weeklyReport } from '../modules/analytics';
import { startTimer, stopTimer, getActiveTimer, formatDuration, todayTime } from '../modules/timeTracker';
import { calculateScore, scoreLabel } from '../modules/scoring';
import { loadLeads, revenueStats } from '../modules/business';
import { expenseSummary } from '../modules/personal';
import { searchContacts } from '../modules/contacts';
import { loadGoals, activeGoalsSummary } from '../modules/goals';
import { logMood, todayMood, addWater, logSleep, sleepAvg, MOOD_EMOJI, type Mood } from '../modules/wellness';

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

  // --- TODAY SUMMARY ---
  if (/^(today|what's today|היום|מה יש היום|מה קורה היום)\b/i.test(low)) {
    const today = new Date().toISOString().slice(0, 10);
    const evs = loadEvents().filter(e => e.date === today);
    const tasks = loadTasks().filter(t => !t.done);
    let out = he ? `📅 ${formatDate(new Date(), he)}\n\n` : `📅 ${formatDate(new Date(), he)}\n\n`;
    if (evs.length) {
      out += he ? `🗓️ אירועים היום:\n` : `🗓️ Today's events:\n`;
      evs.forEach(e => { out += `• ${e.time ? e.time + ' — ' : ''}${e.title}\n`; });
      out += '\n';
    }
    if (tasks.length) {
      out += he ? `📋 משימות פתוחות: ${tasks.length}\n` : `📋 Open tasks: ${tasks.length}\n`;
      tasks.slice(0, 4).forEach(t => { out += `• ${t.text}\n`; });
      if (tasks.length > 4) out += (he ? `  ועוד ${tasks.length - 4}...` : `  and ${tasks.length - 4} more...`) + '\n';
    }
    if (!evs.length && !tasks.length) out += he ? 'אין אירועים או משימות פתוחות היום 🌟' : 'No events or open tasks today 🌟';
    return out.trim();
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

  // --- DAILY BRIEFING ---
  if (/\b(briefing|brief me|daily brief|תדריך|סיכום יומי|morning brief)\b/i.test(low)) {
    return dailyBriefing();
  }

  // --- WEEKLY REPORT ---
  if (/\b(weekly report|week report|דוח שבועי|סיכום שבועי)\b/i.test(low)) {
    return weeklyReport();
  }

  // --- TIME TRACKER ---
  if (/^(start timer|track time|start tracking|התחל מעקב|התחל טיימר)\s*/i.test(t)) {
    const project = t.replace(/^(start timer|track time|start tracking|התחל מעקב|התחל טיימר)\s*/i, '').trim() || 'General';
    if (getActiveTimer()) {
      return he ? '⏱️ כבר יש טיימר פעיל. עצור אותו קודם.' : '⏱️ A timer is already running. Stop it first.';
    }
    startTimer(project);
    return he ? `⏱️ מעקב זמן התחיל: ${project}` : `⏱️ Time tracking started: ${project}`;
  }

  if (/\b(stop timer|stop tracking|עצור טיימר|עצור מעקב)\b/i.test(low)) {
    const entry = stopTimer();
    if (!entry) return he ? 'אין טיימר פעיל.' : 'No active timer.';
    return he ? `⏱️ נעצר! ${entry.project} — ${formatDuration(entry.duration)}` : `⏱️ Stopped! ${entry.project} — ${formatDuration(entry.duration)}`;
  }

  if (/\b(time today|tracked time|זמן היום|מעקב זמן)\b/i.test(low)) {
    const td = todayTime();
    if (!td.total) return he ? '⏱️ לא נרשם זמן היום.' : '⏱️ No time tracked today.';
    const lines = td.byProject.map(p => `• ${p.project}: ${formatDuration(p.minutes)}`).join('\n');
    return he ? `⏱️ סה"כ היום: ${formatDuration(td.total)}\n${lines}` : `⏱️ Today total: ${formatDuration(td.total)}\n${lines}`;
  }

  // --- ALPHA SCORE ---
  if (/\b(my score|alpha score|הציון שלי|ביצועים|score)\b/i.test(low)) {
    const sc = calculateScore();
    const label = scoreLabel(sc.total);
    return he
      ? `⚡ ציון אלפא: ${sc.total}/100 (${label})\nמשימות: ${sc.tasks}/20 | הרגלים: ${sc.habits}/15 | מיקוד: ${sc.focus}/15\nעסקי: ${sc.business}/20 | יעדים: ${sc.goals}/15 | בריאות: ${sc.wellness}/15${sc.streak ? `\n🔥 רצף: ${sc.streak} ימים` : ''}`
      : `⚡ Alpha Score: ${sc.total}/100 (${label})\nTasks: ${sc.tasks}/20 | Habits: ${sc.habits}/15 | Focus: ${sc.focus}/15\nBusiness: ${sc.business}/20 | Goals: ${sc.goals}/15 | Wellness: ${sc.wellness}/15${sc.streak ? `\n🔥 Streak: ${sc.streak} days` : ''}`;
  }

  // --- REVENUE / BUSINESS SUMMARY ---
  if (/\b(revenue|sales|income|הכנסות|מכירות|pipeline|פייפליין)\b/i.test(low)) {
    try {
      const rev = revenueStats();
      const leads = loadLeads();
      const open = leads.filter(l => l.status !== 'won' && l.status !== 'lost').length;
      return he
        ? `💰 סיכום עסקי:\nהכנסות: ₪${rev.realised.toLocaleString()}\nפייפליין: ₪${rev.pipeline.toLocaleString()}\nשיעור סגירה: ${Math.round(rev.winRate * 100)}%\nלידים פתוחים: ${open}`
        : `💰 Business summary:\nRevenue: ₪${rev.realised.toLocaleString()}\nPipeline: ₪${rev.pipeline.toLocaleString()}\nWin rate: ${Math.round(rev.winRate * 100)}%\nOpen leads: ${open}`;
    } catch { return he ? 'אין נתונים עסקיים עדיין.' : 'No business data yet.'; }
  }

  // --- EXPENSES ---
  if (/\b(expenses|spending|my spending|הוצאות|כמה הוצאתי)\b/i.test(low)) {
    try {
      const exp = expenseSummary();
      let out = he ? `💸 הוצאות החודש: ₪${exp.monthTotal.toLocaleString()}\n` : `💸 This month: ₪${exp.monthTotal.toLocaleString()}\n`;
      if (exp.byCategory.length) {
        out += exp.byCategory.slice(0, 5).map(c => `• ${c.category}: ₪${c.total.toLocaleString()}`).join('\n');
      }
      return out;
    } catch { return he ? 'אין הוצאות.' : 'No expenses recorded.'; }
  }

  // --- GOALS ---
  if (/\b(my goals|goals|יעדים|המטרות שלי)\b/i.test(low)) {
    try {
      const gs = activeGoalsSummary();
      const goals = loadGoals();
      if (!goals.length) return he ? '🎯 אין יעדים. הוסף ביעדים בלוח הבקרה.' : '🎯 No goals set. Add goals in the cockpit.';
      let out = he ? `🎯 יעדים: ${gs.total} (${gs.completed} הושלמו, ${gs.avgProgress}% ממוצע)\n` : `🎯 Goals: ${gs.total} (${gs.completed} done, ${gs.avgProgress}% avg)\n`;
      out += goals.slice(0, 5).map(g => {
        const done = g.milestones.filter(m => m.done).length;
        const total = g.milestones.length;
        return `• ${g.title} [${total ? Math.round((done / total) * 100) : 0}%]`;
      }).join('\n');
      return out;
    } catch { return he ? 'שגיאה בטעינת יעדים.' : 'Error loading goals.'; }
  }

  // --- CONTACTS SEARCH ---
  if (/^(find contact|search contact|חפש איש קשר|מצא)\s+/i.test(t)) {
    const query = t.replace(/^(find contact|search contact|חפש איש קשר|מצא)\s*/i, '').trim();
    if (!query) return he ? 'מה לחפש?' : 'Who to find?';
    const results = searchContacts(query);
    if (!results.length) return he ? 'לא נמצאו תוצאות.' : 'No contacts found.';
    return (he ? '📇 נמצאו:\n' : '📇 Found:\n') + results.slice(0, 5).map(c =>
      `• ${c.name || 'Unnamed'}${c.phone ? ' · ' + c.phone : ''}${c.company ? ' · ' + c.company : ''}`
    ).join('\n');
  }

  // --- STATUS / QUICK SUMMARY ---
  if (/\b(status|my status|סטטוס|מה המצב)\b/i.test(low)) {
    const tasks = loadTasks();
    const open = tasks.filter(t => !t.done).length;
    const today = new Date().toISOString().slice(0, 10);
    const events = loadEvents().filter(e => e.date === today);
    const sc = calculateScore();
    const timer = getActiveTimer();
    let out = he ? '📊 סטטוס נוכחי:\n' : '📊 Current status:\n';
    out += he ? `• משימות פתוחות: ${open}\n` : `• Open tasks: ${open}\n`;
    out += he ? `• אירועים היום: ${events.length}\n` : `• Events today: ${events.length}\n`;
    out += he ? `• ציון אלפא: ${sc.total}/100\n` : `• Alpha Score: ${sc.total}/100\n`;
    if (timer) {
      const elapsed = Math.round((Date.now() - timer.startTime) / 60000);
      out += he ? `• טיימר פעיל: ${timer.project} (${elapsed}d)\n` : `• Active timer: ${timer.project} (${elapsed}m)\n`;
    }
    return out.trim();
  }

  // --- WELLNESS COMMANDS ---
  // Log mood
  if (/\b(mood|מצב רוח|איך אני מרגיש|אני מרגיש)\b/i.test(low)) {
    const moodMap: Record<string, Mood> = {
      'great': 'great', 'מעולה': 'great', 'מצוין': 'great', 'נהדר': 'great',
      'good': 'good', 'טוב': 'good', 'בסדר גמור': 'good',
      'okay': 'okay', 'סבבה': 'okay', 'בסדר': 'okay',
      'low': 'low', 'לא טוב': 'low', 'לא נהדר': 'low',
      'bad': 'bad', 'רע': 'bad', 'גרוע': 'bad',
    };
    const found = Object.entries(moodMap).find(([k]) => low.includes(k));
    if (found) {
      logMood(found[1]);
      const emoji = MOOD_EMOJI[found[1]];
      return he ? `${emoji} מצב רוח נרשם: ${found[0]}` : `${emoji} Mood logged: ${found[0]}`;
    }
    const tm = todayMood();
    return he
      ? (tm ? `${MOOD_EMOJI[tm.mood]} מצב הרוח היום: ${tm.mood} | אנרגיה: ${tm.energy}/5` : 'לא נרשם מצב רוח היום. תגיד "מצב רוח טוב" לרישום.')
      : (tm ? `${MOOD_EMOJI[tm.mood]} Today's mood: ${tm.mood} | Energy: ${tm.energy}/5` : 'No mood logged today. Say "mood good" to log it.');
  }

  // Water tracker
  if (/\b(water|שתיתי מים|שתה מים|מים|כוס מים)\b/i.test(low)) {
    const glasses = addWater(1);
    const goal = 8;
    const bar = '💧'.repeat(Math.min(glasses, goal)) + '○'.repeat(Math.max(0, goal - glasses));
    return he
      ? `💧 ${glasses} כוסות מים היום (יעד: ${goal})\n${bar}`
      : `💧 ${glasses} glasses of water today (goal: ${goal})\n${bar}`;
  }

  // Sleep log
  const sleepMatch = t.match(/\b(?:ישנתי|slept|sleep)\s+(\d+(?:\.\d+)?)\s*(?:שעות|hours?)?/i);
  if (sleepMatch) {
    const hours = parseFloat(sleepMatch[1]);
    logSleep(hours, 3);
    const avg = sleepAvg();
    return he
      ? `😴 ${hours} שעות שינה נרשמו. ממוצע שבועי: ${avg.hours} שעות`
      : `😴 ${hours} hours of sleep logged. Weekly avg: ${avg.hours} hours`;
  }

  // --- QUICK HEBREW COMMANDS (short forms) ---
  if (/^(מה יש מחר|מחר)\b/i.test(low)) {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const evs = loadEvents().filter(e => e.date === tomorrow);
    if (!evs.length) return 'אין אירועים מתוכננים למחר.';
    let out = '📅 מחר:\n';
    evs.forEach(e => { out += `• ${e.time ? e.time + ' — ' : ''}${e.title}\n`; });
    return out.trim();
  }

  if (/^(פיקאצ'ו|פיקצו|pikachu|pika)\b/i.test(low)) {
    return he ? 'פיקה פיקה! ⚡' : 'Pika pika! ⚡';
  }

  // --- HELP ---
  if (/\b(help|what can you do|מה אתה יכול|עזרה|יכולות)\b/i.test(low)) {
    return he
      ? `🤖 הנה מה שאני יכול לעשות בלי אינטרנט:
• "הוסף משימה ..." — ניהול משימות
• "המשימות שלי" — הצג משימות
• "סיימתי ..." — סמן משימה כהושלמה
• "שמור ..." — שמור הערה / "ההערות שלי"
• "הוסף אירוע ... 2026-07-01 14:00" — יומן
• "היומן שלי" — הצג אירועים
• "הכנסות" / "הוצאות" — סיכום פיננסי
• "יעדים" — הצג יעדים
• "חפש איש קשר ..." — חיפוש
• "סטטוס" — סיכום מהיר
• "הציון שלי" — ציון אלפא
• "תדריך" — סיכום יומי
• "מה השעה" / "חשב ..." / "טיימר 5 דקות"
ולשאלות מורכבות — AI.`
      : `🤖 Here's what I can do offline:
• "add task ..." / "my tasks" / "done ..."
• "note ..." / "my notes"
• "add event ... 2026-07-01 14:00" / "my calendar"
• "revenue" / "expenses" — financial summary
• "my goals" — goal progress
• "find contact ..." — contact search
• "status" — quick overview
• "my score" — Alpha Score
• "briefing" — daily brief
• "what time" / "calculate ..." / "timer 5 min"
• "joke" / "fun fact" / "flip coin" / "roll dice"
For complex questions — I'll use AI.`;
  }

  return null;
}
