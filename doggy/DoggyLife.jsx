import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Home, Dumbbell, Trees, UtensilsCrossed, ShoppingBag, BadgeCheck,
  CheckCircle2, Circle, Syringe, Calendar, MapPin, Star, Users, Plus,
  Droplets, Footprints, Bone, ChevronDown, ChevronUp, Dog, Phone,
  AlertTriangle, Leaf, Tag, Stethoscope, Clock, PartyPopper, Gift,
  Sun, Moon, Sparkles, Heart, Trophy, X, Cat, Bird, Rabbit, Fish,
  PawPrint, SlidersHorizontal, Baby, Scissors, Zap, ThermometerSun,
  HeartHandshake, BadgePercent, Lock, Copy, Siren, Camera, Share2, LifeBuoy,
  Activity, Pill, TrendingUp, Bot, Send, ImagePlus, Settings, BookOpen,
  Trash2, Search, PlusCircle
} from "lucide-react";

/* ---------- Design tokens ---------- */
const C = {
  bg: "#FAF5EC",        // sand
  card: "#FFFFFF",
  amber: "#D98E32",     // golden-retriever coat
  amberSoft: "#F7E3C4",
  pine: "#2F4A40",      // deep pine green
  pineSoft: "#DCE9E2",
  blue: "#4E8FB5",      // water blue
  blueSoft: "#DDEBF3",
  red: "#C25B4E",
  redSoft: "#F6E0DC",
  ink: "#2B2620",
  inkSoft: "#8A7F6F",
};

const DAY = 86400000;
const today = new Date();
const fmt = (d) => d.toLocaleDateString("he-IL", { day: "numeric", month: "short" });
const daysLeft = (d) => Math.ceil((d.getTime() - Date.now()) / DAY);

/* ---------- Pet profile helpers (age / weight / photo) ---------- */
// "18 חודשים" is fine for a puppy and useless for a 9-year-old dog — past a
// year we say years (plus remaining months) the way an owner actually talks.
const fmtAge = (m) => {
  const months = Math.max(0, Math.round(Number(m) || 0));
  if (months < 12) return `${months} חודשים`;
  const y = Math.floor(months / 12), r = months % 12;
  const yTxt = y === 1 ? "שנה" : y === 2 ? "שנתיים" : `${y} שנים`;
  return r ? `${yTxt} ו-${r} חודשים` : yTxt;
};
const fmtWeight = (w) => {
  const kg = Number(w) || 0;
  // a 90-gram parakeet reads as "0 ק"ג" at one decimal — small pets get grams
  return kg > 0 && kg < 1 ? `${Math.round(kg * 1000)} גרם` : `${(Math.round(kg * 10) / 10)} ק"ג`;
};

// A phone photo is 3-10MB as a raw data URL — that alone blows the ~5MB
// localStorage quota. Downscale to a 256px square thumbnail (center-cropped,
// JPEG q.82 ≈ 15-25KB) so a full roster of photos still persists comfortably.
const PHOTO_PX = 256;
function fileToAvatar(file) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) return reject(new Error("not an image"));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        try {
          const side = Math.min(img.width, img.height); // center square crop
          const cv = document.createElement("canvas");
          cv.width = cv.height = PHOTO_PX;
          const g = cv.getContext("2d");
          g.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, PHOTO_PX, PHOTO_PX);
          resolve(cv.toDataURL("image/jpeg", 0.82));
        } catch (e) { reject(e); }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const ROSTER_KEY = "doggy:roster:v1";
const loadRoster = (fallback) => {
  try {
    const raw = JSON.parse(localStorage.getItem(ROSTER_KEY) || "null");
    if (raw && Array.isArray(raw.roster) && raw.roster.length) return raw;
  } catch {}
  return { roster: fallback, activeId: fallback[0].id };
};
// Returns null on success, or a human-readable reason. A silent catch here
// would let pets vanish on reload with nothing to tell the owner why, so the
// caller surfaces the failure — and we first retry without photos, since the
// photos are the only large part and half a save beats none.
const saveRoster = (roster, activeId) => {
  const write = (r) => localStorage.setItem(ROSTER_KEY, JSON.stringify({ roster: r, activeId }));
  try { write(roster); return null; } catch (e) {
    try {
      write(roster.map((p) => ({ ...p, photo: null })));
      return "אין מספיק מקום בדפדפן לתמונות — הפרטים נשמרו, התמונות לא.";
    } catch {
      return "הדפדפן חוסם שמירה מקומית (למשל גלישה פרטית) — השינויים לא יישמרו אחרי רענון.";
    }
  }
};

/* ---------- Mock data ---------- */
const EMERGENCY = "מוקד חירום וטרינרי 24/7: *3888";

const ROSTER_INIT = [
  { id: 1, name: "לונה", emoji: "🐕", species: "כלבה", breed: "גולדן רטריבר", sex: "נקבה", ageMonths: 5, weight: 14.2, chip: "941-000-2381-556", adoptedDaysAgo: 45 },
  { id: 2, name: "מילקי", emoji: "🐈", species: "חתול", breed: "בריטי קצר שיער", sex: "זכר", ageMonths: 26, weight: 4.6, chip: "941-000-7715-020", adoptedDaysAgo: 410 },
  { id: 3, name: "קיווי", emoji: "🦜", species: "תוכי", breed: "קוקטייל", sex: "זכר", ageMonths: 38, weight: 0.09, chip: "טבעת KIWI-38", adoptedDaysAgo: 760 },
];

const SPECIES_OPTIONS = [
  { label: "כלב", emoji: "🐕" }, { label: "כלבה", emoji: "🐕" }, { label: "חתול", emoji: "🐈" }, { label: "חתולה", emoji: "🐈" },
  { label: "תוכי", emoji: "🦜" }, { label: "ארנב", emoji: "🐰" }, { label: "אוגר", emoji: "🐹" }, { label: "דג", emoji: "🐠" }, { label: "זוחל", emoji: "🦎" },
];

/* ---------- Full animal & breed index ---------- */
const ANIMAL_INDEX = [
  {
    id: "dogs", cat: "כלבים", emoji: "🐕",
    groups: [
      { g: 'קטנים (עד 10 ק"ג)', items: [
        { n: "צ'יוואווה", t: "הקטן בעולם — אישיות של ענק" }, { n: "פומרניאן", t: "כדור פרווה אנרגטי ורעשני" },
        { n: "יורקשייר טרייר", t: "פרווה משיית, כמעט לא נושר" }, { n: "מלטז", t: "רגוע, מושלם לדירה ולמבוגרים" },
        { n: "שיצו", t: "מלך הספה — רגיש לחום הישראלי" }, { n: "פודל ננסי", t: "מהחכמים בעולם, היפואלרגני" },
        { n: "פינצ'ר ננסי", t: "קטן, חד ושומר מעולה" }, { n: "פאג", t: "קומיקאי — זקוק להשגחה בקיץ" },
        { n: "ג'ק ראסל טרייר", t: "טיל אנרגיה — חייב תעסוקה" }, { n: "תחש (דשהונד)", t: "נקניקייה אמיצה — לשמור על הגב" },
      ]},
      { g: "בינוניים (10–25 ק\"ג)", items: [
        { n: "כלב כנעני", t: "הגזע הלאומי — בנוי לאקלים שלנו", tag: "ישראלי" }, { n: "ביגל", t: "אף-על — חברותי אך בורח אחרי ריחות" },
        { n: "קוקר ספנייל", t: "עדין ומשפחתי, אוזניים דורשות טיפול" }, { n: "בורדר קולי", t: "החכם בעולם — לספורטאים בלבד" },
        { n: "בולדוג צרפתי", t: "כוכב הדירות — רגיש מאוד לחום", tag: "רגיש לחום" }, { n: "בולדוג אנגלי", t: "רגוע ועקשן, נחירות מובטחות" },
        { n: "שיבא אינו", t: "עצמאי כמו חתול, נקי להפליא" }, { n: "רועה אוסטרלי", t: "יפהפה והיפראקטיבי" },
        { n: "ויזלה", t: "צל אנושי — נצמד לבעלים 24/7" }, { n: "אמסטף", t: "מסור ומחייך — דורש חינוך עקבי", tag: "רישוי מיוחד" },
      ]},
      { g: "גדולים (25 ק\"ג ומעלה)", items: [
        { n: "גולדן רטריבר", t: "כלב המשפחה האולטימטיבי" }, { n: "לברדור", t: "חבר הכי טוב + שואב אבק של אוכל" },
        { n: "רועה גרמני", t: "עבודה, נאמנות, אינטליגנציה" }, { n: "מלינואה (רועה בלגי)", t: "כלב היחידות — לא לחובבנים", tag: "מנוסים בלבד" },
        { n: "האסקי סיבירי", t: "יפה ובורח — סובל בקיץ הישראלי", tag: "רגיש לחום" }, { n: "רוטוויילר", t: "שומר עוצמתי עם לב זהב", tag: "רישוי מיוחד" },
        { n: "דוברמן", t: "אלגנטי, אתלטי ומגונן" }, { n: "בוקסר", t: "ילד נצחי — ליצן עד גיל מבוגר" },
        { n: "קאנה קורסו", t: "שומר איטלקי אדיר — יד מנוסה", tag: "רישוי מיוחד" }, { n: "דני ענק", t: "סוס עדין שחושב שהוא כלב חיק" },
        { n: "סן ברנרד", t: "הר של רוך — ריור כלול במחיר" }, { n: "סמויד", t: "ענן מחייך — פרווה בלתי נגמרת" },
      ]},
    ],
  },
  {
    id: "cats", cat: "חתולים", emoji: "🐈",
    groups: [
      { g: "פופולריים בישראל", items: [
        { n: "חתול רחוב ישראלי", t: "עמיד, חכם ואסיר תודה — אמצו!", tag: "ישראלי" }, { n: "בריטי קצר שיער", t: "דובון עגלגל ועצמאי" },
        { n: "סקוטיש פולד", t: "אוזניים מקופלות, אופי מתוק" }, { n: "פרסי", t: "אצולה — סירוק יומי חובה" },
        { n: "סיאמי", t: "דברן כרוני שדורש קהל" }, { n: "רגדול", t: "מתמסר כמו בובת סמרטוטים" },
      ]},
      { g: "מיוחדים ואקזוטיים", items: [
        { n: "מיין קון", t: "ענק עדין — עד 10 ק\"ג של פרווה" }, { n: "ספינקס", t: "עירום, חם ודביק לבעלים" },
        { n: "בנגלי", t: "נמר מיני — אנרגיה פראית" }, { n: "אביסיני", t: "אתלט סקרן שלא יורד מהארונות" },
        { n: "רוסי כחול", t: "מלכותי, ביישן ושקט" }, { n: "נורווגי (יער)", t: "ויקינג פרוותי, מטפס מעולה" },
        { n: "דבון רקס", t: "פרווה מתולתלת ואוזני שדון" }, { n: "אקזוטי קצר שיער", t: "פרסי בגרסת תחזוקה קלה" },
      ]},
    ],
  },
  {
    id: "birds", cat: "ציפורים ותוכים", emoji: "🦜",
    groups: [
      { g: "תוכיים", items: [
        { n: "תוכיון (בדג'י)", t: "הכניסה הקלאסית לעולם התוכים" }, { n: "קוקטייל", t: "שורק מנגינות ומתמסר לליטופים" },
        { n: "דררה", t: "יפהפייה — נפוצה גם בטבע הישראלי" }, { n: "קוואקר (נזירי)", t: "מדבר מצוין, בונה קנים" },
        { n: "ז'אקו (אפריקני אפור)", t: "אינטליגנציה של ילד בן 5", tag: "התחייבות 40+ שנה" },
        { n: "קקדו", t: "רגשן קולני — דורש נוכחות מלאה", tag: "התחייבות 40+ שנה" },
        { n: "ארה (מקאו)", t: "קשת בענן ענקית ורועשת", tag: "דורש היתר" }, { n: "לוריקיט", t: "צבעוני ושתיין צוף" },
      ]},
      { g: "ציפורי שיר וחצר", items: [
        { n: "קנרית", t: "זמר האופרה של הכלוב" }, { n: "פינק זברה", t: "צפצוף עליז — חיים בזוגות" },
        { n: "אהבנית (Lovebird)", t: "רומנטיקן צבעוני וקנאי" }, { n: "יונה ביתית", t: "שקטה, נאמנה וקלה לגידול" },
      ]},
    ],
  },
  {
    id: "small", cat: "מכרסמים וקטנים", emoji: "🐹",
    groups: [
      { g: "מכרסמים", items: [
        { n: "אוגר סורי", t: "סוליסט לילי — חיה ראשונה מושלמת" }, { n: "אוגר ננסי (רוברובסקי)", t: "טורבו זעיר — לצפייה יותר מלמשחק" },
        { n: "חולדת מחמד", t: "חכמה, חברותית ולומדת טריקים" }, { n: "גרביל", t: "חופר אנרגטי — חיים בזוגות" },
        { n: "שרקן (קביה)", t: "מצפצף כשרואה אתכם — צריך ויטמין C" }, { n: "צ'ינצ'ילה", t: "הפרווה הרכה בעולם — רגישה לחום", tag: "רגיש לחום" },
      ]},
      { g: "יונקים קטנים", items: [
        { n: "ארנבון ננסי", t: "שקט ומתוק — צריך מרחב ריצה" }, { n: "ארנב הולנדי", t: "דו-צבעי וסבלני לילדים" },
        { n: "קיפוד פיגמי אפריקני", t: "כדור קוצים לילי ומצחיק", tag: "דורש היתר" },
        { n: "חמוס (פרט)", t: "שובב בלתי נלאה", tag: "דורש היתר" },
      ]},
    ],
  },
  {
    id: "reptiles", cat: "זוחלים", emoji: "🦎", note: "בישראל חלק מהזוחלים דורשים היתר החזקה מרשות הטבע והגנים",
    groups: [
      { g: "לטאות", items: [
        { n: "דרקון מזוקן", t: "רגוע ואוהב אינטראקציה — המומלץ למתחילים" }, { n: "גקו נמרי", t: "חייכן לילי, תחזוקה קלה" },
        { n: "גקו משוריין (Crested)", t: "אקרובט ללא צורך בחימום מיוחד" }, { n: "איגואנה ירוקה", t: "גדלה ל-1.5 מטר!", tag: "דורש היתר" },
      ]},
      { g: "נחשים וצבים", items: [
        { n: "נחש תירס", t: "עדין וצבעוני — נחש ראשון קלאסי", tag: "דורש היתר" }, { n: "פיתון מלכותי", t: "רגוע ומתכדרר", tag: "דורש היתר" },
        { n: "צב מים (אדום-אוזן)", t: "חי עשרות שנים — לא לשחרר לטבע!", tag: "אסור לשחרר" },
        { n: "צב יבשה", t: "מוגן בישראל — רק עם היתר מסודר", tag: "מוגן — היתר בלבד" },
      ]},
    ],
  },
  {
    id: "fish", cat: "דגים ואקווריום", emoji: "🐠",
    groups: [
      { g: "מים מתוקים", items: [
        { n: "דג זהב", t: "זקוק לאקווריום אמיתי, לא קערה" }, { n: "גופי", t: "צבעוני ומתרבה בטירוף" },
        { n: "בטא (לוחם סיאמי)", t: "יפהפה — אך גר לבד" }, { n: "נאון טטרה", t: "ניאון כחול בלהקות" },
        { n: "סקלר (אנג'ל)", t: "אציל שקט של האקווריום" }, { n: "קוריידורס", t: "שואב הרצפה החרוץ" },
      ]},
      { g: "בריכות נוי", items: [
        { n: "קוי", t: "מלך הבריכה — חי עשרות שנים" }, { n: "שבוט (קומט)", t: "זנב שביט לבריכה ביתית" },
      ]},
    ],
  },
  {
    id: "farm", cat: "חצר ומשק", emoji: "🐔",
    groups: [
      { g: "עופות חצר", items: [
        { n: "תרנגולת (ברהמה/לגהורן)", t: "ביצים טריות כל בוקר" }, { n: "ברווז ביתי", t: "שומר מפני חלזונות — צריך מקווה מים" },
        { n: "שליו יפני", t: "ביצי שליו במרפסת" },
      ]},
      { g: "מכוסות פרווה", items: [
        { n: "עז ננסית (קמרונית)", t: "מכסחת דשא עם אישיות" }, { n: "כבשה ננסית", t: "פרוותית ורגועה — בזוגות" },
        { n: "חזיר ננסי (מיני-פיג)", t: "חכם ככלב — 'ננסי' זה יחסי", tag: "דורש היתר" },
      ]},
    ],
  },
];

const FIRST_WEEK_INIT = [
  { id: 1, text: "קניית כלוב לינה (Crate) בגודל מתאים", done: true },
  { id: 2, text: "אבטחת הבית — הרחקת כבלים, נעליים וצמחים רעילים", done: true },
  { id: 3, text: "קערות אוכל ומים נפרדות + מזון גורים איכותי", done: true },
  { id: 4, text: "קביעת תור ראשון לווטרינר", done: false },
  { id: 5, text: "רצועה, קולר ותג שם עם טלפון", done: false },
  { id: 6, text: "רישום שבב בעירייה + רישיון כלב", done: false },
  { id: 7, text: "פינת שינה קבועה ושקטה", done: false },
];

