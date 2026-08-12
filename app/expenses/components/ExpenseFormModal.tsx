"use client"

import { useMemo, useState } from "react"

import type { ManualExpenseCategory } from "../../../docs/shared/types/expenses"
import {
  MANUAL_EXPENSE_CATEGORIES,
  getLocalCalendarDate,
  isCalendarDate,
  isValidPlnInput,
  type PrototypeManualExpense,
} from "../../../lib/expenses-prototype"
import type { ExpensesCopy } from "../../../lib/expenses-translations"
import { ExpenseModalShell } from "./ExpenseModalShell"

export type ExpenseFormValue = {
  amount: string
  category: ManualExpenseCategory
  expenseDate: string
}

type ExpenseFormModalProps = {
  activeCategories: ManualExpenseCategory[]
  copy: ExpensesCopy
  editing: PrototypeManualExpense | null
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
  const [category, setCategory] = useState<ManualExpenseCategory>(
    options[0] ?? "fuel",
  )
  const [expenseDate, setExpenseDate] = useState(getLocalCalendarDate())
  const [amount, setAmount] = useState("")
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
    onSave({ amount, category, expenseDate })
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
              setCategory(event.target.value as ManualExpenseCategory)
            }
            value={category}
          >
            {MANUAL_EXPENSE_CATEGORIES.filter((item) =>
              options.includes(item),
            ).map((item) => (
              <option key={item} value={item}>
                {copy.categories[item].name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-gray-300">
          {copy.expenseDate}
          <input
            className="mt-1.5 w-full rounded-xl border border-gray-700 bg-[#22222b] px-3 py-3 text-white outline-none transition focus:border-cyan-500"
            onInput={(event) => setExpenseDate(event.currentTarget.value)}
            type="date"
            value={expenseDate}
          />
        </label>
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
