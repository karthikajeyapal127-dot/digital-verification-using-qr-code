import { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { t: i18nT } = useTranslation();
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('veriglass_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('veriglass_lang', language);
    document.documentElement.lang = language;
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  const setLanguage = (newLang) => {
    setLanguageState(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('veriglass_lang', newLang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => {
      let next = 'en';
      if (prev === 'en') next = 'ta';
      else if (prev === 'ta') next = 'hi';
      else next = 'en';
      i18n.changeLanguage(next);
      localStorage.setItem('veriglass_lang', next);
      return next;
    });
  };

  const t = (key) => {
    return i18nT(key) || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
