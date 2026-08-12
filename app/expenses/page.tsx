"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { useLanguage } from "../../context/LanguageContext"
import type {
  ExpenseCategory,
  ManualExpenseCategory,
} from "../../docs/shared/types/expenses"
import {
  MANUAL_EXPENSE_CATEGORIES,
  calculateExpensesForRange,
  calculateRentalForRange,
  getLocalCalendarDate,
  getMonthRange,
  plnToMinorUnits,
  type PrototypeManualExpense,
} from "../../lib/expenses-prototype"
import { expensesTranslations } from "../../lib/expenses-translations"
import { useExpensesPrototype } from "../../lib/use-expenses-prototype"
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
import { RentalManagerModal } from "./components/RentalManagerModal"

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

type ExpenseListItem =
  | { kind: "manual"; record: PrototypeManualExpense }
  | {
      amount: string
      date: string
      from: string
      kind: "rental"
      to: string
    }

export default function ExpensesPage() {
  const { lang, setLanguage } = useLanguage()
  const copy = expensesTranslations[lang]
  const prototype = useExpensesPrototype()
  const [selectedMonth, setSelectedMonth] = useState(
    getLocalCalendarDate().slice(0, 7),
  )
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [rentalOpen, setRentalOpen] = useState(false)
  const [editing, setEditing] = useState<PrototypeManualExpense | null>(null)
  const [deleting, setDeleting] = useState<PrototypeManualExpense | null>(null)
  const [filters, setFilters] = useState<ExpenseFilters>(EMPTY_EXPENSE_FILTERS)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 2400)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const manualCategories = prototype.state.activeCategories.filter(
    (category): category is ManualExpenseCategory =>
      MANUAL_EXPENSE_CATEGORIES.includes(category as ManualExpenseCategory),
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
  const listRange = {
    from: filters.from || monthRange.from,
    to: filters.to || monthRange.to,
  }
  const activeFilterCount = [
    filters.category !== "all",
    filters.source !== "all",
    filters.from !== "",
    filters.to !== "",
  ].filter(Boolean).length
  const hasGarageGap = prototype.state.activeCategories.some(
    (category) => category === "repair" || category === "maintenance",
  )

  const listItems = useMemo<ExpenseListItem[]>(() => {
    const manual: ExpenseListItem[] = prototype.state.manualExpenses
      .filter(
        (record) =>
          record.expenseDate >= listRange.from &&
          record.expenseDate <= listRange.to &&
          (filters.category === "all" || filters.category === record.category) &&
          (filters.source === "all" || filters.source === "manual"),
      )
      .map((record) => ({ kind: "manual", record }))

    const canShowRental =
      prototype.state.activeCategories.includes("rental") &&
      (filters.category === "all" || filters.category === "rental") &&
      (filters.source === "all" || filters.source === "rental_period")
    if (canShowRental) {
      const amount = calculateRentalForRange(
        prototype.state.rentalPeriods,
        listRange.from,
        listRange.to,
      )
      if (plnToMinorUnits(amount) > BigInt("0")) {
        manual.push({
          amount,
          date: listRange.to,
          from: listRange.from,
          kind: "rental",
          to: listRange.to,
        })
      }
    }

    return manual.sort((left, right) => {
      const leftDate = left.kind === "manual" ? left.record.expenseDate : left.date
      const rightDate =
        right.kind === "manual" ? right.record.expenseDate : right.date
      return rightDate.localeCompare(leftDate)
    })
  }, [filters, listRange.from, listRange.to, prototype.state])

  const dateLocale = LANGUAGE_LOCALES[lang]
  const formatDate = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString(dateLocale)
  const formatMonth = (value: string) =>
    new Date(`${value}-01T00:00:00`).toLocaleDateString(dateLocale, {
      month: "long",
      year: "numeric",
    })
  const rentalEntryTitle = filters.from || filters.to
    ? copy.rentalForSelectedPeriod
    : copy.rentalForMonth.replace("{month}", formatMonth(selectedMonth))

  const saveExpense = (value: ExpenseFormValue) => {
    if (editing) {
      prototype.updateManualExpense(editing.id, value)
      setToast(copy.expenseUpdated)
    } else {
      prototype.addManualExpense(value)
      setToast(copy.expenseAdded)
    }
    setEditing(null)
    setFormOpen(false)
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
            {manualCategories.length > 0 && prototype.state.enabled && (
              <button
                className="hidden h-10 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 px-4 text-sm font-bold text-white shadow-lg shadow-red-950/30 transition hover:brightness-110 md:block"
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
                type="button"
              >
                − {copy.addExpense}
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
                  onChange={(event) => setSelectedMonth(event.target.value)}
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

            {prototype.state.activeCategories.includes("rental") && (
              <section className="mb-5 flex flex-col gap-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-bold text-white">🚗 {copy.rentalTitle}</h2>
                  {prototype.state.rentalPeriods.find(
                    (period) => period.validTo === null,
                  ) ? (
                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400">
                      <span>
                        {copy.currentWeeklyRate}: {prototype.state.rentalPeriods.find((period) => period.validTo === null)?.weeklyAmount} PLN
                      </span>
                      <span>
                        {copy.selectedMonthRental}: {monthTotals.byCategory.rental} PLN
                      </span>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-gray-400">{copy.noRentalPeriod}</p>
                  )}
                </div>
                <button
                  className="shrink-0 rounded-xl border border-cyan-500/40 px-4 py-2.5 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500/10"
                  onClick={() => setRentalOpen(true)}
                  type="button"
                >
                  {copy.manageRental}
                </button>
              </section>
            )}

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
                  {listItems.map((item) => {
                    const category = item.kind === "manual" ? item.record.category : "rental"
                    const amount = item.kind === "manual" ? item.record.amount : item.amount
                    return (
                      <button
                        className="flex w-full items-center gap-3 border-b border-gray-800 p-4 text-left transition last:border-0 hover:bg-[#202028]"
                        key={item.kind === "manual" ? item.record.id : `rental-${item.from}-${item.to}`}
                        onClick={() => {
                          if (item.kind === "manual") {
                            setEditing(item.record)
                            setFormOpen(true)
                          } else {
                            setRentalOpen(true)
                          }
                        }}
                        type="button"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-800 text-xl">
                          {CATEGORY_ICONS[category]}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-white">
                            {item.kind === "rental"
                              ? rentalEntryTitle
                              : copy.categories[category].name}
                          </span>
                          <span className="mt-0.5 block text-xs text-gray-500">
                            {item.kind === "rental"
                              ? `${copy.rentalCalculationPeriod}: ${formatDate(item.from)} – ${formatDate(item.to)} · ${copy.sourceRental}`
                              : formatDate(item.record.expenseDate)}
                          </span>
                        </span>
                        <span className="text-right">
                          <span className="block font-bold text-rose-300">
                            {amount} PLN
                          </span>
                          <span className="text-xs text-gray-500">
                            {item.kind === "manual" ? copy.edit : copy.manageRental}
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

      {prototype.state.enabled && manualCategories.length > 0 && (
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
        onSave={(categories) => {
          prototype.saveCategories(categories)
          setSettingsOpen(false)
        }}
        open={settingsOpen}
      />
      <ExpenseFormModal
        activeCategories={manualCategories}
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
      <RentalManagerModal
        copy={copy}
        key={`rental-${rentalOpen}`}
        onChangeRate={prototype.changeRentalRate}
        onClose={() => setRentalOpen(false)}
        onCorrect={prototype.correctRentalPeriod}
        onCreate={prototype.createRentalPeriod}
        onSuccess={setToast}
        open={rentalOpen}
        periods={prototype.state.rentalPeriods}
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
              onClick={() => {
                prototype.deleteManualExpense(deleting.id)
                setDeleting(null)
                setFormOpen(false)
                setEditing(null)
                setToast(copy.expenseDeleted)
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
