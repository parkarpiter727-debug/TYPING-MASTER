import { useThemeStore } from '../store/themeStore.ts';

export function useLanguage() {
  const language = useThemeStore((s) => s.language);
  const setLanguage = useThemeStore((s) => s.setLanguage);
  const toggleLanguage = useThemeStore((s) => s.toggleLanguage);

  return {
    language,
    isUrdu: language === 'urdu',
    isEnglish: language === 'english',
    setLanguage,
    toggleLanguage,
  };
}
