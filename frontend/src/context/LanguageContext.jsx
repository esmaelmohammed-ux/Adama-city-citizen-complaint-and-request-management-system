import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translate } from '../i18n';
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, LANGUAGES } from '../i18n/languages';

const LanguageContext = createContext(null);

function getInitialLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && LANGUAGES[saved]) return saved;
  } catch {
    /* ignore */
  }
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dataset.lang = language;
  }, [language]);

  const setLanguage = (lang) => {
    if (LANGUAGES[lang]) setLanguageState(lang);
  };

  const t = useMemo(
    () => (key, vars) => {
      let value = translate(language, key);
      if (vars && typeof value === 'string') {
        Object.entries(vars).forEach(([name, replacement]) => {
          value = value.replaceAll(`{${name}}`, String(replacement));
        });
      }
      return value;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, languages: LANGUAGES }),
    [language, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
