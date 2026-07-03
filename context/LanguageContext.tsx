"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, LangType } from "../lib/translations";

type LanguageContextType = {
  lang: LangType;
  setLanguage: (lang: LangType) => void;
  t: typeof translations.pl; // беремо структуру польського як еталон
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // За замовчуванням ставимо "pl" (базова мова ринку)
  const [lang, setLang] = useState<LangType>("pl");

  useEffect(() => {
    // 1. Перевіряємо, чи користувач вже обирав мову раніше
    const savedLang = localStorage.getItem("courier_dash_lang") as LangType;
    
    if (savedLang && (savedLang === "pl" || savedLang === "uk" || savedLang === "en" || savedLang === "ru")) {
      setLang(savedLang);
    } else {
      // 2. Якщо ні, визначаємо мову його телефону/браузера
      const browserLang = navigator.language.toLowerCase();
      let detectedLang: LangType = "pl"; // фолбек на польську

      if (browserLang.startsWith("uk")) detectedLang = "uk";
      else if (browserLang.startsWith("ru")) detectedLang = "ru";
      else if (browserLang.startsWith("en")) detectedLang = "en";
      else if (browserLang.startsWith("pl")) detectedLang = "pl";

      setLang(detectedLang);
      localStorage.setItem("courier_dash_lang", detectedLang);
    }
  }, []);

  const setLanguage = (newLang: LangType) => {
    setLang(newLang);
    localStorage.setItem("courier_dash_lang", newLang);
  };

  // Витягуємо тексти для поточної мови, якщо щось забули перекласти - беремо з польської
  const t = translations[lang] || translations.pl;

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