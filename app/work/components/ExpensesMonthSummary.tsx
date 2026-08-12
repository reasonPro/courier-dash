"use client"

import { useState } from "react"
import Link from "next/link"

import {
  calculateExpensesForRange,
  getMonthRange,
  subtractPlnValues,
  type ExpensesPrototypeState,
} from "../../../lib/expenses-prototype"
import type { ExpensesCopy } from "../../../lib/expenses-translations"

type ExpensesMonthSummaryProps = {
  copy: ExpensesCopy
  grossIncome: string
  grossKnown: boolean
  selectedMonth: string
  state: ExpensesPrototypeState
}

export function ExpensesMonthSummary({
  copy,
  grossIncome,
  grossKnown,
  selectedMonth,
  state,
}: ExpensesMonthSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!state.enabled) return null

  const range = getMonthRange(selectedMonth)
  const totals = calculateExpensesForRange(state, range.from, range.to)
  const garageIncomplete = state.activeCategories.some(
    (category) => category === "repair" || category === "maintenance",
  )
  const canShowResult = grossKnown && !garageIncomplete
  const afterExpenses = canShowResult
    ? subtractPlnValues(grossIncome, totals.total)
    : null

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
            <p className="max-w-xl text-xs leading-5 text-gray-400">
              {copy.afterExpensesDescription}
            </p>
            <div className="shrink-0 rounded-xl border border-gray-800 bg-black/15 px-4 py-2.5 text-left sm:text-right">
              <p className="text-[10px] uppercase text-gray-500">{copy.afterExpensesTitle}</p>
              <p className="mt-1 font-black text-emerald-400">
                {afterExpenses === null ? "—" : `${afterExpenses} PLN`}
              </p>
            </div>
          </div>
          {!grossKnown && (
            <p className="mt-3 text-xs text-amber-300">{copy.incompleteIncome}</p>
          )}
          {garageIncomplete && (
            <p className="mt-3 text-xs text-amber-300">{copy.incompleteResult}</p>
          )}
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
