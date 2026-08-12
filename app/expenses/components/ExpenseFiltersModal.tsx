"use client"

import { useState } from "react"

import type {
  ExpenseCategory,
  ExpenseSource,
} from "../../../docs/shared/types/expenses"
import { EXPENSE_CATEGORIES } from "../../../lib/expenses-prototype"
import type { ExpensesCopy } from "../../../lib/expenses-translations"
import { ExpenseModalShell } from "./ExpenseModalShell"

export type ExpenseFilters = {
  category: ExpenseCategory | "all"
  from: string
  source: ExpenseSource | "all"
  to: string
}

type ExpenseFiltersModalProps = {
  copy: ExpensesCopy
  filters: ExpenseFilters
  onApply: (filters: ExpenseFilters) => void
  onClose: () => void
  open: boolean
}

export const EMPTY_EXPENSE_FILTERS: ExpenseFilters = {
  category: "all",
  from: "",
  source: "all",
  to: "",
}

export function ExpenseFiltersModal({
  copy,
  filters,
  onApply,
  onClose,
  open,
}: ExpenseFiltersModalProps) {
  const [draft, setDraft] = useState(filters)

  if (!open) return null

  return (
    <ExpenseModalShell onClose={onClose} title={copy.filterTitle}>
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          {copy.category}
          <select
            className="mt-1.5 w-full rounded-xl border border-gray-700 bg-[#22222b] px-3 py-3 text-white outline-none focus:border-cyan-500"
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                category: event.target.value as ExpenseFilters["category"],
              }))
            }
            value={draft.category}
          >
            <option value="all">{copy.allCategories}</option>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {copy.categories[category].name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-gray-300">
          {copy.source}
          <select
            className="mt-1.5 w-full rounded-xl border border-gray-700 bg-[#22222b] px-3 py-3 text-white outline-none focus:border-cyan-500"
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                source: event.target.value as ExpenseFilters["source"],
              }))
            }
            value={draft.source}
          >
            <option value="all">{copy.allSources}</option>
            <option value="manual">{copy.sourceManual}</option>
            <option value="garage">{copy.sourceGarage}</option>
            <option value="rental_period">{copy.sourceRental}</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium text-gray-300">
            {copy.fromDate}
            <input
              className="mt-1.5 w-full rounded-xl border border-gray-700 bg-[#22222b] px-3 py-3 text-white outline-none focus:border-cyan-500"
              onInput={(event) => {
                const value = event.currentTarget.value
                setDraft((current) => ({
                  ...current,
                  from: value,
                }))
              }}
              type="date"
              value={draft.from}
            />
          </label>
          <label className="block text-sm font-medium text-gray-300">
            {copy.toDate}
            <input
              className="mt-1.5 w-full rounded-xl border border-gray-700 bg-[#22222b] px-3 py-3 text-white outline-none focus:border-cyan-500"
              onInput={(event) => {
                const value = event.currentTarget.value
                setDraft((current) => ({
                  ...current,
                  to: value,
                }))
              }}
              type="date"
              value={draft.to}
            />
          </label>
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <button
          className="flex-1 rounded-xl border border-gray-700 px-3 py-3 font-semibold text-gray-300 transition hover:bg-gray-800"
          onClick={() => setDraft(EMPTY_EXPENSE_FILTERS)}
          type="button"
        >
          {copy.resetFilters}
        </button>
        <button
          className="flex-1 rounded-xl bg-cyan-500 px-3 py-3 font-bold text-gray-950 transition hover:bg-cyan-400"
          onClick={() => onApply(draft)}
          type="button"
        >
          {copy.applyFilters}
        </button>
      </div>
    </ExpenseModalShell>
  )
}