const VACCINES_INIT = [
  { id: 1, name: "משושה — מנה שלישית", date: new Date(Date.now() + 6 * DAY), done: false, place: "מרפאת ארבע רגליים" },
  { id: 2, name: "חיסון כלבת + רישום שבב", date: new Date(Date.now() + 34 * DAY), done: false, place: "וטרינר עירוני" },
  { id: 3, name: "טיפול נגד תולעים", date: new Date(Date.now() + 12 * DAY), done: false, place: "בבית — טבליה" },
  { id: 4, name: "משושה — מנה שנייה", date: new Date(Date.now() - 22 * DAY), done: true, place: "מרפאת ארבע רגליים" },
];

const TRAINING = [
  {
    id: "potty", title: "חינוך לצרכים", icon: "🚽", level: "בסיס", time: "2–4 שבועות",
    steps: [
      "הוציאו את הגור כל שעתיים, מיד אחרי אוכל, שינה ומשחק",
      "בחרו פינה קבועה בחוץ — הריח מלמד אותו שזה 'המקום'",
      "חגגו הצלחה תוך 2 שניות: חטיף + מילת שבח קבועה",
      "תאונה בבית? לנקות בשקט עם חומר מפרק ריח, בלי עונש",
      "נהלו יומן: רוב הגורים מתאפקים שעה על כל חודש גיל",
    ],
  },
  {
    id: "sit", title: '"שב" — הפקודה הראשונה', icon: "🪑", level: "בסיס", time: "3–5 ימים",
    steps: [
      "החזיקו חטיף מול האף והזיזו לאט מעל הראש לאחור",
      "כשהישבן נוגע ברצפה — אמרו 'שב' ותנו את החטיף",
      "חזרו 5–8 פעמים, לא יותר מ-5 דקות בכל אימון",
      "הוסיפו סימן יד (כף פתוחה כלפי מעלה)",
      "תרגלו במקומות שונים: סלון, גינה, רחוב",
    ],
  },
  {
    id: "leash", title: "הליכה ברצועה רפויה", icon: "🦮", level: "מתקדם", time: "2–6 שבועות",
    steps: [
      "התחילו בבית: תנו לגור להתרגל לקולר ולרצועה במשחק",
      "הרצועה נמתחת? עצרו במקום. ממשיכים רק כשהיא רפויה",
      "תגמלו הליכה לצידכם בחטיפים בגובה הברך",
      "שנו כיוון בפתאומיות — הכלב לומד להסתכל עליכם",
      "הליכות קצרות ומוצלחות עדיפות על ארוכות ומתסכלות",
    ],
  },
  {
    id: "recall", title: '"אליי!" — קריאה חזרה', icon: "📣", level: "מתקדם", time: "מתמשך",
    steps: [
      "התחילו בבית במרחק 2 מטר עם חטיף שווה במיוחד",
      "אף פעם אל תקראו 'אליי' כדי להעניש או לסיים כיף",
      "הגדילו מרחק והסחות דעת בהדרגה (חצר → גינה → פארק)",
      "השתמשו ברצועה ארוכה (10 מ') בשטח פתוח",
      "מדי פעם: קריאה → חטיף → שחרור חזרה למשחק",
    ],
  },
];

const PARKS_INIT = [
  { id: 1, name: "גינת הכלבים — פארק ענבה", dist: "1.2 ק\"מ", rating: 4.7, dogs: 8, features: ["מגודר", "ברזיית מים", "תאורת לילה"] },
  { id: 2, name: "פארק הכלבים ברחוב יהלום", dist: "2.0 ק\"מ", rating: 4.3, dogs: 3, features: ["מגודר", "צל", "פינת גורים"] },
  { id: 3, name: "שטח פתוח — יער בן שמן", dist: "6.5 ק\"מ", rating: 4.9, dogs: 12, features: ["מסלולי הליכה", "ללא גדר", "חניה"] },
];

const GROUPS_INIT = [
  { id: 1, name: "מועדון הגולדנים של המרכז", members: 42, when: "שבת 08:00, פארק ענבה", joined: false },
  { id: 2, name: "טיולי בוקר לגורים (עד שנה)", members: 17, when: "ג'+ה' 07:00", joined: true },
  { id: 3, name: "כלבי ערב — הליכת שקיעה", members: 28, when: "כל יום 18:30", joined: false },
];

const FOOD_SHARE_INIT = [
  { id: 1, title: "שק מזון גורים 7 ק\"ג — פתוח, נשאר חצי", note: "לונה עברה למותג אחר. איסוף עצמי", user: "מיכל · בוכמן", price: "חינם", claimed: false, tag: "מזון יבש" },
  { id: 2, title: "שימורי כבש לגורים ×6", note: "הכלב שלנו אלרגי, לא נפתחו", user: "דני · הפארק", price: "20 ₪", claimed: false, tag: "שימורים" },
  { id: 3, title: "חטיפי אילוף עוף — 3 שקיות", note: "קנינו מארז גדול מדי", user: "נועה · מכבים", price: "החלפה", claimed: true, tag: "חטיפים" },
];

const TOXIC = ["שוקולד", "ענבים וצימוקים", "בצל ושום", "אבוקדו", "קסיליטול (מסטיקים)", "עצמות מבושלות", "אלכוהול וקפאין", "בצק שמרים"];
const HEALTHY = ["גזר", "תפוח (בלי גרעינים)", "אורז מבושל", "דלעת", "עוף מבושל ללא תיבול", "בטטה", "מלפפון", "אבטיח (בלי גרעינים)"];

const SHOPS = [
  { id: 1, name: "פטשופ ארבע רגליים", dist: "900 מ'", rating: 4.8, note: "ייעוץ תזונה חינם" },
  { id: 2, name: "אנימל סנטר — קניון עזריאלי", dist: "2.4 ק\"מ", rating: 4.2, note: "מבצעי מועדון" },
  { id: 3, name: "החווה של רקסי", dist: "4.1 ק\"מ", rating: 4.6, note: "מזון בתפזורת" },
];

const PRICE_DATA = {
  "מזון יבש לגורים (12 ק\"ג)": [
    { shop: "פטשופ ארבע רגליים", price: 289 },
    { shop: "אנימל סנטר", price: 319 },
    { shop: "החווה של רקסי", price: 264 },
    { shop: "אונליין — משלוח", price: 275 },
  ],
  "אמפולה נגד פרעושים וקרציות": [
    { shop: "פטשופ ארבע רגליים", price: 74 },
    { shop: "אנימל סנטר", price: 69 },
    { shop: "החווה של רקסי", price: 82 },
    { shop: "אונליין — משלוח", price: 61 },
  ],
  "חטיפי אילוף (500 ג')": [
    { shop: "פטשופ ארבע רגליים", price: 32 },
    { shop: "אנימל סנטר", price: 29 },
    { shop: "החווה של רקסי", price: 27 },
    { shop: "אונליין — משלוח", price: 35 },
  ],
};

/* ---------- Breed & pet matching data ----------
   Scales 1–3: space=כמה מרחב דרושים, energy=רמת אנרגיה, kids=התאמה לילדים,
   beginner=התאמה לבעלים ראשונים, heat=עמידות לאקלים הישראלי, groom=עומס טיפוח */
const SPECIES = [
  { id: "dog", label: "כלבים", emoji: "🐕" },
  { id: "cat", label: "חתולים", emoji: "🐈" },
  { id: "other", label: "קטנים ואחרים", emoji: "🐹" },
];

const PETS = {
  dog: [
    { name: "מעורב מאימוץ (עמותות)", emoji: "🐕", size: "משתנה", energy: 2, space: 2, kids: 3, beginner: 3, heat: 3, groom: 1, life: "10–15 שנים", note: "הבחירה הישראלית הנפוצה ביותר — בריאים, עמידים, ומצילים חיים" },
    { name: "כלב כנעני", emoji: "🐕‍🦺", size: "בינוני", energy: 3, space: 2, kids: 2, beginner: 2, heat: 3, groom: 1, life: "12–15 שנים", note: "הגזע הלאומי של ישראל — נאמן, ערני, בנוי לחום המקומי" },
    { name: "גולדן רטריבר", emoji: "🦮", size: "גדול", energy: 3, space: 3, kids: 3, beginner: 3, heat: 2, groom: 3, life: "10–12 שנים", note: "כלב המשפחה הקלאסי — סבלני, אוהב מים, נושר הרבה" },
    { name: "לברדור", emoji: "🐶", size: "גדול", energy: 3, space: 3, kids: 3, beginner: 3, heat: 2, groom: 2, life: "10–12 שנים", note: "חברותי וקל לאילוף — צריך הרבה תנועה ותשומת לב למשקל" },
    { name: "שיצו", emoji: "🐩", size: "קטן", energy: 1, space: 1, kids: 2, beginner: 3, heat: 1, groom: 3, life: "13–16 שנים", note: "מלך הדירות הקטנות — רגיש לחום, דורש תספורות קבועות" },
    { name: "פודל ננסי", emoji: "🐩", size: "קטן", energy: 2, space: 1, kids: 2, beginner: 2, heat: 2, groom: 3, life: "14–17 שנים", note: "חכם במיוחד וכמעט לא נושר — מתאים לאלרגיים" },
    { name: "ביגל", emoji: "🐶", size: "בינוני", energy: 3, space: 2, kids: 3, beginner: 2, heat: 2, groom: 1, life: "12–15 שנים", note: "עליז וחברותי — האף שולט בו, חובה גדר וריצות" },
    { name: "רועה גרמני", emoji: "🐕‍🦺", size: "גדול", energy: 3, space: 3, kids: 2, beginner: 1, heat: 2, groom: 3, life: "9–13 שנים", note: "אינטליגנטי ומסור — דורש בעלים מנוסים והעסקה יומית" },
    { name: "מלטז", emoji: "🐶", size: "קטן", energy: 1, space: 1, kids: 2, beginner: 3, heat: 2, groom: 2, life: "13–16 שנים", note: "קטן, שקט יחסית ומתאים מאוד לחיי דירה ומבוגרים" },
  ],
  cat: [
    { name: "חתול רחוב ישראלי (מעורב)", emoji: "🐈", size: "בינוני", energy: 2, space: 1, kids: 3, beginner: 3, heat: 3, groom: 1, life: "13–18 שנים", note: "עמיד, בריא וחכם — אימוץ מהרחוב או מעמותה מציל חיים" },
    { name: "בריטי קצר שיער", emoji: "🐱", size: "בינוני", energy: 1, space: 1, kids: 3, beginner: 3, heat: 2, groom: 2, life: "14–20 שנים", note: "רגוע ועצמאי — 'דובון' שמסתדר לבד בשעות העבודה" },
    { name: "רגדול", emoji: "😺", size: "גדול", energy: 1, space: 2, kids: 3, beginner: 3, heat: 1, groom: 3, life: "12–17 שנים", note: "רך ומחבק כמו בובה — פרווה ארוכה שדורשת סירוק" },
    { name: "סיאמי", emoji: "🐈‍⬛", size: "בינוני", energy: 3, space: 2, kids: 2, beginner: 2, heat: 3, groom: 1, life: "15–20 שנים", note: "ווקאלי ודברן — נקשר חזק ולא אוהב להישאר לבד" },
    { name: "סקוטיש פולד", emoji: "🐱", size: "בינוני", energy: 1, space: 1, kids: 3, beginner: 3, heat: 2, groom: 2, life: "11–14 שנים", note: "אוזניים מקופלות ואופי מתוק — לבדוק מוצא בריא" },
    { name: "ספינקס", emoji: "🐈", size: "בינוני", energy: 2, space: 1, kids: 2, beginner: 2, heat: 2, groom: 3, life: "9–15 שנים", note: "ללא פרווה אך דורש רחצה — חם, דביק ואוהב אנשים" },
  ],
  other: [
    { name: "ארנבון ננסי", emoji: "🐰", size: "קטן", energy: 2, space: 1, kids: 2, beginner: 2, heat: 1, groom: 2, life: "8–12 שנים", note: "שקט וחמוד — רגיש מאוד לחום, חובה מרחב מחוץ לכלוב" },
    { name: "אוגר סורי", emoji: "🐹", size: "זעיר", energy: 2, space: 1, kids: 2, beginner: 3, heat: 2, groom: 1, life: "2–3 שנים", note: "חיית מחמד ראשונה קלאסית — פעיל בלילה, חי לבד" },
    { name: "שרקן (קביה)", emoji: "🐹", size: "קטן", energy: 2, space: 1, kids: 3, beginner: 3, heat: 1, groom: 2, life: "5–7 שנים", note: "חברותי ומצפצף — חיים בזוגות, צריכים ויטמין C" },
    { name: "תוכי קוקטייל", emoji: "🦜", size: "קטן", energy: 3, space: 1, kids: 2, beginner: 2, heat: 2, groom: 1, life: "15–25 שנים", note: "שר, שורק ונקשר — התחייבות ארוכת שנים והרבה קשב" },
    { name: "דגי גופי / זהב", emoji: "🐠", size: "זעיר", energy: 1, space: 1, kids: 3, beginner: 3, heat: 3, groom: 1, life: "2–5 שנים", note: "כניסה עדינה לעולם החיות — אקווריום מסונן, לא קערה" },
    { name: "תרנגולות חצר", emoji: "🐔", size: "בינוני", energy: 2, space: 3, kids: 3, beginner: 2, heat: 2, groom: 1, life: "5–10 שנים", note: "טרנד ישראלי — ביצים טריות, מתאים רק לבית עם חצר" },
  ],
};

const scale3 = (n, full, empty = "·") => full.repeat(n) + empty.repeat(3 - n);

/* ---------- NGOs & donor club (mock) ---------- */
const ORGS = [
  { id: 1, emoji: "🏥", name: "אגודת צער בעלי חיים בישראל", city: "תל אביב", since: 1927, focus: ["מקלט וקליטה", "בית חולים וטרינרי", "אימוץ"], desc: "העמותה הוותיקה בארץ — מפעילה מקלט ענק וקליניקה מסובסדת לחיות של משפחות מעוטות יכולת" },
  { id: 2, emoji: "🐾", name: "תנו לחיות לחיות", city: "ראשון לציון", since: 1986, focus: ["הצלה מהשטח", "חקיקה ואכיפה", "עיקור וסירוס"], desc: "מובילה מבצעי הצלה, קו חירום ארצי ומאבקים ציבוריים למען זכויות בעלי חיים" },
  { id: 3, emoji: "🆘", name: "SOS חיות", city: "כפר רות (ליד מודיעין)", since: 2000, focus: ["כפר אימוץ", "שיקום", "חינוך"], desc: "כפר החיות הגדול בישראל — מאות כלבים וחתולים ממתינים לבית חם, ממש ליד הבית שלכם" },
  { id: 4, emoji: "🐈", name: "עמותת חתולי רחוב (TNR)", city: "ארצי", since: 2008, focus: ["עיקור והחזרה", "האכלה מוסדרת", "מושבות חתולים"], desc: "מטפלת באוכלוסיית חתולי הרחוב בשיטת לכידה-עיקור-החזרה ומלווה מאכילים בשכונות" },
];

const AMOUNTS = [20, 50, 100];

const BENEFITS = [
  { id: 1, icon: "🩺", name: 'מרפאת "ארבע רגליים"', kind: "וטרינר", deal: "15% הנחה על ביקורים וחיסונים", code: "PAW-VET-15" },
  { id: 2, icon: "🏪", name: "פטשופ ארבע רגליים", kind: "חנות", deal: "10% הנחה קבועה על מזון", code: "PAW-FOOD-10" },
  { id: 3, icon: "🛁", name: 'מספרת כלבים "פרווה"', kind: "טיפוח", deal: "רחצה שנייה חינם בכל חודש", code: "PAW-SPA-2X1" },
  { id: 4, icon: "🏨", name: 'פנסיון "חופשה על ארבע"', kind: "פנסיון", deal: "לילה רביעי מתנה", code: "PAW-STAY-4TH" },
  { id: 5, icon: "🚑", name: "מוקד חירום וטרינרי", kind: "חירום", deal: "פטור מדמי פתיחת קריאה בלילה", code: "PAW-ER-FREE" },
];

/* ---------- SOS: reporting & rescue (mock) ---------- */
const REPORT_CATS = [
  { id: "abuse", label: "התעללות / הזנחה", emoji: "🚨" },
  { id: "injured", label: "חיה פצועה", emoji: "🩹" },
  { id: "car", label: "כלב נעול ברכב בחום", emoji: "🚗" },
  { id: "poison", label: "חשד להרעלה", emoji: "☠️" },
  { id: "stuck", label: "חתול / חיה תקועה", emoji: "🐈" },
  { id: "stray", label: "משוטטת וזקוקה לעזרה", emoji: "🐕" },
];

const RECIPIENTS = [
  { id: "police", label: "משטרת ישראל (יחידת עבירות בבע\"ח)", emoji: "👮" },
  { id: "ngo", label: "מוקד עמותה — תנו לחיות לחיות", emoji: "🐾" },
  { id: "vet", label: "וטרינר עירוני / מוקד 106", emoji: "🏛️" },
];

const HOTLINES = [
  { name: "משטרה — סכנה מיידית", num: "100", real: true },
  { name: "מוקד עירוני", num: "106", real: true },
  { name: "קו חירום עמותה (הדגמה)", num: "*4553", real: false },
  { name: "וטרינר חירום 24/7 (הדגמה)", num: "*3888", real: false },
];

