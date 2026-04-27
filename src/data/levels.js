// Each level defines:
//   palette: per-status visuals { bg, border, accent }
//   cardTheme: 'soft' | 'paper' | 'gradient' | 'glass' | 'neon' | 'rainbow'
//   quote: Hebrew inspirational quote shown in the HUD

export const LEVELS = [
  {
    id: 0,
    name: 'מתחיל',
    icon: '🌱',
    cardTheme: 'soft',
    quote: 'מסע של אלף מיל מתחיל בצעד אחד.',
    palette: {
      todo:          { bg: '#f9fafb', border: '#e5e7eb', accent: '#9ca3af' },
      'in-progress': { bg: '#eff6ff', border: '#bfdbfe', accent: '#3b82f6' },
      relevant:      { bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a' },
      irrelevant:    { bg: '#fef2f2', border: '#fecaca', accent: '#dc2626' }
    }
  },
  {
    id: 1,
    name: 'סייר',
    icon: '🔍',
    cardTheme: 'soft',
    quote: 'הסקרנות היא הניצוץ של הגילוי.',
    palette: {
      todo:          { bg: '#f5f3ff', border: '#ddd6fe', accent: '#8b5cf6' },
      'in-progress': { bg: '#ecfeff', border: '#a5f3fc', accent: '#06b6d4' },
      relevant:      { bg: '#ecfdf5', border: '#a7f3d0', accent: '#059669' },
      irrelevant:    { bg: '#fff1f2', border: '#fecdd3', accent: '#e11d48' }
    }
  },
  {
    id: 2,
    name: 'חוקר',
    icon: '🧭',
    cardTheme: 'paper',
    quote: 'מי שמחפש – מוצא. מי שמתעקש – משנה.',
    palette: {
      todo:          { bg: '#fafaf9', border: '#e7e5e4', accent: '#78716c' },
      'in-progress': { bg: '#fefce8', border: '#fde68a', accent: '#ca8a04' },
      relevant:      { bg: '#f7fee7', border: '#d9f99d', accent: '#65a30d' },
      irrelevant:    { bg: '#fff7ed', border: '#fed7aa', accent: '#ea580c' }
    }
  },
  {
    id: 3,
    name: 'אנליסט',
    icon: '📊',
    cardTheme: 'gradient',
    quote: 'כל פרט קטן הוא חתיכה בפאזל הגדול.',
    palette: {
      todo:          { bg: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)', border: '#cbd5e1', accent: '#64748b' },
      'in-progress': { bg: 'linear-gradient(135deg,#dbeafe,#c7d2fe)', border: '#a5b4fc', accent: '#4f46e5' },
      relevant:      { bg: 'linear-gradient(135deg,#d1fae5,#bbf7d0)', border: '#86efac', accent: '#15803d' },
      irrelevant:    { bg: 'linear-gradient(135deg,#fee2e2,#fecaca)', border: '#fca5a5', accent: '#b91c1c' }
    }
  },
  {
    id: 4,
    name: 'מומחה',
    icon: '🛡',
    cardTheme: 'glass',
    quote: 'מומחיות היא חזרה ועוד חזרה, עם תשומת לב.',
    palette: {
      todo:          { bg: 'linear-gradient(135deg,#1f2937,#374151)', border: '#4b5563', accent: '#fbbf24' },
      'in-progress': { bg: 'linear-gradient(135deg,#1e3a8a,#312e81)', border: '#4338ca', accent: '#60a5fa' },
      relevant:      { bg: 'linear-gradient(135deg,#064e3b,#065f46)', border: '#047857', accent: '#34d399' },
      irrelevant:    { bg: 'linear-gradient(135deg,#7f1d1d,#991b1b)', border: '#b91c1c', accent: '#fca5a5' }
    }
  },
  {
    id: 5,
    name: 'אלוף',
    icon: '🏆',
    cardTheme: 'neon',
    quote: 'אלופים לא נולדים – הם נבנים, ציטוט אחד בכל פעם.',
    palette: {
      todo:          { bg: '#1a0b2e', border: '#3b1d68', accent: '#a855f7' },
      'in-progress': { bg: '#0c1e3a', border: '#1e3a8a', accent: '#38bdf8' },
      relevant:      { bg: '#0a2818', border: '#14532d', accent: '#22d3ee' },
      irrelevant:    { bg: '#2a0a1c', border: '#831843', accent: '#f43f5e' }
    }
  },
  {
    id: 6,
    name: 'מאסטר',
    icon: '🎯',
    cardTheme: 'gradient',
    quote: 'הדיוק הוא אמנות שצומחת מתוך נחישות.',
    palette: {
      todo:          { bg: 'linear-gradient(135deg,#fdf4ff,#fae8ff)', border: '#f0abfc', accent: '#a21caf' },
      'in-progress': { bg: 'linear-gradient(135deg,#cffafe,#a5f3fc)', border: '#67e8f9', accent: '#0891b2' },
      relevant:      { bg: 'linear-gradient(135deg,#fef3c7,#fde68a)', border: '#fcd34d', accent: '#b45309' },
      irrelevant:    { bg: 'linear-gradient(135deg,#fce7f3,#fbcfe8)', border: '#f9a8d4', accent: '#be185d' }
    }
  },
  {
    id: 7,
    name: 'גורו',
    icon: '🦉',
    cardTheme: 'paper',
    quote: 'חוכמה היא לדעת מה לא רלוונטי – ולשחרר אותו.',
    palette: {
      todo:          { bg: '#fdfaf6', border: '#e7d8c1', accent: '#92400e' },
      'in-progress': { bg: '#f0f9ff', border: '#bae6fd', accent: '#075985' },
      relevant:      { bg: '#f0fdfa', border: '#99f6e4', accent: '#0f766e' },
      irrelevant:    { bg: '#fef2f2', border: '#fecaca', accent: '#9f1239' }
    }
  },
  {
    id: 8,
    name: 'וירטואוז',
    icon: '⚡',
    cardTheme: 'neon',
    quote: 'מהירות בלי דיוק – רעש. דיוק בלי מהירות – החמצה.',
    palette: {
      todo:          { bg: '#0a0a0a', border: '#262626', accent: '#eab308' },
      'in-progress': { bg: '#082f49', border: '#0369a1', accent: '#22d3ee' },
      relevant:      { bg: '#052e16', border: '#15803d', accent: '#84cc16' },
      irrelevant:    { bg: '#450a0a', border: '#7f1d1d', accent: '#f97316' }
    }
  },
  {
    id: 9,
    name: 'אגדה',
    icon: '🌟',
    cardTheme: 'gradient',
    quote: 'אגדות נכתבות על ידי אלה שלא הפסיקו.',
    palette: {
      todo:          { bg: 'linear-gradient(135deg,#fef3c7,#fde68a,#fbbf24)', border: '#f59e0b', accent: '#92400e' },
      'in-progress': { bg: 'linear-gradient(135deg,#dbeafe,#bfdbfe,#60a5fa)', border: '#3b82f6', accent: '#1e3a8a' },
      relevant:      { bg: 'linear-gradient(135deg,#bbf7d0,#86efac,#4ade80)', border: '#22c55e', accent: '#14532d' },
      irrelevant:    { bg: 'linear-gradient(135deg,#fecaca,#fca5a5,#f87171)', border: '#ef4444', accent: '#7f1d1d' }
    }
  },
  {
    id: 10,
    name: 'מיתוס',
    icon: '🔥',
    cardTheme: 'neon',
    quote: 'האש שדולקת בפנים גדולה מכל מכשול בחוץ.',
    palette: {
      todo:          { bg: 'linear-gradient(135deg,#1e1b4b,#312e81)', border: '#6366f1', accent: '#fde047' },
      'in-progress': { bg: 'linear-gradient(135deg,#082f49,#0c4a6e)', border: '#0ea5e9', accent: '#67e8f9' },
      relevant:      { bg: 'linear-gradient(135deg,#14532d,#166534)', border: '#22c55e', accent: '#fde047' },
      irrelevant:    { bg: 'linear-gradient(135deg,#7c2d12,#9a3412)', border: '#ea580c', accent: '#fef3c7' }
    }
  },
  {
    id: 11,
    name: 'אלוהים של הפטנטים',
    icon: '✨',
    cardTheme: 'rainbow',
    quote: 'הגעת. עכשיו תלמד אחרים את הדרך.',
    palette: {
      todo:          { bg: 'linear-gradient(135deg,#fdf4ff,#fce7f3,#fef3c7)', border: '#f472b6', accent: '#a21caf' },
      'in-progress': { bg: 'linear-gradient(135deg,#dbeafe,#e0e7ff,#cffafe)', border: '#818cf8', accent: '#1d4ed8' },
      relevant:      { bg: 'linear-gradient(135deg,#bbf7d0,#fef3c7,#fed7aa)', border: '#facc15', accent: '#15803d' },
      irrelevant:    { bg: 'linear-gradient(135deg,#fecdd3,#fbcfe8,#e9d5ff)', border: '#f472b6', accent: '#9f1239' }
    }
  }
]

export function getLevel(n) {
  const idx = Math.max(0, Math.min(n | 0, LEVELS.length - 1))
  return LEVELS[idx]
}

export const COMPLETIONS_PER_LEVEL = 3

export const COMPLETION_MESSAGES = [
  'כל הכבוד! 🎉',
  'מצוין! 💪',
  'עוד אחד נפל! ⚡',
  'אתה במומנטום! 🚀',
  'שיט מדויק! 🎯',
  'הראש שלך עובד! 🧠',
  'אש! 🔥',
  'בול בפוני! 🏹',
  'יפה מאוד! ✨',
  'ממשיכים חזק! 💎'
]

export function randomCompletionMessage() {
  return COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)]
}
