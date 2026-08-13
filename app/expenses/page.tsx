"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { useLanguage } from "../../context/LanguageContext"
import type { ExpenseCategory } from "../../docs/shared/types/expenses"
import type { Tables } from "../../lib/database.types"
import type { AfterExpensesMode } from "../../lib/after-expenses"
import {
  PROTOTYPE_EXPENSE_ENTRY_CATEGORIES,
  calculateExpensesForRange,
  getExpensesForRange,
  getLocalCalendarDate,
  getMonthRange,
  type PrototypeExpenseRecord,
} from "../../lib/expenses-prototype"
import { expensesTranslations } from "../../lib/expenses-translations"
import { supabase } from "../../lib/supabase"
import { useExpenses } from "../../lib/use-expenses"
import { calculateMonthlyWorkFinance } from "../../lib/work-finance"
import { AfterExpensesResult } from "./components/AfterExpensesResult"
import {
  EMPTY_EXPENSE_FILTERS,
  ExpenseFiltersModal,
  type ExpenseFilters,
} from "./components/ExpenseFiltersModal"
import {
  ExpenseFormModal,
  type ExpenseFormValue,
} from "./components/ExpenseFormModal"
import { ExpenseModalShell } from "./components/ExpenseModalShell"
import { ExpenseSettingsModal } from "./components/ExpenseSettingsModal"

const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  fuel: "⛽",
  rental: "🚗",
  food_on_shift: "🥪",
  repair: "🔧",
  maintenance: "🛠️",
}

const LANGUAGE_LOCALES = {
  pl: "pl-PL",
  uk: "uk-UA",
  en: "en-US",
  ru: "ru-RU",
} as const

type ExpensesFinanceState = {
  error: boolean
  grossIncome: string
  isLoading: boolean
  netIncome: string | null
}

const INITIAL_FINANCE_STATE: ExpensesFinanceState = {
  error: false,
  grossIncome: "0.00",
  isLoading: true,
  netIncome: null,
}

