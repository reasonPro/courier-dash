"use client"

import { useState } from "react"

import type { ExpenseCategory } from "../../../docs/shared/types/expenses"
import { EXPENSE_CATEGORIES } from "../../../lib/expenses-prototype"
import type { ExpensesCopy } from "../../../lib/expenses-translations"
import { ExpenseModalShell } from "./ExpenseModalShell"

type ExpenseSettingsModalProps = {
  activeCategories: ExpenseCategory[]
  copy: ExpensesCopy
  onClose: () => void
  onSave: (categories: ExpenseCategory[]) => void
  open: boolean
}

const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  fuel: "⛽",
  rental: "🚗",
  food_on_shift: "🥪",
  repair: "🔧",
  maintenance: "🛠️",
}

export function ExpenseSettingsModal({
  activeCategories,
  copy,
  onClose,
  onSave,
  open,
}: ExpenseSettingsModalProps) {
  const [selected, setSelected] = useState<ExpenseCategory[]>(activeCategories)
  const [showError, setShowError] = useState(false)

  if (!open) return null

  return (
    <ExpenseModalShell onClose={onClose} title={copy.settingsTitle}>
      <p className="mb-4 text-sm text-gray-400">{copy.settingsDescription}</p>
      <div className="space-y-2">
        {EXPENSE_CATEGORIES.map((category) => {
          const checked = selected.includes(category)
          return (
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${checked ? "border-cyan-500/60 bg-cyan-500/10" : "border-gray-800 bg-[#1e1e24] hover:border-gray-700"}`}
              key={category}
            >
              <span aria-hidden="true" className="text-xl">
                {CATEGORY_ICONS[category]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-white">
                  {copy.categories[category].name}
                </span>
                <span className="block text-xs text-gray-400">
                  {copy.categories[category].description}
                </span>
              </span>
              <input
                checked={checked}
                className="h-5 w-5 accent-cyan-500"
                onChange={() => {
                  setShowError(false)
                  setSelected((current) =>
                    checked
                      ? current.filter((item) => item !== category)
                      : [...current, category],
                  )
                }}
                type="checkbox"
              />
            </label>
          )
        })}
      </div>
      {showError && (
        <p className="mt-3 text-sm font-medium text-red-400" role="alert">
          {copy.selectAtLeastOne}
        </p>
      )}
      <button
        className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-3 font-bold text-gray-950 transition hover:brightness-110"
        onClick={() => {
          if (selected.length === 0) {
            setShowError(true)
            return
          }
          onSave(selected)
        }}
        type="button"
      >
        {activeCategories.length > 0
          ? copy.updateSettings
          : copy.saveSettings}
      </button>
    </ExpenseModalShell>
  )
}
