"use client"

import {
  calculateAfterExpensesIncome,
  type AfterExpensesMode,
} from "../../../lib/after-expenses"
import type { ExpensesCopy } from "../../../lib/expenses-translations"

type AfterExpensesResultProps = {
  compact?: boolean
  copy: ExpensesCopy
  expensesComplete: boolean
  expensesTotal: string
  grossIncome: string
  incomeKnown: boolean
  mode: AfterExpensesMode
  netIncome: string | null
  onModeChange?: (mode: AfterExpensesMode) => void
  showModeToggle?: boolean
}

export function AfterExpensesResult({
  compact = false,
  copy,
  expensesComplete,
  expensesTotal,
  grossIncome,
  incomeKnown,
  mode,
  netIncome,
  onModeChange,
  showModeToggle = false,
}: AfterExpensesResultProps) {
  const netAvailable = netIncome !== null
  const result =
    incomeKnown && expensesComplete
      ? calculateAfterExpensesIncome({
          expensesTotal,
          grossIncome,
          mode,
          netIncome,
        })
      : null
  const isNetto = mode === "netto"
  const title = isNetto
    ? copy.afterExpensesNettoTitle
    : copy.afterExpensesBruttoTitle
  const description = isNetto
    ? copy.afterExpensesNettoDescription
    : copy.afterExpensesBruttoDescription

  return (
    <div
      className={
        compact
          ? "min-w-0 flex-1 rounded-xl border border-gray-800 bg-black/15 px-4 py-3"
          : "rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/15 to-[#19191f] p-5 shadow-lg"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
            {title}
          </p>
          <p
            className={`${compact ? "max-w-md" : "max-w-xl"} mt-1 text-xs leading-5 text-gray-400`}
          >
            {description}
          </p>
        </div>
        {showModeToggle && onModeChange && (
          <div className="flex h-10 rounded-lg border border-gray-800 bg-[#17171d] p-1 text-[11px] font-bold uppercase tracking-wider">
            <button
              className={`rounded-md px-4 transition ${
                !isNetto
                  ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              onClick={() => onModeChange("brutto")}
              type="button"
            >
              {copy.brutto}
            </button>
            <button
              className={`flex items-center gap-1.5 rounded-md px-4 transition ${
                isNetto
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              onClick={() => onModeChange("netto")}
              type="button"
            >
              {!netAvailable && <span aria-hidden="true">🔒</span>}
              {copy.netto}
            </button>
          </div>
        )}
      </div>

      <p
        className={`mt-2 font-black ${isNetto ? "text-blue-400" : "text-emerald-400"} ${compact ? "text-xl" : "text-3xl"}`}
      >
        {result === null ? "—" : `${result} PLN`}
      </p>
      {!incomeKnown && (
        <p className="mt-2 text-xs text-amber-300">{copy.incompleteIncome}</p>
      )}
      {incomeKnown && !expensesComplete && (
        <p className="mt-2 text-xs text-amber-300">{copy.incompleteResult}</p>
      )}
      {incomeKnown && expensesComplete && isNetto && !netAvailable && (
        <p className="mt-2 text-xs text-amber-300">{copy.nettoUnavailable}</p>
      )}
    </div>
  )
}
