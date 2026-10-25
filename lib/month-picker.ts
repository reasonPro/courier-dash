import type { LangType } from "./translations"

const locales: Record<LangType, string> = { uk: "uk-UA", pl: "pl-PL", en: "en-GB", ru: "ru-RU" }

export const monthPickerLabels = {
  uk: { month: "Місяць", year: "Рік" },
  pl: { month: "Miesiąc", year: "Rok" },
  en: { month: "Month", year: "Year" },
  ru: { month: "Месяц", year: "Год" },
} satisfies Record<LangType, { month: string; year: string }>

export function localizedMonths(lang: LangType) {
  const formatter = new Intl.DateTimeFormat(locales[lang], { month: "long", timeZone: "UTC" })
  return Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1).padStart(2, "0"),
    label: formatter.format(new Date(Date.UTC(2020, index, 1))),
  }))
}

export function monthWithYear(value: string, year: string): string | null {
  if (!/^\d{1,4}$/.test(year) || Number(year) < 1 || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return null
  return `${year.padStart(4, "0")}-${value.slice(5)}`
}
