"use client"

import { useMemo, useState } from "react"

import type { ExpenseCategory } from "../../../docs/shared/types/expenses"
import {
  PROTOTYPE_EXPENSE_ENTRY_CATEGORIES,
  getLocalCalendarDate,
  isCalendarDate,
  isValidPlnInput,
  type PrototypeExpenseRecord,
} from "../../../lib/expenses-prototype"
import type { ExpensesCopy } from "../../../lib/expenses-translations"
import { ExpenseModalShell } from "./ExpenseModalShell"

export type ExpenseFormValue = {
  amount: string
  category: ExpenseCategory
  expenseDate: string
  paidPeriodFrom: string | null
  paidPeriodTo: string | null
}

type ExpenseFormModalProps = {
  activeCategories: ExpenseCategory[]
  copy: ExpensesCopy
  editing: PrototypeExpenseRecord | null
  onClose: () => void
  onDelete?: () => void
  onSave: (value: ExpenseFormValue) => void
  open: boolean
}

export function ExpenseFormModal({
  activeCategories,
  copy,
  editing,
  onClose,
  onDelete,
  onSave,
  open,
}: ExpenseFormModalProps) {
  const options = useMemo(() => {
    if (!editing || activeCategories.includes(editing.category)) {
      return activeCategories
    }
    return [editing.category, ...activeCategories]
  }, [activeCategories, editing])
  const today = getLocalCalendarDate()
  const [category, setCategory] = useState<ExpenseCategory>(
    editing?.category ?? options[0] ?? "fuel",
  )
  const [expenseDate, setExpenseDate] = useState(
    editing?.expenseDate ?? today,
  )
  const [amount, setAmount] = useState(editing?.amount ?? "")
  const [paidPeriodFrom, setPaidPeriodFrom] = useState(
    editing?.paidPeriodFrom ?? today,
  )
  const [paidPeriodTo, setPaidPeriodTo] = useState(
    editing?.paidPeriodTo ?? today,
  )
  const [error, setError] = useState<string | null>(null)

  if (!open || options.length === 0) return null

  const submit = () => {
    if (!isCalendarDate(expenseDate)) {
      setError(copy.dateInvalid)
      return
    }
    if (!isValidPlnInput(amount)) {
      setError(copy.amountInvalid)
      return
    }
    if (
      category === "rental" &&
      (!isCalendarDate(paidPeriodFrom) ||
        !isCalendarDate(paidPeriodTo) ||
        paidPeriodTo < paidPeriodFrom)
    ) {
      setError(copy.invalidRentalRange)
      return
    }
    onSave({
      amount,
      category,
      expenseDate,
      paidPeriodFrom: category === "rental" ? paidPeriodFrom : null,
      paidPeriodTo: category === "rental" ? paidPeriodTo : null,
    })
  }

  return (
    <ExpenseModalShell
      onClose={onClose}
      title={editing ? copy.editExpenseTitle : copy.addExpenseTitle}
    >
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          {copy.category}
          <select
            className="mt-1.5 w-full rounded-xl border border-gray-700 bg-[#22222b] px-3 py-3 text-white outline-none transition focus:border-cyan-500"
            onChange={(event) =>
              setCategory(event.target.value as ExpenseCategory)
            }
            value={category}
          >
            {PROTOTYPE_EXPENSE_ENTRY_CATEGORIES.filter((item) =>
              options.includes(item),
            ).map((item) => (
              <option key={item} value={item}>
                {copy.categories[item].name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-gray-300">
          {category === "rental" ? copy.paymentDate : copy.expenseDate}
          <input
            className="mt-1.5 w-full rounded-xl border border-gray-700 bg-[#22222b] px-3 py-3 text-white outline-none transition focus:border-cyan-500"
            onInput={(event) => setExpenseDate(event.currentTarget.value)}
            type="date"
            value={expenseDate}
          />
        </label>
        {category === "rental" && (
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
            <p className="mb-3 text-xs leading-5 text-gray-400">
              {copy.paidPeriodHint}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-300">
                {copy.paidPeriodStart}
                <input
                  className="mt-1.5 w-full rounded-xl border border-gray-700 bg-[#22222b] px-3 py-3 text-white outline-none transition focus:border-cyan-500"
                  onInput={(event) => {
                    setPaidPeriodFrom(event.currentTarget.value)
                    setError(null)
                  }}
                  type="date"
                  value={paidPeriodFrom}
                />
              </label>
              <label className="block text-sm font-medium text-gray-300">
                {copy.paidPeriodEnd}
                <input
                  className="mt-1.5 w-full rounded-xl border border-gray-700 bg-[#22222b] px-3 py-3 text-white outline-none transition focus:border-cyan-500"
                  onInput={(event) => {
                    setPaidPeriodTo(event.currentTarget.value)
                    setError(null)
                  }}
                  type="date"
                  value={paidPeriodTo}
                />
              </label>
            </div>
          </div>
        )}
        <label className="block text-sm font-medium text-gray-300">
          {copy.amountPln}
          <div className="relative mt-1.5">
            <input
              className="w-full rounded-xl border border-gray-700 bg-[#22222b] px-3 py-3 pr-14 text-lg font-semibold text-white outline-none transition focus:border-cyan-500"
              inputMode="decimal"
              onChange={(event) => {
                setAmount(event.target.value)
                setError(null)
              }}
              placeholder="0.00"
              type="text"
              value={amount}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
              PLN
            </span>
          </div>
        </label>
      </div>
      {error && (
        <p className="mt-3 text-sm font-medium text-red-400" role="alert">
          {error}
        </p>
      )}
      <div className="mt-5 flex gap-3">
        {editing && onDelete && (
          <button
            className="rounded-xl border border-red-500/40 px-4 py-3 font-semibold text-red-300 transition hover:bg-red-500/10"
            onClick={onDelete}
            type="button"
          >
            {copy.delete}
          </button>
        )}
        <button
          className="flex-1 rounded-xl border border-gray-700 px-4 py-3 font-semibold text-gray-300 transition hover:bg-gray-800"
          onClick={onClose}
          type="button"
        >
          {copy.cancel}
        </button>
        <button
          className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-4 py-3 font-bold text-white transition hover:brightness-110"
          onClick={submit}
          type="button"
        >
          {editing ? copy.updateExpense : copy.saveExpense}
        </button>
      </div>
    </ExpenseModalShell>
  )
}
