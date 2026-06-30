import { mountOrb, setCryEnabled, type OrbHandle } from '../orb/OrbScene';
import { mountFlowLines } from '../bg/flowLines';
import { loadState, saveState, addEvent, addTask, scheduleTask, saveNote, loadEvents, loadTasks, removeEvent, type AppState, type TextLang, type AIProvider, type VoiceGender, type UILang } from '../assistant/state';
import { askAIStream, askOnce, askVision, runTags } from '../assistant/gemini';
import { GEN1 } from '../data/gen1';
import * as THREE from 'three';
import { tryLocalCommand } from '../assistant/local';
import { VoiceEngine } from '../assistant/voice';
import { AudioEngine, type AmbientPreset } from '../assistant/audio';
import { orchestrate, refreshSummary, moduleById, loadMemory, updateProfile, prepareRecall } from '../brain';
import { type CockpitHandle } from '../modules/cockpit';
import { runProactive } from '../modules/proactive';
import { processRecurring } from '../modules/recurring';
import * as driveSync from '../modules/driveSync';
import * as puterSync from '../modules/puterSync';
import { setPikaVolume, setPikaPitch, setPikaEnabled, pikaSpeak, setChirpCallback, unlockAudio } from '../assistant/pikaVoice';
import { setActiveCharacter, playCharacterCry, stopCharacterVoice, setCharacterVolume, unlockCharacterAudio, setCharacterVoiceEnabled } from '../assistant/characterVoice';
import { throwPokeball } from '../effects/pokeballFx';
import { universalSearch, TYPE_ICONS, addRecentSearch, recentSearches, quickSuggestions } from '../modules/search';
import { registerShortcut, initShortcuts, shortcutsHTML } from '../modules/shortcuts';
import { dailyBriefing } from '../modules/analytics';
import { startTimer, stopTimer, formatDuration, getActiveTimer } from '../modules/timeTracker';
import { saveChatMessage, loadChatHistory, clearChatHistory } from '../modules/chatHistory';
import { trackSentiment, averageSentiment } from '../modules/sentiment';
import { calculateScore, scoreLabel } from '../modules/scoring';
import { toastInfo } from '../modules/toast';
import { checkIntegrity, repairCorrupted } from '../modules/dataIntegrity';

const UI_STRINGS: Record<string, Record<UILang, string>> = {
  appTitle: { he: 'אלפא עוזר אישי', en: 'ALPHA ASSISTANT' },
  settings: { he: 'הגדרות', en: 'SETTINGS' },
  newChat: { he: 'חדש', en: 'NEW' },
  system: { he: 'מערכת', en: 'SYSTEM' },
  online: { he: '● מחובר', en: '● ONLINE' },
  neuralActivity: { he: 'פעילות עצבית', en: 'NEURAL ACTIVITY' },
  performance: { he: 'ביצועים', en: 'PERFORMANCE' },
  aiEngine: { he: 'מנוע AI', en: 'AI ENGINE' },
  ready: { he: 'מוכן', en: 'Ready' },
  audioSpectrum: { he: 'ספקטרום שמע', en: 'AUDIO SPECTRUM' },
  session: { he: 'סשן', en: 'SESSION' },
  msgs: { he: 'הודעות', en: 'MSGS' },
  tokens: { he: 'טוקנים', en: 'TOKENS' },
  uptime: { he: 'זמן פעיל', en: 'UPTIME' },
  liveStatus: { he: 'סטטוס חי', en: 'LIVE STATUS' },
  output: { he: 'פלט', en: 'OUTPUT' },
  standby: { he: 'המתנה', en: 'STANDBY' },
  weather: { he: 'מזג אוויר', en: 'Weather' },
  funFact: { he: 'עובדה', en: 'Fun Fact' },
  music: { he: 'מוזיקה', en: 'Music' },
  search: { he: 'חיפוש', en: 'Search' },
  calendar: { he: 'יומן', en: 'Calendar' },
  joke: { he: 'בדיחה', en: 'Joke' },
  video: { he: 'וידאו', en: 'Video' },
  translate: { he: 'תרגום', en: 'Translate' },
  detect: { he: 'זיהוי', en: 'Detect' },
  heavyguard: { he: 'הביגארד', en: 'HeavyGuard' },
  trading: { he: 'מסחר', en: 'Trading' },
  inputPlaceholder: { he: 'דבר אלי…', en: 'Talk to me…' },
  searchPlaceholder: { he: 'חפש הכל…', en: 'Search everything…' },
  quickActions: { he: 'פעולות מהירות', en: 'Quick Actions' },
  quickTask: { he: '✓ משימה מהירה', en: '✓ Quick Task' },
  quickNote: { he: '📝 הערה מהירה', en: '📝 Quick Note' },
  startTimer: { he: '⏱ התחל טיימר', en: '⏱ Start Timer' },
  briefing: { he: '📊 תדריך', en: '📊 Briefing' },
  fabSearch: { he: '🔍 חיפוש', en: '🔍 Search' },
  settingsTitle: { he: 'אלפא עוזר אישי', en: 'Alpha Assistant' },
  settingsDesc: { he: 'מופעל ע"י Groq — חינמי ומהיר. הוצא מפתח חינם ב-console.groq.com.', en: 'Powered by Groq — free and fast. Get a free key at console.groq.com.' },
  general: { he: 'כללי', en: 'GENERAL' },
  moodColor: { he: 'צבע ומצב רוח', en: 'Color & mood' },
  assistantName: { he: 'שם העוזר', en: 'Assistant name' },
  soundEffects: { he: 'אפקטי סאונד', en: 'Sound effects' },
  haptic: { he: 'משוב רטט', en: 'Haptic feedback' },
  fastMode: { he: '⚡ מצב מהיר (ביצועים)', en: '⚡ Fast mode (performance)' },
  displayMode: { he: 'מצב תצוגה', en: 'Display mode' },
  dmAuto: { he: 'אוטומטי (לפי המכשיר)', en: 'Automatic (by device)' },
  dmMobile: { he: '📱 מצב נייד (קל ומהיר)', en: '📱 Mobile (light & fast)' },
  dmDesktop: { he: '🖥️ מצב מחשב (איכות מלאה)', en: '🖥️ Desktop (full quality)' },
  displayModeDesc: { he: 'בחר מצב נייד אם המערכת איטית באייפד/טאבלט. הדף ייטען מחדש לאחר שינוי.', en: 'Choose Mobile if the app runs slow on iPad/tablet. The page reloads after changing.' },
  voiceLang: { he: 'קול ושפה', en: 'VOICE & LANGUAGE' },
  micLang: { he: 'שפת מיקרופון', en: 'Mic language' },
  voiceLangLabel: { he: 'שפת דיבור', en: 'Voice language' },
  textReplyLang: { he: 'שפת תשובת טקסט', en: 'Text reply language' },
  sameAsVoice: { he: 'כמו הקול', en: 'Same as voice' },
  voiceGender: { he: 'מגדר קול', en: 'Voice gender' },
  female: { he: 'נקבה', en: 'Female' },
  male: { he: 'זכר', en: 'Male' },
  auto: { he: 'אוטומטי', en: 'Auto' },
  voice: { he: 'קול', en: 'Voice' },
  speed: { he: 'מהירות', en: 'Speed' },
  pitch: { he: 'גובה צליל', en: 'Pitch' },
  autoSpeak: { he: 'דיבור אוטומטי', en: 'Auto speak responses' },
  testVoice: { he: 'בדוק קול', en: 'Test voice' },
  audio: { he: 'שמע', en: 'AUDIO' },
  ambientSound: { he: 'צליל סביבה', en: 'Ambient sound' },
  volume: { he: 'עוצמה', en: 'Volume' },
  aiEngineTitle: { he: 'מנוע AI', en: 'AI ENGINE' },
  aiProvider: { he: 'ספק AI', en: 'AI Provider' },
  groqFree: { he: 'Groq — חינם ומהיר (Llama)', en: 'Groq — Free & fast (Llama)' },
  groqDesc: { he: 'Groq חינמי ומהיר (Llama 3.3). הוצא מפתח חינם ב-console.groq.com והדבק כאן — בלי כרטיס אשראי ובלי חיוב. שאר המפתחות למטה אופציונליים.', en: 'Groq is free & fast (Llama 3.3). Get a free key at console.groq.com and paste it here — no credit card, no billing. Other keys below are optional fallbacks.' },
  geminiKey: { he: 'מפתח Gemini API', en: 'Gemini API key' },
  groqKey: { he: 'מפתח Groq API (חינם)', en: 'Groq API key (free)' },
  grokKey: { he: 'מפתח Grok API', en: 'Grok API key' },
  openaiKey: { he: 'מפתח OpenAI API', en: 'OpenAI API key' },
  cloudSync: { he: 'סנכרון ענן', en: 'CLOUD SYNC' },
  cloudSyncDesc: { he: 'סנכרן את כל הנתונים ל-Google Drive. דורש Google OAuth Client ID מ-', en: 'Sync all your data to Google Drive. Requires a Google OAuth Client ID from ' },
  connectDrive: { he: 'חבר Google Drive', en: 'Connect Google Drive' },
  backupDrive: { he: 'גיבוי ל-Drive', en: 'Backup to Drive' },
  restoreDrive: { he: 'שחזור מ-Drive', en: 'Restore from Drive' },
  noGoogle: { he: 'אין חשבון Google? ייצא/ייבא קובץ גיבוי ישירות:', en: 'No Google account? Export/import a backup file directly:' },
  exportJson: { he: 'ייצוא JSON', en: 'Export JSON' },
  importJson: { he: 'ייבוא JSON', en: 'Import JSON' },
  connectedServices: { he: 'שירותים מחוברים', en: 'CONNECTED SERVICES' },
  shortcuts: { he: 'קיצורי מקלדת', en: 'KEYBOARD SHORTCUTS' },
  save: { he: 'שמור', en: 'Save' },
  heavyguardOs: { he: 'הביגארד OS', en: 'HEAVYGUARD OS' },
  arCamera: { he: 'מצלמת AR', en: 'AR CAMERA' },
  initCamera: { he: 'מאתחל מצלמה…', en: 'Initializing camera…' },
  uiLanguage: { he: 'שפת מערכת', en: 'System language' },
  pikachuVoice: { he: 'פיקאצ\'ו', en: 'PIKACHU' },
  pikaVoiceOn: { he: 'קולות הדמויות', en: 'Character voices' },
  pikaVolume: { he: 'עוצמת קול פיקאצ\'ו', en: 'Pikachu volume' },
  pikaPitch: { he: 'גובה קול פיקאצ\'ו', en: 'Pikachu pitch' },
  pikaSpeakNow: { he: 'פיקה פיקה!', en: 'Pika Pika!' },
  voiceStudio: { he: '🎙️ אולפן קול', en: '🎙️ VOICE STUDIO' },
  voiceStyle: { he: 'סגנון קול מהיר', en: 'Quick voice style' },
  voiceVolume: { he: 'עוצמת קול', en: 'Voice volume' },
  voiceTestLabel: { he: 'משפט לבדיקה', en: 'Test phrase' },
  voiceTestPh: { he: 'כתוב טקסט לשמיעה…', en: 'Type text to hear…' },
  playVoice: { he: '▶ השמע', en: '▶ Play' },
  resetVoice: { he: '↺ אפס', en: '↺ Reset' },
  vpNatural: { he: 'טבעי', en: 'Natural' },
  vpCalm: { he: 'רגוע ועמוק', en: 'Calm & deep' },
  vpEnergetic: { he: 'אנרגטי', en: 'Energetic' },
  vpFast: { he: 'מהיר', en: 'Fast' },
  vpClear: { he: 'איטי וברור', en: 'Slow & clear' },
  vpDeep: { he: 'עמוק', en: 'Deep' },
  vpRobot: { he: 'רובוט', en: 'Robot' },
  vpChipmunk: { he: 'צ\'יפמאנק', en: 'Chipmunk' },
  vpWhisper: { he: 'לחישה', en: 'Whisper' },
  armed: { he: 'אמור "היי אלפא"', en: 'SAY "HEY ALPHA"' },
  listening: { he: 'מקשיב', en: 'LISTENING' },
  thinking: { he: 'חושב', en: 'THINKING' },
  speaking: { he: 'מדבר', en: 'SPEAKING' },
  you: { he: 'אתה', en: 'YOU' },
  systemLabel: { he: 'מערכת', en: 'SYSTEM' },
  connected: { he: '● מחובר', en: '● Connected' },
  goodNight: { he: 'לילה טוב', en: 'Good night' },
  goodMorning: { he: 'בוקר טוב', en: 'Good morning' },
  goodAfternoon: { he: 'צהריים טובים', en: 'Good afternoon' },
  goodEvening: { he: 'ערב טוב', en: 'Good evening' },
  onlineMsg: { he: 'מחובר. דבר אליי או הקלד.', en: 'online. Talk to me or type.' },
  howCanIHelp: { he: 'איך אפשר לעזור?', en: 'How can I help?' },
  eventsToday: { he: 'אירועים היום', en: 'events today' },
  openTasks: { he: 'משימות פתוחות', en: 'open tasks' },
  youHave: { he: 'יש לך', en: 'You have' },
  and: { he: 'ו-', en: 'and' },
  welcomeSub: { he: 'ה-AI האישי שלך. איך לקרוא לך?', en: 'your personal AI. What should I call you?' },
  letsBegin: { he: 'בוא נתחיל', en: "Let's begin" },
  skipForNow: { he: 'דלג לעת עתה', en: 'Skip for now' },
  niceToMeet: { he: 'נעים להכיר. אני', en: "Great to meet you. I'm" },
  askAnything: { he: '— שאל אותי הכל, או פתח את המוח למודולים שלך.', en: '— ask me anything, or open the Brain for your modules.' },
  speechNotSupported: { he: 'זיהוי דיבור לא נתמך בדפדפן זה.', en: 'Speech recognition is not supported in this browser.' },
  readyMsg: { he: 'מוכן.', en: 'ready.' },
  connectionError: { he: 'שגיאת חיבור', en: 'Connection error' },
  taskAdded: { he: 'משימה נוספה', en: 'Task added' },
  noteSaved: { he: 'הערה נשמרה.', en: 'Note saved.' },
  timerStarted: { he: 'טיימר התחיל', en: 'Timer started' },
  timerStopped: { he: 'הופסק', en: 'Stopped' },
  noResults: { he: 'לא נמצאו תוצאות.', en: 'No results found.' },
  continueGoogle: { he: 'המשך בגוגל ↗', en: 'Continue on Google ↗' },
  searchError: { he: 'שגיאת חיפוש.', en: 'Search error.' },
  calendarEmpty: { he: 'היומן ריק.', en: 'Calendar is empty.' },
};

function t(key: string, lang: UILang): string {
  return UI_STRINGS[key]?.[lang] ?? UI_STRINGS[key]?.en ?? key;
}

export function mountApp(root: HTMLElement) {
  root.innerHTML = `
    <div class="app">
      <div class="char-ambient" id="charAmbient"></div>
      <div class="chrome topL"><div class="topL-txt"><div class="wm" data-i18n="appTitle">אלפא עוזר אישי</div><div class="clk" id="clock">--:--</div><div class="build-ver" id="buildVer">v118 ⚡</div></div></div>
      <div class="chrome topR">
        <button class="chip ghost" id="panelsToggleBtn" title="הסתר/הצג פנלים" aria-label="הסתר פנלים">
          <svg class="pt-hide" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
          <svg class="pt-show" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-7-11-7a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 7 11 7a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        </button>
        <button class="chip ghost" id="charSwapBtn" title="החלף דמות ראשית" aria-label="החלף דמות">
          <span class="csb-ball" aria-hidden="true"></span>
        </button>
        <button class="chip ghost" id="charPoseBtn" title="כיוון דמות" aria-label="כיוון דמות" style="font-size:11px;padding:0 5px;">⚙</button>
        <button class="chip ghost" id="searchBtn" aria-label="Search (Ctrl+K)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
        <button class="chip ghost" id="muteBtn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg></button>
        <button class="chip" id="settingsBtn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> <span data-i18n="settings">הגדרות</span></button>
        <button class="chip ghost" id="newChat"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> <span data-i18n="newChat">חדש</span></button>
      </div>
      <div class="stage" id="stage"></div>
      <canvas id="charSwapFx" class="char-swap-fx"></canvas>
      <canvas id="attackFx" class="attack-fx"></canvas>

      <!-- ════════ HOLOGRAPHIC HUD (gold/white) — main display ════════ -->
      <div class="hud" id="hud">
        <!-- Central core — placeholder until a live 3D figure is imported.
             (The alien appears only in the opening intro, not here.) -->
        <div class="hud-core" id="hudCore">
          <div class="hud-core-glow"></div>
          <svg class="hud-core-ring" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="92" fill="none" stroke="rgba(228,188,99,.5)" stroke-width="1" stroke-dasharray="4 6"/><circle cx="100" cy="100" r="78" fill="none" stroke="rgba(247,232,192,.25)" stroke-width="1"/></svg>
          <div class="hud-core-tag">ALPHA CORE · ONLINE</div>
        </div>

        <!-- Wrapper: transparent on desktop (display:contents → columns keep their
             side positions); on mobile it becomes a clean bottom-anchored flex
             stack so the panels never overlap regardless of card height. -->
        <div class="hud-cols">
        <!-- Left column — Heavy Guard data -->
        <div class="hud-col left">
          <section class="hud-card" id="hudOps">
            <div class="hud-card-h"><span>GLOBAL OPERATIONS</span><i></i></div>
            <div class="hud-card-body">טוען…</div>
          </section>
          <section class="hud-card" id="hudPipe">
            <div class="hud-card-h"><span>CONTRACTOR PIPELINE</span><i></i></div>
            <div class="hud-card-body">טוען…</div>
          </section>
        </div>

        <!-- Right column — live markets + Israel news -->
        <div class="hud-col right">
          <section class="hud-card" id="hudMarkets">
            <div class="hud-card-h"><span>MARKETS · שוק</span><i></i></div>
            <div class="hud-card-body">טוען שווקים…</div>
          </section>
          <section class="hud-card" id="hudNews">
            <div class="hud-card-h"><span>חדשות · ישראל</span><i></i></div>
            <div class="hud-card-body">טוען חדשות…</div>
          </section>
        </div>

        <!-- Fleet & operations — a real panel on the main screen (tap → full center) -->
        <div class="hud-col fleet">
          <section class="hud-card" id="hudFleetPanel">
            <div class="hud-card-h"><span>צי ומבצעים · FLEET</span><i></i></div>
            <div class="hud-card-body">טוען…</div>
          </section>
        </div>
        </div>

        <!-- Heavy Guard shortcut rail -->
        <div class="hud-rail" id="hudRail">
          <button class="hud-sc" id="hudHg" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            <span>HEAVY GUARD OS</span>
          </button>
          <a class="hud-sc" id="hudTrade" href="https://heavt-guard-simulator-1.onrender.com/" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            <span>מערכת מסחר · TRADE</span>
          </a>
          <a class="hud-sc" id="hudAgent" href="/Alpha-new/agent.html" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M17 11l2 2 4-4"/></svg>
            <span>CRM מכירות · איתי</span>
          </a>
          <button class="hud-sc" id="hudFleet" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 17h13v-5l-2-4H3z"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17.5" cy="17.5" r="1.6"/><path d="M16 11h3l2 3v2.5h-3"/></svg>
            <span>צי ומבצעים · CONTROL</span>
          </button>
        </div>
      </div>

      <div id="charRotPanel" class="char-rot-panel" hidden>
        <div class="crp-title" id="crpTitle">כיוון דמות</div>
        <div class="crp-section-label">סיבוב</div>
        <label class="crp-row">X <input type="range" id="crpX" min="-180" max="180" step="1" value="0"><span class="crp-val" id="crpXv">0°</span></label>
        <label class="crp-row">Y <input type="range" id="crpY" min="-180" max="180" step="1" value="0"><span class="crp-val" id="crpYv">0°</span></label>
        <label class="crp-row">Z <input type="range" id="crpZ" min="-180" max="180" step="1" value="0"><span class="crp-val" id="crpZv">0°</span></label>
        <div class="crp-section-label">גודל</div>
        <label class="crp-row">⊕ <input type="range" id="crpS" min="5" max="600" step="1" value="100"><span class="crp-val" id="crpSv">1.00×</span></label>
        <div class="crp-section-label">מיקום (תנועה חופשית במרחב)</div>
        <label class="crp-row">↔ <input type="range" id="crpPX" min="-500" max="500" step="1" value="0"><span class="crp-val" id="crpPXv">0</span></label>
        <label class="crp-row">↕ <input type="range" id="crpPY" min="-500" max="500" step="1" value="0"><span class="crp-val" id="crpPYv">0</span></label>
        <label class="crp-row">⊙ <input type="range" id="crpPZ" min="-500" max="500" step="1" value="0"><span class="crp-val" id="crpPZv">0</span></label>
        <button class="crp-auto" id="crpAuto">⊹ מרכז אוטומטי</button>
        <div class="crp-pin-row">
          <button class="crp-pin" id="crpPin">שמור ככיוון ברירת מחדל</button>
          <button class="crp-reset" id="crpReset">איפוס</button>
        </div>
        <div class="crp-pin-badge" id="crpPinBadge" hidden>✓ כיוון נשמר</div>
      </div>

      <div id="pokemonMenu" class="pokemon-menu" hidden></div>

      <!-- Gesture detection chip (top bar status) -->
      <div id="gesturePanel" class="gesture-indicator" hidden>
        <div class="gp-camera-hidden" aria-hidden="true">
          <video id="gestureVideo" autoplay playsinline muted></video>
          <canvas id="gestureCanvas"></canvas>
        </div>
        <span class="gi-dot"></span>
        <span class="gi-text" id="gestureStatus">זיהוי פעיל</span>
      </div>

      <!-- Open-camera mode: full-screen selfie video with skeleton on top -->
      <video id="gestureLiveVideo" class="gesture-live-video" autoplay playsinline muted hidden></video>

      <!-- Full-screen skeleton overlay (always above everything) -->
      <canvas id="handOverlay" class="hand-overlay" hidden></canvas>

      <!-- Mode chooser: shown when detect button clicked while gesture is off -->
      <div id="gestureModeChooser" class="gesture-mode-chooser" hidden>
        <div class="gmc-card">
          <div class="gmc-title">🖐️ בחר מצב זיהוי ידיים</div>
          <button class="gmc-opt" id="gmcHidden">
            <span class="gmc-ic">👁️‍🗨️</span>
            <div><b>מצלמה נסתרת</b><small>רק שלד הידיים מוצג — המצלמה לא גלויה</small></div>
          </button>
          <button class="gmc-opt" id="gmcOpen">
            <span class="gmc-ic">📷</span>
            <div><b>מצלמה פתוחה</b><small>רואים אותך עם השלד הדיגיטלי</small></div>
          </button>
          <button class="gmc-cancel" id="gmcCancel">ביטול</button>
        </div>
      </div>

      <!-- Gesture cheat-sheet — shown when detection starts, auto-hides after 7s. -->
      <div id="gestureHelp" class="gesture-help" hidden>
        <div class="gh-title">🖐️ שליטה בידיים</div>
        <ul>
          <li><span>✊</span><b>אגרוף</b> — החזק רגע כדי לזמן פוקימון</li>
          <li><span>👎</span><b>אגודל למטה</b> — החזק רגע כדי להעלים</li>
          <li><span>🖐️</span><b>כף יד פתוחה</b> — חופשי לשחק עם הפוקימון</li>
          <li><span>☝️</span><b>הצבעה</b> — סמן נע עם האצבע; החזק על כפתור = לחיצה</li>
          <li><span>🤏</span><b>צביטה</b> — אחיזה וסיבוב הדמות</li>
        </ul>
      </div>

      <!-- Finger-pointing laser cursor — follows the index finger; dwelling on a
           target for 2s selects (clicks) it. -->
      <div id="laserCursor" class="laser-cursor" hidden>
        <div class="lc-ring"></div>
        <div class="lc-dot"></div>
      </div>

      <!-- Summon dock — macOS-style row of Pokéballs (image above, name below).
           Opens on summon; the mic listens and the user picks a Pokémon by name. -->
      <!-- Spinning pokéball shown in the screen centre while the user is choosing
           (by voice or tap) which Pokémon to summon. -->
      <div id="summonOrb" class="summon-orb" hidden>
        <div class="so-inner">
          <div class="so-aura"></div>
          <canvas id="summonOrbCanvas" class="so-canvas"></canvas>
        </div>
      </div>
      <div id="summonDock" class="summon-dock" hidden>
        <div class="sd-hint" id="summonDockHint"><span class="sd-mic">🎙️</span> אמור שם של פוקימון…</div>
        <div class="sd-row" id="summonDockRow"></div>
      </div>

      <aside class="left-panel" id="leftPanel">
        <div class="lp-brand">
          <img class="brand-logo" src="${import.meta.env.BASE_URL}heavyguard-logo.png" alt="HeavyGuard" />
        </div>
        <div class="lp-head">
          <span class="lp-title" data-i18n="system">מערכת</span>
          <span class="lp-status" id="lpStatus" data-i18n="online">● מחובר</span>
        </div>
        <div class="lp-section">
          <div class="lp-label" data-i18n="neuralActivity">פעילות עצבית</div>
          <canvas id="neuralCanvas" class="neural-canvas"></canvas>
        </div>
        <div class="lp-section">
          <div class="lp-label" data-i18n="performance">ביצועים</div>
          <div class="metric-grid">
            <div class="metric">
              <span class="metric-label">CPU</span>
              <div class="metric-bar"><div class="metric-fill" id="cpuBar" style="width:42%"></div></div>
              <span class="metric-val" id="cpuVal">42%</span>
            </div>
            <div class="metric">
              <span class="metric-label">MEM</span>
              <div class="metric-bar"><div class="metric-fill" id="memBar" style="width:67%"></div></div>
              <span class="metric-val" id="memVal">67%</span>
            </div>
            <div class="metric">
              <span class="metric-label">NET</span>
              <div class="metric-bar"><div class="metric-fill net" id="netBar" style="width:23%"></div></div>
              <span class="metric-val" id="netVal">23ms</span>
            </div>
          </div>
        </div>
        <div class="lp-section">
          <div class="lp-label" data-i18n="aiEngine">מנוע AI</div>
          <div class="ai-status">
            <div class="ai-model" id="aiModelDisplay">GPT-4O MINI</div>
            <div class="ai-provider" id="aiProviderDisplay">VIA GROQ</div>
            <div class="ai-latency">
              <span class="latency-dot"></span>
              <span id="aiLatency" data-i18n="ready">מוכן</span>
            </div>
          </div>
        </div>
        <div class="lp-section">
          <div class="lp-label" data-i18n="audioSpectrum">ספקטרום שמע</div>
          <canvas id="waveCanvas" class="wave-canvas"></canvas>
        </div>
        <div class="lp-section">
          <div class="lp-label" data-i18n="session">סשן</div>
          <div class="quick-stats">
            <div class="qs"><span class="qs-val" id="msgCount">0</span><span class="qs-label" data-i18n="msgs">הודעות</span></div>
            <div class="qs"><span class="qs-val" id="tokenCount">0</span><span class="qs-label" data-i18n="tokens">טוקנים</span></div>
            <div class="qs"><span class="qs-val" id="uptimeVal">00:00</span><span class="qs-label" data-i18n="uptime">זמן פעיל</span></div>
          </div>
        </div>
        <div class="lp-section">
          <div class="lp-label" data-i18n="liveStatus">סטטוס חי</div>
          <div class="live-widgets" id="liveWidgets"></div>
        </div>
      </aside>

      <aside class="right-panel" id="rightPanel">
        <div class="rp-head">
          <span class="rp-title" data-i18n="output">פלט</span>
          <div class="rp-connections" id="connections">
            <span class="conn-dot active" title="API"></span>
            <span class="conn-dot" id="connSpotify" title="Spotify"></span>
            <span class="conn-dot" id="connSocial" title="Social"></span>
          </div>
        </div>
        <div class="rp-body" id="rpBody"></div>
      </aside>

      <div class="dock">
        <div class="state" id="state" data-i18n="standby">המתנה</div>
        <div class="mac-dock" id="macDock">
          <button class="dock-item" data-q="What's the weather today?">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg></span>
            <span class="dl" data-i18n="weather">מזג אוויר</span>
          </button>
          <button class="dock-item" data-q="Tell me a fun fact">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17H8v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"/></svg></span>
            <span class="dl" data-i18n="funFact">עובדה</span>
          </button>
          <button class="dock-item" data-q="Play some music on Spotify">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5-1 4-1 4 1 4 1M7 12s2-1.5 5-1.5 5 1.5 5 1.5M6.5 9S9 7 12 7s5.5 2 5.5 2"/></svg></span>
            <span class="dl" data-i18n="music">מוזיקה</span>
          </button>
          <button class="dock-item" data-q="Search the web">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            <span class="dl" data-i18n="search">חיפוש</span>
          </button>
          <button class="dock-item" id="calBtn">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
            <span class="dl" data-i18n="calendar">יומן</span>
            <span class="cal-badge" id="calBadge"></span>
          </button>
          <button class="dock-item" data-q="Tell me a joke">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></span>
            <span class="dl" data-i18n="joke">בדיחה</span>
          </button>
          <button class="dock-item" data-q="Play a video on YouTube">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><polygon points="10,8 16,12 10,16"/></svg></span>
            <span class="dl" data-i18n="video">וידאו</span>
          </button>
          <button class="dock-item" data-q="Translate to Hebrew">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg></span>
            <span class="dl" data-i18n="translate">תרגום</span>
          </button>
          <button class="dock-item" id="detectBtn">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2"/><circle cx="12" cy="10" r="3"/><path d="M7 18c0-2.8 2.2-5 5-5s5 2.2 5 5"/></svg></span>
            <span class="dl" data-i18n="detect">זיהוי</span>
          </button>
        </div>
        <div class="fab-group">
          <button class="hg-fab" id="hgBtn" title="HeavyGuard OS">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <span data-i18n="heavyguard">הביגארד</span>
          </button>
          <a class="hg-fab trade-fab" id="tradeBtn" href="https://heavt-guard-simulator-1.onrender.com/" target="_blank" rel="noopener" title="מערכת מסחר">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
            </svg>
            <span data-i18n="trading">מסחר</span>
          </a>
        </div>
        <div class="bar">
          <button class="ic mic" id="micBtn" title="Hey Alpha"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></button>
          <div class="pill"><input id="input" type="text" placeholder="דבר אלי…" name="alpha-message" autocomplete="off" autocorrect="off" autocapitalize="sentences" data-lpignore="true" data-form-type="other" /></div>
          <button class="ic send" id="sendBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg></button>
        </div>
      </div>
      <div class="win" id="win"><div class="winbox">
        <div class="winhead"><span id="winTitle"></span><button id="winClose">✕</button></div>
        <div class="winbody" id="winBody"></div>
      </div></div>
      <div class="overlay" id="overlay"><div class="card">
        <h2 data-i18n="settingsTitle">אלפא עוזר אישי</h2>
        <p data-i18n="settingsDesc">עובד בחינם מהקופסה דרך Puter — לא צריך מפתח API.</p>

        <div class="settings-section">
          <div class="ss-title" data-i18n="moodColor">צבע ומצב רוח</div>
          <div class="mood-grid" id="moodGrid">
            <button class="mood-opt" data-mood="gold"><span class="mood-dot" style="background:#daa520"></span>זהב</button>
            <button class="mood-opt" data-mood="ocean"><span class="mood-dot" style="background:#3FB4E0"></span>אוקיינוס</button>
            <button class="mood-opt" data-mood="emerald"><span class="mood-dot" style="background:#36D399"></span>אמרלד</button>
            <button class="mood-opt" data-mood="royal"><span class="mood-dot" style="background:#A78BFA"></span>מלכותי</button>
            <button class="mood-opt" data-mood="crimson"><span class="mood-dot" style="background:#FF6B6B"></span>אש</button>
          </div>
        </div>

        <div class="settings-section">
          <div class="ss-title" data-i18n="general">כללי</div>
          <label data-i18n="uiLanguage">שפת מערכת</label>
          <select id="uiLangSel">
            <option value="he">עברית</option>
            <option value="en">English</option>
          </select>
          <label data-i18n="assistantName">שם העוזר</label><input id="nameInput" value="ALPHA" />
          <div class="setting-row">
            <label data-i18n="soundEffects">אפקטי סאונד</label>
            <label class="toggle"><input type="checkbox" id="sfxCheck" /><span class="toggle-slider"></span></label>
          </div>
          <div class="setting-row">
            <label data-i18n="haptic">משוב רטט</label>
            <label class="toggle"><input type="checkbox" id="hapticsCheck" /><span class="toggle-slider"></span></label>
          </div>
          <div class="setting-row">
            <label>🖐️ שלד דיגיטלי בזיהוי ידיים</label>
            <label class="toggle"><input type="checkbox" id="handSkeletonCheck" /><span class="toggle-slider"></span></label>
          </div>
          <div class="setting-row">
            <label data-i18n="fastMode">⚡ מצב מהיר (ביצועים)</label>
            <label class="toggle"><input type="checkbox" id="fastModeCheck" /><span class="toggle-slider"></span></label>
          </div>
          <label data-i18n="displayMode">מצב תצוגה</label>
          <select id="displayModeSel">
            <option value="auto" data-i18n="dmAuto">אוטומטי (לפי המכשיר)</option>
            <option value="mobile" data-i18n="dmMobile">📱 מצב נייד (קל ומהיר)</option>
            <option value="desktop" data-i18n="dmDesktop">🖥️ מצב מחשב (איכות מלאה)</option>
          </select>
          <p style="margin:2px 0 10px;font-size:11px;color:var(--dim)" data-i18n="displayModeDesc">בחר מצב נייד אם המערכת איטית באייפד/טאבלט. הדף ייטען מחדש לאחר שינוי.</p>
        </div>

        <div class="settings-section">
          <div class="ss-title" data-i18n="voiceLang">קול ושפה</div>
          <label data-i18n="micLang">שפת מיקרופון</label>
          <select id="micSel"><option value="he">Hebrew</option><option value="en">English</option><option value="es">Español</option></select>
          <label data-i18n="voiceLangLabel">שפת דיבור</label>
          <select id="replySel"><option value="en">English</option><option value="he">Hebrew</option><option value="es">Español</option></select>
          <label data-i18n="textReplyLang">שפת תשובת טקסט</label>
          <select id="textLangSel">
            <option value="auto" data-i18n="sameAsVoice">כמו הקול</option>
            <option value="en">English</option>
            <option value="he">Hebrew</option>
            <option value="ar">Arabic</option>
            <option value="ru">Russian</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
          </select>
        </div>

        <div class="settings-section voice-studio">
          <div class="ss-title" data-i18n="voiceStudio">🎙️ אולפן קול</div>

          <label data-i18n="voiceStyle">סגנון קול מהיר</label>
          <div class="voice-presets" id="voicePresets">
            <button class="vp-chip" data-preset="natural" data-i18n="vpNatural">טבעי</button>
            <button class="vp-chip" data-preset="calm" data-i18n="vpCalm">רגוע ועמוק</button>
            <button class="vp-chip" data-preset="energetic" data-i18n="vpEnergetic">אנרגטי</button>
            <button class="vp-chip" data-preset="fast" data-i18n="vpFast">מהיר</button>
            <button class="vp-chip" data-preset="clear" data-i18n="vpClear">איטי וברור</button>
            <button class="vp-chip" data-preset="deep" data-i18n="vpDeep">עמוק</button>
            <button class="vp-chip" data-preset="robot" data-i18n="vpRobot">רובוט</button>
            <button class="vp-chip" data-preset="chipmunk" data-i18n="vpChipmunk">צ'יפמאנק</button>
            <button class="vp-chip" data-preset="whisper" data-i18n="vpWhisper">לחישה</button>
          </div>

          <label data-i18n="voiceGender">מגדר קול</label>
          <div class="gender-picker" id="genderPicker">
            <button class="gender-btn" data-g="female"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg> נקבה</button>
            <button class="gender-btn" data-g="male"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="14" r="5"/><path d="M21 3l-6.5 6.5M21 3h-5M21 3v5"/></svg> זכר</button>
            <button class="gender-btn" data-g="auto">אוטומטי</button>
          </div>

          <label data-i18n="voice">קול</label>
          <div class="voice-row">
            <select id="voiceSel"></select>
            <button class="voice-play-btn" id="voicePlayBtn" title="השמע">▶</button>
          </div>

          <label><span data-i18n="speed">מהירות</span> <span id="speedVal" class="range-val">1.0x</span></label>
          <input type="range" id="speedSlider" min="50" max="250" value="100" step="5" />

          <label><span data-i18n="pitch">גובה צליל</span> <span id="pitchVal" class="range-val">1.0</span></label>
          <input type="range" id="pitchSlider" min="0" max="200" value="100" step="5" />

          <label><span data-i18n="voiceVolume">עוצמת קול</span> <span id="voiceVolVal" class="range-val">100%</span></label>
          <input type="range" id="voiceVolSlider" min="0" max="100" value="100" />

          <div class="setting-row">
            <label data-i18n="autoSpeak">דיבור אוטומטי</label>
            <label class="toggle"><input type="checkbox" id="autoSpeakCheck" checked /><span class="toggle-slider"></span></label>
          </div>

          <label data-i18n="voiceTestLabel">משפט לבדיקה</label>
          <input id="voiceTestText" type="text" data-i18n-ph="voiceTestPh" placeholder="כתוב טקסט לשמיעה..." />
          <div class="voice-btn-row">
            <button class="test-voice-btn" id="testVoiceBtn" data-i18n="playVoice">▶ השמע</button>
            <button class="test-voice-btn vstudio-reset" id="resetVoiceBtn" data-i18n="resetVoice">↺ אפס</button>
          </div>
        </div>

        <div class="settings-section">
          <div class="ss-title" data-i18n="audio">שמע</div>
          <label data-i18n="ambientSound">צליל סביבה</label>
          <select id="ambPresetSel">
            <option value="pad">Soft Pad — רקע רך</option>
            <option value="rain">Rain — גשם</option>
            <option value="ocean">Ocean Waves — גלי ים</option>
            <option value="wind">Gentle Wind — רוח</option>
            <option value="cafe">Café — בית קפה</option>
            <option value="fireplace">Fireplace — אח</option>
            <option value="night">Night Crickets — צרצרים</option>
            <option value="stream">Forest Stream — נחל ביער</option>
            <option value="off">Off — כבוי</option>
          </select>
          <label><span data-i18n="volume">עוצמה</span> <span id="ambVal" class="range-val">40%</span></label>
          <input type="range" id="ambSlider" min="0" max="100" value="40" />
        </div>

        <div class="settings-section">
          <div class="ss-title" data-i18n="pikachuVoice">פיקאצ'ו</div>
          <div class="setting-row">
            <label data-i18n="pikaVoiceOn">קולות הדמויות</label>
            <label class="toggle"><input type="checkbox" id="pikaVoiceCheck" checked /><span class="toggle-slider"></span></label>
          </div>
          <label><span data-i18n="pikaVolume">עוצמת קול פיקאצ'ו</span> <span id="pikaVolVal" class="range-val">60%</span></label>
          <input type="range" id="pikaVolSlider" min="0" max="100" value="60" />
          <label><span data-i18n="pikaPitch">גובה קול פיקאצ'ו</span> <span id="pikaPitchVal" class="range-val">1.4</span></label>
          <input type="range" id="pikaPitchSlider" min="50" max="800" value="140" />
          <button class="test-voice-btn" id="pikaSpeakBtn" data-i18n="pikaSpeakNow">פיקה פיקה!</button>
        </div>

        <div class="settings-section">
          <div class="ss-title" data-i18n="aiEngineTitle">מנוע AI</div>
          <label data-i18n="aiProvider">ספק AI</label>
          <select id="providerSel">
            <option value="groq" data-i18n="groqFree">Groq — חינם ומהיר (Llama)</option>
            <option value="gemini">Gemini (Google)</option>
            <option value="grok">Grok (xAI)</option>
            <option value="openai">ChatGPT (OpenAI)</option>
          </select>
          <label data-i18n="groqKey">מפתח Groq API (חינם)</label><input id="groqKeyInput" type="text" class="masked-field" placeholder="gsk_..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" data-lpignore="true" />
          <p style="margin:2px 0 10px;font-size:11px;color:var(--dim)" data-i18n="groqDesc">Groq חינמי ומהיר (Llama 3.3). הוצא מפתח חינם ב-console.groq.com והדבק כאן — בלי כרטיס אשראי ובלי חיוב. שאר המפתחות למטה אופציונליים.</p>
          <label data-i18n="geminiKey">מפתח Gemini API</label><input id="keyInput" type="text" class="masked-field" placeholder="AIza..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" data-lpignore="true" />
          <label data-i18n="grokKey">מפתח Grok API</label><input id="grokKeyInput" type="text" class="masked-field" placeholder="xai-..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" data-lpignore="true" />
          <label data-i18n="openaiKey">מפתח OpenAI API</label><input id="openaiKeyInput" type="text" class="masked-field" placeholder="sk-..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" data-lpignore="true" />
        </div>

        <div class="settings-section">
          <div class="ss-title" data-i18n="cloudSync">סנכרון ענן</div>

          <!-- ── Puter / Google sign-in (primary, zero-setup) ── -->
          <div id="puterSyncBox" style="background:rgba(218,165,32,.06);border:1px solid rgba(218,165,32,.18);border-radius:10px;padding:14px;margin-bottom:14px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span style="font-weight:600;font-size:13px">סנכרון אוטומטי עם Google</span>
            </div>
            <p style="font-size:11px;color:var(--dim);margin:0 0 12px;line-height:1.6">התחבר עם חשבון Google שלך — הנתונים יישמרו בענן ויסתנכרנו בין הטלפון, המחשב והאייפד שלך אוטומטית.</p>
            <div id="puterSignedOut" style="display:flex;flex-direction:column;gap:8px">
              <button id="puterSignInBtn" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:#333;border:1px solid #ddd;border-radius:8px;padding:10px 16px;font-size:13px;font-weight:500;cursor:pointer;width:100%">
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84z"/></svg>
                התחבר עם Google
              </button>
            </div>
            <div id="puterSignedIn" style="display:none;flex-direction:column;gap:8px">
              <div style="display:flex;align-items:center;gap:8px;font-size:12px">
                <span style="width:8px;height:8px;background:#34A853;border-radius:50%;display:inline-block;flex-shrink:0"></span>
                <span id="puterUserLabel" style="color:#34A853;font-weight:500">מחובר</span>
              </div>
              <div class="cloud-status" id="puterStatus"></div>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="cloud-btn" id="puterSyncNowBtn">סנכרן עכשיו ☁️</button>
                <button class="cloud-btn" id="puterRestoreBtn">שחזר מהענן ⬇️</button>
                <button class="cloud-btn" id="puterSignOutBtn" style="background:rgba(255,60,60,.12);border-color:rgba(255,60,60,.3);color:#f87;">התנתק</button>
              </div>
              <div style="margin-top:8px">
                <label style="font-size:11px;color:var(--dim);display:block;margin-bottom:4px">תפקיד מכשיר זה בסנכרון:</label>
                <select id="syncRoleSel" style="font-size:12px;width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(218,165,32,.2);border-radius:6px;color:var(--ink);padding:6px 8px">
                  <option value="primary">📱 ראשי — הטלפון (תמיד מעלה, לא מוריד)</option>
                  <option value="secondary">💻 משני — מחשב / אייפד (תמיד מוריד מהטלפון)</option>
                  <option value="auto">🔄 אוטומטי (לפי זמן)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- ── Fallback: local JSON export/import ── -->
          <details style="margin-top:4px">
            <summary style="font-size:11px;color:var(--dim);cursor:pointer;user-select:none">אפשרויות גיבוי ידניות</summary>
            <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px">
              <div style="display:flex;gap:8px">
                <button class="cloud-btn" id="localExportBtn" data-i18n="exportJson">ייצוא JSON</button>
                <button class="cloud-btn" id="localImportBtn" data-i18n="importJson">ייבוא JSON</button>
              </div>
              <details style="margin-top:4px">
                <summary style="font-size:10px;color:var(--dim);cursor:pointer">חיבור Google Drive ישיר (מתקדם)</summary>
                <div style="margin-top:8px">
                  <label style="font-size:11px">Google OAuth Client ID</label>
                  <input id="driveClientId" type="text" placeholder="xxxx.apps.googleusercontent.com" style="font-size:11px;margin-top:4px" />
                  <div style="display:flex;gap:8px;margin:8px 0;flex-wrap:wrap">
                    <button class="cloud-btn" id="driveConnectBtn">חבר Drive</button>
                    <button class="cloud-btn" id="driveUploadBtn" disabled>גיבוי</button>
                    <button class="cloud-btn" id="driveDownloadBtn" disabled>שחזור</button>
                  </div>
                  <div class="cloud-status" id="driveStatus"></div>
                </div>
              </details>
            </div>
          </details>
        </div>

        <div class="settings-section">
          <div class="ss-title" data-i18n="connectedServices">שירותים מחוברים</div>
          <div class="social-grid">
            <div class="social-item" id="socialSpotify">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5-1 4-1 4 1 4 1M7 12s2-1.5 5-1.5 5 1.5 5 1.5M6.5 9S9 7 12 7s5.5 2 5.5 2"/></svg>
              <span>Spotify</span>
              <input type="text" id="spotifyId" placeholder="Username or URI" />
              <span class="social-status" id="spotifyStatus"></span>
            </div>
            <div class="social-item" id="socialTiktok">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12a4 4 0 104 4V4a5 5 0 005 5"/></svg>
              <span>TikTok</span>
              <input type="text" id="tiktokId" placeholder="@username" />
              <span class="social-status" id="tiktokStatus"></span>
            </div>
            <div class="social-item" id="socialInsta">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg>
              <span>Instagram</span>
              <input type="text" id="instaId" placeholder="@username" />
              <span class="social-status" id="instaStatus"></span>
            </div>
            <div class="social-item" id="socialFb">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              <span>Facebook</span>
              <input type="text" id="fbId" placeholder="Profile URL" />
              <span class="social-status" id="fbStatus"></span>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <div class="ss-title" data-i18n="shortcuts">קיצורי מקלדת</div>
          <div id="shortcutsList" style="font-size:13px"></div>
        </div>

        <button class="go" id="saveBtn" data-i18n="save">שמור</button>
      </div></div>
      <div class="hg-overlay" id="hgOverlay">
        <div class="hg-frame">
          <div class="hg-topbar">
            <span class="hg-topbar-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> הביגארד OS</span>
            <button class="hg-close" id="hgClose">✕</button>
          </div>
          <iframe id="hgIframe" class="hg-iframe" src="" allow="camera;microphone"></iframe>
        </div>
      </div>
      <div class="search-overlay" id="searchOverlay">
        <div class="search-card">
          <div class="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input id="searchInput" type="text" placeholder="חפש הכל…" autocomplete="off" />
            <kbd class="search-esc">ESC</kbd>
          </div>
          <div class="search-results" id="searchResults"></div>
        </div>
      </div>
      <button class="fab" id="fabBtn" title="פעולות מהירות">+</button>
      <div class="fab-menu" id="fabMenu">
        <button class="fab-item" data-action="task" data-i18n="quickTask">✓ משימה מהירה</button>
        <button class="fab-item" data-action="note" data-i18n="quickNote">📝 הערה מהירה</button>
        <button class="fab-item" data-action="timer" data-i18n="startTimer">⏱ התחל טיימר</button>
        <button class="fab-item" data-action="briefing" data-i18n="briefing">📊 תדריך</button>
        <button class="fab-item" data-action="search" data-i18n="fabSearch">🔍 חיפוש</button>
      </div>
      <div class="ar-overlay" id="arOverlay">
        <div class="ar-frame">
          <div class="ar-topbar">
            <span class="ar-topbar-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2"/><circle cx="12" cy="12" r="3"/></svg> מצלמת AR</span>
            <div class="ar-topbar-tools">
              <button class="ar-tool-btn" id="arAddBall" title="כדור">⚽</button>
              <button class="ar-tool-btn" id="arAddCube" title="קוביה">🔲</button>
              <button class="ar-tool-btn" id="arAddStar" title="כוכב">⭐</button>
              <button class="ar-tool-btn" id="arAddDiamond" title="יהלום">💎</button>
              <button class="ar-tool-btn" id="arAddCoin" title="מטבע">🪙</button>
              <button class="ar-tool-btn" id="arAddPortal" title="פורטל">🌀</button>
              <button class="ar-tool-btn ar-fx-btn" id="arFxFire" title="אש">🔥</button>
              <button class="ar-tool-btn ar-fx-btn" id="arFxWater" title="מים">💧</button>
              <button class="ar-tool-btn ar-fx-btn" id="arFxLaser" title="לייזר">⚡</button>
              <button class="ar-tool-btn ar-fx-btn" id="arFxSparkle" title="ניצוצות">✨</button>
              <button class="ar-tool-btn ar-fx-btn" id="arFxRainbow" title="קשת">🌈</button>
              <button class="ar-tool-btn" id="arAddGravity" title="כוח משיכה">🌑</button>
              <button class="ar-tool-btn" id="arAddTrampoline" title="טרמפולינה">🔼</button>
              <button class="ar-tool-btn" id="arClearObjs" title="נקה הכל">🗑️</button>
            </div>
            <button class="ar-close" id="arClose">✕</button>
          </div>
          <div class="ar-viewport" id="arViewport">
            <video id="arVideo" autoplay playsinline muted></video>
            <canvas id="arCanvas"></canvas>
            <canvas id="arFxCanvas"></canvas>
            <canvas id="arObjCanvas"></canvas>
            <canvas id="arCharCanvas"></canvas>
            <div class="ar-hud" id="arHud">
              <div class="ar-status" id="arStatus">מאתחל מצלמה…</div>
              <div class="ar-hand-indicator" id="arHandIndicator"></div>
            </div>
            <div class="ar-game-bar" id="arGameBar">
              <button class="ar-game-btn" id="arGameCatch" title="Catch coins!">🎮 Catch</button>
              <button class="ar-game-btn" id="arGameTarget" title="Hit targets!">🎯 Target</button>
              <button class="ar-game-btn" id="arGameZen" title="Zen mode">🧘 Zen</button>
            </div>
            <div class="ar-buttons" id="arButtons"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const state: AppState = loadState();
  const audio = new AudioEngine();
  audio.ambLevel = state.ambLevel;
  audio.ambPreset = (state.ambPreset || 'pad') as AmbientPreset;
  audio.sfxOn = state.sfxOn;

  setPikaVolume(state.pikaVolume);
  setPikaPitch(state.pikaPitch);
  setPikaEnabled(state.pikaVoiceOn);
  setCharacterVoiceEnabled(state.pikaVoiceOn);   // gate all character cries on startup
  setCryEnabled(state.pikaVoiceOn);

  let orb: OrbHandle;
  try {
    orb = mountOrb($('stage'));
  } catch {
    orb = { setEnergy() {}, pikaEmote() {}, dispose() {}, startBodyDetection() {}, stopBodyDetection() {}, setCharacter() {}, throwPokeball(_o, d) { d && d(); }, setCharacterTransform() {}, getCharacterTransform() { return { x: 0, y: 0, z: 0, s: 1, px: 0, py: 0, pz: 0 }; }, resetCharacterTransform() {}, pinCharacterTransform() {}, hasPinnedTransform() { return false; }, attackCharacter(_c: HTMLCanvasElement) {}, setPerfMode(_o: boolean) {} };
  }
  // Apply the saved performance preference (Fast mode) on startup.
  try { if (localStorage.getItem('alpha_fast_mode') === '1') orb.setPerfMode(true); } catch {}

  // When Pikachu chirps, trigger a brief energy burst in the 3D orb
  setChirpCallback(() => {
    orb.setEnergy(0.95);
    setTimeout(() => orb.setEnergy(0.06), 900);
  });

  // Unlock Web Audio on first user interaction (iOS/Chrome autoplay policy)
  const _unlockOnce = () => { unlockAudio(); document.removeEventListener('pointerdown', _unlockOnce); };
  document.addEventListener('pointerdown', _unlockOnce);

  mountFlowLines(root.querySelector('.app')!);

  function applyUILang(lang: UILang) {
    root.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n!;
      const val = t(key, lang);
      if (el.tagName === 'INPUT') (el as HTMLInputElement).placeholder = val;
      else el.textContent = val;
    });
    root.querySelectorAll<HTMLInputElement>('[data-i18n-ph]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPh!, lang);
    });
    const input = $<HTMLInputElement>('input');
    if (input) input.placeholder = t('inputPlaceholder', lang);
    const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
    if (searchInput) searchInput.placeholder = t('searchPlaceholder', lang);
    const fabBtn = document.getElementById('fabBtn');
    if (fabBtn) fabBtn.title = t('quickActions', lang);
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }
  applyUILang(state.uiLang);

  $<HTMLSelectElement>('uiLangSel').value = state.uiLang;
  $('uiLangSel').addEventListener('change', () => {
    state.uiLang = $<HTMLSelectElement>('uiLangSel').value as UILang;
    applyUILang(state.uiLang);
    saveState(state);
  });

  // ── Master Brain cockpit (Business / Trading / Creative / Personal) ──
  // Lazy-loaded: the cockpit module (~1.7k lines) is only fetched + mounted the
  // first time the user actually opens it, keeping it out of the initial bundle
  // and off the startup critical path.
  let cockpit: CockpitHandle | null = null;
  let cockpitLoading: Promise<CockpitHandle | null> | null = null;
  async function openCockpit() {
    if (cockpit) { cockpit.open(); return; }
    if (!cockpitLoading) {
      cockpitLoading = import('../modules/cockpit')
        .then(m => {
          cockpit = m.mountCockpit(root.querySelector('.app')!, {
            ask: (q: string) => { addMsg(q, 'me'); ask(q); },
            addMsgSys: (msg: string) => addMsg(msg, 'sys'),
          });
          return cockpit;
        })
        .catch(e => { console.error('cockpit mount failed', e); return null; });
    }
    const cp = await cockpitLoading;
    cp?.open();
  }

  // ── Performance: pause the 3D orb + flow-lines background whenever a
  // fullscreen overlay covers them (HeavyGuard, cockpit, AR).
  // We flip a `bg-paused` class on <body>; the render loops check it and skip
  // work. Also pause when the tab is hidden.
  (function setupBgPause() {
    const overlaySelectors = [
      '#hgOverlay', '#arOverlay', '.cockpit-overlay',
    ];
    const update = () => {
      const anyOpen = overlaySelectors.some(sel => {
        const el = document.querySelector(sel);
        return el && el.classList.contains('show');
      });
      document.body.classList.toggle('bg-paused', anyOpen || document.hidden);
    };
    const obs = new MutationObserver(update);
    overlaySelectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    });
    document.addEventListener('visibilitychange', update);
    // Late-mounted overlays (e.g. cockpit) — observe once present.
    setTimeout(() => {
      const cp = document.querySelector('.cockpit-overlay');
      if (cp) obs.observe(cp, { attributes: true, attributeFilter: ['class'] });
      update();
    }, 0);
    update();
  })();

  // Module indicator chip in the top-right cluster.
  const moduleChip = document.createElement('button');
  moduleChip.className = 'chip module-chip';
  moduleChip.id = 'moduleChip';
  moduleChip.innerHTML = `<span class="mc-dot"></span><span class="mc-label">${state.uiLang === 'he' ? 'מוח' : 'BRAIN'}</span>`;
  moduleChip.title = state.uiLang === 'he' ? 'פתח לוח בקרה ראשי' : 'Open Master Brain cockpit';
  moduleChip.onclick = () => openCockpit();
  const topR = root.querySelector('.topR');
  if (topR) topR.insertBefore(moduleChip, topR.firstChild);

  let lastAgentId = '';
  function updateModuleIndicator(moduleId: string) {
    const mod = moduleById(moduleId as any);
    const label = moduleChip.querySelector('.mc-label') as HTMLElement;
    const dot = moduleChip.querySelector('.mc-dot') as HTMLElement;
    if (mod) {
      label.textContent = `${mod.emoji} ${mod.label.toUpperCase()}`;
      dot.style.background = `hsl(${mod.hue}, 70%, 55%)`;
      dot.style.boxShadow = `0 0 8px hsla(${mod.hue}, 70%, 55%, .6)`;
      moduleChip.style.setProperty('--agent-hue', String(mod.hue));
      moduleChip.classList.add('active');
    } else {
      label.textContent = state.uiLang === 'he' ? '🧠 מוח' : '🧠 BRAIN';
      dot.style.background = 'var(--gold)';
      dot.style.boxShadow = '0 0 8px rgba(218,165,32,.5)';
      moduleChip.classList.remove('active');
    }
    // Pulse the chip whenever the active agent changes (visible handoff).
    if (moduleId !== lastAgentId) {
      lastAgentId = moduleId;
      moduleChip.classList.remove('agent-switch');
      void moduleChip.offsetWidth;          // restart the animation
      moduleChip.classList.add('agent-switch');
    }
  }

  // ── Proactive background alerts (installs, trading thresholds, trends) ──
  try {
    runProactive((title: string, body: string) => addMsg(`🔔 ${title} — ${body}`, 'sys'));
  } catch {}
  // ── Process recurring tasks ──
  try {
    const generated = processRecurring();
    if (generated > 0) addMsg(`📋 נוצרו ${generated} משימות חוזרות להיום.`, 'sys');
  } catch {}
  // ── Data integrity check ──
  try {
    const integrity = checkIntegrity();
    if (integrity.corrupted.length) {
      let fixed = 0;
      for (const key of integrity.corrupted) { if (repairCorrupted(key)) fixed++; }
      addMsg(`⚠️ שלמות נתונים: ${integrity.corrupted.length} מאגרים היו פגומים, ${fixed} תוקנו אוטומטית.`, 'sys');
    }
  } catch {}

  // AI capability nodes overlay
  {
    const isMob = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
    const stage = $('stage');
    const nodesEl = document.createElement('div');
    nodesEl.className = 'ai-nodes';
    const labels = isMob
      ? ['Memory','Calendar','Tasks','Search','Translate','Analytics','Assistant','Weather','Music','Notes']
      : ['Researcher','Strategist','Finance','Memory','Design','Calendar','Engineering','Social','Analytics','Ops','Developer','Sales','DM','Chief of Staff'];
    const cx = 50, cy = isMob ? 40 : 50;
    const rx = isMob ? 42 : 44, ry = isMob ? 28 : 40;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'ai-nodes-svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    nodesEl.appendChild(svg);
    const nodeQueries: Record<string, string> = {
      'Researcher': 'Help me research a topic',
      'Strategist': 'Help me plan a strategy',
      'Finance': 'Help me with financial analysis',
      'Memory': 'What do you remember about me?',
      'Design': 'Help me with design',
      'Engineering': 'Help me with engineering',
      'Social': 'Check my social media',
      'Analytics': 'Show me analytics and insights',
      'Ops': 'Help me with operations',
      'Developer': 'Help me write code',
      'Sales': 'Help me with sales strategy',
      'DM': 'Help me draft a message',
      'Chief of Staff': 'What are my priorities today?',
      'Tasks': 'Show me my tasks',
      'Search': 'Search the web for me',
      'Translate': 'Translate something for me',
      'Assistant': 'How can you help me?',
      'Weather': "What's the weather today?",
      'Music': 'Play some music',
      'Notes': 'Help me take notes',
    };
    labels.forEach((lbl, i) => {
      const a = (i / labels.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * rx;
      const y = cy + Math.sin(a) * ry;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(cx)); line.setAttribute('y1', String(cy));
      line.setAttribute('x2', String(x)); line.setAttribute('y2', String(y));
      line.setAttribute('class', 'ai-node-line');
      svg.appendChild(line);
      const dot = document.createElement('div');
      dot.className = 'ai-node';
      dot.style.left = x + '%';
      dot.style.top = y + '%';
      dot.style.pointerEvents = 'all';
      dot.style.cursor = 'pointer';
      dot.innerHTML = `<span class="ai-node-dot"></span><span class="ai-node-lbl">${lbl}</span>`;
      dot.onclick = () => {
        if (lbl === 'Calendar') { openCalendar(); return; }
        const q = nodeQueries[lbl] || `Help me with ${lbl}`;
        audio.send();
        addMsg(q, 'me');
        ask(q);
      };
      nodesEl.appendChild(dot);
    });
    stage.appendChild(nodesEl);
  }

  // Load social connections
  const socials = {
    spotify: localStorage.getItem('alpha_social_spotify') || '',
    tiktok: localStorage.getItem('alpha_social_tiktok') || '',
    insta: localStorage.getItem('alpha_social_insta') || '',
    fb: localStorage.getItem('alpha_social_fb') || '',
  };
  function updateConnIndicators() {
    $('connSpotify').classList.toggle('active', !!socials.spotify);
    $('connSocial').classList.toggle('active', !!(socials.tiktok || socials.insta || socials.fb));
    $('spotifyStatus').textContent = socials.spotify ? '● מחובר' : '';
    $('spotifyStatus').className = 'social-status' + (socials.spotify ? ' on' : '');
    $('tiktokStatus').textContent = socials.tiktok ? '● מחובר' : '';
    $('tiktokStatus').className = 'social-status' + (socials.tiktok ? ' on' : '');
    $('instaStatus').textContent = socials.insta ? '● מחובר' : '';
    $('instaStatus').className = 'social-status' + (socials.insta ? ' on' : '');
    $('fbStatus').textContent = socials.fb ? '● מחובר' : '';
    $('fbStatus').className = 'social-status' + (socials.fb ? ' on' : '');
  }

  function setStatus(s: 'armed' | 'listening' | 'thinking' | 'speaking' | '') {
    const label = { armed: t('armed', state.uiLang), listening: t('listening', state.uiLang), thinking: t('thinking', state.uiLang), speaking: t('speaking', state.uiLang), '': t('standby', state.uiLang) }[s];
    $('state').textContent = label;
    orb.setEnergy(s === 'speaking' ? 0.95 : s === 'listening' ? 0.5 : s === 'armed' ? 0.2 : 0.06);
    if (s === 'listening') orb.pikaEmote('curious');
  }

  const voice = new VoiceEngine(state, (text) => { addMsg(text, 'me'); ask(text); }, setStatus);

  function updateCalBadge() {
    const events = loadEvents();
    const badge = $('calBadge');
    if (events.length > 0) {
      badge.textContent = String(events.length);
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
  updateCalBadge();

  let lpMsgCount = 0;
  let lpTokenCount = 0;

  function renderMarkdown(raw: string): string {
    return raw
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^### (.+)$/gm, '<strong style="display:block;font-size:15px;color:var(--white-glow);margin:6px 0 2px">$1</strong>')
      .replace(/^## (.+)$/gm,  '<strong style="display:block;font-size:16px;color:var(--gold);margin:8px 0 3px;letter-spacing:.3px">$1</strong>')
      .replace(/^# (.+)$/gm,   '<strong style="display:block;font-size:17px;color:var(--gold);margin:10px 0 4px;letter-spacing:.4px">$1</strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:rgba(255,255,255,.1);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:.9em">$1</code>')
      .replace(/^(\d+)\. (.+)$/gm, '<span style="display:block;padding-left:2px"><span style="color:var(--gold);font-weight:600;min-width:18px;display:inline-block">$1.</span> $2</span>')
      .replace(/^[-•] (.+)$/gm, '<span style="display:block;padding-left:4px"><span style="color:var(--gold);margin-right:6px">•</span>$1</span>')
      .replace(/^• (.+)$/gm, '<span style="display:block;padding-left:4px"><span style="color:var(--gold);margin-right:6px">•</span>$1</span>')
      .replace(/\n/g, '<br>');
  }

  // ── Self-correction / reflection ──────────────────────────────────────────
  // Free, instant, client-side: after the assistant answers, validate the syntax
  // of any code it produced (no extra LLM call). JSON is checked with JSON.parse;
  // plain JS is parsed with new Function (compiles, never executes). Module/top-
  // await snippets are skipped to avoid false positives.
  const JS_LANGS = ['js', 'javascript', 'jsx', 'mjs', 'cjs'];
  const CHECK_LANGS = ['json', 'xml', 'svg', 'css', ...JS_LANGS];
  function extractCodeBlocks(text: string): { lang: string; code: string }[] {
    const out: { lang: string; code: string }[] = [];
    const re = /```(\w+)?\n([\s\S]*?)```/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) out.push({ lang: (m[1] || '').toLowerCase(), code: m[2] });
    return out;
  }
  function validateCode(lang: string, code: string): string | null {
    try {
      if (lang === 'json') { JSON.parse(code); return null; }
      if (JS_LANGS.includes(lang)) {
        if (/\b(import|export)\b/.test(code) || /^\s*await\b/m.test(code)) return null; // skip modules/top-await
        // eslint-disable-next-line no-new-func
        new Function(code);   // parses + throws on syntax error; does NOT run
        return null;
      }
      if (lang === 'xml' || lang === 'svg') {
        const doc = new DOMParser().parseFromString(code, 'application/xml');
        const err = doc.querySelector('parsererror');
        return err ? (err.textContent || 'XML parse error').replace(/\s+/g, ' ').trim().slice(0, 140) : null;
      }
      if (lang === 'css') {
        // Brace balance — valid CSS is always balanced; catches the common break
        // without false-positives on well-formed stylesheets.
        let depth = 0;
        for (const ch of code) { if (ch === '{') depth++; else if (ch === '}') { if (--depth < 0) return 'unbalanced "}" in CSS'; } }
        return depth !== 0 ? 'unbalanced "{ }" in CSS' : null;
      }
    } catch (e: any) { return e?.message || 'syntax error'; }
    return null; // unknown language → no claim
  }
  function reflectOnReply(text: string) {
    const blocks = extractCodeBlocks(text).filter(b => CHECK_LANGS.includes(b.lang));
    if (!blocks.length) return;
    const bad = blocks.map(b => ({ b, err: validateCode(b.lang, b.code) })).filter(x => x.err);
    if (bad.length) {
      addMsg(`⚠️ בדיקה עצמית: שגיאת תחביר ב-${bad[0].b.lang} — ${bad[0].err}`, 'sys');
      void autoFixCode(bad[0].b);   // background, non-blocking self-correction
    } else {
      const langs = [...new Set(blocks.map(b => b.lang))].join(', ');
      addMsg(`✓ בדיקה עצמית: התחביר של הקוד (${langs}) תקין`, 'sys');
    }
  }

  // Self-correction: one focused LLM call to repair a broken code block. The fix
  // is only shown if it actually parses clean — otherwise we stay silent and the
  // ⚠ note remains. Runs in the background; never blocks the original reply.
  let autoFixing = false;
  async function autoFixCode(block: { lang: string; code: string }) {
    if (autoFixing) return;
    autoFixing = true;
    try {
      const sys = 'You are a precise code fixer. Fix ONLY syntax errors. Reply with a single corrected code block and nothing else — no explanation.';
      const user = `Fix the syntax error in this ${block.lang} code. Return only the corrected code inside one \`\`\`${block.lang} fenced block:\n\n\`\`\`${block.lang}\n${block.code}\n\`\`\``;
      const out = await askOnce(state, sys, user);
      if (!out) return;
      const fixed = extractCodeBlocks(out).find(b => {
        const lang = b.lang || block.lang;
        return b.code.trim() && validateCode(lang, b.code) === null;
      });
      if (fixed) {
        addMsg(`🔧 תיקון אוטומטי (${block.lang}):\n\`\`\`${block.lang}\n${fixed.code.trim()}\n\`\`\``, 'al');
      }
    } catch {} finally { autoFixing = false; }
  }

  // ── Live screen vision ─────────────────────────────────────────────────────
  // Capture one frame of the user's screen (getDisplayMedia) and ask a vision
  // model about it. Free + client-side. The capture stops immediately (single
  // snapshot), and the frame is downscaled to keep the payload small.
  function isScreenVisionIntent(text: string): boolean {
    const s = text.toLowerCase();
    return /(מה.*(על|ב).*מסך|תראה.*מסך|ראה.*(את ה)?מסך|צלם.*מסך|המסך שלי|מסתכל.*מסך)/.test(s)
      || /(see|look at|read|analyze|check).{0,12}(my )?screen|screen ?vision|share.{0,6}screen|what'?s on (my )?screen/.test(s);
  }
  async function captureScreenFrame(): Promise<string | null> {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: { frameRate: 1 }, audio: false });
      const video = document.createElement('video');
      video.srcObject = stream; video.muted = true;
      await video.play().catch(() => {});
      await new Promise(r => setTimeout(r, 350));   // let a real frame arrive
      const w = video.videoWidth || 1280, h = video.videoHeight || 720;
      const scale = Math.min(1, 1280 / w);
      const cw = Math.round(w * scale), ch = Math.round(h * scale);
      const canvas = document.createElement('canvas'); canvas.width = cw; canvas.height = ch;
      canvas.getContext('2d')!.drawImage(video, 0, 0, cw, ch);
      stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      video.srcObject = null;
      return canvas.toDataURL('image/jpeg', 0.7);
    } catch { return null; }
  }
  async function runScreenVision(text: string) {
    if (asking) return;
    asking = true;
    setStatus('thinking');
    addMsg('👁️ בקש שיתוף מסך כדי שאוכל לראות…', 'sys');
    try {
      const img = await captureScreenFrame();
      if (!img) { addMsg('לא הצלחתי לגשת למסך (השיתוף בוטל או נדחה).', 'sys'); return; }
      showTypingIndicator();
      const q = text.trim() || 'מה אתה רואה על המסך? עזור לי בהקשר.';
      const reply = await askVision(state, `${q}\n\nReply in the user's language, concise and actionable.`, img);
      removeTypingIndicator();
      if (reply) { addMsg(reply, 'al'); voice.speak(reply); }
      else addMsg('המודל לא החזיר תיאור של המסך. נסה שוב או בדוק שספק ה-AI תומך בתמונות.', 'sys');
    } catch (e: any) {
      removeTypingIndicator();
      addMsg('שגיאה בראיית המסך: ' + (e?.message || ''), 'sys');
    } finally {
      asking = false;
      setStatus('');
    }
  }
  (window as any).runScreenVision = runScreenVision;

  let typingTurn: HTMLElement | null = null;

  function showTypingIndicator() {
    const chatEl = $('chat');
    if (!chatEl) return;
    removeTypingIndicator();
    typingTurn = document.createElement('div');
    typingTurn.className = 'turn al typing-turn';
    const label = state.name;
    typingTurn.innerHTML = `<span class="who">${label}</span><div class="txt"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
    chatEl.appendChild(typingTurn);
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  function removeTypingIndicator() {
    if (typingTurn) {
      typingTurn.remove();
      typingTurn = null;
    }
    // also clean up any strays
    $('chat')?.querySelectorAll('.typing-turn').forEach(el => el.remove());
  }

  function addMsg(text: string, who: 'me' | 'al' | 'sys') {
    if (who === 'al') removeTypingIndicator();
    const label = { me: t('you', state.uiLang), al: state.name, sys: t('systemLabel', state.uiLang) }[who];
    // Chat log (bottom)
    const div = document.createElement('div');
    div.className = 'turn ' + who;
    div.innerHTML = `<span class="who">${label}</span><div class="txt"></div>`;
    const chatEl = $('chat');
    if (chatEl) {
      chatEl.appendChild(div);
      const txt = div.querySelector<HTMLElement>('.txt')!;
      if (who === 'al') {
        const speed = text.length > 180 ? 5 : 10;
        let i = 0;
        const tick = () => { txt.innerHTML = renderMarkdown(text.slice(0, i++)); chatEl.scrollTop = chatEl.scrollHeight; if (i <= text.length) setTimeout(tick, speed); };
        tick();
      } else txt.innerHTML = renderMarkdown(text);
      chatEl.scrollTop = chatEl.scrollHeight;
    }
    // Right panel output
    const rp = $('rpBody');
    const rpDiv = document.createElement('div');
    rpDiv.className = 'rp-msg ' + who;
    const time = new Date();
    const ts = `${String(time.getHours()).padStart(2,'0')}:${String(time.getMinutes()).padStart(2,'0')}`;
    rpDiv.innerHTML = `<div class="rp-meta"><span class="rp-who">${label}</span><span class="rp-time">${ts}</span></div><div class="rp-text"></div>`;
    rp.appendChild(rpDiv);
    const rpTxt = rpDiv.querySelector<HTMLElement>('.rp-text')!;
    if (who === 'al') {
      const speed = text.length > 180 ? 5 : 10;
      let i = 0;
      const tick = () => { rpTxt.innerHTML = renderMarkdown(text.slice(0, i++)); rp.scrollTop = rp.scrollHeight; if (i <= text.length) setTimeout(tick, speed); };
      tick();
    } else rpTxt.innerHTML = renderMarkdown(text);
    rp.scrollTop = rp.scrollHeight;
    // Left panel counters
    lpMsgCount++;
    const mcEl = document.getElementById('msgCount');
    if (mcEl) mcEl.textContent = String(lpMsgCount);
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    lpTokenCount += Math.round(words * 1.3);
    const tcEl = document.getElementById('tokenCount');
    if (tcEl) tcEl.textContent = String(lpTokenCount);
    saveChatMessage(text, who);
    if (who === 'me') trackSentiment(text);
  }

  // Hide action tags from the live display: remove complete [[TAG:…]] blocks
  // and any trailing half-streamed "[[" so the user never sees raw tags.
  function stripTagsForDisplay(s: string): string {
    return s.replace(/\[\[[^\]]*\]\]/g, '').replace(/\[\[[^\]]*$/, '');
  }

  // Create an empty assistant bubble (chat + right panel) that updates live as
  // streamed tokens arrive — no fake typewriter, real time-to-first-token.
  function beginStreamMsg() {
    removeTypingIndicator();
    const label = state.name;
    const chatEl = $('chat');
    const div = document.createElement('div');
    div.className = 'turn al streaming';
    div.innerHTML = `<span class="who">${label}</span><div class="txt"></div>`;
    chatEl?.appendChild(div);
    const txt = div.querySelector<HTMLElement>('.txt')!;

    const rp = $('rpBody');
    const rpDiv = document.createElement('div');
    rpDiv.className = 'rp-msg al streaming';
    const time = new Date();
    const ts = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
    rpDiv.innerHTML = `<div class="rp-meta"><span class="rp-who">${label}</span><span class="rp-time">${ts}</span></div><div class="rp-text"></div>`;
    rp?.appendChild(rpDiv);
    const rpTxt = rpDiv.querySelector<HTMLElement>('.rp-text')!;

    // Coalesce updates to one paint per frame (backpressure for chatty streams).
    let pending = '';
    let scheduled = false;
    const flush = () => {
      scheduled = false;
      const html = renderMarkdown(pending);
      txt.innerHTML = html;
      rpTxt.innerHTML = html;
      if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
      if (rp) rp.scrollTop = rp.scrollHeight;
    };
    return {
      update(displayText: string) {
        pending = displayText;
        if (!scheduled) { scheduled = true; requestAnimationFrame(flush); }
      },
      finalize(finalText: string) {
        pending = finalText;
        flush();
        div.classList.remove('streaming');
        rpDiv.classList.remove('streaming');
        lpMsgCount++;
        const mcEl = document.getElementById('msgCount');
        if (mcEl) mcEl.textContent = String(lpMsgCount);
        const words = finalText.split(/\s+/).filter(w => w.length > 0).length;
        lpTokenCount += Math.round(words * 1.3);
        const tcEl = document.getElementById('tokenCount');
        if (tcEl) tcEl.textContent = String(lpTokenCount);
        saveChatMessage(finalText, 'al');
      },
    };
  }

  let winCleanup: (() => void) | null = null;   // teardown for live content (maps, animations)
  function openWin(title: string) { $('winTitle').textContent = title; $('win').classList.add('show'); audio.open(); }
  $('winClose').onclick = () => { try { winCleanup?.(); } catch {} winCleanup = null; $('win').classList.remove('show'); $('winBody').innerHTML = ''; };

  function openVideo(q: string) {
    openWin('Video · ' + q);
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
    $('winBody').innerHTML = `<div class="pad" style="text-align:center">
      <div style="color:var(--dim);margin-bottom:12px;font-size:13px">מחפש ב-YouTube…</div>
    </div>`;
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=4&key=AIzaSyDummyKeyForFallback`)
      .then(() => {})
      .catch(() => {});
    const piped = `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(q)}&filter=videos`;
    fetch(piped).then(r => r.json()).then(d => {
      const items = (d.items || []).slice(0, 6);
      if (!items.length) throw new Error('no results');
      let html = '';
      for (const v of items) {
        const vid = (v.url || '').replace('/watch?v=', '');
        const embedUrl = `https://www.youtube-nocookie.com/embed${vid}`;
        const thumbUrl = v.thumbnail || `https://i.ytimg.com/vi${vid}/hqdefault.jpg`;
        html += `<div class="media-card" data-embed="${embedUrl}">
          <img src="${thumbUrl}" style="width:100%;border-radius:8px;cursor:pointer" onerror="this.style.display='none'" />
          <div style="padding:8px 0 4px;font-size:13px;font-weight:600;color:var(--ink)">${v.title || q}</div>
          <div style="font-size:11px;color:var(--dim)">${v.uploaderName || ''} · ${v.duration ? Math.floor(v.duration/60)+':'+String(v.duration%60).padStart(2,'0') : ''}</div>
        </div>`;
      }
      html += `<div style="text-align:center;margin-top:12px"><a href="${ytSearchUrl}" target="_blank" rel="noopener" style="color:var(--cyan);font-size:12px">חפש עוד ב-YouTube ↗</a></div>`;
      $('winBody').innerHTML = `<div class="pad media-grid">${html}</div>`;
      $('winBody').querySelectorAll<HTMLElement>('.media-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.onclick = () => {
          const embed = card.dataset.embed || '';
          $('winBody').innerHTML = `<iframe src="${embed}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="width:100%;height:100%;border:none"></iframe>`;
        };
      });
    }).catch(() => {
      $('winBody').innerHTML = `<div class="pad" style="text-align:center;padding-top:30px">
        <div style="font-size:40px;margin-bottom:16px">🎬</div>
        <div style="font-size:18px;font-weight:600;color:var(--ink);margin-bottom:8px">${q}</div>
        <div style="color:var(--dim);font-size:13px;margin-bottom:20px">לחץ לפתיחה ב-YouTube</div>
        <a href="${ytSearchUrl}" target="_blank" rel="noopener" class="media-link-btn">▶ YouTube</a>
      </div>`;
    });
  }

  function openSpotify(q: string) {
    openWin('Spotify · ' + q);
    const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(q)}`;
    $('winBody').innerHTML = `<div class="pad" style="text-align:center;padding-top:20px">
      <div style="font-size:40px;margin-bottom:16px">🎵</div>
      <div style="font-size:18px;font-weight:600;color:var(--ink);margin-bottom:8px">${q}</div>
      <div style="color:var(--dim);font-size:13px;margin-bottom:20px">לחץ להאזנה ב-Spotify</div>
      <a href="${searchUrl}" target="_blank" rel="noopener" class="media-link-btn" style="background:rgba(30,215,96,.15);border-color:rgba(30,215,96,.4);color:#1db954">▶ Spotify</a>
      <div style="margin-top:16px">
        <iframe src="https://open.spotify.com/embed/search/${encodeURIComponent(q)}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="width:100%;height:160px;border:none;border-radius:12px" onerror="this.style.display='none'"></iframe>
      </div>
    </div>`;
  }

  function openGDoc(url: string) {
    openWin('Google Doc');
    const embedUrl = url.replace(/\/edit.*$/, '/preview').replace(/\/view.*$/, '/preview');
    $('winBody').innerHTML = `<div style="display:flex;flex-direction:column;height:100%">
      <iframe src="${embedUrl}" style="flex:1;width:100%;border:none;border-radius:8px" allow="autoplay" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>
      <div style="text-align:center;padding:8px">
        <a href="${url}" target="_blank" rel="noopener" class="media-link-btn">פתח ב-Google ↗</a>
      </div>
    </div>`;
  }

  async function openWebSearch(q: string) {
    openWin('Search · ' + q);
    $('winBody').innerHTML = '<div class="pad">מחפש…</div>';
    try {
      const r = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=8`);
      const d = await r.json();
      const items = d.query?.search || [];
      let html = '<div class="pad">';
      if (!items.length) html += '<div style="color:var(--dim)">לא נמצאו תוצאות.</div>';
      for (const it of items)
        html += `<a href="https://en.wikipedia.org/?curid=${it.pageid}" target="_blank" style="display:block;color:var(--ink);padding:14px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:12px;margin-bottom:8px;text-decoration:none;transition:.2s"><b>${it.title}</b><br><span style="color:var(--dim);font-size:13px">${it.snippet}…</span></a>`;
      html += `<a href="https://www.google.com/search?q=${encodeURIComponent(q)}" target="_blank" style="display:inline-block;margin-top:8px;color:var(--cyan);text-decoration:none;padding:8px 16px;border:1px solid rgba(218,165,32,.2);border-radius:8px">המשך בגוגל ↗</a></div>`;
      $('winBody').innerHTML = html;
    } catch { $('winBody').innerHTML = '<div class="pad" style="color:var(--dim)">שגיאת חיפוש.</div>'; }
  }

  let calViewYear = new Date().getFullYear();
  let calViewMonth = new Date().getMonth();

  function renderCalendar(selectedDate?: string) {
    const allEvents = loadEvents();
    const today = new Date().toISOString().slice(0, 10);
    const year = calViewYear;
    const month = calViewMonth;
    const monthNames = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
    const dayNames = ['א','ב','ג','ד','ה','ו','ש'];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Build set of dates that have events
    const eventDates = new Set(allEvents.map(e => e.date));

    // Month grid header
    let html = `<div style="padding:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <button id="calPrev" style="background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:8px;color:var(--ink);padding:6px 12px;cursor:pointer;font-size:16px">‹</button>
        <span style="font-size:17px;font-weight:600;color:var(--ink)">${monthNames[month]} ${year}</span>
        <button id="calNext" style="background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:8px;color:var(--ink);padding:6px 12px;cursor:pointer;font-size:16px">›</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px;text-align:center">
        ${dayNames.map(d => `<div style="color:var(--dim);font-size:11px;padding:4px">${d}</div>`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">
        ${Array(firstDay).fill('<div></div>').join('')}`;

    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = iso === today;
      const isSelected = iso === selectedDate;
      const hasEvent = eventDates.has(iso);
      const bg = isSelected ? 'var(--gold)' : isToday ? 'rgba(218,165,32,.18)' : 'rgba(255,255,255,.03)';
      const color = isSelected ? '#0a0806' : 'var(--ink)';
      const border = isToday && !isSelected ? '1px solid rgba(218,165,32,.5)' : '1px solid transparent';
      html += `<button data-date="${iso}" style="aspect-ratio:1;background:${bg};border:${border};border-radius:8px;color:${color};cursor:pointer;font-size:13px;font-weight:${isToday || isSelected ? '700' : '400'};position:relative;padding:0">
        ${d}${hasEvent ? `<span style="position:absolute;bottom:3px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:${isSelected ? '#0a0806' : 'var(--gold)'}"></span>` : ''}
      </button>`;
    }
    html += `</div>`;

    // If a date is selected, show its events + add form below
    if (selectedDate) {
      const dayEvents = allEvents.filter(e => e.date === selectedDate);
      html += `<div style="margin-top:16px;border-top:1px solid var(--line);padding-top:16px">
        <div style="font-size:13px;color:var(--dim);margin-bottom:10px">${selectedDate}</div>
        ${dayEvents.length === 0 ? '<div style="color:var(--dim);font-style:italic;margin-bottom:12px">אין אירועים</div>' : ''}
        ${dayEvents.map(e => {
          const isHg = e.id.startsWith('hg:');
          return `<div style="display:flex;gap:10px;align-items:center;padding:10px;background:rgba(255,255,255,.03);border:1px solid ${isHg ? 'rgba(255,194,77,.15)' : 'var(--line)'};border-radius:10px;margin-bottom:6px">
            ${e.time ? `<span style="color:var(--cyan);font-size:12px;min-width:40px">${e.time}</span>` : ''}
            <span style="flex:1;font-size:14px">${e.title}</span>
            <button data-id="${e.id}" class="del" style="background:none;border:none;color:var(--dim);cursor:pointer;font-size:15px">✕</button>
          </div>`;
        }).join('')}
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <input id="evT" placeholder="${state.uiLang === 'he' ? 'כותרת אירוע' : 'Event title'}" style="flex:1;min-width:120px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:8px;padding:8px 10px;color:var(--ink);font-size:13px">
          <input type="time" id="evTime" style="background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:8px;padding:8px 10px;color:var(--ink);font-size:13px">
          <button id="evAdd" style="background:linear-gradient(135deg,var(--gold),#c8953a);border:none;border-radius:8px;padding:8px 16px;cursor:pointer;color:#0a0806;font-weight:600;font-size:13px">+</button>
        </div>
      </div>`;
    }

    // ── Unscheduled tasks panel ──────────────────────────────────────────
    // Tasks added without a date live here, beside the calendar. Tap a task (or
    // its 📅 button) while a day is selected to schedule it onto that day.
    const unscheduled = loadTasks().filter(tk => !tk.done && !tk.due);
    html += `<div style="margin-top:16px;border-top:1px solid var(--line);padding-top:14px">
      <div style="font-size:12px;color:var(--dim);margin-bottom:10px;display:flex;align-items:center;gap:6px">
        <span style="color:var(--gold)">◷</span> ${state.uiLang === 'he' ? 'משימות ללא שיבוץ' : 'Unscheduled tasks'}${unscheduled.length ? ` (${unscheduled.length})` : ''}
      </div>`;
    if (unscheduled.length === 0) {
      html += `<div style="color:var(--dim);font-style:italic;font-size:13px">${state.uiLang === 'he' ? 'אין משימות ממתינות לשיבוץ' : 'No tasks waiting to be scheduled'}</div>`;
    } else {
      for (const tk of unscheduled) {
        const pColor = tk.priority === 'high' ? '#c0432e' : tk.priority === 'low' ? '#5a8a50' : 'var(--gold)';
        html += `<div style="display:flex;gap:10px;align-items:center;padding:9px 10px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:10px;margin-bottom:6px">
          <span style="width:6px;height:6px;border-radius:50%;background:${pColor};flex-shrink:0"></span>
          <span style="flex:1;font-size:14px">${tk.text.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!))}</span>
          <button data-sched="${tk.id}" title="${selectedDate ? (state.uiLang === 'he' ? 'שבץ לתאריך הנבחר' : 'Schedule to selected day') : (state.uiLang === 'he' ? 'בחר יום בלוח תחילה' : 'Pick a day first')}" ${selectedDate ? '' : 'disabled'} style="background:${selectedDate ? 'rgba(218,165,32,.14)' : 'rgba(255,255,255,.03)'};border:1px solid var(--line);border-radius:8px;color:${selectedDate ? 'var(--gold)' : 'var(--dim)'};cursor:${selectedDate ? 'pointer' : 'default'};font-size:13px;padding:5px 9px">📅</button>
        </div>`;
      }
    }
    html += `</div>`;

    html += '</div>';
    $('winBody').innerHTML = html;

    $('winBody').querySelectorAll<HTMLButtonElement>('[data-sched]').forEach(b => {
      b.onclick = () => {
        if (!selectedDate) return;
        scheduleTask(b.dataset.sched!, selectedDate);
        updateCalBadge();
        renderCalendar(selectedDate);
      };
    });

    $('calPrev').onclick = () => {
      if (calViewMonth === 0) { calViewMonth = 11; calViewYear--; } else calViewMonth--;
      renderCalendar(selectedDate);
    };
    $('calNext').onclick = () => {
      if (calViewMonth === 11) { calViewMonth = 0; calViewYear++; } else calViewMonth++;
      renderCalendar(selectedDate);
    };
    $('winBody').querySelectorAll<HTMLButtonElement>('[data-date]').forEach(btn => {
      btn.onclick = () => renderCalendar(btn.dataset.date!);
    });
    const evAdd = document.getElementById('evAdd');
    if (evAdd) evAdd.onclick = () => {
      const title = ($('evT') as HTMLInputElement).value.trim();
      const time = ($('evTime') as HTMLInputElement).value;
      if (!title || !selectedDate) return;
      addEvent(title, selectedDate, time);
      updateCalBadge();
      renderCalendar(selectedDate);
    };
    $('winBody').querySelectorAll<HTMLButtonElement>('.del').forEach(b => {
      b.onclick = () => { removeEvent(b.dataset.id!); updateCalBadge(); renderCalendar(selectedDate); };
    });
  }
  function openCalendar() {
    calViewYear = new Date().getFullYear();
    calViewMonth = new Date().getMonth();
    openWin(state.uiLang === 'he' ? 'לוח שנה' : 'Calendar');
    renderCalendar(new Date().toISOString().slice(0, 10));
  }
  (window as any).openCalendar = openCalendar;

  let asking = false;
  async function ask(text: string) {
    // AR Pokemon voice control (switch / dispel) — handled instantly, offline.
    const arReply = tryArVoiceCommand(text);
    if (arReply) {
      audio.receive();
      orb.pikaEmote('excited');
      addMsg(arReply, 'al');
      voice.speak(arReply);
      return;
    }
    const localReply = tryLocalCommand(text);
    if (localReply) {
      audio.receive();
      orb.pikaEmote('excited');
      addMsg(localReply, 'al');
      voice.speak(localReply);
      return;
    }
    // Live screen vision — capture the screen and let the model see it.
    if (isScreenVisionIntent(text)) { await runScreenVision(text); return; }
    const canAI = state.groqKey || state.key || state.grokKey || state.openaiKey;
    if (!canAI) { openSetup(); return; }
    if (asking) return;
    asking = true;
    setStatus('thinking');
    showTypingIndicator();
    // Master Brain: route intent, activate module, inject long-term memory.
    // Compute the on-device query embedding first (free, falls back silently)
    // so recall() can score memory semantically; never blocks the AI call long.
    try { await prepareRecall(text); } catch {}
    try {
      const r = orchestrate(text);
      updateModuleIndicator(r.module);
      if (r.switched && r.module !== 'general') {
        const mod = moduleById(r.module);
        if (mod) addMsg(`▸ ${mod.label} module`, 'sys');
      }
      // Make long-term memory visible: confirm when the assistant learns
      // something durable about the user.
      if (r.captured) {
        const c = r.captured.length > 70 ? r.captured.slice(0, 70) + '…' : r.captured;
        toastInfo(state.uiLang === 'he' ? '💾 נשמר בזיכרון' : '💾 Saved to memory', c);
      }
    } catch {}
    try {
      // Stream tokens into a live bubble (real TTFT). runTags runs on the full
      // reply at the end for side-effects; tags are hidden during streaming.
      const stream = beginStreamMsg();
      const reply = await askAIStream(state, text, (full) => {
        stream.update(stripTagsForDisplay(full));
      });
      const clean = runTags(reply, {
        onVideo: openVideo, onSearch: openWebSearch, onCalendar: openCalendar,
        onEvent: addEvent, onSpotify: openSpotify,
        onDiary: async (title: string, date: string) => {
          const tasks = await hgLoad('hg2:tasks');
          const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
          tasks.unshift({ id, title, date, done: false, ts: Date.now() });
          localStorage.setItem('hg2:tasks', JSON.stringify(tasks));
          puterSync.markDirty();
          puterSync.scheduleSync(() => updateCloudIndicator());
        },
        onHgSearch: hgSearchLicense,
        onHgEarnings: hgShowEarnings,
        onHgQuote: hgCreateQuote,
        onHgReport: async (f: string[]) => {
          const [idNumber, idType, contractor, date, priceStr, vehicleType, manufacturer, installType, location, customer, phone] = f;
          const record = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
            idNumber: idNumber || '', idType: idType || '', contractor: contractor || '',
            date: date || new Date().toISOString().slice(0, 10),
            price: parseFloat(priceStr) || 0,
            vehicleType: vehicleType || '', manufacturer: manufacturer || '',
            installType: installType || '', location: location || '',
            customer: customer || '', phone: phone || '',
            reportedAt: new Date().toISOString(),
          };
          const index = await hgLoad('hg2:index');
          index.unshift(record);
          localStorage.setItem('hg2:index', JSON.stringify(index));
          puterSync.markDirty();
          const timeStr = new Date(record.reportedAt).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
          addMsg(`✅ התקנה נשמרה — ${record.idNumber || 'ללא מספר'} · דווח ב-${timeStr}`, 'sys');
          puterSync.scheduleSync(() => updateCloudIndicator());
        },
        onArCamera: openArCamera,
        onGDoc: openGDoc,
        onTask: (text: string, priority: string, due?: string) => {
          if (!text) return;
          addTask(text, (priority as 'low' | 'med' | 'high') || 'med', due);
          updateCalBadge();
          // Push to the cloud right away so the home-screen widget (a separate
          // storage context) sees the new task without waiting for the next sync.
          puterSync.markDirty();
          puterSync.scheduleSync(() => updateCloudIndicator());
          if (due) {
            addMsg(`✅ ${t('taskAdded', state.uiLang)}: "${text}" — 📅 ${due}`, 'sys');
          } else {
            const note = state.uiLang === 'he' ? ' (ללא שיבוץ ביומן)' : ' (unscheduled)';
            addMsg(`✅ ${t('taskAdded', state.uiLang)}: "${text}"${note}`, 'sys');
          }
        },
        onNote: (text: string) => {
          if (text) { saveNote(text); addMsg(`📝 ${t('noteSaved', state.uiLang)}`, 'sys'); }
        },
        onTimerStart: (project: string) => {
          startTimer(project);
          addMsg(`⏱️ ${t('timerStarted', state.uiLang)}: ${project}`, 'sys');
        },
        onTimerStop: () => {
          const entry = stopTimer();
          if (entry) addMsg(`⏱️ ${t('timerStopped', state.uiLang)}: ${entry.project} — ${formatDuration(entry.duration)}`, 'sys');
        },
      }) || 'Done.';
      audio.receive();
      orb.pikaEmote(Math.random() < 0.65 ? 'happy' : 'excited');
      stream.finalize(clean || 'Done.');
      voice.speak(clean || 'Done.');
      try { reflectOnReply(clean); } catch {}   // self-check any code it produced
      try { refreshSummary(state.history); } catch {}
    } catch (err: any) {
      removeTypingIndicator();
      orb.pikaEmote('sad');
      if (voice.wakeOn) setTimeout(() => voice.setWake(true), 500);
      else setStatus('');
      addMsg(err.message || t('connectionError', state.uiLang), 'sys');
    } finally {
      asking = false;
    }
  }

  function send() {
    const input = $<HTMLInputElement>('input');
    const t = input.value.trim();
    if (!t) return;
    input.value = '';
    voice.stopSpeaking();   // barge-in: silence any current speech immediately
    audio.send();
    addMsg(t, 'me');
    ask(t);
  }
  $('sendBtn').onclick = send;
  $('input').addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  $('micBtn').onclick = () => {
    if (!voice.supported) {
      addMsg(t('speechNotSupported', state.uiLang), 'al');
      return;
    }
    audio.ensure();
    const turningOn = !voice.wakeOn;
    if (turningOn) voice.stopSpeaking();   // barge-in: stop talking when the user starts to listen/speak
    voice.setWake(turningOn);
    $('micBtn').classList.toggle('on', turningOn);
    if (turningOn) audio.micOn(); else audio.micOff();
  };
  $('muteBtn').onclick = () => { audio.toggleMute(); };
  $('newChat').onclick = () => { state.history = []; $('rpBody').innerHTML = ''; $('chat').innerHTML = ''; clearChatHistory(); addMsg(state.name + ' ' + t('readyMsg', state.uiLang), 'al'); };

  // ── Hide / show all panels — leaves only the top bar + the central orb ──
  // State persists so a "clean view" survives reloads. The toggle button lives
  // in the top bar so it stays reachable even when everything else is hidden.
  const appEl = root.querySelector('.app') as HTMLElement;
  const applyPanelsHidden = (hidden: boolean) => {
    appEl.classList.toggle('panels-hidden', hidden);
    const btn = $('panelsToggleBtn');
    btn.title = hidden ? 'הצג פנלים' : 'הסתר פנלים';
    btn.setAttribute('aria-label', hidden ? 'הצג פנלים' : 'הסתר פנלים');
    btn.classList.toggle('active', hidden);
  };
  applyPanelsHidden(localStorage.getItem('alpha_panels_hidden') === '1');
  $('panelsToggleBtn').onclick = () => {
    const hidden = !appEl.classList.contains('panels-hidden');
    localStorage.setItem('alpha_panels_hidden', hidden ? '1' : '0');
    applyPanelsHidden(hidden);
    try { navigator.vibrate?.(state.haptics ? 15 : 0); } catch {}
  };

  // ── Mood color themes — recolor the whole UI via a data-theme attribute ──
  const applyMood = (mood: string) => {
    document.documentElement.setAttribute('data-theme', mood);
    localStorage.setItem('alpha_mood', mood);
    document.querySelectorAll('#moodGrid .mood-opt').forEach(b =>
      b.classList.toggle('on', (b as HTMLElement).dataset.mood === mood));
  };
  applyMood(localStorage.getItem('alpha_mood') || 'gold');
  document.querySelectorAll('#moodGrid .mood-opt').forEach(btn => {
    (btn as HTMLElement).onclick = () => { applyMood((btn as HTMLElement).dataset.mood || 'gold'); try { navigator.vibrate?.(state.haptics ? 12 : 0); } catch {} };
  });

  // (The mobile "minimal mode" — panels auto-hiding after 10s, leaving only a
  //  central record button — was removed per user request. On mobile the panels
  //  now stay visible just like on desktop.)

  // ── Gesture detection — camera hand tracking for Pokemon swap ───────────────
  // Palm held 1.5s → dispel current Pokemon. Fist → quick open → throw new Pokemon.
  {
    let gestureActive = false;
    let gestureShowSkeleton = localStorage.getItem('alpha_hand_skeleton') !== '0';
    // Skeleton toggle checkbox
    const handSkeletonCheck = document.getElementById('handSkeletonCheck') as HTMLInputElement;
    if (handSkeletonCheck) {
      handSkeletonCheck.checked = gestureShowSkeleton;
      handSkeletonCheck.onchange = () => {
        gestureShowSkeleton = handSkeletonCheck.checked;
        localStorage.setItem('alpha_hand_skeleton', gestureShowSkeleton ? '1' : '0');
      };
    }
    let gestureStream: MediaStream | null = null;
    let gestureHands: any = null;
    let gestureCamera: any = null;
    let palmHoldMs = 0;
    let throwCooldownMs = 0;
    let suppressPalmMs = 0;   // after a summon, ignore the open hand for dispel
    let prevScale = 0;        // hand size last frame (kept for re-acquire reset)
    let handPresentMs = 0;    // how long a CONFIDENT, real-sized hand has been held
    const SETTLE_MS = 450;    // ignore the first moments after acquiring a hand
    // Finger-pointing laser cursor + dwell-to-select.
    let pointSX = 0, pointSY = 0;       // smoothed cursor screen position
    let dwellMs = 0;
    let dwellTarget: Element | null = null;
    let clickCooldownMs = 0;
    const DWELL_MS = 1300;              // snappier dwell-to-click (was 2000)
    // Gesture stability/debounce — a pose must be held briefly before it becomes
    // the "confirmed" gesture, so frame-to-frame finger jitter can't make the
    // detector flip between gestures ("go crazy").
    let rawPrev = '';
    let rawStableMs = 0;
    let confirmedGesture = 'none';
    const STABLE_MS = 230;   // a pose must hold this long before it's confirmed
    // Pinch-to-grab manipulation of the orb.
    let pinchActive = false;
    let pinchStartHX = 0, pinchStartHY = 0;
    let pinchStartXf: { x: number; y: number; z: number; s: number; px: number; py: number; pz: number } | null = null;
    const PALM_HOLD_THRESHOLD = 1100;  // hold open palm ~1.1s to release a Pokémon
    const FIST_HOLD_THRESHOLD = 650;   // hold a fist ~0.65s to summon (no throw needed)
    let fistHoldMs = 0;                // how long a confirmed fist has been held
    let ballHeldMs = 0, ballPX = 0, ballPY = 0;   // grabbed-pokéball state (grab→throw)
    const THROW_COOLDOWN = 2200;

    function gestureStatus(msg: string) {
      const el = document.getElementById('gestureStatus');
      if (el) el.textContent = msg;
    }

    // ── Laser-pointer cursor + dwell-to-select ──────────────────────────────
    let lastX = 0, lastY = 0;
    function clickableAt(x: number, y: number): Element | null {
      let el = document.elementFromPoint(x, y);
      while (el) {
        if (el.matches('button,a,input,select,textarea,[role="button"],.sd-item,.ic,.chip,[data-id],[onclick]')) return el;
        el = el.parentElement;
      }
      return null;
    }
    // Fire a full event sequence so even handlers that listen on pointer/mouse
    // (not just click) activate — makes hand-clicking work on any button.
    function fireClick(el: HTMLElement, x: number, y: number) {
      const opts = { bubbles: true, cancelable: true, clientX: x, clientY: y, view: window } as any;
      try { el.dispatchEvent(new PointerEvent('pointerdown', opts)); } catch {}
      try { el.dispatchEvent(new MouseEvent('mousedown', opts)); } catch {}
      try { el.dispatchEvent(new PointerEvent('pointerup', opts)); } catch {}
      try { el.dispatchEvent(new MouseEvent('mouseup', opts)); } catch {}
      try { el.click(); } catch {}
    }
    function updateLaser(x: number, y: number, dt: number) {
      const cur = document.getElementById('laserCursor');
      if (!cur) return;
      lastX = x; lastY = y;
      cur.removeAttribute('hidden');
      cur.style.transform = `translate(${x}px, ${y}px)`;
      const target = clickableAt(x, y);
      if (target && target === dwellTarget) {
        dwellMs += dt;
        const p = Math.min(1, dwellMs / DWELL_MS);
        cur.style.setProperty('--p', String(p));
        cur.classList.add('lc-arming');
        if (dwellMs >= DWELL_MS && clickCooldownMs <= 0) {
          dwellMs = 0; clickCooldownMs = 1400;
          cur.classList.remove('lc-arming');
          cur.style.setProperty('--p', '0');
          fireClick(target as HTMLElement, lastX, lastY);   // dwell-select
          cur.classList.add('lc-fire');
          setTimeout(() => cur.classList.remove('lc-fire'), 300);
        }
      } else {
        dwellTarget = target;
        dwellMs = 0;
        cur.style.setProperty('--p', '0');
        cur.classList.toggle('lc-arming', false);
        cur.classList.toggle('lc-over', !!target);
      }
    }
    function hideLaser() {
      const cur = document.getElementById('laserCursor');
      if (cur) { cur.setAttribute('hidden', ''); cur.classList.remove('lc-arming', 'lc-over', 'lc-fire'); }
      dwellTarget = null; dwellMs = 0; pointSX = 0; pointSY = 0;
    }

    function stopGesture() {
      gestureActive = false;
      try { orb.setPerfMode(localStorage.getItem('alpha_fast_mode') === '1'); } catch {}   // restore orb quality
      if (gestureCamera) { try { gestureCamera.stop(); } catch {} gestureCamera = null; }
      if (gestureHands) { try { gestureHands.close(); } catch {} gestureHands = null; }
      if (gestureStream) { gestureStream.getTracks().forEach(t => t.stop()); gestureStream = null; }
      const vid = document.getElementById('gestureVideo') as HTMLVideoElement | null;
      if (vid) vid.srcObject = null;
      const liveVid = document.getElementById('gestureLiveVideo') as HTMLVideoElement | null;
      if (liveVid) { liveVid.srcObject = null; liveVid.setAttribute('hidden', ''); }
      document.getElementById('gesturePanel')!.setAttribute('hidden', '');
      const ov = document.getElementById('handOverlay') as HTMLCanvasElement | null;
      if (ov) { const c = ov.getContext('2d'); if (c) c.clearRect(0, 0, ov.width, ov.height); ov.setAttribute('hidden', ''); }
      if ((window as any).__sizeHandOverlay) { window.removeEventListener('resize', (window as any).__sizeHandOverlay); (window as any).__sizeHandOverlay = null; }
      const help = document.getElementById('gestureHelp'); if (help) { clearTimeout((help as any).__t); help.setAttribute('hidden', ''); }
      $('detectBtn').classList.remove('active');
      const cur = document.getElementById('laserCursor'); if (cur) cur.setAttribute('hidden', '');
    }

    async function startGesture(camOpen = false) {
      const panel = document.getElementById('gesturePanel')!;
      panel.removeAttribute('hidden');
      $('detectBtn').classList.add('active');
      gestureActive = true;
      gestureStatus('⏳ מאתחל מצלמה…');

      // Pop the gesture cheat-sheet, then fade it out after 7s.
      const help = document.getElementById('gestureHelp');
      if (help) {
        help.removeAttribute('hidden');
        help.classList.remove('gh-out');
        clearTimeout((help as any).__t);
        (help as any).__t = setTimeout(() => {
          help.classList.add('gh-out');
          setTimeout(() => help.setAttribute('hidden', ''), 600);
        }, 7000);
      }

      // Phones can't run MediaPipe's FULL hand model (it stalls and detection never
      // starts), so on mobile we stay on the lite model + a lighter camera. Desktop
      // gets the full model + higher resolution for max accuracy.
      const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || ('ontouchstart' in window) || window.innerWidth < 900;
      // On phones, running the heavy 3D orb AND MediaPipe hand inference at the same
      // time starves the detector of frames → erratic/late detection. Drop the orb to
      // its cheap render path while detecting (restored in stopGesture).
      if (isMobileDevice) { try { orb.setPerfMode(true); } catch {} }
      try {
        const res = isMobileDevice ? { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } } : { width: { ideal: 640 }, height: { ideal: 480 } };
        gestureStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', ...res }, audio: false });
      } catch {
        gestureStatus('❌ גישה למצלמה נדחתה');
        return;
      }
      const vid = document.getElementById('gestureVideo') as HTMLVideoElement;
      const cvs = document.getElementById('gestureCanvas') as HTMLCanvasElement;
      vid.srcObject = gestureStream;
      await vid.play().catch(() => {});
      cvs.width = 320; cvs.height = 240;
      // Open-camera mode: show the full-screen mirrored selfie behind the skeleton.
      const liveVid = document.getElementById('gestureLiveVideo') as HTMLVideoElement | null;
      if (liveVid) {
        if (camOpen) {
          liveVid.srcObject = gestureStream;
          liveVid.removeAttribute('hidden');
          liveVid.play().catch(() => {});
        } else {
          liveVid.srcObject = null;
          liveVid.setAttribute('hidden', '');
        }
      }
      gestureStatus('⏳ טוען זיהוי ידיים…');

      // ── Full-screen transparent overlay: draw the hand as a glowing ghost ──
      const overlay = document.getElementById('handOverlay') as HTMLCanvasElement;
      const octx = overlay.getContext('2d')!;
      overlay.removeAttribute('hidden');
      const sizeOverlay = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        overlay.width = Math.round(window.innerWidth * dpr);
        overlay.height = Math.round(window.innerHeight * dpr);
        octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      sizeOverlay();
      window.addEventListener('resize', sizeOverlay);
      (window as any).__sizeHandOverlay = sizeOverlay;

      if (!(window as any).Hands) {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.min.js';
        s.onerror = () => gestureStatus('❌ טעינת MediaPipe נכשלה');
        document.head.appendChild(s);
        await new Promise<void>((res, rej) => { s.onload = () => res(); setTimeout(() => rej(), 8000); }).catch(() => {
          gestureStatus('❌ טעינת MediaPipe נכשלה');
          stopGesture(); return;
        });
        if (!gestureActive) return;
      }

      const Hands = (window as any).Hands;
      gestureHands = new Hands({ locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${f}` });
      // Mobile = lite model (the full model stalls on phones and detection never
      // starts). Desktop = full model for max accuracy. The One-Euro smoothing +
      // higher tracking confidence still make BOTH far steadier than before.
      // Moderate confidence so the lite mobile model actually detects a hand (0.8
      // was so high it often found nothing → "no skeleton"). False positives are
      // handled downstream by the per-frame `trusted` gate + settle + hold, not by
      // starving detection here.
      gestureHands.setOptions({ maxNumHands: 2, modelComplexity: isMobileDevice ? 0 : 1, minDetectionConfidence: isMobileDevice ? 0.5 : 0.6, minTrackingConfidence: isMobileDevice ? 0.4 : 0.5, selfieMode: true });

      let lastFrameMs = performance.now();

      // ── One-Euro filter: jitter-free yet low-latency landmark smoothing ──────
      // The raw MediaPipe landmarks jitter frame-to-frame, which made gestures
      // flicker and the cursor shake. The One-Euro filter smooths hard when the
      // hand is still (kills jitter) and barely at all when it moves fast (no lag)
      // — the standard technique for hand-tracking pointers. Huge stability win.
      const OE_MINCUT = 1.3, OE_BETA = 0.55, OE_DCUT = 1.0;
      let oePrev: number[][] | null = null, oeDPrev: number[][] | null = null;
      const oeAlpha = (cutoff: number, dtS: number) => { const tau = 1 / (2 * Math.PI * cutoff); return 1 / (1 + tau / dtS); };
      function smoothLandmarks(raw: any[], dtS: number): any[] {
        if (!oePrev || oePrev.length !== raw.length) {
          oePrev = raw.map((p) => [p.x, p.y, p.z]);
          oeDPrev = raw.map(() => [0, 0, 0]);
          return raw.map((p) => ({ x: p.x, y: p.y, z: p.z }));
        }
        const out: any[] = [];
        for (let i = 0; i < raw.length; i++) {
          const r = [raw[i].x, raw[i].y, raw[i].z]; const o = [0, 0, 0];
          for (let k = 0; k < 3; k++) {
            const dx = (r[k] - oePrev[i][k]) / dtS;
            const ad = oeAlpha(OE_DCUT, dtS);
            const dHat = ad * dx + (1 - ad) * oeDPrev![i][k]; oeDPrev![i][k] = dHat;
            const cutoff = OE_MINCUT + OE_BETA * Math.abs(dHat);
            const a = oeAlpha(cutoff, dtS);
            const xHat = a * r[k] + (1 - a) * oePrev[i][k]; oePrev[i][k] = xHat; o[k] = xHat;
          }
          out.push({ x: o[0], y: o[1], z: o[2] });
        }
        return out;
      }

      // Adaptive complexity: if the full model can't sustain a usable framerate on
      // this device, fall back to the lite model live (no reload of the page).
      let cplxLevel = 1, cplxFrames = 0, cplxSum = 0, cplxChecked = false;

      // ── Realistic holographic hand ──────────────────────────────────────────
      // Layered render: a radial-lit palm, a soft translucent "flesh" stroke, a
      // bright energy-core line, and glowing joints/fingertips — reads like a real
      // translucent hand rather than a thin wireframe. Sizes scale with the hand.
      const HCONN = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
      // How large the hand skeleton is drawn (cosmetic only). Much smaller on
      // phones, where the hand fills the front camera and otherwise sprawled.
      const HAND_RENDER_SCALE = isMobileDevice ? 0.5 : 0.85;
      function drawHand(hand: any[], mapX: (n: number) => number, mapY: (n: number) => number, primary: boolean) {
        // Render the skeleton at a controlled size. On phones the front camera
        // fills with the hand, so mapping landmarks straight onto the (contained)
        // frame made the skeleton sprawl across the whole screen. Shrink every
        // landmark toward the hand's own centre by HAND_RENDER_SCALE so the hand
        // is always drawn small & natural, wherever it is — purely cosmetic;
        // gesture math still uses the raw normalised landmarks.
        let cx = 0, cy = 0; for (const p of hand) { cx += p.x; cy += p.y; } cx /= hand.length; cy /= hand.length;
        const k = HAND_RENDER_SCALE;
        const PX = (i: number) => mapX(cx + (hand[i].x - cx) * k), PY = (i: number) => mapY(cy + (hand[i].y - cy) * k);
        const palmR = Math.max(12, Math.hypot(PX(0) - PX(9), PY(0) - PY(9)));
        const a = primary ? 1 : 0.55;
        octx.lineCap = 'round'; octx.lineJoin = 'round';
        // Thin, precise anatomical-style bones with a subtle hologram glow.
        octx.shadowColor = 'rgba(255,205,90,.7)'; octx.shadowBlur = 6;
        octx.strokeStyle = `rgba(255,238,175,${0.9 * a})`;
        octx.lineWidth = Math.max(1.3, palmR * 0.045);
        for (const [p, q] of HCONN) { octx.beginPath(); octx.moveTo(PX(p), PY(p)); octx.lineTo(PX(q), PY(q)); octx.stroke(); }
        // Small precise joints (knuckles), fingertips a touch brighter.
        octx.shadowBlur = 7;
        for (let i = 0; i < 21; i++) {
          const tip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20;
          const r = tip ? Math.max(2.4, palmR * 0.055) : Math.max(1.7, palmR * 0.038);
          octx.beginPath(); octx.arc(PX(i), PY(i), r, 0, Math.PI * 2);
          octx.fillStyle = tip ? `rgba(255,245,195,${0.95 * a})` : `rgba(245,212,135,${0.85 * a})`;
          octx.fill();
        }
        octx.shadowBlur = 0;
      }

      gestureHands.onResults((results: any) => {
        if (!gestureActive) return;
        const now = performance.now();
        const rawDt = now - lastFrameMs;
        const dt = Math.min(200, rawDt);
        lastFrameMs = now;
        // Measure real inference cadence over the first ~40 processed frames.
        if (!cplxChecked) {
          cplxFrames++; cplxSum += rawDt;
          if (cplxFrames >= 40) {
            cplxChecked = true;
            const avg = cplxSum / cplxFrames;
            if (avg > 110 && cplxLevel === 1) {   // < ~9fps → too slow, drop to lite
              cplxLevel = 0;
              try { gestureHands.setOptions({ modelComplexity: 0 }); } catch {}
            }
          }
        }
        const W = window.innerWidth, H = window.innerHeight;
        octx.clearRect(0, 0, W, H);
        // Stretch-map: normalised [0-1] coordinates → full screen pixels so the
        // hand tracks anywhere on screen without dead zones at the edges.
        const mapX = (nx: number) => nx * W;
        const mapY = (ny: number) => ny * H;

        const noHand = () => {
          gestureStatus('הרם יד מול המצלמה');
          palmHoldMs = 0; fistHoldMs = 0; ballHeldMs = 0; prevScale = 0; handPresentMs = 0;
          rawPrev = ''; rawStableMs = 0; confirmedGesture = 'none';
          oePrev = null; oeDPrev = null;   // reset smoothing so re-acquire snaps in
          orb.pokeballRelease?.();
          hideLaser();
        };
        if (!results.multiHandLandmarks?.length) { noHand(); return; }

        // ALWAYS smooth + draw the detected hand so the user sees the skeleton as
        // live feedback. Detection QUALITY gates only the ACTIONS (below) — it never
        // hides the hand, otherwise a slightly-too-far hand looks like the detector
        // is dead (the "no skeleton at all" report).
        // Two-hand support: pick the PRIMARY (largest / closest) hand to drive the
        // gestures, but draw ALL detected hands as holograms.
        const hands: any[][] = results.multiHandLandmarks;
        const spanOf = (h: any[]) => { let mnx = 1, mxx = 0, mny = 1, mxy = 0; for (const p of h) { if (p.x < mnx) mnx = p.x; if (p.x > mxx) mxx = p.x; if (p.y < mny) mny = p.y; if (p.y > mxy) mxy = p.y; } return Math.max(mxx - mnx, mxy - mny); };
        let primaryIdx = 0, bestSpan = -1;
        hands.forEach((h, idx) => { const s = spanOf(h); if (s > bestSpan) { bestSpan = s; primaryIdx = idx; } });
        const rawLm0 = hands[primaryIdx];
        const lm = smoothLandmarks(rawLm0, Math.min(0.05, Math.max(0.012, dt / 1000)));
        // Shrink-map for primary-hand overlay drawing (matches drawHand's scale so
        // the pinch ring sits on the smaller skeleton, not the full-size hand).
        let _pcx = 0, _pcy = 0; for (const p of lm) { _pcx += p.x; _pcy += p.y; } _pcx /= lm.length; _pcy /= lm.length;
        const mapXs = (nx: number) => mapX(_pcx + (nx - _pcx) * HAND_RENDER_SCALE);
        const mapYs = (ny: number) => mapY(_pcy + (ny - _pcy) * HAND_RENDER_SCALE);
        // Quality: handedness confidence + how much of the frame the hand fills.
        const score = results.multiHandedness?.[primaryIdx]?.score ?? 1;
        const handSpan = bestSpan;
        const trusted = score >= (isMobileDevice ? 0.55 : 0.7) && handSpan >= (isMobileDevice ? 0.10 : 0.13);
        if (trusted) handPresentMs += dt; else handPresentMs = 0;
        const armed = trusted && handPresentMs >= SETTLE_MS;
        // Draw every hand (primary uses the smoothed landmarks; others raw).
        if (gestureShowSkeleton) {
          for (let hi = 0; hi < hands.length; hi++) drawHand(hi === primaryIdx ? lm : hands[hi], mapX, mapY, hi === primaryIdx);
        }

        // FINGER-FOLD test — the most reliable open/fist signal there is.
        // For each finger, measure tip→knuckle(MCP) distance ÷ the finger's own first
        // bone (MCP→PIP). Extended fingers give ≈2.2–2.8; a curled finger folds its
        // tip back to the knuckle giving ≈0.2–0.5 — a huge, unambiguous gap. Because
        // it's all distances WITHIN one finger it's fully rotation-invariant (works at
        // any hand angle) and self-normalising (the short pinky reads the same as the
        // long middle finger). The wide dead-zone (1.55 up / 1.25 curl) leaves a
        // relaxed hand as 'none' so nothing fires when idle.
        const d3 = (a: number, b: number) => Math.hypot(lm[a].x - lm[b].x, lm[a].y - lm[b].y, (lm[a].z || 0) - (lm[b].z || 0));
        const fold = (mcp: number, pip: number, tip: number) => d3(mcp, tip) / Math.max(0.0001, d3(mcp, pip));
        const fI = fold(5, 6, 8), fM = fold(9, 10, 12), fR = fold(13, 14, 16), fP = fold(17, 18, 20);
        const idxUp = fI > 1.55, midUp = fM > 1.55, rngUp = fR > 1.55, pkyUp = fP > 1.55;
        const idxCur = fI < 1.25, midCur = fM < 1.25, rngCur = fR < 1.25, pkyCur = fP < 1.25;
        const upCount = [idxUp, midUp, rngUp, pkyUp].filter(Boolean).length;
        const curlCount = [idxCur, midCur, rngCur, pkyCur].filter(Boolean).length;
        const open = upCount >= 4;                         // 🖐️ all fingers extended → free to PLAY
        const fist = upCount === 0 && curlCount >= 3;     // ✊ clearly closed → summon
        const pointing = idxUp && !midUp && !rngUp && !pkyUp;  // ☝️ index only → pointer
        // 👎 Thumbs-down → dismiss the Pokémon. Four fingers curled + the thumb
        // extended and pointing DOWN. A deliberate pose that never fires while an
        // open hand "plays", which is exactly what the open palm used to break.
        const thumbExt = d3(2, 4) / Math.max(0.0001, d3(2, 3)) > 1.5;
        const thumbsDown = upCount === 0 && curlCount >= 3 && thumbExt && (lm[4].y > lm[2].y + 0.03);

        throwCooldownMs = Math.max(0, throwCooldownMs - dt);
        suppressPalmMs = Math.max(0, suppressPalmMs - dt);
        clickCooldownMs = Math.max(0, clickCooldownMs - dt);

        const cx2 = mapX(lm[9].x), cy2 = mapY(lm[9].y);

        // Hand "size" — wrist(0)→middle-MCP(9) distance. Grows as the hand moves
        // toward the camera, independent of fingers opening/closing. Drives the
        // forward-thrust ("throw at the screen") detection.
        const handScale = Math.hypot(lm[0].x - lm[9].x, lm[0].y - lm[9].y);
        if (prevScale === 0) prevScale = handScale;

        // Pinch = thumb tip (4) close to index tip (8). Hysteresis (grab <0.06,
        // hold until >0.11) so the grip doesn't flicker. Pinch takes priority
        // over every other gesture so grabbing never triggers throw/dispel.
        const pinchD = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);
        const pinching = pinchActive ? pinchD < 0.11 : pinchD < 0.06;

        // Classify this frame, then debounce: a new pose must persist STABLE_MS
        // before it takes over. Pinch and "none" switch immediately (pinch has
        // its own hysteresis; releasing should feel instant) — the others must
        // settle, which kills the flicker that made detection feel chaotic.
        // FIST is checked first: in a fist the thumb rests over the curled fingers,
        // so thumb-tip and index-tip sit close together and the pinch test would
        // otherwise steal it. A fist (no fingers up) is unambiguous, so it wins.
        // Until the hand has settled (armed), nothing classifies — pure observation.
        const raw = !armed ? 'none' : thumbsDown ? 'dispel' : fist ? 'fist' : pinching ? 'pinch' : pointing ? 'point' : open ? 'open' : 'none';
        if (raw === rawPrev) rawStableMs += dt; else { rawPrev = raw; rawStableMs = 0; }
        if (raw === 'pinch' || raw === 'none' || rawStableMs >= STABLE_MS) confirmedGesture = raw;

        if (confirmedGesture === 'pinch') {
          const hx = (lm[4].x + lm[8].x) / 2;   // pinch midpoint
          const hy = (lm[4].y + lm[8].y) / 2;
          if (!pinchActive) {
            pinchActive = true;
            pinchStartHX = hx; pinchStartHY = hy;
            pinchStartXf = orb.getCharacterTransform();
          }
          fistHoldMs = 0;
          const xf = pinchStartXf!;
          const SENS = 5.0;                 // high sensitivity for precise control
          const dx = hx - pinchStartHX;     // selfieMode → already mirrored
          const dy = hy - pinchStartHY;
          // Grab & turn the Pokémon inside the orb: horizontal drag spins around
          // Y, vertical drag tilts around X. Relative to the grab-start pose.
          orb.setCharacterTransform(xf.x + dy * SENS, xf.y + dx * SENS, xf.z, xf.s, xf.px, xf.py, xf.pz);
          gestureStatus('🤏 אוחז בכדור — הזז יד כדי לסובב');
          octx.beginPath(); octx.arc(mapXs(hx), mapYs(hy), isMobileDevice ? 18 : 30, 0, Math.PI * 2);
          octx.strokeStyle = 'rgba(120,220,255,.95)'; octx.lineWidth = isMobileDevice ? 3 : 5; octx.stroke();
        } else if (confirmedGesture === 'point') {
          // ☝️ Finger-pointing laser cursor — index tip drives a red on-screen
          // cursor; dwelling on a target for 2s clicks it.
          if (pinchActive) { pinchActive = false; pinchStartXf = null; }
          fistHoldMs = 0;
          // Map the fingertip to the screen with gain around centre so a small,
          // comfortable hand movement reaches every edge (the hand stays mid-frame).
          const GAIN = 1.7;
          const nx = Math.min(1, Math.max(0, 0.5 + (lm[8].x - 0.5) * GAIN));
          const ny = Math.min(1, Math.max(0, 0.5 + (lm[8].y - 0.5) * GAIN));
          const tx = nx * window.innerWidth;
          const ty = ny * window.innerHeight;
          // Adaptive smoothing: snappy on big moves, steady when hovering a target.
          const d = Math.hypot(tx - pointSX, ty - pointSY);
          const a = pointSX ? Math.min(0.55, 0.18 + d / 600) : 1;
          pointSX = pointSX ? pointSX + (tx - pointSX) * a : tx;
          pointSY = pointSY ? pointSY + (ty - pointSY) * a : ty;
          updateLaser(pointSX, pointSY, dt);
          gestureStatus('☝️ מצביע — החזק רגע לבחירה');
        } else {
          hideLaser();
          if (pinchActive) { pinchActive = false; pinchStartXf = null; }
          if (confirmedGesture === 'fist') {
            // ✊ GRAB the REAL 3D pokéball — it appears in your fist and follows the
            // hand inside the orb. FLICK it (fast hand motion) — or just hold — to
            // THROW it at the orb and summon.
            palmHoldMs = 0;
            if (throwCooldownMs <= 0) {
              fistHoldMs += dt;
              if (ballHeldMs === 0) { ballPX = cx2; ballPY = cy2; }
              orb.pokeballHold?.(lm[9].x, lm[9].y);
              ballHeldMs += dt;
              const vx = cx2 - ballPX, vy = cy2 - ballPY; ballPX = cx2; ballPY = cy2;
              const speed = (Math.hypot(vx, vy) / Math.max(1, dt)) * 16;   // px per ~frame
              const flick = ballHeldMs > 140 && speed > 26;
              if (flick || fistHoldMs >= FIST_HOLD_THRESHOLD) {
                fistHoldMs = 0; ballHeldMs = 0;
                throwCooldownMs = THROW_COOLDOWN; suppressPalmMs = 1100;
                gestureStatus('🚀 זריקה! בחר פוקימון');
                orb.pokeballThrow?.(() => (window as any).openSummonDock?.());
                setTimeout(() => { if (gestureActive) gestureStatus('זיהוי פעיל'); }, 2500);
              } else {
                gestureStatus('✊ אוחז בכדור — תזרוק לכיוון הכדור לזימון');
              }
            }
          } else {
            fistHoldMs = 0; ballHeldMs = 0; orb.pokeballRelease?.();
            if (open) gestureStatus('🖐️ יד פתוחה — שחק עם הפוקימון'); else if (!thumbsDown) gestureStatus('זיהוי פעיל');
          }
        }

        // ── 👎 Thumbs-down DISMISS (dispel) — replaces the open-palm release so an
        // open hand stays free to play. Hold briefly; a ring shows progress. Decay
        // (not hard-reset) on brief misses so a model flicker doesn't restart it. ──
        const dispelEligible = thumbsDown && suppressPalmMs <= 0;
        if (dispelEligible) palmHoldMs += dt;
        else palmHoldMs = Math.max(0, palmHoldMs - dt * 2.5);
        if (dispelEligible && palmHoldMs > 80) {
          const progress = Math.min(1, palmHoldMs / PALM_HOLD_THRESHOLD);
          gestureStatus(`👎 החזק להעלמה… ${Math.round(progress * 100)}%`);
          octx.beginPath(); octx.arc(cx2, cy2, 42, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
          octx.strokeStyle = `rgba(218,165,32,${0.4 + progress * 0.6})`; octx.lineWidth = 6; octx.stroke();
          if (palmHoldMs >= PALM_HOLD_THRESHOLD) {
            palmHoldMs = 0; suppressPalmMs = 900;
            gestureStatus('⚡ הפוקימון הועלם!');
            (window as any).dispelOrb?.();
          }
        }
        prevScale = handScale;

      });

      // Feed MediaPipe a SMALL, downscaled canvas frame (~320px wide). This is what
      // made it "work great" before: the lite model is fast on a small image and
      // resizes to 256 internally anyway, so sending the camera's full (possibly
      // 720p+) frame just choked it on mobile → "barely detects". Drawing to a fixed
      // small canvas also delivers a clean image regardless of the hidden video size.
      const cap = document.createElement('canvas');
      const capCtx = cap.getContext('2d')!;
      const CAP_W = 320;
      let rafId = 0;
      const tick = async () => {
        if (!gestureActive) return;
        if (vid.readyState >= 2 && vid.videoWidth > 0) {
          const h = Math.round(CAP_W * (vid.videoHeight / vid.videoWidth));
          if (cap.width !== CAP_W) { cap.width = CAP_W; cap.height = h; }
          try { capCtx.drawImage(vid, 0, 0, CAP_W, h); } catch {}
          await gestureHands.send({ image: cap }).catch(() => {});
        }
        rafId = requestAnimationFrame(tick);
      };
      (window as any).__stopGestureRaf = () => { cancelAnimationFrame(rafId); };
      gestureStatus('מצלמה פעילה');
      tick();
    }

    $('detectBtn').onclick = () => {
      if (gestureActive) { (window as any).__stopGestureRaf?.(); stopGesture(); return; }
      // Show mode chooser before starting.
      const chooser = document.getElementById('gestureModeChooser');
      if (chooser) chooser.removeAttribute('hidden');
    };
    document.getElementById('gmcHidden')?.addEventListener('click', () => {
      document.getElementById('gestureModeChooser')?.setAttribute('hidden', '');
      startGesture(false);
    });
    document.getElementById('gmcOpen')?.addEventListener('click', () => {
      document.getElementById('gestureModeChooser')?.setAttribute('hidden', '');
      startGesture(true);
    });
    document.getElementById('gmcCancel')?.addEventListener('click', () => {
      document.getElementById('gestureModeChooser')?.setAttribute('hidden', '');
    });
  }

  // Tap/click the orb stage to trigger the active Pokemon's attack
  {
    let attackCooldown = false;
    document.getElementById('stage')!.addEventListener('click', () => {
      if (attackCooldown) return;
      attackCooldown = true;
      const canvas = $<HTMLCanvasElement>('attackFx');
      const rect = document.getElementById('stage')!.getBoundingClientRect();
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      orb.attackCharacter(canvas);
      setTimeout(() => { attackCooldown = false; }, 1800);
    });
  }

  // HeavyGuard OS
  const hgBase = import.meta.env.BASE_URL || '/';
  function ensureHgIframe(): HTMLIFrameElement {
    const iframe = $<HTMLIFrameElement>('hgIframe');
    if (!iframe.src || iframe.src === 'about:blank' || !iframe.src.includes('heavyguard')) {
      iframe.src = hgBase + 'heavyguard.html';
    }
    return iframe;
  }
  $('hgBtn').onclick = () => {
    ensureHgIframe();
    $('hgOverlay').classList.add('show');
  };
  $('hgClose').onclick = () => { $('hgOverlay').classList.remove('show'); };

  window.addEventListener('message', (e) => {
    if (!e.data || e.data.source !== 'heavyguard') return;
    if (e.data.action === 'taskAdded') {
      addMsg(`נרשם ביומן: ${e.data.payload.title}`, 'sys');
    }
  });

  async function hgLoad(key: string): Promise<any[]> {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  }

  const CONTRACTORS: Record<string, string> = {
    kobi: 'קובי', asi: 'אסי', sagi: 'שגיא מערכות',
    mb: 'm.b מערכות', sd: 'ס.ד מיגונים', hg: 'Heavy Guard',
  };
  function cName(id: string) { return CONTRACTORS[id] || id; }

  // ── Holographic HUD: live Heavy Guard data on the main display ──────────
  function renderHud() {
    let idx: any[] = [];
    try { idx = (JSON.parse(localStorage.getItem('hg2:index') || '[]') || []).filter((x: any) => x && x.status !== 'running'); } catch {}
    const money = (n: number) => '₪' + (Number(n) || 0).toLocaleString('he-IL');
    const ym = new Date().toISOString().slice(0, 7);
    const total = idx.length;
    const revenue = idx.reduce((s: number, x: any) => s + (Number(x.price) || 0), 0);
    const month = idx.filter((x: any) => (x.date || '').startsWith(ym));
    const monthRev = month.reduce((s: number, x: any) => s + (Number(x.price) || 0), 0);
    const ops = document.querySelector('#hudOps .hud-card-body');
    if (ops) {
      ops.innerHTML = total === 0
        ? '<div class="hud-empty">אין עדיין נתוני Heavy Guard במכשיר זה</div>'
        : `<div class="hud-stat"><span>התקנות סה"כ</span><b>${total.toLocaleString('he-IL')}</b></div>
           <div class="hud-stat"><span>הכנסה מצטברת</span><b class="cy">${money(revenue)}</b></div>
           <div class="hud-stat"><span>החודש</span><b>${month.length} · ${money(monthRev)}</b></div>
           <div class="hud-line"></div>
           <div class="hud-foot">${BIZ_TAG}</div>`;
    }
    const pipe = document.querySelector('#hudPipe .hud-card-body');
    if (pipe) {
      const byC: Record<string, { count: number; rev: number }> = {};
      idx.forEach((x: any) => { const c = x.contractor || '?'; (byC[c] = byC[c] || { count: 0, rev: 0 }); byC[c].count++; byC[c].rev += Number(x.price) || 0; });
      const rows = Object.entries(byC).map(([id, v]) => ({ name: cName(id), ...v })).sort((a, b) => b.rev - a.rev).slice(0, 5);
      const max = Math.max(1, ...rows.map((r) => r.rev));
      pipe.innerHTML = rows.length === 0
        ? '<div class="hud-empty">אין נתונים</div>'
        : rows.map((r) => `<div class="hud-prow"><span class="hud-pn">${r.name}</span><div class="hud-pbar"><i style="width:${Math.round(r.rev / max * 100)}%"></i></div><b>${money(r.rev)}</b></div>`).join('');
    }
  }
  const BIZ_TAG = 'Heavy Guard · נתוני שטח חיים';

  // ── Business briefing (Hebrew) — HeavyGuard KPIs + fleet + live markets ──
  // Pulls only local HG data + the markets already fetched (no cross-origin), so
  // it always works. Shown in chat when the GLOBAL OPERATIONS panel is tapped.
  function businessBriefing(): string {
    const idx = readIdx();
    const ym = new Date().toISOString().slice(0, 7);
    const money = (n: number) => '₪' + Math.round(n || 0).toLocaleString('he-IL');
    const total = idx.length;
    const revenue = idx.reduce((s: number, x: any) => s + (Number(x.price) || 0), 0);
    const month = idx.filter((x: any) => (x.date || '').startsWith(ym));
    const monthRev = month.reduce((s: number, x: any) => s + (Number(x.price) || 0), 0);
    const byC: Record<string, { n: number; rev: number }> = {};
    idx.forEach((x: any) => { const c = x.contractor || '?'; (byC[c] = byC[c] || { n: 0, rev: 0 }); byC[c].n++; byC[c].rev += Number(x.price) || 0; });
    const top = Object.entries(byC).map(([id, v]) => ({ name: cName(id), ...v })).sort((a, b) => b.rev - a.rev).slice(0, 3);
    const unsched = idx.filter((x: any) => x && (x.status === 'running' || !x.date)).length;
    const openTasks = readTasks().filter((t: any) => !t.done).length;
    const trips = readTrips(); const km = trips.reduce((s: number, t: any) => s + (Number(t.km) || 0), 0);
    const lines: string[] = ['🛡️ **תדריך עסקי · Heavy Guard**'];
    if (total === 0) lines.push('אין עדיין נתוני התקנות במכשיר זה.');
    else {
      lines.push(`• התקנות סה"כ: ${total} · הכנסה מצטברת: ${money(revenue)}`);
      lines.push(`• החודש: ${month.length} התקנות · ${money(monthRev)}`);
      if (top.length) lines.push('• קבלנים מובילים: ' + top.map((t) => `${t.name} (${money(t.rev)})`).join(' · '));
      if (unsched) lines.push(`• ⚠️ ${unsched} התקנות ממתינות לתיאום`);
    }
    if (openTasks) lines.push(`• ${openTasks} משימות פתוחות`);
    lines.push(`• 🚚 צי: ${trips.length} נסיעות · ${km} ק"מ`);
    if (lastMarketRows.length) {
      const m = lastMarketRows.slice(0, 4).map((r) => `${r.name} ${r.price} (${r.chg >= 0 ? '+' : ''}${r.chg.toFixed(1)}%)`);
      lines.push('📊 שווקים: ' + m.join(' · '));
    }
    return lines.join('\n');
  }
  (window as any).businessBriefing = businessBriefing;

  // ── Fleet panel (main-screen card; tap → full control center) ──
  function renderFleetPanel() {
    const el = document.querySelector('#hudFleetPanel .hud-card-body');
    if (!el) return;
    const idx = readIdx();
    const trips = readTrips();
    const km = trips.reduce((s: number, t: any) => s + (Number(t.km) || 0), 0);
    const unsched = idx.filter((x: any) => x && (x.status === 'running' || !x.date)).length;
    const openTasks = readTasks().filter((t: any) => !t.done).length;
    el.innerHTML = `
      <div class="hud-stat"><span>נסיעות · ק"מ</span><b>${trips.length} · ${km.toLocaleString('he-IL')}</b></div>
      <div class="hud-stat"><span>התקנות לתיאום</span><b>${unsched}</b></div>
      <div class="hud-stat"><span>משימות פתוחות</span><b>${openTasks}</b></div>
      <div class="hud-foot">לחץ למרכז השליטה · מפה · נסיעות ↗</div>`;
  }

  // ── Live markets ──
  const mkFmt = (n: number) => n >= 1000 ? Math.round(n).toLocaleString('en-US') : n.toLocaleString('en-US', { maximumFractionDigits: n >= 1 ? 2 : 4 });
  type MkRow = { name: string; price: string; chg: number };
  let lastMarketRows: MkRow[] = [];
  // Fetch a fuller market board: crypto (CoinGecko) + indices/gold (Yahoo).
  async function fetchMarketRows(): Promise<MkRow[]> {
    const rows: MkRow[] = [];
    try {
      const ids = 'bitcoin,ethereum,solana,binancecoin,ripple,cardano,dogecoin';
      const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
      const d = await r.json();
      const order: [string, string][] = [['bitcoin', 'Bitcoin'], ['ethereum', 'Ethereum'], ['solana', 'Solana'], ['binancecoin', 'BNB'], ['ripple', 'XRP'], ['cardano', 'Cardano'], ['dogecoin', 'Dogecoin']];
      for (const [id, name] of order) if (d[id]) rows.push({ name, price: '$' + mkFmt(d[id].usd), chg: d[id].usd_24h_change || 0 });
    } catch {}
    for (const [sym, name] of [['%5EGSPC', 'S&P 500'], ['%5EIXIC', 'NASDAQ'], ['%5EDJI', 'Dow Jones'], ['GC%3DF', 'זהב'], ['CL%3DF', 'נפט']]) {
      try {
        const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=2d`);
        const d = await r.json();
        const m = d.chart.result[0].meta;
        const price = m.regularMarketPrice;
        const prev = m.chartPreviousClose ?? m.previousClose ?? price;
        rows.push({ name, price: mkFmt(price), chg: prev ? ((price - prev) / prev) * 100 : 0 });
      } catch {}
    }
    if (rows.length) lastMarketRows = rows;
    return rows;
  }
  const mkRowHtml = (r: MkRow) => {
    const up = r.chg >= 0; const c = up ? '#3FD79A' : '#FF5C50';
    return `<div class="mk-row"><span class="mk-name">${r.name}</span><span class="mk-price">${r.price}</span><span class="mk-chg" style="color:${c}">${up ? '▲' : '▼'}${Math.abs(r.chg).toFixed(2)}%</span></div>`;
  };
  async function renderMarkets() {
    const el = document.querySelector('#hudMarkets .hud-card-body');
    if (!el) return;
    const rows = await fetchMarketRows();
    el.innerHTML = rows.length === 0
      ? '<div class="hud-empty">שווקים לא זמינים כרגע</div>'
      : rows.slice(0, 6).map(mkRowHtml).join('') + '<div class="mk-more">לחץ לכל השווקים ↗</div>';
  }
  // Full markets board in a window (opened by clicking the markets panel).
  function openMarketsDetail() {
    openWin('שווקים · MARKETS 📊');
    const body = $('winBody');
    const render = (rows: MkRow[]) => {
      body.innerHTML = `<div class="pad mk-detail">
        <div class="mk-detail-h">מטבעות קריפטו · מדדים · סחורות — נתונים חיים</div>
        <div class="mk-detail-list">${rows.length ? rows.map(mkRowHtml).join('') : '<div class="ops-empty">שווקים לא זמינים כרגע</div>'}</div>
        <a class="mk-detail-cta" href="${TRADE_URL}" target="_blank" rel="noopener">פתח את מערכת המסחר המלאה ↗</a>
      </div>`;
    };
    render(lastMarketRows);
    fetchMarketRows().then(render);
  }

  // ── Israel news panel (RSS via rss2json, CORS-friendly) ──
  async function renderNews() {
    const el = document.querySelector('#hudNews .hud-card-body');
    if (!el) return;
    try {
      const rss = encodeURIComponent('https://www.ynet.co.il/Integration/StoryRss2.xml');
      const r = await fetch('https://api.rss2json.com/v1/api.json?count=6&rss_url=' + rss);
      const d = await r.json();
      if (d.status === 'ok' && d.items && d.items.length) {
        el.innerHTML = d.items.slice(0, 6).map((it: any) =>
          `<a class="nw-row" href="${it.link}" target="_blank" rel="noopener"><span class="nw-dot"></span><span class="nw-t">${(it.title || '').replace(/</g, '&lt;')}</span></a>`).join('');
        return;
      }
    } catch {}
    el.innerHTML = '<div class="hud-empty">חדשות לא זמינות כרגע</div>';
  }

  // ════════ Fleet & Operations Control Center ════════
  // One window, five panels: map of installs, trips/fleet, HeavyGuard tasks,
  // installs awaiting scheduling, and a live rotating-DNA effect.
  const escHtml = (s: string) => (s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
  const readTrips = (): any[] => { try { return JSON.parse(localStorage.getItem('hg2:trips') || '[]') || []; } catch { return []; } };
  const writeTrips = (a: any[]) => { try { localStorage.setItem('hg2:trips', JSON.stringify(a)); } catch {} puterSync.scheduleSync?.(); };
  const readIdx = (): any[] => { try { return JSON.parse(localStorage.getItem('hg2:index') || '[]') || []; } catch { return []; } };
  const readTasks = (): any[] => { try { return JSON.parse(localStorage.getItem('hg2:tasks') || '[]') || []; } catch { return []; } };
  const writeTasks = (a: any[]) => { try { localStorage.setItem('hg2:tasks', JSON.stringify(a)); } catch {} puterSync.scheduleSync?.(); };
  const wazeUrl = (to: string) => `https://waze.com/ul?q=${encodeURIComponent(to || '')}&navigate=yes`;

  // Israeli location → coordinates (mirrors the HeavyGuard map table) for plotting installs.
  const FLEET_GEO: Record<string, { lat: number; lng: number; city: string }> = {"xcmg אשקלון":{lat:31.668,lng:34.574,city:"אשקלון"},"אופקים":{lat:31.317,lng:34.62,city:"אופקים"},"אחיסמך":{lat:31.931,lng:34.918,city:"אחיסמך"},"אל סייד":{lat:31.3,lng:34.86,city:"אל סייד"},"אמקול":{lat:31.792,lng:34.65,city:"אשדוד"},"אשדוד":{lat:31.792,lng:34.65,city:"אשדוד"},"אשקלון":{lat:31.668,lng:34.574,city:"אשקלון"},"באר טוביה":{lat:31.738,lng:34.722,city:"באר טוביה"},"באר שבע":{lat:31.252,lng:34.791,city:"באר שבע"},"בית נחמיה":{lat:31.952,lng:34.953,city:"בית נחמיה"},"בית שמש":{lat:31.745,lng:34.987,city:"בית שמש"},"ביתר עלית":{lat:31.696,lng:35.117,city:"ביתר עלית"},"בני עייש":{lat:31.788,lng:34.74,city:"בני עייש"},"בני ראם":{lat:31.742,lng:34.782,city:"בני ראם"},"בר גיורא":{lat:31.731,lng:35.052,city:"בר גיורא"},"גבעת ברנר":{lat:31.866,lng:34.795,city:"גבעת ברנר"},"גבעת כוח":{lat:31.96,lng:34.952,city:"גבעת כוח"},"גן יבנה":{lat:31.789,lng:34.706,city:"גן יבנה"},"חולון":{lat:32.015,lng:34.779,city:"חולון"},"חולון קטרפילר":{lat:32.015,lng:34.779,city:"חולון"},"חיפה":{lat:32.794,lng:34.989,city:"חיפה"},"טייבה":{lat:32.266,lng:35.01,city:"טייבה"},"טירה":{lat:32.234,lng:34.951,city:"טירה"},"יבנה":{lat:31.878,lng:34.739,city:"יבנה"},"יפו":{lat:32.052,lng:34.752,city:"יפו"},"ירושלים":{lat:31.768,lng:35.214,city:"ירושלים"},"כסייפה":{lat:31.24,lng:35.12,city:"כסייפה"},"כפר קאסם":{lat:32.115,lng:34.977,city:"כפר קאסם"},"כרמיאל":{lat:32.916,lng:35.292,city:"כרמיאל"},"מבשרת ציון":{lat:31.799,lng:35.15,city:"מבשרת ציון"},"מודיעין":{lat:31.898,lng:35.01,city:"מודיעין"},"מודיעין עלית":{lat:31.93,lng:35.04,city:"מודיעין עלית"},"מנוחה":{lat:31.59,lng:34.74,city:"מנוחה"},"מסמיה":{lat:31.78,lng:34.8,city:"מסמיה"},"מצליח":{lat:31.91,lng:34.85,city:"מצליח"},"נס ציונה":{lat:31.929,lng:34.798,city:"נס ציונה"},"נען":{lat:31.885,lng:34.855,city:"נען"},"נתיבות":{lat:31.422,lng:34.588,city:"נתיבות"},"עד הלום":{lat:31.792,lng:34.65,city:"אשדוד"},"עכו":{lat:32.928,lng:35.075,city:"עכו"},"ערוגות":{lat:31.73,lng:34.74,city:"ערוגות"},"פרדס חנה":{lat:32.474,lng:34.974,city:"פרדס חנה"},"פתח תקווה":{lat:32.087,lng:34.887,city:"פתח תקווה"},"צריפין":{lat:31.95,lng:34.83,city:"צריפין"},"קטרפילר":{lat:31.252,lng:34.791,city:"באר שבע"},"קטרפילר באר שבע":{lat:31.252,lng:34.791,city:"באר שבע"},"קריית גת":{lat:31.61,lng:34.771,city:"קריית גת"},"קריית מלאכי":{lat:31.731,lng:34.745,city:"קריית מלאכי"},"ראשון  לציון":{lat:31.964,lng:34.805,city:"ראשון לציון"},"ראשון לציון":{lat:31.964,lng:34.805,city:"ראשון לציון"},"רהט":{lat:31.393,lng:34.754,city:"רהט"},"רווחה":{lat:31.6,lng:34.71,city:"רווחה"},"רמלה":{lat:31.928,lng:34.866,city:"רמלה"},"שדרות":{lat:31.525,lng:34.596,city:"שדרות"},"שילת":{lat:31.93,lng:35.02,city:"שילת"},"תל אביב":{lat:32.08,lng:34.781,city:"תל אביב"},"אפקו":{lat:31.898,lng:35.01,city:"מודיעין"},"קייס":{lat:32.015,lng:34.779,city:"חולון"}};

  let leafletPromise: Promise<any> | null = null;
  function loadLeaflet(): Promise<any> {
    if ((window as any).L) return Promise.resolve((window as any).L);
    if (leafletPromise) return leafletPromise;
    leafletPromise = new Promise((resolve, reject) => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css'; link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.async = true;
      s.onload = () => resolve((window as any).L);
      s.onerror = () => reject(new Error('leaflet load failed'));
      document.head.appendChild(s);
    });
    return leafletPromise;
  }

  // Live rotating DNA double-helix on a canvas. Returns a stop() for teardown.
  function startDna(cv: HTMLCanvasElement): () => void {
    const ctx = cv.getContext('2d'); if (!ctx) return () => {};
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let raf = 0, t = 0, alive = true;
    const resize = () => { const r = cv.getBoundingClientRect(); cv.width = Math.max(40, r.width) * dpr; cv.height = Math.max(40, r.height) * dpr; };
    resize();
    const frame = () => {
      if (!alive) return;
      const W = cv.width, H = cv.height, cx = W / 2, amp = W * 0.27, turns = 2.3, N = 44;
      ctx.clearRect(0, 0, W, H); t += 0.018;
      for (let i = 0; i < N; i++) {
        const p = i / (N - 1), y = p * H, ang = p * Math.PI * 2 * turns + t;
        const x1 = cx + Math.sin(ang) * amp, x2 = cx + Math.sin(ang + Math.PI) * amp;
        const z1 = (Math.cos(ang) + 1) / 2, z2 = (Math.cos(ang + Math.PI) + 1) / 2;
        ctx.strokeStyle = `rgba(228,188,99,${0.08 + 0.14 * Math.abs(Math.sin(ang))})`;
        ctx.lineWidth = dpr; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
        ctx.fillStyle = `rgba(247,232,192,${0.35 + 0.5 * z1})`;
        ctx.beginPath(); ctx.arc(x1, y, (2 + 2 * z1) * dpr, 0, 7); ctx.fill();
        ctx.fillStyle = `rgba(63,198,255,${0.35 + 0.5 * z2})`;
        ctx.beginPath(); ctx.arc(x2, y, (2 + 2 * z2) * dpr, 0, 7); ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };
    let ro: ResizeObserver | null = null;
    try { ro = new ResizeObserver(resize); ro.observe(cv); } catch {}
    frame();
    return () => { alive = false; cancelAnimationFrame(raf); try { ro?.disconnect(); } catch {} };
  }

  const tripRowHtml = (t: any) => `
    <div class="fl-row" data-id="${t.id}">
      <div class="fl-mid"><b>${escHtml(t.from || '—')} ← ${escHtml(t.to || '—')}</b><span>${t.date || ''}${t.km ? ` · ${t.km} ק"מ` : ''}${t.note ? ' · ' + escHtml(t.note) : ''}</span></div>
      ${t.to ? `<a class="fl-waze" href="${wazeUrl(t.to)}" target="_blank" rel="noopener">Waze ↗</a>` : ''}
      <button class="fl-del" data-id="${t.id}">✕</button>
    </div>`;

  let mapInst: any = null;
  function renderFleet() {
    try { winCleanup?.(); } catch {} winCleanup = null;
    const body = $('winBody');
    const trips = readTrips().slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const totalKm = trips.reduce((s, t) => s + (Number(t.km) || 0), 0);
    const idx = readIdx();
    const today = new Date().toISOString().slice(0, 10);

    // Map points: installs whose location resolves to coordinates, counted per place.
    const ptCount: Record<string, { g: { lat: number; lng: number; city: string }; n: number }> = {};
    idx.forEach((x: any) => { const k = (x?.location || '').trim(); const g = FLEET_GEO[k]; if (!g) return; (ptCount[k] = ptCount[k] || { g, n: 0 }).n++; });
    const geoCount = Object.keys(ptCount).length;

    // Tasks: open tasks for today + undated backlog.
    const tasks = readTasks().filter((t: any) => !t.done);
    const dayTasks = tasks.filter((t: any) => t.date === today);
    const backlog = tasks.filter((t: any) => !t.date);
    const taskList = [...dayTasks, ...backlog].slice(0, 40);
    const taskRows = taskList.length
      ? taskList.map((t: any) => `<label class="ops-task" data-id="${t.id}"><input type="checkbox"/><span>${escHtml(t.title || '')}</span><i>${t.date === today ? 'היום' : (t.date || 'ללא תאריך')}</i></label>`).join('')
      : '<div class="ops-empty">אין משימות פתוחות 🎉</div>';

    // Unscheduled installs: still running, or no date set.
    const unsched = idx.filter((x: any) => x && (x.status === 'running' || !x.date)).slice(0, 40);
    const unschedRows = unsched.length
      ? unsched.map((x: any) => { const loc = (x.location || '').trim(); return `<div class="ops-urow"><div class="ops-umid"><b>${escHtml(loc || 'ללא מיקום')}</b><span>${escHtml(cName(x.contractor || '') || '')}${x.status === 'running' ? ' · בתהליך' : ' · ללא תאריך'}</span></div>${loc ? `<a class="fl-waze" href="${wazeUrl(loc)}" target="_blank" rel="noopener">Waze ↗</a>` : ''}</div>`; }).join('')
      : '<div class="ops-empty">אין התקנות הממתינות לתיאום</div>';

    body.innerHTML = `<div class="pad ops-center">
      <div class="ops-grid">
        <section class="ops-panel ops-span2">
          <div class="ops-h">🗺️ מפת התקנות · שטח</div>
          <div class="ops-map" id="opsMap"></div>
          <div class="ops-foot">${geoCount} מיקומים · ${idx.length} התקנות סה"כ</div>
        </section>

        <section class="ops-panel">
          <div class="ops-h">🚚 ניהול צי · נסיעות</div>
          <div class="fl-add">
            <input id="flFrom" placeholder="מאיפה" dir="rtl"/>
            <input id="flTo" placeholder="לאן (כתובת / עיר)" dir="rtl"/>
            <div class="fl-add-row"><input id="flDate" type="date" value="${today}"/><input id="flKm" type="number" placeholder='ק&quot;מ' dir="ltr"/></div>
            <button id="flAdd">+ הוסף נסיעה</button>
          </div>
          <div class="fl-tot" id="flTot">${trips.length} נסיעות · ${totalKm} ק"מ סה"כ</div>
          <div class="ops-scroll fl-list" id="flList">${trips.map(tripRowHtml).join('') || '<div class="ops-empty">אין נסיעות עדיין — הוסף ונווט ב-Waze</div>'}</div>
        </section>

        <section class="ops-panel">
          <div class="ops-h">✅ משימות HeavyGuard</div>
          <div class="ops-scroll" id="opsTasks">${taskRows}</div>
        </section>

        <section class="ops-panel">
          <div class="ops-h">📅 התקנות לתיאום</div>
          <div class="ops-scroll">${unschedRows}</div>
        </section>

        <section class="ops-panel ops-dna-panel">
          <div class="ops-h">🧬 ALPHA · DNA</div>
          <canvas class="ops-dna" id="opsDna"></canvas>
        </section>
      </div>
    </div>`;

    // ── Trips: add (partial re-render of list, keeps map/DNA alive) ──
    const refreshTripList = () => {
      const arr = readTrips().slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      const km = arr.reduce((s, t) => s + (Number(t.km) || 0), 0);
      const list = body.querySelector('#flList'); const tot = body.querySelector('#flTot');
      if (list) list.innerHTML = arr.map(tripRowHtml).join('') || '<div class="ops-empty">אין נסיעות עדיין — הוסף ונווט ב-Waze</div>';
      if (tot) tot.textContent = `${arr.length} נסיעות · ${km} ק"מ סה"כ`;
      bindTripDel();
    };
    const bindTripDel = () => body.querySelectorAll('.fl-del').forEach((btn) => (btn as HTMLElement).onclick = () => {
      const id = (btn as HTMLElement).dataset.id; writeTrips(readTrips().filter((t) => t.id !== id)); refreshTripList();
    });
    body.querySelector('#flAdd')?.addEventListener('click', () => {
      const g = (id: string) => (document.getElementById(id) as HTMLInputElement).value;
      const to = g('flTo').trim(); if (!to) return;
      const arr = readTrips();
      arr.unshift({ id: Date.now().toString(36), from: g('flFrom').trim(), to, date: g('flDate'), km: g('flKm'), note: '' });
      writeTrips(arr);
      (document.getElementById('flFrom') as HTMLInputElement).value = '';
      (document.getElementById('flTo') as HTMLInputElement).value = '';
      (document.getElementById('flKm') as HTMLInputElement).value = '';
      refreshTripList();
    });
    bindTripDel();

    // ── Tasks: toggle done in place (no full re-render) ──
    body.querySelectorAll('.ops-task').forEach((el) => (el as HTMLElement).addEventListener('change', () => {
      const id = (el as HTMLElement).dataset.id;
      writeTasks(readTasks().map((t: any) => t.id === id ? { ...t, done: true } : t));
      el.classList.add('ops-done');
      setTimeout(() => el.remove(), 350);
    }));

    // ── DNA animation ──
    const dnaCv = body.querySelector('#opsDna') as HTMLCanvasElement | null;
    const dnaStop = dnaCv ? startDna(dnaCv) : null;

    // ── Map (lazy Leaflet) ──
    const mapEl = body.querySelector('#opsMap') as HTMLElement | null;
    if (mapEl) {
      loadLeaflet().then((L) => {
        if (!body.querySelector('#opsMap')) return;   // window closed meanwhile
        mapInst = L.map(mapEl, { zoomControl: true, attributionControl: false }).setView([31.7, 34.9], 8);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18 }).addTo(mapInst);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18, opacity: 0.85 }).addTo(mapInst);
        const pts = Object.values(ptCount);
        const bounds: any[] = [];
        pts.forEach(({ g, n }) => {
          const r = 6 + Math.min(16, n * 2);
          L.circleMarker([g.lat, g.lng], { radius: r, color: '#E4BC63', weight: 2, fillColor: '#F7E8C0', fillOpacity: 0.55 })
            .addTo(mapInst).bindTooltip(`${g.city} · ${n} התקנות`, { direction: 'top' });
          bounds.push([g.lat, g.lng]);
        });
        if (bounds.length) { try { mapInst.fitBounds(bounds, { padding: [30, 30], maxZoom: 11 }); } catch {} }
        setTimeout(() => { try { mapInst?.invalidateSize(); } catch {} }, 120);
      }).catch(() => { if (mapEl) mapEl.innerHTML = '<div class="ops-empty">מפה לא זמינה (אין רשת)</div>'; });
    }

    // teardown for this window instance
    winCleanup = () => { try { dnaStop?.(); } catch {} if (mapInst) { try { mapInst.remove(); } catch {} mapInst = null; } };
  }
  function openFleet() { openWin('מרכז שליטה · צי ומבצעים 🛰️'); renderFleet(); }

  // ── Trade simulator — embedded as an in-app system (like HeavyGuard OS) ──
  // The site is a separate Render deployment, so it loads in an iframe. If the
  // host refuses framing, the prominent "open in new tab" button is the fallback.
  const TRADE_URL = 'https://heavt-guard-simulator-1.onrender.com/';
  function openTradeSystem() {
    openWin('מערכת מסחר · TRADE 📈');
    const body = $('winBody');
    body.innerHTML = `<div class="sys-embed">
      <div class="sys-embed-bar">
        <span>מערכת המסחר שלך — חיה מתוך אלפא</span>
        <a class="sys-embed-open" href="${TRADE_URL}" target="_blank" rel="noopener">פתח בלשונית ↗</a>
      </div>
      <div class="sys-embed-frame">
        <iframe id="tradeFrame" src="${TRADE_URL}" allow="clipboard-write; fullscreen" referrerpolicy="no-referrer"></iframe>
        <div class="sys-embed-fallback" id="tradeFallback" hidden>
          <div>לא ניתן להטמיע את המערכת כאן</div>
          <a class="sys-embed-cta" href="${TRADE_URL}" target="_blank" rel="noopener">פתח את מערכת המסחר ↗</a>
        </div>
      </div>
    </div>`;
    // If the iframe is blocked (X-Frame-Options) it stays blank — reveal the
    // fallback if nothing has rendered after a short grace period.
    const fr = body.querySelector('#tradeFrame') as HTMLIFrameElement | null;
    let loaded = false;
    fr?.addEventListener('load', () => { loaded = true; });
    setTimeout(() => { if (!loaded) { const fb = body.querySelector('#tradeFallback') as HTMLElement | null; if (fb) fb.hidden = false; } }, 4500);
  }

  // The HUD "HeavyGuard OS" tile reuses the existing dock handler.
  setTimeout(() => {
    document.getElementById('hudHg')?.addEventListener('click', () => document.getElementById('hgBtn')?.click());
    document.getElementById('hudFleet')?.addEventListener('click', openFleet);
    document.getElementById('hudTrade')?.addEventListener('click', (e) => { e.preventDefault(); openTradeSystem(); });
    document.querySelector('#hudMarkets')?.addEventListener('click', openMarketsDetail);
    document.getElementById('hudOps')?.addEventListener('click', () => { addMsg(businessBriefing(), 'al'); });
    document.getElementById('hudFleetPanel')?.addEventListener('click', openFleet);
    renderHud(); renderMarkets(); renderNews(); renderFleetPanel();
    setInterval(() => { renderHud(); renderFleetPanel(); }, 30000);
    setInterval(renderMarkets, 60000);
    setInterval(renderNews, 300000);
  }, 300);

  async function hgSearchLicense(query: string) {
    const q = query.replace(/[-\s]/g, '').toLowerCase();
    const index = await hgLoad('hg2:index');
    if (!index.length) {
      addMsg('אין נתונים ב-HeavyGuard. יש להוסיף רשומות תחילה.', 'sys');
      return;
    }
    const results = index.filter((r: any) => {
      if (r.status === 'running') return false;
      const id = (r.idNumber || '').replace(/[-\s]/g, '').toLowerCase();
      const cust = (r.customer || '').toLowerCase();
      const veh = (r.vehicleType || '').toLowerCase();
      const mfr = (r.manufacturer || '').toLowerCase();
      return id.includes(q) || q.includes(id) || cust.includes(q) || veh.includes(q) || mfr.includes(q);
    }).map((r: any) => ({
      id: r.id, idNumber: r.idNumber, idType: r.idType,
      contractor: cName(r.contractor), contractorId: r.contractor,
      date: r.date, price: r.price, vehicleType: r.vehicleType,
      manufacturer: r.manufacturer, installType: r.installType,
      location: r.location, customer: r.customer, phone: r.phone,
      reportedAt: r.reportedAt || '',
    }));
    if (!results.length) {
      addMsg(`לא נמצאו תוצאות עבור: ${query}`, 'sys');
      return;
    }
    openWin(`HeavyGuard · חיפוש: ${query}`);
    let html = '<div class="pad">';
    for (const r of results) {
      const reportedAtStr = r.reportedAt
        ? new Date(r.reportedAt).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
        : '';
      html += `<div style="background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:12px;padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:var(--cyan);font-weight:600;font-size:18px;direction:ltr">${r.idNumber || '—'}</span>
          <span style="color:var(--dim);font-size:13px">${r.date || ''}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:13px">
          <span><span style="color:var(--dim)">סוג:</span> ${r.idType || ''}</span>
          <span><span style="color:var(--dim)">קבלן:</span> ${r.contractor || ''}</span>
          <span><span style="color:var(--dim)">רכב:</span> ${r.vehicleType || ''} ${r.manufacturer || ''}</span>
          <span><span style="color:var(--dim)">התקנה:</span> ${r.installType || ''}</span>
          <span><span style="color:var(--dim)">מחיר:</span> <span style="color:var(--gold)">₪${r.price || 0}</span></span>
          <span><span style="color:var(--dim)">מיקום:</span> ${r.location || ''}</span>
          ${r.customer ? `<span><span style="color:var(--dim)">לקוח:</span> ${r.customer}</span>` : ''}
          ${r.phone ? `<span><span style="color:var(--dim)">טלפון:</span> <a href="tel:${r.phone}" style="color:var(--cyan)">${r.phone}</a></span>` : ''}
          ${reportedAtStr ? `<span style="grid-column:1/-1;color:var(--dim);font-size:11px;margin-top:4px;border-top:1px solid var(--line);padding-top:4px">⏱ דווח: ${reportedAtStr}</span>` : ''}
        </div>
      </div>`;
    }
    html += '</div>';
    $('winBody').innerHTML = html;
  }

  async function hgShowEarnings(contractor: string, month: string) {
    const index = await hgLoad('hg2:index');
    if (!index.length) {
      addMsg('אין נתוני הכנסות ב-HeavyGuard.', 'sys');
      return;
    }
    const curMonth = new Date().toISOString().slice(0, 7);
    const effectiveMonth = month || curMonth;

    // Compute prev / next month strings
    const [ey, em] = effectiveMonth.split('-').map(Number);
    const prevMonthDate = new Date(ey, em - 2, 1);
    const nextMonthDate = new Date(ey, em, 1);
    const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
    const nextMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;
    const isCurrentMonth = effectiveMonth === curMonth;

    let filtered = index.filter((r: any) => r.status !== 'running');
    if (contractor) {
      const cLow = contractor.toLowerCase();
      filtered = filtered.filter((r: any) => {
        const cid = (r.contractor || '').toLowerCase();
        const cn = cName(r.contractor).toLowerCase();
        return cid.includes(cLow) || cn.includes(cLow) || cLow.includes(cid) || cLow.includes(cn);
      });
    }
    const monthFiltered = filtered.filter((r: any) => (r.date || '').startsWith(effectiveMonth));
    const curMonthFiltered = filtered.filter((r: any) => (r.date || '').startsWith(curMonth));
    const allTimeFiltered = filtered;

    const byContractor: Record<string, { total: number; count: number; jobs: any[] }> = {};
    for (const r of monthFiltered) {
      const cn = cName(r.contractor);
      if (!byContractor[cn]) byContractor[cn] = { total: 0, count: 0, jobs: [] };
      byContractor[cn].total += r.price || 0;
      byContractor[cn].count++;
      byContractor[cn].jobs.push({ date: r.date, price: r.price, type: r.installType, vehicle: r.vehicleType, id: r.idNumber });
    }
    // Current month totals per contractor (for comparison when browsing past months)
    const byContractorCur: Record<string, { total: number; count: number }> = {};
    for (const r of curMonthFiltered) {
      const cn = cName(r.contractor);
      if (!byContractorCur[cn]) byContractorCur[cn] = { total: 0, count: 0 };
      byContractorCur[cn].total += r.price || 0;
      byContractorCur[cn].count++;
    }
    const byContractorAll: Record<string, { total: number; count: number }> = {};
    for (const r of allTimeFiltered) {
      const cn = cName(r.contractor);
      if (!byContractorAll[cn]) byContractorAll[cn] = { total: 0, count: 0 };
      byContractorAll[cn].total += r.price || 0;
      byContractorAll[cn].count++;
    }
    const grandTotal = monthFiltered.reduce((s: number, r: any) => s + (r.price || 0), 0);
    const curGrandTotal = curMonthFiltered.reduce((s: number, r: any) => s + (r.price || 0), 0);
    const totalJobs = monthFiltered.length;
    const allTimeTotal = allTimeFiltered.reduce((s: number, r: any) => s + (r.price || 0), 0);
    const hebrewMonths = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
    const [y, m] = effectiveMonth.split('-');
    const monthLabel = `${hebrewMonths[parseInt(m) - 1]} ${y}`;
    const [cy, cm] = curMonth.split('-');
    const curMonthLabel = `${hebrewMonths[parseInt(cm) - 1]} ${cy}`;

    openWin(`HeavyGuard · הכנסות · ${monthLabel}`);
    let html = '<div class="pad" style="direction:rtl">';

    // Month navigation bar
    html += `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:12px;padding:6px 10px">
      <button id="earPrev" style="background:none;border:none;color:var(--cyan);font-size:22px;cursor:pointer;padding:4px 10px;border-radius:8px;line-height:1" title="חודש קודם">◀</button>
      <span style="font-weight:600;font-size:15px">${monthLabel}</span>
      <button id="earNext" style="background:none;border:none;color:${isCurrentMonth ? 'rgba(255,255,255,.15)' : 'var(--cyan)'};font-size:22px;cursor:pointer;padding:4px 10px;border-radius:8px;line-height:1" ${isCurrentMonth ? 'disabled' : ''} title="חודש הבא">▶</button>
    </div>`;

    // Grand total card
    html += `<div style="text-align:center;margin-bottom:20px;padding:16px;background:rgba(218,165,32,.06);border-radius:16px;border:1px solid rgba(218,165,32,.15)">
      <div style="font-size:11px;letter-spacing:2px;color:var(--dim);text-transform:uppercase;margin-bottom:4px">${monthLabel}</div>
      <div style="font-size:36px;font-weight:700;color:var(--gold);direction:ltr">₪${grandTotal.toLocaleString()}</div>
      <div style="color:var(--dim);font-size:13px;margin-top:4px">${totalJobs} עבודות</div>
      ${!isCurrentMonth ? `<div style="color:var(--cyan);font-size:12px;margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,.06)">${curMonthLabel} (החודש): ₪${curGrandTotal.toLocaleString()} · ${curMonthFiltered.length} עבודות</div>` : ''}
      ${allTimeTotal !== grandTotal ? `<div style="color:var(--dim);font-size:11px;margin-top:4px;opacity:.6">סה"כ כללי: ₪${allTimeTotal.toLocaleString()}</div>` : ''}
    </div>`;

    const entries = Object.entries(byContractor).sort((a, b) => (b[1] as any).total - (a[1] as any).total);
    if (!entries.length) {
      html += '<div style="text-align:center;color:var(--dim);padding:20px">אין עבודות לחודש זה</div>';
    }
    for (const [name, info] of entries) {
      const pct = grandTotal ? Math.round((info.total / grandTotal) * 100) : 0;
      const allTime = byContractorAll[name];
      const curInfo = byContractorCur[name];
      const uid = 'ej_' + name.replace(/\s/g, '_');
      html += `<div style="background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-weight:600;font-size:15px">${name}</span>
          <span style="color:var(--gold);font-weight:700;font-size:18px;direction:ltr">₪${info.total.toLocaleString()}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <div style="flex:1;background:rgba(255,255,255,.06);border-radius:4px;height:8px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,var(--gold),var(--cyan));border-radius:4px;transition:width .5s"></div>
          </div>
          <span style="color:var(--dim);font-size:12px;min-width:60px;text-align:left">${pct}% · ${info.count} עבודות</span>
        </div>
        ${!isCurrentMonth && curInfo ? `<div style="font-size:12px;color:var(--cyan);margin-bottom:6px;padding:5px 10px;background:rgba(0,212,255,.06);border-radius:8px;display:inline-block">${curMonthLabel}: ₪${curInfo.total.toLocaleString()} (${curInfo.count} עבודות)</div>` : ''}
        ${allTime ? `<div style="font-size:11px;color:var(--dim);opacity:.6">סה"כ כללי: ₪${allTime.total.toLocaleString()} (${allTime.count} עבודות)</div>` : ''}
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
        <button data-target="${uid}" style="background:none;border:1px solid var(--line);color:var(--cyan);padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px;transition:.2s" class="earningsToggle">פרטי עבודות ▼</button>
        <button data-send="${uid}" data-name="${name}" style="background:none;border:1px solid rgba(218,165,32,.4);color:var(--gold);padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px;transition:.2s" class="earningsSend">📤 שלח דוח לקבלן</button>
        </div>
        <div id="${uid}" style="display:none;margin-top:8px">
          ${info.jobs.map((j: any) => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(218,165,32,.05);font-size:12px">
            <span style="color:var(--dim)">${j.date || ''} · ${j.type || ''} · ${j.vehicle || ''}</span>
            <span style="color:var(--gold);direction:ltr">₪${(j.price || 0).toLocaleString()}</span>
          </div>`).join('')}
        </div>
      </div>`;
    }
    html += '</div>';
    $('winBody').innerHTML = html;

    // Month navigation handlers
    const prevBtn = document.getElementById('earPrev');
    const nextBtn = document.getElementById('earNext');
    if (prevBtn) prevBtn.onclick = () => hgShowEarnings(contractor, prevMonth);
    if (nextBtn && !isCurrentMonth) nextBtn.onclick = () => hgShowEarnings(contractor, nextMonth);

    $('winBody').querySelectorAll<HTMLButtonElement>('.earningsToggle').forEach(btn => {
      btn.onclick = () => {
        const target = document.getElementById(btn.dataset.target || '');
        if (target) {
          const open = target.style.display !== 'none';
          target.style.display = open ? 'none' : 'block';
          btn.textContent = open ? 'פרטי עבודות ▼' : 'הסתר ▲';
        }
      };
    });
    $('winBody').querySelectorAll<HTMLButtonElement>('.earningsSend').forEach(btn => {
      btn.onclick = async () => {
        const cn = btn.dataset.name || '';
        const info = byContractor[cn];
        if (!info) return;
        const lines: string[] = [];
        lines.push(`דוח עבודות — ${cn}`);
        lines.push(`חודש: ${monthLabel}`);
        lines.push('────────────────────');
        const jobs = [...info.jobs].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        jobs.forEach((j: any, i: number) => {
          const d = j.date ? new Date(j.date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
          const desc = [j.type, j.vehicle].filter(Boolean).join(' · ') || 'התקנה';
          const idPart = j.id ? ` (${j.id})` : '';
          lines.push(`${i + 1}. ${d} · ${desc}${idPart} — ₪${(j.price || 0).toLocaleString()}`);
        });
        lines.push('────────────────────');
        lines.push(`סה"כ ${info.count} עבודות: ₪${info.total.toLocaleString()}`);
        lines.push('');
        lines.push('* לפני הוצאת חשבונית — נא לאשר את הנתונים.');
        const text = lines.join('\n');
        try {
          if (navigator.share) {
            await navigator.share({ title: `דוח ${cn} · ${monthLabel}`, text });
          } else {
            await navigator.clipboard.writeText(text);
            addMsg(`📋 הדוח של ${cn} הועתק — אפשר להדביק בוואטסאפ`, 'sys');
          }
        } catch {
          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
      };
    });
  }

  // HeavyGuard hard business rule: the company does NOT install or quote
  // 8-camera systems. Block any quote that references one — enforced in code so
  // it holds even if the model ignores the prompt rule.
  function isEightCameraRequest(text: string): boolean {
    const s = (text || '').toLowerCase();
    return /(^|[^\d])8\s*(-?\s*)?(cam|cameras|camera|מצלמות|מצלמה|ערוצים|channels?|ch)\b/.test(s)
      || /\b8\s*(ch|channel)\b/.test(s)
      || /(8|שמונה)\s*מצלמות/.test(s);
  }

  async function hgCreateQuote(customer: string, phone: string, itemsStr: string) {
    if (isEightCameraRequest(itemsStr) || isEightCameraRequest(customer)) {
      addMsg('⛔ Heavy Guard לא מתקינה ולא מתמחרת מערכות של 8 מצלמות. אפשר להציע תצורה נתמכת אחרת (למשל מערך 360° ללא 8 מצלמות).', 'sys');
      return;
    }
    const items = itemsStr.split(',').map(s => {
      const [desc, priceStr] = s.trim().split(':');
      return { description: (desc || '').trim(), price: parseFloat(priceStr) || 0, qty: 1 };
    }).filter(i => i.description);
    const uid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const newQuote = {
      id: uid, customer: customer || '', phone: phone || '', items,
      total: items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0),
      date: new Date().toISOString().slice(0, 10), status: 'draft', ts: Date.now(),
    };
    const quotes = await hgLoad('hg2:quotes');
    quotes.unshift(newQuote);
    localStorage.setItem('hg2:quotes', JSON.stringify(quotes));
    addMsg(`הצעת מחיר נוצרה עבור ${customer || 'לקוח'}`, 'sys');
    puterSync.scheduleSync(() => updateCloudIndicator());
  }

  // AR Camera — game-like interactive experience with hand tracking
  let arStream: MediaStream | null = null;
  let arAnimFrame = 0;
  let arHandLoop = 0;

  interface ArObj {
    x: number; y: number; vx: number; vy: number;
    r: number; type: 'ball' | 'cube' | 'star' | 'diamond' | 'coin' | 'bomb' | 'portal';
    color: string; rotation: number; rotSpd: number;
    grabbed: boolean; hp: number; age: number; points: number;
    glow: number; trail: { x: number; y: number; t: number }[];
  }
  let arObjects: ArObj[] = [];
  let arHandPos = { x: -1, y: -1, pinching: false };
  let arHand2Pos = { x: -1, y: -1, pinching: false };
  // Hand-zone for character switching: hold your hand in the dashed circle.
  let arZoneDwell = 0;       // seconds the hand has been inside the zone
  let arZoneCooldown = 0;    // seconds before the zone can fire again
  const AR_ZONE = { x: 0.5, y: 0.74, r: 0.13 }; // normalized (lower-centre)
  let arGrabbed: ArObj | null = null;
  let arObjCtx: CanvasRenderingContext2D | null = null;

  // Game state
  let arScore = 0;
  let arCombo = 0;
  let arComboTimer = 0;
  let arGameMode: 'sandbox' | 'catch' | 'target' | 'zen' = 'sandbox';
  let arGameActive = false;
  let arGameTimer = 0;
  let arGameSpawnTimer = 0;
  let arFloatingTexts: { x: number; y: number; text: string; life: number; color: string }[] = [];
  let arGesture: 'none' | 'peace' | 'fist' | 'palm' | 'thumbsUp' | 'pointUp' = 'none';
  let arGravityZones: { x: number; y: number; r: number; strength: number; hue: number }[] = [];
  let arTrampoline: { x: number; y: number; w: number; active: boolean } | null = null;

  type ArEffect = 'none' | 'fire' | 'water' | 'laser' | 'sparkle' | 'rainbow';
  let arCurrentFx: ArEffect = 'none';

  // ── Dispel & Summon system ──────────────────────────────────
  interface ArCharacter {
    name: string; url: string; img?: HTMLImageElement;
    color?: string; // type glow color
    drawFn?: (ctx: CanvasRenderingContext2D, size: number) => void;
  }
  const arCharacters: ArCharacter[] = [];
  let arCharIdx = -1;           // which character is summoned (-1 = none)
  let arCharAnim = 0;           // 0→1 entry animation progress
  let arCharFromDir = { x: 0, y: 0 };
  let arOrbDispelled = false;
  let arPalmHoldTime = 0;
  let arPrevGesture: 'none' | 'peace' | 'fist' | 'palm' | 'thumbsUp' | 'pointUp' = 'none';
  let arFistStartTime = 0;
  let arThrowCooldown = 0;
  let arBeamFiring = false;
  let arBeamOrigin = { x: 0.5, y: 0.5 };
  let arBeamProgress = 0;
  // Pokeball animation state
  let arPokeballPhase: 'idle' | 'fly' | 'wobble' | 'open' | 'done' = 'idle';
  let arPokeballT = 0;
  let arPokeballFrom = { x: 0.5, y: 0.8 };
  let arCharCtx: CanvasRenderingContext2D | null = null;

  // ── Pokeball canvas draw helper ──────────────────────────
  function drawPokeballAt(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, wobble = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(wobble);
    ctx.shadowColor = '#ff3333';
    ctx.shadowBlur = r * 0.4;
    // Red top
    ctx.beginPath();
    ctx.arc(0, 0, r, Math.PI, 0);
    ctx.fillStyle = '#e63835';
    ctx.fill();
    // White bottom
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.shadowBlur = 0;
    // Black outline + stripe
    ctx.strokeStyle = '#111';
    ctx.lineWidth = r * 0.06;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.stroke();
    // Center button
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#111';
    ctx.lineWidth = r * 0.06;
    ctx.stroke();
    ctx.restore();
  }

  // ── Pokemon canvas draw functions ────────────────────────
  function drawPikachu(ctx: CanvasRenderingContext2D, s: number) {
    // Body
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.ellipse(0, s * 0.05, s * 0.28, s * 0.32, 0, 0, Math.PI * 2); ctx.fill();
    // Ears
    ctx.fillStyle = '#ffd700';
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(sx * s * 0.18, -s * 0.22);
      ctx.lineTo(sx * s * 0.26, -s * 0.46);
      ctx.lineTo(sx * s * 0.10, -s * 0.22);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.moveTo(sx * s * 0.17, -s * 0.34);
      ctx.lineTo(sx * s * 0.24, -s * 0.46);
      ctx.lineTo(sx * s * 0.11, -s * 0.34);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffd700';
    }
    // Brown back stripes
    ctx.strokeStyle = '#b8860b'; ctx.lineWidth = s * 0.04;
    ctx.beginPath(); ctx.moveTo(-s * 0.13, -s * 0.16); ctx.lineTo(s * 0.13, -s * 0.16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s * 0.17, -s * 0.05); ctx.lineTo(s * 0.17, -s * 0.05); ctx.stroke();
    // Red cheeks
    ctx.fillStyle = 'rgba(220,50,50,0.85)';
    ctx.beginPath(); ctx.ellipse(-s * 0.19, s * 0.04, s * 0.08, s * 0.055, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(s * 0.19, s * 0.04, s * 0.08, s * 0.055, 0, 0, Math.PI * 2); ctx.fill();
    // Eyes
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(-s * 0.10, -s * 0.07, s * 0.055, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.10, -s * 0.07, s * 0.055, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-s * 0.09, -s * 0.09, s * 0.018, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.11, -s * 0.09, s * 0.018, 0, Math.PI * 2); ctx.fill();
    // Lightning bolt tail
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = s * 0.065; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s * 0.26, s * 0.10);
    ctx.lineTo(s * 0.40, -s * 0.08);
    ctx.lineTo(s * 0.30, -s * 0.08);
    ctx.lineTo(s * 0.44, -s * 0.30);
    ctx.stroke();
    // Feet
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.ellipse(-s * 0.13, s * 0.33, s * 0.07, s * 0.05, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(s * 0.13, s * 0.33, s * 0.07, s * 0.05, 0.2, 0, Math.PI * 2); ctx.fill();
  }

  function drawCharizard(ctx: CanvasRenderingContext2D, s: number) {
    ctx.fillStyle = '#3a8fb5';
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(sx * s * 0.12, -s * 0.05);
      ctx.lineTo(sx * s * 0.52, -s * 0.38);
      ctx.lineTo(sx * s * 0.48, s * 0.12);
      ctx.lineTo(sx * s * 0.22, s * 0.06);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#f08030';
    ctx.beginPath(); ctx.ellipse(0, s * 0.06, s * 0.22, s * 0.30, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f0e0b0';
    ctx.beginPath(); ctx.ellipse(0, s * 0.10, s * 0.14, s * 0.22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f08030';
    ctx.beginPath(); ctx.arc(0, -s * 0.20, s * 0.17, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#10c010';
    ctx.beginPath(); ctx.arc(-s * 0.07, -s * 0.22, s * 0.05, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.07, -s * 0.22, s * 0.05, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(-s * 0.07, -s * 0.22, s * 0.025, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.07, -s * 0.22, s * 0.025, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f08030';
    ctx.beginPath();
    ctx.moveTo(s * 0.15, s * 0.28);
    ctx.quadraticCurveTo(s * 0.42, s * 0.44, s * 0.36, s * 0.56);
    ctx.quadraticCurveTo(s * 0.28, s * 0.44, s * 0.20, s * 0.34);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff6600';
    ctx.beginPath(); ctx.arc(s * 0.36, s * 0.57, s * 0.07, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath(); ctx.arc(s * 0.37, s * 0.54, s * 0.04, 0, Math.PI * 2); ctx.fill();
  }

  function drawCharmander(ctx: CanvasRenderingContext2D, s: number) {
    ctx.fillStyle = '#f08030';
    ctx.beginPath(); ctx.ellipse(0, s * 0.08, s * 0.20, s * 0.26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f0e080';
    ctx.beginPath(); ctx.ellipse(0, s * 0.12, s * 0.12, s * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f08030';
    ctx.beginPath(); ctx.arc(0, -s * 0.18, s * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4090e0';
    ctx.beginPath(); ctx.arc(-s * 0.06, -s * 0.20, s * 0.045, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.06, -s * 0.20, s * 0.045, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(-s * 0.06, -s * 0.20, s * 0.022, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.06, -s * 0.20, s * 0.022, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f08030';
    ctx.beginPath();
    ctx.moveTo(s * 0.18, s * 0.25);
    ctx.quadraticCurveTo(s * 0.40, s * 0.36, s * 0.36, s * 0.48);
    ctx.quadraticCurveTo(s * 0.28, s * 0.38, s * 0.20, s * 0.32);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff8800';
    ctx.beginPath(); ctx.arc(s * 0.37, s * 0.49, s * 0.055, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffdd00';
    ctx.beginPath(); ctx.arc(s * 0.37, s * 0.47, s * 0.03, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f08030'; ctx.lineWidth = s * 0.07; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-s * 0.16, s * 0.02); ctx.lineTo(-s * 0.28, s * 0.12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s * 0.16, s * 0.02); ctx.lineTo(s * 0.28, s * 0.12); ctx.stroke();
  }

  function drawSquirtle(ctx: CanvasRenderingContext2D, s: number) {
    // Shell
    ctx.fillStyle = '#7a5c14';
    ctx.beginPath(); ctx.ellipse(0, s * 0.10, s * 0.23, s * 0.25, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#4a3808'; ctx.lineWidth = s * 0.025;
    ctx.beginPath(); ctx.moveTo(0, -s * 0.14); ctx.lineTo(0, s * 0.32); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s * 0.20, s * 0.10); ctx.lineTo(s * 0.20, s * 0.10); ctx.stroke();
    // Body
    ctx.fillStyle = '#4896c8';
    ctx.beginPath(); ctx.ellipse(0, s * 0.08, s * 0.18, s * 0.20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c8e8f0';
    ctx.beginPath(); ctx.ellipse(0, s * 0.12, s * 0.10, s * 0.14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4896c8';
    ctx.beginPath(); ctx.arc(0, -s * 0.18, s * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(-s * 0.06, -s * 0.20, s * 0.05, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.06, -s * 0.20, s * 0.05, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-s * 0.055, -s * 0.21, s * 0.018, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.065, -s * 0.21, s * 0.018, 0, Math.PI * 2); ctx.fill();
    // Curled tail
    ctx.strokeStyle = '#4896c8'; ctx.lineWidth = s * 0.07; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s * 0.16, s * 0.25);
    ctx.bezierCurveTo(s * 0.42, s * 0.36, s * 0.46, s * 0.14, s * 0.32, s * 0.02);
    ctx.stroke();
  }

  function drawMeowth(ctx: CanvasRenderingContext2D, s: number) {
    ctx.fillStyle = '#d4b896';
    ctx.beginPath(); ctx.ellipse(0, s * 0.10, s * 0.20, s * 0.26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f5e8d8';
    ctx.beginPath(); ctx.ellipse(0, s * 0.12, s * 0.12, s * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d4b896';
    ctx.beginPath(); ctx.arc(0, -s * 0.17, s * 0.18, 0, Math.PI * 2); ctx.fill();
    // Ears
    for (const sx of [-1, 1]) {
      ctx.fillStyle = '#d4b896';
      ctx.beginPath();
      ctx.moveTo(sx * s * 0.14, -s * 0.28);
      ctx.lineTo(sx * s * 0.22, -s * 0.42);
      ctx.lineTo(sx * s * 0.06, -s * 0.30);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f0a8b8';
      ctx.beginPath();
      ctx.moveTo(sx * s * 0.13, -s * 0.30);
      ctx.lineTo(sx * s * 0.20, -s * 0.41);
      ctx.lineTo(sx * s * 0.07, -s * 0.31);
      ctx.closePath(); ctx.fill();
    }
    // Gold coin
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(0, -s * 0.28, s * 0.065, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b8860b'; ctx.lineWidth = s * 0.02; ctx.stroke();
    // Eyes
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.ellipse(-s * 0.07, -s * 0.17, s * 0.04, s * 0.055, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(s * 0.07, -s * 0.17, s * 0.04, s * 0.055, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-s * 0.065, -s * 0.19, s * 0.015, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.075, -s * 0.19, s * 0.015, 0, Math.PI * 2); ctx.fill();
    // Whiskers
    ctx.strokeStyle = '#888'; ctx.lineWidth = s * 0.015;
    ctx.beginPath(); ctx.moveTo(-s * 0.08, -s * 0.12); ctx.lineTo(-s * 0.30, -s * 0.10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s * 0.08, -s * 0.09); ctx.lineTo(-s * 0.30, -s * 0.08); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s * 0.08, -s * 0.12); ctx.lineTo(s * 0.30, -s * 0.10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s * 0.08, -s * 0.09); ctx.lineTo(s * 0.30, -s * 0.08); ctx.stroke();
    // Curled tail
    ctx.strokeStyle = '#d4b896'; ctx.lineWidth = s * 0.07; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s * 0.16, s * 0.28);
    ctx.bezierCurveTo(s * 0.44, s * 0.36, s * 0.46, s * 0.04, s * 0.30, -s * 0.06);
    ctx.stroke();
  }

  // Register all built-in Pokemon
  function registerBuiltinPokemon() {
    arCharacters.length = 0;
    arCharacters.push({ name: 'Pikachu', url: '', color: '#ffd700', drawFn: drawPikachu });
    arCharacters.push({ name: 'Charizard', url: '', color: '#f08030', drawFn: drawCharizard });
    arCharacters.push({ name: 'Charmander', url: '', color: '#ff8800', drawFn: drawCharmander });
    arCharacters.push({ name: 'Squirtle', url: '', color: '#4896c8', drawFn: drawSquirtle });
    arCharacters.push({ name: 'Meowth', url: '', color: '#d4b896', drawFn: drawMeowth });
  }
  registerBuiltinPokemon();

  // Add image-based character (keeps built-ins in place)
  function addArCharacter(name: string, url: string) {
    const ch: ArCharacter = { name, url };
    const img = new Image();
    img.src = url;
    img.onload = () => { ch.img = img; };
    arCharacters.push(ch);
  }
  (window as any).addArCharacter = addArCharacter;

  // Switch to a Pokemon by name or index (callable by AI assistant)
  function switchArPokemon(nameOrIdx: string | number) {
    if (arCharacters.length === 0) return;
    if (typeof nameOrIdx === 'number') {
      arCharIdx = ((nameOrIdx % arCharacters.length) + arCharacters.length) % arCharacters.length;
    } else {
      const lo = nameOrIdx.toLowerCase();
      const idx = arCharacters.findIndex(c => c.name.toLowerCase().includes(lo));
      arCharIdx = idx >= 0 ? idx : (arCharIdx + 1) % arCharacters.length;
    }
    arCharAnim = 0;
    arPokeballPhase = 'fly';
    arPokeballT = 0;
    arPokeballFrom = { x: 0.5, y: 0.85 };
    if (!arOrbDispelled) {
      arOrbDispelled = true;
      document.getElementById('stage')?.classList.add('stage-dispelled');
    }
  }
  (window as any).switchArPokemon = switchArPokemon;
  (window as any).dispelOrb = () => {
    if (!arOrbDispelled) {
      arOrbDispelled = true;
      document.getElementById('stage')?.classList.add('stage-dispelled');
    }
  };

  // ── Main assistant character (the orb avatar) ───────────────
  // The orb's main character is Pikachu by default and can be swapped for the
  // other models the user provided. Persisted so it survives reloads.
  const MAIN_CHAR_KEY = 'alpha_main_character';
  const MAIN_CHARACTERS = [
    { id: 'pikachu',    label: 'פיקאצ\'ו',   words: /(פיקאצ'?ו|פיקצ'?ו|פיקא|pikachu|pika)/i },
    { id: 'charmander', label: 'צ\'רמנדר',   words: /(צ'?רמנדר|צ'?ארמנדר|charmander|charm)/i },
    { id: 'squirtle',   label: 'סקווירטל',   words: /(סקווירטל|סקוירטל|squirtle|squirt)/i },
    { id: 'meowth',     label: 'מיאוט\'',    words: /(מיאו?את'?|מיואו|meowth|meow)/i },
    { id: 'bulbasaur',  label: 'בולבסאור',   words: /(בולב|bulbasaur|bulba)/i },
    { id: 'eevee',      label: 'איווי',       words: /(איווי|אאיווי|eevee|evee)/i },
    { id: 'mewtwo',     label: 'מיוטו',      words: /(מיוטו|mewtwo|mew\s?two)/i },
    { id: 'articuno',   label: 'ארטיקונו',   words: /(ארטיקונו|articuno)/i },
    { id: 'suicune',    label: 'סויקון',      words: /(סויקון|suicune)/i },
    { id: 'raikou',     label: 'ריאיקו',     words: /(ריאיקו|raikou)/i },
    { id: 'entei',      label: 'אנטיי',      words: /(אנטיי|entei)/i },
    { id: 'moltres',    label: 'מולטרס',     words: /(מולטרס|moltres)/i },
    { id: 'zapdos',     label: 'זאפדוס',     words: /(זאפדוס|zapdos)/i },
    { id: 'lugia',      label: 'לוגיה',      words: /(לוגיה|lugia)/i },
    { id: 'ho-oh',      label: 'הו-אוה',     words: /(הו.?אוה|ho.?oh)/i },
    // Imported Gen-1 pack (untextured, type-tinted) — selectable like the rest.
    ...GEN1.map(g => ({ id: g.id, label: g.label, words: new RegExp(g.words, 'i') })),
  ];

  function setMainCharacter(id: string): string {
    const ch = MAIN_CHARACTERS.find(c => c.id === id) || MAIN_CHARACTERS[0];
    // Bringing a character in ALWAYS un-dispels the orb. Without this, a Pokémon
    // summoned while the orb was dispelled (palm-release gesture) loads invisibly —
    // you'd hear its cry and see the ambient colours but not the model itself.
    arOrbDispelled = false;
    document.getElementById('stage')?.classList.remove('stage-dispelled');
    orb.setCharacter(ch.id);
    localStorage.setItem(MAIN_CHAR_KEY, ch.id);
    document.body.dataset.char = ch.id;   // per-character ambient (fire/water/hypnosis)
    applyCharacterVoice(ch.id);
    orb.pikaEmote('excited');
    (window as any).__crpSyncIfOpen?.();
    return ch.label;
  }
  (window as any).setMainCharacter = setMainCharacter;

  // Voice handoff: when the active character is NOT Pikachu, mute Pikachu's
  // voice and let that character do its own synthesized cries. Switching back
  // to Pikachu restores his voice (respecting the user's voice on/off setting).
  // Per-character colouring of the assistant's spoken (TTS) voice. Meowth
  // "talks", so when he's the avatar the assistant speaks in his deep raspy
  // voice; Charmander/Squirtle get subtler tints; Pikachu = normal.
  const CHAR_TTS: Record<string, { pitch?: number; rate?: number } | null> = {
    pikachu: null,
    charmander: { pitch: 0.7, rate: 0.97 },
    squirtle: { pitch: 1.3, rate: 1.06 },
    meowth: { pitch: 0.4, rate: 0.9 },
  };
  function applyCharacterVoice(id: string) {
    unlockCharacterAudio();
    setCharacterVolume(state.pikaVolume);
    voice.charVoice = CHAR_TTS[id] || null;   // colour the assistant's speech
    if (id === 'none' || id === 'robot') {
      // No character / the robot → no Pokémon cries.
      setPikaEnabled(false);
      stopCharacterVoice();
      return;
    }
    if (id === 'pikachu') {
      stopCharacterVoice();
      setActiveCharacter('pikachu');
      setPikaEnabled(state.pikaVoiceOn);       // restore Pikachu per user setting
    } else if (id === 'meowth') {
      // Meowth talks (via the TTS voice above) rather than doing animal cries.
      setPikaEnabled(false);
      stopCharacterVoice();
      if (state.pikaVoiceOn) setTimeout(() => playCharacterCry('meowth'), 200); // one greeting cry
    } else {
      setPikaEnabled(false);                   // mute Pikachu
      setActiveCharacter(id);                  // start this character's idle cries
      if (state.pikaVoiceOn) setTimeout(() => playCharacterCry(id), 200);
    }
  }

  // Apply the saved character on startup (if not the default Pikachu).
  // Default centerpiece on every open is the ROBOT (no Pokémon unless the user
  // picks one). The robot swaps like any character via the picker.
  document.body.dataset.char = 'robot';
  setTimeout(() => { orb.setCharacter('robot'); applyCharacterVoice('robot'); }, 600);

  // ── Animated main-character swap (red-laser dispel + pokeball summon) ──
  // Plays over the orb on the main screen: a red laser strikes the current
  // character → it vanishes → a pokeball flies in, wobbles, cracks open with a
  // laser burst → the new character emerges (loaded into the orb).
  let charSwapBusy = false;

  // Swap the main character with: red-laser dispel → real 3D Pokéball flies in,
  // wobbles, opens with a burst → new character loads. Runs over the orb stage.
  function swapMainCharacterAnimated(nextId: string) {
    if (charSwapBusy) return;
    const cvs = $<HTMLCanvasElement>('charSwapFx');
    const stage = document.getElementById('stage');
    const ctx = cvs.getContext('2d');
    // If the orb was dispelled (e.g. via the palm gesture) the stage is faded
    // to opacity:0 — restore it so the pokeball fly-in AND the summoned model
    // are visible, not just the sound and ambient colors.
    arOrbDispelled = false;
    stage?.classList.remove('stage-dispelled');
    if (!ctx || !stage) { setMainCharacter(nextId); return; }
    charSwapBusy = true;
    $('charSwapBtn')?.classList.add('busy');
    cvs.classList.add('active');
    const rect = stage.getBoundingClientRect();
    cvs.width = rect.width; cvs.height = rect.height;
    const W = cvs.width, H = cvs.height;
    const cx = W / 2, cy = H * 0.46;
    const start = performance.now();
    let handedOff = false;
    function laser(now: number) {
      const t = (now - start) / 1000;
      ctx!.clearRect(0, 0, W, H);
      // Note: we do NOT hide #stage — the 3D pokeball renders inside the orb
      // scene, so the stage must stay visible. orb.throwPokeball hides just the
      // character mesh at the right moment.
      if (t < 0.7) {
        // red laser beam bottom → orb centre, with an electric crackle along it
        const p = Math.min(1, t / 0.45);
        const ex = cx, ey = H + (cy - H) * p;
        ctx!.save(); ctx!.lineCap = 'round';
        const layers = [[26, .08], [15, .2], [6, .5], [2, 1]] as const;
        const cols = ['rgba(255,40,40,1)','rgba(255,70,40,1)','rgba(255,130,60,1)','#fff'];
        layers.forEach((L, i) => {
          ctx!.beginPath(); ctx!.moveTo(cx, H); ctx!.lineTo(ex, ey);
          ctx!.lineWidth = L[0]; ctx!.globalAlpha = L[1]; ctx!.strokeStyle = cols[i];
          ctx!.shadowColor = '#ff2200'; ctx!.shadowBlur = i === 3 ? 30 : 0; ctx!.stroke();
        });
        // jagged electric arc overlaid on the beam (energy crackle)
        ctx!.globalAlpha = 0.85; ctx!.strokeStyle = '#ffd9c0'; ctx!.lineWidth = 1.4; ctx!.shadowColor = '#ff6a3c'; ctx!.shadowBlur = 8;
        ctx!.beginPath(); ctx!.moveTo(cx, H);
        const segs = 9;
        for (let s = 1; s <= segs; s++) {
          const f = s / segs; const bx = cx + (ex - cx) * f, by = H + (ey - H) * f;
          ctx!.lineTo(bx + (Math.random() - 0.5) * 16, by + (Math.random() - 0.5) * 10);
        }
        ctx!.stroke();
        // impact burst near the end + radiating sparks
        if (p >= 1) {
          const bp = (t - 0.45) / 0.25, rr = Math.min(W, H) * 0.28 * bp;
          const g = ctx!.createRadialGradient(cx, cy, 0, cx, cy, rr);
          g.addColorStop(0, `rgba(255,255,255,${0.9 * (1 - bp)})`);
          g.addColorStop(0.4, `rgba(255,60,30,${0.7 * (1 - bp)})`);
          g.addColorStop(1, 'rgba(255,0,0,0)');
          ctx!.globalAlpha = 1; ctx!.fillStyle = g;
          ctx!.beginPath(); ctx!.arc(cx, cy, rr, 0, Math.PI * 2); ctx!.fill();
          ctx!.strokeStyle = '#ffe0c0'; ctx!.lineWidth = 2; ctx!.shadowColor = '#ff5a2a'; ctx!.shadowBlur = 12; ctx!.globalAlpha = 1 - bp;
          for (let k = 0; k < 12; k++) {
            const a = (k / 12) * Math.PI * 2 + bp; const r0 = rr * 0.5, r1 = rr * (0.9 + Math.random() * 0.4);
            ctx!.beginPath(); ctx!.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx!.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx!.stroke();
          }
        }
        ctx!.restore();
        requestAnimationFrame(laser);
      } else if (!handedOff) {
        handedOff = true;
        ctx!.clearRect(0, 0, W, H);
        cvs.classList.remove('active');
        // Hand off to the real 3D pokeball rendered INSIDE the orb scene
        // (always visible — same context that renders the characters).
        orb.throwPokeball(
          () => { setMainCharacter(nextId); },
          () => { charSwapBusy = false; $('charSwapBtn')?.classList.remove('busy'); },
        );
      }
    }
    requestAnimationFrame(laser);
  }
  (window as any).swapMainCharacterAnimated = swapMainCharacterAnimated;

  // Summon dock — a macOS-style row of Pokéballs (small artwork above the ball,
  // name below). Opens on summon; the mic listens and the user picks a Pokémon
  // by saying its name → it arrives with the wild swap animation.
  {
    const dock = document.getElementById('summonDock') as HTMLDivElement;
    const row = document.getElementById('summonDockRow') as HTMLDivElement;
    const hint = document.getElementById('summonDockHint') as HTMLDivElement;
    let dockOpen = false;
    let dockTimer: number | undefined;
    let dockRec: any = null;
    let restoreWake = false;

    // PokeAPI National-Dex numbers → official artwork sprites (via jsdelivr).
    const DEX: Record<string, number> = {
      pikachu: 25, charmander: 4, squirtle: 7, meowth: 52, bulbasaur: 1,
      eevee: 133, mewtwo: 150, articuno: 144, suicune: 245, raikou: 243,
      entei: 244, moltres: 146, zapdos: 145, lugia: 249, 'ho-oh': 250,
    };
    for (const g of GEN1) DEX[g.id] = g.dex;   // imported pack → PokeAPI artwork sprites
    const SPRITE = (id: string) =>
      `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/${DEX[id]}.png`;

    function buildDock() {
      const cur = localStorage.getItem(MAIN_CHAR_KEY) || 'pikachu';
      row.innerHTML = MAIN_CHARACTERS.map((c, i) => `
        <button class="sd-item${c.id === cur ? ' sd-current' : ''}" data-id="${c.id}" style="--d:${i * 0.03}s">
          <img class="sd-img" src="${SPRITE(c.id)}" alt="${c.label}" loading="eager"
               onerror="this.style.visibility='hidden'" />
          <span class="sd-ball"><span class="sd-ball-btn"></span></span>
          <span class="sd-name">${c.label}</span>
        </button>`).join('');
      row.querySelectorAll<HTMLButtonElement>('.sd-item').forEach(btn => {
        btn.addEventListener('click', () => selectPokemon(btn.dataset.id!));
      });
    }

    // macOS dock magnification — items swell toward the cursor.
    function magnify(clientX: number) {
      const items = Array.from(row.querySelectorAll<HTMLElement>('.sd-item'));
      const MAX = 150;
      items.forEach(it => {
        const r = it.getBoundingClientRect();
        const c = r.left + r.width / 2;
        const d = Math.abs(clientX - c);
        const scale = d > MAX ? 1 : 1 + 0.55 * (1 - d / MAX);
        it.style.setProperty('--scale', scale.toFixed(3));
      });
    }
    function resetMagnify() {
      row.querySelectorAll<HTMLElement>('.sd-item').forEach(it => it.style.setProperty('--scale', '1'));
    }
    row.addEventListener('pointermove', e => magnify(e.clientX));
    row.addEventListener('pointerleave', resetMagnify);

    function startDockVoice() {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) { hint.innerHTML = '👆 בחר פוקימון מהשורה'; return; }
      try {
        dockRec = new SR();
        dockRec.lang = state.micLang === 'he' ? 'he-IL' : state.micLang === 'es' ? 'es-ES' : 'en-US';
        dockRec.continuous = true; dockRec.interimResults = true; dockRec.maxAlternatives = 3;
        dockRec.onresult = (e: any) => {
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const res = e.results[i];
            for (let a = 0; a < res.length; a++) {
              const t = (res[a].transcript || '').toLowerCase();
              const match = MAIN_CHARACTERS.find(c => c.words.test(t));
              if (match) { selectPokemon(match.id); return; }
            }
          }
        };
        dockRec.onerror = () => {};
        dockRec.start();
      } catch {}
    }
    function stopDockVoice() {
      if (dockRec) { try { dockRec.stop(); } catch {} dockRec = null; }
    }

    // Spectacular summon burst: white core flash + expanding shockwave ring.
    function summonFlash() {
      const f = document.createElement('div');
      f.className = 'summon-flash';
      const ring = document.createElement('div');
      ring.className = 'summon-shock';
      document.body.appendChild(f);
      document.body.appendChild(ring);
      setTimeout(() => { f.remove(); ring.remove(); }, 1100);
    }

    // Real 3D Pokéball in the screen centre while choosing — its own tiny WebGL
    // scene rendering the uploaded pokeball.glb, spinning. Launches up off-screen
    // when a Pokémon is picked.
    let sbRenderer: THREE.WebGLRenderer | null = null;
    let sbScene: THREE.Scene | null = null, sbCamera: THREE.PerspectiveCamera | null = null;
    let sbBall: THREE.Object3D | null = null, sbRaf = 0;
    function initSummonBall3D() {
      if (sbRenderer) return;
      const canvas = document.getElementById('summonOrbCanvas') as HTMLCanvasElement | null;
      if (!canvas) return;
      try {
        sbRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        sbRenderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        sbRenderer.setSize(240, 240, false);
        sbScene = new THREE.Scene();
        sbCamera = new THREE.PerspectiveCamera(38, 1, 0.1, 100); sbCamera.position.set(0, 0, 4.0);
        sbScene.add(new THREE.AmbientLight(0xffffff, 0.95));
        const d = new THREE.DirectionalLight(0xffffff, 1.25); d.position.set(2, 3, 4); sbScene.add(d);
        const d2 = new THREE.DirectionalLight(0xffe0a0, 0.5); d2.position.set(-3, 1, -2); sbScene.add(d2);
        import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
          new GLTFLoader().load((import.meta.env.BASE_URL || '/') + 'ar-models/pokeball.glb', (g: any) => {
            const m: THREE.Object3D = g.scene;
            m.traverse((o: any) => { if (o.isMesh) o.geometry.computeVertexNormals(); });
            // Tilt so the equator (red/white split + band + button) faces the
            // camera (red on top, classic), THEN centre/scale in the tilted frame.
            m.rotation.x = -Math.PI / 2;
            m.updateMatrixWorld(true);
            const bb = new THREE.Box3().setFromObject(m);
            const sz = bb.getSize(new THREE.Vector3()); const c = bb.getCenter(new THREE.Vector3());
            const s = 1.7 / Math.max(sz.x, sz.y, sz.z);
            const inner = new THREE.Group(); inner.add(m);
            m.scale.setScalar(s); m.position.set(-c.x * s, -c.y * s, -c.z * s);
            sbScene!.add(inner); sbBall = inner;
          }, undefined, () => {});
        });
      } catch { sbRenderer = null; }
    }
    function startSummonBall() {
      initSummonBall3D();
      if (sbRaf || !sbRenderer) return;
      const tick = () => {
        sbRaf = requestAnimationFrame(tick);
        if (sbBall) { sbBall.rotation.y += 0.03; sbBall.rotation.z = Math.sin(performance.now() / 1100) * 0.08; }
        if (sbRenderer && sbScene && sbCamera) sbRenderer.render(sbScene, sbCamera);
      };
      tick();
    }
    function stopSummonBall() { cancelAnimationFrame(sbRaf); sbRaf = 0; }

    // Laser fired DOWN from the rising pokéball onto the orb centre, which then
    // reveals the chosen Pokémon. Drawn on the full-stage charSwapFx canvas.
    function summonBeam(id: string) {
      const cvs = $<HTMLCanvasElement>('charSwapFx');
      const stage = document.getElementById('stage');
      const ctx = cvs.getContext('2d');
      if (!ctx || !stage) { setMainCharacter(id); return; }
      cvs.classList.add('active');
      const rect = stage.getBoundingClientRect();
      cvs.width = rect.width; cvs.height = rect.height;
      const W = cvs.width, H = cvs.height, cx = W / 2, cy = H * 0.46;
      const start = performance.now();
      let done = false;
      const frame = (now: number) => {
        const t = (now - start) / 1000;
        ctx.clearRect(0, 0, W, H);
        if (t < 0.6) {
          const p = Math.min(1, t / 0.4);            // beam grows top → centre
          const endY = -30 + (cy + 30) * p;
          ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          // Electric lightning core — jagged path from the top to the beam tip,
          // re-randomised each frame so it crackles.
          const jag = () => {
            ctx.beginPath(); ctx.moveTo(cx, -30);
            const segs = 9;
            for (let s = 1; s <= segs; s++) {
              const yy = -30 + (endY + 30) * (s / segs);
              const amp = 18 * (1 - p * 0.4);
              ctx.lineTo(cx + (s === segs ? 0 : (Math.random() - 0.5) * amp), yy);
            }
          };
          const layers = [[26, .08], [15, .2], [6, .5], [2.5, 1]] as const;
          const cols = ['rgba(255,55,55,1)', 'rgba(255,90,55,1)', 'rgba(255,150,80,1)', '#fff'];
          layers.forEach((L, i) => {
            jag();
            ctx.lineWidth = L[0]; ctx.globalAlpha = L[1]; ctx.strokeStyle = cols[i];
            ctx.shadowColor = '#ff2a18'; ctx.shadowBlur = i === 3 ? 30 : 10; ctx.stroke();
          });
          // Forked branches off the bolt
          ctx.globalAlpha = 0.5; ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,180,120,.9)';
          for (let b = 0; b < 3; b++) {
            const by = -30 + (endY + 30) * (0.3 + Math.random() * 0.6);
            ctx.beginPath(); ctx.moveTo(cx, by);
            ctx.lineTo(cx + (Math.random() - 0.5) * 70, by + (Math.random() - 0.3) * 50);
            ctx.stroke();
          }
          if (p >= 1) {                               // impact burst at the centre
            const bp = (t - 0.4) / 0.2, rr = Math.min(W, H) * 0.32 * bp;
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
            g.addColorStop(0, `rgba(255,255,255,${0.95 * (1 - bp)})`);
            g.addColorStop(0.4, `rgba(255,90,40,${0.7 * (1 - bp)})`);
            g.addColorStop(1, 'rgba(255,0,0,0)');
            ctx.globalAlpha = 1; ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.fill();
            // Radial spark streaks shooting out of the impact
            ctx.strokeStyle = '#ffd9a0'; ctx.lineWidth = 2; ctx.globalAlpha = 1 - bp;
            for (let k = 0; k < 14; k++) {
              const a = (k / 14) * Math.PI * 2 + bp;
              const r0 = rr * 0.5, r1 = rr * (1.1 + Math.random() * 0.4);
              ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
              ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.stroke();
            }
          }
          ctx.restore();
          requestAnimationFrame(frame);
        } else if (!done) {
          done = true; ctx.clearRect(0, 0, W, H); cvs.classList.remove('active');
          setMainCharacter(id);                       // the chosen Pokémon arrives
        }
      };
      requestAnimationFrame(frame);
    }

    function openSummonDock() {
      if (dockOpen) return;
      buildDock();
      resetMagnify();
      dock.removeAttribute('hidden');
      const orbEl = document.getElementById('summonOrb');
      orbEl?.classList.remove('launch');
      orbEl?.removeAttribute('hidden');  // 3D spinning centre pokéball
      startSummonBall();
      requestAnimationFrame(() => dock.classList.add('open'));
      dockOpen = true;
      hint.innerHTML = '<span class="sd-mic">🎙️</span> אמור שם של פוקימון…';
      // Pause the assistant mic so the two speech recognitions don't fight.
      restoreWake = voice.wakeOn;
      if (restoreWake) voice.setWake(false);
      startDockVoice();
      clearTimeout(dockTimer);
      dockTimer = window.setTimeout(() => closeSummonDock(), 8000);
    }
    function closeSummonDock() {
      if (!dockOpen) return;
      dockOpen = false;
      clearTimeout(dockTimer);
      stopDockVoice();
      stopSummonBall();
      const orbEl = document.getElementById('summonOrb');
      orbEl?.setAttribute('hidden', ''); orbEl?.classList.remove('launch');
      dock.classList.remove('open');
      setTimeout(() => dock.setAttribute('hidden', ''), 260);
      if (restoreWake) { restoreWake = false; setTimeout(() => voice.setWake(true), 350); }
    }
    function selectPokemon(id: string) {
      if (!dockOpen) return;
      clearTimeout(dockTimer);
      stopDockVoice();
      const el = row.querySelector<HTMLElement>(`.sd-item[data-id="${id}"]`);
      el?.classList.add('sd-chosen');
      // The 3D pokéball rises up toward the top of the screen…
      document.getElementById('summonOrb')?.classList.add('launch');
      // …and as it rises, fires a laser straight down onto the orb, which
      // reveals the chosen Pokémon. The dock + ball clear once it's off-screen.
      setTimeout(() => { summonFlash(); summonBeam(id); }, 300);
      setTimeout(() => closeSummonDock(), 780);
    }

    // The thumbs-up gesture (and the pokeball button) open this dock.
    (window as any).openSummonDock = openSummonDock;
    (window as any).closeSummonDock = closeSummonDock;

    $('charSwapBtn').onclick = (e) => {
      e.stopPropagation();
      if (dockOpen) closeSummonDock(); else openSummonDock();
    };
    document.addEventListener('click', (e) => {
      if (dockOpen && !(e.target as Element).closest('#summonDock, #charSwapBtn')) closeSummonDock();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && dockOpen) closeSummonDock(); });
  }

  // Character transform panel — full rotation, scale and position control per model.
  {
    const panel = document.getElementById('charRotPanel') as HTMLDivElement;
    const crpX  = $<HTMLInputElement>('crpX');
    const crpY  = $<HTMLInputElement>('crpY');
    const crpZ  = $<HTMLInputElement>('crpZ');
    const crpS  = $<HTMLInputElement>('crpS');
    const crpPX = $<HTMLInputElement>('crpPX');
    const crpPY = $<HTMLInputElement>('crpPY');
    const crpPZ = $<HTMLInputElement>('crpPZ');
    const toRad = (d: string) => parseFloat(d) * Math.PI / 180;
    const toDeg = (r: number) => Math.round(r * 180 / Math.PI);

    function crpSync() {
      const xf = orb.getCharacterTransform();
      crpX.value  = String(toDeg(xf.x));
      crpY.value  = String(toDeg(xf.y));
      crpZ.value  = String(toDeg(xf.z));
      crpS.value  = String(Math.round(xf.s * 100));
      crpPX.value = String(Math.round(xf.px * 100));
      crpPY.value = String(Math.round(xf.py * 100));
      crpPZ.value = String(Math.round(xf.pz * 100));
      $('crpXv').textContent  = crpX.value + '°';
      $('crpYv').textContent  = crpY.value + '°';
      $('crpZv').textContent  = crpZ.value + '°';
      $('crpSv').textContent  = (xf.s).toFixed(2) + '×';
      $('crpPXv').textContent = crpPX.value;
      $('crpPYv').textContent = crpPY.value;
      $('crpPZv').textContent = crpPZ.value;
    }

    function crpApply() {
      orb.setCharacterTransform(
        toRad(crpX.value), toRad(crpY.value), toRad(crpZ.value),
        parseFloat(crpS.value) / 100,
        parseFloat(crpPX.value) / 100, parseFloat(crpPY.value) / 100, parseFloat(crpPZ.value) / 100
      );
    }

    $('charPoseBtn').onclick = (e) => {
      e.stopPropagation();
      if (panel.hasAttribute('hidden')) { crpSync(); crpUpdatePinBadge(); panel.removeAttribute('hidden'); }
      else panel.setAttribute('hidden', '');
    };
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target as Node) && e.target !== $('charPoseBtn')) panel.setAttribute('hidden', '');
    });

    crpX.oninput  = () => { $('crpXv').textContent  = crpX.value + '°'; crpApply(); };
    crpY.oninput  = () => { $('crpYv').textContent  = crpY.value + '°'; crpApply(); };
    crpZ.oninput  = () => { $('crpZv').textContent  = crpZ.value + '°'; crpApply(); };
    crpS.oninput  = () => { $('crpSv').textContent  = (parseFloat(crpS.value)/100).toFixed(2) + '×'; crpApply(); };
    crpPX.oninput = () => { $('crpPXv').textContent = crpPX.value; crpApply(); };
    crpPY.oninput = () => { $('crpPYv').textContent = crpPY.value; crpApply(); };
    crpPZ.oninput = () => { $('crpPZv').textContent = crpPZ.value; crpApply(); };

    function crpUpdatePinBadge() {
      const badge = $('crpPinBadge') as HTMLElement;
      if (orb.hasPinnedTransform()) badge.removeAttribute('hidden');
      else badge.setAttribute('hidden', '');
    }

    $('crpPin').onclick = () => {
      orb.pinCharacterTransform();
      crpUpdatePinBadge();
      const btn = $('crpPin') as HTMLButtonElement;
      btn.textContent = '✓ נשמר!';
      setTimeout(() => { btn.textContent = 'שמור ככיוון ברירת מחדל'; }, 1500);
    };

    $('crpReset').onclick = () => {
      orb.resetCharacterTransform();
      crpSync();
    };

    // Auto-center: drop the object back to the dead-centre of the orb (zero position
    // offset) at the default fit scale, keeping the current rotation. One tap to
    // recover from a model that drifted off-centre or got scaled out of view.
    $('crpAuto').onclick = () => {
      crpPX.value = '0'; crpPY.value = '0'; crpPZ.value = '0'; crpS.value = '100';
      $('crpPXv').textContent = '0';
      $('crpPYv').textContent = '0';
      $('crpPZv').textContent = '0';
      $('crpSv').textContent = '1.00×';
      crpApply();
    };

    // Re-sync panel values after character swap (model loads async, so delay)
    (window as any).__crpSyncIfOpen = () => {
      if (!panel.hasAttribute('hidden')) setTimeout(() => { crpSync(); crpUpdatePinBadge(); }, 1400);
    };
  }

  // Voice/chat command → swap the MAIN assistant character (the orb avatar).
  // Returns a reply string if it handled the command, else null.
  function tryArVoiceCommand(text: string): string | null {
    const low = text.trim().toLowerCase();

    const mentionsChar = /(דמות|דמויות|פוקימון|פוקמון|אוויטר|avatar|character|pokemon|pokémon)/i.test(low);
    const hasSwitchVerb = /(החלף|תחליף|שנה|תשנה|הבא|הבאה|הראה|תראה|תביא|הצג|switch|change|next|show|bring|turn into|be)/i.test(low);
    const named = MAIN_CHARACTERS.find(c => c.words.test(low));

    // Named character with a switch verb or "character" context → swap it
    // with the pokeball + red-laser animation.
    if (named && (hasSwitchVerb || mentionsChar)) {
      swapMainCharacterAnimated(named.id);
      return `הדמות הראשית מתחלפת ל${named.label} ⚡`;
    }

    // Generic next/switch ("החלף דמות" / "הדמות הבאה") → cycle to next.
    if (hasSwitchVerb && mentionsChar) {
      const cur = localStorage.getItem(MAIN_CHAR_KEY) || 'pikachu';
      const idx = MAIN_CHARACTERS.findIndex(c => c.id === cur);
      const next = MAIN_CHARACTERS[(idx + 1) % MAIN_CHARACTERS.length];
      swapMainCharacterAnimated(next.id);
      return `הדמות הראשית מתחלפת ל${next.label} ⚡`;
    }

    return null;
  }

  let arFxCtx: CanvasRenderingContext2D | null = null;

  interface FxParticle {
    x: number; y: number; vx: number; vy: number;
    life: number; maxLife: number; size: number;
    color: string; alpha: number;
  }
  let arFxParticles: FxParticle[] = [];
  let arLaserTrail: { x: number; y: number; t: number }[] = [];

  function spawnFxParticles(hx: number, hy: number, w: number, h: number) {
    const px = hx * w, py = hy * h;
    const count = arCurrentFx === 'laser' ? 1 : 4;
    for (let i = 0; i < count; i++) {
      const spread = 20 + Math.random() * 15;
      switch (arCurrentFx) {
        case 'fire': {
          arFxParticles.push({
            x: px + (Math.random() - 0.5) * spread, y: py + (Math.random() - 0.5) * spread,
            vx: (Math.random() - 0.5) * 3, vy: -2 - Math.random() * 5,
            life: 1, maxLife: 0.6 + Math.random() * 0.5, size: 6 + Math.random() * 10,
            color: ['#ff4400', '#ff7700', '#ffaa00', '#ffdd44', '#ff2200'][Math.floor(Math.random() * 5)],
            alpha: 0.9,
          });
          break;
        }
        case 'water': {
          arFxParticles.push({
            x: px + (Math.random() - 0.5) * spread, y: py,
            vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 4,
            life: 1, maxLife: 0.8 + Math.random() * 0.4, size: 4 + Math.random() * 6,
            color: ['#00aaff', '#44ccff', '#0088dd', '#66ddff', '#0066cc'][Math.floor(Math.random() * 5)],
            alpha: 0.7,
          });
          break;
        }
        case 'laser': {
          arLaserTrail.push({ x: px, y: py, t: Date.now() });
          if (arLaserTrail.length > 30) arLaserTrail.shift();
          break;
        }
        case 'sparkle': {
          arFxParticles.push({
            x: px + (Math.random() - 0.5) * spread * 2, y: py + (Math.random() - 0.5) * spread * 2,
            vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
            life: 1, maxLife: 0.5 + Math.random() * 0.5, size: 2 + Math.random() * 5,
            color: ['#fff', '#ffd700', '#ff69b4', '#00ffff', '#ff4444', '#44ff44'][Math.floor(Math.random() * 6)],
            alpha: 1,
          });
          break;
        }
        case 'rainbow': {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 3;
          const hue = (Date.now() / 10 + i * 60) % 360;
          arFxParticles.push({
            x: px + (Math.random() - 0.5) * spread, y: py + (Math.random() - 0.5) * spread,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            life: 1, maxLife: 0.7 + Math.random() * 0.5, size: 5 + Math.random() * 7,
            color: `hsl(${hue},100%,60%)`,
            alpha: 0.85,
          });
          break;
        }
      }
    }
  }

  function drawFxParticles() {
    if (!arFxCtx) return;
    const cvs = arFxCtx.canvas;
    const ctx = arFxCtx;
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    if (arCurrentFx === 'laser' && arLaserTrail.length > 1) {
      const now = Date.now();
      arLaserTrail = arLaserTrail.filter(p => now - p.t < 500);
      if (arLaserTrail.length > 1) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let w = 3; w >= 0; w--) {
          ctx.beginPath();
          const alpha = w === 3 ? 0.1 : w === 2 ? 0.2 : w === 1 ? 0.5 : 1;
          const width = w === 3 ? 20 : w === 2 ? 12 : w === 1 ? 6 : 2;
          ctx.strokeStyle = w === 0 ? '#fff' : `rgba(255,40,40,${alpha})`;
          ctx.lineWidth = width;
          ctx.shadowColor = '#ff0000';
          ctx.shadowBlur = w === 3 ? 30 : 0;
          ctx.moveTo(arLaserTrail[0].x, arLaserTrail[0].y);
          for (let i = 1; i < arLaserTrail.length; i++) {
            ctx.lineTo(arLaserTrail[i].x, arLaserTrail[i].y);
          }
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    const dt = 1 / 60;
    for (let i = arFxParticles.length - 1; i >= 0; i--) {
      const p = arFxParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt / p.maxLife;

      if (arCurrentFx === 'fire') p.vy -= 0.15;
      if (arCurrentFx === 'water') p.vy += 0.1;

      if (p.life <= 0) {
        arFxParticles.splice(i, 1);
        continue;
      }

      const a = p.life * p.alpha;
      ctx.save();
      ctx.globalAlpha = a;

      if (arCurrentFx === 'sparkle') {
        ctx.translate(p.x, p.y);
        ctx.rotate(Date.now() / 200 + i);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        for (let s = 0; s < 4; s++) {
          ctx.fillRect(-p.size * 0.15, -p.size, p.size * 0.3, p.size * 2);
          ctx.rotate(Math.PI / 4);
        }
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (arCurrentFx === 'fire' ? (0.5 + p.life * 0.5) : 1), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        if (arCurrentFx === 'fire') {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 15;
        }
        ctx.fill();
      }
      ctx.restore();
    }

    if (arHandPos.x >= 0 && arCurrentFx !== 'none') {
      const cvs2 = arFxCtx.canvas;
      spawnFxParticles(arHandPos.x, arHandPos.y, cvs2.width, cvs2.height);
    }
  }

  // ── Beam + character canvas draw ─────────────────────────────
  function drawArCharLayer() {
    if (!arCharCtx) return;
    const cvs = arCharCtx.canvas;
    const ctx = arCharCtx;
    const w = cvs.width, h = cvs.height;
    ctx.clearRect(0, 0, w, h);

    // Laser beam flying from hand toward orb center
    if (arBeamFiring) {
      arBeamProgress = Math.min(1, arBeamProgress + 0.045);
      const bx1 = arBeamOrigin.x * w;
      const by1 = arBeamOrigin.y * h;
      const bx2 = 0.5 * w;
      const by2 = 0.5 * h;
      const endX = bx1 + (bx2 - bx1) * arBeamProgress;
      const endY = by1 + (by2 - by1) * arBeamProgress;
      ctx.save();
      ctx.lineCap = 'round';
      // Outer glow
      for (let layer = 3; layer >= 0; layer--) {
        const widths = [24, 14, 6, 2];
        const alphas = [0.06, 0.15, 0.45, 1];
        const colors = ['rgba(255,40,40,1)', 'rgba(255,80,40,1)', 'rgba(255,140,60,1)', '#fff'];
        ctx.beginPath();
        ctx.moveTo(bx1, by1);
        ctx.lineTo(endX, endY);
        ctx.lineWidth = widths[layer];
        ctx.strokeStyle = colors[layer];
        ctx.globalAlpha = alphas[layer];
        ctx.shadowColor = '#ff2200';
        ctx.shadowBlur = layer === 0 ? 40 : 0;
        ctx.stroke();
      }
      // Tip flare
      ctx.globalAlpha = 0.9;
      const grad = ctx.createRadialGradient(endX, endY, 0, endX, endY, 30);
      grad.addColorStop(0, 'rgba(255,200,100,0.9)');
      grad.addColorStop(0.5, 'rgba(255,80,20,0.4)');
      grad.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(endX, endY, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // When beam reaches orb center — trigger dispel
      if (arBeamProgress >= 1 && !arOrbDispelled) {
        arBeamFiring = false;
        arOrbDispelled = true;
        // Disintegration burst at center
        for (let i = 0; i < 60; i++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = 3 + Math.random() * 10;
          arFxParticles.push({
            x: bx2, y: by2,
            vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
            life: 1, maxLife: 0.4 + Math.random() * 0.6,
            size: 3 + Math.random() * 12,
            color: ['#ff4400','#ff7700','#ffaa00','#daa520','#fff','#ff2288'][Math.floor(Math.random()*6)],
            alpha: 1,
          });
        }
        // Hide stage
        const stageEl = document.getElementById('stage');
        if (stageEl) stageEl.classList.add('stage-dispelled');
      }
    }

    // Palm hold indicator — circular charge-up ring around hand
    if (arHandPos.x >= 0 && !arOrbDispelled && !arBeamFiring && arPalmHoldTime > 0.1) {
      const progress = Math.min(1, arPalmHoldTime / 0.7);
      const hx = arHandPos.x * w, hy = arHandPos.y * h;
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = `hsl(${10 + progress * 30},100%,${50 + progress * 20}%)`;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ff4400';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(hx, hy, 48, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // ── Pokeball animation ────────────────────────────────────
    const pbCX = w * 0.5, pbCY = h * 0.45;
    const pbR = Math.min(w, h) * 0.08;

    if (arPokeballPhase === 'fly') {
      arPokeballT++;
      const t = Math.min(1, arPokeballT / 28);
      const ease = 1 - Math.pow(1 - t, 3);
      const bx = arPokeballFrom.x * w + (pbCX - arPokeballFrom.x * w) * ease;
      const by = arPokeballFrom.y * h + (pbCY - arPokeballFrom.y * h) * ease;
      const r = pbR * (0.5 + 0.5 * ease);
      drawPokeballAt(ctx, bx, by, r);
      if (t >= 1) { arPokeballPhase = 'wobble'; arPokeballT = 0; }
    } else if (arPokeballPhase === 'wobble') {
      arPokeballT++;
      const wobble = Math.sin(arPokeballT * 0.55) * 0.36 * Math.max(0, 1 - arPokeballT / 25);
      drawPokeballAt(ctx, pbCX, pbCY, pbR, wobble);
      if (arPokeballT >= 28) { arPokeballPhase = 'open'; arPokeballT = 0; }
    } else if (arPokeballPhase === 'open') {
      arPokeballT++;
      const t = arPokeballT / 15;
      // Two halves of pokeball flying apart
      const halfOff = pbR * 2 * t;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t * 1.2);
      // Top half flies up
      ctx.save();
      ctx.beginPath();
      ctx.arc(pbCX, pbCY - halfOff, pbR, Math.PI, 0);
      ctx.fillStyle = '#e63835'; ctx.fill();
      ctx.strokeStyle = '#111'; ctx.lineWidth = pbR * 0.06; ctx.stroke();
      ctx.restore();
      // Bottom half flies down
      ctx.save();
      ctx.beginPath();
      ctx.arc(pbCX, pbCY + halfOff, pbR, 0, Math.PI);
      ctx.fillStyle = '#fff'; ctx.fill();
      ctx.strokeStyle = '#111'; ctx.lineWidth = pbR * 0.06; ctx.stroke();
      ctx.restore();
      ctx.restore();
      // White expansion flash
      const flashR = pbR * 3 * t;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 0.8 - t);
      const grad = ctx.createRadialGradient(pbCX, pbCY, 0, pbCX, pbCY, flashR);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.4, 'rgba(255,230,120,0.7)');
      grad.addColorStop(1, 'rgba(255,180,40,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(pbCX, pbCY, flashR, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      if (arPokeballT >= 15) { arPokeballPhase = 'done'; arPokeballT = 0; }
    }

    // ── Character display after pokeball opens ────────────────
    if (arOrbDispelled && arCharIdx >= 0 && arCharacters[arCharIdx] && arPokeballPhase === 'done') {
      const ch = arCharacters[arCharIdx];
      arCharAnim = Math.min(1, arCharAnim + 0.04);
      const scale = 0.6 + arCharAnim * 0.4;
      const alpha = arCharAnim;
      const cx = w * 0.5;
      const cy = h * 0.45;
      const fromX = arCharFromDir.x * w * (1 - arCharAnim) * 0.3;
      const fromY = arCharFromDir.y * h * (1 - arCharAnim) * 0.3;
      const size = Math.min(w, h) * 0.52;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx + fromX, cy + fromY);
      ctx.scale(scale, scale);
      // Type glow
      if (ch.color) {
        ctx.shadowColor = ch.color;
        ctx.shadowBlur = 60;
      }
      if (ch.drawFn) {
        ch.drawFn(ctx, size * 0.5);
      } else if (ch.img) {
        ctx.drawImage(ch.img, -size / 2, -size / 2, size, size);
      } else {
        ctx.font = `${Math.round(size * 0.35)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = ch.color || '#daa520';
        ctx.fillText(ch.name[0] || '?', 0, 0);
      }
      ctx.restore();
      // Name label
      if (ch.name && arCharAnim > 0.5) {
        ctx.save();
        ctx.globalAlpha = (arCharAnim - 0.5) * 2;
        ctx.font = `bold ${Math.round(w * 0.028)}px "Space Grotesk", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = ch.color || '#daa520';
        ctx.shadowColor = ch.color || '#daa520';
        ctx.shadowBlur = 18;
        ctx.fillText(ch.name, w * 0.5, h * 0.78);
        ctx.restore();
      }
    }
  }

  function addArObject(type: ArObj['type']) {
    const colors: Record<string, string[]> = {
      ball: ['#daa520', '#f5e6c8', '#e8a040', '#c8956a', '#f0d090'],
      cube: ['#daa520', '#c8956a', '#d4a84d', '#e8a040', '#f0d090'],
      star: ['#ffd700', '#fff', '#ff69b4', '#44ff44', '#00ffff'],
      diamond: ['#00ffff', '#ff69b4', '#ffd700', '#a855f7', '#44ff44'],
      coin: ['#ffd700', '#ffaa00', '#daa520'],
      bomb: ['#333', '#555', '#222'],
      portal: ['#a855f7', '#7c3aed', '#6d28d9'],
    };
    const pts: Record<string, number> = { ball: 0, cube: 0, star: 0, diamond: 0, coin: 10, bomb: -20, portal: 0 };
    const c = colors[type] || colors.ball;
    arObjects.push({
      x: 0.3 + Math.random() * 0.4,
      y: type === 'coin' ? -0.05 : 0.15 + Math.random() * 0.3,
      vx: (Math.random() - 0.5) * 0.003,
      vy: type === 'coin' ? 0.002 : 0,
      r: type === 'coin' ? 0.025 : type === 'bomb' ? 0.03 : type === 'star' || type === 'diamond' ? 0.035 : 0.04,
      type,
      color: c[Math.floor(Math.random() * c.length)],
      rotation: 0,
      rotSpd: (Math.random() - 0.5) * 0.05,
      grabbed: false,
      hp: type === 'bomb' ? 1 : 3,
      age: 0,
      points: pts[type] || 0,
      glow: 0,
      trail: [],
    });
  }

  function spawnGameObject() {
    if (arGameMode === 'catch') {
      const r = Math.random();
      if (r < 0.6) addArObject('coin');
      else if (r < 0.85) addArObject('star');
      else addArObject('bomb');
    } else if (arGameMode === 'target') {
      const r = Math.random();
      if (r < 0.5) addArObject('diamond');
      else if (r < 0.8) addArObject('star');
      else addArObject('coin');
    }
  }

  function addFloatingText(x: number, y: number, text: string, color: string) {
    arFloatingTexts.push({ x, y, text, life: 1, color });
  }

  function triggerExplosion(cx: number, cy: number, w: number, h: number) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      arFxParticles.push({
        x: cx * w, y: cy * h,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 1, maxLife: 0.4 + Math.random() * 0.3,
        size: 4 + Math.random() * 8,
        color: ['#ff4400', '#ff7700', '#ffaa00', '#ff2200'][Math.floor(Math.random() * 4)],
        alpha: 1,
      });
    }
  }

  function drawArObjects() {
    if (!arObjCtx) return;
    const cvs = arObjCtx.canvas;
    arObjCtx.clearRect(0, 0, cvs.width, cvs.height);
    const w = cvs.width, h = cvs.height;
    const dt = 1 / 60;

    // Game timer & spawning
    if (arGameActive) {
      arGameTimer -= dt;
      arGameSpawnTimer -= dt;
      if (arGameSpawnTimer <= 0) {
        spawnGameObject();
        arGameSpawnTimer = arGameMode === 'catch' ? 0.8 + Math.random() * 0.6 : 1.5 + Math.random();
      }
      if (arGameTimer <= 0) {
        arGameActive = false;
        addFloatingText(0.5, 0.4, `GAME OVER! Score: ${arScore}`, '#ffd700');
      }
      arComboTimer -= dt;
      if (arComboTimer <= 0) arCombo = 0;
    }

    // Gravity zones
    for (const gz of arGravityZones) {
      const ctx = arObjCtx;
      ctx.save();
      const grad = ctx.createRadialGradient(gz.x * w, gz.y * h, 0, gz.x * w, gz.y * h, gz.r * Math.min(w, h));
      grad.addColorStop(0, `hsla(${gz.hue}, 100%, 60%, 0.15)`);
      grad.addColorStop(0.7, `hsla(${gz.hue}, 100%, 60%, 0.05)`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gz.x * w, gz.y * h, gz.r * Math.min(w, h), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Trampoline
    if (arTrampoline) {
      const ctx = arObjCtx;
      const tx = arTrampoline.x * w, ty = arTrampoline.y * h, tw = arTrampoline.w * w;
      ctx.save();
      const tg = ctx.createLinearGradient(tx - tw / 2, ty, tx + tw / 2, ty);
      tg.addColorStop(0, 'rgba(218,165,32,0.1)');
      tg.addColorStop(0.5, 'rgba(218,165,32,0.4)');
      tg.addColorStop(1, 'rgba(218,165,32,0.1)');
      ctx.fillStyle = tg;
      ctx.fillRect(tx - tw / 2, ty - 3, tw, 6);
      ctx.shadowColor = '#daa520';
      ctx.shadowBlur = arTrampoline.active ? 20 : 8;
      ctx.strokeStyle = '#daa520';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx - tw / 2, ty);
      ctx.quadraticCurveTo(tx, arTrampoline.active ? ty - 12 : ty + 4, tx + tw / 2, ty);
      ctx.stroke();
      ctx.restore();
      arTrampoline.active = false;
    }

    for (let oi = arObjects.length - 1; oi >= 0; oi--) {
      const obj = arObjects[oi];
      obj.age += dt;
      obj.glow = Math.sin(obj.age * 4) * 0.3 + 0.7;

      if (!obj.grabbed) {
        obj.vy += 0.00015;
        obj.x += obj.vx;
        obj.y += obj.vy;
        obj.rotation += obj.rotSpd;

        // Gravity zones
        for (const gz of arGravityZones) {
          const dx = gz.x - obj.x, dy = gz.y - obj.y;
          const dist = Math.hypot(dx, dy);
          if (dist < gz.r && dist > 0.01) {
            const f = gz.strength * 0.0003 / dist;
            obj.vx += dx * f;
            obj.vy += dy * f;
          }
        }

        // Trampoline bounce
        if (arTrampoline) {
          const ty = arTrampoline.y, tx = arTrampoline.x, tw = arTrampoline.w / 2;
          if (obj.y + obj.r > ty - 0.01 && obj.y + obj.r < ty + 0.02 && obj.x > tx - tw && obj.x < tx + tw && obj.vy > 0) {
            obj.vy = -Math.abs(obj.vy) * 1.8 - 0.008;
            arTrampoline.active = true;
          }
        }

        if (obj.x - obj.r < 0) { obj.x = obj.r; obj.vx = Math.abs(obj.vx) * 0.7; }
        if (obj.x + obj.r > 1) { obj.x = 1 - obj.r; obj.vx = -Math.abs(obj.vx) * 0.7; }
        if (obj.y + obj.r > 0.95) { obj.y = 0.95 - obj.r; obj.vy = -Math.abs(obj.vy) * 0.6; obj.vx *= 0.95; }
        if (obj.y - obj.r < 0) { obj.y = obj.r; obj.vy = Math.abs(obj.vy) * 0.7; }

        // Remove coins that fell off screen in game mode
        if (arGameActive && obj.type === 'coin' && obj.y > 0.98) {
          arObjects.splice(oi, 1); continue;
        }
      }

      // Trail for fast-moving or special objects
      if (obj.type === 'star' || obj.type === 'coin' || obj.type === 'diamond') {
        obj.trail.push({ x: obj.x, y: obj.y, t: Date.now() });
        if (obj.trail.length > 8) obj.trail.shift();
      }

      // Hand collision — primary hand
      const hands = [arHandPos, arHand2Pos];
      for (const hand of hands) {
        if (hand.x < 0) continue;
        const dx = obj.x - hand.x;
        const dy = obj.y - hand.y;
        const dist = Math.hypot(dx, dy);
        if (dist < obj.r + 0.04) {
          // Game mode: collecting
          if (arGameActive && (obj.type === 'coin' || obj.type === 'star' || obj.type === 'diamond')) {
            const pts = obj.type === 'coin' ? 10 : obj.type === 'star' ? 25 : 50;
            arCombo++;
            arComboTimer = 2;
            const bonus = Math.min(arCombo, 10);
            arScore += pts * bonus;
            addFloatingText(obj.x, obj.y, `+${pts * bonus}`, obj.type === 'coin' ? '#ffd700' : '#00ffff');
            if (arCombo >= 5) addFloatingText(obj.x, obj.y - 0.05, `${arCombo}x COMBO!`, '#ff69b4');
            triggerExplosion(obj.x, obj.y, w, h);
            arObjects.splice(oi, 1); continue;
          }
          if (arGameActive && obj.type === 'bomb') {
            arScore = Math.max(0, arScore - 20);
            arCombo = 0;
            addFloatingText(obj.x, obj.y, '-20', '#ff4444');
            triggerExplosion(obj.x, obj.y, w, h);
            arObjects.splice(oi, 1); continue;
          }

          if (hand === arHandPos && hand.pinching && !arGrabbed) {
            arGrabbed = obj;
            obj.grabbed = true;
          }
          if (!obj.grabbed && dist > 0) {
            const force = 0.008 / Math.max(dist, 0.01);
            obj.vx += dx * force;
            obj.vy += dy * force;
            obj.rotSpd += (Math.random() - 0.5) * 0.03;
          }
        }
      }

      if (obj.grabbed && arGrabbed === obj) {
        if (!arHandPos.pinching) {
          obj.grabbed = false;
          const throwVx = (arHandPos.x - obj.x) * 0.5;
          const throwVy = (arHandPos.y - obj.y) * 0.5;
          arGrabbed = null;
          obj.vx = throwVx || (Math.random() - 0.5) * 0.005;
          obj.vy = throwVy || -0.002;
        } else {
          obj.x += (arHandPos.x - obj.x) * 0.3;
          obj.y += (arHandPos.y - obj.y) * 0.3;
          obj.vx = 0; obj.vy = 0;
        }
      }

      // Object-to-object collision
      for (const other of arObjects) {
        if (other === obj) continue;
        const ddx = obj.x - other.x, ddy = obj.y - other.y;
        const dd = Math.hypot(ddx, ddy);
        const minD = obj.r + other.r;
        if (dd < minD && dd > 0) {
          // Portal teleport
          if ((obj.type === 'portal' || other.type === 'portal') && obj.type !== other.type) {
            const teleported = obj.type === 'portal' ? other : obj;
            const portal = obj.type === 'portal' ? obj : other;
            teleported.x = Math.random() * 0.6 + 0.2;
            teleported.y = Math.random() * 0.4 + 0.1;
            teleported.vx *= 0.5;
            teleported.vy *= 0.5;
            triggerExplosion(portal.x, portal.y, w, h);
            continue;
          }
          const nx = ddx / dd, ny = ddy / dd;
          const overlap = (minD - dd) * 0.5;
          obj.x += nx * overlap; obj.y += ny * overlap;
          other.x -= nx * overlap; other.y -= ny * overlap;
          const rel = (obj.vx - other.vx) * nx + (obj.vy - other.vy) * ny;
          if (rel < 0) {
            obj.vx -= rel * nx * 0.5; obj.vy -= rel * ny * 0.5;
            other.vx += rel * nx * 0.5; other.vy += rel * ny * 0.5;
          }
        }
      }

      // Draw trail
      if (obj.trail.length > 1) {
        const ctx = arObjCtx;
        ctx.save();
        for (let ti = 0; ti < obj.trail.length - 1; ti++) {
          const t = obj.trail[ti];
          const alpha = (ti / obj.trail.length) * 0.3;
          ctx.beginPath();
          ctx.arc(t.x * w, t.y * h, obj.r * Math.min(w, h) * 0.3 * (ti / obj.trail.length), 0, Math.PI * 2);
          ctx.fillStyle = obj.color.replace(')', `,${alpha})`).replace('rgb', 'rgba');
          if (obj.color.startsWith('#')) ctx.fillStyle = `rgba(218,165,32,${alpha})`;
          ctx.fill();
        }
        ctx.restore();
      }

      const px = obj.x * w, py = obj.y * h, pr = obj.r * Math.min(w, h);
      const ctx = arObjCtx;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(obj.rotation);

      ctx.shadowColor = obj.color;
      ctx.shadowBlur = obj.grabbed ? 25 : 12 * obj.glow;

      switch (obj.type) {
        case 'ball': {
          const grad = ctx.createRadialGradient(-pr * 0.3, -pr * 0.3, pr * 0.1, 0, 0, pr);
          grad.addColorStop(0, '#fff');
          grad.addColorStop(0.3, obj.color);
          grad.addColorStop(1, 'rgba(0,0,0,0.3)');
          ctx.beginPath(); ctx.arc(0, 0, pr, 0, Math.PI * 2);
          ctx.fillStyle = grad; ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();
          break;
        }
        case 'cube': {
          ctx.fillStyle = obj.color;
          ctx.globalAlpha = 0.85;
          ctx.fillRect(-pr, -pr, pr * 2, pr * 2);
          ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2;
          ctx.strokeRect(-pr, -pr, pr * 2, pr * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          ctx.fillRect(-pr, -pr, pr * 2, pr);
          ctx.globalAlpha = 1;
          break;
        }
        case 'star': {
          ctx.fillStyle = obj.color;
          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const a = (i * Math.PI * 2) / 10 - Math.PI / 2;
            const sr = i % 2 === 0 ? pr : pr * 0.45;
            ctx.lineTo(Math.cos(a) * sr, Math.sin(a) * sr);
          }
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5; ctx.stroke();
          break;
        }
        case 'diamond': {
          ctx.fillStyle = obj.color;
          ctx.beginPath();
          ctx.moveTo(0, -pr * 1.2);
          ctx.lineTo(pr * 0.8, 0);
          ctx.lineTo(0, pr * 1.2);
          ctx.lineTo(-pr * 0.8, 0);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-pr * 0.8, 0); ctx.lineTo(pr * 0.8, 0);
          ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke();
          break;
        }
        case 'coin': {
          const coinPulse = Math.sin(obj.age * 6) * 0.2 + 0.8;
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 20 * coinPulse;
          const cg = ctx.createRadialGradient(-pr * 0.2, -pr * 0.2, 0, 0, 0, pr);
          cg.addColorStop(0, '#fff8dc');
          cg.addColorStop(0.3, '#ffd700');
          cg.addColorStop(1, '#b8860b');
          ctx.beginPath(); ctx.arc(0, 0, pr, 0, Math.PI * 2);
          ctx.fillStyle = cg; ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.stroke();
          ctx.fillStyle = '#b8860b'; ctx.font = `bold ${pr}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('₪', 0, 1);
          break;
        }
        case 'bomb': {
          ctx.shadowColor = '#ff4400';
          ctx.shadowBlur = 10 + Math.sin(obj.age * 8) * 8;
          const bg = ctx.createRadialGradient(-pr * 0.2, -pr * 0.2, 0, 0, 0, pr);
          bg.addColorStop(0, '#666');
          bg.addColorStop(0.5, '#333');
          bg.addColorStop(1, '#111');
          ctx.beginPath(); ctx.arc(0, 0, pr, 0, Math.PI * 2);
          ctx.fillStyle = bg; ctx.fill();
          ctx.strokeStyle = '#ff4400'; ctx.lineWidth = 2; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, -pr); ctx.lineTo(pr * 0.15, -pr * 1.4);
          ctx.strokeStyle = '#aaa'; ctx.lineWidth = 3; ctx.stroke();
          if (Math.sin(obj.age * 12) > 0) {
            ctx.beginPath(); ctx.arc(pr * 0.15, -pr * 1.5, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ff4400'; ctx.fill();
          }
          break;
        }
        case 'portal': {
          const portalAngle = obj.age * 3;
          for (let ring = 3; ring >= 0; ring--) {
            const rr = pr * (0.4 + ring * 0.25);
            ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI * 2);
            const hue = (portalAngle * 30 + ring * 40) % 360;
            ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.3 + ring * 0.15})`;
            ctx.lineWidth = 3 - ring * 0.5;
            ctx.setLineDash([4 + ring * 2, 4 + ring * 2]);
            ctx.lineDashOffset = portalAngle * 20 * (ring % 2 === 0 ? 1 : -1);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 25;
          ctx.beginPath(); ctx.arc(0, 0, pr * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(168,85,247,0.6)'; ctx.fill();
          break;
        }
      }
      ctx.restore();
    }

    // Floating texts
    const ftCtx = arObjCtx;
    for (let i = arFloatingTexts.length - 1; i >= 0; i--) {
      const ft = arFloatingTexts[i];
      ft.life -= dt * 1.5;
      ft.y -= 0.001;
      if (ft.life <= 0) { arFloatingTexts.splice(i, 1); continue; }
      ftCtx.save();
      ftCtx.globalAlpha = ft.life;
      ftCtx.font = `bold ${Math.round(18 + ft.life * 14)}px "Space Grotesk", sans-serif`;
      ftCtx.textAlign = 'center';
      ftCtx.fillStyle = ft.color;
      ftCtx.shadowColor = ft.color;
      ftCtx.shadowBlur = 12;
      ftCtx.fillText(ft.text, ft.x * w, ft.y * h);
      ftCtx.restore();
    }

    // Game HUD
    if (arGameActive || arScore > 0) {
      ftCtx.save();
      ftCtx.font = 'bold 28px "Space Grotesk", sans-serif';
      ftCtx.fillStyle = '#ffd700';
      ftCtx.shadowColor = '#ffd700';
      ftCtx.shadowBlur = 12;
      ftCtx.textAlign = 'left';
      ftCtx.fillText(`Score: ${arScore}`, 20, 40);
      if (arCombo > 1) {
        ftCtx.font = 'bold 18px "Space Grotesk", sans-serif';
        ftCtx.fillStyle = '#ff69b4';
        ftCtx.fillText(`${arCombo}x Combo`, 20, 65);
      }
      if (arGameActive) {
        ftCtx.textAlign = 'right';
        ftCtx.font = 'bold 24px "Space Grotesk", sans-serif';
        ftCtx.fillStyle = arGameTimer < 5 ? '#ff4444' : '#fff';
        ftCtx.fillText(`${Math.ceil(arGameTimer)}s`, w - 20, 40);
      }
      ftCtx.restore();
    }

    // Gesture indicator
    if (arGesture !== 'none') {
      const gestureIcons: Record<string, string> = { peace: '✌️', fist: '✊', palm: '🖐️', thumbsUp: '👍', pointUp: '☝️' };
      ftCtx.save();
      ftCtx.font = '32px sans-serif';
      ftCtx.textAlign = 'right';
      ftCtx.fillText(gestureIcons[arGesture] || '', w - 20, h - 20);
      ftCtx.restore();
    }

    drawArCharSwitchZone(w, h, dt);

    drawFxParticles();
    drawArCharLayer();
    arAnimFrame = requestAnimationFrame(drawArObjects);
  }

  // Dashed "place your hand here" zone — hold your hand inside to switch the
  // main character. Far more reliable than gesture classification.
  function drawArCharSwitchZone(w: number, h: number, dt: number) {
    if (!arObjCtx) return;
    const ctx = arObjCtx;
    const zx = AR_ZONE.x * w, zy = AR_ZONE.y * h, zr = AR_ZONE.r * Math.min(w, h);
    arZoneCooldown = Math.max(0, arZoneCooldown - dt);

    const hand = arHandPos.x >= 0;
    const dist = hand ? Math.hypot(arHandPos.x * w - zx, arHandPos.y * h - zy) : Infinity;
    const inside = hand && dist < zr && arZoneCooldown <= 0;
    if (inside) arZoneDwell = Math.min(1, arZoneDwell + dt / 0.8); // 0.8s to fill
    else arZoneDwell = Math.max(0, arZoneDwell - dt * 1.5);

    ctx.save();
    // dashed ring
    ctx.setLineDash([12, 9]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = inside ? 'rgba(255,210,90,0.95)' : 'rgba(218,165,32,0.6)';
    ctx.shadowColor = '#daa520'; ctx.shadowBlur = inside ? 18 : 8;
    ctx.beginPath(); ctx.arc(zx, zy, zr, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    // dwell progress arc
    if (arZoneDwell > 0.01) {
      ctx.lineWidth = 6; ctx.strokeStyle = '#ffcc33'; ctx.shadowBlur = 22;
      ctx.beginPath(); ctx.arc(zx, zy, zr, -Math.PI / 2, -Math.PI / 2 + arZoneDwell * Math.PI * 2); ctx.stroke();
    }
    // label
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(zr * 0.5)}px sans-serif`;
    ctx.fillText('🖐️', zx, zy - zr * 0.1);
    ctx.fillStyle = inside ? '#ffe08a' : 'rgba(245,230,200,0.9)';
    ctx.font = `bold ${Math.round(zr * 0.2)}px "Space Grotesk", sans-serif`;
    ctx.fillText('החלף דמות', zx, zy + zr * 0.45);
    ctx.restore();

    if (arZoneDwell >= 1 && arZoneCooldown <= 0) {
      arZoneDwell = 0; arZoneCooldown = 4;
      const cur = localStorage.getItem(MAIN_CHAR_KEY) || 'pikachu';
      const idx = MAIN_CHARACTERS.findIndex(c => c.id === cur);
      const next = MAIN_CHARACTERS[(idx + 1) % MAIN_CHARACTERS.length];
      addFloatingText(AR_ZONE.x, AR_ZONE.y - 0.14, '⚡ ' + next.label, '#ffcc33');
      const vp = document.getElementById('arViewport');
      if (vp) throwPokeball(vp, { onOpen: () => setMainCharacter(next.id) });
      else setMainCharacter(next.id);
    }
  }

  function openArCamera() {
    $('arOverlay').classList.add('show');
    const video = $<HTMLVideoElement>('arVideo');
    const canvas = $<HTMLCanvasElement>('arCanvas');
    const objCanvas = $<HTMLCanvasElement>('arObjCanvas');
    const fxCanvas = $<HTMLCanvasElement>('arFxCanvas');
    const ctx = canvas.getContext('2d')!;
    arObjCtx = objCanvas.getContext('2d')!;
    arFxCtx = fxCanvas.getContext('2d')!;
    const charCanvas = $<HTMLCanvasElement>('arCharCanvas');
    arCharCtx = charCanvas.getContext('2d')!;
    const statusEl = $('arStatus');
    const handIndicator = $('arHandIndicator');
    const buttonsEl = $('arButtons');

    const arBtns = [
      { label: 'חיפוש רכב', icon: '🔍', action: () => { const q = prompt('מספר רישוי:'); if (q) hgSearchLicense(q); } },
      { label: 'הכנסות', icon: '💰', action: () => hgShowEarnings('', new Date().toISOString().slice(0, 7)) },
      { label: 'החלף דמות', icon: '⚡', action: () => {
        if (!arOrbDispelled) {
          // First tap: dispel the main orb and summon the first Pokemon.
          arOrbDispelled = true;
          document.getElementById('stage')?.classList.add('stage-dispelled');
          if (arCharacters.length > 0) {
            arCharIdx = 0;
            arCharAnim = 0;
            arPokeballPhase = 'fly'; arPokeballT = 0;
            arPokeballFrom = { x: 0.5, y: 0.85 };
            arThrowCooldown = 3.0;
          }
        } else if (arCharacters.length > 0 && arPokeballPhase !== 'fly' && arPokeballPhase !== 'wobble' && arPokeballPhase !== 'open') {
          // Subsequent taps: cycle to the next Pokemon.
          arCharIdx = (arCharIdx + 1) % arCharacters.length;
          arCharAnim = 0;
          arPokeballPhase = 'fly'; arPokeballT = 0;
          arPokeballFrom = { x: 0.5, y: 0.85 };
          arThrowCooldown = 3.0;
        }
      }},
      { label: 'צלם', icon: '📸', action: () => captureArPhoto() },
      { label: 'סגור', icon: '✕', action: closeArCamera },
    ];
    buttonsEl.innerHTML = '';
    arBtns.forEach((b, i) => {
      const btn = document.createElement('button');
      btn.className = 'ar-btn';
      btn.dataset.idx = String(i);
      btn.innerHTML = `<span class="ar-btn-icon">${b.icon}</span><span class="ar-btn-label">${b.label}</span>`;
      btn.onclick = b.action;
      buttonsEl.appendChild(btn);
    });

    statusEl.textContent = 'מבקש הרשאה למצלמה…';
    statusEl.style.opacity = '1';

    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    // On phones, ask for a lighter stream WITHOUT hard min-resolution
    // constraints (many front cameras reject 1280×720 minimums and the
    // whole request fails). We progressively fall back to the most basic
    // request so the permission prompt always succeeds.
    const constraintLevels: MediaStreamConstraints[] = isMobile
      ? [
          { video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } },
          { video: { facingMode: 'user' } },
          { video: true },
        ]
      : [
          { video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } } },
          { video: { facingMode: 'user' } },
          { video: true },
        ];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      statusEl.textContent = 'הדפדפן לא תומך במצלמה';
      return;
    }

    const tryGetStream = async (): Promise<MediaStream | null> => {
      for (const c of constraintLevels) {
        try { return await navigator.mediaDevices.getUserMedia(c); }
        catch (e: any) {
          // Permission denied is final — stop trying other resolutions.
          if (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) throw e;
        }
      }
      return null;
    };

    tryGetStream().then(stream => {
      if (!stream) { statusEl.textContent = 'לא נמצאה מצלמה זמינה'; return; }
      arStream = stream;
      video.srcObject = stream;
      // iOS Safari needs an explicit play() after metadata loads.
      const onReady = () => {
        const vw = video.videoWidth || 1280;
        const vh = video.videoHeight || 720;
        canvas.width = vw; canvas.height = vh;
        objCanvas.width = vw; objCanvas.height = vh;
        fxCanvas.width = vw; fxCanvas.height = vh;
        charCanvas.width = vw; charCanvas.height = vh;
        statusEl.textContent = 'מצלמה פעילה ✓';
        setTimeout(() => { statusEl.style.opacity = '0'; }, 2000);
        drawArObjects();
        startHandTracking(video, canvas, ctx, handIndicator, arBtns);
      };
      video.onloadedmetadata = () => { video.play().catch(() => {}); onReady(); };
    }).catch((e: any) => {
      if (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) {
        statusEl.textContent = 'נדחתה הרשאת מצלמה — אשר גישה בהגדרות הדפדפן';
      } else {
        statusEl.textContent = 'שגיאה: לא ניתן לגשת למצלמה';
      }
    });
  }

  function closeArCamera() {
    $('arOverlay').classList.remove('show');
    if (arStream) { arStream.getTracks().forEach(t => t.stop()); arStream = null; }
    cancelAnimationFrame(arAnimFrame);
    cancelAnimationFrame(arHandLoop);
    arObjects = []; arGrabbed = null; arObjCtx = null; arFxCtx = null; arCharCtx = null;
    arFxParticles = []; arLaserTrail = []; arCurrentFx = 'none';
    arGravityZones = []; arTrampoline = null; arFloatingTexts = [];
    arScore = 0; arCombo = 0; arGameActive = false; arGesture = 'none';
    arHand2Pos = { x: -1, y: -1, pinching: false };
    // Reset dispel/summon state
    arOrbDispelled = false; arBeamFiring = false; arBeamProgress = 0;
    arPalmHoldTime = 0; arCharAnim = 0; arThrowCooldown = 0;
    arPrevGesture = 'none';
    arPokeballPhase = 'idle'; arPokeballT = 0;
    document.getElementById('stage')?.classList.remove('stage-dispelled');
    document.querySelectorAll('.ar-fx-btn').forEach(b => b.classList.remove('ar-fx-active'));
    $('arStatus').style.opacity = '1';
    const hi = document.getElementById('arHandIndicator');
    if (hi) { hi.classList.remove('ar-detecting', 'ar-searching'); hi.textContent = ''; }
  }
  $('calBtn').onclick = () => openCalendar();
  $('arClose').onclick = closeArCamera;
  $('arAddBall').onclick = () => addArObject('ball');
  $('arAddCube').onclick = () => addArObject('cube');
  $('arAddStar').onclick = () => addArObject('star');
  $('arAddDiamond').onclick = () => addArObject('diamond');
  $('arAddCoin').onclick = () => addArObject('coin');
  $('arAddPortal').onclick = () => addArObject('portal');
  $('arAddGravity').onclick = () => {
    arGravityZones.push({
      x: 0.3 + Math.random() * 0.4, y: 0.3 + Math.random() * 0.3,
      r: 0.12 + Math.random() * 0.08, strength: 1 + Math.random(),
      hue: Math.random() * 360,
    });
  };
  $('arAddTrampoline').onclick = () => {
    arTrampoline = { x: 0.5, y: 0.85, w: 0.3, active: false };
  };
  $('arClearObjs').onclick = () => {
    arObjects = []; arGrabbed = null; arFxParticles = []; arLaserTrail = [];
    arGravityZones = []; arTrampoline = null; arFloatingTexts = [];
    arScore = 0; arCombo = 0; arGameActive = false;
  };
  function startArGame(mode: 'catch' | 'target' | 'zen') {
    arObjects = []; arGrabbed = null; arFxParticles = []; arLaserTrail = [];
    arGravityZones = []; arTrampoline = null; arFloatingTexts = [];
    arScore = 0; arCombo = 0; arComboTimer = 0;
    arGameMode = mode;
    arGameActive = true;
    arGameTimer = mode === 'zen' ? 999 : 30;
    arGameSpawnTimer = 0.5;
    if (mode === 'catch') arTrampoline = { x: 0.5, y: 0.88, w: 0.35, active: false };
    addFloatingText(0.5, 0.4, mode === 'catch' ? 'CATCH THE COINS!' : mode === 'target' ? 'HIT THE TARGETS!' : 'ZEN MODE', '#ffd700');
  }
  $('arGameCatch').onclick = () => startArGame('catch');
  $('arGameTarget').onclick = () => startArGame('target');
  $('arGameZen').onclick = () => startArGame('zen');

  function setArEffect(fx: ArEffect) {
    arCurrentFx = arCurrentFx === fx ? 'none' : fx;
    arFxParticles = [];
    arLaserTrail = [];
    document.querySelectorAll('.ar-fx-btn').forEach(b => b.classList.remove('ar-fx-active'));
    if (arCurrentFx !== 'none') {
      document.getElementById(`arFx${fx.charAt(0).toUpperCase() + fx.slice(1)}`)?.classList.add('ar-fx-active');
    }
  }
  $('arFxFire').onclick = () => setArEffect('fire');
  $('arFxWater').onclick = () => setArEffect('water');
  $('arFxLaser').onclick = () => setArEffect('laser');
  $('arFxSparkle').onclick = () => setArEffect('sparkle');
  $('arFxRainbow').onclick = () => setArEffect('rainbow');

  function captureArPhoto() {
    const video = $<HTMLVideoElement>('arVideo');
    const c = document.createElement('canvas');
    c.width = video.videoWidth; c.height = video.videoHeight;
    const cx = c.getContext('2d')!;
    cx.save();
    cx.translate(c.width, 0);
    cx.scale(-1, 1);
    cx.drawImage(video, 0, 0);
    cx.restore();
    const fxC = $<HTMLCanvasElement>('arFxCanvas');
    cx.drawImage(fxC, 0, 0);
    const objC = $<HTMLCanvasElement>('arObjCanvas');
    cx.drawImage(objC, 0, 0);
    const handC = $<HTMLCanvasElement>('arCanvas');
    cx.drawImage(handC, 0, 0);
    const link = document.createElement('a');
    link.download = `AR_capture_${Date.now()}.png`;
    link.href = c.toDataURL('image/png');
    link.click();
  }

  function startHandTracking(
    video: HTMLVideoElement, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D,
    handIndicator: HTMLElement, arBtns: { label: string; action: () => void }[]
  ) {
    let lastTapTime = 0;
    const pointerEl = document.createElement('div');
    pointerEl.className = 'ar-pointer';
    $('arViewport').appendChild(pointerEl);

    handIndicator.textContent = '⏳ טוען זיהוי…';
    handIndicator.classList.add('ar-searching');
    // Reuse the script if AR was opened before in this session.
    if ((window as any).Hands) {
      initMediaPipeHands(video, canvas, ctx, pointerEl, handIndicator, arBtns);
    } else {
      const mpScript = document.createElement('script');
      mpScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.min.js';
      mpScript.onerror = () => { handIndicator.textContent = 'נכשלה טעינת זיהוי היד — בדוק חיבור'; };
      mpScript.onload = () => initMediaPipeHands(video, canvas, ctx, pointerEl, handIndicator, arBtns);
      document.head.appendChild(mpScript);
    }

    function initMediaPipeHands(
      vid: HTMLVideoElement, cvs: HTMLCanvasElement, c: CanvasRenderingContext2D,
      ptr: HTMLElement, indicator: HTMLElement, btns: { label: string; action: () => void }[]
    ) {
      const Hands = (window as any).Hands;
      if (!Hands) {
        indicator.textContent = 'Hand tracking unavailable';
        return;
      }
      const hands = new Hands({ locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${f}` });
      // Lighter model + single hand on phones so it runs smoothly.
      // Highest-quality detection on every device. Lower confidence
      // thresholds so a hand is picked up readily even in poor lighting.
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.4,
        minTrackingConfidence: 0.4,
        selfieMode: true,
      });
      // Frame-rate-independent gesture timing.
      let lastFrameT = performance.now();

      hands.onResults((results: any) => {
        const nowT = performance.now();
        const frameDt = Math.min(0.2, (nowT - lastFrameT) / 1000); // seconds, capped
        lastFrameT = nowT;
        c.clearRect(0, 0, cvs.width, cvs.height);
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          for (let h = 0; h < results.multiHandLandmarks.length; h++) {
            const landmarks = results.multiHandLandmarks[h];
            const isRight = h === 0;
            indicator.textContent = results.multiHandLandmarks.length > 1 ? '🟢 מזהה אותך — שתי ידיים' : '🟢 מזהה אותך — יד אחת';
            indicator.classList.add('ar-detecting');
            indicator.classList.remove('ar-searching');

            c.strokeStyle = isRight ? 'rgba(218,165,32,0.6)' : 'rgba(200,149,106,0.6)';
            c.lineWidth = 2;
            const connections = [
              [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
              [5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],
              [13,17],[17,18],[18,19],[19,20],[0,17]
            ];
            for (const [a, b] of connections) {
              c.beginPath();
              c.moveTo(landmarks[a].x * cvs.width, landmarks[a].y * cvs.height);
              c.lineTo(landmarks[b].x * cvs.width, landmarks[b].y * cvs.height);
              c.stroke();
            }
            for (let i = 0; i < landmarks.length; i++) {
              const lm = landmarks[i];
              c.beginPath();
              c.arc(lm.x * cvs.width, lm.y * cvs.height, i === 8 || i === 4 ? 8 : 4, 0, Math.PI * 2);
              c.fillStyle = i === 8 ? 'rgba(245,230,200,0.9)' : i === 4 ? 'rgba(218,165,32,0.9)' : (isRight ? 'rgba(218,165,32,0.7)' : 'rgba(200,149,106,0.7)');
              c.fill();
            }

            if (h === 0) {
              const indexTip = landmarks[8];
              const thumbTip = landmarks[4];
              const middleTip = landmarks[12];
              const ringTip = landmarks[16];
              const pinkyTip = landmarks[20];
              const wrist = landmarks[0];
              const viewRect = $('arViewport').getBoundingClientRect();
              const hx = indexTip.x;
              const hy = indexTip.y;
              ptr.style.left = (hx * viewRect.width) + 'px';
              ptr.style.top = (hy * viewRect.height) + 'px';
              ptr.style.opacity = '1';

              const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
              const pinching = pinchDist < 0.05;
              arHandPos = { x: hx, y: hy, pinching };

              // Gesture recognition
              const indexUp = indexTip.y < landmarks[6].y;
              const middleUp = middleTip.y < landmarks[10].y;
              const ringUp = ringTip.y < landmarks[14].y;
              const pinkyUp = pinkyTip.y < landmarks[18].y;
              const thumbUp = thumbTip.y < landmarks[3].y && Math.abs(thumbTip.x - wrist.x) > 0.04;

              if (indexUp && middleUp && !ringUp && !pinkyUp) arGesture = 'peace';
              else if (!indexUp && !middleUp && !ringUp && !pinkyUp && !thumbUp) arGesture = 'fist';
              else if (indexUp && middleUp && ringUp && pinkyUp) arGesture = 'palm';
              else if (thumbUp && !indexUp && !middleUp) arGesture = 'thumbsUp';
              else if (indexUp && !middleUp && !ringUp && !pinkyUp) arGesture = 'pointUp';
              else arGesture = 'none';

              // ── Dispel & Summon logic ──────────────────────────────
              // Palm held 0.7s → fire laser beam at orb
              if (arGesture === 'palm' && !arOrbDispelled && !arBeamFiring) {
                arPalmHoldTime += frameDt;
                if (arPalmHoldTime >= 0.7) {
                  arBeamFiring = true;
                  arBeamProgress = 0;
                  arBeamOrigin = { x: hx, y: hy };
                  arPalmHoldTime = 0;
                }
              } else if (arGesture !== 'palm') {
                arPalmHoldTime = 0;
              }

              // Fist → open quickly = "throw" → summon next character via pokeball
              if (arGesture === 'fist' && arPrevGesture !== 'fist') {
                arFistStartTime = Date.now();
              }
              if ((arGesture === 'palm' || arGesture === 'none') && arPrevGesture === 'fist') {
                const fistDur = Date.now() - arFistStartTime;
                if (fistDur < 400 && arOrbDispelled && arThrowCooldown <= 0 && arCharacters.length > 0) {
                  arCharIdx = (arCharIdx + 1) % arCharacters.length;
                  arCharAnim = 0;
                  arCharFromDir = { x: hx - 0.5, y: hy - 0.5 };
                  arThrowCooldown = 3.0;
                  arPokeballPhase = 'fly';
                  arPokeballT = 0;
                  arPokeballFrom = { x: hx, y: hy };
                  addFloatingText(hx, hy, '⚡ ' + (arCharacters[arCharIdx]?.name || 'Pokemon'), arCharacters[arCharIdx]?.color || '#daa520');
                }
              }
              arPrevGesture = arGesture;
              arThrowCooldown = Math.max(0, arThrowCooldown - frameDt);
              // ──────────────────────────────────────────────────────

              // Gesture-triggered actions (objects in sandbox)
              if (arGesture === 'palm' && arCurrentFx === 'none') {
                for (const obj of arObjects) {
                  if (!obj.grabbed) {
                    const dx = obj.x - hx, dy = obj.y - hy;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 0.3 && dist > 0.01) {
                      obj.vx += (dx / dist) * 0.003;
                      obj.vy += (dy / dist) * 0.003;
                    }
                  }
                }
              }
              if (arGesture === 'fist') {
                for (const obj of arObjects) {
                  if (!obj.grabbed) {
                    const dx = hx - obj.x, dy = hy - obj.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 0.25 && dist > 0.01) {
                      obj.vx += (dx / dist) * 0.002;
                      obj.vy += (dy / dist) * 0.002;
                    }
                  }
                }
              }

              if (pinching) {
                ptr.classList.add('pinch');
                const now = Date.now();
                if (now - lastTapTime > 600 && !arGrabbed) {
                  lastTapTime = now;
                  const arBtnEls = $('arButtons').querySelectorAll<HTMLButtonElement>('.ar-btn');
                  for (let i = 0; i < arBtnEls.length; i++) {
                    const rect = arBtnEls[i].getBoundingClientRect();
                    const relX = hx * viewRect.width + viewRect.left;
                    const relY = hy * viewRect.height + viewRect.top;
                    if (relX >= rect.left && relX <= rect.right && relY >= rect.top && relY <= rect.bottom) {
                      arBtnEls[i].classList.add('ar-btn-active');
                      setTimeout(() => arBtnEls[i].classList.remove('ar-btn-active'), 300);
                      btns[i].action();
                      break;
                    }
                  }
                }
              } else {
                ptr.classList.remove('pinch');
              }
            }

            // Second hand — full tracking
            if (h === 1) {
              const idx2 = landmarks[8];
              const thumb2 = landmarks[4];
              const pinch2 = Math.hypot(idx2.x - thumb2.x, idx2.y - thumb2.y) < 0.05;
              arHand2Pos = { x: idx2.x, y: idx2.y, pinching: pinch2 };
              for (const obj of arObjects) {
                const dx = obj.x - idx2.x, dy = obj.y - idx2.y;
                const dist = Math.hypot(dx, dy);
                if (dist < obj.r + 0.03 && dist > 0) {
                  const force = 0.008 / Math.max(dist, 0.01);
                  obj.vx += dx * force;
                  obj.vy += dy * force;
                }
              }
            }
          }
        } else {
          indicator.textContent = '🟡 מחפש… הראה יד למצלמה';
          indicator.classList.add('ar-searching');
          indicator.classList.remove('ar-detecting');
          ptr.style.opacity = '0';
          arHandPos = { x: -1, y: -1, pinching: false };
          if (arGrabbed) { arGrabbed.grabbed = false; arGrabbed = null; }
        }
      });

      // Drive MediaPipe from OUR existing camera stream via a manual frame
      // loop instead of MediaPipe's Camera util — the util opens a *second*
      // getUserMedia stream, which fails on phones that allow only one
      // camera consumer at a time.
      let sending = false;
      const pump = async () => {
        if (!arStream) return; // camera closed
        if (!sending && vid.readyState >= 2 && vid.videoWidth > 0) {
          sending = true;
          try { await hands.send({ image: vid }); } catch {}
          sending = false;
        }
        arHandLoop = requestAnimationFrame(pump);
      };
      pump();
    }
  }

  // Dock items click
  document.querySelectorAll<HTMLButtonElement>('.dock-item[data-q]').forEach(btn => {
    btn.onclick = () => {
      const q = btn.dataset.q || '';
      if (!q) return;
      audio.send();
      addMsg(q, 'me');
      ask(q);
    };
  });

  // Mac dock magnification
  const dock = $('macDock');
  const dockItems = dock.querySelectorAll<HTMLButtonElement>('.dock-item');
  dock.addEventListener('mousemove', (e: MouseEvent) => {
    dockItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const dist = Math.abs(e.clientX - cx);
      const maxDist = 100;
      const scale = dist < maxDist ? 1 + (1 - dist / maxDist) * 0.5 : 1;
      const ty = dist < maxDist ? -(1 - dist / maxDist) * 14 : 0;
      item.style.transform = `scale(${scale}) translateY(${ty}px)`;
    });
  });
  dock.addEventListener('mouseleave', () => {
    dockItems.forEach(item => { item.style.transform = ''; });
  });

  function openSetup() {
    $<HTMLInputElement>('nameInput').value = state.name;
    $<HTMLInputElement>('keyInput').value = state.key;
    $<HTMLInputElement>('grokKeyInput').value = state.grokKey;
    $<HTMLInputElement>('groqKeyInput').value = state.groqKey;
    $<HTMLInputElement>('openaiKeyInput').value = state.openaiKey;
    $<HTMLSelectElement>('providerSel').value = state.provider;
    $<HTMLSelectElement>('micSel').value = state.micLang;
    $<HTMLSelectElement>('replySel').value = state.replyLang;
    $<HTMLSelectElement>('textLangSel').value = state.textLang;
    $<HTMLInputElement>('ambSlider').value = String(Math.round(audio.ambLevel * 100));
    $('ambVal').textContent = Math.round(audio.ambLevel * 100) + '%';
    $<HTMLSelectElement>('ambPresetSel').value = audio.ambPreset;
    $<HTMLInputElement>('speedSlider').value = String(Math.round((state.voiceSpeed || 1) * 100));
    $('speedVal').textContent = (state.voiceSpeed || 1).toFixed(1) + 'x';
    $<HTMLInputElement>('pitchSlider').value = String(Math.round((state.voicePitch != null ? state.voicePitch : 1) * 100));
    $('pitchVal').textContent = (state.voicePitch != null ? state.voicePitch : 1).toFixed(1);
    $<HTMLInputElement>('voiceVolSlider').value = String(Math.round((state.voiceVolume != null ? state.voiceVolume : 1) * 100));
    $('voiceVolVal').textContent = Math.round((state.voiceVolume != null ? state.voiceVolume : 1) * 100) + '%';
    $<HTMLInputElement>('sfxCheck').checked = state.sfxOn;
    $<HTMLInputElement>('hapticsCheck').checked = state.haptics;
    $<HTMLInputElement>('fastModeCheck').checked = localStorage.getItem('alpha_fast_mode') === '1';
    $<HTMLSelectElement>('displayModeSel').value = localStorage.getItem('alpha_display_mode') || 'auto';
    $<HTMLInputElement>('autoSpeakCheck').checked = state.autoSpeak;
    $<HTMLInputElement>('pikaVoiceCheck').checked = state.pikaVoiceOn;
    $<HTMLInputElement>('pikaVolSlider').value = String(Math.round(state.pikaVolume * 100));
    $('pikaVolVal').textContent = Math.round(state.pikaVolume * 100) + '%';
    $<HTMLInputElement>('pikaPitchSlider').value = String(Math.round(state.pikaPitch * 100));
    $('pikaPitchVal').textContent = state.pikaPitch.toFixed(1);
    // Cloud sync state
    $<HTMLInputElement>('driveClientId').value = driveSync.getClientId();
    updateDriveUI();
    $<HTMLInputElement>('spotifyId').value = socials.spotify;
    $<HTMLInputElement>('tiktokId').value = socials.tiktok;
    $<HTMLInputElement>('instaId').value = socials.insta;
    $<HTMLInputElement>('fbId').value = socials.fb;
    // Gender picker
    $('genderPicker').querySelectorAll('.gender-btn').forEach(b => {
      b.classList.toggle('active', (b as HTMLElement).dataset.g === state.voiceGender);
    });
    refreshVoiceList();
    $('overlay').classList.add('show');
  }
  function refreshVoiceList() {
    voice.loadVoices();
    const sel = $<HTMLSelectElement>('voiceSel');
    const list = voice.availableVoices();
    sel.innerHTML = list.map(v => {
      const g = voice.voiceGenderLabel(v);
      const quality = /natural|neural|enhanced|premium|wavenet|studio/i.test(v.name) ? ' HD' : '';
      return `<option value="${v.name}">[${g}]${quality} ${v.name} (${v.lang})</option>`;
    }).join('') || '<option value="">No voice available</option>';
  }
  $('settingsBtn').onclick = openSetup;

  // ── Collapsible settings sections (quality-of-life: tame the long scroll) ──
  (function setupCollapsibleSettings() {
    const CKEY = 'alpha_settings_collapsed_v1';
    // Sections collapsed by default to reduce the initial wall of options.
    const DEFAULT_COLLAPSED = ['audio', 'aiEngineTitle', 'cloudSync', 'connectedServices', 'shortcuts'];
    let collapsed: string[];
    try { collapsed = JSON.parse(localStorage.getItem(CKEY) || 'null') || DEFAULT_COLLAPSED; }
    catch { collapsed = DEFAULT_COLLAPSED.slice(); }

    $('overlay').querySelectorAll<HTMLElement>('.settings-section').forEach(section => {
      const title = section.querySelector<HTMLElement>('.ss-title');
      if (!title) return;
      const id = title.dataset.i18n || title.textContent || '';
      if (collapsed.includes(id)) section.classList.add('collapsed');
      title.addEventListener('click', () => {
        section.classList.toggle('collapsed');
        const isCollapsed = section.classList.contains('collapsed');
        collapsed = collapsed.filter(x => x !== id);
        if (isCollapsed) collapsed.push(id);
        try { localStorage.setItem(CKEY, JSON.stringify(collapsed)); } catch {}
      });
    });
  })();

  // ── Cloud Sync handlers ──
  function updateDriveUI() {
    const connected = driveSync.isConnected();
    const btn = $('driveConnectBtn');
    btn.textContent = connected ? '✓ מחובר' : 'חבר Google Drive';
    btn.classList.toggle('cloud-connected', connected);
    ($('driveUploadBtn') as HTMLButtonElement).disabled = !connected;
    ($('driveDownloadBtn') as HTMLButtonElement).disabled = !connected;
    const last = driveSync.lastSyncTime();
    const autoNote = connected ? ' · גיבוי אוטומטי כל 5 דקות' : '';
    $('driveStatus').textContent = last ? `סנכרון אחרון: ${new Date(last).toLocaleTimeString('he-IL')}${autoNote}` : (connected ? autoNote.trim() : '');
  }
  $('driveConnectBtn').onclick = async () => {
    const id = $<HTMLInputElement>('driveClientId').value.trim();
    if (!id) { $('driveStatus').textContent = 'Enter a Client ID first'; return; }
    driveSync.setClientId(id);
    $('driveStatus').textContent = 'Connecting…';
    try {
      const ok = await driveSync.signIn();
      $('driveStatus').textContent = ok ? 'Connected ✓' : 'Connection cancelled';
      updateDriveUI();
    } catch (e: any) {
      $('driveStatus').textContent = e.message === 'NO_CLIENT_ID' ? 'Enter a Client ID' : 'Connection failed: ' + e.message;
    }
  };
  $('driveUploadBtn').onclick = async () => {
    const r = await driveSync.syncToCloud(m => { $('driveStatus').textContent = m; });
    if (!r.ok) $('driveStatus').textContent = 'Error: ' + r.error;
    updateDriveUI();
  };
  $('driveDownloadBtn').onclick = async () => {
    if (!confirm('שים לב: פעולה זו תחליף את הנתונים המקומיים בגיבוי מהענן. להמשיך?')) return;
    const r = await driveSync.syncFromCloud(m => { $('driveStatus').textContent = m; });
    if (!r.ok) $('driveStatus').textContent = 'שגיאה: ' + r.error;
    else setTimeout(() => location.reload(), 1500);
  };
  $('localExportBtn').onclick = () => driveSync.downloadAsFile();
  $('localImportBtn').onclick = async () => {
    const r = await driveSync.uploadFromFile();
    if (r.ok) { alert(`שוחזרו ${r.tables} טבלאות. טוען מחדש…`); location.reload(); }
    else alert('ייבוא נכשל: ' + r.error);
  };

  // ── Puter / Google sync ──
  function updatePuterUI() {
    const signedIn = puterSync.isSignedIn();
    $('puterSignedOut').style.display = signedIn ? 'none' : 'flex';
    $('puterSignedIn').style.display = signedIn ? 'flex' : 'none';
    if (signedIn) {
      puterSync.getUser().then(u => {
        if (u) $('puterUserLabel').textContent = `מחובר: ${u.username || u.email || 'Google'}`;
      }).catch(() => {});
      const last = puterSync.lastSyncTime();
      $('puterStatus').textContent = last
        ? `סנכרון אחרון: ${new Date(last).toLocaleTimeString('he-IL')} · אוטומטי כל 5 דקות`
        : 'סנכרון אוטומטי כל 5 דקות';
    }
  }
  $('puterSignInBtn').onclick = async () => {
    $('puterSignInBtn').textContent = 'מתחבר…';
    ($('puterSignInBtn') as HTMLButtonElement).disabled = true;
    const ok = await puterSync.signIn();
    ($('puterSignInBtn') as HTMLButtonElement).disabled = false;
    $('puterSignInBtn').innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84z"/></svg> התחבר עם Google`;
    if (ok) {
      updatePuterUI();
      puterSync.syncToCloud(m => { $('puterStatus').textContent = m; });
    }
  };
  $('puterSyncNowBtn').onclick = async () => {
    ($('puterSyncNowBtn') as HTMLButtonElement).disabled = true;
    $('puterStatus').textContent = 'מסנכרן…';
    const r = await puterSync.syncToCloud(m => { $('puterStatus').textContent = m; });
    if (!r.ok) $('puterStatus').textContent = 'שגיאה: ' + r.error;
    ($('puterSyncNowBtn') as HTMLButtonElement).disabled = false;
    updatePuterUI();
  };
  $('puterRestoreBtn').onclick = async () => {
    if (!confirm('שחזור יחליף את הנתונים המקומיים בגיבוי מהענן. להמשיך?')) return;
    const r = await puterSync.syncFromCloud(m => { $('puterStatus').textContent = m; });
    if (!r.ok) $('puterStatus').textContent = 'שגיאה: ' + r.error;
    else setTimeout(() => location.reload(), 1500);
  };
  $('puterSignOutBtn').onclick = async () => {
    await puterSync.signOut();
    updatePuterUI();
  };

  // Sync role selector
  const syncRoleSel = $<HTMLSelectElement>('syncRoleSel');
  syncRoleSel.value = puterSync.getSyncRole();
  syncRoleSel.addEventListener('change', () => {
    puterSync.setSyncRole(syncRoleSel.value as 'primary' | 'secondary' | 'auto');
  });

  // Refresh Puter UI when settings open
  $('settingsBtn').addEventListener('click', () => {
    setTimeout(() => {
      updatePuterUI();
      syncRoleSel.value = puterSync.getSyncRole();
    }, 50);
  });

  // ── Universal Search ──
  const searchOverlay = $('searchOverlay');
  const searchInput = $<HTMLInputElement>('searchInput');
  const searchResults = $('searchResults');
  function openSearch() {
    searchOverlay.classList.add('show');
    searchInput.value = '';
    let hintHtml = '';
    const recent = recentSearches();
    if (recent.length) {
      hintHtml += '<div class="search-hint">Recent</div>';
      hintHtml += recent.slice(0, 5).map(r => `<div class="search-item search-recent" data-query="${r}"><span class="search-icon">🕐</span><div class="search-text"><span class="search-title">${r}</span></div></div>`).join('');
    }
    const suggestions = quickSuggestions();
    if (suggestions.length) {
      hintHtml += '<div class="search-hint">Quick access</div>';
      hintHtml += suggestions.map(s => `<div class="search-item" data-type="${s.type}"><span class="search-icon">${TYPE_ICONS[s.type]}</span><div class="search-text"><span class="search-title">${s.title}</span><span class="search-sub">${s.subtitle}</span></div><span class="search-type">${s.type}</span></div>`).join('');
    }
    if (!hintHtml) hintHtml = '<div class="search-hint">Search leads, tasks, events, invoices, goals, notes…</div>';
    searchResults.innerHTML = hintHtml;
    searchResults.querySelectorAll('.search-recent').forEach(el => {
      (el as HTMLElement).onclick = () => {
        searchInput.value = (el as HTMLElement).dataset.query || '';
        searchInput.dispatchEvent(new Event('input'));
      };
    });
    setTimeout(() => searchInput.focus(), 100);
  }
  function closeSearch() { searchOverlay.classList.remove('show'); }
  $('searchBtn').onclick = openSearch;
  searchOverlay.addEventListener('click', e => { if (e.target === searchOverlay) closeSearch(); });
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape' && searchOverlay.classList.contains('show')) closeSearch();
  });
  let searchDebounce: any = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      const q = searchInput.value.trim();
      if (!q) { searchResults.innerHTML = '<div class="search-hint">Type to search across all your data…</div>'; return; }
      addRecentSearch(q);
      const results = universalSearch(q);
      if (!results.length) { searchResults.innerHTML = '<div class="search-hint">No results found.</div>'; return; }
      searchResults.innerHTML = results.map(r =>
        `<div class="search-item" data-type="${r.type}">` +
        `<span class="search-icon">${TYPE_ICONS[r.type]}</span>` +
        `<div class="search-text"><span class="search-title">${r.title}</span><span class="search-sub">${r.subtitle}</span></div>` +
        `<span class="search-type">${r.type}</span></div>`
      ).join('');
    }, 150);
  });

  // ── Quick Actions FAB ──
  const fabBtn = $('fabBtn');
  const fabMenu = $('fabMenu');
  let fabOpen = false;
  fabBtn.onclick = () => {
    fabOpen = !fabOpen;
    fabMenu.classList.toggle('show', fabOpen);
    fabBtn.textContent = fabOpen ? '✕' : '+';
    fabBtn.style.transform = fabOpen ? 'rotate(45deg)' : '';
  };
  fabMenu.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('.fab-item') as HTMLElement;
    if (!item) return;
    const action = item.dataset.action;
    fabOpen = false; fabMenu.classList.remove('show'); fabBtn.textContent = '+'; fabBtn.style.transform = '';
    if (action === 'task') {
      const text = prompt('Quick task:');
      if (text?.trim()) {
        addTask(text.trim());
        addMsg(`✅ Task added: "${text.trim()}"`, 'sys');
        puterSync.markDirty();
        puterSync.scheduleSync(() => updateCloudIndicator());
      }
    } else if (action === 'note') {
      const text = prompt('Quick note:');
      if (text?.trim()) { saveNote(text.trim()); addMsg(`📝 ${t('noteSaved', state.uiLang)}`, 'sys'); }
    } else if (action === 'timer') {
      const project = prompt('Project name:');
      if (project?.trim()) { startTimer(project.trim()); addMsg(`⏱️ Timer started: ${project.trim()}`, 'sys'); }
    } else if (action === 'briefing') {
      addMsg(dailyBriefing(), 'sys');
    } else if (action === 'search') {
      openSearch();
    }
  });
  document.addEventListener('click', (e) => {
    if (fabOpen && !(e.target as HTMLElement).closest('.fab, .fab-menu, #fabBtn, #fabMenu')) {
      fabOpen = false; fabMenu.classList.remove('show'); fabBtn.textContent = '+'; fabBtn.style.transform = '';
    }
  });

  // ── Keyboard Shortcuts ──
  registerShortcut('Ctrl+K', 'Search', openSearch);
  registerShortcut('Ctrl+B', 'Daily Briefing', () => {
    const brief = dailyBriefing();
    addMsg(brief, 'sys');
  });
  registerShortcut('Ctrl+.', 'Settings', openSetup);
  initShortcuts();

  // ── Shortcuts panel in settings ──
  try {
    const shortcutsDiv = document.getElementById('shortcutsList');
    if (shortcutsDiv) shortcutsDiv.innerHTML = shortcutsHTML();
  } catch {}

  $<HTMLSelectElement>('replySel').onchange = () => { state.replyLang = $<HTMLSelectElement>('replySel').value as any; refreshVoiceList(); };
  $<HTMLSelectElement>('ambPresetSel').onchange = () => {
    audio.ensure();
    const preset = $<HTMLSelectElement>('ambPresetSel').value as AmbientPreset;
    audio.setPreset(preset);
    state.ambPreset = preset;
  };
  $<HTMLInputElement>('ambSlider').oninput = () => {
    audio.ensure(); const v = +$<HTMLInputElement>('ambSlider').value;
    audio.setAmbient(v / 100); $('ambVal').textContent = v + '%';
  };
  $<HTMLInputElement>('speedSlider').oninput = () => {
    const v = +$<HTMLInputElement>('speedSlider').value / 100;
    $('speedVal').textContent = v.toFixed(1) + 'x';
    state.voiceSpeed = v;
  };
  $<HTMLInputElement>('pitchSlider').oninput = () => {
    const v = +$<HTMLInputElement>('pitchSlider').value / 100;
    $('pitchVal').textContent = v.toFixed(1);
    state.voicePitch = v;
  };
  $<HTMLInputElement>('voiceVolSlider').oninput = () => {
    const v = +$<HTMLInputElement>('voiceVolSlider').value / 100;
    $('voiceVolVal').textContent = Math.round(v * 100) + '%';
    state.voiceVolume = v;
  };

  // ── Voice Studio: character presets [rate, pitch, volume] ──
  const VOICE_PRESETS: Record<string, { rate: number; pitch: number; vol: number }> = {
    natural:   { rate: 1.0, pitch: 1.0, vol: 1.0 },
    calm:      { rate: 0.88, pitch: 0.8, vol: 0.95 },
    energetic: { rate: 1.25, pitch: 1.25, vol: 1.0 },
    fast:      { rate: 1.6, pitch: 1.05, vol: 1.0 },
    clear:     { rate: 0.8, pitch: 1.0, vol: 1.0 },
    deep:      { rate: 0.92, pitch: 0.55, vol: 1.0 },
    robot:     { rate: 0.9, pitch: 0.4, vol: 1.0 },
    chipmunk:  { rate: 1.4, pitch: 2.0, vol: 1.0 },
    whisper:   { rate: 0.95, pitch: 1.15, vol: 0.4 },
  };
  function applyVoiceSliders(rate: number, pitch: number, vol: number) {
    $<HTMLInputElement>('speedSlider').value = String(Math.round(rate * 100));
    $('speedVal').textContent = rate.toFixed(1) + 'x';
    $<HTMLInputElement>('pitchSlider').value = String(Math.round(pitch * 100));
    $('pitchVal').textContent = pitch.toFixed(1);
    $<HTMLInputElement>('voiceVolSlider').value = String(Math.round(vol * 100));
    $('voiceVolVal').textContent = Math.round(vol * 100) + '%';
    state.voiceSpeed = rate; state.voicePitch = pitch; state.voiceVolume = vol;
  }
  function voiceSampleText(): string {
    const custom = $<HTMLInputElement>('voiceTestText').value.trim();
    if (custom) return custom;
    const samples: Record<string, string> = {
      he: 'שלום, אני אלפא, העוזר האישי שלך. ככה אני נשמע.',
      en: 'Hello, I am Alpha, your personal assistant. This is how I sound.',
      es: 'Hola, soy Alpha, tu asistente personal. Así sueno.',
    };
    return samples[state.replyLang] || samples.en;
  }
  $('voicePresets').addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.vp-chip') as HTMLElement;
    if (!btn) return;
    const p = VOICE_PRESETS[btn.dataset.preset!];
    if (!p) return;
    $('voicePresets').querySelectorAll('.vp-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyVoiceSliders(p.rate, p.pitch, p.vol);
    const vsel = $<HTMLSelectElement>('voiceSel').value;
    if (vsel) voice.setVoice(vsel);
    voice.preview(voiceSampleText(), { rate: p.rate, pitch: p.pitch, volume: p.vol });
  });
  $('voicePlayBtn').onclick = () => {
    const vsel = $<HTMLSelectElement>('voiceSel').value;
    if (vsel) voice.setVoice(vsel);
    voice.preview(voiceSampleText(), {
      rate: state.voiceSpeed, pitch: state.voicePitch, volume: state.voiceVolume, voiceName: vsel,
    });
  };
  $('resetVoiceBtn').onclick = () => {
    $('voicePresets').querySelectorAll('.vp-chip').forEach(b => b.classList.remove('active'));
    applyVoiceSliders(1.0, 1.0, 1.0);
    voice.preview(voiceSampleText(), { rate: 1.0, pitch: 1.0, volume: 1.0 });
  };
  $('pikaSpeakBtn').onclick = () => { pikaSpeak(); };
  $<HTMLInputElement>('pikaVoiceCheck').onchange = (e) => {
    const on = (e.target as HTMLInputElement).checked;
    state.pikaVoiceOn = on;
    // One switch controls EVERY character's voice (Pikachu + all cries).
    setPikaEnabled(on);
    setCharacterVoiceEnabled(on);
    setCryEnabled(on);
    if (on) applyCharacterVoice(localStorage.getItem(MAIN_CHAR_KEY) || 'pikachu');
    else stopCharacterVoice();
    localStorage.setItem('alpha_pikavoice', on ? '1' : '0');
  };
  $<HTMLInputElement>('pikaVolSlider').oninput = (e) => {
    const v = +((e.target as HTMLInputElement).value) / 100;
    $('pikaVolVal').textContent = Math.round(v * 100) + '%';
    setPikaVolume(v);
    state.pikaVolume = v;
    localStorage.setItem('alpha_pikavol', v.toFixed(2));
  };
  $<HTMLInputElement>('pikaPitchSlider').oninput = (e) => {
    const v = +((e.target as HTMLInputElement).value) / 100;
    $('pikaPitchVal').textContent = v.toFixed(1);
    setPikaPitch(v);
    state.pikaPitch = v;
    localStorage.setItem('alpha_pikapitch', v.toFixed(2));
  };
  $('genderPicker').addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.gender-btn') as HTMLElement;
    if (!btn) return;
    state.voiceGender = btn.dataset.g as VoiceGender;
    $('genderPicker').querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    refreshVoiceList();
  });
  $('testVoiceBtn').onclick = () => {
    const vsel = $<HTMLSelectElement>('voiceSel').value;
    if (vsel) voice.setVoice(vsel);
    state.voiceSpeed = +$<HTMLInputElement>('speedSlider').value / 100;
    state.voicePitch = +$<HTMLInputElement>('pitchSlider').value / 100;
    state.voiceVolume = +$<HTMLInputElement>('voiceVolSlider').value / 100;
    voice.preview(voiceSampleText(), {
      rate: state.voiceSpeed, pitch: state.voicePitch, volume: state.voiceVolume, voiceName: vsel,
    });
  };
  $('saveBtn').onclick = () => {
    state.name = $<HTMLInputElement>('nameInput').value.trim() || 'ALPHA';
    state.key = $<HTMLInputElement>('keyInput').value.trim();
    state.grokKey = $<HTMLInputElement>('grokKeyInput').value.trim();
    state.groqKey = $<HTMLInputElement>('groqKeyInput').value.trim();
    state.openaiKey = $<HTMLInputElement>('openaiKeyInput').value.trim();
    state.provider = $<HTMLSelectElement>('providerSel').value as AIProvider;
    state.micLang = $<HTMLSelectElement>('micSel').value as any;
    state.replyLang = $<HTMLSelectElement>('replySel').value as any;
    state.textLang = $<HTMLSelectElement>('textLangSel').value as TextLang;
    state.ambLevel = audio.ambLevel;
    state.ambPreset = $<HTMLSelectElement>('ambPresetSel').value;
    audio.setPreset(state.ambPreset as AmbientPreset);
    state.voiceSpeed = +$<HTMLInputElement>('speedSlider').value / 100;
    state.voicePitch = +$<HTMLInputElement>('pitchSlider').value / 100;
    state.voiceVolume = +$<HTMLInputElement>('voiceVolSlider').value / 100;
    state.sfxOn = $<HTMLInputElement>('sfxCheck').checked;
    state.haptics = $<HTMLInputElement>('hapticsCheck').checked;
    const fast = $<HTMLInputElement>('fastModeCheck').checked;
    localStorage.setItem('alpha_fast_mode', fast ? '1' : '0');
    orb.setPerfMode(fast);
    state.autoSpeak = $<HTMLInputElement>('autoSpeakCheck').checked;
    audio.sfxOn = state.sfxOn;
    state.pikaVoiceOn = $<HTMLInputElement>('pikaVoiceCheck').checked;
    state.pikaVolume = +$<HTMLInputElement>('pikaVolSlider').value / 100;
    state.pikaPitch = +$<HTMLInputElement>('pikaPitchSlider').value / 100;
    setPikaEnabled(state.pikaVoiceOn);
    setCharacterVoiceEnabled(state.pikaVoiceOn);   // one switch for all character voices
    setCryEnabled(state.pikaVoiceOn);
    setPikaVolume(state.pikaVolume);
    setPikaPitch(state.pikaPitch);
    voice.setMicLang(state.micLang);
    const vsel = $<HTMLSelectElement>('voiceSel').value;
    if (vsel) voice.setVoice(vsel);
    driveSync.setClientId($<HTMLInputElement>('driveClientId').value.trim());
    socials.spotify = $<HTMLInputElement>('spotifyId').value.trim();
    socials.tiktok = $<HTMLInputElement>('tiktokId').value.trim();
    socials.insta = $<HTMLInputElement>('instaId').value.trim();
    socials.fb = $<HTMLInputElement>('fbId').value.trim();
    localStorage.setItem('alpha_social_spotify', socials.spotify);
    localStorage.setItem('alpha_social_tiktok', socials.tiktok);
    localStorage.setItem('alpha_social_insta', socials.insta);
    localStorage.setItem('alpha_social_fb', socials.fb);
    updateConnIndicators();
    // Display mode (mobile/desktop/auto) — needs a reload to re-mount the orb scene.
    const prevDisplayMode = localStorage.getItem('alpha_display_mode') || 'auto';
    const newDisplayMode = $<HTMLSelectElement>('displayModeSel').value;
    localStorage.setItem('alpha_display_mode', newDisplayMode);
    saveState(state);
    updateAIDisplay();
    $('overlay').classList.remove('show');
    if (state.history.length === 0) addMsg(state.name + ' ' + t('onlineMsg', state.uiLang), 'al');
    if (newDisplayMode !== prevDisplayMode) {
      setTimeout(() => location.reload(), 150);
    }
  };

  function pad(n: number) { return String(n).padStart(2, '0'); }
  function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 6) return 'GOOD NIGHT';
    if (h < 12) return 'GOOD MORNING';
    if (h < 17) return 'GOOD AFTERNOON';
    if (h < 21) return 'GOOD EVENING';
    return 'GOOD NIGHT';
  }
  setInterval(() => {
    const d = new Date();
    $('clock').textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const wmEl = document.querySelector('.wm');
    if (wmEl) wmEl.textContent = getGreeting();
  }, 1000);

  // ===== LEFT PANEL ANIMATIONS =====

  // --- Neural Canvas ---
  const neuralCanvas = $<HTMLCanvasElement>('neuralCanvas');
  const nCtx = neuralCanvas.getContext('2d');
  interface NeuralNode { x: number; y: number; vx: number; vy: number; r: number; pulse: number; }
  const neuralNodes: NeuralNode[] = [];
  function initNeural() {
    const rect = neuralCanvas.getBoundingClientRect();
    neuralCanvas.width = rect.width * 2;
    neuralCanvas.height = rect.height * 2;
    neuralNodes.length = 0;
    for (let i = 0; i < 14; i++) {
      neuralNodes.push({
        x: Math.random() * neuralCanvas.width,
        y: Math.random() * neuralCanvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: 2 + Math.random() * 3,
        pulse: Math.random() * Math.PI * 2,
      });
    }
  }
  function drawNeural() {
    if (!nCtx) return;
    const w = neuralCanvas.width, h = neuralCanvas.height;
    nCtx.clearRect(0, 0, w, h);
    const time = Date.now() * 0.001;
    // Update positions
    for (const n of neuralNodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      n.pulse += 0.02;
    }
    // Draw connections
    for (let i = 0; i < neuralNodes.length; i++) {
      for (let j = i + 1; j < neuralNodes.length; j++) {
        const a = neuralNodes[i], b = neuralNodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 160) {
          const alpha = (1 - dist / 160) * 0.25;
          nCtx.strokeStyle = `rgba(218, 165, 32, ${alpha})`;
          nCtx.lineWidth = 0.8;
          nCtx.beginPath(); nCtx.moveTo(a.x, a.y); nCtx.lineTo(b.x, b.y); nCtx.stroke();
          // Pulse traveling along the line
          const pulsePos = (Math.sin(time * 2 + i + j) + 1) / 2;
          const px = a.x + (b.x - a.x) * pulsePos;
          const py = a.y + (b.y - a.y) * pulsePos;
          nCtx.fillStyle = `rgba(255, 194, 77, ${alpha * 1.5})`;
          nCtx.beginPath(); nCtx.arc(px, py, 1.5, 0, Math.PI * 2); nCtx.fill();
        }
      }
    }
    // Draw nodes
    for (const n of neuralNodes) {
      const glow = 0.5 + Math.sin(n.pulse) * 0.3;
      nCtx.fillStyle = `rgba(218, 165, 32, ${glow})`;
      nCtx.shadowColor = 'rgba(218, 165, 32, 0.4)';
      nCtx.shadowBlur = 8;
      nCtx.beginPath(); nCtx.arc(n.x, n.y, n.r, 0, Math.PI * 2); nCtx.fill();
      nCtx.shadowBlur = 0;
    }
    setTimeout(drawNeural, 66);
  }
  const perfLite = document.documentElement.classList.contains('perf-lite');
  if (!perfLite) { initNeural(); drawNeural(); }
  else { neuralCanvas.style.display = 'none'; }

  // --- Wave Canvas ---
  const waveCanvas = $<HTMLCanvasElement>('waveCanvas');
  const wCtx = waveCanvas.getContext('2d');
  const waveBars = 32;
  const waveHeights: number[] = Array(waveBars).fill(0).map(() => Math.random() * 0.5);
  const waveTargets: number[] = Array(waveBars).fill(0).map(() => Math.random() * 0.5);
  function initWave() {
    const rect = waveCanvas.getBoundingClientRect();
    waveCanvas.width = rect.width * 2;
    waveCanvas.height = rect.height * 2;
  }
  function drawWave() {
    if (!wCtx) return;
    const w = waveCanvas.width, h = waveCanvas.height;
    wCtx.clearRect(0, 0, w, h);
    const barW = w / waveBars;
    for (let i = 0; i < waveBars; i++) {
      waveHeights[i] += (waveTargets[i] - waveHeights[i]) * 0.08;
      if (Math.random() < 0.02) waveTargets[i] = 0.1 + Math.random() * 0.8;
      const barH = waveHeights[i] * h * 0.85;
      const goldToCream = i / waveBars;
      const r = Math.round(218 + goldToCream * 37);
      const g = Math.round(165 + goldToCream * 65);
      const b = Math.round(32 + goldToCream * 112);
      wCtx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.7)`;
      const x = i * barW + 1;
      wCtx.fillRect(x, h - barH, barW - 2, barH);
      // Glow cap
      wCtx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
      wCtx.fillRect(x, h - barH - 2, barW - 2, 2);
    }
    setTimeout(drawWave, 66);
  }
  if (!perfLite) { initWave(); drawWave(); }
  else { waveCanvas.style.display = 'none'; }

  // --- Metric Bars Animation ---
  setInterval(() => {
    const cpu = 30 + Math.random() * 55;
    const mem = 50 + Math.random() * 30;
    const net = 10 + Math.random() * 40;
    $('cpuBar').style.width = cpu + '%';
    $('cpuVal').textContent = Math.round(cpu) + '%';
    $('memBar').style.width = mem + '%';
    $('memVal').textContent = Math.round(mem) + '%';
    $('netBar').style.width = (net / 50 * 100) + '%';
    $('netVal').textContent = Math.round(net) + 'ms';
  }, 2000);

  // --- Uptime Timer ---
  const startTime = Date.now();
  setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    $('uptimeVal').textContent = pad(mins) + ':' + pad(secs);
  }, 1000);

  // --- Live Widgets ---
  function updateLiveWidgets() {
    const w = $('liveWidgets');
    if (!w) return;
    try {
      const tasks = loadTasks();
      const openTasks = tasks.filter(t => !t.done).length;
      const events = loadEvents();
      const today = new Date().toISOString().slice(0, 10);
      const todayEvents = events.filter(e => e.date === today).length;
      let timerLine = '';
      try {
        const at = getActiveTimer();
        if (at) {
          const elapsed = Math.round((Date.now() - at.startTime) / 60000);
          timerLine = `<div class="lw-item"><span class="lw-icon">⏱</span><span class="lw-val">${elapsed}m</span><span class="lw-lbl">${at.project}</span></div>`;
        }
      } catch {}
      let moodLine = '';
      try {
        const s = averageSentiment();
        const icon = s.score > 0.3 ? '😊' : s.score < -0.3 ? '😟' : '😐';
        moodLine = `<div class="lw-item"><span class="lw-icon">${icon}</span><span class="lw-val">${s.label}</span><span class="lw-lbl">Mood</span></div>`;
      } catch {}
      let scoreLine = '';
      try {
        const sc = calculateScore();
        scoreLine = `<div class="lw-item"><span class="lw-icon">⚡</span><span class="lw-val">${sc.total}</span><span class="lw-lbl">${scoreLabel(sc.total)}</span></div>`;
      } catch {}
      w.innerHTML =
        scoreLine +
        `<div class="lw-item"><span class="lw-icon">✓</span><span class="lw-val">${openTasks}</span><span class="lw-lbl">Tasks</span></div>` +
        `<div class="lw-item"><span class="lw-icon">📅</span><span class="lw-val">${todayEvents}</span><span class="lw-lbl">Today</span></div>` +
        timerLine + moodLine;
    } catch {}
  }
  updateLiveWidgets();
  setInterval(updateLiveWidgets, 30000);

  // --- AI Model Display ---
  function updateAIDisplay() {
    const modelNames: Record<string, string> = {
      'gpt-4o-mini': 'GPT-4O MINI',
      'gpt-4o': 'GPT-4O',
      'o4-mini': 'O4-MINI',
      'claude-sonnet-4': 'CLAUDE SONNET 4',
      'gemini-2.0-flash': 'GEMINI 2.0 FLASH',
    };
    const providerNames: Record<string, string> = {
      'groq': 'VIA GROQ',
      'gemini': 'VIA GOOGLE',
      'grok': 'VIA XAI',
      'openai': 'VIA OPENAI',
    };
    const modelByProvider: Record<string, string> = {
      'groq': 'LLAMA 3.3 70B',
      'gemini': 'GEMINI 2.0 FLASH',
      'grok': 'GROK-3 MINI',
      'openai': 'GPT-4O MINI',
    };
    $('aiModelDisplay').textContent = modelByProvider[state.provider] || (modelNames[state.provider] || '');
    $('aiProviderDisplay').textContent = providerNames[state.provider] || state.provider.toUpperCase();
  }
  updateAIDisplay();

  updateConnIndicators();

  // ── Personalized greeting ──
  function greetingPrefix(): string {
    const h = new Date().getHours();
    return h < 5 ? t('goodNight', state.uiLang) : h < 12 ? t('goodMorning', state.uiLang) : h < 18 ? t('goodAfternoon', state.uiLang) : t('goodEvening', state.uiLang);
  }
  function personalGreeting(): string {
    const nm = loadMemory().profile.name;
    if (!nm) return `${state.name} ${t('onlineMsg', state.uiLang)}`;
    const tasks = loadTasks();
    const openCount = tasks.filter(t => !t.done).length;
    const today = new Date().toISOString().slice(0, 10);
    const todayEvents = loadEvents().filter(e => e.date === today).length;
    const bits: string[] = [`${greetingPrefix()}, ${nm}.`];
    if (openCount > 0 || todayEvents > 0) {
      const parts: string[] = [];
      if (todayEvents) parts.push(`${todayEvents} ${t('eventsToday', state.uiLang)}`);
      if (openCount) parts.push(`${openCount} ${t('openTasks', state.uiLang)}`);
      bits.push(`${t('youHave', state.uiLang)} ${parts.join(` ${t('and', state.uiLang)} `)}.`);
    }
    bits.push(t('howCanIHelp', state.uiLang));
    return bits.join(' ');
  }

  // ── First-run welcome: ask the user's name so the AI can address them ──
  function showWelcome() {
    const ov = document.createElement('div');
    ov.className = 'welcome-overlay show';
    ov.innerHTML = `
      <div class="welcome-card">
        <div class="welcome-orb">◆</div>
        <h2 class="welcome-title">${greetingPrefix()} 👋</h2>
        <p class="welcome-sub">${state.uiLang === 'he' ? 'אני' : "I'm"} <b>${state.name}</b>, ${t('welcomeSub', state.uiLang)}</p>
        <input class="welcome-input" id="welcomeName" placeholder="${state.uiLang === 'he' ? 'השם שלך' : 'Your name'}" autocomplete="off" />
        <button class="welcome-go" id="welcomeGo">${t('letsBegin', state.uiLang)}</button>
        <button class="welcome-skip" id="welcomeSkip">${t('skipForNow', state.uiLang)}</button>
      </div>`;
    root.querySelector('.app')!.appendChild(ov);
    const nameInput = ov.querySelector('#welcomeName') as HTMLInputElement;
    setTimeout(() => nameInput.focus(), 350);
    const finish = (name: string) => {
      const clean = name.trim();
      if (clean) updateProfile({ name: clean });
      ov.classList.remove('show');
      setTimeout(() => ov.remove(), 400);
      const msg = clean
        ? `${greetingPrefix()}, ${clean}! ${t('niceToMeet', state.uiLang)} ${state.name} ${t('askAnything', state.uiLang)}`
        : personalGreeting();
      addMsg(msg, 'al');
      voice.speak(msg);
    };
    (ov.querySelector('#welcomeGo') as HTMLElement).onclick = () => finish(nameInput.value);
    (ov.querySelector('#welcomeSkip') as HTMLElement).onclick = () => finish('');
    nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') finish(nameInput.value); });
  }

  // ── Cloud sync status indicator ──
  function addCloudIndicator() {
    if ($('cloudIndicator')) return;
    const ind = document.createElement('button');
    ind.id = 'cloudIndicator';
    ind.title = 'סנכרון ענן';
    // Live inside the header button row (a flex row) so it never overlaps the
    // settings button — it used to be a fixed element pinned at right:220px which
    // landed on top of the gear on phones.
    ind.className = 'chip ghost';
    ind.style.cssText = 'font-size:11px;gap:5px;color:rgba(201,168,76,.7);letter-spacing:.5px;padding:0 8px;';
    ind.innerHTML = '☁ <span id="cloudStatus">לא מחובר</span>';
    ind.onclick = async () => {
      if (!puterSync.isSignedIn()) {
        sessionStorage.removeItem(LOGIN_SKIP_KEY);
        showLoginScreen();
        return;
      }
      (ind as HTMLElement).innerHTML = '🔄 <span id="cloudStatus">מסנכרן…</span>';
      const action = await puterSync.smartSync();
      if (action === 'downloaded') {
        (ind as HTMLElement).innerHTML = '✓ <span id="cloudStatus">עודכן מהענן</span>';
        setTimeout(() => location.reload(), 800);
      } else if (action === 'uploaded') {
        (ind as HTMLElement).innerHTML = '✓ <span id="cloudStatus">הועלה לענן</span>';
        setTimeout(updateCloudIndicator, 2500);
      } else {
        (ind as HTMLElement).innerHTML = '⚠ <span id="cloudStatus">שגיאה</span>';
        setTimeout(updateCloudIndicator, 2500);
      }
    };
    const topR = document.querySelector('.chrome.topR');
    if (topR) topR.appendChild(ind); else document.body.appendChild(ind);
  }

  function updateCloudIndicator() {
    const ind = $('cloudIndicator');
    if (!ind) return;
    if (puterSync.isSignedIn()) {
      const ts = puterSync.lastSyncTime();
      const ago = ts ? new Date(ts).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : '';
      ind.innerHTML = `✓ <span id="cloudStatus">${ago || 'מחובר'}</span>`;
      (ind as HTMLElement).style.borderColor = 'rgba(76,175,80,.4)';
      (ind as HTMLElement).style.color = 'rgba(76,175,80,.85)';
    } else {
      ind.innerHTML = '☁ <span id="cloudStatus">לא מחובר</span>';
      (ind as HTMLElement).style.borderColor = 'rgba(201,168,76,.25)';
      (ind as HTMLElement).style.color = 'rgba(201,168,76,.7)';
    }
  }

  // ── Login screen — shown on first open or when signed out ──
  // Uses sessionStorage so "skip" only lasts for the current browser session.
  const LOGIN_SKIP_KEY = 'alpha_login_skipped_session';
  async function showLoginScreen(): Promise<void> {
    return new Promise((resolve) => {
      const ov = document.createElement('div');
      ov.id = 'loginScreen';
      ov.style.cssText = [
        'position:fixed;inset:0;z-index:99999',
        'background:linear-gradient(135deg,#0a0806 0%,#130f07 50%,#0d0a05 100%)',
        'display:flex;flex-direction:column;align-items:center;justify-content:center',
        'padding:24px;transition:opacity .5s',
      ].join(';');
      ov.innerHTML = `
        <div style="text-align:center;max-width:360px;width:100%">
          <img src="${import.meta.env.BASE_URL}heavyguard-logo.png" alt="Alpha"
               style="height:56px;margin-bottom:8px;filter:drop-shadow(0 0 18px rgba(218,165,32,.5))" />
          <h1 style="font-size:26px;font-weight:700;color:#daa520;margin:0 0 4px;letter-spacing:2px">ALPHA</h1>
          <p style="font-size:12px;color:rgba(218,165,32,.5);letter-spacing:4px;margin:0 0 36px">העוזר האישי שלך</p>

          <div style="background:rgba(218,165,32,.06);border:1px solid rgba(218,165,32,.18);border-radius:16px;padding:28px 24px;margin-bottom:16px">
            <p style="font-size:13px;color:rgba(255,255,255,.7);margin:0 0 20px;line-height:1.7">
              התחבר עם חשבון Google כדי לשמור את הנתונים שלך ולסנכרן בין כל המכשירים
            </p>
            <button id="loginGoogleBtn" style="
              display:flex;align-items:center;justify-content:center;gap:10px;
              width:100%;padding:13px 20px;border-radius:10px;
              background:#fff;color:#1a1a1a;border:none;
              font-size:15px;font-weight:600;cursor:pointer;
              box-shadow:0 2px 12px rgba(0,0,0,.3);transition:transform .15s,box-shadow .15s
            ">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              המשך עם Google
            </button>
            <div id="loginStatus" style="font-size:11px;color:rgba(218,165,32,.7);margin-top:12px;min-height:16px;text-align:center"></div>
          </div>

          <button id="loginSkipBtn" style="
            background:none;border:none;color:rgba(255,255,255,.3);
            font-size:12px;cursor:pointer;padding:8px;text-decoration:underline
          ">המשך ללא חשבון</button>
        </div>`;

      document.body.appendChild(ov);

      const dismiss = (synced: boolean) => {
        ov.style.opacity = '0';
        setTimeout(() => { ov.remove(); resolve(); updateCloudIndicator(); }, 500);
        if (synced) sessionStorage.removeItem(LOGIN_SKIP_KEY);
      };

      (ov.querySelector('#loginGoogleBtn') as HTMLButtonElement).onclick = async () => {
        const btn = ov.querySelector('#loginGoogleBtn') as HTMLButtonElement;
        const status = ov.querySelector('#loginStatus') as HTMLElement;
        btn.disabled = true;
        btn.style.opacity = '0.7';
        status.textContent = 'מתחבר…';
        const ok = await puterSync.signIn();
        if (!ok) {
          btn.disabled = false;
          btn.style.opacity = '1';
          status.textContent = 'ההתחברות בוטלה. נסה שוב.';
          return;
        }
        status.textContent = 'מחובר! מוריד נתונים…';
        const hasCloud = await puterSync.hasCloudBackup();
        if (hasCloud) {
          const r = await puterSync.syncFromCloud(m => { status.textContent = m; });
          if (r.ok && (r.tables ?? 0) > 0) {
            status.textContent = `✓ שוחזרו ${r.tables} טבלאות`;
            setTimeout(() => dismiss(true), 900);
            setTimeout(() => location.reload(), 1500);
            return;
          }
        }
        status.textContent = '✓ מחובר — הנתונים יסתנכרנו אוטומטית';
        setTimeout(() => dismiss(true), 800);
      };

      (ov.querySelector('#loginSkipBtn') as HTMLButtonElement).onclick = () => {
        sessionStorage.setItem(LOGIN_SKIP_KEY, '1');
        dismiss(false);
      };
    });
  }

  // ── Cloud init — wait for puter.js async load, then login + sync ──
  addCloudIndicator();
  (async () => {
    const puterReady = await puterSync.waitForPuter(10_000);
    updateCloudIndicator();

    if (puterReady) {
      if (!puterSync.isSignedIn()) {
        const skippedThisSession = !!sessionStorage.getItem(LOGIN_SKIP_KEY);
        if (!skippedThisSession) {
          await showLoginScreen();
        }
      }

      if (puterSync.isSignedIn()) {
        // Smart sync: compare cloud timestamp vs local — pull if cloud is newer, push if local is newer
        const action = await puterSync.smartSync();
        // Reload once after a cloud download so the UI picks up fresh data.
        // Guard with sessionStorage: the "secondary" device role ALWAYS returns
        // 'downloaded', so without this guard the page reloads in an infinite
        // loop (download → reload → download → reload…).
        const RELOAD_GUARD = 'alpha_synced_reload_done';
        if (action === 'downloaded' && !sessionStorage.getItem(RELOAD_GUARD)) {
          sessionStorage.setItem(RELOAD_GUARD, '1');
          updateCloudIndicator();
          setTimeout(() => location.reload(), 600);
          return;
        }
        updateCloudIndicator();

        // Periodic sync every 2 min — pick up changes from other devices.
        setInterval(async () => {
          if (puterSync.isSignedIn()) {
            await puterSync.smartSync();
            updateCloudIndicator();
          }
        }, 2 * 60 * 1000);
      }
    }

    // ── Immediate upload when HeavyGuard saves (photos / installs / edits) ──
    // HeavyGuard runs in a same-origin iframe; when it writes hg2:* keys to
    // localStorage, THIS window receives a 'storage' event. Mark dirty and
    // upload (debounced) so photos and changes reach the other devices right
    // away instead of waiting for the periodic timer. 'secondary' devices only
    // download, so they don't upload here.
    let hgUploadTimer: ReturnType<typeof setTimeout> | null = null;
    window.addEventListener('storage', (e) => {
      if (!e.key || !e.key.startsWith('hg2:')) return;
      puterSync.markDirty();
      if (puterSync.getSyncRole() === 'secondary') return;
      if (hgUploadTimer) clearTimeout(hgUploadTimer);
      hgUploadTimer = setTimeout(() => {
        if (puterSync.isSignedIn()) {
          puterSync.syncToCloud().then(() => updateCloudIndicator());
        }
      }, 3500); // debounce bursts (e.g. several photos at once)
    });

    // Google Drive fallback
    if (driveSync.isConnected()) {
      const hasLocalData = localStorage.getItem('alpha_events') || localStorage.getItem('alpha_tasks') || localStorage.getItem('alpha_brain_memory_v1');
      if (!hasLocalData) {
        const r = await driveSync.syncFromCloud();
        if (r.ok && (r.tables ?? 0) > 0) { setTimeout(() => location.reload(), 500); return; }
      }
      setTimeout(() => driveSync.syncToCloud(), 30_000);
      setInterval(() => { if (driveSync.isConnected()) driveSync.syncToCloud(); }, 5 * 60 * 1000);
    }
  })();

  // ── Restore chat history ──
  const prevHistory = loadChatHistory();
  if (prevHistory.length > 0) {
    const recent = prevHistory.slice(-20);
    for (const msg of recent) {
      const label = { me: t('you', state.uiLang), al: state.name, sys: t('systemLabel', state.uiLang) }[msg.who];
      const chatEl = $('chat');
      const div = document.createElement('div');
      div.className = 'turn ' + msg.who;
      div.innerHTML = `<span class="who">${label}</span><div class="txt">${msg.text}</div>`;
      if (chatEl) chatEl.appendChild(div);
    }
    const chatEl = $('chat');
    if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
  }

  const knownName = loadMemory().profile.name;
  if (!knownName) showWelcome();
  else if (prevHistory.length === 0) addMsg(personalGreeting(), 'al');

  // (Spoken "מה המצב" entry greeting removed per user request — the app no
  //  longer speaks a greeting on entry.)

  // ── 3D Depth — perspective-based UI panel transforms (mouse only) ──
  // Skip entirely on touch / iPad / perf-lite: there's no mouse to drive the
  // parallax, so it's a constant rAF for nothing AND the perspective() transforms
  // can leave the panels looking subtly tilted/"stuck" on iPad. Mouse desktops
  // keep the effect.
  {
    const perfLite = document.documentElement.classList.contains('perf-lite');
    const isTouch = (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
    const isMob = perfLite || isTouch || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 900;
    if (!isMob) {
      let uiMX = 0, uiMY = 0;
      let uiSX = 0, uiSY = 0;
      document.addEventListener('mousemove', (e) => {
        uiMX = (e.clientX / window.innerWidth - 0.5) * 2;
        uiMY = (e.clientY / window.innerHeight - 0.5) * 2;
      });
      const lp = root.querySelector('.left-panel') as HTMLElement;
      const rp = root.querySelector('.right-panel') as HTMLElement;
      const dk = root.querySelector('.dock') as HTMLElement;
      const tl = root.querySelector('.topL') as HTMLElement;
      const tr = root.querySelector('.topR') as HTMLElement;
      function uiDepthTick() {
        uiSX += (uiMX - uiSX) * 0.06;
        uiSY += (uiMY - uiSY) * 0.06;
        const rx = uiSY * -0.8;
        const ry = uiSX * 1.2;
        if (lp) lp.style.transform = `perspective(1200px) rotateY(${ry * 0.6}deg) rotateX(${rx * 0.5}deg) translateZ(8px)`;
        if (rp) rp.style.transform = `perspective(1200px) rotateY(${ry * 0.5}deg) rotateX(${rx * 0.4}deg) translateZ(6px)`;
        if (dk) dk.style.transform = `translateX(-50%) perspective(1200px) rotateX(${rx * -1.2}deg) translateZ(12px)`;
        if (tl) tl.style.transform = `perspective(1200px) rotateY(${ry * 0.3}deg) translateZ(4px)`;
        if (tr) tr.style.transform = `perspective(1200px) rotateY(${ry * 0.3}deg) translateZ(4px)`;
        requestAnimationFrame(uiDepthTick);
      }
      requestAnimationFrame(uiDepthTick);
    }
  }
}
