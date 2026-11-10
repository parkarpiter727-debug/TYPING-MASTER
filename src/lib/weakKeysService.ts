import { Language } from '../types/index.ts';

const LOCAL_STORAGE_WEAK_KEYS = 'typemaster_weak_keys_stats';

export interface KeyStat {
  key: string;
  totalAttempts: number;
  errors: number;
  lastMissedAt?: number;
}

export type WeakKeysMap = Record<string, KeyStat>;

export function getWeakKeyStats(): WeakKeysMap {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_WEAK_KEYS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function recordKeyAttempt(key: string, isCorrect: boolean): void {
  if (!key || key.length !== 1) return;
  const lowerKey = key.toLowerCase();
  const stats = getWeakKeyStats();
  
  if (!stats[lowerKey]) {
    stats[lowerKey] = {
      key: lowerKey,
      totalAttempts: 0,
      errors: 0,
    };
  }

  stats[lowerKey].totalAttempts += 1;
  if (!isCorrect) {
    stats[lowerKey].errors += 1;
    stats[lowerKey].lastMissedAt = Date.now();
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_WEAK_KEYS, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function getTopWeakKeys(limit = 6, lang: Language = 'english'): Array<KeyStat & { errorRate: number }> {
  const stats = getWeakKeyStats();
  const list = Object.values(stats)
    .filter((k) => k.totalAttempts >= 3 && k.errors > 0)
    .map((k) => ({
      ...k,
      errorRate: Math.round((k.errors / k.totalAttempts) * 100),
    }))
    .sort((a, b) => b.errorRate - a.errorRate || b.errors - a.errors);

  if (lang === 'urdu') {
    // Filter to keys that are Urdu characters
    const urduRegex = /[\u0600-\u06FF]/;
    const urduList = list.filter((item) => urduRegex.test(item.key));
    if (urduList.length > 0) return urduList.slice(0, limit);
  }

  return list.slice(0, limit);
}

// Word dictionary for generating targeted practice drills
const ENGLISH_DRILL_WORDS: Record<string, string[]> = {
  a: ['about', 'across', 'against', 'always', 'almost', 'action', 'accept', 'amazing'],
  b: ['because', 'between', 'before', 'business', 'building', 'bridge', 'branch', 'balance'],
  c: ['company', 'control', 'consider', 'country', 'current', 'create', 'certain', 'circle'],
  d: ['develop', 'different', 'decision', 'direction', 'discover', 'demand', 'deliver', 'distance'],
  e: ['experience', 'everyone', 'evidence', 'example', 'energy', 'evening', 'electric', 'element'],
  f: ['forward', 'financial', 'feature', 'friendly', 'freedom', 'famous', 'factory', 'fraction'],
  g: ['general', 'growing', 'ground', 'greater', 'garden', 'graduate', 'glance', 'generate'],
  h: ['history', 'happen', 'hospital', 'holding', 'husband', 'harmony', 'horizon', 'healthy'],
  i: ['important', 'industry', 'interest', 'increase', 'indicate', 'include', 'imagine', 'inspire'],
  j: ['journey', 'justice', 'judgment', 'joining', 'journal', 'joyful', 'junction', 'jungle'],
  k: ['knowledge', 'kitchen', 'kingdom', 'knocking', 'keyboard', 'knight', 'knowing', 'kindness'],
  l: ['learning', 'language', 'location', 'listening', 'library', 'leader', 'limited', 'logical'],
  m: ['material', 'movement', 'measure', 'message', 'machine', 'morning', 'military', 'million'],
  n: ['national', 'natural', 'network', 'nothing', 'necessary', 'neighbor', 'notice', 'normal'],
  o: ['operation', 'official', 'original', 'outside', 'opinion', 'organize', 'outcome', 'opportunity'],
  p: ['practice', 'possible', 'position', 'problem', 'progress', 'provide', 'purpose', 'pattern'],
  q: ['question', 'quality', 'quickly', 'quarter', 'quantum', 'quietly', 'quote', 'qualified'],
  r: ['require', 'remember', 'resource', 'reaction', 'reading', 'regular', 'respect', 'release'],
  s: ['standard', 'special', 'science', 'society', 'success', 'support', 'station', 'solution'],
  t: ['training', 'together', 'thought', 'technology', 'teacher', 'traffic', 'trouble', 'turning'],
  u: ['understand', 'usually', 'unknown', 'upgrade', 'useful', 'urgent', 'universe', 'ultimate'],
  v: ['variety', 'valuable', 'vehicle', 'victory', 'village', 'visible', 'version', 'venture'],
  w: ['whatever', 'without', 'weather', 'welcome', 'western', 'writing', 'working', 'wonderful'],
  x: ['example', 'complex', 'maximum', 'mixture', 'matrix', 'expert', 'explain', 'express'],
  y: ['yesterday', 'yourself', 'yielding', 'yearning', 'younger', 'yardstick', 'youthful', 'yearly'],
  z: ['horizon', 'citizen', 'analyze', 'freezing', 'puzzle', 'breeze', 'amazing', 'bizarre'],
};

const URDU_DRILL_WORDS: Record<string, string[]> = {
  ا: ['امتحان', 'انسان', 'استاد', 'اخلاق', 'امید', 'انتظام', 'احساس', 'ایماندار'],
  ب: ['بہتری', 'بنیاد', 'بصیرت', 'برکت', 'بلندی', 'بہادری', 'بیدار', 'بھروسہ'],
  پ: ['پروگرام', 'پابندی', 'پختگی', 'پیشہ', 'پردیس', 'پانی', 'پیغام', 'پرواز'],
  ت: ['تعلیم', 'ترقی', 'تجربہ', 'تحریر', 'توجہ', 'تفریح', 'تاریخ', 'تصویر'],
  ٹ: ['ٹائپنگ', 'ٹیکنالوجی', 'ٹیم', 'ٹوپی', 'ٹریفک', 'ٹکٹ', 'ٹیسٹ', 'ٹوکری'],
  ث: ['ثابت', 'ثمر', 'ثقافت', 'ثبوت', 'ثروت', 'ثانیہ', 'ثواب', 'مثال'],
  ج: ['جدوجہد', 'جذبہ', 'جہاں', 'زندگی', 'جائزہ', 'جمال', 'جنت', 'جرأت'],
  چ: ['چستی', 'چاندنی', 'چیلنج', 'چراغ', 'چابکدست', 'چاہت', 'چمکیلا', 'چوکس'],
  ح: ['حوصلہ', 'حکمت', 'حرکت', 'حقیقت', 'حفاظت', 'حسن', 'حاصل', 'حیرت'],
  خ: ['خواب', 'خواہش', 'خوبصورت', 'خاموشی', 'خدمت', 'خوشبو', 'خلوص', 'خیال'],
  د: ['دانش', 'دوستی', 'درست', 'دنیا', 'دعا', 'دلکش', 'دولت', 'دسترس'],
  ڈ: ['ڈاکٹر', 'ڈھنگ', 'ڈگری', 'ڈسپلن', 'ڈیزائن', 'ڈرائنگ', 'ڈاکومنٹ', 'ڈائریکٹ'],
  ذ: ['ذہانت', 'ذوق', 'ذمہ داری', 'ذریعہ', 'ذکر', 'ذائقہ', 'ذرات', 'ذخیرہ'],
  ر: ['رفتار', 'روشنی', 'رہنمائی', 'رنگین', 'راستہ', 'روحانی', 'روایت', 'راحت'],
  ڑ: ['پہاڑ', 'گاڑی', 'سیڑھی', 'کھلاڑی', 'جھونپڑی', 'کپڑے', 'جوڑا', 'بڑا'],
  ز: ['زندگی', 'زمانوں', 'زیور', 'زرعی', 'زبردست', 'زیبائی', 'زمین', 'زعفران'],
  ژ: ['ژالہ باری', 'مژدہ', 'ٹیلی ویژن', 'پژمردہ', 'ژرف', 'آژنگ'],
  س: ['سیکھنا', 'سچائی', 'سلامتی', 'سفر', 'سوچ', 'سلیقہ', 'سکون', 'ستارہ'],
  ش: ['شائستگی', 'شکریہ', 'شعور', 'شاندار', 'شوق', 'شاعر', 'شفاف', 'شرافت'],
  ص: ['صبر', 'صداقت', 'صفائی', 'صلاحیت', 'صورت', 'صحبت', 'صنعت', 'صبح'],
  ض: ['ضرورت', 'ضمیر', 'ضابطہ', 'ضمانت', 'ضیاء', 'ضرب', 'ضعیف', 'ضبط'],
  ط: ['طریقہ', 'طاقت', 'طبیعت', 'طلوع', 'طالب علم', 'طوفان', 'طمانینت', 'طے'],
  ظ: ['ظرافت', 'ظہور', 'ظلمت', 'ظاہر', 'ظرف', 'ظفر', 'ظریف', 'منظور'],
  ع: ['علم', 'عزم', 'عزت', 'عادت', 'عدالت', 'عقلمند', 'عظمت', 'عروج'],
  غ: ['غیرت', 'غور', 'غالب', 'غار', 'غفلت', 'غمگین', 'غیر معمولی', 'غزل'],
  ف: ['فائدہ', 'فطرت', 'فیصلہ', 'فکر', 'فراست', 'فرصت', 'فروغ', 'فاتح'],
  ق: ['قلم', 'قدرت', 'قابلیت', 'قانون', 'قیمتی', 'قیادت', 'قرآن', 'قربانی'],
  ک: ['کامیابی', 'کوشش', 'کردار', 'کتاب', 'کمال', 'کاروبار', 'کنارہ', 'کیفیت'],
  گ: ['گفتگو', 'گلشن', 'گرمی', 'گہرائی', 'گزارش', 'گلدستہ', 'گواہی', 'گیند'],
  ل: ['لگن', 'لیاقت', 'لطف', 'لہجہ', 'لازوال', 'لیڈر', 'لغت', 'لہر'],
  م: ['محنت', 'منزل', 'مہارت', 'مسکراہٹ', 'معلومات', 'مستقبل', 'معاشرہ', 'مقام'],
  ن: ['نظم', 'نصیحت', 'نگاہ', 'نیا', 'نکتہ', 'نور', 'نیکی', 'نشانی'],
  و: ['وقت', 'وفاداری', 'وعدہ', 'وسعت', 'وضاحت', 'وقار', 'وحدت', 'وجد'],
  ہ: ['ہمیشہ', 'ہمت', 'ہنر', 'ہنسی', 'ہوشیار', 'ہدایت', 'ہوا', 'ہستی'],
  ی: ['یقین', 'یادداشت', 'یکسوئی', 'یومیہ', 'یگانگت', 'یاقوت', 'یقینی', 'یادگار'],
};

export function generateWeakKeyDrill(keys: string[], lang: Language = 'english'): string {
  if (keys.length === 0) {
    return lang === 'urdu'
      ? 'اردو ٹائپنگ میں مہارت کے لیے باقاعدہ مشق اور حروف کی پہچان انتہائی ضروری ہے۔'
      : 'Consistent daily typing practice builds muscle memory and exceptional finger dexterity.';
  }

  const words: string[] = [];
  const dict = lang === 'urdu' ? URDU_DRILL_WORDS : ENGLISH_DRILL_WORDS;

  // Add words rich in the weak keys
  for (const k of keys) {
    const char = k.toLowerCase();
    const candidateWords = dict[char];
    if (candidateWords && candidateWords.length > 0) {
      // Pick 3 random words for this key
      const shuffled = [...candidateWords].sort(() => 0.5 - Math.random());
      words.push(...shuffled.slice(0, 3));
    }
  }

  // If not enough words, fill with common words
  if (words.length < 12) {
    const generalList = lang === 'urdu'
      ? ['ترقی', 'مہارت', 'کامیابی', 'محنت', 'سبق', 'رفتار', 'انسان', 'علم', 'درست']
      : ['quick', 'focus', 'practice', 'master', 'steady', 'speed', 'target', 'accuracy'];
    words.push(...generalList.slice(0, 15 - words.length));
  }

  // Shuffle and join
  const randomized = [...words].sort(() => 0.5 - Math.random());
  return randomized.join(' ');
}
