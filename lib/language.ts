import type { LangType } from "./translations";

export const LANGUAGE_STORAGE_KEY = "courier_dash_lang";

const SUPPORTED_LANGUAGES = new Set<LangType>(["pl", "uk", "en", "ru"]);

export function getSupportedLanguage(value: string | null | undefined): LangType | null {
  if (!value) {
    return null;
  }

  const language = value.toLowerCase().split("-")[0] as LangType;
  return SUPPORTED_LANGUAGES.has(language) ? language : null;
}

export function resolveLanguage(
  savedLanguage: string | null,
  browserLanguages: readonly string[] = [],
  browserLanguage?: string,
): LangType {
  const saved = getSupportedLanguage(savedLanguage);
  if (saved) {
    return saved;
  }

  for (const language of browserLanguages) {
    const supported = getSupportedLanguage(language);
    if (supported) {
      return supported;
    }
  }

  return getSupportedLanguage(browserLanguage) ?? "en";
}
