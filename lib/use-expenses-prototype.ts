"use client"

import { useCallback, useEffect, useState } from "react"

import type {
  ExpenseCategory,
  ManualExpenseCategory,
} from "../docs/shared/types/expenses"
import {
  EXPENSES_PROTOTYPE_EVENT,
  EXPENSES_PROTOTYPE_STORAGE_KEY,
  addCalendarDays,
  createEmptyExpensesPrototypeState,
  createPrototypeId,
  hasOverlappingRentalPeriods,
  normalizePlnForStorage,
  readExpensesPrototype,
  writeExpensesPrototype,
  type ExpensesPrototypeState,
  type PrototypeManualExpense,
  type PrototypeRentalPeriod,
} from "./expenses-prototype"

type ManualExpenseInput = {
  category: ManualExpenseCategory
  expenseDate: string
  amount: string
}

type RentalPeriodInput = {
  weeklyAmount: string
  validFrom: string
  validTo: string | null
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
      const record: PrototypeManualExpense = {
        id: createPrototypeId("manual"),
        source: "manual",
        category: input.category,
        expenseDate: input.expenseDate,
        amount: normalizePlnForStorage(input.amount),
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

  const createRentalPeriod = useCallback(
    (input: RentalPeriodInput) => {
      const now = new Date().toISOString()
      const record: PrototypeRentalPeriod = {
        id: createPrototypeId("rental"),
        source: "rental_period",
        weeklyAmount: normalizePlnForStorage(input.weeklyAmount),
        validFrom: input.validFrom,
        validTo: input.validTo,
        createdAt: now,
        updatedAt: now,
      }
      update((state) => {
        const rentalPeriods = [...state.rentalPeriods, record]
        if (hasOverlappingRentalPeriods(rentalPeriods)) {
          throw new Error("RENTAL_OVERLAP")
        }
        return { ...state, rentalPeriods }
      })
      return record
    },
    [update],
  )

  const changeRentalRate = useCallback(
    (currentId: string, replacement: Omit<RentalPeriodInput, "validTo">) =>
      update((state) => {
        const current = state.rentalPeriods.find(
          (period) => period.id === currentId,
        )
        if (!current || replacement.validFrom <= current.validFrom) {
          throw new Error("INVALID_RENTAL_CHANGE_DATE")
        }
        const now = new Date().toISOString()
        const rentalPeriods = state.rentalPeriods.map((period) =>
          period.id === currentId
            ? {
                ...period,
                validTo: addCalendarDays(replacement.validFrom, -1),
                updatedAt: now,
              }
            : period,
        )
        rentalPeriods.push({
          id: createPrototypeId("rental"),
          source: "rental_period",
          weeklyAmount: normalizePlnForStorage(replacement.weeklyAmount),
          validFrom: replacement.validFrom,
          validTo: null,
          createdAt: now,
          updatedAt: now,
        })
        if (hasOverlappingRentalPeriods(rentalPeriods)) {
          throw new Error("RENTAL_OVERLAP")
        }
        return { ...state, rentalPeriods }
      }),
    [update],
  )

  const correctRentalPeriod = useCallback(
    (id: string, input: RentalPeriodInput) =>
      update((state) => {
        const rentalPeriods = state.rentalPeriods.map((period) =>
          period.id === id
            ? {
                ...period,
                weeklyAmount: normalizePlnForStorage(input.weeklyAmount),
                validFrom: input.validFrom,
                validTo: input.validTo,
                updatedAt: new Date().toISOString(),
              }
            : period,
        )
        if (hasOverlappingRentalPeriods(rentalPeriods)) {
          throw new Error("RENTAL_OVERLAP")
        }
        return { ...state, rentalPeriods }
      }),
    [update],
  )

  return {
    ...snapshot,
    saveCategories,
    addManualExpense,
    updateManualExpense,
    deleteManualExpense,
    createRentalPeriod,
    changeRentalRate,
    correctRentalPeriod,
  }
}
