"use client"

import { useCallback, useEffect, useState } from "react"

import type { ExpenseCategory } from "../docs/shared/types/expenses"
import {
  EXPENSES_PROTOTYPE_EVENT,
  EXPENSES_PROTOTYPE_STORAGE_KEY,
  createEmptyExpensesPrototypeState,
  createPrototypeId,
  normalizePlnForStorage,
  readExpensesPrototype,
  writeExpensesPrototype,
  type ExpensesPrototypeState,
  type PrototypeExpenseRecord,
} from "./expenses-prototype"

type ManualExpenseInput = {
  category: ExpenseCategory
  expenseDate: string
  amount: string
  paidPeriodFrom: string | null
  paidPeriodTo: string | null
}

type PrototypeSnapshot = {
  state: ExpensesPrototypeState
  isLoading: boolean
  error: string | null
}

const initialSnapshot: PrototypeSnapshot = {
  state: createEmptyExpensesPrototypeState(),
  isLoading: true,
  error: null,
}

function notifyPrototypeChanged() {
  window.dispatchEvent(new Event(EXPENSES_PROTOTYPE_EVENT))
}

export function useExpensesPrototype() {
  const [snapshot, setSnapshot] = useState<PrototypeSnapshot>(initialSnapshot)

  const reload = useCallback(() => {
    const result = readExpensesPrototype(window.localStorage)
    setSnapshot({ state: result.state, isLoading: false, error: result.error })
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only available after hydration; the empty SSR snapshot is intentional.
    reload()
    const onStorage = (event: StorageEvent) => {
      if (event.key === EXPENSES_PROTOTYPE_STORAGE_KEY) reload()
    }
    window.addEventListener("storage", onStorage)
    window.addEventListener(EXPENSES_PROTOTYPE_EVENT, reload)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(EXPENSES_PROTOTYPE_EVENT, reload)
    }
  }, [reload])

  const update = useCallback(
    (mutate: (state: ExpensesPrototypeState) => ExpensesPrototypeState) => {
      const current = readExpensesPrototype(window.localStorage)
      const next = mutate(
        current.error ? createEmptyExpensesPrototypeState() : current.state,
      )
      try {
        writeExpensesPrototype(window.localStorage, next)
      } catch {
        setSnapshot((snapshot) => ({
          ...snapshot,
          isLoading: false,
          error: "EXPENSES_PROTOTYPE_WRITE_FAILED",
        }))
        throw new Error("EXPENSES_PROTOTYPE_WRITE_FAILED")
      }
      setSnapshot({ state: next, isLoading: false, error: null })
      notifyPrototypeChanged()
      return next
    },
    [],
  )

  const saveCategories = useCallback(
    (categories: ExpenseCategory[]) =>
      update((state) => ({
        ...state,
        enabled: true,
        activeCategories: [...new Set(categories)],
      })),
    [update],
  )

  const addManualExpense = useCallback(
    (input: ManualExpenseInput) => {
      const now = new Date().toISOString()
      const record: PrototypeExpenseRecord = {
        id: createPrototypeId("expense"),
        source: "manual",
        category: input.category,
        expenseDate: input.expenseDate,
        amount: normalizePlnForStorage(input.amount),
        paidPeriodFrom: input.paidPeriodFrom,
        paidPeriodTo: input.paidPeriodTo,
        createdAt: now,
        updatedAt: now,
      }
      update((state) => ({
        ...state,
        manualExpenses: [...state.manualExpenses, record],
      }))
      return record
    },
    [update],
  )

  const updateManualExpense = useCallback(
    (id: string, input: ManualExpenseInput) =>
      update((state) => ({
        ...state,
        manualExpenses: state.manualExpenses.map((record) =>
          record.id === id
            ? {
                ...record,
                ...input,
                amount: normalizePlnForStorage(input.amount),
                updatedAt: new Date().toISOString(),
              }
            : record,
        ),
      })),
    [update],
  )

  const deleteManualExpense = useCallback(
    (id: string) =>
      update((state) => ({
        ...state,
        manualExpenses: state.manualExpenses.filter(
          (record) => record.id !== id,
        ),
      })),
    [update],
  )

  return {
    ...snapshot,
    saveCategories,
    addManualExpense,
    updateManualExpense,
    deleteManualExpense,
  }
}
