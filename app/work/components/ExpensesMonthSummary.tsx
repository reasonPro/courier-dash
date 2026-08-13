"use client"

import { useState } from "react"
import Link from "next/link"

import {
  calculateExpensesForRange,
  getMonthRange,
  type ExpensesPrototypeState,
} from "../../../lib/expenses-prototype"
import type { ExpensesCopy } from "../../../lib/expenses-translations"
import type { AfterExpensesMode } from "../../../lib/after-expenses"
import { AfterExpensesResult } from "../../expenses/components/AfterExpensesResult"

type ExpensesMonthSummaryProps = {
  copy: ExpensesCopy
  grossIncome: string
  grossKnown: boolean
  mode: AfterExpensesMode
  netIncome: string | null
  onSetupCategories: () => void
  selectedMonth: string
  state: ExpensesPrototypeState
}

export function ExpensesMonthSummary({
  copy,
  grossIncome,
  grossKnown,
  mode,
  netIncome,
  onSetupCategories,
  selectedMonth,
  state,
}: ExpensesMonthSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const range = getMonthRange(selectedMonth)
  const totals = calculateExpensesForRange(state, range.from, range.to)
  const garageIncomplete = state.activeCategories.some(
    (category) => category === "repair" || category === "maintenance",
  )

  if (!state.enabled) {
    return (
      <section className="relative mb-8 overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/15 to-[#1b1b22]">
        <div aria-hidden="true" className="select-none px-5 py-5 opacity-35 blur-[3px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="block text-sm font-bold text-white">{copy.pageTitle}</span>
              <span className="mt-1 block text-xs text-gray-500">{copy.totalExpenses}</span>
            </div>
            <span className="text-xl font-black text-rose-300">0.00 PLN</span>
          </div>
        </div>
        <button
          aria-label={copy.setupExpenses}
          className="absolute inset-0 flex w-full items-center justify-center bg-black/20 px-5 text-center transition hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-inset"
          onClick={onSetupCategories}
          type="button"
        >
          <span className="rounded-xl border border-cyan-400/30 bg-[#17171d]/95 px-4 py-3 shadow-xl">
            <span className="block text-sm font-black text-white">{copy.activationTitle}</span>
            <span className="mt-1 block text-xs font-semibold text-cyan-300">{copy.setupExpenses} →</span>
          </span>
        </button>
      </section>
    )
  }

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/15 to-[#1b1b22]">
      <button
        aria-controls="work-expenses-details"
        aria-expanded={isExpanded}
        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition hover:bg-white/[0.025] sm:px-5"
        onClick={() => setIsExpanded((current) => !current)}
        type="button"
      >
        <span>
          <span className="block text-sm font-bold text-white">{copy.pageTitle}</span>
          <span className="mt-0.5 block text-xs text-gray-500">{copy.totalExpenses}</span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <span className="font-black text-rose-300">{totals.total} PLN</span>
          <svg
            aria-hidden="true"
            className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
          >
            <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-800/80 px-4 py-3.5 sm:px-5" id="work-expenses-details">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <AfterExpensesResult
              compact
              copy={copy}
              expensesComplete={!garageIncomplete}
              expensesTotal={totals.total}
              grossIncome={grossIncome}
              incomeKnown={grossKnown}
              mode={mode}
              netIncome={netIncome}
            />
          </div>
          <Link
            className="mt-3 inline-flex text-sm font-bold text-cyan-400 transition hover:text-cyan-300"
            href="/expenses"
          >
            {copy.openExpenses} →
          </Link>
        </div>
      )}
    </section>
  )
}
