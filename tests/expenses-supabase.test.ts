import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8")
}

describe("Expenses Staging Supabase integration", () => {
  const migration = source(
    "supabase/migrations/202608130001_create_expenses_schema.sql",
  )
  const amountLimitMigration = source(
    "supabase/migrations/202608140001_limit_expenses_amount.sql",
  )
  const hook = source("lib/use-expenses.ts")
  const generatedTypes = source("lib/database.types.ts")

  it("defines owner-scoped settings and expense tables with RLS", () => {
    expect(migration).toContain("create table public.expense_settings")
    expect(migration).toContain("create table public.expenses")
    expect(migration).toContain(
      "alter table public.expense_settings enable row level security",
    )
    expect(migration).toContain(
      "alter table public.expenses enable row level security",
    )
    expect(migration.match(/auth\.uid\(\) = user_id/g)).toHaveLength(10)
    expect(migration).toContain("from anon, authenticated, service_role")
  })

  it("enforces the approved PLN, category, date, and rental invariants", () => {
    expect(migration).toContain("amount > 0")
    expect(migration).toContain("amount = round(amount, 2)")
    expect(migration).toContain("check (currency = 'PLN')")
    expect(migration).toContain("paid_period_to >= paid_period_from")
    expect(migration).toContain("expenses_user_expense_date_idx")
    expect(migration).toContain("expenses_user_category_expense_date_idx")
  })

  it("adds the maximum amount as a forward-only validated constraint", () => {
    expect(amountLimitMigration).toContain("amount <= 999999.99")
    expect(amountLimitMigration).toContain("not valid")
    expect(amountLimitMigration).toContain(
      "validate constraint expenses_amount_max_check",
    )
    expect(amountLimitMigration).not.toMatch(/\b(update|delete|insert)\b/i)
    expect(amountLimitMigration).not.toContain("expense_settings")
  })

  it("uses Supabase as the runtime source without importing local prototype data", () => {
    expect(hook).toContain('.from("expense_settings")')
    expect(hook).toContain('.from("expenses")')
    expect(hook).toContain("supabase.auth.getUser()")
    expect(hook).toContain(".upsert(")
    expect(hook).toContain(".insert(")
    expect(hook).toContain(".update(")
    expect(hook).toContain(".delete()")
    expect(hook).not.toContain("localStorage")
    expect(hook).not.toContain("readExpensesPrototype")
    expect(hook).not.toContain("EXPENSES_PROTOTYPE_STORAGE_KEY")
  })

  it("keeps generated Staging types for both new tables", () => {
    expect(generatedTypes).toContain("expense_settings: {")
    expect(generatedTypes).toContain("expenses: {")
    expect(generatedTypes).toContain("paid_period_from: string | null")
    expect(generatedTypes).toContain("paid_period_to: string | null")
  })
})
