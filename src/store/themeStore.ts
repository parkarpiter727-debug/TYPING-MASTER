import { create } from 'zustand';
import { Language, Theme } from '../types/index.ts';

interface ThemeState {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem('typemaster_theme') as Theme;
  if (saved === 'dark' || saved === 'light') return saved;
  return 'dark'; // Dark mode default as specified in UI/UX Design Brief
};

const getInitialLanguage = (): Language => {
  const saved = localStorage.getItem('typemaster_lang') as Language;
  if (saved === 'english' || saved === 'urdu') return saved;
  return 'english';
};

function applyDOMSettings(theme: Theme, language: Language) {
  const html = document.documentElement;

  // Apply theme class
  if (theme === 'dark') {
    html.classList.add('dark');
    html.classList.remove('light');
  } else {
    html.classList.add('light');
    html.classList.remove('dark');
  }

  // Apply RTL and language attribute
  if (language === 'urdu') {
    html.setAttribute('dir', 'rtl');
    html.setAttribute('lang', 'ur');
  } else {
    html.setAttribute('dir', 'ltr');
    html.setAttribute('lang', 'en');
  }
}

// Initial application
const initTheme = getInitialTheme();
const initLang = getInitialLanguage();
applyDOMSettings(initTheme, initLang);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initTheme,
  language: initLang,

  toggleTheme: () => {
    const nextTheme: Theme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('typemaster_theme', nextTheme);
    applyDOMSettings(nextTheme, get().language);
    set({ theme: nextTheme });
  },

  setTheme: (nextTheme: Theme) => {
    localStorage.setItem('typemaster_theme', nextTheme);
    applyDOMSettings(nextTheme, get().language);
    set({ theme: nextTheme });
  },

  setLanguage: (nextLang: Language) => {
    localStorage.setItem('typemaster_lang', nextLang);
    applyDOMSettings(get().theme, nextLang);
    set({ language: nextLang });
  },

  toggleLanguage: () => {
    const nextLang: Language = get().language === 'english' ? 'urdu' : 'english';
    localStorage.setItem('typemaster_lang', nextLang);
    applyDOMSettings(get().theme, nextLang);
    set({ language: nextLang });
  },
}));
