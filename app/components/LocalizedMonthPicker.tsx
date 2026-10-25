"use client"

import type { LangType } from "../../lib/translations"
import { localizedMonths, monthPickerLabels, monthWithYear } from "../../lib/month-picker"

type Props = {
  lang: LangType
  value: string
  onChange: (value: string) => void
  label: string
  className?: string
}

/** Explicit option labels avoid the browser/OS locale of input[type=month]. */
export function LocalizedMonthPicker({ lang, value, onChange, label, className = "" }: Props) {
  const copy = monthPickerLabels[lang]
  const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
  return (
    <div role="group" aria-label={label} lang={lang} className={`flex items-center gap-1 ${className}`}>
      <select
        aria-label={copy.month}
        className={`min-w-0 flex-1 bg-transparent py-1 capitalize ${focus}`}
        value={value.slice(5)}
        onChange={(event) => onChange(`${value.slice(0, 4)}-${event.target.value}`)}
      >
        {localizedMonths(lang).map((month) => (
          <option key={month.value} value={month.value} className="bg-[#1e1e24] text-white">{month.label}</option>
        ))}
      </select>
      <input
        key={value.slice(0, 4)}
        aria-label={copy.year}
        type="number"
        inputMode="numeric"
        min="1"
        max="9999"
        step="1"
        defaultValue={value.slice(0, 4)}
        className={`w-[4.5rem] min-w-0 bg-transparent py-1 text-center ${focus}`}
        onBlur={(event) => {
          const next = monthWithYear(value, event.currentTarget.value)
          if (next) onChange(next)
          else event.currentTarget.value = value.slice(0, 4)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") { event.preventDefault(); event.currentTarget.blur() }
          if (event.key === "Escape") { event.currentTarget.value = value.slice(0, 4); event.currentTarget.blur() }
        }}
      />
    </div>
  )
}