export default function ExpensesPage() {
  const { lang, setLanguage } = useLanguage()
  const copy = expensesTranslations[lang]
  const prototype = useExpenses()
  const [selectedMonth, setSelectedMonth] = useState(
    getLocalCalendarDate().slice(0, 7),
  )
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [editing, setEditing] = useState<PrototypeExpenseRecord | null>(null)
  const [deleting, setDeleting] = useState<PrototypeExpenseRecord | null>(null)
  const [filters, setFilters] = useState<ExpenseFilters>(EMPTY_EXPENSE_FILTERS)
  const [toast, setToast] = useState<string | null>(null)
  const [financeMode, setFinanceMode] = useState<AfterExpensesMode>("brutto")
  const [finance, setFinance] = useState<ExpensesFinanceState>(
    INITIAL_FINANCE_STATE,
  )

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 2400)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const entryCategories = prototype.state.activeCategories.filter((category) =>
    PROTOTYPE_EXPENSE_ENTRY_CATEGORIES.includes(category),
  )
  const monthRange = useMemo(() => getMonthRange(selectedMonth), [selectedMonth])
  const monthTotals = useMemo(
    () =>
      calculateExpensesForRange(
        prototype.state,
        monthRange.from,
        monthRange.to,
      ),
    [monthRange, prototype.state],
  )
  const activeFilterCount = filters.category !== "all" ? 1 : 0
  const hasGarageGap = prototype.state.activeCategories.some(
    (category) => category === "repair" || category === "maintenance",
  )

  useEffect(() => {
    let active = true

    async function loadMonthlyFinance() {
      setFinance((current) => ({ ...current, error: false, isLoading: true }))
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (!active) return
      if (authError || !user) {
        setFinance({ ...INITIAL_FINANCE_STATE, error: true, isLoading: false })
        return
      }

      const range = getMonthRange(selectedMonth)
      const [shiftsResult, taxResult] = await Promise.all([
        supabase
          .from("work_shifts")
          .select("*")
          .eq("user_id", user.id)
          .gte("date", range.from)
          .lte("date", range.to),
        supabase
          .from("tax_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
      ])

      if (!active) return
      if (shiftsResult.error || taxResult.error) {
        setFinance({ ...INITIAL_FINANCE_STATE, error: true, isLoading: false })
        return
      }

      const taxRow = taxResult.data
      const monthlyFinance = calculateMonthlyWorkFinance(
        (shiftsResult.data ?? []) as Tables<"work_shifts">[],
        taxRow
          ? {
              bolt_type: taxRow.bolt_type ?? "none",
              bolt_val: taxRow.bolt_val ?? 0,
              glovo_type: taxRow.glovo_type ?? "none",
              glovo_val: taxRow.glovo_val ?? 0,
              uber_type: taxRow.uber_type ?? "none",
              uber_val: taxRow.uber_val ?? 0,
              wolt_type: taxRow.wolt_type ?? "none",
              wolt_val: taxRow.wolt_val ?? 0,
            }
          : null,
      )
      setFinance({
        error: false,
        grossIncome: monthlyFinance.grossIncome,
        isLoading: false,
        netIncome: monthlyFinance.netIncome,
      })
    }

    loadMonthlyFinance()
    return () => {
      active = false
    }
  }, [selectedMonth])

  const listItems = useMemo(() => {
    return getExpensesForRange(
      prototype.state,
      monthRange.from,
      monthRange.to,
      filters.category,
      )
      .sort((left, right) => right.expenseDate.localeCompare(left.expenseDate))
  }, [filters.category, monthRange.from, monthRange.to, prototype.state])

  const dateLocale = LANGUAGE_LOCALES[lang]
  const formatDate = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString(dateLocale)
  const saveExpense = async (value: ExpenseFormValue) => {
    try {
      if (editing) {
        await prototype.updateManualExpense(editing.id, value)
        setToast(copy.expenseUpdated)
      } else {
        await prototype.addManualExpense(value)
        setToast(copy.expenseAdded)
      }
      setEditing(null)
      setFormOpen(false)
    } catch {
      // The shared data hook exposes the localized error state on the page.
    }
  }

  if (prototype.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#121216] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-cyan-400" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#121216] pb-24 text-white">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              className="rounded-lg border border-gray-800 bg-[#1d1d24] px-3 py-2 text-sm text-gray-300 transition hover:bg-gray-800"
              href="/work"
            >
              ← {copy.backToWork}
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black sm:text-3xl">{copy.pageTitle}</h1>
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-300">
                  {copy.prototypeBadge}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">{copy.localOnly}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              aria-label={copy.settings}
              className="h-10 rounded-lg border border-gray-700 bg-[#1e1e24] px-2 text-xs font-bold uppercase text-white"
              onChange={(event) =>
                setLanguage(event.target.value as typeof lang)
              }
              value={lang}
            >
              <option value="pl">PL</option>
              <option value="uk">UK</option>
              <option value="en">EN</option>
              <option value="ru">RU</option>
            </select>
            {prototype.state.enabled && (
              <button
                className="h-10 rounded-lg border border-gray-700 bg-[#1e1e24] px-3 text-sm font-semibold text-gray-200 transition hover:bg-gray-800"
                onClick={() => setSettingsOpen(true)}
                type="button"
              >
                ⚙ {copy.settings}
              </button>
            )}
            {entryCategories.length > 0 && prototype.state.enabled && (
              <button
                className="hidden h-10 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 px-4 text-sm font-bold text-white shadow-lg shadow-red-950/30 transition hover:brightness-110 md:block"
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
                type="button"
              >
                {copy.addExpenseButton}
              </button>
            )}
          </div>
        </header>

        {prototype.error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {copy.readError}
          </div>
        )}

        {!prototype.state.enabled ? (
          <section className="mx-auto mt-16 max-w-xl rounded-3xl border border-gray-800 bg-gradient-to-br from-[#1d1d24] to-[#17171d] p-7 text-center shadow-2xl sm:p-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-cyan-500/20 text-3xl">
              −
            </div>
            <h2 className="text-2xl font-black">{copy.activationTitle}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400">
              {copy.activationDescription}
            </p>
            <button
              className="mt-6 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 font-bold text-gray-950 transition hover:brightness-110"
              onClick={() => setSettingsOpen(true)}
              type="button"
            >
              {copy.setupExpenses}
            </button>
          </section>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-400">
                {copy.selectedMonth}
                <input
                  className="mt-1 block rounded-xl border border-gray-700 bg-[#1e1e24] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                  onInput={(event) =>
                    setSelectedMonth(event.currentTarget.value)
                  }
                  type="month"
                  value={selectedMonth}
                />
              </label>
              <button
                className="relative rounded-xl border border-gray-700 bg-[#1e1e24] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                onClick={() => setFilterOpen(true)}
                type="button"
              >
                {copy.filters}
                {activeFilterCount > 0 && (
                  <span className="ml-2 rounded-full bg-cyan-500 px-2 py-0.5 text-[10px] font-black text-gray-950">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            <section className="mb-5 rounded-2xl border border-gray-800 bg-gradient-to-br from-[#1f1f27] to-[#19191f] p-5 shadow-lg">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    {copy.summaryTitle}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">{copy.totalExpenses}</p>
                  <p className="mt-1 text-3xl font-black text-red-400">
                    {monthTotals.total} <span className="text-sm">PLN</span>
                  </p>
                </div>
                {hasGarageGap && (
                  <div className="max-w-sm rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                    <strong className="block">{copy.partialStatus}</strong>
                    {copy.partialGarage}
                  </div>
                )}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {prototype.state.activeCategories.map((category) => (
                  <div
                    className="rounded-xl border border-gray-800 bg-black/15 p-3"
                    key={category}
                  >
                    <p className="break-words text-xs leading-snug text-gray-400">
                      {CATEGORY_ICONS[category]} {copy.categories[category].name}
                    </p>
                    <p className="mt-1 font-bold text-white">
                      {monthTotals.byCategory[category]} PLN
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-5">
              <AfterExpensesResult
                copy={copy}
                expensesComplete={!hasGarageGap}
                expensesTotal={monthTotals.total}
                grossIncome={finance.grossIncome}
                incomeKnown={!finance.isLoading && !finance.error}
                mode={financeMode}
                netIncome={finance.netIncome}
                onModeChange={setFinanceMode}
                showModeToggle
              />
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold">{copy.historyTitle}</h2>
                {activeFilterCount > 0 && (
                  <button
                    className="text-xs font-semibold text-cyan-400"
                    onClick={() => setFilters(EMPTY_EXPENSE_FILTERS)}
                    type="button"
                  >
                    {copy.resetFilters}
                  </button>
                )}
              </div>
              {listItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-700 bg-[#19191f] px-5 py-12 text-center text-sm text-gray-500">
                  {activeFilterCount > 0 ? copy.noFilterResults : copy.noEntries}
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#19191f]">
                  {listItems.map((record) => {
                    const category = record.category
                    return (
                      <button
                        className="flex w-full items-center gap-3 border-b border-gray-800 p-4 text-left transition last:border-0 hover:bg-[#202028]"
                        key={record.id}
                        onClick={() => {
                          setEditing(record)
                          setFormOpen(true)
                        }}
                        type="button"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-800 text-xl">
                          {CATEGORY_ICONS[category]}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-white">
                            {copy.categories[category].name}
                          </span>
                          <span className="mt-0.5 block text-xs text-gray-500">
                            {category === "rental" && record.paidPeriodFrom && record.paidPeriodTo
                              ? `${copy.paymentDate}: ${formatDate(record.expenseDate)} · ${copy.paidPeriod}: ${formatDate(record.paidPeriodFrom)} – ${formatDate(record.paidPeriodTo)}`
                              : formatDate(record.expenseDate)}
                          </span>
                        </span>
                        <span className="text-right">
                          <span className="block font-bold text-rose-300">
                            {record.amount} PLN
                          </span>
                          <span className="text-xs text-gray-500">
                            {copy.edit}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {prototype.state.enabled && entryCategories.length > 0 && (
        <button
          aria-label={copy.addExpenseAria}
          className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-3xl font-light text-white shadow-xl shadow-red-950/50 transition hover:scale-105 md:hidden"
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
          type="button"
        >
          <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-red-500/20" />
          <span className="relative">−</span>
        </button>
      )}

      <ExpenseSettingsModal
        activeCategories={prototype.state.activeCategories}
        copy={copy}
        key={`settings-${settingsOpen}-${prototype.state.activeCategories.join("-")}`}
        onClose={() => setSettingsOpen(false)}
        onSave={async (categories) => {
          try {
            await prototype.saveCategories(categories)
            setSettingsOpen(false)
          } catch {
            // Keep the modal open so the user can retry.
          }
        }}
        open={settingsOpen}
      />
      <ExpenseFormModal
        activeCategories={entryCategories}
        copy={copy}
        editing={editing}
        key={`expense-form-${formOpen}-${editing?.id ?? "new"}`}
        onClose={() => {
          setEditing(null)
          setFormOpen(false)
        }}
        onDelete={
          editing
            ? () => {
                setFormOpen(false)
                setDeleting(editing)
              }
            : undefined
        }
        onSave={saveExpense}
        open={formOpen}
      />
      <ExpenseFiltersModal
        copy={copy}
        filters={filters}
        key={`filters-${filterOpen}-${JSON.stringify(filters)}`}
        onApply={(next) => {
          setFilters(next)
          setFilterOpen(false)
        }}
        onClose={() => setFilterOpen(false)}
        open={filterOpen}
      />
      {deleting && (
        <ExpenseModalShell
          onClose={() => setDeleting(null)}
          title={copy.deleteTitle}
        >
          <p className="text-gray-300">
            {copy.deleteQuestion
              .replace("{category}", copy.categories[deleting.category].name)
              .replace("{amount}", deleting.amount)}
          </p>
          <div className="mt-5 flex gap-3">
            <button
              className="flex-1 rounded-xl border border-gray-700 px-4 py-3 font-semibold text-gray-300"
              onClick={() => setDeleting(null)}
              type="button"
            >
              {copy.cancel}
            </button>
            <button
              className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-bold text-white"
              onClick={async () => {
                try {
                  await prototype.deleteManualExpense(deleting.id)
                  setDeleting(null)
                  setFormOpen(false)
                  setEditing(null)
                  setToast(copy.expenseDeleted)
                } catch {
                  // Keep confirmation visible when the Staging write fails.
                }
              }}
              type="button"
            >
              {copy.delete}
            </button>
          </div>
        </ExpenseModalShell>
      )}
      {toast && (
        <div
          className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-full border border-emerald-500/30 bg-[#17241f] px-4 py-2 text-sm font-semibold text-emerald-300 shadow-xl"
          role="status"
        >
          {toast}
        </div>
      )}
    </main>
  )
}