const FIRST_AID = [
  {
    id: "heat", title: "מכת חום", emoji: "🥵",
    steps: ["מעבירים מיד לצל או למקום ממוזג", "מרטיבים בהדרגה במים פושרים (לא קרח!) — כפות, בטן, בתי שחי", "מציעים מעט מים לשתייה, לא בכפייה", "נוסעים לווטרינר גם אם נראה שיפור — נזק פנימי לא נראה לעין"],
  },
  {
    id: "road", title: "חיה פצועה בכביש", emoji: "🚧",
    steps: ["קודם כל בטיחות שלכם — אורות חירום, משולש אזהרה", "מתקרבים לאט מהצד, חיה פצועה עלולה לנשוך מפחד", "מכסים בבד או מגבת ומרימים על משטח קשיח", "לא נותנים אוכל או מים — נוסעים ישר לווטרינר"],
  },
  {
    id: "carlock", title: "כלב נעול ברכב חם", emoji: "🚗",
    steps: ["מתעדים: צילום הרכב, לוחית רישוי, שעה", "מבררים בחנויות בסביבה אם מכירים את הבעלים (כריזה)", "מתקשרים מיד 100 — לרכב מתחמם דקות ספורות מסכנות חיים", "נשארים ליד הרכב עד הגעת כוחות"],
  },
  {
    id: "poison", title: "חשד להרעלה", emoji: "☠️",
    steps: ["לא גורמים להקאה בלי הנחיית וטרינר!", "אוספים דגימה מהחומר/ההקאה בשקית", "מתקשרים לווטרינר בדרך — כל דקה קריטית", "מדווחים גם לווטרינר העירוני — פתיונות מסכנים חיות נוספות"],
  },
];

/* ---------- Health journal (mock) ---------- */
const WEIGHTS_INIT = [
  { d: 42, kg: 9.8 }, { d: 35, kg: 10.9 }, { d: 28, kg: 11.8 },
  { d: 21, kg: 12.6 }, { d: 14, kg: 13.3 }, { d: 7, kg: 13.8 }, { d: 1, kg: 14.2 },
].map((w) => ({ date: new Date(Date.now() - w.d * DAY), kg: w.kg }));

const CARE_INIT = [
  { id: "flea", name: "אמפולה נגד פרעושים וקרציות", emoji: "🕷️", everyDays: 30, last: new Date(Date.now() - 24 * DAY) },
  { id: "worm", name: "טיפול נגד תולעים", emoji: "🪱", everyDays: 90, last: new Date(Date.now() - 78 * DAY) },
  { id: "ears", name: "ניקוי אוזניים", emoji: "👂", everyDays: 14, last: new Date(Date.now() - 16 * DAY) },
  { id: "nails", name: "גזירת ציפורניים", emoji: "💅", everyDays: 21, last: new Date(Date.now() - 10 * DAY) },
];

const MOODS = [
  { id: "great", label: "אנרגטית ושמחה", emoji: "🤩" },
  { id: "ok", label: "רגילה", emoji: "🙂" },
  { id: "low", label: "עייפה / רדומה", emoji: "😴" },
  { id: "sick", label: "משהו לא כשורה", emoji: "🤒" },
];


/* ---------- Small UI helpers ---------- */
const Ring = ({ pct, size = 44, stroke = 5, color = C.amber, track = "rgba(255,255,255,.22)", label }) => {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(pct, 100) / 100)} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .7s cubic-bezier(.2,.7,.3,1)" }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-[12px] text-white">{label}</span>
    </div>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-[#EFE6D6] shadow-[0_2px_10px_rgba(90,70,40,0.06)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_12px_32px_rgba(90,70,40,0.13)] ${className}`}>{children}</div>
);

// One avatar for the whole app: a real profile photo when the owner uploaded
// one, the species emoji otherwise — so header, switcher and roster list all
// stay in sync automatically instead of each re-deciding.
const PetAvatar = ({ pet, size = 44, radius = 16, fontScale = 0.52, className = "", style = {} }) => (
  <span className={`inline-flex items-center justify-center overflow-hidden shrink-0 ${className}`}
    style={{ width: size, height: size, borderRadius: radius, background: pet.photo ? "#EFE6D6" : C.amberSoft, ...style }}>
    {pet.photo
      ? <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" style={{ display: "block" }} />
      : <span style={{ fontSize: Math.round(size * fontScale), lineHeight: 1 }}>{pet.emoji}</span>}
  </span>
);

const SectionTitle = ({ icon: Icon, children, extra }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: C.pineSoft }}>
        <Icon size={16} style={{ color: C.pine }} />
      </span>
      <h2 className="font-display text-[16px]" style={{ color: C.ink }}>{children}</h2>
    </div>
    {extra}
  </div>
);

const Chip = ({ children, tone = "pine" }) => {
  const map = { pine: [C.pineSoft, C.pine], amber: [C.amberSoft, "#9A6215"], blue: [C.blueSoft, C.blue], red: [C.redSoft, C.red] };
  const [bg, fg] = map[tone];
  return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: bg, color: fg }}>{children}</span>;
};

const Stars = ({ value }) => (
  <span className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={12} fill={i <= Math.round(value) ? C.amber : "none"} style={{ color: C.amber }} />
    ))}
    <span className="text-[11px] font-bold mr-1" style={{ color: C.inkSoft }}>{value}</span>
  </span>
);

const ProgressBar = ({ pct, color = C.amber }) => (
  <div className="h-2 rounded-full w-full" style={{ background: "#F1EADC" }}>
    <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
  </div>
);

