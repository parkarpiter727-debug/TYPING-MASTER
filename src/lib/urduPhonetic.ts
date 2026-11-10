/**
 * Standard NLA / CRULP Urdu Phonetic Keyboard layout transliteration mapping.
 * Allows users with standard English QWERTY keyboards to type Urdu naturally without OS language packs,
 * while seamlessly supporting users who already have native Urdu keyboard input.
 */

export const URDU_PHONETIC_MAP: Record<string, string> = {
  // Lowercase letters
  'a': 'ا', // Alif
  'b': 'ب', // Bay
  'c': 'چ', // Chay
  'd': 'د', // Daal
  'e': 'ع', // Ain
  'f': 'ف', // Fay
  'g': 'گ', // Gaaf
  'h': 'ح', // Bari Hay
  'i': 'ی', // Choti Yay
  'j': 'ج', // Jeem
  'k': 'ک', // Kaaf
  'l': 'ل', // Laam
  'm': 'م', // Meem
  'n': 'ن', // Noon
  'o': 'ہ', // Gol Hay
  'p': 'پ', // Pay
  'q': 'ق', // Qaaf
  'r': 'ر', // Ray
  's': 'س', // Seen
  't': 'ت', // Tay
  'u': 'ء', // Hamza
  'v': 'ط', // Toye
  'w': 'و', // Wao
  'x': 'ش', // Sheen
  'y': 'ے', // Bari Yay
  'z': 'ز', // Zay

  // Uppercase letters (Shift + key)
  'A': 'آ', // Alif Madda
  'B': 'ب', 
  'C': 'ث', // Say
  'D': 'ڈ', // Daal with toye
  'E': 'ۂ', // Hay with hamza
  'F': 'ف',
  'G': 'غ', // Ghain
  'H': 'ھ', // Do Chashmi Hay
  'I': 'ٰ', // Khari Zabar
  'J': 'ض', // Zuaad
  'K': 'خ', // Khay
  'L': 'ل',
  'M': 'م',
  'N': 'ں', // Noon Ghunna
  'O': 'ۃ', // Teh Marbuta
  'P': 'ُ', // Pesh
  'Q': 'ْ', // Sukun / Jazam
  'R': 'ڑ', // Arday
  'S': 'ص', // Suad
  'T': 'ٹ', // Tay with toye
  'U': 'ئ', // Hamza on yay
  'V': 'ظ', // Zoye
  'W': 'ؤ', // Wao with hamza
  'X': 'ژ', // Zhay
  'Y': 'َ', // Zabar
  'Z': 'ذ', // Zaal

  // Punctuation & Urdu marks
  '?': '؟', // Urdu question mark
  ',': '،', // Urdu comma
  ';': '؛', // Urdu semicolon
  '.': '۔', // Urdu full stop (khatma)

  // Urdu Digits
  '0': '۰',
  '1': '۱',
  '2': '۲',
  '3': '۳',
  '4': '۴',
  '5': '۵',
  '6': '۶',
  '7': '۷',
  '8': '۸',
  '9': '۹',
};

/**
 * Checks if a character is already an Arabic/Urdu Unicode character.
 */
export function isUrduChar(char: string): boolean {
  if (!char) return false;
  const code = char.charCodeAt(0);
  // Arabic / Urdu unicode range: 0x0600 - 0x06FF, 0xFB50 - 0xFDFF, 0xFE70 - 0xFEFF
  return (
    (code >= 0x0600 && code <= 0x06ff) ||
    (code >= 0xfb50 && code <= 0xfdff) ||
    (code >= 0xfe70 && code <= 0xfeff)
  );
}

/**
 * Converts a typed key to Urdu if phonetic mode is active and the key is an ASCII character.
 * If the key is already an Urdu character, returns it untouched.
 */
export function translateKeyToUrdu(
  rawKey: string,
  phoneticEnabled = true
): string {
  if (!phoneticEnabled) return rawKey;

  // If already Urdu or space, return as is
  if (isUrduChar(rawKey) || rawKey === ' ') {
    return rawKey;
  }

  // Look up in Phonetic Map
  return URDU_PHONETIC_MAP[rawKey] || rawKey;
}

/**
 * Returns the English key that produces the specified Urdu character under Phonetic layout.
 */
export function getEnglishKeyForUrdu(urduChar: string): string {
  if (urduChar === ' ') return 'Space';
  for (const [enKey, urChar] of Object.entries(URDU_PHONETIC_MAP)) {
    if (urChar === urduChar) {
      return enKey;
    }
  }
  return urduChar;
}
