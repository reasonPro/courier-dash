"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, LangType } from "../lib/translations";
import { LANGUAGE_STORAGE_KEY, resolveLanguage } from "../lib/language";

type LanguageContextType = {
  lang: LangType;
  setLanguage: (lang: LangType) => void;
  t: typeof translations.pl; // беремо структуру польського як еталон
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<LangType>("en");

  useEffect(() => {
    const resolvedLanguage = resolveLanguage(
      localStorage.getItem(LANGUAGE_STORAGE_KEY),
      navigator.languages,
      navigator.language,
    );

    document.documentElement.lang = resolvedLanguage;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Browser language and saved preference are only available after hydration; the English SSR snapshot remains stable.
    setLang(resolvedLanguage);
  }, []);

  const setLanguage = (newLang: LangType) => {
    setLang(newLang);
    document.documentElement.lang = newLang;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
  };

  // Витягуємо тексти для поточної мови, якщо щось забули перекласти - беремо з польської
  const t = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