/* ---------- Main App ---------- */
export default function DoggyLife() {
  const [tab, setTab] = useState("home");

  /* Multi-pet roster — persisted, so uploaded photos and edited ages/weights
     survive a reload instead of resetting to the demo animals every visit */
  const [persisted] = useState(() => loadRoster(ROSTER_INIT));
  const [roster, setRoster] = useState(persisted.roster);
  const [activeId, setActiveId] = useState(persisted.activeId);
  const [saveWarn, setSaveWarn] = useState("");
  useEffect(() => { setSaveWarn(saveRoster(roster, activeId) || ""); }, [roster, activeId]);
  const P = roster.find((p) => p.id === activeId) ?? roster[0];
  const fem = P.sex === "נקבה";
  const petAdoptionDate = new Date(Date.now() - P.adoptedDaysAgo * DAY);
  const petDays = P.adoptedDaysAgo;
  const isDog = P.species.includes("כלב");

  /* Settings */
  const [vet, setVet] = useState({ name: 'ד"ר יעל ברק — מרפאת "ארבע רגליים"', phone: "08-926-4411" });
  const [notifDaily, setNotifDaily] = useState(true);
  const [notifVax, setNotifVax] = useState(true);
  const [notifCommunity, setNotifCommunity] = useState(false);
  const [motionOff, setMotionOff] = useState(false);
  const NEW_PET_INIT = { name: "", species: SPECIES_OPTIONS[0], breed: "", years: "", months: "", weight: "", photo: null };
  const [newPet, setNewPet] = useState(NEW_PET_INIT);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoErr, setPhotoErr] = useState("");
  const [editId, setEditId] = useState(null); // which roster row has its edit panel open

  // years + months inputs → the single ageMonths the rest of the app uses
  const toAgeMonths = (years, months) =>
    Math.max(0, Math.round((Number(years) || 0) * 12 + (Number(months) || 0)));

  const pickPhoto = async (file, apply) => {
    if (!file) return;
    setPhotoErr(""); setPhotoBusy(true);
    try { apply(await fileToAvatar(file)); }
    catch { setPhotoErr("לא הצלחנו לקרוא את התמונה — נסו קובץ תמונה אחר"); }
    finally { setPhotoBusy(false); }
  };

  const addPet = () => {
    if (!newPet.name.trim()) return;
    const id = Date.now();
    const ageMonths = toAgeMonths(newPet.years, newPet.months);
    setRoster((r) => [...r, {
      id, name: newPet.name.trim(), emoji: newPet.species.emoji, species: newPet.species.label,
      breed: newPet.breed.trim() || "מעורב", sex: /ה$/.test(newPet.species.label) ? "נקבה" : "זכר",
      ageMonths: ageMonths || 6,
      weight: Number(newPet.weight) > 0 ? Number(newPet.weight) : 5,
      photo: newPet.photo || null,
      chip: "941-" + String(id).slice(-9), adoptedDaysAgo: 0,
    }]);
    setActiveId(id);
    setNewPet(NEW_PET_INIT);
    setPhotoErr("");
  };
  const updatePet = (id, patch) => setRoster((r) => r.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const removePet = (id) => {
    if (roster.length <= 1) return;
    setRoster((r) => r.filter((p) => p.id !== id));
    if (activeId === id) setActiveId(roster.find((p) => p.id !== id).id);
    if (editId === id) setEditId(null);
  };

  /* Animal index */
  const [idxSearch, setIdxSearch] = useState("");
  const [openCat, setOpenCat] = useState("dogs");

  /* Dashboard */
  const [firstWeek, setFirstWeek] = useState(FIRST_WEEK_INIT);
  const [vaccines, setVaccines] = useState(VACCINES_INIT);

  /* Training + routine */
  const [openModule, setOpenModule] = useState(null);
  const [stepDone, setStepDone] = useState({}); // {moduleId: Set-like obj}
  const [meals, setMeals] = useState({ morning: true, evening: false });
  const [walks, setWalks] = useState([true, false, false]);
  const [water, setWater] = useState(false);

  /* Parks + community */
  const [parks, setParks] = useState(PARKS_INIT);
  const [checkedIn, setCheckedIn] = useState(null);
  const [groups, setGroups] = useState(GROUPS_INIT);
  const [newGroup, setNewGroup] = useState("");
  const [showGroupForm, setShowGroupForm] = useState(false);

  /* Food share */
  const [listings, setListings] = useState(FOOD_SHARE_INIT);
  const [newListing, setNewListing] = useState("");
  const [knowledgeTab, setKnowledgeTab] = useState("toxic");

  /* Shops */
  const [product, setProduct] = useState(Object.keys(PRICE_DATA)[0]);

  /* Breed & pet matcher */
  const [species, setSpecies] = useState("dog");
  const [prefs, setPrefs] = useState({ home: 2, activity: 2, kids: true, firstTime: true });
  const [openBreed, setOpenBreed] = useState(null);

  const matchScore = (p) => {
    let s = 0, max = 0;
    // מרחב מגורים
    max += 30;
    s += prefs.home >= p.space ? 30 : prefs.home === p.space - 1 ? 14 : 2;
    // רמת פעילות
    max += 30;
    const d = Math.abs(p.energy - prefs.activity);
    s += d === 0 ? 30 : d === 1 ? 17 : 4;
    // ילדים בבית
    if (prefs.kids) { max += 20; s += [0, 4, 12, 20][p.kids]; }
    // ניסיון קודם
    if (prefs.firstTime) { max += 20; s += [0, 4, 12, 20][p.beginner]; }
    // בונוס אקלים ישראלי
    max += 10; s += [0, 2, 6, 10][p.heat];
    return Math.round((s / max) * 100);
  };

  const ranked = useMemo(
    () => PETS[species].map((p) => ({ ...p, score: matchScore(p) })).sort((a, b) => b.score - a.score),
    [species, prefs]
  );

  /* Donations & donor club */
  const [donations, setDonations] = useState({ 3: 50 }); // orgId -> monthly ₪ (SOS חיות כבר פעיל לדוגמה)
  const [pickAmount, setPickAmount] = useState({});      // orgId -> selected amount before confirm
  const [revealedCode, setRevealedCode] = useState(null);
  const monthlyTotal = Object.values(donations).reduce((a, b) => a + b, 0);
  const isDonor = monthlyTotal > 0;

  const setStandingOrder = (orgId) => {
    const amt = pickAmount[orgId] ?? AMOUNTS[1];
    setDonations((d) => ({ ...d, [orgId]: amt }));
  };
  const cancelStandingOrder = (orgId) =>
    setDonations((d) => { const n = { ...d }; delete n[orgId]; return n; });

  /* SOS reporting */
  const [repCat, setRepCat] = useState(null);
  const [repUrgency, setRepUrgency] = useState("urgent");
  const [repDesc, setRepDesc] = useState("");
  const [repLoc, setRepLoc] = useState(true);
  const [repPhoto, setRepPhoto] = useState(false);
  const [repTo, setRepTo] = useState({ police: false, ngo: true, vet: true });
  const [reports, setReports] = useState([
    { id: "SOS-2481", cat: "injured", urgency: "urgent", desc: "חתול צולע ליד גן המשחקים ברח' עמק זבולון", to: ["ngo", "vet"], status: "בטיפול — צוות בדרך", time: "אתמול 18:42", photo: true },
  ]);
  const [sharedId, setSharedId] = useState(null);
  const [openAid, setOpenAid] = useState(null);

  const submitReport = () => {
    if (!repCat) return;
    const id = "SOS-" + Math.floor(2500 + Math.random() * 7000);
    setReports((r) => [{
      id, cat: repCat, urgency: repUrgency, desc: repDesc.trim() || "ללא תיאור — צורף מיקום",
      to: Object.keys(repTo).filter((k) => repTo[k]),
      status: "נשלח ✓ · ממתין לשיבוץ", time: "עכשיו", photo: repPhoto,
    }, ...r]);
    setRepCat(null); setRepDesc(""); setRepPhoto(false); setRepUrgency("urgent");
  };

  /* Health journal */
  const [weights, setWeights] = useState(WEIGHTS_INIT);
  const [newKg, setNewKg] = useState("");
  const [care, setCare] = useState(CARE_INIT);
  const [moodToday, setMoodToday] = useState(null);
  const [healthNote, setHealthNote] = useState("");
  const [healthLog, setHealthLog] = useState([
    { id: 1, mood: "great", note: "רצה בפארק חצי שעה בלי להתעייף", time: "אתמול" },
  ]);

  const addWeight = () => {
    const kg = parseFloat(newKg);
    if (!kg || kg <= 0 || kg > 100) return;
    setWeights((w) => [...w, { date: new Date(), kg }]);
    setNewKg("");
  };

  const markCareDone = (id) =>
    setCare((cs) => cs.map((c) => (c.id === id ? { ...c, last: new Date() } : c)));

  const logMood = () => {
    if (!moodToday) return;
    setHealthLog((l) => [{ id: Date.now(), mood: moodToday, note: healthNote.trim() || "ללא הערות", time: "היום" }, ...l]);
    setMoodToday(null); setHealthNote("");
  };

  const lastKg = weights[weights.length - 1]?.kg ?? 0;
  const weekAgoKg = weights.find((w) => Date.now() - w.date.getTime() <= 8 * DAY)?.kg ?? lastKg;
  const weeklyGain = (lastKg - weekAgoKg).toFixed(1);

  /* ===== פאבל — עוזר AI אמיתי (Claude API) ===== */
  const [chat, setChat] = useState([
    { role: "assistant", local: true, text: `היי! אני פאבל 🐾 העוזר החכם של DoggyLife.\nאני מכיר את הפרופיל של ${P.name} — המשקל, החיסונים, יומן הבריאות — ואשמח לענות על כל שאלה: אילוף, תזונה, התנהגות, ואפילו לנתח תמונה שתצרפו.\nבמה נתחיל?` },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatImg, setChatImg] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [insight, setInsight] = useState(null);
  const [insightBusy, setInsightBusy] = useState(false);
  const chatEndRef = useRef(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [chat, aiBusy]);

  const buildContext = () => {
    const overdue = care.filter((c) => daysLeft(new Date(c.last.getTime() + c.everyDays * DAY)) < 0).map((c) => c.name);
    const lastMood = healthLog[0] ? `${MOODS.find((m) => m.id === healthLog[0].mood)?.label} — "${healthLog[0].note}" (${healthLog[0].time})` : "לא תועד";
    return `אתה "פאבל" (Fable) — העוזר החכם של אפליקציית DoggyLife לבעלי חיות מחמד בישראל.
כללים: ענה תמיד בעברית, בגובה העיניים, חם וענייני. תשובות קצרות וממוקדות (2–5 משפטים) אלא אם התבקש פירוט. טקסט רגיל בלבד, בלי Markdown, בלי כותרות. מותר אימוג'י אחד-שניים.
אתה לא וטרינר: בכל חשש רפואי ממשי — תן סימנים שכדאי לשים לב אליהם והפנה לווטרינרית הקבועה (${vet.name}, ${vet.phone}). לעולם אל תאבחן בוודאות ואל תמליץ על תרופות ומינונים.

הפרופיל החי של החיה הפעילה (נתונים אמיתיים מהאפליקציה כרגע):
- שם: ${P.name} · ${P.species} · ${P.breed} · ${P.sex} · גיל ${fmtAge(P.ageMonths)} · משקל ${fmtWeight(P.weight)} · בבית כבר ${petDays} ימים
- משקל נוכחי: ${lastKg} ק"ג (שינוי שבועי: ${weeklyGain} ק"ג)
- החיסון הקרוב: ${nextVaccine ? `${nextVaccine.name} בעוד ${daysLeft(nextVaccine.date)} ימים` : "אין חיסון ממתין"}
- טיפולים מונעים באיחור: ${overdue.length ? overdue.join(", ") : "אין"}
- שגרה יומית היום: ${routineDone}/6 הושלמו (ארוחות: בוקר ${meals.morning ? "✓" : "✗"} ערב ${meals.evening ? "✓" : "✗"}, טיולים: ${walks.filter(Boolean).length}/3, מים: ${water ? "✓" : "✗"})
- תיעוד מצב אחרון: ${lastMood}
השתמש בנתונים האלה באופן טבעי כדי להתאים את התשובות אישית לחיה ולבעלים.`;
  };

  const callFable = async (messages) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system: buildContext(), messages }),
    });
    const data = await res.json();
    return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
  };

  const askFable = async (preset) => {
    const q = (preset ?? chatInput).trim();
    if ((!q && !chatImg) || aiBusy) return;
    const userMsg = { role: "user", text: q || "מה דעתך על התמונה המצורפת?", img: chatImg };
    const newChat = [...chat, userMsg];
    setChat(newChat); setChatInput(""); setChatImg(null); setAiBusy(true);
    try {
      const messages = newChat.filter((m) => !m.local).map((m) => ({
        role: m.role,
        content: m.img
          ? [{ type: "image", source: { type: "base64", media_type: m.img.media_type, data: m.img.data } }, { type: "text", text: m.text }]
          : m.text,
      }));
      const reply = await callFable(messages);
      setChat((c) => [...c, { role: "assistant", text: reply || "לא הצלחתי לנסח תשובה — נסו לנסח מחדש 🙏" }]);
    } catch (e) {
      setChat((c) => [...c, { role: "assistant", text: "⚠️ שגיאת תקשורת. בדקו חיבור ונסו שוב בעוד רגע." }]);
    } finally { setAiBusy(false); }
  };

  const onPickImg = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setChatImg({ data: String(r.result).split(",")[1], media_type: f.type || "image/jpeg", name: f.name });
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const genInsight = async () => {
    if (insightBusy) return;
    setInsightBusy(true);
    try {
      const reply = await callFable([{ role: "user", content: "כתוב תובנת יום אחת בלבד לבעלים: קצרה (עד 2 משפטים), מעשית, מבוססת על הנתונים החיים בפרופיל (משקל/חיסון/שגרה/טיפולים באיחור). בלי פתיחים ובלי סיכומים." }]);
      setInsight(reply || "לא התקבלה תובנה — נסו שוב.");
    } catch (e) {
      setInsight("⚠️ לא הצלחנו להתחבר לשירות ה-AI. נסו שוב בעוד רגע.");
    } finally { setInsightBusy(false); }
  };

  const QUICK_QS = [
    `האם ${P.name} במשקל תקין?`,
    "איך מרגילים אותה להישאר לבד בבית?",
    "היא מגרדת את האוזן — על מה לשים לב?",
    "בנה לי שגרת יום מושלמת לגור",
  ];

  const doneCount = firstWeek.filter((t) => t.done).length;
  const routineDone = [meals.morning, meals.evening, ...walks, water].filter(Boolean).length;
  const nextVaccine = useMemo(
    () => vaccines.filter((v) => !v.done && daysLeft(v.date) >= 0).sort((a, b) => a.date - b.date)[0],
    [vaccines]
  );

  const toggleFirstWeek = (id) => setFirstWeek((l) => l.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const toggleVaccine = (id) => setVaccines((l) => l.map((v) => (v.id === id ? { ...v, done: !v.done } : v)));
  const toggleStep = (mid, i) =>
    setStepDone((s) => ({ ...s, [mid]: { ...(s[mid] || {}), [i]: !(s[mid] || {})[i] } }));
  const toggleWalk = (i) => setWalks((w) => w.map((v, j) => (j === i ? !v : v)));

  const checkIn = (id) => {
    setParks((ps) =>
      ps.map((p) => {
        if (p.id === id) return { ...p, dogs: p.dogs + (checkedIn === id ? -1 : 1) };
        if (p.id === checkedIn) return { ...p, dogs: p.dogs - 1 };
        return p;
      })
    );
    setCheckedIn(checkedIn === id ? null : id);
  };

  const toggleJoin = (id) =>
    setGroups((gs) => gs.map((g) => (g.id === id ? { ...g, joined: !g.joined, members: g.members + (g.joined ? -1 : 1) } : g)));

  const addGroup = () => {
    if (!newGroup.trim()) return;
    setGroups((gs) => [...gs, { id: Date.now(), name: newGroup.trim(), members: 1, when: "טרם נקבע", joined: true }]);
    setNewGroup("");
    setShowGroupForm(false);
  };

  const claim = (id) => setListings((ls) => ls.map((l) => (l.id === id ? { ...l, claimed: !l.claimed } : l)));
  const addListing = () => {
    if (!newListing.trim()) return;
    setListings((ls) => [{ id: Date.now(), title: newListing.trim(), note: "פורסם עכשיו", user: "אני · השכונה שלי", price: "חינם", claimed: false, tag: "חדש" }, ...ls]);
    setNewListing("");
  };

  const cheapest = Math.min(...PRICE_DATA[product].map((r) => r.price));

  const TABS = [
    { id: "home", label: "בית", icon: Home },
    { id: "ai", label: "פאבל AI", icon: Bot },
    { id: "train", label: "אימון", icon: Dumbbell },
    { id: "health", label: "בריאות", icon: Activity },
    { id: "parks", label: "פארקים", icon: Trees },
    { id: "food", label: "שיתוף וידע", icon: UtensilsCrossed },
    { id: "shops", label: "חנויות", icon: ShoppingBag },
    { id: "match", label: "התאמה", icon: PawPrint },
    { id: "index", label: "אינדקס", icon: BookOpen },
    { id: "donate", label: "תרומה", icon: HeartHandshake },
    { id: "sos", label: "SOS", icon: Siren },
    { id: "id", label: "תעודה", icon: BadgeCheck },
    { id: "settings", label: "הגדרות", icon: Settings },
  ];

  return (
    <div dir="rtl" className={`min-h-screen w-full ${motionOff ? "motion-off" : ""}`} style={{ background: `radial-gradient(1100px 520px at 92% -8%, rgba(217,142,50,.16), transparent 60%), radial-gradient(950px 520px at -8% 108%, rgba(123,174,127,.18), transparent 55%), ${C.bg}`, fontFamily: "'Rubik','Heebo','Segoe UI',system-ui,sans-serif", color: C.ink }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Secular+One&family=Rubik:wght@400;500;600;700;800&display=swap');
        .font-display{font-family:'Secular One','Rubik',sans-serif;letter-spacing:.2px}
        @keyframes fableBlink{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-2px)}}
        .fable-dot{animation:fableBlink 1.2s infinite}
        @keyframes rise{from{opacity:0;transform:translateY(16px) scale(.985)}to{opacity:1;transform:none}}
        .stagger>*{animation:rise .55s cubic-bezier(.2,.75,.25,1) both}
        .stagger>*:nth-child(1){animation-delay:.03s}.stagger>*:nth-child(2){animation-delay:.09s}
        .stagger>*:nth-child(3){animation-delay:.15s}.stagger>*:nth-child(4){animation-delay:.21s}
        .stagger>*:nth-child(5){animation-delay:.27s}.stagger>*:nth-child(6){animation-delay:.33s}
        @keyframes pawFloat{0%{transform:translateY(12px) rotate(var(--r,-12deg));opacity:0}12%{opacity:.45}80%{opacity:.35}100%{transform:translateY(-110px) rotate(var(--r,-12deg));opacity:0}}
        @keyframes spinSlow{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:-180% 0}100%{background-position:180% 0}}
        .shimmer{position:relative;overflow:hidden}
        .shimmer::after{content:'';position:absolute;inset:0;background:linear-gradient(110deg,transparent 32%,rgba(255,255,255,.35) 50%,transparent 68%);background-size:220% 100%;animation:shimmer 2.8s infinite;pointer-events:none}
        @keyframes dockIn{from{opacity:0;transform:translate(-50%,26px)}to{opacity:1;transform:translate(-50%,0)}}
        @keyframes glowPulse{0%,100%{opacity:.55}50%{opacity:.95}}
        button{transition:transform .15s ease, box-shadow .25s ease, filter .2s ease}
        button:active{transform:scale(.96)}
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{scrollbar-width:none}
        .motion-off *,.motion-off *::before,.motion-off *::after{animation:none!important;transition:none!important}
        @media (prefers-reduced-motion: reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
      `}</style>

      {/* ===== Hero header ===== */}
      <header className="relative overflow-hidden px-4 pt-7 pb-7" style={{ background: "linear-gradient(150deg,#18332B 0%,#2F4A40 48%,#41675A 100%)" }}>
        {/* ambient glow + floating paws */}
        <div className="absolute -top-24 left-10 w-72 h-72 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(217,142,50,.35), transparent 65%)", animation: "glowPulse 5s ease-in-out infinite" }} />
        <div className="absolute -bottom-28 right-6 w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(123,174,127,.28), transparent 65%)" }} />
        {[
          { right: "6%", size: 16, dur: 9, delay: 0, r: "-14deg" },
          { right: "22%", size: 22, dur: 11, delay: 2.2, r: "10deg" },
          { right: "46%", size: 14, dur: 8, delay: 4.1, r: "-8deg" },
          { right: "68%", size: 20, dur: 12, delay: 1.1, r: "16deg" },
          { right: "86%", size: 15, dur: 10, delay: 3.4, r: "-18deg" },
        ].map((p, i) => (
          <span key={i} className="absolute bottom-0 pointer-events-none select-none" aria-hidden="true"
            style={{ right: p.right, fontSize: p.size, "--r": p.r, animation: `pawFloat ${p.dur}s linear ${p.delay}s infinite` }}>🐾</span>
        ))}

        <div className="relative max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              {/* avatar with rotating aura ring */}
              <div className="relative w-[68px] h-[68px] shrink-0">
                <div className="absolute -inset-[5px] rounded-[24px]" style={{ background: "conic-gradient(from 0deg,#D98E32,#F2C879,#7BAE7F,#4E8FB5,#D98E32)", animation: "spinSlow 7s linear infinite", filter: "blur(7px)", opacity: .85 }} />
                <div className="absolute inset-0 rounded-[20px] overflow-hidden flex items-center justify-center text-4xl shadow-xl" style={{ background: "linear-gradient(145deg,#F9E8C9,#F2D5A3)" }}>
                  {P.photo
                    ? <img src={P.photo} alt={P.name} className="w-full h-full object-cover" style={{ display: "block" }} />
                    : P.emoji}
                </div>
              </div>
              <div>
                <p className="font-display text-[12px] tracking-widest" style={{ background: "linear-gradient(90deg,#F2C879,#E8A957)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>DOGGYLIFE · דוגילייף</p>
                <h1 className="font-display text-[26px] text-white leading-none mt-0.5">{P.name}</h1>
                <p className="text-[12px] mt-1 font-medium" style={{ color: "#B9D2C4" }}>{P.breed} · {fmtAge(P.ageMonths)} · {fmtWeight(P.weight)}</p>
              </div>
            </div>
            <div className="text-center rounded-2xl px-4 py-2.5 shimmer" style={{ background: "rgba(255,255,255,.10)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.16)" }}>
              <p className="font-display text-[34px] leading-none" style={{ color: "#F2C879", textShadow: "0 2px 18px rgba(242,200,121,.45)" }}>{petDays}</p>
              <p className="text-[10px] font-bold text-white mt-1">ימים ביחד 🐾</p>
            </div>
          </div>

          {/* pet switcher */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar">
            {roster.map((p) => {
              const on = p.id === activeId;
              return (
                <button key={p.id} onClick={() => setActiveId(p.id)}
                  className="shrink-0 flex items-center gap-1.5 rounded-full pl-3 pr-1.5 py-1 transition-all"
                  style={on
                    ? { background: "linear-gradient(145deg,#F2C879,#D98E32)", color: "#2A1C08", boxShadow: "0 4px 14px rgba(217,142,50,.4)" }
                    : { background: "rgba(255,255,255,.09)", color: "#CFE1D6", border: "1px solid rgba(255,255,255,.14)" }}>
                  <PetAvatar pet={p} size={24} radius={999} fontScale={0.54}
                    style={{ background: on ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.12)" }} />
                  <span className="text-[11.5px] font-extrabold">{p.name}</span>
                </button>
              );
            })}
            <button onClick={() => setTab("settings")}
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,.09)", border: "1px dashed rgba(255,255,255,.3)", color: "#CFE1D6" }}
              title="הוספת חיה">
              <Plus size={15} />
            </button>
          </div>

          {/* glass stat strip */}
          <div className="grid grid-cols-3 gap-2.5 mt-5">
            <div className="rounded-2xl px-3 py-2.5 flex items-center gap-2.5" style={{ background: "rgba(255,255,255,.09)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.14)" }}>
              <Ring pct={(routineDone / 6) * 100} label={`${routineDone}/6`} color="#F2C879" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold" style={{ color: "#B9D2C4" }}>שגרה יומית</p>
                <p className="text-[11.5px] font-extrabold text-white leading-tight">היום</p>
              </div>
            </div>
            <div className="rounded-2xl px-3 py-2.5 flex flex-col justify-center" style={{ background: "rgba(255,255,255,.09)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.14)" }}>
              <p className="text-[10px] font-bold" style={{ color: "#B9D2C4" }}>💉 חיסון קרוב</p>
              <p className="font-display text-[17px] text-white leading-tight mt-0.5">{nextVaccine ? `${daysLeft(nextVaccine.date)} ימים` : "אין ✓"}</p>
            </div>
            <div className="rounded-2xl px-3 py-2.5 flex flex-col justify-center" style={{ background: "rgba(255,255,255,.09)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.14)" }}>
              <p className="text-[10px] font-bold" style={{ color: "#B9D2C4" }}>📋 שבוע ראשון</p>
              <p className="font-display text-[17px] text-white leading-tight mt-0.5">{doneCount}/{firstWeek.length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Floating glass dock ===== */}
      <nav className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-20px)] max-w-3xl" style={{ transform: "translateX(-50%)", animation: "dockIn .55s cubic-bezier(.2,.75,.25,1) .15s both" }}>
        <div className="flex overflow-x-auto no-scrollbar gap-1 rounded-[26px] p-1.5"
          style={{ background: "rgba(24,42,35,.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,.12)", boxShadow: "0 20px 48px rgba(24,51,43,.42)" }}>
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex-1 min-w-[62px] flex flex-col items-center gap-0.5 py-2 px-1 rounded-[20px] text-[10px] font-extrabold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2C879]"
                style={active
                  ? { background: "linear-gradient(145deg,#F2C879,#D98E32)", color: "#2A1C08", boxShadow: "0 6px 18px rgba(217,142,50,.45)" }
                  : { color: "#9FB8AB" }}
              >
                <Icon size={17} strokeWidth={active ? 2.6 : 2} />
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      <main key={tab} className="stagger max-w-3xl mx-auto px-4 py-5 space-y-5 pb-36">

        {/* ================= TAB 1: DASHBOARD ================= */}
        {tab === "home" && (
          <>
            <Card className="p-4" >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold" style={{ color: C.amber }}>ברוכים הבאים הביתה 🎉</p>
                  <h2 className="text-lg font-extrabold mt-0.5">{P.name} {fem ? "הצטרפה" : "הצטרף"} למשפחה!</h2>
                  <p className="text-[13px] mt-1" style={{ color: C.inkSoft }}>
                    {fem ? "אומצה" : "אומץ"} ב-{fmt(petAdoptionDate)} · {P.breed} · גיל {fmtAge(P.ageMonths)} · {fmtWeight(P.weight)}
                  </p>
                </div>
                <PartyPopper size={26} style={{ color: C.amber }} />
              </div>
            </Card>

            {/* AI daily insight */}
            <div className="rounded-2xl p-4 border" style={{ background: "linear-gradient(135deg,#FFF9EE,#FDF2DC)", borderColor: "#F0DDBC" }}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center text-lg" style={{ background: C.amberSoft }}>🤖</span>
                  <div>
                    <p className="text-[13px] font-extrabold">תובנת היום מפאבל</p>
                    <p className="text-[10.5px]" style={{ color: C.inkSoft }}>AI אמיתי שמנתח את הנתונים החיים של {P.name}</p>
                  </div>
                </div>
                <button onClick={genInsight} disabled={insightBusy}
                  className="rounded-lg px-3 py-2 text-[11.5px] font-extrabold text-white shrink-0"
                  style={{ background: insightBusy ? "#DBCFC0" : C.amber }}>
                  {insightBusy ? "חושב..." : insight ? "✨ תובנה חדשה" : "✨ צרו תובנה"}
                </button>
              </div>
              {insight && (
                <p className="mt-3 text-[13px] leading-relaxed rounded-xl p-3 bg-white/70" style={{ color: C.ink, border: "1px dashed #E8D3A8" }}>
                  {insight}
                </p>
              )}
            </div>

            {/* First week checklist */}
            <Card className="p-4">
              <SectionTitle icon={CheckCircle2} extra={<Chip tone="amber">{doneCount}/{firstWeek.length}</Chip>}>
                השבוע הראשון עם {P.name}
              </SectionTitle>
              <ProgressBar pct={(doneCount / firstWeek.length) * 100} />
              <ul className="mt-3 divide-y divide-[#F3EDE0]">
                {firstWeek.map((t) => (
                  <li key={t.id}>
                    <button onClick={() => toggleFirstWeek(t.id)} className="w-full flex items-center gap-3 py-2.5 text-right group">
                      {t.done
                        ? <CheckCircle2 size={20} className="shrink-0" style={{ color: C.pine }} />
                        : <Circle size={20} className="shrink-0" style={{ color: "#D6CCBA" }} />}
                      <span className={`text-[13.5px] ${t.done ? "line-through" : ""}`} style={{ color: t.done ? C.inkSoft : C.ink }}>{t.text}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Vaccine tracker */}
            <Card className="p-4">
              <SectionTitle icon={Syringe}>חיסונים וביקורי וטרינר</SectionTitle>
              <div className="space-y-2.5">
                {[...vaccines].sort((a, b) => (a.done - b.done) || (a.date - b.date)).map((v) => {
                  const dl = daysLeft(v.date);
                  const urgent = !v.done && dl <= 7;
                  return (
                    <div key={v.id} className="flex items-center gap-3 rounded-xl p-3 border"
                      style={{ borderColor: urgent ? "#EBC9C2" : "#EFE6D6", background: v.done ? "#FBF9F3" : urgent ? "#FDF3F1" : "#fff" }}>
                      <button onClick={() => toggleVaccine(v.id)} aria-label="סימון חיסון">
                        {v.done
                          ? <CheckCircle2 size={22} style={{ color: C.pine }} />
                          : <Circle size={22} style={{ color: "#D6CCBA" }} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13.5px] font-bold ${v.done ? "line-through" : ""}`} style={{ color: v.done ? C.inkSoft : C.ink }}>{v.name}</p>
                        <p className="text-[11.5px] flex items-center gap-1 mt-0.5" style={{ color: C.inkSoft }}>
                          <Calendar size={11} /> {fmt(v.date)} · {v.place}
                        </p>
                      </div>
                      {!v.done && (
                        <div className="text-center shrink-0 rounded-lg px-2.5 py-1.5" style={{ background: urgent ? C.redSoft : C.blueSoft }}>
                          <p className="font-display text-[17px] leading-none" style={{ color: urgent ? C.red : C.blue }}>{dl}</p>
                          <p className="text-[9px] font-semibold" style={{ color: urgent ? C.red : C.blue }}>ימים</p>
                        </div>
                      )}
                      {v.done && <Chip tone="pine">בוצע ✓</Chip>}
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}

        {/* ================= TAB: FABLE AI ASSISTANT ================= */}
        {tab === "ai" && (
          <>
            <div className="rounded-2xl p-4" style={{ background: `linear-gradient(135deg, ${C.pine}, #3E6154)` }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "rgba(255,255,255,0.15)" }}>🤖</div>
                <div className="flex-1">
                  <p className="text-[15px] font-extrabold text-white">פאבל — העוזר החכם 🐾</p>
                  <p className="text-[11px]" style={{ color: "#CFE1D6" }}>
                    מחובר לפרופיל החי של {P.name} · מבין תמונות · מופעל ע"י Claude
                  </p>
                </div>
                <Chip tone="amber">AI אמיתי</Chip>
              </div>
            </div>

            <Card className="p-0 overflow-hidden">
              {/* Messages */}
              <div className="max-h-[420px] min-h-[260px] overflow-y-auto p-4 space-y-3" style={{ background: "#FCFAF4" }}>
                {chat.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap"
                      style={m.role === "user"
                        ? { background: C.amberSoft, color: "#6B4610", borderBottomLeftRadius: 6 }
                        : { background: "#fff", color: C.ink, border: "1px solid #EFE6D6", borderBottomRightRadius: 6 }}>
                      {m.img && (
                        <span className="block text-[11px] font-bold mb-1 rounded-lg px-2 py-1" style={{ background: "rgba(0,0,0,0.06)" }}>
                          📷 {m.img.name}
                        </span>
                      )}
                      {m.text}
                    </div>
                  </div>
                ))}
                {aiBusy && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl px-4 py-3 flex items-center gap-1.5" style={{ background: "#fff", border: "1px solid #EFE6D6" }}>
                      {[0, 1, 2].map((d) => (
                        <span key={d} className="fable-dot w-2 h-2 rounded-full inline-block" style={{ background: C.pine, animationDelay: `${d * 0.2}s` }} />
                      ))}
                      <span className="text-[11px] font-bold mr-1" style={{ color: C.inkSoft }}>פאבל חושב...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick questions */}
              <div className="flex gap-2 overflow-x-auto px-3 py-2.5 border-t" style={{ borderColor: "#F3EDE0", background: "#fff" }}>
                {QUICK_QS.map((q) => (
                  <button key={q} onClick={() => askFable(q)} disabled={aiBusy}
                    className="shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-bold border transition-all"
                    style={{ borderColor: "#E4D9C4", background: "#FCFAF4", color: C.pine, opacity: aiBusy ? 0.5 : 1 }}>
                    {q}
                  </button>
                ))}
              </div>

              {/* Composer */}
              <div className="flex items-center gap-2 p-3 border-t" style={{ borderColor: "#F3EDE0", background: "#fff" }}>
                <label className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer shrink-0 transition-all"
                  style={{ background: chatImg ? C.blueSoft : "#F5F1E8", color: chatImg ? "#2F5A73" : C.inkSoft }}
                  title="צירוף תמונה לניתוח">
                  <ImagePlus size={18} />
                  <input type="file" accept="image/*" className="hidden" onChange={onPickImg} />
                </label>
                <div className="flex-1 min-w-0">
                  {chatImg && (
                    <button onClick={() => setChatImg(null)} className="text-[10.5px] font-bold mb-1 rounded px-1.5 py-0.5" style={{ background: C.blueSoft, color: "#2F5A73" }}>
                      📷 {chatImg.name} ✕
                    </button>
                  )}
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && askFable()}
                    placeholder={`שאלו את פאבל על ${P.name}...`}
                    className="w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none focus:border-[#2F4A40]"
                    style={{ borderColor: "#EFE6D6", background: "#FCFAF4" }} />
                </div>
                <button onClick={() => askFable()} disabled={aiBusy || (!chatInput.trim() && !chatImg)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 transition-all"
                  style={{ background: aiBusy || (!chatInput.trim() && !chatImg) ? "#DBCFC0" : C.pine }}>
                  <Send size={17} style={{ transform: "scaleX(-1)" }} />
                </button>
              </div>
            </Card>

            <p className="text-[11px] text-center leading-relaxed" style={{ color: C.inkSoft }}>
              🔒 פאבל מקבל את נתוני הפרופיל רק בזמן השיחה · התשובות אינן תחליף לייעוץ וטרינרי מקצועי
            </p>
          </>
        )}

        {/* ================= TAB 2: TRAINING ================= */}
        {tab === "train" && (
          <>
            {/* Daily routine */}
            <Card className="p-4">
              <SectionTitle icon={Clock} extra={<Chip tone="amber">{routineDone}/6</Chip>}>שגרה יומית · {today.toLocaleDateString("he-IL", { weekday: "long" })}</SectionTitle>
              <ProgressBar pct={(routineDone / 6) * 100} color={C.pine} />

              <div className="grid grid-cols-2 gap-2.5 mt-3">
                <button onClick={() => setMeals((m) => ({ ...m, morning: !m.morning }))}
                  className="rounded-xl p-3 border text-right transition-all"
                  style={{ borderColor: meals.morning ? C.pine : "#EFE6D6", background: meals.morning ? C.pineSoft : "#fff" }}>
                  <div className="flex items-center gap-2"><Sun size={16} style={{ color: C.amber }} /><span className="text-[13px] font-bold">ארוחת בוקר</span></div>
                  <p className="text-[11px] mt-1" style={{ color: C.inkSoft }}>{meals.morning ? "ניתנה ✓ · 07:15" : "טרם ניתנה — 1 כוס מזון גורים"}</p>
                </button>
                <button onClick={() => setMeals((m) => ({ ...m, evening: !m.evening }))}
                  className="rounded-xl p-3 border text-right transition-all"
                  style={{ borderColor: meals.evening ? C.pine : "#EFE6D6", background: meals.evening ? C.pineSoft : "#fff" }}>
                  <div className="flex items-center gap-2"><Moon size={16} style={{ color: C.blue }} /><span className="text-[13px] font-bold">ארוחת ערב</span></div>
                  <p className="text-[11px] mt-1" style={{ color: C.inkSoft }}>{meals.evening ? "ניתנה ✓" : "מומלץ עד 19:00"}</p>
                </button>
              </div>

              {/* walks */}
              <div className="mt-3 rounded-xl border p-3" style={{ borderColor: "#EFE6D6" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Footprints size={16} style={{ color: C.pine }} /><span className="text-[13px] font-bold">טיולים (3 ביום)</span></div>
                  <span className="text-[11px] font-bold" style={{ color: C.inkSoft }}>{walks.filter(Boolean).length}/3</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2.5">
                  {["בוקר", "צהריים", "ערב"].map((w, i) => (
                    <button key={w} onClick={() => toggleWalk(i)}
                      className="rounded-lg py-2 text-[12px] font-bold border transition-all"
                      style={{ borderColor: walks[i] ? C.amber : "#EFE6D6", background: walks[i] ? C.amberSoft : "#fff", color: walks[i] ? "#8A5714" : C.inkSoft }}>
                      {walks[i] ? `${w} ✓` : `רישום ${w}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* water */}
              <button onClick={() => setWater(!water)}
                className="mt-3 w-full rounded-xl p-3 border flex items-center justify-between transition-all"
                style={{ borderColor: water ? C.blue : "#EFE6D6", background: water ? C.blueSoft : "#fff" }}>
                <div className="flex items-center gap-2">
                  <Droplets size={16} style={{ color: C.blue }} />
                  <span className="text-[13px] font-bold">רענון קערת מים</span>
                </div>
                <span className="text-[11.5px] font-semibold" style={{ color: water ? C.blue : C.inkSoft }}>
                  {water ? "מים טריים בקערה ✓" : "תזכורת: להחליף פעמיים ביום"}
                </span>
              </button>
            </Card>

            {/* Pooch Coach */}
            <Card className="p-4">
              <SectionTitle icon={Trophy}>Pooch Coach · מודולי אימון</SectionTitle>
              <div className="space-y-2.5">
                {TRAINING.map((m) => {
                  const open = openModule === m.id;
                  const done = Object.values(stepDone[m.id] || {}).filter(Boolean).length;
                  const pct = (done / m.steps.length) * 100;
                  return (
                    <div key={m.id} className="rounded-xl border overflow-hidden" style={{ borderColor: open ? C.amber : "#EFE6D6" }}>
                      <button onClick={() => setOpenModule(open ? null : m.id)} className="w-full flex items-center gap-3 p-3 text-right">
                        <span className="text-2xl">{m.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13.5px] font-extrabold">{m.title}</span>
                            <Chip tone={m.level === "בסיס" ? "pine" : "blue"}>{m.level}</Chip>
                            <Chip tone="amber">{m.time}</Chip>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex-1"><ProgressBar pct={pct} color={C.pine} /></div>
                            <span className="text-[10.5px] font-bold" style={{ color: C.inkSoft }}>{done}/{m.steps.length}</span>
                          </div>
                        </div>
                        {open ? <ChevronUp size={18} style={{ color: C.inkSoft }} /> : <ChevronDown size={18} style={{ color: C.inkSoft }} />}
                      </button>
                      {open && (
                        <ol className="px-4 pb-3 space-y-1.5" style={{ background: "#FCFAF4" }}>
                          {m.steps.map((s, i) => {
                            const c = (stepDone[m.id] || {})[i];
                            return (
                              <li key={i}>
                                <button onClick={() => toggleStep(m.id, i)} className="w-full flex items-start gap-2.5 py-1.5 text-right">
                                  <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full text-[10px] font-extrabold flex items-center justify-center"
                                    style={{ background: c ? C.pine : "#EDE4D2", color: c ? "#fff" : C.inkSoft }}>
                                    {c ? "✓" : i + 1}
                                  </span>
                                  <span className={`text-[13px] leading-relaxed ${c ? "line-through" : ""}`} style={{ color: c ? C.inkSoft : C.ink }}>{s}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ol>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}

        {/* ================= TAB: HEALTH JOURNAL ================= */}
        {tab === "health" && (
          <>
            {/* Weight tracker + chart */}
            <Card className="p-4">
              <SectionTitle icon={TrendingUp}
                extra={<Chip tone={parseFloat(weeklyGain) >= 0 ? "pine" : "red"}>{weeklyGain >= 0 ? "+" : ""}{weeklyGain} ק"ג השבוע</Chip>}>
                מעקב משקל וגדילה
              </SectionTitle>

              {(() => {
                const pts = weights.slice(-8);
                const min = Math.min(...pts.map((p) => p.kg)) - 0.5;
                const max = Math.max(...pts.map((p) => p.kg)) + 0.5;
                const X = (i) => 16 + (i * (300 - 32)) / Math.max(pts.length - 1, 1);
                const Y = (kg) => 88 - ((kg - min) / (max - min)) * 70;
                const line = pts.map((p, i) => `${X(i)},${Y(p.kg)}`).join(" ");
                const area = `16,92 ${line} ${X(pts.length - 1)},92`;
                return (
                  <div className="rounded-xl p-2" style={{ background: "#FCFAF4", border: "1px solid #F3EDE0" }}>
                    <svg viewBox="0 0 300 100" className="w-full" role="img" aria-label="גרף משקל">
                      <polygon points={area} fill={C.pineSoft} opacity="0.7" />
                      <polyline points={line} fill="none" stroke={C.pine} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                      {pts.map((p, i) => (
                        <g key={i}>
                          <circle cx={X(i)} cy={Y(p.kg)} r={i === pts.length - 1 ? 4.5 : 3} fill={i === pts.length - 1 ? C.amber : "#fff"} stroke={C.pine} strokeWidth="2" />
                          <text x={X(i)} y={Y(p.kg) - 7} textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.pine}>{p.kg}</text>
                        </g>
                      ))}
                    </svg>
                    <div className="flex justify-between px-2 text-[9px] font-bold" style={{ color: C.inkSoft }}>
                      {pts.map((p, i) => <span key={i}>{fmt(p.date)}</span>)}
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-2 mt-3">
                <input value={newKg} onChange={(e) => setNewKg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addWeight()}
                  type="number" step="0.1" inputMode="decimal" placeholder={`שקילה חדשה (אחרונה: ${lastKg} ק"ג)`}
                  className="flex-1 rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#2F4A40]"
                  style={{ borderColor: "#EFE6D6", background: "#FCFAF4" }} />
                <button onClick={addWeight} className="rounded-lg px-4 text-[12.5px] font-extrabold text-white" style={{ background: C.pine }}>
                  רישום ⚖️
                </button>
              </div>
              {isDog && (
                <p className="mt-2 text-[11px] leading-relaxed" style={{ color: C.inkSoft }}>
                  💡 גור {P.breed} בגיל {fmtAge(P.ageMonths)} אמור לעלות כ-0.4–0.9 ק"ג בשבוע. קצב חריג לשני הכיוונים — שווה שיחה עם הווטרינר.
                </p>
              )}
            </Card>

            {/* Preventive care schedule */}
            <Card className="p-4">
              <SectionTitle icon={Pill}>טיפול מונע שוטף</SectionTitle>
              <div className="space-y-2.5">
                {care.map((c) => {
                  const next = new Date(c.last.getTime() + c.everyDays * DAY);
                  const dl = daysLeft(next);
                  const overdue = dl < 0;
                  const soon = dl >= 0 && dl <= 5;
                  return (
                    <div key={c.id} className="flex items-center gap-3 rounded-xl border p-3"
                      style={{ borderColor: overdue ? "#EBC9C2" : "#EFE6D6", background: overdue ? "#FDF3F1" : "#fff" }}>
                      <span className="text-xl shrink-0">{c.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-extrabold">{c.name}</p>
                        <p className="text-[11px]" style={{ color: C.inkSoft }}>
                          כל {c.everyDays} ימים · בוצע לאחרונה {fmt(c.last)}
                        </p>
                      </div>
                      <div className="text-center shrink-0 rounded-lg px-2.5 py-1.5"
                        style={{ background: overdue ? C.redSoft : soon ? C.amberSoft : C.pineSoft }}>
                        <p className="text-[13px] font-extrabold leading-none" style={{ color: overdue ? C.red : soon ? "#8A5714" : C.pine }}>
                          {overdue ? `${-dl}+` : dl}
                        </p>
                        <p className="text-[8.5px] font-bold" style={{ color: overdue ? C.red : soon ? "#8A5714" : C.pine }}>
                          {overdue ? "ימים באיחור" : "ימים נותרו"}
                        </p>
                      </div>
                      <button onClick={() => markCareDone(c.id)}
                        className="rounded-lg px-2.5 py-2 text-[11px] font-extrabold shrink-0"
                        style={{ background: overdue ? C.red : C.pineSoft, color: overdue ? "#fff" : C.pine }}>
                        בוצע היום ✓
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Daily mood log */}
            <Card className="p-4">
              <SectionTitle icon={Heart}>איך {P.name} {fem ? "מרגישה" : "מרגיש"} היום?</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                {MOODS.map((m) => (
                  <button key={m.id} onClick={() => setMoodToday(m.id)}
                    className="rounded-lg py-2.5 text-[12.5px] font-bold transition-all"
                    style={{
                      background: moodToday === m.id ? (m.id === "sick" ? C.redSoft : C.pineSoft) : "#F5F1E8",
                      color: moodToday === m.id ? (m.id === "sick" ? C.red : C.pine) : C.inkSoft,
                      border: moodToday === m.id ? `1.5px solid ${m.id === "sick" ? C.red : C.pine}` : "1.5px solid transparent",
                    }}>
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2.5">
                <input value={healthNote} onChange={(e) => setHealthNote(e.target.value)} onKeyDown={(e) => e.key === "Enter" && logMood()}
                  placeholder="הערה: תיאבון, יציאות, גירודים, שיעול..."
                  className="flex-1 rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#2F4A40]"
                  style={{ borderColor: "#EFE6D6", background: "#FCFAF4" }} />
                <button onClick={logMood} disabled={!moodToday}
                  className="rounded-lg px-4 text-[12.5px] font-extrabold text-white"
                  style={{ background: moodToday ? C.pine : "#DBCFC0" }}>
                  תיעוד
                </button>
              </div>
              {moodToday === "sick" && (
                <p className="mt-2.5 text-[12px] rounded-lg p-2.5 font-semibold" style={{ background: C.redSoft, color: C.red }}>
                  🤒 מודאגים? התיעוד היומי הזה שווה זהב אצל הווטרינר — {vet.phone}. סימני אזהרה: סירוב לאוכל מעל יממה, הקאות חוזרות, אדישות חריגה.
                </p>
              )}
              <div className="mt-3 space-y-1.5">
                {healthLog.map((l) => {
                  const m = MOODS.find((x) => x.id === l.mood);
                  return (
                    <div key={l.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2" style={{ background: "#FCFAF4", border: "1px solid #F3EDE0" }}>
                      <span className="text-lg shrink-0">{m?.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold">{m?.label}</p>
                        <p className="text-[11.5px] truncate" style={{ color: C.inkSoft }}>{l.note}</p>
                      </div>
                      <span className="text-[10px] font-bold shrink-0" style={{ color: C.inkSoft }}>{l.time}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}

        {/* ================= TAB 3: PARKS ================= */}
        {tab === "parks" && (
          <>
            <Card className="p-4">
              <SectionTitle icon={Trees}>גינות כלבים בסביבה</SectionTitle>
              <div className="space-y-3">
                {parks.map((p) => {
                  const inHere = checkedIn === p.id;
                  return (
                    <div key={p.id} className="rounded-xl border p-3" style={{ borderColor: inHere ? C.pine : "#EFE6D6", background: inHere ? "#F4F9F6" : "#fff" }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[14px] font-extrabold">{p.name}</p>
                          <p className="text-[11.5px] flex items-center gap-1 mt-0.5" style={{ color: C.inkSoft }}>
                            <MapPin size={11} /> {p.dist} · <Stars value={p.rating} />
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {p.features.map((f) => <Chip key={f} tone={f.includes("מים") ? "blue" : "pine"}>{f}</Chip>)}
                          </div>
                        </div>
                        <div className="text-center shrink-0">
                          <div className="rounded-xl px-3 py-1.5" style={{ background: C.amberSoft }}>
                            <p className="font-display text-[19px] leading-none" style={{ color: "#8A5714" }}>{p.dogs}</p>
                            <p className="text-[9px] font-bold" style={{ color: "#8A5714" }}>כלבים עכשיו</p>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => checkIn(p.id)}
                        className="mt-3 w-full rounded-lg py-2 text-[12.5px] font-extrabold transition-all"
                        style={{ background: inHere ? C.pine : C.amberSoft, color: inHere ? "#fff" : "#8A5714" }}>
                        {inHere ? `✓ עשיתם צ'ק-אין עם ${P.name} — לחצו ליציאה` : "צ'ק-אין לפארק 🐾"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-4">
              <SectionTitle icon={Users}
                extra={
                  <button onClick={() => setShowGroupForm(!showGroupForm)} className="flex items-center gap-1 text-[11.5px] font-extrabold rounded-lg px-2.5 py-1.5" style={{ background: C.pineSoft, color: C.pine }}>
                    {showGroupForm ? <X size={13} /> : <Plus size={13} />} {showGroupForm ? "ביטול" : "קבוצה חדשה"}
                  </button>
                }>
                קבוצות הליכה וחברים
              </SectionTitle>

              {showGroupForm && (
                <div className="flex gap-2 mb-3">
                  <input value={newGroup} onChange={(e) => setNewGroup(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addGroup()}
                    placeholder='שם הקבוצה, למשל: "גולדנים של מודיעין"'
                    className="flex-1 rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#D98E32]" style={{ borderColor: "#EFE6D6", background: "#FCFAF4" }} />
                  <button onClick={addGroup} className="rounded-lg px-4 text-[12.5px] font-extrabold text-white" style={{ background: C.pine }}>יצירה</button>
                </div>
              )}

              <div className="space-y-2.5">
                {groups.map((g) => (
                  <div key={g.id} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: "#EFE6D6" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: C.blueSoft }}>🐶</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-extrabold truncate">{g.name}</p>
                      <p className="text-[11.5px]" style={{ color: C.inkSoft }}>{g.members} חברים · {g.when}</p>
                    </div>
                    <button onClick={() => toggleJoin(g.id)}
                      className="rounded-lg px-3 py-1.5 text-[11.5px] font-extrabold shrink-0"
                      style={{ background: g.joined ? C.pineSoft : C.amber, color: g.joined ? C.pine : "#fff" }}>
                      {g.joined ? "חבר/ה ✓" : "הצטרפות"}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* ================= TAB 4: FOOD SHARE + KNOWLEDGE ================= */}
        {tab === "food" && (
          <>
            <Card className="p-4">
              <SectionTitle icon={Gift}>לוח שיתוף אוכל שכונתי</SectionTitle>
              <div className="flex gap-2 mb-3">
                <input value={newListing} onChange={(e) => setNewListing(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addListing()}
                  placeholder='מה יש לכם לשתף? למשל: "שק מזון פתוח"'
                  className="flex-1 rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#D98E32]" style={{ borderColor: "#EFE6D6", background: "#FCFAF4" }} />
                <button onClick={addListing} className="rounded-lg px-4 text-[12.5px] font-extrabold text-white" style={{ background: C.amber }}>פרסום</button>
              </div>
              <div className="space-y-2.5">
                {listings.map((l) => (
                  <div key={l.id} className="rounded-xl border p-3" style={{ borderColor: "#EFE6D6", opacity: l.claimed ? 0.65 : 1 }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-[13.5px] font-extrabold ${l.claimed ? "line-through" : ""}`}>{l.title}</p>
                          <Chip tone="blue">{l.tag}</Chip>
                        </div>
                        <p className="text-[12px] mt-0.5" style={{ color: C.inkSoft }}>{l.note} · {l.user}</p>
                      </div>
                      <Chip tone={l.price === "חינם" ? "pine" : "amber"}>{l.price}</Chip>
                    </div>
                    <button onClick={() => claim(l.id)}
                      className="mt-2.5 rounded-lg px-3 py-1.5 text-[11.5px] font-extrabold"
                      style={{ background: l.claimed ? C.pineSoft : C.pine, color: l.claimed ? C.pine : "#fff" }}>
                      {l.claimed ? "נתפס ✓ · ביטול" : "אני רוצה! תיאום איסוף"}
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <SectionTitle icon={Leaf}>מרכז ידע · תזונת כלבים</SectionTitle>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button onClick={() => setKnowledgeTab("toxic")}
                  className="rounded-lg py-2 text-[12.5px] font-extrabold flex items-center justify-center gap-1.5"
                  style={{ background: knowledgeTab === "toxic" ? C.redSoft : "#F5F1E8", color: knowledgeTab === "toxic" ? C.red : C.inkSoft }}>
                  <AlertTriangle size={14} /> מסוכן לכלבים
                </button>
                <button onClick={() => setKnowledgeTab("healthy")}
                  className="rounded-lg py-2 text-[12.5px] font-extrabold flex items-center justify-center gap-1.5"
                  style={{ background: knowledgeTab === "healthy" ? C.pineSoft : "#F5F1E8", color: knowledgeTab === "healthy" ? C.pine : C.inkSoft }}>
                  <Leaf size={14} /> בריא ומותר
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(knowledgeTab === "toxic" ? TOXIC : HEALTHY).map((f) => (
                  <div key={f} className="rounded-lg px-3 py-2 text-[12.5px] font-semibold flex items-center gap-2"
                    style={{ background: knowledgeTab === "toxic" ? "#FDF3F1" : "#F2F8F4", color: knowledgeTab === "toxic" ? C.red : C.pine }}>
                    {knowledgeTab === "toxic" ? "⛔" : "✅"} {f}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11.5px] rounded-lg p-2.5 leading-relaxed" style={{ background: C.blueSoft, color: "#2F5A73" }}>
                💡 טיפ: מעבר בין סוגי מזון עושים בהדרגה לאורך 7 ימים — מערבבים מהחדש עם הישן ביחס גדל, כדי למנוע בעיות עיכול.
              </p>
            </Card>
          </>
        )}

        {/* ================= TAB 5: SHOPS ================= */}
        {tab === "shops" && (
          <>
            <Card className="p-4">
              <SectionTitle icon={ShoppingBag}>חנויות מומלצות בסביבה</SectionTitle>
              <div className="space-y-2.5">
                {SHOPS.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: "#EFE6D6" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: C.amberSoft }}>🏪</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-extrabold">{s.name}</p>
                      <p className="text-[11.5px] flex items-center gap-1.5" style={{ color: C.inkSoft }}>
                        <MapPin size={11} /> {s.dist} · <Stars value={s.rating} />
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Chip tone="pine">{s.note}</Chip>
                      {isDonor && s.id === 1 && <Chip tone="amber">💛 10%- לתורמים</Chip>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <SectionTitle icon={Tag}>השוואת מחירים</SectionTitle>
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.keys(PRICE_DATA).map((k) => (
                  <button key={k} onClick={() => setProduct(k)}
                    className="rounded-lg px-3 py-1.5 text-[11.5px] font-extrabold transition-all"
                    style={{ background: product === k ? C.pine : "#F5F1E8", color: product === k ? "#fff" : C.inkSoft }}>
                    {k}
                  </button>
                ))}
              </div>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#EFE6D6" }}>
                {[...PRICE_DATA[product]].sort((a, b) => a.price - b.price).map((r, i) => {
                  const best = r.price === cheapest;
                  return (
                    <div key={r.shop} className="flex items-center justify-between px-3.5 py-2.5"
                      style={{ background: best ? "#F2F8F4" : i % 2 ? "#FCFAF4" : "#fff", borderBottom: "1px solid #F3EDE0" }}>
                      <div className="flex items-center gap-2">
                        {best && <Sparkles size={14} style={{ color: C.pine }} />}
                        <span className="text-[13px] font-bold" style={{ color: best ? C.pine : C.ink }}>{r.shop}</span>
                        {best && <Chip tone="pine">הכי זול!</Chip>}
                      </div>
                      <span className="text-[14px] font-extrabold" style={{ color: best ? C.pine : C.ink }}>{r.price} ₪</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px]" style={{ color: C.inkSoft }}>
                חיסכון פוטנציאלי: {Math.max(...PRICE_DATA[product].map((r) => r.price)) - cheapest} ₪ על {product}
              </p>
            </Card>
          </>
        )}

        {/* ================= TAB: BREED & PET MATCHER ================= */}
        {tab === "match" && (
          <>
            {/* Preference filters */}
            <Card className="p-4">
              <SectionTitle icon={SlidersHorizontal}>מי מתאים לבית שלכם?</SectionTitle>
              <p className="text-[12px] -mt-1 mb-3" style={{ color: C.inkSoft }}>
                עדכנו את התנאים — הטבלה מדרגת מחדש את ההתאמה בזמן אמת, כולל עמידות לאקלים הישראלי ☀️
              </p>

              <div className="space-y-3">
                <div>
                  <p className="text-[11.5px] font-extrabold mb-1.5">🏠 סוג מגורים</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[["דירה קטנה", 1], ["דירה מרווחת", 2], ["בית + חצר", 3]].map(([l, v]) => (
                      <button key={v} onClick={() => setPrefs((p) => ({ ...p, home: v }))}
                        className="rounded-lg py-2 text-[12px] font-bold transition-all"
                        style={{ background: prefs.home === v ? C.pine : "#F5F1E8", color: prefs.home === v ? "#fff" : C.inkSoft }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11.5px] font-extrabold mb-1.5">⚡ כמה זמן ואנרגיה יש לכם?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[["מעט", 1], ["בינוני", 2], ["הרבה", 3]].map(([l, v]) => (
                      <button key={v} onClick={() => setPrefs((p) => ({ ...p, activity: v }))}
                        className="rounded-lg py-2 text-[12px] font-bold transition-all"
                        style={{ background: prefs.activity === v ? C.pine : "#F5F1E8", color: prefs.activity === v ? "#fff" : C.inkSoft }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setPrefs((p) => ({ ...p, kids: !p.kids }))}
                    className="rounded-lg py-2 text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all"
                    style={{ background: prefs.kids ? C.amberSoft : "#F5F1E8", color: prefs.kids ? "#8A5714" : C.inkSoft }}>
                    <Baby size={14} /> {prefs.kids ? "יש ילדים בבית ✓" : "אין ילדים בבית"}
                  </button>
                  <button onClick={() => setPrefs((p) => ({ ...p, firstTime: !p.firstTime }))}
                    className="rounded-lg py-2 text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all"
                    style={{ background: prefs.firstTime ? C.blueSoft : "#F5F1E8", color: prefs.firstTime ? "#2F5A73" : C.inkSoft }}>
                    <Sparkles size={14} /> {prefs.firstTime ? "חיה ראשונה שלנו ✓" : "יש לנו ניסיון"}
                  </button>
                </div>
              </div>
            </Card>

            {/* Species selector + ranked table */}
            <Card className="p-4">
              <SectionTitle icon={PawPrint}
                extra={
                  <div className="flex gap-1.5">
                    {SPECIES.map((s) => (
                      <button key={s.id} onClick={() => { setSpecies(s.id); setOpenBreed(null); }}
                        className="rounded-lg px-2.5 py-1.5 text-[11.5px] font-extrabold transition-all"
                        style={{ background: species === s.id ? C.amber : "#F5F1E8", color: species === s.id ? "#fff" : C.inkSoft }}>
                        {s.emoji} {s.label}
                      </button>
                    ))}
                  </div>
                }>
                טבלת התאמה
              </SectionTitle>

              {/* header row */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 pb-1.5 text-[10px] font-extrabold" style={{ color: C.inkSoft }}>
                <span>גזע / מין</span>
                <span className="w-12 text-center">אנרגיה</span>
                <span className="w-12 text-center">ילדים</span>
                <span className="w-14 text-center">התאמה</span>
              </div>

              <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#EFE6D6" }}>
                {ranked.map((p, i) => {
                  const open = openBreed === p.name;
                  const tone = p.score >= 85 ? C.pine : p.score >= 65 ? C.amber : C.red;
                  const toneBg = p.score >= 85 ? C.pineSoft : p.score >= 65 ? C.amberSoft : C.redSoft;
                  return (
                    <div key={p.name} style={{ borderBottom: "1px solid #F3EDE0", background: i === 0 ? "#F6FAF7" : i % 2 ? "#FCFAF4" : "#fff" }}>
                      <button onClick={() => setOpenBreed(open ? null : p.name)}
                        className="w-full grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center px-3 py-2.5 text-right">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xl shrink-0">{p.emoji}</span>
                          <div className="min-w-0">
                            <p className="text-[13px] font-extrabold truncate flex items-center gap-1.5">
                              {p.name}
                              {i === 0 && <Chip tone="pine">מוביל 🏆</Chip>}
                            </p>
                            <p className="text-[10.5px]" style={{ color: C.inkSoft }}>{p.size} · {p.life}</p>
                          </div>
                        </div>
                        <span className="w-12 text-center text-[12px] tracking-tight" style={{ color: C.amber }}>{scale3(p.energy, "⚡")}</span>
                        <span className="w-12 text-center text-[12px]" style={{ color: C.pine }}>{scale3(p.kids, "★")}</span>
                        <span className="w-14 text-center rounded-lg py-1 text-[12.5px] font-extrabold" style={{ background: toneBg, color: tone }}>
                          {p.score}%
                        </span>
                      </button>
                      {open && (
                        <div className="px-4 pb-3 pt-1 text-[12px] leading-relaxed" style={{ background: "#FCFAF4" }}>
                          <p style={{ color: C.ink }}>{p.note}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <Chip tone="blue">🏠 מרחב: {scale3(p.space, "▮")}</Chip>
                            <Chip tone={p.heat === 3 ? "pine" : p.heat === 2 ? "amber" : "red"}>☀️ אקלים ישראלי: {["", "רגיש", "סביר", "מצוין"][p.heat]}</Chip>
                            <Chip tone="amber">✂️ טיפוח: {["", "נמוך", "בינוני", "גבוה"][p.groom]}</Chip>
                            <Chip tone={p.beginner === 3 ? "pine" : "blue"}>🎓 לבעלים ראשונים: {["", "פחות", "אפשרי", "מתאים"][p.beginner]}</Chip>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 text-[11.5px] rounded-lg p-2.5 leading-relaxed" style={{ background: C.amberSoft, color: "#8A5714" }}>
                🐾 טיפ ישראלי: לפני קניית גזע — בדקו באתרי העמותות (SOS חיות, אגודת צער בעלי חיים, "יד לחיות").
                אלפי כלבים וחתולים מחפשים בית, ורבים מהם כבר מחוסנים, מעוקרים ומשובבים.
              </p>
            </Card>
          </>
        )}

        {/* ================= TAB: DONATIONS & DONOR CLUB ================= */}
        {tab === "donate" && (
          <>
            {/* Donor status banner */}
            <div className="rounded-2xl p-4 shadow-sm" style={{ background: isDonor ? `linear-gradient(135deg, ${C.pine}, #3E6154)` : "#FFF", border: isDonor ? "none" : "1px solid #EFE6D6" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: isDonor ? "rgba(255,255,255,0.15)" : C.amberSoft }}>
                    {isDonor ? "💛" : "🤍"}
                  </div>
                  <div>
                    <p className="text-[15px] font-extrabold" style={{ color: isDonor ? "#fff" : C.ink }}>
                      {isDonor ? "חברי מועדון התורמים 🐾" : "עדיין לא חברים במועדון"}
                    </p>
                    <p className="text-[12px]" style={{ color: isDonor ? "#CFE1D6" : C.inkSoft }}>
                      {isDonor
                        ? `הוראת קבע פעילה: ${monthlyTotal} ₪ בחודש ל-${Object.keys(donations).length} עמותות`
                        : "הוראת קבע מ-20 ₪ בחודש פותחת הטבות אצל וטרינרים וחנויות"}
                    </p>
                  </div>
                </div>
                {isDonor && (
                  <div className="text-center rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.12)" }}>
                    <p className="font-display text-[21px] leading-none" style={{ color: C.amberSoft }}>{monthlyTotal} ₪</p>
                    <p className="text-[9.5px] font-bold text-white mt-0.5">לחודש</p>
                  </div>
                )}
              </div>
            </div>

            {/* NGO list */}
            <Card className="p-4">
              <SectionTitle icon={HeartHandshake}>עמותות למען בעלי חיים</SectionTitle>
              <div className="space-y-3">
                {ORGS.map((o) => {
                  const active = donations[o.id];
                  const sel = pickAmount[o.id] ?? AMOUNTS[1];
                  return (
                    <div key={o.id} className="rounded-xl border p-3" style={{ borderColor: active ? C.pine : "#EFE6D6", background: active ? "#F4F9F6" : "#fff" }}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">{o.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13.5px] font-extrabold flex items-center gap-2 flex-wrap">
                            {o.name}
                            {active && <Chip tone="pine">תורמים ✓ · {active} ₪/חודש</Chip>}
                          </p>
                          <p className="text-[11px]" style={{ color: C.inkSoft }}>{o.city} · פועלת מאז {o.since}</p>
                          <p className="text-[12px] mt-1 leading-relaxed" style={{ color: C.ink }}>{o.desc}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {o.focus.map((f) => <Chip key={f} tone="blue">{f}</Chip>)}
                          </div>
                        </div>
                      </div>

                      {!active ? (
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex gap-1.5">
                            {AMOUNTS.map((a) => (
                              <button key={a} onClick={() => setPickAmount((p) => ({ ...p, [o.id]: a }))}
                                className="rounded-lg px-3 py-1.5 text-[12px] font-extrabold transition-all"
                                style={{ background: sel === a ? C.amber : "#F5F1E8", color: sel === a ? "#fff" : C.inkSoft }}>
                                {a} ₪
                              </button>
                            ))}
                          </div>
                          <button onClick={() => setStandingOrder(o.id)}
                            className="flex-1 rounded-lg py-2 text-[12px] font-extrabold text-white" style={{ background: C.pine }}>
                            הקמת הוראת קבע 💛
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => cancelStandingOrder(o.id)}
                          className="mt-3 rounded-lg px-3 py-1.5 text-[11.5px] font-bold" style={{ background: "#F5F1E8", color: C.inkSoft }}>
                          ביטול הוראת קבע
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed" style={{ color: C.inkSoft }}>
                כל התרומות מוכרות לזיכוי מס לפי סעיף 46. באב-טיפוס זה התשלום מדומה — באפליקציה אמיתית יחובר סליקה מאובטחת.
              </p>
            </Card>

            {/* Donor club benefits */}
            <Card className="p-4">
              <SectionTitle icon={BadgePercent}
                extra={isDonor ? <Chip tone="pine">פתוח לשימוש ✓</Chip> : <Chip tone="amber">🔒 נעול</Chip>}>
                הטבות מועדון "כפה זהב"
              </SectionTitle>
              <p className="text-[12px] -mt-1 mb-3 leading-relaxed" style={{ color: C.inkSoft }}>
                עסקים מקומיים שבחרו לתת הנחה לתורמים קבועים — הם מקבלים חשיפה בקהילה, אתם חוסכים, והעמותות מקבלות תמיכה יציבה. כולם מרוויחים 🐾
              </p>
              <div className="space-y-2.5">
                {BENEFITS.map((b) => (
                  <div key={b.id} className="rounded-xl border p-3" style={{ borderColor: "#EFE6D6", opacity: isDonor ? 1 : 0.75 }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: C.amberSoft }}>{b.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-extrabold flex items-center gap-2">{b.name} <Chip tone="blue">{b.kind}</Chip></p>
                        <p className="text-[12px] font-semibold" style={{ color: C.pine }}>{b.deal}</p>
                      </div>
                      {isDonor ? (
                        revealedCode === b.id ? (
                          <span className="rounded-lg px-3 py-2 font-mono text-[12px] font-bold tracking-wider" style={{ background: C.pine, color: "#CFE1D6" }}>
                            {b.code}
                          </span>
                        ) : (
                          <button onClick={() => setRevealedCode(b.id)}
                            className="rounded-lg px-3 py-2 text-[11.5px] font-extrabold shrink-0" style={{ background: C.pineSoft, color: C.pine }}>
                            הצגת קוד
                          </button>
                        )
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold shrink-0" style={{ color: C.inkSoft }}>
                          <Lock size={13} /> לתורמים
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {!isDonor && (
                <p className="mt-3 text-[12px] rounded-lg p-2.5 font-semibold text-center" style={{ background: C.amberSoft, color: "#8A5714" }}>
                  💛 הקימו הוראת קבע לאחת העמותות למעלה — וכל ההטבות ייפתחו מיד
                </p>
              )}
            </Card>
          </>
        )}

        {/* ================= TAB: SOS — REPORT & RESCUE ================= */}
        {tab === "sos" && (
          <>
            {/* Hotlines strip */}
            <div className="rounded-2xl p-4" style={{ background: `linear-gradient(135deg, ${C.red}, #D4756A)` }}>
              <div className="flex items-center gap-2 text-white mb-2.5">
                <Siren size={18} />
                <span className="font-extrabold text-[14px]">חיה בסכנת חיים מיידית? מתקשרים, לא מדווחים</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {HOTLINES.map((h) => (
                  <a key={h.name} href={`tel:${h.num}`} className="rounded-xl px-3 py-2 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <span className="text-[11px] font-bold text-white leading-tight">{h.name}</span>
                    <span className="text-[15px] font-extrabold shrink-0 mr-2" style={{ color: "#FDE8D8" }}>{h.num}</span>
                  </a>
                ))}
              </div>
              <p className="text-[10px] mt-2" style={{ color: "#FBDDD6" }}>100 ו-106 אמיתיים · מספרי הכוכבית להדגמה בלבד באב-טיפוס</p>
            </div>

            {/* Quick report form */}
            <Card className="p-4">
              <SectionTitle icon={Share2}>שיתוף מהיר של מקרה</SectionTitle>
              <p className="text-[12px] -mt-1 mb-3" style={{ color: C.inkSoft }}>
                דיווח אחד מגיע בו-זמנית לעמותה, לווטרינר העירוני ולמשטרה — עם מיקום, תמונה ומספר מקרה למעקב.
              </p>

              <p className="text-[11.5px] font-extrabold mb-1.5">1️⃣ מה קרה?</p>
              <div className="grid grid-cols-2 gap-2">
                {REPORT_CATS.map((c) => (
                  <button key={c.id} onClick={() => setRepCat(c.id)}
                    className="rounded-lg px-2.5 py-2 text-[12px] font-bold text-right transition-all"
                    style={{ background: repCat === c.id ? C.redSoft : "#F5F1E8", color: repCat === c.id ? C.red : C.inkSoft, border: repCat === c.id ? `1.5px solid ${C.red}` : "1.5px solid transparent" }}>
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>

              <p className="text-[11.5px] font-extrabold mb-1.5 mt-3">2️⃣ דחיפות</p>
              <div className="grid grid-cols-3 gap-2">
                {[["מיידי 🔴", "now"], ["דחוף 🟠", "urgent"], ["רגיל 🟢", "normal"]].map(([l, v]) => (
                  <button key={v} onClick={() => setRepUrgency(v)}
                    className="rounded-lg py-2 text-[12px] font-bold transition-all"
                    style={{ background: repUrgency === v ? C.pine : "#F5F1E8", color: repUrgency === v ? "#fff" : C.inkSoft }}>
                    {l}
                  </button>
                ))}
              </div>

              <p className="text-[11.5px] font-extrabold mb-1.5 mt-3">3️⃣ פרטים</p>
              <textarea value={repDesc} onChange={(e) => setRepDesc(e.target.value)} rows={2}
                placeholder="תיאור קצר: מה ראיתם, מזהה של החיה, סימנים מיוחדים..."
                className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none resize-none focus:border-[#C25B4E]"
                style={{ borderColor: "#EFE6D6", background: "#FCFAF4" }} />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={() => setRepLoc(!repLoc)}
                  className="rounded-lg py-2 text-[12px] font-bold flex items-center justify-center gap-1.5"
                  style={{ background: repLoc ? C.blueSoft : "#F5F1E8", color: repLoc ? "#2F5A73" : C.inkSoft }}>
                  <MapPin size={14} /> {repLoc ? "המיקום שלי מצורף ✓" : "צירוף מיקום"}
                </button>
                <button onClick={() => setRepPhoto(!repPhoto)}
                  className="rounded-lg py-2 text-[12px] font-bold flex items-center justify-center gap-1.5"
                  style={{ background: repPhoto ? C.amberSoft : "#F5F1E8", color: repPhoto ? "#8A5714" : C.inkSoft }}>
                  <Camera size={14} /> {repPhoto ? "תמונה צורפה ✓" : "צילום / העלאת תמונה"}
                </button>
              </div>

              <p className="text-[11.5px] font-extrabold mb-1.5 mt-3">4️⃣ למי לשלוח?</p>
              <div className="space-y-1.5">
                {RECIPIENTS.map((r) => (
                  <button key={r.id} onClick={() => setRepTo((t) => ({ ...t, [r.id]: !t[r.id] }))}
                    className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-right"
                    style={{ background: repTo[r.id] ? C.pineSoft : "#F5F1E8" }}>
                    {repTo[r.id]
                      ? <CheckCircle2 size={17} style={{ color: C.pine }} />
                      : <Circle size={17} style={{ color: "#C9BEA9" }} />}
                    <span className="text-[12.5px] font-bold" style={{ color: repTo[r.id] ? C.pine : C.inkSoft }}>{r.emoji} {r.label}</span>
                  </button>
                ))}
              </div>

              <button onClick={submitReport} disabled={!repCat}
                className="mt-3.5 w-full rounded-xl py-3 text-[14px] font-extrabold text-white transition-all"
                style={{ background: repCat ? C.red : "#DBCFC0", cursor: repCat ? "pointer" : "not-allowed" }}>
                🚨 שליחת דיווח עכשיו
              </button>
              {!repCat && <p className="text-[10.5px] text-center mt-1.5" style={{ color: C.inkSoft }}>בחרו קטגוריה כדי לשלוח</p>}
            </Card>

            {/* My reports */}
            <Card className="p-4">
              <SectionTitle icon={LifeBuoy} extra={<Chip tone="amber">{reports.length} מקרים</Chip>}>הדיווחים שלי</SectionTitle>
              <div className="space-y-2.5">
                {reports.map((r) => {
                  const cat = REPORT_CATS.find((c) => c.id === r.cat);
                  const urgTone = r.urgency === "now" ? "red" : r.urgency === "urgent" ? "amber" : "pine";
                  return (
                    <div key={r.id} className="rounded-xl border p-3" style={{ borderColor: "#EFE6D6" }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[13px] font-extrabold flex items-center gap-2 flex-wrap">
                            {cat?.emoji} {cat?.label}
                            <span className="font-mono text-[10.5px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#F5F1E8", color: C.inkSoft }}>{r.id}</span>
                          </p>
                          <p className="text-[12px] mt-1 leading-relaxed" style={{ color: C.ink }}>{r.desc}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <Chip tone={urgTone}>{r.urgency === "now" ? "מיידי" : r.urgency === "urgent" ? "דחוף" : "רגיל"}</Chip>
                            {r.photo && <Chip tone="blue">📷 תמונה</Chip>}
                            {r.to.map((t) => <Chip key={t} tone="pine">{RECIPIENTS.find((x) => x.id === t)?.emoji} נשלח</Chip>)}
                          </div>
                        </div>
                        <span className="text-[10.5px] shrink-0" style={{ color: C.inkSoft }}>{r.time}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2.5 pt-2.5" style={{ borderTop: "1px solid #F3EDE0" }}>
                        <span className="text-[11.5px] font-bold" style={{ color: C.pine }}>● {r.status}</span>
                        <button onClick={() => setSharedId(sharedId === r.id ? null : r.id)}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold"
                          style={{ background: C.blueSoft, color: "#2F5A73" }}>
                          <Share2 size={12} /> {sharedId === r.id ? "הקישור הועתק ✓" : "שיתוף לקבוצות"}
                        </button>
                      </div>
                      {sharedId === r.id && (
                        <p className="mt-2 rounded-lg px-2.5 py-1.5 font-mono text-[10.5px] text-center" style={{ background: "#FCFAF4", color: C.inkSoft, border: "1px dashed #E4D9C4" }}>
                          doggylife.app/sos/{r.id} — מוכן להדבקה בוואטסאפ השכונתי 📲
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* First aid */}
            <Card className="p-4">
              <SectionTitle icon={Stethoscope}>עזרה ראשונה עד שמגיעה עזרה</SectionTitle>
              <div className="space-y-2">
                {FIRST_AID.map((a) => {
                  const open = openAid === a.id;
                  return (
                    <div key={a.id} className="rounded-xl border overflow-hidden" style={{ borderColor: open ? C.red : "#EFE6D6" }}>
                      <button onClick={() => setOpenAid(open ? null : a.id)} className="w-full flex items-center gap-3 p-3 text-right">
                        <span className="text-xl">{a.emoji}</span>
                        <span className="flex-1 text-[13.5px] font-extrabold">{a.title}</span>
                        {open ? <ChevronUp size={17} style={{ color: C.inkSoft }} /> : <ChevronDown size={17} style={{ color: C.inkSoft }} />}
                      </button>
                      {open && (
                        <ol className="px-4 pb-3 space-y-1.5" style={{ background: "#FDF6F4" }}>
                          {a.steps.map((s, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed">
                              <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full text-[10px] font-extrabold flex items-center justify-center" style={{ background: C.redSoft, color: C.red }}>{i + 1}</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed rounded-lg p-2.5" style={{ background: C.blueSoft, color: "#2F5A73" }}>
                ℹ️ ההנחיות כלליות ואינן תחליף לווטרינר. בישראל, התעללות בבעלי חיים היא עבירה פלילית לפי חוק צער בעלי חיים — דיווח שלכם יכול להציל חיים.
              </p>
            </Card>
          </>
        )}

        {/* ================= TAB: ANIMAL INDEX ================= */}
        {tab === "index" && (
          <>
            <Card className="p-4">
              <SectionTitle icon={BookOpen}
                extra={<Chip tone="amber">{ANIMAL_INDEX.reduce((a, c) => a + c.groups.reduce((x, g) => x + g.items.length, 0), 0)} רשומות</Chip>}>
                אינדקס חיות המחמד המלא
              </SectionTitle>
              <div className="relative">
                <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3" style={{ color: C.inkSoft }} />
                <input value={idxSearch} onChange={(e) => setIdxSearch(e.target.value)}
                  placeholder="חיפוש גזע או תכונה: האסקי, היפואלרגני, מדבר..."
                  className="w-full rounded-xl border pr-9 pl-3 py-2.5 text-[13px] outline-none focus:border-[#D98E32]"
                  style={{ borderColor: "#EFE6D6", background: "#FCFAF4" }} />
              </div>
            </Card>

            {idxSearch.trim() ? (
              /* ---- search results ---- */
              <Card className="p-4">
                {(() => {
                  const q = idxSearch.trim();
                  const hits = [];
                  ANIMAL_INDEX.forEach((c) => c.groups.forEach((g) => g.items.forEach((it) => {
                    if ((it.n + " " + it.t + " " + (it.tag || "")).includes(q)) hits.push({ ...it, cat: c.cat, emoji: c.emoji, group: g.g });
                  })));
                  return hits.length ? (
                    <div className="space-y-2">
                      <p className="text-[11.5px] font-bold" style={{ color: C.inkSoft }}>{hits.length} תוצאות עבור "{q}"</p>
                      {hits.map((h, i) => (
                        <div key={i} className="rounded-xl border p-3 flex items-start gap-3" style={{ borderColor: "#EFE6D6" }}>
                          <span className="text-xl shrink-0">{h.emoji}</span>
                          <div className="min-w-0">
                            <p className="text-[13.5px] font-extrabold flex items-center gap-2 flex-wrap">
                              {h.n}
                              {h.tag && <Chip tone={h.tag.includes("היתר") || h.tag.includes("רישוי") || h.tag.includes("מוגן") || h.tag.includes("אסור") ? "red" : "blue"}>{h.tag}</Chip>}
                            </p>
                            <p className="text-[12px]" style={{ color: C.inkSoft }}>{h.t}</p>
                            <p className="text-[10.5px] mt-0.5 font-semibold" style={{ color: C.blue }}>{h.cat} › {h.group}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-center py-6" style={{ color: C.inkSoft }}>
                      לא נמצאו תוצאות ל-"{q}" 🐾<br />נסו שם אחר או תכונה כמו "שקט" / "משפחתי"
                    </p>
                  );
                })()}
              </Card>
            ) : (
              /* ---- category accordions ---- */
              ANIMAL_INDEX.map((c) => {
                const open = openCat === c.id;
                const count = c.groups.reduce((a, g) => a + g.items.length, 0);
                return (
                  <Card key={c.id} className="overflow-hidden">
                    <button onClick={() => setOpenCat(open ? null : c.id)} className="w-full flex items-center gap-3 p-4 text-right">
                      <span className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: open ? C.amberSoft : "#F5F1E8" }}>{c.emoji}</span>
                      <div className="flex-1">
                        <p className="font-display text-[16px]">{c.cat}</p>
                        <p className="text-[11px]" style={{ color: C.inkSoft }}>{count} גזעים וזנים{c.note ? " · " + c.note : ""}</p>
                      </div>
                      {open ? <ChevronUp size={18} style={{ color: C.inkSoft }} /> : <ChevronDown size={18} style={{ color: C.inkSoft }} />}
                    </button>
                    {open && (
                      <div className="px-4 pb-4 space-y-3" style={{ background: "#FCFAF4" }}>
                        {c.groups.map((g) => (
                          <div key={g.g}>
                            <p className="text-[11.5px] font-extrabold pt-2 pb-1.5 flex items-center gap-1.5" style={{ color: C.pine }}>
                              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: C.amber }} /> {g.g}
                            </p>
                            <div className="grid sm:grid-cols-2 gap-1.5">
                              {g.items.map((it) => (
                                <div key={it.n} className="rounded-lg bg-white border px-2.5 py-2" style={{ borderColor: "#EFE6D6" }}>
                                  <p className="text-[12.5px] font-extrabold flex items-center gap-1.5 flex-wrap">
                                    {it.n}
                                    {it.tag && <Chip tone={it.tag.includes("היתר") || it.tag.includes("רישוי") || it.tag.includes("מוגן") || it.tag.includes("אסור") ? "red" : it.tag === "ישראלי" ? "pine" : "blue"}>{it.tag}</Chip>}
                                  </p>
                                  <p className="text-[11px] leading-snug" style={{ color: C.inkSoft }}>{it.t}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })
            )}

            <p className="text-[11px] text-center leading-relaxed" style={{ color: C.inkSoft }}>
              ⚖️ שימו לב: החזקת חיות בר, זוחלים מסוימים וגזעי כלבים מסוכנים כפופה בישראל להיתרים — בדקו מול משרד החקלאות ורט"ג
            </p>
          </>
        )}

        {/* ================= TAB: SETTINGS ================= */}
        {tab === "settings" && (
          <>
            {/* My pets */}
            <Card className="p-4">
              <SectionTitle icon={PawPrint} extra={<Chip tone="amber">{roster.length} חיות</Chip>}>החיות שלי</SectionTitle>
              {saveWarn && (
                <div className="mb-3 rounded-xl p-3 text-[12px] font-bold flex items-start gap-2"
                  style={{ background: C.redSoft, color: C.red, border: `1px solid ${C.red}33` }}>
                  <AlertTriangle size={15} className="shrink-0 mt-[1px]" /><span>{saveWarn}</span>
                </div>
              )}
              <div className="space-y-2.5">
                {roster.map((p) => {
                  const on = p.id === activeId;
                  const editing = editId === p.id;
                  return (
                    <div key={p.id} className="rounded-xl border p-3" style={{ borderColor: on ? C.amber : "#EFE6D6", background: on ? "#FEF8ED" : "#fff" }}>
                      <div className="flex items-center gap-3">
                        <PetAvatar pet={p} size={44} radius={14} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13.5px] font-extrabold flex items-center gap-2">{p.name} {on && <Chip tone="amber">פעיל/ה ✓</Chip>}</p>
                          <p className="text-[11.5px]" style={{ color: C.inkSoft }}>{p.species} · {p.breed} · {fmtAge(p.ageMonths)} · {fmtWeight(p.weight)}</p>
                        </div>
                        {!on && (
                          <button onClick={() => setActiveId(p.id)} className="rounded-lg px-3 py-1.5 text-[11.5px] font-extrabold shrink-0" style={{ background: C.pineSoft, color: C.pine }}>
                            מעבר
                          </button>
                        )}
                        <button onClick={() => setEditId(editing ? null : p.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: editing ? C.pine : C.pineSoft, color: editing ? "#fff" : C.pine }}
                          title="עריכת פרטים">
                          <SlidersHorizontal size={14} />
                        </button>
                        <button onClick={() => removePet(p.id)} disabled={roster.length <= 1}
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: C.redSoft, color: C.red, opacity: roster.length <= 1 ? 0.4 : 1 }}
                          title="הסרה">
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {editing && (
                        <div className="mt-3 pt-3 border-t" style={{ borderColor: "#EFE6D6" }}>
                          {/* profile photo */}
                          <div className="flex items-center gap-3">
                            <PetAvatar pet={p} size={56} radius={16} />
                            <div className="flex-1">
                              <p className="text-[11.5px] font-extrabold mb-1.5">תמונת פרופיל</p>
                              <div className="flex gap-1.5 flex-wrap">
                                <label className="rounded-lg px-3 py-1.5 text-[11.5px] font-extrabold cursor-pointer flex items-center gap-1.5"
                                  style={{ background: C.blueSoft, color: C.blue }}>
                                  <Camera size={13} /> {p.photo ? "החלפת תמונה" : "העלאת תמונה"}
                                  <input type="file" accept="image/*" className="hidden"
                                    onChange={(e) => { pickPhoto(e.target.files?.[0], (d) => updatePet(p.id, { photo: d })); e.target.value = ""; }} />
                                </label>
                                {p.photo && (
                                  <button onClick={() => updatePet(p.id, { photo: null })}
                                    className="rounded-lg px-3 py-1.5 text-[11.5px] font-extrabold" style={{ background: C.redSoft, color: C.red }}>
                                    הסרה
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* name / breed */}
                          <div className="flex gap-2 mt-3">
                            <div className="flex-1">
                              <p className="text-[11px] font-bold mb-1" style={{ color: C.inkSoft }}>שם</p>
                              <input value={p.name} onChange={(e) => updatePet(p.id, { name: e.target.value })}
                                className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#D98E32]" style={{ borderColor: "#EFE6D6", background: "#fff" }} />
                            </div>
                            <div className="flex-1">
                              <p className="text-[11px] font-bold mb-1" style={{ color: C.inkSoft }}>גזע</p>
                              <input value={p.breed} onChange={(e) => updatePet(p.id, { breed: e.target.value })}
                                className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#D98E32]" style={{ borderColor: "#EFE6D6", background: "#fff" }} />
                            </div>
                          </div>

                          {/* age + weight */}
                          <div className="flex gap-2 mt-2 items-end">
                            <div className="w-20">
                              <p className="text-[11px] font-bold mb-1" style={{ color: C.inkSoft }}>שנים</p>
                              <input type="number" min="0" max="40" inputMode="numeric" value={Math.floor((p.ageMonths || 0) / 12)}
                                onChange={(e) => updatePet(p.id, { ageMonths: toAgeMonths(e.target.value, (p.ageMonths || 0) % 12) })}
                                className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#D98E32]" style={{ borderColor: "#EFE6D6", background: "#fff" }} />
                            </div>
                            <div className="w-20">
                              <p className="text-[11px] font-bold mb-1" style={{ color: C.inkSoft }}>חודשים</p>
                              <input type="number" min="0" max="11" inputMode="numeric" value={(p.ageMonths || 0) % 12}
                                onChange={(e) => updatePet(p.id, { ageMonths: toAgeMonths(Math.floor((p.ageMonths || 0) / 12), e.target.value) })}
                                className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#D98E32]" style={{ borderColor: "#EFE6D6", background: "#fff" }} />
                            </div>
                            <div className="flex-1">
                              <p className="text-[11px] font-bold mb-1" style={{ color: C.inkSoft }}>משקל (ק"ג)</p>
                              <input type="number" min="0" step="0.1" inputMode="decimal" value={p.weight}
                                onChange={(e) => updatePet(p.id, { weight: Number(e.target.value) || 0 })}
                                className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#D98E32]" style={{ borderColor: "#EFE6D6", background: "#fff" }} />
                            </div>
                          </div>
                          <p className="text-[11px] mt-2" style={{ color: C.inkSoft }}>
                            {fmtAge(p.ageMonths)} · {fmtWeight(p.weight)} · נשמר אוטומטית ✓
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* add pet */}
              <div className="mt-3 rounded-xl border p-3" style={{ borderColor: "#EFE6D6", background: "#FCFAF4" }}>
                <p className="text-[12px] font-extrabold mb-2 flex items-center gap-1.5"><PlusCircle size={14} style={{ color: C.pine }} /> הוספת חיה חדשה</p>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {SPECIES_OPTIONS.map((sp) => (
                    <button key={sp.label} onClick={() => setNewPet((n) => ({ ...n, species: sp }))}
                      className="shrink-0 rounded-lg px-2.5 py-1.5 text-[11.5px] font-bold"
                      style={{ background: newPet.species.label === sp.label ? C.pine : "#fff", color: newPet.species.label === sp.label ? "#fff" : C.inkSoft, border: "1px solid #EFE6D6" }}>
                      {sp.emoji} {sp.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input value={newPet.name} onChange={(e) => setNewPet((n) => ({ ...n, name: e.target.value }))}
                    placeholder="שם" className="w-28 rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#D98E32]" style={{ borderColor: "#EFE6D6", background: "#fff" }} />
                  <input value={newPet.breed} onChange={(e) => setNewPet((n) => ({ ...n, breed: e.target.value }))}
                    placeholder="גזע (אופציונלי)" className="flex-1 rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#D98E32]" style={{ borderColor: "#EFE6D6", background: "#fff" }} />
                </div>

                {/* age + weight */}
                <div className="flex gap-2 mt-2">
                  <input type="number" min="0" max="40" inputMode="numeric" value={newPet.years}
                    onChange={(e) => setNewPet((n) => ({ ...n, years: e.target.value }))}
                    placeholder="שנים" className="w-[72px] rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#D98E32]" style={{ borderColor: "#EFE6D6", background: "#fff" }} />
                  <input type="number" min="0" max="11" inputMode="numeric" value={newPet.months}
                    onChange={(e) => setNewPet((n) => ({ ...n, months: e.target.value }))}
                    placeholder="חודשים" className="w-[86px] rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#D98E32]" style={{ borderColor: "#EFE6D6", background: "#fff" }} />
                  <input type="number" min="0" step="0.1" inputMode="decimal" value={newPet.weight}
                    onChange={(e) => setNewPet((n) => ({ ...n, weight: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && addPet()}
                    placeholder='משקל בק"ג' className="flex-1 rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#D98E32]" style={{ borderColor: "#EFE6D6", background: "#fff" }} />
                </div>

                {/* profile photo + submit */}
                <div className="flex gap-2 mt-2 items-center">
                  <PetAvatar pet={{ photo: newPet.photo, emoji: newPet.species.emoji, name: "חדש" }} size={44} radius={14} />
                  <label className="rounded-lg px-3 py-2 text-[12px] font-extrabold cursor-pointer flex items-center gap-1.5"
                    style={{ background: C.blueSoft, color: C.blue }}>
                    <Camera size={14} /> {photoBusy ? "טוען…" : newPet.photo ? "החלפת תמונה" : "תמונת פרופיל"}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => { pickPhoto(e.target.files?.[0], (d) => setNewPet((n) => ({ ...n, photo: d }))); e.target.value = ""; }} />
                  </label>
                  {newPet.photo && (
                    <button onClick={() => setNewPet((n) => ({ ...n, photo: null }))}
                      className="rounded-lg px-2.5 py-2 text-[12px] font-extrabold" style={{ background: C.redSoft, color: C.red }}>
                      <X size={13} />
                    </button>
                  )}
                  <button onClick={addPet} disabled={!newPet.name.trim()}
                    className="flex-1 rounded-lg px-4 py-2 text-[12.5px] font-extrabold text-white" style={{ background: newPet.name.trim() ? C.pine : "#DBCFC0" }}>
                    הוספה
                  </button>
                </div>
                {photoErr && <p className="text-[11px] mt-1.5 font-bold" style={{ color: C.red }}>{photoErr}</p>}
                <p className="text-[10.5px] mt-1.5" style={{ color: C.inkSoft }}>
                  גיל ומשקל אופציונליים — אפשר להשלים בכל רגע דרך ✎ בכרטיס החיה
                </p>
              </div>
            </Card>

            {/* Notifications & display */}
            <Card className="p-4">
              <SectionTitle icon={Settings}>התראות ותצוגה</SectionTitle>
              <div className="divide-y divide-[#F3EDE0]">
                {[
                  ["🔔 תזכורות שגרה יומית", "ארוחות, טיולים ומים", notifDaily, setNotifDaily],
                  ["💉 התראות חיסונים וטיפולים", "שבוע ו-48 שעות מראש", notifVax, setNotifVax],
                  ["🐾 עדכוני קהילה", "קבוצות הליכה ולוח שיתוף", notifCommunity, setNotifCommunity],
                  ["🎬 צמצום אנימציות", "כיבוי כל האפקטים והתנועה", motionOff, setMotionOff],
                ].map(([title, sub, val, setter]) => (
                  <button key={title} onClick={() => setter(!val)} className="w-full flex items-center justify-between py-3 text-right">
                    <div>
                      <p className="text-[13px] font-extrabold">{title}</p>
                      <p className="text-[11px]" style={{ color: C.inkSoft }}>{sub}</p>
                    </div>
                    <span className="w-11 h-6 rounded-full relative shrink-0 transition-all" style={{ background: val ? C.pine : "#E2D8C6" }}>
                      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ right: val ? 2 : 22 }} />
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Emergency vet */}
            <Card className="p-4">
              <SectionTitle icon={Stethoscope}>וטרינר קבוע לחירום</SectionTitle>
              <div className="space-y-2">
                <input value={vet.name} onChange={(e) => setVet((v) => ({ ...v, name: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#2F4A40]" style={{ borderColor: "#EFE6D6", background: "#FCFAF4" }} />
                <input value={vet.phone} onChange={(e) => setVet((v) => ({ ...v, phone: e.target.value }))} inputMode="tel"
                  className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#2F4A40]" style={{ borderColor: "#EFE6D6", background: "#FCFAF4" }} />
              </div>
              <p className="text-[11px] mt-2" style={{ color: C.inkSoft }}>
                הפרטים מתעדכנים מיד בתעודה הדיגיטלית ואצל פאבל ה-AI 🤖
              </p>
            </Card>

            <p className="text-[11px] text-center" style={{ color: C.inkSoft }}>
              DoggyLife v3.0 🐾 · אב-טיפוס · הנתונים נשמרים בזיכרון הדפדפן בלבד למשך הסשן
            </p>
          </>
        )}

        {/* ================= TAB 6: DOG ID ================= */}
        {tab === "id" && (
          <>
            <div className="rounded-3xl overflow-hidden shadow-lg border" style={{ borderColor: "#E4D9C4" }}>
              <div className="shimmer p-4 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${C.amber}, #E8A957)` }}>
                <div className="flex items-center gap-2 text-white">
                  <BadgeCheck size={20} />
                  <span className="font-extrabold text-[15px]">תעודת חיה דיגיטלית · DoggyLife ID</span>
                </div>
                <span className="text-white text-lg">🐾</span>
              </div>
              <div className="bg-white p-5">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl border-4" style={{ background: C.amberSoft, borderColor: "#F0DDBC" }}>{P.emoji}</div>
                  <div>
                    <h2 className="font-display text-[30px] leading-none">{P.name}</h2>
                    <p className="text-[13px] font-semibold" style={{ color: C.inkSoft }}>{P.species} · {P.breed} · {P.sex}</p>
                    <div className="flex gap-1.5 mt-2">
                      <Chip tone="pine">{fem ? "מחוסנת חלקית" : "מחוסן חלקית"}</Chip>
                      <Chip tone="blue">{fem ? "משובבת ✓" : "משובב ✓"}</Chip>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    ["גיל", fmtAge(P.ageMonths)],
                    ["משקל", fmtWeight(P.weight)],
                    ["אימוץ", fmt(petAdoptionDate)],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl p-2.5 text-center" style={{ background: "#FCFAF4", border: "1px solid #EFE6D6" }}>
                      <p className="text-[10px] font-bold" style={{ color: C.inkSoft }}>{k}</p>
                      <p className="text-[13px] font-extrabold mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-xl p-3 font-mono text-[12px] tracking-widest text-center" style={{ background: C.pine, color: "#CFE1D6" }}>
                  מס' שבב · {P.chip}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: "#EFE6D6" }}>
                    <Stethoscope size={18} style={{ color: C.pine }} />
                    <div className="flex-1">
                      <p className="text-[12.5px] font-extrabold">{vet.name}</p>
                      <p className="text-[11.5px]" style={{ color: C.inkSoft }}>וטרינר קבוע</p>
                    </div>
                    <a href={`tel:${vet.phone}`} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-extrabold" style={{ background: C.pineSoft, color: C.pine }}>
                      <Phone size={13} /> {vet.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: C.redSoft }}>
                    <AlertTriangle size={18} style={{ color: C.red }} />
                    <p className="text-[12.5px] font-extrabold" style={{ color: C.red }}>{EMERGENCY}</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-4">
              <SectionTitle icon={Heart}>הישגים של {P.name}</SectionTitle>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[["🏆", "שבוע ראשון"], ["🦴", '"שב" הושלם'], ["🐾", "10 טיולים"], ["💧", "שגרת מים"]].map(([e, t]) => (
                  <div key={t} className="rounded-xl p-2.5" style={{ background: "#FCFAF4", border: "1px solid #EFE6D6" }}>
                    <p className="text-2xl">{e}</p>
                    <p className="text-[10px] font-bold mt-1" style={{ color: C.inkSoft }}>{t}</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </main>

      <footer className="text-center pb-28 text-[11px] font-semibold" style={{ color: C.inkSoft }}>
        DoggyLife 🐾 מלווים אתכם מהיום הראשון · אב-טיפוס אינטראקטיבי
      </footer>
    </div>
  );
}
