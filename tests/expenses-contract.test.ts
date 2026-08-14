import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

import manifest from "../docs/shared/contract-manifest.json"
import expenseCases from "../docs/shared/fixtures/expense-calculations.json"
import {
  EXPENSES_CONTRACT_STATUS,
  EXPENSES_CONTRACT_VERSION,
  EXPENSES_CURRENCY,
  EXPENSE_CATEGORIES,
  EXPENSE_MAX_AMOUNT,
  EXPENSE_MIN_AMOUNT,
  MANUAL_EXPENSE_CATEGORIES,
} from "../docs/shared/types/expenses"
import {
  calculateExpensesForRange,
  createEmptyExpensesPrototypeState,
  isPositivePlnInput,
} from "../lib/expenses-prototype"
import { calculateAfterExpensesIncome } from "../lib/after-expenses"

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8")
}

function indexedBlob(path: string): Buffer {
  return execFileSync("git", ["show", `:${path}`], {
    cwd: process.cwd(),
    encoding: "buffer",
  })
}

describe("Expenses production-ready shared contract", () => {
  it("defines the owner-approved PLN vocabulary and all five manual categories", () => {
    expect(EXPENSES_CONTRACT_VERSION).toBe("0.3.0-draft")
    expect(EXPENSES_CONTRACT_STATUS).toBe(
      "owner_approved_web_implemented_staging_verified",
    )
    expect(EXPENSES_CURRENCY).toBe("PLN")
    expect(EXPENSE_CATEGORIES).toEqual([
      "fuel",
      "rental",
      "maintenance",
      "repair",
      "food_on_shift",
    ])
    expect(MANUAL_EXPENSE_CATEGORIES).toEqual(EXPENSE_CATEGORIES)
  })

  it("enforces exact amount boundaries without binary floating point", () => {
    expect(EXPENSE_MIN_AMOUNT).toBe("0.01")
    expect(EXPENSE_MAX_AMOUNT).toBe("999999.99")
    expect(isPositivePlnInput("0.00")).toBe(false)
    expect(isPositivePlnInput("0.01")).toBe(true)
    expect(isPositivePlnInput("999999.99")).toBe(true)
    expect(isPositivePlnInput("1000000.00")).toBe(false)
    expect(isPositivePlnInput("1.001")).toBe(false)
  })

  it("counts a rental payment only in the month of its payment date", () => {
    const state = createEmptyExpensesPrototypeState()
    state.manualExpenses = [
      {
        id: "fixture-rental",
        source: "manual",
        category: "rental",
        expenseDate: "2026-08-28",
        amount: "700.00",
        paidPeriodFrom: "2026-08-28",
        paidPeriodTo: "2026-09-03",
        createdAt: "2026-08-28T10:00:00.000Z",
        updatedAt: "2026-08-28T10:00:00.000Z",
      },
    ]

    expect(
      calculateExpensesForRange(state, "2026-08-01", "2026-08-31").total,
    ).toBe("700.00")
    expect(
      calculateExpensesForRange(state, "2026-09-01", "2026-09-30").total,
    ).toBe("0.00")
  })

  it("preserves the approved BRUTTO and NETTO formulas", () => {
    expect(
      calculateAfterExpensesIncome({
        expensesTotal: "800.00",
        grossIncome: "5000.00",
        mode: "brutto",
        netIncome: "4400.00",
      }),
    ).toBe("4200.00")
    expect(
      calculateAfterExpensesIncome({
        expensesTotal: "800.00",
        grossIncome: "5000.00",
        mode: "netto",
        netIncome: "4400.00",
      }),
    ).toBe("3600.00")
    expect(
      calculateAfterExpensesIncome({
        expensesTotal: "800.00",
        grossIncome: "5000.00",
        mode: "netto",
        netIncome: null,
      }),
    ).toBeNull()
  })

  it("keeps current fixtures free of the removed source/proration model", () => {
    expect(expenseCases.status).toBe("verified")
    expect(expenseCases.cases).toHaveLength(6)
    const serialized = JSON.stringify(expenseCases)
    expect(serialized).not.toContain("rental_period")
    expect(serialized).not.toContain("weeklyAmount")
    expect(serialized).not.toContain("idempotencyKey")
    expect(serialized).not.toContain('"source":"garage"')
    expect(serialized).toContain("rental-payment-month-attribution")
    expect(serialized).toContain("expense-read-failure-is-unavailable")
  })

  it("documents Garage as deferred and removes old incomplete markers", () => {
    const contract = source("docs/shared/EXPENSES_CONTRACT.md")
    const page = source("app/expenses/page.tsx")
    const workSummary = source(
      "app/work/components/ExpensesMonthSummary.tsx",
    )
    const translations = source("lib/expenses-translations.ts")

    expect(contract).toContain("Garage integration: deferred")
    expect(contract).not.toContain("weekly amount")
    expect(contract).not.toContain("rental_period")
    expect(page).not.toContain("hasGarageGap")
    expect(workSummary).not.toContain("garageIncomplete")
    expect(translations).not.toContain("partialGarage")
    expect(page).toContain("expensesComplete={!prototype.error}")
    expect(workSummary).toContain("expensesComplete={!expensesReadFailed}")
  })

  it("matches manifest hashes to canonical staged Git blobs", () => {
    const requiredPaths = [
      "docs/shared/SHARED_ARCHITECTURE.md",
      "docs/shared/SCHEMA_POLICY.md",
      "docs/shared/API_CONTRACT.md",
      "docs/shared/BUSINESS_RULES.md",
      "docs/shared/EXPENSES_CONTRACT.md",
      "docs/shared/types/expenses.ts",
      "docs/shared/COMPATIBILITY_POLICY.md",
      "docs/shared/CHANGELOG.md",
      "docs/shared/fixtures/expense-calculations.json",
      "supabase/migrations/202608130001_create_expenses_schema.sql",
      "supabase/migrations/202608140001_limit_expenses_amount.sql",
      "docs/MOBILE_INTEGRATION.md",
    ]

    for (const path of requiredPaths) {
      const artifact = manifest.artifacts.find((entry) => entry.path === path)
      expect(artifact, path).toBeDefined()
      expect(
        createHash("sha256").update(indexedBlob(path)).digest("hex"),
        path,
      ).toBe(artifact?.sha256)
    }
  })
})
