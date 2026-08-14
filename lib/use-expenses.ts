"use client"

import { useCallback, useEffect, useState } from "react"

import type { ExpenseCategory } from "../docs/shared/types/expenses"
import type { Tables, TablesInsert } from "./database.types"
import {
  EXPENSE_CATEGORIES,
  createEmptyExpensesPrototypeState,
  normalizePlnForStorage,
  type ExpensesPrototypeState,
  type PrototypeExpenseRecord,
} from "./expenses-prototype"
import { supabase } from "./supabase"

export type ExpenseInput = {
  category: ExpenseCategory
  expenseDate: string
  amount: string
  paidPeriodFrom: string | null
  paidPeriodTo: string | null
}

type ExpensesSnapshot = {
  state: ExpensesPrototypeState
  isLoading: boolean
  error: string | null
}

const initialSnapshot: ExpensesSnapshot = {
  state: createEmptyExpensesPrototypeState(),
  isLoading: true,
  error: null,
}

function isExpenseCategory(value: string): value is ExpenseCategory {
  return EXPENSE_CATEGORIES.includes(value as ExpenseCategory)
}

function mapExpenseRow(row: Tables<"expenses">): PrototypeExpenseRecord {
  if (!isExpenseCategory(row.category)) {
    throw new Error("EXPENSES_INVALID_CATEGORY")
  }

  return {
    id: row.id,
    source: "manual",
    category: row.category,
    expenseDate: row.expense_date,
    amount: normalizePlnForStorage(String(row.amount)),
    paidPeriodFrom: row.paid_period_from,
    paidPeriodTo: row.paid_period_to,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function expensePayload(input: ExpenseInput) {
  const amount = normalizePlnForStorage(input.amount)
  return {
    amount,
    category: input.category,
    currency: "PLN",
    expense_date: input.expenseDate,
    paid_period_from: input.paidPeriodFrom,
    paid_period_to: input.paidPeriodTo,
  }
}

/**
 * Supabase's generated numeric columns are typed as number, while Expenses
 * sends the validated decimal text unchanged so no binary floating-point
 * conversion happens before PostgreSQL stores the numeric value.
 */
function asExpenseInsert(
  payload: ReturnType<typeof expensePayload> & { user_id: string },
): TablesInsert<"expenses"> {
  return payload as unknown as TablesInsert<"expenses">
}

export function useExpenses() {
  const [snapshot, setSnapshot] = useState<ExpensesSnapshot>(initialSnapshot)

  const reload = useCallback(async () => {
    setSnapshot((current) => ({ ...current, isLoading: true, error: null }))
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) throw new Error("EXPENSES_AUTH_REQUIRED")

      const [settingsResult, expensesResult] = await Promise.all([
        supabase
          .from("expense_settings")
          .select("enabled, active_categories")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("expenses")
          .select("*")
          .eq("user_id", user.id)
          .order("expense_date", { ascending: false })
          .order("created_at", { ascending: false }),
      ])

      if (settingsResult.error || expensesResult.error) {
        throw new Error("EXPENSES_READ_FAILED")
      }

      const activeCategories = (settingsResult.data?.active_categories ?? [])
        .filter((category): category is ExpenseCategory =>
          isExpenseCategory(category),
        )

      setSnapshot({
        state: {
          version: 2,
          enabled: settingsResult.data?.enabled ?? false,
          activeCategories: [...new Set(activeCategories)],
          manualExpenses: (expensesResult.data ?? []).map(mapExpenseRow),
        },
        isLoading: false,
        error: null,
      })
    } catch {
      setSnapshot((current) => ({
        state: current.state,
        isLoading: false,
        error: "EXPENSES_READ_FAILED",
      }))
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the authenticated remote snapshot is loaded after hydration.
    void reload()
    const { data } = supabase.auth.onAuthStateChange(() => {
      void reload()
    })
    return () => data.subscription.unsubscribe()
  }, [reload])

  const currentUserId = useCallback(async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) throw new Error("EXPENSES_AUTH_REQUIRED")
    return user.id
  }, [])

  const runMutation = useCallback(
    async (mutation: () => Promise<{ error: { message: string } | null }>) => {
      const result = await mutation()
      if (result.error) {
        setSnapshot((current) => ({
          ...current,
          isLoading: false,
          error: "EXPENSES_WRITE_FAILED",
        }))
        throw new Error("EXPENSES_WRITE_FAILED")
      }
      await reload()
    },
    [reload],
  )

  const saveCategories = useCallback(
    async (categories: ExpenseCategory[]) => {
      const userId = await currentUserId()
      await runMutation(async () => {
        const { error } = await supabase.from("expense_settings").upsert(
          {
            user_id: userId,
            enabled: true,
            active_categories: [...new Set(categories)],
          },
          { onConflict: "user_id" },
        )
        return { error }
      })
    },
    [currentUserId, runMutation],
  )

  const addManualExpense = useCallback(
    async (input: ExpenseInput) => {
      const userId = await currentUserId()
      await runMutation(async () => {
        const { error } = await supabase
          .from("expenses")
          .insert(asExpenseInsert({ ...expensePayload(input), user_id: userId }))
        return { error }
      })
    },
    [currentUserId, runMutation],
  )

  const updateManualExpense = useCallback(
    async (id: string, input: ExpenseInput) => {
      const userId = await currentUserId()
      await runMutation(async () => {
        const { error } = await supabase
          .from("expenses")
          .update(
            expensePayload(input) as unknown as TablesInsert<"expenses">,
          )
          .eq("id", id)
          .eq("user_id", userId)
        return { error }
      })
    },
    [currentUserId, runMutation],
  )

  const deleteManualExpense = useCallback(
    async (id: string) => {
      const userId = await currentUserId()
      await runMutation(async () => {
        const { error } = await supabase
          .from("expenses")
          .delete()
          .eq("id", id)
          .eq("user_id", userId)
        return { error }
      })
    },
    [currentUserId, runMutation],
  )

  return {
    ...snapshot,
    reload,
    saveCategories,
    addManualExpense,
    updateManualExpense,
    deleteManualExpense,
  }
}
