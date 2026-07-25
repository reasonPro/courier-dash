import type { LangType } from "../../lib/translations";
import type { PlatformKey } from "../../lib/work-platforms";

export const PLATFORM_CHART_STYLES: Record<
  PlatformKey,
  { backgroundColor: string; borderColor: string }
> = {
  uber: {
    backgroundColor: "rgba(75, 85, 99, 0.4)",
    borderColor: "rgba(75, 85, 99, 1)",
  },
  wolt: {
    backgroundColor: "rgba(0, 194, 232, 0.4)",
    borderColor: "rgba(0, 194, 232, 1)",
  },
  bolt: {
    backgroundColor: "rgba(34, 197, 94, 0.4)",
    borderColor: "rgba(34, 197, 94, 1)",
  },
  glovo: {
    backgroundColor: "rgba(234, 179, 8, 0.4)",
    borderColor: "rgba(234, 179, 8, 1)",
  },
  stuart: {
    backgroundColor: "rgba(239, 68, 68, 0.4)",
    borderColor: "rgba(239, 68, 68, 1)",
  },
  other: {
    backgroundColor: "rgba(249, 115, 22, 0.4)",
    borderColor: "rgba(249, 115, 22, 1)",
  },
};

export const PLATFORM_CARD_ACCENTS: Record<PlatformKey, string> = {
  uber: "border-gray-600/70",
  wolt: "border-cyan-600/70",
  bolt: "border-green-600/70",
  glovo: "border-yellow-600/70",
  stuart: "border-red-600/70",
  other: "border-orange-600/70",
};

export const OTHER_CHART_STYLES = [
  {
    backgroundColor: "rgba(249, 115, 22, 0.4)",
    borderColor: "rgba(249, 115, 22, 1)",
  },
  {
    backgroundColor: "rgba(236, 72, 153, 0.4)",
    borderColor: "rgba(236, 72, 153, 1)",
  },
  {
    backgroundColor: "rgba(139, 92, 246, 0.4)",
    borderColor: "rgba(139, 92, 246, 1)",
  },
  {
    backgroundColor: "rgba(20, 184, 166, 0.4)",
    borderColor: "rgba(20, 184, 166, 1)",
  },
] as const;

export const FIRST_RUN_PLATFORMS: PlatformKey[] = ["uber"];

export const FIELD_TEXTS = {
  pl: {
    formTitle: "Szczegóły zmiany",
    title: "Ustawienia pól",
    desc: "Uwaga: jeśli wyłączysz te pola, odpowiednie statystyki (np. zł/km, zł/godz) nie będą obliczane, a formularz nie będzie ich wymagał.",
    trackKm: "Wymagaj przebiegu (km)",
    trackHrs: "Wymagaj godzin",
    trackOrd: "Wymagaj zamówień",
    close: "Gotowe",
  },
  en: {
    formTitle: "Shift Details",
    title: "Field Settings",
    desc: "Note: disabling these fields will hide the corresponding statistics (e.g., pln/km, pln/hr) and remove them from the required form fields.",
    trackKm: "Require mileage (km)",
    trackHrs: "Require hours",
    trackOrd: "Require orders",
    close: "Done",
  },
  ru: {
    formTitle: "Детали смены",
    title: "Настройки полей",
    desc: "Внимание: при отключении этих полей соответствующая статистика (зл/км, зл/час) рассчитываться не будет, а форма перестанет их требовать.",
    trackKm: "Требовать пробег (км)",
    trackHrs: "Требовать часы",
    trackOrd: "Требовать заказы",
    close: "Готово",
  },
  uk: {
    formTitle: "Деталі зміни",
    title: "Налаштування полів",
    desc: "Увага: при вимкненні цих полів відповідна статистика (зл/км, зл/год) не буде розраховуватися, а форма перестане вимагати їх обов'язкове заповнення.",
    trackKm: "Вимагати пробіг (км)",
    trackHrs: "Вимагати години",
    trackOrd: "Вимагати замовлення",
    close: "Зберегти налаштування",
  },
} satisfies Record<LangType, Record<string, string>>;

export const TELEGRAM_LABELS = {
  pl: "Aktualności",
  en: "News",
  ru: "Новости",
  uk: "Новини",
} satisfies Record<LangType, string>;
