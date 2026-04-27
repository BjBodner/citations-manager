# Citations Manager – CLAUDE.md

## מהו הפרויקט
אפליקציית React מקומית לניהול ציטוטים (Prior Art) עבור בוחן פטנטים.
רצה כולה בדפדפן, ללא שרת, נתונים ב-localStorage בלבד.

## סטאק טכנולוגי
- **Framework:** React + Vite
- **State/Storage:** localStorage (אין backend, אין DB)
- **Charts:** Recharts
- **שפה/כיוון:** עברית, RTL לאורך כל הממשק
- **דפדפנים:** Chrome / Safari / Firefox עדכניים

## מבנה הנתונים המרכזי (JSON Schema)
```
{
  version, exportedAt, settings, streak,
  boards: [{ id, name, createdAt, citations: [{
    id, publicationNumber, title, abstract, link, notes,
    status, subClassification, createdAt, updatedAt, completedAt
  }] }]
}
```

## עמודות Kanban (status)
| ערך | תצוגה | צבע |
|-----|--------|------|
| `todo` | טרם התחיל | אפור |
| `in-progress` | בביצוע | כחול |
| `relevant` | רלוונטי | ירוק |
| `irrelevant` | לא רלוונטי | אדום |

## תת-סיווג (subClassification) – רק כשסטטוס = `relevant`
- **X** – פוסל לבד
- **Y** – פוסל בשילוב
- **I** – מעניין / רקע טכנולוגי
- **A** – רקע כללי

## התנהגות לחיצה על לינק
- כרטיס ב-`todo` → עובר אוטומטית ל-`in-progress` + פותח טאב חדש
- כרטיס בכל עמודה אחרת → פותח טאב חדש בלבד, ללא שינוי סטטוס

## ייבוא CSV
כותרות קבועות: `publication_number, title, abstract, link, notes`
- תצוגה מקדימה לפני אישור
- ולידציה + הודעת שגיאה מפורטת לשורות שגויות
- כפתור "הורד דוגמת CSV" עם 2-3 שורות

## גיבוי JSON
- ייצוא/ייבוא ידני (החלפה מלאה או מיזוג)
- גיבוי אוטומטי יומי – עד 7 snapshots אחרונים ב-localStorage
- אזהרה כשה-localStorage מתקרב לקיבולת

## Gamification
- **Progress Bar יומי** – יעד ברירת מחדל 10 ציטוטים (ניתן לשינוי)
  - סופר: כרטיסים שעברו ל-`relevant` או `irrelevant` היום
- **Streak** – אייקון להבה + מספר ימים רצופים שעמדו ביעד
- **Confetti** – כשמגיעים ליעד היומי
- **צליל "ping"** – במעבר כרטיס (ניתן לכבות)

## Milestones לפיתוח
| שלב | תוכן |
|-----|-------|
| M1 | שלד Vite+React, localStorage, לוח + CRUD בסיסי |
| M2 | Tabs X/Y/I/A, מסך בחירת תיק, ניווט |
| M3 | CSV + JSON, גיבוי יומי |
| M4 | Progress Bar, Streak, אנימציות, צלילים |
| M5 | דשבורד סטטיסטיקות (Recharts) |
| M6 | Dark Mode, קיצורי מקלדת, ליטוש UX |

## מה מחוץ להיקף
- אין משתמשים מרובים / שיתוף / הרשאות
- אין סנכרון ענן
- אין אינטגרציה לEPO/USPTO/Espacenet
- אין גרסת מובייל

## כללי פיתוח
- כל הטקסטים בממשק – עברית, dir="rtl"
- ביצועים: טעינה < 1 שנייה, תמיכה ב-5,000+ ציטוטים
- פרטיות: אפס שליחת נתונים החוצה, אפס analytics
- קיצורי מקלדת: `N` = ציטוט חדש, `/` = חיפוש
