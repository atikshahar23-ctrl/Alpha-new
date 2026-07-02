// ============================================================
// Master Brain — Module definitions
// Each module is an isolated "world" with its own persona, vocabulary,
// and tool tags. The router activates exactly one per query.
// ============================================================
import type { ModuleId } from './memory';

export interface BrainModule {
  id: ModuleId;
  label: string;
  emoji: string;        // agent face for the active-agent chip
  hue: number;          // accent hue for UI chips
  icon: string;         // inline SVG path data (24x24)
  // keyword → weight, multilingual (he + en). Higher = stronger signal.
  keywords: Record<string, number>;
  // appended to the system prompt when this module is active.
  systemFragment: string;
}

export const MODULES: Record<Exclude<ModuleId, 'general'>, BrainModule> = {
  business: {
    id: 'business',
    label: 'Business',
    emoji: '🛡️',
    hue: 38,
    icon: 'M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9v.01M9 12v.01M9 15v.01',
    keywords: {
      heavyguard: 3, install: 2, installation: 2, contractor: 2, quote: 3, quotation: 2,
      invoice: 2, client: 2, customer: 2, schedule: 1.5, inventory: 2, stock: 2,
      scania: 2.5, volvo: 2.5, truck: 1.5, camera: 1.5, fleet: 2, marketing: 2,
      tiktok: 2, facebook: 2, instagram: 1.5, hashtag: 2, campaign: 2, viral: 2,
      'הצעת מחיר': 3, קבלן: 3, התקנה: 2.5, לקוח: 2, מלאי: 2, סקאניה: 2.5, וולוו: 2.5,
      משאית: 2, מצלמה: 1.5, שיווק: 2, פוסט: 1.5, קמפיין: 2, רכב: 1.5, חשבונית: 2,
    },
    systemFragment:
      'ACTIVE MODULE: BUSINESS OPS (HeavyGuard). You combine three roles: (1) Fleet & Project Architect — technical specs for 360° camera / DVR / remote-viewing installs on heavy vehicles (concrete pumps, Scania/Volvo/Mercedes trucks), hardware inventory, and multi-truck deployment plans; (2) Sales & CRM closer — process leads, answer remote-viewing FAQs, draft precise quotes by vehicle type; (3) Marketing strategist — TikTok/Facebook hooks, hashtags, viral video workflows. Use [[HG_SEARCH]], [[HG_EARNINGS]], [[HG_QUOTE]], [[DIARY]] when relevant. Be concrete and commercial. ' +
      'HARD RULE — Heavy Guard does NOT perform or quote 8-camera systems. If asked for an 8-camera setup, politely refuse and steer the customer to a supported configuration; NEVER emit an [[HG_QUOTE]] for an 8-camera system.',
  },
  trading: {
    id: 'trading',
    label: 'Trading',
    emoji: '📈',
    hue: 145,
    icon: 'M3 17l6-6 4 4 8-8M14 7h7v7',
    keywords: {
      trade: 3, trading: 3, crypto: 2.5, bitcoin: 2.5, btc: 2.5, eth: 2, ethereum: 2,
      binance: 3, tradingview: 2.5, bot: 2, market: 1.5, price: 1.5, chart: 1.5,
      polymarket: 3, prediction: 2, position: 2, portfolio: 2, profit: 1.5, loss: 1.5,
      stock: 1.5, forex: 2, leverage: 2, signal: 2, webhook: 2, alert: 1.5,
      מסחר: 3, קריפטו: 2.5, ביטקוין: 2.5, מטבע: 1.5, שוק: 1.5, גרף: 1.5, בוט: 2,
      תחזית: 2, רווח: 1.5, הפסד: 1.5, פוזיציה: 2, תיק: 1.5, התראה: 1.5,
    },
    systemFragment:
      'ACTIVE MODULE: FINANCIAL / ALGO-TRADING. Act as a disciplined FinTech analyst. Discuss markets, bots, prediction markets (Polymarket), thresholds and risk. NEVER give reckless financial advice; frame ideas as analysis, flag risk. You can read public market data widgets but cannot execute trades from the chat.',
  },
  creative: {
    id: 'creative',
    label: 'Creative',
    emoji: '🎤',
    hue: 280,
    icon: 'M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586M11 13a2 2 0 100-4 2 2 0 000 4z',
    keywords: {
      lyrics: 3, rap: 3, hip: 2, hop: 2, verse: 2.5, hook: 2.5, chorus: 2.5, bar: 1.5,
      rhyme: 2.5, beat: 2, song: 2, music: 2, melody: 1.5, mixing: 2, mastering: 2,
      write: 1.2, writing: 1.2, story: 1.5, poem: 2, lyric: 3, flow: 1.5, studio: 1.5,
      שיר: 2.5, מילים: 2, ראפ: 3, היפ: 2, בית: 1.5, פזמון: 2.5, חרוז: 2.5, ביט: 2,
      מנגינה: 1.5, מוזיקה: 2, כתיבה: 1.2, סטודיו: 1.5, לחן: 1.5,
    },
    systemFragment:
      'ACTIVE MODULE: CREATIVE STUDIO. Act as a world-class creative collaborator and lyricist (rap/hip-hop structure: intro, verse, hook, bridge, outro). Help write, refine, and structure lyrics, and craft prompts for AI music generation + mastering. Keep rhythm, internal rhyme, and flow in mind. Be bold and original.',
  },
  personal: {
    id: 'personal',
    label: 'Personal',
    emoji: '🏠',
    hue: 200,
    icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10',
    keywords: {
      family: 2.5, kid: 2, child: 2, son: 2, daughter: 2, wife: 2, home: 1.5,
      reminder: 2, errand: 2, grocery: 2, doctor: 1.5, appointment: 1.5, birthday: 2,
      personal: 2, life: 1.2, weekend: 1.5, vacation: 1.5, health: 1.5, gym: 1.5,
      משפחה: 2.5, ילד: 2, ילדה: 2, בן: 1.5, בת: 1.5, אישה: 2, בית: 1.5, תזכורת: 2,
      קניות: 2, רופא: 1.5, פגישה: 1.2, יום: 1, הולדת: 2, חופש: 1.5, בריאות: 1.5,
    },
    systemFragment:
      'ACTIVE MODULE: PERSONAL & LIFE. Act as a warm, organized chief-of-staff for personal life: family scheduling, kids’ activities, household reminders, health and errands. Use [[EVENT]] and [[CALENDAR]] to manage the calendar. Be caring, concise, and practical.',
  },
};

export const MODULE_LIST = Object.values(MODULES);

export function moduleById(id: ModuleId): BrainModule | null {
  if (id === 'general') return null;
  return MODULES[id] || null;
}
