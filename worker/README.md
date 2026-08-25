# ALPHA HOME WORKER — הסוכנים עובדים 24/7 על המחשב הביתי

הסקריפט הזה רץ **ליד LM Studio על המחשב שלך** ומריץ את סבבי העבודה של 13
הסוכנים גם כשהדפדפן סגור — טוקנים חינמיים, בלי ענן. התוצרים מצטברים
ב-outbox מקומי, ומרכז הסוכנים מושך אותם אוטומטית בפעם הבאה שהוא נפתח:
רעיונות ללוח, התראות לפיד, טיוטות פרסום לתור האישורים של SYRAX, ותובנות
השקעה לדסק של ראובן. **שום דבר לא מתפרסם או מבוצע בלי אישור שלך.**

## התקנה (חד-פעמית)

1. ודא ש-Node מותקן (גרסה 18+): `node -v`. אם לא — https://nodejs.org
2. ודא ש-LM Studio רץ עם השרת דולק (Developer → Start Server) ומודל טעון.
3. הפעל מתיקיית הפרויקט:

```
node worker/alpha-worker.mjs
```

זהו. תראה לוג חי של הסבבים:

```
14:22:01 · ALPHA HOME WORKER up · outbox on http://localhost:8799 · ...
14:22:21 · AEX-PRIME: IDEA → להציע לחמשת הלקוחות הגדולים...
```

## הגדרות (רשות — משתני סביבה)

| משתנה | ברירת מחדל | תיאור |
|---|---|---|
| `LMS_URL` | `http://localhost:1234` | כתובת LM Studio (בלי ‎/v1‎ — נוסף לבד) |
| `LMS_MODEL` | המודל הטעון | שם מודל ספציפי |
| `LMS_KEY` | — | API Key אם הדלקת Require Authentication |
| `PORT` | `8799` | פורט ה-outbox |
| `CYCLE_MIN` | `8` | דקות בין סבבי עבודה |

דוגמה: `CYCLE_MIN=15 node worker/alpha-worker.mjs`

## שיהיה קבוע (אוטומטי אחרי ריסטארט) — Windows

הדרך הפשוטה: **Task Scheduler** → Create Basic Task →
Trigger: "When the computer starts" → Action: Start a program →
Program: `node`, Arguments: `worker\alpha-worker.mjs`,
Start in: תיקיית הפרויקט. (או עם pm2: `npm i -g pm2` ואז
`pm2 start worker/alpha-worker.mjs --name alpha-worker && pm2 save`)

## איך האפליקציה מוצאת את ה-Worker

מרכז הסוכנים גוזר את כתובת ה-Worker אוטומטית מכתובת LM Studio שבהגדרות
(אותו מחשב, פורט 8799). כשהאפליקציה פתוחה היא גם דוחפת ל-Worker תמונת
נתונים עסקית טרייה כל כמה דקות, כדי שהסבבים יתבססו על מספרים אמיתיים.

אם אתה נכנס מהטלפון דרך מנהרת Cloudflare — אפשר לחשוף גם את ה-outbox
בהוספת ingress (ראה הדוגמה המוערת ב-config.yml), ואז להגדיר באפליקציה
localStorage: `alpha:agents:workerUrl` = `https://worker.matrix.הדומיין.com`.
זה לא חובה: ה-Worker עובד גם בלי זה, והתוצרים ייקלטו בכניסה הבאה מהמחשב.

## מה ה-Worker לא עושה

- לא מפרסם פוסטים (טיוטות מחכות לאישור באפליקציה).
- לא מבצע עסקאות (תובנות בלבד לדסק ההשקעות).
- לא נוגע בנתוני ה-CRM — כותב רק ל-outbox שלו.
